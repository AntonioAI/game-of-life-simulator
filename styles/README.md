# Game of Life CSS Architecture

This document outlines the CSS organization and methodology used in the Game of Life Simulator project.

## Organization

The CSS is organized using a modular approach with the following directory structure:

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

## BEM Naming Convention

The project uses the BEM (Block, Element, Modifier) methodology for naming CSS classes:

- **Block**: The main component or standalone entity (e.g., `.game-canvas`, `.control-panel`)
- **Element**: A part of a block with no standalone meaning (e.g., `.game-canvas__container`, `.control-panel__button`)
- **Modifier**: A flag on a block or element to change appearance or behavior (e.g., `.game-canvas--active`, `.control-panel__button--disabled`)

Example:
```css
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

## Import Order

The order of CSS imports in `main.css` is carefully designed to ensure proper cascade and specificity:

1. **Core Styles** (variables, reset, typography) - These establish the foundation
2. **Layout Styles** (grid) - These define the structure
3. **Component Styles** (canvas, controls, analytics, patterns) - These style specific UI elements
4. **Utility Styles** (animations, helpers) - These provide global utility classes
5. **Responsive Styles** (responsive) - These override previous styles based on screen size

This order ensures that more specific styles override general ones and responsive adjustments come last.

## Utility Classes

The project includes utility classes in `helpers.css` that follow a prefixed naming convention:

- `.u-hidden` - Hide an element
- `.u-margin-top-md` - Add medium top margin
- `.u-flex-center` - Center using flexbox
- `.u-panel` - Apply standard panel styling

Using utility classes helps reduce redundancy and maintain consistent styling across components.

## Best Practices

The CSS architecture follows these best practices:

1. **Single Responsibility** - Each CSS file handles a specific component or concern
2. **Low Specificity** - Using BEM reduces the need for deep nesting and IDs
3. **Reusable Components** - Common patterns like panels are abstracted into utility classes
4. **Responsive Design** - Media queries are organized by component for maintainability
5. **Performance** - Optimized by removing redundancies and using shorthand properties

## Contributing

When adding new styles to the project:

1. Determine the appropriate file for your styles based on component or concern
2. Follow the BEM naming convention
3. Use existing variables from `variables.css` for consistency
4. Add any necessary responsive styles to `responsive.css`
5. Update this documentation if adding new patterns or utilities 