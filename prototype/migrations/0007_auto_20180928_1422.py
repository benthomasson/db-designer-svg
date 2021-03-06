# Generated by Django 2.0.8 on 2018-09-28 14:22

from django.db import migrations

import yaml

messages = yaml.load('''
messages:
    - {msg_type: TableMove, fields: [msg_type, sender, id, x, y, previous_x, previous_y]}
    - {msg_type: TableCreate, fields: [msg_type, sender, id, x, y, name, type]}
    - {msg_type: TableDestroy, fields: [msg_type, sender, id, previous_x, previous_y, previous_name, previous_type]}
    - {msg_type: TableLabelEdit, fields: [msg_type, sender, id, name, previous_name]}
    - {msg_type: TableSelected, fields: [msg_type, sender, id]}
    - {msg_type: TableUnSelected, fields: [msg_type, sender, id]}
    - {msg_type: ColumnCreate, fields: [msg_type, sender, id, table_id, name, type]}
    - {msg_type: ColumnDestroy, fields: [msg_type, sender, id, table_id, previous_name, previous_type]}
    - {msg_type: ColumnLabelEdit, fields: [msg_type, sender, table_id, id, name, previous_name]}
    - {msg_type: RelationCreate, fields: [msg_type, sender, id, from_table_id, from_column_id, to_table_id, to_column_id]}
    - {msg_type: RelationDestroy, fields: [msg_type, sender, id, from_table_id, from_column_id, to_table_id, to_column_id]}
    - {msg_type: RelationSelected, fields: [msg_type, sender, id]}
    - {msg_type: RelationUnSelected, fields: [msg_type, sender, id]}
    - {msg_type: MultipleMessage, fields: [msg_type, sender, messages]}
    - {msg_type: Undo, fields: [msg_type, sender, original_message]}
    - {msg_type: Redo, fields: [msg_type, sender, original_message]}
    - {msg_type: FSMTrace, fields: [msg_type, order, sender, trace_id, fsm_name, from_state, to_state, recv_message_type]}
    - {msg_type: ChannelTrace, fields: [msg_type, sender, trace_id, from_fsm, to_fsm, sent_message_type]}
''')


def populate_message_types(apps, schema_editor):

    MessageType = apps.get_model('prototype', 'MessageType')
    for message in messages['messages']:
        MessageType.objects.get_or_create(name=message['msg_type'])

class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0006_auto_20180913_2323'),
    ]

    operations = [
        migrations.RunPython(
            code=populate_message_types,
        ),
    ]
