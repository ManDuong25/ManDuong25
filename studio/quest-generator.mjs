/**
 * Daily Quest HUD Generator — Game-grade UI Systems
 * Concept 1: Bento Tactical Mission Grid (Cyberpunk / Solo Leveling)
 * Concept 2: Split Telemetry HUD (Circular Gauge Core + Slotted Strips)
 */

const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function generateQuestBentoSVG(theme = 'dark', custom = {}) {
  const W = 900, H = 290;
  const isDark = theme === 'dark';
  const colors = isDark ? {
    bgStart: '#0d1117', bgMid: '#121926', bgEnd: '#1b2230',
    border: '#30363d',
    tileBg: 'rgba(255, 255, 255, 0.02)',
    tileBorder: '#21262d',
    tileBorderActive: 'rgba(57, 197, 207, 0.40)',
    textPrimary: '#e6edf3', textMuted: '#8b949e', textSubtle: '#6e7681',
    accentCyan: '#39c5cf', accentPurple: '#a371f7', accentGreen: '#3fb950', accentAmber: '#d29922',
    glowOpacity: 0.18,
    stampBg: 'rgba(63, 185, 80, 0.12)', stampBorder: '#3fb950',
    pendingBg: 'rgba(255, 255, 255, 0.04)', pendingBorder: '#30363d'
  } : {
    bgStart: '#ffffff', bgMid: '#f3f6fa', bgEnd: '#e9eff7',
    border: '#d1d9e0',
    tileBg: '#ffffff',
    tileBorder: '#e1e4e8',
    tileBorderActive: 'rgba(8, 96, 202, 0.35)',
    textPrimary: '#1f2328', textMuted: '#59636e', textSubtle: '#656d76',
    accentCyan: '#0860ca', accentPurple: '#7642d8', accentGreen: '#17692e', accentAmber: '#9a6700',
    glowOpacity: 0.12,
    stampBg: 'rgba(23, 105, 46, 0.10)', stampBorder: '#17692e',
    pendingBg: 'rgba(0, 0, 0, 0.03)', pendingBorder: '#d1d9e0'
  };

  const quests = custom.quests || [
    {
      id: '01', domain: 'CODE', rank: 'TIER-A', rankColor: colors.accentAmber,
      domainColor: colors.accentCyan, title: 'LeetCode Daily Challenge',
      desc: 'Solve 1 Medium+ algorithm problem (Graph / DP)',
      exp: '+25 EXP', done: true
    },
    {
      id: '02', domain: 'AI/ML', rank: 'TIER-S', rankColor: colors.accentPurple,
      domainColor: colors.accentPurple, title: 'Multi-Agent Research Breakdown',
      desc: 'Deep dive 1 arXiv architecture paper & annotate key ideas',
      exp: '+35 EXP', done: true
    },
    {
      id: '03', domain: 'SYS', rank: 'TIER-B', rankColor: colors.accentCyan,
      domainColor: colors.accentGreen, title: 'Linux Profiling & Tracing',
      desc: 'Trace syscalls, latency & memory footprint of microservices',
      exp: '+20 EXP', done: false
    },
    {
      id: '04', domain: 'GRIT', rank: 'TIER-B', rankColor: colors.accentCyan,
      domainColor: colors.accentAmber, title: 'Physical Conditioning',
      desc: '45 mins gym session / resistance training + core work',
      exp: '+20 EXP', done: false
    }
  ];

  const M = 40;
  const gridW = W - 2 * M; // 820
  const tileW = 398;
  const tileH = 88;
  const gapX = 24;
  const gapY = 16;
  const startY = 70;

  const doneCount = quests.filter(q => q.done).length;
  const percent = Math.round((doneCount / quests.length) * 100);

  const cardsSvg = quests.map((q, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (tileW + gapX);
    const y = startY + row * (tileH + gapY);

    const isDone = q.done;
    const borderCol = isDone ? colors.tileBorderActive : colors.tileBorder;
    const statusTextCol = isDone ? colors.accentGreen : colors.textSubtle;
    const statusText = isDone ? '✓ CLEARED' : 'IN PROGRESS';

    return `
      <!-- Quest Card ${q.id} -->
      <g transform="translate(${x}, ${y})">
        <rect x="0" y="0" width="${tileW}" height="${tileH}" rx="8" fill="${colors.tileBg}" stroke="${borderCol}" stroke-width="1" />
        ${isDone ? `<line x1="0" y1="0" x2="0" y2="${tileH}" stroke="${colors.accentGreen}" stroke-width="3.5" stroke-linecap="round" />` : ''}

        <!-- Top Header inside card -->
        <g transform="translate(14, 18)">
          <rect x="0" y="-11" width="48" height="16" rx="4" fill="${q.domainColor}" fill-opacity="0.15" stroke="${q.domainColor}" stroke-width="0.8" />
          <text x="24" y="1" class="mono" font-size="9" font-weight="800" text-anchor="middle" fill="${q.domainColor}">${q.domain}</text>
          <text x="56" y="0" class="mono" font-size="9.5" font-weight="700" fill="${q.rankColor}">${q.rank}</text>
          <text x="${tileW - 28}" y="0" text-anchor="end" class="mono" font-size="11" font-weight="700" fill="${isDone ? colors.accentGreen : colors.accentCyan}">${q.exp}</text>
        </g>

        <!-- Mission Title -->
        <text x="14" y="42" class="sans" font-size="13" font-weight="700" fill="${colors.textPrimary}">${q.title}</text>

        <!-- Subtitle / Requirement -->
        <text x="14" y="60" class="sans" font-size="11" font-weight="500" fill="${colors.textMuted}">${q.desc}</text>

        <!-- Status Chip on Bottom Right -->
        <g transform="translate(${tileW - 14}, 62)">
          <text x="0" y="0" text-anchor="end" class="mono" font-size="9.5" font-weight="800" fill="${statusTextCol}">${statusText}</text>
        </g>
      </g>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Daily Operations // Active Protocols">
  <defs>
    <linearGradient id="bgG_bento" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgStart}" /><stop offset="50%" stop-color="${colors.bgMid}" /><stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>
    <linearGradient id="barG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colors.accentCyan}" /><stop offset="100%" stop-color="${colors.accentGreen}" />
    </linearGradient>
  </defs>
  <style>
    .mono { font-family: ${MONO}; } .sans { font-family: ${SANS}; }
    @keyframes pulseSoft { 0%, 100% { opacity: 0.95; } 50% { opacity: 0.45; } }
    .pulse-dot { animation: pulseSoft 2s ease-in-out infinite; }
  </style>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG_bento)" stroke="${colors.border}" stroke-width="1" />

  <!-- Master Header -->
  <g transform="translate(${M}, 36)">
    <circle cx="4" cy="-3.5" r="3.5" fill="${colors.accentGreen}" class="pulse-dot" />
    <text x="16" y="0" class="mono" font-size="11.5" font-weight="700" fill="${colors.textPrimary}">DAILY OPERATIONS<tspan font-weight="400" fill="${colors.textSubtle}" dx="8">//</tspan><tspan fill="${colors.accentCyan}" dx="8">ACTIVE PROTOCOLS</tspan></text>
    <text x="${gridW}" y="0" text-anchor="end" class="mono" font-size="11" font-weight="700" fill="${colors.textMuted}">STREAK: <tspan fill="${colors.accentAmber}">7 DAYS 🔥</tspan><tspan fill="${colors.textSubtle}" dx="12">•</tspan><tspan fill="${colors.accentGreen}" dx="12">${doneCount}/${quests.length} CLEARED (${percent}%)</tspan></text>
  </g>

  <!-- Progress bar -->
  <g transform="translate(${M}, 47)">
    <rect x="0" y="0" width="${gridW}" height="3.5" rx="1.75" fill="${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}" />
    <rect x="0" y="0" width="${gridW * (percent / 100)}" height="3.5" rx="1.75" fill="url(#barG)" />
  </g>

  <!-- 2x2 Bento Cards -->
  ${cardsSvg}

  <!-- Footer Actions -->
  <g transform="translate(${M}, ${H - 18})">
    <text x="0" y="0" class="mono" font-size="10" font-weight="500" fill="${colors.textSubtle}">SYNC ENGINE: TICK QUEST IN ISSUE #1 TO AUTO-SYNC EXP ON YOUR PROFILE BANNER</text>
    <text x="${gridW}" y="0" text-anchor="end" class="mono" font-size="10.5" font-weight="700" fill="${colors.accentCyan}">OPEN MISSION LOG // ISSUE #1 ⚡</text>
  </g>
</svg>`;
}

export function generateQuestSplitSVG(theme = 'dark', custom = {}) {
  const W = 900, H = 280;
  const isDark = theme === 'dark';
  const colors = isDark ? {
    bgStart: '#0d1117', bgMid: '#121926', bgEnd: '#1b2230',
    border: '#30363d',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    cardBorder: '#21262d',
    cardBorderActive: 'rgba(57, 197, 207, 0.35)',
    textPrimary: '#e6edf3', textMuted: '#8b949e', textSubtle: '#6e7681',
    accentCyan: '#39c5cf', accentPurple: '#a371f7', accentGreen: '#3fb950', accentAmber: '#d29922'
  } : {
    bgStart: '#ffffff', bgMid: '#f3f6fa', bgEnd: '#e9eff7',
    border: '#d1d9e0',
    cardBg: '#ffffff',
    cardBorder: '#e1e4e8',
    cardBorderActive: 'rgba(8, 96, 202, 0.35)',
    textPrimary: '#1f2328', textMuted: '#59636e', textSubtle: '#656d76',
    accentCyan: '#0860ca', accentPurple: '#7642d8', accentGreen: '#17692e', accentAmber: '#9a6700'
  };

  const quests = custom.quests || [
    { tag: 'CODE', color: colors.accentCyan, title: 'LeetCode Daily Challenge (Medium+)', exp: '+25 EXP', done: true },
    { tag: 'AI/ML', color: colors.accentPurple, title: 'Read 1 arXiv paper on Agentic Coding', exp: '+30 EXP', done: true },
    { tag: 'SYS', color: colors.accentGreen, title: 'Linux Kernel / Tracing profiling experiment', exp: '+25 EXP', done: false },
    { tag: 'GRIT', color: colors.accentAmber, title: 'Physical Conditioning (45 mins Gym / Cardio)', exp: '+20 EXP', done: false }
  ];

  const M = 48;
  const leftW = 200;
  const rightX = M + leftW + 36;
  const rightW = W - rightX - M; // 568

  const doneCount = quests.filter(q => q.done).length;
  const percent = Math.round((doneCount / quests.length) * 100);
  const circ = 2 * Math.PI * 52; // ~326.72
  const offset = circ * (1 - percent / 100);

  const stripsSvg = quests.map((q, i) => {
    const y = 58 + i * 46;
    const border = q.done ? colors.cardBorderActive : colors.cardBorder;
    return `
      <g transform="translate(${rightX}, ${y})">
        <rect x="0" y="0" width="${rightW}" height="38" rx="6" fill="${colors.cardBg}" stroke="${border}" stroke-width="1" />
        ${q.done ? `<line x1="0" y1="0" x2="0" y2="38" stroke="${colors.accentGreen}" stroke-width="4" />` : ''}

        <!-- Status Icon -->
        <g transform="translate(14, 19)">
          <circle cx="0" cy="0" r="6" fill="${q.done ? colors.accentGreen : 'transparent'}" stroke="${q.done ? colors.accentGreen : colors.textSubtle}" stroke-width="1.5" />
          ${q.done ? `<path d="M-2.5 0 L-0.5 2 L3 -2" fill="none" stroke="${isDark ? '#0d1117' : '#fff'}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        </g>

        <!-- Tag -->
        <g transform="translate(30, 11)">
          <rect x="0" y="0" width="44" height="16" rx="3" fill="${q.color}" fill-opacity="0.15" stroke="${q.color}" stroke-width="0.8" />
          <text x="22" y="11.5" class="mono" font-size="9" font-weight="800" text-anchor="middle" fill="${q.color}">${q.tag}</text>
        </g>

        <!-- Title -->
        <text x="86" y="23" class="sans" font-size="12.5" font-weight="600" fill="${q.done ? colors.textMuted : colors.textPrimary}" ${q.done ? 'style="opacity: 0.8;"' : ''}>${q.title}</text>

        <!-- EXP -->
        <text x="${rightW - 14}" y="23" text-anchor="end" class="mono" font-size="11" font-weight="700" fill="${q.done ? colors.accentGreen : colors.textSubtle}">${q.done ? '✓ CLEARED' : q.exp}</text>
      </g>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Daily Protocol // Objective Tracker">
  <defs>
    <linearGradient id="bgG_split" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bgStart}" /><stop offset="50%" stop-color="${colors.bgMid}" /><stop offset="100%" stop-color="${colors.bgEnd}" />
    </linearGradient>
  </defs>
  <style>
    .mono { font-family: ${MONO}; } .sans { font-family: ${SANS}; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
    .pulse-dot { animation: pulse 2s ease-in-out infinite; }
  </style>

  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="14" fill="url(#bgG_split)" stroke="${colors.border}" stroke-width="1" />

  <!-- Left Column: Command & Telemetry Core -->
  <g transform="translate(${M}, 0)">
    <text x="0" y="42" class="mono" font-size="11" font-weight="700" fill="${colors.textMuted}">DAILY PROTOCOL<tspan fill="${colors.accentCyan}" dx="8">// ACTIVE</tspan></text>

    <!-- Circular Progress Arc Meter -->
    <g transform="translate(90, 125)">
      <circle cx="0" cy="0" r="52" fill="none" stroke="${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}" stroke-width="6" />
      <circle cx="0" cy="0" r="52" fill="none" stroke="${colors.accentCyan}" stroke-width="6" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" stroke-linecap="round" transform="rotate(-90)" />
      <text x="0" y="-4" text-anchor="middle" class="mono" font-size="22" font-weight="800" fill="${colors.textPrimary}">${percent}%</text>
      <text x="0" y="14" text-anchor="middle" class="mono" font-size="9" font-weight="700" fill="${colors.accentGreen}">${doneCount}/${quests.length} DONE</text>
    </g>

    <!-- Streak badge below circular meter -->
    <g transform="translate(0, 215)">
      <text x="90" y="0" text-anchor="middle" class="mono" font-size="11" font-weight="700" fill="${colors.textPrimary}">STREAK: <tspan fill="${colors.accentAmber}">7 DAYS 🔥</tspan></text>
      <text x="90" y="18" text-anchor="middle" class="mono" font-size="9.5" font-weight="600" fill="${colors.accentGreen}">+55 / 100 EXP EARNED</text>
    </g>
  </g>

  <!-- Vertical Divider Line -->
  <line x1="${rightX - 18}" y1="36" x2="${rightX - 18}" y2="244" stroke="${colors.border}" stroke-dasharray="3 3" stroke-width="1" opacity="0.6" />

  <!-- Right Header -->
  <g transform="translate(${rightX}, 42)">
    <circle cx="3.5" cy="-3.5" r="3.5" fill="${colors.accentGreen}" class="pulse-dot" />
    <text x="14" y="0" class="mono" font-size="11" font-weight="700" fill="${colors.textMuted}">ACTIVE OBJECTIVES<tspan font-weight="400" fill="${colors.textSubtle}" dx="8">//</tspan><tspan fill="${colors.accentGreen}" dx="8">SYS.TRACKER</tspan></text>
    <text x="${rightW}" y="0" text-anchor="end" class="mono" font-size="10" font-weight="700" fill="${colors.accentCyan}">OPEN LOG // #1 ⚡</text>
  </g>

  <!-- Right Strips -->
  ${stripsSvg}

  <!-- Footer Tip -->
  <g transform="translate(${rightX}, 252)">
    <text x="0" y="0" class="mono" font-size="9.5" font-weight="500" fill="${colors.textSubtle}">SYNC: Check task on Issue #1 $\rightarrow$ Auto-advances Banner Level &amp; EXP in 10s</text>
  </g>
</svg>`;
}
