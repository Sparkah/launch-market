# Integration Stubs

The first build keeps Sui, Walrus, and DeepBook behind explicit adapters.

## Sui

Target object: `GameCandidate`.

Fields:

- `id`
- `creator`
- `walrus_manifest_blob`
- `validation_hash`
- `promotion_status`

## Walrus

Artifacts to upload:

- `.plain` specs
- `candidate.json`
- `reports/validation.json`
- screenshots
- optional zipped playable preview

## DeepBook

Use as the transparent market primitive for launch-credit allocation.

First demo can use a deterministic snapshot while the adapter shape remains:

```json
{
  "pair": "SUI/USDC",
  "mid": "mocked",
  "depth": "mocked",
  "source": "deepbook-adapter"
}
```

## BGA Transparency Rule

No recommendation may hide missing evidence. Every allocation record must show
`why`, `risk`, and `missing_evidence`.

