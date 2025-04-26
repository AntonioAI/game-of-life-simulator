# UI Component Templates

This directory contains template generators for UI components in the Game of Life Simulator.

## Purpose

These templates are responsible for generating the HTML markup structure for various UI components displayed in the application, such as:

- Control panels
- Pattern libraries
- Analytics displays
- Configuration forms

## When to Add Files Here

Add files to this directory when:
- You need to create reusable HTML structure generators for UI components
- The templates primarily focus on generating DOM elements and UI structure
- The template is specifically for visual UI components that users interact with

## Examples

- `ControlsTemplate.js` - Generates the HTML structure for simulation control buttons
- `PatternLibraryTemplate.js` - Creates the pattern selection interface
- `AnalyticsTemplate.js` - Builds the analytics panel structure

## Relationship to Utils Templates

Unlike the `utils/templateHelpers` directory which contains utility functions for template generation, these templates are specific to UI components and focus on generating DOM structures rather than providing helper functions. 