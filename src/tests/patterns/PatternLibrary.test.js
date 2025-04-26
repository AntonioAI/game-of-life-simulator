/**
 * Game of Life Simulator - PatternLibrary Tests
 * Tests for PatternLibrary functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import PatternLibrary from '../../patterns/PatternLibrary.js';

/**
 * Mock the DOM environment for testing
 */
function setupTestDOM() {
    // Create or clear body
    document.body.innerHTML = '';
    
    // Create mock DOM containers
    const patternLibrary = document.createElement('div');
    patternLibrary.className = 'pattern-library';
    document.body.appendChild(patternLibrary);
}

/**
 * Mock dependencies for PatternLibrary
 */
function mockDependencies() {
    // Mock Grid
    const grid = {
        rows: 50,
        cols: 50,
        setCellState: (x, y, state) => {}
    };
    
    return { grid };
}

/**
 * Test pattern library functionality
 */
function testPatternLibrary() {
    setupTestDOM();
    const { grid } = mockDependencies();
    
    const patternLibrary = new PatternLibrary();
    
    // Test that thumbnails can be created
    const thumbnail = patternLibrary.createPatternThumbnail('glider');
    console.assert(thumbnail instanceof HTMLCanvasElement, 'Thumbnail should be a canvas element');
    
    // Test pattern library UI creation
    patternLibrary.createPatternLibraryUI({ grid });
    
    // Check if basic structure was created
    const title = document.querySelector('.pattern-library__title');
    console.assert(title, 'Pattern library title should be created');
    console.assert(title.textContent === 'Pattern Library', 'Title should have correct text');
    
    const searchInput = document.querySelector('#pattern-search-input');
    console.assert(searchInput, 'Search input should be created');
    
    const patternGallery = document.querySelector('.pattern-library__gallery');
    console.assert(patternGallery, 'Pattern gallery should be created');
    
    // Check if categories were created
    const categoryElements = document.querySelectorAll('.pattern-library__category');
    console.assert(categoryElements.length === patternLibrary.categoryOrder.length, 
        'All categories should be created');
    
    // Check if patterns were created
    const patternCards = document.querySelectorAll('.pattern-library__card');
    console.assert(patternCards.length > 0, 'Pattern cards should be created');
    
    // Test search functionality
    const firstPatternName = patternCards[0].querySelector('.pattern-library__card-name').textContent;
    
    // Search for a pattern that doesn't exist
    searchInput.value = 'xyznotfound';
    const inputEvent = new Event('input');
    searchInput.dispatchEvent(inputEvent);
    
    // All patterns should be hidden
    const visiblePatternsAfterSearch = Array.from(patternCards)
        .filter(card => card.style.display !== 'none');
    console.assert(visiblePatternsAfterSearch.length === 0, 
        'No patterns should be visible after searching for non-existent pattern');
    
    // Search for a pattern that exists
    searchInput.value = firstPatternName;
    searchInput.dispatchEvent(inputEvent);
    
    // At least one pattern should be visible
    const visiblePatternsAfterValidSearch = Array.from(patternCards)
        .filter(card => card.style.display !== 'none');
    console.assert(visiblePatternsAfterValidSearch.length > 0, 
        'Some patterns should be visible after searching for an existing pattern');
    
    // Click first pattern card
    let placeCenterCalled = false;
    const originalPlacePatternInCenter = patternLibrary.placePatternInCenter;
    patternLibrary.placePatternInCenter = (patternId, targetGrid) => {
        placeCenterCalled = true;
        console.assert(patternId, 'Pattern ID should be passed to placePatternInCenter');
        console.assert(targetGrid === grid, 'Grid should be passed to placePatternInCenter');
    };
    
    patternCards[0].click();
    console.assert(placeCenterCalled, 'placePatternInCenter should be called when pattern is clicked');
    
    // Restore original method
    patternLibrary.placePatternInCenter = originalPlacePatternInCenter;
    
    console.log('All PatternLibrary tests passed!');
}

// Run tests
testPatternLibrary(); 