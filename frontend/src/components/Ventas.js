import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Módulo Ventas:
 * - Selecciona un cliente.
 * - Agrega varios productos al carrito.
 * - Calcula el total automáticamente.
 * - Registra la venta (el backend descuenta stock) y genera un ticket.
 */
function Ventas() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState('');

  // Selección actual del formulario.
  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Carrito: lista de líneas { productoId, nombre, precio, cantidad }.
  const [carrito, setCarrito] = useState([]);

  // Última venta registrada (para mostrar el ticket).
  const [ticket, setTicket] = useState(null);

  // Carga inicial de datos.
  const cargar = async () => {
    try {
      const [resClientes, resProductos, resVentas] = await Promise.all([
        api.get('/clientes'),
        api.get('/productos'),
        api.get('/ventas')
      ]);
      setClientes(resClientes.data);
      setProductos(resProductos.data);
      setVentas(resVentas.data);
    } catch (err) {
      setError('No se pudieron cargar los datos');
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Agrega el producto seleccionado al carrito.
  const agregarAlCarrito = () => {
    setError('');
    const producto = productos.find((p) => p._id === productoId);
    if (!producto) {
      setError('Selecciona un producto');
      return;
    }
    const cant = Number(cantidad);
    if (cant <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (cant > producto.stock) {
      setError(`Stock insuficiente (disponible: ${producto.stock})`);
      return;
    }

    // Si el producto ya está en el carrito, sumamos la cantidad.
    const existente = carrito.find((l) => l.productoId === productoId);
    if (existente) {
      setCarrito(carrito.map((l) =>
        l.productoId === productoId ? { ...l, cantidad: l.cantidad + cant } : l
      ));
    } else {
      setCarrito([
        ...carrito,
        { productoId, nombre: producto.nombre, precio: producto.precio, cantidad: cant }
      ]);
    }
    setProductoId('');
    setCantidad(1);
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter((l) => l.productoId !== id));
  };

  // Total calculado automáticamente en el frontend (el backend lo recalcula también).
  const total = carrito.reduce((suma, l) => suma + l.precio * l.cantidad, 0);

  // Registra la venta.
  const registrarVenta = async () => {
    setError('');
    if (!clienteId) { setError('Selecciona un cliente'); return; }
    if (carrito.length === 0) { setError('Agrega al menos un producto'); return; }

    try {
      const body = {
        clienteId,
        productos: carrito.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad }))
      };
      const { data } = await api.post('/ventas', body);
      setTicket(data);       // mostramos el ticket
      setCarrito([]);        // vaciamos el carrito
      setClienteId('');
      cargar();              // refrescamos stock y lista de ventas
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la venta');
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card__header">
          <h2>Nueva venta</h2>
          <p className="card__subtitle">Selecciona un cliente y agrega productos al carrito.</p>
        </div>

        {/* Selección de cliente */}
        <div className="form-grid">
          <div className="field">
            <label>Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">-- Selecciona --</option>
              {clientes.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Agregar productos al carrito */}
        <div className="form-grid" style={{ marginTop: '12px' }}>
          <div className="field">
            <label>Producto</label>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">-- Selecciona --</option>
              {productos.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombre} (${p.precio}) - stock: {p.stock}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>
          <div className="actions">
            <button className="btn-secondary" onClick={agregarAlCarrito}>Agregar al carrito</button>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {/* Carrito */}
        <h3 className="section-title" style={{ marginTop: '20px' }}>Detalle de la venta</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              {carrito.map((l) => (
                <tr key={l.productoId}>
                  <td>{l.nombre}</td>
                  <td className="price">${l.precio}</td>
                  <td>{l.cantidad}</td>
                  <td className="price">${l.precio * l.cantidad}</td>
                  <td>
                    <div className="actions">
                      <button className="btn-danger btn-sm" onClick={() => quitarDelCarrito(l.productoId)}>Quitar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {carrito.length === 0 && (
                <tr><td className="empty" colSpan="5">Carrito vacío.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="total-bar">
          <span className="total-bar__label">Total</span>
          <span className="total-bar__value">${total}</span>
        </div>

        <div className="actions" style={{ marginTop: '14px' }}>
          <button onClick={registrarVenta}>Registrar venta</button>
        </div>
      </div>

      {/* Ticket de la última venta */}
      {ticket && (
        <div className="ticket">
          <h3>🧾 Ticket de venta</h3>
          <p className="ticket__brand">TechStore</p>
          <p className="ticket__meta">Fecha: {new Date(ticket.fecha).toLocaleString()}</p>
          <p className="ticket__meta">Cliente: {ticket.clienteId?.nombre}</p>
          <hr />
          {ticket.productos.map((l, i) => (
            <div className="ticket__line" key={i}>
              <span>{l.productoId?.nombre || 'Producto'} x {l.cantidad}</span>
              <span>${l.precio * l.cantidad}</span>
            </div>
          ))}
          <hr />
          <div className="ticket__total">
            <span>TOTAL</span>
            <span>${ticket.total}</span>
          </div>
          <button className="btn-secondary btn-block" style={{ marginTop: '16px' }} onClick={() => setTicket(null)}>
            Cerrar ticket
          </button>
        </div>
      )}

      {/* Historial de ventas */}
      <div className="card">
        <div className="card__header">
          <h2>Historial de ventas</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Total</th></tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v._id}>
                  <td>{new Date(v.fecha).toLocaleDateString()}</td>
                  <td>{v.clienteId?.nombre || '—'}</td>
                  <td>
                    {v.productos.map((l, i) => (
                      <span key={i}>
                        {(l.productoId?.nombre || 'Producto')} x{l.cantidad}{i < v.productos.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </td>
                  <td className="price">${v.total}</td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr><td className="empty" colSpan="4">No hay ventas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Ventas;
