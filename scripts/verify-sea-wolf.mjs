import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "sea-wolf", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "sea-wolf", "assets", "manifest.json");
const requiredAssets = ["periscope-mask.svg", "target-ship.svg", "torpedo-wake.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Sea Wolf game page is missing");
assert(existsSync(manifestPath), "Sea Wolf asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/sea-wolf/index.html"), "catalog does not link Sea Wolf");
assert(catalog.includes("<h2>Sea Wolf</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">49 игра</div>'), "Sea Wolf should be catalog item 49");

assert(game.includes("<title>Sea Wolf</title>"), "game title is missing");
assert(game.includes('href="../sea-wolf/index.html" aria-current="page"'), "game menu current link is missing");
assert(game.includes('class="sea-board"'), "Sea Wolf board markup is missing");
assert(game.includes('id="seaField"'), "Sea Wolf canvas id is missing");
assert(game.includes("function spawnShip"), "ship spawning rule is missing");
assert(game.includes("function fireTorpedo"), "torpedo firing rule is missing");
assert(game.includes("window.__seaWolfTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "sea-wolf", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Sea Wolf"), "root style guide does not include Sea Wolf in menu guidance");
assert(gamesStyle.includes("Sea Wolf"), "games style guide does not include Sea Wolf in menu guidance");

console.log("Sea Wolf catalog contract passed");
