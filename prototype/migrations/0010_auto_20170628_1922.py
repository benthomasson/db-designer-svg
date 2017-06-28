# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0009_auto_20170628_1913'),
    ]

    operations = [
        migrations.AlterField(
            model_name='database',
            name='table_id_seq',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='table',
            name='column_id_seq',
            field=models.IntegerField(default=0),
        ),
    ]
