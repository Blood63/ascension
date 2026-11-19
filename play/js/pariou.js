/* Thème du niveau 2 : Puy de Pariou (v0.2.7).
   Décor inspiré du vrai Pariou : forêt de hêtres et de conifères à la base, puis cône recouvert d'une herbe fine et rase parsemée de
   genévriers, de callune et de quelques hêtres (Wikipédia : « cheire parsemée de feuillus, de genévriers, d'une herbe très fine et rase »),
   escalier en caissons de bois remplis de pouzzolane sur le flanc, lèvre du cratère balisée par des piquets et des fils-guides, cuvette
   presque parfaitement ronde derrière le sommet, ancien Pariou (somma) à l'arrière-plan et puy de Dôme à l'horizon.
   Le jeu (js/game.js) appelle ces fonctions ; ce fichier ne contient que du dessin. */
(function () {
  'use strict';
  window.Game.theme('pariou', function (E) {
    var PAL = {
      q: { base: '#5e4130', mid: '#33261f', lip: '#79b848', hi: '#d3ef8a', dark: '#241a1d' },
      f: { base: '#5e4130', mid: '#33261f', lip: '#79b848', hi: '#d3ef8a', dark: '#241a1d' },     // sous-bois
      c: { base: '#7a4a34', mid: '#44261f', lip: '#b3c455', hi: '#f0efa0', dark: '#2a1a1c' },     // pelouse du cône sur pouzzolane
      k: { base: '#6b4638', mid: '#3a2428', lip: '#a5cc62', hi: '#e6f4a8', dark: '#241a22' }      // lèvre et cuvette du cratère
    };
    function T() { return E.feat.total; }
    function bw(x) {
      var t = T(), rimX = E.feat.rimX, k = E.sstep(rimX - 660, rimX - 560, x), c = E.sstep(0.31 * t, 0.43 * t, x) * (1 - k), f = Math.max(0, 1 - c - k);
      return [0, f, c, k];
    }
    function fo(x) { return 1 - E.sstep(0.28 * T(), 0.44 * T(), x); }                 // poids de la forêt
    function gf(x) { return E.GF[Math.max(0, Math.min(E.len, x | 0))]; }

    /* ---------- fond : planche peinte (Chaîne des Puys, puy de Dôme) + somma + collines + forêts lointaines ---------- */
    function somFn(x) {               // ancien Pariou : deux bosses arrondies, la plus haute entaillée
      var h = 34 + 34 * E.nz(x / 150, 77), t = (x % 640) / 640;
      return h + 28 * Math.sin(Math.PI * t) * Math.sin(Math.PI * t) - 9 * Math.exp(-Math.pow((t - 0.5) / 0.07, 2));
    }
    function drawBackground(c, vw, vh, gs0, gain) {
      var p = E.clamp(E.cam.x / Math.max(1, E.feat.summitX - 120), 0, 1);
      // ciel, chaîne des Puys, puy de Dôme (visible très tôt : la forêt de départ n'en cache que la base) et collines boisées
      Scenery.farBackdrop(c, vw, vh, gs0, gain, { camx: E.cam.x, time: E.time, cover: 0.3 * (1 - E.sstep(0.0, 0.3, p)), p: p, treeKind: 'beech', domeShift: 0, sc: E.Sc });
      // somma (ancien Pariou) : grosse bosse herbeuse au second plan, bord éclairé par le couchant
      var sb = gs0 + 10 + gain * 0.1, som = E.cam.x * 0.22, i;
      E.ridge(c, vw, sb, som, somFn, '#4d8a4c', '#2f6240', 'rgba(255,200,140,.7)', vh);
      c.save(); c.beginPath(); c.rect(0, 0, vw, vh); c.clip();
      for (i = 0; i < 30; i++) { var wx = Math.floor((som - 20) / 34) * 34 + i * 34 + E.hash(i, 9) * 22, sxp = wx - som; if (sxp < -20 || sxp > vw + 20) { continue; } var k = Math.floor(wx / 34), syp = sb - somFn(wx) + 3 + E.hash(k, 12) * 18; c.fillStyle = E.hash(k, 13) > 0.5 ? 'rgba(168,86,62,.5)' : 'rgba(176,100,160,.36)'; c.beginPath(); c.ellipse(sxp, syp, 3 + E.hash(k, 14) * 4, 1.1, 0, 0, 7); c.fill(); }
      // genévriers, callune et petits hêtres éparpillés sur la somma (très brumeux : ils donnent du grain sans casser la profondeur)
      var sp = 11, i0 = Math.floor((som - 12) / sp);
      for (i = i0; i * sp < som + vw + 12; i++) {
        var hv = E.hash(i, 21); if (hv > 0.82) { continue; }
        var wx2 = i * sp + hv * 7, bx = wx2 - som, by = sb - somFn(wx2) + 3 + E.hash(i, 22) * 14, sz = 4 + E.hash(i, 23) * 4, hz = { haze: 0.42, hazeCol: '#b87aa8', seed: i, t: E.time, sway: false };
        if (hv > 0.7) { Scenery.beech(c, bx, by, 15 + E.hash(i, 24) * 9, hz); } else if (hv > 0.45) { Scenery.heather(c, bx, by, sz * 0.8, hz); } else { Scenery.bush(c, bx, by, sz, hz); }
      }
      c.restore();
      c.fillStyle = E.A.grad(c, 0, sb - 30, 0, sb + 30, [0, 'rgba(255,150,130,0)', 1, 'rgba(255,150,130,.18)']); c.fillRect(0, sb - 30, vw, 60);
    }

    /* ---------- derrière le chemin : talus du cône, forêt, bord opposé du cratère, fils-guides ---------- */
    function massTop(x) {
      var rimX = E.feat.rimX, f = fo(x), r = E.sstep(rimX - 620, rimX - 520, x);
      var Hf = 96 + 30 * E.nz(x / 90, 61), Hm = 74 + 40 * E.nz(x / 170, 62), Hr = 22 + 12 * E.nz(x / 60, 63);
      var H = E.lerp(E.lerp(Hm, Hf, f), Hr, r);
      return gf(x) - 20 - H;
    }
    function farWall(c, xa, xb, bottom) {
      var rimX = E.feat.rimX, cr = E.W.crater, x1 = rimX + 2 * cr.wall + cr.floor + 150, x0 = rimX - 560;
      if (xb < x0 || xa > x1) { return; }
      var top = E.feat.topY, s = Math.max(x0, Math.floor(xa / 6) * 6), e = Math.min(x1, xb + 6), x, d = new Path2D();
      d.moveTo(s, bottom);
      for (x = s; x <= e; x += 6) { var t = (x - x0) / (x1 - x0); d.lineTo(x, top - 6 - 24 * Math.pow(Math.sin(Math.PI * t), 0.9) + 3 * E.nz(x / 25, 64)); }
      d.lineTo(e, bottom); d.closePath();
      c.fillStyle = E.A.grad(c, 0, top - 36, 0, top + 120, [0, '#5f8f42', 0.35, '#3f7040', 1, '#27483a']); c.fill(d);
      c.save(); c.clip(d);
      // végétation de la paroi : callune, genévriers et pelouse en bandes de plus en plus grosses vers le bas (profondeur)
      var topAt = function (xx) { var tt = (xx - x0) / (x1 - x0); return top - 6 - 24 * Math.pow(Math.sin(Math.PI * Math.max(0, Math.min(1, tt))), 0.9) + 3 * E.nz(xx / 25, 64); };
      for (var bd = 0; bd < 4; bd++) {
        var stp = 8 + bd * 2.2;
        for (x = Math.floor(s / stp) * stp; x <= e; x += stp) {
          var hh = E.hash(x + bd * 97, 66); if (hh > 0.8) { continue; }
          var bx = x + hh * stp, by = topAt(bx) + 4 + bd * 15 + E.hash(x, 67 + bd) * 8, sz = 2.6 + bd * 1.3 + hh * 2;
          var op = { haze: 0.14 - bd * 0.03, hazeCol: '#b87aa8', seed: x, t: E.time, sway: false };
          if (hh > 0.55) { Scenery.heather(c, bx, by, sz, op); } else if (hh > 0.2) { Scenery.bush(c, bx, by, sz, { haze: op.haze, hazeCol: op.hazeCol, seed: x }); } else { Scenery.tuft(c, bx, by, sz * 1.2, { t: E.time, n: 5 }); }
        }
      }
      c.restore();
      // bord opposé éclairé
      c.strokeStyle = 'rgba(255,205,140,.7)'; c.lineWidth = 0.9; c.beginPath();
      for (x = s; x <= e; x += 6) { var t3 = (x - x0) / (x1 - x0), yy3 = top - 6 - 24 * Math.pow(Math.sin(Math.PI * t3), 0.9) + 3 * E.nz(x / 25, 64); if (x === s) { c.moveTo(x, yy3); } else { c.lineTo(x, yy3); } } c.stroke();
    }
    /* végétation plantée sur le profil du terrain (Scenery.rows) : forêt de hêtres et de sapins à la base, qui s'éclaircit
       en genévriers, callune et rares hêtres isolés sur la pelouse du cône. */
    var FL = null;
    function floraCfg() {
      if (FL) { return FL; }
      var kindB = function (x, h) { return h < (0.35 + 0.35 * (1 - fo(x))) ? 'beech' : 'fir'; };
      var hs = function (x) { return 33 + 9 * E.nz(x / 120, 5); };
      FL = { hazeCol: '#b87aa8', rows: [
        { step: 16, seed: 14, haze: 0.4, fillTop: '#2f5e46', fillBot: '#1c3f34', autumn: 0.8, up: function (x) { return 24 * fo(x) + 2; }, dens: function (x) { return 0.96 * fo(x); }, size: function (x) { return hs(x) * 1.15; }, kind: kindB },
        { step: 18, seed: 25, haze: 0.18, fillTop: '#2b5a3f', fillBot: '#1b3d2e', autumn: 0.8, up: function (x) { return 11 * fo(x) + 1; }, dens: function (x) { return 0.92 * fo(x); }, size: hs, kind: kindB },
        { step: 24, seed: 36, haze: 0, sink: 5, fillTop: '#244c36', fillBot: '#173326', autumn: 0.78, up: function (x) { return 3; }, dens: function (x) { return 0.85 * fo(x); }, size: function (x) { return hs(x) * 0.92; }, kind: kindB },
        { step: 70, seed: 77, haze: 0, sink: 4, fillTop: '#244c36', fillBot: '#173326', autumn: 0.7, up: function (x) { return 3; }, dens: function (x) { var w = bw(x); return 0.4 * w[2]; }, size: function (x) { return 36 + 8 * E.nz(x / 60, 9); }, kind: function () { return 'beech'; } },
        { step: 12, seed: 52, haze: 0, sink: 3, fillTop: '#2c5a3a', fillBot: '#1b3a2a', up: function (x) { return 3; }, dens: function (x) { var w = bw(x); return 0.3 * fo(x) + 0.62 * w[2] + 0.3 * w[3]; }, size: function (x) { return 13 + 3 * Math.sin(x / 55); },
          kind: function (x, h) { return h < 0.55 ? 'bush' : 'heather'; }, bushPal: { dark: '#1f4a34', base: '#336a46', lite: '#78a85a' } }
      ] };
      FL.lipMix = function (x) {
        var w = bw(x), f = w[1], c = w[2], k = w[3];
        var gcol = E.mix(E.mix('#6f9a48', '#9aa84a', c), '#87b04e', k);
        return { dens: 0.85 * f + 0.8 * c + 0.7 * k, grass: 1.3, fern: 0.9 * f, heather: 0.8 * c + 0.3 * k, bush: 0.3 * f + 0.4 * c, broom: 0.12 * c, flower: 0.4 * f + 0.2 * c, gcol: E.mix(gcol, '#3f6a30', 0.2), gcol2: E.mix(gcol, '#cde686', 0.5), fcol: '#4f9a4a' };
      };
      return FL;
    }
    function flora(c, xa, xb, bottom) { Scenery.rows(c, xa, xb, bottom, { GF: E.GF, len: E.len, time: E.time, camY: E.cam.y, vh: E.vh }, floraCfg()); }
    function ropes(c, xa, xb) {
      var rimX = E.feat.rimX, x0 = rimX - 540, x1 = E.feat.summitX + 22, x;
      if (xb < x0 || xa > x1) { return; }
      var s = Math.max(x0, Math.ceil(xa / 22) * 22), e = Math.min(x1, xb);
      var py = function (xx) { var g = E.G[xx | 0]; return isFinite(g) ? g : (E.G[(xx - 4) | 0] || 0); };
      // deux fils tendus entre les piquets
      for (var ln = 0; ln < 2; ln++) {
        c.beginPath(); var first = true;
        for (x = s; x <= e + 22; x += 22) { var y1 = py(x) - (ln ? 7 : 11), y2 = py(x + 22) - (ln ? 7 : 11); if (first) { c.moveTo(x, y1); first = false; } c.quadraticCurveTo(x + 11, (y1 + y2) / 2 + 1.6, x + 22, y2); }
        c.strokeStyle = 'rgba(40,24,16,.85)'; c.lineWidth = 0.7; c.stroke();
      }
      for (x = s; x <= e + 22; x += 22) {
        var g = py(x); c.fillStyle = '#2a1810'; c.fillRect(x - 1.1, g - 13, 2.2, 14); c.fillStyle = '#b98a58'; c.fillRect(x - 0.7, g - 13, 1.1, 14); c.fillStyle = '#ffe9b0'; c.fillRect(x - 0.9, g - 13.8, 1.8, 1.3);
      }
    }
    function drawBehind(c, xa, xb, bottom) { farWall(c, xa, xb, bottom); flora(c, xa, xb, bottom); ropes(c, xa, xb); }

    /* ---------- marches : caissons de bois remplis de pouzzolane ---------- */
    function drawStairs(c, xa, xb) {
      E.feat.stairs.forEach(function (s) {
        if (s.x1 < xa || s.x0 > xb) { return; }
        for (var x = s.x0; x < s.x1; x += 12) {
          if (x + 12 < xa || x > xb) { continue; }
          var gy = E.G[x + 1], h = E.hash(x, 120);
          c.fillStyle = '#5b3a24'; c.fillRect(x, gy - 0.4, 12.4, 3.6);                       // contre-marche (rondin)
          c.fillStyle = '#a97b4a'; c.fillRect(x, gy - 0.4, 12.4, 1.2);                       // arête claire du caisson
          c.fillStyle = 'rgba(30,14,10,.55)'; c.fillRect(x, gy + 2.7, 12.4, 0.6);
          c.fillStyle = '#2a1810'; c.fillRect(x + 11.6, gy - 0.4, 0.8, 3.6);
          c.fillStyle = 'rgba(255,224,170,.25)'; c.fillRect(x + 1, gy + 1.2, 5 + h * 4, 0.45);   // fil du bois
          // remplissage de pouzzolane rouge-noir sur la marche
          c.fillStyle = '#7d3a2e'; c.fillRect(x + 0.8, gy - 1.2, 10.8, 0.9);
          for (var j = 0; j < 4; j++) { c.fillStyle = E.hash(x + j, 121) > 0.5 ? '#2a1a1c' : '#b05a42'; c.fillRect(x + 1.2 + j * 2.6 + E.hash(x, 122 + j) * 1.2, gy - 1.5, 1, 0.9); }
        }
      });
    }

    /* ---------- accessoires : herbe fine, callune, fougères, panneaux ---------- */
    function drawProps(c, xa, xb) {
      var G = E.G;
      Scenery.lip(c, xa, xb, { G: E.G, TYPE: E.TYPE, time: E.time }, { mix: floraCfg().lipMix });
      // panneaux : départ, zone fragile avant le 1er effritement, jalonnement du cratère
      if (xa < 130) { E.board(c, 62, G[70] - 33, 38, 15, ['PUY DE', 'PARIOU'], 3.4); }
      var cr0 = E.crumbs[0];
      if (cr0 && xb > cr0.x0 - 110 && xa < cr0.x0 - 40) { var bx = cr0.x0 - 96; E.board(c, bx, G[bx | 0] - 33, 44, 15, ['SOL', 'FRAGILE'], 3.4); }
      var rx = E.feat.rimX - 540;
      if (xb > rx - 20 && xa < rx + 80) { E.board(c, rx + 6, G[(rx + 20) | 0] - 41, 62, 25, ['RESTEZ SUR', 'LE SENTIER'], 3.3); }
    }

    /* ---------- objets du carnet ---------- */
    function drawFind(c, f) {
      var t = E.time;
      if (f.id === 'tuff') {
        c.beginPath(); c.moveTo(-6, 2.4); c.lineTo(-5.2, -2.6); c.lineTo(-1, -4.2); c.lineTo(4.6, -3.4); c.lineTo(6.4, 0.6); c.lineTo(4.2, 3.6); c.lineTo(-3.6, 3.8); c.closePath();
        c.fillStyle = E.A.grad(c, 0, -4, 0, 4, [0, '#d8cbb0', 1, '#8f7e68']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#3c3026'; c.stroke();
        c.fillStyle = 'rgba(70,52,40,.6)'; [[-3, -1, 0.8], [1, -1.6, 1], [3, 1.4, 0.7], [-1, 1.6, 0.9], [-4, 1.2, 0.6]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 7); c.fill(); });
        return true;
      }
      if (f.id === 'scoria') {
        c.beginPath(); c.moveTo(-5.6, 1.6); c.lineTo(-4.4, -3); c.lineTo(2.4, -4); c.lineTo(6.2, -0.6); c.lineTo(4, 3.4); c.lineTo(-3, 3.6); c.closePath();
        c.fillStyle = E.A.grad(c, 0, -4, 0, 4, [0, '#8c9bbd', 1, '#3e4766']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#1a1f33'; c.stroke();
        c.fillStyle = 'rgba(20,24,44,.75)'; [[-2.4, -1.4], [0.6, -1.9], [2.6, 0.4], [-0.6, 1.4], [-3.2, 1.2]].forEach(function (q) { c.beginPath(); c.ellipse(q[0], q[1], 1.5, 0.6, -0.3, 0, 7); c.fill(); });
        c.strokeStyle = 'rgba(230,240,255,.55)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-3, -2.9); c.lineTo(1.6, -3.4); c.stroke();
        return true;
      }
      if (f.id === 'apollo') {                                      // Semi-Apollon : ailes blanches tachées de noir, ocelles rouges
        var fl = 0.35 + 0.65 * Math.abs(Math.sin(t * 7 + f.ph));
        c.save(); c.scale(1, 1);
        [-1, 1].forEach(function (sd) {
          c.save(); c.scale(sd * fl, 1);
          c.beginPath(); c.moveTo(0, -0.4); c.bezierCurveTo(3, -7.4, 8.4, -5.6, 7.6, -0.6); c.bezierCurveTo(7.4, 2.4, 3, 2.4, 0, 0.8); c.closePath();
          c.fillStyle = '#f6f2e6'; c.fill(); c.lineWidth = 0.6; c.strokeStyle = '#2a2430'; c.stroke();
          c.fillStyle = '#20182a'; c.beginPath(); c.arc(3.4, -3.8, 1, 0, 7); c.fill(); c.beginPath(); c.arc(6, -1.6, 0.8, 0, 7); c.fill();
          c.fillStyle = '#e0452b'; c.beginPath(); c.arc(4.4, -0.8, 0.9, 0, 7); c.fill();
          c.restore();
        });
        c.fillStyle = '#2a2430'; c.fillRect(-0.5, -2.4, 1, 5);
        c.restore();
        return true;
      }
      return false;
    }

    /* ---------- sommet : bornes de la lèvre du cratère ---------- */
    function drawSummit(c, sx, sy) {
      c.fillStyle = 'rgba(25,8,20,.25)'; c.fillRect(sx + 52, sy - 1, 18, 1);
    }

    return { pal: PAL, bw: bw, drawBackground: drawBackground, drawBehind: drawBehind, drawStairs: drawStairs, drawProps: drawProps, drawFind: drawFind, drawSummit: drawSummit };
  });
})();
