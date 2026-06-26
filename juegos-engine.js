/* ══════════════════════════════════════════════════
   juegos-engine.js — Motor de juegos EduNovaOne
   Renderiza el área, selector de grado y juegos
   según data-area del #areaRoot en cada HTML.
   ══════════════════════════════════════════════════ */

// ── Registro de evaluaciones (inline, sin import para compatibilidad) ──
(function() {
  const EVAL_KEY = 'enu_eval_resultados';
  const EVAL_MAX = 200;
  const AREA_NOMBRES = { matematica:'Matemática', ciencia:'Ciencias', historia:'Historia', comunicacion:'Comunicación', ingles:'Inglés', tecnologia:'Tecnología' };
  const TIPO_LABELS  = { quiz:'Quiz Principal', quiz2:'Quiz Relámpago', vf:'Verdadero o Falso', ahorcado:'Ahorcado', relaciona:'Relaciona Columnas', ordenar:'Ordena los Pasos', memoria:'Memoria', flashcards:'Flashcards', formulas:'Completa la Fórmula' };
  window._enuEvalRegistrar = function({ area, grado, tipo, score, scoreMax, correctas, total }) {
    const pct = total > 0 ? Math.round((correctas / total) * 100) : (scoreMax > 0 ? Math.round((score / scoreMax) * 100) : 0);
    const entrada = { id: `${area}-${grado}-${tipo}-${Date.now()}`, area, areaNombre: AREA_NOMBRES[area] || area, grado: Number(grado), tipo, tipoLabel: TIPO_LABELS[tipo] || tipo, score: Number(score), scoreMax: Number(scoreMax || 0), correctas: Number(correctas || 0), total: Number(total || 0), pct, ts: Date.now() };
    try {
      let arr = JSON.parse(localStorage.getItem(EVAL_KEY) || '[]');
      arr.unshift(entrada);
      if (arr.length > EVAL_MAX) arr = arr.slice(0, EVAL_MAX);
      localStorage.setItem(EVAL_KEY, JSON.stringify(arr));
    } catch(e) {}
  };
})();

// ── Puntos ──────────────────────────────────────────
const PUNTOS_KEY = 'enu_puntos_hoy';
function getPuntos() {
  try { const s = JSON.parse(localStorage.getItem(PUNTOS_KEY)||'{}'); return s.d === new Date().toDateString() ? (s.p||0) : 0; } catch { return 0; }
}
function addPuntos(n) {
  const p = getPuntos() + n;
  try { localStorage.setItem(PUNTOS_KEY, JSON.stringify({ d: new Date().toDateString(), p })); } catch {}
  const el = document.getElementById('totalPuntos');
  if (el) el.textContent = p;
}

// ══════════════════════════════════════════════════
// BANCO DE PREGUNTAS  (area → grado → preguntas[])
// ══════════════════════════════════════════════════
const BANCO = {
  matematica: {
    1: [
      { p: 'El número 72 descompuesto en factores primos es:', ops: ['2³×3²','2²×3³','2×36','6×12'], r: 0 },
      { p: 'Si a una longitud de 5/8 m se le suma 1/4 m, ¿cuánto resulta?', ops: ['7/8 m','6/8 m','3/4 m','1 m'], r: 0 },
      { p: '¿Cuál es el valor absoluto de −15?', ops: ['−15','0','15','150'], r: 2 },
      { p: 'El 40% de 150 es:', ops: ['40','50','60','70'], r: 2 },
      { p: '¿Cuántos centímetros hay en 2.5 metros?', ops: ['25','250','2500','0.025'], r: 1 },
      { p: 'La suma de los ángulos de un triángulo es siempre:', ops: ['90°','180°','270°','360°'], r: 1 },
      { p: '¿Cuánto es 4³?', ops: ['12','48','64','128'], r: 2 },
      { p: 'El MCM de 8 y 12 es:', ops: ['4','12','24','96'], r: 2 },
      { p: 'Si 3/5 de una cantidad es 18, ¿cuál es la cantidad?', ops: ['10','20','30','36'], r: 2 },
      { p: '−8 × (−4) =', ops: ['−32','32','−12','12'], r: 1 },
      { p: 'El MCD de 18 y 24 es:', ops: ['3','6','9','12'], r: 1 },
      { p: '¿Cuánto es la raíz cuadrada de 144?', ops: ['10','11','12','13'], r: 2 },
      { p: 'El 25% de 200 es:', ops: ['25','40','50','75'], r: 2 },
      { p: '¿Qué número multiplicado por sí mismo da 81?', ops: ['7','8','9','10'], r: 2 },
      { p: 'Simplifica: 18/24', ops: ['1/2','3/4','2/3','5/6'], r: 1 },
    ],
    2: [
      { p: 'El producto de (2x)(3x²) es:', ops: ['5x²','6x²','6x³','5x³'], r: 2 },
      { p: '¿Qué es un monomio?', ops: ['Dos términos algebraicos','Un término algebraico','Una ecuación','Un sistema'], r: 1 },
      { p: 'Resuelve: 4(x−2) = 12', ops: ['x=3','x=4','x=5','x=6'], r: 2 },
      { p: 'El cociente de x⁶ ÷ x² es:', ops: ['x³','x⁴','x⁸','x¹²'], r: 1 },
      { p: 'Si el perímetro de un cuadrado es 28, su lado mide:', ops: ['5','6','7','8'], r: 2 },
      { p: 'Factoriza: 2x² + 4x', ops: ['2(x²+2x)','2x(x+2)','x(2x+4)','2x²(1+2)'], r: 1 },
      { p: 'La raíz de x² − 16 = 0 es:', ops: ['x=2','x=4','x=±4','x=±2'], r: 2 },
      { p: 'Valor de 2a − b si a=3 y b=−1:', ops: ['5','7','8','6'], r: 1 },
      { p: 'El grado del término 5x²y³ es:', ops: ['2','3','5','6'], r: 2 },
      { p: 'Resuelve el sistema: x+y=5, x−y=1 → x=', ops: ['2','3','4','5'], r: 1 },
      { p: 'Si f(x) = 3x − 1, ¿cuánto es f(4)?', ops: ['9','10','11','12'], r: 2 },
      { p: 'El cuadrado de (x + 3) es:', ops: ['x²+6','x²+9','x²+6x+9','x²+3x+9'], r: 2 },
      { p: 'Resuelve: 2x + 5 = 13', ops: ['x=3','x=4','x=5','x=6'], r: 1 },
      { p: '¿Cuál es la pendiente de la recta y = −2x + 7?', ops: ['7','−7','2','−2'], r: 3 },
      { p: 'El término independiente en 5x² − 3x + 4 es:', ops: ['5','−3','4','x'], r: 2 },
    ],
    3: [
      { p: 'Área lateral de un cilindro con r=3 y h=5 (usa π≈3):', ops: ['45','90','30','15'], r: 0 },
      { p: 'En un triángulo isósceles con base 60°, los ángulos iguales miden:', ops: ['50°','60°','70°','80°'], r: 2 },
      { p: 'Volumen de un cubo de arista 4 cm:', ops: ['16 cm³','48 cm³','64 cm³','32 cm³'], r: 2 },
      { p: 'Un ángulo de 135° es:', ops: ['Agudo','Recto','Obtuso','Llano'], r: 2 },
      { p: 'El apotema de un polígono regular es:', ops: ['El lado exterior','La distancia del centro a un lado','La diagonal mayor','El radio del círculo inscrito'], r: 1 },
      { p: 'Si sen α = 0.6 y la hipotenusa = 10, el cateto opuesto mide:', ops: ['4','5','6','7'], r: 2 },
      { p: 'Número de diagonales de un pentágono:', ops: ['3','4','5','6'], r: 2 },
      { p: 'Área de un rombo con diagonales 8 y 6:', ops: ['14','24','48','28'], r: 1 },
      { p: 'Dos rectas paralelas cortadas por una transversal forman ángulos alternos:', ops: ['Suplementarios','Complementarios','Iguales','Diferentes'], r: 2 },
      { p: 'El perímetro de un hexágono regular de lado 5 es:', ops: ['25','30','35','40'], r: 1 },
      { p: 'tan θ = opuesto / adyacente. Si opuesto=3 y adyacente=4, tan θ =', ops: ['3/5','4/3','3/4','5/4'], r: 2 },
      { p: 'Área de un círculo con radio 7 (π≈3):', ops: ['21','42','147','44'], r: 2 },
      { p: 'La suma de los ángulos internos de un hexágono es:', ops: ['540°','720°','900°','1080°'], r: 1 },
      { p: 'Dos ángulos son suplementarios si su suma es:', ops: ['90°','180°','270°','360°'], r: 1 },
      { p: 'Si cos θ = 0.8 e hipotenusa = 10, el cateto adyacente mide:', ops: ['6','7','8','9'], r: 2 },
    ],
    4: [
      { p: 'La desviación estándar mide:', ops: ['El valor central','La dispersión respecto a la media','El dato mayor','La frecuencia'], r: 1 },
      { p: 'Si P(A)=0.3 y P(B)=0.5 y son mutuamente excluyentes, P(A∪B)=', ops: ['0.15','0.80','0.20','1.0'], r: 1 },
      { p: 'La función f(x)=x² tiene vértice en:', ops: ['(1,0)','(0,1)','(0,0)','(−1,0)'], r: 2 },
      { p: 'El rango de f(x) = |x| es:', ops: ['Todos los reales','Solo negativos','Solo no negativos','Solo enteros'], r: 2 },
      { p: 'Dos eventos son independientes si:', ops: ['P(A∩B)=0','P(A∩B)=P(A)·P(B)','P(A)=P(B)','P(A∪B)=1'], r: 1 },
      { p: 'La recta y=3x−2 tiene pendiente:', ops: ['−2','2','3','−3'], r: 2 },
      { p: 'Si la mediana de {2,5,x,9,12} es 7, x vale:', ops: ['5','6','7','8'], r: 2 },
      { p: 'El dominio de f(x)=√(x−4) es:', ops: ['x<4','x≤4','x≥4','x>4'], r: 2 },
      { p: '¿Cuál es la moda de {3,3,5,7,7,7,9}?', ops: ['3','5','7','9'], r: 2 },
      { p: 'Si f(x)=2x+1 y g(x)=x², ¿cuánto es f(g(3))?', ops: ['7','15','19','21'], r: 2 },
      { p: 'La mediana de {4,8,12,16,20} es:', ops: ['8','10','12','14'], r: 2 },
      { p: '¿Cuántas formas hay de elegir 2 de 5 objetos? (C(5,2))', ops: ['5','8','10','15'], r: 2 },
      { p: 'Si P(A)=0.4 y P(Aᶜ)=', ops: ['0.4','0.5','0.6','0.8'], r: 2 },
      { p: 'La función y = −x² + 4 abre hacia:', ops: ['Arriba','Abajo','Los lados','Ninguna'], r: 1 },
      { p: 'La intersección con el eje y de f(x)=3x−5 es:', ops: ['3','−3','5','−5'], r: 3 },
    ],
    5: [
      { p: 'La derivada de sen(x) es:', ops: ['−cos(x)','cos(x)','−sen(x)','tan(x)'], r: 1 },
      { p: '∫cos(x) dx =', ops: ['sen(x)+C','−sen(x)+C','cos(x)+C','tan(x)+C'], r: 0 },
      { p: 'El determinante de la matriz [[2,1],[4,3]] es:', ops: ['2','3','4','10'], r: 0 },
      { p: 'Si lím(x→0) de sen(x)/x =', ops: ['0','1','∞','−1'], r: 1 },
      { p: 'La derivada de e^x es:', ops: ['xe^(x−1)','e^x','e^(x+1)','1/e^x'], r: 1 },
      { p: 'El producto escalar de (1,2)·(3,−1) es:', ops: ['1','5','−1','3'], r: 0 },
      { p: '∫₁³ 2x dx =', ops: ['4','6','8','10'], r: 2 },
      { p: 'La integral representa geométricamente:', ops: ['La pendiente','El área bajo la curva','El máximo','La derivada inversa'], r: 1 },
      { p: 'La suma de los vectores (2,3) y (−1,4) es:', ops: ['(1,7)','(3,7)','(1,−1)','(3,−1)'], r: 0 },
      { p: 'Un punto crítico ocurre cuando f\'(x) =', ops: ['1','−1','∞','0'], r: 3 },
      { p: 'La derivada de ln(x) es:', ops: ['1','x','1/x','ln(x)'], r: 2 },
      { p: 'La derivada de una constante es:', ops: ['1','−1','la constante','0'], r: 3 },
      { p: '∫ 3x² dx =', ops: ['6x','x³+C','3x³+C','x²+C'], r: 1 },
      { p: 'El módulo del vector (3,4) es:', ops: ['3','4','5','7'], r: 2 },
      { p: 'Si A = [[1,0],[0,1]], su determinante es:', ops: ['0','1','−1','2'], r: 1 },
    ],
  },
  ciencia: {
    1: [
      { p: '¿Qué organelo controla las actividades de la célula?', ops: ['Ribosoma','Mitocondria','Núcleo','Vacuola'], r: 2 },
      { p: '¿Cuál es el proceso por el que las plantas fabrican alimento?', ops: ['Respiración celular','Fotosíntesis','Fermentación','Digestión'], r: 1 },
      { p: 'Los seres vivos que descomponen materia orgánica se llaman:', ops: ['Productores','Consumidores','Descomponedores','Herbívoros'], r: 2 },
      { p: 'La membrana celular tiene función de:', ops: ['Producir energía','Regular el paso de sustancias','Sintetizar proteínas','Almacenar agua'], r: 1 },
      { p: '¿Cuántas cámaras tiene el corazón humano?', ops: ['2','3','4','5'], r: 2 },
      { p: 'El sistema nervioso central está formado por:', ops: ['Corazón y pulmones','Encéfalo y médula espinal','Riñones y vejiga','Huesos y cartílagos'], r: 1 },
      { p: 'Las bacterias son organismos:', ops: ['Eucariotas','Procariotas','Pluricelulares','Animales'], r: 1 },
      { p: 'La pared celular es característica de las células:', ops: ['Animales','Bacterianas y vegetales','Solo animales','Solo hongos'], r: 1 },
      { p: 'La biósfera incluye:', ops: ['Solo los océanos','Solo la atmósfera','Todas las zonas habitadas por seres vivos','Solo la corteza terrestre'], r: 2 },
      { p: 'El ADN se localiza principalmente en:', ops: ['La membrana','El citoplasma','El núcleo','Las mitocondrias'], r: 2 },
      { p: 'La célula animal NO tiene:', ops: ['Núcleo','Mitocondria','Pared celular','Ribosoma'], r: 2 },
      { p: '¿Qué tipo de reproducción produce clones?', ops: ['Sexual','Asexual','Meiosis','Polinización'], r: 1 },
      { p: 'Los hongos son organismos:', ops: ['Autótrofos','Heterótrofos','Solo unicelulares','Procariotas'], r: 1 },
      { p: 'La vacuna estimula el sistema:', ops: ['Digestivo','Nervioso','Inmune','Endócrino'], r: 2 },
      { p: 'En la cadena alimenticia los productores son:', ops: ['Animales herbívoros','Animales carnívoros','Plantas','Descomponedores'], r: 2 },
    ],
    2: [
      { p: '¿Cuántos protones tiene el oxígeno?', ops: ['6','7','8','9'], r: 2 },
      { p: '¿Qué representa el número atómico?', ops: ['Neutrones','Protones','Masa atómica','Electrones'], r: 1 },
      { p: 'Fórmula del agua:', ops: ['H₂O₂','CO₂','H₂O','NaCl'], r: 2 },
      { p: '¿Qué mide el pH?', ops: ['Temperatura','Acidez/basicidad','Presión','Densidad'], r: 1 },
      { p: 'Los gases nobles están en el grupo:', ops: ['1','2','17','18'], r: 3 },
      { p: '¿Qué es un enlace iónico?', ops: ['Compartir electrones','Transferencia de electrones','Unión de núcleos','Repulsión de cargas'], r: 1 },
      { p: 'Estado con forma y volumen fijos:', ops: ['Gas','Líquido','Sólido','Plasma'], r: 2 },
      { p: 'Símbolo del sodio:', ops: ['So','Na','Sn','Nd'], r: 1 },
      { p: '¿Qué reacción produce sal y agua?', ops: ['Oxidación','Reducción','Neutralización','Combustión'], r: 2 },
      { p: 'Balancea: H₂ + O₂ → H₂O. ¿Cuántas H₂O?', ops: ['1','2','3','4'], r: 1 },
      { p: 'La tabla periódica fue organizada por:', ops: ['Newton','Einstein','Mendeleiev','Bohr'], r: 2 },
      { p: '¿Cuántos electrones tiene el carbono?', ops: ['4','5','6','7'], r: 2 },
      { p: 'Una solución con pH=7 es:', ops: ['Ácida','Básica','Neutra','Oxidante'], r: 2 },
      { p: 'El estado gaseoso tiene:', ops: ['Forma y volumen fijos','Forma fija, volumen variable','Ni forma ni volumen fijos','Volumen fijo, forma variable'], r: 2 },
      { p: 'Símbolo del hierro:', ops: ['H','Fe','Ir','In'], r: 1 },
    ],
    3: [
      { p: 'La Segunda Ley de Newton:', ops: ['Inercia','F = m × a','Acción y reacción','Conservación de energía'], r: 1 },
      { p: 'En MRU la velocidad es:', ops: ['Creciente','Decreciente','Constante','Cero'], r: 2 },
      { p: 'Energía cinética:', ops: ['E=mgh','F=ma','Ec=½mv²','W=Fd'], r: 2 },
      { p: '¿Qué tipo de onda es la luz?', ops: ['Mecánica','Longitudinal','Electromagnética','Sonora'], r: 2 },
      { p: 'Unidad de fuerza en el SI:', ops: ['Joule','Pascal','Newton','Watt'], r: 2 },
      { p: 'Velocidad v=20m/s, t=5s → d=', ops: ['4m','25m','100m','15m'], r: 2 },
      { p: 'Trabajo W =', ops: ['W=mv','W=F×d','W=½mv²','W=mgh'], r: 1 },
      { p: '"Acción-reacción" es la ___ Ley de Newton:', ops: ['Primera','Segunda','Tercera','Cuarta'], r: 2 },
      { p: 'Presión P =', ops: ['P=m×V','P=F/A','P=mgh','P=mv'], r: 1 },
      { p: 'La inercia corresponde a la ___ Ley de Newton:', ops: ['Primera','Segunda','Tercera','Cuarta'], r: 0 },
      { p: 'Un objeto cae libremente. Su aceleración es aprox.:', ops: ['5 m/s²','9.8 m/s²','15 m/s²','20 m/s²'], r: 1 },
      { p: 'El sonido es una onda:', ops: ['Electromagnética','Mecánica longitudinal','Transversal sin medio','De luz'], r: 1 },
      { p: 'La densidad se calcula como:', ops: ['d=m+V','d=m×V','d=m/V','d=V/m'], r: 2 },
      { p: 'Potencia P = Trabajo ÷', ops: ['Masa','Tiempo','Fuerza','Velocidad'], r: 1 },
      { p: 'La energía potencial gravitatoria es:', ops: ['Ep=½mv²','Ep=mgh','Ep=F×d','Ep=m/h'], r: 1 },
    ],
    4: [
      { p: 'Alcanos tienen fórmula:', ops: ['CₙH₂ₙ','CₙH₂ₙ₊₂','CₙH₂ₙ₋₂','CₙHₙ'], r: 1 },
      { p: '36 g de agua (M=18) son ___ mol:', ops: ['1','2','3','4'], r: 1 },
      { p: 'El reactivo limitante es:', ops: ['El que está en exceso','El que se agota primero','El de mayor masa','El más lento'], r: 1 },
      { p: 'Grupo funcional del alcohol:', ops: ['−COOH','−CHO','−OH','−NH₂'], r: 2 },
      { p: 'Un ácido libera en agua:', ops: ['OH⁻','H⁺','Na⁺','Cl⁻'], r: 1 },
      { p: 'Fórmula del metano:', ops: ['C₂H₆','CH₄','C₃H₈','C₂H₄'], r: 1 },
      { p: 'Los alquenos tienen enlace:', ops: ['Simple C−C','Doble C=C','Triple C≡C','Iónico'], r: 1 },
      { p: 'Rendimiento=18, teórico=20 → %:', ops: ['80%','85%','90%','95%'], r: 2 },
      { p: '¿Qué es la estequiometría?', ops: ['Estudio de la luz','Cálculo de cantidades en reacciones','Análisis de energía','Clasificación de elementos'], r: 1 },
      { p: 'Nomenclatura sistemática:', ops: ['Nombres comunes','IUPAC','Trivial','Empírica'], r: 1 },
      { p: 'Los alquinos tienen enlace:', ops: ['Simple C−C','Doble C=C','Triple C≡C','Iónico'], r: 2 },
      { p: 'Masa molar del CO₂ (C=12, O=16):', ops: ['28 g/mol','40 g/mol','44 g/mol','56 g/mol'], r: 2 },
      { p: 'Grupo funcional del ácido carboxílico:', ops: ['−OH','−CHO','−COOH','−NH₂'], r: 2 },
      { p: 'La combustión completa produce:', ops: ['CO y H₂','CO₂ y H₂O','CH₄ y O₂','SO₂ y NO'], r: 1 },
      { p: '¿Cuántos moles hay en 44g de CO₂ (M=44)?', ops: ['0.5','1','2','4'], r: 1 },
    ],
    5: [
      { p: 'E = mc² es:', ops: ['Energía cinética','Energía potencial','Equivalencia masa-energía','Presión'], r: 2 },
      { p: '¿Cuántos planetas tiene el Sistema Solar?', ops: ['7','8','9','10'], r: 1 },
      { p: 'La fisión nuclear:', ops: ['Une núcleos ligeros','Divide núcleos pesados','Emite luz','Produce agua'], r: 1 },
      { p: 'Velocidad de la luz aprox.:', ops: ['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], r: 1 },
      { p: 'Planetas interiores del Sistema Solar:', ops: ['Júpiter,Saturno,Urano,Neptuno','Mercurio,Venus,Tierra,Marte','Solo Tierra y Marte','Mercurio y Venus'], r: 1 },
      { p: 'Vida media es:', ops: ['Su edad','Tiempo en desintegrar la mitad','Tiempo de formación','Período orbital'], r: 1 },
      { p: '3ra Ley de Kepler relaciona:', ops: ['Masa y velocidad','T² con r³','Distancia y tiempo','Fuerza y aceleración'], r: 1 },
      { p: 'La relatividad especial la propuso:', ops: ['Newton','Darwin','Einstein','Bohr'], r: 2 },
      { p: 'La fusión nuclear:', ops: ['Divide átomos pesados','Une núcleos ligeros liberando energía','Es una reacción química','Produce radioactividad alfa'], r: 1 },
      { p: 'El año luz es medida de:', ops: ['Tiempo','Distancia','Velocidad','Masa'], r: 1 },
      { p: 'La galaxia donde está el Sistema Solar se llama:', ops: ['Andrómeda','Vía Láctea','Elíptica','Espiral Sur'], r: 1 },
      { p: 'La fuerza entre dos masas es estudiada por la ley de:', ops: ['Boyle','Coulomb','Gravitación Universal','Newton 2da'], r: 2 },
      { p: 'El Big Bang es la teoría sobre:', ops: ['La formación de los planetas','El origen del universo','La fisión nuclear','El movimiento de los átomos'], r: 1 },
      { p: 'La partícula con carga positiva en el núcleo es:', ops: ['Electrón','Neutrón','Protón','Fotón'], r: 2 },
      { p: 'La radioactividad fue descubierta por:', ops: ['Einstein','Curie','Newton','Darwin'], r: 1 },
    ],
  },
  historia: {
    1: [
      { p: '¿Qué civilización construyó las pirámides de Giza?', ops: ['Griega','Romana','Egipcia','Mesopotámica'], r: 2 },
      { p: '¿Dónde surgió la escritura cuneiforme?', ops: ['Egipto','Grecia','Mesopotamia','China'], r: 2 },
      { p: '¿Cuántas regiones naturales tiene el Perú?', ops: ['2','3','4','5'], r: 1 },
      { p: 'La democracia fue inventada en:', ops: ['Roma','Atenas','Esparta','Cartago'], r: 1 },
      { p: '¿Qué río permitió el desarrollo de Egipto?', ops: ['Éufrates','Tigris','Nilo','Ganges'], r: 2 },
      { p: 'Las 8 regiones de Pulgar Vidal incluyen:', ops: ['Chala y Yunga','Playa y Montaña','Mar y Sierra','Selva y Costa'], r: 0 },
      { p: '¿Cuántos departamentos tiene el Perú?', ops: ['20','22','24','26'], r: 2 },
      { p: 'Roma fue fundada aprox. en:', ops: ['1000 a.C.','753 a.C.','500 a.C.','200 a.C.'], r: 1 },
      { p: 'Filósofo griego maestro de Alejandro Magno:', ops: ['Sócrates','Platón','Aristóteles','Pitágoras'], r: 2 },
      { p: 'Capital del Perú:', ops: ['Cusco','Arequipa','Lima','Trujillo'], r: 2 },
      { p: 'Las pirámides de Giza se construyeron durante la dinastía:', ops: ['IV','VII','XII','XVIII'], r: 0 },
      { p: 'El Coliseo Romano fue construido en:', ops: ['100 a.C.','50 a.C.','70 d.C.','200 d.C.'], r: 2 },
      { p: 'Civilización que desarrolló el cero como concepto matemático:', ops: ['Egipcia','Griega','Maya','Romana'], r: 2 },
      { p: 'Los mayas se ubicaron principalmente en:', ops: ['Andes','Mesoamérica','Caribe','Patagonia'], r: 1 },
      { p: 'El feudalismo fue un sistema de la Edad:', ops: ['Antigua','Media','Moderna','Contemporánea'], r: 1 },
    ],
    2: [
      { p: 'Capital del Imperio Inca:', ops: ['Lima','Machu Picchu','Cusco','Cajamarca'], r: 2 },
      { p: '¿En qué año llegó Pizarro al Perú?', ops: ['1520','1525','1532','1540'], r: 2 },
      { p: '¿Cuántos suyos tenía el Tahuantinsuyo?', ops: ['2','3','4','5'], r: 2 },
      { p: 'Trabajo forzado en el Virreinato:', ops: ['Yanaconazgo','Mita','Encomienda','Tributo'], r: 1 },
      { p: 'El Virreinato del Perú fue creado en:', ops: ['1532','1542','1550','1600'], r: 1 },
      { p: '¿Quién fue el último inca?', ops: ['Huáscar','Atahualpa','Túpac Yupanqui','Pachacútec'], r: 1 },
      { p: 'Primer inca según la tradición:', ops: ['Atahualpa','Huáscar','Manco Cápac','Pachacútec'], r: 2 },
      { p: '¿En qué ciudad fue capturado Atahualpa?', ops: ['Cusco','Lima','Cajamarca','Trujillo'], r: 2 },
      { p: 'La plata de Potosí era del actual:', ops: ['Perú','Bolivia','Chile','Argentina'], r: 1 },
      { p: 'Nombre del gran imperio inca:', ops: ['Azteca','Maya','Tahuantinsuyo','Chimú'], r: 2 },
      { p: 'El Inca que expandió más el Imperio fue:', ops: ['Manco Cápac','Huáscar','Pachacútec','Atahualpa'], r: 2 },
      { p: 'Los quipus incas servían para:', ops: ['Comunicarse telegráficamente','Registrar datos y cuentas','Combatir enemigos','Adorar a los dioses'], r: 1 },
      { p: 'La encomienda colonial otorgaba:', ops: ['Tierras solo','Mano de obra indígena y tributo','Libertad a los indios','Títulos nobiliarios'], r: 1 },
      { p: 'El Virreinato del Perú tenía capital en:', ops: ['Cusco','Potosí','Lima','Trujillo'], r: 2 },
      { p: 'El dios Sol de los incas se llamaba:', ops: ['Pachamama','Inti','Viracocha','Supay'], r: 1 },
    ],
    3: [
      { p: '¿En qué año se proclamó la independencia del Perú?', ops: ['1810','1819','1821','1824'], r: 2 },
      { p: '¿Qué batalla consolidó la independencia?', ops: ['Junín','Ayacucho','Chacabuco','Pichincha'], r: 1 },
      { p: '¿Quién proclamó la independencia del Perú?', ops: ['Bolívar','San Martín','O\'Higgins','Sucre'], r: 1 },
      { p: 'Rebelión de Túpac Amaru II:', ops: ['1770','1780','1790','1800'], r: 1 },
      { p: 'Batalla de Ayacucho fue en:', ops: ['1821','1822','1823','1824'], r: 3 },
      { p: 'Causa externa de la independencia:', ops: ['Abusos coloniales','Revolución Francesa e independencia EE.UU.','Crisis económica local','Terremotos'], r: 1 },
      { p: 'Gobierno adoptado tras la independencia:', ops: ['Monarquía','República presidencialista','Teocracia','Oligarquía'], r: 1 },
      { p: 'La Guerra del Pacífico fue entre:', ops: ['Perú y Brasil','Perú,Bolivia y Chile','Perú y Ecuador','Perú y Colombia'], r: 1 },
      { p: 'Año de la independencia peruana:', ops: ['1819','1820','1821','1822'], r: 2 },
      { p: '¿Quién completó la independencia sudamericana?', ops: ['San Martín','Bolívar','Sucre','O\'Higgins'], r: 1 },
      { p: 'El primer presidente del Perú independiente fue:', ops: ['Simón Bolívar','José de la Riva-Agüero','San Martín','Ramón Castilla'], r: 1 },
      { p: 'La guerra con Chile (1879-1883) se llama:', ops: ['Guerra del Pacífico','Guerra del Guano','Guerra de la Independencia','Guerra del Caucho'], r: 0 },
      { p: 'Simón Bolívar nació en:', ops: ['Colombia','Venezuela','Ecuador','Perú'], r: 1 },
      { p: 'Ramón Castilla abolió la esclavitud en:', ops: ['1821','1845','1854','1879'], r: 2 },
      { p: 'El caudillismo fue un período de:', ops: ['Democracia estable','Gobierno de caudillos militares','Monarquía','Colonialismo'], r: 1 },
    ],
    4: [
      { p: '¿Cuándo se fundó el APRA?', ops: ['1920','1924','1930','1935'], r: 1 },
      { p: 'Reforma Agraria de Velasco:', ops: ['1965','1969','1975','1980'], r: 1 },
      { p: '¿Quién capturó a Abimael Guzmán?', ops: ['Fujimori','García','Belaúnde','Toledo'], r: 0 },
      { p: 'Guzmán fue capturado en:', ops: ['1990','1991','1992','1993'], r: 2 },
      { p: '"República Aristocrática" duró de 1895 a:', ops: ['1910','1915','1919','1925'], r: 2 },
      { p: '¿Cuándo comenzó Sendero Luminoso?', ops: ['1978','1980','1982','1985'], r: 1 },
      { p: 'Golpe que terminó el gobierno de Velasco:', ops: ['Elecciones','Morales Bermúdez','Renuncia','Muerte'], r: 1 },
      { p: 'El Oncenio de Leguía duró de 1919 a:', ops: ['1925','1928','1930','1933'], r: 2 },
      { p: 'Grupo terrorista junto a Sendero:', ops: ['FARC','ELN','MRTA','IRA'], r: 2 },
      { p: 'Velasco realizó la reforma:', ops: ['Educativa','Agraria','Electoral','Tributaria'], r: 1 },
      { p: 'Fujimori disolvió el Congreso en el autogolpe de:', ops: ['1990','1992','1995','1998'], r: 1 },
      { p: 'La Comisión de la Verdad (CVR) fue creada bajo el gobierno de:', ops: ['Toledo','García','Humala','Fujimori'], r: 0 },
      { p: 'La República Aristocrática fue dominada por la:', ops: ['Clase obrera','Oligarquía agroexportadora','Clase media urbana','Iglesia Católica'], r: 1 },
      { p: 'El primer gobierno de Alan García fue de 1985 a:', ops: ['1988','1990','1992','1995'], r: 1 },
      { p: 'El MRTA era un grupo:', ops: ['Político legal','Terrorista','Sindical','Religioso'], r: 1 },
    ],
    5: [
      { p: '¿Cuándo cayó el Muro de Berlín?', ops: ['1985','1987','1989','1991'], r: 2 },
      { p: '¿En qué año se disolvió la URSS?', ops: ['1989','1990','1991','1993'], r: 2 },
      { p: '¿Cuándo fue fundada la ONU?', ops: ['1939','1945','1948','1950'], r: 1 },
      { p: 'La Guerra Fría fue entre:', ops: ['EE.UU. y China','EE.UU. y Alemania','EE.UU. y URSS','EE.UU. y Japón'], r: 2 },
      { p: 'Perú en APEC pertenece al bloque:', ops: ['Europeo','Asia-Pacífico','Sudamericano','Africano'], r: 1 },
      { p: '¿Cuándo comenzó la 2da Guerra Mundial?', ops: ['1935','1937','1939','1941'], r: 2 },
      { p: 'La globalización integra:', ops: ['Solo países ricos','Economías y culturas a nivel mundial','Solo mercados financieros','Solo estados europeos'], r: 1 },
      { p: 'OEA: organización de estados:', ops: ['Europeos','Africanos','Americanos','Asiáticos'], r: 2 },
      { p: '¿Cuándo terminó la 2da Guerra Mundial?', ops: ['1943','1944','1945','1946'], r: 2 },
      { p: 'Alianza del Pacífico: Perú + Colombia + Chile +', ops: ['Brasil','Argentina','México','Ecuador'], r: 2 },
      { p: 'El Plan Marshall fue una ayuda económica de EE.UU. para:', ops: ['Asia','Europa tras la 2da GM','América Latina','África'], r: 1 },
      { p: 'La ONU tiene sede principal en:', ops: ['París','Londres','Ginebra','Nueva York'], r: 3 },
      { p: 'La decolonización africana ocurrió principalmente en la década de:', ops: ['1930s','1940s','1950-60s','1970s'], r: 2 },
      { p: 'El acuerdo de paz de Oslo (1993) involucró a:', ops: ['India y Pakistán','Israel y Palestina','Irán e Irak','EE.UU. y Cuba'], r: 1 },
      { p: 'La revolución tecnológica del siglo XXI se caracteriza por:', ops: ['El vapor','La electricidad','La digitalización e internet','La energía nuclear'], r: 2 },
    ],
  },
  comunicacion: {
    1: [
      { p: '"Corre como el viento" es:', ops: ['Metáfora','Símil','Hipérbole','Personificación'], r: 1 },
      { p: 'Texto que cuenta una historia:', ops: ['Argumentativo','Instructivo','Narrativo','Descriptivo'], r: 2 },
      { p: 'La idea principal puede ser:', ops: ['Solo explícita','Solo implícita','Explícita o implícita','Siempre al final'], r: 2 },
      { p: '"Además" es conector de:', ops: ['Contraste','Causa','Adición','Consecuencia'], r: 2 },
      { p: 'Texto instructivo:', ops: ['Cuenta un cuento','Da pasos a seguir','Describe un lugar','Defiende una idea'], r: 1 },
      { p: '"El árbol lloraba" es:', ops: ['Metáfora','Símil','Personificación','Hipérbole'], r: 2 },
      { p: 'Texto que describe características:', ops: ['Narrativo','Descriptivo','Argumentativo','Expositivo'], r: 1 },
      { p: '"Por lo tanto" indica:', ops: ['Contraste','Adición','Consecuencia','Causa'], r: 2 },
      { p: 'Texto argumentativo busca:', ops: ['Entretener','Describir','Persuadir','Instruir'], r: 2 },
      { p: 'Un párrafo es:', ops: ['Una sola oración','Conjunto de oraciones con una idea','Todo el texto','El título'], r: 1 },
      { p: '"Sin embargo" es conector de:', ops: ['Adición','Consecuencia','Contraste','Causa'], r: 2 },
      { p: 'La cohesión en un texto se logra mediante:', ops: ['Puntuación y mayúsculas solo','Uso de conectores y pronombres','Solo párrafos largos','Evitar repetir palabras'], r: 1 },
      { p: '"Tengo mil cosas que hacer" es:', ops: ['Metáfora','Personificación','Hipérbole','Símil'], r: 2 },
      { p: 'El emisor en la comunicación es:', ops: ['Quien recibe el mensaje','Quien envía el mensaje','El canal','El código'], r: 1 },
      { p: 'El texto expositivo busca:', ops: ['Persuadir','Entretener','Informar con objetividad','Dar instrucciones'], r: 2 },
    ],
    2: [
      { p: 'Género para representarse en escena:', ops: ['Narrativo','Lírico','Dramático','Ensayístico'], r: 2 },
      { p: 'Autor de "Tradiciones Peruanas":', ops: ['César Vallejo','Ricardo Palma','Mario Vargas Llosa','José María Arguedas'], r: 1 },
      { p: '"Tus ojos son dos luceros" es:', ops: ['Símil','Metáfora','Hipérbole','Anáfora'], r: 1 },
      { p: 'Género que expresa sentimientos en verso:', ops: ['Narrativo','Lírico','Dramático','Ensayístico'], r: 1 },
      { p: 'La fábula pertenece al género:', ops: ['Dramático','Lírico','Narrativo','Ensayístico'], r: 2 },
      { p: 'César Vallejo escribió:', ops: ['La ciudad y los perros','Trilce','Tradiciones Peruanas','El zorro de arriba'], r: 1 },
      { p: 'Mario Vargas Llosa ganó el Nobel en:', ops: ['2005','2008','2010','2012'], r: 2 },
      { p: 'La tragedia es parte del género:', ops: ['Narrativo','Lírico','Dramático','Épico'], r: 2 },
      { p: '"La ciudad y los perros" es:', ops: ['Lírico','Dramático','Novela (narrativo)','Ensayo'], r: 2 },
      { p: 'La épica narra hazañas de:', ops: ['Seres cotidianos','Héroes y guerreros','Personajes cómicos','Animales'], r: 1 },
      { p: 'José María Arguedas escribió:', ops: ['Trilce','Los ríos profundos','Tradiciones Peruanas','La ciudad y los perros'], r: 1 },
      { p: 'El cuento pertenece al género:', ops: ['Lírico','Dramático','Narrativo','Épico'], r: 2 },
      { p: '"Barranco tiene el mar de ojos verdes" es:', ops: ['Símil','Metáfora','Hipérbole','Anáfora'], r: 1 },
      { p: 'La anáfora es una figura de:', ops: ['Pensamiento','Dicción (repetición)','Omisión','Contraste'], r: 1 },
      { p: 'El desenlace en una historia es:', ops: ['El momento de mayor tensión','La presentación de personajes','La resolución del conflicto','El inicio del problema'], r: 2 },
    ],
    3: [
      { p: '¿Qué parte de la oración expresa la acción?', ops: ['Sustantivo','Adjetivo','Verbo','Adverbio'], r: 2 },
      { p: 'Oración simple tiene:', ops: ['Dos verbos','Un verbo','Sin verbo','Tres cláusulas'], r: 1 },
      { p: 'Sujeto de una oración es:', ops: ['Lo que se dice del sustantivo','Quien realiza la acción','El complemento directo','El verbo principal'], r: 1 },
      { p: '¿Qué clase modifica al verbo?', ops: ['Adjetivo','Sustantivo','Adverbio','Preposición'], r: 2 },
      { p: 'Tilde diacrítica en "él" se usa cuando:', ops: ['Es artículo','Es pronombre personal','Siempre','Nunca'], r: 1 },
      { p: 'Función de la preposición:', ops: ['Nombrar','Calificar','Unir palabras indicando relación','Expresar acción'], r: 2 },
      { p: 'El predicado contiene:', ops: ['Solo el sujeto','Verbo y sus complementos','Solo adjetivos','La idea secundaria'], r: 1 },
      { p: 'En "Los niños jugaban felices", el adjetivo es:', ops: ['Los','niños','jugaban','felices'], r: 3 },
      { p: 'Núcleo del sujeto en "Los estudiantes estudian":', ops: ['Los','estudiantes','estudian','Los estudiantes'], r: 1 },
      { p: 'Oración compuesta tiene:', ops: ['Un solo verbo','Dos o más proposiciones','Sin verbo','Solo sustantivos'], r: 1 },
      { p: 'La conjunción "y" une palabras con función de:', ops: ['Contraste','Adición','Consecuencia','Condición'], r: 1 },
      { p: 'El morfema es la unidad mínima con:', ops: ['Solo sonido','Significado o función gramatical','Solo escritura','Sin función'], r: 1 },
      { p: '"Se venden casas" es una oración:', ops: ['Personal activa','Personal pasiva','Impersonal refleja','Exclamativa'], r: 2 },
      { p: 'La tilde en "más" (adverbio de cantidad) es:', ops: ['Diacrítica','Esdrújula','Sobresdrújula','Grave'], r: 0 },
      { p: 'En "La flor roja cae", el sujeto es:', ops: ['La flor roja','roja cae','La flor','cae'], r: 0 },
    ],
    4: [
      { p: 'Texto argumentativo incluye obligatoriamente:', ops: ['Personajes y trama','Tesis y argumentos','Pasos a seguir','Descripción de lugares'], r: 1 },
      { p: 'El ensayo es:', ops: ['Texto narrativo con personajes','Texto en prosa con tesis propia','Lista de instrucciones','Poema en prosa'], r: 1 },
      { p: 'Argumento de autoridad usa:', ops: ['Ejemplos cotidianos','Expertos o datos oficiales','Comparaciones','Emociones'], r: 1 },
      { p: '"Prosumidor" en comunicación digital:', ops: ['Solo productor','Solo consumidor','Produce y consume','Editor profesional'], r: 2 },
      { p: 'Estructura del ensayo:', ops: ['Inicio, nudo, desenlace','Intro, tesis, argumentos, conclusión','Solo tesis y conclusión','Párrafos sin orden'], r: 1 },
      { p: 'La publicidad busca principalmente:', ops: ['Informar eventos','Vender o promover','Narrar historias','Enseñar valores'], r: 1 },
      { p: 'Repetición al inicio de verso:', ops: ['Hipérbole','Anáfora','Metáfora','Ironía'], r: 1 },
      { p: 'Función del contraargumento:', ops: ['Apoyar la tesis','Refutar objeciones','Reemplazar la tesis','Sustituir la conclusión'], r: 1 },
      { p: 'Eslogan publicitario usa:', ops: ['Argumentos lógicos','Lenguaje conciso y memorable','Estadísticas detalladas','Textos largos'], r: 1 },
      { p: 'Análisis crítico de medios implica:', ops: ['Creer todo','Identificar emisor, propósito y recursos','Solo leer titulares','Rechazar toda información'], r: 1 },
      { p: 'El título de un ensayo debe ser:', ops: ['Muy largo y detallado','Atractivo y representativo del tema','Solo el nombre del autor','Una pregunta obligatoriamente'], r: 1 },
      { p: 'La ironía dice lo contrario de:', ops: ['Lo que se piensa','Lo que se escucha','Lo que se ve','Lo que se lee'], r: 0 },
      { p: 'El texto multimodal combina:', ops: ['Solo palabras','Solo imágenes','Texto, imagen, audio y video','Solo audio y video'], r: 2 },
      { p: 'Una tesis débil carece de:', ops: ['Ortografía','Argumentos que la sustenten','Puntuación','Vocabulario'], r: 1 },
      { p: 'El informe académico tiene estructura:', ops: ['Libre','Introducción, desarrollo, conclusiones','Solo conclusiones','Narrativa con personajes'], r: 1 },
    ],
    5: [
      { p: 'Lenguaje audiovisual combina:', ops: ['Solo audio','Solo visual','Imagen y sonido','Solo texto'], r: 2 },
      { p: 'Plano general muestra:', ops: ['Solo el rostro','Cuerpo completo y entorno','Un detalle','Solo los ojos'], r: 1 },
      { p: '"Fake news" son:', ops: ['Noticias extranjeras','Noticias antiguas','Noticias falsas o manipuladas','Noticias sin fuente'], r: 2 },
      { p: 'Ángulo contrapicado muestra al sujeto:', ops: ['Desde arriba','Desde abajo','De frente','De perfil'], r: 1 },
      { p: 'Proyecto de vida incluye:', ops: ['Solo objetivos económicos','Metas personales, profesionales y valores','Solo la carrera','Lista de actividades'], r: 1 },
      { p: 'El ciberacoso es:', ops: ['Jugar videojuegos','Acoso mediante plataformas digitales','Usar internet sin permiso','Crear contenido falso'], r: 1 },
      { p: 'Propaganda busca:', ops: ['Vender productos','Cambiar actitudes o comportamientos','Entretener','Informar objetivamente'], r: 1 },
      { p: 'Receptor activo en comunicación:', ops: ['Solo recibe','Interpreta, cuestiona y retroalimenta','Ignora el mensaje','Solo decodifica'], r: 1 },
      { p: 'Fact-checking sirve para:', ops: ['Crear noticias','Verificar información antes de publicar','Censurar medios','Escribir eslóganes'], r: 1 },
      { p: 'Planos de mayor a menor amplitud:', ops: ['PP → PM → PG','PG → PM → PP','PM → PG → PP','PP → PG → PM'], r: 1 },
      { p: 'La intertextualidad es cuando un texto:', ops: ['No tiene fuentes','Hace referencia a otros textos o autores','Usa solo imágenes','No usa conectores'], r: 1 },
      { p: 'El discurso político busca principalmente:', ops: ['Informar con objetividad','Influir en la opinión pública','Entretener','Enseñar gramática'], r: 1 },
      { p: 'La identidad digital es:', ops: ['Tu documento de identidad','Tu presencia e información en internet','El correo electrónico','Tu número de celular'], r: 1 },
      { p: 'Huella digital en internet se refiere a:', ops: ['Tu firma física','El rastro de datos que dejas en línea','Tu contraseña','Tu número IP fijo'], r: 1 },
      { p: '"El mundo es un pañuelo" es:', ops: ['Hipérbole','Comparación','Metáfora','Eufemismo'], r: 2 },
    ],
  },
  ingles: {
    1: [
      { p: '"She ___ a student."', ops: ['am','is','are','be'], r: 1 },
      { p: '"Good morning" se usa:', ops: ['De noche','En la tarde','En la mañana','Al mediodía'], r: 2 },
      { p: '"Rojo" en inglés:', ops: ['Blue','Green','Red','Yellow'], r: 2 },
      { p: 'One, two, ___, four', ops: ['three','free','tree','thre'], r: 0 },
      { p: '"They ___ happy."', ops: ['is','am','are','be'], r: 2 },
      { p: 'Plural of "book":', ops: ['bookies','books','bookes','booksies'], r: 1 },
      { p: '"Goodbye" significa:', ops: ['Hola','Gracias','Adiós','Por favor'], r: 2 },
      { p: '"I ___ from Peru."', ops: ['is','am','are','be'], r: 1 },
      { p: 'Color del cielo en un día despejado:', ops: ['Red','Green','Blue','Yellow'], r: 2 },
      { p: 'Días de la semana en inglés son:', ops: ['5','6','7','8'], r: 2 },
      { p: '"Big" en español es:', ops: ['Pequeño','Grande','Rápido','Lento'], r: 1 },
      { p: 'Plural of "box":', ops: ['boxs','boxes','boxies','boxen'], r: 1 },
      { p: '"What time is it?" significa:', ops: ['¿Dónde estás?','¿Qué hora es?','¿Cómo estás?','¿Cuánto cuesta?'], r: 1 },
      { p: '"I ___ hungry." (estar con hambre)', ops: ['am','is','are','be'], r: 0 },
      { p: '"Happy" en español es:', ops: ['Triste','Cansado','Feliz','Enojado'], r: 2 },
    ],
    2: [
      { p: 'Pasado irregular de "go":', ops: ['goed','gone','went','goes'], r: 2 },
      { p: '"She ___ English every day."', ops: ['study','studys','studies','studied'], r: 2 },
      { p: '"Siempre" en inglés:', ops: ['never','sometimes','often','always'], r: 3 },
      { p: '"Do you like pizza?" → "Yes, I ___."', ops: ['do','does','am','like'], r: 0 },
      { p: 'Pasado de "eat":', ops: ['eated','ate','eaten','eats'], r: 1 },
      { p: '"Where ___ you live?"', ops: ['does','is','do','are'], r: 2 },
      { p: '"I ___ like coffee." (negativo)', ops: ['not','dont',"don't","doesn't"], r: 2 },
      { p: '"He ___ TV every night." (3rd person)', ops: ['watch','watchs','watches','watched'], r: 2 },
      { p: 'Expresión de tiempo para present simple:', ops: ['yesterday','last week','every day','two days ago'], r: 2 },
      { p: '"They ___ not at school today."', ops: ['is','am','are','be'], r: 2 },
      { p: 'Pasado de "write":', ops: ['writed','wrote','written','writ'], r: 1 },
      { p: '"How ___ oranges do you want?"', ops: ['many','much','any','some'], r: 0 },
      { p: '"There ___ a lot of students here."', ops: ['is','am','are','be'], r: 2 },
      { p: '"She ___ her homework every night." (routine)', ops: ['do','did','does','done'], r: 2 },
      { p: '"Never" se ubica en la oración:', ops: ['Al inicio siempre','Entre sujeto y verbo principal','Al final siempre','Después del objeto'], r: 1 },
    ],
    3: [
      { p: '"I ___ to the market yesterday." (go)', ops: ['go','goes','went','gone'], r: 2 },
      { p: 'Pasado de "buy":', ops: ['buyed','byed','bought','buys'], r: 2 },
      { p: '"Did you ___ breakfast?"', ops: ['ate','eat','eated','eating'], r: 1 },
      { p: 'Expresión de tiempo pasado:', ops: ['every day','tomorrow','yesterday','usually'], r: 2 },
      { p: 'Negativo pasado: "She ___ go."', ops: ['not did',"didn't","doesn't","isn't"], r: 1 },
      { p: 'Pasado de "see":', ops: ['sawed','seed','seen','saw'], r: 3 },
      { p: '"They ___ a great movie last night."', ops: ['watch','watches','watched','are watching'], r: 2 },
      { p: '"Was/were" es pasado de:', ops: ['do','have','be','go'], r: 2 },
      { p: '"___ you study last night?"', ops: ['Do','Does','Did','Were'], r: 2 },
      { p: 'Pasado de "have":', ops: ['haved','have','had','has'], r: 2 },
      { p: '"I ___ (not go) to the party last Saturday."', ops: ["didn't went","didn't go","don't go","wasn't go"], r: 1 },
      { p: 'Pasado de "speak":', ops: ['speaked','spoken','spoke','speeks'], r: 2 },
      { p: 'Pasado de "come":', ops: ['comed','came','come','comes'], r: 1 },
      { p: '"___ she call you yesterday?"', ops: ['Do','Does','Did','Was'], r: 2 },
      { p: '"Last year" es expresión de tiempo para:', ops: ['Present simple','Present perfect','Past simple','Future'], r: 2 },
    ],
    4: [
      { p: '"I ___ visit Paris, I already have tickets."', ops: ['will','am going to','would','should'], r: 1 },
      { p: '"If you study, you ___ pass."', ops: ['would','will','might','should'], r: 1 },
      { p: '"You ___ see a doctor." (consejo)', ops: ['must','can','should','will'], r: 2 },
      { p: '"She ___ swim very well." (habilidad)', ops: ['must','can','should','will'], r: 1 },
      { p: 'Modal de obligación fuerte:', ops: ['can','should','must','would'], r: 2 },
      { p: '"It ___ rain tomorrow." (predicción espontánea)', ops: ['going to','will','must','should'], r: 1 },
      { p: '"If it rains, we ___ stay home."', ops: ['would','will','might','should'], r: 1 },
      { p: '"___ I open the window?" (permiso)', ops: ['Must','Should','May','Will'], r: 2 },
      { p: '"I ___ help you." (oferta)', ops: ['must','should','will','can'], r: 2 },
      { p: '"Going to" se usa para:', ops: ['Decisiones espontáneas','Planes ya decididos','Predicciones sin evidencia','Obligaciones'], r: 1 },
      { p: '"You ___ not smoke here." (prohibición fuerte)', ops: ['should','can','must','will'], r: 2 },
      { p: '"___ you help me, please?" (petición educada)', ops: ['Will','Would','Must','Should'], r: 1 },
      { p: '"It ___ be cold tomorrow." (posibilidad)', ops: ['must','will','might','should'], r: 2 },
      { p: '"If I had money, I ___ travel." (hipotético)', ops: ['will','would','must','can'], r: 1 },
      { p: '"Can" expresa principalmente:', ops: ['Obligación','Habilidad o posibilidad','Consejo','Predicción'], r: 1 },
    ],
    5: [
      { p: '"I have visited Paris." es:', ops: ['Past simple','Present perfect','Future simple','Present continuous'], r: 1 },
      { p: '"They build houses." → Passive:', ops: ['Houses built.','Houses are built.','They are built.','Houses were built.'], r: 1 },
      { p: '"The student ___ won the prize is from Lima."', ops: ['which','where','who','whom'], r: 2 },
      { p: '"I have ___ finished." (keyword)', ops: ['ago','last','just','yesterday'], r: 2 },
      { p: '"The book ___ written by Vargas Llosa."', ops: ['is','was','were','be'], r: 1 },
      { p: '"Lima, ___ is the capital, is beautiful."', ops: ['who','where','which','that'], r: 2 },
      { p: '"She has lived here ___ 2010."', ops: ['for','since','ago','until'], r: 1 },
      { p: '"Have you ___ visited Machu Picchu?"', ops: ['always','never','ever','just'], r: 2 },
      { p: '"Houses ___ built every year." (presente pasiva)', ops: ['is','are','were','was'], r: 1 },
      { p: 'Present perfect con "for" indica:', ops: ['Fecha específica','Duración de tiempo','Experiencia de vida','Acción reciente'], r: 1 },
      { p: '"The letter ___ sent yesterday." (pasiva pasado)', ops: ['is','are','was','were'], r: 2 },
      { p: '"I ___ never ___ sushi." (present perfect)', ops: ['have/eat','have/eaten','had/eaten','did/eat'], r: 1 },
      { p: '"The man ___ lives next door is a doctor." (relativa)', ops: ['which','where','who','whom'], r: 2 },
      { p: '"She has worked here ___ three years."', ops: ['since','for','ago','until'], r: 1 },
      { p: 'En voz pasiva el sujeto de la activa pasa a ser el:', ops: ['Verbo','Complemento agente','Sujeto pasivo','Objeto directo'], r: 1 },
    ],
  },
};

// ── Flashcards Inglés por grado ─────────────────────
const FLASHCARDS = {
  1: [
    { f: 'Hello / Hi', b: 'Hola (informal)', ex: '"Hello! My name is Ana."' },
    { f: 'What is your name?', b: '¿Cómo te llamas?', ex: '"My name is Carlos."' },
    { f: 'How old are you?', b: '¿Cuántos años tienes?', ex: '"I am 12 years old."' },
    { f: 'Where are you from?', b: '¿De dónde eres?', ex: '"I am from Peru."' },
    { f: 'This is a book.', b: 'Esto es un libro.', ex: '"This is a pencil."' },
    { f: 'red / blue / green', b: 'rojo / azul / verde', ex: '"The apple is red."' },
    { f: 'one, two, three...', b: 'uno, dos, tres...', ex: '"I have three brothers."' },
    { f: 'Monday, Tuesday...', b: 'Lunes, Martes...', ex: '"Today is Monday."' },
  ],
  2: [
    { f: 'I wake up at 6 AM.', b: 'Me despierto a las 6 AM.', ex: '"She wakes up early every day."' },
    { f: 'always / usually / sometimes', b: 'siempre / generalmente / a veces', ex: '"I always brush my teeth."' },
    { f: 'do / does / don\'t / doesn\'t', b: 'auxiliares del present simple', ex: '"Does she study English?"' },
    { f: 'go → went', b: 'ir → fui/fue', ex: '"I went to school yesterday."' },
    { f: 'eat → ate', b: 'comer → comí/comió', ex: '"She ate pizza last night."' },
    { f: 'have → had', b: 'tener → tuve/tuvo', ex: '"We had a great time."' },
    { f: 'in / on / at (time)', b: 'Preposiciones de tiempo', ex: '"I study at night."' },
    { f: 'How often do you...?', b: '¿Con qué frecuencia...?', ex: '"How often do you exercise?"' },
  ],
  3: [
    { f: 'walked / talked / played', b: 'Pasado regular: +ed', ex: '"They played football yesterday."' },
    { f: 'see → saw', b: 'ver → vi/vio', ex: '"I saw a great movie."' },
    { f: 'buy → bought', b: 'comprar → compré/compró', ex: '"She bought new shoes."' },
    { f: 'take → took', b: 'tomar → tomó/tomé', ex: '"He took the bus."' },
    { f: 'make → made', b: 'hacer → hizo/hice', ex: '"They made a cake."' },
    { f: 'last week / ago / yesterday', b: 'Expresiones de tiempo pasado', ex: '"Two days ago I visited my grandma."' },
    { f: 'was / were', b: 'Pasado de "to be"', ex: '"She was happy. They were tired."' },
    { f: 'Did + verb base', b: 'Pregunta en pasado simple', ex: '"Did you eat breakfast?"' },
  ],
  4: [
    { f: 'will + verb', b: 'Futuro (decisión espontánea)', ex: '"I will help you with that."' },
    { f: 'am/is/are going to', b: 'Planes ya decididos', ex: '"I\'m going to study abroad."' },
    { f: 'can / could', b: 'Habilidad presente/pasado', ex: '"She can speak three languages."' },
    { f: 'should', b: 'Consejo o recomendación', ex: '"You should sleep early."' },
    { f: 'must', b: 'Obligación fuerte', ex: '"You must wear a seatbelt."' },
    { f: 'If + present, will + verb', b: 'Condicional tipo 1', ex: '"If you study, you will pass."' },
    { f: 'may / might', b: 'Posibilidad', ex: '"It might rain tomorrow."' },
    { f: 'would like', b: 'Querer educadamente', ex: '"I would like a glass of water."' },
  ],
  5: [
    { f: 'have/has + past participle', b: 'Present perfect', ex: '"I have visited Machu Picchu."' },
    { f: 'ever / never / just / already / yet', b: 'Keywords del present perfect', ex: '"Have you ever eaten ceviche?"' },
    { f: 'to be + past participle', b: 'Voz pasiva', ex: '"The book was written by Vargas Llosa."' },
    { f: 'who / which / where', b: 'Pronombres relativos', ex: '"The girl who won is from Cusco."' },
    { f: 'since / for', b: 'Desde / hace (con perfect)', ex: '"I have lived here since 2010."' },
    { f: 'Defining vs non-defining clause', b: 'Relativas definidas vs no definidas', ex: '"Lima, which is the capital, is big."' },
    { f: 'been vs gone', b: 'visitado y regresado vs fue y no volvió', ex: '"She has been to Paris."' },
    { f: 'am/is/are + pp (passive)', b: 'Voz pasiva presente', ex: '"Houses are built every year."' },
  ],
};

// ── Fórmulas Matemática por grado ───────────────────
const FORMULAS = {
  1: [
    { partes: ['Area rectangulo = base × ', '____'], r: 'altura', pista: 'A = b × ?' },
    { partes: ['MCM: factores primos con mayor ', '____'], r: 'exponente', pista: 'mayor ...' },
    { partes: ['Porcentaje = (parte ÷ ', '____ ) × 100'], r: 'total', pista: '(p÷?)×100' },
    { partes: ['Fraccion = Numerador ÷ ', '____'], r: 'denominador', pista: 'a ÷ ?' },
  ],
  2: [
    { partes: ['ax + b = 0  →  x = −b ÷ ', '____'], r: 'a', pista: 'x=−b/?' },
    { partes: ['(a + b)2 = a2 + 2ab + ', '____'], r: 'b2', pista: '...+?' },
    { partes: ['a2 − b2 = (a+b)(a', '____', ')'], r: '-b', pista: '(a+b)(a?)' },
    { partes: ['Pendiente m = dy ÷ ', '____'], r: 'dx', pista: 'm=dy÷?' },
  ],
  3: [
    { partes: ['Pitagoras: c2 = a2 + ', '____'], r: 'b2', pista: 'c2=a2+?' },
    { partes: ['sen θ = opuesto ÷ ', '____'], r: 'hipotenusa', pista: 'SOH' },
    { partes: ['Area triangulo = (base × altura) ÷ ', '____'], r: '2', pista: '(b×h)÷?' },
    { partes: ['cos θ = adyacente ÷ ', '____'], r: 'hipotenusa', pista: 'CAH' },
  ],
  4: [
    { partes: ['Media = suma ÷ ', '____'], r: 'n', pista: 'suma÷?' },
    { partes: ['P(A) = favorables ÷ ', '____'], r: 'posibles', pista: 'P=fav÷?' },
    { partes: ['f(x) = ', '____', 'x + b  (pendiente)'], r: 'm', pista: 'f(x)=?x+b' },
    { partes: ['Varianza = suma(xi - media)2 ÷ ', '____'], r: 'n', pista: 'suma(...)÷?' },
  ],
  5: [
    { partes: ['d/dx(xn) = n · x^(', '____', '-1)'], r: 'n', pista: 'n·x^(n-1)' },
    { partes: ['integral xn dx = x^(n+1) ÷ (n+1) + ', '____'], r: 'C', pista: '...+?' },
    { partes: ['|v| = raiz(x2 + ', '____', ')'], r: 'y2', pista: 'raiz(x2+?)' },
    { partes: ["f'(x) de 3x2 + 2x = ", "____"], r: '6x + 2', pista: '6x+?' },
  ],
};

// ── Verdadero / Falso (ciencia e historia) ──────────
const VF = {
  ciencia: {
    1: [
      { s: 'Las plantas producen O₂ en la fotosíntesis.', r: true },
      { s: 'Las bacterias son células eucariotas.', r: false },
      { s: 'La mitocondria produce energía en la célula.', r: true },
      { s: 'El ecosistema solo incluye seres vivos.', r: false },
      { s: 'El sistema circulatorio transporta sangre.', r: true },
    ],
    2: [
      { s: 'El número atómico indica la cantidad de protones.', r: true },
      { s: 'El pH mide la temperatura de una solución.', r: false },
      { s: 'Los gases nobles son muy reactivos.', r: false },
      { s: 'El agua tiene fórmula H₂O.', r: true },
      { s: 'La neutralización produce sal y agua.', r: true },
    ],
    3: [
      { s: 'En MRU la velocidad es constante.', r: true },
      { s: 'F = m × a es la Primera Ley de Newton.', r: false },
      { s: 'La energía cinética es Ec = ½mv².', r: true },
      { s: 'La luz es una onda mecánica.', r: false },
      { s: 'El trabajo se calcula con W = F × d.', r: true },
    ],
    4: [
      { s: 'Los alcanos tienen doble enlace C=C.', r: false },
      { s: 'El reactivo limitante se agota primero.', r: true },
      { s: 'Los alcoholes tienen grupo funcional −OH.', r: true },
      { s: 'La estequiometría calcula cantidades en reacciones.', r: true },
      { s: 'Los alquenos tienen fórmula CₙH₂ₙ₊₂.', r: false },
    ],
    5: [
      { s: 'E = mc² es la equivalencia masa-energía.', r: true },
      { s: 'El Sistema Solar tiene 9 planetas.', r: false },
      { s: 'La fisión divide núcleos pesados.', r: true },
      { s: 'La velocidad de la luz es 3×10⁸ m/s.', r: true },
      { s: 'La fusión nuclear es la misma que una reacción química.', r: false },
    ],
  },
  historia: {
    1: [
      { s: 'Egipto se desarrolló en torno al río Nilo.', r: true },
      { s: 'La democracia fue inventada en Roma.', r: false },
      { s: 'El Perú tiene 3 regiones naturales.', r: true },
      { s: 'Mesopotamia fue cuna de la escritura cuneiforme.', r: true },
      { s: 'El Perú tiene 20 departamentos.', r: false },
    ],
    2: [
      { s: 'La capital del Imperio Inca fue Cusco.', r: true },
      { s: 'Francisco Pizarro llegó al Perú en 1532.', r: true },
      { s: 'El Tahuantinsuyo tenía 3 suyos.', r: false },
      { s: 'La mita era un trabajo forzado en el Virreinato.', r: true },
      { s: 'El Virreinato del Perú fue creado en 1532.', r: false },
    ],
    3: [
      { s: 'La independencia del Perú fue en 1821.', r: true },
      { s: 'San Martín completó la independencia sudamericana.', r: false },
      { s: 'La Batalla de Ayacucho fue en 1824.', r: true },
      { s: 'La rebelión de Túpac Amaru II fue en 1780.', r: true },
      { s: 'El Perú adoptó una monarquía tras la independencia.', r: false },
    ],
    4: [
      { s: 'El APRA fue fundado en 1924.', r: true },
      { s: 'Velasco realizó la Reforma Agraria en 1975.', r: false },
      { s: 'Fujimori capturó a Abimael Guzmán en 1992.', r: true },
      { s: 'Sendero Luminoso inició en 1978.', r: false },
      { s: 'El Oncenio fue el gobierno de Leguía.', r: true },
    ],
    5: [
      { s: 'El Muro de Berlín cayó en 1989.', r: true },
      { s: 'La ONU fue fundada en 1939.', r: false },
      { s: 'La Guerra Fría fue entre EE.UU. y la URSS.', r: true },
      { s: 'La URSS se disolvió en 1989.', r: false },
      { s: 'Perú pertenece a la Alianza del Pacífico.', r: true },
    ],
  },
};

// ── Ordenar pasos (ciencia e historia) ──────────────
const ORDENAR = {
  ciencia: {
    1: { en: 'Ordena los pasos de la FOTOSÍNTESIS:', items: ['Los cloroplastos captan la luz solar','La planta absorbe CO₂ y H₂O','Se produce glucosa y O₂','La glucosa se usa como energía'], ok: ['La planta absorbe CO₂ y H₂O','Los cloroplastos captan la luz solar','Se produce glucosa y O₂','La glucosa se usa como energía'] },
    2: { en: 'Ordena los pasos del MÉTODO CIENTÍFICO:', items: ['Análisis y conclusión','Observación del fenómeno','Experimentación','Formulación de hipótesis'], ok: ['Observación del fenómeno','Formulación de hipótesis','Experimentación','Análisis y conclusión'] },
    3: { en: 'Ordena el MOVIMIENTO UNIFORMEMENTE ACELERADO:', items: ['Calcular distancia: d=v₀t+½at²','Medir velocidad inicial v₀','Calcular aceleración: a=(v−v₀)/t','Medir velocidad final v'], ok: ['Medir velocidad inicial v₀','Medir velocidad final v','Calcular aceleración: a=(v−v₀)/t','Calcular distancia: d=v₀t+½at²'] },
    4: { en: 'Ordena una REACCIÓN QUÍMICA de síntesis:', items: ['Balancear la ecuación','Identificar los reactivos','Verificar conservación de la masa','Escribir los productos'], ok: ['Identificar los reactivos','Escribir los productos','Balancear la ecuación','Verificar conservación de la masa'] },
    5: { en: 'Ordena el CICLO DE VIDA DE UNA ESTRELLA tipo Sol:', items: ['Gigante roja','Nebulosa solar','Enana blanca','Estrella de secuencia principal'], ok: ['Nebulosa solar','Estrella de secuencia principal','Gigante roja','Enana blanca'] },
  },
  historia: {
    1: { en: 'Ordena del más antiguo al más reciente:', items: ['Civilización griega (~800 a.C.)','Imperio Romano (~27 a.C.)','Mesopotamia (~3500 a.C.)','Egipto antiguo (~3100 a.C.)'], ok: ['Mesopotamia (~3500 a.C.)','Egipto antiguo (~3100 a.C.)','Civilización griega (~800 a.C.)','Imperio Romano (~27 a.C.)'] },
    2: { en: 'Ordena estos eventos del PERÚ PREHISPÁNICO e COLONIAL:', items: ['Lima fundada (1535)','El Virreinato (1542)','El Tahuantinsuyo (1438)','La Conquista (1532)'], ok: ['El Tahuantinsuyo (1438)','La Conquista (1532)','Lima fundada (1535)','El Virreinato (1542)'] },
    3: { en: 'Ordena el PROCESO DE INDEPENDENCIA:', items: ['Batalla de Ayacucho (1824)','Llegada de San Martín (1820)','Rebelión de Túpac Amaru II (1780)','Proclamación de independencia (1821)'], ok: ['Rebelión de Túpac Amaru II (1780)','Llegada de San Martín (1820)','Proclamación de independencia (1821)','Batalla de Ayacucho (1824)'] },
    4: { en: 'Ordena estos eventos del SIGLO XX PERUANO:', items: ['Captura de Guzmán (1992)','Inicio de Sendero Luminoso (1980)','Reforma Agraria de Velasco (1969)','Fundación del APRA (1924)'], ok: ['Fundación del APRA (1924)','Reforma Agraria de Velasco (1969)','Inicio de Sendero Luminoso (1980)','Captura de Guzmán (1992)'] },
    5: { en: 'Ordena estos eventos CONTEMPORÁNEOS:', items: ['Disolución de la URSS (1991)','Caída del Muro de Berlín (1989)','Inicio de la 2da Guerra Mundial (1939)','Fundación de la ONU (1945)'], ok: ['Inicio de la 2da Guerra Mundial (1939)','Fundación de la ONU (1945)','Caída del Muro de Berlín (1989)','Disolución de la URSS (1991)'] },
  },
};

// ══════════════════════════════════════════════════
// BANCO — TECNOLOGÍA
// ══════════════════════════════════════════════════
BANCO.tecnologia = {
  1: [
    { p: '¿Qué es el hardware?', ops: ['El software del sistema','Los programas instalados','Los componentes físicos del computador','El sistema operativo'], r: 2 },
    { p: 'El ratón (mouse) es un dispositivo de:', ops: ['Salida','Entrada','Almacenamiento','Procesamiento'], r: 1 },
    { p: 'La impresora es un dispositivo de:', ops: ['Entrada','Salida','Almacenamiento','Procesamiento'], r: 1 },
    { p: '¿Qué hace la CPU?', ops: ['Almacena datos permanentemente','Procesa instrucciones y datos','Muestra imágenes','Conecta a internet'], r: 1 },
    { p: 'La pantalla (monitor) es un dispositivo de:', ops: ['Entrada','Procesamiento','Salida','Almacenamiento'], r: 2 },
    { p: '¿Qué es el software?', ops: ['Circuitos electrónicos','Programas e instrucciones','Memoria RAM','Disco duro'], r: 1 },
    { p: 'La RAM sirve para:', ops: ['Almacenar datos permanentemente','Memoria temporal de trabajo','Conectar periféricos','Mostrar imágenes'], r: 1 },
    { p: 'El teclado es un dispositivo de:', ops: ['Salida','Almacenamiento','Entrada','Procesamiento'], r: 2 },
    { p: 'Windows y macOS son ejemplos de:', ops: ['Aplicaciones de oficina','Sistemas operativos','Lenguajes de programación','Navegadores web'], r: 1 },
    { p: 'El disco duro sirve para:', ops: ['Procesar datos','Mostrar gráficos','Almacenar datos permanentemente','Conectar a internet'], r: 2 },
    { p: '¿Qué significa USB?', ops: ['Universal Serial Bus','United System Base','Ultra Speed Boot','Unified Source Board'], r: 0 },
    { p: 'Un archivo con extensión .jpg es:', ops: ['Un documento de texto','Una imagen','Un video','Un audio'], r: 1 },
    { p: 'El navegador web sirve para:', ops: ['Editar documentos','Acceder a páginas de internet','Hacer cálculos','Almacenar archivos'], r: 1 },
    { p: '¿Cuántos bits tiene 1 byte?', ops: ['4','6','8','16'], r: 2 },
    { p: 'El correo electrónico sirve para:', ops: ['Jugar videojuegos','Enviar y recibir mensajes digitales','Almacenar música','Ver películas'], r: 1 },
  ],
  2: [
    { p: 'HTML es un lenguaje de:', ops: ['Programación de apps','Marcado para páginas web','Bases de datos','Diseño gráfico'], r: 1 },
    { p: 'Una base de datos almacena:', ops: ['Solo imágenes','Información organizada en tablas','Solo texto','Solo videos'], r: 1 },
    { p: 'Algoritmo es:', ops: ['Un tipo de virus','Secuencia ordenada de pasos para resolver un problema','Un lenguaje de programación','Una red social'], r: 1 },
    { p: 'El Wi-Fi permite:', ops: ['Conectar dispositivos de forma inalámbrica a internet','Almacenar datos en la nube','Proteger contra virus','Crear aplicaciones'], r: 0 },
    { p: '¿Qué es una hoja de cálculo?', ops: ['Editor de texto','Programa para tablas y cálculos numéricos','Navegador web','Editor de imágenes'], r: 1 },
    { p: 'El phishing busca:', ops: ['Acelerar internet','Robar datos personales mediante engaño','Mejorar el hardware','Crear redes sociales'], r: 1 },
    { p: 'Una contraseña segura debe tener:', ops: ['Solo letras','Solo números','Combinación de letras, números y símbolos','Solo 4 dígitos'], r: 2 },
    { p: 'La nube (cloud) en tecnología es:', ops: ['Un servidor físico en tu casa','Almacenamiento y servicios por internet','Una red local','Un tipo de virus'], r: 1 },
    { p: 'Copiar y Pegar usa los atajos:', ops: ['Ctrl+X y Ctrl+V','Ctrl+C y Ctrl+V','Ctrl+Z y Ctrl+Y','Alt+F4'], r: 1 },
    { p: 'Un antivirus sirve para:', ops: ['Acelerar el procesador','Detectar y eliminar malware','Conectar a internet','Crear archivos'], r: 1 },
    { p: 'La resolución de una imagen se mide en:', ops: ['Bytes','Hertz','Píxeles (px)','Watts'], r: 2 },
    { p: '¿Qué es un foro en internet?', ops: ['Una red social de videos','Espacio de discusión en línea','Un tipo de correo','Un antivirus'], r: 1 },
    { p: 'El archivo .pdf fue creado por:', ops: ['Microsoft','Apple','Adobe','Google'], r: 2 },
    { p: 'Seleccionar todo el texto: atajo de teclado', ops: ['Ctrl+A','Ctrl+S','Ctrl+P','Ctrl+Z'], r: 0 },
    { p: 'Una LAN es una red:', ops: ['Global','De área local','Inalámbrica exclusivamente','Solo de internet'], r: 1 },
  ],
  3: [
    { p: 'CSS en diseño web significa:', ops: ['Computer Style Script','Cascading Style Sheets','Creative System Software','Custom Site Structure'], r: 1 },
    { p: 'Una variable en programación almacena:', ops: ['Solo números','Solo texto','Un dato que puede cambiar','Instrucciones del programa'], r: 2 },
    { p: '"If / else" en programación es una estructura de:', ops: ['Repetición','Decisión / condicional','Función','Clase'], r: 1 },
    { p: 'Un bucle "for" se usa para:', ops: ['Tomar decisiones','Definir funciones','Repetir instrucciones un número determinado de veces','Almacenar datos'], r: 2 },
    { p: 'Python es un:', ops: ['Sistema operativo','Lenguaje de programación','Navegador web','Tipo de base de datos'], r: 1 },
    { p: 'La dirección IP identifica:', ops: ['El nombre del usuario','Un dispositivo en una red','El sistema operativo','La marca del computador'], r: 1 },
    { p: 'El protocolo HTTPS indica:', ops: ['Conexión lenta','Comunicación cifrada y segura','Sin conexión a internet','Red local'], r: 1 },
    { p: '¿Qué es un diagrama de flujo?', ops: ['Tipo de base de datos','Representación visual de un algoritmo','Lenguaje de programación','Tipo de red'], r: 1 },
    { p: 'Una función en programación:', ops: ['Solo almacena datos','Ejecuta un bloque reutilizable de código','Es un tipo de variable','Controla el hardware'], r: 1 },
    { p: 'El operador "==" en programación compara:', ops: ['Asigna un valor','Comprueba si dos valores son iguales','Suma dos números','Declara una variable'], r: 1 },
    { p: 'Scratch es una herramienta de:', ops: ['Diseño gráfico','Programación visual para principiantes','Edición de video','Hojas de cálculo'], r: 1 },
    { p: 'Una lista/array almacena:', ops: ['Un solo valor','Múltiples valores en orden','Solo texto','Solo imágenes'], r: 1 },
    { p: 'El navegador interpreta el código:', ops: ['Python','SQL','HTML/CSS/JS','C++'], r: 2 },
    { p: 'Debugging significa:', ops: ['Crear un programa','Diseñar una interfaz','Encontrar y corregir errores en el código','Compilar un programa'], r: 2 },
    { p: 'Una API permite:', ops: ['Solo almacenar datos','Comunicación entre aplicaciones distintas','Crear diseños web','Gestionar contraseñas'], r: 1 },
  ],
  4: [
    { p: 'La inteligencia artificial imita:', ops: ['El hardware de computadoras','Procesos cognitivos humanos','Redes de internet','Bases de datos'], r: 1 },
    { p: 'Big Data se refiere a:', ops: ['Archivos muy pesados','Grandes volúmenes de datos difíciles de procesar con métodos tradicionales','Solo bases de datos','Videos en alta definición'], r: 1 },
    { p: 'El machine learning permite a las máquinas:', ops: ['Solo calcular sumas','Aprender de datos sin programación explícita','Fabricar hardware','Imprimir en 3D'], r: 1 },
    { p: 'IoT (Internet de las Cosas) conecta:', ops: ['Solo computadoras','Objetos cotidianos a internet','Solo teléfonos','Solo servidores'], r: 1 },
    { p: 'La ciberseguridad protege:', ops: ['Solo computadoras antiguas','Sistemas, redes y datos ante ataques digitales','Solo redes sociales','Solo contraseñas'], r: 1 },
    { p: 'Un chatbot es:', ops: ['Un virus informático','Programa que simula conversación humana','Un tipo de base de datos','Una red social'], r: 1 },
    { p: 'Blockchain es una tecnología de:', ops: ['Diseño web','Registro distribuido e inmutable de datos','Edición de video','Inteligencia artificial'], r: 1 },
    { p: 'La realidad aumentada (AR) combina:', ops: ['Solo imágenes digitales','Mundo real con elementos digitales superpuestos','Solo videos','Solo texto'], r: 1 },
    { p: 'SQL se usa para:', ops: ['Diseñar páginas web','Gestionar y consultar bases de datos relacionales','Programar robots','Crear presentaciones'], r: 1 },
    { p: 'Un servidor web almacena y sirve:', ops: ['Solo correos','Archivos y páginas web a los navegadores','Solo imágenes','Solo videos'], r: 1 },
    { p: 'Git es una herramienta de:', ops: ['Diseño gráfico','Control de versiones de código','Análisis de datos','Edición de audio'], r: 1 },
    { p: 'La impresión 3D construye objetos:', ops: ['Fotografiando','Capa por capa a partir de un modelo digital','Soldando metales','Cortando madera'], r: 1 },
    { p: 'Scrum es una metodología de trabajo:', ops: ['De diseño gráfico','Ágil para desarrollo de software','De contabilidad','De marketing'], r: 1 },
    { p: 'La nube pública es gestionada por:', ops: ['El usuario final','Proveedores externos como AWS o Google','Solo empresas privadas','El gobierno'], r: 1 },
    { p: 'UX significa:', ops: ['Universal eXtra','User eXperience (Experiencia del Usuario)','Ultra eXtended','United eXchange'], r: 1 },
  ],
  5: [
    { p: 'La automatización industrial reemplaza tareas:', ops: ['Solo creativas','Repetitivas y manuales','Solo de gestión','Solo de diseño'], r: 1 },
    { p: 'Un emprendimiento tecnológico (startup) se caracteriza por:', ops: ['Gran empresa establecida','Empresa nueva con modelo escalable e innovador','Solo empresas de hardware','Solo apps móviles'], r: 1 },
    { p: 'El teletrabajo es:', ops: ['Trabajar solo de noche','Trabajar de forma remota usando tecnología','Trabajar en turnos','Solo para programadores'], r: 1 },
    { p: 'La huella digital es:', ops: ['Tu firma física en documentos','El rastro de datos que dejas en internet','Tu contraseña maestra','Tu dirección IP fija'], r: 1 },
    { p: 'Los derechos de autor protegen:', ops: ['Solo inventos físicos','Obras creativas e intelectuales','Solo marcas comerciales','Solo software comercial'], r: 1 },
    { p: 'El pensamiento computacional incluye:', ops: ['Solo programar en Python','Descomponer problemas, patrones, abstracción y algoritmos','Solo usar Excel','Solo diseñar interfaces'], r: 1 },
    { p: 'Una startup unicornio vale más de:', ops: ['100 millones','500 millones','1 billón (1 000 millones) de dólares','10 millones'], r: 2 },
    { p: 'El trabajo en la era digital requiere:', ops: ['Solo habilidades físicas','Habilidades digitales, pensamiento crítico y adaptabilidad','Solo memorización','Solo inglés'], r: 1 },
    { p: 'La economía circular en tecnología busca:', ops: ['Producir más rápido','Reducir residuos y reutilizar recursos tecnológicos','Aumentar costos','Solo exportar'], r: 1 },
    { p: 'Los e-residuos (basura electrónica) son:', ops: ['Correos spam','Dispositivos electrónicos desechados','Archivos borrados','Errores de programación'], r: 1 },
    { p: 'La transformación digital de una empresa implica:', ops: ['Solo comprar computadoras','Integrar tecnología digital en todos sus procesos','Solo tener redes sociales','Solo usar email'], r: 1 },
    { p: 'Design Thinking es:', ops: ['Un lenguaje de programación','Metodología creativa centrada en el usuario para resolver problemas','Un tipo de base de datos','Un protocolo de red'], r: 1 },
    { p: 'El freelancing tecnológico implica:', ops: ['Trabajar en una sola empresa siempre','Trabajar de forma independiente para varios clientes','Solo trabajar en el extranjero','Solo hacer diseño'], r: 1 },
    { p: 'La privacidad digital implica:', ops: ['Compartir todo en redes','Controlar qué datos personales se comparten y con quién','Usar contraseñas cortas','Evitar usar internet'], r: 1 },
    { p: 'STEM/STEAM en educación integra:', ops: ['Solo matemáticas','Ciencias, Tecnología, Ingeniería, Artes y Matemáticas','Solo tecnología','Solo ciencias'], r: 1 },
  ],
};

// ══════════════════════════════════════════════════
// DATOS AHORCADO por área y grado
// ══════════════════════════════════════════════════
const AHORCADO = {
  matematica: {
    1: [{w:'FRACCION',h:'Numerador dividido entre denominador'},{w:'PORCENTAJE',h:'De cada cien partes'},{w:'TRIANGULO',h:'Polígono de 3 lados'},{w:'PERIMETRO',h:'Suma de todos los lados'}],
    2: [{w:'ALGEBRA',h:'Rama que usa letras para representar números'},{w:'ECUACION',h:'Igualdad con incógnitas'},{w:'POLINOMIO',h:'Suma de monomios'},{w:'PENDIENTE',h:'Inclinación de una recta'}],
    3: [{w:'HIPOTENUSA',h:'Lado mayor del triángulo rectángulo'},{w:'PITAGORAS',h:'c²=a²+b²'},{w:'TRIGONOMETRIA',h:'Estudio de ángulos y lados'},{w:'CIRCUNFERENCIA',h:'Lugar geométrico equidistante del centro'}],
    4: [{w:'PROBABILIDAD',h:'Chance de que ocurra un evento'},{w:'ESTADISTICA',h:'Recolección y análisis de datos'},{w:'PARABOLA',h:'Curva de y=x²'},{w:'FUNCION',h:'Relación que asigna un único valor de salida'}],
    5: [{w:'DERIVADA',h:'Razón de cambio instantáneo'},{w:'INTEGRAL',h:'Área bajo la curva'},{w:'DETERMINANTE',h:'Valor escalar de una matriz'},{w:'VECTORES',h:'Magnitudes con dirección y sentido'}],
  },
  ciencia: {
    1: [{w:'FOTOSINTESIS',h:'Proceso por el que las plantas producen alimento'},{w:'MITOCONDRIA',h:'Central energética de la célula'},{w:'ECOSISTEMA',h:'Comunidad de seres vivos en su ambiente'},{w:'NUCLEO',h:'Organelo que controla la célula'}],
    2: [{w:'ATOMO',h:'Unidad mínima de la materia'},{w:'ELECTRON',h:'Partícula de carga negativa'},{w:'ENLACE',h:'Unión entre átomos'},{w:'REACCION',h:'Proceso que transforma sustancias'}],
    3: [{w:'VELOCIDAD',h:'Distancia dividida entre tiempo'},{w:'ACELERACION',h:'Cambio de velocidad en el tiempo'},{w:'GRAVEDAD',h:'Fuerza de atracción terrestre ≈9.8m/s²'},{w:'INERCIA',h:'Tendencia a mantener el estado de movimiento'}],
    4: [{w:'ALCANO',h:'Hidrocarburo saturado CₙH₂ₙ₊₂'},{w:'ALQUENO',h:'Hidrocarburo con doble enlace'},{w:'ESTEQUIOMETRIA',h:'Cálculo de cantidades en reacciones'},{w:'REACTIVO',h:'Sustancia que participa en una reacción'}],
    5: [{w:'RELATIVIDAD',h:'Teoría de Einstein E=mc²'},{w:'FISIONNUCLEAR',h:'División de núcleos pesados'},{w:'GALAXIA',h:'Sistema de millones de estrellas'},{w:'RADIOACTIVIDAD',h:'Emisión espontánea de partículas o energía'}],
  },
  historia: {
    1: [{w:'DEMOCRACIA',h:'Sistema de gobierno nacido en Atenas'},{w:'MESOPOTAMIA',h:'Entre el Tigris y el Éufrates'},{w:'FEUDALISMO',h:'Sistema político-económico medieval'},{w:'PIRAMIDE',h:'Monumento funerario egipcio'}],
    2: [{w:'TAHUANTINSUYO',h:'Imperio de los cuatro suyos'},{w:'MITA',h:'Trabajo forzado colonial'},{w:'VIRREINATO',h:'Organización colonial española'},{w:'ENCOMIENDA',h:'Sistema de trabajo indígena colonial'}],
    3: [{w:'INDEPENDENCIA',h:'Ruptura con el dominio colonial'},{w:'AYACUCHO',h:'Batalla que consolidó la independencia'},{w:'SANMARTIN',h:'Proclamó la independencia peruana'},{w:'CAUDILLISMO',h:'Período de gobiernos militares inestables'}],
    4: [{w:'REFORMAAGRARIA',h:'Redistribución de tierras de Velasco'},{w:'SENDERO',h:'Grupo terrorista peruano de los 80s'},{w:'CAUDILLO',h:'Líder militar que toma el poder'},{w:'GOLPE',h:'Toma del poder de forma no democrática'}],
    5: [{w:'GLOBALIZACION',h:'Integración mundial de economías y culturas'},{w:'GUERRAFRIA',h:'Conflicto EE.UU.–URSS sin enfrentamiento directo'},{w:'ORGANIZACION',h:'Ejemplo: ONU, OEA'},{w:'DEMOCRACIA',h:'Sistema de gobierno elegido por el pueblo'}],
  },
  comunicacion: {
    1: [{w:'METAFORA',h:'Comparación sin usar "como"'},{w:'PERSONIFICACION',h:'Dar cualidades humanas a objetos'},{w:'HIPERBOLE',h:'Exageración literaria'},{w:'SINONIMO',h:'Palabra con significado similar'}],
    2: [{w:'NARRATIVO',h:'Género que cuenta historias'},{w:'DRAMATICO',h:'Género para representar en escena'},{w:'LIRICO',h:'Género que expresa sentimientos'},{w:'CESARVALLEJO',h:'Autor de Trilce'}],
    3: [{w:'SUSTANTIVO',h:'Palabra que nombra personas o cosas'},{w:'ADVERBIO',h:'Modifica al verbo'},{w:'PREDICADO',h:'Lo que se dice del sujeto'},{w:'MORFEMA',h:'Unidad mínima con significado'}],
    4: [{w:'ARGUMENTO',h:'Razón que apoya una tesis'},{w:'ENSAYO',h:'Texto en prosa con tesis propia'},{w:'ANAFORA',h:'Repetición al inicio del verso'},{w:'PROSUMIDOR',h:'Quien produce y consume contenido'}],
    5: [{w:'AUDIOVISUAL',h:'Combina imagen y sonido'},{w:'FAKENEWS',h:'Noticias falsas o manipuladas'},{w:'CIBERACOSO',h:'Acoso mediante plataformas digitales'},{w:'INTERTEXTUALIDAD',h:'Referencias a otros textos'}],
  },
  ingles: {
    1: [{w:'GREETINGS',h:'Saludos en inglés'},{w:'ALPHABET',h:'Las 26 letras del inglés'},{w:'COLORS',h:'Red, blue, green...'},{w:'NUMBERS',h:'One, two, three...'}],
    2: [{w:'ROUTINE',h:'What you do every day'},{w:'FREQUENCY',h:'Always, sometimes, never...'},{w:'PRESENT',h:'The tense for habits'},{w:'IRREGULAR',h:'Verbs that change form in past'}],
    3: [{w:'YESTERDAY',h:'El día de ayer'},{w:'IRREGULAR',h:'Verbos que no siguen la regla de +ed'},{w:'PASTSIMPLE',h:'Tiempo verbal para acciones pasadas'},{w:'IRREGULAR',h:'go→went, eat→ate'}],
    4: [{w:'MODAL',h:'Can, should, must, will...'},{w:'CONDITIONAL',h:'If you study, you will pass'},{w:'OBLIGATION',h:'Must expresa esto'},{w:'PERMISSION',h:'May / can para pedirla'}],
    5: [{w:'PASSIVE',h:'The book was written by...'},{w:'PERFECT',h:'Have + past participle'},{w:'RELATIVE',h:'Who, which, where clause'},{w:'SINCE',h:'Used with a specific start time'}],
  },
  tecnologia: {
    1: [{w:'HARDWARE',h:'Componentes físicos del computador'},{w:'SOFTWARE',h:'Programas e instrucciones'},{w:'TECLADO',h:'Dispositivo de entrada de texto'},{w:'MONITOR',h:'Dispositivo de salida visual'}],
    2: [{w:'ALGORITMO',h:'Secuencia de pasos para resolver un problema'},{w:'PHISHING',h:'Robo de datos mediante engaño'},{w:'ANTIVIRUS',h:'Protege contra malware'},{w:'NUBE',h:'Almacenamiento remoto por internet'}],
    3: [{w:'VARIABLE',h:'Almacena un dato que puede cambiar'},{w:'FUNCION',h:'Bloque reutilizable de código'},{w:'DEBUGGING',h:'Encontrar y corregir errores'},{w:'NAVEGADOR',h:'Chrome, Firefox, Edge...'}],
    4: [{w:'BLOCKCHAIN',h:'Registro distribuido e inmutable'},{w:'MACHINELEARNING',h:'Máquinas que aprenden de datos'},{w:'CIBERSEGURIDAD',h:'Protección de sistemas digitales'},{w:'STARTUP',h:'Empresa nueva e innovadora escalable'}],
    5: [{w:'TELETRABAJO',h:'Trabajar de forma remota con tecnología'},{w:'HUELLEDIGITAL',h:'Rastro de datos en internet'},{w:'AUTOMATIZACION',h:'Usar máquinas para tareas repetitivas'},{w:'EMPRENDIMIENTO',h:'Crear un negocio propio innovador'}],
  },
};

// ══════════════════════════════════════════════════
// DATOS RELACIONA COLUMNAS por área y grado
// ══════════════════════════════════════════════════
const RELACIONA = {
  matematica: {
    1: { pares: [['MCM','Múltiplo Común Menor'],['MCD','Máximo Común Divisor'],['Numerador','Parte superior de la fracción'],['Porcentaje','De cada 100 partes'],['Valor absoluto','Distancia al cero'],['Perímetro','Suma de todos los lados']] },
    2: { pares: [['Ecuación','Igualdad con incógnita'],['Monomio','Un solo término algebraico'],['Polinomio','Suma de monomios'],['Pendiente','Inclinación de una recta'],['Factorizar','Descomponer en factores'],['Binomio','Dos términos algebraicos']] },
    3: { pares: [['Hipotenusa','Lado mayor del triángulo rectángulo'],['Seno','Opuesto/Hipotenusa'],['Coseno','Adyacente/Hipotenusa'],['Tangente','Opuesto/Adyacente'],['Apotema','Distancia del centro al lado'],['Pitágoras','c²=a²+b²']] },
    4: { pares: [['Media','Suma÷cantidad'],['Mediana','Valor central'],['Moda','Valor más frecuente'],['Probabilidad','Casos favorables÷posibles'],['Dominio','Valores de entrada de una función'],['Rango','Valores de salida de una función']] },
    5: { pares: [['Derivada','Razón de cambio instantáneo'],['Integral','Área bajo la curva'],['Límite','Valor al que se aproxima una función'],['Vector','Tiene magnitud y dirección'],['Determinante','Valor escalar de una matriz'],['Punto crítico','Donde la derivada es cero']] },
  },
  ciencia: {
    1: { pares: [['Núcleo','Controla la célula'],['Mitocondria','Produce energía ATP'],['Ribosoma','Sintetiza proteínas'],['Vacuola','Almacena agua y nutrientes'],['Cloroplasto','Realiza la fotosíntesis'],['Membrana','Regula el paso de sustancias']] },
    2: { pares: [['Protón','Carga positiva en el núcleo'],['Electrón','Carga negativa'],['Neutrón','Sin carga eléctrica'],['Enlace iónico','Transferencia de electrones'],['pH 7','Neutro'],['Tabla periódica','Mendeleiev']] },
    3: { pares: [['1ª Ley Newton','Inercia'],['2ª Ley Newton','F=ma'],['3ª Ley Newton','Acción y reacción'],['Ec cinética','½mv²'],['Ep gravitatoria','mgh'],['Trabajo','F×d']] },
    4: { pares: [['Alcano','CₙH₂ₙ₊₂'],['Alqueno','CₙH₂ₙ'],['Alquino','CₙH₂ₙ₋₂'],['Grupo -OH','Alcohol'],['Grupo -COOH','Ácido carboxílico'],['Grupo -CHO','Aldehído']] },
    5: { pares: [['E=mc²','Equivalencia masa-energía'],['Fisión','Divide núcleos pesados'],['Fusión','Une núcleos ligeros'],['Big Bang','Origen del universo'],['Año luz','Medida de distancia'],['Vía Láctea','Nuestra galaxia']] },
  },
  historia: {
    1: { pares: [['Nilo','Río de Egipto'],['Atenas','Cuna de la democracia'],['Mesopotamia','Entre Tigris y Éufrates'],['Feudalismo','Sistema medieval'],['Pirámides','Monumentos funerarios egipcios'],['Aristóteles','Maestro de Alejandro Magno']] },
    2: { pares: [['Manco Cápac','Primer inca'],['Pachacútec','Inca que más expandió el Imperio'],['Atahualpa','Último inca'],['Cusco','Capital del Imperio Inca'],['Mita','Trabajo forzado colonial'],['Quipus','Sistema de registro inca']] },
    3: { pares: [['San Martín','Proclamó la independencia peruana'],['Simón Bolívar','Libertador de Sudamérica'],['Ayacucho','Última batalla de la independencia'],['1821','Año de la independencia peruana'],['Túpac Amaru II','Rebelión de 1780'],['Ramón Castilla','Abolió la esclavitud']] },
    4: { pares: [['APRA','Fundado en 1924'],['Velasco','Reforma Agraria 1969'],['Fujimori','Capturó a Guzmán'],['Sendero Luminoso','Inició en 1980'],['CVR','Comisión de la Verdad'],['Oncenio','Gobierno de Leguía']] },
    5: { pares: [['1945','Fundación ONU'],['1989','Caída del Muro de Berlín'],['1991','Disolución URSS'],['Guerra Fría','EE.UU. vs URSS'],['Plan Marshall','Ayuda económica para Europa'],['OEA','Organización de Estados Americanos']] },
  },
  comunicacion: {
    1: { pares: [['Símil','Comparación usando "como"'],['Metáfora','Comparación directa sin "como"'],['Hipérbole','Exageración'],['Personificación','Dar atributos humanos a objetos'],['Narrativo','Texto que cuenta una historia'],['Conector de adición','"Además"']] },
    2: { pares: [['César Vallejo','Trilce'],['Ricardo Palma','Tradiciones Peruanas'],['Vargas Llosa','La ciudad y los perros'],['Arguedas','Los ríos profundos'],['Género lírico','Expresa sentimientos en verso'],['Género dramático','Para representar en escena']] },
    3: { pares: [['Sustantivo','Nombra personas o cosas'],['Adjetivo','Califica al sustantivo'],['Verbo','Expresa acción o estado'],['Adverbio','Modifica al verbo'],['Preposición','Relaciona palabras'],['Sujeto','Realiza la acción']] },
    4: { pares: [['Tesis','Posición central del ensayo'],['Argumento','Razón que apoya la tesis'],['Anáfora','Repetición al inicio del verso'],['Ironía','Dice lo contrario de lo que piensa'],['Eslogan','Frase concisa y memorable'],['Ensayo','Texto en prosa con tesis propia']] },
    5: { pares: [['Plano general','Muestra cuerpo y entorno'],['Primer plano','Solo el rostro'],['Contrapicado','Cámara desde abajo'],['Fake news','Noticias falsas'],['Ciberacoso','Acoso digital'],['Prosumidor','Produce y consume contenido']] },
  },
  ingles: {
    1: { pares: [['Red','Rojo'],['Blue','Azul'],['Book','Libro'],['Happy','Feliz'],['Big','Grande'],['Hello','Hola']] },
    2: { pares: [['Always','Siempre'],['Never','Nunca'],['Sometimes','A veces'],['go → went','Pasado de ir'],['eat → ate','Pasado de comer'],['have → had','Pasado de tener']] },
    3: { pares: [['Yesterday','Ayer'],['see → saw','Pasado de ver'],['buy → bought','Pasado de comprar'],['make → made','Pasado de hacer'],['speak → spoke','Pasado de hablar'],['come → came','Pasado de venir']] },
    4: { pares: [['Can','Habilidad'],['Should','Consejo'],['Must','Obligación fuerte'],['Will','Futuro espontáneo'],['Going to','Plan decidido'],['Might','Posibilidad']] },
    5: { pares: [['Have + pp','Present perfect'],['Was/were + pp','Pasiva pasado'],['Who','Relativo para personas'],['Which','Relativo para cosas'],['Since','Desde (fecha)'],['For','Durante (duración)']] },
  },
  tecnologia: {
    1: { pares: [['Hardware','Componentes físicos'],['Software','Programas'],['CPU','Procesa instrucciones'],['RAM','Memoria temporal'],['Monitor','Dispositivo de salida'],['Teclado','Dispositivo de entrada']] },
    2: { pares: [['Algoritmo','Secuencia de pasos'],['Antivirus','Detecta malware'],['Phishing','Robo de datos por engaño'],['Nube','Almacenamiento remoto'],['LAN','Red de área local'],['HTML','Lenguaje de marcado web']] },
    3: { pares: [['Variable','Dato que puede cambiar'],['Función','Bloque reutilizable'],['Bucle for','Repite N veces'],['If/else','Estructura condicional'],['Python','Lenguaje de programación'],['Debugging','Corregir errores']] },
    4: { pares: [['IA','Imita procesos cognitivos humanos'],['Machine Learning','Máquinas que aprenden'],['IoT','Objetos conectados a internet'],['Blockchain','Registro distribuido'],['Big Data','Grandes volúmenes de datos'],['UX','Experiencia del usuario']] },
    5: { pares: [['Startup','Empresa nueva escalable'],['Teletrabajo','Trabajo remoto'],['Automatización','Máquinas para tareas repetitivas'],['Design Thinking','Metodología centrada en el usuario'],['STEAM','Ciencias+Tecnología+Arte+Matemáticas'],['Huella digital','Rastro de datos en internet']] },
  },
};

// ══════════════════════════════════════════════════
// DATOS MEMORIA por área y grado
// ══════════════════════════════════════════════════
const MEMORIA_DATA = {
  ciencia: {
    1: [['Fotosíntesis','Plantas→glucosa+O₂'],['Célula','Unidad básica de vida'],['Núcleo','Controla la célula'],['Mitocondria','Produce ATP'],['ADN','Material genético'],['Ecosistema','Seres vivos+ambiente'],['Bacteria','Organismo procariota'],['Membrana','Regula el paso de sustancias']],
    2: [['Protón','Carga +'],['Electrón','Carga −'],['pH ácido','<7'],['pH básico','>7'],['H₂O','Fórmula del agua'],['Tabla periódica','Mendeleiev'],['Enlace iónico','Transferencia e⁻'],['Neutrón','Sin carga']],
    3: [['F=ma','2ª Ley Newton'],['Inercia','1ª Ley Newton'],['Ec=½mv²','Energía cinética'],['Ep=mgh','Energía potencial'],['W=F×d','Trabajo'],['v=d/t','Velocidad'],['a=(v-v₀)/t','Aceleración'],['P=F/A','Presión']],
    4: [['Alcano','CₙH₂ₙ₊₂'],['Alqueno','CₙH₂ₙ'],['Alquino','CₙH₂ₙ₋₂'],['-OH','Alcohol'],['-COOH','Ác. carboxílico'],['Mol','6.022×10²³'],['Combustión','CO₂+H₂O'],['Estequiometría','Calcula cantidades']],
    5: [['E=mc²','Einstein'],['Big Bang','Origen universo'],['Fisión','Divide núcleos'],['Fusión','Une núcleos'],['Vía Láctea','Nuestra galaxia'],['Año luz','Distancia'],['Radioactividad','Emisión espontánea'],['Kepler','Leyes orbitales']],
  },
  comunicacion: {
    1: [['Metáfora','Sin "como"'],['Símil','Con "como"'],['Hipérbole','Exageración'],['Personificación','Da vida a objetos'],['Narrativo','Cuenta historias'],['Descriptivo','Describe características'],['Argumentativo','Persuade'],['Expositivo','Informa objetivamente']],
    2: [['Vallejo','Trilce'],['Palma','Tradiciones Peruanas'],['Vargas Llosa','Ciudad y los perros'],['Arguedas','Ríos profundos'],['Dramático','Para escena'],['Lírico','En verso'],['Narrativo','Cuenta historias'],['Anáfora','Repetición al inicio']],
    3: [['Sustantivo','Nombra'],['Adjetivo','Califica'],['Verbo','Acción'],['Adverbio','Modifica verbo'],['Preposición','Relaciona'],['Sujeto','Realiza acción'],['Predicado','Lo que se dice'],['Oración simple','Un verbo']],
    4: [['Tesis','Posición central'],['Argumento','Apoya tesis'],['Ironía','Dice lo contrario'],['Anáfora','Repetición inicio'],['Ensayo','Prosa+tesis'],['Eslogan','Frase memorable'],['Contraargumento','Refuta objeciones'],['Multimodal','Texto+imagen+audio']],
    5: [['Plano general','Cuerpo+entorno'],['Primer plano','Solo rostro'],['Contrapicado','Desde abajo'],['Picado','Desde arriba'],['Fake news','Noticias falsas'],['Ciberacoso','Acoso digital'],['Prosumidor','Produce y consume'],['Fact-checking','Verificar información']],
  },
  tecnologia: {
    1: [['Hardware','Físico'],['Software','Programas'],['CPU','Procesa'],['RAM','Temporal'],['HDD','Almacena'],['Monitor','Salida visual'],['Teclado','Entrada'],['USB','Universal Serial Bus']],
    2: [['Algoritmo','Pasos ordenados'],['Antivirus','Anti-malware'],['Phishing','Engaño digital'],['Nube','Remoto'],['LAN','Red local'],['Wi-Fi','Inalámbrico'],['HTTPS','Seguro'],['HTML','Web']],
    3: [['Variable','Dato cambiante'],['Función','Reutilizable'],['Bucle','Repite'],['If/else','Decisión'],['Python','Lenguaje'],['CSS','Estilos web'],['Debugging','Corregir'],['API','Comunicación apps']],
    4: [['IA','Imita cognición'],['ML','Aprende datos'],['IoT','Cosas conectadas'],['Blockchain','Distribuido'],['Big Data','Muchos datos'],['UX','Experiencia usuario'],['AR','Realidad aumentada'],['SQL','Bases de datos']],
    5: [['Startup','Empresa nueva'],['Teletrabajo','Trabajo remoto'],['Automatización','Máquinas'],['Design Thinking','Centrado en usuario'],['STEAM','Integra disciplinas'],['Huella digital','Rastro online'],['E-residuo','Basura electrónica'],['Freelance','Independiente']],
  },
};

// ══════════════════════════════════════════════════
// RENDER PRINCIPAL — se ejecuta al cargar cada página
// ══════════════════════════════════════════════════
const root = document.getElementById('areaRoot');
if (!root) throw new Error('No se encontró #areaRoot');

const AREA    = root.dataset.area;
const COLOR   = root.dataset.color;
const HEX     = root.dataset.colorhex;
const ICON    = root.dataset.icon;
const NOMBRE  = root.dataset.nombre;

let gradoSel = parseInt(localStorage.getItem('edunova_grado') || '1');

// ── Nombre corto para título ─────────────────────
const NOMBRE_CORTO = { matematica:'Matemática', ciencia:'Ciencias', historia:'Historia', comunicacion:'Comunicación', ingles:'Inglés', tecnologia:'Tecnología' }[AREA] || NOMBRE;

// ── Definición de juegos por área ───────────────
const JUEGOS_POR_AREA = {
  matematica: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Matemática',     desc:'10 preguntas de aritmética, álgebra, geometría y más. 15 seg. por pregunta.',    meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'formulas',  icon:'📝', titulo:'Completa la Fórmula',    desc:'Rellena los espacios en blanco de las fórmulas del grado seleccionado.',         meta:'4 fórmulas',         badge:'Fórmulas',   pts:'+8 pts/correcta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas aleatorias contra el reloj. ¡Solo 8 segundos por pregunta!',          meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
    { id:'relaciona', icon:'🔗', titulo:'Relaciona Conceptos',    desc:'Une cada término matemático con su definición correcta arrastrando.',            meta:'6 pares',            badge:'Relacionar', pts:'+5 pts/par' },
    { id:'ahorcado',  icon:'🔤', titulo:'Ahorcado Matemático',    desc:'Adivina el término matemático letra por letra antes de que se acabe el intento.',meta:'6 intentos',         badge:'Ahorcado',   pts:'+25 pts' },
  ],
  ciencia: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Ciencias',       desc:'10 preguntas de biología, química, física o astronomía según tu grado.',          meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'vf',        icon:'✅', titulo:'Verdadero o Falso',      desc:'Decide rápido si cada afirmación científica es verdadera o falsa.',               meta:'5 enunciados',       badge:'V/F',        pts:'+12 pts/correcta' },
    { id:'ordenar',   icon:'🔀', titulo:'Ordena los Pasos',       desc:'Arrastra y ordena correctamente los pasos de un proceso científico.',             meta:'4 elementos',        badge:'Ordenar',    pts:'+30 pts' },
    { id:'memoria',   icon:'🧠', titulo:'Juego de Memoria',       desc:'Encuentra los pares de conceptos científicos. ¡Entrena tu memoria!',             meta:'8 pares',            badge:'Memoria',    pts:'+5 pts/par' },
    { id:'ahorcado',  icon:'🔤', titulo:'Ahorcado Científico',    desc:'Adivina el término de ciencias. Cada letra cuenta. ¡6 intentos!',               meta:'6 intentos',         badge:'Ahorcado',   pts:'+25 pts' },
  ],
  historia: [
    { id:'quiz',      icon:'🎯', titulo:'Trivia de Historia',     desc:'10 preguntas sobre eventos, personajes y fechas clave del Perú y el mundo.',      meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'vf',        icon:'✅', titulo:'Verdadero o Falso',      desc:'Afirmaciones históricas: ¿cierto o falso? Demuestra que sabes tu historia.',      meta:'5 enunciados',       badge:'V/F',        pts:'+12 pts/correcta' },
    { id:'ordenar',   icon:'📅', titulo:'Línea de Tiempo',        desc:'Ordena cronológicamente los eventos más importantes del período seleccionado.',    meta:'4 eventos',          badge:'Ordenar',    pts:'+30 pts' },
    { id:'relaciona', icon:'🔗', titulo:'Relaciona Personajes',   desc:'Une cada personaje histórico con su hecho más importante.',                       meta:'6 pares',            badge:'Relacionar', pts:'+5 pts/par' },
    { id:'ahorcado',  icon:'🔤', titulo:'Ahorcado Histórico',     desc:'Adivina el personaje o evento histórico letra por letra.',                        meta:'6 intentos',         badge:'Ahorcado',   pts:'+25 pts' },
  ],
  comunicacion: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Comunicación',   desc:'10 preguntas sobre literatura, gramática, figuras literarias y comprensión.',     meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas rápidas de gramática y ortografía. Solo 8 segundos cada una.',        meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
    { id:'relaciona', icon:'🔗', titulo:'Relaciona Figuras',      desc:'Une cada figura literaria con su ejemplo correcto.',                               meta:'6 pares',            badge:'Relacionar', pts:'+5 pts/par' },
    { id:'ahorcado',  icon:'🔤', titulo:'Ahorcado Literario',     desc:'Adivina el término literario o autor famoso. ¡6 intentos!',                       meta:'6 intentos',         badge:'Ahorcado',   pts:'+25 pts' },
    { id:'memoria',   icon:'🧠', titulo:'Memoria de Conceptos',   desc:'Encuentra los pares de términos y definiciones de comunicación.',                 meta:'8 pares',            badge:'Memoria',    pts:'+5 pts/par' },
  ],
  ingles: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Inglés',         desc:'10 preguntas de gramática, verbos y vocabulario adaptadas a tu grado.',           meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'flashcards',icon:'🃏', titulo:'Flashcards de Inglés',   desc:'Voltea las tarjetas para ver la traducción y un ejemplo de uso real.',            meta:'8 tarjetas',         badge:'Flashcards', pts:'+2 pts/tarjeta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas de inglés contra el reloj. ¡Solo 8 segundos cada una!',               meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
    { id:'relaciona', icon:'🔗', titulo:'Traduce y Relaciona',    desc:'Une cada palabra en inglés con su traducción al español.',                        meta:'6 pares',            badge:'Relacionar', pts:'+5 pts/par' },
    { id:'ahorcado',  icon:'🔤', titulo:'Ahorcado en Inglés',     desc:'Adivina la palabra en inglés letra por letra. ¡Piensa en vocabulario del grado!', meta:'6 intentos',         badge:'Ahorcado',   pts:'+25 pts' },
  ],
  tecnologia: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Tecnología',     desc:'10 preguntas sobre tecnología, informática y educación para el trabajo.',         meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas tech contra el reloj. ¡Solo 8 segundos cada una!',                   meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
    { id:'relaciona', icon:'🔗', titulo:'Relaciona Conceptos Tech',desc:'Une cada término tecnológico con su definición.',                               meta:'6 pares',            badge:'Relacionar', pts:'+5 pts/par' },
    { id:'ahorcado',  icon:'🔤', titulo:'Ahorcado Tech',          desc:'Adivina el término de tecnología e informática letra por letra.',                 meta:'6 intentos',         badge:'Ahorcado',   pts:'+25 pts' },
    { id:'memoria',   icon:'🧠', titulo:'Memoria Tecnológica',    desc:'Encuentra los pares de conceptos tech. ¡Demuestra tu memoria digital!',          meta:'8 pares',            badge:'Memoria',    pts:'+5 pts/par' },
  ],
};

// ── Render de la página ──────────────────────────
function renderPage() {
  document.title = `Juegos de ${NOMBRE_CORTO} | EduNovaOne`;
  root.innerHTML = `
    <div class="area-hero" style="--area-color:${COLOR}">
      <div class="area-hero-icon">${ICON}</div>
      <div>
        <h1>${ICON} ${NOMBRE}</h1>
        <p>Elige tu grado y luego selecciona un juego. Las preguntas se adaptan exactamente a lo que estudias.</p>
      </div>
    </div>

    <div class="grade-selector-row">
      <span class="grade-selector-label">Selecciona tu grado:</span>
      <div class="grade-btns-row">
        ${[1,2,3,4,5].map(g => `<button class="grade-btn-juego ${g===gradoSel?'active':''}" data-g="${g}">${g}° Sec.</button>`).join('')}
      </div>
      <span id="gradoLabel" style="font-size:.8rem;font-weight:700;color:${HEX};margin-left:auto">${gradoSel}° de Secundaria</span>
    </div>

    <div>
      <h3 style="margin:0 0 1rem;font-size:1.05rem;font-weight:700;color:var(--text)">Juegos disponibles — ${NOMBRE_CORTO} ${gradoSel}° Sec.</h3>
      <div class="games-grid" id="gamesGrid">${renderCards()}</div>
    </div>

    <div style="background:#fff;border:1px solid rgba(59,130,246,0.08);border-radius:1.5rem;padding:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-top:.25rem">
      <div style="display:flex;align-items:center;gap:.75rem">
        <span style="font-size:1.5rem">🏆</span>
        <div><p style="margin:0;font-size:.82rem;font-weight:700;color:var(--text-muted)">PUNTOS HOY</p><p style="margin:0;font-size:1.5rem;font-weight:900;color:var(--accent-strong)" id="totalPuntos">${getPuntos()}</p></div>
      </div>
      <a href="juegos.html" class="button button-secondary" style="font-size:.88rem">← Cambiar área</a>
    </div>`;

  // Eventos de grado
  root.querySelectorAll('.grade-btn-juego').forEach(btn => {
    btn.addEventListener('click', () => {
      gradoSel = parseInt(btn.dataset.g);
      localStorage.setItem('edunova_grado', gradoSel);
      root.querySelectorAll('.grade-btn-juego').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('gradoLabel').textContent = `${gradoSel}° de Secundaria`;
      document.querySelector('h3').textContent = `Juegos disponibles — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
      document.getElementById('gamesGrid').innerHTML = renderCards();
      bindCards();
    });
  });
  bindCards();
}

function renderCards() {
  const juegos = JUEGOS_POR_AREA[AREA] || [];
  return juegos.map(j => `
    <div class="game-card" data-juego="${j.id}">
      <div class="game-icon-card" style="background:${COLOR}">${j.icon}</div>
      <h4>${j.titulo}</h4>
      <p>${j.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:.4rem;align-items:center">
        <span class="game-badge" style="background:${COLOR};color:${HEX}">${j.badge}</span>
        <span style="font-size:.78rem;color:var(--text-muted)">${j.pts}</span>
      </div>
      <div class="game-meta"><span>${j.meta}</span></div>
      <button class="button button-primary" onclick="abrirJuego('${j.id}')">🎮 Jugar</button>
    </div>`).join('');
}

function bindCards() {
  // noop — onclick inline ya está en el botón
}

renderPage();

// ══════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════
function abrirJuego(id) {
  document.getElementById('gameOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  const titleEl = document.getElementById('gameTitle');
  const body    = document.getElementById('gameBody');
  const timerSecs = id === 'quiz2' ? 8 : 15;
  const qCount    = id === 'quiz2' ? 5 : 10;

  if (id === 'quiz' || id === 'quiz2') iniciarQuiz(titleEl, body, qCount, timerSecs);
  else if (id === 'flashcards')        iniciarFlashcards(titleEl, body);
  else if (id === 'formulas')          iniciarFormulas(titleEl, body);
  else if (id === 'vf')                iniciarVF(titleEl, body);
  else if (id === 'ordenar')           iniciarOrdenar(titleEl, body);
  else if (id === 'ahorcado')          iniciarAhorcado(titleEl, body);
  else if (id === 'relaciona')         iniciarRelaciona(titleEl, body);
  else if (id === 'memoria')           iniciarMemoria(titleEl, body);
}

function cerrarJuego() {
  document.getElementById('gameOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('totalPuntos').textContent = getPuntos();
}

document.getElementById('gameCloseBtn').addEventListener('click', cerrarJuego);
document.getElementById('gameOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('gameOverlay')) cerrarJuego();
});

// ══════════════════════════════════════════════════
// QUIZ
// ══════════════════════════════════════════════════
function iniciarQuiz(titleEl, body, qCount, timerSecs) {
  titleEl.textContent = `🎯 Quiz — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
  const pool = (BANCO[AREA] && BANCO[AREA][gradoSel]) ? [...BANCO[AREA][gradoSel]] : [];
  if (!pool.length) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin preguntas para este grado.</p>'; return; }
  const preguntas = pool.sort(() => Math.random() - .5).slice(0, qCount);
  let idx = 0, score = 0, timer = null;
  const quizAnswers = new Array(qCount).fill(-1); // -1 = sin responder / tiempo agotado

  function render() {
    if (idx >= preguntas.length) { finQuiz(); return; }
    const q = preguntas[idx];
    let secs = timerSecs;
    clearInterval(timer);
    body.innerHTML = `
      <div class="quiz-bar"><div class="quiz-bar-fill" id="qbf" style="width:${(idx/preguntas.length)*100}%"></div></div>
      <div class="quiz-meta">
        <span>Pregunta ${idx+1} / ${preguntas.length}</span>
        <div style="display:flex;align-items:center;gap:.5rem"><span>⭐ ${score}</span><div class="timer-c" id="tc">${secs}</div></div>
      </div>
      <div class="quiz-q">${q.p}</div>
    <div class="quiz-opts">${q.ops.map((o,i) => `<button class="quiz-opt" data-i="${i}" data-letter="${['A','B','C','D'][i]}">${o}</button>`).join('')}</div>
      <div id="qfb" style="display:none" class="quiz-fb"></div>
      <button id="qnext" style="display:none" class="button button-primary" onclick="nextQ()">Siguiente →</button>`;

    timer = setInterval(() => {
      secs--;
      const tc = document.getElementById('tc');
      if (tc) { tc.textContent = secs; if (secs <= 3) tc.classList.add('urgent'); }
      if (secs <= 0) { clearInterval(timer); reveal(-1, q); }
    }, 1000);

    document.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => { clearInterval(timer); reveal(parseInt(btn.dataset.i), q); });
    });
  }

  function reveal(elegida, q) {
    quizAnswers[idx] = elegida;
    document.querySelectorAll('.quiz-opt').forEach((b, i) => {
      b.disabled = true;
      if (i === q.r) b.classList.add('correct');
      else if (i === elegida) b.classList.add('wrong');
    });
    const pts = timerSecs === 8 ? 15 : 10;
    const fb = document.getElementById('qfb');
    fb.style.display = 'block';
    if (elegida === q.r) { score += pts; fb.className = 'quiz-fb ok'; fb.textContent = `✅ ¡Correcto! +${pts} pts`; }
    else { fb.className = 'quiz-fb bad'; fb.textContent = elegida === -1 ? `⏰ Tiempo. Era: "${q.ops[q.r]}"` : `❌ Incorrecto. Era: "${q.ops[q.r]}"`; }
    document.getElementById('qnext').style.display = 'block';
  }

  window.nextQ = () => { idx++; render(); };

  function finQuiz() {
    addPuntos(score);
    const ptsMax = preguntas.length * (timerSecs === 8 ? 15 : 10);
    const pct = Math.round(score / ptsMax * 100);
    // ── Registrar resultado para diagnóstico ──
    const correctasTotal = preguntas.filter((q, i) => quizAnswers[i] === q.r).length;
    if (typeof window._enuEvalRegistrar === 'function') {
      window._enuEvalRegistrar({
        area:      AREA,
        grado:     gradoSel,
        tipo:      timerSecs === 8 ? 'quiz2' : 'quiz',
        score,
        scoreMax:  ptsMax,
        correctas: correctasTotal,
        total:     preguntas.length,
      });
    }
    body.innerHTML = `
      <div class="score-card">
        <div style="font-size:3rem;margin-bottom:.5rem">${pct>=70?'🏆':pct>=40?'👍':'📚'}</div>
        <div class="score-big">${score}</div>
        <div style="font-size:.9rem;color:var(--text-muted);margin:.35rem 0 .75rem">puntos · ${pct}% correcto</div>
        <p style="margin:0;font-size:.85rem;color:var(--text-muted)">${pct>=70?'¡Excelente! Dominas este tema.':pct>=40?'Buen intento. Repasa lo que fallaste.':'Sigue practicando. ¡Tú puedes!'}</p>
      </div>
      <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
        <button class="button button-secondary" onclick="iniciarQuiz(document.getElementById('gameTitle'),document.getElementById('gameBody'),${qCount},${timerSecs})">🔄 Reintentar</button>
        <button class="button button-primary" onclick="cerrarJuego()">Cerrar</button>
      </div>`;
  }
  render();
}

// ══════════════════════════════════════════════════
// FLASHCARDS
// ══════════════════════════════════════════════════
function iniciarFlashcards(titleEl, body) {
  titleEl.textContent = `🃏 Flashcards — Inglés ${gradoSel}° Sec.`;
  const cards = (FLASHCARDS[gradoSel] || []).sort(() => Math.random() - .5);
  if (!cards.length) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin tarjetas para este grado.</p>'; return; }
  let idx = 0;

  function render() {
    const c = cards[idx];
    body.innerHTML = `
      <p style="text-align:center;font-size:.85rem;color:var(--text-muted);margin:0">Toca la tarjeta para ver la traducción</p>
      <div class="fc-scene" onclick="this.querySelector('.fc-card-wrap').classList.toggle('flipped');addPuntos(2);document.getElementById('totalPuntos').textContent=getPuntos()">
        <div class="fc-card-wrap">
          <div class="fc-face fc-front"><div><div style="font-size:1.5rem;font-weight:900">${c.f}</div></div></div>
          <div class="fc-face fc-back"><div><div style="font-size:1.1rem;font-weight:700;color:var(--accent-strong)">${c.b}</div><div style="font-size:.85rem;color:var(--text-muted);margin-top:.5rem;font-style:italic">${c.ex}</div></div></div>
        </div>
      </div>
      <div class="fc-nav">
        <button onclick="fcMove(-1)" ${idx===0?'disabled':''}>← Anterior</button>
        <span style="font-size:.88rem;color:var(--text-muted);font-weight:700">${idx+1} / ${cards.length}</span>
        <button onclick="fcMove(1)" ${idx===cards.length-1?'disabled':''}>Siguiente →</button>
      </div>
      <p style="text-align:center;font-size:.78rem;color:var(--text-muted);margin:0">+2 pts por tarjeta volteada</p>`;
  }
  window.fcMove = dir => { idx = Math.max(0, Math.min(cards.length-1, idx+dir)); render(); };
  render();
}

// ══════════════════════════════════════════════════
// FÓRMULAS
// ══════════════════════════════════════════════════
function iniciarFormulas(titleEl, body) {
  titleEl.textContent = `📝 Fórmulas — Matemática ${gradoSel}° Sec.`;
  const items = FORMULAS[gradoSel] || [];
  if (!items.length) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin fórmulas para este grado.</p>'; return; }
  body.innerHTML = `
    <p style="font-size:.88rem;color:var(--text-muted);margin:0">Escribe el término que falta en cada fórmula:</p>
    <div style="display:grid;gap:.85rem">
      ${items.map((item, i) => `
        <div class="frow">
          <span class="fpart">${item.partes[0]}</span>
          <input class="finput" id="fi${i}" placeholder="${item.pista}" data-r="${encodeURIComponent(item.r)}" autocomplete="off"/>
          ${item.partes[1] ? `<span class="fpart">${item.partes[1]}</span>` : ''}
          ${item.partes[2] ? `<span class="fpart">${item.partes[2]}</span>` : ''}
        </div>`).join('')}
    </div>
    <button class="button button-primary" onclick="checkFormulas()" style="width:100%">Verificar ✓</button>
    <div id="fresult" style="display:none" class="quiz-fb"></div>`;
}

window.checkFormulas = () => {
  let ok = 0;
  document.querySelectorAll('.finput').forEach(inp => {
    const correct = decodeURIComponent(inp.dataset.r).toLowerCase().trim();
    const given   = inp.value.toLowerCase().trim();
    if (given === correct) { inp.className = 'finput ok'; ok++; } else { inp.className = 'finput bad'; }
  });
  const total = document.querySelectorAll('.finput').length;
  const pts   = ok * 8;
  const fr    = document.getElementById('fresult');
  fr.style.display = 'block';
  fr.className = ok === total ? 'quiz-fb ok' : 'quiz-fb bad';
  fr.textContent = ok === total
    ? `✅ ¡Perfecto! ${ok}/${total} correctas. +${pts} pts`
    : `${ok}/${total} correctas. +${pts} pts. Las rojas son incorrectas.`;
  addPuntos(pts);
};

// ══════════════════════════════════════════════════
// VERDADERO / FALSO
// ══════════════════════════════════════════════════
function iniciarVF(titleEl, body) {
  titleEl.textContent = `✅ Verdadero o Falso — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
  const pool = (VF[AREA] && VF[AREA][gradoSel]) ? [...VF[AREA][gradoSel]] : [];
  if (!pool.length) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin contenido para este grado.</p>'; return; }
  const preguntas = pool.sort(() => Math.random() - .5);
  let idx = 0, score = 0;

  function render() {
    if (idx >= preguntas.length) { finVF(); return; }
    const q = preguntas[idx];
    body.innerHTML = `
      <div style="font-size:.82rem;color:var(--text-muted);font-weight:700">${idx+1} / ${preguntas.length} · ⭐ ${score} pts</div>
      <div class="vf-card">
        <div class="vf-statement">${q.s}</div>
        <div class="vf-btns">
          <button class="vf-btn true-btn" onclick="respVF(true,${q.r})">✅ Verdadero</button>
          <button class="vf-btn false-btn" onclick="respVF(false,${q.r})">❌ Falso</button>
        </div>
      </div>
      <div id="vffb" style="display:none" class="quiz-fb"></div>
      <button id="vfnext" style="display:none" class="button button-primary" onclick="nextVF()">Siguiente →</button>`;
  }

  window.respVF = (resp, correcto) => {
    document.querySelectorAll('.vf-btn').forEach(b => b.disabled = true);
    const ok = resp === correcto;
    if (ok) score += 12;
    const fb = document.getElementById('vffb');
    fb.style.display = 'block';
    fb.className = ok ? 'quiz-fb ok' : 'quiz-fb bad';
    fb.textContent = ok ? '✅ ¡Correcto! +12 pts' : `❌ Incorrecto. Era ${correcto ? 'VERDADERO' : 'FALSO'}.`;
    document.getElementById('vfnext').style.display = 'block';
  };
  window.nextVF = () => { idx++; render(); };

  function finVF() {
    addPuntos(score);
    const pct = Math.round(score / (preguntas.length * 12) * 100);
    if (typeof window._enuEvalRegistrar === 'function') {
      window._enuEvalRegistrar({ area: AREA, grado: gradoSel, tipo: 'vf', score, scoreMax: preguntas.length * 12, correctas: vfAnswers.filter((a,i)=>a===preguntas[i].r).length, total: preguntas.length });
    }
    body.innerHTML = `
      <div class="score-card">
        <div style="font-size:3rem;margin-bottom:.5rem">${pct>=70?'🏆':pct>=40?'👍':'📚'}</div>
        <div class="score-big">${score}</div>
        <div style="font-size:.9rem;color:var(--text-muted);margin:.35rem 0 .75rem">puntos · ${pct}% correcto</div>
      </div>
      <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
        <button class="button button-secondary" onclick="iniciarVF(document.getElementById('gameTitle'),document.getElementById('gameBody'))">🔄 Reintentar</button>
        <button class="button button-primary" onclick="cerrarJuego()">Cerrar</button>
      </div>`;
  }
  render();
}

// ══════════════════════════════════════════════════
// ORDENAR
// ══════════════════════════════════════════════════
function iniciarOrdenar(titleEl, body) {
  const data = ORDENAR[AREA] && ORDENAR[AREA][gradoSel];
  titleEl.textContent = `🔀 Ordenar — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
  if (!data) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin contenido para este grado.</p>'; return; }

  const items = [...data.items].sort(() => Math.random() - .5);
  body.innerHTML = `
    <p style="font-weight:700;color:var(--accent-strong);margin:0">${data.en}</p>
    <p style="font-size:.82rem;color:var(--text-muted);margin:0">Arrastra los elementos al orden correcto:</p>
    <div class="sort-list" id="sortList">
      ${items.map(item => `
        <div class="sort-item" draggable="true" data-item="${encodeURIComponent(item)}">
          <span style="color:var(--text-muted);font-size:1.1rem">⠿</span> ${item}
        </div>`).join('')}
    </div>
    <div id="sres" style="display:none" class="quiz-fb"></div>
    <button class="button button-primary" onclick="checkOrden()" style="width:100%">Verificar orden ✓</button>`;

  let dragSrc = null;
  document.querySelectorAll('.sort-item').forEach(item => {
    item.addEventListener('dragstart', () => { dragSrc = item; item.classList.add('dragging'); });
    item.addEventListener('dragend',   () => item.classList.remove('dragging'));
    item.addEventListener('dragover',  e  => { e.preventDefault(); item.classList.add('dragover'); });
    item.addEventListener('dragleave', () => item.classList.remove('dragover'));
    item.addEventListener('drop', e => {
      e.preventDefault(); item.classList.remove('dragover');
      if (dragSrc && dragSrc !== item) {
        const list = document.getElementById('sortList');
        const all  = [...list.querySelectorAll('.sort-item')];
        const si = all.indexOf(dragSrc), ti = all.indexOf(item);
        if (si < ti) list.insertBefore(dragSrc, item.nextSibling);
        else         list.insertBefore(dragSrc, item);
      }
    });
  });
}

window.checkOrden = () => {
  const data   = ORDENAR[AREA][gradoSel];
  const actual = [...document.querySelectorAll('.sort-item')].map(el => decodeURIComponent(el.dataset.item));
  const ok     = actual.every((v, i) => v === data.ok[i]);
  const sr     = document.getElementById('sres');
  sr.style.display = 'block';
  if (ok) {
    sr.className = 'quiz-fb ok'; sr.textContent = '✅ ¡Orden correcto! +30 pts';
    addPuntos(30);
    setTimeout(cerrarJuego, 2000);
  } else {
    sr.className = 'quiz-fb bad'; sr.textContent = '❌ Orden incorrecto. Inténtalo de nuevo.';
    setTimeout(() => { sr.style.display = 'none'; }, 2000);
  }
};

// ══════════════════════════════════════════════════
// AHORCADO
// ══════════════════════════════════════════════════
function iniciarAhorcado(titleEl, body) {
  titleEl.textContent = `🔤 Ahorcado — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
  const pool = (AHORCADO[AREA] && AHORCADO[AREA][gradoSel]) ? [...AHORCADO[AREA][gradoSel]] : [];
  if (!pool.length) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin palabras para este grado.</p>'; return; }
  const item = pool[Math.floor(Math.random() * pool.length)];
  const word = item.w.toUpperCase();
  const hint = item.h;
  const maxErr = 6;
  let errors = 0;
  const guessed = new Set();

  const HANG_STAGES = [
    '','─','┐','│\n┐','╱│\n┐','╱│╲\n┐','╱│╲\n┐\n╱'
  ];

  function render() {
    const display = word.split('').map(l => guessed.has(l) ? `<span style="color:var(--accent-strong);font-weight:900">${l}</span>` : '_').join(' ');
    const won  = word.split('').every(l => guessed.has(l));
    const lost = errors >= maxErr;
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    body.innerHTML = `
      <div style="text-align:center;margin-bottom:.5rem">
        <div style="font-size:.82rem;color:var(--text-muted);font-weight:700;margin-bottom:.5rem">💡 Pista: ${hint}</div>
        <div style="font-size:1.6rem;font-family:monospace;letter-spacing:.35rem;color:var(--text);min-height:2.5rem">${display}</div>
        <div style="margin:.75rem 0;font-size:.88rem;color:${errors>=4?'#ef4444':errors>=2?'#f59e0b':'#10b981'};font-weight:700">
          ${'❤️'.repeat(maxErr-errors)}${'🖤'.repeat(errors)} · ${maxErr-errors} vidas restantes
        </div>
        ${won  ? `<div class="quiz-fb ok" style="margin-bottom:.75rem">🎉 ¡Correcto! La palabra era <strong>${word}</strong>. +25 pts</div>` : ''}
        ${lost ? `<div class="quiz-fb bad" style="margin-bottom:.75rem">💀 ¡Perdiste! La palabra era <strong>${word}</strong></div>` : ''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:.35rem;justify-content:center;margin-bottom:1rem">
        ${alpha.map(l => {
          const used   = guessed.has(l);
          const isGood = used && word.includes(l);
          const isBad  = used && !word.includes(l);
          return `<button onclick="ahorcadoLetra('${l}')" ${(used||won||lost)?'disabled':''} style="
            width:2.2rem;height:2.2rem;border-radius:.5rem;border:1.5px solid rgba(99,102,241,0.2);
            background:${isGood?'rgba(16,185,129,0.15)':isBad?'rgba(239,68,68,0.1)':'#f8fbff'};
            color:${isGood?'#065f46':isBad?'#991b1b':'var(--text)'};
            font-weight:700;font-size:.85rem;cursor:pointer;transition:all .15s">${l}</button>`;
        }).join('')}
      </div>
      ${(won||lost) ? `<div style="display:flex;gap:.75rem;justify-content:center">
        <button class="button button-secondary" onclick="iniciarAhorcado(document.getElementById('gameTitle'),document.getElementById('gameBody'))">🔄 Otra palabra</button>
        <button class="button button-primary" onclick="cerrarJuego()">Cerrar</button>
      </div>` : ''}`;
    if (won) addPuntos(25);
  }

  window.ahorcadoLetra = (l) => {
    guessed.add(l);
    if (!word.includes(l)) errors++;
    render();
  };
  render();
}

// ══════════════════════════════════════════════════
// RELACIONA COLUMNAS
// ══════════════════════════════════════════════════
function iniciarRelaciona(titleEl, body) {
  titleEl.textContent = `🔗 Relaciona — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
  const data = RELACIONA[AREA] && RELACIONA[AREA][gradoSel];
  if (!data) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin datos para este grado.</p>'; return; }

  const pares = [...data.pares].sort(() => Math.random() - .5);
  const lefts  = pares.map(p => p[0]);
  const rights = [...pares.map(p => p[1])].sort(() => Math.random() - .5);
  let sel = null; // { side, idx }
  const matches = {}; // left_idx → right_idx

  function render() {
    const done = Object.keys(matches).length === pares.length;
    body.innerHTML = `
      <p style="font-size:.85rem;color:var(--text-muted);margin:0 0 .75rem">Toca un concepto de la izquierda y luego su par de la derecha:</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
        <div style="display:grid;gap:.4rem">
          ${lefts.map((l, i) => {
            const matched = Object.keys(matches).includes(String(i));
            return `<button onclick="relSel('L',${i})" style="
              padding:.65rem .85rem;border-radius:.85rem;border:1.5px solid ${sel?.side==='L'&&sel.idx===i?'var(--accent)':matched?'#10b981':'rgba(99,102,241,0.2)'};
              background:${matched?'rgba(16,185,129,0.1)':sel?.side==='L'&&sel.idx===i?'rgba(99,102,241,0.08)':'#f8fbff'};
              font-size:.82rem;font-weight:700;color:var(--accent-strong);text-align:left;cursor:pointer" ${matched?'disabled':''}>${l}</button>`;
          }).join('')}
        </div>
        <div style="display:grid;gap:.4rem">
          ${rights.map((r, i) => {
            const matchedLeft = Object.entries(matches).find(([li,ri]) => rights[ri]===r);
            const matched = !!matchedLeft;
            return `<button onclick="relSel('R',${i})" style="
              padding:.65rem .85rem;border-radius:.85rem;border:1.5px solid ${sel?.side==='R'&&sel.idx===i?'var(--accent)':matched?'#10b981':'rgba(99,102,241,0.2)'};
              background:${matched?'rgba(16,185,129,0.1)':sel?.side==='R'&&sel.idx===i?'rgba(99,102,241,0.08)':'#f8fbff'};
              font-size:.82rem;color:var(--text);text-align:left;cursor:pointer" ${matched?'disabled':''}>${r}</button>`;
          }).join('')}
        </div>
      </div>
      <div id="relFb" style="margin-top:.75rem"></div>
      ${done ? `
        <div class="score-card" style="margin-top:.75rem">
          <div style="font-size:2rem">🏆</div>
          <div class="score-big">${pares.length * 5}</div>
          <div style="font-size:.9rem;color:var(--text-muted)">puntos · ¡Todos los pares correctos!</div>
        </div>
        <div style="display:flex;gap:.75rem;justify-content:center;margin-top:.75rem">
          <button class="button button-secondary" onclick="iniciarRelaciona(document.getElementById('gameTitle'),document.getElementById('gameBody'))">🔄 Reintentar</button>
          <button class="button button-primary" onclick="cerrarJuego()">Cerrar</button>
        </div>` : ''}`;
  }

  window.relSel = (side, idx) => {
    if (!sel) { sel = { side, idx }; render(); return; }
    if (sel.side === side) { sel = { side, idx }; render(); return; }
    // intentar emparejar
    const leftIdx  = sel.side === 'L' ? sel.idx : idx;
    const rightIdx = sel.side === 'R' ? sel.idx : idx;
    const leftVal  = lefts[leftIdx];
    const rightVal = rights[rightIdx];
    const correct  = pares[leftIdx][1] === rightVal;
    const fb = document.createElement('div');
    fb.className = correct ? 'quiz-fb ok' : 'quiz-fb bad';
    fb.textContent = correct ? `✅ ¡Correcto! "${leftVal}" → "${rightVal}" +5 pts` : `❌ Incorrecto. Intenta de nuevo.`;
    if (correct) { matches[leftIdx] = rightIdx; addPuntos(5); }
    sel = null;
    render();
    const fbEl = document.getElementById('relFb');
    if (fbEl) { fbEl.innerHTML = ''; fbEl.appendChild(fb); setTimeout(() => { fbEl.innerHTML = ''; }, 1500); }
  };
  render();
}

// ══════════════════════════════════════════════════
// MEMORIA
// ══════════════════════════════════════════════════
function iniciarMemoria(titleEl, body) {
  titleEl.textContent = `🧠 Memoria — ${NOMBRE_CORTO} ${gradoSel}° Sec.`;
  const pool = MEMORIA_DATA[AREA] && MEMORIA_DATA[AREA][gradoSel];
  if (!pool) { body.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Sin datos para este grado.</p>'; return; }

  // Crear pares: cada par tiene [concepto, definición] → 2 cartas
  const cards = [];
  pool.forEach((par, i) => {
    cards.push({ id: i, val: par[0], pair: i, type: 'A' });
    cards.push({ id: i + pool.length, val: par[1], pair: i, type: 'B' });
  });
  cards.sort(() => Math.random() - .5);

  let flipped = [];
  let matched = new Set();
  let score = 0;
  let locked = false;

  function render() {
    const done = matched.size === pool.length;
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem">
        <span style="font-size:.85rem;color:var(--text-muted);font-weight:700">Pares encontrados: ${matched.size}/${pool.length}</span>
        <span style="font-size:.85rem;font-weight:800;color:var(--accent-strong)">⭐ ${score} pts</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem">
        ${cards.map((c, ci) => {
          const isMatched  = matched.has(c.pair);
          const isFlipped  = flipped.includes(ci);
          return `<button onclick="memFlip(${ci})" style="
            aspect-ratio:1;border-radius:1rem;border:1.5px solid ${isMatched?'#10b981':isFlipped?'var(--accent)':'rgba(99,102,241,0.18)'};
            background:${isMatched?'rgba(16,185,129,0.12)':isFlipped?'rgba(99,102,241,0.08)':'#f8fbff'};
            font-size:.72rem;font-weight:700;color:${isMatched?'#065f46':isFlipped?'var(--accent-strong)':'#cbd5e1'};
            cursor:pointer;padding:.25rem;line-height:1.2;word-break:break-word;transition:all .2s"
            ${(isMatched||locked&&!isFlipped)?'disabled':''}>
            ${isFlipped||isMatched ? c.val : '?'}
          </button>`;
        }).join('')}
      </div>
      ${done ? `
        <div class="score-card" style="margin-top:1rem">
          <div style="font-size:2.5rem">🧠</div>
          <div class="score-big">${score}</div>
          <div style="font-size:.9rem;color:var(--text-muted)">¡Encontraste todos los pares!</div>
        </div>
        <div style="display:flex;gap:.75rem;justify-content:center;margin-top:.75rem">
          <button class="button button-secondary" onclick="iniciarMemoria(document.getElementById('gameTitle'),document.getElementById('gameBody'))">🔄 Reintentar</button>
          <button class="button button-primary" onclick="cerrarJuego()">Cerrar</button>
        </div>` : ''}`;
  }

  window.memFlip = (ci) => {
    if (locked || flipped.includes(ci) || matched.has(cards[ci].pair)) return;
    flipped.push(ci);
    render();
    if (flipped.length === 2) {
      locked = true;
      const [a, b] = flipped;
      if (cards[a].pair === cards[b].pair && cards[a].type !== cards[b].type) {
        matched.add(cards[a].pair);
        score += 5;
        addPuntos(5);
        flipped = [];
        locked = false;
        render();
      } else {
        setTimeout(() => { flipped = []; locked = false; render(); }, 900);
      }
    }
  };
  render();
}
