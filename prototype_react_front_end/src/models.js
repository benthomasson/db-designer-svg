var util = require('./util.js');
var fsm = require('./fsm.js');
var hot_keys_fsm = require('./core/hotkeys.fsm.js');
var time_fsm = require('./core/time.fsm.js');
var view_fsm = require('./core/view.fsm.js');
var buttons_fsm = require('./button/buttons.fsm.js');
var core_messages = require('./core/messages.js');
var button_models = require('./button/models.js');
var database_messages = require('./database/messages.js');
var database_models = require('./database/models.js');
var move_fsm = require('./database/move.fsm.js');
var ReconnectingWebSocket = require('reconnectingwebsocket');
var history = require('history');



function ApplicationScope (svgFrame) {

  //bind functions
  this.select_items = this.select_items.bind(this);
  this.onMouseMove = this.onMouseMove.bind(this);
  this.onMouseUp = this.onMouseUp.bind(this);
  this.onMouseDown = this.onMouseDown.bind(this);
  this.onMouseWheel = this.onMouseWheel.bind(this);
  this.timer = this.timer.bind(this);
  this.onKeyDown = this.onKeyDown.bind(this);
  this.onResize = this.onResize.bind(this);
  this.onHistory = this.onHistory.bind(this);
  this.onDatabase = this.onDatabase.bind(this);
  this.onClientId =  this.onClientId.bind(this);
  this.onSnapshot =  this.onSnapshot.bind(this);
  this.update_offsets =  this.update_offsets.bind(this);
  this.updateScaledXY =  this.updateScaledXY.bind(this);
  this.updatePanAndScale =  this.updatePanAndScale.bind(this);
  this.send_control_message =  this.send_control_message.bind(this);
  this.send_trace_message =  this.send_trace_message.bind(this);
  this.uploadButtonHandler =  this.uploadButtonHandler.bind(this);
  this.downloadButtonHandler =  this.downloadButtonHandler.bind(this);

  var self = this;

  //Initialize variables
  this.svgFrame = svgFrame;
  this.panX = 0;
  this.panY = 0;
  this.current_scale = 1.0;
  this.cursorPosX = 0;
  this.cursorPosY = 0;
  this.mouseX = 0;
  this.mouseY = 0;
  this.scaledX = 0;
  this.scaledY = 0;
  this.pressedX = 0;
  this.pressedY = 0;
  this.pressedScaledX = 0;
  this.pressedScaledY = 0;
  this.frameWidth = 0;
  this.frameHeight = 0;
  this.lastKey = '';
  this.frameNumber = 0;
  this.showDebug = false;
  this.showHelp = true;
  this.showCursor = false;
  this.showButtons = true;
  this.database_id = 0;
  this.client_id = 1;
  this.disconnected = process.env.REACT_APP_DISCONNECTED === 'true';
  this.websocket_host = process.env.REACT_APP_WEBSOCKET_HOST ? process.env.REACT_APP_WEBSOCKET_HOST : window.location.host;
  this.first_channel = null;
  this.history = [];
  this.selected_items = [];
  this.browser_history = history.createHashHistory({hashType: "hashbang"});
  console.log(this.browser_history.location);

  this.selected_tables = [];
  this.selected_columns = [];
  this.selected_relations = [];
  this.last_selected_table = null;
  this.last_selected_column = null;
  this.tables = [];
  this.relations = [];

  var split = this.browser_history.location.pathname.split('/');
  var last = split[split.length - 1];
  var split2 = last.split(':');
  var last2 = split2[split2.length - 1];
  this.database_id = last2;


  //Connect websocket
  if (!this.disconnected) {
    console.log( "ws://" + this.websocket_host + "/ws/prototype?database_id=" + this.database_id);
    this.control_socket = new ReconnectingWebSocket(
      "ws://" + this.websocket_host + "/ws/prototype?database_id=" + this.database_id,
      null,
      {debug: false, reconnectInterval: 300});
    this.control_socket.onmessage = function(message) {
      if (self.first_channel !== null) {
        self.first_channel.send("Message", message);
      }
      console.log(message);
      self.svgFrame.forceUpdate();
    };
  } else {
    this.control_socket = {send: util.noop};
  }

  //Create sequences
  this.trace_order_seq = util.natural_numbers(0);
  this.message_id_seq = util.natural_numbers(0);

  this.table_id_seq = util.natural_numbers(0);
  this.relation_id_seq = util.natural_numbers(0);

  //Create Buttons
  this.buttons_by_name = {
    upload: new button_models.Button("DB", 20, 7, 50, 70, this.uploadButtonHandler, this),
    download: new button_models.Button("DB", 80, 10, 50, 70, this.downloadButtonHandler, this),
  };

  this.buttons = [this.buttons_by_name.upload,
                  this.buttons_by_name.download];

  //Create FSM controllers
  this.hotkeys_controller = new fsm.FSMController(this, 'hot_keys_fsm', hot_keys_fsm.Start, this);
  this.buttons_controller = new fsm.FSMController(this, 'buttons_fsm', buttons_fsm.Start, this);
  this.time_controller = new fsm.FSMController(this, 'time_fsm', time_fsm.Start, this);
  this.view_controller = new fsm.FSMController(this, 'view_fsm', view_fsm.Start, this);
  this.move_controller = new fsm.FSMController(this, 'move_fsm', move_fsm.Start, this);


  //Wire up controllers
  //
  this.controllers = [this.view_controller,
                      this.hotkeys_controller,
                      this.move_controller,
                      this.buttons_controller,
                      this.time_controller];


  for (var i = 0; i < this.controllers.length - 1; i++) {
    var next_controller = this.controllers[i];
    var current_controller = this.controllers[i+1];

    current_controller.delegate_channel = new fsm.Channel(current_controller,
                                                          next_controller,
                                                          this);
  }

  this.first_channel = new fsm.Channel(null,
                                       this.controllers[this.controllers.length - 1],
                                       this);

}
exports.ApplicationScope = ApplicationScope;

ApplicationScope.prototype.uploadButtonHandler = function (message) {
  console.log(message);
  window.open("/prototype/upload?database_id=" + this.database_id, "_top");
};

ApplicationScope.prototype.downloadButtonHandler = function (message) {
  console.log(message);
  window.open("/prototype/download?database_id=" + this.database_id, "_blank");
};

ApplicationScope.prototype.send_trace_message = function (message) {
  console.log(message);
};

ApplicationScope.prototype.send_control_message = function (message) {
  console.log(message);
  message.sender = this.client_id;
  message.message_id = this.message_id_seq();
  var data = core_messages.serialize(message);
  console.log(["Sending", message.msg_type, message.sender, message.message_id]);
  this.control_socket.send(data);
};

ApplicationScope.prototype.setState = function (o) {
  var keys = Object.keys(o);

  for (var i = 0; i < keys.length; i++) {
    this[keys[i]] = o[keys[i]];
  }
};

ApplicationScope.prototype.onMouseMove = function (e) {
  this.first_channel.send('MouseMove', e);
  this.setState({
    cursorPosX: e.pageX,
    cursorPosY: e.pageY,
    mouseX: e.pageX,
    mouseY: e.pageY,
  });

  this.updateScaledXY();

  e.preventDefault();
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.onMouseDown = function (e) {
  this.first_channel.send('MouseDown', e);
  this.setState({
    cursorPosX: e.pageX,
    cursorPosY: e.pageY,
    mouseX: e.pageX,
    mouseY: e.pageY,
  });

  this.updateScaledXY();

  e.preventDefault();
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.onMouseUp = function (e) {
  this.first_channel.send('MouseUp', e);
  this.setState({
    cursorPosX: e.pageX,
    cursorPosY: e.pageY,
    mouseX: e.pageX,
    mouseY: e.pageY,
  });

  this.updateScaledXY();

  e.preventDefault();
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.onMouseWheel = function (e) {
  //console.log(e);
  this.first_channel.send("MouseWheel", [e, e.deltaY]);
  e.preventDefault();
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.onKeyDown = function (e) {
  this.first_channel.send('KeyDown', e);
  this.setState({
    lastKey: e.key
  });

  e.preventDefault();
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.timer = function () {
  this.setState({
    frameNumber: this.frameNumber + 1
  });
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.onResize = function (e) {
   this.setState({
     frameWidth: window.innerWidth,
     frameHeight: window.innerHeight
   });
  this.svgFrame.forceUpdate();
};

ApplicationScope.prototype.clear_selections = function () {
  var i = 0;
  var tables = this.tables;
  var relations = this.relations;
  this.selected_tables = [];
  this.selected_columns = [];
  this.selected_relations = [];
  for (i = 0; i < tables.length; i++) {
      if (tables[i].selected) {
          this.send_control_message(new database_messages.TableUnSelected(this.client_id, tables[i].id));
      }
      tables[i].selected = false;
  }
  for (i = 0; i < relations.length; i++) {
      relations[i].selected = false;
  }
};

ApplicationScope.prototype.select_items = function (multiple_selection) {

        var i = 0;
        var j = 0;
        var tables = this.tables;
        var last_selected_table = null;
        var last_selected_column = null;
        var last_selected_relation = null;

        this.pressedX = this.mouseX;
        this.pressedY = this.mouseY;
        this.pressedScaledX = this.scaledX;
        this.pressedScaledY = this.scaledY;

        if (!multiple_selection) {
            this.clear_selections();
        }

        for (i = tables.length - 1; i >= 0; i--) {
            if (tables[i].is_selected(this.scaledX, this.scaledY)) {
                tables[i].selected = true;
                this.send_control_message(new database_messages.TableSelected(this.client_id, tables[i].id));
                last_selected_table = tables[i];
                if (this.selected_tables.indexOf(tables[i]) === -1) {
                    this.selected_tables.push(tables[i]);
                }
                if (!multiple_selection) {
                    break;
                }
            }
            for (j = 0; j < tables[i].columns.length; j++) {
                if(tables[i].columns[j].is_selected(this.scaledX, this.scaledY)) {
                    tables[i].selected = true;
                    this.send_control_message(new database_messages.TableSelected(this.client_id, tables[i].id));
                    last_selected_table = tables[i];
                    last_selected_column = tables[i].columns[j];
                    if (this.selected_tables.indexOf(tables[i]) === -1) {
                        this.selected_tables.push(tables[i]);
                    }
                    if (this.selected_columns.indexOf(tables[i].columns[j]) === -1) {
                        this.selected_columns.push(tables[i].columns[j]);
                    }
                    if (!multiple_selection) {
                        break;
                    }
                }
            }
        }

		// Do not select relations if a table was selected
        if (last_selected_table === null) {
            for (i = this.relations.length - 1; i >= 0; i--) {
                if(this.relations[i].is_selected(this.scaledX, this.scaledY)) {
                    this.relations[i].selected = true;
                    this.send_control_message(new database_messages.RelationSelected(this.client_id, this.relations[i].id));
                    last_selected_relation = this.relations[i];
                    if (this.selected_relations.indexOf(this.relations[i]) === -1) {
                        this.selected_relations.push(this.relations[i]);
                        if (!multiple_selection) {
                            break;
                        }
                    }
                }
            }
        }

        return {last_selected_table: last_selected_table,
                last_selected_relation: last_selected_relation,
                last_selected_column: last_selected_column};
};

ApplicationScope.prototype.updateScaledXY = function() {
  this.scaledX = (this.mouseX - this.panX) / this.current_scale;
  this.scaledY = (this.mouseY - this.panY) / this.current_scale;
};

ApplicationScope.prototype.updatePanAndScale = function() {
  //var g = document.getElementById('frame_g');
  //g.setAttribute('transform','translate(' + this.panX + ',' + this.panY + ') scale(' + this.current_scale + ')');
};

ApplicationScope.prototype.update_offsets = function () {

  var i = 0;
  var transitions = this.transitions;
  var map = {};
  var transition = null;
  var key = null;
  for (i = 0; i < transitions.length; i++) {
      transition = transitions[i];
      key = "" + transition.from_state.id + "_" + transition.to_state.id;
      map[key] = 0;
  }
  for (i = 0; i < transitions.length; i++) {
      transition = transitions[i];
      key = "" + transition.from_state.id + "_" + transition.to_state.id;
      transition.offset = map[key];
      map[key] = transition.offset + 1;
  }
};

ApplicationScope.prototype.onHistory = function (data) {

  this.history = [];
  var i = 0;
  for (i = 0; i < data.length; i++) {
      //console.log(data[i]);
      this.history.push(data[i]);
  }
};

ApplicationScope.prototype.onDatabase = function(data) {
  this.database_id = data.database_id;
  this.panX = data.panX;
  this.panY = data.panX;
  this.current_scale = data.scale;
  this.table_id_seq = util.natural_numbers(data.table_id_seq);
  this.relation_id_seq = util.natural_numbers(data.relation_id_seq);
  var path_data = {pathname: '/database_id:' + data.database_id}
  if (this.browser_history.location.pathname !== path_data.pathname) {
    this.browser_history.push(path_data);
  }
};

ApplicationScope.prototype.onClientId = function(data) {
  this.client_id = data;
};


ApplicationScope.prototype.onSnapshot = function (data) {

  //Erase the existing state
  this.tables = [];
  this.relations = [];

  var table_map = {};
  var i = 0;
  var table = null;
  var new_table = null;
  var max_table_id = null;
  var max_relation_id = null;
  var min_x = null;
  var min_y = null;
  var max_x = null;
  var max_y = null;

  //Build the tables
  for (i = 0; i < data.tables.length; i++) {
      table = data.tables[i];
      if (max_table_id === null || table.id > max_table_id) {
          max_table_id = table.id;
      }
      if (min_x === null || table.x < min_x) {
          min_x = table.x;
      }
      if (min_y === null || table.y < min_y) {
          min_y = table.y;
      }
      if (max_x === null || table.x > max_x) {
          max_x = table.x;
      }
      if (max_y === null || table.y > max_y) {
          max_y = table.y;
      }
      new_table = new database_models.Table(table.id,
                                     table.name,
                                     table.x,
                                     table.y,
                                     table.type);
      new_table.column_id_seq = util.natural_numbers(data.tables[i].column_id_seq);
      this.tables.push(new_table);
      table_map[table.id] = new_table;
  }

  //Build the columns
  var column = null;

  for (i = 0; i < data.columns.length; i++) {
      column = data.columns[i];
      table_map[column.table__id].columns.push(new database_models.Column(table_map[column.table__id],
                                                                column.id,
                                                                column.name,
                                                                column.type));

  }


  //Build the relations
  var relation = null;
  for (i = 0; i < data.relations.length; i++) {
      relation = data.relations[i];
      if (max_relation_id === null || relation.id > max_relation_id) {
          max_relation_id = relation.id;
      }
      this.relations.push(new database_models.Relation(relation.id, table_map[relation.from_table].get_column(relation.from_column),
                                        table_map[relation.to_table].get_column(relation.to_column)));
  }

  for (i = 0; i < data.tables.length; i++) {
      this.tables[i].update_positions();
  }

  // Calculate the new scale to show the entire diagram

  var diff_x;
  var diff_y;
  if (min_x !== null && min_y !== null && max_x !== null && max_y !== null) {
      console.log(['min_x', min_x]);
      console.log(['min_y', min_y]);
      console.log(['max_x', max_x]);
      console.log(['max_y', max_y]);

      diff_x = max_x - min_x;
      diff_y = max_y - min_y;
      console.log(['diff_x', diff_x]);
      console.log(['diff_y', diff_y]);

      console.log(['ratio_x', window.innerWidth/diff_x]);
      console.log(['ratio_y', window.innerHeight/diff_y]);

      this.current_scale = Math.min(2, Math.max(0.10, Math.min((window.innerWidth-200)/diff_x, (window.innerHeight-300)/diff_y)));
      this.updateScaledXY();
      this.updatePanAndScale();
  }
  // Calculate the new panX and panY to show the entire diagram
  if (min_x !== null && min_y !== null) {
      console.log(['min_x', min_x]);
      console.log(['min_y', min_y]);
      diff_x = max_x - min_x;
      diff_y = max_y - min_y;
      this.panX = this.current_scale * (-min_x - diff_x/2) + window.innerWidth/2;
      this.panY = this.current_scale * (-min_y - diff_y/2) + window.innerHeight/2;
      this.updateScaledXY();
      this.updatePanAndScale();
  }

  //Update the table_id_seq to be greater than all table ids to prevent duplicate ids.
  if (max_table_id !== null) {
      console.log(['max_table_id', max_table_id]);
      this.table_id_seq = util.natural_numbers(max_table_id);
  }
};
