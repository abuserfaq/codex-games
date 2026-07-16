import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "tapper-counter", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "tapper-counter", "assets", "manifest.json");
const requiredAssets = ["bar-wood.svg", "mug.svg", "patron.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Tapper Counter game page is missing");
assert(existsSync(manifestPath), "Tapper Counter asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/tapper-counter/index.html"), "catalog does not link Tapper Counter");
assert(catalog.includes("<h2>Tapper Counter</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">61 игра</div>'), "Tapper Counter should be catalog item 61");

assert(game.includes("<title>Tapper Counter</title>"), "game title is missing");
assert(game.includes('aria-current="page">Tapper Counter</a>'), "game menu current link is missing");
assert(game.includes('class="play-panel tapper-wrap"'), "Tapper Counter board markup is missing");
assert(game.includes("function serve"), "serve rule is missing");
assert(game.includes("function resolveHits"), "hit resolution is missing");
assert(game.includes("window.__tapperCounterTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "tapper-counter", "assets", asset);
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

const test = globalThis.window.__tapperCounterTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.phase === "playing", "new game should be playable");
assert(state.score === 0 && state.lives === 3 && state.wave === 1, "new shift should start with score 0, 3 lives, wave 1");
assert(state.lane === 1, "bartender should start on lane 2");

assert(test.changeLane(-1), "up control should move lanes");
state = test.state();
assert(state.lane === 0, "up control should reach lane 1");
assert(test.changeLane(1), "down control should move lanes");
state = test.state();
assert(state.lane === 1, "down control should return to lane 2");

test.setLane(1);
test.placePatron(1, 170);
assert(test.serve(), "serve should create a mug");
test.step(0.22);
state = test.state();
assert(state.score >= 10, "served mug should score when it hits a patron");
assert(state.patrons[0].x > 170, "patron should be pushed back by a served mug");

test.reset();
test.placePatron(2, 92);
test.step(0.1);
state = test.state();
assert(state.lives === 2, "patron reaching taps should cost one life");
assert(state.message.includes("patron"), "tap breach message should mention patron");

test.reset();
test.setLane(3);
assert(test.serve(), "serve should be available after reset");
test.step(2.6);
state = test.state();
assert(state.lives === 2, "missed mug should cost one life");
assert(state.message.includes("mug"), "missed mug message should mention mug");

assert(style.includes("Tapper Counter"), "root style guide does not include Tapper Counter");
assert(gamesStyle.includes("Tapper Counter"), "games style guide does not include Tapper Counter");

console.log("Tapper Counter catalog contract passed");
