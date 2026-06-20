# Live on-chain receipt (real, verifiable)

A real candidate produced by `runner/run_job.py`, with its receipt anchored on
**Walrus + Sui testnet** and a live **DeepBook** read. The two JSON files here are
the actual artifacts; the links below are live right now.

## Files

- `candidate.json` - the candidate manifest. `integrations`: walrus `live`, sui
  `live`, deepbook `readonly`. Its on-chain receipt is the validation report (Walrus
  blob + Sui object, below), plus the candidate's own Sui object and the DeepBook
  snapshot. This file's own Walrus blob is the byte-equivalent link under "Verify"
  below; a manifest can't contain its own content-addressed URL, so it is not stored
  inside the file.
- `validation.json` - the **Codeplain-generated gate** output for this candidate
  (`ok: true`, no issues). Same gate verified at `npm run plain:verify` (7/7).

## Verify it yourself (all live on testnet)

- Candidate manifest blob (Walrus), byte-equivalent to `candidate.json` in this folder:
  `https://aggregator.walrus-testnet.walrus.space/v1/blobs/zb87Jte3mUWalSkIPGw3Z9YzV2D6WIZop2O-RvF2mlc`
- Codeplain-gated validation report blob (Walrus):
  `https://aggregator.walrus-testnet.walrus.space/v1/blobs/pEMfa_eLCeWBBgcL667x8_5bJoMKn3hGofHW3Gi0Bs4`
- Sui object (owned by the registry), on Suiscan:
  `https://suiscan.xyz/testnet/object/0x188e0aa4d94d070a619a11dc77dea34b64d587302272023f31f8704b470168d0`
- Registry account (owns every candidate receipt):
  `https://suiscan.xyz/testnet/account/0x184302c635f558959028a312de16dfeccf099a07a8283d5da9ea0bb6cb9039df`
- DeepBook live market read:
  `https://deepbook-indexer.testnet.mystenlabs.com/orderbook/SUI_DBUSDC?level=1`

### Copy-paste checks

```bash
# the validation report bytes (the Codeplain gate output: {"ok": true, "issues": []})
curl https://aggregator.walrus-testnet.walrus.space/v1/blobs/pEMfa_eLCeWBBgcL667x8_5bJoMKn3hGofHW3Gi0Bs4

# the Sui object, owned by the registry address
curl https://fullnode.testnet.sui.io:443 -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getObject","params":["0x188e0aa4d94d070a619a11dc77dea34b64d587302272023f31f8704b470168d0",{"showOwner":true}]}'
```

Regenerate a fresh one end to end: `npm run runner` (writes a new `runs/<id>/`).
