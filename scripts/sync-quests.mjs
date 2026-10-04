/**
 * Daily Quest Sync Engine & RPG Level Progression
 * Parses Issue checklist, computes EXP & Level, manages Streaks, handles Vietnam Timezone midnight resets.
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
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

/**
 * Returns current date in Vietnam (UTC+7) in YYYY-MM-DD format
 */
export function getTodayDateVN() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
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
 * Handles daily midnight rollover:
 * - Banks yesterday's earned EXP into lifetime baseExp
 * - Preserves streak ONLY if yesterday ALL tasks were cleared
 * - If yesterday was incomplete or day(s) were missed: MẤT STREAK (streak = 0)
 * - Resets quests to uncompleted (done: false)
 */
export function processDateRollover(state, todayVN, options = {}) {
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
  // If consecutive day (diffDays === 1 or forced) AND yesterday ALL cleared -> streak preserved!
  // Otherwise (incomplete tasks or missed days) -> MẤT STREAK!
  if ((diffDays === 1 || options.force) && allClearedYesterday) {
    console.log(`🔥 All tasks were cleared yesterday! Streak preserved at: ${state.player.streak}`);
  } else {
    console.log(`💔 Incomplete tasks yesterday or skipped days! Streak lost -> reset to 0.`);
    state.player.streak = 0;
  }

  // Reset all daily quests for the fresh day
  for (const q of state.quests) {
    q.done = false;
  }

  state.player.streakCountedForDate = null;
  state.player.lastActiveDate = todayVN;
  return true;
}

/**
 * Applies issue checklist state, calculates EXP & streak, updates level
 */
export function applyQuestsChecklist(state, issueBody, todayVN) {
  // 1. Parse checkboxes from issue body
  for (const quest of state.quests) {
    const escaped = quest.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^[\\t ]*-[\\t ]*\\[([xX ])\\][\\t ]+.*${escaped}`, 'im');
    const match = issueBody.match(regex);
    if (match) {
      quest.done = match[1].trim().toLowerCase() === 'x';
    } else {
      quest.done = false;
    }
  }

  // 2. Check today completion
  const completedToday = state.quests.filter(q => q.done);
  const allClearedToday = state.quests.length > 0 && completedToday.length === state.quests.length;

  // Streak handling:
  if (allClearedToday) {
    if (state.player.streakCountedForDate !== todayVN) {
      state.player.streak = (state.player.streak || 0) + 1;
      state.player.streakCountedForDate = todayVN;
      console.log(`🔥 All daily quests cleared! Streak increased to ${state.player.streak} DAYS!`);
    }
  } else {
    // If unticked after being counted today
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
  state.player.lastUpdated = new Date().toISOString();

  return { completedToday, allClearedToday, dailyYield };
}

/**
 * Resets GitHub Issue #1 to unchecked tasks
 */
export function resetGitHubIssue() {
  try {
    const issueBody = `### ⚔️ Daily Quest Log

- [ ] Running 5 km (+50 EXP)
- [ ] Learning English for 4 hours (+50 EXP)

---
> 💡 *Check a box when you complete a task. GitHub Actions will auto-sync your EXP and level progression in real-time!*
`;
    execSync(`gh issue edit 1 --body "${issueBody.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
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
  const todayVN = getTodayDateVN();

  // Perform date rollover
  processDateRollover(state, todayVN, { force: true });

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

  // Save updated state
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
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
  const todayVN = getTodayDateVN();

  // If a new day has arrived and reset hasn't executed yet, rollover first!
  const rolledOver = processDateRollover(state, todayVN);
  if (rolledOver) {
    resetGitHubIssue();
  }

  // Apply checklist changes
  const { completedToday, dailyYield } = applyQuestsChecklist(state, issueBody, todayVN);

  console.log(`📊 Progress calculated: Level ${state.player.level} | EXP ${state.player.currentExp}/${state.player.requiredExp} (${state.player.expPercent}) | Streak: ${state.player.streak} | Cleared: ${completedToday.length}/${state.quests.length}`);

  // Regenerate SVGs
  await regenerateAllSVGs(state);

  // Save state
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  console.log('✅ All assets updated & synced successfully!');
  return state;
}

async function regenerateAllSVGs(state) {
  const heroDark = generateBannerSVG('dark', {
    name: state.player.name,
    role: state.player.role,
    level: state.player.level,
    expPercent: state.player.expPercent
  });
  const heroLight = generateBannerSVG('light', {
    name: state.player.name,
    role: state.player.role,
    level: state.player.level,
    expPercent: state.player.expPercent
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
- [ ] Running 5 km (+50 EXP)
- [ ] Learning English for 4 hours (+50 EXP)
        `;
      }
    }
    syncQuestsFromText(issueBody).catch(console.error);
  }
}
