/**
 * Game of Life Simulator - GameManager Module
 * Responsible for orchestrating game flow and state management
 * Copyright (c) 2025 Antonio Innocente
 */

import animationManager from '../utils/AnimationManager.js';
import errorHandler, { ErrorCategory } from '../utils/ErrorHandler.js';

/**
 * GameManager class to orchestrate game flow
 */
class GameManager {
    constructor(dependencies = {}) {
        // Inject dependencies
        this.grid = dependencies.grid || null;
        this.renderer = dependencies.renderer || null;
        this.uiManager = dependencies.uiManager || null;
        
        // Game state
        this.isSimulationRunning = false;
        this.simulationLoopId = null;
        this.lastFrameTime = 0;
        this.simulationSpeed = 10;
        this.generationCount = 0;
        
        // Performance optimizations
        this.maxStepsPerFrame = 3;
        this.updateAnalyticsEveryNSteps = 1;
        this.updateAnalyticsCounter = 0;
        this.isMobileDevice = this.detectMobileDevice();
        
        // For large grids, limit UI updates and steps per frame
        if (this.isMobileDevice) {
            this.updateAnalyticsEveryNSteps = 3; // Update analytics less frequently on mobile
            this.maxStepsPerFrame = 1; // Only 1 step per frame on mobile
        }
    }
    
    /**
     * Detect if running on a mobile device
     * @returns {boolean} True if a mobile device is detected
     * @private
     */
    detectMobileDevice() {
        return (
            window.matchMedia('(max-width: 768px)').matches || 
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }
    
    /**
     * Initialize the game manager
     */
    initialize() {
        // Validate dependencies
        if (!this.grid) {
            errorHandler.error(
                'Grid dependency is required for game manager initialization',
                ErrorCategory.DEPENDENCY
            );
            return; // Early return instead of throwing
        }
        if (!this.renderer) {
            errorHandler.error(
                'Renderer dependency is required for game manager initialization',
                ErrorCategory.DEPENDENCY
            );
            return; // Early return instead of throwing
        }
        
        // Set up high-DPI rendering
        this.renderer.resizeCanvas();
        
        // Draw initial grid
        this.renderer.drawGrid(this.grid);
        
        // Add a class to the body to help with CSS-specific adjustments
        document.body.classList.toggle('mobile-device', this.isMobileDevice);
        
        // Adjust maximum steps per frame based on grid size for better performance
        this.updateMaxStepsPerFrame();
    }
    
    /**
     * Update maximum steps per frame based on grid size
     * @private
     */
    updateMaxStepsPerFrame() {
        const totalCells = this.grid.rows * this.grid.cols;
        
        // Apply different limits based on grid size and device
        if (this.isMobileDevice) {
            this.maxStepsPerFrame = 1; // Always 1 for mobile
        } else if (totalCells > 10000) { // 100x100 or larger
            this.maxStepsPerFrame = 1;
        } else if (totalCells > 5000) { // ~70x70 or larger
            this.maxStepsPerFrame = 2;
        } else {
            this.maxStepsPerFrame = 3; // Default for small grids
        }
        
        // Adjust analytics update frequency too
        if (totalCells > 5000) {
            this.updateAnalyticsEveryNSteps = this.isMobileDevice ? 5 : 2;
        } else {
            this.updateAnalyticsEveryNSteps = this.isMobileDevice ? 3 : 1;
        }
    }
    
    /**
     * Start the simulation
     */
    startSimulation() {
        if (this.isSimulationRunning) {
            return;
        }
        
        this.isSimulationRunning = true;
        
        // Update the UI to show that the simulation is running
        if (document.getElementById('simulation-state')) {
            document.getElementById('simulation-state').textContent = 'Running';
        }
        
        // Update maximum steps per frame (in case grid was resized)
        this.updateMaxStepsPerFrame();
        
        // Reset analytics counter
        this.updateAnalyticsCounter = 0;
        
        // Start the simulation loop using AnimationManager
        this.lastFrameTime = performance.now();
        this.simulationLoopId = animationManager.register(
            this.simulationLoop.bind(this),
            'gameOfLifeSimulation'
        );
    }
    
    /**
     * Pause the simulation
     */
    pauseSimulation() {
        if (!this.isSimulationRunning) {
            return;
        }
        
        this.isSimulationRunning = false;
        
        // Pause the animation
        if (this.simulationLoopId) {
            animationManager.pause(this.simulationLoopId);
        }
        
        // Update the UI to show that the simulation is paused
        if (document.getElementById('simulation-state')) {
            document.getElementById('simulation-state').textContent = 'Paused';
        }
        
        // Force analytics update on pause to ensure accurate numbers
        if (this.uiManager) {
            this.uiManager.updateAnalytics();
        }
    }
    
    /**
     * Reset the simulation
     */
    resetSimulation() {
        // Pause the simulation
        this.pauseSimulation();
        
        // Reset the grid
        this.grid.initialize();
        
        // Reset the generation count
        this.generationCount = 0;
        
        // Redraw the grid
        this.renderer.drawGrid(this.grid);
        
        // Update the analytics
        if (this.uiManager) {
            this.uiManager.updateAnalytics();
        }
    }
    
    /**
     * Step the simulation forward one generation
     */
    stepSimulation() {
        try {
            // Compute the next generation
            this.grid.computeNextGeneration();
            
            // Redraw the grid
            this.renderer.drawGrid(this.grid);
            
            // Update the generation count
            this.generationCount++;
            
            // Update the analytics
            if (this.uiManager) {
                this.uiManager.updateAnalytics();
            }
        } catch (err) {
            errorHandler.error(
                'Error during simulation step',
                ErrorCategory.SIMULATION,
                err
            );
        }
    }
    
    /**
     * Update the simulation speed
     * @param {number} newSpeed - The new speed in frames per second
     */
    updateSimulationSpeed(newSpeed) {
        this.simulationSpeed = newSpeed;
        
        // Update the UI to show the new speed
        if (document.getElementById('simulation-speed')) {
            document.getElementById('simulation-speed').textContent = `${newSpeed} FPS`;
        }
    }
    
    /**
     * Main simulation loop using requestAnimationFrame for smooth animation
     * @param {number} timestamp - The current timestamp provided by requestAnimationFrame
     */
    simulationLoop(timestamp) {
        // Exit early if not running
        if (!this.isSimulationRunning) {
            return;
        }
        
        // Use performance.now() for accurate timing if timestamp not provided
        const currentTime = timestamp || performance.now();
        
        // Initialize lastFrameTime if it's the first frame
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }
        
        // Calculate time since last frame
        const elapsed = currentTime - this.lastFrameTime;
        
        // Target frame interval based on simulation speed
        const frameInterval = 1000 / this.simulationSpeed;
        
        // Performance optimization: Check if enough time has passed for an update
        if (elapsed >= frameInterval) {
            // Calculate how many generations to step forward
            // This allows catching up if the browser is struggling to maintain framerate
            // but limits the number of steps to prevent freezing with large grids
            const stepsToTake = Math.min(
                Math.floor(elapsed / frameInterval),
                this.maxStepsPerFrame
            );
            
            // Only process if we have steps to take
            if (stepsToTake > 0) {
                let shouldUpdateAnalytics = false;
                
                try {
                    // For every step to take
                    for (let i = 0; i < stepsToTake; i++) {
                        // Compute the next generation
                        this.grid.computeNextGeneration();
                        
                        // Increment generation count
                        this.generationCount++;
                        
                        // Increment analytics counter
                        this.updateAnalyticsCounter++;
                        
                        // Check if we should update analytics this step
                        if (this.updateAnalyticsCounter >= this.updateAnalyticsEveryNSteps) {
                            shouldUpdateAnalytics = true;
                            this.updateAnalyticsCounter = 0;
                        }
                    }
                    
                    // Optimize rendering: Only redraw once after all generations are computed
                    this.renderer.drawGrid(this.grid);
                    
                    // Update analytics only if needed (reduces DOM operations)
                    if (shouldUpdateAnalytics && this.uiManager) {
                        this.uiManager.updateAnalytics();
                    }
                } catch (err) {
                    errorHandler.error(
                        'Error during simulation loop',
                        ErrorCategory.SIMULATION,
                        err
                    );
                    this.pauseSimulation(); // Pause simulation on error
                }
                
                // Update last frame time, accounting for any extra time
                this.lastFrameTime = currentTime - (elapsed % frameInterval);
            }
        }
        
        // Don't call requestAnimationFrame here - AnimationManager handles this
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Unregister from animation manager if registered
        if (this.simulationLoopId) {
            animationManager.unregister(this.simulationLoopId);
            this.simulationLoopId = null;
        }
    }
}

export default GameManager; 