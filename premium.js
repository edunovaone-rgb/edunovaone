// premium.js — Módulo compartido para verificar plan del usuario
// Uso: import { getUserPlan, isPlanPago, canAccess } from './premium.js'

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Jerarquía de planes (mayor índice = más acceso)
export const PLAN_NIVEL = { free: 0, esencial: 1, plus: 2, elite: 3 };

export const PLAN_LABELS = {
  free:     { label: '🔓 Free',       color: '#64748b' },
  esencial: { label: '🌱 Esencial',   color: '#0d9488' },
  plus:     { label: '⚡ Plus',        color: '#7c3aed' },
  elite:    { label: '👑 Élite',       color: '#d97706' },
};

/**
 * Devuelve { user, plan, userData } para el usuario actual.
 * plan es: 'free' | 'esencial' | 'plus' | 'elite'
 * Si no hay sesión, user = null y plan = 'free'
 */
export function getUserPlan() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(_auth, async (user) => {
      unsub();
      if (!user) { resolve({ user: null, plan: 'free', userData: null }); return; }
      try {
        const snap = await getDoc(doc(_db, 'usuarios', user.uid));
        const data = snap.exists() ? snap.data() : {};
        const plan = (typeof data.plan === 'string') ? data.plan.toLowerCase().trim() : 'free';
        resolve({ user, plan, userData: data });
      } catch {
        resolve({ user, plan: 'free', userData: null });
      }
    });
  });
}

/** true si el plan del usuario es igual o superior al requerido */
export function canAccess(userPlan, requiredPlan) {
  return (PLAN_NIVEL[userPlan] ?? 0) >= (PLAN_NIVEL[requiredPlan] ?? 0);
}

/** true si tiene cualquier plan de pago */
export function isPlanPago(plan) {
  return canAccess(plan, 'esencial');
}

/**
 * Muestra un mini-banner de bloqueo dentro de un contenedor.
 * @param {HTMLElement} container  — el elemento donde se inyecta
 * @param {string}      requiredPlan — 'esencial' | 'plus' | 'elite'
 * @param {boolean}     loggedIn   — si el usuario tiene sesión
 */
export function renderPremiumBanner(container, requiredPlan = 'plus', loggedIn = true) {
  const planInfo = PLAN_LABELS[requiredPlan] || PLAN_LABELS['plus'];
  const href = loggedIn ? 'planes.html' : 'login.html';
  const ctaText = loggedIn ? `🚀 Ver planes` : '🔑 Iniciar sesión';
  const msg = loggedIn
    ? `Esta función requiere el plan <strong>${planInfo.label}</strong> o superior.`
    : 'Inicia sesión y activa un plan para acceder a esta función.';

  container.innerHTML = `
    <div style="
      display:flex;flex-direction:column;align-items:center;gap:1.1rem;
      padding:2.5rem 1.5rem;text-align:center;
      background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(37,99,235,0.04));
      border:1.5px dashed rgba(99,102,241,0.25);
      border-radius:1.5rem;
    ">
      <div style="
        width:60px;height:60px;border-radius:50%;
        background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1));
        border:2px solid rgba(99,102,241,0.2);
        display:flex;align-items:center;justify-content:center;font-size:1.6rem;
      ">🔒</div>
      <div style="
        display:inline-flex;align-items:center;gap:.4rem;
        background:linear-gradient(135deg,#7c3aed,#4f46e5);
        color:#fff;font-size:.75rem;font-weight:800;
        text-transform:uppercase;letter-spacing:.1em;
        padding:.3rem .9rem;border-radius:999px;
      ">${planInfo.label}</div>
      <p style="margin:0;color:#334155;font-size:.95rem;line-height:1.65;max-width:380px;">${msg}</p>
      <a href="${href}" style="
        display:inline-block;
        padding:.85rem 2rem;
        background:linear-gradient(135deg,#7c3aed,#4f46e5);
        color:#fff;font-weight:800;font-size:.95rem;
        border-radius:1.25rem;text-decoration:none;
        box-shadow:0 8px 24px rgba(99,102,241,0.32);
        transition:transform .18s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">${ctaText}</a>
    </div>`;
}
