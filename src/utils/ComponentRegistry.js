/**
 * Game of Life Simulator - ComponentRegistry Module
 * Helps manage component lifecycle and cleanup
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * ComponentRegistry class for managing component lifecycle
 */
class ComponentRegistry {
    constructor() {
        this.components = new Map();
        
        // Add unload handler
        window.addEventListener('beforeunload', this.handleUnload.bind(this));
    }
    
    /**
     * Register a component
     * @param {string} name - Component name/identifier
     * @param {Object} component - The component instance
     */
    register(name, component) {
        this.components.set(name, component);
        return component; // Return for chaining
    }
    
    /**
     * Get a registered component
     * @param {string} name - Component name/identifier
     * @returns {Object} The component instance
     */
    get(name) {
        return this.components.get(name);
    }
    
    /**
     * Unregister a component
     * @param {string} name - Component name/identifier
     * @returns {boolean} True if component was found and unregistered
     */
    unregister(name) {
        const component = this.components.get(name);
        
        if (component && typeof component.cleanup === 'function') {
            component.cleanup();
        }
        
        return this.components.delete(name);
    }
    
    /**
     * Clean up all components
     * Calls the cleanup method on each component that has one
     */
    cleanupAll() {
        this.components.forEach(component => {
            if (component && typeof component.cleanup === 'function') {
                try {
                    component.cleanup();
                } catch (error) {
                    console.error(`Error cleaning up component:`, error);
                }
            }
        });
        
        // Clear the registry
        this.components.clear();
    }
    
    /**
     * Handle page unload event
     * @private
     */
    handleUnload() {
        this.cleanupAll();
    }
}

// Create a singleton instance
const componentRegistry = new ComponentRegistry();

export default componentRegistry; 