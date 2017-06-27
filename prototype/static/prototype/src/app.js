
//console.log = function () { };
var app = angular.module('triangular', ['monospaced.mousewheel']);
var fsm = require('./fsm.js');
var view = require('./view.js');
var move = require('./move.js');
var relation = require('./relation.js');
var buttons = require('./buttons.js');
var time = require('./time.js');
var util = require('./util.js');
var models = require('./models.js');
var messages = require('./messages.js');

app.controller('MainCtrl', function($scope, $document, $location, $window) {

  $scope.database_id = $location.search().database_id || 0;
  // Create a web socket to connect to the backend server
  $scope.control_socket = new window.ReconnectingWebSocket("ws://" + window.location.host + "/prototype?database_id=" + $scope.database_id,
                                                           null,
                                                           {debug: false, reconnectInterval: 300});
  $scope.history = [];
  $scope.client_id = 0;
  $scope.onMouseDownResult = "";
  $scope.onMouseUpResult = "";
  $scope.onMouseEnterResult = "";
  $scope.onMouseLeaveResult = "";
  $scope.onMouseMoveResult = "";
  $scope.onMouseMoveResult = "";
  $scope.current_scale = 1.0;
  $scope.panX = 0;
  $scope.panY = 0;
  $scope.mouseX = 0;
  $scope.mouseY = 0;
  $scope.scaledX = 0;
  $scope.scaledY = 0;
  $scope.pressedX = 0;
  $scope.pressedY = 0;
  $scope.pressedScaledX = 0;
  $scope.pressedScaledY = 0;
  $scope.lastPanX = 0;
  $scope.lastPanY = 0;
  $scope.selected_tables = [];
  $scope.selected_relations = [];
  $scope.new_relation = null;
  $scope.view_controller = new fsm.FSMController($scope, view.Start, null);
  $scope.move_controller = new fsm.FSMController($scope, move.Start, $scope.view_controller);
  $scope.relation_controller = new fsm.FSMController($scope, relation.Start, $scope.move_controller);
  $scope.buttons_controller = new fsm.FSMController($scope, buttons.Start, $scope.relation_controller);
  $scope.time_controller = new fsm.FSMController($scope, time.Start, $scope.buttons_controller);
  $scope.first_controller = $scope.time_controller;
  $scope.last_key = "";
  $scope.last_key_code = null;
  $scope.last_event = null;
  $scope.cursor = {'x':100, 'y': 100, 'hidden': false};

  $scope.debug = {'hidden': true};
  $scope.hide_buttons = false;
  $scope.graph = {'width': window.innerWidth,
                  'right_column': window.innerWidth - 300,
                  'height': window.innerHeight};
  $scope.table_id_seq = util.natural_numbers(0);
  $scope.message_id_seq = util.natural_numbers(0);
  $scope.time_pointer = -1;
  $scope.frame = 0;


  $scope.tables = [];

  $scope.relations = [];



    // Utility functions

    // Accepts a MouseEvent as input and returns the x and y
    // coordinates relative to the target element.
    var getCrossBrowserElementCoords = function (mouseEvent)
    {
      var result = {
        x: 0,
        y: 0
      };

      if (!mouseEvent)
      {
        mouseEvent = window.event;
      }

      if (mouseEvent.pageX || mouseEvent.pageY)
      {
        result.x = mouseEvent.pageX;
        result.y = mouseEvent.pageY;
      }
      else if (mouseEvent.clientX || mouseEvent.clientY)
      {
        result.x = mouseEvent.clientX + document.body.scrollLeft +
          document.documentElement.scrollLeft;
        result.y = mouseEvent.clientY + document.body.scrollTop +
          document.documentElement.scrollTop;
      }

      return result;
    };

    var getMouseEventResult = function (mouseEvent) {
      var coords = getCrossBrowserElementCoords(mouseEvent);
      return "(" + coords.x + ", " + coords.y + ")";
    };

    $scope.updateScaledXY = function() {
        $scope.scaledX = ($scope.mouseX - $scope.panX) / $scope.current_scale;
        $scope.scaledY = ($scope.mouseY - $scope.panY) / $scope.current_scale;
    };

    $scope.updatePanAndScale = function() {
        var g = document.getElementById('frame_g');
        g.setAttribute('transform','translate(' + $scope.panX + ',' + $scope.panY + ') scale(' + $scope.current_scale + ')');
    };

    $scope.clear_selections = function () {

        var i = 0;
        var tables = $scope.tables;
        var relations = $scope.relations;
        $scope.selected_tables = [];
        $scope.selected_relations = [];
        for (i = 0; i < tables.length; i++) {
            if (tables[i].selected) {
                $scope.send_control_message(new messages.TableUnSelected($scope.client_id, tables[i].id));
            }
            tables[i].selected = false;
        }
        for (i = 0; i < relations.length; i++) {
            relations[i].selected = false;
        }
    };

    $scope.select_tables = function (multiple_selection) {

        var i = 0;
        var tables = $scope.tables;
        var last_selected_table = null;

        $scope.pressedX = $scope.mouseX;
        $scope.pressedY = $scope.mouseY;
        $scope.pressedScaledX = $scope.scaledX;
        $scope.pressedScaledY = $scope.scaledY;

        if (!multiple_selection) {
            $scope.clear_selections();
        }

        for (i = tables.length - 1; i >= 0; i--) {
            if (tables[i].is_selected($scope.scaledX, $scope.scaledY)) {
                tables[i].selected = true;
                $scope.send_control_message(new messages.TableSelected($scope.client_id, tables[i].id));
                last_selected_table = tables[i];
                if ($scope.selected_tables.indexOf(tables[i]) === -1) {
                    $scope.selected_tables.push(tables[i]);
                }
                if (!multiple_selection) {
                    break;
                }
            }
        }
        return last_selected_table;
    };

    $scope.forget_time = function () {
        $scope.history.splice($scope.time_pointer);
    };


    // Event Handlers

    $scope.onMouseDown = function ($event) {
      $scope.last_event = $event;
      $scope.first_controller.state.onMouseDown($scope.first_controller, $event);
      $scope.onMouseDownResult = getMouseEventResult($event);
	  $event.preventDefault();
    };

    $scope.onMouseUp = function ($event) {
      $scope.last_event = $event;
      $scope.first_controller.state.onMouseUp($scope.first_controller, $event);
      $scope.onMouseUpResult = getMouseEventResult($event);
	  $event.preventDefault();
    };

    $scope.onMouseEnter = function ($event) {
      $scope.onMouseEnterResult = getMouseEventResult($event);
      $scope.cursor.hidden = false;
	  $event.preventDefault();
    };

    $scope.onMouseLeave = function ($event) {
      $scope.onMouseLeaveResult = getMouseEventResult($event);
      $scope.cursor.hidden = true;
	  $event.preventDefault();
    };

    $scope.onMouseMove = function ($event) {
      var coords = getCrossBrowserElementCoords($event);
      $scope.cursor.hidden = false;
      $scope.cursor.x = coords.x;
      $scope.cursor.y = coords.y;
      $scope.mouseX = coords.x;
      $scope.mouseY = coords.y;
      $scope.updateScaledXY();
      $scope.first_controller.state.onMouseMove($scope.first_controller, $event);
      $scope.onMouseMoveResult = getMouseEventResult($event);
	  $event.preventDefault();
    };

    $scope.onMouseOver = function ($event) {
      $scope.onMouseOverResult = getMouseEventResult($event);
      $scope.cursor.hidden = false;
	  $event.preventDefault();
    };

    $scope.onMouseWheel = function ($event, delta, deltaX, deltaY) {
      $scope.last_event = $event;
      $scope.first_controller.state.onMouseWheel($scope.first_controller, $event, delta, deltaX, deltaY);
      event.preventDefault();
    };

    $scope.onKeyDown = function ($event) {
        $scope.last_event = $event;
        $scope.last_key = $event.key;
        $scope.last_key_code = $event.keyCode;
        $scope.first_controller.state.onKeyDown($scope.first_controller, $event);
        $scope.$apply();
        $event.preventDefault();
    };

    $document.bind("keydown", $scope.onKeyDown);

    // Button Event Handlers

    $scope.send_snapshot = function () {
        var data = JSON.stringify(['Snapshot', {"sender": $scope.client_id,
                                                "tables": $scope.tables,
                                                "relations": $scope.relations,
                                                "scale": $scope.scale,
                                                "panX": $scope.panX,
                                                "panY": $scope.panY,
                                                "message_id": $scope.message_id_seq()}]);
        $scope.control_socket.send(data);
    };

    $scope.onDeployButton = function (button) {
        console.log(button.name);
    };

    // Buttons

    $scope.buttons = [];



    $scope.onTableCreate = function(data) {
        $scope.create_table(data);
    };

    $scope.create_table = function(data) {
        var table = new models.Table(data.id,
                                       data.name,
                                       data.x,
                                       data.y,
                                       data.type);
        $scope.table_id_seq = util.natural_numbers(data.id);
        $scope.tables.push(table);
    };

    $scope.onTableLabelEdit = function(data) {
        $scope.edit_table_label(data);
    };

    $scope.edit_table_label = function(data) {
        var i = 0;
        for (i = 0; i < $scope.tables.length; i++) {
            if ($scope.tables[i].id === data.id) {
                $scope.tables[i].name = data.name;
                break;
            }
        }
    };

    $scope.onRelationCreate = function(data) {
        $scope.create_relation(data);
    };

    $scope.create_relation = function(data) {
        var i = 0;
        var new_relation = new models.Relation(null, null);
        for (i = 0; i < $scope.tables.length; i++){
            if ($scope.tables[i].id === data.from_id) {
                new_relation.from_table = $scope.tables[i];
            }
        }
        for (i = 0; i < $scope.tables.length; i++){
            if ($scope.tables[i].id === data.to_id) {
                new_relation.to_table = $scope.tables[i];
            }
        }
        if (new_relation.from_table !== null && new_relation.to_table !== null) {
            $scope.relations.push(new_relation);
        }
    };

    $scope.onRelationDestroy = function(data) {
        $scope.destroy_relation(data);
    };

    $scope.destroy_relation = function(data) {
        var i = 0;
        var relation = null;
        var index = -1;
        for (i = 0; i < $scope.relations.length; i++) {
            relation = $scope.relations[i];
            if (relation.from_table.id === data.from_id && relation.to_table.id === data.to_id) {
                index = $scope.relations.indexOf(relation);
                $scope.relations.splice(index, 1);
            }
        }
    };

    $scope.onTableMove = function(data) {
        $scope.move_tables(data);
    };

    $scope.move_tables = function(data) {
        var i = 0;
        for (i = 0; i < $scope.tables.length; i++) {
            if ($scope.tables[i].id === data.id) {
                $scope.tables[i].x = data.x;
                $scope.tables[i].y = data.y;
                break;
            }
        }
    };

    $scope.onTableDestroy = function(data) {
        $scope.destroy_table(data);
    };

    $scope.destroy_table = function(data) {

        // Delete the table and any relations connecting to the table.
        var i = 0;
        var j = 0;
        var dindex = -1;
        var lindex = -1;
        var tables = $scope.tables.slice();
        var all_relations = $scope.relations.slice();
        for (i = 0; i < tables.length; i++) {
            if (tables[i].id === data.id) {
                dindex = $scope.tables.indexOf(tables[i]);
                if (dindex !== -1) {
                    $scope.tables.splice(dindex, 1);
                }
                lindex = -1;
                for (j = 0; j < all_relations.length; j++) {
                    if (all_relations[j].to_table === tables[i] ||
                        all_relations[j].from_table === tables[i]) {
                        lindex = $scope.relations.indexOf(all_relations[j]);
                        if (lindex !== -1) {
                            $scope.relations.splice(lindex, 1);
                        }
                    }
                }
            }
        }
    };

    $scope.redo = function(type_data) {
        var type = type_data[0];
        var data = type_data[1];

        if (type === "TableMove") {
            $scope.move_tables(data);
        }

        if (type === "TableCreate") {
            $scope.create_table(data);
        }

        if (type === "TableDestroy") {
            $scope.destroy_table(data);
        }

        if (type === "TableLabelEdit") {
            $scope.edit_table_label(data);
        }

        if (type === "RelationCreate") {
            $scope.create_relation(data);
        }

        if (type === "RelationDestroy") {
            $scope.destroy_relation(data);
        }
    };


    $scope.undo = function(type_data) {
        var type = type_data[0];
        var data = type_data[1];
        var inverted_data;

        if (type === "TableMove") {
            inverted_data = angular.copy(data);
            inverted_data.x = data.previous_x;
            inverted_data.y = data.previous_y;
            $scope.move_tables(inverted_data);
        }

        if (type === "TableCreate") {
            $scope.destroy_table(data);
        }

        if (type === "TableDestroy") {
            inverted_data = new messages.TableCreate(data.sender,
                                                      data.id,
                                                      data.previous_x,
                                                      data.previous_y,
                                                      data.previous_name,
                                                      data.previous_type);
            $scope.create_table(inverted_data);
        }

        if (type === "TableLabelEdit") {
            inverted_data = angular.copy(data);
            inverted_data.name = data.previous_name;
            $scope.edit_table_label(inverted_data);
        }

        if (type === "RelationCreate") {
            $scope.destroy_relation(data);
        }

        if (type === "RelationDestroy") {
            $scope.create_relation(data);
        }
    };

    $scope.onClientId = function(data) {
        $scope.client_id = data;
    };

    $scope.onDatabase = function(data) {
        $scope.database_id = data.database_id;
        $scope.panX = data.panX;
        $scope.panY = data.panX;
        $scope.current_scale = data.scale;
        $location.search({database_id: data.database_id});
    };

    $scope.onTableSelected = function(data) {
        var i = 0;
        for (i = 0; i < $scope.tables.length; i++) {
            if ($scope.tables[i].id === data.id) {
                $scope.tables[i].remote_selected = true;
                console.log($scope.tables[i].remote_selected);
            }
        }
    };

    $scope.onTableUnSelected = function(data) {
        var i = 0;
        for (i = 0; i < $scope.tables.length; i++) {
            if ($scope.tables[i].id === data.id) {
                $scope.tables[i].remote_selected = false;
                console.log($scope.tables[i].remote_selected);
            }
        }
    };

    $scope.onHistory = function (data) {

        $scope.history = [];
        var i = 0;
        for (i = 0; i < data.length; i++) {
            //console.log(data[i]);
            $scope.history.push(data[i]);
        }
    };

    $scope.onSnapshot = function (data) {

        //Erase the existing state
        $scope.tables = [];
        $scope.relations = [];

        var table_map = {};
        var i = 0;
        var table = null;
        var new_table = null;
        var max_table_id = null;
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
            new_table = new models.Table(table.id,
                                           table.name,
                                           table.x,
                                           table.y,
                                           table.type);
            $scope.tables.push(new_table);
            table_map[table.id] = new_table;
        }

        //Build the relations
        var relation = null;
        for (i = 0; i < data.relations.length; i++) {
            relation = data.relations[i];
            $scope.relations.push(new models.Relation(table_map[relation.from_table],
                                              table_map[relation.to_table]));
        }

        var diff_x;
        var diff_y;

        // Calculate the new scale to show the entire diagram
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

            $scope.current_scale = Math.min(2, Math.max(0.10, Math.min((window.innerWidth-200)/diff_x, (window.innerHeight-300)/diff_y)));
            $scope.updateScaledXY();
            $scope.updatePanAndScale();
        }
        // Calculate the new panX and panY to show the entire diagram
        if (min_x !== null && min_y !== null) {
            console.log(['min_x', min_x]);
            console.log(['min_y', min_y]);
            diff_x = max_x - min_x;
            diff_y = max_y - min_y;
            $scope.panX = $scope.current_scale * (-min_x - diff_x/2) + window.innerWidth/2;
            $scope.panY = $scope.current_scale * (-min_y - diff_y/2) + window.innerHeight/2;
            $scope.updateScaledXY();
            $scope.updatePanAndScale();
        }

        //Update the table_id_seq to be greater than all table ids to prevent duplicate ids.
        if (max_table_id !== null) {
            console.log(['max_table_id', max_table_id]);
            $scope.table_id_seq = util.natural_numbers(max_table_id);
        }
    };


    $scope.control_socket.onmessage = function(message) {
        console.log(message.data);
        $scope.first_controller.state.onMessage($scope.first_controller, message);
        $scope.$apply();
    };

	$scope.control_socket.onopen = function() {
        //Ignore
	};

	// Call onopen directly if $scope.control_socket is already open
	if ($scope.control_socket.readyState === WebSocket.OPEN) {
		$scope.control_socket.onopen();
	}

    $scope.send_control_message = function (message) {
        if ($scope.history.length === 0) {
            $scope.send_snapshot();
        }
        message.sender = $scope.client_id;
        message.message_id = $scope.message_id_seq();
        var data = messages.serialize(message);
        $scope.control_socket.send(data);
    };


    // End web socket
    //

	angular.element($window).bind('resize', function(){

		$scope.graph.width = $window.innerWidth;
	  	$scope.graph.right_column = $window.innerWidth - 300;
	  	$scope.graph.height = $window.innerHeight;

		// manuall $digest required as resize event
		// is outside of angular
	 	$scope.$digest();
    });

    window.scope = $scope;
});

app.directive('cursor', function() {
  return { restrict: 'A', templateUrl: 'widgets/cursor.html' };
});

app.directive('debug', function() {
  return { restrict: 'A', templateUrl: 'widgets/debug.html' };
});

app.directive('relation', function() {
  return { restrict: 'A', templateUrl: 'widgets/relation.html' };
});

app.directive('table', function() {
  return { restrict: 'A', templateUrl: 'widgets/table.html' };
});

app.directive('quadrants', function() {
  return { restrict: 'A', templateUrl: 'widgets/quadrants.html' };
});

app.directive('button', function() {
  return { restrict: 'A', templateUrl: 'widgets/button.html' };
});


exports.app = app;
