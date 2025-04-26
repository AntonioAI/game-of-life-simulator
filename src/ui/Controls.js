/**
 * Game of Life Simulator - Controls Module
 * Responsible for user controls implementation
 * Copyright (c) 2025 Antonio Innocente
 */

import { createButtonTemplate, createSpeedSliderTemplate, createSettingInputTemplate, 
    createSelectDropdownTemplate, createPrimaryButtonTemplate } from './componentTemplates/ControlsComponentTemplate.js';
import { createElementFromHTML } from '../utils/DOMHelper.js';

/**
 * Controls class for creating and managing UI controls
 */
class Controls {
    constructor() {
        // Control state
        this.speedValue = 10; // Default speed (FPS)
    }
    
    /**
     * Create a button with icon and tooltip
     * @param {string} icon - Button icon content (HTML)
     * @param {string} tooltip - Button tooltip text
     * @param {Function} clickHandler - Click event handler
     * @returns {HTMLButtonElement} The created button
     */
    createButton(icon, tooltip, clickHandler) {
        const buttonElement = createElementFromHTML(createButtonTemplate(icon, tooltip));
        
        if (clickHandler) {
            buttonElement.addEventListener('click', clickHandler);
        }
        
        return buttonElement;
    }
    
    /**
     * Create a slider for simulation speed
     * @param {number} minSpeed - Minimum speed value
     * @param {number} maxSpeed - Maximum speed value
     * @param {number} initialSpeed - Initial speed value
     * @param {Function} changeHandler - Value change handler
     * @returns {Object} The created speed control elements: { container, label, slider }
     */
    createSpeedSlider(minSpeed, maxSpeed, initialSpeed, changeHandler) {
        const speedControlElement = createElementFromHTML(createSpeedSliderTemplate({
            minSpeed,
            maxSpeed,
            initialSpeed
        }));
        
        const speedLabel = speedControlElement.querySelector('label');
        const speedSlider = speedControlElement.querySelector('input');
        
        speedSlider.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            
            // Update label
            speedLabel.textContent = `Speed: ${newSpeed} FPS`;
            
            // Call the change handler
            if (changeHandler) {
                changeHandler(newSpeed);
            }
        });
        
        return {
            container: speedControlElement,
            label: speedLabel,
            slider: speedSlider
        };
    }
    
    /**
     * Create a settings input field with label
     * @param {string} label - Input label text
     * @param {string} type - Input type (text, number, etc.)
     * @param {string|number} value - Initial value
     * @param {Object} options - Input options (min, max, etc.)
     * @returns {Object} The created elements: { container, label, input }
     */
    createSettingInput(label, type, value, options = {}) {
        // Prepare attributes object
        const attributes = {};
        Object.keys(options).forEach(key => {
            if (key !== 'changeHandler') attributes[key] = options[key];
        });
        
        const settingElement = createElementFromHTML(createSettingInputTemplate({
            label,
            type,
            value,
            attributes
        }));
        
        const labelElement = settingElement.querySelector('label');
        const inputElement = settingElement.querySelector('input');
        
        // Add change handler if provided
        if (options.changeHandler) {
            inputElement.addEventListener('change', options.changeHandler);
        }
        
        return {
            container: settingElement,
            label: labelElement,
            input: inputElement
        };
    }
    
    /**
     * Create a select dropdown
     * @param {string} label - Select label text
     * @param {Array} options - Select options [{ value, text }]
     * @param {string} initialValue - Initial selected value
     * @param {Function} changeHandler - Value change handler
     * @returns {Object} The created elements: { container, label, select }
     */
    createSelectDropdown(label, options, initialValue, changeHandler) {
        const dropdownElement = createElementFromHTML(createSelectDropdownTemplate({
            label,
            options,
            initialValue
        }));
        
        const labelElement = dropdownElement.querySelector('label');
        const selectElement = dropdownElement.querySelector('select');
        
        // Add change handler
        if (changeHandler) {
            selectElement.addEventListener('change', () => {
                changeHandler(selectElement.value);
            });
        }
        
        return {
            container: dropdownElement,
            label: labelElement,
            select: selectElement
        };
    }
    
    /**
     * Create a primary action button
     * @param {string} text - Button text
     * @param {Function} clickHandler - Click event handler
     * @returns {HTMLButtonElement} The created button
     */
    createPrimaryButton(text, clickHandler) {
        const buttonElement = createElementFromHTML(createPrimaryButtonTemplate(text));
        
        if (clickHandler) {
            buttonElement.addEventListener('click', clickHandler);
        }
        
        return buttonElement;
    }
}

export default Controls; 