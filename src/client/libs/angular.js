// Shim angular so it isn't global

// Include the full jQuery so angular doens't use the 
// light version it comes with
window.$ = window.jQuery = require('jquery');

// Load angular and packages into global scope
require('_angular');
require('_angular-route');
require('_angular-cookies');

module.exports = window.angular;
