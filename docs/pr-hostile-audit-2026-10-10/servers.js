const http=require('http'),fs=require('fs'),path=require('path');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
for(const[label,port]of [['pre1',8611],['pre2',8612],['pr1',8711],['pr2',8712]]){
 const root='/tmp/cipher-hostile-20261010-'+label;
 http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),rel=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);const file=path.resolve(root,'.'+rel);
  if(!file.startsWith(root+'/')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
 }).listen(port,'127.0.0.1',()=>console.log(label+' listening '+port));
}
