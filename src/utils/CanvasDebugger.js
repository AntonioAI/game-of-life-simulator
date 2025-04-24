/**
 * Game of Life Simulator - Canvas Debugger
 * Utility functions to help diagnose canvas rendering issues
 * Copyright (c) 2025 Antonio Innocente
 */

const CanvasDebugger = {
    /**
     * Check if the canvas is properly set up
     * @param {HTMLCanvasElement} canvas - The canvas element to check
     * @returns {boolean} Whether the canvas is properly set up
     */
    checkCanvas(canvas) {
        if (!canvas) {
            console.error('Canvas element not found');
            return false;
        }
        
        console.log('Canvas dimensions:', {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
            style: {
                width: canvas.style.width,
                height: canvas.style.height
            }
        });
        
        // Check if canvas has dimensions
        if (canvas.width === 0 || canvas.height === 0) {
            console.error('Canvas has zero dimensions');
            return false;
        }
        
        // Check if canvas is visible
        const rect = canvas.getBoundingClientRect();
        console.log('Canvas position:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });
        
        if (rect.width === 0 || rect.height === 0) {
            console.error('Canvas has zero rendered dimensions');
            return false;
        }
        
        return true;
    },
    
    /**
     * Test drawing to the canvas
     * @param {HTMLCanvasElement} canvas - The canvas element to draw to
     */
    testDraw(canvas) {
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context from canvas');
            return;
        }
        
        // Save current state
        ctx.save();
        
        // Draw a test pattern
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 50, 50);
        
        ctx.fillStyle = 'green';
        ctx.fillRect(50, 0, 50, 50);
        
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 50, 50, 50);
        
        ctx.fillStyle = 'yellow';
        ctx.fillRect(50, 50, 50, 50);
        
        console.log('Test pattern drawn to canvas');
        
        // Restore previous state
        ctx.restore();
    },
    
    /**
     * Check the renderer and grid configuration
     * @param {Object} renderer - The renderer instance
     * @param {Object} grid - The grid instance
     */
    checkRenderer(renderer, grid) {
        if (!renderer) {
            console.error('Renderer not found');
            return;
        }
        
        if (!grid) {
            console.error('Grid not found');
            return;
        }
        
        console.log('Renderer settings:', renderer.settings);
        console.log('Grid dimensions:', {
            rows: grid.rows,
            cols: grid.cols,
            cellCount: grid.rows * grid.cols,
            aliveCells: grid.getAliveCellsCount()
        });
        
        // Check if grid has data
        if (!grid.grid || !Array.isArray(grid.grid) || grid.grid.length === 0) {
            console.error('Grid data is empty or invalid');
            return;
        }
        
        console.log('Grid data sample (top-left 5x5):');
        for (let y = 0; y < Math.min(5, grid.rows); y++) {
            console.log(grid.grid[y].slice(0, Math.min(5, grid.cols)));
        }
    },
    
    /**
     * Force a redraw of the grid
     * @param {Object} renderer - The renderer instance
     * @param {Object} grid - The grid instance
     */
    forceRedraw(renderer, grid) {
        if (!renderer || !grid) {
            console.error('Renderer or grid not found');
            return;
        }
        
        console.log('Forcing redraw...');
        
        // Make sure the cell size is calculated
        renderer.settings.cellSize = renderer.calculateCellSize(grid.rows, grid.cols);
        console.log('Cell size calculated:', renderer.settings.cellSize);
        
        // Force resize
        renderer.resizeCanvas(grid);
        
        // Force redraw
        renderer.drawGrid(grid);
        
        console.log('Redraw complete');
    }
};

export default CanvasDebugger; 