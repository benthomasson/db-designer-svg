# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0007_auto_20170627_1903'),
    ]

    operations = [
        migrations.RenameField(
            model_name='databasehistory',
            old_name='topology',
            new_name='database',
        ),
    ]
