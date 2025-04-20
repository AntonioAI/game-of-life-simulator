# Implementation Plan: Standardize Error Handling

## Issue Description
The codebase has inconsistent error handling with some methods throwing errors and others failing silently. This inconsistency makes the application harder to debug, decreases reliability, and results in a poor user experience when errors occur. Without a standardized approach to error handling, critical issues might go unnoticed or cause the application to crash unexpectedly.

## Current Implementation

Currently, error handling is implemented inconsistently across the codebase:

**Direct error throwing without user feedback:**
```javascript
// In Renderer.initialize():
if (!this.canvas) {
    throw new Error('Canvas dependency is required');
}

if (!this.ctx) {
    throw new Error('Failed to get canvas context');
}

// In GameManager.initialize():
if (!this.grid) {
    throw new Error('Grid dependency is required');
}
if (!this.renderer) {
    throw new Error('Renderer dependency is required');
}

// In Grid.computeNextGeneration():
if (!this.rules) {
    throw new Error('Rules dependency is required');
}
```

**Silent failures:**
```javascript
// In Grid.placePattern():
if (!pattern || !Array.isArray(pattern)) {
    return false; // Fails silently
}

// In Grid.setCell():
if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
    this.grid[y][x] = state === 1 ? 1 : 0;
    return true;
}
return false; // Fails silently
```

**Inconsistent error reporting to console:**
```javascript
// In main.js:
if (!canvas) {
    console.error('Canvas element not found');
    return;
}

// In other places, no console logging at all
```

This inconsistency makes debugging difficult and leads to a poor user experience when errors occur.

## Implementation Steps

### Step 1: Create Error Handler Module
1. Create a new directory `src/utils` if it doesn't already exist
2. Create a new file `src/utils/ErrorHandler.js` with the following content:

```javascript
/**
 * Game of Life Simulator - Error Handler Module
 * Standardized error handling and reporting
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Error severity levels
 * @enum {string}
 */
export const ErrorLevel = {
    /** Informational message, not critical */
    INFO: 'info',
    /** Warning that doesn't stop execution but should be addressed */
    WARNING: 'warning',
    /** Error that affects functionality but allows continuation */
    ERROR: 'error',
    /** Critical error that prevents further execution */
    FATAL: 'fatal'
};

/**
 * Error categories for grouping similar errors
 * @enum {string}
 */
export const ErrorCategory = {
    /** Initialization errors */
    INITIALIZATION: 'initialization',
    /** Dependency errors */
    DEPENDENCY: 'dependency',
    /** User input errors */
    INPUT: 'input',
    /** Rendering errors */
    RENDERING: 'rendering',
    /** Simulation errors */
    SIMULATION: 'simulation',
    /** Data errors */
    DATA: 'data',
    /** Network errors */
    NETWORK: 'network',
    /** Unknown errors */
    UNKNOWN: 'unknown'
};

/**
 * Error handler class for standardized error management
 */
class ErrorHandler {
    constructor() {
        /** @type {Array<Object>} Error log history */
        this.errorLog = [];
        
        /** @type {boolean} Whether to show errors to users */
        this.showUserErrors = true;
        
        /** @type {function} Error notification callback */
        this.notificationCallback = null;
        
        /** @type {HTMLElement|null} Error container for UI error display */
        this.errorContainer = null;
        
        // Initialize error UI if DOM is ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.initErrorUI();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.initErrorUI());
        }
    }
    
    /**
     * Initialize error UI components
     * @private
     */
    initErrorUI() {
        // Check if error container already exists
        if (document.getElementById('error-container')) {
            this.errorContainer = document.getElementById('error-container');
            return;
        }
        
        // Create error container if it doesn't exist
        this.errorContainer = document.createElement('div');
        this.errorContainer.id = 'error-container';
        this.errorContainer.className = 'error-container';
        this.errorContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            max-width: 350px;
            z-index: 1000;
        `;
        
        document.body.appendChild(this.errorContainer);
    }
    
    /**
     * Handle an error with standardized processing
     * @param {string} message - Error message
     * @param {ErrorLevel} level - Error severity level
     * @param {ErrorCategory} category - Error category
     * @param {Error|null} originalError - Original error object if available
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.showUser=true] - Whether to show this error to the user
     * @param {boolean} [options.logToConsole=true] - Whether to log this error to the console
     * @param {Function} [options.callback] - Callback to execute after handling the error
     * @returns {Object} Processed error object
     */
    handleError(message, level = ErrorLevel.ERROR, category = ErrorCategory.UNKNOWN, originalError = null, options = {}) {
        const timestamp = new Date();
        
        // Default options
        const showUser = options.showUser !== undefined ? options.showUser : true;
        const logToConsole = options.logToConsole !== undefined ? options.logToConsole : true;
        
        // Create standardized error object
        const errorDetails = {
            message,
            level,
            category,
            timestamp,
            originalError: originalError ? {
                message: originalError.message,
                stack: originalError.stack,
                name: originalError.name
            } : null
        };
        
        // Add to error log
        this.errorLog.push(errorDetails);
        
        // Log to console if enabled
        if (logToConsole) {
            this.logErrorToConsole(errorDetails);
        }
        
        // Show to user if enabled and error is significant enough
        if (showUser && this.showUserErrors && level !== ErrorLevel.INFO) {
            this.showErrorToUser(errorDetails);
        }
        
        // Execute callback if provided
        if (options.callback && typeof options.callback === 'function') {
            options.callback(errorDetails);
        }
        
        // Execute global notification callback if set
        if (this.notificationCallback && typeof this.notificationCallback === 'function') {
            this.notificationCallback(errorDetails);
        }
        
        // If error is fatal, prevent further execution
        if (level === ErrorLevel.FATAL) {
            throw new Error(`FATAL ERROR: ${message}`);
        }
        
        return errorDetails;
    }
    
    /**
     * Handle an informational message
     * @param {string} message - Info message
     * @param {ErrorCategory} category - Info category
     * @param {Object} [options] - Additional options
     * @returns {Object} Processed info object
     */
    info(message, category = ErrorCategory.UNKNOWN, options = {}) {
        // Default to not showing info messages to users
        const infoOptions = { ...options, showUser: options.showUser || false };
        return this.handleError(message, ErrorLevel.INFO, category, null, infoOptions);
    }
    
    /**
     * Handle a warning
     * @param {string} message - Warning message
     * @param {ErrorCategory} category - Warning category
     * @param {Error|null} originalError - Original error object if available
     * @param {Object} [options] - Additional options
     * @returns {Object} Processed warning object
     */
    warning(message, category = ErrorCategory.UNKNOWN, originalError = null, options = {}) {
        return this.handleError(message, ErrorLevel.WARNING, category, originalError, options);
    }
    
    /**
     * Handle an error
     * @param {string} message - Error message
     * @param {ErrorCategory} category - Error category
     * @param {Error|null} originalError - Original error object if available
     * @param {Object} [options] - Additional options
     * @returns {Object} Processed error object
     */
    error(message, category = ErrorCategory.UNKNOWN, originalError = null, options = {}) {
        return this.handleError(message, ErrorLevel.ERROR, category, originalError, options);
    }
    
    /**
     * Handle a fatal error
     * @param {string} message - Fatal error message
     * @param {ErrorCategory} category - Error category
     * @param {Error|null} originalError - Original error object if available
     * @param {Object} [options] - Additional options
     * @throws {Error} Always throws after processing
     */
    fatal(message, category = ErrorCategory.UNKNOWN, originalError = null, options = {}) {
        // Fatal errors always show to user
        const fatalOptions = { ...options, showUser: true };
        this.handleError(message, ErrorLevel.FATAL, category, originalError, fatalOptions);
    }
    
    /**
     * Log error to the console with appropriate formatting
     * @param {Object} errorDetails - Error details object
     * @private
     */
    logErrorToConsole(errorDetails) {
        const { level, message, category, originalError } = errorDetails;
        
        // Format console output based on error level
        switch (level) {
            case ErrorLevel.INFO:
                console.info(`[INFO][${category}] ${message}`);
                break;
            case ErrorLevel.WARNING:
                console.warn(`[WARNING][${category}] ${message}`);
                break;
            case ErrorLevel.ERROR:
            case ErrorLevel.FATAL:
                console.error(`[${level.toUpperCase()}][${category}] ${message}`);
                if (originalError && originalError.stack) {
                    console.error(originalError.stack);
                }
                break;
        }
    }
    
    /**
     * Display error to the user via UI
     * @param {Object} errorDetails - Error details object
     * @private
     */
    showErrorToUser(errorDetails) {
        if (!this.errorContainer) {
            this.initErrorUI();
        }
        
        const { level, message } = errorDetails;
        
        // Create error notification element
        const errorElement = document.createElement('div');
        errorElement.className = `error-notification error-${level}`;
        errorElement.innerHTML = `
            <div class="error-header">
                <span class="error-level">${level.toUpperCase()}</span>
                <button class="error-close">×</button>
            </div>
            <div class="error-message">${message}</div>
        `;
        
        // Add styles based on error level
        const bgColor = level === ErrorLevel.WARNING ? '#fff3cd' : 
                         level === ErrorLevel.ERROR ? '#f8d7da' : 
                         level === ErrorLevel.FATAL ? '#dc3545' : '#d1ecf1';
                         
        const textColor = level === ErrorLevel.WARNING ? '#856404' : 
                           level === ErrorLevel.ERROR ? '#721c24' : 
                           level === ErrorLevel.FATAL ? '#ffffff' : '#0c5460';
        
        errorElement.style.cssText = `
            background-color: ${bgColor};
            color: ${textColor};
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: opacity 0.3s ease-in-out;
            animation: slide-in 0.3s ease-out;
        `;
        
        // Add close button functionality
        const closeButton = errorElement.querySelector('.error-close');
        closeButton.style.cssText = `
            float: right;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            background: none;
            border: none;
            color: ${textColor};
        `;
        
        closeButton.addEventListener('click', () => {
            this.dismissError(errorElement);
        });
        
        // Add to error container
        this.errorContainer.appendChild(errorElement);
        
        // Auto-dismiss non-fatal errors after 5 seconds
        if (level !== ErrorLevel.FATAL) {
            setTimeout(() => {
                this.dismissError(errorElement);
            }, 5000);
        }
    }
    
    /**
     * Dismiss an error notification
     * @param {HTMLElement} errorElement - The error element to dismiss
     * @private
     */
    dismissError(errorElement) {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 300);
    }
    
    /**
     * Set a global callback for error notifications
     * @param {Function} callback - Function to call when errors occur
     */
    setNotificationCallback(callback) {
        if (typeof callback === 'function') {
            this.notificationCallback = callback;
        }
    }
    
    /**
     * Enable or disable user-facing error messages
     * @param {boolean} enabled - Whether to show errors to users
     */
    setUserErrorVisibility(enabled) {
        this.showUserErrors = Boolean(enabled);
    }
    
    /**
     * Get error log history
     * @param {number} [limit] - Maximum number of errors to return (most recent)
     * @returns {Array<Object>} Array of error objects
     */
    getErrorLog(limit) {
        if (limit && limit > 0) {
            return this.errorLog.slice(-limit);
        }
        return [...this.errorLog];
    }
    
    /**
     * Clear error log history
     */
    clearErrorLog() {
        this.errorLog = [];
    }
}

// Create and export a singleton instance
const errorHandler = new ErrorHandler();
export default errorHandler;
```

### Step 2: Add CSS for Error UI
1. Add the following CSS to the application's stylesheet:

```css
/* Error notification styles */
@keyframes slide-in {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}

.error-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
}

.error-notification {
    position: relative;
    animation: slide-in 0.3s ease-out;
}

.error-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.error-level {
    font-weight: bold;
}

.error-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

.error-message {
    word-wrap: break-word;
}
```

### Step 3: Update Grid Class
1. Modify the `src/core/Grid.js` file to use the new error handler:

```javascript
import errorHandler, { ErrorCategory } from '../utils/ErrorHandler.js';

// Inside Grid class:
computeNextGeneration() {
    // Validate rules dependency
    if (!this.rules) {
        errorHandler.error(
            'Rules dependency is required for computing the next generation',
            ErrorCategory.DEPENDENCY
        );
        return this.grid; // Return current grid state instead of throwing
    }
    
    // Rest of the method...
}

setCell(x, y, state) {
    // Ensure coordinates are within grid bounds
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
        this.grid[y][x] = state === 1 ? 1 : 0;
        return true;
    }
    
    // Log the out-of-bounds attempt
    errorHandler.warning(
        `Attempted to set cell outside grid bounds: (${x}, ${y})`,
        ErrorCategory.INPUT,
        null,
        { showUser: false } // Don't show to user, just log
    );
    
    return false;
}

placePattern(pattern, startX, startY) {
    if (!pattern || !Array.isArray(pattern)) {
        errorHandler.error(
            'Invalid pattern: Pattern must be a 2D array',
            ErrorCategory.INPUT
        );
        return false;
    }
    
    // Rest of the method...
}
```

### Step 4: Update Renderer Class
1. Modify the `src/rendering/Renderer.js` file to use the new error handler:

```javascript
import errorHandler, { ErrorCategory } from '../utils/ErrorHandler.js';

// Inside Renderer class:
initialize(canvas = null) {
    if (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
    }
    
    if (!this.canvas) {
        errorHandler.error(
            'Canvas dependency is required for renderer initialization',
            ErrorCategory.DEPENDENCY
        );
        return; // Early return instead of throwing
    }
    
    if (!this.ctx) {
        errorHandler.error(
            'Failed to get canvas context',
            ErrorCategory.RENDERING
        );
        return; // Early return instead of throwing
    }
    
    // Rest of the method...
}

drawGrid(grid) {
    // Ensure canvas and context are available
    if (!this.canvas || !this.ctx) {
        errorHandler.error(
            'Canvas and context are required for drawing grid',
            ErrorCategory.RENDERING
        );
        return; // Early return instead of throwing
    }
    
    // Rest of the method...
}
```

### Step 5: Update GameManager Class
1. Modify the `src/core/GameManager.js` file to use the new error handler:

```javascript
import errorHandler, { ErrorCategory } from '../utils/ErrorHandler.js';

// Inside GameManager class:
initialize() {
    // Validate dependencies
    if (!this.grid) {
        errorHandler.error(
            'Grid dependency is required for game manager initialization',
            ErrorCategory.DEPENDENCY
        );
        return; // Early return instead of throwing
    }
    
    if (!this.renderer) {
        errorHandler.error(
            'Renderer dependency is required for game manager initialization',
            ErrorCategory.DEPENDENCY
        );
        return; // Early return instead of throwing
    }
    
    // Rest of the method...
}

stepSimulation() {
    try {
        // Compute the next generation
        this.grid.computeNextGeneration();
        
        // Redraw the grid
        this.renderer.drawGrid(this.grid);
        
        // Update the generation count
        this.generationCount++;
        
        // Update the analytics
        if (this.uiManager) {
            this.uiManager.updateAnalytics();
        }
    } catch (err) {
        errorHandler.error(
            'Error during simulation step',
            ErrorCategory.SIMULATION,
            err
        );
    }
}
```

### Step 6: Update Main Entry Point
1. Modify the `src/main.js` file to use the new error handler:

```javascript
import errorHandler, { ErrorCategory } from './utils/ErrorHandler.js';

// Inside DOMContentLoaded handler:
const initialize = () => {
    // Get canvas element
    const canvas = document.querySelector('.game-canvas');
    if (!canvas) {
        errorHandler.error(
            'Canvas element not found',
            ErrorCategory.INITIALIZATION
        );
        return;
    }
    
    try {
        // Remove hardcoded dimensions to allow proper responsive sizing
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        
        // Initialize modules using dependency injection
        // ...
        
        console.log('=== Game of Life Simulator initialized ===');
    } catch (err) {
        errorHandler.fatal(
            'Failed to initialize Game of Life Simulator',
            ErrorCategory.INITIALIZATION,
            err
        );
    }
};
```

### Step 7: Add Error Recovery Mechanism
1. Add a global error handler to recover from uncaught errors:

```javascript
// In main.js, after imports:
import errorHandler, { ErrorCategory } from './utils/ErrorHandler.js';

// Set up global error handlers
window.addEventListener('error', (event) => {
    errorHandler.error(
        `Uncaught error: ${event.message}`,
        ErrorCategory.UNKNOWN,
        event.error
    );
});

window.addEventListener('unhandledrejection', (event) => {
    errorHandler.error(
        `Unhandled promise rejection: ${event.reason}`,
        ErrorCategory.UNKNOWN,
        event.reason
    );
});
```

### Step 8: Testing
1. Test all error scenarios to ensure they're handled gracefully:
   - Missing dependencies
   - Invalid inputs
   - Out-of-bounds grid access
   - Rendering failures
   - Simulation errors

2. Verify that the UI displays error messages appropriately:
   - Warnings show in yellow
   - Errors show in red
   - Fatal errors prevent further execution
   - Messages auto-dismiss after a few seconds

3. Check the error log to ensure all errors are being recorded

## Success Criteria
- All error handling is consistent throughout the codebase
- Errors are properly categorized and logged
- User-friendly error messages are displayed for significant errors
- Non-critical errors don't crash the application
- Error logs can be accessed for debugging
- Error UI is non-intrusive and dismissible
- Global error handler catches uncaught exceptions

## Rollback Plan
If any issues arise:
1. Remove error UI components from the DOM
2. Revert to the original error handling approach
3. Remove the ErrorHandler module
4. Restore original code in each class that was modified

## Estimated Time
- Creating the ErrorHandler module: 3 hours
- Updating core classes to use the error handler: 2 hours
- Implementing error UI: 2 hours
- Testing and debugging: 2 hours
- Total: Approximately 9 hours 