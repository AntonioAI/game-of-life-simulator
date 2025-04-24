/**
 * Game of Life Simulator - Renderer Module
 * Responsible for canvas rendering
 * Copyright (c) 2025 Antonio Innocente
 */

import { isMobileDevice } from '../utils/DeviceUtils.js';
import { resizeCanvas, resizeCanvasToContainer, addCanvasResizeListener } from '../utils/CanvasUtils.js';

/**
 * Renderer class for canvas operations
 */
class Renderer {
    /**
     * Create a renderer
     * @param {Object} dependencies - Dependencies object
     * @param {HTMLCanvasElement} dependencies.canvas - The canvas element to render to
     */
    constructor(dependencies = {}) {
        this.canvas = dependencies.canvas || null;
        this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: false }) : null; // Disable alpha for better performance
        
        this.settings = {
            cellSize: 10,
            gridColor: '#dddddd',
            cellColor: '#000000',
            backgroundColor: '#ffffff',
            minCellSize: 10 // Minimum cell size for touch interaction
        };
        
        // Track if we're on a mobile device
        this.isMobile = this.detectMobileDevice();
        
        // Track cleanup functions
        this.cleanupFunctions = [];
    }
    
    /**
     * Initialize the renderer
     * @param {HTMLCanvasElement} canvas - Optional canvas to set if not provided in constructor
     */
    initialize(canvas = null) {
        if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { alpha: false });
        }
        
        if (!this.canvas) {
            throw new Error('Canvas dependency is required');
        }
        
        if (!this.ctx) {
            throw new Error('Failed to get canvas context');
        }
        
        // Set up the canvas context
        this.ctx.imageSmoothingEnabled = false;
        
        // Add resize listener
        this.cleanupFunctions.push(
            addCanvasResizeListener(this.canvas, {
                afterResizeCallback: () => {
                    if (this.grid) {
                        this.drawGrid(this.grid);
                    }
                }
            })
        );
    }
    
    /**
     * Calculate cell size based on container dimensions and grid size
     * @param {number} rows - Number of rows in the grid
     * @param {number} cols - Number of columns in the grid
     * @returns {number} The calculated cell size
     */
    calculateCellSize(rows, cols) {
        if (!this.canvas) {
            throw new Error('Canvas dependency is required');
        }
        
        // Get canvas container dimensions instead of canvas itself
        const container = this.canvas.parentElement;
        if (!container) {
            throw new Error('Canvas must have a parent container element');
        }
        
        // Get dimensions from container instead of canvas
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Use the smallest dimension to ensure the entire grid is visible
        const smallestDimension = Math.min(containerWidth, containerHeight);
        
        // Calculate cell size, ensuring it's not smaller than the minimum
        const calculatedSize = Math.floor(smallestDimension / Math.max(rows, cols));
        return Math.max(calculatedSize, this.settings.minCellSize);
    }
    
    /**
     * Adjust canvas dimensions
     * @param {number} width - The width to set
     * @param {number} height - The height to set
     * @returns {boolean} True if canvas was resized successfully
     */
    resizeCanvas(width, height) {
        return resizeCanvas(this.canvas, width, height, {
            afterResizeCallback: () => {
                if (this.grid) {
                    this.drawGrid(this.grid);
                }
            }
        });
    }
    
    /**
     * Resize canvas to fit its container
     * @returns {boolean} True if canvas was resized successfully
     */
    resizeCanvasToContainer() {
        return resizeCanvasToContainer(this.canvas, {
            afterResizeCallback: () => {
                if (this.grid) {
                    this.drawGrid(this.grid);
                }
            }
        });
    }
    
    /**
     * Detect if running on a mobile device
     * @returns {boolean} True if on a mobile device
     */
    detectMobileDevice() {
        return isMobileDevice();
    }
    
    /**
     * Draw the grid on the canvas
     * @param {Grid} grid - The grid object to render
     * @returns {void}
     */
    drawGrid(grid) {
        // Ensure canvas and context are available
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas and context are required');
        }
        
        // Get the CSS dimensions - this is what users see
        const displayWidth = this.canvasCssWidth || this.canvas.clientWidth;
        const displayHeight = this.canvasCssHeight || this.canvas.clientHeight;
        
        // Clear the entire canvas with background color
        this.ctx.fillStyle = this.settings.backgroundColor;
        this.ctx.fillRect(0, 0, displayWidth, displayHeight);
        
        // Calculate the cell size and total grid dimensions
        const cellSize = this.settings.cellSize;
        const totalGridWidth = grid.cols * cellSize;
        const totalGridHeight = grid.rows * cellSize;
        
        // Calculate the offset to center the grid
        const offsetX = Math.floor((displayWidth - totalGridWidth) / 2);
        const offsetY = Math.floor((displayHeight - totalGridHeight) / 2);
        
        // Performance optimization: Use local variables to reduce property lookups
        const ctx = this.ctx;
        const gridData = grid.grid;
        const rows = grid.rows;
        const cols = grid.cols;
        
        // Draw grid lines only if cell size is large enough
        if (cellSize >= 4) {
            // Use a lighter grid color for better contrast
            ctx.strokeStyle = this.settings.gridColor;
            ctx.lineWidth = 0.5;
            
            // Draw grid lines using optimized path batching
            ctx.beginPath();
            
            // Draw vertical lines
            for (let x = 0; x <= cols; x++) {
                const lineX = offsetX + (x * cellSize);
                ctx.moveTo(lineX, offsetY);
                ctx.lineTo(lineX, offsetY + totalGridHeight);
            }
            
            // Draw horizontal lines
            for (let y = 0; y <= rows; y++) {
                const lineY = offsetY + (y * cellSize);
                ctx.moveTo(offsetX, lineY);
                ctx.lineTo(offsetX + totalGridWidth, lineY);
            }
            
            ctx.stroke();
        }
        
        // Draw all live cells
        ctx.fillStyle = this.settings.cellColor;
        
        // Draw all live cells using direct approach
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (gridData[y][x] === 1) {
                    const cellX = offsetX + (x * cellSize);
                    const cellY = offsetY + (y * cellSize);
                    ctx.fillRect(cellX, cellY, cellSize, cellSize);
                }
            }
        }
    }
    
    /**
     * Get cell coordinates from mouse/touch position
     * @param {Event} event - The mouse or touch event
     * @param {Grid} grid - The grid object
     * @returns {Object|null} The grid coordinates {x, y} or null if out of bounds
     */
    getCellCoordinates(event, grid) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Calculate position within canvas
        let clientX, clientY;
        
        // Handle both mouse and touch events
        if (event.type.includes('touch')) {
            // Prevent default to avoid scrolling/zooming on touch devices
            event.preventDefault();
            
            // Get the first touch point
            if (event.touches && event.touches.length > 0) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else if (event.changedTouches && event.changedTouches.length > 0) {
                // For touchend event, touches list is empty, use changedTouches
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            } else {
                return null; // No valid touch point
            }
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Get the position within the canvas in CSS pixels
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Get the current display dimensions
        const displayWidth = this.canvasCssWidth || rect.width;
        const displayHeight = this.canvasCssHeight || rect.height;
        
        // Calculate the cell size and total grid dimensions
        const cellSize = this.settings.cellSize;
        const totalGridWidth = grid.cols * cellSize;
        const totalGridHeight = grid.rows * cellSize;
        
        // Calculate the offset to center the grid
        const offsetX = (displayWidth - totalGridWidth) / 2;
        const offsetY = (displayHeight - totalGridHeight) / 2;
        
        // Get grid coordinates, accounting for the offset
        const gridX = Math.floor((x - offsetX) / cellSize);
        const gridY = Math.floor((y - offsetY) / cellSize);
        
        // Validate grid coordinates are within bounds
        if (gridX < 0 || gridX >= grid.cols || gridY < 0 || gridY >= grid.rows) {
            return null; // Out of bounds
        }
        
        return { x: gridX, y: gridY };
    }
    
    /**
     * Update renderer settings
     * @param {Object} settings - New settings to apply
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
}

export default Renderer; 