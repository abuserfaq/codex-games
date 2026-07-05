import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "mini-golf", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "mini-golf", "assets", "manifest.json");
const requiredAssets = ["turf-texture.svg", "flag.svg", "golf-ball.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Mini Golf game page is missing");
assert(existsSync(manifestPath), "Mini Golf asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/mini-golf/index.html"), "catalog does not link Mini Golf");
assert(catalog.includes("<h2>Mini Golf</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">50 игра</div>'), "Mini Golf should be catalog item 50");

assert(game.includes("<title>Mini Golf</title>"), "game title is missing");
assert(game.includes('aria-current="page">Mini Golf</a>'), "game menu current link is missing");
assert(game.includes("mini-golf-wrap"), "Mini Golf board wrapper is missing");
assert(game.includes('id="golfCourse"'), "Mini Golf canvas id is missing");
assert(game.includes("function putt"), "putt rule is missing");
assert(game.includes("function hitWall"), "rail collision rule is missing");
assert(game.includes("window.__miniGolfTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "mini-golf", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Mini Golf"), "root style guide does not include Mini Golf in menu guidance");
assert(gamesStyle.includes("Mini Golf"), "games style guide does not include Mini Golf in menu guidance");

console.log("Mini Golf catalog contract passed");
