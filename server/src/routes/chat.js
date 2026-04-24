const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { generateConversationStart, generateResponse, analyzeGrammar } = require('../services/aiService');
const { generateSessionFeedback } = require('../services/feedbackService');
const { calculateSessionScore, updateUserScore, updateDailyProgress } = require('../services/levelService');

const router = express.Router();

// POST /api/chat/start - Start a new conversation
router.post('/start', authMiddleware, (req, res) => {
  try {
    const conversationId = uuidv4();
    const user = db.prepare('SELECT level FROM users WHERE id = ?').get(req.user.id);

    db.prepare('INSERT INTO conversations (id, user_id) VALUES (?, ?)')
      .run(conversationId, req.user.id);

    // Generate greeting message from AI
    const greeting = generateConversationStart(user.level);
    const messageId = uuidv4();

    db.prepare('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)')
      .run(messageId, conversationId, 'assistant', greeting);

    db.prepare('UPDATE conversations SET total_messages = 1 WHERE id = ?')
      .run(conversationId);

    res.json({
      conversationId,
      message: {
        id: messageId,
        role: 'assistant',
        content: greeting,
        corrections: null,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'Erro ao iniciar conversa.' });
  }
});

// POST /api/chat/message - Send a message
router.post('/message', authMiddleware, (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversa e mensagem são obrigatórios.' });
    }

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?')
      .get(conversationId, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    const user = db.prepare('SELECT level FROM users WHERE id = ?').get(req.user.id);

    // Analyze grammar
    const corrections = analyzeGrammar(content);

    // Save user message
    const userMsgId = uuidv4();
    db.prepare('INSERT INTO messages (id, conversation_id, role, content, corrections) VALUES (?, ?, ?, ?, ?)')
      .run(userMsgId, conversationId, 'user', content, JSON.stringify(corrections));

    // Get conversation history for context
    const history = db.prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 10')
      .all(conversationId);

    // Generate AI response
    const aiResponse = generateResponse(content, user.level, history);
    const aiMsgId = uuidv4();

    db.prepare('INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)')
      .run(aiMsgId, conversationId, 'assistant', aiResponse);

    // Update conversation stats
    const errorCount = corrections.length;
    db.prepare('UPDATE conversations SET total_messages = total_messages + 2, total_errors = total_errors + ? WHERE id = ?')
      .run(errorCount, conversationId);

    res.json({
      userMessage: {
        id: userMsgId,
        role: 'user',
        content,
        corrections,
        createdAt: new Date().toISOString()
      },
      aiMessage: {
        id: aiMsgId,
        role: 'assistant',
        content: aiResponse,
        corrections: null,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// POST /api/chat/end - End conversation and get feedback
router.post('/end', authMiddleware, (req, res) => {
  try {
    const { conversationId } = req.body;

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?')
      .get(conversationId, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    // Calculate duration
    const startTime = new Date(conversation.started_at);
    const endTime = new Date();
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    // Get all messages and corrections
    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at')
      .all(conversationId);

    const allCorrections = messages
      .filter(m => m.corrections)
      .flatMap(m => JSON.parse(m.corrections));

    const user = db.prepare('SELECT level FROM users WHERE id = ?').get(req.user.id);

    // Generate feedback
    const feedback = generateSessionFeedback(messages, allCorrections, user.level);

    // Calculate and update score
    const sessionScore = calculateSessionScore(
      conversation.total_messages,
      conversation.total_errors,
      durationMinutes
    );

    const levelUp = updateUserScore(req.user.id, sessionScore);

    // Update conversation
    db.prepare('UPDATE conversations SET ended_at = datetime(\'now\'), duration_minutes = ? WHERE id = ?')
      .run(durationMinutes, conversationId);

    // Update daily progress
    updateDailyProgress(req.user.id, durationMinutes, conversation.total_errors, 0, sessionScore);

    res.json({
      feedback,
      sessionScore,
      durationMinutes,
      levelUp
    });
  } catch (error) {
    console.error('Chat end error:', error);
    res.status(500).json({ error: 'Erro ao encerrar conversa.' });
  }
});

module.exports = router;
