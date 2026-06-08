import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Módulo Clientes: registrar, editar y consultar.
 */
function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');

  const formVacio = { nombre: '', email: '', telefono: '' };
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch (err) {
      setError('No se pudieron cargar los clientes');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setForm(formVacio);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const editar = (c) => {
    setEditandoId(c._id);
    setForm({ nombre: c.nombre, email: c.email || '', telefono: c.telefono || '' });
  };

  const cancelar = () => {
    setForm(formVacio);
    setEditandoId(null);
  };

  return (
    <div>
      <div className="card">
        <div className="card__header">
          <h2>{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <p className="card__subtitle">Administra la información de tus clientes.</p>
        </div>

        <form onSubmit={guardar}>
          <div className="form-grid">
            <div className="field">
              <label>Nombre</label>
              <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={cambiar} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={cambiar} />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input name="telefono" placeholder="000 000 0000" value={form.telefono} onChange={cambiar} />
            </div>
            <div className="actions">
              <button type="submit">{editandoId ? 'Actualizar' : 'Registrar'}</button>
              {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
            </div>
          </div>
        </form>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <div className="card__header">
          <h2>Clientes registrados</h2>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c._id}>
                  <td>{c.nombre}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-secondary btn-sm" onClick={() => editar(c)}>Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr><td className="empty" colSpan="4">No hay clientes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clientes;
