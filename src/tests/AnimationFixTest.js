/**
 * Game of Life Simulator - Animation Improvements Test
 * Tests the animation frame usage and zoom detection improvements
 * Copyright (c) 2025 Antonio Innocente
 */

import animationManager from '../utils/AnimationManager.js';
import ZoomDetector from '../utils/ZoomDetector.js';

/**
 * Test the AnimationManager and ZoomDetector
 */
function testAnimationImprovements() {
    console.log('=== Testing Animation Improvements ===');
    
    // Test AnimationManager
    testAnimationManager();
    
    // Test ZoomDetector
    testZoomDetector();
    
    console.log('=== Animation Improvements Tests Completed ===');
}

/**
 * Test the AnimationManager functionality
 */
function testAnimationManager() {
    console.log('Testing AnimationManager...');
    
    // Test animation registration
    let counter = 0;
    const animationId = animationManager.register(timestamp => {
        counter++;
        
        // Only run for 10 frames, then unregister
        if (counter >= 10) {
            animationManager.unregister(animationId);
            console.log(`Animation ran for ${counter} frames and was unregistered`);
        }
    }, 'testAnimation');
    
    console.log(`Registered animation with ID: ${animationId}`);
    console.log(`Active animations: ${animationManager.getActiveAnimationCount()}`);
    
    // Add a message after a short delay to verify animation was unregistered
    setTimeout(() => {
        console.log(`After cleanup - Active animations: ${animationManager.getActiveAnimationCount()}`);
        
        // Test pause and resume
        const pauseTestId = animationManager.register(() => {
            console.log('This animation should pause and resume');
        }, 'pauseTest');
        
        // Pause after 100ms
        setTimeout(() => {
            console.log('Pausing animation...');
            animationManager.pause(pauseTestId);
            
            // Resume after another 100ms
            setTimeout(() => {
                console.log('Resuming animation...');
                animationManager.resume(pauseTestId);
                
                // Unregister after another 100ms
                setTimeout(() => {
                    console.log('Unregistering animation...');
                    animationManager.unregister(pauseTestId);
                }, 100);
            }, 100);
        }, 100);
    }, 1000);
}

/**
 * Test the ZoomDetector functionality
 */
function testZoomDetector() {
    console.log('Testing ZoomDetector...');
    
    // Create a zoom detector
    const zoomDetector = new ZoomDetector({
        onZoomChange: (zoomInfo) => {
            console.log(`Zoom changed: ${zoomInfo.oldDpr} -> ${zoomInfo.newDpr} (factor: ${zoomInfo.zoomFactor})`);
        }
    });
    
    // Start listening for zoom changes
    zoomDetector.startListening();
    console.log('ZoomDetector is now listening for zoom changes');
    console.log('Try zooming in/out of your browser to see it work');
    
    // Stop listening after 10 seconds
    setTimeout(() => {
        zoomDetector.stopListening();
        console.log('ZoomDetector stopped listening after 10 seconds');
    }, 10000);
}

// Run tests
window.runAnimationTests = testAnimationImprovements; 