// Zwei Handys ueber den PeerJS-Ersatz: Freundesliste-Status, Anfrage, Crash-Raum, Auszahlen akzeptiert/abgelehnt, alte Version
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUT = (process.argv[2] || path.join(__dirname, 'shots')) + '/', FAKE = fs.readFileSync(__dirname + '/fakepeer.js', 'utf8');
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  if (p.endsWith('peerjs.min.js')) { r.writeHead(200, { 'content-type': 'text/javascript' }); r.end(FAKE); return; }
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const which = process.argv[2] || 'all';
  const b = await chromium.launch();
  const pages = [], errs = [];
  const CODES = { Anna: 'AAAAA2', Ben: 'BBBBB3' };
  async function mk(name, other) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const pg = await ctx.newPage(); pg._n = name;
    pg.on('pageerror', e => errs.push(name + ' pageerror: ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()); });
    await pg.exposeFunction('__fpOut', m => { pages.forEach(o => { if (o !== pg) o.evaluate(m => window.__fpIn && window.__fpIn(m), m).catch(() => {}); }); });
    await pg.addInitScript(([name, code, oc, on]) => {
      if (!localStorage.getItem('pr-init')) {
        var d = new Date(), k = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        localStorage.setItem('pr-daily', JSON.stringify({ day: k, streak: 1 }));
        localStorage.setItem('pr-profile', JSON.stringify({ name: name, bank: 5000, color: name === 'Anna' ? '#b5543f' : '#4a86a8' }));
        localStorage.setItem('pr-pcode', code);
        localStorage.setItem('pr-friends', JSON.stringify([{ code: oc, name: on, color: '#777777' }]));
        localStorage.setItem('pr-init', '1');
      }
      window.EV = []; window.PR_TESTHOOKS = 1;
    }, [name, CODES[name], CODES[other], other]);
    pages.push(pg);
    await pg.goto('http://localhost:' + srv.address().port + '/index.html');
    return pg;
  }
  const A = await mk('Anna', 'Ben'), B = await mk('Ben', 'Anna');
  await A.waitForTimeout(5000);
  for (const p of [A, B]) await p.evaluate(() => PR.on('*', function (d, n) { window.EV.push([n, d]); }));
  const ev = (pg, n) => pg.evaluate(n => window.EV.filter(e => e[0] === n).map(e => e[1]), n);
  const R = pg => pg.evaluate(() => { var r = CR._dbg.R(); return r && { ph: r.ph, rd: r.rd, crash: r.crash, pl: r.pl.map(p => [p.name, p.bot, p.b, p.co, p.h]) }; });
  async function waitPh(pg, ph, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await pg.evaluate(ph => CR._dbg.R() && CR._dbg.R().ph === ph, ph)) return true; await pg.waitForTimeout(40); } return false; }
  if (which === 'old') {
    await B.evaluate(() => { window.__fpV = { cr: 0 }; });
    await A.evaluate(() => document.querySelector('.mdots button[data-p="5"]').click()); await A.waitForTimeout(400);
    await A.click('#crPlay'); await A.waitForTimeout(500);
    const code = await A.evaluate(() => new Promise(r => window.CR.host(r)));
    await B.evaluate(c => window.CR.join(c), code); await B.waitForTimeout(2500);
    console.log('Alt: B sieht', await B.evaluate(() => document.querySelector('#crToast').textContent), '| A sieht', await A.evaluate(() => document.querySelector('#crToast').textContent), '| A Spieler', JSON.stringify((await R(A)).pl.filter(p => !p[1])));
  } else {
    /* Freundesliste: B sieht A „Spielt Crash“ mit Anfrage-Knopf */
    await A.evaluate(() => document.querySelector('.mdots button[data-p="5"]').click()); await A.waitForTimeout(400);
    await A.click('#crPlay'); await A.waitForTimeout(3000);
    await B.click('#bFriends'); await B.waitForTimeout(1500);
    const fl = await B.evaluate(() => [...document.querySelectorAll('#friends .fl')].map(e => e.innerText.replace(/\n+/g, ' / ')).join(' || '));
    console.log('B Freundesliste:', fl);
    await B.evaluate(() => { const r = document.querySelector('#friends .fl .flr'); if (r) r.click(); }); await B.waitForTimeout(400);
    await B.screenshot({ path: OUT + 'on-friends-B.png' });
    const ask = await B.evaluate(() => { const b = [...document.querySelectorAll('#friends button')].find(x => /Crash/.test(x.textContent)); if (b) { b.click(); return b.textContent; } return null; });
    console.log('Anfrage-Knopf:', ask);
    await A.waitForTimeout(1200);
    console.log('A Anfrage-Banner:', await A.evaluate(() => !document.querySelector('#askBan').hidden && document.querySelector('#askBan').innerText.replace(/\n+/g, ' / ')));
    await A.screenshot({ path: OUT + 'on-ask-A.png' });
    await A.click('#abYes'); await B.waitForTimeout(3500);
    console.log('B im Raum:', await B.evaluate(() => JSON.stringify(CR.state())), '| A:', await A.evaluate(() => JSON.stringify(CR.state())));
    await B.click('#bFriends').catch(() => {});
    /* Runde: beide setzen, Absturz nach 6 s (H.next = Absturzzeit in ms); B zahlt nach ~2,5 s Flug aus, A Auto bei 2,0 (falls die Kurve so hoch kommt) */
    await waitPh(A, 'bet', 12000); await A.waitForTimeout(300);
    await A.evaluate(() => { CR._dbg.H().next = 6000; });
    await A.click('#crAutoSw'); await A.fill('#crAutoIn', '2'); await A.press('#crAutoIn', 'Enter');
    await A.click('#crGo'); await B.click('#crGo'); await A.waitForTimeout(300);
    console.log('Einsaetze bei A:', JSON.stringify((await R(A)).pl));
    await waitPh(B, 'fly', 9000);
    await B.waitForTimeout(2500);
    await B.click('#crGo'); await B.waitForTimeout(500);
    await A.screenshot({ path: OUT + 'on-fly-A.png' }); await B.screenshot({ path: OUT + 'on-fly-B.png' });
    await waitPh(A, 'boom', 15000); await A.waitForTimeout(1200);
    await A.screenshot({ path: OUT + 'on-boom-A.png' }); await B.screenshot({ path: OUT + 'on-boom-B.png' });
    for (const p of [A, B]) console.log(p._n, 'Runde', JSON.stringify(await ev(p, 'crash:round')), 'online:round', (await ev(p, 'online:round')).length, 'Bank', await p.evaluate(() => PR.prof().bank));
    /* Auszahlen nach dem Absturz: knapp (innerhalb 0,4 s) wird angenommen, spaeter abgelehnt, Flugzeit nach dem Absturz abgelehnt */
    for (const p of [A, B]) await p.evaluate(() => { window.EV.length = 0; });
    async function lateRound(crashMs, eReq, delay) {
      await waitPh(A, 'bet', 12000); await A.waitForTimeout(200);
      await A.evaluate(c => { CR._dbg.H().next = c; }, crashMs);
      await B.click('#crGo'); await A.waitForTimeout(200);
      // B selbst nicht auszahlen lassen: Nachricht erst nach dem Absturz direkt schicken
      await waitPh(A, 'boom', 20000);
      await A.waitForTimeout(delay);
      await B.evaluate(e => { CR._dbg.send({ t: 'out', e: e, h: 0 }); }, eReq);
      await A.waitForTimeout(1300);
      const r = await R(A), bb = r.pl.find(p => p[0] === 'Ben');
      console.log('Absturz nach', crashMs, 'ms, B schickt e =', eReq, 'nach', delay, 'ms -> beim Ersteller co =', bb && bb[3], '| B Runde', JSON.stringify((await ev(B, 'crash:round')).slice(-1)[0]));
    }
    await lateRound(4000, 3900, 0);
    await lateRound(4000, 3900, 900);
    await lateRound(4000, 4100, 0);
    /* Reaktion */
    await B.evaluate(() => { document.querySelector('#crReact').click(); document.querySelector('#crRPanel button[data-e="🚀"]').click(); }); await A.waitForTimeout(600);
    console.log('Reaktion bei A sichtbar:', await A.evaluate(() => !!document.querySelector('#crFr .crfa') && document.body.innerHTML.indexOf('🚀') >= 0));
    console.log('Wurf-Knopf A/B:', await A.evaluate(() => !document.querySelector('#crTom').hidden), await B.evaluate(() => !document.querySelector('#crTom').hidden));
    /* Ersteller geht: B spielt allein weiter */
    await A.evaluate(() => { document.querySelector('#crPauseBtn').click(); document.querySelector('#crMenu').click(); }); await B.waitForTimeout(1500);
    console.log('B nach Ende:', await B.evaluate(() => JSON.stringify(CR.state()) + ' ' + document.querySelector('#crToast').textContent));
  }
  console.log(errs.length ? 'FEHLER:\n' + errs.join('\n') : 'keine JS-Fehler');
  await b.close(); srv.close();
});
