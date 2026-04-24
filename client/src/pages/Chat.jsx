import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, StopCircle, Bot, User, AlertCircle, Check, X, Sparkles, Trophy } from 'lucide-react';
import './Chat.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const [activeCorrection, setActiveCorrection] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    startConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startConversation = async () => {
    try {
      const data = await chatAPI.start();
      setConversationId(data.conversationId);
      setMessages([data.message]);
      setFeedback(null);
      setLevelUp(null);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || isTyping) return;
    const content = input.trim();
    setInput('');
    setIsTyping(true);

    // Optimistic user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content,
      corrections: null,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const data = await chatAPI.sendMessage(conversationId, content);
      // Replace temp message with real one
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMsg.id);
        return [...filtered, data.userMessage, data.aiMessage];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const endConversation = async () => {
    if (!conversationId) return;
    try {
      const data = await chatAPI.end(conversationId);
      setFeedback(data.feedback);
      if (data.levelUp) {
        setLevelUp(data.levelUp);
        updateUser({ level: data.levelUp.newLevel });
      }
      setConversationId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderCorrections = (corrections) => {
    if (!corrections || corrections.length === 0) return null;
    return (
      <div className="corrections-indicator" onClick={() => setActiveCorrection(activeCorrection ? null : corrections)}>
        <AlertCircle size={14} />
        <span>{corrections.length} correção(ões)</span>
      </div>
    );
  };

  const levelLabels = {
    beginner: 'Iniciante', basic: 'Básico', intermediate: 'Intermediário',
    advanced: 'Avançado', fluent: 'Fluente'
  };

  // Feedback view
  if (feedback) {
    return (
      <div className="chat-page">
        <div className="page-container">
          <div className="feedback-panel animate-fade-in-up">
            {levelUp && (
              <div className="level-up-banner animate-fade-in-up">
                <Trophy size={32} />
                <div>
                  <h3>🎉 Novo Nível Alcançado!</h3>
                  <p>{levelLabels[levelUp.previousLevel]} → <strong>{levelLabels[levelUp.newLevel]}</strong></p>
                </div>
              </div>
            )}

            <h2><Sparkles size={24} /> Resumo da Sessão</h2>

            <div className="feedback-stats">
              <div className="feedback-stat">
                <span className="stat-value">{feedback.totalMessages}</span>
                <span className="stat-label">Mensagens</span>
              </div>
              <div className="feedback-stat">
                <span className="stat-value">{feedback.accuracy}%</span>
                <span className="stat-label">Precisão</span>
              </div>
              <div className="feedback-stat">
                <span className="stat-value">{feedback.totalErrors}</span>
                <span className="stat-label">Erros</span>
              </div>
              <div className="feedback-stat">
                <span className="stat-value">{feedback.rating}</span>
                <span className="stat-label">Avaliação</span>
              </div>
            </div>

            {feedback.difficulties[0] !== 'Nenhuma dificuldade significativa' && (
              <div className="feedback-section">
                <h3>Dificuldades Encontradas</h3>
                <div className="feedback-tags">
                  {feedback.difficulties.map((d, i) => (
                    <span key={i} className="badge badge-yellow">{d}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="feedback-section">
              <h3>Pontos Positivos</h3>
              <ul>
                {feedback.positives.map((p, i) => (
                  <li key={i}><Check size={14} /> {p}</li>
                ))}
              </ul>
            </div>

            <p className="feedback-message">{feedback.message}</p>

            <div className="feedback-actions">
              <button className="btn btn-primary" onClick={startConversation}>
                Nova Conversa
              </button>
              <button className="btn btn-secondary" onClick={() => setFeedback(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header glass-card">
          <div className="chat-header-left">
            <div className="agent-avatar">
              <Bot size={22} />
            </div>
            <div>
              <h3>TalkMaster AI</h3>
              <span className="agent-status">
                {isTyping ? '✍️ Digitando...' : '🟢 Online'}
              </span>
            </div>
          </div>
          {conversationId && (
            <button className="btn btn-danger btn-sm" onClick={endConversation}>
              <StopCircle size={16} />
              Encerrar
            </button>
          )}
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`message ${msg.role} animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="message-avatar">
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {msg.content}
                </div>
                <div className="message-meta">
                  <span className="message-time">{formatTime(msg.createdAt)}</span>
                  {msg.corrections && msg.corrections.length > 0 && renderCorrections(msg.corrections)}
                </div>
                {activeCorrection && msg.corrections && msg.corrections.length > 0 && (
                  <div className="corrections-panel animate-fade-in">
                    {msg.corrections.map((c, i) => (
                      <div key={i} className="correction-item">
                        <span className={`correction-type badge badge-${c.type === 'grammar' ? 'red' : c.type === 'vocabulary' ? 'yellow' : 'blue'}`}>
                          {c.type === 'grammar' ? 'Gramática' : c.type === 'vocabulary' ? 'Vocabulário' : 'Pontuação'}
                        </span>
                        <p className="correction-suggestion">{c.suggestion}</p>
                        <div className="correction-actions">
                          <button className="btn btn-sm btn-success" onClick={() => setActiveCorrection(null)}>
                            <Check size={12} /> Aceitar
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => setActiveCorrection(null)}>
                            <X size={12} /> Ignorar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant animate-fade-in">
              <div className="message-avatar">
                <Bot size={18} />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area glass-card">
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            className="chat-input"
            placeholder="Type your message in English..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!conversationId || isTyping}
          />
          <button
            id="chat-send"
            className="btn btn-primary send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || !conversationId || isTyping}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
