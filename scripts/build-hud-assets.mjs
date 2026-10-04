import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateBannerSVG } from '../studio/banner-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

async function build() {
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  const darkSvg = generateBannerSVG('dark');
  const lightSvg = generateBannerSVG('light');

  await fs.writeFile(path.join(ASSETS_DIR, 'hero-dark.svg'), darkSvg, 'utf8');
  await fs.writeFile(path.join(ASSETS_DIR, 'hero-light.svg'), lightSvg, 'utf8');

  console.log('✅ Generated Modern Cyber HUD assets:');
  console.log(' - assets/hero-dark.svg');
  console.log(' - assets/hero-light.svg');
}

build().catch(console.error);
