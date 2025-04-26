/**
 * Game of Life Simulator - PatternLibrary Module
 * Responsible for pattern definitions and management
 * Copyright (c) 2025 Antonio Innocente
 */

import eventBus, { Events } from '../core/EventBus.js';
import { createPatternLibraryContainerTemplate, createPatternCategoryTemplate, createPatternCardTemplate } from '../ui/componentTemplates/PatternLibraryTemplate.js';
import { createElementsFromHTML } from '../utils/DOMHelper.js';

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
        
        // Category descriptions for better organization
        this.categoryDescriptions = {
            'Still Life': 'Patterns that remain unchanged from one generation to the next',
            'Oscillator': 'Patterns that return to their initial state after a fixed number of generations',
            'Spaceship': 'Patterns that translate across the grid periodically',
            'Growth': 'Patterns that grow or evolve in interesting ways'
        };
        
        // Category order for consistent display
        this.categoryOrder = ['Still Life', 'Oscillator', 'Spaceship', 'Growth'];
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
        
        // Set fill style for pattern cells to be used by both rendering paths
        thumbnailCtx.fillStyle = '#000000';
        
        // Special case for Gosper Glider Gun - use a higher quality downsampling
        if (patternId === 'gosperglidergun') {
            // Calculate offset to center the view on the important part
            const offsetX = Math.floor((width - (this.GOSPER_GUN.CENTRAL_WIDTH * this.GOSPER_GUN.CELL_SIZE)) / 2);
            const offsetY = Math.floor((height - (patternHeight * this.GOSPER_GUN.CELL_SIZE)) / 2);
            
            // Draw the central portion of the pattern
            for (let y = 0; y < patternHeight; y++) {
                for (let x = this.GOSPER_GUN.CENTRAL_START_X; x < this.GOSPER_GUN.CENTRAL_START_X + this.GOSPER_GUN.CENTRAL_WIDTH; x++) {
                    if (x < pattern[0].length && pattern[y][x] === 1) {
                        thumbnailCtx.fillRect(
                            offsetX + ((x - this.GOSPER_GUN.CENTRAL_START_X) * this.GOSPER_GUN.CELL_SIZE),
                            offsetY + (y * this.GOSPER_GUN.CELL_SIZE),
                            this.GOSPER_GUN.CELL_SIZE,
                            this.GOSPER_GUN.CELL_SIZE
                        );
                    }
                }
            }
        } else {
            // Normal pattern rendering
            // Calculate cell size to fit pattern in thumbnail
            const cellSize = Math.min(
                Math.floor((width - 10) / patternWidth),
                Math.floor((height - 10) / patternHeight)
            );
            
            // Calculate offset to center pattern
            const offsetX = Math.floor((width - (patternWidth * cellSize)) / 2);
            const offsetY = Math.floor((height - (patternHeight * cellSize)) / 2);
            
            // Draw pattern cells
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
     * Place a pattern on the grid
     * @param {string} patternId - The ID of the pattern
     * @param {number} x - The x coordinate (top-left)
     * @param {number} y - The y coordinate (top-left)
     * @param {Grid} grid - The grid object
     */
    placePattern(patternId, x, y, grid) {
        const patternData = this.patterns[patternId];
        if (!patternData || !grid) return;
        
        const pattern = patternData.pattern;
        
        // Place each cell of the pattern
        for (let dy = 0; dy < pattern.length; dy++) {
            for (let dx = 0; dx < pattern[dy].length; dx++) {
                if (pattern[dy][dx] === 1) {
                    const gridX = x + dx;
                    const gridY = y + dy;
                    
                    // Check grid boundaries
                    if (gridX >= 0 && gridX < grid.cols && gridY >= 0 && gridY < grid.rows) {
                        grid.setCell(gridX, gridY, 1);
                    }
                }
            }
        }
    }
    
    /**
     * Place a pattern in the center of the grid
     * @param {string} patternId - The ID of the pattern
     * @param {Grid} grid - The grid object
     */
    placePatternInCenter(patternId, grid) {
        const patternData = this.patterns[patternId];
        if (!patternData || !grid) return;
        
        const pattern = patternData.pattern;
        
        // Calculate center position
        const patternWidth = pattern[0].length;
        const patternHeight = pattern.length;
        
        const startX = Math.floor((grid.cols - patternWidth) / 2);
        const startY = Math.floor((grid.rows - patternHeight) / 2);
        
        // Reset grid before placing pattern
        grid.reset();
        
        // Place pattern at center
        this.placePattern(patternId, startX, startY, grid);
        
        // Publish the event that a pattern was selected
        eventBus.publish(Events.PATTERN_SELECTED, {
            patternId,
            timestamp: performance.now()
        });
    }
    
    /**
     * Create pattern library UI
     * @param {Object} dependencies - Dependencies object
     * @param {Grid} dependencies.grid - The grid instance
     * @param {Function} dependencies.onPatternSelected - Callback when pattern is selected
     */
    createPatternLibraryUI(dependencies = {}) {
        const grid = dependencies.grid;
        const onPatternSelected = dependencies.onPatternSelected;
        
        if (!grid) {
            console.error('Grid dependency is required for pattern library UI');
            return;
        }
        
        // Find patterns container
        const patternsContainer = document.querySelector('.pattern-library');
        if (!patternsContainer) {
            console.error('Patterns container not found');
            return;
        }
        
        // Clear existing content
        patternsContainer.innerHTML = '';
        
        // Create the container structure using the template
        const libraryFragment = createElementsFromHTML(createPatternLibraryContainerTemplate());
        patternsContainer.appendChild(libraryFragment);
        
        // Get reference to gallery container
        const patternGallery = patternsContainer.querySelector('.pattern-library__gallery');
        
        // Get reference to search input
        const searchInput = patternsContainer.querySelector('#pattern-search-input');
        
        // Function to update search results
        const updateSearchResults = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const patternCards = document.querySelectorAll('.pattern-library__card');
            
            // Toggle clear button visibility
            const searchContainer = searchInput.parentElement;
            if (searchTerm.length > 0) {
                searchContainer.classList.add('has-text');
            } else {
                searchContainer.classList.remove('has-text');
            }
            
            // Count of visible patterns per category
            const visibleCountByCategory = {};
            
            patternCards.forEach(card => {
                const patternName = card.querySelector('.pattern-library__card-name').textContent.toLowerCase();
                const patternDesc = card.getAttribute('title').toLowerCase();
                const category = card.closest('.pattern-library__category');
                const categoryName = category ? category.querySelector('h3').textContent : null;
                
                // Initialize counter for this category if not exists
                if (categoryName && !visibleCountByCategory[categoryName]) {
                    visibleCountByCategory[categoryName] = 0;
                }
                
                // Show/hide based on search term
                if (patternName.includes(searchTerm) || patternDesc.includes(searchTerm)) {
                    card.style.display = '';  // Use default display value (usually flex from CSS)
                    if (categoryName) {
                        visibleCountByCategory[categoryName]++;
                    }
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide category headers based on visible patterns
            document.querySelectorAll('.pattern-library__category').forEach(category => {
                const categoryName = category.querySelector('h3').textContent;
                const hasVisiblePatterns = visibleCountByCategory[categoryName] > 0;
                
                category.style.display = hasVisiblePatterns ? '' : 'none';
            });
        };
        
        // Add search functionality
        searchInput.addEventListener('input', updateSearchResults);
        
        // Add clear button functionality
        const searchContainer = searchInput.parentElement;
        searchContainer.addEventListener('click', (e) => {
            // Check if the click was on the pseudo-element (approximately)
            const rect = searchContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            // If click is near the right edge where the × is displayed
            if (clickX > rect.width - 40 && searchInput.value.length > 0) {
                searchInput.value = '';
                searchContainer.classList.remove('has-text');
                updateSearchResults();
                searchInput.focus();
            }
        });
        
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
        
        // Create sections for each category in the specified order
        this.categoryOrder.forEach(category => {
            if (!categories[category] || categories[category].length === 0) return;
            
            // Create category section using template
            const categoryFragment = createElementsFromHTML(
                createPatternCategoryTemplate({
                    name: category,
                    description: this.categoryDescriptions[category]
                })
            );
            
            // Add to gallery
            patternGallery.appendChild(categoryFragment);
            
            // Get the category div we just added
            const categoryDiv = patternGallery.lastElementChild;
            
            // Get reference to the grid within this category
            const patternsGrid = categoryDiv.querySelector('.pattern-library__grid');
            
            // Sort patterns alphabetically
            categories[category].sort((a, b) => a.name.localeCompare(b.name));
            
            // Add patterns in this category
            categories[category].forEach(pattern => {
                // Create pattern card using template
                const cardFragment = createElementsFromHTML(createPatternCardTemplate(pattern));
                patternsGrid.appendChild(cardFragment);
                
                // Get the card we just added
                const patternCard = patternsGrid.lastElementChild;
                
                // Create and add thumbnail
                const thumbnail = this.createPatternThumbnail(pattern.id);
                const thumbnailContainer = patternCard.querySelector('.pattern-thumbnail-container');
                thumbnailContainer.appendChild(thumbnail);
                
                // Add click event to place pattern
                patternCard.addEventListener('click', () => {
                    // Add active class to selected pattern
                    document.querySelectorAll('.pattern-library__card').forEach(card => {
                        card.classList.remove('active');
                    });
                    patternCard.classList.add('active');
                    
                    console.log(`Clicked pattern: ${pattern.id}`);
                    this.placePatternInCenter(pattern.id, grid);
                    if (typeof onPatternSelected === 'function') {
                        onPatternSelected(pattern.id);
                    }
                });
            });
        });
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