import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "domino-trail", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "domino-trail", "assets", "manifest.json");
const requiredAssets = ["bone-face.svg", "table-felt.svg", "pip.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Domino Trail game page is missing");
assert(existsSync(manifestPath), "Domino Trail asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/domino-trail/index.html"), "catalog does not link Domino Trail");
assert(catalog.includes("<h2>Domino Trail</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">44 игра</div>'), "Domino Trail should be catalog item 44");
assert(count(catalog, "Domino Trail") >= 1, "Domino Trail is not named in the catalog");

assert(game.includes("<title>Domino Trail</title>"), "game title is missing");
assert(game.includes('aria-current="page">Domino Trail</a>'), "game menu current link is missing");
assert(game.includes('class="domino-board"'), "domino board markup is missing");
assert(game.includes('id="leftEnd"'), "left-end HUD marker is missing");
assert(game.includes('id="rightEnd"'), "right-end HUD marker is missing");
assert(game.includes("function legalSides"), "legal side logic is missing");
assert(game.includes("function playDomino"), "domino play function is missing");
assert(game.includes("window.__dominoTrailTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "domino-trail", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Domino Trail"), "root style guide does not include Domino Trail in menu guidance");
assert(gamesStyle.includes("Domino Trail"), "games style guide does not include Domino Trail in menu guidance");

console.log("Domino Trail catalog contract passed");
