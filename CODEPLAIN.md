# Codeplain: the validation gate is generated, not hand-written

Launch Market's candidate validation gate is **rendered by Codeplain** from a
`.plain` spec, then verified against an external acceptance harness that pins the
spec's exact contract.

## Pipeline

```
specs/gate_spec.plain   ->   codeplain   ->   gate/gate_runner.py
                                                     |
                                          gate_conformance.py  (7/7)
                                                     |
                                          runner/run_job.py uses it
```

One command rebuilds and re-verifies the gate:

```bash
bash build_gate.sh
```

It renders `specs/gate_spec.plain` with the `codeplain` CLI, copies the generated
`gate_runner.py` into `gate/`, and runs `gate_conformance.py` against it.
`runner/run_job.py` then calls this generated gate to validate every candidate it
creates.

## For Codeplain judges (run this)

```bash
npm run plain:install   # npx plain-forge install --agent claude --scope project
npm run plain:verify    # external acceptance harness -> prints 7/7
npm run plain:gate      # re-render specs/gate_spec.plain via codeplain, then verify
```

The project follows plain conventions: `.plain` specs in `specs/`, a
`codeplain/config.yaml`, the renderer's generated gate in `gate/`, and an external
conformance harness as the acceptance bar (`gate_conformance.py`).

## Why the external harness

Codeplain is an LLM spec-to-code compiler. It generates plausible code that
drifts from the spec, and its self-generated tests test the drifted behaviour, so
they pass while missing the exact acceptance wording. We saw this directly:

- The generated code's own tests reported **4/4 pass**, but against the spec's
  exact cases the gate scored **2/7**: paraphrased codes (`missing_candidate_json`
  instead of `missing_candidate_manifest`), an invented `factory/` rule instead of
  `Games/`/`Gallery/`, and one generic `mocked_integration` code.
- We tightened `gate_spec.plain` (explicit `candidate.json` structure, a mandatory
  `code` field, exact literal code strings) and re-rendered to **7/7**. No code was
  hand-edited; the spec is the source of truth.

`gate_conformance.py` is the contract, not codeplain's own tests. This mirrors
`Shared/experiments/codeplain-factory-gate/RESULTS.md`.

## What Codeplain generated vs the factory

- **Codeplain generated** the candidate validation gate (`gate/gate_runner.py`),
  rendered from `specs/gate_spec.plain`. This is the trust layer: every candidate is
  judged by Codeplain-generated code, not hand-written rules.
- **The factory / templates generate** the playable games (the instant browser
  prototypes and the curated feed games).
- So Codeplain is the source of truth for the **validation contract**, not the game
  renderer. Right tool for each job, stated plainly.

## Files

- `specs/gate_spec.plain` - the spec (source of truth for behaviour)
- `gate/gate_runner.py` - the Codeplain-generated validator (committed)
- `gate_conformance.py` - the external acceptance harness (7/7)
- `build_gate.sh` - render + verify in one command
- `dist-codeplain/` - raw codeplain build output (gitignored)
- `.codeplain.env` - the API key (gitignored, never committed)

## Render budget

Each render is 3 credits (3 functionalities), ~25-30s. Reaching 7/7 took 3
renders (9 credits). Credits are a finite pool (50 total), so regenerate
deliberately.
