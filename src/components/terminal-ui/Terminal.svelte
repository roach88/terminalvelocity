<script lang="ts">
  import { theme } from '../../stores/theme'

  export let fullscreen: boolean = true;
  export let padding: number = 2;
</script>

<div
  class="terminal"
  class:fullscreen
  style:background-color={$theme.background}
  style:color={$theme.foreground}
  style:padding={`${padding}ch`}
>
  <slot />
</div>

<style>
  .terminal {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow: auto;
  }

  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
  }
</style>