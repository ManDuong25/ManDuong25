import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

const STATS_PTS = "0,-38 30,-17 35,20 0,38 -32,18 -27,-15";

function generateTestHTML() {
  return `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #0d1117; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      
      @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      .center-dot { animation: pulseDot 1.5s ease-in-out infinite; }
    </style>
  </head>
  <body>
    <svg width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(200, 150)">
        <!-- Hexagonal Grid Rings (Always subtle in background) -->
        <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <polygon points="0,-29 25,-14.5 25,14.5 0,29 -25,14.5 -25,-14.5" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" stroke-dasharray="2 2" />
        <polygon points="0,-14.5 12.5,-7.2 12.5,7.2 0,14.5 -12.5,7.2 -12.5,-7.2" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" />

        <!-- Cross Axes -->
        <line x1="0" y1="-46" x2="0" y2="46" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />
        <line x1="-40" y1="-23" x2="40" y2="23" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />
        <line x1="-40" y1="23" x2="40" y2="-23" stroke="rgba(255,255,255,0.08)" stroke-width="0.8" />

        <!-- Labels -->
        <text x="0" y="-48" font-family="monospace" font-size="8" font-weight="700" text-anchor="middle" fill="#6e7681">CODE</text>
        <text x="44" y="-19" font-family="monospace" font-size="8" font-weight="700" text-anchor="start" fill="#6e7681">SYS</text>
        <text x="44" y="24" font-family="monospace" font-size="8" font-weight="700" text-anchor="start" fill="#6e7681">AI</text>
        <text x="0" y="52" font-family="monospace" font-size="8" font-weight="700" text-anchor="middle" fill="#6e7681">LOGIC</text>
        <text x="-44" y="24" font-family="monospace" font-size="8" font-weight="700" text-anchor="end" fill="#6e7681">GRIT</text>
        <text x="-44" y="-19" font-family="monospace" font-size="8" font-weight="700" text-anchor="end" fill="#6e7681">DESIGN</text>

        <!-- THE REAL SPIDER WEB (CÁI MẠNG NHỆN THẬT BLOOMS OUTWARD FROM THE CENTER DOT) -->
        <g id="spider-bloom-group">
          <!-- Main Spider Web Polygon -->
          <polygon points="${STATS_PTS}" fill="rgba(57, 197, 207, 0.15)" stroke="#39c5cf" stroke-width="2" filter="url(#softGlow)" />

          <!-- Vertex Nodes -->
          <circle cx="0" cy="-38" r="2.5" fill="#39c5cf" />
          <circle cx="30" cy="-17" r="2.5" fill="#39c5cf" />
          <circle cx="35" cy="20" r="2.5" fill="#39c5cf" />
          <circle cx="0" cy="38" r="2.5" fill="#39c5cf" />
          <circle cx="-32" cy="18" r="2.5" fill="#39c5cf" />
          <circle cx="-27" cy="-15" r="2.5" fill="#39c5cf" />
        </g>

        <!-- THE INITIAL SINGLE CENTER DOT (1 CHẤM BAN ĐẦU) -->
        <circle class="center-dot" cx="0" cy="0" r="2.8" fill="#3fb950" />
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
  await page.setContent(generateTestHTML());

  const dir = '/tmp/bloom-frames';
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  const TOTAL_FRAMES = 60;
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    let scale = 0;
    let opacity = 0;

    if (f < 5) {
      // 1. Initial state: Only 1 dot, spider web scale is 0
      scale = 0;
      opacity = 0;
    } else if (f <= 22) {
      // 2. Blooms outward from dot to full spider web (easeOutCubic)
      const t = (f - 5) / 17;
      scale = 1 - Math.pow(1 - t, 3);
      opacity = Math.min(1, t * 1.5);
    } else if (f <= 48) {
      // 3. Stays steady at full size so user can inspect their real stats
      scale = 1.0;
      opacity = 1.0;
    } else {
      // 4. Smoothly contracts back into dot for continuous seamless loop
      const t = (f - 48) / 12;
      scale = Math.pow(1 - t, 2);
      opacity = 1 - t;
    }

    await page.evaluate((s, o) => {
      const g = document.getElementById('spider-bloom-group');
      if (g) {
        g.setAttribute('transform', `scale(${s})`);
        g.style.opacity = o;
      }
    }, scale.toFixed(3), opacity.toFixed(3));

    await page.screenshot({ path: path.join(dir, `frame-${String(f).padStart(2, '0')}.png`) });
  }

  await browser.close();

  const outGif = '/home/manduong25/.gemini/antigravity-cli/brain/c03dd459-abb7-4ced-986c-ece484edf1c7/spider-bloom-test.gif';
  execSync(`ffmpeg -y -framerate 30 -i ${dir}/frame-%02d.png -vf "palettegen" /tmp/pal-bloom.png`);
  execSync(`ffmpeg -y -framerate 30 -i ${dir}/frame-%02d.png -i /tmp/pal-bloom.png -lavfi "paletteuse" -loop 0 ${outGif}`);
  console.log('✅ Rendered bloom test gif:', outGif);
}

run();
