# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0002_auto_20180104_2055'),
    ]

    operations = [
        migrations.AddField(
            model_name='database',
            name='uuid',
            field=models.CharField(default='', max_length=40),
            preserve_default=False,
        ),
    ]
