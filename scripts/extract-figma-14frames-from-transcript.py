#!/usr/bin/env python3
"""Extract figma-banners-14frames.json from agent transcript."""

import json
import sys
from pathlib import Path

TRANSCRIPT = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else "/Users/damir/.cursor/projects/Users-damir-Documents-Job-Board-Interface-Skeleton/agent-transcripts/53d6ed45-8bbf-4d09-96b9-b275509cc7cf/53d6ed45-8bbf-4d09-96b9-b275509cc7cf.jsonl"
)
OUT = Path(
    sys.argv[2]
    if len(sys.argv) > 2
    else Path(__file__).resolve().parent / "figma-banners-14frames.json"
)


def extract_payload(text: str) -> dict:
    start = text.find('{"schemaVersion"')
    if start == -1:
        start = text.find('{\n  "schemaVersion"')
    if start == -1:
        raise ValueError("JSON start not found")

    marker = "} /Users/damir/Downloads/"
    end = text.find(marker, start)
    if end != -1:
        raw = text[start : end + 1]
    else:
        end = text.rfind("}", start)
        raw = text[start : end + 1]

    return json.loads(raw)


def main() -> None:
    with TRANSCRIPT.open(encoding="utf-8") as handle:
        for line in handle:
            if "schemaVersion" not in line:
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                continue
            if data.get("role") != "user":
                continue
            text = data["message"]["content"][0]["text"]
            if "14 фреймов" not in text and "14 \u0444\u0440\u0435\u0439\u043c\u043e\u0432" not in text:
                if '"source": "14' not in text:
                    continue
            payload = extract_payload(text)
            if payload.get("source") != "14 фреймов":
                continue
            OUT.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"Wrote {OUT} ({len(payload['banners'])} banners)")
            return
    raise SystemExit(
        "Transcript line with 14-frame export not found.\n"
        "Save the JSON manually to:\n"
        f"  {OUT}"
    )


if __name__ == "__main__":
    main()
