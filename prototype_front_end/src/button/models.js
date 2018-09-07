var fsm = require('../fsm.js');
var util = require('../util.js');
var button = require('./button.fsm.js');

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

Button.prototype.is_selected = util.rectangle_is_selected;
