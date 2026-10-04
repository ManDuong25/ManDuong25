import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generateBannerSVG } from '../studio/banner-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES_DIR = '/tmp/hud-frames';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_GIF = path.join(ASSETS_DIR, 'banner.gif');
const TOTAL_FRAMES = 60;
const FPS = 30;

async function render() {
  console.log('🚀 Starting Studio-grade GIF render pipeline...');
  await fs.rm(FRAMES_DIR, { recursive: true, force: true });
  await fs.mkdir(FRAMES_DIR, { recursive: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  const svgContent = generateBannerSVG('dark');

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #000; width: 900px; height: 280px; overflow: hidden; }
      #banner { width: 900px; height: 280px; display: block; }
    </style>
  </head>
  <body>
    <div id="banner">${svgContent}</div>
  </body>
  </html>`;

  const htmlPath = path.join(FRAMES_DIR, 'template.html');
  await fs.writeFile(htmlPath, html, 'utf8');

  console.log('1. Launching Headless Chrome to capture frames...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--headless=new'],
    defaultViewport: { width: 900, height: 280, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`);

  console.log(`2. Capturing ${TOTAL_FRAMES} frames at 2x resolution...`);
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    let scale = 0;
    let opacity = 0;

    if (f < 5) {
      // Initially: Only 1 dot at center, real spider web is at 0
      scale = 0;
      opacity = 0;
    } else if (f <= 22) {
      // Blooms outward from center dot to full spider web (easeOutCubic)
      const t = (f - 5) / 17;
      scale = (1 - Math.pow(1 - t, 3)).toFixed(3);
      opacity = Math.min(1, t * 1.5).toFixed(3);
    } else {
      // Stays permanently locked at full size (blooms once)
      scale = 1.0;
      opacity = 1.0;
    }

    const pulseOpacity = (0.45 + 0.55 * Math.sin((f / TOTAL_FRAMES) * 2 * Math.PI)).toFixed(2);
    
    await page.evaluate((s, o, pulseOp, frameIdx) => {
      const bloom = document.querySelector('.spider-bloom-group');
      if (bloom) {
        bloom.setAttribute('transform', `scale(${s})`);
        bloom.style.opacity = o;
      }
      const dots = document.querySelectorAll('.pulse-dot');
      dots.forEach(d => {
        d.style.animation = 'none';
        d.style.opacity = pulseOp;
      });
      const leading = document.querySelector('.leading-segment');
      if (leading) {
        leading.style.animation = 'none';
        leading.style.opacity = pulseOp;
      }
      const caret = document.querySelector('.caret');
      if (caret) {
        caret.style.opacity = (frameIdx % 30 < 15) ? '1' : '0';
      }
    }, scale, opacity, pulseOpacity, f);

    const frameFile = path.join(FRAMES_DIR, `frame-${String(f).padStart(3, '0')}.png`);
    const bannerEl = await page.$('#banner');
    await bannerEl.screenshot({ path: frameFile });
    if ((f + 1) % 15 === 0) {
      console.log(`   Captured ${f + 1}/${TOTAL_FRAMES} frames`);
    }
  }

  await browser.close();

  console.log('3. Running FFmpeg two-pass palettegen (High-Fidelity Lanczos + Bayer Dither)...');
  const palettePath = path.join(FRAMES_DIR, 'palette.png');
  
  // Pass 1: palettegen
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame-%03d.png" -vf "fps=${FPS},scale=900:-1:flags=lanczos,palettegen=max_colors=256:reserve_transparent=0:stats_mode=diff" "${palettePath}"`,
    { stdio: 'inherit' }
  );

  // Pass 2: paletteuse
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame-%03d.png" -i "${palettePath}" -lavfi "fps=${FPS},scale=900:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop -1 "${OUTPUT_GIF}"`,
    { stdio: 'inherit' }
  );

  const stats = await fs.stat(OUTPUT_GIF);
  console.log(`✅ Success! Rendered studio-grade GIF: ${OUTPUT_GIF} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

render().catch(console.error);
