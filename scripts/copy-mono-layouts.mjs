import fs from "fs";

const TEST_PATH =
  "/Users/damir/Downloads/layouts-import-6a8465379e5fcb84500a9da2 (4).json";
const STAGE_PATH =
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (1).json";

const CANVAS_SIZES = [
  [3584, 1632],
  [2176, 1120],
  [1036, 1080],
  [1440, 640],
];

const STAGE_SCENE_BY_CANVAS = {
  "3584x1632": "6a8ff4e724971b245c7e3e1a",
  "2176x1120": "6a8ff73f00d2553e9ce7f205",
  "1036x1080": "6a8ff75202a0b38e636c2cdb",
  "1440x640": "6a8ff7645074313353e7f69d",
};

function canvasKey(w, h) {
  return `${w}x${h}`;
}

function newId() {
  return "";
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
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
    const copy = deepClone(layout);
    copy.id = newId();
    for (const element of copy.elements) {
      if (isDisclaimerType(element.type)) {
        element.properties = addAlignLeft(element.properties);
      }
    }
    return copy;
  });
}

const test = JSON.parse(fs.readFileSync(TEST_PATH, "utf8"));
const stage = JSON.parse(fs.readFileSync(STAGE_PATH, "utf8"));

const testByCanvas = new Map();
for (const scene of test.scenes) {
  const key = canvasKey(scene.canvas.width, scene.canvas.height);
  if (CANVAS_SIZES.some(([w, h]) => w === scene.canvas.width && h === scene.canvas.height)) {
    testByCanvas.set(key, scene.layouts);
  }
}

let updated = 0;
for (const scene of stage.scenes) {
  const key = canvasKey(scene.canvas.width, scene.canvas.height);
  const stageId = STAGE_SCENE_BY_CANVAS[key];
  if (!stageId || scene.id !== stageId) continue;

  const sourceLayouts = testByCanvas.get(key);
  if (!sourceLayouts?.length) {
    console.warn(`No test layouts for ${key}`);
    continue;
  }

  scene.layouts = prepareLayouts(sourceLayouts);
  updated++;
  console.log(
    `${key} (${scene.id}): ${scene.layouts.map((l) => `${l.name} ${l.durationSec}s`).join(", ")}`,
  );
}

fs.writeFileSync(STAGE_PATH, JSON.stringify(stage, null, 2) + "\n");
console.log(`\nUpdated ${updated} mono scenes`);
