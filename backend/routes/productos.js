const express = require('express');
const Producto = require('../models/Producto');

const router = express.Router();

/**
 * GET /productos/stock-bajo
 * Consulta avanzada: productos con stock menor a 5.
 * IMPORTANTE: esta ruta debe declararse ANTES de "/:id" para que Express
 * no la confunda con un id.
 */
router.get('/stock-bajo', async (req, res) => {
  try {
    const productos = await Producto.find({ stock: { $lt: 5 } });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /productos
 * Consulta todos los productos (también sirve como "inventario disponible").
 */
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /productos
 * Crea un producto. Body: { nombre, precio, stock, categoria }
 */
router.post('/', async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /productos/:id
 * Edita un producto existente.
 */
router.put('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // devolver el documento actualizado
      runValidators: true  // aplicar las validaciones del esquema
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /productos/:id
 * Elimina un producto.
 */
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
