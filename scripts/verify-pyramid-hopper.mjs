import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "pyramid-hopper", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "pyramid-hopper", "assets", "manifest.json");
const requiredAssets = ["pyramid-tile.svg", "hopper.svg", "hazard-spark.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Pyramid Hopper game page is missing");
assert(existsSync(manifestPath), "Pyramid Hopper asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/pyramid-hopper/index.html"), "catalog does not link Pyramid Hopper");
assert(catalog.includes("<h2>Pyramid Hopper</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">54 игра</div>'), "Pyramid Hopper should be catalog item 54");

assert(game.includes("<title>Pyramid Hopper</title>"), "game title is missing");
assert(game.includes('aria-current="page">Pyramid Hopper</a>'), "game menu current link is missing");
assert(game.includes('class="pyramid-board"'), "Pyramid Hopper board markup is missing");
assert(game.includes("function hop"), "hop rule is missing");
assert(game.includes("function moveHazard"), "hazard movement is missing");
assert(game.includes("window.__pyramidHopperTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "pyramid-hopper", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

const source = game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "inline script is missing");
const sandbox = {
  document: {
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
      return [
        { dataset: { hop: "up-left" }, addEventListener() {}, disabled: false },
        { dataset: { hop: "up-right" }, addEventListener() {}, disabled: false },
        { dataset: { hop: "down-left" }, addEventListener() {}, disabled: false },
        { dataset: { hop: "down-right" }, addEventListener() {}, disabled: false }
      ];
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
        addEventListener() {}
      };
    }
  },
  window: { addEventListener() {} }
};

globalThis.document = sandbox.document;
globalThis.window = sandbox.window;
Function(source)();
const test = globalThis.window.__pyramidHopperTest;
assert(test, "test harness is not exposed");
test.reset();
for (const direction of [
  "down-left", "down-left", "up-right", "down-right",
  "up-right", "down-right", "down-right", "down-right",
  "up-left", "down-left", "up-left", "down-left",
  "up-left", "down-left", "up-left", "down-left"
]) {
  test.hop(direction);
}
const result = test.state();
assert(result.flipped.length === 15, "winning path should flip all 15 tiles");
assert(result.phase === "won", "winning path should end with won phase");
assert(result.lives > 0, "winning path should keep at least one life");

assert(style.includes("Pyramid Hopper"), "root style guide does not include Pyramid Hopper in menu guidance");
assert(gamesStyle.includes("Pyramid Hopper"), "games style guide does not include Pyramid Hopper in menu guidance");

console.log("Pyramid Hopper catalog contract passed");
