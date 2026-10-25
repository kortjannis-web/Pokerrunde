// Konten, Hall, Freunde und Einladungen ueber einen Supabase-Ersatz (Nachbau von supabase/pokerrunde.sql im Speicher)
// und den PeerJS-Ersatz. Anna spielt schon und sichert ihr Konto, Ben ist neu, Anna meldet sich auf einem zweiten
// Geraet an und wieder ab. Aufruf: node dev/test/online-konto.js [ausgabeordner]   (Exit 1 bei Fehlern)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUT = (process.argv[2] || path.join(__dirname, 'shots')) + '/';
const FAKEP = fs.readFileSync(__dirname + '/fakepeer.js', 'utf8'), FAKESB = fs.readFileSync(__dirname + '/fakesb.js', 'utf8');
fs.mkdirSync(OUT, { recursive: true });

/* ---------- Nachbau der Datenbank (gleiche Regeln wie supabase/pokerrunde.sql) ---------- */
const DB = { users: [], profiles: [], saves: [], fr: [], inv: [], invId: 0 }, SUBS = [], PRES = {};
const ok = (data) => ({ data, error: null }), bad = (m) => ({ data: null, error: { message: m } });
const key = (n) => String(n || '').trim().toLowerCase();
const uid = () => 'u' + Math.random().toString(16).slice(2, 10) + '-0000-0000-0000-000000000000';
const prof = (id) => DB.profiles.find((p) => p.id === id);
function newCode() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c; do { c = ''; for (let i = 0; i < 6; i++) c += A[Math.floor(Math.random() * A.length)]; } while (DB.profiles.some((p) => p.code === c)); return c; }
function friends(a, b) { return DB.fr.some((f) => f.status === 'accepted' && ((f.a === a && f.b === b) || (f.a === b && f.b === a))); }
function sees(table, row, u) {
  if (table === 'profiles') return !!u;
  if (table === 'saves') return row.id === u;
  if (table === 'friendships') return row.a === u || row.b === u;
  if (table === 'invites') return row.from_id === u || row.to_id === u;
  return false;
}
function emit(table, event, row) {
  SUBS.forEach((s) => s.pg.forEach((f) => {
    if (f.table !== table || (f.event !== '*' && f.event !== event)) return;
    if (f.filter) { const m = /^(\w+)=eq\.(.+)$/.exec(f.filter); if (m && String(row[m[1]]) !== m[2]) return; }
    if (event !== 'DELETE' && !sees(table, row, s.uid)) return;
    s.page.evaluate((e) => window.__sbEvt && window.__sbEvt(e), { cid: s.cid, k: 'pg', table, event, row }).catch(() => {});
  }));
}
function presSync(name) {
  const st = {}; Object.keys(PRES[name] || {}).forEach((k) => { st[k] = [PRES[name][k].o]; });
  SUBS.filter((s) => s.name === name).forEach((s) => s.page.evaluate((e) => window.__sbEvt && window.__sbEvt(e), { cid: s.cid, k: 'presence', state: st }).catch(() => {}));
}
function tableOf(t) { return { profiles: DB.profiles, saves: DB.saves, friendships: DB.fr, invites: DB.inv }[t]; }
function match(row, f) { return f.every(([c, op, v]) => op === 'eq' ? String(row[c]) === String(v) : op === 'in' ? v.includes(row[c]) : op === 'gte' ? row[c] >= v : true); }
function sb(op, a, page) {
  const now = new Date().toISOString();
  if (op === 'signUp') {
    if (DB.users.some((u) => u.email === a.email)) return bad('User already registered');
    const m = (a.options && a.options.data) || {}, n = String(m.name || '').trim().slice(0, 14);
    if (DB.profiles.some((p) => key(p.name) === key(n))) return bad('Database error saving new user');
    const id = uid(); DB.users.push({ id, email: a.email, pw: a.password });
    let c = String(m.code || '').toUpperCase(); if (!/^[A-Z2-9]{6}$/.test(c) || DB.profiles.some((p) => p.code === c)) c = newCode();
    const p = { id, name: n, code: c, color: /^#[0-9a-f]{6}$/i.test(m.color) ? m.color : '#b5543f', bank: 0, stars: 0, cos: {}, seen_at: now };
    DB.profiles.push(p); emit('profiles', 'INSERT', p);
    return ok({ user: { id }, session: { user: { id } } });
  }
  if (op === 'signIn') { const u = DB.users.find((x) => x.email === a.email && x.pw === a.password); return u ? ok({ user: { id: u.id }, session: { user: { id: u.id } } }) : bad('Invalid login credentials'); }
  const me = DB.users.some((x) => x.id === a.tok) ? a.tok : '';
  if (op === 'rpc') {
    const o = a.args && a.args.other;
    if (a.fn === 'name_free') { const n = String(a.args.n || '').trim(); return ok(n.length >= 2 && n.length <= 14 && !DB.profiles.some((p) => key(p.name) === key(n))); }
    if (!me) return bad('nicht angemeldet');
    if (a.fn === 'befriend') {
      const back = DB.fr.find((f) => f.a === o && f.b === me);
      if (back) { back.status = 'accepted'; emit('friendships', 'UPDATE', back); return ok('accepted'); }
      let f = DB.fr.find((x) => x.a === me && x.b === o);
      if (!f) { f = { a: me, b: o, status: 'pending' }; DB.fr.push(f); emit('friendships', 'INSERT', f); }
      return ok(f.status);
    }
    if (a.fn === 'accept_friend') { const f = DB.fr.find((x) => x.a === o && x.b === me); if (f) { f.status = 'accepted'; emit('friendships', 'UPDATE', f); } return ok(!!f); }
    if (a.fn === 'unfriend') { const l = DB.fr.filter((x) => (x.a === me && x.b === o) || (x.a === o && x.b === me)); DB.fr = DB.fr.filter((x) => !l.includes(x)); l.forEach((x) => emit('friendships', 'DELETE', x)); return ok(l.length > 0); }
    return bad('unbekannte Funktion');
  }
  if (op === 'q') {
    if (!me) return bad('nicht angemeldet');
    const T = tableOf(a.table); if (!T) return bad('unbekannte Tabelle');
    if (a.op === 'select') {
      let l = T.filter((r) => sees(a.table, r, me) && match(r, a.f)).map((r) => ({ ...r }));
      if (a.order) l.sort((x, y) => (x[a.order[0]] < y[a.order[0]] ? -1 : 1) * (a.order[1] ? 1 : -1));
      if (a.limit) l = l.slice(0, a.limit);
      return ok(a.single ? l[0] || null : l);
    }
    if (a.op === 'insert' && a.table === 'invites') {
      const d = a.data; if (d.from_id !== me || !friends(d.from_id, d.to_id)) return bad('new row violates row-level security policy');
      const r = { id: ++DB.invId, ...d, created_at: now }; DB.inv.push(r); emit('invites', 'INSERT', r); return ok(null);
    }
    if (a.op === 'upsert' && a.table === 'saves') {
      if (a.data.id !== me) return bad('rls'); const i = DB.saves.findIndex((s) => s.id === me);
      if (i >= 0) DB.saves[i] = { ...a.data }; else DB.saves.push({ ...a.data }); return ok(null);
    }
    if (a.op === 'update' && a.table === 'profiles') {
      const allowed = ['color', 'bank', 'stars', 'cos', 'updated_at', 'seen_at'];
      if (Object.keys(a.data).some((k) => !allowed.includes(k))) return bad('permission denied for table profiles');
      T.filter((r) => r.id === me && match(r, a.f)).forEach((r) => { Object.assign(r, a.data); emit('profiles', 'UPDATE', r); }); return ok(null);
    }
    if (a.op === 'delete' && a.table === 'invites') { const l = T.filter((r) => sees('invites', r, me) && match(r, a.f)); DB.inv = DB.inv.filter((r) => !l.includes(r)); return ok(null); }
    return bad('nicht erlaubt: ' + a.op + ' ' + a.table);
  }
  if (op === 'sub') { SUBS.push({ page, cid: a.cid, name: a.name, uid: me, pg: a.pg || [] }); if (a.name === 'hall') presSync('hall'); return ok(null); }
  if (op === 'track') { (PRES[a.name] = PRES[a.name] || {})[a.key] = { o: a.o, page }; presSync(a.name); return ok(null); }
  return bad('unbekannt ' + op);
}
function gonePage(page) {
  for (let i = SUBS.length - 1; i >= 0; i--) if (SUBS[i].page === page) SUBS.splice(i, 1);
  Object.keys(PRES).forEach((n) => { Object.keys(PRES[n]).forEach((k) => { if (PRES[n][k].page === page) delete PRES[n][k]; }); presSync(n); });
}

/* ---------- Server und Handys ---------- */
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  if (p.endsWith('peerjs.min.js')) { r.writeHead(200, { 'content-type': 'text/javascript' }); r.end(FAKEP); return; }
  if (p.endsWith('supabase.min.js')) { r.writeHead(200, { 'content-type': 'text/javascript' }); r.end(FAKESB); return; }
  if (p.endsWith('sw.js')) { r.writeHead(404); r.end(); return; }
  fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(d); });
}).listen(0, async () => {
  const b = await chromium.launch(), pages = [], errs = [];
  let fails = 0;
  const check = (what, cond, extra) => { console.log((cond ? 'OK   ' : 'FEHLT') + ' ' + what + (extra !== undefined ? ' · ' + extra : '')); if (!cond) fails++; };
  async function mk(name, init) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const pg = await ctx.newPage(); pg._n = name;
    pg.on('pageerror', (e) => errs.push(name + ' pageerror: ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push(name + ' console: ' + m.text()); });
    pg.on('close', () => gonePage(pg));
    pg.on('framenavigated', (f) => { if (f === pg.mainFrame()) gonePage(pg); });
    await pg.exposeFunction('__fpOut', (m) => { pages.forEach((o) => { if (o !== pg) o.evaluate((m) => window.__fpIn && window.__fpIn(m), m).catch(() => {}); }); });
    await pg.exposeFunction('__sbCall', (op, a) => sb(op, a, pg));
    await pg.addInitScript((init) => {
      if (!localStorage.getItem('pr-init')) {
        var d = new Date(), k = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        localStorage.setItem('pr-daily', JSON.stringify({ day: k, streak: 1 }));
        Object.keys(init).forEach(function (x) { localStorage.setItem(x, init[x]); });
        localStorage.setItem('pr-init', '1');
      }
      window.PR_TESTHOOKS = 1; window.PR_SB_URL = 'https://fake.supabase.co'; window.PR_SB_KEY = 'sb_publishable_fake';
    }, init);
    pages.push(pg);
    await pg.goto('http://localhost:' + srv.address().port + '/index.html');
    return pg;
  }
  const txt = (pg, s) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent : null; }, s);
  const vis = (pg, s) => pg.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden; }, s);
  async function until(pg, fn, arg, ms) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await pg.waitForTimeout(100); } return false; }
  async function fill(pg, n, pw, pw2) { await pg.fill('#acName', n); await pg.fill('#acPw', pw); if (pw2 !== undefined) await pg.fill('#acPw2', pw2); await pg.click('#acGo'); }

  /* Anna spielt schon: Konto sichern */
  const A = await mk('Anna', { 'pr-profile': JSON.stringify({ name: 'Anna', bank: 4321, color: '#b5543f', hands: 7, wins: 2 }), 'pr-pcode': 'AAAAA2' });
  check('Anna: Konto-Fenster kommt', await until(A, () => !document.querySelector('#acct').hidden, null, 9000));
  check('Anna: Titel „Konto sichern“, Name vorbelegt', (await txt(A, '#acT')) === 'Konto sichern' && (await A.inputValue('#acName')) === 'Anna', await txt(A, '#acT'));
  await A.screenshot({ path: OUT + 'konto-sichern.png' });
  await fill(A, 'Anna', '12', '12');
  check('Anna: zu kurzes Passwort abgelehnt', /mindestens 4/.test(await txt(A, '#acMsg')));
  await fill(A, 'Anna', '1234', '1234');
  check('Anna: angemeldet', await until(A, () => window.PRSB.state() === 'ok', null, 8000));
  const pa = DB.profiles.find((p) => p.name === 'Anna');
  check('Anna: Profil mit ihrem Spielercode', pa && pa.code === 'AAAAA2', pa && pa.code);
  check('Anna: Spielstand in der Cloud', await until(A, () => true, null, 300) && DB.saves.some((s) => s.id === pa.id && /Anna/.test(s.data['pr-profile'] || '')));
  check('Anna: Name im Profil gesperrt', await A.evaluate(() => document.querySelector('#pName').readOnly));
  await A.waitForTimeout(5500);
  check('Anna: Chips im öffentlichen Profil', pa.bank === (await A.evaluate(() => PR.prof().bank)), pa.bank);

  /* Ben ist neu */
  const B = await mk('Ben', {});
  check('Ben: Konto-Fenster „Willkommen“', await until(B, () => !document.querySelector('#acct').hidden && document.querySelector('#acT').textContent === 'Willkommen', null, 9000));
  await fill(B, 'anna', 'abcd', 'abcd');
  check('Ben: vergebener Name abgelehnt', await until(B, () => /gibt es schon/.test(document.querySelector('#acMsg').textContent), null, 4000), await txt(B, '#acMsg'));
  await fill(B, 'Ben', 'abcd', 'abcx');
  check('Ben: ungleiche Passwörter abgelehnt', /nicht gleich/.test(await txt(B, '#acMsg')));
  await fill(B, 'Ben', 'abcd', 'abcd');
  check('Ben: angemeldet', await until(B, () => window.PRSB.state() === 'ok', null, 8000));
  const pb = DB.profiles.find((p) => p.name === 'Ben');
  const bcode = await B.evaluate(() => PRF.code());
  check('Ben: Spielercode im Profil = Code in der App', pb && pb.code === bcode, bcode);

  /* Hall: Ben sieht Anna online und fragt an */
  await B.evaluate(() => PRSB.hall());
  check('Ben: Hall zeigt Anna online', await until(B, () => [...document.querySelectorAll('#hallL .fl.on')].some((e) => /Anna/.test(e.textContent)), null, 6000));
  await B.screenshot({ path: OUT + 'hall.png' });
  await B.evaluate(() => { const r = [...document.querySelectorAll('#hallL .fl')].find((e) => /Anna/.test(e.textContent)); r.querySelector('.btn').click(); });
  check('Datenbank: Anfrage Ben -> Anna', await until(B, () => true, null, 500) && DB.fr.some((f) => f.a === pb.id && f.b === pa.id && f.status === 'pending'));
  check('Anna: Anfrage kommt an', await until(A, (c) => PRF.has(c) === 'req', bcode, 6000));
  await A.evaluate(() => { const y = document.querySelector('#abYes'); if (y && !document.querySelector('#askBan').hidden) y.click(); });
  check('Anna: Ben ist Freund', await until(A, (c) => PRF.has(c) === 'friend', bcode, 5000));
  check('Datenbank: befreundet', await until(A, () => true, null, 800) && DB.fr.some((f) => f.a === pb.id && f.b === pa.id && f.status === 'accepted'));
  check('Ben: Anna ist Freund', await until(B, () => PRF.has('AAAAA2') === 'friend', null, 6000));

  /* Einladung über die Hall */
  await A.evaluate(() => { document.querySelector('.mdots button[data-p="5"]').click(); });
  await A.waitForTimeout(300);
  await A.evaluate(() => document.querySelector('#crPlay').click());
  await A.evaluate(() => new Promise((r) => window.CR.host(r)));
  await A.waitForTimeout(3500);
  await B.evaluate(() => { document.querySelector('#hall').hidden = true; });
  await A.evaluate(() => PRSB.hall());
  check('Anna: Knopf „Einladen“ bei Ben', await until(A, () => [...document.querySelectorAll('#hallL .fl')].some((e) => /Ben/.test(e.textContent) && /Einladen/.test(e.textContent)), null, 6000));
  await A.evaluate(() => { const r = [...document.querySelectorAll('#hallL .fl')].find((e) => /Ben/.test(e.textContent)); r.querySelector('.btn').click(); });
  check('Ben: Einladung zu Crash', await until(B, () => !document.querySelector('#invBan').hidden && /Crash/.test(document.querySelector('#ibText').textContent), null, 6000), await txt(B, '#ibText'));
  await B.screenshot({ path: OUT + 'einladung.png' });
  await A.evaluate(() => { document.querySelector('#hall').hidden = true; });

  /* Anna auf einem zweiten Gerät */
  const C = await mk('Anna-2', {});
  check('Gerät 2: Konto-Fenster', await until(C, () => !document.querySelector('#acct').hidden, null, 9000));
  await C.evaluate(() => { [...document.querySelectorAll('#acTabs button')].find((x) => /Konto/.test(x.textContent)).click(); });
  check('Gerät 2: Anmelden ohne Wiederholung', (await txt(C, '#acT')) === 'Anmelden' && !(await vis(C, '#acPw2L')));
  await fill(C, 'Anna', '9999');
  check('Gerät 2: falsches Passwort', await until(C, () => /stimmt nicht/.test(document.querySelector('#acMsg').textContent), null, 4000));
  await fill(C, 'anna', '1234');
  await C.waitForTimeout(2500);
  check('Gerät 2: nach Neuladen angemeldet', await until(C, () => window.PRSB && window.PRSB.state() === 'ok', null, 9000));
  const sv = DB.saves.find((s) => s.id === pa.id), cloudBank = JSON.parse(sv.data['pr-profile']).bank;
  check('Gerät 2: Annas Spielstand (Name, Chips, Spielercode)', await C.evaluate((cb) => PR.profName() === 'Anna' && PR.prof().bank === cb && PRF.code() === 'AAAAA2', cloudBank), cloudBank);
  check('Gerät 2: Ben als Freund', await until(C, (c) => PRF.has(c) === 'friend', bcode, 6000));
  await C.evaluate(() => document.querySelector('#profBtn').click());
  await C.waitForTimeout(300);
  check('Gerät 2: Konto im Profil', /Angemeldet als Anna/.test(await txt(C, '#acctTxt')));
  await C.evaluate(() => document.querySelector('#acctBox').scrollIntoView());
  await C.screenshot({ path: OUT + 'profil-konto.png' });
  await C.click('#acctOut'); await C.click('#acctOut');
  await C.waitForTimeout(2500);
  check('Gerät 2: abgemeldet, Konto-Fenster wieder da, Gerät leer', await until(C, () => !document.querySelector('#acct').hidden && PR.profName() === 'Spieler', null, 9000));

  console.log(errs.length ? 'JS-FEHLER:\n' + errs.join('\n') : 'keine JS-Fehler');
  console.log(fails || errs.length ? 'NICHT BESTANDEN (' + fails + ')' : 'ALLES BESTANDEN');
  await b.close(); srv.close(); process.exit(fails || errs.length ? 1 : 0);
});
