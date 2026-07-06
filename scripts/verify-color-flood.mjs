import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "color-flood", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "color-flood", "assets", "manifest.json");
const requiredAssets = ["tile-sheen.svg", "palette-frame.svg", "flood-drop.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Color Flood game page is missing");
assert(existsSync(manifestPath), "Color Flood asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/color-flood/index.html"), "catalog does not link Color Flood");
assert(catalog.includes("<h2>Color Flood</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">51 игра</div>'), "Color Flood should be catalog item 51");

assert(game.includes("<title>Color Flood</title>"), "game title is missing");
assert(game.includes('aria-current="page">Color Flood</a>'), "game menu current link is missing");
assert(game.includes('class="flood-board"'), "Color Flood board markup is missing");
assert(game.includes('id="palette"'), "palette controls are missing");
assert(game.includes("function flood"), "flood-fill rule is missing");
assert(game.includes("function ownedCells"), "owned-region rule is missing");
assert(game.includes("window.__colorFloodTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "color-flood", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Color Flood"), "root style guide does not include Color Flood in menu guidance");
assert(gamesStyle.includes("Color Flood"), "games style guide does not include Color Flood in menu guidance");

console.log("Color Flood catalog contract passed");
