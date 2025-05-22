// SEO optimization utilities

export interface MetaData {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export class SEOOptimizer {
  private static readonly DEFAULT_TITLE = 'Terminal Velocity - Developer Portfolio';
  private static readonly DEFAULT_DESCRIPTION = 'An interactive terminal-style portfolio showcasing modern web development skills and projects.';
  private static readonly DEFAULT_KEYWORDS = ['developer', 'portfolio', 'terminal', 'web development', 'svelte', 'typescript'];

  static updateMetaTags(meta: Partial<MetaData>) {
    const title = meta.title || this.DEFAULT_TITLE;
    const description = meta.description || this.DEFAULT_DESCRIPTION;
    const keywords = meta.keywords || this.DEFAULT_KEYWORDS;
    const author = meta.author || 'Developer';
    const url = meta.url || window.location.href;
    const image = meta.image || '/icon.png';

    // Update document title
    document.title = title;

    // Standard meta tags
    this.setMetaTag('description', description);
    this.setMetaTag('keywords', keywords.join(', '));
    this.setMetaTag('author', author);
    this.setMetaTag('robots', 'index, follow');
    this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags
    this.setMetaProperty('og:title', title);
    this.setMetaProperty('og:description', description);
    this.setMetaProperty('og:type', meta.type || 'website');
    this.setMetaProperty('og:url', url);
    this.setMetaProperty('og:image', image);
    this.setMetaProperty('og:site_name', 'Terminal Velocity');

    // Twitter Card tags
    this.setMetaTag('twitter:card', 'summary_large_image');
    this.setMetaTag('twitter:title', title);
    this.setMetaTag('twitter:description', description);
    this.setMetaTag('twitter:image', image);

    // Article-specific tags
    if (meta.publishedTime) {
      this.setMetaProperty('article:published_time', meta.publishedTime);
    }
    if (meta.modifiedTime) {
      this.setMetaProperty('article:modified_time', meta.modifiedTime);
    }

    // Schema.org structured data
    this.updateStructuredData(meta);
  }

  private static setMetaTag(name: string, content: string) {
    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  private static setMetaProperty(property: string, content: string) {
    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  private static updateStructuredData(meta: Partial<MetaData>) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": meta.author || "Developer",
      "url": meta.url || window.location.href,
      "jobTitle": "Web Developer",
      "worksFor": {
        "@type": "Organization",
        "name": "Terminal Velocity"
      },
      "sameAs": [
        // Add social media URLs here
      ]
    };

    // Remove existing structured data
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  // Generate sitemap data
  static generateSitemapData(posts: any[], projects: any[]) {
    const baseUrl = window.location.origin;
    const urls = [
      {
        loc: baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        priority: '1.0',
        changefreq: 'daily'
      }
    ];

    // Add blog posts
    posts.forEach(post => {
      urls.push({
        loc: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.date,
        priority: '0.8',
        changefreq: 'monthly'
      });
    });

    // Add projects
    projects.forEach(project => {
      urls.push({
        loc: `${baseUrl}/projects/${project.slug}`,
        lastmod: project.created,
        priority: '0.7',
        changefreq: 'monthly'
      });
    });

    return urls;
  }

  // Generate RSS feed data
  static generateRSSData(posts: any[]) {
    const baseUrl = window.location.origin;
    const feedData = {
      title: 'Terminal Velocity Blog',
      description: 'Latest blog posts from Terminal Velocity developer portfolio',
      link: baseUrl,
      language: 'en-us',
      lastBuildDate: new Date().toUTCString(),
      items: posts.map(post => ({
        title: post.title,
        description: post.excerpt,
        link: `${baseUrl}/blog/${post.slug}`,
        guid: `${baseUrl}/blog/${post.slug}`,
        pubDate: new Date(post.date).toUTCString(),
        author: 'developer@terminalvelocity.dev'
      }))
    };

    return feedData;
  }

  // Preload critical resources
  static preloadCriticalResources() {
    const criticalFonts = [
      '/fonts/CascadiaCode.ttf'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/ttf';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical API endpoints
    const criticalAPIs = [
      '/api/about.json',
      '/api/blog.json',
      '/api/projects.json'
    ];

    criticalAPIs.forEach(api => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = api;
      document.head.appendChild(link);
    });
  }

  // Analytics tracking
  static trackPageView(page: string) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }

    // Custom analytics tracking
    if (window.analytics) {
      window.analytics.track('Page Viewed', {
        page,
        title: document.title,
        url: window.location.href
      });
    }
  }

  static trackCommand(command: string, args: string[] = []) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'command_executed', {
        command_name: command,
        command_args: args.join(' ')
      });
    }

    if (window.analytics) {
      window.analytics.track('Command Executed', {
        command,
        args: args.join(' ')
      });
    }
  }
}