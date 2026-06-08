import axios from 'axios';

/**
 * Instancia de axios apuntando a la API.
 * La app está pensada para correr SOLO en producción (Render + Vercel),
 * por eso la URL base por defecto es el backend público de Render.
 * Se puede sobreescribir con la variable de entorno REACT_APP_API_URL.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://sistema-web-de-ventas.onrender.com'
});

export default api;
