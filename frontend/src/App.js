import React, { useState } from 'react';
import Login from './components/Login';
import Productos from './components/Productos';
import Clientes from './components/Clientes';
import Ventas from './components/Ventas';
import Reportes from './components/Reportes';

/**
 * Componente raíz.
 * - Controla la autenticación (guarda el usuario en localStorage).
 * - Muestra la navegación entre módulos cuando hay sesión iniciada.
 */
function App() {
  // Recuperamos el usuario guardado (si existe) al cargar la app.
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  // Módulo actualmente visible.
  const [vista, setVista] = useState('productos');

  // Guarda la sesión tras un login/registro correcto.
  const iniciarSesion = (datosUsuario) => {
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  // Si no hay sesión, mostramos la pantalla de login/registro.
  if (!usuario) {
    return <Login onLogin={iniciarSesion} />;
  }

  // Inicial para el avatar (solo presentación).
  const inicial = (usuario.nombre || usuario.email || '?').charAt(0).toUpperCase();

  // Definición de las pestañas de navegación.
  const tabs = [
    { id: 'productos', label: 'Productos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'ventas', label: 'Ventas' },
    { id: 'reportes', label: 'Reportes' }
  ];

  return (
    <div className="app-shell">
      {/* Barra superior: marca + sesión */}
      <header className="topbar">
        <div className="brand">
          <span className="brand__logo">TS</span>
          <span>
            <span className="brand__name">TechStore</span>
            <span className="brand__sub">Sistema Web de Ventas</span>
          </span>
        </div>

        <div className="session">
          <div className="session__chip">
            <div className="session__info">
              <span className="session__name">{usuario.nombre}</span>
              <span className="session__email">{usuario.email}</span>
            </div>
            <span className="avatar">{inicial}</span>
          </div>
          <button className="btn-secondary btn-sm" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Navegación entre módulos */}
      <nav className="nav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={vista === t.id ? 'tab active' : 'tab'}
            onClick={() => setVista(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Renderizado del módulo seleccionado */}
      <main className="container">
        {vista === 'productos' && <Productos />}
        {vista === 'clientes' && <Clientes />}
        {vista === 'ventas' && <Ventas />}
        {vista === 'reportes' && <Reportes />}
      </main>
    </div>
  );
}

export default App;
