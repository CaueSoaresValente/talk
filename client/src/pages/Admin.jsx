import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Trash2, Edit2, Users, X } from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await adminAPI.updateUser(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        level: editingUser.level
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editingUser } : u));
      setEditingUser(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const levelLabels = {
    beginner: 'Iniciante', basic: 'Básico', intermediate: 'Intermediário',
    advanced: 'Avançado', fluent: 'Fluente'
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container"><div className="spinner"></div><p>Carregando...</p></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Administração</h1>
      <p className="page-subtitle">Gerencie os usuários da plataforma</p>

      <div className="admin-stats">
        <div className="admin-stat glass-card">
          <Users size={20} />
          <span>{users.length} usuários</span>
        </div>
      </div>

      <div className="admin-table-wrapper glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Nível</th>
              <th>Pontuação</th>
              <th>Papel</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className="badge badge-blue">{levelLabels[u.level] || u.level}</span></td>
                <td>{u.score}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-green'}`}>{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingUser({ ...u })} title="Editar">
                      <Edit2 size={14} />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)} title="Remover">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay animate-fade-in" onClick={() => setEditingUser(null)}>
          <div className="modal glass-card animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuário</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditingUser(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <label>
                Nome
                <input className="input-field" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
              </label>
              <label>
                Papel
                <select className="input-field" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
                  <option value="student">Estudante</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <label>
                Nível
                <select className="input-field" value={editingUser.level} onChange={e => setEditingUser({ ...editingUser, level: e.target.value })}>
                  <option value="beginner">Iniciante</option>
                  <option value="basic">Básico</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                  <option value="fluent">Fluente</option>
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
