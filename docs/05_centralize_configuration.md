# Implementation Plan: Centralize Configuration

## Issue Description
The codebase contains hardcoded values scattered throughout different components, such as grid dimensions, cell size, simulation speed, etc. This makes it difficult to maintain and update the application, as changes to these values require modifying multiple files. It also makes it harder to add features like user-configurable settings or to save/load configurations.

## Current Implementation

Currently, configuration values are hardcoded in various components:

```javascript
// In Grid constructor:
this.rows = options.rows || 50;
this.cols = options.cols || 50;
this.cellSize = 10;

// In Renderer constructor:
this.settings = {
    cellSize: 10,
    gridColor: '#dddddd',
    cellColor: '#000000',
    backgroundColor: '#ffffff',
    minCellSize: 10
};

// In GameManager constructor:
this.simulationSpeed = 10;
```

## Implementation Steps

### Step 1: Create a Configuration Module
1. Create a new directory `src/config` if it doesn't already exist
2. Create a new file `src/config/GameConfig.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Configuration Module
 * Centralized configuration for the application
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Default configuration values
 */
const defaultConfig = {
    // Grid settings
    grid: {
        defaultRows: 50,
        defaultCols: 50,
        minSize: 10,
        maxSize: 200,
        defaultBoundaryType: 'toroidal' // 'toroidal' or 'finite'
    },
    
    // Rendering settings
    rendering: {
        cellSize: 10,
        minCellSize: 4,
        gridColor: '#dddddd',
        cellColor: '#000000',
        backgroundColor: '#ffffff',
        gridLineWidth: 0.5
    },
    
    // Simulation settings
    simulation: {
        defaultSpeed: 10, // frames per second
        minSpeed: 1,
        maxSpeed: 60,
        maxStepsPerFrame: 3 // maximum generations to compute in a single frame
    },
    
    // UI settings
    ui: {
        controlsPanelWidth: 300,
        mobileBreakpoint: 768, // px
        maxDataPoints: 50, // maximum data points to show in analytics charts
        presetSizes: [
            { name: '50×50', rows: 50, cols: 50, description: 'Small Grid' },
            { name: '75×75', rows: 75, cols: 75, description: 'Medium Grid' },
            { name: '100×100', rows: 100, cols: 100, description: 'Large Grid' }
        ]
    },
    
    // Storage settings
    storage: {
        configKey: 'game-of-life-config',
        patternsKey: 'game-of-life-patterns'
    }
};

/**
 * Load configuration from localStorage if available
 * @returns {Object} The loaded configuration merged with defaults
 */
function loadConfig() {
    try {
        const storedConfig = localStorage.getItem(defaultConfig.storage.configKey);
        if (storedConfig) {
            // Parse stored config and merge with defaults
            const parsedConfig = JSON.parse(storedConfig);
            return mergeDeep(defaultConfig, parsedConfig);
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
    }
    
    return { ...defaultConfig };
}

/**
 * Save configuration to localStorage
 * @param {Object} config - The configuration to save
 * @returns {boolean} True if the configuration was saved successfully
 */
function saveConfig(config) {
    try {
        const configToSave = JSON.stringify(config);
        localStorage.setItem(defaultConfig.storage.configKey, configToSave);
        return true;
    } catch (error) {
        console.error('Error saving configuration:', error);
        return false;
    }
}

/**
 * Deep merge two objects
 * @param {Object} target - The target object
 * @param {Object} source - The source object
 * @returns {Object} The merged object
 */
function mergeDeep(target, source) {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }
    
    return output;
}

/**
 * Check if a value is an object
 * @param {any} item - The value to check
 * @returns {boolean} True if the value is an object
 */
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

// Load the initial configuration
const config = loadConfig();

// Export the configuration and utility functions
export default config;
export { saveConfig };
```

### Step 2: Update Grid Class to Use Centralized Config
1. Open `src/core/Grid.js`
2. Import the config module at the top:

```javascript
import config from '../config/GameConfig.js';
```

3. Update the constructor to use the centralized config:

```javascript
constructor(dependencies = {}, options = {}) {
    this.rules = dependencies.rules || null;
    this.rows = options.rows || config.grid.defaultRows;
    this.cols = options.cols || config.grid.defaultCols;
    this.boundaryType = options.boundaryType || config.grid.defaultBoundaryType;
    this.grid = [];
    
    // Initialize grid with dead cells
    this.initialize();
}
```

4. Update any methods that use hardcoded values:

```javascript
resize(rows, cols) {
    // Ensure the new size is within the allowed range
    this.rows = Math.max(config.grid.minSize, Math.min(config.grid.maxSize, rows));
    this.cols = Math.max(config.grid.minSize, Math.min(config.grid.maxSize, cols));
    this.initialize();
    return this.grid;
}
```

### Step 3: Update Renderer Class to Use Centralized Config
1. Open `src/rendering/Renderer.js`
2. Import the config module at the top:

```javascript
import config from '../config/GameConfig.js';
```

3. Update the constructor to use the centralized config:

```javascript
constructor(dependencies = {}) {
    this.canvas = dependencies.canvas || null;
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: false }) : null;
    
    // Use centralized configuration
    this.settings = { ...config.rendering };
    
    // Track if we're on a mobile device
    this.isMobile = this.detectMobileDevice();
}
```

4. Update the `calculateCellSize()` method:

```javascript
calculateCellSize(rows, cols) {
    if (!this.canvas) {
        throw new Error('Canvas dependency is required');
    }
    
    // Get canvas container dimensions
    const container = this.canvas.parentElement;
    if (!container) {
        throw new Error('Canvas must have a parent container element');
    }
    
    // Get dimensions from container
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Use the smallest dimension to ensure the entire grid is visible
    const smallestDimension = Math.min(containerWidth, containerHeight);
    
    // Calculate cell size, ensuring it's not smaller than the minimum
    const calculatedSize = Math.floor(smallestDimension / Math.max(rows, cols));
    return Math.max(calculatedSize, config.rendering.minCellSize);
}
```

### Step 4: Update GameManager Class to Use Centralized Config
1. Open `src/core/GameManager.js`
2. Import the config module at the top:

```javascript
import config from '../config/GameConfig.js';
```

3. Update the constructor to use the centralized config:

```javascript
constructor(dependencies = {}) {
    // Inject dependencies
    this.grid = dependencies.grid || null;
    this.renderer = dependencies.renderer || null;
    this.uiManager = dependencies.uiManager || null;
    
    // Game state
    this.isSimulationRunning = false;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.simulationSpeed = config.simulation.defaultSpeed;
    this.generationCount = 0;
}
```

4. Update the `simulationLoop()` method to use config values:

```javascript
simulationLoop(timestamp) {
    // ... existing code ...
    
    // Calculate how many generations to step forward
    const stepsToTake = Math.min(
        Math.floor(elapsed / frameInterval),
        this.grid.rows > 80 ? 1 : config.simulation.maxStepsPerFrame
    );
    
    // ... rest of the method ...
}
```

### Step 5: Update UIManager Class to Use Centralized Config
1. Open `src/ui/UIManager.js`
2. Import the config module at the top:

```javascript
import config from '../config/GameConfig.js';
```

3. Update the methods that create UI elements to use the centralized config:

```javascript
createSimulationControls() {
    // ... existing code ...
    
    // Speed control slider
    const speedControl = this.controls.createSpeedSlider(
        config.simulation.minSpeed,
        config.simulation.maxSpeed,
        this.gameManager.simulationSpeed,
        (speed) => this.gameManager.updateSimulationSpeed(speed)
    );
    
    // ... rest of the method ...
}

createSettingsPanel() {
    // ... existing code ...
    
    // Create preset buttons with data from config
    const presetButtons = document.createElement('div');
    presetButtons.className = 'preset-buttons';
    
    // Use preset sizes from config
    config.ui.presetSizes.forEach(preset => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'preset-button';
        button.title = preset.description;
        button.textContent = preset.name;
        button.addEventListener('click', () => this.resizeGrid(preset.rows, preset.cols));
        presetButtons.appendChild(button);
    });
    
    // ... rest of the method ...
    
    // Set min/max values from config
    rowsInput.min = String(config.grid.minSize);
    rowsInput.max = String(config.grid.maxSize);
    
    colsInput.min = String(config.grid.minSize);
    colsInput.max = String(config.grid.maxSize);
    
    // ... rest of the method ...
}
```

### Step 6: Add Configuration UI
1. Create a new file `src/ui/ConfigPanel.js` for managing configuration UI:

```javascript
/**
 * Game of Life Simulator - Configuration Panel Module
 * Manages the configuration UI
 * Copyright (c) 2025 Antonio Innocente
 */

import config, { saveConfig } from '../config/GameConfig.js';
import eventBus, { Events } from '../core/EventBus.js';

/**
 * ConfigPanel class for managing configuration UI
 */
class ConfigPanel {
    constructor(dependencies = {}) {
        this.container = dependencies.container || document.querySelector('.config-panel');
        
        // Initialize the subscriptions array
        this.subscriptions = [];
    }
    
    /**
     * Initialize the configuration panel
     */
    initialize() {
        if (!this.container) {
            console.error('Configuration panel container not found');
            return;
        }
        
        this.createConfigPanel();
        this.subscribeToEvents();
    }
    
    /**
     * Create the configuration panel UI
     */
    createConfigPanel() {
        // Create the panel content
        this.container.innerHTML = `
            <h2 class="config-panel__title u-panel-title">Configuration</h2>
            <div class="u-panel-section">
                <h3 class="u-panel-section-title">Appearance</h3>
                
                <div class="config-item">
                    <label for="cell-color">Cell Color:</label>
                    <input type="color" id="cell-color" value="${config.rendering.cellColor}">
                </div>
                
                <div class="config-item">
                    <label for="grid-color">Grid Color:</label>
                    <input type="color" id="grid-color" value="${config.rendering.gridColor}">
                </div>
                
                <div class="config-item">
                    <label for="background-color">Background Color:</label>
                    <input type="color" id="background-color" value="${config.rendering.backgroundColor}">
                </div>
            </div>
            
            <div class="u-panel-section">
                <h3 class="u-panel-section-title">Preferences</h3>
                
                <div class="config-item">
                    <label for="default-speed">Default Speed:</label>
                    <input type="range" id="default-speed" min="${config.simulation.minSpeed}" max="${config.simulation.maxSpeed}" value="${config.simulation.defaultSpeed}">
                    <span id="default-speed-value">${config.simulation.defaultSpeed} FPS</span>
                </div>
                
                <div class="config-item">
                    <label>Default Grid Size:</label>
                    <select id="default-grid-size">
                        ${config.ui.presetSizes.map(preset => 
                            `<option value="${preset.rows},${preset.cols}" ${preset.rows === config.grid.defaultRows && preset.cols === config.grid.defaultCols ? 'selected' : ''}>
                                ${preset.name} (${preset.description})
                            </option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="config-item">
                    <label>Default Boundary:</label>
                    <select id="default-boundary">
                        <option value="toroidal" ${config.grid.defaultBoundaryType === 'toroidal' ? 'selected' : ''}>Toroidal (Wrap Around)</option>
                        <option value="finite" ${config.grid.defaultBoundaryType === 'finite' ? 'selected' : ''}>Finite (Fixed Edges)</option>
                    </select>
                </div>
            </div>
            
            <div class="config-actions">
                <button type="button" id="save-config" class="btn-primary">Save Configuration</button>
                <button type="button" id="reset-config" class="btn-secondary">Reset to Defaults</button>
            </div>
        `;
        
        // Add event listeners to the form elements
        this.addEventListeners();
    }
    
    /**
     * Add event listeners to the form elements
     */
    addEventListeners() {
        // Color pickers
        document.getElementById('cell-color').addEventListener('change', (e) => {
            config.rendering.cellColor = e.target.value;
            this.updateRendering();
        });
        
        document.getElementById('grid-color').addEventListener('change', (e) => {
            config.rendering.gridColor = e.target.value;
            this.updateRendering();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            config.rendering.backgroundColor = e.target.value;
            this.updateRendering();
        });
        
        // Speed slider
        const defaultSpeedSlider = document.getElementById('default-speed');
        const defaultSpeedValue = document.getElementById('default-speed-value');
        
        defaultSpeedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            config.simulation.defaultSpeed = speed;
            defaultSpeedValue.textContent = `${speed} FPS`;
        });
        
        // Grid size selector
        document.getElementById('default-grid-size').addEventListener('change', (e) => {
            const [rows, cols] = e.target.value.split(',').map(Number);
            config.grid.defaultRows = rows;
            config.grid.defaultCols = cols;
        });
        
        // Boundary type selector
        document.getElementById('default-boundary').addEventListener('change', (e) => {
            config.grid.defaultBoundaryType = e.target.value;
        });
        
        // Save button
        document.getElementById('save-config').addEventListener('click', () => {
            if (saveConfig(config)) {
                alert('Configuration saved successfully!');
                eventBus.publish(Events.CONFIG_UPDATED, { config });
            } else {
                alert('Failed to save configuration. Please try again.');
            }
        });
        
        // Reset button
        document.getElementById('reset-config').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                localStorage.removeItem(config.storage.configKey);
                location.reload();
            }
        });
    }
    
    /**
     * Update the rendering based on the current configuration
     */
    updateRendering() {
        eventBus.publish(Events.RENDERING_CONFIG_UPDATED, {
            cellColor: config.rendering.cellColor,
            gridColor: config.rendering.gridColor,
            backgroundColor: config.rendering.backgroundColor
        });
    }
    
    /**
     * Subscribe to events
     */
    subscribeToEvents() {
        // No subscriptions needed for now, but could be added later
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Unsubscribe from events
        this.subscriptions.forEach(unsubscribe => unsubscribe());
    }
}

export default ConfigPanel;
```

2. Update the Renderer class to handle rendering configuration updates:

```javascript
// Add to the list of event subscriptions in Renderer
this.subscriptions.push(
    eventBus.subscribe(Events.RENDERING_CONFIG_UPDATED, (data) => {
        this.updateSettings(data);
        if (this.grid) {
            this.drawGrid(this.grid);
        }
    })
);
```

### Step 7: Update EventBus to Include Configuration Events
1. Open `src/core/EventBus.js`
2. Add new event constants for configuration:

```javascript
export const Events = {
    // ... existing events ...
    
    // Configuration events
    CONFIG_UPDATED: 'config.updated',
    RENDERING_CONFIG_UPDATED: 'config.rendering.updated'
};
```

### Step 8: Update Main.js to Initialize ConfigPanel
1. Open `src/main.js`
2. Import the ConfigPanel:

```javascript
import ConfigPanel from './ui/ConfigPanel.js';
```

3. Add code to initialize the ConfigPanel:

```javascript
// Create and initialize the config panel
const configPanel = new ConfigPanel({
    container: document.querySelector('.config-panel')
});
configPanel.initialize();

// Register with component registry
componentRegistry.register('configPanel', configPanel);
```

### Step 9: Update HTML to Include Config Panel
1. Open `index.html`
2. Add a container for the config panel:

```html
<div class="config-panel u-panel transition-shadow">
    <!-- Config panel will be inserted here by JavaScript -->
</div>
```

### Step 10: Testing
1. Test the application with the centralized configuration:
   - Check that all components use the configuration values correctly
   - Verify that changing configuration values updates the application
   - Test that configurations persist between page reloads

2. Create a test file `src/tests/Config.test.js`:

```javascript
import config, { saveConfig } from '../config/GameConfig.js';

function testConfig() {
    // Test that the configuration object has the expected structure
    console.assert(config.grid, 'Configuration should have grid settings');
    console.assert(config.rendering, 'Configuration should have rendering settings');
    console.assert(config.simulation, 'Configuration should have simulation settings');
    
    // Test saving and loading configuration
    const originalCellColor = config.rendering.cellColor;
    config.rendering.cellColor = '#ff0000';
    
    const saveResult = saveConfig(config);
    console.assert(saveResult, 'Configuration should be saved successfully');
    
    // Reload the configuration (this would normally happen on page reload)
    const storedConfig = JSON.parse(localStorage.getItem(config.storage.configKey));
    console.assert(storedConfig.rendering.cellColor === '#ff0000', 'Stored configuration should have the updated value');
    
    // Reset the value for cleanup
    config.rendering.cellColor = originalCellColor;
    saveConfig(config);
    
    console.log('All Config tests passed!');
}

// Run tests
testConfig();
```

## Success Criteria
- All hardcoded values are moved to a centralized configuration module
- Components use the configuration values instead of hardcoded values
- User can modify configuration through a UI
- Configuration persists between page reloads
- The code is more maintainable and easier to extend

## Rollback Plan
If issues arise:
1. Revert the changes to all affected files
2. Remove the configuration UI
3. Test to ensure the application works correctly with the reverted code
4. Analyze the issues encountered and develop a new approach 