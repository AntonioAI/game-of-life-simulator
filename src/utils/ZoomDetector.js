/**
 * Game of Life Simulator - Zoom Detector Utility
 * Efficient zoom detection without continuous animation loops
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * ZoomDetector class for efficient zoom level detection
 */
export default class ZoomDetector {
    /**
     * Create a zoom detector
     * @param {Object} options - Configuration options
     * @param {Function} options.onZoomChange - Callback function when zoom changes
     * @param {number} [options.debounceTime=100] - Debounce time in milliseconds
     * @param {boolean} [options.useMatchMedia=true] - Whether to use matchMedia API when available
     */
    constructor(options = {}) {
        // Callback to execute when zoom level changes
        this.onZoomChange = options.onZoomChange || (() => {});
        
        // Debounce time for zoom events
        this.debounceTime = options.debounceTime || 100;
        
        // Whether to use matchMedia when available
        this.useMatchMedia = options.useMatchMedia !== false;
        
        // Store last known device pixel ratio
        this.lastDevicePixelRatio = window.devicePixelRatio || 1;
        
        // Timeout reference for debouncing events
        this.debounceTimeout = null;
        
        // Media query list for detecting zoom
        this.mediaQueryList = null;
        
        // Boolean to track if we're actively listening
        this.isListening = false;
        
        // Bind methods to current instance
        this.checkZoom = this.checkZoom.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMediaChange = this.handleMediaChange.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }
    
    /**
     * Start listening for zoom changes
     */
    startListening() {
        // Prevent multiple listeners
        if (this.isListening) {
            return;
        }
        
        this.isListening = true;
        
        // Initial check to establish baseline
        this.lastDevicePixelRatio = window.devicePixelRatio || 1;
        
        // Prioritize matchMedia for better performance
        if (this.useMatchMedia && window.matchMedia) {
            // Only use matchMedia if it's available and supported
            try {
                this.setupMatchMediaDetection();
                // If matchMedia is working correctly, don't add additional event listeners
                return;
            } catch (e) {
                console.warn('Error setting up matchMedia for zoom detection:', e);
                // Fall back to other methods
            }
        }
        
        // Add resize event as fallback if matchMedia is not available
        window.addEventListener('resize', this.handleResize, { passive: true });
        
        // Add wheel event only for Firefox which has issues with resize events for detecting zoom
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
            window.addEventListener('wheel', this.handleWheel, { passive: true });
        }
    }
    
    /**
     * Stop listening for zoom changes
     */
    stopListening() {
        if (!this.isListening) {
            return;
        }
        
        this.isListening = false;
        
        // Clean up all event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('wheel', this.handleWheel);
        
        // Clean up media query listeners
        if (this.mediaQueryList) {
            // Use only standard event listener method
            this.mediaQueryList.removeEventListener?.('change', this.handleMediaChange);
            this.mediaQueryList = null;
        }
        
        // Clear any pending timeouts
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        this.stopListening();
    }
    
    /**
     * Set up detection using matchMedia API
     * @private
     */
    setupMatchMediaDetection() {
        // Clean up previous media query listeners
        if (this.mediaQueryList) {
            // Use only standard event listener method
            this.mediaQueryList.removeEventListener?.('change', this.handleMediaChange);
        }
        
        // Create a media query based on device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        this.mediaQueryList = window.matchMedia(`(resolution: ${dpr}dppx)`);
        
        // Add the listener using standard method
        if (!this.mediaQueryList.addEventListener) {
            // If addEventListener not available, throw error to fall back to other methods
            throw new Error('matchMedia API does not support standard event listeners');
        }
        
        this.mediaQueryList.addEventListener('change', this.handleMediaChange);
    }
    
    /**
     * Handle resize events
     * @private
     */
    handleResize() {
        // Debounce the check to avoid performance issues during continuous resize
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.checkZoom();
            this.debounceTimeout = null;
        }, this.debounceTime);
    }
    
    /**
     * Handle media query change events
     * @private
     */
    handleMediaChange() {
        // When the resolution media query changes, it's a zoom event
        this.checkZoom();
        
        // Re-setup the media query since the DPR has changed
        try {
            this.setupMatchMediaDetection();
        } catch (e) {
            console.warn('Error updating matchMedia for zoom detection:', e);
        }
    }
    
    /**
     * Handle wheel events (primarily for Firefox zoom detection)
     * @param {WheelEvent} event - The wheel event
     * @private
     */
    handleWheel(event) {
        // Only handle zooming (Ctrl+wheel)
        if (event.ctrlKey) {
            // Debounce the check
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }
            
            this.debounceTimeout = setTimeout(() => {
                this.checkZoom();
                this.debounceTimeout = null;
            }, this.debounceTime);
        }
    }
    
    /**
     * Check if zoom level has changed
     * @private
     */
    checkZoom() {
        // Get current device pixel ratio
        const currentDpr = window.devicePixelRatio || 1;
        
        // Compare with last known value
        if (Math.abs(currentDpr - this.lastDevicePixelRatio) > 0.001) {
            // Store the new value
            const oldDpr = this.lastDevicePixelRatio;
            this.lastDevicePixelRatio = currentDpr;
            
            // Calculate zoom factor (relative to previous)
            const zoomFactor = currentDpr / oldDpr;
            
            // Execute callback with zoom information
            this.onZoomChange({
                oldDpr,
                newDpr: currentDpr,
                zoomFactor
            });
        }
    }
    
    /**
     * Get current device pixel ratio
     * @returns {number} Current device pixel ratio
     */
    getCurrentDpr() {
        return window.devicePixelRatio || 1;
    }
} 