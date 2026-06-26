/**
 * diagnostico-engine.js — EduNovaOne
 * Motor para los tests de diagnóstico por materia.
 * Uso: <div id="diagRoot" data-area="matematica" data-grado="5"></div>
 *      <script src="diagnostico-engine.js"></script>
 */

// ── Registro inline (sin módulo) ──────────────────────────────────────
const _EK = 'enu_eval_resultados';
function _saveResult(area, grado, pct, correctas, total) {
  const NOMBRES = { matematica:'Matemática', ciencia:'Ciencias', comunicacion:'Comunicación', historia:'Historia', ingles:'Inglés', tecnologia:'Tecnología' };
  const e = { id:`${area}-${grado}-diagnostico-${Date.now()}`, area, areaNombre: NOMBRES[area]||area, grado: Number(grado), tipo:'diagnostico', tipoLabel:'Diagnóstico', score: correctas, scoreMax: total, correctas, total, pct, ts: Date.now() };
  try { let a = JSON.parse(localStorage.getItem(_EK)||'[]'); a.unshift(e); if(a.length>200) a=a.slice(0,200); localStorage.setItem(_EK, JSON.stringify(a)); } catch(_){}
}

// ════════════════════════════════════════════════════════════════════════
// BANCO DE DIAGNÓSTICO — 15 preguntas por materia con "tema" etiquetado
// ════════════════════════════════════════════════════════════════════════
const DIAG_BANCO = {

  matematica: [
    // Aritmética
    { t:'Aritmética',    p:'¿Cuál es el MCD de 48 y 36?',                              ops:['6','9','12','18'],              r:2 },
    { t:'Aritmética',    p:'El 35% de 280 es:',                                        ops:['84','96','98','105'],           r:2 },
    { t:'Aritmética',    p:'Simplifica: 144/168',                                      ops:['6/7','7/8','5/6','4/5'],        r:0 },
    // Álgebra
    { t:'Álgebra',       p:'Resuelve: 3x − 7 = 2x + 5',                               ops:['x=10','x=11','x=12','x=13'],   r:2 },
    { t:'Álgebra',       p:'Factoriza: x² − 9',                                        ops:['(x−3)²','(x+3)(x−3)','(x+9)(x−1)','(x−3)(x+1)'], r:1 },
    { t:'Álgebra',       p:'Si f(x)=2x²−3, ¿cuánto es f(−2)?',                        ops:['1','5','−11','7'],              r:1 },
    // Geometría
    { t:'Geometría',     p:'Área de un triángulo con base 10 cm y altura 6 cm:',       ops:['30 cm²','60 cm²','16 cm²','24 cm²'], r:0 },
    { t:'Geometría',     p:'La hipotenusa de un triángulo rectángulo con catetos 6 y 8 mide:', ops:['10','12','14','9'],     r:0 },
    { t:'Geometría',     p:'Volumen de un cilindro con r=5 y h=4 (π≈3):',              ops:['60','150','200','300'],         r:3 },
    // Estadística
    { t:'Estadística',   p:'La mediana de {3, 7, 9, 12, 15} es:',                     ops:['7','9','10','12'],              r:1 },
    { t:'Estadística',   p:'Si P(A)=0.4, entonces P(Aᶜ) vale:',                       ops:['0.4','0.6','1.4','0.04'],       r:1 },
    // Funciones y cálculo
    { t:'Funciones',     p:'La derivada de f(x)=5x³ es:',                              ops:['5x²','15x²','10x³','3x²'],     r:1 },
    { t:'Funciones',     p:'¿Cuál es el dominio de f(x)=1/(x−2)?',                    ops:['x≠0','x≠2','x>2','Todos los reales'], r:1 },
    { t:'Funciones',     p:'∫2x dx =',                                                 ops:['2x²+C','x²+C','x+C','2+C'],    r:1 },
    { t:'Álgebra',       p:'Resuelve el sistema: 2x+y=7, x−y=2 → x=',                ops:['2','3','4','5'],                r:1 },
  ],

  ciencia: [
    // Biología
    { t:'Biología',      p:'¿Qué organelo es la "central energética" de la célula?',   ops:['Ribosoma','Vacuola','Mitocondria','Núcleo'],       r:2 },
    { t:'Biología',      p:'El ADN se replica durante la fase:',                       ops:['Mitosis','Interfase','Meiosis II','Citocinesis'],  r:1 },
    { t:'Biología',      p:'¿Qué tipo de herencia describe la ley de Mendel?',         ops:['Poligénica','Mendeliana','Ligada al sexo','Materna'], r:1 },
    // Química
    { t:'Química',       p:'¿Cuántos moles hay en 44 g de CO₂ (M=44 g/mol)?',         ops:['0.5','1','2','4'],             r:1 },
    { t:'Química',       p:'Un ácido al disolverse en agua libera:',                   ops:['OH⁻','Na⁺','H⁺','Cl⁻'],       r:2 },
    { t:'Química',       p:'El enlace entre dos átomos de carbono en el etino es:',    ops:['Simple','Doble','Triple','Iónico'],                r:2 },
    // Física
    { t:'Física',        p:'Un cuerpo de 5 kg recibe una fuerza de 20 N. Su aceleración es:', ops:['2 m/s²','4 m/s²','10 m/s²','100 m/s²'],   r:1 },
    { t:'Física',        p:'La energía cinética de un cuerpo de 2 kg a 3 m/s es:',    ops:['3 J','6 J','9 J','18 J'],      r:2 },
    { t:'Física',        p:'La velocidad de la luz en el vacío es aproximadamente:',   ops:['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], r:1 },
    // Ecología y medio ambiente
    { t:'Ecología',      p:'El efecto invernadero es causado principalmente por:',     ops:['El oxígeno','El CO₂ y metano','El nitrógeno','El hidrógeno'], r:1 },
    { t:'Ecología',      p:'La biodiversidad se refiere a:',                           ops:['Solo las plantas','Variedad de especies y ecosistemas','Solo los animales','La cantidad de agua'], r:1 },
    // Astronomía
    { t:'Astronomía',    p:'¿Qué es un año luz?',                                      ops:['Un año en Marte','Distancia que recorre la luz en un año','La edad del Sol','La órbita de la Tierra'], r:1 },
    { t:'Astronomía',    p:'La fusión nuclear en el Sol transforma:',                  ops:['Oxígeno en helio','Hidrógeno en helio','Carbono en oxígeno','Helio en hidrógeno'], r:1 },
    // Bioquímica
    { t:'Bioquímica',    p:'Las enzimas son:',                                         ops:['Lípidos catalizadores','Proteínas que aceleran reacciones','Carbohidratos de reserva','Ácidos nucleicos'], r:1 },
    { t:'Biología',      p:'La meiosis produce células con:',                          ops:['El doble de cromosomas','Los mismos cromosomas','La mitad de cromosomas','Cromosomas aleatorios'], r:2 },
  ],

  comunicacion: [
    // Comprensión lectora
    { t:'Comprensión',   p:'La idea principal de un texto es:',                        ops:['La última oración','La oración más larga','La idea que sustenta todo el texto','El título'], r:2 },
    { t:'Comprensión',   p:'Un texto con tesis, argumentos y conclusión es:',          ops:['Narrativo','Descriptivo','Argumentativo','Instructivo'], r:2 },
    { t:'Comprensión',   p:'"Sin embargo" es un conector de:',                         ops:['Adición','Causa','Contraste','Consecuencia'],           r:2 },
    // Gramática
    { t:'Gramática',     p:'En "Juan corrió rápido", la palabra "rápido" es:',         ops:['Adjetivo','Adverbio','Verbo','Sustantivo'],             r:1 },
    { t:'Gramática',     p:'¿Cuál de estas oraciones usa la tilde correctamente?',     ops:['"El" presidente habló','El presidente "él" habló','Él presidente habló','Él habló al presidente'], r:3 },
    { t:'Gramática',     p:'Una oración compuesta tiene:',                             ops:['Un solo verbo','Dos o más verbos','Sin verbos','Solo sustantivos'], r:1 },
    // Literatura
    { t:'Literatura',    p:'César Vallejo es principalmente conocido por su obra:',    ops:['Tradiciones Peruanas','Los ríos profundos','Trilce','La ciudad y los perros'], r:2 },
    { t:'Literatura',    p:'El género narrativo incluye:',                             ops:['Solo poesía','Cuento, novela y fábula','Tragedia y comedia','Solo teatro'], r:1 },
    { t:'Literatura',    p:'"Sus ojos son dos luceros" es una figura de:',             ops:['Símil','Metáfora','Hipérbole','Personificación'],       r:1 },
    // Producción textual
    { t:'Redacción',     p:'La cohesión textual se logra con:',                        ops:['Párrafos largos','Conectores y pronombres','Palabras difíciles','Repetición constante'], r:1 },
    { t:'Redacción',     p:'El propósito del texto expositivo es:',                    ops:['Persuadir','Entretener','Informar con objetividad','Dar instrucciones'], r:2 },
    // Comunicación oral / digital
    { t:'Comunicación',  p:'La huella digital es:',                                    ops:['Tu firma física','El rastro de datos que dejas en internet','Tu documento de identidad','Tu número IP'], r:1 },
    { t:'Comunicación',  p:'En un debate, un argumento válido debe ser:',              ops:['Emocional y personal','Lógico y respaldado por evidencia','Largo y complejo','Agresivo y directo'], r:1 },
    // Lingüística
    { t:'Lingüística',   p:'La intertextualidad ocurre cuando un texto:',              ops:['No tiene fuentes','Hace referencia a otros textos','Usa solo imágenes','Evita citar'], r:1 },
    { t:'Gramática',     p:'¿Cuál es el sujeto de "Los alumnos estudian mucho"?',      ops:['"estudian"','Los alumnos','mucho','toda la oración'], r:1 },
  ],

  historia: [
    // Culturas antiguas
    { t:'Historia Antigua', p:'¿Qué civilización construyó Machu Picchu?',             ops:['Azteca','Maya','Inca','Chimú'],                         r:2 },
    { t:'Historia Antigua', p:'El Tahuantinsuyo se dividía en:',                       ops:['2 suyos','3 suyos','4 suyos','5 suyos'],               r:2 },
    // Colonia
    { t:'Virreinato',    p:'¿En qué año llegó Francisco Pizarro al Perú?',             ops:['1520','1525','1532','1540'],                            r:2 },
    { t:'Virreinato',    p:'La mita colonial era:',                                    ops:['Un impuesto en oro','Trabajo forzado en minas','Un sistema de encomiendas','Un cargo político'], r:1 },
    // Independencia
    { t:'Independencia', p:'¿Quién proclamó la independencia del Perú?',               ops:['Simón Bolívar','José de San Martín','Ramón Castilla','Túpac Amaru II'], r:1 },
    { t:'Independencia', p:'La batalla que consolidó la independencia sudamericana fue:', ops:['Junín','Pichincha','Ayacucho','Chacabuco'],           r:2 },
    // República
    { t:'República',     p:'La "República Aristocrática" en el Perú fue entre 1895 y:', ops:['1910','1915','1919','1925'],                          r:2 },
    { t:'República',     p:'Ramón Castilla abolió la esclavitud en el año:',            ops:['1821','1845','1854','1879'],                           r:2 },
    // Siglo XX
    { t:'Siglo XX',      p:'El gobierno de Juan Velasco Alvarado se caracterizó por:',  ops:['Libre mercado','Reforma agraria y estatismo','Democracia liberal','Apertura al capital extranjero'], r:1 },
    { t:'Siglo XX',      p:'Sendero Luminoso inició su conflicto armado en:',           ops:['1978','1980','1982','1985'],                           r:1 },
    // Contemporáneo
    { t:'Contemporáneo', p:'¿Cuándo cayó el Muro de Berlín?',                          ops:['1985','1987','1989','1991'],                           r:2 },
    { t:'Contemporáneo', p:'La ONU fue fundada en:',                                   ops:['1939','1945','1948','1955'],                           r:1 },
    // Geografía y Economía
    { t:'Geografía',     p:'¿Cuántas regiones naturales tiene el Perú según Javier Pulgar Vidal?', ops:['3','5','6','8'],                          r:3 },
    { t:'Economía',      p:'La globalización integra principalmente:',                  ops:['Solo países ricos','Economías y culturas a nivel mundial','Solo mercados financieros','Solo bloques europeos'], r:1 },
    { t:'Siglo XX',      p:'Fujimori disolvió el Congreso en el autogolpe de:',         ops:['1990','1992','1995','1998'],                           r:1 },
  ],

  ingles: [
    // Grammar
    { t:'Grammar',       p:'Choose the correct form: "She ___ to school every day."',  ops:['go','goes','going','gone'],                            r:1 },
    { t:'Grammar',       p:'Which sentence is in the Past Perfect?',                   ops:['She went home','She had gone home','She was going','She has gone'], r:1 },
    { t:'Grammar',       p:'"If I ___ rich, I would travel the world." (Type 2)',      ops:['am','was','were','will be'],                           r:2 },
    { t:'Grammar',       p:'The passive voice of "They built the bridge" is:',         ops:['The bridge was built','The bridge is built','They were built','Built the bridge'], r:0 },
    // Vocabulary
    { t:'Vocabulary',    p:'What does "ambitious" mean?',                              ops:['Lazy','Wanting success strongly','Shy','Careless'],     r:1 },
    { t:'Vocabulary',    p:'"Procrastinate" means:',                                   ops:['Work hard','Delay tasks','Plan carefully','Finish early'], r:1 },
    { t:'Vocabulary',    p:'Choose the correct word: "The ___ of pollution is a serious concern."', ops:['affect','effect','effort','afford'],       r:1 },
    // Reading
    { t:'Reading',       p:'A "thesis statement" in an essay is:',                     ops:['The conclusion','The main argument of the text','A quote from an author','The title'], r:1 },
    { t:'Reading',       p:'When a text "implies" something, it means:',               ops:['States it directly','Suggests without saying it clearly','Quotes another text','Ignores the topic'], r:1 },
    // Writing
    { t:'Writing',       p:'Which connector shows contrast?',                          ops:['Furthermore','Therefore','However','Moreover'],         r:2 },
    { t:'Writing',       p:'"In conclusion" is used to:',                              ops:['Add information','Introduce a contrast','Summarize and close','Give an example'], r:2 },
    // Advanced
    { t:'Advanced',      p:'A "mixed conditional" combines:',                          ops:['Present+Future','Past+Present result','Past+Past','Future+Future'], r:1 },
    { t:'Advanced',      p:'"The report needs to be submitted" uses:',                 ops:['Active voice','Passive infinitive','Gerund','Modal'],   r:1 },
    { t:'Grammar',       p:'Choose the correct relative pronoun: "The book ___ I read was excellent."', ops:['who','which','whose','whom'],          r:1 },
    { t:'Vocabulary',    p:'"Eclectic" describes something that is:',                  ops:['Boring and uniform','From a variety of sources','Strictly traditional','Completely new'], r:1 },
  ],

  tecnologia: [
    // Hardware y software
    { t:'Hardware',      p:'¿Qué componente procesa las instrucciones del computador?', ops:['RAM','GPU','CPU','HDD'],                               r:2 },
    { t:'Software',      p:'¿Qué es un algoritmo?',                                    ops:['Un lenguaje de programación','Una secuencia ordenada de pasos para resolver un problema','Un dispositivo de entrada','Un tipo de base de datos'], r:1 },
    // Redes
    { t:'Redes',         p:'¿Qué protocolo se usa para navegar de forma segura por internet?', ops:['HTTP','FTP','HTTPS','SMTP'],                   r:2 },
    { t:'Redes',         p:'Una dirección IP sirve para:',                             ops:['Identificar un dispositivo en la red','Guardar contraseñas','Cifrar archivos','Gestionar el tiempo de uso'], r:0 },
    // Programación
    { t:'Programación',  p:'En programación, una variable es:',                        ops:['Un error del código','Un espacio de memoria que almacena un valor','Un tipo de bucle','Una función fija'], r:1 },
    { t:'Programación',  p:'¿Qué hace un bucle "for"?',                               ops:['Toma una decisión','Repite un bloque de código un número determinado de veces','Define una función','Importa una librería'], r:1 },
    { t:'Programación',  p:'El "debugging" es el proceso de:',                         ops:['Diseñar interfaces','Encontrar y corregir errores en el código','Compilar un programa','Documentar el código'], r:1 },
    // Seguridad
    { t:'Seguridad',     p:'El phishing es:',                                          ops:['Un tipo de virus','Un engaño para robar datos personales','Un lenguaje de programación','Una red inalámbrica'], r:1 },
    { t:'Seguridad',     p:'El cifrado de datos sirve para:',                          ops:['Comprimir archivos','Proteger información de accesos no autorizados','Aumentar la velocidad','Formatear discos'], r:1 },
    // Tecnologías emergentes
    { t:'IA y Big Data',  p:'El "Machine Learning" es:',                               ops:['Programar máquinas manualmente','Entrenar modelos para que aprendan de datos','Diseñar circuitos','Reparar hardware'], r:1 },
    { t:'IA y Big Data',  p:'El "Big Data" se refiere a:',                             ops:['Un programa antivirus','Grandes volúmenes de datos que se analizan para obtener información','Una red de computadores','Un tipo de almacenamiento USB'], r:1 },
    // Web
    { t:'Desarrollo Web', p:'HTML es un lenguaje de:',                                 ops:['Programación orientada a objetos','Marcado para estructurar páginas web','Base de datos','Inteligencia artificial'], r:1 },
    { t:'Desarrollo Web', p:'¿Qué hace CSS en una página web?',                        ops:['Define la lógica','Da estilo y diseño visual','Gestiona la base de datos','Crea el servidor'], r:1 },
    // Sociedad y tecnología
    { t:'Sociedad Digital', p:'La huella digital es:',                                 ops:['Tu firma manuscrita','El rastro de datos que dejas al usar internet','Tu contraseña','Tu número de IP fijo'], r:1 },
    { t:'Sociedad Digital', p:'La economía circular en tecnología busca:',             ops:['Producir más rápido','Reducir residuos y reutilizar recursos tecnológicos','Solo exportar equipos','Aumentar costos de producción'], r:1 },
  ],

};

// ════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN POR MATERIA
// ════════════════════════════════════════════════════════════════════════
const DIAG_CONFIG = {
  matematica:   { nombre:'Matemática',   emoji:'📐', color:'#7c3aed', colorBg:'rgba(124,58,237,0.1)',  tiempo:20 },
  ciencia:      { nombre:'Ciencias',     emoji:'🔬', color:'#059669', colorBg:'rgba(16,185,129,0.1)',  tiempo:20 },
  comunicacion: { nombre:'Comunicación', emoji:'📖', color:'#dc2626', colorBg:'rgba(239,68,68,0.1)',   tiempo:18 },
  historia:     { nombre:'Historia',     emoji:'🌍', color:'#d97706', colorBg:'rgba(245,158,11,0.1)',  tiempo:18 },
  ingles:       { nombre:'Inglés',       emoji:'🇬🇧', color:'#2563eb', colorBg:'rgba(59,130,246,0.1)',  tiempo:18 },
  tecnologia:   { nombre:'Tecnología',   emoji:'💻', color:'#7c3aed', colorBg:'rgba(139,92,246,0.1)',  tiempo:18 },
};

// ════════════════════════════════════════════════════════════════════════
// RENDER ENGINE
// ════════════════════════════════════════════════════════════════════════
(function() {
  const root = document.getElementById('diagRoot');
  if (!root) return;
  const AREA   = root.dataset.area;
  const GRADO  = parseInt(root.dataset.grado || localStorage.getItem('edunova_grado') || 5);
  const CFG    = DIAG_CONFIG[AREA];
  const BANCO  = DIAG_BANCO[AREA];
  if (!CFG || !BANCO) { root.innerHTML = '<p>Área no disponible.</p>'; return; }

  const TOTAL_Q = BANCO.length; // 15
  const SECS_Q  = 30; // 30 segundos por pregunta

  // ── Inyectar estilos ─────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    :root { --dc: ${CFG.color}; }
    .dc-intro { background: linear-gradient(135deg, ${CFG.colorBg}, rgba(255,255,255,0)); border-radius:2rem; padding:2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem; }
    .dc-intro-icon { width:5rem;height:5rem;border-radius:1.5rem;background:linear-gradient(135deg,${CFG.color},${CFG.color}cc);color:#fff;font-size:2.2rem;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px ${CFG.color}40; }
    .dc-intro h2 { margin:0;font-size:clamp(1.3rem,2.5vw,1.75rem);color:${CFG.color}; }
    .dc-intro p  { margin:0;color:var(--text-muted);font-size:.92rem;max-width:480px; }
    .dc-meta-pills { display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center; }
    .dc-meta-pill  { padding:.35rem .9rem;border-radius:999px;font-size:.78rem;font-weight:700;background:${CFG.colorBg};color:${CFG.color}; }
    .dc-rules  { background:#fff;border:1px solid rgba(99,102,241,0.1);border-radius:1.5rem;padding:1.25rem 1.5rem;text-align:left;width:100%;max-width:480px;box-sizing:border-box; }
    .dc-rules li { font-size:.87rem;color:var(--text-muted);margin:.35rem 0;display:flex;gap:.5rem;align-items:flex-start; }
    .dc-start-btn { padding:.85rem 2.5rem;border-radius:1rem;border:none;background:linear-gradient(135deg,${CFG.color},${CFG.color}cc);color:#fff;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 6px 20px ${CFG.color}40;transition:transform .15s,box-shadow .15s; }
    .dc-start-btn:hover { transform:translateY(-2px);box-shadow:0 10px 28px ${CFG.color}55; }

    .dc-topbar { display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;padding:.75rem 1rem;background:#fff;border-radius:1.25rem;margin-bottom:1.25rem;box-shadow:0 3px 12px rgba(15,23,42,0.06);position:sticky;top:0.5rem;z-index:10; }
    .dc-topbar-label { font-size:.82rem;font-weight:700;color:${CFG.color}; }
    .dc-prog-wrap { flex:1;height:8px;border-radius:999px;background:rgba(99,102,241,0.08);overflow:hidden;min-width:60px; }
    .dc-prog-fill  { height:100%;border-radius:999px;background:linear-gradient(90deg,${CFG.color},${CFG.color}99);transition:width .4s; }
    .dc-timer  { font-size:.9rem;font-weight:800;padding:.3rem .75rem;border-radius:999px;background:${CFG.colorBg};color:${CFG.color};min-width:3.5rem;text-align:center;transition:background .3s,color .3s; }
    .dc-timer.warn  { background:rgba(245,158,11,0.15);color:#d97706; }
    .dc-timer.danger{ background:rgba(239,68,68,0.15);color:#dc2626; }

    .dc-qcard { background:#fff;border:1px solid rgba(99,102,241,0.1);border-radius:1.75rem;padding:1.75rem;box-shadow:0 8px 28px rgba(15,23,42,0.06);margin-bottom:1rem; }
    .dc-tema-tag { display:inline-block;padding:.2rem .7rem;border-radius:999px;font-size:.72rem;font-weight:700;background:${CFG.colorBg};color:${CFG.color};margin-bottom:.85rem; }
    .dc-question  { font-size:1.05rem;font-weight:600;color:var(--text);line-height:1.6;margin:0 0 1.25rem; }
    .dc-opts { display:grid;gap:.65rem; }
    .dc-opt { display:flex;align-items:center;gap:.85rem;padding:.8rem 1.1rem;border-radius:1rem;border:2px solid rgba(99,102,241,0.1);background:#fff;cursor:pointer;font-size:.9rem;font-weight:500;color:var(--text);transition:border-color .15s,background .15s;text-align:left; }
    .dc-opt:hover:not(:disabled) { border-color:${CFG.color}55;background:${CFG.colorBg}; }
    .dc-opt:disabled { cursor:default; }
    .dc-opt .dc-letter { width:1.8rem;height:1.8rem;border-radius:.55rem;background:rgba(99,102,241,0.08);color:var(--accent-strong);font-size:.75rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .dc-opt.correct { border-color:#10b981;background:rgba(16,185,129,0.08); }
    .dc-opt.correct .dc-letter { background:#10b981;color:#fff; }
    .dc-opt.wrong   { border-color:#ef4444;background:rgba(239,68,68,0.07); }
    .dc-opt.wrong .dc-letter   { background:#ef4444;color:#fff; }
    .dc-feedback { padding:.75rem 1rem;border-radius:.85rem;font-size:.87rem;font-weight:600;margin-bottom:.75rem;display:none; }
    .dc-feedback.ok  { background:rgba(16,185,129,0.1);color:#059669; }
    .dc-feedback.bad { background:rgba(239,68,68,0.08);color:#dc2626; }
    .dc-next-btn { width:100%;padding:.75rem;border-radius:1rem;border:none;background:linear-gradient(135deg,${CFG.color},${CFG.color}cc);color:#fff;font-size:.92rem;font-weight:700;cursor:pointer;display:none;margin-top:.25rem; }

    /* Resultado */
    .dc-result { display:flex;flex-direction:column;gap:1.5rem; }
    .dc-score-hero { text-align:center;display:flex;flex-direction:column;align-items:center;gap:.75rem;background:linear-gradient(135deg,${CFG.colorBg},rgba(255,255,255,0));border-radius:2rem;padding:2rem; }
    .dc-score-ring { width:9rem;height:9rem;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;background:conic-gradient(${CFG.color} calc(var(--pct)*1%*3.6deg/1deg), rgba(99,102,241,0.1) 0);box-shadow:0 8px 28px ${CFG.color}33; }
    .dc-score-ring .dc-score-pct  { font-size:1.75rem;font-weight:900;color:${CFG.color}; }
    .dc-score-ring .dc-score-sub  { font-size:.72rem;font-weight:600;color:var(--text-muted); }
    .dc-result-title { font-size:1.35rem;font-weight:800;color:var(--accent-strong);margin:0; }
    .dc-result-msg   { font-size:.9rem;color:var(--text-muted);margin:0; }

    .dc-temas-grid { display:grid;gap:.75rem; }
    .dc-tema-row { background:#fff;border:1px solid rgba(99,102,241,0.09);border-radius:1.25rem;padding:1rem 1.25rem;display:flex;flex-direction:column;gap:.4rem; }
    .dc-tema-row-head { display:flex;align-items:center;justify-content:space-between;gap:.5rem; }
    .dc-tema-name { font-size:.87rem;font-weight:700;color:var(--text); }
    .dc-tema-pct-label { font-size:.87rem;font-weight:800; }
    .dc-tema-bar-track { height:7px;border-radius:999px;background:rgba(99,102,241,0.08);overflow:hidden; }
    .dc-tema-bar-fill  { height:100%;border-radius:999px;transition:width .8s cubic-bezier(.4,0,.2,1); }

    .dc-recos { background:#fff;border:1px solid rgba(99,102,241,0.1);border-radius:1.75rem;padding:1.4rem 1.5rem; }
    .dc-recos h3 { margin:0 0 .85rem;font-size:.97rem;font-weight:700;color:${CFG.color}; }
    .dc-recos ul { list-style:none;padding:0;margin:0;display:grid;gap:.5rem; }
    .dc-recos li { font-size:.87rem;color:var(--text-muted);display:flex;gap:.55rem;align-items:flex-start;line-height:1.5; }

    .dc-actions { display:flex;gap:.75rem;flex-wrap:wrap; }
    .dc-actions a, .dc-actions button { flex:1;min-width:140px; }
  `;
  document.head.appendChild(style);

  // ── Estado ───────────────────────────────────────────────────────────
  let current  = 0;
  let answers  = new Array(TOTAL_Q).fill(null);
  let secsLeft = SECS_Q;
  let timerInt = null;

  // ════════════════════════════════════════════════════════════════════
  // PANTALLA INTRO
  // ════════════════════════════════════════════════════════════════════
  function showIntro() {
    root.innerHTML = `
      <nav style="margin-bottom:1.25rem;font-size:.9rem">
        <a href="grado-5.html#diagnosticos" style="color:var(--accent-strong);text-decoration:none;font-weight:600">← Volver</a>
      </nav>
      <div class="dc-intro">
        <div class="dc-intro-icon">${CFG.emoji}</div>
        <h2>Diagnóstico de ${CFG.nombre}</h2>
        <p>Evalúa tu nivel actual en los temas clave de ${CFG.nombre}. Al terminar recibirás un análisis detallado de tus fortalezas y debilidades.</p>
        <div class="dc-meta-pills">
          <span class="dc-meta-pill">📝 ${TOTAL_Q} preguntas</span>
          <span class="dc-meta-pill">⏱ ${SECS_Q}s por pregunta</span>
          <span class="dc-meta-pill">🎓 Grado ${GRADO}°</span>
          <span class="dc-meta-pill">🩺 Diagnóstico</span>
        </div>
        <div class="dc-rules">
          <ul style="list-style:none;padding:0;margin:0">
            <li style="display:flex;gap:.5rem;font-size:.87rem;color:var(--text-muted);margin:.3rem 0"><span>⏱</span>Tienes <strong>${SECS_Q} segundos</strong> por pregunta. Si se acaba, pasa a la siguiente.</li>
            <li style="display:flex;gap:.5rem;font-size:.87rem;color:var(--text-muted);margin:.3rem 0"><span>✅</span>Solo una respuesta correcta por pregunta.</li>
            <li style="display:flex;gap:.5rem;font-size:.87rem;color:var(--text-muted);margin:.3rem 0"><span>📊</span>Al final verás tu nivel por tema y recomendaciones personalizadas.</li>
            <li style="display:flex;gap:.5rem;font-size:.87rem;color:var(--text-muted);margin:.3rem 0"><span>💾</span>Tu resultado se guarda automáticamente en tu diagnóstico.</li>
          </ul>
        </div>
        <button class="dc-start-btn" id="dcStartBtn">🚀 Iniciar diagnóstico</button>
      </div>`;
    document.getElementById('dcStartBtn').addEventListener('click', showQuestion);
  }

  // ════════════════════════════════════════════════════════════════════
  // PREGUNTA
  // ════════════════════════════════════════════════════════════════════
  function showQuestion() {
    if (current >= TOTAL_Q) { showResult(); return; }
    const q = BANCO[current];
    secsLeft = SECS_Q;

    root.innerHTML = `
      <div class="dc-topbar">
        <span class="dc-topbar-label">${CFG.emoji} ${CFG.nombre} · Diagnóstico</span>
        <div class="dc-prog-wrap">
          <div class="dc-prog-fill" id="dcProg" style="width:${(current/TOTAL_Q)*100}%"></div>
        </div>
        <span class="dc-timer" id="dcTimer">⏱ ${secsLeft}</span>
      </div>

      <div class="dc-qcard">
        <span class="dc-tema-tag">📌 ${q.t} · ${current+1}/${TOTAL_Q}</span>
        <p class="dc-question">${q.p}</p>
        <div class="dc-opts" id="dcOpts">
          ${q.ops.map((o,i)=>`
            <button class="dc-opt" data-i="${i}">
              <span class="dc-letter">${['A','B','C','D'][i]}</span>${o}
            </button>`).join('')}
        </div>
        <div class="dc-feedback" id="dcFb"></div>
        <button class="dc-next-btn" id="dcNext">Siguiente →</button>
      </div>`;

    // Timer
    timerInt = setInterval(() => {
      secsLeft--;
      const el = document.getElementById('dcTimer');
      if (!el) { clearInterval(timerInt); return; }
      el.textContent = `⏱ ${secsLeft}`;
      el.className = 'dc-timer' + (secsLeft <= 5 ? ' danger' : secsLeft <= 10 ? ' warn' : '');
      if (secsLeft <= 0) { clearInterval(timerInt); reveal(-1); }
    }, 1000);

    document.querySelectorAll('.dc-opt').forEach(btn => {
      btn.addEventListener('click', () => { clearInterval(timerInt); reveal(parseInt(btn.dataset.i)); });
    });

    document.getElementById('dcNext').addEventListener('click', () => { current++; showQuestion(); });
  }

  function reveal(elegida) {
    const q = BANCO[current];
    answers[current] = elegida;
    document.querySelectorAll('.dc-opt').forEach((b, i) => {
      b.disabled = true;
      if (i === q.r) b.classList.add('correct');
      else if (i === elegida) b.classList.add('wrong');
    });
    const fb = document.getElementById('dcFb');
    fb.style.display = 'block';
    if (elegida === q.r) {
      fb.className = 'dc-feedback ok';
      fb.textContent = '✅ ¡Correcto!';
    } else if (elegida === -1) {
      fb.className = 'dc-feedback bad';
      fb.textContent = `⏰ Tiempo agotado. La respuesta correcta era: "${q.ops[q.r]}"`;
    } else {
      fb.className = 'dc-feedback bad';
      fb.textContent = `❌ Incorrecto. La respuesta correcta era: "${q.ops[q.r]}"`;
    }
    const nextBtn = document.getElementById('dcNext');
    if (nextBtn) {
      nextBtn.style.display = 'block';
      nextBtn.textContent = current === TOTAL_Q - 1 ? '✅ Ver resultados' : 'Siguiente →';
    }
  }

  // ════════════════════════════════════════════════════════════════════
  // RESULTADO
  // ════════════════════════════════════════════════════════════════════
  function showResult() {
    clearInterval(timerInt);
    const correctas = answers.filter((a,i) => a === BANCO[i].r).length;
    const pct = Math.round(correctas / TOTAL_Q * 100);

    // Guardar resultado
    _saveResult(AREA, GRADO, pct, correctas, TOTAL_Q);

    // Stats por tema
    const temaMap = {};
    BANCO.forEach((q, i) => {
      if (!temaMap[q.t]) temaMap[q.t] = { ok:0, total:0 };
      temaMap[q.t].total++;
      if (answers[i] === q.r) temaMap[q.t].ok++;
    });

    // Nivel general
    let titulo, mensaje, emoji;
    if (pct >= 85) { titulo='🏆 Nivel Avanzado';   emoji='🏆'; mensaje=`Tienes un dominio sólido en ${CFG.nombre}. ¡Sigue profundizando en los temas con menor puntaje!`; }
    else if (pct >= 70) { titulo='👍 Nivel Bueno';  emoji='👍'; mensaje=`Tienes buenas bases en ${CFG.nombre}. Refuerza los temas en rojo para alcanzar el nivel avanzado.`; }
    else if (pct >= 50) { titulo='📚 Nivel Regular'; emoji='📚'; mensaje=`Hay áreas que necesitan trabajo. Revisa los temas donde obtuviste menos del 50% y practica con los quizzes.`; }
    else if (pct >= 30) { titulo='⚠️ Nivel Básico';  emoji='⚠️'; mensaje=`Tienes varias brechas en ${CFG.nombre}. Te recomendamos repasar los temas fundamentales y completar los quizzes por grado.`; }
    else { titulo='🌱 Nivel Inicial'; emoji='🌱'; mensaje=`No te desanimes. Este diagnóstico te muestra exactamente dónde empezar. ¡Cada quiz que hagas te ayudará a subir tu nivel!`; }

    // Recomendaciones dinámicas
    const temasDebiles = Object.entries(temaMap)
      .filter(([,v]) => v.ok / v.total < 0.6)
      .sort((a,b) => (a[1].ok/a[1].total) - (b[1].ok/b[1].total))
      .slice(0, 3);

    const recosList = temasDebiles.length
      ? temasDebiles.map(([t,v]) => {
          const p2 = Math.round(v.ok/v.total*100);
          return `<li><span>📌</span>Refuerza <strong>${t}</strong> — obtuviste ${p2}%. Practica en los quizzes de Juegos.</li>`;
        }).join('')
      : `<li><span>🌟</span>¡Excelente nivel en todos los temas! Intenta los simulacros para seguir progresando.</li>`;

    // CSS para el conic-gradient del anillo (workaround con SVG)
    const ringDeg = Math.round(pct * 3.6);

    root.innerHTML = `
      <nav style="margin-bottom:1.25rem;font-size:.9rem">
        <a href="grado-5.html#diagnosticos" style="color:var(--accent-strong);text-decoration:none;font-weight:600">← Volver a Diagnósticos</a>
      </nav>
      <div class="dc-result">
        <!-- Score hero -->
        <div class="dc-score-hero">
          <svg width="150" height="150" viewBox="0 0 150 150" style="transform:rotate(-90deg)">
            <circle cx="75" cy="75" r="62" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="12"/>
            <circle cx="75" cy="75" r="62" fill="none" stroke="${CFG.color}" stroke-width="12"
              stroke-dasharray="${Math.round(2*Math.PI*62)}" stroke-dashoffset="${Math.round(2*Math.PI*62*(1-pct/100))}"
              stroke-linecap="round" style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div style="margin-top:-120px;text-align:center;display:flex;flex-direction:column;gap:.15rem;align-items:center">
            <span style="font-size:2rem;font-weight:900;color:${CFG.color}">${pct}%</span>
            <span style="font-size:.75rem;font-weight:600;color:var(--text-muted)">${correctas}/${TOTAL_Q} correctas</span>
          </div>
          <div style="margin-top:1rem">
            <h2 class="dc-result-title">${titulo}</h2>
            <p class="dc-result-msg">${mensaje}</p>
          </div>
        </div>

        <!-- Desglose por tema -->
        <div>
          <p style="font-size:.97rem;font-weight:700;color:var(--text);margin:0 0 .85rem">📊 Resultados por tema</p>
          <div class="dc-temas-grid">
            ${Object.entries(temaMap).map(([tema, v]) => {
              const tp = Math.round(v.ok/v.total*100);
              const tcolor = tp >= 70 ? '#10b981' : tp >= 45 ? '#f59e0b' : '#ef4444';
              const tlabel = tp >= 70 ? '✅ Dominado' : tp >= 45 ? '📚 Mejorable' : '❌ Repasar';
              return `<div class="dc-tema-row">
                <div class="dc-tema-row-head">
                  <span class="dc-tema-name">${tema}</span>
                  <div style="display:flex;align-items:center;gap:.5rem">
                    <span class="dc-tema-pct-label" style="color:${tcolor}">${tp}%</span>
                    <span style="font-size:.7rem;font-weight:700;padding:.15rem .55rem;border-radius:999px;background:${tcolor}18;color:${tcolor}">${tlabel}</span>
                  </div>
                </div>
                <div class="dc-tema-bar-track">
                  <div class="dc-tema-bar-fill" style="width:${tp}%;background:linear-gradient(90deg,${tcolor},${tcolor}99)"></div>
                </div>
                <span style="font-size:.73rem;color:var(--text-muted)">${v.ok} de ${v.total} preguntas correctas</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Recomendaciones -->
        <div class="dc-recos">
          <h3>💡 Recomendaciones personalizadas</h3>
          <ul>${recosList}</ul>
        </div>

        <!-- Revisión completa -->
        <div>
          <p style="font-size:.97rem;font-weight:700;color:var(--text);margin:0 0 .85rem">🔍 Revisión de respuestas</p>
          <div style="display:grid;gap:.85rem">
            ${BANCO.map((q, i) => {
              const ua = answers[i];
              const ok = ua === q.r;
              const bord = ok ? 'rgba(16,185,129,0.2)' : ua === null ? 'rgba(148,163,184,0.15)' : 'rgba(239,68,68,0.2)';
              const status = ua === null ? '⬜ Sin responder' : ok ? '✅ Correcto' : '❌ Incorrecto';
              return `<div style="background:#fff;border:1.5px solid ${bord};border-radius:1.25rem;padding:1.1rem 1.25rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;flex-wrap:wrap;gap:.25rem">
                  <span style="font-size:.73rem;font-weight:700;color:var(--text-muted)">${i+1}. ${q.t}</span>
                  <span style="font-size:.73rem;font-weight:700">${status}</span>
                </div>
                <p style="margin:0 0 .65rem;font-size:.88rem;font-weight:600;color:var(--text)">${q.p}</p>
                ${q.ops.map((o,j)=>`
                  <div style="padding:.4rem .75rem;border-radius:.7rem;font-size:.83rem;margin-bottom:.3rem;
                    background:${j===q.r?'rgba(16,185,129,0.1)':j===ua&&!ok?'rgba(239,68,68,0.07)':'transparent'};
                    border:1px solid ${j===q.r?'rgba(16,185,129,0.25)':j===ua&&!ok?'rgba(239,68,68,0.2)':'transparent'};
                    font-weight:${j===q.r?'700':'400'}">
                    <span style="font-size:.7rem;font-weight:800;margin-right:.4rem;padding:.1rem .4rem;border-radius:.35rem;
                      background:${j===q.r?'#10b981':j===ua&&!ok?'#ef4444':'rgba(99,102,241,0.1)'};
                      color:${j===q.r||j===ua&&!ok?'#fff':'var(--accent-strong)'}">${['A','B','C','D'][j]}</span>${o}
                  </div>`).join('')}
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Acciones -->
        <div class="dc-actions">
          <button onclick="location.reload()" class="button button-secondary">🔄 Repetir diagnóstico</button>
          <a href="diagnostico.html" class="button button-primary">📊 Ver mi diagnóstico completo</a>
        </div>
      </div>`;
  }

  // ── Arrancar ──────────────────────────────────────────────────────────
  showIntro();
})();
