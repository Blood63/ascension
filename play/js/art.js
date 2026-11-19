/* Rendu « rétro moderne » : tout est dessiné en vectoriel à la résolution de l'écran (aucun agrandissement de petits sprites).
   Contient : couleurs, bruit, randonneur articulé (squelette + cinématique inverse), bouteille, cœur, arbres, nuages, reliefs, pierres. */
(function () {
  'use strict';
  var PAL = {
    ink: '#241a33', paper: '#f4efe2', gold: '#ffd34d', red: '#e0452b', violet: '#2a1a5e',
    skin: '#f2c4a0', skinSh: '#d9976f', jacket: '#f1e6cd', jacketSh: '#c9b790', pants: '#2f3f73', pantsSh: '#1f2a50',
    boot: '#6a4228', bootSh: '#3e2616', cap: '#e0452b', capSh: '#a82a1c', pack: '#7a45b5', packSh: '#4e2a82', packHi: '#a97be0',
    scarf: '#ffb03b', scarfSh: '#e07a1c', pole: '#3a3f4e', poleHi: '#aab3c8', bottle: '#4aa3ea'
  };

  /* ---------- utilitaires ---------- */
  function hash(a, b) { var h = (a * 374761393 + (b || 0) * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function noise(x, seed) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u); }
  function fbm(x, seed) { return noise(x, seed) * 0.55 + noise(x * 2.1, seed + 11) * 0.3 + noise(x * 4.3, seed + 23) * 0.15; }

  var _cc = {};
  function rgb(h) { var c = _cc[h]; if (c) { return c; } var n = parseInt(h.slice(1), 16); c = _cc[h] = [n >> 16, (n >> 8) & 255, n & 255]; return c; }
  function mix(a, b, t) { var A = rgb(a), B = rgb(b); t = clamp(t, 0, 1); var r = Math.round(A[0] + (B[0] - A[0]) * t), g = Math.round(A[1] + (B[1] - A[1]) * t), bl = Math.round(A[2] + (B[2] - A[2]) * t); return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1); }
  function rgba(h, a) { var c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function grad(c, x0, y0, x1, y1, stops) { var g = c.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < stops.length; i += 2) { g.addColorStop(stops[i], stops[i + 1]); } return g; }

  /* courbe lisse passant par des points (Catmull-Rom → béziers) */
  function smoothPath(c, pts, closeTo) {
    c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (closeTo != null) { c.lineTo(pts[pts.length - 1][0], closeTo); c.lineTo(pts[0][0], closeTo); c.closePath(); }
  }
  function rrect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }

  /* ---------- cinématique inverse à 2 segments ---------- */
  function ik(hx, hy, fx, fy, a, b, side) {
    var dx = fx - hx, dy = fy - hy, d = Math.sqrt(dx * dx + dy * dy), mx = a + b - 0.05;
    if (d > mx) { fx = hx + dx / d * mx; fy = hy + dy / d * mx; dx = fx - hx; dy = fy - hy; d = mx; }
    if (d < 0.8) { d = 0.8; }
    var l = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - l * l));
    return { kx: hx + dx / d * l - dy / d * h * side, ky: hy + dy / d * l + dx / d * h * side, fx: fx, fy: fy };
  }

  /* ---------- RANDONNEUR ---------- */
  var OW = 0.95;
  function limb(c, pts, w, col, ol) {
    c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) { c.lineTo(pts[i][0], pts[i][1]); }
    c.strokeStyle = ol; c.lineWidth = w + OW; c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke();
  }
  function poleDraw(c, hx, hy, tx, ty, col, tn, planted) {
    var dx = tx - hx, dy = ty - hy, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
    var topx = hx - ux * 2.4, topy = hy - uy * 2.4;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(topx, topy); c.lineTo(tx, ty); c.strokeStyle = PAL.ink; c.lineWidth = 1.05 + OW * 0.5; c.stroke();
    c.beginPath(); c.moveTo(topx, topy); c.lineTo(tx, ty); c.strokeStyle = tn(col); c.lineWidth = 0.9; c.stroke();
    // poignée
    c.beginPath(); c.moveTo(topx, topy); c.lineTo(hx + ux * 1.6, hy + uy * 1.6); c.strokeStyle = PAL.ink; c.lineWidth = 2.1; c.stroke();
    c.beginPath(); c.moveTo(topx, topy); c.lineTo(hx + ux * 1.6, hy + uy * 1.6); c.strokeStyle = tn(GRIP); c.lineWidth = 1.4; c.stroke();
    // rondelle + pointe
    var bx = tx - ux * 2.2, by = ty - uy * 2.2; c.beginPath(); c.ellipse(bx, by, 1.5, 0.55, Math.atan2(uy, ux) + Math.PI / 2, 0, Math.PI * 2); c.fillStyle = tn('#e8e0cf'); c.fill(); c.lineWidth = 0.4; c.strokeStyle = PAL.ink; c.stroke();
  }
  function bottleSmall(c, x, y, rot, tn, h) {
    h = h || 6.6; var w = h * 0.38;
    c.save(); c.translate(x, y); c.rotate(rot);
    c.beginPath(); rrect(c, -w / 2, -h / 2, w, h, w * 0.4); c.fillStyle = tn('#6cb8f2'); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
    c.beginPath(); rrect(c, -w / 2 + 0.3, -h / 2 + h * 0.3, w - 0.6, h * 0.62, w * 0.3); c.fillStyle = tn('#3a8fe0'); c.fill();
    c.beginPath(); rrect(c, -w * 0.3, -h / 2 - 1.1, w * 0.6, 1.5, 0.4); c.fillStyle = tn('#f4efe2'); c.fill(); c.lineWidth = 0.4; c.stroke();
    c.beginPath(); c.moveTo(-w * 0.2, -h * 0.2); c.lineTo(-w * 0.2, h * 0.3); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.5; c.stroke();
    c.restore();
  }

  /* s : x,y (pieds), face (±1), char ('boy' | 'girl'), t, phase, move (0..1), air, vy, sq (écrasement ; + = écrasé, − = étiré), hurt (0..1), drink (0..1), cele (0..1), slope (rad), scale, stride, alpha */
  var GRIP = '#c0392b';
  function drawHiker(c, s) {
    var t = s.t || 0, ph = s.phase || 0, mv = clamp(s.move || 0, 0, 1), air = !!s.air, vy = s.vy || 0, hurt = s.hurt || 0, drink = s.drink || 0, cele = s.cele || 0, sq = s.sq || 0, SC = s.scale || 1, stride = s.stride || 5.0;
    var ST = s.char || 'boy', G2 = ST === 'girl2', G3 = ST === 'girl3', B3 = ST === 'boy3', G = ST === 'girl' || G2 || G3, B2 = ST === 'boy2', FEM = G;
    var K = G2 ? { top: '#ff7a6b', topSh: '#d4524a', topHi: '#ffb8aa', pack: '#8f78e6', packSh: '#5a43b0', packHi: '#c8b9ff', mat: '#7fe0cf', matSh: '#3fa896', boot: '#f3f1f8', bootSh: '#b7b1c9', lace: '#9b7fe0', short: '#2b2636', shortSh: '#17131f', hair: '#2b1f2e', hairHi: '#65506b', hairSh: '#130c15', grip: '#b79cff', pole: '#6c5f90' }
              : B2 ? { top: '#25272d', topSh: '#131418', topHi: '#575c69', pack: '#4d5565', packSh: '#2c323d', packHi: '#8190a6', mat: '#ff8a2a', matSh: '#b85a10', boot: '#a3a9b2', bootSh: '#6e747d', lace: '#ff8a2a', short: '#1d1e23', shortSh: '#0d0d10', hair: '#2c1d14', hairHi: '#54382a', hairSh: '#150d09', grip: '#ff8a2a', pole: '#2b2f38' }
              : G3 ? { top: '#f3eee4', topSh: '#d2c8b6', topHi: '#fffaf2', pack: '#5e4a38', packSh: '#33281e', packHi: '#8e7460', mat: '#c43c32', matSh: '#8a241c', boot: '#e8d6a8', bootSh: '#b89868', lace: '#6a3a28', short: '#8a2440', shortSh: '#5a1428', hair: '#4a2e1c', hairHi: '#7a4e30', hairSh: '#2a180e', grip: '#8a2a22', pole: '#4a453c', sash: '#c0392b', apron: '#e6d8b8', zapi: '#c4453a' }
              : B3 ? { top: '#f4f0e6', topSh: '#d4cbb8', topHi: '#fffdf6', pack: '#6b5340', packSh: '#3e2e24', packHi: '#a38468', mat: '#c44a3a', matSh: '#8a2e22', boot: '#e8d6a8', bootSh: '#b89868', lace: '#6a3a28', short: '#2a2c38', shortSh: '#16171e', hair: '#3a2a1c', hairHi: '#5c4030', hairSh: '#1c120c', grip: '#8a2a22', pole: '#4a453c', sash: '#c0392b' }
              : G ? { top: '#4aa3e8', topSh: '#2f78c0', topHi: '#8ccbff', pack: '#2ea58c', packSh: '#1d6e5e', packHi: '#74dcc2', mat: '#ff9ec7', matSh: '#d9669a', boot: '#8a6a58', bootSh: '#5a4036', lace: '#ff6fae', short: '#ff7eb6', shortSh: '#d94a8a', hair: '#8b5230', hairHi: '#bd7b44', hairSh: '#5c351a', grip: '#ff5fa2', pole: '#3f4a5c' }
              : { top: PAL.jacket, topSh: PAL.jacketSh, topHi: '#fff6e0', pack: PAL.pack, packSh: PAL.packSh, packHi: PAL.packHi, mat: '#e0a63c', matSh: '#a87020', boot: PAL.boot, bootSh: PAL.bootSh, lace: '#e8e0cf', short: PAL.pants, shortSh: PAL.pantsSh, hair: '#5a3a22', hairHi: '#7a5230', hairSh: '#3a2414', grip: '#c0392b', pole: PAL.pole };
    GRIP = K.grip;
    var fly = (s.fly > 0.01) ? (s.fly > 1 ? 1 : s.fly) : 0, nopole = !!s.nopole || fly > 0.35;
    var tn = hurt > 0.01 ? function (col) { return mix(col, '#ffffff', hurt * 0.8); } : function (col) { return col; };
    c.save(); c.translate(s.x, s.y); if (s.alpha != null) { c.globalAlpha = s.alpha; }
    // ombre portée douce
    if (s.shadow !== false) {
      var sh = c.createRadialGradient(0, 0.4, 0, 0, 0.4, 7 * SC); sh.addColorStop(0, 'rgba(40,12,50,.38)'); sh.addColorStop(1, 'rgba(40,12,50,0)');
      c.save(); c.scale(1, 0.22); c.fillStyle = sh; c.beginPath(); c.arc(0, 0.4 / 0.22, 7 * SC * (air ? 0.8 : 1), 0, Math.PI * 2); c.fill(); c.restore();
    }
    c.scale((s.face < 0 ? -1 : 1) * SC, SC); if (s.slope) { c.rotate(s.slope * 0.55); }
    c.scale(1 + sq * 0.14, 1 - sq * 0.14);
    var br = Math.sin(t * 2.4) * 0.3 * (1 - mv) * (1 - cele);
    var legA = 5.7, legB = 5.7, BH = 3.8;                 // longueur des segments ; hauteur cheville (haut de la botte)
    var hipX = 0, hipY = (air ? -13.7 : -14.5) + (air ? 0 : (1 - Math.abs(Math.cos(ph))) * 0.8 * mv) + br * 0.6 + fly * 2.2;
    if (hurt > 0.01) { hipY += 0.5; }
    var drinkP = sstep(0, 0.25, drink) * (1 - sstep(0.8, 1, drink));
    var lean = 0.11 * mv + (air ? -0.04 : 0) - hurt * 0.4 - drinkP * 0.1 - cele * 0.12 + br * 0.02 - 0.2 * (s.slide || 0);
    var cl = Math.cos(lean), sl = Math.sin(lean);
    function T(x, y) { return [hipX + x * cl - y * sl, hipY + x * sl + y * cl]; }
    var sho = T(0, -7.8 + br), neck = T(0.8, -9.2 + br);
    var headTilt = -0.55 * drinkP + hurt * -0.3 - cele * 0.18 + lean * 0.4;
    var hc = [neck[0] + 0.7 * Math.cos(headTilt) + Math.sin(headTilt) * 3.1, neck[1] - Math.cos(headTilt) * 3.1 - 0.4];
    var hx = hc[0], hy = hc[1], HR = 3.55;

    // positions des pieds : [x, y de la semelle, angle de la botte] — la semelle touche le sol (y = 0) pendant l'appui
    var feet = [];
    for (var i = 0; i < 2; i++) {
      var pp = ph + i * Math.PI, idleX = i ? -1.6 : 1.4, fx, fy, fa = 0;
      if (air) {
        var a = clamp(vy / 230, -1, 1), k = (a + 1) / 2;
        if (i === 0) { fx = lerp(3.4, 2.0, k); fy = lerp(-4.6, -1.4, k); fa = lerp(0.1, 0.32, k); } else { fx = lerp(-3.6, -2.2, k); fy = lerp(-3.4, -0.9, k); fa = lerp(0.35, 0.18, k); }
        if (B2) {
          /* flexion de coureur trail : jambe avant un peu plus lancée, jambe arrière plus ramassée */
          if (i === 0) { fx = lerp(3.8, 2.6, k); fy = lerp(-5.4, -2.0, k); fa = lerp(0.22, 0.48, k); }
          else { fx = lerp(-2.4, -1.2, k); fy = lerp(-6.0, -3.0, k); fa = lerp(0.62, 0.38, k); }
        }
        if (hurt > 0.01) { fx += i ? -1.5 : -0.5; }
      } else {
        var lk = Math.max(0, Math.cos(pp));
        fx = idleX * (1 - mv) + Math.sin(pp) * stride * mv; fy = -lk * 2.9 * mv; fa = -Math.sin(pp) * 0.35 * lk * mv;
        if (cele > 0.01) { fx = lerp(fx, idleX * 1.4, cele); fy = lerp(fy, 0, cele); fa = lerp(fa, 0, cele); }
      }
      if (fly > 0.01) {
        var ffx = i ? -2.2 : 3.0, ffy = -1.1, ffa = i ? 0.28 : 0.18;
        fx = lerp(fx, ffx, fly); fy = lerp(fy, ffy, fly); fa = lerp(fa, ffa, fly);
      }
      feet.push([fx, fy, fa]);
    }
    // bras : cibles
    var shN = [sho[0] + 0.3, sho[1] + 0.9], shF = [sho[0] - 0.7, sho[1] + 0.9];
    function handTarget(i) {
      var pp = ph + i * Math.PI + Math.PI, sw = Math.sin(pp) * mv, hx0, hy0;
      if (air) { hx0 = i ? shF[0] - 3.2 : shN[0] + 4.4; hy0 = (i ? shF[1] : shN[1]) + (vy < 0 ? -0.4 : 1.6); if (hurt > 0.01) { hx0 -= 2; hy0 -= 2.5; } }
      else { hx0 = (i ? shF[0] : shN[0]) + 1.5 + sw * 3.4; hy0 = (i ? shF[1] : shN[1]) + 5.6 - Math.abs(sw) * 0.4 + br; }
      if (cele > 0.01) { var ox = i ? -3.3 : 3.6; hx0 = lerp(hx0, hx + ox, cele); hy0 = lerp(hy0, hy - 7.2 + Math.sin(t * 9 + i) * 0.5, cele); }
      if (fly > 0.01) {
        var bhx = i ? shF[0] + 1.6 : shN[0] + 3.4, bhy = (i ? shF[1] : shN[1]) - 4.2;
        hx0 = lerp(hx0, bhx, fly); hy0 = lerp(hy0, bhy, fly);
      }
      return [hx0, hy0];
    }
    var hN = handTarget(0), hF = handTarget(1);
    if (drink > 0.01) { var mouth = [hx + 2.3, hy + 1.7]; hN = [lerp(hN[0], mouth[0] + 1.35, drinkP), lerp(hN[1], mouth[1] + 2.55, drinkP)]; }

    // pointes des bâtons
    function tipFor(i, h) {
      var pp = ph + i * Math.PI + Math.PI, sw = Math.sin(pp) * mv;
      if (air) { return [h[0] - 5.6, h[1] + 8.5]; }
      if (cele > 0.01) { return [h[0] + 1.6 * (i ? -1 : 1), h[1] - 10 * cele - 0.01]; }
      var lift = Math.max(0, Math.cos(pp)) * 3.4 * mv;
      return [h[0] + 4.2 + sw * 2.2, -lift];
    }
    var tN = tipFor(0, hN), tF = tipFor(1, hF);
    if (drinkP > 0.01) { tN = [shN[0] + 5.2, 0]; }
    if (cele > 0.01) { tN = [hN[0] + 1.3, hN[1] - 11]; tF = [hF[0] - 1.3, hF[1] - 11]; }

    // --- bras / canne arrière ---
    var armF = ik(shF[0], shF[1], hF[0], hF[1], 4.5, 4.5, 1);
    var poleCol = K.pole;
    if (!nopole) { if (!(cele > 0.01)) { poleDraw(c, hF[0], hF[1], tF[0], tF[1], poleCol, function (x) { return tn(mix(x, '#000000', 0.25)); }, true); } else { poleDraw(c, hF[0], hF[1] + 3, tF[0], tF[1], poleCol, tn, false); } }
    limb(c, [[shF[0], shF[1]], [armF.kx, armF.ky], [armF.fx, armF.fy]], (G || B2) ? 2.2 : 2.5, tn((G || B2) ? PAL.skinSh : (B3 ? K.topSh : PAL.jacketSh)), PAL.ink);
    if (B2) { limb(c, [[shF[0], shF[1]], [shF[0] + (armF.kx - shF[0]) * 0.62, shF[1] + (armF.ky - shF[1]) * 0.62]], 3.1, tn(K.topSh), PAL.ink); }
    c.beginPath(); c.arc(armF.fx, armF.fy, 1.25, 0, 7); c.fillStyle = tn(PAL.skinSh); c.fill(); c.lineWidth = 0.45; c.strokeStyle = PAL.ink; c.stroke();

    // --- jambe : bas de la jambe (peau / pantalon), short rose (fille), botte alignée sur la semelle ---
    function leg(i, shade) {
      var f = feet[i], fa = f[2], hx1 = hipX + (i ? -0.6 : 0.5), hy1 = hipY + 0.3;
      var ax = f[0] + BH * Math.sin(fa), ay = f[1] - BH * Math.cos(fa);   // haut de la botte = cheville
      var kn = ik(hx1, hy1, ax, ay, legA, legB, -1);
      if (G3) {
        /* jupe longue plus bas : ici seulement la jambe (peau), la jupe se dessine après */
        limb(c, [[hx1, hy1], [kn.kx, kn.ky], [kn.fx, kn.fy]], 3.0, tn(shade ? PAL.skinSh : PAL.skin), PAL.ink);
      } else if (G2) {
        limb(c, [[hx1, hy1], [kn.kx, kn.ky], [kn.fx, kn.fy]], 3.0, tn(shade ? PAL.skinSh : PAL.skin), PAL.ink);
        var mx2 = kn.kx + (kn.fx - kn.kx) * 0.55, my2 = kn.ky + (kn.fy - kn.ky) * 0.55, lc = shade ? K.shortSh : K.short;
        limb(c, [[hx1, hy1], [kn.kx, kn.ky], [mx2, my2]], 3.7, tn(lc), PAL.ink);
        c.beginPath(); c.moveTo(hx1 + 0.9, hy1 + 0.6); c.lineTo(kn.kx + 0.9, kn.ky); c.lineTo(mx2 + 0.5, my2); c.strokeStyle = tn(K.grip); c.lineWidth = 0.5; c.stroke();
        c.beginPath(); c.moveTo(mx2 - 1.6, my2 - 0.2); c.lineTo(mx2 + 1.6, my2 + 0.2); c.strokeStyle = tn(shade ? '#0d0a12' : '#3a3347'); c.lineWidth = 0.5; c.stroke();
      } else if (B2) {
        limb(c, [[hx1, hy1], [kn.kx, kn.ky], [kn.fx, kn.fy]], 3.0, tn(shade ? PAL.skinSh : PAL.skin), PAL.ink);
        var sc3 = shade ? K.shortSh : K.short, tx3 = hx1 + (kn.kx - hx1) * 0.66, ty3 = hy1 + (kn.ky - hy1) * 0.66;
        limb(c, [[hx1, hy1], [tx3, ty3]], 4.9, tn(sc3), PAL.ink);
        c.beginPath(); c.moveTo(tx3 - 0.8, ty3 + 0.3); c.lineTo(tx3 + 0.9, ty3 - 0.1); c.strokeStyle = tn(K.topHi); c.globalAlpha *= 0.45; c.lineWidth = 0.45; c.stroke(); c.globalAlpha /= 0.45;
      } else if (G) {
        limb(c, [[hx1, hy1], [kn.kx, kn.ky], [kn.fx, kn.fy]], 3.0, tn(shade ? PAL.skinSh : PAL.skin), PAL.ink);
        var sc = shade ? K.shortSh : K.short, tx = hx1 + (kn.kx - hx1) * 0.42, ty = hy1 + (kn.ky - hy1) * 0.42;
        limb(c, [[hx1, hy1], [tx, ty]], 4.0, tn(sc), PAL.ink);
        c.beginPath(); c.moveTo(tx - 0.2, ty); c.lineTo(tx + 0.4, ty + 0.1); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.5; c.stroke();
      } else {
        var pc = shade ? (B3 ? K.shortSh : PAL.pantsSh) : (B3 ? K.short : PAL.pants);
        limb(c, [[hx1, hy1], [kn.kx, kn.ky], [kn.fx, kn.fy]], 3.7, tn(pc), PAL.ink);
        c.beginPath(); c.arc(kn.kx, kn.ky, 0.9, 0, 7); c.fillStyle = tn(mix(pc, '#ffffff', 0.12)); c.fill();
      }
      // botte / espadrille : origine = point d'appui de la semelle (f[0], f[1])
      c.save(); c.translate(f[0], f[1]); c.rotate(fa);
      var bc = shade ? K.bootSh : K.boot;
      if (!(B3 || G3)) {
      c.beginPath(); c.moveTo(-2.0, -BH - 0.2); c.lineTo(1.9, -BH - 0.2); c.lineTo(1.9, -2.5); c.quadraticCurveTo(2.2, -1.7, 4.2, -1.6); c.quadraticCurveTo(5.1, -1.2, 5.0, -0.6); c.lineTo(5.0, -0.8); c.lineTo(-2.3, -0.8); c.quadraticCurveTo(-2.5, -2.4, -2.0, -BH - 0.2); c.closePath();
      c.fillStyle = grad(c, 0, -BH, 0, 0, [0, tn(mix(bc, '#ffffff', 0.12)), 1, tn(bc)]); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); rrect(c, -2.2, -0.95, 7.4, 0.95, 0.4); c.fillStyle = tn('#efe6d2'); c.fill(); c.lineWidth = 0.4; c.stroke();       // semelle
      c.beginPath(); rrect(c, -2.0, -BH - 0.5, 3.9, 1.0, 0.4); c.fillStyle = tn(shade ? '#cfc6b2' : '#f4efe2'); c.fill(); c.lineWidth = 0.35; c.stroke();  // chaussette
      }
      if (B3 || G3) {
        /* espadrilles / espartinak : toile claire, semelle de corde, lacet à la cheville */
        c.beginPath(); c.moveTo(-1.8, -2.8); c.lineTo(1.6, -2.8); c.quadraticCurveTo(3.4, -2.2, 4.4, -1.1); c.lineTo(4.4, -0.15); c.lineTo(-2.0, -0.15); c.quadraticCurveTo(-2.1, -1.8, -1.8, -2.8); c.closePath();
        c.fillStyle = grad(c, 0, -2.8, 0, 0, [0, tn(mix(bc, '#ffffff', 0.28)), 1, tn(bc)]); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
        c.beginPath(); rrect(c, -2.05, -0.55, 6.6, 0.7, 0.25); c.fillStyle = tn('#c4a66a'); c.fill(); c.lineWidth = 0.35; c.strokeStyle = PAL.ink; c.stroke();
        c.beginPath(); c.moveTo(-1.7, -0.15); c.lineTo(4.2, -0.15); c.moveTo(-1.6, -0.35); c.lineTo(4.1, -0.35); c.strokeStyle = tn('#8a6a38'); c.lineWidth = 0.28; c.stroke();
        c.beginPath(); c.moveTo(0.2, -2.7); c.quadraticCurveTo(-0.2, -3.6, -1.1, -3.2); c.moveTo(0.6, -2.7); c.quadraticCurveTo(1.5, -3.7, 1.8, -2.6); c.strokeStyle = tn(K.lace); c.lineWidth = 0.4; c.stroke();
      } else {
        c.beginPath(); c.moveTo(2.1, -2.7); c.lineTo(1.0, -2.4); c.moveTo(2.7, -2.1); c.lineTo(1.5, -1.8); c.strokeStyle = tn(K.lace); c.lineWidth = 0.4; c.stroke();   // lacets
      }
      c.restore();
    }
    leg(1, true);

    // --- sac à dos ---
    var pk = T(-4.7, -4.3 + br * 0.5), packLag = -0.07 * mv * Math.sin(ph * 2 + 0.6) + (air ? clamp(-vy * 0.0009, -0.14, 0.14) : 0) + hurt * 0.2;
    var packBob = Math.sin(ph * 2 + 1.1) * 0.35 * mv - (air ? clamp(vy * 0.004, -0.8, 0.8) : 0);
    c.save(); c.translate(pk[0], pk[1] + packBob); c.rotate(lean + packLag);
    c.beginPath(); rrect(c, -3.6, -6.9, 7.3, 2.5, 1.2); c.fillStyle = tn(K.mat); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
    c.beginPath(); c.moveTo(-1.4, -6.9); c.lineTo(-1.4, -4.4); c.moveTo(1.5, -6.9); c.lineTo(1.5, -4.4); c.strokeStyle = tn(K.matSh); c.lineWidth = 0.5; c.stroke();
    c.beginPath(); rrect(c, -3.2, -5.0, 6.4, 10.2, 2.0);
    c.fillStyle = grad(c, -3.2, -5, 3.2, 5, [0, tn(K.packHi), 0.35, tn(K.pack), 1, tn(K.packSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
    c.beginPath(); rrect(c, -3.1, -5.0, 6.2, 3.6, 1.8); c.fillStyle = tn(mix(K.pack, K.packSh, 0.4)); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-3.0, -1.2); c.lineTo(3.0, -1.2); c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 0.4; c.stroke();
    c.beginPath(); rrect(c, -2.2, 0.8, 4.4, 3.4, 1.0); c.fillStyle = tn(K.packSh); c.fill(); c.lineWidth = 0.4; c.strokeStyle = PAL.ink; c.stroke();
    c.beginPath(); rrect(c, -0.7, -2.0, 1.4, 1.4, 0.3); c.fillStyle = tn('#ffd34d'); c.fill();
    if (drinkP < 0.5) { bottleSmall(c, -3.0, 2.4, 0.08, tn, 6); }
    c.restore();

    // --- cheveux longs de la fille (derrière le corps, devant le sac) : mouvement secondaire ---
    if (G2) {
      var lg2 = mv * 2.6 + Math.sin(t * 6.4 + ph) * (0.5 + mv * 1.1) + Math.sin(t * 2.3) * 0.4 + (air ? clamp(-vy * 0.005, -1.6, 1.6) : 0) + hurt * 1.2 - cele * 0.6;
      var rs2 = (air ? clamp(-vy * 0.014, -2.8, 2.6) : 0) + Math.sin(t * 3.9 + ph * 2) * 0.5 * mv - drinkP * 1.4;
      var b0 = [hx - 3.1, hy - 2.4], m0 = [b0[0] - 2.2 - lg2 * 0.45, b0[1] + 2.2 + rs2 * 0.3], e0 = [b0[0] - 3.2 - lg2, b0[1] + 7.6 + rs2];
      c.beginPath(); c.moveTo(b0[0] + 0.6, b0[1] - 1.2);
      c.bezierCurveTo(b0[0] - 2.4, b0[1] - 2.2, m0[0] - 2.6, m0[1] - 1.0, e0[0] - 0.6, e0[1] - 0.8);
      c.quadraticCurveTo(e0[0] + 0.2 + Math.sin(t * 7 + ph) * 0.5, e0[1] + 2.2, e0[0] + 1.6, e0[1] + 0.2);
      c.bezierCurveTo(m0[0] + 1.8, m0[1] + 1.4, b0[0] + 1.2, b0[1] + 2.0, b0[0] + 1.6, b0[1] + 1.0);
      c.closePath(); c.fillStyle = grad(c, b0[0] - 4, b0[1], b0[0] + 2, b0[1] + 6, [0, tn(K.hairHi), 0.5, tn(K.hair), 1, tn(K.hairSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(b0[0] - 0.4, b0[1] + 0.2); c.quadraticCurveTo(m0[0] - 1.2, m0[1], e0[0] - 0.2, e0[1] - 1.2); c.strokeStyle = tn(K.hairHi); c.globalAlpha *= 0.55; c.lineWidth = 0.5; c.stroke(); c.globalAlpha /= 0.55;
      c.beginPath(); c.arc(b0[0] + 0.5, b0[1] + 0.2, 1.35, 0, 7); c.fillStyle = tn(K.grip); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
    }
    if (G && !G2 && !G3) {
      var lag = mv * 2.3 + Math.sin(t * 5.2 + ph) * (0.4 + mv * 0.9) + Math.sin(t * 2.1) * 0.35 + (air ? clamp(-vy * 0.004, -1.4, 1.4) : 0) + hurt * 1.2 - cele * 0.5;
      var rise = (air ? clamp(-vy * 0.012, -2.6, 2.4) : 0) + Math.sin(t * 3.3 + ph * 2) * 0.35 * mv - drinkP * 1.6;
      var S0 = [neck[0] - 2.2, neck[1] + 0.5], MM = [S0[0] - 1.5 - lag * 0.45, S0[1] + 4.4 + rise * 0.35], TP = [S0[0] - 2.2 - lag, S0[1] + 9.6 + rise];
      c.beginPath(); c.moveTo(hx + 0.6, hy - 3.4);
      c.bezierCurveTo(hx - 3.2, hy - 4.4, hx - 4.6, hy - 1.2, hx - 4.2, hy + 1.2);
      c.bezierCurveTo(S0[0] - 5.2, S0[1] + 0.8, MM[0] - 3.0, MM[1], TP[0] - 2.1, TP[1] - 0.6);
      c.quadraticCurveTo(TP[0] - 0.6 + Math.sin(t * 6 + ph) * 0.5, TP[1] + 2.0, TP[0] + 0.7, TP[1] + 1.2);
      c.quadraticCurveTo(TP[0] + 2.4, TP[1] - 0.2, TP[0] + 2.7, TP[1] - 1.0);
      c.bezierCurveTo(MM[0] + 2.4, MM[1] + 0.4, S0[0] + 2.4, S0[1] + 3.0, neck[0] + 0.4, neck[1] + 0.6);
      c.closePath();
      c.fillStyle = grad(c, S0[0] - 5, S0[1], S0[0] + 3, S0[1] + 4, [0, tn(K.hairHi), 0.45, tn(K.hair), 1, tn(K.hairSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(hx - 3.4, hy + 0.8); c.quadraticCurveTo(MM[0] - 1.6, MM[1] - 1.4, TP[0] - 0.5, TP[1] - 1.2); c.strokeStyle = tn(K.hairHi); c.globalAlpha *= 0.6; c.lineWidth = 0.55; c.stroke(); c.globalAlpha /= 0.6;
      c.beginPath(); c.moveTo(hx - 2.2, hy + 2.0); c.quadraticCurveTo(MM[0] + 0.4, MM[1] - 0.6, TP[0] + 1.1, TP[1] - 1.0); c.strokeStyle = tn(K.hairSh); c.lineWidth = 0.4; c.stroke();
    }

    // --- torse ---
    c.save(); c.translate(hipX, hipY); c.rotate(lean);
    c.beginPath(); c.moveTo(-2.9, 1.1); c.quadraticCurveTo(-3.6, -3.5, -2.7, -7.6 + br); c.quadraticCurveTo(0, -9.2 + br, 3.0, -7.9 + br); c.quadraticCurveTo(3.7, -3.8, 3.0, 1.1); c.closePath();
    c.fillStyle = grad(c, -3.5, 0, 3.8, 0, [0, tn(K.topSh), 0.5, tn(K.top), 1, tn(K.topHi)]); c.fill(); c.lineWidth = 0.65; c.strokeStyle = PAL.ink; c.stroke();
    if (G3) {
      /* blouse claire, encolure ronde, gerriko rouge, bavette du tablier */
      c.beginPath(); c.moveTo(-1.5, -8.1 + br); c.quadraticCurveTo(0.6, -6.6 + br, 2.8, -8.0 + br); c.lineTo(2.8, -9.0 + br); c.lineTo(-1.5, -9.0 + br); c.closePath(); c.fillStyle = tn(PAL.skin); c.fill();
      c.beginPath(); c.moveTo(-1.5, -8.1 + br); c.quadraticCurveTo(0.6, -6.6 + br, 2.8, -8.0 + br); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); rrect(c, -3.2, -0.55, 6.5, 2.15, 0.55); c.fillStyle = tn(K.sash); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-3.0, -0.15); c.lineTo(3.1, -0.15); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.4; c.stroke();
      c.beginPath(); c.moveTo(-1.6, -0.55); c.lineTo(-1.1, -4.2 + br); c.lineTo(1.6, -4.2 + br); c.lineTo(2.0, -0.55); c.closePath();
      c.fillStyle = tn(K.apron); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
    } else if (G) {
      // petit haut sans manches : encolure arrondie, ourlet court
      c.beginPath(); c.moveTo(-1.6, -8.3 + br); c.quadraticCurveTo(0.7, -6.0 + br, 2.9, -8.0 + br); c.lineTo(2.9, -9.0 + br); c.lineTo(-1.6, -9.0 + br); c.closePath(); c.fillStyle = tn(PAL.skin); c.fill();
      c.beginPath(); c.moveTo(-1.6, -8.3 + br); c.quadraticCurveTo(0.7, -6.0 + br, 2.9, -8.0 + br); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
      if (G2) {
        // haut court + ventre nu + legging taille haute à liseré lilas
        c.beginPath(); c.moveTo(-3.0, -3.0); c.quadraticCurveTo(0.2, -2.3, 3.2, -3.3); c.lineTo(3.1, -0.6); c.lineTo(-2.9, -0.6); c.closePath(); c.fillStyle = tn(PAL.skin); c.fill();
        c.beginPath(); c.moveTo(-3.1, -3.0); c.quadraticCurveTo(0.2, -2.3, 3.3, -3.3); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
        c.beginPath(); c.moveTo(-2.8, -2.7); c.quadraticCurveTo(0.2, -2.0, 3.0, -3.0); c.strokeStyle = tn(K.topHi); c.globalAlpha *= 0.7; c.lineWidth = 0.45; c.stroke(); c.globalAlpha /= 0.7;
        c.beginPath(); rrect(c, -3.3, -1.0, 6.7, 4.0, 1.0); c.fillStyle = grad(c, -3, -1, 3, 3, [0, tn(K.short), 1, tn(K.shortSh)]); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
        c.beginPath(); c.moveTo(-3.1, -0.4); c.lineTo(3.3, -0.4); c.strokeStyle = tn(K.grip); c.lineWidth = 0.65; c.stroke();
      } else {
        c.beginPath(); c.moveTo(-3.0, -1.7); c.quadraticCurveTo(0, -0.9, 3.2, -1.8); c.strokeStyle = tn(K.topHi); c.globalAlpha *= 0.7; c.lineWidth = 0.45; c.stroke(); c.globalAlpha /= 0.7;
        c.beginPath(); rrect(c, -3.2, -0.3, 6.5, 3.0, 0.9); c.fillStyle = grad(c, -3, 0, 3, 3, [0, tn(K.short), 1, tn(K.shortSh)]); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
        c.beginPath(); c.moveTo(-3.0, 0.5); c.lineTo(3.1, 0.5); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 0.45; c.stroke();
      }
    } else if (B2) {
      c.beginPath(); c.moveTo(-2.9, -0.4); c.lineTo(3.0, -0.4); c.lineWidth = 0.5; c.strokeStyle = tn(K.topHi); c.globalAlpha *= 0.5; c.stroke(); c.globalAlpha /= 0.5;
      c.beginPath(); rrect(c, -3.2, 0.1, 6.5, 3.1, 0.9); c.fillStyle = grad(c, -3, 0, 3, 3, [0, tn(K.short), 1, tn(K.shortSh)]); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-3.0, 0.9); c.lineTo(3.1, 0.9); c.strokeStyle = tn(K.grip); c.lineWidth = 0.4; c.stroke();
    } else if (B3) {
      c.beginPath(); c.moveTo(-1.4, -8.0 + br); c.lineTo(2.6, -8.0 + br); c.strokeStyle = tn(K.topSh); c.lineWidth = 0.45; c.stroke();
      c.beginPath(); rrect(c, -3.25, -0.55, 6.55, 2.2, 0.55); c.fillStyle = tn(K.sash); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-3.0, -0.1); c.lineTo(3.15, -0.1); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.4; c.stroke();
    } else {
      c.beginPath(); c.moveTo(-2.9, 0.6); c.lineTo(3.0, 0.6); c.lineTo(3.0, 1.3); c.lineTo(-2.9, 1.3); c.closePath(); c.fillStyle = tn('#3a2a24'); c.fill();
      c.beginPath(); c.moveTo(2.0, -7.6); c.lineTo(2.1, 0.4); c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 0.4; c.stroke();
      c.beginPath(); rrect(c, 0.0, -3.4, 2.4, 1.8, 0.4); c.strokeStyle = 'rgba(80,60,40,.35)'; c.stroke();
    }
    c.beginPath(); c.moveTo(-2.2, -8.1 + br); c.quadraticCurveTo(0.2, -4.0, -0.6, G ? -0.4 : 0.2); c.strokeStyle = tn(K.packSh); c.lineWidth = 1.3; c.stroke();
    c.beginPath(); c.moveTo(3.0, -7.4 + br); c.quadraticCurveTo(3.8, -3.8, 3.0, 0.8); c.strokeStyle = 'rgba(255,200,120,.55)'; c.lineWidth = 0.7; c.stroke();
    c.restore();

    // --- jambe avant ---
    leg(0, false);
    if (G3) {
      /* jupe longue + tablier (amantala) : volume un peu plus evase, ourlet courbe, leger balancement */
      var skSway = (air ? 0.85 : 1) * mv * Math.sin(ph) * 0.7 + (air ? clamp(vy * 0.0035, -0.45, 0.7) : 0);
      c.save(); c.translate(hipX, hipY); c.rotate(lean * 0.85 + skSway * 0.04);
      c.beginPath();
      c.moveTo(-3.25, 0.15);
      c.lineTo(3.35, 0.15);
      c.bezierCurveTo(5.15 + skSway, 3.8, 5.35 + skSway, 6.8, 4.55 + skSway, 9.25);
      c.quadraticCurveTo(0.15 + skSway * 0.25, 10.05, -4.15 - skSway, 9.25);
      c.bezierCurveTo(-5.05 - skSway, 6.8, -4.85 - skSway, 3.8, -3.25, 0.15);
      c.closePath();
      c.fillStyle = grad(c, -3, 0, 3, 11, [0, tn(K.short), 1, tn(K.shortSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath();
      c.moveTo(-1.95, 0.35);
      c.lineTo(2.15, 0.35);
      c.quadraticCurveTo(2.55 + skSway * 0.3, 4.6, 2.45 + skSway * 0.4, 8.35);
      c.quadraticCurveTo(0.05, 8.85, -2.25 - skSway * 0.4, 8.35);
      c.quadraticCurveTo(-2.35, 4.6, -1.95, 0.35);
      c.closePath();
      c.fillStyle = grad(c, -2, 0, 2, 10, [0, tn(mix(K.apron, '#ffffff', 0.08)), 1, tn(K.apron)]); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-2.15, 3.4); c.quadraticCurveTo(0.1, 3.15, 2.35, 3.4); c.strokeStyle = 'rgba(255,220,200,.25)'; c.lineWidth = 0.35; c.stroke();
      c.restore();
    }

    // --- écharpe / lepozapi : mouvement secondaire ---
    if (B3 || (!G && !B2)) {
      var scCol = B3 ? '#c0392b' : PAL.scarf, scSh = B3 ? '#8a241c' : PAL.scarfSh;
      var sc0 = [neck[0] - 0.2, neck[1] + 0.9];
      var wave = Math.sin(t * 6.5 + ph) * (0.5 + mv * 1.1) + Math.sin(t * 3.1) * 0.35;
      var tailX = sc0[0] - 5.6 - mv * 2.6 + (air ? clamp(-vy * 0.006, -1.2, 1.6) : 0), tailY = sc0[1] + 1.6 + wave * 0.9 + (air ? clamp(vy * 0.012, -2.2, 1.8) : 0) - cele * 1.2;
      c.beginPath(); c.moveTo(sc0[0], sc0[1]); c.quadraticCurveTo((sc0[0] + tailX) / 2, sc0[1] + 1.6 + wave * 0.5, tailX, tailY); c.lineCap = 'round';
      c.strokeStyle = PAL.ink; c.lineWidth = 2.45 + OW; c.stroke(); c.strokeStyle = tn(scCol); c.lineWidth = 2.45; c.stroke();
      c.beginPath(); c.arc(neck[0] + 0.3, neck[1] + 0.9, 2.5, 0, 7); c.fillStyle = tn(scCol); c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.arc(neck[0] + 0.1, neck[1] + 1.3, 1.5, 0.3, 2.9); c.strokeStyle = tn(scSh); c.lineWidth = 0.7; c.stroke();
    } else if (G3) {
      var sc0g = [neck[0] - 0.1, neck[1] + 1.0];
      var waveg = Math.sin(t * 6.2 + ph) * (0.35 + mv * 0.9);
      c.beginPath(); c.arc(neck[0] + 0.2, neck[1] + 0.85, 2.15, 0, 7); c.fillStyle = tn('#c0392b'); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(sc0g[0], sc0g[1]); c.quadraticCurveTo(sc0g[0] - 2.4, sc0g[1] + 1.4 + waveg, sc0g[0] - 3.8, sc0g[1] + 2.2 + waveg);
      c.lineCap = 'round'; c.strokeStyle = PAL.ink; c.lineWidth = 1.7 + OW * 0.5; c.stroke(); c.strokeStyle = tn('#c0392b'); c.lineWidth = 1.7; c.stroke();
    } else {
      c.beginPath(); c.moveTo(neck[0] + 0.1, neck[1] + 0.6); c.lineTo(hx - 0.1, hy + 2.6); c.lineCap = 'round'; c.strokeStyle = PAL.ink; c.lineWidth = 2.7 + OW * 0.6; c.stroke(); c.strokeStyle = tn(PAL.skinSh); c.lineWidth = 2.7; c.stroke();
    }

    // --- tête ---
    c.save(); c.translate(hx, hy); c.rotate(headTilt * 0.6);
    if (!G) { c.beginPath(); c.ellipse(-2.7, 0.8, 1.5, 1.9, 0.3, 0, 7); c.fillStyle = tn(K.hair); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke(); }
    // visage
    c.beginPath(); c.arc(0, 0, HR, 0, 7); c.fillStyle = grad(c, -3, -3, 3.5, 3.5, [0, tn('#ffd9b8'), 0.6, tn(PAL.skin), 1, tn(PAL.skinSh)]); c.fill(); c.lineWidth = 0.65; c.strokeStyle = PAL.ink; c.stroke();
    // nez, joue
    c.beginPath(); c.arc(3.45, 0.9, 0.7, 0, 7); c.fillStyle = tn(PAL.skin); c.fill(); c.lineWidth = 0.4; c.stroke();
    c.beginPath(); c.arc(1.4, 2.0, 0.95, 0, 7); c.fillStyle = tn('#f0958a'); c.globalAlpha *= 0.55; c.fill(); c.globalAlpha /= 0.55;
    // œil
    var blink = (t % 3.7) > 3.55;
    c.strokeStyle = PAL.ink; c.fillStyle = PAL.ink; c.lineCap = 'round';
    if (hurt > 0.2) { c.lineWidth = 0.55; c.beginPath(); c.moveTo(0.9, -0.3); c.lineTo(2.5, 0.7); c.moveTo(0.9, 1.3); c.lineTo(2.5, 0.3); c.stroke(); }
    else if (cele > 0.3 || drinkP > 0.4) { c.lineWidth = 0.6; c.beginPath(); c.arc(1.8, 0.75, 0.8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else if (blink) { c.lineWidth = 0.55; c.beginPath(); c.moveTo(1.0, 0.7); c.lineTo(2.5, 0.7); c.stroke(); }
    else { c.beginPath(); c.ellipse(1.9, 0.6, 0.6, 0.85, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(2.05, 0.3, 0.22, 0, 7); c.fill(); }
    if (G && !blink && hurt <= 0.2) { c.lineWidth = 0.45; c.beginPath(); c.moveTo(1.2, -0.1); c.lineTo(0.7, -0.6); c.moveTo(1.5, -0.25); c.lineTo(1.2, -0.85); c.stroke(); }
    c.lineWidth = 0.45; c.strokeStyle = PAL.ink; c.beginPath();
    if (cele > 0.3) { c.arc(2.0, 1.9, 1.0, 0.1, Math.PI - 0.1); c.stroke(); }
    else if (hurt > 0.2) { c.ellipse(2.2, 2.4, 0.55, 0.7, 0, 0, 7); c.stroke(); }
    else if (drinkP > 0.3) { /* bouche sur la bouteille */ }
    else { c.moveTo(1.7, 2.3); c.quadraticCurveTo(2.4, 2.65, 3.0, 2.2); c.stroke(); }
    if (G2) {
      c.beginPath(); c.moveTo(-4.0, 1.1); c.bezierCurveTo(-5.0, -5.4, 4.0, -5.8, 3.95, -1.5); c.quadraticCurveTo(2.6, -2.8, 0.8, -2.5); c.quadraticCurveTo(-1.6, -2.2, -2.6, 1.0); c.closePath();
      c.fillStyle = grad(c, -4, -5, 3, 1, [0, tn(K.hairHi), 0.5, tn(K.hair), 1, tn(K.hairSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-3.3, -2.3); c.quadraticCurveTo(-0.5, -4.9, 2.7, -3.5); c.strokeStyle = tn(K.hairHi); c.globalAlpha *= 0.7; c.lineWidth = 0.5; c.stroke(); c.globalAlpha /= 0.7;
      c.beginPath(); c.moveTo(-3.7, -1.6); c.quadraticCurveTo(0.2, -3.5, 3.8, -1.7); c.strokeStyle = PAL.ink; c.lineWidth = 1.75; c.stroke(); c.strokeStyle = tn(K.grip); c.lineWidth = 1.05; c.stroke();
      c.beginPath(); c.moveTo(-1.5, -2.9); c.lineTo(-0.7, -2.4); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.4; c.stroke();
    } else if (B2) {
      c.beginPath(); c.moveTo(-3.9, 1.3); c.bezierCurveTo(-4.6, -5.4, 3.6, -5.8, 3.85, -1.5); c.lineTo(3.2, -2.5); c.lineTo(2.3, -1.8); c.lineTo(1.5, -2.8); c.lineTo(0.3, -1.9); c.lineTo(-0.9, -2.7); c.quadraticCurveTo(-2.4, -1.7, -2.6, 1.3); c.closePath();
      c.fillStyle = grad(c, -4, -5, 3, 1, [0, tn(K.hairHi), 0.5, tn(K.hair), 1, tn(K.hairSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-2.9, -3.4); c.quadraticCurveTo(-0.3, -5.0, 2.2, -3.9); c.strokeStyle = tn(K.hairHi); c.globalAlpha *= 0.7; c.lineWidth = 0.5; c.stroke(); c.globalAlpha /= 0.7;
    } else if (G3) {
      /* zapi : petit foulard noué, rouge-terre, cheveux bruns visibles aux tempes et sur le front.
         Pas un casque / capuchon blanc. */
      c.beginPath(); c.arc(-2.85, 0.75, 1.9, 0, 7); c.fillStyle = tn(K.hair); c.fill(); c.lineWidth = 0.45; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath();
      c.moveTo(-3.85, 1.35);
      c.bezierCurveTo(-4.55, -4.15, 3.45, -4.95, 3.95, -0.35);
      c.quadraticCurveTo(3.15, -2.05, 1.35, -1.45);
      c.quadraticCurveTo(-0.35, -0.95, -2.15, 1.2);
      c.closePath();
      c.fillStyle = grad(c, -3, -4, 2, 1, [0, tn(K.hairHi), 0.55, tn(K.hair), 1, tn(K.hairSh)]);
      c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
      /* mèche sur le front, pour que le foulard ne lise pas comme une calotte */
      c.beginPath(); c.moveTo(-0.6, -1.35); c.quadraticCurveTo(0.7, -0.15, 1.55, -0.85);
      c.strokeStyle = tn(K.hair); c.lineWidth = 0.85; c.lineCap = 'round'; c.stroke();
      c.strokeStyle = PAL.ink; c.lineWidth = 0.4; c.stroke();
      /* foulard : triangle posé sur la couronne, liséré crème, nœud à la nuque */
      c.beginPath();
      c.moveTo(-3.05, -0.55);
      c.quadraticCurveTo(-0.35, -4.15, 2.95, -0.95);
      c.quadraticCurveTo(2.15, -0.05, 0.45, 0.05);
      c.quadraticCurveTo(-1.55, 0.15, -2.85, -0.25);
      c.closePath();
      c.fillStyle = grad(c, -1, -3.8, 2, 0.2, [0, tn('#d45a48'), 1, tn(K.zapi)]);
      c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-2.35, -0.85); c.quadraticCurveTo(-0.2, -3.35, 2.25, -1.15);
      c.strokeStyle = tn('#f3e6c8'); c.lineWidth = 0.45; c.stroke();
      c.beginPath(); c.moveTo(-1.65, -0.55); c.quadraticCurveTo(-0.15, -2.15, 1.55, -0.7);
      c.strokeStyle = tn('#f3e6c8'); c.lineWidth = 0.28; c.globalAlpha *= 0.7; c.stroke(); c.globalAlpha /= 0.7;
      c.beginPath(); c.arc(-0.15, -1.55, 0.28, 0, 7); c.arc(1.05, -1.85, 0.22, 0, 7); c.fillStyle = tn('#f3e6c8'); c.fill();
      c.beginPath(); c.moveTo(-2.95, -0.2); c.lineTo(-3.85, 1.35); c.lineTo(-2.35, 0.35); c.closePath();
      c.fillStyle = tn(K.zapi); c.fill(); c.lineWidth = 0.45; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-3.15, 0.35); c.quadraticCurveTo(-4.15, 1.15, -3.55, 2.15);
      c.strokeStyle = PAL.ink; c.lineWidth = 1.15; c.stroke(); c.strokeStyle = tn('#d45a48'); c.lineWidth = 0.7; c.stroke();
    } else if (B3) {
      /* txapela : béret basque sombre qui couvre le crâne (pas une calotte trop basse sur un crâne chauve),
         un peu de travers, volume au sommet, cheveux visibles à la nuque */
      c.beginPath(); c.arc(-2.7, 0.95, 1.55, 0, 7); c.fillStyle = tn(K.hair); c.fill(); c.lineWidth = 0.45; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.ellipse(-0.1, -3.15, 5.35, 2.35, -0.16, 0, 7);
      c.fillStyle = grad(c, 0, -5.2, 0, -1.4, [0, tn('#3a3a44'), 0.55, tn('#1c1c24'), 1, tn('#101014')]);
      c.fill(); c.lineWidth = 0.65; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.ellipse(0.35, -4.15, 3.7, 1.85, -0.12, Math.PI, Math.PI * 2);
      c.fillStyle = grad(c, -2, -5.6, 2, -2.6, [0, tn('#4a4a54'), 1, tn('#1a1a22')]);
      c.fill(); c.lineWidth = 0.55; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.arc(0.45, -5.15, 0.48, 0, 7); c.fillStyle = tn('#2a2a32'); c.fill(); c.lineWidth = 0.4; c.strokeStyle = PAL.ink; c.stroke();
    } else if (G) {
      // frange + dessus des cheveux (v0.2.5 : le trait rose du bandeau a été retiré)
      c.beginPath(); c.moveTo(-4.0, 1.4); c.bezierCurveTo(-4.9, -5.2, 3.6, -5.8, 3.9, -1.0); c.quadraticCurveTo(2.7, -2.7, 0.6, -2.3); c.quadraticCurveTo(-1.4, -1.6, -2.3, 1.2); c.closePath();
      c.fillStyle = grad(c, -4, -5, 3, 1, [0, tn(K.hairHi), 0.5, tn(K.hair), 1, tn(K.hairSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-2.4, -3.2); c.quadraticCurveTo(-0.5, -4.6, 1.6, -3.9); c.strokeStyle = tn(K.hairHi); c.globalAlpha *= 0.7; c.lineWidth = 0.5; c.stroke(); c.globalAlpha /= 0.7;
    } else if (!B2) {
      // chapeau de randonnée (bob) : bord ovale + calotte lisse + ruban
      c.beginPath(); c.ellipse(0.4, -1.7, 5.6, 1.15, -0.06, 0, 7); c.fillStyle = grad(c, 0, -3, 0, 0, [0, tn('#d9553a'), 1, tn(PAL.capSh)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.moveTo(-3.5, -1.7); c.bezierCurveTo(-3.7, -5.6, 3.7, -5.6, 3.5, -1.7); c.quadraticCurveTo(0, -0.9, -3.5, -1.7); c.closePath();
      c.save(); c.clip();
      c.fillStyle = grad(c, -3, -5.5, 3, -1, [0, tn('#ff7a5a'), 0.5, tn(PAL.cap), 1, tn(PAL.capSh)]); c.fillRect(-5, -7, 10, 7);
      c.fillStyle = tn('#f4efe2'); c.fillRect(-5, -2.8, 10, 0.9);
      c.restore();
      c.beginPath(); c.moveTo(-3.5, -1.7); c.bezierCurveTo(-3.7, -5.6, 3.7, -5.6, 3.5, -1.7); c.lineWidth = 0.6; c.strokeStyle = PAL.ink; c.stroke();
      c.beginPath(); c.ellipse(0.4, -1.7, 5.6, 1.15, -0.06, 0.1, Math.PI - 0.1); c.strokeStyle = PAL.ink; c.lineWidth = 0.6; c.stroke();
    }
    c.restore();

    // --- bras avant (devant le torse) + canne ---
    var armN = ik(shN[0], shN[1], hN[0], hN[1], 4.5, 4.5, 1);
    if (!nopole) {
      if (!(drinkP > 0.01)) { poleDraw(c, hN[0], hN[1], tN[0], tN[1], poleCol, tn, !air); }
      else { poleDraw(c, shN[0] + 4.4, -14, tN[0], tN[1], poleCol, tn, true); }
    }
    limb(c, [[shN[0], shN[1]], [armN.kx, armN.ky], [armN.fx, armN.fy]], (G || B2) ? 2.4 : 2.7, tn((G || B2) ? PAL.skin : (B3 ? K.top : K.top)), PAL.ink);
    if (B2) { limb(c, [[shN[0], shN[1]], [shN[0] + (armN.kx - shN[0]) * 0.62, shN[1] + (armN.ky - shN[1]) * 0.62]], 3.3, tn(K.top), PAL.ink); }
    c.beginPath(); c.moveTo(armN.kx, armN.ky); c.lineTo(armN.fx, armN.fy); c.strokeStyle = 'rgba(255,200,120,.35)'; c.lineWidth = 0.6; c.stroke();
    if (G) { c.beginPath(); rrect(c, shN[0] - 0.7, shN[1] - 2.2, 1.6, 3.4, 0.7); c.fillStyle = tn(K.top); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke(); }
    c.beginPath(); c.arc(armN.fx, armN.fy, 1.4, 0, 7); c.fillStyle = tn(PAL.skin); c.fill(); c.lineWidth = 0.5; c.strokeStyle = PAL.ink; c.stroke();
    /* gourde à la bouche, légèrement inclinée, corps sous les lèvres — pas une barre horizontale sur les yeux */
    if (drinkP > 0.01) { bottleSmall(c, armN.fx + 0.85, armN.fy + 0.55, -0.22 - drinkP * 0.2, tn, 6.6); }
    c.restore();
  }

  /* ---------- OBJETS ---------- */
  function drawBottle(c, x, y, h, glow, t) {
    var w = h * 0.5;
    c.save(); c.translate(x, y);
    if (glow) { var g = c.createRadialGradient(0, 0, 0, 0, 0, h * 1.1); g.addColorStop(0, 'rgba(160,220,255,' + (0.5 + 0.2 * Math.sin(t * 4)) + ')'); g.addColorStop(1, 'rgba(160,220,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, h * 1.1, 0, 7); c.fill(); }
    c.beginPath(); rrect(c, -w / 2, -h * 0.36, w, h * 0.86, w * 0.35); c.fillStyle = grad(c, -w / 2, 0, w / 2, 0, [0, '#bfe6ff', 0.5, '#6cb8f2', 1, '#3a8fe0']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = PAL.ink; c.stroke();
    c.beginPath(); rrect(c, -w * 0.28, -h * 0.5, w * 0.56, h * 0.18, 0.5); c.fillStyle = '#f4efe2'; c.fill(); c.stroke();
    c.beginPath(); rrect(c, -w * 0.18, -h * 0.58, w * 0.36, h * 0.12, 0.4); c.fillStyle = '#e0452b'; c.fill(); c.stroke();
    c.beginPath(); rrect(c, -w / 2 + 0.5, h * 0.02, w - 1, h * 0.22, 0.4); c.fillStyle = '#f4efe2'; c.fill();
    c.beginPath(); c.moveTo(-w * 0.28, -h * 0.2); c.lineTo(-w * 0.28, h * 0.4); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.8; c.stroke();
    c.restore();
  }
  function heartPath(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.9, y - s * 1.1, x, y - s * 0.4); c.bezierCurveTo(x + s * 0.9, y - s * 1.1, x + s * 1.5, y - s * 0.1, x, y + s * 0.9); c.closePath(); }
  function drawHeart(c, x, y, s, full) {
    heartPath(c, x, y, s); c.fillStyle = full ? grad(c, x - s, y - s, x + s, y + s, [0, '#ff7a8c', 1, '#d8283f']) : 'rgba(30,20,50,.55)'; c.fill();
    c.lineWidth = s * 0.14; c.strokeStyle = full ? '#7a1426' : 'rgba(255,255,255,.28)'; c.stroke();
    if (full) { c.beginPath(); c.ellipse(x - s * 0.5, y - s * 0.35, s * 0.22, s * 0.13, -0.6, 0, 7); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); }
  }

  /* arbres */
  function conifer(c, x, base, h, col, hi, trunk) {
    var w = h * 0.34, tiers = 5, i;
    c.fillStyle = trunk || '#3a2414'; c.fillRect(x - h * 0.03, base - h * 0.12, h * 0.06, h * 0.12);
    c.beginPath();
    for (i = 0; i < tiers; i++) {
      var y1 = base - h * 0.1 - (h * 0.9) * i / tiers * 0.92, y0 = y1 - h * 0.9 / tiers * 1.55, ww = w * (1 - i / tiers * 0.78);
      c.moveTo(x, y0); c.quadraticCurveTo(x + ww * 0.35, (y0 + y1) / 2, x + ww, y1); c.quadraticCurveTo(x + ww * 0.5, y1 + h * 0.015, x, y1 + h * 0.012); c.quadraticCurveTo(x - ww * 0.5, y1 + h * 0.015, x - ww, y1); c.quadraticCurveTo(x - ww * 0.35, (y0 + y1) / 2, x, y0);
    }
    c.fillStyle = col; c.fill();
    if (hi) { // reflet chaud côté soleil (à droite)
      c.beginPath();
      for (i = 0; i < tiers; i++) { var b1 = base - h * 0.1 - (h * 0.9) * i / tiers * 0.92, b0 = b1 - h * 0.9 / tiers * 1.55, w2 = w * (1 - i / tiers * 0.78); c.moveTo(x + 0.02 * h, b0 + (b1 - b0) * 0.1); c.quadraticCurveTo(x + w2 * 0.4, (b0 + b1) / 2, x + w2, b1); c.lineTo(x + w2 * 0.35, b1); c.quadraticCurveTo(x + w2 * 0.16, (b0 + b1) / 2, x + 0.02 * h, b0 + (b1 - b0) * 0.1); }
      c.fillStyle = hi; c.fill();
    }
  }
  function beech(c, x, base, h, col, hi) {
    c.fillStyle = '#4a3426'; c.beginPath(); c.moveTo(x - h * 0.04, base); c.lineTo(x - h * 0.025, base - h * 0.5); c.lineTo(x + h * 0.025, base - h * 0.5); c.lineTo(x + h * 0.04, base); c.fill();
    var cx = [[0, -0.66, 0.3], [-0.18, -0.52, 0.22], [0.2, -0.5, 0.23], [0.02, -0.82, 0.2], [-0.12, -0.74, 0.17], [0.16, -0.72, 0.17]];
    c.fillStyle = col; c.beginPath(); cx.forEach(function (q) { c.moveTo(x + q[0] * h + q[2] * h, base + q[1] * h); c.arc(x + q[0] * h, base + q[1] * h, q[2] * h, 0, 7); }); c.fill();
    if (hi) { c.fillStyle = hi; c.beginPath(); cx.forEach(function (q) { c.moveTo(x + (q[0] + 0.07) * h + q[2] * h * 0.62, base + (q[1] - 0.03) * h); c.arc(x + (q[0] + 0.07) * h, base + (q[1] - 0.03) * h, q[2] * h * 0.62, 0, 7); }); c.fill(); }
  }

  function cloud(c, x, y, s, a, tint) {
    c.save(); c.translate(x, y); c.globalAlpha = a;
    var blobs = [[0, 0, 11], [11, -3, 9], [-11, 1, 8], [20, 2, 7], [-19, 3, 6], [5, 3, 10]];
    blobs.forEach(function (b) { var g = c.createRadialGradient(b[0] * s, b[1] * s - b[2] * s * 0.3, 0, b[0] * s, b[1] * s, b[2] * s); g.addColorStop(0, tint[0]); g.addColorStop(0.7, tint[1]); g.addColorStop(1, tint[2]); c.fillStyle = g; c.beginPath(); c.arc(b[0] * s, b[1] * s, b[2] * s, 0, 7); c.fill(); });
    c.restore();
  }

  /* pierre qui roule (polygone irrégulier) */
  function A_rockPal() { return window.Art && window.Art.rockPal; }
  function drawRock(c, x, y, r, rot, seed, lit) {
    c.save(); c.translate(x, y); c.rotate(rot);
    var n = 9, pts = [], i;
    for (i = 0; i < n; i++) { var a = i / n * Math.PI * 2, rr = r * (0.82 + hash(i, seed) * 0.3); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    c.beginPath(); smoothPath(c, pts.concat([pts[0], pts[1]]).slice(0, n + 2)); c.closePath();
    var RP = A_rockPal(); c.fillStyle = grad(c, -r, -r, r, r, RP ? [0, RP.hi, 0.45, RP.mid, 1, RP.lo] : [0, '#7a5c5c', 0.45, '#3f2c32', 1, '#1f1519']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = RP ? RP.line : '#150d12'; c.stroke();
    // scories rouges + reflet chaud
    c.fillStyle = RP ? RP.spot : 'rgba(190,70,40,.55)'; for (i = 0; i < 4; i++) { c.beginPath(); c.arc((hash(i, seed + 3) - 0.5) * r * 1.1, (hash(i, seed + 4) - 0.5) * r * 1.1, r * (0.1 + hash(i, seed + 5) * 0.1), 0, 7); c.fill(); }
    c.fillStyle = 'rgba(20,10,14,.5)'; for (i = 0; i < 3; i++) { c.beginPath(); c.arc((hash(i, seed + 8) - 0.5) * r * 1.2, (hash(i, seed + 9) - 0.5) * r * 1.2, r * 0.12, 0, 7); c.fill(); }
    c.restore();
  }

  /* motif de scories (tuile transparente) pour le terrain, résolution = px par unité monde */
  function scoriaTile(pxPerUnit, pal) {
    var N = 56, size = Math.round(N * pxPerUnit), cv = document.createElement('canvas'); cv.width = cv.height = size; var x = cv.getContext('2d'), k = size / N, i;
    for (i = 0; i < 150; i++) {
      var px = hash(i, 11) * N, py = hash(i, 12) * N, r = hash(i, 13), rad = (0.5 + hash(i, 14) * 1.5) * k;
      x.fillStyle = pal ? (r < 0.45 ? pal[0] : r < 0.75 ? pal[1] : r < 0.9 ? pal[2] : pal[3]) : (r < 0.45 ? 'rgba(24,14,20,.42)' : r < 0.75 ? 'rgba(190,76,44,.34)' : r < 0.9 ? 'rgba(236,160,110,.22)' : 'rgba(10,6,10,.5)');
      [[0, 0], [-N, 0], [N, 0], [0, -N], [0, N]].forEach(function (o) { x.beginPath(); x.arc((px + o[0]) * k, (py + o[1]) * k, rad, 0, 7); x.fill(); });
    }
    return { canvas: cv, units: N };
  }

  /* Coupe de sol F-DA-01 : grain pré-calculé (tuile large, sans bande régulière) + ombre de profondeur + tramage de ciel. */
  var CUT_CACHE = {}, SHADE_CACHE = {}, DITHER_CV = null, DITHER_PAT = {}, DITHER_CTX = null;

  var PROFILE_CACHE = {};
  function cutProfile(id) {
    if (PROFILE_CACHE[id]) { return PROFILE_CACHE[id]; }
    var pr;
    if (id === 'mary') {
      /* trachyte / andésite : gris minéral, ocre grisé — pas une terre brune */
      pr = { id: 'mary', fill: '#8e8a80',
        beds: ['#c8c2b0', '#a8a090', '#8a8478', '#d8d2c4', '#6a665c'],
        grain: ['rgba(90,86,78,.20)', 'rgba(220,214,200,.16)', 'rgba(40,36,32,.18)', 'rgba(180,170,150,.11)'],
        shade: 'rgba(36,32,28,', tilt: 0.012, skip: 0.38, snowLip: false };
    } else if (id === 'sancy') {
      /* andésite / basalte gris-brun dense sous la lèvre de neige */
      pr = { id: 'sancy', fill: '#3a3532',
        beds: ['#4a443e', '#2a282c', '#5a5450', '#4a4038', '#1e1c20'],
        grain: ['rgba(20,18,22,.30)', 'rgba(90,86,80,.16)', 'rgba(160,140,110,.10)', 'rgba(10,10,12,.26)'],
        shade: 'rgba(16,14,16,', tilt: 0.010, skip: 0.12, snowLip: true };
    } else if (id === 'basque') {
      pr = { id: 'basque', fill: '#5c4030',
        beds: ['#6a4e32', '#8a6a44', '#c4b490', '#5a5040', '#3e2e20'],
        grain: ['rgba(50,36,20,.20)', 'rgba(160,130,80,.14)', 'rgba(220,200,160,.11)', 'rgba(30,22,14,.18)'],
        shade: 'rgba(28,20,12,', tilt: 0.020, skip: 0.20, snowLip: false };
    } else if (id === 'jura') {
      pr = { id: 'jura', fill: '#c4bba8',
        beds: ['#d8d2c0', '#b8b09c', '#8a8678', '#c8bea4', '#6e6a5c', '#e8e4d4'],
        grain: ['rgba(60,56,48,.14)', 'rgba(230,224,210,.13)', 'rgba(140,150,100,.09)', 'rgba(40,36,30,.14)'],
        shade: 'rgba(28,30,24,', tilt: 0.055, skip: 0.16, snowLip: false };
    } else {
      pr = { id: 'auvergne', fill: '#7a3428',
        beds: ['#5a241c', '#3a1a18', '#8a4a32', '#c47a50', '#241014'],
        grain: ['rgba(24,14,20,.26)', 'rgba(190,76,44,.20)', 'rgba(236,160,110,.12)', 'rgba(10,6,10,.28)'],
        shade: 'rgba(24,8,16,', tilt: 0.008, skip: 0.14, snowLip: false };
    }
    PROFILE_CACHE[id] = pr;
    return pr;
  }

  function wr(v, m) { v = v % m; return v < 0 ? v + m : v; }

  function cutSheet(id) {
    if (CUT_CACHE[id]) { return CUT_CACHE[id]; }
    var pr = cutProfile(id), U = 768, V = 256, cv = document.createElement('canvas');
    cv.width = U; cv.height = V;
    var x = cv.getContext('2d'), i, px, py, rad, ox, oy, len, ang;
    /* taches petites et irrégulières — pas de gros ovales lisibles comme des bulles */
    for (i = 0; i < 320; i++) {
      px = hash(i, 11) * U; py = hash(i, 12) * V;
      rad = 1.1 + hash(i, 13) * 3.4;
      x.fillStyle = pr.grain[(hash(i, 14) * pr.grain.length) | 0];
      for (ox = -U; ox <= U; ox += U) {
        for (oy = -V; oy <= V; oy += V) {
          x.beginPath(); x.ellipse(px + ox, py + oy, rad, rad * (0.4 + 0.4 * hash(i, 15)), (hash(i, 16) - 0.5) * 1.1, 0, 7); x.fill();
        }
      }
    }
    for (i = 0; i < 1600; i++) {
      px = hash(i, 21) * U; py = hash(i, 22) * V;
      rad = 0.3 + hash(i, 23) * 1.15;
      x.fillStyle = pr.grain[(hash(i, 24) * pr.grain.length) | 0];
      for (ox = -U; ox <= U; ox += U) {
        for (oy = -V; oy <= V; oy += V) {
          x.beginPath(); x.arc(px + ox, py + oy, rad, 0, 7); x.fill();
        }
      }
    }
    x.lineCap = 'round';
    for (i = 0; i < 48; i++) {
      if (hash(i, 31) > 0.62) { continue; }
      px = hash(i, 32) * U; py = hash(i, 33) * V;
      len = 7 + hash(i, 34) * 20; ang = hash(i, 35) * 6.28;
      x.strokeStyle = pr.grain[3]; x.lineWidth = 0.45 + hash(i, 36) * 0.7;
      for (ox = -U; ox <= U; ox += U) {
        for (oy = -V; oy <= V; oy += V) {
          x.beginPath();
          x.moveTo(px + ox, py + oy);
          x.lineTo(px + ox + Math.cos(ang) * len, py + oy + Math.sin(ang) * len * 0.55);
          x.stroke();
        }
      }
    }
    CUT_CACHE[id] = { canvas: cv, units: U, unitsH: V, id: id };
    return CUT_CACHE[id];
  }

  function cutShadeCanvas(id) {
    if (SHADE_CACHE[id]) { return SHADE_CACHE[id]; }
    var pr = cutProfile(id), cv = document.createElement('canvas');
    cv.width = 8; cv.height = 256;
    var x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, pr.shade + '0)');
    g.addColorStop(0.28, pr.shade + '0.03)');
    g.addColorStop(0.62, pr.shade + '0.14)');
    g.addColorStop(1, pr.shade + '0.32)');
    x.fillStyle = g; x.fillRect(0, 0, 8, 256);
    SHADE_CACHE[id] = cv;
    return cv;
  }

  function skyDitherPattern() {
    if (DITHER_CV) { return DITHER_CV; }
    var N = 64, cv = document.createElement('canvas'); cv.width = cv.height = N;
    var x = cv.getContext('2d'), img = x.createImageData(N, N), i, j, bayer, n, v, idx;
    var B = [
      0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
      12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
      3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
      15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21
    ];
    for (j = 0; j < N; j++) {
      for (i = 0; i < N; i++) {
        /* bruit très faible (±1 niveau), sans grille Bayer visible au zoom */
        n = hash(i, j + 91);
        v = n > 0.5 ? 132 : 124;
        idx = (j * N + i) * 4;
        img.data[idx] = v; img.data[idx + 1] = v; img.data[idx + 2] = v; img.data[idx + 3] = 4;
      }
    }
    x.putImageData(img, 0, 0);
    DITHER_CV = cv;
    return cv;
  }

  function skyDitherFill(c, scale) {
    var key = String(Math.round((scale || 3) * 100));
    if (!DITHER_PAT[key] || DITHER_CTX !== c) {
      var p = c.createPattern(skyDitherPattern(), 'repeat');
      if (p && p.setTransform) { p.setTransform(new DOMMatrix().scale(1 / (scale || 3))); }
      DITHER_PAT[key] = p; DITHER_CTX = c;
    }
    return DITHER_PAT[key];
  }

  window.Art = {
    PAL: PAL, hash: hash, clamp: clamp, lerp: lerp, sstep: sstep, noise: noise, fbm: fbm, mix: mix, rgba: rgba, grad: grad, smoothPath: smoothPath, rrect: rrect,
    drawHiker: drawHiker, drawBottle: drawBottle, drawHeart: drawHeart, conifer: conifer, beech: beech, cloud: cloud, drawRock: drawRock, scoriaTile: scoriaTile,
    cutProfile: cutProfile, cutSheet: cutSheet, cutShadeCanvas: cutShadeCanvas, skyDitherPattern: skyDitherPattern, skyDitherFill: skyDitherFill
  };
})();
