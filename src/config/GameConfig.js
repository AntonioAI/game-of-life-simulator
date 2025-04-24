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