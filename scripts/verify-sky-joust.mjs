import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "sky-joust", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "sky-joust", "assets", "manifest.json");
const requiredAssets = ["arena-moon.svg", "rider-blue.svg", "rider-gold.svg", "lance-spark.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Sky Joust game page is missing");
assert(existsSync(manifestPath), "Sky Joust asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/sky-joust/index.html"), "catalog does not link Sky Joust");
assert(catalog.includes("<h2>Sky Joust</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">60 игра</div>'), "Sky Joust should be catalog item 60");

assert(game.includes("<title>Sky Joust</title>"), "game title is missing");
assert(game.includes('aria-current="page">Sky Joust</a>'), "game menu current link is missing");
assert(game.includes('class="play-panel joust-wrap"'), "Sky Joust arena markup is missing");
assert(game.includes("function resolveClash"), "clash rule is missing");
assert(game.includes("window.__skyJoustTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "sky-joust", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

const source = game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "inline script is missing");

function noopElement() {
  return {
    textContent: "",
    innerHTML: "",
    disabled: false,
    dataset: {},
    style: {},
    addEventListener() {},
    setPointerCapture() {},
    append() {},
    setAttribute() {},
    querySelectorAll() {
      return [];
    },
    classList: {
      add() {},
      remove() {},
      toggle() {}
    }
  };
}

const elements = new Map();
globalThis.document = {
  querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, noopElement());
    return elements.get(selector);
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return noopElement();
  },
  addEventListener() {}
};
globalThis.window = {};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

Function(source)();

const test = globalThis.window.__skyJoustTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.phase === "playing", "new game should be playable");
assert(state.score === 0 && state.round === 1, "new game should start at score 0 round 1");
assert(state.player.x < state.rival.x, "riders should start opposite each other");
assert(state.time === 45, "round timer should start at 45");

test.press("right", true);
test.flap();
test.step(0.1);
state = test.state();
assert(state.player.vx > 0, "right input should accelerate the player");
assert(state.player.vy < 0, "flap should lift the player");
test.press("right", false);

state = test.forceClash(120, 154);
assert(state.score === 1, "higher player clash should score");
assert(state.round === 2, "winning clash should advance the round");
assert(state.message.includes("Clean upper lance"), "win message should be shown");

test.reset();
state = test.forceClash(150, 120);
assert(state.phase === "ended", "lower player clash should end the game");
assert(state.message.includes("gold rider"), "loss message should mention the gold rider");

assert(style.includes("Sky Joust"), "root style guide does not include Sky Joust");
assert(gamesStyle.includes("Sky Joust"), "games style guide does not include Sky Joust");

console.log("Sky Joust catalog contract passed");
