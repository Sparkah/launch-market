# On-chain: Walrus receipts + Sui registry (testnet)

Every Launch Market candidate produces a real, verifiable on-chain receipt. No
mocks, no wallet prompts, no faucet.

This sits squarely on Sui's own AI + gaming thesis: Walrus as the storage layer,
and verifiable fairness + true ownership as the on-chain guarantees
(`sui.io/ai`, `sui.io/gaming`).

## Pipeline

```
candidate.json + Codeplain-gated report  --PUT-->  Walrus testnet  -->  public blob
                                                        |  send_object_to
                                                        v
                                              Sui testnet object (Blob)
                                              owned by the registry address
```

For each candidate, `runner/run_job.py`:
1. Anchors the candidate manifest and the Codeplain-gated validation report on
   Walrus testnet (real blobs, served back publicly via the aggregator).
2. Sends each blob's Sui object to the Launch Market registry address, so the
   candidate's receipt is a real Sui object the registry owns.
3. Records blob URLs + Sui object ids + explorer links in `candidate.json`, and
   flips `integrations.walrus` and `integrations.sui` from `mocked` to `live`.
   `deepbook` stays `mocked`, and the gate honestly flags it.

## Registry

- Address: `0x184302c635f558959028a312de16dfeccf099a07a8283d5da9ea0bb6cb9039df`
  (`sui_registry.json`; secret key in `.sui_registry.key`, gitignored).
- All candidate receipt objects on Suiscan:
  https://suiscan.xyz/testnet/account/0x184302c635f558959028a312de16dfeccf099a07a8283d5da9ea0bb6cb9039df

## Verify a receipt yourself

```bash
# the bytes (the actual Codeplain-gated validation report):
curl https://aggregator.walrus-testnet.walrus.space/v1/blobs/<blobId>

# the Sui object, owned by the registry:
curl https://fullnode.testnet.sui.io:443 -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"sui_getObject","params":["<objectId>",{"showOwner":true}]}'
```

Verified example: object
`0xb44675f1092eefa77e6c6a90964ba12cda3bb824a1d3613f68eed676541fad58`, type
`...::blob::Blob`, owner `AddressOwner` = the registry address above. Its gated
report flags only `deepbook_mocked` (walrus + sui are live).

## Files

- `walrus_publish.py` - stdlib Walrus publisher; `send_object_to` = the registry
- `sui_keygen.mjs` - one-time registry keypair (@mysten/sui)
- `sui_registry.json` - public registry address + explorer base (tracked)
- `runner/run_job.py` - publishes receipts + records on-chain refs per candidate
