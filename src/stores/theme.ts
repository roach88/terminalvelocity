import { writable } from 'svelte/store';
import type { Theme } from '../interfaces/theme';

// Permanent color scheme
const permanentTheme: Theme = {
  name: "Terminal",
  background: "#201e1d",
  foreground: "#ebdbb2",
  cursorColor: "#ebdbb2",
  
  // Standard colors
  black: "#282828",
  red: "#c96342",
  green: "#bfbebb",
  yellow: "#faf9f5",
  blue: "#458588",
  purple: "#b16286",
  cyan: "#689d6a",
  white: "#a89984",
  
  // Bright colors
  brightBlack: "#928374",
  brightRed: "#c96342",
  brightGreen: "#bfbebb",
  brightYellow: "#faf9f5",
  brightBlue: "#83a598",
  brightPurple: "#d3869b",
  brightCyan: "#8ec07c",
  brightWhite: "#ebdbb2"
};

// Export a read-only theme
export const theme = writable<Theme>(permanentTheme);