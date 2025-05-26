// Beehiiv API integration for fetching newsletter content

interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  status: string;
  created_at: string;
  published_at?: string;
  web_url: string;
  content_html?: string;
  content_text?: string;
  thumbnail_url?: string;
  authors?: Array<{
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
  private apiKey: string;
  private publicationId: string;
  private baseUrl = 'https://api.beehiiv.com/v2';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // These will be set from environment variables
    this.apiKey = import.meta.env.VITE_BEEHIIV_API_KEY || '';
    this.publicationId = import.meta.env.VITE_BEEHIIV_PUBLICATION_ID || '';
  }

  private async fetchWithCache(url: string): Promise<any> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }

  async getPosts(limit = 10, page?: string): Promise<BeehiivResponse> {
    if (!this.apiKey || !this.publicationId) {
      throw new Error('Beehiiv API credentials not configured');
    }

    let url = `${this.baseUrl}/publications/${this.publicationId}/posts?limit=${limit}&status=published`;
    if (page) {
      url += `&page=${page}`;
    }

    return await this.fetchWithCache(url);
  }

  async getPost(postId: string): Promise<BeehiivPost> {
    if (!this.apiKey) {
      throw new Error('Beehiiv API credentials not configured');
    }

    const url = `${this.baseUrl}/posts/${postId}`;
    const response = await this.fetchWithCache(url);
    return response.data;
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
    if (!this.apiKey || !this.publicationId) {
      throw new Error('Beehiiv API credentials not configured');
    }

    const url = `${this.baseUrl}/publications/${this.publicationId}/subscriptions`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Subscription error:', error);
      return false;
    }
  }

  formatPostDate(dateString: string): string {
    const date = new Date(dateString);
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