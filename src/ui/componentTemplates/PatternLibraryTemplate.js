/**
 * Game of Life Simulator - Pattern Library Template Module
 * Responsible for generating HTML for pattern library components
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Generate HTML for pattern library container
 * @returns {string} HTML string for pattern library container
 */
export function createPatternLibraryContainerTemplate() {
    return `
        <h2 class="pattern-library__title">Pattern Library</h2>
        <div class="pattern-library__search">
            <input type="text" placeholder="Search patterns..." class="pattern-library__search-input" id="pattern-search-input">
        </div>
        <div class="pattern-library__gallery"></div>
    `;
}

/**
 * Generate HTML for a pattern category
 * @param {Object} category - Category information
 * @param {string} category.name - Category name
 * @param {string} category.description - Category description
 * @returns {string} HTML string for pattern category
 */
export function createPatternCategoryTemplate(category) {
    return `
        <div class="pattern-library__category" data-category="${category.name}">
            <h3>${category.name}</h3>
            ${category.description ? `<div class="pattern-library__category-description">${category.description}</div>` : ''}
            <div class="pattern-library__grid"></div>
        </div>
    `;
}

/**
 * Generate HTML for a pattern card
 * @param {Object} pattern - Pattern information
 * @param {string} pattern.id - Pattern ID
 * @param {string} pattern.name - Pattern name
 * @param {string} pattern.description - Pattern description
 * @returns {string} HTML string for pattern card
 */
export function createPatternCardTemplate(pattern) {
    return `
        <div class="pattern-library__card" title="${pattern.description}" data-pattern-id="${pattern.id}">
            <div class="pattern-thumbnail-container"></div>
            <div class="pattern-library__card-name" title="${pattern.description}">${pattern.name}</div>
        </div>
    `;
} 