/**
 * Game of Life Simulator - Grid Module
 * Responsible for grid state and operations
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Grid class for managing grid state and operations
 */
class Grid {
    /**
     * Create a grid
     * @param {Object} dependencies - Dependencies object
     * @param {Rules} dependencies.rules - Rules implementation
     * @param {Object} options - Grid options
     * @param {number} options.rows - Number of rows
     * @param {number} options.cols - Number of columns
     * @param {string} options.boundaryType - Boundary type ('toroidal' or 'finite')
     */
    constructor(dependencies = {}, options = {}) {
        this.rules = dependencies.rules || null;
        this.rows = options.rows || 50;
        this.cols = options.cols || 50;
        this.cellSize = 10;
        this.grid = [];
        this.boundaryType = options.boundaryType || 'toroidal'; // 'toroidal' or 'finite'
        
        // Initialize grid with dead cells
        this.initialize();
    }
    
    /**
     * Initialize the grid with all cells dead (0)
     * @returns {Array} The initialized grid
     */
    initialize() {
        console.log("Initializing grid with dimensions:", this.rows, "x", this.cols);
        
        // Create a new grid
        const newGrid = [];
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                row.push(0); // 0 = dead, 1 = alive
            }
            newGrid.push(row);
        }
        
        // Update reference
        this.grid = newGrid;
        
        console.log("Grid initialized:", newGrid);
        return this.grid;
    }
    
    /**
     * Toggle the state of a cell
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    toggleCell(x, y) {
        // Ensure coordinates are within grid bounds
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            // Toggle the cell state (0 to 1 or 1 to 0)
            this.grid[y][x] = this.grid[y][x] === 0 ? 1 : 0;
            return true;
        }
        return false;
    }
    
    /**
     * Count alive neighbors for a given cell
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {number} The count of alive neighbors
     */
    countAliveNeighbors(x, y) {
        let count = 0;
        
        // Check all 8 neighboring cells (horizontal, vertical, diagonal)
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                // Skip the cell itself
                if (dx === 0 && dy === 0) continue;
                
                let nx, ny;
                
                if (this.boundaryType === 'toroidal') {
                    // Toroidal wrapping (edges connect)
                    nx = (x + dx + this.cols) % this.cols;
                    ny = (y + dy + this.rows) % this.rows;
                } else {
                    // Finite grid (edges don't connect)
                    nx = x + dx;
                    ny = y + dy;
                    
                    // Skip if neighbor is outside grid boundaries
                    if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) {
                        continue;
                    }
                }
                
                // Increment count if neighbor is alive
                if (this.grid[ny][nx] === 1) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * Compute the next generation based on Conway's rules
     * @returns {Array} The grid for the next generation
     */
    computeNextGeneration() {
        console.log(`Computing next generation with boundary type: ${this.boundaryType}`);
        
        // Validate rules dependency
        if (!this.rules) {
            throw new Error('Rules dependency is required');
        }
        
        // Create a new grid for the next generation
        const nextGrid = [];
        for (let y = 0; y < this.rows; y++) {
            const row = [];
            for (let x = 0; x < this.cols; x++) {
                const aliveNeighbors = this.countAliveNeighbors(x, y);
                const currentState = this.grid[y][x];
                
                // Apply Game of Life rules using the Rules dependency
                const nextState = this.rules.applyRules(currentState, aliveNeighbors);
                row.push(nextState);
            }
            nextGrid.push(row);
        }
        
        // Update the current grid with the new generation
        this.grid = nextGrid;
        
        return this.grid;
    }
    
    /**
     * Place a pattern on the grid at specific coordinates
     * @param {Array} pattern - 2D array representing the pattern
     * @param {number} startX - The starting x coordinate
     * @param {number} startY - The starting y coordinate
     * @returns {boolean} True if pattern was placed successfully
     */
    placePattern(pattern, startX, startY) {
        if (!pattern || !Array.isArray(pattern)) {
            console.error("Invalid pattern:", pattern);
            return false;
        }
        
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        
        // Check if pattern fits on grid at specified position
        if (startX < 0 || startY < 0 || 
            startX + patternWidth > this.cols || 
            startY + patternHeight > this.rows) {
            console.error("Pattern doesn't fit on grid at specified position");
            return false;
        }
        
        // Place the pattern
        for (let y = 0; y < patternHeight; y++) {
            for (let x = 0; x < patternWidth; x++) {
                if (pattern[y][x] === 1) {
                    this.grid[startY + y][startX + x] = 1;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Reset the grid size
     * @param {number} rows - New number of rows
     * @param {number} cols - New number of columns
     */
    resize(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.initialize();
    }
    
    /**
     * Toggle the boundary type between 'toroidal' and 'finite'
     * @returns {string} The new boundary type
     */
    toggleBoundaryType() {
        this.boundaryType = this.boundaryType === 'toroidal' ? 'finite' : 'toroidal';
        return this.boundaryType;
    }
    
    /**
     * Set the boundary type
     * @param {string} type - The boundary type ('toroidal' or 'finite')
     */
    setBoundaryType(type) {
        if (type === 'toroidal' || type === 'finite') {
            this.boundaryType = type;
        }
    }
    
    /**
     * Get the count of alive cells
     * @returns {number} The count of alive cells
     */
    getAliveCellsCount() {
        let count = 0;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    count++;
                }
            }
        }
        return count;
    }
}

export default Grid; 