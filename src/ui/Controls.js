/**
 * Game of Life Simulator - Controls Module
 * Responsible for user controls implementation
 * Copyright (c) 2025 Antonio Innocente
 */

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
        const button = document.createElement('button');
        button.innerHTML = `<span class="icon">${icon}</span>`;
        button.title = tooltip;
        
        if (clickHandler) {
            button.addEventListener('click', clickHandler);
        }
        
        return button;
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
        const speedControl = document.createElement('div');
        speedControl.className = 'control-panel__speed-control';
        
        const speedLabel = document.createElement('label');
        speedLabel.textContent = `Speed: ${initialSpeed} FPS`;
        speedControl.appendChild(speedLabel);
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = minSpeed.toString();
        speedSlider.max = maxSpeed.toString();
        speedSlider.value = initialSpeed.toString();
        
        speedSlider.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            
            // Update label
            speedLabel.textContent = `Speed: ${newSpeed} FPS`;
            
            // Call the change handler
            if (changeHandler) {
                changeHandler(newSpeed);
            }
        });
        
        speedControl.appendChild(speedSlider);
        
        return {
            container: speedControl,
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
        const container = document.createElement('div');
        container.className = 'control-panel__setting';
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        
        const input = document.createElement('input');
        input.type = type;
        input.value = value.toString();
        
        // Apply options
        Object.keys(options).forEach(key => {
            if (key === 'changeHandler') return; // Skip the event handler
            input[key] = options[key];
        });
        
        // Add change handler if provided
        if (options.changeHandler) {
            input.addEventListener('change', options.changeHandler);
        }
        
        // For mobile-friendly UI and proper alignment
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'control-panel__field';
        fieldWrapper.appendChild(labelElement);
        fieldWrapper.appendChild(input);
        
        container.appendChild(fieldWrapper);
        
        return {
            container,
            label: labelElement,
            input
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
        const container = document.createElement('div');
        container.className = 'control-panel__dropdown';
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        container.appendChild(labelElement);
        
        const select = document.createElement('select');
        
        // Add options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        
        // Set initial value
        select.value = initialValue;
        
        // Add change handler
        if (changeHandler) {
            select.addEventListener('change', () => {
                changeHandler(select.value);
            });
        }
        
        container.appendChild(select);
        
        return {
            container,
            label: labelElement,
            select
        };
    }
    
    /**
     * Create a primary action button
     * @param {string} text - Button text
     * @param {Function} clickHandler - Click event handler
     * @returns {HTMLButtonElement} The created button
     */
    createPrimaryButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'control-panel__button--primary';
        
        if (clickHandler) {
            button.addEventListener('click', clickHandler);
        }
        
        return button;
    }
}

export default Controls; 