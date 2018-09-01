# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid

def add_uuids(apps, schema_editor):

    Database = apps.get_model('prototype', 'Database')
    for database in Database.objects.filter(uuid=''):
        database.uuid = uuid.uuid4()
        database.save()


class Migration(migrations.Migration):

    dependencies = [
        ('prototype', '0003_database_uuid'),
    ]

    operations = [
            migrations.RunPython(add_uuids),
    ]
