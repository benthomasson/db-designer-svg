from django.db import models


class Table(models.Model):

    table_id = models.AutoField(primary_key=True,)
    name = models.CharField(max_length=200, blank=True,)
    x = models.IntegerField()
    y = models.IntegerField()
    id = models.IntegerField()
    database = models.ForeignKey('Database', on_delete=models.CASCADE,)
    column_id_seq = models.IntegerField(default=0,)
    display = models.CharField(max_length=200, blank=True,)

    def __unicode__(self):
        return self.name


class Database(models.Model):

    database_id = models.AutoField(primary_key=True,)
    name = models.CharField(max_length=200, blank=True,)
    scale = models.FloatField()
    panX = models.FloatField()
    panY = models.FloatField()
    table_id_seq = models.IntegerField(default=0,)
    relation_id_seq = models.IntegerField(default=0,)
    uuid = models.CharField(max_length=40, blank=True,)

    def __unicode__(self):
        return self.name


class Client(models.Model):

    client_id = models.AutoField(primary_key=True,)


class DatabaseHistory(models.Model):

    database_history_id = models.AutoField(primary_key=True,)
    database = models.ForeignKey('Database', on_delete=models.CASCADE,)
    client = models.ForeignKey('Client', on_delete=models.CASCADE,)
    message_type = models.ForeignKey('MessageType', on_delete=models.CASCADE,)
    message_id = models.IntegerField()
    message_data = models.TextField()
    undone = models.BooleanField(default=False,)


class MessageType(models.Model):

    message_type_id = models.AutoField(primary_key=True,)
    name = models.CharField(max_length=200, blank=True,)

    def __unicode__(self):
        return self.name


class Column(models.Model):

    column_id = models.AutoField(primary_key=True,)
    id = models.IntegerField()
    name = models.CharField(max_length=200, blank=True,)
    type = models.CharField(max_length=200, blank=True,)
    table = models.ForeignKey('Table', on_delete=models.CASCADE,)
    is_pk = models.BooleanField(default=False,)
    is_unique = models.BooleanField(default=False,)
    has_default = models.BooleanField(default=False,)
    default_value = models.TextField()
    is_indexed = models.BooleanField(default=False,)
    related_name = models.CharField(max_length=200, blank=True,)


class Relation(models.Model):

    relation_id = models.AutoField(primary_key=True,)
    from_column = models.ForeignKey(
        'Column', related_name='+', on_delete=models.CASCADE,)
    to_column = models.ForeignKey(
        'Column', related_name='+', on_delete=models.CASCADE,)
    id = models.IntegerField()
