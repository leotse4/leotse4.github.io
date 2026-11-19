import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('HTTP service exposes health, enforces origins, rejects invalid inputs, and limits requests', async t => {
  const child = spawn(process.execPath, ['server/index.js'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  const port = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('API startup timed out')), 5000);
    child.once('error', reject);
    child.stdout.on('data', chunk => { const match = String(chunk).match(/listening on (\d+)/); if (match) { clearTimeout(timeout); resolve(Number(match[1])); } });
  });
  const base = `http://127.0.0.1:${port}`;
  assert.deepEqual(await (await fetch(base + '/health')).json(), { ok: true });
  const options = await fetch(base + '/api/import', { method: 'OPTIONS', headers: { Origin: 'https://leotse4.github.io' } });
  assert.equal(options.status, 204); assert.equal(options.headers.get('access-control-allow-origin'), 'https://leotse4.github.io');
  assert.equal((await fetch(base + '/api/import', { method: 'POST', headers: { Origin: 'https://untrusted.example' } })).status, 403);
  assert.equal((await fetch(base + '/api/import')).status, 405);
  assert.equal((await fetch(base + '/api/import', { method: 'POST', body: 'bad' })).status, 415);
  const post = body => fetch(base + '/api/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  assert.equal((await post('{bad')).status, 400);
  assert.equal((await post(JSON.stringify({ url: 'https://127.0.0.1' }))).status, 422);
  assert.equal((await post('x'.repeat(5000))).status, 413);
  let last;
  for (let i = 0; i < 20; i++) last = await post('{}');
  assert.equal(last.status, 429); assert.equal(last.headers.get('Retry-After'), '60');
});
