import packageJson from '../../package.json';
import themes from '../../themes.json';
import { history } from '../stores/history';
import { theme } from '../stores/theme';
import { fetchAbout, fetchBlogPosts, fetchBlogPost, fetchProjects, fetchProject } from './content';

const hostname = window.location.hostname;

export const commands: Record<string, (args: string[]) => Promise<string> | string> = {
  help: () => 'Available commands: ' + Object.keys(commands).join(', '),
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
███╗   ███╗██╗  ██╗████████╗████████╗███████╗██████╗
████╗ ████║██║  ██║╚══██╔══╝╚══██╔══╝╚════██║╚════██╗
██╔████╔██║███████║   ██║      ██║       ██╔╝ █████╔╝
██║╚██╔╝██║╚════██║   ██║      ██║      ██╔╝ ██╔═══╝
██║ ╚═╝ ██║     ██║   ██║      ██║      ██║  ███████╗
╚═╝     ╚═╝     ╚═╝   ╚═╝      ╚═╝      ╚═╝  ╚══════╝ v${packageJson.version}

Type 'help' to see list of available commands.
`,
  about: async () => {
    const aboutData = await fetchAbout();
    if (!aboutData) {
      return 'About information not available.';
    }
    return aboutData.content.replace(/<[^>]*>/g, '');
  },
  blog: async (args: string[]) => {
    if (args.length === 0) {
      const posts = await fetchBlogPosts();
      if (posts.length === 0) {
        return 'No blog posts available.';
      }
      return posts
        .map(post => `${post.date} - ${post.title}\n  ${post.excerpt}`)
        .join('\n\n');
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
    
    return `${post.title}\n${'='.repeat(post.title.length)}\n${post.date}\n\n${post.content.replace(/<[^>]*>/g, '')}`;
  },
  projects: async () => {
    const projects = await fetchProjects();
    if (projects.length === 0) {
      return 'No projects available.';
    }
    
    return projects
      .map(project => {
        const tech = project.tech.join(', ');
        const links = [];
        if (project.live) links.push(`Live: ${project.live}`);
        if (project.repo) links.push(`Repo: ${project.repo}`);
        const linksStr = links.length > 0 ? `\n  ${links.join(' | ')}` : '';
        
        return `${project.featured ? '⭐ ' : ''}${project.title}\n  ${project.description}\n  Tech: ${tech}${linksStr}`;
      })
      .join('\n\n');
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
    
    const tech = project.tech.join(', ');
    const links = [];
    if (project.live) links.push(`Live: ${project.live}`);
    if (project.repo) links.push(`Repo: ${project.repo}`);
    const linksStr = links.length > 0 ? `\n${links.join('\n')}` : '';
    
    return `${project.title}\n${'='.repeat(project.title.length)}\n\nStatus: ${project.status}\nTech: ${tech}${linksStr}\n\n${project.content.replace(/<[^>]*>/g, '')}`;
  },
  contact: () => {
    return `Get in touch:
Email: ${packageJson.author.email}
GitHub: ${packageJson.repository.url}
Portfolio: ${packageJson.author.url || 'https://terminalvelocity.dev'}`;
  },
};
