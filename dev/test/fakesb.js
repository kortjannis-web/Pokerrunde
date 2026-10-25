// Ersatz fuer supabase-js im Browser (nur Tests): leitet alle Aufrufe an window.__sbCall weiter (vom Testskript
// per exposeFunction bereitgestellt, dort laeuft ein kleiner Nachbau der Datenbank aus supabase/pokerrunde.sql).
// Ereignisse (Realtime, Presence) kommen ueber window.__sbEvt zurueck. Wird statt supabase.min.js ausgeliefert.
(function () {
  var chans = {}, cid = 0;
  function call(op, a) { return window.__sbCall(op, a); }
  window.__sbEvt = function (e) {
    var ch = chans[e.cid]; if (!ch) return;
    if (e.k === 'presence') { ch.state = e.state; ch.h.forEach(function (x) { if (x.t === 'presence') x.cb({}); }); }
    else if (e.k === 'pg') ch.h.forEach(function (x) { if (x.t === 'postgres_changes' && x.f.table === e.table && (x.f.event === '*' || x.f.event === e.event)) x.cb({ eventType: e.event, new: e.row || {}, old: e.old || {} }); });
  };
  function Q(cl, table) { this.cl = cl; this.a = { table: table, op: 'select', f: [] }; }
  Q.prototype.select = function (c) { if (this.a.op === 'select') this.a.cols = c; return this; };
  Q.prototype.insert = function (d) { this.a.op = 'insert'; this.a.data = d; return this; };
  Q.prototype.upsert = function (d) { this.a.op = 'upsert'; this.a.data = d; return this; };
  Q.prototype.update = function (d) { this.a.op = 'update'; this.a.data = d; return this; };
  Q.prototype.delete = function () { this.a.op = 'delete'; return this; };
  Q.prototype.eq = function (c, v) { this.a.f.push([c, 'eq', v]); return this; };
  Q.prototype.gte = function (c, v) { this.a.f.push([c, 'gte', v]); return this; };
  Q.prototype.in = function (c, v) { this.a.f.push([c, 'in', v]); return this; };
  Q.prototype.order = function (c, o) { this.a.order = [c, !(o && o.ascending === false)]; return this; };
  Q.prototype.limit = function (n) { this.a.limit = n; return this; };
  Q.prototype.maybeSingle = function () { this.a.single = 1; return this; };
  Q.prototype.then = function (ok, no) { var a = this.a; a.tok = this.cl.tok(); return call('q', a).then(ok, no); };
  function Ch(cl, name, cfg) { this.cl = cl; this.name = name; this.cfg = cfg || {}; this.h = []; this.state = {}; this.id = ++cid; chans[this.id] = this; }
  Ch.prototype.on = function (t, f, cb) { this.h.push({ t: t, f: f || {}, cb: cb }); return this; };
  Ch.prototype.subscribe = function (cb) {
    var me = this;
    call('sub', { cid: me.id, name: me.name, tok: me.cl.tok(), pg: me.h.filter(function (x) { return x.t === 'postgres_changes'; }).map(function (x) { return x.f; }) })
      .then(function () { if (cb) cb('SUBSCRIBED'); });
    return this;
  };
  Ch.prototype.track = function (o) { var k = this.cfg.config && this.cfg.config.presence && this.cfg.config.presence.key; return call('track', { cid: this.id, name: this.name, key: k, o: o }); };
  Ch.prototype.presenceState = function () { return this.state; };
  function Client(opts) {
    var me = this, key = (opts && opts.auth && opts.auth.storageKey) || 'sb-fake';
    this.key = key;
    this.auth = {
      getSession: function () { var s = null; try { s = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {} return Promise.resolve({ data: { session: s }, error: null }); },
      signUp: function (a) { return call('signUp', a).then(function (r) { if (r.data && r.data.session) localStorage.setItem(key, JSON.stringify(r.data.session)); return r; }); },
      signInWithPassword: function (a) { return call('signIn', a).then(function (r) { if (r.data && r.data.session) localStorage.setItem(key, JSON.stringify(r.data.session)); return r; }); },
      signOut: function () { localStorage.removeItem(key); return Promise.resolve({ error: null }); }
    };
    this.tok = function () { try { var s = JSON.parse(localStorage.getItem(key) || 'null'); return s && s.user ? s.user.id : ''; } catch (e) { return ''; } };
    this.from = function (t) { return new Q(me, t); };
    this.rpc = function (fn, args) { return call('rpc', { fn: fn, args: args, tok: me.tok() }); };
    this.channel = function (n, cfg) { return new Ch(me, n, cfg); };
    this.removeChannel = function () {};
  }
  window.supabase = { createClient: function (u, k, o) { return new Client(o); } };
})();
