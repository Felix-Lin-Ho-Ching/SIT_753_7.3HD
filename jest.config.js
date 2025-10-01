module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    reporters: [
        'default',
        ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }]
    ],
    coverageDirectory: 'coverage',
    collectCoverage: true,
    coverageReporters: ['lcov', 'text-summary']
};
