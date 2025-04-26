/**
 * Game of Life Simulator - Utility Templates Tests
 * Tests for utility template functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import { createButtonTemplate, createSpeedSliderTemplate, 
    createSettingInputTemplate, createSelectDropdownTemplate, 
    createPrimaryButtonTemplate } from '../../../ui/componentTemplates/ControlsComponentTemplate.js';
import { createErrorContainerTemplate, createErrorNotificationTemplate } from '../../../utils/templateHelpers/ErrorTemplate.js';
import { createPerformanceMonitorTemplate, createPerformanceStatsTemplate } from '../../../utils/templateHelpers/PerformanceMonitorTemplate.js';
import { ErrorLevel, ErrorCategory } from '../../../utils/ErrorHandler.js';

/**
 * Test utility templates
 */
function testUtilityTemplates() {
    // Test Controls templates
    const buttonTemplate = createButtonTemplate('▶', 'Start');
    console.assert(typeof buttonTemplate === 'string', 'Button template should be a string');
    console.assert(buttonTemplate.includes('title="Start"'), 'Button template should include tooltip');
    console.assert(buttonTemplate.includes('<span class="icon">▶</span>'), 'Button template should include icon');
    
    const speedSliderTemplate = createSpeedSliderTemplate({ minSpeed: 1, maxSpeed: 60, initialSpeed: 15 });
    console.assert(typeof speedSliderTemplate === 'string', 'Speed slider template should be a string');
    console.assert(speedSliderTemplate.includes('min="1"'), 'Speed slider template should include min value');
    console.assert(speedSliderTemplate.includes('max="60"'), 'Speed slider template should include max value');
    console.assert(speedSliderTemplate.includes('value="15"'), 'Speed slider template should include initial value');
    
    const settingInputTemplate = createSettingInputTemplate({
        label: 'Test Input',
        type: 'number',
        value: 42,
        attributes: { min: 0, max: 100 }
    });
    console.assert(typeof settingInputTemplate === 'string', 'Setting input template should be a string');
    console.assert(settingInputTemplate.includes('<label>Test Input</label>'), 'Setting input template should include label');
    console.assert(settingInputTemplate.includes('type="number"'), 'Setting input template should include type');
    console.assert(settingInputTemplate.includes('value="42"'), 'Setting input template should include value');
    console.assert(settingInputTemplate.includes('min="0"'), 'Setting input template should include min attribute');
    
    const selectTemplate = createSelectDropdownTemplate({
        label: 'Test Select',
        options: [
            { value: 'option1', text: 'Option 1' },
            { value: 'option2', text: 'Option 2' }
        ],
        initialValue: 'option2'
    });
    console.assert(typeof selectTemplate === 'string', 'Select template should be a string');
    console.assert(selectTemplate.includes('<label>Test Select</label>'), 'Select template should include label');
    console.assert(selectTemplate.includes('Option 1'), 'Select template should include option text');
    console.assert(selectTemplate.includes('value="option2" selected'), 'Select template should mark initial value as selected');
    
    const primaryButtonTemplate = createPrimaryButtonTemplate('Save');
    console.assert(typeof primaryButtonTemplate === 'string', 'Primary button template should be a string');
    console.assert(primaryButtonTemplate.includes('>Save<'), 'Primary button template should include text');
    console.assert(primaryButtonTemplate.includes('control-panel__button--primary'), 'Primary button template should include class');
    
    // Test Error templates
    const errorContainerTemplate = createErrorContainerTemplate();
    console.assert(typeof errorContainerTemplate === 'string', 'Error container template should be a string');
    console.assert(errorContainerTemplate.includes('id="error-container"'), 'Error container template should include id');
    
    const errorNotificationTemplate = createErrorNotificationTemplate({
        level: ErrorLevel.ERROR,
        message: 'Test error message',
        category: ErrorCategory.DATA,
        timestamp: new Date()
    });
    console.assert(typeof errorNotificationTemplate === 'string', 'Error notification template should be a string');
    console.assert(errorNotificationTemplate.includes('class="error-notification error-error"'), 'Error notification template should include level class');
    console.assert(errorNotificationTemplate.includes('Test error message'), 'Error notification template should include message');
    console.assert(errorNotificationTemplate.includes('Category: data'), 'Error notification template should include category');
    
    // Test Performance Monitor templates
    const performanceMonitorTemplate = createPerformanceMonitorTemplate();
    console.assert(typeof performanceMonitorTemplate === 'string', 'Performance monitor template should be a string');
    console.assert(performanceMonitorTemplate.includes('class="performance-stats"'), 'Performance monitor template should include class');
    
    const performanceStatsTemplate = createPerformanceStatsTemplate({
        framesPerSecond: 60,
        frameTime: 16.67,
        activeAnimations: 1
    });
    console.assert(typeof performanceStatsTemplate === 'string', 'Performance stats template should be a string');
    console.assert(performanceStatsTemplate.includes('FPS: 60'), 'Performance stats template should include FPS');
    console.assert(performanceStatsTemplate.includes('Frame Time: 16.67ms'), 'Performance stats template should include frame time');
    console.assert(performanceStatsTemplate.includes('Active Animations: 1'), 'Performance stats template should include active animations');
    
    console.log('All utility template tests passed!');
}

// Run tests
testUtilityTemplates(); 