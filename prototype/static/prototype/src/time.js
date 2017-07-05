var inherits = require('inherits');
var fsm = require('./fsm.js');
var messages = require('./messages.js');

function _State () {
}
inherits(_State, fsm._State);

function _Past () {
    this.name = 'Past';
}
inherits(_Past, _State);
var Past = new _Past();
exports.Past = Past;

function _Start () {
    this.name = 'Start';
}
inherits(_Start, _State);
var Start = new _Start();
exports.Start = Start;

function _Present () {
    this.name = 'Present';
}
inherits(_Present, _State);
var Present = new _Present();
exports.Present = Present;

_Past.prototype.start = function (controller) {

    controller.scope.time_pointer = controller.scope.history.length - 1;
};


_Past.prototype.onMessage = function(controller, msg_type, message) {

    //console.log(message.data);
    var type_data = JSON.parse(message.data);
    var type = type_data[0];
    var data = type_data[1];

    if (['TableCreate',
         'TableDestroy',
         'TableMove',
         'TableLabelEdit',
         'RelationCreate',
         'RelationDestroy'].indexOf(type) !== -1) {
        controller.changeState(Present);
        controller.scope.history.splice(controller.scope.time_pointer);
        if (data.sender !== controller.scope.client_id) {
            controller.handle_message(msg_type, message);
        } else {
            controller.scope.history.push(message.data);
        }
    } else {
        controller.handle_message(type, data);
    }
};

_Past.prototype.onTableSelected = function(controller, msg_type, message) {
    if (message.sender !== controller.scope.client_id) {
        controller.scope.onTableSelected(message);
    }
};
_Past.prototype.onTableUnSelected = function(controller, msg_type, message) {
    if (message.sender !== controller.scope.client_id) {
        controller.scope.onTableUnSelected(message);
    }
};

_Past.prototype.onUndo = function(controller, msg_type, message) {
    if (message.sender !== controller.scope.client_id) {
        controller.scope.time_pointer = Math.max(0, controller.scope.time_pointer - 1);
        controller.scope.undo(message.original_message);
    }
};
_Past.prototype.onRedo = function(controller, msg_type, message) {
    if (message.sender !== controller.scope.client_id) {
        controller.scope.time_pointer = Math.min(controller.scope.history.length, controller.scope.time_pointer + 1);
        controller.scope.redo(message.original_message);
        if (controller.scope.time_pointer === controller.scope.history.length) {
            controller.changeState(Present);
        }
    }
};


_Past.prototype.onMultipleMessage = function(controller, msg_type, message) {
        var i = 0;
        console.log(['MultipleMessage', message]);
        if (message.sender !== controller.scope.client_id) {
            for (i=0; i< message.messages.length; i++) {
                controller.handle_message(message.messages[i].msg_type, message.messages[i]);
            }
        }
};

_Past.prototype.onMouseWheel = function (controller, msg_type, message) {

    var $event = message[0];
    var delta = message[1];

    if ($event.originalEvent.metaKey) {
        //console.log(delta);
        if (delta < 0) {
            this.undo(controller);
        } else if (delta > 0) {
            this.redo(controller);
        }
    } else {
        controller.next_controller.handle_message(msg_type, message);
    }

};
_Past.prototype.onMouseWheel.transitions = ['Past'];

_Past.prototype.onKeyDown = function(controller, msg_type, $event) {

    //console.log($event);

    if ($event.key === 'z' && $event.metaKey && ! $event.shiftKey) {
        this.undo(controller);
        return;
    } else if ($event.key === 'z' && $event.ctrlKey && ! $event.shiftKey) {
        this.undo(controller);
        return;
    } else if ($event.key === 'Z' && $event.metaKey && $event.shiftKey) {
        this.redo(controller);
        return;
    } else if ($event.key === 'Z' && $event.ctrlKey && $event.shiftKey) {
        this.redo(controller);
        return;
    } else {
        controller.next_controller.handle_message(msg_type, $event);
    }
};
_Past.prototype.onKeyDown.transitions = ['Past'];


_Past.prototype.undo = function(controller) {
    //controller.changeState(Past);
    controller.scope.time_pointer = Math.max(0, controller.scope.time_pointer - 1);
    if (controller.scope.time_pointer >= 0) {
        var change = controller.scope.history[controller.scope.time_pointer];
        var type_data = JSON.parse(change);
        controller.scope.send_control_message(new messages.Undo(controller.scope.client_id,
                                                                type_data));


        controller.scope.undo(type_data);
    }
};

_Past.prototype.redo = function(controller) {


    if (controller.scope.time_pointer < controller.scope.history.length) {
        var change = controller.scope.history[controller.scope.time_pointer];
        var type_data = JSON.parse(change);
        controller.scope.send_control_message(new messages.Redo(controller.scope.client_id,
                                                                type_data));
        controller.scope.redo(type_data);
        controller.scope.time_pointer = Math.min(controller.scope.history.length, controller.scope.time_pointer + 1);
        if (controller.scope.time_pointer === controller.scope.history.length) {
            controller.changeState(Present);
        }
    } else {
        controller.changeState(Present);
    }
};

_Start.prototype.start = function (controller) {

    controller.changeState(Present);

};
_Start.prototype.start.transitions = ['Present'];

_Present.prototype.onMessage = function(controller, msg_type, message) {

    //console.log(message.data);
    var type_data = JSON.parse(message.data);
    var type = type_data[0];
    var data = type_data[1];

    if (['TableCreate',
         'TableDestroy',
         'TableMove',
         'TableLabelEdit',
         'RelationCreate',
         'RelationDestroy',
         'ColumnCreate',
         'ColumnDestroy',
         'ColumnLabelEdit',
         'Snapshot'].indexOf(type) !== -1) {

        controller.scope.history.push(message.data);
    }
     controller.handle_message(type, data);
};

_Present.prototype.onTableCreate = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onTableCreate(message);
	}
};
_Present.prototype.onRelationCreate = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onRelationCreate(message);
	}
};
_Present.prototype.onTableMove = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onTableMove(message);
	}
};
_Present.prototype.onTableDestroy = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onTableDestroy(message);
	}
};
_Present.prototype.onTableLabelEdit = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onTableLabelEdit(message);
	}
};
_Present.prototype.onTableSelected = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onTableSelected(message);
	}
};
_Present.prototype.onTableUnSelected = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onTableUnSelected(message);
	}
};
_Present.prototype.onUndo = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.time_pointer = Math.max(0, controller.scope.time_pointer - 1);
		controller.scope.undo(message.original_message);
		controller.changeState(Past);
	}
};
_Present.prototype.onSnapshot = function(controller, msg_type, message) {
	if (message.sender !== controller.scope.client_id) {
		controller.scope.onSnapshot(message);
	}
};
_Present.prototype.onid = function(controller, msg_type, message) {
	controller.scope.onClientId(message);
};
_Present.prototype.onDatabase = function(controller, msg_type, message) {
	controller.scope.onDatabase(message);
};
_Present.prototype.onHistory = function(controller, msg_type, message) {
	controller.scope.onHistory(message);
};

_Present.prototype.onMultipleMessage = function(controller, msg_type, message) {

    var i = 0;
    console.log(['MultipleMessage', message]);
    if (message.sender !== controller.scope.client_id) {
        for (i = 0; i< message.messages.length; i++) {
            controller.handle_message(message.messages[i].msg_type, message.messages[i]);
        }
    }
};

_Present.prototype.onMouseWheel = function (controller, msg_type, message) {

    var $event = message[0];
    var delta = message[1];

    if ($event.originalEvent.metaKey) {
        //console.log(delta);
        if (delta < 0) {
            this.undo(controller);
        }
    } else {
        controller.next_controller.handle_message(msg_type, message);
    }

};
_Present.prototype.onMouseWheel.transitions = ['Past'];

_Present.prototype.onKeyDown = function(controller, msg_type, $event) {

    //console.log($event);

    if ($event.key === 'z' && $event.metaKey && ! $event.shiftKey) {
        this.undo(controller);
        return;
    } else if ($event.key === 'z' && $event.ctrlKey && ! $event.shiftKey) {
        this.undo(controller);
        return;
    } else {
        controller.next_controller.handle_message(msg_type, $event);
    }
};
_Present.prototype.onKeyDown.transitions = ['Past'];


_Present.prototype.undo = function(controller) {
    //controller.changeState(Past);
    controller.scope.time_pointer = controller.scope.history.length - 1;
    if (controller.scope.time_pointer >= 0) {
        var change = controller.scope.history[controller.scope.time_pointer];
        var type_data = JSON.parse(change);
        controller.scope.send_control_message(new messages.Undo(controller.scope.client_id,
                                                                type_data));

        controller.scope.undo(type_data);
        controller.changeState(Past);
    }
};
