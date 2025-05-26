import { writable } from 'svelte/store';

export interface ContentState {
  title: string;
  content: string;
  command: string;
  timestamp: Date;
}

// Store for the right panel content
export const currentContent = writable<ContentState>({
  title: 'Welcome',
  content: `<div class="space-y-4">
    <h2 class="text-2xl font-bold mb-4">Welcome to Terminal Velocity</h2>
    <p>This is an interactive terminal-style portfolio. Use the terminal on the left to explore my work.</p>
    
    <h3 class="text-lg font-semibold mt-6 mb-2">Quick Start:</h3>
    <ul class="list-disc list-inside space-y-1">
      <li><code class="bg-black/30 px-2 py-1 rounded">help</code> - View all available commands</li>
      <li><code class="bg-black/30 px-2 py-1 rounded">about</code> - Learn more about me</li>
      <li><code class="bg-black/30 px-2 py-1 rounded">projects</code> - See my work</li>
      <li><code class="bg-black/30 px-2 py-1 rounded">blog</code> - Read my latest posts</li>
    </ul>
  </div>`,
  command: '',
  timestamp: new Date()
});

// Update content in the right panel
export const setContent = (title: string, content: string, command: string) => {
  currentContent.set({
    title,
    content,
    command,
    timestamp: new Date()
  });
};