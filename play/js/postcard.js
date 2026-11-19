/* Carte postale du sommet : scène en pixel art générée (ciel, puys voisins, végétation selon l'altitude), randonneur du joueur, nom, altitude, temps. */
(function () {
  'use strict';
  var PW = 256, PH = 150, UP = 5;           // scène basse résolution 256 × 150, agrandie ×5 sans lissage
  var PXF = '"Press Start 2P", ui-monospace, monospace';

  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function rgb(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function vnoise(seed) {   // bruit de valeur 1D lissé
    var r = rng(seed), tab = []; for (var i = 0; i < 256; i++) { tab.push(r()); }
    return function (x) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return tab[i & 255] * (1 - u) + tab[(i + 1) & 255] * u; };
  }
  function vnoise2(seed) { var r = rng(seed), tab = []; for (var i = 0; i < 1024; i++) { tab.push(r()); } function h(x, y) { return tab[((x * 73 + y * 151) & 1023 + 1024) % 1024]; } return function (x, y) { var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); return (h(xi, yi) * (1 - ux) + h(xi + 1, yi) * ux) * (1 - uy) + (h(xi, yi + 1) * (1 - ux) + h(xi + 1, yi + 1) * ux) * uy; }; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); }
  function mmss(t) { t = Math.round(t); var m = Math.floor(t / 60), s = t % 60; return m + ':' + (s < 10 ? '0' : '') + s; }

  /* décor par niveau : ciel, relief voisin, étage de végétation (limite des arbres selon l'altitude réelle du sommet) */
  var SCN = {
    1: { sky: ['#5fb0e8', '#bfe3f4'], sun: [0.56, 0.24], haze: '#d6ecf2', far: ['#7f9fb8', '#8fb1b8'], farAmp: 14, mid: ['#4f7d58', '#6a9560'], rock: ['#5a3a34', '#8a5a48'], tree: 1.0, kind: 'puy', crater: true, ground: ['#6a8f4a', '#4a6e3a'] },
    2: { sky: ['#4aa2e6', '#cfeaf6'], sun: [0.5, 0.3], haze: '#dcf0f4', far: ['#7a9bb6', '#8cb0b8'], farAmp: 12, mid: ['#4b7a52', '#65935a'], rock: ['#4a3a3a', '#7a5a50'], tree: 1.0, kind: 'puy2', crater: true, ground: ['#6d8f4c', '#4d6f3b'] },
    3: { sky: ['#3f93e0', '#bfe0f2'], sun: [0.55, 0.22], haze: '#d3e6ee', far: ['#5f8a74', '#8fb59e'], farAmp: 26, mid: ['#6c8a52', '#7fa05a'], rock: ['#6e6c70', '#a29c98'], tree: 0.18, kind: 'horn', ground: ['#7da25a', '#5b8444'] },
    4: { sky: ['#52a6ea', '#d7edf6'], sun: [0.52, 0.2], haze: '#e0f0f2', far: ['#80a0b4', '#9bb8bc'], farAmp: 12, mid: ['#4f8052', '#6a9a58'], rock: ['#7a7860', '#a8a07a'], tree: 0.9, kind: 'dome', ground: ['#7aa352', '#587f43'] },
    5: { sky: ['#2f86dc', '#c4e2f4'], sun: [0.54, 0.2], haze: '#d4e8f2', far: ['#7a8fb2', '#a7bacb'], farAmp: 30, mid: ['#6a8a56', '#86a45e'], rock: ['#7a7478', '#b0aaa8'], tree: 0.0, kind: 'sancy', ground: ['#8aa866', '#688a4c'] },
    6: { sky: ['#7fa8cc', '#dfe9ee'], sun: [0.56, 0.3], haze: '#e4ecef', far: ['#8aa4b8', '#a9bec8'], farAmp: 12, mid: ['#58805a', '#729a62'], rock: ['#78766a', '#a4a090'], tree: 0.6, kind: 'dome2', ground: ['#80a458', '#5e8446'] },
    7: { sky: ['#4a8ad0', '#f0d8a8'], sun: [0.82, 0.28], haze: '#e8f0e0', far: ['#8aa07a', '#c0ccb0'], farAmp: 16, mid: ['#6a9844', '#8aba58'], rock: ['#8a8270', '#c8c0b0'], tree: 0.7, kind: 'ursuya', ground: ['#8aba50', '#5a8438'] },
    8: { sky: ['#5a86bc', '#e8d8b8'], sun: [0.76, 0.24], haze: '#e4ece8', far: ['#8a9aa8', '#c4cdd4'], farAmp: 22, mid: ['#5a8a40', '#8aaa58'], rock: ['#d0ccc0', '#8a8478'], tree: 0.55, kind: 'atxuria', ground: ['#6a8a48', '#c8c4b0'] },
    9: { sky: ['#4a82c4', '#f2d8a0'], sun: [0.8, 0.22], haze: '#e8efe4', far: ['#7a8a80', '#c0c8b8'], farAmp: 20, mid: ['#5a8a3c', '#86b054'], rock: ['#8a6a48', '#c4a078'], tree: 0.45, kind: 'orhy', ground: ['#6a8a40', '#8a6a40'] },
    10: { sky: ['#3e78b8', '#f0c888'], sun: [0.84, 0.26], haze: '#e6eee8', far: ['#7a98a8', '#c8dce4'], farAmp: 18, mid: ['#4e8438', '#7eaa4c'], rock: ['#7a6248', '#b89870'], tree: 0.6, kind: 'rhune', ground: ['#6a8c44', '#7a5a38'] },
    11: { sky: ['#4a86c0', '#ead4a4'], sun: [0.78, 0.24], haze: '#e8f0e4', far: ['#6a8a78', '#b8c8b0'], farAmp: 16, mid: ['#588c3c', '#84b450'], rock: ['#8a6644', '#c4a07a'], tree: 0.7, kind: 'artza', ground: ['#628844', '#7a5a38'] },
    12: { sky: ['#3a70b0', '#dce6f0'], sun: [0.7, 0.2], haze: '#e4ece8', far: ['#7a8a90', '#c4cdd0'], farAmp: 24, mid: ['#5a7a48', '#88a060'], rock: ['#8a8478', '#c8c0b0'], tree: 0.25, kind: 'aizkorri', ground: ['#7a8a58', '#8a7450'] },
    13: { sky: ['#4a88c8', '#f0d4a0'], sun: [0.8, 0.22], haze: '#e8efe0', far: ['#6a8a80', '#b8c8b4'], farAmp: 18, mid: ['#4e8a38', '#80b04c'], rock: ['#8a6e4c', '#c8b08a'], tree: 0.5, kind: 'txindoki', ground: ['#628a40', '#7a5c3a'] },
    14: { sky: ['#5a90c8', '#d8e8f4'], sun: [0.62, 0.22], haze: '#e8eef4', far: ['#a8b4c4', '#e0e8f0'], farAmp: 20, mid: ['#c4c0ac', '#d8d4c0'], rock: ['#d0ccc0', '#9a9688'], tree: 0.45, kind: 'jura', ground: ['#c8c8b4', '#8a9a70'] },
    15: { sky: ['#4a82bc', '#e8f0f6'], sun: [0.58, 0.2], haze: '#e6eef4', far: ['#b0bcc8', '#e8eef4'], farAmp: 22, mid: ['#c8c4b4', '#dcd8c8'], rock: ['#d8d4c8', '#a8a496'], tree: 0.3, kind: 'jura', ground: ['#d0d0c4', '#9aa880'] },
    16: { sky: ['#3a6eaa', '#d0e0ee'], sun: [0.55, 0.18], haze: '#dce6ee', far: ['#9aa8b8', '#d8e2ec'], farAmp: 28, mid: ['#b8b4a0', '#d0ccb8'], rock: ['#c8c4b8', '#8a8678'], tree: 0.2, kind: 'jura', ground: ['#c0c0b0', '#8a9478'] },
    17: { sky: ['#4a88c4', '#e0eef6'], sun: [0.66, 0.2], haze: '#e4eef4', far: ['#a0b0c0', '#e0e8f0'], farAmp: 24, mid: ['#c0bca8', '#d8d4c0'], rock: ['#d0ccc0', '#9a9688'], tree: 0.28, kind: 'jura', ground: ['#c8c8b4', '#8a9870'] },
    18: { sky: ['#5a8ec8', '#f0e8d0'], sun: [0.72, 0.24], haze: '#e8eef2', far: ['#a8b8c8', '#e4ecf2'], farAmp: 20, mid: ['#c4c0ac', '#dcd8c4'], rock: ['#d0ccc0', '#9a9688'], tree: 0.22, kind: 'jura', ground: ['#c8c8b0', '#8a986c'] },
    19: { sky: ['#3e78b8', '#f2c888'], sun: [0.8, 0.26], haze: '#eee4d4', far: ['#a8b4c0', '#e0e8f0'], farAmp: 18, mid: ['#c0bca8', '#d8d4c0'], rock: ['#d0ccc0', '#9a9688'], tree: 0.35, kind: 'jura', ground: ['#c4c8b0', '#8a9868'] },
    20: { sky: ['#3a4a68', '#8aa0b8'], sun: [0.7, 0.18], haze: '#c8d4e0', far: ['#9aa8b8', '#d0dce8'], farAmp: 20, mid: ['#b0b0a0', '#c8c8b8'], rock: ['#c8c4b8', '#8a8678'], tree: 0.18, kind: 'jura', ground: ['#b8b8a8', '#889070'] },
    21: { sky: ['#4a88c8', '#d8eaf6'], sun: [0.28, 0.2], haze: '#e8f0f6', far: ['#c8d4e0', '#f4f8fc'], farAmp: 26, mid: ['#d0ccc0', '#e8e4d8'], rock: ['#e0dcd0', '#b0aca0'], tree: 0.2, kind: 'jura', ground: ['#d0d0c4', '#a0a890'] }
  };

  /* ---------- scène en pixels ---------- */
  function scene(lv, seedx) {
    var src = SCN[lv.number] || SCN[1];
    var world = (lv.world === 3 || lv.number >= 14) ? 3 : ((lv.world === 2 || (lv.number >= 7 && lv.number <= 13)) ? 2 : 1);
    var S = { sky: src.sky, sun: src.sun, haze: src.haze, far: src.far, farAmp: src.farAmp, mid: src.mid, rock: src.rock, tree: src.tree, kind: src.kind, crater: src.crater, ground: src.ground };
    if (world === 1) {
      S.sky = [mix(src.sky[0], '#d87838', 0.28), mix(src.sky[1], '#ffd090', 0.48)];
      S.haze = mix(src.haze, '#f0c890', 0.4);
      S.ground = [mix(src.ground[0], '#c46a3a', 0.42), mix(src.ground[1], '#8a3a28', 0.48)];
      S.rock = [mix(src.rock[0], '#8a2e22', 0.42), mix(src.rock[1], '#c06038', 0.46)];
    }
    var c = document.createElement('canvas'); c.width = PW; c.height = PH; var g = c.getContext('2d'), R = rng(lv.number * 977 + (seedx || 0));
    g.imageSmoothingEnabled = false;
    function px(x, y, col) { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); }
    function rect(x, y, w, h, col) { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
    var horizon = 98;
    // ciel : bandes franches + tramage aux jointures
    var bands = 12, i, x, y;
    for (y = 0; y < PH; y++) {
      var t = Math.min(0.999, y / (horizon + 10)) * bands, b = Math.floor(t), f = t - b, c0 = mix(S.sky[0], S.sky[1], b / bands), c1 = mix(S.sky[0], S.sky[1], (b + 1) / bands);
      for (x = 0; x < PW; x++) { var dth = f > 0.5 && ((x + y) & 1) === 0 ? 1 : 0; if (f > 0.8) { dth = ((x + y) & 1) === 0 ? 1 : 1; } px(x, y, dth && f > 0.5 ? c1 : c0); }
    }
    // soleil
    var sx = Math.round(S.sun[0] * PW), sy = Math.round(S.sun[1] * horizon);
    [[17, 0.12], [12, 0.18], [9, 0.3]].forEach(function (h) { for (y = -h[0]; y <= h[0]; y++) { for (x = -h[0]; x <= h[0]; x++) { if (x * x + y * y <= h[0] * h[0] && ((x + y) & 1) === 0) { px(sx + x, sy + y, mix(S.sky[1], '#fff6c8', h[1] * 2.4)); } } } });
    for (y = -6; y <= 6; y++) { for (x = -6; x <= 6; x++) { if (x * x + y * y <= 30) { px(sx + x, sy + y, x * x + y * y <= 20 ? '#fffbe6' : '#fff1b8'); } } }
    // nuages : amas de pixels, dessus clair / dessous bleuté
    function cloud(cx, cy, w, h) {
      for (var yy = 0; yy < h; yy++) { var ww = Math.round(w * Math.sqrt(1 - Math.pow((yy - h * 0.55) / (h * 0.7), 2)) || 0); for (var xx = -ww; xx <= ww; xx++) { var n = Math.sin(xx * 0.31 + cx) * 1.6; if (yy + n < 0 || yy + n > h) { continue; } px(cx + xx, cy + yy, yy > h * 0.62 ? '#c9d9ea' : yy > h * 0.35 ? '#f3f7fb' : '#ffffff'); } }
    }
    var nc = 4 + Math.round(R() * 2); for (i = 0; i < nc; i++) { cloud(Math.round(R() * PW), 12 + Math.round(R() * 38), 14 + Math.round(R() * 20), 5 + Math.round(R() * 4)); }
    if (world === 1) {
      for (y = horizon - 26; y < horizon + 2; y++) {
        var tw = (y - (horizon - 26)) / 28;
        for (x = 0; x < PW; x++) { px(x, y, mix('#ffc078', '#ffe8bc', 1 - tw)); }
      }
    }
    if (world === 2) {
      /* mer : bande plus haute, lisible derrière les collines */
      for (y = horizon - 16; y < horizon + 8; y++) {
        var td = (y - (horizon - 16)) / 24;
        for (x = 0; x < PW; x++) {
          var gl = ((x + (y >> 1)) % 9 === 0) ? 0.1 : 0;
          px(x, y, mix('#3e88a8', '#d0eef4', td * 0.7 + gl));
        }
      }
    }

    // crêtes lointaines : relief voisin propre au niveau
    var N1 = vnoise(lv.number * 31 + 7), N2 = vnoise(lv.number * 57 + 3), N3 = vnoise(lv.number * 91 + 11);
    function ridge(fn, base, c0, c1, hazeT, snowY, lit) {
      for (x = 0; x < PW; x++) {
        var h = Math.round(base - fn(x)), face = 0;
        for (y = Math.max(0, h); y < PH; y++) {
          var xs2 = x + (y - h) * 0.9, sl2 = fn(xs2 + 4) - fn(xs2 - 4); face = sl2 > 1.8 ? 1 : sl2 < -1.8 ? -1 : 0;
          var dep = Math.min(1, (y - h) / 46), band = Math.floor(dep * 4) / 4, col = mix(c0, c1, band);
          if (face > 0) { col = mix(col, '#ffffff', 0.16); } else if (face < 0) { col = mix(col, '#1a2246', 0.2); }
          if ((y - h) % 6 === 3 && ((x + (y >> 1)) & 1) === 0) { col = mix(col, face < 0 ? '#1a2246' : '#ffffff', 0.08); }   // strates tramées
          col = mix(col, S.haze, hazeT);
          if (y - h < 1) { col = mix(col, '#ffffff', lit); }
          if (snowY != null && y < snowY(x)) { var dd2 = y - h; col = face < 0 ? (dd2 < 3 ? '#cfdcec' : '#dbe6f2') : (dd2 < 2 ? '#ffffff' : (((x + y) & 1) && dd2 < 5 ? '#e8f0f8' : '#f6f9fd')); }
          px(x, y, col);
        }
      }
    }
    var kind = S.kind;
    function conesFn(n, hmin, hmax, wmin, wmax, craterP) {
      var list = [], k0, spacing = PW / n; for (k0 = 0; k0 < n + 1; k0++) { list.push([k0 * spacing + (R() - 0.5) * spacing * 0.7, hmin + R() * (hmax - hmin), wmin + R() * (wmax - wmin), R() < craterP]); }
      return function (x) { var v = 0; list.forEach(function (q) { var d = Math.abs(x - q[0]) / q[2]; if (d >= 1) { return; } var h = Math.min(q[1], q[1] * (1 - d) * 1.6); h = h > q[1] * 0.85 ? q[1] * (0.85 + 0.15 * Math.sqrt((h / q[1] - 0.85) / 0.15)) : h; if (q[3] && d < 0.2) { h -= q[1] * 0.2 * (1 - Math.pow(d / 0.2, 2)); } v = Math.max(v, h); }); return v + (N2(x * 0.35) - 0.5) * 1.6; };
    }
    /* Dessin dédié : cône volcanique arrondi (pas le shader de crête, trop anguleux). */
    function paintPuy(cx, baseY, H, W, opt) {
      opt = opt || {};
      var crater = opt.crater || 0, craterH = opt.craterH || H * 0.2, nested = opt.nested || 0, nestedH = opt.nestedH || H * 0.26;
      var grass = opt.grass || '#6a8a4a', rock = opt.rock || '#8a4a30', haze = opt.haze || 0;
      var x, y, t, hHere, top, col, dep, ct, nt;
      for (x = Math.floor(cx - W) - 1; x <= Math.ceil(cx + W) + 1; x++) {
        t = (x - cx) / W;
        if (t <= -1 || t >= 1) { continue; }
        hHere = H * Math.pow(1 - t * t, 0.62);
        var inCrater = crater && Math.abs(t) < crater;
        if (inCrater) {
          ct = Math.abs(t) / crater;
          hHere -= craterH * (1 - ct * ct);
        }
        if (nested && Math.abs(t) < nested) {
          nt = Math.abs(t) / nested;
          hHere += nestedH * Math.pow(1 - nt * nt, 0.7);
        }
        top = Math.round(baseY - hHere);
        for (y = Math.max(0, top); y < PH; y++) {
          dep = (y - top) / Math.max(1, H);
          col = mix(grass, rock, Math.min(1, dep * 0.28 + Math.abs(t) * 0.22));
          if (t < -0.12) { col = mix(col, '#ffe2a8', 0.14); }
          if (t > 0.18) { col = mix(col, '#3a2218', 0.15); }
          if (inCrater && (y - top) < craterH * 0.7) { col = mix(col, '#4a2818', 0.35); }
          if (crater && !inCrater && Math.abs(t) < crater + 0.08 && y === top) { col = mix(rock, '#3a1c10', 0.4); }
          if (y === top && !inCrater) { col = mix(col, '#fff3c8', 0.22); }
          if (haze) { col = mix(col, S.haze, haze); }
          px(x, y, col);
        }
      }
    }
    if (world === 3) {
      /* Alpes : bande lointaine, basse et pâle, seulement à droite.
         Poupet (L14) est loin du Léman : pas de chaîne, juste la mer de nuages. */
      (function () {
        var peaks = [], pi, x, t, hHere, top, y, col, pk;
        if (lv.number >= 18) { peaks = [[214, 5, 9], [232, 9, 11], [248, 5, 8]]; }
        else if (lv.number >= 16) { peaks = [[236, 5, 8]]; }
        for (pi = 0; pi < peaks.length; pi++) {
          pk = peaks[pi];
          for (x = pk[0] - pk[2]; x <= pk[0] + pk[2]; x++) {
            t = (x - pk[0]) / pk[2];
            if (t * t >= 1) { continue; }
            hHere = pk[1] * Math.pow(1 - Math.abs(t), 0.92);
            if (lv.number >= 18 && pi === 1 && Math.abs(t) < 0.28) { hHere += 2 * (1 - Math.abs(t) / 0.28); }
            top = Math.round(horizon - 14 - hHere);
            for (y = Math.max(0, top); y < horizon - 8; y++) {
              col = mix('#d8e2ec', '#eef3f8', (y - top) / 8);
              col = mix(col, S.haze || '#e8eef4', 0.62);
              if (y < top + 2) { col = mix(col, '#ffffff', 0.4); }
              px(x, y, col);
            }
          }
        }
      }());
      /* mer de nuages basse, soufflée, avec des trous — pas une muraille neigeuse */
      (function () {
        var yb, xb, ncl, cap;
        for (yb = horizon - 10; yb < horizon + 12; yb++) {
          for (xb = 0; xb < PW; xb++) {
            ncl = N1(xb * 0.06 + 2) * 0.55 + N2(xb * 0.15 + yb * 0.06) * 0.45;
            cap = horizon - 5 - ncl * 5 - Math.sin(xb * 0.05) * 1.5;
            if (yb >= cap && ncl > 0.28) {
              px(xb, yb, mix('#f2f6fa', '#c4d2e0', Math.min(1, (yb - cap) / 16) * 0.65 + ncl * 0.12));
            }
          }
        }
      }());
      /* crête calcaire claire du Jura, herbe au faîte, lits visibles */
      (function () {
        var x, y, hHere, top, col, band;
        for (x = 0; x < PW; x++) {
          hHere = 12 + 7 * N2(x * 0.04 + 1) + 3 * Math.sin(x * 0.03);
          top = Math.round(horizon + 16 - hHere);
          for (y = Math.max(0, top); y < PH; y++) {
            band = Math.floor((y - top) / 3) % 3;
            col = band === 0 ? '#e8e2ce' : (band === 1 ? '#d4cdb8' : '#c4bca8');
            if ((y - top) < 3) { col = mix('#8aaa68', col, 0.45); }
            if (y === top) { col = mix('#9cbc70', '#f6f2e6', 0.35); }
            if (((x + y) % 9) === 0) { col = mix(col, '#9a9484', 0.2); }
            px(x, y, col);
          }
        }
      }());
    } else if (world === 2) {
      /* crêtes pyrénéennes, laissées un peu plus basses pour laisser voir la mer */
      ridge(function (x) {
        var d = Math.abs(x - 208);
        return 6 + Math.max(0, 22 - d * 0.34) + 8 * Math.abs(Math.sin(x * 0.028 + 2)) + 5 * N2(x * 0.06);
      }, horizon + 2, '#6a7a70', '#b0b8a8', 0.2, null, 0.22);
      /* collines vertes pastorales */
      ridge(function (x) { return 5 + 10 * N1(x * 0.035 + 3) + 4 * Math.sin(x * 0.03) + (N3(x * 0.2) - 0.5) * 3; }, horizon + 16, '#4e8a38', '#86b454', 0.08, null, 0.16);
    } else {
      /* Monde 1 — Chaîne des Puys : cônes arrondis verts et bruns, cratères, lumière chaude. */
      paintPuy(28, horizon + 2, 16, 32, { grass: '#7a8a68', rock: '#8a6a58', haze: 0.45 });
      paintPuy(70, horizon + 1, 20, 36, { grass: '#6e8458', rock: '#8a5a40', haze: 0.4, crater: 0.22, craterH: 5 });
      paintPuy(118, horizon, 18, 34, { grass: '#74885c', rock: '#7a4e38', haze: 0.42 });
      paintPuy(168, horizon + 2, 15, 30, { grass: '#6a8060', rock: '#8a5840', haze: 0.46, crater: 0.2, craterH: 4 });
      paintPuy(214, horizon + 1, 19, 38, { grass: '#70845a', rock: '#8a5038', haze: 0.4 });
      if (kind === 'puy2') {
        paintPuy(52, horizon + 22, 44, 58, { grass: '#5a8a40', rock: '#8a4a30', crater: 0.44, craterH: 16, nested: 0.22, nestedH: 13 });
        paintPuy(210, horizon + 20, 36, 50, { grass: '#5e8440', rock: '#7a4a30', crater: 0.3, craterH: 11 });
      } else if (kind === 'dome' || kind === 'dome2') {
        paintPuy(50, horizon + 22, 38, 52, { grass: '#5c8a42', rock: '#8a4e32', crater: 0.38, craterH: 14 });
        paintPuy(204, horizon + 18, 34, 78, { grass: '#6a8c4c', rock: '#9a6a48' });
      } else if (kind === 'sancy' || kind === 'horn') {
        paintPuy(48, horizon + 20, 40, 54, { grass: '#5a7a48', rock: '#8a5a40', crater: 0.22, craterH: 8 });
        paintPuy(210, horizon + 18, 34, 50, { grass: '#5c7e46', rock: '#7a4a30' });
      } else {
        paintPuy(54, horizon + 22, 42, 56, { grass: '#5c8c42', rock: '#8a4a30', crater: 0.4, craterH: 16 });
        paintPuy(208, horizon + 20, 36, 52, { grass: '#5a8640', rock: '#8a4a2e', crater: 0.32, craterH: 12 });
      }
    }

    // arbres : pins, pins à crochets (Jura) ou végétation basque plus rase
    function pine(px0, py0, h, col, hl) { for (var j = 0; j < h; j++) { var w = Math.round((j / h) * (h * 0.36)) + (j > 1 ? 1 : 0); rect(px0 - w, py0 - h + j, w * 2 + 1, 1, j % 3 === 0 ? hl : col); } rect(px0, py0, 1, 2, '#3a2a20'); }
    function hookPinePx(px0, py0, h, col, hl) {
      var j, w;
      for (j = 0; j < h; j++) {
        w = Math.round((j / h) * (h * 0.28)) + (j > 1 ? 1 : 0);
        if (j > h * 0.35 && (j % 3 === 0)) { rect(px0 - w - 2, py0 - h + j, 2, 1, hl); rect(px0 + w + 1, py0 - h + j + 1, 2, 1, col); }
        rect(px0 - w, py0 - h + j, w * 2 + 1, 1, j % 3 === 0 ? hl : col);
      }
      rect(px0, py0, 1, 2, '#3a2a20');
    }
    function bush(px0, py0, r, col, hl) {
      var yy, xx;
      for (yy = -r; yy <= 1; yy++) { for (xx = -r; xx <= r; xx++) { if (xx * xx + yy * yy * 1.4 <= r * r) { px(px0 + xx, py0 + yy, yy < -r * 0.3 ? hl : col); } } }
    }
    function treeRow(y0, ymax, n, hmin, hmax, dark) {
      var xs = []; for (i = 0; i < n; i++) { xs.push(R() * PW); } xs.sort(function (a, b) { return a - b; });
      xs.forEach(function (tx, k) {
        var ty = y0 + R() * (ymax - y0), th = hmin + R() * (hmax - hmin);
        if (world === 1 && ((tx > 28 && tx < 82) || (tx > 180 && tx < 236) || (tx > 88 && tx < 122))) { return; }
        if (world === 3) { hookPinePx(Math.round(tx), Math.round(ty), Math.round(th), dark ? '#1e3a2a' : '#2a4e34', dark ? '#2e5a40' : '#3c6e48'); }
        else if (world === 2) { bush(Math.round(tx), Math.round(ty), Math.round(th * 0.45 + 1), dark ? '#2a5a28' : '#3c7a34', dark ? '#4a8a30' : '#6aaa40'); }
        else { pine(Math.round(tx), Math.round(ty), Math.round(th), dark ? '#254a36' : '#2f6240', dark ? '#356a46' : '#438554'); }
      });
    }
    var treeN = Math.round(120 * S.tree);
    if (world === 2) { treeN = Math.round(70 * (S.tree || 0.5)); }
    if (world === 3) { treeN = Math.round(40 * (S.tree || 0.3) + 8); }
    if (treeN > 4) { treeRow(horizon + 8, horizon + 22, Math.round(treeN * 0.9), world === 2 ? 4 : 6, world === 2 ? 8 : 11, true); }
    // premier plan : pente herbeuse / rocheuse + sentier
    var gy = 118, GN = vnoise(lv.number * 5 + 1), GN2 = vnoise2(lv.number * 5 + 9);
    for (x = 0; x < PW; x++) {
      var top = Math.round(gy + 3 * GN(x * 0.05) - 8 * Math.exp(-Math.pow((x - 100) / 60, 2)));
      for (y = top; y < PH; y++) {
        var d = y - top, col = d < 1 ? mix(S.ground[0], '#ffffff', 0.18) : mix(S.ground[0], S.ground[1], Math.min(1, d / 30));
        if (world === 1) {
          if (((x * 7 + y * 13) % 11) === 0 && d > 2) { col = mix(col, '#6a2818', 0.28); }
          if (((x * 5 + y * 3) % 17) === 0) { col = mix(col, '#e8a060', 0.16); }
        } else if (world === 2) {
          if (((x * 7 + y * 13) % 11) === 0 && d > 2) { col = mix(col, '#3a4a22', 0.18); }
          if (((x * 5 + y * 3) % 17) === 0) { col = mix(col, '#c8d66a', 0.16); }
        } else {
          /* bancs calcaires lisibles : lits horizontaux pâles, joints, herbe dans les fentes */
          var bed = Math.floor(d / 4);
          col = (bed % 2 === 0) ? mix('#e6e0cc', '#c8c2ae', Math.min(1, d / 28)) : mix('#d4ceba', '#b8b29e', Math.min(1, d / 28));
          if (d % 4 === 0) { col = mix(col, '#8a8678', 0.28); }
          if (((x * 5 + y * 3) % 17) === 0) { col = mix(col, '#8aaa68', 0.22); }
          if (d < 2) { col = mix('#f2eee0', col, 0.4); }
        }
        if (world !== 3) { var rn = GN2(x * 0.09, y * 0.16) * 0.7 + GN2(x * 0.3, y * 0.5) * 0.3; if (rn > (kind === 'puy' || kind === 'puy2' ? 0.62 : 0.6) && d > 3) { col = mix(S.rock[0], S.rock[1], Math.min(1, (rn - 0.55) * 3) * 0.7 + ((x + y) % 3 === 0 ? 0.12 : 0)); } }
        px(x, y, col);
      }
    }
    // rochers épars (matière de la montagne)
    for (i = 0; i < 14; i++) { var rx = Math.round(R() * PW), ry = 124 + Math.round(R() * 22), rw = 3 + Math.round(R() * 6); rect(rx, ry, rw, 2, S.rock[1]); rect(rx + 1, ry - 1, rw - 2, 1, mix(S.rock[1], '#fff', 0.3)); rect(rx, ry + 2, rw, 1, S.rock[0]); }
    if (world === 2) {
      for (i = 0; i < 26; i++) {
        var gyb = 116 + Math.round(R() * 20), yel = R() < 0.66;
        bush(Math.round(8 + R() * (PW - 16)), gyb, 2 + Math.round(R() * 3), yel ? '#c8a028' : '#3a6a28', yel ? '#f0d050' : '#68a038');
      }
    }
    // repère de sommet selon le lieu
    function cairn(cx, cy) { [[10, 4, '#8b8190'], [7, 4, '#9d94a0'], [5, 3, '#aea6b0'], [3, 2, '#c0b8c0']].reduce(function (yy, r) { rect(cx - r[0] / 2, yy - r[1], r[0], r[1], r[2]); rect(cx - r[0] / 2, yy - r[1], r[0], 1, mix(r[2], '#fff', 0.3)); rect(cx - r[0] / 2, yy - 1, r[0], 1, mix(r[2], '#000', 0.25)); return yy - r[1]; }, cy); }
    if (world === 1 && (kind === 'dome' || kind === 'dome2')) {   // relais + gare du sommet (silhouette)
      rect(204, 82, 2, 38, '#e8e8ee'); rect(204, 82, 1, 38, '#fff'); for (y = 86; y < 116; y += 6) { rect(204, y, 2, 1, '#e0452b'); }
      rect(190, 112, 40, 8, '#cfcab8'); rect(190, 112, 40, 1, '#f1eddc'); rect(194, 114, 5, 4, '#6a98c0'); rect(202, 114, 5, 4, '#6a98c0'); rect(210, 114, 5, 4, '#6a98c0'); rect(218, 114, 5, 4, '#6a98c0'); rect(188, 110, 44, 2, '#6a665c');
    }
    if (world === 3) {
      cairn(176, 129);
      /* petite borne claire, sans inscription */
      rect(168, 122, 5, 8, '#d8d4c8'); rect(168, 122, 5, 1, '#f0ece0'); rect(169, 124, 3, 2, '#8a8a80');
    } else {
      cairn(176, 129);
    }
    return c;
  }

  /* randonneur : dessiné avec le moteur du jeu à basse résolution puis « pixelisé » (alpha binaire) */
  function hikerSprite(ch, face) {
    var W = 96, H = 96, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    window.Art.drawHiker(g, { x: W / 2, y: H - 14, face: face || 1, t: 0.2, phase: 0.1, move: 0, air: false, vy: 0, sq: 0, hurt: 0, drink: 0, cele: 1, slope: 0, scale: 1.15, stride: 5, char: ch, shadow: false });
    var id = g.getImageData(0, 0, W, H), d = id.data, i;
    for (i = 0; i < d.length; i += 4) { if (d[i + 3] < 120) { d[i + 3] = 0; } else { d[i + 3] = 255; d[i] = Math.round(d[i] / 14) * 14; d[i + 1] = Math.round(d[i + 1] / 14) * 14; d[i + 2] = Math.round(d[i + 2] / 14) * 14; } }
    // contour sombre 1 px
    var out = g.createImageData(W, H), o = out.data, x, y, k;
    for (y = 0; y < H; y++) { for (x = 0; x < W; x++) { var p = (y * W + x) * 4; if (d[p + 3]) { o[p] = d[p]; o[p + 1] = d[p + 1]; o[p + 2] = d[p + 2]; o[p + 3] = 255; } else { var near = false; for (k = 0; k < 4; k++) { var nx = x + [1, -1, 0, 0][k], ny = y + [0, 0, 1, -1][k]; if (nx >= 0 && ny >= 0 && nx < W && ny < H && d[(ny * W + nx) * 4 + 3]) { near = true; } } if (near) { o[p] = 28; o[p + 1] = 20; o[p + 2] = 36; o[p + 3] = 255; } } } }
    g.putImageData(out, 0, 0); return c;
  }
  function flagSprite() {
    var c = document.createElement('canvas'); c.width = 28; c.height = 40; var g = c.getContext('2d');
    g.fillStyle = '#1c1424'; g.fillRect(2, 0, 3, 40); g.fillStyle = '#d0a46a'; g.fillRect(3, 1, 1, 39);
    var pts = [[5, 2, 22, 3], [5, 3, 23, 9], [5, 9, 20, 3]]; g.fillStyle = '#1c1424'; g.fillRect(4, 2, 23, 13);
    g.fillStyle = '#e0452b'; g.fillRect(5, 3, 21, 11); g.fillStyle = '#ff7a5a'; g.fillRect(5, 3, 21, 2); g.fillStyle = '#fff'; g.fillRect(12, 6, 3, 3);
    g.fillStyle = '#ffd34d'; g.fillRect(1, 0, 5, 2); return c;
  }

  function compose(opt) {
    var lv = opt.lv, st = opt.stats || {}, stars = opt.stars || 0, ch = opt.character || 'boy';
    var CW = 1360, B = 40, picW = PW * UP, picH = PH * UP, CH = B + picH + 190 + 20;
    var cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; var c = cv.getContext('2d');
    // papier
    c.fillStyle = '#f5eedb'; c.fillRect(0, 0, CW, CH);
    var R = rng(5), i; for (i = 0; i < 2200; i++) { c.fillStyle = 'rgba(120,96,60,' + (0.03 + R() * 0.05) + ')'; c.fillRect(R() * CW, R() * CH, 2 + R() * 3, 2); }
    c.strokeStyle = '#2a1a1a'; c.lineWidth = 4; c.strokeRect(2, 2, CW - 4, CH - 4); c.strokeStyle = 'rgba(120,96,60,.5)'; c.lineWidth = 2; c.strokeRect(12, 12, CW - 24, CH - 24);
    // scène
    var sc = scene(lv, 0), g0 = document.createElement('canvas'); g0.width = PW; g0.height = PH; var g = g0.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sc, 0, 0);
    var hs = hikerSprite(ch, 1), fl = flagSprite(), px0 = 126, py0 = 126;
    // ombre portée au sol (pixels)
    g.fillStyle = 'rgba(30,24,40,.28)'; g.fillRect(px0 - 11, py0 + 1, 24, 2); g.fillRect(px0 - 8, py0 + 3, 18, 1);
    g.drawImage(fl, px0 + 14, py0 - 34); g.drawImage(hs, px0 - 48, py0 - 82);
    // vignette tramée discrète
    for (var yy = 0; yy < PH; yy++) { for (var xx = 0; xx < PW; xx++) { var dd = Math.hypot((xx - PW / 2) / PW, (yy - PH / 2) / PH); if (dd > 0.52 && ((xx + yy) & 1) === 0) { g.fillStyle = 'rgba(20,10,40,' + Math.min(0.28, (dd - 0.5) * 0.9) + ')'; g.fillRect(xx, yy, 1, 1); } } }
    c.imageSmoothingEnabled = false; c.drawImage(g0, 0, 0, PW, PH, B, B, picW, picH);
    c.strokeStyle = '#1c1424'; c.lineWidth = 6; c.strokeRect(B - 3, B - 3, picW + 6, picH + 6); c.strokeStyle = '#fff8e8'; c.lineWidth = 2; c.strokeRect(B + 6, B + 6, picW - 12, picH - 12);

    // titre « bons baisers » sur le ciel
    function ptext(t, x, y, size, col, align, sh) { c.font = size + 'px ' + PXF; c.textAlign = align || 'left'; c.textBaseline = 'top'; if (sh !== false) { c.fillStyle = '#1c1424'; c.fillText(t, x + size * 0.12, y + size * 0.12); c.fillText(t, x - size * 0.1, y); c.fillText(t, x, y - size * 0.1); } c.fillStyle = col; c.fillText(t, x, y); }
    var jura = (lv.world === 3) || lv.number >= 14;
    var basque = !jura && ((lv.world === 2) || (lv.number >= 7 && lv.number <= 13));
    var massifLine = jura ? 'DU JURA !' : (basque ? 'DU PAYS BASQUE' : 'DES VOLCANS !');
    var tampon = jura ? 'JURA' : (basque ? 'PAYS BASQUE' : 'AUVERGNE');
    ptext('BONS BAISERS', B + 36, B + 30, 30, '#fff3c4', 'left'); ptext(massifLine, B + 36, B + 74, 22, '#ffd34d', 'left');

    // timbre + cachet
    var tx = CW - B - 44 - 150, ty = B + 28, tw = 150, th = 190;
    c.save(); c.fillStyle = '#fff8e8'; c.beginPath(); c.rect(tx, ty, tw, th); c.fill(); c.fillStyle = '#f5eedb';
    for (i = 0; i < 9; i++) { c.beginPath(); c.arc(tx + 8 + i * (tw - 16) / 8, ty, 7, 0, 7); c.arc(tx + 8 + i * (tw - 16) / 8, ty + th, 7, 0, 7); c.fill(); } for (i = 0; i < 11; i++) { c.beginPath(); c.arc(tx, ty + 8 + i * (th - 16) / 10, 7, 0, 7); c.arc(tx + tw, ty + 8 + i * (th - 16) / 10, 7, 0, 7); c.fill(); }
    c.restore();
    c.imageSmoothingEnabled = false; c.drawImage(sc, 60, 40, 140, 80, tx + 12, ty + 14, tw - 24, 96); c.strokeStyle = '#1c1424'; c.lineWidth = 3; c.strokeRect(tx + 12, ty + 14, tw - 24, 96);
    c.font = '14px ' + PXF; c.fillStyle = '#7a2a1a'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(tampon, tx + tw / 2, ty + 124); c.font = '12px ' + PXF; c.fillStyle = '#4a3a30'; c.fillText(fmt(lv.altitudeEnd || lv.altitude) + ' m', tx + tw / 2, ty + 150);
    // cachet de la poste (date du jour)
    var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; }, ds = z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear();
    c.save(); c.translate(tx - 62, ty + 128); c.rotate(-0.22); c.strokeStyle = 'rgba(42,26,94,.62)'; c.fillStyle = 'rgba(42,26,94,.62)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 62, 0, 7); c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 54, 0, 7); c.stroke();
    c.font = '11px ' + PXF; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SOMMET', 0, -22); c.fillText(ds, 0, 2); c.fillText('ATTEINT', 0, 26); c.restore();
    c.save(); c.strokeStyle = 'rgba(42,26,94,.5)'; c.lineWidth = 3; for (i = 0; i < 4; i++) { c.beginPath(); c.moveTo(tx - 150, ty + 170 + i * 10); c.bezierCurveTo(tx - 110, ty + 156 + i * 10, tx - 80, ty + 186 + i * 10, tx - 40, ty + 170 + i * 10); c.stroke(); } c.restore();

    // légende
    var y0 = B + picH + 30;
    (function () {   // Press Start 2P n'a pas les capitales accentuées : on dessine la lettre nue puis l'accent en pixels
      var raw = (lv.name || '').toUpperCase(), base = raw.replace(/[ÔÉÈÂÊ]/g, function (ch) { return { 'Ô': 'O', 'É': 'E', 'È': 'E', 'Â': 'A', 'Ê': 'E' }[ch]; }), sz = 38, u = sz / 8, i0;
      ptext(base, B + 4, y0, sz, '#2a1a5e', 'left', false);
      c.font = sz + 'px ' + PXF;
      for (i0 = 0; i0 < raw.length; i0++) {
        var ch = raw.charAt(i0); if (ch === base.charAt(i0)) { continue; }
        var x0 = B + 4 + c.measureText(base.slice(0, i0)).width, w0 = c.measureText(base.charAt(i0)).width, cx0 = x0 + w0 / 2 - u / 2, ay = y0 - u * 1.9;
        c.fillStyle = '#2a1a5e';
        if (ch === 'Ô' || ch === 'Â' || ch === 'Ê') { c.fillRect(cx0, ay, u, u); c.fillRect(cx0 - u, ay + u, u, u); c.fillRect(cx0 + u, ay + u, u, u); }
        else if (ch === 'É') { c.fillRect(cx0 + u, ay, u, u); c.fillRect(cx0, ay + u, u, u); }
        else { c.fillRect(cx0 - u, ay, u, u); c.fillRect(cx0, ay + u, u, u); }
      }
    })();
    c.font = '20px ' + PXF; c.fillStyle = '#8a3a1a'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(fmt(lv.altitudeEnd || lv.altitude) + ' m  ·  NIVEAU ' + lv.number, B + 4, y0 + 62);
    var rx = CW - B - 8;
    c.textAlign = 'right'; c.font = '16px ' + PXF; c.fillStyle = '#6a5a70'; c.fillText('TEMPS', rx, y0 + 4); c.font = '40px ' + PXF; c.fillStyle = '#2a1a5e'; c.fillText(mmss(st.time || 0), rx, y0 + 30);
    // étoiles pixel
    function star(sx0, sy0, s, on) {
      var m = ['...#...', '..###..', '#######', '.#####.', '..###..', '.##.##.', '.#...#.'], r, q;
      for (r = 0; r < 7; r++) { for (q = 0; q < 7; q++) { if (m[r][q] === '#') { c.fillStyle = on ? '#9a5d00' : '#b3a590'; c.fillRect(sx0 + q * s + 2, sy0 + r * s + 2, s, s); } } }
      for (r = 0; r < 7; r++) { for (q = 0; q < 7; q++) { if (m[r][q] === '#') { c.fillStyle = on ? (r < 3 ? '#ffe066' : '#ffc21a') : '#d8ccba'; c.fillRect(sx0 + q * s, sy0 + r * s, s, s); } } }
    }
    for (i = 0; i < 3; i++) { star(B + 4 + i * 58, y0 + 108, 6, i < stars); }
    c.font = '12px ' + PXF; c.textAlign = 'right'; c.fillStyle = '#7a6a80'; c.fillText('ASCENSION · v' + ((window.AscensionData && AscensionData.VERSION) || ''), rx, y0 + 120);
    return cv;
  }

  function make(opt) {
    var ready = (document.fonts && document.fonts.load) ? document.fonts.load('16px "Press Start 2P"').catch(function () { /* police système en repli */ }) : Promise.resolve();
    return ready.then(function () { return compose(opt); });
  }
  function fileName(lv) { return 'ascension-' + String(lv.id || ('niveau' + lv.number)).replace(/[^a-z0-9-]+/gi, '-').toLowerCase() + '-carte-postale.png'; }

  window.Postcard = {
    make: make, fileName: fileName,
    html: function (id) { return '<div class="pc-wrap"><canvas id="' + id + '" class="pc-cv" role="img" aria-label="Carte postale du sommet"></canvas><div class="pc-actions"><button class="pix-btn small" id="' + id + 'Save">Enregistrer la carte</button></div><p class="pc-msg" id="' + id + 'Msg" role="status" aria-live="polite"></p></div>'; },
    mount: function (id, lv, stats, stars) {
      var cv = document.getElementById(id); if (!cv) { return; }
      var opt = { lv: lv, stats: stats, stars: stars, character: (window.Save && Save.get().character) || 'boy' }, full = null, msg = document.getElementById(id + 'Msg');
      make(opt).then(function (c) {
        full = c; if (!cv.isConnected) { return; } cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0);
      }, function (e) { if (window.console) { console.warn('carte postale', e); } if (cv.parentNode) { cv.parentNode.style.display = 'none'; } });
      var btn = document.getElementById(id + 'Save');
      btn.addEventListener('click', function () {
        if (!full) { return; } var url = full.toDataURL('image/png');
        window.Files.save({ filename: fileName(lv), mime: 'image/png', dataUrl: url, title: lv.name + ' — ' + fmt(lv.altitudeEnd || lv.altitude) + ' m', dialog: 'Enregistrer ou partager ma carte postale' }).then(function (how) {
          if (window.Sfx) { Sfx.play('pick'); } msg.textContent = how === 'native' ? 'Choisis où enregistrer ou partager ta carte.' : 'Carte téléchargée (' + fileName(lv) + ').'; msg.className = 'pc-msg';
        }, function () { msg.textContent = 'Enregistrement impossible : fais un appui long sur l’image pour la copier.'; msg.className = 'pc-msg bad'; });
      });
    }
  };
})();
