/* Entrées unifiées : clavier (QWERTY/AZERTY), tactile (boutons à l'écran), manette (Gamepad API, mapping « standard » XInput :
   Xbox, SCUF Envision Pro…) + vibrations (téléphone et manette). */
(function () {
  'use strict';
  var st = { left: false, right: false, jump: false, jumpPressed: false };
  var keys = {}, touch = { left: false, right: false, jump: false }, pad = { left: false, right: false, jump: false };
  var prevJump = false, listeners = [], mode = 'kbd', modeCbs = [], padInfo = { connected: false, id: '' };
  var K_LEFT = ['ArrowLeft', 'KeyA', 'KeyQ'], K_RIGHT = ['ArrowRight', 'KeyD'], K_JUMP = ['ArrowUp', 'Space', 'KeyW', 'KeyZ'];
  var DEAD = 0.2, NAV_T = 0.55;
  var cfg = { vibrate: true, padRumble: true, padLevel: 2 };

  function any(list) { for (var i = 0; i < list.length; i++) { if (keys[list[i]]) { return true; } } return false; }
  function emit(action) { listeners.forEach(function (f) { f(action); }); }
  function setMode(m) { if (m === mode) { return; } mode = m; modeCbs.forEach(function (f) { f(m); }); }

  window.addEventListener('keydown', function (e) {
    setMode('kbd');
    if (e.repeat) { if (K_JUMP.indexOf(e.code) >= 0 || K_LEFT.indexOf(e.code) >= 0 || K_RIGHT.indexOf(e.code) >= 0) { e.preventDefault(); } return; }
    keys[e.code] = true;
    var a = null;
    if (K_LEFT.indexOf(e.code) >= 0) { a = 'left'; }
    else if (K_RIGHT.indexOf(e.code) >= 0) { a = 'right'; }
    else if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') { a = (e.target && /^(BUTTON|A|INPUT)$/.test(e.target.tagName)) ? null : 'confirm'; }
    else if (e.code === 'Escape' || e.code === 'Backspace') { a = 'back'; }
    else if (e.code === 'KeyP') { a = 'pause'; } else if (e.code === 'KeyI') { a = 'y'; }
    else if (e.code === 'ArrowUp') { a = 'up'; } else if (e.code === 'ArrowDown') { a = 'down'; }
    if (a) { emit(a); }
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].indexOf(e.code) >= 0) {
      var t = e.target; if (!t || (t.tagName !== 'BUTTON' && t.tagName !== 'A' && t.tagName !== 'INPUT')) { e.preventDefault(); }
    }
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  window.addEventListener('blur', function () { keys = {}; touch.left = touch.right = touch.jump = false; });
  window.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') { setMode('touch'); } }, true);
  window.addEventListener('touchstart', function () { setMode('touch'); }, true);

  /* ---------- manette ---------- */
  var prevB = [], navDir = null, navT = 0, activePad = null, seenConn = false;
  function dz(v) { return Math.abs(v) < DEAD ? 0 : v; }
  function pressed(b, i) { return !!(b[i] && (b[i].pressed || b[i].value > 0.6)); }
  function pollPad(dt) {
    var pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    var p0 = null, i;
    for (i = 0; i < pads.length; i++) { if (pads[i] && pads[i].connected) { p0 = pads[i]; break; } }
    if (!p0) {
      if (padInfo.connected) { padInfo = { connected: false, id: '' }; activePad = null; emit('paddisconnected'); }
      pad.left = pad.right = pad.jump = false; prevB = []; navDir = null; return;
    }
    activePad = p0;
    if (!padInfo.connected) { padInfo = { connected: true, id: p0.id || '' }; if (seenConn) { emit('padconnected'); } }
    seenConn = true;
    var b = p0.buttons, lx = dz(p0.axes[0] || 0), ly = dz(p0.axes[1] || 0), rem = [];
    var bl = pressed(b, 14), br = pressed(b, 15), bu = pressed(b, 12), bd = pressed(b, 13);
    var L = lx < 0 || bl, R = lx > 0 || br;
    var jp = pressed(b, 0);
    for (i = 17; i < b.length; i++) { if (pressed(b, i)) { jp = true; } }          // palettes arrière (SCUF) / boutons supplémentaires
    pad.left = L && !R; pad.right = R && !L; pad.jump = jp;
    // activité -> les invites passent en mode manette
    var act = false; for (i = 0; i < b.length; i++) { if (pressed(b, i)) { act = true; } } if (Math.abs(lx) > 0.5 || Math.abs(ly) > 0.5) { act = true; }
    if (act) { setMode('pad'); }
    // fronts montants des boutons
    function edge(idx, name) { var now = pressed(b, idx); if (now && !prevB[idx]) { emit(name); } prevB[idx] = now; }
    edge(0, 'confirm'); edge(1, 'back'); edge(2, 'x'); edge(3, 'y'); edge(9, 'pause'); edge(8, 'map'); edge(4, 'lb'); edge(5, 'rb');
    // navigation dans les menus : croix ou stick, avec répétition
    var dir = null;
    if (bu || ly < -NAV_T) { dir = 'up'; } else if (bd || ly > NAV_T) { dir = 'down'; } else if (bl || lx < -NAV_T) { dir = 'left'; } else if (br || lx > NAV_T) { dir = 'right'; }
    if (dir !== navDir) { navDir = dir; navT = 0.42; if (dir) { emit(dir); } }
    else if (dir) { navT -= dt; if (navT <= 0) { navT = 0.13; emit(dir); } }
    // défilement fluide avec le stick droit (fiches)
    var ry = dz(p0.axes[3] || 0); if (ry) { emit('scroll:' + Math.round(ry * 14)); setMode('pad'); }
  }

  /* ---------- vibrations ---------- */
  var LV = [0.45, 0.75, 1];
  var PAT = {               // [durée ms, faible, forte] ; téléphone : motif en ms
    hit:  { pad: [[260, 0.5, 1.0], [140, 0.3, 0.6]], ph: [70, 40, 90] },
    warn: { pad: [[900, 0.25, 0.18]], ph: [40] },
    land: { pad: [[130, 0.35, 0.55]], ph: [25] },
    pick: { pad: [[90, 0.45, 0.0]], ph: [18] },
    fall: { pad: [[220, 0.5, 0.7]], ph: [60] },
    crack:   { pad: [[50, 0.55, 0.15], [60, 0, 0], [50, 0.6, 0.2], [60, 0, 0], [60, 0.7, 0.3]], ph: [18, 40, 18, 40, 22] },
    crumble: { pad: [[320, 0.6, 1.0], [80, 0.2, 0.4], [160, 0.35, 0.6]], ph: [90, 40, 50] },
    fw:   { pad: [[40, 0.25, 0.0]], ph: [12] },
    fwb:  { pad: [[70, 0.3, 0.2], [50, 0.15, 0.0]], ph: [24, 30, 10] },
    win:  { pad: [[120, 0.8, 0.0], [70, 0, 0], [120, 0.0, 0.7], [70, 0, 0], [220, 0.8, 0.8], [90, 0, 0], [420, 0.5, 0.4]], ph: [60, 50, 60, 50, 140] }
  };
  function padPlay(p, dur, wk, sg) {
    var a = p.vibrationActuator;
    try {
      if (a && a.playEffect) { return a.playEffect(a.type || 'dual-rumble', { startDelay: 0, duration: dur, weakMagnitude: wk, strongMagnitude: sg }); }
      var h = p.hapticActuators && p.hapticActuators[0];
      if (h && h.pulse) { return h.pulse(Math.max(wk, sg), dur); }
    } catch (e) { /* manette sans retour de force */ }
  }
  function capsHaptics() {
    try {
      var C = window.Capacitor, H = C && (C.Plugins && C.Plugins.Haptics);
      if (!H && C && C.registerPlugin) { /* plugin non chargé */ }
      return H || null;
    } catch (e) { return null; }
  }
  function phonePulse(msOrPat) {
    if (!cfg.vibrate) { return; }
    var H = capsHaptics();
    if (H) {
      try {
        var dur = Array.isArray(msOrPat) ? (msOrPat[0] || 30) : (msOrPat || 30);
        if (H.vibrate) { H.vibrate({ duration: dur }); return; }
        if (H.impact) { H.impact({ style: dur >= 70 ? 'HEAVY' : (dur >= 40 ? 'MEDIUM' : 'LIGHT') }); return; }
      } catch (e) { /* repli navigateur */ }
    }
    if (navigator.vibrate) { try { navigator.vibrate(msOrPat); } catch (e) { /* non supporté */ } }
  }
  function rumble(kind) {
    var d = PAT[kind]; if (!d) { return; }
    if (cfg.vibrate && mode === 'touch') { phonePulse(d.ph); }
    if (!cfg.padRumble || !padInfo.connected) { return; }
    var p = activePad; if (!p) { return; }
    var k = LV[Math.max(0, Math.min(2, cfg.padLevel - 1))], t = 0;
    d.pad.forEach(function (s) {
      var dur = s[0], wk = Math.min(1, s[1] * k), sg = Math.min(1, s[2] * k);
      if (wk > 0 || sg > 0) { setTimeout(function () { var pp = activePad || p; padPlay(pp, dur, wk, sg); }, t); }
      t += dur;
    });
  }

  function bindButton(el, name) {
    if (!el) { return; }
    function down(e) { e.preventDefault(); touch[name] = true; el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (x) {} }
    function up(e) { e.preventDefault(); touch[name] = false; el.classList.remove('on'); }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  window.Input = {
    phonePulse: phonePulse,
    state: st,
    on: function (f) {
      listeners.push(f);
      return function () {
        var i = listeners.indexOf(f);
        if (i >= 0) { listeners.splice(i, 1); }
      };
    },
    bindTouch: function () {
      bindButton(document.getElementById('btnLeft'), 'left');
      bindButton(document.getElementById('btnRight'), 'right');
      bindButton(document.getElementById('btnJump'), 'jump');
    },
    /* à appeler à chaque image */
    update: function (dt) {
      pollPad(dt || 0.016);
      st.left = any(K_LEFT) || touch.left || pad.left;
      st.right = any(K_RIGHT) || touch.right || pad.right;
      st.jump = any(K_JUMP) || touch.jump || pad.jump;
      if (st.jump && !prevJump) { st.jumpPressed = true; } prevJump = st.jump;
    },
    clear: function () {
      keys = {};
      touch.left = touch.right = touch.jump = false;
      pad.left = pad.right = pad.jump = false;
      prevJump = false;
      st.left = st.right = st.jump = st.jumpPressed = false;
      prevB = [];
    },
    mode: function () { return mode; },
    setMode: setMode,
    onMode: function (f) {
      modeCbs.push(f);
      return function () {
        var i = modeCbs.indexOf(f);
        if (i >= 0) { modeCbs.splice(i, 1); }
      };
    },
    pad: function () { return padInfo; },
    config: function (o) { for (var k in o) { cfg[k] = o[k]; } },
    rumble: rumble,
    emit: emit
  };
})();
