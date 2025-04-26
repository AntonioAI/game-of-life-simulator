/**
 * Game of Life Simulator - Grid Utilities
 * Utility functions for grid operations
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Calculate the number of living neighbors for a cell
 * @param {Array} grid - 2D array representing the grid
 * @param {number} row - Row index of the cell
 * @param {number} col - Column index of the cell
 * @param {Object} options - Additional options
 * @param {string} options.boundaryType - Type of boundary ('toroidal' or 'finite')
 * @param {number} options.rows - Number of rows in the grid (optional if grid is provided)
 * @param {number} options.cols - Number of columns in the grid (optional if grid is provided)
 * @returns {number} - Count of living neighbors
 */
function calculateLivingNeighbors(grid, row, col, options = {}) {
    let count = 0;
    
    // Determine grid dimensions
    const rows = options.rows || grid.length;
    const cols = options.cols || grid[0].length;
    const boundaryType = options.boundaryType || 'toroidal';
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            
            let neighborRow = row + i;
            let neighborCol = col + j;
            
            // Apply boundary conditions
            if (boundaryType === 'toroidal') {
                neighborRow = (neighborRow + rows) % rows;
                neighborCol = (neighborCol + cols) % cols;
            } else if (
                neighborRow < 0 || 
                neighborRow >= rows || 
                neighborCol < 0 || 
                neighborCol >= cols
            ) {
                continue;
            }
            
            if (grid[neighborRow][neighborCol]) {
                count++;
            }
        }
    }
    
    return count;
}

/**
 * Create an empty grid with the specified dimensions
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {boolean} value - Default value for cells (default: false)
 * @returns {Array} - 2D array representing the grid
 */
function createEmptyGrid(rows, cols, value = false) {
    return Array(rows).fill().map(() => Array(cols).fill(value));
}

/**
 * Clone a grid
 * @param {Array} grid - 2D array representing the grid
 * @returns {Array} - Deep copy of the grid
 */
function cloneGrid(grid) {
    return grid.map(row => [...row]);
}

// Export utility functions
export {
    calculateLivingNeighbors,
    createEmptyGrid,
    cloneGrid
}; 