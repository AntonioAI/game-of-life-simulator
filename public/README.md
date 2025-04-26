# Game of Life Simulator - Public Directory

This directory contains all the public-facing files for the Game of Life Simulator application.

## Directory Structure

- `index.html` - Main application entry point
- `test/` - Testing-related HTML files
  - `tests.html` - General test runner page
  - `error-handling-test.html` - Error handling system tests

## GitHub Pages Configuration

This directory is configured as the publishing source for GitHub Pages. All paths in HTML files are relative to ensure proper loading when deployed.

## Local Development

The files in this directory use **root-relative paths** (paths that start with `/`) for JavaScript and CSS imports. This means you **must use a local development server** to properly run the application locally.

### Using a local server (Required)

1. **Using Node.js http-server (recommended)**:
   ```
   npm install -g http-server
   cd /path/to/game-of-life-simulator
   http-server
   ```
   Then access: `http://localhost:8080/public/index.html`

2. **Using VSCode Live Server extension**:
   - Install the "Live Server" extension
   - Right-click on `index.html` file in the project root
   - Select "Open with Live Server"
   - Navigate to `/public/index.html` in the browser

3. **Using Python's built-in server**:
   ```
   cd /path/to/game-of-life-simulator
   python -m http.server
   ```
   Then access: `http://localhost:8000/public/index.html`

## Development vs Production

When developing locally, you can access the application directly through the files in this directory. For production, GitHub Pages will serve these files from the `/public` directory on the main branch.

## Note on Paths

All resource paths in HTML files use root-relative paths:

- JavaScript modules: `/src/...`
- CSS stylesheets: `/styles/...`

This ensures that resources load correctly on both local development servers and GitHub Pages (when configured to serve from the `/public` directory). 