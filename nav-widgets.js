// nav-widgets.js — Búsqueda inline + Notificaciones para el navbar unificado
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection, query, where, orderBy, limit,
  getDocs, updateDoc, doc, getDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

function enBiblioteca() {
  return window.location.pathname.includes('biblioteca');
}

// ══════════════════════════════════════════════════
//  DATOS DE SUGERENCIAS
// ══════════════════════════════════════════════════
const QUICK_LINKS = [
  { icon: '📚', label: 'Biblioteca',       href: 'biblioteca.html' },
  { icon: '🎮', label: 'Juegos',            href: 'juegos.html' },
  { icon: '🩺', label: 'Mi Diagnóstico',    href: 'diagnostico.html' },
  { icon: '🛠️', label: 'Herramientas',     href: 'herramientas.html' },
  { icon: '👥', label: 'Comunidad',         href: 'comunidad.html' },
  { icon: '🏠', label: 'Inicio',            href: 'index.html' },
  { icon: '👤', label: 'Mi Perfil',         href: 'perfil.html' },
];

const PAGE_CATALOG = [
  { icon: '∑',  label: 'Matemática 1°',     href: 'grado-1.html',            tags: ['matematica','aritmetica','numeros'] },
  { icon: '⚗️', label: 'Ciencias 1°',       href: 'grado-1.html',            tags: ['ciencia','celula','ecosistema'] },
  { icon: '📖', label: 'Comunicación',       href: 'biblioteca.html',         tags: ['comunicacion','lectura','gramatica'] },
  { icon: '🏛️', label: 'Historia',           href: 'biblioteca.html',         tags: ['historia','geografia','economia'] },
  { icon: '🇬🇧', label: 'Inglés',            href: 'biblioteca.html',         tags: ['ingles','english'] },
  { icon: '💻', label: 'Tecnología',         href: 'biblioteca.html',         tags: ['tecnologia','computacion'] },
  { icon: '🧪', label: 'Grupo Ciencias',     href: 'grupo-ciencias.html',     tags: ['ciencias','grupo','foro'] },
  { icon: '📝', label: 'Grupo Comunicación', href: 'grupo-comunicacion.html', tags: ['comunicacion','grupo','foro'] },
  { icon: '🔢', label: 'Grupo Matemática',   href: 'grupo-matematica.html',   tags: ['matematica','grupo','foro'] },
  { icon: '🌍', label: 'Grupo Historia',     href: 'grupo-historia.html',     tags: ['historia','grupo','foro'] },
  { icon: '🎮', label: 'Juego Matemática',   href: 'juego-matematica.html',   tags: ['juego','matematica'] },
  { icon: '🧬', label: 'Juego Ciencias',     href: 'juego-ciencia.html',      tags: ['juego','ciencia'] },
  { icon: '🗣️', label: 'Juego Comunicación', href: 'juego-comunicacion.html', tags: ['juego','comunicacion'] },
  { icon: '🩺', label: 'Mi Diagnóstico',     href: 'diagnostico.html',        tags: ['diagnostico','nivel','progreso','evaluacion'] },
  { icon: '🩺', label: 'Diagnóstico Matemática',   href: 'diagnostico-matematica.html',   tags: ['diagnostico','matematica','test'] },
  { icon: '🩺', label: 'Diagnóstico Ciencias',     href: 'diagnostico-ciencias.html',     tags: ['diagnostico','ciencias','test'] },
  { icon: '🩺', label: 'Diagnóstico Comunicación', href: 'diagnostico-comunicacion.html', tags: ['diagnostico','comunicacion','test'] },
  { icon: '🩺', label: 'Diagnóstico Historia',     href: 'diagnostico-historia.html',     tags: ['diagnostico','historia','test'] },
  { icon: '🩺', label: 'Diagnóstico Inglés',       href: 'diagnostico-ingles.html',       tags: ['diagnostico','ingles','test'] },
  { icon: '🩺', label: 'Diagnóstico Tecnología',   href: 'diagnostico-tecnologia.html',   tags: ['diagnostico','tecnologia','test'] },
];

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════════
//  BÚSQUEDA — barra expandible inline
// ══════════════════════════════════════════════════

function buildSearchBar() {
  // Reemplazar el botón 🔍 existente por la barra expandible
  const oldBtn = document.querySelector('.uni-icon-btn[aria-label="Buscar"]');
  if (!oldBtn || document.getElementById('navSearchBar')) return;

  const bar = document.createElement('div');
  bar.id = 'navSearchBar';
  bar.className = 'nav-search-bar';
  // Necesita position relative para que el dropdown se ancle aquí
  bar.style.position = 'relative';

  bar.innerHTML = `
    <button class="nav-search-btn" id="navSearchToggle" aria-label="Buscar" aria-expanded="false">🔍</button>
    <input
      type="search"
      id="navSearchInput"
      placeholder="Buscar…"
      autocomplete="off"
      spellcheck="false"
      aria-label="Buscar en EduNovaOne"
    />
    <button class="nav-search-clear" id="navSearchClear" aria-label="Limpiar búsqueda" tabindex="-1">✕</button>
    <div class="nav-search-dropdown" id="navSearchDropdown">
      <div class="nav-search-dropdown-inner" id="navSearchResults"></div>
    </div>`;

  oldBtn.replaceWith(bar);

  const toggle  = bar.querySelector('#navSearchToggle');
  const input   = bar.querySelector('#navSearchInput');
  const clear   = bar.querySelector('#navSearchClear');
  const results = bar.querySelector('#navSearchResults');

  function openBar() {
    bar.classList.add('expanded');
    toggle.setAttribute('aria-expanded', 'true');
    renderQuickLinks();
    setTimeout(() => input.focus(), 50);
  }

  function closeBar() {
    bar.classList.remove('expanded');
    toggle.setAttribute('aria-expanded', 'false');
    input.value = '';
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
      ? `Filtrar "<strong>${escHtml(q)}</strong>" aquí`
      : `Buscar "<strong>${escHtml(q)}</strong>" en Biblioteca`;

    let html = '';
    if (matched.length) {
      html += `<p class="gs-section-label">Páginas</p>
        <ul class="gs-list">
          ${matched.slice(0, 5).map(p => `
            <li><a href="${p.href}" class="gs-item">
              <span class="gs-item-icon">${p.icon}</span>
              <span class="gs-item-label">${p.label}</span>
            </a></li>`).join('')}
        </ul>`;
    }

    html += `<p class="gs-section-label">Buscar</p>
      <ul class="gs-list">
        <li><a class="gs-item gs-item-primary" id="gsActionBtn" style="cursor:pointer;">
          <span class="gs-item-icon">📚</span>
          <span class="gs-item-label">${actionLabel}</span>
          <span class="gs-item-arrow">→</span>
        </a></li>
      </ul>`;

    results.innerHTML = html;

    results.querySelector('#gsActionBtn')?.addEventListener('click', () => doSearch(q));
  }

  function doSearch(term) {
    closeBar();
    if (enBiblioteca() && typeof window._bibSearch === 'function') {
      window._bibSearch(term);
    } else {
      window.location.href = `biblioteca.html?q=${encodeURIComponent(term)}`;
    }
  }

  // Eventos
  toggle.addEventListener('click', () => {
    bar.classList.contains('expanded') ? closeBar() : openBar();
  });

  input.addEventListener('input', () => renderResults(input.value));

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeBar();
    if (e.key === 'Enter' && input.value.trim()) doSearch(input.value.trim());
  });

  clear.addEventListener('click', () => {
    input.value = '';
    input.focus();
    renderQuickLinks();
  });

  // Cerrar al click fuera
  document.addEventListener('click', e => {
    if (!bar.contains(e.target)) closeBar();
  });
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

  // Cerrar al click fuera
  document.addEventListener('click', e => {
    const notifBtn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
    if (!panel.contains(e.target) && (!notifBtn || !notifBtn.contains(e.target))) {
      panel.classList.remove('notif-open');
    }
  });
}

function positionNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const btn   = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (!panel || !btn) return;

  const rect    = btn.getBoundingClientRect();
  const panelW  = Math.min(360, window.innerWidth - 16);
  let   left    = rect.right - panelW;
  if (left < 8) left = rect.left;
  if (left + panelW > window.innerWidth - 8) left = window.innerWidth - panelW - 8;

  panel.style.setProperty('top',   (rect.bottom + 8) + 'px', 'important');
  panel.style.setProperty('left',  left + 'px',              'important');
  panel.style.setProperty('right', 'auto',                   'important');
  panel.style.setProperty('width', panelW + 'px',            'important');
}

function toggleNotifPanel() {
  buildNotifPanel();
  const panel   = document.getElementById('notifPanel');
  const isOpen  = panel.classList.toggle('notif-open');
  if (isOpen) {
    positionNotifPanel();
    // Re-calcular por si el layout cambia al mostrarse (scrollbar, etc.)
    requestAnimationFrame(positionNotifPanel);
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
  const dy  = Math.floor(sec / 86400);
  const wk  = Math.floor(dy / 7);
  const mo  = Math.floor(dy / 30);
  if (sec < 60)    return 'Ahora mismo';
  if (sec < 3600)  return `Hace ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `Hace ${Math.floor(sec / 3600)} h`;
  if (dy === 1)    return 'Ayer';
  if (dy < 7)      return `Hace ${dy} días`;
  if (wk === 1)    return 'Hace 1 semana';
  if (wk < 4)      return `Hace ${wk} semanas`;
  if (mo === 1)    return 'Hace 1 mes';
  return `Hace ${mo} meses`;
}

function setBadge(count) {
  const btn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (!btn) return;
  let badge = document.getElementById('notifBadge');
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'notifBadge';
    btn.style.position = 'relative';
    btn.appendChild(badge);
  }
  badge.textContent   = count > 9 ? '9+' : String(count);
  badge.style.display = count > 0 ? 'flex' : 'none';
}

async function markAllRead() {
  const uid = _auth.currentUser?.uid;
  if (!uid) return;
  try {
    const snap = await getDocs(query(
      collection(_db, 'usuarios', uid, 'notificaciones'),
      where('read', '==', false)
    ));
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

  _notifUnsub = onSnapshot(
    query(
      collection(_db, 'usuarios', uid, 'notificaciones'),
      orderBy('createdAt', 'desc'),
      limit(20)
    ),
    snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBadge(notifs.filter(n => !n.read).length);
      renderNotifications(notifs);
    },
    _err => showNotifEmpty('Sin notificaciones')
  );
}

// ══════════════════════════════════════════════════
//  USER PILL — botón de perfil expandible
// ══════════════════════════════════════════════════

function buildUserPill() {
  const authBtn = document.getElementById('navAuthBtn');
  if (!authBtn || document.getElementById('navUserPill')) return;

  const pill = document.createElement('div');
  pill.id = 'navUserPill';
  pill.className = 'nav-user-pill';
  pill.setAttribute('role', 'button');
  pill.setAttribute('aria-haspopup', 'true');
  pill.setAttribute('aria-expanded', 'false');
  pill.innerHTML = `
    <div class="nav-user-icon" id="navUserIcon">👤</div>
    <div class="nav-user-label" id="navUserLabel">
      <strong id="navUserName">—</strong>
    </div>
    <div class="nav-user-dropdown" id="navUserDropdown">
      <a href="perfil.html" id="navDropPerfil">👤 Mi Perfil</a>
      <a href="diagnostico.html">🩺 Mi Diagnóstico</a>
      <a href="index.html">🏠 Inicio</a>
      <div class="dropdown-divider"></div>
      <button class="dropdown-danger" id="navDropLogout">🚪 Cerrar sesión</button>
    </div>`;

  authBtn.replaceWith(pill);

  // Toggle al click en el pill (pero no en el dropdown)
  pill.addEventListener('click', e => {
    if (document.getElementById('navUserDropdown')?.contains(e.target)) return;
    const open = pill.classList.toggle('expanded');
    pill.setAttribute('aria-expanded', String(open));
  });

  // Cerrar al click fuera
  document.addEventListener('click', e => {
    if (!pill.contains(e.target)) {
      pill.classList.remove('expanded');
      pill.setAttribute('aria-expanded', 'false');
    }
  });

  // Cerrar sesión
  document.getElementById('navDropLogout')?.addEventListener('click', async () => {
    try { await _auth.signOut(); } catch (_) {}
    window.location.href = 'login.html';
  });
}

// Actualizar el pill con los datos del usuario (llamado desde onAuthStateChanged)
function updateUserPill(user, firestoreData) {
  const pill  = document.getElementById('navUserPill');
  const icon  = document.getElementById('navUserIcon');
  const name  = document.getElementById('navUserName');
  const logout = document.getElementById('navDropLogout');
  if (!pill) return;

  if (user) {
    const displayFirst = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';
    const username     = firestoreData?.username || null;

    // Foto o inicial
    if (user.photoURL) {
      icon.innerHTML = `<img src="${user.photoURL}" alt="avatar"
        style="width:1.6rem;height:1.6rem;border-radius:999px;object-fit:cover;display:block;">`;
    } else {
      icon.textContent = displayFirst[0]?.toUpperCase() || '👤';
      icon.style.cssText = `font-size:0.88rem;font-weight:800;color:var(--accent-strong);
        width:1.6rem;height:1.6rem;min-width:1.6rem;
        display:flex;align-items:center;justify-content:center;
        background:rgba(99,102,241,0.15);border-radius:999px;flex-shrink:0;`;
    }

    name.textContent = displayFirst;
    if (logout) logout.style.display = '';
  } else {
    icon.textContent = '👤';
    icon.style.cssText = '';
    name.textContent = 'Entrar';
    if (logout) logout.style.display = 'none';

    pill.onclick = e => {
      if (document.getElementById('navUserDropdown')?.contains(e.target)) return;
      window.location.href = 'login.html';
    };
  }
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  buildSearchBar();
  buildNotifPanel();
  buildUserPill();

  const notifBtn = document.querySelector('.uni-icon-btn[aria-label="Notificaciones"]');
  if (notifBtn) notifBtn.addEventListener('click', toggleNotifPanel);

  onAuthStateChanged(_auth, async user => {
    if (user) {
      let fsData = null;
      try {
        const snap = await getDoc(doc(_db, 'usuarios', user.uid));
        if (snap.exists()) fsData = snap.data();
      } catch (_) {}

      updateUserPill(user, fsData);
      subscribeNotifications(user.uid);
    } else {
      if (_notifUnsub) { _notifUnsub(); _notifUnsub = null; }
      updateUserPill(null, null);
      showNotifEmpty('Inicia sesión para ver tus notificaciones');
      setBadge(0);
    }
  });
});
