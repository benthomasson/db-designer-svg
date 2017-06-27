from django.contrib import admin

from prototype.models import Table

from prototype.models import Database

from prototype.models import Client

from prototype.models import DatabaseHistory

from prototype.models import MessageType

from prototype.models import Column

from prototype.models import Relation


class TableAdmin(admin.ModelAdmin):
    fields = ('name', 'x', 'y', 'id', 'database',)
    raw_id_fields = ('database',)


admin.site.register(Table, TableAdmin)


class DatabaseAdmin(admin.ModelAdmin):
    fields = ('name', 'scale', 'panX', 'panY',)
    raw_id_fields = ()


admin.site.register(Database, DatabaseAdmin)


class ClientAdmin(admin.ModelAdmin):
    fields = ()
    raw_id_fields = ()


admin.site.register(Client, ClientAdmin)


class DatabaseHistoryAdmin(admin.ModelAdmin):
    fields = ('topology', 'client', 'message_type', 'message_id', 'message_data', 'undone',)
    raw_id_fields = ('topology', 'client', 'message_type',)


admin.site.register(DatabaseHistory, DatabaseHistoryAdmin)


class MessageTypeAdmin(admin.ModelAdmin):
    fields = ('name',)
    raw_id_fields = ()


admin.site.register(MessageType, MessageTypeAdmin)


class ColumnAdmin(admin.ModelAdmin):
    fields = ('id', 'name', 'type', 'table', 'is_pk', 'is_unique', 'has_default', 'default_value', 'is_indexed',)
    raw_id_fields = ('table',)


admin.site.register(Column, ColumnAdmin)


class RelationAdmin(admin.ModelAdmin):
    fields = ('from_column', 'to_column',)
    raw_id_fields = ('from_column', 'to_column',)


admin.site.register(Relation, RelationAdmin)
