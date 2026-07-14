import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "hunt-the-wumpus", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "hunt-the-wumpus", "assets", "manifest.json");
const requiredAssets = ["cave-map.svg", "wumpus-eye.svg", "hunter-arrow.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Hunt the Wumpus game page is missing");
assert(existsSync(manifestPath), "Hunt the Wumpus asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/hunt-the-wumpus/index.html"), "catalog does not link Hunt the Wumpus");
assert(catalog.includes("<h2>Hunt the Wumpus</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">59 игра</div>'), "Hunt the Wumpus should be catalog item 59");

assert(game.includes("<title>Hunt the Wumpus</title>"), "game title is missing");
assert(game.includes('aria-current="page">Hunt the Wumpus</a>'), "game menu current link is missing");
assert(game.includes('class="play-panel wumpus-wrap"'), "Wumpus board markup is missing");
assert(game.includes("function moveTo"), "move rule is missing");
assert(game.includes("function shoot"), "shoot rule is missing");
assert(game.includes("window.__wumpusTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "hunt-the-wumpus", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

const source = game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "inline script is missing");

const noopElement = () => ({
  textContent: "",
  innerHTML: "",
  className: "",
  disabled: false,
  dataset: {},
  style: {},
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
});

globalThis.document = {
  querySelector() {
    return noopElement();
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
Function(source)();

const test = globalThis.window.__wumpusTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.phase === "playing", "new game should be playable");
assert(state.room === 1, "hunter starts in room 1");
assert(state.wumpus === 8, "Wumpus should be in room 8 for the compact puzzle");
assert(state.pits.includes(4) && state.pits.includes(10), "pit layout should be deterministic");
assert(test.clues().length === 0, "starting room should have no immediate hazard clue");

assert(test.moveTo(2), "hunter should move through an adjacent tunnel");
state = test.state();
assert(state.room === 2 && state.moves === 1, "move should update room and move count");
assert(!test.moveTo(10), "hunter cannot move to a disconnected room");

assert(test.moveTo(3), "hunter should reach the clue room");
assert(test.clues().includes("stench"), "room 3 should smell the adjacent Wumpus");
assert(test.clues().includes("draft"), "room 3 should feel the adjacent pit");
assert(test.toggleShoot(), "shoot mode should toggle on");
assert(test.shoot(8), "hunter should shoot the adjacent Wumpus");
state = test.state();
assert(state.phase === "ended", "successful shot should end the game");
assert(state.arrows === 0, "arrow should be spent after shooting");
assert(state.message.includes("Clean shot"), "win message should be shown");

test.reset();
assert(test.moveTo(5), "hunter should move toward a pit");
assert(test.moveTo(10), "entering a pit room should be allowed as a losing move");
state = test.state();
assert(state.phase === "ended", "pit should end the game");
assert(state.message.includes("pit"), "pit loss message should be shown");

assert(style.includes("Hunt the Wumpus"), "root style guide does not include Hunt the Wumpus");
assert(gamesStyle.includes("Hunt the Wumpus"), "games style guide does not include Hunt the Wumpus");

console.log("Hunt the Wumpus catalog contract passed");
