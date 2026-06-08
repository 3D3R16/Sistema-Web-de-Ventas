import axios from 'axios';

/**
 * Instancia de axios apuntando a la API.
 * La URL base se lee de la variable de entorno REACT_APP_API_URL,
 * que en producción (Vercel) debe ser la URL pública de Render.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

export default api;
