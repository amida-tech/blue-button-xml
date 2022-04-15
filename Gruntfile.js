/*global module*/

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-run');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['*.js', './lib/*.js', './browser/lib/*.js', '*.json'],
      options: {
        browser: true,
        smarttabs: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: false,
        boss: true,
        eqnull: true,
        node: true,
        expr: true,
        globals: {
          'it': true,
          'xit': true,
          'describe': true,
          'before': true,
          'after': true,
          'done': true,
          'Document': true
        }
      }
    },
    watch: {
      all: {
        files: ['./lib/*.js', '*.js'],
        tasks: ['default']
      }
    },
    jsbeautifier: {
      beautify: {
        src: ['Gruntfile.js', 'lib/*.js', 'test/*.js', '*.js', '*.json', './browser/lib/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      check: {
        src: ['Gruntfile.js', 'lib/*.js', 'test/*.js', '*.js', './browser/lib/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    run: {
      jest: {
        exec: 'npx jest',
        args: ['test']
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '127.0.0.1'
        }
      }
    }
  });

  grunt.registerTask('default', ['beautify', 'jshint', 'run']);
  grunt.registerTask('beautify', ['jsbeautifier:beautify']);
  grunt.registerTask('commit', ['default']);
  grunt.registerTask('timestamp', function () {
    grunt.log.subhead(Date());
  });
};
