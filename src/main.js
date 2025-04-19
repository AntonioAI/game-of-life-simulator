/**
 * Game of Life Simulator - Main Entry Point
 * Copyright (c) 2025 Antonio Innocente
 */

// Import modules
import GameManager from './core/GameManager.js';
import Grid from './core/Grid.js';
import Rules from './core/Rules.js';
import Renderer from './rendering/Renderer.js';
import UIManager from './ui/UIManager.js';
import Controls from './ui/Controls.js';
import PatternLibrary from './patterns/PatternLibrary.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Starting Game of Life Simulator ===');
    
    // Initialize the game
    const initialize = () => {
        // Get canvas element
        const canvas = document.querySelector('.game-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Initialize modules using dependency injection
        
        // Create rules instance
        const rules = new Rules();
        rules.initialize();
        
        // Create grid with rules dependency
        const grid = new Grid({ rules }, { rows: 50, cols: 50, boundaryType: 'toroidal' });
        
        // Create renderer with canvas dependency
        const renderer = new Renderer({ canvas });
        renderer.initialize();
        
        // Calculate cell size based on grid dimensions
        renderer.settings.cellSize = renderer.calculateCellSize(grid.rows, grid.cols);
        
        // Create controls
        const controls = new Controls();
        
        // Create pattern library
        const patternLibrary = new PatternLibrary();
        patternLibrary.initialize();
        
        // Create game manager with grid and renderer dependencies
        const gameManager = new GameManager({
            grid,
            renderer
        });
        
        // Create UI manager with dependencies
        const uiManager = new UIManager({
            gameManager,
            controls
        });
        
        // Connect UIManager to GameManager
        gameManager.uiManager = uiManager;
        
        // Initialize components
        gameManager.initialize();
        uiManager.initialize();
        
        // Create pattern library UI
        patternLibrary.createPatternLibraryUI({
            grid,
            onPatternSelected: (patternId) => {
                renderer.drawGrid(grid);
                uiManager.updateAnalytics();
            }
        });
        
        // Place initial pattern (R-Pentomino)
        patternLibrary.placePatternInCenter('rpentomino', grid);
        
        // Draw initial state
        renderer.drawGrid(grid);
        
        // Update analytics after everything is initialized
        uiManager.updateAnalytics();
        
        // Add window resize handler for responsive behavior
        window.addEventListener('resize', () => {
            // Recalculate dimensions and redraw
            renderer.settings.cellSize = renderer.calculateCellSize(grid.rows, grid.cols);
            renderer.drawGrid(grid);
        });
        
        console.log('=== Game of Life Simulator initialized ===');
    };
    
    // Start the application
    initialize();
}); 