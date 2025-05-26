export async function onRequest(context: any) {
  const { env, params } = context;
  const postId = params.id;
  
  // Check for API credentials
  const apiKey = env.BEEHIIV_API_KEY;
  
  if (!apiKey) {
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
    // Fetch from Beehiiv API
    const response = await fetch(`https://api.beehiiv.com/v2/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Post not found: ${response.statusText}`);
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
      error: error.message || 'Failed to fetch post' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}