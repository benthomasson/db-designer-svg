from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Database, Table, Column, Relation, Client, DatabaseHistory, MessageType
from django.db.models import Q
import uuid
import json
import urllib.parse
import logging
import traceback
from pprint import pformat, pprint

HISTORY_MESSAGE_IGNORE_TYPES = ['TableSelected', 'TableUnSelected', 'Undo', 'Redo']

logger = logging.getLogger("prototype.consumers")


class ConsumerException(Exception):
    pass


class DBDesignerConsumer(AsyncWebsocketConsumer):

    async def send_json(self, message_data):
        #print("sending", pformat(message_data))
        await self.send(text_data=json.dumps(message_data))

    async def connect(self, event=None):
        #print("connected")
        await self.accept()
        #print("accepted")
        self.message_types = await self.get_message_types()
        self.ignore_message_types = ['TableSelected',
                                     'TableUnSelected',
                                     'RelationSelected',
                                     'RelationUnSelected',
                                     'StartRecording',
                                     'StopRecording',
                                     'CoverageRequest',
                                     'Undo',
                                     'Redo']
        #pprint(["message_types", self.message_types])
        self.client_id = 0
        await self.create_client()
        await self.send(text_data=json.dumps(['id', self.client.pk]))
        database_data = await self.get_or_create_database()
        await self.send(text_data=json.dumps(['Database', database_data]))
        snapshot = await self.send_snapshot()
        await self.send_json(["Snapshot", snapshot])
        history = await self.send_history()
        await self.send_json(["History", history])

    async def disconnect(self, close_code):
        pass

    @database_sync_to_async
    def get_message_types(self):
        return dict(MessageType.objects.all().values_list('name', 'pk'))

    @database_sync_to_async
    def create_client(self):
        self.client = Client()
        self.client.save()
        self.client_id = self.client.pk

    @database_sync_to_async
    def get_or_create_database(self):
        qs_data = urllib.parse.parse_qs(self.scope['query_string'])
        print("qs_data: " + str(urllib.parse.parse_qs(self.scope['query_string'])))
        database_uuid = qs_data.get(b'database_id', [b'xxxx'])[0].decode()
        print(database_uuid, Database.objects.filter(uuid=database_uuid).values())
        database, created = Database.objects.get_or_create(
            uuid=database_uuid, defaults=dict(name="database", scale=1.0, panX=0, panY=0, uuid=str(uuid.uuid4())))
        print(database.uuid)
        self.database_id = database.database_id
        #print(self.database_id, created, database.uuid)
        database_data = database.__dict__.copy()
        if '_state' in database_data:
            database_data['database_id'] = database_data['uuid']
            del database_data['_state']
        return database_data

    @database_sync_to_async
    def send_snapshot(self):
        tables = list(Table.objects
                      .filter(database_id=self.database_id).values())
        columns = list(Column.objects
                       .filter(table__database_id=self.database_id).values('id',
                                                                           'name',
                                                                           'type',
                                                                           'table__id').order_by('id'))
        relations = [dict(from_column=x['from_column__id'],
                          to_column=x['to_column__id'],
                          from_table=x['from_column__table__id'],
                          to_table=x['to_column__table__id'],
                          id=x['id']) for x in list(Relation.objects
                                                            .filter(Q(from_column__table__database_id=self.database_id) |
                                                                    Q(to_column__table__database_id=self.database_id))
                                                            .values('id',
                                                                    'from_column__id',
                                                                    'to_column__id',
                                                                    'from_column__table__id',
                                                                    'to_column__table__id'))]
        return dict(sender=0,
                    tables=tables,
                    columns=columns,
                    relations=relations)

    @database_sync_to_async
    def send_history(self):
        return list(DatabaseHistory.objects
                                   .filter(database_id=self.database_id)
                                   .exclude(message_type__name__in=HISTORY_MESSAGE_IGNORE_TYPES)
                                   .exclude(undone=True)
                                   .order_by('pk')
                                   .values_list('message_data', flat=True)[:1000])

    async def receive(self, text_data):
        #print(["received: ", pformat(text_data)])
        # pprint(json.loads(text_data))
        data = json.loads(text_data)
        if isinstance(data[1], list):
            logger.error("no sender")
            return
        if isinstance(data[1], dict) and self.client_id != data[1].get('sender'):
            logger.error("client_id mismatch expected: %s actual %s", self.client_id, data[1].get('sender'))
            logger.error(pformat(data))
            return
        message_type = data[0]
        message_value = data[1]

        #pprint(message_type)
        #pprint(message_value)

        if message_type not in self.message_types:
            logger.warning("Unsupported message %s: no message type", message_type)
            return

        if message_type in self.ignore_message_types:
            return

        DatabaseHistory(database_id=self.database_id,
                        client_id=self.client_id,
                        message_type_id=self.message_types[message_type],
                        message_id=data[1].get('message_id', 0),
                        message_data=text_data).save()

        handler = self.get_handler(message_type)

        if handler is not None:
            try:
                await handler(message_value, self.database_id, self.client_id)
                logger.info(message_type)
            except ConsumerException as e:
                # Group("client-%s" % client_id).send({"text": json.dumps(["Error", str(e)])})
                logger.error(traceback.format_exc())
            except Exception as e:
                # Group("client-%s" % client_id).send({"text": json.dumps(["Error", "Server Error"])})
                logger.error(traceback.format_exc())
            except BaseException as e:
                # Group("client-%s" % client_id).send({"text": json.dumps(["Error", "Server Error"])})
                logger.error(traceback.format_exc())
        else:
            logger.warning("Unsupported message %s: no handler", message_type)

    def get_handler(self, message_type):
        return getattr(self, "on{0}".format(message_type), None)

    async def onMultipleMessage(self, message_value, topology_id, client_id):
        for message in message_value['messages']:
            message_type = message['msg_type']
            if message_type not in self.message_types:
                logger.warning("Unsupported message %s: no message type", message_type)
                return

            if message_type in self.ignore_message_types:
                return
            handler = self.get_handler(message_type)
            if handler is not None:
                await handler(message, topology_id, client_id)
                logger.info(message_type)
            else:
                logger.warning("Unsupported message %s: no handler", message_type)

    @database_sync_to_async
    def onSnapshot(self, snapshot, database_id, client_id):
        table_map = dict()
        logger.debug("snapshot %s", pformat(snapshot))
        # not implemented

    @database_sync_to_async
    def onTableCreate(self, table, database_id, client_id):
        if 'sender' in table:
            del table['sender']
        if 'message_id' in table:
            del table['message_id']
        if 'msg_type' in table:
            del table['msg_type']
        d, _ = Table.objects.get_or_create(database_id=database_id, id=table['id'], defaults=table)
        d.x = table['x']
        d.y = table['y']
        d.save()
        Database.objects.filter(database_id=database_id).update(table_id_seq=table['id'])

    @database_sync_to_async
    def onTableDestroy(self, table, database_id, client_id):
        Table.objects.filter(database_id=database_id, id=table['id']).delete()

    @database_sync_to_async
    def onTableMove(self, table, database_id, client_id):
        Table.objects.filter(database_id=database_id, id=table['id']).update(x=table['x'], y=table['y'])

    @database_sync_to_async
    def onTableLabelEdit(self, table, database_id, client_id):
        Table.objects.filter(database_id=database_id, id=table['id']).update(name=table['name'])

    @database_sync_to_async
    def onColumnCreate(self, column, database_id, client_id):
        if 'sender' in column:
            del column['sender']
        if 'message_id' in column:
            del column['message_id']
        t = Table.objects.get(database_id=database_id, id=column['table_id'])
        if 'table_id' in column:
            del column['table_id']
        if 'msg_type' in column:
            del column['msg_type']
        Column.objects.get_or_create(table=t,
                                     id=column['id'],
                                     defaults=column)
        t.column_id_seq = column['id']
        t.save()


    @database_sync_to_async
    def onColumnDestroy(self, column, database_id, client_id):
        t = Table.objects.get(database_id=database_id, id=column['table_id'])
        Column.objects.filter(table=t, id=column['id']).delete()

    @database_sync_to_async
    def onColumnLabelEdit(self, column, database_id, client_id):
        t = Table.objects.filter(database_id=database_id, id=column['table_id']).values_list('pk', flat=True)[0]
        Column.objects.filter(table_id=t, id=column['id']).update(name=column['name'])

    @database_sync_to_async
    def onRelationCreate(self, relation, database_id, client_id):
        if 'sender' in relation:
            del relation['sender']
        if 'message_id' in relation:
            del relation['message_id']
        table_map = dict(Table.objects
                         .filter(database_id=database_id, id__in=[relation['from_table_id'], relation['to_table_id']])
                         .values_list('id', 'pk'))
        from_column = Column.objects.get(table_id=table_map[relation['from_table_id']], id=relation['from_column_id'])
        to_column = Column.objects.get(table_id=table_map[relation['to_table_id']], id=relation['to_column_id'])
        Relation.objects.get_or_create(id=relation['id'], from_column=from_column, to_column=to_column)

    @database_sync_to_async
    def onRelationDestroy(self, relation, database_id, client_id):
        table_map = dict(Table.objects
                         .filter(database_id=database_id, id__in=[relation['from_table_id'], relation['to_table_id']])
                         .values_list('id', 'pk'))
        from_column = Column.objects.get(table_id=table_map[relation['from_table_id']], id=relation['from_column_id'])
        to_column = Column.objects.get(table_id=table_map[relation['to_table_id']], id=relation['to_column_id'])
        Relation.objects.filter(id=relation['id'], from_column=from_column, to_column=to_column).delete()
