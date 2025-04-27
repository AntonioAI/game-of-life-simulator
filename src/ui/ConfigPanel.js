/**
 * Game of Life Simulator - Configuration Panel Module
 * Manages the configuration UI
 * Copyright (c) 2025 Antonio Innocente
 * 
 * The ConfigPanel is responsible for managing user preferences that persist between sessions.
 * Unlike the Controls panel which affects the current simulation immediately,
 * the Configuration panel handles settings that are saved to localStorage and loaded on startup.
 * 
 * Changes in this panel require explicit saving via the "Save Configuration" button.
 * 
 * See docs/PANELS.md for more information on the difference between this and the Controls panel.
 */

import config, { saveConfig } from '../config/GameConfig.js';
import eventBus, { Events } from '../core/EventBus.js';
import { createElementsFromHTML, setTextContent } from '../utils/DOMHelper.js';

/**
 * ConfigPanel class for managing configuration UI
 * Handles persistent user preferences for appearance and default settings
 */
class ConfigPanel {
    constructor(dependencies = {}) {
        this.container = dependencies.container || document.querySelector('.config-panel');
        
        // Initialize the subscriptions array
        this.subscriptions = [];
    }
    
    /**
     * Initialize the configuration panel
     */
    initialize() {
        if (!this.container) {
            console.error('Configuration panel container not found');
            return;
        }
        
        this.createConfigPanel();
        this.subscribeToEvents();
    }
    
    /**
     * Create the configuration panel UI
     */
    createConfigPanel() {
        // Create the panel content using a safer approach
        const configPanelTemplate = `
            <h2 class="config-panel__title u-panel-title">Configuration</h2>
            <div class="u-panel-section">
                <h3 class="u-panel-section-title">Appearance</h3>
                
                <div class="config-item">
                    <label for="cell-color">Cell Color:</label>
                    <input type="color" id="cell-color" value="${config.rendering.cellColor}">
                </div>
                
                <div class="config-item">
                    <label for="grid-color">Grid Color:</label>
                    <input type="color" id="grid-color" value="${config.rendering.gridColor}">
                </div>
                
                <div class="config-item">
                    <label for="background-color">Background Color:</label>
                    <input type="color" id="background-color" value="${config.rendering.backgroundColor}">
                </div>
            </div>
            
            <div class="u-panel-section">
                <h3 class="u-panel-section-title">Preferences</h3>
                
                <div class="config-item">
                    <label for="default-speed">Default Speed:</label>
                    <input type="range" id="default-speed" min="${config.simulation.minSpeed}" max="${config.simulation.maxSpeed}" value="${config.simulation.defaultSpeed}">
                    <span id="default-speed-value">${config.simulation.defaultSpeed} FPS</span>
                </div>
                
                <div class="config-item">
                    <label>Default Grid Size:</label>
                    <select id="default-grid-size">
                        ${config.ui.presetSizes.map(preset => 
                            `<option value="${preset.rows},${preset.cols}" ${preset.rows === config.grid.defaultRows && preset.cols === config.grid.defaultCols ? 'selected' : ''}>
                                ${preset.name} (${preset.description})
                            </option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="config-item">
                    <label>Default Boundary:</label>
                    <select id="default-boundary">
                        <option value="toroidal" ${config.grid.defaultBoundaryType === 'toroidal' ? 'selected' : ''}>Toroidal (Wrap Around)</option>
                        <option value="finite" ${config.grid.defaultBoundaryType === 'finite' ? 'selected' : ''}>Finite (Fixed Edges)</option>
                    </select>
                </div>
            </div>
            
            <div class="config-actions">
                <button type="button" id="save-config" class="btn-primary">Save Configuration</button>
                <button type="button" id="reset-config" class="btn-secondary">Reset to Defaults</button>
            </div>
        `;
        
        // Clear container and append the template
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.container.appendChild(createElementsFromHTML(configPanelTemplate));
        
        // Add event listeners to the form elements
        this.addEventListeners();
    }
    
    /**
     * Add event listeners to the form elements
     */
    addEventListeners() {
        // Color pickers
        document.getElementById('cell-color').addEventListener('change', (e) => {
            config.rendering.cellColor = e.target.value;
            this.updateRendering();
        });
        
        document.getElementById('grid-color').addEventListener('change', (e) => {
            config.rendering.gridColor = e.target.value;
            this.updateRendering();
        });
        
        document.getElementById('background-color').addEventListener('change', (e) => {
            config.rendering.backgroundColor = e.target.value;
            this.updateRendering();
        });
        
        // Speed slider
        const defaultSpeedSlider = document.getElementById('default-speed');
        const defaultSpeedValue = document.getElementById('default-speed-value');
        
        defaultSpeedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            config.simulation.defaultSpeed = speed;
            // Use safe text content method
            setTextContent(defaultSpeedValue, `${speed} FPS`);
        });
        
        // Grid size selector
        document.getElementById('default-grid-size').addEventListener('change', (e) => {
            const [rows, cols] = e.target.value.split(',').map(Number);
            config.grid.defaultRows = rows;
            config.grid.defaultCols = cols;
        });
        
        // Boundary type selector
        document.getElementById('default-boundary').addEventListener('change', (e) => {
            config.grid.defaultBoundaryType = e.target.value;
        });
        
        // Save button
        document.getElementById('save-config').addEventListener('click', () => {
            if (saveConfig(config)) {
                alert('Configuration saved successfully!');
                eventBus.publish(Events.CONFIG_UPDATED, { config });
            } else {
                alert('Failed to save configuration. Please try again.');
            }
        });
        
        // Reset button
        document.getElementById('reset-config').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                localStorage.removeItem(config.storage.configKey);
                location.reload();
            }
        });
    }
    
    /**
     * Update the rendering based on the current configuration
     */
    updateRendering() {
        eventBus.publish(Events.RENDERING_CONFIG_UPDATED, {
            cellColor: config.rendering.cellColor,
            gridColor: config.rendering.gridColor,
            backgroundColor: config.rendering.backgroundColor
        });
    }
    
    /**
     * Subscribe to events
     */
    subscribeToEvents() {
        // No subscriptions needed for now, but could be added later
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // Unsubscribe from events
        this.subscriptions.forEach(unsubscribe => unsubscribe());
    }
}

export default ConfigPanel; 