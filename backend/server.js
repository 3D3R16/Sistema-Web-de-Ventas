// Carga las variables de entorno desde el archivo .env (debe ir primero).
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const app = express();

// Conectar a MongoDB Atlas.
conectarDB();


app.use(cors({ origin: 'https://sistema-web-de-ventas.vercel.app' }));

// Permite recibir y leer JSON en el cuerpo de las peticiones.
app.use(express.json());

// ----- Ruta de prueba (health check) -----
app.get('/', (req, res) => {
  res.json({ mensaje: 'API TechStore funcionando 🚀' });
});

// ----- Rutas de la API -----
app.use('/productos', require('./routes/productos'));
app.use('/clientes', require('./routes/clientes'));
app.use('/ventas', require('./routes/ventas'));
// Autenticación: expone /login y /registro en la raíz.
app.use('/', require('./routes/auth'));

// ----- Arranque del servidor -----
// Render asigna el puerto mediante process.env.PORT.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en el puerto ${PORT}`));
