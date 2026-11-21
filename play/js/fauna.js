/* v0.7.1 — faune du Pays basque : animaux un par un, reconnaissables et animés
   qui lâchent des cailloux (ombre + cri, PAS le triangle de danger des éboulis),
   chauves-souris d'ambiance, herbe mouillée (physique dans game.js), pluie d'orage.
   Dessin + logique dédiée ; game.js appelle parse / reset / update / draw*. */
(function () {
  'use strict';
  var A = window.Art;

  function gAt(E, x) {
    x = Math.max(0, Math.min(E.len, x | 0));
    var y = E.G[x];
    return isFinite(y) ? y : (E.GF && isFinite(E.GF[x]) ? E.GF[x] : E.P.y);
  }
  function hash(x, k) { return A.hash(x, k); }
  function herdCry(kind) {
    if (!window.Sfx) { return; }
    Sfx.play(kind === 'boar' ? 'boar' : (kind === 'sheep' || kind === 'tetra' ? 'sheep' : (kind === 'cow' ? 'cow' : (kind === 'chamois' || kind === 'ibex' ? 'pottok' : 'pottok'))));
  }

  /* ---------- construction depuis les pièces de niveau ---------- */
  function parsePiece(p, x, n, feat) {
    var o, cx;
    if (p.pottoks) {
      o = typeof p.pottoks === 'object' ? p.pottoks : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'pottok', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 230, period: o.period == null ? 0 : o.period, spd: o.spd || 44, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 1.8, spawned: 0, spacing: o.spacing || 2.4 });
    }
    if (p.boars) {
      o = typeof p.boars === 'object' ? p.boars : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'boar', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 210, period: o.period == null ? 0 : o.period, spd: o.spd || 108, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 1.8, spawned: 0, spacing: o.spacing || 2.8 });
    }
    if (p.sheep) {
      o = typeof p.sheep === 'object' ? p.sheep : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'sheep', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 220, period: o.period == null ? 0 : o.period, spd: o.spd || 36, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 1.8, spawned: 0, spacing: o.spacing || 2.6 });
    }
    if (p.cows) {
      o = typeof p.cows === 'object' ? p.cows : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'cow', breed: o.breed || 'cow', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 230, period: o.period == null ? 0 : o.period, spd: o.spd || 32, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 1.8, spawned: 0, spacing: o.spacing || 2.8 });
    }
    if (p.chamois) {
      o = typeof p.chamois === 'object' ? p.chamois : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'chamois', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 240, period: o.period == null ? 0 : o.period, spd: o.spd || 52, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 1.8, spawned: 0, spacing: o.spacing || 2.8 });
    }
    if (p.ibex) {
      o = typeof p.ibex === 'object' ? p.ibex : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'ibex', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 250, period: o.period == null ? 0 : o.period, spd: o.spd || 40, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 1.8, spawned: 0, spacing: o.spacing || 3.0 });
    }
    if (p.tetra) {
      o = typeof p.tetra === 'object' ? p.tetra : {};
      cx = Math.round(x + n * (o.f == null ? 0.5 : o.f));
      feat.herds.push({ kind: 'tetra', x0: x, x1: x + n, cx: cx, n: o.n || 1, trig: o.trig || 250, period: o.period == null ? 0 : o.period, spd: o.spd || 22, st: 'idle', t: 0, armed: true, animals: [], warn: o.warn || 2.2, spawned: 0, spacing: o.spacing || 3.2 });
    }
    if (p.raptors) {
      o = typeof p.raptors === 'object' ? p.raptors : {};
      feat.raptors.push({ kind: o.kind || 'buzzard', x0: x, x1: x + n, min: (o.pebbles && o.pebbles[0]) || 6, max: (o.pebbles && o.pebbles[1]) || 9, st: 'idle', t: 1.8 + hash(x, 51) * 2, birds: [], drop: null, cried: false });
    }
    if (p.bats) {
      o = typeof p.bats === 'object' ? p.bats : {};
      feat.bats.push({ x0: x, x1: x + n, cx: Math.round(x + n * (o.f == null ? 0.25 : o.f)), n: o.n || 4, st: 'wait', t: 0, list: [], spawned: 0, spawnT: 0, spacing: o.spacing || 1.15 });
    }
    if (p.t === 'gap' && p.karst && feat.gaps.length) { feat.gaps[feat.gaps.length - 1].karst = true; }
  }

  function punchKarst(p, x, n, feat, G, PITY, TYPE, len) {
    if (!p.karst || p.t === 'gap' || p.t === 'stairs' || !G) { return; }
    var list = Array.isArray(p.karst) ? p.karst : [p.karst], i, k, a0, a1, midY;
    list.forEach(function (cr) {
      var w = Math.max(12, cr.w || 18);
      a0 = Math.round(x + n * (cr.f == null ? 0.5 : cr.f) - w / 2);
      a1 = a0 + w;
      if (a0 < x + 8) { a0 = x + 8; } if (a1 > x + n - 8) { a1 = x + n - 8; }
      if (a1 - a0 < 10) { return; }
      midY = 0; var c = 0;
      for (k = a0; k < a1; k++) { if (k >= 0 && k <= len && isFinite(G[k])) { midY += G[k]; c++; } }
      midY = c ? midY / c : 0;
      for (k = a0; k < a1; k++) {
        if (k < 0 || k > len) { continue; }
        var y = isFinite(G[k]) ? G[k] : midY;
        PITY[k] = y + 110; G[k] = Infinity; TYPE[k] = 0;
      }
      feat.gaps.push({ x0: a0, x1: a1, y: midY, karst: true });
    });
  }

  function reset(feat) {
    if (!feat) { return; }
    (feat.herds || []).forEach(function (h) { h.st = 'idle'; h.t = 0; h.armed = true; h.animals = []; h.spawned = 0; });
    (feat.raptors || []).forEach(function (r) { r.st = 'idle'; r.t = 1.6 + hash(r.x0, 52) * 2; r.drop = null; r.cried = false; r.lock = null; });
    (feat.bats || []).forEach(function (b) { b.st = 'wait'; b.t = 0; b.list = []; b.spawned = 0; b.spawnT = 0; });
    feat.pebbles = [];
  }

  /* Un seul animal à la fois, vu arriver de l'avant ; le suivant n'apparaît qu'après qu'il soit passé. */
  function spawnOne(h, E) {
    var dir = -1, sp = h.spd, start = Math.max(h.cx + 96, (E.P && E.P.x || 0) + 118);
    var seed = h.cx + (h.spawned || 0) * 17;
    h.animals = [{
      x: start, y: gAt(E, start), vx: -sp, face: dir, ph: hash(seed, 61) * 6, seed: seed,
      kind: h.kind, hit: false, coat: (h.kind === 'cow' ? (h.breed === 'betizu' ? 0 : (h.breed === 'estive' ? 1 : (h.breed === 'montbeliarde' ? 2 : seed % 2))) : (seed % (h.kind === 'pottok' ? 3 : 2))), breed: h.breed
    }];
    h.spawned = (h.spawned || 0) + 1;
    h.st = 'cross'; h.t = 0;
  }
  function spawnHerd(h, E) { h.spawned = 0; spawnOne(h, E); }

  function herdBox(a) {
    if (a.kind === 'pottok') { return { hw: 11, h: 15, dy: 0 }; }
    if (a.kind === 'sheep') { return { hw: 8, h: 12, dy: 0 }; }
    if (a.kind === 'cow') { return { hw: 7, h: 5, dy: 0 }; }
    if (a.kind === 'chamois') { return { hw: 9, h: 13, dy: 0 }; }
    if (a.kind === 'ibex') { return { hw: 10, h: 15, dy: 0 }; }
    if (a.kind === 'tetra') { return { hw: 7, h: 8, dy: 0 }; }
    return { hw: 9, h: 11, dy: 0 };
  }

  function updateHerds(E, dt) {
    var P = E.P, feat = E.feat, state = E.state;
    if (!feat.herds) { return; }
    feat.herds.forEach(function (h) {
      if (h.st === 'idle') {
        if (state === 'play' && h.armed && P.x > h.cx - h.trig && P.x < h.cx + 8 && P.x < h.cx - 20) {
          h.st = 'warn'; h.t = 0;
          herdCry(h.kind);
          if (E.emitDust) { E.emitDust(h.cx + 80, gAt(E, h.cx + 80), 3); }
        }
      } else if (h.st === 'warn') {
        h.t += dt;
        if (P.x < h.cx - h.trig - 80) { h.st = 'idle'; h.armed = true; return; }
        if (h.t >= h.warn) { spawnHerd(h, E); }
      } else if (h.st === 'cross') {
        h.t += dt;
        h.animals.forEach(function (a) {
          a.x += a.vx * dt; a.ph += dt * (a.kind === 'pottok' ? 7.2 : (a.kind === 'sheep' ? 6.4 : (a.kind === 'cow' ? 5.6 : (a.kind === 'chamois' ? 8.2 : (a.kind === 'ibex' ? 6.6 : (a.kind === 'tetra' ? 5.0 : 10))))));
          a.y = gAt(E, a.x);
          if (state === 'play' && P.inv <= 0 && !a.hit) {
            var b = herdBox(a), dx = P.x - a.x;
            var padX = a.kind === 'cow' ? 2 : 5, padY = a.kind === 'cow' ? 0 : 2;
            var overlapX = Math.abs(dx) < b.hw + padX;
            var py = P.y, ay = a.y - b.dy;
            /* Retombée sur le dos : le joueur a déjà dépassé le centre de la vache
               (saut un peu trop tôt). Un choc de face reste punitif. */
            var passedBack = a.kind === 'cow' && ((P.vx >= 0 && P.x >= a.x) || (P.vx < 0 && P.x <= a.x));
            if (overlapX && py > ay - b.h - padY && py < ay + 8 && !passedBack) {
              a.hit = true;
              if (E.hurt) { E.hurt(a.kind); }
            }
          }
        });
        var last = h.animals[h.animals.length - 1];
        if (last && last.x < h.cx - 150) {
          h.animals = [];
          if (h.spawned < (h.n || 1)) { h.st = 'waitNext'; h.t = 0; h.armed = false; }
          else if (h.period > 0) { h.st = 'wait'; h.t = 0; h.armed = false; }
          else { h.st = 'done'; h.armed = false; }
        }
      } else if (h.st === 'waitNext') {
        h.t += dt;
        if (!h.preWarned && h.t >= (h.spacing || 2.4) - (h.warn || 1.8)) {
          h.preWarned = true;
          herdCry(h.kind);
        }
        if (h.t >= (h.spacing || 2.4)) { h.preWarned = false; spawnOne(h, E); }
      } else if (h.st === 'wait') {
        h.t += dt;
        if (h.t >= h.period) { h.st = 'idle'; h.armed = true; h.t = 0; h.spawned = 0; }
      }
    });
  }

  function raptorCount(r) {
    var kind = r.kind || 'buzzard';
    return (kind === 'vautour' || kind === 'vulture' || kind === 'griffon') ? 2 : 1;
  }
  function raptorSpeed(kind, i) {
    return (kind === 'falcon' || kind === 'faucon') ? 28 : 15 + i * 4;
  }
  /* Position du rapace i (même formule que le dessin). r.lock force un oiseau pour les tests. */
  function birdPos(r, E, i) {
    if (r.lock) { return { x: r.lock.x, y: r.lock.y - (i || 0) * 16 }; }
    var t = E.time, kind = r.kind || 'buzzard';
    var span = (r.x1 - r.x0 + 140);
    var u = (t * raptorSpeed(kind, i) + i * 90) % Math.max(90, span);
    var x = r.x0 - 50 + u;
    var gy = gAt(E, Math.max(r.x0, Math.min(r.x1, x)));
    if (!isFinite(gy)) { gy = E.BASE_Y || 0; }
    var y = gy - 82 - i * 16 - Math.sin(t * 1.3 + i) * 5;
    return { x: x, y: y };
  }
  function pickDropBird(r, E) {
    var cam = E.cam, vw = (cam && (cam.vw || E.vw)) || 280, n = raptorCount(r), i, best = null, bestScore = 1e9;
    var cx0 = cam ? cam.x : 0, P = E.P;
    for (i = 0; i < n; i++) {
      var p = birdPos(r, E, i);
      if (p.x < cx0 + 24 || p.x > cx0 + vw - 24) { continue; }
      var dx = p.x - (P && P.x || p.x);
      if (dx < -36) { continue; }
      var score = Math.abs(dx - 36);
      if (score < bestScore) { bestScore = score; best = { i: i, x: p.x, y: p.y }; }
    }
    return best;
  }

  function updateRaptors(E, dt) {
    var feat = E.feat, P = E.P, state = E.state;
    if (!feat.raptors) { return; }
    feat.raptors.forEach(function (r) {
      if (state !== 'play') { return; }
      if (P.x < r.x0 - 40 || P.x > r.x1 + 20) { r.drop = null; r.st = 'idle'; return; }
      if (r.st === 'idle') {
        r.t -= dt;
        if (r.t <= 0) {
          var b = pickDropBird(r, E);
          if (!b) { r.t = 0.22; return; }
          r.drop = { x: b.x, y: b.y, bird: b.i, t: 0, dur: 0.85, landed: false }; r.st = 'tele'; r.cried = false; r.t = 0;
          if (window.Sfx) { Sfx.play('cry'); } r.cried = true;
        }
      } else if (r.st === 'tele') {
        r.drop.t += dt;
        var p = birdPos(r, E, r.drop.bird || 0);
        r.drop.x = p.x; r.drop.y = p.y;
        if (r.drop.t >= r.drop.dur) {
          feat.pebbles.push({ x: p.x, y: p.y + 5, vx: 0, vy: 42, r: 3.6 + hash(p.x | 0, 75) * 1.2, rot: 0, vr: 6, life: 4, hit: false, ground: false, fromBird: true });
          r.drop = null; r.st = 'idle'; r.t = r.min + hash(P.x | 0, 76) * (r.max - r.min);
        }
      }
    });
  }

  function updatePebbles(E, dt) {
    var feat = E.feat, P = E.P, i, k, gy;
    if (!feat.pebbles) { feat.pebbles = []; return; }
    for (i = feat.pebbles.length - 1; i >= 0; i--) {
      k = feat.pebbles[i];
      gy = gAt(E, k.x);
      if (k.ground && isFinite(gy)) {
        k.vy = 0; k.y = gy - k.r; k.x += (k.vx || 0) * dt; k.vx *= Math.max(0, 1 - 3 * dt);
        k.rot += k.vr * dt * 0.4; k.life -= dt;
      } else {
        k.vy += 520 * dt; k.x += k.vx * dt; k.y += k.vy * dt; k.rot += k.vr * dt; k.life -= dt;
        gy = gAt(E, k.x);
        if (!k.ground && k.y + k.r >= gy && k.vy > 0 && isFinite(gy)) {
          k.y = gy - k.r; k.vy *= -0.28; k.vx *= 0.6; k.ground = Math.abs(k.vy) < 18;
          if (k.ground) { k.vy = 0; }
          if (window.Sfx && Math.abs(P.x - k.x) < 180) { Sfx.play('pebble'); }
          if (E.emitDust) { E.emitDust(k.x, gy, 2); }
        }
      }
      if (E.state === 'play' && P.inv <= 0 && !k.hit) {
        if (Math.abs(P.x - k.x) < 7 + k.r && P.y - 16 < k.y + k.r && P.y + 4 > k.y - k.r) {
          k.hit = true;
          if (E.hurt) { E.hurt('pebble'); }
          feat.pebbles.splice(i, 1);
          continue;
        }
      }
      if (k.life <= 0 || k.y > (E.BASE_Y || 0) + 180) { feat.pebbles.splice(i, 1); }
    }
  }

  function updateBats(E, dt) {
    var P = E.P, feat = E.feat;
    if (!feat.bats) { return; }
    feat.bats.forEach(function (b) {
      if (b.st === 'wait' && P.x > b.cx - 90 && P.x < b.x1 + 40) {
        b.st = 'fly'; b.t = 0; b.list = []; b.spawned = 0; b.spawnT = 0.7;
        if (window.Sfx) { Sfx.play('bats'); }
      }
      if (b.st === 'fly') {
        b.t += dt; b.spawnT = (b.spawnT || 0) + dt;
        if ((b.spawned || 0) < (b.n || 4) && b.spawnT >= (b.spacing || 1.15)) {
          var last = b.list[b.list.length - 1];
          if (last && last.x < b.cx + 42) { b.spawnT = (b.spacing || 1.15) - 0.08; }
          else {
            var i = b.spawned || 0;
            b.spawned = i + 1; b.spawnT = 0;
            b.list.push({ x: b.cx - 6, y: gAt(E, b.cx) - 22 - hash(i, 82) * 16, vx: 34 + hash(i, 83) * 14, vy: -24 - hash(i, 84) * 14, ph: hash(i, 85) * 6, seed: i });
          }
        }
        b.list.forEach(function (a) {
          a.x += a.vx * dt; a.y += a.vy * dt;
          a.vy += Math.sin(b.t * 6 + a.ph) * 40 * dt;
          a.vx += Math.cos(b.t * 4 + a.ph) * 18 * dt;
          if (a.vx > 70) { a.vx = 70; } if (a.vx < 10) { a.vx = 10; }
        });
      }
    });
  }

  function update(E, dt) {
    if (!E || !E.feat) { return; }
    if (!E.feat.pebbles) { E.feat.pebbles = []; }
    updateHerds(E, dt);
    updateRaptors(E, dt);
    updatePebbles(E, dt);
    updateBats(E, dt);
  }


  /* ---------- dessins (références photo : pottok à crinière lourde, sanglier à soies,
     brebis manex tête noire / rousse, vautour fauve, buse variable, faucon, chauve-souris) ---------- */
  var INK = (window.Art && Art.PAL && Art.PAL.ink) || '#241a33';
  function strokeInk(c, w) { c.strokeStyle = INK; c.lineWidth = w || 0.6; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
  function softShadow(c, x, y, rx, ry) {
    var g = c.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, 'rgba(36,26,51,.32)'); g.addColorStop(1, 'rgba(36,26,51,0)');
    c.save(); c.scale(1, (ry / rx) || 0.28); c.fillStyle = g; c.beginPath(); c.arc(x, y / ((ry / rx) || 0.28), rx, 0, 7); c.fill(); c.restore();
  }

  /* Pottok — vrai silhouette de poney : tête à chanfrein long, encolure, crinière,
     4 jambes à sabots, queue longue, canons ≈ profondeur du corps.
     Réf. : Pootok arra Orbelaunen (Commons). */
  function drawPottok(c, a, t) {
    var face = a.face || -1, coat = a.coat || 0, ph = a.ph || 0;
    var bay = coat % 3 === 0, pie = coat % 3 === 1;
    var body = bay ? '#8a4e28' : (pie ? '#f2ebe0' : '#2a1c14');
    var bodyD = bay ? '#5a3018' : (pie ? '#cfc6ba' : '#140e0a');
    var bodyL = bay ? '#b86a38' : (pie ? '#fffaf4' : '#4a382c');
    var mane = (bay || !pie) ? '#1a100c' : '#1a120e';
    var bob = Math.sin(ph) * 0.3;
    c.save(); c.translate(a.x, a.y + bob); c.scale(face, 1);
    softShadow(c, 0, 1.0, 11, 2.0);
    var st = Math.sin(ph * 2) * 2.0;

    function hoofLeg(xHip, yHip, kick, shade, near) {
      var xKnee = xHip + kick * 0.4, yKnee = yHip + 4.2;
      var xFet = xHip + kick, yFet = 0.05;
      c.strokeStyle = shade; c.lineWidth = near ? 1.7 : 1.45; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(xHip, yHip); c.lineTo(xKnee, yKnee); c.lineTo(xFet, yFet); c.stroke();
      c.strokeStyle = '#1a120c'; c.lineWidth = near ? 1.55 : 1.35;
      c.beginPath(); c.moveTo(xFet, yFet - 0.1); c.lineTo(xFet + 0.05, yFet + 1.15); c.stroke();
      c.fillStyle = '#1a120c';
      c.beginPath(); c.ellipse(xFet + 0.2, yFet + 1.25, 1.15, 0.42, 0, 0, 7); c.fill();
    }
    /* jambes lointaines d'abord */
    hoofLeg(-5.8, -8.4, -st, bodyD, false);
    hoofLeg(4.4, -8.2, st * 0.85, bodyD, false);

    /* corps : poitrail profond, ventre, croupe ronde — pas un rectangle */
    c.beginPath();
    c.moveTo(6.8, -8.6);
    c.quadraticCurveTo(7.6, -12.4, 5.2, -15.2);   /* poitrail → garrot */
    c.quadraticCurveTo(1.0, -16.4, -3.2, -15.6);  /* dos */
    c.quadraticCurveTo(-7.2, -15.0, -8.8, -13.0); /* croupe */
    c.quadraticCurveTo(-10.0, -10.4, -9.2, -7.6); /* fesse */
    c.quadraticCurveTo(-6.4, -5.4, -0.4, -5.8);   /* ventre */
    c.quadraticCurveTo(4.4, -5.6, 7.0, -7.6);
    c.closePath();
    c.fillStyle = A.grad(c, 0, -16, 0, -5.5, [0, bodyL, 0.45, body, 1, bodyD]); c.fill();
    strokeInk(c, 0.62);
    if (pie) {
      c.fillStyle = '#3a2418';
      c.beginPath(); c.ellipse(-2.6, -11.6, 2.6, 2.2, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(3.6, -9.0, 2.1, 1.8, 0, 0, 7); c.fill();
    }

    /* jambes proches, devant le corps */
    hoofLeg(-3.6, -8.6, st, body, true);
    hoofLeg(5.8, -8.4, -st * 0.85, body, true);

    /* encolure + tête de cheval */
    c.beginPath();
    c.moveTo(4.6, -14.4);
    c.quadraticCurveTo(6.4, -17.6, 9.0, -18.4);    /* crête / nuque */
    c.lineTo(10.2, -18.6);                           /* front */
    c.quadraticCurveTo(12.6, -17.8, 15.4, -14.4);   /* chanfrein long */
    c.quadraticCurveTo(16.2, -13.2, 15.8, -12.2);   /* naseau */
    c.quadraticCurveTo(14.6, -11.6, 12.8, -12.2);   /* lèvre */
    c.quadraticCurveTo(10.2, -12.6, 8.2, -11.4);    /* ganache */
    c.quadraticCurveTo(6.2, -9.6, 5.2, -9.2);       /* gorge → poitrail */
    c.quadraticCurveTo(4.4, -10.8, 4.6, -13.4);
    c.closePath();
    c.fillStyle = pie ? '#f2ebe0' : body; c.fill(); strokeInk(c, 0.6);
    /* oreilles petites et pointues */
    c.fillStyle = bodyD;
    c.beginPath(); c.moveTo(9.0, -18.2); c.lineTo(8.5, -20.6); c.lineTo(10.0, -18.4); c.closePath(); c.fill(); strokeInk(c, 0.45);
    c.beginPath(); c.moveTo(10.2, -18.4); c.lineTo(10.6, -20.4); c.lineTo(11.2, -18.2); c.closePath(); c.fill(); strokeInk(c, 0.45);
    c.fillStyle = '#c8a090'; c.beginPath(); c.moveTo(9.2, -18.4); c.lineTo(8.9, -19.8); c.lineTo(9.6, -18.4); c.fill();
    /* crinière : de la nuque, le long de l'encolure, un peu tombante */
    c.strokeStyle = mane; c.lineCap = 'round';
    c.lineWidth = 1.05; c.beginPath(); c.moveTo(10.2, -18.7); c.quadraticCurveTo(7.4, -20.0, 4.2, -15.6); c.stroke();
    c.lineWidth = 0.9; c.beginPath(); c.moveTo(9.6, -18.2); c.quadraticCurveTo(6.8, -19.2, 3.6, -15.0); c.stroke();
    c.lineWidth = 0.8; c.beginPath(); c.moveTo(9.0, -17.6); c.quadraticCurveTo(6.4, -18.2, 3.2, -14.4); c.stroke();
    c.lineWidth = 0.7; c.beginPath(); c.moveTo(8.4, -17.0); c.quadraticCurveTo(6.0, -17.2, 3.0, -13.8); c.stroke();
    c.lineWidth = 0.7; c.beginPath(); c.moveTo(10.0, -18.4); c.quadraticCurveTo(8.8, -20.0, 7.0, -18.2); c.stroke();
    /* œil, naseau */
    c.fillStyle = '#f4ecd4'; c.beginPath(); c.arc(12.0, -15.6, 0.72, 0, 7); c.fill();
    c.fillStyle = '#100804'; c.beginPath(); c.arc(12.15, -15.55, 0.4, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(11.95, -15.7, 0.18, 0, 7); c.fill();
    c.fillStyle = pie ? '#4a3020' : '#2a1810'; c.beginPath(); c.ellipse(15.5, -12.6, 0.85, 0.5, 0.35, 0, 7); c.fill();
    /* queue longue depuis la croupe */
    var tw = Math.sin((t || 0) * 3 + ph) * 1.15;
    c.strokeStyle = mane; c.lineCap = 'round';
    c.lineWidth = 2.0; c.beginPath(); c.moveTo(-8.4, -13.0); c.quadraticCurveTo(-13.4, -8.0 + tw, -11.8, -0.6); c.stroke();
    c.lineWidth = 1.25; c.beginPath(); c.moveTo(-8.0, -12.6); c.quadraticCurveTo(-12.2, -7.2 + tw, -10.8, -0.8); c.stroke();
    c.restore();
  }

  /* Sanglier — groin en disque, défenses discrètes, garrot haut, soies en crête, jambes courtes. */
  function drawBoar(c, a, t) {
    var face = a.face || -1, ph = a.ph || 0, bob = Math.sin(ph * 1.4) * 0.28;
    var br = !!a.bright;
    var fur0 = br ? '#c8a888' : '#6a5848', fur1 = br ? '#8a6a50' : '#3e342c', fur2 = br ? '#6a5040' : '#2a221c';
    var headC = br ? '#a07a58' : '#4a3c30', snoutC = br ? '#c4a888' : '#6a5a4c', legC = br ? '#5a4030' : '#1a1410';
    c.save(); c.translate(a.x, a.y + bob); c.scale(face, 1);
    if (!br) { softShadow(c, 0.4, 1.0, 9.5, 1.8); }
    var st = Math.sin(ph * 2.4) * 1.55;
    function bleg(x0, y0, kick) {
      c.strokeStyle = legC; c.lineWidth = 1.75; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + kick * 0.4, y0 + 2.4); c.lineTo(x0 + kick, 0.15); c.stroke();
      c.fillStyle = legC;
      c.beginPath(); c.ellipse(x0 + kick - 0.35, 1.15, 0.55, 0.32, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x0 + kick + 0.4, 1.15, 0.55, 0.32, 0, 0, 7); c.fill();
    }
    bleg(-5.0, -4.6, -st); bleg(-1.8, -4.4, st);
    bleg(3.0, -4.2, st * 0.9); bleg(5.8, -4.2, -st * 0.9);
    /* corps : garrot haut, dos descendant */
    c.beginPath();
    c.moveTo(-7.8, -5.2);
    c.quadraticCurveTo(-7.2, -11.6, -2.2, -13.2);
    c.quadraticCurveTo(3.0, -12.6, 6.6, -8.2);
    c.quadraticCurveTo(7.4, -4.4, 5.2, -3.2);
    c.quadraticCurveTo(0.0, -2.8, -7.0, -3.6);
    c.closePath();
    c.fillStyle = A.grad(c, 0, -13, 0, -3, [0, fur0, 0.5, fur1, 1, fur2]); c.fill();
    strokeInk(c, 0.6);
    /* crête de soies (courtes, denses — pas 4 bâtons) */
    var i;
    c.strokeStyle = 'rgba(160,148,128,.75)'; c.lineCap = 'round';
    for (i = 0; i < 14; i++) {
      var bx = -3.6 + i * 0.55, by = -12.4 - Math.sin((i / 13) * 3.14) * 0.7;
      c.lineWidth = 0.5; c.beginPath(); c.moveTo(bx, by + 0.6); c.lineTo(bx + 0.15, by - 0.85); c.stroke();
    }
    /* tête allongée + groin */
    c.beginPath();
    c.moveTo(5.2, -9.0);
    c.quadraticCurveTo(8.0, -9.2, 11.4, -6.6);
    c.quadraticCurveTo(13.6, -5.4, 13.8, -4.0);
    c.lineTo(13.5, -3.0);
    c.quadraticCurveTo(10.4, -2.4, 5.4, -4.4);
    c.closePath();
    c.fillStyle = headC; c.fill(); strokeInk(c, 0.55);
    c.fillStyle = snoutC; c.beginPath(); c.ellipse(13.6, -3.6, 1.5, 1.15, 0.12, 0, 7); c.fill(); strokeInk(c, 0.4);
    c.fillStyle = '#1a100c'; c.beginPath(); c.arc(13.2, -3.7, 0.26, 0, 7); c.arc(14.05, -3.5, 0.26, 0, 7); c.fill();
    /* défenses courtes recourbées */
    c.strokeStyle = '#f2ead8'; c.lineWidth = 0.95; c.lineCap = 'round';
    c.beginPath(); c.moveTo(11.0, -3.0); c.quadraticCurveTo(12.0, -2.0, 11.5, -1.15); c.stroke();
    c.beginPath(); c.moveTo(10.7, -2.8); c.quadraticCurveTo(11.5, -1.9, 11.1, -1.15); c.stroke();
    c.fillStyle = '#100c08'; c.beginPath(); c.arc(8.0, -6.6, 0.52, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,230,.5)'; c.beginPath(); c.arc(7.85, -6.75, 0.18, 0, 7); c.fill();
    /* oreille */
    c.fillStyle = '#3a3028';
    c.beginPath(); c.moveTo(5.8, -9.2); c.lineTo(5.0, -12.0); c.lineTo(7.2, -9.4); c.closePath(); c.fill(); strokeInk(c, 0.4);
    c.strokeStyle = '#2a2018'; c.lineWidth = 1.0;
    c.beginPath(); c.moveTo(-7.6, -5.6); c.quadraticCurveTo(-9.6, -7.0 + Math.sin((t || 0) * 5 + ph), -8.6, -3.4); c.stroke();
    c.restore();
  }

  /* Brebis manex / latxa — toison en lobes, encolure visible, oreilles pendantes, pattes fines. */
  function drawSheep(c, a, t) {
    var face = a.face || -1, ph = a.ph || 0, rousse = (a.coat || 0) % 2 === 1;
    var head = rousse ? '#8a4a28' : '#2a201c';
    var wool = rousse ? '#f3eee4' : '#f7f4ee';
    var woolD = rousse ? '#d8d0c4' : '#d4d0c6';
    c.save(); c.translate(a.x, a.y + Math.sin(ph) * 0.22); c.scale(face, 1);
    softShadow(c, 0.2, 1.0, 8.2, 1.6);
    var st = Math.sin(ph * 2) * 1.2;
    function sleg(x0, kick) {
      c.strokeStyle = head; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, -3.8); c.lineTo(x0 + kick * 0.4, -1.2); c.lineTo(x0 + kick, 1.25); c.stroke();
      c.fillStyle = head; c.beginPath(); c.ellipse(x0 + kick, 1.4, 0.65, 0.28, 0, 0, 7); c.fill();
    }
    sleg(-3.8, -st); sleg(-0.6, st); sleg(2.8, st * 0.9); sleg(5.0, -st * 0.9);
    function flock(cx, cy, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill(); }
    flock(-1.0, -8.2, 6.4, 5.4, woolD);
    flock(1.2, -9.0, 5.6, 5.0, wool);
    flock(-4.6, -7.2, 3.2, 3.0, wool);
    flock(4.4, -7.0, 3.0, 2.8, wool);
    flock(0.4, -12.0, 3.4, 2.2, '#fffdf8');
    flock(-5.6, -5.6, 2.2, 2.0, woolD);
    /* encolure laineuse, puis tête nettement détachée */
    flock(6.2, -8.6, 2.0, 1.7, wool);
    c.fillStyle = head;
    c.beginPath();
    c.moveTo(6.4, -9.0);
    c.quadraticCurveTo(7.2, -10.6, 8.8, -10.8);  /* front */
    c.quadraticCurveTo(10.8, -10.2, 11.2, -8.4); /* chanfrein */
    c.quadraticCurveTo(11.0, -6.8, 9.2, -6.6);
    c.quadraticCurveTo(7.4, -6.8, 6.6, -7.8);
    c.closePath(); c.fill(); strokeInk(c, 0.5);
    /* oreilles pendantes */
    c.beginPath(); c.ellipse(7.4, -7.6, 0.55, 1.35, 0.45, 0, 7); c.fill();
    c.beginPath(); c.ellipse(8.6, -7.4, 0.5, 1.2, 0.55, 0, 7); c.fill();
    c.fillStyle = '#f4ecd4'; c.beginPath(); c.arc(9.4, -9.2, 0.55, 0, 7); c.fill();
    c.fillStyle = '#100804'; c.beginPath(); c.arc(9.5, -9.15, 0.3, 0, 7); c.fill();
    c.fillStyle = head; c.beginPath(); c.ellipse(11.05, -7.6, 0.45, 0.3, 0, 0, 7); c.fill();
    c.restore();
  }


  /* Vache d'estive / betizu : silhouette compacte, robes distinctes.
     Coat 0 = betizu (robe fauve, cornes en lyre — typifiée, sources : Artzamendi, La Rhune).
     Coat 1 = vache d'estive plus sombre (campas d'Urbía et estives d'Aralar). */
  function drawCow(c, a, t) {
    var face = a.face || -1, ph = a.ph || 0, mont = (a.breed === 'montbeliarde') || (a.coat === 2);
    var betizu = !mont && ((a.coat || 0) % 2 === 0);
    var body = mont ? '#f4f0e6' : (betizu ? '#a05628' : '#6a4a32');
    var bodyD = mont ? '#c45a32' : (betizu ? '#6a3418' : '#3a2c20');
    var bodyL = mont ? '#fffaf0' : (betizu ? '#c87840' : '#8a6a48');
    var horn = '#f0e6d0';
    /* Échelle calée sur le pottok, unique cheval du jeu (29×23 px à alpha 90).
       scX / scY : 1,188 × 1,250 sur le sprite local, pour une emprise
       de 29×23 px (±1). a.sc sert encore aux couches lointaines. */
    var sc = (a.sc != null ? a.sc : 1);
    var scX = sc * 1.188, scY = sc * 1.250;
    c.save(); c.translate(a.x, a.y + Math.sin(ph) * 0.18 * scY); c.scale(face * scX, scY);
    c.translate(0, -1.5);
    softShadow(c, 0.4, 1.2, 10.5, 1.8);
    var st = Math.sin(ph * 2) * 1.35;
    function cleg(x0, kick, thick) {
      c.strokeStyle = bodyD; c.lineWidth = thick || 1.55; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, -4.2); c.lineTo(x0 + kick * 0.35, -1.4); c.lineTo(x0 + kick, 1.35); c.stroke();
      c.fillStyle = '#1a120c'; c.beginPath(); c.ellipse(x0 + kick, 1.5, 0.85, 0.32, 0, 0, 7); c.fill();
    }
    cleg(-5.2, -st, 1.65); cleg(-1.4, st, 1.55); cleg(3.0, st * 0.9, 1.55); cleg(6.2, -st * 0.9, 1.65);
    /* corps profond, garrot un peu relevé */
    c.fillStyle = bodyD;
    c.beginPath(); c.ellipse(-0.4, -8.2, 8.2, 5.6, -0.08, 0, 7); c.fill();
    c.fillStyle = body;
    c.beginPath(); c.ellipse(0.2, -8.8, 7.6, 5.2, -0.06, 0, 7); c.fill();
    c.fillStyle = bodyL;
    c.beginPath(); c.ellipse(-1.6, -11.2, 4.4, 2.4, -0.2, 0, 7); c.fill();
    /* fanon / poitrail */
    c.fillStyle = bodyD;
    c.beginPath(); c.ellipse(6.4, -6.2, 2.2, 2.0, 0.2, 0, 7); c.fill();
    /* queue */
    c.strokeStyle = bodyD; c.lineWidth = 0.85; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-7.6, -10.2); c.quadraticCurveTo(-10.4, -6.0, -9.2, -1.6); c.stroke();
    c.fillStyle = betizu ? '#3a2014' : '#1a120c';
    c.beginPath(); c.ellipse(-9.2, -1.2, 1.1, 1.6, 0.3, 0, 7); c.fill();
    /* encolure et tête */
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(6.2, -11.0);
    c.quadraticCurveTo(8.4, -12.2, 9.6, -11.2);
    c.quadraticCurveTo(12.6, -10.6, 13.2, -8.6);
    c.quadraticCurveTo(13.0, -6.8, 11.0, -6.4);
    c.quadraticCurveTo(8.6, -6.6, 6.8, -7.8);
    c.closePath(); c.fill(); strokeInk(c, 0.5);
    c.fillStyle = bodyL;
    c.beginPath(); c.ellipse(11.4, -7.6, 1.6, 1.15, 0.15, 0, 7); c.fill();
    /* oreille */
    c.fillStyle = bodyD;
    c.beginPath(); c.ellipse(9.0, -10.6, 0.7, 1.5, 0.5, 0, 7); c.fill();
    /* œil */
    c.fillStyle = '#f4ecd4'; c.beginPath(); c.arc(11.0, -9.2, 0.55, 0, 7); c.fill();
    c.fillStyle = '#100804'; c.beginPath(); c.arc(11.15, -9.15, 0.3, 0, 7); c.fill();
    /* mufle */
    c.fillStyle = betizu ? '#3a2418' : '#1a1410';
    c.beginPath(); c.ellipse(13.05, -7.5, 1.05, 0.7, 0.1, 0, 7); c.fill();
    /* cornes : lyre (betizu) ou plus courtes */
    c.strokeStyle = horn; c.fillStyle = horn; c.lineWidth = 0.85; c.lineCap = 'round';
    if (betizu) {
      c.beginPath(); c.moveTo(9.6, -11.4); c.quadraticCurveTo(9.0, -14.2, 10.4, -16.0); c.stroke();
      c.beginPath(); c.moveTo(10.6, -11.6); c.quadraticCurveTo(12.4, -14.6, 13.6, -15.6); c.stroke();
      c.beginPath(); c.arc(10.4, -16.0, 0.45, 0, 7); c.fill();
      c.beginPath(); c.arc(13.6, -15.6, 0.45, 0, 7); c.fill();
    } else {
      c.beginPath(); c.moveTo(9.6, -11.4); c.quadraticCurveTo(9.2, -13.8, 9.8, -15.2); c.stroke();
      c.beginPath(); c.moveTo(10.6, -11.6); c.quadraticCurveTo(11.6, -14.0, 12.2, -15.0); c.stroke();
    }
    /* tache plus claire typique de certaines betizu, discrète */
    if (betizu) {
      c.fillStyle = 'rgba(240, 210, 170, 0.28)';
      c.beginPath(); c.ellipse(2.4, -7.2, 2.2, 1.3, 0.2, 0, 7); c.fill();
    }
    /* Montbéliarde : robe blanche à plages acajou, tête blanche, lunettes et oreilles sombres */
    if (mont) {
      c.fillStyle = '#c45a32';
      c.beginPath(); c.ellipse(-2.2, -8.2, 3.4, 2.8, -0.15, 0, 7); c.fill();
      c.beginPath(); c.ellipse(3.4, -7.0, 2.4, 2.0, 0.2, 0, 7); c.fill();
      c.fillStyle = '#f4f0e6';
      c.beginPath(); c.ellipse(11.0, -8.8, 1.8, 1.6, 0.1, 0, 7); c.fill();
      c.fillStyle = '#8a3a20';
      c.beginPath(); c.ellipse(9.0, -10.6, 0.7, 1.5, 0.5, 0, 7); c.fill();
      /* sonnaille */
      c.strokeStyle = '#c8a050'; c.fillStyle = '#e8c878'; c.lineWidth = 0.55;
      c.beginPath(); c.moveTo(8.4, -6.2); c.lineTo(8.4, -4.2); c.stroke();
      c.beginPath(); c.ellipse(8.4, -3.5, 1.15, 1.35, 0, 0, 7); c.fill(); c.stroke();
    }
    c.restore();
  }

  function drawChamois(c, a, t) {
    var face = a.face || -1, ph = a.ph || 0;
    var body = '#c8a068', bodyD = '#8a6840', bodyL = '#e0c490';
    c.save(); c.translate(a.x, a.y + Math.sin(ph) * 0.2); c.scale(face, 1);
    softShadow(c, 0.3, 1.0, 8.5, 1.5);
    var st = Math.sin(ph * 2.2) * 1.5;
    function leg(x0, kick) {
      c.strokeStyle = bodyD; c.lineWidth = 1.25; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, -4.0); c.lineTo(x0 + kick, 1.2); c.stroke();
      c.fillStyle = '#1a120c'; c.beginPath(); c.ellipse(x0 + kick, 1.35, 0.7, 0.28, 0, 0, 7); c.fill();
    }
    leg(-4.2, -st); leg(-1.0, st); leg(2.4, st * 0.9); leg(5.0, -st * 0.9);
    c.fillStyle = bodyD;
    c.beginPath(); c.ellipse(0, -8.0, 6.4, 4.2, -0.08, 0, 7); c.fill();
    c.fillStyle = body;
    c.beginPath(); c.ellipse(0.3, -8.5, 5.8, 3.8, -0.06, 0, 7); c.fill();
    c.fillStyle = bodyL;
    c.beginPath(); c.ellipse(-0.6, -10.2, 3.2, 1.6, -0.2, 0, 7); c.fill();
    /* croupion clair typique */
    c.fillStyle = '#f2ead8';
    c.beginPath(); c.ellipse(-5.2, -8.6, 1.6, 1.5, 0, 0, 7); c.fill();
    c.strokeStyle = bodyD; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-5.8, -10.0); c.quadraticCurveTo(-8.2, -7.2, -7.0, -3.4); c.stroke();
    /* encolure et tête fine, cornes en crochet */
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(4.8, -10.4);
    c.quadraticCurveTo(7.2, -11.4, 8.8, -10.2);
    c.quadraticCurveTo(10.8, -9.4, 11.0, -7.6);
    c.quadraticCurveTo(10.4, -6.4, 8.2, -6.6);
    c.quadraticCurveTo(6.0, -7.2, 5.0, -8.4);
    c.closePath(); c.fill(); strokeInk(c, 0.45);
    c.fillStyle = '#f4ecd4'; c.beginPath(); c.arc(9.2, -9.0, 0.45, 0, 7); c.fill();
    c.fillStyle = '#100804'; c.beginPath(); c.arc(9.35, -8.95, 0.25, 0, 7); c.fill();
    c.fillStyle = '#3a2a1c'; c.beginPath(); c.ellipse(10.9, -7.6, 0.8, 0.5, 0.1, 0, 7); c.fill();
    c.strokeStyle = '#3a2a1c'; c.lineWidth = 0.85; c.lineCap = 'round';
    c.beginPath(); c.moveTo(7.8, -11.0); c.quadraticCurveTo(7.2, -14.2, 8.4, -15.4); c.stroke();
    c.beginPath(); c.moveTo(8.6, -11.2); c.quadraticCurveTo(9.8, -14.4, 10.6, -15.0); c.stroke();
    c.restore();
  }


  function drawIbex(c, a, t) {
    /* Bouquetin des Alpes typifié : plus massif que le chamois, robe gris-brun,
       longue barbe, cornes recourbées vers l'arrière (mâle). Pas de chiffres inventés. */
    var face = a.face || -1, ph = a.ph || 0;
    var body = '#8a6a48', bodyD = '#5a4030', bodyL = '#c4a078';
    c.save(); c.translate(a.x, a.y + Math.sin(ph) * 0.15); c.scale(face, 1);
    softShadow(c, 0.35, 1.1, 9.2, 1.6);
    var st = Math.sin(ph * 1.8) * 1.2;
    function leg(x0, kick) {
      c.strokeStyle = bodyD; c.lineWidth = 1.55; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, -4.6); c.lineTo(x0 + kick, 1.3); c.stroke();
      c.fillStyle = '#1a120c'; c.beginPath(); c.ellipse(x0 + kick, 1.45, 0.85, 0.32, 0, 0, 7); c.fill();
    }
    leg(-4.6, -st); leg(-1.2, st); leg(2.6, st * 0.9); leg(5.4, -st * 0.9);
    c.fillStyle = bodyD;
    c.beginPath(); c.ellipse(0.2, -8.6, 7.0, 4.8, -0.06, 0, 7); c.fill();
    c.fillStyle = body;
    c.beginPath(); c.ellipse(0.5, -9.1, 6.4, 4.3, -0.05, 0, 7); c.fill();
    c.fillStyle = bodyL;
    c.beginPath(); c.ellipse(-0.2, -11.0, 3.4, 1.7, -0.18, 0, 7); c.fill();
    /* croupe un peu plus claire */
    c.fillStyle = '#b89870';
    c.beginPath(); c.ellipse(-5.4, -8.8, 1.8, 1.6, 0, 0, 7); c.fill();
    c.strokeStyle = bodyD; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-6.2, -10.2); c.quadraticCurveTo(-8.0, -8.0, -6.8, -4.0); c.stroke();
    /* encolure massive, tête, barbe */
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(4.6, -11.0);
    c.quadraticCurveTo(7.4, -12.4, 9.2, -11.2);
    c.quadraticCurveTo(11.2, -10.2, 11.0, -8.0);
    c.quadraticCurveTo(10.2, -6.6, 8.0, -6.8);
    c.quadraticCurveTo(6.0, -7.6, 4.8, -9.0);
    c.closePath(); c.fill(); strokeInk(c, 0.45);
    c.fillStyle = '#3a2a1c';
    c.beginPath(); c.moveTo(9.6, -7.6); c.quadraticCurveTo(10.4, -5.2, 9.2, -3.6); c.quadraticCurveTo(8.6, -5.0, 9.0, -7.2); c.closePath(); c.fill();
    c.fillStyle = '#f0e8d4'; c.beginPath(); c.arc(9.6, -10.0, 0.5, 0, 7); c.fill();
    c.fillStyle = '#100804'; c.beginPath(); c.arc(9.75, -9.95, 0.28, 0, 7); c.fill();
    c.fillStyle = '#2a1c12'; c.beginPath(); c.ellipse(11.0, -8.0, 0.7, 0.4, 0.1, 0, 7); c.fill();
    /* cornes recourbées vers l'arrière, à crêtes typifiées */
    c.strokeStyle = '#3a2a1c'; c.lineWidth = 1.35; c.lineCap = 'round';
    c.beginPath(); c.moveTo(7.2, -12.2); c.quadraticCurveTo(5.4, -18.6, 3.2, -21.4); c.stroke();
    c.beginPath(); c.moveTo(8.2, -12.4); c.quadraticCurveTo(7.2, -18.8, 5.8, -21.8); c.stroke();
    c.strokeStyle = 'rgba(200, 180, 140, 0.45)'; c.lineWidth = 0.45;
    c.beginPath(); c.moveTo(6.8, -13.4); c.quadraticCurveTo(5.2, -18.0, 3.6, -20.2); c.stroke();
    c.restore();
  }

  function drawTetra(c, a, t) {
    var face = a.face || -1, ph = a.ph || 0;
    c.save(); c.translate(a.x, a.y + Math.sin(ph) * 0.12); c.scale(face, 1);
    softShadow(c, 0.25, 0.8, 6.2, 1.1);
    var body = '#3a342c', bodyL = '#6a5a44', breast = '#2a1814';
    c.fillStyle = body;
    c.beginPath(); c.ellipse(0.2, -5.4, 5.6, 3.4, -0.12, 0, 7); c.fill();
    c.fillStyle = breast;
    c.beginPath(); c.ellipse(2.4, -4.4, 2.6, 2.2, 0.2, 0, 7); c.fill();
    /* queue en éventail, typique du grand tétras */
    c.fillStyle = '#2a2620';
    c.beginPath();
    c.moveTo(-4.6, -6.2);
    c.quadraticCurveTo(-9.4, -8.8, -8.2, -3.6);
    c.quadraticCurveTo(-7.0, -2.2, -4.2, -3.8);
    c.closePath(); c.fill(); strokeInk(c, 0.4);
    c.strokeStyle = '#c8b070'; c.lineWidth = 0.4; c.globalAlpha = 0.55;
    c.beginPath(); c.moveTo(-5.0, -6.0); c.lineTo(-8.0, -7.2); c.stroke();
    c.globalAlpha = 1;
    /* tête petite, bec clair, barbe (mâle typifié) */
    c.fillStyle = body;
    c.beginPath(); c.ellipse(5.4, -7.0, 2.0, 1.6, 0.15, 0, 7); c.fill();
    c.fillStyle = '#e8d090';
    c.beginPath(); c.moveTo(7.0, -7.0); c.lineTo(8.6, -6.4); c.lineTo(7.0, -6.2); c.closePath(); c.fill();
    c.fillStyle = '#d0c8b0'; c.beginPath(); c.arc(5.8, -7.3, 0.35, 0, 7); c.fill();
    c.fillStyle = '#1a1008'; c.beginPath(); c.arc(5.9, -7.25, 0.18, 0, 7); c.fill();
    c.strokeStyle = bodyL; c.lineWidth = 0.7;
    var st = Math.sin(ph * 2) * 0.8;
    c.beginPath(); c.moveTo(-1.6, -3.2); c.lineTo(-1.8 + st, 0.6); c.stroke();
    c.beginPath(); c.moveTo(2.4, -3.0); c.lineTo(2.6 - st, 0.6); c.stroke();
    c.restore();
  }

  /* lynx discret : silhouette en lisière, jamais sur le sentier, pas de collision */
  function drawLynx(c, x, y, sc, t, face) {
    sc = sc || 1; face = face || -1;
    c.save(); c.translate(x, y); c.scale(sc * face, sc);
    c.globalAlpha = 0.82;
    softShadow(c, 0.2, 0.7, 6, 1.0);
    var fur = '#c49a62', furD = '#7a5a32', furL = '#e2c48a';
    c.fillStyle = furD;
    c.beginPath(); c.ellipse(0, -6.4, 6.0, 3.6, -0.05, 0, 7); c.fill();
    c.fillStyle = fur;
    c.beginPath(); c.ellipse(0.3, -6.8, 5.4, 3.2, -0.04, 0, 7); c.fill();
    /* taches discrètes */
    c.fillStyle = 'rgba(80,50,24,.28)';
    [[-2, -6.2, 0.7], [1.4, -7.0, 0.55], [3.0, -5.8, 0.5]].forEach(function (q) {
      c.beginPath(); c.ellipse(q[0], q[1], q[2], q[2] * 0.7, 0, 0, 7); c.fill();
    });
    c.fillStyle = furL;
    c.beginPath(); c.ellipse(-4.6, -5.2, 1.5, 1.2, 0, 0, 7); c.fill(); /* culottes */
    /* queue courte */
    c.strokeStyle = furD; c.lineWidth = 1.1; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-5.6, -5.8); c.quadraticCurveTo(-8.0, -5.0, -7.2, -3.2); c.stroke();
    c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(-7.2, -3.2, 0.7, 0, 7); c.fill();
    /* tête ronde, pinceaux noirs */
    c.fillStyle = fur;
    c.beginPath(); c.ellipse(5.4, -8.4, 2.6, 2.4, 0.1, 0, 7); c.fill();
    c.fillStyle = furD;
    c.beginPath(); c.moveTo(4.2, -10.2); c.lineTo(3.6, -12.4); c.lineTo(5.0, -10.6); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(6.4, -10.4); c.lineTo(7.2, -12.6); c.lineTo(7.0, -10.2); c.closePath(); c.fill();
    c.fillStyle = '#1a1008';
    c.beginPath(); c.moveTo(3.6, -12.4); c.lineTo(3.4, -13.4); c.lineTo(4.0, -12.4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(7.2, -12.6); c.lineTo(7.6, -13.6); c.lineTo(7.4, -12.4); c.closePath(); c.fill();
    c.fillStyle = '#f0e8d4'; c.beginPath(); c.arc(6.2, -8.6, 0.45, 0, 7); c.fill();
    c.fillStyle = '#140c08'; c.beginPath(); c.arc(6.35, -8.55, 0.25, 0, 7); c.fill();
    c.globalAlpha = 1; c.restore();
  }

  /* Vautour fauve, dessous / ¾ : ailes larges et rectangulaires, 6–7 doigts,
     queue courte et carrée, petite tête claire sur fraise, envergure ≈ 2,5 × corps. */
  function drawRaptor(c, r, E, xa, xb) {
    var t = E.time, kind = r.kind || 'buzzard';
    var n = raptorCount(r), i, p;
    for (i = 0; i < n; i++) {
      p = birdPos(r, E, i);
      if (i === 0) { r._lx = p.x; r._ly = p.y; }
      if (p.x < xa - 36 || p.x > xb + 36) { continue; }
      c.save(); c.translate(p.x, p.y);
      if (kind === 'vautour' || kind === 'vulture' || kind === 'griffon') { drawGriffon(c, t, i); }
      else if (kind === 'falcon' || kind === 'faucon') { drawFalcon(c, t, i); }
      else { drawBuzzard(c, t, i); }
      c.restore();
    }
  }

  function drawGriffon(c, t, i) {
    /* Vautour fauve en vol plané, style des autres rapaces : ailes cambrées plus longues,
       doigts visibles, corps fauve, queue courte, petite tête claire. Pas de planche, pas d'œil cartoon. */
    var flap = Math.sin((t || 0) * 1.5 + (i || 0)) * 0.28;
    function wing(side) {
      var tipY = flap * 0.45;
      c.save(); c.scale(side, 1); c.rotate(0.16);
      c.beginPath();
      c.moveTo(1.2, -1.8);
      c.quadraticCurveTo(6.8, -4.0, 11.2, -1.4 + tipY * 0.3);
      c.quadraticCurveTo(15.6, 0.05 + tipY, 17.6, 0.45 + tipY);
      c.quadraticCurveTo(15.8, 1.7 + tipY, 11.0, 2.15);
      c.quadraticCurveTo(6.2, 2.7, 1.2, 1.5);
      c.closePath();
      c.fillStyle = '#5a4030'; c.fill();
      strokeInk(c, 0.5);
      c.fillStyle = '#d2b484';
      c.beginPath();
      c.moveTo(5.4, -0.35);
      c.lineTo(10.6, -0.55 + tipY * 0.3);
      c.lineTo(10.2, 1.55);
      c.lineTo(5.0, 1.4);
      c.closePath(); c.fill();
      var k;
      for (k = 0; k < 5; k++) {
        c.save();
        c.translate(16.4, 0.5 + tipY);
        c.rotate(-0.46 + k * 0.23);
        c.fillStyle = '#2a1c12';
        c.beginPath(); c.moveTo(0, -0.38); c.quadraticCurveTo(2.6, -0.1, 3.1, 0); c.quadraticCurveTo(2.6, 0.1, 0, 0.38); c.closePath(); c.fill();
        c.restore();
      }
      c.restore();
    }
    c.save();
    c.scale(1.12, 1.12);
    softShadow(c, 0, 3.4, 12, 1.8);
    wing(-1); wing(1);
    c.fillStyle = '#c4a070';
    c.beginPath(); c.ellipse(0.3, 0.25, 2.7, 1.85, 0.08, 0, 7); c.fill();
    strokeInk(c, 0.45);
    c.fillStyle = '#3a2a1c';
    c.beginPath();
    c.moveTo(-1.9, 0.35); c.lineTo(-4.6, 0.7); c.lineTo(-4.7, 2.35); c.lineTo(-1.2, 1.8);
    c.closePath(); c.fill();
    strokeInk(c, 0.4);
    /* fraise et petite tête, sans œil cartoon */
    c.fillStyle = '#efe6d4';
    c.beginPath(); c.ellipse(2.55, 0.0, 1.2, 1.1, 0, 0, 7); c.fill();
    c.fillStyle = '#e8dcc0';
    c.beginPath(); c.ellipse(3.7, -0.18, 0.9, 0.72, 0.2, 0, 7); c.fill();
    strokeInk(c, 0.4);
    c.fillStyle = '#c8a040';
    c.beginPath(); c.moveTo(4.4, -0.28); c.lineTo(5.5, -0.02); c.lineTo(4.4, 0.22); c.closePath(); c.fill();
    c.restore();
  }

  function drawBuzzard(c, t, i) {
    var flap = Math.sin((t || 0) * 2.4 + (i || 0)) * 0.6;
    function wing(side) {
      var s = side;
      c.save(); c.scale(s, 1); c.rotate(0.14);
      var tipY = flap * 0.35;
      /* aile large, bout arrondi — une seule forme brune */
      c.beginPath();
      c.moveTo(1.3, -1.7);
      c.quadraticCurveTo(6.2, -3.1, 10.6, -1.0 + tipY);
      c.quadraticCurveTo(11.6, 0.5 + tipY, 10.4, 2.1 + tipY);
      c.quadraticCurveTo(6.0, 2.7, 1.4, 1.4);
      c.closePath();
      c.fillStyle = '#5a4634'; c.fill();
      /* fenêtre claire sur les rémiges (bande, pas un ovale) */
      c.fillStyle = '#d4c4a4';
      c.beginPath();
      c.moveTo(6.0, -0.15);
      c.lineTo(9.4, -0.35 + tipY * 0.4);
      c.lineTo(9.0, 1.7 + tipY * 0.3);
      c.lineTo(5.6, 1.5);
      c.closePath(); c.fill();
      /* tache carpienne en virgule, pas une pupille */
      c.fillStyle = '#2a1c12';
      c.beginPath();
      c.moveTo(4.6, -1.35);
      c.quadraticCurveTo(6.4, 0.15, 5.0, 1.15);
      c.quadraticCurveTo(4.2, 0.1, 4.6, -1.35);
      c.closePath(); c.fill();
      /* 5 doigts au bout arrondi, légèrement écartés */
      var k;
      for (k = 0; k < 5; k++) {
        var ang = -0.4 + k * 0.2;
        c.save(); c.translate(10.5, 0.4 + tipY); c.rotate(ang);
        c.fillStyle = '#2a1c12';
        c.beginPath(); c.moveTo(0, -0.28); c.quadraticCurveTo(1.15, -0.08, 1.4, 0); c.quadraticCurveTo(1.15, 0.08, 0, 0.28); c.closePath(); c.fill();
        c.restore();
      }
      c.restore();
    }
    c.save();
    softShadow(c, 0, 3.2, 10, 1.8);
    wing(-1); wing(1);
    /* corps */
    c.fillStyle = '#6a5848'; c.beginPath(); c.ellipse(0.35, 0.05, 2.35, 1.85, 0, 0, 7); c.fill();
    /* queue étalée, barrée, bande subterminale sombre */
    c.fillStyle = '#c8b090';
    c.beginPath();
    c.moveTo(-1.2, 0.7); c.lineTo(-4.4, 1.2); c.lineTo(-4.6, 3.5); c.lineTo(0.3, 3.2); c.lineTo(1.0, 0.9);
    c.closePath(); c.fill();
    c.strokeStyle = '#4a3a28'; c.lineWidth = 0.45;
    c.beginPath(); c.moveTo(-1.6, 1.5); c.lineTo(-4.2, 1.85); c.moveTo(-1.6, 2.2); c.lineTo(-4.3, 2.5); c.stroke();
    c.fillStyle = '#3a2a1c'; c.beginPath();
    c.moveTo(-4.55, 3.05); c.lineTo(-4.6, 3.5); c.lineTo(0.3, 3.2); c.lineTo(0.25, 2.75); c.closePath(); c.fill();
    /* tête */
    c.fillStyle = '#5a4a3c'; c.beginPath(); c.ellipse(2.4, -0.5, 1.2, 1.0, 0.2, 0, 7); c.fill();
    c.fillStyle = '#d8a848'; c.beginPath(); c.moveTo(3.4, -0.65); c.lineTo(4.45, -0.35); c.lineTo(3.4, -0.1); c.closePath(); c.fill();
    c.fillStyle = '#1a1008'; c.beginPath(); c.arc(2.6, -0.7, 0.2, 0, 7); c.fill();
    c.restore();
  }

  function drawFalcon(c, t, i) {
    var flap = Math.sin((t || 0) * 3.2 + (i || 0)) * 0.5;
    function wing(side) {
      var s = side, tipX = s * 12.4, tipY = -1.1 + flap * 0.45 * s;
      c.beginPath();
      c.moveTo(s * 1.0, -1.0);
      c.quadraticCurveTo(s * 6.0, -3.6 + flap * 0.2 * s, tipX, tipY);
      c.quadraticCurveTo(s * 7.0, -0.1, s * 1.2, 1.0);
      c.closePath();
      c.fillStyle = '#3a4558'; c.fill();
      c.fillStyle = '#e0d0b0';
      c.beginPath();
      c.moveTo(s * 1.1, -0.15);
      c.quadraticCurveTo(s * 5.0, -0.7, s * 8.2, tipY * 0.35);
      c.quadraticCurveTo(s * 5.2, 0.75, s * 1.2, 0.8);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(60,40,24,.45)'; c.lineWidth = 0.35;
      c.beginPath();
      c.moveTo(s * 2.4, 0.15); c.lineTo(s * 6.4, -0.05);
      c.moveTo(s * 2.6, 0.5); c.lineTo(s * 5.6, 0.35);
      c.stroke();
    }
    c.save();
    softShadow(c, 0, 2.8, 9, 1.6);
    wing(-1); wing(1);
    c.fillStyle = '#e8d8b8'; c.beginPath(); c.ellipse(0.3, 0.15, 2.0, 1.5, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(60,40,24,.5)'; c.lineWidth = 0.35;
    c.beginPath(); c.moveTo(-0.8, -0.2); c.lineTo(1.4, -0.15); c.moveTo(-0.8, 0.4); c.lineTo(1.2, 0.45); c.stroke();
    c.fillStyle = '#4a5568';
    c.beginPath(); c.moveTo(-1.2, 0.5); c.lineTo(-4.5, 0.7); c.lineTo(-4.6, 2.0); c.lineTo(-0.4, 1.5); c.closePath(); c.fill();
    c.strokeStyle = '#e8d8b8'; c.lineWidth = 0.35;
    c.beginPath(); c.moveTo(-1.6, 0.9); c.lineTo(-4.3, 1.05); c.moveTo(-1.6, 1.4); c.lineTo(-4.3, 1.5); c.stroke();
    c.fillStyle = '#e8d8b8'; c.beginPath(); c.ellipse(2.15, -0.35, 1.15, 0.95, 0.15, 0, 7); c.fill();
    c.fillStyle = '#1a1c22';
    c.beginPath(); c.ellipse(2.05, -0.7, 1.05, 0.6, 0.2, 0, 7); c.fill();
    c.beginPath(); c.moveTo(2.3, -0.35); c.lineTo(3.15, 0.35); c.lineTo(2.15, 0.2); c.closePath(); c.fill();
    c.fillStyle = '#e8b030'; c.beginPath(); c.moveTo(3.05, -0.45); c.lineTo(4.15, -0.15); c.lineTo(3.05, 0.05); c.closePath(); c.fill();
    c.fillStyle = '#1a1008'; c.beginPath(); c.arc(2.35, -0.4, 0.2, 0, 7); c.fill();
    c.strokeStyle = '#e8b030'; c.lineWidth = 0.55; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0.4, 1.3); c.lineTo(0.2, 2.2); c.moveTo(1.0, 1.3); c.lineTo(0.9, 2.15); c.stroke();
    c.restore();
  }

  function drawBat(c, a, t) {
    var flap = Math.sin((t || 0) * 18 + (a.ph || 0)) * 2.2;
    c.save(); c.translate(a.x, a.y);
    softShadow(c, 0, 2.6, 7, 1.4);
    function mem(side) {
      var s = side, tip = s * (8.4 + (s > 0 ? flap * 0.15 : -flap * 0.15)), drop = (s > 0 ? flap : -flap) * 0.35;
      /* membrane */
      c.fillStyle = 'rgba(176,164,196,.88)';
      c.beginPath();
      c.moveTo(s * 0.9, -0.5);
      c.quadraticCurveTo(s * 4.2, -2.4 + drop, tip, -0.2 + drop);
      c.quadraticCurveTo(s * 5.5, 2.2 + drop, s * 1.4, 1.6);
      c.lineTo(s * 0.6, 0.8);
      c.closePath(); c.fill();
      strokeInk(c, 0.4);
      /* avant-bras + 4 doigts */
      c.strokeStyle = '#3a3048'; c.lineWidth = 0.55; c.lineCap = 'round';
      c.beginPath(); c.moveTo(s * 0.8, -0.3); c.lineTo(s * 4.6, -1.6 + drop); c.lineTo(tip, -0.15 + drop); c.stroke();
      var k;
      for (k = 0; k < 4; k++) {
        var uy = -0.4 + k * 0.7;
        c.beginPath(); c.moveTo(s * 4.6, -1.6 + drop); c.quadraticCurveTo(s * 6.2, uy + drop, s * (6.6 - k * 0.3), 1.5 + uy * 0.4 + drop); c.stroke();
      }
    }
    mem(-1); mem(1);
    /* uropatagium */
    c.fillStyle = 'rgba(176,164,196,.8)';
    c.beginPath(); c.moveTo(-1.2, 0.9); c.quadraticCurveTo(0, 2.6, 1.2, 0.9); c.lineTo(0.4, 0.5); c.lineTo(-0.4, 0.5); c.closePath(); c.fill();
    /* corps allongé, fourrure */
    c.fillStyle = '#4a3020'; c.beginPath(); c.ellipse(0, 0.15, 1.7, 1.45, 0, 0, 7); c.fill(); strokeInk(c, 0.45);
    /* tête + oreilles + museau */
    c.fillStyle = '#4a3020'; c.beginPath(); c.ellipse(0, -1.15, 1.15, 1.0, 0, 0, 7); c.fill();
    c.fillStyle = '#3a2418';
    c.beginPath(); c.moveTo(-0.55, -1.8); c.lineTo(-0.7, -3.15); c.lineTo(-0.05, -1.9); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0.55, -1.8); c.lineTo(0.7, -3.15); c.lineTo(0.05, -1.9); c.closePath(); c.fill();
    strokeInk(c, 0.4);
    c.fillStyle = '#3a2418'; c.beginPath(); c.ellipse(0, -0.55, 0.7, 0.45, 0, 0, 7); c.fill();
    c.fillStyle = '#f0e8d8'; c.beginPath(); c.arc(-0.4, -1.2, 0.22, 0, 7); c.arc(0.4, -1.2, 0.22, 0, 7); c.fill();
    c.fillStyle = '#100804'; c.beginPath(); c.arc(-0.4, -1.2, 0.12, 0, 7); c.arc(0.4, -1.2, 0.12, 0, 7); c.fill();
    c.restore();
  }


  function drawShadow(c, E, drop) {
    if (!drop) { return; }
    var u = Math.min(1, drop.t / drop.dur), gy = gAt(E, drop.x), a = 0.15 + 0.45 * u, rx = 5 + 9 * u, ry = 2 + 3.2 * u;
    c.save();
    c.fillStyle = 'rgba(20,10,8,' + a.toFixed(3) + ')';
    c.beginPath(); c.ellipse(drop.x, gy + 0.4, rx, ry, 0, 0, 7); c.fill();
    /* anneau clair pour bien lire l'endroit de l'impact, distinct du triangle de danger */
    c.strokeStyle = 'rgba(255, 232, 160,' + (0.35 + 0.45 * Math.sin(drop.t * 14)).toFixed(3) + ')';
    c.lineWidth = 0.8; c.beginPath(); c.ellipse(drop.x, gy + 0.4, rx + 1.5, ry + 0.8, 0, 0, 7); c.stroke();
    c.restore();
  }

  function drawPebble(c, k) {
    c.save(); c.translate(k.x, k.y); c.rotate(k.rot);
    c.fillStyle = '#7a6a58'; c.beginPath(); c.moveTo(-k.r, -k.r * 0.3); c.lineTo(k.r * 0.3, -k.r); c.lineTo(k.r, k.r * 0.2); c.lineTo(-k.r * 0.2, k.r); c.closePath(); c.fill();
    c.fillStyle = 'rgba(230,220,200,.4)'; c.fillRect(-k.r * 0.4, -k.r * 0.6, k.r * 0.5, k.r * 0.35);
    c.restore();
  }

  function drawKarstCover(c, E, xa, xb) {
    var gaps = E.feat && E.feat.gaps, t = E.time;
    if (!gaps) { return; }
    gaps.forEach(function (gp) {
      if (!gp.karst) { return; }
      if (gp.x1 < xa - 8 || gp.x0 > xb + 8) { return; }
      var P = E.P, near = P ? Math.max(0, 1 - Math.min(Math.abs(P.x - (gp.x0 + gp.x1) / 2) / 52, 1)) : 0;
      var x, mid = (gp.x0 + gp.x1) / 2, y0 = gp.y, w = gp.x1 - gp.x0;
      /* fougères qui masquent le trou ; elles s'écartent un peu à l'approche (télégraphe juste) */
      for (x = gp.x0 - 10; x < gp.x1 + 10; x += 5) {
        var h = 9 + 6 * hash(x | 0, 91), sway = Math.sin(t * 1.6 + x) * (1.2 + near * 1.4);
        var ox = (x < mid ? -1 : 1) * near * 3.5;
        c.fillStyle = hash(x | 0, 92) > 0.5 ? '#3f7a38' : '#2f5e2c';
        c.beginPath(); c.ellipse(x + sway * 0.4 + ox, y0 - h * 0.45, 4.2, h * 0.55, sway * 0.08, 0, 7); c.fill();
        c.fillStyle = '#5a9a48';
        c.beginPath(); c.ellipse(x + sway * 0.3 + ox * 0.7, y0 - h * 0.7, 2.6, h * 0.35, sway * 0.1, 0, 7); c.fill();
      }
      /* à l'approche : fissure sombre visible sous les fougères */
      if (near > 0.15) {
        c.fillStyle = 'rgba(10,6,8,' + (0.35 * near).toFixed(3) + ')';
        c.beginPath(); c.ellipse(mid, y0 + 1, w * 0.45, 3.2, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(30,18,16,' + (0.5 * near).toFixed(3) + ')';
        c.lineWidth = 0.8; c.beginPath(); c.moveTo(gp.x0 + 2, y0); c.quadraticCurveTo(mid, y0 + 3.5, gp.x1 - 2, y0); c.stroke();
      }
    });
  }

  function drawWet(c, E, xa, xb) {
    if (!E.ZN) { return; }
    var Z_WET = 32, x, gy, t = E.time;
    for (x = Math.floor(xa / 4) * 4; x < xb + 4; x += 4) {
      if (!(E.ZN[x | 0] & Z_WET)) { continue; }
      gy = E.G[x | 0]; if (!isFinite(gy) || gy < -1e5) { continue; }
      if (E.TYPE && E.TYPE[x | 0] === 1) { continue; }
      c.fillStyle = 'rgba(210, 230, 160,' + (0.18 + 0.1 * Math.sin(t * 3 + x * 0.2)).toFixed(3) + ')';
      c.fillRect(x, gy - 1.1, 4.1, 1.6);
      if (hash(x, 101) > 0.82) {
        c.fillStyle = 'rgba(255,255,230,' + (0.35 + 0.45 * Math.abs(Math.sin(t * 5 + x))).toFixed(3) + ')';
        c.fillRect(x + 1, gy - 2.2, 1.1, 1.1);
      }
    }
  }

  function drawRain(c, E, vw, vh) {
    var Z_STORM = 64, P = E.P;
    if (!E.ZN || !P) { return; }
    var k = 0, i, x;
    for (i = -40; i <= 80; i += 20) { x = Math.max(0, Math.min(E.len, (P.x + i) | 0)); if (E.ZN[x] & Z_STORM) { k++; } }
    k /= 7; if (k < 0.05) { return; }
    c.save(); c.strokeStyle = 'rgba(210, 224, 236,' + (0.28 * k).toFixed(3) + ')'; c.lineWidth = 0.7;
    var cam = E.cam, t = E.time, n = Math.round(((document.body && document.body.classList.contains('low-fx')) ? 14 : 40) * k);
    for (i = 0; i < n; i++) {
      var rx = ((hash(i, 201) * (vw + 40) - t * 90) % (vw + 40) + (vw + 40)) % (vw + 40) - 8;
      var ry = ((hash(i, 202) * (vh + 20) + t * 220) % (vh + 20));
      c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 9); c.stroke();
    }
    c.fillStyle = 'rgba(30, 40, 60,' + (0.12 * k).toFixed(3) + ')'; c.fillRect(0, 0, vw, vh);
    c.restore();
  }

  function drawBehind(c, xa, xb, E) {
    if (!E || !E.feat) { return; }
    (E.feat.raptors || []).forEach(function (r) { drawRaptor(c, r, E, xa, xb); });
    (E.feat.raptors || []).forEach(function (r) { if (r.drop) { drawShadow(c, E, r.drop); } });
    drawKarstCover(c, E, xa, xb);
    drawWet(c, E, xa, xb);
  }

  function drawMid(c, xa, xb, E) {
    if (!E || !E.feat) { return; }
    var t = E.time;
    (E.feat.herds || []).forEach(function (h) {
      if (h.st === 'warn') {
        /* petit nuage de poussière / fougères qui bougent du côté d'arrivée */
        var wx = h.cx + 80, gy = gAt(E, wx), a = Math.min(1, h.t * 4);
        c.globalAlpha = 0.45 * a; c.fillStyle = '#c4b08a';
        c.beginPath(); c.arc(wx, gy - 4, 6 + h.t * 4, 0, 7); c.fill(); c.globalAlpha = 1;
      }
      (h.animals || []).forEach(function (an) {
        if (an.x < xa - 20 || an.x > xb + 20) { return; }
        if (an.kind === 'pottok') { drawPottok(c, an, t); } else if (an.kind === 'sheep') { drawSheep(c, an, t); } else if (an.kind === 'cow') { drawCow(c, an, t); } else if (an.kind === 'chamois') { drawChamois(c, an, t); } else if (an.kind === 'ibex') { drawIbex(c, an, t); } else if (an.kind === 'tetra') { drawTetra(c, an, t); } else { drawBoar(c, an, t); }
      });
    });
    (E.feat.pebbles || []).forEach(function (k) { if (k.x > xa - 8 && k.x < xb + 8) { drawPebble(c, k); } });
  }

  function drawFront(c, xa, xb, E) {
    if (!E || !E.feat) { return; }
    var t = E.time;
    (E.feat.bats || []).forEach(function (b) {
      if (b.st !== 'fly') { return; }
      (b.list || []).forEach(function (a) { if (a.x > xa - 10 && a.x < xb + 10) { drawBat(c, a, t); } });
    });
  }

  function herdIncoming(h) {
    if (!h || (h.kind !== 'pottok' && h.kind !== 'boar' && h.kind !== 'sheep' && h.kind !== 'cow' && h.kind !== 'chamois' && h.kind !== 'ibex' && h.kind !== 'tetra')) { return false; }
    if (h.st === 'warn') { return true; }
    if (h.st === 'waitNext' && h.t >= (h.spacing || 2.4) - (h.warn || 1.8)) { return true; }
    return false;
  }
  /* Pastille au bord droit (les animaux arrivent de l'avant), distincte du triangle des éboulis. */
  function drawEdgeAnimalWarn(c, vw, vh, kind, y, t) {
    var pulse = 0.7 + 0.3 * Math.sin((t || 0) * 8);
    var bw = 26, bh = 22, x = vw - 5 - bw;
    if (y < 46) { y = 46; }
    if (y + bh > vh - 26) { y = vh - 26 - bh; }
    c.save();
    c.globalAlpha = 0.94;
    c.fillStyle = 'rgba(255,246,220,.93)';
    c.strokeStyle = '#241a33';
    c.lineWidth = 1.15;
    c.beginPath();
    var r = 5;
    c.moveTo(x + r, y); c.lineTo(x + bw - r, y); c.quadraticCurveTo(x + bw, y, x + bw, y + r);
    c.lineTo(x + bw, y + bh - r); c.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh);
    c.lineTo(x + r, y + bh); c.quadraticCurveTo(x, y + bh, x, y + bh - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
    c.fill(); c.stroke();
    /* chevrons vers le joueur, à gauche de la pastille */
    c.fillStyle = '#c45a28';
    var cx = x - 3, cy = y + bh / 2, j;
    for (j = 0; j < 2; j++) {
      var ox = -j * 5 - pulse * 1.2;
      c.beginPath();
      c.moveTo(cx + ox + 4.2, cy - 5.4);
      c.lineTo(cx + ox - 0.6, cy);
      c.lineTo(cx + ox + 4.2, cy + 5.4);
      c.lineTo(cx + ox + 6.2, cy + 5.4);
      c.lineTo(cx + ox + 1.4, cy);
      c.lineTo(cx + ox + 6.2, cy - 5.4);
      c.closePath(); c.fill();
    }
    c.save();
    c.translate(x + bw * (kind === 'boar' ? 0.42 : (kind === 'cow' ? 0.46 : 0.52)), y + bh - 3.2);
    c.scale(kind === 'cow' ? 0.52 : (kind === 'boar' ? 0.58 : 0.62), kind === 'cow' ? 0.52 : (kind === 'boar' ? 0.58 : 0.62));
    if (kind === 'pottok') { drawPottok(c, { x: 0, y: 0, face: -1, coat: 0, ph: (t || 0) * 6 }, t); }
    else if (kind === 'sheep') { drawSheep(c, { x: 0, y: 0, face: -1, coat: 0, ph: (t || 0) * 6 }, t); }
    else if (kind === 'cow') { drawCow(c, { x: 0, y: 0, face: -1, coat: 2, breed: 'montbeliarde', ph: (t || 0) * 5 }, t); }
    else if (kind === 'chamois') { drawChamois(c, { x: 0, y: 0, face: -1, ph: (t || 0) * 6 }, t); }
    else if (kind === 'ibex') { drawIbex(c, { x: 0, y: 0, face: -1, ph: (t || 0) * 6 }, t); }
    else if (kind === 'tetra') { drawTetra(c, { x: 0, y: 0, face: -1, ph: (t || 0) * 5 }, t); }
    else { drawBoar(c, { x: 0, y: 0, face: 1, coat: 0, ph: (t || 0) * 8, bright: true }, t); }
    c.restore();
    c.restore();
  }
  function drawArrivalIndicators(c, vw, vh, E) {
    /* Pas d'indicateur de bord une fois le sommet atteint (célébration). */
    if (!E || !E.feat) { return; }
    if (E.state === 'won' || (window.Game && Game.state && Game.state() === 'won')) { return; }
    var shown = {}, n = 0;
    (E.feat.herds || []).forEach(function (h) {
      if (herdIncoming(h) && !shown[h.kind]) { shown[h.kind] = true; n++; }
    });
    if (!n) { return; }
    var y0 = Math.max(50, vh * 0.38), idx = 0;
    ['pottok', 'boar', 'sheep', 'cow', 'chamois', 'ibex', 'tetra'].forEach(function (k) {
      if (!shown[k]) { return; }
      drawEdgeAnimalWarn(c, vw, vh, k, y0 + idx * 28, E.time);
      idx++;
    });
  }
  function drawWeather(c, vw, vh, E) { drawRain(c, E, vw, vh); }
  function drawOverlay(c, vw, vh, E) { drawArrivalIndicators(c, vw, vh, E); }


  /* aides de test / captures */
  function forceHerd(feat, kind, E) {
    if (!feat || !feat.herds) { return false; }
    var h, i;
    for (i = 0; i < feat.herds.length; i++) { if (feat.herds[i].kind === kind) { h = feat.herds[i]; break; } }
    if (!h) { h = feat.herds[0]; }
    if (!h) { return false; }
    h.armed = true;
    if (E && E.P) {
      var gx;
      h.cx = E.P.x + 36;
      h.n = 1; h.spawned = 0;
      spawnOne(h, E);
      gx = E.P.x + 52;
      h.animals[0].x = gx;
      h.animals[0].y = gAt(E, gx);
      h.animals[0].vx = -Math.abs(h.animals[0].vx || h.spd || 42);
    } else { h.st = 'warn'; h.t = h.warn; }
    return true;
  }
  function forceWarn(feat, kind, E) {
    if (!feat || !feat.herds) { return false; }
    var h, i;
    for (i = 0; i < feat.herds.length; i++) { if (feat.herds[i].kind === kind) { h = feat.herds[i]; break; } }
    if (!h) { h = feat.herds[0]; }
    if (!h) { return false; }
    h.armed = true; h.animals = []; h.st = 'warn'; h.t = 0.45; h.preWarned = true;
    if (E && E.P) { h.cx = E.P.x + 90; }
    herdCry(h.kind);
    return true;
  }
  function forcePebble(feat, x, E) {
    if (!feat) { return false; }
    if (!feat.pebbles) { feat.pebbles = []; }
    var gx = x, gy = E ? gAt(E, gx) : 0, by = gy - 90;
    var r = (feat.raptors || [])[0];
    if (!r) {
      r = { kind: 'griffon', x0: gx - 80, x1: gx + 180, min: 6, max: 9, st: 'idle', t: 99, birds: [], drop: null, cried: false };
      feat.raptors = feat.raptors || []; feat.raptors.push(r);
    }
    r.lock = { x: gx, y: by };
    r.st = 'idle'; r.t = 99; r.drop = null;
    feat.pebbles.push({ x: gx, y: by + 5, vx: 0, vy: 28, r: 4.4, rot: 0, vr: 5, life: 4, hit: false, ground: false, fromBird: true });
    if (window.Sfx) { Sfx.play('cry'); } r.cried = true;
    return true;
  }


  function spacingReport(feat) {
    var out = { ok: true, herds: [], maxOnPath: 0, minGap: Infinity, batsMax: 0 };
    (feat && feat.herds || []).forEach(function (h) {
      var xs = (h.animals || []).map(function (a) { return a.x; }).sort(function (a, b) { return a - b; });
      var on = xs.length, gap = Infinity, i;
      for (i = 1; i < xs.length; i++) { gap = Math.min(gap, xs[i] - xs[i - 1]); }
      if (on > out.maxOnPath) { out.maxOnPath = on; }
      if (on > 1 && gap < out.minGap) { out.minGap = gap; }
      if (on > 1) { out.ok = false; }
      out.herds.push({ kind: h.kind, st: h.st, onPath: on, spawned: h.spawned || 0, n: h.n, minGap: on > 1 ? gap : null });
    });
    (feat && feat.bats || []).forEach(function (b) {
      var n = (b.list || []).length;
      if (n > out.batsMax) { out.batsMax = n; }
      /* chauves-souris : un départ à la fois, écart ~28 px ; on tolère plusieurs en vol si déjà bien espacées */
    });
    if (out.minGap === Infinity) { out.minGap = null; }
    return out;
  }

  function drawSheet(c, w, h) {
    w = w || 1280; h = h || 720;
    c.save();
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#efe4c8'); g.addColorStop(1, '#d8c49a');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#6a4a28'; c.lineWidth = 8; c.strokeRect(18, 18, w - 36, h - 36);
    c.strokeStyle = '#a07840'; c.lineWidth = 2; c.strokeRect(28, 28, w - 56, h - 56);
    c.fillStyle = '#3a2414'; c.font = 'bold 36px Georgia, serif'; c.textAlign = 'center';
    c.fillText('Faune du Pays basque', w / 2, 70);
    c.font = 'italic 18px Georgia, serif'; c.fillStyle = '#5a3a20';
    c.fillText('Planche naturaliste — Ascension 0.7.1', w / 2, 98);
    var items = [
      { name: 'Pottok', sub: 'Poney basque', kind: 'pottok', coat: 0 },
      { name: 'Sanglier', sub: 'Sus scrofa', kind: 'boar', coat: 0 },
      { name: 'Brebis manex', sub: 'Tête noire', kind: 'sheep', coat: 0 },
      { name: 'Betizu', sub: 'Vache semi-sauvage', kind: 'cow', coat: 0 },
      { name: 'Vautour fauve', sub: 'Gyps fulvus', kind: 'griffon' },
      { name: 'Buse variable', sub: 'Buteo buteo', kind: 'buzzard' },
      { name: 'Faucon', sub: 'Ailes en faucille', kind: 'falcon' },
      { name: 'Chauve-souris', sub: 'Colonies de grotte', kind: 'bat' }
    ];
    var cols = 4, rows = 2, i, it, cx, cy, cellW = (w - 80) / cols, cellH = (h - 160) / rows;
    for (i = 0; i < items.length; i++) {
      it = items[i];
      cx = 50 + (i % cols) * cellW + cellW / 2;
      cy = 150 + Math.floor(i / cols) * cellH + cellH * 0.45;
      c.save();
      c.fillStyle = 'rgba(255,250,240,.55)'; c.strokeStyle = '#c4a060'; c.lineWidth = 1;
      c.beginPath(); c.roundRect ? c.roundRect(cx - cellW * 0.42, cy - cellH * 0.42, cellW * 0.84, cellH * 0.78, 12) : c.rect(cx - cellW * 0.42, cy - cellH * 0.42, cellW * 0.84, cellH * 0.78);
      c.fill(); c.stroke();
      c.save();
      c.beginPath();
      var cardX = cx - cellW * 0.42, cardY = cy - cellH * 0.42, cardW = cellW * 0.84, cardH = cellH * 0.78;
      if (c.roundRect) { c.roundRect(cardX, cardY, cardW, cardH, 12); } else { c.rect(cardX, cardY, cardW, cardH); }
      c.clip();
      var sc = (it.kind === 'pottok') ? 5.4 : (it.kind === 'boar' || it.kind === 'sheep' || it.kind === 'cow') ? 5.6 : (it.kind === 'bat' ? 6.4 : 5.8);
      var dy = (it.kind === 'pottok' || it.kind === 'boar' || it.kind === 'sheep' || it.kind === 'cow') ? 18 : 8;
      c.translate(cx, cy + dy); c.scale(sc, sc);
      if (it.kind === 'pottok') { drawPottok(c, { x: 0, y: 0, ph: 0.4, face: 1, coat: it.coat, seed: 1 }, 0.3); }
      else if (it.kind === 'boar') { drawBoar(c, { x: 0, y: 0, ph: 0.6, face: 1, seed: 2 }, 0.3); }
      else if (it.kind === 'sheep') { drawSheep(c, { x: 0, y: 0, ph: 0.5, face: 1, coat: 0, seed: 3 }, 0.3); }
      else if (it.kind === 'cow') { drawCow(c, { x: 0, y: 0, ph: 0.4, face: 1, coat: it.coat || 0, seed: 4 }, 0.3); }
      else if (it.kind === 'griffon') { drawGriffon(c, 0.35, 0); }
      else if (it.kind === 'buzzard') { drawBuzzard(c, 0.4, 0); }
      else if (it.kind === 'falcon') { drawFalcon(c, 0.15, 0); }
      else { drawBat(c, { x: 0, y: 0.4, ph: 0.8 }, 0.12); }
      c.restore();
      c.restore();
      c.fillStyle = '#2a1810'; c.font = 'bold 18px Georgia, serif'; c.textAlign = 'center';
      c.fillText(it.name, cx, cy + cellH * 0.42);
      c.fillStyle = '#6a4a28'; c.font = 'italic 13px Georgia, serif';
      c.fillText(it.sub, cx, cy + cellH * 0.42 + 18);
    }
    c.restore();
  }

  window.Fauna = { parsePiece: parsePiece, punchKarst: punchKarst, reset: reset, update: update, drawBehind: drawBehind, drawMid: drawMid, drawFront: drawFront, drawWeather: drawWeather, drawOverlay: drawOverlay, forceHerd: forceHerd, forceWarn: forceWarn, forcePebble: forcePebble, birdPos: birdPos, drawSheet: drawSheet, spacingReport: spacingReport, drawPottok: drawPottok, drawBoar: drawBoar, drawSheep: drawSheep, drawGriffon: drawGriffon, drawBuzzard: drawBuzzard, drawFalcon: drawFalcon, drawBat: drawBat, drawCow: drawCow, drawChamois: drawChamois, drawIbex: drawIbex, drawTetra: drawTetra, drawLynx: drawLynx };
})();
