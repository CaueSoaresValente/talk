import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { BarChart3, Clock, MessageSquare, BookOpen, Flame, Trophy, Target, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadProgress();
  }, [period]);

  const loadDashboard = async () => {
    try {
      const d = await dashboardAPI.get();
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const d = await dashboardAPI.getProgress(period);
      setProgress(d.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !data) {
    return (
      <div className="page-container">
        <div className="loading-container"><div className="spinner"></div><p>Carregando dashboard...</p></div>
      </div>
    );
  }

  const levelLabels = {
    beginner: 'Iniciante', basic: 'Básico', intermediate: 'Intermediário',
    advanced: 'Avançado', fluent: 'Fluente'
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bem-vindo, {data.user.name}! Acompanhe seu progresso.</p>
        </div>
        <div className="streak-badge">
          <Flame size={20} />
          <span>{data.user.streakDays} dia(s)</span>
        </div>
      </div>

      <div className="stats-grid stagger-children">
        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-primary)' }}>
            <Clock size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{data.stats.totalHours}h</span>
            <span className="stat-card-label">Horas Praticadas</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-success)' }}>
            <MessageSquare size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{data.stats.totalConversations}</span>
            <span className="stat-card-label">Conversas</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-secondary)' }}>
            <BookOpen size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{data.stats.totalExercises}</span>
            <span className="stat-card-label">Exercícios</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-card-icon" style={{ background: 'var(--gradient-warm)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-value">{data.user.score}</span>
            <span className="stat-card-label">Pontuação Total</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="level-card glass-card animate-fade-in-up">
          <h3><Trophy size={18} /> Nível Atual</h3>
          <div className="current-level">
            <span className="level-name">{levelLabels[data.user.level]}</span>
            <span className="level-score">{data.user.score} pts</span>
          </div>
          <div className="level-progress">
            <div className="level-progress-bar">
              <div
                className="level-progress-fill"
                style={{ width: `${data.progression.progressPercent}%` }}
              ></div>
            </div>
            <div className="level-progress-info">
              <span>{data.progression.progressPercent}%</span>
              {data.progression.nextLevel && (
                <span>Próximo: {data.progression.nextLevel.label} ({data.progression.nextLevel.minScore} pts)</span>
              )}
            </div>
          </div>
          <div className="levels-overview">
            {data.progression.allLevels.map((l, i) => (
              <div key={i} className={`level-dot ${data.user.level === l.name ? 'active' : data.user.score >= l.minScore ? 'completed' : ''}`}>
                <div className="dot"></div>
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="weekly-goal glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3><Target size={18} /> Meta Semanal</h3>
          <div className="goal-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#goalGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${data.weeklyGoal.progressPercent * 2.64} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
              <defs>
                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="goal-text">
              <span className="goal-current">{data.weeklyGoal.current}</span>
              <span className="goal-target">de {data.weeklyGoal.target}</span>
            </div>
          </div>
          <p className="goal-label">Sessões esta semana</p>
        </div>
      </div>

      <div className="chart-card glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="chart-header">
          <h3><BarChart3 size={18} /> Progresso</h3>
          <div className="period-buttons">
            {[7, 30, 90].map(p => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPeriod(p)}
              >
                {p} dias
              </button>
            ))}
          </div>
        </div>
        <div className="chart-container">
          {progress.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '0.85rem'
                  }}
                />
                <Area type="monotone" dataKey="score_earned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" name="Pontos" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">
              <p>Sem dados para o período selecionado. Comece a praticar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
