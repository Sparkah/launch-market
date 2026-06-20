/* Launch Market games backend - Cloudflare Worker + KV.
   Hardened: origin allowlist, per-IP rate limits, generator-marker requirement,
   and served games are sandboxed via CSP so they cannot be used for phishing.
   POST /api/submit {prompt,title,mechanic,html}  -> store a generated game
   GET  /api/feed                                 -> recent games (greenlight queue)
   POST /api/vote/:id                             -> demo upvote (rate-limited)
   GET  /play/:id                                 -> serves the game HTML (sandboxed)
   GET  /api/game/:id                             -> game record JSON */
const ALLOWED = new Set([
  'https://launch-market-wheat.vercel.app',
  'http://localhost:8123',
  'http://127.0.0.1:8123',
]);
const MARKER = 'launch-market-gen';
const DEFAULT_ORIGIN = 'https://launch-market-wheat.vercel.app';

function cors(origin) {
  const o = ALLOWED.has(origin) ? origin : DEFAULT_ORIGIN;
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
function json(o, s, origin) {
  return new Response(JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json', ...cors(origin) } });
}
async function rateLimited(env, ip, bucket, limit) {
  const key = 'rl:' + bucket + ':' + ip;
  let n = 0;
  try { n = parseInt((await env.GAMES.get(key)) || '0', 10) || 0; } catch (e) {}
  if (n >= limit) return true;
  try { await env.GAMES.put(key, String(n + 1), { expirationTtl: 60 }); } catch (e) {}
  return false;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const origin = req.headers.get('Origin') || '';
    const ip = req.headers.get('CF-Connecting-IP') || 'anon';
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });

    if (path === '/api/submit' && req.method === 'POST') {
      if (!ALLOWED.has(origin)) return json({ error: 'origin not allowed' }, 403, origin);
      if (await rateLimited(env, ip, 'submit', 8)) return json({ error: 'rate limited, try again shortly' }, 429, origin);
      let b;
      try { b = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400, origin); }
      if (!b || typeof b.html !== 'string' || b.html.length < 80 || b.html.length > 300000) return json({ error: 'bad html' }, 400, origin);
      if (b.html.indexOf(MARKER) === -1) return json({ error: 'missing generator marker' }, 400, origin);
      const id = String(b.id || ('g' + Math.random().toString(36).slice(2, 9))).replace(/[^a-z0-9]/gi, '').slice(0, 24);
      const rec = {
        id,
        title: String(b.title || 'Untitled').slice(0, 60),
        prompt: String(b.prompt || '').slice(0, 200),
        mechanic: String(b.mechanic || 'catch').slice(0, 16),
        votes: 0,
        ts: Date.now(),
      };
      await env.GAMES.put('game:' + id, JSON.stringify({ ...rec, html: b.html }));
      let idx = [];
      try { idx = JSON.parse((await env.GAMES.get('index')) || '[]'); } catch (e) {}
      idx = idx.filter((g) => g.id !== id && g.title !== rec.title);
      idx.unshift(rec);
      if (idx.length > 200) idx.length = 200;
      await env.GAMES.put('index', JSON.stringify(idx));
      return json({ id, play: url.origin + '/play/' + id }, 200, origin);
    }

    if (path === '/api/feed') {
      let idx = [];
      try { idx = JSON.parse((await env.GAMES.get('index')) || '[]'); } catch (e) {}
      if (url.searchParams.get('sort') === 'top') idx = idx.slice().sort((a, b) => b.votes - a.votes);
      return json({ games: idx.slice(0, 60) }, 200, origin);
    }

    let m = path.match(/^\/api\/vote\/([a-z0-9]+)$/i);
    if (m && req.method === 'POST') {
      if (await rateLimited(env, ip, 'vote', 20)) return json({ error: 'rate limited' }, 429, origin);
      let idx = [];
      try { idx = JSON.parse((await env.GAMES.get('index')) || '[]'); } catch (e) {}
      const g = idx.find((x) => x.id === m[1]);
      if (g) { g.votes = (g.votes || 0) + 1; await env.GAMES.put('index', JSON.stringify(idx)); }
      return json({ votes: g ? g.votes : 0 }, 200, origin);
    }

    m = path.match(/^\/play\/([a-z0-9]+)$/i);
    if (m) {
      const raw = await env.GAMES.get('game:' + m[1]);
      if (!raw) return new Response('Game not found', { status: 404 });
      let g;
      try { g = JSON.parse(raw); } catch (e) { return new Response('corrupt', { status: 500 }); }
      // Sandbox the served game so it cannot submit forms, open popups, navigate the
      // top frame, or act as same-origin -> neutralises phishing/abuse on this domain.
      return new Response(g.html, {
        headers: {
          'Content-Type': 'text/html;charset=utf-8',
          'Content-Security-Policy': 'sandbox allow-scripts allow-pointer-lock;',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'no-referrer',
        },
      });
    }

    m = path.match(/^\/api\/game\/([a-z0-9]+)$/i);
    if (m) {
      const raw = await env.GAMES.get('game:' + m[1]);
      if (!raw) return json({ error: 'not found' }, 404, origin);
      return new Response(raw, { headers: { 'Content-Type': 'application/json', ...cors(origin) } });
    }

    return json({ ok: true, service: 'launch-market-games' }, 200, origin);
  },
};
