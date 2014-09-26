// Shim jQuery so it isn't global

var jQuery, $;

// Load into global scope
require('jquery');

// Export it
module.exports = jQuery;
