# Game Factory Launch Market

Auditable AI game launchpad for the Encode Vibe Coding Hackathon.

Game Factory can generate many HTML5 games. Launch Market decides which
candidates are safe, testable, and worth promotion capital before anything
touches the production Factory.

## Bounty Coverage

- **Solvimon:** business-ready creator launchpad with paid tiers and take-rate.
- **Codeplain:** `.plain` specs are the contract layer for candidates, gates,
  market allocation, and the mobile companion.
- **Sui:** candidate registry target with Sui object references.
- **Walrus:** durable artifact target for specs, manifests, reports, and builds.
- **DeepBook:** transparent launch-credit market primitive.
- **BGA:** fairer market strategy: evidence must be visible before allocation.
- **Bilt.me:** mobile companion brief for creator intake and backer allocation.

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
