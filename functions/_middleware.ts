// Cloudflare Pages Functions middleware for enhanced functionality

export async function onRequest(context: any) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Add security headers
  const response = await next();
  
  // Clone response to modify headers
  const newResponse = new Response(response.body, response);
  
  // Security headers
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Performance hint
  newResponse.headers.set('Server-Timing', 'cf-cache;desc="Cloudflare Cache"');
  
  return newResponse;
}