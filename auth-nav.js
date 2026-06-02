// auth-nav.js — actualiza el botón del navbar según sesión Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

let _presenceInterval = null;

onAuthStateChanged(_auth, async (user) => {
  const btn = document.getElementById('navAuthBtn');
  if (!btn) return;

  // Limpiar intervalo anterior si el usuario cambia
  if (_presenceInterval) { clearInterval(_presenceInterval); _presenceInterval = null; }

  if (user) {
    const displayFirst = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';

    // Actualizar lastSeen y leer username en paralelo
    const ref = doc(_db, 'usuarios', user.uid);
    // setDoc con merge garantiza que funciona aunque no exista el doc aún
    // y también sincroniza el nombre de Auth → Firestore para que otros usuarios lo vean
    const updatePayload = { lastSeen: Date.now() };
    if (user.displayName) updatePayload.nombre = user.displayName;
    import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js")
      .then(({ setDoc }) => setDoc(ref, updatePayload, { merge: true }))
      .catch(() => {});

    // Refrescar lastSeen cada 2 minutos para mantener el estado "Activo"
    _presenceInterval = setInterval(() => {
      updateDoc(ref, { lastSeen: Date.now() }).catch(() => {});
    }, 2 * 60 * 1000);

    let username = null;
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) username = snap.data().username || null;
    } catch (_) {}

    if (username) {
      btn.innerHTML = `
        <span style="display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;gap:1px;">
          <span style="font-size:0.88rem;font-weight:700;">👤 ${displayFirst}</span>
          <span style="font-size:0.72rem;font-weight:500;opacity:0.75;">@${username}</span>
        </span>`;
    } else {
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
