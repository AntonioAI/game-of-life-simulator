/**
 * Game of Life Simulator - UIManager Module
 * Responsible for UI coordination
 * Copyright (c) 2025 Antonio Innocente
 */

import Controls from './Controls.js';
import eventBus, { Events } from '../core/EventBus.js';
import config from '../config/GameConfig.js';
import { createSimulationControlsTemplate, createGridSettingsTemplate, createBoundaryToggleTemplate } from './templates/ControlsTemplate.js';
import { createAnalyticsTemplate } from './templates/AnalyticsTemplate.js';
import { createElementsFromHTML } from '../utils/DOMHelper.js';

/**
 * UIManager class for managing UI elements
 */
class UIManager {
    /**
     * Create a UI manager
     * @param {Object} dependencies - Dependencies object
     * @param {GameManager} dependencies.gameManager - The game manager instance
     * @param {Controls} dependencies.controls - The controls instance
     */
    constructor(dependencies = {}) {
        // Validate required dependencies
        if (!dependencies.gameManager) {
            throw new Error('GameManager dependency is required for UIManager');
        }
        if (!dependencies.controls) {
            throw new Error('Controls dependency is required for UIManager');
        }
        
        this.gameManager = dependencies.gameManager;
        this.controls = dependencies.controls;
        
        // UI elements references
        this.controlsContainer = document.querySelector('.control-panel');
        this.analyticsContainer = document.querySelector('.analytics-panel');
        this.patternsContainer = document.querySelector('.pattern-library');
        
        // Store event subscriptions for cleanup
        this.subscriptions = [];
        
        // Debounce timer for analytics updates
        this.analyticsUpdateTimer = null;
    }
    
    /**
     * Initialize UI elements
     */
    initialize() {
        // Validate dependencies
        if (!this.gameManager) {
            throw new Error('GameManager dependency is required');
        }
        if (!this.gameManager.grid) {
            throw new Error('Grid dependency is required');
        }
        if (!this.gameManager.renderer) {
            throw new Error('Renderer dependency is required');
        }
        
        this.createSimulationControls();
        this.createSettingsPanel();
        this.addBoundaryToggle();
        this.createAnalyticsDisplay();
        this.setupCanvasInteractions(this.gameManager.renderer.canvas, this.gameManager.grid);
        
        // Subscribe to events
        this.subscribeToEvents();
    }
    
    /**
     * Subscribe to events from EventBus
     */
    subscribeToEvents() {
        // Define events that require analytics updates only
        const analyticsUpdateEvents = [
            Events.GENERATION_UPDATED,
            Events.SIMULATION_RESET, 
            Events.SIMULATION_STEPPED,
            Events.CELL_TOGGLED
            // GRID_RESIZED and SIMULATION_PAUSED need special handling
        ];
        
        // Create a single subscription for all analytics-updating events
        const analyticsUpdateHandler = (data) => {
            this.debouncedUpdateAnalytics();
        };
        
        // Store subscriptions for cleanup
        this.subscriptions = [];
        
        // Add subscription for each analytics event
        analyticsUpdateEvents.forEach(eventName => {
            this.subscriptions.push(
                eventBus.subscribe(eventName, analyticsUpdateHandler)
            );
        });
        
        // Add other event subscriptions with different handlers
        this.subscriptions.push(
            eventBus.subscribe(Events.SIMULATION_STARTED, () => {
                const stateElement = document.getElementById('simulation-state');
                if (stateElement) {
                    stateElement.textContent = 'Running';
                }
            }),
            
            eventBus.subscribe(Events.SIMULATION_PAUSED, () => {
                const stateElement = document.getElementById('simulation-state');
                if (stateElement) {
                    stateElement.textContent = 'Paused';
                }
                // For pause, we want immediate update, not debounced
                this.updateAnalytics();
            }),
            
            eventBus.subscribe(Events.SPEED_UPDATED, (data) => {
                const speedElement = document.getElementById('simulation-speed');
                if (speedElement) {
                    speedElement.textContent = `${data.speed} FPS`;
                }
            }),
            
            eventBus.subscribe(Events.GRID_RESIZED, (data) => {
                // Update the input fields with new dimensions
                const rowsInput = document.getElementById('rows-input');
                const colsInput = document.getElementById('cols-input');
                
                if (rowsInput) {
                    rowsInput.value = data.rows;
                }
                
                if (colsInput) {
                    colsInput.value = data.cols;
                }
                
                // Update analytics immediately after grid resize
                this.updateAnalytics();
            }),
            
            eventBus.subscribe(Events.BOUNDARY_CHANGED, (data) => {
                // Update the boundary radio buttons
                const boundaryRadios = document.querySelectorAll('input[name="boundary-type"]');
                boundaryRadios.forEach(radio => {
                    radio.checked = radio.value === data.boundaryType;
                });
                
                // Update the boundary type display
                const boundaryElement = document.getElementById('boundary-type');
                if (boundaryElement) {
                    boundaryElement.textContent = data.boundaryType === 'toroidal' ? 'Toroidal' : 'Finite';
                }
            })
        );
    }
    
    /**
     * Debounced version of updateAnalytics to improve performance for rapid events
     * @param {number} delay - Delay in milliseconds, defaults to 50ms
     */
    debouncedUpdateAnalytics(delay = 50) {
        // Clear any existing timer
        if (this.analyticsUpdateTimer) {
            clearTimeout(this.analyticsUpdateTimer);
        }
        
        // Set a new timer
        this.analyticsUpdateTimer = setTimeout(() => {
            this.updateAnalytics();
            this.analyticsUpdateTimer = null;
        }, delay);
    }
    
    /**
     * Unsubscribe from events
     */
    unsubscribeFromEvents() {
        // Call all the unsubscribe functions
        if (this.subscriptions) {
            this.subscriptions.forEach(unsubscribe => unsubscribe());
            this.subscriptions = [];
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        this.unsubscribeFromEvents();
        
        // Clear any pending analytics update timer
        if (this.analyticsUpdateTimer) {
            clearTimeout(this.analyticsUpdateTimer);
            this.analyticsUpdateTimer = null;
        }
    }
    
    /**
     * Create simulation controls (start, pause, step, reset)
     */
    createSimulationControls() {
        // Use the template to create the HTML structure
        const controlsFragment = createElementsFromHTML(createSimulationControlsTemplate());
        this.controlsContainer.appendChild(controlsFragment);
        
        // Get references to the elements where components will be inserted
        const buttonContainer = document.getElementById('control-buttons-container');
        const speedSliderContainer = document.getElementById('speed-slider-container');
        
        // Create and attach control buttons
        const startButton = this.controls.createButton('▶', 'Start', 
            () => this.gameManager.startSimulation());
        const pauseButton = this.controls.createButton('⏸', 'Pause', 
            () => this.gameManager.pauseSimulation());
        const stepButton = this.controls.createButton('➡', 'Step', 
            () => this.gameManager.stepSimulation());
        const resetButton = this.controls.createButton('↺', 'Reset', 
            () => this.gameManager.resetSimulation());
        
        // Append buttons to container
        buttonContainer.appendChild(startButton);
        buttonContainer.appendChild(pauseButton);
        buttonContainer.appendChild(stepButton);
        buttonContainer.appendChild(resetButton);
        
        // Create and attach speed slider
        const speedControl = this.controls.createSpeedSlider(
            1, 60, this.gameManager.simulationSpeed,
            (speed) => this.gameManager.updateSimulationSpeed(speed)
        );
        speedSliderContainer.appendChild(speedControl.container);
    }
    
    /**
     * Create settings panel (grid size, boundary type)
     */
    createSettingsPanel() {
        // Use the template to create the HTML structure
        const gridSettingsFragment = createElementsFromHTML(
            createGridSettingsTemplate({
                rows: this.gameManager.grid.rows,
                cols: this.gameManager.grid.cols,
                minSize: config.grid.minSize,
                maxSize: config.grid.maxSize
            })
        );
        this.controlsContainer.appendChild(gridSettingsFragment);
        
        // Get reference to preset buttons container
        const presetButtonsContainer = this.controlsContainer.querySelector('.preset-buttons');
        
        // Create preset buttons with data from config
        config.ui.presetSizes.forEach(preset => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'preset-button';
            button.title = preset.description;
            button.textContent = preset.name;
            button.addEventListener('click', () => this.resizeGrid(preset.rows, preset.cols));
            presetButtonsContainer.appendChild(button);
        });
        
        // Add event listeners for input validation and resize action
        const rowsInput = document.getElementById('rows-input');
        const colsInput = document.getElementById('cols-input');
        const applyButton = document.getElementById('apply-grid-size');
        
        // Add validation to prevent invalid input
        rowsInput.addEventListener('change', () => {
            const value = parseInt(rowsInput.value);
            if (isNaN(value) || value < config.grid.minSize) rowsInput.value = config.grid.minSize;
            if (value > config.grid.maxSize) rowsInput.value = config.grid.maxSize;
        });
        
        colsInput.addEventListener('change', () => {
            const value = parseInt(colsInput.value);
            if (isNaN(value) || value < config.grid.minSize) colsInput.value = config.grid.minSize;
            if (value > config.grid.maxSize) colsInput.value = config.grid.maxSize;
        });
        
        // Add event listener to apply button
        applyButton.addEventListener('click', () => {
            const rows = parseInt(rowsInput.value);
            const cols = parseInt(colsInput.value);
            if (rows >= config.grid.minSize && rows <= config.grid.maxSize && 
                cols >= config.grid.minSize && cols <= config.grid.maxSize) {
                this.resizeGrid(rows, cols);
            }
        });
    }
    
    /**
     * Add boundary toggle (toroidal/finite)
     */
    addBoundaryToggle() {
        // Use the template to create the HTML structure
        const boundaryFragment = createElementsFromHTML(
            createBoundaryToggleTemplate(this.gameManager.grid.boundaryType)
        );
        this.controlsContainer.appendChild(boundaryFragment);
        
        // Add event listener to the dropdown
        const dropdown = document.getElementById('boundary-select');
        dropdown.addEventListener('change', () => {
            this.gameManager.grid.setBoundaryType(dropdown.value);
            this.updateAnalytics();
        });
    }
    
    /**
     * Create analytics display
     */
    createAnalyticsDisplay() {
        // Use the template to create the HTML structure
        const grid = this.gameManager.grid;
        const analyticsFragment = createElementsFromHTML(
            createAnalyticsTemplate({
                generation: this.gameManager.generationCount,
                aliveCells: grid.getAliveCellsCount(),
                totalCells: grid.rows * grid.cols,
                simulationState: this.gameManager.isSimulationRunning ? 'Running' : 'Paused',
                speed: this.gameManager.simulationSpeed,
                boundaryType: grid.boundaryType,
                gridSize: {
                    rows: grid.rows,
                    cols: grid.cols
                }
            })
        );
        this.analyticsContainer.appendChild(analyticsFragment);
    }
    
    /**
     * Update analytics display
     */
    updateAnalytics() {
        // Get values from the game manager
        const grid = this.gameManager.grid;
        const generationCount = this.gameManager.generationCount;
        const liveCells = grid.getAliveCellsCount();
        const totalCells = grid.rows * grid.cols;
        const density = (liveCells / totalCells) * 100;
        
        // Update analytics elements
        document.getElementById('generation-count').textContent = generationCount.toString();
        document.getElementById('live-cell-count').textContent = liveCells.toString();
        document.getElementById('population-density').textContent = density.toFixed(2) + '%';
        document.getElementById('grid-size').textContent = `${grid.rows}×${grid.cols}`;
        document.getElementById('simulation-speed').textContent = `${this.gameManager.simulationSpeed} FPS`;
        document.getElementById('simulation-state').textContent = this.gameManager.isSimulationRunning ? 'Running' : 'Paused';
        document.getElementById('boundary-type').textContent = grid.boundaryType === 'toroidal' ? 'Toroidal' : 'Finite';
    }
    
    /**
     * Resize the grid
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     */
    resizeGrid(rows, cols) {
        this.gameManager.grid.resize(rows, cols);
        this.gameManager.renderer.settings.cellSize = 
            this.gameManager.renderer.calculateCellSize(rows, cols);
        this.gameManager.renderer.drawGrid(this.gameManager.grid);
        this.updateAnalytics();
    }
    
    /**
     * Set up canvas interactions (clicking to toggle cells)
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {Grid} grid - The grid object
     */
    setupCanvasInteractions(canvas, grid) {
        // Track interaction state
        let isInteracting = false;
        let lastToggledCell = { x: -1, y: -1 };
        let touchStartTime = 0;
        let touchStartPosition = { x: 0, y: 0 };
        
        /**
         * Normalize coordinates from either mouse or touch event
         * @param {Event} event - Mouse or touch event
         * @returns {Object|null} Normalized coordinates or null if not available
         */
        const normalizeEventCoordinates = (event) => {
            // Return an object with clientX and clientY properties
            if (event.type.includes('touch')) {
                if (event.touches && event.touches.length > 0) {
                    return {
                        clientX: event.touches[0].clientX,
                        clientY: event.touches[0].clientY,
                        isTouch: true
                    };
                } else if (event.changedTouches && event.changedTouches.length > 0) {
                    return {
                        clientX: event.changedTouches[0].clientX,
                        clientY: event.changedTouches[0].clientY,
                        isTouch: true
                    };
                }
                return null;
            }
            
            // Mouse event
            return {
                clientX: event.clientX,
                clientY: event.clientY,
                isTouch: false
            };
        };
        
        /**
         * Toggle cell at the event coordinates if not already toggled
         * @param {Event} event - Mouse or touch event
         */
        const toggleCellAtEventCoordinates = (event) => {
            // Prevent default behavior (scrolling, etc.)
            event.preventDefault();
            
            const coords = this.gameManager.renderer.getCellCoordinates(event, grid);
            
            // Only toggle if we have valid coordinates and it's not the same cell as last toggled
            if (coords && (coords.x !== lastToggledCell.x || coords.y !== lastToggledCell.y)) {
                lastToggledCell = { x: coords.x, y: coords.y };
                grid.toggleCell(coords.x, coords.y);
                this.gameManager.renderer.drawGrid(grid);
                this.updateAnalytics();
                
                // Add visual feedback for touch events
                if (event.type.startsWith('touch')) {
                    this.createTouchRipple(event);
                }
            }
        };
        
        /**
         * Handle start of interaction (mousedown/touchstart)
         * @param {Event} event - Mouse or touch event
         */
        const handleInteractionStart = (event) => {
            isInteracting = true;
            
            // For touch events, record start time and position
            if (event.type === 'touchstart') {
                touchStartTime = Date.now();
                const coords = normalizeEventCoordinates(event);
                if (coords) {
                    touchStartPosition = {
                        x: coords.clientX,
                        y: coords.clientY
                    };
                }
            }
            
            toggleCellAtEventCoordinates(event);
            canvas.classList.add('game-canvas--active');
        };
        
        /**
         * Handle end of interaction (mouseup/touchend)
         * @param {Event} event - Mouse or touch event
         */
        const handleInteractionEnd = (event) => {
            isInteracting = false;
            lastToggledCell = { x: -1, y: -1 };
            
            // For touch events, check if it was a short tap
            if (event && event.type === 'touchend') {
                const touchDuration = Date.now() - touchStartTime;
                
                // If this was a quick tap (< 300ms), handle as toggle
                if (touchDuration < 300) {
                    toggleCellAtEventCoordinates(event);
                }
            }
            
            canvas.classList.remove('game-canvas--active');
        };
        
        /**
         * Handle movement during interaction (mousemove/touchmove)
         * @param {Event} event - Mouse or touch event
         */
        const handleInteractionMove = (event) => {
            if (!isInteracting) return;
            
            // For touch moves, check if the user is trying to scroll
            if (event.type === 'touchmove') {
                const coords = normalizeEventCoordinates(event);
                if (coords) {
                    const deltaX = Math.abs(coords.clientX - touchStartPosition.x);
                    const deltaY = Math.abs(coords.clientY - touchStartPosition.y);
                    
                    // If movement exceeds threshold, might be a scroll
                    if (deltaX > 20 || deltaY > 20) {
                        // If more vertical than horizontal, let page scroll
                        if (deltaY > deltaX * 1.5) {
                            return; // Allow vertical scrolling
                        }
                    }
                }
            }
            
            toggleCellAtEventCoordinates(event);
        };
        
        // Register mouse events
        canvas.addEventListener('mousedown', handleInteractionStart);
        document.addEventListener('mouseup', handleInteractionEnd);
        canvas.addEventListener('mousemove', handleInteractionMove);
        
        // Register touch events with passive: false to allow preventDefault
        canvas.addEventListener('touchstart', handleInteractionStart, { passive: false });
        canvas.addEventListener('touchend', handleInteractionEnd, { passive: false });
        canvas.addEventListener('touchmove', handleInteractionMove, { passive: false });
        
        // Prevent context menu on canvas
        canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            return false;
        });
    }
    
    /**
     * Create a ripple effect for touch feedback
     * @param {TouchEvent} event - The touch event
     */
    createTouchRipple(event) {
        // Get touch coordinates
        const touch = event.touches[0] || event.changedTouches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Create ripple element
        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // Add to document
        document.body.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => {
            ripple.remove();
        }, 500);
    }
}

export default UIManager; 