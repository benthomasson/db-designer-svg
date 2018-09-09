
var controller = require('./controller.js');


var app = angular.module('triangular', ['monospaced.mousewheel']);

app.controller('MainCtrl', controller.MainCtrl);

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

app.directive('download', function() {
      return { restrict: 'A', templateUrl: 'widgets/download.svg' };
});

app.directive('upload', function() {
      return { restrict: 'A', templateUrl: 'widgets/upload.svg' };
});


exports.app = app;
