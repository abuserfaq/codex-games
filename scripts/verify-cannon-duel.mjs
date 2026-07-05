import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "cannon-duel", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "cannon-duel", "assets", "manifest.json");
const requiredAssets = ["terrain-ridge.svg", "cannon-brass.svg", "shell-spark.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Cannon Duel game page is missing");
assert(existsSync(manifestPath), "Cannon Duel asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/cannon-duel/index.html"), "catalog does not link Cannon Duel");
assert(catalog.includes("<h2>Cannon Duel</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">45 игра</div>'), "Cannon Duel should be catalog item 45");
assert(game.includes("<title>Cannon Duel</title>"), "game title is missing");
assert(game.includes('aria-current="page">Cannon Duel</a>'), "game menu current link is missing");
assert(game.includes("cannon-wrap"), "cannon battlefield wrapper is missing");
assert(game.includes('id="field"'), "canvas field is missing");
assert(game.includes("function shotVector"), "ballistic vector logic is missing");
assert(game.includes("function firePlayer"), "fire action is missing");
assert(game.includes("window.__cannonDuelTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "cannon-duel", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Cannon Duel"), "root style guide does not include Cannon Duel in menu guidance");
assert(gamesStyle.includes("Cannon Duel"), "games style guide does not include Cannon Duel in menu guidance");

console.log("Cannon Duel catalog contract passed");
