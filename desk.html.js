/* ============================================================
   STMDESKLY · OG TAG REWRITER
   Runs on Cloudflare Pages as a Function.
   Intercepts requests to desk.html, fetches the user's data,
   and rewrites the OG tags so link previews show that user's
   avatar and details instead of the STMDeskly defaults.
   ============================================================ */

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // Only rewrite desk.html requests
  if (!url.pathname.endsWith('/desk.html')) {
    return next();
  }

  const username = url.searchParams.get('u');
  if (!username) {
    return next();
  }

  // Get the original HTML from Pages
  const response = await next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // Fetch the user's Desk data from Supabase
  let desk = null;
  try {
    const supabaseUrl = 'https://jluqowoqdvnjljhvnasf.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdXFvd29xZHZuamxqaHZuYXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDM4MzcsImV4cCI6MjEwNjgxOTgzN30.DPx04-jG9Biklo-PTFj5tlxwRhRFp1hOpJ4oC8meNfQ';

    const res = await fetch(
      supabaseUrl + '/rest/v1/desks?username=eq.' +
        encodeURIComponent(username) +
        '&select=name,role,tagline,avatar_url,about&limit=1',
      {
        headers: {
          'apikey': anonKey,
          'Authorization': 'Bearer ' + anonKey
        }
      }
    );

    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length) {
        desk = rows[0];
      }
    }
  } catch (e) {
    // If fetch fails, fall through and serve the original HTML
    return new Response(html, response);
  }

  if (!desk) {
    return new Response(html, response);
  }

  // Build the OG values
  const siteUrl = 'https://stmdeskly.pages.dev';
  const profileUrl = siteUrl + '/desk.html?u=' + encodeURIComponent(username);

  const name = desk.name || 'Desk on STMDeskly';
  const role = desk.role || '';
  const tagline = desk.tagline || '';

  // Description: combine role + tagline or about, trimmed
  let description = tagline;
  if (!description && role) description = role;
  if (!description && desk.about) description = desk.about.slice(0, 140);
  if (!description) description = name + ' is on STMDeskly.';

  // Title: "Name — Role" or just "Name"
  const title = role ? (name + ' — ' + role) : name;

  // Image: their avatar if they have one, else the STMDeskly OG image
  const image = desk.avatar_url || (siteUrl + '/og-image.png');

  // Escape HTML attribute values
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const titleEsc = esc(title);
  const descEsc = esc(description);
  const imageEsc = esc(image);
  const urlEsc = esc(profileUrl);

  // Replace OG tags in the HTML
  html = html
    .replace(/<meta property="og:title" content="[^"]*"[^>]*>/i, '<meta property="og:title" content="' + titleEsc + '">')
    .replace(/<meta property="og:description" content="[^"]*"[^>]*>/i, '<meta property="og:description" content="' + descEsc + '">')
    .replace(/<meta property="og:image" content="[^"]*"[^>]*>/i, '<meta property="og:image" content="' + imageEsc + '">')
    .replace(/<meta property="og:url" content="[^"]*"[^>]*>/i, '<meta property="og:url" content="' + urlEsc + '">')
    .replace(/<meta name="twitter:title" content="[^"]*"[^>]*>/i, '<meta name="twitter:title" content="' + titleEsc + '">')
    .replace(/<meta name="twitter:description" content="[^"]*"[^>]*>/i, '<meta name="twitter:description" content="' + descEsc + '">')
    .replace(/<meta name="twitter:image" content="[^"]*"[^>]*>/i, '<meta name="twitter:image" content="' + imageEsc + '">');

  // Also set the <title> tag for good measure
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>' + titleEsc + ' | STMDeskly</title>');

  // Return the modified HTML with same headers
  return new Response(html, {
    status: response.status,
    headers: response.headers
  });
}
