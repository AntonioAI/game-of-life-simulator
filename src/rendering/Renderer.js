/**
 * Game of Life Simulator - Renderer Module
 * Responsible for canvas rendering
 * Copyright (c) 2025 Antonio Innocente
 */

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
            backgroundColor: '#ffffff'
        };
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
    }
    
    /**
     * Calculate cell size based on canvas dimensions and grid size
     * @param {number} rows - Number of rows in the grid
     * @param {number} cols - Number of columns in the grid
     * @returns {number} The calculated cell size
     */
    calculateCellSize(rows, cols) {
        if (!this.canvas) {
            throw new Error('Canvas dependency is required');
        }
        
        const smallestDimension = Math.min(this.canvas.width, this.canvas.height);
        return Math.floor(smallestDimension / Math.max(rows, cols));
    }
    
    /**
     * Adjust canvas dimensions for high-DPI displays
     * @returns {void}
     */
    resizeCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        if (pixelRatio > 1) {
            const originalWidth = this.canvas.width;
            const originalHeight = this.canvas.height;
            
            this.canvas.style.width = originalWidth + 'px';
            this.canvas.style.height = originalHeight + 'px';
            
            this.canvas.width = originalWidth * pixelRatio;
            this.canvas.height = originalHeight * pixelRatio;
            
            this.ctx.scale(pixelRatio, pixelRatio);
        }
    }
    
    /**
     * Draw the grid on the canvas
     * @param {Grid} grid - The grid object to render
     * @returns {void}
     */
    drawGrid(grid) {
        console.log("Drawing grid...");
        
        // Clear the canvas
        this.ctx.fillStyle = this.settings.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate the offset to center the grid
        const totalGridWidth = grid.cols * this.settings.cellSize;
        const totalGridHeight = grid.rows * this.settings.cellSize;
        const offsetX = Math.floor((this.canvas.width - totalGridWidth) / 2);
        const offsetY = Math.floor((this.canvas.height - totalGridHeight) / 2);
        
        // Performance optimization: batch similar operations
        const cellSize = this.settings.cellSize;
        
        // First pass: Draw all live cells
        let liveCells = 0;
        this.ctx.fillStyle = this.settings.cellColor;
        for (let y = 0; y < grid.rows; y++) {
            if (!grid.grid[y]) {
                console.error(`Missing row ${y} in grid`);
                continue;
            }
            
            for (let x = 0; x < grid.cols; x++) {
                if (grid.grid[y][x] === 1) {
                    liveCells++;
                    const cellX = offsetX + (x * cellSize);
                    const cellY = offsetY + (y * cellSize);
                    this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
                }
            }
        }
        console.log(`Drew grid with ${liveCells} live cells`);
        
        // Second pass: Draw grid lines (only if cell size is large enough)
        if (cellSize >= 4) { // Skip grid lines for very small cells to improve performance
            this.ctx.strokeStyle = this.settings.gridColor;
            this.ctx.beginPath();
            
            // Draw vertical lines
            for (let x = 0; x <= grid.cols; x++) {
                const lineX = offsetX + (x * cellSize);
                this.ctx.moveTo(lineX, offsetY);
                this.ctx.lineTo(lineX, offsetY + totalGridHeight);
            }
            
            // Draw horizontal lines
            for (let y = 0; y <= grid.rows; y++) {
                const lineY = offsetY + (y * cellSize);
                this.ctx.moveTo(offsetX, lineY);
                this.ctx.lineTo(offsetX + totalGridWidth, lineY);
            }
            
            this.ctx.stroke();
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
            } else {
                return null; // No valid touch point
            }
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Calculate the scale ratio between the canvas's displayed size and its actual size
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Calculate the offset to center the grid
        const totalGridWidth = grid.cols * this.settings.cellSize;
        const totalGridHeight = grid.rows * this.settings.cellSize;
        const offsetX = (this.canvas.width - totalGridWidth) / 2;
        const offsetY = (this.canvas.height - totalGridHeight) / 2;
        
        // Get the position within the canvas, accounting for scaling and offset
        const canvasX = (clientX - rect.left) * scaleX - offsetX;
        const canvasY = (clientY - rect.top) * scaleY - offsetY;
        
        // Convert to grid coordinates
        const gridX = Math.floor(canvasX / this.settings.cellSize);
        const gridY = Math.floor(canvasY / this.settings.cellSize);
        
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