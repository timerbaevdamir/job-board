#!/usr/bin/env python3
"""Convert long split Медиафасад Figma export into · МЕД / · БАД layouts."""

import copy
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

FIGMA_PATH = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else str(Path(__file__).resolve().parent / "figma-banners-14frames.json")
)
STAGE_PATH = Path(
    sys.argv[2]
    if len(sys.argv) > 2
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (11).json"
)

SCENE_BY_BANNER = {
    "8480x864 - лево": "6a8ff6f0edbb25a4d3d63438",
    "8480x864 - право": "6a902dc455a81218ecfb51fc",
    "5280x320 - лево": "6a8ff70dd949b8c89b527b33",
    "5280x320 - право": "6a902d3c111b4a8d380097a2",
    "8736x1056 - лево": "6a8ff7260cf21ffc8256d1fd",
    "8736x1056 - право": "6a902ce335d396612e2c9619",
}

LAYOUT_BASE = {
    "8480x864 - лево": "Океания 8480x864 - лево",
    "8480x864 - право": "Океания 8480x864 - право",
    "5280x320 - лево": "Сфера 5280x320 - лево",
    "5280x320 - право": "Сфера 5280x320 - право",
    "8736x1056 - лево": "Самбо 8736x1056 - лево",
    "8736x1056 - право": "Самбо 8736x1056 - право",
}

FADE_H = {864: 346, 320: 128, 1056: 423}
SPLIT_CANVAS = {(8480, 864), (5280, 320), (8736, 1056)}
VARIANT_ORDER = ("MED", "BAD")
VARIANT_LABEL = {"MED": "МЕД", "BAD": "БАД"}
EXTRA_VARIANT_ID = {"MED": "med-products", "BAD": "bads"}


def normalize_banner_name(name: str) -> str:
    return name.replace("×", "x").replace("X", "x").replace("х", "x")


def extract_banner_key(name: str) -> str:
    normalized = normalize_banner_name(name)
    for prefix in ("Океания ", "Сфера ", "Самбо "):
        if normalized.startswith(prefix):
            return normalized[len(prefix) :]
    return normalized


def side_align(banner_key: str) -> str:
    return "left" if "лево" in banner_key else "right"


def classify_variant(banner: dict) -> str:
    for el in banner.get("elements", []):
        if el.get("type") != "TEXT":
            continue
        kind = classify_text(el)
        if kind == "bad":
            return "BAD"
        if kind == "med":
            return "MED"
    raise ValueError(f"Cannot classify MED/BAD for banner {banner['name']!r}")


def classify_text(el: dict) -> str:
    blob = " ".join(str(el.get(key) or "") for key in ("text", "sourceName", "key")).lower()
    text = str(el.get("text") or "").lower()
    if "противопоказан" in blob:
        return "med"
    if "бад" in blob or "лекарствен" in blob:
        return "bad"
    if "количество товара" in text or "количество товара" in blob:
        return "quantity"
    if "wildberries" in blob or "скидки на конкретные" in blob:
        return "rvb"
    if el.get("h", 0) > 50:
        return "rvb"
    return "quantity"


def is_extra_disclaimer(el: dict) -> bool:
    """MED/BAD — отдельный элемент extra-disclaimer, не обычный disclaimer."""
    return classify_text(el) in ("med", "bad")


def is_long_disclaimer(el: dict) -> bool:
    kind = classify_text(el)
    return kind in ("med", "bad", "rvb") or el.get("h", 0) > 50


def numbered_type(base_type: str, index: int) -> str:
    return base_type if index == 0 else f"{base_type}-{index}"


def bbox(elements: List[dict]) -> dict:
    x1 = min(el["x"] for el in elements)
    y1 = min(el["y"] for el in elements)
    x2 = max(el["x"] + el["w"] for el in elements)
    y2 = max(el["y"] + el["h"] for el in elements)
    return {"x": x1, "y": y1, "w": x2 - x1, "h": y2 - y1}


def make_extra_disclaimer(variant: str, elements: List[dict], align: str) -> dict:
    variant_id = EXTRA_VARIANT_ID[variant]
    box = bbox(elements)
    line_gap = 16 if box["h"] <= 250 else 40
    first_line_pct = 46 if variant == "MED" else 50

    return {
        "properties": [
            {"key": "extraDisclaimerId", "value": variant_id},
            {"key": "theme", "value": "light"},
        ],
        "title": "Доп. дисклеймер",
        "type": "extra-disclaimer",
        "variants": {
            variant_id: [
                {"key": "x", "value": box["x"]},
                {"key": "y", "value": box["y"]},
                {"key": "w", "value": box["w"]},
                {"key": "h", "value": box["h"]},
                {"key": "topMargin", "value": 0},
                {"key": "strokePx", "value": 4},
                {"key": "strokePxFirst", "value": 4},
                {"key": "lineGapPx", "value": line_gap},
                {"key": "firstLineHeightPct", "value": first_line_pct},
                {"key": "align", "value": align},
                {"key": "theme", "value": "light"},
                {"key": "shadowEnabled", "value": False},
                {"key": "shadowOpacity", "value": 0.22},
                {"key": "shadowHeight", "value": 0.45},
                {"key": "shadowColor", "value": "#000000"},
            ]
        },
    }


def make_background() -> dict:
    return {
        "properties": [{"key": "color", "value": "#A3D9C4"}],
        "title": "Фон",
        "type": "background",
    }


def make_fade(height: int) -> dict:
    return {
        "properties": [
            {"key": "fadeEnabled", "value": False},
            {"key": "fadeOpacity", "value": 20},
            {"key": "fadeColor", "value": "#000000"},
            {"key": "fadePosition", "value": "bottom"},
            {"key": "h", "value": FADE_H[height]},
        ],
        "title": "Градиент подложка",
        "type": "fade",
    }


def make_wb_logo(el: dict, index: int) -> dict:
    base = "wb-logo"
    return {
        "properties": [
            {"key": "x", "value": el["x"]},
            {"key": "y", "value": el["y"]},
            {"key": "w", "value": el["w"]},
            {"key": "h", "value": el["h"]},
            {"key": "appearDelaySec", "value": 2},
        ],
        "title": "Лого WB",
        "type": numbered_type(base, index),
    }


def make_discount_from_figma(el: dict, index: int = 0) -> dict:
    return {
        "properties": [
            {"key": "x", "value": el["x"]},
            {"key": "y", "value": el["y"]},
            {"key": "w", "value": el["w"]},
            {"key": "h", "value": el["h"]},
            {"key": "enabled", "value": True},
            {"key": "color", "value": "#FFFF00"},
            {"key": "textColor", "value": "#000000"},
            {"key": "shiftZoneBottom", "value": 200},
            {"key": "text", "value": "30"},
        ],
        "title": "Скидка",
        "type": numbered_type("discount", index),
    }


def prop_value(el: dict, key: str):
    for prop in el.get("properties", []):
        if prop["key"] == key:
            return prop["value"]
    return None


def disclaimer_elements(base_layout: Optional[dict]) -> List[dict]:
    if base_layout is None:
        return []
    return [
        el for el in base_layout["elements"] if el["type"].startswith("disclaimer")
    ]


def make_disclaimer(
    el: dict,
    index: int,
    align: str,
    text: Optional[str] = None,
    position: Optional[dict] = None,
) -> dict:
    if text is None:
        kind = classify_text(el)
        if kind == "rvb":
            text = el.get("text", "")
        else:
            text = ""

    x = position["x"] if position else el["x"]
    y = position["y"] if position else el["y"]

    properties = [
        {"key": "fontSize", "value": el["fontSize"]},
        {"key": "fontWeight", "value": 300},
        {"key": "align", "value": align},
        {"key": "theme", "value": "light"},
        {"key": "shadowEnabled", "value": False},
        {"key": "shadowOpacity", "value": 0.22},
        {"key": "shadowHeight", "value": 0.45},
        {"key": "shadowColor", "value": "#000000"},
        {"key": "vAlign", "value": "bottom"},
        {"key": "x", "value": x},
        {"key": "y", "value": y},
        {"key": "w", "value": el["w"]},
        {"key": "h", "value": el["h"]},
        {"key": "text", "value": text},
    ]
    if not is_long_disclaimer(el):
        properties.insert(8, {"key": "shiftZoneTop", "value": 60})

    return {
        "properties": properties,
        "title": "Дисклеймер",
        "type": numbered_type("disclaimer", index),
    }


def find_base_layout(scene: dict) -> Optional[dict]:
    for layout in scene.get("layouts", []):
        if " · " not in layout["name"]:
            return layout
    return None


def logo_elements(base_layout: Optional[dict]) -> List[dict]:
    if base_layout is None:
        return []
    return [
        copy.deepcopy(el)
        for el in base_layout["elements"]
        if el["type"].startswith("wb-logo")
    ]


def discount_element(base_layout: Optional[dict]) -> Optional[dict]:
    if base_layout is None:
        return None
    for el in base_layout["elements"]:
        if el["type"].startswith("discount"):
            return copy.deepcopy(el)
    return None


def banner_to_layout(banner: dict, variant: str, base_layout: Optional[dict]) -> dict:
    banner_key = extract_banner_key(banner["name"])
    base_name = LAYOUT_BASE[banner_key]
    label = VARIANT_LABEL[variant]
    height = banner["canvas"]["height"]

    logos = logo_elements(base_layout)
    discount = discount_element(base_layout)
    disclaimers: List[dict] = []
    extra_elements: List[dict] = []
    disclaimer_i = 0
    base_disclaimers = disclaimer_elements(base_layout)
    base_disclaimer_i = 0

    for el in banner["elements"]:
        if el["type"] == "INSTANCE" and el["key"] == "wb-pill":
            logos.append(make_wb_logo(el, len(logos)))
        elif el["type"] == "INSTANCE" and el["key"] == "tag":
            discount = make_discount_from_figma(el)
        elif el["type"] == "TEXT":
            kind = classify_text(el)
            if variant == "MED" and kind == "bad":
                continue
            if variant == "BAD" and kind == "med":
                continue
            if is_extra_disclaimer(el):
                extra_elements.append(el)
                continue
            align = "center"
            position = None
            if kind == "quantity" and base_disclaimer_i < len(base_disclaimers):
                base_el = base_disclaimers[base_disclaimer_i]
                position = {
                    "x": prop_value(base_el, "x"),
                    "y": prop_value(base_el, "y"),
                }
                base_disclaimer_i += 1
            disclaimers.append(make_disclaimer(el, disclaimer_i, align, position=position))
            disclaimer_i += 1

    if discount is None:
        raise ValueError(f"No discount for {base_name} · {label}")
    if not extra_elements:
        raise ValueError(f"No extra disclaimer texts for {base_name} · {label}")

    elements = [
        make_background(),
        make_fade(height),
        *logos,
        discount,
        *disclaimers,
        make_extra_disclaimer(variant, extra_elements, side_align(banner_key)),
    ]

    return {
        "id": "",
        "name": f"{base_name} · {label}",
        "durationSec": 15,
        "elements": elements,
    }


def merge_layout_ids(old_layouts: List[dict], new_layout: dict) -> dict:
    for old in old_layouts:
        if old["name"] == new_layout["name"]:
            merged = copy.deepcopy(new_layout)
            merged["id"] = old.get("id", "")
            return merged
    return new_layout


def main() -> None:
    if not FIGMA_PATH.is_file():
        print(f"File not found: {FIGMA_PATH}")
        sys.exit(1)

    figma = json.loads(FIGMA_PATH.read_text(encoding="utf-8"))
    stage = json.loads(STAGE_PATH.read_text(encoding="utf-8"))

    layouts_by_scene: Dict[str, Dict[str, dict]] = {}
    base_by_scene: Dict[str, Optional[dict]] = {}

    for scene in stage["scenes"]:
        if scene["id"] in SCENE_BY_BANNER.values():
            base_by_scene[scene["id"]] = find_base_layout(scene)

    for banner in figma["banners"]:
        canvas = banner["canvas"]
        size = (canvas["width"], canvas["height"])
        if size not in SPLIT_CANVAS:
            continue

        banner_key = extract_banner_key(banner["name"])
        scene_id = SCENE_BY_BANNER.get(banner_key)
        if scene_id is None:
            print(f"SKIP: no scene mapping for {banner['name']!r}")
            continue

        variant = classify_variant(banner)
        base_layout = base_by_scene.get(scene_id)
        layout = banner_to_layout(banner, variant, base_layout)
        layouts_by_scene.setdefault(scene_id, {})[variant] = layout
        print(
            f"OK {layout['name']} ({len(layout['elements'])} elements, "
            f"logos={sum(1 for e in layout['elements'] if e['type'].startswith('wb-logo'))}, "
            f"extra={'yes' if any(e['type'] == 'extra-disclaimer' for e in layout['elements']) else 'no'})"
        )

    updated = 0
    for scene in stage["scenes"]:
        scene_id = scene["id"]
        if scene_id not in layouts_by_scene:
            continue

        by_variant = layouts_by_scene[scene_id]
        missing = [v for v in VARIANT_ORDER if v not in by_variant]
        if missing:
            labels = ", ".join(VARIANT_LABEL[v] for v in missing)
            raise ValueError(f"Scene {scene_id} missing variants: {labels}")

        old_layouts = scene.get("layouts", [])
        base_layouts = [l for l in old_layouts if " · " not in l["name"]]
        variant_layouts = [
            merge_layout_ids(old_layouts, by_variant[v]) for v in VARIANT_ORDER
        ]
        scene["layouts"] = base_layouts + variant_layouts
        updated += 1
        print(f"Scene {scene_id}: {[l['name'] for l in scene['layouts']]}")

    STAGE_PATH.write_text(
        json.dumps(stage, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"\nUpdated {updated} split scenes -> {STAGE_PATH}")


if __name__ == "__main__":
    main()
