import packageJson from '../../package.json';
import { clearHistory } from '../stores/history';
import { setContent } from '../stores/content';
import { fetchAbout, fetchBlogPost, fetchBlogPosts, fetchProject, fetchProjects, searchContent } from './content';
import { TerminalFormatter } from './formatter';
import { ShortcutManager } from './shortcuts';
import { beehiivAPI } from './beehiiv';

const hostname = window.location.hostname;
const shortcutManager = new ShortcutManager();

export const commands: Record<string, (args: string[]) => Promise<string> | string> = {
  help: () => {
    const commandGroups = {
      'Content': ['about', 'blog', 'read', 'projects', 'project', 'contact', 'subscribe'],
      'Discovery': ['search', 'tags', 'recent', 'featured', 'stats'],
      'System': ['help', 'clear', 'hostname', 'whoami', 'date', 'version', 'uptime'],
      'Utilities': ['shortcuts', 'aliases'],
      'Fun': ['weather', 'curl', 'banner', 'sudo', 'vi', 'vim', 'emacs']
    };

    let helpText = '<div class="space-y-4">';
    helpText += '<p class="text-lg mb-4">Available commands:</p>';

    for (const [group, cmds] of Object.entries(commandGroups)) {
      helpText += `<div class="mb-4">`;
      helpText += `<h3 class="font-bold text-base mb-2" style="color: #c96342">${group}:</h3>`;
      helpText += '<div class="grid grid-cols-2 md:grid-cols-3 gap-2">';
      for (const cmd of cmds) {
        helpText += `<code class="bg-black/30 px-2 py-1 rounded text-sm">${cmd}</code>`;
      }
      helpText += '</div>';
      helpText += '</div>';
    }

    helpText += '<div class="mt-6 space-y-2">';
    helpText += '<h3 class="font-bold text-base mb-2" style="color: #c96342">Tips:</h3>';
    helpText += '<ul class="list-disc list-inside space-y-1">';
    helpText += '<li>Use <kbd class="bg-black/30 px-2 py-0.5 rounded text-sm">Tab</kbd> for autocompletion</li>';
    helpText += '<li>Use <kbd class="bg-black/30 px-2 py-0.5 rounded text-sm">↑</kbd>/<kbd class="bg-black/30 px-2 py-0.5 rounded text-sm">↓</kbd> arrows for command history</li>';
    helpText += '<li>Try <code class="bg-black/30 px-2 py-1 rounded text-sm">search &lt;term&gt;</code> to find content</li>';
    helpText += '<li>Use <code class="bg-black/30 px-2 py-1 rounded text-sm">stats</code> to see portfolio overview</li>';
    helpText += '</ul>';
    helpText += '</div>';
    helpText += '</div>';

    return helpText;
  },
  hostname: () => hostname,
  whoami: () => 'guest',
  date: () => new Date().toLocaleString(),
  vi: () => `why use vi? try 'emacs'`,
  vim: () => `why use vim? try 'emacs'`,
  emacs: () => `why use emacs? try 'vim'`,
  echo: (args: string[]) => args.join(' '),
  sudo: (args: string[]) => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    return `Permission denied: unable to run the command '${args[0]}' as root.`;
  },
  repo: () => {
    window.open(packageJson.repository.url, '_blank');

    return 'Opening repository...';
  },
  clear: () => {
    clearHistory();
    // Reset content panel to welcome message
    setContent('Welcome', `<div class="space-y-4">
      <h2 class="text-2xl font-bold mb-4">Welcome to Terminal Velocity</h2>
      <p>This is an interactive terminal-style portfolio. Use the terminal on the left to explore my work.</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Quick Start:</h3>
      <ul class="list-disc list-inside space-y-1">
        <li><code class="bg-black/30 px-2 py-1 rounded">help</code> - View all available commands</li>
        <li><code class="bg-black/30 px-2 py-1 rounded">about</code> - Learn more about me</li>
        <li><code class="bg-black/30 px-2 py-1 rounded">projects</code> - See my work</li>
        <li><code class="bg-black/30 px-2 py-1 rounded">blog</code> - Read my latest posts</li>
      </ul>
    </div>`, 'clear');
    return '';
  },
  email: () => {
    window.open(`mailto:${packageJson.author.email}`);

    return `Opening mailto:${packageJson.author.email}...`;
  },
  weather: async (args: string[]) => {
    const city = args.join(' ');

    if (!city) {
      return 'Usage: weather [city]. Example: weather Austin';
    }

    try {
      // Use OpenWeatherMap API (free tier available)
      // You can get a free API key at https://openweathermap.org/api
      // For now, using the wttr.in JSON API which doesn't require a key
      const response = await fetch(`https://wttr.in/${city}?format=j1`);
      const data = await response.json();
      
      if (!data || !data.current_condition) {
        return 'Unable to fetch weather data for ' + city;
      }

      // Build our own ASCII weather display
      const current = data.current_condition[0];
      const location = data.nearest_area[0];
      const forecast = data.weather.slice(0, 3); // Next 3 days
      
      // Create custom ASCII art weather display
      let output = '<div class="weather-display">';
      
      // Header
      output += `<h2 class="text-xl mb-4">Weather Report: ${location.areaName[0].value}, ${location.region[0].value}</h2>`;
      
      // Current conditions
      output += '<div class="current-weather mb-6 p-4 border rounded" style="border-color: #bfbebb;">';
      output += '<div class="grid grid-cols-2 gap-4">';
      output += '<div>';
      output += `<p class="text-lg font-bold">${current.temp_F}°F</p>`;
      output += `<p class="text-sm">${current.weatherDesc[0].value}</p>`;
      output += `<p class="text-sm">Feels like: ${current.FeelsLikeF}°F</p>`;
      output += '</div>';
      output += '<div class="text-right">';
      output += `<p class="text-sm">Wind: ${current.windspeedMiles} mph ${current.winddir16Point}</p>`;
      output += `<p class="text-sm">Humidity: ${current.humidity}%</p>`;
      output += `<p class="text-sm">Visibility: ${current.visibilityMiles} mi</p>`;
      output += '</div>';
      output += '</div>';
      output += '</div>';
      
      // 3-day forecast
      output += '<div class="forecast">';
      output += '<h3 class="text-lg mb-3">3-Day Forecast</h3>';
      output += '<div class="grid grid-cols-3 gap-2">';
      
      forecast.forEach((day: any) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        output += '<div class="forecast-day p-3 border rounded text-center" style="border-color: #bfbebb;">';
        output += `<p class="font-bold">${dayName}</p>`;
        output += `<p class="text-sm">${day.maxtempF}°/${day.mintempF}°</p>`;
        output += `<p class="text-xs">${day.hourly[4].weatherDesc[0].value}</p>`;
        output += `<p class="text-xs">💧 ${day.hourly[4].chanceofrain}%</p>`;
        output += '</div>';
      });
      
      output += '</div>';
      output += '</div>';
      
      // ASCII art for current weather condition
      output += '<div class="mt-6 text-center">';
      output += '<pre class="inline-block text-xs">';
      
      const weatherCode = parseInt(current.weatherCode);
      if (weatherCode === 113) { // Clear/Sunny
        output += `    \\   /    
     .-.     
  ― (   ) ―  
     \`-'     
    /   \\    `;
      } else if (weatherCode >= 116 && weatherCode <= 119) { // Cloudy
        output += `    .--.     
 .-(    ).   
(___.__)__)  `;
      } else if (weatherCode >= 176 && weatherCode <= 377) { // Rain
        output += `    .--.     
 .-(    ).   
(___.__)__)  
 ' ' ' ' '   `;
      } else if (weatherCode >= 200 && weatherCode <= 232) { // Thunderstorm
        output += `    .--.     
 .-(    ).   
(___.__)__)  
  *  *  *    `;
      } else { // Default cloudy
        output += `    .--.     
 .-(    ).   
(___.__)__)  `;
      }
      
      output += '</pre>';
      output += '</div>';
      
      output += '</div>';
      
      return output;
      
    } catch (error) {
      return `Unable to fetch weather data. Error: ${error}`;
    }
  },
  exit: () => {
    return 'Please close the tab to exit.';
  },
  curl: async (args: string[]) => {
    if (args.length === 0) {
      return 'curl: no URL provided';
    }

    const url = args[0];

    try {
      const response = await fetch(url);
      const data = await response.text();

      return data;
    } catch (error) {
      return `curl: could not fetch URL ${url}. Details: ${error}`;
    }
  },
  banner: () => `
████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
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
Type 'projects' to see my work.
`,
  about: async () => {
    const aboutData = await fetchAbout();
    if (!aboutData) {
      return 'About information not available.';
    }
    return TerminalFormatter.stripHtml(aboutData.content);
  },
  blog: async (args: string[]) => {
    try {
      const response = await beehiivAPI.getPosts(20); // Get 20 most recent posts
      const posts = response.data;
      
      if (posts.length === 0) {
        return '<p>No blog posts available yet. Check back soon!</p>';
      }

      let output = '<div class="blog-list">';
      output += '<h2 class="text-xl mb-4">Recent Newsletter Posts</h2>';
      output += '<div class="space-y-4">';
      
      posts.forEach((post, index) => {
        const date = beehiivAPI.formatPostDate(post.created || post.publish_date || Date.now() / 1000);
        output += '<div class="blog-post-item p-4 border rounded hover:bg-white/5" style="border-color: #bfbebb;">';
        output += `<h3 class="text-lg font-bold mb-1">${post.title}</h3>`;
        if (post.subtitle) {
          output += `<p class="text-sm opacity-80 mb-2">${post.subtitle}</p>`;
        }
        output += `<div class="flex justify-between items-center text-sm">`;
        output += `<span class="opacity-60">${date}</span>`;
        output += `<code class="bg-black/30 px-2 py-1 rounded">read ${post.slug || post.id}</code>`;
        output += `</div>`;
        output += '</div>';
      });
      
      output += '</div>';
      
      if (response.next_page) {
        output += '<p class="mt-4 text-sm opacity-60">Showing 20 most recent posts. More posts available.</p>';
      }
      
      output += '<div class="mt-6 p-4 bg-black/20 rounded">';
      output += '<p class="text-sm">💡 <strong>Tips:</strong></p>';
      output += '<ul class="list-disc list-inside text-sm mt-2 space-y-1">';
      output += '<li>Use <code class="bg-black/30 px-2 py-0.5 rounded">read &lt;slug&gt;</code> to read a full post</li>';
      output += '<li>Use <code class="bg-black/30 px-2 py-0.5 rounded">search &lt;term&gt;</code> to search posts</li>';
      output += '<li>Use <code class="bg-black/30 px-2 py-0.5 rounded">subscribe</code> to join the newsletter</li>';
      output += '</ul>';
      output += '</div>';
      output += '</div>';
      
      return output;
    } catch (error) {
      if ((error as any).message.includes('credentials not configured')) {
        return '<p>Newsletter integration not configured. Please check back later!</p>';
      }
      return `<p>Error loading blog posts: ${(error as any).message}</p>`;
    }
  },
  read: async (args: string[]) => {
    if (args.length === 0) {
      return '<p>Usage: <code>read &lt;post-id&gt;</code></p>';
    }

    try {
      const identifier = args[0];
      
      // Try to fetch the post by ID
      const post = await beehiivAPI.getPost(identifier);
      
      let output = '<article class="blog-post">';
      
      // Header
      output += `<header class="mb-6">`;
      output += `<h1 class="text-2xl font-bold mb-2">${post.title}</h1>`;
      if (post.subtitle) {
        output += `<p class="text-lg opacity-80 mb-3">${post.subtitle}</p>`;
      }
      output += `<div class="flex items-center gap-4 text-sm opacity-60">`;
      output += `<span>${beehiivAPI.formatPostDate(post.created || post.publish_date || Date.now() / 1000)}</span>`;
      if (post.authors && post.authors.length > 0) {
        const authorName = typeof post.authors[0] === 'string' ? post.authors[0] : post.authors[0].name;
        output += `<span>by ${authorName}</span>`;
      }
      output += `</div>`;
      output += `</header>`;
      
      // Content
      output += '<div class="prose prose-invert max-w-none">';
      
      // Check various content fields (content.free.web is the main content)
      const contentHtml = post.content_html || 
                         post.content?.free?.web || 
                         post.content?.free?.email || 
                         post.content?.premium?.web;
      const contentText = post.content_text || 
                         post.content?.free?.rss;
      
      if (contentHtml) {
        // Clean up the HTML for better display
        let content = contentHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
          .replace(/style="[^"]*"/g, '') // Remove inline styles
          .replace(/class="[^"]*"/g, ''); // Remove classes
        output += content;
      } else if (contentText) {
        // Fallback to text content with basic formatting
        output += `<div class="whitespace-pre-wrap">${contentText}</div>`;
      } else {
        output += '<p class="opacity-60">Content not available for this post. ';
        output += `<a href="${post.web_url}" target="_blank" class="underline">View on web →</a></p>`;
      }
      output += '</div>';
      
      // Footer
      output += '<footer class="mt-8 pt-4 border-t" style="border-color: #bfbebb;">';
      output += '<div class="flex justify-between items-center">';
      output += `<a href="${post.web_url}" target="_blank" class="text-sm underline">View on Beehiiv →</a>`;
      output += '<div class="text-sm">';
      output += '<span>Use </span>';
      output += '<code class="bg-black/30 px-2 py-0.5 rounded">blog</code>';
      output += '<span> to see more posts</span>';
      output += '</div>';
      output += '</div>';
      output += '</footer>';
      
      output += '</article>';
      
      return output;
    } catch (error: any) {
      return `<p>Error loading post: ${error.message || 'Unknown error'}</p>`;
    }
  },
  projects: async () => {
    const projects = await fetchProjects();
    if (projects.length === 0) {
      return 'No projects available.';
    }

    return TerminalFormatter.formatProjectList(projects);
  },
  project: async (args: string[]) => {
    if (args.length === 0) {
      return 'Usage: project <project-slug>';
    }

    const slug = args[0];
    const project = await fetchProject(slug);
    if (!project) {
      return `Project '${slug}' not found.`;
    }

    return TerminalFormatter.formatProject(project);
  },
  contact: () => {
    return `Get in touch:
Email: ${packageJson.author.email}
GitHub: ${packageJson.repository.url}
Portfolio: ${packageJson.author.url || 'https://terminalvelocity.dev'}`;
  },
  subscribe: async (args: string[]) => {
    if (args.length === 0) {
      return `<div class="subscribe-form">
        <h2 class="text-xl mb-4">Subscribe to the Newsletter</h2>
        <p class="mb-4">Get the latest posts delivered straight to your inbox!</p>
        <div class="p-4 bg-black/20 rounded">
          <p class="text-sm">To subscribe, use: <code class="bg-black/30 px-2 py-0.5 rounded">subscribe &lt;your-email&gt;</code></p>
          <p class="text-sm mt-2">Example: <code class="bg-black/30 px-2 py-0.5 rounded">subscribe me@example.com</code></p>
        </div>
      </div>`;
    }

    const email = args[0];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return '<p>Please provide a valid email address.</p>';
    }

    try {
      const success = await beehiivAPI.subscribeEmail(email);
      
      if (success) {
        return `<div class="subscribe-success">
          <h2 class="text-xl mb-4">🎉 Welcome aboard!</h2>
          <p>You've been successfully subscribed to the newsletter.</p>
          <p class="mt-2">Check your email for a confirmation message.</p>
        </div>`;
      } else {
        return '<p>There was an issue subscribing. Please try again later.</p>';
      }
    } catch (error: any) {
      return `<p>Error: ${error.message || 'Unable to subscribe at this time.'}</p>`;
    }
  },
  search: async (args: string[]) => {
    if (args.length === 0) {
      return '<p>Usage: <code>search &lt;query&gt;</code></p><p>Example: <code>search "javascript tips"</code></p>';
    }

    const query = args.join(' ');
    
    try {
      const posts = await beehiivAPI.searchPosts(query);
      
      if (posts.length === 0) {
        return `<p>No results found for "${query}".</p>`;
      }
      
      let output = '<div class="search-results">';
      output += `<h2 class="text-xl mb-4">Search results for "${query}"</h2>`;
      output += `<p class="text-sm opacity-60 mb-4">Found ${posts.length} post${posts.length !== 1 ? 's' : ''}</p>`;
      output += '<div class="space-y-4">';
      
      posts.forEach(post => {
        const date = beehiivAPI.formatPostDate(post.created || post.publish_date || Date.now() / 1000);
        output += '<div class="search-result p-4 border rounded" style="border-color: #bfbebb;">';
        output += `<h3 class="text-lg font-bold mb-1">${post.title}</h3>`;
        if (post.subtitle) {
          output += `<p class="text-sm opacity-80 mb-2">${post.subtitle}</p>`;
        }
        output += `<div class="flex justify-between items-center text-sm">`;
        output += `<span class="opacity-60">${date}</span>`;
        output += `<code class="bg-black/30 px-2 py-1 rounded">read ${post.id}</code>`;
        output += `</div>`;
        output += '</div>';
      });
      
      output += '</div>';
      output += '</div>';
      
      return output;
    } catch (error: any) {
      return `<p>Error searching posts: ${error.message || 'Unknown error'}</p>`;
    }
  },
  tags: async () => {
    const posts = await fetchBlogPosts();
    const allTags = posts.flatMap(post => post.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([tag, count]) => `${tag} (${count})`);

    return sortedTags.length > 0
      ? `Available tags:\n${sortedTags.join(', ')}`
      : 'No tags found.';
  },
  recent: async (args: string[]) => {
    const limit = args.length > 0 ? parseInt(args[0]) || 5 : 5;
    const posts = await fetchBlogPosts();
    const recentPosts = posts.slice(0, limit);

    if (recentPosts.length === 0) {
      return 'No recent posts available.';
    }

    return `${limit} most recent posts:\n\n${TerminalFormatter.formatBlogList(recentPosts)}`;
  },
  featured: async () => {
    const projects = await fetchProjects();
    const featuredProjects = projects.filter(p => p.featured);

    if (featuredProjects.length === 0) {
      return 'No featured projects available.';
    }

    return `Featured projects:\n\n${TerminalFormatter.formatProjectList(featuredProjects)}`;
  },
  stats: async () => {
    const [posts, projects] = await Promise.all([
      fetchBlogPosts(),
      fetchProjects()
    ]);

    const totalWords = posts.reduce((acc, post) => {
      const words = TerminalFormatter.stripHtml(post.content).split(/\s+/).length;
      return acc + words;
    }, 0);

    const allTags = posts.flatMap(post => post.tags);
    const uniqueTags = new Set(allTags).size;

    const techStack = projects.flatMap(p => p.tech);
    const uniqueTech = new Set(techStack).size;

    return `Portfolio Statistics:
📝 Blog posts: ${posts.length}
🚀 Projects: ${projects.length}
⭐ Featured projects: ${projects.filter(p => p.featured).length}
📚 Total words: ${totalWords.toLocaleString()}
🏷️  Unique tags: ${uniqueTags}
🛠️  Technologies used: ${uniqueTech}`;
  },
  shortcuts: () => {
    const shortcuts = shortcutManager.getShortcutsList();
    let result = 'Keyboard Shortcuts:\n\n';

    shortcuts.forEach(shortcut => {
      const keys = [];
      if (shortcut.ctrl) keys.push('Ctrl');
      if (shortcut.alt) keys.push('Alt');
      if (shortcut.shift) keys.push('Shift');
      keys.push(shortcut.key.toUpperCase());

      result += `${keys.join('+')} - ${shortcut.description}\n`;
    });

    return result;
  },
  aliases: () => {
    const aliases = shortcutManager.getAllAliases();
    let result = 'Command Aliases:\n\n';

    aliases.forEach(([alias, command]) => {
      result += `${alias} → ${command}\n`;
    });

    result += '\nTip: Use aliases for faster navigation!';
    return result;
  },
  version: () => {
    return `Terminal Velocity v${packageJson.version}
Built with:
- Svelte ${packageJson.devDependencies.svelte || 'latest'}
- TypeScript ${packageJson.devDependencies.typescript || 'latest'}
- Vite ${packageJson.devDependencies.vite || 'latest'}
- Tailwind CSS ${packageJson.devDependencies.tailwindcss || 'latest'}

GitHub: ${packageJson.repository.url}`;
  },
  uptime: () => {
    const now = performance.now();
    const uptime = now / 1000;

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `Terminal has been running for ${hours}h ${minutes}m ${seconds}s`;
  },
};

// Command execution with alias resolution
export function executeCommand(input: string): { commandName: string; args: string[] } {
  const [commandName, ...args] = input.split(' ');
  const resolvedCommand = shortcutManager.getAlias(commandName);

  if (resolvedCommand.includes(' ')) {
    // Handle aliases that expand to multiple words
    const [newCommand, ...aliasArgs] = resolvedCommand.split(' ');
    return { commandName: newCommand, args: [...aliasArgs, ...args] };
  }

  return { commandName: resolvedCommand, args };
}

export { shortcutManager };
