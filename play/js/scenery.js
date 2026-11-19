/* Décors vectoriels haute résolution (v0.2.8) : ciel de crépuscule, nuages, chaîne des Puys, puy de Dôme (antenne, observatoire,
   ruines du temple de Mercure), collines à brume atmosphérique, et végétation ancrée au terrain (sapins, hêtres, buissons,
   callune, fougères, touffes). Tout est tracé en vectoriel dans le repère monde du jeu : la toile est déjà à la résolution
   de l'écran (devicePixelRatio), donc rien n'est une image agrandie. Aucun fichier image.
   Les niveaux (js/game.js, js/pariou.js) appellent Scenery.farBackdrop / rows / lip ; réglages = paramètres de ces appels. */
(function () {
  'use strict';
  var A = window.Art, clamp = A.clamp, lerp = A.lerp, sstep = A.sstep, mix = A.mix, rgba = A.rgba, hash = A.hash, fbm = A.fbm;
  var TAU = Math.PI * 2;

  /* ------------------------------------------------------------------ utilitaires */
  function grad(c, y0, y1, stops) { var g = c.createLinearGradient(0, y0, 0, y1); for (var i = 0; i < stops.length; i += 2) { g.addColorStop(stops[i], stops[i + 1]); } return g; }
  function tone(col, haze, hz, amt) { return amt > 0.001 ? mix(col, hz || '#d8a0b8', amt) : col; }
  // courbe lisse : liste de points → chemin (Catmull-Rom)
  function silhouette(c, vw, base, off, fn, bottom, step) {
    var st = step || 2, w0 = Math.floor((off - 8) / st) * st, w1 = off + vw + 10, wx;
    c.beginPath(); c.moveTo(w0 - off, bottom);
    for (wx = w0; wx <= w1; wx += st) { c.lineTo(wx - off, base - fn(wx)); }
    c.lineTo(wx - st - off, bottom); c.closePath();
  }
  function edgeLine(c, vw, base, off, fn, step) {
    var st = step || 2, w0 = Math.floor((off - 8) / st) * st, w1 = off + vw + 10, wx;
    c.beginPath(); for (wx = w0; wx <= w1; wx += st) { var yy = base - fn(wx); if (wx === w0) { c.moveTo(wx - off, yy); } else { c.lineTo(wx - off, yy); } }
  }

  /* ------------------------------------------------------------------ végétation (repère monde, base = pied de l'arbre) */
  var TREE = {
    fir:   { dark: '#1f4636', base: '#2f6a4c', lite: '#6eae62', rim: '#c4e08a', trunk: '#4a3022' },
    firB:  { dark: '#233f3a', base: '#34624f', lite: '#72a470', rim: '#c8dc98', trunk: '#4a3022' },
    beech: { dark: '#3a6a34', base: '#5c9440', lite: '#9fcc58', rim: '#ecf59a', trunk: '#8a8478' },
    beechA:{ dark: '#7a6a24', base: '#b19a34', lite: '#e6cc58', rim: '#fff0a0', trunk: '#8a8478' },
    oak:   { dark: '#2a4a22', base: '#3e6a30', lite: '#6a9448', rim: '#c8dc7a', trunk: '#5a3a22' }
  };
  function fir(c, x, base, h, o) {
    o = o || {}; var T = o.pal || TREE.fir, hz = o.haze || 0, hc = o.hazeCol, t = o.t || 0, seed = o.seed || 0;
    var dk = tone(T.dark, 0, hc, hz), bs = tone(T.base, 0, hc, hz), lt = tone(T.lite, 0, hc, hz * 0.8), rm = tone(T.rim, 0, hc, hz * 0.7);
    var n = h > 34 ? 7 : h > 18 ? 5 : 4, w = h * (o.slim || 0.34), sw = (o.sway === false ? 0 : Math.sin(t * 1.15 + x * 0.17 + seed) * h * 0.012), i;
    c.fillStyle = tone(T.trunk, 0, hc, hz); c.fillRect(x - h * 0.025, base - h * 0.16, h * 0.05, h * 0.2);
    for (i = 0; i < n; i++) {
      var t0 = i / n, yb = base - h * 0.09 - h * 0.86 * t0 * 0.93, yt = yb - h * 0.86 / n * 1.85, ww = w * (1 - t0 * 0.8), s0 = sw * t0, s1 = sw * (t0 + 1 / n);
      var tipx = x + s1 * 1.5, bx = x + s0;
      // silhouette de l'étage : pointe, flanc droit galbé, bord inférieur festonné, flanc gauche
      c.beginPath(); c.moveTo(tipx, yt);
      c.quadraticCurveTo(bx + ww * 0.42, (yt + yb) * 0.5 - h * 0.01, bx + ww, yb);
      var sc = 3, k; for (k = 0; k < sc; k++) { var a0 = bx + ww - (2 * ww) * k / sc, a1 = bx + ww - (2 * ww) * (k + 1) / sc; c.quadraticCurveTo((a0 + a1) / 2, yb + h * (0.034 + 0.012 * hash(i * 7 + k, seed + 3)), a1, yb - h * 0.004 * (k % 2)); }
      c.quadraticCurveTo(bx - ww * 0.42, (yt + yb) * 0.5 - h * 0.01, tipx, yt); c.closePath();
      c.fillStyle = i % 2 ? bs : dk; c.fill();
      // moitié éclairée (côté soleil, à droite)
      c.beginPath(); c.moveTo(tipx, yt); c.quadraticCurveTo(bx + ww * 0.42, (yt + yb) * 0.5 - h * 0.01, bx + ww, yb);
      c.quadraticCurveTo(bx + ww * 0.55, yb + h * 0.03, bx + ww * 0.05, yb + h * 0.005); c.quadraticCurveTo(bx + ww * 0.1, (yt + yb) * 0.5, tipx, yt); c.closePath();
      c.fillStyle = lt; c.globalAlpha = 0.62; c.fill(); c.globalAlpha = 1;
      if (h > 26) { c.beginPath(); c.moveTo(tipx + 0.2, yt + 0.5); c.quadraticCurveTo(bx + ww * 0.42, (yt + yb) * 0.5 - h * 0.01, bx + ww * 0.96, yb - 0.3); c.strokeStyle = rm; c.globalAlpha = 0.55; c.lineWidth = Math.max(0.35, h * 0.012); c.lineCap = 'round'; c.stroke(); c.globalAlpha = 1; }
    }
  }
  function beechTree(c, x, base, h, o) {
    o = o || {}; var T = o.pal || TREE.beech, hz = o.haze || 0, hc = o.hazeCol, seed = o.seed || 0, t = o.t || 0;
    var dk = tone(T.dark, 0, hc, hz), bs = tone(T.base, 0, hc, hz), lt = tone(T.lite, 0, hc, hz * 0.8), rm = tone(T.rim, 0, hc, hz * 0.7);
    var sw = (o.sway === false ? 0 : Math.sin(t * 0.9 + x * 0.21 + seed) * h * 0.01);
    // tronc gris clair, léger galbe, deux branches
    var tw = h * 0.05; c.fillStyle = tone(T.trunk, 0, hc, hz);
    c.beginPath(); c.moveTo(x - tw * 1.1, base + 1); c.quadraticCurveTo(x - tw * 0.5, base - h * 0.25, x - tw * 0.5 + sw * 0.4, base - h * 0.52); c.lineTo(x + tw * 0.5 + sw * 0.4, base - h * 0.52); c.quadraticCurveTo(x + tw * 0.5, base - h * 0.25, x + tw * 1.1, base + 1); c.closePath(); c.fill();
    c.strokeStyle = tone(T.trunk, 0, hc, hz); c.lineWidth = Math.max(0.5, tw * 0.5); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x + sw * 0.3, base - h * 0.4); c.lineTo(x - h * 0.17 + sw, base - h * 0.6); c.moveTo(x + sw * 0.3, base - h * 0.44); c.lineTo(x + h * 0.16 + sw, base - h * 0.62); c.stroke();
    // houppier en 3 passes (ombre, masse, lumière) de lobes qui se chevauchent
    var lobes = [[0, -0.7, 0.3], [-0.2, -0.56, 0.22], [0.22, -0.56, 0.23], [-0.05, -0.9, 0.21], [-0.2, -0.8, 0.17], [0.2, -0.78, 0.18], [0.0, -0.58, 0.24], [-0.3, -0.64, 0.14], [0.3, -0.66, 0.14]], i;
    var pass = [[dk, 0.02, 0.05, 1], [bs, 0, 0, 0.86], [lt, -0.05, -0.05, 0.6]];
    for (var ps = 0; ps < 3; ps++) {
      c.fillStyle = pass[ps][0]; c.beginPath();
      for (i = 0; i < lobes.length; i++) { var q = lobes[i], r = q[2] * h * pass[ps][3], cx = x + sw + (q[0] + pass[ps][2]) * h, cy = base + (q[1] + pass[ps][1]) * h; c.moveTo(cx + r, cy); c.arc(cx, cy, r, 0, TAU); }
      c.fill();
    }
    if (h > 22) { // points de lumière dans le feuillage
      c.fillStyle = rm; c.globalAlpha = 0.6; var m = h > 40 ? 9 : 5;
      for (i = 0; i < m; i++) { c.beginPath(); c.arc(x + sw + (hash(i, seed) - 0.3) * h * 0.5, base - h * (0.5 + hash(i, seed + 5) * 0.4), Math.max(0.35, h * 0.018), 0, TAU); c.fill(); } c.globalAlpha = 1;
    }
  }
  function bush(c, x, base, r, o) {                 // buisson / genévrier arrondi
    o = o || {}; var pal = o.pal || { dark: '#264d34', base: '#3f7a44', lite: '#7fb55a' }, hz = o.haze || 0, hc = o.hazeCol, seed = o.seed || 0;
    var dk = tone(pal.dark, 0, hc, hz), bs = tone(pal.base, 0, hc, hz), lt = tone(pal.lite, 0, hc, hz * 0.8);
    var L = [[-0.55, -0.4, 0.62], [0.5, -0.38, 0.6], [0, -0.7, 0.72], [-0.15, -0.3, 0.7]], i;
    c.fillStyle = dk; c.beginPath(); for (i = 0; i < L.length; i++) { c.moveTo(x + L[i][0] * r + L[i][2] * r, base + L[i][1] * r + r * 0.08); c.ellipse(x + L[i][0] * r, base + L[i][1] * r + r * 0.08, L[i][2] * r, L[i][2] * r * 0.85, 0, 0, TAU); } c.fill();
    c.fillStyle = bs; c.beginPath(); for (i = 0; i < L.length; i++) { c.moveTo(x + L[i][0] * r + L[i][2] * r * 0.92, base + L[i][1] * r); c.ellipse(x + L[i][0] * r, base + L[i][1] * r, L[i][2] * r * 0.92, L[i][2] * r * 0.78, 0, 0, TAU); } c.fill();
    c.fillStyle = lt; c.globalAlpha = 0.7; c.beginPath(); for (i = 0; i < L.length; i++) { c.moveTo(x + (L[i][0] + 0.18) * r + L[i][2] * r * 0.5, base + (L[i][1] - 0.15) * r); c.ellipse(x + (L[i][0] + 0.18) * r, base + (L[i][1] - 0.15) * r, L[i][2] * r * 0.5, L[i][2] * r * 0.38, -0.2, 0, TAU); } c.fill(); c.globalAlpha = 1;
  }
  function heather(c, x, base, r, o) {              // touffe de callune : dôme brun-vert piqueté de rose-violet
    o = o || {}; var seed = o.seed || 0, hz = o.haze || 0, hc = o.hazeCol, i, fl = o.flower || '#b862a8';
    c.fillStyle = tone('#4b4a36', 0, hc, hz); c.beginPath(); c.ellipse(x, base - r * 0.32, r * 1.05, r * 0.62, 0, Math.PI, 0); c.lineTo(x + r * 1.05, base + 0.3); c.lineTo(x - r * 1.05, base + 0.3); c.closePath(); c.fill();
    c.fillStyle = tone('#6d7a42', 0, hc, hz); c.beginPath(); c.ellipse(x + r * 0.1, base - r * 0.36, r * 0.82, r * 0.46, 0, Math.PI, 0); c.lineTo(x + r * 0.9, base - r * 0.2); c.closePath(); c.fill();
    c.fillStyle = tone(fl, 0, hc, hz * 0.7);
    for (i = 0; i < 9; i++) { var a = hash(i, seed) * Math.PI, rr = (0.25 + hash(i, seed + 3) * 0.7) * r; c.beginPath(); c.arc(x + Math.cos(Math.PI + a) * rr * 1.0, base - r * 0.32 - Math.sin(a) * rr * 0.5 - r * 0.05, Math.max(0.28, r * 0.075), 0, TAU); c.fill(); }
  }
  function oakTree(c, x, base, h, o) {
    o = o || {}; var T = o.pal || TREE.oak, hz = o.haze || 0, hc = o.hazeCol, seed = o.seed || 0, t = o.t || 0;
    var sw = o.sway !== false ? Math.sin((t || 0) * 1.3 + seed) * 0.6 : 0;
    var tw = Math.max(1.4, h * 0.07), th = h * 0.42;
    c.fillStyle = T.trunk; c.fillRect(x - tw / 2, base - th, tw, th + 1);
    c.fillStyle = 'rgba(20,10,6,.25)'; c.fillRect(x - tw / 2, base - th, tw * 0.35, th);
    var cy = base - th - h * 0.22, R = h * 0.42;
    function lobe(cx, cy2, rx, ry, col) {
      c.fillStyle = col; c.beginPath(); c.ellipse(cx + sw, cy2, rx, ry, 0, 0, 7); c.fill();
    }
    lobe(x - R * 0.45, cy + R * 0.15, R * 0.55, R * 0.48, T.dark);
    lobe(x + R * 0.4, cy + R * 0.12, R * 0.52, R * 0.46, T.dark);
    lobe(x, cy - R * 0.15, R * 0.62, R * 0.55, T.base);
    lobe(x - R * 0.2, cy - R * 0.35, R * 0.38, R * 0.32, T.lite);
    lobe(x + R * 0.15, cy - R * 0.28, R * 0.28, R * 0.24, T.rim);
    if (hz > 0 && hc) { c.globalAlpha = hz; c.fillStyle = hc; c.beginPath(); c.ellipse(x + sw, cy, R * 0.7, R * 0.6, 0, 0, 7); c.fill(); c.globalAlpha = 1; }
  }

  function fern(c, x, base, s, o) {
    o = o || {}; var t = o.t || 0, seed = o.seed || 0, col = o.col || '#4f8f46', i, k;
    c.lineCap = 'round';
    for (i = -3; i <= 3; i++) {
      var ang = i * 0.34, len = s * (0.8 + 0.2 * hash(i, seed)), sw = Math.sin(t * 1.4 + x * 0.5 + i) * s * 0.03;
      var ex = x + Math.sin(ang) * len + sw, ey = base - Math.cos(ang) * len * 0.78, mx = x + Math.sin(ang) * len * 0.55, my = base - Math.cos(ang) * len * 0.62 - s * 0.12;
      c.strokeStyle = col; c.lineWidth = Math.max(0.35, s * 0.05); c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
      c.lineWidth = Math.max(0.25, s * 0.034); c.globalAlpha = 0.85;
      c.beginPath(); for (k = 1; k <= 5; k++) { var tt = k / 6, px = (1 - tt) * (1 - tt) * x + 2 * (1 - tt) * tt * mx + tt * tt * ex, py = (1 - tt) * (1 - tt) * base + 2 * (1 - tt) * tt * my + tt * tt * ey, lw = s * 0.18 * (1 - tt); c.moveTo(px, py); c.lineTo(px - lw * (1 + Math.abs(Math.cos(ang))), py + lw * 0.5); c.moveTo(px, py); c.lineTo(px + lw * (1 + Math.abs(Math.cos(ang))), py + lw * 0.5); } c.stroke(); c.globalAlpha = 1;
    }
  }
  function tuft(c, x, base, s, o) {                 // touffe d'herbe : lames courbes qui ondulent
    o = o || {}; var t = o.t || 0, col = o.col || '#78b04c', col2 = o.col2 || '#a7d36c', i, n = o.n || 6;
    c.lineCap = 'round';
    for (var pass = 0; pass < 2; pass++) {
      c.strokeStyle = pass ? col2 : col; c.lineWidth = Math.max(0.3, s * (pass ? 0.07 : 0.1)); c.beginPath();
      for (i = 0; i < n; i++) { var u = (i / (n - 1) - 0.5) * 2, sw = Math.sin(t * 1.7 + x * 0.6 + i * 0.9) * s * 0.07, h = s * (0.7 + 0.5 * hash(i, (x * 3) | 0) - Math.abs(u) * 0.25) * (pass ? 0.85 : 1);
        c.moveTo(x + u * s * 0.22, base + 0.3); c.quadraticCurveTo(x + u * s * 0.4, base - h * 0.6, x + u * s * 0.8 + sw + (pass ? 0.3 : 0), base - h); }
      c.stroke();
    }
  }
  function broom(c, x, base, s, o) {                // genêt : tiges vert vif + fleurs jaunes
    o = o || {}; var i, t = o.t || 0; c.lineCap = 'round'; c.strokeStyle = '#6a9a3c'; c.lineWidth = Math.max(0.3, s * 0.06); c.beginPath();
    for (i = 0; i < 7; i++) { var u = (i / 6 - 0.5) * 2; c.moveTo(x, base); c.quadraticCurveTo(x + u * s * 0.4, base - s * 0.7, x + u * s * 0.7 + Math.sin(t + i) * s * 0.03, base - s * (0.9 - Math.abs(u) * 0.25)); } c.stroke();
    c.fillStyle = '#ffd84a'; for (i = 0; i < 6; i++) { var u2 = (hash(i, (x * 5) | 0) - 0.5) * 2; c.beginPath(); c.arc(x + u2 * s * 0.55, base - s * (0.55 + hash(i, 9) * 0.35), Math.max(0.3, s * 0.045), 0, TAU); c.fill(); }
  }
  function flower(c, x, base, s, col) { c.strokeStyle = '#4d7a38'; c.lineWidth = Math.max(0.25, s * 0.08); c.beginPath(); c.moveTo(x, base); c.lineTo(x, base - s); c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(x, base - s, Math.max(0.35, s * 0.2), 0, TAU); c.fill(); }

  /* ------------------------------------------------------------------ rangées de végétation ancrées au terrain
     Chaque rangée est une colline (contour = profil du sol relevé de up(x) px) remplie d'un sous-bois sombre ; les arbres sont
     plantés sur ce contour, leur pied enfoncé de quelques pixels (jamais de tronc qui flotte). Du plus lointain au plus proche. */
  function rows(c, xa, xb, bottom, ctx, cfg) {
    var GF = ctx.GF, len = ctx.len, t = ctx.time, rw, x, i;
    function gf(xx) { return GF[Math.max(0, Math.min(len, xx | 0))]; }
    for (var ri = 0; ri < cfg.rows.length; ri++) {
      rw = cfg.rows[ri]; var step = rw.step, up = rw.up, dens = rw.dens, size = rw.size, pick = rw.kind, seed = rw.seed || (ri * 17 + 3), hz = rw.haze || 0, hc = cfg.hazeCol;
      // sous-bois : colline pleine, uniquement là où elle dépasse du sol
      var any = false, s0 = Math.floor(xa / 6) * 6, pth = new Path2D(), started = false, lit = new Path2D(), litOn = false;
      for (x = s0; x <= xb + 6; x += 6) {
        var u = up(x); if (u > 1.6) { any = true; }
        var yc = gf(x) - u + 2 * (fbm(x / 23, seed) - 0.5) * Math.min(1, u / 12);
        if (!started) { pth.moveTo(x, bottom); pth.lineTo(x, yc); started = true; } else { pth.lineTo(x, yc); }
        if (u > 1.6) { if (!litOn) { lit.moveTo(x, yc); litOn = true; } else { lit.lineTo(x, yc); } } else { litOn = false; }
      }
      if (any) {
        pth.lineTo(x - 6, bottom); pth.closePath();
        var gy0 = ctx.camY, gg = c.createLinearGradient(0, gy0, 0, gy0 + ctx.vh);
        gg.addColorStop(0, tone(rw.fillTop || '#2d5a42', 0, hc, hz)); gg.addColorStop(1, tone(rw.fillBot || '#1b3a2e', 0, hc, hz * 0.6));
        c.fillStyle = gg; c.fill(pth);
      }
      // arbres / buissons
      for (x = Math.floor((xa - step * 3) / step) * step; x < xb + step * 3; x += step) {
        var h = hash(x, seed); var d = dens(x); if (h > d) { continue; }
        var tx = x + hash(x, seed + 1) * step * 0.85, uu = up(tx), yb = gf(tx);
        if (tx < 0 || !isFinite(yb) || !isFinite(uu)) { continue; }
        var kind = pick(tx, hash(x, seed + 5));
        if (uu < (kind === 'bush' || kind === 'heather' ? 1.2 : 3.5)) { continue; }
        /* Pied calé sur le même contour que le sous-bois (fbm identique), plus un enfoncement constant :
           plus de décalage hash/fbm qui faisait flotter ou s'enfoncer hors tolérance. */
        var contour = yb - uu + 2 * (fbm(tx / 23, seed) - 0.5) * Math.min(1, uu / 12);
        var sinkAmt = (rw.sink != null ? rw.sink : 3);
        var by = contour + sinkAmt, sz = size(tx) * (0.78 + 0.5 * hash(x, seed + 4));
        if (window.__treeAuditOn) { window.__treeAudit.push({ kind: 'flora', tx: tx, uu: uu, by: by, yb: yb, typ: kind, contour: contour, sink: sinkAmt, ok: by >= contour - 0.25 && by <= contour + sinkAmt + 0.25 }); }
        var o = { t: t, seed: x, haze: hz, hazeCol: hc, sway: rw.sway !== false };
        if (kind === 'fir') { o.pal = rw.firPal || TREE.fir; fir(c, tx, by, sz, o); }
        else if (kind === 'beech') { o.pal = hash(x, seed + 6) > (rw.autumn || 0.86) ? TREE.beechA : (rw.beechPal || TREE.beech); beechTree(c, tx, by, sz, o); }
        else if (kind === 'oak') { o.pal = rw.oakPal || TREE.oak; oakTree(c, tx, by, sz * 1.08, o); }
        else if (kind === 'heather') { heather(c, tx, by, sz * 0.5, o); }
        else { o.pal = rw.bushPal; bush(c, tx, by, sz * 0.5, o); }
      }
    }
  }

  /* ------------------------------------------------------------------ végétation de premier plan, plantée sur le chemin */
  function lip(c, xa, xb, ctx, cfg) {
    var G = ctx.G, TY = ctx.TYPE, t = ctx.time, x;
    for (x = Math.floor(xa / 5) * 5; x < xb + 5; x += 5) {
      var gy = G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
      var ty = TY[x | 0]; if (ty === 1 || ty === 4) { continue; }
      var m = cfg.mix(x), h = hash(x, 5), tx = x + hash(x, 6) * 4, by = gy + 0.5;
      if (h > m.dens) { continue; }
      var pick = hash(x, 7) * (m.grass + m.fern + m.heather + m.bush + m.broom + m.flower), acc = m.grass;
      var o = { t: t, seed: x, haze: 0 };
      if (pick < acc) { tuft(c, tx, by, 3.2 + 3 * hash(x, 8), { t: t, col: m.gcol, col2: m.gcol2, n: 5 + ((hash(x, 9) * 3) | 0) }); continue; }
      acc += m.fern; if (pick < acc) { fern(c, tx, by, 5 + 4 * hash(x, 8), { t: t, seed: x, col: m.fcol || '#4f8f46' }); continue; }
      acc += m.heather; if (pick < acc) { heather(c, tx, by, 3 + 2.2 * hash(x, 8), { seed: x, flower: hash(x, 10) > 0.5 ? '#b862a8' : '#d07ab8' }); continue; }
      acc += m.bush; if (pick < acc) { bush(c, tx, by + 0.6, 3.6 + 2.6 * hash(x, 8), { seed: x, pal: m.bushPal }); continue; }
      acc += m.broom; if (pick < acc) { broom(c, tx, by, 5 + 3 * hash(x, 8), { t: t }); continue; }
      flower(c, tx, by, 3 + 2 * hash(x, 8), hash(x, 11) > 0.5 ? '#f6f0d0' : '#f0b0d0');
    }
  }

  /* ------------------------------------------------------------------ ciel, nuages, reliefs lointains */
  function sky(c, vw, vh, gs0, hy, time) {
    c.fillStyle = grad(c, 0, hy + 12, [0, '#171c4f', 0.22, '#2c2f7a', 0.42, '#6a3f95', 0.6, '#c24f8e', 0.78, '#ff8f62', 0.92, '#ffc680', 1, '#ffe2a8']);
    c.fillRect(0, 0, vw, vh);
    // étoiles : fines, scintillantes, seulement dans le haut
    for (var i = 0; i < 26; i++) { var sx = hash(i, 301) * vw, sy = hash(i, 302) * hy * 0.5, tw = 0.35 + 0.35 * Math.sin(time * (1 + hash(i, 303) * 1.5) + i * 2.1); c.fillStyle = 'rgba(255,248,226,' + tw.toFixed(2) + ')'; c.beginPath(); c.arc(sx, sy, 0.3 + hash(i, 304) * 0.35, 0, TAU); c.fill(); }
    // soleil bas, derrière les reliefs, halo large et doux
    var sx2 = vw * 0.8, sy2 = hy - 6, g = c.createRadialGradient(sx2, sy2, 0, sx2, sy2, vh * 0.9);
    g.addColorStop(0, 'rgba(255,246,214,.95)'); g.addColorStop(0.05, 'rgba(255,226,160,.75)'); g.addColorStop(0.18, 'rgba(255,170,120,.34)'); g.addColorStop(0.5, 'rgba(255,120,120,.1)'); g.addColorStop(1, 'rgba(255,120,120,0)');
    c.fillStyle = g; c.fillRect(0, 0, vw, vh);
  }
  function cloud(c, x, y, s, tone1, tone2, alpha) {
    // masse en lobes (union d'arcs), dégradé clair dessus / rosé dessous, halo adouci
    var L = [[0, 0, 11], [11, -3, 9], [-11, 1, 8], [21, 2, 7], [-20, 3, 6.5], [5, -5, 8], [-4, 3, 9]], i;
    c.save(); c.translate(x, y); c.scale(s, s * 0.78); c.globalAlpha = alpha;
    var p = new Path2D(); for (i = 0; i < L.length; i++) { p.moveTo(L[i][0] + L[i][2], L[i][1]); p.arc(L[i][0], L[i][1], L[i][2], 0, TAU); }
    p.moveTo(26, 5); p.ellipse(0, 5, 27, 5.5, 0, 0, TAU);
    c.fillStyle = 'rgba(255,200,190,.16)'; c.save(); c.scale(1.12, 1.18); c.fill(p); c.restore();
    var g = c.createLinearGradient(0, -14, 0, 9); g.addColorStop(0, tone1); g.addColorStop(0.6, mix(tone1, tone2, 0.5)); g.addColorStop(1, tone2); c.fillStyle = g; c.fill(p);
    c.restore();
  }
  function clouds(c, vw, hy, camx, time, p) {
    var span = vw + 140, i;
    for (i = 0; i < 6; i++) {
      var cx = ((hash(i, 40) * span - camx * (0.018 + 0.01 * (i % 3)) - time * (0.9 + i * 0.35)) % span + span) % span - 70, cy = hy * (0.2 + hash(i, 41) * 0.5);
      cloud(c, cx, cy, 0.8 + hash(i, 42) * 0.7, '#ffd9d4', '#d77aa6', 0.55 + 0.25 * hash(i, 43));
    }
    // longues traînées rosées près de l'horizon
    for (i = 0; i < 3; i++) {
      var sx = ((hash(i, 60) * span - camx * 0.01 - time * (0.5 + i * 0.2)) % span + span) % span - 70, sy = hy - 18 - i * 11 - hash(i, 61) * 8;
      c.fillStyle = 'rgba(255,196,170,' + (0.2 + 0.08 * i).toFixed(2) + ')'; c.beginPath(); c.ellipse(sx, sy, 60 + 20 * i, 1.6 + 0.4 * i, 0, 0, TAU); c.fill();
    }
  }
  function chainFn(x) {                              // Chaîne des Puys : cônes tronqués, certains égueulés
    var best = 8 + 8 * fbm(x / 50, 3), c0 = Math.floor(x / 70);
    for (var k = -1; k <= 1; k++) {
      var cc = c0 + k, cx = cc * 70 + 35 + (hash(cc, 5) - 0.5) * 26, h = 20 + hash(cc, 6) * 24, w = 30 + hash(cc, 7) * 14, d = (x - cx) / w;
      if (Math.abs(d) < 1) { var v = h * Math.pow(1 - Math.abs(d), 1.15); if (v > h * 0.82) { v = h * 0.82 + (v - h * 0.82) * 0.25; } if (hash(cc, 8) > 0.4) { v -= 5 * Math.exp(-Math.pow(d / 0.2, 2)); } if (v > best) { best = v; } }
    }
    return best;
  }

  /* puy de Dôme (1 465 m) : massif trachytique très large et trapu, flancs convexes et raides, sommet en plateau arrondi (aucun cratère),
     pelouse et landes en haut, forêt à la base, sentier en lacets.  Profil relevé sur des photos (vue du nord depuis le Pariou et vue de l'ouest) :
     flanc gauche plus raide, plateau sommital long, épaulement à droite.  Au sommet, de gauche à droite : tour de l'observatoire (coupole),
     bâtiments de la station météo / TDF, mât TDF (fût blanc, pointe rouge et blanche, balise), gare du Panoramique des Dômes (toit incliné,
     la voie en spirale remonte le flanc), bâtiment d'accueil, terrasses et fûts du temple de Mercure. */
  var DOME_PTS = [[-1, 0], [-0.9, 0.05], [-0.76, 0.16], [-0.62, 0.32], [-0.5, 0.5], [-0.4, 0.66], [-0.3, 0.8], [-0.2, 0.915], [-0.1, 0.985], [-0.03, 1], [0.08, 0.99], [0.22, 0.965], [0.34, 0.93], [0.44, 0.905], [0.54, 0.915], [0.62, 0.89], [0.7, 0.74], [0.8, 0.5], [0.9, 0.27], [0.96, 0.11], [1, 0]];
  var DOME_M = (function () { // pentes de Fritsch-Carlson (courbe monotone, sans oscillation)
    var p = DOME_PTS, n = p.length, d = [], m = [], k;
    for (k = 0; k < n - 1; k++) { d.push((p[k + 1][1] - p[k][1]) / (p[k + 1][0] - p[k][0])); }
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (k = 1; k < n - 1; k++) { m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2; }
    for (k = 0; k < n - 1; k++) { if (d[k] === 0) { m[k] = m[k + 1] = 0; } else { var a = m[k] / d[k], b = m[k + 1] / d[k], s = a * a + b * b; if (s > 9) { var t = 3 / Math.sqrt(s); m[k] = t * a * d[k]; m[k + 1] = t * b * d[k]; } } }
    return m;
  })();
  function domeProf(x) { // x = -1..1 → hauteur 0..1
    var p = DOME_PTS, k = 0;
    if (x <= -1 || x >= 1) { return 0; }
    while (k < p.length - 2 && x > p[k + 1][0]) { k++; }
    var h = p[k + 1][0] - p[k][0], t = (x - p[k][0]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p[k][1] + (t3 - 2 * t2 + t) * h * DOME_M[k] + (-2 * t3 + 3 * t2) * p[k + 1][1] + (t3 - t2) * h * DOME_M[k + 1];
  }
  function dome(c, cx, base, dw, dh, time, hazeAmt) {
    var i, hc = '#c88fb4';
    function prof(d) { return dh * domeProf(d); }
    function gy(d) { return base - prof(d); }
    var sh = new Path2D(); sh.moveTo(cx - dw / 2, base + 40);
    for (i = -60; i <= 60; i++) { var d = i / 60; sh.lineTo(cx + d * dw / 2, base - prof(d)); } sh.lineTo(cx + dw / 2, base + 40); sh.closePath();
    var g = grad(c, base - dh, base + 4, [0, tone('#b9c06c', 0, hc, hazeAmt * 0.4), 0.35, tone('#8aa862', 0, hc, hazeAmt * 0.7), 0.72, tone('#4f7e5c', 0, hc, hazeAmt + 0.05), 1, tone('#5f7ea0', 0, hc, 0.45)]);
    c.fillStyle = g; c.fill(sh);
    c.save(); c.clip(sh);
    // ombre du flanc gauche et lumière rasante à droite
    var hg = c.createLinearGradient(cx - dw / 2, 0, cx + dw / 2, 0); hg.addColorStop(0, 'rgba(34,24,80,.34)'); hg.addColorStop(0.5, 'rgba(34,24,80,.04)'); hg.addColorStop(0.85, 'rgba(255,190,120,.12)'); hg.addColorStop(1, 'rgba(255,170,110,.3)'); c.fillStyle = hg; c.fillRect(cx - dw / 2, base - dh - 4, dw, dh + 50);
    // forêt basse en taches sombres, bandes de lande plus claires
    for (i = 0; i < 40; i++) { var fx = cx + (hash(i, 711) - 0.5) * dw * 0.96, fy = base - dh * (0.04 + 0.62 * hash(i, 712) * hash(i, 713)); c.fillStyle = hash(i, 714) > 0.35 ? 'rgba(30,72,62,.34)' : 'rgba(190,196,110,.22)'; c.beginPath(); c.ellipse(fx, fy, dw * (0.02 + 0.05 * hash(i, 715)), dh * 0.04, -0.15, 0, TAU); c.fill(); }
    var fg = c.createLinearGradient(0, base - dh * 0.42, 0, base + 2); fg.addColorStop(0, 'rgba(26,70,64,0)'); fg.addColorStop(1, 'rgba(26,70,64,.55)'); c.fillStyle = fg; c.fillRect(cx - dw / 2, base - dh * 0.42, dw, dh * 0.5);
    // sentier en lacets, de la base à gauche vers le sommet
    c.strokeStyle = 'rgba(244,222,176,.5)'; c.lineWidth = 0.55; c.lineJoin = 'round'; c.beginPath();
    var zz = [[-0.8, 0.02], [-0.56, 0.17], [-0.66, 0.26], [-0.4, 0.5], [-0.5, 0.58], [-0.3, 0.76], [-0.34, 0.8], [-0.16, 0.95]];
    for (i = 0; i < zz.length; i++) { var zx = cx + zz[i][0] * dw / 2, zy = base - dh * Math.min(zz[i][1], domeProf(zz[i][0]) * 0.97) - 0.4; if (i === 0) { c.moveTo(zx, zy); } else { c.lineTo(zx, zy); } } c.stroke();
    // voie du Panoramique des Dômes : spirale qui remonte le flanc (deux arcs visibles sur la face, la voie passe derrière entre les deux)
    function arc(d0, y0, d1, y1, sag, dark) {
      c.beginPath(); for (var k = 0; k <= 24; k++) { var t = k / 24, dd = d0 + (d1 - d0) * t, yy = y0 + (y1 - y0) * t - sag * Math.sin(Math.PI * t), px = cx + dd * dw / 2, py = base - dh * yy; if (k === 0) { c.moveTo(px, py); } else { c.lineTo(px, py); } }
      c.strokeStyle = dark ? 'rgba(40,36,60,.5)' : 'rgba(236,230,214,.62)'; c.lineWidth = dark ? 1.15 : 0.5; c.stroke();
    }
    arc(0.88, 0.1, -0.64, 0.26, 0.075, true); arc(0.88, 0.1, -0.64, 0.26, 0.075, false);
    arc(0.7, 0.55, 0.1, 0.98, 0.06, true); arc(0.7, 0.55, 0.1, 0.98, 0.06, false);
    c.restore();
    // liseré lumineux de la crête
    c.beginPath(); for (i = -60; i <= 60; i++) { var d2 = i / 60, yy2 = base - prof(d2); if (i === -60) { c.moveTo(cx + d2 * dw / 2, yy2); } else { c.lineTo(cx + d2 * dw / 2, yy2); } } c.strokeStyle = 'rgba(255,214,160,.7)'; c.lineWidth = 0.8; c.lineJoin = 'round'; c.stroke();

    // ---- sommet : les vrais bâtiments, d'ouest (gauche) en est (droite) ; X(d) = abscisse, gy(d) = sol
    function X(d) { return cx + d * dw / 2; }
    var u = dw / 200, hh = dh;                                    // u : unité de dessin (≈ 1 px de l'écran à dw = 200)
    var topY = base - dh;
    // station météo / TDF : long bâtiment bas gris-bleu, paraboles, petits mâts
    var sx0 = X(-0.17), sx1 = X(0.0), sy = gy(-0.08) + 0.3, sH = hh * 0.1;
    c.fillStyle = '#4a4668'; c.fillRect(sx0, sy - sH, sx1 - sx0, sH + 0.2); c.fillStyle = '#6a6488'; c.fillRect(sx0, sy - sH, sx1 - sx0, Math.max(0.5, sH * 0.18));
    c.fillStyle = '#c9c2da'; for (i = 0; i < 4; i++) { c.fillRect(sx0 + (sx1 - sx0) * (0.1 + i * 0.2), sy - sH * 0.55, Math.max(0.6, u * 1.2), Math.max(0.5, sH * 0.22)); }
    c.fillStyle = '#e8e4f0'; c.beginPath(); c.arc(sx0 + u * 2.2, sy - sH - u * 0.8, u * 1.5, 0, TAU); c.fill(); c.fillRect(sx0 + u * 4.8, sy - sH - u * 1.3, u * 0.5, u * 1.3);
    // tour de l'observatoire : fût clair surmonté d'une coupole blanche
    var ox = X(-0.205), oy = gy(-0.18) + 0.3, oh = hh * 0.15, ow = Math.max(1.8, u * 4.2);
    c.fillStyle = '#d9d2dd'; c.fillRect(ox - ow / 2, oy - oh, ow, oh); c.fillStyle = '#a79db8'; c.fillRect(ox + ow * 0.15, oy - oh, ow * 0.35, oh);
    c.fillStyle = '#f2eef2'; c.beginPath(); c.arc(ox, oy - oh, ow * 0.62, Math.PI, 0); c.fill(); c.fillStyle = '#6a5f86'; c.fillRect(ox - ow * 0.4, oy - oh * 0.6, Math.max(0.5, ow * 0.2), oh * 0.22);
    // mât TDF : embase cylindrique à fenêtres, fût blanc, pointe rouge et blanche, balise clignotante
    var ax = X(-0.06), ay = gy(-0.06) + 0.3, mw = Math.max(1.1, u * 1.6), bh = hh * 0.12, bw = mw * 3.4;
    c.fillStyle = '#e2dcec'; c.fillRect(ax - bw / 2, ay - bh, bw, bh); c.fillStyle = '#9c92b4'; c.fillRect(ax + bw * 0.12, ay - bh, bw * 0.38, bh);
    c.fillStyle = '#5a5276'; c.fillRect(ax - bw / 2 - 0.3, ay - bh - 0.5, bw + 0.6, 0.9); c.fillStyle = '#6a5f86'; c.fillRect(ax - bw * 0.3, ay - bh * 0.7, Math.max(0.5, bw * 0.15), bh * 0.35); c.fillRect(ax + bw * 0.1, ay - bh * 0.7, Math.max(0.5, bw * 0.15), bh * 0.35);
    var shaftTop = ay - bh - hh * 0.3, antTop = ay - bh - hh * 0.55;
    c.fillStyle = '#f0ecf2'; c.fillRect(ax - mw / 2, shaftTop, mw, ay - bh - shaftTop + 0.1); c.fillStyle = '#c8c0d6'; c.fillRect(ax + mw * 0.15, shaftTop, mw * 0.35, ay - bh - shaftTop + 0.1);
    c.fillStyle = '#e8e2e8'; c.fillRect(ax - mw * 1.3, shaftTop + (ay - bh - shaftTop) * 0.55, mw * 2.6, Math.max(0.5, mw * 0.5)); c.fillRect(ax - mw * 1.5, shaftTop - 0.2, mw * 3, Math.max(0.5, mw * 0.55));
    var an = Math.max(0.6, mw * 0.5), nb = 7;
    for (i = 0; i < nb; i++) { c.fillStyle = i % 2 ? '#f2eef0' : '#d8484a'; c.fillRect(ax - an / 2, shaftTop - (shaftTop - antTop) * (i + 1) / nb, an, (shaftTop - antTop) / nb + 0.1); }
    var bl = 0.5 + 0.5 * Math.sin(time * 2.6), by = antTop - 0.6; c.fillStyle = 'rgba(255,90,80,' + (0.45 + 0.5 * bl).toFixed(2) + ')'; c.beginPath(); c.arc(ax, by, 0.9 + bl * 0.4, 0, TAU); c.fill();
    var hg2 = c.createRadialGradient(ax, by, 0, ax, by, 5); hg2.addColorStop(0, 'rgba(255,100,90,' + (0.35 * bl).toFixed(2) + ')'); hg2.addColorStop(1, 'rgba(255,100,90,0)'); c.fillStyle = hg2; c.fillRect(ax - 6, by - 6, 12, 12);
    // gare supérieure du Panoramique des Dômes : volume sombre, toit en pente, bandeau vitré
    var px0 = X(0.04), px1 = X(0.14), py = gy(0.09) + 0.3, pH = hh * 0.1;
    c.fillStyle = '#3c3858'; c.beginPath(); c.moveTo(px0, py); c.lineTo(px0, py - pH * 0.8); c.lineTo(px1, py - pH * 1.12); c.lineTo(px1, py); c.closePath(); c.fill();
    c.fillStyle = '#e6d6a8'; c.fillRect(px0 + (px1 - px0) * 0.12, py - pH * 0.5, (px1 - px0) * 0.76, Math.max(0.45, pH * 0.16));
    // bâtiment d'accueil du sommet : plus clair, toit plat
    var vx0 = X(0.155), vx1 = X(0.235), vy = gy(0.2) + 0.3, vH = hh * 0.07;
    c.fillStyle = '#8a82a6'; c.fillRect(vx0, vy - vH, vx1 - vx0, vH + 0.2); c.fillStyle = '#b5aecb'; c.fillRect(vx0, vy - vH, vx1 - vx0, Math.max(0.4, vH * 0.2)); c.fillStyle = '#efe0b0'; for (i = 0; i < 3; i++) { c.fillRect(vx0 + (vx1 - vx0) * (0.14 + i * 0.28), vy - vH * 0.6, Math.max(0.5, (vx1 - vx0) * 0.14), Math.max(0.45, vH * 0.3)); }
    // temple de Mercure : terrasses de pierre pâle qui suivent la pente, quelques blocs et fûts brisés
    var tx0 = X(0.255), tx1 = X(0.415), n = 5, tH = hh * 0.04;
    for (i = 0; i < n; i++) {
      var d0 = 0.255 + 0.16 * i / n, d1 = 0.255 + 0.16 * (i + 1) / n, yb = gy((d0 + d1) / 2) + 0.4, lift = (i % 2 ? 0.5 : 1) * tH;
      c.fillStyle = '#e9ddc8'; c.fillRect(X(d0), yb - lift, X(d1) - X(d0) + 0.2, lift + 0.2); c.fillStyle = '#b9a98e'; c.fillRect(X(d0), yb - 0.2, X(d1) - X(d0) + 0.2, 0.7);
    }
    c.fillStyle = '#f4ecd8'; for (i = 0; i < 3; i++) { var cd = 0.285 + i * 0.05, chh = hh * (0.03 + 0.025 * ((i * 7) % 3) / 2); c.fillRect(X(cd), gy(cd) - tH - chh + 0.4, Math.max(0.8, u * 1.3), chh); }
  }

  /* arrière-plan complet.  o = { p, camx, time, cover (0 = Dôme dégagé … 1 = forêt dense), hazeCol, treeKind, shrub (0..1) } */
  function farBackdrop(c, vw, vh, gs0, gain, o) {
    var land = vw > vh, time = o.time, camx = o.camx, cover = clamp(o.cover, 0, 1), i;
    var hy = gs0 - 34 + gain * 0.045;
    sky(c, vw, vh, gs0, hy, time, o.sc);
    clouds(c, vw, hy, camx, time, o.p);
    // chaîne des Puys, très lointaine
    var off0 = camx * 0.01;
    silhouette(c, vw, hy + 6, off0, chainFn, vh, 2); c.fillStyle = grad(c, hy - 40, hy + 8, [0, '#7a62ac', 0.6, '#c06fa2', 1, '#f09a92']); c.fill();
    edgeLine(c, vw, hy + 6, off0, chainFn, 2); c.strokeStyle = 'rgba(255,205,160,.55)'; c.lineWidth = 0.6; c.lineJoin = 'round'; c.stroke();
    // puy de Dôme, plus ou moins masqué par la forêt (lorsque cover diminue, il monte et se dévoile)
    var dw = land ? Math.min(vw * 0.6, 320) : Math.min(vw * 1.15, 200), dh = dw * 0.27, reveal = 1 - cover;
    var dcx = vw * ((land ? 0.7 : 0.7) - (land ? 0.16 : 0.22) * (o.p || 0)) + (o.domeShift || 0), dBase = hy + 4 + (1 - reveal) * dh * 0.62 - reveal * 6;
    if (dcx > -dw && dcx < vw + dw) { dome(c, dcx, dBase, dw, dh, time, 0.34); }
    // brume derrière les collines
    c.fillStyle = grad(c, hy - 16, hy + 26, [0, 'rgba(255,170,150,0)', 1, 'rgba(255,170,150,.36)']); c.fillRect(0, hy - 16, vw, 44);
    // collines lointaines bleutées
    var off1 = camx * 0.07, hz1 = hy + 16 + (1 - cover) * 6;
    var fn1 = function (x) { return (10 + 22 * fbm(x / 70, 11) + 8 * fbm(x / 23, 12)) * (0.9 + 0.1 * cover); };
    silhouette(c, vw, hz1, off1, fn1, vh, 2); c.fillStyle = grad(c, hz1 - 36, hz1 + 6, [0, '#5b78a6', 0.55, '#8e86b2', 1, '#c58eaa']); c.fill();
    edgeLine(c, vw, hz1, off1, fn1, 2); c.strokeStyle = 'rgba(255,200,160,.4)'; c.lineWidth = 0.55; c.stroke();
    // collines boisées (parallaxe moyenne) : sapins minuscules en lisière
    var off2 = camx * 0.16, hz2 = hy + 26 + (1 - cover) * 10, hc = o.hazeCol || '#c88fb4';
    var fn2 = function (x) { return (12 + 24 * fbm(x / 60, 21) + 6 * fbm(x / 19, 22)) * (0.72 + 0.28 * cover); };
    silhouette(c, vw, hz2, off2, fn2, vh, 2); c.fillStyle = grad(c, hz2 - 40, hz2 + 6, [0, '#3f7468', 0.5, '#4a7c74', 1, '#7a8aa8']); c.fill();
    c.save(); silhouette(c, vw, hz2, off2, fn2, vh, 2); c.clip();
    var spc = 9, id0 = Math.floor((off2 - 10) / spc);
    for (i = id0; i * spc < off2 + vw + 12; i++) { var wx = i * spc + hash(i, 33) * 5, hh = (6 + 6 * hash(i, 34)) * (0.4 + 0.6 * cover); if (hash(i, 35) > (o.treeKind === 'beech' ? 0.7 : 0.88) * (0.4 + 0.6 * cover) + 0.12) { continue; } fir(c, wx - off2, hz2 - fn2(wx) + 1.5, hh, { haze: 0.5, hazeCol: hc, sway: false, pal: TREE.firB }); }
    c.restore();
    c.fillStyle = grad(c, hz2 - 26, hz2 + 18, [0, 'rgba(255,160,150,0)', 1, 'rgba(255,170,150,.3)']); c.fillRect(0, hz2 - 26, vw, 44);
    return { hy: hy, hz2: hz2, cover: cover };
  }

  window.Scenery = { fir: fir, beech: beechTree, oak: oakTree, bush: bush, heather: heather, fern: fern, tuft: tuft, broom: broom, flower: flower, rows: rows, lip: lip, farBackdrop: farBackdrop, dome: dome, cloud: cloud, TREE: TREE, silhouette: silhouette, edgeLine: edgeLine };
})();
