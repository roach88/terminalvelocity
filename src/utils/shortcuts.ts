// Keyboard shortcuts and advanced terminal features

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export class ShortcutManager {
  private shortcuts: Shortcut[] = [];
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.setupDefaultShortcuts();
    this.setupDefaultAliases();
  }

  private setupDefaultShortcuts() {
    this.shortcuts = [
      {
        key: 'l',
        ctrl: true,
        action: () => this.clearTerminal(),
        description: 'Clear terminal'
      },
      {
        key: 'k',
        ctrl: true,
        action: () => this.clearHistory(),
        description: 'Clear command history'
      },
      {
        key: 'r',
        ctrl: true,
        action: () => this.searchHistory(),
        description: 'Search command history'
      },
      {
        key: 'h',
        alt: true,
        action: () => this.showHelp(),
        description: 'Show help'
      },
      {
        key: 'f',
        ctrl: true,
        action: () => this.focusSearch(),
        description: 'Focus search'
      },
      {
        key: 't',
        ctrl: true,
        action: () => this.toggleTheme(),
        description: 'Toggle theme'
      }
    ];
  }

  private setupDefaultAliases() {
    this.aliases.set('ll', 'projects');
    this.aliases.set('ls', 'projects');
    this.aliases.set('cat', 'read');
    this.aliases.set('grep', 'search');
    this.aliases.set('find', 'search');
    this.aliases.set('info', 'about');
    this.aliases.set('list', 'blog list');
    this.aliases.set('posts', 'blog');
    this.aliases.set('work', 'projects');
    this.aliases.set('portfolio', 'featured');
    this.aliases.set('skills', 'stats');
    this.aliases.set('resume', 'contact');
    this.aliases.set('cv', 'contact');
    this.aliases.set('ping', 'hostname');
    this.aliases.set('pwd', 'hostname');
    this.aliases.set('whoami', 'about');
    this.aliases.set('man', 'help');
    this.aliases.set('?', 'help');
  }

  addShortcut(shortcut: Shortcut) {
    this.shortcuts.push(shortcut);
  }

  addAlias(alias: string, command: string) {
    this.aliases.set(alias, command);
  }

  getAlias(command: string): string {
    return this.aliases.get(command) || command;
  }

  getAllAliases(): Array<[string, string]> {
    return Array.from(this.aliases.entries());
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    for (const shortcut of this.shortcuts) {
      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrl &&
        !!event.altKey === !!shortcut.alt &&
        !!event.shiftKey === !!shortcut.shift
      ) {
        event.preventDefault();
        shortcut.action();
        return true;
      }
    }
    return false;
  }

  getShortcutsList(): Shortcut[] {
    return this.shortcuts;
  }

  private clearTerminal() {
    const event = new CustomEvent('terminal:clear');
    document.dispatchEvent(event);
  }

  private clearHistory() {
    const event = new CustomEvent('terminal:clear-history');
    document.dispatchEvent(event);
  }

  private searchHistory() {
    const event = new CustomEvent('terminal:search-history');
    document.dispatchEvent(event);
  }

  private showHelp() {
    const event = new CustomEvent('terminal:command', { detail: 'help' });
    document.dispatchEvent(event);
  }

  private focusSearch() {
    const input = document.getElementById('command-input') as HTMLInputElement;
    if (input) {
      input.value = 'search ';
      input.focus();
      input.setSelectionRange(7, 7);
    }
  }

  private toggleTheme() {
    const event = new CustomEvent('terminal:toggle-theme');
    document.dispatchEvent(event);
  }
}

// Command suggestions based on context
export class CommandSuggestions {
  static getContextualSuggestions(input: string, availableCommands: string[]): string[] {
    const inputLower = input.toLowerCase();
    
    // If input is empty, suggest popular commands
    if (!inputLower) {
      return ['help', 'about', 'projects', 'blog', 'search'];
    }

    // Context-based suggestions
    const suggestions = [];

    // For partial commands
    for (const cmd of availableCommands) {
      if (cmd.toLowerCase().startsWith(inputLower)) {
        suggestions.push(cmd);
      }
    }

    // For similar commands (fuzzy matching)
    if (suggestions.length === 0) {
      for (const cmd of availableCommands) {
        if (this.isEditDistanceClose(inputLower, cmd.toLowerCase())) {
          suggestions.push(cmd);
        }
      }
    }

    return suggestions.slice(0, 5);
  }

  private static isEditDistanceClose(a: string, b: string, threshold: number = 2): boolean {
    if (Math.abs(a.length - b.length) > threshold) return false;
    
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    return matrix[a.length][b.length] <= threshold;
  }
}