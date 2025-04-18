/**
 * Game of Life Simulator - PatternLibrary Module
 * Responsible for pattern definitions and management
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * PatternLibrary class for managing pattern definitions
 */
class PatternLibrary {
    constructor() {
        // Gosper Glider Gun thumbnail settings for special rendering
        this.GOSPER_GUN = {
            CELL_SIZE: 3,
            CENTRAL_START_X: 8,
            CENTRAL_WIDTH: 28,
            TOTAL_WIDTH: 36
        };
        
        this.patterns = {
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
    }
    
    /**
     * Initialize the pattern library
     */
    initialize() {
        console.log("Initializing pattern library");
    }
    
    /**
     * Create pattern thumbnails
     * @param {string} patternId - The ID of the pattern
     * @param {number} width - Thumbnail width
     * @param {number} height - Thumbnail height
     * @returns {HTMLCanvasElement} The thumbnail canvas
     */
    createPatternThumbnail(patternId, width = 80, height = 80) {
        const patternData = this.patterns[patternId];
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
            // Calculate offset to center the view on the important part
            const offsetX = Math.floor((width - (this.GOSPER_GUN.CENTRAL_WIDTH * this.GOSPER_GUN.CELL_SIZE)) / 2);
            const offsetY = Math.floor((height - (patternHeight * this.GOSPER_GUN.CELL_SIZE)) / 2);
            
            // Draw the central portion of the pattern
            thumbnailCtx.fillStyle = '#000000';
            for (let y = 0; y < patternHeight; y++) {
                for (let x = this.GOSPER_GUN.CENTRAL_START_X; x < this.GOSPER_GUN.CENTRAL_START_X + this.GOSPER_GUN.CENTRAL_WIDTH; x++) {
                    if (pattern[y][x] === 1) {
                        thumbnailCtx.fillRect(
                            offsetX + (x - this.GOSPER_GUN.CENTRAL_START_X) * this.GOSPER_GUN.CELL_SIZE,
                            offsetY + y * this.GOSPER_GUN.CELL_SIZE,
                            this.GOSPER_GUN.CELL_SIZE,
                            this.GOSPER_GUN.CELL_SIZE
                        );
                    }
                }
            }
        } else {
            // For all other patterns
            const cellSize = Math.min(
                Math.floor(width / patternWidth),
                Math.floor(height / patternHeight)
            );
            
            // Calculate offset to center the pattern
            const offsetX = Math.floor((width - (patternWidth * cellSize)) / 2);
            const offsetY = Math.floor((height - (patternHeight * cellSize)) / 2);
            
            // Draw the pattern cells
            thumbnailCtx.fillStyle = '#000000';
            for (let y = 0; y < patternHeight; y++) {
                for (let x = 0; x < patternWidth; x++) {
                    if (pattern[y][x] === 1) {
                        thumbnailCtx.fillRect(
                            offsetX + (x * cellSize),
                            offsetY + (y * cellSize),
                            cellSize,
                            cellSize
                        );
                    }
                }
            }
        }
        
        return thumbnailCanvas;
    }
    
    /**
     * Place a pattern on the grid at specific coordinates
     * @param {string} patternId - The ID of the pattern to place
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @param {Grid} grid - The grid object to place the pattern on
     * @returns {boolean} True if pattern was placed successfully
     */
    placePattern(patternId, x, y, grid) {
        const patternData = this.patterns[patternId];
        if (!patternData) {
            console.error(`Pattern '${patternId}' not found`);
            return false;
        }
        
        return grid.placePattern(patternData.pattern, x, y);
    }
    
    /**
     * Place a pattern in the center of the grid
     * @param {string} patternId - The ID of the pattern to place
     * @param {Grid} grid - The grid object to place the pattern on
     * @returns {boolean} True if pattern was placed successfully
     */
    placePatternInCenter(patternId, grid) {
        const patternData = this.patterns[patternId];
        if (!patternData) {
            console.error(`Pattern '${patternId}' not found`);
            return false;
        }
        
        const pattern = patternData.pattern;
        const patternWidth = pattern[0].length;
        const patternHeight = pattern.length;
        
        // Calculate the center position
        const startX = Math.floor((grid.cols - patternWidth) / 2);
        const startY = Math.floor((grid.rows - patternHeight) / 2);
        
        return grid.placePattern(pattern, startX, startY);
    }
    
    /**
     * Create pattern library UI
     * @param {Object} dependencies - Dependencies object 
     * @param {Grid} dependencies.grid - The grid to place patterns on
     * @param {Function} dependencies.onPatternSelected - Callback when pattern is selected
     */
    createPatternLibraryUI(dependencies = {}) {
        const grid = dependencies.grid;
        const onPatternSelected = dependencies.onPatternSelected;
        
        if (!grid) {
            console.error('Grid dependency is required for pattern library UI');
            return;
        }
        
        // Find or create patterns container
        const patternsContainer = document.querySelector('.patterns');
        if (!patternsContainer) {
            console.error('Patterns container not found');
            return;
        }
        
        // Clear existing content
        patternsContainer.innerHTML = '';
        
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Pattern Library';
        patternsContainer.appendChild(title);
        
        // Create pattern gallery
        const patternGallery = document.createElement('div');
        patternGallery.className = 'pattern-gallery';
        
        // Group patterns by category
        const categories = {};
        Object.keys(this.patterns).forEach(patternId => {
            const pattern = this.patterns[patternId];
            pattern.id = patternId; // Store ID for reference
            
            if (!categories[pattern.category]) {
                categories[pattern.category] = [];
            }
            categories[pattern.category].push(pattern);
        });
        
        // Create sections for each category
        Object.keys(categories).forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'pattern-category';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            const patternsGrid = document.createElement('div');
            patternsGrid.className = 'patterns-grid';
            
            // Add patterns in this category
            categories[category].forEach(pattern => {
                const patternCard = document.createElement('div');
                patternCard.className = 'pattern-card';
                patternCard.setAttribute('title', pattern.description);
                
                // Create thumbnail
                const thumbnail = this.createPatternThumbnail(pattern.id);
                patternCard.appendChild(thumbnail);
                
                // Add pattern name
                const patternName = document.createElement('div');
                patternName.className = 'pattern-name';
                patternName.setAttribute('title', pattern.description);
                patternName.textContent = pattern.name;
                patternCard.appendChild(patternName);
                
                // Add click event to place pattern
                patternCard.addEventListener('click', () => {
                    console.log(`Clicked pattern: ${pattern.id}`);
                    this.placePatternInCenter(pattern.id, grid);
                    if (typeof onPatternSelected === 'function') {
                        onPatternSelected(pattern.id);
                    }
                });
                
                patternsGrid.appendChild(patternCard);
            });
            
            categoryDiv.appendChild(patternsGrid);
            patternGallery.appendChild(categoryDiv);
        });
        
        patternsContainer.appendChild(patternGallery);
    }
    
    /**
     * Get a specific pattern by ID
     * @param {string} patternId - The ID of the pattern
     * @returns {Object|null} The pattern object or null if not found
     */
    getPattern(patternId) {
        return this.patterns[patternId] || null;
    }
}

export default PatternLibrary; 