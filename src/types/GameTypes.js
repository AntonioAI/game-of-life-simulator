/**
 * Game of Life Simulator - Game Type Definitions
 * @fileoverview Type definitions for the Game module
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Game manager dependencies
 * @typedef {Object} GameManagerDependencies
 * @property {import('../core/Grid').default} [grid] - Grid instance
 * @property {import('../rendering/Renderer').default} [renderer] - Renderer instance
 * @property {import('../ui/UIManager').default} [uiManager] - UI Manager instance
 */

/**
 * UI manager dependencies
 * @typedef {Object} UIManagerDependencies
 * @property {import('../core/GameManager').default} [gameManager] - Game Manager instance
 * @property {import('../ui/Controls').default} [controls] - Controls instance
 */

/**
 * Analytics data
 * @typedef {Object} AnalyticsData
 * @property {number} generation - Current generation count
 * @property {number} aliveCells - Number of alive cells
 * @property {number} totalCells - Total number of cells in the grid
 * @property {number} alivePercentage - Percentage of alive cells
 */

export {}; 