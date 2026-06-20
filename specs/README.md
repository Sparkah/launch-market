# Plain Specs

These `.plain` files are the contract layer for Game Factory Launch Market.

They intentionally specify the orchestration, validation, market, and mobile
contracts. They do not ask Codeplain to generate full canvas games, because the
Factory already owns game production and prior Codeplain testing showed exact
acceptance cases still need an external harness.

## Render Targets

- `game_candidate.plain` - candidate manifest and sandbox contract
- `gate_spec.plain` - validation report and evidence ledger contract
- `market_spec.plain` - launch-credit allocation and transparency contract
- `bilt_mobile.plain` - mobile companion app contract

