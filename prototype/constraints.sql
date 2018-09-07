alter table prototype_table add constraint prototype_table_database_id_id_unique unique (database_id, id);
alter table prototype_column add constraint prototype_column_table_id_id_unique unique (table_id, id);
