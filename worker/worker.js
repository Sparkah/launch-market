/* Launch Market games backend - Cloudflare Worker + KV.
   POST /api/submit {prompt,title,mechanic,html}  -> stores a generated game, returns {id, play}
   GET  /api/feed                                 -> recent games (the greenlight queue)
   POST /api/vote/:id                             -> upvote a game
   GET  /play/:id                                 -> serves the playable game HTML (shareable URL)
   GET  /api/game/:id                             -> game record JSON */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
function json(o, s) {
  return new Response(JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json', ...CORS } });
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (path === '/api/submit' && req.method === 'POST') {
      let b;
      try { b = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400); }
      if (!b || typeof b.html !== 'string' || b.html.length < 80 || b.html.length > 300000) return json({ error: 'bad html' }, 400);
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
      idx = idx.filter((g) => g.id !== id);
      idx.unshift(rec);
      if (idx.length > 200) idx.length = 200;
      await env.GAMES.put('index', JSON.stringify(idx));
      return json({ id, play: url.origin + '/play/' + id });
    }

    if (path === '/api/feed') {
      let idx = [];
      try { idx = JSON.parse((await env.GAMES.get('index')) || '[]'); } catch (e) {}
      const sort = url.searchParams.get('sort');
      if (sort === 'top') idx = idx.slice().sort((a, b) => b.votes - a.votes);
      return json({ games: idx.slice(0, 60) });
    }

    let m = path.match(/^\/api\/vote\/([a-z0-9]+)$/i);
    if (m && req.method === 'POST') {
      let idx = [];
      try { idx = JSON.parse((await env.GAMES.get('index')) || '[]'); } catch (e) {}
      const g = idx.find((x) => x.id === m[1]);
      if (g) { g.votes = (g.votes || 0) + 1; await env.GAMES.put('index', JSON.stringify(idx)); }
      return json({ votes: g ? g.votes : 0 });
    }

    m = path.match(/^\/play\/([a-z0-9]+)$/i);
    if (m) {
      const raw = await env.GAMES.get('game:' + m[1]);
      if (!raw) return new Response('Game not found', { status: 404, headers: CORS });
      let g; try { g = JSON.parse(raw); } catch (e) { return new Response('corrupt', { status: 500, headers: CORS }); }
      return new Response(g.html, { headers: { 'Content-Type': 'text/html;charset=utf-8', 'Access-Control-Allow-Origin': '*' } });
    }

    m = path.match(/^\/api\/game\/([a-z0-9]+)$/i);
    if (m) {
      const raw = await env.GAMES.get('game:' + m[1]);
      if (!raw) return json({ error: 'not found' }, 404);
      return new Response(raw, { headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    return json({ ok: true, service: 'launch-market-games' });
  },
};
