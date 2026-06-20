# Deploy

This is a static site. The front door is `index.html` (the terminal landing).
The whole demo is plain HTML + assets, so there is no build step.

## The demo path

```
index.html (landing)  ->  loop.html (play real games)  ->  creation.html (make one)
```

## Run locally

```bash
python3 -m http.server 8123
# open http://localhost:8123/
```

## Host it (any static host)

Serve the repository root as static files. No build command, output dir = `.`.

- Vercel: Framework Preset = Other, Build Command = none, Output Directory = `./`
- Cloudflare Pages / Netlify / GitHub Pages: deploy the root, no build.

Note: the legacy Vite React app (`index.html` was its entry, `src/`) is not part
of the demo, and `npm run build` is NOT used for deployment. The static pages are
the product.

## zkLogin redirect

`loop.html` signs in via Enoki zkLogin and returns to its own URL. Add that exact
URL to the Google OAuth client's Authorized redirect URIs for every origin you
host on, for example:

- `http://localhost:8123/loop.html`
- `https://<your-host>/loop.html`
