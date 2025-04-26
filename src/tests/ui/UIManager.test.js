/**
 * Game of Life Simulator - UIManager Tests
 * Tests for UIManager functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import UIManager from '../../ui/UIManager.js';

/**
 * Mock the DOM environment for testing
 */
function setupTestDOM() {
    // Create or clear body
    document.body.innerHTML = '';
    
    // Create mock DOM containers
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    document.body.appendChild(controlPanel);
    
    const analyticsPanel = document.createElement('div');
    analyticsPanel.className = 'analytics-panel';
    document.body.appendChild(analyticsPanel);
    
    const patternLibrary = document.createElement('div');
    patternLibrary.className = 'pattern-library';
    document.body.appendChild(patternLibrary);
}

/**
 * Mock dependencies for UIManager
 */
function mockDependencies() {
    // Mock Grid
    const grid = {
        rows: 50,
        cols: 50,
        boundaryType: 'toroidal',
        getAliveCellsCount: () => 0,
        resize: () => {},
        setBoundaryType: () => {}
    };
    
    // Mock Renderer
    const renderer = {
        canvas: document.createElement('canvas'),
        settings: { cellSize: 10 },
        calculateCellSize: () => 10,
        drawGrid: () => {}
    };
    
    // Mock GameManager
    const gameManager = {
        grid,
        renderer,
        generationCount: 0,
        simulationSpeed: 10,
        isSimulationRunning: false,
        startSimulation: () => {},
        pauseSimulation: () => {},
        stepSimulation: () => {},
        resetSimulation: () => {},
        updateSimulationSpeed: () => {}
    };
    
    // Mock Controls
    const controls = {
        createButton: (icon, label, onClick) => {
            const button = document.createElement('button');
            button.textContent = `${icon} ${label}`;
            button.addEventListener('click', onClick);
            return button;
        },
        createSpeedSlider: (min, max, value, onChange) => {
            const container = document.createElement('div');
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = min;
            slider.max = max;
            slider.value = value;
            slider.addEventListener('input', () => onChange(slider.value));
            container.appendChild(slider);
            return { container, slider };
        }
    };
    
    return { gameManager, controls };
}

/**
 * Test UI manager initialization and DOM element creation
 */
function testUIManagerInitialization() {
    setupTestDOM();
    const { gameManager, controls } = mockDependencies();
    
    const uiManager = new UIManager({ gameManager, controls });
    uiManager.initialize();
    
    // Check if elements were created
    const simulationControls = document.querySelector('.simulation-controls');
    console.assert(simulationControls, 'Simulation controls should be created');
    
    const gridSettings = document.querySelector('.grid-settings');
    console.assert(gridSettings, 'Grid settings should be created');
    
    const boundarySettings = document.querySelector('.boundary-setting');
    console.assert(boundarySettings, 'Boundary settings should be created');
    
    const analyticsPanel = document.querySelector('.analytics-panel__content');
    console.assert(analyticsPanel, 'Analytics panel should be created');
    
    // Check for specific elements and their functionality
    const buttonContainer = document.getElementById('control-buttons-container');
    console.assert(buttonContainer, 'Button container should be created');
    console.assert(buttonContainer.children.length === 4, 'Button container should have 4 buttons');
    
    const rowsInput = document.getElementById('rows-input');
    console.assert(rowsInput, 'Rows input should be created');
    console.assert(rowsInput.value === '50', 'Rows input should have correct initial value');
    
    const colsInput = document.getElementById('cols-input');
    console.assert(colsInput, 'Columns input should be created');
    console.assert(colsInput.value === '50', 'Columns input should have correct initial value');
    
    const boundarySelect = document.getElementById('boundary-select');
    console.assert(boundarySelect, 'Boundary select should be created');
    console.assert(boundarySelect.value === 'toroidal', 'Boundary select should have correct initial value');
    
    const generationCount = document.getElementById('generation-count');
    console.assert(generationCount, 'Generation count should be created');
    console.assert(generationCount.textContent === '0', 'Generation count should have correct initial value');
    
    // Test updateAnalytics
    gameManager.generationCount = 10;
    gameManager.isSimulationRunning = true;
    uiManager.updateAnalytics();
    
    console.assert(generationCount.textContent === '10', 'Generation count should be updated');
    console.assert(document.getElementById('simulation-state').textContent === 'Running', 'Simulation state should be updated');
    
    console.log('All UIManager tests passed!');
}

// Run tests
testUIManagerInitialization(); 