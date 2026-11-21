/* v0.16.2 — thèmes Pays basque, niveaux 10 à 13 (muraille d'Aizkorri en longue crête).
   Style vectoriel classique d'Ursuya / Atxuria : silhouettes à dégradés, brume, ancrage monde.
   Aucun décor peint en jeu. Helpers repris de BasqueArt / AlpineHelpers. */
(function () {
  'use strict';
  var H0 = window.AlpineHelpers, peaks = H0.peaks, A = window.Art, S = window.Scenery;
  var B = window.BasqueArt || {};
  var ss = B.ss, nzf = B.nzf, boardIf = B.boardIf, outline = B.outline;

  function afOf(E) {
    var s = E.feat && E.feat.summitX;
    var x = (E.P && E.P.x != null) ? E.P.x : (E.cam && E.cam.x) || 0;
    return s ? Math.max(0, Math.min(1, x / s)) : 0;
  }

  function auditFoot(c, name, x, y) {
    if (!window.auditAnchor) { return; }
    var px = x, py = y, m;
    try {
      if (c && c.getTransform) {
        m = c.getTransform();
        px = m.a * x + m.c * y + m.e;
        py = m.b * x + m.d * y + m.f;
      }
    } catch (err) {}
    window.auditAnchor(name, px, py, y);
  }

  function hut(c, x, base, s, roof) {
    s = s || 1; roof = roof || '#6a3a28';
    auditFoot(c, 'hut', x, base);
    c.save(); c.translate(x, base); c.scale(s, s);
    c.fillStyle = A.grad(c, -8, 0, 8, 0, [0, '#c8c0b0', 1, '#8a8474']);
    c.fillRect(-8, -8, 18, 8);
    c.strokeStyle = '#3a3428'; c.lineWidth = 0.5; c.strokeRect(-8, -8, 18, 8);
    c.fillStyle = roof;
    c.beginPath(); c.moveTo(-10, -7.5); c.lineTo(1, -13.2); c.lineTo(12, -7.5); c.closePath(); c.fill();
    c.strokeStyle = '#2a2018'; c.lineWidth = 0.45; c.stroke();
    c.fillStyle = '#3a3024'; c.fillRect(-1, -5.2, 3, 5.2);
    c.restore();
  }

  function miniFlock(c, x, gy, n, seed, E) {
    var i, sx, sy, face, body;
    auditFoot(c, 'flock', x, gy);
    for (i = 0; i < n; i++) {
      sx = x + i * 9 + ((E && E.hash) ? E.hash(seed + i, 90) : i * 0.3) * 5;
      sy = gy - 1.2;
      face = (i % 2) ? 1 : -1;
      body = i % 3 ? '#f4f1e8' : '#e8e4d6';
      c.fillStyle = 'rgba(20,16,10,.15)'; c.beginPath(); c.ellipse(sx, sy + 2, 3.2, 0.65, 0, 0, 7); c.fill();
      c.strokeStyle = '#2a2018'; c.lineWidth = 0.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx - 1.5, sy + 0.5); c.lineTo(sx - 1.7, sy + 2.1); c.moveTo(sx + 1.3, sy + 0.5); c.lineTo(sx + 1.6, sy + 2.1); c.stroke();
      c.fillStyle = body; c.beginPath(); c.ellipse(sx, sy, 3.1, 1.9, 0, 0, 7); c.fill();
      c.fillStyle = i % 4 === 1 ? '#8a4a28' : '#2a2018';
      c.beginPath(); c.ellipse(sx + face * 2.9, sy - 0.4, 1.15, 0.95, 0.15 * face, 0, 7); c.fill();
    }
  }

  function miniCow(c, x, gy, betizu) {
    c.fillStyle = 'rgba(20,16,10,.15)'; c.beginPath(); c.ellipse(x, gy + 1.6, 4, 0.7, 0, 0, 7); c.fill();
    c.fillStyle = betizu ? '#a05628' : '#3a2a20';
    c.beginPath(); c.ellipse(x, gy - 1.2, 4.2, 2.3, 0, 0, 7); c.fill();
    c.fillStyle = betizu ? '#6a3418' : '#1e1612';
    c.beginPath(); c.ellipse(x + 3.6, gy - 2.0, 1.5, 1.2, 0.1, 0, 7); c.fill();
    c.strokeStyle = '#f0e6d0'; c.lineWidth = 0.55; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x + 3.0, gy - 3.1); c.quadraticCurveTo(x + 2.6, gy - 5.0, x + 3.4, gy - 5.6); c.stroke();
    c.beginPath(); c.moveTo(x + 3.8, gy - 3.1); c.quadraticCurveTo(x + 4.8, gy - 5.0, x + 5.4, gy - 5.4); c.stroke();
  }

  function drawRadarDome(c, x, y, r) {
    /* Boule seule : y = centre. Pas de mât. */
    r = r || 5.6;
    c.save();
    c.fillStyle = A.grad(c, x - r, y - r, x + r, y + r, [0, '#f4f2ee', 0.55, '#d0cec8', 1, '#9a9894']);
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.strokeStyle = '#4a4844'; c.lineWidth = 0.55; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.45)';
    c.beginPath(); c.ellipse(x - r * 0.28, y - r * 0.32, r * 0.38, r * 0.28, -0.4, 0, 7); c.fill();
    c.restore();
  }

  function drawRadarBall(c, x, y, s) {
    /* Conservé pour les finds de carnet (radar au premier plan). */
    s = s || 1;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#6a6860'; c.fillRect(-1.1, 0, 2.2, 4);
    c.fillStyle = '#9a9890'; c.fillRect(-0.45, 0, 0.7, 4);
    drawRadarDome(c, 0, -5.6, 5.6);
    c.restore();
  }

  function drawAntenna(c, x, y, h) {
    /* y = pied (sol ou toit). Segments rouge/blanc vers le haut, socle visible. */
    var k, n, seg;
    h = h || 16;
    n = Math.max(3, Math.round(h / 3));
    seg = h / n;
    c.save(); c.translate(x, y);
    c.fillStyle = '#6a6860';
    c.fillRect(-1.8, -1.1, 3.6, 1.8);
    for (k = 0; k < n; k++) {
      c.fillStyle = (k % 2) ? '#e8eae4' : '#b42822';
      c.fillRect(-0.7, -(k + 1) * seg, 1.4, seg);
    }
    c.fillStyle = '#d8dcd4'; c.fillRect(-1.3, -h - 1.2, 2.6, 1.2);
    c.restore();
  }

  /* ---------- finds (objets de carnet, dessinés en jeu) ---------- */
  var FINDS = {
    cromlech: function (c) {
      var i, a, r;
      c.fillStyle = 'rgba(20,16,10,.16)'; c.beginPath(); c.ellipse(0, 3.2, 7.2, 1.8, 0, 0, 7); c.fill();
      for (i = 0; i < 7; i++) {
        a = i / 7 * 6.28; r = 4.6;
        c.fillStyle = i % 2 ? '#c8c4b4' : '#a8a090';
        c.beginPath(); c.ellipse(Math.cos(a) * r, Math.sin(a) * r * 0.55, 1.15, 1.6, 0, 0, 7); c.fill();
        outline(c, 0.4, '#3a3830');
      }
    },
    obelisque: function (c) {
      c.fillStyle = A.grad(c, -2.4, 0, 2.4, 0, [0, '#d8d0c0', 1, '#8a8478']);
      c.beginPath(); c.moveTo(-2.4, 6); c.lineTo(-1.5, -5.2); c.lineTo(0, -8.2); c.lineTo(1.5, -5.2); c.lineTo(2.4, 6); c.closePath(); c.fill();
      outline(c, 0.55, '#2c2820');
      c.fillStyle = '#3a342c'; c.font = '2.4px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('1859', 0, 1.4);
    },
    venta: function (c) {
      c.fillStyle = A.grad(c, -6, 0, 6, 0, [0, '#e8e0d4', 1, '#b0a898']);
      c.fillRect(-6.2, -4.4, 12.4, 9.2); outline(c, 0.55, '#3a3428');
      c.fillStyle = '#a42820';
      c.beginPath(); c.moveTo(-7.2, -4.2); c.lineTo(0, -8.6); c.lineTo(7.2, -4.2); c.closePath(); c.fill();
      outline(c, 0.5, '#4a1814');
      c.fillStyle = '#3a3024'; c.fillRect(-1.2, 0.6, 2.6, 4.2);
      c.fillStyle = '#7ec8e8'; c.fillRect(-4.6, -1.6, 2.4, 2.0); c.fillRect(2.2, -1.6, 2.4, 2.0);
    },
    radar: function (c) { drawRadarBall(c, 0, 2, 1.05); },
    cromlech2: function (c) { FINDS.cromlech(c); },
    roland: function (c) {
      /* Brèche typifiée du Pas de Roland : rocher fendu, passage étroit. */
      c.fillStyle = A.grad(c, -6, -6, 6, 6, [0, '#c8bca8', 1, '#7a7060']);
      c.beginPath(); c.moveTo(-7.2, 6); c.lineTo(-6.4, -4); c.lineTo(-2.2, -7.2); c.lineTo(-1.2, 6); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(1.2, 6); c.lineTo(2.0, -6.4); c.lineTo(6.6, -3.2); c.lineTo(7.2, 6); c.closePath(); c.fill();
      outline(c, 0.55, '#3a3428');
      c.fillStyle = 'rgba(30,40,50,.35)'; c.fillRect(-1.15, -5.6, 2.3, 11.6);
    },
    arantzazu: function (c) {
      c.fillStyle = A.grad(c, -5, 0, 5, 0, [0, '#e8e4d8', 1, '#b0aa9a']);
      c.fillRect(-5.4, -2.2, 10.8, 7.4);
      outline(c, 0.5, '#3a3830');
      c.fillStyle = '#4a4038';
      c.beginPath(); c.moveTo(-6, -2.0); c.lineTo(0, -6.8); c.lineTo(6, -2.0); c.closePath(); c.fill();
      c.fillStyle = '#d8d4c8'; c.fillRect(-1.1, -11.6, 2.2, 6.2);
      c.fillStyle = '#3a3830';
      c.beginPath(); c.moveTo(-1.6, -11.6); c.lineTo(0, -15.2); c.lineTo(1.6, -11.6); c.closePath(); c.fill();
    },
    urbia: function (c) {
      hut(c, 0, 0, 0.85, '#6a4a30');
    },
    ermita: function (c) {
      c.fillStyle = A.grad(c, -5, 0, 5, 0, [0, '#e0dcd0', 1, '#9a9688']);
      c.fillRect(-5.6, -3.2, 11.2, 8.4); outline(c, 0.55, '#3a3830');
      c.fillStyle = '#6a3a28';
      c.beginPath(); c.moveTo(-6.6, -3.0); c.lineTo(0, -8.4); c.lineTo(6.6, -3.0); c.closePath(); c.fill();
      outline(c, 0.45, '#2a1814');
      c.fillStyle = '#3a3024'; c.fillRect(-1.1, 0.6, 2.4, 4.6);
      c.strokeStyle = '#d8d0b8'; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(0, -8.6); c.lineTo(0, -11.2); c.moveTo(-1.3, -10.2); c.lineTo(1.3, -10.2); c.stroke();
    },
    larraitz: function (c) {
      c.fillStyle = A.grad(c, -5, 0, 5, 0, [0, '#f0ece4', 1, '#b8b0a0']);
      c.fillRect(-5.4, -2.8, 10.8, 8.0); outline(c, 0.55, '#3a3830');
      c.fillStyle = '#a42820';
      c.beginPath(); c.moveTo(-6.4, -2.6); c.lineTo(0, -8.0); c.lineTo(6.4, -2.6); c.closePath(); c.fill();
      c.fillStyle = '#3a3024'; c.fillRect(-1.0, 0.8, 2.2, 4.4);
      c.strokeStyle = '#d8d0b8'; c.lineWidth = 0.55;
      c.beginPath(); c.moveTo(0, -8.1); c.lineTo(0, -11.0); c.moveTo(-1.4, -10.0); c.lineTo(1.4, -10.0); c.stroke();
    },
    fuente: function (c, f, E) {
      var t = (E && E.time) || 0, drip = (t * 2 + (f && f.ph || 0)) % 1;
      c.fillStyle = '#8a8478'; c.fillRect(-5.4, -1.0, 10.8, 6.4); outline(c, 0.5, '#2a2820');
      c.fillStyle = A.grad(c, 0, 0, 0, 5, [0, '#7ec8e0', 1, '#2a6a88']); c.fillRect(-3.4, 0.8, 6.8, 3.2);
      c.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.4 * Math.sin(t * 6)).toFixed(2) + ')';
      c.beginPath(); c.arc(-0.6 + drip * 2, 1.4 + drip * 2.2, 0.65, 0, 7); c.fill();
    },
    croix: function (c) {
      c.fillStyle = '#3a3a38';
      c.fillRect(-0.7, -9.6, 1.4, 12.4);
      c.fillRect(-3.6, -7.4, 7.2, 1.3);
      outline(c, 0.45, '#1a1a18');
      c.fillStyle = '#6a6860'; c.fillRect(-1.4, 2.2, 2.8, 1.6);
    }
  };

  /* Les finds sont ancrés à G[x] - 34. On descend l'icône pour que son pied
     repose sur le sentier, enfoncé de 3 px (même règle que les décors L13). */
  var FIND_FOOT = 37;
  (function () {
    var id, fn;
    for (id in FINDS) {
      if (!FINDS.hasOwnProperty(id)) { continue; }
      fn = FINDS[id];
      FINDS[id] = (function (orig) {
        return function (c, f, E) {
          c.save();
          c.translate(0, FIND_FOOT);
          auditFoot(c, 'find', 0, 0);
          orig(c, f, E);
          c.restore();
        };
      }(fn));
    }
  }());

  /* ---------- silhouettes de sommets, ancrées en x monde ---------- */
  function drawCoastHills(c, vw, base, off, E) {
    var wx, tx, i, h;
    c.beginPath();
    c.moveTo(-40, base + 30);
    for (wx = -40; wx <= 900; wx += 16) {
      tx = wx - off;
      h = 8 + 10 * E.nz(wx / 90, 21) + (wx % 140 < 40 ? 7 : 0);
      c.lineTo(tx, base - h);
    }
    c.lineTo(vw + 40, base + 30);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 18, 0, base + 30, [0, '#7a8a70', 1, '#4a5a48']);
    c.fill();
  }

  function drawXoldokogaina(c, wx, base, off) {
    /* Colline typifiée vers Ibardin / l'océan (~486 m), dôme herbeux bas, sans antenne. */
    var tx = wx - off, yBot = base + 28;
    if (tx < -160 || tx > 1600) { return; }
    c.beginPath();
    c.moveTo(tx - 90, yBot);
    c.lineTo(tx - 58, base - 6);
    c.quadraticCurveTo(tx - 20, base - 22, tx, base - 24);
    c.quadraticCurveTo(tx + 28, base - 20, tx + 62, base - 4);
    c.lineTo(tx + 96, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 24, 0, yBot, [0, '#8aaa70', 1, '#4a6448']);
    c.fill();
    c.strokeStyle = 'rgba(40,52,36,.18)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(tx - 58, base - 6); c.quadraticCurveTo(tx, base - 24, tx + 62, base - 4); c.stroke();
  }
  function drawIbanteli(c, wx, base, off) {
    /* Relief typifié du côté de Sare (~649 m), crête un peu plus marquée, sans antenne. */
    var tx = wx - off, yBot = base + 32;
    if (tx < -180 || tx > 1600) { return; }
    c.beginPath();
    c.moveTo(tx - 100, yBot);
    c.lineTo(tx - 70, base - 4);
    c.quadraticCurveTo(tx - 30, base - 28, tx - 6, base - 34);
    c.lineTo(tx + 8, base - 30);
    c.quadraticCurveTo(tx + 36, base - 26, tx + 70, base - 6);
    c.lineTo(tx + 110, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 34, 0, yBot, [0, '#7a9a60', 0.45, '#5a7a48', 1, '#3e5438']);
    c.fill();
    c.strokeStyle = 'rgba(36,44,32,.22)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(tx - 70, base - 4); c.quadraticCurveTo(tx - 6, base - 34, tx + 70, base - 6); c.stroke();
  }
  function drawTroisCouronnes(c, wx, base, off) {
    /* Aiako Harria typifié : trois crêtes granitiques (Erroilbide, Txurrumurru, Irumugarrieta). */
    var tx = wx - off, yBot = base + 26, i, xs, hs, hw;
    if (tx < -180 || tx > 1600) { return; }
    xs = [-34, 0, 32]; hs = [28, 36, 30]; hw = [18, 20, 18];
    for (i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(tx + xs[i] - hw[i] - 16, yBot);
      c.lineTo(tx + xs[i] - hw[i] * 0.35, base - hs[i] + 8);
      c.lineTo(tx + xs[i], base - hs[i]);
      c.lineTo(tx + xs[i] + hw[i] * 0.4, base - hs[i] + 9);
      c.lineTo(tx + xs[i] + hw[i] + 14, yBot);
      c.closePath();
      c.fillStyle = A.grad(c, 0, base - hs[i], 0, yBot, [0, '#c0b8a8', 0.4, '#8a8478', 1, '#5a5a50']);
      c.fill();
    }
  }
  function drawFlankHill(c, wx, base, off, h, w, c0, c1) {
    var tx = wx - off, yBot = base + 30;
    if (tx < -160 || tx > 1600) { return; }
    h = h || 22; w = w || 70;
    c.beginPath();
    c.moveTo(tx - w - 20, yBot);
    c.quadraticCurveTo(tx - w * 0.3, base - h * 0.6, tx, base - h);
    c.quadraticCurveTo(tx + w * 0.35, base - h * 0.55, tx + w + 22, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - h, 0, yBot, [0, c0 || '#7a9a68', 1, c1 || '#4a6244']);
    c.fill();
  }

  /* Pied d'un décor sur la surface d'une couche (fn en x monde). */
  function layerY(base, fn, wx) {
    return base - (fn ? fn(wx) : 0);
  }

  /* Plan lointain plein-largeur, fermé jusqu'à bot, pour qu'aucune bande de ciel
     n'apparaisse sous une crête ou entre deux massifs. */
  function fillFarHorizon(c, vw, base, off, bot, Ev, pal) {
    var x, y, wx;
    pal = pal || { c0: '#a8b0aa', c1: '#7a847c' };
    bot = (bot != null) ? bot : base + 160;
    c.beginPath();
    c.moveTo(-48, bot);
    c.lineTo(-48, base + 18);
    for (x = -48; x <= vw + 48; x += 18) {
      wx = x + off;
      y = base + 6 + 10 * (Ev && Ev.nz ? Ev.nz(wx / 90, 13) : 0) + 6 * Math.sin(wx * 0.012);
      c.lineTo(x, y);
    }
    c.lineTo(vw + 48, base + 18);
    c.lineTo(vw + 48, bot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 8, 0, bot, [0, pal.c0, 1, pal.c1]);
    c.fill();
  }

  /* Colline typifiée, fermée jusqu'à bot. Retourne le y de crête (pour y poser une maison). */
  function closedHill(c, wx, base, off, h, w, bot, c0, c1) {
    var tx = wx - off;
    bot = (bot != null) ? bot : base + 80;
    h = h || 22; w = w || 70;
    c.beginPath();
    c.moveTo(tx - w, bot);
    c.quadraticCurveTo(tx - w * 0.55, base - h * 0.25, tx - w * 0.15, base - h);
    c.quadraticCurveTo(tx + w * 0.2, base - h * 0.7, tx + w * 0.55, base - h * 0.35);
    c.quadraticCurveTo(tx + w + 8, base + 4, tx + w + 16, bot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - h, 0, bot, [0, c0 || '#6a8a4c', 1, c1 || '#3a5a30']);
    c.fill();
    return base - h;
  }

  function forestMass(c, x0, x1, yRidge, yBot, seed, opt) {
    if (B.forestMass) { B.forestMass(c, x0, x1, yRidge, yBot, seed, opt); return; }
    var i, n, t, x, y, yR, pad, col;
    opt = opt || {}; seed = seed || 0; col = opt.col || '#2a4a2c'; pad = 28;
    function ridgeAt(xx) { return (typeof yRidge === 'function') ? yRidge(xx) : yRidge; }
    c.beginPath();
    c.moveTo(x0 - pad, yBot + 6);
    c.quadraticCurveTo(x0, ridgeAt(x0) + 2, x0 + 8, ridgeAt(x0));
    n = Math.max(6, ((x1 - x0) / 14) | 0);
    for (i = 1; i <= n; i++) {
      t = i / n; x = x0 + (x1 - x0) * t;
      y = ridgeAt(x) + Math.sin(t * 6 + seed) * 3;
      c.quadraticCurveTo(x - (x1 - x0) / n * 0.5, y - 2, x, y);
    }
    c.quadraticCurveTo(x1, ridgeAt(x1) + 2, x1 + pad, yBot + 6);
    c.closePath();
    c.fillStyle = col; c.fill();
  }

  function forestedRidge(c, wx, base, off, E, h, w, seed) {
    /* Crête boisée organique (pas un triangle, pas de paroi verticale). */
    var tx = wx - off, yBot = base + 28;
    if (tx < -220 || tx > 1500) { return; }
    h = h || 20; w = w || 140; seed = seed || 0;
    c.beginPath();
    c.moveTo(tx - w - 20, yBot);
    c.quadraticCurveTo(tx - w * 0.5, base - h * 0.45, tx - w * 0.15, base - h);
    c.quadraticCurveTo(tx + w * 0.2, base - h * 0.7, tx + w * 0.55, base - h * 0.4);
    c.quadraticCurveTo(tx + w + 8, base + 2, tx + w + 24, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - h, 0, yBot, [0, '#5a7a44', 1, '#2e4a2c']);
    c.fill();
    forestMass(c, tx - w * 0.85, tx + w * 0.75, function (x) {
      var u = (x - tx) / w;
      return base - h * Math.max(0.15, 1 - u * u * 0.7) + 4;
    }, yBot, seed, { col: '#2a4a2c', col2: '#1a3220', mix: 0.12, pad: 18 });
  }

  /* Baigura typifié (≈ 897 m), dôme herbeux à l'est de la Nive, vu depuis l'Artzamendi.
     Pas d'antennes inventées. */
  function drawBaigura(c, wx, base, off, E) {
    var tx = wx - off, yBot = base + 36;
    if (tx < -160 || tx > 1400) { return; }
    c.beginPath();
    c.moveTo(tx - 130, yBot);
    c.quadraticCurveTo(tx - 80, base - 4, tx - 40, base - 28);
    c.quadraticCurveTo(tx - 8, base - 46, tx + 16, base - 42);
    c.quadraticCurveTo(tx + 48, base - 24, tx + 90, base + 4);
    c.quadraticCurveTo(tx + 130, base + 16, tx + 150, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 46, 0, yBot, [0, '#8aaa68', 0.45, '#5a7a44', 1, '#3a5234']);
    c.fill();
    /* ravine organique, pas un triangle d'ombre */
    c.fillStyle = 'rgba(50, 58, 40, .16)';
    c.beginPath();
    c.moveTo(tx + 4, base - 30);
    c.quadraticCurveTo(tx + 22, base - 8, tx + 40, base + 10);
    c.quadraticCurveTo(tx + 16, base - 6, tx + 2, base - 24);
    c.closePath();
    c.fill();
  }

  /* Vallée typifiée de la Nive / Laxia : bande plus basse, boisée, un filet d'eau. */
  function drawNiveValley(c, vw, base, off, E, drop) {
    var wx, tx, y, yBot, floor, i;
    drop = drop || 0;
    yBot = base + 36 + drop;
    floor = base + 14 + drop;
    c.beginPath();
    c.moveTo(-40, yBot);
    for (wx = -40; wx <= 920; wx += 14) {
      tx = wx - off;
      y = floor + 5 * E.nz(wx / 90, 27) + (wx % 200 < 50 ? 4 : 0);
      c.lineTo(tx, y);
    }
    c.lineTo(vw + 40, yBot + 8);
    c.closePath();
    c.fillStyle = A.grad(c, 0, floor - 8, 0, yBot, [0, '#4a6a38', 1, '#2a4226']);
    c.fill();
    /* bande boisée de fond de vallée */
    forestMass(c, -20 - off, 860 - off, function (x) {
      var wx0 = x + off;
      return floor - 6 + 4 * E.nz(wx0 / 80, 29);
    }, yBot, 41, { col: '#2a4a28', col2: '#1a3220', mix: 0.08, pad: 20 });
    /* filet typifié de la Nive, ancré en x monde */
    c.beginPath();
    for (wx = -20; wx <= 700; wx += 10) {
      tx = wx - off;
      y = floor + 8 + 3 * E.nz(wx / 70, 28) + 2 * Math.sin(wx * 0.04);
      if (wx === -20) { c.moveTo(tx, y); } else { c.lineTo(tx, y); }
    }
    c.strokeStyle = 'rgba(50, 110, 150, 0.5)'; c.lineWidth = 2.0; c.lineCap = 'round'; c.stroke();
  }

  /* Prairie typifiée des campas d'Urbía / Oltza : plateau herbeux sous la crête. */
  function drawUrbiaMeadow(c, wx, base, off, E, w) {
    var tx = wx - off, yBot = base + 22, half = w || 180;
    if (tx < -half - 40 || tx > 1400) { return; }
    c.beginPath();
    c.moveTo(tx - half, yBot);
    c.quadraticCurveTo(tx - half * 0.4, base - 6, tx, base - 10);
    c.quadraticCurveTo(tx + half * 0.45, base - 4, tx + half, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 10, 0, yBot, [0, '#9cb86a', 0.55, '#6a8a48', 1, '#4a6a34']);
    c.fill();
  }

  /* Vallée typifiée du Goierri / Oria, vue depuis le Txindoki : fond de vallée,
     quelques etxe, pas un plan de ville inventé. */
  function goierriBowlY(wx, base, drop, E) {
    /* Plancher du Goierri en x monde : versants hauts sous Aizkorri (wx~70)
       et sous Aralar (wx~480), creux autour de wx~280. */
    /* Creux entre le pied droit d'Aizkorri et le versant d'Aralar, pas sous la paroi. */
    var u = (wx - 380) / 150;
    var bowl = Math.max(0, 1 - u * u);
    var nz = (E && E.nz) ? E.nz(wx / 90, 31) : 0;
    return (base + 2) + drop * bowl + 3.5 * nz;
  }

  function drawGoierriValley(c, vw, base, off, E, drop) {
    /* Vallée du Goierri : plancher vert en contrebas, parcelles, etxe dans
       la brume. Aucune dalle crème, aucun bord droit. */
    var wx, tx, y, yBot, floor, i, j, clusters, cl, fx, fy, fw, pal, x0, x1, step;
    drop = drop != null ? drop : 28;
    floor = base + 2 + drop;
    yBot = floor + 52;
    x0 = -120;
    x1 = Math.max(vw + 120, 1200 - off);
    step = 14;
    c.beginPath();
    c.moveTo(x0, yBot);
    for (tx = x0; tx <= x1; tx += step) {
      wx = tx + off;
      y = goierriBowlY(wx, base, drop, E);
      c.lineTo(tx, y);
    }
    c.lineTo(x1, yBot);
    c.closePath();
    /* vert de fond de vallée, légèrement voilé en haut (jamais crème ciel) */
    c.fillStyle = A.grad(c, 0, base + 2, 0, yBot, [0, '#8aa86a', 0.35, '#6a8a48', 0.7, '#4e6e34', 1, '#3a5628']);
    c.fill();
    pal = ['#8aaa60', '#c8b878', '#6a8a48', '#d4c890', '#5a7a3c'];
    for (i = 0; i < 16; i++) {
      fx = 40 + i * 52 + ((i * 17) % 19);
      tx = fx - off;
      if (tx < -30 || tx > vw + 30) { continue; }
      fy = goierriBowlY(fx, base, drop, E) + 4 + (i % 5);
      fw = 16 + (i % 4) * 5;
      c.fillStyle = pal[i % pal.length];
      c.globalAlpha = 1;
      c.beginPath();
      c.moveTo(tx - fw, fy + 2);
      c.quadraticCurveTo(tx, fy - 3 - (i % 3), tx + fw, fy + 1);
      c.lineTo(tx + fw - 2, fy + 7);
      c.quadraticCurveTo(tx, fy + 9, tx - fw + 2, fy + 6);
      c.closePath();
      c.fill();
      c.globalAlpha = 1;
    }
    c.beginPath();
    for (wx = 20; wx <= 780; wx += 14) {
      tx = wx - off;
      y = goierriBowlY(wx, base, drop, E) + 10 + 2.2 * Math.sin(wx * 0.028);
      if (wx === 20) { c.moveTo(tx, y); } else { c.lineTo(tx, y); }
    }
    c.strokeStyle = 'rgba(70, 120, 150, 0.4)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.stroke();
  }

    /* Sierra typifiée d'Aralar : plateau herbeux, rebords un peu calcaires. */
  function drawAralarSierra(c, wx, base, off, E) {
    /* Sierra d'Aralar typifiée : flancs boisés qui descendent vers le Goierri,
       crête herbeuse/calcaire née dans la pente (pas de triangles pâles
       superposés, pas de bande forestière flottante). */
    var tx = wx - off, yBot = base + 52, i, x, y, ridge;
    if (tx < -280 || tx > 1700) { return; }
    function ridgeY(dx) {
      var h = 0;
      h += 26 * Math.max(0, 1 - Math.pow((dx + 80) / 140, 2));
      h += 34 * Math.max(0, 1 - Math.pow((dx - 40) / 120, 2));
      h += 22 * Math.max(0, 1 - Math.pow((dx - 160) / 110, 2));
      return base - h;
    }
    /* massif herbeux continu, versant gauche doux vers le Goierri (pas de diagonale dure) */
    c.beginPath();
    c.moveTo(tx - 280, yBot);
    c.quadraticCurveTo(tx - 230, base + 28, tx - 180, base + 10);
    for (i = -160; i <= 260; i += 16) {
      c.lineTo(tx + i, ridgeY(i) + 2);
    }
    c.quadraticCurveTo(tx + 280, base + 16, tx + 310, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 34, 0, yBot, [0, '#8aaa62', 0.4, '#5a7a44', 1, '#3a5a30']);
    c.fill();
    /* forêts assises sur le flanc, lisière gauche arrondie, pieds sur la pente */
    function aralarForestTop(x, x0, x1, slack) {
      var u = Math.max(0, Math.min(1, (x - x0) / slack));
      var v = Math.max(0, Math.min(1, (x1 - x) / slack));
      var edge = Math.min(u, v);
      return ridgeY(x - tx) + 6 + (1 - edge) * 18;
    }
    forestMass(c, tx - 170, tx - 28, function (x) { return aralarForestTop(x, tx - 170, tx - 28, 36); }, function (x) { return ridgeY(x - tx) + 26; }, 17, { col: '#2a4a28', col2: '#1a3220', mix: 0.08, pad: 22 });
    forestMass(c, tx + 24, tx + 190, function (x) { return aralarForestTop(x, tx + 24, tx + 190, 42); }, function (x) { return ridgeY(x - tx) + 26; }, 29, { col: '#243c24', col2: '#162616', mix: 0.06, pad: 24 });
    /* quelques dents calcaires qui naissent dans la crête herbeuse (même masse) */
    c.beginPath();
    c.moveTo(tx - 20, ridgeY(-20) + 4);
    c.quadraticCurveTo(tx + 8, ridgeY(8) - 8, tx + 28, ridgeY(28) - 14);
    c.quadraticCurveTo(tx + 48, ridgeY(48) - 6, tx + 70, ridgeY(70) + 3);
    c.lineTo(tx + 36, ridgeY(36) + 6);
    c.closePath();
    c.fillStyle = A.grad(c, tx + 28, ridgeY(28) - 14, tx + 40, ridgeY(40) + 6, [0, '#d8d4c8', 0.55, '#a8a090', 1, '#7a766c']);
    c.fill();
  }

    function drawMondarrain(c, wx, base, off, E) {
    /* Mondarrain typifié : flancs boisés, cime rocheuse un peu irrégulière
       (pas un triangle à ombre plate). */
    var tx = wx - off, yBot = base + 36;
    if (tx < -180 || tx > 1400) { return; }
    /* soubassement large, dos arrondi, pas un cône pointu */
    c.beginPath();
    c.moveTo(tx - 160, yBot);
    c.quadraticCurveTo(tx - 120, base + 2, tx - 90, base - 10);
    c.quadraticCurveTo(tx - 50, base - 20, tx - 10, base - 24);
    c.quadraticCurveTo(tx + 30, base - 26, tx + 70, base - 16);
    c.quadraticCurveTo(tx + 110, base - 4, tx + 150, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 26, 0, yBot, [0, '#8a9a68', 0.45, '#5a7648', 1, '#3a5234']);
    c.fill();
    /* forêt jusqu'à l'épaule rocheuse (chevauchement, pas de joint ni de couvercle) */
    forestMass(c, tx - 145, tx + 2, function (x) {
      return base - 18 + Math.abs(x - (tx - 48)) * 0.05;
    }, yBot, 11, { col: '#2a4a28', col2: '#1a3220', mix: 0.1, pad: 16 });
    forestMass(c, tx + 6, tx + 145, function (x) {
      return base - 16 + Math.abs(x - (tx + 62)) * 0.045;
    }, yBot, 19, { col: '#264626', col2: '#183018', mix: 0.08, pad: 14 });
    /* calotte calcaire grise, née dans la pente boisée, plus haute que la canopée */
    c.beginPath();
    c.moveTo(tx - 44, base - 12);
    c.quadraticCurveTo(tx - 30, base - 22, tx - 18, base - 32);
    c.quadraticCurveTo(tx - 6, base - 40, tx + 6, base - 42);
    c.quadraticCurveTo(tx + 20, base - 38, tx + 32, base - 28);
    c.quadraticCurveTo(tx + 46, base - 16, tx + 58, base - 10);
    c.lineTo(tx + 24, base - 12);
    c.quadraticCurveTo(tx + 6, base - 16, tx - 20, base - 12);
    c.closePath();
    c.fillStyle = A.grad(c, tx, base - 42, tx + 16, base - 10, [0, '#c4c0b4', 0.45, '#9a9688', 1, '#6a6860']);
    c.fill();
    c.strokeStyle = 'rgba(80,76,70,.3)'; c.lineWidth = 0.65;
    c.beginPath(); c.moveTo(tx - 2, base - 34); c.lineTo(tx + 2, base - 14); c.stroke();
    c.beginPath(); c.moveTo(tx + 16, base - 32); c.lineTo(tx + 20, base - 12); c.stroke();
  }

  function artzaCrestY(base, dx) {
    /* Y canvas de la crête, même chemin que le dôme herbeux de drawArtzaTarget. */
    var segs, i, s, lo, hi, mid, k, u, t;
    function bx(sg, tt) { u = 1 - tt; return u * u * sg[0] + 2 * u * tt * sg[2] + tt * tt * sg[4]; }
    function by(sg, tt) { u = 1 - tt; return u * u * sg[1] + 2 * u * tt * sg[3] + tt * tt * sg[5]; }
    segs = [
      [-170, -6, -150, -28, -132, -30],
      [-132, -30, -108, -34, -90, -52],
      [-90, -52, -70, -48, -50, -70],
      [-50, -70, -24, -86, 2, -84],
      [2, -84, 22, -82, 40, -70],
      [40, -70, 58, -76, 76, -58],
      [76, -58, 100, -36, 126, -30],
      [126, -30, 158, -14, 186, -4]
    ];
    if (dx <= segs[0][0]) { return base + segs[0][1]; }
    if (dx >= segs[segs.length - 1][4]) { return base + segs[segs.length - 1][5]; }
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      if (dx <= s[4]) {
        lo = 0; hi = 1;
        for (k = 0; k < 12; k++) {
          mid = (lo + hi) * 0.5;
          if (bx(s, mid) < dx) { lo = mid; } else { hi = mid; }
        }
        t = (lo + hi) * 0.5;
        return base + by(s, t);
      }
    }
    return base;
  }

  function drawArtzaOutcrop(c, px, py, w, h, dir) {
    /* Banc rocheux bas, enfoncé dans l'herbe : table claire, front d'ombre. */
    var y = py + 3.2, s = dir < 0 ? -1 : 1;
    c.fillStyle = '#d4cec0';
    c.beginPath();
    c.moveTo(px - w * 0.62, y - h * 0.22);
    c.lineTo(px - w * 0.10, y - h);
    c.lineTo(px + w * 0.58, y - h * 0.55);
    c.lineTo(px + w * 0.70, y - h * 0.12);
    c.closePath();
    c.fill();
    c.fillStyle = '#6a645a';
    c.beginPath();
    c.moveTo(px - w * 0.62, y - h * 0.22);
    c.lineTo(px + w * 0.70, y - h * 0.12);
    c.lineTo(px + w * 0.48, y + 1.6);
    c.lineTo(px - w * 0.45, y + 1.6);
    c.closePath();
    c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.4;
    c.beginPath();
    c.moveTo(px - w * 0.62, y - h * 0.22);
    c.lineTo(px - w * 0.10, y - h);
    c.lineTo(px + w * 0.58, y - h * 0.55);
    c.stroke();
  }

  function drawArtzaTarget(c, wx, base, off, E, sc, opt) {
    /* Massif de l'Artzamendi : crêtes herbeuses irrégulières, affleurements,
       fougères, station radar (local + radôme + clôture) ancrée sur LA cime. */
    var tx = wx - off, yBot, crestY, bw, bh, rx, ry, i, px, py, hash;
    var foot, dx, n, x0, x1, pts, rail;
    sc = sc || 1;
    opt = opt || {};
    yBot = (opt.bot != null) ? opt.bot : (base + 160);
    crestY = base - 84;
    hash = (E && E.hash) ? E.hash : function (a, b) { return ((a * 13 + (b || 0) * 17) % 10) / 10; };
    if (tx < -300 || tx > 1700) { return; }
    c.save();
    c.globalAlpha = 1;
    c.translate(tx, base); c.scale(sc, sc); c.translate(-tx, -base);
    c.beginPath();
    c.moveTo(tx - 240, yBot);
    c.quadraticCurveTo(tx - 200, base + 8, tx - 170, base - 6);
    c.quadraticCurveTo(tx - 150, base - 28, tx - 132, base - 30);
    c.quadraticCurveTo(tx - 108, base - 34, tx - 90, base - 52);
    c.quadraticCurveTo(tx - 70, base - 48, tx - 50, base - 70);
    c.quadraticCurveTo(tx - 24, base - 86, tx + 2, crestY);
    c.quadraticCurveTo(tx + 22, base - 82, tx + 40, base - 70);
    c.quadraticCurveTo(tx + 58, base - 76, tx + 76, base - 58);
    c.quadraticCurveTo(tx + 100, base - 36, tx + 126, base - 30);
    c.quadraticCurveTo(tx + 158, base - 14, tx + 186, base - 4);
    c.quadraticCurveTo(tx + 220, base + 10, tx + 250, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, crestY, 0, yBot, [0, '#b0c070', 0.32, '#7a9a50', 0.68, '#4e6e36', 1, '#314c26']);
    c.fill();
    /* fougères opaques sur le bas de pente, clipées au massif */
    c.save();
    c.clip();
    if (B.fern) {
      for (i = 0; i < 8; i++) {
        px = tx - 100 + i * 26 + hash(i, 21) * 8;
        py = base + 8 + hash(i, 22) * 10;
        B.fern(c, px, py, 9 + 4 * hash(i, 23), 0, 400 + i);
      }
    }
    c.restore();
    /* pas d'affleurements « collés » : la crête reste herbeuse, la station ancrée. */
    /* station : pied sur le point le plus bas de l'emprise, enfoncé de 2 px */
    bw = 22; bh = 11;
    foot = Math.max(artzaCrestY(base, -11), artzaCrestY(base, 0), artzaCrestY(base, 11)) + 2.2;
    auditFoot(c, 'station', tx, foot);
    c.fillStyle = '#d8d4cc';
    c.fillRect(tx - bw * 0.5, foot - bh, bw, bh);
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.55; c.strokeRect(tx - bw * 0.5, foot - bh, bw, bh);
    c.fillStyle = '#6a6860';
    c.fillRect(tx - bw * 0.5 - 1.6, foot - bh - 1.0, bw + 3.2, 1.6);
    c.fillStyle = '#4a3a30';
    c.fillRect(tx - 3.2, foot - 6.2, 4.2, 6.2);
    c.fillStyle = '#7ec8e8';
    c.fillRect(tx + 4.0, foot - 8.4, 4.4, 3.2);
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.4; c.strokeRect(tx + 4.0, foot - 8.4, 4.4, 3.2);
    rx = tx + 1; ry = foot - bh - 1.0;
    c.fillStyle = '#8a8880'; c.fillRect(rx - 3.2, ry - 2.2, 6.4, 2.2);
    drawRadarDome(c, rx, ry - 2.2 - 6.2, 6.2);
    /* mâts rouge et blanc, pied posé sur la crête locale */
    drawAntenna(c, tx - 16, artzaCrestY(base, -16) + 2, 16);
    drawAntenna(c, tx + 16, artzaCrestY(base, 16) + 2, 14);
    /* clôture limitée au sommet, chaque piquet sur y = crête(x) + 2 */
    function fenceRun(xa, xb) {
      n = 4; pts = [];
      for (i = 0; i <= n; i++) {
        dx = xa + (xb - xa) * (i / n);
        py = artzaCrestY(base, dx) + 2;
        pts.push([tx + dx, py]);
        c.fillStyle = '#6a6860';
        c.fillRect(tx + dx - 0.55, py - 6.2, 1.1, 6.2);
      }
      c.strokeStyle = '#5a584c'; c.lineWidth = 0.7;
      for (rail = 0; rail < 2; rail++) {
        c.beginPath();
        c.moveTo(pts[0][0], pts[0][1] - (3.0 + rail * 2.4));
        for (i = 1; i < pts.length; i++) {
          c.lineTo(pts[i][0], pts[i][1] - (3.0 + rail * 2.4));
        }
        c.stroke();
      }
    }
    fenceRun(-24, -13);
    fenceRun(13, 24);
    c.restore();
  }

  function drawItsusi(c, wx, base, off, E) {
    var tx = wx - off, yBot = base + 32;
    if (tx < -120 || tx > 1400) { return; }
    c.beginPath();
    c.moveTo(tx - 90, yBot);
    c.lineTo(tx - 80, base + 4);
    c.lineTo(tx - 52, base - 22);
    c.lineTo(tx - 28, base - 8);
    c.lineTo(tx - 8, base - 28);
    c.lineTo(tx + 14, base - 6);
    c.lineTo(tx + 36, base - 20);
    c.lineTo(tx + 70, base + 6);
    c.lineTo(tx + 90, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 28, 0, yBot, [0, '#c8c0b0', 0.5, '#8a8474', 1, '#5a5648']);
    c.fill();
  }

  function drawArantzazu(c, wx, base, off, sc) {
    var tx = wx - off;
    if (tx < -80 || tx > 1400) { return; }
    sc = sc || 1;
    auditFoot(c, 'arantzazu', tx, base);
    c.save(); c.translate(tx, base); c.scale(sc, sc);
    /* amphithéâtre rocheux typifié + basilique */
    c.fillStyle = '#8a8474';
    c.beginPath(); c.moveTo(-48, 10); c.quadraticCurveTo(-24, -16, 0, -20); c.quadraticCurveTo(28, -12, 48, 10); c.closePath(); c.fill();
    c.fillStyle = '#d8d4c8';
    c.fillRect(-16, -22, 32, 18);
    c.fillStyle = '#4a443c';
    c.beginPath(); c.moveTo(-18, -22); c.lineTo(0, -36); c.lineTo(18, -22); c.closePath(); c.fill();
    c.fillStyle = '#c8c4b8'; c.fillRect(-22, -14, 10, 12);
    c.fillStyle = '#3a342c'; c.fillRect(-23, -15.2, 12, 1.4);
    c.fillStyle = '#e8e4da'; c.fillRect(-4, -52, 8, 18);
    c.fillStyle = '#3a3832';
    c.beginPath(); c.moveTo(-5.4, -52); c.lineTo(0, -66); c.lineTo(5.4, -52); c.closePath(); c.fill();
    c.restore();
  }

  function aizkorriCrestH(crest, dx) {
    var j, a, b, u;
    if (dx <= crest[0][0]) { return crest[0][1]; }
    if (dx >= crest[crest.length - 1][0]) { return crest[crest.length - 1][1]; }
    for (j = 1; j < crest.length; j++) {
      if (dx <= crest[j][0]) {
        a = crest[j - 1]; b = crest[j];
        u = (dx - a[0]) / (b[0] - a[0]);
        return a[1] + u * (b[1] - a[1]);
      }
    }
    return 8;
  }

  function drawAizkorriCrest(c, wx, base, off, E, sc, opt) {
    /* Muraille typifiée d'après Commons (Aizkorrira Urbiatik) :
       longue crête calcaire massive, nettement plus large que haute,
       ligne de crête doucement ondulée et un peu dentelée,
       trois cimes modestes (Aitxuri, Aketegi, Aizkorri + ermita),
       versants herbeux et éboulis au pied — pas d'aiguilles dolomitiques. */
    var tx = wx - off, s, yBot, i, px, py, crest, dx, h, foot, xL, xR, t, x0, y0, x1, y1, g;
    var far, hs, col0, col1, col2, col3, col4;
    s = sc || 1;
    opt = opt || {};
    far = !!opt.distant;
    hs = far ? 0.70 : 1;
    yBot = (opt.bot != null) ? opt.bot : (base + 140 * s);
    if (tx < -420 * s || tx > 1700) { return; }
    /* Largeur ~ 250, relief ~ 50 (ratio ≥ 5). Dans un cadre 461 on lit
       un long mur, pas trois tours. Aitxuri / Aketegi / Aizkorri = bosses basses. */
    crest = [
      [-112, 8],
      [-100, 14],
      [-88, 22],
      [-78, 30],
      [-70, 36],
      [-64, 42],
      [-58, 47],
      [-55, 50],
      [-52, 51],
      [-49, 50],
      [-46, 47],
      [-40, 44],
      [-34, 43],
      [-28, 45],
      [-22, 48],
      [-19, 49],
      [-16, 49],
      [-13, 48],
      [-10, 46],
      [-4, 43],
      [2, 42],
      [8, 44],
      [14, 47],
      [17, 48],
      [20, 48],
      [24, 47],
      [28, 46],
      [36, 43],
      [46, 40],
      [58, 36],
      [72, 32],
      [88, 28],
      [106, 24],
      [124, 20],
      [142, 16],
      [158, 12]
    ];
    if (opt.end === 'pass') {
      crest = crest.concat([[174, 13], [190, 10], [206, 11], [222, 7]]);
    }
    if (hs !== 1) {
      for (i = 0; i < crest.length; i++) {
        crest[i] = [crest[i][0], crest[i][1] * hs];
      }
    }
    xL = tx + crest[0][0] * s;
    xR = tx + crest[crest.length - 1][0] * s;

    /* tablier herbeux / avant-monts, remontant haut à gauche comme à Urbía */
    if (opt.apron === 'foothills') {
      c.fillStyle = A.grad(c, 0, base - 8 * s, 0, base + 48 * s, far
        ? [0, '#6a8a70', 0.5, '#4a6a58', 1, '#2e4a40']
        : [0, '#6a8a50', 0.45, '#4a6a38', 1, '#2e4a28']);
      c.beginPath();
      c.moveTo(xL - 16 * s, base + 50 * s);
      c.quadraticCurveTo(tx - 150 * s, base - 4 * s, tx - 30 * s, base + 4 * s);
      c.quadraticCurveTo(tx + 90 * s, base + 8 * s, tx + 210 * s, base + 14 * s);
      c.quadraticCurveTo(tx + 300 * s, base + 22 * s, xR + 24 * s, base + 38 * s);
      c.lineTo(xR + 24 * s, yBot);
      c.lineTo(xL - 16 * s, yBot);
      c.closePath();
      c.fill();
    } else {
      c.fillStyle = A.grad(c, 0, base - 10 * s, 0, yBot, [0, '#8aaa58', 0.45, '#5a7a40', 1, '#3e5e30']);
      c.beginPath();
      c.moveTo(xL - 24 * s, yBot);
      c.quadraticCurveTo(tx - 70 * s, base - 8 * s, tx + 10 * s, base + 2 * s);
      c.quadraticCurveTo(tx + 80 * s, base + 6 * s, xR + 16 * s, yBot);
      c.closePath();
      c.fill();
      /* herbe un peu plus haut sur le flanc gauche */
      c.fillStyle = 'rgba(90, 130, 64, 0.55)';
      c.beginPath();
      c.moveTo(xL - 8 * s, base + 18 * s);
      c.quadraticCurveTo(tx - 60 * s, base - 6 * s, tx - 10 * s, base + 10 * s);
      c.quadraticCurveTo(tx + 30 * s, base + 16 * s, tx + 70 * s, base + 20 * s);
      c.lineTo(xL - 8 * s, base + 22 * s);
      c.closePath();
      c.fill();
    }

    /* paroi : entrée en pente depuis l'herbe, crête arrondie, sortie en pente.
       La base descend généreusement sous le sol / les collines de premier plan
       (jusqu'à opt.bot, typiquement vh) : la muraille ne flotte jamais. */
    c.beginPath();
    c.moveTo(xL - 22 * s, yBot);
    c.lineTo(xL - 22 * s, base + 8 * s);
    c.quadraticCurveTo(xL - 8 * s, base + 2 * s, xL, base - crest[0][1] * s);
    /* segments courts : crête un peu dentelée, les bosses restent lisibles */
    for (i = 1; i < crest.length; i++) {
      c.lineTo(tx + crest[i][0] * s, base - crest[i][1] * s);
    }
    c.quadraticCurveTo(xR + 12 * s, base + 2 * s, xR + 20 * s, base + 8 * s);
    c.lineTo(xR + 20 * s, yBot);
    c.closePath();
    if (far) {
      col0 = '#b8c6ce'; col1 = '#9aadb6'; col2 = '#8498a2'; col3 = '#6e828c'; col4 = '#5a6e78';
    } else {
      col0 = '#f2ede4'; col1 = '#e0d8cc'; col2 = '#c8c0b4'; col3 = '#a89f94'; col4 = '#7a746c';
    }
    c.fillStyle = A.grad(c, 0, base - 52 * s, 0, base + 16 * s, [0, col0, 0.22, col1, 0.5, col2, 0.78, col3, 1, col4]);
    c.fill();

    /* lumière / ombre en dégradé horizontal, sans diagonale nette */
    c.save();
    c.clip();
    g = c.createLinearGradient(xL, 0, xR, 0);
    if (far) {
      g.addColorStop(0, 'rgba(236, 242, 246, 0.20)');
      g.addColorStop(0.45, 'rgba(236, 242, 246, 0.04)');
      g.addColorStop(0.58, 'rgba(48, 60, 70, 0.04)');
      g.addColorStop(1, 'rgba(48, 60, 70, 0.22)');
    } else {
      g.addColorStop(0, 'rgba(255, 250, 242, 0.22)');
      g.addColorStop(0.42, 'rgba(255, 250, 242, 0.04)');
      g.addColorStop(0.55, 'rgba(70, 64, 58, 0.04)');
      g.addColorStop(1, 'rgba(70, 64, 58, 0.24)');
    }
    c.fillStyle = g;
    c.fillRect(xL - 24 * s, base - 60 * s, (xR - xL) + 48 * s, 80 * s);

    /* 3 lits de stratification, propres, à peine ondulés (gisement calcaire) */
    for (i = 0; i < 3; i++) {
      t = 0.30 + i * 0.18;
      c.strokeStyle = far
        ? ('rgba(70, 82, 90, ' + (0.14 + 0.04 * i) + ')')
        : ('rgba(90, 82, 72, ' + (0.20 + 0.05 * i) + ')');
      c.lineWidth = (0.65 + i * 0.12) * s;
      c.beginPath();
      for (dx = crest[0][0] + 8; dx <= crest[crest.length - 1][0] - 8; dx += 8) {
        h = aizkorriCrestH(crest, dx);
        if (h < 12) { continue; }
        py = base - h * s + (5 + t * (h - 3)) * s;
        if (py > base + 8 * s) { continue; }
        px = tx + dx * s;
        if (dx === crest[0][0] + 8 || h < 13) { c.moveTo(px, py); } else { c.lineTo(px, py); }
      }
      c.stroke();
    }
    c.restore();

    /* éboulis pâles au contact herbe / paroi */
    for (i = 0; i < 6; i++) {
      dx = -86 + i * 38;
      h = aizkorriCrestH(crest, dx);
      if (h < 10) { continue; }
      px = tx + dx * s;
      py = base + 7 * s;
      c.fillStyle = far
        ? ('rgba(190, 200, 206, ' + (0.28 + 0.08 * (i % 2)) + ')')
        : ('rgba(214, 208, 194, ' + (0.40 + 0.1 * (i % 2)) + ')');
      c.beginPath();
      c.moveTo(px - (12 + i % 3 * 4) * s, py + 6 * s);
      c.quadraticCurveTo(px - 2 * s, py - 1 * s, px + 1 * s, py + 1 * s);
      c.quadraticCurveTo(px + 6 * s, py + 1 * s, px + (13 + i % 2 * 4) * s, py + 7 * s);
      c.quadraticCurveTo(px, py + 9 * s, px - (12 + i % 3 * 4) * s, py + 6 * s);
      c.closePath();
      c.fill();
    }

    /* bosquets sur le tablier herbeux, pas sur la paroi */
    if (opt.forest !== false) {
      forestMass(c, tx - 80 * s, tx + 10 * s, base - 2 * s, function (x) { return base + 16 * s; }, 21, { col: '#2a4228', col2: '#1a2e1c', mix: 0.08, pad: 8 });
      forestMass(c, tx + 70 * s, tx + 160 * s, base + 0 * s, function (x) { return base + 16 * s; }, 33, { col: '#243c24', col2: '#162616', mix: 0.06, pad: 8 });
    }

    /* ermita posée sur le plateau d'Aizkorri (dx ~ 20) */
    if (opt.hermitage !== false && !far && s >= 0.9) {
      px = tx + 20 * s;
      py = base - aizkorriCrestH(crest, 20) * s + 2 * s;
      c.fillStyle = '#c8c0b0';
      c.fillRect(px - 3.2 * s, py - 3.8 * s, 6.4 * s, 3.8 * s);
      c.fillStyle = '#8a8478';
      c.fillRect(px - 3.6 * s, py - 4.8 * s, 7.2 * s, 1.2 * s);
      c.fillRect(px - 3.2 * s, py - 5.4 * s, 6.4 * s, 0.7 * s);
      c.strokeStyle = 'rgba(40,36,32,.55)'; c.lineWidth = 0.4 * s;
      c.beginPath(); c.moveTo(px, py - 5.4 * s); c.lineTo(px, py - 7.0 * s);
      c.moveTo(px - 1.3 * s, py - 6.5 * s); c.lineTo(px + 1.3 * s, py - 6.5 * s); c.stroke();
      if (window.auditAnchor) { window.auditAnchor('aizkorri-hermitage', px, py, py); }
    }
  }

  function drawTxindokiPyramid(c, wx, base, off, E, sc, opt) {
    /* Cervin d'Aralar typifié : prairie d'approche, pyramide calcaire à arête
       propre, face d'ombre / face éclairée, barres et éboulis, silhouette fermée. */
    var tx, yBot, peakX, peakY, i, px, py, pr, hash;
    sc = sc || 1;
    opt = opt || {};
    tx = wx - off;
    yBot = (opt.bot != null) ? opt.bot : (base + 140);
    hash = (E && E.hash) ? E.hash : function (a, b) { return ((a * 13 + (b || 0) * 17) % 10) / 10; };
    if (tx < -280 || tx > 1700) { return; }
    c.save();
    c.globalAlpha = 1;
    c.translate(tx, base); c.scale(sc, sc); c.translate(-tx, -base);
    peakX = tx + 10;
    peakY = base - 124;

    /* Prairie / soubassement, large, jusqu'en bas du canvas */
    c.beginPath();
    c.moveTo(tx - 250, yBot);
    c.quadraticCurveTo(tx - 170, base + 12, tx - 100, base - 6);
    c.quadraticCurveTo(tx - 20, base - 16, tx + 50, base - 4);
    c.quadraticCurveTo(tx + 150, base + 14, tx + 250, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 18, 0, yBot, [0, '#92ac5c', 0.45, '#5c7c3e', 1, '#3a5a2c']);
    c.fill();

    /* Silhouette unique de la pyramide, fermée jusqu'à yBot */
    c.beginPath();
    c.moveTo(tx - 210, yBot);
    c.quadraticCurveTo(tx - 160, base + 6, tx - 118, base - 16);
    c.quadraticCurveTo(tx - 88, base - 38, tx - 70, base - 58);
    c.lineTo(tx - 52, base - 86);
    c.lineTo(tx - 26, base - 110);
    c.lineTo(peakX - 3, peakY);
    c.lineTo(peakX + 7, peakY + 4);
    c.lineTo(tx + 34, base - 102);
    c.lineTo(tx + 62, base - 70);
    c.quadraticCurveTo(tx + 100, base - 30, tx + 142, base - 4);
    c.quadraticCurveTo(tx + 190, base + 10, tx + 230, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, peakY, 0, yBot, [0, '#eeeae0', 0.26, '#c8c0ae', 0.46, '#8c9a66', 0.72, '#5a7644', 1, '#3c5a30']);
    c.fill();

    /* Face d'ombre (ouest) */
    c.beginPath();
    c.moveTo(peakX - 3, peakY);
    c.lineTo(tx - 26, base - 110);
    c.lineTo(tx - 52, base - 86);
    c.lineTo(tx - 70, base - 58);
    c.lineTo(tx - 18, base - 52);
    c.closePath();
    c.fillStyle = A.grad(c, tx - 60, peakY, peakX + 4, base - 40, [0, '#8e887c', 0.5, '#6a665c', 1, '#4a4840']);
    c.fill();

    /* Face éclairée (est, soleil à droite) */
    c.beginPath();
    c.moveTo(peakX - 3, peakY);
    c.lineTo(peakX + 7, peakY + 4);
    c.lineTo(tx + 34, base - 102);
    c.lineTo(tx + 62, base - 70);
    c.lineTo(tx + 20, base - 52);
    c.closePath();
    c.fillStyle = A.grad(c, peakX, peakY, tx + 70, base - 50, [0, '#fbf7f0', 0.4, '#ddd6c8', 1, '#b0a898']);
    c.fill();

    /* Arête et barres, strictement clipées à la roche */
    c.save();
    c.beginPath();
    c.moveTo(peakX - 3, peakY);
    c.lineTo(tx - 26, base - 110);
    c.lineTo(tx - 52, base - 86);
    c.lineTo(tx - 70, base - 58);
    c.lineTo(tx - 18, base - 52);
    c.lineTo(tx + 20, base - 52);
    c.lineTo(tx + 62, base - 70);
    c.lineTo(tx + 34, base - 102);
    c.lineTo(peakX + 7, peakY + 4);
    c.closePath();
    c.clip();
    c.strokeStyle = '#4a463e'; c.lineWidth = 1.2; c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(tx - 66, base - 56);
    c.lineTo(tx - 50, base - 84);
    c.lineTo(tx - 24, base - 108);
    c.lineTo(peakX, peakY + 1);
    c.lineTo(tx + 32, base - 100);
    c.stroke();
    for (i = 0; i < 5; i++) {
      c.strokeStyle = 'rgba(70, 66, 58, 0.45)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(peakX - 18 - i * 6, peakY + 14 + i * 10);
      c.lineTo(tx - 58 + i * 4, base - 70 + i * 8);
      c.stroke();
      c.beginPath();
      c.moveTo(peakX + 4 + i * 5, peakY + 16 + i * 10);
      c.lineTo(tx + 48 - i * 3, base - 68 + i * 9);
      c.stroke();
    }
    c.restore();

    /* Éboulis opaques au contact herbe / roche */
    for (i = 0; i < 10; i++) {
      px = tx - 70 + i * 16 + hash(i, 41) * 8;
      py = base - 46 + hash(i, 42) * 8;
      pr = 3.5 + hash(i, 43) * 4;
      c.fillStyle = i % 2 ? '#d0caba' : '#a8a090';
      c.beginPath();
      c.moveTo(px - pr, py + 2);
      c.lineTo(px - pr * 0.3, py - pr * 0.7);
      c.lineTo(px + pr * 0.8, py - pr * 0.3);
      c.lineTo(px + pr, py + 2);
      c.closePath();
      c.fill();
    }
    c.restore();
  }

  function drawEtxeCluster(c, x, y, sc, church) {
    /* Hameau basque : murs blancs, colombages, toits rouges, 100 % opaque. */
    var i, ox, oy, w;
    sc = sc || 1;
    c.save();
    c.globalAlpha = 1;
    c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = '#3a4a28';
    c.beginPath(); c.ellipse(0, 4, 38, 6, 0, 0, 7); c.fill();
    drawBasqueEtxe(c, -16, 0, 1, 0);
    drawBasqueEtxe(c, -2, 2, 0.88, 1);
    drawBasqueEtxe(c, 14, 1, 0.96, 2);
    if (church) { drawChapel(c, 0, -1, 0.82, '#b42820'); }
    c.restore();
  }

  function drawBasqueEtxe(c, x, y, sc, variant) {
    var w, h, beam;
    sc = sc || 1;
    variant = variant || 0;
    w = 16 + (variant % 3) * 2;
    h = 11;
    auditFoot(c, 'etxe', x, y);
    c.save();
    c.globalAlpha = 1;
    c.translate(x, y); c.scale(sc, sc);
    /* soubassement opaque */
    c.fillStyle = '#6a6458';
    c.fillRect(-w * 0.5 - 0.6, -1.2, w + 1.2, 2.4);
    /* murs blancs, aucun rgba */
    c.fillStyle = '#f4f0e6';
    c.fillRect(-w * 0.5, -h, w, h);
    c.strokeStyle = '#3a3228'; c.lineWidth = 0.55; c.strokeRect(-w * 0.5, -h, w, h);
    /* colombages */
    c.strokeStyle = '#3a2a20'; c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(-w * 0.5, -h); c.lineTo(-w * 0.5, 0);
    c.moveTo(0, -h); c.lineTo(0, 0);
    c.moveTo(w * 0.5, -h); c.lineTo(w * 0.5, 0);
    c.moveTo(-w * 0.5, -h * 0.5); c.lineTo(w * 0.5, -h * 0.5);
    if (variant % 2 === 0) {
      c.moveTo(-w * 0.5, -h); c.lineTo(0, -h * 0.5);
      c.moveTo(0, -h); c.lineTo(w * 0.5, -h * 0.5);
    }
    c.stroke();
    /* fenêtres et porte, opaques */
    c.fillStyle = '#7eb8d0';
    c.fillRect(-w * 0.32, -h + 2.2, 2.8, 2.4);
    c.fillRect(w * 0.12, -h + 2.2, 2.8, 2.4);
    c.strokeStyle = '#2a241c'; c.lineWidth = 0.4;
    c.strokeRect(-w * 0.32, -h + 2.2, 2.8, 2.4);
    c.strokeRect(w * 0.12, -h + 2.2, 2.8, 2.4);
    c.fillStyle = '#4a3020';
    c.fillRect(-1.4, -4.6, 2.8, 4.6);
    /* toit rouge à débord, opaque */
    c.fillStyle = '#c42820';
    c.beginPath();
    c.moveTo(-w * 0.5 - 1.8, -h + 0.6);
    c.lineTo(0, -h - 6.4);
    c.lineTo(w * 0.5 + 1.8, -h + 0.6);
    c.closePath();
    c.fill();
    c.strokeStyle = '#6a1814'; c.lineWidth = 0.5; c.stroke();
    c.restore();
  }

  function drawChapel(c, x, base, s, roof) {
    s = s || 1; roof = roof || '#a42820';
    auditFoot(c, 'chapel', x, base);
    c.save();
    c.globalAlpha = 1;
    c.translate(x, base); c.scale(s, s);
    /* ombre de fondation, sous le bâtiment seulement */
    c.fillStyle = '#3a4a28';
    c.beginPath(); c.ellipse(1, 1.2, 14, 2.2, 0, 0, 7); c.fill();
    /* nef, murs 100 % opaques (aucun rgba, aucun alpha) */
    c.fillStyle = '#f3efe6';
    c.fillRect(-12, -14, 26, 14);
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.6; c.strokeRect(-12, -14, 26, 14);
    /* porche */
    c.fillStyle = '#ece6da';
    c.fillRect(-4.2, -8, 8.4, 8);
    c.fillStyle = '#4a3020';
    c.fillRect(-2.0, -6.2, 4.0, 6.2);
    /* toit et clocher, opaques */
    c.fillStyle = roof;
    c.beginPath(); c.moveTo(-14.2, -13.2); c.lineTo(1, -24); c.lineTo(16.2, -13.2); c.closePath(); c.fill();
    c.fillStyle = '#f3efe6';
    c.fillRect(-2.4, -30, 5.2, 10);
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.5; c.strokeRect(-2.4, -30, 5.2, 10);
    c.fillStyle = roof;
    c.beginPath(); c.moveTo(-3.6, -29.4); c.lineTo(0.2, -36); c.lineTo(4.0, -29.4); c.closePath(); c.fill();
    c.strokeStyle = '#d8d0b8'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(0.2, -36); c.lineTo(0.2, -41);
    c.moveTo(-2.4, -39.2); c.lineTo(2.8, -39.2); c.stroke();
    c.restore();
  }

  /* ======================== 10. La Rhune ======================== */
  window.AlpineBuild({
    id: 'rhune', stairs: 'stone', summitReplace: true, noStrata: true, noHorizonBar: true, horizonHaze: 'rgba(220,230,236,.0)',
    winZoomPort: 0.50, winZoomLand: 0.66, winLook: 0.72,
    pal: {
      q: { base: '#5a4e36', mid: '#3a3226', lip: '#7aa048', hi: '#c8dc78', dark: '#242018' },
      f: { base: '#6a5a3c', mid: '#40362a', lip: '#8ab054', hi: '#d4e490', dark: '#2a241c' },
      c: { base: '#7a7058', mid: '#4a4438', lip: '#b0b070', hi: '#e8e8b0', dark: '#2e2a22' },
      k: { base: '#8a8474', mid: '#524c44', lip: '#c8c4b0', hi: '#f0ece0', dark: '#32302c' }
    },
    tileAlpha: 0.5, depthTint: 'rgba(36,32,28,.12)', strataCol: '#3a3428', glow0: 'rgba(255,230,190,.10)', glow1: 'rgba(255,210,150,0)', vig: 'rgba(28,36,44,.16)',
    rockPal: { hi: '#d8d0bc', mid: '#8a8270', lo: '#4a4438', line: '#2a261e', spot: 'rgba(110,100,80,.45)', rim: 'rgba(255,244,214,.5)' },
    tilePal: ['rgba(50,44,32,.28)', 'rgba(140,130,90,.18)', 'rgba(200,190,150,.14)', 'rgba(24,20,14,.3)'],
    sky: {
      stops: [0, '#3a6aa0', 0.46, '#8eb8d8', 0.8, '#e8d8c0', 1, '#ffe8c8'],
      sun: { x: 0.82, y: 0.66, r: 5.4, disc: '#fff8d8', g0: 'rgba(255,220,160,.38)', g1: 'rgba(255,200,130,0)', glow: 0.58 },
      clouds: { n: 7, y0: 0.16, y1: 0.52, s0: 0.85, s1: 0.95, top: '#f8f6f2', bot: '#d4c8b8', a0: 0.48, a1: 0.24, speed: 0.7 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), f = ss(0.08, 0.32, a) * (1 - ss(0.7, 0.92, a)), k = ss(0.78, 0.95, a); return [Math.max(0, 1 - f - k), f, 0, k]; }; },
    drawSea: function (c, vw, vh, hy, gain, E) {
      var sunX = 0.82 * vw - E.cam.x * 0.004;
      /* mer plus haute que les collines de fond, pour rester visible au sommet sur téléphone */
      B.sea(c, vw, vh, hy, E, { band: 86, y: -46, sunX: sunX, horizon: 'rgba(236,246,252,0.45)', horizonW: 2.2 });
    },
    layers: function (E, H) {
      var far = peaks([[100, 12, 160, 170, 0.7], [300, 16, 180, 170, 0.7], [540, 13, 170, 180, 0.7], [800, 17, 180, 170, 0.7]], nzf(E, 80, 3, 5));
      var mid = peaks([[180, 9, 260, 260, 0.65], [520, 11, 280, 260, 0.65], [880, 9, 260, 280, 0.65], [1240, 10, 260, 260, 0.65]], nzf(E, 55, 3, 6));
      var near = peaks([[220, 6, 280, 280, 0.6], [660, 7, 300, 280, 0.6], [1100, 6, 280, 300, 0.6]], nzf(E, 40, 2, 5));
      return [
        { par: 0.02, y: 24, hmax: 28, fn: far, c0: '#7a8a80', c1: '#b0c0b0', edge: 'rgba(40,50,48,.14)', haze: 'rgba(200,220,230,.22)', gk: 0.01,
          decor: function (c, vw, base, off, fn, Ev) {
            drawCoastHills(c, vw, base + 8, off, Ev);
            /* wx dans la fenêtre de parallaxe 0.02 (visibles du départ au sommet). Pas La Rhune. */
            drawXoldokogaina(c, 88, base + 2, off);
            drawTroisCouronnes(c, 128, base - 6, off);
          } },
        { par: 0.12, y: 34, hmax: 36, fn: mid, c0: '#6a8a58', c1: '#4a6a40', edge: 'rgba(40,48,36,.22)', haze: 'rgba(210,220,200,.10)', gk: 0.03,
          decor: function (c, vw, base, off, fn, Ev) {
            /* Un relief par tranche de parcours : Ibanteli typifié au milieu, collines de flanc ailleurs. */
            drawFlankHill(c, 90, base - 4, off, 20, 64, '#7a9a60', '#4a6244');
            drawIbanteli(c, 280, base - 8, off);
            drawFlankHill(c, 520, base - 6, off, 24, 72, '#6a8a58', '#3e5638');
          } },
        { par: 0.24, y: 48, hmax: 24, fn: near, c0: '#4a7240', c1: '#2e4e2c', edge: 'rgba(30,40,28,.2)', gk: 0.08,
          trees: { step: 20, seed: 41, dens: 0.28, maxH: 26, size: 13, haze: 0.1, hazeCol: '#c8d4b0', kind: function (x, hv) { return hv < 0.5 ? 'oak' : 'beech'; } },
          decor: function (c, vw, base, off, fn, Ev) {
            var spots = [90, 200, 320, 460, 620], i, wx, tx, hy;
            for (i = 0; i < spots.length; i++) {
              wx = spots[i]; tx = wx - off; if (tx < -30 || tx > vw + 30) { continue; }
              hy = layerY(base, fn, wx) + 3;
              hut(c, tx, hy, 0.95 + 0.15 * (i % 2), '#a42820');
              miniFlock(c, tx - 32, hy + 1, 5 + (i % 3), 20 + i, Ev);
              if (i === 1 || i === 3) { miniCow(c, tx + 22, hy, true); }
            }
          } }
      ];
    },
    flora: function (E, H) {
      var cfg = { hazeCol: '#c8d4b0', rows: [
        { step: 24, seed: 14, haze: 0.16, fillTop: '#9cb85a', fillBot: '#6a8444', up: function (x) { return 10 + 4 * E.nz(x / 140, 5); }, dens: function (x) { return 0.36 * (1 - ss(0.28, 0.62, H.af(x))); }, size: function () { return 15; }, kind: function (x) { return E.hash(x, 44) > 0.5 ? 'oak' : 'beech'; } },
        { step: 18, seed: 25, haze: 0.06, fillTop: '#90b050', fillBot: '#5c7a40', up: function () { return 4; }, dens: function (x) { return 0.16 * (1 - ss(0.45, 0.8, H.af(x))); }, size: function () { return 10; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), open = ss(0.12, 0.4, a), bare = ss(0.62, 0.88, a);
        var g = E.mix('#7cb046', '#c4d06a', open);
        return { dens: 0.92 - 0.35 * bare, grass: 1.6, fern: 0.7 * (1 - ss(0.7, 0.95, a)), heather: 0.08 * open, bush: 0.08 * (1 - open), broom: 0.16 * open * (1 - bare), flower: 0.1, gcol: E.mix(g, '#3a6a28', 0.2), gcol2: E.mix(g, '#e8f4a0', 0.5), fcol: '#3f8a3a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      var x, h, rx, r, gtop, ry;
      for (x = Math.floor(xa / 44) * 44; x < xb + 44; x += 44) {
        h = E.hash(x, 301); if (h > 0.42 + 0.4 * (1 - H.af(x))) { continue; }
        rx = x + h * 30; r = 3.2 + 6 * E.hash(x, 303);
        gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)); ry = gtop - r * 0.2;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
    },
    lipExtra: function (c, xa, xb, E, H) {
      var x, h, ty, gy;
      for (x = Math.floor(xa / 22) * 22; x < xb + 22; x += 22) {
        h = E.hash(x, 330); ty = E.TYPE[x | 0]; if (h > 0.5 || ty === 1 || ty === 4) { continue; }
        gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        if (ss(0.15, 0.55, H.af(x)) > 0.2 && B.fern) { B.fern(c, x + h * 8, gy, 9 + 5 * E.hash(x, 331), E.time, x); }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['COL DE', 'SAINT-IGNACE'], 50, 18, 3.2);
      boardIf(c, E, xa, xb, 108, ['169 m'], 24, 12, 3.3, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx + 34, ['LA RHUNE'], 44, 12, 3.3, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      /* Échelle réelle : sprite randonneur ≈ 37 u pour 1,75 m (HSC 1.2), donc 1 m ≈ 21,1 u.
         Ventas / bâtiment TDF : 2–3 niveaux (7–10 m = 4–6× le personnage), portes à sa taille.
         Train ~3 m de haut. Tour TDF 58 m, élancée, sort en haut de l'écran. */
      var HU = 37, M = HU / 1.75;
      var i, k, hx, hy, G = E.G, hash = E.hash || A.hash, bx, by, mastX, mastH, band, y0, y1, ww, hh, vx, vy, dw, dh;
      function gAt(x) { var v = G && G[Math.max(0, Math.min(E.len || 0, x | 0))]; return (v != null && isFinite(v)) ? v : sy; }
      /* Reculer les bâtiments : l'échelle réelle (1 m ≈ 21,1 u) est conservée dans leur plan.
         Le scale() est une perspective de distance (second plan), pas une réduction du premier plan
         (table d'orientation, borne, randonneur restent à l'échelle 1). Plus d'océan reste visible au téléphone. */
      function recede(ax, ay, sc, fn) {
        c.save();
        c.translate(ax, ay - (1 - sc) * 26);
        c.scale(sc, sc);
        c.translate(-ax, -ay);
        fn();
        c.restore();
      }

      /* plateau herbeux / rocheux, même plan que le randonneur */
      c.fillStyle = '#6a7a4a';
      c.beginPath(); c.ellipse(sx + 24, sy + 3.2, 120, 14, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(130,122,100,.4)';
      c.beginPath(); c.ellipse(sx + 20, sy + 2.4, 90, 8, 0, 0, 7); c.fill();
      for (i = 0; i < 16; i++) {
        hx = sx - 70 + hash(i, 21) * 180; hy = gAt(hx) - 0.5;
        c.fillStyle = i % 3 ? '#c4bba8' : '#a8a090';
        c.beginPath(); c.ellipse(hx, hy, 5.5 + hash(i, 22) * 4, 2.0 + hash(i, 23) * 1.4, -0.15, 0, 7); c.fill();
      }

      /* ----- tour TDF 58 m + bâtiment technique, second plan (perspective) ----- */
      recede(sx + 132, gAt(sx + 132), 0.56, function () {
      mastX = sx + 132; mastH = 58 * M; by = gAt(mastX);
      /* dalle / grillage au pied */
      c.fillStyle = '#c8c4bc';
      c.fillRect(mastX - 20, by - 4, 44, 4);
      c.strokeStyle = '#6a6860'; c.lineWidth = 0.55; c.strokeRect(mastX - 20, by - 4, 44, 4);
      c.strokeStyle = 'rgba(80,82,84,.5)'; c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(mastX - 20, by - 4); c.lineTo(mastX - 20, by - 14); c.lineTo(mastX + 24, by - 14); c.lineTo(mastX + 24, by - 4); c.stroke();
      /* paraboles au pied */
      for (i = 0; i < 3; i++) {
        c.fillStyle = '#d8dce0';
        c.beginPath(); c.ellipse(mastX - 14 + i * 8, by - 10, 3.6, 3.0, -0.4, 0, 7); c.fill();
        c.strokeStyle = '#6a6e72'; c.lineWidth = 0.4; c.stroke();
      }
      /* pylône treillis secondaire, un peu en retrait */
      c.save(); c.translate(mastX + 18, by);
      c.strokeStyle = '#5a5e62'; c.lineWidth = 0.85;
      c.beginPath(); c.moveTo(-3.4, 0); c.lineTo(-1.0, -22 * M); c.moveTo(3.4, 0); c.lineTo(1.0, -22 * M); c.stroke();
      c.lineWidth = 0.5;
      for (k = 0; k < 12; k++) {
        hy = -k * (22 * M / 12);
        c.beginPath(); c.moveTo(-3.4 + k * 0.2, hy); c.lineTo(3.4 - k * 0.2, hy); c.stroke();
        c.beginPath(); c.moveTo(-3.0, hy); c.lineTo(2.6, hy - 22 * M / 12); c.stroke();
      }
      c.fillStyle = '#c8ccd0';
      c.beginPath(); c.ellipse(-4.4, -8 * M, 3.2, 2.4, -0.5, 0, 7); c.fill();
      c.beginPath(); c.ellipse(4.6, -12 * M, 2.8, 2.2, 0.4, 0, 7); c.fill();
      c.restore();

      /* fût cylindrique : largeur typifiée ~1,1 m pour rester élancé à l'écran, hauteur vraie 58 m */
      c.save(); c.translate(mastX, by);
      c.fillStyle = 'rgba(20,16,12,.16)';
      c.beginPath(); c.ellipse(2, 0.8, 12, 3, 0, 0, 7); c.fill();
      band = 1.8 * M;
      k = 0;
      while (-(k + 1) * band > -mastH - band) {
        y0 = -(k + 1) * band; y1 = -k * band;
        ww = 9.2 - k * 0.08;
        if (ww < 6.4) { ww = 6.4; }
        c.fillStyle = (k % 2 === 0) ? '#d82028' : '#f4f1ea';
        c.beginPath();
        c.moveTo(-ww, y1); c.lineTo(-ww + 0.15, y0); c.lineTo(ww - 0.15, y0); c.lineTo(ww, y1);
        c.closePath(); c.fill();
        c.fillStyle = 'rgba(20,16,12,.12)';
        c.fillRect(ww * 0.35, y0, ww * 0.55, y1 - y0);
        k += 1;
        if (k > 40) { break; }
      }
      /* passerelle rouge (à ~18 m, souvent hors cadre : on la dessine si elle entre) */
      hy = -18 * M;
      c.fillStyle = '#c01820';
      c.beginPath(); c.ellipse(0, hy, 13, 2.6, 0, 0, 7); c.fill();
      c.fillRect(-13, hy - 1.8, 26, 2.2);
      c.strokeStyle = '#8a1018'; c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(-13, hy - 1.8); c.lineTo(-13, hy - 7); c.lineTo(13, hy - 7); c.lineTo(13, hy - 1.8); c.stroke();
      for (k = -3; k <= 3; k++) {
        c.beginPath(); c.moveTo(k * 3.6, hy - 1.8); c.lineTo(k * 3.6, hy - 7); c.stroke();
      }
      /* quelques paraboles sur le fût, bas de tour (visibles) */
      c.fillStyle = '#d0d4d8';
      c.beginPath(); c.ellipse(-14, -6.5 * M, 5.2, 4.2, -0.5, 0, 7); c.fill();
      c.strokeStyle = '#5a5e62'; c.lineWidth = 0.5; c.stroke();
      c.fillStyle = '#d0d4d8';
      c.beginPath(); c.ellipse(13, -9 * M, 4.4, 3.6, 0.45, 0, 7); c.fill();
      c.stroke();
      c.restore();

      /* ----- bâtiment technique TDF, 3 niveaux, dans le même plan reculé que la tour ----- */
      bx = sx + 92; by = gAt(bx + 20);
      ww = 48; hh = 6.6 * M * 0.88;
      c.fillStyle = 'rgba(20,16,10,.16)';
      c.beginPath(); c.ellipse(bx + ww * 0.5, by + 2, ww * 0.55, 3.2, 0, 0, 7); c.fill();
      c.fillStyle = '#e6eaee';
      c.fillRect(bx, by - hh, ww, hh);
      c.fillStyle = '#cfd4d8';
      c.fillRect(bx + ww * 0.78, by - hh, ww * 0.22, hh);
      c.strokeStyle = '#4a4844'; c.lineWidth = 0.7;
      c.strokeRect(bx, by - hh, ww, hh);
      c.strokeStyle = 'rgba(70,68,64,.28)'; c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(bx, by - hh / 3); c.lineTo(bx + ww, by - hh / 3);
      c.moveTo(bx, by - 2 * hh / 3); c.lineTo(bx + ww, by - 2 * hh / 3);
      c.stroke();
      for (k = 0; k < 3; k++) {
        for (i = 0; i < 3; i++) {
          c.fillStyle = (i + k) % 4 === 0 ? '#3a4a3a' : '#2a3838';
          c.fillRect(bx + 7 + i * (ww - 14) / 3, by - (k + 0.78) * (hh / 3), 9, 11);
        }
      }
      c.fillStyle = '#b42820';
      c.beginPath();
      c.moveTo(bx - 4, by - hh + 1);
      c.lineTo(bx + ww * 0.5, by - hh - 1.8 * M * 0.88);
      c.lineTo(bx + ww + 4, by - hh + 1);
      c.closePath(); c.fill();
      c.strokeStyle = '#6a1814'; c.lineWidth = 0.6; c.stroke();
      /* porte du bâtiment technique, un peu plus petite (retrait) */
      dw = 0.9 * M * 0.88; dh = 2.0 * M * 0.88;
      c.fillStyle = '#3a3024';
      c.fillRect(bx + ww * 0.12, by - dh, dw, dh);
      c.strokeStyle = '#2a241c'; c.lineWidth = 0.5; c.strokeRect(bx + ww * 0.12, by - dh, dw, dh);
      });

      /* ----- ventas en second plan (échelle réelle dans leur plan, perspective de distance) ----- */
      function venta(vx, w, wall, roofH, doorOnLeft) {
        vy = gAt(vx + w * 0.4);
        c.fillStyle = 'rgba(20,16,10,.15)';
        c.beginPath(); c.ellipse(vx + w * 0.5, vy + 2, w * 0.58, 3.2, 0, 0, 7); c.fill();
        /* soubassement pierre */
        c.fillStyle = '#8a8478';
        c.fillRect(vx - 4, vy - 6, w + 8, 6);
        c.strokeStyle = '#4a463e'; c.lineWidth = 0.5; c.strokeRect(vx - 4, vy - 6, w + 8, 6);
        c.fillStyle = '#f0ece4';
        c.fillRect(vx, vy - wall, w, wall - 6);
        c.strokeStyle = '#4a4840'; c.lineWidth = 0.7; c.strokeRect(vx, vy - wall, w, wall - 6);
        /* bandeau d'étage */
        c.strokeStyle = 'rgba(70,68,64,.3)'; c.lineWidth = 0.5;
        c.beginPath(); c.moveTo(vx, vy - wall * 0.52); c.lineTo(vx + w, vy - wall * 0.52); c.stroke();
        /* toit */
        c.fillStyle = '#b42820';
        c.beginPath();
        c.moveTo(vx - 5, vy - wall + 2);
        c.lineTo(vx + w * 0.5, vy - wall - roofH);
        c.lineTo(vx + w + 5, vy - wall + 2);
        c.closePath(); c.fill();
        c.strokeStyle = '#6a1814'; c.lineWidth = 0.6; c.stroke();
        /* fenêtres + volets rouges, 2 niveaux ; RDC à côté de la porte, pas dessus */
        var cols = 2, j, wx0, wy0, row, winW, gap;
        dw = 1.0 * M; dh = 2.1 * M;
        hx = doorOnLeft ? vx + 6 : vx + w - 6 - dw;
        for (row = 0; row < 2; row++) {
          wy0 = vy - (row === 0 ? 1.55 * M : wall * 0.74);
          if (row === 0) {
            if (doorOnLeft) { wx0 = hx + dw + 6; winW = Math.max(0, vx + w - 8 - wx0); }
            else { wx0 = vx + 8; winW = Math.max(0, hx - 6 - wx0); }
            if (winW >= 14) {
              var gw = winW >= 18 ? 10 : 7, sw = winW >= 18 ? 4 : 3;
              c.fillStyle = '#c8e0e8'; c.fillRect(wx0 + sw, wy0 - 8, gw, 14);
              c.fillStyle = '#b42820';
              c.fillRect(wx0, wy0 - 8, sw, 14);
              c.fillRect(wx0 + sw + gw, wy0 - 8, sw, 14);
              c.strokeStyle = '#5a1814'; c.lineWidth = 0.4;
              c.strokeRect(wx0, wy0 - 8, sw + gw + sw, 14);
            }
          } else {
            for (j = 0; j < cols; j++) {
              wx0 = vx + 10 + j * ((w - 20) / cols);
              c.fillStyle = '#c8e0e8'; c.fillRect(wx0, wy0 - 8, 10, 14);
              c.fillStyle = '#b42820';
              c.fillRect(wx0 - 4, wy0 - 8, 4, 14);
              c.fillRect(wx0 + 10, wy0 - 8, 4, 14);
              c.strokeStyle = '#5a1814'; c.lineWidth = 0.4;
              c.strokeRect(wx0 - 4, wy0 - 8, 18, 14);
            }
          }
        }
        /* porte à l'échelle du personnage (~2,1 m) */
        dw = 1.0 * M; dh = 2.1 * M;
        hx = doorOnLeft ? vx + 6 : vx + w - 6 - dw;
        c.fillStyle = '#c8c0b0';
        c.fillRect(hx - 2.2, vy - dh - 2, dw + 4.4, dh + 2);
        c.fillStyle = '#2e261c';
        c.fillRect(hx, vy - dh, dw, dh);
        c.strokeStyle = '#1a1610'; c.lineWidth = 0.7; c.strokeRect(hx, vy - dh, dw, dh);
        c.strokeStyle = 'rgba(80,64,40,.45)'; c.lineWidth = 0.45;
        c.beginPath(); c.moveTo(hx + dw * 0.5, vy - dh + 1); c.lineTo(hx + dw * 0.5, vy - 1); c.stroke();
        c.fillStyle = '#c8a048'; c.beginPath(); c.arc(hx + dw - 3.4, vy - dh * 0.52, 1.15, 0, 7); c.fill();
        c.fillStyle = '#8a8478'; c.fillRect(hx - 3, vy - 2.2, dw + 6, 2.2);
      }
      /* venta lointaine, plus à droite et plus reculée */
      recede(sx + 86, gAt(sx + 86), 0.58, function () { venta(sx + 68, 42, 5.4 * M, 1.8 * M, false); });
      /* venta intermédiaire, encore dégagée du randonneur pour laisser voir l'océan */
      recede(sx + 58, gAt(sx + 58), 0.70, function () { venta(sx + 36, 58, 5.5 * M, 2.0 * M, true); });

      /* ----- table d'orientation (~1,15 m) et borne (~1,3 m), premier plan ----- */
      bx = sx + 8; by = gAt(bx);
      c.fillStyle = 'rgba(20,16,10,.18)'; c.beginPath(); c.ellipse(bx, by + 1.6, 10, 2.2, 0, 0, 7); c.fill();
      c.fillStyle = A.grad(c, bx - 6, 0, bx + 6, 0, [0, '#c8c0b0', 1, '#7a7468']);
      c.fillRect(bx - 5.5, by - 1.05 * M, 11, 1.05 * M);
      c.strokeStyle = '#3a362e'; c.lineWidth = 0.6; c.strokeRect(bx - 5.5, by - 1.05 * M, 11, 1.05 * M);
      c.fillStyle = '#8a8478'; c.beginPath(); c.ellipse(bx, by - 1.05 * M, 9.2, 3.0, 0, 0, 7); c.fill();
      c.fillStyle = '#e2d2a4'; c.beginPath(); c.ellipse(bx, by - 1.12 * M, 8.6, 2.7, 0, 0, 7); c.fill();
      c.strokeStyle = '#5a4a30'; c.lineWidth = 0.6;
      c.beginPath(); c.ellipse(bx, by - 1.12 * M, 8.6, 2.7, 0, 0, 7); c.stroke();
      c.strokeStyle = '#4a3820'; c.lineWidth = 0.5;
      c.beginPath(); c.moveTo(bx, by - 1.28 * M); c.lineTo(bx, by - 0.96 * M);
      c.moveTo(bx - 7, by - 1.12 * M); c.lineTo(bx + 7, by - 1.12 * M); c.stroke();
      c.fillStyle = '#6a2018'; c.beginPath(); c.moveTo(bx, by - 1.32 * M); c.lineTo(bx - 1.5, by - 1.1 * M); c.lineTo(bx + 1.5, by - 1.1 * M); c.closePath(); c.fill();
      /* borne frontière, à gauche du randonneur */
      bx = sx - 16; by = gAt(bx);
      c.fillStyle = A.grad(c, bx, 0, bx + 7, 0, [0, '#d0c8b8', 1, '#8a8478']);
      c.fillRect(bx, by - 1.3 * M, 6.4, 1.3 * M);
      c.fillStyle = '#c8c0b0'; c.fillRect(bx, by - 1.3 * M, 2.0, 1.3 * M);
      c.fillStyle = '#6a665c'; c.fillRect(bx, by - 1.3 * M - 2.2, 6.4, 2.2);
      c.strokeStyle = '#2c2820'; c.lineWidth = 0.6; c.strokeRect(bx, by - 1.3 * M - 2.2, 6.4, 1.3 * M + 2.2);
      c.fillStyle = '#9a9488'; c.fillRect(bx + 1.2, by - 0.8 * M, 4.0, 5);

      /* ----- gare d'arrivée + train, plan intermédiaire à droite ----- */
      recede(sx + 112, gAt(sx + 112), 0.62, function () {
      bx = sx + 100; by = gAt(bx + 10);
      /* voies */
      c.strokeStyle = '#3a3834'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(bx - 6, by + 0.5); c.lineTo(bx + 56, by + 0.2); c.stroke();
      c.strokeStyle = '#6a6860'; c.lineWidth = 0.7;
      for (i = 0; i < 10; i++) {
        hx = bx - 4 + i * 5.5;
        c.beginPath(); c.moveTo(hx, by + 1.6); c.lineTo(hx + 2, by - 1.2); c.stroke();
      }
      /* bâtiment de gare, 1,5 niveau (~5,5 m), légèrement en retrait */
      ww = 40; hh = 4.6 * M * 0.92;
      c.fillStyle = '#e8e6de';
      c.fillRect(bx + 18, by - hh, ww, hh);
      c.strokeStyle = '#4a4844'; c.lineWidth = 0.65; c.strokeRect(bx + 18, by - hh, ww, hh);
      c.fillStyle = '#b42820';
      c.fillRect(bx + 16, by - hh - 0.65 * M, ww + 4, 0.65 * M);
      c.fillStyle = '#c8e0e8'; c.fillRect(bx + 24, by - hh + 8, 11, 10);
      c.strokeStyle = '#3a3830'; c.lineWidth = 0.4; c.strokeRect(bx + 24, by - hh + 8, 11, 10);
      dw = 0.95 * M * 0.92; dh = 2.05 * M * 0.92;
      c.fillStyle = '#3a3024';
      c.fillRect(bx + 40, by - dh, dw, dh);
      c.strokeStyle = '#2a241c'; c.lineWidth = 0.5; c.strokeRect(bx + 40, by - dh, dw, dh);
      /* poteau caténaire */
      c.fillStyle = '#6a6860'; c.fillRect(bx + 44, by - 3.4 * M, 2.2, 3.4 * M);
      c.strokeStyle = '#4a4844'; c.lineWidth = 0.55;
      c.beginPath(); c.moveTo(bx + 6, by - 3.25 * M); c.lineTo(bx + 46, by - 3.25 * M); c.stroke();

      /* rame en bois verni, 3 m au faîte (pantographe compris un peu plus) */
      c.save(); c.translate(bx, by);
      c.fillStyle = 'rgba(20,16,10,.2)';
      c.beginPath(); c.ellipse(20, 1.2, 24, 2.4, 0, 0, 7); c.fill();
      /* roues */
      c.fillStyle = '#2a2826';
      c.beginPath(); c.arc(6, 0, 2.8, 0, 7); c.arc(28, 0, 2.8, 0, 7); c.fill();
      /* caisse : 2,4 m de caisse + toit */
      c.fillStyle = '#8a4a22';
      c.fillRect(0, -2.45 * M, 40, 2.35 * M);
      c.fillStyle = '#a05828';
      c.fillRect(0, -2.45 * M, 40, 0.55 * M);
      c.strokeStyle = 'rgba(40,24,12,.35)'; c.lineWidth = 0.5;
      for (i = 1; i < 10; i++) {
        c.beginPath(); c.moveTo(i * 4.0, -2.45 * M); c.lineTo(i * 4.0, -0.12 * M); c.stroke();
      }
      c.strokeStyle = '#3a2414'; c.lineWidth = 0.7; c.strokeRect(0, -2.45 * M, 40, 2.35 * M);
      /* toit */
      c.fillStyle = '#3a3834';
      c.beginPath(); c.moveTo(-1.4, -2.4 * M); c.quadraticCurveTo(20, -3.05 * M, 41.4, -2.4 * M);
      c.lineTo(40, -2.25 * M); c.lineTo(0, -2.25 * M); c.closePath(); c.fill();
      /* fenêtres à hauteur d'yeux */
      for (i = 0; i < 4; i++) {
        c.fillStyle = '#2a3840';
        c.fillRect(5 + i * 8.4, -2.15 * M, 6.4, 0.7 * M);
        c.strokeStyle = '#5a4030'; c.lineWidth = 0.4; c.strokeRect(5 + i * 8.4, -2.15 * M, 6.4, 0.7 * M);
      }
      /* cabine avant */
      c.fillStyle = '#6a3a1c';
      c.fillRect(-6, -2.35 * M, 7, 2.25 * M);
      c.fillStyle = '#1a2428'; c.fillRect(-4.4, -2.1 * M, 4.2, 0.65 * M);
      c.strokeStyle = '#3a2414'; c.lineWidth = 0.55; c.strokeRect(-6, -2.35 * M, 7, 2.25 * M);
      /* pantographe, sous la caténaire */
      c.strokeStyle = '#3a3a38'; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(18, -3.0 * M); c.lineTo(13, -3.85 * M); c.lineTo(23, -3.85 * M); c.lineTo(18, -3.0 * M); c.stroke();
      c.strokeStyle = '#5a5a56'; c.lineWidth = 0.6;
      c.beginPath(); c.moveTo(11.5, -3.95 * M); c.lineTo(24.5, -3.95 * M); c.stroke();
      c.restore();
      });
    }
  });

  /* ======================== 11. Artzamendi ======================== */
  window.AlpineBuild({
    id: 'artzamendi', stairs: 'stone', summitReplace: true, noStrata: true, noHorizonBar: true, horizonHaze: 'rgba(255,220,170,.12)',
    pal: {
      q: { base: '#6a4e32', mid: '#3e3224', lip: '#8aaa48', hi: '#d4e07a', dark: '#2a2016' },
      f: { base: '#74563a', mid: '#44362a', lip: '#9cbc54', hi: '#e0ea90', dark: '#2c241c' },
      c: { base: '#7a6850', mid: '#4a4034', lip: '#b4c46a', hi: '#e8eeb0', dark: '#2e2a22' },
      k: { base: '#8a7a68', mid: '#52483e', lip: '#c8c090', hi: '#f0ecd0', dark: '#322e28' }
    },
    tileAlpha: 0.48, depthTint: 'rgba(50,32,16,.14)', strataCol: '#4a3a28', glow0: 'rgba(255,200,120,.16)', glow1: 'rgba(255,180,90,0)', vig: 'rgba(40,28,20,.14)',
    rockPal: { hi: '#d8c8b0', mid: '#8a7a64', lo: '#4a3e30', line: '#2a241c', spot: 'rgba(120,90,60,.4)', rim: 'rgba(255,230,200,.5)' },
    tilePal: ['rgba(70,50,28,.26)', 'rgba(160,120,70,.16)', 'rgba(220,190,140,.12)', 'rgba(30,20,12,.3)'],
    sky: {
      stops: [0, '#4a7ab8', 0.42, '#9ec4e0', 0.78, '#f0d8b0', 1, '#ffe6b8'],
      sun: { x: 0.72, y: 0.58, r: 6.2, disc: '#fff4c8', g0: 'rgba(255,200,110,.5)', g1: 'rgba(255,180,80,0)', glow: 0.75 },
      clouds: { n: 4, y0: 0.18, y1: 0.48, s0: 0.7, s1: 0.8, top: '#fff8f0', bot: '#e0d0b8', a0: 0.32, a1: 0.16, speed: 0.5 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), f = ss(0.05, 0.22, a) * (1 - ss(0.55, 0.85, a)), k = ss(0.8, 0.96, a); return [Math.max(0, 1 - f - k), f, 0, k]; }; },
    drawSea: function (c, vw, vh, hy, gain, E) {
      /* Mer lointaine, seulement depuis le haut du massif : bande mince, pâle,
         en perspective aérienne, jamais collée aux collines. */
      var af = afOf(E), a = ss(0.58, 0.92, af) * 0.55;
      if (a < 0.05 || !B.sea) { return; }
      c.save(); c.globalAlpha = a;
      B.sea(c, vw, vh, hy, E, { band: 18, y: -58, sunX: vw * 0.72, horizon: 'rgba(210,226,236,0.35)', horizonW: 1.4 });
      c.restore();
    },
    layers: function (E, H) {
      /* ciel (moteur) -> chaîne pyrénéenne basque fermée -> vallée de la Nive
         et collines boisées opaques -> massif de l'Artzamendi en approche. */
      var far = peaks([[80, 2, 300, 300, 0.96]], nzf(E, 100, 1, 2));
      var mid = peaks([[200, 2, 280, 280, 0.9]], nzf(E, 70, 1.2, 3));
      var near = peaks([[200, 2, 280, 280, 0.9]], nzf(E, 50, 1.2, 3));
      function niveHillY(wx, base) {
        return base + 8 - 16 * Math.sin((wx + 40) * 0.011) - 8 * Math.cos(wx * 0.007);
      }
      return [
        { par: 0.015, y: 18, hmax: 10, hs: 1, fn: far, noFill: true, c0: '#8a9a88', c1: '#c0c8b8', gk: 0,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var bot, i, wx, tx, h, w, c0, c1;
            bot = (vh != null) ? vh + 8 : base + 180;
            fillFarHorizon(c, vw, base + 8, off, bot, Ev, { c0: '#7a8a86', c1: '#4a5854' });
            /* chaîne : plusieurs crêtes fermées, perspective aérienne, opaques */
            for (i = 0; i < 5; i++) {
              wx = off + vw * (0.08 + i * 0.22) + (i % 2) * 18;
              tx = wx - off;
              h = 22 + (i % 3) * 10;
              w = 110 + (i % 2) * 30;
              c0 = i < 2 ? '#9aa498' : (i < 4 ? '#8a9480' : '#7a8a6c');
              c1 = i < 2 ? '#5a645c' : '#4a5a48';
              c.beginPath();
              c.moveTo(tx - w - 24, bot);
              c.quadraticCurveTo(tx - w * 0.6, base - h * 0.25, tx - w * 0.15, base - h);
              c.quadraticCurveTo(tx + w * 0.2, base - h * 0.72, tx + w * 0.7, base - h * 0.3);
              c.quadraticCurveTo(tx + w + 16, base + 6, tx + w + 28, bot);
              c.closePath();
              c.fillStyle = A.grad(c, 0, base - h, 0, bot, [0, c0, 1, c1]);
              c.fill();
            }
            drawMondarrain(c, off + vw * 0.28, base - 4, off, Ev);
            drawBaigura(c, off + vw * 0.62, base - 2, off, Ev);
          } },
        { par: 0.10, y: 36, hmax: 12, hs: 1, fn: mid, step: 1, noFill: true, c0: '#6a8a48', c1: '#4a6a34', gk: 0,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var bot, af, wx, tx, hy;
            bot = (vh != null) ? vh + 8 : base + 180;
            af = afOf(Ev);
            fillFarHorizon(c, vw, base + 12, off, bot, Ev, { c0: '#5a7a40', c1: '#2e4a26' });
            drawNiveValley(c, vw, base, off, Ev, 18 + 20 * ss(0.15, 0.85, af));
            forestedRidge(c, off + vw * 0.20, base - 4, off, Ev, 28, 240, 7);
            forestedRidge(c, off + vw * 0.55, base, off, Ev, 24, 250, 15);
            forestMass(c, -40, vw + 40, function (x) {
              return niveHillY(x + off, base - 6);
            }, bot, 41, { col: '#243e24', col2: '#162616', mix: 0, pad: 22, noTrunks: true });
            if (af < 0.40) {
              c.save(); c.globalAlpha = 1;
              wx = 90;
              hy = niveHillY(wx, base) + 3;
              drawEtxeCluster(c, wx - off, hy, 0.92, false);
              c.restore();
            }
          } },
        { par: 0.22, y: 50, hmax: 12, hs: 1, fn: near, noFill: true, c0: '#5a7a3c', c1: '#3a5a2c', gk: 0,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var af = afOf(Ev), bot, artSc, artY, artX;
            bot = (vh != null) ? vh + 8 : base + 180;
            /* Massif d'approche : grandit, reste ancré, ne fond pas avant le vrai sommet. */
            /* Croissance retardée : encore petite à 40 %, pleine à l'approche. */
            artSc = 0.40 + 0.95 * ss(0.22, 0.92, af);
            artY = base - 6 - 16 * ss(0.22, 0.92, af);
            artX = off + vw * (0.70 - 0.10 * ss(0.22, 0.92, af));
            if (af < 0.92) {
              c.save(); c.globalAlpha = 1;
              drawArtzaTarget(c, artX, artY, off, Ev, artSc, { bot: bot });
              c.restore();
            }
          } }
      ];
    },
    flora: function (E, H) {
      var cfg = { hazeCol: '#d4c8a8', rows: [
        { step: 36, seed: 16, haze: 0.14, fillTop: '#a8b85a', fillBot: '#748444', up: function (x) { return 6 + 2 * E.nz(x / 120, 5); }, dens: function (x) { return 0.08 * (1 - ss(0.08, 0.28, H.af(x))); }, size: function () { return 9; }, kind: function () { return 'oak'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), open = ss(0.06, 0.3, a);
        var g = E.mix('#8cbc52', '#d0dc78', open);
        return { dens: 0.88, grass: 1.8, fern: 0.85 * (1 - ss(0.75, 0.96, a)), heather: 0.04, bush: 0.04, broom: 0.14 * open, flower: 0.08, gcol: E.mix(g, '#4a6a28', 0.15), gcol2: E.mix(g, '#e8f4a0', 0.45), fcol: '#4a8a3a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      var x, h, rx, r, gtop, ry;
      for (x = Math.floor(xa / 50) * 50; x < xb + 50; x += 50) {
        h = E.hash(x, 301); if (h > 0.55) { continue; }
        rx = x + h * 28; r = 3 + 5 * E.hash(x, 303);
        gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)); ry = gtop - r * 0.2;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
    },
    lipExtra: function (c, xa, xb, E, H) {
      var x, h, ty, gy;
      for (x = Math.floor(xa / 18) * 18; x < xb + 18; x += 18) {
        h = E.hash(x, 350); ty = E.TYPE[x | 0]; if (h > 0.55 || ty === 1 || ty === 4) { continue; }
        gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        if (B.fern && ss(0.0, 0.85, H.af(x)) > 0.05) { B.fern(c, x + h * 8, gy, 10 + 6 * E.hash(x, 351), E.time, x); }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 70, ['PAS DE', 'ROLAND'], 56, 18, 3.2);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx + 120, ['ARTZAMENDI'], 54, 13, 3.2, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      var i, hx, hy, G = E.G, hash = E.hash || A.hash;
      function gAt(x) { var v = G && G[Math.max(0, Math.min(E.len || 0, x | 0))]; return (v != null && isFinite(v)) ? v : sy; }
      for (i = 0; i < 20; i++) {
        hx = sx - 70 + hash(i, 31) * 150; hy = gAt(hx);
        c.strokeStyle = 'rgba(90,120,48,.65)'; c.lineWidth = 0.5; c.beginPath();
        c.moveTo(hx, hy); c.lineTo(hx + (hash(i, 33) - 0.5) * 2, hy - 2.2 - hash(i, 34) * 2); c.stroke();
      }
      /* Station radar typifiée (vues Iparla / Ahetze) : local technique + radôme
         posé sur le toit, antennes. Reculée en second plan pour l'échelle (pas une
         sucette isolée à côté du randonneur). */
      (function () {
        var M = 37 / 1.75, ax = sx - 82, ay, i, ww, hh, rx, ry, rad, ped;
        function recede(px, py, sc, fn) {
          c.save();
          c.translate(px, py);
          c.scale(sc, sc);
          c.translate(-px, -py);
          fn();
          c.restore();
        }
        ay = gAt(ax);
        recede(ax, ay, 0.80, function () {
          ww = 5.4 * M; hh = 3.1 * M;
          c.fillStyle = 'rgba(20,16,10,.16)';
          c.beginPath(); c.ellipse(ax, ay + 1.6, ww * 0.55, 2.4, 0, 0, 7); c.fill();
          c.fillStyle = '#d0ccc4';
          c.fillRect(ax - ww * 0.5, ay - hh, ww, hh);
          c.strokeStyle = '#4a4840'; c.lineWidth = 0.65; c.strokeRect(ax - ww * 0.5, ay - hh, ww, hh);
          c.fillStyle = '#6a6860';
          c.fillRect(ax - ww * 0.5 - 2, ay - hh - 0.4 * M, ww + 4, 0.4 * M);
          c.fillStyle = '#3a3024';
          c.fillRect(ax - ww * 0.5 + 8, ay - 2.0 * M, 0.95 * M, 2.0 * M);
          c.strokeStyle = '#2a241c'; c.lineWidth = 0.5;
          c.strokeRect(ax - ww * 0.5 + 8, ay - 2.0 * M, 0.95 * M, 2.0 * M);
          c.fillStyle = '#c8e0e8'; c.fillRect(ax + 8, ay - hh + 8, 11, 9);
          c.strokeStyle = '#3a3830'; c.lineWidth = 0.35; c.strokeRect(ax + 8, ay - hh + 8, 11, 9);
          /* radôme fixé sur le toit, socle court (pas un mât de 5 m) */
          rx = ax + 10; ry = ay - hh - 0.4 * M; ped = 0.55 * M; rad = 1.05 * M;
          c.fillStyle = '#8a8880';
          c.fillRect(rx - 4, ry - ped, 8, ped);
          c.fillStyle = A.grad(c, rx - rad, ry - ped - rad, rx + rad, ry - ped + rad, [0, '#f4f2ee', 0.55, '#d0cec8', 1, '#9a9894']);
          c.beginPath(); c.arc(rx, ry - ped, rad, 0, 7); c.fill();
          c.strokeStyle = '#4a4844'; c.lineWidth = 0.7; c.stroke();
          c.fillStyle = 'rgba(255,255,255,.4)';
          c.beginPath(); c.ellipse(rx - rad * 0.28, ry - ped - rad * 0.25, rad * 0.35, rad * 0.28, -0.4, 0, 7); c.fill();
          drawAntenna(c, ax - 22, ay - hh, 16);
          drawAntenna(c, ax + 28, ay - hh, 13);
        });
      }());
    }
  });

  /* ======================== 12. Aizkorri ======================== */
  window.AlpineBuild({
    id: 'aizkorri', stairs: 'stone', summitReplace: true, noStrata: true, horizonHaze: 'rgba(220,226,230,.28)',
    pal: {
      q: { base: '#4a4030', mid: '#2e281e', lip: '#5a7a3c', hi: '#a0c06a', dark: '#1e1a14' },
      f: { base: '#6a5e46', mid: '#3e382c', lip: '#8aaa58', hi: '#d0e090', dark: '#2a261c' },
      c: { base: '#8a8474', mid: '#524e44', lip: '#c8c4b0', hi: '#f0ece0', dark: '#323028' },
      k: { base: '#9a9688', mid: '#5a564c', lip: '#e0dcc8', hi: '#f8f6ee', dark: '#34322c' }
    },
    tileAlpha: 0.52, depthTint: 'rgba(36,32,28,.16)', strataCol: '#3a3830', glow0: 'rgba(240,236,220,.10)', glow1: 'rgba(240,236,220,0)', vig: 'rgba(30,28,36,.16)',
    rockPal: { hi: '#f0ece0', mid: '#b0aa98', lo: '#5a564c', line: '#2e2c26', spot: 'rgba(90,86,78,.45)', rim: 'rgba(255,255,245,.55)' },
    tilePal: ['rgba(40,38,32,.28)', 'rgba(160,156,140,.2)', 'rgba(240,236,220,.14)', 'rgba(20,18,14,.3)'],
    sky: {
      stops: [0, '#4a72a8', 0.48, '#8aaccc', 0.8, '#e8d8b8', 1, '#f6e8c8'],
      sun: { x: 0.74, y: 0.66, r: 5.2, disc: '#fff6d8', g0: 'rgba(255,224,170,.36)', g1: 'rgba(255,210,140,0)', glow: 0.55 },
      clouds: { n: 6, y0: 0.14, y1: 0.5, s0: 0.8, s1: 0.88, top: '#f8f6f0', bot: '#d8c8b0', a0: 0.44, a1: 0.22, speed: 0.6 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), f = ss(0.08, 0.35, a) * (1 - ss(0.45, 0.7, a)), c = ss(0.48, 0.72, a) * (1 - ss(0.82, 0.96, a)), k = ss(0.8, 0.95, a); var q = Math.max(0, 1 - f - c - k); return [q, f, c, k]; }; },
    layers: function (E, H) {
      var far = peaks([[90, 1.5, 280, 280, 0.96], [300, 1.5, 280, 280, 0.96], [540, 1.5, 280, 280, 0.96], [800, 1.5, 280, 280, 0.96], [1060, 1.5, 280, 280, 0.96]], nzf(E, 90, 1, 2));
      var mid = peaks([[180, 5, 230, 230, 0.88], [520, 6, 240, 230, 0.88], [880, 5, 230, 240, 0.88], [1240, 5, 230, 230, 0.88]], nzf(E, 55, 2, 4));
      var near = peaks([[200, 4, 250, 250, 0.85], [640, 5, 260, 250, 0.85], [1080, 4, 250, 260, 0.85]], nzf(E, 40, 2, 4));
      return [
        { par: 0.02, y: 20, hmax: 10, hs: 1, fn: far, c0: '#c8c4ba', c1: '#ddd8d0', edge: 'rgba(50,50,46,.08)', haze: 'rgba(210,214,210,.06)', gk: 0.01,
          noFill: true,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var bot = (vh != null) ? vh + 8 : base + 160;
            fillFarHorizon(c, vw, base + 4, off, bot, Ev, { c0: '#8a9488', c1: '#5a6458' });
            drawAizkorriCrest(c, off + vw * 0.48, base - 4, off, Ev, 1.16, { bot: bot, apron: 'foothills' });
          } },
        { par: 0.11, y: 36, hmax: 20, hs: 1, fn: mid, c0: '#7a9a58', c1: '#4a6a3c', edge: 'rgba(40,48,36,.2)', gk: 0.03,
          decor: function (c, vw, base, off, fn, Ev) {
            var af = afOf(Ev), i, wx, tx, hy;
            /* hêtraie dense (hayedo) en masses, surtout en bas et à mi-pente */
            if (af < 0.7) {
              c.save(); c.globalAlpha = 1 - ss(0.45, 0.7, af);
              forestMass(c, 20 - off, 260 - off, base - 18, base + 24, 12, { col: '#2a4a28', col2: '#1a3220', mix: 0.06, pad: 20 });
              forestMass(c, 220 - off, 460 - off, base - 14, base + 24, 24, { col: '#244426', col2: '#16301c', mix: 0.08, pad: 18 });
              forestMass(c, 400 - off, 680 - off, base - 16, base + 24, 36, { col: '#2a4a28', col2: '#1a3220', mix: 0.05, pad: 18 });
              c.restore();
            }
            if (af > 0.18) {
              c.save(); c.globalAlpha = 0.45 + 0.55 * ss(0.18, 0.5, af);
              drawUrbiaMeadow(c, 180, base - 2, off, Ev, 200);
              drawUrbiaMeadow(c, 500, base, off, Ev, 170);
              c.restore();
            }
            if (af < 0.38) {
              c.save(); c.globalAlpha = 1;
              drawArantzazu(c, 50, layerY(base, fn, 50) + 3, off, 1.05);
              c.restore();
            }
            if (af > 0.2 && af < 0.88) {
              /* Maisons, bergeries et moutons toujours 100 % opaques
                 (plus de fondu globalAlpha qui les rendait fantomatiques). */
              c.save(); c.globalAlpha = 1;
              for (i = 0; i < 4; i++) {
                wx = 160 + i * 150;
                tx = wx - off; if (tx < -30 || tx > vw + 30) { continue; }
                hy = layerY(base, fn, wx) + 3;
                hut(c, tx, hy, 0.88, '#6a4a30');
                miniFlock(c, tx - 34, hy, 6, 40 + i, Ev);
                if (i % 2 === 0) { miniCow(c, tx + 24, hy, false); }
              }
              c.restore();
            }
          } },
        { par: 0.24, y: 50, hmax: 16, hs: 1, fn: near, c0: '#4a6a38', c1: '#2e4a28', edge: 'rgba(30,40,28,.2)', gk: 0.08,
          decor: function (c, vw, base, off, fn, Ev) {
            var af = afOf(Ev);
            if (af < 0.5) {
              c.save(); c.globalAlpha = 1 - ss(0.28, 0.5, af);
              forestMass(c, 10 - off, 200 - off, base - 12, base + 20, 9, { col: '#243c24', col2: '#162616', mix: 0.04, pad: 14 });
              forestMass(c, 300 - off, 520 - off, base - 10, base + 20, 18, { col: '#2a4a28', col2: '#1a3220', mix: 0.04, pad: 14 });
              c.restore();
            }
          } }
      ];
    },
    flora: function (E, H) {
      var cfg = { hazeCol: '#c8d4b0', rows: [
        { step: 32, seed: 25, haze: 0.1, fillTop: '#90b050', fillBot: '#5c7a40', up: function () { return 5; }, dens: function (x) { return 0.1 * (1 - ss(0.22, 0.5, H.af(x))); }, size: function () { return 8; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), forest = 1 - ss(0.32, 0.58, a), bare = ss(0.62, 0.88, a);
        var g = E.mix('#7cb046', '#c8d4a0', 1 - forest);
        return { dens: 0.9 * forest + 0.5 * (1 - forest) * (1 - bare), grass: 1.5, fern: 0.3 * forest, heather: 0.06, bush: 0.1 * forest, broom: 0.04, flower: 0.08 * (1 - bare), gcol: E.mix(g, '#3a6a28', 0.2), gcol2: E.mix(g, '#e8f4a0', 0.45), fcol: '#3f8a3a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      if (B.limestone) { B.limestone(c, xa, xb, E, H, 0); }
      var x, h, rx, r, gtop, ry;
      for (x = Math.floor(xa / 40) * 40; x < xb + 40; x += 40) {
        if (H.af(x) < 0.5) { continue; }
        h = E.hash(x, 301); if (h > 0.5) { continue; }
        rx = x + h * 26; r = 3.4 + 6 * E.hash(x, 303);
        gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)); ry = gtop - r * 0.2;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['ARANTZAZU'], 44, 14, 3.2);
      boardIf(c, E, xa, xb, 102, ['730 m'], 30, 12, 3.3, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx + 34, ['AIZKORRI'], 44, 12, 3.3, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      var i, hx, hy, G = E.G, hash = E.hash || A.hash;
      function gAt(x) { var v = G && G[Math.max(0, Math.min(E.len || 0, x | 0))]; return (v != null && isFinite(v)) ? v : sy; }
      /* lapiaz / blocs */
      for (i = 0; i < 10; i++) {
        hx = sx - 62 + hash(i, 21) * 140; hy = gAt(hx) - 0.5;
        c.fillStyle = i % 2 ? '#e8e4d8' : '#c8c4b4';
        c.beginPath(); c.ellipse(hx, hy, 4 + hash(i, 22) * 2.5, 1.8, -0.2 + hash(i, 23), 0, 7); c.fill();
      }
      /* Ermita du Santo Cristo typifiée (photo historique) : cabane de pierre,
         toit à dalles étagées, petite porte, croix, garde-corps bas. ~5 m de long. */
      (function () {
        var M = 37 / 1.75, bx = sx + 8, by = sy, i, ww = 5.2 * M, wall = 2.6 * M, step, k;
        c.fillStyle = 'rgba(20,16,10,.18)';
        c.beginPath(); c.ellipse(bx + ww * 0.45, by + 1.6, ww * 0.55, 2.2, 0, 0, 7); c.fill();
        /* murs de pierre */
        c.fillStyle = '#c8c0b0';
        c.fillRect(bx, by - wall, ww, wall);
        c.strokeStyle = '#4a443c'; c.lineWidth = 0.7; c.strokeRect(bx, by - wall, ww, wall);
        /* assise de pierre */
        for (i = 0; i < 5; i++) {
          c.fillStyle = i % 2 ? 'rgba(80,74,66,.18)' : 'rgba(255,255,245,.12)';
          c.fillRect(bx + 3 + i * (ww / 5.6), by - wall + 4, ww / 7, wall - 8);
        }
        /* toit à dalles étagées */
        for (k = 0; k < 5; k++) {
          step = 1.4 + k * 0.15;
          c.fillStyle = k % 2 ? '#9a9488' : '#b0aa9c';
          c.fillRect(bx - 3 + k * 1.2, by - wall - (k + 1) * 0.28 * M, ww + 6 - k * 2.4, 0.32 * M);
        }
        /* porte à taille humaine */
        c.fillStyle = '#3a3228';
        c.fillRect(bx + ww * 0.38, by - 2.05 * M, 0.95 * M, 2.05 * M);
        c.strokeStyle = '#2a241c'; c.lineWidth = 0.55;
        c.strokeRect(bx + ww * 0.38, by - 2.05 * M, 0.95 * M, 2.05 * M);
        /* petite croix au faîte */
        c.strokeStyle = '#d0c8b8'; c.lineWidth = 1.1; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(bx + ww * 0.5, by - wall - 1.5 * M);
        c.lineTo(bx + ww * 0.5, by - wall - 2.15 * M);
        c.moveTo(bx + ww * 0.5 - 0.35 * M, by - wall - 1.95 * M);
        c.lineTo(bx + ww * 0.5 + 0.35 * M, by - wall - 1.95 * M);
        c.stroke();
        /* garde-corps bas à droite, typifié */
        c.strokeStyle = '#4a4844'; c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(bx + ww + 4, by);
        c.lineTo(bx + ww + 4, by - 1.15 * M);
        c.lineTo(bx + ww + 22, by - 1.15 * M);
        c.lineTo(bx + ww + 22, by);
        c.moveTo(bx + ww + 4, by - 0.55 * M);
        c.lineTo(bx + ww + 22, by - 0.55 * M);
        c.stroke();
      }());
    }
  });

  /* ======================== 13. Txindoki ======================== */
  window.AlpineBuild({
    id: 'txindoki', stairs: 'stone', summitReplace: true, noStrata: true, noHorizonBar: true, horizonHaze: 'rgba(220,226,232,.1)',
    pal: {
      q: { base: '#4a4030', mid: '#2e281e', lip: '#6a8a44', hi: '#b4c86a', dark: '#1e1a14' },
      f: { base: '#5a4e3a', mid: '#3a3428', lip: '#8aaa54', hi: '#d0e080', dark: '#26221a' },
      c: { base: '#8a8474', mid: '#524e44', lip: '#c8c4b0', hi: '#f0ece0', dark: '#323028' },
      k: { base: '#9a9688', mid: '#5a564c', lip: '#e0dcc8', hi: '#f8f6ee', dark: '#34322c' }
    },
    tileAlpha: 0.52, depthTint: 'rgba(36,32,28,.15)', strataCol: '#3a3830', glow0: 'rgba(240,236,220,.10)', glow1: 'rgba(240,236,220,0)', vig: 'rgba(28,30,40,.16)',
    rockPal: { hi: '#f0ece0', mid: '#b0aa98', lo: '#5a564c', line: '#2e2c26', spot: 'rgba(90,86,78,.45)', rim: 'rgba(255,255,245,.55)' },
    tilePal: ['rgba(40,38,32,.28)', 'rgba(160,156,140,.2)', 'rgba(240,236,220,.14)', 'rgba(20,18,14,.3)'],
    sky: {
      stops: [0, '#3a62a0', 0.46, '#86accc', 0.8, '#e4d4b8', 1, '#f6e6c4'],
      sun: { x: 0.78, y: 0.64, r: 5.2, disc: '#fff6d8', g0: 'rgba(255,220,160,.36)', g1: 'rgba(255,200,130,0)', glow: 0.55 },
      clouds: { n: 6, y0: 0.14, y1: 0.5, s0: 0.82, s1: 0.9, top: '#f8f6f0', bot: '#d4c8b4', a0: 0.46, a1: 0.24, speed: 0.65 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), f = ss(0.06, 0.28, a) * (1 - ss(0.45, 0.68, a)), c = ss(0.48, 0.72, a) * (1 - ss(0.7, 0.88, a)), k = ss(0.55, 0.8, a); return [Math.max(0, 1 - f - c - k), f, c, k]; }; },
    layers: function (E, H) {
      /* ciel -> crêtes d'Aralar -> pyramide du Txindoki en parallaxe d'approche
         -> collines vertes et hameau basque opaque -> prairie / sentier. */
      var far = peaks([[80, 2, 300, 300, 0.96]], nzf(E, 100, 1, 2));
      var mid = peaks([[180, 2, 260, 260, 0.9]], nzf(E, 70, 1.2, 3));
      var near = peaks([[140, 2, 240, 240, 0.88]], nzf(E, 45, 1.2, 3));
      function hamletHillY(wx, base) {
        /* Plateau assez plat et assez haut pour que murs et chapelle
           restent entiers au-dessus de la lèvre du sentier. */
        var d = (wx - 210) / 190;
        var bump = 38 * Math.max(0, 1 - d * d);
        return base - 4 - bump;
      }
      return [
        { par: 0.02, y: 20, hmax: 10, hs: 1, fn: far, noFill: true, c0: '#9aa098', c1: '#c8cdc6', gk: 0,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var bot, af, vdrop, i, wx, tx, h, w;
            bot = (vh != null) ? vh + 8 : base + 180;
            af = afOf(Ev);
            fillFarHorizon(c, vw, base + 8, off, bot, Ev, { c0: '#7a8682', c1: '#4a5652' });
            /* crêtes d'Aralar / muraille lointaine, silhouettes fermées */
            for (i = 0; i < 4; i++) {
              wx = off + vw * (0.12 + i * 0.24);
              tx = wx - off;
              h = 20 + (i % 3) * 9;
              w = 120 + (i % 2) * 24;
              c.beginPath();
              c.moveTo(tx - w - 20, bot);
              c.quadraticCurveTo(tx - w * 0.5, base - h * 0.3, tx - w * 0.1, base - h);
              c.quadraticCurveTo(tx + w * 0.25, base - h * 0.7, tx + w * 0.65, base - h * 0.28);
              c.quadraticCurveTo(tx + w + 14, base + 6, tx + w + 26, bot);
              c.closePath();
              c.fillStyle = A.grad(c, 0, base - h, 0, bot, [0, i % 2 ? '#8a9088' : '#7a847c', 1, '#4a544c']);
              c.fill();
            }
            drawAizkorriCrest(c, off + vw * 0.36, base - 6, off, Ev, 0.90, { forest: false, apron: 'foothills', end: 'pass', hermitage: false, distant: true, bot: bot });
            drawAralarSierra(c, off + vw * 0.82, base + 2, off, Ev);
            vdrop = 16 + 32 * ss(0.15, 0.85, af);
            if (af > 0.06) { drawGoierriValley(c, vw, base + 4, off, Ev, vdrop); }
          } },
        { par: 0.10, y: 40, hmax: 12, hs: 1, fn: mid, step: 1, noFill: true, c0: '#6a8a50', c1: '#4a6840', gk: 0,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var af = afOf(Ev), txSc, txWx, txY, bot;
            bot = (vh != null) ? vh + 8 : base + 180;
            txSc = 0.52 + 0.70 * Math.max(0, Math.min(1, af / 0.72));
            txWx = off + vw * (0.72 - 0.10 * af);
            txY = base - 10 - 16 * Math.max(0, Math.min(1, af / 0.72));
            if (af > 0.88) { txY += 28 * Math.max(0, Math.min(1, (af - 0.88) / 0.12)); }
            c.save(); c.globalAlpha = 1;
            drawTxindokiPyramid(c, txWx, txY, off, Ev, txSc, { bot: bot });
            c.restore();
          } },
        { par: 0.24, y: 52, hmax: 12, hs: 1, fn: near, noFill: true, c0: '#5a7a44', c1: '#3a5a30', gk: 0,
          decor: function (c, vw, base, off, fn, Ev, vh) {
            var af = afOf(Ev), bot, x, tx, y, i, spots, wx, hy;
            bot = (vh != null) ? vh + 8 : base + 120;
            /* collines verdoyantes continues, fermées jusqu'en bas */
            c.beginPath();
            c.moveTo(-40, bot);
            for (x = -40; x <= vw + 40; x += 16) {
              wx = x + off;
              y = hamletHillY(wx, base);
              c.lineTo(x, y);
            }
            c.lineTo(vw + 40, bot);
            c.closePath();
            c.fillStyle = A.grad(c, 0, base - 16, 0, bot, [0, '#7a9a50', 0.45, '#4e6e34', 1, '#2e4a24']);
            c.fill();
            /* bosquets opaques, sans fûts noirs */
            forestMass(c, 460 - off, 780 - off, function (x) {
              return hamletHillY(x + off, base) - 8;
            }, bot, 12, { col: '#2a4a28', col2: '#1a3220', mix: 0, pad: 16, noTrunks: true });
            if (af > 0.42) { return; }
            c.save(); c.globalAlpha = 1;
            /* Chapelle entre LARRAITZ (52-94) et 401 m (142-174), lisible, sans recouvrement. */
            wx = 116;
            hy = hamletHillY(wx, base) + 3;
            tx = wx - off;
            if (tx > -50 && tx < vw + 50) {
              drawChapel(c, tx, hy, 1.02, '#a42820');
              miniFlock(c, tx + 20, hy, 5, 51, Ev);
            }
            /* Hameau ~65 %, uniquement sur le plateau (3 maisons, murs entiers). */
            spots = [[200, 1.30, 0], [226, 1.20, 1], [252, 1.32, 2]];
            for (i = 0; i < spots.length; i++) {
              wx = spots[i][0];
              tx = wx - off;
              if (tx < -40 || tx > vw + 40) { continue; }
              hy = hamletHillY(wx, base) + 3;
              drawBasqueEtxe(c, tx, hy, spots[i][1], spots[i][2]);
              if (i % 2 === 0) { miniFlock(c, tx - 22, hy, 4, 60 + i, Ev); }
            }
            c.restore();
          } }
      ];
    },
    flora: function (E, H) {
      var cfg = { hazeCol: '#c8d4b0', rows: [
        { step: 34, seed: 14, haze: 0.14, fillTop: '#9cb85a', fillBot: '#6a8444', up: function (x) { return 7 + 3 * E.nz(x / 140, 5); }, dens: function (x) { return 0.1 * (1 - ss(0.18, 0.42, H.af(x))); }, size: function () { return 9; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), open = ss(0.08, 0.35, a), bare = ss(0.48, 0.82, a);
        var g = E.mix('#7cb046', '#c8d4a0', open);
        var gk = E.mix(g, '#d0ccc0', bare);
        return { dens: 0.85 * (1 - bare) + 0.08 * bare, grass: 1.5 * (1 - bare) + 0.12 * bare, fern: 0.2 * (1 - bare), heather: 0.06 * open * (1 - bare), bush: 0.05 * (1 - open) * (1 - bare), broom: 0.05 * (1 - bare), flower: 0.06 * (1 - bare), gcol: E.mix(gk, '#3a6a28', 0.2 * (1 - bare)), gcol2: E.mix(gk, '#e8e4d4', 0.55 + 0.25 * bare), fcol: '#3f8a3a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      if (B.limestone) { B.limestone(c, xa, xb, E, H, 0); }
      var x, h, rx, r, gtop, ry;
      for (x = Math.floor(xa / 42) * 42; x < xb + 42; x += 42) {
        if (H.af(x) < 0.45) { continue; }
        h = E.hash(x, 301); if (h > 0.48) { continue; }
        rx = x + h * 24; r = 3.6 + 6.5 * E.hash(x, 303);
        gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)); ry = gtop - r * 0.2;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
    },
    lipExtra: function (c, xa, xb, E, H) {
      var x, h, ty, gy, a, sway;
      for (x = Math.floor(xa / 16) * 16; x < xb + 16; x += 16) {
        h = E.hash(x, 350); ty = E.TYPE[x | 0]; if (h > 0.6 || ty === 1 || ty === 4) { continue; }
        gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        a = H.af(x);
        if (a < 0.55) { continue; }
        /* lapiaz / fentes du karst, plus d'herbes vertes à la cime */
        c.strokeStyle = 'rgba(90, 86, 78, ' + (0.28 + 0.25 * a).toFixed(2) + ')';
        c.lineWidth = 0.6;
        c.beginPath();
        c.moveTo(x - 3, gy - 0.2);
        c.lineTo(x + 2 + h * 3, gy - 0.4);
        c.stroke();
        if (h < 0.35) {
          c.fillStyle = h < 0.18 ? '#e8e4d8' : '#c8c4b4';
          c.beginPath(); c.ellipse(x + h * 4, gy - 0.4, 3.4 + h * 3, 1.4, -0.15, 0, 7); c.fill();
        }
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['LARRAITZ'], 42, 14, 3.2);
      boardIf(c, E, xa, xb, 142, ['401 m'], 32, 12, 3.3, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx + 126, ['TXINDOKI'], 50, 12, 3.3, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      var i, hx, hy, G = E.G, hash = E.hash || A.hash, pts, a, r;
      function gAt(x) { var v = G && G[Math.max(0, Math.min(E.len || 0, x | 0))]; return (v != null && isFinite(v)) ? v : sy; }
      /* cap karstique irrégulier, qui s'abaisse de chaque côté (pointe, pas un rectangle) */
      c.beginPath();
      c.moveTo(sx - 110, gAt(sx - 110) + 10);
      c.quadraticCurveTo(sx - 80, gAt(sx - 80) + 2, sx - 40, gAt(sx - 40) - 1);
      c.quadraticCurveTo(sx + 10, gAt(sx + 10) - 3, sx + 50, gAt(sx + 50) - 1);
      c.quadraticCurveTo(sx + 100, gAt(sx + 100) + 2, sx + 150, gAt(sx + 150) + 12);
      c.lineTo(sx + 130, gAt(sx + 130) + 16);
      c.quadraticCurveTo(sx + 40, sy + 14, sx - 20, sy + 13);
      c.quadraticCurveTo(sx - 80, gAt(sx - 80) + 14, sx - 110, gAt(sx - 110) + 10);
      c.closePath();
      c.fillStyle = A.grad(c, 0, sy - 8, 0, sy + 16, [0, '#e8e4d8', 0.45, '#c8c4b4', 1, '#9a9688']);
      c.fill();
      /* dalles et blocs irréguliers, mêlés d'herbes, sans arête droite */
      for (i = 0; i < 18; i++) {
        hx = sx - 70 + hash(i, 21) * 150;
        hy = gAt(hx) - 0.2;
        r = 4.2 + hash(i, 23) * 5.5;
        a = -0.3 + hash(i, 24) * 0.6;
        c.fillStyle = i % 3 ? '#e4e0d4' : '#b8b4a6';
        c.beginPath();
        c.moveTo(hx - r, hy + 1);
        c.lineTo(hx - r * 0.4 + a * 3, hy - r * 0.55);
        c.lineTo(hx + r * 0.7, hy - r * 0.35);
        c.lineTo(hx + r * 0.9, hy + 1.2);
        c.closePath();
        c.fill();
      }
      /* touffes d'herbe dans les joints du karst */
      for (i = 0; i < 10; i++) {
        hx = sx - 50 + hash(i, 41) * 120;
        hy = gAt(hx);
        c.fillStyle = 'rgba(110, 130, 70, .55)';
        c.beginPath(); c.ellipse(hx, hy - 0.4, 2.2, 0.8, 0, 0, 7); c.fill();
      }
      /* Croix de fer (~2,5 m) et buzon (~1,15 m), à l'échelle du randonneur. Pas de chapelle à la cime. */
      var M = 37 / 1.75, cx = sx - 18, cy = sy, bx, by;
      c.fillStyle = 'rgba(20,18,14,.28)'; c.beginPath(); c.ellipse(cx, cy + 1.6, 5, 1.6, 0, 0, 7); c.fill();
      c.fillStyle = '#3a3a38';
      c.fillRect(cx - 1.1, cy - 2.5 * M, 2.2, 2.5 * M);
      c.fillRect(cx - 7.2, cy - 1.95 * M, 14.4, 2.2);
      c.strokeStyle = '#1a1a18'; c.lineWidth = 0.55; c.strokeRect(cx - 1.1, cy - 2.5 * M, 2.2, 2.5 * M);
      bx = sx + 16; by = sy;
      c.fillStyle = A.grad(c, bx, 0, bx + 10, 0, [0, '#5a7a4a', 1, '#2a3e24']);
      c.fillRect(bx, by - 0.95 * M, 10.5, 0.95 * M);
      c.strokeStyle = '#1e2418'; c.lineWidth = 0.55; c.strokeRect(bx, by - 0.95 * M, 10.5, 0.95 * M);
      c.fillStyle = '#6a3a28';
      c.beginPath(); c.moveTo(bx - 1.4, by - 0.95 * M); c.lineTo(bx + 5.2, by - 1.4 * M); c.lineTo(bx + 11.8, by - 0.95 * M); c.closePath(); c.fill();
    }
  });
})();
