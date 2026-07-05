import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "solitaire", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "solitaire", "assets", "manifest.json");
const requiredAssets = ["card-back.svg", "table-felt.svg", "suit-marks.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Solitaire game page is missing");
assert(existsSync(manifestPath), "Solitaire asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/solitaire/index.html"), "catalog does not link Solitaire");
assert(catalog.includes("<h2>Klondike Solitaire</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">47 игра</div>'), "Solitaire should be catalog item 47");

assert(game.includes("<title>Klondike Solitaire</title>"), "game title is missing");
assert(game.includes('aria-current="page">Klondike Solitaire</a>'), "game menu current link is missing");
assert(game.includes('class="solitaire-table"'), "Solitaire table markup is missing");
assert(game.includes('id="stock"'), "stock pile is missing");
assert(game.includes('id="foundations"'), "foundation piles are missing");
assert(game.includes("function canMoveToFoundation"), "foundation move rules are missing");
assert(game.includes("function canMoveToTableau"), "tableau move rules are missing");
assert(game.includes("window.__solitaireTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "solitaire", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Klondike Solitaire"), "root style guide does not include Klondike Solitaire in menu guidance");
assert(gamesStyle.includes("Klondike Solitaire"), "games style guide does not include Klondike Solitaire in menu guidance");

console.log("Klondike Solitaire catalog contract passed");
