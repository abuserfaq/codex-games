import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "night-driver", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "night-driver", "assets", "manifest.json");
const requiredAssets = ["road-glow.svg", "road-post.svg", "dash-wheel.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Night Driver game page is missing");
assert(existsSync(manifestPath), "Night Driver asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/night-driver/index.html"), "catalog does not link Night Driver");
assert(catalog.includes("<h2>Night Driver</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">62 игра</div>'), "Night Driver should be catalog item 62");

assert(game.includes("<title>Night Driver</title>"), "game title is missing");
assert(game.includes('aria-current="page">Night Driver</a>'), "game menu current link is missing");
assert(game.includes('class="play-panel night-wrap"'), "Night Driver board markup is missing");
assert(game.includes("function passGate"), "gate scoring rule is missing");
assert(game.includes("function step"), "tick rule is missing");
assert(game.includes("window.__nightDriverTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "night-driver", "assets", asset);
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

const test = globalThis.window.__nightDriverTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.phase === "playing", "new game should be playable");
assert(state.distance === 0 && state.lives === 3 && state.speed === 1, "new run should start at 0m, 3 lives, speed 1");
assert(state.carX === 0, "car should start centered");

test.press("right", true);
test.step(0.35);
test.press("right", false);
state = test.state();
assert(state.carX > 0, "right steering should move the car");

test.reset();
test.setCarX(0);
state = test.forceGate(0.99);
assert(state.distance === 50, "centered car should pass the first gate");
assert(state.lives === 3, "clean gate should not cost a life");

test.reset();
test.setCarX(-1);
state = test.forceGate(0.99);
assert(state.lives === 2, "wide miss should cost one life");
assert(state.message.includes("Reflector"), "miss message should mention reflector");

test.reset();
for (let i = 0; i < 10 && test.state().phase === "playing"; i += 1) {
  const gate = test.state();
  test.setCarX([-0.36, 0.18, 0.42, -0.2, -0.48, 0.08, 0.34, -0.12][gate.gateIndex % 8]);
  state = test.forceGate(0.99);
}
assert(state.phase === "won", "ten clean gates should win the run");
assert(state.distance >= 500, "winning run should reach the finish distance");

assert(style.includes("Night Driver"), "root style guide does not include Night Driver");
assert(gamesStyle.includes("Night Driver"), "games style guide does not include Night Driver");

console.log("Night Driver catalog contract passed");
