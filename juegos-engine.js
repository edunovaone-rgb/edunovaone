// ══════════════════════════════════════════
// juegos-engine.js — EduNovaOne
// Motor de juegos compartido por todas las
// páginas juego-*.html
// ══════════════════════════════════════════

// ── Puntos ──────────────────────────────
const PUNTOS_KEY = 'enu_puntos_hoy';
function getPuntos() {
  try {
    const s = JSON.parse(localStorage.getItem(PUNTOS_KEY) || '{}');
    return s.d === new Date().toDateString() ? (s.p || 0) : 0;
  } catch { return 0; }
}
function addPuntos(n) {
  const p = getPuntos() + n;
  try { localStorage.setItem(PUNTOS_KEY, JSON.stringify({ d: new Date().toDateString(), p })); } catch {}
  const el = document.getElementById('totalPuntos');
  if (el) el.textContent = p;
}

// ── Leer configuración del área desde el DOM ──
const ROOT = document.getElementById('areaRoot');
const AREA    = ROOT ? ROOT.dataset.area    : '';
const COLOR   = ROOT ? ROOT.dataset.color   : 'rgba(99,102,241,0.12)';
const HEX     = ROOT ? ROOT.dataset.colorhex: '#6d28d9';
const ICON    = ROOT ? ROOT.dataset.icon    : '🎮';
const NOMBRE  = ROOT ? ROOT.dataset.nombre  : '';

// ── Estado ──────────────────────────────
let gradoSel = parseInt(localStorage.getItem('edunova_grado') || '1');


// ══════════════════════════════════════════
// BANCO DE PREGUNTAS
// ══════════════════════════════════════════
const BANCO = {
  matematica: {
    1:[
      {p:'¿Cuánto es el MCM de 4 y 6?',ops:['8','12','24','6'],r:1},
      {p:'¿Cuál es el resultado de 3² + 4²?',ops:['25','49','14','7'],r:0},
      {p:'¿Cuánto es −5 + 8?',ops:['−3','3','13','−13'],r:1},
      {p:'¿Cuál es el MCD de 12 y 18?',ops:['3','6','9','12'],r:1},
      {p:'¿Cuánto es 2/3 + 1/3?',ops:['3/6','1','2/9','3/3'],r:1},
      {p:'¿Cuánto es el 25% de 80?',ops:['20','25','16','40'],r:0},
      {p:'¿Cuánto es √144?',ops:['11','12','13','14'],r:1},
      {p:'¿Qué número es múltiplo de 7?',ops:['22','35','41','50'],r:1},
      {p:'¿Cuánto es 3 × (4 + 2)?',ops:['14','18','10','24'],r:1},
      {p:'¿Cuánto es 15 ÷ 3 + 2²?',ops:['7','9','11','13'],r:1},
    ],
    2:[
      {p:'Si 2x + 4 = 10, ¿cuánto es x?',ops:['2','3','4','5'],r:1},
      {p:'Factoriza: x² − 9',ops:['(x−3)²','(x+3)(x−3)','(x+9)(x−1)','(x−9)(x+1)'],r:1},
      {p:'Si 3x − 7 = 11, ¿cuánto es x?',ops:['4','5','6','7'],r:2},
      {p:'¿Cuánto es (−3)²?',ops:['−9','9','6','−6'],r:1},
      {p:'¿Cuánto es (a+b)² expandido?',ops:['a²+b²','a²+ab+b²','a²+2ab+b²','2a+2b'],r:2},
      {p:'Resuelve: x/2 = 6',ops:['3','8','12','14'],r:2},
      {p:'¿Cuál es el grado del polinomio 4x³ − 2x + 1?',ops:['1','2','3','4'],r:2},
      {p:'¿Cuánto es el coeficiente en 7x³?',ops:['3','x','7','7x'],r:2},
      {p:'a² − b² = ?',ops:['(a−b)²','(a+b)(a−b)','(a+b)²','a²+b²'],r:1},
      {p:'¿Qué valor de x cumple 5x = 0?',ops:['1','−1','5','0'],r:3},
    ],
    3:[
      {p:'En triángulo rectángulo catetos 3 y 4, ¿hipotenusa?',ops:['5','6','7','8'],r:0},
      {p:'¿Cuánto es sen 30°?',ops:['√3/2','1/2','1','√2/2'],r:1},
      {p:'¿Cuánto es cos 60°?',ops:['1','√3/2','1/2','0'],r:2},
      {p:'Área de triángulo base 6, altura 4:',ops:['24','12','10','8'],r:1},
      {p:'¿Cuánto es tan 45°?',ops:['0','√3','1','1/2'],r:2},
      {p:'Suma de ángulos internos de un triángulo:',ops:['90°','180°','270°','360°'],r:1},
      {p:'Perímetro de cuadrado lado 5:',ops:['10','20','25','15'],r:1},
      {p:'¿Cuántos lados tiene un hexágono?',ops:['5','6','7','8'],r:1},
      {p:'sen θ = ?',ops:['adyacente/hipotenusa','opuesto/adyacente','opuesto/hipotenusa','hipotenusa/opuesto'],r:2},
      {p:'Suma ángulos de un cuadrilátero:',ops:['180°','270°','360°','720°'],r:2},
    ],
    4:[
      {p:'f(x) = 2x + 1 en x=3:',ops:['5','6','7','8'],r:2},
      {p:'Media de 4, 7, 7, 9, 3:',ops:['5','6','7','8'],r:1},
      {p:'Moda de 4, 7, 7, 9, 3:',ops:['3','4','7','9'],r:2},
      {p:'Mediana de 2, 4, 6, 8, 10:',ops:['4','5','6','7'],r:2},
      {p:'P(cara) al lanzar moneda:',ops:['1/3','1/4','1/2','2/3'],r:2},
      {p:'En f(x)=mx+b, "m" representa:',ops:['La ordenada','La pendiente','El dominio','La raíz'],r:1},
      {p:'¿Qué gráfica produce f(x)=ax²+bx+c?',ops:['Recta','Parábola','Hipérbola','Círculo'],r:1},
      {p:'Resultados posibles al lanzar un dado:',ops:['4','5','6','12'],r:2},
      {p:'¿Qué mide la varianza?',ops:['El promedio','La dispersión','El valor más frecuente','El dato central'],r:1},
      {p:'Una función constante tiene gráfica:',ops:['Curva','Recta vertical','Recta horizontal','Parábola'],r:2},
    ],
    5:[
      {p:"Si f(x)=3x², ¿cuánto es f'(x)?",ops:['3x','6x','x²','6x²'],r:1},
      {p:'¿Qué mide la derivada?',ops:['Área bajo la curva','Tasa de cambio instantánea','El máximo valor','La integral'],r:1},
      {p:'∫2x dx =',ops:['x²','x²+C','2x²+C','x+C'],r:1},
      {p:'Módulo del vector (3,4):',ops:['5','7','12','6'],r:0},
      {p:'lím(x→2) de x²:',ops:['2','3','4','8'],r:2},
      {p:'Derivada de una constante:',ops:['La misma constante','1','0','Indefinida'],r:2},
      {p:'d/dx(xⁿ) =',ops:['nxⁿ','nxⁿ⁻¹','xⁿ⁻¹','n·x'],r:1},
      {p:'∫₀¹ x dx =',ops:['1','1/2','2','0'],r:1},
      {p:'Producto de dos vectores ortogonales:',ops:['1','−1','0','Indefinido'],r:2},
      {p:'Matriz cuadrada tiene:',ops:['Misma cantidad de filas y columnas','Solo una fila','Solo una columna','Diagonal con ceros'],r:0},
    ],
  },
  ciencia: {
    1:[
      {p:'¿Cuál es la unidad básica de la vida?',ops:['El átomo','La célula','El tejido','El órgano'],r:1},
      {p:'¿Qué gas producen las plantas en fotosíntesis?',ops:['CO₂','N₂','O₂','H₂'],r:2},
      {p:'¿Qué tipo de célula NO tiene núcleo?',ops:['Animal','Vegetal','Procariota','Eucariota'],r:2},
      {p:'¿Qué organelo produce energía en la célula?',ops:['Núcleo','Ribosoma','Mitocondria','Vacuola'],r:2},
      {p:'La cadena alimenticia comienza con:',ops:['Carnívoros','Herbívoros','Productores','Descomponedores'],r:2},
      {p:'¿Qué reino incluye a los hongos?',ops:['Animalia','Plantae','Fungi','Monera'],r:2},
      {p:'¿Cuál es la función del sistema circulatorio?',ops:['Digerir alimentos','Transportar sangre','Filtrar aire','Producir hormonas'],r:1},
      {p:'Un ecosistema incluye:',ops:['Solo seres vivos','Solo el ambiente','Seres vivos y su entorno','Solo animales'],r:2},
      {p:'¿Cuántos sistemas principales tiene el cuerpo humano?',ops:['5','8','11','15'],r:2},
      {p:'La fotosíntesis ocurre en:',ops:['Mitocondria','Ribosoma','Cloroplasto','Núcleo'],r:2},
    ],
    2:[
      {p:'¿Cuántos protones tiene el oxígeno?',ops:['6','7','8','9'],r:2},
      {p:'¿Qué representa el número atómico?',ops:['Número de neutrones','Número de protones','Masa atómica','Número de electrones'],r:1},
      {p:'La fórmula del agua es:',ops:['H₂O₂','CO₂','H₂O','NaCl'],r:2},
      {p:'¿Qué mide el pH?',ops:['Temperatura','Acidez/basicidad','Presión','Densidad'],r:1},
      {p:'¿Cuál es el símbolo del sodio?',ops:['So','Na','Sn','Nd'],r:1},
      {p:'Los gases nobles están en el grupo:',ops:['1','2','17','18'],r:3},
      {p:'¿Qué tipo de reacción produce sal y agua?',ops:['Oxidación','Reducción','Neutralización','Combustión'],r:2},
      {p:'¿Qué es un enlace iónico?',ops:['Compartir electrones','Transferencia de electrones','Unión de núcleos','Repulsión de cargas'],r:1},
      {p:'Estado de la materia con forma y volumen fijos:',ops:['Gas','Líquido','Sólido','Plasma'],r:2},
      {p:'Balancea H₂+O₂→H₂O. ¿Cuántas H₂O se forman?',ops:['1','2','3','4'],r:1},
    ],
    3:[
      {p:'La Segunda Ley de Newton dice:',ops:['Inercia','F = m × a','Acción y reacción','Conservación de energía'],r:1},
      {p:'En MRU, la velocidad es:',ops:['Creciente','Decreciente','Constante','Cero'],r:2},
      {p:'La energía cinética se calcula con:',ops:['E=mgh','F=ma','Ec=½mv²','W=Fd'],r:2},
      {p:'¿Qué tipo de onda es la luz?',ops:['Mecánica','Longitudinal','Electromagnética','Sonora'],r:2},
      {p:'Unidad de fuerza en el SI:',ops:['Joule','Pascal','Newton','Watt'],r:2},
      {p:'v=100m, t=5s en MRU. ¿v?',ops:['10 m/s','20 m/s','500 m/s','50 m/s'],r:1},
      {p:'El trabajo (W) se calcula con:',ops:['W=mv','W=F×d','W=½mv²','W=mgh'],r:1},
      {p:'Presión = ?',ops:['P=m×V','P=F/A','P=mgh','P=mv'],r:1},
      {p:'La 3ª Ley de Newton dice:',ops:['F=ma','Inercia','Acción y reacción igual y contraria','Conservación masa'],r:2},
      {p:'La energía potencial se calcula con:',ops:['½mv²','mgh','F×d','mc²'],r:1},
    ],
    4:[
      {p:'Los alcanos tienen fórmula general:',ops:['CₙH₂ₙ','CₙH₂ₙ₊₂','CₙH₂ₙ₋₂','CₙHₙ'],r:1},
      {p:'¿Cuántos moles hay en 36g de agua (M=18)?',ops:['1','2','3','4'],r:1},
      {p:'El reactivo limitante:',ops:['Está en exceso','Se agota primero','Tiene mayor masa','Reacciona más lento'],r:1},
      {p:'¿Qué grupo funcional tiene un alcohol?',ops:['−COOH','−CHO','−OH','−NH₂'],r:2},
      {p:'Un ácido libera en agua:',ops:['OH⁻','H⁺','Na⁺','Cl⁻'],r:1},
      {p:'La fórmula del metano es:',ops:['C₂H₆','CH₄','C₃H₈','C₂H₄'],r:1},
      {p:'Los alquenos tienen un enlace:',ops:['Simple C−C','Doble C=C','Triple C≡C','Iónico'],r:1},
      {p:'Rendimiento=18/20×100=?',ops:['80%','85%','90%','95%'],r:2},
      {p:'Nomenclatura sistemática es:',ops:['Nombres comunes','Nombres IUPAC','Fórmulas abreviadas','Símbolos aleatorios'],r:1},
      {p:'¿Qué estudia la estequiometría?',ops:['Estudio de la luz','Cálculo de cantidades en reacciones','Análisis de energía','Clasificación de elementos'],r:1},
    ],
    5:[
      {p:'E = mc² es la fórmula de:',ops:['Energía cinética','Energía potencial','Equivalencia masa-energía','Presión'],r:2},
      {p:'¿Cuántos planetas tiene el Sistema Solar?',ops:['7','8','9','10'],r:1},
      {p:'La fisión nuclear:',ops:['Une núcleos ligeros','Divide núcleos pesados','Emite luz visible','Produce agua'],r:1},
      {p:'La velocidad de la luz es aproximadamente:',ops:['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'],r:1},
      {p:'¿Qué ley de Kepler relaciona T² con r³?',ops:['Primera','Segunda','Tercera','Cuarta'],r:2},
      {p:'Vida media de un elemento radiactivo:',ops:['Su edad','Tiempo en desintegrar la mitad','Tiempo de formación','Su período orbital'],r:1},
      {p:'Los planetas interiores son:',ops:['Júpiter, Saturno, Urano, Neptuno','Mercurio, Venus, Tierra, Marte','Solo Tierra y Marte','Mercurio y Venus'],r:1},
      {p:'La relatividad especial fue propuesta por:',ops:['Newton','Darwin','Einstein','Bohr'],r:2},
      {p:'La fusión nuclear:',ops:['Divide átomos pesados','Une núcleos ligeros liberando energía','Produce reacciones químicas','Genera radioactividad alfa'],r:1},
      {p:'El año luz es una medida de:',ops:['Tiempo','Distancia','Velocidad','Masa'],r:1},
    ],
  },
  historia: {
    1:[
      {p:'¿Qué civilización construyó las pirámides de Giza?',ops:['Griega','Romana','Egipcia','Mesopotámica'],r:2},
      {p:'¿Dónde surgió la escritura cuneiforme?',ops:['Egipto','Grecia','Mesopotamia','China'],r:2},
      {p:'¿Cuántas regiones naturales tiene el Perú?',ops:['2','3','4','5'],r:1},
      {p:'La democracia fue inventada en:',ops:['Roma','Atenas','Esparta','Cartago'],r:1},
      {p:'¿Cuál es la capital del Perú?',ops:['Cusco','Arequipa','Lima','Trujillo'],r:2},
      {p:'¿Qué río rodea Egipto?',ops:['Éufrates','Tigris','Nilo','Ganges'],r:2},
      {p:'Filósofo griego maestro de Alejandro Magno:',ops:['Sócrates','Platón','Aristóteles','Pitágoras'],r:2},
      {p:'¿Cuántos departamentos tiene el Perú?',ops:['20','22','24','26'],r:2},
      {p:'Roma fue fundada aproximadamente en:',ops:['1000 a.C.','753 a.C.','500 a.C.','200 a.C.'],r:1},
      {p:'Las 8 regiones de Pulgar Vidal inician con:',ops:['Chala y Yunga','Playa y Montaña','Mar y Sierra','Selva y Costa'],r:0},
    ],
    2:[
      {p:'¿Cuál fue la capital del Imperio Inca?',ops:['Lima','Machu Picchu','Cusco','Cajamarca'],r:2},
      {p:'¿En qué año llegó Francisco Pizarro?',ops:['1520','1525','1532','1540'],r:2},
      {p:'¿Cuántos suyos tenía el Tahuantinsuyo?',ops:['2','3','4','5'],r:2},
      {p:'Trabajo forzado en el Virreinato:',ops:['Yanaconazgo','Mita','Encomienda','Tributo'],r:1},
      {p:'El Virreinato del Perú fue creado en:',ops:['1532','1542','1550','1600'],r:1},
      {p:'¿Quién fue el último inca?',ops:['Huáscar','Atahualpa','Túpac Yupanqui','Pachacútec'],r:1},
      {p:'¿Cuál fue el primer inca según la tradición?',ops:['Atahualpa','Huáscar','Manco Cápac','Pachacútec'],r:2},
      {p:'¿En qué ciudad fue capturado Atahualpa?',ops:['Cusco','Lima','Cajamarca','Trujillo'],r:2},
      {p:'La plata de Potosí era del actual:',ops:['Perú','Bolivia','Chile','Argentina'],r:1},
      {p:'El Tahuantinsuyo abarcó desde Colombia hasta:',ops:['Brasil','Argentina/Chile','Venezuela','Panamá'],r:1},
    ],
    3:[
      {p:'¿En qué año se proclamó la independencia del Perú?',ops:['1810','1819','1821','1824'],r:2},
      {p:'¿Qué batalla consolidó la independencia sudamericana?',ops:['Junín','Ayacucho','Chacabuco','Pichincha'],r:1},
      {p:'¿Quién proclamó la independencia del Perú?',ops:['Simón Bolívar','José de San Martín','O\'Higgins','Antonio Sucre'],r:1},
      {p:'Rebelión de Túpac Amaru II fue en:',ops:['1770','1780','1790','1800'],r:1},
      {p:'¿Cuándo fue la Batalla de Ayacucho?',ops:['1821','1822','1823','1824'],r:3},
      {p:'Causa externa de la independencia:',ops:['Mala administración','Revolución Francesa e independencia EE.UU.','Crisis económica local','Terremotos'],r:1},
      {p:'La Guerra del Pacífico fue entre:',ops:['Perú y Brasil','Perú, Bolivia y Chile','Perú y Ecuador','Perú y Colombia'],r:1},
      {p:'¿Qué tipo de gobierno adoptó el Perú?',ops:['Monarquía','República presidencialista','Teocracia','Oligarquía'],r:1},
      {p:'La independencia fue el:',ops:['28 julio 1820','28 julio 1821','28 julio 1822','28 julio 1823'],r:1},
      {p:'¿Qué país apoyó la independencia sudamericana?',ops:['Francia','Inglaterra','España','Portugal'],r:1},
    ],
    4:[
      {p:'¿Cuándo se fundó el APRA?',ops:['1920','1924','1930','1935'],r:1},
      {p:'La Reforma Agraria de Velasco fue en:',ops:['1965','1969','1975','1980'],r:1},
      {p:'¿Quién capturó a Abimael Guzmán?',ops:['Fujimori','García','Belaúnde','Toledo'],r:0},
      {p:'¿En qué año fue capturado Abimael Guzmán?',ops:['1990','1991','1992','1993'],r:2},
      {p:'La "República Aristocrática" duró hasta:',ops:['1910','1915','1919','1925'],r:2},
      {p:'¿Cuándo comenzó Sendero Luminoso?',ops:['1978','1980','1982','1985'],r:1},
      {p:'El Oncenio de Leguía duró de 1919 a:',ops:['1925','1928','1930','1933'],r:2},
      {p:'¿Qué grupo terrorista actuó con Sendero?',ops:['FARC','ELN','MRTA','IRA'],r:2},
      {p:'Velasco fue reemplazado por:',ops:['Fujimori','Belaúnde','Morales Bermúdez','García'],r:2},
      {p:'La Reforma Agraria distribuyó:',ops:['Empresas','Tierras','Dinero','Votos'],r:1},
    ],
    5:[
      {p:'¿Cuándo cayó el Muro de Berlín?',ops:['1985','1987','1989','1991'],r:2},
      {p:'¿En qué año se disolvió la URSS?',ops:['1989','1990','1991','1993'],r:2},
      {p:'¿Cuándo fue fundada la ONU?',ops:['1939','1945','1948','1950'],r:1},
      {p:'La Guerra Fría fue entre:',ops:['EE.UU. y China','EE.UU. y Alemania','EE.UU. y URSS','EE.UU. y Japón'],r:2},
      {p:'¿Qué acuerdo integra a Perú con Asia-Pacífico?',ops:['OEA','APEC','Mercosur','ASEAN'],r:1},
      {p:'¿En qué año comenzó la Segunda Guerra Mundial?',ops:['1935','1937','1939','1941'],r:2},
      {p:'La globalización implica:',ops:['Aislamiento de países','Integración de economías y culturas','Solo comercio de materias primas','Desaparición de estados'],r:1},
      {p:'La OEA es la Organización de Estados:',ops:['Europeos','Africanos','Americanos','Asiáticos'],r:2},
      {p:'¿Cuándo terminó la Segunda Guerra Mundial?',ops:['1943','1944','1945','1946'],r:2},
      {p:'La Alianza del Pacífico incluye a Perú con:',ops:['Brasil, Argentina y Chile','Colombia, Chile y México','Bolivia, Ecuador y Colombia','Venezuela, Ecuador y Bolivia'],r:1},
    ],
  },
  comunicacion: {
    1:[
      {p:'"Corre como el viento" es:',ops:['Metáfora','Símil','Hipérbole','Personificación'],r:1},
      {p:'¿Qué tipo de texto cuenta una historia?',ops:['Argumentativo','Instructivo','Narrativo','Descriptivo'],r:2},
      {p:'La idea principal puede ser:',ops:['Solo explícita','Solo implícita','Explícita o implícita','Siempre al final'],r:2},
      {p:'El conector "además" indica:',ops:['Contraste','Causa','Adición','Consecuencia'],r:2},
      {p:'¿Qué hace un texto instructivo?',ops:['Cuenta un cuento','Da pasos a seguir','Describe un lugar','Defiende una idea'],r:1},
      {p:'"El árbol lloraba" es:',ops:['Metáfora','Símil','Personificación','Hipérbole'],r:2},
      {p:'¿Qué tipo de texto describe características?',ops:['Narrativo','Descriptivo','Argumentativo','Expositivo'],r:1},
      {p:'Conectores de consecuencia:',ops:['Además, también','Porque, ya que','Por lo tanto, en consecuencia','Pero, sin embargo'],r:2},
      {p:'Un párrafo es:',ops:['Una sola oración','Un conjunto de oraciones con una idea','Todo el texto','El título'],r:1},
      {p:'¿Qué busca un texto argumentativo?',ops:['Entretener','Describir','Persuadir','Instruir'],r:2},
    ],
    2:[
      {p:'¿Qué género se escribe para representarse en escena?',ops:['Narrativo','Lírico','Dramático','Ensayístico'],r:2},
      {p:'Ricardo Palma es autor de:',ops:['Trilce','Tradiciones Peruanas','El señor Presidente','Cien años de soledad'],r:1},
      {p:'"Tus ojos son dos luceros" es:',ops:['Símil','Metáfora','Hipérbole','Anáfora'],r:1},
      {p:'¿Qué género expresa sentimientos en verso?',ops:['Narrativo','Lírico','Dramático','Ensayístico'],r:1},
      {p:'César Vallejo escribió:',ops:['La ciudad y los perros','Trilce','Tradiciones Peruanas','El zorro de arriba'],r:1},
      {p:'Una tragedia pertenece al género:',ops:['Narrativo','Lírico','Dramático','Épico'],r:2},
      {p:'Mario Vargas Llosa recibió el Nobel en:',ops:['2005','2008','2010','2012'],r:2},
      {p:'La fábula pertenece al género:',ops:['Dramático','Lírico','Narrativo','Ensayístico'],r:2},
      {p:'La épica narra hazañas de:',ops:['Seres cotidianos','Héroes y guerreros','Personajes cómicos','Animales'],r:1},
      {p:'"La ciudad y los perros" es del género:',ops:['Lírico','Dramático','Narrativo','Ensayo'],r:2},
    ],
    3:[
      {p:'¿Qué parte de la oración expresa la acción?',ops:['Sustantivo','Adjetivo','Verbo','Adverbio'],r:2},
      {p:'Oración simple tiene:',ops:['Dos verbos','Un verbo','Sin verbo','Tres cláusulas'],r:1},
      {p:'¿Qué es el sujeto?',ops:['Lo que se dice del sustantivo','Quien realiza la acción','El complemento directo','El verbo principal'],r:1},
      {p:'¿Qué clase de palabra modifica al verbo?',ops:['Adjetivo','Sustantivo','Adverbio','Preposición'],r:2},
      {p:'"Los niños jugaban felices." El adjetivo es:',ops:['Los','niños','jugaban','felices'],r:3},
      {p:'El predicado contiene:',ops:['Solo el sujeto','El núcleo verbal y sus complementos','Solo adjetivos','La idea secundaria'],r:1},
      {p:'Núcleo del sujeto en "Los estudiantes estudian":',ops:['Los','estudiantes','estudian','Los estudiantes'],r:1},
      {p:'¿Cuándo se usa tilde en "él"?',ops:['Cuando es artículo','Cuando es pronombre personal','Siempre','Nunca'],r:1},
      {p:'Una oración compuesta tiene:',ops:['Un solo verbo','Dos o más proposiciones','Sin verbo','Solo sustantivos'],r:1},
      {p:'Función de la preposición:',ops:['Nombrar','Calificar','Unir palabras indicando relación','Expresar acción'],r:2},
    ],
    4:[
      {p:'Un texto argumentativo incluye:',ops:['Personajes y trama','Tesis y argumentos','Pasos a seguir','Descripción de lugares'],r:1},
      {p:'¿Qué es un ensayo?',ops:['Texto narrativo con personajes','Texto en prosa con tesis y argumentos propios','Lista de instrucciones','Poema en prosa'],r:1},
      {p:'Argumento de autoridad usa:',ops:['Citar ejemplos','Citar expertos o datos oficiales','Comparar situaciones','Usar emociones'],r:1},
      {p:'El "prosumidor" en comunicación digital:',ops:['Solo productor','Solo consumidor','Produce y consume contenidos','Editor profesional'],r:2},
      {p:'Estructura del ensayo:',ops:['Inicio, nudo, desenlace','Introducción, tesis, argumentos, conclusión','Solo tesis y conclusión','Párrafos sin orden'],r:1},
      {p:'La publicidad busca principalmente:',ops:['Informar sobre eventos','Vender o promover un producto','Narrar historias','Enseñar valores'],r:1},
      {p:'La anáfora es:',ops:['Hipérbole','Repetición de una palabra al inicio','Metáfora','Ironía'],r:1},
      {p:'El contraargumento en un ensayo sirve para:',ops:['Apoyar la tesis','Refutar posibles objeciones','Reemplazar la tesis','Sustituir la conclusión'],r:1},
      {p:'Un eslogan usa principalmente:',ops:['Argumentos lógicos','Lenguaje conciso y memorable','Estadísticas detalladas','Textos largos'],r:1},
      {p:'Análisis crítico de medios implica:',ops:['Creer todo lo que dicen','Identificar emisor, propósito y recursos','Solo leer titulares','Rechazar toda información'],r:1},
    ],
    5:[
      {p:'¿Qué es el lenguaje audiovisual?',ops:['Solo audio','Solo visual','Combinación de imagen y sonido','Solo texto'],r:2},
      {p:'Un plano general muestra:',ops:['Solo el rostro','El cuerpo completo y el entorno','Un detalle específico','Solo los ojos'],r:1},
      {p:'El "fake news" se refiere a:',ops:['Noticias extranjeras','Noticias antiguas','Noticias falsas o manipuladas','Noticias sin fuente'],r:2},
      {p:'Ángulo de cámara desde abajo:',ops:['Picado','Normal','Contrapicado','Cenital'],r:2},
      {p:'Ética en comunicación digital exige:',ops:['Publicar todo libremente','Respetar privacidad y verificar fuentes','Solo usar redes privadas','Evitar el internet'],r:1},
      {p:'Un proyecto de vida incluye:',ops:['Solo objetivos económicos','Metas personales, profesionales y valores','Solo la carrera','Lista de actividades diarias'],r:1},
      {p:'¿Qué es el ciberacoso?',ops:['Jugar videojuegos en red','Acoso mediante plataformas digitales','Usar internet sin permiso','Crear contenido falso'],r:1},
      {p:'La propaganda busca principalmente:',ops:['Vender productos','Cambiar actitudes o comportamientos','Entretener','Informar objetivamente'],r:1},
      {p:'Fact-checking es:',ops:['Sensacionalismo','Verificar información antes de publicar','Clickbait','Propaganda'],r:1},
      {p:'El receptor activo en comunicación:',ops:['Solo recibe el mensaje','Interpreta, cuestiona y da retroalimentación','Ignora el mensaje','Solo decodifica señales'],r:1},
    ],
  },
  ingles: {
    1:[
      {p:'Which is correct? "She ___ a student."',ops:['am','is','are','be'],r:1},
      {p:'"Good morning" is used:',ops:['At night','In the evening','In the morning','At noon'],r:2},
      {p:'How do you say "rojo"?',ops:['Blue','Green','Red','Yellow'],r:2},
      {p:'Count: one, two, ___, four',ops:['three','free','tree','thre'],r:0},
      {p:'"They ___ happy."',ops:['is','am','are','be'],r:2},
      {p:'Plural of "book":',ops:['bookies','books','bookes','booksies'],r:1},
      {p:'"Goodbye" means:',ops:['Hola','Gracias','Adiós','Por favor'],r:2},
      {p:'"I ___ from Peru."',ops:['is','am','are','be'],r:1},
      {p:'What color is the sky?',ops:['Red','Green','Blue','Yellow'],r:2},
      {p:'How many days in a week?',ops:['5','6','7','8'],r:2},
    ],
    2:[
      {p:'Past of "go":',ops:['goed','gone','went','goes'],r:2},
      {p:'"She ___ English every day."',ops:['study','studys','studies','studied'],r:2},
      {p:'Which means "siempre"?',ops:['never','sometimes','often','always'],r:3},
      {p:'"Do you like pizza?" → "Yes, I ___."',ops:['do','does','am','like'],r:0},
      {p:'Past of "eat":',ops:['eated','ate','eaten','eats'],r:1},
      {p:'"Where ___ you live?"',ops:['does','is','do','are'],r:2},
      {p:'Negative: "I ___ like coffee."',ops:['not','dont',"don't","doesn't"],r:2},
      {p:'"He ___ TV every night."',ops:['watch','watchs','watches','watched'],r:2},
      {p:'Time expression for present simple:',ops:['yesterday','last week','every day','two days ago'],r:2},
      {p:'"They ___ not at school today."',ops:['is','am','are','be'],r:2},
    ],
    3:[
      {p:'"I (go) to the market yesterday."',ops:['go','goes','went','gone'],r:2},
      {p:'Past of "buy":',ops:['buyed','byed','bought','buys'],r:2},
      {p:'"Did you ___ breakfast?"',ops:['ate','eat','eated','eating'],r:1},
      {p:'Past time expression:',ops:['every day','tomorrow','yesterday','usually'],r:2},
      {p:'Negative past: "She ___ go to school."',ops:['not did',"didn't","doesn't","isn't"],r:1},
      {p:'Past of "see":',ops:['sawed','seed','seen','saw'],r:3},
      {p:'"They ___ a great movie last night."',ops:['watch','watches','watched','are watching'],r:2},
      {p:'Past of "be" for he/she:',ops:['were','been','are','was'],r:3},
      {p:'"___ you study last night?"',ops:['Do','Does','Did','Were'],r:2},
      {p:'Past of "have":',ops:['haved','have','had','has'],r:2},
    ],
    4:[
      {p:'"I already have tickets to Paris." Use:',ops:['will','am going to','would','should'],r:1},
      {p:'"If you study, you ___ pass."',ops:['would','will','might','should'],r:1},
      {p:'Modal for advice:',ops:['must','can','should','will'],r:2},
      {p:'"She ___ swim very well." (ability)',ops:['must','can','should','will'],r:1},
      {p:'Modal for obligation:',ops:['can','should','must','would'],r:2},
      {p:'Spontaneous prediction uses:',ops:['going to','will','must','should'],r:1},
      {p:'"If it rains, we ___ stay home."',ops:['would','will','might','should'],r:1},
      {p:'"___ I open the window?" (permission)',ops:['Must','Should','May','Will'],r:2},
      {p:'"I ___ help you if you need." (offer)',ops:['must','should','will','can'],r:2},
      {p:'Plan already decided uses:',ops:['will','am going to','would','might'],r:1},
    ],
    5:[
      {p:'"I have visited Paris." Tense:',ops:['Past simple','Present perfect','Future simple','Present continuous'],r:1},
      {p:'"They build houses." → Passive:',ops:['Houses built.','Houses are built.','They are built.','Houses were built.'],r:1},
      {p:'"The student ___ won the prize is from Lima."',ops:['which','where','who','whom'],r:2},
      {p:'Present perfect keyword:',ops:['ago','last','just','yesterday'],r:2},
      {p:'"The book ___ written by Vargas Llosa."',ops:['is','was','were','be'],r:1},
      {p:'"Lima, ___ is the capital, is beautiful."',ops:['who','where','which','that'],r:2},
      {p:'"She has lived here ___ 2010."',ops:['for','since','ago','until'],r:1},
      {p:'"Have you ___ visited Machu Picchu?"',ops:['always','never','ever','just'],r:2},
      {p:'"The place ___ I was born is Cusco."',ops:['who','which','where','that'],r:2},
      {p:'"Houses ___ built every year." (passive present)',ops:['is','are','were','was'],r:1},
    ],
  },
};

