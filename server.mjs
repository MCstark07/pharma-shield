/**
 * PharmaShield Zero-Dependency Node.js Server
 * Serves the Flow Wave + Matter.js Interactive 3D Documentation at http://localhost:8000/docs
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const DOCS_HTML_PATH = path.join(__dirname, 'docs', 'index.html');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // /docs route
  if (pathname === '/docs' || pathname === '/docs/') {
    try {
      const html = fs.readFileSync(DOCS_HTML_PATH, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading docs: ' + err.message);
    }
    return;
  }

  // /health route
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'HEALTHY',
      system: 'PharmaShield Node.js Documentation Engine',
      port: PORT,
      docs: `http://localhost:${PORT}/docs`
    }, null, 2));
    return;
  }

  // Root redirect or landing
  if (pathname === '/') {
    res.writeHead(302, { Location: '/docs' });
    res.end();
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found. Visit /docs');
});

server.listen(PORT, () => {
  console.log(`[PharmaShield Node Server] Running at http://localhost:${PORT}/docs`);
});
