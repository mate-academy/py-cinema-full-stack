// frontend/src/axios.js
// Mantém compatibilidade com imports existentes:
// - default => a instância axios (api)
// - BASE_URL => a URL base para construir links absolutos quando necessário
export { default } from "./api.js";
export { BASE_URL } from "./api.js";
