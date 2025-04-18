/**
 * Game of Life Simulator
 * Copyright (c) 2025 Antonio Innocente
 */

// Import pattern library module
import { patternLibrary, createPatternThumbnail, placePattern, placePatternInCenter, createPatternLibrary } from './patternLibrary.js';

// Game Manager object to maintain references across modules
window.gameManager = {
    grid: [],
    gridSettings: {
        rows: 50,
        cols: 50,
        gridColor: '#dddddd',
        cellColor: '#000000',
        backgroundColor: '#ffffff'
    },
    boundaryType: 'toroidal',
    isSimulationRunning: false,
    animationFrameId: null,
    lastFrameTime: 0,
    simulationSpeed: 10,
    generationCount: 0,
    
    // Helper function to update the local grid reference
    updateGridReference: function(newGrid) {
        this.grid = newGrid;
        // Also update the legacy grid variable for backward compatibility
        grid = newGrid;
    },
    
    // Function to handle pattern application
    applyPattern: function(patternId) {
        console.log(`Applying pattern ${patternId} via gameManager`);
        placePatternInCenter(
            patternId, 
            this.grid, 
            this.gridSettings, 
            drawGrid, 
            updateAnalytics, 
            initializeGrid
        );
    }
};

// Canvas and context references
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Legacy variables (kept for compatibility)
let gridSettings = window.gameManager.gridSettings;
let grid = window.gameManager.grid;
let boundaryType = window.gameManager.boundaryType;
let isSimulationRunning = window.gameManager.isSimulationRunning;
let animationFrameId = window.gameManager.animationFrameId;
let lastFrameTime = window.gameManager.lastFrameTime;
let simulationSpeed = window.gameManager.simulationSpeed;
let generationCount = window.gameManager.generationCount;

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', init);

// Initialize the grid with all cells dead (0)
function initializeGrid() {
    console.log("Initializing grid with dimensions:", gridSettings.rows, "x", gridSettings.cols);
    
    // Create a new grid
    const newGrid = [];
    for (let y = 0; y < gridSettings.rows; y++) {
        const row = [];
        for (let x = 0; x < gridSettings.cols; x++) {
            row.push(0); // 0 = dead, 1 = alive
        }
        newGrid.push(row);
    }
    
    // Update both references
    grid = newGrid;
    window.gameManager.grid = newGrid;
    
    console.log("Grid initialized:", newGrid);
    return newGrid;
}

// Calculate cell size based on canvas dimensions and grid size
function calculateCellSize() {
    const canvas = document.getElementById('game-canvas');
    const smallestDimension = Math.min(canvas.width, canvas.height);
    return Math.floor(smallestDimension / Math.max(gridSettings.rows, gridSettings.cols));
}

// Calculate canvas dimensions based on grid size
function calculateCanvasDimensions() {
    const canvas = document.getElementById('game-canvas');
    // Canvas size remains fixed at 600x600
    canvas.width = 800;
    canvas.height = 800;
    // Update cell size based on grid dimensions
    gridSettings.cellSize = calculateCellSize();
}

// Draw the grid on the canvas
function drawGrid() {
    console.log("Drawing grid...");
    
    // Use gameManager reference if available
    const currentGrid = window.gameManager ? window.gameManager.grid : grid;
    const currentSettings = window.gameManager ? window.gameManager.gridSettings : gridSettings;
    
    console.log(`Drawing grid with ${currentGrid.length} rows, settings: ${currentSettings.rows}x${currentSettings.cols}`);
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }
    
    const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
    
    // Clear the canvas
    ctx.fillStyle = currentSettings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the offset to center the grid
    const totalGridWidth = currentSettings.cols * currentSettings.cellSize;
    const totalGridHeight = currentSettings.rows * currentSettings.cellSize;
    const offsetX = Math.floor((canvas.width - totalGridWidth) / 2);
    const offsetY = Math.floor((canvas.height - totalGridHeight) / 2);
    
    // Performance optimization: batch similar operations
    const cellSize = currentSettings.cellSize;
    
    // First pass: Draw all live cells
    let liveCells = 0;
    ctx.fillStyle = currentSettings.cellColor;
    for (let y = 0; y < currentSettings.rows; y++) {
        if (!currentGrid[y]) {
            console.error(`Missing row ${y} in grid`);
            continue;
        }
        
        for (let x = 0; x < currentSettings.cols; x++) {
            if (currentGrid[y][x] === 1) {
                liveCells++;
                const cellX = offsetX + (x * cellSize);
                const cellY = offsetY + (y * cellSize);
                ctx.fillRect(cellX, cellY, cellSize, cellSize);
            }
        }
    }
    console.log(`Drew grid with ${liveCells} live cells`);
    
    // Second pass: Draw grid lines (only if cell size is large enough)
    if (cellSize >= 4) { // Skip grid lines for very small cells to improve performance
        ctx.strokeStyle = currentSettings.gridColor;
        ctx.beginPath();
        
        // Draw vertical lines
        for (let x = 0; x <= currentSettings.cols; x++) {
            const lineX = offsetX + (x * cellSize);
            ctx.moveTo(lineX, offsetY);
            ctx.lineTo(lineX, offsetY + totalGridHeight);
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= currentSettings.rows; y++) {
            const lineY = offsetY + (y * cellSize);
            ctx.moveTo(offsetX, lineY);
            ctx.lineTo(offsetX + totalGridWidth, lineY);
        }
        
        ctx.stroke();
    }
}

// Toggle the state of a cell
function toggleCell(x, y) {
    // Ensure coordinates are within grid bounds
    if (x >= 0 && x < gridSettings.cols && y >= 0 && y < gridSettings.rows) {
        // Toggle the cell state (0 to 1 or 1 to 0)
        grid[y][x] = grid[y][x] === 0 ? 1 : 0;
        // Redraw the grid to show the updated state
        drawGrid();
    }
}

// Get grid coordinates from mouse/touch position
function getCellCoordinates(event) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position within canvas
    let clientX, clientY;
    
    // Handle both mouse and touch events
    if (event.type.includes('touch')) {
        // Prevent default to avoid scrolling/zooming on touch devices
        event.preventDefault();
        
        // Get the first touch point
        if (event.touches && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            return null; // No valid touch point
        }
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    // Calculate the scale ratio between the canvas's displayed size and its actual size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Calculate the offset to center the grid
    const totalGridWidth = gridSettings.cols * gridSettings.cellSize;
    const totalGridHeight = gridSettings.rows * gridSettings.cellSize;
    const offsetX = (canvas.width - totalGridWidth) / 2;
    const offsetY = (canvas.height - totalGridHeight) / 2;
    
    // Get the position within the canvas, accounting for scaling and offset
    const canvasX = (clientX - rect.left) * scaleX - offsetX;
    const canvasY = (clientY - rect.top) * scaleY - offsetY;
    
    // Convert to grid coordinates
    const gridX = Math.floor(canvasX / gridSettings.cellSize);
    const gridY = Math.floor(canvasY / gridSettings.cellSize);
    
    // Validate grid coordinates are within bounds
    if (gridX < 0 || gridX >= gridSettings.cols || gridY < 0 || gridY >= gridSettings.rows) {
        return null; // Out of bounds
    }
    
    return { x: gridX, y: gridY };
}

// Handle canvas click/touch events
function handleCanvasInteraction(event) {
    // Prevent default behavior (like scrolling on mobile)
    event.preventDefault();
    
    const coords = getCellCoordinates(event);
    
    // Only toggle if we have valid coordinates
    if (coords) {
        toggleCell(coords.x, coords.y);
    }
}

// Setup event listeners for canvas interactions
function setupCanvasInteractions() {
    // Mouse events for desktop
    canvas.addEventListener('mousedown', handleCanvasInteraction);
    
    // Touch events for mobile devices
    canvas.addEventListener('touchstart', handleCanvasInteraction, { passive: false });
    
    // Additional touch event listeners to prevent unwanted behaviors
    canvas.addEventListener('touchmove', (event) => {
        // Prevent scrolling when interacting with canvas
        event.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', (event) => {
        event.preventDefault();
    }, { passive: false });
    
    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
    
    // Handle window resize events to ensure canvas scales correctly
    window.addEventListener('resize', () => {
        // Recalculate canvas dimensions and redraw grid on window resize
        calculateCanvasDimensions();
        drawGrid();
    });
}

// Create grid size settings panel
function createSettingsPanel() {
    const controlsContainer = document.querySelector('.controls');
    
    // Create grid settings section
    const gridSettings = document.createElement('div');
    gridSettings.className = 'grid-settings';
    
    // Create title for this section
    const gridTitle = document.createElement('h3');
    gridTitle.textContent = 'Grid Dimensions';
    gridSettings.appendChild(gridTitle);
    
    // Create preset buttons
    const presetButtons = document.createElement('div');
    presetButtons.className = 'preset-buttons';
    
    const btn50 = document.createElement('button');
    btn50.textContent = '50×50';
    btn50.addEventListener('click', () => resizeGrid(50, 50));
    presetButtons.appendChild(btn50);
    
    const btn75 = document.createElement('button');
    btn75.textContent = '75×75';
    btn75.addEventListener('click', () => resizeGrid(75, 75));
    presetButtons.appendChild(btn75);
    
    const btn100 = document.createElement('button');
    btn100.textContent = '100×100';
    btn100.addEventListener('click', () => resizeGrid(100, 100));
    presetButtons.appendChild(btn100);
    
    gridSettings.appendChild(presetButtons);
    
    // Create custom size inputs
    const customSize = document.createElement('div');
    customSize.className = 'custom-size';
    
    // Rows input
    const rowsLabel = document.createElement('label');
    rowsLabel.textContent = 'Rows:';
    customSize.appendChild(rowsLabel);
    
    const rowsInput = document.createElement('input');
    rowsInput.type = 'number';
    rowsInput.min = '10';
    rowsInput.max = '200';
    rowsInput.value = gridSettings.rows;
    customSize.appendChild(rowsInput);
    
    // Columns input
    const colsLabel = document.createElement('label');
    colsLabel.textContent = 'Columns:';
    customSize.appendChild(colsLabel);
    
    const colsInput = document.createElement('input');
    colsInput.type = 'number';
    colsInput.min = '10';
    colsInput.max = '200';
    colsInput.value = gridSettings.cols;
    customSize.appendChild(colsInput);
    
    // Apply button
    const applyButton = document.createElement('button');
    applyButton.id = 'apply-size';
    applyButton.className = 'primary-button';
    applyButton.textContent = 'Apply';
    applyButton.addEventListener('click', () => {
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        if (rows >= 10 && rows <= 200 && cols >= 10 && cols <= 200) {
            resizeGrid(rows, cols);
        }
    });
    customSize.appendChild(applyButton);
    
    gridSettings.appendChild(customSize);
    
    // Add to controls container
    controlsContainer.appendChild(gridSettings);
}

// Resize the grid with new dimensions
function resizeGrid(rows, cols) {
    gridSettings.rows = rows;
    gridSettings.cols = cols;
    calculateCanvasDimensions();
    initializeGrid();
    drawGrid();
    updateAnalytics();
}

// Count the number of alive neighbors for a given cell
function countAliveNeighbors(x, y) {
    // Use gameManager if available
    const manager = window.gameManager || {};
    const currentGrid = manager.grid || grid;
    const currentSettings = manager.gridSettings || gridSettings;
    const currentBoundary = manager.boundaryType || boundaryType;
    
    let count = 0;
    
    // Check all 8 neighboring cells (horizontal, vertical, diagonal)
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            // Skip the cell itself
            if (dx === 0 && dy === 0) continue;
            
            let nx, ny;
            
            if (currentBoundary === 'toroidal') {
                // Toroidal wrapping (edges connect)
                nx = (x + dx + currentSettings.cols) % currentSettings.cols;
                ny = (y + dy + currentSettings.rows) % currentSettings.rows;
            } else {
                // Finite grid (edges don't connect)
                nx = x + dx;
                ny = y + dy;
                
                // Skip if neighbor is outside grid boundaries
                if (nx < 0 || nx >= currentSettings.cols || ny < 0 || ny >= currentSettings.rows) {
                    continue;
                }
            }
            
            // Increment count if neighbor is alive
            if (currentGrid[ny][nx] === 1) {
                count++;
            }
        }
    }
    
    return count;
}

// Compute the next generation based on Game of Life rules
function computeNextGeneration() {
    // Use gameManager if available
    const manager = window.gameManager || {};
    const currentGrid = manager.grid || grid;
    const currentSettings = manager.gridSettings || gridSettings;
    const currentBoundary = manager.boundaryType || boundaryType;
    
    console.log(`Computing next generation with boundary type: ${currentBoundary}`);
    
    // Create a new grid for the next generation
    const nextGrid = [];
    for (let y = 0; y < currentSettings.rows; y++) {
        const row = [];
        for (let x = 0; x < currentSettings.cols; x++) {
            const aliveNeighbors = countAliveNeighbors(x, y);
            const isAlive = currentGrid[y][x] === 1;
            
            // Apply Conway's Game of Life rules:
            // 1. Any live cell with fewer than two live neighbors dies (underpopulation)
            // 2. Any live cell with two or three live neighbors lives on (survival)
            // 3. Any live cell with more than three live neighbors dies (overcrowding)
            // 4. Any dead cell with exactly three live neighbors becomes alive (reproduction)
            
            if (isAlive) {
                // Cell is currently alive
                if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                    // Rule 1 or 3: Die due to underpopulation or overcrowding
                    row.push(0);
                } else {
                    // Rule 2: Stay alive
                    row.push(1);
                }
            } else {
                // Cell is currently dead
                if (aliveNeighbors === 3) {
                    // Rule 4: Become alive due to reproduction
                    row.push(1);
                } else {
                    // Stay dead
                    row.push(0);
                }
            }
        }
        nextGrid.push(row);
    }
    
    // Update the current grid with the new generation
    if (manager.grid) {
        manager.grid = nextGrid;
    }
    grid = nextGrid;
    
    return nextGrid;
}

// Advance the simulation by one generation
function stepSimulation() {
    console.log("Stepping simulation");
    
    // Use gameManager if available
    const manager = window.gameManager || {};
    
    computeNextGeneration();
    drawGrid();
    
    // Update generation count in both places
    if (manager.generationCount !== undefined) {
        manager.generationCount++;
        generationCount = manager.generationCount;
    } else {
        generationCount++;
    }
    
    updateAnalytics();
}

// Function to toggle between toroidal and finite grid
function toggleBoundaryType() {
    console.log("Toggling boundary type");
    
    // Use gameManager if available
    const manager = window.gameManager || {};
    
    // Get current boundary type from manager or local variable
    const currentBoundary = manager.boundaryType || boundaryType;
    
    // Toggle the boundary type
    const newBoundary = currentBoundary === 'toroidal' ? 'finite' : 'toroidal';
    
    // Update both references
    if (manager.boundaryType !== undefined) {
        manager.boundaryType = newBoundary;
    }
    boundaryType = newBoundary;
    
    console.log(`Boundary type changed to: ${newBoundary}`);
    
    // Update the UI
    updateAnalytics();
    
    return newBoundary;
}

// Add boundary type toggle to settings panel
function addBoundaryToggle() {
    const controlsContainer = document.querySelector('.controls');
    
    // Create boundary setting section
    const boundarySettings = document.createElement('div');
    boundarySettings.className = 'boundary-setting';
    
    // Create title for this section
    const boundaryTitle = document.createElement('h3');
    boundaryTitle.textContent = 'Grid Boundary';
    boundarySettings.appendChild(boundaryTitle);
    
    // Create boundary type selector
    const boundarySelect = document.createElement('select');
    boundarySelect.id = 'boundary-type-select';
    
    const toroidalOption = document.createElement('option');
    toroidalOption.value = 'toroidal';
    toroidalOption.textContent = 'Toroidal (Edges Connect)';
    boundarySelect.appendChild(toroidalOption);
    
    const finiteOption = document.createElement('option');
    finiteOption.value = 'finite';
    finiteOption.textContent = 'Finite (Fixed Edges)';
    boundarySelect.appendChild(finiteOption);
    
    // Get current boundary type from gameManager or local variable
    const manager = window.gameManager || {};
    const currentBoundary = manager.boundaryType || boundaryType;
    
    boundarySelect.value = currentBoundary;
    boundarySelect.addEventListener('change', function() {
        const newBoundary = this.value;
        console.log(`Boundary type changed via selector to: ${newBoundary}`);
        
        // Update both references
        if (manager.boundaryType !== undefined) {
            manager.boundaryType = newBoundary;
        }
        boundaryType = newBoundary;
        
        // Update the display
        const boundaryTypeDisplay = document.getElementById('boundary-type');
        if (boundaryTypeDisplay) {
            boundaryTypeDisplay.textContent = newBoundary === 'toroidal' ? 'Toroidal' : 'Finite';
        }
        
        // Update analytics to show the change
        updateAnalytics();
    });
    
    boundarySettings.appendChild(boundarySelect);
    
    // Add to controls container
    controlsContainer.appendChild(boundarySettings);
}

// Start the simulation
function startSimulation() {
    console.log("Starting simulation");
    
    // Reference gameManager if available
    const manager = window.gameManager || {};
    
    if (manager.isSimulationRunning !== undefined) {
        if (manager.isSimulationRunning) {
            console.log("Simulation already running, ignoring start request");
            return;
        }
        manager.isSimulationRunning = true;
        isSimulationRunning = true;
    } else if (isSimulationRunning) {
        console.log("Simulation already running, ignoring start request");
        return;
    } else {
        isSimulationRunning = true;
    }
    
    updateAnalytics();
    
    // Reset timing
    if (manager.lastFrameTime !== undefined) {
        manager.lastFrameTime = 0;
        lastFrameTime = 0;
    } else {
        lastFrameTime = 0;
    }
    
    // Start the animation loop
    console.log("Starting animation loop");
    const animationRequest = requestAnimationFrame(simulationLoop);
    
    // Update animation frame ID in both places
    if (manager.animationFrameId !== undefined) {
        manager.animationFrameId = animationRequest;
    }
    animationFrameId = animationRequest;
}

// Pause the simulation
function pauseSimulation() {
    console.log("Pausing simulation");
    
    // Reference gameManager if available
    const manager = window.gameManager || {};
    
    if (manager.isSimulationRunning !== undefined) {
        if (!manager.isSimulationRunning) {
            console.log("Simulation already paused, ignoring pause request");
            return;
        }
        manager.isSimulationRunning = false;
        isSimulationRunning = false;
    } else if (!isSimulationRunning) {
        console.log("Simulation already paused, ignoring pause request");
        return;
    } else {
        isSimulationRunning = false;
    }
    
    updateAnalytics();
    
    // Cancel animation frame in both places
    if (manager.animationFrameId) {
        cancelAnimationFrame(manager.animationFrameId);
        manager.animationFrameId = null;
    }
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Reset simulation to initial state
function resetSimulation() {
    console.log("Resetting simulation");
    
    // Use gameManager if available
    const manager = window.gameManager || {};
    
    // Pause the simulation if it's running
    if ((manager.isSimulationRunning !== undefined && manager.isSimulationRunning) ||
        isSimulationRunning) {
        pauseSimulation();
    }
    
    // Reset the grid and generation counter
    initializeGrid();
    
    // Reset generation count in both places
    if (manager.generationCount !== undefined) {
        manager.generationCount = 0;
    }
    generationCount = 0;
    
    // Redraw the grid and update analytics
    drawGrid();
    updateAnalytics();
    
    console.log("Simulation reset complete");
}

// Update simulation speed
function updateSimulationSpeed(newSpeed) {
    console.log(`Updating simulation speed to: ${newSpeed} FPS`);
    
    // Parse the speed value
    const speedValue = parseInt(newSpeed, 10);
    
    // Use gameManager if available
    const manager = window.gameManager || {};
    
    // Update speed in both places
    if (manager.simulationSpeed !== undefined) {
        manager.simulationSpeed = speedValue;
    }
    simulationSpeed = speedValue;
    
    // Update the UI
    updateAnalytics();
}

// Update analytics display
function updateAnalytics() {
    console.log("Updating analytics");
    
    // Use gameManager if available
    const manager = window.gameManager || {};
    const currentGrid = manager.grid || grid;
    const currentSettings = manager.gridSettings || gridSettings;
    const currentBoundary = manager.boundaryType || boundaryType;
    const currentSimulationState = manager.isSimulationRunning !== undefined ? 
                                   manager.isSimulationRunning : isSimulationRunning;
    const currentSpeed = manager.simulationSpeed !== undefined ?
                         manager.simulationSpeed : simulationSpeed;
    const currentGeneration = manager.generationCount !== undefined ?
                              manager.generationCount : generationCount;
    
    // Count live cells
    let liveCellCount = 0;
    for (let y = 0; y < currentSettings.rows; y++) {
        if (!currentGrid[y]) continue;
        for (let x = 0; x < currentSettings.cols; x++) {
            if (currentGrid[y][x] === 1) {
                liveCellCount++;
            }
        }
    }
    
    // Calculate population density
    const totalCells = currentSettings.rows * currentSettings.cols;
    const density = (liveCellCount / totalCells) * 100;
    
    // Update all analytics displays
    const elements = {
        generationCount: document.getElementById('generation-count'),
        liveCellCount: document.getElementById('live-cell-count'),
        populationDensity: document.getElementById('population-density'),
        gridSize: document.getElementById('grid-size'),
        simulationSpeed: document.getElementById('simulation-speed'),
        simulationState: document.getElementById('simulation-state'),
        boundaryType: document.getElementById('boundary-type')
    };
    
    // Only update elements that exist
    if (elements.generationCount) elements.generationCount.textContent = currentGeneration;
    if (elements.liveCellCount) elements.liveCellCount.textContent = liveCellCount;
    if (elements.populationDensity) elements.populationDensity.textContent = density.toFixed(1) + '%';
    if (elements.gridSize) elements.gridSize.textContent = `${currentSettings.rows}×${currentSettings.cols}`;
    if (elements.simulationSpeed) elements.simulationSpeed.textContent = `${currentSpeed} FPS`;
    if (elements.simulationState) elements.simulationState.textContent = currentSimulationState ? 'Running' : 'Paused';
    if (elements.boundaryType) elements.boundaryType.textContent = currentBoundary.charAt(0).toUpperCase() + currentBoundary.slice(1);
    
    console.log(`Analytics updated: ${liveCellCount} live cells, generation ${currentGeneration}`);
}

// Create analytics display
function createAnalyticsDisplay() {
    const analyticsContainer = document.querySelector('.analytics');
    
    // Create analytics content container
    const analyticsContent = document.createElement('div');
    analyticsContent.className = 'analytics-content';
    
    // Create analytics data container
    const analyticsData = document.createElement('div');
    analyticsData.className = 'analytics-data';
    
    // Generation counter
    const generationItem = document.createElement('div');
    generationItem.className = 'analytics-item';
    
    const generationLabel = document.createElement('span');
    generationLabel.className = 'analytics-label';
    generationLabel.textContent = 'Generation:';
    generationItem.appendChild(generationLabel);
    
    const generationValue = document.createElement('span');
    generationValue.className = 'analytics-value';
    generationValue.id = 'generation-count';
    generationValue.textContent = '0';
    generationItem.appendChild(generationValue);
    
    analyticsData.appendChild(generationItem);
    
    // Live cell counter
    const liveCellItem = document.createElement('div');
    liveCellItem.className = 'analytics-item';
    
    const liveCellLabel = document.createElement('span');
    liveCellLabel.className = 'analytics-label';
    liveCellLabel.textContent = 'Live Cells:';
    liveCellItem.appendChild(liveCellLabel);
    
    const liveCellValue = document.createElement('span');
    liveCellValue.className = 'analytics-value';
    liveCellValue.id = 'live-cell-count';
    liveCellValue.textContent = '0';
    liveCellItem.appendChild(liveCellValue);
    
    analyticsData.appendChild(liveCellItem);
    
    // Population density counter
    const densityItem = document.createElement('div');
    densityItem.className = 'analytics-item';
    
    const densityLabel = document.createElement('span');
    densityLabel.className = 'analytics-label';
    densityLabel.textContent = 'Population Density:';
    densityItem.appendChild(densityLabel);
    
    const densityValue = document.createElement('span');
    densityValue.className = 'analytics-value';
    densityValue.id = 'population-density';
    densityValue.textContent = '0.0%';
    densityItem.appendChild(densityValue);
    
    analyticsData.appendChild(densityItem);
    
    // Grid size display
    const gridSizeItem = document.createElement('div');
    gridSizeItem.className = 'analytics-item';
    
    const gridSizeLabel = document.createElement('span');
    gridSizeLabel.className = 'analytics-label';
    gridSizeLabel.textContent = 'Grid Size:';
    gridSizeItem.appendChild(gridSizeLabel);
    
    const gridSizeValue = document.createElement('span');
    gridSizeValue.className = 'analytics-value';
    gridSizeValue.id = 'grid-size';
    gridSizeValue.textContent = gridSettings.rows + '×' + gridSettings.cols;
    gridSizeItem.appendChild(gridSizeValue);
    
    analyticsData.appendChild(gridSizeItem);
    
    // Add speed display
    const speedItem = document.createElement('div');
    speedItem.className = 'analytics-item';
    
    const speedLabel = document.createElement('span');
    speedLabel.className = 'analytics-label';
    speedLabel.textContent = 'Speed:';
    speedItem.appendChild(speedLabel);
    
    const speedValue = document.createElement('span');
    speedValue.className = 'analytics-value';
    speedValue.id = 'simulation-speed';
    speedValue.textContent = simulationSpeed + ' FPS';
    speedItem.appendChild(speedValue);
    
    analyticsData.appendChild(speedItem);
    
    // Add simulation state
    const stateItem = document.createElement('div');
    stateItem.className = 'analytics-item';
    
    const stateLabel = document.createElement('span');
    stateLabel.className = 'analytics-label';
    stateLabel.textContent = 'State:';
    stateItem.appendChild(stateLabel);
    
    const stateValue = document.createElement('span');
    stateValue.className = 'analytics-value';
    stateValue.id = 'simulation-state';
    stateValue.textContent = 'Paused';
    stateItem.appendChild(stateValue);
    
    analyticsData.appendChild(stateItem);
    
    // Add boundary type
    const boundaryItem = document.createElement('div');
    boundaryItem.className = 'analytics-item';
    
    const boundaryLabel = document.createElement('span');
    boundaryLabel.className = 'analytics-label';
    boundaryLabel.textContent = 'Boundary:';
    boundaryItem.appendChild(boundaryLabel);
    
    const boundaryValue = document.createElement('span');
    boundaryValue.className = 'analytics-value';
    boundaryValue.id = 'boundary-type';
    boundaryValue.textContent = 'Toroidal';
    boundaryItem.appendChild(boundaryValue);
    
    analyticsData.appendChild(boundaryItem);
    
    analyticsContent.appendChild(analyticsData);
    analyticsContainer.appendChild(analyticsContent);
}

// Create simulation controls
function createSimulationControls() {
    const controlsContainer = document.querySelector('.controls');
    
    // Create simulation controls section
    const simulationControls = document.createElement('div');
    simulationControls.className = 'simulation-controls';
    
    // Create title for this section
    const simulationTitle = document.createElement('h3');
    simulationTitle.textContent = 'Simulation Controls';
    simulationControls.appendChild(simulationTitle);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'control-buttons';
    
    // Start button
    const startButton = document.createElement('button');
    startButton.innerHTML = '<span class="icon">▶</span>';
    startButton.title = 'Start';
    startButton.addEventListener('click', startSimulation);
    buttonContainer.appendChild(startButton);
    
    // Pause button
    const pauseButton = document.createElement('button');
    pauseButton.innerHTML = '<span class="icon">⏸</span>';
    pauseButton.title = 'Pause';
    pauseButton.addEventListener('click', pauseSimulation);
    buttonContainer.appendChild(pauseButton);
    
    // Step button
    const stepButton = document.createElement('button');
    stepButton.innerHTML = '<span class="icon">➡</span>';
    stepButton.title = 'Step';
    stepButton.addEventListener('click', stepSimulation);
    buttonContainer.appendChild(stepButton);
    
    // Reset button
    const resetButton = document.createElement('button');
    resetButton.innerHTML = '<span class="icon">↺</span>';
    resetButton.title = 'Reset';
    resetButton.addEventListener('click', resetSimulation);
    buttonContainer.appendChild(resetButton);
    
    simulationControls.appendChild(buttonContainer);
    
    // Get current speed value
    const manager = window.gameManager || {};
    const currentSpeed = manager.simulationSpeed !== undefined ? 
                       manager.simulationSpeed : simulationSpeed;
    
    // Speed control
    const speedControl = document.createElement('div');
    speedControl.className = 'speed-control';
    
    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Speed: ' + currentSpeed + ' FPS';
    speedControl.appendChild(speedLabel);
    
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '60';
    speedSlider.value = currentSpeed;
    speedSlider.addEventListener('input', (e) => {
        const newSpeed = parseInt(e.target.value);
        
        // Update label
        speedLabel.textContent = 'Speed: ' + newSpeed + ' FPS';
        
        // Update speed in the game
        updateSimulationSpeed(newSpeed);
    });
    speedControl.appendChild(speedSlider);
    
    simulationControls.appendChild(speedControl);
    
    // Add to controls container
    controlsContainer.appendChild(simulationControls);
}

// Main simulation loop using requestAnimationFrame
function simulationLoop(timestamp) {
    // Reference gameManager if available
    const manager = window.gameManager || {};
    const isRunning = manager.isSimulationRunning !== undefined ? 
                     manager.isSimulationRunning : isSimulationRunning;
    
    // Exit early if not running
    if (!isRunning) {
        console.log("Simulation not running, exiting loop");
        return;
    }
    
    console.log("Running simulation loop");
    
    // Use performance.now() if available for more accurate timing
    const currentTime = timestamp || performance.now();
    
    // Get the appropriate lastFrameTime
    let lastTime = manager.lastFrameTime !== undefined ? 
                  manager.lastFrameTime : lastFrameTime;
    
    // Initialize lastFrameTime if it's the first frame
    if (!lastTime) {
        lastTime = currentTime;
        if (manager.lastFrameTime !== undefined) {
            manager.lastFrameTime = lastTime;
        }
        lastFrameTime = lastTime;
    }
    
    // Calculate time since last frame
    const elapsed = currentTime - lastTime;
    
    // Target frame interval based on simulation speed
    const speed = manager.simulationSpeed !== undefined ? 
                 manager.simulationSpeed : simulationSpeed;
    const frameInterval = 1000 / speed;
    
    // Check if it's time to update the simulation (based on simulation speed)
    if (elapsed >= frameInterval) {
        // Calculate how many generations to step forward
        // This allows catching up if the browser is struggling to maintain framerate
        const stepsToTake = Math.min(Math.floor(elapsed / frameInterval), 3); // Cap at 3 steps to prevent freezing
        
        // Step the simulation (usually just once, but can catch up if lagging)
        for (let i = 0; i < stepsToTake; i++) {
            stepSimulation();
        }
        
        // Update last frame time, accounting for any extra time
        const newLastTime = currentTime - (elapsed % frameInterval);
        
        if (manager.lastFrameTime !== undefined) {
            manager.lastFrameTime = newLastTime;
        }
        lastFrameTime = newLastTime;
    }
    
    // Continue the loop if simulation is running
    if (isRunning) {
        // Use requestAnimationFrame with a polyfill fallback for older browsers
        const animationRequest = (window.requestAnimationFrame || 
                           window.webkitRequestAnimationFrame || 
                           window.mozRequestAnimationFrame || 
                           (callback => window.setTimeout(callback, 1000/60)))(simulationLoop);
        
        // Update animation frame ID
        if (manager.animationFrameId !== undefined) {
            manager.animationFrameId = animationRequest;
        }
        animationFrameId = animationRequest;
    }
}

// Initialize the application
function init() {
    console.log("=== Starting initialization ===");
    
    // Initialize canvas with proper pixel ratio for high-DPI displays
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio > 1) {
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);
    }
    
    // Initialize grid and settings
    console.log("Calculating canvas dimensions");
    calculateCanvasDimensions();
    console.log("Initializing grid", typeof grid);
    initializeGrid();
    console.log("Drawing initial grid");
    drawGrid();
    
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Add a class to the body to help with CSS-specific adjustments
    document.body.classList.toggle('mobile-device', isMobile);
    
    // Set a smaller default grid size for mobile devices to improve performance
    if (isMobile && gridSettings.rows > 30) {
        console.log("Resizing grid for mobile");
        gridSettings.rows = 30;
        gridSettings.cols = 30;
        calculateCanvasDimensions();
        initializeGrid();
        drawGrid();
    }
    
    // Create required DOM elements 
    console.log("Creating UI elements");
    createSettingsPanel();
    addBoundaryToggle();
    createSimulationControls();
    createAnalyticsDisplay();
    
    console.log("Global grid before pattern library creation:", grid.length);
    
    // Create the pattern library (passing grid by reference)
    createPatternLibrary(grid, gridSettings, drawGrid, updateAnalytics, initializeGrid);
    
    console.log("Global grid after pattern library creation:", grid.length);
    
    // Place the R-Pentomino pattern in the center after the grid is initialized
    console.log("Placing initial pattern");
    placePatternInCenter('rpentomino', grid, gridSettings, drawGrid, updateAnalytics, initializeGrid);
    
    // Set up canvas interactions
    console.log("Setting up canvas interactions");
    setupCanvasInteractions();
    
    // Add window resize handler for responsive behavior
    window.addEventListener('resize', () => {
        // Recalculate dimensions and redraw
        calculateCanvasDimensions();
        drawGrid();
    });

    // Update analytics after everything is initialized
    updateAnalytics();
    
    console.log("=== Initialization complete ===");
    
    // Expose grid to window for debugging (without alert)
    window.gameGrid = grid;
    window.gameSettings = gridSettings;
    window.debugDrawGrid = drawGrid;
} 