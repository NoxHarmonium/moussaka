var configReader = require('yaml-config');
var config = configReader.readConfig('config.yaml', 'development');
module.exports = config;