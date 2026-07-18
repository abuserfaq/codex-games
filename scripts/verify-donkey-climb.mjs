import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "donkey-climb", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "donkey-climb", "assets", "manifest.json");
const requiredAssets = ["scaffold.svg", "barrel.svg", "climber.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Donkey Climb game page is missing");
assert(existsSync(manifestPath), "Donkey Climb asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/donkey-climb/index.html"), "catalog does not link Donkey Climb");
assert(catalog.includes("<h2>Donkey Climb</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">63 игра</div>'), "Donkey Climb should be catalog item 63");

assert(game.includes("<title>Donkey Climb</title>"), "game title is missing");
assert(game.includes('aria-current="page">Donkey Climb</a>'), "game menu current link is missing");
assert(game.includes('class="play-panel climb-wrap"'), "Donkey Climb board markup is missing");
assert(game.includes("function canClimb"), "ladder rule is missing");
assert(game.includes("function advanceBarrels"), "barrel timing rule is missing");
assert(game.includes("window.__donkeyClimbTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "donkey-climb", "assets", asset);
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
    className: "",
    type: "",
    addEventListener() {},
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
  querySelectorAll(selector) {
    if (selector === "[data-move]") return [];
    return [];
  },
  createElement() {
    return noopElement();
  },
  addEventListener() {}
};
globalThis.window = {};
globalThis.setInterval = () => 0;
globalThis.clearInterval = () => {};

Function(source)();

const test = globalThis.window.__donkeyClimbTest;
assert(test, "test harness is not exposed");

test.stop();
test.reset();
test.stop();
let state = test.state();
assert(state.phase === "playing", "new game should start playable");
assert(state.player.row === 6 && state.player.col === 0, "player should start at the lower-left deck");
assert(state.lives === 3 && state.steps === 0, "new run should start with 3 lives and 0 steps");

assert(test.move("right"), "right movement should work on a deck");
state = test.state();
assert(state.player.col === 1 && state.steps === 1, "right move should advance the player and steps");

assert(!test.move("up"), "climb should fail away from ladders");
state = test.state();
assert(state.player.row === 6 && state.player.col === 1, "failed climb should hold position");

test.setPlayer(5, 2);
assert(test.move("up"), "climb should work on paired ladder cells");
state = test.state();
assert(state.player.row === 4 && state.player.col === 2, "ladder climb should move up one deck");

test.setPlayer(5, 7);
test.setBarrels([{ row: 5, col: 8, dir: -1 }]);
test.advanceBarrels();
state = test.state();
assert(state.lives === 2, "barrel collision should cost one life");
assert(state.player.row === 6 && state.player.col === 0, "collision should return player to start");

test.setBarrels([]);
test.setPlayer(0, 1);
state = test.state();
assert(state.phase === "won", "top platform should win the game");
assert(state.level === 2, "win should advance the level indicator");

assert(style.includes("Donkey Climb"), "root style guide does not include Donkey Climb");
assert(gamesStyle.includes("Donkey Climb"), "games style guide does not include Donkey Climb");

console.log("Donkey Climb catalog contract passed");
