var fsm = require('./fsm.js');
var button = require('./button.js');

function Table(id, name, x, y) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.height = 50;
    this.width = 50;
    this.selected = false;
    this.remote_selected = false;
    this.edit_label = false;
}
exports.Table = Table;

Table.prototype.is_selected = function (x, y) {

    return (x > this.x - this.width &&
            x < this.x + this.width &&
            y > this.y - this.height &&
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

function Column(id, name, x, y, type) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.type = type;
    this.height = 50;
    this.width = 50;
    this.selected = false;
    this.remote_selected = false;
    this.edit_label = false;
}
exports.Column = Column;

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

