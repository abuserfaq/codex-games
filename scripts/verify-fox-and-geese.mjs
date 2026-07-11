import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "fox-and-geese", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "fox-and-geese", "assets", "manifest.json");
const requiredAssets = ["board-cloth.svg", "fox-token.svg", "goose-token.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Fox and Geese game page is missing");
assert(existsSync(manifestPath), "Fox and Geese asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/fox-and-geese/index.html"), "catalog does not link Fox and Geese");
assert(catalog.includes("<h2>Fox and Geese</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">55 игра</div>'), "Fox and Geese should be catalog item 55");

assert(game.includes("<title>Fox and Geese</title>"), "game title is missing");
assert(game.includes('aria-current="page">Fox and Geese</a>'), "game menu current link is missing");
assert(game.includes('class="fox-board"'), "Fox and Geese board markup is missing");
assert(game.includes("function legalFoxMoves"), "fox move rules are missing");
assert(game.includes("function moveGeese"), "goose response rule is missing");
assert(game.includes("window.__foxAndGeeseTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "fox-and-geese", "assets", asset);
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
      classList: { add() {} },
      disabled: false
    };
  },
  querySelectorAll() {
    return Array.from({ length: 8 }, () => ({
      dataset: { step: "0,1" },
      addEventListener() {},
      disabled: false
    }));
  },
  createElement() {
    return {
      className: "",
      type: "",
      role: "",
      textContent: "",
      dataset: {},
      style: { setProperty() {} },
      classList: { add() {} },
      setAttribute() {},
      addEventListener() {},
      disabled: false
    };
  }
};
globalThis.window = { addEventListener() {} };
Function(source)();
const test = globalThis.window.__foxAndGeeseTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.geese.length === 13, "opening flock should have 13 geese");
assert(test.legalFoxMoves().length > 0, "opening fox should have legal moves");

test.seed({
  fox: { row: 4, col: 3 },
  geese: [{ row: 3, col: 3 }, { row: 2, col: 2 }],
  captured: 6
});
assert(test.moveFoxTo(2, 3), "fox should jump over the goose");
state = test.state();
assert(state.captured === 7, "jump should capture the seventh goose");
assert(state.geese.length === 1, "captured goose should be removed");
assert(state.phase === "won", "seventh capture should win the game");

assert(style.includes("Fox and Geese"), "root style guide does not include Fox and Geese in menu guidance");
assert(gamesStyle.includes("Fox and Geese"), "games style guide does not include Fox and Geese in menu guidance");

console.log("Fox and Geese catalog contract passed");
