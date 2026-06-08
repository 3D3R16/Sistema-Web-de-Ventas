const mongoose = require('mongoose');

// Documento de la colección "usuarios": { nombre, email, password }
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // La contraseña se guarda cifrada con bcrypt (ver routes/auth.js).
  password: { type: String, required: true }
});

// El tercer argumento fuerza el nombre exacto de la colección en Atlas.
module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
