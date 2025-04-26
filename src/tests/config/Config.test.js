/**
 * Game of Life Simulator - Config Tests
 * Tests for the configuration module
 * Copyright (c) 2025 Antonio Innocente
 */

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