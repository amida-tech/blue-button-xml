/*global module*/

module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-istanbul-coverage');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        jshint: {
            files: ['*.js', './lib/*.js', './browser/lib/*.js'],
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
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: '10000',
                    recursive: true
                },
                src: ['test/*.js']
            }
        },
        coveralls: {
            options: {
                // LCOV coverage file relevant to every target
                src: 'coverage/lcov.info',

                // When true, grunt-coveralls will only print a warning rather than
                // an error, to prevent CI builds from failing unnecessarily (e.g. if
                // coveralls.io is down). Optional, defaults to false.
                force: false
            },
            //your_target: {
            // Target-specific LCOV coverage file
            //src: 'coverage-results/extra-results-*.info'
            //},
        },
        coverage: {
            options: {
                thresholds: {
                    'statements': 50,
                    'branches': 25,
                    'lines': 50,
                    'functions': 50
                },
                dir: 'coverage/',
                root: '.'
            }
        },
        browserify: {
            options: {
                debug: true,
                alias: "./index.js:bbxml"
            },
            dev: {
                src: 'index.js',
                dest: 'browser/dist/bbxml.js'
            }
        },
        copy: {
            main: {
                files: [{
                    cwd: 'bower_components/',
                    expand: true,
                    src: '**',
                    dest: 'test/browserapp/lib/'
                }, {
                    cwd: 'browser',
                    expand: true,
                    src: 'dist/*',
                    dest: 'test/browserapp/lib/'
                }]
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['beautify', 'jshint', 'browserify', 'copy', 'mochaTest', 'karma']);
    //Express omitted for travis build.
    grunt.registerTask('commit', ['jshint', 'mochaTest']);
    grunt.registerTask('mocha', ['mochaTest']);
    grunt.registerTask('timestamp', function () {
        grunt.log.subhead(Date());
    });

    //JS beautifier
    grunt.registerTask('beautify', ['jsbeautifier:beautify']);

};
