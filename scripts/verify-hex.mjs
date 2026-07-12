import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "hex", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "hex", "assets", "manifest.json");
const requiredAssets = ["hex-board.svg", "stone-red.svg", "stone-blue.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Hex game page is missing");
assert(existsSync(manifestPath), "Hex asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/hex/index.html"), "catalog does not link Hex");
assert(catalog.includes("<h2>Hex</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">57 игра</div>'), "Hex should be catalog item 57");

assert(game.includes("<title>Hex</title>"), "game title is missing");
assert(game.includes('aria-current="page">Hex</a>'), "game menu current link is missing");
assert(game.includes('class="hex-board"'), "Hex board markup is missing");
assert(game.includes("function hasConnection"), "connection rule is missing");
assert(game.includes("function play"), "move rule is missing");
assert(game.includes("window.__hexTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "hex", "assets", asset);
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
      className: "",
      addEventListener() {},
      append() {},
      setAttribute() {},
      style: { setProperty() {} },
      dataset: {},
      classList: { add() {} },
      disabled: false
    };
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
      addEventListener() {},
      disabled: false
    };
  }
};
globalThis.window = {};
Function(source)();
const test = globalThis.window.__hexTest;
assert(test, "test harness is not exposed");

test.reset();
for (const [row, col] of [
  [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3],
  [1, 3], [0, 4], [1, 4], [0, 5], [1, 5], [0, 6]
]) {
  test.play(row, col);
}
let state = test.state();
assert(state.phase === "won", "red path should win");
assert(state.redConnected, "red should connect west-east");

test.reset();
for (const [row, col] of [
  [0, 1], [0, 0], [0, 2], [1, 0], [0, 3], [2, 0], [0, 4],
  [3, 0], [0, 5], [4, 0], [1, 6], [5, 0], [2, 6], [6, 0]
]) {
  test.play(row, col);
}
state = test.state();
assert(state.phase === "won", "blue path should win");
assert(state.blueConnected, "blue should connect north-south");

assert(style.includes("Hex"), "root style guide does not include Hex in menu guidance");
assert(gamesStyle.includes("Hex"), "games style guide does not include Hex in menu guidance");

console.log("Hex catalog contract passed");
