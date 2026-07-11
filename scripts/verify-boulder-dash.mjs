import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "boulder-dash", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "boulder-dash", "assets", "manifest.json");
const requiredAssets = ["cave-wall.svg", "crystal.svg", "boulder.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Boulder Dash Pocket game page is missing");
assert(existsSync(manifestPath), "Boulder Dash Pocket asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/boulder-dash/index.html"), "catalog does not link Boulder Dash Pocket");
assert(catalog.includes("<h2>Boulder Dash Pocket</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">56 игра</div>'), "Boulder Dash Pocket should be catalog item 56");

assert(game.includes("<title>Boulder Dash Pocket</title>"), "game title is missing");
assert(game.includes('aria-current="page">Boulder Dash Pocket</a>'), "game menu current link is missing");
assert(game.includes('class="boulder-board"'), "Boulder Dash Pocket board markup is missing");
assert(game.includes("function applyGravity"), "falling boulder rule is missing");
assert(game.includes("function move"), "miner movement rule is missing");
assert(game.includes("window.__boulderDashTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "boulder-dash", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

const source = game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "inline script is missing");
globalThis.document = {
  querySelector() {
    return {
      textContent: "",
      innerHTML: "",
      addEventListener() {},
      append() {},
      setAttribute() {},
      style: { setProperty() {} },
      dataset: {},
      classList: { add() {} },
      disabled: false
    };
  },
  querySelectorAll() {
    return ["up", "left", "down", "right"].map((move) => ({
      dataset: { move },
      addEventListener() {},
      disabled: false
    }));
  },
  createElement() {
    return {
      className: "",
      type: "",
      role: "",
      dataset: {},
      style: { setProperty() {} },
      classList: { add() {} },
      setAttribute() {},
      addEventListener() {}
    };
  }
};
globalThis.window = { addEventListener() {} };
Function(source)();
const test = globalThis.window.__boulderDashTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.player.row === 1 && state.player.col === 1, "miner should start at row 1, col 1");
assert(test.move("right"), "miner should dig right into dirt");
state = test.state();
assert(state.moves === 1, "digging should count as one move");
assert(state.grid[1][2] === " ", "dirt should become empty after digging");

test.reset();
for (const step of ["right", "right", "right"]) test.move(step);
state = test.state();
assert(state.crystals === 1, "first crystal path should collect one crystal");

assert(style.includes("Boulder Dash Pocket"), "root style guide does not include Boulder Dash Pocket in menu guidance");
assert(gamesStyle.includes("Boulder Dash Pocket"), "games style guide does not include Boulder Dash Pocket in menu guidance");

console.log("Boulder Dash Pocket catalog contract passed");
