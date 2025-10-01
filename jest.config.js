module.exports = {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.js"],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["lcov", "text-summary"],
    reporters: [
        "default",
        ["jest-junit", { outputDirectory: "reports", outputName: "junit.xml" }]
    ],
    moduleNameMapper: {
        "^sqlite3$": "<rootDir>/__mocks__/sqlite3.js",
        "^express-prom-bundle$": "<rootDir>/__mocks__/express-prom-bundle.js"
    }
};
