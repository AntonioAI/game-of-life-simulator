# Game of Life Simulator - Style Guide

This style guide documents the design system, available utility classes, and component variants used throughout the Game of Life Simulator project.

## Color Palette

Our color system is based on CSS variables defined in `core/variables.css`.

### Primary Colors

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `--primary-color` | #1a73e8 | Main brand color | Buttons, links, active states |
| `--primary-hover` | #1557b0 | Hover state for primary | Button hover effects |
| `--secondary-color` | #3c4043 | Secondary accent color | Section titles, icons |
| `--background-color` | #f0f4f8 | Page background | Main app background |
| `--panel-background` | #ffffff | Panel backgrounds | Control panels, cards |

### Text Colors

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `--text-primary` | #202124 | Primary text color | Main content text |
| `--text-secondary` | #5f6368 | Secondary text color | Labels, captions |
| `--text-light` | #ffffff | Light text color | Text on dark backgrounds |

### Borders and Shadows

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `--border-color` | #dadce0 | Standard border color | Panel borders, separators |
| `--shadow-sm` | 0 1px 2px rgba(0, 0, 0, 0.05) | Small shadow | Buttons |
| `--shadow-md` | 0 2px 4px rgba(0, 0, 0, 0.1) | Medium shadow | Panels, cards |
| `--shadow-lg` | 0 4px 6px rgba(0, 0, 0, 0.1) | Large shadow | Modals, popovers |

### Spacing

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `--spacing-xs` | 0.25rem | Extra small spacing | Tight spacing between related elements |
| `--spacing-sm` | 0.5rem | Small spacing | Default spacing between elements |
| `--spacing-md` | 1rem | Medium spacing | Section padding |
| `--spacing-lg` | 1.5rem | Large spacing | Panel padding, section margins |

### Border Radius

| Variable | Value | Description | Example |
|----------|-------|-------------|---------|
| `--radius-sm` | 4px | Small radius | Buttons, inputs |
| `--radius-md` | 8px | Medium radius | Panels, cards |
| `--radius-lg` | 12px | Large radius | Modal windows |

## Utility Classes

The project includes utility classes in `utilities/helpers.css` to maintain consistent styling across components.

### Visibility Utilities

| Class | Description |
|-------|-------------|
| `.u-hidden` | Hide an element (display: none) |
| `.u-invisible` | Hide an element while preserving its space (visibility: hidden) |
| `.u-visible` | Make an element visible |
| `.u-sr-only` | Hide an element visually but keep it accessible to screen readers |

### Spacing Utilities

| Class | Description |
|-------|-------------|
| `.u-margin-top-xs` | Add extra small top margin (0.25rem) |
| `.u-margin-top-sm` | Add small top margin (0.5rem) |
| `.u-margin-top-md` | Add medium top margin (1rem) |
| `.u-margin-top-lg` | Add large top margin (1.5rem) |
| `.u-margin-bottom-xs` | Add extra small bottom margin (0.25rem) |
| `.u-margin-bottom-sm` | Add small bottom margin (0.5rem) |
| `.u-margin-bottom-md` | Add medium bottom margin (1rem) |
| `.u-margin-bottom-lg` | Add large bottom margin (1.5rem) |

### Flex Utilities

| Class | Description |
|-------|-------------|
| `.u-flex` | Set display to flex |
| `.u-flex-column` | Set display to flex with column direction |
| `.u-flex-center` | Center content both horizontally and vertically |

### Text Utilities

| Class | Description |
|-------|-------------|
| `.u-text-center` | Center-align text |
| `.u-text-left` | Left-align text |
| `.u-text-right` | Right-align text |

### Mobile Device Utilities

| Class | Description |
|-------|-------------|
| `.u-mobile-touch-target` | Apply minimum touch target size (44px) for mobile devices |

### Panel Utilities

| Class | Description |
|-------|-------------|
| `.u-panel` | Apply standard panel styling (background, border, shadow, padding) |
| `.u-panel-title` | Style for panel titles |
| `.u-panel-section` | Style for sections within panels |
| `.u-panel-section-title` | Style for section titles within panels |

## Component Examples

### Standard Button Variants

```html
<!-- Primary button -->
<button class="control-panel__button">Start</button>

<!-- Secondary button -->
<button class="control-panel__button control-panel__button--secondary">Reset</button>
```

### Panel Structure

```html
<div class="u-panel">
  <h2 class="u-panel-title">Panel Title</h2>
  <div class="u-panel-section">
    <h3 class="u-panel-section-title">Section Title</h3>
    <div class="u-panel-section-content">
      <!-- Content goes here -->
    </div>
  </div>
</div>
```

## Responsive Design

The project follows a mobile-first approach with breakpoints defined in `layout/responsive.css`:

- **Small devices**: Up to 767px
- **Medium devices**: 768px to 1023px
- **Large devices**: 1024px and up

## Adding New Components

When adding new components:

1. Create a new CSS file in the appropriate directory if needed
2. Follow the BEM naming convention
3. Use existing CSS variables for consistency
4. Add responsive styles in `layout/responsive.css`
5. Document any new utility classes or variables in this style guide 