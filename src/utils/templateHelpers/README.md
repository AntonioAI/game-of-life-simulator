# Template Helper Utilities

This directory contains utility functions for template generation and manipulation in the Game of Life Simulator.

## Purpose

These template helpers provide reusable functions for generating and processing templates across the application. Unlike UI component templates, these are lower-level utilities focused on:

- Template string processing
- Generic template generation logic
- Error message formatting
- Reusable template utility functions

## When to Add Files Here

Add files to this directory when:
- You need utility functions for template generation
- The code provides helper functions that can be used across multiple templates
- The template utilities are not tied to specific UI components
- You need to create utilities for error messages or system notifications

## Examples

- `ErrorTemplate.js` - Utilities for generating error message templates
- Template string interpolation helpers
- Dynamic content generation utilities

## Relationship to UI Component Templates

Unlike the `ui/componentTemplates` directory which contains specific UI component structures, these template helpers are focused on providing utility functions that assist in template generation rather than being complete UI component templates themselves. 