
module.exports = {
    testEnvironment: 'node',

    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text-summary', 'lcov'],


    reporters: [
        'default',
        ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }]
    ],


    moduleNameMapper: {
        '^sqlite3$': '<rootDir>/__mocks__/sqlite3.js',
        '^express-prom-bundle$': '<rootDir>/__mocks__/express-prom-bundle.js'
    }
};
