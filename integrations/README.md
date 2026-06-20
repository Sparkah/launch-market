# Integrations (live on testnet)

Walrus, Sui, and DeepBook are wired for real, not stubbed.

## Walrus (live)

Each candidate's manifest and Codeplain-gated validation report are stored as
durable public blobs via the testnet publisher, served back through the aggregator.
See `walrus_publish.py` and `ONCHAIN.md`.

## Sui (live)

Each blob's Sui object is sent to the Launch Market registry address
(`send_object_to`), so the candidate's receipt is a real Sui object the registry
owns, verifiable via `sui_getObject`. See `sui_keygen.mjs` and `sui_registry.json`.

## DeepBook (live, read-only)

A real read of a DeepBook v3 testnet pool (SUI_DBUSDC) via the public indexer, used
as the transparent market-data anchor for the launch-credit market. It is a read,
not order placement. See `deepbook_snapshot.py`. Example:

```text
GET https://deepbook-indexer.testnet.mystenlabs.com/orderbook/SUI_DBUSDC?level=1
-> { "bids": [["0.705","10"]], "asks": [["0.714","10"]], ... }
```

## Transparency rule

Every candidate's gate-validated receipt is public on-chain (Walrus blob + Sui
object) before it graduates, so a promotion decision can always be checked against
real evidence rather than a claim.
