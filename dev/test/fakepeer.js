/* Ersatz fuer PeerJS im Test: Verbindungen zwischen Tabs desselben Browsers ueber BroadcastChannel */
(function () {
  var bc = { postMessage: function (m) { window.__fpOut(m); } }, peers = {}, conns = {}, pend = {};
  function Em() { this._h = {}; }
  Em.prototype.on = function (n, f) { (this._h[n] || (this._h[n] = [])).push(f); return this; };
  Em.prototype.off = function () { return this; };
  Em.prototype._e = function (n, a) { var self = this; (this._h[n] || []).slice().forEach(function (f) { try { f.call(self, a); } catch (e) { console.error('fakepeer', e); } }); };
  function rnd() { return 'x' + Math.random().toString(36).slice(2, 12); }
  function Conn(peerId, cid, side, own) { Em.call(this); this.peer = peerId; this.cid = cid; this.side = side; this.own = own; this.open = false; }
  Conn.prototype = Object.create(Em.prototype);
  Conn.prototype.send = function (d) { if (!this.open) return; if (d && d.t === 'hello' && window.__fpV) { d = JSON.parse(JSON.stringify(d)); d.v = window.__fpV[d.g || 'pk']; } bc.postMessage({ k: 'data', cid: this.cid, side: this.side === 'a' ? 'b' : 'a', d: JSON.parse(JSON.stringify(d)) }); };
  Conn.prototype.close = function () { if (this._closed) return; this._closed = true; this.open = false; bc.postMessage({ k: 'close', cid: this.cid, side: this.side === 'a' ? 'b' : 'a' }); var s = this; setTimeout(function () { s._e('close'); }, 0); };
  function Peer(id) {
    Em.call(this); var self = this; this.id = id || rnd(); this.destroyed = false; this.disconnected = false;
    setTimeout(function () { peers[self.id] = self; self._e('open', self.id); }, 120);
  }
  Peer.prototype = Object.create(Em.prototype);
  Peer.prototype.connect = function (rid) {
    var cid = rnd(), c = new Conn(rid, cid, 'a', this); conns[cid + 'a'] = c; var self = this;
    pend[cid] = setTimeout(function () { delete pend[cid]; self._e('error', { type: 'peer-unavailable' }); }, 1500);
    setTimeout(function () { bc.postMessage({ k: 'conn', to: rid, from: self.id, cid: cid }); }, 30);
    return c;
  };
  Peer.prototype.destroy = function () { this.destroyed = true; delete peers[this.id]; var self = this; Object.keys(conns).forEach(function (k) { if (conns[k].own === self) conns[k].close(); }); };
  Peer.prototype.reconnect = function () {};
  window.__fpIn = function (m) {
    if (m.k === 'conn') {
      var p = peers[m.to]; if (!p) return;
      var c = new Conn(m.from, m.cid, 'b', p); conns[m.cid + 'b'] = c;
      p._e('connection', c);
      bc.postMessage({ k: 'ack', cid: m.cid });
      setTimeout(function () { c.open = true; c._e('open'); }, 20);
    } else if (m.k === 'ack') {
      var a = conns[m.cid + 'a']; if (!a) return;
      clearTimeout(pend[m.cid]); delete pend[m.cid];
      setTimeout(function () { a.open = true; a._e('open'); (a._q || []).splice(0).forEach(function (x) { a._e('data', x); }); }, 40);
    } else if (m.k === 'data') {
      var d = conns[m.cid + m.side]; if (d && d.open) d._e('data', m.d); else if (d && !d._closed) (d._q || (d._q = [])).push(m.d);   // wie WebRTC: kommt erst nach dem Oeffnen an
    } else if (m.k === 'close') {
      var x = conns[m.cid + m.side]; if (x && !x._closed) { x._closed = true; x.open = false; x._e('close'); }
    }
  };
  window.Peer = Peer; window.__fpPeers = peers; window.__fpConns = conns;
})();
