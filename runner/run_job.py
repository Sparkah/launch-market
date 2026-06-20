#!/usr/bin/env python3
"""Create a sandbox Launch Market candidate.

This script is intentionally conservative. It writes only under this project's
`runs/` directory and refuses production Factory paths.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNS_DIR = ROOT / "runs"
FORBIDDEN_PREFIXES = ("Games/", "Gallery/", "../../Games/", "../../Gallery/")

sys.path.insert(0, str(ROOT))
try:
    import walrus_publish
except Exception:  # pragma: no cover - publishing is optional
    walrus_publish = None


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:42] or "candidate"


def clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def score_prompt(prompt: str) -> dict[str, int]:
    lower = prompt.lower()
    has_evidence = any(word in lower for word in ("proof", "test", "validate", "spec", "fair"))
    has_market = any(word in lower for word in ("market", "launch", "fund", "promote", "revenue"))
    has_game = any(word in lower for word in ("game", "play", "merge", "idle", "physics", "defense"))
    length_signal = min(len(prompt.strip()) / 160, 1)
    return {
        "fairness": clamp(64 + (22 if has_evidence else 0) + length_signal * 8),
        "launch": clamp(52 + (20 if has_game else 0) + (12 if has_market else 0) + length_signal * 10),
        "business": clamp(46 + (22 if has_market else 0) + (8 if has_evidence else 0) + length_signal * 12),
    }


def candidate_title(prompt: str) -> str:
    lower = prompt.lower()
    if "brainrot" in lower:
        return "Meme Rescue Launch"
    if "merge" in lower:
        return "Merge Run Launch"
    if "idle" in lower:
        return "Idle Forge Launch"
    if "physics" in lower:
        return "Physics Table Launch"
    return "Factory Candidate Launch"


def assert_sandbox_path(path: Path) -> None:
    relative = path.relative_to(ROOT).as_posix()
    if any(relative.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
        raise ValueError(f"refusing production path: {relative}")
    if RUNS_DIR not in path.resolve().parents and path.resolve() != RUNS_DIR:
        raise ValueError(f"refusing path outside runs/: {path}")


def write_json(path: Path, data: dict) -> None:
    assert_sandbox_path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    assert_sandbox_path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def make_candidate(prompt: str, creator: str) -> dict:
    digest = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:10]
    created_at = datetime.now(timezone.utc).isoformat()
    title = candidate_title(prompt)
    slug = slugify(title)
    scores = score_prompt(prompt)
    return {
        "id": f"gf-lm-{digest}",
        "title": title,
        "slug": slug,
        "prompt": prompt,
        "creator": creator,
        "created_at": created_at,
        "scores": scores,
        "promotion_status": "manual_only",
        "integrations": {
            "codeplain": "ready",
            "sui": "mocked",
            "walrus": "mocked",
            "deepbook": "mocked",
            "bilt": "brief_ready",
        },
        "artifacts": {
            "candidate_manifest": f"runs/gf-lm-{digest}/candidate.json",
            "design_doc": f"runs/gf-lm-{digest}/DESIGN.md",
            "validation_report": f"runs/gf-lm-{digest}/reports/validation.json",
        },
        "evidence": [
            {"label": "Plain spec", "value": "specs/game_candidate.plain", "status": "ready"},
            {"label": "Gate spec", "value": "specs/gate_spec.plain", "status": "ready"},
            {"label": "Walrus artifact", "value": "pending", "status": "mocked"},
            {"label": "Sui object", "value": "pending", "status": "mocked"},
            {"label": "DeepBook signal", "value": "pending", "status": "mocked"},
        ],
    }


def validate_candidate(candidate: dict) -> dict:
    issues: list[dict[str, str]] = []
    for key, value in candidate.get("artifacts", {}).items():
        if isinstance(value, str) and (value.startswith("Games/") or value.startswith("Gallery/")):
            issues.append(
                {
                    "code": "production_path",
                    "severity": "ERROR",
                    "message": f"{key} points at production path {value}",
                }
            )

    integrations = candidate.get("integrations", {})
    if integrations.get("walrus") == "mocked":
        issues.append({"code": "walrus_mocked", "severity": "WARN", "message": "Walrus upload is mocked."})
    if integrations.get("sui") == "mocked":
        issues.append({"code": "sui_mocked", "severity": "WARN", "message": "Sui object creation is mocked."})
    if integrations.get("deepbook") == "mocked":
        issues.append({"code": "deepbook_mocked", "severity": "WARN", "message": "DeepBook signal is mocked."})

    return {
        "ok": not any(issue["severity"] == "ERROR" for issue in issues),
        "checked": candidate["id"],
        "issues": issues,
        "ledger": candidate.get("evidence", []),
    }


def design_doc(candidate: dict) -> str:
    return f"""# {candidate["title"]}

## Creator Prompt

{candidate["prompt"]}

## Sandbox Boundary

This candidate was generated for Launch Market evaluation only.

- Promotion status: `{candidate["promotion_status"]}`
- Writes allowed: `launch-market/runs/{candidate["id"]}/`
- Writes forbidden: `Games/`, `Gallery/`, production platform submission folders

## Scores

- Fairness: {candidate["scores"]["fairness"]}
- Launch: {candidate["scores"]["launch"]}
- Business: {candidate["scores"]["business"]}

## Promotion Rule

Promote only after a human reviews the spec, validation report, and playable
preview. The Launch Market runner never publishes directly.
"""


def preview_html(candidate: dict) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{candidate["title"]}</title>
  <style>
    body {{ margin: 0; min-height: 100dvh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #f7f7f4; color: #151515; }}
    main {{ width: min(720px, calc(100% - 32px)); border: 1px solid #d8d8d1; border-radius: 12px; padding: 24px; background: white; }}
    h1 {{ margin: 0 0 8px; font-size: clamp(32px, 8vw, 68px); line-height: .95; }}
    p {{ line-height: 1.5; color: #4a4a44; }}
    .board {{ margin-top: 20px; aspect-ratio: 16/9; border: 2px solid #151515; border-radius: 14px; background: linear-gradient(135deg, #e9eeff, #fff7dc); position: relative; overflow: hidden; }}
    .orb {{ position: absolute; width: 54px; aspect-ratio: 1; border: 2px solid #151515; border-radius: 50%; background: #e5edff; }}
    .orb:nth-child(1) {{ left: 16%; top: 24%; }}
    .orb:nth-child(2) {{ right: 18%; top: 34%; background: #fff0bf; }}
    .orb:nth-child(3) {{ left: 42%; bottom: 16%; background: #def8e8; }}
  </style>
</head>
<body>
  <main>
    <h1>{candidate["title"]}</h1>
    <p>{candidate["prompt"]}</p>
    <div class="board" aria-label="Sandbox preview">
      <span class="orb"></span><span class="orb"></span><span class="orb"></span>
    </div>
  </main>
</body>
</html>
"""


def run_codeplain_gate(sandbox_dir: Path, candidate: dict) -> dict:
    """Validate the sandbox with the Codeplain-generated gate.

    The gate is rendered from `specs/gate_spec.plain` by Codeplain (see
    `build_gate.sh` and `CODEPLAIN.md`). Falls back to the inline check when the
    generated gate has not been built yet.
    """
    gate = ROOT / "gate" / "gate_runner.py"
    if gate.exists():
        proc = subprocess.run(
            [sys.executable, str(gate), str(sandbox_dir)],
            capture_output=True,
            text=True,
        )
        for line in reversed(proc.stdout.strip().splitlines()):
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                continue
    return validate_candidate(candidate)


def publish_to_walrus(path: Path) -> dict:
    """Anchor a file on Walrus testnet. Best-effort; returns {} / {error} on failure."""
    if walrus_publish is None:
        return {}
    try:
        return walrus_publish.publish_file(str(path))
    except Exception as exc:  # network / endpoint hiccup: keep the run, skip the receipt
        return {"error": str(exc)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a Launch Market sandbox candidate.")
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--creator", default="hackathon-demo")
    args = parser.parse_args()

    candidate = make_candidate(args.prompt, args.creator)
    run_dir = RUNS_DIR / candidate["id"]
    assert_sandbox_path(run_dir)
    run_dir.mkdir(parents=True, exist_ok=True)

    cand_path = run_dir / "candidate.json"
    write_text(run_dir / "DESIGN.md", design_doc(candidate))
    write_text(run_dir / "game" / "index.html", preview_html(candidate))
    write_json(cand_path, candidate)

    # Anchor the candidate manifest on Walrus -> real receipt; flip walrus live.
    manifest = publish_to_walrus(cand_path)
    if manifest.get("blobId"):
        candidate["receipts"] = {"candidate": manifest}
        candidate["integrations"]["walrus"] = "live"
        write_json(cand_path, candidate)

    # Validate the (now walrus-live) candidate with the Codeplain gate.
    validation = run_codeplain_gate(run_dir, candidate)
    write_json(run_dir / "reports" / "validation.json", validation)

    # Anchor the gate's validation report on Walrus too.
    report = publish_to_walrus(run_dir / "reports" / "validation.json")
    if report.get("blobId"):
        candidate.setdefault("receipts", {})["validation"] = report
        write_json(cand_path, candidate)

    receipt = (candidate.get("receipts", {}).get("validation")
               or candidate.get("receipts", {}).get("candidate") or {})
    print(json.dumps({"ok": True, "run_dir": str(run_dir.relative_to(ROOT)),
                      "receipt": receipt.get("url"), "candidate": candidate}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

