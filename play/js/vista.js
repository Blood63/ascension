/* Cinématique du sommet : fondu vers une toile peinte (cfg.scene via BasqueArt) ou, à défaut, la bannière de carte.
   Les niveaux 7-8 n'utilisent plus le recadrage de la carte (« mur »). Coordonnées dans LEVELS[n].ending.
   La bannière est affichée en pixels entiers (agrandissement entier, plus proche voisin) : aucun flou. */
(function () {
  'use strict';
  var A = window.Art, clamp = A.clamp, lerp = A.lerp, hash = A.hash;
  var S = null, T = 0, hold = false, active = false, finished = false, doneCb = null;
  var T_FADE0 = 1.6, T_FADE1 = 2.15, T_PULL = 2.0, T_PAN0 = 1.3, T_PAN1 = 4.2, T_HIKER = 2.85, T_FLAG = 3.15, T_TITLE = 3.55, T_END = 5.0;
  var EXT = 420;                                  // marge de ciel / forêt ajoutée au-dessus et au-dessous de la bannière (portrait)
  var banners = {};                               // nom -> { img, ext, ready, failed }

  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function easeIO(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }

  /* ---------- chargement + marges de la bannière ---------- */
  function imgSrc(n) { var m = window.__MAPIMG; return (m && m[n]) ? m[n] : 'assets/map/' + n + '.webp'; }
  function cfgOf(lv) { return (lv && lv.ending) || (window.AscensionData && window.AscensionData.LEVELS[0].ending); }
  function resolveCfg(raw, W, H) {
    if (!raw) { return raw; }
    if (!raw.port && !raw.land) { return raw; }
    var port = W < H, o = port ? (raw.port || raw.land) : (raw.land || raw.port), out = {}, k;
    for (k in raw) { if (k !== 'port' && k !== 'land') { out[k] = raw[k]; } }
    for (k in o) { out[k] = o[k]; }
    if (out.anchor && !out.at) { out.at = { port: out.anchor, land: out.anchor }; }
    if (out.startShift != null && !out.startDx) { out.startDx = { port: out.startShift, land: out.startShift }; }
    return out;
  }
  function extOf(B) { return (B && B.extPad != null) ? B.extPad : EXT; }
  /* Hauteur pieds → sommet du crâne de Art.drawHiker à scale 1 (debout). */
  var HIKER_BODY = 31;
  /* Échelle dérivée du décor peint (borne, cairn…) pour que la randonneuse
     garde la même taille relative à toutes les résolutions. */
  function hikerWorldScale(cfg) {
    var f = cfg && cfg.hikerFit, prop, want;
    if (f && f.y1 > f.y0) {
      prop = f.y1 - f.y0;
      want = prop * (f.ratio != null ? f.ratio : 1);
      if (want > 0) { return want / HIKER_BODY; }
    }
    return (cfg && cfg.hikerScale) || 1.15;
  }
  function pixCol(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

  function buildExtScene(B) {
    var img = B.img, w = img.width, h = img.height;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h + 2 * EXT; var c = cv.getContext('2d');
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    var top = document.createElement('canvas'); top.width = w; top.height = 8; var tc = top.getContext('2d');
    tc.drawImage(img, 0, 0, w, 8, 0, 0, w, 8);
    c.drawImage(top, 0, 0, w, 8, 0, 0, w, EXT);
    /* ciel du jour : on assombrit à peine vers le zénith, sans étoiles */
    var g = c.createLinearGradient(0, 0, 0, EXT);
    g.addColorStop(0, 'rgba(20,50,96,.45)'); g.addColorStop(1, 'rgba(20,50,96,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, EXT);
    c.drawImage(img, 0, EXT);
    var bot = document.createElement('canvas'); bot.width = w; bot.height = 8; var bc = bot.getContext('2d');
    bc.drawImage(img, 0, h - 8, w, 8, 0, 0, w, 8);
    c.drawImage(bot, 0, 0, w, 8, 0, EXT + h, w, EXT);
    var g2 = c.createLinearGradient(0, EXT + h, 0, EXT + h + EXT);
    g2.addColorStop(0, 'rgba(40,60,28,0)'); g2.addColorStop(0.35, 'rgba(36,52,24,.35)'); g2.addColorStop(1, 'rgba(18,28,14,.92)');
    c.fillStyle = g2; c.fillRect(0, EXT + h, w, EXT);
    B.ext = cv; B.w = w; B.h = h;
  }
  function buildExt(B) {
    if (B.scene) { buildExtScene(B); return; }
    var img = B.img, w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if (B.ref && (B.ref[0] !== w || B.ref[1] !== h)) {            // image haute définition : ramenée à l'espace de coordonnées `ref` (lissage haute qualité)
      var rc = document.createElement('canvas'), mid = img, cw0 = w, ch0 = h;
      while (cw0 / 2 > B.ref[0] * 1.2) { cw0 = Math.round(cw0 / 2); ch0 = Math.round(ch0 / 2); var st = document.createElement('canvas'); st.width = cw0; st.height = ch0; var sc = st.getContext('2d'); sc.imageSmoothingEnabled = true; sc.imageSmoothingQuality = 'high'; sc.drawImage(mid, 0, 0, cw0, ch0); mid = st; }
      rc.width = B.ref[0]; rc.height = B.ref[1]; var rcx = rc.getContext('2d'); rcx.imageSmoothingEnabled = true; rcx.imageSmoothingQuality = 'high'; rcx.drawImage(mid, 0, 0, rc.width, rc.height);
      img = rc; w = rc.width; h = rc.height;
    }
    if (B.noExt) {
      var nc = document.createElement('canvas'); nc.width = w; nc.height = h; var nctx = nc.getContext('2d');
      nctx.imageSmoothingEnabled = true; nctx.imageSmoothingQuality = 'high'; nctx.drawImage(img, 0, 0, w, h);
      B.ext = nc; B.w = w; B.h = h; B.extPad = 0; return;
    }
    B.extPad = EXT;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h + 2 * EXT; var c = cv.getContext('2d');
    c.imageSmoothingEnabled = true;
    // ciel : dernière ligne du haut étirée (floue horizontalement), assombrie par paliers
    var t = document.createElement('canvas'); t.width = 40; t.height = 1; var tc = t.getContext('2d'); tc.imageSmoothingEnabled = true;
    tc.drawImage(img, 0, 0, w, 1, 0, 0, 40, 1); c.drawImage(t, 0, 0, 40, 1, 0, 0, w, EXT);
    var bands = 30, i, bh = EXT / bands;
    for (i = 0; i < bands; i++) { var a = Math.pow(1 - i / (bands - 1), 1.1) * 0.78; c.fillStyle = 'rgba(8,10,32,' + a.toFixed(3) + ')'; c.fillRect(0, Math.round(i * bh), w, Math.ceil(bh) + 1); }
    for (i = 0; i < 150; i++) {       // étoiles (même style que la bannière : points 1–2 px, jaune pâle)
      var sx = Math.floor(hash(i, 3) * w), sy = Math.floor(hash(i, 7) * (EXT - 6)), big = hash(i, 11) > 0.82, al = 0.35 + hash(i, 13) * 0.55;
      c.fillStyle = 'rgba(255,244,200,' + al.toFixed(2) + ')'; c.fillRect(sx, sy, big ? 2 : 1, big ? 2 : 1);
      if (big && hash(i, 17) > 0.6) { c.fillRect(sx - 1, sy, 1, 1); c.fillRect(sx + 2, sy, 1, 1); c.fillRect(sx, sy - 1, 1, 1); c.fillRect(sx, sy + 2, 1, 1); }
    }
    c.drawImage(img, 0, EXT);
    // forêt : dernière ligne du bas étirée puis assombrie + silhouettes de sapins
    var t2 = document.createElement('canvas'); t2.width = 40; t2.height = 1; var t2c = t2.getContext('2d'); t2c.imageSmoothingEnabled = true;
    t2c.drawImage(img, 0, h - 3, w, 3, 0, 0, 40, 1); c.drawImage(t2, 0, 0, 40, 1, 0, EXT + h, w, EXT);
    for (i = 0; i < bands; i++) { var a2 = Math.min(0.97, 0.35 + Math.pow(i / (bands - 1), 0.7) * 0.7); c.fillStyle = 'rgba(4,16,13,' + a2.toFixed(3) + ')'; c.fillRect(0, EXT + h + Math.round(i * bh), w, Math.ceil(bh) + 1); }
    function pine(x, base, ph, hw, col) { var top = base - ph; for (var yy = top; yy < base; yy += 2) { var k = (yy - top) / ph, half = Math.max(1, Math.round(hw * (0.25 + 0.75 * k) / 2) * 2 / 2); c.fillStyle = col; c.fillRect(Math.round(x - half), yy, Math.round(half * 2), 2); } c.fillRect(Math.round(x - 1), base, 2, 4); }
    var xx;
    for (xx = -6, i = 0; xx < w + 6; xx += 7 + Math.floor(hash(i++, 21) * 8)) { pine(xx, EXT + h + 18 + Math.floor(hash(i, 23) * 14), 22 + Math.floor(hash(i, 25) * 26), 9 + hash(i, 27) * 5, '#0b2b21'); }
    for (xx = 0, i = 100; xx < w + 6; xx += 9 + Math.floor(hash(i++, 31) * 11)) { pine(xx, EXT + h + 44 + Math.floor(hash(i, 33) * 16), 26 + Math.floor(hash(i, 35) * 28), 11 + hash(i, 37) * 6, '#06180f'); }
    c.fillStyle = '#06180f'; c.fillRect(0, EXT + h + 60, w, EXT - 60);
    B.ext = cv; B.w = w; B.h = h;
  }
  function ensureScene(cfg) {
    var name = 'scene:' + cfg.scene, B = banners[name];
    if (B && (B.ready || B.failed)) { return B; }
    var w = (cfg.ref && cfg.ref[0]) || 1056, h = (cfg.ref && cfg.ref[1]) || 448;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    var painter = window.BasqueArt && window.BasqueArt[cfg.scene];
    if (painter) { painter(ctx, w, h); }
    else { ctx.fillStyle = '#6aa8d4'; ctx.fillRect(0, 0, w, h); }
    B = banners[name] = { ready: false, failed: false, cbs: [], ref: cfg.ref || [w, h], img: cv, scene: true };
    try { buildExt(B); B.ready = true; } catch (e) { B.failed = true; }
    return B;
  }
  function loadEnding(cfg, cb) {
    if (cfg && cfg.live) {
      var name = 'live:' + (cfg.scene || 'vista'), B = banners[name];
      if (!B) { B = banners[name] = { ready: true, failed: false, cbs: [], live: true, w: 1, h: 1, ext: null, scene: true }; }
      if (cb) { cb(B); }
      return B;
    }
    if (cfg && cfg.scene) {
      var B2 = ensureScene(cfg);
      if (cb) { cb(B2); }
      return B2;
    }
    return loadBanner(cfg && cfg.banner, cb, cfg && cfg.ref, { noExt: !!(cfg && (cfg.noExt || cfg.fullBleed)) });
  }
  function loadBanner(name, cb, ref, opts) {
    var B = banners[name];
    if (B) { if (B.ready || B.failed) { if (cb) { cb(B); } } else if (cb) { B.cbs.push(cb); } return B; }
    B = banners[name] = { ready: false, failed: false, cbs: cb ? [cb] : [], ref: ref || null, noExt: !!(opts && opts.noExt) };
    var img = new Image(); B.img = img;
    img.onload = function () { try { buildExt(B); B.ready = true; } catch (e) { B.failed = true; } B.cbs.splice(0).forEach(function (f) { f(B); }); };
    img.onerror = function () { B.failed = true; B.cbs.splice(0).forEach(function (f) { f(B); }); };
    img.src = imgSrc(name);
    return B;
  }

  /* ---------- sprites pixel (1 pixel = 2 px d'image) ---------- */
  function sprite(rows, pal) {
    var h = rows.length, w = rows[0].length, cv = document.createElement('canvas'); cv.width = w; cv.height = h; var c = cv.getContext('2d');
    for (var y = 0; y < h; y++) { for (var x = 0; x < w; x++) { var ch = rows[y].charAt(x); if (ch !== '.' && pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x, y, 1, 1); } } }
    return cv;
  }
  var SP = null;
  function sprites() {
    if (SP) { return SP; }
    var pal = { k: '#2b1410', p: '#6b3a22', P: '#9a5a38', g: '#ffd34d', G: '#ffb02e', o: '#7a3a10', w: '#fff3c4', r: '#d6402e', R: '#a82a24', s: '#f0c49a', h: '#3a2418', b: '#2a3a6a', d: '#1c1410', n: '#3b2a5a', m: '#5b3f84' };
    SP = {
      pole: sprite(['p', 'p', 'P', 'p', 'p', 'P', 'p', 'p', 'P', 'p', 'k'], pal),
      clothA: sprite(['ooooooo.', 'wggggGGo', 'gggGGGGo', 'ggGGGGo.', 'oGGGoo..', '.ooo....'], pal),
      clothB: sprite(['ooooooo.', 'wgggGGGo', 'gggGGGGo', 'ggGGGGGo', 'oGGGGoo.', '.oooo...'], pal),
      hiker: sprite(['.hh..', '.ss..', 'dRrrp', 'dRrrp', '.rr.p', '.bb.p', '.bb.p', '.d.d.'], pal),
      birdA: sprite(['n...n', '.n.n.', '..n..'], pal),
      birdB: sprite(['..n..', '.n.n.', 'n...n'], pal)
    };
    return SP;
  }

  /* ---------- mise en page (pixels d'écran) ---------- */
  function layout(cw, ch, B, cfg) {
    var port = cw < ch, w = B.w, h = B.h, k, ext = extOf(B), tight = !!(cfg.fullBleed || cfg.noExt);
    if (cfg.fullBleed) {
      k = Math.max(ch / Math.max(1, h), cw / Math.max(1, w));
    } else if (port) {
      /* Cadrer le sommet (pas tout le ciel EXT) : ~300 px de scène de haut, lisible en portrait. */
      var wantVh = cfg.portVh || 300;
      k = Math.max(1, ch / wantVh);
      if (cw / k > w * 0.98) { k = Math.max(1, cw / (w * 0.98)); }
    } else { k = Math.max(Math.ceil(ch / h), Math.ceil(cw / w)); }
    var vw = cw / k, vh = ch / k;
    var atPair = cfg.at || { port: cfg.anchor || [0.5, 0.62], land: cfg.anchor || [0.5, 0.55] };
    var at = port ? atPair.port : atPair.land;
    var sdPair = cfg.startDx || { port: cfg.startShift || 0, land: cfg.startShift || 0 };
    var sd = port ? sdPair.port : sdPair.land;
    var maxX = w - vw, minY = tight ? 0 : (port ? -ext : 0), maxY = tight ? Math.max(0, h - vh) : (port ? h + ext - vh : h - vh);
    var vx1 = clamp(cfg.focus.x - at[0] * vw, 0, Math.max(0, maxX)), vy1 = clamp(cfg.focus.y - at[1] * vh, minY, maxY);
    var vx0 = clamp(vx1 + sd, 0, Math.max(0, maxX)), vy0 = tight ? vy1 : (port ? vy1 : clamp(vy1 - 38, minY, maxY));
    return { k: k, cw: cw, ch: ch, vw: vw, vh: vh, vx0: vx0, vx1: vx1, vy0: vy0, vy1: vy1, port: port };
  }
  function camAt(Ly, t) {
    var u = clamp((t - T_PAN0) / (T_PAN1 - T_PAN0), 0, 1), e = 1 - Math.pow(1 - u, 2.6);      // départ doux, arrivée très douce
    e = ease(u) * 0.35 + e * 0.65;
    return { vx: lerp(Ly.vx0, Ly.vx1, e), vy: lerp(Ly.vy0, Ly.vy1, e) };
  }

  /* ---------- API ---------- */
  function zoomAt(t) { var e = easeIO(t / T_PULL); return S.z0 * Math.pow(S.z1 / S.z0, e); }
  function applyZoom() { if (window.Game && S) { var tt = Math.min(T, T_PULL); window.Game.setZoom(zoomAt(tt), lerp(S.look0 != null ? S.look0 : 0.58, S.look1, easeIO(tt / T_PULL))); } }
  function fmtAlt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  var Vista = {
    preload: function (lv) {
      var raw = cfgOf(lv);
      if (!raw) { return; }
      if (raw.port || raw.land) {
        if (raw.port) { loadEnding(resolveCfg(raw, 1, 2), null); }
        if (raw.land) { loadEnding(resolveCfg(raw, 2, 1), null); }
      } else { loadEnding(raw, null); }
    },
    start: function (W, H, onDone, lv) {
      var cfg = resolveCfg(cfgOf(lv), W, H), z0 = window.Game ? window.Game.getZoom() : 0.56;
      var look0 = 0.58;
      if (window.Game && Game.getLook) { look0 = Game.getLook(); }
      else if (lv && lv.play && lv.play.winLook != null) { look0 = lv.play.winLook; }
      S = { cfg: cfg, lv: lv || null, B: loadEnding(cfg, null), z0: z0, z1: W > H ? 0.30 : 0.24, look0: look0, look1: W > H ? 0.60 : 0.68, fired: {}, name: (lv && lv.name) || 'Puy de la Vache', alt: (lv && lv.altitude) || 1167 };
      T = 0; active = true; finished = false; doneCb = onDone || null; applyZoom();
      if (window.Sfx) { window.Sfx.play('swell'); S.fired.swell = 1; }
    },
    active: function () { return active; },
    opaque: function () { return active && T >= T_FADE1 && !!S && S.B.ready; },
    finished: function () { return finished; },
    skip: function () { if (active && !finished) { T = T_END; this._finish(); } },
    _finish: function () { if (finished) { return; } finished = true; if (doneCb) { var f = doneCb; doneCb = null; f(); } },
    stop: function () { active = false; finished = false; S = null; doneCb = null; if (window.Game && window.Game.setZoom) { window.Game.setZoom(null); } },
    update: function (dt) {
      if (!active || !S) { return; }
      if (hold || (!S.B.ready && !S.B.failed && T > T_FADE0)) { return; }           // on attend la bannière si elle n'est pas encore chargée
      var prev = T; T += dt; applyZoom();
      if (window.Sfx) {
        if (prev < T_FLAG && T >= T_FLAG && !S.fired.ping) { S.fired.ping = 1; window.Sfx.play('ping'); }
        if (prev < T_TITLE && T >= T_TITLE && !S.fired.chord) { S.fired.chord = 1; window.Sfx.play('chord'); }
      }
      if (T >= T_END && !finished) { this._finish(); }
    },
    /* test : positionne le temps de la cinématique */
    _hold: function (v) { hold = !!v; },
    _seek: function (t) { T = t; applyZoom(); },
    time: function () { return T; },
    _scene: function () { return S; },
    draw: function (ctx, W, H, dpr) {
      if (!active || !S) { return; }
      var cv = ctx.canvas, cw = cv.width, ch = cv.height, B = S.B, cfg = S.cfg;
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      // lueur chaude sur le décor du niveau pendant le recul
      var wa = ease(T / T_PULL) * (1 - ease((T - T_FADE0) / (T_FADE1 - T_FADE0)) * 0.6);
      if (wa > 0) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,128,60,' + (0.06 * wa).toFixed(3) + ')'; ctx.fillRect(0, 0, cw, ch); ctx.globalCompositeOperation = 'source-over'; }
      var a = ease((T - T_FADE0) / (T_FADE1 - T_FADE0));
      if (a > 0) {
        if (B.live) { drawLive(ctx, cw, ch, W, H, dpr, a); }
        else if (B.ready) { drawBanner(ctx, cw, ch, W, H, dpr, a); }
        else { ctx.globalAlpha = a; var g = ctx.createLinearGradient(0, 0, 0, ch); g.addColorStop(0, '#171a3f'); g.addColorStop(0.6, '#ee7a3a'); g.addColorStop(1, '#2c1a3a'); ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
      }
      // halo doux au milieu du fondu
      var bl = Math.sin(Math.PI * clamp((T - T_FADE0) / (T_FADE1 - T_FADE0), 0, 1)) * 0.12;
      if (bl > 0.003) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,214,164,' + bl.toFixed(3) + ')'; ctx.fillRect(0, 0, cw, ch); ctx.globalCompositeOperation = 'source-over'; }
      ctx.restore();
      if (a > 0.5 && B.ready) { drawTitle(ctx, W, H, dpr); }
      if (!finished && T > 0.7) { drawSkipHint(ctx, W, H, dpr); }
    }
  };

  function drawBanner(ctx, cw, ch, W, H, dpr, alpha) {
    var B = S.B, cfg = S.cfg, Ly = layout(cw, ch, B, cfg), k = Ly.k, cm = camAt(Ly, T), sp = sprites();
    var ext = extOf(B);
    var dx = Math.round(cm.vx * k), dy = Math.round((cm.vy + ext) * k), ix = Math.floor(dx / k), iy = Math.floor(dy / k), ox = dx - ix * k, oy = dy - iy * k;
    var sw = Math.min(Math.ceil(cw / k) + 1, B.ext.width - ix), sh = Math.min(Math.ceil(ch / k) + 1, B.ext.height - iy);
    S.view = { k: k, dx: dx, dy: dy, port: Ly.port };
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = !!cfg.scene;
    if (cfg.scene) { ctx.imageSmoothingQuality = 'high'; }
    /* toiles peintes v0.7.5 : léger lissage, sinon le webp se pixellise trop au scale non entier */
    if (cfg.fullBleed) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; }
    ctx.drawImage(B.ext, ix, iy, sw, sh, -ox, -oy, sw * k, sh * k);
    function X(x) { return Math.round(x * k - dx); } function Y(y) { return Math.round((y + ext) * k - dy); }
    function spr(cvs, x, y, u, flip) { var w = cvs.width * u * k, h = cvs.height * u * k; ctx.drawImage(cvs, 0, 0, cvs.width, cvs.height, X(x), Y(y) - h, w, h); }
    // chaleur du couchant (très légère) + vignette
    var fx = X(cfg.focus.x), fy = Y(cfg.focus.y), R = Math.max(cw, ch) * 0.9;
    var wg = ctx.createRadialGradient(fx, fy - ch * 0.1, 0, fx, fy - ch * 0.1, R); wg.addColorStop(0, 'rgba(255,150,70,0.13)'); wg.addColorStop(1, 'rgba(255,150,70,0)');
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = wg; ctx.fillRect(0, 0, cw, ch); ctx.globalCompositeOperation = 'source-over';
    if (cfg.fx) { drawEndingFx(ctx, cfg, B, T, alpha, k, X, Y, cw, ch); }
    // oiseaux pixel : seulement si cfg.birds est un intervalle [y0,y1] (les bannières monde2 ont déjà leurs rapaces peints)
    var i, tt = T;
    if (cfg.birds && cfg.birds.length) {
      var by = cfg.birds;
      for (i = 0; i < 5; i++) {
        var bx = (hash(i, 41) * B.w * 0.8 + 90) - tt * (7 + hash(i, 43) * 8), byy = by[0] + hash(i, 45) * (by[1] - by[0]) + Math.sin(tt * 1.3 + i * 2) * 2.5;
        var fr = (Math.floor(tt * 3.2 + i * 0.7) % 2) ? sp.birdA : sp.birdB;
        ctx.globalAlpha = alpha * 0.9; spr(fr, bx, byy + 3, 2);
      }
      ctx.globalAlpha = alpha;
    }
    // fanion au sommet
    var f = cfg.flag, tf = T - T_FLAG, th = T - T_HIKER;
    var hs = hikerWorldScale(cfg);
    if (th > 0) {
      var ha = ease(th / 0.35); ctx.globalAlpha = alpha * ha;
      if (window.Art && Art.drawHiker) {
        var who = 'girl';
        try { if (window.Save && Save.get) { var sv = Save.get(); if (sv && sv.character) { who = sv.character; } } } catch (eH) {}
        var hx0 = X(f.x), hy0 = Y(f.y);
        ctx.save();
        ctx.translate(hx0, hy0);
        /* ombre de contact douce, en pixels écran, proportionnelle à la randonneuse */
        var shR = 10.5 * hs * k, shA = 0.48 * ha;
        var shg = ctx.createRadialGradient(0, 0, 0, 0, 0, shR);
        shg.addColorStop(0, 'rgba(28,12,10,' + shA.toFixed(3) + ')');
        shg.addColorStop(0.45, 'rgba(28,12,10,' + (shA * 0.4).toFixed(3) + ')');
        shg.addColorStop(1, 'rgba(28,12,10,0)');
        ctx.save(); ctx.scale(1, 0.32); ctx.fillStyle = shg; ctx.beginPath(); ctx.arc(0, 0, shR, 0, 7); ctx.fill(); ctx.restore();
        /* sprite vectoriel à l'échelle du décor, déjà en pixels du backing store (DPR inclus dans k) */
        ctx.scale(k * hs, k * hs);
        Art.drawHiker(ctx, { x: 0, y: 0, face: 1, scale: 1, cele: 1, char: who, t: T, phase: T * 2, move: 0, air: 0, onGround: true, shadow: false });
        ctx.restore();
      } else { spr(sp.hiker, f.x - 13, f.y + 1, 2); }
      ctx.globalAlpha = alpha;
    }
    if (tf > 0) {
      var px0 = X(f.x), pyBase = Y(f.y), u = 2 * k;
      if (!cfg.hideFlag) {
        var poleH = sp.pole.height, shown = Math.min(poleH, Math.ceil(tf / 0.3 * poleH));
        ctx.drawImage(sp.pole, 0, poleH - shown, 1, shown, px0, pyBase - shown * u, u, shown * u);
        var cl = (Math.floor(T * 2.6) % 2) ? sp.clothA : sp.clothB, cwid = Math.min(cl.width, Math.ceil(clamp((tf - 0.25) / 0.35, 0, 1) * cl.width));
        if (cwid > 0 && shown >= poleH) { ctx.drawImage(cl, 0, 0, cwid, cl.height, px0 + u, pyBase - poleH * u, cwid * u, cl.height * u); }
      }
      /* halo doux autour de la randonneuse, calé sur sa taille */
      var gx = px0 + (cfg.hideFlag ? 0 : u * 3), gy = pyBase - (cfg.hideFlag ? (HIKER_BODY * 0.48 * hs * k) : (sp.pole.height * u - u * 2));
      var pulse = 0.85 + 0.15 * Math.sin(T * 3.2), gr = (HIKER_BODY * 0.72 * hs * k) * (0.55 + 0.45 * pulse) * (0.5 + 0.5 * ease(tf / 0.6));
      var gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      gg.addColorStop(0, 'rgba(255,230,150,' + ((cfg.hideFlag ? 0.28 : 0.55) * ease(tf / 0.5)).toFixed(3) + ')');
      gg.addColorStop(0.45, 'rgba(255,190,90,' + ((cfg.hideFlag ? 0.08 : 0.16) * ease(tf / 0.5)).toFixed(3) + ')');
      gg.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = gg; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      /* plus d'anneau pointillé : ça se lisait comme un calque de debug */
      if (!cfg.hideFlag) {
        for (i = 0; i < 22; i++) {
          var life = 2.4 + hash(i, 51) * 1.6, ph = ((tf * 0.8 + hash(i, 53) * life) % life) / life, sx = f.x + 3 + (hash(i, 55) - 0.5) * 34 + Math.sin(ph * 6 + i) * 3, sy = f.y - 24 - ph * (30 + hash(i, 57) * 26);
          var al = Math.sin(Math.PI * ph) * Math.min(1, tf / 0.5) * 0.85, s2 = (hash(i, 59) > 0.8 ? 2 : 1) * k;
          ctx.globalAlpha = alpha * al; ctx.fillStyle = hash(i, 61) > 0.5 ? '#ffe6a0' : '#fff6d8'; ctx.fillRect(X(sx), Y(sy), s2, s2);
        }
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = alpha;
    }
    if (cfg.scene) { drawSceneLive(ctx, B, cfg, k, dx, dy, alpha, T, X, Y); }
    // vignette
    var vg = ctx.createRadialGradient(cw / 2, ch * 0.5, Math.min(cw, ch) * 0.5, cw / 2, ch * 0.5, Math.max(cw, ch) * 0.8); vg.addColorStop(0, 'rgba(10,6,34,0)'); vg.addColorStop(1, 'rgba(10,6,34,0.4)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1;
  }

  function drawSceneLive(ctx, B, cfg, k, dx, dy, alpha, T, X, Y) {
    var w = B.w, h = B.h, i;
    ctx.save(); ctx.globalAlpha = alpha;
    /* nuages qui dérivent */
    ctx.fillStyle = 'rgba(255,252,246,.55)';
    for (i = 0; i < 4; i++) {
      var cx = ((i * 220 + T * (6 + i) * 8) % (w + 160)) - 80, cy = 40 + i * 22 + Math.sin(T * 0.4 + i) * 4;
      ctx.beginPath(); ctx.ellipse(X(cx), Y(cy), 28 * k, 8 * k, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(X(cx + 16), Y(cy - 4), 18 * k, 7 * k, 0, 0, 7); ctx.fill();
    }
    /* scintillement de la mer (Ouest) */
    if (cfg.scene === 'ursuya' || cfg.scene === 'atxuria') {
      var hor = (cfg.scene === 'ursuya' ? 0.40 : 0.38) * h;
      ctx.strokeStyle = 'rgba(255,255,245,' + (0.18 + 0.14 * Math.sin(T * 2.1)).toFixed(3) + ')';
      ctx.lineWidth = Math.max(1, 0.7 * k);
      var xmax = cfg.scene === 'ursuya' ? 520 : 280;
      for (i = 0; i < 3; i++) {
        var yy = hor + 8 + i * 10 + Math.sin(T * 1.4 + i) * 1.5;
        ctx.beginPath(); ctx.moveTo(X(0), Y(yy)); ctx.quadraticCurveTo(X(xmax * 0.45), Y(yy + 4), X(xmax * (0.7 + 0.08 * Math.sin(T + i))), Y(yy + 6)); ctx.stroke();
      }
    }
    /* vautours en vol plané */
    if (window.Fauna && Fauna.drawGriffon) {
      for (i = 0; i < 3; i++) {
        var bx = (w * 0.15 + i * 220 + T * (10 + i * 3)) % (w + 80) - 40;
        var by = 110 + i * 18 + Math.sin(T * 0.9 + i * 1.7) * 8;
        ctx.save(); ctx.translate(X(bx), Y(by)); ctx.scale(k * 0.85, k * 0.85);
        Fauna.drawGriffon(ctx, T, i);
        ctx.restore();
      }
    }
    /* pottoks qui broutent (Ursuya) */
    if (cfg.scene === 'ursuya' && window.Fauna && Fauna.drawPottok) {
      var ps = 1.9 * (h / 448);
      var spots = [[575, 0.70, 1, 0], [605, 0.695, -1, 2], [632, 0.70, 1, 1]];
      for (i = 0; i < spots.length; i++) {
        var s = spots[i], gx = s[0] * (w / 1056), gy = h * s[1];
        ctx.save(); ctx.translate(X(gx), Y(gy)); ctx.scale(ps * k, ps * k);
        Fauna.drawPottok(ctx, { x: 0, y: 0, ph: 0.6 + T * 0.8 + i, face: s[2], coat: s[3] }, T);
        ctx.restore();
      }
    }
    ctx.restore();
  }


  function drawLive(ctx, cw, ch, W, H, dpr, alpha) {
    var cfg = S.cfg, painter = window.BasqueVista && window.BasqueVista[cfg.scene];
    var settle = 1 - ease(clamp((T - T_FADE0) / 1.6, 0, 1));
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    var stand = painter ? painter(ctx, W, H, { t: T, settle: settle * 0.4 }) : null;
    var hx = stand ? stand.hx : W * 0.5, hy = stand ? stand.hy : H * 0.62;
    S.view = { live: true, hx: hx, hy: hy, port: W < H };
    var th = T - T_HIKER, tf = T - T_FLAG;
    if (th > 0 && window.Art && Art.drawHiker) {
      var who = 'girl', ha = ease(th / 0.35);
      try { if (window.Save && Save.get) { var sv = Save.get(); if (sv && sv.character) { who = sv.character; } } } catch (eH) {}
      ctx.save();
      ctx.globalAlpha = alpha * ha;
      ctx.translate(hx, hy);
      var hs = cfg.hikerScale || (W < H ? 2.15 : 1.85);
      ctx.scale(hs, hs);
      Art.drawHiker(ctx, { x: 0, y: 0, face: 1, scale: 1, cele: 1, char: who, t: T, phase: T * 2, move: 0, air: 0, onGround: true });
      ctx.restore();
    }
    if (tf > 0) {
      var pulse = 0.85 + 0.15 * Math.sin(T * 3.2), gr = (28 + 6 * pulse) * (0.5 + 0.5 * ease(tf / 0.6));
      var gg = ctx.createRadialGradient(hx, hy - 10, 0, hx, hy - 10, gr);
      gg.addColorStop(0, 'rgba(255,230,150,' + (0.28 * ease(tf / 0.5)).toFixed(3) + ')');
      gg.addColorStop(0.5, 'rgba(255,190,90,' + (0.08 * ease(tf / 0.5)).toFixed(3) + ')');
      gg.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = gg; ctx.fillRect(hx - gr, hy - gr - 10, gr * 2, gr * 2);
      ctx.globalCompositeOperation = 'source-over';
    }
    var vg = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.5, W / 2, H * 0.5, Math.max(W, H) * 0.85);
    vg.addColorStop(0, 'rgba(10,6,34,0)'); vg.addColorStop(1, 'rgba(10,6,34,0.32)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* Overlays discrets sur les toiles peintes : nuages, miroitement de la mer, 1-2 vautours fauves. */
  function drawVistaGriffon(c, t, i) {
    var flap = Math.sin((t || 0) * 0.9 + (i || 0)) * 0.08;
    c.save();
    c.rotate(-0.1 + Math.sin((t || 0) * 0.45 + i) * 0.05);
    function wing(side) {
      c.save(); c.scale(side, 1); c.rotate(0.14 + flap * side * 0.12);
      c.beginPath();
      c.moveTo(2, -3.2);
      c.quadraticCurveTo(14, -6.5, 26, -2.2);
      c.lineTo(28, 0.6);
      c.quadraticCurveTo(16, 4.2, 2, 2.4);
      c.closePath();
      c.fillStyle = '#4a2e1a'; c.fill();
      c.fillStyle = '#c4a070';
      c.beginPath(); c.moveTo(2, -2.4); c.quadraticCurveTo(12, -3.2, 18, -0.6); c.lineTo(16, 2.0); c.quadraticCurveTo(8, 2.2, 2, 1.4); c.closePath(); c.fill();
      var k;
      for (k = 0; k < 7; k++) {
        var ang = -0.55 + k * 0.18;
        c.save(); c.translate(26, -1.6 + k * 0.55); c.rotate(ang);
        c.fillStyle = k % 2 ? '#1e120c' : '#2e1a10';
        c.beginPath(); c.moveTo(0, -0.55); c.quadraticCurveTo(5.4, -0.1, 6.4, 0); c.quadraticCurveTo(5.4, 0.15, 0, 0.55); c.closePath(); c.fill();
        c.restore();
      }
      c.restore();
    }
    wing(-1); wing(1);
    c.beginPath(); c.ellipse(0.6, 0.2, 5.2, 3.2, 0.08, 0, 7);
    c.fillStyle = '#c9a66a'; c.fill();
    c.fillStyle = '#3a2414';
    c.beginPath(); c.moveTo(-4.2, 0.2); c.lineTo(-9.2, 0.8); c.lineTo(-9.4, 3.6); c.lineTo(-3.4, 2.8); c.closePath(); c.fill();
    c.fillStyle = '#f3eee4'; c.beginPath(); c.ellipse(5.4, -0.2, 2.4, 2.2, 0, 0, 7); c.fill();
    c.fillStyle = '#efe6d0'; c.beginPath(); c.ellipse(7.4, -0.5, 1.7, 1.3, 0.2, 0, 7); c.fill();
    c.fillStyle = '#d89a30';
    c.beginPath(); c.moveTo(8.8, -0.6); c.lineTo(11.0, -0.15); c.lineTo(8.8, 0.35); c.closePath(); c.fill();
    c.fillStyle = '#1a1008'; c.beginPath(); c.arc(7.6, -0.7, 0.32, 0, 7); c.fill();
    c.restore();
  }
  /* Milan royal / buse : silhouette planante à queue fourchue, typique de la Chaîne des Puys.
     Distinct du griffon basque (doigts primaires, queue droite). */
  function drawVistaKite(c, t, i) {
    var flap = Math.sin((t || 0) * 0.7 + (i || 0)) * 0.06;
    c.save();
    c.rotate(-0.08 + Math.sin((t || 0) * 0.4 + i) * 0.04);
    function wing(side) {
      c.save(); c.scale(side, 1); c.rotate(0.10 + flap * side * 0.10);
      c.beginPath();
      c.moveTo(1.5, -2.2);
      c.quadraticCurveTo(16, -5.4, 30, -1.0);
      c.lineTo(31, 0.4);
      c.quadraticCurveTo(16, 2.2, 1.5, 1.6);
      c.closePath();
      c.fillStyle = '#5a2e18'; c.fill();
      c.fillStyle = '#c45a28';
      c.beginPath(); c.moveTo(1.5, -1.4); c.quadraticCurveTo(12, -2.6, 18, -0.2); c.lineTo(16, 1.2); c.quadraticCurveTo(8, 1.3, 1.5, 0.9); c.closePath(); c.fill();
      c.restore();
    }
    wing(-1); wing(1);
    /* corps allongé */
    c.fillStyle = '#8a4a28';
    c.beginPath(); c.ellipse(0.2, 0.15, 4.6, 2.4, 0.12, 0, 7); c.fill();
    c.fillStyle = '#d8b08a';
    c.beginPath(); c.ellipse(4.6, -0.15, 2.0, 1.6, 0.15, 0, 7); c.fill();
    c.fillStyle = '#e8a030';
    c.beginPath(); c.moveTo(6.4, -0.4); c.lineTo(8.4, 0); c.lineTo(6.4, 0.3); c.closePath(); c.fill();
    /* queue fourchue du milan */
    c.fillStyle = '#3a1c10';
    c.beginPath(); c.moveTo(-3.6, 0.2); c.lineTo(-12.2, -2.4); c.lineTo(-10.4, 0.4); c.lineTo(-12.4, 3.0); c.lineTo(-3.6, 1.4); c.closePath(); c.fill();
    c.fillStyle = '#c45a28';
    c.beginPath(); c.moveTo(-3.8, 0.4); c.lineTo(-9.2, -1.2); c.lineTo(-8.4, 0.4); c.lineTo(-9.4, 2.0); c.lineTo(-3.8, 1.2); c.closePath(); c.fill();
    c.restore();
  }
  function drawEndingFx(ctx, cfg, B, t, alpha, k, X, Y, cw, ch) {

    var fx = cfg.fx || {}, i, r, y0, y1, n;
    ctx.save();
    /* nuages : voiles très légers qui dérivent, sans masquer le ciel peint */
    if (fx.clouds) {
      y0 = (cfg.cloudY && cfg.cloudY[0]) || 40; y1 = (cfg.cloudY && cfg.cloudY[1]) || Math.min(B.h * 0.28, 280);
      ctx.globalCompositeOperation = 'screen';
      for (i = 0; i < 5; i++) {
        var cw0 = 70 + hash(i, 71) * 90, ch0 = 16 + hash(i, 73) * 14;
        var cx = ((hash(i, 75) * (B.w + 200) + t * (3.5 + hash(i, 77) * 4)) % (B.w + 200)) - 100;
        var cy = y0 + hash(i, 79) * (y1 - y0) + Math.sin(t * 0.25 + i) * 4;
        ctx.globalAlpha = alpha * (0.10 + hash(i, 81) * 0.10);
        ctx.fillStyle = i % 2 ? 'rgba(255,220,200,1)' : 'rgba(255,200,180,1)';
        ctx.beginPath(); ctx.ellipse(X(cx), Y(cy), cw0 * k, ch0 * k, 0, 0, 7); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    /* miroitement de la mer, seulement dans les bandes d'océan relevées sur l'image */
    if (fx.shimmer && cfg.sea && cfg.sea.length) {
      ctx.globalCompositeOperation = 'screen';
      for (i = 0; i < cfg.sea.length; i++) {
        r = cfg.sea[i];
        var pulse = 0.5 + 0.5 * Math.sin(t * 1.1 + i * 1.7);
        var g = ctx.createLinearGradient(X(r.x), Y(r.y), X(r.x + r.w), Y(r.y));
        var off = (t * 0.08 + hash(i, 83) * 0.4) % 1;
        g.addColorStop(Math.max(0, off - 0.18), 'rgba(255,230,180,0)');
        g.addColorStop(off, 'rgba(255,240,200,' + (0.18 + 0.16 * pulse).toFixed(3) + ')');
        g.addColorStop(Math.min(1, off + 0.18), 'rgba(255,230,180,0)');
        ctx.globalAlpha = alpha;
        ctx.fillStyle = g;
        ctx.fillRect(X(r.x), Y(r.y), r.w * k, r.h * k);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    /* 1-2 vautours fauves en vol plané, dessinés assez grands pour ne pas ressembler à des planches */
    n = fx.vultures || 0;
    if (n > 0) {
      y0 = (cfg.vultureY && cfg.vultureY[0]) || B.h * 0.22; y1 = (cfg.vultureY && cfg.vultureY[1]) || B.h * 0.34;
      for (i = 0; i < n; i++) {
        var span = B.w + 160;
        var bx = ((hash(i, 91) * span + t * (11 + i * 5)) % span) - 80;
        var by = y0 + hash(i, 93) * (y1 - y0) + Math.sin(t * 0.55 + i * 1.3) * 8;
        var sc = (i === 0 ? 0.95 : 0.72) * (B.h > B.w ? 1.05 : 0.9);
        var dir = i === 1 ? -1 : 1;
        ctx.save();
        ctx.globalAlpha = alpha * 0.95;
        ctx.translate(X(bx), Y(by));
        ctx.scale(dir * sc * k, sc * k);
        if (fx.raptor === 'kite') { drawVistaKite(ctx, t, i); } else { drawVistaGriffon(ctx, t, i); }
        ctx.restore();
      }
    }
    ctx.globalAlpha = alpha;
    ctx.restore();
  }

  function drawTitle(ctx, W, H, dpr) {
    var a = ease((T - T_TITLE) / 0.9); if (a <= 0) { return; }
    var txt = S.name + ' \u2014 ' + fmtAlt(S.alt) + ' m', port = W < H;
    var fs = Math.floor(clamp(Math.min(W * 0.9 / (txt.length * 1.0), H / 22), 8, 24)), cy = Math.round(H * (port ? 0.07 : 0.10)) + (1 - a) * 8;
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var sg = ctx.createLinearGradient(0, 0, 0, H * 0.28); sg.addColorStop(0, 'rgba(6,8,30,' + (0.62 * a).toFixed(3) + ')'); sg.addColorStop(1, 'rgba(6,8,30,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.28);
    ctx.font = fs + 'px "Press Start 2P", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = a;
    /* contour sombre pour rester lisible sur rocher clair ou ciel orange */
    ctx.fillStyle = 'rgba(8,6,20,.92)';
    var ox, oy, o = Math.max(2, Math.round(fs * 0.16));
    for (oy = -o; oy <= o; oy++) { for (ox = -o; ox <= o; ox++) { if (ox || oy) { ctx.fillText(txt, W / 2 + ox, cy + oy); } } }
    ctx.shadowColor = 'rgba(255,190,90,.5)'; ctx.shadowBlur = fs * 0.7; ctx.fillStyle = '#ffe9a8'; ctx.fillText(txt, W / 2, cy); ctx.shadowBlur = 0;
    // filet orné : trait fin + losange central
    var tw = ctx.measureText(txt).width, ly = Math.round(cy + fs * 1.35), half = Math.round(tw / 2 * clamp((T - T_TITLE) / 0.9, 0, 1)), d = Math.max(3, Math.round(fs * 0.3));
    ctx.fillStyle = 'rgba(255,214,130,.85)'; ctx.fillRect(Math.round(W / 2 - half), ly, Math.max(0, half - d * 2), 2); ctx.fillRect(Math.round(W / 2 + d * 2), ly, Math.max(0, half - d * 2), 2);
    ctx.save(); ctx.translate(Math.round(W / 2), ly + 1); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#ffd34d'; ctx.fillRect(-d / 2, -d / 2, d, d); ctx.restore();
    /* sous-titre d'itinéraire (niveaux 4 et 6 : Muletiers / Chèvres), tel que validé sur les mockups */
    var sub = (S.cfg && S.cfg.subtitle) || '';
    if (sub) {
      var fs2 = Math.max(8, Math.round(fs * 0.55)), sy = ly + fs * 1.15, o2 = 2, sx, syy;
      ctx.font = fs2 + 'px "Press Start 2P", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(8,6,20,.92)';
      for (syy = -o2; syy <= o2; syy++) { for (sx = -o2; sx <= o2; sx++) { if (sx || syy) { ctx.fillText(sub, W / 2 + sx, sy + syy); } } }
      ctx.fillStyle = '#f3d7a0'; ctx.fillText(sub, W / 2, sy);
    }
    ctx.restore();
  }

  function drawSkipHint(ctx, W, H, dpr) {
    var m = window.Input && window.Input.mode ? window.Input.mode() : 'touch', txt = m === 'pad' ? 'A  Passer' : m === 'kbd' ? 'Entrée  Passer' : 'Touche pour passer';
    var fs = Math.round(clamp(Math.min(W, H) / 52, 7, 11));
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = fs + 'px "Press Start 2P", ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.7; ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(10,4,30,.9)'; ctx.shadowBlur = 5; ctx.fillText(txt, W / 2, H - 22 - fs); ctx.restore();
  }

  window.Vista = Vista;
})();
