/* v0.11.1 — Vol en parapente : les six personnages quittent le Txindoki et traversent la France
   jusqu'à l'atterrissage de Croix Mérin, au pied du Mont Poupet (Jura).
   Décors : toiles peintes style bannière (comme les fins de sommet). Personnages : Art.drawHiker.
   Pas de texte dans les peintures. */
(function () {
  'use strict';
  var A = window.Art, TAU = Math.PI * 2;
  var DUR = 36.0, FADEIN = 1.1, IMG0 = 33.4, IMG1 = 35.8;
  var CAP = [
    [0.8, 6.4, 'TXINDOKI · 1 342 m', 'Sommet du Pays basque · Aralar, Gipuzkoa'],
    [10.6, 13.4, 'PAYS BASQUE', 'Dernier regard sur l\u2019océan'],
    [13.8, 16.4, 'LANDES ET GARONNE', 'Vers l\u2019est, au fil des pins'],
    [16.8, 19.6, 'MASSIF CENTRAL', 'La Chaîne des Puys, déjà gravie'],
    [20.0, 23.0, 'BRESSE ET SAÔNE', 'Le premier relief du Jura'],
    [23.4, 26.8, 'LE JURA', 'Forêts d\u2019épicéas, combes et lacs'],
    [28.2, 32.4, 'CROIX MÉRIN · 513 m', 'Saint-Thiébaud · au pied du Mont Poupet'],
    [33.0, 36.0, 'LE JURA', 'Cap sur le Jura']
  ];

  /* voiles : une couleur nette par personnage, lisible contre le ciel */
  var WINGS = {
    boy:   { top: '#1e9b96', bot: '#b8e4e0', ink: '#0e4e4b' },
    girl:  { top: '#f0b429', bot: '#ffe9a8', ink: '#7a5608' },
    boy2:  { top: '#ff6a1a', bot: '#ffd0a8', ink: '#7a2c08' },
    girl2: { top: '#6b4fe0', bot: '#d9d0ff', ink: '#2c1a72' },
    boy3:  { top: '#c0392b', bot: '#f3c8c2', ink: '#6a1814' },
    girl3: { top: '#2e7a3a', bot: '#cce8c8', ink: '#143c18' }
  };
  var ORDER = ['girl', 'boy', 'girl2', 'boy2', 'girl3', 'boy3'];

  var PLATES = [
    { id: 'ending-txindoki-port', port: true },
    { id: 'ending-txindoki-land' },
    { id: 'cine-w2-basque' },
    { id: 'cine-w2-landes' },
    { id: 'cine-w2-massif' },
    { id: 'cine-w2-bresse' },
    { id: 'cine-w2-jura-approche' },
    { id: 'cine-w2-merin-land' },
    { id: 'cine-w2-merin-port', port: true },
    { id: 'cine-w2-soon' }
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sst(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function imgSrc(n) { var m = window.__MAPIMG; return (m && m[n]) ? m[n] : 'assets/map/' + n + '.webp'; }

  var imgs = {}, readyN = 0, allReady = false, loading = false;
  var mode = 'off', st = null, onEndCb = null, hook = null, G = { W: 0, H: 0, d: 1 }, lastPort = null;
  var wdTimer = 0, chosen = 'boy';

  function loadImgs() {
    if (loading || allReady) { return; } loading = true; readyN = 0;
    PLATES.forEach(function (p) {
      if (imgs[p.id] && imgs[p.id].complete && imgs[p.id].naturalWidth) { readyN++; return; }
      var i = new Image();
      i.onload = function () { readyN++; if (readyN >= PLATES.length) { allReady = true; } };
      i.onerror = function () { readyN++; if (readyN >= PLATES.length) { allReady = true; } };
      i.src = imgSrc(p.id); imgs[p.id] = i;
    });
    if (readyN >= PLATES.length) { allReady = true; }
  }
  function plate(id) { var i = imgs[id]; return (i && i.complete && i.naturalWidth) ? i : null; }

  function layout(W, H, d) { G = { W: W, H: H, d: d, port: H > W * 1.05 }; }

  /* image en « cover » avec zoom et cadrage (fx, fy) = point de l'image [0,1] au centre */
  function cover(iw, ih, cw, ch, zoom, fx, fy) {
    zoom = zoom || 1; fx = fx == null ? 0.5 : fx; fy = fy == null ? 0.5 : fy;
    if (!iw || !ih) { return { x: 0, y: 0, dw: cw, dh: ch, s: 1 }; }
    var s = Math.max(cw / iw, ch / ih) * zoom, dw = iw * s, dh = ih * s;
    var x = cw * 0.5 - fx * dw, y = ch * 0.5 - fy * dh;
    /* ne jamais découvrir un bord (fx/fy hors centre + zoom 1 laissait des bandes noires) */
    if (dw < cw - 0.5) { s *= cw / dw; dw = iw * s; dh = ih * s; x = cw * 0.5 - fx * dw; y = ch * 0.5 - fy * dh; }
    if (dh < ch - 0.5) { s *= ch / dh; dw = iw * s; dh = ih * s; x = cw * 0.5 - fx * dw; y = ch * 0.5 - fy * dh; }
    if (dw >= cw) { x = Math.min(0, Math.max(cw - dw, x)); } else { x = (cw - dw) / 2; }
    if (dh >= ch) { y = Math.min(0, Math.max(ch - dh, y)); } else { y = (ch - dh) / 2; }
    return { x: x, y: y, dw: dw, dh: dh, s: s };
  }
  function drawPlate(ctx, img, cw, ch, zoom, fx, fy, alpha) {
    if (!img || alpha <= 0.001) { return null; }
    var r = cover(img.naturalWidth, img.naturalHeight, cw, ch, zoom, fx, fy);
    if (alpha < 0.999) { ctx.globalAlpha = alpha; }
    ctx.drawImage(img, r.x, r.y, r.dw, r.dh);
    if (alpha < 0.999) { ctx.globalAlpha = 1; }
    return r;
  }
  function iy(r, frac, img) { return r.y + frac * r.dh; }
  function ix(r, frac) { return r.x + frac * r.dw; }

  /* ---------- voile, suspentes, sellette ---------- */
  function drawCanopy(c, cx, cy, span, camber, col, infl, pitch) {
    if (infl < 0.03) { return; }
    var half = span * 0.5, cells = 11, k, tip = span * 0.04;
    c.save(); c.translate(cx, cy); c.rotate(pitch || 0);
    c.scale(1, lerp(0.22, 1, infl));
    /* forme en arc, bouts arrondis (pas un losange) */
    function topY(u) { return -camber * Math.sin(Math.PI * u) * 1.05; }
    function botY(u) { return camber * 0.42 * Math.sin(Math.PI * u) + 2.2; }
    /* intrados */
    c.beginPath();
    c.moveTo(-half + tip, botY(0.06));
    for (k = 1; k <= 16; k++) { var u = k / 16; c.lineTo(-half + u * span, botY(u)); }
    for (k = 16; k >= 0; k--) { var u2 = k / 16; c.lineTo(-half + u2 * span, topY(u2) * 0.15 + botY(u2) * 0.2); }
    c.closePath(); c.fillStyle = col.bot; c.fill();
    /* extrados */
    c.beginPath();
    c.moveTo(-half + tip, 1.4);
    for (k = 0; k <= 16; k++) { var u = k / 16; c.lineTo(-half + u * span, topY(u)); }
    c.lineTo(half - tip, 1.4);
    c.quadraticCurveTo(0, camber * 0.35, -half + tip, 1.4);
    c.closePath();
    c.fillStyle = col.top; c.fill();
    c.strokeStyle = col.ink; c.lineWidth = Math.max(0.8, span * 0.013); c.stroke();
    /* caissons */
    c.strokeStyle = col.ink; c.globalAlpha = 0.4; c.lineWidth = Math.max(0.5, span * 0.008);
    for (k = 1; k < cells; k++) {
      var u = k / cells, xx = -half + u * span;
      c.beginPath(); c.moveTo(xx, topY(u)); c.lineTo(xx, botY(u)); c.stroke();
    }
    c.globalAlpha = 1;
    /* bord d'attaque épais */
    c.strokeStyle = col.ink; c.lineWidth = Math.max(1.6, span * 0.028); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-half + tip, 1.2);
    for (k = 0; k <= 16; k++) { var u = k / 16; c.lineTo(-half + u * span, topY(u)); }
    c.stroke();
    /* stabilos */
    c.fillStyle = col.top; c.strokeStyle = col.ink; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-half + tip, 1.2); c.lineTo(-half - span * 0.035, 5.5); c.lineTo(-half + 3, 3.5); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(half - tip, 1.2); c.lineTo(half + span * 0.035, 5.5); c.lineTo(half - 3, 3.5); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }

  function drawWingOnGround(c, x, y, span, col, face, wrinkle) {
    /* voile ram-air étalée dans l'herbe derrière le pilote : arc de tissu lisible + cellules, pas un disque plat */
    var half = span * 0.5, i, u;
    var camber = span * 0.32 + (wrinkle || 0) * span * 0.04;
    var chord = span * 0.28;
    function xAt(uu) { return -half + uu * span; }
    function arch(uu) { return Math.sin(Math.PI * uu); }
    function yLE(uu) { return -camber * arch(uu) - chord * 0.08; }
    function yTE(uu) { return -camber * 0.42 * arch(uu) + chord * 0.72; }
    c.save(); c.translate(x, y);
    /* ombre allongée sous l'arc, pas une tache ronde */
    c.fillStyle = 'rgba(20,30,16,.18)';
    c.beginPath();
    c.ellipse(0, chord * 0.55, half * 0.92, chord * 0.18, 0, 0, TAU); c.fill();
    /* surface supérieure (extrados) */
    c.beginPath();
    c.moveTo(xAt(0.015), yLE(0.015));
    for (i = 1; i <= 20; i++) { u = i / 20; c.lineTo(xAt(0.015 + u * 0.97), yLE(0.015 + u * 0.97)); }
    for (i = 20; i >= 0; i--) { u = i / 20; c.lineTo(xAt(0.015 + u * 0.97), yTE(0.015 + u * 0.97)); }
    c.closePath();
    c.fillStyle = col.top; c.fill();
    c.strokeStyle = col.ink; c.lineWidth = Math.max(1.0, span * 0.018); c.stroke();
    /* bande d'intrados, plus sombre, le long du bord d'attaque */
    c.fillStyle = col.bot; c.globalAlpha = 0.55;
    c.beginPath();
    c.moveTo(xAt(0.04), yLE(0.04));
    for (i = 1; i <= 14; i++) { u = i / 14; c.lineTo(xAt(0.04 + u * 0.92), yLE(0.04 + u * 0.92)); }
    for (i = 14; i >= 0; i--) { u = i / 14; c.lineTo(xAt(0.04 + u * 0.92), lerp(yLE(0.04 + u * 0.92), yTE(0.04 + u * 0.92), 0.28)); }
    c.closePath(); c.fill(); c.globalAlpha = 1;
    /* nervures de caissons */
    c.strokeStyle = col.ink; c.globalAlpha = 0.42; c.lineWidth = Math.max(0.55, span * 0.009);
    for (i = 1; i < 10; i++) {
      u = i / 10;
      c.beginPath(); c.moveTo(xAt(u), yLE(u)); c.lineTo(xAt(u), yTE(u)); c.stroke();
    }
    c.globalAlpha = 1;
    /* bord d'attaque bien marqué (l'arc) */
    c.strokeStyle = col.ink; c.lineWidth = Math.max(1.8, span * 0.032); c.lineCap = 'round';
    c.beginPath();
    c.moveTo(xAt(0.015), yLE(0.015));
    for (i = 1; i <= 20; i++) { u = i / 20; c.lineTo(xAt(0.015 + u * 0.97), yLE(0.015 + u * 0.97)); }
    c.stroke();
    /* stabilos (bouts d'aile un peu relevés) */
    c.fillStyle = col.bot;
    c.beginPath(); c.moveTo(xAt(0.02), yLE(0.02)); c.lineTo(xAt(0.02) - span * 0.02 * face, yLE(0.02) - chord * 0.18); c.lineTo(xAt(0.10), yLE(0.10)); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(xAt(0.98), yLE(0.98)); c.lineTo(xAt(0.98) + span * 0.02 * face, yLE(0.98) - chord * 0.18); c.lineTo(xAt(0.90), yLE(0.90)); c.closePath(); c.fill();
    c.restore();
  }

  function drawLines(c, wx, wy, span, px, py, infl, pitch, sc) {
    if (infl < 0.12) { return; }
    sc = sc || 1;
    var a = clamp((infl - 0.12) / 0.65, 0, 1), i, n = 6;
    var shY = py - 18.5 * sc, shW = 5.2 * sc, slack = (1 - a) * 10 * sc;
    c.save(); c.globalAlpha = 0.84 * Math.max(a, 0.35); c.strokeStyle = '#2a2a28';
    c.lineWidth = Math.max(1.15, 0.48 * sc); c.lineCap = 'round';
    var ca = Math.cos(pitch || 0), sa = Math.sin(pitch || 0);
    for (i = 0; i < n; i++) {
      var u = (i + 0.5) / n, lx = (u - 0.5) * span * 0.86;
      var ax = wx + lx * ca, ay = wy + lx * sa + 2 * sc;
      var hx = px + (u < 0.5 ? -shW : shW), hy = shY;
      c.beginPath();
      c.moveTo(ax, ay);
      c.quadraticCurveTo(lerp(ax, hx, 0.5), lerp(ay, hy, 0.42) + slack, hx, hy);
      c.stroke();
    }
    c.globalAlpha = 0.95 * Math.max(a, 0.4);
    c.lineWidth = Math.max(1.45, 0.58 * sc); c.strokeStyle = '#3a332c';
    c.beginPath(); c.moveTo(px - shW, shY); c.lineTo(px - 3.4 * sc, py - 12 * sc); c.stroke();
    c.beginPath(); c.moveTo(px + shW, shY); c.lineTo(px + 3.4 * sc, py - 12 * sc); c.stroke();
    c.restore();
  }

  function drawHarness(c, x, y, sc) {
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#3a332c';
    c.beginPath(); c.ellipse(0, -11.2, 5.4, 2.5, 0, 0, TAU); c.fill();
    c.strokeStyle = '#1a1612'; c.lineWidth = 0.55; c.stroke();
    c.strokeStyle = '#2a241c'; c.lineWidth = 0.85;
    c.beginPath(); c.moveTo(-4.4, -11.2); c.lineTo(-2.6, -18.2); c.moveTo(4.4, -11.2); c.lineTo(2.6, -18.2); c.stroke();
    c.restore();
  }

  function drawCollapsedWing(c, x, y, span, col, face, t) {
    var k = clamp(t, 0, 1), s = span * (0.42 + 0.12 * k), i;
    c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(20,30,16,.22)';
    c.beginPath(); c.ellipse(-face * s * 0.06, s * 0.04, s * 0.62, s * 0.20, -0.2 * face, 0, TAU); c.fill();
    c.fillStyle = col.top; c.strokeStyle = col.ink; c.lineWidth = Math.max(0.8, s * 0.03);
    /* tas de tissu froissé, à l'échelle de la voile */
    c.beginPath();
    c.ellipse(-s * 0.18, -s * 0.06, s * 0.32, s * 0.16, -0.4, 0, TAU); c.fill(); c.stroke();
    c.beginPath();
    c.ellipse(s * 0.16, -s * 0.02, s * 0.36, s * 0.18, 0.35, 0, TAU); c.fill(); c.stroke();
    c.beginPath();
    c.ellipse(s * 0.02, -s * 0.16 * k, s * 0.28, s * 0.20, -0.1, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = col.bot;
    c.beginPath();
    c.ellipse(-s * 0.04, s * 0.04, s * 0.22, s * 0.10, 0.2, 0, TAU); c.fill();
    c.strokeStyle = col.ink; c.globalAlpha = 0.35; c.lineWidth = Math.max(0.5, s * 0.02);
    for (i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(-s * 0.2 + i * s * 0.14, -s * 0.08);
      c.quadraticCurveTo(-s * 0.05 + i * s * 0.1, s * 0.02, s * 0.12 + i * s * 0.08, s * 0.08);
      c.stroke();
    }
    c.globalAlpha = 1;
    c.restore();
  }

  /* ---------- animation des pilotes ---------- */
  function roster() {
    var ids = ORDER.slice(), i, ch = chosen;
    i = ids.indexOf(ch); if (i >= 0) { ids.splice(i, 1); ids.push(ch); }
    return ids;
  }

  /* t0 = début d'envol de chaque pilote ; atterrissage décalé dans le même ordre */
  function takeoffT(i) { return 1.9 + i * 1.12; }
  function landT(i) { return 27.6 + i * 0.68; }

  function poseOf(i, t, ids) {
    var t0 = takeoffT(i), tL = landT(i);
    var inflateDur = 0.75, runDur = 0.95, liftDur = 0.55, flareDur = 1.15, settleDur = 0.85;
    var p = { phase: 'wait', infl: 0, run: 0, fly: 0, air: 0, lift: 0, flare: 0, settle: 0, cele: 0, move: 0 };
    if (t < t0) {
      p.phase = 'wait';
    } else if (t < t0 + inflateDur) {
      p.phase = 'inflate'; p.infl = sst(t0, t0 + inflateDur, t);
    } else if (t < t0 + inflateDur + runDur) {
      p.phase = 'run'; p.infl = 1; p.run = sst(t0 + inflateDur, t0 + inflateDur + runDur, t); p.move = 1;
    } else if (t < t0 + inflateDur + runDur + liftDur) {
      p.phase = 'lift'; p.infl = 1; p.run = 1; p.lift = sst(t0 + inflateDur + runDur, t0 + inflateDur + runDur + liftDur, t);
      p.air = p.lift; p.fly = p.lift; p.move = 1 - p.lift;
    } else if (t < tL) {
      p.phase = 'fly'; p.infl = 1; p.air = 1; p.fly = 1;
    } else if (t < tL + flareDur) {
      p.phase = 'flare'; p.infl = 1; p.air = 1 - sst(tL + 0.7, tL + flareDur, t);
      p.fly = 1 - sst(tL + 0.55, tL + flareDur, t); p.flare = sst(tL, tL + 0.45, t);
    } else if (t < tL + flareDur + settleDur) {
      p.phase = 'settle'; p.settle = sst(tL + flareDur, tL + flareDur + settleDur, t); p.air = 0; p.fly = 0;
    } else {
      p.phase = 'cele'; p.settle = 1; p.cele = sst(tL + flareDur + settleDur, tL + flareDur + settleDur + 0.8, t);
    }
    p.id = ids[i]; p.i = i; p.t0 = t0; p.tL = tL;
    return p;
  }

  /* positions écran (pixels) */
  function formOff(i) {
    /* formation en V souple, le dernier (héros) un peu en tête */
    var o = [
      { x: -0.34, y: 0.15, z: 0.80 },
      { x: -0.04, y: 0.01, z: 0.98 },
      { x: -0.22, y: -0.17, z: 0.70 },
      { x: 0.16, y: 0.09, z: 1.08 },
      { x: -0.46, y: -0.04, z: 0.86 },
      { x: 0.30, y: -0.13, z: 1.14 }
    ];
    return o[i] || o[0];
  }

  function placePilot(i, t, ids, cw, ch, port, ground) {
    var p = poseOf(i, t, ids), fo = formOff(i), u = t;
    var slot = ground.slots && ground.slots[i];
    var gy = slot ? slot.y : ground.y, x0 = slot ? slot.x : (ground.x0 + i * ground.gap), face = 1;
    var unit = ground.unit, air = (p.phase === 'fly' || p.phase === 'lift' || p.phase === 'flare');
    var sc = air ? (ground.sc * (0.88 + fo.z * 0.12)) : (slot ? slot.sc : ground.sc);
    var x = x0, y = gy, wingH = 38 * sc;

    if (p.phase === 'wait' || p.phase === 'inflate') {
      x = x0; y = gy;
    } else if (p.phase === 'run') {
      x = x0 + p.run * ground.run; y = gy;
    } else if (p.phase === 'lift') {
      x = x0 + ground.run + p.lift * ground.run * 0.55;
      y = gy - p.lift * ch * 0.22;
    } else if (p.phase === 'fly') {
      var ft = t - (p.t0 + 2.25);
      var flyA = sst(9.2, 11.2, t);
      /* interpolation décollage → formation */
      var midY = port ? 0.41 : 0.52;
      var fx = cw * (0.54 + fo.x + Math.sin(ft * 0.55 + i) * 0.012);
      var fy = ch * (midY + fo.y + Math.sin(ft * 0.85 + i * 1.3) * 0.018);
      /* pendant la montée depuis le sommet */
      var climbX = x0 + ground.run * 1.55 + ft * cw * 0.04;
      var climbY = gy - ch * 0.22 - ft * ch * 0.05;
      x = lerp(climbX, fx, flyA);
      y = lerp(climbY, fy, flyA);
      /* à l'approche du Jura, la formation descend un peu */
      y += sst(25.5, 27.6, t) * ch * 0.08;
    } else if (p.phase === 'flare' || p.phase === 'settle' || p.phase === 'cele') {
      var lx = ground.lx + i * ground.lgap, ly = ground.ly;
      var ap = sst(26.6, 27.6, t);
      var midY2 = port ? 0.41 : 0.52;
      var fx = cw * (0.54 + fo.x), fy = ch * (midY2 + fo.y) + sst(25.5, 27.6, t) * ch * 0.08;
      if (p.phase === 'flare') {
        x = lerp(fx, lx, p.flare);
        y = lerp(fy, ly, sst(p.tL, p.tL + 1.15, t));
      } else {
        x = lx; y = ly;
      }
    }
    /* léger balancier sous la voile en vol */
    var swing = 0;
    if (p.fly > 0.2) { swing = Math.sin(t * 1.7 + i * 1.1) * 5.5 * p.fly * sc; x += swing; }
    p.x = x; p.y = y; p.face = face; p.sc = sc; p.unit = unit; p.swing = swing; p.wingH = wingH;
    p.gap = slot && slot.gap ? slot.gap : ground.gap; p.row = slot && slot.row;
    return p;
  }

  function groundWingPos(p, infl) {
    var sc = p.sc, gap = p.gap || 48 * sc;
    /* voile derriere le pilote (meme x), envergure < ecart de la rangee : zero chevauchement */
    var span = Math.min(84 * sc, gap * 0.68);
    infl = infl || 0;
    var up = (20 + (p.row === 'back' ? 6 : 2)) * sc;
    var y = p.y - lerp(up, 16 * sc, infl);
    var camber = span * 0.26;
    return {
      x: p.x,
      y: y,
      span: span,
      leY: y - camber * 0.55
    };
  }
  function drawPilotGround(ctx, p, t) {
    var col = WINGS[p.id] || WINGS.boy, sc = p.sc, span = 64 * sc, g;
    if (p.phase === 'wait') {
      g = groundWingPos(p, 0);
      drawWingOnGround(ctx, g.x, g.y, g.span, col, p.face, 0.55 + Math.sin(t * 1.3 + p.i) * 0.3);
    } else if (p.phase === 'inflate' && p.infl < 0.55) {
      g = groundWingPos(p, p.infl);
      ctx.globalAlpha = 1 - p.infl * 0.7;
      drawWingOnGround(ctx, g.x, g.y, g.span, col, p.face, 1 - p.infl);
      ctx.globalAlpha = 1;
    } else if (p.phase === 'settle' || p.phase === 'cele') {
      /* tas retombé DERRIÈRE le pilote, légèrement à l'amont */
      drawCollapsedWing(ctx, p.x - 16 * sc * p.face, p.y - 14 * sc, span * 0.95, col, p.face, p.settle || 1);
    }
  }
  function drawPilot(ctx, p, t) {
    var col = WINGS[p.id] || WINGS.boy, sc = p.sc, span = 64 * sc, camber = 8.4 * sc;
    var wx, wy, pitch = 0, infl = p.infl, g;
    if (p.phase === 'wait') {
      g = groundWingPos(p, 0);
      drawLines(ctx, g.x, g.leY, g.span, p.x, p.y, 0.45, 0, sc);
    } else if (p.phase === 'inflate') {
      /* la voile se lève derrière le pilote puis passe au-dessus de la tête */
      g = groundWingPos(p, infl);
      wx = lerp(g.x, p.x, infl);
      wy = lerp(g.y, p.y - p.wingH, Math.pow(infl, 0.6));
      pitch = -0.05;
      if (infl >= 0.18) {
        ctx.globalAlpha = Math.min(1, (infl - 0.18) / 0.35);
        drawCanopy(ctx, wx, wy, span * lerp(0.75, 1, infl), camber, col, Math.max(0.3, infl), pitch);
        ctx.globalAlpha = 1;
      }
      drawLines(ctx, (infl < 0.4 ? g.x : wx), (infl < 0.4 ? g.leY : wy), infl < 0.4 ? g.span : span, p.x, p.y, Math.max(0.4, infl), pitch, sc);
    } else if (p.phase !== 'settle' && p.phase !== 'cele') {
      /* voile centrée au-dessus du pilote, suspentes vers les épaules */
      pitch = -0.05 + Math.sin(t * 1.7 + p.i) * 0.03;
      wx = p.x;
      wy = p.y - p.wingH * (p.phase === 'flare' ? lerp(1, 0.78, p.flare) : 1);
      drawCanopy(ctx, wx, wy, span, camber, col, 1, pitch);
      drawLines(ctx, wx, wy, span, p.x, p.y, 1, pitch, sc);
      if (p.fly > 0.4) { drawHarness(ctx, p.x, p.y, sc); }
    }


    var hp = {
      x: p.x, y: p.y, face: p.face, t: t, phase: (p.move > 0.05 ? t * 8.5 : t * 1.2),
      move: p.move, air: p.air > 0.15, vy: p.phase === 'lift' ? -40 : (p.phase === 'flare' ? 20 : 0),
      sq: 0, cele: p.cele || 0, scale: sc, stride: 5.2, char: p.id, nopole: true, fly: p.fly,
      shadow: p.phase !== 'fly' && p.phase !== 'lift'
    };
    A.drawHiker(ctx, hp);
  }

  /* ---------- scènes / fonds ---------- */
  function pickTx(port) { return plate(port ? 'ending-txindoki-port' : 'ending-txindoki-land'); }
  function pickMerin(port) { return plate(port ? 'cine-w2-merin-port' : 'cine-w2-merin-land'); }

  function sceneBlend(t) {
    /* liste [t0, t1, id, zoom0, zoom1, fx0, fx1, fy0, fy1] puis fond suivant en fondu */
    var seq = [
      { a: -1, b: 10.4, id: null, zoom: [1.16, 1.10], fx: [0.42, 0.55], fy: [0.58, 0.50], kind: 'tx' },
      { a: 9.6, b: 14.0, id: 'cine-w2-basque', zoom: [1.14, 1.10], fx: [0.38, 0.58], fy: [0.55, 0.48] },
      { a: 13.3, b: 17.2, id: 'cine-w2-landes', zoom: [1.12, 1.08], fx: [0.42, 0.58], fy: [0.52, 0.48] },
      { a: 16.5, b: 20.4, id: 'cine-w2-massif', zoom: [1.18, 1.14], fx: [0.58, 0.62], fy: [0.48, 0.46] },
      { a: 19.7, b: 23.8, id: 'cine-w2-bresse', zoom: [1.12, 1.08], fx: [0.40, 0.58], fy: [0.50, 0.46] },
      { a: 23.1, b: 27.4, id: 'cine-w2-jura-approche', zoom: [1.14, 1.10], fx: [0.42, 0.55], fy: [0.52, 0.50] },
      { a: 26.6, b: 40, id: null, zoom: [1.14, 1.10], fx: [0.48, 0.52], fy: [0.58, 0.54], kind: 'merin' }
    ];
    return seq;
  }

  function drawWorld(ctx, t, cw, ch, port) {
    var seq = sceneBlend(t), i, prev = null, curR = null;
    for (i = 0; i < seq.length; i++) {
      var s = seq[i];
      if (t < s.a) { break; }
      var a = (t < s.b) ? (prev ? sst(s.a, s.a + 0.9, t) : 1) : (i === seq.length - 1 ? 1 : 1);
      /* si le plan suivant a commencé, celui-ci fond */
      var fadeOut = 1;
      if (i + 1 < seq.length && t >= seq[i + 1].a) { fadeOut = 1 - sst(seq[i + 1].a, seq[i + 1].a + 0.9, t); }
      var vis = (prev ? sst(s.a, s.a + 0.9, t) : 1) * fadeOut;
      if (vis < 0.01) { prev = s; continue; }
      var u = sst(s.a, Math.max(s.a + 0.01, s.b), t);
      var z = lerp(s.zoom[0], s.zoom[1], u), fx = lerp(s.fx[0], s.fx[1], u), fy = lerp(s.fy[0], s.fy[1], u);
      var img = s.kind === 'tx' ? pickTx(port) : s.kind === 'merin' ? pickMerin(port) : plate(s.id);
      var r = drawPlate(ctx, img, cw, ch, z, fx, fy, vis);
      if (r && vis > 0.5) { curR = { r: r, kind: s.kind || 'fly', img: img, vis: vis }; }
      prev = s;
    }
    /* fondu vers la toile « bientôt » */
    var soonA = sst(IMG0, IMG1, t);
    if (soonA > 0.001) { drawPlate(ctx, plate('cine-w2-soon'), cw, ch, 1.08, 0.5, 0.55, soonA); }
    return curR;
  }

  function groundFrom(cur, cw, ch, port, t, phase) {
    var unit = Math.min(cw, ch) / (port ? 150 : 165);
    var sc = unit;
    if (t < 11) { sc *= port ? 0.88 : 0.92; } else if (t >= 26.4) { sc *= port ? 0.95 : 1.0; } else { sc *= port ? 0.92 : 0.95; }
    var gy, x0, gap, run, lx, ly, lgap;
    if (phase === 'merin' || t >= 26.4) {
      /* atterrissage : pré dans le tiers bas */
      var r = cur && cur.r;
      gy = r ? iy(r, port ? 0.84 : 0.82, cur.img) : ch * 0.82;
      x0 = cw * (port ? 0.18 : 0.22);
      gap = cw * (port ? 0.105 : 0.09);
      run = cw * 0.12;
      lx = cw * (port ? 0.20 : 0.24);
      ly = gy;
      lgap = cw * (port ? 0.11 : 0.095);
    } else {
      /* Txindoki : herbe / sentier au premier plan */
      var r2 = cur && cur.r;
      gy = r2 ? iy(r2, port ? 0.785 : 0.80, cur.img) : ch * 0.785;
      x0 = cw * (port ? 0.085 : 0.12);
      gap = cw * (port ? 0.145 : 0.115);
      run = cw * (port ? 0.26 : 0.20);
      lx = x0; ly = gy; lgap = gap;
    }
    var slots = null;
    if (port && !(phase === 'merin' || t >= 26.4)) {
      /* portrait décollage : deux rangées, écart vertical > hauteur des voiles (derrière le pilote) */
      var backY = gy - Math.max(92, Math.min(ch * 0.10, 112));
      var gapX = cw * 0.30;
      slots = [
        { x: cw * 0.18, y: backY, sc: sc * 0.80, gap: gapX, row: 'back' },
        { x: cw * 0.50, y: backY, sc: sc * 0.80, gap: gapX, row: 'back' },
        { x: cw * 0.82, y: backY, sc: sc * 0.80, gap: gapX, row: 'back' },
        { x: cw * 0.34, y: gy, sc: sc, gap: gapX, row: 'front' },
        { x: cw * 0.66, y: gy, sc: sc, gap: gapX, row: 'front' },
        { x: cw * 0.88, y: gy, sc: sc * 0.96, gap: gapX, row: 'front' }
      ];
      x0 = slots[0].x; gap = gapX;
    }
    return { y: gy, x0: x0, gap: gap, run: run, unit: unit, sc: sc, lx: lx, ly: ly, lgap: lgap, slots: slots };
  }

  function stripAcc(s) {
    return String(s).replace(/[ÀÁÂÄ]/g, 'A').replace(/[ÈÉÊË]/g, 'E').replace(/[ÌÍÎÏ]/g, 'I')
      .replace(/[ÒÓÔÖ]/g, 'O').replace(/[ÙÚÛÜ]/g, 'U').replace(/Ç/g, 'C');
  }
  /* Press Start 2P n'a pas les capitales accentuées : lettre nue + accent en pixels (comme les cartes postales) */
  function fillPixTitle(ctx, raw, cx, cy, color) {
    var base = stripAcc(raw), i, fs = parseFloat(ctx.font) || 12, u = Math.max(1.5, fs / 6.5);
    ctx.fillStyle = color;
    ctx.fillText(base, cx, cy);
    var w = ctx.measureText(base).width, left = cx - w / 2, ch, x0, w0, mx, ay;
    ay = cy - fs * 0.68;
    for (i = 0; i < raw.length; i++) {
      if (raw.charAt(i) === base.charAt(i)) { continue; }
      ch = raw.charAt(i);
      x0 = left + ctx.measureText(base.slice(0, i)).width;
      w0 = ctx.measureText(base.charAt(i)).width;
      mx = x0 + w0 / 2;
      ctx.fillStyle = color;
      if (ch === 'Ô' || ch === 'Â' || ch === 'Ê' || ch === 'Î') {
        ctx.fillRect(mx - u * 0.5, ay, u, u);
        ctx.fillRect(mx - u * 1.5, ay + u, u, u);
        ctx.fillRect(mx + u * 0.5, ay + u, u, u);
      } else if (ch === 'É') {
        ctx.fillRect(mx + u * 0.2, ay, u, u);
        ctx.fillRect(mx - u * 0.6, ay + u, u, u);
      } else {
        ctx.fillRect(mx - u * 1.2, ay, u, u);
        ctx.fillRect(mx - u * 0.4, ay + u, u, u);
      }
    }
  }
  function drawCaptions(ctx, t, cw, ch, d) {
    var q, y = Math.max(36 * d, ch * 0.08), fs = clamp(cw / 28, 9, 15 * d);
    var subFont = '600 ' + Math.max(11, fs * 0.78) + 'px system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    for (q = 0; q < CAP.length; q++) {
      var c = CAP[q], a = sst(c[0], c[0] + 0.8, t) * (1 - sst(c[1] - 0.8, c[1], t)); if (a < 0.01) { continue; }
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = fs + 'px "Press Start 2P", monospace';
      var w1 = ctx.measureText(stripAcc(c[2])).width;
      ctx.font = subFont;
      var w2 = ctx.measureText(c[3]).width, w = Math.min(cw - 16 * d, Math.max(w1, w2) + 24 * d), ph = fs * 3.35;
      ctx.fillStyle = 'rgba(14,18,51,.62)'; ctx.fillRect(cw / 2 - w / 2, y - ph / 2, w, ph);
      ctx.fillStyle = '#ffd34d'; ctx.fillRect(cw / 2 - w / 2, y - ph / 2, w, 1.3 * d); ctx.fillRect(cw / 2 - w / 2, y + ph / 2 - 1.3 * d, w, 1.3 * d);
      ctx.font = fs + 'px "Press Start 2P", monospace';
      fillPixTitle(ctx, c[2], cw / 2 + 0.8 * d, y - fs * 0.55 + 0.8 * d, '#1a1420');
      fillPixTitle(ctx, c[2], cw / 2, y - fs * 0.55, '#ffd34d');
      ctx.font = subFont;
      ctx.fillStyle = '#f4efe2'; ctx.fillText(c[3], cw / 2, y + fs * 0.78, cw - 24 * d);
      ctx.restore();
    }
  }

  function drawVignette(ctx, cw, ch, a) {
    if (a < 0.01) { return; }
    var g = ctx.createRadialGradient(cw * 0.5, ch * 0.45, Math.min(cw, ch) * 0.25, cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.72);
    g.addColorStop(0, 'rgba(8,6,30,0)'); g.addColorStop(1, 'rgba(8,6,30,.5)');
    ctx.globalAlpha = a * 0.85; ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1;
  }

  function drawFrame(ctx, t, cw, ch, d) {
    var port = G.port;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#0b1a28'; ctx.fillRect(0, 0, cw, ch);
    var cur = drawWorld(ctx, t, cw, ch, port);
    var kind = (t >= 26.4) ? 'merin' : (t < 10.2 ? 'tx' : 'fly');
    var gnd = groundFrom(cur, cw, ch, port, t, kind);
    var ids = roster(), i, pilots = [];
    for (i = 0; i < 6; i++) { pilots.push(placePilot(i, t, ids, cw, ch, port, gnd)); }
    /* loin → près (z / taille) */
    pilots.sort(function (a, b) { return (a.y - b.y) || (a.sc - b.sc); });
    for (i = 0; i < pilots.length; i++) { drawPilotGround(ctx, pilots[i], t); }
    for (i = 0; i < pilots.length; i++) { drawPilot(ctx, pilots[i], t); }
    drawVignette(ctx, cw, ch, 1 - sst(IMG0, IMG1, t) * 0.4);
    drawCaptions(ctx, t, cw, ch, d);
    /* fondus */
    var fade = 1 - sst(0, FADEIN, t);
    if (st && st.skipT >= 0) { fade = Math.max(fade, st.skipT / 0.4); }
    if (fade > 0.002) { ctx.globalAlpha = fade; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
  }

  /* ---------- API, garde-fous ---------- */
  function warn(m, e) { try { console.warn('[cineW2] ' + m + (e ? ' : ' + (e.message || e) : '')); } catch (x) {} }
  function sfxRef() { return window.Sfx; }
  function clearWd() { if (wdTimer) { clearInterval(wdTimer); wdTimer = 0; } }
  function finish() {
    if (!st || st.finished) { return; } st.finished = true; clearWd();
    try { var Sf = sfxRef(); if (Sf && Sf.cineStop) { Sf.cineStop(); } } catch (e0) {}
    var f = onEndCb; onEndCb = null;
    if (f) { try { f(); } catch (e) { warn('fin', e); } }
  }
  function abort(why) {
    if (!st || st.finished) { return; }
    warn('animation abandonnée (' + why + ')'); st.aborted = why; clearWd();
    try { var SfA = sfxRef(); if (SfA && SfA.cineStop) { SfA.cineStop(); } } catch (eA) {}
    mode = 'soon'; finish();
  }
  function fail(e) {
    if (!st || mode === 'off') { return; }
    st.errs = (st.errs || 0) + 1; st.rescue = true; warn('erreur de rendu', e);
    if (st.errs >= 3) { abort('erreurs répétées'); }
  }
  function wdTick() {
    if (mode !== 'cine' || !st || st.finished) { return; }
    var now = performance.now(); if (document.hidden) { st.lastFrame = now; return; }
    if (now - st.lastFrame > 9000) { abort('image figée'); }
  }

  function start(W, H, d, o) {
    o = o || {}; loadImgs();
    var sv = window.Save && window.Save.get(); chosen = (sv && sv.character) || 'boy';
    layout(W, H, d); mode = 'cine'; onEndCb = o.onEnd || null;
    st = { t: 0, replay: !!o.replay, pending: true, skipT: -1, finished: false, ev: 0, wall: 0, lastFrame: performance.now(), rescue: false, errs: 0, waited: false };
    clearWd(); wdTimer = setInterval(wdTick, 1000);
  }
  function upd(dt, raw) {
    var Sf = sfxRef();
    if (mode === 'cine') {
      if (st.pending) {
        if (st.waited && (allReady || st.wall > 2.5)) { st.pending = false; st.t = 0; st.lastFrame = performance.now(); }
        st.waited = true; st.wall += raw || dt; return;
      }
      if (st.want && performance.now() >= st.want.at) { var w = st.want; st.want = null; layout(w.W, w.H, w.d); }
      st.wall += Math.min(raw || dt, 0.25);
      if (st.skipT >= 0) {
        st.skipT += dt; if (st.skipT >= 0.4) { st.t = IMG1 + 0.01; st.skipT = -1; mode = 'soon'; try { if (Sf) { Sf.play('chord'); } } catch (e) {} finish(); }
      } else {
        if (!st.hold) { st.t += dt; }
        var t = st.t;
        if (Sf && !st.noSnd) {
          try {
            if (!(st.ev & 1) && t >= 0.4) { st.ev |= 1; }
            /* pas de course */
            if (t > 2.2 && t < 10) {
              var ids = roster(), k, p;
              for (k = 0; k < 6; k++) {
                p = poseOf(k, t, ids);
                if (p.phase === 'run') {
                  var step = Math.floor((t - (p.t0 + 0.75)) * 4);
                  if (st['sk' + k] !== step) { st['sk' + k] = step; Sf.step('grass'); }
                }
              }
            }
            if (!(st.ev & 4) && t >= IMG0 + 0.15) { st.ev |= 4; Sf.play('chord'); }
            /* mode parapente : air laminaire, toile, variomètre — sans toucher au visuel */
            var air = 0, lift = 0, spd = 0;
            if (t >= 3.2 && t < IMG0 - 0.4) {
              if (t < 8) { air = Math.max(0, (t - 3.2) / 4.5); lift = air * 0.85; }
              else if (t > 27) { air = Math.max(0, (IMG0 - 0.4 - t) / 6); lift = air * 0.2; }
              else { air = 1; lift = (t < 16) ? 0.7 : 0.25; }
              spd = 0.5 + 0.4 * air;
              Sf.cine({ para: 1, glide: 1, speed: spd, lift: lift, on: true });
            } else if (t >= IMG0 - 0.4) { Sf.cineStop(); }
          } catch (e) { st.sfxErr = (st.sfxErr || 0) + 1; if (st.sfxErr >= 3) { st.noSnd = true; } }
        }
        if (t >= DUR) { mode = 'soon'; finish(); }
      }
    }
  }
  function update(dt, raw) {
    if (mode === 'off' || !st) { return; }
    if (raw == null) { raw = dt; } st.lastFrame = performance.now();
    try { upd(dt, raw); } catch (e) { fail(e); }
  }
  function draw(ctx, W, H, d) {
    if (mode === 'off' || !st) { return; }
    var cw = Math.round(W * d), ch = Math.round(H * d);
    try {
      if (mode === 'cine' && st.pending) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#ffd34d'; ctx.font = Math.round(12 * d) + 'px "Press Start 2P", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Préparation des voiles…', cw / 2, ch / 2);
        return;
      }
      drawFrame(ctx, st.t, cw, ch, d);
    } catch (e) { fail(e); }
  }
  function skip() {
    if (mode === 'cine' && st && st.skipT < 0 && !st.pending) { st.skipT = 0; return true; } return false;
  }
  function stop() { try { var Sf = sfxRef(); if (Sf && Sf.cineStop) { Sf.cineStop(); } } catch (eS) {} clearWd(); mode = 'off'; st = null; onEndCb = null; }
  function resizeTo(W, H, d) {
    if (mode === 'off' || !st) { return; }
    if (mode === 'cine' && !st.pending) {
      st.want = { W: W, H: H, d: d, at: performance.now() + 200 };
    } else { layout(W, H, d); }
  }

  window.CineW2 = {
    start: start, update: update, draw: draw, skip: skip, stop: stop,
    preload: loadImgs,
    active: function () { return mode === 'cine'; },
    soon: function () { return mode === 'soon'; },
    mode: function () { return mode; },
    canSkip: function () { return !!(st && mode === 'cine' && !st.pending); },
    rescue: function () { return !!(st && st.rescue && mode === 'cine'); },
    prepare: function () {},
    dprCap: function () { return 1.75; },
    setHook: function (f) { hook = f; },
    revive: function () { if (st) { st.revive = true; } },
    fail: fail,
    isReplay: function () { return !!(st && st.replay); },
    resize: resizeTo,
    duration: DUR,
    _seek: function (t) { if (st) { st.t = t; st.skipT = -1; st.hold = true; if (mode === 'soon' && t < DUR) { mode = 'cine'; } } },
    _play: function () { if (st) { st.hold = false; } },
    _state: function () { return st ? { t: st.t, mode: mode, replay: st.replay, pending: st.pending, port: G.port } : { mode: mode }; }
  };
})();
