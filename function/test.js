export async function onRequest(context) {
  return new Response(JSON.stringify({
    ok: true,
    path: new URL(context.request.url).pathname,
    time: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
