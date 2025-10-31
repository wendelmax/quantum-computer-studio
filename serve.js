const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 5173;

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm'
};

http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/' || p === '') p = '/index.html';
  if (p.startsWith('/')) p = p.substring(1);
  const filePath = path.join(__dirname, p);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end();
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`FE server on http://localhost:${port}`);
});
