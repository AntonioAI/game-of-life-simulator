# Implementation Plan: Refactor Duplicate Code

## Issue Description
There are multiple instances of duplicate code in the codebase. These duplications violate the DRY (Don't Repeat Yourself) principle, making the code harder to maintain. When changes are needed, they have to be made in multiple places, increasing the chance of inconsistencies and bugs. Specific instances include:

1. Duplicate methods for calculating living neighbors in both `Grid` and `Rules` classes
2. Duplicate code for mobile detection in multiple places
3. Redundant canvas resizing code in multiple components

## Current Implementation

### 1. Living Neighbor Calculation Duplication

In the `Grid` class:
```javascript
calculateLivingNeighbors(row, col) {
    let count = 0;
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            
            let neighborRow = row + i;
            let neighborCol = col + j;
            
            // Apply boundary conditions
            if (this.boundaryType === 'toroidal') {
                neighborRow = (neighborRow + this.rows) % this.rows;
                neighborCol = (neighborCol + this.cols) % this.cols;
            } else if (
                neighborRow < 0 || 
                neighborRow >= this.rows || 
                neighborCol < 0 || 
                neighborCol >= this.cols
            ) {
                continue;
            }
            
            if (this.grid[neighborRow][neighborCol]) {
                count++;
            }
        }
    }
    
    return count;
}
```

Similar code in the `Rules` class:
```javascript
getLivingNeighbors(grid, row, col) {
    let count = 0;
    const rows = grid.length;
    const cols = grid[0].length;
    const boundaryType = grid.boundaryType || 'toroidal';
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            
            let neighborRow = row + i;
            let neighborCol = col + j;
            
            // Handle boundary conditions
            if (boundaryType === 'toroidal') {
                neighborRow = (neighborRow + rows) % rows;
                neighborCol = (neighborCol + cols) % cols;
            } else if (
                neighborRow < 0 || 
                neighborRow >= rows || 
                neighborCol < 0 || 
                neighborCol >= cols
            ) {
                continue;
            }
            
            if (grid[neighborRow][neighborCol]) {
                count++;
            }
        }
    }
    
    return count;
}
```

### 2. Mobile Detection Duplication

In `main.js`:
```javascript
function isMobileDevice() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768)
    );
}
```

Similar code in `UIManager.js`:
```javascript
detectMobileDevice() {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768
    );
}
```

And again in `Renderer.js`:
```javascript
detectMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
        window.innerWidth <= 768
    );
}
```

### 3. Canvas Resizing Duplication

In `Renderer.js`:
```javascript
resizeCanvas(width, height) {
    if (!this.canvas) return;
    
    // Set the canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Apply settings for crisp pixel rendering
    this.ctx.imageSmoothingEnabled = false;
    
    // Redraw grid if it exists
    if (this.grid) {
        this.drawGrid(this.grid);
    }
}
```

Similar code in `UIManager.js`:
```javascript
resizeCanvas() {
    if (!this.renderer || !this.renderer.canvas) return;
    
    const container = this.renderer.canvas.parentElement;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Update canvas size
    this.renderer.canvas.width = width;
    this.renderer.canvas.height = height;
    
    // Ensure crisp rendering
    this.renderer.ctx.imageSmoothingEnabled = false;
    
    // Redraw the grid
    if (this.grid) {
        this.renderer.drawGrid(this.grid);
    }
}
```

## Implementation Steps

### Step 1: Create a Grid Utilities Module

1. Create a new file `src/utils/GridUtils.js`:

```javascript
/**
 * Game of Life Simulator - Grid Utilities
 * Utility functions for grid operations
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Calculate the number of living neighbors for a cell
 * @param {Array} grid - 2D array representing the grid
 * @param {number} row - Row index of the cell
 * @param {number} col - Column index of the cell
 * @param {Object} options - Additional options
 * @param {string} options.boundaryType - Type of boundary ('toroidal' or 'finite')
 * @param {number} options.rows - Number of rows in the grid (optional if grid is provided)
 * @param {number} options.cols - Number of columns in the grid (optional if grid is provided)
 * @returns {number} - Count of living neighbors
 */
function calculateLivingNeighbors(grid, row, col, options = {}) {
    let count = 0;
    
    // Determine grid dimensions
    const rows = options.rows || grid.length;
    const cols = options.cols || grid[0].length;
    const boundaryType = options.boundaryType || 'toroidal';
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            
            let neighborRow = row + i;
            let neighborCol = col + j;
            
            // Apply boundary conditions
            if (boundaryType === 'toroidal') {
                neighborRow = (neighborRow + rows) % rows;
                neighborCol = (neighborCol + cols) % cols;
            } else if (
                neighborRow < 0 || 
                neighborRow >= rows || 
                neighborCol < 0 || 
                neighborCol >= cols
            ) {
                continue;
            }
            
            if (grid[neighborRow][neighborCol]) {
                count++;
            }
        }
    }
    
    return count;
}

/**
 * Create an empty grid with the specified dimensions
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {boolean} value - Default value for cells (default: false)
 * @returns {Array} - 2D array representing the grid
 */
function createEmptyGrid(rows, cols, value = false) {
    return Array(rows).fill().map(() => Array(cols).fill(value));
}

/**
 * Clone a grid
 * @param {Array} grid - 2D array representing the grid
 * @returns {Array} - Deep copy of the grid
 */
function cloneGrid(grid) {
    return grid.map(row => [...row]);
}

// Export utility functions
export {
    calculateLivingNeighbors,
    createEmptyGrid,
    cloneGrid
};
```

### Step 2: Update Grid Class to Use Grid Utilities

1. Open `src/core/Grid.js`
2. Update the import section to include `GridUtils`:

```javascript
import { calculateLivingNeighbors, createEmptyGrid, cloneGrid } from '../utils/GridUtils.js';
```

3. Update the `initialize()` method to use GridUtils:

```javascript
initialize() {
    this.grid = createEmptyGrid(this.rows, this.cols);
}
```

4. Update the `clone()` method:

```javascript
clone() {
    return cloneGrid(this.grid);
}
```

5. Replace the duplicated `calculateLivingNeighbors()` method:

```javascript
calculateLivingNeighbors(row, col) {
    return calculateLivingNeighbors(this.grid, row, col, {
        boundaryType: this.boundaryType,
        rows: this.rows,
        cols: this.cols
    });
}
```

### Step 3: Update Rules Class to Use Grid Utilities

1. Open `src/core/Rules.js`
2. Update the import section to include `GridUtils`:

```javascript
import { calculateLivingNeighbors } from '../utils/GridUtils.js';
```

3. Replace the duplicated `getLivingNeighbors()` method:

```javascript
getLivingNeighbors(grid, row, col) {
    const rows = grid.length;
    const cols = grid[0].length;
    const boundaryType = grid.boundaryType || 'toroidal';
    
    return calculateLivingNeighbors(grid, row, col, {
        boundaryType: boundaryType,
        rows: rows,
        cols: cols
    });
}
```

### Step 4: Create a Device Utilities Module

1. Create a new file `src/utils/DeviceUtils.js`:

```javascript
/**
 * Game of Life Simulator - Device Utilities
 * Utility functions for device detection and handling
 * Copyright (c) 2025 Antonio Innocente
 */

// Mobile breakpoint in pixels
const MOBILE_BREAKPOINT = 768;

/**
 * Check if the current device is a mobile device
 * @param {number} breakpoint - Width in pixels that defines a mobile device (defaults to 768)
 * @returns {boolean} - True if the device is a mobile device
 */
function isMobileDevice(breakpoint = MOBILE_BREAKPOINT) {
    return (
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) ||
        window.innerWidth <= breakpoint
    );
}

/**
 * Add a window resize listener that detects device type changes
 * @param {Function} callback - Function to call when device type changes
 * @returns {Function} - Function to remove the event listener
 */
function addDeviceTypeChangeListener(callback) {
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
    }
    
    let isMobile = isMobileDevice();
    
    const handleResize = () => {
        const newIsMobile = isMobileDevice();
        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            callback(isMobile);
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Return function to remove the listener
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}

// Export utility functions
export {
    isMobileDevice,
    addDeviceTypeChangeListener,
    MOBILE_BREAKPOINT
};
```

### Step 5: Update Components to Use Device Utilities

1. Open `src/ui/UIManager.js`:
2. Update the import section to include `DeviceUtils`:

```javascript
import { isMobileDevice, addDeviceTypeChangeListener } from '../utils/DeviceUtils.js';
```

3. Update the `detectMobileDevice()` method:

```javascript
detectMobileDevice() {
    return isMobileDevice();
}
```

4. Open `src/rendering/Renderer.js`:
5. Update the import section to include `DeviceUtils`:

```javascript
import { isMobileDevice } from '../utils/DeviceUtils.js';
```

6. Update the `detectMobileDevice()` method:

```javascript
detectMobileDevice() {
    return isMobileDevice();
}
```

7. Open `src/main.js`:
8. Update the import section to include `DeviceUtils`:

```javascript
import { isMobileDevice, addDeviceTypeChangeListener } from '../utils/DeviceUtils.js';
```

9. Replace any direct calls to mobile detection with the utility function:

```javascript
// Change
if (isMobileDevice()) {
    // mobile device specific code
}

// To
import { isMobileDevice } from './utils/DeviceUtils.js';

if (isMobileDevice()) {
    // mobile device specific code
}
```

### Step 6: Create a Canvas Utilities Module

1. Create a new file `src/utils/CanvasUtils.js`:

```javascript
/**
 * Game of Life Simulator - Canvas Utilities
 * Utility functions for canvas operations
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Resize a canvas to the specified dimensions
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {number} width - The new width
 * @param {number} height - The new height
 * @param {Object} options - Additional options
 * @param {boolean} options.imageSmoothingEnabled - Whether to enable image smoothing (default: false)
 * @param {Function} options.afterResizeCallback - Function to call after resizing
 * @returns {boolean} - True if the canvas was resized successfully
 */
function resizeCanvas(canvas, width, height, options = {}) {
    if (!canvas) return false;
    
    // Get canvas context
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return false;
    
    // Set the canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Apply settings for crisp pixel rendering
    ctx.imageSmoothingEnabled = options.imageSmoothingEnabled !== undefined ? 
        options.imageSmoothingEnabled : false;
    
    // Call the callback if provided
    if (typeof options.afterResizeCallback === 'function') {
        options.afterResizeCallback(canvas, ctx);
    }
    
    return true;
}

/**
 * Resize a canvas to match its container's dimensions
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {Object} options - Additional options
 * @param {boolean} options.imageSmoothingEnabled - Whether to enable image smoothing (default: false)
 * @param {Function} options.afterResizeCallback - Function to call after resizing
 * @returns {boolean} - True if the canvas was resized successfully
 */
function resizeCanvasToContainer(canvas, options = {}) {
    if (!canvas) return false;
    
    const container = canvas.parentElement;
    if (!container) return false;
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    return resizeCanvas(canvas, width, height, options);
}

/**
 * Add a window resize listener that automatically resizes a canvas to its container
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {Object} options - Additional options
 * @param {boolean} options.imageSmoothingEnabled - Whether to enable image smoothing (default: false)
 * @param {Function} options.afterResizeCallback - Function to call after resizing
 * @returns {Function} - Function to remove the event listener
 */
function addCanvasResizeListener(canvas, options = {}) {
    if (!canvas) {
        throw new Error('Canvas element is required');
    }
    
    const handleResize = () => {
        resizeCanvasToContainer(canvas, options);
    };
    
    // Initial resize
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Return function to remove the listener
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}

// Export utility functions
export {
    resizeCanvas,
    resizeCanvasToContainer,
    addCanvasResizeListener
};
```

### Step 7: Update Renderer Class to Use Canvas Utilities

1. Open `src/rendering/Renderer.js`
2. Update the import section to include `CanvasUtils`:

```javascript
import { resizeCanvas, resizeCanvasToContainer, addCanvasResizeListener } from '../utils/CanvasUtils.js';
```

3. Update the `resizeCanvas()` method:

```javascript
resizeCanvas(width, height) {
    return resizeCanvas(this.canvas, width, height, {
        afterResizeCallback: () => {
            if (this.grid) {
                this.drawGrid(this.grid);
            }
        }
    });
}
```

4. Add a method to resize the canvas to its container:

```javascript
resizeCanvasToContainer() {
    return resizeCanvasToContainer(this.canvas, {
        afterResizeCallback: () => {
            if (this.grid) {
                this.drawGrid(this.grid);
            }
        }
    });
}
```

5. In the `initialize()` method, add a resize listener:

```javascript
initialize() {
    if (!this.canvas) {
        throw new Error('Canvas dependency is required');
    }
    
    // Set up the canvas context
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    
    // Add resize listener
    this.cleanupFunctions.push(
        addCanvasResizeListener(this.canvas, {
            afterResizeCallback: () => {
                if (this.grid) {
                    this.drawGrid(this.grid);
                }
            }
        })
    );
    
    // ... rest of the method ...
}
```

### Step 8: Update UIManager Class to Use Canvas Utilities

1. Open `src/ui/UIManager.js`
2. Update the import section to include `CanvasUtils`:

```javascript
import { resizeCanvasToContainer } from '../utils/CanvasUtils.js';
```

3. Update the `resizeCanvas()` method:

```javascript
resizeCanvas() {
    if (!this.renderer || !this.renderer.canvas) return;
    
    resizeCanvasToContainer(this.renderer.canvas, {
        afterResizeCallback: () => {
            if (this.grid) {
                this.renderer.drawGrid(this.grid);
            }
        }
    });
}
```

### Step 9: Testing

1. Create test files for each utility module:

**a. `src/tests/GridUtils.test.js`**:

```javascript
import { calculateLivingNeighbors, createEmptyGrid, cloneGrid } from '../utils/GridUtils.js';

function testGridUtils() {
    console.log('Testing GridUtils...');
    
    // Test createEmptyGrid
    const grid = createEmptyGrid(3, 3);
    console.assert(grid.length === 3, 'Grid should have 3 rows');
    console.assert(grid[0].length === 3, 'Grid should have 3 columns');
    console.assert(grid[0][0] === false, 'Cells should be initialized to false');
    
    // Test cloneGrid
    const original = [
        [false, true, false],
        [true, true, true],
        [false, true, false]
    ];
    const clone = cloneGrid(original);
    console.assert(JSON.stringify(clone) === JSON.stringify(original), 'Cloned grid should match original');
    
    // Modify the clone
    clone[0][0] = true;
    console.assert(clone[0][0] !== original[0][0], 'Modifying clone should not affect original');
    
    // Test calculateLivingNeighbors with toroidal boundary
    const testGrid = [
        [false, true, false],
        [true, false, true],
        [false, true, false]
    ];
    
    // Center cell should have 4 living neighbors
    const centerNeighbors = calculateLivingNeighbors(testGrid, 1, 1, {
        boundaryType: 'toroidal',
        rows: 3,
        cols: 3
    });
    console.assert(centerNeighbors === 4, 'Center cell should have 4 living neighbors (toroidal)');
    
    // Test with finite boundary
    const edgeNeighbors = calculateLivingNeighbors(testGrid, 0, 0, {
        boundaryType: 'finite',
        rows: 3,
        cols: 3
    });
    console.assert(edgeNeighbors === 1, 'Corner cell should have 1 living neighbor (finite)');
    
    console.log('GridUtils tests completed!');
}

// Run tests
testGridUtils();
```

**b. `src/tests/DeviceUtils.test.js`**:

```javascript
import { isMobileDevice, MOBILE_BREAKPOINT } from '../utils/DeviceUtils.js';

function testDeviceUtils() {
    console.log('Testing DeviceUtils...');
    
    // Test isMobileDevice based on window width
    const originalInnerWidth = window.innerWidth;
    
    // Mock window.innerWidth for testing
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: MOBILE_BREAKPOINT - 1  // Just below the breakpoint
    });
    
    console.assert(isMobileDevice(), 
        `Device should be detected as mobile when width is ${window.innerWidth}px (below ${MOBILE_BREAKPOINT}px)`);
    
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: MOBILE_BREAKPOINT + 1  // Just above the breakpoint
    });
    
    console.assert(!isMobileDevice(), 
        `Device should not be detected as mobile when width is ${window.innerWidth}px (above ${MOBILE_BREAKPOINT}px)`);
    
    // Reset window.innerWidth to original value
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth
    });
    
    console.log('DeviceUtils tests completed!');
}

// Run tests
testDeviceUtils();
```

**c. `src/tests/CanvasUtils.test.js`**:

```javascript
import { resizeCanvas, resizeCanvasToContainer } from '../utils/CanvasUtils.js';

function testCanvasUtils() {
    console.log('Testing CanvasUtils...');
    
    // Create a canvas for testing
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    // Test resizeCanvas
    resizeCanvas(canvas, 100, 100);
    console.assert(canvas.width === 100, 'Canvas width should be 100px');
    console.assert(canvas.height === 100, 'Canvas height should be 100px');
    
    // Test callback execution
    let callbackExecuted = false;
    resizeCanvas(canvas, 200, 200, {
        afterResizeCallback: () => {
            callbackExecuted = true;
        }
    });
    console.assert(callbackExecuted, 'Resize callback should be executed');
    
    // Create a container for the canvas
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '300px';
    document.body.appendChild(container);
    
    // Move canvas to container
    container.appendChild(canvas);
    
    // Test resizeCanvasToContainer
    resizeCanvasToContainer(canvas);
    console.assert(canvas.width === 300, 'Canvas width should match container width (300px)');
    console.assert(canvas.height === 300, 'Canvas height should match container height (300px)');
    
    // Clean up
    document.body.removeChild(container);
    
    console.log('CanvasUtils tests completed!');
}

// Run tests
testCanvasUtils();
```

2. Create a test file to verify the integration of the utility modules:

**`src/tests/DuplicateCodeRefactor.test.js`**:

```javascript
import { calculateLivingNeighbors } from '../utils/GridUtils.js';
import { isMobileDevice } from '../utils/DeviceUtils.js';
import { resizeCanvas } from '../utils/CanvasUtils.js';
import Grid from '../core/Grid.js';
import Rules from '../core/Rules.js';

function testDuplicateCodeRefactor() {
    console.log('Testing duplicate code refactoring...');
    
    // Create a test grid
    const grid = new Grid({}, { rows: 3, cols: 3 });
    
    // Set up a pattern
    grid.toggleCell(0, 1);
    grid.toggleCell(1, 0);
    grid.toggleCell(1, 2);
    grid.toggleCell(2, 1);
    
    // Create rules instance
    const rules = new Rules();
    
    // Compare results from Grid and Rules methods
    const gridNeighbors = grid.calculateLivingNeighbors(1, 1);
    const rulesNeighbors = rules.getLivingNeighbors(grid.grid, 1, 1);
    
    console.assert(gridNeighbors === rulesNeighbors, 
        `Both methods should return the same number of neighbors: ${gridNeighbors} === ${rulesNeighbors}`);
    
    // Verify that utilities are working correctly
    console.assert(typeof isMobileDevice() === 'boolean', 
        'isMobileDevice should return a boolean value');
    
    // Create a test canvas
    const canvas = document.createElement('canvas');
    const resizeResult = resizeCanvas(canvas, 100, 100);
    
    console.assert(resizeResult, 'resizeCanvas should return true for successful resize');
    console.assert(canvas.width === 100 && canvas.height === 100, 
        'Canvas should have the correct dimensions after resize');
    
    console.log('Duplicate code refactoring tests completed!');
}

// Run tests
testDuplicateCodeRefactor();
```

3. Run all tests to verify that the refactored code works correctly.

## Success Criteria
- Duplicate code is eliminated and replaced with reusable utility functions
- All components use the shared utility functions instead of duplicated code
- Unit tests pass for all utility functions
- The application works correctly without any regression in functionality
- Code is more maintainable and easier to understand
- New utility modules provide clear, well-documented interfaces

## Rollback Plan
If issues arise:
1. Revert the changes to all affected files (`Grid.js`, `Rules.js`, `Renderer.js`, `UIManager.js`, `main.js`)
2. Remove the newly created utility modules
3. Test to ensure the application works correctly with the reverted code
4. Analyze the issues encountered and develop a new approach 