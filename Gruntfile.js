module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        qunit: {
            files: ['test/index.html']
        },

        curl: {
            "npm-install": {
                src: 'http://builds.emberjs.com/tags/v1.2.0-beta.4/ember.js',
                dest: 'node_modules/ember.js/ember.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('npm-install', ['curl:npm-install']);
    grunt.registerTask('test', 'qunit');
};