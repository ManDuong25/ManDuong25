/**
 * Clean & Basic GitHub Profile Banner Generator
 * Inspired by breslee1707 — authentic GitHub-native typography, no gimmicks.
 *
 * Golden Ratio Canvas Scale: 900 x 280 (High Legibility & Visual Breathing Room)
 * ---------------------------------------------------------------------------
 *  Canvas ........ 900 x 280
 *  Side margin ... 48px on both left and right (optical symmetry)
 *  Baseline grid . whoami: y=42 (highest element, top ink at y=32)
 *                  Top Ink Bound: y=70.0 (letter D cap-top = ABOUT // ME = ATTRIBUTES // SYS.READY)
 *                  Role: y=150
 *                  Bottom Bound: y=238.0 (Level Progress bar = Daily Compound in Col 2 = Radar LOGIC in Col 3)
 *                  -> All 3 columns have EQUAL visual height and harmonious vertical rhythm!
 *  Columns ....... COL1 x=48   identity (whoami, name, role, level progress)
 *                  COL2 x=475  facts (ABOUT // ME, FOCUS, CAMPUS, DAILY COMPOUND)
 *                  COL3        radar; axis x=776, right ink edge ≈ 850 (50px margin)
 *                              radar center cy=168, radius R=52, bottom label LOGIC y=238
 *  Type scale .... 32 / 17 / 16 / 14.5 / 13.5 / 12 / 11 (breslee1707 typography)
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

  const R_ROLE = 150;                             // Role baseline
  const R_LVL = 218;                              // Level Progress text baseline
  const R_BOTTOM = 238;                           // Common bottom baseline across columns

  const COL1 = M;
  const COL2 = 475;                               // generous 43px gutter, 26px gutter to radar
  const RADAR_R = 52;                             // outer hexagon radius (104px diameter)
  const RADAR_RX = +(RADAR_R * Math.cos(Math.PI / 6)).toFixed(2); // 45.03
  const RADAR_CY = 168;                           // radar center (bottom label LOGIC lands on y = 238)
  const COL3_AXIS = 766;                          // radar axis -> right ink edge ≈ 882px (18px margin)
  const COL3_LEFT = 666;                          // header + SYSTEMS label left edge

  const data = {
    name: custom.name || 'DƯƠNG CÔNG MÃN',
    handle: custom.handle || '',
    role: custom.role || 'Software & AI Engineer',
    level: custom.level || '01',
    currentExp: custom.currentExp !== undefined ? custom.currentExp : 0,
    requiredExp: custom.requiredExp !== undefined ? custom.requiredExp : 100,
    expPercent: custom.expPercent !== undefined ? custom.expPercent : '0%',
  };
  const isFrameless = custom.frameless !== undefined ? custom.frameless : true;
  const name = esc(data.name), handle = esc(data.handle), role = esc(data.role);
  const level = esc(data.level);

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

  // ---- Radar geometry (pointy-top 5-pillar pentagon, vertices clockwise from top) ----
  const R = RADAR_R;
  const sin72 = +(Math.sin(72 * Math.PI / 180)).toFixed(4); // 0.9511
  const cos72 = +(Math.cos(72 * Math.PI / 180)).toFixed(4); // 0.3090
  const sin36 = +(Math.sin(36 * Math.PI / 180)).toFixed(4); // 0.5878
  const cos36 = +(Math.cos(36 * Math.PI / 180)).toFixed(4); // 0.8090

  // 5 vertices (Pentagon): TECH (0, top), INTELLECT (1, top-right), VITALITY (2, bottom-right), GRIT (3, bottom-left), OUTPUT (4, top-left)
  const unit = [
    [0, -1],
    [sin72, -cos72],
    [sin36, cos36],
    [-sin36, cos36],
    [-sin72, -cos72]
  ];
  const ring = (k) => unit.map(([x, y]) => `${+(x * R * k).toFixed(2)},${+(y * R * k).toFixed(2)}`).join(' ');

  // Dynamic Warrior Attributes: TECH, INTELLECT, VITALITY, GRIT, OUTPUT (5 Pillars)
  const attrs = custom.attributes || {};
  const getScore = (key) => {
    const a = attrs[key];
    if (!a || typeof a.score !== 'number' || a.score <= 0) return 0.05;
    return Math.max(0.05, Math.min(1.0, a.score));
  };
  // Order clockwise: TECH (0), INTELLECT (1), VITALITY (2), GRIT (3), OUTPUT (4)
  const STATS = [
    getScore('TECH'),
    getScore('INTELLECT'),
    getScore('VITALITY'),
    getScore('GRIT'),
    getScore('OUTPUT')
  ];
  const statVerts = unit.map(([x, y], i) => [+(x * R * STATS[i]).toFixed(2), +(y * R * STATS[i]).toFixed(2)]);
  const STATS_PTS = statVerts.map(([x, y]) => `${x},${y}`).join(' ');
  const axisExt = 1.04;
  const axes = unit.map(([x, y]) => {
    const ax = +(x * R * axisExt).toFixed(2), ay = +(y * R * axisExt).toFixed(2);
    return `<line x1="0" y1="0" x2="${ax}" y2="${ay}" stroke="${colors.gridLine}" stroke-width="1.2" />`;
  }).join('\n      ');

  // Axis labels: 11px caps, 9px clear of each vertex (NO parentheses, clean)
  const LBL_GAP = 9, LBL_DY = 4;
  const lbl = (txt, x, y, anchor) =>
    `<text x="${x}" y="${y}" class="mono" font-size="11" font-weight="700" text-anchor="${anchor}" fill="${colors.textSubtle}">${txt}</text>`;
  const labels = [
    lbl('TECH', 0, -(R + LBL_GAP), 'middle'),
    lbl('INTELLECT', +(unit[1][0] * R + 8).toFixed(2), +(unit[1][1] * R + LBL_DY).toFixed(2), 'start'),
    lbl('VITALITY', +(unit[2][0] * R + 8).toFixed(2), +(unit[2][1] * R + 6).toFixed(2), 'start'),
    lbl('GRIT', +(unit[3][0] * R - 8).toFixed(2), +(unit[3][1] * R + 6).toFixed(2), 'end'),
    lbl('OUTPUT', +(unit[4][0] * R - 8).toFixed(2), +(unit[4][1] * R + LBL_DY).toFixed(2), 'end'),
  ].join('\n      ');

  // ---- Middle column: 3 fact blocks with synchronized baselines ----------
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

  ${!isFrameless ? `
  <!-- Single outer frame -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG)" stroke="${colors.border}" stroke-width="1" />

  <g clip-path="url(#heroClip)">
    <!-- Ambient glow bridging COL2 and COL3, centred on the middle row axis -->
    <ellipse cx="640" cy="140" rx="300" ry="170" fill="url(#meshGlow)" />
  </g>
  ` : `
  <!-- FRAMELESS: Clean subtle hairline boundary rules -->
  <line x1="0" y1="0.5" x2="${W}" y2="0.5" stroke="${colors.border}" stroke-width="1" opacity="0.45" />
  <line x1="0" y1="${H - 0.5}" x2="${W}" y2="${H - 0.5}" stroke="${colors.border}" stroke-width="1" opacity="0.45" />
  `}

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
    <text x="-0.6" y="${R_ROLE}" class="sans" font-size="16" font-weight="500" fill="${colors.textMuted}">${role}</text>

    <!-- Level row at bottom -->
    <text x="-0.8" y="${R_LVL}" class="mono" font-size="12" font-weight="700" fill="${colors.accentGreen}">LVL.${level}<tspan font-weight="500" fill="${colors.textSubtle}" dx="12">PROGRESS</tspan></text>
    <text x="246" y="${R_LVL}" text-anchor="end" class="mono" font-size="12" font-weight="700" fill="${colors.accentGreen}">${data.currentExp} / ${data.requiredExp} EXP</text>
    <g transform="translate(0, ${R_LVL + 10})">
      ${(() => {
        const pct = data.requiredExp > 0
          ? Math.max(0, Math.min(100, (data.currentExp / data.requiredExp) * 100))
          : (parseInt(data.expPercent) || 0);
        const filledCount = Math.round((pct / 100) * 14);
        return Array.from({ length: 14 }).map((_, i) => {
          if (i < filledCount - 1) {
            return `<rect x="${i * 18}" y="0" width="13" height="7" rx="2" fill="${colors.accentGreen}" opacity="0.9" />`;
          } else if (i === filledCount - 1 && filledCount > 0) {
            return `<rect class="leading-segment" x="${i * 18}" y="0" width="13" height="7" rx="2" fill="${colors.accentGreen}" filter="url(#softGlow)" />`;
          }
          return `<rect x="${i * 18}" y="0" width="13" height="7" rx="2" fill="${colors.slotBg}" />`;
        }).join('');
      })()}
    </g>
  </g>

  <!-- ============ COL2 — facts (x=${COL2}); starts at y=${R_HEADER_RIGHT} aligned with letter D ============ -->
  <g>
    <text x="${COL2}" y="${R_HEADER_RIGHT}" class="mono" font-size="11" font-weight="700" fill="${colors.textMuted}">ABOUT<tspan font-weight="400" fill="${colors.textSubtle}" dx="8.8">//</tspan><tspan fill="${colors.accentGreen}" font-weight="600" dx="8.8">ME</tspan></text>
    ${fact(106, 126, 'FOCUS', 'Software &amp; AI Engineering', 'sans', colors.textPrimary, -0.7, -0.3, '14.5')}
    ${fact(158, 178, 'CAMPUS', 'Sài Gòn University', 'sans', colors.accentCyan, -0.5, -0.3, '14.5')}
    ${fact(218, 238, 'DAILY COMPOUND', '1.01³⁶⁵ ≈ 37.8x', 'mono', colors.accentGreen, -0.5, -0.8, '14.5')}
  </g>

  <!-- ============ COL3 — radar (axis x=${COL3_AXIS}) ============ -->
  <g>
    <g transform="translate(${COL3_AXIS}, ${RADAR_CY})">
      <polygon points="${ring(1)}" fill="none" stroke="${colors.gridLine}" stroke-width="1.2" />
      <polygon points="${ring(2 / 3)}" fill="none" stroke="${colors.gridLine}" stroke-width="0.9" stroke-dasharray="3 3" />
      <polygon points="${ring(1 / 3)}" fill="none" stroke="${colors.gridLine}" stroke-width="0.8" />
      ${axes}

      <!-- the real spider web: blooms dynamically from current attribute stats -->
      <g class="spider-bloom-group">
        <polygon points="${STATS_PTS}" fill="${colors.radarFill}" stroke="${colors.radarStroke}" stroke-width="2" stroke-linejoin="round" filter="url(#softGlow)" />
        ${statVerts.map(([x, y], i) => STATS[i] > 0.08 ? `<circle cx="${x}" cy="${y}" r="2.6" fill="${colors.accentCyan}" />` : '').filter(Boolean).join('\n        ')}
      </g>

      <circle cx="0" cy="0" r="3" fill="${colors.accentGreen}" class="pulse-dot" />

      ${labels}
    </g>
  </g>
</svg>`;
}
