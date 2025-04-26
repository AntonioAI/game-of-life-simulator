/**
 * Game of Life Simulator - Grid Module
 * Responsible for grid state and operations
 * @module core/Grid
 * Copyright (c) 2025 Antonio Innocente
 */

import { calculateLivingNeighbors, createEmptyGrid, cloneGrid } from '../utils/GridUtils.js';
import errorHandler, { ErrorCategory } from '../utils/ErrorHandler.js';
import eventBus, { Events } from './EventBus.js';
import config from '../config/GameConfig.js';

/**
 * Grid class for managing grid state and operations
 * @class
 */
class Grid {
    /**
     * Create a grid
     * @param {import('../types/GridTypes').GridDependencies} [dependencies={}] - Dependencies object
     * @param {import('../types/GridTypes').GridOptions} [options={}] - Grid options
     */
    constructor(dependencies = {}, options = {}) {
        // Validate required dependencies
        if (!dependencies.rules) {
            throw new Error('Rules dependency is required for Grid');
        }
        
        /** @type {import('../core/Rules').default} */
        this.rules = dependencies.rules;
        
        /** @type {number} */
        this.rows = options.rows || config.grid.defaultRows;
        
        /** @type {number} */
        this.cols = options.cols || config.grid.defaultCols;
        
        /** @type {import('../types/GridTypes').BoundaryType} */
        this.boundaryType = options.boundaryType || config.grid.defaultBoundaryType;
        
        /** @type {import('../types/GridTypes').GridArray} */
        this.grid = [];
        
        // Initialize grid with dead cells
        this.initialize();
    }
    
    /**
     * Initialize the grid with all cells dead (0)
     * @returns {import('../types/GridTypes').GridArray} The initialized grid
     */
    initialize() {
        // Use utility function to create empty grid
        this.grid = createEmptyGrid(this.rows, this.cols, 0);
        
        // Publish grid updated event
        eventBus.publish(Events.GRID_UPDATED, {
            rows: this.rows,
            cols: this.cols
        });
        
        return this.grid;
    }
    
    /**
     * Set a cell to a specific state
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {import('../types/GridTypes').CellState} state - The cell state (0 or 1)
     * @returns {boolean} True if cell was set successfully
     */
    setCell(x, y, state) {
        // Ensure coordinates are within grid bounds
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            this.grid[y][x] = state === 1 ? 1 : 0;
            return true;
        }
        
        // Log the out-of-bounds attempt
        errorHandler.warning(
            `Attempted to set cell outside grid bounds: (${x}, ${y})`,
            ErrorCategory.INPUT,
            null,
            { showUser: false } // Don't show to user, just log
        );
        
        return false;
    }
    
    /**
     * Toggle the state of a cell
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {boolean} True if cell was toggled successfully
     */
    toggleCell(x, y) {
        // Ensure coordinates are within grid bounds
        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
            // Toggle the cell state (0 to 1 or 1 to 0)
            this.grid[y][x] = this.grid[y][x] === 0 ? 1 : 0;
            
            // Publish the event that a cell was toggled
            eventBus.publish(Events.CELL_TOGGLED, {
                x,
                y,
                state: this.grid[y][x]
            });
            
            return true;
        }
        
        // Log the out-of-bounds attempt
        errorHandler.warning(
            `Attempted to toggle cell outside grid bounds: (${x}, ${y})`,
            ErrorCategory.INPUT,
            null,
            { showUser: false } // Don't show to user, just log
        );
        
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
     * @returns {import('../types/GridTypes').GridArray} The grid for the next generation
     */
    computeNextGeneration() {
        // Rules dependency is already validated in the constructor
        
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
        
        // Publish grid updated event
        eventBus.publish(Events.GRID_UPDATED, {
            rows: this.rows,
            cols: this.cols
        });
        
        return this.grid;
    }
    
    /**
     * Reset the grid (all cells set to dead)
     * @returns {import('../types/GridTypes').GridArray} The reset grid
     */
    reset() {
        this.grid = createEmptyGrid(this.rows, this.cols, 0);
        
        // Publish grid updated event
        eventBus.publish(Events.GRID_UPDATED, {
            rows: this.rows, 
            cols: this.cols
        });
        
        return this.grid;
    }
    
    /**
     * Place a pattern on the grid at specific coordinates
     * @param {import('../types/GridTypes').Pattern} pattern - 2D array representing the pattern
     * @param {number} startX - The starting x coordinate
     * @param {number} startY - The starting y coordinate
     * @returns {boolean} True if pattern was placed successfully
     */
    placePattern(pattern, startX, startY) {
        if (!pattern || !Array.isArray(pattern)) {
            errorHandler.error(
                'Invalid pattern: Pattern must be a 2D array',
                ErrorCategory.INPUT
            );
            return false;
        }
        
        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        
        // Check if pattern fits on grid at specified position
        if (startX < 0 || startY < 0 || 
            startX + patternWidth > this.cols || 
            startY + patternHeight > this.rows) {
            errorHandler.warning(
                `Pattern does not fit at position (${startX}, ${startY})`,
                ErrorCategory.INPUT,
                null,
                { showUser: true }
            );
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
        
        // Publish grid updated event
        eventBus.publish(Events.GRID_UPDATED, {
            rows: this.rows,
            cols: this.cols
        });
        
        return true;
    }
    
    /**
     * Resize the grid
     * @param {number} rows - New number of rows
     * @param {number} cols - New number of columns
     * @returns {import('../types/GridTypes').GridArray} The resized grid
     */
    resize(rows, cols) {
        // Ensure the new size is within the allowed range
        this.rows = Math.max(config.grid.minSize, Math.min(config.grid.maxSize, rows));
        this.cols = Math.max(config.grid.minSize, Math.min(config.grid.maxSize, cols));
        
        // Initialize a new grid with the new size
        this.initialize();
        
        // Publish grid resized event
        eventBus.publish(Events.GRID_RESIZED, {
            rows: this.rows,
            cols: this.cols
        });
        
        return this.grid;
    }
    
    /**
     * Toggle the boundary type of the grid
     * @returns {import('../types/GridTypes').BoundaryType} The new boundary type
     */
    toggleBoundaryType() {
        this.boundaryType = this.boundaryType === 'toroidal' ? 'finite' : 'toroidal';
        return this.boundaryType;
    }
    
    /**
     * Set the boundary type of the grid
     * @param {import('../types/GridTypes').BoundaryType} type - The boundary type to set
     * @returns {import('../types/GridTypes').BoundaryType} The new boundary type
     */
    setBoundaryType(type) {
        if (type === 'toroidal' || type === 'finite') {
            this.boundaryType = type;
            
            // Publish the event that boundary type changed
            eventBus.publish(Events.BOUNDARY_CHANGED, {
                boundaryType: type
            });
        } else {
            errorHandler.warning(
                `Invalid boundary type: ${type}. Using default.`,
                ErrorCategory.INPUT,
                null,
                { showUser: false }
            );
        }
    }
    
    /**
     * Get the count of alive cells in the grid
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