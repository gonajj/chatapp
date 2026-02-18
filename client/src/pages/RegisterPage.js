import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      await register(form.nombre, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
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
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-subtitle">Únete a ChatApp hoy</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="form-input" type="text" placeholder="Tu nombre"
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="tu@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p className="auth-link">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
