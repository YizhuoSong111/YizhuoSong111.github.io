import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','dist');
async function files(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const htmlFiles=(await files(root)).filter(f=>f.endsWith('.html'));
const docs=new Map();
for(const f of htmlFiles){const html=await readFile(f,'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`Duplicate IDs in ${f}`);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`One h1 in ${f}`);assert.ok(html.includes('<html lang="en">'));docs.set(f,{html,ids});}
let count=0;
for(const [file,{html}] of docs){for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  const value=match[1].replaceAll('&amp;','&');
  if(/^(https:|mailto:)/.test(value))continue;
  assert.ok(value && value!=='#',`Empty link in ${file}`);
  const base=`https://local.test/${path.relative(root,file).split(path.sep).join('/')}`;
  const u=new URL(value,base);let target=path.join(root,decodeURIComponent(u.pathname));
  const s=await stat(target).catch(()=>null);assert.ok(s,`Missing local target ${value} in ${file}`);
  if(s.isDirectory())target=path.join(target,'index.html');
  assert.ok(await stat(target).catch(()=>null),`Missing entrypoint ${target}`);
  if(u.hash)assert.ok(docs.get(target)?.ids.includes(decodeURIComponent(u.hash.slice(1))),`Missing fragment ${value} in ${file}`);
  count++;
}}
const home=docs.get(path.join(root,'index.html')).html;
const expected=['home','about','ideas','work','journey','publications','methods','beyond','contact'];
const actual=[...home.matchAll(/<section id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(actual,expected);
for(const slug of ['scpme-qtl','regulotype','fuse-velo','cellforge']){
  const html=docs.get(path.join(root,'research',slug,'index.html'))?.html;
  assert.ok(html,`${slug} page exists`);assert.equal((html.match(/class="research-section"/g)||[]).length,7);
}
console.log(`Verified ${htmlFiles.length} pages and ${count} local references; section order, project structure, downloads, and fragment targets passed.`);
