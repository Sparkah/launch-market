#!/usr/bin/env python3
"""External conformance harness for the Codeplain-generated gate.

Encodes the EXACT acceptance cases from specs/gate_spec.plain and runs them
against the generated gate CLI. Codeplain's own generated tests are too lenient
(they test the generated behaviour, not the spec wording), so THIS harness is
the source of truth. See Shared/experiments/codeplain-factory-gate/RESULTS.md.

Usage: python3 gate_conformance.py [path/to/gate_runner.py]
"""
import json
import os
import subprocess
import sys
import tempfile

GATE = sys.argv[1] if len(sys.argv) > 1 else "dist-codeplain/gate_spec/gate_runner.py"


def run(candidate):
    """candidate: dict to write as candidate.json, or None for no manifest."""
    d = tempfile.mkdtemp()
    if candidate is not None:
        with open(os.path.join(d, "candidate.json"), "w") as f:
            json.dump(candidate, f)
    p = subprocess.run([sys.executable, GATE, d], capture_output=True, text=True)
    try:
        report = json.loads(p.stdout.strip().splitlines()[-1])
    except Exception:
        report = {"_unparseable": (p.stdout + p.stderr)[:300]}
    return report, p.returncode


def has(report, code, sev=None):
    return any(
        i.get("code") == code and (sev is None or i.get("severity") == sev)
        for i in report.get("issues", [])
    )


CASES = []


def case(name, ok):
    CASES.append((name, bool(ok)))


# A: missing candidate.json -> code missing_candidate_manifest, ok false, nonzero exit
r, rc = run(None)
case("missing candidate.json -> code 'missing_candidate_manifest' + ok=false + exit!=0",
     r.get("ok") is False and has(r, "missing_candidate_manifest") and rc != 0)

# B: artifact path starts with Games/ -> code production_path, ok false
r, rc = run({"id": "x", "artifacts": {"candidate_manifest": "Games/204_x/candidate.json"}})
case("artifact 'Games/...' -> code 'production_path' + ok=false",
     r.get("ok") is False and has(r, "production_path"))

# C: artifact path starts with Gallery/ -> code production_path, ok false
r, rc = run({"id": "x", "artifacts": {"build": "Gallery/games/x/index.html"}})
case("artifact 'Gallery/...' -> code 'production_path' + ok=false",
     r.get("ok") is False and has(r, "production_path"))

# D: walrus mocked -> code walrus_mocked WARN, ok stays true
r, rc = run({"id": "x", "artifacts": {"m": "runs/x/candidate.json"},
             "integrations": {"walrus": "mocked", "sui": "live"}})
case("walrus mocked -> code 'walrus_mocked' severity WARN + ok stays true",
     r.get("ok") is True and has(r, "walrus_mocked", "WARN"))

# E: sui mocked -> code sui_mocked WARN, ok stays true
r, rc = run({"id": "x", "artifacts": {"m": "runs/x/candidate.json"},
             "integrations": {"sui": "mocked", "walrus": "live"}})
case("sui mocked -> code 'sui_mocked' severity WARN + ok stays true",
     r.get("ok") is True and has(r, "sui_mocked", "WARN"))

# F: report carries the required fields
r, rc = run({"id": "x", "artifacts": {"m": "runs/x/candidate.json"}, "integrations": {}})
case("report includes ok / issues / checked / ledger",
     all(k in r for k in ("ok", "issues", "checked", "ledger")))

# G: a clean candidate passes with no ERROR and exit 0
r, rc = run({"id": "x", "artifacts": {"m": "runs/x/candidate.json"},
             "integrations": {"walrus": "live", "sui": "live"}})
case("clean candidate -> ok=true, no ERROR, exit 0",
     r.get("ok") is True
     and not any(i.get("severity") == "ERROR" for i in r.get("issues", []))
     and rc == 0)

passed = sum(1 for _, ok in CASES if ok)
print(f"gate under test: {GATE}\n")
for name, ok in CASES:
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
print(f"\n{passed}/{len(CASES)} spec acceptance cases pass")
sys.exit(0 if passed == len(CASES) else 1)
