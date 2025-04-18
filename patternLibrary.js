/**
 * Pattern Library Module for Game of Life Simulator
 * Copyright (c) 2025 Antonio Innocente
 */

// Gosper Glider Gun thumbnail settings
const GOSPER_GUN = {
    CELL_SIZE: 3,
    CENTRAL_START_X: 8,  // Adjusted to include more of the left "duck face"
    CENTRAL_WIDTH: 28,   // Adjusted to properly show distance to right square
    TOTAL_WIDTH: 36      // Total width of the pattern
};

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
function placePattern(patternId, x, y, grid, gridSettings) {
    const patternData = patternLibrary[patternId];
    if (!patternData) return grid;
    
    const pattern = patternData.pattern;
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    
    // Check if pattern fits within grid bounds
    if (x < 0 || y < 0 || x + patternWidth > gridSettings.cols || y + patternHeight > gridSettings.rows) {
        console.warn('Pattern would be placed outside grid bounds');
        return grid;
    }
    
    // Place the pattern on the grid
    for (let patternY = 0; patternY < patternHeight; patternY++) {
        for (let patternX = 0; patternX < patternWidth; patternX++) {
            if (pattern[patternY][patternX]) {
                grid[y + patternY][x + patternX] = 1;
            }
        }
    }
    
    return grid;
}

// Place a pattern in the center of the grid
function placePatternInCenter(patternId, grid, gridSettings, drawGrid, updateAnalytics, initializeGrid) {
    console.log(`Placing pattern ${patternId} in center`);
    
    // Get pattern data
    const patternData = patternLibrary[patternId];
    if (!patternData) {
        console.error(`Pattern ${patternId} not found`);
        return;
    }
    
    // Get grid and settings from gameManager if available
    if (window.gameManager) {
        console.log("Using gameManager grid reference");
        grid = window.gameManager.grid;
        gridSettings = window.gameManager.gridSettings;
    } else {
        console.log("Using provided grid reference");
    }
    
    console.log("Grid before:", Array.isArray(grid) ? grid.length : "Not an array");
    console.log("gridSettings:", gridSettings);
    
    // Clear the grid first
    if (typeof initializeGrid === 'function') {
        grid = initializeGrid();
    } else {
        // Fallback initialization if the function wasn't passed correctly
        console.warn("initializeGrid function not provided, using backup initialization");
        grid = [];
        for (let y = 0; y < gridSettings.rows; y++) {
            const row = [];
            for (let x = 0; x < gridSettings.cols; x++) {
                row.push(0);
            }
            grid.push(row);
        }
        
        // If gameManager exists, update its grid reference
        if (window.gameManager) {
            window.gameManager.grid = grid;
        }
    }
    
    console.log("Grid after initializing:", Array.isArray(grid) ? grid.length : "Not an array");
    
    const pattern = patternData.pattern;
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    
    // Calculate center coordinates
    const centerX = Math.floor((gridSettings.cols - patternWidth) / 2);
    const centerY = Math.floor((gridSettings.rows - patternHeight) / 2);
    console.log(`Placing at center coordinates: (${centerX}, ${centerY})`);
    
    try {
        // Place the pattern directly on the grid
        for (let patternY = 0; patternY < patternHeight; patternY++) {
            for (let patternX = 0; patternX < patternWidth; patternX++) {
                if (pattern[patternY][patternX]) {
                    if (grid[centerY + patternY] === undefined) {
                        console.error(`Invalid grid row: ${centerY + patternY}`);
                        continue;
                    }
                    grid[centerY + patternY][centerX + patternX] = 1;
                }
            }
        }
        
        console.log("Grid after placing pattern:", Array.isArray(grid) ? `${grid.length} rows` : "Not an array");
        
        // Redraw the grid
        console.log("About to call drawGrid()");
        if (typeof drawGrid === 'function') {
            drawGrid();
        } else {
            console.error("drawGrid function not provided");
        }
        
        console.log("About to call updateAnalytics()");
        if (typeof updateAnalytics === 'function') {
            updateAnalytics();
        } else {
            console.error("updateAnalytics function not provided");
        }
        
        console.log("Pattern placement complete");
        
        return grid;
    } catch (error) {
        console.error("Error placing pattern:", error);
        return grid;
    }
}

// Create the pattern library display
function createPatternLibrary(grid, gridSettings, drawGrid, updateAnalytics, initializeGrid) {
    console.log("Creating pattern library with grid:", grid);
    console.log("gridSettings:", gridSettings);
    
    const patternsContainer = document.querySelector('.patterns');
    if (!patternsContainer) {
        console.error('Pattern container not found');
        return;
    }
    
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
            
            // Add click event to place pattern using the gameManager
            patternCard.addEventListener('click', function() {
                console.log(`Clicked pattern: ${pattern.id}`);
                
                // Check if gameManager exists and use it
                if (window.gameManager) {
                    console.log("Using gameManager to apply pattern");
                    window.gameManager.applyPattern(pattern.id);
                } else {
                    console.log("Using direct function call to apply pattern");
                    console.log("Current grid state:", grid);
                    console.log("Grid settings:", gridSettings);
                    // Fallback to direct function call
                    placePatternInCenter(pattern.id, grid, gridSettings, drawGrid, updateAnalytics, initializeGrid);
                }
            });
            
            patternsGrid.appendChild(patternCard);
        });
        
        categoryDiv.appendChild(patternsGrid);
        patternGallery.appendChild(categoryDiv);
    });
    
    // Clear the container before appending to avoid duplicates
    patternsContainer.innerHTML = '<h2>Pattern Library</h2>';
    patternsContainer.appendChild(patternGallery);
}

// Export the functions and objects
export { 
    patternLibrary, 
    createPatternThumbnail, 
    placePattern, 
    placePatternInCenter, 
    createPatternLibrary 
}; 