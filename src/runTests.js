/**
 * Game of Life Simulator - Test Runner
 * Runs tests for the application
 * Copyright (c) 2025 Antonio Innocente
 */

import testDependencyInjection from './tests/testDependencyInjection.js';
import dependencyContainerTest from './tests/DependencyContainer.test.js';
import verifyMigration from './tests/verifyDependencyContainerMigration.js';

// When this script is run, it will execute the specified tests
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Running Game of Life Simulator Tests ===');
    
    const testResults = {
        dependencyContainer: true,
        dependencyInjection: true,
        migrationVerification: true
    };
    
    try {
        console.log('\n--- Testing DependencyContainer class ---');
        dependencyContainerTest();
    } catch (error) {
        console.error('DependencyContainer tests failed:', error);
        testResults.dependencyContainer = false;
    }
    
    try {
        console.log('\n--- Testing full dependency injection system ---');
        testResults.dependencyInjection = testDependencyInjection();
    } catch (error) {
        console.error('Dependency injection tests failed:', error);
        testResults.dependencyInjection = false;
    }
    
    try {
        console.log('\n--- Verifying migration from ComponentRegistry to DependencyContainer ---');
        testResults.migrationVerification = verifyMigration();
    } catch (error) {
        console.error('Migration verification failed:', error);
        testResults.migrationVerification = false;
    }
    
    // Show summary
    console.log('\n=== Test Results Summary ===');
    for (const [test, passed] of Object.entries(testResults)) {
        console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    }
    
    const allPassed = Object.values(testResults).every(result => result === true);
    console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('=== End of Test Run ===');
}); 