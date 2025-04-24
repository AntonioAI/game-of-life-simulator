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
import ZoomDetector from './utils/ZoomDetector.js';
import componentRegistry from './utils/ComponentRegistry.js';
import animationManager from './utils/AnimationManager.js';
import performanceMonitor from './utils/PerformanceMonitor.js';
import { isMobileDevice } from './utils/DeviceUtils.js';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Starting Game of Life Simulator ===');
    
    // Remove the old isMobileDevice detection
    // const isMobileDevice = window.matchMedia('(max-width: 768px)').matches ||
    //    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detect if on mobile
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    }
    
    // Configure animation manager for performance
    // Set throttling for mobile devices to reduce power consumption
    if (isMobileDevice()) {
        animationManager.setThrottleInterval(16); // ~60fps max on mobile
    }
    
    // Initialize the game
    const initialize = () => {
        // Get canvas element
        const canvas = document.querySelector('.game-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Remove hardcoded dimensions to allow proper responsive sizing
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        
        // Initialize modules using dependency injection
        
        // Create rules instance
        const rules = new Rules();
        rules.initialize();
        
        // Create grid with rules dependency
        const grid = new Grid({ rules }, { 
            rows: isMobileDevice() ? 30 : 50, 
            cols: isMobileDevice() ? 30 : 50, 
            boundaryType: 'toroidal' 
        });
        
        // Create renderer with canvas dependency
        const renderer = new Renderer({ canvas });
        renderer.initialize();
        
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
        
        // Register components with the ComponentRegistry
        componentRegistry.register('grid', grid);
        componentRegistry.register('renderer', renderer);
        componentRegistry.register('gameManager', gameManager);
        componentRegistry.register('uiManager', uiManager);
        componentRegistry.register('patternLibrary', patternLibrary);
        
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
        
        // Explicitly calculate cell size once patternLibrary is loaded
        renderer.resizeCanvas(grid);
        
        // Draw initial state
        renderer.drawGrid(grid);
        
        // Update analytics after everything is initialized
        uiManager.updateAnalytics();
        
        // Create zoom detector with optimized options
        const zoomDetector = new ZoomDetector({
            onZoomChange: (zoomInfo) => {
                console.log(`Browser zoom changed: ${zoomInfo.oldDpr} -> ${zoomInfo.newDpr}`);
                renderer.resizeCanvas(grid);
            },
            debounceTime: 200, // Longer debounce time to reduce processing
            useMatchMedia: true // Prefer matchMedia for better performance
        });
        
        // Start zoom detection
        zoomDetector.startListening();
        
        // Register zoom detector with component registry
        componentRegistry.register('zoomDetector', zoomDetector);
        
        // Add window resize handler for responsive behavior with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Debounce resize events to avoid excessive redraws
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Use the proper resizeCanvas method with grid parameter
                renderer.resizeCanvas(grid);
            }, 200); // Longer debounce time
        }, { passive: true }); // Use passive listener for better performance
        
        // Add performance monitoring toggle via keyboard shortcut (Alt+P)
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'p') {
                if (performanceMonitor.isActive) {
                    performanceMonitor.disable();
                    console.log('Performance monitor disabled');
                } else {
                    performanceMonitor.enable(true);
                    console.log('Performance monitor enabled (Alt+P to toggle)');
                }
            }
        });
        
        console.log('=== Game of Life Simulator initialized ===');
    };
    
    // Start the application
    initialize();
}); 