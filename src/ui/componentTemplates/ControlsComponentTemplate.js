/**
 * Game of Life Simulator - Controls Component Template Module
 * Responsible for generating HTML for individual control components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for a button with icon and tooltip
 * @param {string} icon - Button icon content
 * @param {string} tooltip - Button tooltip text
 * @returns {string} HTML string for button
 */
export function createButtonTemplate(icon, tooltip) {
    return `
        <button title="${tooltip}">
            <span class="icon">${icon}</span>
        </button>
    `;
}

/**
 * Generate HTML for a speed slider
 * @param {Object} options - Speed slider options
 * @param {number} options.minSpeed - Minimum speed value
 * @param {number} options.maxSpeed - Maximum speed value
 * @param {number} options.initialSpeed - Initial speed value
 * @returns {string} HTML string for speed slider
 */
export function createSpeedSliderTemplate(options = {}) {
    const minSpeed = options.minSpeed || 1;
    const maxSpeed = options.maxSpeed || 60;
    const initialSpeed = options.initialSpeed || 10;
    
    return `
        <div class="control-panel__speed-control">
            <label>Speed: ${initialSpeed} FPS</label>
            <input type="range" min="${minSpeed}" max="${maxSpeed}" value="${initialSpeed}">
        </div>
    `;
}

/**
 * Generate HTML for a settings input field with label
 * @param {Object} options - Input options
 * @param {string} options.label - Input label text
 * @param {string} options.type - Input type (text, number, etc.)
 * @param {string|number} options.value - Initial value
 * @param {Object} options.attributes - Additional attributes to add to the input
 * @returns {string} HTML string for settings input
 */
export function createSettingInputTemplate(options = {}) {
    const label = options.label || 'Setting';
    const type = options.type || 'text';
    const value = options.value || '';
    
    // Create attribute string from attributes object
    let attributesStr = '';
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            attributesStr += ` ${key}="${value}"`;
        });
    }
    
    return `
        <div class="control-panel__setting">
            <div class="control-panel__field">
                <label>${label}</label>
                <input type="${type}" value="${value}"${attributesStr}>
            </div>
        </div>
    `;
}

/**
 * Generate HTML for a select dropdown
 * @param {Object} options - Select dropdown options
 * @param {string} options.label - Select label text
 * @param {Array} options.options - Select options [{ value, text }]
 * @param {string} options.initialValue - Initial selected value
 * @returns {string} HTML string for select dropdown
 */
export function createSelectDropdownTemplate(options = {}) {
    const label = options.label || 'Select';
    const selectOptions = options.options || [];
    const initialValue = options.initialValue || '';
    
    // Generate options HTML
    const optionsHtml = selectOptions.map(option => 
        `<option value="${option.value}" ${option.value === initialValue ? 'selected' : ''}>${option.text}</option>`
    ).join('');
    
    return `
        <div class="control-panel__dropdown">
            <label>${label}</label>
            <select>${optionsHtml}</select>
        </div>
    `;
}

/**
 * Generate HTML for a primary action button
 * @param {string} text - Button text
 * @returns {string} HTML string for primary button
 */
export function createPrimaryButtonTemplate(text) {
    return `
        <button class="control-panel__button--primary">${text}</button>
    `;
} 