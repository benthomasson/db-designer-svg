# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0010_auto_20170628_1922'),
    ]

    operations = [
        migrations.AddField(
            model_name='database',
            name='relation_id_seq',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='relation',
            name='id',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
