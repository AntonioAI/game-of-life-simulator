/**
 * Game of Life Simulator - Performance Monitor Template Module
 * Responsible for generating HTML for performance monitor display
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for the performance monitor display
 * @returns {string} HTML string for performance monitor container
 */
export function createPerformanceMonitorTemplate() {
    return `
        <div class="performance-stats" style="
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
        "></div>
    `;
}

/**
 * Generate HTML for performance stats update
 * @param {Object} stats - Performance statistics
 * @param {number} stats.framesPerSecond - Frames per second
 * @param {number} stats.frameTime - Frame time in milliseconds
 * @param {number} stats.activeAnimations - Number of active animations
 * @returns {string} HTML string for performance stats
 */
export function createPerformanceStatsTemplate(stats) {
    const { framesPerSecond, frameTime, activeAnimations } = stats;
    
    return `
        FPS: ${framesPerSecond}<br>
        Frame Time: ${frameTime.toFixed(2)}ms<br>
        Active Animations: ${activeAnimations}
    `;
} 