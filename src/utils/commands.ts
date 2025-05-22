import packageJson from '../../package.json';
import themes from '../../themes.json';
import { history } from '../stores/history';
import { theme } from '../stores/theme';
import { fetchAbout, fetchBlogPosts, fetchBlogPost, fetchProjects, fetchProject, searchContent } from './content';
import { TerminalFormatter } from './formatter';

const hostname = window.location.hostname;

export const commands: Record<string, (args: string[]) => Promise<string> | string> = {
  help: () => {
    const commandGroups = {
      'Content': ['about', 'blog', 'read', 'projects', 'project', 'contact'],
      'Discovery': ['search', 'tags', 'recent', 'featured', 'stats'],
      'System': ['help', 'clear', 'theme', 'hostname', 'whoami', 'date'],
      'Fun': ['weather', 'curl', 'banner', 'sudo', 'vi', 'vim', 'emacs']
    };

    let helpText = 'Available commands:\n\n';
    
    for (const [group, cmds] of Object.entries(commandGroups)) {
      helpText += `${group}:\n`;
      helpText += cmds.map(cmd => `  ${cmd}`).join('\n');
      helpText += '\n\n';
    }
    
    helpText += 'Tips:\n';
    helpText += '  - Use Tab for autocompletion\n';
    helpText += '  - Use ↑/↓ arrows for command history\n';
    helpText += '  - Try "search <term>" to find content\n';
    helpText += '  - Use "stats" to see portfolio overview';
    
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
  theme: (args: string[]) => {
    const usage = `Usage: theme [args].
    [args]:
      ls: list all available themes
      set: set theme to [theme]

    [Examples]:
      theme ls
      theme set gruvboxdark
    `;
    if (args.length === 0) {
      return usage;
    }

    switch (args[0]) {
      case 'ls': {
        let result = themes.map((t) => t.name.toLowerCase()).join(', ');
        result += `You can preview all these themes here: ${packageJson.repository.url}/tree/master/docs/themes`;

        return result;
      }

      case 'set': {
        if (args.length !== 2) {
          return usage;
        }

        const selectedTheme = args[1];
        const t = themes.find((t) => t.name.toLowerCase() === selectedTheme);

        if (!t) {
          return `Theme '${selectedTheme}' not found. Try 'theme ls' to see all available themes.`;
        }

        theme.set(t);

        return `Theme set to ${selectedTheme}`;
      }

      default: {
        return usage;
      }
    }
  },
  repo: () => {
    window.open(packageJson.repository.url, '_blank');

    return 'Opening repository...';
  },
  clear: () => {
    history.set([]);

    return '';
  },
  email: () => {
    window.open(`mailto:${packageJson.author.email}`);

    return `Opening mailto:${packageJson.author.email}...`;
  },
  donate: () => {
    window.open(packageJson.funding.url, '_blank');

    return 'Opening donation url...';
  },
  weather: async (args: string[]) => {
    const city = args.join('+');

    if (!city) {
      return 'Usage: weather [city]. Example: weather Brussels';
    }

    const weather = await fetch(`https://wttr.in/${city}?ATm`);

    return weather.text();
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
    if (args.length === 0) {
      const posts = await fetchBlogPosts();
      if (posts.length === 0) {
        return 'No blog posts available.';
      }
      return TerminalFormatter.formatBlogList(posts);
    }
    
    const subcommand = args[0];
    if (subcommand === 'list') {
      const posts = await fetchBlogPosts();
      return posts.map(post => `${post.date} - ${post.title}`).join('\n');
    }
    
    return 'Usage: blog [list] or read <post-slug>';
  },
  read: async (args: string[]) => {
    if (args.length === 0) {
      return 'Usage: read <post-slug>';
    }
    
    const slug = args[0];
    const post = await fetchBlogPost(slug);
    if (!post) {
      return `Blog post '${slug}' not found.`;
    }
    
    return TerminalFormatter.formatBlogPost(post);
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
  search: async (args: string[]) => {
    if (args.length === 0) {
      return 'Usage: search <query>\nExample: search "terminal portfolio"';
    }
    
    const query = args.join(' ');
    const results = await searchContent(query);
    
    if (results.length === 0) {
      return `No results found for "${query}".`;
    }
    
    return `Search results for "${query}":\n\n${TerminalFormatter.formatSearchResults(results)}`;
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
};
