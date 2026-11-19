/* Sauvegarde locale (localStorage, avec repli mémoire). Portable Capacitor/Electron. */
(function () {
  'use strict';
  var KEY = 'ascension.save.v1';
  var DEFAULT = { unlocked: 1, completed: {}, hintsSeen: {}, sound: true, current: 1, character: null,
    music: true, musicVol: 0.6, sfxVol: 1, vibrate: true, padRumble: true, padLevel: 2, stars: {}, found: {}, bottlesFound: {}, trainSeen: false, paraSeen: false, world: 1, ghosts: {}, trailCelebrated: false, charsUnlockedSeen: false, basqueCharsUnlockedSeen: false, juraV14: false, invFilter: 'all', lowFx: false };
  var mem = null;
  var persistOk = true, persistFailCb = null, persistOkCb = null;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function notifyPersist(ok) {
    if (ok) { if (persistOkCb) { persistOkCb(); } }
    else if (persistFailCb) { persistFailCb(); }
  }
  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = mem; }
    var d = clone(DEFAULT);
    if (raw) {
      try {
        var p = JSON.parse(raw), s = sanitize(p);
        if (s) { d = s; }
      } catch (e) {}
    }
    return d;
  }
  function write(d) {
    var s = JSON.stringify(d);
    try {
      window.localStorage.setItem(KEY, s);
      mem = s;
      if (!persistOk) { persistOk = true; notifyPersist(true); }
    } catch (e) {
      mem = s;
      if (persistOk) { persistOk = false; notifyPersist(false); }
    }
  }
  var data = null;

  /* v0.14.0 : Pic de l'Aigle et Crêt Pela retirés ; Mont d'Or, Creux du Van, Grand Colombier
     insérés ; Dôle → Reculet / Neige décalés 17–20 → 18–21. Les étoiles et records des
     niveaux encore présents sont conservés ; ceux des niveaux supprimés sont abandonnés.
     L'avancement est recalculé pour que les nouveaux sommets soient joués (pas sautés). */
  function remapNumMap(src, map, drop) {
    var out = {}, k, n, dest;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return src || {}; }
    for (k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) { continue; }
      n = +k;
      if (drop[n]) { continue; }
      dest = (map[n] != null) ? map[n] : n;
      out[dest] = src[k];
    }
    return out;
  }
  function migrateJuraV14(d) {
    if (!d || d.juraV14) { return d; }
    var map = { 17: 18, 18: 19, 19: 20, 20: 21 }, drop = { 15: 1, 16: 1 };
    d.completed = remapNumMap(d.completed, map, drop);
    d.stars = remapNumMap(d.stars, map, drop);
    d.found = remapNumMap(d.found, map, drop);
    d.bottlesFound = remapNumMap(d.bottlesFound, map, drop);
    d.ghosts = remapNumMap(d.ghosts, map, drop);
    var u = +d.unlocked || 1, i, first, has14;
    has14 = !!(d.completed && (d.completed[14] || d.completed['14']));
    if (u >= 15) {
      first = has14 ? 15 : Math.min(u, 14);
      if (has14) {
        first = 22;
        for (i = 15; i <= 21; i++) {
          if (!(d.completed[i] || d.completed[String(i)])) { first = i; break; }
        }
      }
      d.unlocked = first;
    }
    var cur = +d.current || 1;
    if (drop[cur]) { d.current = 15; }
    else if (map[cur]) { d.current = map[cur]; }
    if (d.unlocked === 15 && d.current > 17) { d.current = 15; }
    d.juraV14 = true;
    return d;
  }

  /* ---- export / import de la sauvegarde (fichier .json ou code à copier) ---- */
  var CHARS = ['boy', 'girl', 'girl2', 'boy2', 'boy3', 'girl3'], HEAVY = ['track', 'hitsAt', 'findsAt', 'bottlesAt', 'cpsAt'];
  function crc(str) { var h = 0x811c9dc5, i; for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('00000000' + h.toString(16)).slice(-8); }
  function b64enc(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64dec(b) { b = b.replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) { b += '='; } return decodeURIComponent(escape(atob(b))); }
  function stripped() { var d = clone(data); if (d.completed) { for (var n in d.completed) { HEAVY.forEach(function (k) { delete d.completed[n][k]; }); } } return d; }
  /* nettoie un objet importé : seules les clés connues, avec le bon type */
  function sanitize(src) {
    var out = clone(DEFAULT), k;
    if (!src || typeof src !== 'object') { return null; }
    for (k in DEFAULT) {
      if (!(k in src)) { continue; }
      var dv = DEFAULT[k], v = src[k];
      if (k === 'character') { out[k] = CHARS.indexOf(v) >= 0 ? v : null; }
      else if (typeof dv === 'number') { if (typeof v === 'number' && isFinite(v)) { out[k] = v; } }
      else if (typeof dv === 'boolean') { if (typeof v === 'boolean') { out[k] = v; } }
      else if (typeof dv === 'object') { if (v && typeof v === 'object' && !Array.isArray(v)) { out[k] = v; } }
    }
    out.unlocked = Math.max(1, Math.min(21, Math.round(out.unlocked))); out.current = Math.max(1, Math.min(21, Math.round(out.current)));
    out.world = Math.max(1, Math.min(3, Math.round(out.world)));
    out.padLevel = Math.max(1, Math.min(3, Math.round(out.padLevel))); out.musicVol = Math.max(0, Math.min(1, out.musicVol)); out.sfxVol = Math.max(0, Math.min(1, out.sfxVol == null ? 1 : out.sfxVol));
    out.completed = sanitizeCompleted(src.completed); out.stars = sanitizeStars(src.stars);
    out.found = sanitizeFound(src.found); out.bottlesFound = sanitizeBottles(src.bottlesFound);
    out.hintsSeen = sanitizeHintMap(src.hintsSeen);
    out.ghosts = sanitizeGhosts(src.ghosts); out.trailCelebrated = src.trailCelebrated === true; out.charsUnlockedSeen = src.charsUnlockedSeen === true; out.basqueCharsUnlockedSeen = src.basqueCharsUnlockedSeen === true;
    out.invFilter = (src.invFilter === '1' || src.invFilter === '2' || src.invFilter === '3') ? src.invFilter : 'all';
    out.lowFx = src.lowFx === true;
    return out;
  }
  function clampLevelKey(k) {
    var n = +k; return (n >= 1 && n <= 21 && n === (n | 0)) ? n : 0;
  }
  function sanitizeStars(src) {
    var out = {}, k, n, v;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return out; }
    for (k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) { continue; }
      n = clampLevelKey(k); if (!n) { continue; }
      v = +src[k]; if (isFinite(v)) { out[n] = Math.max(0, Math.min(3, Math.round(v))); }
    }
    return out;
  }
  function sanitizeCompleted(src) {
    var out = {}, k, n, v, t;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return out; }
    for (k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) { continue; }
      n = clampLevelKey(k); if (!n) { continue; }
      v = src[k]; if (!v || typeof v !== 'object' || Array.isArray(v)) { continue; }
      t = +v.time; if (!isFinite(t) || t < 0) { continue; }
      out[n] = v;
    }
    return out;
  }
  function sanitizeFound(src) {
    var out = {}, k, n, inner, id, sub;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return out; }
    for (k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) { continue; }
      n = clampLevelKey(k); if (!n) { continue; }
      inner = src[k]; if (!inner || typeof inner !== 'object' || Array.isArray(inner)) { continue; }
      sub = {};
      for (id in inner) { if (Object.prototype.hasOwnProperty.call(inner, id) && inner[id]) { sub[id] = true; } }
      out[n] = sub;
    }
    return out;
  }
  function sanitizeBottles(src) {
    var out = {}, k, n;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return out; }
    for (k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) { continue; }
      n = clampLevelKey(k); if (!n) { continue; }
      if (src[k]) { out[n] = true; }
    }
    return out;
  }
  function sanitizeHintMap(src) {
    var out = {}, k;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return out; }
    for (k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k)) { continue; }
      if (src[k]) { out[String(k)] = true; }
    }
    return out;
  }
  function summary(d) {
    var st = 0, n = 0, f = 0, k, j;
    for (k in (d.stars || {})) { st += +d.stars[k] || 0; } for (k in (d.completed || {})) { n++; }
    for (k in (d.found || {})) { for (j in d.found[k]) { if (d.found[k][j]) { f++; } } }
    return { levels: n, stars: st, finds: f, unlocked: d.unlocked, character: d.character };
  }
  function parseAny(text) {
    text = String(text || '').trim(); if (!text) { throw new Error('vide'); }
    var obj;
    if (text.charAt(0) === '{') { obj = JSON.parse(text); }
    else {
      var m = text.replace(/\s+/g, '').match(/^ASC1-([A-Za-z0-9_-]+)-([0-9a-f]{8})$/);
      if (!m) { throw new Error('format'); }
      var json;
      try { json = b64dec(m[1]); } catch (eDec) { throw new Error('crc'); }
      if (crc(json) !== m[2]) { throw new Error('crc'); }
      try { obj = JSON.parse(json); } catch (eJs) { throw new Error('crc'); }
    }
    if (!obj || obj.game !== 'ascension' || !obj.data) { throw new Error('jeu'); }
    var d = sanitize(obj.data); if (!d) { throw new Error('data'); }
    return { data: d, version: obj.version || '?', at: obj.exportedAt || null };
  }

  /* ---------- v0.6.0 : Mode Trail — fantômes compactés (meilleur temps par niveau) ---------- */
  var GHOST_DT = 0.08, GHOST_MAXN = 3600, GHOST_MAXB = 48000;   // ~5 min à 12,5 échantillons/s, ~48 Ko max par niveau
  function b64bin(u8) { var s = '', i; for (i = 0; i < u8.length; i++) { s += String.fromCharCode(u8[i]); } return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64binDec(b) { b = String(b || '').replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) { b += '='; } var s = atob(b), u = new Uint8Array(s.length), i; for (i = 0; i < s.length; i++) { u[i] = s.charCodeAt(i); } return u; }
  function lerpPt(a, b, t) {
    if (!b || t <= 0) { return a; } if (t >= 1) { return b; }
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, face: t < 0.5 ? a.face : b.face, air: t < 0.5 ? a.air : b.air, move: a.move + (b.move - a.move) * t, vy: a.vy + (b.vy - a.vy) * t };
  }
  function atSamples(samples, t) {
    var n = samples.length; if (!n) { return null; }
    if (t <= samples[0].t) { return samples[0]; } if (t >= samples[n - 1].t) { return samples[n - 1]; }
    var lo = 0, hi = n - 1, mid;
    while (hi - lo > 1) { mid = (lo + hi) >> 1; if (samples[mid].t <= t) { lo = mid; } else { hi = mid; } }
    var a = samples[lo], b = samples[hi], span = b.t - a.t; return lerpPt(a, b, span > 0 ? (t - a.t) / span : 0);
  }
  function packGhost(rec) {
    if (!rec || !rec.samples || rec.samples.length < 2) { return null; }
    var tEnd = Math.max(0.2, +rec.t || rec.samples[rec.samples.length - 1].t), dt = GHOST_DT, n = Math.round(tEnd / dt) + 1;
    if (n > GHOST_MAXN) { n = GHOST_MAXN; dt = tEnd / (n - 1); }
    var buf = new Uint8Array(6 + n * 6), v = new DataView(buf.buffer), i, p, x, y, fl, vy;
    v.setUint8(0, 1); v.setUint8(1, Math.max(0, CHARS.indexOf(rec.c))); v.setUint16(2, Math.round(dt * 1000), true); v.setUint16(4, n, true);
    for (i = 0; i < n; i++) {
      p = atSamples(rec.samples, Math.min(tEnd, i * dt)); if (!p) { p = rec.samples[0]; }
      x = Math.max(0, Math.min(65535, Math.round(p.x))); y = Math.max(-32768, Math.min(32767, Math.round(p.y * 10)));
      fl = (p.face >= 0 ? 1 : 0) | (p.air ? 2 : 0) | ((Math.max(0, Math.min(15, Math.round((p.move || 0) * 15)))) << 2);
      vy = Math.max(-128, Math.min(127, Math.round((p.vy || 0) / 8)));
      v.setUint16(6 + i * 6, x, true); v.setInt16(6 + i * 6 + 2, y, true); v.setUint8(6 + i * 6 + 4, fl); v.setInt8(6 + i * 6 + 5, vy);
    }
    var d = b64bin(buf); if (d.length > GHOST_MAXB) { return null; }
    return { t: Math.round(tEnd * 100) / 100, c: rec.c || 'boy', d: d };
  }
  function unpackGhost(g) {
    if (!g) { return null; }
    if (g.pts && g.pts.length) { return g; }   // déjà dépaqueté
    if (!g.d || typeof g.d !== 'string') { return null; }
    try {
      var u = b64binDec(g.d), v = new DataView(u.buffer, u.byteOffset, u.byteLength);
      if (u.length < 12 || v.getUint8(0) !== 1) { return null; }
      var ci = v.getUint8(1), dt = v.getUint16(2, true) / 1000, n = v.getUint16(4, true);
      if (!(dt > 0) || n < 2 || u.length < 6 + n * 6) { return null; }
      var pts = [], i, off, fl, maxX = 0, reach = [];
      for (i = 0; i < n; i++) {
        off = 6 + i * 6; fl = v.getUint8(off + 4);
        var p = { t: i * dt, x: v.getUint16(off, true), y: v.getInt16(off + 2, true) / 10, face: (fl & 1) ? 1 : -1, air: !!(fl & 2), move: ((fl >> 2) & 15) / 15, vy: v.getInt8(off + 5) * 8 };
        pts.push(p); if (p.x > maxX) { maxX = p.x; } reach.push(maxX);
      }
      var tEnd = Math.max(+g.t || 0, pts[n - 1].t);
      return { t: tEnd, c: CHARS[ci] || g.c || 'boy', dt: dt, pts: pts, reach: reach, maxX: maxX };
    } catch (e) { return null; }
  }
  function fromTrack(c, ch) {
    if (!c || !c.track || c.track.length < 3) { return null; }
    var samples = [], i, q;
    for (i = 0; i < c.track.length; i++) { q = c.track[i]; if (q && q.length >= 3) { samples.push({ t: +q[2] || 0, x: +q[0] || 0, y: +q[1] || 0, face: 1, air: 0, move: 0.7, vy: 0 }); } }
    if (samples.length < 2) { return null; }
    var rec = { t: +c.time || samples[samples.length - 1].t, c: CHARS.indexOf(ch) >= 0 ? ch : 'boy', samples: samples };
    return unpackGhost(packGhost(rec));
  }
  function sampleGhost(g, t) {
    g = unpackGhost(g); if (!g) { return null; }
    var pts = g.pts, n = pts.length; if (!n) { return null; }
    if (t <= 0) { return pts[0]; } if (t >= g.t || t >= pts[n - 1].t) { return pts[n - 1]; }
    var lo = 0, hi = n - 1, mid;
    while (hi - lo > 1) { mid = (lo + hi) >> 1; if (pts[mid].t <= t) { lo = mid; } else { hi = mid; } }
    var a = pts[lo], b = pts[hi], span = b.t - a.t, p = lerpPt(a, b, span > 0 ? (t - a.t) / span : 0);
    p.t = t; p.done = false; return p;
  }
  function timeToReach(g, x) {
    g = unpackGhost(g); if (!g || !g.reach) { return null; }
    var r = g.reach, n = r.length; if (x <= r[0]) { return 0; } if (x > r[n - 1]) { return null; }
    var lo = 0, hi = n - 1, mid;
    while (hi - lo > 1) { mid = (lo + hi) >> 1; if (r[mid] < x) { lo = mid; } else { hi = mid; } }
    var x0 = r[lo], x1 = r[hi], t0 = g.pts[lo].t, t1 = g.pts[hi].t, u = x1 > x0 ? (x - x0) / (x1 - x0) : 0;
    return t0 + (t1 - t0) * u;
  }
  function sanitizeGhosts(src) {
    var out = {}, k, g, n, t, d, c;
    if (!src || typeof src !== 'object' || Array.isArray(src)) { return out; }
    for (k in src) {
      if (!src.hasOwnProperty(k)) { continue; }
      n = +k; if (!(n >= 1 && n <= 21) || n !== (n | 0)) { continue; }
      g = src[k]; if (!g || typeof g !== 'object') { continue; }
      t = +g.t; d = g.d; c = g.c;
      if (!(t > 0 && t < 86400) || typeof d !== 'string' || d.length < 16 || d.length > GHOST_MAXB) { continue; }
      if (CHARS.indexOf(c) < 0) { c = 'boy'; }
      if (unpackGhost({ t: t, c: c, d: d })) { out[n] = { t: Math.round(t * 100) / 100, c: c, d: d }; }
    }
    return out;
  }
  data = load();
  migrateJuraV14(data);
  write(data);

  function trailCount() { var n = 0, i; for (i = 1; i <= 6; i++) { if (((data.stars && data.stars[i]) || 0) >= 3) { n++; } } return n; }
  function trailUnlocked() { return !!(data.completed && data.completed[6]) && trailCount() >= 6; }

  function charsUnlocked() { return !!(data.completed && data.completed[3]); }
  function basqueCharsUnlocked() { return !!(data.completed && data.completed[9]); }
  function charOpen(c) {
    if (c === 'girl2' || c === 'boy2') {
      if (charsUnlocked()) { return true; }
      /* v0.7.0 : une sauvegarde déjà équipée d'un costume trail le garde, même sans le puy Mary ;
         l'autre costume trail reste verrouillé jusqu'au niveau 3. */
      return data.character === c;
    }
    if (c === 'girl3' || c === 'boy3') {
      if (basqueCharsUnlocked()) { return true; }
      return data.character === c;
    }
    return true;
  }
  function charLockHint(c) {
    if (c === 'girl2' || c === 'boy2') { return 'Débloqué après le puy de Mary'; }
    if (c === 'girl3' || c === 'boy3') { return 'Débloqué après le Pic d’Orhy'; }
    return '';
  }

  window.Save = {
    persistOk: function () { return persistOk; },
    onPersistFail: function (f) { persistFailCb = f; },
    onPersistOk: function (f) { persistOkCb = f; },
    retryPersist: function () { write(data); return persistOk; },
    exportFile: function () { return JSON.stringify({ game: 'ascension', version: (window.AscensionData && AscensionData.VERSION) || '', exportedAt: new Date().toISOString(), data: data }, null, 1); },
    exportCode: function () { var json = JSON.stringify({ game: 'ascension', version: (window.AscensionData && AscensionData.VERSION) || '', data: stripped() }); return 'ASC1-' + b64enc(json) + '-' + crc(json); },
    parse: parseAny, summary: summary,
    applyImport: function (parsed) { data = migrateJuraV14(parsed.data); write(data); return data; },
    get: function () { return data; },
    commit: function () { write(data); },
    reset: function () { data = clone(DEFAULT); write(data); return data; },
    starsOf: function (n) { return (data.stars && data.stars[n]) || 0; },
    foundOf: function (n) { if (!data.found) { data.found = {}; } if (!data.found[n]) { data.found[n] = {}; } return data.found[n]; },
    /* niveau n terminé -> débloque n+1 */
    complete: function (n, stats, stars) {
      var prev = data.completed[n];
      if (!prev || stats.time < prev.time) { data.completed[n] = stats; }
      if (!data.stars) { data.stars = {}; }
      if (stars && (!data.stars[n] || stars > data.stars[n])) { data.stars[n] = stars; }
      if (data.unlocked < n + 1) { data.unlocked = n + 1; }
      data.current = n + 1;
      write(data);
    },
    /* v0.6.0 Mode Trail */
    trailCount: trailCount, trailNeed: function () { return 6; }, trailUnlocked: trailUnlocked,
    trailCelebrated: function () { return !!data.trailCelebrated; },
    invFilter: function () { var v = data.invFilter; return (v === '1' || v === '2' || v === '3') ? v : 'all'; },
    setInvFilter: function (v) { data.invFilter = (v === '1' || v === '2' || v === '3') ? v : 'all'; write(data); return data.invFilter; },
    markTrailCelebrated: function () { data.trailCelebrated = true; write(data); },
    charsUnlocked: charsUnlocked, basqueCharsUnlocked: basqueCharsUnlocked, charOpen: charOpen, charLockHint: charLockHint,
    charsCelebrated: function () { return !!data.charsUnlockedSeen; },
    markCharsCelebrated: function () { data.charsUnlockedSeen = true; write(data); },
    basqueCharsCelebrated: function () { return !!data.basqueCharsUnlockedSeen; },
    markBasqueCharsCelebrated: function () { data.basqueCharsUnlockedSeen = true; write(data); },
    ghostOf: function (n) {
      if (!data.ghosts) { data.ghosts = {}; }
      var g = unpackGhost(data.ghosts[n]); if (g) { return g; }
      var c = data.completed && data.completed[n];
      return fromTrack(c, data.character);
    },
    ghostPacked: function (n) { return data.ghosts && data.ghosts[n] ? data.ghosts[n] : null; },
    hasGhost: function (n) { return !!this.ghostOf(n); },
    packGhost: packGhost, unpackGhost: unpackGhost, sampleGhost: sampleGhost, timeToReach: timeToReach,
    saveGhost: function (n, rec) {
      if (!data.ghosts) { data.ghosts = {}; }
      var packed = rec && rec.d ? rec : packGhost(rec); if (!packed) { return false; }
      data.ghosts[n] = packed; write(data); return true;
    },
    maybeSaveGhost: function (n, rec) {
      if (!rec) { return false; }
      var cur = this.ghostOf(n), t = +rec.t, best = cur ? cur.t : (data.completed && data.completed[n] && data.completed[n].time);
      if (best != null && t > best + 0.001) { return false; }
      return this.saveGhost(n, rec);
    }
  };
})();
