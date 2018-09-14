var util = require('../util.js');
var text_width = require('text-width');


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

Table.prototype.get_column = function(id) {
    var i = 0;
    for (i = 0; i < this.columns.length; i++) {
        if (this.columns[i].id === id) {
            return this.columns[i];
        }
    }

    return null;
};

Table.prototype.is_selected = util.rectangle_is_selected;

Table.prototype.toJSON = function () {
    return {id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            size: this.size,
            type: this.type};

};

Table.prototype.update_positions = function () {

    this.width = text_width(this.name, {size: 14}) + 10;

    var current_y = 0;
    var width = this.width;
    var i = 0;
    var full_height = this.height;

    current_y = this.height;

    for (i = 0; i < this.columns.length; i++) {
        this.columns[i].y = current_y;
        current_y += this.columns[i].height;
        this.columns[i].width = text_width(this.columns[i].name, {size: 14}) + 10;
        width = Math.max(width, this.columns[i].width);
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

Column.prototype.abs_x = function () {
    return this.table.x;
};

Column.prototype.abs_y = function () {
    return this.table.y + this.y;
};

Column.prototype.mid_y = function () {
    return this.table.y + this.y + this.height / 2;
};

Column.prototype.relation_x = function (other_column) {
    if (other_column === null) {
        return this.table.x + this.table.width/2;
    }
    if (other_column.abs_x() + other_column.table.width < this.abs_x()) {
        return this.table.x;
    }
    if (other_column.abs_x() + other_column.table.width > this.abs_x() + this.table.width) {
        return this.table.x + this.table.width;
    }
    return this.table.x + this.table.width/2;
};

Column.prototype.is_selected = function (x, y) {

    return (x > this.table.x &&
            x < this.table.x + this.table.width &&
            y > this.table.y + this.y &&
            y < this.table.y + this.y + this.height);
};

function Relation(id, from_column, to_column) {
	this.id = id;
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


Relation.prototype.slope = function () {
    //Return the slope in degrees for this transition.
    var x1 = this.from_column.relation_x(this.to_column);
    var y1 = this.from_column.mid_y();
    var x2 = this.to_column.relation_x(this.from_column);
    var y2 = this.to_column.mid_y();
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 180;
};

Relation.prototype.is_selected = function (x, y) {
    if (this.to_column === null) {
        return false;
    }
    var x1 = this.from_column.relation_x(this.to_column);
    var y1 = this.from_column.mid_y();
    var x2 = this.to_column.relation_x(this.from_column);
    var y2 = this.to_column.mid_y();
    var d = util.pDistance(x, y, x1, y1, x2, y2);
    if (util.cross_z_pos(x, y, x1, y1, x2, y2)) {
        return d < 10;
    } else {
        return d < 10;
    }
    return false;
};
