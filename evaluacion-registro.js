/**
 * evaluacion-registro.js — EduNovaOne
 * Registra y consulta los resultados de evaluaciones (quizzes, simulacros, etc.)
 * Almacenamiento: localStorage  clave → 'enu_eval_resultados'
 *
 * Estructura de cada resultado:
 * {
 *   id:        string  — clave única (area-grado-tipo-timestamp)
 *   area:      string  — 'matematica', 'ciencia', 'historia', 'comunicacion', 'ingles', 'tecnologia'
 *   areaNombre:string  — Nombre legible, ej. 'Matemática'
 *   grado:     number  — 1-5
 *   tipo:      string  — 'quiz', 'quiz2', 'vf', 'simulacro', 'diagnostico', etc.
 *   tipoLabel: string  — Etiqueta legible, ej. 'Quiz Principal'
 *   score:     number  — Puntos obtenidos
 *   scoreMax:  number  — Puntos máximos posibles
 *   correctas: number  — Respuestas correctas
 *   total:     number  — Total de preguntas
 *   pct:       number  — Porcentaje de aciertos (0-100)
 *   ts:        number  — timestamp Date.now()
 * }
 */

const EVAL_KEY  = 'enu_eval_resultados';
const EVAL_MAX  = 200; // máximo almacenado

const AREA_NOMBRES = {
  matematica:   'Matemática',
  ciencia:      'Ciencias',
  historia:     'Historia',
  comunicacion: 'Comunicación',
  ingles:       'Inglés',
  tecnologia:   'Tecnología',
};

const TIPO_LABELS = {
  quiz:        'Quiz Principal',
  quiz2:       'Quiz Relámpago',
  vf:          'Verdadero o Falso',
  ahorcado:    'Ahorcado',
  relaciona:   'Relaciona Columnas',
  ordenar:     'Ordena los Pasos',
  memoria:     'Memoria',
  flashcards:  'Flashcards',
  formulas:    'Completa la Fórmula',
  simulacro:   'Simulacro',
  diagnostico: 'Diagnóstico',
};

/** Obtiene todos los resultados (más reciente primero) */
export function getResultados() {
  try { return JSON.parse(localStorage.getItem(EVAL_KEY) || '[]'); } catch { return []; }
}

/** Guarda el array de resultados */
function setResultados(arr) {
  try { localStorage.setItem(EVAL_KEY, JSON.stringify(arr)); } catch {}
}

/**
 * Registra un nuevo resultado de evaluación.
 * @param {object} datos
 */
export function registrarResultado({ area, grado, tipo, score, scoreMax, correctas, total }) {
  const pct = total > 0 ? Math.round((correctas / total) * 100) : Math.round((score / scoreMax) * 100);
  const entrada = {
    id:         `${area}-${grado}-${tipo}-${Date.now()}`,
    area,
    areaNombre: AREA_NOMBRES[area] || area,
    grado:      Number(grado),
    tipo,
    tipoLabel:  TIPO_LABELS[tipo] || tipo,
    score:      Number(score),
    scoreMax:   Number(scoreMax),
    correctas:  Number(correctas),
    total:      Number(total),
    pct,
    ts:         Date.now(),
  };
  let resultados = getResultados();
  resultados.unshift(entrada);
  if (resultados.length > EVAL_MAX) resultados = resultados.slice(0, EVAL_MAX);
  setResultados(resultados);
  return entrada;
}

/**
 * Retorna estadísticas consolidadas por área.
 * @returns {object} mapa area → { intentos, mejorPct, promedioPct, ultimaFecha, ultimoPct }
 */
export function getEstadisticasPorArea() {
  const resultados = getResultados();
  const mapa = {};

  resultados.forEach(r => {
    if (!mapa[r.area]) {
      mapa[r.area] = {
        area:         r.area,
        areaNombre:   r.areaNombre,
        intentos:     0,
        mejorPct:     0,
        sumaPct:      0,
        ultimaFecha:  0,
        ultimoPct:    0,
        ultGrado:     r.grado,
        ultTipo:      r.tipoLabel,
        correctasTotal: 0,
        preguntasTotal: 0,
      };
    }
    const s = mapa[r.area];
    s.intentos++;
    s.sumaPct      += r.pct;
    s.correctasTotal += r.correctas;
    s.preguntasTotal += r.total;
    if (r.pct > s.mejorPct) s.mejorPct = r.pct;
    if (r.ts > s.ultimaFecha) {
      s.ultimaFecha = r.ts;
      s.ultimoPct   = r.pct;
      s.ultGrado    = r.grado;
      s.ultTipo     = r.tipoLabel;
    }
  });

  // Calcular promedios
  Object.values(mapa).forEach(s => {
    s.promedioPct = s.intentos > 0 ? Math.round(s.sumaPct / s.intentos) : 0;
  });

  return mapa;
}

/**
 * Retorna los últimos N resultados, opcionalmente filtrados por área.
 */
export function getRecientesEval(n = 10, area = null) {
  let r = getResultados();
  if (area) r = r.filter(e => e.area === area);
  return r.slice(0, n);
}

/**
 * Borra todos los resultados de evaluaciones.
 */
export function limpiarResultados() {
  setResultados([]);
}

/**
 * Formatea un timestamp como texto relativo.
 */
export function tiempoRelativoEval(ts) {
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (min < 1)  return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  if (h < 24)   return `Hace ${h} h`;
  if (d === 1)  return 'Ayer';
  if (d < 7)    return `Hace ${d} días`;
  return new Date(ts).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

/**
 * Devuelve el nivel de dominio según el porcentaje.
 */
export function getNivelDominio(pct) {
  if (pct >= 85) return { label: 'Excelente',  color: '#10b981', emoji: '🏆', bg: 'rgba(16,185,129,0.1)'  };
  if (pct >= 70) return { label: 'Bueno',       color: '#3b82f6', emoji: '👍', bg: 'rgba(59,130,246,0.1)'  };
  if (pct >= 50) return { label: 'Regular',     color: '#f59e0b', emoji: '📚', bg: 'rgba(245,158,11,0.1)'  };
  if (pct >= 30) return { label: 'Mejorable',   color: '#ef4444', emoji: '⚠️', bg: 'rgba(239,68,68,0.1)'   };
  return           { label: 'Inicial',      color: '#6b7280', emoji: '🌱', bg: 'rgba(107,114,128,0.1)' };
}
