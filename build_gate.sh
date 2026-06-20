#!/usr/bin/env bash
# Build the Launch Market validation gate from its Codeplain spec, then verify
# the generated code against the external acceptance harness that encodes the
# spec's exact contract. See CODEPLAIN.md.
set -euo pipefail
cd "$(dirname "$0")"

# Codeplain renders through its hosted API. The key is read from .codeplain.env
# (gitignored) or from the environment.
[ -f .codeplain.env ] && { set -a; . ./.codeplain.env; set +a; }
: "${CODEPLAIN_API_KEY:?Set CODEPLAIN_API_KEY (or add it to .codeplain.env)}"

mkdir -p plain_modules dist-codeplain conformance_tests gate

echo "[1/3] Rendering gate from specs/gate_spec.plain via Codeplain..."
( cd specs && codeplain gate_spec.plain --headless --force-render --log-to-file --test-script-timeout 300 )

echo "[2/3] Copying generated gate -> gate/gate_runner.py"
cp dist-codeplain/gate_spec/gate_runner.py gate/gate_runner.py

echo "[3/3] Verifying against the spec's exact acceptance harness..."
python3 gate_conformance.py gate/gate_runner.py
