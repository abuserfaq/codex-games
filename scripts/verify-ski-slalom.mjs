import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "ski-slalom", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "ski-slalom", "assets", "manifest.json");
const requiredAssets = ["snow-field.svg", "skier.svg", "gate-flag.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Ski Slalom game page is missing");
assert(existsSync(manifestPath), "Ski Slalom asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/ski-slalom/index.html"), "catalog does not link Ski Slalom");
assert(catalog.includes("<h2>Ski Slalom</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">64 игра</div>'), "Ski Slalom should be catalog item 64");

assert(game.includes("<title>Ski Slalom</title>"), "game title is missing");
assert(game.includes('aria-current="page">Ski Slalom</a>'), "game menu current link is missing");
assert(game.includes('class="play-panel ski-wrap"'), "Ski Slalom board markup is missing");
assert(game.includes("function scoreGate"), "gate scoring rule is missing");
assert(game.includes("function step"), "tick rule is missing");
assert(game.includes("window.__skiSlalomTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "ski-slalom", "assets", asset);
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
    remove() {},
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

const test = globalThis.window.__skiSlalomTest;
assert(test, "test harness is not exposed");

test.stop();
test.reset();
test.stop();
let state = test.state();
assert(state.phase === "playing", "new game should be playable");
assert(state.gateIndex === 0 && state.misses === 0 && state.speed === 1, "new run should start at gate 0, 0 misses, speed 1");
assert(state.skierX === 0, "skier should start centered");

test.press("right", true);
test.step(0.35);
test.press("right", false);
state = test.state();
assert(state.skierX > 0, "right steering should move the skier");

test.reset();
test.stop();
test.setSkierX(-0.42);
state = test.forceGate(0.99);
assert(state.gateIndex === 1, "clean first gate should advance the gate count");
assert(state.misses === 0, "clean gate should not add a miss");

test.reset();
test.stop();
test.setSkierX(1);
state = test.forceGate(0.99);
assert(state.misses === 1, "wide miss should add one miss");
assert(state.message.includes("Flag missed"), "miss message should mention the missed flag");

test.reset();
test.stop();
for (let i = 0; i < 12 && test.state().phase === "playing"; i += 1) {
  const s = test.state();
  const centers = [-0.42, 0.28, -0.18, 0.48, -0.52, 0.08, 0.38, -0.3];
  test.setSkierX(centers[s.gateIndex % centers.length]);
  state = test.forceGate(0.99);
}
assert(state.phase === "won", "twelve clean gates should win the run");
assert(state.gateIndex >= 12, "winning run should finish all gates");

assert(style.includes("Ski Slalom"), "root style guide does not include Ski Slalom");
assert(gamesStyle.includes("Ski Slalom"), "games style guide does not include Ski Slalom");

console.log("Ski Slalom catalog contract passed");
