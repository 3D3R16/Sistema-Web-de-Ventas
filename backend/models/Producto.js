const mongoose = require('mongoose');

// Documento de la colección "productos": { nombre, precio, stock, categoria }
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  categoria: { type: String, default: 'General' }
});

module.exports = mongoose.model('Producto', productoSchema, 'productos');
