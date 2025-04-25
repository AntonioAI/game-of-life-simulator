/**
 * Game of Life Simulator - Error Template Module
 * Responsible for generating HTML for error notifications
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for the error container
 * @returns {string} HTML string for the error container
 */
export function createErrorContainerTemplate() {
    return `
        <div id="error-container" class="error-container" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            max-width: 350px;
            z-index: 1000;
        "></div>
    `;
}

/**
 * Generate HTML for an error notification
 * @param {Object} errorDetails - Error details
 * @param {string} errorDetails.level - Error level (info, warning, error, fatal)
 * @param {string} errorDetails.message - Error message
 * @param {string} errorDetails.category - Error category
 * @param {Date} errorDetails.timestamp - Error timestamp
 * @returns {string} HTML string for error notification
 */
export function createErrorNotificationTemplate(errorDetails) {
    const { level, message, category, timestamp } = errorDetails;
    const timeString = timestamp ? timestamp.toLocaleTimeString() : '';
    
    return `
        <div class="error-notification error-${level}" style="
            margin-bottom: 10px;
            padding: 12px;
            border-radius: 4px;
            background-color: ${getLevelColor(level)};
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            position: relative;
            animation: fadeIn 0.3s ease-out;
        ">
            <div class="error-header" style="
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            ">
                <span class="error-type" style="font-weight: bold; text-transform: uppercase;">${level}</span>
                <span class="error-timestamp">${timeString}</span>
            </div>
            
            <div class="error-message" style="margin-bottom: 5px;">${message}</div>
            
            ${category ? `<div class="error-category" style="font-size: 0.9em; opacity: 0.8;">Category: ${category}</div>` : ''}
            
            <button class="error-dismiss" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                color: white;
                font-size: 1.2em;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
        </div>
    `;
}

/**
 * Get background color for error level
 * @param {string} level - Error level
 * @returns {string} CSS color
 * @private
 */
function getLevelColor(level) {
    switch (level) {
        case 'info':
            return '#3498db';
        case 'warning':
            return '#f39c12';
        case 'error':
            return '#e74c3c';
        case 'fatal':
            return '#c0392b';
        default:
            return '#7f8c8d';
    }
} 