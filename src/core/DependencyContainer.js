/**
 * Game of Life Simulator - Dependency Container Module
 * Responsible for managing dependencies between components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * DependencyContainer class for managing application dependencies
 */
class DependencyContainer {
    constructor() {
        // Map to store registered dependencies
        this.dependencies = new Map();
        
        // Map to store singleton instances
        this.singletons = new Map();
        
        // Add unload handler
        window.addEventListener('beforeunload', this.handleUnload.bind(this));
    }
    
    /**
     * Register a dependency
     * @param {string} name - The name of the dependency
     * @param {Function|Object} implementation - The implementation (class or object)
     * @param {boolean} isSingleton - Whether this should be a singleton instance
     * @param {Array} dependencies - Dependencies required for this implementation
     */
    register(name, implementation, isSingleton = false, dependencies = []) {
        this.dependencies.set(name, {
            implementation,
            isSingleton,
            dependencies
        });
    }
    
    /**
     * Resolve a dependency
     * @param {string} name - The name of the dependency to resolve
     * @returns {Object} The resolved dependency
     */
    resolve(name) {
        // Check if the dependency is registered
        if (!this.dependencies.has(name)) {
            throw new Error(`Dependency '${name}' is not registered`);
        }
        
        const dependency = this.dependencies.get(name);
        
        // If it's a singleton and we already have an instance, return it
        if (dependency.isSingleton && this.singletons.has(name)) {
            return this.singletons.get(name);
        }
        
        // Resolve any dependencies recursively
        const resolvedDependencies = {};
        for (const dep of dependency.dependencies) {
            resolvedDependencies[dep] = this.resolve(dep);
        }
        
        // Create the instance
        let instance;
        
        if (typeof dependency.implementation === 'function') {
            // It's a class constructor
            instance = new dependency.implementation(resolvedDependencies);
        } else {
            // It's an object
            instance = dependency.implementation;
        }
        
        // If it's a singleton, store the instance
        if (dependency.isSingleton) {
            this.singletons.set(name, instance);
        }
        
        return instance;
    }
    
    /**
     * Reset all singleton instances
     */
    resetSingletons() {
        this.singletons.clear();
    }
    
    /**
     * Get a singleton instance directly if it exists
     * @param {string} name - The name of the dependency
     * @returns {Object|null} The singleton instance or null if not found
     */
    getSingleton(name) {
        return this.singletons.get(name) || null;
    }
    
    /**
     * Cleanup all registered singleton instances
     * Calls the cleanup method on each instance that has one
     */
    cleanupAll() {
        this.singletons.forEach((instance) => {
            if (instance && typeof instance.cleanup === 'function') {
                try {
                    instance.cleanup();
                } catch (error) {
                    console.error(`Error cleaning up instance:`, error);
                }
            }
        });
    }
    
    /**
     * Handle page unload event
     * @private
     */
    handleUnload() {
        this.cleanupAll();
    }
}

export default DependencyContainer; 