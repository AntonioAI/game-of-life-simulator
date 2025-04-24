/**
 * Game of Life Simulator - GridUtils Tests
 * Tests for grid utility functions
 * Copyright (c) 2025 Antonio Innocente
 */

import { calculateLivingNeighbors, createEmptyGrid, cloneGrid } from '../utils/GridUtils.js';

function testGridUtils() {
    console.log('Testing GridUtils...');
    
    // Test createEmptyGrid
    const grid = createEmptyGrid(3, 3);
    console.assert(grid.length === 3, 'Grid should have 3 rows');
    console.assert(grid[0].length === 3, 'Grid should have 3 columns');
    console.assert(grid[0][0] === false, 'Cells should be initialized to false');
    
    // Test cloneGrid
    const original = [
        [false, true, false],
        [true, true, true],
        [false, true, false]
    ];
    const clone = cloneGrid(original);
    console.assert(JSON.stringify(clone) === JSON.stringify(original), 'Cloned grid should match original');
    
    // Modify the clone
    clone[0][0] = true;
    console.assert(clone[0][0] !== original[0][0], 'Modifying clone should not affect original');
    
    // Test calculateLivingNeighbors with toroidal boundary
    const testGrid = [
        [false, true, false],
        [true, false, true],
        [false, true, false]
    ];
    
    // Center cell should have 4 living neighbors
    const centerNeighbors = calculateLivingNeighbors(testGrid, 1, 1, {
        boundaryType: 'toroidal',
        rows: 3,
        cols: 3
    });
    console.assert(centerNeighbors === 4, 'Center cell should have 4 living neighbors (toroidal)');
    
    // Test with finite boundary
    const edgeNeighbors = calculateLivingNeighbors(testGrid, 0, 0, {
        boundaryType: 'finite',
        rows: 3,
        cols: 3
    });
    console.assert(edgeNeighbors === 1, 'Corner cell should have 1 living neighbor (finite)');
    
    console.log('GridUtils tests completed!');
}

// Run tests
testGridUtils(); 