#!/usr/bin/env python3
"""Mark duplicate and junk layouts for manual deletion in import JSON."""

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

STAGE = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (3).json"
)

MARK = "удалить "
JUNK_PATTERNS = [
    re.compile(r"^тест\d*$", re.I),
    re.compile(r"^test\d*$", re.I),
    re.compile(r"лейаут по умолчанию", re.I),
    re.compile(r"^по умолчанию$", re.I),
    re.compile(r"^default$", re.I),
]


def is_junk(name: str) -> bool:
    stripped = name.removeprefix(MARK).strip()
    return any(p.search(stripped) for p in JUNK_PATTERNS)


def normalize_name(name: str) -> str:
    return name.removeprefix(MARK).strip().casefold()


def should_mark(name: str) -> bool:
    return not name.startswith(MARK)


def mark(name: str) -> str:
    base = name.removeprefix(MARK)
    return MARK + base if not base.startswith(MARK) else name


def main() -> None:
    data = json.loads(STAGE.read_text(encoding="utf-8"))
    dup_marked = 0
    junk_marked = 0

    for scene in data["scenes"]:
        layouts = scene.get("layouts", [])
        by_name: dict[str, list[int]] = defaultdict(list)
        for i, layout in enumerate(layouts):
            key = normalize_name(layout.get("name", ""))
            by_name[key].append(i)

        duplicate_indices: set[int] = set()
        for _key, indices in by_name.items():
            if len(indices) < 2:
                continue
            # Prefer keeping a non-junk layout; among those, keep earliest
            sorted_idx = sorted(indices)
            keep = sorted_idx[0]
            for idx in sorted_idx:
                if not is_junk(layouts[idx].get("name", "")):
                    keep = idx
                    break
            for idx in sorted_idx:
                if idx != keep:
                    duplicate_indices.add(idx)

        for i, layout in enumerate(layouts):
            name = layout.get("name", "")
            if not should_mark(name):
                continue
            if i in duplicate_indices:
                layout["name"] = MARK + name
                dup_marked += 1
            elif is_junk(name):
                layout["name"] = MARK + name
                junk_marked += 1

    STAGE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Marked duplicates: {dup_marked}")
    print(f"Marked junk: {junk_marked}")
    print(f"Total marked: {dup_marked + junk_marked}")
    print(f"-> {STAGE}")


if __name__ == "__main__":
    main()
