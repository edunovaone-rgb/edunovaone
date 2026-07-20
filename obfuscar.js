/**
 * obfuscar.js — EduNovaOne
 * Build script: ofusca todos los JS del proyecto y los guarda en /dist/
 *
 * Uso:
 *   node obfuscar.js          → ofusca todos los archivos de la lista
 *   node obfuscar.js watch    → (futuro) modo watch
 *
 * Los archivos originales NO se modifican.
 * Los archivos ofuscados van a ./dist/ con el mismo nombre.
 * Para producción, sube el contenido de dist/ en vez de los .js originales.
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs   = require('fs');
const path = require('path');

// ─── Archivos a ofuscar ───────────────────────────────────────────
const FILES = [
  'auth-nav.js',
  'nav-widgets.js',
  'historial.js',
  'registrar-visita.js',
  'premium.js',
  'script.js',
  'diagnostico-engine.js',
  'evaluacion-registro.js',
  'juegos-engine.js',
  'simulacro-engine.js',
];

// ─── Configuración de ofuscación ─────────────────────────────────
// Nivel ALTO: renombra variables, strings en hex, dead code injection,
// control flow flattening → muy difícil de leer a mano.
const OBF_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,          // no bloquear DevTools (puede dar problemas en prod)
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',   // _0x1a2b3c
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,            // NO renombrar globales (rompe imports/exports)
  selfDefending: false,            // puede dar falsos positivos en algunos navegadores
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 8,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false,
};

// ─── Crear directorio dist/ si no existe ─────────────────────────
const DIST = path.join(__dirname, 'dist');
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

// ─── Ofuscar cada archivo ─────────────────────────────────────────
let ok = 0; let fail = 0;

for (const file of FILES) {
  const src = path.join(__dirname, file);

  if (!fs.existsSync(src)) {
    console.warn(`⚠  No encontrado: ${file}`);
    continue;
  }

  try {
    const code     = fs.readFileSync(src, 'utf8');
    const result   = JavaScriptObfuscator.obfuscate(code, OBF_OPTIONS);
    const outPath  = path.join(DIST, file);

    fs.writeFileSync(outPath, result.getObfuscatedCode(), 'utf8');
    console.log(`✓  ${file}  →  dist/${file}`);
    ok++;
  } catch (err) {
    console.error(`✗  Error ofuscando ${file}:`, err.message);
    fail++;
  }
}

console.log(`\nListo: ${ok} ofuscados, ${fail} errores.`);
console.log(`Archivos listos en: ./dist/`);
console.log(`\n⚠  IMPORTANTE: Para producción, reemplaza cada .js de la raíz`);
console.log(`   con su versión ofuscada de dist/. No subas los originales.`);
