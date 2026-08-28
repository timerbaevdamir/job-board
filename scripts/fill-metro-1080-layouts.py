#!/usr/bin/env python3
"""Fill Metro_Экраны 1080x1920 with the same 4 layout names as 2160x3840."""

import copy
import json
import sys
from pathlib import Path
from typing import Optional

REF = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (2).json"
)
TARGET = Path(
    sys.argv[2]
    if len(sys.argv) > 2
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (6).json"
)

PLACEMENT = "Метро_Экраны"
CANVAS = (1080, 1920)

# Same four layout names as Metro 2160x3840 (plus base seller layout already in target).
LAYOUT_NAMES = [
    "Мелкая слева",
    "Мелкая справа",
    "Мелкая внизу",
    "Крупная справа",
]


def find_scene(data: dict, placement: str, w: int, h: int) -> Optional[dict]:
    for scene in data["scenes"]:
        if scene["placement"]["name"] != placement:
            continue
        if scene["canvas"]["width"] != w or scene["canvas"]["height"] != h:
            continue
        return scene
    return None


def main() -> None:
    ref = json.loads(REF.read_text(encoding="utf-8"))
    target = json.loads(TARGET.read_text(encoding="utf-8"))

    ref_scene = find_scene(ref, PLACEMENT, CANVAS[0], CANVAS[1])
    target_scene = find_scene(target, PLACEMENT, CANVAS[0], CANVAS[1])
    if ref_scene is None:
        print(f"ERROR: {PLACEMENT} {CANVAS[0]}x{CANVAS[1]} not found in {REF.name}")
        sys.exit(1)
    if target_scene is None:
        print(f"ERROR: {PLACEMENT} {CANVAS[0]}x{CANVAS[1]} not found in {TARGET.name}")
        sys.exit(1)

    existing = {layout["name"] for layout in target_scene["layouts"]}
    added = 0

    for name in LAYOUT_NAMES:
        if name in existing:
            print(f"SKIP: {name} already present")
            continue

        source = next((l for l in ref_scene["layouts"] if l["name"] == name), None)
        if source is None:
            print(f"ERROR: {name} not found in ref {PLACEMENT} {CANVAS[0]}x{CANVAS[1]}")
            sys.exit(1)

        restored = copy.deepcopy(source)
        restored["id"] = ""
        target_scene["layouts"].append(restored)
        existing.add(name)
        added += 1
        print(f"Added: {name} with id=\"\"")

    TARGET.write_text(
        json.dumps(target, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Done: {added} layout(s) added -> {TARGET}")
    print(f"Total in {PLACEMENT} {CANVAS[0]}x{CANVAS[1]}: {len(target_scene['layouts'])} layouts")


if __name__ == "__main__":
    main()
