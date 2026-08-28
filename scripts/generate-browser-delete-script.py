#!/usr/bin/env python3
"""Extract layout IDs marked 'удалить' and print a browser-console delete script."""

import json
import sys
from pathlib import Path

MARK = "удалить "
SOURCE = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (3).json"
)
OUT = Path(__file__).resolve().parent / "browser-delete-layouts.js"


def main() -> None:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    targets = []
    for scene in data["scenes"]:
        for layout in scene.get("layouts", []):
            name = layout.get("name", "")
            lid = layout.get("id", "")
            if name.startswith(MARK) and lid:
                targets.append(
                    {
                        "id": lid,
                        "name": name,
                        "sceneId": scene["id"],
                        "scene": f'{scene["placement"]["name"]} {scene["canvas"]["width"]}x{scene["canvas"]["height"]}',
                    }
                )

    print(f"Found {len(targets)} layouts to delete\n")

    js = f"""// 1) Open admin in browser, DevTools → Network
// 2) Delete ONE layout manually, find the request (method + URL)
// 3) Replace DELETE_URL below, then paste this whole file into Console

const TARGETS = {json.dumps(targets, ensure_ascii=False, indent=2)};

// Example: (id) => `/api/layouts/${{id}}`
// Or copy exact URL from Network tab and replace LAYOUT_ID placeholder
const DELETE_URL = (id) => `/api/layouts/${{id}}`;  // <-- FIX ME
const METHOD = "DELETE";  // or "POST" if your API uses POST

async function sleep(ms) {{ return new Promise(r => setTimeout(r, ms)); }}

(async () => {{
  let ok = 0, fail = 0;
  for (const t of TARGETS) {{
    try {{
      const res = await fetch(DELETE_URL(t.id), {{
        method: METHOD,
        credentials: "include",
        headers: {{ "Content-Type": "application/json" }},
      }});
      if (!res.ok) throw new Error(await res.text());
      console.log("OK", t.name, t.id);
      ok++;
    }} catch (e) {{
      console.error("FAIL", t.name, t.id, e);
      fail++;
    }}
    await sleep(300);
  }}
  console.log(`Done: ${{ok}} deleted, ${{fail}} failed`);
}})();
"""

    OUT.write_text(js, encoding="utf-8")
    print(f"Written -> {OUT}")
    print("\nFirst 5 targets:")
    for t in targets[:5]:
        print(f"  {t['id']}  {t['name'][:60]}")


if __name__ == "__main__":
    main()
