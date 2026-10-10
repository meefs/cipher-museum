const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const roots = {8311:'/tmp/cipher-final-review-pr1',8312:'/tmp/cipher-final-review-pr2'};
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
for(const [port,root]of Object.entries(roots))http.createServer((req,res)=>{
  let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(rel.endsWith('/'))rel+='index.html';
  const file=path.resolve(root,'.'+rel);
  if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(Number(port),'127.0.0.1',()=>console.log(`Serving ${root} at http://localhost:${port}`));
