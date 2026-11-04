import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const root=process.cwd(), read=p=>readFileSync(p,'utf8'), assert=(v,m)=>{if(!v)throw new Error(m)};
const page=join(root,'games','knights-tour','index.html'), source=read(page), catalog=read(join(root,'index.html'));
assert(existsSync(page),'Knight page missing');assert(catalog.includes('./games/knights-tour/index.html'),'catalog link missing');assert(catalog.includes('<h2>Knight\'s Tour</h2>'),'catalog card missing');
for(const name of ['chess-cloth.svg','knight-ivory.svg','star-seal.svg','manifest.json'])assert(existsSync(join(root,'games','knights-tour','assets',name)),`${name} missing`);
const script=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];const noop=()=>({textContent:'',innerHTML:'',dataset:{},className:'',addEventListener(){},setAttribute(){},append(){}});globalThis.document={querySelector(){return noop()},createElement(){return noop()}};globalThis.window={};Function(script)();const test=window.__knightsTourTest;assert(test.state().seen===1,'fresh tour invalid');
const path=[[1,2],[0,4],[2,3],[4,4],[3,2],[4,0],[2,1],[3,3],[4,1],[2,0],[0,1],[1,3],[3,4],[4,2],[3,0],[1,1],[0,3],[2,4],[4,3],[3,1],[1,0],[2,2],[1,4],[0,2]];for(const step of path)assert(test.move(...step),'tour leap rejected');assert(test.state().seen===25&&test.state().done,'winning tour failed');console.log('Knight\'s Tour catalog contract passed');
