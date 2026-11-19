/* Niveau jouable : escalade en vue de côté, rendu vectoriel haute résolution.
   Dangers : chutes (vides) et pierres qui dévalent la pente (à enjamber d'un saut) ; jauge d'eau. */
(function () {
  'use strict';
  var D = window.AscensionData, A = window.Art, PAL = A.PAL, clamp = A.clamp, lerp = A.lerp, sstep = A.sstep, mix = A.mix, rgba = A.rgba, hash = A.hash;

  var SPEED = 84, ACCEL = 900, GRAV = 620, JUMP_V = -195, STEP_UP = 7, COYOTE = 0.1, BUFFER = 0.12, INVULN = 1.6, JUMP_CUT_F = 0.415;
  var TRAIN_L = 232, NPC_V = 90, npcLook = false;           // longueur du train (3 éléments), vitesse de marche des autres randonneurs
  var BASE_Y = 1000, HSC = 1.2;           // échelle du randonneur à l'écran
  var CRATER_X = 4340;                       // début de la paroi interne du cratère (après le sommet)
  var TH = null, THEMES = {}, EV = {};      // thème de niveau (décor + palettes, js/pariou.js) et environnement exposé aux thèmes

  var L = null, P = null, W = null, state = 'idle', frozen = false, cb = {}, cam = { x: 0, y: 0 };
  var G, GF, TYPE, PITY, LOOK, len = 0, ZN, FOGD, fwS = 0.36, RAIL, LEDGE;
  var Z_SUN = 1, Z_SHADE = 2, Z_SNOW = 4, Z_FOG = 8, Z_WIND = 16, Z_WET = 32, Z_STORM = 64, Z_SLIP = 128;
  var wind = { st: 'calm', t: 0, str: 0, warn: 0, on: false };
  var STAIR_DRAIN = 1.4;                     // v0.4.0 : les marches fatiguent (jauge d'eau ×1,4) mais l'appui est franc (aucune glissade)
  var feat = null, rocks = [], warns = [], parts = [], rockTimer = 2, fade = 0, fadeDir = 0, pendingRespawn = false, zoneNow = -1, rockCount = 0;
  var hintQ = [], hintShown = null, hintT = 0, hintsTrig = {}, time = 0, clock = 0, shake = 0, wonT = 0, zoom = 1, zoomOv = null, lookOv = null, frameDt = 1 / 60;
  var snap = false, curVw = 135, curVh = 292, curW = 390, curH = 844, S0 = 2.9, Sc = 2.9, DPR = 1;
  var summitFired = false, vistaMode = false, stats = null, lastCp = null, hudLast = '', motes = null, tile = null, tilePat = null, tileKey = '', cutShadeImg = null, cutGrainA = 0.8;
  var trailOn = false, rec = null, recGhost = null, recMaxX = 30, trailHudT = 0, ghostNow = null;
  function vh0() { return curVh; }

  /* ---------- construction du terrain ---------- */
  function build(level) {
    var pcs = level.play.pieces, x = 0, y = BASE_Y, total = 0, i, EXT = Math.max(level.play.ext || 0, 900), pendC = [], lastStart = 0;
    pcs.forEach(function (p) { total += p.len; });
    len = total + EXT + 40;
    G = new Float32Array(len + 2); TYPE = new Uint8Array(len + 2); PITY = new Float32Array(len + 2); ZN = new Uint8Array(len + 2); FOGD = new Float32Array(len + 2); LOOK = new Uint8Array(len + 2);
    feat = { cps: [{ x: 30, y: BASE_Y, id: 0 }], bottles: [], zones: [], hints: [], summitX: 0, summitY: 0, gaps: [], stairs: [], total: total, boulders: [], finds: [], crumbs: [], trains: [], npcs: [], gates: [], railSp: [], herds: [], raptors: [], bats: [], pebbles: [], cables: [] };
    var pendB = [], pendF = [];
    pcs.forEach(function (p) {
      var y0 = y, n = p.len, ty = p.t === 'stairs' ? 1 : p.summit ? 2 : 0;
      if (p.t === 'gap') {
        for (i = 0; i < n; i++) { G[x + i] = Infinity; PITY[x + i] = y0 + 110; }
        feat.gaps.push({ x0: x, x1: x + n, y: y0 });
      } else {
        var rise = p.rise || 0, stepW = 12, steps = Math.max(1, Math.floor(n / stepW));
        for (i = 0; i < n; i++) {
          var yy;
          if (p.t === 'stairs') { yy = y0 - Math.round(Math.min(steps, Math.floor(i / stepW) + 1) * rise / steps); }
          else { yy = y0 - rise * (i / n); }
          G[x + i] = yy; TYPE[x + i] = ty;
        }
        y = y0 - rise;
        if (p.t === 'stairs') { feat.stairs.push({ x0: x, x1: x + n }); }
        if (p.rail && p.t !== 'stairs' && p.t !== 'gap') { feat.railSp.push([x, x + n, typeof p.rail === 'number' ? p.rail : 8]); }
        if (p.train && p.t !== 'stairs') { var tcx = Math.round(x + n * (p.train.f == null ? 0.5 : p.train.f)), tw = Math.round((p.train.w || 46) / 2); feat.trains.push({ cx: tcx, x0: tcx - tw, x1: tcx + tw, trig: p.train.trig || 150, warn: p.train.warn || 2.6, spd: p.train.speed || 150, state: 'clear', t: 0, u: 0, g: 0, armed: true, tx: tcx + 9000, len: TRAIN_L, hit: false, seed: tcx, xl: tcx - 30, xr: tcx + 30 }); }
        // sol qui s'effrite (érosion) : bande de largeur w centrée à la fraction f de la pièce (jamais sur les marches)
        if (p.crumb && p.t !== 'stairs') { p.crumb.forEach(function (cr) { var a0 = Math.round(x + n * cr.f - cr.w / 2); pendC.push({ x0: a0, x1: a0 + cr.w, fall: cr.fall, npc: !!cr.npc, slab: !!cr.slab }); }); }
      }
      if (p.zone) {
        var zs = String(p.zone).split(/[ ,]+/), zm = 0; zs.forEach(function (zk) { zm |= zk === 'sun' ? Z_SUN : zk === 'shade' ? Z_SHADE : zk === 'snow' ? Z_SNOW : zk === 'fog' ? Z_FOG : zk === 'wind' ? Z_WIND : zk === 'wet' ? Z_WET : zk === 'slip' ? (Z_WET | Z_SLIP) : zk === 'storm' ? (Z_WIND | Z_STORM) : 0; });
        var fd = p.fog == null ? [0.6, 0.6] : (typeof p.fog === 'number' ? [p.fog, p.fog] : p.fog);
        for (i = 0; i < n; i++) { ZN[x + i] |= zm; if (zm & Z_FOG) { FOGD[x + i] = fd[0] + (fd[1] - fd[0]) * (i / Math.max(1, n - 1)); } }
      }
      if (p.look === 'ridge') { for (i = 0; i < n; i++) LOOK[x + i] = 2; }
      else if (p.look === 'flank') { for (i = 0; i < n; i++) LOOK[x + i] = 1; }
      if (p.cp) { feat.cps.push({ x: x + 22, y: G[x + 22], id: feat.cps.length }); }
      if (p.bottle != null) {
        var air = false, fr = p.bottle; if (typeof fr === 'string') { air = true; fr = parseFloat(fr.split(':')[1]); }
        var bx = Math.round(x + n * fr); feat.bottles.push({ x: bx, y: G[bx] - (air ? 30 : 12), taken: false, id: feat.bottles.length });
      }
      if (p.boulders && p.t !== 'gap' && p.t !== 'stairs') { p.boulders.forEach(function (f, bi) { pendB.push({ x: Math.round(x + n * f), seed: 31 + pendB.length * 17 + bi }); }); }
      if (p.find) { p.find.forEach(function (f) { pendF.push({ id: f.id, x: Math.round(x + n * f.f) }); }); }
      if (p.rocks) { feat.zones.push({ x0: x + 10, x1: x + n - 10, min: p.rocks[0], max: p.rocks[1] }); }
      if (p.cable) { feat.cables.push({ x0: x, x1: x + n }); }
      if (p.hint) {
        var lead = (p.hint === 'gap' || p.hint === 'rocks' || p.hint === 'bottle' || p.hint === 'crumble' || p.hint === 'train' || p.hint === 'hikers' || p.hint === 'snow' || p.hint === 'wind' || p.hint === 'fog' || p.hint === 'sun' || p.hint === 'plates' || p.hint === 'wet' || p.hint === 'pottoks' || p.hint === 'pebbles' || p.hint === 'storm' || p.hint === 'bats' || p.hint === 'karst' || p.hint === 'boars' || p.hint === 'sheep' || p.hint === 'cows' || p.hint === 'scramble' || p.hint === 'lapiaz' || p.hint === 'chamois' || p.hint === 'tetra' || p.hint === 'lynx' || p.hint === 'doline' || p.hint === 'bouquetin' || p.hint === 'cliff' || p.hint === 'cirque' || p.hint === 'lacets') ? 110 : 0;
        var hintObj = { x: Math.max(0, x - lead), id: p.hint, text: level.play.hints[p.hint] };
        if (p.hint === 'start') { hintObj.until = x + n; }
        feat.hints.push(hintObj);
      }
      if (p.summit) { feat.summitX = x + 90; feat.summitY = G[x + 90]; feat.summitStart = x; }
      if (window.Fauna) { Fauna.parsePiece(p, x, n, feat); if (p.t !== 'gap') { Fauna.punchKarst(p, x, n, feat, G, PITY, TYPE, len); } }
      lastStart = x; x += n;
    });
    /* l'après-sommet reprend le look de la dernière pièce (crête aérienne sur l'Orhy) */
    var lkTail = LOOK[Math.max(0, x - 1)] || 0;
    if (lkTail) { for (i = x; i <= len; i++) LOOK[i] = lkTail; }
    // rochers fixes : jamais au bord d'un vide, ni sur les escaliers / le sommet (on doit pouvoir prendre son élan et retomber)
    pendB.forEach(function (b) {
      var ok = TYPE[b.x] === 0 && isFinite(G[b.x]);
      feat.gaps.forEach(function (gp) { if (b.x > gp.x0 - 55 && b.x < gp.x1 + 55) { ok = false; } });
      pendC.forEach(function (gp) { if (b.x > gp.x0 - 55 && b.x < gp.x1 + 55) { ok = false; } });
      feat.cps.forEach(function (cp) { if (Math.abs(cp.x - b.x) < 24) { ok = false; } });
      feat.trains.forEach(function (tr) { if (Math.abs(tr.cx - b.x) < 100) { ok = false; } });
      if (ok) { feat.boulders.push({ x: b.x, hw: 9.5, h: 13.5, seed: b.seed, bump: 0 }); }
    });
    feat.boulders.forEach(function (b, bi) { if (bi === 0) { feat.hints.push({ x: Math.max(0, b.x - 60), id: 'boulder', text: level.play.hints.boulder, prio: true }); } });
    pendF.forEach(function (f) { feat.finds.push({ id: f.id, x: f.x, y: G[f.x] - 34, got: false, ph: f.x * 0.37 }); });
    var endPieces = x, top = G[endPieces - 1], dropH = 44, cr = W.crater, CX;
    /* Jamais de trou G=0 après le dernier morceau : ça dressait un mur de terre jusqu'en haut de l'écran. */
    if (cr && cr.kind === 'plain') { CX = feat.summitX + (cr.at || 130); dropH = cr.drop || 0; }
    else if (cr) { CX = lastStart + (cr.at || 150); dropH = cr.drop || 0; }
    else { CX = endPieces; dropH = 0; cr = { kind: 'plain' }; }
    if (!(CX >= endPieces && CX < len)) { CX = endPieces; if (!cr || cr.kind !== 'round') { cr = { kind: 'plain' }; dropH = 0; } }
    for (i = endPieces; i < CX && i < len + 2; i++) { G[i] = top + Math.sin((i - endPieces) * 0.17) * 0.4; TYPE[i] = 2; PITY[i] = 0; }
    /* cratère : paroi interne, fond de l'entonnoir, puis brèche (coulée de lave / cheire) vers le sud
       (cuvette ronde si `crater.kind === 'round'` : paroi, fond plat, paroi opposée, puis flanc extérieur).
       kind === 'plain' : plateau puis versant qui redescend, assez long pour que le bout du monde reste hors champ. */
    for (i = CX; i < len + 2; i++) {
      var d = i - CX, yy2;
      if (cr && cr.kind === 'plain') {                       // v0.4.0 : sommet sans cratère (Mary, Dôme, Sancy) : plateau sommital qui retombe doucement
        yy2 = top + Math.min(d, 90) * 0.04 + Math.max(0, d - 90) * 0.2 + Math.sin(d * 0.21) * 0.5 + Math.sin(d * 0.07) * 0.9; G[i] = yy2; TYPE[i] = 2; PITY[i] = 0; continue;
      }
      if (cr && cr.kind === 'round') {
        var wl = cr.wall, fl2 = cr.floor;
        if (d < wl) { yy2 = top + dropH * (0.5 - 0.5 * Math.cos(Math.PI * d / wl)); }
        else if (d < wl + fl2) { yy2 = top + dropH + Math.sin(d * 0.21) * 0.6 + Math.sin(d * 0.07) * 1.2; }
        else if (d < 2 * wl + fl2) { yy2 = top + dropH * (0.5 + 0.5 * Math.cos(Math.PI * (d - wl - fl2) / wl)) - 4 * Math.sin(Math.PI * (d - wl - fl2) / wl); }
        else { yy2 = top - 4 + (d - 2 * wl - fl2) * 0.16 + Math.sin(d * 0.13) * 1.2; }
      }
      else if (d < 62) { yy2 = top + dropH * sstep(0, 62, d); }
      else if (d < 135) { yy2 = top + dropH + Math.sin(d * 0.21) * 0.6; }
      else { yy2 = top + dropH + (d - 135) * 0.075 + Math.sin(d * 0.37) * 1.1 + Math.sin(d * 0.11) * 1.6; }
      G[i] = yy2; TYPE[i] = 3; PITY[i] = 0;
    }
    feat.topY = top; feat.rimX = CX; feat.craterFloor = top + dropH;
    // sol qui s'effrite : on mémorise la hauteur d'origine pour pouvoir le reconstruire à chaque réapparition
    pendC.forEach(function (q) {
      var c0 = { fall: q.fall || (W.crumble && W.crumble.fall) || 0.8, x0: q.x0, x1: q.x1, state: 'solid', t: 0, ft: 0, gy: [], y0: 0, seed: q.x0 };
      for (var k = q.x0; k < q.x1; k++) { c0.gy.push(G[k]); TYPE[k] = 4; c0.y0 = Math.max(c0.y0, G[k]); }
      c0.npc = q.npc; c0.slab = q.slab; feat.crumbs.push(c0);
      if (q.npc) { feat.npcs.push({ q: c0, st: 'wait', x: 0, y: 0, ph: 0, face: -1, ch: feat.npcs.length, bub: 0, seed: q.x0 }); }
    });
    feat.trains.forEach(function (tr) { var k; for (k = tr.x0 - 3; k <= tr.x1 + 3; k++) { if (TYPE[k] === 0) { TYPE[k] = 6; } } });
    /* v0.4.1 — voie ferrée (crémaillère) : RAIL[x] = 1 là où la voie est dessinée, LEDGE[x] = hauteur du remblai sous les rails (0 = au niveau du sol, au passage à niveau).
       La voie suit TOUJOURS le terrain (remblai posé sur le sol) ; elle s'interrompt sur les marches, les gouffres et le sol qui s'effrite. */
    RAIL = new Uint8Array(len + 2); LEDGE = new Float32Array(len + 2);
    var okRail = function (k) { return k > 0 && k < len && isFinite(G[k]) && TYPE[k] !== 1 && TYPE[k] !== 4 && TYPE[k] !== 3 && TYPE[k] !== 2; };
    feat.railSp.forEach(function (sp) { for (var k = sp[0]; k < sp[1]; k++) { if (okRail(k)) { RAIL[k] = 1; LEDGE[k] = sp[2]; } } });
    feat.trains.forEach(function (tr) {
      var k; tr.xl = tr.cx; tr.xr = tr.cx;
      for (k = tr.cx; k > tr.cx - 620 && okRail(k - 1); k--) { tr.xl = k - 1; }
      for (k = tr.cx; k < tr.cx + 620 && okRail(k + 1); k++) { tr.xr = k + 1; }
      for (k = tr.xl; k <= tr.xr; k++) { RAIL[k] = 1; if (!LEDGE[k]) { LEDGE[k] = 6; } }
    });
    feat.trains.forEach(function (tr) { for (var k = tr.cx - 190; k <= tr.cx + 190; k++) { if (RAIL[k]) { LEDGE[k] *= sstep(24, 175, Math.abs(k - tr.cx)); } } });
    // les extrémités de chaque tronçon de voie s'enfoncent dans le sol (le remblai ne se termine jamais en falaise)
    (function () { var k = 1; while (k < len) { if (!RAIL[k]) { k++; continue; } var a0 = k; while (k < len && RAIL[k]) { k++; } var b0 = k - 1; for (var q = a0; q <= b0; q++) { LEDGE[q] *= Math.min(sstep(0, 90, q - a0), sstep(0, 90, b0 - q)); } } })();
    // GF : profil du sol « comblé » au-dessus des gouffres (interpolation entre les deux bords) pour les décors
    GF = new Float32Array(len + 2);
    for (i = 0; i < len + 2; i++) { GF[i] = G[i]; }
    feat.gaps.forEach(function (gp) {
      var a = G[gp.x0 - 1], b = G[gp.x1]; if (!isFinite(a)) { a = gp.y; } if (!isFinite(b)) { b = a; }
      for (var k = gp.x0; k < gp.x1; k++) { GF[k] = a + (b - a) * (k - gp.x0) / Math.max(1, gp.x1 - gp.x0); }
    });
  }

  function zoneAt(px) { px = px | 0; return px < 0 || px > len ? 0 : ZN[px]; }
  function fogAt(px) { px = px | 0; return px < 0 || px > len ? 0 : FOGD[px]; }
  function onStairs(px) { return TYPE[px | 0] === 1; }
  function gAt(px) { px = px | 0; if (px < 0) { return -1e6; } if (px > len) { return -1e6; } return G[px]; }
  /* hauteur d'un rocher fixe en px (0 si aucun) : dôme à flancs raides */
  function bAt(px) {
    var bs = feat.boulders, i, d;
    for (i = 0; i < bs.length; i++) { d = Math.abs(px - bs[i].x); if (d < bs[i].hw) { return bs[i].h * Math.sqrt(1 - (d / bs[i].hw) * (d / bs[i].hw)); } }
    return 0;
  }
  function solid(px) { var g = gAt(px); return g === Infinity ? g : g - bAt(px); }
  function under(px) { return Math.min(solid(px - 3), solid(px + 3)); }
  function altTopOf() { return L.altitudeEnd || L.altitude; }
  function altOf(y) { return Math.round(L.altitudeStart + Math.max(0, Math.min(1, (BASE_Y - y) / (BASE_Y - feat.topY))) * (altTopOf() - L.altitudeStart)); }
  function slopeAt(px) { var a = gAt(px - 5), b = gAt(px + 5); if (!isFinite(a) || !isFinite(b) || a < -1e5 || b < -1e5) { return 0; } return (b - a) / 10; }

  /* ---------- cycle de vie ---------- */
  function recPush(force) {
    if (!rec || !P) { return; }
    if (!force && rec.last >= 0 && clock - rec.last < 0.08) { return; }
    rec.last = clock;
    rec.samples.push({ t: clock, x: P.x, y: P.y, face: P.face, air: P.onGround ? 0 : 1, move: P.onGround ? Math.min(1, Math.abs(P.vx) / (SPEED || 80)) : 0.3, vy: P.vy || 0 });
    if (P.x > recMaxX) { recMaxX = P.x; }
  }
  function start(level, opts) {
    invalidateGfx(); FL = null; slideToasted = false; opts = opts || {};
    L = level; W = level.play; TH = THEMES[W.theme] || null; PL = (TH && TH.pal) || DEFPAL; build(level);
    stats = { time: 0, falls: 0, hits: 0, bottles: 0, jumps: 0, waterLeft: 0, finds: 0, bottlesTotal: feat.bottles.length, crumbled: 0, track: [], hitsAt: [], findsAt: [], bottlesAt: [], cpsAt: [], trail: !!opts.trail };
    P = { x: 30, y: G[30], vx: 0, vy: 0, onGround: true, face: 1, coyote: 0, buf: 0, inv: 0, stun: 0, lives: W.lives, water: W.water.start, thirst: 0, ph: 0, sq: 0, sqv: 0, drinkT: 0, hurtT: 0, slope: 0, stepN: 0, wasAir: false, bumpT: 0, kb: 0, kbMin: 0, jumpCutDone: false };
    lastCp = { x: 30, y: G[30], id: 0, bottles: [], water: W.water.start };
    trailOn = !!opts.trail; recMaxX = 30; trailHudT = 0; ghostNow = null;
    rec = { t: 0, c: (window.Save && Save.get().character) || 'boy', last: -1, samples: [] };
    recGhost = trailOn && window.Save ? Save.ghostOf(L.number) : null;
    rocks = []; warns = []; parts = []; hintQ = []; hintShown = null; hintsTrig = {}; clock = 0; wind = { st: 'calm', t: 0, str: 0, warn: 0, on: false }; trk = { x: -1, n: 0 }; rockTimer = 2; zoneNow = -1; rockCount = 0; fade = 0; fadeDir = 0; pendingRespawn = false; shake = 0; wonT = 0; zoom = 1; zoomOv = null; lookOv = null;
    feat.bottles.forEach(function (b) { b.taken = false; });
    var fnd = window.Save.foundOf(L.number); feat.finds.forEach(function (f) { f.got = !!fnd[f.id]; }); summitFired = false; vistaMode = false;
    cam.x = 0; cam.y = P.y - vh0() * 0.64; state = 'play'; frozen = false; hudLast = ''; snap = true;
    recPush(true); syncEnv(); if (cb.onStart) { cb.onStart(); }
  }

  function seen(id) { return !!window.Save.get().hintsSeen[id]; }
  function queueHint(h) {
    if (hintsTrig[h.id]) { return; } hintsTrig[h.id] = true;
    if (seen(h.id)) { return; }
    if (h.prio) { hintQ.unshift(h); if (hintShown) { hintShown = null; hintT = 0; if (cb.onHint) { cb.onHint(null); } } } else { hintQ.push(h); }
  }
  function updateHints(dt) {
    if (state === "won") { return; }
    if (clock > 0.5) { feat.hints.forEach(function (h) { if (P.x >= h.x) { queueHint(h); } }); }
    /* Bulle de départ : la retirer dès qu'on quitte le plat initial (évite qu'elle reste affichée en milieu de niveau). */
    if (hintShown && hintShown.id === 'start' && hintShown.until != null && P.x > hintShown.until) {
      hintShown = null; hintT = 0; if (cb.onHint) { cb.onHint(null); }
    }
    if (hintShown) { hintT -= dt; if (hintT <= 0) { hintShown = null; if (cb.onHint) { cb.onHint(null); } } }
    if (!hintShown && hintQ.length) {
      hintShown = hintQ.shift(); hintT = 4.6; window.Save.get().hintsSeen[hintShown.id] = true; window.Save.commit();
      if (cb.onHint) { cb.onHint(hintShown.text, hintShown.id); }
    }
  }

  /* ---------- particules ---------- */
  function emit(o) { if (parts.length > 420) { parts.shift(); } parts.push(o); return o; }
  function dust(x, y, n, col, spread, up) {
    for (var i = 0; i < n; i++) {
      emit({ k: 'dust', x: x + (Math.random() - 0.5) * (spread || 4), y: y - 0.5, vx: (Math.random() - 0.5) * 26, vy: -(up == null ? 8 : up) * (0.4 + Math.random()), g: -4, life: 0.5 + Math.random() * 0.45, max: 0.95, s0: 1.2 + Math.random(), s1: 4 + Math.random() * 3, col: col || '#c9a27a', a: 0.55 });
    }
  }
  function chunks(x, y, n, spd, big) {
    var cols = ['#3b2a31', '#6b2f24', '#241a20', '#8a4430', '#5a4448'];
    for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, s = (0.4 + Math.random()) * (spd || 70); emit({ k: 'chunk', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 520, life: 0.6 + Math.random() * 0.5, max: 1.1, s0: (big ? 1.6 : 1) * (0.9 + Math.random() * 1.1), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 16, col: cols[i % cols.length] }); }
  }
  function burst(x, y, n, cols, spd, kind) {
    for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, s = (0.3 + Math.random()) * (spd || 60); emit({ k: kind || 'spark', x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, g: 260, life: 0.45 + Math.random() * 0.4, max: 0.85, s0: 0.7 + Math.random() * 0.8, col: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 }); }
  }

  function rum(k) { if (window.Input && Input.rumble) { Input.rumble(k); } }
  /* coup de pierre : projeté nettement en arrière (vers le bas de la pente) avec un léger saut ; la limite « kbMin » (bord du dernier vide
     + marge) garantit qu'on n'est jamais rejeté dans un gouffre. Étourdissement bref + invulnérabilité. */
  function knockback() {
    var kmin = 8, x = P.x;
    feat.gaps.concat(feat.crumbs).forEach(function (gp) { if (gp.x1 <= x + 2 && gp.x1 + 16 > kmin) { kmin = gp.x1 + 16; } });
    var room = Math.max(0, x - kmin), dist = Math.min(88, room), T = 2 * 150 / GRAV;
    P.vy = -150; P.vx = -(dist / (T + 0.1)); if (dist < 10) { P.vx = -dist; }
    P.kb = 1.2; P.kbMin = kmin; P.onGround = false;
  }
  function hurt(kind) {
    if (P.inv > 0 || state !== 'play') { return; }
    stats.hits++; P.lives--; P.inv = INVULN; P.hurtT = 0.5; P.stun = 0.55; shake = 0.3;
    stats.hitsAt.push({ x: P.x, y: P.y, kind: kind });
    if (kind === 'rock' || kind === 'pottok' || kind === 'boar' || kind === 'sheep' || kind === 'pebble') { knockback(); } else if (kind === 'train') { var trh = feat.trains.filter(function (t) { return P.x >= t.x0 - 70 && P.x <= t.x1 + 70; })[0]; P.x = trh ? trh.x0 - 26 : P.x - 40; P.vx = 0; P.vy = -90; P.onGround = false; } else { P.vx = 0; P.vy = -90; P.onGround = false; }
    window.Sfx && Sfx.play('hit'); if (window.Sfx) { Sfx.play('heart'); } rum('hit'); burst(P.x, P.y - 12, 9, ['#ff5a6e', '#ffd34d', '#fff'], 70);
    if (P.lives <= 0) { startRespawn('Plus de vie ! Retour au point de contrôle.'); }
    else if (cb.onToast) { cb.onToast(kind === 'rock' ? 'Aïe ! Une pierre !' : kind === 'train' ? 'Aïe ! Le train du Panoramique !' : kind === 'pottok' ? 'Aïe ! Laisse le pottok passer !' : kind === 'boar' ? 'Aïe ! Un sanglier !' : kind === 'sheep' ? 'Aïe ! Laisse la brebis passer !' : kind === 'pebble' ? 'Aïe ! Un caillou lâché par un rapace !' : 'Aïe ! Tu es à bout d\u2019eau !'); }
  }

  function startRespawn(msg) {
    if (state === 'dying') { return; }
    state = 'dying'; fadeDir = 1; pendingRespawn = true; if (cb.onToast) { cb.onToast(msg); }
  }
  function respawn() {
    var cp = lastCp, outLives = P.lives <= 0;
    P.x = cp.x; P.y = G[cp.x | 0]; P.vx = P.vy = 0; P.onGround = true; P.inv = INVULN; P.stun = 0; P.sq = 0; P.sqv = 0; P.jumpCutDone = false;
    if (outLives) { P.lives = W.lives; } else if (P.lives < 1) { P.lives = 1; }
    P.water = Math.max(P.water, 35); P.thirst = 0;
    feat.bottles.forEach(function (b) { b.taken = cp.bottles.indexOf(b.id) >= 0; });
    crumbReset(); feat.trains.forEach(trainReset); feat.npcs.forEach(function (n) { n.st = 'wait'; }); if (window.Fauna) { Fauna.reset(feat); } rocks = []; warns = []; zoneNow = -1; wind.t = 0; wind.str = 0; cam.x = Math.max(0, P.x - 100); cam.y = P.y - vh0() * 0.64; state = 'play'; fadeDir = -1; snap = true;
  }

  /* ---------- mise à jour ---------- */
  function updatePlayer(dt) {
    var I = window.Input.state, ax = (I.right ? 1 : 0) - (I.left ? 1 : 0), sp = SPEED * (P.water <= 0 ? 0.6 : 1);
    if (P.stun > 0) { P.stun -= dt; ax = 0; if (P.onGround) { P.vx *= Math.exp(-dt * 10); } }
    if (P.kb > 0) { P.kb -= dt; }
    var zn = zoneAt(P.x), stairs = P.onGround && onStairs(P.x), snowy = (zn & Z_SNOW) && P.onGround && !stairs, wet = (zn & Z_WET) && P.onGround && !stairs && !snowy, slip = wet && (zn & Z_SLIP), hw = windFx();
    if (hw > 0) { sp *= 1 - (W.windPush ? 0.38 : 0.3) * hw; }
    if (snowy) { sp *= 0.93; } else if (slip) { sp *= 0.84; } else if (wet) { sp *= 0.96; }
    var target = ax * sp;
    if (P.stun <= 0) {
      if (snowy || wet) {
        // NEIGE (ou herbe mouillée). Sur l'Orhy, zone « slip » : pente en dévers qui ramène vers le bas
        // si l'on s'arrête ou si l'on fonce — le mouillé simple des autres niveaux reste inchangé.
        var sl0 = slopeAt(P.x), accK = snowy ? 0.13 : (slip ? 0.22 : 0.2);
        var run = slip && ax && Math.abs(P.vx) > 54;
        /* slip : avancer d'un pas régulier grimpe encore ; s'arrêter ou foncer ramène vers le bas. */
        var slideF = snowy ? 300 : (slip ? (ax ? (run ? 360 : 210) : 540) : 200);
        if (run) { accK = 0.12; }
        if (ax) { P.vx += Math.max(-ACCEL * accK * dt, Math.min(ACCEL * accK * dt, target - (ax > 0 ? 14 * hw : 0) - P.vx)); }
        else { P.vx *= Math.exp(-dt * (snowy ? 0.75 : (slip ? 0.48 : 1.15))); }
        P.vx += sl0 * slideF * dt;
        if (snowy && hw > 0 && !ax) { P.vx -= 9 * hw * dt; }
        P.sliding = Math.abs(P.vx) > (slip ? 12 : (wet ? 16 : 14)) && (!ax || ax * P.vx < 0 || Math.abs(P.vx) > sp + 6);
      } else {
        P.vx += Math.max(-ACCEL * dt, Math.min(ACCEL * dt, target - P.vx)); P.sliding = false;
        if (hw > 0) {
          if (!P.onGround) { P.vx -= (W.windPush ? 145 : 105) * hw * dt; }
          else if (W.windPush) { P.vx -= 88 * hw * dt; }
        }
      }
    }
    if (ax) { P.face = ax; }
    // saut
    if (I.jumpPressed) { P.buf = BUFFER; I.jumpPressed = false; } else { P.buf -= dt; }
    if (P.onGround) { P.coyote = COYOTE; } else { P.coyote -= dt; }
    if (P.buf > 0 && P.coyote > 0 && P.stun <= 0) {
      P.vy = JUMP_V; P.onGround = false; P.coyote = 0; P.buf = 0; P.jumpCutDone = false; window.Sfx && Sfx.play('jump'); P.sq = -0.7; P.sqv = 0; dust(P.x, P.y, 4, '#d9b48a', 6, 12);
      if (slip) { P.vx -= 8; }
      stats.jumps++; if (W.water.jumpCost) { P.water = Math.max(0, P.water - W.water.jumpCost); burst(P.x - P.face * 3, P.y - 16, 3, ['#bfe6ff', '#6cb8f2'], 26, 'drop'); }
    }
    if (!I.jump && !P.jumpCutDone && P.vy < -70) { P.vy *= JUMP_CUT_F; P.jumpCutDone = true; }
    // horizontal
    var nx = P.x + P.vx * dt, dirn = nx > P.x ? 1 : -1;
    if (nx !== P.x) {
      var lx = nx + dirn * 4, lead = gAt(lx), bl = bAt(lx);
      var wallB = bl > 0 && (lead - bl) < P.y - 1.5;
      if (lead < P.y - STEP_UP || wallB) {
        if (wallB && P.bumpT <= 0 && Math.abs(P.vx) > 45 && P.stun <= 0) { P.bumpT = 0.55; bumpFx(lx); }
        nx = P.x; P.vx = 0;
      }
    }
    if (P.kb > 0 && nx < P.kbMin) { nx = P.kbMin; P.vx = Math.max(0, P.vx); }
    P.x = nx; if (P.bumpT > 0) { P.bumpT -= dt; }
    // vertical
    var g = under(P.x);
    if (P.onGround) {
      if (g === Infinity || g - P.y > 6) { P.onGround = false; }
      else { P.y = g; P.vy = 0; }
    }
    if (!P.onGround) {
      P.vy += GRAV * dt; var ny = P.y + P.vy * dt;
      if (P.vy >= 0 && g !== Infinity && ny >= g && P.y <= g + 8) {
        var hv = P.vy; P.y = g; P.vy = 0; P.onGround = true; P.sq = clamp(hv / 300, 0.12, 0.85); P.sqv = 0;
        dust(P.x, P.y, hv > 120 ? 6 : 3, '#d9b48a', 8, 14);
        if (hv > 150 && state === 'play') { window.Sfx && Sfx.play('land'); } if (hv > 250 && state === 'play') { rum('land'); }
      }
      else { P.y = ny; }
      if (P.x > 0 && P.x < len && PITY[P.x | 0] > 0 && P.y > PITY[P.x | 0]) { fallDeath(); }
    }
    if (P.inv > 0) { P.inv -= dt; }
    if (P.hurtT > 0) { P.hurtT -= dt; }
    if (P.drinkT > 0) { P.drinkT -= dt; }
    // animation
    var mv = Math.abs(P.vx);
    if (P.onGround) {
      P.ph += mv * dt * 0.165 * (P.sliding && !(I.left || I.right) ? 0.1 : 1);
      if (P.sliding && mv > 22 && Math.random() < dt * 60) { var wetNow = (zoneAt(P.x) & Z_WET) && !(zoneAt(P.x) & Z_SNOW); dust(P.x - Math.sign(P.vx) * 2, P.y, 2, wetNow ? '#d8e8a0' : '#f4f9ff', 4, 6); if (!slideToasted && state === 'play' && cb.onToast) { slideToasted = true; cb.onToast((zoneAt(P.x) & Z_SLIP) ? 'La pente te ramène : l\u2019herbe glisse !' : (wetNow ? 'Tu glisses sur l\u2019herbe mouillée !' : 'Tu glisses sur la neige !')); } if (state === 'play' && performance.now() - lastSlideAt > 380) { lastSlideAt = performance.now(); window.Sfx && Sfx.play('slide'); } }
      var sn = Math.floor(P.ph / Math.PI);
      if (sn !== P.stepN) { P.stepN = sn; if (mv > 40) { dust(P.x - P.face * 2, P.y, 1, '#cfae88', 3, 5); if (state === 'play') { Sfx.step(surfaceAt(P.x)); } } }
    }
    P.sqv += (-120 * P.sq - 13 * P.sqv) * dt; P.sq += P.sqv * dt;
    P.slideK = (P.slideK || 0) + ((P.sliding && P.onGround ? 1 : 0) - (P.slideK || 0)) * Math.min(1, dt * 9);
    var tgt = Math.atan(slopeAt(P.x)) * P.face; P.slope += (tgt - P.slope) * Math.min(1, dt * 12);
  }
  /* surface sous les pieds (pas) : scories (carrière, cône), herbe (forêt), roche (sommet), bois (marches) */
  function surfaceAt(px) {
    var t = TYPE[px | 0]; if (t === 1) { return (W && W.stairsMat) || 'wood'; } if (t === 6) { return 'wood'; }
    if ((ZN[px | 0] & Z_SNOW)) { return 'snow'; }
    if ((ZN[px | 0] & Z_WET)) { return 'grass'; }
    if (t === 2) { return 'rock'; } if (t === 4) { return 'gravel'; }
    if (TH && TH.surface) { return TH.surface(px, EV); }
    var w = bw(px); return w[1] > 0.5 ? 'grass' : 'scoria';
  }
  function bumpFx(x) { window.Sfx && Sfx.play('bump'); dust(x, P.y, 5, '#b99a82', 5, 10); chunks(x, P.y - 6, 2, 30); P.sq = 0.3; P.sqv = 0; }
  function fallDeath() {
    if (state !== 'play') { return; }
    stats.falls++; P.lives--; stats.hitsAt.push({ x: P.x, y: P.y, kind: 'fall' }); window.Sfx && Sfx.play('fall'); rum('fall');
    startRespawn(P.lives <= 0 ? 'Plus de vie ! Retour au point de contrôle.' : 'Tu es tombé ! Retour au point de contrôle.');
    if (P.lives <= 0) { P.lives = 0; }
  }

  /* ----- v0.4.0 : environnement (soleil, neige, vent, brouillard), train, randonneurs ----- */
  function windFx() { return wind.on ? wind.str : 0; }
  function hazardNear(a, b) { return gapBetween(a, b) || feat.trains.some(function (t) { return t.x1 > a && t.x0 < b; }) || feat.crumbs.some(function (q) { return q.x1 > a && q.x0 < b; }); }
  function updateWind(dt) {
    var zw = (zoneAt(P.x) & Z_WIND) !== 0 && (W.windOverGaps || !hazardNear(P.x - 50, P.x + 150));
    wind.t += dt; var per = W.windCycle || 9.2, warnDur = (W.windWarn != null) ? W.windWarn : 1.4, gustDur = (W.windGust != null) ? W.windGust : 2.6;
    var ph = wind.t % per, warnAt = per - (warnDur + gustDur), gustAt = per - gustDur;
    var st = ph < warnAt ? 'calm' : ph < gustAt ? 'warn' : 'gust';
    var target = (zw && st === 'gust') ? 1 : 0;
    wind.str += (target - wind.str) * (1 - Math.exp(-dt * (target ? 5 : 3)));
    wind.warn = (zw && st === 'warn') ? Math.min(1, (ph - warnAt) / 0.6) : (zw && st === 'gust' ? 1 : 0);
    if (st !== wind.st) { if (zw && st === 'warn' && window.Sfx) { Sfx.play('windwarn'); } if (zw && st === 'gust' && window.Sfx) { Sfx.play('gust'); } wind.st = st; }
    wind.on = zw && wind.str > 0.02; wind.zone = zw;
    // particules de vent : traits clairs qui filent vers la gauche
    if (zw && (st !== 'calm') && Math.random() < dt * (st === 'gust' ? 18 : 7)) {
      var gust = st === 'gust', wx = cam.x + curVw + 8, wy = cam.y + curVh * (0.18 + Math.random() * 0.5);
      emit({ k: 'wind', x: wx, y: wy, vx: -(140 + Math.random() * 90) * (gust ? 1.25 : 0.75), vy: (Math.random() - 0.5) * 6, g: 0, life: 0.85, max: 0.85, s0: 26 + Math.random() * 28, col: 'rgba(236,246,255,0.9)', thick: 1.15 + Math.random() * 0.6 });
    }
  }
  /* v0.4.1 — passage à niveau : le train ne part QUE lorsque le randonneur s'approche (feux + cloche + barrières), puis entre par la droite de l'écran.
     clear → warn (feux, barrière qui descend) → pass (le train traverse) → clear (barrière relevée). Toucher le train = coup. */
  function trainReset(tr) { tr.state = 'clear'; tr.t = 0; tr.u = 0; tr.g = 0; tr.tx = tr.cx + 9000; tr.armed = true; tr.hit = false; }
  function updateTrains(dt) {
    feat.trains.forEach(function (tr) {
      var L2 = tr.len / 2;
      if (P.x < tr.x0 - tr.trig - 45 && tr.state === 'clear') { tr.armed = true; }
      if (tr.state === 'clear') {
        tr.u = 0;
        if (state === 'play' && tr.armed && P.x > tr.x0 - tr.trig && P.x < tr.x1 + 4 && P.x > tr.x0 - tr.trig - 2) { tr.state = 'warn'; tr.t = 0; tr.bell = 0; tr.hit = false; }
      } else if (tr.state === 'warn') {
        tr.t += dt; tr.u = Math.min(1, tr.t / tr.warn);
        if (P.x < tr.x0 - tr.trig - 60) { tr.state = 'clear'; tr.armed = true; }          // il a fait demi-tour très loin : on annule
        else {
          tr.bell -= dt; if (tr.bell <= 0) { tr.bell = 0.42; if (Math.abs(P.x - tr.cx) < 330 && window.Sfx) { Sfx.play('bell'); } }
          if (tr.t >= tr.warn) {
            tr.state = 'pass'; tr.t = 0;
            var front = Math.min(Math.max(tr.x1 + 44, curVw ? cam.x + curVw + 14 : tr.x1 + 160), Math.max(tr.xr, tr.x1 + 44));
            tr.tx = front + L2;
            if (Math.abs(P.x - tr.cx) < 420 && window.Sfx) { Sfx.play('train'); }
          }
        }
      } else if (tr.state === 'pass') {
        tr.t += dt; tr.tx -= tr.spd * dt; tr.u = 1;
        if (state === 'play' && P.inv <= 0 && P.x > tr.x0 - 6 && P.x < tr.x1 + 6 && P.x > tr.tx - L2 + 5 && P.x < tr.tx + L2 - 5) { hurt('train'); chunks(P.x, P.y - 4, 5, 60); tr.hit = true; }
        if (tr.tx + L2 < Math.min(tr.x0 - 24, cam.x - 10) || tr.t > 14) { tr.state = 'clear'; tr.armed = false; tr.tx = tr.cx + 9000; }
      }
      var gt = (tr.state === 'warn' && tr.t > 0.7) || (tr.state === 'pass' && tr.tx + L2 > tr.x0 - 8) ? 1 : 0;
      tr.g += (gt - tr.g) * Math.min(1, dt * 3.2);
    });
  }
  function updateNpcs(dt) {
    feat.npcs.forEach(function (n) {
      var q = n.q;
      if (q.state !== 'solid' && n.st === 'wait') { n.st = 'done'; }
      if (n.st === 'wait') {
        // v0.5.2 : le randonneur n'apparaît que quand la dalle entre dans le champ de la caméra (donc visible, même sur téléphone) ; il traverse alors l'écran et la casse sous les yeux du joueur
        if (P.x > q.x0 - 420 && P.x < q.x0 - 22 && state === 'play' && curVw && q.x1 < cam.x + curVw + 2) {
          n.st = 'walk'; n.x = Math.max(q.x1 + 24, cam.x + curVw + 10); n.face = -1; n.bub = 0; n.ch = (n.ch + 1) % 4; n.hit = false; n.ph = 0;
        }
      } else if (n.st === 'walk') {
        var gy = gAt(n.x);
        n.x -= NPC_V * dt; n.ph += NPC_V * dt * 0.165;
        gy = gAt(n.x); if (isFinite(gy) && gy > -1e5) { n.y = gy; } else if (!n.y) { n.y = G[q.x1 | 0]; }
        if (!n.hit && n.x < q.x1 - 3) {
          n.hit = true; n.bub = 1.3;
          if (q.state === 'solid') { q.state = 'crack'; q.t = 0; q.em = 0; q.byNpc = true; q.fall = 0.38; window.Sfx && Sfx.play('crack'); dust(n.x, n.y, 6, '#d9b98f', 14, 12); chunks(n.x, n.y - 2, 3, 38); }
        }
        if (n.bub > 0) { n.bub -= dt; }
        if (n.x < Math.max(0, P.x - 150) || n.x < q.x0 - 260) { n.st = 'done'; }
      }
    });
    // la caméra recule un peu (et laisse plus de place devant) tant qu'une dalle piétinée approche : le joueur voit toute la scène
    npcLook = state === 'play' && feat.npcs.some(function (n) { var q = n.q; return (n.st === 'wait' && P.x > q.x0 - 420 && P.x < q.x1) || (n.st === 'walk' && P.x < q.x1 + 14); });
  }
  function updateEnv(dt) {
    var zn = zoneAt(P.x), stairs = P.onGround && onStairs(P.x), mul = 1;
    if (zn & Z_SUN) { mul *= (W.sun && W.sun.mult) || 1.8; }
    if ((zn & Z_SHADE) && !(zn & Z_SUN)) { mul *= (W.shade && W.shade.mult) || 0.85; }
    if (stairs) { mul *= STAIR_DRAIN; }
    P.drainMul = mul;
    // petites gouttes de sueur / souffle visibles quand ça tire (soleil ou marches)
    if (P.onGround && Math.abs(P.vx) > 20 && mul > 1.3 && Math.random() < dt * (mul > 1.7 ? 3.2 : 1.8)) { burst(P.x - P.face * 2, P.y - 22, 1, ['#d9f0ff', '#8cc8f0'], 16, 'drop'); }
    updateWind(dt); updateTrains(dt); updateNpcs(dt);
    syncEnv(); if (window.Fauna) { EV.hurt = hurt; Fauna.update(EV, dt); }
    // profil de la montée : un point tous les ~6 px de progression (écran de victoire)
    if (P.x > trk.x + 6) { trk.x = P.x; stats.track.push([Math.round(P.x), Math.round(P.y * 10) / 10, Math.round(clock * 10) / 10]); }
  }

  /* ----- pierres qui dévalent la pente ----- */
  function gapBetween(a, b) { var gs = liveGaps(); for (var i = 0; i < gs.length; i++) { var g = gs[i]; if (g.x1 > a && g.x0 < b) { return true; } } return false; }
  function spawnPoint(zone, ahead) {
    var edge = curVw ? cam.x + curVw + 14 : P.x + 110, sx = Math.round(Math.min(edge, zone.x1 + 30));
    if (sx - P.x < 85 || sx < zone.x0 || !isFinite(G[sx]) || !isFinite(G[sx - 6])) { return null; }
    if (G[sx] > G[P.x | 0] - 3) { return null; }                 // il faut que ça vienne d'en haut
    if (gapBetween(P.x - 6, sx + 4 + (ahead || 0))) { return null; }
    return sx;
  }
  function rockAhead() { for (var i = 0; i < rocks.length; i++) { if (rocks[i].x > P.x - 30) { return true; } } return false; }
  function updateRocks(dt) {
    var zone = null, zi = -1; feat.zones.forEach(function (z, i) { if (P.x >= z.x0 - 40 && P.x <= z.x1) { zone = z; zi = i; } });
    if (zi !== zoneNow) { zoneNow = zi; if (zone) { rockTimer = Math.min(Math.max(rockTimer, 0.5), 0.9); } }
    if (zone && P.onGround !== undefined) {
      if (warns.length === 0 && !rockAhead()) {
        rockTimer -= dt;
        if (rockTimer <= 0) {
          if (spawnPoint(zone, 90) != null) {   // on regarde ~1 s devant : l'avertissement n'est lancé que si la pierre pourra vraiment dévaler
            warns.push({ t: 0, dur: rockCount === 0 ? 1.8 : 1.15, z: zone, puff: 0, ok: true, bad: 0 }); window.Sfx && Sfx.play('rumble'); rum('warn');
            rockTimer = zone.min + Math.random() * (zone.max - zone.min);
          } else { rockTimer = 0.4; }
        }
      }
    }
    var i, edgeX = cam.x + curVw - 3;
    for (i = warns.length - 1; i >= 0; i--) {
      var w = warns[i]; w.t += dt; w.puff -= dt;
      // le triangle n'est affiché que si une pierre va réellement dévaler : si le tracé devant devient impraticable (trou, relief), on annule
      w.ok = spawnPoint(w.z) != null; w.bad = w.ok ? 0 : w.bad + dt;
      if (!w.ok && (w.bad > 0.35 || w.t > w.dur + 1.2)) { warns.splice(i, 1); continue; }
      if (w.puff <= 0 && w.ok) {  // grondement : poussière + cailloux qui dégringolent en haut de la pente
        w.puff = 0.11; var ex = edgeX - Math.random() * 6, ey = gAt(ex);
        if (isFinite(ey) && ey > -1e5) { dust(ex, ey, 2, '#b99a82', 8, 9); if (Math.random() < 0.6) { emit({ k: 'chunk', x: ex, y: ey - 1.5, vx: -(18 + Math.random() * 20), vy: -12, g: 520, life: 0.9, max: 0.9, s0: 0.7 + Math.random() * 0.5, rot: 0, vr: -8 - Math.random() * 6, col: '#3b2a31' }); } }
      }
      if (w.t >= w.dur && w.ok) {
        warns.splice(i, 1);
        var sx = spawnPoint(w.z);
        if (sx != null && state === 'play') {
          var r = 4.3 + Math.random() * 0.9; rockCount++;
          rocks.push({ x: sx, y: G[sx] - r, vx: -42, vy: 0, r: r, rot: Math.random() * 6, ground: true, seed: (Math.random() * 1000) | 0, dT: 0, hop: 0.5 });
          dust(sx, G[sx], 5, '#b99a82', 10, 12);
        }
      }
    }
    for (i = rocks.length - 1; i >= 0; i--) {
      var k = rocks[i], gx = k.x | 0, gy = gAt(gx);
      if (k.ground) {
        var sl = clamp(-slopeAt(gx), 0, 0.45), vt = -Math.min(82, 46 + 150 * sl);
        k.vx += clamp(vt - k.vx, -150 * dt, 150 * dt);
        k.x += k.vx * dt; var gn = gAt(k.x);
        if (!isFinite(gn) || gn < -1e5 || gn - (k.y + k.r) > 1.8) { k.ground = false; k.vy = 20; }
        else { k.y = gn - k.r; }
        k.hop -= dt; if (k.ground && k.hop <= 0 && sl > 0.02) { k.hop = 0.55 + Math.random() * 0.4; k.vy = -42; k.ground = false; }
        k.dT -= dt; if (k.ground && k.dT <= 0) { k.dT = 0.06; dust(k.x + 2, gn, 1, '#b99a82', 4, 8); }
      }
      if (!k.ground) {
        var py = k.y; k.vy += GRAV * dt; k.y += k.vy * dt; k.x += k.vx * dt;
        var g2 = gAt(k.x);
        if (isFinite(g2) && g2 > -1e5 && k.y + k.r >= g2) {
          if (py + k.r <= g2 + 6) {
            k.y = g2 - k.r;
            if (k.vy > 55) { k.vy = -k.vy * 0.36; chunks(k.x, g2, 2, 40); dust(k.x, g2, 2, '#b99a82', 6, 10); if (Math.abs(k.x - P.x) < 150) { window.Sfx && Sfx.play('rock'); } if (Math.abs(k.vy) < 14) { k.vy = 0; k.ground = true; } }
            else { k.vy = 0; k.ground = true; }
          } else { k.vx *= 0.9; }
        }
        if (k.y > BASE_Y + 200 || (PITY[gx] > 0 && k.y > PITY[gx])) { dust(k.x, k.y, 3, '#6a5a6a', 6, 0); rocks.splice(i, 1); continue; }
      }
      var shat = false;
      for (var bi = 0; bi < feat.boulders.length; bi++) {
        var bb = feat.boulders[bi];
        if (Math.abs(k.x - bb.x) < bb.hw + k.r * 0.5 && k.y + k.r > gAt(bb.x) - bb.h * 0.85) { shat = true; chunks(k.x, k.y, 8, 80, true); dust(k.x, k.y, 5, '#b99a82', 8, 12); if (Math.abs(k.x - P.x) < 160) { window.Sfx && Sfx.play('rock'); } break; }
      }
      if (shat) { rocks.splice(i, 1); continue; }
      k.rot += (k.vx / k.r) * dt * (k.ground ? 1 : 0.8);
      if (state === 'play' && P.inv <= 0 && Math.abs(k.x - P.x) < k.r + 3.4 && P.y > k.y - k.r + 1.6 && P.y - 20 < k.y + k.r) {
        hurt('rock'); chunks(k.x, k.y, 9, 90, true); dust(k.x, k.y, 6, '#b99a82', 8, 12); rocks.splice(i, 1); window.Sfx && Sfx.play('rock'); continue;
      }
      if (k.x < cam.x - 40 || k.x < 0) { rocks.splice(i, 1); }
    }
  }

  /* ----- ÉROSION : sol qui s'effrite -----
     Dès que le randonneur pose le pied (au sol) sur une zone, elle se fissure (poussière, éclats, tremblement, craquements),
     puis après `crumble.fall` s elle s'effondre : la zone devient un vide comme une ravine. Courir sans s'arrêter, ou sauter par-dessus,
     est sans danger. Chaque réapparition reconstruit toutes les zones. */
  var slideToasted = false, crumbNear = 0, lastSlideAt = 0, trk = { x: -1, n: 0 };
  function liveGaps() { var r = feat.gaps; if (!feat.crumbs.length) { return r; } return r.concat(feat.crumbs.filter(function (q) { return q.state === 'fallen'; })); }
  function crumbFall(q) {
    q.state = 'fallen'; q.ft = 0; stats.crumbled++;
    var k, yb = q.y0 + 110;
    for (k = q.x0; k < q.x1; k++) { G[k] = Infinity; PITY[k] = yb; }
    window.Sfx && Sfx.play('crumble'); rum('crumble');
    var near = Math.abs(P.x - (q.x0 + q.x1) / 2) < 90; if (near) { shake = Math.max(shake, 0.28); }
    var c1 = pcol('base', q.x0), c2 = pcol('lip', q.x0), n = Math.max(6, Math.round((q.x1 - q.x0) / 3.2));
    for (k = 0; k < n; k++) {
      var sx = q.x0 + (k + 0.5) * (q.x1 - q.x0) / n, sy = q.gy[Math.min(q.gy.length - 1, Math.round(sx - q.x0))];
      emit({ k: 'slab', x: sx, y: sy + 2, vx: (Math.random() - 0.5) * 22, vy: -8 - Math.random() * 18, g: 430, life: 1.5, max: 1.5, s0: 2.1 + Math.random() * 2, rot: (Math.random() - 0.5) * 1.4, vr: (Math.random() - 0.5) * 7, col: c1, col2: c2 });
    }
    dust(q.x0 + (q.x1 - q.x0) / 2, q.y0 + 4, 14, '#d9b98f', q.x1 - q.x0, 22); chunks((q.x0 + q.x1) / 2, q.y0 + 2, 5, 55, true);
  }
  function crumbReset() {
    if (!feat) { return; }
    feat.crumbs.forEach(function (q) { for (var k = q.x0; k < q.x1; k++) { G[k] = q.gy[k - q.x0]; PITY[k] = 0; } q.state = 'solid'; q.t = 0; q.ft = 0; });
    crumbNear = 0; if (feat.npcs) { feat.npcs.forEach(function (n) { n.st = 'wait'; }); }
  }
  function updateCrumbs(dt) {
    if (!feat.crumbs.length) { return; }
    crumbNear = 0;
    feat.crumbs.forEach(function (q) {
      if (q.state === 'solid') {
        if (P.onGround && P.x > q.x0 + 1 && P.x < q.x1 - 1) {
          q.state = 'crack'; q.t = 0; q.em = 0; window.Sfx && Sfx.play('crack'); rum('crack');
          dust(P.x, P.y, 5, '#d9b98f', 14, 12); chunks(P.x, P.y - 2, 3, 38);
        } else if (Math.abs(P.x - (q.x0 + q.x1) / 2) < 140) {
          // indice avant d'y poser le pied : de petits graviers se détachent de la zone fragile (plus souvent si elle cède vite)
          q.tt = (q.tt || 0) - dt;
          if (q.tt <= 0) {
            q.tt = (q.fall < 0.5 ? 0.22 : 0.5) + Math.random() * 0.35; var ex2 = q.x0 + 1 + Math.random() * (q.x1 - q.x0 - 2), ey2 = G[ex2 | 0];
            if (isFinite(ey2)) { emit({ k: 'chunk', x: ex2, y: ey2, vx: (Math.random() - 0.5) * 9, vy: -4 - Math.random() * 8, g: 420, life: 0.8, max: 0.8, s0: 0.6 + Math.random() * 0.6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, col: '#d9b98f' }); }
          }
        }
      } else if (q.state === 'crack') {
        q.t += dt; q.em -= dt; var u = clamp(q.t / q.fall, 0, 1);
        if (Math.abs(P.x - (q.x0 + q.x1) / 2) < 70) { crumbNear = Math.max(crumbNear, 0.4 + 0.9 * u); }
        if (q.em <= 0) {
          q.em = 0.09 - 0.05 * u; var ex = q.x0 + Math.random() * (q.x1 - q.x0), ey = G[ex | 0];
          if (isFinite(ey)) {
            emit({ k: 'dust', x: ex, y: ey, vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 6, g: -2, life: 0.5 + Math.random() * 0.4, max: 0.9, s0: 0.8 + Math.random() * 0.8, s1: 2.6 + Math.random() * 2.4, col: '#d9b98f', a: 0.5 });
            if (Math.random() < 0.55) { emit({ k: 'chunk', x: ex, y: ey, vx: (Math.random() - 0.5) * 20, vy: -22 - Math.random() * 20, g: 420, life: 0.7, max: 0.7, s0: 0.7 + Math.random() * 0.7, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, col: Math.random() < 0.5 ? pcol('base', ex) : pcol('lip', ex) }); }
          }
        }
        if (q.t >= q.fall) { crumbFall(q); }
      } else { q.ft += dt; }
    });
  }
  /* rendu : bande de terre sèche et craquelée (visible à l'avance), tremblante quand elle cède */
  function drawCrumbs(c, xa, xb) {
    feat.crumbs.forEach(function (q) {
      if (q.state === 'fallen' || q.x1 < xa - 6 || q.x0 > xb + 6) { return; }
      var cr = q.state === 'crack', u = cr ? clamp(q.t / q.fall, 0, 1) : 0, amp = cr ? 0.3 + 1.0 * u : 0, x, n = q.x1 - q.x0, tm = time;
      var body, lipP, k0 = q.x0, jy = [], reuse = !cr && q._pb && q._pl;
      if (reuse) { body = q._pb; lipP = q._pl; }
      else {
      body = new Path2D(); lipP = new Path2D();
      for (x = k0; x <= q.x1; x++) { jy.push(cr ? Math.sin(tm * 58 + x * 1.7 + q.seed) * amp * (0.5 + 0.5 * Math.sin(x * 0.9 + tm * 31)) : 0); }
      for (x = k0; x <= q.x1; x++) { var yy = q.gy[Math.min(n - 1, x - k0)] + jy[x - k0]; if (x === k0) { body.moveTo(x, yy); lipP.moveTo(x, yy); } else { body.lineTo(x, yy); lipP.lineTo(x, yy); } }
      for (x = q.x1; x >= k0; x -= 2) { var jag = 5.2 + 2.6 * hash(x, q.seed) + (cr ? 1.6 * u : 0); body.lineTo(x, q.gy[Math.min(n - 1, Math.max(0, x - k0))] + jag); }
      body.closePath();
      if (!cr) { q._pb = body; q._pl = lipP; } else { q._pb = q._pl = null; }
      }
      if (reuse) { for (x = k0; x <= q.x1; x++) { jy.push(0); } }
      c.save();
      c.fillStyle = mix(pcol('base', q.x0), '#e9d3a6', 0.62); c.fill(body);
      c.fillStyle = 'rgba(255,240,205,.16)'; c.fill(body);
      c.clip(body);
      // grain : petits cailloux clairs
      for (x = k0 + 1; x < q.x1; x += 3) { var hh = hash(x, q.seed + 3); if (hh > 0.45) { var yp = q.gy[x - k0] + 2 + hh * 3; c.fillStyle = hh > 0.75 ? 'rgba(255,248,225,.7)' : 'rgba(110,70,50,.45)'; c.fillRect(x, yp + jy[x - k0], 1.2, 1); } }
      // fissures : plus nombreuses et plus larges au fil du temps ; lueur chaude dedans juste avant la chute
      var nc = 3 + (cr ? Math.round(3 * u) : 0), ci;
      for (ci = 0; ci < nc; ci++) {
        var fx = q.x0 + (ci + 0.5) * n / nc + (hash(ci, q.seed) - 0.5) * 4, fy = q.gy[Math.min(n - 1, Math.max(0, Math.round(fx - k0)))] + jy[Math.max(0, Math.min(n, Math.round(fx - k0)))];
        c.beginPath(); c.moveTo(fx, fy - 0.4);
        var px = fx, py = fy, seg = 3 + (ci % 2);
        for (var sgi = 1; sgi <= seg; sgi++) { px += (hash(ci * 7 + sgi, q.seed) - 0.5) * 3.6; py += 1.7 + hash(ci + sgi, q.seed + 5) * 1.2; c.lineTo(px, py); }
        c.lineJoin = 'round'; c.lineCap = 'round';
        if (cr && u > 0.35) { c.strokeStyle = 'rgba(255,170,90,' + (0.35 + 0.4 * Math.sin(tm * 18 + ci)) * u + ')'; c.lineWidth = 1.7 + 1.6 * u; c.stroke(); }
        c.strokeStyle = '#2a1410'; c.lineWidth = 0.55 + (cr ? 0.9 * u : 0.15); c.stroke();
      }
      c.restore();
      // lèvre sèche
      c.strokeStyle = '#7b5a3c'; c.lineWidth = 2.5; c.lineJoin = 'round'; c.stroke(lipP);
      c.strokeStyle = '#f0deb0'; c.lineWidth = 1.3; c.stroke(lipP);
      c.save(); c.translate(0, -0.6); c.strokeStyle = 'rgba(255,252,230,.8)'; c.lineWidth = 0.6; c.stroke(lipP); c.restore();
      // petits éclats détachés sur les bords (indice visuel avant même d'y marcher)
      if (!cr) { c.fillStyle = 'rgba(210,180,135,.9)'; c.fillRect(q.x0 - 2, q.gy[0] - 1, 1.4, 1); c.fillRect(q.x1 + 1, q.gy[n - 1] - 1.4, 1.2, 1.2); }
    });
  }

  function updateWorld(dt) {
    // eau
    P.water = Math.max(0, P.water - W.water.drainPerSec * (P.drainMul || 1) * dt);
    if (P.water <= 0) { P.thirst += dt; if (P.thirst >= W.water.thirstDamageEvery) { P.thirst = 0; hurt('thirst'); } } else { P.thirst = 0; }
    // bouteilles
    feat.bottles.forEach(function (b) {
      if (!b.taken && Math.abs(b.x - P.x) < 11 && Math.abs(b.y - (P.y - 10)) < 17) {
        b.taken = true; stats.bottles++; stats.bottlesAt.push({ x: b.x, y: b.y }); P.water = Math.min(W.water.max, P.water + W.water.bottleGain); window.Sfx && Sfx.play('drink'); rum('pick');
        P.drinkT = 1.15; if (cb.onBottle) { cb.onBottle(L.number); }
        burst(b.x, b.y, 14, ['#bfe6ff', '#6cb8f2', '#fff'], 60, 'drop'); if (cb.onToast) { cb.onToast('Bouteille d\u2019eau : +' + W.water.bottleGain + ' %'); }
      }
    });
    // trouvailles cachées (Carnet)
    feat.finds.forEach(function (f) {
      if (!f.got && Math.abs(f.x - P.x) < 12 && Math.abs(f.y - (P.y - 12)) < 14) {
        f.got = true; stats.finds++; stats.findsAt.push({ x: f.x, y: f.y, id: f.id }); var fd = window.Save.foundOf(L.number); fd[f.id] = true; window.Save.commit();
        window.Sfx && Sfx.play('find'); rum('pick'); burst(f.x, f.y, 16, ['#ffe27a', '#fff', '#9cf0ff'], 70);
        var def = W.finds[f.id] || {}, n = feat.finds.filter(function (q) { return q.got; }).length;
        if (cb.onToast) { cb.onToast('Trouvé : ' + (def.name || 'objet') + ' (' + n + '/' + feat.finds.length + ') — voir le Carnet'); }
        if (cb.onFind) { cb.onFind(f.id); }
      }
    });
    // points de contrôle
    feat.cps.forEach(function (c) {
      if (c.id > lastCp.id && P.x >= c.x) {
        stats.cpsAt.push({ x: c.x, y: c.y }); lastCp = { x: c.x, y: c.y, id: c.id, bottles: feat.bottles.filter(function (b) { return b.taken; }).map(function (b) { return b.id; }) };
        window.Sfx && Sfx.play('check'); burst(c.x + 4, c.y - 26, 12, ['#7dff9a', '#fff', '#ffd34d'], 60); if (cb.onToast) { cb.onToast('Point de contrôle !'); }
      }
    });
    updateEnv(dt); updateRocks(dt); updateCrumbs(dt);
    // sommet
    if (state === 'play' && P.x >= feat.summitX) { win(); }
  }

  function win() {
    state = 'won'; stats.time = clock; stats.waterLeft = Math.round(P.water); window.Sfx && Sfx.play('summit'); rum('win'); P.vx = 0; wonT = 0; rocks = []; warns = []; hintQ = []; hintShown = null; summitFired = false; if (cb.onHint) { cb.onHint(null); }
    recPush(true); if (rec && rec.samples.length >= 2) { rec.t = clock; stats.ghostRec = rec; }
  }
  /* note de 1 à 3 étoiles : temps, eau restante, coups reçus */
  function rate(st) {
    var R = W.stars, pts = 0;
    pts += st.time <= R.timeFast ? 2 : st.time <= R.timeOk ? 1 : 0;
    pts += st.waterLeft >= R.waterGood ? 2 : st.waterLeft >= R.waterOk ? 1 : 0;
    pts += st.hits === 0 ? 2 : st.hits === 1 ? 1 : 0;
    return pts >= 5 ? 3 : pts >= 3 ? 2 : 1;
  }
  function rateParts(st) {
    var R = W.stars;
    return { time: st.time <= R.timeFast ? 2 : st.time <= R.timeOk ? 1 : 0, water: st.waterLeft >= R.waterGood ? 2 : st.waterLeft >= R.waterOk ? 1 : 0, hits: st.hits === 0 ? 2 : st.hits === 1 ? 1 : 0 };
  }

  function altBase() { return L.altitudeStart; }
  /* profil altimétrique du parcours effectué : échantillons du terrain (altitude en m, distance en m) + marqueurs pour l'écran de victoire */
  function profile() {
    if (!feat || !stats) { return null; }
    var x1 = Math.round(feat.summitX), pts = [], i, aTop = altTopOf(), a0 = L.altitudeStart;
    for (i = 0; i <= x1; i += 4) { var gy = G[i]; if (!isFinite(gy) || gy < -1e5) { continue; } pts.push([i, gy]); }
    var alt = function (y) { return a0 + clamp((BASE_Y - y) / (BASE_Y - feat.topY), 0, 1.02) * (aTop - a0); };
    function mk(arr) { return arr.map(function (m) { return { d: Math.max(0, Math.min(x1, m.x)) * 0.25, alt: alt(m.y), kind: m.kind, id: m.id }; }); }
    return {
      dist: x1 * 0.25, alt0: a0, altTop: aTop, pts: pts.map(function (q) { return { d: q[0] * 0.25, alt: alt(q[1]) }; }),
      hearts: mk(stats.hitsAt), finds: mk(stats.findsAt), bottles: mk(stats.bottlesAt), cps: mk(stats.cpsAt),
      zones: (function () { var out = [], cur = null; for (var k = 0; k <= x1; k += 6) { var z = ZN[k] & (Z_SNOW | Z_FOG | Z_SUN | Z_WIND | Z_WET | Z_STORM); if (cur && cur.z === z) { cur.d1 = k * 0.25; } else { cur = { z: z, d0: k * 0.25, d1: k * 0.25 }; out.push(cur); } } return out; })(),
      trains: feat.trains.map(function (t) { return { d: t.cx * 0.25 }; }), stairs: feat.stairs.map(function (t) { return { d0: t.x0 * 0.25, d1: t.x1 * 0.25 }; })
    };
  }

  function trailGap() {
    if (!recGhost || !window.Save) { return null; }
    var tt = Save.timeToReach(recGhost, recMaxX);
    if (tt == null) { return recGhost.t != null ? clock - recGhost.t : null; }
    return clock - tt;
  }
  function updateTrailHud(force) {
    if (!trailOn || !cb.onTrailHud) { return; }
    trailHudT += frameDt || 0; if (!force && trailHudT < 0.08) { return; } trailHudT = 0;
    cb.onTrailHud({ on: true, time: clock, gap: recGhost ? trailGap() : null, hasGhost: !!recGhost, ghostT: recGhost ? recGhost.t : 0, maxX: recMaxX });
  }
  function ghostPose(t) {
    if (!recGhost || !window.Save) { return null; }
    var p = Save.sampleGhost(recGhost, t); if (!p) { return null; }
    p.done = t >= recGhost.t - 0.001; return p;
  }
  function update(dt) {
    time += dt; frameDt = dt;
    if (state === 'play' || state === 'dying' || state === 'won') {
      if (state === 'play') {
        clock += dt; updatePlayer(dt); updateWorld(dt); updateHints(dt); recPush(false); updateTrailHud(false);
      } else if (state === 'dying') {
        if (!P.onGround) { P.vy += GRAV * dt; P.y += P.vy * dt; } // chute visible
        fade = Math.min(1, fade + dt * 2.2); if (fade >= 1 && pendingRespawn) { pendingRespawn = false; respawn(); }
      } else if (state === 'won') {
        wonT += dt; P.vx = 0; P.walkIn = false;
        if (W.endGare) { var doorX = feat.summitX + 84; if (wonT > 0.9 && P.x < doorX) { P.x = Math.min(doorX, P.x + SPEED * 0.55 * dt); P.face = 1; P.walkIn = true; P.ph += SPEED * 0.55 * dt * 0.165; } }
        if (wonT > (W.endGare ? 3.9 : 1.9) && !summitFired) { summitFired = true; if (cb.onSummit) { cb.onSummit(stats, L); } else if (cb.onWin) { cb.onWin(stats, L); } } if (!P.walkIn) { P.ph += dt * 1.5; } if (P.drinkT > 0) { P.drinkT -= dt; }
        P.sqv += (-120 * P.sq - 13 * P.sqv) * dt; P.sq += P.sqv * dt;
        if (Math.random() < dt * 22) { emit({ k: 'conf', x: feat.summitX + (Math.random() * 90 - 30), y: feat.summitY - 70 - Math.random() * 20, vx: (Math.random() - 0.5) * 30, vy: 10 + Math.random() * 20, g: 22, life: 3.2, max: 3.2, s0: 1 + Math.random(), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10, col: ['#ffd34d', '#e0452b', '#fff', '#7cc24a', '#6cb8f2'][(Math.random() * 5) | 0] }); }
      }
      if (fadeDir < 0) { fade = Math.max(0, fade - dt * 2.5); if (fade <= 0) { fadeDir = 0; } }
      if (state === 'won') { fade = 0; }
    }
    for (var i = parts.length - 1; i >= 0; i--) {
      var q = parts[i]; q.life -= dt; q.vy += (q.g == null ? 300 : q.g) * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.rot != null) { q.rot += q.vr * dt; }
      if (q.k === 'dust') { q.vx *= 0.96; }
      if (q.life <= 0) { parts.splice(i, 1); }
    }
    if (shake > 0) { shake -= dt; }
    var zt = state === 'won' ? (curW > curH ? ((W && W.winZoomLand) || (TH && TH.winZoomLand) || 0.7) : ((W && W.winZoomPort) || (TH && TH.winZoomPort) || 0.56)) : (npcLook ? 0.78 : 1); if (zoomOv != null) { zoom = zoomOv; } else { zoom += (zt - zoom) * (1 - Math.exp(-dt * 1.7)); }
    if (P) {
      var alt = altOf(P.y), nf = feat.finds.filter(function (q) { return q.got; }).length;
      var zq = zoneAt(P.x), env = ((zq & Z_SUN) ? 's' : '') + ((zq & Z_SNOW) ? 'n' : '') + ((zq & Z_FOG) ? 'f' : '') + ((zq & Z_SHADE) ? 'o' : '') + ((zq & Z_WIND) ? 'w' : '') + ((zq & Z_WET) ? 'e' : '') + ((zq & Z_STORM) ? 'r' : '') + (P.onGround && onStairs(P.x) ? 'm' : '') + (wind.warn > 0.3 ? 'W' : '');
      var key = [Math.round(P.water), P.lives, alt, stats.bottles, nf, env].join('|');
      if (window.Sfx && Sfx.ambience) { Sfx.ambience({ on: state === 'play' || state === 'won', alt: alt, frac: Math.max(0, Math.min(1, P.x / feat.summitX)), wind: Math.max(wind.str, wind.warn * 0.45), snow: (zq & Z_SNOW) ? 1 : 0, fog: (zq & Z_FOG) ? 1 : 0, sun: (zq & Z_SUN) ? 1 : 0, low: altBase(), top: altTopOf(), world: (L && L.world) || 1, theme: (W && W.theme) || '' }); }
      if (key !== hudLast) { hudLast = key; if (cb.onHud) { cb.onHud({ water: P.water / W.water.max, lives: P.lives, maxLives: W.lives, alt: alt, bottles: stats.bottles, altTop: altTopOf(), finds: nf, findsTotal: feat.finds.length, progress: Math.max(0, Math.min(1, P.x / feat.summitX)), env: env }); } }
    }
  }

  /* =========================== RENDU =========================== */
  var SKY = { top: '#4a78d0', mid: '#8fb0ea', low: '#f7d4b6', hor: '#ffe7c6' };
  function nz(x, s) { return A.fbm(x, s); }

  /* palettes de terrain par biome : carrière (Q), forêt (F), cône rouge (C), fond de cratère / cheire (K) */
  var PQ = { base: '#8e3c2e', mid: '#4d2128', lip: '#e07a45', hi: '#ffc07a', dark: '#2a1620' };
  var PF = { base: '#6c4b39', mid: '#3a2a27', lip: '#8ccc52', hi: '#dcf596', dark: '#2a1f22' };
  var PC = { base: '#9c4634', mid: '#4a2428', lip: '#e48f58', hi: '#ffcf93', dark: '#2a1620' };
  var PK = { base: '#54465a', mid: '#2a2232', lip: '#9cc46c', hi: '#dcecaa', dark: '#201a26' };
  var DEFPAL = { q: PQ, f: PF, c: PC, k: PK }, PL = DEFPAL;
  function bw(x) {
    if (TH && TH.bw) { return TH.bw(x, EV); }
    var q = 1 - sstep(1250, 1450, x), c = sstep(2900, 3100, x) * (1 - sstep(4380, 4440, x)), k = sstep(4380, 4440, x), f = Math.max(0, 1 - q - c - k);
    return [q, f, c, k];
  }
  function pcol(key, x) {
    var w = bw(x), c = PL.q[key], tot = w[0];
    if (w[1] > 0.001) { tot += w[1]; c = mix(c, PL.f[key], w[1] / tot); }
    if (w[2] > 0.001) { tot += w[2]; c = mix(c, PL.c[key], w[2] / tot); }
    if (w[3] > 0.001) { tot += w[3]; c = mix(c, PL.k[key], w[3] / tot); }
    return c;
  }
  var hGradCache = { key: '', xa: 0, xb: 0, g: null, ctx: null };
  function invalidateGfx() { hGradCache = { key: '', xa: 0, xb: 0, g: null, ctx: null }; }
  function hGrad(c, xa, xb, fn, key) {
    if (key && hGradCache.g && hGradCache.ctx === c && hGradCache.key === key && hGradCache.xa === xa && hGradCache.xb === xb) { return hGradCache.g; }
    var g = c.createLinearGradient(xa, 0, xb, 0), n = Math.max(2, Math.ceil((xb - xa) / 55)), i;
    for (i = 0; i <= n; i++) { g.addColorStop(i / n, fn(xa + (xb - xa) * i / n)); }
    if (key) { hGradCache = { key: key, xa: xa, xb: xb, g: g, ctx: c }; }
    return g;
  }

  /* silhouette de crêtes à profil fn(xMonde) */
  function ridge(c, vw, base, off, fn, top, bot, edge, bottom) {
    var STP = 3, w0 = Math.floor((off - 6) / STP) * STP, w1 = off + vw + 9, wx;
    c.beginPath(); c.moveTo(w0 - off, bottom);
    for (wx = w0; wx <= w1; wx += STP) { c.lineTo(wx - off, base - fn(wx)); }
    c.lineTo(wx - STP - off, bottom); c.closePath();
    c.fillStyle = A.grad(c, 0, base - 100, 0, base + 14, [0, top, 1, bot]); c.fill();
    if (edge) { c.beginPath(); for (wx = w0; wx <= w1; wx += STP) { var yy = base - fn(wx); if (wx === w0) { c.moveTo(wx - off, yy); } else { c.lineTo(wx - off, yy); } } c.lineJoin = 'round'; c.strokeStyle = edge; c.lineWidth = 0.7; c.stroke(); }
  }
  function puyFn(x) {                       // chaîne des Puys : cônes à cratère + collines
    var base = 14 + 16 * nz(x / 60, 3), best = base, c0 = Math.floor(x / 78);
    for (var k = -1; k <= 1; k++) {
      var cc = c0 + k, cx = cc * 78 + 39 + (hash(cc, 5) - 0.5) * 30, h = 26 + hash(cc, 6) * 30, w = 38 + hash(cc, 7) * 16, d = (x - cx) / w;
      if (Math.abs(d) < 1) { var v = h * Math.pow(1 - Math.abs(d), 1.25); if (hash(cc, 8) > 0.45) { v -= 7 * Math.exp(-Math.pow(d / 0.16, 2)); } if (v > best) { best = v; } }
    }
    return best;
  }
  function midFn(lakeX, lakeOn) {
    return function (x) {
      var h = 18 + 26 * nz(x / 55, 9) + 12 * nz(x / 21, 12);
      if (lakeOn) { h *= 1 - 0.8 * Math.exp(-Math.pow((x - lakeX) / 52, 2)); }
      return h;
    };
  }

  function drawSky(c, vw, vh, p, gs0) {
    var top = mix(SKY.top, '#3c63c0', p * 0.5);
    c.fillStyle = A.grad(c, 0, 0, 0, gs0 + 10, [0, top, 0.38, SKY.mid, 0.74, SKY.low, 1, SKY.hor]); c.fillRect(0, 0, vw, vh);
    // soleil bas à droite
    var sx = vw * 0.8, sy = gs0 - 64;
    var g = c.createRadialGradient(sx, sy, 0, sx, sy, vh * 0.75); g.addColorStop(0, 'rgba(255,244,205,.95)'); g.addColorStop(0.07, 'rgba(255,230,170,.7)'); g.addColorStop(0.25, 'rgba(255,200,150,.28)'); g.addColorStop(1, 'rgba(255,180,140,0)');
    c.fillStyle = g; c.fillRect(0, 0, vw, vh);
    c.beginPath(); c.arc(sx, sy, 10, 0, 7); c.fillStyle = '#fff7da'; c.fill();
  }
  function drawClouds(c, vw, vh, gain) {
    for (var i = 0; i < 7; i++) {
      var span = vw + 120, cx = ((hash(i, 40) * span - cam.x * (0.03 + 0.012 * (i % 3)) - time * (1.4 + i * 0.5)) % span + span) % span - 60;
      A.cloud(c, cx, vh * (0.07 + hash(i, 41) * 0.3) + gain * 0.05, 0.8 + hash(i, 42) * 0.8, 0.5 + 0.3 * hash(i, 43), ['rgba(255,255,255,.95)', 'rgba(255,236,226,.7)', 'rgba(255,214,200,0)']);
    }
  }
  function drawTreeRow(c, vw, base, off, spacing, hmin, hvar, col, hi, seed, bot) {
    for (var x = -spacing; x < vw + spacing; x += spacing) {
      var id = Math.floor((x + off) / spacing), px = id * spacing - off + hash(id, seed) * spacing * 0.7, h = hmin + hash(id, seed + 2) * hvar;
      if (hash(id, seed + 4) > 0.55) { A.beech(c, px, base, h * 0.9, col, hi); } else { A.conifer(c, px, base, h, col, hi); }
    }
    c.fillStyle = col; c.fillRect(-6, base - 1, vw + 12, bot - base + 1);
  }

  function drawLassolas(c, x, base, s) {
    // le puy jumeau : cône égueulé (fer à cheval ouvert vers la droite)
    c.save(); c.translate(x, base); c.scale(s, s);
    c.beginPath(); c.moveTo(-90, 6); c.bezierCurveTo(-60, -4, -44, -40, -26, -62); c.bezierCurveTo(-18, -66, -10, -50, -2, -34);
    c.bezierCurveTo(6, -24, 14, -26, 20, -38); c.bezierCurveTo(26, -50, 34, -52, 42, -40); c.bezierCurveTo(52, -24, 64, -12, 80, -4); c.lineTo(110, 6); c.closePath();
    c.fillStyle = A.grad(c, 0, -66, 0, 8, [0, '#a889b8', 0.5, '#9a98b8', 1, '#a3b9c0']); c.fill();
    // flancs boisés
    c.beginPath(); c.moveTo(-90, 6); c.bezierCurveTo(-66, -2, -52, -14, -40, -22); c.lineTo(-10, -18); c.lineTo(14, -14); c.bezierCurveTo(46, -10, 70, -6, 110, 6); c.closePath(); c.fillStyle = 'rgba(86,132,112,.55)'; c.fill();
    // scories rouges au bord du cratère + liseré lumineux
    c.beginPath(); c.moveTo(-26, -62); c.bezierCurveTo(-18, -66, -10, -50, -2, -34); c.bezierCurveTo(6, -24, 14, -26, 20, -38); c.bezierCurveTo(26, -50, 34, -52, 42, -40);
    c.strokeStyle = 'rgba(214,106,86,.55)'; c.lineWidth = 3; c.stroke(); c.strokeStyle = 'rgba(255,224,176,.7)'; c.lineWidth = 0.9; c.stroke();
    c.restore();
  }
  function drawLake(c, x, base, w) {
    c.save(); c.translate(x, base);
    c.beginPath(); c.moveTo(-w / 2, 0); c.bezierCurveTo(-w * 0.3, -3.4, w * 0.3, -3.4, w / 2, 0); c.bezierCurveTo(w * 0.3, 5.6, -w * 0.3, 5.6, -w / 2, 0); c.closePath();
    c.fillStyle = A.grad(c, 0, -3, 0, 5.5, [0, '#9fd0ea', 0.5, '#6fa8d8', 1, '#5b8ec6']); c.fill(); c.lineWidth = 0.6; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
    c.beginPath(); c.moveTo(w * 0.06, -0.4); c.lineTo(w * 0.34, -0.4); c.moveTo(w * 0.1, 1.2); c.lineTo(w * 0.3, 1.2); c.moveTo(w * 0.15, 2.5); c.lineTo(w * 0.26, 2.5); c.strokeStyle = 'rgba(255,226,170,.95)'; c.lineWidth = 0.7; c.stroke();
    c.restore();
  }

  /* Décor lointain (v0.2.8) : entièrement vectoriel et tracé à la résolution de l'écran (js/scenery.js) : ciel de crépuscule,
     chaîne des Puys, puy de Dôme (antenne, observatoire, temple de Mercure), collines à brume. Le Dôme se dévoile à mesure que la
     forêt s'éclaircit en montant (paramètre cover). Plus aucune image agrandie. */
  function progAt(camx) { return clamp(camx / Math.max(1, feat.summitX - 120), 0, 1); }
  function coverAt(camx) { return 1 - sstep(0.14, 0.8, progAt(camx)); }
  function drawBackground(c, vw, vh, gs0, gain) {
    Scenery.farBackdrop(c, vw, vh, gs0, gain, { camx: cam.x, time: time, cover: coverAt(cam.x), p: progAt(cam.x), treeKind: 'fir', sc: Sc });
  }
  function drawBackgroundVector(c, vw, vh, gs0, gain) {
    if (true) { return; }
    var p = P ? clamp(P.x / feat.summitX, 0, 1) : 0, i;
    drawSky(c, vw, vh, p, gs0); drawClouds(c, vw, vh, gain);
    // chaîne des Puys (très lointaine) + puy de Dôme et son antenne
    var hy = gs0 - 40 + gain * 0.045, off = cam.x * 0.012;
    ridge(c, vw, hy, off, puyFn, '#8f8ec8', '#d4cbea', 'rgba(255,225,185,.65)', vh);
    var dx = vw * 0.76 - cam.x * 0.012, dh = 70;
    if (dx > -80 && dx < vw + 80) {
      c.beginPath(); c.moveTo(dx - 56, hy + 2);
      for (i = -56; i <= 56; i += 4) { var dd = i / 56; c.lineTo(dx + i, hy - dh * Math.pow(1 - dd * dd, 0.9) * (1 - 0.1 * Math.abs(dd))); }
      c.lineTo(dx + 56, hy + 2); c.closePath(); c.fillStyle = A.grad(c, 0, hy - dh, 0, hy, [0, '#8586c4', 1, '#cfc5e6']); c.fill();
      c.beginPath(); c.moveTo(dx - 40, hy - dh * 0.62); c.quadraticCurveTo(dx, hy - dh * 1.02, dx + 40, hy - dh * 0.62); c.strokeStyle = 'rgba(255,225,185,.6)'; c.lineWidth = 0.8; c.stroke();
      c.fillStyle = '#6f70ac'; c.fillRect(dx - 0.5, hy - dh - 12, 1, 12); c.fillRect(dx - 3, hy - dh - 5, 6, 1.6); c.fillRect(dx - 1.5, hy - dh - 1.5, 3, 2.5);
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(dx, hy - dh - 12, 0.8, 0, 7); c.fill();
    }
    // lac d'Aydat : apparaît dans le dernier quart de la montée
    var lakeS = vw * (1.2 - 0.66 * sstep(0.32, 0.95, p)), lakeOn = p > 0.3;
    if (lakeOn) { drawLake(c, lakeS, hy + 5, 58); }
    // puy jumeau Lassolas
    var lx = vw + 70 - (cam.x - 3150) * 0.2;
    if (lx > -130 && lx < vw + 130) { drawLassolas(c, lx, gs0 - 14 + gain * 0.11, 1.0); }
    // reliefs médians
    var hm = gs0 - 10 + gain * 0.1, om = cam.x * 0.16;
    ridge(c, vw, hm, om, midFn(lakeS + om, lakeOn), '#7c9ec4', '#bcd2d0', 'rgba(255,228,190,.55)', vh);
    // forêts lointaines
    var h1 = gs0 + 6 + gain * 0.2, o1 = cam.x * 0.4; drawTreeRow(c, vw, h1 + 6, o1, 17, 20, 18, '#4f8665', '#79ad7a', 51, vh);
    var h2 = gs0 + 20 + gain * 0.32, o2 = cam.x * 0.7; drawTreeRow(c, vw, h2 + 8, o2, 22, 26, 22, '#37694c', '#5f9a5e', 71, vh);
    // brume de fond
    c.fillStyle = A.grad(c, 0, hm - 10, 0, h2 + 16, [0, 'rgba(255,225,200,0)', 1, 'rgba(255,225,200,.22)']); c.fillRect(0, hm - 10, vw, vh);
  }

  /* ----- scène en coordonnées monde ----- */
  /* look 1 = flanc herbeux (pente en dévers), 2 = crête aérienne : on coupe la masse de terre
     pour laisser voir le vide, la vallée ou la mer de nuages sous le sentier. Lissé sur ±28 px. */
  function lookAmt(x) {
    if (!LOOK) { return 0; }
    var a = 0, w = 0, i, xx, ww;
    /* noyau continu (plus le pas de 7 px qui faisait un escalier sur le flanc) */
    for (i = -32; i <= 32; i++) {
      ww = 1 - Math.abs(i) / 33;
      xx = Math.max(0, Math.min(len, (x + i) | 0));
      a += (LOOK[xx] || 0) * ww; w += ww;
    }
    return w ? a / w : 0;
  }
  function cutY(x, screenBottom) {
    var gy = G[x];
    if (!isFinite(gy) || gy < -1e5) { return screenBottom; }
    /* Même sol que les autres niveaux : la terre descend jusqu'en bas de l'écran.
       Pas d'arche ni de vide sous la crête. */
    return screenBottom;
  }
  /* Masse opaque arrêtée un peu au-dessus de la lèvre : le dernier cran est un fondu, plus un escalier net. */
  function solidCutY(x, screenBottom) {
    return cutY(x, screenBottom);
  }
  function smoothSolidCutY(x, screenBottom) {
    return (solidCutY(x - 2, screenBottom) + solidCutY(x - 1, screenBottom) * 2 + solidCutY(x, screenBottom) * 3 + solidCutY(x + 1, screenBottom) * 2 + solidCutY(x + 2, screenBottom)) / 9;
  }
  function terrainPaths(xa, xb, bottom) {
    var area = new Path2D(), lip = new Path2D(), cols = new Path2D(), under = new Path2D(), run = -1, x;
    function closeRun(xEnd) {
      var last = xEnd - 1, k;
      lip.lineTo(xEnd, G[last]);
      area.lineTo(xEnd, G[last]);
      area.lineTo(xEnd, smoothSolidCutY(last, bottom));
      under.moveTo(xEnd, smoothSolidCutY(last, bottom));
      for (k = last; k >= run; k--) { area.lineTo(k, smoothSolidCutY(k, bottom)); under.lineTo(k, smoothSolidCutY(k, bottom)); }
      area.closePath();
      cols.rect(run, -1e5, xEnd - run, 2e5);
      run = -1;
    }
    for (x = xa; x <= xb + 1; x++) {
      var solid = x <= xb && isFinite(G[x]);
      if (solid && run < 0) { run = x; area.moveTo(x, smoothSolidCutY(x, bottom)); area.lineTo(x, G[x]); lip.moveTo(x, G[x]); }
      else if (solid) { area.lineTo(x, G[x]); lip.lineTo(x, G[x]); }
      if (!solid && run >= 0) { closeRun(x); }
    }
    return { area: area, lip: lip, cols: cols, under: under };
  }

  function quarryTop(xx) {            // sommet de la paroi : grandes ondulations, plus de bande plate
    var f = 1 - sstep(1180, 1520, xx), g = GF[Math.min(len, Math.max(0, xx | 0))];
    var H = (78 + 20 * (nz(xx / 240, 21) - 0.35)) * f;
    if (f < 0.02) { return g; }
    var swell = (nz(xx / 78, 11) - 0.5) * 36 + (nz(xx / 42, 17) - 0.5) * 20 + (nz(xx / 140, 7) - 0.5) * 16;
    var detail = (nz(xx / 16, 41) - 0.5) * 5 + (nz(xx / 7, 47) - 0.5) * 2.2;
    var ty = g - H + swell + detail;
    var minH = 44 * f, maxH = 128 * f;
    if (g - ty < minH) { ty = g - minH; }
    if (g - ty > maxH) { ty = g - maxH; }
    if (ty > g - 10) { ty = g - 10; }
    return ty;
  }
  function drawQuarryWall(c, xa, xb, bottomY) {
    if (xa > 1560) { return; }
    var x, pts = [], x0 = Math.max(0, Math.floor(xa / 20) * 20 - 20), x1 = Math.min(1580, Math.ceil(xb / 20) * 20 + 20);
    var topAt = quarryTop;
    var wall = new Path2D(), started = false;
    for (x = x0; x <= x1; x += 4) {
      var gy = GF[x | 0];
      var ty = topAt(x), f2 = 1 - sstep(1180, 1520, x); if (f2 < 0.02 || ty > gy - 6) { ty = gy; }
      if (!started) { wall.moveTo(x, bottomY); wall.lineTo(x, ty); started = true; } else { wall.lineTo(x, ty); }
      pts.push([x, ty, ty < gy - 3]);
    }
    wall.lineTo(x1, bottomY); wall.closePath();
    c.save(); c.clip(wall);
    c.fillStyle = '#7d3329'; c.fillRect(x0, cam.y - 20, x1 - x0, bottomY - cam.y + 40);
    var cols = ['#2b1a24', '#b04a32', '#3a2230', '#d9823f', '#8d3529', '#1e141c', '#c25a3a', '#4a2630'];
    var yTop = Math.floor((cam.y - 10) / 9) * 9, yBot = cam.y + curVh + 10;
    for (var yy = yTop; yy < yBot; yy += 9) {
      var kk = Math.round(yy / 9), col = cols[(Math.abs(kk * 5 + ((kk * 7) % 3))) % cols.length], th = 4 + hash(kk, 31) * 7;
      c.beginPath();
      for (x = x0; x <= x1; x += 10) { var wy = yy + Math.sin(x * 0.025 + kk * 1.7) * 2.6 + (x * 0.012) * (hash(kk, 32) - 0.5) * 6; if (x === x0) { c.moveTo(x, wy); } else { c.lineTo(x, wy); } }
      c.strokeStyle = col; c.lineWidth = th; c.globalAlpha = 0.5; c.stroke(); c.globalAlpha = 1;
    }
    for (x = Math.floor(x0 / 24) * 24; x < x1; x += 24) {
      var cw = 10 + hash(x, 61) * 26, ca = 0.06 + hash(x, 62) * 0.16;
      c.fillStyle = 'rgba(24,8,18,' + ca.toFixed(2) + ')'; c.fillRect(x, cam.y - 20, cw, bottomY - cam.y + 40);
    }
    c.fillStyle = 'rgba(20,10,16,.25)'; for (x = Math.floor(x0 / 14) * 14; x < x1; x += 14) { for (var yy2 = yTop; yy2 < yBot; yy2 += 17) { var hh = hash(x, yy2 | 0); if (hh > 0.55) { c.beginPath(); c.arc(x + hh * 12, yy2 + hash(yy2 | 0, x) * 12, 0.5 + hh * 0.9, 0, 7); c.fill(); } } }
    c.fillStyle = A.grad(c, 0, cam.y, 0, cam.y + curVh * 0.95, [0, 'rgba(255,200,150,.22)', 0.55, 'rgba(255,150,110,.04)', 1, 'rgba(26,8,22,.45)']); c.fillRect(x0, cam.y - 20, x1 - x0, bottomY - cam.y + 40);
    c.fillStyle = 'rgba(255,225,205,.05)'; c.fillRect(x0, cam.y - 20, x1 - x0, bottomY - cam.y + 40);
    c.restore();
    c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath();
    pts.forEach(function (q, i) { if (!q[2]) { return; } if (i === 0 || !pts[i - 1][2]) { c.moveTo(q[0], q[1]); } else { c.lineTo(q[0], q[1]); } });
    c.strokeStyle = 'rgba(40,14,24,.45)'; c.lineWidth = 1.6; c.stroke();
    drawQuarryLisiere(c, xa, xb);
  }
  function lipY(x) {
    var gy = GF[Math.min(len, Math.max(0, x | 0))], ty = quarryTop(x);
    return (ty > gy - 6) ? gy : ty;
  }
  function bankCrest(x) {
    /* sommet du talus, juste au-dessus de la lèvre, sans dépasser vers le bas */
    return lipY(x) - (3.2 + nz(x / 13, 71) * 4.5 + nz(x / 6, 73) * 1.8);
  }
  function drawQuarryLisiere(c, xa, xb) {
    /* Talus pouzzolane qui suit les grandes ondes de la lèvre. Végétation
       uniquement posée sur le talus. Racines courtes. Éboulis au pied. */
    if (xa > 1560) { return; }
    var x0 = Math.max(0, Math.floor(xa) - 12), x1 = Math.min(1580, Math.ceil(xb) + 12);
    var x, gy, ty, crest, foot, bank = new Path2D(), started = false, lastX = x0, on;
    for (x = x0; x <= x1; x += 2) {
      gy = GF[Math.min(len, x | 0)];
      ty = quarryTop(x);
      on = ty < gy - 8;
      if (!on) {
        if (started) { bank.lineTo(x, ty + 1); started = false; }
        continue;
      }
      crest = bankCrest(x);
      if (!started) { bank.moveTo(x, ty + 1); bank.lineTo(x, crest); started = true; }
      else { bank.lineTo(x, crest); }
      lastX = x;
    }
    if (started) {
      for (x = lastX; x >= x0; x -= 2) {
        gy = GF[Math.min(len, x | 0)];
        ty = quarryTop(x);
        if (ty > gy - 8) { continue; }
        foot = ty + 4.5 + nz(x / 11, 75) * 3.5;
        bank.lineTo(x, foot);
      }
      bank.closePath();
      var gcol = c.createLinearGradient(0, cam.y, 0, cam.y + 90);
      gcol.addColorStop(0, '#8a4a32');
      gcol.addColorStop(0.4, '#9a5234');
      gcol.addColorStop(1, '#6a3226');
      c.fillStyle = gcol; c.fill(bank);
      c.strokeStyle = 'rgba(50, 20, 14, 0.35)'; c.lineWidth = 0.7; c.stroke(bank);
    }
    /* racines courtes, collées au talus — pas de fils dans le vide */
    c.lineCap = 'round';
    for (x = Math.floor(x0 / 16) * 16; x < x1; x += 16) {
      gy = GF[Math.min(len, x | 0)];
      ty = quarryTop(x);
      if (ty > gy - 8) { continue; }
      if (hash(x, 91) < 0.45) { continue; }
      var rx = x + hash(x, 92) * 8, ry = ty + 1.0, rl = 2.2 + hash(x, 93) * 2.6;
      c.strokeStyle = 'rgba(52, 26, 16, 0.7)'; c.lineWidth = 0.7 + hash(x, 94) * 0.4;
      c.beginPath(); c.moveTo(rx, ry); c.quadraticCurveTo(rx + (hash(x, 95) - 0.5) * 2.2, ry + rl * 0.55, rx + (hash(x, 95) - 0.5) * 1.4, ry + rl); c.stroke();
    }
    /* éboulis au pied du talus, posés contre la paroi */
    for (x = Math.floor(x0 / 11) * 11; x < x1; x += 11) {
      gy = GF[Math.min(len, x | 0)];
      ty = quarryTop(x);
      if (ty > gy - 8) { continue; }
      if (hash(x, 96) < 0.32) { continue; }
      var bx = x + hash(x, 97) * 8, by = ty + 5.5 + hash(x, 98) * 3.5, br = 1.4 + hash(x, 99) * 2.2;
      c.fillStyle = hash(x, 100) > 0.5 ? '#6a3830' : '#8a4a36';
      c.beginPath();
      c.moveTo(bx - br, by);
      c.lineTo(bx - br * 0.35, by - br * 0.85);
      c.lineTo(bx + br * 0.7, by - br * 0.45);
      c.lineTo(bx + br, by + br * 0.25);
      c.lineTo(bx - br * 0.15, by + br * 0.4);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(30, 12, 12, 0.4)'; c.lineWidth = 0.45; c.stroke();
    }
    /* buissons posés sur le sommet du talus : toute la silhouette au-dessus de la crête */
    for (x = Math.floor(x0 / 10) * 10; x < x1; x += 10) {
      gy = GF[Math.min(len, x | 0)];
      ty = quarryTop(x);
      if (ty > gy - 8) { continue; }
      if (hash(x, 101) < 0.28) { continue; }
      var tx = x + hash(x, 102) * 6, cr = bankCrest(tx), hs = 3.5 + hash(x, 103) * 5.5, tw = 2.6 + hash(x, 105) * 3.2;
      c.fillStyle = hash(x, 106) > 0.5 ? '#2a5a3a' : '#1e4a30';
      c.beginPath();
      c.moveTo(tx - tw, cr);
      c.quadraticCurveTo(tx - tw * 0.6, cr - hs * 0.55, tx, cr - hs);
      c.quadraticCurveTo(tx + tw * 0.6, cr - hs * 0.5, tx + tw, cr);
      c.closePath(); c.fill();
    }
  }

  function drawBombs(c, xa, xb) {
    [[190, 8, 3], [470, 10, 7], [760, 7, 11], [1040, 9, 17], [1250, 6, 5], [2050, 6, 9], [3180, 7, 23], [3560, 6, 29], [4120, 8, 31]].forEach(function (b) {
      if (b[0] < xa - 16 || b[0] > xb + 16) { return; }
      var gy = G[b[0]]; if (!isFinite(gy)) { return; }
      var r = b[1] * 0.36;   // simples cailloux décoratifs : trop petits pour être pris pour un rocher bloquant
      c.save(); c.fillStyle = 'rgba(25,8,20,.28)'; c.beginPath(); c.ellipse(b[0] + 1, gy + 0.6, r * 1.2, 1.7, 0, 0, 7); c.fill(); c.restore();
      c.save(); c.beginPath(); c.rect(b[0] - r * 2, gy - r * 2.2, r * 4, r * 2.2 + 0.2); c.clip();
      A.drawRock(c, b[0], gy - r * 0.55, r, 0.5 + b[2], b[2], true); c.restore();
    });
  }
  function drawFence(c, xa, xb) {
    var f0 = 120, f1 = 245; if (xb < f0 - 10 || xa > f1 + 10) { return; }
    var x; c.lineCap = 'round';
    for (x = f0; x <= f1; x += 17) {
      var gy = G[x]; c.fillStyle = '#4a2f1f'; c.fillRect(x - 1, gy - 12, 2.4, 12.5); c.fillStyle = '#b07a48'; c.fillRect(x - 1, gy - 12, 1.2, 12.5); c.fillStyle = '#d8a468'; c.fillRect(x - 1, gy - 12, 2.4, 1);
    }
    [-9, -4.5].forEach(function (o) { c.beginPath(); c.moveTo(f0, G[f0] + o); for (x = f0; x <= f1; x += 17) { c.lineTo(x, G[x] + o); } c.strokeStyle = '#4a2f1f'; c.lineWidth = 2.1; c.stroke(); c.strokeStyle = '#c08850'; c.lineWidth = 1.2; c.stroke(); });
  }
  function board(c, x, y, w, h, lines, size) {
    var gx = x, gy = y; if (!isFinite(gy) || gy < -1e5) { return; }
    c.fillStyle = '#4a2f1f'; c.fillRect(gx + 4, gy + h - 1, 2.4, 20); c.fillRect(gx + w - 7, gy + h - 1, 2.4, 20);
    c.beginPath(); A.rrect(c, gx, gy, w, h, 2.2); c.fillStyle = A.grad(c, 0, gy, 0, gy + h, [0, '#7a4e30', 1, '#573520']); c.fill(); c.lineWidth = 0.9; c.strokeStyle = '#2a1810'; c.stroke();
    c.beginPath(); A.rrect(c, gx + 1.6, gy + 1.6, w - 3.2, h - 3.2, 1.4); c.strokeStyle = 'rgba(255,220,170,.55)'; c.lineWidth = 0.5; c.stroke();
    c.font = size + 'px "Press Start 2P", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f7ecd2';
    lines.forEach(function (t, i) { c.fillText(t, gx + w / 2, gy + h / 2 + (i - (lines.length - 1) / 2) * (size + 2.4)); });
  }

  function drawProps(c, xa, xb) {
    var x, gy;
    // végétation du bord du chemin (herbe, fougères, callune, buissons, genêts, fleurs) selon le biome
    Scenery.lip(c, xa, xb, { G: G, TYPE: TYPE, time: time }, { mix: floraCfg().lipMix });
    drawBombs(c, xa, xb); drawFence(c, xa, xb);
    // panneau de départ (nom du puy) et panneau d'information sur la carrière
    if (xa < 110) { board(c, 62, G[70] - 33, 38, 15, ['PUY DE', 'LA VACHE'], 3.4); }
    if (xb > 290 && xa < 380) { board(c, 300, G[300] - 41, 66, 25, ['UNE CARRIÈRE', 'EN ROUGE', 'ET NOIR'], 3.3); }
  }

  function drawStairs(c, xa, xb) {
    feat.stairs.forEach(function (s) {
      if (s.x1 < xa || s.x0 > xb) { return; }
      for (var x = s.x0; x < s.x1; x += 12) {
        if (x + 12 < xa || x > xb) { continue; }
        var gy = G[x + 1], gy2 = G[Math.min(len, x + 13)], pq = bw(x)[0];
        c.fillStyle = pq > 0.5 ? '#6a4328' : '#8a6038'; c.fillRect(x, gy - 0.4, 12.4, 3.2);
        c.fillStyle = pq > 0.5 ? '#c08850' : '#d6a766'; c.fillRect(x, gy - 0.4, 12.4, 1.2);
        c.fillStyle = '#2a1810'; c.fillRect(x, gy + 2.6, 12.4, 0.6); c.fillRect(x + 11.6, gy - 0.4, 0.8, 3.4);
        c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x + 1.3, gy + 0.4, 0.8, 0.8); c.fillRect(x + 9.8, gy + 0.4, 0.8, 0.8);
      }
    });
  }

  /* gouffre : le vide est un voile sombre qui commence au niveau du bord le plus bas et s'épaissit vers le fond
     (aucun pixel au-dessus du sol : le décor continue de se voir derrière) ; les bords sont des coupes nettes
     dessinées dans drawTerrain, calées sur la hauteur réelle du sol de chaque côté. */
  function gapEdges(gp) {
    var gl = G[gp.x0 - 1], gr = G[gp.x1]; if (!isFinite(gl)) { gl = gp.y; } if (!isFinite(gr)) { gr = gl; }
    return { gl: gl, gr: gr, top: Math.max(gl, gr) };
  }
  function drawGaps(c, xa, xb, bottom) {
    /* Sous une mer de nuages, le gouffre reste ouvert : pas de voile sombre de carrière. */
    if (TH && TH.cloudSea) { return; }
    liveGaps().forEach(function (gp) {
      if (gp.x1 < xa - 4 || gp.x0 > xb + 4) { return; }
      var e = gapEdges(gp), w = gp.x1 - gp.x0, y0 = e.top - 0.5, hh = Math.max(40, bottom - y0);
      c.save(); c.beginPath(); c.rect(gp.x0 - 0.6, y0, w + 1.2, hh); c.clip();
      var g = c.createLinearGradient(0, y0, 0, y0 + 90);
      g.addColorStop(0, 'rgba(40,22,58,0)'); g.addColorStop(0.14, 'rgba(36,18,54,.72)'); g.addColorStop(0.45, 'rgba(22,10,36,.96)'); g.addColorStop(1, 'rgba(8,3,14,1)');
      c.fillStyle = g; c.fillRect(gp.x0 - 1, y0, w + 2, hh);
      c.fillStyle = '#080310'; c.fillRect(gp.x0 - 1, y0 + 90, w + 2, Math.max(0, bottom - y0 - 89));
      // brume chaude qui monte du fond
      var mg = c.createLinearGradient(0, e.top + 30, 0, e.top + 150); mg.addColorStop(0, 'rgba(255,170,130,0)'); mg.addColorStop(1, 'rgba(255,150,120,.12)'); c.fillStyle = mg; c.fillRect(gp.x0, e.top + 30, w, 130);
      c.restore();
    });
  }

  function cutProfileId() {
    var t = (W && W.theme) || '';
    if (t === 'mary') { return 'mary'; }
    if (t === 'sancy') { return 'sancy'; }
    if (t === 'ursuya' || t === 'atxuria' || t === 'orhy' || t === 'rhune' || t === 'artzamendi' || t === 'aizkorri' || t === 'txindoki') { return 'basque'; }
    if (t === 'poupet' || t === 'dor' || t === 'van' || t === 'colombier' || t === 'colomby' || t === 'dole' || t === 'reculet' || t === 'neige') { return 'jura'; }
    return 'auvergne';
  }
  function drawCutBeds(c, xa, xb) {
    var id = cutProfileId(), pr = A.cutProfile(id), tilt = pr.tilt, beds = pr.beds;
    var yTop = cam.y - 10, yBot = cam.y + curVh + 12, k, k0, k1, x, y, yC, sp, fam, col, lw, a, broken, xS, gyS, hS, rr;
    var fams = id === 'mary' ? [17.9, 29.3, 43.1] : (id === 'sancy' ? [10.7, 16.9, 27.3] : (id === 'jura' ? [13.1, 21.7, 34.9] : [12.3, 19.7, 31.3]));
    c.lineJoin = 'round'; c.lineCap = 'butt';
    for (fam = 0; fam < fams.length; fam++) {
      sp = fams[fam];
      k0 = Math.floor((yTop - 30 - tilt * xa) / sp) - 1;
      k1 = Math.ceil((yBot + 30 + Math.abs(tilt) * xb) / sp) + 1;
      for (k = k0; k <= k1; k++) {
        if (hash(k * 13 + fam, 80) < pr.skip) { continue; }
        yC = k * sp + 4.3 * Math.sin(k * 1.732 + fam) + 2.6 * Math.sin(k * 2.411 + fam * 0.7);
        col = beds[((hash(k, 82 + fam) * beds.length) | 0)];
        a = (0.10 + 0.10 * hash(k, 83)) * (fam === 0 ? 1 : (fam === 1 ? 0.78 : 0.55));
        if (id === 'mary') { a *= 0.40; }
        lw = (fam === 0 ? 1.15 : 0.7) + 1.1 * hash(k, 84);
        if (id === 'mary') { lw *= 0.82; }
        c.strokeStyle = rgba(col, a); c.lineWidth = lw;
        c.beginPath();
        broken = ((id === 'jura' || id === 'mary') && hash(k, 85) > (id === 'mary' ? 0.40 : 0.55));
        var started = false;
        for (x = xa - 10; x <= xb + 10; x += 5) {
          if (broken && hash((x / 18) | 0, k + 86) > 0.82) { if (started) { c.stroke(); } c.beginPath(); started = false; continue; }
          y = yC + tilt * x + 3.1 * Math.sin(x / 37.1 + k * 0.37) + 2.0 * Math.sin(x / 61.7 + k) + 1.05 * Math.sin(x / 19.3 + fam);
          if (!started) { c.moveTo(x, y); started = true; } else { c.lineTo(x, y); }
        }
        if (started) { c.stroke(); }
      }
    }
    if (id === 'jura') {
      c.lineWidth = 0.55;
      k0 = Math.floor((yTop - 24 - tilt * xa) / 18.7) - 1;
      k1 = Math.ceil((yBot + 24 + Math.abs(tilt) * xb) / 18.7) + 1;
      for (k = k0; k <= k1; k++) {
        if (hash(k, 90) > 0.28) { continue; }
        yC = k * 18.7 + 3 * Math.sin(k * 1.1);
        c.strokeStyle = 'rgba(236,232,220,' + (0.10 + 0.08 * hash(k, 91)).toFixed(3) + ')';
        c.beginPath();
        var startedV = false;
        for (x = xa - 8; x <= xb + 8; x += 6) {
          y = yC + tilt * x * 1.15 + 1.4 * Math.sin(x / 29.3 + k);
          if (hash((x / 22) | 0, k + 92) > 0.78) { if (startedV) { c.stroke(); } c.beginPath(); startedV = false; continue; }
          if (!startedV) { c.moveTo(x, y); startedV = true; } else { c.lineTo(x, y); }
        }
        if (startedV) { c.stroke(); }
      }
    }
    for (xS = Math.floor(xa / 16) * 16; xS < xb + 16; xS += 16) {
      hS = hash(xS, 71); gyS = G[Math.max(0, Math.min(len, xS | 0))];
      if (!isFinite(gyS) || hS > 0.34) { continue; }
      rr = 1.3 + hash(xS, 72) * 2.8;
      c.fillStyle = rgba(beds[(hash(xS, 73) * beds.length) | 0], 0.22 + 0.16 * hash(xS, 74));
      c.beginPath(); c.ellipse(xS + hash(xS, 75) * 10, gyS + 7 + hash(xS, 76) * 52, rr, rr * (0.45 + 0.3 * hash(xS, 77)), (hash(xS, 78) - 0.5) * 0.9, 0, 7); c.fill();
    }
  }
  function drawSnowLip(c, xa, xb) {
    var x, gy, h, snow, w;
    for (x = (xa | 0) - 1; x <= xb + 1; x++) {
      w = bw(x); snow = w[3] || 0;
      if (snow < 0.22) { continue; }
      gy = G[Math.max(0, Math.min(len, x | 0))];
      if (!isFinite(gy)) { continue; }
      h = (3.4 + 1.5 * Math.sin(x / 31.3) + 0.9 * Math.sin(x / 13.9) + 0.5 * Math.sin(x / 7.1)) * (0.45 + 0.55 * Math.min(1, snow));
      if (h < 2.2) { h = 2.2; }
      c.fillStyle = 'rgba(236,242,250,0.94)'; c.fillRect(x, gy, 1.12, h * 0.62);
      c.fillStyle = 'rgba(150,148,146,0.45)'; c.fillRect(x, gy + h * 0.5, 1.12, h * 0.5);
    }
  }
  function drawTerrain(c, xa, xb, bottom) {

    var tp = terrainPaths(xa, xb, bottom + 8);
    // masse de terre : couleur géologique du massif (pas la teinte de surface du sentier)
    var cidT = cutProfileId(), prT = A.cutProfile(cidT);
    c.fillStyle = prT.fill || hGrad(c, xa, xb, function (x) { return pcol('base', x); }, 'base');
    c.fill(tp.area);
    /* Coupe géologique F-DA-01 : grain pré-calculé, strates ondulantes en Y-monde
       (fréquences incommensurables, pas de copies de la lèvre), dégradé vers le bas. */
    c.save(); c.clip(tp.area);
    if (cutShadeImg) { c.drawImage(cutShadeImg, xa - 2, cam.y, (xb - xa) + 4, curVh); }
    if (tilePat) { c.fillStyle = tilePat; c.globalAlpha = cutGrainA; c.fill(tp.area); c.globalAlpha = 1; }
    drawCutBeds(c, xa, xb);
    if (prT.snowLip) { drawSnowLip(c, xa, xb); }
    c.restore();
    /* Pelouse : fine bande de quelques unités sous la lèvre, alpha continu
       (lookAmt déjà lissé). Pas de voile profond, pas de seuil qui crée un bord vertical. */
    if (LOOK) {
      var xF, hasF = false, aF, aF2, gyF, kF, hF, snowF;
      for (xF = xa; xF <= xb; xF += 8) { if (lookAmt(xF) > 0.02) { hasF = true; break; } }
      if (hasF) {
        c.save(); c.clip(tp.area);
        for (xF = (xa | 0) - 1; xF <= xb + 1; xF++) {
          aF2 = lookAmt(xF);
          if (aF2 < 0.02) { continue; }
          snowF = bw(xF)[3] || 0;
          if (snowF > 0.22) { continue; }
          gyF = G[Math.max(0, Math.min(len, xF | 0))];
          if (!isFinite(gyF)) { continue; }
          kF = aF2 <= 1 ? aF2 : Math.max(0, 1.12 - 0.12 * (aF2 - 1));
          hF = 3.4 + 0.8 * Math.sin(xF / 11.3) + 0.45 * Math.sin(xF / 5.9);
          c.fillStyle = 'rgba(150,184,72,' + (0.80 * kF).toFixed(3) + ')';
          c.fillRect(xF, gyF, 1.12, hF * 0.62);
          c.fillStyle = 'rgba(88,118,48,' + (0.32 * kF).toFixed(3) + ')';
          c.fillRect(xF, gyF + hF * 0.48, 1.12, hF * 0.52);
        }
        c.restore();
      }
    }
    // coupes nettes des gouffres : ombre portée sur la face, calée sur la hauteur réelle de chaque bord
    c.save(); c.clip(tp.area);
    liveGaps().forEach(function (gp) {
      if (gp.x1 < xa || gp.x0 > xb) { return; }
      var e = gapEdges(gp), k;
      for (k = 0; k < 4; k++) {
        var a = [0.5, 0.32, 0.18, 0.08][k];
        var gL = c.createLinearGradient(0, e.gl, 0, e.gl + 120); gL.addColorStop(0, 'rgba(14,6,18,1)'); gL.addColorStop(1, 'rgba(14,6,18,0)');
        var gR = c.createLinearGradient(0, e.gr, 0, e.gr + 90); gR.addColorStop(0, 'rgba(14,6,18,1)'); gR.addColorStop(1, 'rgba(14,6,18,0)');
        c.globalAlpha = a; c.fillStyle = gL; c.fillRect(gp.x0 - 1 - k, e.gl, 1, 120);
        c.globalAlpha = a * 0.6; c.fillStyle = gR; c.fillRect(gp.x1 + k, e.gr, 1, 90);
      }
      c.globalAlpha = 1;
      var rl = c.createLinearGradient(0, e.gr, 0, e.gr + 70); rl.addColorStop(0, 'rgba(255,196,130,.55)'); rl.addColorStop(1, 'rgba(255,196,130,0)');
      c.fillStyle = rl; c.fillRect(gp.x1, e.gr, 0.7, 70);
    });
    c.restore();
    // lèvre : chemin (coupée net aux bords des gouffres)
    c.save(); c.clip(tp.cols);
    c.lineJoin = 'round'; c.lineCap = 'butt';
    c.strokeStyle = hGrad(c, xa, xb, function (x) { return rgba(pcol('dark', x), 0.8); }, 'dark'); c.lineWidth = 4.2; c.stroke(tp.lip);
    c.strokeStyle = hGrad(c, xa, xb, function (x) { return pcol('lip', x); }, 'lip'); c.lineWidth = 2.6; c.stroke(tp.lip);
    c.save(); c.translate(0, -0.7); c.strokeStyle = hGrad(c, xa, xb, function (x) { return rgba(pcol('hi', x), 0.8); }, 'hi'); c.lineWidth = 0.9; c.stroke(tp.lip); c.restore();
    c.restore();
    /* lèvre inférieure d'une crête / d'un flanc : le vide se lit sous le sentier */
    if (tp.under) {
      var xU, hasCut = false;
      for (xU = xa; xU <= xb; xU += 8) { if (cutY(xU, bottom + 8) < bottom - 4) { hasCut = true; break; } }
      if (hasCut) {
        c.save();
        /* Lèvre inférieure : même teinte que la terre, trait anti-aliasé. Pas de voile. */
        c.save();
        c.lineJoin = 'round'; c.lineCap = 'round';
        c.strokeStyle = hGrad(c, xa, xb, function (x) { return pcol('base', x); }, 'base2');
        c.lineWidth = 2.0; c.stroke(tp.under);
        c.restore();
        c.restore();
      }
    }
    // coulée de lave (cheire) : cordes de basalte sur la brèche
    var bx0 = Math.max(xa, 4470);
    if (xb > 4470 && !TH) {
      c.save(); c.clip(tp.area); c.strokeStyle = 'rgba(14,10,22,.55)'; c.lineWidth = 0.8;
      for (var x = Math.floor(bx0 / 9) * 9; x < xb; x += 9) { var gy = G[x]; for (var r = 0; r < 4; r++) { c.beginPath(); c.arc(x + r * 3, gy + 5 + r * 8, 6, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } }
      c.restore();
    }
  }

  /* végétation du niveau 1 : forêt de sapins dense à la carrière (au bord de la paroi), qui s'éclaircit avec l'altitude en
     buissons, genêts et callune sur les pentes de scories. Tout est planté sur le profil du terrain (Scenery.rows / lip). */
  var FL = null;
  function floraCfg() {
    if (FL) { return FL; }
    var Hq = function (x) { return x > 1600 ? 0 : GF[Math.min(len, x | 0)] - quarryTop(x); };
    var fc = function (x) { return Math.pow(1 - sstep(1500, 3000, x), 0.85); };
    var tall = function (x) { return lerp(54, 24, sstep(1500, 2900, x)); };
    var sh = function (x) { return sstep(1250, 2300, x) * (1 - 0.5 * sstep(3300, 4300, x)) * (1 - sstep(4380, 4450, x) * 0.2); };
    var kindF = function (x, h) { return (x > 1550 && x < 2500 && h < 0.3) ? 'beech' : 'fir'; };
    FL = { hazeCol: '#b87aa8', rows: [
      { step: 15, seed: 11, haze: 0.38, fillTop: '#2c5a4a', fillBot: '#1d3f36', up: function (x) { return Hq(x) + 21 * fc(x) + 2; }, dens: function (x) { return 0.96 * fc(x); }, size: function (x) { return tall(x) * 1.1; }, kind: kindF },
      { step: 17, seed: 23, haze: 0.16, fillTop: '#2a5a41', fillBot: '#1b3d2e', up: function (x) { return Hq(x) + 10 * fc(x) + 1; }, dens: function (x) { return 0.92 * fc(x); }, size: function (x) { return tall(x); }, kind: kindF },
      { step: 24, seed: 37, haze: 0, sink: 0, fillTop: '#244c36', fillBot: '#173326', up: function (x) { return Hq(x) + 3; }, dens: function (x) { return 0.85 * fc(x); }, size: function (x) { return tall(x) * 0.9; }, kind: kindF },
      { step: 9, seed: 61, haze: 0, sink: 0, fillTop: '#244c36', fillBot: '#173326', up: function (x) { return Hq(x) + 2; }, dens: function (x) { return 0.8 * fc(x) * (Hq(x) > 4 ? 1 : 0); }, size: function (x) { return 13; }, kind: function (x, h) { return 'bush'; } },
      { step: 11, seed: 51, haze: 0, sink: 3, fillTop: '#2c5a3a', fillBot: '#1b3a2a', up: function (x) { return 3 + 0 * x; }, dens: function (x) { return sh(x) * 0.8 * (1 - 0.8 * sstep(0, 1, Hq(x) / 30)); }, size: function (x) { return 12 + 3 * Math.sin(x / 70); },
        kind: function (x, h) { return (x > 2500 && h < 0.5 + 0.4 * sstep(2600, 3600, x)) ? 'heather' : 'bush'; } }
    ] };
    FL.lipMix = function (x) {
      var w = bw(x), q = w[0], f = w[1], c = w[2], k = w[3];
      var gcol = mix(mix('#8a8a4a', '#74b44a', f), '#a89a58', c * 0.8); gcol = mix(gcol, '#7fae52', k);
      return { dens: 0.3 * q + 0.9 * f + 0.6 * c + 0.65 * k, grass: 1.2 + 0.4 * c, fern: 0.7 * f, heather: 0.7 * c + 0.35 * k, bush: 0.3 * f + 0.4 * c + 0.2 * k, broom: 0.25 * c * sstep(3000, 3400, x), flower: 0.35 * f + 0.1, gcol: mix(gcol, '#3f6a30', 0.25), gcol2: mix(gcol, '#c4e07a', 0.5) };
    };
    return FL;
  }
  function drawFlora(c, xa, xb, bottom) { Scenery.rows(c, xa, xb, bottom, { GF: GF, len: len, time: time, camY: cam.y, vh: curVh }, floraCfg()); }
  function drawCraterBack(c, xa, xb) {
    if (xb < 4300) { return; }
    var rimY = feat.topY, fl = feat.craterFloor, ax = 4360, bx = 4700;
    // bras opposé du fer à cheval, derrière la cuvette : s'élève depuis la brèche et retombe sur la coulée
    var d = new Path2D(); d.moveTo(ax, fl + 8);
    for (var x = ax; x <= bx; x += 6) { var t = (x - ax) / (bx - ax), hh = 62 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), 0.85) * (1 - 0.35 * t) + 4 * nz(x / 14, 41); d.lineTo(x, fl - hh + 6); }
    d.lineTo(bx, fl + 30); d.closePath();
    c.fillStyle = A.grad(c, 0, rimY - 20, 0, fl + 10, [0, '#c0644a', 0.45, '#8a3f34', 1, '#5a3a40']); c.fill(d);
    c.save(); c.clip(d); c.fillStyle = 'rgba(40,16,30,.28)'; for (var i = 0; i < 24; i++) { c.beginPath(); c.arc(ax + hash(i, 5) * (bx - ax), rimY + hash(i, 6) * 80, 2 + hash(i, 7) * 6, 0, 7); c.fill(); } c.restore();
    c.strokeStyle = 'rgba(255,214,160,.8)'; c.lineWidth = 1; c.beginPath(); for (x = ax; x <= bx; x += 6) { var t2 = (x - ax) / (bx - ax), h3 = 62 * Math.pow(Math.sin(Math.PI * Math.min(1, t2 * 1.05)), 0.85) * (1 - 0.35 * t2) + 4 * nz(x / 14, 41); if (x === ax) { c.moveTo(x, fl - h3 + 6); } else { c.lineTo(x, fl - h3 + 6); } } c.stroke();
    // lisière verte sur le flanc
    c.fillStyle = 'rgba(80,140,90,.5)'; c.fillRect(0, 0, 0, 0);
  }

  function drawBoulders(c, xa, xb) {
    feat.boulders.forEach(function (b) {
      if (b.x < xa - 20 || b.x > xb + 20) { return; }
      var x0 = b.x - 10, x1 = b.x + 10, x, gy = G[b.x | 0], pth = new Path2D(), i;
      c.fillStyle = 'rgba(25,8,20,.3)'; c.beginPath(); c.ellipse(b.x + 3, gy + 1, b.hw + 3, 2.2, 0, 0, 7); c.fill();
      pth.moveTo(x0, G[x0] + 1.6); for (x = x0; x <= x1; x++) { pth.lineTo(x, G[x] - bAt(x)); } pth.lineTo(x1, G[x1] + 1.6); pth.closePath();
      c.fillStyle = A.grad(c, b.x - b.hw, gy - b.h, b.x + b.hw, gy + 2, (A.rockPal ? [0, A.rockPal.hi, 0.38, A.rockPal.mid, 1, A.rockPal.lo] : [0, '#9a7570', 0.38, '#5a3f43', 1, '#241820'])); c.fill(pth);
      c.save(); c.clip(pth);
      c.strokeStyle = 'rgba(20,10,14,.55)'; c.lineWidth = 0.7;
      for (i = 0; i < 4; i++) { var fx = b.x - b.hw * 0.8 + hash(i, b.seed) * b.hw * 1.6, fy = gy - b.h * (0.25 + hash(i, b.seed + 1) * 0.65); c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + (hash(i, b.seed + 2) - 0.35) * 7, fy + 3 + hash(i, b.seed + 3) * 5); c.lineTo(fx + (hash(i, b.seed + 4) - 0.2) * 6, gy + 2); c.stroke(); }
      c.fillStyle = A.rockPal ? A.rockPal.spot : 'rgba(190,70,40,.5)'; for (i = 0; i < 6; i++) { c.beginPath(); c.arc(b.x + (hash(i, b.seed + 5) - 0.5) * b.hw * 1.6, gy - hash(i, b.seed + 6) * b.h * 0.8, 0.9 + hash(i, b.seed + 7) * 1.3, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(20,10,14,.5)'; for (i = 0; i < 4; i++) { c.beginPath(); c.arc(b.x + (hash(i, b.seed + 8) - 0.5) * b.hw * 1.7, gy - hash(i, b.seed + 9) * b.h * 0.6, 0.8, 0, 7); c.fill(); }
      if (bw(b.x)[1] > 0.4) { c.fillStyle = 'rgba(96,150,72,.75)'; c.beginPath(); c.ellipse(b.x - 2, G[(b.x - 2) | 0] - bAt(b.x - 2) + 0.8, 5.5, 1.5, 0, 0, 7); c.fill(); }
      c.restore();
      c.beginPath(); for (x = x0 + 1; x < b.x + 2; x++) { var ty = G[x] - bAt(x); if (x === x0 + 1) { c.moveTo(x, ty); } else { c.lineTo(x, ty); } } c.strokeStyle = A.rockPal ? A.rockPal.rim : 'rgba(255,214,176,.5)'; c.lineWidth = 0.9; c.stroke();
      c.lineWidth = 0.8; c.strokeStyle = A.rockPal ? A.rockPal.line : '#150d12'; c.stroke(pth);
    });
  }
  function drawFinds(c, xa, xb) {
    feat.finds.forEach(function (f) {
      if (f.x < xa - 20 || f.x > xb + 20) { return; }
      var bob = Math.sin(time * 2.4 + f.ph) * 2, y = f.y + bob, x = f.x, pulse = 0.5 + 0.5 * Math.sin(time * 4 + f.ph);
      c.save();
      if (f.got) { c.globalAlpha = 0.28; }
      else {
        c.globalCompositeOperation = 'lighter'; var gg = c.createRadialGradient(x, y, 0, x, y, 15); gg.addColorStop(0, 'rgba(255,230,140,' + (0.4 + 0.25 * pulse) + ')'); gg.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = gg; c.fillRect(x - 16, y - 16, 32, 32);
        c.globalCompositeOperation = 'source-over';
      }
      c.translate(x, y);
      if (TH && TH.drawFind && TH.drawFind(c, f, EV)) { /* dessiné par le thème */ }
      else if (f.id === 'bomb') { c.rotate(-0.5); c.beginPath(); c.moveTo(-5.5, 0); c.quadraticCurveTo(0, -4.4, 5.5, 0); c.quadraticCurveTo(0, 4.4, -5.5, 0); c.fillStyle = A.grad(c, 0, -4, 0, 4, [0, '#8a5a40', 1, '#3a2018']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#1a0e0c'; c.stroke(); c.strokeStyle = 'rgba(230,110,60,.8)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-3, -1); c.lineTo(3, 1); c.stroke(); }
      else if (f.id === 'crystal') { c.beginPath(); c.moveTo(0, -6); c.lineTo(3.6, -1.5); c.lineTo(2.4, 4.5); c.lineTo(-2.4, 4.5); c.lineTo(-3.6, -1.5); c.closePath(); c.fillStyle = A.grad(c, -3, -6, 3, 5, [0, '#e8ff9a', 0.5, '#9ad05a', 1, '#4f8a3a']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#243a1c'; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-1, -3.5); c.lineTo(-1.8, 0.5); c.stroke(); }
      else { c.beginPath(); c.moveTo(-6, 1.5); c.lineTo(-4.5, -2.6); c.lineTo(3.5, -3.2); c.lineTo(6.2, 0.8); c.lineTo(3, 3.2); c.lineTo(-3.8, 3.4); c.closePath(); c.fillStyle = A.grad(c, 0, -3, 0, 3.5, [0, '#b8584a', 1, '#5a2a2c']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#1e1014'; c.stroke(); c.fillStyle = 'rgba(30,16,20,.6)'; c.fillRect(-2, -1, 1.3, 1.3); c.fillRect(1.5, 0.3, 1.1, 1.1); }
      c.restore();
      if (!f.got) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,255,230,' + (0.35 + 0.5 * pulse) + ')'; var sx = x + 7 * Math.cos(time * 1.7 + f.ph), sy = y - 6 + 3 * Math.sin(time * 2.1 + f.ph); c.fillRect(sx - 0.4, sy - 1.8, 0.8, 3.6); c.fillRect(sx - 1.8, sy - 0.4, 3.6, 0.8); c.restore(); }
    });
  }

  function drawFeatures(c, xa, xb) {
    drawBoulders(c, xa, xb); drawFinds(c, xa, xb);
    // points de contrôle : mât + fanion
    feat.cps.forEach(function (cp) {
      if (cp.id === 0) { return; }
      var on = lastCp.id >= cp.id, x = cp.x, y = cp.y;
      if (on) { var gg = c.createRadialGradient(x + 6, y - 24, 0, x + 6, y - 24, 22); gg.addColorStop(0, 'rgba(140,255,170,.45)'); gg.addColorStop(1, 'rgba(140,255,170,0)'); c.fillStyle = gg; c.fillRect(x - 20, y - 50, 52, 52); }
      c.fillStyle = '#2a1810'; c.fillRect(x - 0.4, y - 31, 2.4, 31.4); c.fillStyle = '#c9a068'; c.fillRect(x, y - 31, 1.2, 31);
      c.beginPath(); c.arc(x + 0.8, y - 31, 1.6, 0, 7); c.fillStyle = '#ffd34d'; c.fill();
      var wv = Math.sin(time * 4.5 + x) * 1.6;
      c.beginPath(); c.moveTo(x + 2, y - 29.5); c.bezierCurveTo(x + 8, y - 31.5 + wv, x + 13, y - 27.5 - wv, x + 19, y - 28.5 + wv * 0.6); c.lineTo(x + 16, y - 24); c.lineTo(x + 19, y - 19.5 + wv * 0.4); c.bezierCurveTo(x + 13, y - 20.5 - wv, x + 8, y - 22.5 + wv, x + 2, y - 21.5); c.closePath();
      c.fillStyle = on ? A.grad(c, x, 0, x + 19, 0, [0, '#58d878', 1, '#2aa458']) : A.grad(c, x, 0, x + 19, 0, [0, '#dcdcdc', 1, '#a8a8b4']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#2a1810'; c.stroke();
      c.fillStyle = on ? '#fff' : '#7a7a86'; c.beginPath(); c.arc(x + 7, y - 25.4, 1.7, 0, 7); c.fill();
      c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(x + 0.8, y + 0.3, 5, 1.5, 0, 0, 7); c.fill();
    });
    // bouteilles d'eau
    feat.bottles.forEach(function (b) {
      if (b.taken || b.x < xa - 20 || b.x > xb + 20) { return; }
      var bob = Math.sin(time * 3 + b.x) * 2.2;
      A.drawBottle(c, b.x, b.y + bob, 10.5, true, time);
      c.save(); c.globalCompositeOperation = 'lighter'; var sp = (time * 1.3 + b.x) % 1; c.fillStyle = 'rgba(255,255,255,' + (0.7 * (1 - sp)) + ')'; c.beginPath(); c.arc(b.x + 4, b.y + bob - 6 - sp * 4, 0.9, 0, 7); c.fill(); c.restore();
    });
    // sommet : cairn, drapeau, panneau d'altitude
    var sx = feat.summitX, sy = feat.summitY; if (xb < sx - 80 || xa > sx + 120) { return; }
    if (TH && TH.summitReplace) { if (TH.drawSummit) { TH.drawSummit(c, sx, sy, EV); } return; }
    if (!(TH && TH.hideSummitCairn)) {
    c.fillStyle = 'rgba(25,8,20,.3)'; c.beginPath(); c.ellipse(sx + 28, sy + 0.5, 15, 2.2, 0, 0, 7); c.fill();
    [[sx + 28, sy - 4, 10, 4.4, '#8b8190'], [sx + 24, sy - 8.8, 7, 3.5, '#a39aa5'], [sx + 31, sy - 8.4, 6, 3.3, '#7f7586'], [sx + 27.5, sy - 12.6, 5, 3, '#b3abb4']].forEach(function (s, i) {
      c.beginPath(); c.ellipse(s[0], s[1], s[2], s[3], 0, 0, 7); c.fillStyle = A.grad(c, 0, s[1] - s[3], 0, s[1] + s[3], [0, mix(s[4], '#ffffff', 0.25), 1, mix(s[4], '#000000', 0.25)]); c.fill(); c.lineWidth = 0.6; c.strokeStyle = '#2a1830'; c.stroke();
    });
    }
    if (!(TH && TH.hideSummitFlag)) {
      c.fillStyle = '#2a1810'; c.fillRect(sx + 26.8, sy - 56, 2.2, 44); c.fillStyle = '#d0a46a'; c.fillRect(sx + 27.2, sy - 56, 1, 44); c.beginPath(); c.arc(sx + 27.9, sy - 56.5, 1.5, 0, 7); c.fillStyle = '#ffd34d'; c.fill();
      var fw = Math.sin(time * 5) * 1.7, fx = sx + 29, fy = sy - 55;
      c.beginPath(); c.moveTo(fx, fy); c.bezierCurveTo(fx + 8, fy - 2 + fw, fx + 15, fy + 2 - fw, fx + 23, fy + fw * 0.5); c.lineTo(fx + 23, fy + 10 + fw * 0.5); c.bezierCurveTo(fx + 15, fy + 12 - fw, fx + 8, fy + 8 + fw, fx, fy + 10); c.closePath();
      c.fillStyle = A.grad(c, fx, 0, fx + 23, 0, [0, '#ff6a4a', 1, '#d9302a']); c.fill(); c.lineWidth = 0.7; c.strokeStyle = '#2a1810'; c.stroke();
      c.beginPath(); c.arc(fx + 9, fy + 5, 2, 0, 7); c.fillStyle = '#fff'; c.fill();
    }
    if (!(TH && TH.hideSummitBoard)) {
      var bx = sx + ((TH && TH.summitBoardX != null) ? TH.summitBoardX : -10);
      var bw = (TH && TH.summitBoardW) ? TH.summitBoardW : 34;
      var bs = (TH && TH.summitBoardSize) ? TH.summitBoardSize : 3.6;
      board(c, bx, sy - 29, bw, 15, [String(L.altitude).replace(/(\d)(\d{3})$/, '$1 $2') + ' m'], bs);
    }
    if (TH && TH.drawSummit) { TH.drawSummit(c, sx, sy, EV); }
  }

  function drawRocks(c) {
    rocks.forEach(function (k) {
      c.save(); c.fillStyle = 'rgba(25,8,20,.3)'; c.beginPath(); c.ellipse(k.x, G[k.x | 0] > -1e5 && isFinite(G[k.x | 0]) ? G[k.x | 0] : k.y + k.r, k.r * 0.9, 1.3, 0, 0, 7); c.fill(); c.restore();
      A.drawRock(c, k.x, k.y, k.r, k.rot, k.seed, true);
    });
  }
  function drawParts(c) {
    parts.forEach(function (q) {
      var a = clamp(q.life / (q.max || 1), 0, 1);
      if (q.k === 'dust') { var s = lerp(q.s1, q.s0, a); c.globalAlpha = a * q.a * 0.7; c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, s, 0, 7); c.fill(); c.globalAlpha = a * q.a * 0.5; c.beginPath(); c.arc(q.x - s * 0.15, q.y - s * 0.2, s * 0.6, 0, 7); c.fillStyle = '#f1dcc2'; c.fill(); c.globalAlpha = 1; }
      else if (q.k === 'chunk') { c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.fillStyle = q.col; c.beginPath(); c.moveTo(-q.s0, -q.s0 * 0.4); c.lineTo(q.s0 * 0.2, -q.s0); c.lineTo(q.s0, q.s0 * 0.3); c.lineTo(-q.s0 * 0.4, q.s0 * 0.8); c.closePath(); c.fill(); c.restore(); }
      else if (q.k === 'slab') { c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = Math.min(1, a * 2.2); c.fillStyle = q.col; c.fillRect(-q.s0, -q.s0 * 0.55, q.s0 * 2, q.s0 * 1.1); c.fillStyle = q.col2; c.fillRect(-q.s0, -q.s0 * 0.55, q.s0 * 2, q.s0 * 0.4); c.restore(); c.globalAlpha = 1; }
      else if (q.k === 'spark') { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, q.s0 * (0.5 + a), 0, 7); c.fill(); c.restore(); }
      else if (q.k === 'drop') { c.globalAlpha = a; c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, q.s0, 0, 7); c.fill(); c.globalAlpha = 1; }
      else if (q.k === 'wind') {
        c.globalAlpha = Math.min(1, a * 1.5) * 0.7; c.strokeStyle = q.col || 'rgba(236,246,255,0.9)';
        c.lineWidth = q.thick || 1.3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(q.x, q.y);
        c.quadraticCurveTo(q.x + q.s0 * 0.45, q.y - 2.4, q.x + q.s0, q.y + 0.6);
        c.stroke();
        c.globalAlpha = Math.min(1, a * 1.5) * 0.28; c.lineWidth = (q.thick || 1.3) * 0.55;
        c.beginPath(); c.moveTo(q.x + q.s0 * 0.12, q.y + 1.6);
        c.quadraticCurveTo(q.x + q.s0 * 0.5, q.y + 0.2, q.x + q.s0 * 0.82, q.y + 1.4);
        c.stroke(); c.globalAlpha = 1;
      }
      else if (q.k === 'conf') { c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.globalAlpha = Math.min(1, a * 3); c.fillStyle = q.col; c.fillRect(-q.s0, -q.s0 * 0.5, q.s0 * 2, q.s0); c.restore(); }
    });
    c.globalAlpha = 1;
  }

  function syncEnv() {
    EV.A = A; EV.G = G; EV.GF = GF; EV.TYPE = TYPE; EV.feat = feat; EV.cam = cam; EV.time = time; EV.len = len; EV.P = P; EV.W = W; EV.L = L;
    EV.state = state; EV.wonT = wonT; EV.vw = curVw; EV.vh = curVh; EV.Sc = Sc; EV.DPR = DPR;
    EV.nz = nz; EV.hash = hash; EV.mix = mix; EV.rgba = rgba; EV.clamp = clamp; EV.lerp = lerp; EV.sstep = sstep;
    EV.hGrad = hGrad; EV.ridge = ridge; EV.drawTreeRow = drawTreeRow; EV.board = board; EV.pcol = pcol; EV.midFn = midFn; EV.BASE_Y = BASE_Y; EV.liveGaps = liveGaps; EV.crumbs = feat ? feat.crumbs : []; EV.ZN = ZN; EV.RAIL = RAIL; EV.LEDGE = LEDGE; EV.trains = feat ? feat.trains : []; EV.GF = GF; EV.FOGD = FOGD; EV.LOOK = LOOK; EV.wind = wind; EV.HSC = HSC; EV.emitDust = function (x, y, n) { dust(x, y, n, '#d8c7ad', 6, 5); };
  }

  function hikerParams() {
    var ph = P.ph, mv = P.onGround ? clamp(Math.abs(P.vx) / SPEED, 0, 1) : 0, yo = 0; if (P.walkIn) { mv = 0.55; }
    var cele = state === 'won' && !(W.endGare && wonT > 0.9) ? sstep(0, 0.4, wonT) : 0;
    if (cele > 0) { yo = -Math.abs(Math.sin(wonT * 5.2)) * 3.2 * sstep(0, 0.8, wonT) * (wonT < 2.4 ? 1 : 0.3); }
    var hurtF = P.hurtT > 0 ? clamp(P.hurtT / 0.45, 0, 1) : 0;
    var blink = P.inv > 0 && P.hurtT <= 0 && Math.floor(P.inv * 14) % 2 === 0;
    return { x: P.x, y: P.y + yo, face: P.face, t: time, phase: ph, move: mv, air: !P.onGround && state !== 'won', vy: P.vy, sq: P.sq, hurt: hurtF, drink: P.drinkT > 0 ? clamp(1 - P.drinkT / 1.15, 0, 1) : 0, cele: cele, slope: P.onGround ? P.slope : 0, slide: P.slideK || 0, scale: HSC, stride: 5.0, char: (window.Save && Save.get().character) || 'boy', alpha: blink ? 0.45 : 1 };
  }

  function drawTile(dpr) {
    var ppu = Math.max(2, Sc * dpr), key = String(Math.round(ppu * 10));
    if (tileKey === key && tilePat) { return; } tileKey = key;
    var t = A.scoriaTile(ppu); tile = t; tilePat = null; return t;
  }

  function draw(c, Wpx, Hpx, dpr) {
    if (!P) { return; }
    curW = Wpx; curH = Hpx; DPR = dpr || 1;
    S0 = clamp(Math.min(Wpx / 135, Hpx / 230), 2.2, 4.2); Sc = S0 * zoom; var vw = Wpx / Sc, vh = Hpx / Sc; curVw = vw; curVh = vh;
    // texture de coupe : feuille large pré-calculée (reconstruite seulement si le massif ou l'échelle change)
    var cid = cutProfileId();
    var tkey = cid + ':' + Math.round(S0 * DPR * 10);
    A.rockPal = (TH && TH.rockPal) || null;
    if (tileKey !== String(tkey)) {
      tileKey = String(tkey);
      var t = A.cutSheet(cid);
      tilePat = c.createPattern(t.canvas, 'repeat');
      if (tilePat.setTransform) { tilePat.setTransform(new DOMMatrix().scale(t.units / t.canvas.width)); }
      cutShadeImg = A.cutShadeCanvas(cid);
      cutGrainA = cid === 'mary' ? 0.70 : (cid === 'sancy' ? 0.82 : (cid === 'basque' ? 0.68 : (cid === 'jura' ? 0.62 : 0.84)));
    }
    // caméra
    var nearT = feat.trains.some(function (t) { return P.x > t.x0 - 330 && P.x < t.x1 + 6 && t.state !== 'pass'; }), fwT = state === 'won' ? 0.26 : (P.face > 0 ? (npcLook ? 0.2 : nearT ? 0.25 : 0.36) : 0.56);
    fwS += (fwT - fwS) * (1 - Math.exp(-frameDt * 3)); var fw = fwT === 0.56 || state === 'won' ? fwT : fwS; if (snap) { fwS = fwT; }
    var lookT = lookOv != null ? lookOv : (state === 'won' ? ((W && W.winLook != null) ? W.winLook : ((TH && TH.winLook != null) ? TH.winLook : 0.58)) : ((TH && TH.playLook != null) ? TH.playLook : 0.64));
    var tx = P.x - vw * fw, ty = P.y - vh * lookT, k = 1 - Math.exp(-frameDt * 7);
    if (state === 'dying' && !P.onGround) { ty = cam.y; }
    if (snap) { cam.x = tx; cam.y = ty; snap = false; }
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    cam.x = Math.max(0, Math.min(len - vw, cam.x));
    var gs0 = vh * 0.66, gain = (BASE_Y - vh * 0.64) - cam.y;
    c.setTransform(DPR * Sc, 0, 0, DPR * Sc, 0, 0); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    syncEnv(); window.Mech && Mech.update(EV, frameDt);
    if (TH && TH.drawBackground) { TH.drawBackground(c, vw, vh, gs0, gain, EV); } else { drawBackground(c, vw, vh, gs0, gain); }
    window.Mech && Mech.fogBack(c, vw, vh, EV);
    var sxo = shake > 0 ? (Math.random() - 0.5) * 2.2 : 0, syo = shake > 0 ? (Math.random() - 0.5) * 2.2 : 0;
    if (warns.some(function (w) { return w.ok; })) { sxo += (Math.random() - 0.5) * 0.7; syo += (Math.random() - 0.5) * 0.7; }
    if (crumbNear > 0) { sxo += (Math.random() - 0.5) * 0.55 * crumbNear; syo += (Math.random() - 0.5) * 0.55 * crumbNear; }
    var pxu = Sc * DPR; c.save(); c.translate(-Math.round(cam.x * pxu) / pxu + sxo, -Math.round(cam.y * pxu) / pxu + syo);   // calé sur le pixel écran : pas de scintillement des textures
    var xa = Math.max(0, Math.floor(cam.x) - 6), xb = Math.min(len, Math.ceil(cam.x + vw) + 6), bottom = Math.ceil(cam.y + vh) + 6;
    if (TH && TH.drawBehind) { TH.drawBehind(c, xa, xb, bottom, EV); }
    else { drawCraterBack(c, xa, xb); drawFlora(c, xa, xb, bottom); drawQuarryWall(c, xa, xb, bottom); }
    drawGaps(c, xa, xb, bottom); drawTerrain(c, xa, xb, bottom); drawCrumbs(c, xa, xb);
    if (TH && TH.drawStairs) { TH.drawStairs(c, xa, xb, EV); } else { drawStairs(c, xa, xb); }
    if (TH && TH.drawProps) { TH.drawProps(c, xa, xb, EV); } else { drawProps(c, xa, xb); }
    if (window.Fauna) { Fauna.drawBehind(c, xa, xb, EV); }
    if (window.Mech && RAIL) { Mech.rails(c, xa, xb, EV); }
    drawFeatures(c, xa, xb); drawRocks(c);
    if (window.Mech) {
      feat.trains.forEach(function (tr) { if (tr.x1 > xa - 400 && tr.x0 < xb + 400) { Mech.crossing(c, tr, EV); } });
      feat.trains.forEach(function (tr) { Mech.trainBody(c, tr, EV); });
      feat.npcs.forEach(function (n) { Mech.npc(c, n, EV); });
      Mech.fog(c, vw, vh, EV); if (!(W && W.noFogPoles)) { Mech.fogPoles(c, xa, xb, EV); }
      if (Mech.K.fog > 0.1) { feat.trains.forEach(function (tr) { if (tr.x1 > xa - 40 && tr.x0 < xb + 40) { Mech.crossing(c, tr, EV); } }); }
    }
    if (window.Fauna) { Fauna.drawMid(c, xa, xb, EV); }
    if (window.Fauna && Fauna.drawWeather) { c.save(); c.translate(cam.x, cam.y); Fauna.drawWeather(c, vw, vh, EV); c.restore(); }
    if (trailOn && recGhost) {
      ghostNow = ghostPose(clock);
      if (ghostNow && ghostNow.x > xa - 20 && ghostNow.x < xb + 20) {
        c.save();
        A.drawHiker(c, { x: ghostNow.x, y: ghostNow.y, face: ghostNow.face, t: time, phase: clock * 6.8 * (ghostNow.move || 0), move: ghostNow.move || 0, air: !!ghostNow.air && !ghostNow.done, vy: ghostNow.vy || 0, sq: 0, hurt: 0, drink: 0, cele: ghostNow.done ? 0.5 : 0, slope: 0, slide: 0, scale: HSC, stride: 5.0, char: recGhost.c || 'boy', alpha: 0.55, shadow: true });
        c.restore();
      }
    }
    var hp = hikerParams(); if (!(state === 'dying' && P.y > feat.topY + 400)) {
      if (state === 'won' && W.endGare && P.x > feat.summitX + 70) { c.save(); c.globalAlpha = clamp(1 - (P.x - (feat.summitX + 72)) / 11, 0, 1); A.drawHiker(c, hp); c.restore(); } else { A.drawHiker(c, hp); }
    }
    if (window.Fauna) { Fauna.drawFront(c, xa, xb, EV); }
    drawParts(c);
    c.restore();
    // lumière chaude, voile et vignette
    c.save(); c.globalCompositeOperation = 'screen'; var sg = c.createRadialGradient(vw * 0.8, gs0 - 64, 0, vw * 0.8, gs0 - 64, vh * 0.9); sg.addColorStop(0, (TH && TH.glow0) || 'rgba(255,214,150,.2)'); sg.addColorStop(1, (TH && TH.glow1) || 'rgba(255,170,120,0)'); c.fillStyle = sg; c.fillRect(0, 0, vw, vh); c.restore();
    var vg = c.createRadialGradient(vw / 2, vh * 0.55, Math.min(vw, vh) * 0.45, vw / 2, vh * 0.55, Math.max(vw, vh) * 0.85); vg.addColorStop(0, 'rgba(30,10,40,0)'); vg.addColorStop(1, (TH && TH.vig) || 'rgba(30,10,50,.22)'); c.fillStyle = vg; c.fillRect(0, 0, vw, vh);
    if (window.Mech) { Mech.sun(c, vw, vh, EV); Mech.snow(c, vw, vh, EV); }
    if (window.Fauna) { Fauna.drawOverlay(c, vw, vh, EV); }
    drawMotes(c, vw, vh); drawWarnings(c, vw, vh);
    if (wind.warn > 0.01 || wind.str > 0.05) { drawWindHud(c, vw, vh); }
    if (fade > 0) { c.fillStyle = 'rgba(14,6,22,' + fade + ')'; c.fillRect(0, 0, vw, vh); }
  }

  /* indicateur de rafale en haut à droite : trois traits qui filent, plus vifs quand la rafale souffle */
  function drawWindHud(c, vw, vh) {
    var a = Math.max(wind.warn, wind.str), x = vw - 30, y = 56, k = wind.str > 0.2;
    c.save(); c.globalAlpha = Math.min(1, a * 1.5) * (k ? 1 : 0.55 + 0.45 * Math.sin(time * 18));
    c.lineCap = 'round'; c.strokeStyle = '#f2fbff'; c.lineWidth = 1.6; c.shadowColor = 'rgba(20,40,70,.8)'; c.shadowBlur = 3;
    [[0, 0, 22], [4, 6, 16], [-2, 12, 20]].forEach(function (l, i) { var off = ((time * 36 + i * 9) % 12); c.beginPath(); c.moveTo(x + l[0] - off * 0.3, y + l[1]); c.lineTo(x + l[0] - l[2] - off * 0.3, y + l[1]); c.stroke(); });
    c.shadowBlur = 0;
    c.font = '5px "Press Start 2P", monospace'; c.textAlign = 'right'; c.textBaseline = 'bottom';
    c.lineWidth = 2.2; c.strokeStyle = 'rgba(20,20,40,.7)'; c.fillStyle = '#f2fbff';
    var lab = k ? 'Rafale !' : 'Vent…';
    c.strokeText(lab, x, y - 6); c.fillText(lab, x, y - 6);
    c.restore();
  }

  function drawMotes(c, vw, vh) {
    if (TH && TH.noMotes) { return; }
    if (!motes) { motes = []; for (var i = 0; i < 26; i++) { motes.push({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random() * 0.9, v: 0.2 + Math.random() }); } }
    c.save(); c.globalCompositeOperation = 'lighter';
    var lowFx = document.body && document.body.classList.contains('low-fx');
    motes.forEach(function (m, i) {
      if (lowFx && (i % 3)) { return; }
      var x = ((m.x * vw - cam.x * 0.35 * m.v - time * 3 * m.v) % vw + vw) % vw, y = (m.y * vh + Math.sin(time * 0.8 + i) * 4 - cam.y * 0.1 * m.v) % vh; if (y < 0) { y += vh; } c.fillStyle = 'rgba(255,230,190,' + (0.18 + 0.14 * Math.sin(time * 1.5 + i)) + ')'; c.beginPath(); c.arc(x, y, m.s, 0, 7); c.fill();
    });
    c.restore();
  }

  /* avertissement avant chaque pierre : triangle clignotant au bord de l'écran (en haut de la pente) */
  function drawWarnings(c, vw, vh) {
    warns.forEach(function (w) {
      if (!w.ok) { return; }
      var ex = cam.x + vw - 14, gy = gAt(ex), sy = (isFinite(gy) && gy > -1e5 ? gy : P.y - 20) - cam.y;
      var a = Math.min(1, w.t * 4) * (w.t > w.dur - 0.15 && w.t <= w.dur ? (w.dur - w.t) / 0.15 : 1), pulse = 1 + 0.12 * Math.sin(w.t * 16), bl = Math.floor(w.t * 7) % 2 === 0;
      var x = vw - 11, y = clamp(sy - 28, 18, vh * 0.7);
      c.save(); c.translate(x, y); c.scale(pulse, pulse); c.globalAlpha = a;
      c.shadowColor = 'rgba(255,90,60,.8)'; c.shadowBlur = 6;
      c.beginPath(); c.moveTo(0, -9); c.lineTo(9.5, 7); c.lineTo(-9.5, 7); c.closePath(); c.lineJoin = 'round';
      c.fillStyle = bl ? '#ffd34d' : '#ff8a3c'; c.fill(); c.shadowBlur = 0; c.lineWidth = 1.4; c.strokeStyle = '#2a1830'; c.stroke();
      c.fillStyle = '#2a1830'; c.fillRect(-0.9, -3.6, 1.8, 6.2); c.beginPath(); c.arc(0, 4.3, 1, 0, 7); c.fill();
      // flèche vers le joueur
      c.shadowBlur = 0; c.beginPath(); c.moveTo(-12, 0.5); c.lineTo(-17, -3); c.lineTo(-17, 4); c.closePath(); c.fillStyle = bl ? '#ffd34d' : '#ff8a3c'; c.fill(); c.lineWidth = 0.9; c.stroke();
      c.restore();
    });
  }

  window.Game = {
    start: start, update: update, draw: draw, isTrail: function () { return trailOn; },
    theme: function (name, fn) { syncEnv(); THEMES[name] = fn(EV); },
    level: function () { return L; },
    on: function (o) { for (var k in o) { cb[k] = o[k]; } },
    state: function () { return state; },
    pause: function () {
      if (state === 'play') { state = 'paused'; frozen = false; }
      else if (state === 'dying' || state === 'won') { frozen = true; }
    },
    resume: function () {
      if (state === 'paused') { state = 'play'; frozen = false; window.Input.clear(); }
      else if (frozen) { frozen = false; window.Input.clear(); }
    },
    isPaused: function () { return state === 'paused' || frozen; },
    isActive: function () { return state !== 'idle'; },
    stop: function () { state = 'idle'; frozen = false; },
    invalidateGfx: invalidateGfx,
    profile: profile, env: function () { return { sun: Mech.K.sun, snow: Mech.K.snow, fog: Mech.K.fog, wind: wind.str, windWarn: wind.warn }; }, rate: rate, rateParts: rateParts, summitInfo: function () { return { x: feat.summitX, y: feat.summitY, topY: feat.topY }; }, setVista: function (v) { vistaMode = v; }, setZoom: function (z, look) { zoomOv = z; lookOv = z == null ? null : (look == null ? null : look); }, getZoom: function () { return zoom; }, getLook: function () { return lookOv != null ? lookOv : (state === 'won' ? ((W && W.winLook != null) ? W.winLook : ((TH && TH.winLook != null) ? TH.winLook : 0.58)) : ((TH && TH.playLook != null) ? TH.playLook : 0.64)); },
    /* aides de test */
    _dbg: function () { return P ? { x: P.x, y: P.y, onGround: P.onGround, lives: P.lives, water: P.water, state: state, summitX: feat.summitX, stats: stats, clock: clock, len: len, bottles: feat.bottles.map(function (b) { return [b.x, b.taken]; }), gaps: feat.gaps.map(function (g) { return [g.x0, g.x1]; }), crumbs: feat.crumbs.map(function (q) { return [q.x0, q.x1, q.state, Math.round(q.t * 100) / 100]; }), craterX: feat.rimX, warns: warns.length, warnsOk: warns.filter(function (w) { return w.ok; }).length, rocks: rocks.map(function (r) { return [Math.round(r.x), Math.round(r.y), r.ground]; }), rockCount: rockCount, cp: lastCp.id, cam: [cam.x, cam.y], zoom: zoom, npcDbg: feat.npcs.map(function (n) { return [n.st, Math.round(n.x)]; }), vw: curVw, vh: curVh, zones: feat.zones, boulders: feat.boulders.map(function (b) { return b.x; }), finds: feat.finds.map(function (f) { return [f.id, f.x, f.got]; }), cables: feat.cables, herds: (feat.herds||[]).map(function(h){return {kind:h.kind,st:h.st,cx:h.cx,x0:h.x0,x1:h.x1,animals:(h.animals||[]).map(function(a){return {x:a.x,y:a.y};})};}), raptors: (feat.raptors||[]).map(function(r){return {kind:r.kind,st:r.st,x0:r.x0,x1:r.x1};}), pebbles: (feat.pebbles||[]).map(function(q){return {x:q.x,y:q.y};}), windSt: wind.st, zn: P? (ZN[P.x|0]||0):0, hurtT: P.hurtT, stun: P.stun, inv: P.inv, vx: P.vx, vy: P.vy, jumps: stats.jumps, trains: feat.trains.map(function (t) { return { x0: t.x0, x1: t.x1, cx: t.cx, trig: t.trig, warn: t.warn, st: t.state, tx: t.tx, g: t.g, armed: t.armed, xl: t.xl, xr: t.xr, hit: t.hit }; }), npcs: feat.npcs.map(function (n) { return [n.st, Math.round(n.x || 0)]; }), env: (Game.env && Game.env()) || null } : null; },
    _hurt: function (k) { hurt(k || 'rock'); },
    _sp: function () { return [(P.x - cam.x) * Sc, (P.y - cam.y) * Sc, Sc]; },
    _unlockFinds: function () { feat.finds.forEach(function (f) { f.got = false; }); },
    _bless: function () { if (P) { P.inv = 9; P.lives = 3; } },
    _warp: function (x) { if (!P || !feat) { return; } x = Math.max(0, Math.min((feat.summitX || 0) + 40, +x || 0)); P.x = x; var gy = G[x | 0]; if (isFinite(gy)) { P.y = gy; } P.vx = 0; P.vy = 0; P.onGround = true; cam.x = Math.max(0, x - curVw * 0.45); cam.y = P.y - curVh * 0.64; },
    _solid: function () { if (P) { P.inv = 0; P.hurtT = 0; P.stun = 0; } },
    _teleport: function (x) { P.x = x; P.y = G[x | 0]; P.vx = P.vy = 0; P.onGround = true; cam.x = Math.max(0, x - 150); cam.y = P.y - vh0() * 0.64; snap = true; rocks = []; warns = []; if (window.Fauna) { Fauna.reset(feat); } },
    _setWater: function (w) { P.water = w; },
    _clock: function (t) { clock = t; },
    _forceRock: function () { feat.zones.forEach(function (z) { if (P.x >= z.x0 - 40 && P.x <= z.x1) { warns.push({ t: 0, dur: 1.25, z: z, puff: 0, ok: true, bad: 0 }); window.Sfx && Sfx.play('rumble'); rum('warn'); } }); },
    _pose: function (o) { for (var k in o) { P[k] = o[k]; } },
    _win: function () { if (state === 'play') { P.x = feat.summitX; var gy = G[P.x | 0]; if (isFinite(gy)) { P.y = gy; } P.vx = 0; P.vy = 0; P.onGround = true; snap = true; win(); } },
    _ghost: function () { return { on: trailOn, clock: clock, ghost: recGhost ? { t: recGhost.t, c: recGhost.c, maxX: recGhost.maxX, n: recGhost.pts ? recGhost.pts.length : 0 } : null, pose: ghostNow || (recGhost ? ghostPose(clock) : null), gap: recGhost ? trailGap() : null, recN: rec ? rec.samples.length : 0, recMaxX: recMaxX }; },
    _setTrailGhost: function (g) { recGhost = g && window.Save ? (g.pts ? g : Save.unpackGhost(g)) : g; trailOn = true; },
    _stamp: function (t, x, y) { clock = t; P.x = x; if (y == null) { y = G[x | 0]; } P.y = y; P.vx = 0; P.vy = 0; P.onGround = true; recPush(true); },
    _feat: function () { return feat; },
    _spacing: function () { return window.Fauna && feat ? Fauna.spacingReport(feat) : null; },
    _forceHerd: function (kind) { if (window.Fauna) { syncEnv(); Fauna.forceHerd(feat, kind || 'pottok', EV); } },
    _forceWarn: function (kind) { if (window.Fauna) { syncEnv(); Fauna.forceWarn(feat, kind || 'pottok', EV); } },
    _forcePebble: function (x) { if (window.Fauna) { syncEnv(); Fauna.forcePebble(feat, x == null ? P.x + 50 : x, EV); } },
    _groundAt: function (x) { return G[Math.max(0, Math.min(len, x | 0))]; },
    _len: function () { return len; }
  };
})();
