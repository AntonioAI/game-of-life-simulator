/**
 * Game of Life Simulator - Initialization Module
 * Responsible for initializing all browser-related functionality
 * Copyright (c) 2025 Antonio Innocente
 */

import { initBrowserHandlers } from './ui/BrowserHandlers.js';
import { initTouchHandlers } from './utils/TouchHandler.js';
import Modal from './ui/components/Modal.js';

// Initialize all browser-related functionality immediately
document.addEventListener('DOMContentLoaded', () => {
    initBrowserHandlers();
    initTouchHandlers();
    Modal.initialize();
}); 