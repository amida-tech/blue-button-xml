// Karma configuration for e2e tests

module.exports = function (config) {
    config.set({

        basePath: '',

        files: [
            'angulartest/e2e/**/*.js'
        ],

        logLevel: config.LOG_ERROR,

        autoWatch: false,

        browsers: ['Firefox'],

        frameworks: ['ng-scenario'],

        singleRun: true,

        urlRoot: '/_karma_/',

        proxies: {
            '/': 'http://localhost:8080/'
        }

    });
};
