/**
 * Game of Life Simulator - Browser Handlers Module
 * Responsible for browser-specific behaviors and optimizations
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Set the current year in the footer copyright text
 */
export function setCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Fix for iOS 100vh issue (where 100vh includes the address bar)
 * Sets a CSS custom property that can be used instead of vh units
 */
export function setViewportHeight() {
    // Set CSS custom property based on the actual inner height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Handle device orientation changes
 * Recalculates dimensions after an orientation change
 */
export function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        // Add a small delay to allow the browser to update dimensions
        setTimeout(() => {
            // Trigger resize event to recalculate canvas dimensions
            window.dispatchEvent(new Event('resize'));
            
            // Update viewport height
            setViewportHeight();
        }, 200);
    });
}

/**
 * Initialize all browser handlers
 */
export function initBrowserHandlers() {
    // Set current year in footer
    setCurrentYear();
    
    // Set up viewport height fix
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    // Set up orientation change handler
    handleOrientationChange();
} 