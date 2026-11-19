/* v0.16.14 — Thèmes vectoriels du monde 3 (Massif du Jura). Poupet, Mont d'Or, Creux du Van typifiés.
   Palette calcaire / sapins / pâturages. Sommets à l'échelle réelle
   (1,75 m = 37 u) quand la mesure est sourcée ; sinon typification
   déclarée, sans chiffre inventé. Installations volumineuses reculées
   en perspective (comme la tour TDF de la Rhune). Faits : js/levels_jura.js. */
(function () {
  'use strict';
  var H0 = window.AlpineHelpers, peaks = H0.peaks, A = window.Art, S = window.Scenery;
  function nzf(E, s, k, a) { return function (u) { return a + k * E.nz(u / s, 7); }; }
  function ss(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function boardIf(c, E, xa, xb, x, lines, w, h, sz, dy) {
    if (xb > x - 8 && xa < x + w + 8) {
      var gi = Math.max(0, Math.min(E.len, (x + w / 2) | 0)), g = E.G[gi], gs;
      for (gs = 1; !isFinite(g) && gs < 400; gs++) { g = E.G[Math.max(0, gi - gs)]; if (!isFinite(g)) { g = E.G[Math.min(E.len, gi + gs)]; } }
      if (!isFinite(g)) { return; }
      E.board(c, x, g - (dy || 33), w, h, lines, sz || 3.4);
    }
  }


  /* ---------- v0.15.5 : versant du Colombier organique ; Dor / Van inchangés ---------- */

  function skyFor(id) {
    /* Soleil et nuages distincts par sommet : plus le même calage copié-collé. */
    var C = {
      poupet: {
        stops: [0, '#4a7ab0', 0.42, '#9cc4e0', 0.78, '#f4e0b4', 1, '#ffe8bc'],
        sun: { x: 0.22, y: 0.58, r: 5.4, disc: '#fff6d0', g0: 'rgba(255, 214, 140, .50)', g1: 'rgba(255, 200, 120, 0)', glow: 0.68 },
        clouds: { n: 4, y0: 0.06, y1: 0.28, s0: 0.70, s1: 0.80, top: '#fffdf8', bot: '#e8d4b0', a0: 0.42, a1: 0.22, speed: 0.38 }
      },
      dor: {
        stops: [0, '#3a68a8', 0.40, '#88b8e0', 0.80, '#f0d8a8', 1, '#ffe6b8'],
        sun: { x: 0.88, y: 0.52, r: 5.8, disc: '#fff8d4', g0: 'rgba(255, 210, 130, .44)', g1: 'rgba(255, 190, 110, 0)', glow: 0.64 },
        clouds: { n: 5, y0: 0.08, y1: 0.36, s0: 0.90, s1: 1.05, top: '#fffaf4', bot: '#e4c8a0', a0: 0.50, a1: 0.24, speed: 0.48 }
      },
      van: {
        stops: [0, '#4a6a98', 0.38, '#8aa8c8', 0.76, '#d8d0c0', 1, '#f0e4c8'],
        sun: { x: 0.16, y: 0.62, r: 5.0, disc: '#f8f0d8', g0: 'rgba(255, 230, 180, .32)', g1: 'rgba(255, 220, 160, 0)', glow: 0.50 },
        clouds: { n: 8, y0: 0.05, y1: 0.42, s0: 0.95, s1: 1.25, top: '#f4f2ee', bot: '#c8c0b4', a0: 0.55, a1: 0.30, speed: 0.32 }
      },
      colombier: {
        stops: [0, '#2a5a9a', 0.36, '#6aa4d8', 0.78, '#e8d8a8', 1, '#ffe8b8'],
        sun: { x: 0.90, y: 0.42, r: 6.2, disc: '#fffce8', g0: 'rgba(255, 230, 150, .40)', g1: 'rgba(255, 210, 120, 0)', glow: 0.58 },
        clouds: { n: 7, y0: 0.10, y1: 0.38, s0: 1.05, s1: 1.35, top: '#ffffff', bot: '#e0d0b0', a0: 0.58, a1: 0.28, speed: 0.42 }
      },
      dole: {
        stops: [0, '#3a62a0', 0.44, '#80b0d8', 0.84, '#e8d4b0', 1, '#fff0cc'],
        sun: { x: 0.70, y: 0.60, r: 5.5, disc: '#fff8d8', g0: 'rgba(255, 220, 150, .42)', g1: 'rgba(255, 200, 120, 0)', glow: 0.60 },
        clouds: { n: 5, y0: 0.12, y1: 0.30, s0: 0.75, s1: 0.95, top: '#fffaf2', bot: '#dcc8a8', a0: 0.44, a1: 0.22, speed: 0.50 }
      },
      colomby: {
        /* fin d'apres-midi lumineuse : bleu propre, or chaud a l'horizon, sans boue */
        stops: [0, '#3a6cb8', 0.28, '#7eb4e8', 0.52, '#f2d088', 0.78, '#ffd878', 1, '#ffe9b4'],
        sun: { x: 0.16, y: 0.54, r: 7.0, disc: '#fff6c8', g0: 'rgba(255, 210, 110, .42)', g1: 'rgba(255, 180, 70, 0)', glow: 0.34, add: false },
        clouds: { n: 5, y0: 0.05, y1: 0.18, s0: 0.80, s1: 1.05, top: '#fff8ee', bot: '#f0c070', a0: 0.72, a1: 0.18, speed: 0.36 }
      },
      reculet: {
        /* crete exposee, ciel d'altitude ardoise / orageux, contraste net */
        stops: [0, '#141c2c', 0.34, '#2c3a50', 0.68, '#5a6878', 1, '#8a94a0'],
        sun: { x: 0.78, y: 0.42, r: 3.6, disc: '#d0c8b8', g0: 'rgba(200, 210, 220, .16)', g1: 'rgba(180, 190, 200, 0)', glow: 0.18, add: false },
        clouds: { n: 2, y0: 0.03, y1: 0.10, s0: 0.55, s1: 0.70, top: '#c8ced4', bot: '#6a7480', a0: 0.28, a1: 0.12, speed: 0.18 }
      },
      neige: {
        /* finale claire : zenith bleu, horizon pale, sans halo qui brule le ciel */
        stops: [0, '#2a5aa8', 0.42, '#7eb4e4', 0.78, '#d8e6f4', 1, '#eef2f0'],
        sun: { x: 0.18, y: 0.38, r: 5.2, disc: '#fffce8', g0: 'rgba(255, 244, 210, .28)', g1: 'rgba(255, 230, 180, 0)', glow: 0.20, add: false },
        clouds: { n: 2, y0: 0.04, y1: 0.10, s0: 0.55, s1: 0.72, top: '#ffffff', bot: '#e4eaf0', a0: 0.22, a1: 0.10, speed: 0.16 }
      }
    };
    return C[id] || C.dole;
  }

  var LAKEPAL = {
    leman: {
      far: 'rgba(198, 222, 236, 0.96)', hi: 'rgba(118, 174, 214, 0.96)',
      refl: 'rgba(176, 212, 230, 0.55)', mid: 'rgba(52, 122, 180, 0.95)',
      deep: 'rgba(22, 70, 128, 0.96)', shore: 'rgba(70, 92, 64, 0.55)',
      bank: 'rgba(108, 128, 78, 0.72)', spark: '#e8f4fa'
    },
    lemanGold: {
      far: 'rgba(255, 232, 170, 0.97)', hi: 'rgba(120, 176, 210, 0.96)',
      refl: 'rgba(255, 220, 120, 0.88)', mid: 'rgba(56, 128, 176, 0.95)',
      deep: 'rgba(24, 84, 140, 0.96)', shore: 'rgba(80, 100, 56, 0.55)',
      bank: 'rgba(110, 124, 64, 0.72)', spark: '#fff3b0'
    },
    joux: {
      far: 'rgba(186, 214, 226, 0.95)', hi: 'rgba(100, 158, 186, 0.95)',
      refl: 'rgba(168, 206, 218, 0.50)', mid: 'rgba(50, 118, 154, 0.94)',
      deep: 'rgba(26, 74, 110, 0.95)', shore: 'rgba(64, 86, 60, 0.55)',
      bank: 'rgba(112, 126, 82, 0.7)', spark: '#e0f0f4'
    },
    bourget: {
      far: 'rgba(176, 210, 230, 0.96)', hi: 'rgba(86, 154, 206, 0.96)',
      refl: 'rgba(168, 208, 230, 0.52)', mid: 'rgba(40, 108, 176, 0.95)',
      deep: 'rgba(16, 64, 122, 0.96)', shore: 'rgba(60, 88, 58, 0.55)',
      bank: 'rgba(96, 122, 72, 0.72)', spark: '#eaf6fc'
    },
    neuchatel: {
      far: 'rgba(204, 224, 236, 0.94)', hi: 'rgba(130, 178, 206, 0.94)',
      refl: 'rgba(184, 214, 226, 0.48)', mid: 'rgba(64, 128, 168, 0.92)',
      deep: 'rgba(32, 84, 128, 0.93)', shore: 'rgba(90, 110, 70, 0.45)',
      bank: 'rgba(140, 150, 100, 0.55)', spark: '#eef6f8'
    },
    saintpoint: {
      far: 'rgba(190, 216, 226, 0.93)', hi: 'rgba(108, 164, 190, 0.93)',
      refl: 'rgba(170, 206, 218, 0.46)', mid: 'rgba(54, 120, 154, 0.92)',
      deep: 'rgba(28, 78, 114, 0.93)', shore: 'rgba(70, 90, 62, 0.5)',
      bank: 'rgba(110, 128, 80, 0.65)', spark: '#e4f0f4'
    }
  };

  function shoreHamlet(c, x, y, sc) {
    /* Hameau typifié en RIVE (posé sur la terre, jamais sur l'eau). */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#7a8a58';
    c.beginPath(); c.ellipse(0, 1.2, 28, 3.2, 0, 0, 7); c.fill();
    var roofs = [[-22, 5, 8, 4, '#8a4030'], [-12, 6, 7, 3.6, '#6a3a28'], [-3, 5.4, 9, 4.2, '#a04830'], [9, 6.2, 6.5, 3.4, '#7a3c28']], i, r;
    for (i = 0; i < roofs.length; i++) {
      r = roofs[i];
      c.fillStyle = '#c8c0b0';
      c.fillRect(r[0], r[1] - r[3] * 0.55, r[2], r[3] * 0.7);
      c.fillStyle = r[4];
      c.beginPath();
      c.moveTo(r[0] - 0.6, r[1] - r[3] * 0.5);
      c.lineTo(r[0] + r[2] / 2, r[1] - r[3] - 0.4);
      c.lineTo(r[0] + r[2] + 0.6, r[1] - r[3] * 0.5);
      c.closePath(); c.fill();
    }
    c.restore();
  }

  function perspectiveLake(c, o) {
    /* Lac vu d'altitude : trapèze à rives courbes, reflets typifiés, villages
       sur la rive (terre), pas une bande pleine largeur. */
    var cx = o.cx, yf = o.yFar, yn = o.yNear;
    var ff = o.farHalf, nf = o.nearHalf, sk = o.skew || 0;
    var pal = o.pal || LAKEPAL.leman;
    var bowF = o.bowFar == null ? 5 : o.bowFar, bowN = o.bowNear == null ? 8 : o.bowNear;
    function lakePath() {
      c.beginPath();
      c.moveTo(cx - ff + sk * 0.12, yf);
      c.quadraticCurveTo(cx + sk * 0.08, yf - bowF, cx + ff + sk * 0.12, yf);
      c.lineTo(cx + nf + sk, yn);
      c.quadraticCurveTo(cx + sk, yn + bowN, cx - nf + sk, yn);
      c.closePath();
    }
    lakePath();
    var g = c.createLinearGradient(0, yf - 6, 0, yn + 6);
    g.addColorStop(0, pal.far);
    g.addColorStop(0.20, pal.hi);
    g.addColorStop(0.42, pal.refl);
    g.addColorStop(0.70, pal.mid);
    g.addColorStop(1, pal.deep);
    c.fillStyle = g;
    c.fill();
    c.save();
    lakePath();
    c.clip();
    var i, ex, ey, er;
    c.fillStyle = pal.spark;
    for (i = 0; i < 6; i++) {
      c.globalAlpha = 0.16 + (i % 2) * 0.06;
      ex = cx + (i - 2.5) * nf * 0.16 + sk * 0.35;
      ey = yf + (yn - yf) * (0.18 + i * 0.11);
      er = Math.max(6, nf * (0.16 - i * 0.012));
      c.beginPath(); c.ellipse(ex, ey, er, 1.6 + i * 0.15, 0, 0, 7); c.fill();
    }
    c.restore();
    c.strokeStyle = pal.shore;
    c.lineWidth = 1.25;
    lakePath();
    c.stroke();
    if (o.nearShore !== false) {
      c.fillStyle = pal.bank;
      c.beginPath();
      c.moveTo(cx - nf + sk, yn);
      c.quadraticCurveTo(cx + sk, yn + bowN, cx + nf + sk, yn);
      c.quadraticCurveTo(cx + sk, yn + bowN + 11, cx - nf + sk, yn);
      c.closePath();
      c.fill();
    }
    if (o.farBank !== false) {
      c.fillStyle = o.farBankCol || 'rgba(120, 140, 96, 0.55)';
      c.beginPath();
      c.moveTo(cx - ff + sk * 0.12, yf);
      c.quadraticCurveTo(cx + sk * 0.08, yf - bowF, cx + ff + sk * 0.12, yf);
      c.quadraticCurveTo(cx, yf - 7, cx - ff + sk * 0.12, yf);
      c.closePath();
      c.fill();
    }
    if (o.village) {
      shoreHamlet(c, cx + (o.villageX != null ? o.villageX : -ff * 0.35) + sk * 0.12, yf - 1.0, o.villageSc || 0.68);
    }
    if (o.village2) {
      shoreHamlet(c, cx + (o.village2X != null ? o.village2X : ff * 0.28) + sk * 0.12, yf - 0.8, o.village2Sc || 0.55);
    }
  }


  function horizonLake(c, o) {
    /* Lac lointain vu d'un sommet : lame horizontale tres aplatie,
       rives irregulieres, posee dans un creux de vallee. Pas de trapeze
       ni de bords lateraux visibles. */
    var cx = o.cx, y = o.y, half = o.half, h = o.h == null ? 6 : o.h;
    var pal = o.pal || LAKEPAL.joux;
    var hFar = h * 0.42, hNear = h * 0.62;
    var x0 = cx - half, x1 = cx + half;
    function lakePath() {
      c.beginPath();
      c.moveTo(x0, y);
      c.quadraticCurveTo(cx - half * 0.62, y - hFar * 1.05, cx - half * 0.22, y - hFar * 0.62);
      c.quadraticCurveTo(cx + half * 0.08, y - hFar * 1.12, cx + half * 0.48, y - hFar * 0.5);
      c.quadraticCurveTo(cx + half * 0.82, y - hFar * 0.22, x1, y);
      c.quadraticCurveTo(cx + half * 0.66, y + hNear * 0.72, cx + half * 0.18, y + hNear * 1.02);
      c.quadraticCurveTo(cx - half * 0.2, y + hNear * 0.68, cx - half * 0.58, y + hNear * 0.9);
      c.quadraticCurveTo(cx - half * 0.86, y + hNear * 0.28, x0, y);
      c.closePath();
    }
    /* rive lointaine, terre derriere l'eau */
    c.fillStyle = o.farBankCol || 'rgba(110, 130, 88, 0.55)';
    c.beginPath();
    c.moveTo(x0 + half * 0.04, y - 0.4);
    c.quadraticCurveTo(cx, y - hFar - 2.4, x1 - half * 0.04, y - 0.4);
    c.quadraticCurveTo(cx, y - hFar - 5.2, x0 + half * 0.04, y - 0.4);
    c.closePath();
    c.fill();
    lakePath();
    var g = c.createLinearGradient(0, y - hFar - 1, 0, y + hNear + 1);
    g.addColorStop(0, pal.far);
    g.addColorStop(0.28, pal.hi);
    g.addColorStop(0.55, pal.refl);
    g.addColorStop(0.82, pal.mid);
    g.addColorStop(1, pal.deep);
    c.fillStyle = g;
    c.fill();
    /* reflets du ciel, allonges, pas des taches rondes */
    c.save();
    lakePath();
    c.clip();
    c.globalAlpha = 0.28;
    c.fillStyle = pal.spark;
    c.beginPath();
    c.ellipse(cx - half * 0.18, y - hFar * 0.15, half * 0.28, Math.max(0.7, h * 0.12), 0, 0, 7);
    c.fill();
    c.globalAlpha = 0.18;
    c.beginPath();
    c.ellipse(cx + half * 0.22, y + hNear * 0.05, half * 0.2, Math.max(0.55, h * 0.1), 0, 0, 7);
    c.fill();
    if (o.goldRefl) {
      var bands = [
        [cx - half * 0.36, y - hFar * 0.05, cx + half * 0.30],
        [cx - half * 0.22, y + hNear * 0.18, cx + half * 0.26],
        [cx - half * 0.12, y + hNear * 0.42, cx + half * 0.16]
      ];
      var i, b;
      c.strokeStyle = 'rgba(255, 220, 110, 0.62)';
      c.lineWidth = 0.65;
      c.lineCap = 'round';
      for (i = 0; i < bands.length; i++) {
        b = bands[i];
        c.globalAlpha = 0.50 - i * 0.08;
        c.beginPath();
        c.moveTo(b[0], b[1]);
        c.lineTo(b[2], b[1]);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    c.restore();
    /* rive proche, terre DEVANT l'eau */
    c.fillStyle = pal.bank;
    c.beginPath();
    c.moveTo(cx - half * 0.92, y + hNear * 0.15);
    c.quadraticCurveTo(cx, y + hNear * 1.05, cx + half * 0.92, y + hNear * 0.15);
    c.quadraticCurveTo(cx, y + hNear * 1.55, cx - half * 0.92, y + hNear * 0.15);
    c.closePath();
    c.fill();
    if (o.village) {
      shoreHamlet(c, cx + (o.villageX != null ? o.villageX : -half * 0.32), y - hFar - 0.6, o.villageSc || 0.18);
    }
    if (o.village2) {
      shoreHamlet(c, cx + (o.village2X != null ? o.village2X : half * 0.28), y - hFar - 0.4, o.village2Sc || 0.14);
    }
  }

  function windingRiver(c, pts, w, col) {
    /* Ruban typifié (ex. le Rhône vu du Colombier). */
    if (!pts || pts.length < 4) { return; }
    var i;
    c.strokeStyle = col || 'rgba(90, 150, 186, 0.85)';
    c.lineWidth = w || 5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (i = 2; i < pts.length - 2; i += 2) {
      c.quadraticCurveTo(pts[i], pts[i + 1], (pts[i] + pts[i + 2]) / 2, (pts[i + 1] + pts[i + 3]) / 2);
    }
    c.lineTo(pts[pts.length - 2], pts[pts.length - 1]);
    c.stroke();
    c.strokeStyle = 'rgba(200, 224, 236, 0.28)';
    c.lineWidth = Math.max(1, (w || 5) * 0.28);
    c.stroke();
  }

  function massifPeak(c, o) {
    /* Volume typifié : silhouette irrégulière, face d'ombre, calotte
       de neige. o.kind = 'dome' | 'ridge' | 'tooth'. */
    var x = o.x, y = o.y, w = o.w, h = o.h, kind = o.kind || 'ridge';
    var rock = o.rock || '#9aa8b6', rockD = o.rockD || '#7a8796';
    var snow = o.snow || 'rgba(255, 255, 255, 0.9)';
    var light = o.light == null ? 1 : o.light;
    c.beginPath();
    c.moveTo(x - w, y);
    if (kind === 'dome') {
      c.lineTo(x - w * 0.7, y - h * 0.22);
      c.quadraticCurveTo(x - w * 0.42, y - h * 0.62, x - w * 0.18, y - h * 0.78);
      c.quadraticCurveTo(x, y - h * 0.96, x + w * 0.18, y - h * 0.78);
      c.quadraticCurveTo(x + w * 0.44, y - h * 0.58, x + w * 0.7, y - h * 0.22);
      c.lineTo(x + w, y);
    } else if (kind === 'tooth') {
      c.lineTo(x - w * 0.7, y - h * 0.35);
      c.lineTo(x - w * 0.42, y - h * 0.55);
      c.lineTo(x - w * 0.2, y - h * 0.4);
      c.lineTo(x, y - h);
      c.lineTo(x + w * 0.22, y - h * 0.48);
      c.lineTo(x + w * 0.5, y - h * 0.7);
      c.lineTo(x + w * 0.72, y - h * 0.32);
      c.lineTo(x + w, y);
    } else {
      c.lineTo(x - w * 0.7, y - h * 0.22);
      c.quadraticCurveTo(x - w * 0.45, y - h * 0.7, x - w * 0.15, y - h * 0.55);
      c.lineTo(x, y - h);
      c.quadraticCurveTo(x + w * 0.22, y - h * 0.62, x + w * 0.48, y - h * 0.38);
      c.lineTo(x + w * 0.7, y - h * 0.2);
      c.lineTo(x + w, y);
    }
    c.closePath();
    c.fillStyle = rock;
    c.fill();
    c.fillStyle = rockD;
    c.beginPath();
    if (light >= 0) {
      c.moveTo(x + w * 0.02, y - h * (kind === 'dome' ? 0.9 : 1));
      c.lineTo(x + w * 0.55, y - h * 0.28);
      c.lineTo(x + w, y);
      c.lineTo(x + w * 0.1, y);
    } else {
      c.moveTo(x - w * 0.02, y - h * (kind === 'dome' ? 0.9 : 1));
      c.lineTo(x - w * 0.55, y - h * 0.28);
      c.lineTo(x - w, y);
      c.lineTo(x - w * 0.1, y);
    }
    c.closePath();
    c.fill();
    c.fillStyle = snow;
    c.beginPath();
    if (kind === 'dome') {
      c.moveTo(x - w * 0.28, y - h * 0.48);
      c.quadraticCurveTo(x - w * 0.12, y - h * 0.8, x, y - h * 0.88);
      c.quadraticCurveTo(x + w * 0.14, y - h * 0.8, x + w * 0.3, y - h * 0.48);
      c.quadraticCurveTo(x, y - h * 0.58, x - w * 0.28, y - h * 0.48);
    } else {
      c.moveTo(x - w * 0.16, y - h * 0.55);
      c.lineTo(x, y - h);
      c.lineTo(x + w * 0.16, y - h * 0.52);
      c.quadraticCurveTo(x, y - h * 0.58, x - w * 0.16, y - h * 0.55);
    }
    c.closePath();
    c.fill();
  }

  function montBlancMassif(c, x, y, sc, variant) {
    /* Groupe typifié du mont Blanc : dôme neigeux (pas un triangle aigu),
       épaules (Dôme du Goûter / Mont Maudit typifiés) et, selon l'azimut,
       une crête dentelée type Grandes Jorasses. Vues lointaines depuis
       le Jura, sans prétendre au détail d'un panorama au degré près. */
    sc = sc || 1;
    variant = variant || 0;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    var snow = 'rgba(255, 255, 255, 0.93)';
    var haze = 'rgba(186, 200, 214, 0.4)';
    c.fillStyle = haze;
    c.beginPath();
    c.ellipse(0, 18, 118, 13, 0, 0, 7);
    c.fill();
    if (variant === 2) {
      massifPeak(c, { x: -72, y: 20, w: 36, h: 26, kind: 'tooth', rock: '#8a98a8', rockD: '#6a7888', snow: snow, light: 1 });
      massifPeak(c, { x: 10, y: 20, w: 58, h: 40, kind: 'dome', rock: '#9aa8b6', rockD: '#7a8796', snow: snow, light: 1 });
      massifPeak(c, { x: 68, y: 20, w: 28, h: 22, kind: 'ridge', rock: '#a0aebc', rockD: '#808e9c', snow: snow, light: 1 });
    } else if (variant === 1) {
      massifPeak(c, { x: -58, y: 20, w: 34, h: 24, kind: 'ridge', rock: '#8e9caa', rockD: '#6e7c8a', snow: snow, light: -1 });
      massifPeak(c, { x: 18, y: 20, w: 60, h: 38, kind: 'dome', rock: '#9aa8b6', rockD: '#7a8796', snow: snow, light: -1 });
    } else {
      massifPeak(c, { x: -58, y: 20, w: 30, h: 20, kind: 'ridge', rock: '#8e9caa', rockD: '#6e7c8a', snow: snow, light: 1 });
      massifPeak(c, { x: 8, y: 20, w: 58, h: 36, kind: 'dome', rock: '#9aa8b6', rockD: '#7a8796', snow: snow, light: 1 });
      massifPeak(c, { x: 62, y: 20, w: 26, h: 20, kind: 'ridge', rock: '#a0aebc', rockD: '#808e9c', snow: snow, light: 1 });
    }
    c.restore();
  }

  function dentsDuMidi(c, x, y, sc) {
    /* Crête typifiée des Dents du Midi, citée au Soliat (NaturPanorama)
       et visible depuis la Haute Chaîne. Mesures des dents non revendiquées. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = 'rgba(186, 200, 214, 0.35)';
    c.beginPath();
    c.ellipse(0, 14, 58, 8, 0, 0, 7);
    c.fill();
    var teeth = [[-40, 14], [-32, -2], [-24, 6], [-14, -8], [-4, 4], [8, -14], [18, 2], [30, -9], [40, 6], [50, 14]], i;
    c.fillStyle = '#8a96a4';
    c.beginPath();
    c.moveTo(-50, 16);
    for (i = 0; i < teeth.length; i++) { c.lineTo(teeth[i][0], teeth[i][1]); }
    c.lineTo(58, 16);
    c.closePath();
    c.fill();
    c.fillStyle = '#6a7684';
    c.beginPath();
    c.moveTo(8, -14);
    c.lineTo(18, 2);
    c.lineTo(18, 16);
    c.lineTo(8, 16);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(255, 255, 255, 0.82)';
    [[-14, -8], [8, -14], [30, -9]].forEach(function (t) {
      c.beginPath();
      c.moveTo(t[0] - 4, t[1] + 7);
      c.lineTo(t[0], t[1]);
      c.lineTo(t[0] + 4, t[1] + 7);
      c.closePath();
      c.fill();
    });
    c.restore();
  }

  function alpineChain(c, x, y, sc, variant) {
    /* Chaîne typifiée, volume et brume, distincte par azimut. Plus claire
       et plus basse que le massif du Mont Blanc : perspective aérienne. */
    sc = sc || 1;
    variant = variant || 0;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    var snow = 'rgba(236, 242, 248, 0.78)';
    var a = '#a4b0ba', ad = '#84909a', b = '#96a2ac', bd = '#76828c', e = '#acb6be', ed = '#8c96a0';
    c.fillStyle = 'rgba(186, 200, 214, 0.32)';
    c.beginPath();
    c.ellipse(0, 16, 150, 11, 0, 0, 7);
    c.fill();
    if (variant === 1) {
      massifPeak(c, { x: -100, y: 16, w: 36, h: 20, kind: 'ridge', rock: b, rockD: bd, snow: snow, light: -1 });
      massifPeak(c, { x: -28, y: 16, w: 32, h: 16, kind: 'ridge', rock: a, rockD: ad, snow: snow, light: -1 });
      massifPeak(c, { x: 40, y: 16, w: 40, h: 22, kind: 'tooth', rock: e, rockD: ed, snow: snow, light: -1 });
      massifPeak(c, { x: 100, y: 16, w: 28, h: 15, kind: 'ridge', rock: a, rockD: ad, snow: snow, light: -1 });
    } else if (variant === 2) {
      massifPeak(c, { x: -90, y: 16, w: 38, h: 22, kind: 'tooth', rock: b, rockD: bd, snow: snow, light: 1 });
      massifPeak(c, { x: -10, y: 16, w: 30, h: 15, kind: 'ridge', rock: a, rockD: ad, snow: snow, light: 1 });
      massifPeak(c, { x: 55, y: 16, w: 36, h: 18, kind: 'ridge', rock: e, rockD: ed, snow: snow, light: 1 });
      massifPeak(c, { x: 115, y: 16, w: 24, h: 13, kind: 'ridge', rock: a, rockD: ad, snow: snow, light: 1 });
    } else {
      massifPeak(c, { x: -96, y: 16, w: 34, h: 18, kind: 'ridge', rock: b, rockD: bd, snow: snow, light: 1 });
      massifPeak(c, { x: -28, y: 16, w: 36, h: 24, kind: 'ridge', rock: a, rockD: ad, snow: snow, light: 1 });
      massifPeak(c, { x: 48, y: 16, w: 32, h: 16, kind: 'ridge', rock: e, rockD: ed, snow: snow, light: 1 });
      massifPeak(c, { x: 108, y: 16, w: 26, h: 14, kind: 'ridge', rock: a, rockD: ad, snow: snow, light: 1 });
    }
    c.restore();
  }

  function dentDeVaulion(c, x, y, sc) {
    /* Silhouette typifiée de la Dent de Vaulion (crêt calcaire au-dessus
       du lac de Joux), d'après Commons « Lac de Joux, Dent de Vaulion ».
       Masse herbeuse d'abord, crête calcaire fine — pas un cube gris. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#5e7a48';
    c.beginPath();
    c.moveTo(-56, 22);
    c.quadraticCurveTo(-36, 6, -22, 8);
    c.lineTo(-8, -6);
    c.quadraticCurveTo(2, -16, 14, -8);
    c.lineTo(28, 4);
    c.quadraticCurveTo(44, 10, 60, 22);
    c.quadraticCurveTo(4, 26, -56, 22);
    c.closePath();
    c.fill();
    c.fillStyle = '#4a663c';
    c.beginPath();
    c.moveTo(-8, -6);
    c.lineTo(4, -14);
    c.lineTo(14, -8);
    c.lineTo(10, 8);
    c.lineTo(-12, 10);
    c.closePath();
    c.fill();
    /* petit affleurement enraciné dans la herbe, pas une dalle de papier */
    c.fillStyle = '#8a867c';
    c.beginPath();
    c.moveTo(-3.5, -1);
    c.quadraticCurveTo(0, -8, 5.5, -2);
    c.lineTo(4.5, 1.6);
    c.lineTo(-2.5, 2);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(50, 46, 40, 0.35)';
    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(-2, -2);
    c.lineTo(4, -2.4);
    c.stroke();
    c.restore();
  }

  function juraRidge(c, x, y, sc, col) {
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = col || '#7a9a62';
    c.beginPath();
    c.moveTo(-70, 16);
    c.quadraticCurveTo(-40, -4, -10, 6);
    c.quadraticCurveTo(16, -8, 44, 4);
    c.quadraticCurveTo(62, 8, 80, 16);
    c.closePath();
    c.fill();
    c.restore();
  }

  function alpineFoothills(c, x, y, sc) {
    /* Piémont typifié sous la chaîne alpine, pour que les Alpes ne
       flottent pas sur une bande de ciel qui lit comme une mer. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#9aa686';
    c.beginPath();
    c.moveTo(-200, 28);
    c.quadraticCurveTo(-120, 8, -40, 16);
    c.quadraticCurveTo(40, 4, 120, 14);
    c.quadraticCurveTo(170, 20, 210, 28);
    c.lineTo(220, 40);
    c.lineTo(-210, 40);
    c.closePath();
    c.fill();
    c.fillStyle = '#8a9a74';
    c.beginPath();
    c.moveTo(-80, 22);
    c.quadraticCurveTo(-20, 10, 40, 20);
    c.lineTo(40, 32);
    c.lineTo(-80, 32);
    c.closePath();
    c.fill();
    c.restore();
  }

  function fillLimestone(c, makePath, seed, yTop, yBot, xL, xR) {
    /* Strates en bandes souples, contrastes faibles : pas une grille. */
    var cols = ['#cfc8bc', '#c4bdb1', '#d2cbc0', '#b9b3a8', '#cac3b8', '#c0b9ae'];
    var y, i, h, x, wob;
    c.save();
    makePath();
    c.fillStyle = '#c8c1b6';
    c.fill();
    c.clip();
    y = yTop - 2;
    i = 0;
    while (y < yBot + 8) {
      h = 8 + ((seed * 13 + i * 29) % 14);
      c.fillStyle = cols[i % cols.length];
      c.globalAlpha = 0.55;
      c.beginPath();
      c.moveTo(xL - 10, y);
      for (x = xL; x <= xR; x += 6) {
        wob = Math.sin(x * 0.045 + i * 1.3 + seed * 0.1) * 2.4 + ((x * 5 + i * 17 + seed) % 6) * 0.2;
        c.lineTo(x, y + h + wob);
      }
      c.lineTo(xR + 10, y);
      c.closePath();
      c.fill();
      y += h * 0.78;
      i++;
    }
    c.globalAlpha = 1;
    var shade = c.createLinearGradient(xL, 0, xR, 0);
    shade.addColorStop(0, 'rgba(40, 36, 30, 0.22)');
    shade.addColorStop(0.45, 'rgba(40, 36, 30, 0)');
    shade.addColorStop(1, 'rgba(20, 18, 16, 0.18)');
    c.fillStyle = shade;
    c.fillRect(xL - 4, yTop - 4, (xR - xL) + 8, (yBot - yTop) + 12);
    c.strokeStyle = 'rgba(62, 56, 48, 0.16)';
    c.lineWidth = 0.65;
    for (i = 0; i < 5; i++) {
      x = xL + 14 + i * ((xR - xL) / 5.2) + ((i * 23 + seed) % 9) - 4;
      c.beginPath();
      c.moveTo(x, yTop + 4);
      c.lineTo(x + ((i % 3) - 1) * 4, yBot - 6);
      c.stroke();
    }
    c.restore();
    makePath();
    c.strokeStyle = 'rgba(52, 48, 42, 0.45)';
    c.lineWidth = 1.05;
    c.stroke();
  }

  function tuftOnLedge(c, x, y, sc) {
    /* Petite vire herbeuse, pas un sapin triangle. */
    sc = sc || 1;
    c.fillStyle = '#5a7a3c';
    c.beginPath();
    c.ellipse(x, y, 4.8 * sc, 1.25 * sc, -0.08, 0, 7);
    c.fill();
    c.fillStyle = '#6a8a44';
    c.beginPath();
    c.ellipse(x - 0.6 * sc, y - 0.3 * sc, 3.2 * sc, 0.8 * sc, 0.1, 0, 7);
    c.fill();
  }

  function limestoneTex(c, makePath, o) {
    /* Calcaire typifié : lits horizontaux, joints verticaux, surplombs
       ombrés, lichens discrets. Pas d'ellipses grises ni de sapins collés. */
    o = o || {};
    var y0 = o.y0, y1 = o.y1, x0 = o.x0, x1 = o.x1;
    var light = o.light == null ? 1 : o.light;
    var cols = o.cols || ['#d6cfc4', '#c8c1b6', '#ddd6cb', '#bdb6ab', '#d0c9be', '#c4bdb2', '#d8d1c6'];
    var y, i, h, jx, jy, jh, mid, g, loose, wave, nJoint;
    c.save();
    makePath();
    c.fillStyle = o.base || '#cfc8bc';
    c.fill();
    c.clip();
    mid = (x0 + x1) / 2;
    loose = !!o.loose;
    wave = loose ? 3.4 : 0.4;
    y = y0 - 2;
    i = 0;
    var xA, xB, ww, hh, xx, yy;
    if (o.karst) {
      /* face vue de pres / zoomee : taches de ton, lits brises et
         discrets, fissures verticales inegales — pas une grille. */
      for (i = 0; i < 16; i++) {
        c.fillStyle = (i % 2) ? 'rgba(255, 248, 230, 0.07)' : 'rgba(40, 34, 28, 0.07)';
        xx = x0 + 10 + ((i * 41 + (o.seed || 0)) % Math.max(12, (x1 - x0) - 24));
        yy = y0 + 8 + ((i * 27 + 11) % Math.max(12, (y1 - y0) - 20));
        ww = 16 + (i * 7) % 30;
        hh = 7 + (i * 5) % 18;
        c.beginPath();
        c.ellipse(xx, yy, ww * 0.5, hh * 0.4, ((i % 5) - 2) * 0.25, 0, 7);
        c.fill();
      }
      c.strokeStyle = 'rgba(46, 40, 34, 0.08)';
      c.lineWidth = 0.55;
      y = y0 + 14;
      i = 0;
      while (y < y1 - 12) {
        xA = x0 + 10 + ((i * 37) % Math.max(20, (x1 - x0) - 80));
        xB = xA + 36 + ((i * 11) % 40);
        if (xB > x1 - 8) { xB = x1 - 8; }
        c.beginPath();
        c.moveTo(xA, y + ((i % 3) - 1) * 2);
        c.quadraticCurveTo((xA + xB) * 0.5, y + ((i % 4) - 1.5) * 5, xB, y + 1);
        c.stroke();
        y += 18 + ((i * 9 + (o.seed || 7)) % 20);
        i++;
      }
      c.strokeStyle = 'rgba(52, 46, 40, 0.22)';
      c.lineWidth = 0.7;
      nJoint = o.nJoint != null ? o.nJoint : 10;
      for (i = 0; i < nJoint; i++) {
        jx = x0 + 16 + ((i * 53 + (o.seed || 0) * 5) % Math.max(16, (x1 - x0) - 32));
        jy = y0 + 5 + ((i * 19) % 28);
        jh = (y1 - y0) * (0.22 + ((i * 7) % 11) * 0.05);
        c.beginPath();
        c.moveTo(jx, jy);
        c.quadraticCurveTo(jx + ((i % 3) - 1) * 5, jy + jh * 0.5, jx + ((i % 5) - 2) * 2.4, jy + jh);
        c.stroke();
      }
    } else if (loose) {
      /* lits trop réguliers lisaient comme du papier millimétré :
         on garde le fond, on ne pose que des joints ondulés discrets. */
      c.strokeStyle = 'rgba(46, 40, 34, 0.20)';
      c.lineWidth = 0.85;
      y = y0 + 8;
      i = 0;
      while (y < y1 - 6) {
        c.globalAlpha = 0.55 + 0.35 * ((i * 3) % 2);
        c.beginPath();
        c.moveTo(x0 + 2 + ((i * 11) % 10), y);
        c.quadraticCurveTo((x0 + x1) / 2, y + ((i % 3) - 1) * 3.2, x1 - 4 - ((i * 7) % 12), y + ((i % 5) - 2) * 1.6);
        c.stroke();
        y += 11 + ((i * 9 + (o.seed || 7)) % 8);
        i++;
      }
      c.globalAlpha = 1;
    } else {
    while (y < y1 + 10) {
      h = 5.5 + ((i * 17 + (o.seed || 7) * 3) % 8);
      c.fillStyle = cols[i % cols.length];
      c.globalAlpha = 0.85;
      c.beginPath();
      c.moveTo(x0 - 8, y);
      c.lineTo(x1 + 8, y + ((i % 5) - 2) * wave);
      c.lineTo(x1 + 8, y + h);
      c.lineTo(x0 - 8, y + h + ((i % 3) - 1) * 0.35);
      c.closePath();
      c.fill();
      if (i % 3 === 1) {
        c.globalAlpha = 0.22;
        c.fillStyle = 'rgba(40, 34, 28, 1)';
        c.fillRect(x0 - 8, y + h - 0.8, (x1 - x0) + 16, 1.15);
      }
      y += h * 0.92;
      i++;
    }
    c.globalAlpha = 1;
    }
    if (!o.karst) {
    /* joints verticaux irréguliers */
    c.strokeStyle = loose ? 'rgba(52, 46, 40, ' + (o.striate ? '0.28' : '0.16') + ')' : 'rgba(52, 46, 40, 0.28)';
    c.lineWidth = loose ? (o.striate ? 0.7 : 0.5) : 0.7;
    nJoint = o.nJoint != null ? o.nJoint : (loose ? (o.striate ? 11 : 5) : 9);
    for (i = 0; i < nJoint; i++) {
      jx = x0 + 10 + i * ((x1 - x0) / (nJoint - 0.6)) + ((i * 13 + (o.seed || 0)) % 7) - 3;
      jy = y0 + 4 + ((i * 19) % 18);
      jh = (y1 - y0) * (0.35 + ((i * 7) % 10) * 0.04);
      c.beginPath();
      c.moveTo(jx, jy);
      c.lineTo(jx + ((i % 3) - 1) * 1.4, jy + jh);
      c.stroke();
    }
    /* surplombs : bandes d'ombre sous quelques lits plus saillants */
    c.fillStyle = o.softOverhang ? 'rgba(36, 30, 24, 0.10)' : 'rgba(36, 30, 24, 0.28)';
    for (i = 0; i < (o.softOverhang ? 3 : 4); i++) {
      y = y0 + 18 + i * ((y1 - y0) / (o.softOverhang ? 5.2 : 4.4)) + ((i * 11) % 8);
      c.beginPath();
      c.moveTo(x0 + 6, y + ((i * 5) % 4) - 1);
      c.quadraticCurveTo(mid, y + 2 + ((i % 3) - 1) * 2, x1 - 8, y + 1);
      c.lineTo(x1 - 8, y + 4 + (i % 2));
      c.quadraticCurveTo(mid, y + 3, x0 + 6, y + 3);
      c.closePath();
      c.fill();
    }
    }
    /* lichens, très discrets */
    c.fillStyle = 'rgba(110, 124, 84, 0.16)';
    for (i = 0; i < 8; i++) {
      c.beginPath();
      c.ellipse(x0 + 12 + i * ((x1 - x0) / 8.5) + ((i * 9) % 6),
                y0 + 20 + ((i * 23 + (o.seed || 0)) % (y1 - y0 - 30)),
                3.5 + (i % 3), 1.6, 0.2, 0, 7);
      c.fill();
    }
    /* volume : lumière / ombre de côté */
    g = c.createLinearGradient(x0, 0, x1, 0);
    if (light >= 0) {
      g.addColorStop(0, 'rgba(255, 248, 230, 0.22)');
      g.addColorStop(0.4, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(28, 22, 16, 0.46)');
    } else {
      g.addColorStop(0, 'rgba(28, 22, 16, 0.34)');
      g.addColorStop(0.6, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(255, 248, 230, 0.16)');
    }
    c.fillStyle = g;
    c.fillRect(x0 - 8, y0 - 6, (x1 - x0) + 16, (y1 - y0) + 20);
    c.restore();
    if (!o.noStroke) {
      makePath();
      c.strokeStyle = 'rgba(48, 44, 38, 0.4)';
      c.lineWidth = 1.05;
      c.stroke();
    }
  }

  function bandWall(c, makePath, seed, o) {
    o = o || {};
    o.seed = seed;
    limestoneTex(c, makePath, o);
  }

  function cirqueForest(c, x0, x1, yTop, yBot) {
    /* Forêt organique en masses : densité, tons et tailles variés,
       clairières, pas un tampon régulier. */
    var g, row, x, y, sc, jx, t, span, k, n, sun, cl, cx, cy, cw, ch, i, skip;
    var W = (x1 - x0);
    g = c.createLinearGradient(0, yTop, 0, yBot);
    g.addColorStop(0, '#4a6050');
    g.addColorStop(0.4, '#334836');
    g.addColorStop(1, '#1e2e22');
    c.fillStyle = g;
    /* pas de fillRect : le sol du bol est un contour organique chez l'appelant */
    /* clairières : taches de sol plus claires, moins d'arbres ensuite */
    for (i = 0; i < 6; i++) {
      cx = x0 + 18 + ((i * 47 + 13) % Math.max(8, (W - 36) | 0));
      cy = yTop + 10 + ((i * 29 + 7) % Math.max(8, ((yBot - yTop) * 0.7) | 0));
      cw = 10 + (i % 3) * 6;
      ch = 5 + (i % 2) * 3;
      c.fillStyle = (i % 2) ? 'rgba(90, 110, 70, 0.45)' : 'rgba(70, 92, 58, 0.4)';
      c.beginPath();
      c.ellipse(cx, cy, cw, ch, (i % 5) * 0.15, 0, 7);
      c.fill();
    }
    /* masses de cimes, groupées, pas une grille */
    span = yBot - yTop;
    for (cl = 0; cl < 28; cl++) {
      t = (0.08 + ((cl * 17) % 87) / 87 * 0.9);
      y = yTop + span * t;
      cx = x0 - 6 + ((cl * 37 + 11) % Math.max(8, (W + 20) | 0));
      /* sauter les clairières (mêmes seeds que ci-dessus, à peu près) */
      skip = false;
      for (i = 0; i < 6; i++) {
        var gx = x0 + 18 + ((i * 47 + 13) % Math.max(8, (W - 36) | 0));
        var gy = yTop + 10 + ((i * 29 + 7) % Math.max(8, ((yBot - yTop) * 0.7) | 0));
        if (Math.abs(cx - gx) < 12 + (i % 3) * 4 && Math.abs(y - gy) < 7 + (i % 2) * 2) {
          skip = true;
        }
      }
      if (skip) { continue; }
      sc = 0.7 + t * 2.6 + (cl % 3) * 0.25;
      n = 3 + (cl % 5);
      sun = (cx - x0) / Math.max(1, W);
      for (k = 0; k < n; k++) {
        jx = cx + (k - n / 2) * sc * 1.15 + ((cl + k) % 3) * 0.4;
        if (t < 0.3 && sun < 0.5) {
          c.fillStyle = (k % 2) ? '#5a7a4c' : '#3e5e3a';
        } else if (t < 0.3) {
          c.fillStyle = (k % 2) ? '#3a5244' : '#2c4436';
        } else if (t < 0.65) {
          c.fillStyle = ((k + cl) % 3 === 0) ? '#1c3424' : '#2a4a32';
        } else {
          c.fillStyle = ((k + cl) % 2) ? '#1a3020' : '#243a28';
        }
        c.beginPath();
        c.moveTo(jx, y - sc * (2.1 + (k % 3) * 0.55 + (cl % 2) * 0.25));
        c.lineTo(jx + sc * (0.85 + (k % 2) * 0.2), y + 0.5);
        c.lineTo(jx - sc * (0.85 + ((k + 1) % 2) * 0.18), y + 0.5);
        c.closePath();
        c.fill();
      }
    }
  }

  function screeFan(c, x, y, w, h) {
    /* Eventail d'eboulis : bord superieur large, colle au pied de la
       paroi (un peu au-dessus de y, pour passer sous le mur), langue
       irreguliere qui s'effile et s'estompe dans la foret. Gris-beige
       chaud et sombre, ombre de la paroi en haut. Pas un triangle,
       pas un galet pale pose sur les sapins. */
    var g, i, px, py, n1, n2, n3, n4, n5, seed;
    var topL, topR, topYL, topYR, midLX, midRX, midLY, midRY, tipX, tipY;
    seed = ((x * 13 + y * 7 + w * 3) | 0);
    function nr(k) {
      var v = (seed * (k + 3) * 1103515245 + 12345) | 0;
      return ((v >>> 16) & 65535) / 65536;
    }
    n1 = nr(1); n2 = nr(2); n3 = nr(3); n4 = nr(4); n5 = nr(5);
    /* haut large, legerement au-dessus du pied pour que le mur le recouvre */
    topYL = y - 2.4 - n1 * 1.1;
    topYR = y - 2.0 - n3 * 1.0;
    topL = x - w * (0.78 + n2 * 0.18);
    topR = x + w * (0.76 + n4 * 0.20);
    midLY = y + h * (0.46 + n5 * 0.10);
    midRY = y + h * (0.42 + n1 * 0.12);
    midLX = x - w * (0.40 + n2 * 0.16);
    midRX = x + w * (0.36 + n3 * 0.18);
    tipX = x + (n4 - 0.5) * w * 0.22;
    tipY = y + h * (0.96 + n5 * 0.08);
    c.beginPath();
    c.moveTo(topL, topYL);
    c.quadraticCurveTo((topL + topR) * 0.5, Math.min(topYL, topYR) - 1.4, topR, topYR);
    c.quadraticCurveTo(midRX + w * 0.08, midRY, tipX + w * (0.14 + n1 * 0.08), tipY - h * 0.10);
    c.quadraticCurveTo(tipX + w * 0.04, tipY + 0.8, tipX, tipY);
    c.quadraticCurveTo(tipX - w * 0.06, tipY + 0.6, tipX - w * (0.12 + n2 * 0.08), tipY - h * 0.12);
    c.quadraticCurveTo(midLX - w * 0.06, midLY, topL, topYL);
    c.closePath();
    g = c.createLinearGradient(x, y - 3, x, tipY);
    g.addColorStop(0, '#4a4238');
    g.addColorStop(0.18, '#564c42');
    g.addColorStop(0.48, '#65584c');
    g.addColorStop(0.78, '#5a5246');
    g.addColorStop(1, 'rgba(46, 50, 38, 0.08)');
    c.fillStyle = g;
    c.fill();
    c.save();
    c.clip();
    /* ombre portee de la paroi, juste sous le haut */
    g = c.createLinearGradient(0, y - 3, 0, y + h * 0.42);
    g.addColorStop(0, 'rgba(28, 22, 18, 0.42)');
    g.addColorStop(1, 'rgba(28, 22, 18, 0)');
    c.fillStyle = g;
    c.fillRect(topL - 2, y - 6, (topR - topL) + 4, h * 0.48);
    /* grain sombre, pas de calotte claire */
    c.fillStyle = 'rgba(36, 30, 24, 0.28)';
    for (i = 0; i < 6; i++) {
      px = x + (nr(8 + i) - 0.5) * w * 1.05;
      py = y + h * (0.18 + nr(14 + i) * 0.55);
      c.beginPath();
      c.ellipse(px, py, 0.8 + nr(20 + i) * 1.3, 0.5 + nr(24 + i) * 0.6, (nr(28 + i) - 0.5) * 0.7, 0, 7);
      c.fill();
    }
    c.restore();
  }

  function screeFootApron(c, pts, depth) {
    /* Bande continue, sombre et chaude, collee au pied de la paroi.
       Suit le U du mur. Pas une etagere pale ni un plancher. */
    var i, g, n, yb, d, x0, y0, yMin, yMax;
    d = depth || 9;
    n = pts.length;
    if (n < 2) { return; }
    yMin = pts[0][1];
    yMax = pts[0][1];
    for (i = 0; i < n; i++) {
      if (pts[i][1] < yMin) { yMin = pts[i][1]; }
      if (pts[i][1] > yMax) { yMax = pts[i][1]; }
    }
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1] - 3.0);
    for (i = 1; i < n; i++) {
      c.quadraticCurveTo(
        (pts[i - 1][0] + pts[i][0]) * 0.5,
        Math.min(pts[i - 1][1], pts[i][1]) - 3.4,
        pts[i][0], pts[i][1] - 2.4
      );
    }
    yb = pts[n - 1][1] + d + ((n * 3) % 4) - 1;
    c.lineTo(pts[n - 1][0] + 1.5, yb);
    for (i = n - 2; i >= 0; i--) {
      yb = pts[i][1] + d + ((i * 17) % 5) - 2;
      c.quadraticCurveTo(
        (pts[i + 1][0] + pts[i][0]) * 0.5 + ((i % 2) ? 2.5 : -2.0),
        pts[i][1] + d + 3.2,
        pts[i][0], yb
      );
    }
    c.closePath();
    g = c.createLinearGradient(0, yMin - 4, 0, yMax + d + 2);
    g.addColorStop(0, '#3a342c');
    g.addColorStop(0.28, '#464038');
    g.addColorStop(0.7, '#4a443c');
    g.addColorStop(1, 'rgba(40, 44, 34, 0.10)');
    c.fillStyle = g;
    c.fill();
    /* ombre de la paroi le long du haut */
    c.save();
    c.clip();
    g = c.createLinearGradient(0, yMin - 4, 0, yMin + 10);
    g.addColorStop(0, 'rgba(28, 22, 18, 0.55)');
    g.addColorStop(1, 'rgba(28, 22, 18, 0)');
    c.fillStyle = g;
    x0 = pts[0][0] - 4;
    y0 = yMin - 6;
    c.fillRect(x0, y0, pts[n - 1][0] - pts[0][0] + 8, 16);
    c.restore();
  }

  function screeFootBlend(c, pts, depth) {
    /* Apres la paroi : cache le liseré pale du calcaire par un joint
       irregulier, plus sombre, colle au pied. Pas une marche nette. */
    var i, n, d, g, yMin, yMax, jitter, top, bot;
    d = depth || 5;
    n = pts.length;
    if (n < 2) { return; }
    yMin = pts[0][1];
    yMax = pts[0][1];
    for (i = 0; i < n; i++) {
      if (pts[i][1] < yMin) { yMin = pts[i][1]; }
      if (pts[i][1] > yMax) { yMax = pts[i][1]; }
    }
    c.beginPath();
    jitter = ((pts[0][0] * 11 + pts[0][1] * 5) | 0) % 5;
    top = pts[0][1] - 2.4 - (jitter % 4) * 1.1;
    c.moveTo(pts[0][0], top);
    for (i = 1; i < n; i++) {
      top = pts[i][1] - 2.2 - ((i * 17) % 7) * 1.15;
      c.quadraticCurveTo(
        (pts[i - 1][0] + pts[i][0]) * 0.5 + ((i % 2) ? 2.4 : -2.2),
        Math.min(pts[i - 1][1], pts[i][1]) - 4.6,
        pts[i][0], top
      );
    }
    bot = pts[n - 1][1] + d + ((n * 7) % 3);
    c.lineTo(pts[n - 1][0] + 0.8, bot);
    for (i = n - 2; i >= 0; i--) {
      bot = pts[i][1] + d + ((i * 11) % 5) - 1.5;
      c.quadraticCurveTo(
        (pts[i + 1][0] + pts[i][0]) * 0.5 + ((i % 2) ? -1.8 : 1.5),
        pts[i][1] + d + 2.2,
        pts[i][0], bot
      );
    }
    c.closePath();
    g = c.createLinearGradient(0, yMin - 3, 0, yMax + d + 2);
    g.addColorStop(0, '#3a342c');
    g.addColorStop(0.35, '#4a4238');
    g.addColorStop(1, 'rgba(50, 46, 38, 0.18)');
    c.fillStyle = g;
    c.fill();
  }

  function fanFootTrees(c, x, y, w, h) {
    /* Sapins typifies qui recouvrent le bas de l'eventail. */
    typFir(c, x - w * 0.16, y + h * 0.78, 0.20, '#1a3220');
    typFir(c, x + w * 0.10, y + h * 0.94, 0.26, '#162818');
    typFir(c, x + w * 0.34, y + h * 0.70, 0.18, '#1e3620');
  }







  function woodenFence(c, x0, x1, y) {
    /* Clôture de bois typifiée (SAC : protection de la table contre le bétail).
       Hauteur réelle non documentée. */
    var x, ph = 7.2;
    c.strokeStyle = '#6a5030';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(x0, y - 4.2);
    c.lineTo(x1, y - 4.2);
    c.moveTo(x0, y - 2.1);
    c.lineTo(x1, y - 2.1);
    c.stroke();
    for (x = x0; x <= x1; x += 7.4) {
      c.fillStyle = '#5a4228';
      c.fillRect(x - 0.7, y - ph, 1.4, ph);
    }
  }
  function monumentalCairn(c, x, y, sc) {
    /* Cairn monumental du point 1463 (Altituderando). Taille typifiée,
       hauteur en mètres non revendiquée. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    var stones = [
      [-7, -2, 8, 3.2, '#8a8478'], [1, -2.2, 7.5, 3.0, '#a8a296'],
      [-5.5, -5.2, 6.2, 2.8, '#9a9488'], [0.8, -5.4, 5.8, 2.6, '#b0aa9e'],
      [-3.6, -8.0, 5.2, 2.4, '#8e887c'], [0.6, -8.2, 4.6, 2.3, '#a49e92'],
      [-2.0, -10.6, 4.2, 2.1, '#9c968a'], [-0.6, -12.6, 3.2, 1.8, '#b4aea2']
    ], i, s;
    c.fillStyle = 'rgba(40, 36, 30, 0.2)';
    c.beginPath(); c.ellipse(0, 1.0, 10, 2.2, 0, 0, 7); c.fill();
    for (i = 0; i < stones.length; i++) {
      s = stones[i];
      c.fillStyle = s[4];
      c.beginPath();
      c.ellipse(s[0] + s[2] / 2, s[1], s[2] / 2, s[3] / 2, 0, 0, 7);
      c.fill();
      c.strokeStyle = 'rgba(42, 38, 32, 0.45)';
      c.lineWidth = 0.45;
      c.stroke();
    }
    c.restore();
  }
  function metalCross16(c, x, y) {
    /* Croix métallique typifiée du lieu-dit La Croix (1 525 m), actuelle
       érigée en août 1968 par Favre (Andert-et-Condon), haubanée.
       Échelle humaine : ~5 m (réf. visuelle = pylône du Colomby vu au
       sommet, pas les 16 m réels qui transperçaient les nuages). */
    var M = 37 / 1.75, H = 5.0 * M, i, yy;
    var stemW = 0.28 * M, armW = 2.15 * M, armT = 0.26 * M, armY = -H * 0.78;
    c.save();
    c.translate(x, y);
    /* embase béton basse, plantée au sol */
    c.fillStyle = '#8a8680';
    c.beginPath();
    c.moveTo(-0.55 * M, 0.3);
    c.lineTo(-0.38 * M, -0.42 * M);
    c.lineTo(0.38 * M, -0.42 * M);
    c.lineTo(0.55 * M, 0.3);
    c.closePath();
    c.fill();
    c.strokeStyle = '#3a3834';
    c.lineWidth = 0.5;
    c.stroke();
    /* haubans : 4 câbles jusqu'au sol */
    c.strokeStyle = 'rgba(70, 72, 76, 0.75)';
    c.lineWidth = 0.45;
    c.lineCap = 'round';
    [[-1.55 * M, 0.15], [1.55 * M, 0.15], [-1.15 * M, 0.15], [1.15 * M, 0.15]].forEach(function (a, k) {
      c.beginPath();
      c.moveTo((k < 2 ? -1 : 1) * stemW * 0.2, -H * 0.58);
      c.lineTo(a[0], a[1]);
      c.stroke();
      c.fillStyle = '#6a6c70';
      c.fillRect(a[0] - 0.7, -1.1, 1.4, 1.4);
    });
    function bar(x0, y0, w, h) {
      c.fillStyle = '#5a5c60';
      c.fillRect(x0, y0, w, h);
      c.fillStyle = '#8a8c90';
      c.fillRect(x0, y0, w * 0.32, h);
      c.fillStyle = '#3a3c40';
      c.fillRect(x0 + w * 0.72, y0, w * 0.28, h);
      c.strokeStyle = '#2a2c2e';
      c.lineWidth = 0.55;
      c.strokeRect(x0, y0, w, h);
    }
    bar(-stemW / 2, -H, stemW, H - 0.42 * M);
    bar(-armW / 2, armY - armT / 2, armW, armT);
    /* rivets discrets et joints, pas des disques de brume */
    for (i = 0; i < 7; i++) {
      yy = -0.55 * M - i * ((H - 0.85 * M) / 6);
      c.fillStyle = '#3a3c40';
      c.beginPath(); c.arc(-stemW * 0.12, yy, 0.55, 0, 7); c.fill();
      c.fillStyle = '#b0b4b8';
      c.beginPath(); c.arc(-stemW * 0.12 - 0.15, yy - 0.15, 0.28, 0, 7); c.fill();
    }
    c.restore();
  }
  function concreteTable(c, x, y) {
    /* Table d'orientation en béton (1984, Le Progrès), typifiée. */
    tableOrientation(c, x, y);
  }

  /* ---------- cirque du Soliat / falaise du Mont d'Or / versants Colombier ---------- */




  function juraBelowPathGround(c, sx, sy, lip) {
    /* Un seul sol sous le sentier, toute la largeur : pas de couture
       verticale entre alpage ouest et vallee. */
    c.fillStyle = A.grad(c, 0, sy, 0, sy + 280, [0, '#5c7a48', 0.4, '#3e5e34', 1, '#2a4228']);
    c.beginPath();
    c.moveTo(sx - 420, sy + 1);
    c.lineTo(sx + 820, sy + 8);
    c.lineTo(sx + 820, sy + 290);
    c.lineTo(sx - 420, sy + 290);
    c.closePath();
    c.fill();
    /* herbe plus proche a gauche, qui se fond vers la droite (pas de coupe) */
    c.fillStyle = A.grad(c, lip - 90, 0, lip + 110, 0, [
      0, 'rgba(110, 140, 80, 0.50)',
      0.62, 'rgba(90, 120, 70, 0.16)',
      1, 'rgba(90, 120, 70, 0)'
    ]);
    c.beginPath();
    c.moveTo(sx - 420, sy + 1);
    c.lineTo(lip + 28, sy + 1);
    c.quadraticCurveTo(lip + 12, sy + 30, lip - 40, sy + 86);
    c.quadraticCurveTo(sx - 110, sy + 180, sx - 420, sy + 280);
    c.closePath();
    c.fill();
  }

  function juraPastureGrain(c, x0, y0, x1, y1, seed) {
    /* Texture d'alpage discrete : quelques touffes et cailloux, pas un tampon. */
    var i, x, y, sc, n, spanX, spanY;
    seed = seed || 11;
    spanX = x1 - x0;
    spanY = y1 - y0;
    if (spanX < 20 || spanY < 16) { return; }
    n = 18;
    for (i = 0; i < n; i++) {
      x = x0 + 8 + ((i * 53 + seed * 7) % (spanX - 16));
      y = y0 + 10 + ((i * 37 + seed * 3) % (spanY - 20));
      sc = 0.58 + (i % 3) * 0.16;
      tuftOnLedge(c, x, y, sc);
    }
    c.fillStyle = '#c4bdb0';
    for (i = 0; i < 8; i++) {
      x = x0 + 14 + ((i * 71 + seed * 5) % (spanX - 24));
      y = y0 + 16 + ((i * 43 + seed) % (spanY - 28));
      c.beginPath();
      c.ellipse(x, y, 3.2 + (i % 2) * 1.4, 1.5 + (i % 3) * 0.4, (i % 5) * 0.2 - 0.4, 0, 7);
      c.fill();
    }
    /* quelques plis d'alpage, très discrets */
    c.strokeStyle = 'rgba(70, 90, 50, 0.14)';
    c.lineWidth = 1.1;
    for (i = 0; i < 3; i++) {
      y = y0 + 28 + i * (spanY * 0.22);
      c.beginPath();
      c.moveTo(x0 + 8, y);
      c.quadraticCurveTo(x0 + spanX * 0.45, y + 5 + (i % 2) * 4, x1 - 10, y - 2);
      c.stroke();
    }
  }

  function juraFarAlps(c, vw, yFoot, opt) {
    /* Chaine alpine vue du Jura (~100+ km) : basse, nette, un seul
       calque. Relief 15-22 u (≈20-30 px a 461, ≈40-55 a 1280). Pied =
       fine ligne de brume, pas une bande ondulee double. */
    opt = opt || {};
    var kind = opt.kind || 'dor';
    var h = opt.h != null ? opt.h : (vw > 400 ? 22 : 15);
    var mbX = opt.mbX != null ? opt.mbX : (kind === 'van' ? 0.64 * vw : 0.58 * vw);
    var i, peaks, p, x, y, xPrev, typ, mbFrac, shift, rel;
    mbFrac = mbX / vw;
    /* [fracX, hauteur 0-1, typ] typ: f=pied, s=souple, c=col, p=pic,
       d=dome (MB), a=aiguille. */
    if (kind === 'van') {
      peaks = [
        [-0.05, 0.00, 'f'],
        [0.07, 0.20, 's'],
        [0.13, 0.34, 's'],
        [0.19, 0.62, 'p'],
        [0.23, 0.40, 'c'],
        [0.27, 0.76, 'p'],
        [0.32, 0.38, 'c'],
        [0.38, 0.50, 's'],
        [0.46, 0.32, 'c'],
        [0.52, 0.55, 's'],
        [0.58, 0.78, 's'],
        [0.64, 1.00, 'd'],
        [0.70, 0.68, 's'],
        [0.74, 0.88, 'a'],
        [0.77, 0.56, 'c'],
        [0.80, 0.74, 'a'],
        [0.86, 0.38, 's'],
        [0.95, 0.18, 's'],
        [1.05, 0.00, 'f']
      ];
      shift = mbFrac - 0.64;
    } else {
      peaks = [
        [-0.05, 0.00, 'f'],
        [0.08, 0.22, 's'],
        [0.16, 0.40, 's'],
        [0.22, 0.52, 'p'],
        [0.28, 0.32, 'c'],
        [0.36, 0.44, 's'],
        [0.44, 0.30, 'c'],
        [0.50, 0.58, 's'],
        [0.56, 0.76, 's'],
        [0.60, 1.00, 'd'],
        [0.66, 0.66, 's'],
        [0.70, 0.84, 'a'],
        [0.74, 0.52, 'c'],
        [0.78, 0.70, 'a'],
        [0.86, 0.34, 's'],
        [0.96, 0.16, 's'],
        [1.05, 0.00, 'f']
      ];
      shift = mbFrac - 0.60;
    }
    function X(frac) { return (frac + shift) * vw; }
    function Y(relh) { return yFoot - h * relh; }

    c.fillStyle = 'rgba(164, 184, 212, 0.74)';
    c.beginPath();
    c.moveTo(X(peaks[0][0]), Y(peaks[0][1]));
    for (i = 1; i < peaks.length; i++) {
      p = peaks[i];
      typ = p[2];
      x = X(p[0]);
      y = Y(p[1]);
      xPrev = X(peaks[i - 1][0]);
      if (typ === 'd') {
        c.quadraticCurveTo((xPrev + x) * 0.5, Y(p[1] * 0.92), x, y);
      } else if (typ === 'a' || typ === 'p') {
        c.lineTo(x, y);
      } else {
        c.quadraticCurveTo((xPrev + x) * 0.5, (Y(peaks[i - 1][1]) + y) * 0.5, x, y);
      }
    }
    /* pied = fine ligne, pas une bande epaisse ni un 2e calque */
    c.lineTo(X(1.05), yFoot + 1.4);
    c.quadraticCurveTo(X(0.5), yFoot + 2.0, X(-0.05), yFoot + 1.4);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(188, 204, 224, 0.40)';
    c.lineWidth = 1.0;
    c.beginPath();
    c.moveTo(X(-0.05), yFoot + 1.5);
    c.quadraticCurveTo(X(0.5), yFoot + 2.1, X(1.05), yFoot + 1.5);
    c.stroke();

    /* neige : calottes collees aux cimes, pas des ovales */
    c.fillStyle = 'rgba(240, 246, 252, 0.88)';
    for (i = 1; i < peaks.length - 1; i++) {
      p = peaks[i];
      typ = p[2];
      if (typ !== 'p' && typ !== 'a' && typ !== 'd') { continue; }
      x = X(p[0]);
      y = Y(p[1]);
      rel = typ === 'd' ? 0.55 * h : (typ === 'a' ? 0.22 * h : 0.28 * h);
      c.beginPath();
      if (typ === 'd') {
        c.moveTo(x - rel, y + 4.2);
        c.quadraticCurveTo(x - rel * 0.35, y + 0.5, x, y + 0.2);
        c.quadraticCurveTo(x + rel * 0.38, y + 0.5, x + rel, y + 4.2);
        c.quadraticCurveTo(x, y + 5.0, x - rel, y + 4.2);
      } else {
        c.moveTo(x - rel * 0.45, y + 2.6);
        c.lineTo(x, y + 0.15);
        c.lineTo(x + rel * 0.5, y + 2.6);
        c.quadraticCurveTo(x, y + 3.2, x - rel * 0.45, y + 2.6);
      }
      c.closePath();
      c.fill();
    }
  }

  function soliatCirque(c, sx, sy) {
    /* Vue typifiee d'apres creux-cirque-0 : depuis le Soliat on
       regarde EN FACE la paroi opposee, un amphitheatre vertical.
       Corne gauche haute et quasi verticale, mur du fond raccourci,
       levre d'herbe mince, stries et vires, cones d'eboulis, bol
       forestier dense. Pas une etagere pale ni un plat. */
    var lip = sx + 16;
    var i, gx, gy, t, x, y, yc, yf;

    juraBelowPathGround(c, sx, sy, lip);
    /* pente proche a gauche : alpage, quelques blocs, lisiere rare */
    juraPastureGrain(c, sx - 260, sy + 10, lip - 12, sy + 230, 19);
    typFirBand(c, sx - 190, sx - 8, function (x) {
      return sy + 52 + 7 * Math.sin((x - sx) * 0.05);
    }, 27, { step: 22, s0: 0.26, col: '#1a3220' });
    typFirBand(c, sx - 170, sx - 24, function (x) {
      return sy + 118 + 8 * Math.sin((x - sx) * 0.04);
    }, 9, { step: 38, s0: 0.22, col: '#1a3220' });

    /* ouverture a droite : collines organiques, APRES le mur */
    c.fillStyle = A.grad(c, 0, sy + 8, 0, sy + 200, [0, '#7a8e68', 0.45, '#4a6a40', 1, '#2a4a30']);
    c.beginPath();
    c.moveTo(lip + 350, sy + 52);
    c.quadraticCurveTo(lip + 460, sy + 16, lip + 740, sy + 28);
    c.lineTo(lip + 740, sy + 220);
    c.quadraticCurveTo(lip + 480, sy + 170, lip + 360, sy + 150);
    c.quadraticCurveTo(lip + 345, sy + 90, lip + 350, sy + 52);
    c.closePath();
    c.fill();
    typFirBand(c, lip + 370, lip + 720, function (x) { return sy + 66 + (x - lip) * 0.01; }, 71, { step: 16, s0: 0.22, col: '#1a3220' });
    juraPastureGrain(c, lip + 360, sy + 24, lip + 720, sy + 140, 31);
    typFirBand(c, lip + 400, lip + 690, function (x) { return sy + 44 + 7 * Math.sin(x * 0.05); }, 89, { step: 11, s0: 0.28, col: '#1e3620' });
    typFirBand(c, lip + 430, lip + 700, function (x) { return sy + 86 + 6 * Math.sin(x * 0.07); }, 97, { step: 14, s0: 0.20, col: '#243c24' });

    /* 1. bol forestier dense : sous le U, et il remonte dans
       l'ouverture a droite (le bol doit se lire a 1280). */
    function bowlForestPath() {
      c.beginPath();
      /* le haut de la foret colle le pied de la paroi, y compris
         sous la corne gauche — pas de plancher pale dans le U */
      c.moveTo(lip + 6, sy + 88);
      c.quadraticCurveTo(lip + 28, sy + 100, lip + 70, sy + 86);
      c.quadraticCurveTo(lip + 120, sy + 56, lip + 170, sy + 46);
      c.quadraticCurveTo(lip + 230, sy + 46, lip + 280, sy + 62);
      c.quadraticCurveTo(lip + 328, sy + 90, lip + 350, sy + 70);
      /* l'ouverture : la foret remonte, plus de mur */
      c.quadraticCurveTo(lip + 375, sy + 44, lip + 440, sy + 38);
      c.quadraticCurveTo(lip + 560, sy + 44, lip + 700, sy + 66);
      c.quadraticCurveTo(lip + 720, sy + 160, lip + 500, sy + 215);
      c.quadraticCurveTo(lip + 240, sy + 230, lip + 80, sy + 200);
      c.quadraticCurveTo(lip + 4, sy + 140, lip + 4, sy + 90);
      c.closePath();
    }
    c.fillStyle = A.grad(c, 0, sy + 40, 0, sy + 220, [0, '#2a4a28', 0.4, '#1a3220', 1, '#102018']);
    bowlForestPath();
    c.fill();
    c.save();
    bowlForestPath();
    c.clip();
    cirqueForest(c, lip + 16, lip + 680, sy + 44, sy + 215);
    typFirBand(c, lip + 30, lip + 500, function (x) { return sy + 170 + 7 * Math.sin(x * 0.06); }, 73, { step: 8, s0: 0.44, col: '#162818' });
    typFirBand(c, lip + 40, lip + 560, function (x) { return sy + 132 + 6 * Math.sin(x * 0.08); }, 81, { step: 10, s0: 0.36, col: '#1a3220' });
    typFirBand(c, lip + 360, lip + 680, function (x) { return sy + 58 + 5 * Math.sin(x * 0.05); }, 71, { step: 13, s0: 0.30, col: '#1a3220' });
    c.restore();

    /* 2. eboulis : bande sombre collee au pied, eventails irreguliers
       qui s'effilent dans la foret. Pas de galets flottants. */
    screeFootApron(c, [
      [lip + 26, sy + 104],
      [lip + 42, sy + 86],
      [lip + 58, sy + 90],
      [lip + 82, sy + 80],
      [lip + 110, sy + 62],
      [lip + 160, sy + 46],
      [lip + 210, sy + 48],
      [lip + 250, sy + 68],
      [lip + 290, sy + 92],
      [lip + 328, sy + 96],
      [lip + 348, sy + 72]
    ], 7);
    screeFan(c, lip + 36, sy + 86, 24, 18);
    screeFan(c, lip + 78, sy + 90, 22, 16);
    screeFan(c, lip + 150, sy + 50, 18, 11);
    screeFan(c, lip + 215, sy + 48, 18, 11);
    screeFan(c, lip + 285, sy + 80, 22, 16);
    /* sapins par-dessus le bas des eventails, pas entre le mur et l'eboulis */
    c.save();
    bowlForestPath();
    c.clip();
    typFirBand(c, lip + 50, lip + 640, function (x) { return sy + 96 + 5 * Math.sin(x * 0.09); }, 87, { step: 12, s0: 0.28, col: '#1e3620' });
    typFirBand(c, lip + 90, lip + 380, function (x) { return sy + 80 + 4 * Math.sin(x * 0.07); }, 61, { step: 14, s0: 0.22, col: '#243c24' });
    typFirBand(c, lip + 8, lip + 90, function (x) { return sy + 100 + 4 * Math.sin(x * 0.11); }, 19, { step: 11, s0: 0.24, col: '#1a3220' });
    typFirBand(c, lip + 70, lip + 340, function (x) { return sy + 66 + 5 * Math.sin(x * 0.08); }, 41, { step: 12, s0: 0.20, col: '#1e3620' });
    fanFootTrees(c, lip + 36, sy + 86, 24, 18);
    fanFootTrees(c, lip + 78, sy + 90, 22, 16);
    fanFootTrees(c, lip + 150, sy + 50, 18, 11);
    fanFootTrees(c, lip + 215, sy + 48, 18, 11);
    fanFootTrees(c, lip + 285, sy + 80, 22, 16);
    c.restore();

    /* 3. paroi en fer a cheval, plus courte : l'ouverture a droite
       laisse voir le bol. Cornes hautes, mur du fond raccourci. */
    function farRimWall() {
      c.beginPath();
      c.moveTo(lip + 8, sy + 8);
      c.quadraticCurveTo(lip + 50, sy + 2, lip + 100, sy + 0);
      c.quadraticCurveTo(lip + 170, sy - 3, lip + 240, sy + 2);
      c.quadraticCurveTo(lip + 290, sy + 8, lip + 328, sy + 22);
      c.quadraticCurveTo(lip + 344, sy + 34, lip + 350, sy + 50);
      /* corne droite, assez verticale, puis l'ouverture */
      c.quadraticCurveTo(lip + 344, sy + 74, lip + 328, sy + 96);
      /* pied en U : fond plus haut (le bol est de la foret, pas du calcaire),
         gauche encore haute, le coin s'arrondit dans l'eboulis */
      c.quadraticCurveTo(lip + 290, sy + 96, lip + 250, sy + 68);
      c.quadraticCurveTo(lip + 200, sy + 48, lip + 160, sy + 46);
      c.quadraticCurveTo(lip + 110, sy + 58, lip + 82, sy + 80);
      c.quadraticCurveTo(lip + 68, sy + 94, lip + 48, sy + 88);
      c.quadraticCurveTo(lip + 22, sy + 50, lip + 8, sy + 10);
      c.closePath();
    }
    limestoneTex(c, farRimWall, {
      y0: sy - 6, y1: sy + 122, x0: lip + 4, x1: lip + 354,
      light: -1, seed: 23, base: '#8e877c', loose: true, karst: true,
      noStroke: true, nJoint: 7
    });
    c.save();
    farRimWall();
    c.clip();
    c.fillStyle = A.grad(c, lip + 10, 0, lip + 340, 0, [
      0, 'rgba(32, 26, 20, 0.46)',
      0.38, 'rgba(36, 30, 24, 0.22)',
      1, 'rgba(50, 44, 38, 0.05)'
    ]);
    c.fillRect(lip, sy - 8, 360, 140);
    c.fillStyle = A.grad(c, 0, sy, 0, sy + 36, [
      0, 'rgba(28, 24, 20, 0.22)',
      1, 'rgba(28, 24, 20, 0)'
    ]);
    c.fillRect(lip, sy - 6, 360, 40);
    /* stries verticales inegales, plus longues sur les cornes */
    c.strokeStyle = 'rgba(40, 34, 28, 0.36)';
    var jxs = [22, 48, 86, 128, 175, 230, 278, 318];
    for (i = 0; i < jxs.length; i++) {
      gx = lip + jxs[i] + ((i * 3) % 5) - 2;
      yc = (i < 3) ? sy + 8 : (i > 5) ? sy + 16 : sy + 2;
      yf = (i < 3) ? sy + 108 : (i > 5) ? sy + 90 : sy + 64;
      c.lineWidth = (i % 3 === 0) ? 1.25 : 0.85;
      c.beginPath();
      c.moveTo(gx, yc + 3 + (i % 4) * 2);
      c.quadraticCurveTo(gx + ((i % 3) - 1) * 4, (yc + yf) * 0.5, gx + ((i % 5) - 2) * 2, yf - 6 - (i % 3) * 4);
      c.stroke();
    }
    /* vires courtes et brisees, segments independants — pas de glyphe
       ni de grande courbe en "B" / "3" */
    c.strokeStyle = 'rgba(46, 40, 34, 0.28)';
    var segs = [
      [20, 22, 60, 20, 108, 24],
      [36, 44, 78, 40, 128, 42],
      [96, 16, 148, 14, 198, 20],
      [118, 52, 164, 48, 214, 46],
      [168, 28, 214, 26, 258, 34],
      [206, 54, 244, 56, 286, 62],
      [236, 20, 276, 28, 314, 42],
      [54, 70, 92, 74, 130, 82]
    ];
    for (i = 0; i < segs.length; i++) {
      c.lineWidth = (i % 2) ? 1.0 : 0.7;
      c.beginPath();
      c.moveTo(lip + segs[i][0], sy + segs[i][1]);
      c.quadraticCurveTo(lip + segs[i][2], sy + segs[i][3], lip + segs[i][4], sy + segs[i][5]);
      c.stroke();
    }
    /* pied de face assombri : le calcaire ne forme plus un liseré pale */
    c.fillStyle = A.grad(c, 0, sy + 34, 0, sy + 100, [
      0, 'rgba(36, 30, 24, 0)',
      0.42, 'rgba(38, 32, 26, 0.20)',
      1, 'rgba(30, 24, 20, 0.58)'
    ]);
    c.fillRect(lip, sy + 28, 360, 110);
    c.restore();

    /* joint sombre et irregulier au pied, par-dessus le liseré pale du mur */
    screeFootBlend(c, [
      [lip + 26, sy + 104],
      [lip + 42, sy + 86],
      [lip + 58, sy + 90],
      [lip + 82, sy + 80],
      [lip + 110, sy + 62],
      [lip + 160, sy + 46],
      [lip + 210, sy + 48],
      [lip + 250, sy + 68],
      [lip + 290, sy + 92],
      [lip + 328, sy + 96],
      [lip + 348, sy + 72]
    ], 6);
    typFir(c, lip + 48, sy + 96, 0.17, '#1a3220');
    typFir(c, lip + 68, sy + 90, 0.20, '#162818');
    typFir(c, lip + 92, sy + 78, 0.16, '#1e3620');

    /* levre d'herbe MINCE (4-6 u) le long de la crete, pas une rampe */
    c.fillStyle = '#6a8a48';
    c.beginPath();
    c.moveTo(lip + 8, sy + 6);
    c.quadraticCurveTo(lip + 100, sy - 2, lip + 230, sy + 2);
    c.quadraticCurveTo(lip + 300, sy + 8, lip + 336, sy + 22);
    c.lineTo(lip + 334, sy + 27);
    c.quadraticCurveTo(lip + 298, sy + 13, lip + 228, sy + 7);
    c.quadraticCurveTo(lip + 100, sy + 3, lip + 8, sy + 11);
    c.closePath();
    c.fill();
    typFir(c, lip + 110, sy + 0, 0.26, '#1e3620');
    typFir(c, lip + 178, sy - 2, 0.30, '#243c24');
    typFir(c, lip + 242, sy + 2, 0.24, '#1e3620');
    typFir(c, lip + 300, sy + 10, 0.20, '#243c24');

    /* levre proche : herbe qui s'enroule, quelques blocs */
    c.fillStyle = '#7aa050';
    c.beginPath();
    c.moveTo(sx - 140, sy + 0);
    c.lineTo(lip + 18, sy + 1);
    c.quadraticCurveTo(lip + 26, sy + 5, lip + 14, sy + 8);
    c.quadraticCurveTo(sx + 4, sy + 3, sx - 140, sy + 3);
    c.closePath();
    c.fill();
    c.fillStyle = '#6a8a4c';
    c.beginPath();
    c.ellipse(sx + 28, sy + 1, 58, 4.5, 0, 0, 7);
    c.fill();
    c.fillStyle = '#c8c2b6';
    c.beginPath(); c.ellipse(sx - 14, sy + 1, 6, 2.6, -0.2, 0, 7); c.fill();
    c.beginPath(); c.ellipse(lip + 10, sy + 1.6, 7, 3, 0.12, 0, 7); c.fill();
    c.beginPath(); c.ellipse(lip + 28, sy + 2.2, 5, 2.2, 0.1, 0, 7); c.fill();
  }

  function dorEastCliff(c, sx, sy) {
    /* Vue typifiee d'apres « Falaise du Mont d'Or en avril » et
       mont-dor-1 : depuis le sommet, la face est tombe verticalement
       (200-300 m typifies, pas au 1:1) vers Vallorbe / Joux. Cap
       herbeux modeste, face ombree a joints et vires, cones d'eboulis
       contre le pied, puis la foret. Pas une dalle pale vue du dessus,
       pas une etagere flottante. */
    var lip = sx + 18;
    var i, gx, yc, yf;

    juraBelowPathGround(c, sx, sy, lip);
    typFir(c, sx - 78, sy + 30, 0.42, '#243c24');
    tuftOnLedge(c, sx - 54, sy + 24, 0.9);
    tuftOnLedge(c, sx - 100, sy + 40, 0.8);

    /* 1. foret de vallee : elle remonte jusqu'au pied de la paroi */
    function valleyForestPath() {
      c.beginPath();
      c.moveTo(lip + 6, sy + 96);
      c.quadraticCurveTo(lip + 40, sy + 102, lip + 90, sy + 86);
      c.quadraticCurveTo(lip + 170, sy + 72, lip + 250, sy + 66);
      c.quadraticCurveTo(lip + 330, sy + 70, lip + 460, sy + 88);
      c.quadraticCurveTo(lip + 560, sy + 150, lip + 420, sy + 215);
      c.quadraticCurveTo(lip + 200, sy + 230, lip + 40, sy + 200);
      c.quadraticCurveTo(lip + 0, sy + 140, lip + 6, sy + 96);
      c.closePath();
    }
    c.fillStyle = A.grad(c, 0, sy + 66, 0, sy + 220, [0, '#2a4a28', 0.45, '#1a3220', 1, '#102018']);
    valleyForestPath();
    c.fill();
    c.save();
    valleyForestPath();
    c.clip();
    typFirBand(c, lip + 16, lip + 280, function (x) { return sy + 150 + 6 * Math.sin(x * 0.06); }, 47, { step: 10, s0: 0.36, col: '#162818' });
    c.restore();

    /* 2. eboulis colle au pied, eventails qui s'effilent dans la foret */
    screeFootApron(c, [
      [lip + 22, sy + 90],
      [lip + 64, sy + 102],
      [lip + 130, sy + 92],
      [lip + 220, sy + 84],
      [lip + 340, sy + 78],
      [lip + 440, sy + 68],
      [lip + 470, sy + 62]
    ], 7);
    screeFan(c, lip + 36, sy + 98, 22, 20);
    screeFan(c, lip + 90, sy + 92, 24, 20);
    screeFan(c, lip + 160, sy + 84, 24, 20);
    screeFan(c, lip + 230, sy + 82, 22, 18);
    screeFan(c, lip + 300, sy + 78, 22, 16);
    screeFan(c, lip + 360, sy + 76, 18, 14);
    c.save();
    valleyForestPath();
    c.clip();
    typFirBand(c, lip + 30, lip + 400, function (x) { return sy + 118 + 5 * Math.sin(x * 0.08); }, 53, { step: 12, s0: 0.26, col: '#1a3220' });
    typFirBand(c, lip + 50, lip + 520, function (x) { return sy + 92 + 4 * Math.sin(x * 0.07); }, 49, { step: 14, s0: 0.20, col: '#1e3620' });
    typFirBand(c, lip + 8, lip + 120, function (x) { return sy + 108 + 4 * Math.sin(x * 0.1); }, 17, { step: 13, s0: 0.22, col: '#1a3220' });
    fanFootTrees(c, lip + 36, sy + 98, 22, 20);
    fanFootTrees(c, lip + 90, sy + 92, 24, 20);
    fanFootTrees(c, lip + 160, sy + 84, 24, 20);
    fanFootTrees(c, lip + 230, sy + 82, 22, 18);
    fanFootTrees(c, lip + 300, sy + 78, 22, 16);
    fanFootTrees(c, lip + 360, sy + 76, 18, 14);
    c.restore();

    /* 3. paroi verticale : gauche haute et quasi verticale, un peu
       moins haute a droite en s'eloignant. */
    function facePath() {
      c.beginPath();
      c.moveTo(lip + 12, sy + 8);
      c.quadraticCurveTo(lip + 50, sy - 2, lip + 110, sy + 0);
      c.quadraticCurveTo(lip + 180, sy + 4, lip + 250, sy + 8);
      c.quadraticCurveTo(lip + 310, sy + 14, lip + 375, sy + 28);
      /* l'extremite fuit et s'abaisse dans la foret, pas un bloc coupe */
      c.quadraticCurveTo(lip + 430, sy + 42, lip + 478, sy + 58);
      c.quadraticCurveTo(lip + 470, sy + 64, lip + 440, sy + 68);
      c.quadraticCurveTo(lip + 340, sy + 78, lip + 220, sy + 84);
      c.quadraticCurveTo(lip + 130, sy + 92, lip + 64, sy + 102);
      c.quadraticCurveTo(lip + 34, sy + 98, lip + 22, sy + 86);
      /* retour raide mais le coin bas s'arrondit dans l'eboulis */
      c.quadraticCurveTo(lip + 12, sy + 42, lip + 12, sy + 10);
      c.closePath();
    }
    limestoneTex(c, facePath, {
      y0: sy - 6, y1: sy + 104, x0: lip + 6, x1: lip + 478,
      light: -1, seed: 91, base: '#8e877c', loose: true, karst: true,
      noStroke: true, nJoint: 8
    });
    c.save();
    facePath();
    c.clip();
    /* ombre : plus sombre a gauche (le rebord proche) et sous le cap */
    c.fillStyle = A.grad(c, lip + 8, 0, lip + 460, 0, [
      0, 'rgba(32, 26, 20, 0.42)',
      0.4, 'rgba(36, 30, 24, 0.18)',
      1, 'rgba(50, 44, 38, 0.04)'
    ]);
    c.fillRect(lip, sy - 8, 360, 130);
    c.fillStyle = A.grad(c, 0, sy, 0, sy + 28, [
      0, 'rgba(28, 24, 20, 0.20)',
      1, 'rgba(28, 24, 20, 0)'
    ]);
    c.fillRect(lip, sy - 6, 360, 32);
    /* joints verticaux inegaux */
    c.strokeStyle = 'rgba(40, 34, 28, 0.36)';
    var jxs = [22, 48, 82, 122, 168, 214, 262, 308, 336];
    for (i = 0; i < jxs.length; i++) {
      gx = lip + jxs[i] + ((i * 3) % 5) - 2;
      yc = sy + 6 + (i % 4) * 2;
      yf = (i < 3) ? sy + 96 : (i > 6) ? sy + 64 : sy + 78;
      c.lineWidth = (i % 3 === 0) ? 1.2 : 0.8;
      c.beginPath();
      c.moveTo(gx, yc);
      c.quadraticCurveTo(gx + ((i % 3) - 1) * 3, (yc + yf) * 0.5, gx + ((i % 5) - 2) * 2, yf - 4);
      c.stroke();
    }
    /* vires courtes, brisees, a peu pres horizontales */
    c.strokeStyle = 'rgba(46, 40, 34, 0.28)';
    var segs = [
      [18, 20, 70, 18, 120, 22],
      [40, 38, 96, 36, 150, 40],
      [90, 16, 150, 14, 210, 20],
      [110, 52, 170, 50, 230, 54],
      [170, 28, 230, 26, 290, 34],
      [200, 62, 260, 64, 318, 58],
      [250, 22, 300, 28, 338, 40],
      [50, 72, 100, 76, 148, 84],
      [320, 36, 380, 44, 450, 56],
      [300, 58, 370, 62, 430, 66]
    ];
    for (i = 0; i < segs.length; i++) {
      c.lineWidth = (i % 2) ? 1.0 : 0.7;
      c.beginPath();
      c.moveTo(lip + segs[i][0], sy + segs[i][1]);
      c.quadraticCurveTo(lip + segs[i][2], sy + segs[i][3], lip + segs[i][4], sy + segs[i][5]);
      c.stroke();
    }
    c.restore();

    /* cap herbeux MODESTE (6-8 u) le long de la crete, pas une table */
    c.fillStyle = '#7aa050';
    c.beginPath();
    c.moveTo(sx - 130, sy + 0);
    c.lineTo(lip + 16, sy + 2);
    c.quadraticCurveTo(lip + 110, sy - 2, lip + 230, sy + 6);
    c.quadraticCurveTo(lip + 310, sy + 12, lip + 375, sy + 26);
    c.quadraticCurveTo(lip + 430, sy + 38, lip + 470, sy + 54);
    c.lineTo(lip + 462, sy + 58);
    c.quadraticCurveTo(lip + 424, sy + 44, lip + 370, sy + 32);
    c.quadraticCurveTo(lip + 308, sy + 18, lip + 228, sy + 12);
    c.quadraticCurveTo(lip + 110, sy + 4, lip + 14, sy + 8);
    c.lineTo(sx - 130, sy + 6);
    c.closePath();
    c.fill();
    tuftOnLedge(c, lip + 70, sy + 2, 0.7);
    tuftOnLedge(c, lip + 160, sy + 6, 0.55);
    tuftOnLedge(c, lip + 250, sy + 12, 0.5);
    tuftOnLedge(c, lip + 340, sy + 24, 0.45);
    tuftOnLedge(c, lip + 410, sy + 42, 0.4);
    /* l'extremite se fond dans eboulis et sapins, plus de mur coupe */
    screeFan(c, lip + 400, sy + 68, 18, 16);
    screeFan(c, lip + 445, sy + 66, 16, 14);
    typFir(c, lip + 415, sy + 68, 0.28, '#1a3220');
    typFir(c, lip + 448, sy + 64, 0.24, '#1e3620');
    typFir(c, lip + 482, sy + 62, 0.22, '#1a3220');
    typFir(c, lip + 408, sy + 80, 0.22, '#162818');
    typFir(c, lip + 452, sy + 76, 0.20, '#1a3220');
    /* herbe du rebord qui s'enroule un peu sur le coin gauche */
    c.fillStyle = '#7aa050';
    c.beginPath();
    c.moveTo(sx - 20, sy + 0);
    c.lineTo(lip + 22, sy + 2);
    c.quadraticCurveTo(lip + 30, sy + 14, lip + 16, sy + 26);
    c.quadraticCurveTo(sx + 8, sy + 8, sx - 20, sy + 5);
    c.closePath();
    c.fill();
  }

  function dentDuChat(c, x, y, sc) {
    /* Crête typifiée de la Dent du Chat / Mont du Chat, rive est
       du Bourget, d'après le calque posterisé de Commons
       « Vue lac bourget colombier 1007 ». Long massif boisé, pas
       un triangle isolé. Hauteur non revendiquée ici. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    /* arrière-plan du massif, plus clair */
    c.fillStyle = '#6a7e70';
    c.beginPath();
    c.moveTo(20, 28);
    c.quadraticCurveTo(70, -4, 130, 2);
    c.quadraticCurveTo(170, 8, 200, 28);
    c.lineTo(20, 32);
    c.closePath();
    c.fill();
    /* masse principale, boisée */
    c.fillStyle = '#3e5648';
    c.beginPath();
    c.moveTo(-50, 36);
    c.quadraticCurveTo(-10, 14, 28, 10);
    c.lineTo(58, -8);
    c.quadraticCurveTo(78, -14, 96, -2);
    c.lineTo(128, 10);
    c.quadraticCurveTo(170, 16, 220, 32);
    c.lineTo(220, 40);
    c.lineTo(-50, 40);
    c.closePath();
    c.fill();
    /* épaule qui descend vers le lac */
    c.fillStyle = '#33483c';
    c.beginPath();
    c.moveTo(-20, 36);
    c.quadraticCurveTo(10, 18, 40, 16);
    c.lineTo(70, 22);
    c.lineTo(70, 40);
    c.lineTo(-20, 40);
    c.closePath();
    c.fill();
    /* petite « dent » typifiée */
    c.fillStyle = '#2e4236';
    c.beginPath();
    c.moveTo(50, 8);
    c.lineTo(58, -8);
    c.lineTo(72, 0);
    c.lineTo(68, 20);
    c.lineTo(48, 20);
    c.closePath();
    c.fill();
    c.restore();
  }

  function slopeWood(c, x, y, sc, kind) {
    /* Sapin ou hêtre typifié, même ordre de grandeur, ancré sur la pente. */
    sc = sc || 1;
    if (kind === 'beech') {
      c.fillStyle = '#3a5a28';
      c.beginPath();
      c.ellipse(x, y - sc * 1.15, sc * 0.85, sc * 1.15, 0, 0, 7);
      c.fill();
      c.fillStyle = '#4a6a30';
      c.beginPath();
      c.ellipse(x - sc * 0.22, y - sc * 1.35, sc * 0.55, sc * 0.75, -0.2, 0, 7);
      c.fill();
      c.fillStyle = '#5a3a22';
      c.fillRect(x - sc * 0.08, y - sc * 0.15, sc * 0.16, sc * 0.35);
    } else {
      c.fillStyle = '#1e3a24';
      c.beginPath();
      c.moveTo(x, y - sc * 2.4);
      c.lineTo(x + sc * 0.95, y);
      c.lineTo(x - sc * 0.95, y);
      c.closePath();
      c.fill();
      c.fillStyle = '#2a4a30';
      c.beginPath();
      c.moveTo(x, y - sc * 2.0);
      c.lineTo(x + sc * 0.62, y - sc * 0.55);
      c.lineTo(x - sc * 0.62, y - sc * 0.55);
      c.closePath();
      c.fill();
    }
  }

  function firBelt(c, x0, x1, yRidge, yBot, seed, col) {
    /* Masse forestière à crête organique : les côtés s'incurvent,
       pas de parois verticales ni de dessus plat. */
    var i, x, y, sc, n, span, t, jx, jy, pad;
    seed = seed || 0;
    pad = 36;
    c.fillStyle = col || '#2a422c';
    c.beginPath();
    c.moveTo(x0 - pad, yBot + 8);
    c.quadraticCurveTo(x0 - pad * 0.3, (yRidge + yBot) * 0.5, x0, yRidge + 3);
    n = Math.max(5, ((x1 - x0) / 16) | 0);
    for (i = 1; i <= n; i++) {
      t = i / n;
      x = x0 + (x1 - x0) * t;
      y = yRidge + Math.sin(t * 5.4 + seed) * 4 + ((i * 5 + seed) % 5) - 2;
      c.quadraticCurveTo(x - (x1 - x0) / n * 0.5, y - 2.5, x, y);
    }
    c.quadraticCurveTo(x1 + pad * 0.3, (yRidge + yBot) * 0.5, x1 + pad, yBot + 8);
    c.closePath();
    c.fill();
    span = x1 - x0;
    for (i = 0; i < n + 2; i++) {
      t = (i + 0.3) / (n + 2);
      jx = x0 + span * t + ((i * 7 + seed) % 5) - 2;
      jy = yRidge + Math.sin(t * 5.4 + seed) * 4 + 1;
      sc = 2.0 + (i % 4) * 0.45;
      if (jx < x0 + 2 || jx > x1 - 2) { continue; }
      slopeWood(c, jx, jy + 1, sc, 'fir');
    }
  }

  function slopeOutcrop(c, x, y, sc) {
    /* Affleurement calcaire anguleux, face d'ombre, herbe au pied. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#8a8478';
    c.beginPath();
    c.moveTo(-7, 2);
    c.lineTo(-5, -3.2);
    c.lineTo(-1, -4.6);
    c.lineTo(4, -3.0);
    c.lineTo(7, 1.4);
    c.lineTo(2, 2.6);
    c.closePath();
    c.fill();
    c.fillStyle = '#5a564c';
    c.beginPath();
    c.moveTo(-1, -4.6);
    c.lineTo(4, -3.0);
    c.lineTo(5, 1.2);
    c.lineTo(-2, 1.6);
    c.closePath();
    c.fill();
    c.fillStyle = '#6a8a44';
    c.beginPath();
    c.ellipse(1, 2.4, 5.5, 1.3, 0, 0, 7);
    c.fill();
    c.restore();
  }

  function colombierSlopes(c, sx, sy) {
    /* Composition typifiée d'après le calque posterisé de Commons
       « Vue lac bourget colombier 1007 » : V de montagnes, long
       Bourget horizontal, Dent du Chat à droite, ceintures de
       sapins, pente herbeuse sous la crête. Style plat du jeu
       (Rhune / monde 2), pas un rendu photo.
       Le lac et la Dent sont calés pour le cadre portrait 461
       (le randonneur est à ~26 % de la gauche). */
    var bot = sy + 200, i, fx, fy, pal, g;
    /* fond : couvre le terrain jusqu'au bord 1280 */
    c.fillStyle = '#5a7248';
    c.beginPath();
    c.moveTo(sx - 140, sy + 20);
    c.quadraticCurveTo(sx + 300, sy + 12, sx + 880, sy + 32);
    c.lineTo(sx + 900, bot);
    c.lineTo(sx - 160, bot);
    c.closePath();
    c.fill();
    /* 1. lointain brumeux : le V derrière le lac */
    c.fillStyle = '#8a9a88';
    c.beginPath();
    c.moveTo(sx - 90, sy + 56);
    c.quadraticCurveTo(sx + 10, sy + 30, sx + 80, sy + 36);
    c.quadraticCurveTo(sx + 140, sy + 32, sx + 200, sy + 40);
    c.quadraticCurveTo(sx + 480, sy + 24, sx + 880, sy + 44);
    c.lineTo(sx + 880, sy + 72);
    c.lineTo(sx - 90, sy + 72);
    c.closePath();
    c.fill();
    /* crête gauche, qui descend vers le lac */
    c.fillStyle = '#6a8070';
    c.beginPath();
    c.moveTo(sx - 100, sy + 42);
    c.quadraticCurveTo(sx - 20, sy + 30, sx + 24, sy + 48);
    c.quadraticCurveTo(sx + 50, sy + 58, sx + 36, sy + 70);
    c.lineTo(sx - 100, sy + 70);
    c.closePath();
    c.fill();
    /* brume sur le col */
    c.fillStyle = 'rgba(210, 220, 214, 0.38)';
    c.beginPath();
    c.moveTo(sx + 40, sy + 34);
    c.quadraticCurveTo(sx + 140, sy + 26, sx + 260, sy + 42);
    c.lineTo(sx + 240, sy + 58);
    c.quadraticCurveTo(sx + 140, sy + 48, sx + 50, sy + 52);
    c.closePath();
    c.fill();
    /* 2. Dent du Chat : commence dans le cadre 461, s'allonge en 1280 */
    dentDuChat(c, sx + 148, sy + 40, 1.2);
    for (i = 0; i < 10; i++) {
      fx = sx + 120 + i * 14;
      fy = sy + 46 + (i % 3) * 3;
      slopeWood(c, fx, fy, 1.7 + (i % 3) * 0.25, 'fir');
    }
    c.fillStyle = '#3e5648';
    c.beginPath();
    c.moveTo(sx + 210, sy + 50);
    c.quadraticCurveTo(sx + 460, sy + 30, sx + 880, sy + 54);
    c.quadraticCurveTo(sx + 560, sy + 78, sx + 230, sy + 76);
    c.closePath();
    c.fill();
    c.fillStyle = '#33483c';
    c.beginPath();
    c.moveTo(sx + 240, sy + 62);
    c.quadraticCurveTo(sx + 520, sy + 68, sx + 880, sy + 66);
    c.lineTo(sx + 880, sy + 96);
    c.quadraticCurveTo(sx + 500, sy + 100, sx + 230, sy + 86);
    c.closePath();
    c.fill();
    /* 3. long Bourget, dans le cadre 461, s'amincit vers la Dent */
    pal = LAKEPAL.bourget;
    function bourgetPath() {
      c.beginPath();
      c.moveTo(sx + 4, sy + 68);
      c.quadraticCurveTo(sx - 6, sy + 58, sx + 28, sy + 50);
      c.quadraticCurveTo(sx + 70, sy + 42, sx + 110, sy + 44);
      c.quadraticCurveTo(sx + 155, sy + 46, sx + 188, sy + 58);
      c.quadraticCurveTo(sx + 172, sy + 68, sx + 150, sy + 74);
      c.quadraticCurveTo(sx + 90, sy + 82, sx + 42, sy + 80);
      c.quadraticCurveTo(sx + 16, sy + 76, sx + 4, sy + 68);
      c.closePath();
    }
    bourgetPath();
    g = c.createLinearGradient(sx + 10, 0, sx + 190, 0);
    g.addColorStop(0, pal.mid);
    g.addColorStop(0.55, pal.hi);
    g.addColorStop(1, pal.far);
    c.fillStyle = g;
    c.fill();
    c.save();
    bourgetPath();
    c.clip();
    c.fillStyle = pal.spark;
    c.globalAlpha = 0.18;
    c.beginPath();
    c.ellipse(sx + 60, sy + 60, 28, 3, 0, 0, 7);
    c.fill();
    c.beginPath();
    c.ellipse(sx + 120, sy + 54, 22, 2.4, 0, 0, 7);
    c.fill();
    c.restore();
    c.strokeStyle = pal.shore;
    c.lineWidth = 1.1;
    bourgetPath();
    c.stroke();
    /* rive lointaine + Aix typifiée sur la terre, au pied de la Dent */
    c.fillStyle = '#5a7058';
    c.beginPath();
    c.moveTo(sx + 110, sy + 46);
    c.quadraticCurveTo(sx + 150, sy + 48, sx + 188, sy + 58);
    c.quadraticCurveTo(sx + 150, sy + 54, sx + 110, sy + 50);
    c.closePath();
    c.fill();
    shoreHamlet(c, sx + 132, sy + 50, 0.4);
    shoreHamlet(c, sx + 154, sy + 53, 0.28);
    /* 4. épaule herbeuse entre la crête et le lac */
    c.fillStyle = '#6e8c48';
    c.beginPath();
    c.moveTo(sx + 16, sy + 6);
    c.quadraticCurveTo(sx + 240, sy + 8, sx + 720, sy + 26);
    c.quadraticCurveTo(sx + 400, sy + 44, sx + 90, sy + 52);
    c.quadraticCurveTo(sx + 40, sy + 26, sx + 16, sy + 6);
    c.closePath();
    c.fill();
    /* 5. colline boisée (dôme de la photo), devant le lac, dans le 461 */
    c.fillStyle = '#2e4a32';
    c.beginPath();
    c.moveTo(sx + 36, sy + 96);
    c.quadraticCurveTo(sx + 80, sy + 68, sx + 130, sy + 72);
    c.quadraticCurveTo(sx + 175, sy + 80, sx + 196, sy + 104);
    c.quadraticCurveTo(sx + 150, sy + 124, sx + 40, sy + 120);
    c.closePath();
    c.fill();
    /* sapins nets sur le dôme, ils font le rebord */
    for (i = 0; i < 14; i++) {
      fx = sx + 48 + i * 10 + ((i * 5) % 4);
      fy = sy + 74 + Math.sin(i * 0.65) * 5 + (i % 3);
      slopeWood(c, fx, fy, 2.2 + (i % 4) * 0.35, 'fir');
    }
    /* 6. versant qui tombe : couches qui se chevauchent, crêtes
       organiques, pas de rectangles ni d'intervalle vertical. */
    c.fillStyle = '#3a5238';
    c.beginPath();
    c.moveTo(sx - 160, bot + 24);
    c.quadraticCurveTo(sx - 70, sy + 108, sx - 16, sy + 98);
    c.quadraticCurveTo(sx + 60, sy + 116, sx + 130, sy + 110);
    c.quadraticCurveTo(sx + 260, sy + 124, sx + 420, sy + 118);
    c.quadraticCurveTo(sx + 640, sy + 130, sx + 920, sy + 142);
    c.lineTo(sx + 920, bot + 24);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(18, 28, 16, 0.16)';
    c.beginPath();
    c.moveTo(sx - 80, sy + 104);
    c.quadraticCurveTo(sx + 80, sy + 118, sx + 300, sy + 122);
    c.quadraticCurveTo(sx + 80, sy + 128, sx - 80, sy + 116);
    c.closePath();
    c.fill();
    for (i = 0; i < 22; i++) {
      fx = sx - 60 + i * 28 + ((i * 5) % 7);
      fy = sy + 102 + Math.sin(i * 0.55) * 6 + (i % 3);
      if (fx > sx + 520) { break; }
      slopeWood(c, fx, fy, 2.0 + (i % 4) * 0.35, 'fir');
    }
    /* couche plus proche, qui passe sous le dôme et relie gauche et droite */
    c.fillStyle = '#243a28';
    c.beginPath();
    c.moveTo(sx - 160, bot + 24);
    c.quadraticCurveTo(sx - 40, sy + 132, sx + 30, sy + 124);
    c.quadraticCurveTo(sx + 110, sy + 138, sx + 220, sy + 132);
    c.quadraticCurveTo(sx + 400, sy + 144, sx + 920, sy + 154);
    c.lineTo(sx + 920, bot + 24);
    c.closePath();
    c.fill();
    for (i = 0; i < 16; i++) {
      fx = sx - 50 + i * 26 + ((i * 7) % 6);
      fy = sy + 128 + Math.sin(i * 0.7 + 1) * 5 + (i % 2);
      if (fx > sx + 400) { break; }
      slopeWood(c, fx, fy, 2.15 + (i % 3) * 0.3, 'fir');
    }
    /* 7. pente herbeuse convexe sous la crête : sous-couche plus
       sombre, puis herbe au ventre arrondi (le plus à droite est
       à mi-pente, pas un coin au-dessus du lac). */
    c.fillStyle = '#5e7a40';
    c.beginPath();
    c.moveTo(sx - 120, sy + 16);
    c.quadraticCurveTo(sx - 10, sy + 6, sx + 86, sy + 18);
    c.quadraticCurveTo(sx + 60, sy + 58, sx + 8, sy + 94);
    c.quadraticCurveTo(sx - 50, sy + 98, sx - 104, sy + 68);
    c.quadraticCurveTo(sx - 130, sy + 42, sx - 120, sy + 18);
    c.closePath();
    c.fill();
    c.fillStyle = '#6e8c48';
    c.beginPath();
    c.moveTo(sx - 110, sy + 2);
    c.quadraticCurveTo(sx + 24, sy - 1, sx + 102, sy + 8);
    c.quadraticCurveTo(sx + 90, sy + 34, sx + 52, sy + 56);
    c.quadraticCurveTo(sx + 16, sy + 76, sx - 38, sy + 74);
    c.quadraticCurveTo(sx - 90, sy + 54, sx - 110, sy + 20);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(40, 56, 28, 0.12)';
    c.beginPath();
    c.moveTo(sx - 8, sy + 40);
    c.quadraticCurveTo(sx + 36, sy + 58, sx + 12, sy + 74);
    c.quadraticCurveTo(sx - 30, sy + 78, sx - 72, sy + 56);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(230, 220, 160, 0.08)';
    c.beginPath();
    c.moveTo(sx - 60, sy + 8);
    c.quadraticCurveTo(sx - 8, sy + 20, sx + 24, sy + 34);
    c.quadraticCurveTo(sx - 6, sy + 22, sx - 50, sy + 14);
    c.closePath();
    c.fill();
    /* 8. pelouse de crête, monticule doux, sentier court */
    c.fillStyle = '#74a04c';
    c.beginPath();
    c.moveTo(sx - 60, sy - 1);
    c.quadraticCurveTo(sx + 90, sy - 3, sx + 420, sy + 6);
    c.lineTo(sx + 400, sy + 12);
    c.quadraticCurveTo(sx + 90, sy + 8, sx - 60, sy + 8);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(sx + 40, sy + 5);
    c.quadraticCurveTo(sx + 58, sy - 1.5, sx + 78, sy + 5);
    c.quadraticCurveTo(sx + 58, sy + 8, sx + 40, sy + 5);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(176, 160, 120, 0.5)';
    c.lineWidth = 1.15;
    c.beginPath();
    c.moveTo(sx - 8, sy + 2.4);
    c.quadraticCurveTo(sx + 16, sy + 3.2, sx + 36, sy + 4.2);
    c.stroke();
    c.strokeStyle = 'rgba(70, 96, 40, 0.26)';
    c.lineWidth = 0.55;
    for (i = 0; i < 18; i++) {
      fx = sx - 44 + (i * 11) % 90;
      fy = sy + 14 + ((i * 13) % 40);
      c.beginPath();
      c.moveTo(fx, fy);
      c.lineTo(fx + 2.0, fy - 1.3);
      c.stroke();
    }
  }

  function tableOrientation(c, x, y) {
    c.fillStyle = '#8a8680';
    c.fillRect(x - 3.6, y - 11, 7.2, 11);
    c.strokeStyle = '#2a2824'; c.lineWidth = 0.55; c.strokeRect(x - 3.6, y - 11, 7.2, 11);
    c.fillStyle = '#c8c4bc'; c.beginPath(); c.arc(x, y - 13.2, 6.2, 0, 7); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.7; c.beginPath(); c.arc(x, y - 13.2, 6.2, 0, 7); c.stroke();
    c.strokeStyle = '#4a6a88'; c.lineWidth = 0.45;
    c.beginPath(); c.moveTo(x - 4.4, y - 13.2); c.lineTo(x + 4.4, y - 13.2); c.stroke();
    c.beginPath(); c.moveTo(x, y - 17.4); c.lineTo(x, y - 9.0); c.stroke();
    c.fillStyle = '#c0392b'; c.beginPath(); c.arc(x, y - 13.2, 0.7, 0, 7); c.fill();
  }
  function woodenBench(c, x, y, w) {
    w = w || 16;
    c.fillStyle = '#6a5030';
    c.fillRect(x, y - 8, w, 1.7);
    c.fillRect(x + 1, y - 8, 1.5, 8);
    c.fillRect(x + w - 2.5, y - 8, 1.5, 8);
    c.fillStyle = '#8a6a40'; c.fillRect(x, y - 8, w, 0.55);
  }
  /* Dôme géodésique opaque à facettes (pentagones / hexagones), d'après
     Commons La_Dôle_sommet03_2015-02-07.jpg et sommet01 (2015). Pas une bulle de verre. */
  function facetedDome(c, R) {
    var phi = (1 + Math.sqrt(5)) / 2, verts = [], mid = {}, faces0, faces, i, j, k;
    function add(x, y, z) {
      var l = Math.sqrt(x * x + y * y + z * z);
      verts.push([x / l, y / l, z / l]);
      return verts.length - 1;
    }
    function ek(a, b) { return a < b ? a + '_' + b : b + '_' + a; }
    function midpoint(a, b) {
      var k = ek(a, b);
      if (mid[k] != null) { return mid[k]; }
      var A = verts[a], B = verts[b];
      mid[k] = add(A[0] + B[0], A[1] + B[1], A[2] + B[2]);
      return mid[k];
    }
    [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
     [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
     [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].forEach(function (v) { add(v[0], v[1], v[2]); });
    faces0 = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    faces = [];
    for (i = 0; i < faces0.length; i++) {
      var ia = midpoint(faces0[i][0], faces0[i][1]), ib = midpoint(faces0[i][1], faces0[i][2]), ic = midpoint(faces0[i][2], faces0[i][0]);
      faces.push([faces0[i][0], ia, ic], [faces0[i][1], ib, ia], [faces0[i][2], ic, ib], [ia, ib, ic]);
    }
    var ca = Math.cos(0.55), sa = Math.sin(0.55), cb = Math.cos(-0.32), sb = Math.sin(-0.32);
    function rot(v) {
      var x = v[0] * ca + v[2] * sa, z = -v[0] * sa + v[2] * ca, y = v[1];
      return [x, y * cb - z * sb, y * sb + z * cb];
    }
    var rv = verts.map(rot), inc = [];
    for (i = 0; i < verts.length; i++) { inc[i] = []; }
    for (i = 0; i < faces.length; i++) {
      inc[faces[i][0]].push(i); inc[faces[i][1]].push(i); inc[faces[i][2]].push(i);
    }
    function centroid(fi) {
      var f = faces[fi], p = rv[f[0]], q = rv[f[1]], r = rv[f[2]];
      var x = (p[0] + q[0] + r[0]) / 3, y = (p[1] + q[1] + r[1]) / 3, z = (p[2] + q[2] + r[2]) / 3;
      var l = Math.sqrt(x * x + y * y + z * z);
      return [x / l, y / l, z / l];
    }
    var polys = [], fids, ordered, used, fi, f, gi, g, common, pts, cx, cy, cz, poly, w, wr, wg, wb, px, py;
    for (i = 0; i < verts.length; i++) {
      fids = inc[i];
      ordered = [fids[0]]; used = {}; used[fids[0]] = true;
      while (ordered.length < fids.length) {
        fi = ordered[ordered.length - 1]; f = faces[fi];
        var found = false;
        for (j = 0; j < fids.length; j++) {
          if (used[fids[j]]) { continue; }
          gi = fids[j]; g = faces[gi]; common = 0;
          for (k = 0; k < 3; k++) {
            if (g[k] === f[0] || g[k] === f[1] || g[k] === f[2]) { common++; }
          }
          if (common === 2) { ordered.push(gi); used[gi] = true; found = true; break; }
        }
        if (!found) { break; }
      }
      if (ordered.length < 5) { continue; }
      pts = []; cx = 0; cy = 0; cz = 0;
      for (j = 0; j < ordered.length; j++) {
        var pt = centroid(ordered[j]);
        pts.push(pt); cx += pt[0]; cy += pt[1]; cz += pt[2];
      }
      cx /= pts.length; cy /= pts.length; cz /= pts.length;
      if (cz <= 0.04) { continue; }
      polys.push({ z: cz, pts: pts, lum: 0.60 + 0.40 * Math.max(0, -0.30 * cx + 0.58 * cy + 0.72 * cz) });
    }
    polys.sort(function (p, q) { return p.z - q.z; });
    c.lineJoin = 'round';
    for (i = 0; i < polys.length; i++) {
      poly = polys[i];
      w = Math.round(216 * poly.lum + 26);
      wr = Math.min(255, w + 1); wg = Math.min(255, w + 2); wb = Math.min(255, w + 6);
      c.fillStyle = 'rgb(' + wr + ',' + wg + ',' + wb + ')';
      c.beginPath();
      for (j = 0; j < poly.pts.length; j++) {
        px = poly.pts[j][0] * R; py = -poly.pts[j][1] * R;
        if (j === 0) { c.moveTo(px, py); } else { c.lineTo(px, py); }
      }
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(126,134,144,' + (0.40 + 0.24 * (1 - poly.lum)).toFixed(2) + ')';
      c.lineWidth = Math.max(0.45, R * 0.011);
      c.stroke();
    }
    c.beginPath(); c.arc(0, 0, R, 0, 7);
    c.strokeStyle = '#7a828a'; c.lineWidth = Math.max(0.65, R * 0.012); c.stroke();
  }

  /* Perspective de second plan (même convention que la tour TDF de la Rhune).
     L'échelle réelle (1 m ≈ 21,1 u) est conservée dans le plan de l'objet. */
  function recede(c, ax, ay, sc, fn) {
    c.save();
    c.translate(ax, ay - (1 - sc) * 26);
    c.scale(sc, sc);
    c.translate(-ax, -ay);
    try { fn(c); } finally { c.restore(); }
  }

  /* Bâtiment Skyguide + radôme 19 m. Proportions du bâtiment typifiées
     d'après Commons sommet03 / sommet01 (soubassement en moellons, bardage
     métallique clair, dôme encastré dans le toit). Diamètre 19 m : La Côte / France 3, 2023. */
  function skyguideStation(c, x, y, M) {
    var D = 19, R = (D / 2) * M, bw = 16.2 * M, stoneH = 7.2 * M, metalH = 3.2 * M;
    var bH = stoneH + metalH, sink = 2.2 * M, cy = -(bH - sink + R);
    var i, j, sx, sy, sw, sh, wx;
    c.save(); c.translate(x, y);
    /* dalle */
    c.fillStyle = '#c8c4bc';
    c.beginPath(); c.ellipse(0, 1.2, bw * 0.72, 3.2, 0, 0, 7); c.fill();
    c.fillStyle = '#b8b4ac';
    c.fillRect(-bw * 0.58, -2.2, bw * 1.16, 2.6);
    /* soubassement en moellons calcaires */
    c.fillStyle = '#b8a888';
    c.fillRect(-bw / 2, -stoneH, bw, stoneH);
    c.fillStyle = '#9a8a70';
    c.fillRect(-bw / 2, -2.4, bw, 2.4);
    for (i = 0; i < 7; i++) {
      for (j = 0; j < 5; j++) {
        sx = -bw / 2 + 1.2 + (i + (j % 2) * 0.45) * (bw / 7.2);
        sy = -stoneH + 1.0 + j * (stoneH / 5.15);
        sw = bw / 7.6; sh = stoneH / 5.6;
        c.fillStyle = (i + j) % 3 === 0 ? '#c8b898' : ((i + j) % 3 === 1 ? '#a89878' : '#b0a080');
        c.fillRect(sx, sy, sw - 0.7, sh - 0.55);
        c.strokeStyle = 'rgba(70,60,48,0.35)'; c.lineWidth = 0.4; c.strokeRect(sx, sy, sw - 0.7, sh - 0.55);
      }
    }
    /* baies vitrées sombres de l'étage pierre, léger reflet */
    for (i = 0; i < 4; i++) {
      wx = -bw * 0.36 + i * bw * 0.24;
      c.fillStyle = '#2a3034'; c.fillRect(wx - 1.15 * M, -stoneH + 1.6 * M, 2.3 * M, 2.6 * M);
      var glass = c.createLinearGradient(wx - 1.0 * M, -stoneH + 1.75 * M, wx + 1.0 * M, -stoneH + 4.0 * M);
      glass.addColorStop(0, '#1a2830');
      glass.addColorStop(0.38, '#2a3e48');
      glass.addColorStop(0.55, '#6a8490');
      glass.addColorStop(0.72, '#1c2c34');
      glass.addColorStop(1, '#121c22');
      c.fillStyle = glass;
      c.fillRect(wx - 1.0 * M, -stoneH + 1.75 * M, 2.0 * M, 2.3 * M);
      c.fillStyle = 'rgba(220, 230, 236, 0.28)';
      c.fillRect(wx - 0.85 * M, -stoneH + 1.9 * M, 0.45 * M, 1.5 * M);
      c.strokeStyle = '#3a4248'; c.lineWidth = 0.4;
      c.strokeRect(wx - 1.0 * M, -stoneH + 1.75 * M, 2.0 * M, 2.3 * M);
    }
    /* grilles de ventilation (à gauche) et porte de service (à droite) */
    function vent(vx, vy, vw, vh) {
      c.fillStyle = '#2a2c2e';
      c.fillRect(vx, vy, vw, vh);
      c.fillStyle = '#1a1c1e';
      c.fillRect(vx + 0.12 * M, vy + 0.12 * M, vw - 0.24 * M, vh - 0.24 * M);
      var sl, n = 4;
      c.strokeStyle = '#6a7278'; c.lineWidth = 0.45;
      for (sl = 1; sl < n; sl++) {
        c.beginPath();
        c.moveTo(vx + 0.15 * M, vy + sl * vh / n);
        c.lineTo(vx + vw - 0.15 * M, vy + sl * vh / n);
        c.stroke();
      }
      c.strokeStyle = '#3a4044'; c.lineWidth = 0.5;
      c.strokeRect(vx, vy, vw, vh);
    }
    vent(-bw * 0.28, -2.8 * M, 1.6 * M, 1.8 * M);
    vent(-bw * 0.04, -2.8 * M, 1.6 * M, 1.8 * M);
    /* porte métallique sombre, seuil et poignée */
    var dx = bw * 0.28, dy = -3.4 * M, dw = 2.0 * M, dh = 3.4 * M;
    c.fillStyle = '#2a2c30';
    c.fillRect(dx, dy, dw, dh);
    var dg = c.createLinearGradient(dx, dy, dx + dw, dy);
    dg.addColorStop(0, '#3a4048');
    dg.addColorStop(0.45, '#2a3036');
    dg.addColorStop(1, '#1a1e22');
    c.fillStyle = dg;
    c.fillRect(dx + 0.12 * M, dy + 0.12 * M, dw - 0.24 * M, dh - 0.22 * M);
    c.strokeStyle = '#5a6268'; c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(dx + dw * 0.5, dy + 0.12 * M); c.lineTo(dx + dw * 0.5, dy + dh - 0.1 * M); c.stroke();
    c.fillStyle = '#c4c8cc';
    c.beginPath(); c.arc(dx + dw - 0.35 * M, dy + dh * 0.52, 0.14 * M, 0, 7); c.fill();
    c.fillStyle = '#6a6e74';
    c.fillRect(dx - 0.08 * M, dy + dh - 0.12 * M, dw + 0.16 * M, 0.22 * M);
    c.strokeStyle = '#2a2c28'; c.lineWidth = 0.55;
    c.strokeRect(dx, dy, dw, dh);
    c.strokeStyle = '#2a2c28'; c.lineWidth = 0.55;
    c.strokeRect(-bw / 2, -stoneH, bw, stoneH);
    /* ombre sous la corniche du bardage */
    c.fillStyle = 'rgba(24, 20, 18, 0.28)';
    c.fillRect(-bw / 2 - 0.2 * M, -stoneH, bw + 0.4 * M, 0.85 * M);
    /* étage supérieur, bardage métallique clair en léger débord */
    c.fillStyle = '#c8ced4';
    c.fillRect(-bw / 2 - 0.55 * M, -bH, bw + 1.1 * M, metalH);
    c.fillStyle = '#d8dee4';
    c.fillRect(-bw / 2 - 0.55 * M, -bH, bw + 1.1 * M, 0.7 * M);
    /* larmier / rive de toiture sobre */
    c.fillStyle = '#9aa0a6';
    c.fillRect(-bw / 2 - 0.75 * M, -bH - 0.35 * M, bw + 1.5 * M, 0.45 * M);
    c.fillStyle = 'rgba(24, 22, 20, 0.22)';
    c.fillRect(-bw / 2 - 0.75 * M, -bH, bw + 1.5 * M, 0.28 * M);
    c.strokeStyle = '#8a9096'; c.lineWidth = 0.55;
    for (i = 1; i < 5; i++) {
      var ly = -bH + i * (metalH / 5);
      c.beginPath(); c.moveTo(-bw / 2 - 0.55 * M, ly); c.lineTo(bw / 2 + 0.55 * M, ly); c.stroke();
    }
    /* panneau / grille sombre, côté droit du bardage (sommet03) */
    c.fillStyle = '#7a8288';
    c.fillRect(bw * 0.18, -bH + 0.7 * M, 3.6 * M, 1.8 * M);
    c.strokeStyle = '#5a6066'; c.lineWidth = 0.45; c.strokeRect(bw * 0.18, -bH + 0.7 * M, 3.6 * M, 1.8 * M);
    c.strokeStyle = '#6a7076'; c.lineWidth = 0.7;
    c.strokeRect(-bw / 2 - 0.55 * M, -bH, bw + 1.1 * M, metalH);
    /* petites antennes secondaires sur le toit, typiques de La Dôle */
    c.strokeStyle = '#6a6e74'; c.lineWidth = Math.max(0.7, 0.08 * M); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-bw * 0.38, -bH); c.lineTo(-bw * 0.38, -bH - 2.6 * M); c.stroke();
    c.beginPath(); c.moveTo(-bw * 0.38, -bH - 2.2 * M); c.lineTo(-bw * 0.38 + 1.1 * M, -bH - 2.2 * M); c.stroke();
    c.fillStyle = '#8a8e94';
    c.beginPath(); c.arc(-bw * 0.38, -bH - 2.65 * M, 0.22 * M, 0, 7); c.fill();
    c.strokeStyle = '#6a6e74';
    c.beginPath(); c.moveTo(bw * 0.42, -bH); c.lineTo(bw * 0.42, -bH - 1.8 * M); c.stroke();
    c.fillStyle = '#7a8086';
    c.fillRect(bw * 0.42 - 0.28 * M, -bH - 2.05 * M, 0.56 * M, 0.3 * M);
    /* radôme 19 m, opaque à facettes, légèrement encastré dans le toit (calotte basse masquée) */
    c.save();
    c.beginPath();
    c.rect(-R - 12, cy - R - 10, 2 * R + 24, (-bH + 0.3 * M) - (cy - R - 10));
    c.clip();
    c.save(); c.translate(0, cy); facetedDome(c, R);
    /* petites antennes au sommet du dôme (sommet03) */
    c.strokeStyle = '#c8ccd0'; c.lineWidth = Math.max(0.8, 0.09 * M); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.6 * M, -R); c.lineTo(-1.4 * M, -R - 2.4 * M); c.stroke();
    c.beginPath(); c.moveTo(0.5 * M, -R + 0.2 * M); c.lineTo(1.6 * M, -R - 2.1 * M); c.stroke();
    c.fillStyle = '#d8dce0';
    c.fillRect(-1.65 * M, -R - 2.55 * M, 0.55 * M, 0.4 * M);
    c.fillRect(1.35 * M, -R - 2.25 * M, 0.55 * M, 0.4 * M);
    c.restore();
    c.restore();
    c.restore();
  }

  /* Installation MétéoSuisse, typifiée d'après les vues de crête / aériennes
     Commons (La-Dôle-aerial-1.jpg, La_Dôle_Jura_1.JPG, Radar_Dome_at_La_Dôle_-_panoramio.jpg) :
     radôme plus petit sur un bâtiment bas allongé, à côté du Skyguide.
     Diamètre typifié ≈ 6,5 m (environ 1/3 du Skyguide 19 m sur ces photos) — pas de chiffre officiel retenu. */
  function meteoSuisse(c, x, y, M) {
    /* Bâtiment vu plutôt par le petit côté (typifié) pour rester lisible à gauche du randonneur. */
    var R = (6.5 / 2) * M, bw = 8.4 * M, bh = 4.6 * M, sink = 1.1 * M, cy = -(bh - sink + R);
    var i;
    c.save(); c.translate(x, y);
    c.fillStyle = '#c4c0b6';
    c.fillRect(-bw * 0.55, -1.6, bw * 1.1, 2.2);
    c.fillStyle = '#d0d4d8';
    c.fillRect(-bw / 2, -bh, bw, bh);
    c.fillStyle = '#b8bcc0';
    c.fillRect(-bw / 2, -1.4, bw, 1.4);
    c.strokeStyle = '#8a9096'; c.lineWidth = 0.5;
    for (i = 1; i < 4; i++) {
      c.beginPath(); c.moveTo(-bw / 2, -bh + i * (bh / 4)); c.lineTo(bw / 2, -bh + i * (bh / 4)); c.stroke();
    }
    c.fillStyle = '#4a5858';
    c.fillRect(-bw * 0.22, -bh + 1.3 * M, 1.8 * M, 1.6 * M);
    c.fillRect(bw * 0.08, -bh + 1.3 * M, 1.8 * M, 1.6 * M);
    c.strokeStyle = '#6a7076'; c.lineWidth = 0.7; c.strokeRect(-bw / 2, -bh, bw, bh);
    c.save(); c.translate(-bw * 0.06, cy); facetedDome(c, R); c.restore();
    /* mât fin typique des vues de crête, à gauche du radôme */
    c.strokeStyle = '#6a6e72'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-bw * 0.46, 0); c.lineTo(-bw * 0.46, -bh - 7 * M); c.stroke();
    c.beginPath(); c.moveTo(-bw * 0.46, -bh - 6.2 * M); c.lineTo(-bw * 0.46 + 1.4 * M, -bh - 6.2 * M); c.stroke();
    c.restore();
  }

  function whiteDome(c, x, y, sc) {
    /* Icône de trouvaille : petit radôme à facettes sur soubassement, pas le 19 m réel. */
    sc = sc || 1;
    var R = 13 * sc, ph = 9 * sc, pw = 15 * sc, cy = -ph - R * 0.72;
    c.save(); c.translate(x, y);
    c.fillStyle = '#b0a088';
    c.fillRect(-pw / 2, -ph, pw, ph);
    c.fillStyle = '#d0d4d8';
    c.fillRect(-pw / 2 - 0.5 * sc, -ph, pw + sc, ph * 0.34);
    c.strokeStyle = '#5a5040'; c.lineWidth = 0.5; c.strokeRect(-pw / 2, -ph, pw, ph);
    c.save(); c.translate(0, cy); facetedDome(c, R); c.restore();
    c.restore();
  }

  function findPara(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#c45a3a';
    c.beginPath(); c.moveTo(-10, -10); c.quadraticCurveTo(0, -16, 10, -10); c.lineTo(8, -8); c.quadraticCurveTo(0, -12, -8, -8); c.closePath(); c.fill();
    c.strokeStyle = '#2a2018'; c.lineWidth = 0.5; c.stroke();
    c.strokeStyle = '#3a3028'; c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(-6, -9); c.lineTo(0, 0); c.lineTo(6, -9); c.stroke();
    c.fillStyle = '#d8c8a8'; c.beginPath(); c.arc(0, 0.4, 1.3, 0, 7); c.fill();
    c.restore();
  }
  function findCrocus(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.strokeStyle = '#3a6a38'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -7); c.stroke();
    c.fillStyle = '#c45aa0';
    c.beginPath(); c.ellipse(-1.6, -9, 1.5, 3.2, -0.4, 0, 7); c.fill();
    c.beginPath(); c.ellipse(1.6, -9, 1.5, 3.2, 0.4, 0, 7); c.fill();
    c.fillStyle = '#e8a0c8';
    c.beginPath(); c.ellipse(0, -9.4, 1.4, 3.4, 0, 0, 7); c.fill();
    c.restore();
  }
  function findStele(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#b0aa9c';
    c.beginPath(); c.moveTo(-3.2, 0); c.lineTo(-2.8, -12); c.lineTo(0, -14); c.lineTo(2.8, -12); c.lineTo(3.2, 0); c.closePath(); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.5; c.stroke();
    c.fillStyle = '#6a6860'; c.fillRect(-1.6, -9, 3.2, 4.5);
    c.restore();
  }
  function findNeve(c, x, y, sc) {
    /* Plaque de neve lisible : cuvette rocheuse + neige epaisse, ombre de contact. */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#6a6860';
    c.beginPath();
    c.moveTo(-11, 3);
    c.quadraticCurveTo(-6, -2, 0, 1);
    c.quadraticCurveTo(6, -1, 11, 3);
    c.lineTo(9, 6);
    c.lineTo(-9, 6);
    c.closePath();
    c.fill();
    c.strokeStyle = '#2e2c28'; c.lineWidth = 0.6; c.stroke();
    c.fillStyle = 'rgba(120, 130, 138, 0.45)';
    c.beginPath(); c.ellipse(0, 3.2, 9.5, 1.6, 0, 0, 7); c.fill();
    c.fillStyle = '#e8eef4';
    c.beginPath(); c.moveTo(-9, 2); c.quadraticCurveTo(-3, -4.2, 1, -3.6); c.quadraticCurveTo(7, -5, 9.5, 1.4); c.quadraticCurveTo(2, 3.2, -9, 2); c.closePath(); c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(-6, 0.4); c.quadraticCurveTo(-1, -3.4, 4, -2.2); c.quadraticCurveTo(0, -0.2, -6, 0.4); c.closePath(); c.fill();
    c.fillStyle = 'rgba(170, 190, 210, 0.7)';
    c.beginPath(); c.moveTo(-8, 1.6); c.quadraticCurveTo(1, 3.4, 8.5, 1.2); c.quadraticCurveTo(2, 2.2, -8, 1.6); c.closePath(); c.fill();
    c.restore();
  }
  function findGeodes(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#c4c0b4';
    c.fillRect(-2.4, -9, 4.8, 9);
    c.fillStyle = '#9a968c';
    c.beginPath(); c.moveTo(-2.8, -9); c.lineTo(0, -11.5); c.lineTo(2.8, -9); c.closePath(); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.5; c.strokeRect(-2.4, -9, 4.8, 9);
    c.beginPath(); c.moveTo(-2.8, -9); c.lineTo(0, -11.5); c.lineTo(2.8, -9); c.stroke();
    c.fillStyle = '#4a5a88'; c.beginPath(); c.arc(0, -5.2, 1.1, 0, 7); c.fill();
    c.restore();
  }
  function findLapiaz(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#b8b4a8';
    c.beginPath(); c.moveTo(-7, 1); c.lineTo(-5, -5); c.lineTo(-1, -3); c.lineTo(2, -6); c.lineTo(6, -2); c.lineTo(7, 2); c.closePath(); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.5; c.stroke();
    c.strokeStyle = 'rgba(50, 46, 40, 0.55)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-3, -4); c.lineTo(-2, 1); c.moveTo(1, -5); c.lineTo(2.2, 1.2); c.stroke();
    c.restore();
  }
  function findSpruce(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#4a3a28'; c.fillRect(-0.7, -4, 1.4, 4);
    c.fillStyle = '#2a4a28';
    c.beginPath(); c.moveTo(0, -16); c.lineTo(5.2, -8); c.lineTo(-5.2, -8); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, -12); c.lineTo(6.2, -3.5); c.lineTo(-6.2, -3.5); c.closePath(); c.fill();
    c.restore();
  }
  function findMeteo(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#9aa0a4'; c.fillRect(-3.2, -6, 6.4, 6);
    c.fillStyle = '#e8ecee';
    c.beginPath(); c.arc(0, -6, 4.4, Math.PI, 0); c.fill();
    c.strokeStyle = '#3a3c40'; c.lineWidth = 0.5;
    c.strokeRect(-3.2, -6, 6.4, 6);
    c.beginPath(); c.arc(0, -6, 4.4, Math.PI, 0); c.stroke();
    c.restore();
  }
  function findMur(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    dryStoneWall(c, -10, 10, 0);
    c.restore();
  }
  function findChamois(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#c4a878';
    c.beginPath(); c.ellipse(0, -3.2, 4.2, 2.4, 0, 0, 7); c.fill();
    c.fillRect(-1.2, -2.2, 2.2, 3.4);
    c.beginPath(); c.ellipse(3.2, -4.4, 1.8, 1.5, 0.2, 0, 7); c.fill();
    c.strokeStyle = '#3a3020'; c.lineWidth = 0.55;
    c.beginPath(); c.moveTo(3.6, -5.4); c.lineTo(4.2, -7.6); c.moveTo(2.6, -5.2); c.lineTo(2.2, -7.0); c.stroke();
    c.fillStyle = '#5a4a38';
    c.fillRect(-3.4, -1.2, 1.1, 2.8); c.fillRect(1.6, -1.0, 1.1, 2.6);
    c.restore();
  }
  function findIbexIcon(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#b0aaa0';
    c.beginPath(); c.ellipse(0, -3.4, 4.4, 2.5, 0, 0, 7); c.fill();
    c.fillRect(-1.1, -2.4, 2.2, 3.6);
    c.beginPath(); c.ellipse(3.0, -4.6, 1.7, 1.4, 0.15, 0, 7); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(2.4, -5.4); c.quadraticCurveTo(1.2, -8.8, 3.2, -10.2); c.stroke();
    c.beginPath(); c.moveTo(3.6, -5.4); c.quadraticCurveTo(5.0, -8.6, 4.4, -10.0); c.stroke();
    c.fillStyle = '#5a584e';
    c.fillRect(-3.4, -1.2, 1.1, 2.8); c.fillRect(1.6, -1.0, 1.1, 2.6);
    c.restore();
  }
  function findTetraIcon(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#4a3a30';
    c.beginPath(); c.ellipse(0, -2.6, 4.6, 2.3, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(4.0, -3.4, 1.8, 1.3, 0.2, 0, 7); c.fill();
    c.fillStyle = '#c45a3a';
    c.beginPath(); c.arc(-0.4, -3.4, 0.7, 0, 7); c.fill();
    c.strokeStyle = '#2a2018'; c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(-3, -1); c.lineTo(-3.4, 1.2); c.moveTo(-1.2, -1); c.lineTo(-1.0, 1.2); c.stroke();
    c.restore();
  }

  function pylon10(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.strokeStyle = '#5a5e62'; c.lineWidth = 0.85; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-3.2, 0); c.lineTo(-1.4, -28); c.lineTo(1.4, -28); c.lineTo(3.2, 0); c.stroke();
    var i, yy;
    for (i = 0; i < 5; i++) {
      yy = -5 - i * 5;
      c.beginPath(); c.moveTo(-3.0 + i * 0.32, yy); c.lineTo(3.0 - i * 0.32, yy); c.stroke();
      c.beginPath(); c.moveTo(-2.6 + i * 0.3, yy); c.lineTo(2.2 - i * 0.28, yy - 5); c.stroke();
    }
    c.beginPath(); c.moveTo(-2.2, -28); c.lineTo(0, -34); c.lineTo(2.2, -28); c.stroke();
    c.restore();
  }
  function ironCross(c, x, y, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#3a3a38';
    c.fillRect(-2.2, -36, 4.4, 36);
    c.fillRect(-11, -28, 22, 4.2);
    c.fillStyle = '#6a6a64';
    c.fillRect(-1.4, -36, 1.5, 36);
    c.fillRect(-11, -28, 22, 1.1);
    c.strokeStyle = '#1a1a18'; c.lineWidth = 0.7;
    c.strokeRect(-2.2, -36, 4.4, 36);
    c.strokeRect(-11, -28, 22, 4.2);
    /* embase maçonnée typifiée */
    c.fillStyle = '#8a8680';
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(-4, -6); c.lineTo(4, -6); c.lineTo(6, 0); c.closePath(); c.fill();
    c.strokeStyle = '#2a2824'; c.stroke();
    c.restore();
  }

  function typifiedLake(c, tx, hy, rx, ry) {
    /* Conservé mais plus utilisé en sommet : un lac vu d'en haut
       passe par valleyLake (bande de vallée), pas une ellipse sur une cime. */
    c.fillStyle = 'rgba(50, 120, 170, 0.82)';
    c.beginPath(); c.ellipse(tx, hy, rx, ry, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(200, 220, 236, 0.32)';
    c.beginPath(); c.ellipse(tx - rx * 0.22, hy - ry * 0.28, rx * 0.42, ry * 0.32, 0, 0, 7); c.fill();
  }
  function dryStoneWall(c, x0, x1, y) {
    /* Muret typifié en bord de crête du Soliat. Hauteur réelle non documentée. */
    var x, h;
    c.fillStyle = '#6a665c';
    c.fillRect(x0, y - 1.1, x1 - x0, 1.4);
    for (x = x0; x < x1 - 2; x += 4.1) {
      h = 3.8 + ((Math.abs(x * 13) | 0) % 5) * 0.3;
      c.fillStyle = ((x | 0) % 8 < 4) ? '#b0aaa0' : '#8a847c';
      c.fillRect(x + 0.25, y - h, 3.5, h);
      c.strokeStyle = 'rgba(40, 36, 30, 0.4)'; c.lineWidth = 0.4;
      c.strokeRect(x + 0.25, y - h, 3.5, h);
    }
  }
  function woodenCross(c, x, y, sc) {
    /* Croix de bois typifiée. Hauteur réelle non documentée : pas d'échelle métrique revendiquée. */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#5a4030';
    c.fillRect(-1.4, -28, 2.8, 28);
    c.fillRect(-8.2, -22, 16.4, 2.5);
    c.fillStyle = '#8a6a44';
    c.fillRect(-0.9, -28, 1.1, 28);
    c.strokeStyle = '#2a1c10'; c.lineWidth = 0.5;
    c.strokeRect(-1.4, -28, 2.8, 28);
    c.strokeRect(-8.2, -22, 16.4, 2.5);
    c.restore();
  }
  function borderStone(c, x, y, sc) {
    /* Borne de crête typifiée (inspiration : borne 72 de la boucle PNR). Pas de fac-similé d'inscription. */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#c8c4b8';
    c.beginPath();
    c.moveTo(-3.6, 0); c.lineTo(-3.0, -13); c.lineTo(0, -15.4); c.lineTo(3.0, -13); c.lineTo(3.6, 0);
    c.closePath(); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.55; c.stroke();
    c.fillStyle = '#e8e4d8';
    c.beginPath(); c.moveTo(-1.6, -12.2); c.lineTo(0, -13.8); c.lineTo(1.6, -12.2); c.lineTo(1.4, -4); c.lineTo(-1.4, -4); c.closePath(); c.fill();
    c.restore();
  }
  function juraChalet(c, x, y, sc) {
    /* Chalet d'estive typifié (pierre + bois + toiture douce). */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = 'rgba(40, 32, 20, 0.28)';
    c.beginPath(); c.ellipse(0, 1, 16, 2.2, 0, 0, 7); c.fill();
    c.fillStyle = '#8a8680';
    c.fillRect(-11, -8, 22, 8);
    c.fillStyle = '#6a4a30';
    c.fillRect(-10.2, -16, 20.4, 8.2);
    c.fillStyle = '#4a3020';
    c.beginPath(); c.moveTo(-12.4, -15.4); c.lineTo(0, -24); c.lineTo(12.4, -15.4); c.closePath(); c.fill();
    c.fillStyle = '#2a2018';
    c.fillRect(-2.2, -8, 3.2, 7.2);
    c.fillStyle = '#c8b070';
    c.fillRect(-7.4, -13.4, 2.8, 2.2);
    c.fillRect(4.2, -13.4, 2.8, 2.2);
    c.strokeStyle = '#2a2418'; c.lineWidth = 0.45;
    c.strokeRect(-11, -8, 22, 8);
    c.restore();
  }
  function crocusTuft(c, x, y, sc, seed) {
    /* Crocus typifiés, décor uniquement — on ne les ramasse pas. */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    var cols = ['#7a5aaa', '#c8b8e0', '#f2eef8'], i, a;
    for (i = 0; i < 3; i++) {
      a = -0.5 + i * 0.5 + ((seed || 0) % 5) * 0.04;
      c.save(); c.rotate(a * 0.18);
      c.fillStyle = '#3a6a38';
      c.fillRect(-0.35, -2.2, 0.7, 2.4);
      c.fillStyle = cols[(i + (seed || 0)) % 3];
      c.beginPath(); c.moveTo(0, -7.2); c.quadraticCurveTo(-1.8, -4.6, 0, -2.6); c.quadraticCurveTo(1.8, -4.6, 0, -7.2); c.fill();
      c.restore();
    }
    c.restore();
  }

  function typJuraHouse(c, x, y, w, h, roof) {
    /* Maison jurassienne typifiee : murs creme au sol (y), toit a pans. */
    c.fillStyle = '#d4cec2';
    c.fillRect(x, y - h, w, h);
    c.fillStyle = '#c0baae';
    c.fillRect(x + w * 0.62, y - h, w * 0.38, h);
    c.fillStyle = 'rgba(70, 50, 36, 0.42)';
    c.fillRect(x + w * 0.38, y - h * 0.48, w * 0.2, h * 0.48);
    c.fillStyle = roof || '#8a4030';
    c.beginPath();
    c.moveTo(x - 1.2, y - h + 0.4);
    c.lineTo(x + w * 0.5, y - h - h * 0.58);
    c.lineTo(x + w + 1.2, y - h + 0.4);
    c.closePath();
    c.fill();
  }

  function clocherComtois(c, x, y, sc) {
    /* Tour carree, dome a imperiale et lanternon typifies. Pas de
       motif de tuile ni d'inscription inventes. Pied au sol en y. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#d8d2c6';
    c.fillRect(-10, -16, 22, 16);
    c.fillStyle = '#8a4030';
    c.beginPath();
    c.moveTo(-12, -15.4);
    c.lineTo(1, -24);
    c.lineTo(14, -15.4);
    c.closePath();
    c.fill();
    c.fillStyle = '#d0cac0';
    c.fillRect(-5, -34, 10, 20);
    c.fillStyle = '#b8b2a8';
    c.fillRect(2.2, -34, 2.8, 20);
    c.fillStyle = '#ece8e0';
    c.beginPath();
    c.arc(0, -24, 1.6, 0, 7);
    c.fill();
    c.fillStyle = '#6a5a4a';
    c.beginPath();
    c.moveTo(-6.2, -34);
    c.quadraticCurveTo(-7.2, -39, 0, -44);
    c.quadraticCurveTo(7.2, -39, 6.2, -34);
    c.closePath();
    c.fill();
    c.fillStyle = '#8a7a68';
    c.fillRect(-1.3, -48, 2.6, 5);
    c.fillStyle = '#5a4a3c';
    c.beginPath();
    c.moveTo(-2.2, -48);
    c.lineTo(0, -54);
    c.lineTo(2.2, -48);
    c.closePath();
    c.fill();
    c.strokeStyle = '#4a3c30';
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(0, -54);
    c.lineTo(0, -58);
    c.stroke();
    c.restore();
  }

  function typStoneArch(c, x, y, sc) {
    /* Petit pont en pierre typifie (arche unique), pose au-dessus
       de la riviere. D'apres le pont de Rochejean sur le Doubs. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#c8c2b6';
    c.beginPath();
    c.moveTo(-16, 3);
    c.lineTo(-16, -9);
    c.lineTo(16, -9);
    c.lineTo(16, 3);
    c.lineTo(9, 3);
    c.arc(0, 3, 9, 0, 3.1416, false);
    c.lineTo(-16, 3);
    c.closePath();
    c.fill();
    c.fillStyle = '#b0aaa0';
    c.fillRect(-17, -11, 34, 2.2);
    c.restore();
  }

  function meanderRiver(c, x0, y, x1, yUnused, w) {
    /* Riviere vue du val a hauteur d'oeil : quelques lames courtes et
       plates au fond, reflets discontinus, masquees par berges et
       arbres. Pas un arc, pas une barre continue qui coupe le cadre. */
    var i, a, b, mid, hw, segs, dy;
    hw = 0.58;
    c.save();
    segs = [[0.00, 0.27], [0.40, 0.72]];
    for (i = 0; i < segs.length; i++) {
      a = x0 + (x1 - x0) * segs[i][0];
      b = x0 + (x1 - x0) * segs[i][1];
      mid = (a + b) * 0.5;
      dy = (i - 0.5) * 0.2;
      c.fillStyle = '#5a6e40';
      c.beginPath();
      c.ellipse(mid, y + dy + 0.25, (b - a) * 0.5 + 1.6, hw + 0.7, 0, 0, 7);
      c.fill();
      c.fillStyle = '#4a7a9a';
      c.beginPath();
      c.ellipse(mid, y + dy, (b - a) * 0.5, hw, 0, 0, 7);
      c.fill();
      c.strokeStyle = 'rgba(210, 230, 238, 0.55)';
      c.lineWidth = 0.7;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(a + (b - a) * 0.22, y + dy - 0.25);
      c.lineTo(a + (b - a) * 0.68, y + dy - 0.4);
      c.stroke();
    }
    c.restore();
  }

  function rochejeanVillage(c, x, y, sc) {
    /* Rochejean typifie : maisons aux murs au sol, eglise au clocher
       comtois. D'apres Le_Doubs_a_Rochejean (img_49985). */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#5e7844';
    c.beginPath();
    c.ellipse(4, 1.6, 46, 2.0, 0, 0, 7);
    c.fill();
    typJuraHouse(c, -38, 1.2, 12, 7, '#8a4030');
    typJuraHouse(c, -24, 2, 10, 6, '#6a3a28');
    clocherComtois(c, 2, 2.2, 0.95);
    typJuraHouse(c, 14, 1.8, 11, 6.5, '#a04830');
    typJuraHouse(c, 27, 2.4, 9, 5.5, '#7a3c28');
    typFir(c, -44, 1.2, 0.32, '#1e3620');
    typFir(c, 40, 2.2, 0.28, '#243c24');
    c.restore();
  }

  function montDorStartMassif(c, x, y, sc) {
    /* Depuis Rochejean : long dos herbeux et boise du Mont d'Or
       s'elevant au-dessus du village, typifie d'apres img_49985. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#5a7248';
    c.beginPath();
    c.moveTo(-240, 50);
    c.quadraticCurveTo(-140, 8, -40, -8);
    c.quadraticCurveTo(70, -28, 190, -6);
    c.quadraticCurveTo(280, 10, 350, 40);
    c.lineTo(350, 80);
    c.lineTo(-240, 80);
    c.closePath();
    c.fill();
    c.fillStyle = '#7a9a58';
    c.beginPath();
    c.moveTo(-70, 16);
    c.quadraticCurveTo(50, -24, 170, -4);
    c.quadraticCurveTo(230, 10, 250, 26);
    c.lineTo(-90, 30);
    c.closePath();
    c.fill();
    typFirBand(c, -200, 50, function (xx) { return 30 + 4 * Math.sin(xx * 0.05); }, 21, { step: 11, s0: 0.22, col: '#1a3220' });
    typFirBand(c, 40, 300, function (xx) { return 26 + 5 * Math.sin(xx * 0.06); }, 27, { step: 12, s0: 0.26, col: '#1e3620' });
    typFirBand(c, -90, 210, function (xx) { return 16 + 3 * Math.sin(xx * 0.08); }, 33, { step: 14, s0: 0.16, col: '#243c24' });
    c.restore();
  }

  function noiraigueVillage(c, x, y, sc) {
    /* Noiraigue typifie : quelques maisons, gare (volume, quai, rails),
       murs au sol. D'apres Noiraigue_im_Sommer_2022. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    c.fillStyle = '#5e7844';
    c.beginPath();
    c.ellipse(2, 1.8, 48, 2.0, 0, 0, 7);
    c.fill();
    /* rails courts, seulement sous la gare, pas une dalle grise */
    c.strokeStyle = '#5a5854';
    c.lineWidth = 0.65;
    c.beginPath();
    c.moveTo(-16, 3.2);
    c.lineTo(14, 3.2);
    c.stroke();
    c.beginPath();
    c.moveTo(-16, 4.8);
    c.lineTo(14, 4.8);
    c.stroke();
    /* gare : volume de maison, porte, petit quai */
    c.fillStyle = '#d8d0c4';
    c.fillRect(-8, -9, 14, 9);
    c.fillStyle = '#c8c0b4';
    c.fillRect(1, -9, 5, 9);
    c.fillStyle = '#5a3a28';
    c.beginPath();
    c.moveTo(-10, -8.6);
    c.lineTo(-1, -15);
    c.lineTo(8, -8.6);
    c.closePath();
    c.fill();
    c.fillStyle = '#4a3828';
    c.fillRect(-3, -5.5, 3.2, 5.5);
    c.fillStyle = '#b0aaa0';
    c.fillRect(-11, 0, 18, 1.6);
    typJuraHouse(c, -36, 1.2, 11, 6.5, '#8a4030');
    typJuraHouse(c, -23, 1.7, 9, 5.5, '#a04830');
    typJuraHouse(c, 10, 1.4, 10, 6, '#7a3c28');
    typFir(c, 24, 1.6, 0.28, '#1e3620');
    typFir(c, -44, 1.2, 0.30, '#243c24');
    c.restore();
  }

  function creuxRimHint(c, x, y, sc) {
    /* Petit rebord calcaire lointain : face verticale grele, levre
       herbeuse, haut et loin. Pas une route ni un arc balaie sur la
       colline, pas un second cirque. */
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    /* petite crete lointaine, pour que la face ne flotte pas dans le ciel */
    c.fillStyle = '#4e6244';
    c.beginPath();
    c.moveTo(-16, 6);
    c.quadraticCurveTo(1, 1.5, 18, 6);
    c.lineTo(18, 11);
    c.lineTo(-16, 11);
    c.closePath();
    c.fill();
    typFir(c, -10, 5.5, 0.16, '#1a3220');
    typFir(c, 11, 5.8, 0.14, '#1e3620');
    c.fillStyle = '#8a8680';
    c.beginPath();
    c.moveTo(-7, 0);
    c.lineTo(-6.5, 7);
    c.quadraticCurveTo(0, 8.2, 8, 6.4);
    c.lineTo(8.6, 0.8);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(36, 32, 28, 0.34)';
    c.beginPath();
    c.moveTo(-6.8, 0.5);
    c.lineTo(-6.4, 6.8);
    c.lineTo(-1.5, 7.2);
    c.lineTo(-2, 0.6);
    c.closePath();
    c.fill();
    /* levre herbeuse, mince, sur le rebord */
    c.fillStyle = '#5a7244';
    c.beginPath();
    c.moveTo(-8, 0.2);
    c.quadraticCurveTo(1, -1.4, 9.6, 0.6);
    c.lineTo(8.4, 1.7);
    c.quadraticCurveTo(1, 0.4, -7, 1.3);
    c.closePath();
    c.fill();
    typFir(c, -3, -0.2, 0.13, '#1a3220');
    typFir(c, 4.2, 0, 0.11, '#1e3620');
    c.restore();
  }

  function recededCliff(c, tx, hy) {
    /* Escarpement vu de loin : silhouette qui fuit, face verticale
       ombree a joints et vires courtes, cap herbeux modeste — meme
       langage que la paroi sommitale, plus petit et plus loin. Pas
       une plaque pale vue du dessus. */
    recede(c, tx, hy, 0.58, function (c2) {
      var i, segs;
      c2.save();
      c2.translate(tx, hy);
      /* versant / pied boise, opaque */
      c2.fillStyle = '#3a4e32';
      c2.beginPath();
      c2.moveTo(-100, 24);
      c2.quadraticCurveTo(20, 12, 160, 28);
      c2.lineTo(170, 44); c2.lineTo(-110, 44); c2.closePath();
      c2.fill();
      screeFan(c2, -16, 20, 12, 10);
      screeFan(c2, 44, 22, 14, 10);
      screeFan(c2, 104, 18, 12, 9);
      function facePath() {
        c2.beginPath();
        /* plus haute a gauche (proche), fuit et s'abaisse a droite */
        c2.moveTo(-52, 6);
        c2.lineTo(-48, -30);
        c2.quadraticCurveTo(-8, -38, 40, -26);
        c2.quadraticCurveTo(92, -16, 132, -2);
        c2.quadraticCurveTo(152, 6, 162, 14);
        c2.quadraticCurveTo(144, 18, 100, 22);
        c2.quadraticCurveTo(20, 26, -46, 20);
        c2.quadraticCurveTo(-54, 14, -52, 6);
        c2.closePath();
      }
      limestoneTex(c2, facePath, {
        y0: -40, y1: 26, x0: -56, x1: 164,
        light: -1, seed: 73, base: '#6a6660',
        cols: ['#6a6660', '#5a564e', '#76726a', '#646058', '#706c64'],
        loose: true, karst: true, noStroke: true, nJoint: 6
      });
      c2.save();
      facePath();
      c2.clip();
      c2.fillStyle = A.grad(c2, -52, 0, 155, 0, [
        0, 'rgba(28, 24, 20, 0.32)',
        0.45, 'rgba(36, 32, 26, 0.12)',
        1, 'rgba(50, 46, 40, 0.03)'
      ]);
      c2.fillRect(-60, -44, 230, 74);
      /* strates beiges un peu plus lisibles, pour eviter l'aspect rectangle plat */
      c2.strokeStyle = 'rgba(210, 198, 176, 0.38)';
      segs = [
        [-44, -18, 8, -20, 58, -12],
        [-40, -8, 10, -10, 52, -4],
        [-36, -1, 16, -2, 64, 2],
        [-28, 6, 24, 4, 76, 8],
        [8, -22, 60, -18, 108, -8],
        [20, -16, 72, -12, 114, -2],
        [28, -6, 80, -4, 124, 4],
        [44, 4, 94, 2, 136, 10]
      ];
      for (i = 0; i < segs.length; i++) {
        c2.lineWidth = (i % 2) ? 1.05 : 0.7;
        c2.globalAlpha = (i % 2) ? 0.55 : 0.38;
        c2.beginPath();
        c2.moveTo(segs[i][0], segs[i][1]);
        c2.quadraticCurveTo(segs[i][2], segs[i][3], segs[i][4], segs[i][5]);
        c2.stroke();
      }
      c2.globalAlpha = 1;
      c2.strokeStyle = 'rgba(36, 32, 28, 0.28)';
      c2.lineWidth = 0.7;
      for (i = 0; i < 5; i++) {
        var jx = -36 + i * 28 + ((i * 5) % 7) - 3;
        c2.beginPath();
        c2.moveTo(jx, -26 + (i % 3));
        c2.lineTo(jx + 4, 16);
        c2.stroke();
      }
      c2.restore();
      /* cap herbeux modeste, sapins en crete */
      c2.fillStyle = '#4a6238';
      c2.beginPath();
      c2.moveTo(-50, -28);
      c2.quadraticCurveTo(20, -38, 90, -18);
      c2.quadraticCurveTo(132, -6, 158, 10);
      c2.lineTo(150, 13);
      c2.quadraticCurveTo(126, -2, 86, -14);
      c2.quadraticCurveTo(20, -32, -46, -24);
      c2.closePath();
      c2.fill();
      typFir(c2, -28, -30, 0.36, '#1e2e22');
      typFir(c2, 4, -34, 0.42, '#1a3220');
      typFir(c2, 38, -28, 0.34, '#1e2e22');
      typFir(c2, 74, -20, 0.30, '#1a3220');
      typFir(c2, 110, -10, 0.26, '#1e2e22');
      typFir(c2, 148, 12, 0.22, '#1a3220');
      typFir(c2, -10, 26, 0.18, '#1a3220');
      typFir(c2, 50, 28, 0.16, '#1e2e22');
      typFir(c2, 110, 24, 0.16, '#1a3220');
      c2.restore();
    });
  }


  function recededCirque(c, tx, hy) {
    /* Cirque vu de loin : fer a cheval dans le plateau, rebord oppose
       presque a la meme hauteur, foret dans le bol — pas un puits sombre. */
    recede(c, tx, hy, 0.52, function (c2) {
      c2.save(); c2.translate(tx, hy);
      /* plateau / dome du Soliat */
      c2.fillStyle = '#5a7a44';
      c2.beginPath();
      c2.moveTo(-160, 8);
      c2.quadraticCurveTo(-40, -10, 40, -4);
      c2.quadraticCurveTo(120, 2, 170, 12);
      c2.lineTo(170, 20); c2.lineTo(-160, 20); c2.closePath(); c2.fill();
      /* bol forestier, sous le rebord */
      c2.fillStyle = '#243c24';
      c2.beginPath();
      c2.moveTo(-80, 4);
      c2.quadraticCurveTo(-60, 32, 8, 38);
      c2.quadraticCurveTo(70, 32, 96, 8);
      c2.quadraticCurveTo(10, 12, -80, 4);
      c2.closePath(); c2.fill();
      /* paroi (couronne) : haut proche du plateau */
      c2.fillStyle = '#a8a298';
      c2.beginPath();
      c2.moveTo(-90, 2);
      c2.quadraticCurveTo(-76, 24, -16, 34);
      c2.quadraticCurveTo(44, 32, 78, 16);
      c2.quadraticCurveTo(96, 8, 118, 2);
      c2.lineTo(104, 2);
      c2.quadraticCurveTo(86, 14, 50, 22);
      c2.quadraticCurveTo(4, 26, -64, 18);
      c2.quadraticCurveTo(-82, 10, -88, 2);
      c2.closePath(); c2.fill();
      typFir(c2, -36, 1, 0.32, '#1e3620');
      typFir(c2, 10, 0, 0.38, '#243c24');
      typFir(c2, 44, 2, 0.30, '#1e3620');
      c2.restore();
    });
  }

  function summitSpruce(c, x, y, h) {
    /* Sapin de montagne conique en étages, comme validé en v0.18.1 — pas des houppiers en boule. */
    h = h || 48;
    var n = h > 40 ? 6 : 5, w = h * 0.36, i, t0, yb, yt, ww;
    c.fillStyle = '#4a3220';
    c.fillRect(x - h * 0.028, y - h * 0.16, h * 0.056, h * 0.18);
    for (i = 0; i < n; i++) {
      t0 = i / n;
      yb = y - h * 0.07 - h * 0.86 * t0 * 0.95;
      yt = yb - h * 0.86 / n * 1.95;
      ww = w * (1 - t0 * 0.78);
      c.fillStyle = (i % 2) ? '#1c3a24' : '#142c1c';
      c.beginPath(); c.moveTo(x, yt); c.lineTo(x + ww, yb); c.lineTo(x - ww, yb); c.closePath(); c.fill();
      c.fillStyle = (i % 2) ? '#2c5a36' : '#21482c';
      c.beginPath(); c.moveTo(x, yt); c.lineTo(x + ww, yb); c.lineTo(x + ww * 0.08, yb); c.closePath(); c.fill();
    }
  }
  function hookPine(c, x, y, sc, t, seed) {
    /* Pin de montagne (pin a crochets) : silhouette conique un peu
       irreguliere, vert sombre, tronc court et robuste, parfois tordu
       par le vent. Pas de vrilles (le nom vient des ecailles du cone). */
    sc = sc || 1;
    seed = seed || 0;
    var lean = (seed % 2 ? -1 : 1) * (0.16 + (seed % 5) * 0.04);
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    /* tronc court, epais, legerement tordu — le houppier commence bas */
    c.fillStyle = '#4a3220';
    c.beginPath();
    c.moveTo(-2.8, 1.7);
    c.quadraticCurveTo(-2.0 + lean * 1.6, -0.6, -1.5 + lean * 2.4, -4.2);
    c.lineTo(1.6 + lean * 2.4, -4.2);
    c.quadraticCurveTo(2.1 + lean * 0.3, -0.6, 2.9, 1.7);
    c.closePath();
    c.fill();
    c.fillStyle = '#6a4a2c';
    c.beginPath();
    c.moveTo(0.1, 1.6);
    c.quadraticCurveTo(1.0 + lean * 1.0, -0.6, 0.6 + lean * 2.4, -4.2);
    c.lineTo(1.6 + lean * 2.4, -4.2);
    c.quadraticCurveTo(2.1 + lean * 0.3, -0.6, 2.9, 1.7);
    c.closePath();
    c.fill();
    /* touffes empilees en cone : large en bas, pointe douce en haut */
    function tuft(cx, cy, hw, hh, col) {
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(cx, cy - hh);
      c.quadraticCurveTo(cx + hw * 0.58, cy - hh * 0.72, cx + hw * 0.98, cy - hh * 0.08);
      c.quadraticCurveTo(cx + hw * 1.06, cy + hh * 0.38, cx + hw * 0.40, cy + hh * 0.70);
      c.quadraticCurveTo(cx, cy + hh * 0.82, cx - hw * 0.38, cy + hh * 0.68);
      c.quadraticCurveTo(cx - hw * 1.04, cy + hh * 0.30, cx - hw * 0.92, cy - hh * 0.12);
      c.quadraticCurveTo(cx - hw * 0.52, cy - hh * 0.70, cx, cy - hh);
      c.closePath();
      c.fill();
    }
    tuft(lean * 1.4, -6.6, 8.8, 5.4, '#1a3422');
    tuft(lean * 1.8 - 2.6, -9.4, 5.6, 4.6, '#1e3e28');
    tuft(lean * 1.8 + 2.8, -8.8, 5.2, 4.2, '#224830');
    tuft(lean * 2.2, -12.4, 5.8, 5.0, '#224830');
    tuft(lean * 2.4 - 1.6, -14.2, 3.6, 3.6, '#1e4228');
    tuft(lean * 2.6, -16.6, 3.4, 3.8, '#275230');
    tuft(lean * 2.2 + 1.4, -10.8, 2.6, 2.6, '#2e5a38');
    c.restore();
  }
  function lapiaz(c, xa, xb, E, H, seed) {
    seed = seed || 400;
    for (var x = Math.floor(xa / 18) * 18; x < xb + 18; x += 18) {
      var a = H.af ? H.af(x) : 0.5, h = E.hash(x, seed);
      if (h > 0.55 + 0.2 * (1 - a)) { continue; }
      var gy = E.G[x | 0]; if (!isFinite(gy)) { continue; }
      var w = 3 + 4 * E.hash(x, seed + 1), d = 2 + 3 * E.hash(x, seed + 2);
      c.fillStyle = 'rgba(40, 36, 32, 0.55)';
      c.beginPath(); c.moveTo(x - 0.6, gy - 0.4); c.lineTo(x + 0.8, gy + d); c.lineTo(x + w, gy - 0.2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(200, 200, 196, 0.35)'; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(x - 1, gy - 0.6); c.lineTo(x + w * 0.6, gy - 0.8); c.stroke();
    }
  }

  var PAL = {
    q: { base: '#6a7a50', mid: '#3e4c32', lip: '#8fb05a', hi: '#d4e8a0', dark: '#24301c' },
    f: { base: '#5c6e44', mid: '#354428', lip: '#86a852', hi: '#cce090', dark: '#222c1a' },
    c: { base: '#8a8878', mid: '#535046', lip: '#c0c0a0', hi: '#ececd0', dark: '#2e2c26' },
    k: { base: '#9a9688', mid: '#5a564c', lip: '#d0ccc0', hi: '#f4f0e4', dark: '#323028' }
  };

  function zeroFloor() { return 0; }

  function valleyShoulders(c, cx, yf, yn, left, right) {
    /* Épaules de vallée : le lac est encadré par de la terre, pas posé sur une pelouse. */
    c.fillStyle = '#6a8a50';
    c.beginPath();
    c.moveTo(cx - left - 80, yn + 8);
    c.quadraticCurveTo(cx - left * 0.55, yf - 8, cx - left * 0.15, yf + 2);
    c.lineTo(cx - left * 0.2, yn + 10);
    c.closePath();
    c.fill();
    c.fillStyle = '#5a7a42';
    c.beginPath();
    c.moveTo(cx + right + 80, yn + 8);
    c.quadraticCurveTo(cx + right * 0.55, yf - 10, cx + right * 0.15, yf + 2);
    c.lineTo(cx + right * 0.2, yn + 10);
    c.closePath();
    c.fill();
  }

  function vistaLayers(opt, E) {
    /* Profils distincts par sommet. Plancher lointain à 0 sur les vues de
       lac : plus de bande pâle qui lit comme un second plan d'eau. */
    var id = opt.id, far, mid, near, farCol0, farCol1;
    var floorMid = nzf(E, 60, 3, 3), floorNear = nzf(E, 45, 3, 4);
    if (id === 'poupet') {
      far = peaks([[90, 18, 80, 90, 1.6], [300, 16, 100, 110, 1.5], [620, 18, 90, 90, 1.55], [900, 15, 80, 80, 1.5]], nzf(E, 80, 3, 8));
      mid = peaks([[80, 36, 140, 140, 1.7], [250, 40, 150, 150, 1.65], [450, 38, 150, 150, 1.7], [650, 42, 150, 150, 1.65], [850, 36, 150, 150, 1.7]], nzf(E, 55, 3, 10));
      near = peaks([[80, 22, 120, 130, 1.8], [340, 20, 130, 120, 1.75], [680, 24, 130, 140, 1.8], [940, 18, 120, 110, 1.7]], floorNear);
      farCol0 = '#7a9a68'; farCol1 = '#a8b888';
    } else if (id === 'dor') {
      far = peaks([[40, 16, 60, 60, 1.5], [1180, 16, 60, 60, 1.5]], zeroFloor);
      mid = peaks([[-80, 36, 80, 70, 1.7], [1700, 34, 70, 80, 1.7]], zeroFloor);
      near = peaks([[-40, 16, 70, 60, 1.8], [1750, 18, 60, 70, 1.75]], floorNear);
      farCol0 = '#8aa0b0'; farCol1 = '#c4d0d8';
    } else if (id === 'van') {
      far = peaks([[40, 14, 60, 60, 1.5], [1180, 14, 60, 60, 1.5]], zeroFloor);
      mid = peaks([[-80, 32, 80, 70, 1.7], [1700, 32, 70, 80, 1.7]], zeroFloor);
      near = peaks([[-40, 16, 70, 60, 1.8], [1750, 16, 60, 70, 1.75]], floorNear);
      farCol0 = '#8a9aa0'; farCol1 = '#c0c8cc';
    } else if (id === 'colombier') {
      far = peaks([[40, 18, 60, 60, 1.5], [1180, 18, 60, 60, 1.5]], zeroFloor);
      mid = peaks([[-80, 38, 80, 70, 1.7], [1700, 36, 70, 80, 1.7]], zeroFloor);
      near = peaks([[-40, 16, 70, 60, 1.8], [1750, 18, 60, 70, 1.75]], floorNear);
      farCol0 = '#8aa0b4'; farCol1 = '#c0d0dc';
    } else {
      far = peaks([[30, 18, 60, 60, 1.5], [1200, 20, 60, 60, 1.5]], zeroFloor);
      mid = peaks([[-80, 34, 80, 70, 1.65], [1700, 34, 70, 80, 1.65]], zeroFloor);
      near = peaks([[-40, 14, 70, 60, 1.75], [1750, 16, 60, 70, 1.7]], floorNear);
      farCol0 = '#8aa0b0'; farCol1 = '#c4d0d8';
    }
    var firD = opt.firDens == null ? 0.5 : opt.firDens;
    var farHaze = id === 'poupet' ? 'rgba(210, 220, 190, .16)' : (id === 'colomby' ? 'rgba(255, 214, 150, .14)' : (id === 'reculet' ? 'rgba(180, 188, 196, .12)' : 'rgba(220, 230, 236, .10)'));
    var midC0 = '#6a9850', midC1 = '#3e6840', nearC0 = '#5a8a44', nearC1 = '#3a6634';
    var midEdge = 'rgba(255, 244, 180, .40)', nearEdge = 'rgba(255, 244, 180, .32)';
    var midTree = Math.min(0.55, firD + 0.12), nearTree = Math.min(0.32, firD * 0.7);
    if (id === 'colomby') {
      midC0 = '#7aa44c'; midC1 = '#4a7434'; midEdge = 'rgba(255, 220, 140, .48)';
      nearC0 = '#5a8a3c'; nearC1 = '#3a662c'; nearEdge = 'rgba(255, 220, 140, .36)';
      midTree = Math.min(0.78, firD + 0.22); nearTree = Math.min(0.50, firD * 0.85);
    } else if (id === 'reculet') {
      midC0 = '#8a8a74'; midC1 = '#5a5a48'; midEdge = 'rgba(210, 210, 200, .30)';
      nearC0 = '#7a7a64'; nearC1 = '#4a4a3a'; nearEdge = 'rgba(200, 200, 190, .26)';
      midTree = Math.min(0.28, firD + 0.06); nearTree = Math.min(0.16, firD * 0.5);
    } else if (id === 'neige') {
      midC0 = '#6e8c5a'; midC1 = '#4a6848'; midEdge = 'rgba(230, 236, 240, .28)';
      nearC0 = '#5a7a48'; nearC1 = '#3a5a38';
    }
    if (id === 'poupet') {
      return [
        { par: 0.03, y: 20, hmax: 28, hs: 1, fn: far, c0: farCol0, c1: farCol1, edge: 'rgba(255, 240, 220, .25)', haze: farHaze, gk: 0.02,
          noFill: true, decor: opt.farDecor },
        { par: 0.14, y: 36, hmax: 28, hs: 1, fn: mid, c0: '#6a9850', c1: '#3e6840', edge: 'rgba(40, 56, 32, .16)', gk: 0.06,
          noFill: true, decor: opt.midDecor },
        { par: 0.28, y: 48, hmax: 22, hs: 1, fn: near, c0: '#5a8a44', c1: '#3a6634', edge: 'rgba(40, 56, 32, .16)', gk: 0.1,
          noFill: true }
      ];
    }
    return [
      { par: 0.03, y: 20, hmax: 70, fn: far, c0: farCol0, c1: farCol1, edge: 'rgba(255, 240, 220, .35)', haze: farHaze, gk: 0.02,
        noFill: true,
        decor: opt.farDecor },
      { par: 0.14, y: 34, hmax: 62, fn: mid, c0: midC0, c1: midC1, edge: midEdge, gk: 0.06,
        noFill: true,
        trees: { step: 22, seed: 41, dens: midTree, maxH: 50, size: 16, haze: 0.16, hazeCol: id === 'colomby' ? '#d8c890' : '#c8d4b0', kind: function () { return 'fir'; } },
        decor: opt.midDecor },
      { par: 0.26, y: 46, hmax: 40, fn: near, c0: nearC0, c1: nearC1, edge: nearEdge, gk: 0.1,
        noFill: true,
        trees: { step: 16, seed: 52, dens: nearTree, maxH: 32, size: 13, haze: 0.06, hazeCol: id === 'colomby' ? '#d8c890' : '#c8d4b0', kind: function (x, hv) { return id === 'neige' ? 'fir' : (hv < 0.55 ? 'fir' : 'beech'); } } }
    ];
  }

  function atJuraSummit(Ev, vw) {
    var sx0 = Ev && Ev.feat && (Ev.feat.summitX || Ev.feat.summitStart);
    if (sx0 == null || !Ev.cam) { return false; }
    return (sx0 - Ev.cam.x) > -60 && (sx0 - Ev.cam.x) < (vw || 200) + 120;
  }

  function midDecorCow(c, tx, hy, Ev, ph, coat, breed) {
    /* Vaches de couche mid : minuscules (quelques px). Jamais l'échelle
       1,4 m du sentier — celle-là reste aux troupeaux Fauna du chemin. */
    if (!window.Fauna || !Fauna.drawCow) { return; }
    Fauna.drawCow(c, {
      x: tx, y: hy,
      face: Ev.hash && Ev.hash(tx, 10) > 0.5 ? 1 : -1,
      coat: coat == null ? 2 : coat,
      breed: breed || 'montbeliarde',
      ph: ph || 0,
      sc: 0.07
    }, Ev.time);
  }

  function poupetMontBlanc(c, x, y, sc) {
    /* Silhouette reconnaissable : large dôme neigeux, épaule gauche (Goûter),
       épaule droite plus basse (Maudit), très voilée. */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#7a8894';
    c.beginPath();
    c.moveTo(-48, 16);
    c.quadraticCurveTo(-36, 4, -28, 6);
    c.quadraticCurveTo(-18, -8, -8, 2);
    c.quadraticCurveTo(-2, -18, 8, -22);
    c.quadraticCurveTo(16, -16, 22, -4);
    c.quadraticCurveTo(30, -10, 38, 2);
    c.quadraticCurveTo(46, 8, 52, 16);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(245, 248, 252, .85)';
    c.beginPath();
    c.moveTo(-6, -8); c.quadraticCurveTo(8, -22, 16, -6); c.lineTo(10, -2); c.quadraticCurveTo(6, -12, -2, -6);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(-26, 2); c.quadraticCurveTo(-18, -8, -10, 2); c.lineTo(-16, 6); c.closePath(); c.fill();
    c.restore();
  }

  function poupetAf(Ev) {
    var sx = Ev && Ev.feat && (Ev.feat.summitX || Ev.feat.summitStart);
    var x = (Ev && Ev.P && Ev.P.x) || (Ev && Ev.cam && Ev.cam.x) || 0;
    if (!sx) { return 0; }
    return Math.max(0, Math.min(1, x / sx));
  }

  function poupetParaglider(c, x, y, sc, col) {
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.strokeStyle = col || '#c45a32'; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-7, 0); c.quadraticCurveTo(0, -3.2, 7, 0); c.stroke();
    c.strokeStyle = 'rgba(40,36,32,.55)'; c.lineWidth = 0.45;
    c.beginPath(); c.moveTo(-5, 0.2); c.lineTo(0, 5.5); c.moveTo(5, 0.2); c.lineTo(0, 5.5); c.stroke();
    c.fillStyle = '#4a4034'; c.beginPath(); c.arc(0, 5.7, 0.7, 0, 7); c.fill();
    c.restore();
  }

  function poupetFort(c, x, y, sc, kind) {
    /* y = crête de l'éperon. Socle rocheux qui se fond dans la pente, pas de dalle
       flottante. Bâtiments posés sur le roc. */
    var long = kind === 'andre';
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    /* éperon rocheux, pied dans la pente (positif = vers le bas) */
    c.fillStyle = '#6e6a60';
    c.beginPath();
    if (long) {
      c.moveTo(-18, 8); c.quadraticCurveTo(-16, 1, -12, -2);
      c.lineTo(14, -2); c.quadraticCurveTo(18, 1, 16, 8);
      c.quadraticCurveTo(0, 12, -18, 8);
    } else {
      c.moveTo(-12, 7); c.quadraticCurveTo(-10, 1, -7, -2);
      c.lineTo(9, -2); c.quadraticCurveTo(12, 1, 10, 7);
      c.quadraticCurveTo(0, 10, -12, 7);
    }
    c.closePath(); c.fill();
    /* courtines, pieds à y = -2 (sur le roc) */
    c.fillStyle = '#c4bba8';
    if (long) {
      c.fillRect(-12, -9, 16, 7);
      c.fillRect(3, -7, 10, 5);
      c.fillStyle = '#5a4034';
      c.fillRect(-12, -10.6, 16, 1.8);
      c.fillRect(3, -8.6, 10, 1.6);
    } else {
      c.fillRect(-6, -8, 7, 6);
      c.fillRect(1, -7, 7, 5);
      c.fillStyle = '#5a4034';
      c.fillRect(-6, -9.4, 7, 1.5);
      c.fillRect(1, -8.4, 7, 1.4);
    }
    c.fillStyle = '#b8b0a0';
    c.fillRect(long ? 10 : 5, long ? -12 : -10, 4, 5);
    c.fillStyle = '#4a3a32';
    c.fillRect(long ? 9.6 : 4.6, long ? -13.4 : -11.4, 4.8, 1.4);
    c.restore();
  }

  function poupetTown(c, x, y, sc) {
    /* Salins typifié : grappe de toits rouges, un long bâtiment bas
       (Grande Saline, UNESCO) — pas un plan de ville. */
    var i, ox, oy;
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#6a8a50';
    c.beginPath(); c.ellipse(0, 4, 46, 8, 0, 0, 7); c.fill();
    for (i = 0; i < 14; i++) {
      ox = -28 + (i % 7) * 8.4 + (i % 3) * 1.2;
      oy = (i < 7 ? 0 : 3.5) + (i % 2);
      c.fillStyle = i === 4 ? '#c4b090' : '#d4c8b0';
      c.fillRect(ox, oy - 3.2, 6.2, 3.4);
      c.fillStyle = '#a42820';
      c.beginPath(); c.moveTo(ox - 0.6, oy - 3.2); c.lineTo(ox + 3.1, oy - 5.4); c.lineTo(ox + 6.8, oy - 3.2); c.closePath(); c.fill();
    }
    /* longue halle typifiée de la Grande Saline */
    c.fillStyle = '#c8c0b0'; c.fillRect(-18, -2.2, 22, 4.2);
    c.fillStyle = '#8a3a28'; c.fillRect(-18, -4.0, 22, 2.0);
    c.restore();
  }

  function poupetMassif(c, x, y, sc) {
    /* Profil compact typifié (Salins / Pretin) : deux humps + cicatrices
       calcaires lisibles dans un cadre 461 (vw ~ 135). */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.beginPath();
    c.moveTo(-90, 32);
    c.quadraticCurveTo(-70, 10, -50, 4);
    c.quadraticCurveTo(-32, -20, -16, -26);
    c.quadraticCurveTo(-4, -14, 10, -8);
    c.quadraticCurveTo(24, -22, 40, -18);
    c.quadraticCurveTo(58, -10, 72, 6);
    c.quadraticCurveTo(84, 16, 92, 32);
    c.closePath();
    c.fillStyle = A.grad(c, 0, -30, 0, 32, [0, '#5a7a48', 0.45, '#3a5a32', 1, '#2a4224']);
    c.fill();
    /* ombre forestière sur le hump principal */
    c.fillStyle = 'rgba(30,50,28,.38)';
    c.beginPath(); c.ellipse(-28, -10, 22, 10, -0.35, 0, 7); c.fill();
    c.beginPath(); c.ellipse(8, 2, 14, 6, 0.15, 0, 7); c.fill();
    /* barres calcaires : bandes horizontales irrégulières sous la crête, mangées par la forêt */
    c.fillStyle = 'rgba(196, 190, 176, .78)';
    c.beginPath();
    c.moveTo(-34, -14); c.quadraticCurveTo(-24, -19, -12, -18); c.lineTo(-8, -15);
    c.quadraticCurveTo(-18, -12, -26, -11); c.quadraticCurveTo(-31, -10, -34, -14); c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(22, -14); c.quadraticCurveTo(32, -18, 44, -14); c.lineTo(46, -11);
    c.quadraticCurveTo(36, -10, 26, -10); c.closePath(); c.fill();
    c.fillStyle = 'rgba(90, 86, 76, .35)';
    c.beginPath(); c.moveTo(-26, -11); c.quadraticCurveTo(-18, -12, -8, -15); c.lineTo(-9, -13); c.quadraticCurveTo(-18, -10, -26, -10); c.closePath(); c.fill();
    c.fillStyle = 'rgba(30,50,28,.55)';
    c.beginPath(); c.ellipse(-20, -9, 9, 3.5, -0.1, 0, 7); c.fill();
    c.beginPath(); c.ellipse(34, -8, 9, 3, 0.1, 0, 7); c.fill();
    c.restore();
  }

  function poupetLeftCrest(vw, base, off) {
    return { x: vw * 0.14 - off * 0.04, y: base - 18 };
  }
  function poupetRightCrest(vw, base, off) {
    return { x: vw * 0.76 - off * 0.03, y: base - 20 };
  }

  function poupetShoulders(c, vw, base, off) {
    /* Épaules boisées, cimes en roc nu pour y poser les forts. Bords organiques. */
    var g, L, R;
    L = poupetLeftCrest(vw, base, off);
    R = poupetRightCrest(vw, base, off);
    g = A.grad(c, 0, base - 22, 0, base + 32, [0, '#3a5a2c', 0.5, '#2a4220', 1, '#1a3018']);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-40, base + 42);
    c.quadraticCurveTo(-10, base + 8, L.x - 24, L.y + 8);
    c.quadraticCurveTo(L.x - 8, L.y, L.x, L.y);
    c.quadraticCurveTo(L.x + 16, L.y + 4, vw * 0.30 - off * 0.04, base + 8);
    c.quadraticCurveTo(vw * 0.36, base + 22, vw * 0.34, base + 36);
    c.lineTo(-40, base + 42);
    c.closePath();
    c.fill();
    /* calotte rocheuse de l'éperon gauche */
    c.fillStyle = '#7a766c';
    c.beginPath();
    c.moveTo(L.x - 16, L.y + 6); c.quadraticCurveTo(L.x - 6, L.y - 2, L.x + 4, L.y);
    c.quadraticCurveTo(L.x + 14, L.y + 3, L.x + 10, L.y + 8);
    c.quadraticCurveTo(L.x, L.y + 10, L.x - 16, L.y + 6);
    c.closePath(); c.fill();
    if (typeof firBelt === 'function') {
      firBelt(c, -10, vw * 0.30, L.y + 6, base + 26, 11, '#1e3a20');
    }
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(vw + 40, base + 42);
    c.quadraticCurveTo(vw + 10, base + 10, R.x + 22, R.y + 8);
    c.quadraticCurveTo(R.x + 8, R.y, R.x, R.y);
    c.quadraticCurveTo(R.x - 16, R.y + 4, vw * 0.60 - off * 0.03, base + 8);
    c.quadraticCurveTo(vw * 0.54, base + 22, vw * 0.56, base + 36);
    c.lineTo(vw + 40, base + 42);
    c.closePath();
    c.fill();
    c.fillStyle = '#7a766c';
    c.beginPath();
    c.moveTo(R.x - 12, R.y + 6); c.quadraticCurveTo(R.x - 2, R.y - 2, R.x + 8, R.y);
    c.quadraticCurveTo(R.x + 16, R.y + 3, R.x + 10, R.y + 8);
    c.quadraticCurveTo(R.x, R.y + 10, R.x - 12, R.y + 6);
    c.closePath(); c.fill();
    if (typeof firBelt === 'function') {
      firBelt(c, vw * 0.58, vw * 0.96, R.y + 6, base + 26, 17, '#1e3a20');
    }
  }

  function poupetBresse(c, vw, y, off) {
    /* Plaine de la Bresse à l'ouest : horizon bas, champs très lointains, brume. */
    var i, x;
    c.beginPath();
    c.moveTo(-40, y + 28);
    c.lineTo(-40, y + 6);
    for (i = 0; i <= 12; i++) {
      x = -40 + i * (vw + 80) / 12 - off * 0.04;
      c.quadraticCurveTo(x + (vw + 80) / 24, y + 4 + (i % 3) * 2, x + (vw + 80) / 12, y + 6 + (i % 2));
    }
    c.lineTo(vw + 40, y + 28);
    c.closePath();
    c.fillStyle = A.grad(c, 0, y, 0, y + 28, [0, 'rgba(190, 204, 170, .85)', 1, 'rgba(160, 180, 140, .7)']);
    c.fill();
  }

  function poupetValley(c, vw, base, off, drop) {
    /* Vallée de la Furieuse, plancher sous le belvédère, bords organiques. */
    var i, x, y, floor;
    floor = base + drop;
    c.beginPath();
    c.moveTo(-60, floor + 44);
    for (i = -60; i <= vw + 60; i += 18) {
      x = i;
      var u = (i - vw * 0.42) / (vw * 0.45);
      var bowl = Math.max(0, 1 - u * u);
      y = base + 8 + drop * bowl + 4 * Math.sin(i * 0.02);
      if (i === -60) { c.moveTo(x, y); } else { c.lineTo(x, y); }
    }
    c.lineTo(vw + 60, floor + 44);
    c.closePath();
    c.fillStyle = A.grad(c, 0, floor - 8, 0, floor + 42, [0, '#7a9a58', 0.5, '#5a7a40', 1, '#3e5e30']);
    c.fill();
    /* quelques parcelles */
    for (i = 0; i < 8; i++) {
      x = 30 + i * 48 - off * 0.2;
      if (x < -20 || x > vw + 20) { continue; }
      y = floor + 8 + (i % 3) * 3;
      c.fillStyle = i % 2 ? 'rgba(200, 190, 120, .4)' : 'rgba(90, 130, 70, .35)';
      c.beginPath(); c.ellipse(x, y, 16 + (i % 3) * 4, 5, 0.1 * (i % 3), 0, 7); c.fill();
    }
  }

  function poupetCliffs(c, x, y, sc) {
    /* Barre calcaire typifiée du rebord (Commons, vue avec parapentes). */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#3a5a30';
    c.beginPath(); c.moveTo(-20, 28); c.quadraticCurveTo(-4, -8, 24, -18); c.quadraticCurveTo(50, -8, 70, 28); c.closePath(); c.fill();
    c.fillStyle = '#e8e4d8';
    c.beginPath();
    c.moveTo(4, 8); c.lineTo(8, -12); c.lineTo(22, -16); c.lineTo(28, -6); c.lineTo(24, 10);
    c.closePath(); c.fill();
    c.fillStyle = '#d0ccc0';
    c.beginPath(); c.moveTo(26, 6); c.lineTo(32, -10); c.lineTo(44, -8); c.lineTo(42, 10); c.closePath(); c.fill();
    c.restore();
  }

  function drawPoupetVista(c, vw, base, off, Ev) {
    /* Composition typifiée d'après Commons (Croix du Poupet, Pretin, Salins) :
       plaine de la Bresse, Furieuse et Salins, forts sur les éperons, massif
       à cicatrices, Alpes très lointaines par temps clair. */
    var af = poupetAf(Ev), yf = base - 6;
    /* Bresse, toujours, plus lisible en montant */
    poupetBresse(c, vw, yf + 8, off);
    /* Alpes : seulement près du sommet, chaîne basse bleu-gris, très voilée
       (pas un bloc rose dentelé à mi-pente). */
    if (af > 0.82) {
      /* Mont Blanc typifié, très lointain : dôme neigeux, épaules (Goûter / Maudit). */
      c.save();
      c.globalAlpha = 0.22 + 0.20 * Math.min(1, (af - 0.82) / 0.18);
      poupetMontBlanc(c, 0.47 * vw - off * 0.02, base - 4, 0.55);
      c.restore();
    }
    if (af < 0.72) {
      /* depuis le bas : le Poupet se dresse au-dessus de Salins.
         Deux ou trois plans : plateau lointain, massif, pied/bourg. */
      c.fillStyle = 'rgba(130, 150, 120, .5)';
      c.beginPath();
      c.moveTo(-40, base + 28);
      c.quadraticCurveTo(0.22 * vw, base + 2, 0.48 * vw, base + 12);
      c.quadraticCurveTo(0.75 * vw, base + 0, vw + 40, base + 16);
      c.lineTo(vw + 40, base + 36);
      c.lineTo(-40, base + 36);
      c.closePath();
      c.fill();
      var msc = Math.min(1.55, vw * 1.18 / 182);
      poupetMassif(c, 0.48 * vw - off * 0.08, base - 6, msc);
      poupetTown(c, 0.40 * vw - off * 0.10, base - 1, 0.95);
    } else {
      /* depuis le haut : on plonge dans la Furieuse (vue typifiée poupet-3) */
      var drop = 12 + 18 * Math.min(1, (af - 0.72) / 0.22);
      poupetValley(c, vw, base - 8, off, drop);
      /* lointain boisé au fond du creux (poupet-3), bouche le jour crème */
      c.fillStyle = 'rgba(110, 140, 95, .9)';
      c.beginPath();
      c.moveTo(vw * 0.24 - off * 0.04, base + 18);
      c.quadraticCurveTo(vw * 0.34 - off * 0.04, base + 2, vw * 0.44 - off * 0.04, base + 6);
      c.quadraticCurveTo(vw * 0.54 - off * 0.04, base + 0, vw * 0.64 - off * 0.04, base + 16);
      c.lineTo(vw * 0.60, base + 24);
      c.lineTo(vw * 0.28, base + 24);
      c.closePath(); c.fill();
      /* Salins au plancher de la Furieuse, petit et voilé, entre les éperons */
      (function () {
        var ty = base + 6 + drop * 0.22, tx = 0.45 * vw - off * 0.08;
        c.save(); c.globalAlpha = 0.70;
        poupetTown(c, tx, ty, 0.42);
        c.restore();
        if (window.auditAnchor) { window.auditAnchor('salins-valley', tx, ty, ty); }
      }());
      poupetShoulders(c, vw, base, off);
      (function () {
        var L = poupetLeftCrest(vw, base, off), R = poupetRightCrest(vw, base, off);
        poupetFort(c, L.x, L.y, 0.40, 'andre');
        poupetFort(c, R.x, R.y, 0.36, 'belin');
        if (window.auditAnchor) {
          window.auditAnchor('fort-andre', L.x, L.y, L.y);
          window.auditAnchor('fort-belin', R.x, R.y, R.y);
        }
      }());
      if (af > 0.75) {
        poupetParaglider(c, 0.34 * vw, base - 30, 0.65, '#d46a3a');
        poupetParaglider(c, 0.52 * vw, base - 42, 0.5, '#f0e0c8');
      }
    }
  }

  function juraAf(Ev) {
    var s = Ev && Ev.feat && (Ev.feat.summitX || Ev.feat.summitStart);
    var x = (Ev && Ev.P && Ev.P.x != null) ? Ev.P.x : ((Ev && Ev.cam && Ev.cam.x) || 0);
    return s ? Math.max(0, Math.min(1, x / s)) : 0;
  }

  function typFir(c, x, y, sc, col, col2) {
    /* Sapin typifié, pied à (x, y). Pas une rangée de triangles identiques. */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = col2 || '#4a3020';
    c.fillRect(-0.7, -1.2, 1.4, 2.4);
    c.fillStyle = col || '#2a4a28';
    c.beginPath();
    c.moveTo(0, -17);
    c.lineTo(4.2, -7);
    c.lineTo(2.0, -7);
    c.lineTo(5.0, -1.2);
    c.lineTo(2.2, -1.2);
    c.lineTo(5.6, 5.4);
    c.lineTo(-5.6, 5.4);
    c.lineTo(-2.2, -1.2);
    c.lineTo(-5.0, -1.2);
    c.lineTo(-2.0, -7);
    c.lineTo(-4.2, -7);
    c.closePath();
    c.fill();
    c.restore();
  }

  function typFirBand(c, x0, x1, yFn, seed, opt) {
    var i, n, x, y, sc, col, col2, k;
    opt = opt || {};
    n = opt.n || Math.max(3, ((x1 - x0) / (opt.step || 9)) | 0);
    for (i = 0; i < n; i++) {
      k = seed + i * 17;
      x = x0 + (i + 0.15 + ((k * 13) % 10) * 0.04) * ((x1 - x0) / n);
      if (typeof yFn === 'function') { y = yFn(x); } else { y = yFn; }
      sc = (opt.s0 || 0.45) + ((k * 7) % 11) * 0.05;
      if (opt.sJitter) { sc *= 0.85 + ((k * 3) % 8) * 0.04; }
      col = (i + seed) % 3 ? (opt.col || '#2a4a28') : (opt.col2 || '#1e3a22');
      col2 = '#4a3020';
      typFir(c, x, y + ((k % 5) - 2) * 0.4, sc, col, col2);
    }
  }

  function fermeSoliat(c, x, y, sc) {
    /* Ferme du Soliat typifiee d'apres Commons img 43399 : corps
       creme a deux niveaux, grand toit rouge a deux pans, porte et
       fenetres, ombre au sol. Pied en y. Personne = 37 u ; ici le
       volume est typifie (pas un 1:1 de 7 m) pour lire comme une
       ferme de deux etages au moyen plan. */
    var wallH;
    sc = sc || 1;
    wallH = 20;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    typFir(c, 30, 0.6, 1.0, '#2a4a28');
    typFir(c, 40, 1.0, 0.72, '#1e3a22');
    /* ombre portee sur le paturage */
    c.fillStyle = 'rgba(30, 24, 16, 0.38)';
    c.beginPath();
    c.ellipse(3, 2.2, 30, 4.0, 0, 0, 7);
    c.fill();
    /* muret bas, de chaque cote, sans cacher la porte */
    c.fillStyle = '#9a9488';
    c.fillRect(-22, -2.2, 11, 2.2);
    c.fillRect(10, -2.2, 14, 2.2);
    c.strokeStyle = 'rgba(40, 36, 30, 0.35)';
    c.lineWidth = 0.4;
    c.strokeRect(-22, -2.2, 11, 2.2);
    c.strokeRect(10, -2.2, 14, 2.2);
    /* corps : deux niveaux, pied au sol */
    c.fillStyle = '#efeae2';
    c.fillRect(-18, -wallH, 36, wallH);
    c.fillStyle = '#e0dad2';
    c.fillRect(8, -wallH, 10, wallH);
    c.strokeStyle = '#3a342c';
    c.lineWidth = 0.55;
    c.strokeRect(-18, -wallH, 36, wallH);
    c.strokeStyle = 'rgba(60, 50, 40, 0.22)';
    c.lineWidth = 0.45;
    c.beginPath();
    c.moveTo(-18, -13);
    c.lineTo(18, -13);
    c.stroke();
    /* fenetres : etage sous l'avant-toit, rez de chaque cote de la porte */
    function fenetre(fx, fy) {
      c.fillStyle = '#4a5560';
      c.fillRect(fx, fy, 5.2, 5.2);
      c.fillStyle = '#8aa0b0';
      c.fillRect(fx + 0.7, fy + 0.7, 3.8, 3.8);
    }
    fenetre(-13, -wallH + 3.2);
    fenetre(-3, -wallH + 3.2);
    fenetre(8, -wallH + 3.2);
    fenetre(-13, -9);
    fenetre(8, -9);
    /* porte au rez-de-chaussee, jusqu'au sol */
    c.fillStyle = '#3a2a20';
    c.fillRect(-3.2, -10.5, 6.6, 10.5);
    c.fillStyle = '#5a4030';
    c.fillRect(-2.4, -9.6, 5, 9.6);
    c.fillStyle = '#c8be6a';
    c.beginPath();
    c.arc(1.5, -5.2, 0.6, 0, 7);
    c.fill();
    /* grand toit a deux pans */
    c.fillStyle = '#8a3a28';
    c.beginPath();
    c.moveTo(-21, -wallH + 1.2);
    c.lineTo(0, -wallH - 14);
    c.lineTo(21, -wallH + 1.2);
    c.closePath();
    c.fill();
    c.strokeStyle = '#3a1c14';
    c.lineWidth = 0.6;
    c.stroke();
    /* appentis, murs visibles */
    c.fillStyle = '#ece8e0';
    c.fillRect(18, -15, 12, 15);
    c.fillStyle = '#7a3424';
    c.beginPath();
    c.moveTo(17, -15);
    c.lineTo(24, -22);
    c.lineTo(31, -15);
    c.closePath();
    c.fill();
    c.fillStyle = '#c5ced6';
    c.fillRect(21, -11, 4, 4);
    c.restore();
  }

  function fortJouxTiny(c, x, y, sc) {
    /* Château de Joux typifié (silhouette de donjon + courtines sur un éperon
       boisé), seulement à petite échelle dans la cluse, d'après Commons
       « Château de Joux et Fort du Larmont ». */
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#4a5a38';
    c.beginPath(); c.moveTo(-16, 6); c.quadraticCurveTo(0, -2, 18, 6); c.lineTo(18, 8); c.lineTo(-16, 8); c.closePath(); c.fill();
    typFir(c, -12, 4, 0.45, '#2a3a24'); typFir(c, 14, 4.2, 0.4, '#243420');
    c.fillStyle = '#8a8478';
    c.fillRect(-8, -8, 16, 10);
    c.fillStyle = '#6a665c';
    c.fillRect(-11, -5, 5, 7);
    c.fillRect(7, -6, 6, 8);
    c.fillStyle = '#5a564c';
    c.fillRect(-3, -14, 6, 8);
    c.beginPath(); c.moveTo(-3.4, -14); c.lineTo(0, -18); c.lineTo(3.4, -14); c.closePath(); c.fill();
    c.fillStyle = '#d8d0c4';
    c.fillRect(-2, -12, 1.6, 2); c.fillRect(1, -12, 1.6, 2);
    c.restore();
  }

  function softAlps(c, x, y, sc, variant) {
    /* Chaîne alpine lointaine, voilée. variant 3 = panorama de sommet :
       un peu plus de relief, Mont Blanc lisible, pas une bande plate. */
    var tall = variant === 3;
    sc = sc || 1;
    c.save();
    c.translate(x, y);
    c.scale(sc, sc * (tall ? 0.95 : 0.62));
    if (!tall) {
      c.fillStyle = 'rgba(186, 198, 214, 0.32)';
      c.beginPath(); c.ellipse(0, 10, 170, 11, 0, 0, 7); c.fill();
    } else {
      c.fillStyle = 'rgba(186, 198, 214, 0.16)';
      c.beginPath(); c.ellipse(20, 14, 130, 10, 0, 0, 7); c.fill();
    }
    c.fillStyle = 'rgba(168, 178, 196, 0.88)';
    c.beginPath();
    c.moveTo(-160, 22);
    c.lineTo(-128, 14);
    c.lineTo(-104, 18);
    c.lineTo(-78, 8);
    c.lineTo(-54, 15);
    c.lineTo(-24, 6);
    c.lineTo(0, 14);
    c.lineTo(22, 4);
    c.lineTo(44, -10);
    c.lineTo(58, -4);
    c.lineTo(72, 2);
    c.lineTo(96, 4);
    c.lineTo(124, 12);
    c.lineTo(160, 20);
    /* pas de socle rectangulaire : le pied descend en douceur */
    if (tall) {
      c.quadraticCurveTo(80, 36, 0, 32);
      c.quadraticCurveTo(-80, 36, -160, 28);
    } else {
      c.lineTo(160, 24);
      c.lineTo(-160, 24);
    }
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(240, 244, 250, 0.7)';
    c.beginPath(); c.moveTo(34, -2); c.lineTo(44, -12); c.lineTo(54, -1); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-32, 7); c.lineTo(-24, 3); c.lineTo(-16, 9); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(88, 4); c.lineTo(96, 1); c.lineTo(106, 6); c.closePath(); c.fill();
    c.restore();
  }

  function juraHorizon(c, x, y, sc, pal) {
    /* Crêtes jurassiennes typifiées (Chasseron / Suchet / Mont Tendre) :
       longues, boisées, sans neiges alpines. */
    pal = pal || {};
    sc = sc || 1;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    var bot = pal.bot != null ? pal.bot : 88;
    c.fillStyle = pal.far || '#8a9a88';
    c.beginPath();
    c.moveTo(-260, 28);
    c.quadraticCurveTo(-140, 8, -60, 16);
    c.quadraticCurveTo(20, 4, 80, 14);
    c.quadraticCurveTo(160, 6, 280, 20);
    c.lineTo(280, bot);
    c.quadraticCurveTo(20, bot + 6, -260, bot);
    c.closePath();
    c.fill();
    c.fillStyle = pal.mid || '#6a8260';
    c.beginPath();
    c.moveTo(-240, 28);
    c.quadraticCurveTo(-80, 10, 10, 20);
    c.quadraticCurveTo(90, 8, 240, 24);
    c.lineTo(240, bot + 4);
    c.quadraticCurveTo(10, bot + 10, -240, bot + 4);
    c.closePath();
    c.fill();
    c.restore();
  }

  function pastureSlope(c, x0, y0, x1, y1, x2, yBot, c0, c1) {
    c.beginPath();
    c.moveTo(x0, yBot);
    c.quadraticCurveTo(x0 * 0.4 + x1 * 0.6, y0, x1, y1);
    c.quadraticCurveTo(x1 * 0.4 + x2 * 0.6, y1 + 6, x2, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, y1, 0, yBot, [0, c0, 1, c1]);
    c.fill();
  }




  function drawDorVista(c, vw, base, off, Ev) {
    /* Mont d'Or : panorama AU-DESSUS du sentier. Lacs en lames
       horizontales posees dans la vallee, pas des trapèzes. */
    var af = juraAf(Ev), atSummit = atJuraSummit(Ev, vw);
    var yf = base - 10;
    var lift = atSummit ? 44 : 12;
    var yAlps = yf - lift - (atSummit ? 24 : 6);
    var yHor = yf - lift + (atSummit ? 10 : 8);
    var yRidge = yf - lift + (atSummit ? 22 : 14);
    var yLake = yf - lift + (atSummit ? 36 : 22);
    var aAlps, jx, aV, lakeH;

    juraHorizon(c, 0.52 * vw - off * 0.04, yHor, atSummit ? 1.35 : 1.08, {
      far: atSummit ? '#8e9a80' : '#8a9a82',
      mid: atSummit ? '#6e8660' : '#6a825e',
      bot: atSummit ? 110 : 70
    });
    if (af > 0.4) {
      aV = 0.2 + 0.45 * ss(0.4, 0.85, af);
      c.fillStyle = 'rgba(186, 198, 186, ' + (atSummit ? 0.28 : aV * 0.45).toFixed(2) + ')';
      c.beginPath();
      c.ellipse(0.62 * vw - off * 0.08, yHor + 8, vw * (atSummit ? 0.34 : 0.26), atSummit ? 8 : 5, 0, 0, 7);
      c.fill();
    }
    aAlps = ss(0.48, 0.86, af);
    if (aAlps > 0.05) {
      c.save();
      c.globalAlpha = (atSummit ? 0.90 : 0.32) + 0.10 * aAlps;
      if (atSummit) {
        juraFarAlps(c, vw, yAlps + 22, { kind: 'dor', mbX: 0.60 * vw - off * 0.04 });
      } else {
        c.globalAlpha = 0.32 + 0.28 * aAlps;
        softAlps(c, 0.64 * vw - off * 0.10, yAlps, 0.72, 0);
      }
      c.restore();
    }
    if (af > 0.12 && !atSummit) {
      c.save(); c.globalAlpha = 0.35 + 0.55 * ss(0.12, 0.55, af);
      horizonLake(c, {
        cx: 0.16 * vw - off * 0.16, y: yLake + 2,
        half: vw * 0.07, h: 5.5,
        pal: LAKEPAL.saintpoint,
        village: true, villageX: -vw * 0.03, villageSc: 0.3
      });
      c.restore();
    }
    if (af > 0.62) {
      c.save(); c.globalAlpha = 0.4 + 0.35 * ss(0.62, 0.9, af);
      fortJouxTiny(c, 0.18 * vw - off * 0.10, yRidge + (atSummit ? 10 : 12), 0.40);
      c.restore();
    }
    if (af > 0.28) {
      c.save();
      c.globalAlpha = 0.62 + 0.38 * ss(0.28, 0.75, af);
      jx = 0.58 * vw - off * 0.14;
      /* cretes DERRIERE la vallee */
      juraRidge(c, jx + vw * 0.18, yRidge - (atSummit ? 8 : 2), atSummit ? 0.95 : 0.7, '#5a724c');
      dentDeVaulion(c, jx + 10, yRidge - (atSummit ? 10 : 2), atSummit ? 0.9 : 0.7);
      juraRidge(c, jx - vw * 0.16, yRidge - (atSummit ? 2 : 0), atSummit ? 0.8 : 0.65, '#4a663c');
      /* pres de la vallee : lisiere et paturage, pas de lentilles sombres */
      typFirBand(c, jx - vw * 0.20, jx + vw * 0.10, function (x) {
        return yLake + 14 + 3 * Math.sin(x * 0.07);
      }, 17, { step: 14, s0: atSummit ? 0.18 : 0.16, col: '#1e3620' });
      lakeH = atSummit ? 7.5 : 8.5;
      horizonLake(c, {
        cx: jx, y: yLake,
        half: vw * (atSummit ? 0.155 : 0.14), h: lakeH,
        pal: LAKEPAL.joux,
        village: true, villageX: -vw * 0.06, villageSc: atSummit ? 0.22 : 0.3
      });
      horizonLake(c, {
        cx: jx + vw * 0.15, y: yLake + 1.6,
        half: vw * 0.042, h: lakeH * 0.55,
        pal: LAKEPAL.joux, village: false
      });
      /* rive proche / sapins DEVANT, qui recouvrent un peu l'eau */
      typFirBand(c, jx - vw * 0.18, jx + vw * 0.22, function (x) {
        return yLake + 5 + 2 * Math.sin(x * 0.05);
      }, 21, { step: 12, s0: atSummit ? 0.22 : 0.2, col: '#1a3220' });
      c.restore();
    }
  }

  function worldFirGroves(c, off, base, groves, seed0, opt) {
    var i, g, x0, x1;
    opt = opt || {};
    for (i = 0; i < groves.length; i++) {
      g = groves[i];
      x0 = g[0] - g[1] * 0.5 - off;
      x1 = g[0] + g[1] * 0.5 - off;
      typFirBand(c, x0, x1, function (x) {
        return base - 6 + 3 * Math.sin((x + off) * 0.07);
      }, seed0 + i * 19, {
        step: opt.step || 9, s0: g[2],
        col: opt.col || '#1e3620', col2: opt.col2 || '#243c24'
      });
    }
  }

  function uhash(x, s) {
    var n = (x * 374761 + s * 668265) | 0;
    n = n ^ (n >>> 16);
    return ((n * 2246822519) >>> 0) / 4294967296;
  }

  function firsInView(c, off, vw, base, dens, step, seed, s0, col) {
    var wx, h, x, sc, y;
    wx = Math.floor((off - 60) / step) * step;
    for (; wx < off + vw + 60; wx += step) {
      h = uhash(wx, seed);
      if (h > dens) { continue; }
      x = wx - off;
      sc = (s0 || 0.55) * (0.7 + h * 0.55);
      y = base - 6 + (uhash(wx, seed + 3) * 8 - 4);
      typFir(c, x, y, sc, (wx + seed) % 3 ? (col || '#1e3620') : '#243c24');
    }
  }


  function drawDorMid(c, vw, base, off, fn, Ev) {
    var af = juraAf(Ev), i, wx, tx, hy, spots, yRidge, startA, signX, vilX;
    if (atJuraSummit(Ev, vw)) { return; }
    pastureSlope(c, -40, base - 10, vw * 0.28, base - 26, vw * 0.62, base + 36,
      af < 0.45 ? '#5a7a44' : '#7a9a54', '#3e5e30');
    pastureSlope(c, vw * 0.40, base + 2, vw * 0.72, base - 16, vw + 40, base + 38,
      '#6a8a4c', '#4a6a36');
    /* grain de paturage, surtout au milieu ou le sol restait trop lisse */
    juraPastureGrain(c, vw * 0.08, base - 6, vw * 0.92, base + 22, 17);
    startA = 1 - ss(0.14, 0.36, af);
    if (startA > 0.04) {
      c.save();
      c.globalAlpha = startA;
      /* long dos herbeux et boise du Mont d'Or, derriere le village */
      montDorStartMassif(c, vw * 0.50, base - 38, vw > 800 ? 1.12 : 0.98);
      /* Doubs : lame horizontale au fond du val, pas un arc */
      meanderRiver(c, vw * 0.02, base - 14, vw * 0.58, base - 14, 2.6);
      /* village en mi-distance, a gauche du panneau, murs au sol */
      signX = 80 - off;
      vilX = signX - (vw > 800 ? 150 : 100);
      if (vilX < 70) { vilX = Math.max(70, vw * 0.34); }
      if (vilX > vw - 50) { vilX = vw * 0.38; }
      rochejeanVillage(c, vilX, base - 22, vw > 800 ? 0.82 : 0.70);
      if (window.auditAnchor) { window.auditAnchor('dor-rochejean', vilX, base - 22, base - 22); }
      /* sapins de berge, qui masquent un peu la lame */
      typFir(c, vilX - 50, base - 16, 0.34, '#1e3620');
      typFir(c, vilX + 20, base - 13, 0.26, '#243c24');
      typFir(c, vilX + 54, base - 15, 0.30, '#243c24');
      typFir(c, vw * 0.10, base - 12, 0.28, '#1a3220');
      c.restore();
    }
    /* sapins dans la fenetre visible, densite plus faible au depart
       (alpages) puis qui baisse encore en montant */
    if (af < 0.88) {
      c.save();
      c.globalAlpha = 1 - ss(0.48, 0.88, af) * 0.4;
      firsInView(c, off, vw, base - 18, (0.36 + 0.34 * ss(0.12, 0.38, af)) * (1 - ss(0.4, 0.86, af) * 0.7), 16, 11, 0.95, '#1e3620');
      c.restore();
    }
    if (af > 0.4) {
      typFir(c, vw * 0.42, base - 22, 0.7, '#2a4a28');
      typFir(c, vw * 0.55, base - 18, 0.55, '#1e3a22');
    }
    spots = [[90, 0.58], [180, 0.55], [340, 0.62], [520, 0.5], [780, 0.58], [1200, 0.5], [1680, 0.48], [2140, 0.45]];
    for (i = 0; i < spots.length; i++) {
      /* au depart, les chalets 90/180 se reculent sur le panneau : on
         les laisse au village typifie, puis ils reviennent en montant */
      if (af < 0.22 && i < 2) { continue; }
      if (af < 0.08 && i > 1) { continue; }
      wx = spots[i][0]; tx = wx - off; hy = base - (fn(wx) || 0) - 8;
      yRidge = base - 12 + 6 * Math.sin(wx * 0.02);
      if (hy > yRidge) { hy = yRidge; }
      if (tx < -30 || tx > vw + 30) { continue; }
      recede(c, tx, hy, spots[i][1], function (c2) { juraChalet(c2, tx, hy, 1); });
      if (window.auditAnchor) { window.auditAnchor('dor-chalet-' + i, tx, hy, hy); }
    }
    if (af < 0.72) {
      spots = [220, 400, 640, 1100, 1580, 2000];
      for (i = 0; i < spots.length; i++) {
        wx = spots[i]; tx = wx - off; hy = base - 8 + (i % 3) * 2;
        if (tx < -20 || tx > vw + 20) { continue; }
        midDecorCow(c, tx, hy, Ev, Ev.time * 0.8 + i, 2, 'montbeliarde');
        if (window.auditAnchor) { window.auditAnchor('dor-cow-' + i, tx, hy, hy); }
      }
    }
    if (af > 0.55) {
      recededCliff(c, vw * 0.72, base - 28);
    }
  }




  function drawVanVista(c, vw, base, off, Ev) {
    /* Creux du Van : Neuchatel est une lame fine vers l'horizon,
       sous les Alpes, sur le plateau — pas un vitrage derriere le randonneur. */
    var af = juraAf(Ev), atSummit = atJuraSummit(Ev, vw);
    var yf = base - 10;
    var lift = atSummit ? 44 : 12;
    var yAlps = yf - lift - (atSummit ? 24 : 6);
    var yHor = yf - lift + (atSummit ? 8 : 8);
    /* hors sommet : le plateau s'abaisse pour laisser une lame de
       Neuchatel sous les Alpes, surtout a l'avant-sommet */
    var yVal = yf - lift + (atSummit ? 22 : 26);
    var yLake = atSummit ? (yHor + 12) : (yf - lift + 4);
    var aAlps;

    juraHorizon(c, 0.55 * vw - off * 0.04, yHor, atSummit ? 1.32 : 1.0, {
      far: '#8a9690', mid: '#6a7e70', bot: atSummit ? 110 : 70
    });
    aAlps = ss(0.46, 0.84, af);
    if (aAlps > 0.05) {
      c.save();
      if (atSummit) {
        c.globalAlpha = 0.88 + 0.10 * aAlps;
        juraFarAlps(c, vw, yAlps + 24, { kind: 'van', mbX: 0.64 * vw - off * 0.04 });
      } else {
        c.globalAlpha = 0.44 + 0.44 * aAlps;
        softAlps(c, 0.68 * vw - off * 0.10, yAlps, 0.74, 2);
      }
      c.restore();
    }
    if (af > 0.28) {
      c.save();
      c.globalAlpha = 0.5 + 0.45 * ss(0.28, 0.8, af);
      /* lame fine, juste sous les Alpes / sur le plateau */
      horizonLake(c, {
        cx: 0.52 * vw - off * 0.10,
        y: yLake,
        half: vw * (atSummit ? 0.34 : 0.32),
        h: atSummit ? 5.2 : 6.6,
        pal: LAKEPAL.neuchatel, village: false
      });
      c.restore();
    }
    /* plateau / Val de Travers DEVANT le lac, pour qu'il soit occlus */
    c.fillStyle = A.grad(c, 0, yVal, 0, yVal + 80, [0, '#6a8a58', 0.4, '#4a6a40', 1, '#2e4a2c']);
    c.beginPath();
    c.moveTo(-40, yVal + (atSummit ? 10 : 18));
    c.quadraticCurveTo(vw * 0.28, yVal + (atSummit ? 2 : 6), vw * 0.52, yVal + (atSummit ? 8 : 10));
    c.quadraticCurveTo(vw * 0.78, yVal + (atSummit ? 1 : 4), vw + 40, yVal + (atSummit ? 10 : 20));
    c.lineTo(vw + 40, yVal + 90); c.lineTo(-40, yVal + 90);
    c.closePath();
    c.fill();
    typFirBand(c, vw * 0.06, vw * 0.50, function (x) { return yVal + (atSummit ? 18 : 20); }, 41, { step: 14, s0: 0.20, col: '#1a3220' });
    if (atSummit) {
      typFirBand(c, vw * 0.48, vw * 0.96, function (x) { return yVal + 16 + 5 * Math.sin(x * 0.04); }, 53, { step: 13, s0: 0.22, col: '#1a3220' });
      typFirBand(c, vw * 0.58, vw * 0.98, function (x) { return yVal + 30 + 4 * Math.sin(x * 0.06); }, 61, { step: 16, s0: 0.18, col: '#1e3620' });
    }
    if (af > 0.28 && af < 0.55) {
      c.save(); c.globalAlpha = 0.75 * (1 - ss(0.28, 0.55, af));
      shoreHamlet(c, 0.28 * vw - off * 0.14, yVal + 14, 0.42);
      c.restore();
    }
  }


  function drawVanMid(c, vw, base, off, fn, Ev) {
    var af = juraAf(Ev), i, wx, tx, hy, rockY, startA, startOpen, signX, vilX, fir0;
    if (atJuraSummit(Ev, vw)) { return; }
    /* profondeur D'ABORD, puis foret plus claire, pour que le plateau,
       les murs et l'apercu du cirque restent lisibles derriere. */
    pastureSlope(c, -30, base - 8, vw * 0.36, base - 22, vw * 0.70, base + 36, '#4a6a38', '#2e4a28');
    pastureSlope(c, vw * 0.50, base + 2, vw * 0.82, base - 14, vw + 40, base + 38, '#5a7a44', '#3a5a30');
    juraPastureGrain(c, vw * 0.10, base - 4, vw * 0.70, base + 20, 23);
    startA = 1 - ss(0.12, 0.34, af);
    if (startA > 0.04) {
      c.save();
      c.globalAlpha = startA;
      /* Areuse : lame horizontale au fond du val, pas un arc */
      meanderRiver(c, vw * 0.02, base - 14, vw * 0.50, base - 14, 2.4);
      signX = 70 - off;
      vilX = signX - (vw > 800 ? 210 : 155);
      if (vilX < 60) { vilX = Math.max(60, vw * 0.28); }
      if (vilX > vw - 80) { vilX = vw * 0.30; }
      noiraigueVillage(c, vilX, base - 20, vw > 800 ? 0.82 : 0.70);
      if (window.auditAnchor) { window.auditAnchor('van-noiraigue', vilX, base - 20, base - 20); }
      typFir(c, vilX - 54, base - 15, 0.32, '#1a3220');
      typFir(c, vilX + 16, base - 12, 0.24, '#1e3620');
      typFir(c, vilX + 58, base - 14, 0.28, '#1e3620');
      typFir(c, vw * 0.08, base - 12, 0.26, '#1a3220');
      c.restore();
    }
    if (af > 0.28) {
      c.save(); c.globalAlpha = 0.55 + 0.4 * ss(0.28, 0.7, af);
      c.fillStyle = '#5a7a44';
      c.beginPath();
      c.moveTo(vw * 0.08, base + 6);
      c.quadraticCurveTo(vw * 0.42, base - 20, vw * 0.82, base + 2);
      c.lineTo(vw * 0.82, base + 16);
      c.quadraticCurveTo(vw * 0.42, base - 2, vw * 0.08, base + 16);
      c.closePath();
      c.fill();
      /* sillon du val, a gauche, en profondeur */
      c.fillStyle = '#334e30';
      c.beginPath();
      c.moveTo(-16, base + 4);
      c.quadraticCurveTo(vw * 0.18, base - 10, vw * 0.34, base + 6);
      c.lineTo(vw * 0.32, base + 16);
      c.quadraticCurveTo(vw * 0.16, base + 4, -16, base + 16);
      c.closePath();
      c.fill();
      typFirBand(c, -8, vw * 0.30, function (x) { return base + 6; }, 19, { step: 13, s0: 0.28, col: '#1a3220' });
      c.restore();
    }
    if (af > 0.40) {
      c.save(); c.globalAlpha = 0.7 + 0.3 * ss(0.40, 0.75, af);
      dryStoneWall(c, vw * 0.44, vw * 0.80, base - 18);
      recede(c, vw * 0.58, base - 12, 0.72, function (c2) {
        dryStoneWall(c2, vw * 0.50, vw * 0.76, base - 12);
      });
      recede(c, vw * 0.64, base - 6, 0.5, function (c2) {
        dryStoneWall(c2, vw * 0.56, vw * 0.74, base - 6);
      });
      tx = vw * 0.58; hy = base - 30;
      recede(c, tx, hy, 0.78, function (c2) { fermeSoliat(c2, tx, hy, 0.76); });
      if (window.auditAnchor) { window.auditAnchor('van-ferme', tx, hy, hy); }
      c.restore();
    }
    if (af > 0.45) {
      /* apercu du rebord / dome du Soliat, puis du cirque */
      recededCirque(c, vw * 0.55, base - 28);
    }
    /* foret des 14 contours : au depart on ouvre le val (village,
       Areuse), la foret commence sur le versant droit ; elle
       s'eclaircit ensuite pour laisser voir le plateau */
    startOpen = 1 - ss(0.10, 0.32, af);
    fir0 = af < 0.32 ? (vw * (0.20 + 0.38 * startOpen)) : (af < 0.22 ? vw * 0.22 : -20);
    c.save();
    c.globalAlpha = 1 - ss(0.42, 0.88, af) * 0.65;
    typFirBand(c, fir0, vw + 20, function (x) {
      return base - 20 + 5 * Math.sin(x * 0.05);
    }, 13, { step: 12, s0: 0.95 * (1 - ss(0.5, 0.88, af) * 0.5), col: '#1a3220', col2: '#162818' });
    firsInView(c, off, vw, base - 18, 0.85 * (1 - 0.72 * startOpen) * (1 - ss(0.45, 0.88, af) * 0.7), 13, 13, 1.05, '#1a3220');
    if (af < 0.62) {
      firsInView(c, off, vw, base - 8, 0.55 * (1 - 0.70 * startOpen) * (1 - ss(0.35, 0.62, af) * 0.5), 16, 31, 0.75, '#162818');
    }
    c.restore();
    if (af > 0.35 && af < 0.9 && window.Fauna && Fauna.drawChamois) {
      wx = 260; tx = wx - off; hy = base - 16;
      if (tx > -20 && tx < vw + 20) {
        Fauna.drawChamois(c, { x: tx, y: hy, face: 1, ph: Ev.time * 1.05 }, Ev.time);
        if (window.auditAnchor) { window.auditAnchor('van-chamois', tx, hy, hy); }
      }
    }
    if (af > 0.7 && window.Fauna && Fauna.drawIbex) {
      wx = 480; tx = wx - off; rockY = base - 6;
      if (tx > -20 && tx < vw + 20) {
        c.fillStyle = '#c8c2b6';
        c.beginPath(); c.moveTo(tx - 8, rockY + 2); c.quadraticCurveTo(tx, rockY - 4, tx + 9, rockY + 2); c.closePath(); c.fill();
        recede(c, tx, rockY, 0.62, function (c2) {
          Fauna.drawIbex(c2, { x: tx, y: rockY, face: -1, ph: Ev.time * 0.9 }, Ev.time);
        });
        if (window.auditAnchor) { window.auditAnchor('van-ibex-mid', tx, rockY, rockY); }
      }
    }
  }


  /* ---------- F-DA-08 : caches precalcules (zero allocation par frame) ---------- */
  var showerCache = { cvs: null, w: 0, h: 0 };
  var seaCache = { cvs: null, w: 0, h: 0 };

  function ensureCanvas(cache, w, h, paint) {
    w = Math.max(8, w | 0); h = Math.max(8, h | 0);
    if (cache.cvs && cache.w === w && cache.h === h) { return cache.cvs; }
    var cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    paint(cvs.getContext('2d'), w, h);
    cache.cvs = cvs; cache.w = w; cache.h = h;
    return cvs;
  }

  function paintShowerCumulus(c, x, y, s) {
    var lobes = [[0, 0, 16], [14, -5, 13], [-14, 1, 12], [26, 3, 10], [-25, 4, 9], [6, -9, 11], [-5, 5, 11]], i, L;
    var g = c.createLinearGradient(x, y - 22 * s, x, y + 10 * s);
    g.addColorStop(0, '#8a96a6');
    g.addColorStop(0.45, '#5a6878');
    g.addColorStop(1, '#2a3544');
    c.save();
    c.translate(x, y);
    c.scale(s, s * 0.92);
    c.beginPath();
    for (i = 0; i < lobes.length; i++) {
      L = lobes[i];
      c.moveTo(L[0] + L[2], L[1]);
      c.arc(L[0], L[1], L[2], 0, 7);
    }
    c.fillStyle = g;
    c.fill();
    /* leger lisere clair en haut, jamais blanc eclatant */
    c.beginPath();
    c.ellipse(2, -8, 11, 4.5, 0, 0, 7);
    c.fillStyle = 'rgba(180, 190, 200, 0.28)';
    c.fill();
    c.restore();
  }
  function paintShowerCurtain(c, x, y0, y1, n, seed) {
    var i, px, py, len;
    c.strokeStyle = 'rgba(200, 214, 228, 0.42)';
    c.lineWidth = 0.85;
    c.lineCap = 'round';
    for (i = 0; i < n; i++) {
      px = x - 28 + (i * 9 + ((seed * 13 + i * 7) % 5)) ;
      py = y0 + ((seed + i * 11) % 6);
      len = (y1 - y0) * (0.55 + ((seed + i) % 5) * 0.08);
      c.beginPath();
      c.moveTo(px, py);
      c.lineTo(px - 3, py + len);
      c.stroke();
    }
  }
  function paintShowerTile(c, w, h) {
    var i, x, y, s, dx, clouds;
    c.clearRect(0, 0, w, h);
    /* nuages dans le tiers superieur, avec des trous pour laisser voir les Alpes en dessous */
    clouds = [
      [0.08, 0.28, 0.72, 6],
      [0.26, 0.20, 1.05, 8],
      [0.48, 0.32, 0.58, 5],
      [0.68, 0.18, 0.88, 7],
      [0.90, 0.26, 0.70, 6]
    ];
    for (i = 0; i < clouds.length; i++) {
      x = clouds[i][0] * w;
      y = clouds[i][1] * h;
      s = clouds[i][2];
      for (dx = -w; dx <= w; dx += w) {
        paintShowerCurtain(c, x + dx, y + 10 * s, h * 0.92, clouds[i][3], i + 3);
        paintShowerCumulus(c, x + dx, y, s);
      }
    }
  }

  function drawReculetShowers(c, vw, base, t) {
    var tileW = 720, tileH = 130;
    var cvs = ensureCanvas(showerCache, tileW, tileH, paintShowerTile);
    var ox = ((t * 9) % tileW + tileW) % tileW;
    /* haut du ciel, au-dessus de la chaine alpine */
    var y = base - 152;
    c.save();
    c.drawImage(cvs, -ox, y);
    c.drawImage(cvs, tileW - ox, y);
    c.restore();
  }

  function paintSeaLobe(c, x, y, s) {
    var lobes = [[0, 0, 16], [13, -4, 13], [-13, -2, 12], [24, 2, 10], [-23, 2, 10], [5, -8, 11]], i, L;
    var g = c.createLinearGradient(x, y - 18 * s, x, y + 10 * s);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, '#f6f3ec');
    g.addColorStop(0.85, '#dce4ec');
    g.addColorStop(1, '#c8d2dc');
    c.save();
    c.translate(x, y);
    c.scale(s, s * 0.58);
    c.beginPath();
    for (i = 0; i < lobes.length; i++) {
      L = lobes[i];
      c.moveTo(L[0] + L[2], L[1]);
      c.arc(L[0], L[1], L[2], 0, 7);
    }
    c.moveTo(26, 8);
    c.ellipse(0, 8, 30, 7, 0, 0, 7);
    c.fillStyle = g;
    c.fill();
    c.restore();
  }
  function paintSeaTile(c, w, h) {
    var i, x, y, s, dx, holes;
    c.clearRect(0, 0, w, h);
    /* tapis dense et continu, petites lobes, raccord periodique */
    for (i = 0; i < 22; i++) {
      x = ((i * 0.055) + 0.02) * w;
      y = 0.36 * h + (i % 4) * 0.13 * h;
      s = 0.72 + (i % 5) * 0.08;
      for (dx = -w; dx <= w; dx += w) {
        paintSeaLobe(c, x + dx, y, s);
      }
    }
    for (i = 0; i < 12; i++) {
      x = ((i * 0.09) + 0.05) * w;
      y = 0.18 * h + (i % 2) * 0.06 * h;
      s = 0.80 + (i % 3) * 0.08;
      for (dx = -w; dx <= w; dx += w) {
        paintSeaLobe(c, x + dx, y, s);
      }
    }
    c.save();
    c.globalCompositeOperation = 'destination-out';
    holes = [[0.30, 0.68, 28, 10], [0.68, 0.76, 22, 8]];
    for (i = 0; i < holes.length; i++) {
      for (dx = -w; dx <= w; dx += w) {
        c.beginPath();
        c.ellipse(holes[i][0] * w + dx, holes[i][1] * h, holes[i][2], holes[i][3], 0, 0, 7);
        c.fill();
      }
    }
    c.restore();
  }

  function drawSeaOfClouds(c, vw, yTop, yBot, t) {
    var h = Math.max(36, (yBot - yTop) | 0), w = 800;
    if (h < 20) { return; }
    var cvs = ensureCanvas(seaCache, w, 72, paintSeaTile);
    var ox = ((t * 5) % w + w) % w;
    c.save();
    c.beginPath();
    c.rect(-24, yTop, vw + 48, h);
    c.clip();
    c.drawImage(cvs, -ox - 24, yTop, w, h);
    c.drawImage(cvs, w - ox - 24, yTop, w, h);
    c.restore();
  }

  function drawRidgeNeves(c, pts) {
    /* pts: [[x, y, rw, rh, rot], ...] plaques posees sur des pentes, jamais flottantes. */
    var i, p;
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      c.fillStyle = 'rgba(140, 150, 158, 0.45)';
      c.beginPath();
      c.ellipse(p[0], p[1] + 1.8, p[2] * 0.95, p[3] * 0.7, p[4], 0, 7);
      c.fill();
      c.fillStyle = '#f3f6fa';
      c.beginPath();
      c.ellipse(p[0], p[1], p[2], p[3], p[4], 0, 7);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.ellipse(p[0] - p[2] * 0.2, p[1] - p[3] * 0.25, p[2] * 0.45, p[3] * 0.4, p[4], 0, 7);
      c.fill();
      c.strokeStyle = 'rgba(150, 160, 170, 0.45)';
      c.lineWidth = 0.6;
      c.beginPath();
      c.ellipse(p[0], p[1], p[2], p[3], p[4], 0, 7);
      c.stroke();
    }
  }

  function drawPathNeves(c, xa, xb, E, H) {
    var x, g, h, rw, rh, ry, wx;
    for (x = Math.floor(xa / 40) * 40; x < xb + 40; x += 40) {
      h = E.hash(x, 411);
      if (h > 0.62 + 0.15 * (1 - H.af(x))) { continue; }
      wx = x + h * 16;
      g = H.gf(wx);
      if (!isFinite(g)) { continue; }
      rw = 10 + 8 * E.hash(x, 412);
      rh = 3.2 + 2.2 * E.hash(x, 413);
      ry = g + 0.6;
      c.fillStyle = 'rgba(150, 160, 168, 0.4)';
      c.beginPath();
      c.ellipse(wx, ry + 1.5, rw * 0.95, rh * 0.65, -0.12 + E.hash(x, 414) * 0.2, 0, 7);
      c.fill();
      c.fillStyle = '#f4f7fa';
      c.beginPath();
      c.ellipse(wx, ry, rw, rh, -0.12 + E.hash(x, 414) * 0.2, 0, 7);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.ellipse(wx - rw * 0.2, ry - rh * 0.25, rw * 0.4, rh * 0.35, -0.1, 0, 7);
      c.fill();
      c.strokeStyle = 'rgba(160, 170, 180, 0.5)';
      c.lineWidth = 0.55;
      c.beginPath();
      c.ellipse(wx, ry, rw, rh, -0.12 + E.hash(x, 414) * 0.2, 0, 7);
      c.stroke();
    }
  }

    function farVista(id) {
    /* Décors lointains ancrés : lacs en perspective, Alpes, villages en rive. */
    return function (c, vw, base, off, fn, Ev) {
      var yf = base - 8, yn = base + 24;
      var sx0 = Ev && Ev.feat && (Ev.feat.summitX || Ev.feat.summitStart);
      var atSummit = sx0 != null && Ev.cam && (sx0 - Ev.cam.x) > -60 && (sx0 - Ev.cam.x) < vw + 120;
      if (id === 'poupet') {
        drawPoupetVista(c, vw, base, off, Ev);
        return;
      }
      if (id === 'dor') {
        drawDorVista(c, vw, base, off, Ev);
        return;
      }
      if (id === 'van') {
        drawVanVista(c, vw, base, off, Ev);
        return;
      }
      if (id === 'reculet') {
        drawReculetShowers(c, vw, base, Ev && Ev.time || 0);
      }
      var openK = ss(0.78, 0.95, juraAf(Ev));
      /* Les finales L19-L21 ont leur propre ouverture de bassin (plus bas).
         On garde les collines pleine largeur pour La Dôle et le Colombier. */
      if (id !== 'colomby' && id !== 'reculet' && id !== 'neige' && openK < 0.999) {
        c.save(); c.globalAlpha = 1 - openK;
        c.fillStyle = '#6a8a50';
        c.beginPath();
        c.moveTo(-30, base + 6);
        c.quadraticCurveTo(0.22 * vw, base - 16, 0.48 * vw, base + 2);
        c.quadraticCurveTo(0.75 * vw, base - 12, vw + 30, base + 8);
        c.lineTo(vw + 30, base + 36);
        c.lineTo(-30, base + 36);
        c.closePath();
        c.fill();
        c.fillStyle = '#5a7a44';
        c.beginPath();
        c.moveTo(-30, base + 16);
        c.quadraticCurveTo(0.3 * vw, base + 2, 0.62 * vw, base + 14);
        c.quadraticCurveTo(0.85 * vw, base + 6, vw + 30, base + 18);
        c.lineTo(vw + 30, base + 40);
        c.lineTo(-30, base + 40);
        c.closePath();
        c.fill();
        c.restore();
      }
      if (id === 'colombier') {
        alpineFoothills(c, 0.72 * vw - off * 0.12, yf - 4, 1.1);
        alpineChain(c, 0.68 * vw - off * 0.12, yf - 18, 0.85, 0);
        montBlancMassif(c, 0.80 * vw - off * 0.12, yf - 28, 0.78, 1);
        if (!atSummit) {
          var bx = 0.48 * vw - off * 0.18;
          valleyShoulders(c, bx, yf + 1, yn + 10, vw * 0.14, vw * 0.16);
          perspectiveLake(c, {
            cx: bx, yFar: yf + 1, yNear: yn + 10,
            farHalf: vw * 0.10, nearHalf: vw * 0.26, skew: 12,
            pal: LAKEPAL.bourget, bowFar: 4, bowNear: 7,
            village: true, villageX: -vw * 0.07, villageSc: 0.7,
            village2: true, village2X: vw * 0.08, village2Sc: 0.5
          });
          c.fillStyle = '#3a5a32';
          c.beginPath();
          c.ellipse(bx + 16, yn + 4, 28, 12, 0, 0, 7);
          c.fill();
          windingRiver(c, [
            0.08 * vw, yn + 16,
            0.22 * vw, yn + 10,
            0.36 * vw, yn + 18,
            0.52 * vw, yn + 12,
            0.70 * vw, yn + 20
          ], 4.5, 'rgba(80, 140, 176, 0.8)');
        }
        return;
      }
      var shift = id === 'dole' ? 0.04 : (id === 'colomby' ? -0.04 : (id === 'reculet' ? 0.02 : -0.02));
      var v = id === 'dole' ? 0 : (id === 'colomby' ? 1 : (id === 'reculet' ? 2 : 0));
      var mbv = id === 'dole' ? 0 : (id === 'colomby' ? 1 : (id === 'reculet' ? 2 : 1));
      var lx = (0.50 + shift) * vw - off * 0.14;
      var summitK = ss(0.78, 0.95, juraAf(Ev));
      if (id === 'colomby' || id === 'reculet' || id === 'neige') {
        var mbSc = id === 'neige' ? (1.08 + 0.22 * summitK) : 0.72;
        var mbY = yf - (id === 'neige' ? 44 : 28);
        var chSc = id === 'neige' ? (0.98 + 0.12 * summitK) : 0.82;
        alpineFoothills(c, (0.70 + shift) * vw - off * 0.1, yf - 6, id === 'neige' ? 1.25 : 1.15);
        alpineChain(c, (0.62 + shift) * vw - off * 0.1, yf - (id === 'neige' ? 28 : 20), chSc, v);
        montBlancMassif(c, (0.78 + shift) * vw - off * 0.1, mbY, mbSc, mbv);
        if (id === 'neige') {
          dentsDuMidi(c, (0.54 + shift) * vw - off * 0.1, yf - 18, 0.42);
        }
        /* Nappe lointaine, tres aplatie, dans le bassin sous les Alpes
           (meme langage que horizonLake / L18), pas un trapeze flottant. */
        var lakeH = id === 'neige' ? 11 : (id === 'reculet' ? 10 : 12);
        var lakeHalf = vw * (id === 'reculet' ? 0.28 : (id === 'neige' ? 0.30 : 0.34));
        var lakeY = base - 10;
        horizonLake(c, {
          cx: lx, y: lakeY, half: lakeHalf, h: lakeH,
          pal: id === 'colomby' ? LAKEPAL.lemanGold : LAKEPAL.leman,
          goldRefl: id === 'colomby',
          village: true, villageX: -lakeHalf * 0.30, villageSc: 0.16,
          village2: true, village2X: lakeHalf * 0.26, village2Sc: 0.13
        });
        if (id === 'neige') {
          /* mer de nuages devant le bassin, sous la ligne de crete */
          drawSeaOfClouds(c, vw, base - 30, base + 0, Ev && Ev.time || 0);
        }
        /* cretes d'encadrement : au-dessus de la mer / du lac, centre ouvert */
        c.fillStyle = id === 'reculet' ? '#8a8a76' : (id === 'colomby' ? '#7a9a48' : '#6e8a58');
        c.beginPath();
        c.moveTo(-40, base + 40);
        c.lineTo(-40, base + 0);
        c.quadraticCurveTo(0.12 * vw, base - 8, 0.30 * vw, base + 2);
        c.lineTo(0.36 * vw, base + 40);
        c.closePath();
        c.fill();
        c.beginPath();
        c.moveTo(vw + 40, base + 40);
        c.lineTo(vw + 40, base + 0);
        c.quadraticCurveTo(0.86 * vw, base - 10, 0.70 * vw, base + 2);
        c.lineTo(0.64 * vw, base + 40);
        c.closePath();
        c.fill();
        c.fillStyle = id === 'reculet' ? '#6a6a58' : (id === 'colomby' ? '#5a7a38' : '#547044');
        c.beginPath();
        c.moveTo(-40, base + 40);
        c.quadraticCurveTo(0.12 * vw, base + 10, 0.28 * vw, base + 40);
        c.closePath();
        c.fill();
        c.beginPath();
        c.moveTo(vw + 40, base + 40);
        c.quadraticCurveTo(0.86 * vw, base + 10, 0.70 * vw, base + 40);
        c.closePath();
        c.fill();
        if (id === 'reculet') {
          c.strokeStyle = 'rgba(210, 210, 200, 0.45)'; c.lineWidth = 1.2;
          c.beginPath();
          c.moveTo(-40, base + 8);
          c.quadraticCurveTo(0.10 * vw, base - 22, 0.26 * vw, base + 4);
          c.moveTo(vw + 40, base + 8);
          c.quadraticCurveTo(0.88 * vw, base - 24, 0.72 * vw, base + 4);
          c.stroke();
        }
        if (id === 'neige') {
          drawRidgeNeves(c, [
            [0.08 * vw, base - 6, 26, 7.0, -0.28],
            [0.16 * vw, base + 2, 18, 5.2, -0.16],
            [0.22 * vw, base + 10, 13, 4.0, -0.10],
            [0.80 * vw, base - 4, 24, 6.5, 0.22],
            [0.88 * vw, base + 4, 16, 4.8, 0.16],
            [0.94 * vw, base + 12, 12, 3.8, 0.10]
          ]);
        }
      } else {
        alpineFoothills(c, (0.68 + shift) * vw - off * 0.1, yf - 4, 1.15);
        alpineChain(c, (0.64 + shift) * vw - off * 0.1, yf - 20, 0.80, v);
        montBlancMassif(c, (0.76 + shift) * vw - off * 0.1, yf - 26, 0.68, mbv);
        if (id === 'dole') {
          dentsDuMidi(c, (0.58 + shift) * vw - off * 0.1, yf - 16, 0.40);
        }
        valleyShoulders(c, lx,
          (yf + 2) + 8 * summitK,
          (yn + 10) + 12 * summitK,
          vw * (0.24 - 0.02 * summitK),
          vw * (0.24 - 0.02 * summitK));
        perspectiveLake(c, {
          cx: lx,
          yFar: (yf + 2) + 8 * summitK,
          yNear: (yn + 10) + 12 * summitK,
          farHalf: vw * (0.20 - 0.04 * summitK),
          nearHalf: vw * (0.34 - 0.06 * summitK),
          skew: 10 - 2 * summitK,
          pal: LAKEPAL.leman, bowFar: 4, bowNear: 8,
          village: true,
          villageX: -vw * (0.10 - 0.02 * summitK),
          villageSc: 0.62 - 0.12 * summitK,
          village2: true,
          village2X: vw * (0.09 - 0.02 * summitK),
          village2Sc: 0.48 - 0.08 * summitK
        });
        if (summitK > 0.02) {
          c.save(); c.globalAlpha = summitK;
          c.fillStyle = '#5a7a44';
          c.beginPath();
          c.moveTo(lx - vw * 0.36, yn + 10);
          c.quadraticCurveTo(lx, yn - 2, lx + vw * 0.36, yn + 12);
          c.lineTo(lx + vw * 0.4, yn + 28);
          c.lineTo(lx - vw * 0.4, yn + 28);
          c.closePath();
          c.fill();
          c.restore();
        }
      }
    };
  }

  function build(opt) {
    var id = opt.id, hi = !!opt.leman, alps = opt.alps !== false;
    var sky = opt.sky || skyFor(id);
    window.AlpineBuild({
      id: id, stairs: 'stone', summitReplace: true, noStrata: true,
      horizonHaze: opt.horizonHaze || (hi ? 'rgba(200, 220, 236, .22)' : 'rgba(220, 230, 200, .18)'),
      noHorizonBar: opt.noHorizonBar !== false,
      pal: PAL,
      tileAlpha: 0.36, depthTint: 'rgba(30, 36, 24, .12)', strataCol: '#3a4030',
      glow0: 'rgba(255, 236, 190, .16)', glow1: 'rgba(255, 220, 150, 0)', vig: 'rgba(24, 32, 36, .16)',
      rockPal: { hi: '#d8d4c8', mid: '#8a8678', lo: '#4a463c', line: '#2a2820', spot: 'rgba(110, 100, 80, .4)', rim: 'rgba(255, 248, 230, .5)' },
      tilePal: ['rgba(50, 48, 36, .22)', 'rgba(120, 150, 80, .16)', 'rgba(230, 230, 210, .10)', 'rgba(24, 22, 16, .26)'],
      sky: sky,
      bw: function (E, H) {
        return function (x) {
          var a = H.af(x), f = ss(0.10, 0.32, a) * (1 - ss(0.78, 0.96, a)), k = ss(0.80, 0.97, a);
          return [Math.max(0, 1 - f - k), f, 0, k];
        };
      },
      /* plus de bande d'eau pleine largeur : les lacs sont dans farDecor */
      drawSea: opt.drawSea,
      winZoomPort: opt.winZoomPort || 0.50, winZoomLand: opt.winZoomLand || 0.64, winLook: opt.winLook || 0.74,
      layers: function (E, H) { return vistaLayers(opt, E); },
      flora: function (E, H) {
        return {
          hazeCol: '#c8d4b0',
          rows: [
            { step: 24, seed: 14, haze: 0.18, fillTop: '#6a9850', fillBot: '#3e6840', up: function (x) { return 16 + 6 * E.nz(x / 140, 5); }, dens: function (x) { return (opt.firDens || 0.55) * (1 - ss(0.42, 0.82, H.af(x))); }, size: function () { return 20; }, kind: function () { return 'fir'; } },
            { step: 20, seed: 25, haze: 0.08, fillTop: '#7aa050', fillBot: '#4a7038', up: function (x) { return 8 + 3 * E.nz(x / 90, 6); }, dens: function (x) { return 0.24 * (1 - ss(0.55, 0.9, H.af(x))); }, size: function () { return 13; }, kind: function (x) { return id === 'neige' ? 'fir' : (E.hash(x, 45) > 0.55 ? 'fir' : 'beech'); } },
            { step: 16, seed: 36, haze: 0, fillTop: '#82a448', fillBot: '#546e3a', up: function () { return 3; }, dens: function (x) { return 0.16 * (1 - ss(0.7, 0.96, H.af(x))); }, size: function () { return 8; }, kind: function () { return 'bush'; } }
          ],
          lipMix: function (x) {
            var a = H.af(x), open = ss(0.22, 0.5, a);
            var g = E.mix('#7cb046', '#c8d86a', open);
            return { dens: 0.95 - 0.15 * open, grass: 1.7, fern: 0.5 * (1 - ss(0.7, 0.95, a)), heather: 0.08 * open, bush: 0.1 * (1 - open), broom: 0, flower: 0.1, gcol: E.mix(g, '#3a6a28', 0.2), gcol2: E.mix(g, '#e8f4a0', 0.5), fcol: '#3f8a3a' };
          }
        };
      },
      behind: opt.behind || function (c, xa, xb, bottom, E, H) {
        for (var x = Math.floor(xa / 48) * 48; x < xb + 48; x += 48) {
          var h = E.hash(x, 301); if (h > 0.5 + 0.3 * H.af(x)) { continue; }
          var rx = x + h * 36, r = 3 + 5 * E.hash(x, 303);
          var gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)), ry = gtop - r * 0.2;
          if (!isFinite(ry)) { continue; }
          A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
        }
      },
      props: opt.props,
      finds: opt.finds || {},
      summit: opt.summit
    });
  }

  /* 14. Mont Poupet — table d'orientation, banc, pâturages */
  build({
    id: 'poupet', alps: false, firDens: 0.42, winLook: 0.76,
    farDecor: farVista('poupet'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      var spots = [180, 420, 700], i, wx, tx, hy, af;
      af = poupetAf(Ev);
      /* plus de tertre-falaise isolé à carte blanche : le rebord est
         le sentier du sommet ; les cicatrices vivent dans le massif. */
      if (af >= 0.65 || atJuraSummit(Ev, vw)) { return; }
      for (i = 0; i < spots.length; i++) {
        wx = spots[i]; tx = wx - off; hy = base - fn(wx) + 2;
        if (tx > -20 && tx < vw + 20) {
          midDecorCow(c, tx, hy, Ev, Ev.time * 0.8 + i, 2, 'montbeliarde');
        }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['SALINS', 'LES-BAINS'], 44, 18, 3.1);
      boardIf(c, E, xa, xb, 102, ['851 m'], 30, 11, 3.3, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx - 36, ['POUPET'], 40, 12, 3.3, 30); }
    },
    finds: {
      table: function (c) { tableOrientation(c, 0, 6); },
      pasteur: function (c) {
        c.fillStyle = '#c8c0b0'; c.fillRect(-5, -4, 10, 8); c.strokeStyle = '#2a2820'; c.lineWidth = 0.6; c.strokeRect(-5, -4, 10, 8);
        c.fillStyle = '#4a6a88'; c.fillRect(-3.6, -2.6, 7.2, 5.2);
      },
      para: function (c) { findPara(c, 0, 4, 1.05); }
    },
    summit: function (c, sx, sy, E) {
      c.fillStyle = '#6a9844';
      c.beginPath();
      c.moveTo(sx - 70, sy + 6);
      c.quadraticCurveTo(sx - 40, sy - 2, sx - 8, sy + 1);
      c.quadraticCurveTo(sx + 30, sy - 3, sx + 72, sy + 5);
      c.quadraticCurveTo(sx + 40, sy + 10, sx, sy + 9);
      c.quadraticCurveTo(sx - 40, sy + 10, sx - 70, sy + 6);
      c.closePath(); c.fill();
      tableOrientation(c, sx - 26, sy);
      woodenBench(c, sx + 28, sy, 18);
      if (typeof woodenCross === 'function') { woodenCross(c, sx + 56, sy, 0.85); }
      else {
        c.strokeStyle = '#5a4a3a'; c.lineWidth = 1.4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(sx + 56, sy); c.lineTo(sx + 56, sy - 20); c.moveTo(sx + 48, sy - 15); c.lineTo(sx + 64, sy - 15); c.stroke();
      }
    }
  });

  /* 15. Mont d'Or — cairn 1463, rebord de la falaise est, Joux / Saint-Point / Alpes */
  build({
    id: 'dor', alps: true, firDens: 0.34,
    winLook: 0.66, winZoomPort: 0.56, winZoomLand: 0.70,
    farDecor: farVista('dor'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      drawDorMid(c, vw, base, off, fn, Ev);
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['ROCHEJEAN'], 44, 14, 3.0);
      boardIf(c, E, xa, xb, 102, ['1463 m'], 30, 11, 3.2, 26);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx - 40, ['MONT D\u2019OR'], 52, 14, 3.0, 30); }
    },
    finds: { borne: function (c) { borderStone(c, 0, 6, 0.85); }, chalet: function (c) { juraChalet(c, 0, 6, 0.85); }, epicea: function (c) { findSpruce(c, 0, 4, 1.15); } },
    summit: function (c, sx, sy, E) {
      dorEastCliff(c, sx, sy);
      /* mur + grillage typifiés d'après le marquage de frontière décrit
         (Altituderando / boucle PNR), le long du rebord, pas au mètre du cairn. */
      dryStoneWall(c, sx - 20, sx + 38, sy);
      woodenFence(c, sx - 18, sx + 36, sy);
      monumentalCairn(c, sx - 36, sy, 1.15);
      if (window.auditAnchor) { window.auditAnchor('dor-cairn', sx - 36, sy, sy); }
      recede(c, sx - 58, sy, 0.48, function (c2) { juraChalet(c2, sx - 58, sy, 1); });
      if (window.auditAnchor) { window.auditAnchor('dor-chalet-summit', sx - 58, sy, sy); }
    }
  });

  /* 16. Creux du Van — le Soliat au bord du cirque, clôture SAC, bouquetins au sol */
  build({
    id: 'van', alps: true, firDens: 0.48,
    winLook: 0.68, winZoomPort: 0.56, winZoomLand: 0.72,
    farDecor: farVista('van'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      drawVanMid(c, vw, base, off, fn, Ev);
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['NOIRAIGUE'], 40, 14, 2.9);
      boardIf(c, E, xa, xb, 98, ['14 CONTOURS'], 34, 14, 2.5, 26);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx - 44, ['SOLIAT', '1464 m'], 48, 20, 3.0, 36); }
    },
    finds: { soliat: function (c) { woodenCross(c, 0, 8, 0.55); }, mur: function (c) { findMur(c, 0, 4, 1); }, ibex: function (c) { findIbexIcon(c, 0, 4, 1.05); } },
    summit: function (c, sx, sy, E) {
      var t0, ix, iy;
      soliatCirque(c, sx, sy);
      /* mur de pierres sèches le long du rebord, typifié d'après les
         panoramas du plateau (pas seulement la clôture SAC). */
      dryStoneWall(c, sx - 70, sx - 44, sy + 1);
      dryStoneWall(c, sx + 50, sx + 120, sy + 2);
      woodenCross(c, sx - 36, sy, 1.05);
      if (window.auditAnchor) { window.auditAnchor('van-cross', sx - 36, sy, sy); }
      woodenFence(c, sx + 22, sx + 46, sy);
      tableOrientation(c, sx + 34, sy);
      if (window.auditAnchor) { window.auditAnchor('van-table', sx + 34, sy, sy); }
      /* a gauche du panneau (summitStart-44 = sx-134), pas dessus :
         sx-110 tombait au milieu de "SOLIAT". */
      recede(c, sx - 165, sy, 0.36, function (c2) { fermeSoliat(c2, sx - 165, sy, 1); });
      if (window.auditAnchor) { window.auditAnchor('van-ferme-summit', sx - 165, sy, sy); }
      /* bouquetins sur les blocs du rebord, pas dans le vide ni sur la pose */
      if (window.Fauna && Fauna.drawIbex) {
        t0 = (E && E.time) || 0;
        ix = sx + 62; iy = sy + 1;
        c.fillStyle = '#c8c2b6';
        c.beginPath(); c.moveTo(ix - 7, iy + 2); c.quadraticCurveTo(ix, iy - 3, ix + 8, iy + 2); c.closePath(); c.fill();
        c.save(); c.translate(ix, iy); c.scale(0.78, 0.78);
        Fauna.drawIbex(c, { x: 0, y: 0, face: -1, ph: t0 }, t0);
        c.restore();
        if (window.auditAnchor) { window.auditAnchor('van-ibex-a', ix, iy, iy); }
        ix = sx + 92; iy = sy + 2;
        c.fillStyle = '#beb8ac';
        c.beginPath(); c.moveTo(ix - 6, iy + 2); c.quadraticCurveTo(ix, iy - 2.4, ix + 7, iy + 2); c.closePath(); c.fill();
        c.save(); c.translate(ix, iy); c.scale(0.72, 0.72);
        Fauna.drawIbex(c, { x: 0, y: 0, face: 1, ph: t0 + 1.2 }, t0);
        c.restore();
        if (window.auditAnchor) { window.auditAnchor('van-ibex-b', ix, iy, iy); }
      }
    }
  });

  /* 17. Grand Colombier — croix métallique 16 m, table 1984, Bourget, Rhône */
  build({
    id: 'colombier', alps: true, firDens: 0.36,
    winLook: 0.48, winZoomPort: 0.45, winZoomLand: 0.62,
    farDecor: farVista('colombier'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      var spots = [180, 320, 480, 700], i, wx, tx, hy, j;
      for (i = 0; i < spots.length; i++) {
        wx = spots[i]; tx = wx - off; hy = base - fn(wx) + 2;
        if (tx < -20 || tx > vw + 20) { continue; }
        for (j = 0; j < 4; j++) {
          crocusTuft(c, tx - 10 + j * 7, hy - Ev.hash(wx + j, 21) * 2, 0.85, i * 3 + j);
        }
      }
      if (!atJuraSummit(Ev, vw)) {
        wx = 240; tx = wx - off; hy = base - fn(wx) + 2;
        if (tx > -20 && tx < vw + 20) {
          midDecorCow(c, tx, hy, Ev, Ev.time * 0.75, 1, 'estive');
        }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['CULOZ'], 36, 14, 3.1);
      boardIf(c, E, xa, xb, 94, ['1534 m'], 38, 11, 3.3, 26);
      var sx = E.feat && E.feat.summitStart;
      if (sx) {
        /* panneau décoratif en retrait, à gauche du sentier : pas une plateforme */
        var bx = sx - 92, bw = 52, gi, g, gs;
        if (xb > bx - 8 && xa < bx + bw + 8) {
          gi = Math.max(0, Math.min(E.len, (bx + bw / 2) | 0));
          g = E.G[gi];
          for (gs = 1; !isFinite(g) && gs < 400; gs++) {
            g = E.G[Math.max(0, gi - gs)];
            if (!isFinite(g)) { g = E.G[Math.min(E.len, gi + gs)]; }
          }
          if (isFinite(g)) {
            c.save();
            c.translate(bx + bw / 2, g);
            c.scale(0.82, 0.82);
            c.translate(-(bx + bw / 2), -g);
            E.board(c, bx, g - 36, bw, 20, ['GRAND', 'COLOMBIER'], 2.9);
            c.restore();
          }
        }
      }
    },
    finds: { tablecol: function (c) { tableOrientation(c, 0, 6); }, crocus: function (c) { findCrocus(c, -3, 4, 1); findCrocus(c, 3, 5, 0.85); }, croixcol: function (c) { ironCross(c, 0, 8, 0.42); } },
    summit: function (c, sx, sy, E) {
      colombierSlopes(c, sx, sy);
      /* Table 1984 à gauche du randonneur (marge gauche ~26 % en caméra
         « won »). Croix 16 m à droite : elle peut sortir en haut, pas sur
         le bord gauche. Recul 0.55, comme la tour TDF de la Rhune. */
      concreteTable(c, sx - 32, sy);
      metalCross16(c, sx + 22, sy);
      crocusTuft(c, sx - 48, sy, 0.8, 2);
      crocusTuft(c, sx + 28, sy, 0.95, 4);
      crocusTuft(c, sx + 82, sy, 0.85, 7);
    }
  });

  /* 18. La Dôle — radôme Skyguide à facettes, MétéoSuisse, Léman */
  build({
    id: 'dole', leman: true, alps: true, firDens: 0.28, winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.70,
    farDecor: farVista('dole'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      var wx = 240, tx = wx - off, hy = base - fn(wx) + 2;
      if (tx > -20 && tx < vw + 20 && window.Fauna && Fauna.drawChamois) {
        Fauna.drawChamois(c, { x: tx, y: hy, face: -1, ph: Ev.time * 1.1 }, Ev.time);
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['DAPPES'], 36, 12, 3.2);
      boardIf(c, E, xa, xb, 94, ['1677 m'], 38, 11, 3.3, 26);
    },
    finds: { dome: function (c) { whiteDome(c, 0, 8, 0.55); }, bornesuisse: function (c) { borderStone(c, 0, 6, 0.85); }, meteo: function (c) { findMeteo(c, 0, 6, 1.1); } },
    summit: function (c, sx, sy, E) {
      var HU = 37, M = HU / 1.75, G = E.G;
      function gAt(x) { var v = G && G[Math.max(0, Math.min(E.len || 0, x | 0))]; return (v != null && isFinite(v)) ? v : sy; }
      /* aire engazonnée autour de l'arrivée, fondue dans l'alpage (plus d'ellipse nette) */
      var lg = c.createRadialGradient(sx + 36, sy + 1, 6, sx + 36, sy + 2, 70);
      lg.addColorStop(0, 'rgba(150, 176, 90, 0.40)');
      lg.addColorStop(0.42, 'rgba(130, 158, 80, 0.22)');
      lg.addColorStop(1, 'rgba(120, 150, 70, 0)');
      c.fillStyle = lg;
      c.beginPath(); c.ellipse(sx + 36, sy + 2, 86, 11, 0, 0, 7); c.fill();
      var lg2 = c.createRadialGradient(sx - 10, sy + 1, 4, sx - 10, sy + 2, 34);
      lg2.addColorStop(0, 'rgba(140, 150, 110, 0.22)');
      lg2.addColorStop(1, 'rgba(140, 150, 110, 0)');
      c.fillStyle = lg2;
      c.beginPath(); c.ellipse(sx - 10, sy + 2, 38, 7, 0, 0, 7); c.fill();
      [[sx - 26, sy - 2, 5.5, 3.0, '#b0aa9a'], [sx - 30, sy - 5.2, 4.2, 2.4, '#8a8274'], [sx - 23, sy - 5.0, 3.8, 2.2, '#9a9284']].forEach(function (s) {
        c.beginPath(); c.ellipse(s[0], s[1], s[2], s[3], 0, 0, 7);
        c.fillStyle = s[4]; c.fill(); c.strokeStyle = '#2a261e'; c.lineWidth = 0.5; c.stroke();
      });
      c.fillStyle = '#8a8680';
      c.fillRect(sx - 40, sy - 11, 3.2, 11);
      c.strokeStyle = '#2a2824'; c.lineWidth = 0.55; c.strokeRect(sx - 40, sy - 11, 3.2, 11);
      /* Un seul ensemble radar : bâtiment de pierre, sphère géodésique, antenne secondaire.
         Le petit radôme gris (meteoSuisse) n'est plus dessiné au sommet, pour éviter le doublon.
         Les textes des trouvailles, qui mentionnent les deux radômes réels, restent inchangés. */
      (function () {
        var ax = sx + 54, ay = gAt(sx + 54), sc = 0.24;
        /* antenne secondaire, à gauche du randonneur, plus basse que la sphère */
        (function () {
          var mx = sx - 18, my = gAt(sx - 18), i, yy;
          c.fillStyle = 'rgba(30, 24, 20, .25)';
          c.beginPath(); c.ellipse(mx, my + 1, 5, 1.6, 0, 0, 7); c.fill();
          c.strokeStyle = '#5a5e64'; c.lineWidth = 0.85; c.lineJoin = 'round';
          c.beginPath(); c.moveTo(mx - 2.4, my); c.lineTo(mx - 1.1, my - 38); c.lineTo(mx + 1.1, my - 38); c.lineTo(mx + 2.4, my); c.stroke();
          for (i = 0; i < 6; i++) {
            yy = my - 6 - i * 5.2;
            c.beginPath(); c.moveTo(mx - 2.2 + i * 0.18, yy); c.lineTo(mx + 2.2 - i * 0.18, yy); c.stroke();
            c.beginPath(); c.moveTo(mx - 2.0 + i * 0.16, yy); c.lineTo(mx + 1.6 - i * 0.14, yy - 5); c.stroke();
          }
          c.strokeStyle = '#6a6e74'; c.lineWidth = 0.8;
          c.beginPath(); c.arc(mx + 4.2, my - 24, 3.2, 0.2, 5.4); c.stroke();
          c.beginPath(); c.moveTo(mx + 0.8, my - 22); c.lineTo(mx + 3.4, my - 24); c.stroke();
        }());
        c.save();
        c.translate(ax, ay);
        c.scale(sc, sc);
        c.translate(-ax, -ay);
        skyguideStation(c, ax, ay, M);
        c.restore();
      }());
    }
  });

  /* 19. Colomby de Gex — pylône d'environ 10 m, balcon du Léman */
  build({
    id: 'colomby', leman: true, alps: true, firDens: 0.58, winZoomPort: 0.48, winLook: 0.72,
    horizonHaze: 'rgba(255, 210, 140, .20)',
    farDecor: farVista('colomby'),
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['FAUCILLE'], 40, 12, 3.1);
      boardIf(c, E, xa, xb, 98, ['1688 m'], 34, 11, 3.2, 26);
    },
    finds: { pylon: function (c) { pylon10(c, 0, 8, 0.7); }, stele: function (c) { findStele(c, 0, 6, 1); }, chamogex: function (c) { findChamois(c, 0, 4, 1.05); } },
    summit: function (c, sx, sy, E) {
      c.fillStyle = '#8a9860';
      c.beginPath(); c.ellipse(sx, sy + 2, 60, 8, 0, 0, 7); c.fill();
      pylon10(c, sx + 52, sy, (10 * (37 / 1.75)) / 34);
    }
  });

  /* 20. Le Reculet — croix de 1892, réserve, lynx discret */
  build({
    id: 'reculet', leman: true, alps: true, firDens: 0.22, winZoomPort: 0.47, winLook: 0.70,
    horizonHaze: 'rgba(160, 170, 180, .16)',
    farDecor: farVista('reculet'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      var wx = 520, vis = (Ev.time % 18) > 12 && (Ev.time % 18) < 16.5;
      if (!vis || !window.Fauna || !Fauna.drawLynx) { return; }
      var tx = wx - off, hy = base - fn(wx) + 4;
      if (tx > 10 && tx < vw - 10) { Fauna.drawLynx(c, tx, hy, 0.95, Ev.time, -1); }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['RNN'], 28, 11, 3.2);
      boardIf(c, E, xa, xb, 86, ['RECULET'], 36, 12, 3.2, 26);
    },
    finds: { croix: function (c) { ironCross(c, 0, 8, 0.55); }, tetra: function (c) { findTetraIcon(c, 0, 4, 1.05); }, lapiaz: function (c) { findLapiaz(c, 0, 4, 1.15); } },
    summit: function (c, sx, sy, E) {
      c.fillStyle = '#8a9860';
      c.beginPath(); c.ellipse(sx, sy + 2, 58, 8, 0, 0, 7); c.fill();
      /* Croix typifiée ~18 % plus petite pour tenir entière en 461 et 1280 (y compris cadrage de jeu). */
      ironCross(c, sx + 46, sy, (8.5 * (37 / 1.75)) / 36 * 0.70);
    },
    behind: function (c, xa, xb, bottom, E, H) {
      lapiaz(c, xa, xb, E, H, 410);
    }
  });

  /* 21. Crêt de la Neige — toit du massif, lapiaz, pins à crochets */
  build({
    id: 'neige', leman: true, alps: true, firDens: 0.18, winZoomPort: 0.48, winLook: 0.72,
    horizonHaze: 'rgba(186, 204, 220, .07)',
    farDecor: farVista('neige'),
    midDecor: function (c, vw, base, off, fn, Ev) {
      var wx = 680, vis = (Ev.time % 22) > 15 && (Ev.time % 22) < 19;
      if (vis && window.Fauna && Fauna.drawLynx) {
        var tx = wx - off, hy = base - fn(wx) + 4;
        if (tx > 10 && tx < vw - 10) { Fauna.drawLynx(c, tx, hy, 0.85, Ev.time, 1); }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['RESERVE'], 40, 12, 3.1);
      boardIf(c, E, xa, xb, 98, ['1720 m'], 34, 11, 3.2, 26);
    },
    finds: { pin: function (c, f, E) { hookPine(c, 0, 6, 1.35, E && E.time, 2); }, neve: function (c) { findNeve(c, 0, 4, 1.55); }, geodes: function (c) { findGeodes(c, 0, 6, 1); } },
    summit: function (c, sx, sy, E) {
      c.fillStyle = '#a0a090';
      c.beginPath(); c.ellipse(sx, sy + 2, 64, 8, 0, 0, 7); c.fill();
      drawRidgeNeves(c, [
        [sx - 22, sy + 1, 16, 4.2, -0.12],
        [sx + 12, sy + 1.2, 13, 3.6, 0.08],
        [sx + 44, sy + 2, 11, 3.2, 0.14]
      ]);
      summitSpruce(c, sx + 48, sy, 54);
      summitSpruce(c, sx - 58, sy, 44);
      /* Borne IGN typifiée du sommet officiel (1718 m) + cairn calcaire.
         On n'inscrit pas « J1 » : ce nom désigne un rocher voisin mesuré par l'UNIL, non matérialisé pour le public. */
      (function () {
        var bx = sx + 20, by = sy, i;
        c.fillStyle = 'rgba(30, 24, 20, .28)';
        c.beginPath(); c.ellipse(bx + 3, by + 1.2, 11, 2.4, 0, 0, 7); c.fill();
        /* borne prismatique, lisible, plaque métallique sans texte */
        c.fillStyle = '#e2dece';
        c.beginPath();
        c.moveTo(bx - 3.4, by); c.lineTo(bx - 2.8, by - 17); c.lineTo(bx + 2.8, by - 17); c.lineTo(bx + 3.4, by); c.closePath();
        c.fill();
        c.strokeStyle = '#3a3832'; c.lineWidth = 0.7; c.stroke();
        c.fillStyle = '#c8c4b4';
        c.beginPath();
        c.moveTo(bx + 1.2, by); c.lineTo(bx + 1.0, by - 17); c.lineTo(bx + 2.8, by - 17); c.lineTo(bx + 3.4, by); c.closePath();
        c.fill();
        c.fillStyle = '#ece8dc'; c.fillRect(bx - 3.2, by - 18.6, 6.4, 1.8);
        c.strokeStyle = '#3a3832'; c.lineWidth = 0.55; c.strokeRect(bx - 3.2, by - 18.6, 6.4, 1.8);
        c.fillStyle = '#7a7e76'; c.fillRect(bx - 2.2, by - 12.4, 4.4, 3.4);
        c.strokeStyle = '#3a3e38'; c.lineWidth = 0.5; c.strokeRect(bx - 2.2, by - 12.4, 4.4, 3.4);
        c.fillStyle = '#c8ccc4'; c.fillRect(bx - 1.5, by - 11.6, 3.0, 0.5);
        /* cairn calcaire empilé, identifiable à côté de la borne */
        [[bx + 8.4, 5.2, 3.2, '#ddd8cc'], [bx + 11.2, 4.4, 2.6, '#c8c2b6'], [bx + 7.2, 4.0, 2.4, '#e8e4d8'], [bx + 9.6, 3.6, 3.4, '#d4d0c4']].forEach(function (s, k) {
          var yy = by - (k === 0 ? 0 : (k === 3 ? 6.4 : (k === 2 ? 3.2 : 2.8)));
          c.beginPath(); c.ellipse(s[0], yy - s[2] * 0.4, s[1], s[2], 0, 0, 7);
          c.fillStyle = s[3]; c.fill(); c.strokeStyle = '#3a3830'; c.lineWidth = 0.55; c.stroke();
        });
      }());
    },
    behind: function (c, xa, xb, bottom, E, H) {
      lapiaz(c, xa, xb, E, H, 520);
      drawPathNeves(c, xa, xb, E, H);
    }
  });

})();
