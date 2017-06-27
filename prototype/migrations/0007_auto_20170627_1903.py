# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0006_auto_20170321_1236'),
    ]

    operations = [
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
                ('topology', models.ForeignKey(to='prototype.Database')),
            ],
        ),
        migrations.CreateModel(
            name='Relation',
            fields=[
                ('relation_id', models.AutoField(serialize=False, primary_key=True)),
                ('from_column', models.ForeignKey(related_name='+', to='prototype.Column')),
                ('to_column', models.ForeignKey(related_name='+', to='prototype.Column')),
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
            ],
        ),
        migrations.RemoveField(
            model_name='device',
            name='topology',
        ),
        migrations.RemoveField(
            model_name='link',
            name='from_device',
        ),
        migrations.RemoveField(
            model_name='link',
            name='to_device',
        ),
        migrations.RemoveField(
            model_name='topologyhistory',
            name='client',
        ),
        migrations.RemoveField(
            model_name='topologyhistory',
            name='message_type',
        ),
        migrations.RemoveField(
            model_name='topologyhistory',
            name='topology',
        ),
        migrations.DeleteModel(
            name='Device',
        ),
        migrations.DeleteModel(
            name='Link',
        ),
        migrations.DeleteModel(
            name='Topology',
        ),
        migrations.DeleteModel(
            name='TopologyHistory',
        ),
        migrations.AddField(
            model_name='column',
            name='table',
            field=models.ForeignKey(to='prototype.Table'),
        ),
    ]
