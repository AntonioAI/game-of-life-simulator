/**
 * Game of Life Simulator - Canvas Utilities
 * Utility functions for canvas operations
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Resize a canvas to the specified dimensions
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {number} width - The new width
 * @param {number} height - The new height
 * @param {Object} options - Additional options
 * @param {boolean} options.imageSmoothingEnabled - Whether to enable image smoothing (default: false)
 * @param {Function} options.afterResizeCallback - Function to call after resizing
 * @returns {boolean} - True if the canvas was resized successfully
 */
function resizeCanvas(canvas, width, height, options = {}) {
    if (!canvas) {
        console.error('No canvas provided to resizeCanvas');
        return false;
    }
    
    // Validate width and height are numbers and greater than 0
    if (typeof width !== 'number' || typeof height !== 'number') {
        console.error(`Invalid dimensions: width=${width}, height=${height}`);
        return false;
    }
    
    // Ensure dimensions are not zero or negative
    if (width <= 0 || height <= 0) {
        console.warn(`Invalid dimensions (${width}x${height}), using fallback values`);
        width = width <= 0 ? 800 : width;
        height = height <= 0 ? 600 : height;
    }
    
    // Get canvas context
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
        console.error('Could not get 2D context from canvas');
        return false;
    }
    
    // Log the dimensions
    console.log(`Setting canvas dimensions: ${width}x${height}`);
    
    // Set the canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Apply settings for crisp pixel rendering
    ctx.imageSmoothingEnabled = options.imageSmoothingEnabled !== undefined ? 
        options.imageSmoothingEnabled : false;
    
    // Call the callback if provided
    if (typeof options.afterResizeCallback === 'function') {
        options.afterResizeCallback(canvas, ctx);
    }
    
    return true;
}

/**
 * Resize a canvas to match its container's dimensions
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {Object} options - Additional options
 * @param {boolean} options.imageSmoothingEnabled - Whether to enable image smoothing (default: false)
 * @param {Function} options.afterResizeCallback - Function to call after resizing
 * @returns {boolean} - True if the canvas was resized successfully
 */
function resizeCanvasToContainer(canvas, options = {}) {
    if (!canvas) return false;
    
    const container = canvas.parentElement;
    if (!container) return false;
    
    // Get container dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // Fallback to default values if dimensions are 0
    if (width === 0) {
        console.warn('Container width is 0, using fallback value of 800px');
        width = 800;
    }
    
    if (height === 0) {
        console.warn('Container height is 0, using fallback value of 600px');
        height = 600;
    }
    
    // Log the dimensions we're setting
    console.log(`Resizing canvas to container: ${width}x${height}`);
    
    return resizeCanvas(canvas, width, height, options);
}

/**
 * Add a window resize listener that automatically resizes a canvas to its container
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {Object} options - Additional options
 * @param {boolean} options.imageSmoothingEnabled - Whether to enable image smoothing (default: false)
 * @param {Function} options.afterResizeCallback - Function to call after resizing
 * @returns {Function} - Function to remove the event listener
 */
function addCanvasResizeListener(canvas, options = {}) {
    if (!canvas) {
        throw new Error('Canvas element is required');
    }
    
    const handleResize = () => {
        resizeCanvasToContainer(canvas, options);
    };
    
    // Initial resize
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Return function to remove the listener
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}

// Export utility functions
export {
    resizeCanvas,
    resizeCanvasToContainer,
    addCanvasResizeListener
}; 