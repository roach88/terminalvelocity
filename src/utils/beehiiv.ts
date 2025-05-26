// Beehiiv API integration for fetching newsletter content

interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  status: string;
  created: number;  // Unix timestamp
  created_at?: string;  // For backwards compatibility
  publish_date?: number;  // Unix timestamp
  published_at?: string;
  displayed_date?: string | null;
  web_url: string;
  content_html?: string;
  content_text?: string;
  content?: {
    free?: {
      web?: string;
      email?: string;
      rss?: string;
    };
    premium?: {
      web?: string;
      email?: string;
    };
  };
  thumbnail_url?: string;
  authors?: Array<string | {
    name: string;
    email?: string;
  }>;
  stats?: {
    unique_opens?: number;
    total_opens?: number;
    clicks?: number;
  };
}

interface BeehiivResponse {
  data: BeehiivPost[];
  next_page?: string;
  total_results: number;
}

class BeehiivAPI {
  // Cache for API responses
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // API credentials are now handled server-side in Cloudflare Functions
  }

  private async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Use our Cloudflare Functions API endpoints
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }

  async getPosts(limit = 10, page?: string): Promise<BeehiivResponse> {
    // Use our Cloudflare Function endpoint
    let url = `/api/beehiiv/posts?limit=${limit}`;
    if (page) {
      url += `&page=${page}`;
    }

    return await this.fetchWithCache(url);
  }

  async getPost(postId: string): Promise<BeehiivPost> {
    // Use our Cloudflare Function endpoint
    const url = `/api/beehiiv/post/${postId}`;
    const response = await this.fetchWithCache(url);
    return response.data || response;
  }

  async searchPosts(query: string): Promise<BeehiivPost[]> {
    // For now, we'll fetch all posts and filter client-side
    // Beehiiv API doesn't have built-in search yet
    const allPosts: BeehiivPost[] = [];
    let page: string | undefined;
    
    do {
      const response = await this.getPosts(50, page);
      allPosts.push(...response.data);
      page = response.next_page;
    } while (page && allPosts.length < 200); // Limit to 200 posts for performance

    const searchLower = query.toLowerCase();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      (post.subtitle && post.subtitle.toLowerCase().includes(searchLower)) ||
      (post.content_text && post.content_text.toLowerCase().includes(searchLower))
    );
  }

  async subscribeEmail(email: string): Promise<boolean> {
    // Use our Cloudflare Function endpoint
    const url = `/api/beehiiv/subscribe`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Subscription failed');
      }

      return true;
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }

  formatPostDate(dateValue: string | number): string {
    // Handle Unix timestamp (seconds since epoch)
    const timestamp = typeof dateValue === 'number' ? dateValue * 1000 : 
                     (!isNaN(Number(dateValue)) ? Number(dateValue) * 1000 : dateValue);
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date unavailable';
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export const beehiivAPI = new BeehiivAPI();
export type { BeehiivPost, BeehiivResponse };