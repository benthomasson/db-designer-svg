from django.db import models


class Table(models.Model):

    table_id = models.AutoField(primary_key=True,)
    name = models.CharField(max_length=200, )
    x = models.IntegerField()
    y = models.IntegerField()
    id = models.IntegerField()
    database = models.ForeignKey('Database',)

    def __unicode__(self):
        return self.name


class Database(models.Model):

    database_id = models.AutoField(primary_key=True,)
    name = models.CharField(max_length=200, )
    scale = models.FloatField()
    panX = models.FloatField()
    panY = models.FloatField()

    def __unicode__(self):
        return self.name


class Client(models.Model):

    client_id = models.AutoField(primary_key=True,)


class DatabaseHistory(models.Model):

    database_history_id = models.AutoField(primary_key=True,)
    topology = models.ForeignKey('Database',)
    client = models.ForeignKey('Client',)
    message_type = models.ForeignKey('MessageType',)
    message_id = models.IntegerField()
    message_data = models.TextField()
    undone = models.BooleanField(default=False)


class MessageType(models.Model):

    message_type_id = models.AutoField(primary_key=True,)
    name = models.CharField(max_length=200, )

    def __unicode__(self):
        return self.name


class Column(models.Model):

    column_id = models.AutoField(primary_key=True,)
    id = models.IntegerField()
    name = models.CharField(max_length=200, )
    type = models.CharField(max_length=200, )
    table = models.ForeignKey('Table',)
    is_pk = models.BooleanField(default=False)
    is_unique = models.BooleanField(default=False)
    has_default = models.BooleanField(default=False)
    default_value = models.TextField()
    is_indexed = models.BooleanField(default=False)


class Relation(models.Model):

    relation_id = models.AutoField(primary_key=True,)
    from_column = models.ForeignKey('Column',  related_name='+', )
    to_column = models.ForeignKey('Column',  related_name='+', )
