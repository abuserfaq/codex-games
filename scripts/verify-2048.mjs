import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "twenty-forty-eight", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "twenty-forty-eight", "assets", "manifest.json");
const requiredAssets = ["board-lacquer.svg", "tile-foil.svg", "merge-spark.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "2048 game page is missing");
assert(existsSync(manifestPath), "2048 asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/twenty-forty-eight/index.html"), "catalog does not link 2048");
assert(catalog.includes("<h2>2048</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">53 игра</div>'), "2048 should be catalog item 53");

assert(game.includes("<title>2048</title>"), "game title is missing");
assert(game.includes('aria-current="page">2048</a>'), "game menu current link is missing");
assert(game.includes('class="game-2048-board"'), "2048 board markup is missing");
assert(game.includes("function compressLine"), "merge rule is missing");
assert(game.includes("function move"), "move rule is missing");
assert(game.includes("window.__twentyFortyEightTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "twenty-forty-eight", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("2048"), "root style guide does not include 2048 in menu guidance");
assert(gamesStyle.includes("2048"), "games style guide does not include 2048 in menu guidance");

console.log("2048 catalog contract passed");
