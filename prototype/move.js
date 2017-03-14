var inherits = require('inherits');
var fsm = require('./fsm.js');

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




_Ready.prototype.onMouseDown = function (controller, $event) {

    var last_selected_device = controller.scope.select_devices($event.shiftKey);

    if (last_selected_device !== null) {
        controller.changeState(Selected1);
    } else {
        controller.next_controller.state.onMouseDown(controller.next_controller, $event);
    }
};



_Start.prototype.start = function (controller) {

    controller.changeState(Ready);

};



_Selected2.prototype.onMouseDown = function (controller, $event) {

    controller.changeState(Ready);
    controller.state.onMouseDown(controller, $event);
};

_Selected2.prototype.onKeyDown = function (controller, $event) {

    console.log($event.keyCode);

    if ($event.keyCode === 8) {
        controller.changeState(Ready);

        var i = 0;
        var j = 0;
        var index = -1;
        var devices = controller.scope.selected_devices;
        var all_links = controller.scope.links.slice();
        controller.scope.selected_devices = [];
        controller.scope.selected_links = [];
        for (i = 0; i < devices.length; i++) {
            index = controller.scope.devices.indexOf(devices[i]);
            if (index !== -1) {
                controller.scope.devices.splice(index, 1);
            }
            for (j = 0; j < all_links.length; j++) {
                if (all_links[j].to_device === devices[i] ||
                    all_links[j].from_device === devices[i]) {
                    index = controller.scope.links.indexOf(all_links[j]);
                    if (index !== -1) {
                        controller.scope.links.splice(index, 1);
                    }
                }
            }
        }
    }
};


_Selected1.prototype.onMouseMove = function (controller) {

    controller.changeState(Move);

};

_Selected1.prototype.onMouseUp = function (controller) {

    controller.changeState(Selected2);

};

_Selected1.prototype.onMouseDown = function () {

};

_Move.prototype.onMouseMove = function (controller) {

    var devices = controller.scope.selected_devices;

    var diffX = controller.scope.scaledX - controller.scope.pressedScaledX;
    var diffY = controller.scope.scaledY - controller.scope.pressedScaledY;
    var i = 0;
    for (i = 0; i < devices.length; i++) {
        devices[i].x = devices[i].x + diffX;
        devices[i].y = devices[i].y + diffY;
    }
    controller.scope.pressedScaledX = controller.scope.scaledX;
    controller.scope.pressedScaledY = controller.scope.scaledY;
};


_Move.prototype.onMouseUp = function (controller, $event) {

    controller.changeState(Selected2);
    controller.state.onMouseUp(controller, $event);
};

