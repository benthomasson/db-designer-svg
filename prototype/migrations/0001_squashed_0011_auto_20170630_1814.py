# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    replaces = [('prototype', '0001_initial'), ('prototype', '0002_remove_topology_id'), ('prototype', '0003_device_type'), ('prototype', '0004_client_messagetype_topologyhistory'), ('prototype', '0005_topologyhistory_undone'), ('prototype', '0006_auto_20170321_1236'), ('prototype', '0007_auto_20170627_1903'), ('prototype', '0008_auto_20170627_2017'), ('prototype', '0009_auto_20170628_1913'), ('prototype', '0010_auto_20170628_1922'), ('prototype', '0011_auto_20170630_1814')]

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('client_id', models.AutoField(serialize=False, primary_key=True)),
            ],
        ),
        migrations.CreateModel(
            name='MessageType',
            fields=[
                ('message_type_id', models.AutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Column',
            fields=[
                ('column_id', models.AutoField(serialize=False, primary_key=True)),
                ('id', models.IntegerField()),
                ('name', models.CharField(max_length=200)),
                ('type', models.CharField(max_length=200)),
                ('is_pk', models.BooleanField(default=False)),
                ('is_unique', models.BooleanField(default=False)),
                ('has_default', models.BooleanField(default=False)),
                ('default_value', models.TextField()),
                ('is_indexed', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Database',
            fields=[
                ('database_id', models.AutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('scale', models.FloatField()),
                ('panX', models.FloatField()),
                ('panY', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='DatabaseHistory',
            fields=[
                ('database_history_id', models.AutoField(serialize=False, primary_key=True)),
                ('message_id', models.IntegerField()),
                ('message_data', models.TextField()),
                ('undone', models.BooleanField(default=False)),
                ('client', models.ForeignKey(to='prototype.Client')),
                ('message_type', models.ForeignKey(to='prototype.MessageType')),
                ('database', models.ForeignKey(to='prototype.Database')),
            ],
        ),
        migrations.CreateModel(
            name='Relation',
            fields=[
                ('relation_id', models.AutoField(serialize=False, primary_key=True)),
                ('from_column', models.ForeignKey(related_name='+', to='prototype.Column')),
                ('to_column', models.ForeignKey(related_name='+', to='prototype.Column')),
                ('id', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Table',
            fields=[
                ('table_id', models.AutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('x', models.IntegerField()),
                ('y', models.IntegerField()),
                ('id', models.IntegerField()),
                ('database', models.ForeignKey(to='prototype.Database')),
                ('column_id_seq', models.IntegerField(default=0)),
            ],
        ),
        migrations.AddField(
            model_name='column',
            name='table',
            field=models.ForeignKey(to='prototype.Table'),
        ),
        migrations.AddField(
            model_name='database',
            name='table_id_seq',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='database',
            name='relation_id_seq',
            field=models.IntegerField(default=0),
        ),
    ]
