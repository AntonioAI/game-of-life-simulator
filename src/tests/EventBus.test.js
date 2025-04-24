/**
 * Game of Life Simulator - EventBus Tests
 * Tests for the EventBus module
 * Copyright (c) 2025 Antonio Innocente
 */

import eventBus, { Events } from '../core/EventBus.js';

/**
 * Test the EventBus functionality
 */
function testEventBus() {
    console.log('=== Running EventBus Tests ===');
    
    let receivedData = null;
    let callCount = 0;
    
    // Test subscription and publishing
    const unsubscribe = eventBus.subscribe('test.event', (data) => {
        receivedData = data;
        callCount++;
    });
    
    // Publish an event
    eventBus.publish('test.event', { value: 42 });
    
    // Check if the handler was called with the correct data
    console.assert(callCount === 1, 'Handler should be called exactly once');
    console.assert(receivedData.value === 42, 'Handler should receive correct data');
    
    // Test unsubscribe
    unsubscribe();
    eventBus.publish('test.event', { value: 99 });
    
    // Check that handler wasn't called again
    console.assert(callCount === 1, 'Handler should not be called after unsubscribe');
    console.assert(receivedData.value === 42, 'Data should not change after unsubscribe');
    
    // Test multiple subscribers
    let counter1 = 0;
    let counter2 = 0;
    
    eventBus.subscribe('multi.event', () => counter1++);
    eventBus.subscribe('multi.event', () => counter2++);
    
    eventBus.publish('multi.event');
    
    console.assert(counter1 === 1 && counter2 === 1, 'Multiple handlers should be called');
    
    // Test error handling
    let errorThrown = false;
    eventBus.subscribe('error.event', () => {
        errorThrown = true;
        throw new Error('Test error');
    });
    
    // This should not throw to the calling code
    eventBus.publish('error.event');
    
    console.assert(errorThrown, 'Error handler should be called');
    
    // Clear all subscriptions for cleanup
    eventBus.clear();
    
    console.log('All EventBus tests passed!');
}

// Run tests when the script is loaded
testEventBus(); 