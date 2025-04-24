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
import errorHandler, { ErrorCategory } from './utils/ErrorHandler.js';
import CanvasDebugger from './utils/CanvasDebugger.js';
import ConfigPanel from './ui/ConfigPanel.js';

// Set up global error handlers
window.addEventListener('error', (event) => {
    errorHandler.error(
        `Uncaught error: ${event.message}`,
        ErrorCategory.UNKNOWN,
        event.error
    );
});

window.addEventListener('unhandledrejection', (event) => {
    errorHandler.error(
        `Unhandled promise rejection: ${event.reason}`,
        ErrorCategory.UNKNOWN,
        event.reason
    );
});

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
            errorHandler.error(
                'Canvas element not found',
                ErrorCategory.INITIALIZATION
            );
            return;
        }
        
        try {
            console.log('Canvas found:', canvas);
            
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
            console.log('Grid initialized with dimensions:', grid.rows, 'x', grid.cols);
            
            // Create renderer with canvas dependency
            const renderer = new Renderer({ canvas });
            renderer.initialize();
            console.log('Renderer initialized');
            
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
            
            // Register components with the ComponentRegistry
            componentRegistry.register('grid', grid);
            componentRegistry.register('renderer', renderer);
            componentRegistry.register('gameManager', gameManager);
            componentRegistry.register('uiManager', uiManager);
            componentRegistry.register('patternLibrary', patternLibrary);
            
            // Create and initialize the config panel
            const configPanel = new ConfigPanel({
                container: document.querySelector('.config-panel')
            });
            configPanel.initialize();
            
            // Register config panel with component registry
            componentRegistry.register('configPanel', configPanel);
            
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
            console.log('Initial pattern placed');
            
            // Explicitly set canvas dimensions before drawing
            const container = canvas.parentElement;
            const canvasWidth = container ? container.clientWidth : 800;
            const canvasHeight = container ? container.clientHeight : 600;
            
            // Ensure the canvas has proper dimensions (not 0x0)
            if (canvas.width === 0 || canvas.height === 0) {
                console.log('Canvas has zero dimensions, explicitly setting size');
                canvas.width = canvasWidth || 800;  // Fallback to 800 if width is 0
                canvas.height = canvasHeight || 600;  // Fallback to 600 if height is 0
            }
            
            console.log(`Initial canvas dimensions: ${canvas.width}x${canvas.height}`);
            
            // Explicitly calculate cell size once patternLibrary is loaded
            renderer.resizeCanvas(grid, canvasWidth, canvasHeight);
            console.log('Canvas resized to fit grid');
            
            // Force a draw to make sure the grid is visible
            renderer.drawGrid(grid);
            console.log('Grid drawn to canvas');
            
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
            
            // Make the debugger available globally for easy console access
            window.__DEBUG__ = {
                grid,
                renderer,
                gameManager,
                uiManager,
                patternLibrary,
                debugger: CanvasDebugger,
                runDiagnostics: () => {
                    console.log('=== Running Canvas Diagnostics ===');
                    CanvasDebugger.checkCanvas(canvas);
                    CanvasDebugger.checkRenderer(renderer, grid);
                    CanvasDebugger.forceRedraw(renderer, grid);
                    console.log('=== Diagnostics Complete ===');
                }
            };
            
            // Add window resize handler for responsive behavior with debounce
            let resizeTimeout;
            window.addEventListener('resize', () => {
                // Debounce resize events to avoid excessive redraws
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    // Use the proper resizeCanvas method with grid parameter
                    renderer.resizeCanvas(grid);
                    console.log('Canvas resized after window resize');
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
        } catch (err) {
            errorHandler.fatal(
                'Failed to initialize Game of Life Simulator',
                ErrorCategory.INITIALIZATION,
                err
            );
        }
    };
    
    // Start the application
    initialize();
}); 