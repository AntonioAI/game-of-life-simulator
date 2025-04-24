/**
 * Game of Life Simulator - Performance Monitor Utility
 * Monitors performance metrics in development mode
 * Copyright (c) 2025 Antonio Innocente
 */

import animationManager from './AnimationManager.js';

/**
 * Performance monitor for animation frames
 * Only active when explicitly enabled
 */
class PerformanceMonitor {
    constructor() {
        // Disabled by default
        this.isActive = false;
        this.isRunning = false;
        this.monitorId = null;
        
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
        
        // Bind methods
        this.monitor = this.monitor.bind(this);
    }
    
    /**
     * Enable the performance monitor
     * @param {boolean} show - Whether to show the display
     */
    enable(show = true) {
        this.isActive = true;
        
        if (show) {
            this.createDisplay();
        }
        
        if (!this.isRunning) {
            this.start();
        }
    }
    
    /**
     * Disable the performance monitor
     */
    disable() {
        this.isActive = false;
        this.stop();
        
        if (this.display && this.display.parentNode) {
            this.display.parentNode.removeChild(this.display);
            this.display = null;
        }
    }
    
    /**
     * Create the display element
     */
    createDisplay() {
        if (this.display) return;
        
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
                if (this.isActive && this.display) {
                    document.body.appendChild(this.display);
                }
            });
        }
    }
    
    /**
     * Start monitoring
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        this.monitorId = requestAnimationFrame(this.monitor);
    }
    
    /**
     * Stop monitoring
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.monitorId) {
            cancelAnimationFrame(this.monitorId);
            this.monitorId = null;
        }
    }
    
    /**
     * Monitoring loop function
     */
    monitor(timestamp) {
        if (!this.isActive || !this.isRunning) {
            this.isRunning = false;
            return;
        }
        
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
        this.monitorId = requestAnimationFrame(this.monitor);
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

// Create a singleton instance but don't enable it by default
const performanceMonitor = new PerformanceMonitor();

// Export the singleton instance
export default performanceMonitor; 