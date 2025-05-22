import fs from 'fs';
import path from 'path';

// Read the generated content
const blogData = JSON.parse(fs.readFileSync('./public/api/blog.json', 'utf8'));
const projectsData = JSON.parse(fs.readFileSync('./public/api/projects.json', 'utf8'));

const baseUrl = process.env.CF_PAGES_URL || process.env.DEPLOY_URL || 'https://terminalvelocity.dev';

// Generate sitemap.xml
function generateSitemap() {
  const urls = [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      priority: '1.0',
      changefreq: 'daily'
    }
  ];

  // Add blog posts
  blogData.forEach(post => {
    urls.push({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.date,
      priority: '0.8',
      changefreq: 'monthly'
    });
  });

  // Add projects
  projectsData.forEach(project => {
    urls.push({
      loc: `${baseUrl}/projects/${project.slug}`,
      lastmod: project.created,
      priority: '0.7',
      changefreq: 'monthly'
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
    <changefreq>${url.changefreq}</changefreq>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log('Generated sitemap.xml');
}

// Generate robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

# Block admin and API endpoints
Disallow: /admin/
Disallow: /api/`;

  fs.writeFileSync('./public/robots.txt', robots);
  console.log('Generated robots.txt');
}

// Generate RSS feed
function generateRSS() {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Terminal Velocity Blog</title>
    <description>Latest blog posts from Terminal Velocity developer portfolio</description>
    <link>${baseUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    
${blogData.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category><![CDATA[${post.tags.join(', ')}]]></category>
    </item>`).join('\n')}
  </channel>
</rss>`;

  fs.writeFileSync('./public/feed.xml', rss);
  console.log('Generated feed.xml');
}

// Generate manifest.json for PWA
function generateManifest() {
  const manifest = {
    name: "Terminal Velocity",
    short_name: "Terminal",
    description: "An interactive terminal-style developer portfolio",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#00ff00",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  fs.writeFileSync('./public/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Generated manifest.json');
}

// Generate meta.json for dynamic meta tags
function generateMeta() {
  const meta = {
    default: {
      title: "Terminal Velocity - Developer Portfolio",
      description: "An interactive terminal-style portfolio showcasing modern web development skills and projects.",
      keywords: ["developer", "portfolio", "terminal", "web development", "svelte", "typescript"],
      author: "Developer",
      image: "/icon.png"
    },
    pages: {
      blog: blogData.reduce((acc, post) => {
        acc[post.slug] = {
          title: `${post.title} - Terminal Velocity`,
          description: post.excerpt,
          keywords: [...post.tags, "blog", "development"],
          publishedTime: post.date,
          type: "article"
        };
        return acc;
      }, {}),
      projects: projectsData.reduce((acc, project) => {
        acc[project.slug] = {
          title: `${project.title} - Terminal Velocity`,
          description: project.description,
          keywords: [...project.tech, "project", "development"],
          publishedTime: project.created,
          type: "article"
        };
        return acc;
      }, {})
    }
  };

  fs.writeFileSync('./public/api/meta.json', JSON.stringify(meta, null, 2));
  console.log('Generated meta.json');
}

// Run all generators
console.log('Generating SEO files...');
generateSitemap();
generateRobots();
generateRSS();
generateManifest();
generateMeta();
console.log('SEO files generated successfully!');