from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
import yaml
import uuid
from prototype.models import Database, Table, Column, Relation

from functools import partial
from collections import defaultdict


from django import forms


class DBForm(forms.Form):
    database_id = forms.CharField()


class UploadFileForm(forms.Form):
    file = forms.FileField()

# Create your views here.


def index(request):
    return HttpResponseRedirect('/static/prototype/index.html')


table_map = dict(x='x',
                 y='y',
                 name='name',
                 display='display')

view_map = dict(panX='panX',
                panY='panY',
                scale='scaleXY')

relation_map = dict(from_column__table__name="from_table",
                    to_column__table__name="to_table",
                    to_column__name="to_column",
                    from_column__name="from_column")

column_map = dict(name='name',
                  table__name='table',
                  related_name='related_name')


def transform_dict(dict_map, d):
    return {to_key: d[from_key] for from_key, to_key in dict_map.iteritems()}


transform_view = partial(transform_dict, view_map)
transform_table = partial(transform_dict, table_map)
transform_relation = partial(transform_dict, relation_map)
transform_column = partial(transform_dict, column_map)


def parse_value(value):
    try:
        if "." in value:
            return float(value)
        else:
            return int(value)
    except ValueError:
        if value in ["true", "True", "yes", 'Yes']:
            return True
        elif value in ["false", "False", "no", "No"]:
            return False
    return value


def transform_column2(column):
    d = dict()
    if column.get('related_name', None):
        d['related_name'] = column.get('related_name', '')
    name_parts = column['name'].split(':')
    d['name'] = name_parts.pop(0)
    if name_parts:
        d['type'] = name_parts.pop(0)
        if d['type'] == 'AutoField':
            d['pk'] = True
    if name_parts:
        if d['type'] in ['CharField']:
            d['len'] = int(name_parts.pop(0))
        else:
            d['default'] = parse_value(name_parts.pop(0))
    if name_parts:
        d['default'] = parse_value(name_parts.pop(0))
    return d


def download(request):
    data = dict(models=[], external_models=[], modules=[], view={})
    table_map = dict()
    column_map = dict()
    form = DBForm(request.GET)
    if form.is_valid():
        database_uuid = form.cleaned_data['database_id']
        db = Database.objects.get(uuid=database_uuid)
        data['view'] = map(transform_view, (Database.objects.filter(pk=db.pk).values('panX', 'panY', 'scale')))[0]
        data['app'] = db.name
        data['models'] = map(transform_table, list(Table.objects
                                                        .filter(database_id=db.pk)
                                                        .order_by('id')
                                                        .values('x',
                                                                'y',
                                                                'name',
                                                                'id',
                                                                'display')))

        for table in data['models']:
            if not table['display']:
                del table['display']
            table['fields'] = []
            table_map[table['name']] = table
        columns = map(transform_column, list(Column.objects
                                             .filter(table__database_id=db.pk)
                                             .order_by('id')
                                             .values('table__name',
                                                     'name',
                                                     'related_name')))
        for column in columns:
            if not column['related_name']:
                del column['related_name']
            if column['name']:
                column2 = transform_column2(column)
                table_map[column['table']]['fields'].append(column2)
                column_map[(column['table'], column['name'])] = column2

        relations = map(transform_relation, list(Relation.objects
                                                         .filter(from_column__table__database_id=db.pk)
                                                         .values('from_column__table__name',
                                                                 'from_column__name',
                                                                 'to_column__table__name',
                                                                 'to_column__name')))
        for relation in relations:
            column_map[(relation['from_table'], relation['from_column'])]['ref'] = relation['to_table']
            column_map[(relation['from_table'],
                        relation['from_column'])]['ref_field'] = relation['to_column'].split(':')[0]
        response = HttpResponse(yaml.safe_dump(data, default_flow_style=False),
                                content_type="application/force-download")
        response['Content-Disposition'] = 'attachment; filename="{0}.yml"'.format(db.name)
        return response
    else:
        return HttpResponse(form.errors)


def upload_db(data):
    db = Database(scale=1.0, panX=0, panY=0, uuid=uuid.uuid4())
    db.name = data.get('name', data.get("app", "db"))
    if data.get('view', False):
        view = data['view']
        db.scale = view.get('scaleXY', 1.0)
        db.panX = view.get('panX', 0)
        db.panY = view.get('panY', 0)
    db.save()
    tables = []
    columns = []
    relations = []
    column_count = defaultdict(lambda: 0)
    relation_i = 0
    for i, table in enumerate(data.get('models', [])):
        new_table = Table(database_id=db.pk,
                          name=table.get('name'),
                          id=i + 1,
                          x=table.get('x', 0),
                          y=table.get('y', 0),
                          display=table.get('display', ''))
        tables.append(new_table)
    Table.objects.bulk_create(tables)
    tables_map = dict(Table.objects
                           .filter(database_id=db.pk)
                           .values_list("name", "pk"))
    for table in data.get('models', []):
        for i, column in enumerate(table.get('fields', [])):
            print column
            new_column_name = column['name']
            if column.get('type'):
                new_column_name += ":{0}".format(column.get('type'))
                if column.get('len') is not None:
                    new_column_name += ":{0}".format(column.get('len'))
                if column.get('default') is not None:
                    new_column_name += ":{0}".format(column.get('default'))
            new_column = Column(name=new_column_name,
                                id=i + 1,
                                type=column.get('type', ''),
                                related_name=column.get('related_name', ''),
                                table_id=tables_map[table['name']])
            columns.append(new_column)

    Column.objects.bulk_create(columns)
    columns = list(Column.objects
                         .filter(table__database_id=db.pk)
                         .values("table__name", "name", "pk"))
    columns_map = dict()
    for column in columns:
        columns_map[(column['table__name'], column['name'].split(":")[0])] = column['pk']
        column_count[column['table__name']] += 1
    for table in data.get('models', []):
        for i, column in enumerate(table.get('fields', [])):
            if (column.get('ref') and column.get('ref_field')):
                if ((column.get('ref'), column.get('ref_field')) in columns_map):
                    new_relation = Relation(id=relation_i,
                                            from_column_id=columns_map[(table['name'], column['name'])],
                                            to_column_id=columns_map[(column.get('ref'), column.get('ref_field'))])
                    relations.append(new_relation)
                    relation_i += 1
                else:
                    print ("Error could not find %s %s in columns_map" % (column.get('ref'), column.get('ref_field')))

    Relation.objects.bulk_create(relations)
    for table in Table.objects.filter(database_id=db.pk):
        table.column_id_seq = column_count[table.name]
        table.save()
    db.table_id_seq = len(tables)
    db.relation_id_seq = len(relations)
    db.save()
    return db.uuid


def upload(request):
    if request.method == 'POST':
        print request.POST
        print request.FILES
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            data = yaml.load(request.FILES['file'].read())
            db_id = upload_db(data)
            print (db_id)
            return HttpResponseRedirect('/static/prototype/index.html#!?database_id={0}'.format(db_id))
    else:
        form = UploadFileForm()
    return render(request, 'prototype/upload.html', {'form': form})
