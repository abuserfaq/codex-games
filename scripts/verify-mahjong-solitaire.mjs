import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "mahjong-solitaire", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "mahjong-solitaire", "assets", "manifest.json");
const requiredAssets = ["tile-face.svg", "tile-shadow.svg", "bamboo-mark.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Mahjong Solitaire game page is missing");
assert(existsSync(manifestPath), "Mahjong Solitaire asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/mahjong-solitaire/index.html"), "catalog does not link Mahjong Solitaire");
assert(catalog.includes("<h2>Mahjong Solitaire</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">48 игра</div>'), "Mahjong Solitaire should be catalog item 48");

assert(game.includes("<title>Mahjong Solitaire</title>"), "game title is missing");
assert(game.includes('aria-current="page">Mahjong Solitaire</a>'), "game menu current link is missing");
assert(game.includes('class="mahjong-board"'), "Mahjong board markup is missing");
assert(game.includes('id="mahjongBoard"'), "Mahjong board id is missing");
assert(game.includes("function isTileFree"), "free tile rule is missing");
assert(game.includes("function canMatch"), "matching rule is missing");
assert(game.includes("window.__mahjongTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "mahjong-solitaire", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Mahjong Solitaire"), "root style guide does not include Mahjong Solitaire in menu guidance");
assert(gamesStyle.includes("Mahjong Solitaire"), "games style guide does not include Mahjong Solitaire in menu guidance");

console.log("Mahjong Solitaire catalog contract passed");
