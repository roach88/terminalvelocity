# Beehiiv Integration Setup

This guide will help you connect your Beehiiv newsletter to your terminal portfolio.

## Prerequisites

1. A Beehiiv account with at least one publication
2. API access (available on paid Beehiiv plans)

## Setup Steps

### 1. Get Your Beehiiv API Credentials

1. Log in to your Beehiiv account
2. Go to Settings → Integrations → API
3. Create a new API key with the following permissions:
   - `publications:read` - To fetch your publication details
   - `posts:read` - To fetch newsletter posts
   - `subscriptions:write` - To add new subscribers

4. Copy your API key and Publication ID

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   VITE_BEEHIIV_API_KEY=your_api_key_here
   VITE_BEEHIIV_PUBLICATION_ID=your_publication_id_here
   ```

### 3. Test the Integration

1. Start the development server:
   ```bash
   yarn dev
   ```

2. Test the commands:
   - `blog` - Should list your recent newsletter posts
   - `read <post-id>` - Should display a specific post
   - `search <query>` - Should search through your posts
   - `subscribe <email>` - Should add a new subscriber

## Available Commands

### blog
Lists your 20 most recent newsletter posts with titles, subtitles, and publish dates.

### read <post-id>
Displays the full content of a specific newsletter post. The post ID is shown in the blog list.

### search <query>
Searches through all your newsletter posts for the given query. Searches in titles, subtitles, and content.

### subscribe <email>
Adds a new subscriber to your Beehiiv newsletter. They'll receive a welcome email and confirmation.

## Troubleshooting

### "Newsletter integration not configured"
- Make sure your `.env` file exists and contains valid credentials
- Restart the development server after adding credentials
- Check that your API key has the required permissions

### "Error loading blog posts"
- Verify your Publication ID is correct
- Ensure your API key is valid and not expired
- Check your Beehiiv plan includes API access

### Posts not showing up
- Make sure your posts are published (not draft)
- The integration only fetches published posts
- Check the Beehiiv dashboard to confirm posts are live

## API Rate Limits

The integration includes built-in caching to minimize API calls:
- Post lists are cached for 5 minutes
- Individual posts are cached for 5 minutes
- Search results are generated from cached data when possible

## Customization

You can customize the display in `src/utils/commands.ts`:
- Change the number of posts shown in the blog list
- Modify the HTML templates for post display
- Add additional post metadata to the display
- Customize the subscribe success message

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Consider using environment variables in your deployment platform
- The API key is only used server-side and never exposed to the client