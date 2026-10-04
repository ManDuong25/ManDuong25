/**
 * Quest Sync Engine & Level Progression Sync
 * Parses Issue checklist, computes EXP, updates SVGs & player-state.json
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

export function getTodayDateVN() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
}

export async function resetDailyQuests() {
  console.log('🌅 Performing midnight daily quest reset...');
  const rawState = await fs.readFile(STATE_FILE, 'utf8');
  const state = JSON.parse(rawState);
  const todayVN = getTodayDateVN();

  // 1. Roll yesterday's completed tasks into lifetime baseExp
  const completedCount = state.quests.filter(q => q.done).length;
  const yesterdayYield = state.quests.filter(q => q.done).reduce((sum, q) => sum + (q.expValue || 50), 0);
  const allCleared = completedCount === state.quests.length && state.quests.length > 0;

  state.player.baseExp = (state.player.baseExp || 0) + yesterdayYield;

  if (allCleared) {
    state.player.streak = (state.player.streak || 0) + 1;
  } else if (yesterdayYield === 0) {
    state.player.streak = 0;
  }

  // 2. Reset all quests to uncompleted
  for (const quest of state.quests) {
    quest.done = false;
  }

  state.player.totalExp = state.player.baseExp;
  const progress = calculatePlayerProgress(state.player.totalExp);
  state.player.level = progress.level;
  state.player.currentExp = progress.currentExp;
  state.player.requiredExp = progress.requiredExp;
  state.player.expPercent = progress.expPercent;
  state.player.lastResetDate = todayVN;
  state.player.lastUpdated = new Date().toISOString();

  // 3. Reset Issue #1 on GitHub if gh CLI is available
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

  // 4. Regenerate SVGs
  await regenerateAllSVGs(state);

  // 5. Save state
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  console.log('✅ Daily reset completed successfully!');
  return state;
}

export async function syncQuestsFromText(issueBody) {
  console.log('⚡ Running Daily Quest Sync Engine...');

  // 1. Read existing player state
  const rawState = await fs.readFile(STATE_FILE, 'utf8');
  const state = JSON.parse(rawState);
  const todayVN = getTodayDateVN();

  // If a new day started and no reset has been performed yet, roll over automatically
  if (state.player.lastResetDate && state.player.lastResetDate !== todayVN) {
    console.log(`🌅 New day detected (${state.player.lastResetDate} -> ${todayVN}). Archiving yesterday...`);
    const yesterdayYield = state.quests.filter(q => q.done).reduce((sum, q) => sum + (q.expValue || 50), 0);
    const allCleared = state.quests.length > 0 && state.quests.every(q => q.done);
    state.player.baseExp = (state.player.baseExp || 0) + yesterdayYield;
    if (allCleared) {
      state.player.streak = (state.player.streak || 0) + 1;
    } else if (yesterdayYield === 0) {
      state.player.streak = 0;
    }
    state.player.lastResetDate = todayVN;
  }

  // 2. Parse issue body for checked tasks
  // e.g. - [x] Running 5 km  OR  - [ ] Learning English for 4 hours
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

  // 3. Compute EXP & Level Progress
  const completedQuests = state.quests.filter(q => q.done);
  const dailyYield = completedQuests.reduce((sum, q) => sum + (q.expValue || 50), 0);

  const baseExp = state.player.baseExp || 0;
  state.player.totalExp = baseExp + dailyYield;
  const progress = calculatePlayerProgress(state.player.totalExp);

  state.player.level = progress.level;
  state.player.currentExp = progress.currentExp;
  state.player.requiredExp = progress.requiredExp;
  state.player.expPercent = progress.expPercent;
  state.player.lastUpdated = new Date().toISOString();
  if (!state.player.lastResetDate) {
    state.player.lastResetDate = todayVN;
  }

  console.log(`📊 Progress calculated: Level ${state.player.level} | EXP ${state.player.currentExp}/${state.player.requiredExp} (${state.player.expPercent}) | Cleared: ${completedQuests.length}/${state.quests.length}`);

  // 4. Regenerate SVGs
  await regenerateAllSVGs(state);

  // 5. Save updated state
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');

  console.log('✅ All assets updated & synced successfully!');
  return state;
}

async function regenerateAllSVGs(state) {
  // Regenerate Hero Banner SVGs
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

  // Regenerate Daily Quest HUD SVGs
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
    resetDailyQuests().catch(console.error);
  } else {
    let issueBody = process.env.ISSUE_BODY;
    if (!issueBody) {
      try {
        const out = execSync('gh issue view 1 --json body -q .body', { encoding: 'utf8' });
        issueBody = out;
      } catch {
        // Fallback default
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
