module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'reports',
            outputName: 'junit.xml',
            addFileAttribute: 'true',
            ancestorSeparator: ' › '
        }]
    ],
    collectCoverageFrom: [
        'index.js',
        '*.js',
        '!jest.config.js',
        '!**/__tests__/**'
    ],
    coverageDirectory: 'coverage'
};
