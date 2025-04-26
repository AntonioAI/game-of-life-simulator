/**
 * Game of Life Simulator - Dependency Container Comprehensive Tests
 * 
 * Tests the functionality of the DependencyContainer module
 * 
 * Copyright (c) 2025 Antonio Innocente
 */

import DependencyContainer from '../../core/DependencyContainer.js';

/**
 * Test suite for DependencyContainer
 */
function testDependencyContainer() {
    console.log('\nTesting DependencyContainer...');
    
    // Create a new container for testing
    const container = new DependencyContainer();
    
    try {
        // Test 1: Basic registration and resolution
        console.log('  Test 1: Basic registration and resolution');
        
        class TestComponent {
            constructor() {
                this.value = 'test-value';
            }
        }
        
        container.register('testComponent', TestComponent);
        const instance = container.resolve('testComponent');
        
        if (!(instance instanceof TestComponent)) {
            throw new Error('Failed to resolve component instance');
        }
        
        if (instance.value !== 'test-value') {
            throw new Error('Resolved instance has incorrect property value');
        }
        
        console.log('  ✓ Basic registration and resolution passed');
        
        // Test 2: Singleton behavior
        console.log('  Test 2: Singleton behavior');
        
        class SingletonComponent {
            constructor() {
                this.id = Math.random(); // Random ID to identify instance
            }
        }
        
        container.register('singletonComponent', SingletonComponent, true);
        
        const singleton1 = container.resolve('singletonComponent');
        const singleton2 = container.resolve('singletonComponent');
        
        if (singleton1.id !== singleton2.id) {
            throw new Error('Singleton instances are different');
        }
        
        console.log('  ✓ Singleton behavior passed');
        
        // Test 3: Dependency injection
        console.log('  Test 3: Dependency injection');
        
        class DependentComponent {
            constructor(deps) {
                this.dependency = deps.singletonComponent;
            }
        }
        
        container.register('dependentComponent', DependentComponent, false, ['singletonComponent']);
        
        const dependentInstance = container.resolve('dependentComponent');
        
        if (!dependentInstance.dependency || dependentInstance.dependency.id !== singleton1.id) {
            throw new Error('Dependency injection failed');
        }
        
        console.log('  ✓ Dependency injection passed');
        
        // Test 4: Error handling for missing dependencies
        console.log('  Test 4: Error handling for missing dependencies');
        
        let errorThrown = false;
        try {
            container.resolve('nonExistentComponent');
        } catch (error) {
            errorThrown = true;
            if (!error.message.includes('not registered')) {
                throw new Error('Expected error message about dependency not being registered');
            }
        }
        
        if (!errorThrown) {
            throw new Error('Failed to throw error for non-existent dependency');
        }
        
        console.log('  ✓ Error handling passed');
        
        // Test 5: Reset singletons
        console.log('  Test 5: Reset singletons');
        
        container.resetSingletons();
        const singleton3 = container.resolve('singletonComponent');
        
        if (singleton3.id === singleton1.id) {
            throw new Error('Singleton was not properly reset');
        }
        
        console.log('  ✓ Reset singletons passed');
        
        // Test 6: Direct singleton access
        console.log('  Test 6: Direct singleton access');
        
        const directAccess = container.getSingleton('singletonComponent');
        
        if (!directAccess || directAccess.id !== singleton3.id) {
            throw new Error('Direct singleton access failed');
        }
        
        const nullSingleton = container.getSingleton('nonExistentSingleton');
        
        if (nullSingleton !== null) {
            throw new Error('getSingleton should return null for non-existent singletons');
        }
        
        console.log('  ✓ Direct singleton access passed');
        
        // Test 7: Cleanup functionality
        console.log('  Test 7: Cleanup functionality');
        
        let cleanupCalled = false;
        
        class CleanableComponent {
            constructor() {}
            cleanup() {
                cleanupCalled = true;
            }
        }
        
        container.register('cleanableComponent', CleanableComponent, true);
        container.resolve('cleanableComponent'); // Create instance
        container.cleanupAll();
        
        if (!cleanupCalled) {
            throw new Error('Cleanup method was not called');
        }
        
        console.log('  ✓ Cleanup functionality passed');
        
        // All tests passed
        console.log('✓ All DependencyContainer tests passed');
    } catch (error) {
        console.error(`❌ DependencyContainer test failed: ${error.message}`);
        throw error;
    }
}

export default testDependencyContainer; 