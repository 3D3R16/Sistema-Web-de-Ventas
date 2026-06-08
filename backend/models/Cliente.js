const mongoose = require('mongoose');

// Documento de la colección "clientes": { nombre, email, telefono }
const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String },
  telefono: { type: String }
});

module.exports = mongoose.model('Cliente', clienteSchema, 'clientes');
