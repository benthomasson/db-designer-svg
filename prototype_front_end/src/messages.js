

function serialize(message) {
    return JSON.stringify([message.constructor.name, message]);
}
exports.serialize = serialize;

function TableMove(sender, id, x, y, previous_x, previous_y) {
	this.msg_type = "TableMove";
    this.sender = sender;
    this.id = id;
    this.x = x;
    this.y = y;
    this.previous_x = previous_x;
    this.previous_y = previous_y;
}
exports.TableMove = TableMove;

function TableCreate(sender, id, x, y, name, type) {
    this.msg_type = "TableCreate";
    this.sender = sender;
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
}
exports.TableCreate = TableCreate;

function TableDestroy(sender, id, previous_x, previous_y, previous_name, previous_type) {
    this.msg_type = "TableDestroy";
    this.sender = sender;
    this.id = id;
    this.previous_x = previous_x;
    this.previous_y = previous_y;
    this.previous_name = previous_name;
    this.previous_type = previous_type;
}
exports.TableDestroy = TableDestroy;

function TableLabelEdit(sender, id, name, previous_name) {
    this.msg_type = "TableLabelEdit";
    this.sender = sender;
    this.id = id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.TableLabelEdit = TableLabelEdit;

function TableSelected(sender, id) {
    this.msg_type = "TableSelected";
    this.sender = sender;
    this.id = id;
}
exports.TableSelected = TableSelected;

function TableUnSelected(sender, id) {
    this.msg_type = "TableUnSelected";
    this.sender = sender;
    this.id = id;
}
exports.TableUnSelected = TableUnSelected;

function ColumnCreate(sender, id, table_id, name, type) {
    this.msg_type = "ColumnCreate";
    this.sender = sender;
    this.id = id;
    this.table_id = table_id;
    this.name = name;
    this.type = type;
}
exports.ColumnCreate = ColumnCreate;

function ColumnDestroy(sender, id, table_id, previous_name, previous_type) {
    this.msg_type = "ColumnDestroy";
    this.sender = sender;
    this.id = id;
    this.table_id = table_id;
    this.previous_name = previous_name;
    this.previous_type = previous_type;
}
exports.ColumnDestroy = ColumnDestroy;

function ColumnLabelEdit(sender, table_id, id, name, previous_name) {
    this.msg_type = "ColumnLabelEdit";
    this.sender = sender;
    this.table_id = table_id;
    this.id = id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.ColumnLabelEdit = ColumnLabelEdit;

function RelationCreate(sender, id, from_table_id, from_column_id, to_table_id, to_column_id) {
    this.msg_type = "RelationCreate";
    this.sender = sender;
    this.id = id;
    this.from_table_id = from_table_id;
    this.from_column_id = from_column_id;
    this.to_table_id = to_table_id;
    this.to_column_id = to_column_id;
}
exports.RelationCreate = RelationCreate;

function RelationDestroy(sender, id, from_table_id, from_column_id, to_table_id, to_column_id) {
    this.msg_type = "RelationDestroy";
    this.sender = sender;
    this.id = id;
    this.from_table_id = from_table_id;
    this.from_column_id = from_column_id;
    this.to_table_id = to_table_id;
    this.to_column_id = to_column_id;
}
exports.RelationDestroy = RelationDestroy;

function RelationSelected(sender, id) {
    this.msg_type = "RelationSelected";
    this.sender = sender;
    this.id = id;
}
exports.RelationSelected = RelationSelected;

function RelationUnSelected(sender, id) {
    this.msg_type = "RelationUnSelected";
    this.sender = sender;
    this.id = id;
}
exports.RelationUnSelected = RelationUnSelected;

function Undo(sender, original_message) {
    this.msg_type = "Undo";
    this.sender = sender;
    this.original_message = original_message;
}
exports.Undo = Undo;

function Redo(sender, original_message) {
    this.msg_type = "Redo";
    this.sender = sender;
    this.original_message = original_message;
}
exports.Redo = Redo;

function MultipleMessage(sender, messages) {
    this.msg_type = "MultipleMessage";
    this.sender = sender;
    this.messages = messages;
}
exports.MultipleMessage = MultipleMessage;
