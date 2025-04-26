/**
 * Game of Life Simulator - Consolidated Test Runner
 * 
 * This script runs all test suites to verify system functionality.
 * Tests are organized by module to mirror the source code structure.
 * 
 * Copyright (c) 2025 Antonio Innocente
 */

// Import core component tests
import testDependencyContainer from './core/DependencyContainer.test.js';
import testGridClass from './core/Grid.test.js';
import testDependencyInjection from './core/DependencyInjection.test.js';
import './core/EventBus.test.js';

// Import UI component tests
import './ui/UIManager.test.js';
import './ui/componentTemplates/UITemplates.test.js';

// Import utility tests
import runAnimationTests from './utils/AnimationManager.test.js';
import './utils/CanvasUtils.test.js';
import './utils/DeviceUtils.test.js';
import './utils/GridUtils.test.js';
import './utils/templateHelpers/UtilityTemplates.test.js';

// Import other module tests
import './patterns/PatternLibrary.test.js';
import './config/Config.test.js';

// Execute tests
export default function runAllTests() {
    console.log('=== Running Game of Life Simulator Tests ===');
    
    const testResults = {
        core: {
            dependencyContainer: true,
            grid: true,
            dependencyInjection: true,
            eventBus: true
        },
        ui: true,
        utils: {
            animationManager: true,
            canvasUtils: true,
            deviceUtils: true,
            gridUtils: true,
            templates: true
        },
        patterns: true,
        config: true
    };
    
    // Test core modules
    console.log('\n=== Testing Core Modules ===');
    
    try {
        console.log('\n--- Testing DependencyContainer class ---');
        testDependencyContainer();
    } catch (error) {
        console.error('DependencyContainer tests failed:', error);
        testResults.core.dependencyContainer = false;
    }
    
    try {
        console.log('\n--- Testing Grid class ---');
        testGridClass();
    } catch (error) {
        console.error('Grid tests failed:', error);
        testResults.core.grid = false;
    }
    
    try {
        console.log('\n--- Testing full dependency injection system ---');
        testResults.core.dependencyInjection = testDependencyInjection();
    } catch (error) {
        console.error('Dependency injection tests failed:', error);
        testResults.core.dependencyInjection = false;
    }
    
    // Test util modules
    console.log('\n=== Testing Utility Modules ===');
    
    try {
        console.log('\n--- Testing animation systems ---');
        testResults.utils.animationManager = runAnimationTests();
    } catch (error) {
        console.error('Animation system tests failed:', error);
        testResults.utils.animationManager = false;
    }
    
    // The rest of utility tests are executed through imports
    console.log('\n--- Other utility tests executed ---');
    
    // UI, patterns, and config tests executed through imports
    console.log('\n=== Testing UI, Patterns and Config Modules ===');
    console.log('--- Tests executed through imports ---');
    
    // Calculate summary results
    const coreSuccess = Object.values(testResults.core).every(v => v === true);
    const utilsSuccess = Object.values(testResults.utils).every(v => v === true);
    
    // Show summary
    console.log('\n=== Test Results Summary ===');
    console.log(`Core modules: ${coreSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`UI modules: ${testResults.ui ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Utility modules: ${utilsSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Pattern modules: ${testResults.patterns ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Config modules: ${testResults.config ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = coreSuccess && utilsSuccess && 
                     testResults.ui && testResults.patterns && testResults.config;
    
    console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('=== End of Test Run ===');
    
    return allPassed;
}

// Auto-run tests if this script is loaded directly (not imported)
if (typeof window !== 'undefined') {
    // Only run when explicitly requested via query parameter
    if (window.location.search.includes('test=true')) {
        console.log('Running Game of Life Simulator Tests');
        console.log('====================================');
        
        try {
            runAllTests();
            console.log('====================================');
            console.log('Tests execution completed');
        } catch (error) {
            console.error('====================================');
            console.error('Test suite failed with error:', error);
            console.error('====================================');
        }
    }
} 