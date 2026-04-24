import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = {
    length: password.length >= 8,
    letters: /[a-zA-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    match: password && confirmPassword && password === confirmPassword,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordChecks.length || !passwordChecks.letters || !passwordChecks.numbers) {
      setError('A senha não atende aos requisitos mínimos.');
      return;
    }
    if (!passwordChecks.match) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-decoration">
          <div className="bg-circle bg-circle-1"></div>
          <div className="bg-circle bg-circle-2"></div>
        </div>
        <div className="auth-container animate-fade-in-up">
          <div className="auth-success">
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h2>Cadastro realizado! 🎉</h2>
            <p>Redirecionando para o login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">
            <GraduationCap size={40} />
          </div>
          <h1>Criar Conta</h1>
          <p>Comece sua jornada no inglês hoje</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              id="register-name"
              type="text"
              className="input-field"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              id="register-email"
              type="email"
              className="input-field"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {password && (
            <div className="password-requirements animate-fade-in">
              <div className={`req ${passwordChecks.length ? 'met' : ''}`}>
                <Check size={14} /> Mínimo 8 caracteres
              </div>
              <div className={`req ${passwordChecks.letters ? 'met' : ''}`}>
                <Check size={14} /> Contém letras
              </div>
              <div className={`req ${passwordChecks.numbers ? 'met' : ''}`}>
                <Check size={14} /> Contém números
              </div>
              {confirmPassword && (
                <div className={`req ${passwordChecks.match ? 'met' : ''}`}>
                  <Check size={14} /> Senhas coincidem
                </div>
              )}
            </div>
          )}

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
            ) : (
              <>
                Cadastrar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Já tem conta?{' '}
            <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
