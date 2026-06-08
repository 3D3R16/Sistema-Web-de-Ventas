const express = require('express');
const Cliente = require('../models/Cliente');

const router = express.Router();

/**
 * GET /clientes
 * Consulta todos los clientes.
 */
router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /clientes
 * Registra un cliente. Body: { nombre, email, telefono }
 */
router.post('/', async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /clientes/:id
 * Edita un cliente (necesario para el módulo "editar" del frontend).
 */
router.put('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
