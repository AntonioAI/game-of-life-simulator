# Implementation Plan: Fix Global Animation Frame Usage

## Issue Description
The codebase contains a recursive `requestAnimationFrame` loop in the `checkForZoom()` function that runs continuously, even when not necessary. This creates unnecessary CPU load and can negatively impact performance and battery life, especially on mobile devices. According to the "emphasize-performance-optimization" rule, we need to ensure all simulation logic is optimized and efficient.

## Current Implementation

Currently, in `src/main.js`, zoom detection is handled with a continuous animation frame loop along with event listeners:

```javascript
// Track last known device pixel ratio to detect zoom changes
let lastDevicePixelRatio = window.devicePixelRatio || 1;

// Add window resize handler for responsive behavior with debounce
let resizeTimeout;
window.addEventListener('resize', () => {
    // Debounce resize events to avoid excessive redraws
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Check if device pixel ratio changed (browser zoom)
        const currentDpr = window.devicePixelRatio || 1;
        if (currentDpr !== lastDevicePixelRatio) {
            lastDevicePixelRatio = currentDpr;
            console.log('Browser zoom changed, recalculating canvas dimensions');
        }
        
        // Use the proper resizeCanvas method with grid parameter
        renderer.resizeCanvas(grid);
    }, 100);
});

// Add specific handler for zoom changes (mainly for Firefox)
window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        // This is likely a zoom event
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentDpr = window.devicePixelRatio || 1;
            if (currentDpr !== lastDevicePixelRatio) {
                lastDevicePixelRatio = currentDpr;
                renderer.resizeCanvas(grid);
            }
        }, 100);
    }
}, { passive: false });
```

In addition, there might be other places in the codebase where `requestAnimationFrame` is used inefficiently, creating continuous loops that should be more carefully controlled.

## Implementation Steps

### Step 1: Create a ZoomDetector Utility
1. Create a new file `src/utils/ZoomDetector.js` with an event-based approach:

```javascript
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
        
        // Set up the most efficient detection method available
        if (this.useMatchMedia && window.matchMedia) {
            this.setupMatchMediaDetection();
        }
        
        // Add event listeners as fallbacks or additional detection
        window.addEventListener('resize', this.handleResize);
        
        // Firefox specifically needs wheel + ctrl detection
        window.addEventListener('wheel', this.handleWheel, { passive: false });
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
            if (this.mediaQueryList.removeEventListener) {
                this.mediaQueryList.removeEventListener('change', this.handleMediaChange);
            } else if (this.mediaQueryList.removeListener) {
                // For older browsers
                this.mediaQueryList.removeListener(this.handleMediaChange);
            }
            this.mediaQueryList = null;
        }
        
        // Clear any pending timeouts
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
    }
    
    /**
     * Set up detection using matchMedia API
     * @private
     */
    setupMatchMediaDetection() {
        // Create a media query based on device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        this.mediaQueryList = window.matchMedia(`(resolution: ${dpr}dppx)`);
        
        // Add the listener
        if (this.mediaQueryList.addEventListener) {
            this.mediaQueryList.addEventListener('change', this.handleMediaChange);
        } else if (this.mediaQueryList.addListener) {
            // For older browsers
            this.mediaQueryList.addListener(this.handleMediaChange);
        }
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
        // Re-setup the media query since the DPR has changed
        this.setupMatchMediaDetection();
        this.checkZoom();
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
        if (currentDpr !== this.lastDevicePixelRatio) {
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
```

### Step 2: Update Main.js to Use ZoomDetector
1. Modify `src/main.js` to use the new ZoomDetector utility:

```javascript
import ZoomDetector from './utils/ZoomDetector.js';

// Inside the initialize function, replace the existing zoom detection code:

// Create zoom detector
const zoomDetector = new ZoomDetector({
    onZoomChange: (zoomInfo) => {
        console.log(`Browser zoom changed: ${zoomInfo.oldDpr} -> ${zoomInfo.newDpr}`);
        renderer.resizeCanvas(grid);
    }
});

// Start zoom detection
zoomDetector.startListening();

// Store zoomDetector in window for debugging and potential manual control
window._zoomDetector = zoomDetector;
```

### Step 3: Optimize GameManager Animation Loop
1. Modify `src/core/GameManager.js` to improve the animation loop efficiency:

```javascript
/**
 * Main simulation loop using requestAnimationFrame for smooth animation
 * @param {number} timestamp - The current timestamp provided by requestAnimationFrame
 */
simulationLoop(timestamp) {
    // Exit early if not running
    if (!this.isSimulationRunning) {
        return;
    }
    
    // Use performance.now() for accurate timing if timestamp not provided
    const currentTime = timestamp || performance.now();
    
    // Initialize lastFrameTime if it's the first frame
    if (!this.lastFrameTime) {
        this.lastFrameTime = currentTime;
    }
    
    // Calculate time since last frame
    const elapsed = currentTime - this.lastFrameTime;
    
    // Target frame interval based on simulation speed
    const frameInterval = 1000 / this.simulationSpeed;
    
    // Performance optimization: Check if enough time has passed for an update
    if (elapsed >= frameInterval) {
        // Calculate how many generations to step forward
        // This allows catching up if the browser is struggling to maintain framerate
        // but limits the number of steps to prevent freezing with large grids
        const stepsToTake = Math.min(Math.floor(elapsed / frameInterval), 
                                    this.grid.rows > 80 ? 1 : 3); // Only 1 step for large grids
        
        // Only process if we have steps to take
        if (stepsToTake > 0) {
            // For every step to take
            for (let i = 0; i < stepsToTake; i++) {
                // Compute the next generation
                this.grid.computeNextGeneration();
                
                // Increment generation count
                this.generationCount++;
            }
            
            // Optimize rendering: Only redraw once after all generations are computed
            this.renderer.drawGrid(this.grid);
            
            // Update analytics only after all steps are complete to reduce DOM operations
            if (this.uiManager) {
                this.uiManager.updateAnalytics();
            }
            
            // Update last frame time, accounting for any extra time
            this.lastFrameTime = currentTime - (elapsed % frameInterval);
        }
    }
    
    // Continue the loop with optimized animation frame request
    this.animationFrameId = requestAnimationFrame(this.simulationLoop.bind(this));
}
```

### Step 4: Implement Animation Manager for Centralized Control
1. Create a new file `src/utils/AnimationManager.js` to centralize animation frame control:

```javascript
/**
 * Game of Life Simulator - Animation Manager Utility
 * Centralized management of requestAnimationFrame usage
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * AnimationManager class for centralized animation control
 */
export default class AnimationManager {
    constructor() {
        // Map of animation callbacks by ID
        this.animations = new Map();
        
        // Main animation frame ID
        this.animationFrameId = null;
        
        // Flag to indicate if the animation loop is running
        this.isRunning = false;
        
        // Bind methods to this instance
        this.loop = this.loop.bind(this);
    }
    
    /**
     * Start the animation loop if not already running
     * @private
     */
    startLoop() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animationFrameId = requestAnimationFrame(this.loop);
        }
    }
    
    /**
     * Stop the animation loop if no animations are registered
     * @private
     */
    stopLoopIfEmpty() {
        if (this.animations.size === 0 && this.isRunning) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            this.isRunning = false;
        }
    }
    
    /**
     * Main animation loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     * @private
     */
    loop(timestamp) {
        // Execute all registered animations
        for (const [id, animation] of this.animations) {
            // Skip inactive animations
            if (!animation.active) continue;
            
            // Call the animation callback with the timestamp
            try {
                animation.callback(timestamp);
            } catch (error) {
                console.error(`Error in animation ${id}:`, error);
                
                // Deactivate the animation to prevent further errors
                animation.active = false;
            }
        }
        
        // Continue the loop only if we have active animations
        if (this.animations.size > 0) {
            this.animationFrameId = requestAnimationFrame(this.loop);
        } else {
            this.isRunning = false;
        }
    }
    
    /**
     * Register a new animation
     * @param {Function} callback - Animation callback function
     * @param {string} [id] - Optional ID for the animation (auto-generated if not provided)
     * @returns {string} The animation ID
     */
    register(callback, id = null) {
        // Generate ID if not provided
        const animationId = id || `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Register the animation
        this.animations.set(animationId, {
            callback,
            active: true,
            id: animationId
        });
        
        // Start the loop if not already running
        this.startLoop();
        
        return animationId;
    }
    
    /**
     * Unregister an animation by ID
     * @param {string} id - The animation ID to unregister
     * @returns {boolean} True if the animation was unregistered, false otherwise
     */
    unregister(id) {
        const result = this.animations.delete(id);
        
        // Stop the loop if no animations are left
        this.stopLoopIfEmpty();
        
        return result;
    }
    
    /**
     * Pause an animation (keep it registered but inactive)
     * @param {string} id - The animation ID to pause
     * @returns {boolean} True if the animation was paused, false if not found
     */
    pause(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.active = false;
            return true;
        }
        return false;
    }
    
    /**
     * Resume a paused animation
     * @param {string} id - The animation ID to resume
     * @returns {boolean} True if the animation was resumed, false if not found
     */
    resume(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.active = true;
            
            // Ensure the loop is running
            this.startLoop();
            
            return true;
        }
        return false;
    }
    
    /**
     * Check if an animation is active
     * @param {string} id - The animation ID to check
     * @returns {boolean} True if the animation is active, false otherwise
     */
    isActive(id) {
        const animation = this.animations.get(id);
        return animation ? animation.active : false;
    }
    
    /**
     * Get the count of registered animations
     * @returns {number} The number of registered animations
     */
    getAnimationCount() {
        return this.animations.size;
    }
    
    /**
     * Get the count of active animations
     * @returns {number} The number of active animations
     */
    getActiveAnimationCount() {
        let count = 0;
        for (const animation of this.animations.values()) {
            if (animation.active) count++;
        }
        return count;
    }
    
    /**
     * Pause all animations
     */
    pauseAll() {
        for (const animation of this.animations.values()) {
            animation.active = false;
        }
    }
    
    /**
     * Resume all animations
     */
    resumeAll() {
        let hasActive = false;
        
        for (const animation of this.animations.values()) {
            animation.active = true;
            hasActive = true;
        }
        
        // Restart the loop if we have animations
        if (hasActive) {
            this.startLoop();
        }
    }
    
    /**
     * Unregister all animations
     */
    unregisterAll() {
        this.animations.clear();
        
        // Stop the animation loop
        if (this.isRunning) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            this.isRunning = false;
        }
    }
}

// Create and export a singleton instance
const animationManager = new AnimationManager();
export default animationManager;
```

### Step 5: Update GameManager to Use AnimationManager
1. Modify `src/core/GameManager.js` to use the new AnimationManager:

```javascript
import animationManager from '../utils/AnimationManager.js';

// Inside GameManager class:
constructor(dependencies = {}) {
    // Existing code...
    
    // Animation ID for simulation loop
    this.simulationLoopId = null;
}

startSimulation() {
    if (this.isSimulationRunning) {
        return;
    }
    
    this.isSimulationRunning = true;
    
    // Update the UI to show that the simulation is running
    if (document.getElementById('simulation-state')) {
        document.getElementById('simulation-state').textContent = 'Running';
    }
    
    // Start the simulation loop using AnimationManager
    this.lastFrameTime = performance.now();
    this.simulationLoopId = animationManager.register(
        this.simulationLoop.bind(this),
        'gameOfLifeSimulation'
    );
}

pauseSimulation() {
    if (!this.isSimulationRunning) {
        return;
    }
    
    this.isSimulationRunning = false;
    
    // Pause the animation
    if (this.simulationLoopId) {
        animationManager.pause(this.simulationLoopId);
    }
    
    // Update the UI to show that the simulation is paused
    if (document.getElementById('simulation-state')) {
        document.getElementById('simulation-state').textContent = 'Paused';
    }
}

// Modify simulationLoop to not request its own animation frame
simulationLoop(timestamp) {
    // Existing code without the final requestAnimationFrame call...
    
    // Don't call requestAnimationFrame here - AnimationManager handles this
}
```

### Step 6: Add Performance Monitoring for Animation Frame Usage
1. Create a performance monitor to track animation frame usage in development mode:

```javascript
/**
 * Performance monitor for animation frames
 * Only active in development mode
 */
class PerformanceMonitor {
    constructor() {
        this.isActive = process.env.NODE_ENV === 'development';
        this.stats = {
            framesPerSecond: 0,
            frameTime: 0,
            activeAnimations: 0
        };
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Display element
        this.display = null;
        
        // Initialize if in development mode
        if (this.isActive) {
            this.initialize();
        }
    }
    
    initialize() {
        // Create stats display
        this.display = document.createElement('div');
        this.display.className = 'performance-stats';
        this.display.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
        `;
        
        // Add to document when ready
        if (document.body) {
            document.body.appendChild(this.display);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(this.display);
            });
        }
        
        // Start monitoring
        this.monitor = this.monitor.bind(this);
        requestAnimationFrame(this.monitor);
    }
    
    monitor(timestamp) {
        // Calculate frame time
        if (this.lastFrameTime > 0) {
            this.stats.frameTime = timestamp - this.lastFrameTime;
        }
        this.lastFrameTime = timestamp;
        
        // Count frames for FPS calculation
        this.frameCount++;
        
        // Update FPS once per second
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.stats.framesPerSecond = Math.round(this.frameCount * 1000 / (timestamp - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
            
            // Update display
            this.updateDisplay();
        }
        
        // Get active animations count from AnimationManager
        if (animationManager) {
            this.stats.activeAnimations = animationManager.getActiveAnimationCount();
        }
        
        // Continue monitoring
        requestAnimationFrame(this.monitor);
    }
    
    updateDisplay() {
        if (this.display) {
            this.display.innerHTML = `
                FPS: ${this.stats.framesPerSecond}<br>
                Frame Time: ${this.stats.frameTime.toFixed(2)}ms<br>
                Active Animations: ${this.stats.activeAnimations}
            `;
        }
    }
}

// Only create the monitor in development mode
if (process.env.NODE_ENV === 'development') {
    const performanceMonitor = new PerformanceMonitor();
    window._performanceMonitor = performanceMonitor;
}
```

### Step 7: Testing
1. Test the new approach with different browsers:
   - Chrome
   - Firefox
   - Safari
   - Edge
   
2. Test on different devices:
   - Desktop
   - Mobile devices
   - Tablets
   
3. Check for performance improvements:
   - Monitor CPU usage before and after changes
   - Check battery impact (for mobile devices)
   - Verify zoom detection still works correctly
   
4. Specific tests:
   - Test zoom detection by using browser zoom controls
   - Test that animation frames are properly managed
   - Verify no animation loops continue when not needed

## Success Criteria
- Zoom detection works correctly across all major browsers
- No continuous animation loops run when not needed
- CPU usage is reduced compared to the previous implementation
- All animations remain smooth and responsive
- Performance monitor shows consistent frame rates
- Battery life impact is reduced on mobile devices

## Rollback Plan
If any issues arise:
1. Revert changes to the original animation frame approach
2. Remove the new utility classes
3. Restore original code in each class that was modified
4. Test the application after reverting to ensure everything works as before

## Estimated Time
- Creating the ZoomDetector utility: 2 hours
- Creating the AnimationManager utility: 2 hours
- Updating GameManager: 1 hour
- Implementing performance monitoring: 1 hour
- Testing across browsers and devices: 3 hours
- Total: Approximately 9 hours 