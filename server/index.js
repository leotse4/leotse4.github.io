import http from 'node:http';
import { extractRecipe, fetchPage, validateUrl } from './importer.js';

const origins = new Set((process.env.ALLOWED_ORIGINS || 'https://leotse4.github.io').split(',').map(s => s.trim()));
const rates = new Map(), cache = new Map();
const server = http.createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  const send = (status, data) => { response.writeHead(status); response.end(JSON.stringify(data)); };
  if (request.url === '/health' && request.method === 'GET') { send(200, { ok: true }); return; }
  const origin = request.headers.origin;
  if (origin && !origins.has(origin)) { send(403, { error: 'This website is not allowed to use the importer.' }); return; }
  if (origin) { response.setHeader('Access-Control-Allow-Origin', origin); response.setHeader('Vary', 'Origin'); }
  if (request.url !== '/api/import') { send(404, { error: 'Not found.' }); return; }
  if (request.method === 'OPTIONS') { response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); send(204); return; }
  if (request.method !== 'POST') { send(405, { error: 'Use POST.' }); return; }
  // Trust the direct peer only: spoofed forwarded headers never bypass the limit.
  // A shared reverse proxy may share this conservative process-local quota.
  const ip = request.socket.remoteAddress;
  const now = Date.now();
  for (const [key, value] of rates) if (value.until < now) rates.delete(key);
  const rate = rates.get(ip) || { count: 0, until: now + 60000 };
  if (rate.count >= 20 || rates.size >= 5000) { response.setHeader('Retry-After', '60'); send(429, { error: 'Import limit reached. Try again in a minute or paste the recipe.' }); request.resume(); return; }
  rate.count++; rates.set(ip, rate);
  if (!/^application\/json\b/i.test(request.headers['content-type'] || '')) { send(415, { error: 'Send recipe links as JSON.' }); request.resume(); return; }
  try {
    let body = '';
    for await (const chunk of request) { body += chunk; if (Buffer.byteLength(body) > 4096) { send(413, { error: 'The request is too large.' }); return; } }
    let value;
    try { value = JSON.parse(body).url; } catch { send(400, { error: 'Send a valid recipe URL.' }); return; }
    if (typeof value !== 'string' || value.length > 2048) { send(400, { error: 'Send a valid recipe URL.' }); return; }
    const url = validateUrl(value).href;
    const cached = cache.get(url);
    if (cached && cached.until > now) { send(200, cached.data); return; }
    const data = extractRecipe(await fetchPage(url));
    if (cache.size >= 100) cache.delete(cache.keys().next().value);
    cache.set(url, { data, until: now + 15 * 60000 });
    send(200, data);
  } catch (error) { send(422, { error: error.name === 'TimeoutError' || error.name === 'AbortError' ? 'The recipe website timed out.' : 'Import failed: ' + error.message }); }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(process.env.PORT === undefined ? 3001 : Number(process.env.PORT), '0.0.0.0', () => console.log(`Recipe importer listening on ${server.address().port}`));
