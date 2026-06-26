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
