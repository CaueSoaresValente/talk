const express = require('express');
const { db } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users - List all users
router.get('/users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, level, score, streak_days, level_test_taken, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, email, role, level } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        level = COALESCE(?, level),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name || null, email || null, role || null, level || null, req.params.id);

    res.json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta.' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ error: 'Erro ao remover usuário.' });
  }
});

module.exports = router;
