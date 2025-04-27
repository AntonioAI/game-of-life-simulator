# Game of Life Simulator - UI Panels Documentation

This document explains the different panels in the Game of Life Simulator user interface, with a specific focus on the difference between the **Configuration Panel** and the **Controls Panel**.

## Panel Overview

The Game of Life Simulator interface includes several panels:

1. **Controls Panel** - For real-time simulation control
2. **Configuration Panel** - For persistent user preferences 
3. **Analytics Panel** - Displays simulation statistics
4. **Pattern Library Panel** - Provides pre-built patterns to place on the grid

## Controls Panel vs. Configuration Panel

These two panels serve different purposes but are sometimes confused by users:

### Controls Panel

- **Purpose**: Provides real-time control over the current simulation session
- **Effect**: Changes take effect immediately
- **Persistence**: Changes do not persist between browser sessions
- **Location**: Top section of the sidebar

#### Features:

- **Simulation Controls**:
  - Play/Pause button for starting/stopping simulation
  - Step button for advancing one generation at a time
  - Reset button for clearing the grid
  - Speed slider to control animation frame rate (1-60 FPS)

- **Grid Settings**:
  - Preset grid size buttons (Small/Medium/Large)
  - Custom grid dimensions inputs
  - Apply button to resize the grid immediately
  - Boundary type toggle (Toroidal/Finite)

### Configuration Panel

- **Purpose**: Stores user preferences for the simulator's appearance and default settings
- **Effect**: Changes only take effect after saving or on page reload
- **Persistence**: Settings are saved to localStorage and persist between browser sessions
- **Location**: Bottom section of the sidebar, below the Controls Panel

#### Features:

- **Appearance Settings**:
  - Cell color picker
  - Grid color picker
  - Background color picker

- **Default Preferences**:
  - Default simulation speed slider
  - Default grid size selection
  - Default boundary type (Toroidal/Finite)

- **Configuration Actions**:
  - Save Configuration button to persist settings
  - Reset to Defaults button to clear saved settings

## When to Use Each Panel

- Use the **Controls Panel** when you want to:
  - Control the simulation flow (play/pause/step)
  - Change the grid size for your current session
  - Adjust the simulation speed
  - Change boundary conditions for current use

- Use the **Configuration Panel** when you want to:
  - Customize the visual appearance of the simulation
  - Set your preferred defaults for future sessions
  - Save your preferred configuration for later use

## Technical Implementation

The Controls Panel is implemented in `src/ui/Controls.js` and managed by `src/ui/UIManager.js`. 

The Configuration Panel is implemented in `src/ui/ConfigPanel.js` and manages its own state through the `config/GameConfig.js` module.

Both panels use the EventBus system to communicate with other components in the application. 