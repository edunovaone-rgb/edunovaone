const fs = require('fs');
const html = fs.readFileSync('c:/Users/LENOVO/Desktop/workspace/proyecto/biblioteca.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script(?![^>]*type=['"]module['"])[^>]*>([\s\S]*?)<\/script>/gi)];
let combined = '';
scriptMatches.forEach(m => combined += m[1] + '\n');
let open = 0, close = 0;
for (const c of combined) { if (c==='{') open++; if (c==='}') close++; }
console.log('Open:', open, ' Close:', close, ' Diff:', open - close);
// Check for duplicate let
const dups = [...combined.matchAll(/let resumenesLoaded/g)];
console.log('resumenesLoaded declarations:', dups.length);
// Check initResumenes
const inits = [...combined.matchAll(/function initResumenes/g)];
console.log('initResumenes declarations:', inits.length);
