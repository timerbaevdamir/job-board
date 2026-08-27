import fs from "fs";

const TEST_PATH =
  "/Users/damir/Downloads/layouts-import-6a8465379e5fcb84500a9da2 (4).json";
const OUT_PATH =
  "/Users/damir/Documents/Job Board Interface Skeleton/scripts/mono-layouts-export.json";

const STAGE_SCENE_BY_CANVAS = {
  "3584x1632": "6a8ff4e724971b245c7e3e1a",
  "2176x1120": "6a8ff73f00d2553e9ce7f205",
  "1036x1080": "6a8ff75202a0b38e636c2cdb",
  "1440x640": "6a8ff7645074313353e7f69d",
};

function canvasKey(w, h) {
  return `${w}x${h}`;
}

function isDisclaimerType(type) {
  return type === "disclaimer" || /^disclaimer-\d+$/.test(type);
}

function addAlignLeft(props) {
  const next = [...props];
  const alignIdx = next.findIndex((p) => p.key === "align");
  if (alignIdx >= 0) {
    next[alignIdx] = { ...next[alignIdx], value: "left" };
    return next;
  }
  const fwIdx = next.findIndex((p) => p.key === "fontWeight");
  const insertAt = fwIdx >= 0 ? fwIdx + 1 : next.length;
  next.splice(insertAt, 0, { key: "align", value: "left" });
  return next;
}

function prepareLayouts(sourceLayouts) {
  return sourceLayouts.map((layout) => {
    const copy = JSON.parse(JSON.stringify(layout));
    copy.id = "";
    for (const element of copy.elements) {
      if (isDisclaimerType(element.type)) {
        element.properties = addAlignLeft(element.properties);
      }
    }
    return copy;
  });
}

const test = JSON.parse(fs.readFileSync(TEST_PATH, "utf8"));
const out = {};

for (const scene of test.scenes) {
  const key = canvasKey(scene.canvas.width, scene.canvas.height);
  const stageId = STAGE_SCENE_BY_CANVAS[key];
  if (!stageId) continue;
  out[stageId] = prepareLayouts(scene.layouts.slice(0, 2));
}

fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
console.log("exported", Object.keys(out).length, "scenes");
