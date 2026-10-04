import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';

function generateCleanBannerSVG(theme = 'dark', custom = {}) {
  const W = 900, H = 220;

  const data = {
    name: custom.name || 'DƯƠNG CÔNG MÃN',
    handle: custom.handle || 'ManDuong',
    role: custom.role || 'Software & AI Engineer · Final-year CS @ SGU',
    slogan: custom.slogan || 'Life is just a game — just striving to be a little better every day.',
    level: custom.level || '01',
    expPercent: custom.expPercent || '12%',
    ...custom
  };

  const isDark = theme === 'dark';

  const colors = isDark ? {
    bgStart: '#0d1117',
    bgEnd: '#161b22',
    border: '#30363d',
    textPrimary: '#e6edf3',
    textMuted: '#8b949e',
    textSubtle: '#6e7681',
    accentCyan: '#39c5cf',
    accentPurple: '#a371f7',
    accentGreen: '#3fb950',
    accentAmber: '#d29922',
    radarFill: 'rgba(57, 197, 207, 0.12)',
    radarStroke: '#39c5cf',
    echoEmerald: '#3fb950',
    echoCyan: '#39c5cf',
    gridLine: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(57, 197, 207, 0.16)',
    slotBg: 'rgba(255, 255, 255, 0.08)',
    cardBg: 'rgba(22, 27, 34, 0.65)'
  } : {
    bgStart: '#ffffff',
    bgEnd: '#f6f8fa',
    border: '#d0d7de',
    textPrimary: '#1f2328',
    textMuted: '#59636e',
    textSubtle: '#818b98',
    accentCyan: '#0969da',
    accentPurple: '#8250df',
    accentGreen: '#1a7f37',
    accentAmber: '#9a6700',
    radarFill: 'rgba(9, 105, 218, 0.08)',
    radarStroke: '#0969da',
    echoEmerald: '#1a7f37',
    echoCyan: '#0969da',
    gridLine: 'rgba(0, 0, 0, 0.08)',
    glow: 'rgba(9, 105, 218, 0.10)',
    slotBg: 'rgba(0, 0, 0, 0.06)',
    cardBg: 'rgba(246, 248, 250, 0.85)'
  };

  const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
  const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  const STATS_PTS = "0,-38 30,-17 35,20 0,38 -32,18 -27,-15";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${data.name} // GitHub Profile">
  <title>${data.name} — Profile Hero</title>
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgStart}" />
      <stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>

    <!-- Tasteful Accent Line Gradient -->
    <linearGradient id="accentG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colors.accentCyan}" />
      <stop offset="100%" stop-color="${colors.accentPurple}" />
    </linearGradient>

    <!-- Subtle Radial Glow behind Radar -->
    <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.accentCyan}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${colors.accentCyan}" stop-opacity="0" />
    </radialGradient>

    <clipPath id="heroClip">
      <rect x="0" y="0" width="${W}" height="${H}" rx="14" />
    </clipPath>

    <clipPath id="typeClip">
      <rect class="type-rect" x="0" y="16" width="220" height="26" />
    </clipPath>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    .mono { font-family: ${MONO}; }
    .sans { font-family: ${SANS}; }

    @keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
    @keyframes typeText { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes pulseSoft { 0%, 100% { opacity: 0.95; } 50% { opacity: 0.45; } }
    @keyframes spiderEchoWave {
      0% {
        transform: scale(1.0);
        opacity: 0.85;
      }
      50% {
        opacity: 0.35;
      }
      100% {
        transform: scale(1.36);
        opacity: 0;
      }
    }

    .type-rect {
      animation: typeText 1.2s steps(22) 0.2s both;
      transform-box: fill-box;
      transform-origin: left;
    }
    .caret { animation: blink 1.05s step-end infinite; }
    .pulse-dot { animation: pulseSoft 2s ease-in-out infinite; }
    .leading-segment { animation: pulseSoft 1.3s ease-in-out infinite; }

    .spider-echo-1 {
      transform-box: fill-box;
      transform-origin: center;
      animation: spiderEchoWave 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
    }
    .spider-echo-2 {
      transform-box: fill-box;
      transform-origin: center;
      animation: spiderEchoWave 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) 1.2s infinite;
    }
  </style>

  <!-- Card Frame -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG)" stroke="${colors.border}" stroke-width="1" />

  <g clip-path="url(#heroClip)">
    <!-- Subtle Background Glow under Radar -->
    <ellipse cx="730" cy="110" rx="200" ry="120" fill="url(#radarGlow)" />
  </g>

  <!-- LEFT COLUMN: Authentic Developer Identity -->
  <g transform="translate(44, 0)">
    
    <!-- 1. Terminal Prompt (Inspired by breslee1707) -->
    <g transform="translate(0, 36)">
      <text x="0" y="0" class="mono" font-size="12" font-weight="600" fill="${colors.accentCyan}">manduong ~ $ whoami</text>
      <rect class="caret" x="156" y="-11" width="7" height="13" fill="${colors.accentCyan}" />
    </g>

    <!-- 2. Primary Name & Handle -->
    <g transform="translate(0, 72)">
      <text x="0" y="0" class="sans" font-size="28" font-weight="800" fill="${colors.textPrimary}" letter-spacing="-0.4px">
        ${data.name}
      </text>
      <text x="270" y="-1" class="mono" font-size="14" font-weight="600" fill="${colors.accentCyan}">
        // ${data.handle}
      </text>
    </g>

    <!-- 3. Clean Accent Gradient Rule -->
    <rect x="0" y="86" width="60" height="3" rx="1.5" fill="url(#accentG)" />

    <!-- 4. Real-world Role & University -->
    <text x="0" y="112" class="sans" font-size="13.5" font-weight="500" fill="${colors.textMuted}">
      ${data.role}
    </text>

    <!-- 5. Level & Progress Meter (Tasteful RPG Milestone) -->
    <g transform="translate(0, 142)">
      <text x="0" y="0" class="mono" font-size="10.5" font-weight="700" fill="${colors.accentGreen}">LVL.${data.level}</text>
      <text x="48" y="0" class="mono" font-size="10" font-weight="500" fill="${colors.textSubtle}">EXP PROGRESS</text>
      <text x="206" y="0" class="mono" font-size="10" font-weight="700" fill="${colors.accentGreen}">${data.expPercent}</text>

      <!-- Segmented EXP Slots (1 solid starter, 1 active breathing, 12 remaining) -->
      <g transform="translate(0, 7)">
        ${Array.from({ length: 14 }).map((_, i) => {
          if (i === 0) {
            return `<rect x="${i * 15}" y="0" width="11" height="5" rx="1.5" fill="${colors.accentGreen}" opacity="0.9" />`;
          } else if (i === 1) {
            return `<rect class="leading-segment" x="${i * 15}" y="0" width="11" height="5" rx="1.5" fill="${colors.accentGreen}" filter="url(#softGlow)" />`;
          } else {
            return `<rect x="${i * 15}" y="0" width="11" height="5" rx="1.5" fill="${colors.slotBg}" />`;
          }
        }).join('')}
      </g>
    </g>

    <!-- 6. Personal Philosophy (Clean italic quote) -->
    <g transform="translate(0, 186)">
      <text x="0" y="0" class="sans" font-size="11.5" font-weight="500" font-style="italic" fill="${colors.textSubtle}">
        "${data.slogan}"
      </text>
    </g>
  </g>

  <!-- RIGHT COLUMN: Character Sheet (Radar Spider Web & Side Metrics) -->
  <g transform="translate(540, 24)">
    
    <!-- Sub-card Border Frame (Clean, subtle GitHub card) -->
    <rect x="0" y="0" width="316" height="172" rx="10" fill="${colors.cardBg}" stroke="${colors.border}" stroke-width="1" />

    <!-- Card Header -->
    <g transform="translate(16, 20)">
      <circle cx="0" cy="0" r="3" fill="${colors.accentGreen}" class="pulse-dot" />
      <text x="10" y="3.5" class="mono" font-size="9.5" font-weight="700" fill="${colors.textMuted}">ATTRIBUTES</text>
      <text x="96" y="3.5" class="mono" font-size="9.5" fill="${colors.textSubtle}">//</text>
      <text x="112" y="3.5" class="mono" font-size="9.5" font-weight="600" fill="${colors.accentGreen}">SYS.READY</text>
    </g>

    <!-- Side Metrics List -->
    <g transform="translate(16, 48)">
      <g transform="translate(0, 0)">
        <text x="0" y="0" class="mono" font-size="8.5" font-weight="600" fill="${colors.textSubtle}">HEALTH (HP)</text>
        <text x="0" y="14" class="mono" font-size="12" font-weight="800" fill="${colors.accentGreen}">100 / 100</text>
      </g>
      <g transform="translate(0, 36)">
        <text x="0" y="0" class="mono" font-size="8.5" font-weight="600" fill="${colors.textSubtle}">MOMENTUM</text>
        <text x="0" y="14" class="mono" font-size="12" font-weight="800" fill="${colors.accentCyan}">+1.0% / DAY</text>
      </g>
      <g transform="translate(0, 72)">
        <text x="0" y="0" class="mono" font-size="8.5" font-weight="600" fill="${colors.textSubtle}">FOCUS BUFFER</text>
        <text x="0" y="14" class="mono" font-size="12" font-weight="800" fill="${colors.accentAmber}">OPTIMAL</text>
      </g>
    </g>

    <!-- Holographic Radar Center at (224, 92) -->
    <g transform="translate(224, 92)">
      <!-- Hexagonal Grid Rings -->
      <polygon points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22" fill="none" stroke="${colors.gridLine}" stroke-width="1" />
      <polygon points="0,-29 25,-14.5 25,14.5 0,29 -25,14.5 -25,-14.5" fill="none" stroke="${colors.gridLine}" stroke-width="0.8" stroke-dasharray="2 2" />
      <polygon points="0,-14.5 12.5,-7.2 12.5,7.2 0,14.5 -12.5,7.2 -12.5,-7.2" fill="none" stroke="${colors.gridLine}" stroke-width="0.6" />

      <!-- Cross Axes -->
      <line x1="0" y1="-46" x2="0" y2="46" stroke="${colors.gridLine}" stroke-width="0.8" />
      <line x1="-40" y1="-23" x2="40" y2="23" stroke="${colors.gridLine}" stroke-width="0.8" />
      <line x1="-40" y1="23" x2="40" y2="-23" stroke="${colors.gridLine}" stroke-width="0.8" />

      <!-- RADIATING ECHO WAVES (CHÍNH CÁI MẠNG NHỆN TỎA RA) -->
      <g class="spider-echo-1">
        <polygon points="${STATS_PTS}" fill="none" stroke="${colors.echoEmerald}" stroke-width="1.6" filter="url(#softGlow)">
          <animateTransform attributeName="transform" type="scale" from="1.0" to="1.36" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85; 0.35; 0" keyTimes="0; 0.5; 1" dur="2.4s" repeatCount="indefinite" />
        </polygon>
      </g>
      <g class="spider-echo-2">
        <polygon points="${STATS_PTS}" fill="none" stroke="${colors.echoCyan}" stroke-width="1.3" filter="url(#softGlow)">
          <animateTransform attributeName="transform" type="scale" from="1.0" to="1.36" begin="1.2s" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.85; 0.35; 0" keyTimes="0; 0.5; 1" begin="1.2s" dur="2.4s" repeatCount="indefinite" />
        </polygon>
      </g>

      <!-- Main Spider Web Polygon -->
      <polygon points="${STATS_PTS}" fill="${colors.radarFill}" stroke="${colors.radarStroke}" stroke-width="1.8" filter="url(#softGlow)" />

      <!-- Attribute Vertex Nodes -->
      <circle cx="0" cy="-38" r="2.2" fill="${colors.accentCyan}" />
      <circle cx="30" cy="-17" r="2.2" fill="${colors.accentCyan}" />
      <circle cx="35" cy="20" r="2.2" fill="${colors.accentCyan}" />
      <circle cx="0" cy="38" r="2.2" fill="${colors.accentCyan}" />
      <circle cx="-32" cy="18" r="2.2" fill="${colors.accentCyan}" />
      <circle cx="-27" cy="-15" r="2.2" fill="${colors.accentCyan}" />

      <!-- Center Node -->
      <circle cx="0" cy="0" r="2" fill="${colors.accentGreen}" />

      <!-- Labels (Clean monospace, comfortable distance) -->
      <text x="0" y="-48" class="mono" font-size="7.5" font-weight="700" text-anchor="middle" fill="${colors.textSubtle}">CODE</text>
      <text x="44" y="-19" class="mono" font-size="7.5" font-weight="700" text-anchor="start" fill="${colors.textSubtle}">SYS</text>
      <text x="44" y="24" class="mono" font-size="7.5" font-weight="700" text-anchor="start" fill="${colors.textSubtle}">AI</text>
      <text x="0" y="52" class="mono" font-size="7.5" font-weight="700" text-anchor="middle" fill="${colors.textSubtle}">LOGIC</text>
      <text x="-44" y="24" class="mono" font-size="7.5" font-weight="700" text-anchor="end" fill="${colors.textSubtle}">GRIT</text>
      <text x="-44" y="-19" class="mono" font-size="7.5" font-weight="700" text-anchor="end" fill="${colors.textSubtle}">DESIGN</text>
    </g>
  </g>
</svg>`;
}

async function testRender() {
  console.log('1. Rendering clean dark & light SVGs...');
  const darkSvg = generateCleanBannerSVG('dark');
  const lightSvg = generateCleanBannerSVG('light');

  const artifactDir = '/home/manduong25/.gemini/antigravity-cli/brain/c03dd459-abb7-4ced-986c-ece484edf1c7';
  await fs.writeFile(`${artifactDir}/clean-test-dark.svg`, darkSvg, 'utf8');
  await fs.writeFile(`${artifactDir}/clean-test-light.svg`, lightSvg, 'utf8');

  console.log('2. Rendering 60-frame GIF with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless=new'],
    defaultViewport: { width: 900, height: 220, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#0d1117;width:900px;height:220px;overflow:hidden;">${darkSvg}</body></html>`;
  await page.setContent(html);

  const framesDir = '/tmp/clean-frames';
  await fs.rm(framesDir, { recursive: true, force: true });
  await fs.mkdir(framesDir, { recursive: true });

  const TOTAL_FRAMES = 60;
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const p1 = f / TOTAL_FRAMES;
    const p2 = ((f + TOTAL_FRAMES / 2) % TOTAL_FRAMES) / TOTAL_FRAMES;
    const s1 = (1.0 + 0.36 * Math.pow(p1, 0.85)).toFixed(3);
    const o1 = Math.max(0, (1 - p1) * 0.85).toFixed(3);
    const s2 = (1.0 + 0.36 * Math.pow(p2, 0.85)).toFixed(3);
    const o2 = Math.max(0, (1 - p2) * 0.85).toFixed(3);
    const pulseOp = (0.45 + 0.55 * Math.sin((f / TOTAL_FRAMES) * 2 * Math.PI)).toFixed(2);

    await page.evaluate((scale1, op1, scale2, op2, pOp) => {
      const e1 = document.querySelector('.spider-echo-1 polygon');
      if (e1) {
        e1.setAttribute('transform', `scale(${scale1})`);
        e1.setAttribute('opacity', op1);
      }
      const e2 = document.querySelector('.spider-echo-2 polygon');
      if (e2) {
        e2.setAttribute('transform', `scale(${scale2})`);
        e2.setAttribute('opacity', op2);
      }
      const dots = document.querySelectorAll('.pulse-dot');
      dots.forEach(d => { d.style.animation = 'none'; d.style.opacity = pOp; });
      const leading = document.querySelector('.leading-segment');
      if (leading) { leading.style.animation = 'none'; leading.style.opacity = pOp; }
    }, s1, o1, s2, o2, pulseOp);

    await page.screenshot({ path: path.join(framesDir, `frame-${String(f).padStart(3, '0')}.png`) });
  }
  await browser.close();

  const outGif = `${artifactDir}/clean-test-banner.gif`;
  execSync(`ffmpeg -y -framerate 30 -i ${framesDir}/frame-%03d.png -vf "palettegen" /tmp/pal-clean.png`);
  execSync(`ffmpeg -y -framerate 30 -i ${framesDir}/frame-%03d.png -i /tmp/pal-clean.png -lavfi "paletteuse=dither=bayer:bayer_scale=5" ${outGif}`);
  console.log('✅ Generated clean GIF:', outGif);
}

testRender();
