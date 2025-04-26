/**
 * Game of Life Simulator - Grid Type Definitions
 * @fileoverview Type definitions for the Grid module
 * Copyright (c) 2025 Antonio Innocente
 */

/**
 * Grid cell state
 * @typedef {0|1} CellState
 */

/**
 * Grid boundary type
 * @typedef {'toroidal'|'finite'} BoundaryType
 */

/**
 * Grid options
 * @typedef {Object} GridOptions
 * @property {number} [rows=50] - Number of rows
 * @property {number} [cols=50] - Number of columns
 * @property {BoundaryType} [boundaryType='toroidal'] - Grid boundary type
 */

/**
 * Grid dependencies
 * @typedef {Object} GridDependencies
 * @property {import('../core/Rules').default} [rules] - Rules implementation
 */

/**
 * 2D Cell Grid Array
 * @typedef {Array<Array<CellState>>} GridArray
 */

/**
 * Grid Pattern
 * @typedef {Array<Array<CellState>>} Pattern
 */

/**
 * Cell coordinates
 * @typedef {Object} CellCoordinates
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

export {}; 