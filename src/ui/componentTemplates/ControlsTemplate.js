/**
 * Game of Life Simulator - Controls Template Module
 * 
 * UI COMPONENT TEMPLATE
 * 
 * This module generates HTML markup for the control panel UI components.
 * It creates DOM structures for interactive elements like buttons, sliders,
 * and grid configuration controls that users directly interact with.
 * 
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for simulation controls panel
 * Creates the structure for play/pause/step buttons and speed controls
 * 
 * @returns {string} HTML string for simulation controls
 */
export function createSimulationControlsTemplate() {
    return `
        <div class="simulation-controls u-panel-section">
            <h3 class="u-panel-section-title">Simulation Controls</h3>
            <p class="control-panel__description">Control the simulation flow.</p>
            <div class="control-panel__buttons" id="control-buttons-container">
                <!-- Button elements will be inserted here by event binding -->
            </div>
            <div id="speed-slider-container">
                <!-- Speed slider will be inserted here by event binding -->
            </div>
        </div>
    `;
}

/**
 * Generate HTML for grid settings panel
 * Creates form elements for users to adjust grid dimensions
 * 
 * @param {Object} options - Grid options
 * @param {number} options.rows - Current number of rows
 * @param {number} options.cols - Current number of columns
 * @param {number} options.minSize - Minimum allowed grid size
 * @param {number} options.maxSize - Maximum allowed grid size
 * @returns {string} HTML string for grid settings
 */
export function createGridSettingsTemplate(options = {}) {
    const rows = options.rows || 50;
    const cols = options.cols || 50;
    const minSize = options.minSize || 10;
    const maxSize = options.maxSize || 200;
    
    return `
        <div class="grid-settings u-panel-section">
            <h3 class="u-panel-section-title">Grid Dimensions</h3>
            <p class="control-panel__description">Select a preset size or enter custom dimensions.</p>
            
            <div class="preset-buttons">
                <!-- Preset buttons will be inserted dynamically from config -->
            </div>
            
            <div class="custom-size">
                <div class="custom-size-heading">Custom Size</div>
                
                <div class="dimension-input">
                    <label for="rows-input">Rows:</label>
                    <input id="rows-input" type="number" min="${minSize}" max="${maxSize}" value="${rows}">
                </div>
                
                <div class="dimension-input">
                    <label for="cols-input">Columns:</label>
                    <input id="cols-input" type="number" min="${minSize}" max="${maxSize}" value="${cols}">
                </div>
                
                <div class="size-note">Min: ${minSize}×${minSize}, Max: ${maxSize}×${maxSize}</div>
                <button class="preset-apply" id="apply-grid-size">Apply</button>
            </div>
        </div>
    `;
}

/**
 * Generate HTML for boundary toggle selector
 * Creates a dropdown for users to select boundary behavior
 * 
 * @param {string} currentType - Current boundary type ('toroidal' or 'finite')
 * @returns {string} HTML string for boundary toggle
 */
export function createBoundaryToggleTemplate(currentType = 'toroidal') {
    return `
        <div class="boundary-setting u-panel-section">
            <h3 class="u-panel-section-title">Grid Boundary</h3>
            <p class="control-panel__description">Choose how cells behave at the grid edges.</p>
            
            <div class="boundary-select">
                <label class="boundary-label" for="boundary-select">Boundary Type:</label>
                <select class="boundary-dropdown" id="boundary-select">
                    <option value="toroidal" ${currentType === 'toroidal' ? 'selected' : ''}>Toroidal (Edges Connect)</option>
                    <option value="finite" ${currentType === 'finite' ? 'selected' : ''}>Finite (Fixed Edges)</option>
                </select>
            </div>
        </div>
    `;
} 