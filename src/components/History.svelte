<script lang="ts">
  import { history } from '../stores/history'
  import { theme } from '../stores/theme'
</script>

<div class="command-history flex-1 overflow-y-auto">
  {#each $history as { command }}
    <div class="flex items-center py-1" style={`color: ${$theme.foreground}`}>
      <span class="mr-2" style={`color: ${$theme.green}`}>$</span>
      <span class="font-mono text-sm">{command}</span>
    </div>
  {/each}
</div>
