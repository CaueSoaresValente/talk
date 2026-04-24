const express = require('express');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { getLevelInfo, getNextLevel, getAllLevels } = require('../services/levelService');

const router = express.Router();

// GET /api/dashboard - Get dashboard data
router.get('/', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const levelInfo = getLevelInfo(user.score);
    const nextLevel = getNextLevel(user.level);

    // Total practice hours
    const practiceStats = db.prepare(`
      SELECT COALESCE(SUM(practice_minutes), 0) as totalMinutes,
             COALESCE(SUM(errors_count), 0) as totalErrors,
             COALESCE(SUM(exercises_completed), 0) as totalExercises,
             COALESCE(SUM(score_earned), 0) as totalScoreEarned
      FROM user_progress WHERE user_id = ?
    `).get(req.user.id);

    // Total conversations
    const convStats = db.prepare(`
      SELECT COUNT(*) as totalConversations,
             COALESCE(SUM(total_messages), 0) as totalMessages
      FROM conversations WHERE user_id = ?
    `).get(req.user.id);

    // Weekly goal: 5 sessions per week
    const weekStart = getWeekStart();
    const weekSessions = db.prepare(`
      SELECT COUNT(*) as count FROM conversations
      WHERE user_id = ? AND started_at >= ?
    `).get(req.user.id, weekStart);

    // Progress to next level
    let progressToNextLevel = 100;
    if (nextLevel) {
      const currentLevelMin = levelInfo.minScore;
      const nextLevelMin = nextLevel.minScore;
      const range = nextLevelMin - currentLevelMin;
      const current = user.score - currentLevelMin;
      progressToNextLevel = Math.min(100, Math.round((current / range) * 100));
    }

    res.json({
      user: {
        name: user.name,
        level: user.level,
        levelLabel: levelInfo.label,
        score: user.score,
        streakDays: user.streak_days
      },
      stats: {
        totalHours: Math.round((practiceStats.totalMinutes / 60) * 10) / 10,
        totalMinutes: practiceStats.totalMinutes,
        totalConversations: convStats.totalConversations,
        totalMessages: convStats.totalMessages,
        totalExercises: practiceStats.totalExercises,
        totalErrors: practiceStats.totalErrors
      },
      progression: {
        currentLevel: levelInfo,
        nextLevel,
        progressPercent: progressToNextLevel,
        allLevels: getAllLevels()
      },
      weeklyGoal: {
        target: 5,
        current: weekSessions.count,
        progressPercent: Math.min(100, Math.round((weekSessions.count / 5) * 100))
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard.' });
  }
});

// GET /api/dashboard/progress?period=7|30|90
router.get('/progress', authMiddleware, (req, res) => {
  try {
    const period = parseInt(req.query.period) || 7;
    const validPeriods = [7, 30, 90];
    const days = validPeriods.includes(period) ? period : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progress = db.prepare(`
      SELECT date, practice_minutes, errors_count, exercises_completed, score_earned
      FROM user_progress
      WHERE user_id = ? AND date >= ?
      ORDER BY date ASC
    `).all(req.user.id, startDate.toISOString().split('T')[0]);

    res.json({ period: days, data: progress });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Erro ao carregar progresso.' });
  }
});

function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

module.exports = router;
