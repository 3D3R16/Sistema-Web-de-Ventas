import axios from 'axios';

/**
## Instancia de axios apuntando a la API.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://sistema-web-de-ventas.onrender.com'
});

export default api;
