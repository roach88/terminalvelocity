import type { BlogPost, Project } from './content';

export interface SearchResult {
  type: 'blog' | 'project';
  slug: string;
  title: string;
  excerpt: string;
  relevance: number;
}

export class SearchIndex {
  private posts: BlogPost[] = [];
  private projects: Project[] = [];

  constructor(posts: BlogPost[], projects: Project[]) {
    this.posts = posts;
    this.projects = projects;
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
    const results: SearchResult[] = [];

    // Search blog posts
    for (const post of this.posts) {
      const relevance = this.calculateRelevance(searchTerms, {
        title: post.title,
        content: post.content,
        tags: post.tags.join(' '),
        excerpt: post.excerpt
      });

      if (relevance > 0) {
        results.push({
          type: 'blog',
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || this.extractExcerpt(post.content),
          relevance
        });
      }
    }

    // Search projects
    for (const project of this.projects) {
      const relevance = this.calculateRelevance(searchTerms, {
        title: project.title,
        content: project.content,
        description: project.description,
        tech: project.tech.join(' ')
      });

      if (relevance > 0) {
        results.push({
          type: 'project',
          slug: project.slug,
          title: project.title,
          excerpt: project.description,
          relevance
        });
      }
    }

    // Sort by relevance (highest first)
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  private calculateRelevance(searchTerms: string[], content: Record<string, string>): number {
    let score = 0;
    const allText = Object.values(content).join(' ').toLowerCase();

    for (const term of searchTerms) {
      // Title matches get highest score
      if (content.title?.toLowerCase().includes(term)) {
        score += 10;
      }
      
      // Tag/tech matches get high score
      if (content.tags?.toLowerCase().includes(term) || content.tech?.toLowerCase().includes(term)) {
        score += 5;
      }
      
      // Description/excerpt matches get medium score
      if (content.description?.toLowerCase().includes(term) || content.excerpt?.toLowerCase().includes(term)) {
        score += 3;
      }
      
      // Content matches get base score
      if (allText.includes(term)) {
        score += 1;
      }
    }

    return score;
  }

  private extractExcerpt(content: string, maxLength: number = 150): string {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // Find last complete word within limit
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }
}