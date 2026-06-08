import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Módulo Productos: agregar, editar, eliminar y consultar.
 * Incluye también la consulta de "stock bajo" (menor a 5).
 */
function Productos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');

  // Estado del formulario. Si "editandoId" tiene valor, estamos editando.
  const formVacio = { nombre: '', precio: '', stock: '', categoria: '' };
  const [form, setForm] = useState(formVacio);
  const [editandoId, setEditandoId] = useState(null);

  // Filtro: ver todos o solo stock bajo.
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  // Carga los productos desde la API.
  const cargar = async () => {
    try {
      const ruta = soloStockBajo ? '/productos/stock-bajo' : '/productos';
      const { data } = await api.get(ruta);
      setProductos(data);
    } catch (err) {
      setError('No se pudieron cargar los productos');
    }
  };

  // Recargar cada vez que cambie el filtro.
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soloStockBajo]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Crear o actualizar según el modo.
  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const datos = {
        nombre: form.nombre,
        precio: Number(form.precio),
        stock: Number(form.stock),
        categoria: form.categoria || 'General'
      };
      if (editandoId) {
        await api.put(`/productos/${editandoId}`, datos);
      } else {
        await api.post('/productos', datos);
      }
      setForm(formVacio);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  // Cargar un producto en el formulario para editarlo.
  const editar = (p) => {
    setEditandoId(p._id);
    setForm({ nombre: p.nombre, precio: p.precio, stock: p.stock, categoria: p.categoria });
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      cargar();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const cancelar = () => {
    setForm(formVacio);
    setEditandoId(null);
  };

  return (
    <div>
      {/* Formulario de alta / edición */}
      <div className="card">
        <div className="card__header">
          <h2>{editandoId ? 'Editar producto' : 'Nuevo producto'}</h2>
          <p className="card__subtitle">Registra y administra el catálogo de productos.</p>
        </div>

        <form onSubmit={guardar}>
          <div className="form-grid">
            <div className="field">
              <label>Nombre</label>
              <input name="nombre" placeholder="Ej. Teclado mecánico" value={form.nombre} onChange={cambiar} required />
            </div>
            <div className="field">
              <label>Precio</label>
              <input name="precio" type="number" placeholder="0.00" value={form.precio} onChange={cambiar} required />
            </div>
            <div className="field">
              <label>Stock</label>
              <input name="stock" type="number" placeholder="0" value={form.stock} onChange={cambiar} required />
            </div>
            <div className="field">
              <label>Categoría</label>
              <input name="categoria" placeholder="General" value={form.categoria} onChange={cambiar} />
            </div>
            <div className="actions">
              <button type="submit">{editandoId ? 'Actualizar' : 'Agregar'}</button>
              {editandoId && <button type="button" className="btn-secondary" onClick={cancelar}>Cancelar</button>}
            </div>
          </div>
        </form>

        {error && <p className="error">{error}</p>}
      </div>

      {/* Listado */}
      <div className="card">
        <div className="card__header">
          <h2>Catálogo</h2>
        </div>

        <div className="toolbar">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={soloStockBajo}
              onChange={(e) => setSoloStockBajo(e.target.checked)}
            />
            Mostrar solo productos con stock bajo (menor a 5)
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td className="price">${p.precio}</td>
                  <td>
                    {p.stock < 5
                      ? <span className="badge badge--low">{p.stock} · bajo</span>
                      : <span className="badge">{p.stock}</span>}
                  </td>
                  <td>{p.categoria}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-secondary btn-sm" onClick={() => editar(p)}>Editar</button>
                      <button className="btn-danger btn-sm" onClick={() => eliminar(p._id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr><td className="empty" colSpan="5">No hay productos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Productos;
