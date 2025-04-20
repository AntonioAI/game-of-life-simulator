# Implementation Plan: Implement Observer Pattern for Component Communication

## Issue Description
The codebase has tight coupling between components, with direct references to other components' methods. For example, in the `GameManager.simulationLoop()` method, there's a direct call to `uiManager.updateAnalytics()`. This tight coupling makes the code harder to maintain, test, and extend. The cursor rule "use-patterns-deliberately" suggests using the Observer pattern for UI updates.

## Current Implementation

Currently, components directly call methods on other components:

```javascript
// Inside GameManager.simulationLoop():
if (this.uiManager) {
    this.uiManager.updateAnalytics();
}

// In main.js, components are manually connected:
gameManager.uiManager = uiManager;
```

## Implementation Steps

### Step 1: Create an EventBus Module
1. Create a new file `src/core/EventBus.js` with the following content:

```javascript
/**
 * Game of Life Simulator - EventBus Module
 * Implements the Observer pattern for decoupled component communication
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * EventBus class for managing application-wide events
 */
class EventBus {
    constructor() {
        // Map to store event subscriptions
        // Key: event name, Value: array of handler functions
        this.subscriptions = new Map();
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - The name of the event to subscribe to
     * @param {Function} handler - The handler function to call when the event is published
     * @returns {Function} Unsubscribe function that can be called to remove the subscription
     */
    subscribe(eventName, handler) {
        if (!this.subscriptions.has(eventName)) {
            this.subscriptions.set(eventName, []);
        }
        
        const handlers = this.subscriptions.get(eventName);
        handlers.push(handler);
        
        // Return an unsubscribe function
        return () => {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        };
    }
    
    /**
     * Publish an event
     * @param {string} eventName - The name of the event to publish
     * @param {any} data - Optional data to pass to the event handlers
     */
    publish(eventName, data) {
        if (!this.subscriptions.has(eventName)) {
            return; // No subscribers, nothing to do
        }
        
        const handlers = this.subscriptions.get(eventName);
        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }
    
    /**
     * Remove all subscriptions for an event
     * @param {string} eventName - The name of the event to clear
     */
    clear(eventName) {
        if (eventName) {
            this.subscriptions.delete(eventName);
        } else {
            this.subscriptions.clear();
        }
    }
}

// Create a singleton instance
const eventBus = new EventBus();

export default eventBus;

// Event name constants for consistency
export const Events = {
    // Game state events
    SIMULATION_STARTED: 'simulation.started',
    SIMULATION_PAUSED: 'simulation.paused',
    SIMULATION_RESET: 'simulation.reset',
    SIMULATION_STEPPED: 'simulation.stepped',
    
    // Update events
    GENERATION_UPDATED: 'generation.updated',
    GRID_UPDATED: 'grid.updated',
    SPEED_UPDATED: 'speed.updated',
    GRID_RESIZED: 'grid.resized',
    BOUNDARY_CHANGED: 'boundary.changed',
    
    // User interaction events
    CELL_TOGGLED: 'cell.toggled',
    PATTERN_SELECTED: 'pattern.selected'
};
```

### Step 2: Update GameManager to Use EventBus
1. Open `src/core/GameManager.js`
2. Import the EventBus at the top of the file:

```javascript
import eventBus, { Events } from './EventBus.js';
```

3. Update the `startSimulation()` method:

```javascript
startSimulation() {
    if (this.isSimulationRunning) {
        return;
    }
    
    this.isSimulationRunning = true;
    
    // Publish the event that simulation started
    eventBus.publish(Events.SIMULATION_STARTED, {
        timestamp: performance.now()
    });
    
    // Start the simulation loop
    this.lastFrameTime = performance.now();
    this.simulationLoop();
}
```

4. Update the `pauseSimulation()` method:

```javascript
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
    
    // Publish the event that simulation paused
    eventBus.publish(Events.SIMULATION_PAUSED, {
        timestamp: performance.now(),
        generationCount: this.generationCount
    });
}
```

5. Update the `resetSimulation()` method:

```javascript
resetSimulation() {
    // Pause the simulation
    this.pauseSimulation();
    
    // Reset the grid
    this.grid.initialize();
    
    // Reset the generation count
    this.generationCount = 0;
    
    // Redraw the grid
    this.renderer.drawGrid(this.grid);
    
    // Publish the event that simulation was reset
    eventBus.publish(Events.SIMULATION_RESET, {
        timestamp: performance.now()
    });
}
```

6. Update the `stepSimulation()` method:

```javascript
stepSimulation() {
    // Compute the next generation
    this.grid.computeNextGeneration();
    
    // Redraw the grid
    this.renderer.drawGrid(this.grid);
    
    // Update the generation count
    this.generationCount++;
    
    // Publish the event that simulation stepped
    eventBus.publish(Events.SIMULATION_STEPPED, {
        timestamp: performance.now(),
        generationCount: this.generationCount,
        aliveCells: this.grid.getAliveCellsCount()
    });
}
```

7. Update the `updateSimulationSpeed()` method:

```javascript
updateSimulationSpeed(newSpeed) {
    this.simulationSpeed = newSpeed;
    
    // Publish the event that speed was updated
    eventBus.publish(Events.SPEED_UPDATED, {
        speed: newSpeed
    });
}
```

8. Update the `simulationLoop()` method to publish events instead of calling methods directly:

```javascript
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
        
        // Publish the event that generation was updated
        eventBus.publish(Events.GENERATION_UPDATED, {
            timestamp: currentTime,
            generationCount: this.generationCount,
            aliveCells: this.grid.getAliveCellsCount()
        });
        
        // Update last frame time, accounting for any extra time
        this.lastFrameTime = currentTime - (elapsed % frameInterval);
    }
    
    // Continue the loop with optimized animation frame request
    this.animationFrameId = requestAnimationFrame(this.simulationLoop.bind(this));
}
```

### Step 3: Update Grid Class to Use EventBus
1. Open `src/core/Grid.js`
2. Import the EventBus at the top of the file:

```javascript
import eventBus, { Events } from './EventBus.js';
```

3. Update the `resize()` method:

```javascript
resize(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.initialize();
    
    // Publish the event that grid was resized
    eventBus.publish(Events.GRID_RESIZED, {
        rows,
        cols,
        boundaryType: this.boundaryType
    });
}
```

4. Update the `toggleCell()` method:

```javascript
toggleCell(x, y) {
    // Ensure coordinates are within grid bounds
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        // Toggle the cell state (0 to 1 or 1 to 0)
        this.grid[y][x] = this.grid[y][x] === 0 ? 1 : 0;
        
        // Publish the event that a cell was toggled
        eventBus.publish(Events.CELL_TOGGLED, {
            x,
            y,
            state: this.grid[y][x]
        });
        
        return true;
    }
    return false;
}
```

5. Update the `setBoundaryType()` method:

```javascript
setBoundaryType(type) {
    if (type === 'toroidal' || type === 'finite') {
        this.boundaryType = type;
        
        // Publish the event that boundary type changed
        eventBus.publish(Events.BOUNDARY_CHANGED, {
            boundaryType: type
        });
    }
}
```

### Step 4: Update UIManager to Subscribe to Events
1. Open `src/ui/UIManager.js`
2. Import the EventBus at the top of the file:

```javascript
import eventBus, { Events } from '../core/EventBus.js';
```

3. Add a method to subscribe to events:

```javascript
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
        
        eventBus.subscribe(Events.GRID_RESIZED, () => {
            // Update the input fields with new dimensions
            const rowsInput = document.getElementById('rows-input');
            const colsInput = document.getElementById('cols-input');
            
            if (rowsInput && this.gameManager.grid) {
                rowsInput.value = this.gameManager.grid.rows;
            }
            
            if (colsInput && this.gameManager.grid) {
                colsInput.value = this.gameManager.grid.cols;
            }
        }),
        
        eventBus.subscribe(Events.BOUNDARY_CHANGED, (data) => {
            // Update the boundary radio buttons
            const boundaryRadios = document.querySelectorAll('input[name="boundary-type"]');
            boundaryRadios.forEach(radio => {
                radio.checked = radio.value === data.boundaryType;
            });
        })
    ];
}
```

4. Add a method to unsubscribe from events:

```javascript
unsubscribeFromEvents() {
    // Call all the unsubscribe functions
    if (this.subscriptions) {
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];
    }
}
```

5. Update the `initialize()` method to subscribe to events:

```javascript
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
```

6. Add a cleanup method to the class that unsubscribes from events:

```javascript
cleanup() {
    this.unsubscribeFromEvents();
}
```

### Step 5: Update PatternLibrary Class to Use EventBus
1. Open the PatternLibrary class file
2. Import the EventBus at the top of the file:

```javascript
import eventBus, { Events } from '../core/EventBus.js';
```

3. Update the pattern selection code to publish an event:

```javascript
placePatternInCenter(patternId, grid) {
    // Existing pattern placement code...
    
    // Publish the event that a pattern was selected
    eventBus.publish(Events.PATTERN_SELECTED, {
        patternId,
        timestamp: performance.now()
    });
}
```

### Step 6: Update main.js to Use the Event System
1. Open `src/main.js`
2. Remove the direct connection between GameManager and UIManager:

```javascript
// Remove this line:
gameManager.uiManager = uiManager;
```

3. Let components be connected through events instead.

### Step 7: Create A ComponentRegistry for Cleanup
1. Create a new file `src/core/ComponentRegistry.js` with the following content:

```javascript
/**
 * Game of Life Simulator - ComponentRegistry Module
 * Helps manage component lifecycle and cleanup
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * ComponentRegistry class for managing component lifecycle
 */
class ComponentRegistry {
    constructor() {
        this.components = new Map();
    }
    
    /**
     * Register a component
     * @param {string} name - Component name/identifier
     * @param {Object} component - The component instance
     */
    register(name, component) {
        this.components.set(name, component);
    }
    
    /**
     * Get a registered component
     * @param {string} name - Component name/identifier
     * @returns {Object} The component instance
     */
    get(name) {
        return this.components.get(name);
    }
    
    /**
     * Clean up all components
     * Calls the cleanup method on each component that has one
     */
    cleanupAll() {
        this.components.forEach(component => {
            if (component && typeof component.cleanup === 'function') {
                component.cleanup();
            }
        });
    }
}

// Create a singleton instance
const componentRegistry = new ComponentRegistry();

export default componentRegistry;
```

2. Update `src/main.js` to use the ComponentRegistry:

```javascript
import componentRegistry from './core/ComponentRegistry.js';

// After creating components, register them:
componentRegistry.register('gameManager', gameManager);
componentRegistry.register('uiManager', uiManager);
// etc.

// Add a cleanup handler for page unload:
window.addEventListener('beforeunload', () => {
    componentRegistry.cleanupAll();
});
```

### Step 8: Testing
1. Create a test file `src/tests/EventBus.test.js`:

```javascript
import eventBus, { Events } from '../core/EventBus.js';

function testEventBus() {
    let receivedData = null;
    let callCount = 0;
    
    // Test subscription and publishing
    const unsubscribe = eventBus.subscribe('test.event', (data) => {
        receivedData = data;
        callCount++;
    });
    
    // Publish an event
    eventBus.publish('test.event', { value: 42 });
    
    // Check if the handler was called with the correct data
    console.assert(callCount === 1, 'Handler should be called exactly once');
    console.assert(receivedData.value === 42, 'Handler should receive correct data');
    
    // Test unsubscribe
    unsubscribe();
    eventBus.publish('test.event', { value: 99 });
    
    // Check that handler wasn't called again
    console.assert(callCount === 1, 'Handler should not be called after unsubscribe');
    console.assert(receivedData.value === 42, 'Data should not change after unsubscribe');
    
    // Test multiple subscribers
    let counter1 = 0;
    let counter2 = 0;
    
    eventBus.subscribe('multi.event', () => counter1++);
    eventBus.subscribe('multi.event', () => counter2++);
    
    eventBus.publish('multi.event');
    
    console.assert(counter1 === 1 && counter2 === 1, 'Multiple handlers should be called');
    
    // Test error handling
    let errorThrown = false;
    eventBus.subscribe('error.event', () => {
        errorThrown = true;
        throw new Error('Test error');
    });
    
    // This should not throw to the calling code
    eventBus.publish('error.event');
    
    console.assert(errorThrown, 'Error handler should be called');
    
    // Clear all subscriptions for cleanup
    eventBus.clear();
    
    console.log('All EventBus tests passed!');
}

// Run tests
testEventBus();
```

2. Test the decoupled components in the full application:
   - Check that game state changes (start, pause, reset) are properly reflected in the UI
   - Verify that analytics updates happen correctly
   - Test that pattern selection works as expected
   - Ensure there are no errors in the console

## Success Criteria
- Components communicate through events rather than direct method calls
- The EventBus handles event subscription and publication
- Components can be tested in isolation
- All functionality works correctly through the new event system
- The code follows the Observer pattern as recommended in cursor rules

## Rollback Plan
If issues arise:
1. Revert the changes to all affected files
2. Restore direct component references where needed
3. Test to ensure the application works correctly with the reverted code
4. Analyze the issues encountered and develop a new approach 