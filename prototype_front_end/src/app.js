
var controller = require('./controller.js');
var cursor = require('./core/cursor.directive.js');
var debug = require('./core/debug.directive.js');
var quadrants = require('./core/quadrants.directive.js');
var upload = require('./button/upload.directive.js');
var download = require('./button/download.directive.js');
var table = require('./database/table.directive.js');
var relation = require('./database/relation.directive.js');


var app = angular.module('triangular', ['monospaced.mousewheel'])
                 .controller('MainCtrl', controller.MainCtrl)
                 .directive('cursor', cursor.cursor)
                 .directive('debug', debug.debug)
                 .directive('quadrants', quadrants.quadrants)
                 .directive('upload', upload.upload)
                 .directive('download', download.download)
                 .directive('table', table.table)
                 .directive('relation', relation.relation);

exports.app = app;
