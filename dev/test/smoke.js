// Rauchtest: node smoke.js [ausgabeordner]
// Startet einen lokalen Server, laedt die App auf Handybreite, sammelt JS-Fehler, wischt durch alle Menueseiten
// und macht Screenshots. Exit 1 bei Seitenfehlern.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUT = process.argv[2] || path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/json', '.json': 'application/json' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(ROOT, p);
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(fp)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const port = srv.address().port, errs = [];
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/peerjs|PeerJS|WebSocket|net::|Failed to load resource|0\.peerjs/i.test(m.text())) errs.push('console: ' + m.text()); });
  await pg.goto('http://localhost:' + port + '/index.html');
  await pg.waitForTimeout(4500);
  await pg.screenshot({ path: path.join(OUT, '00-start.png') });
  // Tagesbonus o.ae. wegklicken
  for (const sel of ['#dlGo']) { const el = await pg.$(sel); if (el && await el.isVisible()) { await el.click(); await pg.waitForTimeout(400); } }
  const n = await pg.evaluate(() => document.querySelectorAll('.mdots button').length);
  for (let i = 0; i < n; i++) {
    await pg.evaluate(i => { const b = document.querySelector('.mdots button[data-p="' + i + '"]'); if (b) b.click(); }, i);
    await pg.waitForTimeout(700);
    await pg.screenshot({ path: path.join(OUT, '01-menu-' + i + '.png') });
  }
  console.log('Menueseiten: ' + n);
  console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'keine JS-Fehler');
  await b.close(); srv.close();
  process.exit(errs.length ? 1 : 0);
});
