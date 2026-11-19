/* v0.4.0 — dessin des mécaniques d'environnement : passage à niveau et train du Panoramique des Dômes (stylisé, vue de côté),
   randonneurs qui piétinent les dalles fragiles, brouillard, soleil écrasant, neige, rafales de vent.
   Ce fichier ne contient que du dessin ; la logique est dans js/game.js. */
(function () {
  'use strict';
  var A = window.Art, clamp = A.clamp, lerp = A.lerp, hash = A.hash, mix = A.mix;
  var K = { sun: 0, snow: 0, fog: 0, shade: 0, wind: 0 };       // intensités lissées (0..1) autour du randonneur
  var flakes = null;

  function zoneK(E, dt) {
    var P = E.P, ZN = E.ZN, FOGD = E.FOGD, len = E.len, i, n = 0, s = { sun: 0, snow: 0, fog: 0, shade: 0 };
    if (!ZN || !P) { return; }
    for (i = -30; i <= 60; i += 15) { var x = Math.max(0, Math.min(len, (P.x + i) | 0)); n++; var z = ZN[x]; if (z & 1) { s.sun++; } if (z & 2) { s.shade++; } if (z & 4) { s.snow++; } if (z & 8) { s.fog += FOGD[x]; } }
    var kk = 1 - Math.exp(-dt * 2.2);
    K.sun += (s.sun / n - K.sun) * kk; K.shade += (s.shade / n - K.shade) * kk; K.snow += (s.snow / n - K.snow) * kk; K.fog += (s.fog / n - K.fog) * kk;
    K.wind += (Math.max(E.wind.warn * 0.6, E.wind.str) - K.wind) * (1 - Math.exp(-dt * 4));
  }

  /* ---------- v0.4.1 : voie ferrée à crémaillère posée sur un remblai qui suit le terrain, caténaire sur poteaux bordeaux ---------- */
  var WIRE_H = 46;                                    // hauteur du fil de contact au-dessus du rail
  function tY(E, x, tr) {                              // hauteur du dessus des rails en x (le remblai repose toujours sur le sol)
    x = Math.max(0, Math.min(E.len, x | 0));
    var g = E.G[x]; if (!isFinite(g)) { g = E.GF[x]; }
    var lx = tr ? Math.max(tr.xl, Math.min(tr.xr, x)) : x, le = E.LEDGE ? E.LEDGE[lx] : 0;
    return g - (le || 0);
  }
  function rails(c, xa, xb, E) {
    var R = E.RAIL, LG = E.LEDGE, G = E.G, x, run = null, runs = [], a = Math.max(1, Math.floor(xa) - 40), b = Math.min(E.len - 1, Math.ceil(xb) + 40);
    if (!R) { return; }
    for (x = a; x <= b; x++) { if (R[x]) { if (!run) { run = [x, x]; } else { run[1] = x; } } else if (run) { runs.push(run); run = null; } }
    if (run) { runs.push(run); }
    runs.forEach(function (r) {
      var x0 = r[0], x1 = r[1], k, yT;
      // remblai (ballast gris clair en haut, talus sombre dessous) : le bas suit le sol, le haut suit la voie
      c.beginPath(); c.moveTo(x0, G[x0] + 1.6);
      for (x = x0; x <= x1; x += 2) { c.lineTo(x, tY(E, x)); }
      c.lineTo(x1, tY(E, x1)); c.lineTo(x1, G[x1] + 1.6);
      for (x = x1; x >= x0; x -= 2) { c.lineTo(x, G[x] + 1.6); }
      c.closePath(); c.fillStyle = '#7d7b72'; c.fill();
      c.beginPath(); c.moveTo(x0, tY(E, x0));
      for (x = x0; x <= x1; x += 2) { c.lineTo(x, tY(E, x)); }
      for (x = x1; x >= x0; x -= 2) { c.lineTo(x, tY(E, x) + 2.4); }
      c.closePath(); c.fillStyle = '#b0aca2'; c.fill();
      for (x = x0 + 1; x < x1; x += 2.6) {                           // cailloux de ballast
        var hh = hash(x | 0, 7), yy = tY(E, x) + 0.4 + hh * Math.max(0.5, (LG[x | 0] || 0) + 1.0);
        c.fillStyle = hh > 0.5 ? 'rgba(236,232,222,.55)' : 'rgba(50,48,44,.45)'; c.fillRect(x, yy, 1.1 + hh, 0.8);
      }
      // traverses
      for (x = Math.ceil(x0 / 6.5) * 6.5; x < x1; x += 6.5) { yT = tY(E, x); c.fillStyle = '#56545a'; c.fillRect(x - 1.4, yT - 1.1, 2.8, 1.3); }
      // rails (rail de roulement + rail à crémaillère au centre)
      c.lineCap = 'butt'; c.lineJoin = 'round';
      c.beginPath(); for (x = x0; x <= x1; x += 2) { yT = tY(E, x); if (x === x0) { c.moveTo(x, yT - 1.2); } else { c.lineTo(x, yT - 1.2); } } c.lineTo(x1, tY(E, x1) - 1.2);
      c.strokeStyle = '#2f333a'; c.lineWidth = 1.2; c.stroke();
      c.beginPath(); for (x = x0; x <= x1; x += 2) { yT = tY(E, x); if (x === x0) { c.moveTo(x, yT - 1.9); } else { c.lineTo(x, yT - 1.9); } } c.lineTo(x1, tY(E, x1) - 1.9);
      c.strokeStyle = '#cfd4dc'; c.lineWidth = 0.6; c.stroke();
      c.beginPath(); for (x = x0; x <= x1; x += 2) { yT = tY(E, x); if (x === x0) { c.moveTo(x, yT - 3.0); } else { c.lineTo(x, yT - 3.0); } } c.lineTo(x1, tY(E, x1) - 3.0);
      c.setLineDash([1.1, 1.1]); c.strokeStyle = '#8a8f99'; c.lineWidth = 0.9; c.stroke(); c.setLineDash([]);
      // caténaire : poteaux bordeaux tous les ~190 px, fil de contact parallèle au rail
      var pk0 = Math.ceil((x0 + 8) / 190), pk1 = Math.floor((x1 - 8) / 190), skip;
      c.beginPath(); for (x = x0; x <= x1; x += 4) { yT = tY(E, x) - WIRE_H; if (x === x0) { c.moveTo(x, yT); } else { c.lineTo(x, yT); } }
      c.strokeStyle = 'rgba(46,40,48,.9)'; c.lineWidth = 0.5; c.stroke();
      for (k = pk0; k <= pk1; k++) {
        var px = k * 190 + hash(k, 55) * 14; skip = false;
        E.trains.forEach(function (tr) { if (px > tr.x0 - 20 && px < tr.x1 + 20) { skip = true; } });
        if (skip || px < x0 + 4 || px > x1 - 4) { continue; }
        var yb = tY(E, px) + 0.8, ytop = yb - WIRE_H - 7;
        c.fillStyle = '#5c2326'; c.beginPath(); c.moveTo(px - 1.3, yb); c.lineTo(px - 0.8, ytop); c.lineTo(px + 0.8, ytop); c.lineTo(px + 1.3, yb); c.closePath(); c.fill();
        c.fillStyle = 'rgba(214,120,110,.5)'; c.fillRect(px - 0.9, ytop, 0.5, yb - ytop);
        c.fillStyle = '#4a1d20'; c.fillRect(px - 6, ytop + 1.2, 12, 1.1); c.fillRect(px - 1.7, yb - 1.4, 3.4, 1.6);
        c.strokeStyle = 'rgba(46,40,48,.9)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(px, ytop + 2.2); c.lineTo(px, yb - WIRE_H); c.stroke();   // pendule
      }
    });
  }

  /* ---------- passage à niveau : platelage béton, rails, barrières à bras rouge et blanc qui s'abaissent, feux clignotants ---------- */
  function boom(c, px, py, dir, g, on, t) {                   // bras de barrière articulé à (px, py-9) ; dir = +1 vers la droite, -1 vers la gauche
    var len = 30.5, ang = (1 - g) * 1.25;
    c.save(); c.translate(px, py - 9.5); c.scale(dir, 1); c.rotate(-ang);
    c.fillStyle = '#26262c'; c.fillRect(-5, -1, 6, 2);                                            // contrepoids
    for (var q = 0; q < 8; q++) { c.fillStyle = q % 2 ? '#f4f1e8' : '#d83a2a'; c.fillRect(q * (len / 8), -0.9, len / 8 + 0.1, 1.8); }
    c.strokeStyle = '#26262c'; c.lineWidth = 0.4; c.strokeRect(0, -0.9, len, 1.8);
    if (g > 0.4) { var o = on && (Math.floor(t * 4) % 2 === 0); c.fillStyle = o ? '#ff4030' : '#5a1c16'; c.beginPath(); c.arc(len - 1.8, -2.2, 1.1, 0, 7); c.fill(); }
    c.restore();
    c.fillStyle = '#e8e6df'; c.fillRect(px - 1.4, py - 10, 2.8, 10); c.fillStyle = '#d83a2a'; c.fillRect(px - 1.4, py - 7, 2.8, 2.2); c.fillStyle = '#26262c'; c.fillRect(px - 1.6, py - 10.4, 3.2, 1.6);
  }
  function crossing(c, tr, E) {
    var G = E.G, y0 = G[tr.cx] != null ? G[tr.cx] : 0, x0 = tr.x0, x1 = tr.x1, t = E.time, x;
    // platelage du passage (panneaux de béton), rails et crémaillère au même niveau que le chemin
    c.fillStyle = '#8f8c84'; c.fillRect(x0 - 2, y0 - 0.2, x1 - x0 + 4, 3);
    c.fillStyle = '#c4c0b6'; c.fillRect(x0 - 2, y0 - 1.0, x1 - x0 + 4, 1.1);
    c.fillStyle = 'rgba(50,48,44,.5)'; for (x = x0; x < x1; x += 7.7) { c.fillRect(x, y0 - 1, 0.5, 2.6); }
    c.fillStyle = '#2f333a'; c.fillRect(x0 - 2, y0 - 2.0, x1 - x0 + 4, 1.1);
    c.fillStyle = '#cfd4dc'; c.fillRect(x0 - 2, y0 - 2.4, x1 - x0 + 4, 0.55);
    c.fillStyle = '#8a8f99'; for (x = x0 - 1; x < x1 + 1; x += 2.2) { c.fillRect(x, y0 - 3.4, 1.1, 1.0); }
    // poteaux de signalisation (croix de Saint-André, feux alternés) et barrières : une de chaque côté
    var lampOn = tr.state === 'warn' || tr.state === 'pass';
    [x0 - 10, x1 + 10].forEach(function (px, si) {
      var py = G[Math.max(0, Math.min(E.len, px | 0))]; if (!isFinite(py)) { py = y0; }
      boom(c, si === 0 ? x0 - 5 : x1 + 5, y0, si === 0 ? 1 : -1, tr.g, lampOn, t);
      c.fillStyle = '#2a2a30'; c.fillRect(px - 0.7, py - 27, 1.4, 27);
      c.fillStyle = '#f2f2f2'; c.fillRect(px - 0.7, py - 24, 1.4, 3); c.fillStyle = '#d83a2a'; c.fillRect(px - 0.7, py - 21, 1.4, 3); c.fillStyle = '#f2f2f2'; c.fillRect(px - 0.7, py - 18, 1.4, 3); c.fillStyle = '#d83a2a'; c.fillRect(px - 0.7, py - 15, 1.4, 3);
      c.save(); c.translate(px, py - 31); c.strokeStyle = '#d83a2a'; c.lineWidth = 1.8; c.lineCap = 'butt';
      c.beginPath(); c.moveTo(-6.5, -4); c.lineTo(6.5, 4); c.moveTo(6.5, -4); c.lineTo(-6.5, 4); c.stroke();
      c.strokeStyle = '#2a2a30'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-7.2, -4.9); c.lineTo(7.2, 4.9); c.moveTo(7.2, -4.9); c.lineTo(-7.2, 4.9); c.stroke(); c.restore();
      var lamp = [0, 0];
      if (tr.state === 'warn') { var bl = Math.floor(t * 4) % 2; lamp = si === 0 ? [bl, 1 - bl] : [1 - bl, bl]; } else if (tr.state === 'pass') { lamp = [1, 1]; }
      for (var li = 0; li < 2; li++) {
        var ly = py - 36.5, lx = px + (li ? 2.6 : -2.6), on = lamp[li] === 1;
        c.fillStyle = '#1c1c22'; c.beginPath(); c.arc(lx, ly, 2.2, 0, 7); c.fill();
        c.fillStyle = on ? '#ff3b2a' : '#4a1814'; c.beginPath(); c.arc(lx, ly, 1.5, 0, 7); c.fill();
        if (on) { c.save(); c.globalCompositeOperation = 'lighter'; var gg = c.createRadialGradient(lx, ly, 0, lx, ly, 10); gg.addColorStop(0, 'rgba(255,80,50,.8)'); gg.addColorStop(1, 'rgba(255,80,50,0)'); c.fillStyle = gg; c.fillRect(lx - 10, ly - 10, 20, 20); c.restore(); }
      }
    });
    // chevrons jaunes et noirs au sol avant les rails : « attention »
    [[x0 - 24, -1], [x1 + 12, 1]].forEach(function (a) {
      var gx = a[0], gy = G[Math.max(0, Math.min(E.len, gx | 0))]; if (!isFinite(gy)) { return; }
      for (var q = 0; q < 6; q++) { c.fillStyle = q % 2 ? '#1c1c22' : (tr.state === 'clear' ? '#d9b638' : '#ffd34d'); c.fillRect(gx + q * 2, gy - 0.4, 1.6, 1.1); }
    });
  }

  /* ---------- le train du Panoramique des Dômes (d'après les photos) : rame blanche articulée à 3 éléments, cabine noire à grand pare-brise,
     baies vitrées sombres, bandeau mauve « silhouette de montagnes » en bas de caisse, logo, pantographe sous caténaire ; face à gauche ---------- */
  var SEGS = [[0, 98], [98, 68], [166, 66]];
  function trainBody(c, tr, E) {
    if (tr.state !== 'pass') { return; }
    var Ltot = tr.len, xl0 = tr.tx - Ltot / 2, i, H = 38, t = E.time;
    c.save();
    // ombre portée sur le ballast
    c.fillStyle = 'rgba(15,8,25,.22)'; c.beginPath(); c.ellipse(tr.tx, tY(E, tr.tx, tr) + 0.6, Ltot * 0.48, 1.8, 0, 0, 7); c.fill();
    SEGS.forEach(function (sg, si) {
      var len = sg[1], xc = xl0 + sg[0] + len / 2, yL = tY(E, xc - len * 0.36, tr), yR = tY(E, xc + len * 0.36, tr), yc = (yL + yR) / 2, ang = Math.atan2(yR - yL, len * 0.72), hl = len / 2;
      c.save(); c.translate(xc, yc); c.rotate(ang);
      // bogies
      [[-hl + 13], [hl - 13]].forEach(function (b) {
        c.fillStyle = '#23242b'; c.fillRect(b[0] - 8, -7.4, 16, 4.6);
        c.fillStyle = '#10111a'; c.beginPath(); c.arc(b[0] - 4.5, -4.0, 2.6, 0, 7); c.arc(b[0] + 4.5, -4.0, 2.6, 0, 7); c.fill();
        c.fillStyle = '#9aa0ac'; c.beginPath(); c.arc(b[0] - 4.5, -4.0, 1, 0, 7); c.arc(b[0] + 4.5, -4.0, 1, 0, 7); c.fill();
      });
      // caisse blanche
      c.beginPath();
      if (si === 0) { c.moveTo(-hl + 7, -H); c.quadraticCurveTo(-hl + 1.5, -H, -hl + 1, -H + 6); c.lineTo(-hl - 0.6, -13); c.quadraticCurveTo(-hl - 0.8, -8, -hl + 3, -6.5); }
      else { c.moveTo(-hl, -H + 1); c.lineTo(-hl, -6.5); }
      c.lineTo(hl + 0.4, -6.5); c.lineTo(hl + 0.4, -H + 1.5); c.quadraticCurveTo(hl + 0.4, -H, hl - 2, -H); c.closePath();
      c.fillStyle = A.grad(c, 0, -H, 0, -6, [0, '#ffffff', 0.55, '#f1f3f7', 1, '#c3cad6']); c.fill(); c.lineWidth = 0.55; c.strokeStyle = '#2a3140'; c.stroke();
      // bandeau mauve en bas de caisse : silhouette de montagnes (puys) + liseré
      c.save(); c.clip();
      var x, ph = si * 31.7;
      c.beginPath(); c.moveTo(-hl - 2, -6.6);
      for (x = -hl - 2; x <= hl + 3; x += 3) { var wv = 4.6 + 3.8 * Math.abs(Math.sin((x + ph) * 0.11)) + 2.2 * Math.sin((x + ph) * 0.37 + 1); c.lineTo(x, -6.6 - wv); }
      c.lineTo(hl + 3, -6.6); c.closePath(); c.fillStyle = '#c7a4c6'; c.fill();
      c.beginPath(); c.moveTo(-hl - 2, -6.6);
      for (x = -hl - 2; x <= hl + 3; x += 3) { var wv2 = 2.4 + 3.0 * Math.abs(Math.sin((x + ph + 9) * 0.16)) + 1.2 * Math.sin((x + ph) * 0.53); c.lineTo(x, -6.6 - wv2); }
      c.lineTo(hl + 3, -6.6); c.closePath(); c.fillStyle = '#8f5f93'; c.fill();
      c.fillStyle = '#3b3a46'; c.fillRect(-hl - 2, -7.4, len + 6, 1.2);                         // jupe sombre
      c.restore();
      // baies vitrées sombres (grandes) séparées de montants blancs
      var wy = -31, wh = 12.5;
      function pane(px, pw) {
        c.fillStyle = A.grad(c, 0, wy, 0, wy + wh, [0, '#33465c', 1, '#18222f']); c.fillRect(px, wy, pw, wh);
        c.fillStyle = 'rgba(190,220,245,.30)'; c.beginPath(); c.moveTo(px + pw * 0.15, wy); c.lineTo(px + pw * 0.55, wy); c.lineTo(px + pw * 0.2, wy + wh); c.lineTo(px - 1, wy + wh); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(px, wy, pw, 0.8);
      }
      if (si === 0) {
        // cabine noire : toit noir, grand pare-brise incliné
        c.fillStyle = '#17181e'; c.beginPath(); c.moveTo(-hl + 6.5, -H - 0.4); c.quadraticCurveTo(-hl + 1.2, -H - 0.4, -hl + 0.8, -H + 6); c.lineTo(-hl + 0.2, -15); c.lineTo(-hl + 26, -15); c.lineTo(-hl + 26, -H - 0.4); c.closePath(); c.fill();
        c.fillStyle = A.grad(c, 0, -H + 3, 0, -15, [0, '#42576f', 1, '#1c2735']); c.beginPath(); c.moveTo(-hl + 5.5, -H + 4); c.lineTo(-hl + 23, -H + 4); c.lineTo(-hl + 23, -17); c.lineTo(-hl + 2.4, -17); c.closePath(); c.fill();
        c.fillStyle = 'rgba(200,225,250,.28)'; c.beginPath(); c.moveTo(-hl + 9, -H + 4); c.lineTo(-hl + 16, -H + 4); c.lineTo(-hl + 8, -17); c.lineTo(-hl + 2.4, -17); c.closePath(); c.fill();
        c.fillStyle = '#4f5663'; c.fillRect(-hl + 1, -15, 25, 1.2);
        pane(-hl + 30, 14); pane(-hl + 47, 14); pane(-hl + 64, 14);
        c.fillStyle = '#e9ecf2'; c.fillRect(hl - 20, wy - 1, 17, wh + 2);                             // porte double
        c.strokeStyle = '#5a6272'; c.lineWidth = 0.4; c.strokeRect(hl - 20, wy - 1, 17, wh + 2); c.beginPath(); c.moveTo(hl - 11.5, wy - 1); c.lineTo(hl - 11.5, wy + wh + 1); c.stroke();
        pane(hl - 18.5, 6); pane(hl - 10, 6);
        c.fillStyle = '#fff3b8'; c.fillRect(-hl + 0.4, -12.2, 2.4, 2.4);                              // phare
        c.save(); c.globalCompositeOperation = 'lighter'; var hg = c.createRadialGradient(-hl, -11, 0, -hl, -11, 22); hg.addColorStop(0, 'rgba(255,240,170,.5)'); hg.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = hg; c.fillRect(-hl - 22, -33, 24, 44); c.restore();
        // logo « PANORAMIQUE DES DÔMES » (mauve + deux lignes) près de l'avant
        c.fillStyle = '#8f5f93'; c.beginPath(); c.moveTo(-hl + 5, -10.2); c.lineTo(-hl + 8, -13.4); c.lineTo(-hl + 10.5, -10.2); c.closePath(); c.fill();
        c.fillStyle = '#2d2a3a'; c.fillRect(-hl + 12, -13.2, 15, 1.1); c.fillRect(-hl + 12, -11.4, 11, 1.0);
      } else {
        var n = 4, pw = (len - 10) / n - 2.5, k;
        for (k = 0; k < n; k++) { pane(-hl + 5 + k * (pw + 2.5), pw); }
        if (si === 1) { c.fillStyle = '#2d2a3a'; c.fillRect(hl - 17, -13.2, 13, 1.1); c.fillRect(hl - 17, -11.4, 9, 1.0); c.fillStyle = '#8f5f93'; c.beginPath(); c.moveTo(hl - 22, -10.2); c.lineTo(hl - 19.4, -13.4); c.lineTo(hl - 17, -10.2); c.closePath(); c.fill(); }
      }
      // toit : liseré gris + équipements ; pantographe sur l'élément central
      c.fillStyle = '#9ea5b2'; c.fillRect(-hl + (si === 0 ? 26 : 0), -H - 0.2, len - (si === 0 ? 26 : 0) + 0.4, 1.1);
      if (si === 1) {
        c.fillStyle = '#6c7788'; c.fillRect(-14, -H - 1.8, 24, 1.8);
        c.strokeStyle = '#1f2430'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-8, -H - 1.6); c.lineTo(1, -H - 5.6); c.lineTo(-3, -H - 7.4); c.stroke();
        c.beginPath(); c.moveTo(2, -H - 1.6); c.lineTo(-3, -H - 7.4); c.stroke();
        c.fillStyle = '#1f2430'; c.fillRect(-7.6, -H - 8.1, 9.2, 1.0);
        c.fillStyle = '#d9dde4'; c.fillRect(12, -H - 3.2, 14, 1.8);
      }
      if (si === 2) { c.fillStyle = '#d9dde4'; c.fillRect(-12, -H - 3.0, 16, 1.8); }
      // soufflet d'articulation
      if (si < 2) { c.fillStyle = '#2b2e38'; c.fillRect(hl - 1.6, -H + 3, 3.4, H - 9.6); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(hl - 1.2, -H + 3, 0.8, H - 9.6); }
      c.restore();
    });
    c.restore();
    if (Math.random() < 0.45 && E.emitDust) { E.emitDust(tr.tx + Ltot * 0.5, tY(E, tr.tx + Ltot * 0.5, tr), 1); }
  }

  /* ---------- randonneur de passage (piétine la dalle) : couloir légèrement en retrait, jamais de collision ---------- */
  function npc(c, n, E) {
    if (n.st !== 'walk') { return; }
    var chars = ['girl', 'boy2', 'girl2', 'boy'], mine = (window.Save && Save.get().character) || 'boy', ch = chars[n.ch % 4]; if (ch === mine) { ch = chars[(n.ch + 1) % 4]; }
    var sl = Math.atan((E.G[Math.min(E.len, (n.x + 5) | 0)] - E.G[Math.max(0, (n.x - 5) | 0)]) / 10);
    A.drawHiker(c, { x: n.x, y: n.y, face: -1, t: E.time, phase: n.ph, move: 1, air: false, vy: 0, sq: 0, hurt: 0, drink: 0, cele: 0, slope: isFinite(sl) ? -sl : 0, scale: E.HSC * 0.93, stride: 5.0, char: ch, alpha: 1 });
    if (n.bub > 0) {
      var a = Math.min(1, n.bub * 3), bx = n.x, by = n.y - 40 - Math.sin(E.time * 12) * 0.6;
      c.save(); c.globalAlpha = a; c.translate(bx, by);
      c.beginPath(); c.arc(0, 0, 5.6, 0, 7); c.moveTo(-1.5, 5); c.lineTo(0, 8); c.lineTo(1.8, 5); c.closePath(); c.fillStyle = '#fff6e0'; c.fill(); c.lineWidth = 0.8; c.strokeStyle = '#2a1830'; c.stroke();
      c.fillStyle = '#d8301c'; c.fillRect(-0.8, -3.2, 1.6, 4.2); c.beginPath(); c.arc(0, 2.6, 0.95, 0, 7); c.fill(); c.restore();
    }
  }

  /* ---------- brouillard ---------- */
  function fogBack(c, vw, vh, E) {
    if (K.fog < 0.02) { return; }
    c.fillStyle = 'rgba(226,234,240,' + (0.62 * clamp(K.fog * 1.1, 0, 1)).toFixed(3) + ')'; c.fillRect(0, 0, vw, vh);
  }
  function fog(c, vw, vh, E) {
    if (K.fog < 0.02) { return; }
    var cam = E.cam, P = E.P, k = clamp(K.fog, 0, 1), px = P.x - cam.x, i;
    var g = c.createLinearGradient(cam.x, 0, cam.x + vw, 0), n = 14;
    for (i = 0; i <= n; i++) {
      var sx = vw * i / n, d = sx - px, a;
      if (d < 0) { a = 0.05 + 0.2 * clamp(-d / 80, 0, 1); } else { a = 0.05 + 0.62 * clamp((d - 26) / 78, 0, 1); }
      g.addColorStop(i / n, 'rgba(228,236,242,' + (a * k).toFixed(3) + ')');
    }
    c.fillStyle = g; c.fillRect(cam.x - 2, cam.y - 2, vw + 4, vh + 4);
    // volutes de brume qui défilent (par-dessus le sentier, mais sans masquer le randonneur : dessinées avant lui)
    for (i = 0; i < 9; i++) {
      var wx = ((hash(i, 91) * (vw + 200) - E.time * (5 + 4 * hash(i, 92)) + cam.x * 0.0) % (vw + 200) + (vw + 200)) % (vw + 200) - 100 + cam.x, wy = cam.y + vh * (0.35 + 0.55 * hash(i, 93)) + Math.sin(E.time * 0.4 + i) * 3, ww = 46 + 40 * hash(i, 94);
      var rg = c.createRadialGradient(wx, wy, 0, wx, wy, ww); rg.addColorStop(0, 'rgba(236,242,246,' + (0.2 * k).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(236,242,246,0)');
      c.save(); c.translate(wx, wy); c.scale(1, 0.36); c.translate(-wx, -wy); c.fillStyle = rg; c.fillRect(wx - ww, wy - ww, ww * 2, ww * 2); c.restore();
    }
  }
  /* jalons de sentier (balisage par temps de brouillard) : toujours visibles, de part et d'autre des vides et des dalles fragiles */
  function fogPoles(c, xa, xb, E) {
    if (K.fog < 0.1) { return; }
    var G = E.G, list = E.feat.gaps.concat(E.feat.crumbs.filter(function (q) { return q.state !== 'fallen' || true; }));
    list.forEach(function (gp) {
      if (gp.x1 < xa - 8 || gp.x0 > xb + 8) { return; }
      [gp.x0 - 7, gp.x1 + 7].forEach(function (px) {
        var py = G[Math.max(0, Math.min(E.len, px | 0))]; if (!isFinite(py) || py < -1e5) { return; }
        c.fillStyle = '#2a1810'; c.fillRect(px - 0.8, py - 22, 1.6, 22); c.fillStyle = '#ff8a2a'; c.fillRect(px - 0.8, py - 22, 1.6, 6); c.fillStyle = '#fff'; c.fillRect(px - 0.8, py - 16, 1.6, 4); c.fillStyle = '#ff8a2a'; c.fillRect(px - 0.8, py - 12, 1.6, 4);
        c.fillStyle = '#fff6c0'; c.beginPath(); c.arc(px, py - 22.6, 1.1 + 0.2 * Math.sin(E.time * 6), 0, 7); c.fill();
      });
    });
  }

  /* ---------- soleil écrasant : halo, voile chaud, air qui tremble près de l'horizon ---------- */
  function sun(c, vw, vh, E) {
    if (K.sun < 0.02) { return; }
    var k = K.sun, t = E.time;
    c.save(); c.globalCompositeOperation = 'screen';
    var g = c.createRadialGradient(vw * 0.86, vh * 0.08, 0, vw * 0.86, vh * 0.08, vh * 0.8); g.addColorStop(0, 'rgba(255,244,200,' + (0.5 * k).toFixed(3) + ')'); g.addColorStop(0.3, 'rgba(255,220,140,' + (0.22 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    c.restore();
    c.fillStyle = 'rgba(255,236,190,' + (0.08 * k).toFixed(3) + ')'; c.fillRect(0, 0, vw, vh);
    // filets de chaleur qui ondulent
    c.save(); c.strokeStyle = 'rgba(255,248,220,' + (0.12 * k).toFixed(3) + ')'; c.lineWidth = 0.6;
    for (var i = 0; i < 5; i++) { var y = vh * (0.6 + 0.07 * i); c.beginPath(); for (var x = 0; x <= vw; x += 6) { var yy = y + Math.sin(x * 0.07 + t * 2.4 + i * 1.7) * 1.2; if (x === 0) { c.moveTo(x, yy); } else { c.lineTo(x, yy); } } c.stroke(); }
    c.restore();
  }

  /* ---------- neige : voile froid, flocons chassés par le vent, étincelles de givre ---------- */
  function snow(c, vw, vh, E) {
    if (K.snow < 0.02) { return; }
    var k = K.snow, t = E.time, i;
    c.fillStyle = 'rgba(200,225,255,' + (0.07 * k).toFixed(3) + ')'; c.fillRect(0, 0, vw, vh);
    if (!flakes) { flakes = []; for (i = 0; i < 70; i++) { flakes.push({ x: Math.random(), y: Math.random(), s: 0.35 + Math.random() * 0.8, v: 0.4 + Math.random() }); } }
    c.save(); c.fillStyle = '#ffffff';
    var cap = (document.body && document.body.classList.contains('low-fx')) ? 22 : 70;
    flakes.forEach(function (f, j) {
      if (j > cap * k) { return; }
      var x = ((f.x * vw - t * (9 + 22 * f.v) - E.cam.x * 0.25 * f.v) % vw + vw) % vw, y = ((f.y * vh + t * (12 + 14 * f.v)) % vh);
      c.globalAlpha = (0.45 + 0.4 * f.v) * Math.min(1, k * 1.4); c.beginPath(); c.arc(x, y, f.s, 0, 7); c.fill();
    });
    c.restore();
  }

  function update(E, dt) { zoneK(E, dt); }
  window.Mech = { rails: rails, tY: tY, crossing: crossing, trainBody: trainBody, npc: npc, fogBack: fogBack, fog: fog, fogPoles: fogPoles, sun: sun, snow: snow, update: update, K: K };
})();
