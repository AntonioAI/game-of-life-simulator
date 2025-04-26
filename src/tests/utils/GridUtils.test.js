/**
 * Game of Life Simulator - Grid Utilities Tests
 * Tests for the GridUtils helper functions
 * Copyright (c) 2025 Antonio Innocente
 */

import * as GridUtils from '../../utils/GridUtils.js';

function testGridUtils() {
    console.log('Testing GridUtils...');
    
    // Test createEmptyGrid
    const grid = GridUtils.createEmptyGrid(3, 3);
    console.assert(grid.length === 3, 'Grid should have 3 rows');
    console.assert(grid[0].length === 3, 'Grid should have 3 columns');
    console.assert(grid[0][0] === false, 'Cells should be initialized to false');
    
    // Test cloneGrid
    const original = [
        [false, true, false],
        [true, true, true],
        [false, true, false]
    ];
    const clone = GridUtils.cloneGrid(original);
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
    
    // Print the grid for debugging
    console.log("Test grid:");
    testGrid.forEach(row => {
        console.log(row.map(cell => cell ? 'X' : '.').join(' '));
    });
    
    // Center cell should have 4 living neighbors
    const centerNeighbors = GridUtils.calculateLivingNeighbors(testGrid, 1, 1, {
        boundaryType: 'toroidal',
        rows: 3,
        cols: 3
    });
    console.log(`Center cell at (1,1) has ${centerNeighbors} neighbors (toroidal)`);
    console.assert(centerNeighbors === 4, 'Center cell should have 4 living neighbors (toroidal)');
    
    // Test with finite boundary
    const edgeNeighbors = GridUtils.calculateLivingNeighbors(testGrid, 0, 0, {
        boundaryType: 'finite',
        rows: 3,
        cols: 3
    });
    console.log(`Corner cell at (0,0) has ${edgeNeighbors} neighbors (finite)`);
    
    // In the test grid, the cell at (0,1) and (1,0) are true, so the corner (0,0) 
    // should have 2 neighbors in finite mode
    console.assert(edgeNeighbors === 2, 'Corner cell should have 2 living neighbors (finite)');
    
    console.log('GridUtils tests completed!');
}

// Run tests
testGridUtils(); 