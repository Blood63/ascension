/* v0.4.0 — Thèmes des niveaux 3 à 6 : Puy Mary (mary), puy de Dôme par les Muletiers (muletiers), puy de Sancy (sancy),
   puy de Dôme par le chemin des Chèvres (chevres). Dessin uniquement : la mécanique est dans js/game.js et js/mech.js.
   Le décor de fond montre les vrais sommets voisins (Cantal ; puys de la Chaîne des Puys ; Monts Dore) ; la végétation du
   premier plan dépend de l'altitude réelle (forêt de hêtres → pelouse/callune → roche nue ; neige au Sancy). */
(function () {
  'use strict';
  var A = window.Art, S = window.Scenery, TAU = Math.PI * 2;

  /* ----------------------------------------------------------------------------------------- profils de reliefs */
  function peaks(list, floor) {                 // list : [u, h, wGauche, wDroite, k] ; k>1 = flancs concaves (cornes glaciaires)
    var fn = function (u) {
      var y = floor(u), i, p, d, w, v;
      for (i = 0; i < list.length; i++) {
        p = list[i]; d = u - p[0]; w = d < 0 ? p[2] : p[3]; if (Math.abs(d) >= w) { continue; }
        v = p[1] * Math.pow(1 - Math.abs(d) / w, p[4] || 1.15); if (v > y) { y = v; }
      }
      return y;
    };
    fn.list = list; return fn;
  }
  function coneAt(u, c, h, w, rc, dep, br) {    // cône strombolien : flancs concaves, cratère rond, brèche (egueulé) d'un côté
    var d = u - c, a = Math.abs(d); if (a >= w) { return 0; }
    var y = h * Math.pow(1 - a / w, 1.12), yr = h * Math.pow(1 - rc / w, 1.12);
    if (rc > 0 && a < rc) { y = yr - dep * (1 - Math.pow(a / rc, 2.2)); if (br && d * br > 0) { y = Math.min(y, yr - dep * (1 - Math.pow(a / rc, 2.2))) - dep * 0.55 * (a / rc); } }
    else if (rc > 0 && br && d * br > 0 && a < rc * 2.2) { y = Math.min(y, yr - dep + (y - (yr - dep)) * Math.pow((a - rc) / (rc * 1.2), 1.4)); }
    return Math.max(0, y);
  }
  function domeAt(u, c, h, w) { var a = Math.abs(u - c) / w; return a >= 1 ? 0 : h * Math.pow(1 - a * a, 0.62); }
  function cloud2(c, x, y, s, top, bot, alpha) {
    var L = [[0, 0, 11], [11, -3, 9], [-11, 1, 8], [21, 2, 7], [-20, 3, 6.5], [5, -5, 8], [-4, 3, 9]], i, p = new Path2D();
    c.save(); c.translate(x, y); c.scale(s, s * 0.74); c.globalAlpha = alpha;
    for (i = 0; i < L.length; i++) { p.moveTo(L[i][0] + L[i][2], L[i][1]); p.arc(L[i][0], L[i][1], L[i][2], 0, TAU); }
    p.moveTo(26, 5); p.ellipse(0, 5, 27, 5, 0, 0, TAU);
    c.fillStyle = A.grad(c, 0, -14, 0, 11, [0, top, 1, bot]); c.fill(p);
    c.restore();
  }

  /* ------------------------------------------------------------------------------------------ constructeur commun */
  function build(K) {
    window.Game.theme(K.id, function (E) {
      var SNOWON = !!K.snow, covSrc = null, cov = null;
      function gf(x) { return E.GF[Math.max(0, Math.min(E.len, x | 0))]; }
      function af(x) { return E.clamp((E.BASE_Y - gf(x)) / Math.max(1, E.BASE_Y - E.feat.topY), 0, 1); }
      function meters(x) { var a0 = E.L.altitudeStart, a1 = E.L.altitudeEnd || E.L.altitude; return a0 + af(x) * (a1 - a0); }
      /* couverture par zone (lissée sur ±70 px) : 1 = plein dans la zone, 0 = hors zone */
      var covCache = {};
      function zoneCov(bit, R0) {
        var key = bit + '_' + (R0 || 70), zn = E.ZN, arr = covCache[key];
        if (!arr || arr.src !== zn || arr.n !== E.len) {
          var n = E.len + 1, raw = new Float32Array(n), out = new Float32Array(n), i, R = R0 || 70, acc = 0, win = 0;
          for (i = 0; i < n; i++) { raw[i] = (zn[i] & bit) ? 1 : 0; }
          for (i = 0; i < n; i++) {                       // moyenne glissante (fenêtre 2R+1)
            if (i === 0) { for (var k = 0; k <= R && k < n; k++) { acc += raw[k]; win++; } }
            else { if (i + R < n) { acc += raw[i + R]; win++; } if (i - R - 1 >= 0) { acc -= raw[i - R - 1]; win--; } }
            out[i] = acc / Math.max(1, win);
          }
          arr = { src: zn, n: E.len, a: out }; covCache[key] = arr;
        }
        return function (x) { return arr.a[Math.max(0, Math.min(E.len, x | 0))]; };
      }
      var shadeCov = null, snowCov = null;
      function shadeAt(x) { if (!shadeCov) { shadeCov = zoneCov(2, 230); } return shadeCov(x); }
      function snowAt(x) { if (!snowCov) { snowCov = zoneCov(4); } return snowCov(x); }
      var H = { gf: gf, af: af, meters: meters, shade: shadeAt, snow: snowAt };

      var bwF = K.bw(E, H);
      function bw(x) { return bwF(x); }

      /* ---------- ciel ---------- */
      function sky(c, vw, vh, hy) {
        var Sk = K.sky, i, x, storm = 0, windK = (window.Mech && Mech.K && Mech.K.wind) || 0;
        if (E.ZN && E.P) {
          for (i = -40; i <= 80; i += 20) {
            x = Math.max(0, Math.min(E.len, (E.P.x + i) | 0));
            if (E.ZN[x] & 64) { storm++; }
          }
          storm /= 7;
        }
        c.fillStyle = A.grad(c, 0, 0, 0, hy + 14, Sk.stops); c.fillRect(0, 0, vw, vh);
        /* tramage désactivé : le motif précédent augmentait les sauts de luminance du ciel seul */
        /* pluie seulement sous un ciel couvert : on voile le soleil et on grise le ciel */
        if (storm > 0.08) {
          c.fillStyle = 'rgba(48, 58, 76, ' + (0.55 * storm).toFixed(3) + ')';
          c.fillRect(0, 0, vw, vh);
        }
        var sx = Sk.sun.x * vw - E.cam.x * 0.004, sy = hy * Sk.sun.y;
        var sunA = (Sk.sun.dAlpha == null ? 1 : Sk.sun.dAlpha) * (1 - Math.min(1, storm * 1.35)) * (1 - 0.22 * Math.min(1, windK));
        if (sunA > 0.04) {
          var g = c.createRadialGradient(sx, sy, 0, sx, sy, Sk.sun.glow * vw);
          g.addColorStop(0, Sk.sun.g0); g.addColorStop(1, Sk.sun.g1);
          c.save(); c.globalAlpha = sunA; c.globalCompositeOperation = Sk.sun.add === false ? 'source-over' : 'lighter'; c.fillStyle = g; c.fillRect(0, 0, vw, vh); c.restore();
          c.fillStyle = Sk.sun.disc; c.globalAlpha = sunA; c.beginPath(); c.arc(sx, sy, Sk.sun.r, 0, TAU); c.fill(); c.globalAlpha = 1;
        }
        var Cl = Sk.clouds, span = vw + 160;
        var nCloud = Cl.n + (storm > 0.15 ? 5 : (windK > 0.25 ? 3 : 0));
        for (i = 0; i < nCloud; i++) {
          var cx = ((E.hash(i, 40) * span - E.cam.x * (0.02 + 0.012 * (i % 3)) - E.time * (Cl.speed + i * 0.3 + windK * 0.8)) % span + span) % span - 80;
          var cy = hy * (Cl.y0 + E.hash(i, 41) * Cl.y1) + (storm > 0.15 ? hy * 0.04 : 0);
          var top = storm > 0.15 ? '#d8e0ea' : Cl.top, bot = storm > 0.15 ? '#8a96a8' : Cl.bot;
          var aa = (Cl.a0 + Cl.a1 * E.hash(i, 43)) * (storm > 0.15 ? 1.15 : 1);
          cloud2(c, cx, cy, (Cl.s0 + E.hash(i, 42) * Cl.s1) * (storm > 0.15 ? 1.15 : 1), top, bot, aa);
        }
      }
      /* ---------- couches de montagnes ---------- */
      function layer(c, vw, vh, hy, gain, Ly) {
        var far = Ly.par <= 0.15, hs = Ly.hs || (far ? (K.hs || 1.5) : 1), off = E.cam.x * Ly.par, base = hy + Ly.y - (far ? (K.lift == null ? 14 : K.lift) : 0) + gain * (Ly.gk || 0), fn0 = Ly.fn, hmax = (Ly.hmax || 80) * hs, i, st = Ly.step || 2, fn = fn0;
        if (hs !== 1) {
          fn = fn0._hs === hs ? fn0._fs : null;
          if (!fn) { fn = function (u) { return fn0(u) * hs; }; if (fn0.list) { fn.list = fn0.list.map(function (p) { return [p[0], p[1] * hs, p[2], p[3], p[4]]; }); } fn0._hs = hs; fn0._fs = fn; }
        }
        S.silhouette(c, vw, base, off, fn, vh, st);
        if (!Ly.noFill) {
        c.fillStyle = A.grad(c, 0, base - hmax, 0, base + 6, [0, Ly.c0, 1, Ly.c1]); c.fill();
        c.save(); S.silhouette(c, vw, base, off, fn, vh, st); c.clip();
        if (Ly.faces && fn.list) {                     // facettes : flanc d'ombre à gauche, flanc éclairé à droite, ravines
          for (i = 0; i < fn.list.length; i++) {
            var p = fn.list[i], ax = p[0] - off, ay = base - p[1];
            if (ax + p[3] < -10 || ax - p[2] > vw + 10 || p[1] < 8) { continue; }
            c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax - p[2] * 0.95, base + 2); c.lineTo(ax + p[3] * 0.04, base + 2); c.closePath(); c.fillStyle = Ly.shade || 'rgba(20,30,70,.2)'; c.fill();
            c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + p[3] * 0.96, base + 2); c.lineTo(ax + p[3] * 0.1, base + 2); c.closePath(); c.fillStyle = Ly.lit || 'rgba(255,240,200,.1)'; c.fill();
            c.strokeStyle = Ly.shade || 'rgba(20,30,70,.2)'; c.lineWidth = 0.6; c.beginPath();
            for (var r = 0; r < 3; r++) { var an = (E.hash(i * 3 + r, 90) - 0.5) * 1.5, ln = p[1] * (0.5 + E.hash(i + r, 91) * 0.4); c.moveTo(ax, ay + 1); c.lineTo(ax + Math.sin(an) * ln * 0.35, ay + 1 + ln * 0.9); }
            c.stroke();
          }
        }
        if (Ly.snowH != null) {                        // calotte de neige : au-dessus d'une ligne irrégulière
          var sl = base - Ly.snowH, pth = new Path2D(), x;
          pth.moveTo(-6, sl - 120); for (x = -6; x <= vw + 6; x += 3) { pth.lineTo(x, sl + 3.5 * E.nz((x + off) / 9, 31) + 2.5 * E.nz((x + off) / 3.3, 32)); } pth.lineTo(vw + 6, sl - 120); pth.closePath();
          c.fillStyle = A.grad(c, 0, sl - 40, 0, sl + 5, [0, 'rgba(255,255,255,.95)', 1, 'rgba(226,236,250,.88)']); c.fill(pth);
        }
        if (Ly.haze) { c.fillStyle = A.grad(c, 0, base - hmax * 0.45, 0, base + 4, [0, Ly.haze.replace(/[\d.]+\)$/, '0)'), 1, Ly.haze]); c.fillRect(0, base - hmax * 0.45, vw, hmax * 0.45 + 6); }
        c.restore();
        }
        if (Ly.edge && !Ly.noFill) { c.strokeStyle = Ly.edge; c.lineWidth = 0.8; S.edgeLine(c, vw, base, off, fn, st); c.stroke(); }
        if (Ly.trees) {
          var T = Ly.trees, sp = T.step, i0 = Math.floor((off - 12) / sp), ii;
          c.save(); c.beginPath(); c.rect(0, 0, vw, vh); c.clip();
          for (ii = i0; ii * sp < off + vw + 12; ii++) {
            var hv = E.hash(ii, T.seed || 21), wx = ii * sp + hv * sp * 0.8, hh0 = fn0(wx); if (hv > T.dens || hh0 > T.maxH || hh0 < 8) { continue; } var hh = hh0 * hs;
            var tx = wx - off, ty = base - hh + 1.2, sz = T.size * (0.75 + E.hash(ii, 23) * 0.5), op = { haze: T.haze, hazeCol: T.hazeCol, seed: ii, t: E.time, sway: false };
            if (window.__treeAuditOn) { window.__treeAudit.push({ kind: 'layer', wx: wx, hh: hh, ty: ty, base: base, ok: hh >= 8 }); }
            var kd = T.kind(wx, hv); if (kd === 'beech') { S.beech(c, tx, ty, sz, op); } else if (kd === 'oak' && S.oak) { S.oak(c, tx, ty, sz * 1.05, op); } else { S.fir(c, tx, ty, sz, op); }
          }
          c.restore();
        }
        if (Ly.decor) { Ly.decor(c, vw, base, off, fn, E, vh); }
        if (window.__bgProbe && window.__bgProbe.layers) { window.__bgProbe.layers.push({ kind: 'layer', par: Ly.par, base: base, gk: Ly.gk || 0, y: Ly.y }); }
      }
      var LYS = null, LYK = -1;
      function drawBackground(c, vw, vh, gs0, gain) {
        var hy = gs0 - 34 + gain * 0.045;
        sky(c, vw, vh, hy);
        if (K.drawSea) { K.drawSea(c, vw, vh, hy, gain, E, H); }
        if (!LYS || LYK !== E.len) { LYS = K.layers(E, H); LYK = E.len; }
        LYS.forEach(function (Ly) { layer(c, vw, vh, hy, gain, Ly); });
        // brume de fond (horizon) — désactivable (barre rectangulaire trop visible sur l'Orhy)
        if (K.horizonHaze && !K.noHorizonBar) {
          c.fillStyle = A.grad(c, 0, hy - 24, 0, hy + 40, [0, K.horizonHaze.replace(/[\d.]+\)$/, '0)'), 0.55, K.horizonHaze, 1, K.horizonHaze.replace(/[\d.]+\)$/, '0)')]); c.fillRect(0, hy - 24, vw, 64);
        }
        if (K.bgExtra) { K.bgExtra(c, vw, vh, hy, gain, E, H); }
        if (window.__bgProbe) { window.__bgProbe.hy = hy; window.__bgProbe.themeHy = hy; }
      }

      /* ---------- derrière le chemin : végétation plantée sur le terrain ---------- */
      var FL = null;
      function floraCfg() { if (!FL) { FL = K.flora(E, H); } return FL; }
      function drawBehind(c, xa, xb, bottom) {
        if (K.behindFirst) { K.behindFirst(c, xa, xb, bottom, E, H); }
        S.rows(c, xa, xb, bottom, { GF: E.GF, len: E.len, time: E.time, camY: E.cam.y, vh: E.vh }, floraCfg());
        if (K.behind) { K.behind(c, xa, xb, bottom, E, H); }
      }

      /* ---------- marches ---------- */
      function drawStairs(c, xa, xb) {
        E.feat.stairs.forEach(function (s) {
          if (s.x1 < xa || s.x0 > xb) { return; }
          for (var x = s.x0; x < s.x1; x += 12) {
            if (x + 12 < xa || x > xb) { continue; }
            var gy = E.G[x + 1], h = E.hash(x, 120), sn = SNOWON ? snowAt(x) : 0, k;
            if (K.stairs === 'concrete') {
              c.fillStyle = '#9d978a'; c.fillRect(x, gy - 0.4, 12.4, 3.8);                      // contre-marche en ombre
              c.fillStyle = '#d6d1c4'; c.fillRect(x, gy - 0.5, 12.4, 1.5);                      // nez de marche éclairé
              c.fillStyle = 'rgba(60,56,48,.5)'; c.fillRect(x, gy + 2.9, 12.4, 0.6); c.fillStyle = 'rgba(70,64,56,.55)'; c.fillRect(x + 11.7, gy - 0.4, 0.7, 3.8);
              c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x + 0.6, gy + 1.4, 3 + h * 4, 0.45);
              c.fillStyle = 'rgba(90,100,60,.55)'; if (h > 0.55) { c.fillRect(x + 8, gy - 1, 3.4, 0.9); }   // mousse dans le joint
            } else if (K.stairs === 'stone') {
              c.fillStyle = '#6d6556'; c.fillRect(x, gy - 0.4, 12.4, 3.8);
              c.fillStyle = E.mix('#9a9078', '#b6ac90', h); c.fillRect(x, gy - 0.5, 12.4, 1.6);
              c.fillStyle = 'rgba(30,24,18,.55)'; c.fillRect(x, gy + 2.9, 12.4, 0.6); c.fillRect(x + 5 + h * 3, gy + 0.9, 0.5, 2);
              c.fillStyle = 'rgba(240,230,200,.25)'; c.fillRect(x + 1, gy + 1.3, 4 + h * 3, 0.45);
              c.fillStyle = 'rgba(70,60,48,.7)'; for (k = 0; k < 3; k++) { c.fillRect(x + 1.2 + k * 3.6 + h * 1.4, gy - 1.2, 1.1, 0.8); }
            } else {                                                                              // bois : rondins + planches
              var pl = K.stairs === 'planks';
              c.fillStyle = pl ? '#7a5634' : '#5b3a24'; c.fillRect(x, gy - 0.4, 12.4, 3.6);
              c.fillStyle = pl ? '#c79a62' : '#a97b4a'; c.fillRect(x, gy - 0.4, 12.4, 1.2);
              c.fillStyle = 'rgba(30,14,10,.55)'; c.fillRect(x, gy + 2.7, 12.4, 0.6); c.fillStyle = '#2a1810'; c.fillRect(x + 11.6, gy - 0.4, 0.8, 3.6);
              c.fillStyle = 'rgba(255,224,170,.25)'; c.fillRect(x + 1, gy + 1.2, 5 + h * 4, 0.45);
              if (!pl) { c.fillStyle = '#8a7a62'; c.fillRect(x + 0.8, gy - 1.2, 10.8, 0.9); for (k = 0; k < 4; k++) { c.fillStyle = E.hash(x + k, 121) > 0.5 ? '#4a4034' : '#b0a088'; c.fillRect(x + 1.2 + k * 2.6 + E.hash(x, 122 + k) * 1.2, gy - 1.5, 1, 0.9); } }
              else { c.fillStyle = '#a07a48'; c.fillRect(x + 0.6, gy - 1.2, 11, 0.9); c.fillStyle = 'rgba(50,30,16,.5)'; c.fillRect(x + 6, gy - 1.2, 0.4, 0.9); }
            }
            if (sn > 0.05) { c.fillStyle = 'rgba(244,249,255,' + (0.92 * sn) + ')'; c.fillRect(x + 0.2, gy - 1.9, 12, 1.5 + sn); c.fillStyle = 'rgba(180,200,230,' + (0.6 * sn) + ')'; c.fillRect(x + 0.2, gy - 0.5, 12, 0.5); }
          }
          if (K.stairRail) { K.stairRail(c, s, xa, xb, E, H); }
        });
      }

      /* ---------- accessoires ---------- */
      function drawSnowCap(c, xa, xb) {
        // congères : bande blanche sur la surface, plus épaisse en pleine zone de neige, avec reflets bleus
        var x, gy, k, t = E.time;
        for (x = Math.floor(xa / 3) * 3; x < xb + 3; x += 3) {
          k = snowAt(x); if (k < 0.03) { continue; }
          var ty = E.TYPE[x | 0]; if (ty === 1 || ty === 4 || ty === 6) { continue; }
          gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
          var th = (1.1 + 1.8 * E.nz(x / 14, 41) + 0.8 * E.nz(x / 4, 42)) * k;
          c.fillStyle = 'rgba(247,251,255,' + Math.min(1, 0.55 + k * 0.45) + ')'; c.fillRect(x, gy - th + 0.4, 3.1, th + 1.2);
          c.fillStyle = 'rgba(176,198,232,' + (0.55 * k) + ')'; c.fillRect(x, gy + 0.2, 3.1, 0.6);
          if (E.hash(x, 43) > 0.93) { c.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5 * Math.sin(t * 5 + x)) + ')'; c.fillRect(x + 1, gy - th - 0.8, 0.8, 0.8); }
        }
      }
      function drawProps(c, xa, xb) {
        S.lip(c, xa, xb, { G: E.G, TYPE: E.TYPE, time: E.time }, { mix: floraCfg().lipMix });
        if (K.lipExtra) { K.lipExtra(c, xa, xb, E, H); }
        if (SNOWON) { drawSnowCap(c, xa, xb); }
        if (K.props) { K.props(c, xa, xb, E, H); }
      }
      function drawFind(c, f) { var fn = K.finds[f.id]; if (!fn) { return false; } fn(c, f, E); return true; }
      function drawSummit(c, sx, sy) { if (K.summit) { K.summit(c, sx, sy, E, H); } }

      var out = { pal: K.pal, bw: bw, drawBackground: drawBackground, drawBehind: drawBehind, drawStairs: drawStairs, drawProps: drawProps, drawFind: drawFind, drawSummit: drawSummit,
        tileAlpha: K.tileAlpha, rockPal: K.rockPal, tilePal: K.tilePal, depthTint: K.depthTint, strataCol: K.strataCol, glow0: K.glow0, glow1: K.glow1, vig: K.vig, summitReplace: !!K.summitReplace,
        noMotes: !!K.noMotes, noStrata: !!K.noStrata, cloudSea: !!K.cloudSea, noHorizonBar: !!K.noHorizonBar,
        winZoomPort: K.winZoomPort, winZoomLand: K.winZoomLand, winLook: K.winLook, playLook: K.playLook, hideSummitFlag: !!K.hideSummitFlag,
        hideSummitCairn: !!K.hideSummitCairn, hideSummitBoard: !!K.hideSummitBoard,
        summitBoardX: K.summitBoardX, summitBoardW: K.summitBoardW, summitBoardSize: K.summitBoardSize };
      return out;
    });
  }
  window.AlpineBuild = build; window.AlpineHelpers = { peaks: peaks, coneAt: coneAt, domeAt: domeAt, cloud2: cloud2 };
  window.auditAnchor = function (name, x, footY, surfaceY) {
    if (!window.__anchorAudit) { return; }
    window.__anchorAudit.push({
      name: String(name),
      x: +(+x).toFixed(1),
      footY: +(+footY).toFixed(1),
      surfaceY: +(+surfaceY).toFixed(1),
      dy: +((+footY) - (+surfaceY)).toFixed(1)
    });
  };

})();
