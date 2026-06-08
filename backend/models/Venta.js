const mongoose = require('mongoose');

/**
 * Documento de la colección "ventas":
 * {
 *   clienteId,
 *   productos: [{ productoId, cantidad, precio }],
 *   total,
 *   fecha
 * }
 * Se usan referencias (ObjectId + ref) para poder hacer populate y mostrar
 * los nombres del cliente y de los productos en los reportes y el ticket.
 */
const ventaSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  productos: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      cantidad: { type: Number, required: true },
      // Precio unitario en el momento de la venta (histórico).
      precio: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venta', ventaSchema, 'ventas');
