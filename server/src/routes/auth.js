const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    let { name, email, password, confirmPassword } = req.body;

    // Normalize email
    if (email) email = email.toLowerCase().trim();
    if (name) name = name.trim();

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de e-mail inválido.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return res.status(400).json({ error: 'A senha deve conter letras e números.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem.' });
    }

    // Check duplicate email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Create user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, password)
      VALUES (?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword);

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      userId
    });
  } catch (error) {
    console.error('❌ Register error detail:', error);
    res.status(500).json({ error: 'Erro ao realizar cadastro.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    let { email, password } = req.body;

    // Normalize email
    if (email) email = email.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    
    console.log(`🔍 Login attempt for: ${email}`);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Check if account is locked
    if (user.locked_until) {
      const lockTime = new Date(user.locked_until);
      if (lockTime > new Date()) {
        const remainingMs = lockTime - new Date();
        const remainingMin = Math.ceil(remainingMs / 60000);
        return res.status(423).json({
          error: `Conta bloqueada. Tente novamente em ${remainingMin} minuto(s).`
        });
      } else {
        // Unlock
        db.prepare('UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);
        user.login_attempts = 0;
      }
    }

    // Verify password
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      const attempts = user.login_attempts + 1;

      if (attempts >= 3) {
        const lockUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        db.prepare('UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?')
          .run(attempts, lockUntil, user.id);
        return res.status(423).json({
          error: 'Conta bloqueada por 5 minutos após 3 tentativas incorretas.'
        });
      }

      db.prepare('UPDATE users SET login_attempts = ? WHERE id = ?').run(attempts, user.id);
      return res.status(401).json({
        error: `E-mail ou senha incorretos. ${3 - attempts} tentativa(s) restante(s).`
      });
    }

    // Reset login attempts
    const today = new Date().toISOString().split('T')[0];
    let streak = user.streak_days;
    if (user.last_active_date) {
      const lastDate = new Date(user.last_active_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    } else {
      streak = 1;
    }

    db.prepare('UPDATE users SET login_attempts = 0, locked_until = NULL, last_active_date = ?, streak_days = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(today, streak, user.id);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        score: user.score,
        streakDays: streak,
        levelTestTaken: !!user.level_test_taken
      }
    });
  } catch (error) {
    console.error('❌ Login error detail:', error);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, level, score, streak_days, level_test_taken, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({
    ...user,
    streakDays: user.streak_days,
    levelTestTaken: !!user.level_test_taken
  });
});

module.exports = router;
