/* Carte du monde (v0.2.6) : UNE grande bannière pixel-art (assets/map/<MAP.banner>.webp) + 6 pastilles « façon Mario » reliées par un
   sentier en pointillés. Tout ce qui dépend de l'image (fichier, taille, position des pastilles, tracé, cadrage) est dans data.js : MAP.
   L'image est mise à l'échelle UNE fois par taille d'écran (réduction en plusieurs passes, aucune lecture de pixels), puis déplacée
   en pixels d'écran entiers : le décor reste net et ne scintille pas pendant le défilement. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, A = window.Art, WORLDS = D.WORLDS;
  var COL = ['#f1c40f', '#1abc9c', '#9b59b6', '#e84393', '#e67e22', '#e74c3c', '#2d9cdb'];
  /* v0.5.3 : plusieurs mondes. WS[w] = état d'un monde (image, décor mis à l'échelle, sentier) ; W = monde affiché ; cw = son indice. */
  var WS = WORLDS.map(function (d) { return { d: d, rw: d.ref[0], rh: d.ref[1], img: null, ready: false, canvas: null, key: '', path: [] }; });
  var cw = 0, WD = WS[0], RW = WD.rw, RH = WD.rh, fade = 0;
  var img = null, ready = false, world = null, worldKey = '';   // (alias du monde affiché, voir useWorld)
  var PATH = [];                        // sentier dense [x,y] en unités ref du monde affiché
  var cam = { x: 0, target: 0, drag: null };
  var view = { w: 390, h: 844, dpr: 1, S: 1, y0: 0, ds: 1, camDev: 0 };
  var sel = 0, hk = { idx: 0, walkTo: null, dir: 1, moving: false, onArrive: null, t: 0, ph: 0, speed: 0 };
  var active = false, onOpen = null, time0 = 0, pulse = 0;

  /* ----- tracé : courbe de Catmull-Rom passant par les pastilles et les points intermédiaires de MAP.trail ----- */
  function worldOf(i) { return (LV[i].world || 1) - 1; }   // (levels2.js remplace les objets niveaux : `world` peut être absent => monde 1)
  function lvOf(w) { return WORLDS[w].levels; }
  function buildPath(w) {
    var d = WORLDS[w], ids = d.levels, pts = [], legStart = [];
    if (d.start) { pts.push([d.start[0], d.start[1]]); (d.lead || []).forEach(function (p) { pts.push([p[0], p[1]]); }); }
    ids.forEach(function (li, k) {
      var lv = LV[li]; legStart.push(pts.length); pts.push([lv.node.x, lv.node.y]);
      if (k < ids.length - 1 && d.trail && d.trail[k]) { d.trail[k].forEach(function (p) { pts.push([p[0], p[1]]); }); }
    });
    if (pts.length < 2) { pts.push([pts[0][0] + 1, pts[0][1]]); }
    var dense = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      var n = Math.max(6, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 2));
      for (var s = 0; s < n; s++) {
        var t = s / n, t2 = t * t, t3 = t2 * t;
        dense.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                    0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3), i]);
      }
    }
    dense.push([pts[pts.length - 1][0], pts[pts.length - 1][1], pts.length - 2]);
    // rééchantillonnage à pas constant (1,5 unité) -> marche régulière du randonneur et pointillés réguliers
    var PATH = [dense[0]]; var acc = 0, STEP = 1.5;
    for (var j = 1; j < dense.length; j++) {
      var a = dense[j - 1], b = dense[j], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (acc + d >= STEP) { var u = (STEP - acc) / d; a = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, b[2]]; PATH.push(a); d = Math.hypot(b[0] - a[0], b[1] - a[1]); acc = 0; }
      acc += d;
    }
    PATH.push(dense[dense.length - 1]);
    ids.forEach(function (li) {
      var lv = LV[li], best = 0, bd = 1e9;
      for (var q = 0; q < PATH.length; q++) { var dd = Math.hypot(PATH[q][0] - lv.node.x, PATH[q][1] - lv.node.y); if (dd < bd) { bd = dd; best = q; } }
      lv.node.idx = best;
    });
    WS[w].path = PATH;
  }

  function loadImage(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { rej(new Error('image ' + src)); }; i.src = src; }); }
  function imgSrc(n) { var m = window.__MAPIMG; return (m && m[n]) ? m[n] : 'assets/map/' + n + '.webp'; }
  function init() {
    WORLDS.forEach(function (d, w) { buildPath(w); });
    useWorld(cw);
    return Promise.all(WS.map(function (ws) { return loadImage(imgSrc(ws.d.banner)).then(function (i) { ws.img = i; ws.ready = true; }, function (e) { if (ws === WS[0]) { throw e; } ws.ready = false; }); })).then(function () { useWorld(cw); build(); });
  }
  /* le monde affiché : recopie son état dans les variables du module (img, ready, world, PATH…) */
  function useWorld(w) {
    if (WD) { WD.canvas = world; WD.key = worldKey; }
    cw = w; WD = WS[w]; RW = WD.rw; RH = WD.rh; img = WD.img; ready = WD.ready; world = WD.canvas; worldKey = WD.key; PATH = WD.path;
  }
  function worldUnlocked(w) { if (w <= 0) { return true; } var s = window.Save.get(); if (w === 1) { return !!(s.completed[6] || s.trainSeen); } if (w === 2) { return !!(s.completed[13] || s.paraSeen); } return false; }

  /* ----- état de progression ----- */
  function done(i) { return !!window.Save.get().completed[i + 1]; }
  function curIdx() { var lp = 0; LV.forEach(function (l, i) { if (l.playable) { lp = i; } }); return Math.max(0, Math.min(lp, window.Save.get().unlocked - 1)); }   // dernier niveau jouable débloqué
  function curIn(w) { var ids = lvOf(w), best = ids[0], c = curIdx(); ids.forEach(function (li) { if (li <= c && LV[li].playable) { best = li; } }); return best; }   // niveau « en cours » du monde w
  function nodeState(i) { if (!LV[i].playable || i >= window.Save.get().unlocked) { return 'locked'; } return done(i) ? 'done' : 'open'; }

  /* ----- fabrication du décor à l'échelle de l'écran (monde = ciel + image + forêt, hauteur d'écran) ----- */
  function stepScale(src, w, h) {
    var cw = src.naturalWidth || src.width, ch = src.naturalHeight || src.height, cur = src;
    while (cw / 2 > w * 1.25) {
      cw = Math.round(cw / 2); ch = Math.round(ch / 2);
      var t = document.createElement('canvas'); t.width = cw; t.height = ch; var c = t.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(cur, 0, 0, cw, ch); cur = t;
    }
    var o = document.createElement('canvas'); o.width = w; o.height = h; var oc = o.getContext('2d'); oc.imageSmoothingEnabled = true; oc.imageSmoothingQuality = 'high'; oc.drawImage(cur, 0, 0, w, h);
    return o;
  }
  /* chemin de terre pixel-art le long de PATH (départ → pastille) : cases de la grille de l'image, bord sombre, centre brun, lumière en haut */
  function dirtPath(c, ds, top, o) {
    var cs = Math.max(2, Math.round(o.u * ds)), base = (o.w * ds / 2) / cs, B = {}, O = {}, n = PATH.length, q, gx, gy, k, r, t, px, py, ro;
    for (q = 0; q < n; q += 1) {
      t = q / Math.max(1, n - 1); r = Math.max(0.95, base * (1.1 - 0.3 * t)); ro = r + 1;
      px = PATH[q][0] * ds / cs; py = (top + PATH[q][1] * ds) / cs;
      for (gx = Math.floor(px - ro); gx <= Math.ceil(px + ro); gx++) { for (gy = Math.floor(py - ro); gy <= Math.ceil(py + ro); gy++) {
        var d = Math.hypot(gx + 0.5 - px, (gy + 0.5 - py) * 1.25); k = gx * 100000 + gy;
        if (d <= r) { B[k] = 1; } else if (d <= ro) { O[k] = 1; }
      } }
    }
    var cells = function (set, fn) { for (var key in set) { if (set.hasOwnProperty(key)) { var v = +key, gx2 = Math.round(v / 100000), gy2 = v - gx2 * 100000; if (gy2 > 50000) { gy2 -= 100000; gx2 += 1; } fn(gx2, gy2); } } };
    cells(O, function (x, y) { if (!B[x * 100000 + y]) { c.fillStyle = 'rgba(70,40,20,.85)'; c.fillRect(x * cs, y * cs, cs, cs); } });
    cells(B, function (x, y) {
      var h = A.hash(x * 7 + y * 13, 91), up = !B[x * 100000 + (y - 1)], dn = !B[x * 100000 + (y + 1)];
      c.fillStyle = up ? '#d2a96c' : dn ? '#865a30' : (h < 0.3 ? '#a8783f' : h < 0.75 ? '#b98a50' : '#c29659');
      c.fillRect(x * cs, y * cs, cs, cs);
    });
  }

  /* Dégradé Jura (mêmes arrêts que la bannière peinte) : t=0.18 au bord haut de l'image, t plus petit au-dessus. */
  var JURA_SKY = [[0, 58, 110, 168], [0.22, 92, 145, 196], [0.42, 150, 186, 214], [0.62, 214, 214, 210], [0.80, 240, 206, 160], [1, 242, 196, 130]];
  function juraSkyRgb(t) {
    var s = JURA_SKY, i, u, a, b;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    for (i = 0; i < s.length - 1; i++) {
      if (t >= s[i][0] && t <= s[i + 1][0]) {
        u = (t - s[i][0]) / (s[i + 1][0] - s[i][0] + 1e-9);
        a = s[i]; b = s[i + 1];
        return [Math.round((1 - u) * a[1] + u * b[1]), Math.round((1 - u) * a[2] + u * b[2]), Math.round((1 - u) * a[3] + u * b[3])];
      }
    }
    return [s[s.length - 1][1], s[s.length - 1][2], s[s.length - 1][3]];
  }
  function fillJuraSkyMargin(c, iw, top, ds) {
    var span = 0.34 * 1344, t0 = 0.18, y, t, rgb, srcUp, row;
    var bayer = [0, 2, 3, 1];
    for (y = 0; y < top; y++) {
      srcUp = 3 * (top - y) / ds;
      t = t0 - 0.82 * srcUp / span;
      rgb = juraSkyRgb(t);
      /* léger dither 2×2, comme la bannière, pour la jointure */
      row = (y & 1) * 2;
      c.fillStyle = 'rgb(' + Math.max(0, Math.min(255, rgb[0] + ((bayer[row] / 4) - 0.375) * 5)) + ',' +
        Math.max(0, Math.min(255, rgb[1] + ((bayer[row] / 4) - 0.375) * 5)) + ',' +
        Math.max(0, Math.min(255, rgb[2] + ((bayer[row] / 4) - 0.375) * 5)) + ')';
      /* two-tone per even/odd x would need many fills; one tone per row is enough to join the banner */
      c.fillRect(0, y, iw, 1);
    }
  }
  function build() {
    if (!ready) { return; }
    var key = [cw, view.w, view.h, view.dpr, view.S, view.y0].join('|'); if (key === worldKey) { return; } worldKey = key;
    var ds = view.ds, iw = Math.round(RW * ds), ih = Math.round(RH * ds), hd = Math.round(view.h * view.dpr), top = Math.round(view.y0 * view.dpr), bot = top + ih;
    var cv = document.createElement('canvas'); cv.width = iw; cv.height = Math.max(hd, bot); var c = cv.getContext('2d');
    var pic = stepScale(img, iw, ih), i, x;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    // ciel : Jura (journée / golden hour) = dégradé doux, sans étirement des 2 px du haut (ça faisait le halo).
    // Autres mondes : première ligne étirée, puis assombrie vers le haut (inchangé).
    if (top > 0) {
      if (WD.d.banner === 'monde3') {
        fillJuraSkyMargin(c, iw, top, ds);
      } else {
        var t1 = document.createElement('canvas'); t1.width = 48; t1.height = 1; var t1c = t1.getContext('2d'); t1c.imageSmoothingEnabled = true; t1c.drawImage(pic, 0, 0, iw, 2, 0, 0, 48, 1);
        c.fillStyle = WD.d.sky; c.fillRect(0, 0, iw, top); c.drawImage(t1, 0, 0, 48, 1, 0, 0, iw, top);
        var g = c.createLinearGradient(0, 0, 0, top); g.addColorStop(0, 'rgba(6,8,30,.72)'); g.addColorStop(0.55, 'rgba(6,8,30,.28)'); g.addColorStop(1, 'rgba(6,8,30,0)'); c.fillStyle = g; c.fillRect(0, 0, iw, top);
      }
    }
    c.drawImage(pic, 0, top);
    if (WD.d.path) { dirtPath(c, ds, top, WD.d.path); }   // chemin de terre dessiné par le jeu (monde dont l'image n'a pas de chemin peint)
    // forêt sous l'image : dernières lignes étirées, assombries, puis silhouettes de sapins en gros pixels
    var below = cv.height - bot;
    if (below > 0) {
      var t2 = document.createElement('canvas'); t2.width = 48; t2.height = 1; var t2c = t2.getContext('2d'); t2c.imageSmoothingEnabled = true; t2c.drawImage(pic, 0, ih - 4, iw, 4, 0, 0, 48, 1);
      c.drawImage(t2, 0, 0, 48, 1, 0, bot, iw, below);
      c.fillStyle = WD.d.forest; var g2 = c.createLinearGradient(0, bot - Math.round(26 * view.dpr), 0, bot + Math.min(below, Math.round(90 * view.dpr)));
      g2.addColorStop(0, 'rgba(6,24,15,0)'); g2.addColorStop(0.45, 'rgba(6,24,15,.55)'); g2.addColorStop(1, 'rgba(6,24,15,.97)');
      c.fillStyle = g2; c.fillRect(0, bot - Math.round(26 * view.dpr), iw, Math.round(26 * view.dpr) + below);
      c.fillStyle = WD.d.forest; c.fillRect(0, bot + Math.round(90 * view.dpr), iw, Math.max(0, below - Math.round(90 * view.dpr)));
      var u = Math.max(2, Math.round(2 * ds));
      var pine = function (px, base, ph, hw, col) {
        var tp = base - ph; c.fillStyle = col;
        for (var yy = tp; yy < base; yy += u) { var k = (yy - tp) / ph, half = Math.max(u, Math.round(hw * (0.25 + 0.75 * k) / u) * u); c.fillRect(Math.round(px - half), yy, half * 2, u); }
        c.fillRect(Math.round(px - u / 2), base, u, u * 2);
      };
      for (x = -u * 3, i = 0; x < iw + u * 3; x += Math.round((7 + Math.floor(A.hash(i++, 21) * 8)) * ds)) { pine(x, bot + Math.round((16 + A.hash(i, 23) * 14) * ds), Math.round((22 + A.hash(i, 25) * 26) * ds), (9 + A.hash(i, 27) * 5) * ds, '#0b2b21'); }
      for (x = 0, i = 100; x < iw + u * 3; x += Math.round((9 + Math.floor(A.hash(i++, 31) * 11)) * ds)) { pine(x, bot + Math.round((44 + A.hash(i, 33) * 16) * ds), Math.round((26 + A.hash(i, 35) * 28) * ds), (11 + A.hash(i, 37) * 6) * ds, '#06180f'); }
    }
    world = cv;
  }

  /* ----- caméra / entrée ----- */
  function maxCam() { return Math.max(0, (RW * view.ds - view.w * view.dpr) / view.ds); }
  function clampCam(x) { return Math.max(0, Math.min(maxCam(), x)); }
  function signHalf() {
    /* demi-largeur de l'enseigne choisie (px de bannière), pour le cadrage */
    if (WD && WD.d && WD.d.signs && WD.d.signs.length) {
      var ids = lvOf(cw), i, s, b, half = 40;
      for (i = 0; i < WD.d.signs.length && i < ids.length; i++) {
        if (ids[i] === sel) {
          b = signBoxRef(WD.d.signs[i]);
          return b.w / 2 + 8;
        }
        b = signBoxRef(WD.d.signs[i]);
        half = Math.max(half, b.w / 2 + 8);
      }
      return half;
    }
    return 70;
  }
  function centreOn(rx, instant) {
    var vis = view.w / view.S, pad = signHalf();
    var camX = rx - vis / 2;
    /* le sommet choisi et son panneau restent entièrement visibles */
    var minC = (rx + pad) - vis, maxC = rx - pad;
    if (minC <= maxC) { camX = Math.max(minC, Math.min(maxC, camX)); }
    cam.target = clampCam(camX);
    if (instant) { cam.x = cam.target; }
  }
  function hikerPos() { return PATH[Math.max(0, Math.min(PATH.length - 1, Math.round(hk.idx)))]; }
  function R0() { return Math.max(18, Math.min(26, view.S * 17)); }

  function walkTo(i, cb) {
    var n = LV[i].node;
    if (Math.abs(n.idx - hk.idx) < 2) { hk.moving = false; hk.walkTo = null; hk.onArrive = null; if (cb) { cb(); } return; }
    hk.walkTo = n.idx; hk.onArrive = cb || null; hk.moving = true;
  }
  function select(i, open, noWalk) {
    i = Math.max(0, Math.min(LV.length - 1, i));
    var wi = worldOf(i);
    if (wi !== cw) { if (!worldUnlocked(wi)) { if (window.MapUI && window.MapUI.onLocked) { window.MapUI.onLocked(wi); } return; } setWorld(wi, i); noWalk = true; }
    var prev = sel; sel = i;
    if (window.MapUI) { window.MapUI.onSelect(sel); }
    if (open) { walkTo(sel, function () { if (onOpen) { onOpen(sel); } }); }
    else if (!noWalk) { walkTo(sel, null); if (sel !== prev && window.Sfx) { window.Sfx.play('ui'); } }
    if (!hk.moving) { centreOn(LV[sel].node.x); }
  }
  /* navigation géométrique : la pastille la plus proche dans la direction demandée */
  function navDir(dir) {
    var c = LV[sel].node, best = -1, bs = 1e9;
    lvOf(cw).forEach(function (i) {
      var lv = LV[i];
      if (i === sel) { return; }
      var dx = lv.node.x - c.x, dy = lv.node.y - c.y, pri, sec;
      if (dir === 'left') { pri = -dx; sec = Math.abs(dy); } else if (dir === 'right') { pri = dx; sec = Math.abs(dy); } else if (dir === 'up') { pri = -dy; sec = Math.abs(dx); } else { pri = dy; sec = Math.abs(dx); }
      if (pri < 12) { return; }
      var sc = pri + sec * 1.6; if (sc < bs) { bs = sc; best = i; }
    });
    if (best >= 0) { select(best, false); }
    else if (dir === 'left' || dir === 'right') {   // bord de la carte : on passe au monde voisin
      var w2 = cw + (dir === 'right' ? 1 : -1);
      if (w2 >= 0 && w2 < WORLDS.length) { if (switchWorld(dir === 'right' ? 1 : -1)) { return sel; } }
    }
    return best;
  }
  /* changement de monde (flèches, manette, bord de carte) : false si le monde est verrouillé / inexistant */
  function switchWorld(d) {
    var w2 = cw + d;
    if (w2 < 0 || w2 >= WORLDS.length) { return false; }
    if (!worldUnlocked(w2)) { if (window.MapUI && window.MapUI.onLocked) { window.MapUI.onLocked(w2); } return false; }
    setWorld(w2, null); if (window.Sfx) { window.Sfx.play('ui'); } return true;
  }
  /* affiche le monde w : cadrage, décor, randonneur à son poste, pastille choisie (to = niveau à sélectionner, sinon le niveau en cours) */
  function setWorld(w, to) {
    useWorld(w); layout(); build(); trimOthers();
    var cur = to != null ? to : curIn(w);
    hk.idx = WORLDS[w].start && cur === lvOf(w)[0] && !LV[cur].playable ? 0 : LV[cur].node.idx; hk.walkTo = null; hk.moving = false; hk.onArrive = null; hk.dir = 1;
    sel = cur; fade = 1; fw = null;
    frame(); cam.drag = null;
    window.Save.get().world = w + 1; window.Save.commit();
    if (window.Sfx && Sfx.setWorld) { Sfx.setWorld(w + 1); }
    if (window.MapUI) { window.MapUI.onSelect(sel); if (window.MapUI.onWorld) { window.MapUI.onWorld(w); } }
  }
  function hikerPosX() { return hikerPos()[0]; }
  /* cadrage à l'arrivée : sur le randonneur, ou entre lui et la pastille choisie si les deux tiennent à l'écran (monde 2 : départ → sommet) */
  function frame() {
    var hx = hikerPos()[0], nx = LV[sel].node.x, vis = view.w / view.S;
    var focus = (Math.abs(nx - hx) + 80 < vis) ? (hx + nx) / 2 : hx;
    /* à un bord, on profite de la marge pour ne pas couper le panneau voisin si ça tient */
    centreOn(focus, true);
    var pad = signHalf(), minC = (nx + pad) - vis, maxC = nx - pad;
    if (minC <= maxC) {
      var neigh = lvOf(cw), i, best = cam.x, score = 1e9;
      for (i = 0; i < neigh.length; i++) {
        var x = LV[neigh[i]].node.x;
        if (Math.abs(x - nx) < 8) { continue; }
        var L = x - pad, R = x + pad;
        /* si le panneau voisin dépasse un peu, glisser pour l'inclure tant que le sommet choisi reste entier */
        if (L < cam.x && R > cam.x && L >= minC) {
          var c2 = clampCam(L);
          if (c2 >= minC && c2 <= maxC && (cam.x - c2) < score) { best = c2; score = cam.x - c2; }
        }
        if (R > cam.x + vis && L < cam.x + vis && R <= maxC + vis) {
          var c3 = clampCam(R - vis);
          if (c3 >= minC && c3 <= maxC && (c3 - cam.x) < score) { best = c3; score = c3 - cam.x; }
        }
      }
      cam.x = best; cam.target = best;
    }
  }

  function nodeAt(px, py) {
    var best = -1, bd = 1e9, S = view.S, hit = Math.max(28, R0() * 1.5);
    lvOf(cw).forEach(function (i) {
      var lv = LV[i], p = toScreen(lv.node.x, lv.node.y), d = Math.hypot(p[0] - px, p[1] - py);
      if (d < hit && d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function toScreen(rx, ry) { return [rx * view.ds / view.dpr - view.camDev / view.dpr, view.y0 + ry * view.S]; }

  window.addEventListener('keydown', function () { if (fw && fw.t > 0.5) { fwSkip(); } });   // (délai : la touche qui vient de quitter l'écran de victoire ne doit pas les couper)
  function bind(canvas) {
    canvas.addEventListener('pointerdown', function (e) {
      if (!active) { return; }
      fwSkip();
      cam.drag = { x: e.clientX, y: e.clientY, cx: cam.x, moved: false, id: e.pointerId };
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      var d = cam.drag; if (!active || !d || d.id !== e.pointerId) { return; }
      var dx = e.clientX - d.x; if (Math.abs(dx) > 8 || Math.abs(e.clientY - d.y) > 8) { d.moved = true; }
      if (d.moved) { cam.x = clampCam(d.cx - dx / view.S); cam.target = cam.x; }
    });
    function up(e) {
      var d = cam.drag; if (!active || !d || d.id !== e.pointerId) { return; }
      cam.drag = null;
      if (!d.moved) { var i = nodeAt(e.clientX, e.clientY); if (i >= 0) { select(i, false); setTimeout(function () { select(i, true); }, 130); } }   // délai : le « click » synthétique du doigt ne doit pas retomber sur la fiche qui vient de s’ouvrir
    }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', function () { cam.drag = null; });
    canvas.addEventListener('wheel', function (e) { if (!active) { return; } e.preventDefault(); cam.target = clampCam(cam.target + (e.deltaX || e.deltaY) / view.S); cam.x = cam.target; }, { passive: false });
  }

  /* ----- boucle ----- */
  function update(dt) {
    fwUpdate(dt); if (fade > 0) { fade = Math.max(0, fade - dt / 0.38); }
    if (!ready) { return; }
    if (hk.moving && hk.walkTo != null) {
      var dirn = hk.walkTo > hk.idx ? 1 : -1, rem = Math.abs(hk.walkTo - hk.idx), sp = Math.min(300, 110 + rem * 0.9);   // points/s (1 point = 1,5 unité) : accélère sur les longs trajets
      hk.dir = (PATH[Math.min(PATH.length - 1, Math.max(0, Math.round(hk.idx + dirn * 6)))][0] >= hikerPos()[0]) ? 1 : -1;
      hk.idx += dirn * Math.min(rem, sp * dt); hk.t += dt; hk.ph += dt * 6.4;
      if (rem <= 0.6 || (dirn > 0 && hk.idx >= hk.walkTo) || (dirn < 0 && hk.idx <= hk.walkTo)) {
        hk.idx = hk.walkTo; hk.walkTo = null; hk.moving = false; var cb = hk.onArrive; hk.onArrive = null; if (cb) { cb(); }
      }
      if (hk.moving && !cam.drag) { centreOn(hikerPos()[0]); }
    }
    if (!cam.drag) { cam.x += (cam.target - cam.x) * Math.min(1, dt * 6); if (Math.abs(cam.target - cam.x) < 0.05) { cam.x = cam.target; } }
  }


  /* ----- feux d'artifice pixel-art (v0.2.8) : au retour sur la carte après un niveau validé (première réussite ou meilleur score),
     des fusées partent de la pastille du niveau et éclatent en gerbes de carrés de pixels. Son + vibration légère ; un toucher,
     une touche ou un bouton de manette les interrompt. Les positions sont relatives à la pastille : ils suivent le défilement. */
  var fw = null;
  var FWC = [['#ffd34d', '#fff3b0', '#ff8f2d'], ['#ff5fa8', '#ffc2e0', '#d11f6b'], ['#5fd0ff', '#c8f2ff', '#2f78e8'], ['#7dff8a', '#d6ffd9', '#22b04a'], ['#c78bff', '#ecd6ff', '#7a3fd6'], ['#ffffff', '#ffe9b0', '#ffb347']];
  function fwStart(i) { fw = { node: i, t: -0.25, shots: [], parts: [], n: 0, N: 8, next: 0, glow: [], rmb: 0 }; }
  function fwSkip() { fw = null; }
  function fwBurst(s, R) {
    var pal = FWC[s.ci], n = s.kind === 'star' ? 36 : s.kind === 'ring' ? 28 : 40, k, V = R * (5.2 + Math.random() * 2.6);
    for (k = 0; k < n; k++) {
      var a = (k / n) * Math.PI * 2 + (s.kind === 'ring' ? 0 : Math.random() * 0.3), sp = s.kind === 'ring' ? V : s.kind === 'star' ? V * (k % 2 ? 0.55 : 1) : V * (0.35 + Math.random() * 0.75);
      fw.parts.push({ x: s.tx, y: s.ty, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.9 + Math.random() * 0.5, max: 1.3, c0: pal[0], c1: pal[1], c2: pal[2], tw: Math.random() });
    }
    for (k = 0; k < 14; k++) {   // cœur plus clair et plus lent
      var a2 = Math.random() * Math.PI * 2, s2 = V * (0.12 + Math.random() * 0.3);
      fw.parts.push({ x: s.tx, y: s.ty, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2, life: 0.6 + Math.random() * 0.4, max: 1.0, c0: pal[1], c1: '#ffffff', c2: pal[0], tw: Math.random() });
    }
    fw.glow.push({ x: s.tx, y: s.ty, t: 0, col: pal[0] });
    if (window.Sfx) { Sfx.play('fw_burst'); if (Math.random() < 0.7) { Sfx.play('fw_crackle'); } }
    if (window.Input && fw.rmb < 3) { fw.rmb++; Input.rumble('fwb'); }
  }
  function fwUpdate(dt) {
    if (!fw) { return; }
    var R = R0(); fw.t += dt; if (fw.t < 0) { return; }
    if (fw.n < fw.N && fw.t >= fw.next) {
      var side = (fw.n % 2 ? 1 : -1) * (0.4 + Math.random() * 2.6), tx = side * R, ty = -R * (3.2 + Math.random() * 2.6);
      fw.shots.push({ x: (Math.random() - 0.5) * R * 0.5, y: -R * 0.5, tx: tx, ty: ty, t: 0, dur: 0.5 + Math.random() * 0.2, ci: (fw.n + ((Math.random() * 3) | 0)) % FWC.length, kind: ['sphere', 'ring', 'star', 'sphere'][fw.n % 4], tr: [] });
      fw.n++; fw.next = fw.t + 0.3 + Math.random() * 0.25; if (window.Sfx) { Sfx.play('fw_launch'); } if (window.Input) { Input.rumble('fw'); }
    }
    for (var i = fw.shots.length - 1; i >= 0; i--) {
      var s = fw.shots[i]; s.t += dt; var u = Math.min(1, s.t / s.dur), e = 1 - (1 - u) * (1 - u), cx = s.x + (s.tx - s.x) * e + Math.sin(s.t * 30) * 0.5, cy = s.y + (s.ty - s.y) * e;
      s.px = cx; s.py = cy; s.tr.push([cx, cy, 0.35]); if (s.tr.length > 9) { s.tr.shift(); }
      if (u >= 1) { fwBurst(s, R); fw.shots.splice(i, 1); }
    }
    for (var j = fw.parts.length - 1; j >= 0; j--) {
      var p = fw.parts[j]; p.life -= dt; if (p.life <= 0) { fw.parts.splice(j, 1); continue; }
      var dr = Math.exp(-2.3 * dt); p.vx *= dr; p.vy = p.vy * dr + R * 1.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (var g = fw.glow.length - 1; g >= 0; g--) { fw.glow[g].t += dt; if (fw.glow[g].t > 0.28) { fw.glow.splice(g, 1); } }
    if (fw.n >= fw.N && !fw.shots.length && !fw.parts.length) { fw = null; }
    // manette : n'importe quel bouton interrompt
    if (!fw || fw.t < 0.6) { return; }
    try { var gp = navigator.getGamepads ? navigator.getGamepads() : []; for (var q = 0; q < gp.length; q++) { if (gp[q] && gp[q].buttons.some(function (b) { return b.pressed; })) { fwSkip(); } } } catch (e) { /* pas de manette */ }
  }
  function fwDraw(c, time) {
    if (!fw || fw.t < 0) { return; }
    var R = R0(), np = toScreen(LV[fw.node].node.x, LV[fw.node].node.y), px = Math.max(3, Math.round(view.S * 3)), q = function (v) { return Math.round(v / px) * px; }, i, j;
    c.save(); c.globalCompositeOperation = 'lighter';
    fw.glow.forEach(function (g) { var a = 0.22 * (1 - g.t / 0.28), r = R * 2.2, gr = c.createRadialGradient(np[0] + g.x, np[1] + g.y, 0, np[0] + g.x, np[1] + g.y, r); gr.addColorStop(0, A.rgba(g.col, a)); gr.addColorStop(1, A.rgba(g.col, 0)); c.fillStyle = gr; c.fillRect(np[0] + g.x - r, np[1] + g.y - r, r * 2, r * 2); });
    c.restore();
    for (i = 0; i < fw.shots.length; i++) {      // fusées : traînée de carrés qui s'éteignent
      var s = fw.shots[i];
      for (j = 0; j < s.tr.length; j++) { var t = s.tr[j], al = (j + 1) / s.tr.length; c.fillStyle = 'rgba(255,' + (200 + ((al * 55) | 0)) + ',140,' + (0.25 + al * 0.6).toFixed(2) + ')'; var sz = al > 0.7 ? px : Math.max(1, px - 1); c.fillRect(q(np[0] + t[0]), q(np[1] + t[1]), sz, sz); }
      c.fillStyle = '#fff6d0'; c.fillRect(q(np[0] + s.px), q(np[1] + s.py), px, px);
    }
    for (i = 0; i < fw.parts.length; i++) {      // étincelles : carrés de pixels, du clair au foncé en fin de vie
      var p = fw.parts[i], f = p.life / p.max; if (f < 0.3 && ((time / 60 + p.tw * 9) | 0) % 2) { continue; }
      c.fillStyle = f > 0.62 ? p.c1 : f > 0.3 ? p.c0 : p.c2; var ps = f > 0.22 ? px : Math.max(2, px >> 1);
      c.fillRect(q(np[0] + p.x), q(np[1] + p.y), ps, ps);
    }
  }

  /* ----- dessin ----- */
  function wrapPix(c, text, maxW, font) {
    c.font = font;
    if (!text) { return []; }
    if (c.measureText(text).width <= maxW) { return [text]; }
    var words = String(text).split(' '), lines = [], cur = '', i, trial;
    for (i = 0; i < words.length; i++) {
      trial = cur ? cur + ' ' + words[i] : words[i];
      if (c.measureText(trial).width <= maxW) { cur = trial; }
      else {
        if (cur) { lines.push(cur); }
        cur = words[i];
        if (c.measureText(cur).width > maxW) {
          /* mot trop long : on coupe avec une ellipse */
          var s = cur;
          while (s.length > 1 && c.measureText(s + '…').width > maxW) { s = s.slice(0, -1); }
          lines.push(s + '…'); cur = '';
        }
      }
    }
    if (cur) { lines.push(cur); }
    return lines;
  }
  function pill(c, lines, x, y, W) {
    var maxW = Math.max(80, W - 24), titleFont = '9px "Press Start 2P", monospace', subFont = '7px "Press Start 2P", monospace';
    var title = lines[0] || '', sub = lines[1] || '';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    var titleLines = wrapPix(c, title, maxW - 24, titleFont);
    if (titleLines.length > 1) {
      /* titre : une seule ligne, ellipse si besoin */
      c.font = titleFont;
      var s = title;
      while (s.length > 1 && c.measureText(s + '…').width > maxW - 24) { s = s.slice(0, -1); }
      titleLines = [s + (s === title ? '' : '…')];
    }
    var subLines = sub ? wrapPix(c, sub, maxW - 24, subFont) : [];
    if (subLines.length > 2) {
      c.font = subFont;
      var last = subLines[1], cut = last;
      while (cut.length > 1 && c.measureText(cut + '…').width > maxW - 24) { cut = cut.slice(0, -1); }
      subLines = [subLines[0], cut + '…'];
    }
    var all = titleLines.concat(subLines), w = 0, k;
    all.forEach(function (tx, i) {
      c.font = (i < titleLines.length ? titleFont : subFont);
      w = Math.max(w, c.measureText(tx).width);
    });
    w = Math.min(maxW, w + 24);
    var nSub = subLines.length, h = 22 + (titleLines.length > 0 ? 4 : 0) + nSub * 12;
    if (!nSub) { h = 26; }
    x = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, x));
    c.save(); c.shadowColor = 'rgba(20,8,40,.5)'; c.shadowBlur = 12; c.shadowOffsetY = 3;
    c.beginPath(); A.rrect(c, x - w / 2, y - h / 2, w, h, 12); c.fillStyle = A.grad(c, 0, y - h / 2, 0, y + h / 2, [0, '#fffaf0', 1, '#f0e4cc']); c.fill(); c.restore();
    c.beginPath(); A.rrect(c, x - w / 2, y - h / 2, w, h, 12); c.lineWidth = 2; c.strokeStyle = '#2a1a5e'; c.stroke();
    var yy = y - h / 2 + (nSub ? 14 : h / 2);
    c.font = titleFont; c.fillStyle = '#2a1a5e'; c.fillText(titleLines[0], x, yy);
    for (k = 0; k < subLines.length; k++) {
      c.font = subFont; c.fillStyle = '#6b4a8f';
      c.fillText(subLines[k], x, yy + 14 + k * 12);
    }
  }
  function starShape(c, x, y, r, on) {
    c.save(); c.beginPath(); for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath();
    c.lineJoin = 'round'; c.lineWidth = Math.max(1.5, r * 0.32); c.strokeStyle = '#1a1230'; c.stroke(); c.fillStyle = on ? '#ffd34d' : '#5a5470'; c.fill(); c.restore();
  }
  function medallion(c, x, y, R, i, st, cur, time, isSel) {
    var col = COL[i % COL.length];
    if (st === 'open' || isSel) {
      var pr = R * (1.6 + (cur || isSel ? 0.1 * Math.sin(time / 300) : 0)), g = c.createRadialGradient(x, y, R * 0.6, x, y, pr);
      g.addColorStop(0, st === 'open' ? 'rgba(255,236,140,.75)' : 'rgba(210,225,255,.5)'); g.addColorStop(1, 'rgba(255,236,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, pr, 0, 7); c.fill();
    }
    c.save(); c.shadowColor = 'rgba(15,6,30,.6)'; c.shadowBlur = 10; c.shadowOffsetY = 3;
    c.beginPath(); c.arc(x, y, R, 0, 7); c.fillStyle = '#1a1230'; c.fill(); c.restore();
    var base = st === 'locked' ? '#8a90a4' : col;
    c.beginPath(); c.arc(x, y, R * 0.84, 0, 7); c.fillStyle = A.grad(c, x, y - R, x, y + R, [0, A.mix(base, '#ffffff', 0.4), 0.5, base, 1, A.mix(base, '#000000', 0.35)]); c.fill();
    c.lineWidth = Math.max(1.5, R * 0.1); c.strokeStyle = isSel ? '#ffd34d' : 'rgba(255,255,255,.55)'; c.stroke();
    c.beginPath(); c.ellipse(x - R * 0.2, y - R * 0.45, R * 0.42, R * 0.2, -0.4, 0, 7); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill();
    if (st === 'locked') {
      c.fillStyle = '#3a3e52'; c.beginPath(); A.rrect(c, x - R * 0.32, y - R * 0.05, R * 0.64, R * 0.5, 2); c.fill();
      c.beginPath(); c.arc(x, y - R * 0.08, R * 0.24, Math.PI, 0); c.lineWidth = R * 0.12; c.strokeStyle = '#3a3e52'; c.stroke();
    } else if (st === 'done') {
      c.beginPath(); c.moveTo(x - R * 0.36, y + R * 0.02); c.lineTo(x - R * 0.1, y + R * 0.3); c.lineTo(x + R * 0.4, y - R * 0.3); c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = R * 0.2; c.strokeStyle = '#fff'; c.stroke();
    } else {
      c.font = Math.round(R * 0.8) + 'px "Press Start 2P", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1a1230'; c.fillText(String(i + 1), x + R * 0.05, y + R * 0.08);
    }
    if (st === 'locked') {   // petit numéro en pastille d'angle (le cadenas remplace le chiffre)
      c.font = Math.round(R * 0.5) + 'px "Press Start 2P", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1a1230'; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.lineJoin = 'round';
      c.strokeText(String(i + 1), x, y - R * 1.35); c.fillText(String(i + 1), x, y - R * 1.35);
    }
    if (st === 'done') {
      var ns = window.Save.starsOf(i + 1), rec = window.Save.get().completed[i + 1];
      if (ns) { for (var q = 0; q < 3; q++) { starShape(c, x + (q - 1) * R * 0.62, y + R * 1.22 + (q === 1 ? 0 : R * 0.1), R * 0.3, q < ns); } }
      if (rec && rec.time != null) {
        var tot = Math.max(0, rec.time), mm = Math.floor(tot / 60), ss = Math.round(tot % 60); if (ss === 60) { mm += 1; ss = 0; }
        var ts = mm + ':' + (ss < 10 ? '0' : '') + ss;
        var ty = y + R * 1.22 + R * 0.62;
        c.font = Math.max(6, Math.round(R * 0.36)) + 'px "Press Start 2P", monospace';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = 'rgba(26,18,48,.9)';
        c.strokeText(ts, x, ty); c.fillStyle = '#ffe9a8'; c.fillText(ts, x, ty);
      }
    }
  }
  function mapHiker(c, x, y, k) {
    A.drawHiker(c, { x: x, y: y, face: hk.dir, t: hk.t + time0 / 1000, phase: hk.ph, move: hk.moving ? 1 : 0, air: false, vy: 0, sq: 0, hurt: 0, drink: 0, cele: 0, slope: 0, scale: k, stride: 5.0, char: window.Save.get().character || 'boy', shadow: true });
  }


  function signLines(s) { return [s[2], s[3]].filter(Boolean); }
  function signLines(s) {
    var raw = String(s[2] || ''), title, parts;
    if (raw.indexOf('|') >= 0) {
      return raw.split('|').map(function (p) { return p.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    }
    title = raw.replace(/\s+/g, ' ').trim();
    if (title.length > 10 && title.indexOf(' ') >= 0) {
      parts = title.split(' ');
      if (parts.length === 2) { return parts; }
      if (parts.length === 3 && (parts[1] === 'DE' || parts[1] === 'DU' || parts[1] === 'LA' || parts[1] === 'LE')) {
        return [parts[0], parts[1] + ' ' + parts[2]];
      }
      if (parts.length >= 4 && parts[1] === 'DE' && parts[2] === 'LA') {
        return [parts[0] + ' ' + parts[1], parts[2] + ' ' + parts[3]];
      }
      return [parts[0], parts.slice(1).join(' ')];
    }
    return [title];
  }
  function signBoxRef(s) {
    /* Mesures W2 à 461 (LA RHUNE / ARTZAMENDI) : planche 28 px, cap 11 px,
       cadre 2–3 px, poteau 8 px. Avec S_port ≈ 1.235 : 23 / 9 / 2 / 6.5 ref.
       Longs titres sur 2 lignes pour garder ce corps. */
    var lines = signLines(s);
    var font = 9, padX = 7, maxW = 112, minW = 58;
    var longest = lines.reduce(function (m, l) { return Math.max(m, l.length); }, 0);
    var w = padX * 2 + longest * font;
    if (w > maxW) { font = Math.max(8, (maxW - padX * 2) / Math.max(1, longest)); w = maxW; }
    if (w < minW) { w = minW; }
    var h = lines.length > 1 ? 34 : 23;
    return { x: s[0], y: s[1], w: w, h: h, post: 17, titleLines: lines, font: font };
  }
  function signFullyVisible(box, W, Hh) {
    var p = toScreen(box.x, box.y);
    var sx = view.S;
    var hw = box.w * sx / 2, hh = box.h * sx / 2;
    var top = p[1] - hh, bot = p[1] + hh + box.post * sx * 0.4;
    var left = p[0] - hw, right = p[0] + hw;
    var m = 3;
    return left >= m && right <= W - m && top >= m && bot <= Hh - m;
  }
  function drawWoodenSign(c, s, S) {
    var box = signBoxRef(s), p = toScreen(box.x, box.y);
    var x = p[0], y = p[1], w = box.w * S, h = box.h * S, post = box.post * S;
    var rad = Math.max(1.2, S * 0.9);
    /* cadre et liseré aux épaisseurs mesurées sur LA RHUNE (2–3 px et ~2 px à 461) */
    var frame = Math.max(2, S * 2.0);
    var inner = Math.max(1.5, S * 1.2);
    var inset = frame + inner;
    c.save();
    /* poteau : 8 px de large à 461 (LA RHUNE / ARTZAMENDI), filet clair */
    var pw = Math.max(5, S * 6.5);
    c.fillStyle = '#3e2316';
    c.fillRect(x - pw / 2, y + h / 2 - 1, pw, post);
    c.fillStyle = '#765431';
    c.fillRect(x - pw / 2 + Math.max(1.2, S * 1.6), y + h / 2 - 1, Math.max(1.6, S * 2.2), post);
    /* cadre brun foncé, liseré crème, panneau tan (monde2.webp) */
    c.fillStyle = '#3e2316';
    c.beginPath(); A.rrect(c, x - w / 2, y - h / 2, w, h, rad); c.fill();
    c.fillStyle = '#e4c8a0';
    c.beginPath(); A.rrect(c, x - w / 2 + frame, y - h / 2 + frame, w - frame * 2, h - frame * 2, Math.max(0.8, rad * 0.7)); c.fill();
    c.fillStyle = '#9a7450';
    c.beginPath(); A.rrect(c, x - w / 2 + inset, y - h / 2 + inset, w - inset * 2, h - inset * 2, Math.max(0.6, rad * 0.55)); c.fill();
    c.fillStyle = '#b08960';
    c.fillRect(x - w / 2 + inset, y - h / 2 + inset, w - inset * 2, Math.max(1, S * 1.0));
    /* titre gras, cap 11 px à 461, qui remplit la planche comme ARTZAMENDI */
    var lines = box.titleLines || [''], li;
    var titlePx = Math.max(8, Math.round(box.font * S));
    var padX = Math.max(3, S * 3.0), innerW = w - inset * 2 - padX * 2, tw, sc;
    c.font = titlePx + 'px "Press Start 2P", monospace';
    tw = 0;
    for (li = 0; li < lines.length; li++) { tw = Math.max(tw, c.measureText(lines[li]).width); }
    if (innerW > 8 && tw > innerW) {
      titlePx = Math.max(8, Math.floor(titlePx * innerW / tw));
      c.font = titlePx + 'px "Press Start 2P", monospace';
    }
    var lineGap = Math.round(titlePx * 1.22);
    var block = titlePx + (lines.length - 1) * lineGap;
    var y0 = y - (block - titlePx) / 2;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (li = 0; li < lines.length; li++) {
      c.fillStyle = 'rgba(20,8,0,0.4)';
      c.fillText(lines[li], x + 1, y0 + li * lineGap + 1);
      c.fillStyle = '#0f0000';
      c.fillText(lines[li], x, y0 + li * lineGap);
    }
    c.restore();
  }
  function drawWorldSigns(c, W, Hh) {
    var signs = WD && WD.d && WD.d.signs, i, s, box, ids, k, selSign = null;
    if (!signs || !signs.length) { return; }
    ids = lvOf(cw);
    for (i = 0; i < signs.length && i < ids.length; i++) {
      s = signs[i]; box = signBoxRef(s);
      if (ids[i] === sel) { selSign = s; }
      if (!signFullyVisible(box, W, Hh)) { continue; }
      drawWoodenSign(c, s, view.S);
    }
    /* le sommet choisi : son enseigne est cadrée pour tenir, on la dessine même en bord si besoin */
    if (selSign) {
      box = signBoxRef(selSign);
      if (!signFullyVisible(box, W, Hh)) {
        /* ne pas dessiner une enseigne coupée : le cadre (centreOn) doit déjà la garder entière.
           Si malgré tout elle dépasse (premier / dernier sommet très au bord), on ne la dessine pas. */
      }
    }
  }

  function draw(c, time) {
    var W = view.w, Hh = view.h, S = view.S, dpr = view.dpr; time0 = time;
    c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = false;
    c.fillStyle = WD.d.forest; c.fillRect(0, 0, canvasW(c), canvasH(c));
    if (!ready || !world) { return; }
    view.camDev = Math.round(cam.x * view.ds);
    c.drawImage(world, view.camDev, 0, Math.min(world.width - view.camDev, canvasW(c)), Math.min(world.height, canvasH(c)), 0, 0, Math.min(world.width - view.camDev, canvasW(c)), Math.min(world.height, canvasH(c)));
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // étoiles : mondes 1-2 seulement (le Jura est un ciel de jour, pas de scintillement)
    var y0 = view.y0;
    if (WD.d.banner !== 'monde3') {
      for (var st = 0; st < 60 && y0 > 12; st++) {
        var stx = (A.hash(st, 70) * (W + 600) - cam.x * S * 0.04) % (W + 600); if (stx < 0) { stx += W + 600; } stx = Math.round(stx - 300); var sty = Math.round(A.hash(st, 71) * (y0 - 8));
        var al = 0.3 + 0.55 * Math.abs(Math.sin(time / 900 + st * 1.7)); c.fillStyle = 'rgba(255,244,205,' + al.toFixed(2) + ')'; var big = A.hash(st, 72) > 0.8 ? 2 : 1.5; c.fillRect(stx, sty, big, big);
      }
    }
    // (v0.2.9) plus de sentier en pointillés ajouté : le chemin de terre est peint dans la bannière elle-même ; le randonneur suit la courbe invisible PATH
    drawWorldSigns(c, W, Hh);
    var R = R0(), hp = hikerPos(), hs = toScreen(hp[0], hp[1]), hkh = R * 3.2;
    for (var ii = 0; ii < lvOf(cw).length; ii++) {
      var i = lvOf(cw)[ii], np = toScreen(LV[i].node.x, LV[i].node.y); if (np[0] < -50 || np[0] > W + 50) { continue; }
      var stt = nodeState(i);
      medallion(c, np[0], np[1], R * (i === sel ? 1.12 : 1), i, stt, (stt === 'open' && i === curIdx()), time, i === sel);
    }
    // randonneur : se tient sur la pastille quand il est arrêté dessus
    var near = 1e9; lvOf(cw).forEach(function (li) { var q = toScreen(LV[li].node.x, LV[li].node.y); near = Math.min(near, Math.hypot(q[0] - hs[0], q[1] - hs[1])); });
    var lift = R * 0.55 * Math.max(0, Math.min(1, 1 - near / (R * 2.2)));
    mapHiker(c, hs[0], hs[1] - lift, R * 0.108);
    fwDraw(c, time);
    // étiquette de la pastille choisie
    var sn = LV[sel], sp = toScreen(sn.node.x, sn.node.y), hereSel = Math.hypot(sp[0] - hs[0], sp[1] - hs[1]) < R * 0.6;
    var below = WD.d.label === 'below', lockedSel = nodeState(sel) === 'locked', doneSel = nodeState(sel) === 'done';
    var recOff = (doneSel && window.Save.get().completed[sel + 1] && window.Save.get().completed[sel + 1].time != null) ? R * 0.7 : 0;
    var ly = below ? sp[1] + R * 1.5 + (lockedSel ? 24 : 6) + (sn.route ? 21 : 14) + recOff : sp[1] - R * 1.7 - (hereSel ? hkh * 0.95 : 0) - 14 - (bob(time) );
    if (sp[0] > -80 && sp[0] < W + 80) {
      var sub = sn.mapRoute || sn.route;
      pill(c, [(sel + 1) + ' · ' + sn.name].concat(sub ? [sub] : []), sp[0], below ? ly : ly - (sub ? 6 : 0), W);
      if (lockedSel) {   // « Bientôt » (pas encore de niveau) ou « Verrouillé » (niveau prêt, à débloquer)
        var lockTxt = sn.playable ? 'VERROUILLÉ' : 'BIENTÔT';
        c.font = '7px "Press Start 2P", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; var tw = c.measureText(lockTxt).width + 14, ty = sp[1] + R * 1.5;
        c.beginPath(); A.rrect(c, sp[0] - tw / 2, ty - 9, tw, 18, 9); c.fillStyle = 'rgba(26,18,48,.88)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#ffd34d'; c.stroke(); c.fillStyle = '#ffe9a8'; c.fillText(lockTxt, sp[0], ty + 1);
      }
    }
    if (fade > 0) { c.fillStyle = 'rgba(10,8,30,' + (fade * fade * 0.9).toFixed(3) + ')'; c.fillRect(0, 0, W, Hh); }   // fondu d'arrivée d'un monde
    if (WD.d.banner !== 'monde3') {
      var vg = c.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.45, W / 2, Hh / 2, Math.max(W, Hh) * 0.85); vg.addColorStop(0, 'rgba(20,8,40,0)'); vg.addColorStop(1, 'rgba(20,8,40,.28)'); c.fillStyle = vg; c.fillRect(0, 0, W, Hh);
    }
  }
  function bob(t) { return Math.sin(t / 260) * 2; }
  function canvasW(c) { return c.canvas.width; }
  function canvasH(c) { return c.canvas.height; }

  function resize(w, h, dpr) { view.w = w; view.h = h; view.dpr = dpr; layout(); if (!active) { return; } build(); if (active) { cam.target = clampCam(cam.target); cam.x = clampCam(cam.x); if (hk.moving) { centreOn(hikerPos()[0], true); } else { frame(); } } }
  function layout() {
    var w = view.w, h = view.h, dpr = view.dpr, port = w < h, v = WD.d.view;
    view.S = port ? h * v.fill.port / RH : Math.max(w / RW, h * v.fill.land / RH);
    view.S = Math.ceil(view.S * 1000) / 1000;
    view.ds = view.S * dpr;
    var y0 = h * (port ? v.bottom.port : v.bottom.land) - RH * view.S;
    if (v.keep) { y0 = Math.max(y0, h * v.keep.min - v.keep.y * view.S); }   // keep : la ligne ref `y` (pastille) reste visible : au moins `min` × hauteur d'écran depuis le haut (petits écrans paysage)
    view.y0 = Math.round(y0 * dpr) / dpr;
  }

  /* v0.5.4 : libération mémoire (canevas des décors de chaque monde) ; ils sont reconstruits à l'entrée suivante sur la carte */
  function release() { WS.forEach(function (ws) { ws.canvas = null; ws.key = ''; }); world = null; worldKey = ''; }
  function trimOthers() { WS.forEach(function (ws) { if (ws !== WD) { ws.canvas = null; ws.key = ''; } }); }

  window.MapScreen = {
    release: release, init: init, bind: bind, update: update, draw: draw, resize: resize,
    isReady: function () { return ready; },
    levelCount: function () { return LV.length; },
    selected: function () { return sel; },
    nav: function (d) { select(sel + d, false); },
    switchWorld: switchWorld,
    world: function () { return cw; },
    worldCount: function () { return WORLDS.length; },
    worldUnlocked: worldUnlocked,
    navDir: navDir,
    select: function (i) { select(i, false); },
    jumpTo: function (i) { select(i, false, true); if (LV[i] && LV[i].node) { hk.idx = LV[i].node.idx; hk.moving = false; hk.walkTo = null; hk.onArrive = null; } frame(); },
    openSelected: function () { setTimeout(function () { select(sel, true, true); }, 90); },   // léger délai : la touche Entrée qui ouvre la fiche ne doit pas « cliquer » aussitôt son bouton Grimper
    onOpen: function (f) { onOpen = f; },
    /* entrée sur la carte : place le randonneur sur le dernier niveau débloqué, ou anime la marche vers le nouveau niveau */
    enter: function (opts) {
      active = true; opts = opts || {};
      // monde affiché : demandé (opts.world, 0-based) ; sinon le monde du niveau dont on revient (walkFrom / feux) ; sinon le dernier monde enregistré
      var srcLv = opts.walkFrom != null ? opts.walkFrom : (opts.fireworks != null ? opts.fireworks : null);
      var wantW = opts.world != null ? opts.world : (srcLv != null ? worldOf(srcLv) : Math.max(0, (window.Save.get().world || 1) - 1));
      if (wantW >= WORLDS.length || !worldUnlocked(wantW)) { wantW = 0; }
      if (wantW !== cw) { useWorld(wantW); }
      layout(); build(); trimOthers();
      var cur = curIn(cw);
      var from = opts.walkFrom != null && worldOf(opts.walkFrom) === cw ? opts.walkFrom : cur;
      if (opts.walkFrom != null && from !== opts.walkFrom) { opts.walkFrom = null; }
      fade = opts.fade ? 1 : 0; hk.idx = (WD.d.start && !LV[from].playable) ? 0 : LV[from].node.idx; hk.walkTo = null; hk.moving = false; hk.dir = 1;
      sel = cur; frame();
      if (window.MapUI) { window.MapUI.onSelect(sel); if (window.MapUI.onWorld) { window.MapUI.onWorld(cw); } }
      fw = null; if (opts.fireworks != null && LV[opts.fireworks]) { centreOn(LV[opts.fireworks].node.x, true); fwStart(opts.fireworks); }
      if (opts.walkFrom != null && opts.walkFrom !== cur) { setTimeout(function () { hk.walkTo = LV[cur].node.idx; hk.moving = true; hk.onArrive = null; }, opts.fireworks != null ? 2300 : 600); }
    },
    leave: function () { active = false; hk.moving = false; fw = null; },
    skipFireworks: fwSkip, fireworksActive: function () { return !!fw; }, burst: function (i) { if (i == null) { i = sel; } if (LV[i]) { centreOn(LV[i].node.x, false); fwStart(i); } },
    isActive: function () { return active; },
    worldIndex: function () { return cw; },
    _debug: function () { return { cam: cam, view: view, hk: hk, sel: sel, pathLen: PATH.length, cw: cw, world: world ? [world.width, world.height] : null } ; }
  };
})();
