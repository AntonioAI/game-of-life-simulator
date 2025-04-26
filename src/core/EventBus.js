/**
 * Game of Life Simulator - EventBus Module
 * Implements the Observer pattern for decoupled component communication
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * EventBus class for managing application-wide events
 */
class EventBus {
    constructor() {
        // Map to store event subscriptions
        // Key: event name, Value: array of handler functions
        this.subscriptions = new Map();
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - The name of the event to subscribe to
     * @param {Function} handler - The handler function to call when the event is published
     * @returns {Function} Unsubscribe function that can be called to remove the subscription
     */
    subscribe(eventName, handler) {
        if (!this.subscriptions.has(eventName)) {
            this.subscriptions.set(eventName, []);
        }
        
        const handlers = this.subscriptions.get(eventName);
        handlers.push(handler);
        
        // Return an unsubscribe function
        return () => {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        };
    }
    
    /**
     * Publish an event
     * @param {string} eventName - The name of the event to publish
     * @param {any} data - Optional data to pass to the event handlers
     */
    publish(eventName, data) {
        if (!this.subscriptions.has(eventName)) {
            return; // No subscribers, nothing to do
        }
        
        const handlers = this.subscriptions.get(eventName);
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * Remove all subscriptions for an event
     * @param {string} eventName - The name of the event to clear
     */
    clear(eventName) {
        if (eventName) {
            this.subscriptions.delete(eventName);
        } else {
            this.subscriptions.clear();
        }
    }
}

// Create a singleton instance
const eventBus = new EventBus();

export default eventBus;

// Event name constants for consistency
export const Events = {
    // Game state events
    SIMULATION_STARTED: 'simulation.started',
    SIMULATION_PAUSED: 'simulation.paused',
    SIMULATION_RESET: 'simulation.reset',
    SIMULATION_STEPPED: 'simulation.stepped',
    
    // Update events
    GENERATION_UPDATED: 'generation.updated',
    GRID_UPDATED: 'grid.updated',
    SPEED_UPDATED: 'speed.updated',
    GRID_RESIZED: 'grid.resized',
    BOUNDARY_CHANGED: 'boundary.changed',
    
    // User interaction events
    CELL_TOGGLED: 'cell.toggled',
    PATTERN_SELECTED: 'pattern.selected',
    
    // Configuration events
    CONFIG_UPDATED: 'config.updated',
    RENDERING_CONFIG_UPDATED: 'config.rendering.updated'
}; 