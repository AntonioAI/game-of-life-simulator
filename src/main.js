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
import animationManager from './utils/AnimationManager.js';
import performanceMonitor from './utils/PerformanceMonitor.js';
import { isMobileDevice } from './utils/DeviceUtils.js';
import errorHandler, { ErrorCategory } from './utils/ErrorHandler.js';
import CanvasDebugger from './utils/CanvasDebugger.js';
import ConfigPanel from './ui/ConfigPanel.js';
import DependencyContainer from './core/DependencyContainer.js';

// Create a global application dependency container
window.appContainer = new DependencyContainer();

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
            
            // Get the dependency container
            const dependencyContainer = window.appContainer;
            
            // Register dependencies with the container
            dependencyContainer.register('canvas', canvas, true); // Canvas as a singleton
            dependencyContainer.register('rules', Rules, true); // Rules as a singleton
            dependencyContainer.register('grid', Grid, true, ['rules']); // Grid depends on rules
            dependencyContainer.register('renderer', Renderer, true, ['canvas']); // Renderer depends on canvas
            dependencyContainer.register('controls', Controls, true); // Controls as a singleton
            dependencyContainer.register('patternLibrary', PatternLibrary, true); // PatternLibrary as a singleton
            dependencyContainer.register('gameManager', GameManager, true, ['grid', 'renderer']); // GameManager depends on grid and renderer
            dependencyContainer.register('uiManager', UIManager, true, ['gameManager', 'controls']); // UIManager depends on gameManager and controls
            dependencyContainer.register('configPanel', ConfigPanel, true); // ConfigPanel as a singleton
            
            // Resolve the main dependencies
            const rules = dependencyContainer.resolve('rules');
            rules.initialize();
            
            const grid = dependencyContainer.resolve('grid');
            // Set grid options
            grid.rows = isMobileDevice() ? 30 : 50;
            grid.cols = isMobileDevice() ? 30 : 50;
            grid.boundaryType = 'toroidal';
            
            const renderer = dependencyContainer.resolve('renderer');
            renderer.initialize();
            console.log('Renderer initialized');
            
            const controls = dependencyContainer.resolve('controls');
            
            const patternLibrary = dependencyContainer.resolve('patternLibrary');
            patternLibrary.initialize();
            
            const gameManager = dependencyContainer.resolve('gameManager');
            
            const uiManager = dependencyContainer.resolve('uiManager');
            
            // Connect UIManager to GameManager (circular dependency handled outside container)
            gameManager.uiManager = uiManager;
            
            // Create and initialize the config panel
            const configPanel = dependencyContainer.resolve('configPanel');
            configPanel.initialize();
            
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
            const canvasContainer = canvas.parentElement;
            const canvasWidth = canvasContainer ? canvasContainer.clientWidth : 800;
            const canvasHeight = canvasContainer ? canvasContainer.clientHeight : 600;
            
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
            
            // Register the zoom detector with the container
            dependencyContainer.register('zoomDetector', zoomDetector, true);
            
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