/* ══════════════════════════════════════════════════
   juegos-engine.js — Motor de juegos EduNovaOne
   Renderiza el área, selector de grado y juegos
   según data-area del #areaRoot en cada HTML.
   ══════════════════════════════════════════════════ */

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
    { partes: ['Área rectángulo = base × ', '____'], r: 'altura', pista: 'A = b × ?' },
    { partes: ['MCM: factores primos con mayor ', '____'], r: 'exponente', pista: 'mayor ...' },
    { partes: ['Porcentaje = (parte ÷ ', '____ ) × 100'], r: 'total', pista: '(p÷?)×100' },
    { partes: ['Fracción = Numerador ÷ ', '____'], r: 'Denominador', pista: 'a ÷ ?' },
  ],
  2: [
    { partes: ['ax + b = 0  →  x = −b ÷ ', '____'], r: 'a', pista: 'x=−b/?' },
    { partes: ['(a + b)² = a² + 2ab + ', '____'], r: 'b²', pista: '...+?' },
    { partes: ['a² − b² = (a+b)(a', '____', ')'], r: '−b', pista: '(a+b)(a?)' },
    { partes: ['Pendiente m = Δy ÷ ', '____'], r: 'Δx', pista: 'm=Δy÷?' },
  ],
  3: [
    { partes: ['Pitágoras: c² = a² + ', '____'], r: 'b²', pista: 'c²=a²+?' },
    { partes: ['sen θ = opuesto ÷ ', '____'], r: 'hipotenusa', pista: 'SOH' },
    { partes: ['Área triángulo = (base × altura) ÷ ', '____'], r: '2', pista: '(b×h)÷?' },
    { partes: ['cos θ = adyacente ÷ ', '____'], r: 'hipotenusa', pista: 'CAH' },
  ],
  4: [
    { partes: ['Media = Σx ÷ ', '____'], r: 'n', pista: 'suma÷?' },
    { partes: ['P(A) = favorables ÷ ', '____'], r: 'posibles', pista: 'P=fav÷?' },
    { partes: ['f(x) = ', '____', 'x + b  (pendiente)'], r: 'm', pista: 'f(x)=?x+b' },
    { partes: ['Varianza = Σ(xi − x̄)² ÷ ', '____'], r: 'n', pista: 'Σ(...)÷?' },
  ],
  5: [
    { partes: ["d/dx(xⁿ) = ", "____", "·xⁿ⁻¹"], r: 'n', pista: '?·xⁿ⁻¹' },
    { partes: ['∫xⁿ dx = xⁿ⁺¹ ÷ (n+1) + ', '____'], r: 'C', pista: '...+?' },
    { partes: ['|v| = √(x² + ', '____', ')'], r: 'y²', pista: '√(x²+?)' },
    { partes: ["f'(x) de 3x² + 2x = ", "____"], r: '6x + 2', pista: '6x+?' },
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
const NOMBRE_CORTO = { matematica:'Matemática', ciencia:'Ciencias', historia:'Historia', comunicacion:'Comunicación', ingles:'Inglés' }[AREA] || NOMBRE;

// ── Definición de juegos por área ───────────────
const JUEGOS_POR_AREA = {
  matematica: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Matemática',     desc:'10 preguntas de aritmética, álgebra, geometría y más. 15 seg. por pregunta.',    meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'formulas',  icon:'📝', titulo:'Completa la Fórmula',    desc:'Rellena los espacios en blanco de las fórmulas del grado seleccionado.',         meta:'4 fórmulas',         badge:'Fórmulas',   pts:'+8 pts/correcta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas aleatorias contra el reloj. ¡Solo 8 segundos por pregunta!',          meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
  ],
  ciencia: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Ciencias',       desc:'10 preguntas de biología, química, física o astronomía según tu grado.',          meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'vf',        icon:'✅', titulo:'Verdadero o Falso',      desc:'Decide rápido si cada afirmación científica es verdadera o falsa.',               meta:'5 enunciados',       badge:'V/F',        pts:'+12 pts/correcta' },
    { id:'ordenar',   icon:'🔀', titulo:'Ordena los Pasos',       desc:'Arrastra y ordena correctamente los pasos de un proceso científico.',             meta:'4 elementos',        badge:'Ordenar',    pts:'+30 pts' },
  ],
  historia: [
    { id:'quiz',      icon:'🎯', titulo:'Trivia de Historia',     desc:'10 preguntas sobre eventos, personajes y fechas clave del Perú y el mundo.',      meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'vf',        icon:'✅', titulo:'Verdadero o Falso',      desc:'Afirmaciones históricas: ¿cierto o falso? Demuestra que sabes tu historia.',      meta:'5 enunciados',       badge:'V/F',        pts:'+12 pts/correcta' },
    { id:'ordenar',   icon:'📅', titulo:'Línea de Tiempo',        desc:'Ordena cronológicamente los eventos más importantes del período seleccionado.',    meta:'4 eventos',          badge:'Ordenar',    pts:'+30 pts' },
  ],
  comunicacion: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Comunicación',   desc:'10 preguntas sobre literatura, gramática, figuras literarias y comprensión.',     meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas rápidas de gramática y ortografía. Solo 8 segundos cada una.',        meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
  ],
  ingles: [
    { id:'quiz',      icon:'🎯', titulo:'Quiz de Inglés',         desc:'10 preguntas de gramática, verbos y vocabulario adaptadas a tu grado.',           meta:'10 preguntas · 15s', badge:'Quiz',       pts:'+10 pts/correcta' },
    { id:'flashcards',icon:'🃏', titulo:'Flashcards de Inglés',   desc:'Voltea las tarjetas para ver la traducción y un ejemplo de uso real.',            meta:'8 tarjetas',         badge:'Flashcards', pts:'+2 pts/tarjeta' },
    { id:'quiz2',     icon:'⚡', titulo:'Quiz Relámpago',         desc:'5 preguntas de inglés contra el reloj. ¡Solo 8 segundos cada una!',               meta:'5 preguntas · 8s',   badge:'Rápido',     pts:'+15 pts/correcta' },
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
      <div class="quiz-opts">${q.ops.map((o,i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}</div>
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
    const pct = Math.round(score / (preguntas.length * (timerSecs === 8 ? 15 : 10)) * 100);
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
