/* v0.5.1 — Voyage en train : le Panoramique des Dômes descend du Puy de Dôme, traverse la Chaîne des Puys puis le Pays basque jusqu'à l'écran « Niveau 7 — bientôt ».
   Fluidité : tous les décors sont pré-rendus UNE fois dans des canvas hors écran (tuiles bouclées) ; à chaque image on ne fait que des drawImage décalés
   (parallaxe), sans création d'objet, de dégradé ni de chaîne. Le train, les voyageurs et les décors de gare sont des sprites pré-calculés. */
(function () {
  'use strict';
  var A = window.Art, GA = window.GareArt, TAU = Math.PI * 2;
  var DUR = 33, DEPART = 7.6, ACC_END = 13.4, DECEL0 = 26.5, DECEL1 = 31.3, MIST0 = 19.5, MIST1 = 25.5, IMG0 = 29.4, IMG1 = 32.6, VMAX = 150;
  var IMG_W = 2752, IMG_H = 1536;

  /* ---------- utilitaires ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sst(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rngf(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  /* ---------- v0.5.4 : qualité adaptative / garde-fous mémoire (WebView Android fragiles : Honor, Huawei…) ----------
     Niveau 0 = rendu d'origine (identique sur les appareils capables). Niveaux 1-3 : résolution de rendu et taille des canevas hors écran réduites.
     Le niveau ne descend que si le rendu échoue ou rame ; il est mémorisé (clé séparée de la sauvegarde) pour les voyages suivants. */
  var QL = [{ dpr: 1.75, dim: 4096, pix: 8e6, tot: 24e6 }, { dpr: 1.3, dim: 3072, pix: 5e6, tot: 12e6 }, { dpr: 1.0, dim: 2048, pix: 3e6, tot: 7e6 }, { dpr: 0.75, dim: 1536, pix: 2e6, tot: 4e6 }];
  var lvl = 0, bpix = 0, lostFlag = false, hook = null, wdTimer = 0;
  function loadLvl() {
    var v = -1; try { v = parseInt(window.localStorage.getItem('ascension.cineq'), 10); } catch (e) {}
    if (!(v >= 0 && v <= 3)) {
      v = 0; var nv = window.navigator || {};
      if (nv.deviceMemory && nv.deviceMemory <= 2) { v = 2; } else if ((nv.deviceMemory && nv.deviceMemory <= 3) || (nv.hardwareConcurrency && nv.hardwareConcurrency <= 3)) { v = 1; }
    }
    return v;
  }
  function saveLvl() { try { window.localStorage.setItem('ascension.cineq', String(lvl)); } catch (e) {} }
  function warn(m, e) { try { console.warn('[cine] ' + m + (e ? ' : ' + (e.message || e) : '')); } catch (x) {} }
  function fitS(w, h, s) { var q = QL[lvl]; return Math.min(s, q.dim / w, q.dim / h, Math.sqrt(q.pix / (w * h))); }   // plafonne l'échelle d'un canevas (identique à l'original sous les plafonds)
  function onLost() { lostFlag = true; }
  function cv(w, h) {
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); bpix += c.width * c.height;
    if (c.addEventListener) { c.addEventListener('contextlost', onLost); }
    return c;
  }
  function ctx2d(c) { var x = c.getContext('2d'); if (!x) { throw new Error('canvas 2d indisponible'); } return x; }
  function gradv(c, y0, y1, stops) { var g = c.createLinearGradient(0, y0, 0, y1); for (var i = 0; i < stops.length; i += 2) { g.addColorStop(stops[i], stops[i + 1]); } return g; }
  function ridgeFn(Tw, seed, terms) { var r = rngf(seed), ph = terms.map(function () { return r() * TAU; }); return function (x) { var v = 0; for (var i = 0; i < terms.length; i++) { v += terms[i][1] * Math.sin(TAU * terms[i][0] * x / Tw + ph[i]); } return v; }; }
  function fillRidge(c, Tw, th, fn, top, style) { c.beginPath(); c.moveTo(-2, th + 2); for (var x = -2; x <= Tw + 2; x += 3) { c.lineTo(x, top + fn(x)); } c.lineTo(Tw + 2, th + 2); c.closePath(); c.fillStyle = style; c.fill(); }
  function wrap(Tw, x, hw, fn) { for (var k = -1; k <= 1; k++) { var xx = x + k * Tw; if (xx + hw > -4 && xx - hw < Tw + 4) { fn(xx); } } }

  var G = { W: 0, H: 0, d: 1, s: 1, k: 1, Vw: 0, Vh: 0, rs: 1, Zt: 1.3, railsY: 0, xm: 0 };
  var L = null, built = false, img = null, imgReady = false, imgLoading = false, st = null, mode = 'off';
  var XT = null, YT = null, XN = 0;               // table temps → distance parcourue / descente (intégrées une fois)
  var chosen = 'boy', order = ['boy', 'girl', 'girl2', 'boy2'], hk = [], seatT = [0, 0, 0, 0];
  var onEndCb = null, blk = 0;

  /* ---------- chronologie : vitesse, pente, mélange des régions ---------- */
  function speedAt(t) {
    if (t < DEPART) { return 0; }
    if (t < ACC_END) { return VMAX * sst(0, 1, (t - DEPART) / (ACC_END - DEPART)); }
    if (t < DECEL0) { return VMAX; }
    if (t < DECEL1) { return VMAX * (1 - sst(0, 1, (t - DECEL0) / (DECEL1 - DECEL0))); }
    return 0;
  }
  function slopeAt(t) { return 0.13 * sst(DEPART - 0.6, DEPART + 3.2, t) * (1 - 0.7 * sst(MIST0, MIST1 + 1, t)) * (1 - sst(DECEL0 + 0.5, DECEL1, t)); }
  function tables() {
    var n = Math.round(DUR * 120) + 2, i, x = 0, y = 0; XT = new Float32Array(n); YT = new Float32Array(n);
    for (i = 0; i < n; i++) { var t = i / 120; XT[i] = x; YT[i] = y; var v = speedAt(t); x += v / 120; y += v * slopeAt(t) * 0.5 / 120; }
    XN = n;
  }
  function tab(T, t) { var f = clamp(t, 0, DUR) * 120, i = f | 0, a = f - i; return T[i] + (T[Math.min(i + 1, XN - 1)] - T[i]) * a; }

  /* =====================================================================  FABRIQUES DE DÉCORS  ===================================================================== */
  function tile(Tw, th, rsx, fn, seed) {
    rsx = fitS(Tw, th, rsx); var c = cv(Tw * rsx, th * rsx), x = ctx2d(c); x.scale(rsx, rsx); fn(x, rngf(seed || 1)); return { cv: c, w: Tw, h: th };
  }

  /* --- puy : cône ou dôme volcanique avec cratère ; profil y(u) pour u∈[-1,1] --- */
  function puyProfile(u, h, o) {
    var a = Math.abs(u), y;
    if (o.kind === 'dome') { y = h * (1 - Math.pow(a, 2.1)); }
    else { y = h * Math.pow(Math.max(0, 1 - a), 0.82); }
    if (o.cw && a < o.cw) {
      var q = a / o.cw, dep = o.cd * h, rim = 1 - q * q;
      if (o.breach && u > 0) { dep *= 0.35 + 0.65 * (1 - u / o.cw); }
      y = Math.min(y, h) - dep * rim;
      if (o.cw2 && a < o.cw2) { y -= 0.04 * h * (1 - a / o.cw2); }
    }
    return y;
  }
  function puy(c, rnd, x, base, w, h, o) {
    var hw = w / 2, N = 48, i, pts = [];
    for (i = 0; i <= N; i++) { var u = -1 + 2 * i / N; pts.push([x + u * hw, base - puyProfile(u, h, o)]); }
    c.save(); c.beginPath(); c.moveTo(x - hw - 4, base + 2); for (i = 0; i <= N; i++) { c.lineTo(pts[i][0], pts[i][1]); } c.lineTo(x + hw + 4, base + 2); c.closePath();
    c.fillStyle = gradv(c, base - h, base, [0, o.c0, 0.45, o.c1, 1, o.c2]); c.fill(); c.clip();
    // ombre côté droit (soleil à gauche) + éclairage doux côté gauche
    c.beginPath(); c.moveTo(x + hw * 0.02, base - h); for (i = Math.round(N / 2); i <= N; i++) { c.lineTo(pts[i][0], pts[i][1]); } c.lineTo(x + hw + 4, base + 2); c.lineTo(x + hw * 0.1, base + 2); c.closePath(); c.fillStyle = 'rgba(14,26,34,.24)'; c.fill();
    c.beginPath(); c.moveTo(x - hw - 4, base + 2); for (i = 0; i <= Math.round(N * 0.45); i++) { c.lineTo(pts[i][0], pts[i][1]); } c.lineTo(x - hw * 0.1, base + 2); c.closePath(); c.fillStyle = 'rgba(255,248,214,.10)'; c.fill();
    // forêt (taches sombres/claires) ; plus clairsemée près du sommet (pelouse)
    var cnt = Math.round(w * h / 38), j;
    for (j = 0; j < cnt; j++) {
      var uu = rnd() * 2 - 1, yy = rnd(), top = puyProfile(uu, h, o), py = base - yy * top; if (yy > 0.97) { continue; }
      var f = yy; if (o.forest != null && f > o.forest) { continue; }
      c.fillStyle = rnd() < 0.5 ? o.d1 : o.d2; c.globalAlpha = 0.5 + 0.4 * rnd(); c.beginPath(); c.arc(x + uu * hw, py, 0.9 + rnd() * 1.5, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
    // cratère : parois de scories rouges-brunes
    if (o.cw) {
      c.beginPath(); var a0 = Math.round(N * (0.5 - o.cw / 2)), a1 = Math.round(N * (0.5 + o.cw / 2));
      c.moveTo(pts[a0][0], pts[a0][1]); for (i = a0; i <= a1; i++) { c.lineTo(pts[i][0], pts[i][1]); } c.lineTo(pts[a1][0], pts[a1][1] + h * 0.1); c.lineTo(pts[a0][0], pts[a0][1] + h * 0.1); c.closePath();
      c.fillStyle = o.scor || 'rgba(120,64,48,.55)'; c.fill();
      c.beginPath(); c.moveTo(pts[a0][0], pts[a0][1]); for (i = a0; i <= a1; i++) { c.lineTo(pts[i][0], pts[i][1]); } c.strokeStyle = 'rgba(255,236,200,.35)'; c.lineWidth = 0.9; c.stroke();
    }
    c.restore();
    // liseré de crête
    c.beginPath(); for (i = 0; i <= N; i++) { if (i) { c.lineTo(pts[i][0], pts[i][1]); } else { c.moveTo(pts[i][0], pts[i][1]); } } c.strokeStyle = 'rgba(20,34,40,.35)'; c.lineWidth = 0.6; c.stroke();
    return pts;
  }
  function mast(c, x, base, h, w) {   // antenne de télédiffusion du Puy de Dôme : pylône à treillis rouge et blanc
    var seg = 6, i, hw = w / 2, y = base;
    c.fillStyle = '#f3f1ea'; c.fillRect(x - 0.7, base - h, 1.4, h);
    for (i = 0; i < seg; i++) {
      var y0 = base - h * i / seg, y1 = base - h * (i + 1) / seg, wi = hw * (1 - i / seg * 0.65);
      c.fillStyle = i % 2 ? '#f3f1ea' : '#d2362b'; c.fillRect(x - wi * 0.5, y1, wi, y0 - y1);
      c.strokeStyle = i % 2 ? '#d2362b' : '#f3f1ea'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(x - wi * 0.5, y0); c.lineTo(x + wi * 0.5, y1); c.moveTo(x + wi * 0.5, y0); c.lineTo(x - wi * 0.5, y1); c.stroke();
    }
    c.fillStyle = '#d2362b'; c.fillRect(x - 0.45, base - h - 7, 0.9, 7); c.fillStyle = '#ff5a4a'; c.fillRect(x - 1, base - h - 8, 2, 1.4);
    c.fillStyle = '#c9ced6'; c.fillRect(x - hw * 0.9, base - h * 0.62, hw * 1.8, 1.2); c.fillRect(x - hw * 0.5, base - h * 0.86, hw, 1);
    return y;
  }

  function makeFarV(rs) {   // chaînon lointain du Massif central + plaine de la Limagne en damier
    var Tw = 900, th = 120;
    return tile(Tw, th, rs, function (c, r) {
      var f1 = ridgeFn(Tw, 3, [[2, 14], [3, 9], [5, 5], [9, 2.4]]), f2 = ridgeFn(Tw, 8, [[2, 9], [4, 6], [7, 3], [11, 1.4]]);
      fillRidge(c, Tw, th, f1, 46, gradv(c, 20, th, [0, '#b8c6d6', 1, '#d3dde6']));
      fillRidge(c, Tw, th, f2, 74, gradv(c, 50, th, [0, '#9fb3c4', 1, '#c4d2dc']));
      // plaine de la Limagne : damier de champs pâles
      c.fillStyle = '#d6dcb0'; c.fillRect(0, 100, Tw, 22);
      for (var i = 0; i < 70; i++) { var fx = r() * Tw, fw = 14 + r() * 30; c.fillStyle = r() < 0.4 ? '#c8d29a' : r() < 0.6 ? '#e3dba4' : '#b6c48c'; c.globalAlpha = 0.7; c.fillRect(fx, 100 + r() * 14, fw, 4 + r() * 8); }
      c.globalAlpha = 1; c.fillStyle = 'rgba(224,230,236,.4)'; c.fillRect(0, 92, Tw, 30);
    }, 11);
  }
  function makeMidV(rs) {   // la Chaîne des Puys : cônes alignés, cratères, Puy de Dôme et son antenne
    var Tw = 1300, th = 210, base = th - 4;
    var K = { forest: 1, d1: '#2a4f37', d2: '#5f8a4e' };
    return tile(Tw, th, rs, function (c, r) {
      var defs = [
        // [x, largeur, hauteur, options]
        [90, 190, 92, { kind: 'dome', c0: '#cfcabb', c1: '#a6a58f', c2: '#6c8a62', d1: '#4d7050', d2: '#8c9a72', forest: 0.35 }],                              // Grand Sarcoui (dôme clair)
        [330, 330, 128, { kind: 'dome', c0: '#a6b573', c1: '#5f8a4e', c2: '#2c5236', d1: '#2a4f37', d2: '#7fa05a', forest: 0.72 }],                           // Puy de Dôme
        [575, 130, 70, { kind: 'cone', cw: 0.2, cd: 0.28, breach: false, c0: '#8c9c62', c1: '#4f7a46', c2: '#2c5236', d1: '#2a4f37', d2: '#6f9650', forest: 0.8 }],  // Petit Puy de Dôme
        [800, 210, 96, { kind: 'cone', cw: 0.3, cd: 0.34, cw2: 0.14, c0: '#9b8a55', c1: '#4f7a46', c2: '#2c5236', d1: '#2a4f37', d2: '#6f9650', forest: 0.7 }], // Puy de Pariou (cratères emboîtés)
        [1010, 190, 100, { kind: 'cone', cw: 0.26, cd: 0.3, breach: true, c0: '#8c9858', c1: '#487246', c2: '#274c35', d1: '#244632', d2: '#6a9250', forest: 0.82 }], // Puy de Côme
        [1170, 150, 78, { kind: 'cone', cw: 0.3, cd: 0.3, breach: true, c0: '#a28a58', c1: '#587d48', c2: '#2c5236', d1: '#2a4f37', d2: '#7a9a56', forest: 0.7 }],     // Puy de la Vache
        [1260, 110, 58, { kind: 'cone', cw: 0.34, cd: 0.34, c0: '#a08a58', c1: '#587d48', c2: '#2c5236', d1: '#2a4f37', d2: '#7a9a56', forest: 0.6 }]                // Lassolas
      ];
      defs.forEach(function (d, i) {
        var o = d[3]; o.scor = 'rgba(128,66,46,.6)';
        wrap(Tw, d[0], d[1] / 2 + 6, function (xx) { puy(c, r, xx, base, d[1], d[2], o); if (i === 1) { mast(c, xx - d[1] * 0.1, base - d[2] * 0.97, 54, 7); c.fillStyle = '#c9c6bc'; c.fillRect(xx - d[1] * 0.1 + 5, base - d[2] * 0.97 - 3, 9, 3); c.fillStyle = '#76727a'; c.fillRect(xx - d[1] * 0.1 + 4, base - d[2] * 0.97 - 4.6, 11, 1.6); } });
      });
      c.fillStyle = gradv(c, th - 70, th, [0, 'rgba(206,218,226,0)', 1, 'rgba(206,218,226,.5)']); c.fillRect(0, th - 70, Tw, 70);
    }, 21);
  }
  function makeMid2V(rs) {   // collines boisées et prairies, hameaux de lauze sombre
    var Tw = 1100, th = 110, base = th;
    return tile(Tw, th, rs, function (c, r) {
      var f = ridgeFn(Tw, 5, [[2, 16], [3, 10], [6, 5], [11, 2.2]]), f2 = ridgeFn(Tw, 9, [[3, 8], [5, 5], [8, 3], [14, 1.6]]);
      fillRidge(c, Tw, th, f, 40, gradv(c, 20, th, [0, '#55805a', 1, '#2f5a3e']));
      var i; for (i = 0; i < 380; i++) { var x = r() * Tw, y = 38 + f(x) + r() * 60; if (y > th) { continue; } c.fillStyle = r() < 0.5 ? '#244a34' : '#6f9a58'; c.globalAlpha = 0.55; c.beginPath(); c.arc(x, y, 1.1 + r() * 2.2, 0, TAU); c.fill(); }
      c.globalAlpha = 1; fillRidge(c, Tw, th, f2, 66, gradv(c, 50, th, [0, '#7aa05a', 1, '#3b6a43']));
      // hameaux (toits sombres, murs en pierre de Volvic)
      [140, 470, 760, 980].forEach(function (hx) { var gy = 66 + f2(hx) + 2; wrap(Tw, hx, 16, function (xx) { for (var q = 0; q < 3; q++) { var bx = xx - 8 + q * 7, bw = 5 + (q % 2) * 2; c.fillStyle = '#45403f'; c.fillRect(bx, gy - 4, bw, 4); c.fillStyle = '#2a2b33'; c.beginPath(); c.moveTo(bx - 0.8, gy - 4); c.lineTo(bx + bw / 2, gy - 7); c.lineTo(bx + bw + 0.8, gy - 4); c.closePath(); c.fill(); } }); });
      c.fillStyle = gradv(c, th - 50, th, [0, 'rgba(206,218,226,0)', 1, 'rgba(206,218,226,.3)']); c.fillRect(0, th - 50, Tw, 50);
    }, 31);
  }
  function makeNearV(rs) {   // prairies d'altitude, hêtres et sapins, clôtures, scories
    var Tw = 900, th = 100;
    return tile(Tw, th, rs, function (c, r) {
      var f = ridgeFn(Tw, 7, [[2, 12], [3, 8], [5, 4], [9, 2]]);
      fillRidge(c, Tw, th, f, 36, gradv(c, 20, th, [0, '#8fb25e', 0.5, '#6a9a4c', 1, '#3f6e3c']));
      var i; for (i = 0; i < 120; i++) { var x = r() * Tw; c.fillStyle = r() < 0.5 ? '#4e8040' : '#a9c46a'; c.globalAlpha = 0.5; c.fillRect(x, 40 + f(x) + r() * 50, 3 + r() * 6, 0.9); }
      c.globalAlpha = 1;
      // tache de scories rouges (carrière)
      wrap(Tw, 610, 40, function (xx) { c.beginPath(); c.ellipse(xx, 60 + f(610), 30, 7, 0, 0, TAU); c.fillStyle = 'rgba(138,62,44,.65)'; c.fill(); c.beginPath(); c.ellipse(xx - 4, 58 + f(610), 18, 4, 0, 0, TAU); c.fillStyle = 'rgba(90,40,34,.5)'; c.fill(); });
      // arbres
      var tx = [40, 95, 180, 260, 330, 420, 500, 560, 700, 770, 830, 880];
      tx.forEach(function (x0, q) { var gy = 37 + f(x0) + 14 + (q % 3) * 6, hh = 26 + (q % 4) * 7; wrap(Tw, x0, 20, function (xx) { if (q % 2) { A.beech(c, xx, gy, hh, '#2f5e35', '#6f9a4a'); } else { A.conifer(c, xx, gy, hh * 1.2, '#244632', '#3f6e45'); } }); });
      // clôture de pâturage
      c.strokeStyle = '#6b4a30'; c.lineWidth = 0.7; for (i = 0; i < 9; i++) { var fx = 120 + i * 9; c.beginPath(); c.moveTo(fx, 62 + f(120) + 6); c.lineTo(fx, 62 + f(120) - 1); c.stroke(); } c.beginPath(); c.moveTo(120, 62 + f(120)); c.lineTo(192, 62 + f(120) + 1); c.stroke();
      c.fillStyle = gradv(c, th - 24, th, [0, 'rgba(63,110,60,0)', 1, '#3a6a3a']); c.fillRect(0, th - 24, Tw, 24);
    }, 41);
  }

  /* ----------- Pays basque ----------- */
  function sheep(c, x, y, s, flip, ph) {
    c.save(); c.translate(x, y); c.scale(flip * s, s);
    c.fillStyle = 'rgba(20,50,20,.25)'; c.beginPath(); c.ellipse(0, 0.4, 3.6, 0.8, 0, 0, TAU); c.fill();
    c.strokeStyle = '#2b2623'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-1.6, -1.5); c.lineTo(-1.6, 0); c.moveTo(1.2, -1.5); c.lineTo(1.2, 0); c.stroke();
    c.fillStyle = '#f6f3ea'; c.beginPath(); c.arc(-1.6, -3.1, 1.9, 0, TAU); c.arc(0.4, -3.4, 2.2, 0, TAU); c.arc(2.0, -3.0, 1.8, 0, TAU); c.arc(0.4, -2.2, 1.9, 0, TAU); c.fill();
    c.fillStyle = '#d8d2c4'; c.beginPath(); c.arc(0.6, -2.1, 1.6, 0, TAU); c.fill();
    c.fillStyle = '#2b2623'; c.beginPath(); c.ellipse(3.8, -3.1 + (ph || 0) * 0.3, 1.3, 1.0, 0.3, 0, TAU); c.fill(); c.fillRect(3.1, -4.3, 0.7, 0.9);
    c.restore();
  }
  function pottok(c, x, y, s, flip, col, mane) {
    c.save(); c.translate(x, y); c.scale(flip * s, s);
    c.fillStyle = 'rgba(20,50,20,.28)'; c.beginPath(); c.ellipse(0, 0.5, 6.6, 1.1, 0, 0, TAU); c.fill();
    c.strokeStyle = mane; c.lineWidth = 1.05; c.lineCap = 'round';
    [[-3.6, 0], [-2.2, 0.2], [3.0, 0], [4.2, 0.2]].forEach(function (l) { c.beginPath(); c.moveTo(l[0], -4.6); c.lineTo(l[0] + l[1] * 0.4, 0); c.stroke(); });
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -5.8, 6.2, 3.1, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(3.8, -7.2); c.quadraticCurveTo(6.2, -9.8, 7.4, -10.4); c.lineTo(9.6, -9.0); c.quadraticCurveTo(9.9, -7.8, 8.6, -7.6); c.lineTo(7.2, -7.2); c.quadraticCurveTo(6.4, -5.8, 4.8, -4.6); c.closePath(); c.fill();
    c.fillStyle = mane; c.beginPath(); c.moveTo(7.2, -10.6); c.lineTo(7.4, -11.9); c.lineTo(8.1, -10.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(3.2, -8.6); c.quadraticCurveTo(5.0, -11.6, 7.2, -10.6); c.lineTo(6.2, -8.8); c.quadraticCurveTo(4.6, -8.4, 3.6, -7.4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-5.6, -7.4); c.quadraticCurveTo(-8.8, -6.6, -8.0, -2.8); c.lineTo(-7.0, -3.4); c.quadraticCurveTo(-7.3, -5.8, -5.0, -6.2); c.closePath(); c.fill();
    c.fillStyle = '#0d0a0a'; c.fillRect(8.8, -9.4, 0.7, 0.7);
    c.restore();
  }
  function basqueHouse(c, x, y, w, h, flip, pep) {
    c.save(); c.translate(x, y); c.scale(flip, 1);
    var wh = h * 0.6, rh = h * 0.5, R = '#a42e26', RD = '#7e211c';
    c.fillStyle = 'rgba(16,40,16,.28)'; c.beginPath(); c.ellipse(w / 2, 0.8, w * 0.62, 1.8, 0, 0, TAU); c.fill();
    // murs blancs, soubassement de pierre
    c.fillStyle = A.grad(c, 0, -wh, 0, 0, [0, '#fbf7ee', 1, '#e6dfcf']); c.fillRect(0, -wh, w, wh);
    c.fillStyle = '#b4ab98'; c.fillRect(0, -wh * 0.13, w, wh * 0.13);
    c.fillStyle = 'rgba(60,40,30,.12)'; c.fillRect(w * 0.78, -wh, w * 0.22, wh);
    // colombages rouges : poteaux, sablière d'étage, croix de Saint-André
    c.fillStyle = R; var nP = Math.max(4, Math.round(w / 9)), i, pw = w / nP;
    c.fillRect(0, -wh * 0.5 - 0.9, w, 1.8); c.fillRect(0, -wh, w, 1.4); c.fillRect(0, -wh * 0.14 - 0.5, w, 1);
    for (i = 0; i <= nP; i++) { c.fillRect(Math.min(w - 1.5, i * pw - 0.7), -wh, 1.5, wh * 0.86); }
    c.strokeStyle = R; c.lineWidth = 0.9; for (i = 0; i < nP; i++) { if (i % 2 === 0) { c.beginPath(); c.moveTo(i * pw, -wh * 0.5); c.lineTo((i + 1) * pw, -wh); c.moveTo((i + 1) * pw, -wh * 0.5); c.lineTo(i * pw, -wh); c.stroke(); } }
    // fenêtres à volets rouges
    for (i = 1; i < nP - 1; i += 2) {
      var wx = i * pw + pw * 0.2, ww = pw * 0.6;
      c.fillStyle = '#2b3a4a'; c.fillRect(wx, -wh * 0.44, ww, wh * 0.3); c.fillStyle = R; c.fillRect(wx - 1.3, -wh * 0.44, 1.3, wh * 0.3); c.fillRect(wx + ww, -wh * 0.44, 1.3, wh * 0.3);
      c.fillStyle = '#2b3a4a'; c.fillRect(wx, -wh * 0.92, ww, wh * 0.3); c.fillStyle = R; c.fillRect(wx - 1.3, -wh * 0.92, 1.3, wh * 0.3); c.fillRect(wx + ww, -wh * 0.92, 1.3, wh * 0.3);
    }
    c.fillStyle = RD; c.fillRect(w * 0.12, -wh * 0.42, pw * 0.9, wh * 0.42);   // porte
    if (pep) { c.fillStyle = '#d3321f'; for (i = 0; i < 6; i++) { c.beginPath(); c.arc(w * 0.6 + (i % 3) * 1.2, -wh * 0.7 + (i / 3 | 0) * 2.2 + 3, 0.7, 0, TAU); c.fill(); } }   // piments d'Espelette séchant en façade
    // grand toit asymétrique, tuiles rouges (pan long d'un côté), débord de toit
    c.beginPath(); c.moveTo(-w * 0.06, -wh + 1); c.lineTo(w * 0.34, -wh - rh); c.lineTo(w * 1.08, -wh + 2); c.closePath();
    c.fillStyle = A.grad(c, 0, -wh - rh, 0, -wh, [0, '#d4643f', 1, '#b4452c']); c.fill();
    c.save(); c.clip(); c.strokeStyle = 'rgba(100,28,20,.35)'; c.lineWidth = 0.5; for (i = 1; i < 7; i++) { var ry = -wh - rh + rh * i / 7; c.beginPath(); c.moveTo(-w * 0.1, ry); c.lineTo(w * 1.1, ry); c.stroke(); } c.restore();
    c.beginPath(); c.moveTo(w * 0.34, -wh - rh); c.lineTo(w * 1.08, -wh + 2); c.lineTo(w * 0.8, -wh + 1.5); c.closePath(); c.fillStyle = 'rgba(90,24,18,.28)'; c.fill();
    c.fillStyle = '#8e2f20'; c.fillRect(-w * 0.06, -wh + 0.4, w * 1.14, 1.3);
    c.fillStyle = '#6b6258'; c.fillRect(w * 0.7, -wh - rh * 0.82, 2.2, rh * 0.5);   // cheminée
    c.restore();
  }
  /* ----------- Pays basque (v0.5.2 : décors vectoriels lisses, cuits à la résolution de l'écran — plus aucun aspect pixellisé) ----------- */
  function ridgeP(c, Tw, th, fn, top) { c.beginPath(); c.moveTo(-2, th + 2); for (var x = -2; x <= Tw + 2; x += 2) { c.lineTo(x, top + fn(x)); } c.lineTo(Tw + 2, th + 2); c.closePath(); }
  function rgrad(c, x, y, r0, r1, rr, stops) { var g = c.createRadialGradient(x, y, r0, x, y, rr); for (var i = 0; i < stops.length; i += 2) { g.addColorStop(stops[i], stops[i + 1]); } return g; }
  function oak(c, x, y, s, d, l) {   // chêne / hêtre arrondi : tronc + couronne de lobes dégradés
    c.fillStyle = 'rgba(10,44,16,.24)'; c.beginPath(); c.ellipse(x + s * 0.1, y + 0.3, s * 0.36, s * 0.065, 0, 0, TAU); c.fill();
    c.fillStyle = '#5b4332'; c.beginPath(); c.moveTo(x - s * 0.045, y); c.quadraticCurveTo(x - s * 0.03, y - s * 0.3, x - s * 0.075, y - s * 0.46); c.lineTo(x + s * 0.075, y - s * 0.46); c.quadraticCurveTo(x + s * 0.03, y - s * 0.3, x + s * 0.045, y); c.closePath(); c.fill();
    var lb = [[-0.2, -0.54, 0.23], [0.21, -0.56, 0.24], [-0.02, -0.76, 0.28], [-0.12, -0.64, 0.26], [0.15, -0.68, 0.25], [0.0, -0.55, 0.26]];
    for (var i = 0; i < lb.length; i++) { var q = lb[i], cx = x + q[0] * s, cy = y + q[1] * s, rr = q[2] * s; c.fillStyle = rgrad(c, cx - rr * 0.35, cy - rr * 0.4, 0, 0, rr * 1.15, [0, l, 1, d]); c.beginPath(); c.arc(cx, cy, rr, 0, TAU); c.fill(); }
  }
  function pine(c, x, y, h, d, l) {   // sapin à étages courbes
    c.fillStyle = 'rgba(10,44,16,.22)'; c.beginPath(); c.ellipse(x + h * 0.06, y + 0.3, h * 0.2, h * 0.04, 0, 0, TAU); c.fill();
    c.fillStyle = '#4a382a'; c.fillRect(x - h * 0.025, y - h * 0.16, h * 0.05, h * 0.16);
    var g = c.createLinearGradient(x - h * 0.22, 0, x + h * 0.22, 0); g.addColorStop(0, l); g.addColorStop(1, d); c.fillStyle = g;
    for (var i = 0; i < 4; i++) { var by = y - h * (0.1 + i * 0.2), tw = h * (0.23 - i * 0.04), ty = by - h * 0.32; c.beginPath(); c.moveTo(x, ty); c.quadraticCurveTo(x + tw * 0.25, by - h * 0.12, x + tw, by); c.quadraticCurveTo(x, by + h * 0.03, x - tw, by); c.quadraticCurveTo(x - tw * 0.25, by - h * 0.12, x, ty); c.closePath(); c.fill(); }
  }
  function bandsFill(c, Tw, fn, top, r, n, step, c1, c2, amp) {   // bandes de cultures qui épousent la colline (clip déjà en place)
    for (var i = 0; i < n; i++) {
      var o0 = 4 + i * step, o1 = o0 + step, ph = r() * 6; c.beginPath();
      for (var x = -2; x <= Tw + 2; x += 4) { var y = top + fn(x) + o0 + amp * Math.sin(x * 0.021 + ph + i); if (x === -2) { c.moveTo(x, y); } else { c.lineTo(x, y); } }
      for (x = Tw + 2; x >= -2; x -= 4) { c.lineTo(x, top + fn(x) + o1 + amp * Math.sin(x * 0.021 + ph + i + 1)); }
      c.closePath(); c.fillStyle = i % 2 ? c1 : c2; c.fill();
    }
  }
  function fieldPatches(c, Tw, fn, top, r, n, pal, y0, y1) {   // parcelles : quadrilatères légèrement courbes, haies sombres sur les bords
    for (var i = 0; i < n; i++) {
      var x = r() * Tw, w = 22 + r() * 54, yy = y0 + r() * (y1 - y0), hh = 5 + r() * 9, sk = (r() - 0.5) * 10, col = pal[(r() * pal.length) | 0];
      wrap(Tw, x, w, function (xx) {
        var ya = top + fn(xx) + yy, yb = top + fn(xx + w) + yy + sk * 0.2;
        c.beginPath(); c.moveTo(xx, ya); c.quadraticCurveTo(xx + w * 0.5, (ya + yb) / 2 - 1.2, xx + w, yb); c.lineTo(xx + w + sk, yb + hh); c.quadraticCurveTo(xx + w * 0.5 + sk, (ya + yb) / 2 + hh + 1, xx + sk * 0.3, ya + hh); c.closePath();
        c.globalAlpha = 0.55; c.fillStyle = col; c.fill(); c.globalAlpha = 0.28; c.lineWidth = 0.7; c.strokeStyle = '#25562f'; c.stroke(); c.globalAlpha = 1;
      });
    }
  }
  function hedgeRow(c, Tw, fn, top, r, x0, x1, yo, s, d, l) {   // haie de petits arbres le long d'un contour
    for (var x = x0; x < x1; x += s * (0.55 + r() * 0.3)) { var xx = x; wrap(Tw, xx, s, function (q) { oak(c, q, top + fn(q) + yo + r() * 2, s * (0.8 + r() * 0.5), d, l); }); }
  }
  function makeFarB(rs) {   // collines bleutées étagées, baie de l'océan, villages minuscules
    var Tw = 900, th = 120;
    return tile(Tw, th, rs, function (c, r) {
      var f1 = ridgeFn(Tw, 12, [[2, 14], [3, 9], [6, 4], [11, 1.6]]), f2 = ridgeFn(Tw, 14, [[3, 11], [4, 6], [8, 2.5], [13, 1]]), f3 = ridgeFn(Tw, 16, [[2, 7], [5, 4], [9, 1.8]]);
      function bay(x) { return sst(300, 380, x) * (1 - sst(560, 640, x)); }
      var a = function (x) { return f1(x) + bay(x) * 40; }, b = function (x) { return f2(x) + bay(x) * 26; }, d = function (x) { return f3(x) + bay(x) * 12; };
      ridgeP(c, Tw, th, a, 46); c.fillStyle = gradv(c, 24, th, [0, '#8aa8c0', 0.6, '#a2bccb', 1, '#b6cbd0']); c.fill();
      c.save(); c.clip(); c.fillStyle = gradv(c, 24, 80, [0, 'rgba(255,255,255,.22)', 1, 'rgba(255,255,255,0)']); c.fillRect(0, 0, Tw, th);
      for (var i = 0; i < 6; i++) { c.beginPath(); for (var x = 0; x <= Tw; x += 4) { var y = 46 + a(x) + 8 + i * 9 + 3 * Math.sin(x * 0.03 + i); if (x === 0) { c.moveTo(x, y); } else { c.lineTo(x, y); } } c.strokeStyle = 'rgba(94,128,150,.22)'; c.lineWidth = 1.2; c.stroke(); }
      c.restore();
      ridgeP(c, Tw, th, b, 66); c.fillStyle = gradv(c, 40, th, [0, '#6e9a8a', 0.55, '#82ac94', 1, '#92b89e']); c.fill();
      c.save(); c.clip(); bandsFill(c, Tw, b, 66, r, 5, 8, 'rgba(210,236,160,.12)', 'rgba(36,86,60,.10)', 1.5); c.restore();
      for (i = 0; i < 38; i++) { var tx = r() * Tw; wrap(Tw, tx, 5, function (q) { oak(c, q, 66 + b(q) + 6 + r() * 6, 6 + r() * 4, '#3d7a56', '#79ad79'); }); }
      [150, 420, 700, 840].forEach(function (hx) { wrap(Tw, hx, 8, function (q) { var gy = 66 + b(q) + 7; for (var k = 0; k < 3; k++) { c.fillStyle = '#f4efe4'; c.fillRect(q + k * 3.2, gy - 2.2, 2.4, 2.2); c.fillStyle = '#b9553c'; c.beginPath(); c.moveTo(q + k * 3.2 - 0.3, gy - 2.2); c.lineTo(q + k * 3.2 + 1.2, gy - 3.4); c.lineTo(q + k * 3.2 + 2.7, gy - 2.2); c.fill(); } }); });
      ridgeP(c, Tw, th, d, 88); c.fillStyle = gradv(c, 80, th, [0, '#7fb08a', 1, '#8db39a']); c.fill();
    }, 51);
  }
  function makeSea(rs) {   // océan : dégradé d'horizon, houle fine, scintillements, deux voiliers
    var Tw = 760, th = 84;
    return tile(Tw, th, rs, function (c, r) {
      c.fillStyle = gradv(c, 0, th, [0, '#d4eaf4', 0.07, '#a6d0e6', 0.3, '#4c93c8', 0.7, '#2d6fae', 1, '#245f9c']); c.fillRect(0, 0, Tw, th);
      var i; c.lineCap = 'round';
      for (i = 0; i < 120; i++) { var y = 3 + r() * (th - 6), x = r() * Tw, wd = 5 + y * 0.28 * (0.4 + r()), a = 0.1 + 0.3 * r() * (0.4 + y / th); c.strokeStyle = r() < 0.7 ? 'rgba(255,255,255,' + a + ')' : 'rgba(20,70,130,' + a * 0.8 + ')'; c.lineWidth = 0.45 + y / 70; wrap(Tw, x, wd, function (xx) { c.beginPath(); c.moveTo(xx, y); c.quadraticCurveTo(xx + wd * 0.5, y - 0.8 - y / 60, xx + wd, y); c.stroke(); }); }
      for (i = 0; i < 40; i++) { var gx = r() * Tw, gy = 2 + r() * 40; c.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.5 * r()) + ')'; wrap(Tw, gx, 3, function (xx) { c.beginPath(); c.ellipse(xx, gy, 0.9 + r() * 1.7, 0.35 + r() * 0.3, 0, 0, TAU); c.fill(); }); }
      c.fillStyle = gradv(c, 0, 5, [0, 'rgba(255,255,255,.75)', 1, 'rgba(255,255,255,0)']); c.fillRect(0, 0, Tw, 5);
      [[180, 22, 1], [560, 34, -1]].forEach(function (b) { wrap(Tw, b[0], 12, function (xx) { c.save(); c.translate(xx, b[1]); c.scale(b[2], 1); c.fillStyle = 'rgba(14,40,80,.35)'; c.beginPath(); c.ellipse(0, 1.2, 6, 0.9, 0, 0, TAU); c.fill(); c.fillStyle = '#f7f4ec'; c.beginPath(); c.moveTo(0, -11); c.quadraticCurveTo(3.8, -5, 4.8, -0.4); c.lineTo(0, -0.4); c.closePath(); c.fill(); c.fillStyle = '#e6ddd0'; c.beginPath(); c.moveTo(-0.7, -9); c.lineTo(-0.7, -0.6); c.lineTo(-4.2, -0.6); c.quadraticCurveTo(-3.4, -4.8, -0.7, -9); c.fill(); c.fillStyle = '#2b3550'; c.beginPath(); c.moveTo(-5.2, -0.2); c.lineTo(5.8, -0.2); c.lineTo(4.4, 1.5); c.lineTo(-3.8, 1.5); c.closePath(); c.fill(); c.restore(); }); });
    }, 52);
  }
  function hillLayer(Tw, th, rs, seed, o) {   // collines basques : dégradé, cultures en bandes, parcelles, haies, ombres douces
    return tile(Tw, th, rs, function (c, r) {
      var f = ridgeFn(Tw, o.seed, o.terms), top = o.top;
      ridgeP(c, Tw, th, f, top); c.fillStyle = gradv(c, top - 18, th, o.grad); c.fill();
      c.save(); c.clip();
      bandsFill(c, Tw, f, top, r, o.nb, o.bs, o.c1, o.c2, o.amp);
      fieldPatches(c, Tw, f, top, r, o.np, o.pal, 6, th - top - 14);
      // lumière rasante : liseré clair sur la crête + ombre douce au pied des croupes
      c.beginPath(); for (var x = -2; x <= Tw + 2; x += 3) { if (x === -2) { c.moveTo(x, top + f(x) + 0.6); } else { c.lineTo(x, top + f(x) + 0.6); } } c.strokeStyle = o.rim; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = gradv(c, top - 10, top + 40, [0, o.glow, 1, 'rgba(255,255,255,0)']); c.fillRect(0, top - 10, Tw, 60);
      if (o.deco) { o.deco(c, r, f, top); }
      c.restore();
      c.fillStyle = gradv(c, th - o.fade, th, [0, o.fadeC0, 1, o.fadeC1]); c.fillRect(0, th - o.fade, Tw, o.fade);
    }, seed);
  }
  function makeMidB(rs) {
    return hillLayer(1000, 110, rs, 61, {
      seed: 15, terms: [[2, 14], [3, 9], [5, 5], [9, 2], [14, 0.9]], top: 38, grad: [0, '#86bd72', 0.5, '#66a05a', 1, '#4f8a4e'], nb: 7, bs: 9, c1: 'rgba(220,240,140,.13)', c2: 'rgba(30,86,50,.12)', amp: 1.6, np: 34,
      pal: ['#c4d27a', '#a7c868', '#d9d98a', '#6aa457', '#8fb860'], rim: 'rgba(235,255,190,.55)', glow: 'rgba(235,250,190,.28)', fade: 34, fadeC0: 'rgba(79,138,78,0)', fadeC1: '#4f8a4e',
      deco: function (c, r, f, top) {
        hedgeRow(c, 1000, f, top, r, 30, 330, 14, 7, '#2e6a3c', '#7ab35a'); hedgeRow(c, 1000, f, top, r, 520, 800, 22, 7, '#2e6a3c', '#7ab35a');
        for (var i = 0; i < 24; i++) { var tx = r() * 1000; wrap(1000, tx, 8, function (q) { if (i % 4) { oak(c, q, top + f(q) + 8 + r() * 30, 8 + r() * 6, '#2f6a3a', '#80b45c'); } else { pine(c, q, top + f(q) + 10 + r() * 28, 13 + r() * 5, '#1f4a33', '#3b7448'); } }); }
        [70, 250, 430, 640, 820, 940].forEach(function (hx, q) { var gy = top + f(hx) + 14; wrap(1000, hx, 18, function (xx) { basqueHouse(c, xx - 8, gy, 16, 10, q % 2 ? -1 : 1, false); }); });
      }
    });
  }
  function makeMid2B(rs) {
    return hillLayer(1000, 120, rs, 71, {
      seed: 17, terms: [[2, 13], [3, 8], [6, 4], [10, 1.8], [16, 0.8]], top: 42, grad: [0, '#92cc72', 0.5, '#6aaa56', 1, '#4a8844'], nb: 8, bs: 9, c1: 'rgba(224,244,140,.14)', c2: 'rgba(30,86,50,.13)', amp: 1.8, np: 36,
      pal: ['#c9d67e', '#addb6e', '#e0e08f', '#6fb05a', '#93c262'], rim: 'rgba(240,255,196,.6)', glow: 'rgba(240,252,196,.3)', fade: 30, fadeC0: 'rgba(74,136,68,0)', fadeC1: '#4a8844',
      deco: function (c, r, f, top) {
        hedgeRow(c, 1000, f, top, r, 180, 520, 20, 10, '#2c6a38', '#84ba5e'); hedgeRow(c, 1000, f, top, r, 880, 1000, 18, 9, '#2c6a38', '#84ba5e');
        [[120, 34, 18, 1], [560, 40, 20, -1], [860, 30, 17, 1]].forEach(function (d, q) { var gy = top + f(d[0]) + 20; wrap(1000, d[0], d[1], function (xx) { basqueHouse(c, xx - d[1] / 2, gy, d[1], d[2], d[3], q === 1); }); });
        [[330, 5], [700, 6]].forEach(function (d) { for (var k = 0; k < d[1]; k++) { var sx = d[0] + k * 6 + r() * 5, sy = top + f(sx) + 22 + r() * 9; wrap(1000, sx, 6, function (xx) { sheep(c, xx, sy, 0.95, r() < 0.5 ? 1 : -1, 0); }); } });
        [[420, '#6b4326'], [770, '#33271f']].forEach(function (d) { var gy = top + f(d[0]) + 26; wrap(1000, d[0], 10, function (xx) { pottok(c, xx, gy, 0.9, 1, d[1], '#1c1512'); }); });
        for (var i = 0; i < 16; i++) { var tx = r() * 1000, gy3 = top + f(tx) + 18 + r() * 30; wrap(1000, tx, 12, function (q) { if (i % 3) { oak(c, q, gy3, 17 + r() * 10, '#2d6a38', '#86bc5e'); } else { pine(c, q, gy3, 24, '#1f4a33', '#3b7448'); } }); }
      }
    });
  }
  function makeNearB(rs) {   // prairies proches : grandes fermes, brebis, pottoks, chênes, murets de pierre, fleurs
    return hillLayer(1000, 110, rs, 81, {
      seed: 19, terms: [[2, 11], [3, 7], [5, 3], [9, 1.6], [15, 0.7]], top: 34, grad: [0, '#9ede6c', 0.5, '#6cb348', 1, '#3a8a3a'], nb: 6, bs: 10, c1: 'rgba(230,250,140,.15)', c2: 'rgba(24,90,40,.14)', amp: 2, np: 26,
      pal: ['#c9e07a', '#b4e46c', '#e6e690', '#6cb852', '#96cc60'], rim: 'rgba(245,255,200,.65)', glow: 'rgba(245,255,200,.32)', fade: 26, fadeC0: 'rgba(58,138,58,0)', fadeC1: '#3a8a3a',
      deco: function (c, r, f, top) {
        var i;
        [[210, 52, 30, 1, true], [700, 60, 33, -1, false]].forEach(function (d) { var gy = top + f(d[0]) + 27; wrap(1000, d[0], d[1], function (xx) { basqueHouse(c, xx - d[1] / 2, gy, d[1], d[2], d[3], d[4]); }); });
        // muret de pierre sèche (pierres arrondies)
        for (i = 0; i < 20; i++) { var mx = 250 + i * 5, my = top + f(250) + 34 + (i % 2) * 0.5; c.fillStyle = i % 3 ? '#a39e92' : '#8f8a80'; c.beginPath(); c.ellipse(mx + 2.3, my, 2.5, 1.7, 0, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(40,52,30,.3)'; c.fillRect(250, top + f(250) + 35.6, 100, 0.8);
        [[430, 7], [880, 6], [60, 5]].forEach(function (d) { for (var k = 0; k < d[1]; k++) { var sx = d[0] + k * 8 + r() * 6, sy = top + f(sx) + 30 + r() * 15; wrap(1000, sx, 8, function (xx) { sheep(c, xx, sy, 1.35, r() < 0.5 ? 1 : -1, r()); }); } });
        [[340, '#6b4326', 1], [560, '#3b2a22', -1], [800, '#7a5030', 1]].forEach(function (d) { var gy = top + f(d[0]) + 36; wrap(1000, d[0], 14, function (xx) { pottok(c, xx, gy, 1.35, d[2], d[1], '#1a1310'); }); });
        [120, 480, 640, 960].forEach(function (x0, q) { var gy = top + f(x0) + 38; wrap(1000, x0, 24, function (xx) { if (q % 2) { pine(c, xx, gy, 46, '#1f4a33', '#3f7a4b'); pine(c, xx + 13, gy + 3, 36, '#245437', '#4a8556'); } else { oak(c, xx, gy, 44, '#2a6a32', '#92c868'); } }); });
        // fleurs sauvages (marguerites, boutons d'or) et brins d'herbe
        for (i = 0; i < 70; i++) { var fx = r() * 1000, fy = top + f(fx) + 8 + r() * 56; c.fillStyle = r() < 0.5 ? '#fffdf2' : '#ffd84a'; c.beginPath(); c.arc(fx, fy, 0.55 + r() * 0.35, 0, TAU); c.fill(); }
        c.lineCap = 'round'; for (i = 0; i < 120; i++) { var gx = r() * 1000, gy2 = top + f(gx) + 10 + r() * 58, gh = 1.8 + r() * 2.6; c.strokeStyle = r() < 0.5 ? 'rgba(40,110,44,.5)' : 'rgba(190,240,110,.55)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(gx, gy2); c.quadraticCurveTo(gx + (r() - 0.5) * 1.6, gy2 - gh * 0.6, gx + (r() - 0.5) * 2.4, gy2 - gh); c.stroke(); }
      }
    });
  }

  /* --- La Rhune : montagne au plateau sommital, pylône, petit train rouge à crémaillère sur sa voie qui épouse la pente --- */
  var RH = { w: 460, h: 250, base: 248, sx: 300, xs: 90, xe: 270 };
  var RHP = [[-20, 13], [20, 22], [70, 36], [120, 60], [168, 88], [212, 112], [252, 132], [282, 141], [306, 143], [330, 138], [366, 120], [402, 96], [436, 74], [480, 54]];
  function rhH(x) { return rhHs(x) + 1.6 * Math.sin(x * 0.11 + 0.7) + 1.1 * Math.sin(x * 0.27 + 2.1); }   // + petites aspérités
  function rhHs(x) {   // hauteur lisse de la surface (au-dessus de la base) : spline de Catmull-Rom
    var i = 0, n = RHP.length; while (i < n - 2 && RHP[i + 1][0] <= x) { i++; }
    var p0 = RHP[Math.max(0, i - 1)], p1 = RHP[i], p2 = RHP[i + 1], p3 = RHP[Math.min(n - 1, i + 2)], t = clamp((x - p1[0]) / (p2[0] - p1[0]), 0, 1), t2 = t * t, t3 = t2 * t;
    var y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
    return y;
  }
  function rhTrackY(x) { var u = clamp((x - RH.xs) / (RH.xe - RH.xs), 0, 1); return RH.base - (rhHs(x) - (25 - 12 * u)); }   // la voie court sur le flanc, 15 à 30 unités sous la crête
  function rhAng(x) { return Math.atan2(rhTrackY(x + 3) - rhTrackY(x - 3), 6); }
  function makeHero(rs) {
    return tile(RH.w, RH.h, rs, function (c, r) {
      var i, w = RH.w, base = RH.base;
      function top(x) { return base - rhH(x); }
      // corps de la montagne
      c.beginPath(); c.moveTo(-2, base + 4); for (i = -2; i <= w + 2; i += 2) { c.lineTo(i, top(i)); } c.lineTo(w + 2, base + 4); c.closePath();
      c.fillStyle = gradv(c, base - 180, base, [0, '#c9b562', 0.28, '#a0a042', 0.58, '#6f8c3c', 1, '#3a6a32']); c.fill();
      c.save(); c.clip();
      // soleil à gauche : versant gauche éclairé, versant droit dans l'ombre bleutée
      var lg = c.createLinearGradient(0, 0, w, 0); lg.addColorStop(0, 'rgba(255,236,170,.28)'); lg.addColorStop(0.5, 'rgba(255,236,170,.06)'); lg.addColorStop(0.62, 'rgba(60,50,110,.10)'); lg.addColorStop(1, 'rgba(50,40,100,.36)'); c.fillStyle = lg; c.fillRect(0, 0, w, RH.h);
      // plis du relief : ravines sombres + croupes claires, qui descendent de la crête
      c.lineCap = 'round';
      for (i = 0; i < 22; i++) {
        var x0 = 40 + r() * 400, y0 = top(x0) + 3, ln = 36 + r() * 60, sw = (r() - 0.5) * 26, dark = i % 2 === 0, x1 = x0 + sw * 1.2, y1 = y0 + ln, lw = 2.2 + r() * 4.2;
        var gg = c.createLinearGradient(x0, y0, x1, y1); gg.addColorStop(0, dark ? 'rgba(34,48,34,.26)' : 'rgba(255,240,170,.22)'); gg.addColorStop(1, dark ? 'rgba(34,48,34,0)' : 'rgba(255,240,170,0)');
        c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + sw * 0.3, y0 + ln * 0.35, x0 + sw, y0 + ln * 0.7, x1, y1); c.strokeStyle = gg; c.lineWidth = lw; c.lineCap = 'butt'; c.stroke();
        if (dark) { c.beginPath(); c.moveTo(x0 + lw * 0.9, y0); c.bezierCurveTo(x0 + sw * 0.3 + lw * 0.9, y0 + ln * 0.35, x0 + sw + lw * 0.9, y0 + ln * 0.7, x1 + lw * 0.9, y1); var g2 = c.createLinearGradient(x0, y0, x1, y1); g2.addColorStop(0, 'rgba(255,244,190,.2)'); g2.addColorStop(1, 'rgba(255,244,190,0)'); c.strokeStyle = g2; c.lineWidth = 1.1; c.stroke(); }
      }
      // landes de fougères, ajoncs en fleur, prairies : taches douces
      for (i = 0; i < 520; i++) {
        var x = r() * w, hgt = rhH(x); if (hgt < 20) { continue; } var y = base - r() * hgt * 0.97, rad = 1.4 + r() * 3.6, q = r(), col = q < 0.34 ? '110,92,40' : q < 0.55 ? '212,184,70' : q < 0.8 ? '78,128,52' : '150,170,80', a = 0.16 + r() * 0.26;
        c.fillStyle = rgrad(c, x, y, 0, 0, rad, [0, 'rgba(' + col + ',' + a + ')', 1, 'rgba(' + col + ',0)']); c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill();
      }
      // affleurements rocheux près du sommet (facettes)
      [[318, 34, 22, 8], [346, 56, 18, 7], [258, 20, 20, 7], [398, 94, 16, 6], [214, 70, 14, 6]].forEach(function (rk) {
        var rx = rk[0], ry = top(rx) + rk[1] * 0.3, rw = rk[2], rh = rk[3];
        c.beginPath(); c.moveTo(rx - rw / 2, ry + rh * 0.5); c.lineTo(rx - rw * 0.3, ry - rh * 0.4); c.lineTo(rx + rw * 0.05, ry - rh * 0.6); c.lineTo(rx + rw * 0.4, ry - rh * 0.1); c.lineTo(rx + rw / 2, ry + rh * 0.5); c.closePath(); c.fillStyle = '#9d9890'; c.fill();
        c.beginPath(); c.moveTo(rx - rw * 0.3, ry - rh * 0.4); c.lineTo(rx + rw * 0.05, ry - rh * 0.6); c.lineTo(rx + rw * 0.1, ry + rh * 0.4); c.lineTo(rx - rw * 0.2, ry + rh * 0.5); c.closePath(); c.fillStyle = 'rgba(255,250,235,.28)'; c.fill();
        c.beginPath(); c.moveTo(rx + rw * 0.05, ry - rh * 0.6); c.lineTo(rx + rw * 0.4, ry - rh * 0.1); c.lineTo(rx + rw / 2, ry + rh * 0.5); c.lineTo(rx + rw * 0.1, ry + rh * 0.4); c.closePath(); c.fillStyle = 'rgba(40,36,60,.32)'; c.fill();
      });
      // forêts de hêtres et de chênes au pied et dans les creux (grappes d'arbres lisses)
      for (i = 0; i < 70; i++) {
        var tx = 6 + r() * 448, hh = rhH(tx), ty = base - 4 - r() * Math.min(70, hh * 0.5), sz = 12 + r() * 12; if (hh < 24) { continue; }
        if (r() < 0.62) { oak(c, tx, ty, sz, '#2a5e2f', '#7da84c'); } else { pine(c, tx, ty, sz * 1.25, '#1b4630', '#2f6a42'); }
      }
      c.restore();
      // brume bleutée à la base (profondeur)
      c.fillStyle = gradv(c, base - 70, base + 2, [0, 'rgba(190,214,214,0)', 1, 'rgba(190,214,214,.55)']); c.fillRect(0, base - 70, w, 74);
      // liseré de crête
      c.beginPath(); for (i = 0; i <= w; i += 2) { if (i) { c.lineTo(i, top(i)); } else { c.moveTo(i, top(i)); } } c.strokeStyle = 'rgba(255,244,196,.45)'; c.lineWidth = 1.2; c.stroke();
      // sommet : pylône à treillis, gare et bâtiments
      var sy = top(RH.sx - 14);
      mast(c, RH.sx - 34, top(RH.sx - 34) + 1, 62, 8);
      c.fillStyle = '#efe8d8'; c.fillRect(RH.sx - 8, sy - 11, 16, 11); c.fillStyle = '#a42e26'; c.beginPath(); c.moveTo(RH.sx - 10, sy - 11); c.lineTo(RH.sx, sy - 18); c.lineTo(RH.sx + 10, sy - 11); c.closePath(); c.fill();
      c.fillStyle = '#2d3a4a'; c.fillRect(RH.sx - 5, sy - 8, 3, 3.4); c.fillRect(RH.sx + 1.5, sy - 8, 3, 3.4);
      c.fillStyle = '#d8d0bc'; c.fillRect(RH.sx + 12, sy - 8, 11, 8); c.fillStyle = '#8c3a2c'; c.fillRect(RH.sx + 11, sy - 10, 13, 2.2);
      // voie à crémaillère : ballast sur le flanc, rail, dents, traverses ; elle suit exactement la pente
      var ts = [], px;
      for (px = RH.xs - 14; px <= RH.xe + 10; px += 2) { ts.push([px, rhTrackY(px)]); }
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); ts.forEach(function (p, k) { if (k) { c.lineTo(p[0], p[1] + 1.4); } else { c.moveTo(p[0], p[1] + 1.4); } }); c.strokeStyle = 'rgba(36,26,20,.4)'; c.lineWidth = 6.2; c.stroke();
      c.beginPath(); ts.forEach(function (p, k) { if (k) { c.lineTo(p[0], p[1]); } else { c.moveTo(p[0], p[1]); } }); c.strokeStyle = '#8f877a'; c.lineWidth = 4.2; c.stroke();
      c.strokeStyle = '#a9a294'; c.lineWidth = 1.4; c.beginPath(); ts.forEach(function (p, k) { if (k) { c.lineTo(p[0], p[1] - 1.1); } else { c.moveTo(p[0], p[1] - 1.1); } }); c.stroke();
      c.strokeStyle = '#3b3128'; c.lineWidth = 1.5; for (px = RH.xs - 12; px <= RH.xe + 8; px += 3.2) { var yy = rhTrackY(px), an = rhAng(px), nx = -Math.sin(an), ny = Math.cos(an); c.beginPath(); c.moveTo(px - nx * 0.4, yy - ny * 0.4); c.lineTo(px + nx * 2.6, yy + ny * 2.6); c.stroke(); }
      c.beginPath(); ts.forEach(function (p, k) { if (k) { c.lineTo(p[0], p[1] - 1.6); } else { c.moveTo(p[0], p[1] - 1.6); } }); c.strokeStyle = '#e4e0d6'; c.lineWidth = 0.9; c.stroke();
      c.beginPath(); ts.forEach(function (p, k) { if (k) { c.lineTo(p[0], p[1] - 0.2); } else { c.moveTo(p[0], p[1] - 0.2); } }); c.strokeStyle = '#4a4a50'; c.lineWidth = 1.2; c.setLineDash([0.9, 1.6]); c.stroke(); c.setLineDash([]);
    }, 91);
  }
  function makeGroundB(rs) {   // bande de prairie entre les collines proches et la voie : herbe, fleurs, taupinières
    var Tw = 600, th = 48;
    return tile(Tw, th, rs, function (c, r) {
      c.fillStyle = gradv(c, 0, th, [0, '#3a8a3a', 0.45, '#45903f', 1, '#4d8f46']); c.fillRect(0, 0, Tw, th);
      var i; for (i = 0; i < 9; i++) { var bx = r() * Tw, bw = 40 + r() * 80, by = 4 + r() * 30; wrap(Tw, bx, bw, function (xx) { c.fillStyle = r() < 0.5 ? 'rgba(200,238,120,.16)' : 'rgba(20,80,36,.14)'; c.beginPath(); c.ellipse(xx, by, bw / 2, 3 + r() * 4, 0, 0, TAU); c.fill(); }); }
      c.lineCap = 'round'; for (i = 0; i < 160; i++) { var gx = r() * Tw, gy = 3 + r() * 44, gh = 2 + r() * 4; c.strokeStyle = r() < 0.5 ? 'rgba(34,104,42,.55)' : 'rgba(196,240,118,.6)'; c.lineWidth = 0.55; wrap(Tw, gx, 3, function (xx) { c.beginPath(); c.moveTo(xx, gy); c.quadraticCurveTo(xx + (r() - 0.5) * 2, gy - gh * 0.6, xx + (r() - 0.5) * 3, gy - gh); c.stroke(); }); }
      for (i = 0; i < 40; i++) { var fx = r() * Tw, fy = 4 + r() * 40; c.fillStyle = r() < 0.5 ? '#fffdf2' : '#ffd84a'; wrap(Tw, fx, 2, function (xx) { c.beginPath(); c.arc(xx, fy, 0.7 + r() * 0.4, 0, TAU); c.fill(); }); }
    }, 93);
  }
  function makeRhuneTrain(rs) {   // rame rouge à crémaillère : automotrice + remorque, cabine à droite (sens de la montée)
    var Wt = 40, Ht = 14;
    return tile(Wt, Ht, rs, function (c) {
      [[0, 19], [20.5, 19]].forEach(function (cr, q) {
        var x0 = cr[0], wd = cr[1], lead = q === 1;
        var g = c.createLinearGradient(0, 2, 0, 12); g.addColorStop(0, '#c0392b'); g.addColorStop(0.55, '#a02a22'); g.addColorStop(1, '#6e1d18');
        c.fillStyle = g; c.beginPath(); c.moveTo(x0 + 0.6, 11.2); c.lineTo(x0 + 0.6, 4.2); c.quadraticCurveTo(x0 + 0.6, 2.2, x0 + 2.4, 2.2); c.lineTo(x0 + wd - (lead ? 4 : 1.6), 2.2); if (lead) { c.quadraticCurveTo(x0 + wd - 1, 2.4, x0 + wd, 5.6); c.lineTo(x0 + wd, 11.2); } else { c.quadraticCurveTo(x0 + wd - 0.6, 2.2, x0 + wd - 0.6, 4.2); c.lineTo(x0 + wd - 0.6, 11.2); } c.closePath(); c.fill();
        c.fillStyle = '#e8d9ae'; c.fillRect(x0 + 0.6, 7.2, wd - 0.6, 1.1); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x0 + 1.2, 2.6, wd - 3, 0.7);
        var nw = lead ? 3 : 4, ww = (wd - 3.6) / nw - 1; for (var k = 0; k < nw; k++) { var wx = x0 + 1.6 + k * (ww + 1); c.fillStyle = gradv(c, 3.4, 6.6, [0, '#a9c4d8', 1, '#3b4c60']); c.fillRect(wx, 3.4, ww, 3.2); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(wx, 3.4, ww, 0.5); }
        if (lead) { c.fillStyle = gradv(c, 3.4, 7, [0, '#9fbbd0', 1, '#33445a']); c.beginPath(); c.moveTo(x0 + wd - 6.2, 3.4); c.lineTo(x0 + wd - 2.2, 3.4); c.quadraticCurveTo(x0 + wd - 0.9, 3.6, x0 + wd - 0.5, 6.8); c.lineTo(x0 + wd - 6.2, 6.8); c.closePath(); c.fill(); c.fillStyle = '#ffe9a8'; c.fillRect(x0 + wd - 0.9, 8.2, 0.9, 1.2); }
        c.fillStyle = '#3a2a24'; c.fillRect(x0 + 0.8, 11.2, wd - 1.4, 1.2);
        c.fillStyle = '#1c1618'; c.beginPath(); c.arc(x0 + 4, 12.2, 1.45, 0, TAU); c.arc(x0 + wd - 4, 12.2, 1.45, 0, TAU); c.fill(); c.fillStyle = '#b7b2a8'; c.beginPath(); c.arc(x0 + 4, 12.2, 0.55, 0, TAU); c.arc(x0 + wd - 4, 12.2, 0.55, 0, TAU); c.fill();
        c.fillStyle = '#3c3f46'; c.fillRect(x0 + wd / 2 - 3, 1.3, 6, 0.8); c.fillRect(x0 + wd / 2 - 0.4, 0.6, 0.8, 1);
      });
      c.fillStyle = '#2a2224'; c.fillRect(19.2, 8.4, 1.8, 1.6);
    }, 92);
  }

  /* --- brume de transition, nuages, étoiles, ciel --- */
  function makeClouds(rs, tint, seed) {
    var Tw = 1000, th = 190;
    return tile(Tw, th, rs, function (c, r) { for (var i = 0; i < 9; i++) { var x = r() * Tw, y = 62 + r() * 80, s = 1.4 + r() * 1.8; wrap(Tw, x, 60, function (xx) { A.cloud(c, xx, y, s, 0.55 + r() * 0.3, tint); }); } }, seed);
  }
  function makeMist(rs) {
    var Tw = 800, th = 300;
    return tile(Tw, th, rs, function (c, r) { for (var i = 0; i < 40; i++) { var x = r() * Tw, y = 90 + r() * 190, s = 3.2 + r() * 3.4; wrap(Tw, x, 90, function (xx) { A.cloud(c, xx, y, s, 0.6 + r() * 0.3, ['#ffffff', '#eef2f6', 'rgba(220,228,236,0)']); }); } }, 99);
  }
  function makeStars(rs) {
    var Tw = 700, th = 360;
    return tile(Tw, th, rs, function (c, r) { for (var i = 0; i < 90; i++) { var x = r() * Tw, y = r() * th * (0.3 + 0.7 * r()), s = r() < 0.12 ? 1.8 : 0.9; c.fillStyle = r() < 0.15 ? '#ffd98a' : '#ffffff'; c.globalAlpha = 0.45 + 0.5 * r(); c.fillRect(x, y, s, s); if (s > 1.5) { c.fillRect(x - 1.2, y + 0.4, 4.2, 0.6); c.fillRect(x + 0.6, y - 1.2, 0.6, 4.2); } } c.globalAlpha = 1; }, 5);
  }
  function makeSkies() {
    function sky(stops) { var c = cv(4, 256), x = c.getContext('2d'); x.fillStyle = gradv(x, 0, 256, stops); x.fillRect(0, 0, 4, 256); return c; }
    return { morning: sky([0, '#5f86b0', 0.55, '#a3b9ca', 1, '#e3e8e8']), noon: sky([0, '#3f7ec4', 0.6, '#8dc3e6', 1, '#f6ecd0']), dusk: sky([0, '#16206a', 0.4, '#3a2c84', 0.62, '#8c3c86', 0.78, '#e2504a', 0.9, '#ff8a3c', 1, '#ffc976']) };
  }
  function makeGlow(col, r) { var c = cv(160, 160), x = c.getContext('2d'), g = x.createRadialGradient(80, 80, 0, 80, 80, 80); g.addColorStop(0, col[0]); g.addColorStop(0.18, col[1]); g.addColorStop(1, col[2]); x.fillStyle = g; x.fillRect(0, 0, 160, 160); return c; }
  function makeHaze() { var c = cv(4, 128), x = c.getContext('2d'); x.fillStyle = gradv(x, 0, 128, [0, 'rgba(255,255,255,0)', 1, 'rgba(255,255,255,1)']); x.fillRect(0, 0, 4, 128); return c; }

  /* --- voie (côté fond), avec rail à crémaillère, poteaux et caténaire ; plan avant ; quai de la gare --- */
  function makeTrack(rs, basque) {
    var Tw = 480, th = 120, v0 = 70;   // v = y - v0 (v=0 : dessus du rail)
    return tile(Tw, th, rs, function (c, r) {
      var i;
      // talus + buissons derrière la voie
      c.fillStyle = basque ? '#4d8f46' : '#6e8a4c'; c.fillRect(0, v0 - 12, Tw, 70);
      for (i = 0; i < 40; i++) { var bx = r() * Tw, bs = 6 + r() * 12; wrap(Tw, bx, bs, function (xx) { c.fillStyle = basque ? (r() < 0.5 ? '#2f7036' : '#5aa04a') : (r() < 0.5 ? '#2c5a38' : '#7a9a56'); c.beginPath(); c.ellipse(xx, v0 - 10, bs, bs * 0.7, 0, Math.PI, 0); c.fill(); }); }
      // poteaux de caténaire (tous les 160) + fil de contact
      for (i = 0; i < 3; i++) {
        var px = 40 + i * 160; c.fillStyle = '#565d68'; c.fillRect(px - 1.1, v0 - 78, 2.2, 78); c.fillStyle = '#7b8492'; c.fillRect(px - 0.4, v0 - 78, 0.8, 78);
        c.fillStyle = '#565d68'; c.fillRect(px - 12, v0 - 76, 24, 1.6); c.fillRect(px - 1.8, v0 - 4, 3.6, 4);
        c.strokeStyle = '#3a404a'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(px - 11, v0 - 74.5); c.lineTo(px - 11, v0 - 71); c.moveTo(px + 11, v0 - 74.5); c.lineTo(px + 11, v0 - 71); c.stroke();
      }
      c.strokeStyle = '#2c3038'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, v0 - 72); c.lineTo(Tw, v0 - 72); c.stroke();
      c.beginPath(); c.moveTo(0, v0 - 47.4); c.lineTo(Tw, v0 - 47.4); c.strokeStyle = '#1f2430'; c.lineWidth = 0.7; c.stroke();
      c.strokeStyle = '#2c3038'; c.lineWidth = 0.4; for (i = 0; i < 24; i++) { var dx = i * 20 + 5; c.beginPath(); c.moveTo(dx, v0 - 72); c.lineTo(dx + 5, v0 - 47.4); c.stroke(); }   // pendules
      // ballast, traverses, rails
      c.fillStyle = gradv(c, v0 + 14, th, [0, basque ? '#4a8040' : '#5f7a42', 1, basque ? '#2f5a30' : '#34502c']); c.fillRect(0, v0 + 1, Tw, th - v0);
      for (i = 0; i < 260; i++) { c.fillStyle = r() < 0.5 ? 'rgba(210,240,150,.16)' : 'rgba(10,40,10,.2)'; c.fillRect(r() * Tw, v0 + 16 + r() * (th - v0 - 16), 1 + r() * 2.4, 0.8 + r() * 1.4); }
      c.fillStyle = gradv(c, v0 + 1, v0 + 15, [0, basque ? '#8c8a82' : '#78706a', 1, basque ? '#6e7468' : '#554e48']); c.fillRect(0, v0 + 1, Tw, 14);
      for (i = 0; i < 160; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.18)'; c.fillRect(r() * Tw, v0 + 3 + r() * 24, 1.4 + r() * 2, 1 + r() * 1.2); }
      c.fillStyle = '#3b2e26'; for (i = 0; i < Tw; i += 9) { c.fillRect(i, v0 + 0.8, 5.6, 4.2); c.fillStyle = '#4a382d'; c.fillRect(i, v0 + 0.8, 5.6, 1); c.fillStyle = '#3b2e26'; }
      // rail central à crémaillère (dents)
      c.fillStyle = '#4a4f58'; c.fillRect(0, v0 - 3.2, Tw, 2.4); c.fillStyle = '#8c929e'; for (i = 0; i < Tw; i += 3) { c.fillRect(i, v0 - 3.8, 1.4, 1.1); }
      c.fillStyle = '#d5d9df'; c.fillRect(0, v0 - 0.6, Tw, 1.2); c.fillStyle = '#7a808a'; c.fillRect(0, v0 + 0.6, Tw, 0.9);
    }, basque ? 123 : 121);
  }
  function makeFront(rs, basque) {   // plan avant : herbes, piquets de clôture, fougères — défile plus vite que le train
    var Tw = 420, th = 60;
    return tile(Tw, th, rs, function (c, r) {
      var i;
      for (i = 0; i < 70; i++) { var x = r() * Tw, hh = 5 + r() * 12; wrap(Tw, x, 6, function (xx) { c.strokeStyle = basque ? (r() < 0.5 ? '#3a8a3c' : '#a6dc6a') : (r() < 0.5 ? '#5f7a3c' : '#a9b85e'); c.lineWidth = 1 + r() * 0.8; c.beginPath(); c.moveTo(xx, th); c.quadraticCurveTo(xx + (r() - 0.5) * 6, th - hh * 0.6, xx + (r() - 0.5) * 9, th - hh); c.stroke(); }); }
      for (i = 0; i < 3; i++) { var fx = 40 + i * 140; c.fillStyle = '#6a4b32'; c.fillRect(fx, th - 24, 2.2, 24); c.fillStyle = '#85603f'; c.fillRect(fx, th - 24, 0.8, 24); }
            if (basque) { for (i = 0; i < 6; i++) { var fx2 = 30 + r() * 360; c.fillStyle = r() < 0.5 ? '#f3f0e6' : '#ffd34d'; c.beginPath(); c.arc(fx2, th - 6 - r() * 8, 1.1, 0, TAU); c.fill(); } }
    }, basque ? 131 : 133);
  }
  function makeStation(rs) {   // bâtiment de la gare du sommet (réutilise les dessins du niveau 6), pelouse, antenne
    var Tw = 330, th = 190, E = { time: 0 };
    return tile(Tw, th, rs, function (c, r) {
      var sy = th - 12;
      c.fillStyle = A.grad(c, 0, sy - 62, 0, sy + 12, [0, '#9cb870', 1, '#4c7a45']); c.beginPath(); c.moveTo(0, sy + 12); c.quadraticCurveTo(40, sy - 52, 118, sy - 54); c.quadraticCurveTo(250, sy - 52, Tw, sy + 12); c.closePath(); c.fill();
      for (var i = 0; i < 90; i++) { var x = 10 + r() * (Tw - 20), y = sy - r() * 40; c.fillStyle = r() < 0.5 ? 'rgba(48,86,48,.5)' : 'rgba(190,210,120,.4)'; c.fillRect(x, y, 3 + r() * 5, 0.9); }
      mast(c, 62, sy - 36, 112, 12);
      GA.paver(c, 130, 330, sy - 0.2, 3.2, '#bcb6a8', '#8e887c');
      GA.building(c, E, 150, 130, 22, sy, true, 0.3);
      c.fillStyle = '#5c564d'; c.fillRect(130, sy + 3, 200, 0.8);
    }, 141);
  }
  function makePlatform(rs) {   // quai dallé au premier plan avec garde-corps
    var Tw = 640, th = 34;
    return tile(Tw, th, rs, function (c) {
      GA.paver(c, 0, Tw, 9, 12, '#cfc9ba', '#9a9486'); c.fillStyle = '#6c665a'; c.fillRect(0, 21, Tw, 3); c.fillStyle = 'rgba(30,26,22,.35)'; c.fillRect(0, 24, Tw, 6);
      c.fillStyle = '#4b4f58'; for (var x = 14; x < Tw; x += 38) { c.fillRect(x, 0.5, 1.6, 9); } c.fillRect(0, 0.5, Tw, 1.2); c.fillRect(0, 4, Tw, 0.9);
    }, 151);
  }

  /* --- le train (copie du dessin de mech.js : rame blanche à 3 éléments, bandeau mauve « puys », cabine noire, pantographe) ; vue de côté, face à GAUCHE --- */
  var TR = { w: 240, h: 66, ox: 4, oy: 58, pane: [], door: 86 };
  var SEGS = [[0, 98], [98, 68], [166, 66]];
  function paneRect(si, k) {   // retourne [x, largeur] en coordonnées du train (origine = bout avant)
    var sg = SEGS[si], len = sg[1], hl = len / 2, xc = sg[0] + len / 2;
    if (si === 0) { return [xc - hl + 30 + k * 17, 14]; }
    var n = 4, pw = (len - 10) / n - 2.5; return [xc - hl + 5 + k * (pw + 2.5), pw];
  }
  function bakeTrain(rs) {
    rs = fitS(TR.w, TR.h, rs); var c = cv(TR.w * rs, TR.h * rs), x = ctx2d(c), H = 38;
    x.scale(rs, rs); x.translate(TR.ox, TR.oy);
    SEGS.forEach(function (sg, si) {
      var len = sg[1], xc = sg[0] + len / 2, hl = len / 2;
      x.save(); x.translate(xc, 0);
      [[-hl + 13], [hl - 13]].forEach(function (b) {
        x.fillStyle = '#23242b'; x.fillRect(b[0] - 8, -7.4, 16, 4.6); x.fillStyle = '#10111a'; x.beginPath(); x.arc(b[0] - 4.5, -4.0, 2.6, 0, 7); x.arc(b[0] + 4.5, -4.0, 2.6, 0, 7); x.fill();
        x.fillStyle = '#9aa0ac'; x.beginPath(); x.arc(b[0] - 4.5, -4.0, 1, 0, 7); x.arc(b[0] + 4.5, -4.0, 1, 0, 7); x.fill();
      });
      x.beginPath();
      if (si === 0) { x.moveTo(-hl + 7, -H); x.quadraticCurveTo(-hl + 1.5, -H, -hl + 1, -H + 6); x.lineTo(-hl - 0.6, -13); x.quadraticCurveTo(-hl - 0.8, -8, -hl + 3, -6.5); } else { x.moveTo(-hl, -H + 1); x.lineTo(-hl, -6.5); }
      x.lineTo(hl + 0.4, -6.5); x.lineTo(hl + 0.4, -H + 1.5); x.quadraticCurveTo(hl + 0.4, -H, hl - 2, -H); x.closePath();
      x.fillStyle = A.grad(x, 0, -H, 0, -6, [0, '#ffffff', 0.55, '#f1f3f7', 1, '#c3cad6']); x.fill(); x.lineWidth = 0.55; x.strokeStyle = '#2a3140'; x.stroke();
      x.save(); x.clip();
      var q, ph = si * 31.7;
      x.beginPath(); x.moveTo(-hl - 2, -6.6); for (q = -hl - 2; q <= hl + 3; q += 3) { var wv = 4.6 + 3.8 * Math.abs(Math.sin((q + ph) * 0.11)) + 2.2 * Math.sin((q + ph) * 0.37 + 1); x.lineTo(q, -6.6 - wv); } x.lineTo(hl + 3, -6.6); x.closePath(); x.fillStyle = '#c7a4c6'; x.fill();
      x.beginPath(); x.moveTo(-hl - 2, -6.6); for (q = -hl - 2; q <= hl + 3; q += 3) { var wv2 = 2.4 + 3.0 * Math.abs(Math.sin((q + ph + 9) * 0.16)) + 1.2 * Math.sin((q + ph) * 0.53); x.lineTo(q, -6.6 - wv2); } x.lineTo(hl + 3, -6.6); x.closePath(); x.fillStyle = '#8f5f93'; x.fill();
      x.fillStyle = '#3b3a46'; x.fillRect(-hl - 2, -7.4, len + 6, 1.2); x.restore();
      var wy = -31, wh = 12.5;
      function pane(px, pw) {
        x.fillStyle = A.grad(x, 0, wy, 0, wy + wh, [0, '#7d93a8', 1, '#3c4a5a']); x.fillRect(px, wy, pw, wh);   // verre sur intérieur éclairé
        x.fillStyle = 'rgba(255,224,170,.16)'; x.fillRect(px, wy + wh * 0.55, pw, wh * 0.45);
        x.fillStyle = 'rgba(190,220,245,.26)'; x.beginPath(); x.moveTo(px + pw * 0.15, wy); x.lineTo(px + pw * 0.55, wy); x.lineTo(px + pw * 0.2, wy + wh); x.lineTo(px - 1, wy + wh); x.closePath(); x.fill();
        x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(px, wy, pw, 0.8);
      }
      if (si === 0) {
        x.fillStyle = '#17181e'; x.beginPath(); x.moveTo(-hl + 6.5, -H - 0.4); x.quadraticCurveTo(-hl + 1.2, -H - 0.4, -hl + 0.8, -H + 6); x.lineTo(-hl + 0.2, -15); x.lineTo(-hl + 26, -15); x.lineTo(-hl + 26, -H - 0.4); x.closePath(); x.fill();
        x.fillStyle = A.grad(x, 0, -H + 3, 0, -15, [0, '#42576f', 1, '#1c2735']); x.beginPath(); x.moveTo(-hl + 5.5, -H + 4); x.lineTo(-hl + 23, -H + 4); x.lineTo(-hl + 23, -17); x.lineTo(-hl + 2.4, -17); x.closePath(); x.fill();
        x.fillStyle = 'rgba(200,225,250,.28)'; x.beginPath(); x.moveTo(-hl + 9, -H + 4); x.lineTo(-hl + 16, -H + 4); x.lineTo(-hl + 8, -17); x.lineTo(-hl + 2.4, -17); x.closePath(); x.fill();
        x.fillStyle = '#4f5663'; x.fillRect(-hl + 1, -15, 25, 1.2);
        pane(-hl + 30, 14); pane(-hl + 47, 14); pane(-hl + 64, 14);
        x.fillStyle = '#e9ecf2'; x.fillRect(hl - 20, wy - 1, 17, wh + 2); x.strokeStyle = '#5a6272'; x.lineWidth = 0.4; x.strokeRect(hl - 20, wy - 1, 17, wh + 2); x.beginPath(); x.moveTo(hl - 11.5, wy - 1); x.lineTo(hl - 11.5, wy + wh + 1); x.stroke();
        x.fillStyle = A.grad(x, 0, wy, 0, wy + wh, [0, '#f4d99a', 1, '#c98c3c']); x.fillRect(hl - 18.5, wy + 0.5, 6, wh - 1); x.fillRect(hl - 10, wy + 0.5, 6, wh - 1);   // porte : lumière chaude (là où l'on monte)
        x.fillStyle = '#fff3b8'; x.fillRect(-hl + 0.4, -12.2, 2.4, 2.4);
        x.fillStyle = '#8f5f93'; x.beginPath(); x.moveTo(-hl + 5, -10.2); x.lineTo(-hl + 8, -13.4); x.lineTo(-hl + 10.5, -10.2); x.closePath(); x.fill();
        x.fillStyle = '#2d2a3a'; x.fillRect(-hl + 12, -13.2, 15, 1.1); x.fillRect(-hl + 12, -11.4, 11, 1.0);
      } else {
        var n = 4, pw = (len - 10) / n - 2.5, k; for (k = 0; k < n; k++) { pane(-hl + 5 + k * (pw + 2.5), pw); }
        if (si === 1) { x.fillStyle = '#2d2a3a'; x.fillRect(hl - 17, -13.2, 13, 1.1); x.fillRect(hl - 17, -11.4, 9, 1.0); x.fillStyle = '#8f5f93'; x.beginPath(); x.moveTo(hl - 22, -10.2); x.lineTo(hl - 19.4, -13.4); x.lineTo(hl - 17, -10.2); x.closePath(); x.fill(); }
      }
      x.fillStyle = '#9ea5b2'; x.fillRect(-hl + (si === 0 ? 26 : 0), -H - 0.2, len - (si === 0 ? 26 : 0) + 0.4, 1.1);
      if (si === 1) {
        x.fillStyle = '#6c7788'; x.fillRect(-14, -H - 1.8, 24, 1.8); x.strokeStyle = '#1f2430'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(-8, -H - 1.6); x.lineTo(1, -H - 5.6); x.lineTo(-3, -H - 7.4); x.stroke(); x.beginPath(); x.moveTo(2, -H - 1.6); x.lineTo(-3, -H - 7.4); x.stroke();
        x.fillStyle = '#1f2430'; x.fillRect(-7.6, -H - 8.1, 9.2, 1.0); x.fillStyle = '#d9dde4'; x.fillRect(12, -H - 3.2, 14, 1.8);
      }
      if (si === 2) { x.fillStyle = '#d9dde4'; x.fillRect(-12, -H - 3.0, 16, 1.8); }
      if (si < 2) { x.fillStyle = '#2b2e38'; x.fillRect(hl - 1.6, -H + 3, 3.4, H - 9.6); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(hl - 1.2, -H + 3, 0.8, H - 9.6); }
      x.restore();
    });
    return { cv: c, w: TR.w, h: TR.h };
  }
  function bakeSeat(char, k, rs) {   // buste d'un voyageur assis derrière la vitre n° k de la voiture centrale
    var pr = paneRect(1, k), pw = pr[1], wy = -31, wh = 12.5, c = cv((pw + 1) * rs, (wh + 1) * rs), x = ctx2d(c);
    x.scale(rs, rs); x.translate(-pr[0] + 0.5, -wy + 0.5);
    x.save(); x.beginPath(); x.rect(pr[0], wy, pw, wh); x.clip();
    x.fillStyle = A.grad(x, 0, wy, 0, wy + wh, [0, '#8aa0b4', 1, '#3c4a5a']); x.fillRect(pr[0], wy, pw, wh);
    x.fillStyle = '#6a5a4c'; x.fillRect(pr[0], wy + wh - 3, pw, 3);                                  // dossier de siège
    x.save(); x.translate(pr[0] + pw * 0.5, wy + wh * 0.97); A.drawHiker(x, { x: 0, y: 11.2, face: -1, char: char, t: 0, phase: 0, move: 0, scale: 0.74, shadow: false }); x.restore();
    x.fillStyle = 'rgba(190,220,245,.24)'; x.beginPath(); x.moveTo(pr[0] + pw * 0.15, wy); x.lineTo(pr[0] + pw * 0.55, wy); x.lineTo(pr[0] + pw * 0.2, wy + wh); x.lineTo(pr[0] - 1, wy + wh); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(pr[0], wy, pw, 0.8); x.restore();
    return { cv: c, x: pr[0] - 0.5, y: wy - 0.5, w: pw + 1, h: wh + 1 };
  }
  function bakeWalk(char, rs) {   // 10 images d'un cycle de marche, face à droite
    var N = 10, fw = 36, fh = 44, c = cv(fw * N * rs, fh * rs), x = ctx2d(c), i;
    x.scale(rs, rs);
    for (i = 0; i < N; i++) { A.drawHiker(x, { x: i * fw + fw / 2, y: fh - 5, face: -1, char: char, t: i * 0.1, phase: i / N * TAU, move: 1, scale: 1.0, stride: 5.0, shadow: false }); }
    return { cv: c, n: N, fw: fw, fh: fh };
  }

  /* =====================================================================  CONSTRUCTION / AFFICHAGE  ===================================================================== */
  function layout(W, H, d) {
    G.W = W; G.H = H; G.d = d; G.s = Math.min(W / 260, H / 380, 3); G.k = G.s * d; G.Vw = W / G.s; G.Vh = H / G.s; G.rs = clamp(G.k, 1, 2);
    G.Zt = clamp(G.Vw / 285, 0.9, 1.7); G.railsY = G.Vh * 0.74; G.xm = G.Vw * 0.5 + 6;
  }
  function build() {
    var rs = G.rs, rt = Math.min(3, G.k * G.Zt);
    L = {};
    L.sky = makeSkies(); L.haze = makeHaze();
    L.sunW = makeGlow(['rgba(255,252,236,1)', 'rgba(255,246,214,.7)', 'rgba(255,240,200,0)']); L.sunO = makeGlow(['rgba(255,224,150,1)', 'rgba(255,150,70,.7)', 'rgba(255,100,50,0)']);
    L.cloudsD = makeClouds(rs * 0.8, ['#ffffff', '#eef2f7', '#c6d0dc'], 7); L.cloudsH = makeClouds(rs * 0.8, ['#fff6ea', '#ffd6b8', '#b08aa0'], 17);
    L.stars = makeStars(rs); L.mist = makeMist(rs * 0.8); L.cloudsD.soft = L.cloudsH.soft = L.stars.soft = L.mist.soft = true;
    L.farV = makeFarV(rs); L.midV = makeMidV(rs); L.mid2V = makeMid2V(rs); L.nearV = makeNearV(rs);
    var rsB = clamp(G.k, 1, 3.2), hsE = heroScaleEnd();
    L.farB = makeFarB(rsB); L.sea = makeSea(rsB); L.midB = makeMidB(rsB); L.mid2B = makeMid2B(rsB); L.nearB = makeNearB(rsB);
    L.groundB = makeGroundB(rsB); L.hero = makeHero(clamp(G.k * hsE * 1.05, 1.2, 4.2)); L.rtrain = makeRhuneTrain(clamp(G.k * hsE * 1.3, 2, 6));
    L.station = makeStation(rs); L.platform = makePlatform(rs);
    L.trackV = makeTrack(Math.min(2.4, G.k * G.Zt), false); L.trackB = makeTrack(Math.min(3, G.k * G.Zt), true);
    L.frontV = makeFront(Math.min(2.4, G.k * G.Zt), false); L.frontB = makeFront(Math.min(3, G.k * G.Zt), true);
    L.train = bakeTrain(rt);
    L.seats = [0, 1, 2, 3].map(function (i) { return null; });
    // voyageurs : celui du joueur monte en premier, puis les trois autres
    order = ['boy', 'girl', 'girl2', 'boy2'].filter(function (q) { return q !== chosen; }); order.unshift(chosen);
    L.walk = order.map(function (q) { return bakeWalk(q, Math.min(3, G.k * 1.3)); });
    L.seats = order.map(function (q, i) { return bakeSeat(q, i, rt); });
    built = true;
  }
  function free() { L = null; built = false; }
  function heroScaleEnd() { return Math.max(0.4, Math.min(G.railsY * 0.52 / 142, G.Vw * 1.8 / 400, (G.railsY - 174) / 175)); }

  function snapX(x) { return Math.round(x * G.k) / G.k; }
  function drawTile(ctx, T, scroll, y, alpha) {
    var Tw = T.w, x = (-scroll) % Tw; if (x < 0) { x += Tw; } x -= Tw; if (alpha < 1) { ctx.globalAlpha = alpha; }
    if (T.soft) { for (; x < G.Vw; x += Tw) { var a0 = snapX(x); ctx.drawImage(T.cv, 0.5, 0, T.cv.width - 1, T.cv.height, a0, y, snapX(x + Tw) - a0, T.h); } }   // tuiles translucides : jamais de recouvrement (pas de ligne de raccord)
    else { for (; x < G.Vw; x += Tw) { ctx.drawImage(T.cv, snapX(x), y, Tw + 0.8, T.h); } }
    if (alpha < 1) { ctx.globalAlpha = 1; }
  }
  function drawRegion(ctx, TV, TB, f, gap, fyf, fillV, fillB, rr, X, Y) {
    var y = G.railsY - gap - (TV ? TV.h : TB.h) - Y * fyf;
    if (rr < 0.999 && TV) { ctx.globalAlpha = 1 - rr; ctx.fillStyle = fillV; ctx.fillRect(0, y + TV.h - 0.5, G.Vw, G.Vh); ctx.globalAlpha = 1; drawTile(ctx, TV, X * f, y, 1 - rr); }
    if (rr > 0.001 && TB) { var yb = G.railsY - gap - TB.h - Y * fyf; ctx.globalAlpha = rr; ctx.fillStyle = fillB; ctx.fillRect(0, yb + TB.h - 0.5, G.Vw, G.Vh); ctx.globalAlpha = 1; drawTile(ctx, TB, X * f, yb, rr); if (TB === L.nearB && L.groundB) { drawTile(ctx, L.groundB, X * f, yb + TB.h - 0.6, rr); } }
  }

  var FIL = { farV: '#d3dde6', midV: '#315a3c', mid2V: '#3b6a43', nearV: '#3a6a3a', farB: '#8db39a', midB: '#4f8a4e', mid2B: '#4a8844', nearB: '#3a8a3a' };
  var CAP = [[0.9, 5.2, 'PUY DE DÔME · 1 465 m', 'Gare du sommet du Panoramique des Dômes'], [10.6, 16.2, 'LA CHAÎNE DES PUYS', 'Auvergne · volcans éteints, patrimoine mondial'], [23.6, 29.0, 'PAYS BASQUE', 'Cap sur le Pays basque']];
  var CAPF = '', CAPF2 = '';

  function drawCine(ctx, t) {
    var Vw = G.Vw, Vh = G.Vh, ry = G.railsY, i, k = G.k;
    var X = tab(XT, t), Y = tab(YT, t), rr = sst(21.2, 23.8, t), th = slopeAt(t), spd = speedAt(t) / VMAX;
    var aft = sst(7, 19, t), dusk = sst(18.5, 30.5, t);
    // ciel
    var skyH = ry - 96;
    ctx.drawImage(L.sky.morning, 0, 0, 4, 256, 0, 0, Vw, skyH);
    if (aft > 0.002) { ctx.globalAlpha = aft * (1 - dusk); ctx.drawImage(L.sky.noon, 0, 0, 4, 256, 0, 0, Vw, skyH); ctx.globalAlpha = 1; }
    if (dusk > 0.002) { ctx.globalAlpha = dusk; ctx.drawImage(L.sky.dusk, 0, 0, 4, 256, 0, 0, Vw, skyH); ctx.globalAlpha = 1; drawTile(ctx, L.stars, X * 0.01, 0, clamp((dusk - 0.35) * 1.5, 0, 1)); }
    // soleil : monte puis descend vers l'horizon, de plus en plus orangé
    var sx = lerp(Vw * 0.74, Vw * 0.24, sst(2, 31, t)), sy = lerp(ry * 0.33, ry - 140, Math.pow(sst(8, 31, t), 1.4)), sr = lerp(76, 96, dusk);
    ctx.globalAlpha = 1 - dusk * 0.9; ctx.drawImage(L.sunW, sx - sr, sy - sr, sr * 2, sr * 2); ctx.globalAlpha = dusk; ctx.drawImage(L.sunO, sx - sr * 1.2, sy - sr * 1.2, sr * 2.4, sr * 2.4); ctx.globalAlpha = 1;
    // nuages (deux bandes à vitesses différentes)
    var cy = Math.max(-30, ry - 340); drawTile(ctx, L.cloudsD, X * 0.03 + t * 3, cy, 1 - dusk);
    if (dusk > 0.002) { drawTile(ctx, L.cloudsH, X * 0.03 + t * 3, cy, dusk); }
    drawTile(ctx, L.cloudsD, X * 0.06 + t * 5 + 300, cy + 54, (1 - dusk) * 0.7); if (dusk > 0.002) { drawTile(ctx, L.cloudsH, X * 0.06 + t * 5 + 300, cy + 54, dusk * 0.7); }
    // mer (Pays basque) derrière les collines
    if (rr > 0.001) { drawTile(ctx, L.sea, X * 0.03 + t * 2.2, ry - 164, rr); }
    // plans lointains
    drawRegion(ctx, L.farV, L.farB, 0.05, 108, 0.05, FIL.farV, FIL.farB, rr, X, Y);
    // La Rhune : arrive par la droite (le train va vers la droite), grossit en approchant ; son petit train grimpe sur une voie qui épouse exactement la pente
    if (rr > 0.001 && t > 20) {
      var hp = sst(0, 1, (X - tab(XT, 21)) / (tab(XT, DECEL1) - tab(XT, 21))), hs = heroScaleEnd() * lerp(0.62, 1, hp), hw = RH.w * hs, hh = RH.h * hs;
      var sumX = lerp(Vw * 1.3, Vw * 0.64, hp), hx0 = sumX - RH.sx * hs, hy0 = ry - 150 - Y * 0.05 - RH.base * hs;
      ctx.globalAlpha = rr;
      var hk = L.hero.cv.width / RH.w, c0 = Math.max(0, Math.floor(-hx0 / hs) - 1), c1 = Math.min(RH.w, Math.ceil((Vw - hx0) / hs) + 1);   // ne dessine que la partie visible (rapide même sans GPU)
      if (c1 > c0) { ctx.drawImage(L.hero.cv, c0 * hk, 0, (c1 - c0) * hk, L.hero.cv.height, hx0 + c0 * hs, hy0, (c1 - c0) * hs, hh); }
      var tq = clamp((t - 21.4) / (DECEL1 - 21.4), 0, 1), tx = RH.xs + 6 + sst(0, 1, tq * 0.9 + 0.1 * tq) * (RH.xe - RH.xs - 34), ty = rhTrackY(tx), ta = rhAng(tx), tsc = hs * 1.15;
      ctx.save(); ctx.translate(hx0 + tx * hs, hy0 + (ty - 1.9) * hs); ctx.rotate(ta); ctx.drawImage(L.rtrain.cv, -20 * tsc, -12.8 * tsc, 40 * tsc, 14 * tsc); ctx.restore(); ctx.globalAlpha = 1;
    }
    drawRegion(ctx, L.midV, L.midB, 0.1, 98, 0.1, FIL.midV, FIL.midB, rr, X, Y);
    drawRegion(ctx, L.mid2V, L.mid2B, 0.22, 78, 0.17, FIL.mid2V, FIL.mid2B, rr, X, Y);
    drawRegion(ctx, L.nearV, L.nearB, 0.45, 54, 0.26, FIL.nearV, FIL.nearB, rr, X, Y);
    // gare du sommet (disparaît dans le défilement)
    var stx = G.xm - 150 + X * 0.9, sc = 1.5;
    if (stx < Vw + 10) { ctx.save(); ctx.translate(2 * G.xm, 0); ctx.scale(-1, 1); ctx.drawImage(L.station.cv, snapX(stx), ry - 18 - L.station.h * sc + 12 * sc, L.station.w * sc, L.station.h * sc); ctx.fillStyle = '#4c7a45'; ctx.fillRect(snapX(stx), ry - 18, L.station.w * sc, 24); ctx.restore(); }
    // sol sous la voie
    ctx.fillStyle = rr > 0.5 ? '#4d8f46' : '#6e8a4c'; ctx.globalAlpha = 1; ctx.fillRect(0, ry - 14, Vw, Vh);
    // brume de transition (derrière le train : on le voit traverser le brouillard)
    var m = Math.sin(Math.PI * clamp((t - MIST0) / (MIST1 - MIST0), 0, 1)); m = m * m;
    if (m > 0.003) { ctx.globalAlpha = m * 0.9; ctx.drawImage(L.haze, 0, 0, 4, 128, 0, ry - 330, Vw, 330 + (Vh - ry)); ctx.fillStyle = '#eef2f6'; ctx.fillRect(0, ry, Vw, Vh); ctx.globalAlpha = m; drawTile(ctx, L.mist, X * 1.6, ry - 250, m); drawTile(ctx, L.mist, X * 0.9 + 400, ry - 330, m * 0.8); ctx.globalAlpha = 1; }
    // ------- repère de la voie (incliné, pivot au centre du train) -------
    var sway = Math.sin(t * 2.3) * 0.0035 + Math.sin(t * 4.1 + 1) * 0.0018, jit = spd * (Math.sin(t * 31) * 0.28 + Math.sin(t * 47) * 0.18), lurch = (speedAt(t + 0.15) - speedAt(t - 0.15)) / VMAX * 0.045;
    ctx.save(); ctx.translate(G.xm, ry); ctx.rotate(th); ctx.scale(-1, 1);   // v0.5.2 : le train roule vers la DROITE, cabine en tête
    // voie + talus + poteaux (fond)
    if (rr < 0.999) { drawTile2(ctx, L.trackV, X, 70, 1 - rr); } if (rr > 0.001) { drawTile2(ctx, L.trackB, X, 70, rr); }
    // train
    ctx.save(); ctx.translate(0, jit * 0.12); ctx.rotate(sway * 0.8 + lurch);
    var trx = -132 * G.Zt - TR.ox * G.Zt, try_ = -TR.oy * G.Zt;
    ctx.drawImage(L.train.cv, snapX(trx), try_ - 0.0, TR.w * G.Zt, TR.h * G.Zt);
    for (i = 0; i < 4; i++) { var a2 = sst(seatT[i] + 0.15, seatT[i] + 0.9, t); if (seatT[i] > 0 && a2 > 0.001) { var S = L.seats[i], bob = Math.sin(t * 2.1 + i * 1.7) * 0.18 * spd; ctx.globalAlpha = a2; ctx.drawImage(S.cv, trx + (S.x + TR.ox) * G.Zt, try_ + (S.y + TR.oy + bob) * G.Zt, S.w * G.Zt, S.h * G.Zt); ctx.globalAlpha = 1; } }
    ctx.restore();
    // quai (gare) + voyageurs
    if (X < Vw + 700) { drawPlatform(ctx, X); drawHikers(ctx, t); }
    // plan avant rapide (dans le repère incliné, sur le talus)
    if (rr < 0.999) { drawTile2(ctx, L.frontV, X * 1.25, -34, 1 - rr); } if (rr > 0.001) { drawTile2(ctx, L.frontB, X * 1.25, -34, rr); }
    ctx.restore();
    // herbes du tout premier plan (bande basse, défile plus vite : parallaxe)
    var fy = Vh - 46 * 1.25 + 8; if (rr < 0.999) { drawTileS(ctx, L.frontV, X * 1.9, fy, 1.25, 1 - rr); } if (rr > 0.001) { drawTileS(ctx, L.frontB, X * 1.9, fy, 1.25, rr); }
    if (m > 0.003) { ctx.globalAlpha = m * 0.22; ctx.fillStyle = '#f2f5f8'; ctx.fillRect(0, 0, Vw, Vh); ctx.globalAlpha = 1; }
    if (dusk > 0.01) { ctx.globalAlpha = dusk * 0.2; ctx.fillStyle = '#ff7a50'; ctx.fillRect(0, 0, Vw, Vh); ctx.globalAlpha = dusk * 0.14; ctx.fillStyle = '#3a2a7a'; ctx.fillRect(0, 0, Vw, Vh); ctx.globalAlpha = 1; }
  }
  function drawTile2(ctx, T, scroll, v0, alpha) {   // tuile dans le repère de la voie : v=0 au niveau du rail
    var Tw = T.w, x = scroll % Tw; if (x < 0) { x += Tw; } x -= Tw + G.Vw * 0.55; if (alpha < 1) { ctx.globalAlpha = alpha; }
    for (; x < G.Vw * 0.6; x += Tw) { ctx.drawImage(T.cv, x, -v0, Tw + 0.8, T.h); }
    if (alpha < 1) { ctx.globalAlpha = 1; }
    // remplissage sous le talus (la voie est inclinée : on prolonge vers le bas)
    ctx.fillStyle = T === L.trackB ? '#2f5a30' : '#34502c';
    if (T === L.trackV || T === L.trackB) { if (alpha < 1) { ctx.globalAlpha = alpha; } ctx.fillRect(-G.Vw, T.h - v0 - 0.5, G.Vw * 2, G.Vh * 1.6); if (alpha < 1) { ctx.globalAlpha = 1; } }
  }
  function drawTileS(ctx, T, scroll, y, sc, alpha) {   // tuile à l'échelle sc, sans inclinaison (herbes du premier plan)
    var Tw = T.w * sc, x = (-scroll) % Tw; if (x < 0) { x += Tw; } x -= Tw; if (alpha < 1) { ctx.globalAlpha = alpha; }
    for (; x < G.Vw; x += Tw) { ctx.drawImage(T.cv, snapX(x), y, Tw + 0.8, T.h * sc); }
    if (alpha < 1) { ctx.globalAlpha = 1; }
  }
  function drawPlatform(ctx, X) {
    var P = L.platform, sc = 1, x = -G.Vw * 0.5 + X * 1.0 - 40;
    // le quai défile comme le sol, il n'existe qu'à la gare : on ne dessine que les tuiles encore visibles
    for (var k = 0; k < 3; k++) { var xx = x + k * P.w - P.w; if (xx < G.Vw * 0.6 && xx + P.w > -G.Vw * 0.6) { ctx.drawImage(P.cv, xx, 13, P.w + 0.6, P.h); } }
  }
  function drawPlatform2() {}
  /* ---------- voyageurs (marche vers la porte de la voiture de tête, puis ils s'assoient derrière les vitres) ---------- */
  function doorU() { return (132 - TR.door) * G.Zt; }   // abscisse ÉCRAN de la porte (le train est tourné vers la droite)
  function hkSpeed() { return clamp((G.Vw * 0.5 + 20 + doorU()) / 3.2, 38, 95); }
  function walkU(j, t) { var sp = hkSpeed(); return -G.Vw * 0.5 - 20 - j * sp * 0.8 + (t - 1.0) * sp; }
  var lastStepKey = -1;
  function drawHikers(ctx, t) {
    var du = doorU(), j, W = L.walk, sc = G.Zt * 0.92, footY = 24;
    for (j = 0; j < 4; j++) {
      if (t < 1.0) { break; }
      var u = walkU(j, t), W0 = W[j], gone = u >= du;
      if (gone) { if (seatT[j] === 0) { seatT[j] = t; } } else { seatT[j] = 0; }
      var fade = gone ? 1 - clamp((u - du) / 12, 0, 1) : 1; if (fade <= 0.001) { continue; }
      var cu = Math.min(u, du + 10), fi = Math.floor((((cu / 7.2) % 1) + 1) % 1 * W0.n) % W0.n, sw = W0.cv.width / W0.n;
      if (fade < 1) { ctx.globalAlpha = fade; }
      ctx.drawImage(W0.cv, fi * sw, 0, sw, W0.cv.height, snapX(-cu - W0.fw * 0.5 * sc), footY - (W0.fh - 5) * sc - (gone ? (u - du) * 0.25 : 0), W0.fw * sc, W0.fh * sc);
      if (fade < 1) { ctx.globalAlpha = 1; }
    }
  }

  /* ---------- écran « Niveau 7 — bientôt » : l'image de l'utilisateur, plein cadre, avec un lent travelling ---------- */
  function drawImageCover(ctx, cw, ch, tt, alpha) {
    if (!imgReady) { ctx.globalAlpha = alpha; ctx.fillStyle = '#1a1840'; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; return; }
    var iw = img.naturalWidth || IMG_W, ih = img.naturalHeight || IMG_H;
    var cov = Math.max(cw / iw, ch / ih), z = 1 + 0.07 * (1 - sst(0, 4.5, tt)), sc = cov * z, dw = iw * sc, dh = ih * sc;
    var rx = Math.max(0, dw - cw), ry = Math.max(0, dh - ch), mid = clamp(0.54 * dw - cw / 2, 0, rx);
    var pan = Math.sin(Math.max(0, tt - 1.5) * 0.12) * sst(1.5, 5, tt);
    var x = clamp(mid + pan * rx * 0.42, 0, rx), y = ry * 0.5;
    if (alpha < 1) { ctx.globalAlpha = alpha; }
    ctx.drawImage(bmp || img, -x - (dw * (z - 1) / z) * 0.0, -y, dw, dh);
    if (alpha < 1) { ctx.globalAlpha = 1; }
    // léger vignettage
    ctx.globalAlpha = alpha * 0.9; ctx.drawImage(vig(), 0, 0, 64, 64, 0, 0, cw, ch); ctx.globalAlpha = 1;
  }
  var _vig = null;
  function vig() { if (!_vig) { _vig = cv(64, 64); var x = _vig.getContext('2d'), g = x.createRadialGradient(32, 32, 14, 32, 32, 46); g.addColorStop(0, 'rgba(8,6,30,0)'); g.addColorStop(1, 'rgba(8,6,30,.55)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); } return _vig; }

  function drawCaptions(ctx, t) {
    var q, Vw = G.Vw, y = Math.max(34, G.Vh * 0.09), fs = clamp(Vw / 30, 8.5, 12);
    for (q = 0; q < CAP.length; q++) {
      var c = CAP[q], a = sst(c[0], c[0] + 0.9, t) * (1 - sst(c[1] - 0.9, c[1], t)); if (a < 0.01) { continue; }
      ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = fs + 'px "Press Start 2P", monospace'; var w1 = ctx.measureText(c[2]).width; ctx.font = (fs * 0.62) + 'px "Press Start 2P", monospace'; var w2 = ctx.measureText(c[3]).width, w = Math.min(Vw - 12, Math.max(w1, w2) + 22), ph = fs * 3.3;
      ctx.fillStyle = 'rgba(14,18,51,.62)'; ctx.fillRect(Vw / 2 - w / 2, y - ph / 2, w, ph); ctx.fillStyle = '#ffd34d'; ctx.fillRect(Vw / 2 - w / 2, y - ph / 2, w, 1.2); ctx.fillRect(Vw / 2 - w / 2, y + ph / 2 - 1.2, w, 1.2);
      ctx.font = fs + 'px "Press Start 2P", monospace'; ctx.fillStyle = '#1a1420'; ctx.fillText(c[2], Vw / 2 + 0.8, y - fs * 0.55 + 0.8, Vw - 20); ctx.fillStyle = '#ffd34d'; ctx.fillText(c[2], Vw / 2, y - fs * 0.55, Vw - 20);
      ctx.font = (fs * 0.62) + 'px "Press Start 2P", monospace'; ctx.fillStyle = '#f4efe2'; ctx.fillText(c[3], Vw / 2, y + fs * 0.75, Vw - 20);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- API ---------- */
  var sfxRef = function () { return window.Sfx; };
  var bmp = null;
  function loadImg() {
    if (imgReady || imgLoading) { return; } imgLoading = true;
    var m = window.__MAPIMG, i = new Image(); i.onload = function () { img = i; imgReady = true; mkBmp(); }; i.onerror = function () { imgLoading = false; };
    i.src = (m && m.niveau7) ? m.niveau7 : 'assets/map/niveau7.webp';
  }
  function mkBmp() {   // image décodée une fois pour toutes (un décodage WebP répété à chaque image fait ramer / clignoter certains WebView)
    if (bmp || !imgReady || !window.createImageBitmap) { return; }
    try { window.createImageBitmap(img).then(function (b) { if (mode === 'off') { try { b.close(); } catch (e) {} } else { bmp = b; } }, function () {}); } catch (e) {}
  }
  function dropBmp() { if (bmp) { try { bmp.close(); } catch (e) {} bmp = null; } }

  /* ---------- construction sûre, qualité adaptative, secours ---------- */
  function tryBuild() {
    var t0 = performance.now(); bpix = 0;
    try { build(); } catch (e) { warn('construction impossible', e); free(); return false; }
    st.buildMs = performance.now() - t0; st.pix = bpix;
    if (bpix > QL[lvl].tot && lvl < 3) { warn('budget mémoire dépassé (' + Math.round(bpix / 1e5) / 10 + ' Mpx)'); free(); return false; }
    return true;
  }
  function lowerQ(why, soft) {   // soft : ralentissement léger -> baisse pour ce voyage seulement (non mémorisée)
    if (lvl >= 3) { return false; }
    lvl++; if (!soft) { saveLvl(); } free(); warn('qualité réduite -> ' + lvl + ' (' + why + ')');
    layout(G.W, G.H, Math.min(G.d, QL[lvl].dpr)); if (hook) { try { hook(); } catch (e) {} }
    if (st) { st.skipF = 25; st.fAcc = 0; st.fN = 0; st.lowered = (st.lowered || 0) + 1; }
    return true;
  }
  function rebuild() { for (;;) { if (tryBuild()) { return true; } if (!lowerQ('construction')) { return false; } } }
  function clearWd() { if (wdTimer) { clearInterval(wdTimer); wdTimer = 0; } }
  function abort(why) {   // secours : on quitte l'animation et on file directement vers la suite (carte du monde 2), sans jamais figer le joueur
    if (!st || st.finished) { return; }
    warn('animation abandonnée (' + why + ')'); st.aborted = why; clearWd();
    var Sf = sfxRef(); try { if (Sf) { Sf.cineStop(); } } catch (e) {}
    mode = 'soon'; free(); finish();
  }
  function fail(e) {
    if (!st || mode === 'off') { return; }
    st.errs = (st.errs || 0) + 1; st.rescue = true; warn('erreur de rendu', e);
    if (st.errs >= 3 || mode === 'soon') { abort('erreurs répétées'); } else { st.needLower = true; }
  }
  function resetCtx(c) {
    try { for (var i = 0; i < 16; i++) { c.restore(); } c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)'; } catch (e) {}
  }
  function wdTick() {
    if (mode !== 'cine' || !st || st.finished) { return; }
    var now = performance.now(); if (document.hidden) { st.lastFrame = now; return; }
    var idle = now - st.lastFrame; if (idle > 3000) { st.rescue = true; } if (idle > 9000) { abort('image figée'); }
  }

  function start(W, H, d, o) {
    o = o || {}; loadImg(); mkBmp(); lvl = loadLvl(); lostFlag = false;
    var sv = window.Save && window.Save.get(); chosen = (sv && sv.character) || 'boy';
    if (!XT) { tables(); }
    layout(W, H, Math.min(d, QL[lvl].dpr)); free(); mode = 'cine'; onEndCb = o.onEnd || null; lastStepKey = -1; seatT = [0, 0, 0, 0];
    st = { t: 0, replay: !!o.replay, pending: true, skipT: -1, post: 0, finished: false, ev: 0, snd: false, wall: 0, skipF: 25, fAcc: 0, fN: 0, lastFrame: performance.now(), rescue: false, errs: 0 };
    clearWd(); wdTimer = setInterval(wdTick, 1000);
  }
  function finish() {
    if (st.finished) { return; } st.finished = true; clearWd(); var f = onEndCb; onEndCb = null;
    if (f) { try { f(); } catch (e) { warn('fin d\'animation', e); } }
  }
  function upd(dt, raw) {
    var now = performance.now();
    if (mode === 'cine') {
      if (st.pending) {
        if (st.waited) { if (!rebuild()) { abort('construction'); return; } st.pending = false; st.t = 0; st.lastFrame = performance.now(); }
        st.waited = true; return;
      }
      if (st.needLower) { st.needLower = false; if (lowerQ('erreur de rendu') && !rebuild()) { abort('construction'); return; } if (!built && !rebuild()) { abort('construction'); return; } }
      if (lostFlag || st.revive) {
        lostFlag = false; st.revive = false; st.revives = (st.revives || 0) + 1; free();
        if (st.revives >= 2) { lowerQ('contexte perdu'); } if (!rebuild()) { abort('contexte perdu'); return; }
      }
      if (st.want && now >= st.want.at) { var w = st.want; st.want = null; layout(w.W, w.H, Math.min(w.d, QL[lvl].dpr)); free(); if (!rebuild()) { abort('construction'); return; } }
      if (!built) { if (!rebuild()) { abort('construction'); return; } }
      var Sf = sfxRef(), rw = Math.min(raw, 0.25); st.wall += rw;
      // surveillance : cadence, retard sur l'horloge réelle, durée totale
      if (st.skipF > 0) { st.skipF--; } else {
        st.fAcc += Math.min(raw, 0.5); st.fN++;
        if (st.fN >= 36 || st.fAcc >= 1.8) {
          var av = st.fAcc / st.fN; st.fAcc = 0; st.fN = 0;
          if (av > 0.042 && st.t < IMG0 - 1) { if (lowerQ('lent ' + Math.round(1 / av) + ' i/s', av < 0.066)) { if (!rebuild()) { abort('construction'); return; } } else if (av > 0.12) { st.rescue = true; } }
        }
      }
      if (!st.rescue && (st.wall - st.t > 8 || st.wall > DUR + 12)) { st.rescue = true; }
      if (st.wall - st.t > 24 || st.wall > DUR + 30) { abort('trop lent'); return; }
      if (st.skipT >= 0) {
        st.skipT += dt; if (st.skipT >= 0.38) { st.t = IMG1 + 0.01; st.skipT = -1; st.post = 0.0001; mode = 'soon'; try { if (Sf) { Sf.cineStop(); } } catch (e) {} free(); finish(); }
      } else {
        st.t += dt;
        var t = st.t;
        if (Sf && !st.noSnd) {
          try {
            var sp = speedAt(t) / VMAX, rk = clamp((1 - sst(15, 20.5, t)) + 0.8 * sst(26.5, 29, t), 0, 1);
            Sf.cine({ speed: sp * (1 - 0.7 * sst(IMG0, IMG1, t)), rack: rk });
            if (!(st.ev & 1) && t >= DEPART - 1.0) { st.ev |= 1; Sf.play('bell'); }
            if (!(st.ev & 2) && t >= DEPART - 0.3) { st.ev |= 2; Sf.play('train'); }
            if (!(st.ev & 4) && t >= IMG0 + 0.2) { st.ev |= 4; Sf.play('chord'); }
            if (t > 1.0 && t < DEPART - 0.5 && L) { var k = Math.floor(walkU(0, t) / 3.6); if (k !== lastStepKey) { lastStepKey = k; if (walkU(0, t) < doorU() + 4 || walkU(3, t) < doorU() + 4) { Sf.step('concrete'); } } }
          } catch (e) { st.sfxErr = (st.sfxErr || 0) + 1; if (st.sfxErr >= 3) { st.noSnd = true; } }   // un souci audio ne doit jamais bloquer la chronologie
        }
        if (t >= DUR) { mode = 'soon'; try { if (Sf) { Sf.cineStop(); } } catch (e) {} finish(); }
      }
    } else if (mode === 'soon') {
      st.t += dt; if (st.post > 0) { st.post += dt; if (st.post > 0.6) { st.post = 0; } }
      if (L && st.t > IMG1 + 0.3) { free(); }
    }
  }
  function update(dt, raw) {
    if (mode === 'off' || !st) { return; }
    if (raw == null) { raw = dt; } st.lastFrame = performance.now();
    try { upd(dt, raw); } catch (e) { fail(e); }
  }
  function drawIn(ctx, W, H, d) {
    var cw = Math.round(W * d), ch = Math.round(H * d);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';
    if (mode === 'cine') {
      if (st.pending || !built) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); if (st.t < 0.01) { ctx.fillStyle = '#ffd34d'; ctx.font = Math.round(12 * d) + 'px "Press Start 2P", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Le train arrive…', cw / 2, ch / 2); } return; }
      var t = st.t, a = sst(IMG0, IMG1, t);
      if (a < 0.999) { ctx.setTransform(G.k, 0, 0, G.k, 0, 0); drawCine(ctx, t); drawCaptions(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0); }
      if (a > 0.001) { drawImageCover(ctx, cw, ch, Math.max(0, t - IMG0), a); }
      var b = 1 - sst(0, 0.9, t); if (st.skipT >= 0) { b = Math.max(b, st.skipT / 0.38); }
      if (b > 0.002) { ctx.globalAlpha = b; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
    } else {
      drawImageCover(ctx, cw, ch, Math.max(0, st.t - IMG0), 1);
      if (st.post > 0) { ctx.globalAlpha = 1 - clamp(st.post / 0.6, 0, 1); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
    }
  }
  function draw(ctx, W, H, d) {
    if (mode === 'off' || !st) { return; }
    try { drawIn(ctx, W, H, d); } catch (e) { resetCtx(ctx); fail(e); }
  }
  function skip() { if (mode === 'cine' && st && (st.replay || st.rescue) && st.skipT < 0 && !st.pending) { st.skipT = 0; return true; } return false; }
  function stop() { var Sf = sfxRef(); try { if (Sf) { Sf.cineStop(); } } catch (e) {} clearWd(); mode = 'off'; st = null; free(); onEndCb = null; dropBmp(); }
  function showSoon(W, H, d) {   // ouvre directement l'écran « bientôt » (sans animation)
    loadImg(); mkBmp(); layout(W, H, d); free(); mode = 'soon'; st = { t: IMG1 + 0.01, replay: true, pending: false, skipT: -1, post: 0.0001, finished: true, ev: 7, wall: 0, lastFrame: performance.now() };
  }
  function resizeTo(W, H, d) {
    if (mode === 'off' || !st) { return; }
    if (mode === 'cine' && !st.pending) {
      var cur = st.want || { W: G.W, H: G.H, d: G.d };
      if (Math.abs(cur.W - W) < 1 && Math.abs(cur.H - H) < 1 && Math.abs(cur.d - d) < 0.01) { return; }
      st.want = { W: W, H: H, d: d, at: performance.now() + 250 };   // reconstruction différée : les rafales d'événements « resize » d'Android ne relancent plus tout à chaque fois
    } else { layout(W, H, Math.min(d, QL[lvl].dpr)); }
  }
  window.Cine = {
    start: start, update: update, draw: draw, skip: skip, stop: stop, showSoon: showSoon, preload: loadImg,
    active: function () { return mode === 'cine'; }, soon: function () { return mode === 'soon'; }, mode: function () { return mode; },
    canSkip: function () { return !!(st && (st.replay || st.rescue) && mode === 'cine' && !st.pending); }, rescue: function () { return !!(st && st.rescue && mode === 'cine'); },
    prepare: function () { lvl = loadLvl(); }, dprCap: function () { return QL[lvl].dpr; }, level: function () { return lvl; }, setHook: function (f) { hook = f; }, revive: function () { if (st) { st.revive = true; } }, fail: fail, isReplay: function () { return !!(st && st.replay); },
    resize: resizeTo,
    duration: DUR,
    _seek: function (t) { if (st) { st.t = t; st.skipT = -1; if (mode === 'soon' && t < DUR) { mode = 'cine'; } } },
    _state: function () { return st ? { t: st.t, mode: mode, replay: st.replay, pending: st.pending, built: built, buildMs: st.buildMs, seat: seatT.slice(), G: { s: G.s, Vw: G.Vw, Vh: G.Vh, rs: G.rs, Zt: G.Zt } } : { mode: mode }; },
    _times: { DEPART: DEPART, ACC_END: ACC_END, MIST0: MIST0, MIST1: MIST1, IMG0: IMG0, IMG1: IMG1, DUR: DUR }
  };
})();
