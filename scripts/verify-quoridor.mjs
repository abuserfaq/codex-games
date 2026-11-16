import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const page = fs.readFileSync(path.join(root, 'games/quoridor/index.html'), 'utf8');
const catalog = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!page.includes('window.__quoridorTest') || !page.includes('function hasPath')) throw new Error('Quoridor playable contract is missing');
if (!catalog.includes('./games/quoridor/index.html')) throw new Error('Quoridor is missing from the catalog');
for (const asset of ['garden-board.svg', 'pawn-ruby.svg', 'pawn-sapphire.svg', 'manifest.json']) {
  if (!fs.existsSync(path.join(root, 'games/quoridor/assets', asset))) throw new Error(`Missing Quoridor asset: ${asset}`);
}
console.log('Quoridor catalog contract passed');
