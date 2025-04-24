/**
 * Game of Life Simulator - Duplicate Code Refactor Tests
 * Integration tests for refactored utility modules
 * Copyright (c) 2025 Antonio Innocente
 */

import { calculateLivingNeighbors } from '../utils/GridUtils.js';
import { isMobileDevice } from '../utils/DeviceUtils.js';
import { resizeCanvas } from '../utils/CanvasUtils.js';
import Grid from '../core/Grid.js';
import Rules from '../core/Rules.js';

function testDuplicateCodeRefactor() {
    console.log('Testing duplicate code refactoring...');
    
    // Create a test grid
    const grid = new Grid({}, { rows: 3, cols: 3 });
    
    // Set up a pattern
    grid.toggleCell(0, 1);
    grid.toggleCell(1, 0);
    grid.toggleCell(1, 2);
    grid.toggleCell(2, 1);
    
    // Create rules instance
    const rules = new Rules();
    
    // Compare results from Grid and Rules methods
    const gridNeighbors = grid.countAliveNeighbors(1, 1);
    const rulesNeighbors = rules.getLivingNeighbors(grid.grid, 1, 1);
    
    console.assert(gridNeighbors === rulesNeighbors, 
        `Both methods should return the same number of neighbors: ${gridNeighbors} === ${rulesNeighbors}`);
    
    // Verify that utilities are working correctly
    console.assert(typeof isMobileDevice() === 'boolean', 
        'isMobileDevice should return a boolean value');
    
    // Create a test canvas
    const canvas = document.createElement('canvas');
    const resizeResult = resizeCanvas(canvas, 100, 100);
    
    console.assert(resizeResult, 'resizeCanvas should return true for successful resize');
    console.assert(canvas.width === 100 && canvas.height === 100, 
        'Canvas should have the correct dimensions after resize');
    
    console.log('Duplicate code refactoring tests completed!');
}

// Run tests
testDuplicateCodeRefactor(); 