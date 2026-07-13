import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "index.html");
const gamePath = join(root, "games", "light-cycles", "index.html");
const stylePath = join(root, "stly.md");
const gamesStylePath = join(root, "games", "stly.md");
const manifestPath = join(root, "games", "light-cycles", "assets", "manifest.json");
const requiredAssets = ["arena-grid.svg", "cycle-cyan.svg", "cycle-amber.svg"];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(existsSync(catalogPath), "catalog index.html is missing");
assert(existsSync(gamePath), "Light Cycles game page is missing");
assert(existsSync(manifestPath), "Light Cycles asset manifest is missing");

const catalog = read(catalogPath);
const game = read(gamePath);
const style = read(stylePath);
const gamesStyle = read(gamesStylePath);
const manifest = JSON.parse(read(manifestPath));

assert(catalog.includes("./games/light-cycles/index.html"), "catalog does not link Light Cycles");
assert(catalog.includes("<h2>Light Cycles</h2>"), "catalog card title is missing");
assert(catalog.includes('<div class="tag">58 игра</div>'), "Light Cycles should be catalog item 58");

assert(game.includes("<title>Light Cycles</title>"), "game title is missing");
assert(game.includes('aria-current="page">Light Cycles</a>'), "game menu current link is missing");
assert(game.includes('class="cycles-board"'), "Light Cycles board markup is missing");
assert(game.includes("function chooseRivalDir"), "rival steering rule is missing");
assert(game.includes("function step"), "tick rule is missing");
assert(game.includes("window.__lightCyclesTest"), "test harness export is missing");

for (const asset of requiredAssets) {
  const assetPath = join(root, "games", "light-cycles", "assets", asset);
  assert(existsSync(assetPath), `${asset} is missing`);
  assert(game.includes(`./assets/${asset}`), `${asset} is not referenced by game HTML`);
  assert(manifest.assets?.includes(asset), `${asset} is not listed in manifest`);
}

const source = game.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(source, "inline script is missing");

const noopElement = () => ({
  textContent: "",
  innerHTML: "",
  className: "",
  addEventListener() {},
  append() {},
  setAttribute() {},
  style: { setProperty() {} },
  dataset: {},
  classList: { add() {} },
  disabled: false
});

globalThis.document = {
  querySelector() {
    return noopElement();
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return noopElement();
  },
  addEventListener() {}
};
globalThis.window = {};
globalThis.setInterval = () => 1;
globalThis.clearInterval = () => {};
Function(source)();

const test = globalThis.window.__lightCyclesTest;
assert(test, "test harness is not exposed");

test.reset();
let state = test.state();
assert(state.phase === "playing", "new game should be playable");
assert(state.player.row === 7 && state.player.col === 3, "player starts in the left lane");
assert(state.rival.row === 7 && state.rival.col === 11, "rival starts in the right lane");

assert(test.steer("up"), "player should accept a legal turn");
test.step();
state = test.state();
assert(state.player.dir === "up", "player should turn upward");
assert(state.ticks === 1, "one tick should be counted");
assert(state.grid.some((row) => row.includes("player")), "player trail should be left behind");
assert(state.grid.some((row) => row.includes("rival")), "rival trail should be left behind");

test.reset();
assert(!test.steer("left"), "player cannot reverse into the opposite lane");
for (let i = 0; i < 20 && test.state().phase === "playing"; i += 1) {
  test.step();
}
state = test.state();
assert(state.phase === "ended", "straight-line run should eventually crash");

assert(style.includes("Light Cycles"), "root style guide does not include Light Cycles in menu guidance");
assert(gamesStyle.includes("Light Cycles"), "games style guide does not include Light Cycles in menu guidance");

console.log("Light Cycles catalog contract passed");
