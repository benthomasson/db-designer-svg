# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):


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
                ('client', models.ForeignKey(to='prototype.Client', on_delete=models.CASCADE)),
                ('message_type', models.ForeignKey(to='prototype.MessageType', on_delete=models.CASCADE)),
                ('database', models.ForeignKey(to='prototype.Database', on_delete=models.CASCADE)),
            ],
        ),
        migrations.CreateModel(
            name='Relation',
            fields=[
                ('relation_id', models.AutoField(serialize=False, primary_key=True)),
                ('from_column', models.ForeignKey(related_name='+', to='prototype.Column', on_delete=models.CASCADE)),
                ('to_column', models.ForeignKey(related_name='+', to='prototype.Column', on_delete=models.CASCADE)),
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
                ('database', models.ForeignKey(to='prototype.Database', on_delete=models.CASCADE)),
                ('column_id_seq', models.IntegerField(default=0)),
            ],
        ),
        migrations.AddField(
            model_name='column',
            name='table',
            field=models.ForeignKey(to='prototype.Table', on_delete=models.CASCADE),
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
