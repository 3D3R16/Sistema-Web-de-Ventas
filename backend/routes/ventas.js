const express = require('express');
const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

const router = express.Router();

/* ============================================================
   CONSULTAS AVANZADAS Y REPORTES
   (deben ir ANTES de las rutas con parámetros)
   ============================================================ */

/**
 * GET /ventas/total-vendido
 * Consulta avanzada con AGGREGATION: suma del total de todas las ventas.
 */
router.get('/total-vendido', async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      {
        $group: {
          _id: null,
          totalVendido: { $sum: '$total' },     // suma de todos los totales
          numeroVentas: { $sum: 1 }             // cantidad de ventas
        }
      }
    ]);
    // Si no hay ventas, devolvemos ceros.
    res.json(resultado[0] || { totalVendido: 0, numeroVentas: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /ventas/mayores
 * Consulta avanzada: ventas mayores a $10,000.
 */
router.get('/mayores', async (req, res) => {
  try {
    const ventas = await Venta.find({ total: { $gt: 10000 } })
      .populate('clienteId', 'nombre email')
      .sort({ total: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /ventas/mas-vendidos
 * Reporte con AGGREGATION: productos más vendidos (por cantidad total).
 */
router.get('/mas-vendidos', async (req, res) => {
  try {
    const resultado = await Venta.aggregate([
      { $unwind: '$productos' }, // separa cada producto de cada venta en su propio documento
      {
        $group: {
          _id: '$productos.productoId',
          totalVendido: { $sum: '$productos.cantidad' },
          ingresos: { $sum: { $multiply: ['$productos.cantidad', '$productos.precio'] } }
        }
      },
      { $sort: { totalVendido: -1 } },
      // Traemos el nombre del producto desde la colección "productos".
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: { path: '$producto', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productoId: '$_id',
          nombre: { $ifNull: ['$producto.nombre', 'Producto eliminado'] },
          totalVendido: 1,
          ingresos: 1
        }
      }
    ]);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================================================
   CRUD DE VENTAS
   ============================================================ */

/**
 * GET /ventas
 * Lista todas las ventas. Acepta filtro opcional por fecha (reporte
 * "ventas por fecha") mediante los query params ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD.
 */
router.get('/', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const filtro = {};

    if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) {
        // Incluimos todo el día "hasta" sumando 24h.
        const fin = new Date(hasta);
        fin.setHours(23, 59, 59, 999);
        filtro.fecha.$lte = fin;
      }
    }

    const ventas = await Venta.find(filtro)
      .populate('clienteId', 'nombre email')
      .populate('productos.productoId', 'nombre')
      .sort({ fecha: -1 });

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /ventas
 * Crea una venta.
 * Body: { clienteId, productos: [{ productoId, cantidad }] }
 *  - Calcula el total automáticamente usando el precio actual de cada producto.
 *  - Descuenta el stock de cada producto.
 *  - Valida que haya stock suficiente antes de registrar la venta.
 */
router.post('/', async (req, res) => {
  try {
    const { clienteId, productos } = req.body;

    if (!clienteId || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'La venta necesita un cliente y al menos un producto' });
    }

    let total = 0;
    const detalle = [];

    // Primer recorrido: validar stock y calcular el total.
    for (const item of productos) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.productoId} no encontrado` });
      }
      const cantidad = Number(item.cantidad);
      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ error: `Cantidad inválida para ${producto.nombre}` });
      }
      if (producto.stock < cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`
        });
      }

      total += producto.precio * cantidad;
      detalle.push({ productoId: producto._id, cantidad, precio: producto.precio });
    }

    // Segundo recorrido: descontar stock (solo después de validar todo).
    for (const item of detalle) {
      await Producto.findByIdAndUpdate(item.productoId, { $inc: { stock: -item.cantidad } });
    }

    const venta = new Venta({ clienteId, productos: detalle, total });
    await venta.save();

    // Devolvemos la venta con los datos completos para generar el ticket.
    const ventaCompleta = await Venta.findById(venta._id)
      .populate('clienteId', 'nombre email')
      .populate('productos.productoId', 'nombre');

    res.status(201).json(ventaCompleta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
