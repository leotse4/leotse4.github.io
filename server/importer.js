import { lookup } from 'node:dns/promises';
import https from 'node:https';
import { isIP } from 'node:net';

export function publicIPv4(address) {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
}
export function validateUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password || !url.hostname.includes('.') || isIP(url.hostname) || url.hostname.includes(':') || /(?:^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname)) throw new Error('Use a public HTTPS recipe website.');
  if (/(^|\.)(youtube\.com|youtu\.be|instagram\.com)$/.test(url.hostname)) throw new Error('Video imports are unavailable. Paste the recipe caption or transcript; no video was analyzed.');
  url.hash = '';
  return url;
}
export async function fetchPage(value, redirects = 0, deadline = Date.now() + 10000) {
  if (redirects > 3 || Date.now() >= deadline) throw new Error('The website took too long or redirected too many times.');
  const url = validateUrl(value);
  // Resolve and validate every redirect; pin the validated address to prevent DNS rebinding.
  const records = await Promise.race([lookup(url.hostname, { family: 4, all: true }), new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Website lookup timed out.')), Math.max(1, deadline - Date.now())); timer.unref(); })]);
  if (!records.length || records.some(r => !publicIPv4(r.address))) throw new Error('This website address cannot be imported.');
  const result = await new Promise((resolve, reject) => {
    const request = https.get(url, { lookup: (_host, options, callback) => options.all ? callback(null, [{ address: records[0].address, family: 4 }]) : callback(null, records[0].address, 4), headers: { 'User-Agent': 'LeoRecipeImporter/1.0', Accept: 'text/html, application/xhtml+xml', 'Accept-Encoding': 'identity' }, signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())) }, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) { response.resume(); resolve({ redirect: response.headers.location }); return; }
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`The website refused the import (HTTP ${response.statusCode}).`)); return; }
      if (!/^(text\/html|application\/xhtml\+xml)/i.test(response.headers['content-type'] || '') || (response.headers['content-encoding'] && response.headers['content-encoding'] !== 'identity')) { response.resume(); reject(new Error('The website did not return readable HTML.')); return; }
      let bytes = 0; const chunks = [];
      response.on('data', chunk => { bytes += chunk.length; if (bytes > 2 * 1024 * 1024) request.destroy(new Error('The website is too large to import.')); else chunks.push(chunk); });
      response.on('error', reject);
      response.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8') }));
    });
    request.on('error', reject);
  });
  if (result.redirect) return fetchPage(new URL(result.redirect, url).href, redirects + 1, deadline);
  if (!result.html) throw new Error('The website returned an invalid redirect.');
  return result.html;
}
const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
export function cleanText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (full, key) => { if (key[0] !== '#') return entities[key.toLowerCase()] || full; const n = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1)); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : full; }).trim();
}
export function extractRecipe(html) {
  let found;
  function walk(node, depth = 0) {
    if (found || depth > 30 || !node || typeof node !== 'object') return;
    const types = [].concat(node['@type'] || []);
    if (types.some(t => typeof t === 'string' && /(?:^|[/#])Recipe$/.test(t)) && Array.isArray(node.recipeIngredient) && node.recipeIngredient.length) { found = node; return; }
    for (const child of Object.values(node)) { if (Array.isArray(child)) child.forEach(item => walk(item, depth + 1)); else if (typeof child === 'object') walk(child, depth + 1); }
  }
  for (const script of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    try { walk(JSON.parse(script[1])); } catch { /* Other valid Recipe blocks may follow malformed data. */ }
    if (found) break;
  }
  if (!found) throw new Error('No supported recipe ingredient data was found on this page.');
  const ingredients = found.recipeIngredient;
  if (ingredients.length > 300 || ingredients.some(i => typeof i !== 'string' || !cleanText(i) || i.length > 1500)) throw new Error('The ingredient data needs manual review.');
  const yieldText = cleanText([].concat(found.recipeYield || []).join(' / ')).slice(0, 200);
  const match = yieldText.match(/^(\d+(?:\.\d+)?)(?:\s*(?:servings?|people|persons?))?$/i) || yieldText.match(/^(?:serves|servings)\s*:?\s*(\d+(?:\.\d+)?)$/i);
  const servings = match && Number(match[1]) > 0 && Number(match[1]) <= 10000 ? Number(match[1]) : null;
  return { title: cleanText(found.name || 'Imported recipe').slice(0, 200), ingredients: ingredients.map(cleanText), servings, yield: yieldText, method: 'Embedded Recipe data; no video analyzed' };
}
