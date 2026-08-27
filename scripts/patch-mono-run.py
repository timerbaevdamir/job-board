#!/usr/bin/env python3
import json, re
from pathlib import Path

TEST = Path("/Users/damir/Downloads/layouts-import-6a8465379e5fcb84500a9da2 (4).json")
STAGE = Path("/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (1).json")

SCENES = {
    (3584, 1632): "6a8ff4e724971b245c7e3e1a",
    (2176, 1120): "6a8ff73f00d2553e9ce7f205",
    (1036, 1080): "6a8ff75202a0b38e636c2cdb",
    (1440, 640): "6a8ff7645074313353e7f69d",
}

def add_align_left(props):
    out, inserted = [], False
    for p in props:
        if p.get("key") == "align":
            out.append({"key": "align", "value": "left"})
            inserted = True
            continue
        out.append(p)
        if not inserted and p.get("key") == "fontWeight":
            out.append({"key": "align", "value": "left"})
            inserted = True
    return out

def prepare_layouts(layouts):
    result = []
    for layout in layouts[:2]:
        copy = json.loads(json.dumps(layout))
        copy["id"] = ""
        for el in copy["elements"]:
            t = el.get("type", "")
            if t == "disclaimer" or re.match(r"disclaimer-\d+$", t):
                el["properties"] = add_align_left(el["properties"])
        result.append(copy)
    return result

test = json.loads(TEST.read_text(encoding="utf-8"))
stage = json.loads(STAGE.read_text(encoding="utf-8"))

by_canvas = {}
for scene in test["scenes"]:
    w, h = scene["canvas"]["width"], scene["canvas"]["height"]
    if (w, h) in SCENES:
        by_canvas[(w, h)] = prepare_layouts(scene["layouts"])

updated = 0
for scene in stage["scenes"]:
    key = (scene["canvas"]["width"], scene["canvas"]["height"])
    target_id = SCENES.get(key)
    if target_id and scene["id"] == target_id:
        scene["layouts"] = by_canvas[key]
        updated += 1
        names = ", ".join(f"{l['name']} {l['durationSec']}s" for l in scene["layouts"])
        print(f"{key[0]}x{key[1]}: {names}")

STAGE.write_text(json.dumps(stage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Updated {updated} scenes")
