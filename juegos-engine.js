// ══════════════════════════════════════════
// juegos-engine.js — EduNovaOne
// Motor de juegos compartido por todas las
// páginas juego-*.html
// ══════════════════════════════════════════

// ── Puntos ──────────────────────────────
const PUNTOS_KEY = 'enu_puntos_hoy';
function getPuntos() {
  try {
    const s = JSON.parse(localStorage.getItem(PUNTOS_KEY) || '{}');
    return s.d === new Date().toDateString() ? (s.p || 0) : 0;
  } catch { return 0; }
}
function addPuntos(n) {
  const p = getPuntos() + n;
  try { localStorage.setItem(PUNTOS_KEY, JSON.stringify({ d: new Date().toDateString(), p })); } catch {}
  const el = document.getElementById('totalPuntos');
  if (el) el.textContent = p;
}

// ── Leer configuración del área desde el DOM ──
const ROOT = document.getElementById('areaRoot');
const AREA    = ROOT ? ROOT.dataset.area    : '';
const COLOR   = ROOT ? ROOT.dataset.color   : 'rgba(99,102,241,0.12)';
const HEX     = ROOT ? ROOT.dataset.colorhex: '#6d28d9';
const ICON    = ROOT ? ROOT.dataset.icon    : '🎮';
const NOMBRE  = ROOT ? ROOT.dataset.nombre  : '';

// ── Estado ──────────────────────────────
let gradoSel = parseInt(localStorage.getItem('edunova_grado') || '1');

