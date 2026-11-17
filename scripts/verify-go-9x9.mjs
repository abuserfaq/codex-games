import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const page = fs.readFileSync(path.join(root, 'games/go-9x9/index.html'), 'utf8');
const catalog = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!page.includes('window.__goTest') || !page.includes('function territory') || !page.includes('function applyMove')) throw new Error('Go playable contract is missing');
if (!catalog.includes('./games/go-9x9/index.html')) throw new Error('Go is missing from the catalog');
for (const asset of ['go-board.svg', 'stone-black.svg', 'stone-white.svg', 'manifest.json']) if (!fs.existsSync(path.join(root, 'games/go-9x9/assets', asset))) throw new Error(`Missing Go asset: ${asset}`);
console.log('Go 9x9 catalog contract passed');
