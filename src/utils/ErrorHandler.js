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