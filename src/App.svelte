<script lang="ts">
  import { onMount } from 'svelte';
  import Ps1 from './components/Ps1.svelte';
  import Input from './components/Input.svelte';
  import History from './components/History.svelte';
  import { theme } from './stores/theme';
  import { MobileAdapter } from './utils/mobile';
  import { SEOOptimizer } from './utils/seo';
  import { PerformanceOptimizer } from './utils/performance';

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
  class="h-full border-2 rounded-md p-4 overflow-auto text-xs sm:text-sm md:text-base"
  style={`background-color: ${$theme.background}; color: ${$theme.foreground}; border-color: ${$theme.green};`}
>
  <History />

  <div class="flex flex-col md:flex-row">
    <Ps1 />

    <Input />
  </div>
</main>
