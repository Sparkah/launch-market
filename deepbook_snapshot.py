#!/usr/bin/env python3
"""Read a live DeepBook testnet market signal (read-only, no trades).

This is the transparent market-data anchor for the launch-credit market. It is a
read of a real DeepBook v3 pool via the public testnet indexer; it does not place
orders. Honest status: read-only, not a full market integration.

Usage: python3 deepbook_snapshot.py [POOL_NAME]   # default SUI_DBUSDC
"""
from __future__ import annotations

import json
import sys
import urllib.request

INDEXER = "https://deepbook-indexer.testnet.mystenlabs.com"


def snapshot(pool: str = "SUI_DBUSDC") -> dict:
    url = f"{INDEXER}/orderbook/{pool}?level=1"
    with urllib.request.urlopen(url, timeout=20) as resp:
        ob = json.loads(resp.read().decode())
    bid = float(ob["bids"][0][0]) if ob.get("bids") else None
    ask = float(ob["asks"][0][0]) if ob.get("asks") else None
    mid = round((bid + ask) / 2, 6) if (bid and ask) else (bid or ask)
    return {
        "pool": pool,
        "bestBid": bid,
        "bestAsk": ask,
        "mid": mid,
        "source": "deepbook-v3-testnet-indexer",
        "network": "testnet",
        "url": url,
    }


if __name__ == "__main__":
    print(json.dumps(snapshot(sys.argv[1] if len(sys.argv) > 1 else "SUI_DBUSDC"), indent=2))
