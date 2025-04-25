/**
 * Game of Life Simulator - UI Templates Tests
 * Tests for UI template functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import { createSimulationControlsTemplate, createGridSettingsTemplate, createBoundaryToggleTemplate } from '../ui/templates/ControlsTemplate.js';
import { createAnalyticsTemplate } from '../ui/templates/AnalyticsTemplate.js';
import { createPatternLibraryContainerTemplate, createPatternCategoryTemplate, createPatternCardTemplate } from '../ui/templates/PatternLibraryTemplate.js';

/**
 * Test all template generation functions
 */
function testTemplates() {
    // Test simulation controls template
    const simulationControls = createSimulationControlsTemplate();
    console.assert(typeof simulationControls === 'string', 'Simulation controls should be a string');
    console.assert(simulationControls.includes('Simulation Controls'), 'Template should include the title');
    console.assert(simulationControls.includes('control-panel__buttons'), 'Template should include button container');
    
    // Test grid settings template
    const gridSettings = createGridSettingsTemplate({ rows: 75, cols: 75 });
    console.assert(typeof gridSettings === 'string', 'Grid settings should be a string');
    console.assert(gridSettings.includes('value="75"'), 'Template should include the current rows and cols');
    console.assert(gridSettings.includes('Grid Dimensions'), 'Template should include the title');
    
    // Test boundary toggle template
    const boundaryToggle = createBoundaryToggleTemplate('finite');
    console.assert(typeof boundaryToggle === 'string', 'Boundary toggle should be a string');
    console.assert(boundaryToggle.includes('value="finite" selected'), 'Template should select the current boundary type');
    console.assert(boundaryToggle.includes('Grid Boundary'), 'Template should include the title');
    
    // Test analytics template
    const analytics = createAnalyticsTemplate({
        generation: 10,
        aliveCells: 50,
        totalCells: 1000,
        simulationState: 'Running',
        speed: 15,
        boundaryType: 'toroidal',
        gridSize: { rows: 50, cols: 50 }
    });
    console.assert(typeof analytics === 'string', 'Analytics should be a string');
    console.assert(analytics.includes('>10<'), 'Template should include the current generation count');
    console.assert(analytics.includes('>50<'), 'Template should include the current alive cells count');
    console.assert(analytics.includes('>5.00%<'), 'Template should include the density percentage');
    console.assert(analytics.includes('>15 FPS<'), 'Template should include the speed');
    
    // Test pattern library container template
    const patternLibrary = createPatternLibraryContainerTemplate();
    console.assert(typeof patternLibrary === 'string', 'Pattern library container should be a string');
    console.assert(patternLibrary.includes('pattern-library__gallery'), 'Template should include gallery container');
    console.assert(patternLibrary.includes('pattern-library__search'), 'Template should include search container');
    
    // Test pattern category template
    const category = createPatternCategoryTemplate({
        name: 'Still Life',
        description: 'Patterns that remain unchanged'
    });
    console.assert(typeof category === 'string', 'Pattern category should be a string');
    console.assert(category.includes('>Still Life<'), 'Template should include the category name');
    console.assert(category.includes('Patterns that remain unchanged'), 'Template should include the category description');
    
    // Test pattern card template
    const patternCard = createPatternCardTemplate({
        id: 'glider',
        name: 'Glider',
        description: 'A classic pattern that moves diagonally'
    });
    console.assert(typeof patternCard === 'string', 'Pattern card should be a string');
    console.assert(patternCard.includes('data-pattern-id="glider"'), 'Template should include the pattern ID');
    console.assert(patternCard.includes('>Glider<'), 'Template should include the pattern name');
    
    console.log('All template tests passed!');
}

// Run tests
testTemplates(); 