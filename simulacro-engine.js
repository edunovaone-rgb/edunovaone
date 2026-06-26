/**
 * simulacro-engine.js  —  EduNovaOne Pre-u
 * Uso: llamar initSimulacro(PREGUNTAS) después de cargar este script.
 * El div #simApp debe tener:
 *   data-total   = minutos totales (ej. "60")
 *   data-titulo  = nombre del simulacro
 *   data-num     = número (ej. "01")
 *   data-color   = color hex del simulacro
 */
function initSimulacro(preguntas) {
  const appEl   = document.getElementById('simApp');
  const MINS    = parseInt(appEl.dataset.total, 10);
  const TITULO  = appEl.dataset.titulo;
  const NUM     = appEl.dataset.num;
  const COLOR   = appEl.dataset.color || '#7c3aed';
  const TOTAL   = preguntas.length;
  const SECS    = MINS * 60;

  document.documentElement.style.setProperty('--sim-color', COLOR);

  // ── PANTALLA INTRODUCCIÓN ───────────────────────────────────────────
  appEl.outerHTML = `
  <div id="simApp">
    <div class="page-content">

      <!-- INTRO -->
      <div class="sim-intro" id="simIntro">
        <nav style="font-size:.9rem">
          <a href="preu.html#simulacros" style="color:var(--accent-strong);text-decoration:none;font-weight:600">← Volver a Pre-u</a>
        </nav>
        <div class="sim-intro-header">
          <div class="sim-intro-num">${NUM}</div>
          <h1>${TITULO}</h1>
        </div>
        <div class="sim-intro-meta">
          <span class="sim-meta-pill">📝 ${TOTAL} preguntas</span>
          <span class="sim-meta-pill">⏱ ${MINS} min</span>
          <span class="sim-meta-pill">🎓 Nivel Pre-u</span>
        </div>
        <p>Este simulacro sigue el formato de los exámenes de admisión universitaria. Tienes <strong>${MINS} minutos</strong> para responder <strong>${TOTAL} preguntas</strong>. Cada pregunta tiene una sola respuesta correcta.</p>
        <ul class="sim-rules">
          <li><span>⏱</span>El tiempo corre desde que presiones <em>Iniciar</em> — no puede pausarse.</li>
          <li><span>✅</span>Selecciona una opción y presiona <em>Siguiente</em>. Puedes revisar tus respuestas al final.</li>
          <li><span>📊</span>Al terminar verás tu puntaje por área y las respuestas correctas.</li>
          <li><span>💡</span>Si el tiempo se agota, el examen se envía automáticamente.</li>
        </ul>
        <button class="sim-start-btn" id="simStartBtn">🚀 Iniciar simulacro</button>
      </div>

      <!-- EXAMEN -->
      <div class="sim-exam" id="simExam">
        <div class="sim-topbar">
          <span class="sim-topbar-title">${NUM} · ${TITULO}</span>
          <div class="sim-progress-wrap">
            <div class="sim-progress-bar-track">
              <div class="sim-progress-bar-fill" id="simProgressFill" style="width:0%"></div>
            </div>
            <span class="sim-progress-label" id="simProgressLabel">Pregunta 1 de ${TOTAL}</span>
          </div>
          <div class="sim-timer" id="simTimer">⏱ ${String(MINS).padStart(2,'0')}:00</div>
        </div>
        <div id="simQuestionArea"></div>
        <div class="sim-nav">
          <button class="sim-nav-btn secondary" id="simPrevBtn" disabled>← Anterior</button>
          <span id="simNavStatus" style="font-size:.82rem;color:var(--text-muted);font-weight:600"></span>
          <button class="sim-nav-btn primary" id="simNextBtn">Siguiente →</button>
        </div>
      </div>

      <!-- RESULTADOS -->
      <div class="sim-results" id="simResults">
        <nav style="font-size:.9rem">
          <a href="preu.html#simulacros" style="color:var(--accent-strong);text-decoration:none;font-weight:600">← Volver a Pre-u</a>
        </nav>
        <div style="text-align:center;display:flex;flex-direction:column;gap:.5rem;align-items:center">
          <div class="sim-score-circle" id="simScoreCircle">
            <div class="sim-score-text">
              <strong id="simScorePct">—</strong>
              <span>puntaje</span>
            </div>
          </div>
          <h2 style="margin:.75rem 0 0;font-size:1.4rem;color:var(--accent-strong)" id="simResultTitle">Examen completado</h2>
          <p style="margin:0;color:var(--text-muted);font-size:.9rem" id="simResultMsg"></p>
        </div>
        <div class="sim-result-row" id="simResultRow"></div>
        <div>
          <h3 style="margin:0 0 .85rem;font-size:1rem;font-weight:700;color:var(--accent-strong)">Puntaje por área</h3>
          <div class="sim-area-breakdown" id="simAreaBreakdown"></div>
        </div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
          <a href="preu.html#simulacros" class="sim-nav-btn secondary" style="text-decoration:none;padding:.75rem 1.5rem;">Ver todos los simulacros</a>
          <button class="sim-nav-btn primary" id="simRetryBtn">🔄 Reintentar</button>
        </div>
        <div>
          <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;color:var(--accent-strong)">Revisión de respuestas</h3>
          <div id="simReview" style="display:grid;gap:1rem"></div>
        </div>
      </div>

    </div>
  </div>`;

  // Referencias
  const intro     = document.getElementById('simIntro');
  const examEl    = document.getElementById('simExam');
  const results   = document.getElementById('simResults');
  const startBtn  = document.getElementById('simStartBtn');
  const prevBtn   = document.getElementById('simPrevBtn');
  const nextBtn   = document.getElementById('simNextBtn');
  const qArea     = document.getElementById('simQuestionArea');
  const timerEl   = document.getElementById('simTimer');
  const progressF = document.getElementById('simProgressFill');
  const progressL = document.getElementById('simProgressLabel');
  const navStatus = document.getElementById('simNavStatus');

  // Estado
  let current  = 0;
  let answers  = new Array(TOTAL).fill(null);  // índice respuesta elegida
  let secsLeft = SECS;
  let timerInt = null;
  let finished = false;

  // ── TIMER ──────────────────────────────────────────────────────────
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `⏱ ${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }
  function startTimer() {
    timerInt = setInterval(() => {
      secsLeft--;
      timerEl.textContent = formatTime(secsLeft);
      if (secsLeft <= 300 && secsLeft > 60)  { timerEl.className = 'sim-timer warning'; }
      if (secsLeft <= 60)                    { timerEl.className = 'sim-timer danger'; }
      if (secsLeft <= 0) { clearInterval(timerInt); finishExam(); }
    }, 1000);
  }

  // ── RENDERIZAR PREGUNTA ─────────────────────────────────────────────
  const LETTERS = ['A','B','C','D'];
  function renderQuestion(idx) {
    const p = preguntas[idx];
    const answered = answers[idx] !== null;
    progressF.style.width = ((idx + 1) / TOTAL * 100) + '%';
    progressL.textContent = `Pregunta ${idx + 1} de ${TOTAL}`;
    navStatus.textContent = answers.filter(a => a !== null).length + ' respondidas';
    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === TOTAL - 1 ? '✅ Finalizar' : 'Siguiente →';

    qArea.innerHTML = `
      <div class="sim-question-card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap">
          <span class="sim-question-num">Pregunta ${idx + 1} / ${TOTAL}</span>
          <span class="sim-area-label">📌 ${p.area}</span>
        </div>
        <p class="sim-question-text">${p.q}</p>
        <div class="sim-options" id="simOptions">
          ${p.op.map((o, i) => `
            <div class="sim-opt${answers[idx] === i ? ' selected' : ''}" data-i="${i}" role="button" tabindex="0">
              <span class="sim-opt-letter">${LETTERS[i]}</span>${o}
            </div>`).join('')}
        </div>
      </div>`;

    document.querySelectorAll('.sim-opt').forEach(el => {
      el.addEventListener('click', () => selectOption(idx, parseInt(el.dataset.i)));
      el.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') selectOption(idx, parseInt(el.dataset.i)); });
    });
  }

  function selectOption(qIdx, optIdx) {
    if (finished) return;
    answers[qIdx] = optIdx;
    renderQuestion(qIdx);
  }

  // ── NAVEGACIÓN ──────────────────────────────────────────────────────
  prevBtn.addEventListener('click', () => { if (current > 0) { current--; renderQuestion(current); } });
  nextBtn.addEventListener('click', () => {
    if (current < TOTAL - 1) { current++; renderQuestion(current); }
    else finishExam();
  });

  // ── INICIO ──────────────────────────────────────────────────────────
  startBtn.addEventListener('click', () => {
    intro.style.display = 'none';
    examEl.classList.add('active');
    renderQuestion(0);
    startTimer();
  });

  // ── FINALIZAR ───────────────────────────────────────────────────────
  function finishExam() {
    if (finished) return;
    finished = true;
    clearInterval(timerInt);
    examEl.classList.remove('active');
    showResults();
  }

  function showResults() {
    results.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let correct = 0;
    const areaMap = {};  // area → {correct, total}

    preguntas.forEach((p, i) => {
      if (!areaMap[p.area]) areaMap[p.area] = { correct: 0, total: 0 };
      areaMap[p.area].total++;
      if (answers[i] === p.r) { correct++; areaMap[p.area].correct++; }
    });

    const pct = Math.round(correct / TOTAL * 100);
    document.getElementById('simScoreCircle').style.setProperty('--pct', pct + '%');
    document.getElementById('simScorePct').textContent = pct + '%';

    // ── Registrar resultado para diagnóstico ──
    if (typeof window._enuEvalRegistrar === 'function') {
      const areaKey = (TITULO || '').toLowerCase().includes('matem') ? 'matematica'
        : (TITULO || '').toLowerCase().includes('cien')  ? 'ciencia'
        : (TITULO || '').toLowerCase().includes('comuni') ? 'comunicacion'
        : (TITULO || '').toLowerCase().includes('histo')  ? 'historia'
        : (TITULO || '').toLowerCase().includes('ingl')   ? 'ingles'
        : (TITULO || '').toLowerCase().includes('tecno')  ? 'tecnologia'
        : 'simulacro';
      window._enuEvalRegistrar({ area: areaKey, grado: parseInt(localStorage.getItem('edunova_grado') || 5), tipo: 'simulacro', score: correct, scoreMax: TOTAL, correctas: correct, total: TOTAL });
    }

    // Título motivador
    let title, msg;
    if (pct >= 85)      { title = '🏆 Excelente resultado'; msg = 'Estás muy bien preparado/a. ¡Sigue así!'; }
    else if (pct >= 65) { title = '👍 Buen trabajo';        msg = 'Vas por buen camino. Refuerza las áreas débiles.'; }
    else if (pct >= 45) { title = '📚 Hay que estudiar más'; msg = 'Repasa los temas en los que fallaste antes del próximo simulacro.'; }
    else                { title = '💪 No te rindas';         msg = 'Este resultado es un diagnóstico. ¡Ahora sabes dónde concentrarte!'; }
    document.getElementById('simResultTitle').textContent = title;
    document.getElementById('simResultMsg').textContent   = msg;

    // Stats
    const timeUsed = SECS - secsLeft;
    const mm = Math.floor(timeUsed / 60), ss = timeUsed % 60;
    document.getElementById('simResultRow').innerHTML = `
      <div class="sim-result-stat"><strong>${correct}</strong><span>Correctas</span></div>
      <div class="sim-result-stat"><strong>${TOTAL - correct}</strong><span>Incorrectas</span></div>
      <div class="sim-result-stat"><strong>${answers.filter(a=>a===null).length}</strong><span>Sin responder</span></div>
      <div class="sim-result-stat"><strong>${mm}:${String(ss).padStart(2,'0')}</strong><span>Tiempo usado</span></div>`;

    // Por área
    const breakdown = document.getElementById('simAreaBreakdown');
    breakdown.innerHTML = Object.entries(areaMap).map(([area, data]) => {
      const p2 = Math.round(data.correct / data.total * 100);
      return `<div class="sim-area-row">
        <span class="sim-area-row-name">${area}</span>
        <div class="sim-area-row-bar-wrap"><div class="sim-area-row-bar-fill" style="width:${p2}%"></div></div>
        <span class="sim-area-row-pct">${p2}%</span>
      </div>`;
    }).join('');

    // Revisión de cada pregunta
    const reviewEl = document.getElementById('simReview');
    reviewEl.innerHTML = preguntas.map((p, i) => {
      const userAns = answers[i];
      const isCorrect = userAns === p.r;
      const status = userAns === null ? '⬜ Sin responder' : isCorrect ? '✅ Correcto' : '❌ Incorrecto';
      return `
        <div style="background:#fff;border:1.5px solid ${isCorrect ? 'rgba(16,185,129,0.2)' : userAns===null ? 'rgba(148,163,184,0.2)' : 'rgba(239,68,68,0.2)'};border-radius:1.25rem;padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:.75rem">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;flex-wrap:wrap">
            <span style="font-size:.78rem;font-weight:700;color:var(--text-muted)">Pregunta ${i+1} · ${p.area}</span>
            <span style="font-size:.78rem;font-weight:700">${status}</span>
          </div>
          <p style="margin:0;font-size:.92rem;font-weight:600;color:var(--text);line-height:1.6">${p.q}</p>
          ${p.op.map((o, j) => `
            <div style="display:flex;align-items:center;gap:.65rem;padding:.6rem .9rem;border-radius:.85rem;font-size:.87rem;
              background:${j===p.r ? 'rgba(16,185,129,0.1)' : j===userAns && !isCorrect ? 'rgba(239,68,68,0.08)' : 'transparent'};
              border:1px solid ${j===p.r ? 'rgba(16,185,129,0.25)' : j===userAns && !isCorrect ? 'rgba(239,68,68,0.2)' : 'transparent'};
              font-weight:${j===p.r ? '700' : '400'}">
              <span style="width:1.6rem;height:1.6rem;border-radius:.4rem;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;flex-shrink:0;
                background:${j===p.r ? '#10b981' : j===userAns && !isCorrect ? '#ef4444' : 'rgba(99,102,241,0.1)'};
                color:${j===p.r || (j===userAns && !isCorrect) ? '#fff' : 'var(--accent-strong)'}">
                ${['A','B','C','D'][j]}</span>
              ${o}
            </div>`).join('')}
        </div>`;
    }).join('');

    document.getElementById('simRetryBtn').addEventListener('click', () => location.reload());
  }
}
