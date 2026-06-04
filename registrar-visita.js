/**
 * registrar-visita.js — EduNovaOne
 * Script standalone que registra la visita actual en el historial localStorage.
 * Se incluye como <script src="registrar-visita.js"> en cada página de tema.
 * Lee los meta-tags enu:* del <head> para obtener los datos del recurso.
 */
(function () {
  const KEY = 'enu_historial';
  const MAX = 50;

  function getMeta(name) {
    const el = document.querySelector('meta[name="' + name + '"]');
    return el ? el.getAttribute('content') : '';
  }

  const titulo  = getMeta('enu:titulo')  || document.title.split('|')[0].trim();
  const materia = getMeta('enu:materia') || '';
  const grado   = getMeta('enu:grado')   || '';
  const icono   = getMeta('enu:icono')   || 'doc';
  const id      = location.pathname.replace(/\.html$/, '').split('/').pop();

  if (!titulo) return;

  try {
    let hist = JSON.parse(localStorage.getItem(KEY) || '[]');
    hist = hist.filter(function(e) { return e.id !== id; });
    hist.unshift({ id: id, titulo: titulo, materia: materia, grado: grado, icono: icono, ts: Date.now() });
    if (hist.length > MAX) hist = hist.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(hist));
  } catch(e) {}
})();
