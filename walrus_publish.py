#!/usr/bin/env python3
"""Publish a blob to Walrus testnet and return its receipt.

No wallet required: the public testnet publisher covers storage. The returned
`url` is a public aggregator link that serves the stored bytes back, and
`suiObject` is the on-chain Sui object that represents the blob (the bridge to a
Sui registry step).

Usage: python3 walrus_publish.py <file> [--epochs N]
"""
from __future__ import annotations

import argparse
import json
import os
import urllib.parse
import urllib.request

PUBLISHER = "https://publisher.walrus-testnet.walrus.space"
AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space"
_HERE = os.path.dirname(os.path.abspath(__file__))


def registry_address() -> str | None:
    """The Launch Market Sui registry address (sui_registry.json), if set up."""
    try:
        with open(os.path.join(_HERE, "sui_registry.json")) as handle:
            return json.load(handle).get("address")
    except Exception:
        return None


def publish_blob(data: bytes, epochs: int = 5, send_object_to: str | None = None) -> dict:
    # Transfer the blob's Sui object to the registry address so each receipt is a
    # real Sui object the registry owns on-chain (the Sui integration).
    address = send_object_to or registry_address()
    params = {"epochs": str(epochs)}
    if address:
        params["send_object_to"] = address
    req = urllib.request.Request(
        f"{PUBLISHER}/v1/blobs?{urllib.parse.urlencode(params)}", data=data, method="PUT"
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        body = json.loads(resp.read().decode())
    created = body.get("newlyCreated", {}).get("blobObject", {})
    certified = body.get("alreadyCertified", {})
    blob_id = created.get("blobId") or certified.get("blobId")
    sui_object = created.get("id")
    return {
        "blobId": blob_id,
        "suiObject": sui_object,
        "suiOwner": address if sui_object else None,
        "suiExplorer": f"https://suiscan.xyz/testnet/object/{sui_object}" if sui_object else None,
        "url": f"{AGGREGATOR}/v1/blobs/{blob_id}" if blob_id else None,
        "status": "newlyCreated" if created else ("alreadyCertified" if certified else "unknown"),
    }


def publish_file(path: str, epochs: int = 5, send_object_to: str | None = None) -> dict:
    with open(path, "rb") as handle:
        return publish_blob(handle.read(), epochs, send_object_to)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Publish a file to Walrus testnet.")
    parser.add_argument("file")
    parser.add_argument("--epochs", type=int, default=5)
    args = parser.parse_args()
    print(json.dumps(publish_file(args.file, args.epochs), indent=2))
