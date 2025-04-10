/**
 * Game of Life Simulator
 * Copyright (c) 2025 Antonio Innocente
 */

// Canvas and context references
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Gosper Glider Gun thumbnail settings
const GOSPER_GUN = {
    CELL_SIZE: 3,
    CENTRAL_START_X: 8,  // Adjusted to include more of the left "duck face"
    CENTRAL_WIDTH: 28,   // Adjusted to properly show distance to right square
    TOTAL_WIDTH: 36      // Total width of the pattern
};

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
    canvas.width = 800;
    canvas.height = 800;
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
    
    boundarySelect.value = boundaryType;
    boundarySelect.addEventListener('change', function() {
        boundaryType = this.value;
        document.getElementById('boundary-type').textContent = 
            boundaryType === 'toroidal' ? 'Toroidal' : 'Finite';
    });
    
    boundarySettings.appendChild(boundarySelect);
    
    // Add to controls container
    controlsContainer.appendChild(boundarySettings);
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
    document.getElementById('simulation-speed').textContent = `${simulationSpeed} FPS`;
    document.getElementById('simulation-state').textContent = isSimulationRunning ? 'Running' : 'Paused';
    document.getElementById('boundary-type').textContent = boundaryType.charAt(0).toUpperCase() + boundaryType.slice(1);
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

// Update the simulation controls
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
    
    // Speed control
    const speedControl = document.createElement('div');
    speedControl.className = 'speed-control';
    
    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Speed: ' + simulationSpeed + ' FPS';
    speedControl.appendChild(speedLabel);
    
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '60';
    speedSlider.value = simulationSpeed;
    speedSlider.addEventListener('input', (e) => {
        const newSpeed = parseInt(e.target.value);
        simulationSpeed = newSpeed;
        speedLabel.textContent = 'Speed: ' + newSpeed + ' FPS';
        updateSimulationSpeed(newSpeed);
    });
    speedControl.appendChild(speedSlider);
    
    simulationControls.appendChild(speedControl);
    
    // Add to controls container
    controlsContainer.appendChild(simulationControls);
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
        // Create a more detailed representation by focusing on the important parts
        // The gun is 36 cells wide, but most activity is in central portion
        
        // Calculate offset to center the view on the important part
        const offsetX = Math.floor((width - (GOSPER_GUN.CENTRAL_WIDTH * GOSPER_GUN.CELL_SIZE)) / 2);
        const offsetY = Math.floor((height - (patternHeight * GOSPER_GUN.CELL_SIZE)) / 2);
        
        // Draw the central portion of the pattern
        thumbnailCtx.fillStyle = '#000000';
        for (let y = 0; y < patternHeight; y++) {
            for (let x = GOSPER_GUN.CENTRAL_START_X; x < GOSPER_GUN.CENTRAL_START_X + GOSPER_GUN.CENTRAL_WIDTH; x++) {
                if (pattern[y][x] === 1) {
                    thumbnailCtx.fillRect(
                        offsetX + (x - GOSPER_GUN.CENTRAL_START_X) * GOSPER_GUN.CELL_SIZE,
                        offsetY + y * GOSPER_GUN.CELL_SIZE,
                        GOSPER_GUN.CELL_SIZE,
                        GOSPER_GUN.CELL_SIZE
                    );
                }
            }
        }
        
        // Draw grid for better visualization
        thumbnailCtx.strokeStyle = '#eeeeee';
        thumbnailCtx.lineWidth = 0.5;
        
        for (let y = 0; y <= patternHeight; y++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX, offsetY + (y * GOSPER_GUN.CELL_SIZE));
            thumbnailCtx.lineTo(offsetX + (GOSPER_GUN.CENTRAL_WIDTH * GOSPER_GUN.CELL_SIZE), offsetY + (y * GOSPER_GUN.CELL_SIZE));
            thumbnailCtx.stroke();
        }
        
        for (let x = 0; x <= GOSPER_GUN.CENTRAL_WIDTH; x++) {
            thumbnailCtx.beginPath();
            thumbnailCtx.moveTo(offsetX + (x * GOSPER_GUN.CELL_SIZE), offsetY);
            thumbnailCtx.lineTo(offsetX + (x * GOSPER_GUN.CELL_SIZE), offsetY + (patternHeight * GOSPER_GUN.CELL_SIZE));
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

// Create the pattern library display
function createPatternLibrary() {
    const patternsContainer = document.querySelector('.patterns');
    
    // Create pattern gallery container
    const patternGallery = document.createElement('div');
    patternGallery.className = 'pattern-gallery';
    
    // Group patterns by category
    const patternsByCategory = {};
    Object.keys(patternLibrary).forEach(patternId => {
        const pattern = patternLibrary[patternId];
        if (!patternsByCategory[pattern.category]) {
            patternsByCategory[pattern.category] = [];
        }
        patternsByCategory[pattern.category].push({ id: patternId, ...pattern });
    });
    
    // Create sections for each category
    Object.keys(patternsByCategory).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'pattern-category';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        const categoryDescription = document.createElement('p');
        categoryDescription.className = 'category-description';
        switch (category) {
            case 'Still Life':
                categoryDescription.textContent = 'Patterns that remain unchanged from one generation to the next.';
                break;
            case 'Oscillator':
                categoryDescription.textContent = 'Patterns that return to their initial state after a finite number of generations.';
                break;
            case 'Spaceship':
                categoryDescription.textContent = 'Patterns that translate across the grid.';
                break;
            case 'Growth':
                categoryDescription.textContent = 'Patterns that evolve in interesting ways.';
                break;
            default:
                categoryDescription.textContent = '';
        }
        categoryDiv.appendChild(categoryDescription);
        
        // Add category description
        const categoryDescription = document.createElement('p');
        categoryDescription.className = 'category-description';
        categoryDescription.textContent = categories[category].description;
        categorySection.appendChild(categoryDescription);
        
        const patternsGrid = document.createElement('div');
        patternsGrid.className = 'patterns-grid';
        
        // Create a card for each pattern in this category
        patternsByCategory[category].forEach(pattern => {

            const patternCard = document.createElement('div');
            patternCard.className = 'pattern-card';
            patternCard.setAttribute('data-pattern-id', pattern.id);
            
            // Create thumbnail canvas
            const thumbnailCanvas = createPatternThumbnail(pattern.id);
            patternCard.appendChild(thumbnailCanvas);
            
            // Add pattern name
            const patternName = document.createElement('div');
            patternName.className = 'pattern-name';
            patternName.setAttribute('title', pattern.description);
            patternName.textContent = pattern.name;
            patternCard.appendChild(patternName);
            
            // Add click event to place pattern
            patternCard.addEventListener('click', () => {
                placePatternInCenter(pattern.id);
            });
            
            patternsGrid.appendChild(patternCard);
        });
        
        categoryDiv.appendChild(patternsGrid);
        patternGallery.appendChild(categoryDiv);
    });
    
    patternsContainer.appendChild(patternGallery);
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