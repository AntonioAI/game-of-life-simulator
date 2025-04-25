/**
 * Game of Life Simulator - Touch Handler Module
 * Responsible for touch-specific behaviors and optimizations
 * Copyright (c) 2025 Antonio Innocente
 */

import { isMobileDevice } from './DeviceUtils.js';

/**
 * Set up touch handlers to prevent unwanted browser behaviors on mobile
 */
export function setupTouchHandlers() {
    // Prevent double-tap zoom on iOS and other mobile browsers
    document.addEventListener('touchstart', (event) => {
        // Prevent default behavior for interactive elements to avoid zoom
        if (event.target.tagName === 'BUTTON' || 
            event.target.tagName === 'INPUT' || 
            event.target.tagName === 'CANVAS' ||
            event.target.tagName === 'SELECT') {
            event.preventDefault();
        }
    }, { passive: false });
    
    // Prevent pinch zoom on the canvas element
    const canvas = document.querySelector('.game-canvas');
    if (canvas) {
        canvas.addEventListener('touchmove', (event) => {
            // Check if multiple touches (pinch gesture)
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });
    }
}

/**
 * Initialize all touch handlers
 */
export function initTouchHandlers() {
    // Add mobile device class if needed
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    }
    
    // Only set up touch handlers if touch is available
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setupTouchHandlers();
    }
} 