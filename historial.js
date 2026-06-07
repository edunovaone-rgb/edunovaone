/**
 * historial.js — EduNovaOne
 * Gestión del historial de recursos visitados con localStorage.
 *
 * Estructura de cada entrada:
 * {
 *   id:      string  — URL del recurso (única)
 *   titulo:  string  — Nombre del libro/tema
 *   materia: string  — Matemática, Ciencias, etc.
 *   grado:   string  — "1° Secundaria", etc.
 *   icono:   string  — emoji
 *   ts:      number  — timestamp
 * }
 *
 * La biblioteca muestra los últimos 5.
 * El perfil muestra los últimos 10.
 * El historial completo no tiene límite de visualización.
 */

const KEY = 'enu_historial';
const MAX_STORED = 50; // máximo que guardamos en localStorage

/** Obtiene el historial completo (más reciente primero) */
export function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

/** Guarda el historial */
function setHistorial(arr) {
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
}

/**
 * Registra una visita a un recurso.
 * Si ya existía, lo mueve al principio (más reciente).
 */
export function registrarVisita({ id, titulo, materia, grado, icono }) {
  let hist = getHistorial();
  // Quitar si ya existía
  hist = hist.filter(e => e.id !== id);
  // Añadir al inicio
  hist.unshift({ id, titulo, materia, grado, icono, ts: Date.now() });
  // Recortar a MAX_STORED
  if (hist.length > MAX_STORED) hist = hist.slice(0, MAX_STORED);
  setHistorial(hist);
}

/**
 * Devuelve los últimos `n` elementos del historial.
 */
export function getRecientes(n = 5) {
  return getHistorial().slice(0, n);
}

/**
 * Borra todo el historial.
 */
export function limpiarHistorial() {
  setHistorial([]);
}

/**
 * Formatea un timestamp como texto relativo ("Hace 5 min", "Ayer", etc.)
 */
export function tiempoRelativo(ts) {
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  const wk   = Math.floor(d / 7);
  const mo   = Math.floor(d / 30);
  if (min < 1)  return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  if (h < 24)   return `Hace ${h} h`;
  if (d === 1)  return 'Ayer';
  if (d < 7)    return `Hace ${d} días`;
  if (wk === 1) return 'Hace 1 semana';
  if (wk < 4)   return `Hace ${wk} semanas`;
  if (mo === 1) return 'Hace 1 mes';
  return `Hace ${mo} meses`;
}
