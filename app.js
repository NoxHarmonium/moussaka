(function (require, module) {
  'use strict';

  // Bootstrap the server
  var serverModule = require('./server.js');
  serverModule.start(function (err, server) {
    if (err === null) {
      console.log('Error Starting Server. Terminating process.'.red);
      return process.exit(1);
    }
    console.log('Server Started'.green);
  });

})(require, module);
