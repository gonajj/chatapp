import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <span className="auth-logo-text">ChatApp</span>
        </div>
        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="tu@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="auth-link">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </div>
    </div>
  );
}
