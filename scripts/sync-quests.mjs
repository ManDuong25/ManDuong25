/**
 * Daily Quest Sync Engine & RPG Level Progression
 * Parses Issue checklist, computes EXP & Level, tracks timestamps & quest-log.json, manages Streaks, handles midnight resets.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { calculatePlayerProgress } from './leveling-system.mjs';
import { generateBannerSVG } from '../studio/banner-generator.mjs';
import { generateQuestTacticalSVG } from '../studio/quest-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const STATE_FILE = path.join(ROOT_DIR, 'data', 'player-state.json');
const LOG_FILE = path.join(ROOT_DIR, 'data', 'quest-log.json');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

/**
 * Returns current date in Vietnam (UTC+7) in YYYY-MM-DD format
 */
export function getTodayDateVN() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

/**
 * Returns current time in Vietnam (UTC+7) in HH:mm or HH:mm:ss format
 */
export function getNowTimeVN(includeSeconds = false) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: false
  }).format(new Date());
}

/**
 * Calculates calendar day difference between two YYYY-MM-DD strings in Vietnam timezone
 */
export function getDaysDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00+07:00');
  const d2 = new Date(dateStr2 + 'T00:00:00+07:00');
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Matches quest in issue checklist, supporting flexible spelling / Vietnamese aliases
 */
export function getQuestRegex(title) {
  if (title.toLowerCase().includes('running') || title.toLowerCase().includes('chạy bộ')) {
    return /^[ \t]*-[ \t]*\[([xX ])\][ \t]+.*(?:running|chạy bộ)[ \t]*3[ \t]*km/im;
  }
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[\\t ]*-[\\t ]*\\[([xX ])\\][\\t ]+.*${escaped}`, 'im');
}

/**
 * Loads or initializes the quest history log file
 */
export async function readQuestLog() {
  try {
    const raw = await fs.readFile(LOG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {
      meta: {
        player: 'DƯƠNG CÔNG MÃN',
        timezone: 'Asia/Ho_Chi_Minh',
        totalCompletedLifetime: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      dailyLogs: {},
      history: []
    };
  }
}

/**
 * Saves quest log file
 */
export async function saveQuestLog(logData) {
  await fs.writeFile(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');
}

/**
 * Handles daily midnight rollover:
 * - Banks yesterday's earned EXP into lifetime baseExp
 * - Preserves streak ONLY if yesterday ALL tasks were cleared
 * - If yesterday was incomplete or day(s) were missed: MẤT STREAK (streak = 0)
 * - Resets quests to uncompleted (done: false, completedAt: null, completedTime: null)
 * - Logs rollover event to quest-log.json
 */
export function processDateRollover(state, todayVN, questLog, options = {}) {
  const lastDate = state.player.lastActiveDate;
  if (!lastDate) {
    state.player.lastActiveDate = todayVN;
    return false;
  }

  const diffDays = getDaysDiff(lastDate, todayVN);
  if (diffDays <= 0 && !options.force) {
    return false;
  }

  console.log(`🌅 Rollover detected: ${lastDate} -> ${todayVN} (diff: ${diffDays} day(s))`);

  // Check if yesterday's tasks were all completed
  const completedYesterday = state.quests.filter(q => q.done);
  const allClearedYesterday = state.quests.length > 0 && completedYesterday.length === state.quests.length;
  const yesterdayYield = completedYesterday.reduce((sum, q) => sum + (q.expValue || 50), 0);

  // Bank yesterday's EXP into lifetime baseExp
  state.player.baseExp = (state.player.baseExp || 0) + yesterdayYield;

  // Streak Verification:
  if ((diffDays === 1 || options.force) && allClearedYesterday) {
    console.log(`🔥 All tasks were cleared yesterday! Streak preserved at: ${state.player.streak}`);
  } else {
    console.log(`💔 Incomplete tasks yesterday or skipped days! Streak lost -> reset to 0.`);
    state.player.streak = 0;
  }

  // Evaluate Warrior Attributes (Option 1: Lifetime Win-Rate C / (C + M))
  const allAttributes = ['TECH', 'INTELLECT', 'VITALITY', 'GRIT', 'OUTPUT', 'SYSTEMS'];
  if (!state.attributes) {
    state.attributes = {
      TECH: { completed: 0, missed: 0, score: 0.0 },
      INTELLECT: { completed: 0, missed: 0, score: 0.0 },
      VITALITY: { completed: 0, missed: 0, score: 0.0 },
      GRIT: { completed: 0, missed: 0, score: 0.0 },
      OUTPUT: { completed: 0, missed: 0, score: 0.0 },
      SYSTEMS: { completed: 0, missed: 0, score: 0.0 }
    };
  }

  for (const attr of allAttributes) {
    if (!state.attributes[attr]) {
      state.attributes[attr] = { completed: 0, missed: 0, score: 0.0 };
    }
    const relevantQuests = state.quests.filter(q => (q.tags || []).includes(attr));
    if (relevantQuests.length > 0) {
      const skippedDays = Math.max(0, diffDays - 1);
      if (skippedDays > 0) {
        state.attributes[attr].missed += skippedDays;
      }

      const allDone = relevantQuests.every(q => q.done);
      if (allDone) {
        state.attributes[attr].completed += 1;
        console.log(`🎯 [${attr}] completed yesterday! (C: ${state.attributes[attr].completed}, M: ${state.attributes[attr].missed})`);
      } else {
        state.attributes[attr].missed += 1;
        console.log(`⚠️ [${attr}] missed yesterday! (C: ${state.attributes[attr].completed}, M: ${state.attributes[attr].missed})`);
      }

      const total = state.attributes[attr].completed + state.attributes[attr].missed;
      state.attributes[attr].score = total > 0 ? Number((state.attributes[attr].completed / total).toFixed(4)) : 0.0;
    }
  }

  // Log rollover event
  const nowISO = new Date().toISOString();
  const timeVN = getNowTimeVN(true);
  questLog.history.push({
    id: `evt_${Date.now()}_rollover`,
    timestamp: nowISO,
    timeVN,
    dateVN: todayVN,
    action: 'MIDNIGHT_RESET',
    fromDay: lastDate,
    toDay: todayVN,
    diffDays,
    yesterdayYield,
    allClearedYesterday,
    streakResult: state.player.streak,
    totalExpAfterRoll: state.player.baseExp,
    attributesSnapshot: JSON.parse(JSON.stringify(state.attributes))
  });
  questLog.meta.lastUpdated = nowISO;

  // Reset all daily quests for the fresh day
  for (const q of state.quests) {
    q.done = false;
    q.completedAt = null;
    q.completedTime = null;
  }

  state.player.streakCountedForDate = null;
  state.player.lastActiveDate = todayVN;
  return true;
}

/**
 * Applies issue checklist state, records timestamps, calculates EXP & streak, updates quest-log.json
 */
export function applyQuestsChecklist(state, issueBody, todayVN, questLog) {
  const nowISO = new Date().toISOString();
  const timeShortVN = getNowTimeVN(false); // e.g. "06:30"
  const timeFullVN = getNowTimeVN(true);   // e.g. "06:30:15"

  // 1. Parse checkboxes and stamp completion time
  for (const quest of state.quests) {
    const regex = getQuestRegex(quest.title);
    const match = issueBody.match(regex);
    const isNowDone = match ? match[1].trim().toLowerCase() === 'x' : false;
    const wasDone = !!quest.done;

    if (!wasDone && isNowDone) {
      // Newly checked -> record completion time
      quest.done = true;
      quest.completedAt = nowISO;
      quest.completedTime = timeShortVN;

      questLog.meta.totalCompletedLifetime = (questLog.meta.totalCompletedLifetime || 0) + 1;
      questLog.meta.lastUpdated = nowISO;
      questLog.history.push({
        id: `evt_${Date.now()}_${quest.id}`,
        timestamp: nowISO,
        timeVN: timeFullVN,
        dateVN: todayVN,
        action: 'QUEST_COMPLETED',
        questId: quest.id,
        questTitle: quest.title,
        expEarned: quest.expValue || 50
      });
      console.log(`⏱️ Quest [${quest.title}] completed at ${timeShortVN} (${timeFullVN} VN)`);
    } else if (wasDone && !isNowDone) {
      // Unticked -> revert timestamp
      quest.done = false;
      quest.completedAt = null;
      quest.completedTime = null;

      questLog.meta.totalCompletedLifetime = Math.max(0, (questLog.meta.totalCompletedLifetime || 1) - 1);
      questLog.meta.lastUpdated = nowISO;
      questLog.history.push({
        id: `evt_${Date.now()}_${quest.id}`,
        timestamp: nowISO,
        timeVN: timeFullVN,
        dateVN: todayVN,
        action: 'QUEST_UNCHECKED',
        questId: quest.id,
        questTitle: quest.title,
        expDeducted: quest.expValue || 50
      });
      console.log(`↩️ Quest [${quest.title}] unticked at ${timeShortVN}`);
    } else if (wasDone && isNowDone) {
      // Maintained checked -> keep existing completedAt / completedTime!
      quest.done = true;
    } else {
      quest.done = false;
    }
  }

  // 2. Check today completion & streak
  const completedToday = state.quests.filter(q => q.done);
  const allClearedToday = state.quests.length > 0 && completedToday.length === state.quests.length;

  if (allClearedToday) {
    if (state.player.streakCountedForDate !== todayVN) {
      state.player.streak = (state.player.streak || 0) + 1;
      state.player.streakCountedForDate = todayVN;
      console.log(`🔥 All daily quests cleared! Streak increased to ${state.player.streak} DAYS!`);
    }
  } else {
    if (state.player.streakCountedForDate === todayVN) {
      state.player.streak = Math.max(0, (state.player.streak || 1) - 1);
      state.player.streakCountedForDate = null;
      console.log(`⚠️ Task unticked. Streak reverted to ${state.player.streak} DAYS.`);
    }
  }

  // 3. Compute EXP & Level
  const dailyYield = completedToday.reduce((sum, q) => sum + (q.expValue || 50), 0);
  state.player.totalExp = (state.player.baseExp || 0) + dailyYield;

  const progress = calculatePlayerProgress(state.player.totalExp);
  state.player.level = progress.level;
  state.player.currentExp = progress.currentExp;
  state.player.requiredExp = progress.requiredExp;
  state.player.expPercent = progress.expPercent;
  state.player.lastUpdated = nowISO;

  // 4. Update daily snapshot in questLog
  questLog.dailyLogs[todayVN] = {
    date: todayVN,
    quests: state.quests.map(q => ({
      id: q.id,
      title: q.title,
      done: q.done,
      completedAt: q.completedAt || null,
      completedTime: q.completedTime || null,
      expValue: q.expValue || 50
    })),
    clearedCount: completedToday.length,
    totalQuests: state.quests.length,
    allCleared: allClearedToday,
    dailyYield,
    streak: state.player.streak,
    level: state.player.level,
    totalExp: state.player.totalExp,
    lastUpdated: nowISO
  };

  return { completedToday, allClearedToday, dailyYield };
}

/**
 * Resets GitHub Issue #1 to unchecked tasks
 */
export function resetGitHubIssue() {
  try {
    const repo = process.env.GITHUB_REPOSITORY || 'ManDuong25/ManDuong25';
    const issueBody = `### ⚔️ Daily Quest Log

- [ ] Running 3 km (+50 EXP) [#VITALITY, #GRIT]
- [ ] Learning English for 4 hours (+50 EXP) [#INTELLECT, #GRIT]

---
> 💡 *Check a box when you complete a task. GitHub Actions will auto-sync your EXP, level progression, and dynamic radar telemetry in real-time!*

---
### 🧭 Thuộc tính Chiến Binh (Warrior Attributes)
• **VITALITY**: Thể chất, chạy bộ, năng lượng sống.  
• **INTELLECT**: Học tiếng Anh (4h), đọc tài liệu chuyên sâu, nghiên cứu.  
• **GRIT**: Duy trì chuỗi Streak, sự bền bỉ, ngồi học/làm việc sâu không xao nhãng.  
• **TECH**: Kỹ năng code, thuật toán, công nghệ AI.  
• **SYSTEMS**: Tư duy hệ thống, tự động hóa (như workflow GitHub Actions bạn đang dùng).  
• **OUTPUT**: Dự án hoàn thành, tính năng bàn giao, đóng góp thực tế.
`;
    execSync(`gh issue edit 1 --repo ${repo} --body-file -`, {
      input: issueBody,
      stdio: ['pipe', 'inherit', 'inherit'],
      env: process.env
    });
    console.log('✅ Issue #1 reset successfully on GitHub.');
  } catch (err) {
    console.warn('⚠️ Could not reset GitHub Issue #1 via gh CLI:', err.message);
  }
}

/**
 * Midnight reset handler (called by cron at 00:00 VN / 17:00 UTC)
 */
export async function resetDailyQuests(force = false) {
  console.log('🌅 Running Midnight Daily Quest Reset (Vietnam Time)...');
  const rawState = await fs.readFile(STATE_FILE, 'utf8');
  const state = JSON.parse(rawState);
  const questLog = await readQuestLog();
  const todayVN = getTodayDateVN();

  // Perform date rollover
  processDateRollover(state, todayVN, questLog, { force: true });

  // Update totalExp & level with new baseExp
  state.player.totalExp = state.player.baseExp || 0;
  const progress = calculatePlayerProgress(state.player.totalExp);
  state.player.level = progress.level;
  state.player.currentExp = progress.currentExp;
  state.player.requiredExp = progress.requiredExp;
  state.player.expPercent = progress.expPercent;
  state.player.lastUpdated = new Date().toISOString();

  // Reset Issue #1 on GitHub
  resetGitHubIssue();

  // Regenerate all SVGs
  await regenerateAllSVGs(state);

  // Save updated state and log
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  await saveQuestLog(questLog);

  console.log(`✅ Midnight reset finished! Streak: ${state.player.streak} | Base EXP: ${state.player.baseExp} | Level: ${state.player.level}`);
  return state;
}

/**
 * Main sync function when Issue #1 is edited
 */
export async function syncQuestsFromText(issueBody) {
  console.log('⚡ Running Daily Quest Sync Engine...');

  const rawState = await fs.readFile(STATE_FILE, 'utf8');
  const state = JSON.parse(rawState);
  const questLog = await readQuestLog();
  const todayVN = getTodayDateVN();

  // If a new day has arrived and reset hasn't executed yet, rollover first!
  const rolledOver = processDateRollover(state, todayVN, questLog);
  if (rolledOver) {
    resetGitHubIssue();
  }

  // Apply checklist changes & track timestamps
  const { completedToday, dailyYield } = applyQuestsChecklist(state, issueBody, todayVN, questLog);

  console.log(`📊 Progress calculated: Level ${state.player.level} | EXP ${state.player.currentExp}/${state.player.requiredExp} (${state.player.expPercent}) | Streak: ${state.player.streak} | Cleared: ${completedToday.length}/${state.quests.length}`);

  // Regenerate SVGs
  await regenerateAllSVGs(state);

  // Save state and quest-log
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  await saveQuestLog(questLog);

  console.log('✅ All assets & quest-log.json updated successfully!');
  return state;
}

export async function updateReadmeCacheBuster(customRef) {
  const readmePath = path.join(ROOT_DIR, 'README.md');
  try {
    let content = await fs.readFile(readmePath, 'utf8');
    let ref = customRef;
    if (!ref) {
      try {
        ref = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      } catch {
        ref = Date.now().toString();
      }
    }
    content = content.replace(/(https:\/\/raw\.githubusercontent\.com\/ManDuong25\/ManDuong25\/)[a-f0-9]+(\/assets\/)/g, `$1${ref}$2`);
    await fs.writeFile(readmePath, content, 'utf8');
    console.log(`✨ Updated README.md ref: ${ref}`);
  } catch (err) {
    console.warn('⚠️ Could not update README ref:', err.message);
  }
}

async function regenerateAllSVGs(state) {
  const heroDark = generateBannerSVG('dark', {
    name: state.player.name,
    role: state.player.role,
    level: state.player.level,
    currentExp: state.player.currentExp,
    requiredExp: state.player.requiredExp,
    expPercent: state.player.expPercent,
    attributes: state.attributes
  });
  const heroLight = generateBannerSVG('light', {
    name: state.player.name,
    role: state.player.role,
    level: state.player.level,
    currentExp: state.player.currentExp,
    requiredExp: state.player.requiredExp,
    expPercent: state.player.expPercent,
    attributes: state.attributes
  });

  await fs.writeFile(path.join(ASSETS_DIR, 'hero-dark.svg'), heroDark, 'utf8');
  await fs.writeFile(path.join(ASSETS_DIR, 'hero-light.svg'), heroLight, 'utf8');

  const questDark = generateQuestTacticalSVG('dark', {
    quests: state.quests,
    streak: state.player.streak
  });
  const questLight = generateQuestTacticalSVG('light', {
    quests: state.quests,
    streak: state.player.streak
  });

  await fs.writeFile(path.join(ASSETS_DIR, 'quests-dark.svg'), questDark, 'utf8');
  await fs.writeFile(path.join(ASSETS_DIR, 'quests-light.svg'), questLight, 'utf8');

  await updateReadmeCacheBuster();
}

// Allow standalone run from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isReset = process.argv.includes('--reset');
  if (isReset) {
    resetDailyQuests(true).catch(console.error);
  } else {
    let issueBody = process.env.ISSUE_BODY;
    if (!issueBody) {
      try {
        const out = execSync('gh issue view 1 --json body -q .body', { encoding: 'utf8' });
        issueBody = out;
      } catch {
        issueBody = `
### ⚔️ Daily Quest Log
- [ ] Running 3 km (+50 EXP)
- [ ] Learning English for 4 hours (+50 EXP)
        `;
      }
    }
    syncQuestsFromText(issueBody).catch(console.error);
  }
}
