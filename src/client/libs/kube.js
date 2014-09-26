// Shim kube so it isn't global and uses shimmed jQuery

// Include the full jQuery so angular doens't use the 
// light version it comes with
window.$ = window.jQuery = require('jquery');

// Load angular and packages into global scope
require('_kube');

// Kube is just a jquery plugin so return jQuery I suppose.
module.exports = window.$;
