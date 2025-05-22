import matter from 'gray-matter';
import { marked } from 'marked';

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
  try {
    const response = await fetch('/api/blog.json');
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/api/blog/${slug}.json`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return null;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch('/api/projects.json');
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects/${slug}.json`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch project ${slug}:`, error);
    return null;
  }
}

export async function fetchAbout(): Promise<AboutPage | null> {
  try {
    const response = await fetch('/api/about.json');
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to fetch about page:', error);
    return null;
  }
}