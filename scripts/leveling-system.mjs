/**
 * RPG Leveling System for ManDuong
 * Formula: ExpRequired(L) = 100 + (L - 1) * 50
 * Level 1 -> 2: 100 EXP (1 full day of daily tasks!)
 * Level 2 -> 3: 150 EXP
 * Level 3 -> 4: 200 EXP
 * Level 4 -> 5: 250 EXP
 * etc.
 */

export function getExpForLevel(level) {
  return 100 + (level - 1) * 50;
}

export function calculatePlayerProgress(totalExp = 0) {
  let level = 1;
  let remainingExp = Math.max(0, totalExp);

  while (true) {
    const required = getExpForLevel(level);
    if (remainingExp >= required) {
      remainingExp -= required;
      level += 1;
    } else {
      break;
    }
  }

  const requiredForNext = getExpForLevel(level);
  const percentNumber = Math.round((remainingExp / requiredForNext) * 100);
  const levelStr = String(level).padStart(2, '0');
  const percentStr = `${percentNumber}%`;

  return {
    level: levelStr,
    levelNumber: level,
    currentExp: remainingExp,
    requiredExp: requiredForNext,
    expPercent: percentStr,
    percentNumber,
    totalExp
  };
}
