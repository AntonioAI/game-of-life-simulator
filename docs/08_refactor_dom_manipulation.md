# Implementation Plan: Refactor DOM Manipulation in UIManager

## Issue Description
The UIManager class directly creates and manipulates DOM elements rather than using a more declarative approach or a template system. This approach makes the code harder to maintain, test, and update, as UI logic and structure are tightly coupled. This violates the separation of concerns principle and contradicts the cursor rule "single-responsibility."

## Current Implementation

Currently, the UIManager class contains methods that directly create DOM elements:

```javascript
createSimulationControls() {
    const simulationControls = document.createElement('div');
    simulationControls.className = 'simulation-controls u-panel-section';
    
    // Title 
    const simulationTitle = document.createElement('h3');
    simulationTitle.className = 'u-panel-section-title';
    simulationTitle.textContent = 'Simulation Controls';
    simulationControls.appendChild(simulationTitle);
    
    // Description for simulation controls
    const simulationDescription = document.createElement('p');
    simulationDescription.className = 'control-panel__description';
    simulationDescription.textContent = 'Control the simulation flow.';
    simulationControls.appendChild(simulationDescription);
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'control-panel__buttons';
    
    // Control buttons with clear labels and icons
    buttonContainer.appendChild(
        this.controls.createButton('▶', 'Start', 
            () => this.gameManager.startSimulation())
    );
    
    // ... more DOM creation code ...
    
    this.controlsContainer.appendChild(simulationControls);
}
```

## Implementation Steps

### Step 1: Create Templates Directory
1. Create a new directory `src/ui/templates` to hold all the template files
2. Create the following template files:

### Step 2: Create Control Template Module
1. Create a new file `src/ui/templates/ControlsTemplate.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Controls Template Module
 * Responsible for generating HTML for control components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for simulation controls
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
 * Generate HTML for grid settings
 * @param {Object} options - Grid options
 * @param {number} options.rows - Current number of rows
 * @param {number} options.cols - Current number of columns
 * @returns {string} HTML string for grid settings
 */
export function createGridSettingsTemplate(options = {}) {
    const rows = options.rows || 50;
    const cols = options.cols || 50;
    
    return `
        <div class="grid-settings u-panel-section">
            <h3 class="u-panel-section-title">Grid Dimensions</h3>
            <p class="control-panel__description">Select a preset size or enter custom dimensions.</p>
            
            <div class="preset-buttons">
                <button type="button" class="preset-button" title="Small Grid" data-preset="50,50">50×50</button>
                <button type="button" class="preset-button" title="Medium Grid" data-preset="75,75">75×75</button>
                <button type="button" class="preset-button" title="Large Grid" data-preset="100,100">100×100</button>
            </div>
            
            <div class="custom-size">
                <div class="custom-size-heading">Custom Size</div>
                
                <div class="dimension-input">
                    <label for="rows-input">Rows:</label>
                    <input id="rows-input" type="number" min="10" max="200" value="${rows}">
                </div>
                
                <div class="dimension-input">
                    <label for="cols-input">Columns:</label>
                    <input id="cols-input" type="number" min="10" max="200" value="${cols}">
                </div>
                
                <div class="size-note">Min: 10×10, Max: 200×200</div>
                <button class="preset-apply" id="apply-grid-size">Apply</button>
            </div>
        </div>
    `;
}

/**
 * Generate HTML for boundary toggle
 * @param {string} currentType - Current boundary type ('toroidal' or 'finite')
 * @returns {string} HTML string for boundary toggle
 */
export function createBoundaryToggleTemplate(currentType = 'toroidal') {
    const toroidalChecked = currentType === 'toroidal' ? 'checked' : '';
    const finiteChecked = currentType === 'finite' ? 'checked' : '';
    
    return `
        <div class="boundary-setting u-panel-section">
            <h3 class="u-panel-section-title">Grid Boundary</h3>
            <p class="control-panel__description">Select how the grid's edges behave.</p>
            
            <div class="boundary-options">
                <label class="boundary-option">
                    <input type="radio" name="boundary-type" value="toroidal" ${toroidalChecked}>
                    <span class="boundary-label">Toroidal (Wrap Around)</span>
                    <p class="boundary-description">Cells that move off one edge appear on the opposite edge, like in Pac-Man.</p>
                </label>
                
                <label class="boundary-option">
                    <input type="radio" name="boundary-type" value="finite" ${finiteChecked}>
                    <span class="boundary-label">Finite (Fixed Edges)</span>
                    <p class="boundary-description">Cells that would move off the edge are considered dead.</p>
                </label>
            </div>
        </div>
    `;
}
```

### Step 3: Create Analytics Template Module
1. Create a new file `src/ui/templates/AnalyticsTemplate.js` with the following content:

```javascript
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
 * @param {string} data.simulationState - Current simulation state
 * @returns {string} HTML string for analytics display
 */
export function createAnalyticsTemplate(data = {}) {
    const generation = data.generation || 0;
    const aliveCells = data.aliveCells || 0;
    const simulationState = data.simulationState || 'Paused';
    
    return `
        <div class="analytics-data">
            <div class="analytics-item">
                <div class="analytics-label">Generation:</div>
                <div class="analytics-value" id="generation-count">${generation}</div>
            </div>
            
            <div class="analytics-item">
                <div class="analytics-label">Living Cells:</div>
                <div class="analytics-value" id="alive-cells-count">${aliveCells}</div>
            </div>
            
            <div class="analytics-item">
                <div class="analytics-label">Simulation:</div>
                <div class="analytics-value" id="simulation-state">${simulationState}</div>
            </div>
            
            <div class="analytics-item">
                <div class="analytics-label">Speed:</div>
                <div class="analytics-value" id="simulation-speed">10 FPS</div>
            </div>
        </div>
        
        <div class="analytics-chart">
            <canvas id="population-chart" height="100"></canvas>
        </div>
    `;
}
```

### Step 4: Create Pattern Library Template Module
1. Create a new file `src/ui/templates/PatternLibraryTemplate.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Pattern Library Template Module
 * Responsible for generating HTML for pattern library components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for pattern library
 * @param {Array} patterns - Array of pattern objects
 * @returns {string} HTML string for pattern library
 */
export function createPatternLibraryTemplate(patterns = []) {
    // Create pattern list items
    const patternItems = patterns.map(pattern => `
        <div class="pattern-item" data-pattern-id="${pattern.id}">
            <div class="pattern-preview">
                <img src="${pattern.preview || 'images/patterns/default.png'}" alt="${pattern.name}">
            </div>
            <div class="pattern-details">
                <h4 class="pattern-name">${pattern.name}</h4>
                <p class="pattern-description">${pattern.description}</p>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="pattern-list">
            <p class="pattern-library__description">Click a pattern to place it in the center of the grid.</p>
            ${patternItems}
        </div>
    `;
}
```

### Step 5: Update UIManager Class
1. Open `src/ui/UIManager.js`
2. Import the template modules at the top of the file:

```javascript
import { createSimulationControlsTemplate, createGridSettingsTemplate, createBoundaryToggleTemplate } from './templates/ControlsTemplate.js';
import { createAnalyticsTemplate } from './templates/AnalyticsTemplate.js';
import { createPatternLibraryTemplate } from './templates/PatternLibraryTemplate.js';
```

3. Refactor the `createSimulationControls()` method:

```javascript
createSimulationControls() {
    // Use the template to create the HTML structure
    this.controlsContainer.innerHTML += createSimulationControlsTemplate();
    
    // Get references to the elements where components will be inserted
    const buttonContainer = document.getElementById('control-buttons-container');
    const speedSliderContainer = document.getElementById('speed-slider-container');
    
    // Create and attach control buttons
    const startButton = this.controls.createButton('▶', 'Start', 
        () => this.gameManager.startSimulation());
    const pauseButton = this.controls.createButton('⏸', 'Pause', 
        () => this.gameManager.pauseSimulation());
    const stepButton = this.controls.createButton('➡', 'Step', 
        () => this.gameManager.stepSimulation());
    const resetButton = this.controls.createButton('↺', 'Reset', 
        () => this.gameManager.resetSimulation());
    
    // Append buttons to container
    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(pauseButton);
    buttonContainer.appendChild(stepButton);
    buttonContainer.appendChild(resetButton);
    
    // Create and attach speed slider
    const speedControl = this.controls.createSpeedSlider(
        1, 60, this.gameManager.simulationSpeed,
        (speed) => this.gameManager.updateSimulationSpeed(speed)
    );
    speedSliderContainer.appendChild(speedControl.container);
}
```

4. Refactor the `createSettingsPanel()` method:

```javascript
createSettingsPanel() {
    // Use the template to create the HTML structure
    this.controlsContainer.innerHTML += createGridSettingsTemplate({
        rows: this.gameManager.grid.rows,
        cols: this.gameManager.grid.cols
    });
    
    // Add event listeners to preset buttons
    const presetButtons = document.querySelectorAll('.preset-button');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const [rows, cols] = button.dataset.preset.split(',').map(Number);
            this.resizeGrid(rows, cols);
        });
    });
    
    // Add event listener to apply button
    const applyButton = document.getElementById('apply-grid-size');
    applyButton.addEventListener('click', () => {
        const rowsInput = document.getElementById('rows-input');
        const colsInput = document.getElementById('cols-input');
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        
        if (rows >= 10 && rows <= 200 && cols >= 10 && cols <= 200) {
            this.resizeGrid(rows, cols);
        }
    });
    
    // Add input validation
    const rowsInput = document.getElementById('rows-input');
    const colsInput = document.getElementById('cols-input');
    
    rowsInput.addEventListener('change', () => {
        const value = parseInt(rowsInput.value);
        if (isNaN(value) || value < 10) rowsInput.value = 10;
        if (value > 200) rowsInput.value = 200;
    });
    
    colsInput.addEventListener('change', () => {
        const value = parseInt(colsInput.value);
        if (isNaN(value) || value < 10) colsInput.value = 10;
        if (value > 200) colsInput.value = 200;
    });
}
```

5. Refactor the `addBoundaryToggle()` method:

```javascript
addBoundaryToggle() {
    // Use the template to create the HTML structure
    this.controlsContainer.innerHTML += createBoundaryToggleTemplate(
        this.gameManager.grid.boundaryType
    );
    
    // Add event listeners to the radio buttons
    const boundaryRadios = document.querySelectorAll('input[name="boundary-type"]');
    boundaryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                this.gameManager.grid.setBoundaryType(radio.value);
            }
        });
    });
}
```

6. Refactor the `createAnalyticsDisplay()` method:

```javascript
createAnalyticsDisplay() {
    // Use the template to create the HTML structure
    this.analyticsContainer.innerHTML = createAnalyticsTemplate({
        generation: this.gameManager.generationCount,
        aliveCells: this.gameManager.grid.getAliveCellsCount(),
        simulationState: this.gameManager.isSimulationRunning ? 'Running' : 'Paused'
    });
    
    // Set up population chart (if using chart.js or similar)
    const chartCanvas = document.getElementById('population-chart');
    if (chartCanvas && window.Chart) {
        this.populationChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Population',
                    data: [],
                    borderColor: '#3e95cd',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: false
                    }
                }
            }
        });
    }
}
```

7. Update the `updateAnalytics()` method:

```javascript
updateAnalytics() {
    // Update text-based analytics
    const generationElement = document.getElementById('generation-count');
    const aliveCellsElement = document.getElementById('alive-cells-count');
    const simulationStateElement = document.getElementById('simulation-state');
    
    if (generationElement) {
        generationElement.textContent = this.gameManager.generationCount;
    }
    
    if (aliveCellsElement) {
        aliveCellsElement.textContent = this.gameManager.grid.getAliveCellsCount();
    }
    
    if (simulationStateElement) {
        simulationStateElement.textContent = this.gameManager.isSimulationRunning ? 'Running' : 'Paused';
    }
    
    // Update chart if available
    if (this.populationChart) {
        const data = this.populationChart.data;
        
        // Add new data point
        data.labels.push(this.gameManager.generationCount);
        data.datasets[0].data.push(this.gameManager.grid.getAliveCellsCount());
        
        // Limit the number of points to prevent performance issues
        const maxPoints = 50;
        if (data.labels.length > maxPoints) {
            data.labels.shift();
            data.datasets[0].data.shift();
        }
        
        this.populationChart.update();
    }
}
```

### Step 6: Update PatternLibrary Class
1. Open the PatternLibrary class file and update it to use the template:

```javascript
createPatternLibraryUI(options = {}) {
    const patterns = this.getPatterns();
    
    // Use the template to create the HTML structure
    if (this.container) {
        this.container.innerHTML = createPatternLibraryTemplate(patterns);
        
        // Add event listeners to pattern items
        const patternItems = document.querySelectorAll('.pattern-item');
        patternItems.forEach(item => {
            item.addEventListener('click', () => {
                const patternId = item.dataset.patternId;
                this.placePatternInCenter(patternId, options.grid);
                
                if (typeof options.onPatternSelected === 'function') {
                    options.onPatternSelected(patternId);
                }
            });
        });
    }
}
```

### Step 7: Create Helper Class for DOM Operations
1. Create a new file `src/utils/DOMHelper.js` with the following content:

```javascript
/**
 * Game of Life Simulator - DOM Helper Module
 * Utilities for working with the DOM
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Create an element with the specified attributes and properties
 * @param {string} tag - The tag name of the element to create
 * @param {Object} attributes - Key-value pairs of attributes to set
 * @param {Object} properties - Key-value pairs of properties to set
 * @param {Array|Element} children - Child elements to append
 * @returns {Element} The created element
 */
export function createElement(tag, attributes = {}, properties = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    // Set properties
    Object.entries(properties).forEach(([key, value]) => {
        element[key] = value;
    });
    
    // Append children
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (child) {
                element.appendChild(child);
            }
        });
    } else if (children) {
        element.appendChild(children);
    }
    
    return element;
}

/**
 * Create an element from an HTML string
 * @param {string} html - HTML string to convert to an element
 * @returns {Element} The created element
 */
export function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Create multiple elements from an HTML string
 * @param {string} html - HTML string to convert to elements
 * @returns {DocumentFragment} Document fragment containing the elements
 */
export function createElementsFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
}
```

### Step 8: Testing
1. Create a test file `src/tests/UITemplates.test.js`:

```javascript
import { createSimulationControlsTemplate, createGridSettingsTemplate, createBoundaryToggleTemplate } from '../ui/templates/ControlsTemplate.js';
import { createAnalyticsTemplate } from '../ui/templates/AnalyticsTemplate.js';
import { createPatternLibraryTemplate } from '../ui/templates/PatternLibraryTemplate.js';

function testTemplates() {
    // Test simulation controls template
    const simulationControls = createSimulationControlsTemplate();
    console.assert(typeof simulationControls === 'string', 'Simulation controls should be a string');
    console.assert(simulationControls.includes('Simulation Controls'), 'Template should include the title');
    
    // Test grid settings template
    const gridSettings = createGridSettingsTemplate({ rows: 75, cols: 75 });
    console.assert(typeof gridSettings === 'string', 'Grid settings should be a string');
    console.assert(gridSettings.includes('value="75"'), 'Template should include the current rows and cols');
    
    // Test boundary toggle template
    const boundaryToggle = createBoundaryToggleTemplate('finite');
    console.assert(typeof boundaryToggle === 'string', 'Boundary toggle should be a string');
    console.assert(boundaryToggle.includes('value="finite" checked'), 'Template should select the current boundary type');
    
    // Test analytics template
    const analytics = createAnalyticsTemplate({ generation: 10, aliveCells: 50, simulationState: 'Running' });
    console.assert(typeof analytics === 'string', 'Analytics should be a string');
    console.assert(analytics.includes('>10<'), 'Template should include the current generation count');
    console.assert(analytics.includes('>50<'), 'Template should include the current alive cells count');
    
    // Test pattern library template
    const patterns = [
        { id: 'glider', name: 'Glider', description: 'A classic pattern that moves diagonally', preview: 'images/patterns/glider.png' }
    ];
    const patternLibrary = createPatternLibraryTemplate(patterns);
    console.assert(typeof patternLibrary === 'string', 'Pattern library should be a string');
    console.assert(patternLibrary.includes('data-pattern-id="glider"'), 'Template should include the pattern ID');
    
    console.log('All template tests passed!');
}

// Run tests
testTemplates();
```

2. Create a test file `src/tests/UIManager.test.js`:

```javascript
import UIManager from '../ui/UIManager.js';
import GameManager from '../core/GameManager.js';
import Grid from '../core/Grid.js';
import Rules from '../core/Rules.js';
import Controls from '../ui/Controls.js';
import Renderer from '../rendering/Renderer.js';

function mockDependencies() {
    const rules = new Rules();
    const grid = new Grid({ rules }, { rows: 50, cols: 50 });
    const canvas = document.createElement('canvas');
    const renderer = new Renderer({ canvas });
    const gameManager = new GameManager({ grid, renderer });
    const controls = new Controls();
    
    return { gameManager, controls };
}

function setupTestDOM() {
    // Create mock DOM containers
    document.body.innerHTML = `
        <div class="control-panel"></div>
        <div class="analytics-panel"></div>
        <div class="pattern-library"></div>
    `;
}

function testUIManager() {
    setupTestDOM();
    
    const { gameManager, controls } = mockDependencies();
    const uiManager = new UIManager({ gameManager, controls });
    
    // Initialize UI
    uiManager.initialize();
    
    // Check if elements were created
    console.assert(document.querySelector('.simulation-controls'), 'Simulation controls should be created');
    console.assert(document.querySelector('.grid-settings'), 'Grid settings should be created');
    console.assert(document.querySelector('.boundary-setting'), 'Boundary setting should be created');
    console.assert(document.querySelector('.analytics-data'), 'Analytics should be created');
    
    // Test updating analytics
    uiManager.updateAnalytics();
    
    console.log('All UI Manager tests passed!');
}

// Run tests
testUIManager();
```

3. Test the refactored UI in the full application:
   - Check that all UI elements appear correctly
   - Verify that all interactions work as expected
   - Ensure there are no visual regressions

## Success Criteria
- UI generation is separated from event binding
- HTML templates are stored in dedicated files
- DOM manipulation is centralized in helper functions
- The code is more maintainable and follows the single responsibility principle
- All UI functionality works as expected
- No regression in UI appearance or behavior

## Rollback Plan
If issues arise:
1. Revert the changes to `src/ui/UIManager.js`
2. Remove the newly created template files and DOMHelper module
3. Test to ensure the application works correctly with the reverted code
4. Analyze the issues encountered and develop a new approach 