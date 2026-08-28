#!/usr/bin/env python3
"""Set layout id to \"\" for all non-Мediaфасад scenes (import creates new layouts)."""

import json
import sys
from pathlib import Path

STAGE = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (2).json"
)
MEDIAFASAD = "Медиафасад"


def main() -> None:
    data = json.loads(STAGE.read_text(encoding="utf-8"))
    cleared = 0
    for scene in data["scenes"]:
        if scene["placement"]["name"] == MEDIAFASAD:
            continue
        for layout in scene.get("layouts", []):
            if layout.get("id"):
                layout["id"] = ""
                cleared += 1
    STAGE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Cleared {cleared} layout ids in non-Мediaфасад scenes -> {STAGE}")


if __name__ == "__main__":
    main()
