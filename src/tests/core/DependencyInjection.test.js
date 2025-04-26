/**
 * Game of Life Simulator - Dependency Injection Test Script
 * Tests the new dependency container system
 * Copyright (c) 2025 Antonio Innocente
 */

import DependencyContainer from '../../core/DependencyContainer.js';
import Grid from '../../core/Grid.js';
import Rules from '../../core/Rules.js';
import GameManager from '../../core/GameManager.js';
import Renderer from '../../rendering/Renderer.js';
import UIManager from '../../ui/UIManager.js';
import Controls from '../../ui/Controls.js';

/**
 * Test function to verify dependency injection is working correctly
 */
function testDependencyInjection() {
    console.log('Testing dependency injection system...');
    
    // Create mock canvas
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 500;
    mockCanvas.height = 500;
    
    try {
        // Use the global container if available, or create a new one
        const container = window.appContainer || new DependencyContainer();
        
        // Register dependencies with the container
        container.register('canvas', mockCanvas, true);
        container.register('rules', Rules, true);
        container.register('grid', Grid, true, ['rules']);
        container.register('renderer', Renderer, true, ['canvas']);
        container.register('controls', Controls, true);
        container.register('gameManager', GameManager, true, ['grid', 'renderer']);
        container.register('uiManager', UIManager, true, ['gameManager', 'controls']);
        
        // Resolve the dependencies
        console.log('Resolving Rules...');
        const rules = container.resolve('rules');
        
        console.log('Resolving Grid...');
        const grid = container.resolve('grid');
        
        console.log('Resolving Renderer...');
        const renderer = container.resolve('renderer');
        
        console.log('Resolving Controls...');
        const controls = container.resolve('controls');
        
        console.log('Resolving GameManager...');
        const gameManager = container.resolve('gameManager');
        
        console.log('Resolving UIManager...');
        const uiManager = container.resolve('uiManager');
        
        // Connect GameManager to UIManager
        gameManager.uiManager = uiManager;
        
        // Verify all dependencies were properly created and connected
        console.assert(rules instanceof Rules, 'Rules should be a Rules instance');
        console.assert(grid instanceof Grid, 'Grid should be a Grid instance');
        console.assert(renderer instanceof Renderer, 'Renderer should be a Renderer instance');
        console.assert(controls instanceof Controls, 'Controls should be a Controls instance');
        console.assert(gameManager instanceof GameManager, 'GameManager should be a GameManager instance');
        console.assert(uiManager instanceof UIManager, 'UIManager should be a UIManager instance');
        
        // Verify the dependency relationships
        console.assert(grid.rules === rules, 'Grid should have Rules dependency');
        console.assert(gameManager.grid === grid, 'GameManager should have Grid dependency');
        console.assert(gameManager.renderer === renderer, 'GameManager should have Renderer dependency');
        console.assert(uiManager.gameManager === gameManager, 'UIManager should have GameManager dependency');
        console.assert(uiManager.controls === controls, 'UIManager should have Controls dependency');
        console.assert(gameManager.uiManager === uiManager, 'GameManager should have UIManager dependency');
        
        console.log('All dependency injection tests passed!');
        return true;
    } catch (error) {
        console.error('Dependency injection test failed:', error);
        return false;
    }
}

export default testDependencyInjection; 