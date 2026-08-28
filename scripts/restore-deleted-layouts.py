#!/usr/bin/env python3
"""Restore accidentally deleted layouts; remove wrong restores."""

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
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (5).json"
)

# Remove layouts added to the wrong scene by mistake.
REMOVE = [
    ("Метро_Экраны", 1080, 1920, "Метро_Экраны_1080_1920_Селлеры_5"),
]

# Copy from reference file into target scene with id cleared.
RESTORE_FROM_REF = [
    ("Метро_Экраны", 2160, 3840, "Крупная справа"),
]

# Copy from the 5s block inside the same target scene, set new duration and id="".
COPY_IN_SCENE = [
    ("Ситиборд", 960, 720, "Мелкая справа", 15),
    ("Ситиборд", 960, 720, "Крупная слева", 15),
    ("Ситиборд", 960, 720, "Мелкая внизу", 15),
    ("Ситиборд", 960, 720, "Крупная справа", 15),
]


def find_scene(data: dict, placement: str, w: int, h: int) -> Optional[dict]:
    for scene in data["scenes"]:
        if scene["placement"]["name"] != placement:
            continue
        if scene["canvas"]["width"] != w or scene["canvas"]["height"] != h:
            continue
        return scene
    return None


def find_layout(scene: dict, name: str, duration_sec: Optional[int] = None) -> Optional[dict]:
    for layout in scene["layouts"]:
        if layout["name"] != name:
            continue
        if duration_sec is not None and layout.get("durationSec") != duration_sec:
            continue
        return layout
    return None


def main() -> None:
    ref = json.loads(REF.read_text(encoding="utf-8"))
    target = json.loads(TARGET.read_text(encoding="utf-8"))

    for placement, w, h, name in REMOVE:
        scene = find_scene(target, placement, w, h)
        if scene is None:
            print(f"SKIP remove: scene {placement} {w}x{h} not found")
            continue
        before = len(scene["layouts"])
        scene["layouts"] = [l for l in scene["layouts"] if l["name"] != name]
        removed = before - len(scene["layouts"])
        if removed:
            print(f"Removed: {name} from {placement} {w}x{h}")
        else:
            print(f"SKIP remove: {name} not in {placement} {w}x{h}")

    for placement, w, h, name in RESTORE_FROM_REF:
        ref_scene = find_scene(ref, placement, w, h)
        if ref_scene is None:
            print(f"ERROR: {name} scene not found in {REF.name}")
            sys.exit(1)
        layout = find_layout(ref_scene, name)
        if layout is None:
            print(f"ERROR: {name} not found in {REF.name}")
            sys.exit(1)

        target_scene = find_scene(target, placement, w, h)
        if target_scene is None:
            print(f"ERROR: scene {placement} {w}x{h} not found in {TARGET.name}")
            sys.exit(1)

        if find_layout(target_scene, name) is not None:
            print(f"SKIP restore: {name} already in {placement} {w}x{h}")
            continue

        restored = copy.deepcopy(layout)
        restored["id"] = ""
        target_scene["layouts"].append(restored)
        print(f"Restored: {name} ({placement} {w}x{h}) with id=\"\"")

    for placement, w, h, name, duration in COPY_IN_SCENE:
        scene = find_scene(target, placement, w, h)
        if scene is None:
            print(f"ERROR: scene {placement} {w}x{h} not found")
            sys.exit(1)

        if find_layout(scene, name, duration) is not None:
            print(f"SKIP copy: {name} {duration}s already in {placement} {w}x{h}")
            continue

        source = find_layout(scene, name, 5)
        if source is None:
            print(f"ERROR: 5s source {name} not found in {placement} {w}x{h}")
            sys.exit(1)

        copied = copy.deepcopy(source)
        copied["id"] = ""
        copied["durationSec"] = duration
        scene["layouts"].append(copied)
        print(f"Copied: {name} -> {duration}s ({placement} {w}x{h}) with id=\"\"")

    TARGET.write_text(
        json.dumps(target, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {TARGET}")


if __name__ == "__main__":
    main()
