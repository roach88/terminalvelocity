# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn install` - Install dependencies
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn check` - Run TypeScript/Svelte checks

## Architecture Overview

This is a web-based terminal emulator built with Svelte that simulates a command-line interface in the browser.

### Core Architecture

The app follows a component-based architecture with reactive stores:

- **App.svelte**: Main container that renders the terminal interface with History, Ps1, and Input components
- **Stores**: Reactive state management using Svelte stores
  - `history.ts`: Manages command history with localStorage persistence
  - `theme.ts`: Manages theme state with localStorage persistence, defaults to GruvboxDark
- **Command System**: Centralized command registry in `utils/commands.ts` with async support
- **Theme System**: Dynamic theming using JSON configuration with 200+ available themes

### Key Components

- **Input.svelte**: Handles command input with features like tab completion, arrow key history navigation, and Ctrl+L to clear
- **History.svelte**: Displays command history and outputs
- **Ps1.svelte**: Shows the terminal prompt

### Command Registration

Commands are registered in `src/utils/commands.ts` as an object where keys are command names and values are functions that return strings or Promises. The system supports:
- Synchronous commands (return string)
- Asynchronous commands (return Promise<string>)
- Command arguments passed as string array
- Built-in commands: help, theme, clear, weather, curl, etc.

### Theme System

Themes are defined in `themes.json` with full terminal color schemes. The theme store automatically persists selections to localStorage. Users can list themes with `theme ls` and set themes with `theme set <theme-name>`.

### State Persistence

Both command history and theme selection persist across browser sessions using localStorage through Svelte store subscriptions.