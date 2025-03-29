# Game of Life Simulator - Architecture

## Project Structure

```
game-of-life/
├── memory-bank/         # Documentation and planning
├── src/                 # Source files
│   ├── index.html       # Main HTML structure
│   ├── styles.css       # CSS styling
│   └── script.js        # JavaScript code
└── README.md            # Project overview
```

## Files and Components

### HTML (src/index.html)
The main HTML file serves as the entry point for the application. It defines:
- Document metadata (charset, viewport, description)
- Basic page structure with header, main content area, and footer
- Canvas element (800x600 pixels) for the Game of Life grid
- Containers for:
  - Simulation controls
  - Grid settings
  - Analytics display
- Links to the CSS and JavaScript files

### CSS (src/styles.css)
This file contains all styles for the application, focusing on:
- Responsive layout using flexbox and media queries
- Canvas styling and positioning
- UI controls appearance with hover and active states
- Typography and visual hierarchy
- Mobile-first design with breakpoints at 480px and 768px

### JavaScript (src/script.js)
This contains the core functionality of the simulator:
- Canvas initialization and grid rendering
- Cell toggling functionality via mouse and touch events
- Game of Life simulation logic
- Simulation controls (start, pause, step, reset)
- Grid settings panel with presets and custom sizing
- Analytics calculations and display
- Boundary type toggling (toroidal vs. finite)
- Test pattern generation (glider)

## Core Components

### Grid System
- 2D array representation of cell states (0 = dead, 1 = alive)
- Configurable grid size via UI (presets: 50×50, 75×75, 100×100)
- Custom grid sizing option (10-200 cells in each dimension)
- Responsive cell size calculation based on canvas dimensions
- Centered grid rendering with proper scaling

### Simulation Rules
- Implementation of Conway's Game of Life classic rules:
  1. Any live cell with fewer than two live neighbors dies (underpopulation)
  2. Any live cell with two or three live neighbors lives on (survival)
  3. Any live cell with more than three live neighbors dies (overcrowding)
  4. Any dead cell with exactly three live neighbors becomes alive (reproduction)
- Two boundary types:
  - Toroidal (edges wrap around)
  - Finite (edges are fixed boundaries)

### Rendering Engine
- HTML5 Canvas-based rendering
- Efficient drawing logic for grid cells
- Performance-optimized animation using requestAnimationFrame
- Adjustable simulation speed (1-60 FPS)

### User Interface
- Simulation controls (Start, Pause, Step, Reset buttons)
- Grid settings panel (presets and custom sizing)
- Speed adjustment slider
- Analytics display (generation count, live cell count, population density)
- Test pattern generation (glider)
- Boundary type toggle

## Design Principles

1. **Separation of Concerns**
   - HTML for structure
   - CSS for presentation
   - JavaScript for behavior and simulation logic

2. **Responsive Design**
   - Mobile-first approach
   - Flexible layouts that adapt to different screen sizes
   - Touch events support for mobile devices

3. **Performance Optimization**
   - Efficient canvas rendering
   - Optimized simulation algorithms
   - requestAnimationFrame for smooth animation

4. **Modularity**
   - Clear separation between UI elements
   - Organized code structure for future extensions
   - Event-driven architecture for UI interactions
