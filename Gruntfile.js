module.exports = function(grunt) {

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jshint: {
         files: ['Gruntfile.js', 'app.js', 'api_modules/*.js', 'tests/*.js', 'schemas/*.js', 'routes/*.js'],
         options: {
            globals: {
               console: true,
               modules: true,
               document: true
            }
         }
      }
   });


   grunt.loadNpmTasks('grunt-contrib-jshint');
  
   grunt.registerTask('default', ['jshint']);


};
