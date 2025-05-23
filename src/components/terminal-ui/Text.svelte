<script lang="ts">
  import { theme } from '../../stores/theme'

  // Color props
  export let color: string = '';
  export let backgroundColor: string = '';

  // Style props
  export let bold: boolean = false;
  export let dim: boolean = false;
  export let italic: boolean = false;
  export let underline: boolean = false;
  export let inverse: boolean = false;
  export let strikethrough: boolean = false;

  // Text transform
  export let wrap: 'wrap' | 'truncate' | 'truncate-start' | 'truncate-middle' = 'wrap';

  // Get effective colors from theme
  $: effectiveColor = color || $theme.foreground;
  $: effectiveBackground = backgroundColor || 'transparent';

  // Map color names to theme colors
  $: themeColor = (() => {
    switch(color) {
      case 'black': return $theme.black;
      case 'red': return $theme.red;
      case 'green': return $theme.green;
      case 'yellow': return $theme.yellow;
      case 'blue': return $theme.blue;
      case 'magenta': return $theme.red;
      case 'cyan': return $theme.cyan;
      case 'white': return $theme.white;
      case 'gray':
      case 'grey': return $theme.brightBlack;
      case 'redBright': return $theme.brightRed;
      case 'greenBright': return $theme.brightGreen;
      case 'yellowBright': return $theme.brightYellow;
      case 'blueBright': return $theme.brightBlue;
      case 'magentaBright': return $theme.brightRed;
      case 'cyanBright': return $theme.brightCyan;
      case 'whiteBright': return $theme.brightWhite;
      default: return color || $theme.foreground;
    }
  })();

  $: themeBgColor = (() => {
    switch(backgroundColor) {
      case 'black': return $theme.black;
      case 'red': return $theme.red;
      case 'green': return $theme.green;
      case 'yellow': return $theme.yellow;
      case 'blue': return $theme.blue;
      case 'magenta': return $theme.red;
      case 'cyan': return $theme.cyan;
      case 'white': return $theme.white;
      case 'gray':
      case 'grey': return $theme.brightBlack;
      case 'redBright': return $theme.brightRed;
      case 'greenBright': return $theme.brightGreen;
      case 'yellowBright': return $theme.brightYellow;
      case 'blueBright': return $theme.brightBlue;
      case 'magentaBright': return $theme.brightRed;
      case 'cyanBright': return $theme.brightCyan;
      case 'whiteBright': return $theme.brightWhite;
      default: return backgroundColor || 'transparent';
    }
  })();
</script>

<span
  class="text"
  class:bold
  class:dim
  class:italic
  class:underline
  class:inverse
  class:strikethrough
  class:wrap={wrap === 'wrap'}
  class:truncate={wrap === 'truncate'}
  class:truncate-start={wrap === 'truncate-start'}
  class:truncate-middle={wrap === 'truncate-middle'}
  style:color={inverse ? themeBgColor : themeColor}
  style:background-color={inverse ? themeColor : themeBgColor}
>
  <slot />
</span>

<style>
  .text {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .bold {
    font-weight: bold;
  }

  .dim {
    opacity: 0.6;
  }

  .italic {
    font-style: italic;
  }

  .underline {
    text-decoration: underline;
  }

  .inverse {
    /* Colors are swapped via inline styles */
  }

  .strikethrough {
    text-decoration: line-through;
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .truncate-start {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    text-align: left;
  }

  .truncate-middle {
    /* This is tricky in pure CSS, might need JS for proper implementation */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wrap {
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>