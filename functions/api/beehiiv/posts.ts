export async function onRequest(context: any) {
  const { env, request } = context;
  
  // Get query parameters
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') || '20';
  const page = url.searchParams.get('page') || '';
  
  // Check for API credentials
  const apiKey = env.BEEHIIV_API_KEY;
  const publicationId = env.BEEHIIV_PUBLICATION_ID;
  
  if (!apiKey || !publicationId) {
    return new Response(JSON.stringify({ 
      error: 'Beehiiv API credentials not configured' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // Build API URL
    let apiUrl = `https://api.beehiiv.com/v2/publications/${publicationId}/posts?limit=${limit}&status=published`;
    if (page) {
      apiUrl += `&page=${page}`;
    }
    
    // Fetch from Beehiiv API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Beehiiv API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch posts' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}