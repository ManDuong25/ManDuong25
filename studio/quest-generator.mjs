/**
 * Daily Quest HUD Generator — Game-grade UI Systems
 * Single Outer Frame Principle (rx=14, zero nested boxes)
 * Exact Typography & Color Palette aligned with Hero Banner (breslee1707)
 * Interactive Button States: [✓ DONE] vs [+25 EXP]
 * Pure Quest Counters (No %) — Zero redundant footer boilerplate
 * Dynamic Height Adaptation based on task count
 * Live Combat GIF Viewfinder (Goku / Frieza / Ryu)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Pre-load combat GIFs as base64 data URIs for self-contained, offline-compatible SVG embedding
let GIF_CACHE = {};
function getGifDataUri(type = 'goku') {
  if (GIF_CACHE[type]) return GIF_CACHE[type];
  try {
    let filename = 'goku-ssjg-punch.gif';
    if (type === 'frieza') filename = 'goku-frieza.gif';
    else if (type === 'ryu') filename = 'ryu-hadouken.gif';
    const filepath = path.join(ASSETS_DIR, filename);
    if (fs.existsSync(filepath)) {
      const b64 = fs.readFileSync(filepath).toString('base64');
      GIF_CACHE[type] = `data:image/gif;base64,${b64}`;
      return GIF_CACHE[type];
    }
  } catch (e) {
    console.error(`Error loading GIF ${type}:`, e.message);
  }
  return '';
}

function getThemeColors(theme = 'dark') {
  const isDark = theme === 'dark';
  return isDark ? {
    bgStart: '#0d1117', bgMid: '#121926', bgEnd: '#1b2230',
    border: '#30363d',
    textPrimary: '#e6edf3', textMuted: '#8b949e', textSubtle: '#7d8590',
    accentCyan: '#39c5cf', accentPurple: '#a371f7', accentGreen: '#3fb950', accentAmber: '#d29922',
    lineSubtle: 'rgba(255, 255, 255, 0.08)',
    slotBg: 'rgba(255, 255, 255, 0.08)',
    btnPendingBg: 'rgba(255, 255, 255, 0.04)',
    btnPendingBorder: '#30363d',
    btnDoneBg: 'rgba(63, 185, 80, 0.15)',
    btnDoneBorder: '#3fb950',
    glowOpacity: 0.18
  } : {
    bgStart: '#ffffff', bgMid: '#f3f6fa', bgEnd: '#e9eff7',
    border: '#d1d9e0',
    textPrimary: '#1f2328', textMuted: '#59636e', textSubtle: '#656d76',
    accentCyan: '#0860ca', accentPurple: '#7642d8', accentGreen: '#17692e', accentAmber: '#9a6700',
    lineSubtle: 'rgba(31, 35, 40, 0.08)',
    slotBg: 'rgba(31, 35, 40, 0.08)',
    btnPendingBg: 'rgba(31, 35, 40, 0.04)',
    btnPendingBorder: '#d1d9e0',
    btnDoneBg: 'rgba(23, 105, 46, 0.12)',
    btnDoneBorder: '#17692e',
    glowOpacity: 0.12
  };
}

const defaultQuests = [
  {
    id: 1, domain: 'GRIT', domainColor: 'accentAmber',
    title: 'Running 5 km',
    exp: '+50 EXP', expValue: 50, done: false
  },
  {
    id: 2, domain: 'STUDY', domainColor: 'accentCyan',
    title: 'Learning English for 4 hours',
    exp: '+50 EXP', expValue: 50, done: false
  }
];

/**
 * Concept 1 (Recommended): Tactical Combat HUD
 * Single outer frame rx=14, zero nested boxes, button states, no %
 * Dynamically adapts height to any number of tasks (2, 4, 6, 7+)
 * Live Combat GIF Viewfinder fills the left column dynamically!
 */
export function generateQuestTacticalSVG(theme = 'dark', custom = {}) {
  const W = 900;
  const quests = custom.quests || defaultQuests;
  const numQuests = quests.length;
  const doneCount = quests.filter(q => q.done).length;
  const totalCount = quests.length;
  const currentExpYield = quests.filter(q => q.done).reduce((acc, q) => acc + (q.expValue || 50), 0);
  const streak = custom.streak !== undefined ? custom.streak : 0;

  // Dynamic height adaptation based on number of tasks!
  const rowStep = numQuests <= 2 ? 48 : 38;
  const startY = numQuests <= 2 ? 94 : 84;
  const H = Math.max(250, startY + (numQuests - 1) * rowStep + 48);

  const colors = getThemeColors(theme);
  const M = 44;
  const divX = 284;
  const rightX = 316;
  const rightW = W - rightX - M; // 540px

  const rowsSvg = quests.map((q, i) => {
    const y = startY + i * rowStep;
    const isDone = q.done;
    const colorTag = colors[q.domainColor] || colors.accentCyan;
    const btnW = 86, btnH = 24, btnX = rightW - btnW;

    return `
      <!-- Quest Row ${i + 1} -->
      <g transform="translate(${rightX}, ${y})">
        <!-- Interactive Checkbox on left -->
        <g transform="translate(0, -11)">
          ${isDone ? `
            <rect width="18" height="18" rx="4" fill="${colors.accentGreen}" />
            <path d="M4 9 L7.5 12.5 L14 5.5" fill="none" stroke="${theme === 'dark' ? '#0d1117' : '#ffffff'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          ` : `
            <rect width="18" height="18" rx="4" fill="${colors.btnPendingBg}" stroke="${colors.border}" stroke-width="1.3" />
          `}
        </g>

        <!-- Domain Tag -->
        <text x="30" y="2" class="mono" font-size="11.5" font-weight="700" fill="${colorTag}">[${q.domain}]</text>

        <!-- Mission Title -->
        <text x="100" y="2" class="sans" font-size="13.5" font-weight="600" fill="${isDone ? colors.textMuted : colors.textPrimary}">${q.title}</text>

        <!-- Tactical State Button on Right: Chưa bấm vs Bấm rồi -->
        <g transform="translate(${btnX}, -13)">
          ${isDone ? `
            <rect width="${btnW}" height="${btnH}" rx="6" fill="${colors.btnDoneBg}" stroke="${colors.btnDoneBorder}" stroke-width="1.2" />
            <text x="${btnW / 2}" y="16" class="mono" font-size="11" font-weight="700" text-anchor="middle" fill="${colors.accentGreen}">✓ DONE</text>
          ` : `
            <rect width="${btnW}" height="${btnH}" rx="6" fill="${colors.btnPendingBg}" stroke="${colors.btnPendingBorder}" stroke-width="1" />
            <text x="${btnW / 2}" y="16" class="mono" font-size="11" font-weight="700" text-anchor="middle" fill="${colors.accentCyan}">${q.exp}</text>
          `}
        </g>

        <!-- Hairline between rows (NO boxes) -->
        ${i < quests.length - 1 ? `<line x1="0" y1="18" x2="${rightW}" y2="18" stroke="${colors.lineSubtle}" stroke-width="0.8" />` : ''}
      </g>
    `;
  }).join('');

  // Combat GIF Viewfinder parameters
  const gifType = custom.combatGif || 'goku'; // 'goku', 'frieza', or 'ryu'
  const gifDataUri = getGifDataUri(gifType);
  const gifY = 160;
  const gifH = H - gifY - 24; // Stretches dynamically with height!
  const gifW = 216;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Daily Quests // Combat Tactical HUD">
  <defs>
    <linearGradient id="bgG_tac_${theme}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgStart}" />
      <stop offset="45%" stop-color="${colors.bgMid}" />
      <stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>
    <radialGradient id="glow_tac_${theme}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.accentCyan}" stop-opacity="${+(colors.glowOpacity * 1.3).toFixed(3)}" />
      <stop offset="55%" stop-color="${colors.accentPurple}" stop-opacity="${+(colors.glowOpacity * 0.6).toFixed(3)}" />
      <stop offset="100%" stop-color="${colors.accentCyan}" stop-opacity="0" />
    </radialGradient>
    <clipPath id="clip_outer_${theme}"><rect x="0" y="0" width="${W}" height="${H}" rx="14" /></clipPath>
    <clipPath id="gifClip_${theme}"><rect x="0" y="0" width="${gifW}" height="${gifH}" rx="8" /></clipPath>
  </defs>
  <style>
    .mono { font-family: ${MONO}; } .sans { font-family: ${SANS}; }
    @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  </style>

  <!-- 1 SINGLE OUTER FRAME ONLY -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG_tac_${theme})" stroke="${colors.border}" stroke-width="1" />
  <g clip-path="url(#clip_outer_${theme})"><ellipse cx="700" cy="${H / 2}" rx="300" ry="${H / 1.5}" fill="url(#glow_tac_${theme})" /></g>

  <!-- ============ LEFT COLUMN: Telemetry + Combat Viewfinder ============ -->
  <g transform="translate(${M}, 0)">
    <!-- Header baseline y=44 -->
    <circle cx="4" cy="40" r="3.5" fill="${colors.accentGreen}" class="pulse-dot" />
    <text x="16" y="44" class="mono" font-size="11.5" font-weight="700" fill="${colors.textPrimary}">DAILY QUESTS</text>

    <!-- Completion Counter (NO %) -->
    <text x="0" y="90" class="sans" font-size="34" font-weight="800" fill="${colors.textPrimary}" letter-spacing="-0.5">${doneCount}/${totalCount}<tspan class="mono" font-size="13" font-weight="700" fill="${colors.accentGreen}" dx="12">CLEARED</tspan></text>

    <!-- EXP Yield & Streak -->
    <text x="0" y="118" class="mono" font-size="11" font-weight="700" fill="${colors.accentGreen}">YIELD: +${currentExpYield} EXP<tspan font-weight="400" fill="${colors.textSubtle}" dx="8">•</tspan><tspan font-weight="700" fill="${colors.accentAmber}" dx="8">STREAK: ${streak === 1 ? '1 DAY' : `${streak} DAYS`} 🔥</tspan></text>

    <!-- 10-slot Segmented EXP Bar -->
    <g transform="translate(0, 132)">
      ${Array.from({ length: 10 }).map((_, i) => {
        const filled = i < Math.round((doneCount / totalCount) * 10);
        return `<rect x="${i * 21}" y="0" width="${16}" height="5" rx="2" fill="${filled ? colors.accentGreen : colors.slotBg}" opacity="${filled ? 0.95 : 1}" />`;
      }).join('')}
    </g>

    <!-- COMBAT GIF VIEWPORT (Fills empty vertical space dynamically!) -->
    ${gifDataUri ? `
    <g transform="translate(0, ${gifY})">
      <rect width="${gifW}" height="${gifH}" rx="8" fill="${theme === 'dark' ? '#06090e' : '#eef2f8'}" stroke="${colors.border}" stroke-width="1" />
      <g clip-path="url(#gifClip_${theme})">
        <image href="${gifDataUri}" x="0" y="0" width="${gifW}" height="${gifH}" preserveAspectRatio="xMidYMid slice" opacity="0.95" />
      </g>
      <rect width="${gifW}" height="${gifH}" rx="8" fill="none" stroke="${colors.border}" stroke-width="1" />
    </g>
    ` : ''}
  </g>

  <!-- Dynamic Divider Hairline stretching with H -->
  <line x1="${divX}" y1="36" x2="${divX}" y2="${H - 24}" stroke="${colors.border}" stroke-dasharray="3 3" stroke-width="1" opacity="0.65" />

  <!-- ============ RIGHT COLUMN: Objectives Matrix ============ -->
  <g>
    <!-- Right Header aligned at baseline y=44 (NO 'LOG // ISSUE #1' per user note!) -->
    <text x="${rightX}" y="44" class="mono" font-size="11.5" font-weight="700" fill="${colors.textSubtle}">ACTIVE OBJECTIVES</text>

    <!-- Quests Rows -->
    ${rowsSvg}
  </g>
</svg>`;
}

/**
 * Concept 2: Command Deck — Unified Full-Width Mission Deck
 * Single outer frame rx=14, zero nested boxes, button states, no %
 */
export function generateQuestCommandSVG(theme = 'dark', custom = {}) {
  const W = 900;
  const quests = custom.quests || defaultQuests;
  const numQuests = quests.length;
  const doneCount = quests.filter(q => q.done).length;
  const totalCount = quests.length;

  const H = Math.max(240, 84 + (numQuests - 1) * 38 + 42);
  const colors = getThemeColors(theme);
  const M = 44;
  const contentW = W - 2 * M; // 812px

  const rowsSvg = quests.map((q, i) => {
    const y = 84 + i * 38;
    const isDone = q.done;
    const colorTag = colors[q.domainColor] || colors.accentCyan;
    const btnW = 90, btnH = 24, btnX = contentW - btnW;

    return `
      <!-- Mission Row ${i + 1} -->
      <g transform="translate(${M}, ${y})">
        <!-- Interactive Checkbox on left -->
        <g transform="translate(0, -11)">
          ${isDone ? `
            <rect width="18" height="18" rx="4" fill="${colors.accentGreen}" />
            <path d="M4 9 L7.5 12.5 L14 5.5" fill="none" stroke="${theme === 'dark' ? '#0d1117' : '#ffffff'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          ` : `
            <rect width="18" height="18" rx="4" fill="${colors.btnPendingBg}" stroke="${colors.border}" stroke-width="1.3" />
          `}
        </g>

        <!-- Index & Domain -->
        <text x="30" y="2" class="mono" font-size="11.5" font-weight="700" fill="${colors.textSubtle}">0${i + 1}</text>
        <text x="56" y="2" class="mono" font-size="11.5" font-weight="700" fill="${colorTag}">[${q.domain}]</text>

        <!-- Mission Title -->
        <text x="126" y="2" class="sans" font-size="13.5" font-weight="600" fill="${isDone ? colors.textMuted : colors.textPrimary}">${q.title}</text>

        <!-- Tactical State Button on Right: Chưa bấm vs Bấm rồi -->
        <g transform="translate(${btnX}, -13)">
          ${isDone ? `
            <rect width="${btnW}" height="${btnH}" rx="6" fill="${colors.btnDoneBg}" stroke="${colors.btnDoneBorder}" stroke-width="1.2" />
            <text x="${btnW / 2}" y="16" class="mono" font-size="11" font-weight="700" text-anchor="middle" fill="${colors.accentGreen}">✓ DONE</text>
          ` : `
            <rect width="${btnW}" height="${btnH}" rx="6" fill="${colors.btnPendingBg}" stroke="${colors.btnPendingBorder}" stroke-width="1" />
            <text x="${btnW / 2}" y="16" class="mono" font-size="11" font-weight="700" text-anchor="middle" fill="${colors.accentCyan}">${q.exp}</text>
          `}
        </g>

        <!-- Subtle row hairline -->
        ${i < quests.length - 1 ? `<line x1="0" y1="18" x2="${contentW}" y2="18" stroke="${colors.lineSubtle}" stroke-width="0.8" />` : ''}
      </g>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Daily Quests // Command Deck">
  <defs>
    <linearGradient id="bgG_cmd_${theme}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgStart}" />
      <stop offset="45%" stop-color="${colors.bgMid}" />
      <stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>
    <radialGradient id="glow_cmd_${theme}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.accentCyan}" stop-opacity="${+(colors.glowOpacity * 1.3).toFixed(3)}" />
      <stop offset="60%" stop-color="${colors.accentPurple}" stop-opacity="${+(colors.glowOpacity * 0.6).toFixed(3)}" />
      <stop offset="100%" stop-color="${colors.accentCyan}" stop-opacity="0" />
    </radialGradient>
    <clipPath id="clip_cmd_${theme}"><rect x="0" y="0" width="${W}" height="${H}" rx="14" /></clipPath>
  </defs>
  <style>
    .mono { font-family: ${MONO}; } .sans { font-family: ${SANS}; }
    @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
  </style>

  <!-- SINGLE OUTER FRAME -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG_cmd_${theme})" stroke="${colors.border}" stroke-width="1" />
  <g clip-path="url(#clip_cmd_${theme})"><ellipse cx="740" cy="${H / 2}" rx="320" ry="${H / 1.5}" fill="url(#glow_cmd_${theme})" /></g>

  <!-- ============ TOP STRIP (y=42) ============ -->
  <g transform="translate(${M}, 42)">
    <circle cx="4" cy="-4" r="3.5" fill="${colors.accentGreen}" class="pulse-dot" />
    <text x="16" y="0" class="mono" font-size="11.5" font-weight="700" fill="${colors.textPrimary}">DAILY QUESTS</text>

    <!-- Telemetry Stats in Center (NO %, just CLEARED: 2/4) -->
    <text x="280" y="0" class="mono" font-size="11.5" font-weight="700" fill="${colors.accentGreen}">CLEARED: ${doneCount}/${totalCount}</text>
    <text x="440" y="0" class="mono" font-size="11.5" font-weight="700" fill="${colors.accentAmber}">STREAK: 7 DAYS 🔥</text>
  </g>

  <!-- Horizontal Divider under Header (y=56) -->
  <line x1="${M}" y1="56" x2="${W - M}" y2="56" stroke="${colors.border}" stroke-width="1" opacity="0.6" />

  <!-- Quests Rows -->
  ${rowsSvg}
</svg>`;
}
