import http from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'dist');
const port=Number(process.env.PORT ?? 4173);
const build=()=>spawnSync(process.execPath,[path.join(root,'scripts/build.mjs')],{cwd:root,stdio:'inherit'}).status===0;
if(!build()) process.exit(1);
// Poll the small source tree so preview also works in environments without filesystem watchers.
async function fingerprint(dir) {
  const entries=await readdir(dir,{withFileTypes:true});
  return (await Promise.all(entries.map(async entry=>{
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?fingerprint(file):`${file}:${(await stat(file)).mtimeMs}`;
  }))).flat().join('|');
}
const current=async()=>Promise.all(['content','public','scripts'].map(name=>fingerprint(path.join(root,name))));
let previous=JSON.stringify(await current()), checking=false;
setInterval(async()=>{
  if(checking)return;
  checking=true;
  try{const next=JSON.stringify(await current());if(next!==previous){previous=next;build();}}
  catch(error){console.error('Preview source check failed:',error.message);}
  finally{checking=false;}
},1000);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    let file=path.resolve(dir,`.${pathname}`);
    if(file!==dir&&!file.startsWith(`${dir}${path.sep}`)){res.writeHead(403);res.end();return;}
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(dir,'404.html')));}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
