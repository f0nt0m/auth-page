const http = require("http");
const { createReadStream, stat } = require("fs");
const { extname, join, normalize } = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(process.cwd(), "src");

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = normalize(urlPath).replace(/^\.\.(?:\/.+)?$/, "");
  const filePath = join(PUBLIC_DIR, safePath);

  stat(filePath, (error, fileStat) => {
    if (error || !fileStat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
      res.end("Not Found");
      return;
    }

    res.writeHead(200, { "Content-Type": MIME_TYPES[extname(filePath)] || "application/octet-stream" });
    createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Static server is running on http://localhost:${PORT}`);
});
