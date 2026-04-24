import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { levelTestAPI } from '../services/api';
import { GraduationCap, ChevronRight, Trophy, Target } from 'lucide-react';
import './LevelTest.css';

export default function LevelTest() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    levelTestAPI.getQuestions()
      .then(data => {
        setQuestions(data);
        setAnswers(new Array(data.length).fill(null));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (optionIndex) => {
    setSelected(optionIndex);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers) => {
    try {
      const data = await levelTestAPI.submit(finalAnswers);
      setResult(data);
      updateUser({ level: data.levelResult, levelTestTaken: true });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="level-test-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando teste...</p>
        </div>
      </div>
    );
  }

  if (result) {
    const levelEmojis = { beginner: '🌱', intermediate: '🌿', advanced: '🌳' };
    return (
      <div className="level-test-page">
        <div className="test-result animate-fade-in-up">
          <div className="result-icon">
            <Trophy size={48} />
          </div>
          <h1>Teste Concluído!</h1>
          <div className="result-score">
            <span className="score-number">{result.score}%</span>
            <span className="score-label">de acertos</span>
          </div>
          <p className="result-detail">
            Você acertou <strong>{result.correctCount}</strong> de <strong>{result.totalQuestions}</strong> questões
          </p>
          <div className="result-level">
            <span className="level-emoji">{levelEmojis[result.levelResult] || '🌱'}</span>
            <span className="level-text">Seu nível: <strong>{result.levelLabel}</strong></span>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
            Ir para o Dashboard
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  return (
    <div className="level-test-page">
      <div className="auth-bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
      </div>

      <div className="test-container animate-fade-in-up">
        <div className="test-header">
          <div className="test-icon">
            <Target size={28} />
          </div>
          <h2>Teste de Nivelamento</h2>
          <p>Questão {currentQ + 1} de {questions.length}</p>
        </div>

        <div className="test-progress-bar">
          <div className="test-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="test-question animate-fade-in" key={currentQ}>
          <h3>{q.question}</h3>
          <div className="test-options">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                className={`test-option ${selected === idx ? 'selected' : ''}`}
                onClick={() => handleSelect(idx)}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg test-next"
          onClick={handleNext}
          disabled={selected === null}
        >
          {currentQ < questions.length - 1 ? 'Próxima' : 'Finalizar'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
