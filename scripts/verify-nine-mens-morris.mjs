import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "nine-mens-morris", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "nine-mens-morris", "assets", "manifest.json");
const requiredAssets = ["morris-board.svg", "morris-stone.svg", "mill-glow.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Nine Men's Morris game page is missing");
assert(existsSync(manifestPath), "Nine Men's Morris asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/nine-mens-morris/index.html"), "catalog does not link Nine Men's Morris");
assert(catalog.includes("<h2>Nine Men's Morris</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">52 игра</div>'), "Nine Men's Morris should be catalog item 52");

assert(game.includes("<title>Nine Men's Morris</title>"), "game title is missing");
assert(game.includes(`aria-current="page">Nine Men's Morris</a>`), "game menu current link is missing");
assert(game.includes('class="morris-board"'), "Morris board markup is missing");
assert(game.includes("const mills"), "mill rules are missing");
assert(game.includes("function handlePoint"), "point interaction is missing");
assert(game.includes("function removablePieces"), "capture rule is missing");
assert(game.includes("window.__morrisTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "nine-mens-morris", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`) || game.includes(`assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

assert(style.includes("Nine Men's Morris"), "root style guide does not include Nine Men's Morris");
assert(gamesStyle.includes("Nine Men's Morris"), "games style guide does not include Nine Men's Morris");

console.log("Nine Men's Morris catalog contract passed");
