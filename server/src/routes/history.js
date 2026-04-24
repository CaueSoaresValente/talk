const express = require('express');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/history - List all conversations
router.get('/', authMiddleware, (req, res) => {
  try {
    const conversations = db.prepare(`
      SELECT id, started_at, ended_at, duration_minutes, total_errors, total_messages
      FROM conversations
      WHERE user_id = ?
      ORDER BY started_at DESC
    `).all(req.user.id);

    res.json(conversations);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico.' });
  }
});

// GET /api/history/search?q=keyword
router.get('/search', authMiddleware, (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Informe uma palavra-chave para busca.' });
    }

    const conversations = db.prepare(`
      SELECT DISTINCT c.id, c.started_at, c.ended_at, c.duration_minutes, c.total_errors, c.total_messages
      FROM conversations c
      JOIN messages m ON m.conversation_id = c.id
      WHERE c.user_id = ? AND m.content LIKE ?
      ORDER BY c.started_at DESC
    `).all(req.user.id, `%${q}%`);

    res.json(conversations);
  } catch (error) {
    console.error('History search error:', error);
    res.status(500).json({ error: 'Erro na busca.' });
  }
});

// GET /api/history/:id - Get conversation details
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const conversation = db.prepare(`
      SELECT * FROM conversations WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    const messages = db.prepare(`
      SELECT id, role, content, corrections, created_at
      FROM messages WHERE conversation_id = ?
      ORDER BY created_at ASC
    `).all(req.params.id);

    // Parse corrections
    const parsedMessages = messages.map(m => ({
      ...m,
      corrections: m.corrections ? JSON.parse(m.corrections) : null
    }));

    res.json({
      conversation,
      messages: parsedMessages
    });
  } catch (error) {
    console.error('History detail error:', error);
    res.status(500).json({ error: 'Erro ao carregar conversa.' });
  }
});

module.exports = router;
