import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, BookOpen, BarChart3, History, Settings, LogOut, Shield, GraduationCap } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const levelLabels = {
    beginner: 'Iniciante',
    basic: 'Básico',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    fluent: 'Fluente'
  };

  const levelColors = {
    beginner: 'badge-green',
    basic: 'badge-blue',
    intermediate: 'badge-yellow',
    advanced: 'badge-purple',
    fluent: 'badge-red'
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
          <GraduationCap size={28} />
          <span className="brand-text">TalkMaster</span>
        </div>

        <div className="navbar-links">
          <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>Chat</span>
          </NavLink>
          <NavLink to="/exercises" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} />
            <span>Exercícios</span>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <History size={18} />
            <span>Histórico</span>
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Shield size={18} />
              <span>Admin</span>
            </NavLink>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`badge ${levelColors[user?.level] || 'badge-blue'}`}>
              {levelLabels[user?.level] || user?.level}
            </span>
          </div>
          <button className="nav-link logout-btn" onClick={handleLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
