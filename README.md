# Game of Life Simulator

An interactive web-based implementation of Conway's Game of Life built with HTML5 Canvas and JavaScript. Experience the fascinating world of cellular automata through this modern, responsive simulator.

![Game of Life Simulator](screenshot.png)

## Features

- **Interactive Grid**: Click or tap to toggle cells between alive and dead states
- **Simulation Controls**:
  - Start/Pause simulation
  - Step through generations manually
  - Reset grid to initial state
  - Adjustable simulation speed (1-60 FPS)
- **Pattern Library**:
  - Still Life patterns (Block, Beehive, Boat, Loaf)
  - Oscillators (Blinker, Toad, Pulsar)
  - Spaceships (Glider, Lightweight Spaceship)
  - Growth patterns (R-Pentomino, Gosper Glider Gun)
- **Grid Settings**:
  - Adjustable grid size (preset: 50×50, 75×75, 100×100)
  - Custom grid dimensions support
  - Toroidal or finite boundary options
- **Real-time Analytics**:
  - Generation counter
  - Live cell count
  - Population density
  - Current grid size
  - Simulation speed
  - Boundary type
- **Responsive Design**:
  - Works on desktop and mobile devices
  - Touch-friendly interface
  - High-DPI display support

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/AntonioAI/game-of-life-simulator.git
   cd game-of-life-simulator
   ```

2. Run a local web server to serve the files:

   Since this application uses ES modules (`import`/`export`), you'll need to serve the files through a web server due to browser security restrictions when loading modules from `file://` URLs.

   You can use one of these methods:

   **Option 1: Using Python (if installed):**
   ```bash
   # For Python 3.x
   python -m http.server

   # For Python 2.x
   python -m SimpleHTTPServer
   ```
   Then open http://localhost:8000 in your browser.

   **Option 2: Using Node.js (if installed):**
   ```bash
   # Install a simple HTTP server globally (if not already installed)
   npm install -g http-server

   # Run the server
   http-server
   ```
   Then open http://localhost:8080 in your browser.

   **Option 3: Using Visual Studio Code:**
   If you're using VS Code, install the "Live Server" extension, then right-click on index.html and select "Open with Live Server".

   **Option 4: Using any modern web server:**
   You can use any web server that can serve static files (Apache, Nginx, etc.)

The grid will be pre-populated with the R-Pentomino pattern, ready to demonstrate the fascinating evolution of Conway's Game of Life.

## Usage

1. **Grid Interaction**:
   - Click/tap any cell to toggle it between alive (filled) and dead (empty)
   - Use the Pattern Library to place pre-defined patterns

2. **Controls**:
   - ▶ (Play): Start the simulation
   - ⏸ (Pause): Pause the simulation
   - ➡ (Step): Advance one generation
   - ↺ (Reset): Clear the grid
   - Speed slider: Adjust simulation speed from 1 to 60 FPS

3. **Grid Settings**:
   - Choose from preset grid sizes (50×50, 75×75, 100×100)
   - Enter custom dimensions (10-200 cells per side)
   - Toggle between toroidal (wrapping) and finite boundaries

4. **Pattern Library**:
   - Use the search bar to find specific patterns
   - Click on a pattern thumbnail to place it on the grid
   - Patterns are categorized by type (Still Life, Oscillator, Spaceship, Growth)

## Technical Details

- Built with vanilla JavaScript (ES6 modules) and HTML5 Canvas
- No external dependencies
- Modular architecture with dependency injection
- Optimized for performance with:
  - RequestAnimationFrame for smooth animation
  - Batch rendering operations
  - Efficient grid computation
  - Mobile-specific optimizations

## Project Structure

```
/src
  /core
    GameManager.js       // Orchestration and game loop
    Grid.js              // Grid state and operations
    Rules.js             // Conway's rules implementation
  /rendering
    Renderer.js          // Canvas rendering
  /ui
    UIManager.js         // UI coordination
    Controls.js          // User controls
  /patterns
    PatternLibrary.js    // Pattern definitions and management
  main.js                // Application entry point

/styles
  /core
    variables.css        // CSS custom properties
    reset.css            // Base reset and element defaults
    typography.css       // Text styling and fonts
  /components
    canvas.css           // Game canvas styling
    controls.css         // Controls panel and buttons
    analytics.css        // Analytics panel
    patterns.css         // Pattern library
  /layout
    grid.css             // Page layout structure
    responsive.css       // Media queries
  /utilities
    animations.css       // Animations and transitions
    helpers.css          // Utility classes
  main.css               // Single import file
  STYLE-GUIDE.md         // CSS style guide and documentation
  README.md              // CSS architecture documentation
```

### CSS Architecture

The project uses a modular CSS architecture with the following characteristics:

- **BEM Methodology**: Block, Element, Modifier naming convention for clear, maintainable CSS
- **CSS Variables**: Defined in `variables.css` for consistent colors, spacing, and styling
- **Modular Structure**: Separated by concerns (core, components, layout, utilities)
- **Mobile-First Responsive Design**: Adapts seamlessly to different screen sizes

For more details on the CSS structure and available utility classes, see the [CSS Style Guide](styles/STYLE-GUIDE.md) and [CSS Architecture Documentation](styles/README.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Copyright (c) 2025 Antonio Innocente. All rights reserved.

## Terms of Service

By accessing or using this website, you agree to the following terms:

1. **Copyright and Attribution**: This website and its source code are the property of Antonio Innocente and is protected by copyright law. You may not copy, modify, or distribute the content without prior written permission.
2. **Monetization**: We may display advertisements on the website to support its operation and development.
3. **Permitted Use**: You may use the website for personal and research purposes.
4. **User Data and Privacy**: In the future, we may collect and store user data, such as usernames and game statistics, to facilitate community features. Any data collected will be handled in accordance with our Privacy Policy.
5. **User-Generated Content**: If community features are added, users will retain ownership of any content they create on the website (e.g., custom patterns or challenges), but grant us a license to use, display, and modify that content for the purposes of operating the website.
6. **Disclaimer of Warranties**: The website is provided "as is" without any warranties, express or implied.
7. **Limitation of Liability**: We are not liable for any damages arising from the use of the website.
8. **Modifications**: We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance of the modified terms.