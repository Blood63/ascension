/* Profil altimétrique de l’écran de victoire : courbe lissée du parcours + marqueurs (coups reçus, objets trouvés, bouteilles, points de contrôle, marches, trains, zones). */
(function () {
  'use strict';
  var PX = '"Press Start 2P", ui-monospace, monospace';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); }

  /* rééchantillonnage régulier + lissage (moyenne glissante pondérée) : les marches et les trous disparaissent, la forme reste */
  function curve(pts, n, win) {
    var out = [], i, j, d0 = pts[0].d, d1 = pts[pts.length - 1].d, k = 0;
    for (i = 0; i < n; i++) {
      var d = d0 + (d1 - d0) * i / (n - 1);
      while (k < pts.length - 2 && pts[k + 1].d < d) { k++; }
      var a = pts[k], b = pts[k + 1] || a, t = b.d > a.d ? clamp((d - a.d) / (b.d - a.d), 0, 1) : 0;
      out.push({ d: d, alt: a.alt + (b.alt - a.alt) * t });
    }
    var sm = [], tot, w, s;
    for (i = 0; i < n; i++) {
      s = 0; tot = 0;
      for (j = -win; j <= win; j++) { var q = clamp(i + j, 0, n - 1); w = win + 1 - Math.abs(j); s += out[q].alt * w; tot += w; }
      sm.push({ d: out[i].d, alt: s / tot });
    }
    sm[0].alt = out[0].alt; sm[n - 1].alt = Math.max(sm[n - 1].alt, out[n - 1].alt);
    return sm;
  }
  function altAt(cv, d) {
    var lo = 0, hi = cv.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (cv[m].d <= d) { lo = m; } else { hi = m; } }
    var a = cv[lo], b = cv[hi], t = b.d > a.d ? clamp((d - a.d) / (b.d - a.d), 0, 1) : 0; return a.alt + (b.alt - a.alt) * t;
  }

  function heart(c, x, y, s, fill, line) {
    c.beginPath(); c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.25, y + s * 0.1, x - s * 0.7, y - s * 0.95, x, y - s * 0.3);
    c.bezierCurveTo(x + s * 0.7, y - s * 0.95, x + s * 1.25, y + s * 0.1, x, y + s * 0.9); c.closePath();
    c.fillStyle = fill; c.fill(); c.lineWidth = 1.2; c.strokeStyle = line; c.stroke();
  }
  function gem(c, x, y, s, fill, line) {
    c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.85, y); c.lineTo(x, y + s); c.lineTo(x - s * 0.85, y); c.closePath();
    c.fillStyle = fill; c.fill(); c.lineWidth = 1.2; c.strokeStyle = line; c.stroke();
    c.beginPath(); c.moveTo(x - s * 0.45, y - s * 0.1); c.lineTo(x, y - s * 0.62); c.lineTo(x + s * 0.2, y - s * 0.2); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1; c.stroke();
  }
  function drop(c, x, y, s, fill, line) {
    c.beginPath(); c.moveTo(x, y - s * 1.1); c.bezierCurveTo(x + s * 0.2, y - s * 0.55, x + s * 0.85, y - s * 0.15, x + s * 0.85, y + s * 0.35);
    c.bezierCurveTo(x + s * 0.85, y + s * 0.95, x - s * 0.85, y + s * 0.95, x - s * 0.85, y + s * 0.35);
    c.bezierCurveTo(x - s * 0.85, y - s * 0.15, x - s * 0.2, y - s * 0.55, x, y - s * 1.1); c.closePath();
    c.fillStyle = fill; c.fill(); c.lineWidth = 1.1; c.strokeStyle = line; c.stroke();
    c.beginPath(); c.arc(x - s * 0.3, y + s * 0.15, s * 0.18, 0, 7); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
  }
  function flag(c, x, y, s, col) {
    c.strokeStyle = '#f4efe2'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - s * 1.7); c.stroke();
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y - s * 1.7); c.lineTo(x + s * 1.05, y - s * 1.35); c.lineTo(x, y - s); c.closePath(); c.fill();
  }

  /* dessin complet à l’instant t ∈ [0,1] (révélation progressive de gauche à droite) */
  function render(cv, P, o, reveal) {
    var dpr = Math.min(3, window.devicePixelRatio || 1), W = cv.clientWidth || 320, H = cv.clientHeight || 160;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var small = W < 330, fs = small ? 6 : 7, padL = small ? 40 : 46, padR = 12, padT = 22, padB = small ? 38 : 40;
    var x0 = padL, x1 = W - padR, y0 = padT, y1 = H - padB, pw = x1 - x0, ph = y1 - y0;
    var cur = o.cur, aMin = Math.min.apply(null, cur.map(function (q) { return q.alt; })), aMax = Math.max.apply(null, cur.map(function (q) { return q.alt; }));
    var span = Math.max(40, aMax - aMin), lo = aMin - span * 0.14, hi = aMax + span * 0.2, dist = P.dist;
    var X = function (d) { return x0 + (d / dist) * pw; }, Y = function (a) { return y1 - ((a - lo) / (hi - lo)) * ph; };

    // fond : ciel de fin de journée
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1c1646'); g.addColorStop(0.55, '#4a2e72'); g.addColorStop(1, '#8e4a66');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (var s = 0; s < 26; s++) { var sx = ((s * 97.3) % 1) * W, sy = ((s * 53.7) % 1) * H * 0.5; c.fillStyle = 'rgba(255,255,255,' + (0.15 + 0.25 * ((s * 31) % 7) / 7) + ')'; c.fillRect(Math.round(sx), Math.round(sy), 1.5, 1.5); }

    // grille : altitudes rondes + distances
    var step = span > 900 ? 200 : span > 450 ? 100 : span > 200 ? 50 : 25, a;
    c.font = fs + 'px ' + PX; c.textBaseline = 'middle'; c.textAlign = 'right';
    for (a = Math.ceil(lo / step) * step; a < hi; a += step) {
      var yy = Math.round(Y(a)) + 0.5; if (yy < y0 - 2 || yy > y1) { continue; }
      c.strokeStyle = 'rgba(255,255,255,.13)'; c.lineWidth = 1; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(244,239,226,.82)'; c.fillText(fmt(a), x0 - 6, yy);
    }
    c.textAlign = 'center'; c.textBaseline = 'top';
    var dStep = dist > 3000 ? 1000 : dist > 1400 ? 500 : dist > 600 ? 200 : 100;
    for (var dd = 0; dd <= dist + 0.1; dd += dStep) { var xx = Math.round(X(dd)) + 0.5; c.strokeStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.moveTo(xx, y0); c.lineTo(xx, y1 + 3); c.stroke(); c.fillStyle = 'rgba(244,239,226,.7)'; c.fillText(dd === 0 ? '0' : (dd >= 1000 ? (dd / 1000).toString().replace('.', ',') + ' km' : dd + ' m'), clamp(xx, x0 + 6, x1 - 8), y1 + 8); }

    // révélation : clip de gauche à droite
    var cx = x0 + pw * reveal; c.save(); c.beginPath(); c.rect(0, 0, cx + 1, H); c.clip();

    // zones : bandes translucides + frise sous la courbe
    var zcol = { 1: ['rgba(255,196,80,.1)', '#ffc450'], 4: ['rgba(255,255,255,.13)', '#f4f8ff'], 8: ['rgba(214,224,232,.12)', '#cfd8e0'], 16: ['rgba(140,220,230,.09)', '#8fe0e8'], 32: ['rgba(160,210,80,.12)', '#a0d24a'], 64: ['rgba(80,100,140,.14)', '#6a80b0'] };
    P.zones.forEach(function (z) {
      [1, 4, 8, 16, 32, 64].forEach(function (bit) {
        if (!(z.z & bit)) { return; } var xa = X(z.d0), xb = X(Math.max(z.d1, z.d0 + 2));
        c.fillStyle = zcol[bit][0]; c.fillRect(xa, y0, xb - xa, ph);
        var row = bit === 1 ? 0 : bit === 4 ? 1 : bit === 8 ? 2 : bit === 16 ? 3 : bit === 32 ? 4 : 5; c.fillStyle = zcol[bit][1]; c.globalAlpha = 0.85; c.fillRect(xa, y1 + 22 + row * 3, xb - xa, 2); c.globalAlpha = 1;
      });
    });

    // surface sous la courbe
    var path = new Path2D(); path.moveTo(X(cur[0].d), y1);
    cur.forEach(function (q) { path.lineTo(X(q.d), Y(q.alt)); }); path.lineTo(X(cur[cur.length - 1].d), y1); path.closePath();
    var ft = Y(aMax), fg = c.createLinearGradient(0, ft, 0, y1);
    fg.addColorStop(0, o.top); fg.addColorStop(0.22, o.mid); fg.addColorStop(0.65, o.low); fg.addColorStop(1, o.base);
    c.fillStyle = fg; c.fill(path);
    // reflets de relief : fines lignes de strate suivant la courbe
    c.save(); c.clip(path); c.globalAlpha = 0.16; c.strokeStyle = '#fff'; c.lineWidth = 1;
    for (var k = 1; k < 5; k++) { c.beginPath(); cur.forEach(function (q, i) { var yy2 = Y(q.alt) + k * ph * 0.1; if (i) { c.lineTo(X(q.d), yy2); } else { c.moveTo(X(q.d), yy2); } }); c.stroke(); }
    c.restore();
    // marches : petits escaliers le long de la courbe
    P.stairs.forEach(function (st) {
      var n = Math.max(2, Math.round((X(st.d1) - X(st.d0)) / 4));
      c.fillStyle = 'rgba(120,76,40,.95)';
      for (var i = 0; i < n; i++) { var d = st.d0 + (st.d1 - st.d0) * (i / n); c.fillRect(Math.round(X(d)), Math.round(Y(altAt(cur, d))) + 1.5, 2, 2); }
    });
    // arête lumineuse
    c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath(); cur.forEach(function (q, i) { if (i) { c.lineTo(X(q.d), Y(q.alt)); } else { c.moveTo(X(q.d), Y(q.alt)); } });
    c.strokeStyle = 'rgba(20,10,40,.55)'; c.lineWidth = 5; c.stroke();
    c.strokeStyle = o.line; c.lineWidth = 2.4; c.stroke();
    c.restore();

    // marqueurs (n’apparaissent que quand la révélation les a atteints)
    function vis(d) { return X(d) <= cx; }
    var topV = y0 - 4;
    P.cps.forEach(function (m) { if (vis(m.d)) { var px = X(m.d), py = Y(altAt(cur, m.d)); flag(c, px, py, 4.5, '#6fd16a'); } });
    P.trains.forEach(function (m) { if (!vis(m.d)) { return; } var px = X(m.d), py = Y(altAt(cur, m.d)); c.fillStyle = '#2f9a5a'; c.fillRect(px - 5, py - 7, 10, 5); c.fillStyle = '#e8f4ea'; c.fillRect(px - 4, py - 6, 2, 2); c.fillRect(px - 1, py - 6, 2, 2); c.fillRect(px + 2, py - 6, 2, 2); c.fillStyle = '#222'; c.fillRect(px - 4, py - 2, 2, 1.5); c.fillRect(px + 2, py - 2, 2, 1.5); });
    P.bottles.forEach(function (m) { if (vis(m.d)) { var px = X(m.d), py = Y(altAt(cur, m.d)) - 9; drop(c, px, py, 4.2, '#59b8f0', '#0e2d52'); } });
    P.finds.forEach(function (m) { if (vis(m.d)) { var px = X(m.d), py = Y(altAt(cur, m.d)) - 11; c.strokeStyle = 'rgba(255,211,77,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py + 5); c.lineTo(px, Y(altAt(cur, m.d))); c.stroke(); gem(c, px, py, 5.2, '#ffd34d', '#6b4a00'); } });
    P.hearts.forEach(function (m, i) {
      if (!vis(m.d)) { return; } var px = X(m.d), py = Y(altAt(cur, m.d)), hy = Math.max(topV + 8, py - 20 - (i % 2) * 11);
      c.strokeStyle = 'rgba(255,120,120,.5)'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(px, hy + 4); c.lineTo(px, py); c.stroke(); c.setLineDash([]);
      heart(c, px, hy, 5.2, '#ff4a5a', '#5a0e1a');
    });
    // sommet : drapeau + altitude
    var ex = X(cur[cur.length - 1].d), ey = Y(cur[cur.length - 1].alt);
    if (reveal >= 0.995) {
      flag(c, ex, ey, 7, '#ff5a3a'); c.fillStyle = '#ffd34d'; c.beginPath(); c.arc(ex, ey, 2.6, 0, 7); c.fill();
      c.font = fs + 'px ' + PX; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillStyle = '#ffe9a8'; c.fillText(fmt(P.altTop) + ' m', Math.min(W - 6, ex + 4), Math.max(y0 - 2, ey - 16));
    }
    // départ
    c.beginPath(); c.arc(X(cur[0].d), Y(cur[0].alt), 3, 0, 7); c.fillStyle = '#f4efe2'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1a1420'; c.stroke();
    // curseur de révélation
    if (reveal < 0.995) { var ry = Y(altAt(cur, (cx - x0) / pw * dist)); c.beginPath(); c.arc(cx, ry, 3.2, 0, 7); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = o.line; c.lineWidth = 1.5; c.stroke(); }
    // cadre pixel
    c.strokeStyle = '#1a1420'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, W - 3, H - 3); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; c.strokeRect(4.5, 4.5, W - 9, H - 9);
  }

  var PAL = {
    1: { top: '#d9d2dc', mid: '#9a7f78', low: '#6a4636', base: '#3a2230', line: '#ffd9a0' },
    2: { top: '#cfc7d4', mid: '#8a6c5c', low: '#5a3a30', base: '#33202c', line: '#ffd9a0' },
    3: { top: '#c9ccb8', mid: '#7b8a52', low: '#4d6e3c', base: '#2b4130', line: '#f4ffc8' },
    4: { top: '#d7d8aa', mid: '#8fa14a', low: '#4d7a37', base: '#2a4630', line: '#f8ffc0' },
    5: { top: '#f1f4fa', mid: '#a6a29c', low: '#6d7a4a', base: '#32463a', line: '#ffffff' },
    6: { top: '#dcdcb8', mid: '#93a24c', low: '#527a3a', base: '#2a4530', line: '#f8ffc0' },
    7: { top: '#d8e8b0', mid: '#8aaa4a', low: '#4a7a38', base: '#2a4530', line: '#f4ffc0' },
    8: { top: '#e8e4d0', mid: '#a8a484', low: '#6a8050', base: '#2c3a30', line: '#f8f4e0' }
  };

  window.Profile = {
    /* crée le canvas + la légende ; renvoie du HTML à insérer, puis `Profile.mount(id, lv)` pour dessiner */
    html: function (id) { return '<div class="prof-wrap"><canvas id="' + id + '" class="prof-cv" role="img" aria-label="Profil altimétrique de ta montée"></canvas><div class="prof-leg" id="' + id + 'Leg"></div></div>'; },
    mount: function (id, lv) {
      var cv = document.getElementById(id), P = window.Game && Game.profile && Game.profile();
      if (!cv || !P || !P.pts || P.pts.length < 3) { if (cv && cv.parentNode) { cv.parentNode.style.display = 'none'; } return; }
      var cur = curve(P.pts, 150, 3), pal = PAL[lv.number] || PAL[1], o = { cur: cur, top: pal.top, mid: pal.mid, low: pal.low, base: pal.base, line: pal.line };
      var leg = document.getElementById(id + 'Leg'), hs = P.hearts.length, fd = P.finds.length, bt = P.bottles.length;
      var zs = {}; P.zones.forEach(function (z) { [1, 4, 8, 16, 32, 64].forEach(function (b) { if (z.z & b) { zs[b] = 1; } }); });
      var L = [];
      L.push('<span><i class="lg heart"></i>' + (hs ? hs + ' coup' + (hs > 1 ? 's' : '') + ' reçu' + (hs > 1 ? 's' : '') : 'aucun coup reçu') + '</span>');
      L.push('<span><i class="lg gem"></i>' + fd + ' objet' + (fd > 1 ? 's' : '') + ' trouvé' + (fd > 1 ? 's' : '') + '</span>');
      L.push('<span><i class="lg drop"></i>' + bt + ' bouteille' + (bt > 1 ? 's' : '') + '</span>');
      if (P.cps.length) { L.push('<span><i class="lg flag"></i>points de contrôle</span>'); }
      if (P.stairs.length) { L.push('<span><i class="lg step"></i>marches</span>'); }
      if (P.trains.length) { L.push('<span><i class="lg train"></i>passage du train</span>'); }
      if (zs[1]) { L.push('<span><i class="lg z" style="background:#ffc450"></i>plein soleil</span>'); }
      if (zs[4]) { L.push('<span><i class="lg z" style="background:#f4f8ff"></i>neige</span>'); }
      if (zs[8]) { L.push('<span><i class="lg z" style="background:#cfd8e0"></i>brouillard</span>'); }
      if (zs[16]) { L.push('<span><i class="lg z" style="background:#8fe0e8"></i>vent</span>'); }
      if (zs[32]) { L.push('<span><i class="lg z" style="background:#a0d24a"></i>herbe mouillée</span>'); }
      if (zs[64]) { L.push('<span><i class="lg z" style="background:#6a80b0"></i>orage</span>'); }
      if (leg) { leg.innerHTML = L.join(''); }
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), dur = 1700;
      function frame(now) {
        if (!cv.isConnected) { return; }
        var t = reduce ? 1 : clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - t, 3);
        try { render(cv, P, o, e); } catch (err) { if (window.console) { console.warn('profil', err); } return; }
        if (t < 1) { requestAnimationFrame(frame); }
      }
      cv._redraw = function () { render(cv, P, o, 1); };
      requestAnimationFrame(frame);
    }
  };
})();
