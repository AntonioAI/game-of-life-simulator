/**
 * Game of Life Simulator - Grid Module
 * Responsible for grid state and operations
 * Copyright (c) 2025 Antonio Innocente
 */

import { calculateLivingNeighbors, createEmptyGrid, cloneGrid } from '../utils/GridUtils.js';

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
        // Use utility function to create empty grid
        this.grid = createEmptyGrid(this.rows, this.cols, 0);
        return this.grid;
    }
    
    /**
     * Set a cell to a specific state
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {number} state - The cell state (0 or 1)
     * @returns {boolean} True if cell was set successfully
     */
    setCell(x, y, state) {
        // Ensure coordinates are within grid bounds
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.grid[y][x] = state === 1 ? 1 : 0;
            return true;
        }
        return false;
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
        return calculateLivingNeighbors(this.grid, y, x, {
            boundaryType: this.boundaryType,
            rows: this.rows,
            cols: this.cols
        });
    }
    
    /**
     * Compute the next generation based on Conway's rules
     * @returns {Array} The grid for the next generation
     */
    computeNextGeneration() {
        // Validate rules dependency
        if (!this.rules) {
            throw new Error('Rules dependency is required');
        }
        
        // Create a new grid using utility function
        const nextGrid = createEmptyGrid(this.rows, this.cols, 0);
        
        // Use local references to avoid property lookups in the loop
        const currentGrid = this.grid;
        const rows = this.rows;
        const cols = this.cols;
        const applyRules = this.rules.applyRules.bind(this.rules);
        
        // Compute next generation
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Calculate alive neighbors using utility function
                const aliveNeighbors = this.countAliveNeighbors(x, y);
                
                // Apply rules and set the cell state in the next generation
                const currentState = currentGrid[y][x];
                nextGrid[y][x] = applyRules(currentState, aliveNeighbors);
            }
        }
        
        // Update the current grid with the new generation
        this.grid = nextGrid;
        
        return this.grid;
    }
    
    /**
     * Reset the grid (all cells set to dead)
     */
    reset() {
        this.grid = createEmptyGrid(this.rows, this.cols, 0);
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
            return false;
        }
        
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        
        // Check if pattern fits on grid at specified position
        if (startX < 0 || startY < 0 || 
            startX + patternWidth > this.cols || 
            startY + patternHeight > this.rows) {
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