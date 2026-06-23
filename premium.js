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
// trial tiene nivel 2 (igual que plus) — acceso completo durante el periodo de prueba
export const PLAN_NIVEL = { free: 0, esencial: 1, trial: 2, plus: 2, elite: 3 };

export const PLAN_LABELS = {
  free:     { label: '🔓 Free',       color: '#64748b' },
  trial:    { label: '🎁 Free Trial', color: '#059669' },
  esencial: { label: '🌱 Esencial',   color: '#0d9488' },
  plus:     { label: '⚡ Plus',        color: '#7c3aed' },
  elite:    { label: '👑 Élite',       color: '#d97706' },
};

/**
 * Devuelve { user, plan, userData, trialExpired } para el usuario actual.
 * plan es: 'free' | 'trial' | 'esencial' | 'plus' | 'elite'
 * Si el trial venció, plan se devuelve como 'free' y trialExpired = true.
 * Si no hay sesión, user = null y plan = 'free'
 */
export function getUserPlan() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(_auth, async (user) => {
      unsub();
      if (!user) { resolve({ user: null, plan: 'free', userData: null, trialExpired: false }); return; }
      try {
        const snap = await getDoc(doc(_db, 'usuarios', user.uid));
        const data = snap.exists() ? snap.data() : {};
        let plan = (typeof data.plan === 'string') ? data.plan.toLowerCase().trim() : 'free';
        let trialExpired = false;

        // Verificar si el trial venció
        if (plan === 'trial' && data.trialFin) {
          const fin = new Date(data.trialFin);
          if (Date.now() > fin.getTime()) {
            plan = 'free';
            trialExpired = true;
          }
        }

        resolve({ user, plan, userData: data, trialExpired });
      } catch {
        resolve({ user, plan: 'free', userData: null, trialExpired: false });
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

/** true si el plan es trial */
export function isTrial(plan) {
  return plan === 'trial';
}

/**
 * Devuelve los días restantes del free trial, o null si no aplica.
 * @param {object} userData — datos del documento de Firestore
 */
export function trialDiasRestantes(userData) {
  if (!userData || !userData.trialFin) return null;
  const diff = new Date(userData.trialFin).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Muestra un mini-banner de bloqueo dentro de un contenedor.
 * @param {HTMLElement} container    — el elemento donde se inyecta
 * @param {string}      requiredPlan — 'esencial' | 'plus' | 'elite'
 * @param {boolean}     loggedIn     — si el usuario tiene sesión
 * @param {boolean}     trialUsado   — si ya usó el free trial
 */
export function renderPremiumBanner(container, requiredPlan = 'plus', loggedIn = true, trialUsado = false) {
  const planInfo = PLAN_LABELS[requiredPlan] || PLAN_LABELS['plus'];
  const href = loggedIn ? 'planes.html' : 'login.html';
  const showTrial = loggedIn && !trialUsado;
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
      ${showTrial ? `
      <a href="planes.html" style="
        display:inline-block;
        padding:.75rem 1.75rem;
        background:linear-gradient(135deg,#059669,#047857);
        color:#fff;font-weight:800;font-size:.92rem;
        border-radius:1.25rem;text-decoration:none;
        box-shadow:0 6px 18px rgba(5,150,105,0.32);
        transition:transform .18s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">🎁 Prueba gratis 7 días</a>` : ''}
      <a href="${href}" style="
        display:inline-block;
        padding:.75rem 1.75rem;
        background:${showTrial ? 'transparent' : 'linear-gradient(135deg,#7c3aed,#4f46e5)'};
        color:${showTrial ? '#7c3aed' : '#fff'};font-weight:800;font-size:.92rem;
        border-radius:1.25rem;text-decoration:none;
        ${showTrial ? 'border:2px solid rgba(99,102,241,0.25);' : 'box-shadow:0 8px 24px rgba(99,102,241,0.32);'}
        transition:transform .18s;
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">${ctaText}</a>
    </div>`;
}
