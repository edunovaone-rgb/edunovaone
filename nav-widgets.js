// nav-widgets.js — Búsqueda global + Notificaciones para el navbar unificado
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection, query, where, orderBy, limit,
  getDocs, updateDoc, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase (reutiliza instancia si ya fue inicializada por auth-nav.js) ──
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

// ══════════════════════════════════════════════════
//  BÚSQUEDA GLOBAL
// ══════════════════════════════════════════════════

// Sugerencias estáticas (atajos de navegación)
const QUICK_LINKS = [
  { icon: '📚', label: 'Biblioteca',     href: 'biblioteca.html' },
  { icon: '🎮', label: 'Juegos',          href: 'juegos.html' },
  { icon: '🛠️', label: 'Herramientas',   href: 'herramientas.html' },
  { icon: '👥', label: 'Comunidad',       href: 'comunidad.html' },
  { icon: '🏠', label: 'Inicio',          href: 'index.html' },
  { icon: '👤', label: 'Mi Perfil',       href: 'perfil.html' },
];

// Catálogo de páginas para búsqueda local
const PAGE_CATALOG = [
  { icon: '∑',  label: 'Matemática 1°',    href: 'grado-1.html',    tags: ['matematica','aritmetica','numeros'] },
  { icon: '⚗️', label: 'Ciencias 1°',      href: 'grado-1.html',    tags: ['ciencia','celula','ecosistema'] },
  { icon: '📖', label: 'Comunicación',      href: 'biblioteca.html', tags: ['comunicacion','lectura','gramatica'] },
  { icon: '🏛️', label: 'Historia',          href: 'biblioteca.html', tags: ['historia','geografia','economia'] },
  { icon: '🇬🇧', label: 'Inglés',           href: 'biblioteca.html', tags: ['ingles','english'] },
  { icon: '💻', label: 'Tecnología',        href: 'biblioteca.html', tags: ['tecnologia','computacion'] },
  { icon: '🧪', label: 'Grupo Ciencias',    href: 'grupo-ciencias.html',      tags: ['ciencias','grupo','foro'] },
  { icon: '📝', label: 'Grupo Comunicación',href: 'grupo-comunicacion.html',  tags: ['comunicacion','grupo','foro'] },
  { icon: '🔢', label: 'Grupo Matemática',  href: 'grupo-matematica.html',    tags: ['matematica','grupo','foro'] },
  { icon: '🌍', label: 'Grupo Historia',    href: 'grupo-historia.html',      tags: ['historia','grupo','foro'] },
  { icon: '🎮', label: 'Juego Matemática',  href: 'juego-matematica.html',    tags: ['juego','matematica'] },
  { icon: '🧬', label: 'Juego Ciencias',    href: 'juego-ciencia.html',       tags: ['juego','ciencia'] },
  { icon: '🗣️', label: 'Juego Comunicación',href: 'juego-comunicacion.html',  tags: ['juego','comunicacion'] },
];

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

  const input     = overlay.querySelector('#gsInput');
  const results   = overlay.querySelector('#gsResults');
  const closeBtn  = overlay.querySelector('.gs-close-btn');
  const backdrop  = overlay.querySelector('.gs-backdrop');

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

    // Filtrar catálogo
    const matched = PAGE_CATALOG.filter(p =>
      p.label.toLowerCase().includes(term) ||
      p.tags.some(t => t.includes(term))
    );

    // Siempre ofrecer buscar en Biblioteca
    const bibHref = `biblioteca.html?q=${encodeURIComponent(q)}`;

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
        <li><a href="${bibHref}" class="gs-item gs-item-primary">
          <span class="gs-item-icon">📚</span>
          <span class="gs-item-label">Buscar "<strong>${escHtml(q)}</strong>" en Biblioteca</span>
          <span class="gs-item-arrow">→</span>
        </a></li>
      </ul>`;

    results.innerHTML = html;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Eventos
  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlay();
    if (e.key === 'Enter' && input.value.trim()) {
      window.location.href = `biblioteca.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  renderQuickLinks();
  return overlay;
}

function openSearch() {
  const overlay = document.getElementById('globalSearchOverlay') || buildSearchOverlay();
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
      <div class="notif-empty">Cargando…</div>
    </div>`;

  document.body.appendChild(panel);

  document.getElementById('notifMarkAll').addEventListener('click', () => markAllRead());

  // Cerrar al click fuera
  document.addEventListener('click', e => {
    const btn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('notif-open');
    }
  }, true);
}

function positionNotifPanel() {
  const btn   = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  const panel = document.getElementById('notifPanel');
  if (!btn || !panel) return;

  const rect = btn.getBoundingClientRect();
  panel.style.top  = (rect.bottom + 8) + 'px';
  panel.style.right = (window.innerWidth - rect.right) + 'px';
}

function toggleNotifPanel() {
  buildNotifPanel();
  const panel = document.getElementById('notifPanel');
  positionNotifPanel();
  panel.classList.toggle('notif-open');
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
        <p class="notif-item-title">${escHtml2(n.title || '')}</p>
        <p class="notif-item-text">${escHtml2(n.message || '')}</p>
        <span class="notif-item-time">${timeAgo(n.createdAt)}</span>
      </div>
      ${!n.read ? '<span class="notif-dot"></span>' : ''}
    </div>`).join('');
}

function escHtml2(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeAgo(ts) {
  if (!ts) return '';
  const d   = ts.toDate ? ts.toDate() : new Date(ts);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)   return 'Ahora mismo';
  if (sec < 3600) return `Hace ${Math.floor(sec/60)} min`;
  if (sec < 86400)return `Hace ${Math.floor(sec/3600)} h`;
  return `Hace ${Math.floor(sec/86400)} días`;
}

function setBadge(count) {
  let badge = document.getElementById('notifBadge');
  const btn  = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (!btn) return;

  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'notifBadge';
    badge.setAttribute('aria-label', 'notificaciones sin leer');
    // Posicionar el badge relativo al botón
    btn.style.position = 'relative';
    btn.appendChild(badge);
  }

  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

async function markAllRead() {
  const uid = _auth.currentUser?.uid;
  if (!uid) return;

  const q = query(
    collection(_db, 'usuarios', uid, 'notificaciones'),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  const promises = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(promises);
}

function subscribeNotifications(uid) {
  if (_notifUnsub) { _notifUnsub(); _notifUnsub = null; }

  buildNotifPanel();

  const q = query(
    collection(_db, 'usuarios', uid, 'notificaciones'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  _notifUnsub = onSnapshot(q, snap => {
    const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const unread = notifs.filter(n => !n.read).length;
    setBadge(unread);
    renderNotifications(notifs);
  }, () => {
    // Sin permiso o sin notificaciones — mostrar estado vacío
    setBadge(0);
    const list = document.getElementById('notifList');
    if (list) list.innerHTML = `<div class="notif-empty">
      <span style="font-size:2rem;">🔔</span>
      <p>Sin notificaciones</p>
    </div>`;
  });
}

// ══════════════════════════════════════════════════
//  INIT — conectar botones del navbar
// ══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Overlay de búsqueda (construir en el DOM desde el inicio)
  buildSearchOverlay();

  // Botón lupa
  const searchBtn = document.querySelector('.uni-icon-btn[aria-label="Buscar"]');
  if (searchBtn) searchBtn.addEventListener('click', openSearch);

  // Botón notificaciones
  const notifBtn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (notifBtn) notifBtn.addEventListener('click', toggleNotifPanel);

  // Auth → suscribir notificaciones si hay sesión
  onAuthStateChanged(_auth, user => {
    if (user) {
      subscribeNotifications(user.uid);
    } else {
      if (_notifUnsub) { _notifUnsub(); _notifUnsub = null; }
      setBadge(0);
      const list = document.getElementById('notifList');
      if (list) list.innerHTML = `<div class="notif-empty">
        <span style="font-size:2rem;">🔔</span>
        <p>Inicia sesión para ver tus notificaciones</p>
      </div>`;
    }
  });
});
