# Beehiiv Integration Setup

This terminal portfolio integrates with Beehiiv for blog content management. The integration uses Cloudflare Functions to proxy API requests server-side, avoiding CORS issues.

## Architecture

The Beehiiv integration follows a server-side proxy pattern:

1. **Client-side commands** (`blog`, `read`, `search`, `subscribe`) make requests to local API endpoints
2. **Cloudflare Functions** (`/api/beehiiv/*`) handle the actual Beehiiv API calls server-side
3. **Beehiiv API client** (`src/utils/beehiiv.ts`) manages caching and formatting

## Setup Instructions

### 1. Get Beehiiv API Credentials

1. Log in to your [Beehiiv account](https://app.beehiiv.com)
2. Go to Settings → Integrations → API
3. Create a new API key with read permissions
4. Copy your API key and Publication ID

### 2. Local Development

For local development with Cloudflare Pages:

1. Create a `.dev.vars` file in the project root:
   ```
   BEEHIIV_API_KEY=your_api_key_here
   BEEHIIV_PUBLICATION_ID=your_publication_id_here
   ```

2. The development server will automatically load these variables for Cloudflare Functions

### 3. Production Deployment (Cloudflare Pages)

1. In your Cloudflare Pages project settings
2. Go to Settings → Environment variables
3. Add the following variables:
   - `BEEHIIV_API_KEY`: Your Beehiiv API key
   - `BEEHIIV_PUBLICATION_ID`: Your Beehiiv publication ID

## Available Commands

- `blog` - List recent blog posts
- `blog [number]` - List specific number of posts
- `read [post-id]` - Read a specific blog post
- `search [query]` - Search blog posts
- `subscribe [email]` - Subscribe to the newsletter

## File Structure

```
functions/
├── api/
│   └── beehiiv/
│       ├── posts.ts         # List posts endpoint
│       ├── post/
│       │   └── [id].ts      # Get single post endpoint
│       └── subscribe.ts     # Subscribe endpoint
src/
└── utils/
    └── beehiiv.ts          # Client-side API wrapper
```

## Troubleshooting

### "Failed to fetch" Error

This usually means:
1. Environment variables are not set (check `.dev.vars` for local dev)
2. API credentials are invalid
3. Beehiiv API is down

### CORS Issues

The integration uses Cloudflare Functions specifically to avoid CORS issues. If you're seeing CORS errors:
1. Ensure you're using the local API endpoints (`/api/beehiiv/*`)
2. Check that Cloudflare Functions are running (part of `yarn dev`)
3. Verify the `Access-Control-Allow-Origin` headers in the function responses

### Caching

The client caches API responses for 5 minutes to improve performance. To clear the cache:
- Run `beehiivAPI.clearCache()` in the browser console
- Or reload the page

## Security Notes

- Never commit `.dev.vars` or expose API keys in client-side code
- All API keys should only be used in Cloudflare Functions (server-side)
- The client-side code only knows about the local API endpoints
