# In consumers.py
from channels import Group, Channel
from channels.sessions import channel_session
from prototype.models import Database, Table, Column, Relation, Client, DatabaseHistory, MessageType
import urlparse
from django.db.models import Q

import json
# Connected to websocket.connect


@channel_session
def ws_connect(message):
    # Accept connection
    message.reply_channel.send({"accept": True})
    data = urlparse.parse_qs(message.content['query_string'])
    database_id = data.get('database_id', ['null'])
    try:
        database_id = int(database_id[0])
    except ValueError:
        database_id = None
    if not database_id:
        database_id = None
    database, created = Database.objects.get_or_create(
        database_id=database_id, defaults=dict(name="database", scale=1.0, panX=0, panY=0))
    database_id = database.database_id
    message.channel_session['database_id'] = database_id
    Group("database-%s" % database_id).add(message.reply_channel)
    client = Client()
    client.save()
    message.channel_session['client_id'] = client.pk
    message.reply_channel.send({"text": json.dumps(["id", client.pk])})
    message.reply_channel.send({"text": json.dumps(["database_id", database_id])})
    database_data = database.__dict__.copy()
    if '_state' in database_data:
        del database_data['_state']
    message.reply_channel.send({"text": json.dumps(["Database", database_data])})
    tables = list(Table.objects
                  .filter(database_id=database_id).values())
    columns = list(Column.objects
                   .filter(table__database_id=database_id).values('id',
                                                                  'name',
                                                                  'type',
                                                                  'table__id').order_by('id'))
    relations = [dict(from_column=x['from_column__id'],
                      to_column=x['to_column__id']) for x in list(Relation.objects
                                                                  .filter(Q(from_column__table__database_id=database_id) |
                                                                          Q(to_column__table__database_id=database_id))
                                                                  .values('from_column__id', 'to_column__id'))]
    snapshot = dict(sender=0,
                    tables=tables,
                    columns=columns,
                    relations=relations)
    message.reply_channel.send({"text": json.dumps(["Snapshot", snapshot])})
    history_message_ignore_types = ['TableSelected', 'TableUnSelected', 'Undo', 'Redo']
    history = list(DatabaseHistory.objects
                                  .filter(database_id=database_id)
                                  .exclude(message_type__name__in=history_message_ignore_types)
                                  .exclude(undone=True)
                                  .order_by('pk')
                                  .values_list('message_data', flat=True)[:1000])
    #message.reply_channel.send({"text": json.dumps(["History", history])})


@channel_session
def ws_message(message):
    # Send to debug printer
    Channel('console_printer').send({"text": message['text']})
    # Send to all clients editing the database
    Group("database-%s" % message.channel_session['database_id']).send({
        "text": message['text'],
    })
    # Send to persistence worker
    Channel('persistence').send(
        {"text": message['text'],
         "database": message.channel_session['database_id'],
         "client": message.channel_session['client_id']})


@channel_session
def ws_disconnect(message):
    Group("database-%s" % message.channel_session['database_id']).discard(message.reply_channel)


def console_printer(message):
    print message['text']


class _Persistence(object):

    def get_handler(self, message_type):
        return getattr(self, "on{0}".format(message_type), None)

    def handle(self, message):
        database_id = message.get('database')
        if database_id is None:
            print "No database_id"
            return
        client_id = message.get('client')
        if client_id is None:
            print "No client_id"
            return
        data = json.loads(message['text'])
        if client_id != data[1].get('sender'):
            print "client_id mismatch expected:", client_id, "actual:", data[1].get('sender')
            return
        message_type = data[0]
        message_value = data[1]
        message_type_id = MessageType.objects.get_or_create(name=message_type)[0].pk
        DatabaseHistory(database_id=database_id,
                        client_id=client_id,
                        message_type_id=message_type_id,
                        message_id=data[1].get('message_id', 0),
                        message_data=message['text']).save()
        handler = self.get_handler(message_type)
        if handler is not None:
            handler(message_value, database_id, client_id)
        else:
            print "Unsupported message ", message_type

    def onSnapshot(self, snapshot, database_id, client_id):
        table_map = dict()
        for table in snapshot['tables']:
            if 'size' in table:
                del table['size']
            if 'height' in table:
                del table['height']
            if 'width' in table:
                del table['width']
            d, _ = Table.objects.get_or_create(database_id=database_id, id=table['id'], defaults=table)
            d.name = table['name']
            d.x = table['x']
            d.y = table['y']
            d.save()
            table_map[table['id']] = d

        for relation in snapshot['relations']:
            Relation.objects.get_or_create(from_column=table_map[relation['from_column']],
                                           to_column=table_map[relation['to_column']])

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

    def onTableDestroy(self, table, database_id, client_id):
        Table.objects.filter(database_id=database_id, id=table['id']).delete()

    def onTableMove(self, table, database_id, client_id):
        Table.objects.filter(database_id=database_id, id=table['id']).update(x=table['x'], y=table['y'])

    def onTableLabelEdit(self, table, database_id, client_id):
        Table.objects.filter(database_id=database_id, id=table['id']).update(name=table['name'])

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

    def onColumnLabelEdit(self, column, database_id, client_id):
        t = Table.objects.filter(database_id=database_id, id=column['table_id'])
        Column.objects.filter(table=t, id=column['id']).update(name=column['name'])

    def onRelationCreate(self, relation, database_id, client_id):
        if 'sender' in relation:
            del relation['sender']
        if 'message_id' in relation:
            del relation['message_id']
        table_map = dict(Table.objects
                         .filter(database_id=database_id, id__in=[relation['from_id'], relation['to_id']])
                         .values_list('id', 'pk'))
        Relation.objects.get_or_create(from_column_id=table_map[relation['from_id']], to_column_id=table_map[relation['to_id']])

    def onRelationDestroy(self, relation, database_id, client_id):
        table_map = dict(Table.objects
                         .filter(database_id=database_id, id__in=[relation['from_id'], relation['to_id']])
                         .values_list('id', 'pk'))
        Relation.objects.filter(from_column_id=table_map[relation['from_id']],
                                to_column_id=table_map[relation['to_id']]).delete()

    def onTableSelected(self, message_value, database_id, client_id):
        'Ignore TableSelected messages'
        pass

    def onTableUnSelected(self, message_value, database_id, client_id):
        'Ignore TableSelected messages'
        pass

    def onUndo(self, message_value, database_id, client_id):
        undo_persistence.handle(message_value['original_message'], database_id, client_id)

    def onRedo(self, message_value, database_id, client_id):
        redo_persistence.handle(message_value['original_message'], database_id, client_id)

    def onMultipleMessage(self, message_value, topology_id, client_id):
        for message in message_value['messages']:
            handler = self.get_handler(message['msg_type'])
            if handler is not None:
                handler(message, topology_id, client_id)
            else:
                print "Unsupported message ", message['msg_type']


persistence = _Persistence()


class _UndoPersistence(object):

    def handle(self, message, database_id, client_id):
        message_type = message[0]
        message_value = message[1]
        DatabaseHistory.objects.filter(database_id=database_id,
                                       client_id=message_value['sender'],
                                       message_id=message_value['message_id']).update(undone=True)
        handler = getattr(self, "on{0}".format(message_type), None)
        if handler is not None:
            handler(message_value, database_id, client_id)
        else:
            print "Unsupported undo message ", message_type

    def onSnapshot(self, snapshot, database_id, client_id):
        pass

    def onTableCreate(self, table, database_id, client_id):
        persistence.onTableDestroy(table, database_id, client_id)

    def onTableDestroy(self, table, database_id, client_id):
        inverted = table.copy()
        inverted['name'] = table['previous_name']
        inverted['x'] = table['previous_x']
        inverted['y'] = table['previous_y']
        persistence.onTableCreate(inverted, database_id, client_id)

    def onTableMove(self, table, database_id, client_id):
        inverted = table.copy()
        inverted['x'] = table['previous_x']
        inverted['y'] = table['previous_y']
        persistence.onTableMove(inverted, database_id, client_id)

    def onTableLabelEdit(self, table, database_id, client_id):
        inverted = table.copy()
        inverted['name'] = table['previous_name']
        persistence.onTableLabelEdit(inverted, database_id, client_id)

    def onRelationCreate(self, relation, database_id, client_id):
        persistence.onRelationDestroy(relation, database_id, client_id)

    def onRelationDestroy(self, relation, database_id, client_id):
        persistence.onRelationCreate(relation, database_id, client_id)

    def onTableSelected(self, message_value, database_id, client_id):
        'Ignore TableSelected messages'
        pass

    def onTableUnSelected(self, message_value, database_id, client_id):
        'Ignore TableSelected messages'
        pass

    def onUndo(self, message_value, database_id, client_id):
        pass


undo_persistence = _UndoPersistence()


class _RedoPersistence(object):

    def handle(self, message, database_id, client_id):
        message_type = message[0]
        message_value = message[1]
        DatabaseHistory.objects.filter(database_id=database_id,
                                       client_id=message_value['sender'],
                                       message_id=message_value['message_id']).update(undone=False)
        handler_name = "on{0}".format(message_type)
        handler = getattr(self, handler_name, getattr(persistence, handler_name, None))
        if handler is not None:
            handler(message_value, database_id, client_id)
        else:
            print "Unsupported redo message ", message_type

    def onTableSelected(self, message_value, database_id, client_id):
        'Ignore TableSelected messages'
        pass

    def onTableUnSelected(self, message_value, database_id, client_id):
        'Ignore TableSelected messages'
        pass

    def onUndo(self, message_value, database_id, client_id):
        'Ignore Undo messages'
        pass

    def onRedo(self, message_value, database_id, client_id):
        'Ignore Redo messages'
        pass


redo_persistence = _RedoPersistence()
