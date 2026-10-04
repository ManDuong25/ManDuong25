import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateBannerSVG } from './banner-generator.mjs';
import { generateQuestTacticalSVG, generateQuestCommandSVG } from './quest-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4200;
const FEEDBACK_PATH = path.join(__dirname, 'feedback.json');
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Serve frontend index.html
  if (pathname === '/' || pathname === '/index.html') {
    const html = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(html);
    return;
  }

  // 2. GET /api/state
  if (pathname === '/api/state' && req.method === 'GET') {
    let feedback = { annotations: [], customData: {} };
    if (existsSync(FEEDBACK_PATH)) {
      try {
        feedback = JSON.parse(await fs.readFile(FEEDBACK_PATH, 'utf8'));
      } catch (e) {
        console.error("Error reading feedback.json", e);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ feedback }));
    return;
  }

  // 3. POST /api/banner -> renders SVG
  if (pathname === '/api/banner' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const customData = body ? JSON.parse(body) : {};
        const theme = url.searchParams.get('theme') || 'dark';
        const view = url.searchParams.get('view') || 'quest-tactical';

        let svg = '';
        if (view === 'quest-command') {
          svg = generateQuestCommandSVG(theme, customData);
        } else if (view === 'quest-tactical' || view === 'quest') {
          svg = generateQuestTacticalSVG(theme, customData);
        } else {
          svg = generateBannerSVG(theme, customData);
        }
        res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
        res.end(svg);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(err.message);
      }
    });
    return;
  }

  // 4. POST /api/feedback -> saves annotations
  if (pathname === '/api/feedback' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        await fs.writeFile(FEEDBACK_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[Studio] Saved ${data.annotations?.length || 0} annotations to feedback.json`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: data.annotations?.length || 0 }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 5. POST /api/export -> writes to assets/
  if (pathname === '/api/export' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const customData = body ? JSON.parse(body) : {};
        const view = url.searchParams.get('view') || 'quest-tactical';
        await fs.mkdir(ASSETS_DIR, { recursive: true });

        if (view === 'quest-tactical' || view === 'quest-command' || view === 'quest') {
          const fn = view === 'quest-command' ? generateQuestCommandSVG : generateQuestTacticalSVG;
          const lightSvg = fn('light', customData);
          const darkSvg = fn('dark', customData);
          await fs.writeFile(path.join(ASSETS_DIR, 'quests-light.svg'), lightSvg, 'utf8');
          await fs.writeFile(path.join(ASSETS_DIR, 'quests-dark.svg'), darkSvg, 'utf8');
        } else {
          const lightSvg = generateBannerSVG('light', customData);
          const darkSvg = generateBannerSVG('dark', customData);
          await fs.writeFile(path.join(ASSETS_DIR, 'hero-light.svg'), lightSvg, 'utf8');
          await fs.writeFile(path.join(ASSETS_DIR, 'hero-dark.svg'), darkSvg, 'utf8');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 ManDuong Banner Studio is running at: http://localhost:${PORT}`);
});
