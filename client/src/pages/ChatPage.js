import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { format } from 'timeago.js';

const API = process.env.REACT_APP_API_URL || '';

// ============ MODALS ============
function NewChatModal({ onClose, onChatCreated }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (q) => {
    if (!q.trim()) return setResults([]);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/users/buscar?q=${q}`);
      setResults(data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const startChat = async (userId) => {
    const { data } = await axios.post(`${API}/api/chats/privado`, { userId });
    onChatCreated(data);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">💬 Nuevo Chat</h3>
        <input className="form-input" placeholder="Buscar por nombre o email..."
          value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        <div className="user-search-results">
          {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Buscando...</div>}
          {results.map(u => (
            <div key={u._id} className="user-result" onClick={() => startChat(u._id)}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 14 }}>{u.nombre[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 500 }}>{u.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function NewGroupModal({ onClose, onGroupCreated }) {
  const [nombre, setNombre] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  const search = async (q) => {
    if (!q.trim()) return setResults([]);
    const { data } = await axios.get(`${API}/api/users/buscar?q=${q}`);
    setResults(data);
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const toggle = (user) => {
    setSelected(prev => prev.find(u => u._id === user._id)
      ? prev.filter(u => u._id !== user._id)
      : [...prev, user]);
  };

  const create = async () => {
    if (!nombre.trim() || selected.length === 0) return;
    const { data } = await axios.post(`${API}/api/chats/grupo`, {
      nombre, participantes: selected.map(u => u._id)
    });
    onGroupCreated(data);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">👥 Nuevo Grupo</h3>
        <div className="form-group">
          <label className="form-label">Nombre del grupo</label>
          <input className="form-input" placeholder="Ej: Amigos del trabajo"
            value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Agregar participantes</label>
          <input className="form-input" placeholder="Buscar usuarios..."
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        {selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {selected.map(u => (
              <span key={u._id} style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}
                onClick={() => toggle(u)}>{u.nombre} ✕</span>
            ))}
          </div>
        )}
        <div className="user-search-results">
          {results.map(u => (
            <div key={u._id} className={`user-result ${selected.find(s => s._id === u._id) ? 'selected' : ''}`}
              onClick={() => toggle(u)}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 14 }}>{u.nombre[0].toUpperCase()}</div>
              <span>{u.nombre}</span>
              {selected.find(s => s._id === u._id) && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-accent" onClick={create} disabled={!nombre.trim() || selected.length === 0}>
            Crear Grupo
          </button>
        </div>
      </div>
    </div>
  );
}

function JoinGroupModal({ onClose, onGroupJoined }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);

  const search = async (q) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/chats/buscar-grupos?q=${encodeURIComponent(q)}`);
      setResults(data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const join = async (chatId) => {
    setJoining(chatId);
    try {
      const { data } = await axios.post(`${API}/api/chats/unirse/${chatId}`);
      onGroupJoined(data);
      onClose();
    } finally { setJoining(null); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">🔎 Buscar Grupos</h3>
        <input className="form-input" placeholder="Buscar grupos por nombre..."
          value={query} onChange={e => setQuery(e.target.value)} autoFocus />
        <div className="user-search-results">
          {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Buscando...</div>}
          {!loading && results.length === 0 && query && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin resultados</div>
          )}
          {results.map(g => (
            <div key={g._id} className="user-result" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 14 }}>{g.nombre[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.participantes.length} participantes</div>
                </div>
              </div>
              <button className="btn-accent" style={{ fontSize: 12, padding: '4px 12px' }}
                onClick={() => join(g._id)} disabled={joining === g._id}>
                {joining === g._id ? '...' : 'Unirse'}
              </button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
// ============ MAIN PAGE ============

// ============ MAIN PAGE ============
export default function ChatPage() {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [sending, setSending] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  // Load chats
  useEffect(() => {
    axios.get(`${API}/api/chats`).then(r => setChats(r.data));
  }, []);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setChats(prev => prev.map(c => c._id === msg.chatId ? { ...c, ultimoMensaje: msg } : c));
    });

    socket.on('user_typing', ({ chatId, userName }) => {
      if (activeChat?._id === chatId) setTyping(`${userName} está escribiendo...`);
    });

    socket.on('user_stop_typing', () => setTyping(''));

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, activeChat]);

  // Join chat room & load messages
  useEffect(() => {
    if (!activeChat) return;
    socket?.emit('join_chat', activeChat._id);
    axios.get(`${API}/api/messages/${activeChat._id}`).then(r => setMessages(r.data));
  }, [activeChat, socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatName = (chat) => {
    if (chat.tipo === 'grupo') return chat.nombre;
    const userId = String(user.id || user._id);
    const other = chat.participantes.find(p => String(p._id) !== userId);
    return other?.nombre || 'Chat';
  };

  const getChatInitial = (chat) => getChatName(chat)[0]?.toUpperCase() || '?';

  const isOnline = (chat) => {
    if (chat.tipo === 'grupo') return false;
    const userId = String(user.id || user._id);
    const other = chat.participantes.find(p => String(p._id) !== userId);
    return onlineUsers.includes(String(other?._id));
  };

  const getPreview = (chat) => {
    const msg = chat.ultimoMensaje;
    if (!msg) return 'Sin mensajes';
    if (msg.tipo === 'imagen') return '📷 Imagen';
    return msg.contenido || '';
  };

  const handleTyping = () => {
    socket?.emit('typing', { chatId: activeChat._id, userName: user.nombre });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit('stop_typing', { chatId: activeChat._id });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || sending) return;
    setSending(true);
    socket?.emit('stop_typing', { chatId: activeChat._id });
    try {
      const { data } = await axios.post(`${API}/api/messages`, {
        chatId: activeChat._id, contenido: input.trim()
      });
      socket?.emit('send_message', { ...data, chatId: activeChat._id });
      setMessages(prev => [...prev, data]);
      setChats(prev => prev.map(c => c._id === activeChat._id ? { ...c, ultimoMensaje: data } : c));
      setInput('');
    } finally { setSending(false); }
  };

  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('chatId', activeChat._id);
    try {
      const { data } = await axios.post(`${API}/api/messages/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      socket?.emit('send_message', { ...data, chatId: activeChat._id });
      setMessages(prev => [...prev, data]);
    } catch { alert('Error al enviar imagen'); }
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleChatCreated = (chat) => {
    setChats(prev => {
      const exists = prev.find(c => c._id === chat._id);
      return exists ? prev : [chat, ...prev];
    });
    setActiveChat(chat);
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">ChatApp</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="icon-btn" onClick={() => setShowJoinGroup(true)} title="Buscar grupos">🔎</button>
            <button className="icon-btn" onClick={() => setShowNewGroup(true)} title="Nuevo grupo">👥</button>
            <button className="icon-btn" onClick={() => setShowNewChat(true)} title="Nuevo chat">✏️</button>
          </div>
        </div>

        <div className="sidebar-search">
          <input className="search-input" placeholder="🔍 Buscar chats..." readOnly />
        </div>

        <div className="chat-list">
          {chats.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No tienes chats aún.<br />¡Empieza uno nuevo!
            </div>
          )}
          {chats.map(chat => (
            <div key={chat._id} className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}>
              <div className={`avatar ${isOnline(chat) ? 'online' : ''}`}>
                {getChatInitial(chat)}
              </div>
              <div className="chat-item-info">
                <div className="chat-item-name">{getChatName(chat)}</div>
                <div className="chat-item-preview">{getPreview(chat)}</div>
              </div>
              <div className="chat-item-time">
                {chat.ultimoMensaje ? format(chat.ultimoMensaje.createdAt, 'es') : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 14 }}>{user?.nombre[0]?.toUpperCase()}</div>
          <span className="user-name">{user?.nombre}</span>
          <button className="btn-logout" onClick={logout}>Salir</button>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="chat-main">
        {!activeChat ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">Selecciona un chat</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>o inicia una nueva conversación</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className={`avatar ${isOnline(activeChat) ? 'online' : ''}`}>
                {getChatInitial(activeChat)}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{getChatName(activeChat)}</div>
                <div className="chat-header-status">
                  {activeChat.tipo === 'grupo'
                    ? `${activeChat.participantes.length} participantes`
                    : isOnline(activeChat) ? '🟢 En línea' : 'Fuera de línea'}
                </div>
              </div>
            </div>

            <div className="messages-container">
              {messages.map((msg, i) => {
                const senderId = (msg.remitente?._id || msg.remitente)?.toString();
                const myId = (user.id || user._id)?.toString();
                const isOut = senderId === myId;
                const senderName = msg.remitente?.nombre || '';
                const showName = !isOut && activeChat.tipo === 'grupo';
                return (
                  <div key={msg._id || i} className={`msg-wrapper ${isOut ? 'out' : 'in'}`}>
                    <div className="msg-bubble">
                      {showName && <div className="msg-sender-name">{senderName}</div>}
                      {msg.tipo === 'imagen'
                        ? <img src={msg.archivoUrl} alt="img" className="msg-image"
                          onClick={() => window.open(msg.archivoUrl, '_blank')} />
                        : <span>{msg.contenido}</span>
                      }
                      <div className="msg-time">{format(msg.createdAt || new Date(), 'es')}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="typing-indicator">{typing}</div>

            <div className="chat-input-area">
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={sendImage} />
              <button className="img-btn" onClick={() => fileInputRef.current?.click()} title="Enviar imagen">📷</button>
              <textarea className="msg-input" rows={1} placeholder="Escribe un mensaje..."
                value={input}
                onChange={e => { setInput(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyDown} />
              <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || sending}>➤</button>
            </div>
          </>
        )}
      </main>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} onChatCreated={handleChatCreated} />}
      {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} onGroupCreated={handleChatCreated} />}
      {showJoinGroup && <JoinGroupModal onClose={() => setShowJoinGroup(false)} onGroupJoined={handleChatCreated} />}
    </div>
  );
}
