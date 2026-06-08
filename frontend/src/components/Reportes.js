import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Módulo Reportes:
 * - Ventas por fecha (filtro desde/hasta).
 * - Productos más vendidos (aggregation).
 * - Inventario disponible (todos los productos).
 * - Indicadores: total vendido y ventas mayores a $10,000.
 */
function Reportes() {
  const [error, setError] = useState('');

  // Ventas por fecha.
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [ventasFecha, setVentasFecha] = useState([]);

  // Otros reportes.
  const [masVendidos, setMasVendidos] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [totalVendido, setTotalVendido] = useState({ totalVendido: 0, numeroVentas: 0 });
  const [ventasMayores, setVentasMayores] = useState([]);

  // Carga los reportes que no dependen de filtros.
  const cargar = async () => {
    try {
      const [resMas, resInv, resTotal, resMayores] = await Promise.all([
        api.get('/ventas/mas-vendidos'),
        api.get('/productos'),
        api.get('/ventas/total-vendido'),
        api.get('/ventas/mayores')
      ]);
      setMasVendidos(resMas.data);
      setInventario(resInv.data);
      setTotalVendido(resTotal.data);
      setVentasMayores(resMayores.data);
    } catch (err) {
      setError('No se pudieron cargar los reportes');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Consulta de ventas filtradas por fecha.
  const buscarPorFecha = async () => {
    setError('');
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      const { data } = await api.get('/ventas', { params });
      setVentasFecha(data);
    } catch (err) {
      setError('Error al consultar ventas por fecha');
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}

      {/* Indicadores generales */}
      <div className="card">
        <div className="card__header">
          <h2>Resumen general</h2>
          <p className="card__subtitle">Indicadores de todas las ventas registradas.</p>
        </div>
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi__label">Total vendido</div>
            <div className="kpi__value">${totalVendido.totalVendido}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Número de ventas</div>
            <div className="kpi__value">{totalVendido.numeroVentas}</div>
          </div>
        </div>
      </div>

      {/* Ventas por fecha */}
      <div className="card">
        <div className="card__header">
          <h2>Ventas por fecha</h2>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="field">
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div className="actions">
            <button onClick={buscarPorFecha}>Buscar</button>
          </div>
        </div>
        <div className="table-wrap" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Total</th></tr>
            </thead>
            <tbody>
              {ventasFecha.map((v) => (
                <tr key={v._id}>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td>{v.clienteId?.nombre || '—'}</td>
                  <td className="price">${v.total}</td>
                </tr>
              ))}
              {ventasFecha.length === 0 && (
                <tr><td className="empty" colSpan="3">Sin resultados (usa el botón Buscar).</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="card">
        <div className="card__header">
          <h2>Productos más vendidos</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Producto</th><th>Unidades vendidas</th><th>Ingresos</th></tr>
            </thead>
            <tbody>
              {masVendidos.map((p, i) => (
                <tr key={i}>
                  <td>{p.nombre}</td>
                  <td>{p.totalVendido}</td>
                  <td className="price">${p.ingresos}</td>
                </tr>
              ))}
              {masVendidos.length === 0 && (
                <tr><td className="empty" colSpan="3">Aún no hay ventas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ventas mayores a $10,000 */}
      <div className="card">
        <div className="card__header">
          <h2>Ventas mayores a $10,000</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Total</th></tr>
            </thead>
            <tbody>
              {ventasMayores.map((v) => (
                <tr key={v._id}>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td>{v.clienteId?.nombre || '—'}</td>
                  <td className="price">${v.total}</td>
                </tr>
              ))}
              {ventasMayores.length === 0 && (
                <tr><td className="empty" colSpan="3">No hay ventas mayores a $10,000.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventario disponible */}
      <div className="card">
        <div className="card__header">
          <h2>Inventario disponible</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Stock</th></tr>
            </thead>
            <tbody>
              {inventario.map((p) => (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>
                    {p.stock < 5
                      ? <span className="badge badge--low">{p.stock} · bajo</span>
                      : <span className="badge">{p.stock}</span>}
                  </td>
                </tr>
              ))}
              {inventario.length === 0 && (
                <tr><td className="empty" colSpan="3">No hay productos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reportes;
