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
        console.log("=== Starting initialization ===");
        
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
            console.log("Resizing grid for mobile");
            this.grid.resize(30, 30);
            this.renderer.settings.cellSize = this.renderer.calculateCellSize(30, 30);
            this.renderer.drawGrid(this.grid);
        }
        
        console.log("=== Initialization complete ===");
    }
    
    /**
     * Start the simulation
     */
    startSimulation() {
        console.log("Starting simulation");
        
        if (this.isSimulationRunning) {
            console.log("Simulation already running");
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
        console.log("Pausing simulation");
        
        if (!this.isSimulationRunning) {
            console.log("Simulation already paused");
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
        console.log("Resetting simulation");
        
        // Pause the simulation
        this.pauseSimulation();
        
        // Reset the grid
        this.grid.initialize();
        
        // Reset the generation count
        this.generationCount = 0;
        
        // Redraw the grid
        this.renderer.drawGrid(this.grid);
        
        // Update the analytics
        this.uiManager.updateAnalytics();
    }
    
    /**
     * Step the simulation forward one generation
     */
    stepSimulation() {
        console.log("Stepping simulation");
        
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
        console.log(`Updating simulation speed to ${newSpeed} FPS`);
        
        this.simulationSpeed = newSpeed;
        
        // Update the UI to show the new speed
        if (document.getElementById('simulation-speed')) {
            document.getElementById('simulation-speed').textContent = `${newSpeed} FPS`;
        }
    }
    
    /**
     * Main simulation loop using requestAnimationFrame
     * @param {number} timestamp - The current timestamp
     */
    simulationLoop(timestamp) {
        // Exit early if not running
        if (!this.isSimulationRunning) {
            console.log("Simulation not running, exiting loop");
            return;
        }
        
        console.log("Running simulation loop");
        
        // Use performance.now() if available for more accurate timing
        const currentTime = timestamp || performance.now();
        
        // Initialize lastFrameTime if it's the first frame
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }
        
        // Calculate time since last frame
        const elapsed = currentTime - this.lastFrameTime;
        
        // Target frame interval based on simulation speed
        const frameInterval = 1000 / this.simulationSpeed;
        
        // Check if it's time to update the simulation (based on simulation speed)
        if (elapsed >= frameInterval) {
            // Calculate how many generations to step forward
            // This allows catching up if the browser is struggling to maintain framerate
            const stepsToTake = Math.min(Math.floor(elapsed / frameInterval), 3); // Cap at 3 steps to prevent freezing
            
            // Step the simulation (usually just once, but can catch up if lagging)
            for (let i = 0; i < stepsToTake; i++) {
                this.stepSimulation();
            }
            
            // Update last frame time, accounting for any extra time
            this.lastFrameTime = currentTime - (elapsed % frameInterval);
        }
        
        // Continue the loop if simulation is running
        if (this.isSimulationRunning) {
            // Use requestAnimationFrame with a polyfill fallback for older browsers
            this.animationFrameId = (window.requestAnimationFrame || 
                               window.webkitRequestAnimationFrame || 
                               window.mozRequestAnimationFrame || 
                               (callback => window.setTimeout(callback, 1000/60)))(this.simulationLoop.bind(this));
        }
    }
}

export default GameManager; 