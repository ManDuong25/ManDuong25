import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

const STATS_PTS = "0,-42 31,-18 37,21 0,40 -34,19 -28,-16";

function generateTestHTML(approach) {
  return `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #07090E; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      
      @keyframes spiderPulseAura {
        0% {
          transform: scale(1.0);
          opacity: 0.85;
          stroke-width: 2px;
        }
        50% {
          opacity: 0.45;
          stroke-width: 1.5px;
        }
        100% {
          transform: scale(1.35);
          opacity: 0;
          stroke-width: 0.5px;
        }
      }

      @keyframes spiderBreathe {
        0%, 100% {
          transform: scale(1.0);
          filter: drop-shadow(0 0 4px rgba(0, 255, 157, 0.4));
        }
        50% {
          transform: scale(1.03);
          filter: drop-shadow(0 0 10px rgba(0, 255, 157, 0.8));
        }
      }

      /* When local coordinates are centered at 0,0:
         transform-box: view-box with transform-origin: 0 0 uses the translated coordinate system */
      .spider-base {
        transform-box: fill-box;
        transform-origin: center;
        animation: spiderBreathe 2.4s ease-in-out infinite;
      }
      .spider-wave-1 {
        transform-box: fill-box;
        transform-origin: center;
        animation: spiderPulseAura 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
      }
      .spider-wave-2 {
        transform-box: fill-box;
        transform-origin: center;
        animation: spiderPulseAura 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) 0.8s infinite;
      }
      .spider-wave-3 {
        transform-box: fill-box;
        transform-origin: center;
        animation: spiderPulseAura 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) 1.6s infinite;
      }
    </style>
  </head>
  <body>
    <svg width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(200, 150)">
        <!-- Outer Grid Hexagons -->
        <polygon points="0,-46 40,-23 40,23 0,46 -40,23 -40,-23" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" stroke-dasharray="2 2" />
        <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.6" />
        
        <!-- Axes -->
        <line x1="0" y1="-50" x2="0" y2="50" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <line x1="-44" y1="-25" x2="44" y2="25" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />
        <line x1="-44" y1="25" x2="44" y2="-25" stroke="rgba(255,255,255,0.1)" stroke-width="0.8" />

        <!-- RADIATING SPIDER WAVES (CHÍNH CÁI MẠNG NHỆN TỎA RA!) -->
        <polygon class="spider-wave-1" points="${STATS_PTS}" fill="rgba(0, 255, 157, 0.08)" stroke="#00FF9D" />
        <polygon class="spider-wave-2" points="${STATS_PTS}" fill="rgba(0, 229, 255, 0.06)" stroke="#00E5FF" />
        <polygon class="spider-wave-3" points="${STATS_PTS}" fill="rgba(0, 255, 157, 0.04)" stroke="#00FF9D" />

        <!-- THE MAIN SPIDER WEB (CÁI MẠNG NHỆN CHÍNH) -->
        <polygon class="spider-base" points="${STATS_PTS}" fill="rgba(0, 255, 157, 0.18)" stroke="#00FF9D" stroke-width="2" filter="url(#neonGlow)" />

        <!-- Vertex Nodes -->
        <circle cx="0" cy="-42" r="2.5" fill="#00FF9D" />
        <circle cx="31" cy="-18" r="2.5" fill="#00FF9D" />
        <circle cx="37" cy="21" r="2.5" fill="#00FF9D" />
        <circle cx="0" cy="40" r="2.5" fill="#00FF9D" />
        <circle cx="-34" cy="19" r="2.5" fill="#00FF9D" />
        <circle cx="-28" cy="-16" r="2.5" fill="#00FF9D" />

        <!-- Center glowing dot -->
        <circle cx="0" cy="0" r="2" fill="#00E5FF" />
      </g>
    </svg>
  </body>
  </html>`;
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless=new'],
    defaultViewport: { width: 400, height: 300, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  const html = generateTestHTML();
  await page.setContent(html);

  const dir = '/tmp/spider-anim-test';
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  console.log('Capturing 36 frames over 2.4s (15fps)...');
  for (let i = 0; i < 36; i++) {
    // 2400ms / 36 = 66.6ms
    await new Promise(r => setTimeout(r, 66));
    await page.screenshot({ path: path.join(dir, `frame-${String(i).padStart(2, '0')}.png`) });
  }

  await browser.close();

  const outGif = '/home/manduong25/.gemini/antigravity-cli/brain/c03dd459-abb7-4ced-986c-ece484edf1c7/spider-anim-result.gif';
  execSync(`ffmpeg -y -framerate 15 -i ${dir}/frame-%02d.png -vf "palettegen" /tmp/pal2.png`);
  execSync(`ffmpeg -y -framerate 15 -i ${dir}/frame-%02d.png -i /tmp/pal2.png -lavfi "paletteuse" ${outGif}`);
  console.log('Saved:', outGif);
}

run();
