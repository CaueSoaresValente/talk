const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/level-test/submit - Submit level test answers
router.post('/submit', authMiddleware, (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Respostas são obrigatórias.' });
    }

    // Level test questions
    const questions = getLevelTestQuestions();
    let correctCount = 0;

    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correct) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Determine level
    let levelResult;
    if (score >= 80) levelResult = 'advanced';
    else if (score >= 50) levelResult = 'intermediate';
    else levelResult = 'beginner';

    // Save test result
    const testId = uuidv4();
    db.prepare('INSERT INTO level_tests (id, user_id, score, total_questions, level_result, answers) VALUES (?, ?, ?, ?, ?, ?)')
      .run(testId, req.user.id, score, totalQuestions, levelResult, JSON.stringify(answers));

    // Update user level
    db.prepare('UPDATE users SET level = ?, level_test_taken = 1, updated_at = datetime(\'now\') WHERE id = ?')
      .run(levelResult, req.user.id);

    const levelLabels = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado'
    };

    res.json({
      score,
      correctCount,
      totalQuestions,
      levelResult,
      levelLabel: levelLabels[levelResult],
      message: `Você acertou ${correctCount} de ${totalQuestions} questões. Seu nível é: ${levelLabels[levelResult]}!`
    });
  } catch (error) {
    console.error('Level test error:', error);
    res.status(500).json({ error: 'Erro ao processar teste de nível.' });
  }
});

// GET /api/level-test/questions - Get test questions
router.get('/questions', authMiddleware, (req, res) => {
  const questions = getLevelTestQuestions();
  // Remove correct answers from response
  const safeQuestions = questions.map(({ correct, ...q }) => q);
  res.json(safeQuestions);
});

function getLevelTestQuestions() {
  return [
    {
      id: 1,
      question: 'Choose the correct option: "She ___ to school every day."',
      options: ['go', 'goes', 'going', 'gone'],
      correct: 1
    },
    {
      id: 2,
      question: 'What is the past tense of "eat"?',
      options: ['eated', 'eaten', 'ate', 'eating'],
      correct: 2
    },
    {
      id: 3,
      question: 'Choose the correct sentence:',
      options: [
        'I have went to the store.',
        'I have gone to the store.',
        'I have go to the store.',
        'I have going to the store.'
      ],
      correct: 1
    },
    {
      id: 4,
      question: '"If I ___ rich, I would travel the world."',
      options: ['am', 'was', 'were', 'be'],
      correct: 2
    },
    {
      id: 5,
      question: 'Which word is a synonym for "happy"?',
      options: ['sad', 'angry', 'joyful', 'tired'],
      correct: 2
    },
    {
      id: 6,
      question: 'Complete: "By the time he arrived, we ___."',
      options: ['left', 'have left', 'had left', 'leaving'],
      correct: 2
    },
    {
      id: 7,
      question: 'Choose the correct relative pronoun: "The book ___ I read was amazing."',
      options: ['who', 'which', 'what', 'whom'],
      correct: 1
    },
    {
      id: 8,
      question: '"Despite ___ tired, she continued working."',
      options: ['be', 'being', 'to be', 'been'],
      correct: 1
    },
    {
      id: 9,
      question: 'What does "break a leg" mean?',
      options: [
        'To injure yourself',
        'To run fast',
        'Good luck',
        'To stop working'
      ],
      correct: 2
    },
    {
      id: 10,
      question: '"Had I known about the meeting, I ___ attended."',
      options: [
        'would have',
        'will have',
        'would',
        'had'
      ],
      correct: 0
    }
  ];
}

module.exports = router;
