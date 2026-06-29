import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "royal-ur", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "royal-ur", "assets", "manifest.json");
const requiredAssets = ["ur-board.svg", "ur-piece-red.svg", "ur-piece-ivory.svg", "ur-die.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Royal Game of Ur game page is missing");
assert(existsSync(manifestPath), "Royal Game of Ur asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/royal-ur/index.html"), "catalog does not link Royal Game of Ur");
assert(catalog.includes("<h2>Royal Game of Ur</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">46 игра</div>'), "Royal Game of Ur should be catalog item 46");

assert(game.includes("<title>Royal Game of Ur</title>"), "game title is missing");
assert(game.includes('href="../royal-ur/index.html" aria-current="page"'), "game menu current link is missing");
assert(game.includes('class="ur-board"'), "Ur board markup is missing");
assert(game.includes('id="dice"'), "dice row is missing");
assert(game.includes("function legalMoves"), "legal move logic is missing");
assert(game.includes("function movePiece"), "piece movement function is missing");
assert(game.includes("window.__royalUrTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "royal-ur", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Royal Game of Ur"), "root style guide does not include Royal Game of Ur in menu guidance");
assert(gamesStyle.includes("Royal Game of Ur"), "games style guide does not include Royal Game of Ur in menu guidance");

console.log("Royal Game of Ur catalog contract passed");
