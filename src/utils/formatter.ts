export class TerminalFormatter {
  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  static formatBlogPost(post: { title: string; date: string; content: string; tags?: string[] }): string {
    const separator = '='.repeat(Math.min(post.title.length, 60));
    const tagsLine = post.tags && post.tags.length > 0 ? `\nTags: ${post.tags.join(', ')}\n` : '\n';
    
    return `${post.title}\n${separator}\n${post.date}${tagsLine}\n${this.stripHtml(post.content)}`;
  }

  static formatProject(project: { 
    title: string; 
    description: string; 
    tech: string[]; 
    status: string; 
    repo?: string; 
    live?: string; 
    content: string; 
  }): string {
    const separator = '='.repeat(Math.min(project.title.length, 60));
    const tech = project.tech.join(', ');
    
    const links = [];
    if (project.live) links.push(`🌐 Live: ${project.live}`);
    if (project.repo) links.push(`📁 Repo: ${project.repo}`);
    const linksSection = links.length > 0 ? `\n\n${links.join('\n')}` : '';
    
    return `${project.title}\n${separator}\n\n${project.description}\n\nStatus: ${project.status}\nTech: ${tech}${linksSection}\n\n${this.stripHtml(project.content)}`;
  }

  static formatProjectList(projects: Array<{ 
    title: string; 
    description: string; 
    tech: string[]; 
    featured: boolean; 
    repo?: string; 
    live?: string; 
  }>): string {
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
  }

  static formatBlogList(posts: Array<{ 
    title: string; 
    date: string; 
    excerpt: string; 
    tags: string[]; 
  }>): string {
    return posts
      .map(post => `${post.date} - ${post.title}\n  ${post.excerpt}`)
      .join('\n\n');
  }

  static formatSearchResults(results: Array<{ 
    type: string; 
    title: string; 
    excerpt: string; 
    slug: string; 
  }>): string {
    if (results.length === 0) {
      return 'No results found.';
    }

    const grouped = results.reduce((acc, result) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, typeof results>);

    const sections = [];

    if (grouped.blog) {
      sections.push('BLOG POSTS:\n' + grouped.blog
        .map(r => `  📝 ${r.title} (${r.slug})\n     ${r.excerpt}`)
        .join('\n\n'));
    }

    if (grouped.project) {
      sections.push('PROJECTS:\n' + grouped.project
        .map(r => `  🚀 ${r.title} (${r.slug})\n     ${r.excerpt}`)
        .join('\n\n'));
    }

    return sections.join('\n\n');
  }

  static wrapText(text: string, maxWidth: number = 80): string {
    const lines = text.split('\n');
    const wrappedLines = [];

    for (const line of lines) {
      if (line.length <= maxWidth) {
        wrappedLines.push(line);
        continue;
      }

      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        if ((currentLine + word).length <= maxWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            // Word is longer than maxWidth, split it
            wrappedLines.push(word);
          }
        }
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    }

    return wrappedLines.join('\n');
  }

  static paginate(content: string, linesPerPage: number = 20): string[] {
    const lines = content.split('\n');
    const pages = [];

    for (let i = 0; i < lines.length; i += linesPerPage) {
      const page = lines.slice(i, i + linesPerPage).join('\n');
      pages.push(page);
    }

    return pages.length > 0 ? pages : [''];
  }
}