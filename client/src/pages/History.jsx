import { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import { History as HistoryIcon, Search, MessageSquare, Clock, AlertTriangle, ChevronRight, ArrowLeft, Bot, User } from 'lucide-react';
import './History.css';

export default function History() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await historyAPI.list();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadHistory();
      return;
    }
    try {
      const data = await historyAPI.search(searchQuery);
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const viewConversation = async (id) => {
    try {
      const data = await historyAPI.getDetail(id);
      setSelectedConv(data.conversation);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container"><div className="spinner"></div><p>Carregando histórico...</p></div>
      </div>
    );
  }

  // Conversation detail view
  if (selectedConv) {
    return (
      <div className="page-container">
        <button className="btn btn-secondary btn-sm back-btn" onClick={() => { setSelectedConv(null); setMessages([]); }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="history-detail glass-card">
          <div className="detail-header">
            <h2>Conversa de {formatDate(selectedConv.started_at)}</h2>
            <div className="detail-meta">
              <span><Clock size={14} /> {selectedConv.duration_minutes || 0} min</span>
              <span><MessageSquare size={14} /> {selectedConv.total_messages} mensagens</span>
              <span><AlertTriangle size={14} /> {selectedConv.total_errors} erros</span>
            </div>
          </div>
          <div className="detail-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`history-message ${msg.role}`}>
                <div className="history-msg-avatar">
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="history-msg-content">
                  <p>{msg.content}</p>
                  <span className="history-msg-time">
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.corrections && msg.corrections.length > 0 && (
                    <div className="history-corrections">
                      {msg.corrections.map((c, i) => (
                        <span key={i} className="badge badge-red" style={{ fontSize: '0.7rem' }}>{c.message}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Histórico de Conversas</h1>
      <p className="page-subtitle">Revise suas conversas anteriores</p>

      <div className="history-search glass-card">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por palavra-chave..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSearch}>Buscar</button>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state glass-card">
          <HistoryIcon size={48} />
          <h3>Nenhuma conversa encontrada</h3>
          <p>Comece uma conversa no chat para ver seu histórico aqui</p>
        </div>
      ) : (
        <div className="history-list stagger-children">
          {conversations.map((conv) => (
            <div key={conv.id} className="history-item glass-card" onClick={() => viewConversation(conv.id)}>
              <div className="history-item-left">
                <div className="history-item-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="history-item-info">
                  <span className="history-item-date">{formatDate(conv.started_at)}</span>
                  <span className="history-item-meta">
                    {conv.total_messages} mensagens • {conv.duration_minutes || 0} min • {conv.total_errors} erros
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="history-item-arrow" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
