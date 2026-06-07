// nav-widgets.js — Búsqueda global + Notificaciones para el navbar unificado
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection, query, where, orderBy, limit,
  getDocs, updateDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase (reutiliza instancia si ya existe) ──
const _cfg = {
  apiKey: "AIzaSyD4eHOmnHZNNxtnWQAdNfw6vGNC2t9g5eE",
  authDomain: "edunova-library.firebaseapp.com",
  projectId: "edunova-library",
  storageBucket: "edunova-library.firebasestorage.app",
  messagingSenderId: "707176884039",
  appId: "1:707176884039:web:7c2b34c1bfcbdc7ec10e62"
};
const _app  = getApps().length ? getApps()[0] : initializeApp(_cfg);
const _auth = getAuth(_app);
const _db   = getFirestore(_app);

// Detectar si ya estamos en biblioteca
function enBiblioteca() {
  return window.location.pathname.includes('biblioteca');
}

// ══════════════════════════════════════════════════
//  BÚSQUEDA GLOBAL
// ══════════════════════════════════════════════════

const QUICK_LINKS = [
  { icon: '📚', label: 'Biblioteca',      href: 'biblioteca.html' },
  { icon: '🎮', label: 'Juegos',           href: 'juegos.html' },
  { icon: '🛠️', label: 'Herramientas',    href: 'herramientas.html' },
  { icon: '👥', label: 'Comunidad',        href: 'comunidad.html' },
  { icon: '🏠', label: 'Inicio',           href: 'index.html' },
  { icon: '👤', label: 'Mi Perfil',        href: 'perfil.html' },
];

const PAGE_CATALOG = [
  { icon: '∑',  label: 'Matemática 1°',     href: 'grado-1.html',             tags: ['matematica','aritmetica','numeros'] },
  { icon: '⚗️', label: 'Ciencias 1°',       href: 'grado-1.html',             tags: ['ciencia','celula','ecosistema'] },
  { icon: '📖', label: 'Comunicación',       href: 'biblioteca.html',          tags: ['comunicacion','lectura','gramatica'] },
  { icon: '🏛️', label: 'Historia',           href: 'biblioteca.html',          tags: ['historia','geografia','economia'] },
  { icon: '🇬🇧', label: 'Inglés',            href: 'biblioteca.html',          tags: ['ingles','english'] },
  { icon: '💻', label: 'Tecnología',         href: 'biblioteca.html',          tags: ['tecnologia','computacion'] },
  { icon: '🧪', label: 'Grupo Ciencias',     href: 'grupo-ciencias.html',      tags: ['ciencias','grupo','foro'] },
  { icon: '📝', label: 'Grupo Comunicación', href: 'grupo-comunicacion.html',  tags: ['comunicacion','grupo','foro'] },
  { icon: '🔢', label: 'Grupo Matemática',   href: 'grupo-matematica.html',    tags: ['matematica','grupo','foro'] },
  { icon: '🌍', label: 'Grupo Historia',     href: 'grupo-historia.html',      tags: ['historia','grupo','foro'] },
  { icon: '🎮', label: 'Juego Matemática',   href: 'juego-matematica.html',    tags: ['juego','matematica'] },
  { icon: '🧬', label: 'Juego Ciencias',     href: 'juego-ciencia.html',       tags: ['juego','ciencia'] },
  { icon: '🗣️', label: 'Juego Comunicación', href: 'juego-comunicacion.html',  tags: ['juego','comunicacion'] },
];

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function doSearch(term) {
  const overlay = document.getElementById('globalSearchOverlay');
  if (overlay) overlay.classList.remove('gs-open');
  document.body.style.overflow = '';

  if (enBiblioteca() && typeof window._bibSearch === 'function') {
    // Ya estamos en biblioteca: filtrar en la misma página
    window._bibSearch(term);
  } else {
    // Redirigir a biblioteca con el parámetro
    window.location.href = `biblioteca.html?q=${encodeURIComponent(term)}`;
  }
}

function buildSearchOverlay() {
  if (document.getElementById('globalSearchOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'globalSearchOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Búsqueda global');
  overlay.innerHTML = `
    <div class="gs-backdrop"></div>
    <div class="gs-box" role="search">
      <div class="gs-input-row">
        <span class="gs-input-icon">🔍</span>
        <input
          type="search"
          id="gsInput"
          placeholder="Buscar en EduNovaOne…"
          autocomplete="off"
          spellcheck="false"
          aria-label="Buscar en EduNovaOne"
        />
        <button class="gs-close-btn" aria-label="Cerrar búsqueda">✕</button>
      </div>
      <div class="gs-results" id="gsResults" aria-live="polite"></div>
    </div>`;

  document.body.appendChild(overlay);

  const input    = overlay.querySelector('#gsInput');
  const results  = overlay.querySelector('#gsResults');
  const closeBtn = overlay.querySelector('.gs-close-btn');
  const backdrop = overlay.querySelector('.gs-backdrop');

  function closeOverlay() {
    overlay.classList.remove('gs-open');
    document.body.style.overflow = '';
    input.value = '';
    renderQuickLinks();
  }

  function renderQuickLinks() {
    results.innerHTML = `
      <p class="gs-section-label">Accesos rápidos</p>
      <ul class="gs-list">
        ${QUICK_LINKS.map(l => `
          <li><a href="${l.href}" class="gs-item">
            <span class="gs-item-icon">${l.icon}</span>
            <span class="gs-item-label">${l.label}</span>
          </a></li>`).join('')}
      </ul>`;
  }

  function renderResults(q) {
    const term = q.toLowerCase().trim();
    if (!term) { renderQuickLinks(); return; }

    const matched = PAGE_CATALOG.filter(p =>
      p.label.toLowerCase().includes(term) ||
      p.tags.some(t => t.includes(term))
    );

    const actionLabel = enBiblioteca()
      ? `Buscar "<strong>${escHtml(q)}</strong>" en esta página`
      : `Buscar "<strong>${escHtml(q)}</strong>" en Biblioteca`;

    let html = '';
    if (matched.length) {
      html += `<p class="gs-section-label">Páginas relacionadas</p>
        <ul class="gs-list">
          ${matched.map(p => `
            <li><a href="${p.href}" class="gs-item">
              <span class="gs-item-icon">${p.icon}</span>
              <span class="gs-item-label">${p.label}</span>
            </a></li>`).join('')}
        </ul>`;
    }

    html += `<p class="gs-section-label">Buscar recursos</p>
      <ul class="gs-list">
        <li><a class="gs-item gs-item-primary" id="gsActionBtn" style="cursor:pointer;">
          <span class="gs-item-icon">📚</span>
          <span class="gs-item-label">${actionLabel}</span>
          <span class="gs-item-arrow">→</span>
        </a></li>
      </ul>`;

    results.innerHTML = html;

    // Asignar acción al botón de búsqueda
    const actionBtn = results.querySelector('#gsActionBtn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => doSearch(q));
    }
  }

  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlay();
    if (e.key === 'Enter' && input.value.trim()) doSearch(input.value.trim());
  });
  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  renderQuickLinks();
}

function openSearch() {
  if (!document.getElementById('globalSearchOverlay')) buildSearchOverlay();
  const overlay = document.getElementById('globalSearchOverlay');
  overlay.classList.add('gs-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => overlay.querySelector('#gsInput').focus(), 50);
}

// ══════════════════════════════════════════════════
//  NOTIFICACIONES
// ══════════════════════════════════════════════════

let _notifUnsub = null;

function buildNotifPanel() {
  if (document.getElementById('notifPanel')) return;

  const panel = document.createElement('div');
  panel.id = 'notifPanel';
  panel.setAttribute('aria-label', 'Notificaciones');
  panel.innerHTML = `
    <div class="notif-header">
      <strong>Notificaciones</strong>
      <button class="notif-mark-all" id="notifMarkAll" aria-label="Marcar todas como leídas">Marcar todo leído</button>
    </div>
    <div class="notif-list" id="notifList">
      <div class="notif-empty">
        <span style="font-size:2rem;">🔔</span>
        <p>Sin notificaciones</p>
      </div>
    </div>`;

  document.body.appendChild(panel);
  document.getElementById('notifMarkAll').addEventListener('click', markAllRead);

  // Cerrar al click fuera del panel y fuera del botón
  document.addEventListener('click', e => {
    const panel  = document.getElementById('notifPanel');
    const notifBtn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
    if (!panel) return;
    if (!panel.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) {
      panel.classList.remove('notif-open');
    }
  });
}

function positionNotifPanel() {
  const btn   = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  const panel = document.getElementById('notifPanel');
  if (!btn || !panel) return;

  const rect        = btn.getBoundingClientRect();
  const panelWidth  = 360;
  const margin      = 12;

  // Calcular top
  panel.style.top = (rect.bottom + margin) + 'px';

  // Alinear el panel para que no se salga de la pantalla
  // Intentar alinear con el borde derecho del botón
  let right = window.innerWidth - rect.right;
  // Asegurar que el panel no se salga por la izquierda
  if (window.innerWidth - right - panelWidth < margin) {
    right = window.innerWidth - panelWidth - margin;
  }
  // Asegurar que no sea negativo
  right = Math.max(margin, right);

  panel.style.right = right + 'px';
  panel.style.left  = 'auto';
}

function toggleNotifPanel() {
  buildNotifPanel();
  const panel = document.getElementById('notifPanel');
  const isOpen = panel.classList.contains('notif-open');

  if (isOpen) {
    panel.classList.remove('notif-open');
  } else {
    positionNotifPanel();
    panel.classList.add('notif-open');
  }
}

function renderNotifications(notifs) {
  const list = document.getElementById('notifList');
  if (!list) return;

  if (!notifs.length) {
    list.innerHTML = `<div class="notif-empty">
      <span style="font-size:2rem;">🔔</span>
      <p>Sin notificaciones nuevas</p>
    </div>`;
    return;
  }

  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? '' : 'notif-unread'}" data-id="${n.id}">
      <div class="notif-item-icon">${n.icon || '📢'}</div>
      <div class="notif-item-body">
        <p class="notif-item-title">${escHtml(n.title || '')}</p>
        <p class="notif-item-text">${escHtml(n.message || '')}</p>
        <span class="notif-item-time">${timeAgo(n.createdAt)}</span>
      </div>
      ${!n.read ? '<span class="notif-dot"></span>' : ''}
    </div>`).join('');
}

function timeAgo(ts) {
  if (!ts) return '';
  const d   = ts.toDate ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)    return 'Ahora mismo';
  if (sec < 3600)  return `Hace ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `Hace ${Math.floor(sec / 3600)} h`;
  return `Hace ${Math.floor(sec / 86400)} días`;
}

function setBadge(count) {
  const btn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (!btn) return;

  let badge = document.getElementById('notifBadge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'notifBadge';
    badge.setAttribute('aria-label', 'notificaciones sin leer');
    btn.style.position = 'relative';
    btn.appendChild(badge);
  }

  badge.textContent    = count > 9 ? '9+' : String(count);
  badge.style.display  = count > 0 ? 'flex' : 'none';
}

async function markAllRead() {
  const uid = _auth.currentUser?.uid;
  if (!uid) return;
  try {
    const q    = query(collection(_db, 'usuarios', uid, 'notificaciones'), where('read', '==', false));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => updateDoc(d.ref, { read: true })));
  } catch (_) {}
}

function showNotifEmpty(msg) {
  setBadge(0);
  const list = document.getElementById('notifList');
  if (list) list.innerHTML = `<div class="notif-empty">
    <span style="font-size:2rem;">🔔</span>
    <p>${msg}</p>
  </div>`;
}

function subscribeNotifications(uid) {
  if (_notifUnsub) { _notifUnsub(); _notifUnsub = null; }

  buildNotifPanel();

  const q = query(
    collection(_db, 'usuarios', uid, 'notificaciones'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  _notifUnsub = onSnapshot(
    q,
    snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBadge(notifs.filter(n => !n.read).length);
      renderNotifications(notifs);
    },
    _err => {
      // Firestore rechazó (colección vacía o sin regla): mostrar vacío igual
      showNotifEmpty('Sin notificaciones');
    }
  );
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  buildSearchOverlay();
  buildNotifPanel();

  const searchBtn = document.querySelector('.uni-icon-btn[aria-label="Buscar"]');
  if (searchBtn) searchBtn.addEventListener('click', openSearch);

  const notifBtn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (notifBtn) notifBtn.addEventListener('click', toggleNotifPanel);

  // Reposicionar panel al cambiar tamaño
  window.addEventListener('resize', () => {
    const panel = document.getElementById('notifPanel');
    if (panel?.classList.contains('notif-open')) positionNotifPanel();
  });

  onAuthStateChanged(_auth, user => {
    if (user) {
      subscribeNotifications(user.uid);
    } else {
      if (_notifUnsub) { _notifUnsub(); _notifUnsub = null; }
      showNotifEmpty('Inicia sesión para ver tus notificaciones');
      setBadge(0);
    }
  });
});
