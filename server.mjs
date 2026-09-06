import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('./dist/',import.meta.url));
const port=Number(process.env.TCM_PORT??3016);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.md':'text/plain; charset=utf-8','.gz':'application/gzip','.bin':'application/octet-stream'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method??'')){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url??'/',`http://127.0.0.1:${port}`).pathname);
  const file=path.resolve(root,`.${pathname==='/'?'/index.html':pathname}`);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const info=await stat(file);if(!info.isFile())throw new Error('not file');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Content-Length':info.size,'Cache-Control':path.extname(file)==='.html'?'no-store':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('文件未找到。请先在项目目录运行 npm run build。');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`端口 ${port} 已被占用。请打开 http://localhost:${port}/ ，或设置 TCM_PORT 使用其他端口。`:error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`经纬 · 中医经络学习图谱\n打开 http://localhost:${port}/\n按 Ctrl+C 停止。`));
