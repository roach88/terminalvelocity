<script lang="ts">
  import { afterUpdate, onMount } from 'svelte'
  import { history } from '../stores/history'
  import { theme } from '../stores/theme'
  import { setContent } from '../stores/content'
  import { commands, executeCommand, shortcutManager } from '../utils/commands'
  import { MobileAdapter } from '../utils/mobile'
  import { PerformanceOptimizer } from '../utils/performance'
  import { SEOOptimizer } from '../utils/seo'
  import { track } from '../utils/tracking'

  let command = '';
  let historyIndex = -1;
  let suggestions: string[] = [];
  let showMobileCommands = false;

  let input: HTMLInputElement;

  onMount(() => {
    if (import.meta.env.DEV) {
      localStorage.removeItem('history');
      history.set([]);
    }
    input.focus();

    // Show mobile command suggestions on mobile devices
    showMobileCommands = MobileAdapter.isMobileDevice;
  });

  afterUpdate(() => {
    input.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });

  const debouncedUpdateSuggestions = PerformanceOptimizer.debounce((input: string) => {
    suggestions = PerformanceOptimizer.predictCommand(input, Object.keys(commands));
  }, 150);

  const handleInput = () => {
    debouncedUpdateSuggestions(command);
  };
  
  // Helper function to get a nice title for commands
  const getCommandTitle = (cmd: string): string => {
    const titles: Record<string, string> = {
      about: 'About Me',
      projects: 'Projects',
      blog: 'Blog Posts',
      read: 'Blog Post',
      project: 'Project Details',
      help: 'Available Commands',
      contact: 'Contact Information',
      search: 'Search Results',
      tags: 'Available Tags',
      recent: 'Recent Content',
      featured: 'Featured Content',
      stats: 'Portfolio Statistics',
      version: 'Version Information',
      weather: 'Weather Report',
      whoami: 'User Information',
      hostname: 'System Information',
      date: 'Current Date & Time'
    };
    return titles[cmd] || cmd.charAt(0).toUpperCase() + cmd.slice(1);
  };
  
  // Helper function to format output with better HTML
  const formatCommandOutput = (output: string, cmd: string): string => {
    // If output already contains HTML, return as-is
    if (output.includes('<') && output.includes('>')) {
      return output;
    }
    
    // Weather command now returns HTML, so we don't need special handling
    
    if (cmd === 'curl' || cmd === 'banner') {
      return `<div class="overflow-x-auto"><pre class="whitespace-pre text-xs font-mono">${output}</pre></div>`;
    }
    
    // Convert plain text to formatted HTML with word wrap
    return `<pre class="whitespace-pre-wrap">${output}</pre>`;
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    // Handle global shortcuts first
    if (shortcutManager.handleKeyDown(event)) {
      return;
    }

    if (event.key === 'Enter') {
      if (!command.trim()) return;
      const { commandName, args } = executeCommand(command);

      // Performance measurement for slow commands
      const output = await PerformanceOptimizer.measurePerformance(
        `command-${commandName}`,
        async () => {
          if (import.meta.env.VITE_TRACKING_ENABLED === 'true') {
            track(commandName, ...args);
          }

          // SEO tracking
          SEOOptimizer.trackCommand(commandName, args);

          // Mobile haptic feedback
          if (MobileAdapter.isMobileDevice) {
            MobileAdapter.hapticFeedback('light');
          }

          const commandFunction = commands[commandName];

          if (commandFunction) {
            return await commandFunction(args);
          } else {
            return `${commandName}: command not found`;
          }
        }
      );

      if (commandName !== 'clear') {
        // Add only the command to history (not the output)
        $history = [...$history, { command, outputs: [] }];
        
        // Send output to the content panel
        const title = getCommandTitle(commandName);
        const formattedOutput = formatCommandOutput(output, commandName);
        setContent(title, formattedOutput, command);
      }

      command = '';
      suggestions = [];
    } else if (event.key === 'ArrowUp') {
      if (historyIndex < $history.length - 1) {
        historyIndex++;
        command = $history[$history.length - 1 - historyIndex].command;
      }
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (historyIndex > -1) {
        historyIndex--;
        command =
          historyIndex >= 0
            ? $history[$history.length - 1 - historyIndex].command
            : '';
      }
      event.preventDefault();
    } else if (event.key === 'Tab') {
      event.preventDefault();

      if (suggestions.length > 0) {
        command = suggestions[0];
        suggestions = [];
      } else {
        const autoCompleteCommand = Object.keys(commands).find((cmd) =>
          cmd.startsWith(command),
        );

        if (autoCompleteCommand) {
          command = autoCompleteCommand;
        }
      }
    } else if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      $history = [];
    }
  };
</script>

<svelte:window
  on:click={() => {
    input.focus();
  }}
  on:keydown={handleKeyDown}
/>

<!-- Mobile command suggestions -->
{#if showMobileCommands && (suggestions.length > 0 || command === '')}
  <div class="mobile-commands mb-2 md:hidden">
    {#if command === ''}
      <div class="flex flex-wrap gap-2 mb-2">
        {#each ['help', 'about', 'blog', 'projects', 'search', 'stats'] as cmd}
          <button
            class="px-3 py-1 text-xs border border-opacity-30 rounded bg-opacity-10 hover:bg-opacity-20 transition-all"
            style={`color: ${$theme.foreground}; border-color: ${$theme.green}; background-color: ${$theme.green};`}
            on:click={() => { command = cmd; input.focus(); }}
          >
            {cmd}
          </button>
        {/each}
      </div>
    {:else if suggestions.length > 0}
      <div class="flex flex-wrap gap-2 mb-2">
        {#each suggestions.slice(0, 4) as suggestion}
          <button
            class="px-3 py-1 text-xs border border-opacity-30 rounded bg-opacity-10 hover:bg-opacity-20 transition-all"
            style={`color: ${$theme.foreground}; border-color: ${$theme.blue}; background-color: ${$theme.blue};`}
            on:click={() => { command = suggestion; suggestions = []; input.focus(); }}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<div class="flex w-full">
  <p class="visible md:hidden">❯</p>

  <div class="relative w-full">
    <input
      id="command-input"
      name="command-input"
      aria-label="Command input"
      class="w-full px-2 bg-transparent outline-none border-none focus:outline-none focus:ring-0"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      style={`color: ${$theme.foreground}; box-shadow: none; border: none;`}
      bind:value={command}
      on:keydown={handleKeyDown}
      on:input={handleInput}
      bind:this={input}
    />

    <!-- Desktop suggestions dropdown -->
    {#if suggestions.length > 0 && !showMobileCommands}
      <div
        class="absolute top-full left-0 w-full mt-1 border border-opacity-30 rounded shadow-lg z-10 hidden md:block"
        style={`background-color: ${$theme.background}; border-color: ${$theme.green};`}
      >
        {#each suggestions.slice(0, 5) as suggestion, index}
          <div
            role="button"
            tabindex="0"
            class="px-3 py-2 text-sm cursor-pointer hover:bg-opacity-20 transition-all"
            style={`color: ${$theme.foreground}; background-color: ${index === 0 ? $theme.green + '20' : 'transparent'};`}
            on:click={() => { command = suggestion; suggestions = []; input.focus(); }}
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                command = suggestion;
                suggestions = [];
                input.focus();
              }
            }}
          >
            {suggestion}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
