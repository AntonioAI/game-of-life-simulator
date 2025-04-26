/**
 * Game of Life Simulator - Canvas Utilities Tests
 * Tests for CanvasUtils and related helpers
 * Copyright (c) 2025 Antonio Innocente
 */

import * as CanvasUtils from '../../utils/CanvasUtils.js';

function testCanvasUtils() {
    console.log('Testing CanvasUtils...');
    
    // Create a canvas for testing
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    // Test resizeCanvas
    CanvasUtils.resizeCanvas(canvas, 100, 100);
    console.assert(canvas.width === 100, 'Canvas width should be 100px');
    console.assert(canvas.height === 100, 'Canvas height should be 100px');
    
    // Test callback execution
    let callbackExecuted = false;
    CanvasUtils.resizeCanvas(canvas, 200, 200, {
        afterResizeCallback: () => {
            callbackExecuted = true;
        }
    });
    console.assert(callbackExecuted, 'Resize callback should be executed');
    
    // Create a container for the canvas with proper size
    const container = document.createElement('div');
    
    // In a test environment, setting style.width/height might not work as expected
    // We need to mock the container's clientWidth and clientHeight properties
    Object.defineProperties(container, {
        clientWidth: { value: 300, configurable: true },
        clientHeight: { value: 300, configurable: true }
    });
    
    // Move canvas to container
    container.appendChild(canvas);
    
    // Test resizeCanvasToContainer
    CanvasUtils.resizeCanvasToContainer(canvas);
    
    // Debug logging
    console.log(`Container dimensions: ${container.clientWidth}x${container.clientHeight}`);
    console.log(`Canvas dimensions after resize: ${canvas.width}x${canvas.height}`);
    
    console.assert(canvas.width === 300, `Canvas width should match container width (300px), got ${canvas.width}px`);
    console.assert(canvas.height === 300, `Canvas height should match container height (300px), got ${canvas.height}px`);
    
    console.log('CanvasUtils tests completed!');
}

// Run tests
testCanvasUtils(); 