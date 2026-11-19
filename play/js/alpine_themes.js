/* v0.17.3 — configurations des 4 thèmes (voir alpine.js). Mary et Sancy : silhouettes tracées, profondeur et raccords. Sol identique à v0.16.14. Autres thèmes inchangés. */
(function () {
  'use strict';
  var H0 = window.AlpineHelpers, peaks = H0.peaks, coneAt = H0.coneAt, domeAt = H0.domeAt, A = window.Art, S = window.Scenery;
  function nzf(E, s, k, a) { return function (u) { return a + k * E.nz(u / s, 7); }; }
  function ss(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function mixc(E, a, b, t) { return E.mix(a, b, t); }
  function boardIf(c, E, xa, xb, x, lines, w, h, sz, dy) { if (xb > x - 8 && xa < x + w + 8) { var gi = Math.max(0, Math.min(E.len, (x + w / 2) | 0)), g = E.G[gi], gs; for (gs = 1; !isFinite(g) && gs < 400; gs++) { g = E.G[Math.max(0, gi - gs)]; if (!isFinite(g)) { g = E.G[Math.min(E.len, gi + gs)]; } } if (!isFinite(g)) { return; } E.board(c, x, g - (dy || 33), w, h, lines, sz || 3.4); } }

  /* ----------------------------------------------------------------- objets du carnet (dessinés autour de (0,0), rayon ≈ 6) */
  function outline(c, w, col) { c.lineWidth = w || 0.7; c.strokeStyle = col || '#2a1a28'; c.stroke(); }
  var FINDS = {
    trachyte: function (c) {
      c.beginPath(); c.moveTo(-6, 2.6); c.lineTo(-4.4, -2.4); c.lineTo(-0.6, -5.6); c.lineTo(1.4, -2.4); c.lineTo(5, -3); c.lineTo(6.4, 1.2); c.lineTo(3.6, 3.6); c.lineTo(-3.4, 3.8); c.closePath();
      c.fillStyle = A.grad(c, 0, -5, 0, 4, [0, '#e2dccb', 1, '#8f8778']); c.fill(); outline(c, 0.7, '#3a352c');
      c.fillStyle = 'rgba(70,64,52,.55)'; [[-2.6, -0.6, 0.8], [1.6, 0, 0.9], [3.4, 1.6, 0.6], [-0.4, 1.8, 0.7]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 7); c.fill(); });
      c.strokeStyle = 'rgba(255,250,230,.6)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3.8, -1.8); c.lineTo(-0.7, -5); c.stroke();
    },
    gentiane: function (c, f, E) {
      var sw = Math.sin(E.time * 2 + f.ph) * 0.5;
      c.strokeStyle = '#3f7a32'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(0, 5.4); c.lineTo(sw * 0.4, -3); c.stroke();
      c.fillStyle = '#4f9a3c'; c.beginPath(); c.ellipse(-3, 3.6, 3.4, 1.2, -0.5, 0, 7); c.ellipse(3, 3.6, 3.4, 1.2, 0.5, 0, 7); c.fill();
      c.beginPath(); c.ellipse(-2.4, 0.8, 2.6, 1, -0.4, 0, 7); c.ellipse(2.6, 0.8, 2.6, 1, 0.4, 0, 7); c.fill();
      [[0, -5.2], [-2.8, -3.4], [2.8, -3.4], [0, -2]].forEach(function (q, i) {
        c.save(); c.translate(q[0] + sw * 0.4, q[1]); c.fillStyle = '#f4cf2a'; for (var k = 0; k < 6; k++) { c.rotate(Math.PI / 3); c.beginPath(); c.ellipse(0, -1.5, 0.7, 1.6, 0, 0, 7); c.fill(); } c.fillStyle = '#b5791a'; c.beginPath(); c.arc(0, 0, 0.7, 0, 7); c.fill(); c.restore();
      });
    },
    coco: function (c) {
      c.save(); c.rotate(-0.18);
      c.beginPath(); c.moveTo(-6.4, -2.6); c.lineTo(6.4, -2.6); c.lineTo(6.4, 2.6); c.lineTo(-6.4, 2.6); c.closePath();
      c.fillStyle = A.grad(c, 0, -2.6, 0, 2.6, [0, '#c1915a', 0.5, '#8d6236', 1, '#4f3419']); c.fill(); outline(c, 0.7, '#2a180c');
      c.strokeStyle = 'rgba(40,24,10,.55)'; c.lineWidth = 0.4; for (var i = -5.6; i < 6; i += 1.3) { c.beginPath(); c.moveTo(i, -2.4); c.lineTo(i + 1.3, 2.4); c.stroke(); }
      c.strokeStyle = '#d8c9a0'; c.lineWidth = 0.8; [-3.4, 3.4].forEach(function (x) { c.beginPath(); c.moveTo(x, -2.7); c.lineTo(x, 2.7); c.stroke(); });
      c.fillStyle = '#6b4a28'; c.beginPath(); c.ellipse(6.4, 0, 1.1, 2.6, 0, 0, 7); c.fill(); outline(c, 0.5, '#2a180c');
      c.strokeStyle = '#b08a52'; c.lineWidth = 0.4; c.beginPath(); c.arc(6.4, 0, 0.6, 0, 7); c.stroke();
      c.restore();
    },
    domite: function (c) {
      c.beginPath(); c.moveTo(-5.8, 2); c.bezierCurveTo(-6.2, -3, -2.4, -5.2, 1.4, -4.6); c.bezierCurveTo(5.4, -4.2, 6.6, -0.8, 5.4, 2.6); c.lineTo(-3.4, 3.8); c.closePath();
      c.fillStyle = A.grad(c, 0, -5, 0, 4, [0, '#ecebe4', 1, '#9d9a90']); c.fill(); outline(c, 0.7, '#3a3832');
      c.fillStyle = 'rgba(40,40,44,.75)'; [[-2.4, -1.6, 0.5], [0.6, -2.8, 0.45], [2.8, -0.4, 0.55], [-0.6, 0.8, 0.5], [-3.4, 1.4, 0.4], [1.8, 2, 0.45]].forEach(function (q) { c.fillRect(q[0] - q[2], q[1] - q[2] * 0.6, q[2] * 2, q[2] * 1.3); });
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3.6, -2.8); c.quadraticCurveTo(-1, -4.6, 1.2, -4.3); c.stroke();
    },
    pascal: function (c, f, E) {
      c.fillStyle = A.grad(c, -5, 0, 5, 0, [0, '#a9794a', 1, '#6d4727']); c.fillRect(-4.2, -6, 8.4, 12); outline(c, 0.6, '#2c1a0c');
      c.fillStyle = '#dcd2b8'; c.fillRect(-2.7, -5, 1.3, 9.5);
      c.strokeStyle = 'rgba(80,50,20,.7)'; c.lineWidth = 0.3; for (var i = 0; i < 8; i++) { c.beginPath(); c.moveTo(-2.7, -4.6 + i * 1.2); c.lineTo(-1.5, -4.6 + i * 1.2); c.stroke(); }
      c.fillStyle = 'rgba(210,235,250,.9)'; c.fillRect(-0.6, -5.4, 1.6, 10); c.fillStyle = A.grad(c, 0, 0, 0, 6, [0, '#e8edf2', 1, '#8b95a2']); c.fillRect(-0.6, -1.4, 1.6, 6);
      c.beginPath(); c.arc(0.2, 5.4, 1.6, 0, 7); c.fillStyle = A.grad(c, 0, 4, 0, 7, [0, '#f1f4f8', 1, '#737f8e']); c.fill(); outline(c, 0.4, '#2c3440');
      c.fillStyle = '#e04030'; c.fillRect(2.4, -4.6, 1.2, 0.9);
    },
    mercure: function (c, f, E) {
      c.fillStyle = A.grad(c, -5, 0, 5, 0, [0, '#f0e3c2', 0.55, '#d2bf93', 1, '#8f7c58']); c.fillRect(-4, -4.6, 8, 9.4); outline(c, 0.6, '#4a3a22');
      c.strokeStyle = 'rgba(90,70,40,.6)'; c.lineWidth = 0.4; [-2.4, -0.8, 0.8, 2.4].forEach(function (x) { c.beginPath(); c.moveTo(x, -3.8); c.lineTo(x, 4); c.stroke(); });
      c.fillStyle = '#e4d3a8'; c.fillRect(-5, -6.2, 10, 1.8); outline(c, 0.5, '#4a3a22'); c.fillRect(-5, 4.6, 10, 1.4); outline(c, 0.5, '#4a3a22');
      c.fillStyle = '#3d86c8'; c.beginPath(); c.moveTo(2.2, -9); c.lineTo(5.4, -7.6); c.lineTo(2.4, -7); c.closePath(); c.fill();     // aile : emblème de Mercure
      c.fillStyle = '#f3f6fa'; c.beginPath(); c.moveTo(2.2, -9); c.lineTo(-0.6, -7.2); c.lineTo(2.6, -7.4); c.closePath(); c.fill();
    },
    sancyite: function (c) {
      c.beginPath(); c.moveTo(-6, 2.2); c.lineTo(-4.6, -2.8); c.lineTo(-0.4, -4.8); c.lineTo(4.6, -3.2); c.lineTo(6.4, 1); c.lineTo(3.2, 3.6); c.lineTo(-3.6, 3.8); c.closePath();
      c.fillStyle = A.grad(c, 0, -5, 0, 4, [0, '#a9a6b6', 1, '#4c4a5c']); c.fill(); outline(c, 0.7, '#1d1c28');
      c.fillStyle = 'rgba(236,232,222,.85)'; [[-2.6, -1.4], [0.4, -2.6], [2.8, 0], [-0.8, 1.2], [-3.4, 1.4]].forEach(function (q) { c.fillRect(q[0] - 0.9, q[1] - 0.45, 1.8, 0.9); });
      c.strokeStyle = 'rgba(235,242,255,.65)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3.8, -2.4); c.lineTo(-0.2, -4.4); c.stroke();
    },
    soldanelle: function (c, f, E) {
      var sw = Math.sin(E.time * 2.1 + f.ph) * 0.4;
      c.fillStyle = '#4a8a3a'; c.beginPath(); c.ellipse(-3, 4.3, 2.6, 1.7, -0.3, 0, 7); c.ellipse(3, 4.3, 2.6, 1.7, 0.3, 0, 7); c.ellipse(0, 4.8, 2, 1.4, 0, 0, 7); c.fill(); outline(c, 0.4, '#1f4a1c');
      c.strokeStyle = '#4a8a3a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(sw, -1, sw * 1.3, -4); c.stroke();
      [[-2.4, -1.4, -0.3], [2.4, -2.2, 0.3], [0, -4.2, 0]].forEach(function (q) {
        c.save(); c.translate(q[0] + sw, q[1]); c.rotate(q[2]);
        c.beginPath(); c.moveTo(-1.8, -1.4); c.lineTo(1.8, -1.4); c.lineTo(2.6, 2.2); c.lineTo(1.4, 1.4); c.lineTo(0.5, 2.4); c.lineTo(-0.5, 1.4); c.lineTo(-1.4, 2.4); c.lineTo(-2.6, 2.2); c.closePath();
        c.fillStyle = A.grad(c, 0, -1.4, 0, 2.4, [0, '#c7a6e6', 1, '#7b4fb0']); c.fill(); outline(c, 0.4, '#3a2358'); c.restore();
      });
    },
    asterocarpe: function (c, f, E) {
      c.fillStyle = '#3f7a38'; c.beginPath(); c.ellipse(0, 2.8, 6, 3.4, 0, Math.PI, 0); c.lineTo(6, 3.6); c.lineTo(-6, 3.6); c.closePath(); c.fill(); outline(c, 0.6, '#1c3a1a');
      c.fillStyle = '#68b04a'; c.beginPath(); c.ellipse(-0.8, 1.6, 4.2, 2, 0, Math.PI, 0); c.fill();
      [[-3.4, 0.8], [-0.4, -0.8], [2.8, 0.4], [4.4, 2], [-4.8, 2.2], [1, 1.8]].forEach(function (q) { c.fillStyle = '#f6d32c'; c.beginPath(); c.arc(q[0], q[1], 1, 0, 7); c.fill(); c.fillStyle = '#c78a14'; c.beginPath(); c.arc(q[0], q[1], 0.4, 0, 7); c.fill(); });
    },
    pipit: function (c, f, E) {
      var bob = Math.sin(E.time * 6 + f.ph) * 0.4;
      c.save(); c.translate(0, bob);
      c.fillStyle = '#6d5a42'; c.beginPath(); c.moveTo(-6.2, 1.8); c.lineTo(-2.6, 0.2); c.lineTo(-2.6, 2.4); c.closePath(); c.fill(); outline(c, 0.4, '#2a1f14');   // queue
      c.beginPath(); c.ellipse(0, 0.6, 4.6, 3, -0.15, 0, 7); c.fillStyle = A.grad(c, 0, -3, 0, 4, [0, '#8a7456', 1, '#6a5640']); c.fill(); outline(c, 0.6, '#2a1f14');
      c.beginPath(); c.ellipse(1.2, 1.6, 2.7, 1.6, -0.15, 0, 7); c.fillStyle = '#eadfc6'; c.fill();
      c.fillStyle = 'rgba(70,52,34,.8)'; [[0, 1.2], [1.4, 0.9], [2.6, 1.6], [0.6, 2.4]].forEach(function (q) { c.fillRect(q[0] - 0.2, q[1] - 0.2, 0.5, 0.9); });
      c.beginPath(); c.arc(3.8, -1.6, 2.2, 0, 7); c.fillStyle = '#8a7456'; c.fill(); outline(c, 0.6, '#2a1f14');
      c.fillStyle = '#e9d9a0'; c.beginPath(); c.moveTo(5.8, -1.7); c.lineTo(7.8, -1.2); c.lineTo(5.8, -0.9); c.closePath(); c.fill(); outline(c, 0.3, '#2a1f14');
      c.fillStyle = '#10100c'; c.beginPath(); c.arc(4.4, -2, 0.45, 0, 7); c.fill();
      c.strokeStyle = '#6a4a38'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-0.6, 3.4); c.lineTo(-0.6, 5.4); c.moveTo(1, 3.4); c.lineTo(1.2, 5.4); c.stroke();
      c.restore();
    },
    chamois: function (c) {
      c.beginPath(); c.moveTo(-3.6, 6); c.lineTo(-2.8, 0.4); c.quadraticCurveTo(-2.4, -3.6, 0.4, -4.4); c.quadraticCurveTo(4.2, -4.4, 5.6, -1); c.lineTo(6.6, 0.6); c.lineTo(5.2, 1.6); c.quadraticCurveTo(3.2, 2.4, 2.2, 3.4); c.lineTo(2, 6); c.closePath();
      c.fillStyle = A.grad(c, 0, -4, 0, 6, [0, '#c9a46c', 1, '#8a6a3c']); c.fill(); outline(c, 0.6, '#2c1c0c');
      c.fillStyle = '#f2ead6'; c.beginPath(); c.moveTo(3.2, -4.2); c.lineTo(5.6, -1); c.lineTo(4.6, 0.8); c.lineTo(2.4, 1.2); c.lineTo(2.8, -1.6); c.closePath(); c.fill();
      c.fillStyle = '#231a12'; c.beginPath(); c.moveTo(2.6, -2.6); c.lineTo(5.6, -1.6); c.lineTo(5.4, -0.4); c.lineTo(2.6, -1.2); c.closePath(); c.fill();
      c.strokeStyle = '#231a12'; c.lineWidth = 0.9; c.lineCap = 'round'; c.beginPath(); c.moveTo(0.4, -4.2); c.lineTo(0.6, -7.2); c.quadraticCurveTo(0.8, -8.4, -1.4, -8); c.stroke();
      c.beginPath(); c.moveTo(2, -4.2); c.lineTo(2.4, -7.2); c.quadraticCurveTo(2.6, -8.4, 0.6, -8.2); c.stroke();
      c.beginPath(); c.arc(3.8, -2.2, 0.45, 0, 7); c.fillStyle = '#fff'; c.fill();
    },
    cremaillere: function (c) {
      c.fillStyle = '#4a4540'; c.fillRect(-6.6, 2.8, 13.2, 1.5);
      [-5.4, -2.2, 1, 4.2].forEach(function (x) { c.fillStyle = '#6a4a30'; c.fillRect(x - 0.9, 2.2, 1.8, 3.6); });
      c.fillStyle = A.grad(c, 0, -3, 0, 3, [0, '#d7dce2', 1, '#7d8794']); c.fillRect(-6.6, -0.6, 13.2, 2.4); outline(c, 0.5, '#2a2e36');
      c.fillStyle = '#c2c8d0'; for (var i = -6; i < 6.4; i += 1.7) { c.beginPath(); c.moveTo(i, -0.6); c.lineTo(i + 0.7, -2.6); c.lineTo(i + 1.4, -0.6); c.closePath(); c.fill(); }
      c.strokeStyle = '#2a2e36'; c.lineWidth = 0.4; c.beginPath(); for (i = -6; i < 6.4; i += 1.7) { c.moveTo(i, -0.6); c.lineTo(i + 0.7, -2.6); c.lineTo(i + 1.4, -0.6); } c.stroke();
    }
  };

  /* ------------------------------------------------------------------------------------- helpers de décor communs */
  function rocksBehind(E, H, c, xa, xb, spacing, dens, mFn, rMin, rMax) {
    for (var x = Math.floor(xa / spacing) * spacing; x < xb + spacing; x += spacing) {
      var h = E.hash(x, 301); if (h > dens(x)) { continue; }
      var rx = x + h * spacing, r = rMin + (rMax - rMin) * E.hash(x, 303);
      /* v0.4.1 : la pierre est enfoncée dans le sol (centre au-dessus du point le plus haut du terrain sous elle, le terrain dessiné ensuite masque le bas) */
      var gtop = Math.min(H.gf(rx - r * 0.9), H.gf(rx), H.gf(rx + r * 0.9)), ry = gtop - r * (0.18 + 0.2 * E.hash(x, 302));
      if (!isFinite(ry)) { continue; }
      A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
    }
  }
  function pylon(c, E, x, base, h) {        // pylône de l'émetteur : treillis rouge et blanc
    var w = h * 0.07, i, n = 14;
    c.lineWidth = 0.9; c.lineCap = 'butt';
    for (i = 0; i < n; i++) {
      var y0 = base - h * i / n, y1 = base - h * (i + 1) / n, wa = w * (1 - i / n * 0.7), wb = w * (1 - (i + 1) / n * 0.7), col = i % 2 ? '#f2f0ea' : '#d6352b';
      c.strokeStyle = col; c.beginPath(); c.moveTo(x - wa, y0); c.lineTo(x - wb, y1); c.moveTo(x + wa, y0); c.lineTo(x + wb, y1); c.stroke();
      c.lineWidth = 0.6; c.beginPath(); c.moveTo(x - wa, y0); c.lineTo(x + wb, y1); c.moveTo(x + wa, y0); c.lineTo(x - wb, y1); c.stroke(); c.lineWidth = 0.9;
    }
    c.fillStyle = '#e8e6e0'; c.fillRect(x - 0.5, base - h - 8, 1, 8);
    c.fillStyle = 'rgba(255,60,40,' + (0.6 + 0.4 * Math.sin(E.time * 3)) + ')'; c.beginPath(); c.arc(x, base - h - 8.5, 1, 0, 7); c.fill();
  }
  function tableOrient(c, E, x, gy) {        // table d'orientation : disque de pierre sur un socle
    c.fillStyle = 'rgba(25,20,28,.28)'; c.beginPath(); c.ellipse(x, gy + 0.5, 11, 1.8, 0, 0, 7); c.fill();
    c.fillStyle = A.grad(c, x - 8, 0, x + 8, 0, [0, '#a29c90', 1, '#6d6860']); c.fillRect(x - 6, gy - 8, 12, 8.5); c.strokeStyle = '#2a2622'; c.lineWidth = 0.6; c.strokeRect(x - 6, gy - 8, 12, 8.5);
    c.beginPath(); c.ellipse(x, gy - 8.2, 9.6, 2.6, 0, 0, 7); c.fillStyle = A.grad(c, 0, gy - 11, 0, gy - 6, [0, '#d8d2c2', 1, '#a9a290']); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(70,56,40,.7)'; c.lineWidth = 0.35; c.beginPath(); c.ellipse(x, gy - 8.2, 6.4, 1.7, 0, 0, 7); c.stroke();
    for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * 3.2, gy - 8.2 + Math.sin(a) * 0.86); c.lineTo(x + Math.cos(a) * 8.8, gy - 8.2 + Math.sin(a) * 2.4); c.stroke(); }
  }

  /* ---------- typification Puy Mary / Puy de Sancy (v0.17.0)
     Silhouettes et décors assis sur leur surface, jamais enfoncés dans le sol de jeu.
     Échelle : 1,75 m = 37 u. Les bâtiments du fond sont reculés (recedeW1). */
  function recedeW1(c, ax, ay, sc, fn) {
    /* Échelle autour du pied (ay) : ne pas soulever le bâtiment. */
    c.save();
    c.translate(ax, ay);
    c.scale(sc, sc);
    c.translate(-ax, -ay);
    try { fn(c); } finally { c.restore(); }
  }
  function alpineAf(E, H, vw) {
    var x = (E.cam && E.cam.x || 0) + (vw || 200) * 0.45;
    return H.af(x);
  }
  function atAlpineSummit(E, vw) {
    var sx0 = E.feat && E.feat.summitX;
    if (sx0 == null) { return false; }
    return (sx0 - E.cam.x) > -60 && (sx0 - E.cam.x) < (vw || 200) + 120;
  }
  /* Parallaxe bornée : les sommets typifiés restent dans le cadre (461 et 1280). */
  function vistaOff(E, k, lim) {
    var mid = (E.feat && E.feat.summitX) ? E.feat.summitX * 0.5 : 800;
    var d = ((E.cam && E.cam.x) || 0) - mid;
    var o = d * k;
    if (o < -lim) { return -lim; }
    if (o > lim) { return lim; }
    return o;
  }
  /* Y écran du sentier (le fond est dessiné AVANT la translation caméra). */
  function vistaPathY(E, hy) {
    if (E.P && isFinite(E.P.y) && E.cam) { return E.P.y - E.cam.y; }
    return hy + 20;
  }
  function auditSeat(name, x, foot, surf) {
    if (window.auditAnchor) { window.auditAnchor(name, x, foot, surf); }
  }
  function rocksSeated(E, H, c, xa, xb, spacing, dens, rMin, rMax, tag) {
    var x, h, rx, r, gtop, y;
    for (x = Math.floor(xa / spacing) * spacing; x < xb + spacing; x += spacing) {
      h = E.hash(x, 301);
      if (h > dens(x)) { continue; }
      rx = x + h * spacing;
      r = rMin + (rMax - rMin) * E.hash(x, 303);
      gtop = Math.min(H.gf(rx - r * 0.45), H.gf(rx), H.gf(rx + r * 0.45));
      if (!isFinite(gtop) || gtop < -1e5) { continue; }
      y = gtop - r * 0.82;
      A.drawRock(c, rx, y, r, E.hash(x, 304) * 6, x, true);
      auditSeat(tag || 'rock-seated', rx, y + r * 0.82, gtop);
    }
  }
  function typFirW1(c, x, y, sc, col) {
    var h, w;
    sc = sc || 0.28;
    h = 20 * sc;
    w = h * 0.36;
    c.fillStyle = col || '#1a3220';
    c.beginPath();
    c.moveTo(x, y - h);
    c.lineTo(x + w, y - h * 0.42);
    c.lineTo(x + w * 0.42, y - h * 0.46);
    c.lineTo(x + w * 0.9, y - h * 0.18);
    c.lineTo(x + w * 0.28, y - h * 0.22);
    c.lineTo(x + w * 0.68, y);
    c.lineTo(x - w * 0.68, y);
    c.lineTo(x - w * 0.28, y - h * 0.22);
    c.lineTo(x - w * 0.9, y - h * 0.18);
    c.lineTo(x - w * 0.42, y - h * 0.46);
    c.lineTo(x - w, y - h * 0.42);
    c.closePath();
    c.fill();
  }
  function typFirBandW1(c, x0, x1, yFn, seed, opt) {
    var step, s0, col, x, h, sc, y;
    opt = opt || {};
    step = opt.step || 14;
    s0 = opt.s0 || 0.2;
    col = opt.col || '#1a3220';
    for (x = x0; x < x1; x += step) {
      h = ((x * 13 + seed * 7) % 10) / 10;
      if (h > (opt.dens || 0.85)) { continue; }
      sc = s0 * (0.7 + h * 0.55);
      y = yFn(x);
      typFirW1(c, x + (h - 0.5) * 6, y, sc, col);
    }
  }
  /* Cône phonolitique du Puy Griou : isolé, flancs concaves très raides, pas un triangle générique. */
  function typGriou(c, x, y, sc) {
    var h, w;
    sc = sc || 1;
    h = 46 * sc;
    w = 16 * sc;
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, '#7a8068', 0.35, '#5e6e50', 1, '#4a5a40']);
    c.beginPath();
    c.moveTo(x, y - h);
    c.quadraticCurveTo(x + w * 0.12, y - h * 0.78, x + w * 0.38, y - h * 0.4);
    c.quadraticCurveTo(x + w * 0.95, y - h * 0.1, x + w * 1.15, y);
    c.lineTo(x - w * 1.15, y);
    c.quadraticCurveTo(x - w * 0.95, y - h * 0.1, x - w * 0.38, y - h * 0.4);
    c.quadraticCurveTo(x - w * 0.12, y - h * 0.78, x, y - h);
    c.closePath();
    c.fill();
    /* pointe et éboulis sommitaux, phonolite plus sombre — pas un couvercle triangulaire */
    c.fillStyle = '#5a584e';
    c.beginPath();
    c.moveTo(x, y - h);
    c.quadraticCurveTo(x + w * 0.18, y - h * 0.86, x + w * 0.22, y - h * 0.7);
    c.lineTo(x - w * 0.2, y - h * 0.72);
    c.closePath();
    c.fill();
    auditSeat('mary-griou', x, y, y);
  }
  /* Peyre-Arse + Brèche de Roland : un seul massif proche, bosses herbeuses, cicatrices rocheuses, échancrure. */
  function typPeyreArseRidge(c, x, y, sc) {
    var h, w;
    sc = sc || 1;
    h = 44 * sc;
    w = 92 * sc;
    /* masse herbeuse, plusieurs épaules — pas une corne unique */
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, '#8eaa68', 0.45, '#6a8a50', 1, '#4a6a3c']);
    c.beginPath();
    c.moveTo(x - w, y);
    c.quadraticCurveTo(x - w * 0.82, y - h * 0.45, x - w * 0.62, y - h * 0.72);
    /* Brèche de Roland : selle profonde */
    c.quadraticCurveTo(x - w * 0.48, y - h * 0.42, x - w * 0.36, y - h * 0.5);
    c.quadraticCurveTo(x - w * 0.22, y - h * 0.7, x - w * 0.08, y - h * 0.92);
    c.quadraticCurveTo(x + w * 0.04, y - h * 1.02, x + w * 0.12, y - h * 0.88);
    c.quadraticCurveTo(x + w * 0.28, y - h * 0.7, x + w * 0.42, y - h * 0.8);
    c.quadraticCurveTo(x + w * 0.58, y - h * 0.55, x + w * 0.78, y - h * 0.28);
    c.quadraticCurveTo(x + w * 0.92, y - h * 0.12, x + w, y);
    c.closePath();
    c.fill();
    /* cicatrices rocheuses sur la crête et un flanc, pas un chapeau gris */
    c.fillStyle = '#6a6860';
    c.beginPath();
    c.moveTo(x - w * 0.12, y - h * 0.86);
    c.quadraticCurveTo(x - w * 0.02, y - h * 0.98, x + w * 0.1, y - h * 0.86);
    c.quadraticCurveTo(x + w * 0.08, y - h * 0.74, x - w * 0.04, y - h * 0.72);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(x + w * 0.3, y - h * 0.62);
    c.quadraticCurveTo(x + w * 0.42, y - h * 0.7, x + w * 0.5, y - h * 0.48);
    c.quadraticCurveTo(x + w * 0.4, y - h * 0.42, x + w * 0.28, y - h * 0.48);
    c.closePath();
    c.fill();
    auditSeat('mary-peyre-arse', x, y, y);
    auditSeat('mary-breche', x - w * 0.36, y, y);
  }
  /* Chavaroche : longue crête herbeuse à plusieurs bosses, jamais un triangle. */
  function typChavaroche(c, x, y, sc) {
    var h, w;
    sc = sc || 1;
    h = 28 * sc;
    w = 88 * sc;
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, '#8eaa68', 0.5, '#6a8a50', 1, '#4e6e40']);
    c.beginPath();
    c.moveTo(x - w, y);
    c.quadraticCurveTo(x - w * 0.75, y - h * 0.45, x - w * 0.55, y - h * 0.78);
    c.quadraticCurveTo(x - w * 0.35, y - h * 0.55, x - w * 0.15, y - h * 0.92);
    c.quadraticCurveTo(x + w * 0.05, y - h * 1.02, x + w * 0.22, y - h * 0.7);
    c.quadraticCurveTo(x + w * 0.4, y - h * 0.88, x + w * 0.58, y - h * 0.5);
    c.quadraticCurveTo(x + w * 0.8, y - h * 0.3, x + w, y);
    c.closePath();
    c.fill();
    auditSeat('mary-chavaroche', x, y, y);
  }
  /* Plomb du Cantal : dôme lointain, large, un peu plus haut, pas une dent. */
  function typPlomb(c, x, y, sc) {
    var h, w;
    sc = sc || 1;
    h = 26 * sc;
    w = 58 * sc;
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, '#9aaa8c', 1, '#6a7e70']);
    c.beginPath();
    c.moveTo(x - w, y);
    c.quadraticCurveTo(x - w * 0.55, y - h * 0.7, x - w * 0.2, y - h * 0.92);
    c.quadraticCurveTo(x, y - h * 1.02, x + w * 0.22, y - h * 0.9);
    c.quadraticCurveTo(x + w * 0.6, y - h * 0.55, x + w, y);
    c.closePath();
    c.fill();
    auditSeat('mary-plomb', x, y, y);
  }
  /* Vallée glaciaire en U, profonde, flancs forestiers. yRim = crête, d = profondeur vers le bas (on regarde vers le bas). */
  function typGlacialValley(c, x, yRim, w, d, opt) {
    var yFloor, cRim, cMid, cFloor;
    opt = opt || {};
    d = Math.max(8, d);
    yFloor = yRim + d;
    cRim = opt.cRim || '#7aa056';
    cMid = opt.cMid || '#4a7a40';
    cFloor = opt.cFloor || '#2a5230';
    c.fillStyle = A.grad(c, 0, yRim, 0, yFloor, [0, cRim, 0.4, cMid, 1, cFloor]);
    c.beginPath();
    c.moveTo(x - w, yRim);
    c.quadraticCurveTo(x - w * 0.5, yRim + d * 0.3, x - w * 0.14, yFloor);
    c.quadraticCurveTo(x, yFloor + d * 0.08, x + w * 0.14, yFloor);
    c.quadraticCurveTo(x + w * 0.5, yRim + d * 0.3, x + w, yRim);
    c.closePath();
    c.fill();
    if (opt.forest !== 0) {
      c.fillStyle = opt.fCol || 'rgba(22, 48, 28, 0.55)';
      c.beginPath();
      c.moveTo(x - w * 0.72, yRim + d * 0.38);
      c.quadraticCurveTo(x - w * 0.35, yRim + d * 0.7, x - w * 0.08, yFloor - 1);
      c.quadraticCurveTo(x, yFloor + d * 0.04, x + w * 0.08, yFloor - 1);
      c.quadraticCurveTo(x + w * 0.35, yRim + d * 0.7, x + w * 0.72, yRim + d * 0.38);
      c.quadraticCurveTo(x, yRim + d * 0.62, x - w * 0.72, yRim + d * 0.38);
      c.closePath();
      c.fill();
    }
  }
  /* Lame de vallée glaciaire (compat). y = rive. */
  function typValleyU(c, x, y, w, d, c0, c1) {
    typGlacialValley(c, x, y, w, d, { cRim: c0 || '#7a9a58', cMid: c0 || '#7a9a58', cFloor: c1 || '#3e5a36', forest: 0 });
  }
  /* Ruban de route du col, assis dans la vallée, pas une dalle. */
  function typColRoad(c, x, y, w) {
    c.strokeStyle = '#c8c2b4';
    c.lineWidth = 1.6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - w * 0.9, y + 4);
    c.quadraticCurveTo(x - w * 0.3, y + 10, x + w * 0.1, y + 6);
    c.quadraticCurveTo(x + w * 0.45, y + 2, x + w * 0.85, y + 8);
    c.stroke();
    c.lineCap = 'butt';
  }
  /* Bâtiment typifié du Pas de Peyrol : pierre, toit d'ardoise, assis sur ay. */
  function typPeyrolHouse(c, x, y, sc) {
    var wallH, bw, roof;
    sc = sc || 1;
    wallH = 16 * sc;
    bw = 28 * sc;
    roof = 8 * sc;
    c.fillStyle = 'rgba(30, 24, 18, 0.18)';
    c.beginPath();
    c.ellipse(x, y + 0.4, bw * 0.58, 1.6 * sc, 0, 0, 7);
    c.fill();
    c.fillStyle = A.grad(c, 0, y - wallH, 0, y, [0, '#c8c2b4', 1, '#8e887c']);
    c.fillRect(x - bw / 2, y - wallH, bw, wallH);
    c.strokeStyle = '#2a2622';
    c.lineWidth = 0.6 * sc;
    c.strokeRect(x - bw / 2, y - wallH, bw, wallH);
    c.fillStyle = '#4a4e56';
    c.beginPath();
    c.moveTo(x - bw / 2 - 2 * sc, y - wallH);
    c.lineTo(x, y - wallH - roof);
    c.lineTo(x + bw / 2 + 2 * sc, y - wallH);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = '#3a5060';
    c.fillRect(x - bw * 0.32, y - wallH + 3.5 * sc, 5 * sc, 4.2 * sc);
    c.fillRect(x + bw * 0.12, y - wallH + 3.5 * sc, 5 * sc, 4.2 * sc);
    c.fillStyle = '#5a4030';
    c.fillRect(x - 2 * sc, y - 6 * sc, 4 * sc, 6 * sc);
    auditSeat('mary-peyrol-house', x, y, y);
  }
  /* Pas de Peyrol vu d'en haut : selle, lacets, maisons d'ardoise, voitures minuscules. y = fond de la selle. */
  function typPeyrolBelow(c, x, y, sc) {
    var i, rx, ry, bx;
    sc = sc || 1;
    c.fillStyle = A.grad(c, 0, y - 10 * sc, 0, y + 4 * sc, [0, '#8eaa68', 1, '#5a7a44']);
    c.beginPath();
    c.moveTo(x - 70 * sc, y - 6 * sc);
    c.quadraticCurveTo(x - 20 * sc, y + 6 * sc, x + 10 * sc, y + 2 * sc);
    c.quadraticCurveTo(x + 40 * sc, y - 2 * sc, x + 70 * sc, y - 8 * sc);
    c.lineTo(x + 70 * sc, y);
    c.lineTo(x - 70 * sc, y);
    c.closePath();
    c.fill();
    /* lacets de la D680, organiques */
    c.strokeStyle = '#c4c0b4';
    c.lineWidth = Math.max(0.9, 1.5 * sc);
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - 58 * sc, y + 5 * sc);
    c.quadraticCurveTo(x - 20 * sc, y + 7 * sc, x - 6 * sc, y + 1 * sc);
    c.quadraticCurveTo(x + 16 * sc, y - 5 * sc, x + 36 * sc, y - 1 * sc);
    c.quadraticCurveTo(x + 52 * sc, y + 3 * sc, x + 62 * sc, y - 4 * sc);
    c.stroke();
    c.lineCap = 'butt';
    /* quelques voitures, échelle lointaine, assises sur la route */
    c.fillStyle = '#4a4a52';
    for (i = 0; i < 5; i++) {
      rx = x + (-40 + i * 18) * sc;
      ry = y + (2 - (i % 2) * 3) * sc;
      c.beginPath();
      c.ellipse(rx, ry, 2.2 * sc, 0.85 * sc, -0.15, 0, 7);
      c.fill();
    }
    /* maisons du col, toits d'ardoise, assises */
    typPeyrolHouse(c, x + 18 * sc, y + 1 * sc, 0.42 * sc);
    typPeyrolHouse(c, x + 32 * sc, y + 0 * sc, 0.36 * sc);
    auditSeat('mary-peyrol-below', x, y, y);
  }
  /* Petite croix de fer du sommet du Puy Mary (Souvenir 1918), typifiée, assise. */
  function typMaryCross(c, x, y, sc) {
    var h, arm;
    sc = sc || 1;
    h = 26 * sc;
    arm = 8 * sc;
    c.fillStyle = 'rgba(30, 24, 18, 0.2)';
    c.beginPath();
    c.ellipse(x, y + 0.4, 4 * sc, 1.1 * sc, 0, 0, 7);
    c.fill();
    c.strokeStyle = '#3a3a40';
    c.lineWidth = 1.15 * sc;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - h);
    c.moveTo(x - arm, y - h * 0.68);
    c.lineTo(x + arm, y - h * 0.68);
    c.stroke();
    c.lineCap = 'butt';
    auditSeat('mary-cross', x, y, y);
  }
  /* Banne d'Ordanche : puy isolé, flancs raides, sommet un peu aplati, au NO du Sancy. */
  function typBanne(c, x, y, sc) {
    var h, w;
    sc = sc || 1;
    h = 32 * sc;
    w = 28 * sc;
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, '#8a9a78', 0.4, '#6a7a58', 1, '#4a5a40']);
    c.beginPath();
    c.moveTo(x - w, y);
    c.quadraticCurveTo(x - w * 0.55, y - h * 0.55, x - w * 0.35, y - h * 0.9);
    c.lineTo(x - w * 0.12, y - h);
    c.lineTo(x + w * 0.16, y - h);
    c.quadraticCurveTo(x + w * 0.4, y - h * 0.88, x + w, y);
    c.closePath();
    c.fill();
    auditSeat('sancy-banne', x, y, y);
  }

  /* Salers typifiée (robe acajou), assise sur y. Petite, pour les pâturages du fond. */
  function typSalers(c, x, y, sc, face) {
    var body, bodyD;
    sc = sc || 0.22;
    if (window.Fauna && Fauna.drawCow) {
      Fauna.drawCow(c, { x: x, y: y, sc: sc, face: face || -1, coat: 0, ph: x * 0.2 }, 0);
      auditSeat('mary-salers', x, y, y);
      return;
    }
    body = '#8a3a20';
    bodyD = '#5a2414';
    c.fillStyle = 'rgba(30,20,14,0.2)';
    c.beginPath();
    c.ellipse(x, y + 0.3, 7 * sc * 4, 1.1 * sc * 2, 0, 0, 7);
    c.fill();
    c.fillStyle = body;
    c.beginPath();
    c.ellipse(x, y - 6 * sc * 2.2, 7 * sc * 2.2, 4.5 * sc * 2.2, 0, 0, 7);
    c.fill();
    c.fillStyle = bodyD;
    c.fillRect(x - 5 * sc * 2, y - 4 * sc * 2, 1.2 * sc * 2, 4 * sc * 2);
    c.fillRect(x + 3 * sc * 2, y - 4 * sc * 2, 1.2 * sc * 2, 4 * sc * 2);
    auditSeat('mary-salers', x, y, y);
  }
  /* Sancy : Puy Ferrand, dôme herbeux voisin (pas une dent), sentier de crête. */
  function typFerrand(c, x, y, sc) {
    var h, w;
    sc = sc || 1;
    h = 36 * sc;
    w = 58 * sc;
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, '#9aa878', 0.4, '#6e8a56', 1, '#4a6a42']);
    c.beginPath();
    c.moveTo(x - w, y);
    c.quadraticCurveTo(x - w * 0.6, y - h * 0.45, x - w * 0.28, y - h * 0.82);
    c.quadraticCurveTo(x - w * 0.08, y - h * 1.02, x + w * 0.08, y - h * 0.98);
    c.quadraticCurveTo(x + w * 0.32, y - h * 0.7, x + w * 0.55, y - h * 0.48);
    c.quadraticCurveTo(x + w * 0.8, y - h * 0.22, x + w, y);
    c.closePath();
    c.fill();
    /* cicatrice de sentier sur le dôme, typifiée */
    c.strokeStyle = 'rgba(196, 186, 150, 0.7)';
    c.lineWidth = Math.max(0.6, 0.8 * sc);
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - w * 0.15, y - 2 * sc);
    c.quadraticCurveTo(x - w * 0.02, y - h * 0.55, x + w * 0.08, y - h * 0.88);
    c.stroke();
    c.lineCap = 'butt';
    auditSeat('sancy-ferrand', x, y, y);
  }
  /* Aiguilles de Chaudefour : Dent de la Rancune + Crête de Coq, dents verticales. */
  function typNeedles(c, x, y, sc) {
    var h, i, xs, hs, w;
    sc = sc || 1;
    /* socle : éperon herbeux, les dents s'y assisent (pas des bâtons flottants) */
    c.fillStyle = A.grad(c, 0, y - 10 * sc, 0, y, [0, '#6a7a58', 1, '#4a5a40']);
    c.beginPath();
    c.moveTo(x - 28 * sc, y);
    c.quadraticCurveTo(x - 8 * sc, y - 9 * sc, x + 6 * sc, y - 8 * sc);
    c.quadraticCurveTo(x + 22 * sc, y - 6 * sc, x + 32 * sc, y);
    c.closePath();
    c.fill();
    c.fillStyle = '#5a5854';
    xs = [-12, -1, 10, 20];
    hs = [16, 24, 20, 13];
    w = [5, 6, 5.5, 4.5];
    for (i = 0; i < xs.length; i++) {
      h = hs[i] * sc;
      c.beginPath();
      c.moveTo(x + (xs[i] - w[i] * 0.5) * sc, y - 6 * sc);
      c.lineTo(x + (xs[i] - w[i] * 0.2) * sc, y - 6 * sc - h * 0.5);
      c.lineTo(x + xs[i] * sc, y - 6 * sc - h);
      c.lineTo(x + (xs[i] + w[i] * 0.35) * sc, y - 6 * sc - h * 0.48);
      c.lineTo(x + (xs[i] + w[i] * 0.55) * sc, y - 6 * sc);
      c.closePath();
      c.fill();
    }
    auditSeat('sancy-needles', x, y, y);
  }
  /* Chaîne des Puys lointaine, Puy de Dôme typifié (cône tronqué), reste dans le cadre 461. */
  function typChainePuys(c, x, y, sc) {
    var i, px, ph, pw, list;
    sc = sc || 1;
    c.fillStyle = '#c5d0dc';
    list = [
      [-70, 8, 14], [-48, 11, 12], [-22, 10, 13],
      [0, 16, 18], /* Puy de Dôme, un peu plus haut, sommet aplati */
      [28, 9, 12], [50, 12, 15], [74, 8, 13]
    ];
    c.beginPath();
    c.moveTo(x + list[0][0] * sc - list[0][2] * sc, y);
    for (i = 0; i < list.length; i++) {
      px = x + list[i][0] * sc;
      ph = list[i][1] * sc;
      pw = list[i][2] * sc;
      if (i === 3) {
        c.quadraticCurveTo(px - pw * 0.5, y - ph * 0.85, px - pw * 0.22, y - ph);
        c.lineTo(px + pw * 0.22, y - ph);
        c.quadraticCurveTo(px + pw * 0.5, y - ph * 0.85, px + pw, y - 2 * sc);
      } else {
        c.quadraticCurveTo(px - pw * 0.2, y - ph, px, y - ph);
        c.quadraticCurveTo(px + pw * 0.2, y - ph, px + pw, y - 2 * sc);
      }
    }
    c.lineTo(x + 92 * sc, y);
    c.closePath();
    c.fill();
    auditSeat('sancy-chaine-puys', x, y, y);
  }
  /* Lame de lac lointaine, horizontale, assise sur un plateau. */
  function typLakeSliver(c, x, y, half, h, pal0, pal1) {
    /* Lame quasi horizontale, posée sur y (rive), pas un ovale flottant. */
    h = Math.max(1.4, h || 2.2);
    c.fillStyle = A.grad(c, 0, y - h, 0, y, [0, pal0 || '#d0e6f0', 1, pal1 || '#6a90a4']);
    c.beginPath();
    c.moveTo(x - half, y);
    c.quadraticCurveTo(x - half * 0.4, y - h * 1.6, x, y - h);
    c.quadraticCurveTo(x + half * 0.4, y - h * 1.6, x + half, y);
    c.quadraticCurveTo(x, y + h * 0.25, x - half, y);
    c.closePath();
    c.fill();
    auditSeat('sancy-lake', x, y, y);
  }
  /* Bâtiments de la station (Mont-Dore / Sancy), chalets, assis sur y. */
  function typSancyStation(c, x, y, sc) {
    var i, bx, bw, wallH;
    sc = sc || 1;
    c.fillStyle = 'rgba(30,24,18,0.16)';
    c.beginPath();
    c.ellipse(x + 8 * sc, y + 0.4, 36 * sc, 2 * sc, 0, 0, 7);
    c.fill();
    for (i = 0; i < 3; i++) {
      bx = x + (i - 1) * 22 * sc;
      bw = (i === 1 ? 24 : 18) * sc;
      wallH = (i === 1 ? 14 : 11) * sc;
      c.fillStyle = '#d8c8b0';
      c.fillRect(bx - bw / 2, y - wallH, bw, wallH);
      c.strokeStyle = '#2a2420';
      c.lineWidth = 0.55 * sc;
      c.strokeRect(bx - bw / 2, y - wallH, bw, wallH);
      c.fillStyle = '#6a3a28';
      c.beginPath();
      c.moveTo(bx - bw / 2 - 1.5 * sc, y - wallH);
      c.lineTo(bx, y - wallH - 6 * sc);
      c.lineTo(bx + bw / 2 + 1.5 * sc, y - wallH);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = '#3a5060';
      c.fillRect(bx - 3 * sc, y - wallH + 3 * sc, 3.2 * sc, 3 * sc);
    }
    auditSeat('sancy-station', x, y, y);
  }
  /* Gare supérieure vue de loin : un seul volume, pieds sur la crête, pas un hameau qui flotte. */
  function typSancyStationFar(c, x, y, sc) {
    sc = sc || 0.14;
    var bw = 11 * sc, wallH = 7.5 * sc, by = y - wallH;
    c.fillStyle = '#c8c0b0';
    c.fillRect(x - bw * 0.5, by, bw, wallH);
    c.strokeStyle = '#2a2420';
    c.lineWidth = Math.max(0.35, 0.45 * sc);
    c.strokeRect(x - bw * 0.5, by, bw, wallH);
    c.fillStyle = '#6a7080';
    c.beginPath();
    c.moveTo(x - bw * 0.55, by);
    c.lineTo(x - bw * 0.15, by - 3.2 * sc);
    c.lineTo(x + bw * 0.55, by);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = '#2c3a48';
    c.fillRect(x - 1.6 * sc, by + 1.6 * sc, 3.2 * sc, 2.2 * sc);
    auditSeat('sancy-station-far', x, y, y);
  }
  /* Pylône et câble du téléphérique, pieds assis sur y. */
  function typCablePylon(c, x, y, h) {
    var w;
    h = h || 22;
    w = h * 0.16;
    c.strokeStyle = '#3a3a40';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(x - w, y);
    c.lineTo(x - w * 0.35, y - h);
    c.moveTo(x + w, y);
    c.lineTo(x + w * 0.35, y - h);
    c.moveTo(x - w * 0.7, y - h * 0.45);
    c.lineTo(x + w * 0.7, y - h * 0.45);
    c.moveTo(x - w * 0.45, y - h * 0.8);
    c.lineTo(x + w * 0.45, y - h * 0.8);
    c.stroke();
    auditSeat('sancy-pylon', x, y, y);
  }
  function typCableCar(c, x0, y0, x1, y1, sag) {
    /* Câble en chaînette (quadratique), jamais un trait droit à travers le randonneur. */
    sag = sag == null ? Math.abs(x1 - x0) * 0.14 : sag;
    var mx = (x0 + x1) * 0.5, my = Math.max(y0, y1) + sag;
    c.strokeStyle = 'rgba(40,40,44,0.72)';
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo(mx, my, x1, y1);
    c.stroke();
    c.strokeStyle = 'rgba(40,40,44,0.45)';
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(x0, y0 - 1.1);
    c.quadraticCurveTo(mx, my - 1.1, x1, y1 - 1.1);
    c.stroke();
  }
  function typCableY(x0, y0, x1, y1, sag, t) {
    sag = sag == null ? Math.abs(x1 - x0) * 0.14 : sag;
    var mx = (x0 + x1) * 0.5, my = Math.max(y0, y1) + sag, u = 1 - t;
    return u * u * y0 + 2 * u * t * my + t * t * y1;
  }
  function typCableX(x0, x1, t) { return x0 + (x1 - x0) * t; }
  function typCabin(c, x, y, sc) {
    sc = sc || 0.5;
    c.fillStyle = '#d4a024';
    c.fillRect(x - 3.2 * sc, y, 6.4 * sc, 4.2 * sc);
    c.fillStyle = '#3a3a40';
    c.fillRect(x - 3.4 * sc, y - 1.2 * sc, 6.8 * sc, 1.3 * sc);
    c.fillStyle = '#2a4050';
    c.fillRect(x - 2.2 * sc, y + 0.8 * sc, 2 * sc, 1.6 * sc);
    auditSeat('sancy-cabin', x, y + 4.2 * sc, y + 4.2 * sc);
  }

  /* Polylines tracées (OpenCV + Douglas-Peucker) depuis les photos de référence. x,y normalisés.
     y = 0 au plus haut de la vue, y = 1 au plancher (sentier). */
  var VISTA = {
    mary: {
      debut: { src: "Dienne_View_of_Puy_de_Peyre-Arse_from_the_parking_lot.jpg",
        layers: [
          { k: 'mid', c0: '#7a9658', c1: '#4e7040', pts: [0,0.4352,0.0146,0.4559,0.051,0.4669,0.0635,0.4884,0.1385,0.5705,0.1688,0.579,0.176,0.5939,0.1844,0.5592,0.1927,0.6513,0.201,0.6762,0.2083,0.6186,0.2198,0.6262,0.224,0.6567,0.2292,0.6456,0.2323,0.6201,0.2417,0.5997,0.2615,0.6628,0.2646,0.6333,0.2719,0.6073,0.2792,0.6528,0.2865,0.6303,0.3,0.6279,0.3083,0.6413,0.3396,0.6511,0.3531,0.6714,0.3646,0.6626,0.3875,0.6705,0.3917,0.6588,0.4365,0.6562,0.4396,0.6405,0.449,0.6382,0.4604,0.6137,0.4708,0.6114,0.4792,0.5867,0.4969,0.5744,0.5208,0.5805,0.5281,0.545,0.5333,0.5397,0.5417,0.5594,0.5573,0.562,0.5656,0.5797,0.5719,0.5805,0.5865,0.5086,0.5958,0.5139,0.6052,0.4693,0.6135,0.4876,0.6208,0.4886,0.6521,0.5977,0.6687,0.5763,0.674,0.5478,0.6813,0.5595,0.6906,0.5424,0.6979,0.5588,0.7042,0.5484,0.7312,0.5571,0.7406,0.5935,0.7646,0.6156,0.7729,0.6018,0.7802,0.6065,0.7875,0.5724,0.7979,0.5669,0.8313,0.6218,0.8573,0.6271,0.875,0.6488,0.949,0.6437,0.9625,0.6303,0.9698,0.6086,0.999,0.6277] },
        ],
        forest: [
        ],
        rock: [
        ],
      },
      milieu: { src: "Le_Claux_View_of_Puy_de_Peyre-Arse_from_the_lower_part_of_the_ascent_to_Puy_Mary.jpg",
        layers: [
          { k: 'far', c0: '#9aacc0', c1: '#7e9088', pts: [0.2186,0.6929,0.2405,0.6714,0.2624,0.6499,0.2843,0.6285,0.3068,0.6107,0.3294,0.5941,0.352,0.5774,0.3747,0.5619,0.3954,0.5478,0.4176,0.5347,0.44,0.5284,0.4623,0.5185,0.4859,0.5172,0.5086,0.5314,0.531,0.533,0.5529,0.5116,0.5748,0.4902,0.5968,0.4688,0.6199,0.4734,0.643,0.469,0.6631,0.497,0.6845,0.5136,0.7076,0.5237,0.7301,0.5403,0.7537,0.5412,0.7771,0.5463,0.8003,0.5571,0.8233,0.5591,0.8451,0.5811,0.868,0.5883,0.89,0.5768,0.9125,0.5756,0.9356,0.5841,0.9573,0.5674,0.9768,0.5349,0.9987,0.5158] },
          { k: 'mid', c0: '#7a9658', c1: '#4e7040', pts: [0,0.9191,0.0272,0.8983,0.056,0.8796,0.0854,0.8626,0.1123,0.8301,0.1396,0.7994,0.1655,0.7603,0.1915,0.7219,0.2192,0.6917,0.2469,0.6614,0.2752,0.6345,0.304,0.6109,0.333,0.5893,0.3621,0.5678,0.3911,0.5463,0.4203,0.5298,0.45,0.5182,0.4802,0.5141,0.5094,0.5311,0.5377,0.5242,0.5659,0.4963,0.594,0.4684,0.6239,0.4702,0.6533,0.4762,0.6791,0.5094,0.7086,0.523,0.738,0.5411,0.7682,0.5413,0.7979,0.5552,0.8272,0.5632,0.8566,0.5791,0.8864,0.5704,0.9159,0.5718,0.9454,0.5805,0.9712,0.543,0.9987,0.5148] },
          { k: 'near', c0: '#6e8c4c', c1: '#3c5c34', pts: [0,0.9321,0.0269,0.9123,0.0554,0.8927,0.0845,0.8763,0.1116,0.8461,0.1384,0.8141,0.1644,0.7784,0.1892,0.7377,0.2169,0.7107,0.2459,0.7002,0.2758,0.6998,0.3056,0.6994,0.3354,0.6989,0.3652,0.6985,0.3945,0.6877,0.4242,0.6936,0.454,0.6996,0.4838,0.7,0.5136,0.7,0.5434,0.7,0.5732,0.7,0.6031,0.7,0.6329,0.7,0.6627,0.7,0.6925,0.7,0.7223,0.7,0.7522,0.7,0.782,0.7,0.8118,0.7,0.8416,0.7,0.8714,0.7,0.9007,0.6921,0.9297,0.6817,0.9572,0.6627,0.9806,0.6374,0.9987,0.6589] },
        ],
        forest: [
        ],
        rock: [
          { c0: '#8a8680', c1: '#5a564e', pts: [0.9816,0.6984,0.9701,0.7109,0.9632,0.6828,0.9549,0.7,0.9479,0.6953,0.9358,0.7094,0.9288,0.7328,0.9219,0.7359,0.9225,0.7516,0.9028,0.7766,0.8996,0.7859,0.9022,0.7922,0.9003,0.8063,0.9085,0.8078,0.9257,0.7797,0.9333,0.7828,0.9663,0.7328] },
        ],
      },
      avant: { src: "Vue_depuis_le_Puy_Mary_2.jpg",
        layers: [
          { k: 'far', c0: '#9aacc0', c1: '#7e9088', pts: [0,0.2306,0.0104,0.2036,0.0156,0.2029,0.024,0.2694,0.0302,0.2824,0.0375,0.3243,0.0458,0.3165,0.0552,0.325,0.0906,0.3907,0.0969,0.3772,0.1042,0.2718,0.1365,0.2975,0.1458,0.3172,0.1531,0.4501,0.1615,0.377,0.1656,0.4333,0.1792,0.482,0.1812,0.4567,0.1865,0.4667,0.1885,0.5026,0.1979,0.5033,0.2073,0.4307,0.2292,0.4073,0.2667,0.451,0.274,0.5298,0.2917,0.5312,0.3,0.5539,0.3135,0.5386,0.3208,0.5024,0.3354,0.5038,0.3438,0.5274,0.349,0.6086,0.351,0.6142,0.3552,0.5596,0.3594,0.5624,0.3677,0.6372,0.4125,0.5688,0.4313,0.5211,0.5052,0.4631,0.5156,0.4378,0.5583,0.3966,0.5896,0.3881,0.6052,0.3675,0.6292,0.3692,0.649,0.3517,0.726,0.3557,0.7594,0.3377,0.7781,0.3486,0.7958,0.3297,0.8083,0.342,0.8292,0.3292,0.8615,0.3361,0.9135,0.2907,0.999,0.4534] },
          { k: 'mid', c0: '#7a9658', c1: '#4e7040', pts: [0,0.2303,0.0146,0.2055,0.025,0.2674,0.0375,0.3173,0.0563,0.3266,0.0906,0.3892,0.0948,0.3794,0.1031,0.2936,0.1073,0.2751,0.1344,0.2955,0.1531,0.3227,0.1667,0.359,0.1885,0.3821,0.201,0.3602,0.224,0.3714,0.2365,0.3466,0.2542,0.3541,0.2708,0.3916,0.2833,0.3947,0.3,0.4325,0.3146,0.4437,0.3344,0.4738,0.3406,0.5057,0.349,0.5913,0.351,0.5935,0.3583,0.5667,0.3708,0.6322,0.4115,0.5697,0.4313,0.5218,0.5031,0.4635,0.5156,0.4386,0.5594,0.3961,0.5885,0.3881,0.6052,0.3683,0.6292,0.3672,0.649,0.3525,0.7271,0.3547,0.751,0.3384,0.7792,0.3471,0.7969,0.331,0.8094,0.3413,0.8292,0.3302,0.8604,0.3355,0.9135,0.2916,0.999,0.4522] },
          { k: 'near', c0: '#6e8c4c', c1: '#3c5c34', pts: [0,0.6805,0.0394,0.6805,0.0788,0.6805,0.1182,0.6805,0.1306,0.5842,0.1351,0.4598,0.1494,0.5299,0.1533,0.6544,0.1725,0.6347,0.177,0.5103,0.199,0.4546,0.2058,0.5756,0.2156,0.6805,0.255,0.6805,0.2597,0.5568,0.2738,0.4506,0.313,0.4567,0.3352,0.5401,0.3394,0.6646,0.3687,0.7003,0.4081,0.7003,0.4475,0.7003,0.4869,0.7003,0.5263,0.7003,0.5657,0.7003,0.6051,0.7003,0.6444,0.7003,0.6838,0.7003,0.7232,0.7003,0.7626,0.7003,0.802,0.7003,0.8414,0.7003,0.8808,0.7003,0.9202,0.7003,0.9596,0.7003,0.999,0.7003] },
        ],
        forest: [
          { c0: '#3a5c38', c1: '#243c26', pts: [0.8766,0.7798,0.8766,0.7897,0.8885,0.8129,0.8911,0.8344,0.888,0.8543,0.888,0.9089,0.9016,0.9321,0.9068,0.9619,0.9135,0.9586,0.9266,0.9752,0.9328,0.9586,0.9427,0.957,0.9406,0.899,0.9318,0.8775,0.9229,0.8808,0.9208,0.846,0.9104,0.8278,0.8995,0.7848,0.8891,0.7599,0.8849,0.7765] },
          { c0: '#3a5c38', c1: '#243c26', pts: [0.6328,0.5281,0.6292,0.5116,0.6146,0.4983,0.5995,0.5248,0.5969,0.5762,0.5729,0.5944,0.5719,0.6043,0.5932,0.6291,0.5969,0.6507,0.6182,0.6589,0.6271,0.6358,0.6359,0.6474,0.6354,0.6358,0.6234,0.6175,0.6203,0.5944,0.6073,0.5844,0.6026,0.553,0.6078,0.5315,0.6302,0.5414] },
          { c0: '#3a5c38', c1: '#243c26', pts: [0.5766,0.5331,0.5698,0.4868,0.5542,0.4983,0.5536,0.457,0.537,0.4288,0.4635,0.5066,0.462,0.5563,0.4427,0.5248,0.4422,0.5596,0.4573,0.5563,0.4568,0.5894,0.4396,0.6175,0.4234,0.601,0.4104,0.6341,0.4318,0.6407,0.4292,0.6772,0.4521,0.7483,0.4568,0.702,0.4401,0.707,0.4484,0.6474,0.4792,0.707,0.5099,0.6142,0.5469,0.5695,0.5458,0.5083,0.5604,0.543,0.5547,0.5728,0.5609,0.5861] },
          { c0: '#3a5c38', c1: '#243c26', pts: [0.7786,0.4719,0.7948,0.5066,0.8182,0.4205,0.8208,0.5397,0.862,0.5662,0.9292,0.8162,0.9417,0.7599,0.9833,0.7699,0.9536,0.8311,0.9521,0.9007,0.9641,0.8858,0.9703,0.9288,0.9995,0.894,0.9995,0.4652,0.9307,0.3295,0.9094,0.3924,0.8833,0.3543,0.8448,0.3858,0.85,0.4636,0.813,0.4023,0.7969,0.4205,0.8,0.4768] },
        ],
        rock: [
          { c0: '#8a8680', c1: '#5a564e', pts: [0,0.9023,0.0047,0.9387,0.0286,0.9205,0.0297,0.8957,0.0411,0.9205,0.0448,0.8758,0.0552,0.8775,0.0557,0.9056,0.0693,0.8543,0.0734,0.8907,0.1021,0.8692,0.1036,0.9106,0.1177,0.9172,0.1151,0.8642,0.1281,0.8709,0.1432,0.8212,0.1271,0.8212,0.1292,0.8444,0.1177,0.8493,0.0969,0.8113,0.0859,0.8311,0.0646,0.8195,0.0656,0.7864,0.0766,0.793,0.0802,0.7732,0.0469,0.7417,0.0427,0.7715,0.0312,0.7666,0,0.8212,0,0.8808,0.0063,0.8791] },
          { c0: '#8a8680', c1: '#5a564e', pts: [0.0083,0.2053,0.0068,0.2285,0,0.2301,0,0.2715,0.0073,0.2765,0.0052,0.2947,0.0229,0.3046,0.0266,0.3212,0.0203,0.3361,0,0.3179,0,0.4156,0.0099,0.4056,0.0156,0.4222,0.0094,0.4272,0.0229,0.4421,0.0182,0.4222,0.0224,0.3593,0.0354,0.3775,0.0302,0.3957,0.0375,0.4172,0.0464,0.4205,0.0464,0.3874,0.0276,0.3543,0.0318,0.3361,0.0292,0.2798,0.025,0.2781,0.0245,0.3046,0.0161,0.293,0.0219,0.2666,0.0109,0.2599,0.0193,0.2086] },
        ],
      },
      sommet: { src: "La-breche-de-Roland-et-le-Puy-de-Peyre-Arse-vu-du-Puy-Mary-DSC2-672.jpg + Puy_Griou_depuis_le_puy_Mary.jpg",
        layers: [
          { k: 'far', c0: '#9aacc0', c1: '#7e9088', pts: [0,0.3491,0.2,0.3391,0.38,0.3091,0.3812,0.3091,0.3906,0.3607,0.4042,0.3754,0.4115,0.3717,0.4208,0.3534,0.4323,0.2702,0.4437,0.3053,0.4542,0.2903,0.4656,0.2982,0.4729,0.2885,0.4854,0.2486,0.4969,0.2735,0.5583,0.319,0.5719,0.3861,0.5969,0.3649,0.6146,0.3908,0.6375,0.3999,0.651,0.4444,0.6635,0.4415,0.674,0.4018,0.6823,0.3952,0.7146,0.4312,0.7333,0.4313,0.7656,0.4623,0.7802,0.4354,0.8063,0.4426,0.8281,0.4092,0.8385,0.4354,0.8479,0.4229,0.8562,0.4264,0.8688,0.3852,0.9042,0.3773,0.9542,0.4187,0.9667,0.4148,0.9865,0.4302,0.999,0.4219] },
          { k: 'mid', c0: '#7a9658', c1: '#4e7040', pts: [0,0.0694,0.0333,0.0312,0.0604,0.0119,0.0854,0.0388,0.1115,0.0175,0.1427,0.0631,0.174,0.1428,0.1906,0.1543,0.2323,0.2199,0.2531,0.2381,0.2792,0.2409,0.3146,0.2822,0.326,0.2863,0.3417,0.2447,0.3531,0.2364,0.3615,0.2161,0.3729,0.2925,0.3812,0.3091,0.3906,0.3607,0.4042,0.3754,0.4115,0.3717,0.4208,0.3534,0.4323,0.2702,0.4437,0.3053,0.4542,0.2903,0.4656,0.2982,0.4729,0.2885,0.4854,0.2486,0.4969,0.2735,0.5583,0.319,0.5719,0.3861,0.5969,0.3649,0.6146,0.3908,0.6375,0.3999,0.651,0.4444,0.6635,0.4415,0.674,0.4018,0.6823,0.3952,0.7146,0.4312,0.7333,0.4313,0.7656,0.4623,0.7802,0.4354,0.8063,0.4426,0.8281,0.4092,0.8385,0.4354,0.8479,0.4229,0.8562,0.4264,0.8688,0.3852,0.9042,0.3773,0.9542,0.4187,0.9667,0.4148,0.9865,0.4302,0.999,0.4219] },
          { k: 'mid2', c0: '#6a7e58', c1: '#3e5a3c', pts: [0.577,0.6875,0.5852,0.671,0.5971,0.6826,0.6026,0.6622,0.6118,0.5979,0.6161,0.5836,0.6683,0.565,0.6808,0.5414,0.6901,0.5328,0.7025,0.5444,0.7189,0.5378,0.7248,0.5798,0.7297,0.5802,0.7335,0.6027,0.7417,0.6318,0.7466,0.6178,0.752,0.5482,0.7564,0.5804,0.7612,0.5894,0.7656,0.608,0.771,0.5994,0.7949,0.6366,0.8003,0.6313,0.8052,0.6054,0.8134,0.6702,0.8253,0.6946,0.8275,0.686,0.8313,0.6314,0.8335,0.617,0.8368,0.6291,0.8416,0.6819,0.8503,0.671,0.8579,0.5677,0.8633,0.5375,0.8715,0.5219,0.8786,0.5346,0.884,0.5229,0.89,0.5399,0.8976,0.5145,0.9095,0.5219,0.9373,0.601,0.9465,0.5993,0.9579,0.6238,0.9666,0.6225,0.972,0.6423,0.991,0.6118,0.9997,0.5659] },
        ],
        forest: [
          { c0: '#3a5c38', c1: '#243c26', pts: [0.9625,0.4251,0.9453,0.414,0.9396,0.427,0.9297,0.3956,0.9203,0.3863,0.9115,0.403,0.9021,0.3752,0.8911,0.3993,0.8698,0.3826,0.8599,0.4251,0.8443,0.4251,0.8323,0.4529,0.8604,0.4658,0.863,0.4935,0.8573,0.5176,0.8771,0.5656,0.8875,0.5268,0.9104,0.5527,0.9052,0.525,0.9062,0.4806,0.9229,0.4233,0.9302,0.4233,0.9354,0.4566] },
          { c0: '#3a5c38', c1: '#243c26', pts: [0.8335,0.8277,0.8425,0.8126,0.8441,0.8427,0.8397,0.8662,0.8704,0.8981,0.8723,0.9384,0.8777,0.9384,0.8753,0.8997,0.8797,0.8864,0.8892,0.9015,0.8829,0.9384,0.9199,0.9384,0.9253,0.9015,0.9134,0.8763,0.9196,0.8377,0.9068,0.8495,0.9028,0.8259,0.8908,0.8746,0.8864,0.8008,0.8653,0.7874,0.8617,0.7622,0.8514,0.7656,0.8566,0.8058,0.856,0.8511,0.8422,0.784] },
          { c0: '#3a5c38', c1: '#243c26', pts: [0.9995,0.7052,0.99,0.7002,0.9964,0.7237,0.9984,0.7858,0.9867,0.7958,0.9802,0.8277,0.9699,0.8293,0.9655,0.8578,0.9859,0.8947,0.9892,0.9316,0.9701,0.9165,0.9669,0.9384,0.9997,0.9384] },
        ],
        rock: [
        ],
      }
    },
    sancy: {
      debut: { src: "Val_de_Courre_20200904_n02.jpg",
        layers: [
          { k: 'far', c0: '#8aa0b8', c1: '#6e8490', pts: [0,0.1377,0.0297,0.1514,0.0595,0.1637,0.0896,0.1691,0.1192,0.1827,0.1487,0.191,0.1787,0.1862,0.2087,0.1947,0.2375,0.2146,0.2621,0.2526,0.2853,0.2958,0.3116,0.3309,0.3385,0.3642,0.3633,0.4069,0.3881,0.4495,0.4144,0.4846,0.4422,0.5081,0.4712,0.5286,0.5011,0.5399,0.531,0.5319,0.56,0.5482,0.5822,0.5634,0.6116,0.5807,0.6414,0.5837,0.6714,0.5763,0.7015,0.5689,0.7316,0.5645,0.7618,0.5664,0.792,0.5683,0.8222,0.5662,0.8523,0.5625,0.8814,0.5789,0.9102,0.6014,0.9396,0.6185,0.9693,0.6324,0.999,0.6463] },
          { k: 'mid', c0: '#7a9a5e', c1: '#4a7044', pts: [0,0.1365,0.0295,0.1504,0.0591,0.1631,0.089,0.1691,0.1185,0.1819,0.148,0.1906,0.1778,0.1862,0.2077,0.1945,0.2364,0.2131,0.2629,0.2467,0.2857,0.2947,0.3123,0.329,0.3387,0.3642,0.3628,0.4085,0.3871,0.4521,0.4139,0.4851,0.442,0.5065,0.4709,0.5271,0.5004,0.5394,0.5303,0.5331,0.5593,0.547,0.5844,0.5645,0.6136,0.5814,0.6433,0.5828,0.6732,0.5756,0.7031,0.5685,0.733,0.565,0.7631,0.5669,0.7931,0.5687,0.8231,0.5658,0.8531,0.5625,0.8821,0.5795,0.9107,0.6017,0.9401,0.6166,0.9698,0.628,0.999,0.6454] },
        ],
        forest: [
        ],
        rock: [
        ],
      },
      milieu: { src: "Le_Sancy_et_le_t\u00e9l\u00e9ph\u00e9rique.jpg",
        layers: [
          { k: 'far', c0: '#8aa0b8', c1: '#6e8490', pts: [0,0.4286,0.0521,0.4148,0.075,0.4197,0.1062,0.3905,0.1448,0.38,0.2083,0.3357,0.3365,0.1506,0.3521,0.1384,0.3604,0.1414,0.3771,0.1042,0.3812,0.107,0.3906,0.1487,0.4073,0.1798,0.4146,0.2032,0.4292,0.1822,0.45,0.1886,0.4729,0.1802,0.499,0.1945,0.5073,0.2482,0.5125,0.2677,0.5146,0.2568,0.5219,0.2991,0.5292,0.2256,0.5323,0.2232,0.5396,0.2806,0.5427,0.2646,0.5458,0.2659,0.5542,0.2054,0.5615,0.2655,0.5833,0.2819,0.599,0.2675,0.6281,0.2842,0.6354,0.3028,0.6427,0.4714,0.6458,0.4898,0.6531,0.4777,0.6625,0.4852,0.6875,0.4547,0.6958,0.4201,0.7042,0.415,0.7115,0.3615,0.7167,0.3622,0.7198,0.3775,0.724,0.3793,0.7271,0.3648,0.75,0.3514,0.7688,0.4034,0.774,0.3969,0.7812,0.4646,0.7906,0.4688,0.7969,0.5229,0.8042,0.4584,0.8271,0.4409,0.8354,0.4475,0.8458,0.4232,0.8667,0.4023,0.8719,0.4091,0.8792,0.4865,0.9031,0.5363,0.9333,0.5731,0.9458,0.6266,0.9531,0.5027,0.9635,0.4999,0.9708,0.5389,0.9854,0.5387,0.999,0.5547] },
          { k: 'mid', c0: '#7a9a5e', c1: '#4a7044', pts: [0,0.4286,0.0302,0.425,0.0531,0.4148,0.075,0.4189,0.1052,0.3916,0.1448,0.3795,0.2094,0.3346,0.2292,0.3105,0.3146,0.1798,0.3771,0.1048,0.3812,0.1105,0.3896,0.1394,0.3979,0.1331,0.4021,0.1385,0.4156,0.1972,0.4323,0.174,0.4479,0.1876,0.4708,0.1807,0.4948,0.1903,0.5094,0.2441,0.5229,0.1985,0.5302,0.1845,0.5406,0.2213,0.551,0.201,0.5635,0.2437,0.5844,0.2652,0.6,0.2661,0.6271,0.2835,0.6312,0.2913,0.6344,0.3113,0.6427,0.4475,0.6469,0.4816,0.6635,0.4821,0.6875,0.4512,0.7052,0.36,0.726,0.3645,0.749,0.3513,0.7615,0.38,0.7698,0.3777,0.774,0.3833,0.799,0.4605,0.825,0.4425,0.8354,0.4445,0.849,0.4193,0.8688,0.4024,0.8896,0.4489,0.926,0.4964,0.949,0.5033,0.9604,0.4994,0.9729,0.5377,0.9865,0.5397,0.999,0.5534] },
        ],
        forest: [
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.3583,0.7722,0.3552,0.7967,0.3656,0.8018,0.3724,0.8417,0.3682,0.8597,0.351,0.8649,0.35,0.8829,0.3656,0.9189,0.3823,0.9987,0.4453,0.9987,0.4302,0.9601,0.4266,0.9331,0.4089,0.9215,0.4094,0.8919,0.3927,0.8662,0.3865,0.8198,0.3776,0.8044,0.3745,0.7786] },
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.2115,0.6731,0.2172,0.7091,0.2583,0.7671,0.2573,0.7941,0.2422,0.8211,0.2401,0.8456,0.2323,0.8456,0.2286,0.8198,0.2177,0.8211,0.2167,0.8378,0.2401,0.888,0.2333,0.906,0.2323,0.9614,0.2484,0.9627,0.2505,0.9987,0.262,0.9987,0.2771,0.9382,0.274,0.9048,0.3026,0.87,0.3141,0.8057,0.276,0.7709,0.2437,0.7091,0.2313,0.7091] },
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.6776,0.6654,0.6661,0.6718,0.6521,0.6963,0.6349,0.6924,0.6224,0.7001,0.6229,0.7568,0.6406,0.7683,0.6453,0.7941,0.6438,0.8082,0.6505,0.8327,0.6562,0.8366,0.6703,0.8185,0.6813,0.7825,0.6818,0.7632,0.6682,0.7516,0.6703,0.7362,0.6833,0.7066,0.6849,0.677] },
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.4839,0.6255,0.4927,0.7079,0.5406,0.8108,0.5401,0.8533,0.5656,0.8816,0.5589,0.9215,0.6016,0.9485,0.6062,0.9846,0.6635,0.9871,0.6661,0.9691,0.5948,0.8353,0.599,0.8095,0.6167,0.7954,0.5917,0.7284,0.5964,0.704,0.5839,0.6692,0.5542,0.6512,0.5219,0.6628] },
        ],
        rock: [
        ],
      },
      avant: { src: "Puy_de_Sancy_2016-08-23_n16.jpg",
        layers: [
          { k: 'far', c0: '#8aa0b8', c1: '#6e8490', pts: [0,0.2238,0.0354,0.187,0.0531,0.2081,0.0646,0.1787,0.0792,0.3536,0.0917,0.369,0.099,0.2366,0.1229,0.2347,0.1313,0.345,0.1437,0.3643,0.151,0.2727,0.1917,0.2841,0.2135,0.1936,0.2219,0.1882,0.2812,0.1785,0.3031,0.1958,0.3302,0.1785,0.3521,0.1825,0.3906,0.168,0.4896,0.1701,0.5188,0.1611,0.5708,0.1913,0.5802,0.186,0.5875,0.1516,0.6031,0.1217,0.6115,0.1659,0.6375,0.1671,0.6458,0.1868,0.6531,0.1623,0.6771,0.1542,0.6875,0.1298,0.6948,0.0897,0.7042,0.0785,0.7458,0.0947,0.7583,0.0707,0.7906,0.0755,0.8083,0.0598,0.826,0.061,0.8708,0.0377,0.8833,0.0425,0.8917,0.0572,0.9146,0.056,0.9594,0.1322,0.999,0.1623] },
          { k: 'mid', c0: '#7a9a5e', c1: '#4a7044', pts: [0,0.223,0.0333,0.1888,0.0406,0.1889,0.0531,0.2044,0.0646,0.18,0.0771,0.1768,0.0844,0.1859,0.0979,0.2353,0.1292,0.2336,0.149,0.2709,0.1885,0.284,0.1969,0.2674,0.2125,0.1997,0.2208,0.1887,0.2729,0.1779,0.3042,0.1933,0.3323,0.1779,0.3531,0.1812,0.3917,0.1679,0.4698,0.1637,0.4896,0.1699,0.5177,0.1606,0.5458,0.1707,0.5708,0.1905,0.5792,0.1842,0.6021,0.1239,0.6146,0.1641,0.6365,0.1684,0.6458,0.1808,0.6552,0.1619,0.6781,0.1496,0.6958,0.0913,0.7031,0.0807,0.7438,0.0922,0.7594,0.0704,0.7896,0.0749,0.8083,0.0606,0.826,0.0606,0.8719,0.0382,0.8917,0.0551,0.9135,0.0555,0.9604,0.1327,0.999,0.1623] },
        ],
        forest: [
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.1677,0.9219,0.1562,0.8953,0.1557,0.8671,0.1505,0.8904,0.1385,0.887,0.1391,0.8405,0.1292,0.8073,0.1083,0.8372,0.099,0.8056,0.063,0.8339,0.0682,0.892,0.0625,0.907,0.0365,0.8455,0,0.8422,0,0.8904,0.0115,0.8837,0.0177,0.9336,0.0365,0.9086,0.0474,0.9319,0.0776,0.9219,0.0828,0.9435,0.0755,0.9718,0.0927,0.9601,0.099,0.9983,0.1375,0.9983,0.1427,0.9801,0.1583,0.9983] },
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.0156,0.4452,0.0245,0.4834,0.0411,0.4635,0.0604,0.4983,0.0672,0.4668,0.0828,0.4635,0.0833,0.4203,0.0891,0.402,0.0854,0.3987,0.0839,0.4153,0.0802,0.4203,0.0625,0.402,0.0563,0.3738,0.0422,0.3571,0.0339,0.3821,0.0297,0.412,0.0245,0.4186,0.0229,0.4352] },
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.887,0.3439,0.9057,0.3821,0.9062,0.4169,0.9161,0.4169,0.9307,0.4718,0.9427,0.4684,0.9531,0.5,0.9479,0.5349,0.9307,0.5116,0.9318,0.5399,0.9453,0.5581,0.9505,0.5332,0.9594,0.5332,0.962,0.5764,0.9745,0.598,0.9724,0.6229,0.9854,0.6096,0.9771,0.5449,0.9828,0.5133,0.9724,0.4884,0.9563,0.5,0.9661,0.4601,0.9552,0.412,0.937,0.4302,0.9286,0.3721,0.9349,0.3538,0.9318,0.3355,0.9198,0.3837,0.9125,0.3787,0.9042,0.3289] },
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.2255,0.2691,0.2318,0.3571,0.212,0.3372,0.2719,0.5748,0.276,0.6611,0.2891,0.6379,0.287,0.6977,0.3484,0.7691,0.3328,0.809,0.3823,0.8372,0.375,0.7641,0.4021,0.7159,0.4411,0.8355,0.4531,0.8106,0.4099,0.6113,0.3922,0.6063,0.3974,0.5532,0.3802,0.5598,0.3792,0.4635,0.3677,0.5631,0.3349,0.5864,0.3328,0.4917,0.3547,0.4767,0.3328,0.3688,0.3042,0.3738,0.3182,0.2957,0.3401,0.3455,0.3812,0.2841] },
        ],
        rock: [
          { c0: '#8a8890', c1: '#58545e', pts: [0.5646,0.191,0.5177,0.1628,0.3026,0.1977,0.2568,0.1777,0.2135,0.191,0.2026,0.2458,0.2479,0.2027,0.2766,0.2558] },
          { c0: '#8a8890', c1: '#58545e', pts: [0.787,0.0764,0.7578,0.0698,0.7516,0.0748,0.7484,0.098,0.724,0.0797,0.6948,0.0864,0.6911,0.0947,0.6917,0.1246,0.6813,0.1362,0.6781,0.1645,0.7177,0.1196] },
        ],
      },
      sommet: { src: "Puy_Ferrand.jpg",
        layers: [
          { k: 'far', c0: '#8aa0b8', c1: '#6e8490', pts: [0,0.618,0.0295,0.6068,0.059,0.6003,0.0889,0.5906,0.1189,0.589,0.149,0.5887,0.1791,0.5883,0.2089,0.5767,0.2388,0.5835,0.2679,0.5734,0.2962,0.5606,0.3243,0.5473,0.5,0.5712,0.7,0.5512,0.8278,0.5151,0.8559,0.543,0.8853,0.555,0.9152,0.5467,0.9447,0.5322,0.9731,0.5321,0.9988,0.5568] },
          { k: 'mid', c0: '#7a9a5e', c1: '#4a7044', pts: [0,0.618,0.0295,0.6068,0.059,0.6003,0.0889,0.5906,0.1189,0.589,0.149,0.5887,0.1791,0.5883,0.2089,0.5767,0.2388,0.5835,0.2679,0.5734,0.2962,0.5606,0.3243,0.5473,0.3408,0.4835,0.3674,0.4479,0.3929,0.4077,0.4183,0.3666,0.4468,0.3432,0.4768,0.3405,0.5068,0.347,0.5365,0.3579,0.5661,0.3727,0.5957,0.3841,0.6232,0.41,0.6523,0.4202,0.6819,0.431,0.7119,0.4366,0.7415,0.4482,0.7706,0.4683,0.7996,0.4883,0.8278,0.5151,0.8559,0.543,0.8853,0.555,0.9152,0.5467,0.9447,0.5322,0.9731,0.5321,0.9988,0.5568] },
        ],
        forest: [
          { c0: '#2f5640', c1: '#1c3a2c', pts: [0.17,0.7646,0.1328,0.7883,0.0937,0.8547,0,0.9068,0,0.9352,0.0658,0.9194,0.0738,0.8973,0.0831,0.91,0.0986,0.8594,0.1154,0.8452,0.1309,0.8562,0.1452,0.8215,0.1569,0.8246,0.1582,0.7962] },
        ],
        rock: [
        ],
      }
    }
  };

  function vistaOffOf(k) {
    if (k === 'far' || k === 'far2') { return 0.014; }
    if (k === 'near') { return 0.024; }
    return 0.018;
  }
  function vistaLimOf(k) {
    if (k === 'far' || k === 'far2') { return 20; }
    if (k === 'near') { return 28; }
    return 24;
  }
  function skyRange(V) {
    var min = 1, max = 0, i, j, pts, layers = (V && V.layers) || [];
    for (i = 0; i < layers.length; i++) {
      pts = layers[i].pts;
      for (j = 1; j < pts.length; j += 2) {
        if (pts[j] < min) { min = pts[j]; }
        if (pts[j] > max) { max = pts[j]; }
      }
    }
    if (max - min < 0.05) { max = min + 0.22; }
    return { min: min, max: max };
  }
  function mapY(y, rng, skySpan) {
    var span = rng.max - rng.min;
    if (span < 1e-4) { span = 0.22; }
    if (y <= rng.max) { return (y - rng.min) / span * skySpan; }
    return skySpan + (y - rng.max) / (1.0001 - rng.max) * (1 - skySpan);
  }
  function sampleY(pts, x) {
    var i, x0, x1, t;
    if (!pts || pts.length < 4) { return 1; }
    if (x <= pts[0]) { return pts[1]; }
    for (i = 0; i < pts.length - 2; i += 2) {
      if (x <= pts[i + 2]) {
        x0 = pts[i]; x1 = pts[i + 2];
        t = (x1 === x0) ? 0 : (x - x0) / (x1 - x0);
        return pts[i + 1] + t * (pts[i + 3] - pts[i + 1]);
      }
    }
    return pts[pts.length - 1];
  }
  function fillSkyline(c, pts, x0, span, yCrest, yFloor, off, c0, c1, rng, skySpan, basePts, yClose, yDeep) {
    var i, x, y, yy, full, yLast, yBot, yFill;
    if (!pts || pts.length < 6) { return; }
    yBot = (yClose == null) ? yFloor : yClose;
    /* Prolonge le remplissage sous le sentier : yFloor est l'Y du joueur, le sentier pente et laisserait un coin de ciel. */
    yFill = (yDeep != null && yDeep > yBot) ? yDeep : yBot;
    full = pts[0] <= 0.045 && pts[pts.length - 2] >= 0.955;
    yy = rng ? mapY(pts[1], rng, skySpan) : pts[1];
    yLast = yCrest + (rng ? mapY(pts[pts.length - 1], rng, skySpan) : pts[pts.length - 1]) * (yFloor - yCrest);
    c.beginPath();
    if (full) {
      c.moveTo(-200, yFill);
      c.lineTo(-200, yCrest + yy * (yFloor - yCrest));
    }
    for (i = 0; i < pts.length; i += 2) {
      x = x0 + pts[i] * span + off;
      yy = rng ? mapY(pts[i + 1], rng, skySpan) : pts[i + 1];
      y = yCrest + yy * (yFloor - yCrest);
      if (i === 0 && !full) { c.moveTo(x, y); } else { c.lineTo(x, y); }
    }
    if (full) {
      c.lineTo(x0 + span + 200, yLast);
      c.lineTo(x0 + span + 200, yFill);
    } else if (basePts && basePts.length >= 4) {
      for (i = pts.length - 2; i >= 0; i -= 2) {
        yy = rng ? mapY(sampleY(basePts, pts[i]), rng, skySpan) : sampleY(basePts, pts[i]);
        c.lineTo(x0 + pts[i] * span + off, yCrest + yy * (yFloor - yCrest));
      }
    } else {
      c.lineTo(x0 + pts[pts.length - 2] * span + off, yFill);
      c.lineTo(x0 + pts[0] * span + off, yFill);
    }
    c.closePath();
    c.fillStyle = A.grad(c, 0, yCrest, 0, yBot, [0, c0, 1, c1]);
    c.fill();
    textureInPath(c, (c0.charCodeAt(1) || 12), yCrest, yBot);
  }
  function strokeSkyline(c, pts, x0, span, yCrest, yFloor, off, col, rng, skySpan) {
    var i, x, y, yy;
    if (!pts || pts.length < 6) { return; }
    c.beginPath();
    for (i = 0; i < pts.length; i += 2) {
      x = x0 + pts[i] * span + off;
      yy = rng ? mapY(pts[i + 1], rng, skySpan) : pts[i + 1];
      y = yCrest + yy * (yFloor - yCrest);
      if (i === 0) { c.moveTo(x, y); } else { c.lineTo(x, y); }
    }
    c.strokeStyle = col;
    c.lineWidth = 0.55;
    c.stroke();
  }
  /* Grain très léger, uniquement à l'intérieur de la forme déjà tracée — pas d'ellipses dans le ciel. */
  function textureInPath(c, seed, y0, y1) {
    var i, x, y, n = 28;
    c.save();
    c.clip();
    c.globalAlpha = 0.07;
    for (i = 0; i < n; i++) {
      x = (Math.abs(Math.sin(seed * 12.99 + i * 78.23)) % 1) * 1400 - 40;
      y = y0 + (Math.abs(Math.sin(seed * 4.11 + i * 19.17)) % 1) * (y1 - y0);
      c.fillStyle = (i % 2) ? 'rgba(255,255,240,0.55)' : 'rgba(20,32,16,0.5)';
      c.beginPath();
      c.arc(x, y, 0.7 + (i % 3) * 0.25, 0, 7);
      c.fill();
    }
    c.restore();
  }
  function pickVista(world, af, atSum) {
    var set = VISTA[world], out = [];
    function add(name, a) {
      if (a > 0.03 && set[name]) { out.push({ v: set[name], a: Math.max(0, Math.min(1, a)) }); }
    }
    if (atSum || af >= 0.965) { add('sommet', 1); return out; }
    if (af < 0.34) { add('debut', 1); }
    else if (af < 0.42) { add('debut', 1 - (af - 0.34) / 0.08); add('milieu', (af - 0.34) / 0.08); }
    else if (af < 0.76) { add('milieu', 1); }
    else if (af < 0.84) { add('milieu', 1 - (af - 0.76) / 0.08); add('avant', (af - 0.76) / 0.08); }
    else if (af < 0.92) { add('avant', 1); }
    else { add('avant', 1 - (af - 0.92) / 0.045); add('sommet', (af - 0.92) / 0.045); }
    return out;
  }
  function skyRangeMidFar(V) {
    var min = 1, max = 0, i, j, pts, layers = (V && V.layers) || [];
    for (i = 0; i < layers.length; i++) {
      if (layers[i].k !== 'far' && layers[i].k !== 'mid' && layers[i].k !== 'far2') { continue; }
      pts = layers[i].pts;
      for (j = 1; j < pts.length; j += 2) {
        if (pts[j] < min) { min = pts[j]; }
        if (pts[j] > max) { max = pts[j]; }
      }
    }
    if (max - min < 0.05) { max = min + 0.22; }
    return { min: min, max: max };
  }
  function valleyRimY(yCrest, yFloor, af, atSum) {
    var span = yFloor - yCrest;
    var valley = (atSum || af > 0.88) ? 0.24 : (af > 0.55 ? 0.13 : 0.05);
    return yCrest + (1 - valley) * span;
  }
  /* Mid et near descendent jusqu'au sentier : la vallée se peint SUR le versant, pas dans un trou de ciel. */
  function layerCloseY(k, yCrest, yFloor, af, atSum) {
    return yFloor;
  }
  function findLayer(V, k) {
    var i, layers = (V && V.layers) || [];
    for (i = 0; i < layers.length; i++) { if (layers[i].k === k) { return layers[i]; } }
    return null;
  }
  function slopeY(V, xNorm, yCrest, yFloor, rng, skySpan, off, span) {
    var mid = findLayer(V, 'mid') || findLayer(V, 'far');
    var y;
    if (!mid) { return yFloor - 4; }
    y = sampleY(mid.pts, xNorm);
    return yCrest + (rng ? mapY(y, rng, skySpan) : y) * (yFloor - yCrest);
  }
  /* Vallée regardée vers le bas : flancs forestiers sombres, fond plus clair. Pas une lentille noire. */
  function drawLookDownValley(c, vw, yRim, yPath, off, world) {
    var x = world === 'mary' ? 0.62 * vw + off : 0.52 * vw + off;
    var w = world === 'mary' ? vw * 0.44 : vw * 0.36;
    var d = Math.max(10, (yPath - yRim) * 0.9);
    typGlacialValley(c, x, yRim, w, d, {
      cRim: world === 'mary' ? '#4e7040' : '#4a7044',
      cMid: world === 'mary' ? '#3a5430' : '#385838',
      cFloor: world === 'mary' ? '#7a9260' : '#748a62',
      fCol: 'rgba(28, 52, 30, 0.38)',
      forest: 1
    });
  }
  /* Bandes rocheuses allongées sous la crête (Peyre-Arse / Brèche), pas des taches-couvercles. */
  function rockBandsOnRidge(c, pts, x0, span, yCrest, yFloor, off, rng, skySpan, yClose) {
    var bands = [[0.04, 0.22], [0.28, 0.46]], b, i, x, y, yy, t, xA, xB, xa, xb;
    if (!pts) { return; }
    c.fillStyle = 'rgba(120, 116, 108, 0.55)';
    for (b = 0; b < bands.length; b++) {
      xA = bands[b][0]; xB = bands[b][1];
      c.beginPath();
      for (t = 0; t <= 1.001; t += 0.1) {
        x = xA + (xB - xA) * t;
        yy = rng ? mapY(sampleY(pts, x), rng, skySpan) : sampleY(pts, x);
        y = yCrest + yy * (yFloor - yCrest) + 3 + 4 * Math.sin(t * 5 + b);
        if (t === 0) { c.moveTo(x0 + x * span + off, y); } else { c.lineTo(x0 + x * span + off, y); }
      }
      for (t = 1; t >= -0.001; t -= 0.1) {
        x = xA + (xB - xA) * t;
        yy = rng ? mapY(sampleY(pts, x), rng, skySpan) : sampleY(pts, x);
        y = yCrest + yy * (yFloor - yCrest) + 9 + 5 * Math.sin(t * 5 + b + 1);
        if (y > yClose - 2) { y = yClose - 2; }
        c.lineTo(x0 + x * span + off, y);
      }
      c.closePath();
      c.fill();
    }
  }
  /* Masses forestières organiques (pas d'éclats de papier). */
  function organicForestBelt(c, x0, x1, yTop, yBot, seed) {
    var i, x, y, rx, ry, n = 11;
    if (yBot - yTop < 6) { return; }
    c.save();
    c.beginPath();
    c.rect(x0 - 8, yTop, (x1 - x0) + 16, (yBot - yTop) + 2);
    c.clip();
    c.fillStyle = 'rgba(32, 56, 34, 0.16)';
    for (i = 0; i < n; i++) {
      x = x0 + (i + 0.15 + 0.7 * (Math.abs(Math.sin(seed + i * 3.1)) % 1)) / n * (x1 - x0);
      y = yTop + (0.2 + 0.55 * (Math.abs(Math.sin(seed * 1.7 + i)) % 1)) * (yBot - yTop);
      rx = 10 + 9 * (Math.abs(Math.sin(seed + i * 2.2)) % 1);
      ry = 5 + 4 * (Math.abs(Math.sin(seed + i * 1.4)) % 1);
      c.beginPath();
      c.ellipse(x, y, rx, ry, (i % 5) * 0.12, 0, 7);
      c.fill();
    }
    c.restore();
  }
  function drawTracedVista(c, vw, vh, hy, E, H, world) {
    var af = alpineAf(E, H, vw), atSum = atAlpineSummit(E, vw);
    var pathY = vistaPathY(E, hy);
    var yFloor = pathY - 2;
    var drop = 52 + 38 * ss(0.1, 0.9, af) + 16 * ss(0.8, 1, af);
    var yCrest = yFloor - drop;
    var picks = pickVista(world, af, atSum);
    var p, i, lay, off, span, x0, rng, skySpan = 0.62, yClose, midPts, midCloseY;
    off = vistaOff(E, 0.016, 22);
    midCloseY = yFloor;
    for (p = 0; p < picks.length; p++) {
      c.save();
      c.globalAlpha = picks[p].a;
      var V = picks[p].v;
      var layers = V.layers || [];
      rng = skyRangeMidFar(V);
      x0 = 0; span = vw;
      midPts = findLayer(V, 'mid') ? findLayer(V, 'mid').pts : null;
      for (i = 0; i < layers.length; i++) {
        lay = layers[i];
        /* mid2 (Griou) est dessiné à part comme un cône, pas une dalle. */
        if (lay.k === 'mid2') { continue; }
        yClose = layerCloseY(lay.k, yCrest, yFloor, af, atSum);
        fillSkyline(c, lay.pts, x0, span, yCrest, yFloor, off, lay.c0, lay.c1, rng, skySpan, midPts, yClose, yFloor + 360);
        strokeSkyline(c, lay.pts, x0, span, yCrest, yFloor, off, 'rgba(30,36,24,0.26)', rng, skySpan);
      }
      midCloseY = valleyRimY(yCrest, yFloor, af, atSum);
      if (world === 'mary' && midPts && (atSum || af > 0.82)) {
        rockBandsOnRidge(c, midPts, x0, span, yCrest, yFloor, off, rng, skySpan, yFloor);
      }
      if (atSum || af > 0.55) {
        drawLookDownValley(c, vw, midCloseY, yFloor, off, world);
      }
      /* Forêt organique sur le bas des versants, à la place des polygones dentelés. */
      if (af > 0.2) {
        organicForestBelt(c, 0.08 * vw + off, 0.92 * vw + off, midCloseY - 6, yFloor - 4, world === 'mary' ? 9 : 21);
      }
      c.restore();
    }
    return { af: af, atSum: atSum, yFloor: yFloor, yCrest: yCrest, drop: drop, pathY: pathY, off: off, rng: picks.length ? skyRangeMidFar(picks[0].v) : null, skySpan: skySpan, V: picks.length ? picks[0].v : null, midCloseY: midCloseY };
  }

  function maryVista(c, vw, vh, hy, gain, E, H) {
    var info = drawTracedVista(c, vw, vh, hy, E, H, 'mary');
    var af = info.af, gx, gy, sc;
    /* Griou : cône pointu au SE, plus loin et plus petit que Peyre-Arse, assis sur le massif. */
    if (info.V && (info.atSum || af > 0.72)) {
      c.save();
      c.globalAlpha = 0.35 + 0.65 * ss(0.72, 0.95, af);
      gx = 0.78 * vw + (info.off || 0);
      gy = slopeY(info.V, 0.78, info.yCrest, info.yFloor, info.rng, info.skySpan);
      /* un peu plus bas que la crête proche : il est plus loin */
      gy = gy + 6;
      sc = 0.42 + 0.16 * ss(0.75, 1, af);
      typGriou(c, gx, gy, sc);
      c.restore();
    }
  }

  function sancyVista(c, vw, vh, hy, gain, E, H) {
    var info = drawTracedVista(c, vw, vh, hy, E, H, 'sancy');
    var af = info.af, yFloor = info.yFloor, yCrest = info.yCrest;
    var off = info.off || 0, V = info.V, rng = info.rng, skySpan = info.skySpan;
    var px0, py0, px1, py1, sag, cx, cy, bestY, bestX, i, pts, x, layers, peakX, peakY;
    if (af < 0.9 && V) {
      c.save();
      c.globalAlpha = 0.25 + 0.7 * ss(0.08, 0.45, af) * (1 - ss(0.82, 0.9, af));
      /* Pylônes en retrait du bord, pieds sur le versant. */
      px0 = Math.max(26, 0.13 * vw);
      py0 = slopeY(V, (px0 - off) / vw, yCrest, yFloor, rng, skySpan);
      px1 = 0.32 * vw;
      py1 = slopeY(V, (px1 - off) / vw, yCrest, yFloor, rng, skySpan);
      sag = Math.abs(px1 - px0) * 0.14;
      typCablePylon(c, px0, py0, 10 + 2 * af);
      typCablePylon(c, px1, py1, 11 + 2 * af);
      typCableCar(c, px0, py0 - 10, px1, py1 - 11, sag);
      if (af > 0.22 && af < 0.84) {
        cx = typCableX(px0, px1, 0.46);
        cy = typCableY(px0, py0 - 10, px1, py1 - 11, sag, 0.46);
        typCabin(c, cx, cy, 0.3);
      }
      c.restore();
    }
    if (af > 0.15 && af < 0.8 && V) {
      bestY = 9; bestX = 0.5;
      layers = V.layers || [];
      for (i = 0; i < layers.length; i++) {
        if (layers[i].k === 'mid') {
          pts = layers[i].pts;
          for (x = 0; x < pts.length; x += 2) {
            if (pts[x + 1] < bestY) { bestY = pts[x + 1]; bestX = pts[x]; }
          }
        }
      }
      if (bestY < 9) {
        peakX = bestX * vw + off;
        peakY = yCrest + mapY(bestY, rng, skySpan) * (yFloor - yCrest);
        typSancyStationFar(c, peakX, peakY, 0.13 + 0.05 * af);
      }
    }
  }

  /* ================================================================================================ NIVEAU 3 : PUY MARY */
  AlpineBuild({
    id: 'mary', stairs: 'concrete', horizonHaze: 'rgba(255,226,176,.4)', noHorizonBar: true, hideSummitFlag: true,
    pal: {
      q: { base: '#6a5a3c', mid: '#3f3326', lip: '#8fae4a', hi: '#d6e88c', dark: '#2a2218' },
      f: { base: '#6f6048', mid: '#41372b', lip: '#a3b552', hi: '#e2ec9c', dark: '#2c261d' },
      c: { base: '#756a5c', mid: '#473f38', lip: '#b1b86a', hi: '#e9efb2', dark: '#2d2a26' },
      k: { base: '#7c7468', mid: '#4c4640', lip: '#b8bb78', hi: '#eef0b8', dark: '#302d2a' }
    },
    tileAlpha: 0.75, depthTint: 'rgba(40,28,20,.12)', strataCol: '#2c2418', glow0: 'rgba(255,224,160,.2)', glow1: 'rgba(255,200,130,0)', vig: 'rgba(40,30,50,.16)',
    rockPal: { hi: '#d3ccbc', mid: '#8d867a', lo: '#4c4740', line: '#26231e', spot: 'rgba(110,100,82,.5)', rim: 'rgba(255,244,214,.55)' },
    tilePal: ['rgba(40,34,26,.30)', 'rgba(130,118,86,.24)', 'rgba(224,218,184,.16)', 'rgba(20,16,12,.34)'],
    sky: {
      stops: [0, '#4c7cc2', 0.45, '#8ab6e0', 0.78, '#f0d8a4', 1, '#ffe8b8'],
      sun: { x: 0.2, y: 0.74, r: 5.5, disc: '#fff7d6', g0: 'rgba(255,214,140,.5)', g1: 'rgba(255,200,120,0)', glow: 0.7 },
      clouds: { n: 6, y0: 0.14, y1: 0.5, s0: 0.8, s1: 0.8, top: '#fffaf0', bot: '#f2c9a0', a0: 0.55, a1: 0.3, speed: 0.8 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x); var c = ss(0.45, 0.62, a), f = ss(0.12, 0.3, a) * (1 - c), k = ss(0.86, 0.95, a); c *= (1 - k); return [Math.max(0, 1 - f - c - k), f, c, k]; }; },
    layers: function (E, H) {
      /* pas de couche générique : tout le massif nommé est dans maryVista (une bande pâle se lisait comme une mer). */
      return [];
    },
    bgExtra: function (c, vw, vh, hy, gain, E, H) { maryVista(c, vw, vh, hy, gain, E, H); },
    flora: function (E, H) {
      var gold = 'rgba(255,220,150,0)';
      var cfg = { hazeCol: '#c2cdb0', rows: [
        { step: 16, seed: 14, haze: 0.25, fillTop: '#9fb35e', fillBot: '#6a8448', up: function (x) { return 14 + 5 * E.nz(x / 140, 5); }, dens: function () { return 0; }, size: function () { return 10; }, kind: function () { return 'bush'; } },
        { step: 18, seed: 25, haze: 0.1, fillTop: '#94ab54', fillBot: '#5f7a44', up: function (x) { return 6 + 3 * E.nz(x / 90, 6); }, dens: function () { return 0; }, size: function () { return 10; }, kind: function () { return 'bush'; } },
        { step: 22, seed: 36, haze: 0, fillTop: '#85a04c', fillBot: '#566f3e', up: function (x) { return 3; }, dens: function () { return 0; }, size: function () { return 10; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), c = ss(0.45, 0.65, a), g = E.mix(E.mix('#7da846', '#a2b04e', c), '#b2b86a', ss(0.7, 0.95, a));
        return { dens: 0.92 - 0.35 * c, grass: 1.6, fern: 0, heather: 0, bush: 0, broom: 0, flower: 0.2, gcol: E.mix(g, '#3f6a30', 0.2), gcol2: E.mix(g, '#e3ee9a', 0.5), fcol: '#4f9a4a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      rocksBehind(E, H, c, xa, xb, 46, function (x) { var a = H.af(x); return 0.22 + 0.5 * ss(0.3, 0.8, a); }, null, 3.5, 8);
    },
    lipExtra: function (c, xa, xb, E, H) {                 // gentianes jaunes et pâquerettes sur la pelouse
      for (var x = Math.floor(xa / 11) * 11; x < xb + 11; x += 11) {
        var h = E.hash(x, 330), ty = E.TYPE[x | 0]; if (h > 0.34 || ty === 1 || ty === 4 || ty === 6) { continue; }
        var gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        var tx = x + h * 9, sz = 5.5 + 4 * E.hash(x, 331), sw = Math.sin(E.time * 1.8 + x) * 0.6;
        c.strokeStyle = '#3f7a32'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(tx, gy); c.lineTo(tx + sw * 0.5, gy - sz); c.stroke();
        c.fillStyle = '#4f9a3c'; c.beginPath(); c.ellipse(tx - 1.6, gy - sz * 0.35, 1.7, 0.6, -0.5, 0, 7); c.ellipse(tx + 1.6, gy - sz * 0.35, 1.7, 0.6, 0.5, 0, 7); c.fill();
        if (E.hash(x, 332) > 0.35) {
          c.fillStyle = '#f2ca2a'; for (var k = 0; k < 5; k++) { var a = k / 5 * 6.283; c.beginPath(); c.ellipse(tx + sw * 0.5 + Math.cos(a) * 1.1, gy - sz + Math.sin(a) * 1.1, 0.8, 0.5, a, 0, 7); c.fill(); }
          c.fillStyle = '#b8801a'; c.beginPath(); c.arc(tx + sw * 0.5, gy - sz, 0.5, 0, 7); c.fill();
        }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['PAS DE', 'PEYROL'], 40, 15, 3.4);
      boardIf(c, E, xa, xb, 98, ['1 589 m'], 34, 11, 3.4, 28);
      var q = E.crumbs[0]; if (q) { boardIf(c, E, xa, xb, q.x0 - 120, ['RESTEZ SUR', 'LE SENTIER'], 60, 24, 3.2, 41); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      tableOrient(c, E, sx + 54, sy);
      typMaryCross(c, sx + 78, sy, 1);
      auditSeat('mary-table', sx + 54, sy, sy);
    }
  });

  /* ================================================================ décor des deux niveaux du puy de Dôme */
  function domeLayers(E, H, shift, mist, warm) {
    var sh = shift || 0, hz = mist ? 0.5 : 0.35;
    function T(u) { return u + sh; }
    var monts = peaks([[T(110), 36, 80, 60, 1.25], [T(190), 44, 40, 60, 1.1], [T(300), 50, 80, 100, 1.3], [T(470), 34, 90, 80, 1.3], [T(640), 40, 80, 100, 1.3]], nzf(E, 60, 7, 12));
    var limagne = function (u) { return 5 + 2 * E.nz(u / 70, 8); };
    var chaine = function (u) {
      u += sh; var y = 11 + 4 * E.nz(u / 60, 9);
      y = Math.max(y, 11 + coneAt(u, 150, 30, 50, 10, 7, 0), 11 + domeAt(u, 250, 27, 38), 11 + coneAt(u, 340, 34, 54, 10, 8, 0), 11 + coneAt(u, 364, 24, 30, 6, 4, 0),
        11 + coneAt(u, 480, 27, 42, 8, 6, -1), 11 + coneAt(u, 536, 29, 46, 9, 7, 1), 11 + coneAt(u, 650, 25, 42, 7, 5, 0), 11 + coneAt(u, 760, 29, 48, 8, 6, 0), 11 + coneAt(u, 880, 26, 44, 8, 5, 0));
      return y;
    };
    var proches = function (u) {
      u += sh; var y = 10 + 4 * E.nz(u / 50, 10);
      return Math.max(y, 10 + coneAt(u, 220, 46, 76, 11, 7, 1), 10 + domeAt(u, 400, 34, 70), 10 + coneAt(u, 600, 40, 70, 9, 6, 0), 10 + domeAt(u, 800, 32, 64), 10 + coneAt(u, 980, 42, 74, 10, 6, -1));
    };
    var bois = function (u) { u += sh; return 14 + 12 * E.nz(u / 38, 11) + 6 * E.nz(u / 13, 12); };
    var trk = function (x, h) { return h < 0.3 ? 'beech' : 'fir'; };
    var hzc = mist ? '#c8d2da' : '#b6c8d8';
    return [
      { par: 0.012, y: 8, hmax: 60, fn: monts, c0: mist ? '#b4c0cf' : '#a5b6d3', c1: mist ? '#d0d8e0' : '#c5d1e2', edge: 'rgba(255,255,255,.35)', gk: 0.005 },
      { par: 0.02, y: 12, hmax: 14, fn: limagne, c0: mist ? '#c8d3d6' : '#b8cbd4', c1: mist ? '#dde3e2' : '#d4dedc', gk: 0.01, step: 4 },
      { par: 0.05, y: 18, hmax: 56, fn: chaine, c0: mist ? '#7fa089' : '#6b9a76', c1: mist ? '#b3c7b8' : '#a1bfa7', edge: warm ? 'rgba(255,248,210,.55)' : 'rgba(240,250,230,.45)', haze: mist ? 'rgba(214,224,228,.4)' : 'rgba(210,228,238,.28)', gk: 0.02,
        trees: { step: 10, seed: 31, dens: 0.8, maxH: 18, size: 11, haze: hz + 0.1, hazeCol: hzc, kind: trk } },
      { par: 0.1, y: 30, hmax: 66, fn: proches, c0: mist ? '#58896a' : '#4e8a5a', c1: mist ? '#86a891' : '#7da98a', edge: warm ? 'rgba(255,248,200,.55)' : 'rgba(235,250,225,.45)', haze: mist ? 'rgba(206,216,222,.34)' : 'rgba(200,222,236,.2)', gk: 0.05,
        trees: { step: 9, seed: 33, dens: 0.85, maxH: 30, size: 15, haze: hz, hazeCol: hzc, kind: trk } },
      { par: 0.2, y: 46, hmax: 40, fn: bois, c0: mist ? '#3f7050' : '#397a4a', c1: mist ? '#2a5240' : '#27553c', gk: 0.09,
        trees: { step: 9, seed: 35, dens: 0.92, maxH: 26, size: 20, haze: hz * 0.55, hazeCol: hzc, kind: trk } }
    ];
  }
  function domeBw(E, H) {   // q : sous-bois ombragé, f : pelouse sèche, c : éboulis, k : roche claire
    return function (x) { var a = E.L.altitudeStart + H.af(x) * ((E.L.altitudeEnd || E.L.altitude) - E.L.altitudeStart), sh = H.shade(x), f = (1 - sh) * ss(1180, 1260, a) * (1 - ss(1320, 1390, a)), c = ss(1320, 1400, a), k = ss(1400, 1450, a); c *= (1 - k); var q = Math.max(0, 1 - f - c - k); return [q, f, c, k]; };
  }
  var DOME_ROCK = { hi: '#dcd9cf', mid: '#9c988e', lo: '#59564f', line: '#26241f', spot: 'rgba(70,66,60,.5)', rim: 'rgba(255,248,224,.55)' };
  var DOME_TILE = ['rgba(40,34,28,.28)', 'rgba(140,130,104,.22)', 'rgba(228,222,190,.15)', 'rgba(20,16,12,.32)'];
  var DOME_PAL = {
    q: { base: '#5a4630', mid: '#33281e', lip: '#5f9a42', hi: '#c0e486', dark: '#231a14' },
    f: { base: '#7a6240', mid: '#463725', lip: '#bfb458', hi: '#efe8a0', dark: '#2d2418' },
    c: { base: '#706656', mid: '#41392f', lip: '#a99f72', hi: '#ddd5a9', dark: '#2c261f' },
    k: { base: '#8a8579', mid: '#524e46', lip: '#b3ad88', hi: '#e8e2bb', dark: '#35322c' }
  };
  function domeFlora(E, H, opt) {
    var alt = function (x) { return E.L.altitudeStart + H.af(x) * ((E.L.altitudeEnd || E.L.altitude) - E.L.altitudeStart); };
    var tl = function (x) { return 1 - 0.88 * ss(1180, 1360, alt(x)); };           // la forêt s'éclaircit et rapetisse progressivement avec l'altitude (limite des arbres)
    var fo = function (x) { return H.shade(x) * tl(x); };
    var open = function (x) { return (1 - H.shade(x) * 0.9) * (1 - ss(1300, 1405, alt(x))); };      // pelouse et lande : rare au-delà de 1 300 m
    var kindB = function (x, h) { return h < 0.85 * (1 - ss(1090, 1260, alt(x))) ? 'beech' : 'fir'; };   // hêtres en bas, sapins plus haut
    var hs = function (x) { return (34 + 9 * E.nz(x / 120, 5)) * (0.55 + 0.45 * tl(x)); };
    var cfg = { hazeCol: opt.haze, rows: [
      { step: 16, seed: 14, haze: 0.38, fillTop: '#2f6a46', fillBot: '#1c4434', autumn: 0.86, up: function (x) { return 24 * fo(x) + 1; }, dens: function (x) { return 0.96 * fo(x); }, size: function (x) { return hs(x) * 1.15; }, kind: kindB },
      { step: 18, seed: 25, haze: 0.16, fillTop: '#2b6444', fillBot: '#1b4030', autumn: 0.86, up: function (x) { return 11 * fo(x) + 1; }, dens: function (x) { return 0.92 * fo(x); }, size: hs, kind: kindB },
      { step: 24, seed: 36, haze: 0, sink: 5, fillTop: '#26543a', fillBot: '#173828', autumn: 0.84, up: function () { return 3; }, dens: function (x) { return 0.85 * fo(x); }, size: function (x) { return hs(x) * 0.92; }, kind: kindB },
      { step: 12, seed: 52, haze: 0, sink: 3, fillTop: '#5a7a40', fillBot: '#33502e', up: function () { return 3; }, dens: function (x) { return 0.55 * open(x); }, size: function (x) { return 12 + 3 * Math.sin(x / 55); }, kind: function (x, h) { return h < 0.55 ? 'bush' : 'heather'; }, bushPal: { dark: '#2a4a30', base: '#4b7a48', lite: '#9ab868' } }
    ] };
    cfg.lipMix = function (x) {
      var w = domeBw(E, H)(x), q = w[0], f = w[1], c = w[2], k = w[3], o = open(x);
      var g = E.mix(E.mix('#5f9a42', '#bfb458', f), '#a99f72', c);
      return { dens: 0.85 * q + 0.85 * f + 0.3 * c + 0.12 * k, grass: 1.3, fern: 0.8 * fo(x), heather: 0.7 * f * o, bush: 0.25 * f * o, broom: 0.1 * f, flower: 0.25 * f, gcol: E.mix(g, '#3f6a30', 0.2), gcol2: E.mix(g, '#e0e890', 0.5), fcol: '#4f9a4a' };
    };
    return cfg;
  }
  function domeScree(c, xa, xb, E, H) {         // éboulis de domite sur les talus du haut
    rocksBehind(E, H, c, xa, xb, 40, function (x) { var a = E.L.altitudeStart + H.af(x) * ((E.L.altitudeEnd || E.L.altitude) - E.L.altitudeStart); return 0.62 * ss(1250, 1370, a) + 0.05; }, null, 3.4, 9);
  }
  function bendSign(c, E, x, n) {   // balise numérotée d'un virage des Muletiers
    var gy = E.G[Math.max(0, Math.min(E.len, x | 0))]; if (!isFinite(gy)) { return; }
    c.fillStyle = '#3a2616'; c.fillRect(x - 0.9, gy - 17, 1.8, 17.5);
    c.beginPath(); A.rrect(c, x - 5.2, gy - 21, 10.4, 7.4, 1.2); c.fillStyle = '#f6efd8'; c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#2a1810'; c.stroke();
    c.fillStyle = '#1e4f8a'; c.fillRect(x - 4.4, gy - 20.2, 8.8, 1.6);
    c.fillStyle = '#2a1810'; c.font = 'bold 5px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), x, gy - 16.1);
  }
  /* Temple de Mercure : ruines à terrasses et murs de soutènement en trachyte,
     juste sous le site TDF — pas un temple grec reconstitué à colonnes. Décoratif, non solide. */
  function mercureRuins(c, E, x0, sy, w) {
    var x, i, j, tw = w || 64, h1 = 9, h2 = 13, h3 = 26;
    c.fillStyle = 'rgba(28, 16, 14, .32)';
    c.beginPath(); c.ellipse(x0 + tw * 0.52, sy + 1.2, tw * 0.58, 3.0, 0, 0, 7); c.fill();
    function course(x, y, ww, hh, lite, dark) {
      c.fillStyle = A.grad(c, 0, y, 0, y + hh, [0, lite, 1, dark]);
      c.fillRect(x, y, ww, hh);
      c.strokeStyle = 'rgba(28, 18, 12, .6)'; c.lineWidth = 0.55; c.strokeRect(x, y, ww, hh);
      c.fillStyle = 'rgba(28, 16, 12, .4)';
      for (j = 1; j < 4; j++) { c.fillRect(x, y + j * hh / 4, ww, 0.55); }
      for (i = 7; i < ww - 2; i += 7) { c.fillRect(x + i + ((y | 0) % 2) * 3, y, 0.5, hh); }
    }
    /* terrasses en trachyte sombre, à l'échelle du randonneur */
    course(x0, sy - h1, tw * 0.96, h1, '#8a7460', '#4a382c');
    course(x0 + 6, sy - h1 - h2, tw * 0.74, h2, '#7a6550', '#3e2e24');
    course(x0 + 16, sy - h1 - h2 - 8, tw * 0.46, 8, '#9a8470', '#534033');
    /* murs de soutènement en gradins, coin SE plus élevé */
    course(x0 + tw * 0.58, sy - h3, 9, h3, '#6e5848', '#3a2a20');
    course(x0 + tw * 0.58 + 8.2, sy - (h3 + 8), 7.2, h3 + 8, '#7a6450', '#403028');
    /* vestiges d'enceinte, bas, sans colonnes */
    c.fillStyle = '#6a5848';
    c.fillRect(x0 + 4, sy - h1 - 11, 4.4, 11);
    c.fillRect(x0 + 22, sy - h1 - 8, 3.6, 8);
    c.fillStyle = '#8a7460'; c.fillRect(x0 + 3.4, sy - h1 - 12.2, 5.6, 1.5);
    /* blocs tombés */
    [[x0 + 10, 6.2, 3.2], [x0 + 34, 5.2, 2.6], [x0 + tw * 0.82, 5.8, 3]].forEach(function (b) {
      c.fillStyle = '#6e5848'; c.beginPath(); c.moveTo(b[0], sy); c.lineTo(b[0] + b[1], sy - 0.5); c.lineTo(b[0] + b[1] - 0.5, sy - b[2]); c.lineTo(b[0] + 0.4, sy - b[2] + 0.4); c.closePath(); c.fill();
      c.strokeStyle = '#2a1c14'; c.lineWidth = 0.5; c.stroke();
    });
  }
  /* Émetteur TDF : pylône treillis massif rouge et blanc, semelle béton, bâtiment technique. */
  function tdfMast(c, E, x, base, h) {
    h = h || 240;
    var baseW = 15, topW = 3.4, bandH = 20, nBand = Math.ceil(h / bandH), i, y, y1, t0, t1, w0, w1, col, bw, bh;
    c.fillStyle = 'rgba(28, 16, 14, .34)';
    c.beginPath(); c.ellipse(x, base + 1.4, 18, 2.8, 0, 0, 7); c.fill();
    /* semelle béton */
    c.fillStyle = '#8a8680'; c.fillRect(x - 16, base - 2.6, 32, 2.6);
    c.fillStyle = '#6a6862'; c.fillRect(x - 17, base - 0.6, 34, 1.3);
    c.strokeStyle = '#3a3834'; c.lineWidth = 0.5; c.strokeRect(x - 16, base - 2.6, 32, 2.6);
    /* treillis ouvert : montants et croisillons peints rouge / blanc, le ciel transparaît */
    function mastW(yy) {
      var tt = Math.max(0, Math.min(1, (base - yy) / h));
      return baseW * (1 - tt) + topW * tt;
    }
    function bandCol(yy) {
      return (Math.floor((base - yy) / bandH) % 2 === 0) ? '#c42828' : '#f2eee8';
    }
    function strokeLeg(x0, y0, x1, y1, thick) {
      var steps = Math.max(8, Math.round(Math.abs(y1 - y0) / 4)), s, yy0, yy1, xx0, xx1;
      for (s = 0; s < steps; s++) {
        yy0 = y0 + (y1 - y0) * s / steps;
        yy1 = y0 + (y1 - y0) * (s + 1) / steps;
        xx0 = x0 + (x1 - x0) * s / steps;
        xx1 = x0 + (x1 - x0) * (s + 1) / steps;
        c.strokeStyle = bandCol((yy0 + yy1) / 2);
        c.lineWidth = thick;
        c.lineCap = 'butt';
        c.beginPath(); c.moveTo(xx0, yy0); c.lineTo(xx1, yy1); c.stroke();
        c.strokeStyle = 'rgba(20,12,10,.55)';
        c.lineWidth = Math.max(0.45, thick * 0.22);
        c.beginPath(); c.moveTo(xx0, yy0); c.lineTo(xx1, yy1); c.stroke();
      }
    }
    /* 4 montants massifs */
    strokeLeg(x - baseW, base, x - topW, base - h, 2.4);
    strokeLeg(x + baseW, base, x + topW, base - h, 2.4);
    strokeLeg(x - baseW * 0.38, base, x - topW * 0.35, base - h, 1.6);
    strokeLeg(x + baseW * 0.38, base, x + topW * 0.35, base - h, 1.6);
    /* barreaux et croix de Saint-André */
    for (i = 0; i <= nBand; i++) {
      y = base - i * bandH;
      w0 = mastW(y);
      c.strokeStyle = bandCol(y - 1);
      c.lineWidth = 1.35;
      c.beginPath(); c.moveTo(x - w0, y); c.lineTo(x + w0, y); c.stroke();
      c.strokeStyle = 'rgba(20,12,10,.5)'; c.lineWidth = 0.4;
      c.beginPath(); c.moveTo(x - w0, y); c.lineTo(x + w0, y); c.stroke();
      if (i < nBand) {
        y1 = base - (i + 1) * bandH;
        w1 = mastW(y1);
        c.strokeStyle = bandCol(y - bandH * 0.5);
        c.lineWidth = 1.15;
        c.beginPath();
        c.moveTo(x - w0, y); c.lineTo(x + w1, y1);
        c.moveTo(x + w0, y); c.lineTo(x - w1, y1);
        c.stroke();
      }
    }
    /* lanterne sommitale */
    c.fillStyle = '#e8e4dc'; c.fillRect(x - 1.5, base - h - 10, 3, 10);
    c.fillStyle = '#d43030'; c.beginPath(); c.arc(x, base - h - 12, 2.4, 0, 7); c.fill();
    c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(x, base - h - 12, 1.1, 0, 7); c.fill();
    /* bâtiment technique, planté devant le pied du pylône */
    bw = 28; bh = 15;
    c.fillStyle = A.grad(c, x - bw / 2, 0, x + bw / 2, 0, [0, '#d8d4cc', 1, '#9a968e']);
    c.fillRect(x - bw / 2, base - bh, bw, bh);
    c.fillStyle = '#6a6864'; c.fillRect(x - bw / 2 - 0.8, base - bh - 1.6, bw + 1.6, 1.8);
    c.strokeStyle = '#2a2824'; c.lineWidth = 0.6; c.strokeRect(x - bw / 2, base - bh, bw, bh);
    c.fillStyle = '#3a4048'; c.fillRect(x - bw / 2 + 2.4, base - bh + 2.6, 4.2, 5.4);
    c.fillStyle = '#2a3036'; c.fillRect(x + 0.6, base - bh + 2.8, 5.2, 3.0);
    c.fillStyle = '#5a5854'; c.fillRect(x + bw / 2 - 6.2, base - 7, 3.6, 7);
    c.fillStyle = '#c4c0b8'; c.fillRect(x + bw / 2 - 5.4, base - 4.2, 0.7, 0.7);
    c.strokeStyle = '#6a6e74'; c.lineWidth = 0.8;
    c.beginPath(); c.arc(x - bw / 2 - 2.0, base - bh - 4.6, 3.4, 0.25, 5.5); c.stroke();
    c.beginPath(); c.moveTo(x - bw / 2, base - bh); c.lineTo(x - bw / 2 - 1.2, base - bh - 3.4); c.stroke();
    c.beginPath(); c.arc(x + 4.0, base - bh - 2.8, 2.0, 0.2, 5.2); c.stroke();
  }
  function tdfFoot(c, E, x, base, h) { tdfMast(c, E, x, base, h); }
  function templeDome(c, E, sx, sy, withTemple) {
    // arrivée des Muletiers : esplanade, ruines du Temple de Mercure à terrasses,
    // pied de l'émetteur TDF, gare du Panoramique à droite
    var x;
    var hg = A.grad(c, 0, sy - 40, 0, sy, [0, 'rgba(130,160,104,.5)', 1, 'rgba(80,108,64,.85)']);
    c.fillStyle = hg; c.beginPath(); c.moveTo(sx + 80, sy); c.quadraticCurveTo(sx + 120, sy - 40, sx + 150, sy - 38); c.quadraticCurveTo(sx + 175, sy - 36, sx + 192, sy); c.closePath(); c.fill();
    paverRow(c, sx - 14, sx + 190, sy - 0.2, 3.2, '#bcb6a8', '#8e887c');
    c.fillStyle = '#5c564d'; c.fillRect(sx - 14, sy + 2.8, 204, 0.7);
    mercureRuins(c, E, sx + 54, sy, 62);
    tdfMast(c, E, sx + 128, sy, 250);
    // garde-corps de l'esplanade, entre le relais et la gare
    c.strokeStyle = '#3c3f46'; c.lineWidth = 0.55;
    for (x = sx + 148; x < sx + 210; x += 7) { c.beginPath(); c.moveTo(x, sy - 0.2); c.lineTo(x, sy - 8); c.stroke(); }
    c.beginPath(); c.moveTo(sx + 148, sy - 8); c.lineTo(sx + 208, sy - 8); c.moveTo(sx + 148, sy - 4.6); c.lineTo(sx + 208, sy - 4.6); c.stroke();
    gareBuilding(c, E, sx + 150, 76, 20, sy, false, 0);
    tableOrient(c, E, sx + 146, sy);
  }

  /* ============================================================ NIVEAU 4 : PUY DE DÔME — SENTIER DES MULETIERS */
  AlpineBuild({
    id: 'muletiers', stairs: 'stone', horizonHaze: 'rgba(235,240,232,.45)',
    summitBoardX: -48, summitBoardW: 44, summitBoardSize: 3.2,
    pal: DOME_PAL, tileAlpha: 0.75, depthTint: 'rgba(36,26,18,.12)', strataCol: '#2c2418', glow0: 'rgba(255,244,214,.14)', glow1: 'rgba(255,240,200,0)', vig: 'rgba(30,30,40,.14)',
    rockPal: DOME_ROCK, tilePal: DOME_TILE,
    sky: {
      stops: [0, '#2f78d0', 0.45, '#6fb2ec', 0.82, '#cfe6f4', 1, '#f2f1de'],
      sun: { x: 0.74, y: 0.34, r: 6, disc: '#fffbea', g0: 'rgba(255,248,214,.6)', g1: 'rgba(255,248,210,0)', glow: 0.9 },
      clouds: { n: 5, y0: 0.12, y1: 0.45, s0: 0.7, s1: 0.8, top: '#ffffff', bot: '#dde9f4', a0: 0.5, a1: 0.35, speed: 0.7 }
    },
    bw: domeBw,
    layers: function (E, H) { return domeLayers(E, H, 0, false, true); },
    flora: function (E, H) { return domeFlora(E, H, { haze: '#b6c8d8' }); },
    behind: function (c, xa, xb, bottom, E, H) { domeScree(c, xa, xb, E, H); },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['COL DE', 'CEYSSAT'], 40, 15, 3.4);
      boardIf(c, E, xa, xb, 98, ['MULETIERS'], 34, 11, 3.1, 28);
      var tr = E.feat.trains[0], sx = E.feat.summitX, i, n = 15;
      if (tr) { boardIf(c, E, xa, xb, tr.x0 - 150, ['ATTENTION', 'AU TRAIN'], 50, 15, 3.1, 35); }
      for (i = 0; i < n; i++) {                               // 15 virages répartis sur la montée (le passage à niveau est placé à mi-parcours pour le jeu)
        var bx = 270 + (sx - 330 - 270) * i / (n - 1);
        if (tr && bx > tr.x0 - 40 && bx < tr.x1 + 40) { bx = tr.x1 + 90; }
        if (bx > xa - 12 && bx < xb + 12) { bendSign(c, E, bx, i + 1); }
      }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) { templeDome(c, E, sx, sy, false); }
  });

  /* ============================================================ NIVEAU 6 : PUY DE DÔME — CHEMIN DES CHÈVRES (brume) */
  function paverRow(c, x0, x1, y, h, a, b) {   // dalles de pierre claires, joints décalés
    c.fillStyle = a; c.fillRect(x0, y, x1 - x0, h);
    c.fillStyle = b; c.fillRect(x0, y, x1 - x0, 0.5);
    for (var x = x0 + 5; x < x1; x += 9) { c.fillRect(x, y + 0.5, 0.45, h - 0.5); }
  }
  function metalRoof(c, x0, x1, yEave, rise, lite, dark) {   // toit métallique gris à deux pans, joints debout
    var xm = (x0 + x1) / 2 + (x1 - x0) * 0.08;
    c.fillStyle = lite; c.beginPath(); c.moveTo(x0, yEave); c.lineTo(xm, yEave - rise); c.lineTo(x1, yEave); c.closePath(); c.fill();
    c.fillStyle = dark; c.beginPath(); c.moveTo(xm, yEave - rise); c.lineTo(x1, yEave); c.lineTo(xm + (x1 - xm) * 0.62, yEave); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(40,46,56,.35)'; c.lineWidth = 0.35;
    for (var q = 1; q < 6; q++) { var fx = x0 + (xm - x0) * q / 6; c.beginPath(); c.moveTo(fx, yEave - rise * (q / 6)); c.lineTo(fx - (q / 6) * 0 , yEave); c.stroke(); }
    c.strokeStyle = '#4c535d'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x0, yEave); c.lineTo(xm, yEave - rise); c.lineTo(x1, yEave); c.stroke();
  }
  function gareBuilding(c, E, bx, bw, wallH, sy, withDoor, k) {
    var t = E.time, x, by = sy - wallH;
    // soubassement : mur de pierre sombre
    var baseH = 6;
    c.fillStyle = A.grad(c, 0, sy - baseH, 0, sy, [0, '#5b564f', 1, '#3b3834']); c.fillRect(bx, sy - baseH, bw, baseH);
    c.fillStyle = 'rgba(20,18,16,.55)'; c.fillRect(bx, sy - baseH + 2, bw, 0.4); c.fillRect(bx, sy - baseH + 4, bw, 0.4);
    for (x = bx + 4; x < bx + bw; x += 9) { c.fillRect(x, sy - baseH, 0.4, 2); c.fillRect(x + 4, sy - baseH + 2, 0.4, 2); c.fillRect(x + 1, sy - baseH + 4, 0.4, 2); }
    // murs vitrés : verre sombre, poteaux de bois
    var gy0 = sy - wallH, gh = wallH - baseH;
    c.fillStyle = A.grad(c, 0, gy0, 0, gy0 + gh, [0, '#46586a', 1, '#222a34']); c.fillRect(bx, gy0, bw, gh);
    c.fillStyle = 'rgba(180,205,226,.22)'; for (x = bx + 3; x < bx + bw - 6; x += 15) { c.beginPath(); c.moveTo(x, gy0); c.lineTo(x + 4, gy0); c.lineTo(x + 1.5, gy0 + gh); c.lineTo(x - 2.5, gy0 + gh); c.closePath(); c.fill(); }
    c.fillStyle = '#4a3624'; for (x = bx; x <= bx + bw - 1; x += 10) { c.fillRect(x, gy0, 1.5, gh); }
    c.fillStyle = '#3a2a1c'; c.fillRect(bx, gy0 + gh * 0.45, bw, 0.9);
    if (withDoor) {
    // entrée vitrée (là où le randonneur disparaît), lueur chaude
    var ex = bx + 26, ew = 16, eh = 20;
    c.fillStyle = A.grad(c, 0, sy - eh, 0, sy, [0, '#ffe7a8', 1, '#c98c3c']); c.fillRect(ex, sy - eh, ew, eh);
    c.fillStyle = 'rgba(255,246,214,' + (0.4 + 0.25 * Math.sin(t * 2) + k * 0.3) + ')'; c.fillRect(ex + 1.6, sy - eh + 1.6, ew - 3.2, eh - 3.2);
    c.strokeStyle = '#2a2622'; c.lineWidth = 0.8; c.strokeRect(ex, sy - eh, ew, eh); c.beginPath(); c.moveTo(ex + ew / 2, sy - eh); c.lineTo(ex + ew / 2, sy); c.stroke();
    c.fillStyle = '#4a3624'; c.fillRect(ex - 2, sy - eh - 2, ew + 4, 2.4);
    }
    // toits métalliques gris à pans multiples (3 volumes de hauteurs différentes)
    var rl = '#a6adb6', rd = '#767d87';
    metalRoof(c, bx + 78, bx + bw + 6, by + 0.5, 12, rl, rd);
    metalRoof(c, bx - 6, bx + 66, by + 0.5, 9, rl, rd);
    metalRoof(c, bx + 30, bx + 100, by - 6, 8, '#b4bac2', '#858c96');
    c.fillStyle = '#4c535d'; c.fillRect(bx - 6, by + 0.2, bw + 12, 1.1);
  }
  window.GareArt = { building: gareBuilding, paver: paverRow, roof: metalRoof };   // réutilisé par la cinématique du voyage en train (cine.js)
  function gareDraw(c, E, sx, sy) {
    // Gare du sommet du Panoramique des Dômes : bâtiment bas et large, toits métalliques gris à plusieurs pans,
    // murs vitrés à poteaux de bois sombre sur un soubassement de pierre sombre, esplanade dallée avec garde-corps (d'après la photo de référence)
    var t = E.time, k = E.state === 'won' ? Math.min(1, E.wonT / 2.4) : 0;
    var bx = sx + 118, bw = 130, wallH = 22, by = sy - wallH, i, x;
    // pelouse du puy derrière le bâtiment
    var hg = A.grad(c, 0, sy - 54, 0, sy, [0, 'rgba(120,150,96,.55)', 1, 'rgba(70,100,60,.9)']);
    c.fillStyle = hg; c.beginPath(); c.moveTo(sx + 10, sy); c.quadraticCurveTo(sx + 50, sy - 48, sx + 115, sy - 46); c.quadraticCurveTo(sx + 175, sy - 44, sx + 195, sy); c.closePath(); c.fill();
    mercureRuins(c, E, sx + 24, sy, 58);
    tdfMast(c, E, sx + 94, sy, 250);
    // voie à crémaillère qui arrive au quai (à gauche du bâtiment)
    c.fillStyle = '#7d786e'; c.fillRect(sx - 30, sy - 0.2, 60, 3);
    c.strokeStyle = '#3a3836'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(sx - 30, sy - 0.6); c.lineTo(sx + 30, sy - 0.6); c.stroke();
    c.strokeStyle = '#c4c8cc'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(sx - 30, sy - 1.2); c.lineTo(sx + 30, sy - 1.2); c.stroke();
    c.fillStyle = '#4a4540'; for (x = sx - 28; x < sx + 28; x += 6) { c.fillRect(x, sy - 0.2, 2.2, 1.6); }
    // esplanade dallée
    paverRow(c, sx + 28, sx + 220, sy - 0.2, 3.2, '#b9b4a8', '#8c877c');
    c.fillStyle = '#5c564d'; c.fillRect(sx + 28, sy + 2.8, 192, 0.7);
    // garde-corps de l'esplanade
    c.strokeStyle = '#3c3f46'; c.lineWidth = 0.55;
    for (x = sx + 112; x < sx + 148; x += 7) { c.beginPath(); c.moveTo(x, sy - 0.2); c.lineTo(x, sy - 8); c.stroke(); }
    c.beginPath(); c.moveTo(sx + 112, sy - 8); c.lineTo(sx + 148, sy - 8); c.moveTo(sx + 112, sy - 4.6); c.lineTo(sx + 148, sy - 4.6); c.stroke();
    gareBuilding(c, E, bx, bw, wallH, sy, true, k);
    E.board(c, sx + 188, sy - 26, 40, 14, ['GARE DU', 'SOMMET'], 3.4);
    E.board(c, sx - 40, sy - 30, 36, 11, [String(E.L.altitudeEnd || E.L.altitude).replace(/(\d)(\d{3})$/, '$1 $2') + ' m'], 3.4);
  }
  AlpineBuild({
    id: 'chevres', stairs: 'wood', summitReplace: true, horizonHaze: 'rgba(222,229,232,.55)',
    pal: DOME_PAL, tileAlpha: 0.75, depthTint: 'rgba(34,32,36,.14)', strataCol: '#262420', glow0: 'rgba(240,244,250,.1)', glow1: 'rgba(240,244,250,0)', vig: 'rgba(30,36,50,.2)',
    rockPal: DOME_ROCK, tilePal: DOME_TILE,
    sky: {
      stops: [0, '#6a8aaf', 0.5, '#a3b7c8', 1, '#dfe5e8'],
      sun: { x: 0.7, y: 0.4, r: 7, disc: '#fffdf3', dAlpha: 0.7, g0: 'rgba(255,252,236,.4)', g1: 'rgba(255,252,236,0)', glow: 0.8 },
      clouds: { n: 7, y0: 0.1, y1: 0.55, s0: 0.9, s1: 0.9, top: '#f4f6f8', bot: '#b9c4cf', a0: 0.6, a1: 0.35, speed: 1.1 }
    },
    bw: domeBw,
    layers: function (E, H) { return domeLayers(E, H, 420, true, false); },
    flora: function (E, H) { return domeFlora(E, H, { haze: '#c8d2da' }); },
    behind: function (c, xa, xb, bottom, E, H) {
      domeScree(c, xa, xb, E, H);
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['COL DE', 'CEYSSAT'], 38, 15, 3.4);
      boardIf(c, E, xa, xb, 96, ['CHEMIN DES', 'CHÈVRES'], 36, 15, 2.9, 33);
      var tr = E.feat.trains[0]; if (tr) { boardIf(c, E, xa, xb, tr.x0 - 120, ['ATTENTION', 'AU TRAIN'], 50, 15, 3.1, 35); }
      // fontaine de pierre dans la clairière (zone ensoleillée)
      var fx = 0; E.feat.hints.forEach(function (h) { if (h.id === 'sun') { fx = h.x + 320; } });
      if (fx && fx > xa - 20 && fx < xb + 20) {
        var gy = E.G[fx | 0];
        c.fillStyle = 'rgba(20,20,24,.25)'; c.beginPath(); c.ellipse(fx, gy + 0.5, 12, 1.8, 0, 0, 7); c.fill();
        c.fillStyle = A.grad(c, fx - 10, 0, fx + 10, 0, [0, '#a4a094', 1, '#6f6c62']); c.fillRect(fx - 10, gy - 7, 20, 7.6); c.strokeStyle = '#2a2824'; c.lineWidth = 0.6; c.strokeRect(fx - 10, gy - 7, 20, 7.6);
        c.fillStyle = '#4e86a8'; c.fillRect(fx - 8, gy - 6, 16, 2); c.fillStyle = '#8c887c'; c.fillRect(fx - 3, gy - 14, 6, 7); c.strokeRect(fx - 3, gy - 14, 6, 7);
        c.fillStyle = '#3f6e88'; c.fillRect(fx - 0.5, gy - 8, 1, 2.4);
      }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) { gareDraw(c, E, sx, sy); }
  });

  function sancySummit(c, E, sx, sy) {
    // arrivée du Sancy (photo de référence) : croupe d'herbe, chemin de gravier en lacet, éperon rocheux et gare supérieure du téléphérique
    var x, i, t = E.time;
    // croupe herbeuse derrière la gare
    c.fillStyle = A.grad(c, 0, sy - 62, 0, sy, [0, '#86ad6c', 1, '#4f7a46']);
    c.beginPath(); c.moveTo(sx + 96, sy); c.quadraticCurveTo(sx + 128, sy - 62, sx + 168, sy - 60); c.quadraticCurveTo(sx + 186, sy - 50, sx + 196, sy); c.closePath(); c.fill();
    /* Croupe herbeuse irrégulière portant la gare (photo de la station) — pas un dôme-bunker gris rayé. */
    var top = sy - 32;
    c.fillStyle = A.grad(c, 0, top - 4, 0, sy, [0, '#86ad68', 0.45, '#5f8a4a', 1, '#4a7040']);
    c.beginPath();
    c.moveTo(sx + 8, sy);
    c.quadraticCurveTo(sx + 18, sy - 14, sx + 34, sy - 24);
    c.quadraticCurveTo(sx + 52, top - 4, sx + 78, top - 1);
    c.quadraticCurveTo(sx + 110, top + 1, sx + 136, sy - 16);
    c.quadraticCurveTo(sx + 154, sy - 6, sx + 170, sy);
    c.closePath();
    c.fill();
    /* petits affleurements bas, arrondis, calés sur le sentier */
    c.fillStyle = '#8a8884';
    c.beginPath(); c.moveTo(sx + 18, sy); c.quadraticCurveTo(sx + 26, sy - 5, sx + 36, sy - 3); c.lineTo(sx + 38, sy); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(sx + 142, sy - 5); c.quadraticCurveTo(sx + 152, sy - 9, sx + 164, sy); c.lineTo(sx + 142, sy); c.closePath(); c.fill();
    c.fillStyle = '#6f9a54';
    c.beginPath();
    c.moveTo(sx + 52, top + 0.4);
    c.quadraticCurveTo(sx + 88, top - 3.2, sx + 126, top + 0.6);
    c.quadraticCurveTo(sx + 136, top + 2, sx + 138, top + 3);
    c.quadraticCurveTo(sx + 88, top + 1.8, sx + 52, top + 0.4);
    c.closePath();
    c.fill();
    /* sentier de gravier assis sur la croupe, vers la gare */
    c.strokeStyle = '#d3c6a2'; c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(sx + 150, sy - 7); c.quadraticCurveTo(sx + 128, sy - 16, sx + 108, top + 1); c.stroke();
    c.strokeStyle = 'rgba(120,104,72,.4)'; c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(sx + 150, sy - 8); c.quadraticCurveTo(sx + 128, sy - 17, sx + 108, top); c.stroke();
    c.lineCap = 'butt';
    // gare supérieure du téléphérique : pierre et bois sombre, toit gris à pans, tour vitrée
    var bx = sx + 62, bw = 66, by = top - 17;
    c.fillStyle = A.grad(c, 0, by, 0, top, [0, '#c9c2b0', 1, '#9c9686']); c.fillRect(bx, by, bw, 17);
    c.strokeStyle = '#2a2622'; c.lineWidth = 0.6; c.strokeRect(bx, by, bw, 17);
    c.fillStyle = '#4b3a2c'; c.fillRect(bx, by + 11, bw, 6);
    c.fillStyle = '#2c3a4a'; for (i = 0; i < 6; i++) { c.fillRect(bx + 4 + i * 10.4, by + 4, 6, 5); }
    c.fillStyle = 'rgba(255,230,160,.5)'; for (i = 0; i < 6; i += 2) { c.fillRect(bx + 4 + i * 10.4, by + 4, 6, 5); }
    c.fillStyle = '#7a7f88'; c.beginPath(); c.moveTo(bx - 3, by + 0.5); c.lineTo(bx + 14, by - 7); c.lineTo(bx + bw + 3, by - 7); c.lineTo(bx + bw + 3, by + 0.5); c.closePath(); c.fill(); c.strokeStyle = '#3b4048'; c.lineWidth = 0.5; c.stroke();
    c.fillStyle = 'rgba(244,249,255,.9)'; c.fillRect(bx + 14, by - 7.6, bw - 11, 1.2);
    var tx = bx + 36; c.fillStyle = A.grad(c, 0, by - 22, 0, by - 6, [0, '#8d939c', 1, '#6a7078']); c.fillRect(tx, by - 21, 20, 15); c.strokeRect(tx, by - 21, 20, 15);
    c.fillStyle = '#26323f'; c.fillRect(tx + 2, by - 18, 16, 5); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(tx + 2, by - 18, 5, 5);
    c.fillStyle = '#5a5f68'; c.fillRect(tx - 1, by - 22.6, 22, 2); c.fillStyle = 'rgba(244,249,255,.9)'; c.fillRect(tx - 1, by - 23.2, 22, 1);
    c.fillStyle = '#3b4048'; c.fillRect(tx + 14, by - 34, 0.8, 11);
    c.strokeStyle = '#55392a'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(bx + 2, by + 12.5); c.lineTo(bx + 30, by + 12.5); c.stroke(); for (x = bx + 2; x <= bx + 30; x += 7) { c.beginPath(); c.moveTo(x, by + 12.5); c.lineTo(x, by + 17); c.stroke(); }
    tableOrient(c, E, sx + 40, sy);
  }

  /* ============================================================================ NIVEAU 5 : PUY DE SANCY (neige) */
  AlpineBuild({
    id: 'sancy', stairs: 'planks', snow: true, horizonHaze: 'rgba(230,238,246,.5)', noHorizonBar: true, hideSummitFlag: true,
    pal: {
      q: { base: '#58452f', mid: '#32281e', lip: '#6a9a46', hi: '#c4e48a', dark: '#221a14' },
      f: { base: '#6a5a40', mid: '#3c3226', lip: '#9fae56', hi: '#dde99a', dark: '#2a2218' },
      c: { base: '#6a6672', mid: '#403e4a', lip: '#a6a888', hi: '#dcdcc0', dark: '#2a2830' },
      k: { base: '#c2cfe2', mid: '#8a9cba', lip: '#f4f8ff', hi: '#ffffff', dark: '#4e6288' }
    },
    tileAlpha: 0.7, depthTint: 'rgba(24,26,44,.14)', strataCol: '#262436', glow0: 'rgba(235,244,255,.14)', glow1: 'rgba(235,244,255,0)', vig: 'rgba(20,34,70,.2)',
    rockPal: { hi: '#c0bdca', mid: '#7e7b8a', lo: '#46444f', line: '#201f2a', spot: 'rgba(52,50,66,.5)', rim: 'rgba(240,246,255,.65)' },
    tilePal: ['rgba(32,30,44,.28)', 'rgba(120,118,140,.22)', 'rgba(228,232,246,.18)', 'rgba(16,14,24,.32)'],
    sky: {
      stops: [0, '#2a5cac', 0.5, '#6aa0da', 0.88, '#cde2f2', 1, '#eef4f8'],
      sun: { x: 0.3, y: 0.45, r: 5.6, disc: '#ffffff', g0: 'rgba(236,244,255,.5)', g1: 'rgba(236,244,255,0)', glow: 0.85 },
      clouds: { n: 6, y0: 0.1, y1: 0.5, s0: 0.8, s1: 0.8, top: '#ffffff', bot: '#cfdcee', a0: 0.5, a1: 0.35, speed: 0.9 }
    },
    bw: function (E, H) {
      return function (x) { var a = E.L.altitudeStart + H.af(x) * (E.L.altitude - E.L.altitudeStart), s = H.snow(x), fo = 1 - ss(1420, 1520, a), c = ss(1520, 1660, a), q = fo * (1 - s), f = Math.max(0, (1 - fo) * (1 - c) * (1 - s)), cc = c * (1 - s) * (1 - fo); return [q, f, cc, s]; };
    },
    layers: function (E, H) {
      /* pas de couche générique : le panorama nommé est dans sancyVista. */
      return [];
    },
    bgExtra: function (c, vw, vh, hy, gain, E, H) { sancyVista(c, vw, vh, hy, gain, E, H); },
    flora: function (E, H) {
      var alt = function (x) { return E.L.altitudeStart + H.af(x) * (E.L.altitude - E.L.altitudeStart); };
      var fo = function (x) { return (1 - ss(1420, 1520, alt(x))) * (1 - H.snow(x)); };
      var open = function (x) { return (1 - fo(x)) * (1 - H.snow(x)); };
      var kindB = function (x, h) { return h < 0.34 ? 'beech' : 'fir'; };
      var hs = function (x) { return 34 + 9 * E.nz(x / 120, 5); };
      var cfg = { hazeCol: '#c4d4e4', rows: [
        { step: 16, seed: 14, haze: 0.38, fillTop: '#2f6a50', fillBot: '#1c4438', autumn: 0.82, up: function (x) { return 24 * fo(x) + 1; }, dens: function (x) { return 0.96 * fo(x); }, size: function (x) { return hs(x) * 1.15; }, kind: kindB },
        { step: 18, seed: 25, haze: 0.16, fillTop: '#2b6448', fillBot: '#1b4032', autumn: 0.82, up: function (x) { return 11 * fo(x) + 1; }, dens: function (x) { return 0.92 * fo(x); }, size: hs, kind: kindB },
        { step: 24, seed: 36, haze: 0, sink: 0, fillTop: '#26543e', fillBot: '#173a2c', autumn: 0.8, up: function () { return 3; }, dens: function (x) { return 0.8 * fo(x); }, size: function (x) { return hs(x) * 0.92; }, kind: kindB },
        { step: 12, seed: 52, haze: 0, sink: 0, fillTop: '#58703f', fillBot: '#344c2e', up: function () { return 3; }, dens: function (x) { return 0.5 * open(x); }, size: function (x) { return 11 + 3 * Math.sin(x / 55); }, kind: function (x, h) { return h < 0.5 ? 'bush' : 'heather'; }, bushPal: { dark: '#2a4a34', base: '#4b7a50', lite: '#98b878' } },
        { step: 30, seed: 62, haze: 0, fillTop: '#c8d6ea', fillBot: '#8fa2c4', up: function (x) { return 7 * H.snow(x); }, dens: function () { return 0; }, size: function () { return 8; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var w = (function () { return [0]; })(), s = H.snow(x), a = alt(x), f = (1 - fo(x)) * (1 - s), q = fo(x) * (1 - s), g = E.mix('#5f9a46', E.mix('#a0ae58', '#b3b490', ss(1560, 1700, a)), 1 - fo(x));
        return { dens: (0.85 * q + 0.8 * f) * (1 - 0.8 * s) + 0.1 * s, grass: 1.3, fern: 0.6 * q, heather: 0.4 * f * (1 - ss(1650, 1800, a)), bush: 0.15 * f, broom: 0, flower: 0.18 * f, gcol: E.mix(g, '#e8f0fa', 0.7 * s), gcol2: E.mix(E.mix(g, '#e0e890', 0.5), '#ffffff', 0.85 * s), fcol: '#4f9a4a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      rocksBehind(E, H, c, xa, xb, 42, function (x) { var a = E.L.altitudeStart + H.af(x) * (E.L.altitude - E.L.altitudeStart); return 0.7 * ss(1500, 1700, a) * (1 - 0.5 * H.snow(x)) + 0.04; }, null, 3.4, 9);
    },
    lipExtra: function (c, xa, xb, E, H) {                 // mottes de neige et piquets-balises dans le blanc
      for (var x = Math.floor(xa / 9) * 9; x < xb + 9; x += 9) {
        var h = E.hash(x, 350), k = H.snow(x), ty = E.TYPE[x | 0]; if (k < 0.25 || h > 0.4 || ty === 1 || ty === 4 || ty === 6) { continue; }
        var gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        var tx = x + h * 7, r = 2 + 2.4 * E.hash(x, 351);
        c.fillStyle = 'rgba(176,196,228,.75)'; c.beginPath(); c.ellipse(tx + 0.6, gy + 0.2, r + 0.8, 0.9, 0, 0, 7); c.fill();
        c.fillStyle = '#f6faff'; c.beginPath(); c.ellipse(tx, gy - 0.2, r, r * 0.55, 0, Math.PI, 0); c.lineTo(tx + r, gy); c.lineTo(tx - r, gy); c.fill();
        c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(tx - r * 0.3, gy - r * 0.38, r * 0.4, r * 0.18, 0, 0, 7); c.fill();
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['PUY DE', 'SANCY'], 40, 15, 3.4);
      boardIf(c, E, xa, xb, 98, ['VAL DE', 'COURRE'], 34, 15, 3.2, 33);
      E.feat.hints.forEach(function (h) { if (h.id === 'snow') { boardIf(c, E, xa, xb, h.x + 60, ['NEIGE', 'ET VERGLAS'], 50, 15, 3.2, 35); } });
    },
    stairRail: function (c, s, xa, xb, E, H) {        // main courante en bois le long de l'escalier (photo de l'arrivée : escalier de planches à rambarde de bois)
      var x0 = Math.max(s.x0, Math.floor(xa / 24) * 24 - 24), x1 = Math.min(s.x1, xb + 24), x, g, pts = [], i;
      for (x = x0; x <= x1; x += 6) { g = E.G[Math.max(0, Math.min(E.len, (x + 1) | 0))]; if (isFinite(g)) { pts.push([x, g]); } }
      if (pts.length < 2) { return; }
      var line = function (dy, w, col) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (i = 0; i < pts.length; i++) { c[i ? 'lineTo' : 'moveTo'](pts[i][0], pts[i][1] - dy); } c.stroke(); };
      for (x = Math.ceil(x0 / 24) * 24; x <= x1; x += 24) { g = E.G[Math.max(0, Math.min(E.len, (x + 1) | 0))]; if (!isFinite(g)) { continue; } c.fillStyle = '#4e3520'; c.fillRect(x - 0.7, g - 12.5, 1.5, 13); c.fillStyle = '#8a6840'; c.fillRect(x - 0.7, g - 12.5, 0.6, 13); c.fillStyle = 'rgba(244,249,255,.9)'; c.fillRect(x - 1, g - 13.2, 2.2, 0.9); }
      line(12, 1.3, '#4e3520'); line(12.4, 0.5, '#9a7648'); line(7, 0.8, '#5b3f26');
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      sancySummit(c, E, sx, sy);
      auditSeat('sancy-table', sx + 40, sy, sy);
      auditSeat('sancy-gare-sup', sx + 95, sy, sy);
    }
  });
})();
