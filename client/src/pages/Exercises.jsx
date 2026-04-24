import { useState, useEffect } from 'react';
import { exerciseAPI } from '../services/api';
import { BookOpen, Check, X, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import './Exercises.css';

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    loadExercises();
  }, [filter]);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseAPI.getExercises(filter);
      setExercises(data);
      setCurrentIdx(0);
      setResult(null);
      setSelectedAnswer('');
      setScore({ correct: 0, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer && selectedAnswer !== 0) return;
    try {
      const exercise = exercises[currentIdx];
      const data = await exerciseAPI.submit(exercise.id, selectedAnswer);
      setResult(data);
      setScore(prev => ({
        correct: prev.correct + (data.isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const nextExercise = () => {
    setResult(null);
    setSelectedAnswer('');
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container"><div className="spinner"></div><p>Carregando exercícios...</p></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="page-container">
        <h1 className="page-title">Exercícios</h1>
        <div className="exercise-filters">{renderFilters()}</div>
        <div className="empty-state glass-card">
          <BookOpen size={48} />
          <h3>Nenhum exercício encontrado</h3>
          <p>Tente outro tipo de exercício ou nível</p>
        </div>
      </div>
    );
  }

  function renderFilters() {
    return (
      <>
        <button className={`btn btn-sm ${filter === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('')}>Todos</button>
        <button className={`btn btn-sm ${filter === 'multiple_choice' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('multiple_choice')}>Múltipla Escolha</button>
        <button className={`btn btn-sm ${filter === 'fill_blank' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('fill_blank')}>Preencher Lacuna</button>
        <button className={`btn btn-sm ${filter === 'translation' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('translation')}>Tradução</button>
      </>
    );
  }

  const exercise = exercises[currentIdx];
  const isLast = currentIdx >= exercises.length - 1;
  const typeLabels = {
    multiple_choice: 'Múltipla Escolha',
    fill_blank: 'Preencher Lacuna',
    translation: 'Tradução'
  };

  // Completed all
  if (currentIdx >= exercises.length - 1 && result && isLast) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="page-container">
        <div className="exercise-complete animate-fade-in-up">
          <Trophy size={48} />
          <h2>Exercícios Concluídos! 🎉</h2>
          <div className="complete-stats">
            <div className="complete-stat">
              <span className="stat-value">{score.correct}/{score.total}</span>
              <span className="stat-label">Acertos</span>
            </div>
            <div className="complete-stat">
              <span className="stat-value">{accuracy}%</span>
              <span className="stat-label">Precisão</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={loadExercises}>
            <RotateCcw size={16} /> Praticar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="exercise-header">
        <div>
          <h1 className="page-title">Exercícios</h1>
          <p className="page-subtitle">{currentIdx + 1} de {exercises.length} • Acertos: {score.correct}/{score.total}</p>
        </div>
      </div>

      <div className="exercise-filters">{renderFilters()}</div>

      <div className="exercise-card glass-card animate-fade-in" key={currentIdx}>
        <div className="exercise-type-badge">
          <span className="badge badge-blue">{typeLabels[exercise.type]}</span>
          <span className="badge badge-purple">{exercise.level}</span>
        </div>

        <h3 className="exercise-question">{exercise.question}</h3>

        {exercise.type === 'multiple_choice' && exercise.options && (
          <div className="exercise-options">
            {exercise.options.map((opt, idx) => (
              <button
                key={idx}
                className={`exercise-option ${selectedAnswer === String(idx) ? 'selected' : ''} ${
                  result ? (String(idx) === result.correctAnswer ? 'correct' : selectedAnswer === String(idx) ? 'incorrect' : '') : ''
                }`}
                onClick={() => !result && setSelectedAnswer(String(idx))}
                disabled={!!result}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
                {result && String(idx) === result.correctAnswer && <Check size={16} className="option-icon correct" />}
                {result && selectedAnswer === String(idx) && !result.isCorrect && <X size={16} className="option-icon incorrect" />}
              </button>
            ))}
          </div>
        )}

        {(exercise.type === 'fill_blank' || exercise.type === 'translation') && (
          <div className="exercise-input-area">
            <input
              type="text"
              className={`input-field ${result ? (result.isCorrect ? 'success' : 'error') : ''}`}
              placeholder={exercise.type === 'fill_blank' ? 'Digite a resposta...' : 'Escreva a tradução em inglês...'}
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !result && submitAnswer()}
              disabled={!!result}
            />
          </div>
        )}

        {result && (
          <div className={`exercise-result animate-fade-in ${result.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-header">
              {result.isCorrect ? (
                <><Check size={20} /> <span>Correto! +{result.scoreEarned} pontos</span></>
              ) : (
                <><X size={20} /> <span>Incorreto. Resposta: {result.correctAnswer}</span></>
              )}
            </div>
            {result.explanation && <p className="result-explanation">{result.explanation}</p>}
          </div>
        )}

        <div className="exercise-actions">
          {!result ? (
            <button className="btn btn-primary" onClick={submitAnswer} disabled={!selectedAnswer && selectedAnswer !== 0}>
              Verificar Resposta
            </button>
          ) : (
            !isLast && (
              <button className="btn btn-primary" onClick={nextExercise}>
                Próximo <ChevronRight size={16} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
