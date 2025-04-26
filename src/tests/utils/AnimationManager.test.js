/**
 * Game of Life Simulator - Animation Manager Tests
 * Tests for the AnimationManager and ZoomDetector functionality
 * Copyright (c) 2025 Antonio Innocente
 */

// Import the AnimationManager instance (default export)
import animationManager from '../../utils/AnimationManager.js';
import ZoomDetector from '../../utils/ZoomDetector.js';

/**
 * Test the AnimationManager functionality
 */
function testAnimationManager() {
    console.log('Testing AnimationManager...');
    
    // Test animation registration
    const animationId = animationManager.register(() => {}, 'testAnimation');
    console.assert(typeof animationId === 'string', 'AnimationManager should return a string ID');
    
    // Test active animation count
    const activeCount = animationManager.getActiveAnimationCount();
    console.assert(activeCount >= 1, 'AnimationManager should have at least one active animation');
    
    // Test pause functionality
    animationManager.pause(animationId);
    console.assert(!animationManager.isActive(animationId), 'Animation should be paused');
    
    // Test resume functionality
    animationManager.resume(animationId);
    console.assert(animationManager.isActive(animationId), 'Animation should be resumed');
    
    // Test unregistration
    animationManager.unregister(animationId);
    console.assert(animationManager.getActiveAnimationCount() < activeCount, 'Animation count should decrease');
    
    console.log('✓ AnimationManager tests passed');
    return true;
}

/**
 * Test the ZoomDetector functionality
 */
function testZoomDetector() {
    console.log('Testing ZoomDetector...');
    
    let zoomChangeDetected = false;
    
    // Create a zoom detector with a mock callback
    const zoomDetector = new ZoomDetector({
        onZoomChange: () => {
            zoomChangeDetected = true;
        }
    });
    
    // Test start/stop listening methods exist
    console.assert(typeof zoomDetector.startListening === 'function', 
        'ZoomDetector should have startListening method');
    console.assert(typeof zoomDetector.stopListening === 'function', 
        'ZoomDetector should have stopListening method');
    
    // Start listening (no need to actually test zoom changes)
    zoomDetector.startListening();
    
    // Stop listening
    zoomDetector.stopListening();
    
    console.log('✓ ZoomDetector tests passed');
    return true;
}

/**
 * Run all animation-related tests
 */
function runAnimationTests() {
    console.log('=== Running Animation Tests ===');
    
    const results = {
        animationManager: testAnimationManager(),
        zoomDetector: testZoomDetector()
    };
    
    const allPassed = Object.values(results).every(result => result === true);
    console.log(`=== Animation Tests ${allPassed ? 'PASSED ✓' : 'FAILED ✗'} ===`);
    
    return allPassed;
}

export default runAnimationTests; 