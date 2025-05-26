# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn install` - Install dependencies
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn check` - Run TypeScript/Svelte checks

## Architecture Overview

This is a web-based terminal emulator built with Svelte that features a split-screen interface with a command terminal on the left and content display on the right.

### Core Architecture

The app follows a component-based architecture with reactive stores:

- **App.svelte**: Main container with split-screen layout (terminal left, content right)
- **Stores**: Reactive state management using Svelte stores
  - `history.ts`: Manages command history (commands only, no outputs)
  - `theme.ts`: Permanent color scheme configuration
  - `content.ts`: Manages right panel content display
- **Command System**: Centralized command registry in `utils/commands.ts` with async support
- **Split-Screen Layout**: Terminal commands on left, content/output on right

### Key Components

- **Input.svelte**: Handles command input with tab completion, history navigation, and command execution
- **History.svelte**: Displays command history in the terminal (commands only)
- **Ps1.svelte**: Shows the terminal prompt (guest@hostname:~$)
- **Content Panel**: Right side displays command outputs in formatted HTML

### Color Scheme

The app uses a permanent custom color scheme:

- Background: `#201e1d` (dark)
- Foreground: `#ebdbb2` (light cream)
- ASCII Banner: `#c96342` (coral/salmon)
- Borders/Accents: `#bfbebb` (muted gray-green)
- Highlights: `#faf9f5` (light cream)

### Command Registration

Commands are registered in `src/utils/commands.ts` as an object where keys are command names and values are functions that return strings or Promises. The system supports:

- Synchronous commands (return string/HTML)
- Asynchronous commands (return Promise<string>)
- Command arguments passed as string array
- Built-in commands: help, clear, weather, about, blog, projects, etc.
- Commands output to the right panel, not the terminal

### Custom Weather Display

The weather command uses the wttr.in JSON API to fetch data and creates a custom HTML display with:

- Current conditions with temperature, wind, humidity
- 3-day forecast with high/low temps and rain chance
- ASCII art weather icons
- Fully controlled layout without Unicode alignment issues

### Layout & Responsiveness

- **Desktop**: Side-by-side split screen (50/50)
- **Mobile**: Stacked layout (terminal on top, content below)
- **No horizontal scrollbars**: Content automatically fits within containers
- **Gap between panels**: Clean visual separation

### State Management

- Command history persists to localStorage (commands only)
- Content panel updates with each command execution
- No theme switching - uses permanent color scheme

## TODO List

### Immediate Priority - Beehiiv Integration

- [ ] Set up Beehiiv API integration
- [ ] Create `blog` command to list all newsletter posts
- [ ] Update `read` command to fetch and display individual posts from Beehiiv
- [ ] Add pagination support for blog list
- [ ] Create blog post search functionality
- [ ] Add newsletter signup command that subscribes to Beehiiv
- [ ] Cache Beehiiv API responses for performance

### High Priority

- [ ] Add more commands (skills, experience, education, etc.)
- [ ] Implement contact form command that sends emails
- [ ] Add command to download resume/CV as PDF
- [ ] Create animated typing effect for command outputs
- [ ] Add sound effects for terminal interactions (optional setting)

### Medium Priority

- [ ] Implement command search/filter in history
- [ ] Add keyboard shortcuts panel/help
- [ ] Create mini-games as terminal commands (snake, tetris, etc.)
- [ ] Add social media links command
- [ ] Implement `cd` navigation for blog/project categories
- [ ] Add syntax highlighting for code blocks in content

### Low Priority

- [ ] Add command aliases/custom shortcuts
- [ ] Implement terminal multiplexer (multiple panels)
- [ ] Add export history feature
- [ ] Create ASCII art generator command
- [ ] Add matrix/hacker typing effect easter egg
- [ ] Implement autocomplete for blog/project titles

### Future Enhancements

- [ ] Real-time collaboration features
- [ ] WebSocket integration for live updates
- [ ] Terminal sharing via URL
- [ ] Command macros/scripts
- [ ] Plugin system for custom commands
- [ ] PWA support for offline usage

### Bug Fixes & Improvements

- [ ] Optimize mobile keyboard handling
- [ ] Improve command parsing for edge cases
- [ ] Add loading states for async commands
- [ ] Better error handling and user feedback
- [ ] Performance optimization for large histories
- [ ] Accessibility improvements (screen reader support)
