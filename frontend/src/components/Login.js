import React, { useState } from 'react';
import api from '../api';

/**
 * Pantalla de Login y Registro.
 * Un solo formulario que cambia entre los dos modos.
 */
function Login({ onLogin }) {
  const [modo, setModo] = useState('login'); // 'login' o 'registro'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modo === 'login') {
        const { data } = await api.post('/login', { email, password });
        onLogin(data);
      } else {
        const { data } = await api.post('/registro', { nombre, email, password });
        onLogin(data); // tras registrarse, entra directamente
      }
    } catch (err) {
      // Mostramos el mensaje de error que devuelve la API.
      setError(err.response?.data?.error || 'Ocurrió un error');
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">TS</span>
          <h1 className="auth__title">TechStore</h1>
        </div>

        <p className="auth__subtitle">
          {modo === 'login'
            ? 'Inicia sesión para gestionar tus ventas'
            : 'Crea una cuenta para empezar'}
        </p>

        <form onSubmit={enviar}>
          {/* El campo nombre solo aparece en el registro */}
          {modo === 'registro' && (
            <div className="field">
              <label>Nombre</label>
              <input
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-block">
            {modo === 'login' ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p className="auth__switch">
          {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); }}
          >
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
