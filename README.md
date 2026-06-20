# Game Factory Launch Market

Auditable AI game launchpad for the Encode Vibe Coding Hackathon.

Game Factory can generate many HTML5 games. Launch Market decides which
candidates are safe, testable, and worth promotion capital before anything
touches the production Factory.

## Bounty Coverage

- **Codeplain (LIVE):** a `.plain` spec renders the candidate validation gate,
  verified 7/7 against an external acceptance harness. See `CODEPLAIN.md`.
- **Walrus (LIVE, testnet):** every candidate's manifest + Codeplain-gated report
  are anchored as durable, public blobs. See `ONCHAIN.md`.
- **Sui (LIVE, testnet):** each receipt blob's Sui object is owned by the Launch
  Market registry - a real on-chain candidate registry with Sui object references,
  on Sui's verifiable-fairness + true-ownership gaming thesis. See `ONCHAIN.md`.
- **Solvimon:** the Moons economy (30 plays = 1 build) plus Pro/Studio
  subscriptions and a graduation profit-share. See the landing page.
- **BGA (LIVE):** the Codeplain gate produces genuine validation evidence, so
  evidence is public and on-chain before any capital is allocated.
- **DeepBook (planned):** the transparent launch-credit market signal, still
  mocked - the gate honestly flags it.
- **Bilt.me (brief):** mobile companion for creator intake and backer allocation.

## Safety Boundary

This project never runs the scheduled Factory or production publish scripts.

Allowed writes:

```text
hackathons/14-encode-vibe-coding-2026/launch-market/runs/<job-id>/
```

Forbidden writes:

```text
Games/
Gallery/
Shared/skills/game-factory/scripts/run_factory.sh
```

Promotion into the real Factory is a manual future step.

## Local Commands

```bash
npm install
npm run dev
npm run build
npm run runner
```

## Codeplain

Specs live in `specs/`. Config lives in `codeplain/config.yaml`.

Dry-run example:

```bash
cd specs
codeplain game_candidate.plain --dry-run
```

## Demo Path

1. Enter a game prompt and allocation rule.
2. Launch Market scores fairness, launch quality, and business potential.
3. Evidence ledger shows specs, validation, Walrus/Sui/DeepBook status.
4. Candidate remains sandboxed until manually promoted.
5. Bilt mobile brief shows how creators/backers would use and pay for it.
