var inherits = require('inherits');
var fsm = require('./fsm.js');
var models = require('./models.js');
var messages = require('./messages.js');
var snake = require('to-snake-case');

function _State () {
}
inherits(_State, fsm._State);

_State.prototype.onMouseMove = function (controller, $event) {
    controller.next_controller.state.onMouseMove(controller.next_controller, $event);
};
_State.prototype.onMouseUp = function (controller, $event) {
    controller.next_controller.state.onMouseUp(controller.next_controller, $event);
};
_State.prototype.onMouseDown = function (controller, $event) {
    controller.next_controller.state.onMouseDown(controller.next_controller, $event);
};
_State.prototype.onMouseWheel = function (controller, $event, delta, deltaX, deltaY) {
    controller.next_controller.state.onMouseWheel(controller.next_controller, $event, delta, deltaX, deltaY);
};
_State.prototype.onKeyDown = function (controller, $event) {
    controller.next_controller.state.onKeyDown(controller.next_controller, $event);
};


function _Ready () {
    this.name = 'Ready';
}
inherits(_Ready, _State);
var Ready = new _Ready();
exports.Ready = Ready;

function _Start () {
    this.name = 'Start';
}
inherits(_Start, _State);
var Start = new _Start();
exports.Start = Start;

function _Selected2 () {
    this.name = 'Selected2';
}
inherits(_Selected2, _State);
var Selected2 = new _Selected2();
exports.Selected2 = Selected2;

function _Selected3 () {
    this.name = 'Selected3';
}
inherits(_Selected3, _State);
var Selected3 = new _Selected3();
exports.Selected3 = Selected3;

function _Move () {
    this.name = 'Move';
}
inherits(_Move, _State);
var Move = new _Move();
exports.Move = Move;

function _Selected1 () {
    this.name = 'Selected1';
}
inherits(_Selected1, _State);
var Selected1 = new _Selected1();
exports.Selected1 = Selected1;



function _EditLabel () {
    this.name = 'EditLabel';
}
inherits(_EditLabel, _State);
var EditLabel = new _EditLabel();
exports.EditLabel = EditLabel;

function _EditColumnLabel () {
    this.name = 'EditColumnLabel';
}
inherits(_EditColumnLabel, _State);
var EditColumnLabel = new _EditColumnLabel();
exports.EditColumnLabel = EditColumnLabel;

function _Connecting () {
    this.name = 'Connecting';
}
inherits(_Connecting, _State);
var Connecting = new _Connecting();
exports.Connecting = Connecting;

function _Connected () {
    this.name = 'Connected';
}
inherits(_Connected, _State);
var Connected = new _Connected();
exports.Connected = Connected;

_Ready.prototype.start = function (controller) {

    if (controller.scope.tables === undefined) {
        return;
    }

    var i = 0;
    var j = 0;
    var table = null;
    var column = null;
    var index = null;
    var found = false;

    for (i = 0; i < controller.scope.tables.length; i++) {
        table = controller.scope.tables[i];
        found = false;
        for (j = 0; j < table.columns.length; j++) {
            column = table.columns[j];
            if (column.name === "") {
                index = table.columns.indexOf(column);
                if (index !== -1) {
                    table.columns.splice(index, 1);
                    found = true;
                    j--;
                    controller.scope.send_control_message(new messages.ColumnDestroy(controller.scope.client_id,
                                                                                     column.id,
                                                                                     table.id,
                                                                                     column.name,
                                                                                     column.type));
                }
            }
        }
        if (found) {
            table.update_positions();
        }
    }

};

_Ready.prototype.onMouseDown = function (controller, $event) {

    var selection = controller.scope.select_items($event.shiftKey);

    if (selection.last_selected_table !== null || selection.last_selected_relation !== null) {
        controller.changeState(Selected1);
    } else {
        controller.next_controller.state.onMouseDown(controller.next_controller, $event);
    }
};
_Ready.prototype.onMouseDown.transitions = ['Selected1'];


_Ready.prototype.onKeyDown = function(controller, $event) {

	var scope = controller.scope;
    var table = null;
    var new_column;

	if ($event.key === 't') {
		table = new models.Table(controller.scope.table_id_seq(),
                                 "New",
                                 scope.scaledX,
                                 scope.scaledY);

        new_column = new models.Column(table,
                                       table.column_id_seq(),
                                       "", "");

        table.columns.push(new_column);
        table.update_positions();
	}

    if (table !== null) {
        scope.tables.push(table);
        scope.send_control_message(new messages.MultipleMessage(scope.client_id,
                                                                [new messages.TableCreate(scope.client_id,
                                                                                          table.id,
                                                                                          table.x,
                                                                                          table.y,
                                                                                          table.name,
                                                                                          table.type),
                                                                 new messages.ColumnCreate(scope.client_id,
                                                                        new_column.id,
                                                                        table.id,
                                                                        new_column.name,
                                                                        new_column.type)]));
        scope.selected_tables = [table];
        table.selected = true;
        controller.changeState(Selected2);
        return;
    }

	controller.next_controller.state.onKeyDown(controller.next_controller, $event);
};

_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};
_Start.prototype.start.transitions = ['Ready'];

_Selected2.prototype.start = function (controller) {

    if (controller.scope.selected_tables.length === 1) {
        var table = controller.scope.selected_tables[0];
        if (table.columns.length > 0 && table.columns[table.columns.length-1].name !== "") {
            var new_column = new models.Column(table,
                                               table.column_id_seq(),
                                               "", "");


            table.columns.push(new_column);
            table.update_positions();
            controller.scope.send_control_message(new messages.ColumnCreate(controller.scope.client_id,
                                                                            new_column.id,
                                                                            table.id,
                                                                            new_column.name,
                                                                            new_column.type));
        }
    }
};



_Selected2.prototype.onMouseDown = function (controller, $event) {

    if (controller.scope.selected_tables.length === 1) {
        var current_selected_table = controller.scope.selected_tables[0];
        var selection = controller.scope.select_items($event.shiftKey);
        if (current_selected_table === selection.last_selected_table) {
            controller.changeState(Selected3);
            return;
        }
    }

    controller.changeState(Ready);
    controller.state.onMouseDown(controller, $event);
};
_Selected2.prototype.onMouseDown.transitions = ['Ready', 'Selected3'];

_Selected2.prototype.onKeyDown = function (controller, $event) {

    if ($event.keyCode === 8) {
        //Delete
        controller.changeState(Ready);

        var i = 0;
        var j = 0;
        var index = -1;
        var tables = controller.scope.selected_tables;
        var relations = controller.scope.selected_relations;
        var all_relations = controller.scope.relations.slice();
        controller.scope.selected_tables = [];
        controller.scope.selected_relations = [];
        for (i = 0; i < relations.length; i++) {
            index = controller.scope.relations.indexOf(relations[i]);
            if (index !== -1) {
                relations[i].selected = false;
                relations[i].remote_selected = false;
                controller.scope.relations.splice(index, 1);
                controller.scope.send_control_message(new messages.RelationDestroy(controller.scope.client_id,
                                                                               relations[i].id,
                                                                               relations[i].from_column.table.id,
                                                                               relations[i].from_column.id,
                                                                               relations[i].to_column.table.id,
                                                                               relations[i].to_column.id));
            }
        }
        for (i = 0; i < tables.length; i++) {
            index = controller.scope.tables.indexOf(tables[i]);
            if (index !== -1) {
                controller.scope.tables.splice(index, 1);
                controller.scope.send_control_message(new messages.TableDestroy(controller.scope.client_id,
                                                                                 tables[i].id,
                                                                                 tables[i].x,
                                                                                 tables[i].y,
                                                                                 tables[i].name,
                                                                                 tables[i].type));
            }
            for (j = 0; j < all_relations.length; j++) {
                if (all_relations[j].to_table === tables[i] ||
                    all_relations[j].from_table === tables[i]) {
                    index = controller.scope.relations.indexOf(all_relations[j]);
                    if (index !== -1) {
                        controller.scope.relations.splice(index, 1);
                    }
                }
            }
        }
    }
};
_Selected2.prototype.onMouseUp.transitions = ['Ready'];


_Selected1.prototype.onMouseMove = function (controller) {

    var selection = controller.scope.select_items(true);
    if (selection.last_selected_column !== null) {
        controller.scope.new_relation = new models.Relation(controller.scope.relation_id_seq(), selection.last_selected_column, null);
        controller.scope.relations.push(controller.scope.new_relation);
        controller.changeState(Connecting);
    } else {
        controller.changeState(Move);
    }

};
_Selected1.prototype.onMouseMove.transitions = ['Move', 'Connecting'];

_Selected1.prototype.onMouseUp = function (controller) {

    controller.changeState(Selected2);

};
_Selected1.prototype.onMouseUp.transitions = ['Selected2'];

_Selected1.prototype.onMouseDown = function () {

};

_Move.prototype.onMouseMove = function (controller) {

    var tables = controller.scope.selected_tables;

    var diffX = controller.scope.scaledX - controller.scope.pressedScaledX;
    var diffY = controller.scope.scaledY - controller.scope.pressedScaledY;
    var i = 0;
    var previous_x, previous_y;
    for (i = 0; i < tables.length; i++) {
        previous_x = tables[i].x;
        previous_y = tables[i].y;
        tables[i].x = tables[i].x + diffX;
        tables[i].y = tables[i].y + diffY;
        controller.scope.send_control_message(new messages.TableMove(controller.scope.client_id,
                                                                      tables[i].id,
                                                                      tables[i].x,
                                                                      tables[i].y,
                                                                      previous_x,
                                                                      previous_y));
    }
    controller.scope.pressedScaledX = controller.scope.scaledX;
    controller.scope.pressedScaledY = controller.scope.scaledY;
};


_Move.prototype.onMouseUp = function (controller, $event) {

    controller.changeState(Selected2);
    controller.state.onMouseUp(controller, $event);
};
_Move.prototype.onMouseUp.transitions = ['Selected2'];

_Selected3.prototype.onMouseUp = function (controller) {
    if (controller.scope.selected_columns.length > 0) {
        controller.changeState(EditColumnLabel);
    } else {
        controller.changeState(EditLabel);
    }
};
_Selected3.prototype.onMouseUp.transitions = ['EditLabel', 'EditColumnLabel'];


_Selected3.prototype.onMouseMove = function (controller) {

    var selection = controller.scope.select_items(true);
    if (selection.last_selected_column !== null) {
        controller.scope.new_relation = new models.Relation(controller.scope.relation_id_seq(), selection.last_selected_column, null);
        controller.scope.relations.push(controller.scope.new_relation);
        controller.changeState(Connecting);
    } else {
        controller.changeState(Move);
    }
};
_Selected3.prototype.onMouseMove.transitions = ['Move', 'Connecting'];


_EditLabel.prototype.start = function (controller) {
    controller.scope.selected_tables[0].edit_label = true;
};

_EditLabel.prototype.end = function (controller) {
    var table = controller.scope.selected_tables[0];
    table.edit_label = false;
    if (table.columns.length === 0) {
        var new_column = new models.Column(table,
                                           table.column_id_seq(),
                                           snake(table.name) + "_id:AutoField", "");

        table.columns.push(new_column);
        controller.scope.send_control_message(new messages.ColumnCreate(controller.scope.client_id,
                                                                        new_column.id,
                                                                        table.id,
                                                                        new_column.name,
                                                                        new_column.type));
    }
    if (table.columns[0].name === "") {
        table.columns[0].name = snake(table.name) + "_id:AutoField";
        controller.scope.send_control_message(new messages.ColumnLabelEdit(controller.scope.client_id,
                                                                            table.id,
                                                                            table.columns[0].id,
                                                                            table.columns[0].name,
                                                                            ""));
    }
    table.update_positions();
};

_EditLabel.prototype.onMouseDown = function (controller, $event) {

    controller.changeState(Ready);
    controller.state.onMouseDown(controller, $event);

};
_EditLabel.prototype.onMouseDown.transitions = ['Ready'];


_EditLabel.prototype.onKeyDown = function (controller, $event) {
    //Key codes found here:
    //https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	var table = controller.scope.selected_tables[0];
    var previous_name = table.name;
	if ($event.keyCode === 8 || $event.keyCode === 46) { //Delete
		table.name = table.name.slice(0, -1);
	} else if ($event.keyCode >= 48 && $event.keyCode <=90) { //Alphanumeric
        table.name += $event.key;
	} else if ($event.keyCode >= 186 && $event.keyCode <=222) { //Punctuation
        table.name += $event.key;
	} else if ($event.keyCode === 13) { //Enter
        controller.changeState(Selected2);
    }
    controller.scope.send_control_message(new messages.TableLabelEdit(controller.scope.client_id,
                                                                       table.id,
                                                                       table.name,
                                                                       previous_name));
    table.update_positions();
};
_EditLabel.prototype.onKeyDown.transitions = ['Selected2'];

_EditColumnLabel.prototype.start = function (controller) {
    controller.scope.selected_columns[0].edit_label = true;
};

_EditColumnLabel.prototype.end = function (controller) {
    var column = controller.scope.selected_columns[0];
    column.edit_label = false;
    column.table.update_positions();
};

_EditColumnLabel.prototype.onMouseDown = function (controller, $event) {

    controller.changeState(Ready);
    controller.state.onMouseDown(controller, $event);

};
_EditColumnLabel.prototype.onMouseDown.transitions = ['Ready'];


_EditColumnLabel.prototype.onKeyDown = function (controller, $event) {
    //Key codes found here:
    //https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
	var column = controller.scope.selected_columns[0];
    var previous_name = column.name;
	if ($event.keyCode === 8 || $event.keyCode === 46) { //Delete
		column.name = column.name.slice(0, -1);
	} else if ($event.keyCode >= 48 && $event.keyCode <=90) { //Alphanumeric
        column.name += $event.key;
	} else if ($event.keyCode >= 186 && $event.keyCode <=222) { //Punctuation
        column.name += $event.key;
	} else if ($event.keyCode === 13) { //Enter
        controller.changeState(Selected2);
    }
    controller.scope.send_control_message(new messages.ColumnLabelEdit(controller.scope.client_id,
                                                                       column.table.id,
                                                                       column.id,
                                                                       column.name,
                                                                       previous_name));
    column.table.update_positions();
};
_EditColumnLabel.prototype.onKeyDown.transitions = ['Selected2'];

_Connecting.prototype.onMouseDown = function () {
};

_Connecting.prototype.onMouseUp = function (controller) {

    var selection = controller.scope.select_items(false);
    if (selection.last_selected_column !== null) {
        controller.scope.new_relation.to_column = selection.last_selected_column;
        controller.scope.send_control_message(new messages.RelationCreate(controller.scope.client_id,
                                                                          controller.scope.new_relation.id,
                                                                          controller.scope.new_relation.from_column.table.id,
                                                                          controller.scope.new_relation.from_column.id,
                                                                          controller.scope.new_relation.to_column.table.id,
                                                                          controller.scope.new_relation.to_column.id));
        if (controller.scope.new_relation.from_column.name === "") {
            controller.scope.new_relation.from_column.name = snake(controller.scope.new_relation.to_column.table.name) + ":ForeignKey";
            controller.scope.send_control_message(new messages.ColumnLabelEdit(controller.scope.client_id,
                                                                                controller.scope.new_relation.from_column.table.id,
                                                                                controller.scope.new_relation.from_column.id,
                                                                                controller.scope.new_relation.from_column.name,
                                                                                ""));
        }
        controller.scope.new_relation = null;
        controller.changeState(Connected);
    } else {
        var index = controller.scope.relations.indexOf(controller.scope.new_relation);
        if (index !== -1) {
            controller.scope.relations.splice(index, 1);
        }
        controller.scope.new_relation = null;
        controller.changeState(Ready);
    }
};
_Connecting.prototype.onMouseUp.transitions = ['Ready', 'Connected'];

_Connected.prototype.start = function (controller) {

    controller.scope.clear_selections();
    controller.changeState(Ready);
};
_Connected.prototype.start.transitions = ['Ready'];
