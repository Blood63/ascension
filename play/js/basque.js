/* v0.16.2 — thèmes Pays basque (Orhy : lapiaz d'Anie clippé, nuées adoucies) : Ursuya (océan, etxe, fougères, chênes, La Rhune lointaine)
   et Atxuria (bande calcaire, grotte, La Rhune voisine). Sommets peints, plus de mur de carte.
   Construit avec AlpineBuild (même moteur de décor que les niveaux 3-6). */
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
  function outline(c, w, col) { c.lineWidth = w || 0.7; c.strokeStyle = col || '#2a1a28'; c.stroke(); }

  var FINDS = {
    borne: function (c) {
      c.fillStyle = A.grad(c, -4, 0, 4, 0, [0, '#c8c0b0', 1, '#7a7468']);
      c.beginPath(); c.moveTo(-3.2, 6); c.lineTo(-2.8, -5.4); c.lineTo(0, -6.6); c.lineTo(2.8, -5.4); c.lineTo(3.2, 6); c.closePath(); c.fill(); outline(c, 0.7, '#2c2820');
      c.fillStyle = '#3a342c'; c.font = '3.2px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('IGN', 0, -1.6); c.fillText('678', 0, 2.2);
    },
    stele: function (c) {
      c.fillStyle = A.grad(c, 0, -6, 0, 6, [0, '#9aa3a8', 1, '#5a6268']);
      c.fillRect(-3.6, -6.2, 7.2, 12.4); outline(c, 0.6, '#2a3034');
      c.fillStyle = '#d8dde0'; c.fillRect(-2.6, -5, 5.2, 2.2);
      c.fillStyle = '#3a4044'; c.fillRect(-2.2, -1.6, 4.4, 0.5); c.fillRect(-2.2, 0.2, 3.6, 0.5); c.fillRect(-2.2, 2, 4, 0.5);
    },
    source: function (c, f, E) {
      var t = E.time, drip = (t * 2 + (f && f.ph || 0)) % 1;
      c.fillStyle = '#6a7a6a'; c.fillRect(-5.2, -1.2, 10.4, 6.6); outline(c, 0.6, '#2a3028');
      c.strokeStyle = '#3a4a38'; c.lineWidth = 0.5; c.strokeRect(-5.2, -1.2, 10.4, 6.6);
      c.fillStyle = A.grad(c, 0, 0, 0, 5, [0, '#7ec8e0', 1, '#2a6a88']); c.fillRect(-3.6, 0.6, 7.2, 3.6);
      c.fillStyle = 'rgba(255,255,255,' + (0.45 + 0.4 * Math.sin(t * 6)).toFixed(2) + ')';
      c.beginPath(); c.arc(-1 + drip * 2, 1.2 + drip * 2.4, 0.7, 0, 7); c.fill();
      c.fillStyle = '#8a9a7a'; c.fillRect(-6, -3.2, 12, 2.2);
    },
    calcaire: function (c) {
      c.beginPath(); c.moveTo(-6.2, 2.4); c.lineTo(-4.2, -3.6); c.lineTo(-0.4, -5.4); c.lineTo(3.6, -3.2); c.lineTo(6.2, 1.2); c.lineTo(3, 3.8); c.lineTo(-3.4, 3.6); c.closePath();
      c.fillStyle = A.grad(c, 0, -5, 0, 4, [0, '#f2f0e6', 0.55, '#c8c4b4', 1, '#8a8678']); c.fill(); outline(c, 0.7, '#3a3830');
      c.strokeStyle = 'rgba(90,86,78,.55)'; c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(-3, -1); c.lineTo(1.4, 2.2); c.moveTo(-1.2, -3.4); c.lineTo(3.2, 0.6); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(-3.6, -2.8); c.lineTo(-0.2, -5); c.lineTo(0.4, -3.8); c.closePath(); c.fill();
    },
    plaque: function (c) {
      c.fillStyle = A.grad(c, 0, -4, 0, 4, [0, '#d8d4c8', 1, '#8a8678']);
      c.beginPath(); c.moveTo(-5.4, -3.6); c.lineTo(5.4, -3.6); c.lineTo(6, 3.8); c.lineTo(-6, 3.8); c.closePath(); c.fill(); outline(c, 0.6, '#3a3830');
      c.fillStyle = '#3a342c'; c.font = '2.6px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('PEÑA', 0, -1.2); c.fillText('PLATA', 0, 1.6);
    },
    chauve: function (c, f, E) {
      var flap = Math.sin((E.time || 0) * 10 + (f && f.ph || 0)) * 3.2;
      c.fillStyle = '#2a2430';
      c.beginPath(); c.moveTo(-7, flap); c.quadraticCurveTo(-1, -1.4, 0, 0); c.quadraticCurveTo(1, -1.4, 7, -flap); c.quadraticCurveTo(1, 2.4, 0, 1.4); c.quadraticCurveTo(-1, 2.4, -7, flap); c.closePath(); c.fill();
      c.fillStyle = '#1a1420'; c.beginPath(); c.arc(0, 0.2, 1.5, 0, 7); c.fill();
      c.fillStyle = '#c8b8a0'; c.beginPath(); c.arc(-0.5, -0.2, 0.35, 0, 7); c.arc(0.5, -0.2, 0.35, 0, 7); c.fill();
    },
    borne237: function (c) {
      /* borne frontière 237, juste au-dessus du parking du Port de Larrau */
      c.fillStyle = A.grad(c, -3, 0, 3, 0, [0, '#e8e4d4', 1, '#9a9484']);
      c.beginPath(); c.moveTo(-3.0, 6); c.lineTo(-2.6, -5.0); c.lineTo(0, -6.4); c.lineTo(2.6, -5.0); c.lineTo(3.0, 6); c.closePath(); c.fill(); outline(c, 0.7, '#2c2820');
      c.fillStyle = '#3a342c'; c.font = '3.0px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('237', 0, 0.2);
    },
    cable: function (c) {
      /* Court câble d'assurance (Altituderando) : deux potelets dans le rocher, câble un peu tendu. */
      c.fillStyle = '#8a8478';
      c.beginPath(); c.moveTo(-7.2, 6.2); c.lineTo(-5.0, 6.2); c.lineTo(-5.4, 4.2); c.lineTo(-6.8, 4.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(5.0, 6.2); c.lineTo(7.2, 6.2); c.lineTo(6.8, 4.2); c.lineTo(5.4, 4.2); c.closePath(); c.fill();
      c.fillStyle = A.grad(c, -6.4, 0, -5.4, 0, [0, '#c8c4bc', 1, '#6a6860']);
      c.fillRect(-6.5, -5.0, 1.3, 9.4); outline(c, 0.45, '#2a2820');
      c.fillStyle = A.grad(c, 5.4, 0, 6.4, 0, [0, '#c8c4bc', 1, '#6a6860']);
      c.fillRect(5.3, -5.4, 1.3, 9.8); outline(c, 0.45, '#2a2820');
      c.fillStyle = '#4a4844';
      c.beginPath(); c.arc(-5.85, -5.15, 0.7, 0, 7); c.fill();
      c.beginPath(); c.arc(5.95, -5.55, 0.7, 0, 7); c.fill();
      c.strokeStyle = '#2e2e34'; c.lineWidth = 1.05; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-5.85, -5.15); c.quadraticCurveTo(0.1, -3.6, 5.95, -5.55); c.stroke();
      c.strokeStyle = '#c8c8d0'; c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(-5.85, -5.35); c.quadraticCurveTo(0.1, -3.8, 5.95, -5.75); c.stroke();
    },
    buzon: function (c) {
      /* boîte-maison typifiée, oiseau sur le toit (d'après les topos : « Oriko Txoria ») */
      c.fillStyle = A.grad(c, 0, -2, 0, 5, [0, '#d0ccc0', 1, '#8a8678']);
      c.fillRect(-3.4, -1.2, 6.8, 6.8); outline(c, 0.6, '#2a2820');
      c.fillStyle = '#6a3a32';
      c.beginPath(); c.moveTo(-4.2, -1.2); c.lineTo(0, -5.4); c.lineTo(4.2, -1.2); c.closePath(); c.fill(); outline(c, 0.55, '#2a1814');
      c.fillStyle = '#2a2820'; c.fillRect(-1.1, 0.8, 2.2, 2.0);
      c.fillStyle = '#3a342c';
      c.beginPath(); c.moveTo(-0.2, -5.8); c.quadraticCurveTo(-2.4, -7.6, -1.4, -8.4); c.quadraticCurveTo(0.2, -7.4, 1.8, -8.2); c.quadraticCurveTo(2.2, -7.2, 0.4, -5.8); c.closePath(); c.fill();
    }
  };

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

  function caveMouth(c, E, xa, xb, x0) {
    if (xb < x0 - 16 || xa > x0 + 90) { return; }
    var g = E.G[Math.max(0, Math.min(E.len, (x0 + 28) | 0))]; if (!isFinite(g)) { return; }
    /* masse calcaire, pas un tertre vert */
    c.fillStyle = A.grad(c, x0, g - 70, x0 + 70, g, [0, '#e8e4d4', 0.45, '#c4c0b0', 1, '#8a8678']);
    c.beginPath();
    c.moveTo(x0 - 14, g + 4);
    c.lineTo(x0 - 4, g - 36);
    c.quadraticCurveTo(x0 + 18, g - 78, x0 + 48, g - 72);
    c.quadraticCurveTo(x0 + 78, g - 58, x0 + 88, g - 18);
    c.lineTo(x0 + 96, g + 4);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(60,56,48,.45)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(x0 + 6, g - 28); c.lineTo(x0 + 22, g - 62); c.moveTo(x0 + 40, g - 70); c.lineTo(x0 + 58, g - 30); c.stroke();
    c.fillStyle = '#1a1410';
    c.beginPath(); c.moveTo(x0 + 18, g + 2); c.quadraticCurveTo(x0 + 20, g - 44, x0 + 44, g - 52); c.quadraticCurveTo(x0 + 68, g - 42, x0 + 70, g + 2); c.closePath(); c.fill();
    c.fillStyle = 'rgba(6,4,6,.92)';
    c.beginPath(); c.moveTo(x0 + 26, g + 2); c.quadraticCurveTo(x0 + 30, g - 34, x0 + 44, g - 40); c.quadraticCurveTo(x0 + 58, g - 32, x0 + 62, g + 2); c.closePath(); c.fill();
    c.fillStyle = '#d0ccc0'; c.fillRect(x0 + 16, g - 8, 56, 3.2);
    if (S && S.fern) { S.fern(c, x0 + 10, g, 11, { t: E.time, seed: 3 }); S.fern(c, x0 + 78, g, 13, { t: E.time, seed: 8 }); }
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

  function drawEtxe(c, x, base, s) {
    s = s || 1;
    auditFoot(c, 'etxe', x, base);
    c.save(); c.translate(x, base); c.scale(s, s);
    c.fillStyle = '#f4f0e6'; c.fillRect(-12, -16, 26, 16);
    c.strokeStyle = '#3a2a20'; c.lineWidth = 0.6; c.strokeRect(-12, -16, 26, 16);
    c.fillStyle = '#c43028';
    c.beginPath(); c.moveTo(-15, -15.2); c.lineTo(1, -26); c.lineTo(17, -15.2); c.closePath(); c.fill();
    c.strokeStyle = '#6a1814'; c.lineWidth = 0.55; c.stroke();
    c.fillStyle = '#d8d0c4'; c.fillRect(8, -24.5, 3.2, 6.5);
    c.fillStyle = '#a02820'; c.fillRect(7.4, -26, 4.4, 1.8);
    c.strokeStyle = 'rgba(80,40,30,.35)'; c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(-12, -8); c.lineTo(14, -8); c.moveTo(1, -16); c.lineTo(1, 0); c.stroke();
    function win(wx, wy) {
      c.fillStyle = '#6a8aaa'; c.fillRect(wx, wy, 3.4, 3.6);
      c.fillStyle = '#c43028'; c.fillRect(wx - 1.3, wy, 1.2, 3.6); c.fillRect(wx + 3.4, wy, 1.2, 3.6);
      c.strokeStyle = '#3a2018'; c.lineWidth = 0.35; c.strokeRect(wx - 1.3, wy, 5.9, 3.6);
    }
    win(-8.2, -12.4); win(5.2, -12.4);
    c.fillStyle = '#4a3020'; c.fillRect(-1.4, -7.2, 4.2, 7.2);
    c.fillStyle = '#c8a060'; c.fillRect(-0.4, -4.2, 0.7, 0.7);
    c.restore();
  }

  function drawLaRhune(c, x, base, sc, opt) {
    /* Massif trapu, aplati, à trois dômes : pas un cône, pas une dalle pâle au sommet.
       Réfs : La Rhune depuis Saint-Jean-de-Luz ; crête vue du col (Commons). */
    opt = opt || {}; sc = sc || 1;
    c.save(); c.translate(x, base); c.scale(sc, sc);
    var col0 = opt.c0 || '#5a6e52', col1 = opt.c1 || '#8fa07a', edge = opt.edge || 'rgba(40,48,36,.28)';
    /* base large plantée dans la colline (évite une dalle claire qui flotte) */
    c.beginPath();
    c.moveTo(-108, 22);
    c.quadraticCurveTo(-96, 8, -82, 2);
    c.quadraticCurveTo(-70, -6, -58, -10);          /* épaule ouest */
    c.quadraticCurveTo(-46, -16, -28, -18);
    c.quadraticCurveTo(-18, -24, -8, -28);          /* dôme ouest */
    c.quadraticCurveTo(2, -33, 10, -32);            /* légèrement en selle */
    c.quadraticCurveTo(18, -36, 28, -35);           /* dôme principal, arrondi */
    c.quadraticCurveTo(38, -30, 48, -22);
    c.quadraticCurveTo(62, -16, 78, -6);            /* épaule est */
    c.quadraticCurveTo(94, 4, 108, 22);
    c.lineTo(-108, 22); c.closePath();
    c.fillStyle = A.grad(c, 20, -36, 20, 22, [0, col1, 0.4, '#6e8460', 1, col0]); c.fill();
    if (edge) { c.strokeStyle = edge; c.lineWidth = 0.7; c.stroke(); }
    /* ubac plus foncé, pas une plaque claire */
    c.fillStyle = 'rgba(50,70,40,.28)';
    c.beginPath(); c.moveTo(-70, 4); c.quadraticCurveTo(-20, -18, 12, -30); c.lineTo(-10, 6); c.closePath(); c.fill();
    /* antenne rayée, petite */
    var mx = 26, my = -35, k;
    for (k = 0; k < 5; k++) {
      c.fillStyle = (k % 2) ? '#e0e4dc' : '#b42822';
      c.fillRect(mx - 0.5, my - 2.6 - k * 2.3, 1.0, 2.3);
    }
    c.fillStyle = '#d8dcd4'; c.fillRect(mx - 1.0, my - 15.2, 2.0, 1.1);
    /* bâtiments minuscules, toits rouges, pas une dalle blanche */
    c.fillStyle = '#d4cfc4'; c.fillRect(30, -33.4, 4.2, 2.2);
    c.fillStyle = '#a42820'; c.fillRect(29.6, -34.3, 5.0, 1.0);
    c.fillStyle = '#d4cfc4'; c.fillRect(35, -32.2, 3.0, 1.6);
    c.fillStyle = '#a42820'; c.fillRect(34.7, -33.0, 3.6, 0.85);
    if (opt.train) {
      /* Crémaillère typifiée, posée sur le flanc (train de la Rhune, 1924). Dessin optionnel. */
      var rails = [[-70, 6, -40, -8], [-38, -6, -8, -20], [-6, -18, 16, -28]], ri, x0, y0, x1, y1;
      c.strokeStyle = 'rgba(50,46,40,.7)'; c.lineWidth = 1.15; c.lineCap = 'round';
      for (ri = 0; ri < rails.length; ri++) {
        x0 = rails[ri][0]; y0 = rails[ri][1]; x1 = rails[ri][2]; y1 = rails[ri][3];
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        c.strokeStyle = 'rgba(80,74,64,.45)'; c.lineWidth = 0.45;
        c.beginPath(); c.moveTo(x0, y0 + 1.1); c.lineTo(x1, y1 + 1.1); c.stroke();
        c.strokeStyle = 'rgba(50,46,40,.7)'; c.lineWidth = 1.15;
      }
      /* petite rame bois, motrice à l'arrière (pousse en montée) */
      var tr = opt.trainPos || 0.55, ax = -70 + 86 * tr, ay = 6 - 34 * tr;
      c.save(); c.translate(ax, ay); c.rotate(-0.42);
      c.fillStyle = '#3a6a3a'; c.fillRect(-7.2, -3.4, 6.4, 3.2);
      c.fillStyle = '#8a2a22'; c.fillRect(-7.2, -4.0, 6.4, 0.7);
      c.fillStyle = '#c8b48a'; c.fillRect(-0.6, -3.6, 5.6, 3.4);
      c.fillStyle = '#8a2a22'; c.fillRect(-0.6, -4.2, 5.6, 0.7);
      c.fillStyle = '#2a2a28'; c.fillRect(5.0, -3.8, 2.2, 3.6);
      c.restore();
      /* bosquets typiques du flanc, seulement avec la crémaillère (niveau 10) */
      var bi, bx, by, br;
      for (bi = 0; bi < 7; bi++) {
        bx = -88 + bi * 18 + (bi % 3) * 3;
        by = 10 - bi * 2.4;
        if (bx > 8) { continue; }
        br = 3.4 + (bi % 3);
        c.fillStyle = bi % 2 ? 'rgba(40,70,36,.55)' : 'rgba(32,58,30,.5)';
        c.beginPath(); c.ellipse(bx, by, br, br * 0.7, 0, 0, 7); c.fill();
      }
    }
    c.restore();
  }

  function drawFernFrond(c, x, base, s, t, seed) {
    /* Fougère aigle : touffe basse, frondes arquées à folioles — pas un sapin. */
    var sway = Math.sin((t || 0) * 1.6 + (seed || 0)) * 0.1;
    c.save(); c.translate(x, base);
    var n = 3, f, i;
    for (f = 0; f < n; f++) {
      var ang = -0.95 + f * 0.95 + sway + ((seed || 0) % 5) * 0.04;
      var len = s * (0.9 + (f % 2) * 0.18);
      c.save(); c.rotate(ang);
      c.strokeStyle = '#2a5a28'; c.lineWidth = Math.max(0.45, s * 0.06); c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.12, -len * 0.5, 0, -len); c.stroke();
      var leaflets = Math.max(4, Math.round(s * 0.5));
      for (i = 1; i <= leaflets; i++) {
        var u = i / (leaflets + 0.6), py = -len * u, w = Math.sin(u * 3.05) * s * 0.4;
        c.strokeStyle = i % 2 ? '#4a8a3c' : '#347034'; c.lineWidth = 0.45;
        c.beginPath(); c.moveTo(0.1, py); c.lineTo(w, py - 0.06 * s); c.stroke();
        c.beginPath(); c.moveTo(-0.1, py); c.lineTo(-w, py - 0.05 * s); c.stroke();
      }
      c.restore();
    }
    c.restore();
  }

  function limestoneBand(c, xa, xb, E, H, yOff) {
    /* Affleurements de calcaire POSÉS sur le sentier — plus de cartes pâles en l'air. yOff est ignoré. */
    for (var x = Math.floor(xa / 22) * 22; x < xb + 22; x += 22) {
      var a = H.af(x), h = E.hash(x, 410);
      if (a < 0.42 || a > 0.92 || h > 0.68) { continue; }
      var gx = x + E.hash(x, 411) * 10, gi = Math.max(0, Math.min(E.len, gx | 0));
      var gy = E.G[gi]; if (!isFinite(gy) || gy < -1e5) { continue; }
      var w = 8 + 7 * E.hash(x, 412), hh = 4.5 + 5.5 * E.hash(x, 413);
      var yb = gy + 1.1;
      c.fillStyle = E.hash(x, 414) > 0.5 ? '#d8d4c6' : '#c4c0b2';
      c.beginPath();
      c.moveTo(gx, yb);
      c.lineTo(gx + w * 0.18, yb - hh * 0.55);
      c.lineTo(gx + w * 0.38, yb - hh);
      c.lineTo(gx + w * 0.72, yb - hh * 0.72);
      c.lineTo(gx + w, yb - hh * 0.18);
      c.lineTo(gx + w * 0.88, yb);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(70,66,58,.35)'; c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(gx + w * 0.3, yb - hh * 0.35); c.lineTo(gx + w * 0.55, yb - hh * 0.15); c.stroke();
    }
  }


  /* Mer atlantique vue depuis l'intérieur des terres : bande d'horizon presque plate,
     dégradé doux ciel→eau, scintillement léger. Pas de silhouette « colline d'eau »,
     pas de bande nette, pas de houle animée qui fait bouger l'horizon. */
  function drawAtlanticSea(c, vw, vh, hy, E, opt) {
    opt = opt || {};
    var band = opt.band == null ? 62 : opt.band;
    var hor = hy + (opt.y == null ? -30 : opt.y);
    var sunX = opt.sunX == null ? vw * 0.8 : opt.sunX;
    var t = (E && E.time) || 0;
    var fadeH = 52;
    c.save();
    var g = c.createLinearGradient(0, hor - fadeH, 0, hor + band);
    g.addColorStop(0, 'rgba(198, 216, 230, 0)');
    g.addColorStop(0.18, opt.hazeHi || 'rgba(210, 224, 234, 0.10)');
    g.addColorStop(0.34, opt.haze || 'rgba(186, 210, 226, 0.28)');
    g.addColorStop(0.48, opt.mid || 'rgba(86, 140, 186, 0.58)');
    g.addColorStop(0.60, opt.mid || 'rgba(42, 104, 162, 0.88)');
    g.addColorStop(0.76, opt.deep || 'rgba(22, 72, 128, 0.96)');
    g.addColorStop(0.90, opt.deep || 'rgba(22, 72, 128, 0.90)');
    g.addColorStop(1, opt.fade || 'rgba(36, 90, 140, 0.42)');
    c.fillStyle = g;
    c.fillRect(0, hor - fadeH, vw, band + fadeH);
    /* brume douce étalée, sans cran de luminance ni trait d'horizon net */
    var x, n, off = (E && E.cam && E.cam.x) ? E.cam.x * 0.004 : 0, i, yy;
    c.globalAlpha = 0.18;
    for (i = 0; i < 7; i++) {
      yy = hor - 28 + i * 7.5;
      c.beginPath();
      for (x = -6; x <= vw + 6; x += 8) {
        n = (E && E.nz) ? E.nz((x + off) / 90 + i * 0.7, 19 + i) : 0;
        var y = yy + n * 3.2 + ((i % 2) ? 0.8 : -0.6);
        if (x <= -6) { c.moveTo(x, y); } else { c.lineTo(x, y); }
      }
      c.strokeStyle = 'rgba(230, 236, 240, 0.55)';
      c.lineWidth = 6 - i * 0.45;
      c.stroke();
    }
    c.globalAlpha = 1;
    /* scintillement doux, plus présent vers le soleil, sans bande dure */
    var i, sx, sy, a, gl;
    c.globalCompositeOperation = 'lighter';
    for (i = 0; i < 18; i++) {
      var seed = (E && E.hash) ? E.hash(i, 71) : (i * 0.17 % 1);
      sx = ((seed * vw * 1.4 - off * 8) % vw + vw) % vw;
      sy = hor + 3 + ((E && E.hash) ? E.hash(i, 72) : seed) * (band * 0.45);
      var sunD = Math.abs(sx - sunX) / Math.max(40, vw * 0.45);
      a = (0.08 + 0.1 * Math.sin(t * 1.3 + i * 1.7)) * (1 - Math.min(1, sunD));
      if (a < 0.02) { continue; }
      gl = c.createRadialGradient(sx, sy, 0, sx, sy, 6 + (1 - sunD) * 7);
      gl.addColorStop(0, 'rgba(255, 252, 236,' + (a * 0.85).toFixed(3) + ')');
      gl.addColorStop(1, 'rgba(255, 252, 236, 0)');
      c.fillStyle = gl;
      c.beginPath(); c.ellipse(sx, sy, 5 + (1 - sunD) * 6, 1.1, 0, 0, 7); c.fill();
    }
    c.restore();
  }

  /* ---------- Ursuya : dôme herbeux isolé, crêtes larges, fougères ---------- */
  window.AlpineBuild({
    id: 'ursuya', stairs: 'stone', summitReplace: true, noStrata: true, horizonHaze: 'rgba(255,232,190,.35)',
    pal: {
      q: { base: '#6a5a38', mid: '#3f3324', lip: '#8fbc4a', hi: '#d8f08c', dark: '#2a2216' },
      f: { base: '#705e3a', mid: '#433628', lip: '#a3c454', hi: '#e4f49a', dark: '#2c261c' },
      c: { base: '#7a6e54', mid: '#4a4234', lip: '#b4c46a', hi: '#e8eeb0', dark: '#2e2a22' },
      k: { base: '#8a8070', mid: '#524a40', lip: '#c0c080', hi: '#f0f0c0', dark: '#322e28' }
    },
    tileAlpha: 0.42, depthTint: 'rgba(40,32,18,.12)', strataCol: '#3a3224', glow0: 'rgba(255,230,170,.18)', glow1: 'rgba(255,210,140,0)', vig: 'rgba(30,36,40,.16)',
    rockPal: { hi: '#d8d0bc', mid: '#8a8270', lo: '#4a4438', line: '#2a261e', spot: 'rgba(110,100,80,.45)', rim: 'rgba(255,244,214,.5)' },
    tilePal: ['rgba(50,44,28,.22)', 'rgba(140,150,70,.18)', 'rgba(230,230,190,.12)', 'rgba(24,20,12,.28)'],
    sky: {
      stops: [0, '#3a6aaa', 0.42, '#7eb0d8', 0.78, '#f0d8a8', 1, '#ffe8c0'],
      sun: { x: 0.82, y: 0.7, r: 6.2, disc: '#fff8d8', g0: 'rgba(255,220,150,.48)', g1: 'rgba(255,200,120,0)', glow: 0.75 },
      clouds: { n: 7, y0: 0.12, y1: 0.48, s0: 0.85, s1: 0.9, top: '#fffaf2', bot: '#e8c8a0', a0: 0.5, a1: 0.28, speed: 0.7 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), f = ss(0.08, 0.28, a) * (1 - ss(0.78, 0.95, a)), k = ss(0.82, 0.96, a); return [Math.max(0, 1 - f - k), f, 0, k]; }; },
    drawSea: function (c, vw, vh, hy, gain, E) {
      var sunX = 0.82 * vw - E.cam.x * 0.004;
      drawAtlanticSea(c, vw, vh, hy, E, {
        band: 58, y: -34, sunX: sunX,
        hazeHi: 'rgba(186, 214, 230, 0.18)',
        haze: 'rgba(198, 222, 232, 0.42)',
        mid: 'rgba(36, 102, 164, 0.97)',
        deep: 'rgba(16, 64, 122, 0.96)',
        fade: 'rgba(22, 72, 128, 0.40)',
        horizon: 'rgba(236, 246, 252, 0.40)', horizonW: 2.0
      });
    },
    layers: function (E, H) {
      var far = peaks([[80, 22, 90, 100, 1.85], [220, 32, 110, 120, 1.8], [400, 26, 100, 100, 1.85], [580, 36, 100, 110, 1.75], [780, 24, 110, 100, 1.85], [1000, 30, 100, 100, 1.8]], nzf(E, 70, 6, 8));
      var mid = peaks([[120, 34, 160, 170, 1.85], [380, 44, 180, 160, 1.8], [680, 38, 160, 180, 1.85], [980, 42, 170, 160, 1.8], [1280, 36, 160, 170, 1.85]], nzf(E, 55, 5, 12));
      var near = peaks([[80, 22, 130, 140, 1.9], [300, 26, 150, 130, 1.85], [560, 20, 140, 150, 1.9], [840, 24, 140, 140, 1.85], [1120, 22, 140, 140, 1.9]], nzf(E, 40, 4, 10));
      return [
        { par: 0.02, y: 20, hmax: 62, fn: far, c0: '#8aa07a', c1: '#c0ccb0', edge: 'rgba(255,240,200,.4)', haze: 'rgba(255,230,190,.28)', gk: 0.02,
          decor: function (c, vw, base, off, fn, Ev) {
            /* La Rhune ancrée dans le monde (plus collée à 82 % de l'écran). */
            var wx = 145, tx = wx - off, hy = base - fn(wx) - 2;
            if (tx > -140 && tx < vw + 140) {
              drawLaRhune(c, tx, hy + 10, 0.42, { c0: '#5a6a60', c1: '#8a9a80', edge: 'rgba(40,48,36,.25)' });
            }
          } },
        { par: 0.14, y: 32, hmax: 62, fn: mid, c0: '#7aa050', c1: '#4e7040', edge: 'rgba(255,244,180,.5)', gk: 0.06,
          trees: { step: 22, seed: 41, dens: 0.42, maxH: 40, size: 16, haze: 0.18, hazeCol: '#c8d4b0', kind: function (x, hv) { return hv < 0.5 ? 'oak' : 'beech'; } },
          decor: function (c, vw, base, off, fn, Ev) {
            var spots = [160, 340, 520, 780, 1040], i, wx, tx, hy, sc;
            for (i = 0; i < spots.length; i++) {
              wx = spots[i] + Ev.hash(spots[i], 50) * 40; tx = wx - off; hy = base - fn(wx) + 2; sc = 0.55 + Ev.hash(wx, 51) * 0.25;
              if (tx > -30 && tx < vw + 30) { drawEtxe(c, tx, hy, sc); }
            }
          } },
        { par: 0.26, y: 46, hmax: 40, fn: near, c0: '#6a9844', c1: '#3e6834', edge: 'rgba(255,244,180,.4)', gk: 0.1,
          trees: { step: 16, seed: 52, dens: 0.28, maxH: 28, size: 14, haze: 0.06, hazeCol: '#c8d4b0', kind: function (x, hv) { return hv < 0.55 ? 'oak' : 'beech'; } } }
      ];
    },
    flora: function (E, H) {
      var cfg = { hazeCol: '#c8d4b0', rows: [
        { step: 26, seed: 14, haze: 0.2, fillTop: '#9cb85a', fillBot: '#6a8444', up: function (x) { return 14 + 5 * E.nz(x / 140, 5); }, dens: function (x) { return 0.48 * (1 - ss(0.38, 0.78, H.af(x))); }, size: function () { return 18; }, kind: function (x) { return E.hash(x, 44) > 0.45 ? 'oak' : 'beech'; } },
        { step: 22, seed: 25, haze: 0.08, fillTop: '#90b050', fillBot: '#5c7a40', up: function (x) { return 7 + 3 * E.nz(x / 90, 6); }, dens: function (x) { return 0.22 * (1 - ss(0.5, 0.85, H.af(x))); }, size: function () { return 13; }, kind: function (x) { return E.hash(x, 45) > 0.6 ? 'oak' : 'beech'; } },
        { step: 16, seed: 36, haze: 0, fillTop: '#82a448', fillBot: '#546e3a', up: function () { return 3; }, dens: function (x) { return 0.18 * (1 - ss(0.7, 0.95, H.af(x))); }, size: function () { return 8; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), open = ss(0.2, 0.45, a);
        var g = E.mix('#7cb046', '#b4c85a', open);
        return { dens: 0.95 - 0.2 * open, grass: 1.8, fern: 0.88 * (1 - ss(0.82, 0.98, a)), heather: 0, bush: 0.08 * (1 - open), broom: 0.12 * open, flower: 0.12, gcol: E.mix(g, '#3a6a28', 0.2), gcol2: E.mix(g, '#e8f4a0', 0.5), fcol: '#3f8a3a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      /* dalles de gneiss peu saillantes sur le dôme */
      for (var x = Math.floor(xa / 52) * 52; x < xb + 52; x += 52) {
        var h = E.hash(x, 301); if (h > 0.45 + 0.4 * H.af(x)) { continue; }
        var rx = x + h * 40, r = 3.2 + 5 * E.hash(x, 303);
        var gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)), ry = gtop - r * 0.2;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
    },
    lipExtra: function (c, xa, xb, E, H) {
      for (var x = Math.floor(xa / 28) * 28; x < xb + 28; x += 28) {
        var h = E.hash(x, 330), ty = E.TYPE[x | 0]; if (h > 0.38 || ty === 1 || ty === 4) { continue; }
        var gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        if (ss(0.85, 0.98, H.af(x)) > 0.85) { continue; }
        drawFernFrond(c, x + h * 10, gy, 11 + 5 * E.hash(x, 331), E.time, x);
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['CELHAY', 'HASPARREN'], 48, 18, 3.2);
      boardIf(c, E, xa, xb, 106, ['678 m'], 26, 11, 3.4, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx - 40, ['URTSUA'], 40, 12, 3.4, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      /* Dôme herbeux : cairn, borne IGN en granit, banc. Le randonneur se tient en sx. */
      var i, stones, s;
      c.fillStyle = '#5a8a3c';
      c.beginPath(); c.ellipse(sx, sy + 2.2, 58, 8, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(90, 130, 50, .45)';
      c.beginPath(); c.ellipse(sx - 6, sy + 1.2, 36, 5.5, 0, 0, 7); c.fill();
      /* cairn à gauche */
      stones = [[sx - 24, sy - 3, 7, 4, '#8a8274'], [sx - 29, sy - 7.5, 5.5, 3.2, '#9a9284'], [sx - 20, sy - 7.2, 5, 3, '#7a7468'], [sx - 24.5, sy - 11.6, 4.4, 2.8, '#b0aa9a'], [sx - 26, sy - 15.2, 3.2, 2.2, '#8e867a']];
      for (i = 0; i < stones.length; i++) {
        s = stones[i];
        c.beginPath(); c.ellipse(s[0], s[1], s[2], s[3], 0, 0, 7);
        c.fillStyle = A.grad(c, s[0], s[1] - s[3], s[0], s[1] + s[3], [0, s[4], 1, '#4a463e']); c.fill();
        c.strokeStyle = '#2a261e'; c.lineWidth = 0.55; c.stroke();
      }
      /* borne IGN, pilier de granit carré, à droite du randonneur */
      c.fillStyle = A.grad(c, sx + 16, 0, sx + 21, 0, [0, '#d0c8b8', 1, '#8a8478']);
      c.fillRect(sx + 16.2, sy - 18, 5.2, 18);
      c.fillStyle = '#c8c0b0'; c.fillRect(sx + 16.2, sy - 18, 1.6, 18);
      c.fillStyle = '#6a665c'; c.fillRect(sx + 16.2, sy - 18.8, 5.2, 1.4);
      c.strokeStyle = '#2c2820'; c.lineWidth = 0.6; c.strokeRect(sx + 16.2, sy - 18.8, 5.2, 19.6);
      c.fillStyle = '#9a9488'; c.fillRect(sx + 16.8, sy - 11.2, 4, 3.2);
      /* banc en bois plus à droite */
      c.fillStyle = '#6a5030';
      c.fillRect(sx + 28, sy - 8.2, 18, 1.8);
      c.fillRect(sx + 29, sy - 8.2, 1.6, 8.2);
      c.fillRect(sx + 44, sy - 8.2, 1.6, 8.2);
      c.fillStyle = '#8a6a40'; c.fillRect(sx + 28, sy - 8.2, 18, 0.6);
      drawFernFrond(c, sx - 42, sy, 10, E.time, 2); drawFernFrond(c, sx + 52, sy, 9, E.time, 5);
      drawFernFrond(c, sx - 14, sy, 7, E.time, 8);
    }
  });

  /* ---------- Atxuria : sous-bois, lapiaz, falaise argentée ---------- */
  window.AlpineBuild({
    id: 'atxuria', stairs: 'stone', summitReplace: true, noStrata: true, horizonHaze: 'rgba(220,230,236,.4)',
    pal: {
      q: { base: '#4a4030', mid: '#2e281e', lip: '#5a7a3c', hi: '#a0c06a', dark: '#1e1a14' },
      f: { base: '#6a5e46', mid: '#3e382c', lip: '#8aaa58', hi: '#d0e090', dark: '#2a261c' },
      c: { base: '#8a8474', mid: '#524e44', lip: '#c8c4b0', hi: '#f0ece0', dark: '#323028' },
      k: { base: '#9a9688', mid: '#5a564c', lip: '#e0dcc8', hi: '#f8f6ee', dark: '#34322c' }
    },
    tileAlpha: 0.5, depthTint: 'rgba(36,32,28,.16)', strataCol: '#3a3830', glow0: 'rgba(240,236,220,.12)', glow1: 'rgba(240,236,220,0)', vig: 'rgba(30,28,36,.18)',
    rockPal: { hi: '#f0ece0', mid: '#b0aa98', lo: '#5a564c', line: '#2e2c26', spot: 'rgba(90,86,78,.45)', rim: 'rgba(255,255,245,.55)' },
    tilePal: ['rgba(40,38,32,.28)', 'rgba(160,156,140,.2)', 'rgba(240,236,220,.14)', 'rgba(20,18,14,.3)'],
    sky: {
      stops: [0, '#4a72a8', 0.48, '#8aaccc', 0.8, '#e8d8b8', 1, '#f6e8c8'],
      sun: { x: 0.78, y: 0.68, r: 5.4, disc: '#fff6d8', g0: 'rgba(255,224,170,.4)', g1: 'rgba(255,210,140,0)', glow: 0.65 },
      clouds: { n: 6, y0: 0.14, y1: 0.5, s0: 0.8, s1: 0.85, top: '#f8f6f0', bot: '#d8c8b0', a0: 0.48, a1: 0.26, speed: 0.65 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), sh = 0, f = ss(0.22, 0.5, a) * (1 - ss(0.62, 0.85, a)), c = ss(0.55, 0.78, a), k = ss(0.78, 0.94, a); c *= (1 - k); var q = Math.max(0, 1 - f - c - k); return [q, f, c, k]; }; },
    drawSea: function (c, vw, vh, hy, gain, E) {
      var sunX = 0.78 * vw - E.cam.x * 0.004;
      drawAtlanticSea(c, vw, vh, hy, E, { band: 36, y: -24, sunX: sunX });
    },
    layers: function (E, H) {
      var far = peaks([[100, 26, 100, 110, 1.85], [280, 38, 120, 130, 1.8], [480, 32, 120, 110, 1.85], [700, 40, 130, 130, 1.75], [940, 30, 120, 110, 1.85]], nzf(E, 65, 6, 9));
      /* collines boisées en plans, pas une dalle calcaire (le lapiaz reste au sommet) */
      var mid = peaks([[140, 24, 150, 160, 1.85], [400, 32, 170, 150, 1.8], [680, 26, 150, 170, 1.85], [980, 30, 160, 150, 1.8]], nzf(E, 55, 5, 10));
      var bois = function (u) { return 16 + 14 * E.nz(u / 36, 11) + 6 * E.nz(u / 12, 12); };
      return [
        { par: 0.02, y: 16, hmax: 70, fn: far, c0: '#6a7e68', c1: '#9aac88', edge: 'rgba(40,48,36,.25)', haze: 'rgba(210,220,200,.22)', gk: 0.015,
          decor: function (c, vw, base, off, fn, Ev) {
            /* La Rhune ancrée dans le monde, plantée dans la crête (plus collée à 72 % de l'écran). */
            var wx = 130, tx = wx - off, hy = base - fn(wx);
            if (tx > -140 && tx < vw + 140) {
              drawLaRhune(c, tx, hy + 8, 0.5, { c0: '#4a5a48', c1: '#7e8e70', edge: 'rgba(40,48,36,.28)' });
            }
          } },
        { par: 0.10, y: 28, hmax: 48, fn: mid, c0: '#6a8a58', c1: '#4a6a40', edge: 'rgba(40,48,36,.28)', gk: 0.03 },
        { par: 0.2, y: 42, hmax: 44, fn: bois, c0: '#3a6a40', c1: '#244830', gk: 0.09,
          trees: { step: 12, seed: 35, dens: 0.8, maxH: 26, size: 17, haze: 0.18, hazeCol: '#b8c8b0', kind: function (x, hv) { return hv < 0.4 ? 'beech' : (hv < 0.7 ? 'oak' : 'beech'); } },
          decor: function (c, vw, base, off, fn, Ev) {
            var spots = [90, 280, 470, 710], i, wx, tx, hy;
            for (i = 0; i < spots.length; i++) {
              wx = spots[i]; tx = wx - off; hy = base - fn(wx) + 2;
              if (tx > -30 && tx < vw + 30) { drawEtxe(c, tx, hy, 0.48 + Ev.hash(wx, 61) * 0.18); }
            }
          } }
      ];
    },
    flora: function (E, H) {
      var cfg = { hazeCol: '#b8c8b0', rows: [
        { step: 16, seed: 14, haze: 0.22, fillTop: '#5a8a48', fillBot: '#3a6234', up: function (x) { return 16 + 6 * E.nz(x / 120, 5); }, dens: function (x) { return 0.55 * (1 - ss(0.5, 0.85, H.af(x))); }, size: function () { return 16; }, kind: function (x) { return E.hash(x, 46) > 0.5 ? 'oak' : 'beech'; } },
        { step: 18, seed: 25, haze: 0.1, fillTop: '#6a9a50', fillBot: '#4a7238', up: function (x) { return 7 + 3 * E.nz(x / 90, 6); }, dens: function (x) { return 0.22 * (1 - ss(0.6, 0.9, H.af(x))); }, size: function () { return 11; }, kind: function (x) { return E.hash(x, 47) > 0.65 ? 'oak' : 'beech'; } },
        { step: 16, seed: 36, haze: 0, fillTop: '#5a8a44', fillBot: '#3e6834', up: function () { return 3; }, dens: function (x) { return 0.2 * (1 - ss(0.75, 0.95, H.af(x))); }, size: function () { return 8; }, kind: function () { return 'bush'; } }
      ] };
      cfg.lipMix = function (x) {
        var a = H.af(x), wood = 1 - ss(0.2, 0.5, a), rock = ss(0.55, 0.85, a);
        var g = E.mix('#5a8a3c', '#c8c4a8', rock);
        return { dens: 0.9 * (1 - rock * 0.7), grass: 1.3 * (1 - rock), fern: 0.85 * wood + 0.4, heather: 0, bush: 0.25 * wood, broom: 0, flower: 0.08 * (1 - rock), gcol: E.mix(g, '#2a4a20', 0.25), gcol2: E.mix(g, '#d8e8a0', 0.4), fcol: '#3a7a34' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      caveMouth(c, E, xa, xb, 36);
      limestoneBand(c, xa, xb, E, H, 22);
      /* blocs de lapiaz */
      for (var x = Math.floor(xa / 36) * 36; x < xb + 36; x += 36) {
        var a = H.af(x), h = E.hash(x, 301); if (h > 0.25 + 0.6 * ss(0.35, 0.8, a)) { continue; }
        var rx = x + h * 28, r = 4 + 7 * E.hash(x, 303);
        var gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)), ry = gtop - r * 0.22;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
    },
    lipExtra: function (c, xa, xb, E, H) {
      for (var x = Math.floor(xa / 28) * 28; x < xb + 28; x += 28) {
        var h = E.hash(x, 340), ty = E.TYPE[x | 0]; if (h > 0.4 || ty === 1 || ty === 4) { continue; }
        var gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        drawFernFrond(c, x + h * 8, gy, 11 + 5 * E.hash(x, 341), E.time, x + 9);
      }
    },
    props: function (c, xa, xb, E, H) {
      boardIf(c, E, xa, xb, 52, ['GROTTES', 'DE SARE'], 48, 18, 3.2);
      boardIf(c, E, xa, xb, 106, ['758 m'], 26, 11, 3.4, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx - 48, ['ATXURIA'], 46, 12, 3.4, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      /* Crête calcaire : deux cairns, plaque Peña Plata. Le randonneur se tient en sx. */
      var i, j, stones, s;
      c.fillStyle = '#d8d4c4';
      c.beginPath(); c.moveTo(sx - 52, sy + 4); c.lineTo(sx - 22, sy - 7); c.lineTo(sx + 6, sy - 5); c.lineTo(sx + 48, sy + 4); c.closePath(); c.fill();
      c.fillStyle = '#c0b8a4';
      c.beginPath(); c.moveTo(sx - 30, sy + 3); c.lineTo(sx - 8, sy - 4); c.lineTo(sx + 20, sy - 3); c.lineTo(sx + 36, sy + 3); c.closePath(); c.fill();
      function cairn(cx, h, seed) {
        var n = 5, k, ww, hh, col;
        for (k = 0; k < n; k++) {
          ww = 7.2 - k * 1.05; hh = 3.3 - k * 0.25;
          c.beginPath(); c.ellipse(cx + (k % 2 ? 0.6 : -0.5), sy - 2.2 - k * 4.2, ww, hh, 0, 0, 7);
          col = k % 2 ? '#c8c4b4' : '#b4b0a0';
          c.fillStyle = A.grad(c, cx, sy - 4 - k * 4.2, cx, sy - k * 4.2, [0, '#e8e4d8', 1, col]); c.fill();
          c.strokeStyle = '#3a3830'; c.lineWidth = 0.55; c.stroke();
        }
      }
      cairn(sx - 22, 20, 1);
      cairn(sx + 26, 22, 2);
      /* plaque sur un bloc, à droite, sans texte lisible à cette échelle (juste une plaque sombre) */
      c.fillStyle = '#c8c4b4';
      c.beginPath(); c.moveTo(sx + 36, sy); c.lineTo(sx + 40, sy - 8); c.lineTo(sx + 54, sy - 8); c.lineTo(sx + 58, sy); c.closePath(); c.fill();
      c.strokeStyle = '#3a3830'; c.lineWidth = 0.55; c.stroke();
      c.fillStyle = '#6a6860'; c.fillRect(sx + 41, sy - 7.2, 12, 6.4);
      c.strokeStyle = '#2a2820'; c.strokeRect(sx + 41, sy - 7.2, 12, 6.4);
      c.fillStyle = '#8a887e'; c.fillRect(sx + 42.2, sy - 6.2, 9.6, 0.5); c.fillRect(sx + 42.2, sy - 4.6, 8, 0.5); c.fillRect(sx + 42.2, sy - 3, 7.2, 0.5);
      drawFernFrond(c, sx - 44, sy, 8, E.time, 3); drawFernFrond(c, sx + 14, sy, 7, E.time, 6);
    }
  });


  function orhyAf(E) {
    var s = E.feat && E.feat.summitX;
    var x = (E.P && E.P.x != null) ? E.P.x : (E.cam && E.cam.x) || 0;
    return s ? Math.max(0, Math.min(1, x / s)) : 0;
  }

  /* Mer de nuages dans les vallées : surtout une fois sur la crête (vues de mer de nuages, Joxemai 2016 ; Anie et Trois Rois émergeant, jpdugene). */
  function drawValleyClouds(c, vw, vh, hy, E) {
    /* Bancs bas, lobés et voilés, ancrés en x monde — pas une dalle blanche à arête vive. */
    var off = E.cam.x * 0.045;
    var base = hy + 22, x, u, h, i, cx, cy, rw, rh;
    c.save();
    c.globalAlpha = 0.55;
    c.beginPath();
    c.moveTo(-48, hy + 90);
    for (x = -48; x <= vw + 48; x += 6) {
      u = x + off;
      h = 7 + 5 * E.nz(u / 80, 41) + 3 * E.nz(u / 32, 42);
      c.lineTo(x, base - h);
    }
    c.lineTo(vw + 48, hy + 90);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 18, 0, hy + 88, [0, 'rgba(255,255,255,0.55)', 0.4, 'rgba(230,238,244,0.32)', 0.82, 'rgba(210,222,232,0.06)', 1, 'rgba(200,214,226,0)']);
    c.fill();
    for (i = 0; i < 5; i++) {
      u = i * 37 + off;
      cx = (i - 0.15) * (vw / 4.4) + 10 * E.nz(u / 50, 41);
      cy = base - 2 - 4 * E.nz(u / 40, 42);
      rw = 32 + 14 * E.nz(u / 30, 43);
      rh = 6 + 3 * E.nz(u / 22, 44);
      c.globalAlpha = 0.22 + 0.12 * E.nz(u / 28, 45);
      c.fillStyle = A.grad(c, 0, cy - rh, 0, cy + rh * 1.8, [0, 'rgba(255,255,255,0.7)', 0.55, 'rgba(230,238,244,0.28)', 1, 'rgba(210,222,232,0)']);
      c.beginPath();
      c.ellipse(cx, cy, rw, rh, 0, 0, 7);
      c.fill();
    }
    c.restore();
  }

  /* Profil typique de l'Orhy vu depuis le Port de Larrau : pyramide herbeuse dissymétrique
     (flanc sud long et doux, face est plus courte), pas un cône calcaire. */
  function orhyCrestY(dx) {
    /* Hauteur typifiée de la longue crête d'Orhy (flanc ouest long, selles, cime déportée). */
    var h = 0;
    h += 22 * Math.max(0, 1 - Math.pow((dx + 200) / 90, 2));
    h += 30 * Math.max(0, 1 - Math.pow((dx + 90) / 80, 2));
    h += 18 * Math.max(0, 1 - Math.pow((dx + 10) / 40, 2));
    h += 48 * Math.max(0, 1 - Math.pow((dx - 70) / 70, 2));
    h += 26 * Math.max(0, 1 - Math.pow((dx - 150) / 55, 2));
    return h;
  }

  function drawOrhyProfile(c, wx, base, off, E) {
    /* Longue crête herbeuse, d'après Commons « Orhi since Occidental».
       Mamelons et selles, bandes rocheuses / ravines, pas un dôme lisse ni un triangle d'ombre. */
    var tx = wx - off, yBot = base + 32, i, dx, x, y, x1, y1;
    if (tx < -380 || tx > 1400) { return; }
    c.beginPath();
    c.moveTo(tx - 310, yBot);
    for (dx = -300; dx <= 240; dx += 12) {
      c.lineTo(tx + dx, base - orhyCrestY(dx));
    }
    c.lineTo(tx + 260, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 52, 0, yBot, [0, '#c0cc80', 0.22, '#8aaa58', 0.65, '#5a7a40', 1, '#3e5a32']);
    c.fill();
    c.strokeStyle = 'rgba(50,62,36,.28)'; c.lineWidth = 0.7; c.stroke();
    /* ravines : sillons étroits suivant la pente, pas d'éclats géométriques */
    for (i = 0; i < 5; i++) {
      dx = -140 + i * 68;
      x = tx + dx; y = base - orhyCrestY(dx) + 2;
      c.strokeStyle = 'rgba(80, 72, 58, ' + (0.32 + 0.08 * (i % 2)) + ')';
      c.lineWidth = 1.35; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 5, y + 14, x + 9 + (i % 2) * 3, y + 26 + i * 3);
      c.stroke();
      c.strokeStyle = 'rgba(214, 208, 192, 0.40)';
      c.lineWidth = 0.85;
      c.beginPath();
      c.moveTo(x - 2.2, y + 1);
      c.quadraticCurveTo(x + 2, y + 13, x + 6, y + 24 + i * 3);
      c.stroke();
    }
    for (i = 0; i < 6; i++) {
      dx = -180 + i * 58 + ((E.hash ? E.hash(i, 61) : 0.5) - 0.5) * 8;
      x = tx + dx; y = base - orhyCrestY(dx) + 8 + 2 * (E.hash ? E.hash(i, 62) : 0);
      c.fillStyle = 'rgba(200, 196, 180, 0.38)';
      c.beginPath();
      c.ellipse(x, y, 6 + 2.5 * (E.hash ? E.hash(i, 63) : 0.5), 1.6, -0.5 - 0.1 * (i % 3), 0, 7);
      c.fill();
    }
    /* faux-plats herbeux */
    c.strokeStyle = 'rgba(200, 214, 150, .28)'; c.lineWidth = 1.15;
    c.beginPath(); c.moveTo(tx - 200, base - 14); c.quadraticCurveTo(tx - 140, base - 26, tx - 80, base - 20); c.stroke();
    c.beginPath(); c.moveTo(tx - 20, base - 28); c.quadraticCurveTo(tx + 40, base - 48, tx + 100, base - 36); c.stroke();
  }

  function drawSecondaryRidge(c, wx, base, off, E, h, w, c0, c1) {
    /* Crête herbeuse secondaire, plus basse, avec une petite ravine. */
    var tx = wx - off, yBot = base + 26, i, x, y;
    if (tx < -200 || tx > 1400) { return; }
    h = h || 18; w = w || 120;
    c.beginPath();
    c.moveTo(tx - w - 24, yBot);
    c.quadraticCurveTo(tx - w * 0.55, base - h * 0.4, tx - w * 0.25, base - h * 0.85);
    c.quadraticCurveTo(tx, base - h - 2, tx + w * 0.22, base - h * 0.7);
    c.quadraticCurveTo(tx + w * 0.6, base - h * 0.3, tx + w + 26, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - h, 0, yBot, [0, c0 || '#9cb86a', 1, c1 || '#4e6e3c']);
    c.fill();
    c.fillStyle = 'rgba(80, 74, 58, .18)';
    c.beginPath();
    c.moveTo(tx - 8, base - h * 0.7);
    c.quadraticCurveTo(tx + 10, base - h * 0.2, tx + 28, base + 8);
    c.quadraticCurveTo(tx + 6, base - h * 0.15, tx - 2, base - h * 0.65);
    c.closePath();
    c.fill();
  }

  /* Hauteur typifiée de la colline d'Iraty (même profil que le remplissage). */
  function iratyHillH(dx) {
    var h = 0, a;
    a = (dx + 140) / 90; h += 36 * Math.max(0, 1 - a * a);
    a = (dx + 30) / 70; h += 28 * Math.max(0, 1 - a * a);
    a = (dx - 70) / 80; h += 40 * Math.max(0, 1 - a * a);
    a = (dx - 180) / 75; h += 30 * Math.max(0, 1 - a * a);
    if (dx < -250 || dx > 270) { return 0; }
    return h;
  }

  /* Collines boisées d'Iraty vers l'ouest : hêtraie (et quelques sapins des sapinières),
     arbres ancrés sur le terrain, sans houppiers flottants. Forêt d'Iraty = hêtre dominant,
     sapin en mélange (ONF / sources locales). */
  function drawIratyWoods(c, wx, base, off, alpha, E) {
    var tx = wx - off, yBot = base + 24;
    if (alpha < 0.04 || tx < -360 || tx > 1400) { return; }
    /* Dessin en x monde, puis translation unique de -off : le houppier
       glisse comme un solide, sans re-échantillonnage des sommets à chaque frame. */
    c.save(); c.globalAlpha = alpha; c.translate(-off, 0);
    forestMass(c, wx - 240, wx + 250, function (x) {
      return base - iratyHillH(x - wx);
    }, yBot, 17, { col: '#2e5a34', col2: '#1a3a22', mix: 0.22, pad: 32 });
    forestMass(c, wx - 80, wx + 160, function (x) {
      return base - iratyHillH(x - wx) * 0.72 - 4;
    }, yBot, 29, { col: '#245028', col2: '#16321c', mix: 0.18, pad: 22 });
    c.restore();
  }

  /* Table des Trois Rois : trois sommets calcaires groupés, à l'est de l'Anie (vues depuis le sommet). */
  function drawTroisRois(c, vw, base, off, E) {
    var wx = 470, tx = wx - off, yBot = base + 30;
    if (tx < -80 || tx > vw + 120) { return; }
    var peaks = [[-36, 22], [0, 30], [32, 20]], i, px, ph;
    c.beginPath();
    c.moveTo(tx - 70, yBot);
    c.lineTo(tx - 70, base + 8);
    for (i = 0; i < peaks.length; i++) {
      px = tx + peaks[i][0]; ph = peaks[i][1];
      c.quadraticCurveTo(px - 10, base - ph * 0.55, px, base - ph);
      c.quadraticCurveTo(px + 8, base - ph * 0.5, px + 16, base - 4);
    }
    c.lineTo(tx + 70, base + 8);
    c.lineTo(tx + 70, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, 0, base - 30, 0, yBot, [0, '#c8c4b8', 0.55, '#9a9688', 1, '#6a6a5c']);
    c.fill();
  }

  function drawCayolar(c, x, base, s) {
    /* Cabane pastorale typifiée (pierre, toit bas à deux pentes, enclos bas). */
    s = s || 1;
    c.save(); c.translate(x, base); c.scale(s, s);
    c.fillStyle = 'rgba(20,16,10,.2)'; c.beginPath(); c.ellipse(2, 1.4, 14, 2.2, 0, 0, 7); c.fill();
    /* petit muret d'enclos */
    c.fillStyle = '#8a8474';
    c.beginPath(); c.moveTo(-16, 1); c.lineTo(-16, -2.2); c.lineTo(18, -2.2); c.lineTo(18, 1); c.lineTo(16, 1); c.lineTo(16, -0.6); c.lineTo(-14, -0.6); c.closePath(); c.fill();
    c.strokeStyle = '#3a3428'; c.lineWidth = 0.4; c.stroke();
    c.fillStyle = A.grad(c, -10, 0, 12, 0, [0, '#c8c0b0', 1, '#8a8474']);
    c.fillRect(-10, -10, 22, 10);
    c.strokeStyle = '#3a3428'; c.lineWidth = 0.55; c.strokeRect(-10, -10, 22, 10);
    c.strokeStyle = 'rgba(60,54,44,.35)'; c.lineWidth = 0.35;
    c.beginPath(); c.moveTo(-6, -10); c.lineTo(-6, 0); c.moveTo(2, -10); c.lineTo(2, 0); c.moveTo(8, -10); c.lineTo(8, 0); c.stroke();
    c.fillStyle = '#5a4030';
    c.beginPath(); c.moveTo(-12.2, -9.4); c.lineTo(1, -16.2); c.lineTo(14.4, -9.4); c.closePath(); c.fill();
    c.strokeStyle = '#2a2018'; c.lineWidth = 0.5; c.stroke();
    c.fillStyle = '#3a3024'; c.fillRect(-1.4, -6.6, 3.6, 6.6);
    c.fillStyle = '#6a6860'; c.fillRect(-7.2, -7.2, 3.0, 2.4);
    c.strokeStyle = '#2a2820'; c.lineWidth = 0.35; c.strokeRect(-7.2, -7.2, 3.0, 2.4);
    c.restore();
  }

  function drawPassRoad(c, vw, hy, E) {
    /* Route du col (D26) et parking, ancrés en x monde ; ils sortent par parallaxe, sans disparaitre. */
    var y, wx, tx, base = hy + 16, off = E.cam.x * 0.18;
    c.save(); c.globalAlpha = 0.88;
    c.beginPath();
    for (wx = -40; wx < 420; wx += 8) {
      tx = wx - off;
      y = base + 9 * E.nz(wx / 70, 88) + 4 * Math.sin(wx * 0.03);
      if (wx === -40) { c.moveTo(tx, y); } else { c.lineTo(tx, y); }
    }
    c.strokeStyle = '#c4b48a'; c.lineWidth = 3.4; c.lineCap = 'round'; c.stroke();
    c.strokeStyle = 'rgba(90,80,50,.4)'; c.lineWidth = 0.65; c.stroke();
    /* aire du col, typifiée */
    tx = 70 - off;
    c.fillStyle = 'rgba(196,180,138,.7)';
    c.beginPath(); c.ellipse(tx, base + 6, 16, 3.5, -0.15, 0, 7); c.fill();
    c.restore();
  }

  function drawDistantSheep(c, x, gy, sc, face, coat, graze) {
    /* Manech typifiée, à l'échelle du lointain : toison bosselée, tête noire ou rousse, pattes sombres. */
    if (window.__sheepAudit) {
      window.__sheepAudit.push({ x: x, gy: gy, footY: gy + 1.55 * (sc || 1), sc: sc || 1 });
    }
    var head = coat ? '#7a3a1c' : '#2a2018', wool = coat ? '#f2eee4' : '#f7f4ec', wool2 = '#e6e0d0';
    var s = sc || 1, g = graze ? 0.7 : 0;
    c.save(); c.translate(x, gy); c.scale(face * s, s);
    c.fillStyle = 'rgba(20,16,10,.16)'; c.beginPath(); c.ellipse(0.2, 1.15, 3.6, 0.7, 0, 0, 7); c.fill();
    c.strokeStyle = '#2a2018'; c.lineWidth = 0.55; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-2.0, 0.1); c.lineTo(-2.15, 1.55);
    c.moveTo(-0.7, 0.15); c.lineTo(-0.55, 1.5);
    c.moveTo(0.9, 0.15); c.lineTo(1.05, 1.5);
    c.moveTo(2.15, 0.1); c.lineTo(2.3, 1.55);
    c.stroke();
    /* toison : corps + bourrelets */
    c.fillStyle = wool2;
    c.beginPath(); c.ellipse(-0.2, -1.05, 3.15, 2.15, -0.08, 0, 7); c.fill();
    c.fillStyle = wool;
    c.beginPath(); c.ellipse(0.15, -1.25, 2.85, 1.95, 0.06, 0, 7); c.fill();
    c.beginPath(); c.ellipse(-1.7, -1.7, 1.35, 1.15, -0.2, 0, 7); c.fill();
    c.beginPath(); c.ellipse(0.2, -2.15, 1.25, 1.05, 0.1, 0, 7); c.fill();
    c.beginPath(); c.ellipse(1.7, -1.55, 1.2, 1.05, 0.2, 0, 7); c.fill();
    c.strokeStyle = 'rgba(40,36,28,.2)'; c.lineWidth = 0.25;
    c.beginPath(); c.ellipse(0.15, -1.2, 2.9, 2.0, 0.06, 0, 7); c.stroke();
    /* encolure + tête bien en avant du corps (un peu baissée si elle broute) */
    c.fillStyle = head;
    c.beginPath(); c.ellipse(2.55, -1.35 + g * 0.5, 0.65, 0.8, 0.35, 0, 7); c.fill();
    c.beginPath(); c.ellipse(3.55, -1.15 + g * 1.15, 1.2, 0.82, 0.2, 0, 7); c.fill();
    /* oreille */
    c.beginPath(); c.ellipse(2.95, -1.85 + g * 0.6, 0.32, 0.68, 0.45, 0, 7); c.fill();
    c.restore();
  }
  function drawPastureFlock(c, x, gy, n, seed, E, sc, opt) {
    /* Troupeau naturel (pas une file). Si fn/base/off sont fournis, chaque
       bête est assise exactement sur la surface de sa couche (pas de rangée
       soulevée qui la ferait flotter). */
    var i, sx, sy, face, coat, graze, k, row, col, s, fn, base, off, wx;
    opt = opt || {};
    fn = opt.fn; base = opt.base; off = opt.off;
    sc = sc || 1;
    n = Math.max(4, n || 6);
    for (i = 0; i < n; i++) {
      row = (i * 2) % 3;
      col = (i / 3) | 0;
      k = seed + i;
      sx = x + col * 9.4 * sc + row * 4.2 * sc + (E.hash(k, 90) - 0.5) * 6.5 * sc;
      if (fn && base != null && off != null) {
        wx = sx + off;
        sy = base - fn(wx);
      } else {
        sy = gy;
      }
      face = E.hash(k, 92) > 0.45 ? 1 : -1;
      coat = E.hash(k, 93) > 0.62 ? 1 : 0;
      graze = E.hash(k, 94) > 0.4;
      s = sc * (0.88 + 0.22 * E.hash(k, 95));
      drawDistantSheep(c, sx, sy, s, face, coat, graze);
    }
  }



  /* ---------- Pic d'Orhy / Orhi : voie normale du Port de Larrau, crête aérienne, vent ---------- */
  window.AlpineBuild({
    id: 'orhy', stairs: 'stone', summitReplace: true, noStrata: true, noHorizonBar: true, horizonHaze: 'rgba(220,230,240,.0)',
    pal: {
      q: { base: '#6a5c3c', mid: '#3e3424', lip: '#8aaa48', hi: '#d4e888', dark: '#2a2216' },
      f: { base: '#746240', mid: '#433628', lip: '#a0b854', hi: '#e0ee9a', dark: '#2c261c' },
      c: { base: '#7a7058', mid: '#4a4234', lip: '#b0c070', hi: '#e8eeb0', dark: '#2e2a22' },
      k: { base: '#8a8272', mid: '#524a40', lip: '#c0c080', hi: '#f0f0c0', dark: '#322e28' }
    },
    tileAlpha: 0.55, depthTint: 'rgba(36,32,24,.10)', strataCol: '#4a4030', glow0: 'rgba(255,232,190,.08)', glow1: 'rgba(255,210,140,0)', vig: 'rgba(28,34,42,.14)',
    rockPal: { hi: '#d8d4c4', mid: '#8a8678', lo: '#4a463c', line: '#2a261e', spot: 'rgba(110,104,90,.45)', rim: 'rgba(255,244,214,.5)' },
    tilePal: ['rgba(50,44,28,.28)', 'rgba(120,130,64,.22)', 'rgba(200,190,140,.16)', 'rgba(24,20,12,.32)', 'rgba(90,70,42,.2)'],
    sky: {
      stops: [0, '#2a5a9a', 0.4, '#7eb4dc', 0.78, '#e8d8b0', 1, '#ffe8c4'],
      sun: { x: 0.8, y: 0.68, r: 5.2, disc: '#fff8d8', g0: 'rgba(255,220,150,.40)', g1: 'rgba(255,200,120,0)', glow: 0.6 },
      clouds: { n: 6, y0: 0.14, y1: 0.5, s0: 0.9, s1: 1.0, top: '#ffffff', bot: '#e4eaf0', a0: 0.5, a1: 0.28, speed: 0.7 }
    },
    bw: function (E, H) { return function (x) { var a = H.af(x), f = ss(0.06, 0.24, a) * (1 - ss(0.76, 0.95, a)), k = ss(0.8, 0.96, a); return [Math.max(0, 1 - f - k), f, 0, k]; }; },
    drawSea: function (c, vw, vh, hy, gain, E) {
      drawValleyClouds(c, vw, vh, hy, E);
    },
    layers: function (E, H) {
      var far = peaks([[90, 5, 200, 220, 0.9], [300, 6, 210, 210, 0.9], [540, 5, 210, 220, 0.9], [800, 6, 220, 210, 0.9], [1080, 5, 210, 210, 0.9]], nzf(E, 80, 2, 3));
      var mid = peaks([[200, 5, 200, 220, 0.85], [480, 6, 220, 200, 0.85], [780, 5, 210, 220, 0.85], [1100, 5, 210, 210, 0.85]], nzf(E, 55, 2, 4));
      var near = peaks([[220, 4, 240, 240, 0.8], [660, 5, 260, 240, 0.8], [1100, 4, 240, 250, 0.8]], nzf(E, 40, 2, 4));
      return [
        { par: 0.02, y: 22, hmax: 28, hs: 1, fn: far, c0: '#8a9a88', c1: '#c0c8b4', edge: 'rgba(40,50,44,.12)', haze: 'rgba(210,220,210,.16)', gk: 0.012,
          decor: function (c, vw, base, off, fn, Ev) {
            var af = (Ev.feat && Ev.feat.summitX) ? Math.max(0, Math.min(1, ((Ev.P && Ev.P.x) || (Ev.cam && Ev.cam.x) || 0) / Ev.feat.summitX)) : 0;
            /* Anie d'abord (plus loin), puis crête d'Orhy devant */
            if (af > 0.18) {
              c.save(); c.globalAlpha = 0.45 + 0.55 * Math.min(1, (af - 0.18) / 0.3);
              drawAnieRange(c, vw, base - 26, off, Ev, off + vw * 0.90);
              drawTroisRois(c, vw, base - 8, off, Ev);
              c.restore();
            }
            /* crête d'Orhy : approche dynamique (échelle et calage selon la progression). */
            (function () {
              var orhyWx, flocks, i, j, dx, tx, hy, opt, midOff, midBase;
              var iratyY, anchors, h, top, sc, yb, ax;
              sc = 0.58 + 0.72 * Math.max(0, Math.min(1, af / 0.97));
              orhyWx = off + vw * (0.62 - 0.08 * af) - 70 * sc;
              yb = base - 4 - 10 * af;
              ax = orhyWx - off;
              c.save(); c.translate(ax, yb); c.scale(sc, sc); c.translate(-ax, -yb);
              drawOrhyProfile(c, orhyWx, yb, off, Ev);
              midOff = ((Ev.cam && Ev.cam.x) || 0) * 0.11;
              midBase = base + 14;
              anchors = [[40, 6], [340, 4], [620, 2]];
              function iratyTopAt(screenX) {
                top = 1e9;
                for (j = 0; j < anchors.length; j++) {
                  h = iratyHillH(screenX + midOff - anchors[j][0]);
                  if (h > 6) {
                    top = Math.min(top, midBase - anchors[j][1] - h);
                  }
                }
                return top;
              }
              opt = { fn: function (wx0) { return orhyCrestY(wx0 - orhyWx); }, base: yb, off: off };
              flocks = [-120, -20, 80, 150];
              for (i = 0; i < flocks.length; i++) {
                dx = flocks[i]; tx = orhyWx + dx - off;
                if (tx < -30 || tx > vw + 30) { continue; }
                hy = yb - orhyCrestY(dx);
                iratyY = iratyTopAt(tx);
                if (iratyY < 1e8 && hy + 4 >= iratyY) { continue; }
                drawPastureFlock(c, tx, hy, 5, 31 + i, Ev, 0.7, opt);
              }
              c.restore();
            }());
          } },
        { par: 0.11, y: 36, hmax: 18, hs: 1, fn: mid, step: 1, c0: '#6a8a58', c1: '#4a6a40', edge: 'rgba(40,48,36,.22)', haze: 'rgba(210,220,200,.08)', gk: 0,
          decor: function (c, vw, base, off, fn, Ev) {
            var spots, i, wx, tx, hy, sc, opt;
            opt = { fn: fn, base: base, off: off };
            drawIratyWoods(c, 40, base - 6, off, 1, Ev);
            drawIratyWoods(c, 340, base - 4, off, 0.95, Ev);
            drawIratyWoods(c, 620, base - 2, off, 0.85, Ev);
            drawSecondaryRidge(c, 260, base - 2, off, Ev, 14, 110, '#8aaa60', '#4e6e3c');
            drawSecondaryRidge(c, 500, base, off, Ev, 12, 120, '#7a9a54', '#456638');
            function iratyHAt(worldX) {
              var a = [[40, 1], [340, 0.95], [620, 0.85]], j, h = 0, hh;
              for (j = 0; j < a.length; j++) {
                hh = iratyHillH(worldX - a[j][0]) * a[j][1];
                if (hh > h) { h = hh; }
              }
              return h;
            }
            function ridgeH(worldX, cx, h0, w0) {
              var u = (worldX - cx) / w0;
              if (u * u > 1.2) { return 0; }
              return Math.max(0, (h0 + 2) * (1 - u * u * 0.92));
            }
            spots = [[100, 1.2, 7, 11], [280, 1.15, 7, 12], [460, 1.1, 6, 13], [640, 1.05, 6, 14]];
            for (i = 0; i < spots.length; i++) {
              wx = spots[i][0]; tx = wx - off;
              if (tx < -50 || tx > vw + 50) { continue; }
              /* pas de cabane / troupeau au milieu d'une masse forestière */
              if (iratyHAt(wx) > 14) { continue; }
              hy = base - fn(wx);
              sc = spots[i][1];
              drawCayolar(c, tx, hy, sc);
              drawPastureFlock(c, tx - 36, hy, spots[i][2], spots[i][3], Ev, 1.35, opt);
            }
            /* troupeaux assis sur les crêtes secondaires dessinées (même profil) */
            spots = [[260, 14, 110, 6, 21, -2], [500, 12, 120, 5, 22, 0]];
            for (i = 0; i < spots.length; i++) {
              wx = spots[i][0]; tx = wx - off;
              if (tx < -40 || tx > vw + 40) { continue; }
              if (iratyHAt(wx) > 12) { continue; }
              (function (cx, h0, w0, n0, seed0, bOff) {
                var o = { fn: function (wxx) { return ridgeH(wxx, cx, h0, w0); }, base: base + bOff, off: off };
                drawPastureFlock(c, tx, base + bOff - ridgeH(cx, cx, h0, w0), n0, seed0, Ev, 0.85, o);
              }(spots[i][0], spots[i][1], spots[i][2], spots[i][3], spots[i][4], spots[i][5]));
            }
          } },
        { par: 0.22, y: 52, hmax: 14, hs: 1, fn: near, c0: '#4a7240', c1: '#2e4e2c', edge: 'rgba(30,40,28,.20)', gk: 0 }
      ];
    },
    bgExtra: function (c, vw, vh, hy, gain, E) {
      drawPassRoad(c, vw, hy, E);
    },

    flora: function (E, H) {
      /* Au-dessus d'environ 1700 m (af ≈ 0.29), pelouse rase et roche : pas d'arbres sur la voie.
         Même au départ (Port de Larrau, ~1573 m), la voie est déjà en estive ; on ne plante pas d'arbre au bord du sentier. */
      var cfg = { hazeCol: '#c8d4b0', rows: [] };
      cfg.lipMix = function (x) {
        var a = H.af(x), open = ss(0.04, 0.28, a), bare = ss(0.22, 0.45, a);
        var g = E.mix('#8cbc52', '#d0dc78', open);
        return { dens: 0.9 - 0.22 * bare, grass: 1.7 + 0.5 * (1 - bare), fern: 0.08 * (1 - bare), heather: 0.06 * open * (1 - bare * 0.5), bush: 0, broom: 0.03 * open * (1 - bare), flower: 0.07 * (1 - bare), gcol: E.mix(g, '#3a6a28', 0.12), gcol2: E.mix(g, '#e8f4a0', 0.4), fcol: '#4a8a3a' };
      };
      return cfg;
    },
    behind: function (c, xa, xb, bottom, E, H) {
      var x, h, rx, r, gtop, ry, gy;
      for (x = Math.floor(xa / 48) * 48; x < xb + 48; x += 48) {
        h = E.hash(x, 301); if (h > 0.5 + 0.35 * (1 - H.af(x))) { continue; }
        rx = x + h * 36; r = 3.4 + 6 * E.hash(x, 303);
        gtop = Math.min(H.gf(rx - r), H.gf(rx), H.gf(rx + r)); ry = gtop - r * 0.2;
        if (!isFinite(ry)) { continue; }
        A.drawRock(c, rx, ry, r, E.hash(x, 304) * 6, x, true);
      }
      /* bornes-frontière décoratives le long du début de voie (outre la 237, objet de carnet) */
      for (x = 160; x < 900; x += 220) {
        if (x < xa - 8 || x > xb + 8) { continue; }
        gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        c.save(); c.translate(x, gy);
        c.fillStyle = A.grad(c, -2, 0, 2, 0, [0, '#e4e0d0', 1, '#8a8678']);
        c.beginPath(); c.moveTo(-2.0, 1); c.lineTo(-1.7, -7.2); c.lineTo(0, -8.4); c.lineTo(1.7, -7.2); c.lineTo(2.0, 1); c.closePath(); c.fill();
        c.strokeStyle = '#2c2820'; c.lineWidth = 0.45; c.stroke();
        c.restore();
      }
    },
    lipExtra: function (c, xa, xb, E, H) {
      var x, h, ty, gy, a, sway, seg, i, px, py, p0, p1;
      /* herbe rase, un peu couchée par le vent près de la crête */
      for (x = Math.floor(xa / 16) * 16; x < xb + 16; x += 16) {
        h = E.hash(x, 350); ty = E.TYPE[x | 0]; if (h > 0.62 || ty === 1 || ty === 4) { continue; }
        gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
        a = H.af(x); sway = Math.sin((E.time || 0) * 3.2 + x * 0.04) * (1.2 + 2.2 * ss(0.55, 0.95, a));
        c.strokeStyle = 'rgba(90,120,50,' + (0.35 + 0.25 * a).toFixed(2) + ')';
        c.lineWidth = 0.55; c.beginPath(); c.moveTo(x, gy); c.quadraticCurveTo(x + sway, gy - 3.5, x + sway * 1.4, gy - 6 - h * 3); c.stroke();
        /* reflet d'herbe mouillée sur les zones de dévers */
        if (E.ZN && (E.ZN[x | 0] & 128)) {
          c.strokeStyle = 'rgba(210,230,200,' + (0.22 + 0.12 * Math.sin((E.time || 0) * 2 + x * 0.05)).toFixed(2) + ')';
          c.lineWidth = 0.7; c.beginPath(); c.moveTo(x - 3, gy + 0.4); c.lineTo(x + 5, gy + 0.6); c.stroke();
        }
      }
      /* Câble d'assurance le long du passage rocheux (Altituderando), typifié. */
      if (E.feat && E.feat.cables) {
        for (i = 0; i < E.feat.cables.length; i++) {
          seg = E.feat.cables[i];
          if (seg.x1 < xa - 10 || seg.x0 > xb + 10) { continue; }
          p0 = Math.max(xa - 4, seg.x0); p1 = Math.min(xb + 4, seg.x1);
          c.strokeStyle = '#2e2e34'; c.lineWidth = 1.05; c.lineCap = 'round';
          c.beginPath();
          for (px = p0; px <= p1; px += 4) {
            py = E.G[Math.max(0, Math.min(E.len, px | 0))];
            if (!isFinite(py)) { continue; }
            if (px === p0) { c.moveTo(px, py - 15); } else { c.lineTo(px, py - 15); }
          }
          c.stroke();
          c.strokeStyle = 'rgba(200,200,208,.7)'; c.lineWidth = 0.4; c.stroke();
          for (px = Math.ceil(seg.x0 / 28) * 28; px <= seg.x1; px += 28) {
            py = E.G[Math.max(0, Math.min(E.len, px | 0))];
            if (!isFinite(py) || px < xa - 6 || px > xb + 6) { continue; }
            c.fillStyle = '#8a8478'; c.fillRect(px - 0.7, py - 15.4, 1.4, 15.4);
            c.fillStyle = '#4a4844'; c.beginPath(); c.arc(px, py - 15.4, 0.8, 0, 7); c.fill();
          }
        }
      }
    },
    props: function (c, xa, xb, E, H) {
      /* Un seul panneau, entièrement visible au spawn (x≈30, portrait étroit) :
         nom du col + altitude du parking (tourisme64 : 1 573–1 577 m), pas celle du sommet. */
      boardIf(c, E, xa, xb, 52, ['PORT DE', 'LARRAU'], 50, 18, 3.2);
      boardIf(c, E, xa, xb, 108, ['1573 m'], 24, 12, 3.2, 28);
      var sx = E.feat && E.feat.summitStart;
      if (sx) { boardIf(c, E, xa, xb, sx + 132, ['ORHY'], 36, 12, 3.4, 30); }
    },
    finds: FINDS,
    summit: function (c, sx, sy, E) {
      /* Dôme herbeux et rocheux, dans l'esprit du tableau de fin : herbe rase, calcaire/schiste
         épars, sentier usé, pilier géodésique et buzon. Pas une plage dallée. */
      var i, hx, hy, G = E.G, hash = E.hash || A.hash, gy;
      function gAt(x) {
        var v = G && G[Math.max(0, Math.min(E.len || 0, x | 0))];
        return (v != null && isFinite(v)) ? v : sy;
      }
      /* sentier usé, légèrement sinueux */
      c.save();
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath();
      for (i = -70; i <= 90; i += 3) {
        hx = sx + i; hy = gAt(hx) + 0.35 + Math.sin(i * 0.09) * 0.45;
        if (i === -70) { c.moveTo(hx, hy); } else { c.lineTo(hx, hy); }
      }
      c.strokeStyle = 'rgba(150, 132, 96, 0.42)'; c.lineWidth = 3.6; c.stroke();
      c.strokeStyle = 'rgba(186, 168, 124, 0.35)'; c.lineWidth = 1.8; c.stroke();
      c.restore();
      /* herbe rase, touffes courtes un peu plus denses */
      for (i = 0; i < 46; i++) {
        hx = sx - 72 + hash(i, 31) * 158;
        hy = gAt(hx) - hash(i, 32) * 0.6;
        c.strokeStyle = i % 3 ? 'rgba(90, 120, 48, 0.72)' : 'rgba(140, 158, 70, 0.7)';
        c.lineWidth = 0.55; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(hx, hy);
        c.lineTo(hx + (hash(i, 33) - 0.5) * 2.2, hy - 2.0 - hash(i, 34) * 2.6);
        c.stroke();
      }
      /* blocs de calcaire / schiste, formes irrégulières, pas des dalles alignées */
      function stone(cx, cy, rw, rh, rot, seed) {
        var k, n = 6, pts = [];
        c.save(); c.translate(cx, cy); c.rotate(rot);
        c.beginPath();
        for (k = 0; k < n; k++) {
          var an = k / n * Math.PI * 2, rr = (0.72 + hash(k, seed) * 0.4);
          pts.push([Math.cos(an) * rw * rr, Math.sin(an) * rh * rr]);
          if (k === 0) { c.moveTo(pts[0][0], pts[0][1]); } else { c.lineTo(pts[k][0], pts[k][1]); }
        }
        c.closePath();
        c.fillStyle = seed % 2 ? '#d8d2c4' : '#c4beae';
        c.fill();
        c.strokeStyle = 'rgba(50, 46, 38, 0.55)'; c.lineWidth = 0.4; c.stroke();
        c.fillStyle = 'rgba(255, 248, 230, 0.28)';
        c.beginPath(); c.ellipse(-rw * 0.2, -rh * 0.25, rw * 0.28, rh * 0.18, -0.3, 0, 7); c.fill();
        c.restore();
      }
      stone(sx - 36, gAt(sx - 36) - 1.1, 4.2, 2.2, -0.2, 11);
      stone(sx - 14, gAt(sx - 14) - 0.8, 3.2, 1.7, 0.15, 12);
      stone(sx + 32, gAt(sx + 32) - 1.0, 3.8, 2.0, -0.12, 13);
      stone(sx + 48, gAt(sx + 48) - 0.7, 2.6, 1.5, 0.3, 14);
      stone(sx + 8, gAt(sx + 8) + 0.2, 2.4, 1.3, -0.4, 15);
      stone(sx - 52, gAt(sx - 52) - 0.5, 2.8, 1.4, 0.2, 16);
      stone(sx + 62, gAt(sx + 62) - 0.9, 3.4, 1.8, -0.25, 17);
      stone(sx - 22, gAt(sx - 22) + 0.3, 2.2, 1.2, 0.35, 18);
      /* pilier géodésique IGN typifié : fût cylindrique en béton, un peu plus large à la base, plaque au sommet */
      var px = sx - 24, py = sy;
      c.fillStyle = 'rgba(20,18,14,.28)';
      c.beginPath(); c.ellipse(px, py + 1.2, 4.2, 1.5, 0, 0, 7); c.fill();
      c.fillStyle = A.grad(c, px - 3.2, 0, px + 3.2, 0, [0, '#d8d4c8', 0.45, '#b0aaa0', 1, '#7a766c']);
      c.beginPath(); c.moveTo(px - 3.6, py); c.lineTo(px - 2.9, py - 26); c.lineTo(px + 2.9, py - 26); c.lineTo(px + 3.6, py); c.closePath(); c.fill();
      c.strokeStyle = '#2c2820'; c.lineWidth = 0.55; c.stroke();
      c.fillStyle = '#c8c4ba';
      c.beginPath(); c.ellipse(px - 0.3, py - 26, 2.9, 1.0, 0, 0, 7); c.fill();
      c.strokeStyle = '#2c2820'; c.lineWidth = 0.45; c.stroke();
      c.fillStyle = '#6a6860';
      c.beginPath(); c.ellipse(px - 0.3, py - 27.2, 1.9, 0.6, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(40,38,32,.55)'; c.lineWidth = 0.4; c.stroke();
      /* buzon métallique, plus petit que le pilier, toit à deux pentes, sculpture d'oiseau (pas un oiseau vivant) */
      var bx = sx + 18, by = sy;
      c.fillStyle = 'rgba(20,18,14,.28)';
      c.beginPath(); c.ellipse(bx + 4.5, by + 1.1, 5.2, 1.4, 0, 0, 7); c.fill();
      c.fillStyle = A.grad(c, bx, 0, bx + 9, 0, [0, '#5a7a4a', 0.5, '#3e5a34', 1, '#2a3e24']);
      c.fillRect(bx, by - 16, 11.5, 16);
      c.strokeStyle = '#1e2418'; c.lineWidth = 0.55; c.strokeRect(bx, by - 16, 11.5, 16);
      c.fillStyle = '#6a3a28';
      c.beginPath(); c.moveTo(bx - 1.4, by - 16); c.lineTo(bx + 5.8, by - 24); c.lineTo(bx + 12.9, by - 16); c.closePath(); c.fill();
      c.strokeStyle = '#2a1c14'; c.lineWidth = 0.55; c.stroke();
      c.strokeStyle = 'rgba(255,230,200,.25)'; c.lineWidth = 0.4;
      c.beginPath(); c.moveTo(bx + 0.8, by - 14.8); c.lineTo(bx + 10.8, by - 14.8); c.stroke();
      c.fillStyle = '#2a241c'; c.fillRect(bx + 4.0, by - 10.4, 3.2, 3.4);
      c.strokeStyle = '#1a1612'; c.lineWidth = 0.4; c.strokeRect(bx + 4.0, by - 10.4, 3.2, 3.4);
      /* oiseau métallique sculpté sur le faîte, un peu plus lisible à l'échelle de jeu */
      c.fillStyle = '#2a2622';
      c.beginPath();
      c.moveTo(bx + 3.8, by - 24.2);
      c.quadraticCurveTo(bx + 2.4, by - 27.2, bx + 5.8, by - 29.0);
      c.quadraticCurveTo(bx + 8.0, by - 29.2, bx + 8.8, by - 27.4);
      c.quadraticCurveTo(bx + 8.6, by - 25.4, bx + 7.0, by - 24.2);
      c.closePath(); c.fill();
      c.strokeStyle = '#1a1612'; c.lineWidth = 0.45; c.stroke();
      c.beginPath(); c.moveTo(bx + 8.2, by - 27.6); c.quadraticCurveTo(bx + 10.6, by - 28.0, bx + 12.4, by - 26.4);
      c.strokeStyle = '#2a2622'; c.lineWidth = 0.85; c.lineCap = 'round'; c.stroke();
      c.fillStyle = '#c8a040';
      c.beginPath(); c.moveTo(bx + 12.0, by - 26.6); c.lineTo(bx + 13.8, by - 26.1); c.lineTo(bx + 12.0, by - 25.6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,32,20,.55)'; c.lineWidth = 0.3; c.stroke();
    }  });

  /* Chaîne typifiée vers l'est (Anie et hautes Pyrénées), style des autres fonds monde 2 :
     crête irrégulière, brume bleu-gris, bas plus sombre avec une touche d'herbe,
     neige seulement dans deux couloirs. Anie : profil dissymétrique, pas un triangle isocèle. */
  function drawAnieRange(c, vw, base, off, E, wx0) {
    /* Pic d'Anie : large pyramide calcaire, flanc ouest long et mamelonné,
       cime un peu déportée, face est plus courte. Lapiaz, pas de coin dur. */
    var wx = (wx0 != null) ? wx0 : 340, tx = wx - off, yBot, i, px, py;
    if (tx < -180 || tx > vw + 180) { return; }
    yBot = base + 36;
    c.beginPath();
    c.moveTo(tx - 90, yBot);
    c.quadraticCurveTo(tx - 78, base + 8, tx - 62, base - 2);
    c.quadraticCurveTo(tx - 48, base - 10, tx - 36, base - 8);
    c.quadraticCurveTo(tx - 22, base - 22, tx - 10, base - 18);
    c.quadraticCurveTo(tx + 2, base - 36, tx + 14, base - 52);
    c.quadraticCurveTo(tx + 22, base - 56, tx + 28, base - 48);
    c.quadraticCurveTo(tx + 40, base - 30, tx + 50, base - 14);
    c.quadraticCurveTo(tx + 62, base - 6, tx + 78, base + 8);
    c.quadraticCurveTo(tx + 90, base + 16, tx + 102, yBot);
    c.closePath();
    c.fillStyle = A.grad(c, tx - 20, base - 56, tx + 50, yBot, [0, '#eeeae0', 0.3, '#d0ccc0', 0.65, '#a8a496', 1, '#6a6a60']);
    c.fill();
    /* détails clippés dans la silhouette — plus de traits dans le ciel */
    c.save();
    c.clip();
    /* ombre de la face est, courbe */
    c.fillStyle = 'rgba(60, 58, 52, .28)';
    c.beginPath();
    c.moveTo(tx + 18, base - 50);
    c.quadraticCurveTo(tx + 32, base - 28, tx + 46, base - 6);
    c.quadraticCurveTo(tx + 34, base - 8, tx + 22, base - 26);
    c.closePath(); c.fill();
    /* lapiaz : petits lits sur la face, sous la crête */
    c.strokeStyle = 'rgba(90, 86, 78, .28)'; c.lineWidth = 0.7;
    for (i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(tx + 6 + i * 4, base - 34 + i * 5);
      c.quadraticCurveTo(tx + 14 + i * 4, base - 22 + i * 5, tx + 22 + i * 4, base - 10 + i * 4);
      c.stroke();
    }
    /* névé discret sous la cime */
    c.fillStyle = 'rgba(255, 255, 255, .30)';
    c.beginPath();
    c.moveTo(tx + 10, base - 48);
    c.quadraticCurveTo(tx + 18, base - 54, tx + 24, base - 44);
    c.quadraticCurveTo(tx + 16, base - 42, tx + 10, base - 48);
    c.closePath(); c.fill();
    c.restore();
  }

  function skyWash(c, w, h, stops, sun) {
    var g = c.createLinearGradient(0, 0, 0, h), i;
    for (i = 0; i < stops.length; i += 2) { g.addColorStop(stops[i], stops[i + 1]); }
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (sun) {
      var sx = sun[0] * w, sy = sun[1] * h, r = sun[2] || 90;
      var sg = c.createRadialGradient(sx, sy, 4, sx, sy, r);
      sg.addColorStop(0, 'rgba(255,248,216,.95)'); sg.addColorStop(0.18, 'rgba(255,220,150,.45)'); sg.addColorStop(1, 'rgba(255,200,120,0)');
      c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill();
      c.fillStyle = '#fff8d8'; c.beginPath(); c.arc(sx, sy, 7, 0, 7); c.fill();
    }
  }
  function fillRidge(c, pts, c0, c1, yBot) {
    var i, minY = pts[0][1];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) { c.lineTo(pts[i][0], pts[i][1]); if (pts[i][1] < minY) { minY = pts[i][1]; } }
    c.lineTo(pts[pts.length - 1][0], yBot); c.lineTo(pts[0][0], yBot); c.closePath();
    c.fillStyle = A.grad(c, 0, minY, 0, yBot, [0, c0, 1, c1]); c.fill();
  }
  function paintOaks(c, list, t) {
    var i; for (i = 0; i < list.length; i++) {
      var o = list[i];
      if (o.k === 'beech' && S.beech) { S.beech(c, o.x, o.y, o.s, { t: t || 0, seed: i, sway: false }); }
      else if (S.oak) { S.oak(c, o.x, o.y, o.s, { t: t || 0, seed: i, sway: false }); }
      else if (S.beech) { S.beech(c, o.x, o.y, o.s, { t: t || 0, seed: i }); }
    }
  }



  function paintUrsuyaSummit(c, w, h) {
    /* Vue depuis le dôme herbeux de l'Ursuya (réf. 1056×448, flag/focus ~ 640,280).
       Océan à l'ouest jusqu'à une côte continue ; collines en plans successifs ;
       La Rhune modeste posée sur les crêtes, Pyrénées au sud ; cairn ancré. */
    var kx = w / 1056, ky = h / 448, hor = 0.40 * h, i;
    skyWash(c, w, h, [0, '#2a5a96', 0.42, '#7eb4d8', 0.72, '#e8d4a8', 1, '#f6e8c8'], [0.16, 0.36, 150 * ky]);
    /* 1. terres lointaines sur TOUT l'horizon, pour qu'il n'y ait pas de mer à droite */
    fillRidge(c, [
      [0, hor + 28 * ky], [180 * kx, hor + 16 * ky], [360 * kx, hor + 24 * ky],
      [560 * kx, hor + 10 * ky], [760 * kx, hor + 18 * ky], [920 * kx, hor + 8 * ky], [w, hor + 20 * ky]
    ], '#9aaa90', '#7a8a78', h);
    /* silhouettes des Pyrénées, très lointaines, au sud (droite) */
    c.fillStyle = '#8a9aaa';
    c.beginPath();
    c.moveTo(620 * kx, hor + 14 * ky);
    c.quadraticCurveTo(740 * kx, hor - 16 * ky, 820 * kx, hor + 2 * ky);
    c.quadraticCurveTo(900 * kx, hor - 18 * ky, 980 * kx, hor + 4 * ky);
    c.quadraticCurveTo(1020 * kx, hor - 8 * ky, w, hor + 10 * ky);
    c.lineTo(w, hor + 22 * ky); c.lineTo(620 * kx, hor + 20 * ky); c.closePath(); c.fill();
    c.fillStyle = 'rgba(200,214,224,.4)';
    c.beginPath(); c.moveTo(740 * kx, hor + 10 * ky); c.quadraticCurveTo(900 * kx, hor - 6 * ky, w, hor + 12 * ky); c.lineTo(w, hor + 20 * ky); c.closePath(); c.fill();
    /* 2. mer à l'OUEST seulement, bornée par une côte courbe — pas de rectangle coupé */
    c.beginPath();
    c.moveTo(0, hor);
    c.lineTo(560 * kx, hor);
    c.quadraticCurveTo(620 * kx, hor + 6 * ky, 640 * kx, hor + 22 * ky);
    c.quadraticCurveTo(560 * kx, hor + 40 * ky, 420 * kx, hor + 48 * ky);
    c.lineTo(0, hor + 52 * ky); c.closePath();
    c.fillStyle = A.grad(c, 0, hor, 0, hor + 52 * ky, [0, '#d8eef4', 0.4, '#7aadc4', 1, '#4a7e9a']); c.fill();
    c.strokeStyle = 'rgba(255,255,245,.28)'; c.lineWidth = 1;
    var waves = [[8, 200, 6, 430, 14], [18, 260, 22, 480, 20], [32, 180, 28, 400, 30]];
    for (i = 0; i < waves.length; i++) {
      var wv = waves[i];
      c.beginPath(); c.moveTo(0, hor + wv[0] * ky); c.quadraticCurveTo(wv[1] * kx, hor + wv[2] * ky, wv[3] * kx, hor + wv[4] * ky); c.stroke();
    }
    /* liseré de côte, le long du rivage seulement */
    c.strokeStyle = 'rgba(196,176,140,.7)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(0, hor + 48 * ky); c.quadraticCurveTo(280 * kx, hor + 46 * ky, 480 * kx, hor + 32 * ky); c.stroke();
    /* 3. La Rhune, modeste, POSÉE sur les collines (SE), pas dans l'eau */
    drawLaRhune(c, 820 * kx, hor + 16 * ky, 0.50 * ((kx + ky) * 0.5 + 0.5), { c0: '#5a6a58', c1: '#8fa07c', edge: 'rgba(40,48,36,.3)' });
    /* 4. plans de collines, perspective aérienne */
    fillRidge(c, [
      [0, hor + 58 * ky], [140 * kx, hor + 42 * ky], [300 * kx, hor + 54 * ky],
      [480 * kx, hor + 36 * ky], [680 * kx, hor + 50 * ky], [880 * kx, hor + 38 * ky], [w, hor + 54 * ky]
    ], '#8aaa70', '#6a8a58', h);
    fillRidge(c, [
      [0, h * 0.58], [160 * kx, h * 0.52], [340 * kx, h * 0.57],
      [530 * kx, h * 0.50], [740 * kx, h * 0.56], [930 * kx, h * 0.51], [w, h * 0.58]
    ], '#6ea048', '#4e8038', h);
    drawEtxe(c, 150 * kx, h * 0.585, 0.62); drawEtxe(c, 360 * kx, h * 0.575, 0.52);
    drawEtxe(c, 880 * kx, h * 0.535, 0.65);
    paintOaks(c, [
      { x: 70 * kx, y: h * 0.58, s: 22 * ky, k: 'oak' }, { x: 230 * kx, y: h * 0.555, s: 18 * ky, k: 'beech' },
      { x: 940 * kx, y: h * 0.57, s: 20 * ky, k: 'oak' }
    ], 0.2);
    /* 5. dôme herbeux, ouvert */
    c.beginPath();
    c.moveTo(-20, h + 4);
    c.quadraticCurveTo(200 * kx, h * 0.70, 480 * kx, h * 0.60);
    c.quadraticCurveTo(640 * kx, h * 0.56, 840 * kx, h * 0.64);
    c.quadraticCurveTo(980 * kx, h * 0.76, w + 20, h * 0.88);
    c.lineTo(w + 20, h + 4); c.closePath();
    c.fillStyle = A.grad(c, 0, h * 0.55, 0, h, [0, '#b8d060', 0.4, '#7aaa48', 1, '#4a6e30']); c.fill();
    c.strokeStyle = 'rgba(186,158,110,.75)'; c.lineWidth = 6 * kx; c.lineCap = 'round';
    c.beginPath(); c.moveTo(70 * kx, h * 0.94); c.quadraticCurveTo(300 * kx, h * 0.78, 600 * kx, h * 0.66); c.stroke();
    /* fougères aigle, clairsemées */
    var ferns = [70, 130, 200, 400, 470, 820, 900, 980];
    for (i = 0; i < ferns.length; i++) { drawFernFrond(c, ferns[i] * kx, h * 0.88 - (i % 3) * 10 * ky, (16 + (i % 3) * 4) * ky, 0.4, i); }
    /* pottoks animés dans Vista.drawSceneLive */
    /* cairn + borne IGN, ancrés (flag 640,248 / focus 640,280 sur le canevas de réf.) */
    var sx = 640 * kx, sy = 300 * ky;
    c.fillStyle = 'rgba(40,30,16,.28)'; c.beginPath(); c.ellipse(sx, sy + 3 * ky, 22 * kx, 4.5 * ky, 0, 0, 7); c.fill();
    c.fillStyle = '#8a8274';
    c.beginPath();
    c.moveTo(sx - 14 * kx, sy); c.lineTo(sx - 10 * kx, sy - 8 * ky); c.lineTo(sx - 4 * kx, sy - 16 * ky);
    c.lineTo(sx + 3 * kx, sy - 24 * ky); c.lineTo(sx + 10 * kx, sy - 14 * ky); c.lineTo(sx + 14 * kx, sy - 7 * ky);
    c.lineTo(sx + 12 * kx, sy); c.closePath(); c.fill();
    c.strokeStyle = '#2a261e'; c.lineWidth = 1.0; c.stroke();
    c.fillStyle = '#b0aa9a';
    c.beginPath(); c.moveTo(sx - 6 * kx, sy - 8 * ky); c.lineTo(sx - 2 * kx, sy - 16 * ky); c.lineTo(sx + 5 * kx, sy - 10 * ky); c.lineTo(sx + 4 * kx, sy - 6 * ky); c.closePath(); c.fill();
    c.fillStyle = '#8aba50'; c.beginPath(); c.ellipse(sx, sy + 1 * ky, 18 * kx, 3.2 * ky, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(40,30,16,.22)'; c.beginPath(); c.ellipse(sx + 24 * kx, sy + 3 * ky, 5 * kx, 2 * ky, 0, 0, 7); c.fill();
    c.fillStyle = '#c8c0b0';
    c.beginPath(); c.moveTo(sx + 21 * kx, sy + 1 * ky); c.lineTo(sx + 22 * kx, sy - 26 * ky); c.lineTo(sx + 27 * kx, sy - 28 * ky); c.lineTo(sx + 28 * kx, sy + 1 * ky); c.closePath(); c.fill();
    c.strokeStyle = '#2a261e'; c.lineWidth = 0.8; c.stroke();
    c.fillStyle = '#3a342c'; c.font = Math.max(8, 10 * ky) + 'px sans-serif'; c.textAlign = 'center';
    c.fillText('IGN', sx + 25 * kx, sy - 16 * ky); c.fillText('678', sx + 25 * kx, sy - 5 * ky);
    c.fillStyle = '#6a5030';
    c.fillRect(sx - 50 * kx, sy - 10 * ky, 24 * kx, 2.6 * ky);
    c.fillRect(sx - 49 * kx, sy - 10 * ky, 2.4 * kx, 11 * ky);
    c.fillRect(sx - 29 * kx, sy - 10 * ky, 2.4 * kx, 11 * ky);
  }

  function paintAtxuriaSummit(c, w, h) {
    /* Crête calcaire, La Rhune voisine à l'ouest posée sur les collines, mer en lisière,
       plaque Peña Plata et cairn ancrés (flag 520,220 / focus 530,260). */
    var kx = w / 1056, ky = h / 448, hor = 0.38 * h, i;
    skyWash(c, w, h, [0, '#3a649a', 0.45, '#8ab0cc', 0.76, '#e8d8b8', 1, '#f6e8c8'], [0.84, 0.36, 120 * ky]);
    /* terres d'horizon sur toute la largeur */
    fillRidge(c, [
      [0, hor + 24 * ky], [200 * kx, hor + 14 * ky], [400 * kx, hor + 22 * ky],
      [640 * kx, hor + 10 * ky], [860 * kx, hor + 18 * ky], [w, hor + 16 * ky]
    ], '#8a9a90', '#6a7a70', h);
    /* mer : mince lisière à l'ouest, derrière les avant-monts */
    c.beginPath();
    c.moveTo(0, hor);
    c.lineTo(300 * kx, hor);
    c.quadraticCurveTo(340 * kx, hor + 6 * ky, 280 * kx, hor + 18 * ky);
    c.lineTo(0, hor + 22 * ky);
    c.closePath();
    c.fillStyle = A.grad(c, 0, hor, 0, hor + 22 * ky, [0, '#d0e8f0', 1, '#5a86a0']); c.fill();
    /* avant-monts verts sous La Rhune, pour qu'elle ne flotte pas dans l'eau */
    fillRidge(c, [
      [0, hor + 28 * ky], [160 * kx, hor + 20 * ky], [300 * kx, hor + 30 * ky],
      [420 * kx, hor + 36 * ky], [520 * kx, hor + 28 * ky]
    ], '#7a9a68', '#5a7a50', h);
    drawLaRhune(c, 400 * kx, hor + 26 * ky, 0.52 * ((kx + ky) * 0.5 + 0.5), { c0: '#4a5a48', c1: '#849474', edge: 'rgba(40,48,36,.3)' });
    fillRidge(c, [
      [300 * kx, hor + 36 * ky], [500 * kx, hor + 20 * ky], [700 * kx, hor + 30 * ky],
      [900 * kx, hor + 16 * ky], [w, hor + 28 * ky]
    ], '#8aaa78', '#6a8a58', h);
    /* crête calcaire irrégulière, pas un trapèze plat */
    c.beginPath();
    c.moveTo(20 * kx, h * 0.66);
    c.lineTo(90 * kx, h * 0.58);
    c.quadraticCurveTo(180 * kx, h * 0.50, 280 * kx, h * 0.48);
    c.lineTo(360 * kx, h * 0.46);
    c.quadraticCurveTo(470 * kx, h * 0.42, 560 * kx, h * 0.45);
    c.lineTo(650 * kx, h * 0.47);
    c.quadraticCurveTo(800 * kx, h * 0.50, 960 * kx, h * 0.62);
    c.lineTo(w, h * 0.72); c.lineTo(0, h * 0.76); c.closePath();
    c.fillStyle = A.grad(c, 0, h * 0.42, 0, h * 0.76, [0, '#d8d4c4', 0.45, '#b8b49e', 1, '#7a7664']); c.fill();
    c.strokeStyle = 'rgba(90,86,78,.4)'; c.lineWidth = 1.0;
    c.beginPath();
    c.moveTo(120 * kx, h * 0.58); c.lineTo(300 * kx, h * 0.52); c.lineTo(520 * kx, h * 0.50); c.lineTo(760 * kx, h * 0.54);
    c.moveTo(200 * kx, h * 0.62); c.lineTo(440 * kx, h * 0.56); c.lineTo(700 * kx, h * 0.58);
    c.stroke();
    /* touffes d'herbe sur la dalle */
    c.fillStyle = '#7aaa50';
    c.beginPath(); c.ellipse(200 * kx, h * 0.58, 28 * kx, 5 * ky, -0.15, 0, 7); c.fill();
    c.beginPath(); c.ellipse(700 * kx, h * 0.56, 24 * kx, 4 * ky, 0.1, 0, 7); c.fill();
    /* affleurements irréguliers, assis sur la crête (pas de carrés flottants) */
    var j, crestY = function (px) {
      /* approximation de la ligne de crête dessinée plus haut */
      var u = px / w;
      return h * (0.66 - 0.20 * Math.sin(u * 2.4) * (1 - Math.abs(u - 0.45)));
    };
    for (j = 0; j < 6; j++) {
      var lx = (180 + j * 120) * kx, ly = crestY(lx) + 6 * ky;
      c.fillStyle = j % 2 ? '#d4d0c2' : '#c0bcb0';
      c.beginPath();
      c.moveTo(lx, ly);
      c.lineTo(lx + 10 * kx, ly - 7 * ky);
      c.lineTo(lx + 22 * kx, ly - 4 * ky);
      c.lineTo(lx + 18 * kx, ly + 2 * ky);
      c.closePath(); c.fill();
    }
    fillRidge(c, [
      [0, h * 0.76], [200 * kx, h * 0.68], [420 * kx, h * 0.72],
      [640 * kx, h * 0.66], [860 * kx, h * 0.74], [w, h * 0.70]
    ], '#5a8a40', '#3a602c', h);
    drawEtxe(c, 140 * kx, h * 0.72, 0.8); drawEtxe(c, 900 * kx, h * 0.71, 0.7);
    paintOaks(c, [
      { x: 50 * kx, y: h * 0.76, s: 22 * ky, k: 'oak' }, { x: 240 * kx, y: h * 0.71, s: 18 * ky, k: 'beech' },
      { x: 980 * kx, y: h * 0.73, s: 22 * ky, k: 'oak' }
    ], 0.2);
    /* premier plan */
    c.beginPath();
    c.moveTo(-10, h + 4);
    c.quadraticCurveTo(200 * kx, h * 0.80, 420 * kx, h * 0.68);
    c.quadraticCurveTo(530 * kx, h * 0.60, 700 * kx, h * 0.68);
    c.quadraticCurveTo(880 * kx, h * 0.82, w + 10, h * 0.90);
    c.lineTo(w + 10, h + 4); c.closePath();
    c.fillStyle = A.grad(c, 0, h * 0.60, 0, h, [0, '#c8d080', 0.4, '#8aaa50', 1, '#4a6234']); c.fill();
    /* quelques roches posées dans l'herbe du premier plan, base au sol */
    for (j = 0; j < 5; j++) {
      var rx = (80 + j * 180) * kx, ry = h * (0.88 + (j % 2) * 0.03);
      c.fillStyle = j % 2 ? '#c8c4b0' : '#b4b09c';
      c.beginPath();
      c.moveTo(rx, ry);
      c.lineTo(rx + 8 * kx, ry - 6 * ky);
      c.lineTo(rx + 18 * kx, ry - 3 * ky);
      c.lineTo(rx + 16 * kx, ry);
      c.closePath(); c.fill();
    }
    var aFerns = [40, 110, 200, 760, 840, 960];
    for (j = 0; j < aFerns.length; j++) { drawFernFrond(c, aFerns[j] * kx, h * 0.91, (16 + (j % 3) * 4) * ky, 0.3, j + 3); }
    var sx = 520 * kx, sy = 278 * ky;
    c.fillStyle = 'rgba(40,30,16,.28)'; c.beginPath(); c.ellipse(sx + 4 * kx, sy + 4 * ky, 26 * kx, 5 * ky, 0, 0, 7); c.fill();
    c.fillStyle = '#8aaa50'; c.beginPath(); c.ellipse(sx, sy + 2 * ky, 20 * kx, 3.4 * ky, 0, 0, 7); c.fill();
    var stones = [
      [-12, 0, 10, 6, '#b8b49a'], [0, 0, 11, 6, '#c8c4b0'], [11, 1, 8, 5, '#a8a490'],
      [-7, -6, 8, 5, '#c0bca8'], [4, -6, 9, 5, '#b4b09c'],
      [-2, -11, 7, 5, '#d0ccc0'], [5, -11, 6, 4.5, '#bcb8a8'],
      [0, -16, 5.5, 5, '#ccc8bc']
    ], si, stn;
    for (si = 0; si < stones.length; si++) {
      stn = stones[si];
      c.fillStyle = stn[4];
      c.beginPath(); c.ellipse(sx + stn[0] * kx, sy + stn[1] * ky, stn[2] * kx * 0.55, stn[3] * ky * 0.55, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(50,48,40,.35)'; c.lineWidth = 0.6; c.stroke();
    }
    c.fillStyle = 'rgba(40,30,16,.22)'; c.beginPath(); c.ellipse(sx + 36 * kx, sy + 3 * ky, 10 * kx, 2.2 * ky, 0, 0, 7); c.fill();
    c.fillStyle = '#8a8274'; c.fillRect(sx + 34 * kx, sy - 20 * ky, 3.2 * kx, 22 * ky);
    c.fillStyle = '#e8e4d4'; c.fillRect(sx + 20 * kx, sy - 22 * ky, 32 * kx, 18 * ky);
    c.strokeStyle = '#3a3830'; c.strokeRect(sx + 20 * kx, sy - 22 * ky, 32 * kx, 18 * ky);
    c.fillStyle = '#3a342c'; c.font = Math.max(8, 9 * ky) + 'px sans-serif'; c.textAlign = 'center';
    c.fillText('PEÑA PLATA', sx + 36 * kx, sy - 9 * ky);
    c.font = Math.max(7, 8 * ky) + 'px sans-serif'; c.fillText('756 m', sx + 36 * kx, sy + 2 * ky);
  }

  /* Masse forestière posterisée (comme les ceintures du Colombier) :
     silhouette organique, houppier en festons, quelques fûts en grappes
     au premier plan. Pas d'arbres sucettes isolés. */
  function forestMass(c, x0, x1, yRidge, yBot, seed, opt) {
    var i, n, t, x, y, yR, span, pad, col, col2, mix, sc, j, tx, ty, knd;
    opt = opt || {};
    seed = seed || 0;
    col = opt.col || '#2a4a2c';
    col2 = opt.col2 || '#1a3420';
    mix = opt.mix != null ? opt.mix : 0.2;
    pad = opt.pad != null ? opt.pad : 28;
    function ridgeAt(xx) {
      return (typeof yRidge === 'function') ? yRidge(xx) : yRidge;
    }
    function botAt(xx) {
      return (typeof yBot === 'function') ? yBot(xx) : yBot;
    }
    c.beginPath();
    yR = ridgeAt(x0);
    /* pieds en pente vers le sol, pas de paroi verticale ni de base horizontale */
    c.moveTo(x0 - pad * 0.4, botAt(x0 - pad * 0.4) + 2);
    c.quadraticCurveTo(x0 - pad * 0.15, yR * 0.45 + botAt(x0) * 0.55, x0, yR + 4);
    n = Math.max(6, ((x1 - x0) / 14) | 0);
    for (i = 1; i <= n; i++) {
      t = i / n;
      x = x0 + (x1 - x0) * t;
      y = ridgeAt(x) + Math.sin(t * 6.2 + seed) * 3.2 + Math.sin(i * 1.71 + seed) * 1.5;
      c.quadraticCurveTo(x - (x1 - x0) / n * 0.5, y - 2.2, x, y);
    }
    yR = ridgeAt(x1);
    c.quadraticCurveTo(x1 + pad * 0.15, yR * 0.45 + botAt(x1) * 0.55, x1 + pad * 0.4, botAt(x1 + pad * 0.4) + 2);
    /* lisière basse organique, suit le sol */
    for (i = n - 1; i >= 1; i--) {
      t = i / n;
      x = x0 + (x1 - x0) * t;
      c.lineTo(x, botAt(x) + 2 + Math.sin(t * 5.1 + seed) * 2.2);
    }
    c.closePath();
    c.fillStyle = A.grad ? A.grad(c, 0, ridgeAt((x0 + x1) * 0.5) - 6, 0, botAt((x0 + x1) * 0.5), [0, col, 1, col2]) : col;
    c.fill();
    /* festons de houppier, enfoncés dans la masse */
    span = x1 - x0;
    for (i = 0; i < n + 3; i++) {
      t = (i + 0.25) / (n + 3);
      x = x0 + span * t + Math.sin(i * 2.3 + seed) * 2.4;
      y = ridgeAt(x) + Math.sin(t * 6.2 + seed) * 3.2 + 1.2;
      sc = 4.2 + (i % 4) * 1.1;
      c.fillStyle = (i % 3) ? col : '#345838';
      c.beginPath(); c.ellipse(x, y + 1.4, sc, sc * 0.62, 0, 0, 7); c.fill();
      if (mix > 0 && ((i * 3 + seed) % 10) / 10 < mix && S && S.fir) {
        S.fir(c, x, y + 3, sc * 1.15, { haze: 0.1, seed: seed + i, t: 0, sway: false });
      }
    }
    /* fûts optionnels : évités sur les plans d'approche (lisibilité). */
    if (!opt.noTrunks) {
      for (j = 0; j < 4; j++) {
        tx = x0 + span * (0.18 + j * 0.2) + ((j * 5 + seed) % 7) - 3;
        ty = (ridgeAt(tx) * 0.25 + botAt(tx) * 0.75);
        for (i = 0; i < 3; i++) {
          c.strokeStyle = 'rgba(28, 22, 16, 0.55)';
          c.lineWidth = 0.9;
          c.beginPath();
          c.moveTo(tx + i * 3.1 - 3, ty + 6);
          c.lineTo(tx + i * 3.1 - 3, ty - 4 - (i % 2));
          c.stroke();
        }
      }
    }
  }

  window.BasqueArt = {
    ursuya: paintUrsuyaSummit,
    atxuria: paintAtxuriaSummit,
    etxe: drawEtxe,
    laRhune: drawLaRhune,
    fern: drawFernFrond,
    sea: drawAtlanticSea,
    boardIf: boardIf,
    limestone: limestoneBand,
    outline: outline,
    ss: ss,
    nzf: nzf,
    forestMass: forestMass
  };

})();
