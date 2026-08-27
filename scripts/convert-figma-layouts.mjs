const fs = require("fs");

const FIGMA = JSON.parse(
  fs.readFileSync("/Users/damir/Downloads/figma-banners-6frames.json", "utf8"),
);
const STAGE_PATH = "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905.json";

const SCENE_BY_BANNER = {
  "8480x864 - лево": "6a8ff6f0edbb25a4d3d63438",
  "8480x864 - право": "6a902dc455a81218ecfb51fc",
  "5280x320 - лево": "6a8ff70dd949b8c89b527b33",
  "5280x320 - право": "6a902d3c111b4a8d380097a2",
  "8736x1056 - лево": "6a8ff7260cf21ffc8256d1fd",
  "8736x1056 - право": "6a902ce335d396612e2c9619",
};

const FADE_H = { 864: 346, 320: 128, 1056: 423 };
const TITLES = { "wb-logo": "Лого WB", discount: "Скидка", disclaimer: "Дисклеймер" };

function normalize(name) {
  return name.replace(/×/g, "x").replace(/X/g, "x");
}

function numberedType(base, index) {
  return index === 0 ? base : `${base}-${index}`;
}

function isRvb(el) {
  return el.h > 50;
}

function makeDisclaimer(el, index) {
  const rvb = isRvb(el);
  return {
    properties: [
      { key: "fontSize", value: el.fontSize },
      { key: "fontWeight", value: 300 },
      { key: "align", value: "center" },
      { key: "theme", value: "light" },
      { key: "shadowEnabled", value: false },
      { key: "shadowOpacity", value: 0.22 },
      { key: "shadowHeight", value: 0.45 },
      { key: "shadowColor", value: "#000000" },
      { key: "vAlign", value: "bottom" },
      { key: "shiftZoneTop", value: 60 },
      { key: "x", value: el.x },
      { key: "y", value: el.y },
      { key: "w", value: el.w },
      { key: "h", value: el.h },
      { key: "text", value: rvb ? el.text : "" },
    ],
    title: TITLES.disclaimer,
    type: numberedType("disclaimer", index),
  };
}

function bannerToLayout(banner) {
  const height = banner.canvas.height;
  const logos = [];
  const discounts = [];
  const disclaimers = [];
  let li = 0,
    di = 0,
    ci = 0;

  for (const el of banner.elements) {
    if (el.type === "INSTANCE" && el.key === "wb-pill") {
      logos.push({
        properties: [
          { key: "x", value: el.x },
          { key: "y", value: el.y },
          { key: "w", value: el.w },
          { key: "h", value: el.h },
          { key: "appearDelaySec", value: 2 },
        ],
        title: TITLES["wb-logo"],
        type: numberedType("wb-logo", li++),
      });
    } else if (el.type === "INSTANCE" && el.key === "tag") {
      discounts.push({
        properties: [
          { key: "x", value: el.x },
          { key: "y", value: el.y },
          { key: "w", value: el.w },
          { key: "h", value: el.h },
          { key: "enabled", value: true },
          { key: "color", value: "#FFFF00" },
          { key: "textColor", value: "#000000" },
          { key: "shiftZoneBottom", value: 200 },
          { key: "text", value: "30" },
        ],
        title: TITLES.discount,
        type: numberedType("discount", di++),
      });
    } else if (el.type === "TEXT") {
      disclaimers.push(makeDisclaimer(el, ci++));
    }
  }

  const elements = [
    {
      properties: [{ key: "color", value: "#A3D9C4" }],
      title: "Фон",
      type: "background",
    },
    {
      properties: [
        { key: "fadeEnabled", value: false },
        { key: "fadeOpacity", value: 20 },
        { key: "fadeColor", value: "#000000" },
        { key: "fadePosition", value: "bottom" },
        { key: "h", value: FADE_H[height] },
      ],
      title: "Градиент подложка",
      type: "fade",
    },
    ...logos,
    ...discounts,
    ...disclaimers,
  ];

  return {
    id: require("crypto").randomBytes(12).toString("hex"),
    name: "Лейаут по умолчанию",
    durationSec: 15,
    elements,
  };
}

const stage = JSON.parse(fs.readFileSync(STAGE_PATH, "utf8"));
const byScene = {};

for (const banner of FIGMA.banners) {
  const sceneId = SCENE_BY_BANNER[normalize(banner.name)];
  if (!sceneId) throw new Error(`No scene for ${banner.name}`);
  byScene[sceneId] = bannerToLayout(banner);
}

let updated = 0;
for (const scene of stage.scenes) {
  if (byScene[scene.id]) {
    scene.layouts = [byScene[scene.id]];
    updated++;
  }
}

fs.writeFileSync(STAGE_PATH, JSON.stringify(stage, null, 2) + "\n");
console.log(`Updated ${updated} scenes`);
for (const [id, layout] of Object.entries(byScene)) {
  console.log(
    id,
    layout.elements.map((e) => e.type).join(", "),
  );
}
