#!/usr/bin/env python3
"""Copy non-Мediaфасад scene layouts from prod import into stage import."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STAGE = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (2).json"
)
PROD = Path(
    sys.argv[2]
    if len(sys.argv) > 2
    else "/Users/damir/Downloads/layouts-import-6a8c0ce26cd66bcb08d84749 (1).json"
)
MEDIAFASAD = "Медиафасад"


def scene_key(scene: dict) -> tuple:
    c = scene["canvas"]
    p = scene["placement"]
    return (p["name"], c["width"], c["height"])


def main() -> None:
    stage = json.loads(STAGE.read_text(encoding="utf-8"))
    prod = json.loads(PROD.read_text(encoding="utf-8"))

    stage["project"]["layoutElements"] = json.loads(
        json.dumps(prod["project"]["layoutElements"])
    )

    prod_by_key = {}
    for scene in prod["scenes"]:
        if scene["placement"]["name"] == MEDIAFASAD:
            continue
        prod_by_key[scene_key(scene)] = scene

    updated = 0
    missing = []
    for scene in stage["scenes"]:
        if scene["placement"]["name"] == MEDIAFASAD:
            continue
        key = scene_key(scene)
        prod_scene = prod_by_key.get(key)
        if not prod_scene:
            missing.append((scene["id"], key))
            continue
        scene["layouts"] = json.loads(json.dumps(prod_scene["layouts"]))
        for layout in scene["layouts"]:
            layout["id"] = ""
        if "settings" in prod_scene:
            scene["settings"] = json.loads(json.dumps(prod_scene["settings"]))
        elif "settings" in scene:
            del scene["settings"]
        updated += 1
        print(f"OK {key[0]} {key[1]}x{key[2]} -> {len(scene['layouts'])} layouts")

    STAGE.write_text(json.dumps(stage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nUpdated {updated} scenes -> {STAGE}")
    if missing:
        print(f"Missing in prod ({len(missing)}):")
        for sid, key in missing:
            print(f"  {sid} {key}")


if __name__ == "__main__":
    main()
