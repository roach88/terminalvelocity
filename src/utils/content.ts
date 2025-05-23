import matter from 'gray-matter';
import { marked } from 'marked';
import { PerformanceOptimizer } from './performance';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  content: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  status: string;
  featured: boolean;
  repo?: string;
  live?: string;
  created: string;
  content: string;
}

export interface AboutPage {
  title: string;
  updated: string;
  content: string;
}

// These functions will be used during build time to process markdown files
export async function processMarkdown(markdownContent: string) {
  const { data, content } = matter(markdownContent);
  const html = await marked(content);
  return { frontmatter: data, content: html };
}

// Runtime functions to fetch processed content
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const cacheKey = 'blog-posts';
  const cached = PerformanceOptimizer.getCachedContent(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('/api/blog.json');
    if (!response.ok) {
      console.error(`Failed to fetch blog posts: HTTP ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    PerformanceOptimizer.cacheContent(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error: Unable to reach /api/blog.json');
    }
    return [];
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const cacheKey = `blog-post-${slug}`;
  const cached = PerformanceOptimizer.getCachedContent(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`/api/blog/${slug}.json`);
    if (!response.ok) {
      console.error(`Failed to fetch blog post '${slug}': HTTP ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    PerformanceOptimizer.cacheContent(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch blog post '${slug}':`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error: Unable to reach /api/blog/${slug}.json`);
    }
    return null;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const cacheKey = 'projects';
  const cached = PerformanceOptimizer.getCachedContent(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('/api/projects.json');
    if (!response.ok) {
      console.error(`Failed to fetch projects: HTTP ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    PerformanceOptimizer.cacheContent(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error: Unable to reach /api/projects.json');
    }
    return [];
  }
}

export async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects/${slug}.json`);
    if (!response.ok) {
      console.error(`Failed to fetch project '${slug}': HTTP ${response.status} ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch project '${slug}':`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error: Unable to reach /api/projects/${slug}.json`);
    }
    return null;
  }
}

export async function fetchAbout(): Promise<AboutPage | null> {
  const cacheKey = 'about-page';
  const cached = PerformanceOptimizer.getCachedContent(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('/api/about.json');
    if (!response.ok) {
      console.error(`Failed to fetch about page: HTTP ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    PerformanceOptimizer.cacheContent(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Failed to fetch about page:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error: Unable to reach /api/about.json');
    }
    return null;
  }
}

// Search functionality
export async function searchContent(query: string) {
  try {
    const [posts, projects] = await Promise.all([
      fetchBlogPosts(),
      fetchProjects()
    ]);

    const { SearchIndex } = await import('./search');
    const searchIndex = new SearchIndex(posts, projects);
    return searchIndex.search(query);
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}