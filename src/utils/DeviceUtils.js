/**
 * Game of Life Simulator - Device Utilities
 * Utility functions for device detection and handling
 * Copyright (c) 2025 Antonio Innocente
 */

// Mobile breakpoint in pixels
const MOBILE_BREAKPOINT = 768;

/**
 * Check if the current device is a mobile device
 * @param {number} breakpoint - Width in pixels that defines a mobile device (defaults to 768)
 * @returns {boolean} - True if the device is a mobile device
 */
function isMobileDevice(breakpoint = MOBILE_BREAKPOINT) {
    return (
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) ||
        window.innerWidth <= breakpoint
    );
}

/**
 * Add a window resize listener that detects device type changes
 * @param {Function} callback - Function to call when device type changes
 * @returns {Function} - Function to remove the event listener
 */
function addDeviceTypeChangeListener(callback) {
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
    }
    
    let isMobile = isMobileDevice();
    
    const handleResize = () => {
        const newIsMobile = isMobileDevice();
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            callback(isMobile);
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Return function to remove the listener
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}

// Export utility functions
export {
    isMobileDevice,
    addDeviceTypeChangeListener,
    MOBILE_BREAKPOINT
}; 