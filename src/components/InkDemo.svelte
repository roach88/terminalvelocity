<script lang="ts">
  import { Box, Text, SelectInput, Spacer } from './terminal-ui';
  
  let selectedCommand = '';
  
  const menuItems = [
    { label: '📝 Blog Posts', value: 'blog' },
    { label: '🚀 Projects', value: 'projects' },
    { label: '👤 About Me', value: 'about' },
    { label: '📧 Contact', value: 'contact' },
    { label: '🔍 Search', value: 'search' }
  ];
  
  function handleSelect(item: { label: string; value: string }) {
    selectedCommand = item.value;
  }
</script>

<Box flexDirection="column" padding={1}>
  <!-- Header with border -->
  <Box borderStyle="round" padding={1}>
    <Text color="green" bold>Terminal Velocity</Text>
    <Text color="gray"> - Interactive Portfolio</Text>
  </Box>
  
  <Spacer />
  
  <!-- Two column layout -->
  <Box gap={2}>
    <!-- Left column - Menu -->
    <Box flexDirection="column" minWidth={30}>
      <Text bold underline>Main Menu</Text>
      <Spacer size={0.5} />
      <SelectInput 
        items={menuItems} 
        onSelect={handleSelect}
        isFocused={true}
      />
    </Box>
    
    <!-- Right column - Content -->
    <Box flexDirection="column" borderStyle="single" padding={1} minWidth={40}>
      {#if selectedCommand}
        <Text color="yellow">Selected: {selectedCommand}</Text>
        <Spacer size={0.5} />
        <Text dim>Press Enter to execute command...</Text>
      {:else}
        <Text dim italic>Use arrow keys to navigate</Text>
        <Text dim italic>Press Enter to select</Text>
      {/if}
    </Box>
  </Box>
  
  <Spacer />
  
  <!-- Status bar -->
  <Box borderStyle="double" padding={{ left: 1, right: 1 }} justifyContent="space-between">
    <Text color="cyan">Ready</Text>
    <Text color="magenta">{new Date().toLocaleTimeString()}</Text>
  </Box>
</Box>