const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { updateUserScore, updateDailyProgress } = require('../services/levelService');

const router = express.Router();

// GET /api/exercises - Get exercises for user's level
router.get('/', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT level FROM users WHERE id = ?').get(req.user.id);
    const type = req.query.type;

    let query = 'SELECT id, type, level, question, options, explanation FROM exercises WHERE level = ?';
    const params = [user.level];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY RANDOM() LIMIT 10';

    const exercises = db.prepare(query).all(...params);

    // Parse options JSON
    const parsed = exercises.map(e => ({
      ...e,
      options: e.options ? JSON.parse(e.options) : null
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Exercises error:', error);
    res.status(500).json({ error: 'Erro ao buscar exercícios.' });
  }
});

// POST /api/exercises/submit - Submit exercise answer
router.post('/submit', authMiddleware, (req, res) => {
  try {
    const { exerciseId, answer } = req.body;

    if (!exerciseId || answer === undefined) {
      return res.status(400).json({ error: 'Exercício e resposta são obrigatórios.' });
    }

    const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: 'Exercício não encontrado.' });
    }

    const isCorrect = String(answer).toLowerCase().trim() === String(exercise.correct_answer).toLowerCase().trim();

    // Save result
    const resultId = uuidv4();
    db.prepare('INSERT INTO exercise_results (id, user_id, exercise_id, user_answer, is_correct) VALUES (?, ?, ?, ?, ?)')
      .run(resultId, req.user.id, exerciseId, String(answer), isCorrect ? 1 : 0);

    // Update score
    const scoreEarned = isCorrect ? 10 : 2; // Points for trying
    const levelUp = updateUserScore(req.user.id, scoreEarned);
    updateDailyProgress(req.user.id, 0, isCorrect ? 0 : 1, 1, scoreEarned);

    res.json({
      isCorrect,
      correctAnswer: exercise.correct_answer,
      explanation: exercise.explanation,
      scoreEarned,
      levelUp
    });
  } catch (error) {
    console.error('Exercise submit error:', error);
    res.status(500).json({ error: 'Erro ao submeter resposta.' });
  }
});

module.exports = router;
