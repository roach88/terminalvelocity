import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const contentDir = './content';
const outputDir = './public/api';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper function to create slug from filename
function createSlug(filename) {
  return filename.replace(/\.md$/, '');
}

// Helper function to process markdown content
async function processMarkdown(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  const html = await marked(content);
  return { frontmatter: data, content: html };
}

// Process blog posts
async function processBlogPosts() {
  const blogDir = path.join(contentDir, 'blog');
  if (!fs.existsSync(blogDir)) {
    console.log('No blog directory found, skipping blog posts');
    return;
  }

  const blogFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  const posts = [];

  for (const file of blogFiles) {
    const filePath = path.join(blogDir, file);
    const slug = createSlug(file);
    const { frontmatter, content } = await processMarkdown(filePath);

    const post = {
      slug,
      title: frontmatter.title || 'Untitled',
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      excerpt: frontmatter.excerpt || '',
      tags: frontmatter.tags || [],
      published: frontmatter.published !== false,
      content
    };

    posts.push(post);

    // Create individual post file
    const postDir = path.join(outputDir, 'blog');
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(postDir, `${slug}.json`),
      JSON.stringify(post, null, 2)
    );
  }

  // Sort posts by date (newest first) and filter published
  const publishedPosts = posts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write blog index
  fs.writeFileSync(
    path.join(outputDir, 'blog.json'),
    JSON.stringify(publishedPosts, null, 2)
  );

  console.log(`Processed ${publishedPosts.length} blog posts`);
}

// Process projects
async function processProjects() {
  const projectsDir = path.join(contentDir, 'projects');
  if (!fs.existsSync(projectsDir)) {
    console.log('No projects directory found, skipping projects');
    return;
  }

  const projectFiles = fs.readdirSync(projectsDir).filter(file => file.endsWith('.md'));
  const projects = [];

  for (const file of projectFiles) {
    const filePath = path.join(projectsDir, file);
    const slug = createSlug(file);
    const { frontmatter, content } = await processMarkdown(filePath);

    const project = {
      slug,
      title: frontmatter.title || 'Untitled Project',
      description: frontmatter.description || '',
      tech: frontmatter.tech || [],
      status: frontmatter.status || 'active',
      featured: frontmatter.featured || false,
      repo: frontmatter.repo || null,
      live: frontmatter.live || null,
      created: frontmatter.created || new Date().toISOString().split('T')[0],
      content
    };

    projects.push(project);

    // Create individual project file
    const projectDir = path.join(outputDir, 'projects');
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(projectDir, `${slug}.json`),
      JSON.stringify(project, null, 2)
    );
  }

  // Sort projects (featured first, then by creation date)
  projects.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.created) - new Date(a.created);
  });

  // Write projects index
  fs.writeFileSync(
    path.join(outputDir, 'projects.json'),
    JSON.stringify(projects, null, 2)
  );

  console.log(`Processed ${projects.length} projects`);
}

// Process about page
async function processAbout() {
  const aboutPath = path.join(contentDir, 'about.md');
  if (!fs.existsSync(aboutPath)) {
    console.log('No about.md found, skipping about page');
    return;
  }

  const { frontmatter, content } = await processMarkdown(aboutPath);

  const about = {
    title: frontmatter.title || 'About',
    updated: frontmatter.updated || new Date().toISOString().split('T')[0],
    content
  };

  fs.writeFileSync(
    path.join(outputDir, 'about.json'),
    JSON.stringify(about, null, 2)
  );

  console.log('Processed about page');
}

// Main build function
async function buildContent() {
  console.log('Building content...');
  
  try {
    await processBlogPosts();
    await processProjects();
    await processAbout();
    
    console.log('Content build completed successfully!');
  } catch (error) {
    console.error('Content build failed:', error);
    process.exit(1);
  }
}

buildContent();