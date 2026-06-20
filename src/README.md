# Legacy prototype - NOT part of the submission

This `src/` directory is an early Vite/React sketch kept only for reference. It
contains **mocked** data (`src/data/demo.ts`) and does not reflect the live product.

The live product is:

- the static site at the repo root (`index.html`, `loop.html`, `creation.html`),
  deployed on Vercel;
- the Cloudflare Worker in `worker/` (games backend + greenlight feed);
- the Codeplain validation gate in `gate/` + `specs/` (`npm run plain:verify` -> 7/7);
- the real on-chain pipeline in `runner/run_job.py` (Walrus + Sui + DeepBook).

Please do not judge the project by anything under `src/`.
