import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const page = fs.readFileSync(path.join(root, 'games/pig-dice/index.html'), 'utf8');
const catalog = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!page.includes('function roll') || !page.includes('function bank') || !page.includes('function cpuTurn') || !page.includes('window.__pigTest')) throw new Error('Pig Dice gameplay contract is missing');
if (!catalog.includes('./games/pig-dice/index.html') || !catalog.includes('72 игра')) throw new Error('Pig Dice is missing from the catalog');
for (const asset of ['dice-tray.svg', 'die-ruby.svg', 'pig-seal.svg', 'manifest.json']) if (!fs.existsSync(path.join(root, 'games/pig-dice/assets', asset))) throw new Error(`Missing Pig Dice asset: ${asset}`);
console.log('Pig Dice catalog contract passed');
