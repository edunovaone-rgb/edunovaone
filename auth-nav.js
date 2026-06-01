// auth-nav.js — actualiza el botón del navbar según sesión Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const _app = initializeApp({
  apiKey: "AIzaSyD4eHOmnHZNNxtnWQAdNfw6vGNC2t9g5eE",
  authDomain: "edunova-library.firebaseapp.com",
  projectId: "edunova-library",
  storageBucket: "edunova-library.firebasestorage.app",
  messagingSenderId: "707176884039",
  appId: "1:707176884039:web:7c2b34c1bfcbdc7ec10e62"
});

const _auth = getAuth(_app);

onAuthStateChanged(_auth, (user) => {
  const btn = document.getElementById('navAuthBtn');
  if (!btn) return;
  if (user) {
    const nombre = user.displayName ? user.displayName.split(' ')[0] : 'Mi cuenta';
    btn.textContent = `👤 ${nombre}`;
    btn.href = 'perfil.html';
    btn.style.background = 'rgba(99,102,241,0.1)';
    btn.style.color = 'var(--accent-strong)';
    btn.style.boxShadow = 'none';
    btn.style.border = '1px solid rgba(99,102,241,0.2)';
  } else {
    btn.textContent = 'Iniciar sesión';
    btn.href = 'login.html';
    btn.style.background = '';
    btn.style.color = '';
    btn.style.boxShadow = '';
    btn.style.border = '';
  }
});
