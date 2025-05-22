<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import { commands, executeCommand, shortcutManager } from '../utils/commands';
  import { track } from '../utils/tracking';
  import { MobileAdapter } from '../utils/mobile';
  import { SEOOptimizer } from '../utils/seo';
  import { PerformanceOptimizer } from '../utils/performance';

  let command = '';
  let historyIndex = -1;
  let suggestions: string[] = [];
  let showMobileCommands = false;

  let input: HTMLInputElement;

  onMount(() => {
    input.focus();

    if ($history.length === 0) {
      const command = commands['banner'] as () => string;

      if (command) {
        const output = command();

        $history = [...$history, { command: 'banner', outputs: [output] }];
      }
    }

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

  const handleKeyDown = async (event: KeyboardEvent) => {
    // Handle global shortcuts first
    if (shortcutManager.handleKeyDown(event)) {
      return;
    }

    if (event.key === 'Enter') {
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
        $history = [...$history, { command, outputs: [output] }];
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
      class="w-full px-2 bg-transparent outline-none"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      style={`color: ${$theme.foreground}`}
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
            class="px-3 py-2 text-sm cursor-pointer hover:bg-opacity-20 transition-all"
            style={`color: ${$theme.foreground}; background-color: ${index === 0 ? $theme.green + '20' : 'transparent'};`}
            on:click={() => { command = suggestion; suggestions = []; input.focus(); }}
            on:keydown={() => {}}
          >
            {suggestion}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
