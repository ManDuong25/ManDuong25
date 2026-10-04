import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

async function inspect() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless=new'],
    defaultViewport: { width: 1200, height: 800, deviceScaleFactor: 2 }
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:4200');

  const dir = '/tmp/radar-frames';
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 100));
    const el = await page.$('#svgContainer');
    if (el) {
      await el.screenshot({ path: path.join(dir, `frame-${String(i).padStart(2, '0')}.png`) });
    }
  }
  await browser.close();

  execSync(`ffmpeg -y -framerate 10 -i ${dir}/frame-%02d.png -vf "scale=900:220,palettegen" /tmp/pal.png`);
  execSync(`ffmpeg -y -framerate 10 -i ${dir}/frame-%02d.png -i /tmp/pal.png -lavfi "scale=900:220 [x]; [x][1:v] paletteuse" /home/manduong25/.gemini/antigravity-cli/brain/c03dd459-abb7-4ced-986c-ece484edf1c7/radar-recorded.gif`);
  console.log('Finished recording radar-recorded.gif');
}

inspect();
