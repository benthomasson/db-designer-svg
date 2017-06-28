

function serialize(message) {
    return JSON.stringify([message.constructor.name, message]);
}
exports.serialize = serialize;

function TableMove(sender, id, x, y, previous_x, previous_y) {
    this.sender = sender;
    this.id = id;
    this.x = x;
    this.y = y;
    this.previous_x = previous_x;
    this.previous_y = previous_y;
}
exports.TableMove = TableMove;

function TableCreate(sender, id, x, y, name, type) {
    this.sender = sender;
    this.id = id;
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
}
exports.TableCreate = TableCreate;

function TableDestroy(sender, id, previous_x, previous_y, previous_name, previous_type) {
    this.sender = sender;
    this.id = id;
    this.previous_x = previous_x;
    this.previous_y = previous_y;
    this.previous_name = previous_name;
    this.previous_type = previous_type;
}
exports.TableDestroy = TableDestroy;

function TableLabelEdit(sender, id, name, previous_name) {
    this.sender = sender;
    this.id = id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.TableLabelEdit = TableLabelEdit;

function TableSelected(sender, id) {
    this.sender = sender;
    this.id = id;
}
exports.TableSelected = TableSelected;

function TableUnSelected(sender, id) {
    this.sender = sender;
    this.id = id;
}
exports.TableUnSelected = TableUnSelected;

function ColumnCreate(sender, id, table_id, name, type) {
    this.sender = sender;
    this.id = id;
    this.table_id = table_id;
    this.name = name;
    this.type = type;
}
exports.ColumnCreate = ColumnCreate;

function ColumnDestroy(sender, id, table_id, previous_name, previous_type) {
    this.sender = sender;
    this.id = id;
    this.table_id = table_id;
    this.previous_name = previous_name;
    this.previous_type = previous_type;
}
exports.ColumnDestroy = ColumnDestroy;

function ColumnLabelEdit(sender, table_id, id, name, previous_name) {
    this.sender = sender;
    this.table_id = table_id;
    this.id = id;
    this.name = name;
    this.previous_name = previous_name;
}
exports.ColumnLabelEdit = ColumnLabelEdit;

function RelationCreate(sender, from_id, to_id) {
    this.sender = sender;
    this.from_id = from_id;
    this.to_id = to_id;
}
exports.RelationCreate = RelationCreate;

function RelationDestroy(sender, from_id, to_id) {
    this.sender = sender;
    this.from_id = from_id;
    this.to_id = to_id;
}
exports.RelationDestroy = RelationDestroy;

function Undo(sender, original_message) {
    this.sender = sender;
    this.original_message = original_message;
}
exports.Undo = Undo;

function Redo(sender, original_message) {
    this.sender = sender;
    this.original_message = original_message;
}
exports.Redo = Redo;
