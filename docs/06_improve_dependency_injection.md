# Implementation Plan: Improve Dependency Injection Consistency

## Issue Description
The codebase attempts to use dependency injection in many places, but there are instances where objects are still tightly coupled. For example, the `UIManager` class directly creates a new `Controls` object if one isn't provided. This inconsistent approach to dependency injection makes the code harder to maintain, test, and extend.

## Current Implementation

Currently, dependencies are handled inconsistently across different components:

**In the UIManager constructor:**
```javascript
constructor(dependencies = {}) {
    this.gameManager = dependencies.gameManager || null;
    this.controls = dependencies.controls || new Controls();
    
    // UI elements references
    this.controlsContainer = document.querySelector('.control-panel');
    this.analyticsContainer = document.querySelector('.analytics-panel');
    this.patternsContainer = document.querySelector('.pattern-library');
}
```

**In main.js where components are initialized:**
```javascript
// Initialize modules using dependency injection

// Create rules instance
const rules = new Rules();
rules.initialize();

// Create grid with rules dependency
const grid = new Grid({ rules }, { rows: 50, cols: 50, boundaryType: 'toroidal' });

// Create renderer with canvas dependency
const renderer = new Renderer({ canvas });
renderer.initialize();

// Create controls
const controls = new Controls();

// Create pattern library
const patternLibrary = new PatternLibrary();
patternLibrary.initialize();

// Create game manager with grid and renderer dependencies
const gameManager = new GameManager({
    grid,
    renderer
});

// Create UI manager with dependencies
const uiManager = new UIManager({
    gameManager,
    controls
});

// Connect UIManager to GameManager
gameManager.uiManager = uiManager;
```

## Implementation Steps

### Step 1: Create a Dependency Container
1. Create a new directory `src/core` if it doesn't already exist
2. Create a new file `src/core/DependencyContainer.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Dependency Container Module
 * Responsible for managing dependencies between components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * DependencyContainer class for managing application dependencies
 */
class DependencyContainer {
    constructor() {
        // Map to store registered dependencies
        this.dependencies = new Map();
        
        // Map to store singleton instances
        this.singletons = new Map();
    }
    
    /**
     * Register a dependency
     * @param {string} name - The name of the dependency
     * @param {Function|Object} implementation - The implementation (class or object)
     * @param {boolean} isSingleton - Whether this should be a singleton instance
     * @param {Array} dependencies - Dependencies required for this implementation
     */
    register(name, implementation, isSingleton = false, dependencies = []) {
        this.dependencies.set(name, {
            implementation,
            isSingleton,
            dependencies
        });
    }
    
    /**
     * Resolve a dependency
     * @param {string} name - The name of the dependency to resolve
     * @returns {Object} The resolved dependency
     */
    resolve(name) {
        // Check if the dependency is registered
        if (!this.dependencies.has(name)) {
            throw new Error(`Dependency '${name}' is not registered`);
        }
        
        const dependency = this.dependencies.get(name);
        
        // If it's a singleton and we already have an instance, return it
        if (dependency.isSingleton && this.singletons.has(name)) {
            return this.singletons.get(name);
        }
        
        // Resolve any dependencies recursively
        const resolvedDependencies = {};
        for (const dep of dependency.dependencies) {
            resolvedDependencies[dep] = this.resolve(dep);
        }
        
        // Create the instance
        let instance;
        
        if (typeof dependency.implementation === 'function') {
            // It's a class constructor
            instance = new dependency.implementation(resolvedDependencies);
        } else {
            // It's an object
            instance = dependency.implementation;
        }
        
        // If it's a singleton, store the instance
        if (dependency.isSingleton) {
            this.singletons.set(name, instance);
        }
        
        return instance;
    }
    
    /**
     * Reset all singleton instances
     */
    resetSingletons() {
        this.singletons.clear();
    }
}

export default DependencyContainer;
```

### Step 2: Update UIManager to Use Proper Dependency Injection
1. Open `src/ui/UIManager.js`
2. Modify the constructor to require all dependencies:

```javascript
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
}
```

### Step 3: Update GameManager to Properly Handle Dependencies
1. Open `src/core/GameManager.js`
2. Modify the constructor to clearly define required dependencies:

```javascript
constructor(dependencies = {}) {
    // Validate required dependencies
    if (!dependencies.grid) {
        throw new Error('Grid dependency is required for GameManager');
    }
    if (!dependencies.renderer) {
        throw new Error('Renderer dependency is required for GameManager');
    }
    
    // Inject dependencies
    this.grid = dependencies.grid;
    this.renderer = dependencies.renderer;
    this.uiManager = dependencies.uiManager || null; // Optional, will be set later
    
    // Game state
    this.isSimulationRunning = false;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.simulationSpeed = 10;
    this.generationCount = 0;
}
```

### Step 4: Update Main.js to Use the Dependency Container
1. Open `src/main.js`
2. Modify the initialization code to use the dependency container:

```javascript
import DependencyContainer from './core/DependencyContainer.js';
import GameManager from './core/GameManager.js';
import Grid from './core/Grid.js';
import Rules from './core/Rules.js';
import Renderer from './rendering/Renderer.js';
import UIManager from './ui/UIManager.js';
import Controls from './ui/Controls.js';
import PatternLibrary from './patterns/PatternLibrary.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== Starting Game of Life Simulator ===');
    
    // Initialize the game
    const initialize = () => {
        // Get canvas element
        const canvas = document.querySelector('.game-canvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        // Remove hardcoded dimensions to allow proper responsive sizing
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        
        // Create the dependency container
        const container = new DependencyContainer();
        
        // Register dependencies with the container
        container.register('canvas', canvas, true); // Canvas as a singleton
        container.register('rules', Rules, true); // Rules as a singleton
        container.register('grid', Grid, true, ['rules']); // Grid depends on rules
        container.register('renderer', Renderer, true, ['canvas']); // Renderer depends on canvas
        container.register('controls', Controls, true); // Controls as a singleton
        container.register('patternLibrary', PatternLibrary, true); // PatternLibrary as a singleton
        container.register('gameManager', GameManager, true, ['grid', 'renderer']); // GameManager depends on grid and renderer
        container.register('uiManager', UIManager, true, ['gameManager', 'controls']); // UIManager depends on gameManager and controls
        
        // Resolve the main dependencies
        const rules = container.resolve('rules');
        const grid = container.resolve('grid');
        const renderer = container.resolve('renderer');
        const controls = container.resolve('controls');
        const patternLibrary = container.resolve('patternLibrary');
        const gameManager = container.resolve('gameManager');
        const uiManager = container.resolve('uiManager');
        
        // Connect UIManager to GameManager (circular dependency handled outside container)
        gameManager.uiManager = uiManager;
        
        // Initialize components
        rules.initialize();
        renderer.initialize();
        patternLibrary.initialize();
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
        
        // Explicitly calculate cell size once patternLibrary is loaded
        renderer.resizeCanvas(grid);
        
        // Draw initial state
        renderer.drawGrid(grid);
        
        // Update analytics after everything is initialized
        uiManager.updateAnalytics();
        
        // Track last known device pixel ratio to detect zoom changes
        let lastDevicePixelRatio = window.devicePixelRatio || 1;
        
        // Add window resize handler for responsive behavior with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Debounce resize events to avoid excessive redraws
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Check if device pixel ratio changed (browser zoom)
                const currentDpr = window.devicePixelRatio || 1;
                if (currentDpr !== lastDevicePixelRatio) {
                    lastDevicePixelRatio = currentDpr;
                    console.log('Browser zoom changed, recalculating canvas dimensions');
                }
                
                // Use the proper resizeCanvas method with grid parameter
                renderer.resizeCanvas(grid);
            }, 100);
        });
        
        // Add specific handler for zoom changes (mainly for Firefox)
        window.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                // This is likely a zoom event
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const currentDpr = window.devicePixelRatio || 1;
                    if (currentDpr !== lastDevicePixelRatio) {
                        lastDevicePixelRatio = currentDpr;
                        renderer.resizeCanvas(grid);
                    }
                }, 100);
            }
        }, { passive: false });
        
        console.log('=== Game of Life Simulator initialized ===');
    };
    
    // Start the application
    initialize();
});
```

### Step 5: Update All Other Components to Follow Consistent Dependency Pattern
1. Review each component class and ensure it follows the same pattern:
   - Clearly document required dependencies in constructor parameter comments
   - Validate required dependencies are provided
   - Don't create instances of dependencies internally

2. For example, update the Grid constructor:
```javascript
constructor(dependencies = {}, options = {}) {
    // Validate required dependencies
    if (!dependencies.rules) {
        throw new Error('Rules dependency is required for Grid');
    }
    
    this.rules = dependencies.rules;
    this.rows = options.rows || 50;
    this.cols = options.cols || 50;
    this.cellSize = 10;
    this.grid = [];
    this.boundaryType = options.boundaryType || 'toroidal'; // 'toroidal' or 'finite'
    
    // Initialize grid with dead cells
    this.initialize();
}
```

### Step 6: Add Unit Tests for Dependency Container
1. Create a test file: `src/tests/DependencyContainer.test.js`
2. Implement tests for dependency registration and resolution:

```javascript
import DependencyContainer from '../core/DependencyContainer.js';

// Test classes
class TestDependency {
    constructor() {
        this.value = 'test';
    }
}

class DependentClass {
    constructor(dependencies = {}) {
        this.dependency = dependencies.testDependency;
    }
}

// Test the dependency container
function testDependencyContainer() {
    const container = new DependencyContainer();
    
    // Test registration and resolution
    container.register('testDependency', TestDependency, true);
    const instance1 = container.resolve('testDependency');
    const instance2 = container.resolve('testDependency');
    
    console.assert(instance1 instanceof TestDependency, 'Instance should be of TestDependency type');
    console.assert(instance1 === instance2, 'Singleton instances should be identical');
    
    // Test dependency resolution
    container.register('dependentClass', DependentClass, false, ['testDependency']);
    const dependent = container.resolve('dependentClass');
    
    console.assert(dependent.dependency === instance1, 'Dependent class should receive the correct dependency');
    
    // Test resetting singletons
    container.resetSingletons();
    const instance3 = container.resolve('testDependency');
    
    console.assert(instance1 !== instance3, 'After reset, singleton instances should be different');
    
    console.log('All DependencyContainer tests passed!');
}

// Run tests
testDependencyContainer();
```

### Step 7: Testing in Full Application
1. Run the application with the updated dependency injection system
2. Test all functionality to ensure everything works as expected
3. Check the browser console for any errors related to missing dependencies

## Success Criteria
- All components clearly specify their required dependencies
- No component creates instances of other components internally
- The dependency container properly handles dependency registration and resolution
- All functionality of the application works as expected
- The code is more maintainable and testable due to proper dependency injection

## Rollback Plan
If issues arise:
1. Revert the changes to `src/main.js` and affected component files
2. Remove the newly created `src/core/DependencyContainer.js` file
3. Test to ensure the application works correctly with the reverted code
4. Analyze the issues encountered and develop a new approach 