# Implementation Plan: Modularize Inline Scripts

## Issue Description
The HTML file contains a large amount of JavaScript code directly embedded as inline scripts. This violates the modern best practice of separating concerns and makes the code harder to maintain, test, and debug. It also contradicts the cursor rule "use-modern-clean-code" which emphasizes modular code with clear, concise syntax.

## Current Implementation

Currently, the `index.html` file contains several inline script blocks, including:

1. Year setting:
```javascript
// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();
```

2. Mobile device detection:
```javascript
// Check if device is mobile
function isMobileDevice() {
    return (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
}

// Add mobile device class if needed
if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
}
```

3. Touch event handling:
```javascript
// Prevent double-tap zoom on iOS and other mobile browsers
document.addEventListener('touchstart', function(event) {
    if (event.target.tagName === 'BUTTON' || 
        event.target.tagName === 'INPUT' || 
        event.target.tagName === 'CANVAS' ||
        event.target.tagName === 'SELECT') {
        event.preventDefault();
    }
}, { passive: false });
```

4. Orientation change handling:
```javascript
// Handle device orientation changes
window.addEventListener('orientationchange', function() {
    // Add a small delay to allow the browser to update dimensions
    setTimeout(function() {
        // Trigger resize event to recalculate canvas dimensions
        window.dispatchEvent(new Event('resize'));
    }, 200);
});
```

5. iOS viewport fix:
```javascript
// Fix for iOS 100vh issue (where 100vh includes the address bar)
function setVhProperty() {
    // Set CSS custom property based on the actual inner height
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Run on load and resize
window.addEventListener('resize', setVhProperty);
setVhProperty();
```

6. Zoom detection:
```javascript
// Monitor for browser zoom changes
let lastPixelRatio = window.devicePixelRatio || 1;

function checkForZoom() {
    const currentPixelRatio = window.devicePixelRatio || 1;
    
    // If the pixel ratio has changed, the user likely zoomed
    if (Math.abs(currentPixelRatio - lastPixelRatio) > 0.001) {
        lastPixelRatio = currentPixelRatio;
        window.dispatchEvent(new Event('resize'));
    }
    
    // Continue checking
    requestAnimationFrame(checkForZoom);
}

// Start monitoring for zoom
checkForZoom();
```

## Implementation Steps

### Step 1: Create Browser Handlers Module
1. Create a new file `src/ui/BrowserHandlers.js` with the following content:

```javascript
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
 * Setup zoom detection
 * Detects browser zoom changes and triggers a resize event
 * @param {Function} onZoomChange - Optional callback when zoom changes
 */
export function setupZoomDetection(onZoomChange) {
    let lastPixelRatio = window.devicePixelRatio || 1;
    let zoomCheckEnabled = true;
    
    // More efficient zoom detection using matchMedia when available
    if (window.matchMedia) {
        // Create a media query that detects resolution changes
        const mediaQuery = window.matchMedia(`(resolution: ${lastPixelRatio}dppx)`);
        
        // Add a listener for resolution changes (which includes zoom)
        mediaQuery.addEventListener('change', () => {
            const currentPixelRatio = window.devicePixelRatio || 1;
            
            // Only trigger if the change is significant
            if (Math.abs(currentPixelRatio - lastPixelRatio) > 0.001) {
                lastPixelRatio = currentPixelRatio;
                
                // Trigger resize event
                window.dispatchEvent(new Event('resize'));
                
                // Call callback if provided
                if (typeof onZoomChange === 'function') {
                    onZoomChange(currentPixelRatio);
                }
            }
        });
    } else {
        // Fallback for browsers without matchMedia support
        const checkForZoom = () => {
            // Skip if zoom check is disabled
            if (!zoomCheckEnabled) return;
            
            const currentPixelRatio = window.devicePixelRatio || 1;
            
            // If the pixel ratio has changed, the user likely zoomed
            if (Math.abs(currentPixelRatio - lastPixelRatio) > 0.001) {
                lastPixelRatio = currentPixelRatio;
                
                // Trigger resize event
                window.dispatchEvent(new Event('resize'));
                
                // Call callback if provided
                if (typeof onZoomChange === 'function') {
                    onZoomChange(currentPixelRatio);
                }
            }
            
            // Continue checking at a reduced rate (every 500ms instead of every frame)
            setTimeout(() => {
                requestAnimationFrame(checkForZoom);
            }, 500);
        };
        
        // Start monitoring for zoom
        requestAnimationFrame(checkForZoom);
    }
    
    // Return methods to control the zoom detection
    return {
        // Disable zoom check (useful when app is not visible)
        disable: () => {
            zoomCheckEnabled = false;
        },
        // Enable zoom check
        enable: () => {
            zoomCheckEnabled = true;
        }
    };
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
    
    // Set up zoom detection
    setupZoomDetection();
}
```

### Step 2: Create Touch Handler Module
1. Create a new file `src/utils/TouchHandler.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Touch Handler Module
 * Responsible for touch-specific behaviors and optimizations
 * Copyright (c) 2025 Antonio Innocente
 */

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
    // Only set up touch handlers if touch is available
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        setupTouchHandlers();
    }
}
```

### Step 3: Update index.html
1. Open `index.html`
2. Remove all inline scripts
3. Add import for the new modules before the existing main.js import:

```html
<!DOCTYPE html>
<!--
  Game of Life Simulator
  Copyright (c) 2025 Antonio Innocente
-->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Interactive Game of Life simulator with customizable patterns and controls">
    <title>Game of Life Simulator</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <a href="/" class="back-to-projects transition-background">← Back to Projects</a>
    <div class="layout-container">
        <!-- HTML content remains the same -->
        <!-- ... -->
    </div>

    <!-- Import modules in the correct order -->
    <script type="module" src="src/utils/TouchHandler.js"></script>
    <script type="module" src="src/ui/BrowserHandlers.js"></script>
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

### Step 4: Update the Main Module to Initialize Browser Handlers
1. Open `src/main.js`
2. Add imports for the browser and touch handlers at the top:

```javascript
import { initBrowserHandlers } from './ui/BrowserHandlers.js';
import { initTouchHandlers } from './utils/TouchHandler.js';
```

3. Add initialization code at the beginning of the `initialize` function:

```javascript
const initialize = () => {
    // Initialize browser and touch handlers
    initBrowserHandlers();
    initTouchHandlers();
    
    // Existing initialization code...
};
```

### Step 5: Create Module Initialization File
1. Create a new file `src/init.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Initialization Module
 * Responsible for initializing all browser-related functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import { initBrowserHandlers } from './ui/BrowserHandlers.js';
import { initTouchHandlers } from './utils/TouchHandler.js';

// Initialize all browser-related functionality immediately
document.addEventListener('DOMContentLoaded', () => {
    initBrowserHandlers();
    initTouchHandlers();
});
```

2. Update `index.html` to import this file first:

```html
<script type="module" src="src/init.js"></script>
<script type="module" src="src/main.js"></script>
```

3. Remove the initialization code added to main.js in Step 4

### Step 6: Testing
1. Test the application in various browsers:
   - Chrome
   - Firefox
   - Safari
   - Edge
   
2. Test on mobile devices:
   - iOS (iPhone and iPad)
   - Android
   
3. Verify the following functionality:
   - The current year shows correctly in the footer
   - The page layout adjusts correctly when orientation changes
   - Touch interactions work as expected without double-tap zoom issues
   - The viewport height calculation works correctly on iOS devices
   - Zoom detection functions properly
   - No console errors appear

## Success Criteria
- All inline scripts are removed from the HTML file
- Functionality is organized into dedicated modules
- The code is more maintainable, testable, and follows best practices
- All functionality still works correctly across different browsers and devices
- No performance regression is observed

## Rollback Plan
If issues arise:
1. Revert the changes to `index.html`
2. Remove the newly created module files
3. Test to ensure the application works correctly with the reverted code
4. Analyze the issues encountered and develop a new approach 