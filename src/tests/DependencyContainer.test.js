/**
 * Game of Life Simulator - DependencyContainer Tests
 * Tests for the dependency container functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import DependencyContainer from '../core/DependencyContainer.js';

// Test classes
class TestDependency {
    constructor() {
        this.value = 'test';
    }
}

class DependentClass {
    constructor(dependencies = {}) {
        this.dependency = dependencies.testDependency;
    }
}

// Test the dependency container
function testDependencyContainer() {
    const container = new DependencyContainer();
    
    // Test registration and resolution
    container.register('testDependency', TestDependency, true);
    const instance1 = container.resolve('testDependency');
    const instance2 = container.resolve('testDependency');
    
    console.assert(instance1 instanceof TestDependency, 'Instance should be of TestDependency type');
    console.assert(instance1 === instance2, 'Singleton instances should be identical');
    
    // Test dependency resolution
    container.register('dependentClass', DependentClass, false, ['testDependency']);
    const dependent = container.resolve('dependentClass');
    
    console.assert(dependent.dependency === instance1, 'Dependent class should receive the correct dependency');
    
    // Test resetting singletons
    container.resetSingletons();
    const instance3 = container.resolve('testDependency');
    
    console.assert(instance1 !== instance3, 'After reset, singleton instances should be different');
    
    console.log('All DependencyContainer tests passed!');
    return true;
}

// Export the test function
export default testDependencyContainer; 