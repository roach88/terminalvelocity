<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import Box from './Box.svelte'
  import Text from './Text.svelte'

  export let items: Array<{ label: string; value: any }> = [];
  export let onSelect: (item: { label: string; value: any }) => void = () => {};
  export let onHighlight: (item: { label: string; value: any }) => void = () => {};
  export let indicatorComponent: any = null;
  export let itemComponent: any = null;
  export let limit: number = 0;
  export let isFocused: boolean = true;

  let selectedIndex = 0;

  $: visibleItems = limit > 0 ? items.slice(0, limit) : items;
  $: if (selectedIndex >= visibleItems.length && visibleItems.length > 0) {
    selectedIndex = visibleItems.length - 1;
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (!isFocused) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : visibleItems.length - 1;
        if (visibleItems[selectedIndex]) {
          onHighlight(visibleItems[selectedIndex]);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = selectedIndex < visibleItems.length - 1 ? selectedIndex + 1 : 0;
        if (visibleItems[selectedIndex]) {
          onHighlight(visibleItems[selectedIndex]);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (visibleItems[selectedIndex]) {
          onSelect(visibleItems[selectedIndex]);
        }
        break;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyPress);
    if (visibleItems[selectedIndex]) {
      onHighlight(visibleItems[selectedIndex]);
    }
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyPress);
  });
</script>

<Box flexDirection="column">
  {#each visibleItems as item, index}
    <Box>
      {#if indicatorComponent && index === selectedIndex}
        <svelte:component this={indicatorComponent} isSelected={true} />
      {:else if indicatorComponent}
        <Text> </Text>
      {/if}

      {#if itemComponent}
        <svelte:component
          this={itemComponent}
          {...item}
          isSelected={index === selectedIndex}
        />
      {:else}
        <Text
          color={index === selectedIndex ? 'blue' : ''}
          bold={index === selectedIndex}
        >
          {item.label}
        </Text>
      {/if}
    </Box>
  {/each}
</Box>

<style>
  /* Component is fully controlled by props and composition */
</style>