/**
 * Game of Life Simulator - DeviceUtils Tests
 * Tests for device utility functions
 * Copyright (c) 2025 Antonio Innocente
 */

import { isMobileDevice, MOBILE_BREAKPOINT } from '../utils/DeviceUtils.js';

function testDeviceUtils() {
    console.log('Testing DeviceUtils...');
    
    // Test isMobileDevice based on window width
    const originalInnerWidth = window.innerWidth;
    
    // Mock window.innerWidth for testing
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: MOBILE_BREAKPOINT - 1  // Just below the breakpoint
    });
    
    console.assert(isMobileDevice(), 
        `Device should be detected as mobile when width is ${window.innerWidth}px (below ${MOBILE_BREAKPOINT}px)`);
    
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: MOBILE_BREAKPOINT + 1  // Just above the breakpoint
    });
    
    console.assert(!isMobileDevice(), 
        `Device should not be detected as mobile when width is ${window.innerWidth}px (above ${MOBILE_BREAKPOINT}px)`);
    
    // Reset window.innerWidth to original value
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth
    });
    
    console.log('DeviceUtils tests completed!');
}

// Run tests
testDeviceUtils(); 