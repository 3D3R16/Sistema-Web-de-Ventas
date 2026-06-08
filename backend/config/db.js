const mongoose = require('mongoose');
const dns = require('dns');

// El formato mongodb+srv:// necesita resolver un registro DNS SRV.
// En algunas redes/equipos Node usa como DNS 127.0.0.1, que rechaza esa
// consulta (error "querySrv ECONNREFUSED"). Forzamos un DNS público para
// que la resolución funcione siempre.
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Conecta la aplicación a MongoDB Atlas.
 * La cadena de conexión se lee desde la variable de entorno MONGODB_URI,
 * así nunca queda escrita directamente en el código (buena práctica de seguridad).
 */
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    // Si no hay base de datos, detenemos el proceso.
    process.exit(1);
  }
};

module.exports = conectarDB;
