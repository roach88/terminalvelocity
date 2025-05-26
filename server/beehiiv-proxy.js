// Simple proxy server for Beehiiv API calls during development
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .dev.vars
try {
  const devVarsPath = resolve(process.cwd(), '.dev.vars');
  const devVars = readFileSync(devVarsPath, 'utf-8');
  
  // Parse the .dev.vars file
  devVars.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.warn('Could not load .dev.vars:', error.message);
}

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;
const BEEHIIV_BASE_URL = 'https://api.beehiiv.com/v2';

console.log('[Beehiiv Proxy] Credentials loaded:', {
  hasApiKey: !!BEEHIIV_API_KEY,
  hasPublicationId: !!BEEHIIV_PUBLICATION_ID
});

export async function beehiivProxy(req, res, next) {
  // Only handle /api/beehiiv/* routes
  if (!req.url.startsWith('/api/beehiiv/')) {
    return next();
  }

  console.log('[Beehiiv Proxy] Request:', req.method, req.url);

  // Check for API credentials
  if (!BEEHIIV_API_KEY || !BEEHIIV_PUBLICATION_ID) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Beehiiv API credentials not configured' }));
    return;
  }

  try {
    let beehiivUrl;
    let method = 'GET';
    let body;

    // Route handling
    if (req.url.startsWith('/api/beehiiv/posts')) {
      // List posts
      const url = new URL(req.url, `http://localhost`);
      const limit = url.searchParams.get('limit') || '20';
      const page = url.searchParams.get('page') || '';
      
      beehiivUrl = `${BEEHIIV_BASE_URL}/publications/${BEEHIIV_PUBLICATION_ID}/posts?limit=${limit}&status=published`;
      if (page) {
        beehiivUrl += `&page=${page}`;
      }
    } else if (req.url.match(/^\/api\/beehiiv\/post\/([^\/]+)$/)) {
      // Get single post
      const postId = req.url.match(/^\/api\/beehiiv\/post\/([^\/]+)$/)[1];
      // Add expand=content to get the full post content
      beehiivUrl = `${BEEHIIV_BASE_URL}/publications/${BEEHIIV_PUBLICATION_ID}/posts/${postId}?expand=content`;
    } else if (req.url.startsWith('/api/beehiiv/subscribe') && req.method === 'POST') {
      // Subscribe
      method = 'POST';
      body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const { email } = JSON.parse(body);
      
      beehiivUrl = `${BEEHIIV_BASE_URL}/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`;
      body = JSON.stringify({
        email,
        reactivate_existing: true,
        utm_source: 'terminal',
        utm_medium: 'organic'
      });
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    // Make the API request
    console.log('[Beehiiv Proxy] Calling API:', beehiivUrl);
    const response = await fetch(beehiivUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? body : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.statusText}`);
    }
    
    // Debug log for single post requests
    if (req.url.includes('/api/beehiiv/post/')) {
      console.log('[Beehiiv Proxy] Response has content:', 'content' in (data.data || data));
    }

    // Send response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(JSON.stringify(data));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message || 'Failed to fetch from Beehiiv' }));
  }
}