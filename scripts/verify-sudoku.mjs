import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const page = fs.readFileSync(path.join(root, 'games/sudoku/index.html'), 'utf8');
const catalog = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const puzzle = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const answer = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

if (!page.includes('const puzzle=') || !page.includes('window.__sudokuTest')) throw new Error('Sudoku page is missing its playable contract');
if (!catalog.includes('./games/sudoku/index.html')) throw new Error('Sudoku is missing from the catalog');
for (const asset of ['paper-grid.svg', 'pencil.svg', 'rosette.svg', 'manifest.json']) {
  if (!fs.existsSync(path.join(root, 'games/sudoku/assets', asset))) throw new Error(`Missing Sudoku asset: ${asset}`);
}
for (let unit = 0; unit < 9; unit++) {
  const row = answer.slice(unit * 9, unit * 9 + 9);
  const col = [...answer].filter((_, index) => index % 9 === unit).join('');
  const box = [...answer].filter((_, index) => Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3) === unit).join('');
  for (const values of [row, col, box]) if ([...new Set(values)].length !== 9) throw new Error('Sudoku solution must be valid');
}
if (![...puzzle].some((value, index) => value === '0' && answer[index] !== value)) throw new Error('Puzzle has no playable cells');
console.log('Sudoku catalog contract passed');
