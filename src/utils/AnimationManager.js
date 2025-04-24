/**
 * Game of Life Simulator - Animation Manager Utility
 * Centralized management of requestAnimationFrame usage
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * AnimationManager class for centralized animation control
 */
class AnimationManager {
    constructor() {
        // Map of animation callbacks by ID
        this.animations = new Map();
        
        // Main animation frame ID
        this.animationFrameId = null;
        
        // Flag to indicate if the animation loop is running
        this.isRunning = false;
        
        // Performance tracking
        this.lastTimestamp = 0;
        this.throttleInterval = 0; // milliseconds, 0 = no throttle
        
        // Debug mode
        this.debug = false;
        
        // Bind methods to this instance
        this.loop = this.loop.bind(this);
    }
    
    /**
     * Start the animation loop if not already running
     * @private
     */
    startLoop() {
        if (!this.isRunning && this.animations.size > 0) {
            this.isRunning = true;
            this.lastTimestamp = 0;
            this.animationFrameId = requestAnimationFrame(this.loop);
            
            if (this.debug) {
                console.log(`AnimationManager: Loop started with ${this.getActiveAnimationCount()} active animations`);
            }
        }
    }
    
    /**
     * Stop the animation loop if no animations are registered or active
     * @private
     */
    stopLoopIfEmpty() {
        const hasActiveAnimations = this.getActiveAnimationCount() > 0;
        
        if (!hasActiveAnimations && this.isRunning) {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
            this.isRunning = false;
            
            if (this.debug) {
                console.log('AnimationManager: Loop stopped (no active animations)');
            }
        }
    }
    
    /**
     * Main animation loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     * @private
     */
    loop(timestamp) {
        // Check if we need to continue the loop
        if (!this.isRunning || this.animations.size === 0) {
            this.isRunning = false;
            this.animationFrameId = null;
            return;
        }
        
        // Throttle if needed
        if (this.throttleInterval > 0) {
            const elapsed = timestamp - this.lastTimestamp;
            if (this.lastTimestamp > 0 && elapsed < this.throttleInterval) {
                this.animationFrameId = requestAnimationFrame(this.loop);
                return;
            }
            this.lastTimestamp = timestamp;
        }
        
        // Keep track of active animations for optimization
        let activeCount = 0;
        
        // Execute all registered animations
        for (const [id, animation] of this.animations) {
            // Skip inactive animations
            if (!animation.active) continue;
            
            activeCount++;
            
            // Call the animation callback with the timestamp
            try {
                animation.callback(timestamp);
            } catch (error) {
                console.error(`Error in animation ${id}:`, error);
                
                // Deactivate the animation to prevent further errors
                animation.active = false;
                activeCount--;
            }
        }
        
        // Continue the loop only if we have active animations
        if (activeCount > 0) {
            this.animationFrameId = requestAnimationFrame(this.loop);
        } else {
            this.isRunning = false;
            this.animationFrameId = null;
            
            if (this.debug) {
                console.log('AnimationManager: Loop stopped (no active callbacks)');
            }
        }
    }
    
    /**
     * Register a new animation
     * @param {Function} callback - Animation callback function
     * @param {string} [id] - Optional ID for the animation (auto-generated if not provided)
     * @returns {string} The animation ID
     */
    register(callback, id = null) {
        if (typeof callback !== 'function') {
            throw new Error('Animation callback must be a function');
        }
        
        // Generate ID if not provided
        const animationId = id || `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if this ID is already in use
        if (this.animations.has(animationId)) {
            console.warn(`Animation ID "${animationId}" is already registered. Existing registration will be overwritten.`);
            // Ensure the old one is properly removed
            this.unregister(animationId);
        }
        
        // Register the animation
        this.animations.set(animationId, {
            callback,
            active: true,
            id: animationId
        });
        
        // Start the loop if not already running
        this.startLoop();
        
        if (this.debug) {
            console.log(`AnimationManager: Registered animation "${animationId}" (total: ${this.animations.size})`);
        }
        
        return animationId;
    }
    
    /**
     * Unregister an animation by ID
     * @param {string} id - The animation ID to unregister
     * @returns {boolean} True if the animation was unregistered, false otherwise
     */
    unregister(id) {
        const result = this.animations.delete(id);
        
        if (result && this.debug) {
            console.log(`AnimationManager: Unregistered animation "${id}" (remaining: ${this.animations.size})`);
        }
        
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
            
            if (this.debug) {
                console.log(`AnimationManager: Paused animation "${id}"`);
            }
            
            // Check if we need to stop the loop
            this.stopLoopIfEmpty();
            
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
            const wasInactive = !animation.active;
            animation.active = true;
            
            if (wasInactive && this.debug) {
                console.log(`AnimationManager: Resumed animation "${id}"`);
            }
            
            // Ensure the loop is running if it wasn't before
            if (wasInactive) {
                this.startLoop();
            }
            
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
        let pausedCount = 0;
        
        for (const animation of this.animations.values()) {
            if (animation.active) {
                animation.active = false;
                pausedCount++;
            }
        }
        
        if (pausedCount > 0 && this.debug) {
            console.log(`AnimationManager: Paused all animations (${pausedCount})`);
        }
        
        // Stop the loop since no animations are active
        this.stopLoopIfEmpty();
    }
    
    /**
     * Resume all animations
     */
    resumeAll() {
        let resumedCount = 0;
        
        for (const animation of this.animations.values()) {
            if (!animation.active) {
                animation.active = true;
                resumedCount++;
            }
        }
        
        if (resumedCount > 0) {
            // Restart the loop
            this.startLoop();
            
            if (this.debug) {
                console.log(`AnimationManager: Resumed all animations (${resumedCount})`);
            }
        }
    }
    
    /**
     * Unregister all animations
     */
    unregisterAll() {
        const count = this.animations.size;
        this.animations.clear();
        
        if (count > 0 && this.debug) {
            console.log(`AnimationManager: Unregistered all animations (${count})`);
        }
        
        // Stop the animation loop
        if (this.isRunning) {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            this.animationFrameId = null;
            this.isRunning = false;
        }
    }
    
    /**
     * Set throttling for animations to reduce CPU usage
     * @param {number} interval - Minimum time between frames in milliseconds (0 to disable)
     */
    setThrottleInterval(interval) {
        this.throttleInterval = Math.max(0, interval);
        
        if (this.debug) {
            if (interval > 0) {
                console.log(`AnimationManager: Throttling set to ${interval}ms`);
            } else {
                console.log('AnimationManager: Throttling disabled');
            }
        }
    }
    
    /**
     * Toggle debug logging
     * @param {boolean} enabled - Whether to enable debug logging
     */
    setDebug(enabled) {
        this.debug = !!enabled;
    }
}

// Create and export a singleton instance
const animationManager = new AnimationManager();
export default animationManager; 