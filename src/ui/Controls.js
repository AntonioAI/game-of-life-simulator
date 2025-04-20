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
        
        // Create a container for the icon to ensure proper centering
        const iconContainer = document.createElement('span');
        iconContainer.className = 'button-icon-container';
        iconContainer.innerHTML = `<span class="icon">${icon}</span>`;
        
        // Add both icon and text for better semantics and touch targets
        const textContainer = document.createElement('span');
        textContainer.className = 'button-text';
        textContainer.textContent = tooltip;
        
        // Add to button
        button.appendChild(iconContainer);
        button.appendChild(textContainer);
        
        // Set tooltip
        button.title = tooltip;
        
        // Add accessibility attributes
        button.setAttribute('aria-label', tooltip);
        button.setAttribute('role', 'button');
        
        // Add a class for mobile specific targeting
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
            button.classList.add('touch-device-button');
        }
        
        // Add an active class handler for visual feedback
        button.addEventListener('touchstart', function() {
            this.classList.add('button-active');
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('button-active');
        }, { passive: true });
        
        // Add click handler
        if (clickHandler) {
            // Ensure the click handler works with both mouse and touch
            button.addEventListener('click', function(e) {
                e.preventDefault();
                clickHandler();
            });
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
        
        // Add ARIA attributes for accessibility
        speedSlider.setAttribute('aria-valuemin', minSpeed.toString());
        speedSlider.setAttribute('aria-valuemax', maxSpeed.toString());
        speedSlider.setAttribute('aria-valuenow', initialSpeed.toString());
        speedSlider.setAttribute('aria-label', 'Simulation Speed');
        
        speedSlider.addEventListener('input', (e) => {
            const newSpeed = parseInt(e.target.value);
            
            // Update label
            speedLabel.textContent = `Speed: ${newSpeed} FPS`;
            
            // Update ARIA value for accessibility
            speedSlider.setAttribute('aria-valuenow', newSpeed.toString());
            
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