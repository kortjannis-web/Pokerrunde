// Syntax-Check aller Inline-Skripte in index.html: node check.js /pfad/index.html
const fs = require('fs'), vm = require('vm');
const f = process.argv[2] || require('path').join(__dirname, '..', '..', 'index.html');
const html = fs.readFileSync(f, 'utf8');
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
let m, i = 0, bad = 0;
while ((m = re.exec(html))) {
  i++;
  const line = html.slice(0, m.index).split('\n').length;
  try { new vm.Script(m[1], { filename: 'script' + i + '@line' + line }); }
  catch (e) { bad++; console.log('FEHLER in Skript ' + i + ' (ab Zeile ' + line + '): ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')); }
}
console.log(i + ' Skripte geprueft, ' + bad + ' mit Fehlern');
process.exit(bad ? 1 : 0);
