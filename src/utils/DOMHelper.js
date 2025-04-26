/**
 * Game of Life Simulator - DOM Helper Module
 * Utilities for working with the DOM
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Create an element with the specified attributes and properties
 * @param {string} tag - The tag name of the element to create
 * @param {Object} attributes - Key-value pairs of attributes to set
 * @param {Object} properties - Key-value pairs of properties to set
 * @param {Array|Element} children - Child elements to append
 * @returns {Element} The created element
 */
export function createElement(tag, attributes = {}, properties = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    // Set properties
    Object.entries(properties).forEach(([key, value]) => {
        element[key] = value;
    });
    
    // Append children
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (child) {
                element.appendChild(child);
            }
        });
    } else if (children) {
        element.appendChild(children);
    }
    
    return element;
}

/**
 * Create an element from an HTML string (UNSAFE for user-controlled content)
 * @param {string} html - HTML string to convert to an element
 * @returns {Element} The created element
 */
export function createElementFromHTML(html) {
    // SAFETY: Only use this function with trusted HTML templates, never with user input
    const template = document.createElement('template');
    // Use textContent for setting text content to prevent XSS
    // Only use innerHTML with trusted static HTML templates
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Create multiple elements from an HTML string (UNSAFE for user-controlled content)
 * @param {string} html - HTML string to convert to elements
 * @returns {DocumentFragment} Document fragment containing the elements
 */
export function createElementsFromHTML(html) {
    // SAFETY: Only use this function with trusted HTML templates, never with user input
    const template = document.createElement('template');
    // Use textContent for setting text content to prevent XSS
    // Only use innerHTML with trusted static HTML templates
    template.innerHTML = html.trim();
    return template.content;
}

/**
 * Set text content safely
 * @param {Element} element - The DOM element to update
 * @param {string} text - The text content to set
 */
export function setTextContent(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Clear the content of an element safely
 * @param {Element} element - The DOM element to clear
 */
export function clearElement(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
} 