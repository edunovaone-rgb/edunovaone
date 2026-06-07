import sharp from 'sharp';
import { existsSync, statSync } from 'fs';

const assets = [
  { src: 'assets/Fondoindex.png', out: 'assets/Fondoindex.webp', quality: 82 },
  { src: 'assets/Icono.png',      out: 'assets/Icono.webp',      quality: 90 },
];

for (const { src, out, quality } of assets) {
  if (!existsSync(src)) { console.log('Not found: ' + src); continue; }
  await sharp(src).webp({ quality }).toFile(out);
  const si = statSync(src);
  const so = statSync(out);
  const saved = ((1 - so.size / si.size) * 100).toFixed(1);
  console.log('OK ' + src + ' -> ' + out + ' (' + (si.size/1024).toFixed(0) + 'KB -> ' + (so.size/1024).toFixed(0) + 'KB, -' + saved + '%)');
}
console.log('Done.');
