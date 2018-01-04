# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0001_squashed_0011_auto_20170630_1814'),
    ]

    operations = [
        migrations.AddField(
            model_name='column',
            name='related_name',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='table',
            name='display',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='relation',
            name='id',
            field=models.IntegerField(),
        ),
    ]
