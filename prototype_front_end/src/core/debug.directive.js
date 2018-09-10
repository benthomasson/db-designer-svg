
const templateUrl = require('~core/debug.partial.svg');

var debug = function() {
  return { restrict: 'A', templateUrl};
};
exports.debug = debug;
