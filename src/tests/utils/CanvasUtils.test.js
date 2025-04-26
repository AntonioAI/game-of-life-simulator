/**
 * Game of Life Simulator - CanvasUtils Tests
 * Tests for canvas utility functions
 * Copyright (c) 2025 Antonio Innocente
 */

import { resizeCanvas, resizeCanvasToContainer } from '../utils/CanvasUtils.js';

function testCanvasUtils() {
    console.log('Testing CanvasUtils...');
    
    // Create a canvas for testing
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    // Test resizeCanvas
    resizeCanvas(canvas, 100, 100);
    console.assert(canvas.width === 100, 'Canvas width should be 100px');
    console.assert(canvas.height === 100, 'Canvas height should be 100px');
    
    // Test callback execution
    let callbackExecuted = false;
    resizeCanvas(canvas, 200, 200, {
        afterResizeCallback: () => {
            callbackExecuted = true;
        }
    });
    console.assert(callbackExecuted, 'Resize callback should be executed');
    
    // Create a container for the canvas
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Move canvas to container
    container.appendChild(canvas);
    
    // Test resizeCanvasToContainer
    resizeCanvasToContainer(canvas);
    console.assert(canvas.width === 300, 'Canvas width should match container width (300px)');
    console.assert(canvas.height === 300, 'Canvas height should match container height (300px)');
    
    // Clean up
    document.body.removeChild(container);
    
    console.log('CanvasUtils tests completed!');
}

// Run tests
testCanvasUtils(); 