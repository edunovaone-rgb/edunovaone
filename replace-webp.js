const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/LENOVO/Desktop/workspace/proyecto';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.css') || f.endsWith('.js'));
let count = 0;
files.forEach(f => {
  const fp = path.join(dir, f);
  let c = fs.readFileSync(fp, 'utf8');
  const nc = c
    .split('assets/Icono.webp').join('assets/Icono.webp')
    .split('assets/Fondoindex.webp').join('assets/Fondoindex.webp');
  if (nc !== c) {
    fs.writeFileSync(fp, nc, 'utf8');
    console.log('Updated: ' + f);
    count++;
  }
});
console.log('Done. ' + count + ' files updated.');
