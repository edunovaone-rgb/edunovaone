// auth-nav.js — actualiza el botón del navbar según sesión Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const _app = initializeApp({
  apiKey: "AIzaSyD4eHOmnHZNNxtnWQAdNfw6vGNC2t9g5eE",
  authDomain: "edunova-library.firebaseapp.com",
  projectId: "edunova-library",
  storageBucket: "edunova-library.firebasestorage.app",
  messagingSenderId: "707176884039",
  appId: "1:707176884039:web:7c2b34c1bfcbdc7ec10e62"
});

const _auth = getAuth(_app);
const _db   = getFirestore(_app);

onAuthStateChanged(_auth, async (user) => {
  const btn = document.getElementById('navAuthBtn');
  if (!btn) return;

  if (user) {
    // Actualizar lastSeen en cada carga de página
    try {
      const { getFirestore, doc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const db  = getFirestore(_app);
      const ref = doc(db, 'usuarios', user.uid);
      updateDoc(ref, { lastSeen: Date.now() }).catch(() => {});

      // Leer username
      const snap = await getDoc(ref);
      const username = snap.exists() ? (snap.data().username || null) : null;

      // Nombre de display como fallback
      const displayFirst = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';

      if (username) {
        btn.innerHTML = `
          <span style="display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;gap:1px;">
            <span style="font-size:0.88rem;font-weight:700;">👤 ${displayFirst}</span>
            <span style="font-size:0.72rem;font-weight:500;opacity:0.75;">@${username}</span>
          </span>`;
      } else {
        btn.textContent = `👤 ${displayFirst}`;
      }
    } catch (_) {
      const displayFirst = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';
      btn.textContent = `👤 ${displayFirst}`;
    }

    btn.href = 'perfil.html';
    btn.style.background = 'rgba(99,102,241,0.1)';
    btn.style.color = 'var(--accent-strong)';
    btn.style.boxShadow = 'none';
    btn.style.border = '1px solid rgba(99,102,241,0.2)';
    btn.style.padding = '0.45rem 1rem';
  } else {
    btn.textContent = 'Iniciar sesión';
    btn.href = 'login.html';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.boxShadow = '';
    btn.style.border = '';
    btn.style.padding = '';
  }
});
