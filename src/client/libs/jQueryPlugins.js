// Shim jquery plugins so they aren't global and use shimmed jQuery

// Pull jQuery into global
window.$ = window.jQuery = require('jquery');

// Put all the bower loaded jquery plugins here

require('_tabslet');

// jQuery plugins don't really return anything so
// just return jQuery
module.exports = window.$;
