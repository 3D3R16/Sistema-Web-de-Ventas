const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const router = express.Router();

/**
 * POST /registro
 * Crea un nuevo usuario. La contraseña se guarda cifrada con bcrypt.
 * Body: { nombre, email, password }
 */
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validación mínima.
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos (nombre, email, password)' });
    }

    // Verificar que el email no esté ya registrado.
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Cifrar la contraseña antes de guardarla.
    const passwordCifrada = await bcrypt.hash(password, 10);

    const usuario = new Usuario({ nombre, email, password: passwordCifrada });
    await usuario.save();

    // Nunca devolvemos la contraseña al cliente.
    res.status(201).json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /login
 * Valida credenciales. Body: { email, password }
 * Devuelve los datos básicos del usuario si las credenciales son correctas.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Comparar la contraseña recibida con la cifrada en la base de datos.
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({ _id: usuario._id, nombre: usuario.nombre, email: usuario.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
