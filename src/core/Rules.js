/**
 * Game of Life Simulator - Rules Module
 * Implements Conway's Game of Life rules
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Rules class to implement Conway's Game of Life rules
 */
class Rules {
    constructor() {
        // Could be extended to support custom rule sets
    }
    
    /**
     * Initialize the rules
     */
    initialize() {
        console.log("Initializing rules");
    }
    
    /**
     * Apply Conway's rules to determine the next state of a cell
     * @param {number} currentState - Current cell state (0 = dead, 1 = alive)
     * @param {number} aliveNeighbors - Count of alive neighbors
     * @returns {number} - Next state of the cell (0 = dead, 1 = alive)
     */
    applyRules(currentState, aliveNeighbors) {
        // Conway's Game of Life rules:
        // 1. Any live cell with fewer than two live neighbors dies (underpopulation)
        // 2. Any live cell with two or three live neighbors lives on to the next generation
        // 3. Any live cell with more than three live neighbors dies (overpopulation)
        // 4. Any dead cell with exactly three live neighbors becomes a live cell (reproduction)
        
        if (currentState === 1) {
            // Cell is alive
            return (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
        } else {
            // Cell is dead
            return (aliveNeighbors === 3) ? 1 : 0;
        }
    }
}

export default Rules; 