# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0008_auto_20170627_2017'),
    ]

    operations = [
        migrations.AddField(
            model_name='database',
            name='table_id_seq',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='table',
            name='column_id_seq',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
