/**
 * Game of Life Simulator - Analytics Template Module
 * Responsible for generating HTML for analytics components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for analytics display
 * @param {Object} data - Optional initial data for analytics
 * @param {number} data.generation - Current generation count
 * @param {number} data.aliveCells - Current number of alive cells
 * @param {number} data.totalCells - Total number of cells in the grid
 * @param {string} data.simulationState - Current simulation state
 * @param {number} data.speed - Current simulation speed
 * @param {string} data.boundaryType - Current boundary type
 * @param {Object} data.gridSize - Grid size information
 * @param {number} data.gridSize.rows - Number of rows
 * @param {number} data.gridSize.cols - Number of columns
 * @returns {string} HTML string for analytics display
 */
export function createAnalyticsTemplate(data = {}) {
    const generation = data.generation || 0;
    const aliveCells = data.aliveCells || 0;
    const totalCells = data.totalCells || 0;
    const density = totalCells > 0 ? ((aliveCells / totalCells) * 100).toFixed(2) : "0.00";
    const simulationState = data.simulationState || 'Paused';
    const speed = data.speed || 10;
    const rows = data.gridSize?.rows || 50;
    const cols = data.gridSize?.cols || 50;
    const boundaryType = data.boundaryType === 'toroidal' ? 'Toroidal' : 'Finite';
    
    return `
        <div class="analytics-panel__content">
            <div class="analytics-data">
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">Generation:</span>
                    <span class="analytics-panel__value" id="generation-count">${generation}</span>
                </div>
                
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">Live Cells:</span>
                    <span class="analytics-panel__value" id="live-cell-count">${aliveCells}</span>
                </div>
                
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">Population Density:</span>
                    <span class="analytics-panel__value" id="population-density">${density}%</span>
                </div>
                
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">Grid Size:</span>
                    <span class="analytics-panel__value" id="grid-size">${rows}×${cols}</span>
                </div>
                
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">Speed:</span>
                    <span class="analytics-panel__value" id="simulation-speed">${speed} FPS</span>
                </div>
                
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">State:</span>
                    <span class="analytics-panel__value" id="simulation-state">${simulationState}</span>
                </div>
                
                <div class="analytics-panel__item">
                    <span class="analytics-panel__label">Boundary:</span>
                    <span class="analytics-panel__value" id="boundary-type">${boundaryType}</span>
                </div>
            </div>
        </div>
    `;
} 