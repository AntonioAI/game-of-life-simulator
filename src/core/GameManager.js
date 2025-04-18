/**
 * Game of Life Simulator - GameManager Module
 * Responsible for orchestrating game flow and state management
 * Copyright (c) 2025 Antonio Innocente
 */

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
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.simulationSpeed = 10;
        this.generationCount = 0;
    }
    
    /**
     * Initialize the game manager
     */
    initialize() {
        // Validate dependencies
        if (!this.grid) {
            throw new Error('Grid dependency is required');
        }
        if (!this.renderer) {
            throw new Error('Renderer dependency is required');
        }
        
        // Set up high-DPI rendering
        this.renderer.resizeCanvas();
        
        // Draw initial grid
        this.renderer.drawGrid(this.grid);
        
        // Detect mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Add a class to the body to help with CSS-specific adjustments
        document.body.classList.toggle('mobile-device', isMobile);
        
        // Set a smaller default grid size for mobile devices to improve performance
        if (isMobile && this.grid.rows > 30) {
            this.grid.resize(30, 30);
            this.renderer.settings.cellSize = this.renderer.calculateCellSize(30, 30);
            this.renderer.drawGrid(this.grid);
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
        
        // Start the simulation loop
        this.lastFrameTime = performance.now();
        this.simulationLoop();
    }
    
    /**
     * Pause the simulation
     */
    pauseSimulation() {
        if (!this.isSimulationRunning) {
            return;
        }
        
        this.isSimulationRunning = false;
        
        // Cancel any pending animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Update the UI to show that the simulation is paused
        if (document.getElementById('simulation-state')) {
            document.getElementById('simulation-state').textContent = 'Paused';
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
        // Compute the next generation
        this.grid.computeNextGeneration();
        
        // Redraw the grid
        this.renderer.drawGrid(this.grid);
        
        // Update the generation count
        this.generationCount++;
        
        // Update the analytics
        this.uiManager.updateAnalytics();
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
            const stepsToTake = Math.min(Math.floor(elapsed / frameInterval), 
                                        this.grid.rows > 80 ? 1 : 3); // Only 1 step for large grids
            
            // For every step to take
            for (let i = 0; i < stepsToTake; i++) {
                // Compute the next generation
                this.grid.computeNextGeneration();
                
                // Increment generation count
                this.generationCount++;
            }
            
            // Optimize rendering: Only redraw once after all generations are computed
            this.renderer.drawGrid(this.grid);
            
            // Update analytics only after all steps are complete to reduce DOM operations
            if (this.uiManager) {
                this.uiManager.updateAnalytics();
            }
            
            // Update last frame time, accounting for any extra time
            this.lastFrameTime = currentTime - (elapsed % frameInterval);
        }
        
        // Continue the loop with optimized animation frame request
        this.animationFrameId = requestAnimationFrame(this.simulationLoop.bind(this));
    }
}

export default GameManager; 