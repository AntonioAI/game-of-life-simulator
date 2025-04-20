# Implementation Plan: Fix Duplicate Mobile Detection Code

## Issue Description
The mobile device detection code is implemented twice - once in the Renderer class and once in the HTML file's inline script. This violates the DRY (Don't Repeat Yourself) principle and can lead to inconsistencies if one implementation is updated but the other is not.

## Current Implementation

**In the Renderer class (`src/rendering/Renderer.js`):**
```javascript
detectMobileDevice() {
    return (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
}
```

**In the inline script in `index.html`:**
```javascript
function isMobileDevice() {
    return (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
}
```

## Implementation Steps

### Step 1: Create a Utility Module for Device Detection
1. Create a new directory `src/utils` if it doesn't already exist
2. Create a new file `src/utils/DeviceDetector.js` with the following content:
```javascript
/**
 * Utility module for device detection
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Check if the current device is a mobile device
 * @returns {boolean} True if on a mobile device
 */
export function isMobileDevice() {
    return (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
}

/**
 * Set up mobile detection and apply appropriate CSS class to document
 */
export function setupMobileDetection() {
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.remove('mobile-device');
    }
}

/**
 * Initialize device detection
 * Should be called when the DOM is loaded
 */
export function initDeviceDetection() {
    // Apply mobile detection immediately
    setupMobileDetection();
    
    // Handle device orientation changes
    window.addEventListener('orientationchange', () => {
        // Add a small delay to allow the browser to update dimensions
        setTimeout(() => {
            // Trigger resize event to recalculate canvas dimensions
            window.dispatchEvent(new Event('resize'));
        }, 200);
    });
}
```

### Step 2: Update the Renderer Class
1. Open `src/rendering/Renderer.js`
2. Add import for the utility function at the top of the file:
```javascript
import { isMobileDevice } from '../utils/DeviceDetector.js';
```
3. Replace the `detectMobileDevice()` method with a call to the imported function:
```javascript
// Replace this method:
detectMobileDevice() {
    return (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i));
}

// With this code in the constructor:
this.isMobile = isMobileDevice();
```

### Step 3: Update the HTML File
1. Open `index.html`
2. Add a new script import before the existing `main.js` import:
```html
<script type="module" src="src/utils/DeviceDetector.js"></script>
<script type="module" src="src/main.js"></script>
```
3. Replace the inline mobile detection code with a call to the utility function:
```javascript
// Replace this code:
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

// With this code:
import { initDeviceDetection } from './src/utils/DeviceDetector.js';
document.addEventListener('DOMContentLoaded', initDeviceDetection);
```

### Step 4: Testing
1. Test on different browsers (Chrome, Firefox, Safari, Edge)
2. Test on both desktop and mobile devices (or using device emulation in browser dev tools)
3. Verify the following:
   - Mobile detection works correctly (check the `mobile-device` class on the body)
   - The application responds appropriately to orientation changes
   - No console errors appear
   - All mobile-specific features (touch interactions, layout adjustments) still work

## Success Criteria
- The code follows the DRY principle with a single implementation of mobile detection
- The application correctly identifies mobile devices
- All mobile-specific features work as expected
- No regression in functionality or display

## Rollback Plan
If issues arise:
1. Revert the changes to `src/rendering/Renderer.js`
2. Revert the changes to `index.html`
3. Remove the newly created `src/utils/DeviceDetector.js` file
4. Test to ensure the application works correctly with the reverted code 