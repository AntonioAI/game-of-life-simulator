/**
 * Game of Life Simulator - Grid Tests
 * Tests for Grid module functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import Grid from '../../core/Grid.js';
import Rules from '../../core/Rules.js';

/**
 * Test the Grid class for correct neighbor counting and generation computation
 */
function testGridClass() {
    console.log('Running Grid tests...');
    
    // Test case 1: Neighbor counting with a simple pattern
    testNeighborCounting();
    
    // Test case 2: Next generation computation
    testNextGenerationComputation();
    
    // Test case 3: Different boundary types
    testBoundaryBehavior();
    
    console.log('All Grid tests passed!');
}

/**
 * Test neighbor counting functionality
 */
function testNeighborCounting() {
    // Create a grid with known pattern (a glider)
    const grid = new Grid({ rules: new Rules() }, { rows: 5, cols: 5 });
    
    // Set up a specific pattern (glider)
    grid.setCell(1, 0, 1);
    grid.setCell(2, 1, 1);
    grid.setCell(0, 2, 1);
    grid.setCell(1, 2, 1);
    grid.setCell(2, 2, 1);
    
    // Test neighbor counting
    const center = grid.countAliveNeighbors(1, 1);
    console.assert(center === 5, `Center cell should have 5 neighbors, got ${center}`);
    
    const corner = grid.countAliveNeighbors(0, 0);
    console.assert(corner === 1, `Corner cell should have 1 neighbor, got ${corner}`);
    
    const edge = grid.countAliveNeighbors(0, 1);
    console.assert(edge === 3, `Edge cell should have 3 neighbors, got ${edge}`);
    
    console.log('✓ Neighbor counting tests passed');
}

/**
 * Test next generation computation
 */
function testNextGenerationComputation() {
    // Create a grid with known pattern (a glider)
    const grid = new Grid({ rules: new Rules() }, { rows: 5, cols: 5 });
    
    // Set up a specific pattern (glider)
    grid.setCell(1, 0, 1);
    grid.setCell(2, 1, 1);
    grid.setCell(0, 2, 1);
    grid.setCell(1, 2, 1);
    grid.setCell(2, 2, 1);
    
    // Compute next generation
    const nextGen = grid.computeNextGeneration();
    
    // Print the current state of the grid for debugging
    console.log("Next generation grid state:");
    for (let y = 0; y < grid.rows; y++) {
        console.log(nextGen[y].map(cell => cell === 1 ? 'X' : '.').join(' '));
    }
    
    // Verify expected results for glider's next step
    // The glider pattern evolves as follows:
    // Generation 1:    Generation 2:
    // .X.              ...
    // ..X              X.X
    // XXX              .XX
    //                  .X.
    
    console.assert(nextGen[0][1] === 0, `Cell (1,0) should be dead in next gen, got ${nextGen[0][1]}`);
    console.assert(nextGen[1][0] === 1, `Cell (0,1) should be alive in next gen, got ${nextGen[1][0]}`);
    console.assert(nextGen[1][2] === 1, `Cell (2,1) should be alive in next gen, got ${nextGen[1][2]}`);
    console.assert(nextGen[2][1] === 1, `Cell (1,2) should be alive in next gen, got ${nextGen[2][1]}`);
    console.assert(nextGen[2][2] === 1, `Cell (2,2) should be alive in next gen, got ${nextGen[2][2]}`);
    console.assert(nextGen[3][1] === 1, `Cell (1,3) should be alive in next gen, got ${nextGen[3][1]}`);
    
    console.log('✓ Next generation computation tests passed');
}

/**
 * Test boundary behavior
 */
function testBoundaryBehavior() {
    // Test toroidal boundary (wrapping)
    const toroidalGrid = new Grid(
        { rules: new Rules() },
        { rows: 5, cols: 5, boundaryType: 'toroidal' }
    );
    
    // Place a cell at the edge
    toroidalGrid.setCell(4, 4, 1);
    toroidalGrid.setCell(0, 4, 1);
    toroidalGrid.setCell(4, 0, 1);
    
    // In toroidal mode, the corner cell at (0,0) should have 3 neighbors
    const cornerNeighborsToroidal = toroidalGrid.countAliveNeighbors(0, 0);
    console.assert(
        cornerNeighborsToroidal === 3,
        `Corner cell in toroidal mode should have 3 neighbors, got ${cornerNeighborsToroidal}`
    );
    
    // Test finite boundary (no wrapping)
    const finiteGrid = new Grid(
        { rules: new Rules() },
        { rows: 5, cols: 5, boundaryType: 'finite' }
    );
    
    // Place the same pattern
    finiteGrid.setCell(4, 4, 1);
    finiteGrid.setCell(0, 4, 1);
    finiteGrid.setCell(4, 0, 1);
    
    // In finite mode, the corner cell at (0,0) should have 0 neighbors
    const cornerNeighborsFinite = finiteGrid.countAliveNeighbors(0, 0);
    console.assert(
        cornerNeighborsFinite === 0,
        `Corner cell in finite mode should have 0 neighbors, got ${cornerNeighborsFinite}`
    );
    
    console.log('✓ Boundary behavior tests passed');
}

/**
 * Benchmark Grid performance
 */
function benchmarkGridPerformance() {
    console.log('Running Grid performance benchmark...');
    
    const grid = new Grid({ rules: new Rules() }, { rows: 100, cols: 100 });
    
    // Randomly populate the grid
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            if (Math.random() < 0.3) {
                grid.setCell(x, y, 1);
            }
        }
    }
    
    // Benchmark next generation calculation
    const iterations = 10;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        grid.computeNextGeneration();
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    console.log(`Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`);
    console.log(`Average time per generation: ${avgTime.toFixed(2)}ms`);
}

// Run the tests
testGridClass();

// Run the benchmark (commented out to avoid slowing down regular tests)
// Uncomment to run performance testing
// benchmarkGridPerformance();

export default testGridClass; 