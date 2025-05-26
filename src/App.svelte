<script lang="ts">
  import { onMount } from 'svelte'
  import History from './components/History.svelte'
  import Input from './components/Input.svelte'
  import Ps1 from './components/Ps1.svelte'
  import { theme } from './stores/theme'
  import { currentContent } from './stores/content'
  import { MobileAdapter } from './utils/mobile'
  import { PerformanceOptimizer } from './utils/performance'
  import { SEOOptimizer } from './utils/seo'
  
  let isMobile = false;

  onMount(() => {
    // Initialize mobile optimizations
    MobileAdapter.init();
    MobileAdapter.handleVirtualKeyboard();
    isMobile = window.innerWidth < 768;

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

<style>
  .ascii-banner {
    /* ASCII art specific styles */
    font-size: 0.75rem; /* You can adjust this */
    line-height: 1.2;
    letter-spacing: 0.05em;
  }
  
  /* Content panel styles */
  .content-output {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
  }
  
  .content-output h1, .content-output h2, .content-output h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .content-output code {
    font-family: 'Cascadia Code', monospace;
    font-size: 0.875em;
  }
  
  .content-output pre {
    font-family: 'Cascadia Code', monospace;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    background: rgba(0, 0, 0, 0.3);
    max-width: 100%;
  }
  
  /* Ensure all content fits within container */
  .content-output * {
    max-width: 100%;
    word-wrap: break-word;
  }
  
  /* Special handling for code blocks */
  .content-output code {
    overflow-wrap: break-word;
  }
  
  /* Weather display optimization - global styles for dynamic content */
  :global(.weather-container) {
    width: 100%;
    overflow: hidden;
    /* Add a subtle mask to hide edge imperfections */
    mask-image: linear-gradient(to right, 
      black 0%, 
      black 95%, 
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(to right, 
      black 0%, 
      black 95%, 
      transparent 100%
    );
  }
  
  :global(.weather-container pre) {
    transform-origin: top left;
    width: max-content;
    /* Use a monospace font stack that handles Unicode better */
    font-family: 'Cascadia Code', 'Courier New', Courier, monospace;
    /* Ensure consistent character rendering */
    font-variant-ligatures: none;
    letter-spacing: 0;
    /* Add some padding to ensure content doesn't touch edges */
    padding-right: 2rem;
  }
  
  /* Scale down weather if needed on smaller screens */
  @media (max-width: 1400px) {
    :global(.weather-container) {
      font-size: 0.5rem !important;
    }
  }
  
  /* Mobile adjustments */
  @media (max-width: 1023px) {
    .ascii-banner {
      font-size: 0.5rem;
      line-height: 1.1;
    }
    
    .content-output {
      font-size: 0.875rem;
    }
  }
  
  /* Tablet and desktop adjustments */
  @media (min-width: 768px) {
    .ascii-banner {
      font-size: 0.75rem;
    }
  }
  
  @media (min-width: 1024px) {
    .ascii-banner {
      font-size: 0.875rem;
    }
  }
  
  @media (min-width: 1280px) {
    .ascii-banner {
      font-size: 1rem;
    }
  }
</style>

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
  class="h-screen w-screen overflow-hidden p-4"
  style={`background-color: ${$theme.background}; color: ${$theme.foreground};`}
>
  <div class="h-full flex flex-col lg:flex-row gap-4">
    <!-- Left Panel: Terminal -->
    <div class="h-1/2 lg:h-full lg:w-1/2 flex flex-col border-2 rounded-md p-4 overflow-hidden"
         style={`border-color: ${$theme.green};`}>
      
      <!-- Permanent banner -->
      <div class="mb-4 flex-shrink-0">
        <pre class="ascii-banner whitespace-pre font-mono" style="color: #c96342">{`████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
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
  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝  ╚═════╝╚═╝   ╚═╝      ╚═╝`}</pre>
      </div>

      <!-- Terminal Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <History />
        <div class="flex flex-row mt-2">
          <Ps1 />
          <Input />
        </div>
      </div>
    </div>

    <!-- Right Panel: Content Display -->
    <div class="h-1/2 lg:h-full lg:w-1/2 flex flex-col overflow-hidden">
      <div class="h-full border-2 rounded-md p-4 lg:p-6 overflow-y-auto overflow-x-hidden"
           style={`border-color: ${$theme.green}; background-color: ${$theme.background};`}>
        
        <!-- Content Header -->
        {#if $currentContent.command}
          <div class="mb-4 pb-4 border-b" style={`border-color: ${$theme.green}30;`}>
            <span class="text-sm opacity-60">Command:</span>
            <code class="ml-2 text-sm" style={`color: ${$theme.yellow};`}>{$currentContent.command}</code>
          </div>
        {/if}
        
        <!-- Content Title -->
        {#if $currentContent.title}
          <h1 class="text-2xl font-bold mb-4" style={`color: ${$theme.foreground};`}>
            {$currentContent.title}
          </h1>
        {/if}
        
        <!-- Content Body -->
        <div class="content-output prose prose-invert max-w-none overflow-x-hidden"
             style={`color: ${$theme.foreground};`}>
          {@html $currentContent.content}
        </div>
      </div>
    </div>
  </div>
</main>
