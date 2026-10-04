/**
 * Clean & Basic GitHub Profile Banner Generator
 * Inspired by breslee1707 — authentic GitHub-native typography, no gimmicks.
 *
 * Golden Ratio Canvas Scale: 900 x 280 (High Legibility & Visual Breathing Room)
 * ---------------------------------------------------------------------------
 *  Canvas ........ 900 x 280
 *  Side margin ... 48px on both left and right (optical symmetry)
 *  Baseline grid . whoami: y=42 (highest element, top ink at y=32)
 *                  Name / Top Ink: y=92 (letter D cap-top at y=70.0)
 *                  Right headers: y=78 (top ink at y=70.0 -> exact 0.0px match with letter D)
 *                  Pulse dot: cy=73.5, r=3.5 (top ink at y=70.0)
 *                  Role: y=138
 *                  Level: y=180
 *                  Quote: y=238 (descenders to y=241, 39px bottom margin)
 *  Columns ....... COL1 x=48   identity (whoami, name, role, level, quote)
 *                  COL2 x=475  facts (ABOUT // ME, FOCUS, CAMPUS, DAILY COMPOUND)
 *                  COL3        radar; axis x=776, right ink edge ≈ 850 (50px margin)
 *                              radar center cy=168, radius R=52, bottom label LOGIC y=237
 *  Type scale .... 32 / 17 / 15 / 14.5 / 13.5 / 12 / 11 (breslee1707 typography)
 *  Contrast ...... WCAG AA compliant on both dark and light GitHub themes
 */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function generateBannerSVG(theme = 'dark', custom = {}) {
  const W = 900, H = 280;

  // ---- Grid ---------------------------------------------------------------
  const M = 48;                                   // side margin
  const R_WHOAMI = 42;                            // whoami is alone at the top (highest)
  const R_NAME = 92;                              // primary name baseline (letter D cap-top at y = 70.0)
  const R_HEADER_RIGHT = 78;                      // right side aligns with cap-top of letter D (top ink at y = 70.0)
  const R_ROLE = 138;                             // developer role baseline
  const R_LVL = 180;                              // level and EXP progress baseline
  const R_QUOTE = 238;                            // quote baseline (bottom margin 39px)

  const COL1 = M;
  const COL2 = 475;                               // generous 43px gutter from quote, 26px gutter to radar
  const RADAR_R = 52;                             // outer hexagon radius (104px diameter)
  const RADAR_RX = +(RADAR_R * Math.cos(Math.PI / 6)).toFixed(2); // 45.03
  const RADAR_CY = 168;                           // radar center (bottom label LOGIC lands on y = 237, locking with quote)
  const COL3_AXIS = 776;                          // radar axis -> right ink edge ≈ 850px (50px margin)
  const COL3_LEFT = 682;                          // header + DESIGN label left edge

  const data = {
    name: custom.name || 'DƯƠNG CÔNG MÃN',
    handle: custom.handle || '',
    role: custom.role || 'Software & AI Engineer',
    slogan: custom.slogan || 'Life is just a game — just striving to be a little better every day.',
    level: custom.level || '01',
    expPercent: custom.expPercent || '12%',
  };
  const name = esc(data.name), handle = esc(data.handle), role = esc(data.role);
  const slogan = esc(data.slogan), level = esc(data.level), exp = esc(data.expPercent);

  const isDark = theme === 'dark';

  const colors = isDark ? {
    bgStart: '#0d1117', bgMid: '#121926', bgEnd: '#1b2230',
    border: '#30363d',
    textPrimary: '#e6edf3', textMuted: '#8b949e', textSubtle: '#848d97',
    accentCyan: '#39c5cf', accentPurple: '#a371f7', accentGreen: '#3fb950',
    radarFill: 'rgba(57, 197, 207, 0.14)', radarStroke: '#39c5cf',
    gridLine: 'rgba(255, 255, 255, 0.12)',
    glowOpacity: 0.20,
    slotBg: 'rgba(255, 255, 255, 0.08)'
  } : {
    bgStart: '#ffffff', bgMid: '#f3f6fa', bgEnd: '#e9eff7',
    border: '#d1d9e0',
    textPrimary: '#1f2328', textMuted: '#59636e', textSubtle: '#656d76',
    accentCyan: '#0860ca', accentPurple: '#7642d8', accentGreen: '#17692e',
    radarFill: 'rgba(8, 96, 202, 0.12)', radarStroke: '#0860ca',
    gridLine: 'rgba(31, 35, 40, 0.12)',
    glowOpacity: 0.15,
    slotBg: 'rgba(31, 35, 40, 0.08)'
  };

  const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
  const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

  // ---- Radar geometry (pointy-top hexagon, vertices clockwise from top) ----
  const R = RADAR_R, Rx = RADAR_RX;
  const unit = [[0, -1], [Rx / R, -0.5], [Rx / R, 0.5], [0, 1], [-Rx / R, 0.5], [-Rx / R, -0.5]];
  const ring = (k) => unit.map(([x, y]) => `${+(x * R * k).toFixed(2)},${+(y * R * k).toFixed(2)}`).join(' ');
  // Real stat silhouette, order: CODE, SYS, AI, LOGIC, GRIT, DESIGN
  const STATS = [0.86, 0.78, 0.92, 0.86, 0.83, 0.70];
  const statVerts = unit.map(([x, y], i) => [+(x * R * STATS[i]).toFixed(2), +(y * R * STATS[i]).toFixed(2)]);
  const STATS_PTS = statVerts.map(([x, y]) => `${x},${y}`).join(' ');
  const axisExt = 1.04;
  const axes = [0, 1, 2].map((i) => {
    const [x, y] = unit[i];
    const ax = +(x * R * axisExt).toFixed(2), ay = +(y * R * axisExt).toFixed(2);
    return `<line x1="${-ax}" y1="${-ay}" x2="${ax}" y2="${ay}" stroke="${colors.gridLine}" stroke-width="1" />`;
  }).join('\n      ');

  // Axis labels: 11px caps, 9px clear of each vertex
  const LBL_GAP = 9, LBL_DY = 4;
  const lbl = (txt, x, y, anchor) =>
    `<text x="${x}" y="${y}" class="mono" font-size="11" font-weight="700" text-anchor="${anchor}" fill="${colors.textSubtle}">${txt}</text>`;
  const labels = [
    lbl('CODE', 0, -(R + LBL_GAP), 'middle'),
    lbl('SYS', +(Rx + LBL_GAP).toFixed(2), +(-R / 2 + LBL_DY).toFixed(2), 'start'),
    lbl('AI', +(Rx + LBL_GAP).toFixed(2), +(R / 2 + LBL_DY).toFixed(2), 'start'),
    lbl('LOGIC', 0, R + LBL_GAP + 8, 'middle'),
    lbl('GRIT', -+(Rx + LBL_GAP).toFixed(2), +(R / 2 + LBL_DY).toFixed(2), 'end'),
    lbl('DESIGN', -+(Rx + LBL_GAP).toFixed(2), +(-R / 2 + LBL_DY).toFixed(2), 'end'),
  ].join('\n      ');

  // ---- Middle column: 3 fact blocks with 50px vertical rhythm ----------
  const fact = (labelY, valY, label, value, cls, fill, dxLabel = -0.6, dxVal = -0.3, size = '14.5') => `
    <text x="${+(COL2 + dxLabel).toFixed(2)}" y="${labelY}" class="mono" font-size="11" font-weight="600" fill="${colors.textSubtle}">${label}</text>
    <text x="${+(COL2 + dxVal).toFixed(2)}" y="${valY}" class="${cls}" font-size="${size}" font-weight="700" fill="${fill}">${value}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name} // GitHub Profile">
  <title>${name} — Profile Hero</title>
  <defs>
    <linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgStart}" />
      <stop offset="45%" stop-color="${colors.bgMid}" />
      <stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>

    <linearGradient id="accentG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colors.accentCyan}" />
      <stop offset="100%" stop-color="${colors.accentPurple}" />
    </linearGradient>

    <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.accentCyan}" stop-opacity="${+(colors.glowOpacity * 1.3).toFixed(3)}" />
      <stop offset="55%" stop-color="${colors.accentPurple}" stop-opacity="${+(colors.glowOpacity * 0.6).toFixed(3)}" />
      <stop offset="100%" stop-color="${colors.accentCyan}" stop-opacity="0" />
    </radialGradient>

    <clipPath id="heroClip">
      <rect x="0" y="0" width="${W}" height="${H}" rx="14" />
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
    @keyframes pulseSoft { 0%, 100% { opacity: 0.95; } 50% { opacity: 0.45; } }
    /* Plays ONCE on load/reload, grows from the centre dot (local origin 0,0), then stays */
    @keyframes spiderBloomOnce {
      0%, 12% { transform: scale(0); opacity: 0; }
      85%     { transform: scale(1.03); opacity: 1; }
      100%    { transform: scale(1); opacity: 1; }
    }

    .caret { animation: blink 1.05s step-end infinite; }
    .pulse-dot { animation: pulseSoft 2s ease-in-out infinite; }
    .leading-segment { animation: pulseSoft 1.3s ease-in-out infinite; }
    .spider-bloom-group {
      transform-box: view-box;
      transform-origin: 0 0;
      animation: spiderBloomOnce 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.25s 1 both;
    }
  </style>

  <!-- Single outer frame -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG)" stroke="${colors.border}" stroke-width="1" />

  <g clip-path="url(#heroClip)">
    <!-- Ambient glow bridging COL2 and COL3, centred on the middle row axis -->
    <ellipse cx="640" cy="140" rx="300" ry="170" fill="url(#meshGlow)" />
  </g>

  <!-- ============ COL1 — identity (x=${COL1}) ============ -->
  <g transform="translate(${COL1}, 0)">
    <!-- whoami: HIGHEST element on the canvas (baseline y=${R_WHOAMI}, top ink at y=32.0) -->
    <text x="-0.5" y="${R_WHOAMI}" class="mono" font-size="13.5" font-weight="600" fill="${colors.accentCyan}">manduong ~ $ whoami</text>
    <rect class="caret" x="160" y="${R_WHOAMI - 12}" width="8" height="14" fill="${colors.accentCyan}" />

    <!-- Name (headline) -->
    <text x="-1.8" y="${R_NAME}"><tspan class="sans" font-size="32" font-weight="800" fill="${colors.textPrimary}" letter-spacing="-0.4">${name}</tspan>${handle ? `<tspan class="sans" font-size="17" font-weight="600" fill="${colors.accentCyan}" dx="14">// ${handle}</tspan>` : ''}</text>

    <!-- accent rule: optically centred between Name baseline and Role cap-top -->
    <rect x="0" y="${R_NAME + 14}" width="68" height="3.5" rx="1.75" fill="url(#accentG)" />

    <!-- Role -->
    <text x="-0.6" y="${R_ROLE}" class="sans" font-size="15" font-weight="500" fill="${colors.textMuted}">${role}</text>

    <!-- Level row; 14 slots x 18px pitch -> bar right edge = 247 = right edge of the % -->
    <text x="-0.8" y="${R_LVL}" class="mono" font-size="12" font-weight="700" fill="${colors.accentGreen}">LVL.${level}<tspan font-weight="500" fill="${colors.textSubtle}" dx="14">EXP PROGRESS</tspan></text>
    <text x="246" y="${R_LVL}" text-anchor="end" class="mono" font-size="12" font-weight="700" fill="${colors.accentGreen}">${exp}</text>
    <g transform="translate(0, ${R_LVL + 9})">
      ${Array.from({ length: 14 }).map((_, i) => {
        if (i === 0) return `<rect x="${i * 18}" y="0" width="13" height="6" rx="2" fill="${colors.accentGreen}" opacity="0.9" />`;
        if (i === 1) return `<rect class="leading-segment" x="${i * 18}" y="0" width="13" height="6" rx="2" fill="${colors.accentGreen}" filter="url(#softGlow)" />`;
        return `<rect x="${i * 18}" y="0" width="13" height="6" rx="2" fill="${colors.slotBg}" />`;
      }).join('')}
    </g>

    <!-- Philosophy quote -->
    <text x="-1" y="${R_QUOTE}" class="sans" font-size="13.5" font-weight="500" font-style="italic" fill="${colors.textSubtle}">"${slogan}"</text>
  </g>

  <!-- ============ COL2 — facts (x=${COL2}); starts at y=${R_HEADER_RIGHT} aligned with letter D ============ -->
  <g>
    <text x="${COL2}" y="${R_HEADER_RIGHT}" class="mono" font-size="11" font-weight="700" fill="${colors.textMuted}">ABOUT<tspan font-weight="400" fill="${colors.textSubtle}" dx="8.8">//</tspan><tspan fill="${colors.accentGreen}" font-weight="600" dx="8.8">ME</tspan></text>
    ${fact(106, 126, 'FOCUS', 'Software &amp; AI Engineering', 'sans', colors.textPrimary, -0.7, -0.3, '14.5')}
    ${fact(156, 176, 'CAMPUS', 'Sài Gòn University', 'sans', colors.accentCyan, -0.5, -0.3, '14.5')}
    ${fact(206, 226, 'DAILY COMPOUND', '1.01³⁶⁵ ≈ 37.8x', 'mono', colors.accentGreen, -0.5, -0.8, '14.5')}
  </g>

  <!-- ============ COL3 — radar (axis x=${COL3_AXIS}); starts at y=${R_HEADER_RIGHT} aligned with letter D ============ -->
  <g>
    <!-- header: left edge = DESIGN label left edge (${COL3_LEFT}); baseline = R_HEADER_RIGHT (${R_HEADER_RIGHT}) -->
    <circle cx="${COL3_LEFT + 3.5}" cy="${R_HEADER_RIGHT - 4.5}" r="3.5" fill="${colors.accentGreen}" class="pulse-dot" />
    <text x="${COL3_LEFT + 14}" y="${R_HEADER_RIGHT}" class="mono" font-size="11" font-weight="700" fill="${colors.textMuted}">ATTRIBUTES<tspan font-weight="400" fill="${colors.textSubtle}" dx="8.8">//</tspan><tspan fill="${colors.accentGreen}" font-weight="600" dx="8.8">SYS.READY</tspan></text>

    <g transform="translate(${COL3_AXIS}, ${RADAR_CY})">
      <polygon points="${ring(1)}" fill="none" stroke="${colors.gridLine}" stroke-width="1.2" />
      <polygon points="${ring(2 / 3)}" fill="none" stroke="${colors.gridLine}" stroke-width="0.9" stroke-dasharray="3 3" />
      <polygon points="${ring(1 / 3)}" fill="none" stroke="${colors.gridLine}" stroke-width="0.8" />
      ${axes}

      <!-- the real spider web: blooms ONCE from the centre dot -->
      <g class="spider-bloom-group">
        <polygon points="${STATS_PTS}" fill="${colors.radarFill}" stroke="${colors.radarStroke}" stroke-width="2" stroke-linejoin="round" filter="url(#softGlow)" />
        ${statVerts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${colors.accentCyan}" />`).join('\n        ')}
      </g>

      <circle cx="0" cy="0" r="3" fill="${colors.accentGreen}" class="pulse-dot" />

      ${labels}
    </g>
  </g>
</svg>`;
}
