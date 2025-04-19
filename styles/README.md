# Game of Life CSS Architecture

This document describes the CSS architecture for the Game of Life simulator.

## Directory Structure

```
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
  main.css               // Single import file that includes all CSS modules
```

## Import Order

The import order in main.css is crucial and follows a specific pattern:

1. **Core styles** are loaded first to establish the foundation:
   - variables.css: Defines global CSS custom properties
   - reset.css: Normalizes browser styles and sets defaults
   - typography.css: Handles text-related styling

2. **Layout styles** establish the structural foundation:
   - grid.css: Defines the overall page layout grid

3. **Component styles** handle specific UI elements:
   - canvas.css: Styles for the game canvas
   - controls.css: Styles for the control panel and buttons
   - analytics.css: Styles for the analytics panel
   - patterns.css: Styles for the pattern library

4. **Utility styles** provide helpers:
   - animations.css: Defines animations and transitions
   - helpers.css: Contains utility classes

5. **Responsive styles** are loaded last to override previous styles:
   - responsive.css: Contains media queries for different screen sizes

## Notes for Developers

- Avoid inline styles; use the modular CSS architecture instead
- Add new component styles in their own file in the components directory
- Use the BEM (Block Element Modifier) naming convention for classes
- Reference variables from variables.css instead of hardcoding values 