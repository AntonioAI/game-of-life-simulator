/**
 * Game of Life Simulator
 * Copyright (c) 2025 Antonio Innocente
 */

// Canvas and context references
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Default grid settings
let gridSettings = {
    rows: 50,
    cols: 50,
    gridColor: '#dddddd',
    cellColor: '#000000',
    backgroundColor: '#ffffff'
};

// Grid state (2D array to store alive/dead states)
let grid = [];

// Grid boundary type (toroidal or finite)
let boundaryType = 'toroidal'; // default is toroidal (edges connect)

// Simulation loop variables
let isSimulationRunning = false;
let animationFrameId = null;
let lastFrameTime = 0;
let simulationSpeed = 10; // Frames per second
let generationCount = 0;

// Pattern definitions for the library
const patternLibrary = {
    // Still Lifes
    'block': {
        name: 'Block',
        category: 'Still Life',
        description: 'A 2×2 square that remains stable',
        pattern: [
            [1, 1],
            [1, 1]
        ]
    },
    'beehive': {
        name: 'Beehive',
        category: 'Still Life',
        description: 'A 6-cell pattern that remains stable',
        pattern: [
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [0, 1, 1, 0]
        ]
    },
    'boat': {
        name: 'Boat',
        category: 'Still Life',
        description: 'A 5-cell stable pattern',
        pattern: [
            [1, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ]
    },
    'loaf': {
        name: 'Loaf',
        category: 'Still Life',
        description: 'A 7-cell stable pattern',
        pattern: [
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [0, 1, 0, 1],
            [0, 0, 1, 0]
        ]
    },
    
    // Oscillators
    'blinker': {
        name: 'Blinker',
        category: 'Oscillator',
        description: 'A period 2 oscillator that alternates between horizontal and vertical',
        pattern: [
            [1],
            [1],
            [1]
        ]
    },
    'toad': {
        name: 'Toad',
        category: 'Oscillator',
        description: 'A period 2 oscillator with 6 cells',
        pattern: [
            [0, 1, 1, 1],
            [1, 1, 1, 0]
        ]
    },
    'pulsar': {
        name: 'Pulsar',
        category: 'Oscillator',
        description: 'A period 3 oscillator with 48 cells',
        pattern: [
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
        ]
    },
    
    // Spaceships
    'glider': {
        name: 'Glider',
        category: 'Spaceship',
        description: 'A small spaceship that moves diagonally',
        pattern: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ]
    },
    'lwss': {
        name: 'Lightweight Spaceship',
        category: 'Spaceship',
        description: 'A small spaceship that moves horizontally',
        pattern: [
            [0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 0]
        ]
    },
    
    // Growth Patterns
    'rpentomino': {
        name: 'R-Pentomino',
        category: 'Growth',
        description: 'A small pattern that grows chaotically',
        pattern: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 1, 0]
        ]
    },
    'gosperglidergun': {
        name: 'Gosper Glider Gun',
        category: 'Growth',
        description: 'A pattern that continuously creates gliders',
        pattern: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]
    }
};

// Initialize the grid with all cells dead (0)
function initializeGrid() {
    grid = [];
    for (let y = 0; y < gridSettings.rows; y++) {
        const row = [];
        for (let x = 0; x < gridSettings.cols; x++) {
            row.push(0); // 0 = dead, 1 = alive
        }
        grid.push(row);
    }
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
    canvas.width = 600;
    canvas.height = 600;
    // Update cell size based on grid dimensions
    gridSettings.cellSize = calculateCellSize();
}

// Draw the grid on the canvas
function drawGrid() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
    
    // Clear the canvas
    ctx.fillStyle = gridSettings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the offset to center the grid
    const totalGridWidth = gridSettings.cols * gridSettings.cellSize;
    const totalGridHeight = gridSettings.rows * gridSettings.cellSize;
    const offsetX = Math.floor((canvas.width - totalGridWidth) / 2);
    const offsetY = Math.floor((canvas.height - totalGridHeight) / 2);
    
    // Performance optimization: batch similar operations
    const cellSize = gridSettings.cellSize;
    
    // First pass: Draw all live cells
    ctx.fillStyle = gridSettings.cellColor;
    for (let y = 0; y < gridSettings.rows; y++) {
        for (let x = 0; x < gridSettings.cols; x++) {
            if (grid[y][x] === 1) {
                const cellX = offsetX + (x * cellSize);
                const cellY = offsetY + (y * cellSize);
                ctx.fillRect(cellX, cellY, cellSize, cellSize);
            }
        }
    }
    
    // Second pass: Draw grid lines (only if cell size is large enough)
    if (cellSize >= 4) { // Skip grid lines for very small cells to improve performance
        ctx.strokeStyle = gridSettings.gridColor;
        ctx.beginPath();
        
        // Draw vertical lines
        for (let x = 0; x <= gridSettings.cols; x++) {
            const lineX = offsetX + (x * cellSize);
            ctx.moveTo(lineX, offsetY);
            ctx.lineTo(lineX, offsetY + totalGridHeight);
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= gridSettings.rows; y++) {
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
    const controlsDiv = document.querySelector('.controls');
    
    // Create the settings container
    const settingsDiv = document.createElement('div');
    settingsDiv.className = 'grid-settings';
    settingsDiv.innerHTML = `
        <h3>Grid Dimensions</h3>
        <div class="preset-buttons">
            <button data-size="50">50×50</button>
            <button data-size="75">75×75</button>
            <button data-size="100">100×100</button>
        </div>
        <div class="custom-size">
            <label for="custom-rows">Rows:</label>
            <input type="number" id="custom-rows" min="10" max="200" value="${gridSettings.rows}">
            <label for="custom-cols">Columns:</label>
            <input type="number" id="custom-cols" min="10" max="200" value="${gridSettings.cols}">
            <button id="apply-size">Apply</button>
        </div>
    `;
    
    controlsDiv.appendChild(settingsDiv);
    
    // Add event listeners to preset buttons
    const presetButtons = settingsDiv.querySelectorAll('.preset-buttons button');
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const size = parseInt(button.getAttribute('data-size'), 10);
            resizeGrid(size, size);
        });
    });
    
    // Add event listener to custom size apply button
    const applyButton = document.getElementById('apply-size');
    applyButton.addEventListener('click', () => {
        const rows = parseInt(document.getElementById('custom-rows').value, 10);
        const cols = parseInt(document.getElementById('custom-cols').value, 10);
        
        // Validate input
        if (isNaN(rows) || isNaN(cols) || rows < 10 || cols < 10 || rows > 200 || cols > 200) {
            alert('Please enter valid dimensions (10-200)');
            return;
        }
        
        resizeGrid(rows, cols);
    });
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
    let count = 0;
    
    // Check all 8 neighboring cells (horizontal, vertical, diagonal)
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            // Skip the cell itself
            if (dx === 0 && dy === 0) continue;
            
            let nx, ny;
            
            if (boundaryType === 'toroidal') {
                // Toroidal wrapping (edges connect)
                nx = (x + dx + gridSettings.cols) % gridSettings.cols;
                ny = (y + dy + gridSettings.rows) % gridSettings.rows;
            } else {
                // Finite grid (edges don't connect)
                nx = x + dx;
                ny = y + dy;
                
                // Skip if neighbor is outside grid boundaries
                if (nx < 0 || nx >= gridSettings.cols || ny < 0 || ny >= gridSettings.rows) {
                    continue;
                }
            }
            
            // Increment count if neighbor is alive
            if (grid[ny][nx] === 1) {
                count++;
            }
        }
    }
    
    return count;
}

// Compute the next generation based on Game of Life rules
function computeNextGeneration() {
    // Create a new grid for the next generation
    const nextGrid = [];
    for (let y = 0; y < gridSettings.rows; y++) {
        const row = [];
        for (let x = 0; x < gridSettings.cols; x++) {
            const aliveNeighbors = countAliveNeighbors(x, y);
            const isAlive = grid[y][x] === 1;
            
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
    grid = nextGrid;
}

// Advance the simulation by one generation
function stepSimulation() {
    computeNextGeneration();
    drawGrid();
    generationCount++;
    updateAnalytics();
}

// Function to toggle between toroidal and finite grid
function toggleBoundaryType() {
    boundaryType = boundaryType === 'toroidal' ? 'finite' : 'toroidal';
    updateAnalytics();
    return boundaryType;
}

// Add boundary type toggle to settings panel
function addBoundaryToggle() {
    const settingsDiv = document.querySelector('.grid-settings');
    
    const boundaryDiv = document.createElement('div');
    boundaryDiv.className = 'boundary-setting';
    boundaryDiv.innerHTML = `
        <label for="boundary-toggle">Grid Boundary:</label>
        <select id="boundary-toggle">
            <option value="toroidal" selected>Toroidal (Edges Connect)</option>
            <option value="finite">Finite (Fixed Edges)</option>
        </select>
    `;
    
    settingsDiv.appendChild(boundaryDiv);
    
    // Add event listener to the boundary toggle
    const boundaryToggle = document.getElementById('boundary-toggle');
    boundaryToggle.addEventListener('change', () => {
        boundaryType = boundaryToggle.value;
        updateAnalytics();
    });
}

// Main simulation loop using requestAnimationFrame
function simulationLoop(timestamp) {
    // Use performance.now() if available for more accurate timing
    const currentTime = timestamp || performance.now();
    
    // Initialize lastFrameTime if it's the first frame
    if (!lastFrameTime) lastFrameTime = currentTime;
    
    // Calculate time since last frame
    const elapsed = currentTime - lastFrameTime;
    
    // Target frame interval based on simulation speed
    const frameInterval = 1000 / simulationSpeed;
    
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
        lastFrameTime = currentTime - (elapsed % frameInterval);
    }
    
    // Continue the loop if simulation is running
    if (isSimulationRunning) {
        // Use requestAnimationFrame with a polyfill fallback for older browsers
        animationFrameId = (window.requestAnimationFrame || 
                           window.webkitRequestAnimationFrame || 
                           window.mozRequestAnimationFrame || 
                           (callback => window.setTimeout(callback, 1000/60)))(simulationLoop);
    }
}

// Start the simulation
function startSimulation() {
    if (isSimulationRunning) return;
    
    // Set the simulation state to running
    isSimulationRunning = true;
    updateAnalytics();
    
    // Start the animation loop
    lastFrameTime = 0;
    animationFrameId = requestAnimationFrame(simulationLoop);
}

// Pause the simulation
function pauseSimulation() {
    if (!isSimulationRunning) return;
    
    // Set the simulation state to paused
    isSimulationRunning = false;
    updateAnalytics();
    
    // Cancel any pending animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Reset simulation to initial state
function resetSimulation() {
    // Pause the simulation if it's running
    if (isSimulationRunning) {
        pauseSimulation();
    }
    
    // Reset the grid and generation counter
    initializeGrid();
    generationCount = 0;
    
    // Redraw the grid and update analytics
    drawGrid();
    updateAnalytics();
}

// Update simulation speed
function updateSimulationSpeed(newSpeed) {
    simulationSpeed = parseInt(newSpeed, 10);
    updateAnalytics();
}

// Update analytics display
function updateAnalytics() {
    // Count live cells
    let liveCellCount = 0;
    for (let y = 0; y < gridSettings.rows; y++) {
        for (let x = 0; x < gridSettings.cols; x++) {
            if (grid[y][x] === 1) {
                liveCellCount++;
            }
        }
    }
    
    // Calculate population density
    const totalCells = gridSettings.rows * gridSettings.cols;
    const density = (liveCellCount / totalCells) * 100;
    
    // Update all analytics displays
    document.getElementById('generation-count').textContent = generationCount;
    document.getElementById('live-cell-count').textContent = liveCellCount;
    document.getElementById('population-density').textContent = density.toFixed(1) + '%';
    document.getElementById('grid-size').textContent = `${gridSettings.rows}×${gridSettings.cols}`;
    document.getElementById('speed-display').textContent = `${simulationSpeed} FPS`;
    document.getElementById('simulation-state').textContent = isSimulationRunning ? 'Running' : 'Paused';
    document.getElementById('boundary-type-display').textContent = boundaryType.charAt(0).toUpperCase() + boundaryType.slice(1);
}

// Create analytics display
function createAnalyticsDisplay() {
    const analyticsDiv = document.querySelector('.analytics');
    
    const analyticsContent = document.createElement('div');
    analyticsContent.className = 'analytics-content';
    analyticsContent.innerHTML = `
        <h3>Analytics</h3>
        <div class="analytics-data">
            <div class="analytics-item">
                <span class="analytics-label">Generation:</span>
                <span id="generation-count" class="analytics-value">0</span>
            </div>
            <div class="analytics-item">
                <span class="analytics-label">Live Cells:</span>
                <span id="live-cell-count" class="analytics-value">0</span>
            </div>
            <div class="analytics-item">
                <span class="analytics-label">Population Density:</span>
                <span id="population-density" class="analytics-value">0.0%</span>
            </div>
            <div class="analytics-item">
                <span class="analytics-label">Grid Size:</span>
                <span id="grid-size" class="analytics-value">50×50</span>
            </div>
            <div class="analytics-item">
                <span class="analytics-label">Speed:</span>
                <span id="speed-display" class="analytics-value">10 FPS</span>
            </div>
            <div class="analytics-item">
                <span class="analytics-label">State:</span>
                <span id="simulation-state" class="analytics-value">Paused</span>
            </div>
            <div class="analytics-item">
                <span class="analytics-label">Boundary:</span>
                <span id="boundary-type-display" class="analytics-value">Toroidal</span>
            </div>
        </div>
    `;
    
    analyticsDiv.appendChild(analyticsContent);
    
    // Initialize analytics
    updateAnalytics();
}

// Update the simulation controls
function createSimulationControls() {
    const controlsDiv = document.querySelector('.controls');
    
    // Create the controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'simulation-controls';
    controlsContainer.innerHTML = `
        <h3>Simulation Controls</h3>
        <div class="control-buttons">
            <button id="start-button" class="primary-button"><span class="icon">▶</span> Start</button>
            <button id="pause-button" disabled><span class="icon">⏸</span> Pause</button>
            <button id="step-button"><span class="icon">➡</span> Step</button>
            <button id="reset-button"><span class="icon">↺</span> Reset</button>
        </div>
        <div class="speed-control">
            <label for="speed-slider">Speed: <span id="speed-value">${simulationSpeed}</span> FPS</label>
            <input type="range" id="speed-slider" min="1" max="60" value="${simulationSpeed}" step="1">
        </div>
    `;
    
    controlsDiv.appendChild(controlsContainer);
    
    // Add event listeners to control buttons
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const stepButton = document.getElementById('step-button');
    const resetButton = document.getElementById('reset-button');
    
    startButton.addEventListener('click', () => {
        startSimulation();
        startButton.disabled = true;
        pauseButton.disabled = false;
        pauseButton.classList.add('primary-button');
        startButton.classList.remove('primary-button');
    });
    
    pauseButton.addEventListener('click', () => {
        pauseSimulation();
        pauseButton.disabled = true;
        startButton.disabled = false;
        startButton.classList.add('primary-button');
        pauseButton.classList.remove('primary-button');
    });
    
    stepButton.addEventListener('click', stepSimulation);
    resetButton.addEventListener('click', () => {
        resetSimulation();
        // Reset button states
        startButton.disabled = false;
        pauseButton.disabled = true;
        startButton.classList.add('primary-button');
        pauseButton.classList.remove('primary-button');
    });
    
    // Add event listener to speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    
    speedSlider.addEventListener('input', () => {
        const newSpeed = speedSlider.value;
        speedValue.textContent = newSpeed;
        updateSimulationSpeed(newSpeed);
    });
}

// Render a pattern on a small canvas for the thumbnail
function createPatternThumbnail(patternId, width = 80, height = 80) {
    const patternData = patternLibrary[patternId];
    if (!patternData) return null;
    
    const pattern = patternData.pattern;
    
    // Create a small canvas for the thumbnail
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;
    const thumbnailCtx = thumbnailCanvas.getContext('2d');
    
    // Clear thumbnail canvas
    thumbnailCtx.fillStyle = '#ffffff';
    thumbnailCtx.fillRect(0, 0, width, height);
    
    // Calculate cell size based on pattern dimensions
    const patternWidth = pattern[0].length;
    const patternHeight = pattern.length;
    
    // Special case for Gosper Glider Gun - use a higher quality downsampling
    if (patternId === 'gosperglidergun') {
        // Fixed cell size for glider gun to ensure it's visible
        const cellSize = 3;
        
        // Create a more detailed representation by focusing on the important parts
        // The gun is 36 cells wide, but most activity is in central portion
        const centralStartX = 8;  // Adjusted from 10 to include more of the left "duck face"
        const centralWidth = 28;  // Adjusted from 26 to properly show distance to right square
        
        // Calculate offset to center the view on the important part
        const offsetX = Math.floor((width - (centralWidth * cellSize)) / 2);
        const offsetY = Math.floor((height - (patternHeight * cellSize)) / 2);
        
        // Draw the central portion of the pattern
        thumbnailCtx.fillStyle = '#000000';
        for (let y = 0; y < patternHeight; y++) {
            for (let x = centralStartX; x < centralStartX + centralWidth && x < patternWidth; x++) {
                if (pattern[y][x]) {
                    thumbnailCtx.fillRect(
                        offsetX + ((x - centralStartX) * cellSize),
                        offsetY + (y * cellSize),
                        cellSize,
                        cellSize
                    );
                }
            }
        }
        
        // Draw grid for better visualization
        thumbnailCtx.strokeStyle = '#eeeeee';
        thumbnailCtx.lineWidth = 0.5;
        
        for (let y = 0; y <= patternHeight; y++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX, offsetY + (y * cellSize));
            thumbnailCtx.lineTo(offsetX + (centralWidth * cellSize), offsetY + (y * cellSize));
            thumbnailCtx.stroke();
        }
        
        for (let x = 0; x <= centralWidth; x++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX + (x * cellSize), offsetY);
            thumbnailCtx.lineTo(offsetX + (x * cellSize), offsetY + (patternHeight * cellSize));
            thumbnailCtx.stroke();
        }
    }
    // For other large patterns, use the scaled approach
    else if (patternWidth > 16 || patternHeight > 16) {
        // Determine the optimal scale factor based on pattern size
        let scaleFactor = Math.max(1, Math.ceil(Math.max(patternWidth, patternHeight) / 16));
        
        // Ensure we have enough cells to make a meaningful thumbnail
        if (patternWidth / scaleFactor < 4 || patternHeight / scaleFactor < 4) {
            scaleFactor = Math.max(1, Math.floor(Math.max(patternWidth, patternHeight) / 8));
        }
        
        // Adjust cell size based on the scaled dimensions
        const scaledWidth = Math.ceil(patternWidth / scaleFactor);
        const scaledHeight = Math.ceil(patternHeight / scaleFactor);
        
        const cellSize = Math.min(
            Math.floor((width - 10) / scaledWidth),
            Math.floor((height - 10) / scaledHeight)
        );
        
        // Create the scaled pattern
        const scaledPattern = Array(scaledHeight).fill().map(() => Array(scaledWidth).fill(0));
        
        // Improved downsampling to preserve pattern structure
        for (let y = 0; y < patternHeight; y++) {
            for (let x = 0; x < patternWidth; x++) {
                if (pattern[y][x]) {
                    const scaledX = Math.floor(x / scaleFactor);
                    const scaledY = Math.floor(y / scaleFactor);
                    scaledPattern[scaledY][scaledX] = 1;
                }
            }
        }
        
        // Calculate offset for the scaled pattern
        const offsetX = Math.floor((width - (scaledWidth * cellSize)) / 2);
        const offsetY = Math.floor((height - (scaledHeight * cellSize)) / 2);
        
        // Draw the scaled pattern
        thumbnailCtx.fillStyle = '#000000';
        for (let y = 0; y < scaledHeight; y++) {
            for (let x = 0; x < scaledWidth; x++) {
                if (scaledPattern[y][x]) {
                    thumbnailCtx.fillRect(
                        offsetX + (x * cellSize),
                        offsetY + (y * cellSize),
                        cellSize,
                        cellSize
                    );
                }
            }
        }
        
        // Draw grid
        thumbnailCtx.strokeStyle = '#dddddd';
        for (let y = 0; y <= scaledHeight; y++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX, offsetY + (y * cellSize));
            thumbnailCtx.lineTo(offsetX + (scaledWidth * cellSize), offsetY + (y * cellSize));
            thumbnailCtx.stroke();
        }
        
        for (let x = 0; x <= scaledWidth; x++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX + (x * cellSize), offsetY);
            thumbnailCtx.lineTo(offsetX + (x * cellSize), offsetY + (scaledHeight * cellSize));
            thumbnailCtx.stroke();
        }
    } else {
        // Normal pattern rendering for smaller patterns
        // Calculate cell size
        const cellSize = Math.min(
            Math.floor((width - 10) / patternWidth),
            Math.floor((height - 10) / patternHeight)
        );
        
        // Calculate offset to center the pattern
        const offsetX = Math.floor((width - (patternWidth * cellSize)) / 2);
        const offsetY = Math.floor((height - (patternHeight * cellSize)) / 2);
        
        // Draw the pattern
        thumbnailCtx.fillStyle = '#000000';
        for (let y = 0; y < patternHeight; y++) {
            for (let x = 0; x < patternWidth; x++) {
                if (pattern[y][x]) {
                    thumbnailCtx.fillRect(
                        offsetX + (x * cellSize),
                        offsetY + (y * cellSize),
                        cellSize,
                        cellSize
                    );
                }
            }
        }
        
        // Draw a grid (optional for visual clarity)
        thumbnailCtx.strokeStyle = '#dddddd';
        for (let y = 0; y <= patternHeight; y++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX, offsetY + (y * cellSize));
            thumbnailCtx.lineTo(offsetX + (patternWidth * cellSize), offsetY + (y * cellSize));
            thumbnailCtx.stroke();
        }
        
        for (let x = 0; x <= patternWidth; x++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX + (x * cellSize), offsetY);
            thumbnailCtx.lineTo(offsetX + (x * cellSize), offsetY + (patternHeight * cellSize));
            thumbnailCtx.stroke();
        }
    }
    
    return thumbnailCanvas;
}

// Place a pattern on the grid at the specified position
function placePattern(patternId, x, y) {
    const patternData = patternLibrary[patternId];
    if (!patternData) return;
    
    const pattern = patternData.pattern;
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    
    // Check if pattern fits within grid bounds
    if (x < 0 || y < 0 || x + patternWidth > gridSettings.cols || y + patternHeight > gridSettings.rows) {
        console.warn('Pattern would be placed outside grid bounds');
        return;
    }
    
    // Place the pattern on the grid
    for (let patternY = 0; patternY < patternHeight; patternY++) {
        for (let patternX = 0; patternX < patternWidth; patternX++) {
            if (pattern[patternY][patternX]) {
                grid[y + patternY][x + patternX] = 1;
            }
        }
    }
    
    // Redraw the grid
    drawGrid();
    updateAnalytics();
}

// Place a pattern in the center of the grid
function placePatternInCenter(patternId) {
    const patternData = patternLibrary[patternId];
    if (!patternData) return;
    
    const pattern = patternData.pattern;
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    
    // Calculate center coordinates
    const centerX = Math.floor((gridSettings.cols - patternWidth) / 2);
    const centerY = Math.floor((gridSettings.rows - patternHeight) / 2);
    
    // Place the pattern
    placePattern(patternId, centerX, centerY);
}

// Create the pattern library UI
function createPatternLibrary() {
    const patternsDiv = document.querySelector('.patterns');
    patternsDiv.innerHTML = '<h2>Pattern Library</h2>';
    
    // Create categories for organization
    const categories = {
        'Still Life': [],
        'Oscillator': [],
        'Spaceship': [],
        'Growth': []
    };
    
    // Organize patterns by category
    for (const patternId in patternLibrary) {
        const pattern = patternLibrary[patternId];
        if (categories[pattern.category]) {
            categories[pattern.category].push(patternId);
        }
    }
    
    // Create the gallery grid container
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'pattern-gallery';
    
    // Create section for each category
    for (const category in categories) {
        if (categories[category].length === 0) continue;
        
        const categorySection = document.createElement('div');
        categorySection.className = 'pattern-category';
        
        const categoryHeader = document.createElement('h3');
        categoryHeader.textContent = category;
        categorySection.appendChild(categoryHeader);
        
        const patternsGrid = document.createElement('div');
        patternsGrid.className = 'patterns-grid';
        
        // Add each pattern in this category
        categories[category].forEach(patternId => {
            const pattern = patternLibrary[patternId];
            
            const patternCard = document.createElement('div');
            patternCard.className = 'pattern-card';
            patternCard.dataset.pattern = patternId;
            
            // Create thumbnail
            const thumbnail = createPatternThumbnail(patternId);
            if (thumbnail) {
                patternCard.appendChild(thumbnail);
            }
            
            // Pattern name
            const patternName = document.createElement('div');
            patternName.className = 'pattern-name';
            patternName.textContent = pattern.name;
            patternCard.appendChild(patternName);
            
            // Add tooltip with description
            patternCard.title = pattern.description;
            
            // Add click handler to place the pattern
            patternCard.addEventListener('click', () => {
                placePatternInCenter(patternId);
            });
            
            patternsGrid.appendChild(patternCard);
        });
        
        categorySection.appendChild(patternsGrid);
        galleryContainer.appendChild(categorySection);
    }
    
    patternsDiv.appendChild(galleryContainer);
}

// Update the init function to include the pattern library and device detection
function init() {
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Add a class to the body to help with CSS-specific adjustments
    document.body.classList.toggle('mobile-device', isMobile);
    
    // Set a smaller default grid size for mobile devices to improve performance
    if (isMobile && gridSettings.rows > 30) {
        gridSettings.rows = 30;
        gridSettings.cols = 30;
    }
    
    // Initialize canvas with proper pixel ratio for high-DPI displays
    const pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio > 1) {
        const canvas = document.getElementById('game-canvas');
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.width = canvas.width * pixelRatio;
        canvas.height = canvas.height * pixelRatio;
        const ctx = canvas.getContext('2d');
        ctx.scale(pixelRatio, pixelRatio);
    }
    
    // Initialize the simulation
    calculateCanvasDimensions();
    initializeGrid();
    drawGrid();
    createSettingsPanel();
    addBoundaryToggle();
    createSimulationControls();
    createAnalyticsDisplay();
    createPatternLibrary();
    setupCanvasInteractions();
    
    // Add window resize handler for responsive behavior
    window.addEventListener('resize', () => {
        // Recalculate dimensions and redraw
        calculateCanvasDimensions();
        drawGrid();
    });
}

// Removing the existing init function call to avoid duplication
window.removeEventListener('load', init);

// Call init when the page is loaded
window.addEventListener('load', init); 