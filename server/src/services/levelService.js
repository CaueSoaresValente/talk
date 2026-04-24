const { db } = require('../config/database');

const LEVELS = [
  { name: 'beginner', label: 'Iniciante', minScore: 0, maxScore: 199 },
  { name: 'basic', label: 'Básico', minScore: 200, maxScore: 499 },
  { name: 'intermediate', label: 'Intermediário', minScore: 500, maxScore: 999 },
  { name: 'advanced', label: 'Avançado', minScore: 1000, maxScore: 1999 },
  { name: 'fluent', label: 'Fluente', minScore: 2000, maxScore: Infinity }
];

function getLevelInfo(score) {
  return LEVELS.find(l => score >= l.minScore && score <= l.maxScore) || LEVELS[0];
}

function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex(l => l.name === currentLevel);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

function getAllLevels() {
  return LEVELS;
}

function calculateSessionScore(totalMessages, totalErrors, durationMinutes) {
  const messageScore = totalMessages * 5;
  const errorPenalty = totalErrors * 2;
  const timeBonus = Math.min(durationMinutes * 2, 30);
  return Math.max(0, messageScore - errorPenalty + timeBonus);
}

function checkLevelUp(userId) {
  const user = db.prepare('SELECT id, score, level FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const newLevelInfo = getLevelInfo(user.score);

  if (newLevelInfo.name !== user.level) {
    db.prepare('UPDATE users SET level = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(newLevelInfo.name, userId);
    return {
      previousLevel: user.level,
      newLevel: newLevelInfo.name,
      newLevelLabel: newLevelInfo.label
    };
  }

  return null;
}

function updateUserScore(userId, scoreToAdd) {
  db.prepare('UPDATE users SET score = score + ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(scoreToAdd, userId);

  return checkLevelUp(userId);
}

function updateDailyProgress(userId, minutes, errors, exercisesCompleted, scoreEarned) {
  const today = new Date().toISOString().split('T')[0];
  const { v4: uuidv4 } = require('uuid');

  const existing = db.prepare('SELECT id FROM user_progress WHERE user_id = ? AND date = ?').get(userId, today);

  if (existing) {
    db.prepare(`
      UPDATE user_progress SET
        practice_minutes = practice_minutes + ?,
        errors_count = errors_count + ?,
        exercises_completed = exercises_completed + ?,
        score_earned = score_earned + ?
      WHERE user_id = ? AND date = ?
    `).run(minutes, errors, exercisesCompleted, scoreEarned, userId, today);
  } else {
    db.prepare(`
      INSERT INTO user_progress (id, user_id, date, practice_minutes, errors_count, exercises_completed, score_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, today, minutes, errors, exercisesCompleted, scoreEarned);
  }
}

module.exports = {
  LEVELS,
  getLevelInfo,
  getNextLevel,
  getAllLevels,
  calculateSessionScore,
  checkLevelUp,
  updateUserScore,
  updateDailyProgress
};
