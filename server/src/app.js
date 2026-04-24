const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initializeDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { seedExercises } = require('./seeds/exercises');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const levelTestRoutes = require('./routes/levelTest');
const exerciseRoutes = require('./routes/exercises');
const dashboardRoutes = require('./routes/dashboard');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/level-test', levelTestRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TalkMaster API is running! 🚀' });
});

// Error handler
app.use(errorHandler);

// Initialize and start
initializeDatabase();
seedExercises();

app.listen(PORT, () => {
  console.log(`\n🚀 TalkMaster API running at http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
