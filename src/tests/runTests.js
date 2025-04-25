/**
 * Game of Life Simulator - Test Runner
 * 
 * This script runs all test suites to verify system functionality.
 * Add additional test imports as new modules are developed.
 * 
 * Copyright (c) 2025 Antonio Innocente
 */

import testDependencyContainer from './testDependencyContainer.js';
import testGridClass from './Grid.test.js';

// Run all tests
console.log('Running Game of Life Simulator Tests');
console.log('====================================');

try {
    // Run DependencyContainer tests
    testDependencyContainer();
    
    // Run Grid tests
    testGridClass();
    
    // Add additional test suite executions here
    
    console.log('====================================');
    console.log('All tests completed successfully ✓');
} catch (error) {
    console.error('====================================');
    console.error('Test suite failed with error:', error);
    console.error('====================================');
} 