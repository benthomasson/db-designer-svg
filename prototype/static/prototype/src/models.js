var fsm = require('./fsm.js');
var button = require('./button.js');
var util = require('./util.js');

function Table(id, name, x, y) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.height = 30;
    this.width = 50;
    this.full_height = 30;
    this.selected = false;
    this.remote_selected = false;
    this.edit_label = false;
    this.columns = [];
    this.column_id_seq = util.natural_numbers(0);
}
exports.Table = Table;

Table.prototype.is_selected = function (x, y) {

    return (x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height);

};


Table.prototype.toJSON = function () {
    return {id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            size: this.size,
            type: this.type};

};

Table.prototype.update_positions = function () {

    this.width = 10 * this.name.length + 10;

    var current_y = 0;
    var width = this.width;
    var i = 0;
    var full_height = this.height;

    current_y = this.height;

    for (i = 0; i < this.columns.length; i++) {
        this.columns[i].y = current_y;
        current_y += this.columns[i].height;
        this.columns[i].width = this.columns[i].name.length * 10 + 10;
        width = Math.max(width,  this.columns[i].width);
        full_height += this.columns[i].height;
    }

    this.width = width;
    this.full_height = full_height;
};

function Column(table, id, name, type) {
    this.table = table;
    this.id = id;
    this.name = name;
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.height = 30;
    this.width = 50;
    this.selected = false;
    this.remote_selected = false;
    this.edit_label = false;
}
exports.Column = Column;

Column.prototype.is_selected = function (x, y) {

    return (x > this.table.x &&
            x < this.table.x + this.table.width &&
            y > this.table.y + this.y &&
            y < this.table.y + this.y + this.height);
};


function Relation(from_column, to_column) {
    this.from_column = from_column;
    this.to_column = to_column;
    this.selected = false;
    this.status = null;
}
exports.Relation = Relation;

Relation.prototype.toJSON = function () {
    return {to_column: this.to_column.id,
            from_column: this.from_column.id};
};

function Button(name, x, y, width, height, callback) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.callback = callback;
    this.is_pressed = false;
    this.mouse_over = false;
    this.fsm = new fsm.FSMController(this, button.Start, null);
}
exports.Button = Button;


Button.prototype.is_selected = function (x, y) {

    return (x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height);

};

