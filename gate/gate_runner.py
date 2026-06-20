import sys
import os
import json

def run_validation():
    if len(sys.argv) != 2:
        # Note: Requirements specify exactly one positional argument.
        # If the usage is wrong, we report a failure.
        report = {
            "ok": False,
            "issues": [{
                "code": "missing_candidate_manifest",
                "severity": "ERROR",
                "message": "Invalid usage. Expected: python gate_runner.py <sandbox_path>"
            }],
            "checked": [],
            "ledger": []
        }
        print(json.dumps(report, separators=(',', ':')))
        sys.exit(1)

    sandbox_path = sys.argv[1]
    manifest_path = os.path.join(sandbox_path, "candidate.json")

    issues = []
    checked = ["candidate_manifest_presence", "artifact_paths", "integrations"]
    ledger = []

    # Functionality: GateRunner should fail when candidate.json is missing.
    if not os.path.exists(manifest_path):
        issues.append({
            "code": "missing_candidate_manifest",
            "severity": "ERROR",
            "message": f"The file 'candidate.json' was not found in {sandbox_path}"
        })
    else:
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            artifacts = manifest.get("artifacts", {})
            for art_name, art_path in artifacts.items():
                # Requirement: production path starts with exactly Games/ or Gallery/
                if art_path.startswith("Games/") or art_path.startswith("Gallery/"):
                    issues.append({
                        "code": "production_path",
                        "severity": "ERROR",
                        "message": f"Artifact '{art_name}' points to a production path: {art_path}"
                    })

            integrations = manifest.get("integrations", {})
            integration_map = {
                "walrus": "walrus_mocked",
                "sui": "sui_mocked",
                "deepbook": "deepbook_mocked"
            }
            for key, code in integration_map.items():
                if integrations.get(key) == "mocked":
                    issues.append({
                        "code": code,
                        "severity": "WARN",
                        "message": f"Integration '{key}' is mocked."
                    })
        except (json.JSONDecodeError, IOError) as e:
            # Error handling for malformed JSON if necessary, 
            # though not explicitly requested, it's good practice.
            issues.append({
                "code": "missing_candidate_manifest",
                "severity": "ERROR",
                "message": f"Failed to read or parse candidate.json: {str(e)}"
            })

    # Determine status
    # A HardFail (severity ERROR) must set ok to false.
    ok = not any(i["severity"] == "ERROR" for i in issues)

    report = {
        "ok": ok,
        "issues": issues,
        "checked": checked,
        "ledger": ledger
    }

    # Print as a single compact JSON line
    print(json.dumps(report, separators=(',', ':')))

    # Exit with status code 0 when ok is true, and with a nonzero status code when ok is false.
    if ok:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    run_validation()