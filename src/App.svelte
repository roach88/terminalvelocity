<script lang="ts">
  import { onMount } from 'svelte'
  import History from './components/History.svelte'
  import Input from './components/Input.svelte'
  import Ps1 from './components/Ps1.svelte'
  import InkDemo from './components/InkDemo.svelte'
  import { theme } from './stores/theme'
  import { MobileAdapter } from './utils/mobile'
  import { PerformanceOptimizer } from './utils/performance'
  import { SEOOptimizer } from './utils/seo'
  
  let showInkDemo = false;

  onMount(() => {
    // Initialize mobile optimizations
    MobileAdapter.init();
    MobileAdapter.handleVirtualKeyboard();

    // Set up SEO
    SEOOptimizer.updateMetaTags({
      title: 'Terminal Velocity - Developer Portfolio',
      description: 'An interactive terminal-style portfolio showcasing modern web development skills and projects.',
      keywords: ['developer', 'portfolio', 'terminal', 'web development', 'svelte', 'typescript'],
      author: 'Developer'
    });

    SEOOptimizer.preloadCriticalResources();
    SEOOptimizer.trackPageView('home');

    // Performance cleanup interval
    const cleanup = setInterval(() => {
      PerformanceOptimizer.cleanup();
    }, 300000); // Every 5 minutes

    return () => {
      clearInterval(cleanup);
    };
  });
</script>

<svelte:head>
  {#if import.meta.env.VITE_TRACKING_ENABLED === 'true'}
    <script
      async
      defer
      data-website-id={import.meta.env.VITE_TRACKING_SITE_ID}
      src={import.meta.env.VITE_TRACKING_URL}
    ></script>
  {/if}
</svelte:head>

<main
  class="h-full min-h-screen flex flex-col border-2 rounded-md p-4 overflow-auto text-xs sm:text-sm md:text-base"
  style={`background-color: ${$theme.background}; color: ${$theme.foreground}; border-color: ${$theme.green};`}
>
  <!-- Permanent banner -->
  <div class="mb-4 whitespace-pre font-mono" style={`color: ${$theme.foreground}`}>
{`████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║
   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝

██╗   ██╗███████╗██╗      ██████╗  ██████╗██╗████████╗██╗   ██╗
██║   ██║██╔════╝██║     ██╔═══██╗██╔════╝██║╚══██╔══╝╚██╗ ██╔╝
██║   ██║█████╗  ██║     ██║   ██║██║     ██║   ██║    ╚████╔╝
╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██║     ██║   ██║     ╚██╔╝
 ╚████╔╝ ███████╗███████╗╚██████╔╝╚██████╗██║   ██║      ██║
  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝  ╚═════╝╚═╝   ╚═╝      ╚═╝

Welcome to Terminal Velocity - A Developer Portfolio

Type 'help' to explore available commands.
Type 'about' to learn more about me.
Type 'projects' to see my work.`}
  </div>

  <!-- Toggle button for demo -->
  <button 
    class="mb-2 px-3 py-1 text-xs border rounded"
    style={`color: ${$theme.foreground}; border-color: ${$theme.green}; background-color: transparent;`}
    on:click={() => showInkDemo = !showInkDemo}
  >
    {showInkDemo ? 'Show Classic Terminal' : 'Show Ink-Style Demo'}
  </button>

  {#if showInkDemo}
    <InkDemo />
  {:else}
    <History />

    <div class="flex flex-col md:flex-row mt-2">
      <Ps1 />
      <Input />
    </div>
  {/if}
</main>
