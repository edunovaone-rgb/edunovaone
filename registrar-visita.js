/**
 * registrar-visita.js — EduNovaOne
 * Se incluye en cada página de tema (tema-*.html y libro-*.html).
 * Lee los meta-tags del documento y registra la visita en el historial.
 *
 * Meta-tags requeridos en el <head> de la página de tema:
 *   <meta name="enu:titulo"  content="Aritmética Básica" />
 *   <meta name="enu:materia" content="Matemática" />
 *   <meta name="enu:grado"   content="1° Secundaria" />
 *   <meta name="enu:icono"   content="📐" />
 */

import { registrarVisita } from './historial.js';

(function () {
  const getMeta = name => {
    const el = document.querySelector(`meta[name="${name}"]`);
    return el ? el.getAttribute('content') : '';
  };

  const titulo  = getMeta('enu:titulo')  || document.title.split('|')[0].trim();
  const materia = getMeta('enu:materia') || '';
  const grado   = getMeta('enu:grado')   || '';
  const icono   = getMeta('enu:icono')   || '📄';
  const id      = location.pathname.replace(/\.html$/, '').split('/').pop();

  if (titulo) {
    registrarVisita({ id, titulo, materia, grado, icono });
  }
})();
