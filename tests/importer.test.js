import test from 'node:test';
import assert from 'node:assert/strict';
import { extractRecipe, publicIPv4, validateUrl } from '../server/importer.js';

const html = node => `<script type="application/ld+json">${JSON.stringify(node)}</script>`;
test('extracts nested Recipe data and preserves ingredient lines', () => {
  const result = extractRecipe(html({ '@graph': [{ '@type': ['Thing', 'Recipe'], name: 'Pasta &amp; greens', recipeYield: '4 servings', recipeIngredient: ['400 g pasta', 'Salt to taste'] }] }));
  assert.equal(result.title, 'Pasta & greens'); assert.equal(result.servings, 4); assert.deepEqual(result.ingredients, ['400 g pasta', 'Salt to taste']);
});
test('does not interpret loaf yield as people', () => { assert.equal(extractRecipe(html({ '@type': 'Recipe', recipeYield: '1 loaf', recipeIngredient: ['500 g flour'] })).servings, null); });
test('handles malformed, missing, and suspicious ingredient data', () => {
  for (const input of ['<html>Login required</html>', '<script type="application/ld+json">{broken}</script>', html({ '@type': 'Recipe', recipeIngredient: [''] }), html({ '@type': 'Recipe', recipeIngredient: [null] })]) assert.throws(() => extractRecipe(input));
  assert.equal(extractRecipe('<script type="application/ld+json">{bad}</script>' + html({ '@type': 'Recipe', recipeIngredient: ['1 egg'] })).ingredients[0], '1 egg');
});
test('blocks internal networks and special-purpose addresses', () => {
  for (const ip of ['127.0.0.1', '10.0.0.2', '172.16.0.1', '192.168.0.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '198.18.0.1', '224.0.0.1', '::1', '::ffff:127.0.0.1', '203.0.113.1']) assert.equal(publicIPv4(ip), false, ip);
  assert.equal(publicIPv4('8.8.8.8'), true);
});
test('blocks unsafe URL forms and video extraction', () => {
  for (const url of ['file:///etc/passwd', 'http://example.com', 'https://localhost', 'https://127.1', 'https://2130706433', 'https://[::1]', 'https://user:password@example.com', 'https://example.com:8080', 'https://youtube.com/watch?v=abc', 'https://www.instagram.com/reel/abc']) assert.throws(() => validateUrl(url), url);
  assert.equal(validateUrl('https://example.com/recipe#ingredients').href, 'https://example.com/recipe');
});
