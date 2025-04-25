/**
 * Game of Life Simulator - Renderer Module
 * Responsible for canvas rendering
 * Copyright (c) 2025 Antonio Innocente
 */

import { isMobileDevice } from '../utils/DeviceUtils.js';
import { resizeCanvas, resizeCanvasToContainer, addCanvasResizeListener } from '../utils/CanvasUtils.js';
import errorHandler, { ErrorCategory } from '../utils/ErrorHandler.js';
import eventBus, { Events } from '../core/EventBus.js';
import config from '../config/GameConfig.js';

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
        // Validate required dependencies
        if (!dependencies.canvas) {
            throw new Error('Canvas dependency is required for Renderer');
        }
        
        this.canvas = dependencies.canvas;
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
        
        // Use centralized configuration
        this.settings = { ...config.rendering };
        
        // Track if we're on a mobile device
        this.isMobile = isMobileDevice();
        
        // Grid reference for redrawing
        this.grid = null;
        
        // Track cleanup functions
        this.cleanupFunctions = [];
        
        // Subscriptions to events
        this.subscriptions = [];
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
        
        // Canvas dependency is already validated in the constructor
        
        // Set up the canvas context
        this.ctx.imageSmoothingEnabled = false;
        
        // Ensure canvas has dimensions
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            console.log('Canvas has zero dimensions during initialization, setting default size');
            const container = this.canvas.parentElement;
            const width = container ? container.clientWidth || 800 : 800;
            const height = container ? container.clientHeight || 600 : 600;
            this.canvas.width = width;
            this.canvas.height = height;
        }
        
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
        
        // Subscribe to grid events that require redrawing
        this.subscriptions.push(
            eventBus.subscribe(Events.CELL_TOGGLED, () => {
                if (this.grid) {
                    this.drawGrid(this.grid);
                }
            }),
            
            eventBus.subscribe(Events.GRID_UPDATED, () => {
                if (this.grid) {
                    this.drawGrid(this.grid);
                }
            }),
            
            eventBus.subscribe(Events.PATTERN_SELECTED, () => {
                if (this.grid) {
                    this.drawGrid(this.grid);
                }
            }),
            
            eventBus.subscribe(Events.GRID_RESIZED, (data) => {
                if (this.grid) {
                    // Calculate new cell size based on new dimensions
                    this.settings.cellSize = this.calculateCellSize(data.rows, data.cols);
                    this.drawGrid(this.grid);
                }
            }),
            
            eventBus.subscribe(Events.RENDERING_CONFIG_UPDATED, (data) => {
                this.updateSettings(data);
                if (this.grid) {
                    this.drawGrid(this.grid);
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
            errorHandler.error(
                'Canvas dependency is required for calculating cell size',
                ErrorCategory.DEPENDENCY
            );
            return this.settings.minCellSize; // Return minimum cell size as fallback
        }
        
        // Get canvas container dimensions instead of canvas itself
        const container = this.canvas.parentElement;
        if (!container) {
            errorHandler.error(
                'Canvas must have a parent container element',
                ErrorCategory.RENDERING
            );
            return this.settings.minCellSize; // Return minimum cell size as fallback
        }
        
        // Get dimensions from container instead of canvas
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Use the smallest dimension to ensure the entire grid is visible
        const smallestDimension = Math.min(containerWidth, containerHeight);
        
        // Calculate cell size, ensuring it's not smaller than the minimum
        const calculatedSize = Math.floor(smallestDimension / Math.max(rows, cols));
        return Math.max(calculatedSize, config.rendering.minCellSize);
    }
    
    /**
     * Adjust canvas dimensions
     * @param {Grid} grid - The grid to draw after resize
     * @param {number} width - The width to set
     * @param {number} height - The height to set
     * @returns {boolean} True if canvas was resized successfully
     */
    resizeCanvas(grid, width, height) {
        // Store grid reference for future redraws
        if (grid) {
            this.grid = grid;
        }
        
        // If dimensions are not provided, calculate based on container and grid
        if (!width || !height) {
            // Get the container dimensions
            const container = this.canvas.parentElement;
            if (container) {
                width = container.clientWidth || 800; // Fallback to 800 if clientWidth is 0
                height = container.clientHeight || 600; // Fallback to 600 if clientHeight is 0
            } else {
                // Default dimensions if no container
                width = 800;
                height = 600;
            }
        }
        
        // Ensure minimum dimensions
        width = Math.max(width, 300);
        height = Math.max(height, 300);
        
        // Log the dimensions for debugging
        console.log(`Setting canvas dimensions to: ${width}x${height}`);
        
        // If we have a grid, calculate the cell size
        if (this.grid) {
            this.settings.cellSize = this.calculateCellSize(this.grid.rows, this.grid.cols);
        }
        
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
     * Draw the grid on the canvas
     * @param {Grid} grid - The grid object to render
     * @returns {void}
     */
    drawGrid(grid) {
        // Store grid reference for future redraws
        this.grid = grid;
        
        // Ensure canvas and context are available
        if (!this.canvas || !this.ctx) {
            errorHandler.error(
                'Canvas and context are required for drawing grid',
                ErrorCategory.RENDERING
            );
            return; // Early return instead of throwing
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
        if (!this.canvas) {
            errorHandler.error(
                'Canvas is required for getting cell coordinates',
                ErrorCategory.RENDERING,
                null,
                { showUser: false }
            );
            return null;
        }
        
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
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Call all cleanup functions
        this.cleanupFunctions.forEach(cleanupFn => {
            if (typeof cleanupFn === 'function') {
                cleanupFn();
            }
        });
        
        // Unsubscribe from events
        this.subscriptions.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        
        this.cleanupFunctions = [];
        this.subscriptions = [];
    }
}

export default Renderer; 