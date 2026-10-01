// 만든 사이트를 이 PC에서 미리 보는 작은 서버. 설치할 것 없이 노드만 있으면 된다.
//   node 미리보기.js          → http://localhost:4000
const http = require('http');
const fs = require('fs');
const path = require('path');

const 폴더 = path.resolve(process.env.SITE_OUT || path.join(__dirname, '결과'));
const 포트 = process.env.PORT || 4000;
const 종류 = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

http.createServer((req, res) => {
  let 길 = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let 파일 = path.join(폴더, 길);
  if (!파일.startsWith(폴더)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(파일) && fs.statSync(파일).isDirectory()) 파일 = path.join(파일, 'index.html');
  if (!fs.existsSync(파일)) {
    res.writeHead(404, { 'Content-Type': 종류['.html'] });
    return res.end(fs.existsSync(path.join(폴더, '404.html')) ? fs.readFileSync(path.join(폴더, '404.html')) : '없는 페이지입니다');
  }
  res.writeHead(200, { 'Content-Type': 종류[path.extname(파일)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(파일).pipe(res);
}).listen(포트, () => console.log(`\n  사이트 미리보기: http://localhost:${포트}\n  (끄려면 이 창을 닫으세요)\n`));
