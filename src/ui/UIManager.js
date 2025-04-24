/**
 * Game of Life Simulator - UIManager Module
 * Responsible for UI coordination
 * Copyright (c) 2025 Antonio Innocente
 */

import Controls from './Controls.js';
import eventBus, { Events } from '../core/EventBus.js';

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
        this.gameManager = dependencies.gameManager || null;
        this.controls = dependencies.controls || new Controls();
        
        // UI elements references
        this.controlsContainer = document.querySelector('.control-panel');
        this.analyticsContainer = document.querySelector('.analytics-panel');
        this.patternsContainer = document.querySelector('.pattern-library');
        
        // Store event subscriptions for cleanup
        this.subscriptions = [];
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
        // Subscribe to generation updated events to update analytics
        this.subscriptions = [
            eventBus.subscribe(Events.GENERATION_UPDATED, (data) => {
                this.updateAnalytics();
            }),
            
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
                // Force analytics update on pause to ensure accurate numbers
                this.updateAnalytics();
            }),
            
            eventBus.subscribe(Events.SIMULATION_RESET, () => {
                this.updateAnalytics();
            }),
            
            eventBus.subscribe(Events.SIMULATION_STEPPED, () => {
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
            }),
            
            eventBus.subscribe(Events.CELL_TOGGLED, () => {
                this.updateAnalytics();
            })
        ];
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
    }
    
    /**
     * Create simulation controls (start, pause, step, reset)
     */
    createSimulationControls() {
        const simulationControls = document.createElement('div');
        simulationControls.className = 'simulation-controls u-panel-section';
        
        // Title 
        const simulationTitle = document.createElement('h3');
        simulationTitle.className = 'u-panel-section-title';
        simulationTitle.textContent = 'Simulation Controls';
        simulationControls.appendChild(simulationTitle);
        
        // Description for simulation controls
        const simulationDescription = document.createElement('p');
        simulationDescription.className = 'control-panel__description';
        simulationDescription.textContent = 'Control the simulation flow.';
        simulationControls.appendChild(simulationDescription);
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'control-panel__buttons';
        
        // Control buttons with clear labels and icons
        buttonContainer.appendChild(
            this.controls.createButton('▶', 'Start', 
                () => this.gameManager.startSimulation())
        );
        
        buttonContainer.appendChild(
            this.controls.createButton('⏸', 'Pause', 
                () => this.gameManager.pauseSimulation())
        );
        
        buttonContainer.appendChild(
            this.controls.createButton('➡', 'Step', 
                () => this.gameManager.stepSimulation())
        );
        
        buttonContainer.appendChild(
            this.controls.createButton('↺', 'Reset', 
                () => this.gameManager.resetSimulation())
        );
        
        simulationControls.appendChild(buttonContainer);
        
        // Speed control slider
        const speedControl = this.controls.createSpeedSlider(
            1, 60, this.gameManager.simulationSpeed,
            (speed) => this.gameManager.updateSimulationSpeed(speed)
        );
        simulationControls.appendChild(speedControl.container);
        
        this.controlsContainer.appendChild(simulationControls);
    }
    
    /**
     * Create settings panel (grid size, boundary type)
     */
    createSettingsPanel() {
        // Create grid settings section
        const gridSettings = document.createElement('div');
        gridSettings.className = 'grid-settings u-panel-section';
        
        // Create title for this section
        const gridTitle = document.createElement('h3');
        gridTitle.className = 'u-panel-section-title';
        gridTitle.textContent = 'Grid Dimensions';
        gridSettings.appendChild(gridTitle);
        
        // Create description text for better user guidance
        const gridDescription = document.createElement('p');
        gridDescription.className = 'control-panel__description';
        gridDescription.textContent = 'Select a preset size or enter custom dimensions.';
        gridSettings.appendChild(gridDescription);
        
        // Create preset buttons with improved layout
        const presetButtons = document.createElement('div');
        presetButtons.className = 'preset-buttons';
        
        // Define preset configurations with descriptions
        const presets = [
            { text: '50×50', description: 'Small Grid', handler: () => this.resizeGrid(50, 50) },
            { text: '75×75', description: 'Medium Grid', handler: () => this.resizeGrid(75, 75) },
            { text: '100×100', description: 'Large Grid', handler: () => this.resizeGrid(100, 100) }
        ];
        
        // Create buttons with improved styling
        presets.forEach(preset => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'preset-button';
            button.title = preset.description;
            button.textContent = preset.text;
            button.addEventListener('click', preset.handler);
            presetButtons.appendChild(button);
        });
        
        gridSettings.appendChild(presetButtons);
        
        // Create custom size inputs with improved layout
        const customSize = document.createElement('div');
        customSize.className = 'custom-size';
        
        // Create a heading for custom size
        const customSizeHeading = document.createElement('div');
        customSizeHeading.className = 'custom-size-heading';
        customSizeHeading.textContent = 'Custom Size';
        customSize.appendChild(customSizeHeading);
        
        // Create rows input with better alignment
        const rowsWrapper = document.createElement('div');
        rowsWrapper.className = 'dimension-input';
        
        const rowsLabel = document.createElement('label');
        rowsLabel.textContent = 'Rows:';
        rowsLabel.htmlFor = 'rows-input';
        rowsWrapper.appendChild(rowsLabel);
        
        const rowsInput = document.createElement('input');
        rowsInput.id = 'rows-input';
        rowsInput.type = 'number';
        rowsInput.min = '10';
        rowsInput.max = '200';
        rowsInput.value = this.gameManager.grid.rows;
        // Add validation to prevent invalid input only when input is complete
        rowsInput.addEventListener('change', () => {
            const value = parseInt(rowsInput.value);
            if (isNaN(value) || value < 10) rowsInput.value = 10;
            if (value > 200) rowsInput.value = 200;
        });
        rowsWrapper.appendChild(rowsInput);
        
        customSize.appendChild(rowsWrapper);
        
        // Create columns input with better alignment
        const colsWrapper = document.createElement('div');
        colsWrapper.className = 'dimension-input';
        
        const colsLabel = document.createElement('label');
        colsLabel.textContent = 'Columns:';
        colsLabel.htmlFor = 'cols-input';
        colsWrapper.appendChild(colsLabel);
        
        const colsInput = document.createElement('input');
        colsInput.id = 'cols-input';
        colsInput.type = 'number';
        colsInput.min = '10';
        colsInput.max = '200';
        colsInput.value = this.gameManager.grid.cols;
        // Add validation to prevent invalid input only when input is complete
        colsInput.addEventListener('change', () => {
            const value = parseInt(colsInput.value);
            if (isNaN(value) || value < 10) colsInput.value = 10;
            if (value > 200) colsInput.value = 200;
        });
        colsWrapper.appendChild(colsInput);
        
        customSize.appendChild(colsWrapper);
        
        // Create note about size limitations
        const sizeNote = document.createElement('div');
        sizeNote.className = 'size-note';
        sizeNote.textContent = 'Min: 10×10, Max: 200×200';
        customSize.appendChild(sizeNote);
        
        // Create apply button with improved styling
        const applyButton = document.createElement('button');
        applyButton.className = 'preset-apply';
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', () => {
            const rows = parseInt(rowsInput.value);
            const cols = parseInt(colsInput.value);
            if (rows >= 10 && rows <= 200 && cols >= 10 && cols <= 200) {
                this.resizeGrid(rows, cols);
            }
        });
        customSize.appendChild(applyButton);
        
        gridSettings.appendChild(customSize);
        
        // Add to controls container
        this.controlsContainer.appendChild(gridSettings);
    }
    
    /**
     * Add boundary toggle (toroidal/finite)
     */
    addBoundaryToggle() {
        // Create boundary setting section
        const boundarySettings = document.createElement('div');
        boundarySettings.className = 'boundary-setting u-panel-section';
        
        // Create title for this section
        const boundaryTitle = document.createElement('h3');
        boundaryTitle.className = 'u-panel-section-title';
        boundaryTitle.textContent = 'Grid Boundary';
        boundarySettings.appendChild(boundaryTitle);
        
        // Create description for boundary type
        const boundaryDescription = document.createElement('p');
        boundaryDescription.className = 'control-panel__description';
        boundaryDescription.textContent = 'Choose how cells behave at the grid edges.';
        boundarySettings.appendChild(boundaryDescription);
        
        // Create select container
        const selectContainer = document.createElement('div');
        selectContainer.className = 'boundary-select';
        
        // Create label
        const selectLabel = document.createElement('label');
        selectLabel.className = 'boundary-label';
        selectLabel.textContent = 'Boundary Type:';
        selectLabel.htmlFor = 'boundary-select';
        selectContainer.appendChild(selectLabel);
        
        // Create dropdown
        const dropdown = document.createElement('select');
        dropdown.className = 'boundary-dropdown';
        dropdown.id = 'boundary-select';
        
        // Add options
        const options = [
            { value: 'toroidal', text: 'Toroidal (Edges Connect)' },
            { value: 'finite', text: 'Finite (Fixed Edges)' }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === this.gameManager.grid.boundaryType) {
                optionElement.selected = true;
            }
            dropdown.appendChild(optionElement);
        });
        
        // Add change handler
        dropdown.addEventListener('change', () => {
            this.gameManager.grid.setBoundaryType(dropdown.value);
            this.updateAnalytics();
        });
        
        selectContainer.appendChild(dropdown);
        boundarySettings.appendChild(selectContainer);
        
        // Add to controls container
        this.controlsContainer.appendChild(boundarySettings);
    }
    
    /**
     * Create analytics display
     */
    createAnalyticsDisplay() {
        // Create analytics content container
        const analyticsContent = document.createElement('div');
        analyticsContent.className = 'analytics-panel__content';
        
        // Create analytics data container
        const analyticsData = document.createElement('div');
        analyticsData.className = 'analytics-data';
        
        // Generation counter
        const generationItem = document.createElement('div');
        generationItem.className = 'analytics-panel__item';
        
        const generationLabel = document.createElement('span');
        generationLabel.className = 'analytics-panel__label';
        generationLabel.textContent = 'Generation:';
        generationItem.appendChild(generationLabel);
        
        const generationValue = document.createElement('span');
        generationValue.className = 'analytics-panel__value';
        generationValue.id = 'generation-count';
        generationValue.textContent = '0';
        generationItem.appendChild(generationValue);
        
        analyticsData.appendChild(generationItem);
        
        // Live cell counter
        const liveCellItem = document.createElement('div');
        liveCellItem.className = 'analytics-panel__item';
        
        const liveCellLabel = document.createElement('span');
        liveCellLabel.className = 'analytics-panel__label';
        liveCellLabel.textContent = 'Live Cells:';
        liveCellItem.appendChild(liveCellLabel);
        
        const liveCellValue = document.createElement('span');
        liveCellValue.className = 'analytics-panel__value';
        liveCellValue.id = 'live-cell-count';
        liveCellValue.textContent = '0';
        liveCellItem.appendChild(liveCellValue);
        
        analyticsData.appendChild(liveCellItem);
        
        // Population density counter
        const densityItem = document.createElement('div');
        densityItem.className = 'analytics-panel__item';
        
        const densityLabel = document.createElement('span');
        densityLabel.className = 'analytics-panel__label';
        densityLabel.textContent = 'Population Density:';
        densityItem.appendChild(densityLabel);
        
        const densityValue = document.createElement('span');
        densityValue.className = 'analytics-panel__value';
        densityValue.id = 'population-density';
        densityValue.textContent = '0.0%';
        densityItem.appendChild(densityValue);
        
        analyticsData.appendChild(densityItem);
        
        // Grid size display
        const gridSizeItem = document.createElement('div');
        gridSizeItem.className = 'analytics-panel__item';
        
        const gridSizeLabel = document.createElement('span');
        gridSizeLabel.className = 'analytics-panel__label';
        gridSizeLabel.textContent = 'Grid Size:';
        gridSizeItem.appendChild(gridSizeLabel);
        
        const gridSizeValue = document.createElement('span');
        gridSizeValue.className = 'analytics-panel__value';
        gridSizeValue.id = 'grid-size';
        gridSizeValue.textContent = `${this.gameManager.grid.rows}×${this.gameManager.grid.cols}`;
        gridSizeItem.appendChild(gridSizeValue);
        
        analyticsData.appendChild(gridSizeItem);
        
        // Add speed display
        const speedItem = document.createElement('div');
        speedItem.className = 'analytics-panel__item';
        
        const speedLabel = document.createElement('span');
        speedLabel.className = 'analytics-panel__label';
        speedLabel.textContent = 'Speed:';
        speedItem.appendChild(speedLabel);
        
        const speedValue = document.createElement('span');
        speedValue.className = 'analytics-panel__value';
        speedValue.id = 'simulation-speed';
        speedValue.textContent = `${this.gameManager.simulationSpeed} FPS`;
        speedItem.appendChild(speedValue);
        
        analyticsData.appendChild(speedItem);
        
        // Add simulation state
        const stateItem = document.createElement('div');
        stateItem.className = 'analytics-panel__item';
        
        const stateLabel = document.createElement('span');
        stateLabel.className = 'analytics-panel__label';
        stateLabel.textContent = 'State:';
        stateItem.appendChild(stateLabel);
        
        const stateValue = document.createElement('span');
        stateValue.className = 'analytics-panel__value';
        stateValue.id = 'simulation-state';
        stateValue.textContent = this.gameManager.isSimulationRunning ? 'Running' : 'Paused';
        stateItem.appendChild(stateValue);
        
        analyticsData.appendChild(stateItem);
        
        // Add boundary type
        const boundaryItem = document.createElement('div');
        boundaryItem.className = 'analytics-panel__item';
        
        const boundaryLabel = document.createElement('span');
        boundaryLabel.className = 'analytics-panel__label';
        boundaryLabel.textContent = 'Boundary:';
        boundaryItem.appendChild(boundaryLabel);
        
        const boundaryValue = document.createElement('span');
        boundaryValue.className = 'analytics-panel__value';
        boundaryValue.id = 'boundary-type';
        boundaryValue.textContent = this.gameManager.grid.boundaryType === 'toroidal' ? 'Toroidal' : 'Finite';
        boundaryItem.appendChild(boundaryValue);
        
        analyticsData.appendChild(boundaryItem);
        
        analyticsContent.appendChild(analyticsData);
        this.analyticsContainer.appendChild(analyticsContent);
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
        // Track if we're currently interacting with the canvas
        let isInteracting = false;
        // Store the last cell toggled to avoid multiple toggles on the same cell
        let lastToggledCell = { x: -1, y: -1 };
        // Track touch interactions to distinguish between taps and scrolls
        let touchStartTime = 0;
        let touchStartPosition = { x: 0, y: 0 };
        
        const handleCanvasInteraction = (event) => {
            // Prevent default behavior (like scrolling on mobile)
            event.preventDefault();
            
            const coords = this.gameManager.renderer.getCellCoordinates(event, grid);
            
            // Only toggle if we have valid coordinates and it's not the same cell as last toggled
            if (coords && (coords.x !== lastToggledCell.x || coords.y !== lastToggledCell.y)) {
                lastToggledCell = { x: coords.x, y: coords.y };
                grid.toggleCell(coords.x, coords.y);
                this.gameManager.renderer.drawGrid(grid);
                this.updateAnalytics();
                
                // Add visual feedback for touch
                if (event.type.startsWith('touch')) {
                    // Create a ripple effect at the touch point
                    this.createTouchRipple(event);
                }
            }
        };
        
        // Start interaction
        const startInteraction = (event) => {
            isInteracting = true;
            
            // For touch events, record start time and position for gesture detection
            if (event.type === 'touchstart') {
                touchStartTime = Date.now();
                if (event.touches && event.touches.length > 0) {
                    touchStartPosition = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY
                    };
                }
            }
            
            handleCanvasInteraction(event);
            
            // Add active class to canvas for visual feedback
            canvas.classList.add('game-canvas--active');
        };
        
        // End interaction
        const endInteraction = (event) => {
            isInteracting = false;
            lastToggledCell = { x: -1, y: -1 };
            
            // For touch events, check if it was a short tap
            if (event && event.type === 'touchend') {
                const touchDuration = Date.now() - touchStartTime;
                
                // If this was a quick tap (< 300ms), handle it as a toggle interaction
                if (touchDuration < 300) {
                    handleCanvasInteraction(event);
                }
            }
            
            // Remove active class from canvas
            canvas.classList.remove('game-canvas--active');
        };
        
        // Move interaction (for drag toggling)
        const moveInteraction = (event) => {
            if (!isInteracting) return;
            
            // For touch moves, check if the user is trying to scroll
            if (event.type === 'touchmove' && event.touches && event.touches.length > 0) {
                const deltaX = Math.abs(event.touches[0].clientX - touchStartPosition.x);
                const deltaY = Math.abs(event.touches[0].clientY - touchStartPosition.y);
                
                // If movement exceeds threshold, it might be a scroll - don't toggle cells
                if (deltaX > 20 || deltaY > 20) {
                    // If movement is more vertical than horizontal, let the page scroll
                    if (deltaY > deltaX * 1.5) {
                        return; // Allow vertical scrolling
                    }
                }
            }
            
            // Handle as a cell toggle
            handleCanvasInteraction(event);
        };
        
        // Mouse events for desktop
        canvas.addEventListener('mousedown', startInteraction);
        document.addEventListener('mouseup', endInteraction);
        canvas.addEventListener('mousemove', moveInteraction);
        
        // Touch events for mobile devices with improved handling
        canvas.addEventListener('touchstart', startInteraction, { passive: false });
        canvas.addEventListener('touchend', endInteraction, { passive: false });
        canvas.addEventListener('touchmove', moveInteraction, { passive: false });
        
        // Prevent context menu on canvas (for right-click)
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