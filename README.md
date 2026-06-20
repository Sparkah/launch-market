# Launch Market

**The accessible front door to web3 gaming.** A feed of instant, AI-generated
casual games anyone can play with a Google login (zkLogin, no wallet) and make
from one sentence. Candidate games run a Codeplain-generated validation gate and
get a Walrus + Sui + DeepBook receipt before they graduate; a live example receipt
is in the demo. Browser-made prototypes are quick playable sketches that enter the
greenlight feed (they are not stamped with the on-chain receipt until they graduate).

- Live demo: https://launch-market-wheat.vercel.app
- Public repo: https://github.com/Sparkah/launch-market
- Bilt mobile app (companion): https://try.myiosapp.link/OrUtIQA

Sui gaming has world-class rails and almost no players. We are the on-ramp:
instant casual games as the front door, on-chain ownership as the reason to stay.

## 2-minute demo path

1. `/` (landing) - the pitch, with a live row that links the real Walrus blob, the
   Sui object, the Codeplain gate (7/7), and a live DeepBook read. All clickable.
2. `/loop.html` - swipe a feed of REAL factory games, tap Play to actually play one,
   then "sign in with Google" (zkLogin) and watch your Sui address and Moons appear.
   No wallet.
3. `/creation.html` - pick 2D/3D and a preset (Minecraft, Roblox, Brainrot,
   Match-3, ...), describe a twist, and watch it route to Codeplain or the factory.

## Bounty coverage

- **Codeplain (live):** a `.plain` spec renders the candidate validation gate,
  verified 7/7 against an external acceptance harness. See `CODEPLAIN.md`.
- **Sui (live, testnet):** a Sui-backed validation + receipt layer. Every candidate
  gets a Walrus blob, a registry-owned Sui object, and a live read-only DeepBook
  market signal. This is provenance + market signal on Sui, not a full on-chain game
  economy. See `ONCHAIN.md`.
- **Solvimon:** the Moons economy (30 plays = 1 build), Pro/Studio subscriptions,
  in-game add-ons (kids play, parents pay), and graduation profit-share. See
  `launch_market_vision.png`.
- **Bilt:** a native mobile companion built on bilt.me (TikTok-style feed + WebView game
  play), the mobile acquisition front for creators and backers.
- **Vercel:** the whole demo is a static site deployed on Vercel (the live URL above).

## How a candidate works

prompt -> factory builds it -> Codeplain gate validates -> Walrus blob + registry-owned
Sui object + live DeepBook read anchored as the receipt -> crowd greenlights. Nothing
touches the production factory; promotion is a manual step. See `runner/run_job.py`.

## Safety boundary

This project never runs the scheduled Factory or production publish scripts. It only
writes under `runs/<job-id>/`; `Games/` and `Gallery/` are forbidden, and the
Codeplain gate hard-fails any candidate that points at them.

## Run and deploy

Static site, no build step. The front door is `index.html`.

```bash
python3 -m http.server 8123    # then open http://localhost:8123/
```

Deploy: serve the repo root as static files (see `DEPLOY.md`). The legacy Vite React
app under `src/` is not part of the demo; do NOT run `npm run build` for deployment.

## Codeplain

`.plain` specs live in `specs/`, config in `codeplain/config.yaml`. Rebuild and
verify the generated gate:

```bash
bash build_gate.sh                          # render specs/gate_spec.plain -> gate/, then verify
python3 gate_conformance.py gate/gate_runner.py   # 7/7 against the spec's exact contract
```
