/* Chef d'orchestre : canvas responsive (portrait mobile + paysage PC), écrans, boucle de jeu. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, UI = window.UI;
  function $(id) { return document.getElementById(id); }
  var VTXT = 'v' + D.VERSION;
  if ($('mapVer')) { $('mapVer').textContent = VTXT; } if ($('setVer')) { $('setVer').textContent = 'Ascension ' + VTXT; }
  var canvas = $('view'), ctx = canvas.getContext('2d', { alpha: false });
  var screen = 'loading', W = 390, H = 844, dpr = 1, rdpr = 1, trainMapOpts = null;
  var params = new URLSearchParams(location.search);
  var touchMode = params.has('touch') || (window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window);
  var curLevel = 0, firstWin = false, celebrate = false, vistaOn = false, pending = null, victoryAt = 0, levelPromptUntil = 0, lastPromptKey = '';
  var trailMode = false, runTrail = false, pendingTrailCelebrate = false, pendingCharsCelebrate = false, pendingBasqueCelebrate = false;
  function worldIndexOf(i) { var lv = LV[i]; return lv && lv.world ? lv.world - 1 : 0; }
  function persistWorld(i) { var s = window.Save.get(); s.world = (LV[i] && LV[i].world) || 1; window.Save.commit(); }
  function mapOptsFromLevel(extra) { var o = extra || {}; if (o.world == null && curLevel != null) { o.world = worldIndexOf(curLevel); } return o; }

  var Input = window.Input, Sfx = window.Sfx, Vista = window.Vista, Cine = window.Cine, CineW2 = window.CineW2;
  function cineNow() { return (CineW2 && CineW2.mode() !== 'off') ? CineW2 : Cine; }

  function cineDpr() { return Math.min(dpr, Cine ? Cine.dprCap() : 1.75); }   // résolution du voyage en train (plafond adaptatif, cf. Cine.dprCap)
  function resize() {
    var nW = window.innerWidth, nH = window.innerHeight, nd = Math.min(2.5, window.devicePixelRatio || 1);
    if (nW === W && nH === H && nd === dpr && canvas.width) { return; }   // Android WebView envoie des rafales de « resize » : réaffecter la taille du canevas l'efface (clignotement)
    W = nW; H = nH; dpr = nd;
    rdpr = lowDpr() ? cineDpr() : dpr;   // le voyage en train se dessine un peu moins fin (fluidité sur téléphone milieu de gamme)
    var cwn = Math.round(W * rdpr), chn = Math.round(H * rdpr);
    if (canvas.width !== cwn || canvas.height !== chn) { canvas.width = cwn; canvas.height = chn; if (window.Game && window.Game.invalidateGfx) { window.Game.invalidateGfx(); } }
    window.MapScreen.resize(W, H, dpr); var CN = cineNow(); if (CN && CN.mode() !== 'off') { CN.resize(W, H, rdpr); }
  }
  function lowDpr() { return screen === 'cine' || screen === 'soon'; }
  function fitCanvas() { var d = lowDpr() ? cineDpr() : dpr; if (Math.abs(d - rdpr) > 0.001 || canvas.width !== Math.round(W * d)) { rdpr = d; canvas.width = Math.round(W * rdpr); canvas.height = Math.round(H * rdpr); } }

  /* ----- navigation entre écrans ----- */
  function setUiMode(mode) {
    document.body.classList.toggle('ui-map', mode === 'map');
    document.body.classList.toggle('ui-level', mode === 'level');
  }
  function showMap(opts) {
    stopVista(); if (Cine.mode() !== 'off') { Cine.stop(); } if (CineW2 && CineW2.mode() !== 'off') { CineW2.stop(); } UI.hide('cineUI'); UI.hide('soonUI'); UI.hide('soonJuraUI'); if (UI.openModal === 'soonUI' || UI.openModal === 'soonJuraUI') { UI.openModal = null; }
    screen = 'map'; setUiMode('map'); cinePaused = false; visSoft = false; vistaPaused = false; fitCanvas(); Sfx.mode('map'); UI.hide('hud'); UI.show('mapUI'); UI.closeCard(); UI.hide('victory'); UI.hide('pauseMenu'); window.Game.stop();
    document.body.classList.remove('trail-run'); UI.setTrailHud(null);
    window.MapScreen.enter(opts); UI.refreshMap();
    if (!maybeCelebrateTrail()) { if (!maybeCelebrateChars()) { maybeCelebrateBasque(); } }
  }
  function startLevel(i, skipBrief, trail) {
    var lv = LV[i]; if (!lv.playable || i >= window.Save.get().unlocked) { return; }
    curLevel = i;
    persistWorld(i);
    if (trail === undefined) { trail = trailMode; }
    runTrail = !!trail && window.Save.trailUnlocked();
    // premier lancement : on choisit son personnage avant d'entrer dans le premier niveau
    if (!window.Save.get().character) { UI.closeCard(); UI.openCharSelect(function (ok) { if (ok) { startLevel(i, skipBrief, runTrail); } }); return; }
    if (!skipBrief && lv.info) { UI.closeCard(); UI.openBriefing(i); return; }
    stopVista(); Vista.preload(window.AscensionData.LEVELS[i]); window.Sfx.unlock(); if (Sfx.setWorld) { Sfx.setWorld((LV[i] && LV[i].world) || 1); } Sfx.mode('level'); levelPromptUntil = performance.now() + 9000; UI.closeCard(); UI.hide('mapUI'); UI.show('hud'); screen = 'level'; setUiMode('level'); fitCanvas(); window.MapScreen.leave(); window.Input.clear();
    $('touch').classList.toggle('hidden', !touchMode); UI.hint(null); $('toast').classList.add('hidden');
    document.body.classList.toggle('trail-run', runTrail); UI.setTrailHud(runTrail ? { on: true, time: 0, gap: null, hasGhost: window.Save.hasGhost(lv.number) } : null);
    window.Game.start(lv, { trail: runTrail });
  }
  function setTrailMode(on) {
    if (on && !window.Save.trailUnlocked()) { UI.gtoast(UI.trailHint()); UI.refreshTrailBtn(); return false; }
    trailMode = !!on; UI.refreshTrailBtn(); return trailMode;
  }
  function toggleTrailMode() {
    if (!window.Save.trailUnlocked()) { Sfx.play('ui'); UI.gtoast(UI.trailHint()); UI.refreshTrailBtn(); return false; }
    trailMode = !trailMode; Sfx.play('ui'); UI.refreshTrailBtn();
    if (trailMode) { UI.gtoast('Mode Trail activé — choisis un sommet'); } else { UI.gtoast('Mode normal'); }
    return trailMode;
  }
  function openTrailUnlock() {
    UI.show('trailUnlock'); UI.openModal = 'trailUnlock';
    var b = $('btnTrailUnlockOk'); if (b) { b.focus({ preventScroll: true }); }
  }
  function maybeCelebrateTrail() {
    if (pendingTrailCelebrate || (window.Save.trailUnlocked() && !window.Save.trailCelebrated())) {
      pendingTrailCelebrate = false;
      if (!window.Save.trailCelebrated()) { window.Save.markTrailCelebrated(); }
      var sel = window.MapScreen.selected();
      if (window.MapScreen.burst) { window.MapScreen.burst(sel); }
      setTimeout(openTrailUnlock, 400);
      return true;
    }
    return false;
  }
  function openCharsUnlock() {
    UI.show('charsUnlock'); UI.openModal = 'charsUnlock';
    var b = $('btnCharsUnlockOk'); if (b) { b.focus({ preventScroll: true }); }
  }
  function maybeCelebrateChars() {
    if (pendingCharsCelebrate || (window.Save.charsUnlocked && window.Save.charsUnlocked() && !window.Save.charsCelebrated())) {
      pendingCharsCelebrate = false;
      if (!window.Save.charsCelebrated()) { window.Save.markCharsCelebrated(); }
      var sel = window.MapScreen.selected();
      if (window.MapScreen.burst) { window.MapScreen.burst(sel); }
      setTimeout(openCharsUnlock, 400);
      return true;
    }
    return false;
  }
  function openBasqueUnlock() {
    UI.show('basqueUnlock'); UI.openModal = 'basqueUnlock';
    var b = $('btnBasqueUnlockOk'); if (b) { b.focus({ preventScroll: true }); }
  }
  function maybeCelebrateBasque() {
    if (pendingBasqueCelebrate || (window.Save.basqueCharsUnlocked && window.Save.basqueCharsUnlocked() && !window.Save.basqueCharsCelebrated())) {
      pendingBasqueCelebrate = false;
      if (!window.Save.basqueCharsCelebrated()) { window.Save.markBasqueCharsCelebrated(); }
      var sel = window.MapScreen.selected();
      if (window.MapScreen.burst) { window.MapScreen.burst(sel); }
      setTimeout(openBasqueUnlock, 400);
      return true;
    }
    return false;
  }
  function vistaLive() { return vistaOn && !Vista.finished(); }
  function stopVista() { if (vistaOn || Vista.active()) { Vista.stop(); } vistaOn = false; pending = null; document.body.classList.remove('vista-on'); }
  function openCard(i) { window.Sfx.play('ui'); UI.openCard(i); }

  /* ----- événements UI ----- */
  function bindUI() {
    $('cardActions').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) { return; }
      if (b.dataset.act === 'play') { startLevel(UI.cardIndex, false, trailMode); } else if (b.dataset.act === 'trail') { startLevel(UI.cardIndex, false, true); } else if (b.dataset.act === 'train') { UI.closeCard(); playTrain(!!window.Save.get().trainSeen, null); } else { UI.closeCard(); }
    });
    $('card').addEventListener('click', function (e) { if (e.target === $('card')) { UI.closeCard(); } });
    function leaveVictory() {
      UI.hide('victory');
      if (UI.openModal === 'victory') { UI.openModal = null; }
    }
    function victoryMapOpts() {
      var mo = { walkFrom: firstWin ? curLevel : null, fireworks: celebrate ? curLevel : null };
      firstWin = false; celebrate = false;
      return mo;
    }
    function maybeWorldCine(num, mo) {
      if (num === 6 && !window.Save.get().trainSeen) { playTrain(false, mo); return true; }
      if (num === 13 && !window.Save.get().paraSeen) { playPara(false, mo); return true; }
      return false;
    }
    $('btnBackMap').addEventListener('click', function () {
      if (performance.now() - victoryAt < 700) { return; }
      var mo = victoryMapOpts();
      var num = LV[curLevel] && LV[curLevel].number;
      if (maybeWorldCine(num, mo)) { return; }
      showMap(mapOptsFromLevel(mo));
    });
    if ($('btnReplay')) {
      $('btnReplay').addEventListener('click', function () {
        if (performance.now() - victoryAt < 700) { return; }
        firstWin = false; celebrate = false;
        leaveVictory();
        startLevel(curLevel, true, runTrail);
      });
    }
    if ($('btnNextSummit')) {
      $('btnNextSummit').addEventListener('click', function () {
        if (performance.now() - victoryAt < 700) { return; }
        var mo = victoryMapOpts();
        var num = LV[curLevel] && LV[curLevel].number;
        if (maybeWorldCine(num, mo)) { return; }
        var ni = curLevel + 1, s = window.Save.get();
        if (ni < LV.length && LV[ni].playable && LV[ni].number <= s.unlocked) {
          leaveVictory();
          startLevel(ni, true, runTrail);
          return;
        }
        showMap(mapOptsFromLevel(mo));
      });
    }
    $('btnPause').addEventListener('click', pause);
    $('btnSkipCine').addEventListener('click', function () { cineNow().skip(); });
    $('btnSoonBack').addEventListener('click', function () { Sfx.play('ui'); var o = trainMapOpts; trainMapOpts = null; showMap(o); });
    $('btnSoonReplay').addEventListener('click', function () { Sfx.play('ui'); playTrain(true, trainMapOpts); });
    $('btnMapTrain').addEventListener('click', function () { Sfx.play('ui'); playTrain(!!window.Save.get().trainSeen, null); });
    if ($('btnMapPara')) { $('btnMapPara').addEventListener('click', function () { Sfx.play('ui'); playPara(!!window.Save.get().paraSeen, null); }); }
    if ($('btnSoonJuraBack')) { $('btnSoonJuraBack').addEventListener('click', function () { Sfx.play('ui'); var o = paraMapOpts; paraMapOpts = null; showMap(o || { world: 1, fade: true }); }); }
    if ($('btnSoonJuraReplay')) { $('btnSoonJuraReplay').addEventListener('click', function () { Sfx.play('ui'); playPara(true, paraMapOpts); }); }
    $('btnMapTrail').addEventListener('click', function () { toggleTrailMode(); });
    $('btnTrailUnlockOk').addEventListener('click', function () { Sfx.play('ui'); UI.hide('trailUnlock'); if (UI.openModal === 'trailUnlock') { UI.openModal = null; } maybeCelebrateChars(); });
    $('btnCharsUnlockOk').addEventListener('click', function () { Sfx.play('ui'); UI.hide('charsUnlock'); if (UI.openModal === 'charsUnlock') { UI.openModal = null; } maybeCelebrateBasque(); });
    $('btnBasqueUnlockOk').addEventListener('click', function () { Sfx.play('ui'); UI.hide('basqueUnlock'); if (UI.openModal === 'basqueUnlock') { UI.openModal = null; } });
    $('btnResume').addEventListener('click', resume);
    $('btnRestart').addEventListener('click', function () { UI.hide('pauseMenu'); UI.openModal = null; startLevel(curLevel, true, runTrail); });
    $('btnInv').addEventListener('click', function () { Sfx.play('ui'); UI.openInventory('map'); });
    $('btnInv2').addEventListener('click', function () { Sfx.play('ui'); UI.openInventory('pause'); });
    $('btnInvClose').addEventListener('click', function () { UI.closeInventory(); });
    $('btnGo').addEventListener('click', function () { var i = UI.briefIndex; UI.closeBriefing(); startLevel(i, true, runTrail); });
    $('btnBriefBack').addEventListener('click', function () { var i = UI.briefIndex; UI.closeBriefing(); UI.openCard(i); });
    $('btnQuit').addEventListener('click', function () { UI.hide('pauseMenu'); UI.openModal = null; showMap(mapOptsFromLevel({})); });
    [['cardBoy', 'boy'], ['cardGirl', 'girl'], ['cardGirl2', 'girl2'], ['cardBoy2', 'boy2'], ['cardBoy3', 'boy3'], ['cardGirl3', 'girl3']].forEach(function (d) { $(d[0]).addEventListener('click', function () { UI.pickChar(d[1]); }); });
    $('btnCharOk').addEventListener('click', function () { UI.closeCharSelect(true); });
    $('btnChar').addEventListener('click', function () { window.Sfx.play('ui'); UI.openCharSelect(null); });
    $('btnCharSettings').addEventListener('click', function () { UI.hide('settings'); UI.openModal = null; UI.openCharSelect(function () { refreshSettings(); UI.show('settings'); UI.openModal = 'settings'; $('btnCharSettings').focus({ preventScroll: true }); }); });
    initXfer();
    window.addEventListener('keydown', function (e) {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) { return; }
      if (e.code === 'KeyT' && screen === 'map' && !UI.openModal) { e.preventDefault(); toggleTrailMode(); }
    });
    $('btnSettings').addEventListener('click', openSettings);
    $('btnCloseSettings').addEventListener('click', closeSettings);
    $('btnSound').addEventListener('click', function () { var s = window.Save.get(); s.sound = !s.sound; window.Sfx.setOn(s.sound); window.Save.commit(); refreshSettings(); Sfx.play('ui'); });
    $('btnMusic').addEventListener('click', function () { var s = window.Save.get(); s.music = !s.music; Sfx.setMusic(s.music); window.Save.commit(); refreshSettings(); Sfx.play('ui'); });
    function vol(d) { var s = window.Save.get(); s.musicVol = Math.max(0, Math.min(1, Math.round(((s.musicVol == null ? 0.6 : s.musicVol) + d) * 10) / 10)); Sfx.setMusicVol(s.musicVol); window.Save.commit(); refreshSettings(); Sfx.play('ui'); }
    function sfxV(d) { var s = window.Save.get(); s.sfxVol = Math.max(0, Math.min(1, Math.round(((s.sfxVol == null ? 1 : s.sfxVol) + d) * 10) / 10)); Sfx.setSfxVol(s.sfxVol); window.Save.commit(); refreshSettings(); Sfx.play('ui'); }
    $('btnVolDn').addEventListener('click', function () { vol(-0.1); }); $('btnVolUp').addEventListener('click', function () { vol(0.1); });
    $('btnSfxDn').addEventListener('click', function () { sfxV(-0.1); }); $('btnSfxUp').addEventListener('click', function () { sfxV(0.1); });
    $('btnVib').addEventListener('click', function () { var s = window.Save.get(); s.vibrate = !s.vibrate; applyCfg(); window.Save.commit(); refreshSettings(); if (s.vibrate && window.Input && Input.phonePulse) { Input.phonePulse(60); } });
    $('btnPadRumble').addEventListener('click', function () { var s = window.Save.get(); s.padRumble = !s.padRumble; applyCfg(); window.Save.commit(); refreshSettings(); if (s.padRumble) { Input.rumble('land'); } });
    $('btnPadLevel').addEventListener('click', function () { var s = window.Save.get(); s.padLevel = (s.padLevel || 2) % 3 + 1; applyCfg(); window.Save.commit(); refreshSettings(); Input.rumble('hit'); });
    if ($('btnLowFx')) {
      $('btnLowFx').addEventListener('click', function () {
        var s = window.Save.get();
        s.lowFx = !s.lowFx;
        applyLowFx(s);
        window.Save.commit();
        refreshSettings();
        Sfx.play('ui');
      });
    }
    $('btnHints').addEventListener('click', function () { window.Save.get().hintsSeen = {}; window.Save.commit(); $('settingsMsg').textContent = 'Les conseils réapparaîtront au prochain niveau.'; });
    $('btnReset').addEventListener('click', function () {
      if ($('btnReset').dataset.sure === '1') { window.Save.reset(); $('btnReset').dataset.sure = ''; $('settingsMsg').textContent = 'Progression effacée.'; applyAudio(window.Save.get()); applyCfg(); window.MapScreen.enter(); UI.refreshMap(); refreshSettings(); }
      else { $('btnReset').dataset.sure = '1'; $('btnReset').textContent = 'Confirmer ?'; $('settingsMsg').textContent = 'Touche encore pour effacer toute la progression.'; }
    });
    $('worldPrev').addEventListener('click', function () { window.MapScreen.switchWorld(-1); });
    $('worldNext').addEventListener('click', function () { window.MapScreen.switchWorld(1); });
    $('mapPrev').addEventListener('click', function () { window.MapScreen.nav(-1); });
    $('mapNext').addEventListener('click', function () { window.MapScreen.nav(1); });
    $('mapOpen').addEventListener('click', function () { window.MapScreen.openSelected(); });
    window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function applyLowFx(s) {
    s = s || window.Save.get();
    if (document.body) {
      if (s.lowFx) { document.body.classList.add('low-fx'); }
      else { document.body.classList.remove('low-fx'); }
    }
  }
  function applyCfg() {
    var s = window.Save.get();
    Input.config({ vibrate: s.vibrate !== false, padRumble: s.padRumble !== false, padLevel: s.padLevel || 2 });
    applyLowFx(s);
  }
  function applyAudio(s) {
    s = s || window.Save.get();
    window.Sfx.setOn(s.sound !== false); Sfx.setMusic(s.music !== false);
    Sfx.setMusicVol(s.musicVol == null ? 0.6 : s.musicVol);
    if (Sfx.setSfxVol) { Sfx.setSfxVol(s.sfxVol == null ? 1 : s.sfxVol); }
    if (Sfx.setWorld) { Sfx.setWorld(s.world || 1); }
  }
  function refreshSettings() {
    var s = window.Save.get(), on = function (v, a, b) { return v ? a : b; };
    $('btnSound').textContent = on(s.sound !== false, 'Activés', 'Coupés'); $('btnMusic').textContent = on(s.music !== false, 'Activée', 'Coupée');
    $('volLbl').textContent = Math.round((s.musicVol == null ? 0.6 : s.musicVol) * 100) + ' %';
    if ($('sfxLbl')) { $('sfxLbl').textContent = Math.round((s.sfxVol == null ? 1 : s.sfxVol) * 100) + ' %'; }
    $('btnVib').textContent = on(s.vibrate !== false, 'Activées', 'Coupées'); $('btnPadRumble').textContent = on(s.padRumble !== false, 'Activées', 'Coupées');
    $('btnPadLevel').textContent = ['Faible', 'Moyenne', 'Forte'][(s.padLevel || 2) - 1];
    if ($('btnLowFx')) { $('btnLowFx').textContent = on(!!s.lowFx, 'Activé', 'Désactivé'); }
    $('btnReset').textContent = 'Effacer'; $('btnReset').dataset.sure = '';
  }
  /* ----- sauvegarde : export / import ----- */
  function initXfer() {
    var parsed = null, sure = false;
    function msg(t, bad) { var m = $('xferMsg'); m.textContent = t || ''; m.className = 'xfer-msg' + (bad ? ' bad' : ''); }
    function sumHtml(sm) { return '<b>' + sm.levels + '</b> niveau' + (sm.levels > 1 ? 'x' : '') + ' terminé' + (sm.levels > 1 ? 's' : '') + ' · <b>' + sm.stars + '</b> étoile' + (sm.stars > 1 ? 's' : '') + ' · <b>' + sm.finds + '</b> objet' + (sm.finds > 1 ? 's' : '') + ' du carnet · niveau ' + Math.min(6, sm.unlocked) + ' débloqué'; }
    function stamp() { var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()); }
    function fill() { var sm = window.Save.summary(window.Save.get()); $('xferSum').innerHTML = sumHtml(sm); $('xferCode').value = window.Save.exportCode(); }
    function reset() { parsed = null; sure = false; $('xferPaste').value = ''; $('xferPrev').textContent = ''; $('xferPrev').className = 'xfer-prev'; $('btnXferApply').disabled = true; $('btnXferApply').textContent = 'Importer'; msg(''); }
    function check(text) {
      sure = false; $('btnXferApply').textContent = 'Importer'; parsed = null; $('btnXferApply').disabled = true; var pv = $('xferPrev'); pv.className = 'xfer-prev';
      if (!String(text || '').trim()) { pv.textContent = ''; return; }
      try {
        parsed = window.Save.parse(text); var sm = window.Save.summary(parsed.data);
        pv.innerHTML = 'Sauvegarde reconnue (v' + parsed.version + ') : ' + sumHtml(sm) + '.<br>Elle <b>remplacera</b> ta progression actuelle.'; $('btnXferApply').disabled = false;
      } catch (e) { pv.className = 'xfer-prev bad'; pv.textContent = e.message === 'crc' ? 'Code de sauvegarde invalide ou corrompu (somme de contrôle incorrecte)' : 'Ce texte n’est pas une sauvegarde Ascension valide.'; }
    }
    function open() { Sfx.play('ui'); fill(); reset(); UI.hide('settings'); UI.show('xfer'); UI.openModal = 'xfer'; $('btnXferFile').focus({ preventScroll: true }); }
    function close() { UI.hide('xfer'); refreshSettings(); UI.show('settings'); UI.openModal = 'settings'; var f = $('btnXfer'); if (f) { f.focus({ preventScroll: true }); } }
    window.UI.closeXfer = close;
    $('btnXfer').addEventListener('click', open); $('btnXferClose').addEventListener('click', function () { Sfx.play('ui'); close(); });
    $('btnXferFile').addEventListener('click', function () {
      var txt = window.Save.exportFile(), name = 'ascension-sauvegarde-' + stamp() + '.json';
      window.Files.save({ filename: name, mime: 'application/json', text: txt, title: 'Sauvegarde Ascension' }).then(function (how) { Sfx.play('pick'); msg(how === 'native' ? 'Choisis où enregistrer ta sauvegarde.' : 'Fichier « ' + name + ' » téléchargé.'); }, function () { msg('Impossible de créer le fichier : utilise plutôt le code.', true); });
    });
    $('btnXferCopy').addEventListener('click', function () {
      window.Files.copy($('xferCode').value, $('xferCode')).then(function () { Sfx.play('pick'); msg('Code copié ! Colle-le dans « Importer » sur l’autre appareil.'); }, function () { $('xferCode').focus(); $('xferCode').select(); msg('Copie automatique impossible : sélectionne le code ci-dessus et copie-le.', true); });
    });
    $('xferCode').addEventListener('focus', function () { this.select(); });
    $('btnXferPick').addEventListener('click', function () { $('xferFile').click(); });
    $('xferFile').addEventListener('change', function () {
      var f = this.files && this.files[0]; if (!f) { return; }
      if (f.size > 4e6) { check(''); msg('Fichier trop gros pour une sauvegarde Ascension.', true); return; }
      var r = new FileReader(); r.onload = function () { $('xferPaste').value = String(r.result).slice(0, 1200000); check(r.result); msg(''); }; r.onerror = function () { msg('Lecture du fichier impossible.', true); }; r.readAsText(f); this.value = '';
    });
    $('xferPaste').addEventListener('input', function () { check(this.value); msg(''); });
    $('btnXferApply').addEventListener('click', function () {
      if (!parsed) { return; }
      if (!sure) { sure = true; this.textContent = 'Confirmer ?'; msg('Touche encore pour remplacer ta progression.'); return; }
      window.Save.applyImport(parsed); var s = window.Save.get(); applyAudio(s); applyCfg();
      window.MapScreen.enter(); UI.refreshMap(); fill(); parsed = null; sure = false; this.disabled = true; this.textContent = 'Importer'; $('xferPaste').value = ''; $('xferPrev').textContent = ''; Sfx.play('win'); msg('Sauvegarde importée !');
    });
  }
  function openSettings() { Sfx.play('ui'); refreshSettings(); UI.show('settings'); UI.openModal = 'settings'; var f = $('btnCharSettings'); if (f) { f.focus({ preventScroll: true }); } }
  function closeSettings() { UI.hide('settings'); UI.openModal = null; }

  var cinePaused = false, visSoft = false, vistaPaused = false;
  function showPauseExtras(on) {
    if ($('btnRestart')) { $('btnRestart').classList.toggle('hidden', !on); }
    if ($('btnInv2')) { $('btnInv2').classList.toggle('hidden', !on); }
  }
  function pause() {
    if (vistaOn) { return false; }
    if (UI.openModal === 'pause') { return true; }
    if (screen === 'cine') {
      if (cineNow().mode() === 'off') { return false; }
      cinePaused = true; Sfx.mode('pause'); showPauseExtras(false);
      UI.show('pauseMenu'); UI.openModal = 'pause'; $('btnResume').focus({ preventScroll: true }); return true;
    }
    if (screen !== 'level') { return false; }
    var st = window.Game.state();
    if (st !== 'play' && st !== 'dying' && st !== 'won' && st !== 'paused') { return false; }
    window.Game.pause(); Sfx.mode('pause'); showPauseExtras(true);
    UI.show('pauseMenu'); UI.openModal = 'pause'; $('btnResume').focus({ preventScroll: true }); return true;
  }
  function resume() {
    UI.hide('pauseMenu'); UI.openModal = null; showPauseExtras(true);
    if (screen === 'cine') { cinePaused = false; Sfx.mode('map'); return; }
    Sfx.mode('level'); window.Game.resume();
  }

  /* ----- navigation menus : clavier / manette (focus géométrique) ----- */
  function modalEl() { var m = UI.openModal; return m ? $(m === 'pause' ? 'pauseMenu' : m) : null; }
  function focusables(root) {
    return [].filter.call(root.querySelectorAll('button, input'), function (e) { return !e.disabled && e.getClientRects().length > 0 && !e.closest('.hidden'); });
  }
  function scrollSheet(root, dy) { var sc = root.querySelector('.sheet-scroll'); if (sc) { sc.scrollTop += dy; } }
  function moveFocus(dir) {
    var root = modalEl(); if (!root) { return; }
    var list = focusables(root), cur = document.activeElement;
    if (!cur || list.indexOf(cur) < 0) { if (list[0]) { list[0].focus({ preventScroll: true }); } return; }
    var r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, best = null, bs = 1e9;
    list.forEach(function (e) {
      if (e === cur) { return; }
      var q = e.getBoundingClientRect(), dx = q.left + q.width / 2 - cx, dy = q.top + q.height / 2 - cy, pri, sec;
      if (dir === 'left') { pri = -dx; sec = Math.abs(dy); } else if (dir === 'right') { pri = dx; sec = Math.abs(dy); } else if (dir === 'up') { pri = -dy; sec = Math.abs(dx); } else { pri = dy; sec = Math.abs(dx); }
      if (pri < 3) { return; }
      var sc = pri + sec * 2.5; if (sc < bs) { bs = sc; best = e; }
    });
    if (best) { best.focus({ preventScroll: true }); try { best.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ancien navigateur */ } Sfx.play('ui'); }
    else if (dir === 'up' || dir === 'down') { scrollSheet(root, dir === 'up' ? -90 : 90); }
  }
  function confirmFocus() {
    var root = modalEl(); if (!root) { return; }
    var cur = document.activeElement; if (cur && root.contains(cur) && cur.tagName === 'BUTTON') { cur.click(); return; }
    var b = focusables(root)[0]; if (b) { b.click(); }
  }
  function goBack() {
    var m = UI.openModal;
    if (m === 'charSelect') { UI.closeCharSelect(false); } else if (m === 'card') { UI.closeCard(); } else if (m === 'settings') { closeSettings(); } else if (m === 'xfer') { UI.closeXfer(); } else if (m === 'inventory') { UI.closeInventory(); } else if (m === 'briefing') { $('btnBriefBack').click(); } else if (m === 'pause') { resume(); } else if (m === 'victory') { $('btnBackMap').click(); } else if (m === 'soonUI') { $('btnSoonBack').click(); } else if (m === 'soonJuraUI') { $('btnSoonJuraBack').click(); } else if (m === 'trailUnlock') { $('btnTrailUnlockOk').click(); } else if (m === 'charsUnlock') { $('btnCharsUnlockOk').click(); } else if (m === 'basqueUnlock') { $('btnBasqueUnlockOk').click(); }
  }

  /* ----- manette branchée / débranchée ----- */
  function padLost() { UI.gtoast('Manette déconnectée'); if (screen === 'level' && !vistaOn) { pause(); } }

  Input.on(function (a) {
    if (screen === 'loading') { return; }
    if (a === 'paddisconnected') { padLost(); return; }
    if (a === 'padconnected') { UI.gtoast('Manette connectée'); return; }
    if (a.indexOf('scroll:') === 0) { var rt = modalEl(); if (rt) { scrollSheet(rt, +a.slice(7)); } return; }
    if (screen === 'cine') {
      if (a === 'pause') { pause(); return; }
      if ((a === 'confirm' || a === 'back' || a === 'x' || a === 'y' || a === 'map') && cineNow().canSkip()) { cineNow().skip(); }
      return;
    }
    if (vistaLive()) { if (a === 'confirm' || a === 'back' || a === 'pause' || a === 'up' || a === 'down' || a === 'x') { Vista.skip(); } return; }
    if (UI.openModal) {
      if (a === 'back') { goBack(); }
      else if (a === 'pause' && UI.openModal === 'pause') { resume(); }
      else if (a === 'confirm') { confirmFocus(); }
      else if (a === 'left' || a === 'right' || a === 'up' || a === 'down') { moveFocus(a); }
      return;
    }
    if (screen === 'map') {
      if (a === 'lb') { window.MapScreen.nav(-1); } else if (a === 'rb') { window.MapScreen.nav(1); } else if (a === 'left' || a === 'right' || a === 'up' || a === 'down') { window.MapScreen.navDir(a); } else if (a === 'confirm') { window.MapScreen.openSelected(); }
      else if (a === 'x') { Sfx.play('ui'); UI.openCharSelect(null); } else if (a === 'y') { Sfx.play('ui'); UI.openInventory('map'); } else if (a === 'pause') { openSettings(); }
    } else if (screen === 'level') {
      if (a === 'pause' || a === 'back' || a === 'map') { pause(); }
    }
  });
  canvas.addEventListener('pointerdown', function () { if (vistaLive()) { Vista.skip(); } });

  /* ----- invites de touches (manette Xbox / clavier) ----- */
  function g(cls, t) { return '<i class="gl ' + cls + '">' + t + '</i>'; }
  function pr(glyph, label) { return '<span class="pr">' + glyph + label + '</span>'; }
  function promptCtx() {
    if (vistaLive()) { return 'none'; }
    if (screen === 'cine') { return cineNow().canSkip() ? 'cine' : 'none'; }
    if (UI.openModal) { return UI.openModal; }
    if (screen === 'map') { return 'map'; }
    if (screen === 'level') { return performance.now() < levelPromptUntil ? 'level' : 'none'; }
    return 'none';
  }
  function promptHtml(ctxId, m) {
    var P = m === 'pad', A = P ? g('a', 'A') : g('kc', 'Entrée'), B = P ? g('b', 'B') : g('kc', 'Échap'), LR = P ? g('pill', '◀ ▶') : g('kc', '← →'), UD = P ? g('pill', '▲ ▼') : g('kc', '↑ ↓');
    switch (ctxId) {
      case 'map': return pr(g(P ? 'pill' : 'kc', P ? '✥' : '← ↑ ↓ →'), 'Choisir') + pr(A, 'Fiche') + (P ? pr(g('x', 'X'), 'Perso') + pr(g('y', 'Y'), 'Inventaire') + pr(g('pill', '☰'), 'Réglages') : pr(g('kc', 'I'), 'Inventaire'));
      case 'card': return pr(LR, 'Choisir') + pr(UD, 'Lire') + pr(A, 'Valider') + pr(B, 'Fermer');
      case 'victory': return pr(A, 'Continuer');
      case 'cine': return pr(A, 'Passer');
      case 'soonUI': case 'soonJuraUI': return pr(W < 560 ? UD : LR, 'Choisir') + pr(A, 'Valider') + pr(B, 'Carte');
      case 'pause': return pr(UD, 'Choisir') + pr(A, 'Valider') + pr(P ? g('pill', '☰') : B, 'Reprendre');
      case 'inventory': return pr(LR, 'Onglets') + pr(UD, 'Lire') + pr(g('kc', '1-3'), 'Filtrer') + pr(g('kc', 'C'), 'Carrière') + pr(B, 'Fermer');
      case 'briefing': return pr(UD, 'Lire') + pr(A, 'Valider') + pr(B, 'Retour');
      case 'settings': return pr(UD, 'Choisir') + pr(A, 'Valider') + pr(B, 'Fermer');
      case 'trailUnlock': case 'charsUnlock': case 'basqueUnlock': return pr(A, 'Valider');
      case 'charSelect': return pr(LR, 'Choisir') + pr(A, 'Valider') + pr(B, 'Retour');
      case 'level': return pr(P ? g('pill', 'Stick') : LR, 'Avancer') + pr(P ? g('a', 'A') : g('kc', 'Espace'), 'Sauter') + pr(P ? g('pill', '☰') : B, 'Pause');
    }
    return '';
  }
  function refreshPrompts() {
    var m = Input.mode(), c = promptCtx(), key = m + '|' + c;
    if (key === lastPromptKey) { return; } lastPromptKey = key;
    var el = $('prompts'), html = m === 'touch' ? '' : promptHtml(c, m);
    el.innerHTML = html; el.classList.toggle('hidden', !html); document.body.classList.toggle('has-prompts', !!html); document.documentElement.style.setProperty('--prh', (html ? el.offsetHeight + 16 : 0) + 'px');
  }
  function setBodyMode(m) { var b = document.body.classList; b.remove('in-pad', 'in-kbd', 'in-touch'); b.add('in-' + m); }
  Input.onMode(function (m) {
    setBodyMode(m);
    if (m === 'pad' && UI.openModal) { var rt = modalEl(), cur = document.activeElement; if (rt && (!cur || !rt.contains(cur))) { var f = focusables(rt)[0]; if (f) { f.focus({ preventScroll: true }); } } }
    if (m === 'pad' && screen === 'level') { levelPromptUntil = performance.now() + 7000; }
    if (m === 'pad') { Sfx.unlock(); }
  });

  /* ----- v0.11.0 : vol en parapente du Txindoki vers le Jura ----- */
  var paraMapOpts = null;
  function playPara(replay, mapOpts) {
    stopVista(); UI.closeCard(); UI.hide('victory'); UI.hide('pauseMenu'); UI.hide('mapUI'); UI.hide('hud'); UI.hide('soonUI'); UI.hide('soonJuraUI'); UI.openModal = null; window.Game.stop(); window.MapScreen.leave();
    if (mapOpts !== undefined) { paraMapOpts = mapOpts; }
    window.MapScreen.release();
    if (CineW2 && CineW2.prepare) { CineW2.prepare(); }
    screen = 'cine'; setUiMode(''); fitCanvas(); Sfx.unlock(); Sfx.mode('map'); Input.clear();
    $('btnSkipCine').textContent = 'Passer ▶▶'; $('btnSkipCine').classList.remove('hidden'); UI.show('cineUI'); lastPromptKey = '';
    CineW2.start(W, H, rdpr, { replay: !!replay, onEnd: arrivedJura });
  }
  function arrivedJura() {
    var s = window.Save.get(); if (!s.paraSeen) { s.paraSeen = true; window.Save.commit(); }
    paraMapOpts = null; lastPromptKey = '';
    UI.hide('cineUI');
    /* v0.13.0 : on arrive sur la carte du monde 3 (Jura), comme le train ouvre le monde 2 */
    try { showMap({ world: 2, fade: true }); } catch (e) { console.warn('[para] carte du monde 3 : ' + (e && e.message)); recoverMap(); }
  }

  /* ----- v0.5.1 : voyage en train du Puy de Dôme vers le Pays basque, puis écran temporaire « Niveau 7 — bientôt » ----- */
  function playTrain(replay, mapOpts) {
    stopVista(); UI.closeCard(); UI.hide('victory'); UI.hide('pauseMenu'); UI.hide('mapUI'); UI.hide('hud'); UI.hide('soonUI'); UI.openModal = null; window.Game.stop(); window.MapScreen.leave();
    if (mapOpts !== undefined) { trainMapOpts = mapOpts; }
    window.MapScreen.release();   // v0.5.4 : on libère les décors de la carte (~25-50 Mo de canevas à DPR élevé) pendant le voyage
    Cine.prepare(); screen = 'cine'; setUiMode(''); fitCanvas(); Sfx.unlock(); Sfx.mode('map'); Input.clear();
    $('btnSkipCine').textContent = 'Passer ▶▶'; $('btnSkipCine').classList.toggle('hidden', !replay); UI.show('cineUI'); lastPromptKey = '';
    Cine.start(W, H, rdpr, { replay: !!replay, onEnd: arrivedSoon });
  }
  function arrivedSoon() {
    // v0.5.3 : on arrive directement sur la carte du monde 2 (Pays basque) ; plus d'écran « Niveau 7 » intermédiaire
    var s = window.Save.get(); if (!s.trainSeen) { s.trainSeen = true; window.Save.commit(); }
    trainMapOpts = null; lastPromptKey = '';
    try { showMap({ world: 1, fade: true }); } catch (e) { console.warn('[train] carte du monde 2 : ' + (e && e.message)); recoverMap(); }
  }
  /* dernier recours : si la carte ne peut pas s'afficher, on libère tout et on retente (monde 1), puis on recharge la page (sauvegarde déjà validée) */
  function recoverMap() {
    try { window.MapScreen.release(); showMap({ world: 2, fade: true }); return; } catch (e0) {}
    try { window.MapScreen.release(); showMap({ world: 1, fade: true }); return; } catch (e1) {}
    try { window.MapScreen.release(); showMap({ world: 0 }); return; } catch (e2) {}
    try { if (!window.sessionStorage.getItem('ascension.reload')) { window.sessionStorage.setItem('ascension.reload', '1'); window.location.reload(); } } catch (e3) {}
  }

  /* sommet atteint : on sauvegarde tout de suite, puis cinématique pixel-art, puis fiche de victoire */
  function finishVictory() {
    var p = pending; if (!p) { return; } pending = null;
    victoryAt = performance.now(); Sfx.mode('map');
    UI.openVictory(p.stats, p.lv, p.first, p.stars, p.parts, p.newBest);
    Sfx.play('star'); Input.rumble('pick');
  }
  window.Game.on({
    onHud: UI.setHud, onTrailHud: UI.setTrailHud, onHint: UI.hint, onToast: UI.toast,
    onBottle: function (n) { var s = window.Save.get(); if (!s.bottlesFound) { s.bottlesFound = {}; } if (!s.bottlesFound[n]) { s.bottlesFound[n] = true; window.Save.commit(); } },
    onFind: function () { /* le compteur du HUD se met à jour via onHud */ },
    onSummit: function (stats, lv) {
      var first = !window.Save.get().completed[lv.number]; firstWin = first;
      var stars = window.Game.rate(stats), parts = window.Game.rateParts(stats), newBest = stars > window.Save.starsOf(lv.number);
      celebrate = first || newBest;
      var wasOpen = window.Save.trailUnlocked();
      var prevG = window.Save.ghostOf(lv.number);
      stats.trail = !!stats.trail; stats.trailHadGhost = !!(stats.trail && prevG); stats.trailGhostT = prevG ? prevG.t : 0;
      if (stats.trail && prevG) { stats.trailGap = stats.time - prevG.t; }
      stats.trailNew = window.Save.maybeSaveGhost(lv.number, stats.ghostRec);
      window.Save.complete(lv.number, stats, stars);
      if (!wasOpen && window.Save.trailUnlocked() && !window.Save.trailCelebrated()) { pendingTrailCelebrate = true; stats.trailJustUnlocked = true; }
      if (lv.number === 3 && window.Save.charsUnlocked && window.Save.charsUnlocked() && !window.Save.charsCelebrated()) { pendingCharsCelebrate = true; }
      if (lv.number === 9 && window.Save.basqueCharsUnlocked && window.Save.basqueCharsUnlocked() && !window.Save.basqueCharsCelebrated()) { pendingBasqueCelebrate = true; }
      pending = { stats: stats, lv: lv, first: first, stars: stars, parts: parts, newBest: newBest };
      vistaOn = true; document.body.classList.add('vista-on'); Sfx.mode('vista'); UI.hint(null);
      Vista.start(W, H, finishVictory, lv);
    }
  });

  /* ----- boucle ----- */
  var last = 0, acc = 0, STEP = 1 / 60, frameErrs = 0, ctxLost = false, firstRaw = null, lastRaw = 0, clockInited = false;
  function resetCtx() { try { for (var i = 0; i < 16; i++) { ctx.restore(); } ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0; } catch (e) {} if (window.Game && window.Game.invalidateGfx) { window.Game.invalidateGfx(); } }
  function dismissCtxLost() {
    try { var c2 = canvas.getContext('2d', { alpha: false }); if (c2) { ctx = c2; } } catch (eC) {}
    resetCtx(); ctxLost = false; UI.hide('ctxLost');
    if (cineNow().mode() === 'cine') { cineNow().revive(); }
    else if (screen === 'map') { window.MapScreen.resize(W, H, dpr); }
  }
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!clockInited) { clockInited = true; last = ts; firstRaw = 0; lastRaw = 0; return; }
    var raw = (ts - last) / 1000; last = ts;
    if (raw < 0) { raw = 0; }
    lastRaw = raw;
    if (firstRaw === 0 && raw > 0) { firstRaw = raw; }
    var dtCap = Math.min(0.05, raw);
    if (ctxLost) { return; }
    try {
      window.Input.update(dtCap); refreshPrompts();
      if (screen === 'map') {
        window.MapScreen.update(dtCap); window.MapScreen.draw(ctx, ts);
        acc = 0;
      } else if (screen === 'level') {
        if (!window.Game.isPaused() && (!UI.openModal || UI.openModal === 'victory')) {
          acc += dtCap; if (acc > 0.25) { acc = 0.25; }
          var stepped = false;
          while (acc >= STEP) {
            window.Game.update(STEP);
            acc -= STEP;
            if (!stepped) { window.Input.state.jumpPressed = false; stepped = true; }
          }
        } else { acc = 0; }
        if (vistaOn) { if (!vistaPaused) { Vista.update(dtCap); } if (!Vista.opaque()) { window.Game.draw(ctx, W, H, dpr); } Vista.draw(ctx, W, H, dpr); }
        else { window.Game.draw(ctx, W, H, dpr); }
      } else if (screen === 'cine' || screen === 'soon') {
        acc = 0;
        var CN = cineNow();
        if (!cinePaused && UI.openModal !== 'pause') {
          if (raw > 0.25) { /* long hitch / retour d'arrière-plan : on ne saute pas la ciné */ }
          else {
            var left = Math.min(0.12, raw), slice;
            while (left > 1e-6) {
              slice = left > STEP ? STEP : left;
              CN.update(slice, slice);
              left -= slice;
            }
          }
        }
        CN.draw(ctx, W, H, rdpr);
        if (screen === 'cine' || screen === 'soon') {
          if (CN.mode() === 'off') {
            if (CN === CineW2) { arrivedJura(); } else { arrivedSoon(); }
          } else if (CN.rescue()) { var sb = $('btnSkipCine'); if (sb.classList.contains('hidden')) { sb.textContent = 'Continuer ▶▶'; sb.classList.remove('hidden'); } }
        }
      }
      if (frameErrs) { frameErrs--; }
    } catch (e) {
      resetCtx(); frameErrs += 3; if (frameErrs < 12) { console.warn('[frame] ' + (e && e.message)); }
      if ((screen === 'cine' || screen === 'soon') && cineNow().mode() !== 'off') { cineNow().fail(e); }
    }
  }

  function boot() {
    var s = window.Save.get(); applyAudio(s); applyCfg();
    Input.setMode(touchMode ? 'touch' : 'kbd'); setBodyMode(Input.mode());
    resize(); window.addEventListener('resize', resize); window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });
    window.Input.bindTouch(); bindUI(); UI.initHud(); window.MapScreen.bind(canvas); window.MapScreen.onOpen(openCard);
    // pause automatique si l'app passe en arrière-plan (utile sur Android)
    document.addEventListener('visibilitychange', function () {
      clockInited = false;
      if (document.hidden) {
        if (screen === 'level' && vistaOn) { vistaPaused = true; visSoft = true; }
        else if (screen === 'level') {
          var vst = window.Game.state();
          if (vst === 'play') { pause(); }
          else if (vst === 'dying' || vst === 'won') {
            if (UI.openModal !== 'pause') { window.Game.pause(); visSoft = true; }
          }
        } else if (screen === 'cine') {
          if (cineNow().mode() !== 'off' && UI.openModal !== 'pause') { cinePaused = true; visSoft = true; }
        }
      } else {
        if (visSoft) {
          visSoft = false; vistaPaused = false;
          if (screen === 'cine') { cinePaused = false; }
          if (window.Game.isPaused() && UI.openModal !== 'pause') { window.Game.resume(); }
        }
      }
    });
    // perte du contexte 2D (mémoire / GPU) : bandeau, reprise au toucher après restore
    canvas.addEventListener('contextlost', function (e) { e.preventDefault(); ctxLost = true; UI.show('ctxLost'); });
    canvas.addEventListener('contextrestored', function () {
      try { var c2 = canvas.getContext('2d', { alpha: false }); if (c2) { ctx = c2; } } catch (eR) {}
      resetCtx();
      if (cineNow().mode() === 'cine') { cineNow().revive(); }
      else if (screen === 'map') { window.MapScreen.resize(W, H, dpr); }
      /* ctxLost reste vrai jusqu'au toucher (« touchez pour reprendre ») */
    });
    function onCtxResume(ev) {
      if (!ctxLost) { return; }
      if (ev && ev.preventDefault) { ev.preventDefault(); }
      dismissCtxLost();
    }
    if ($('ctxLost')) { $('ctxLost').addEventListener('pointerdown', onCtxResume); }
    canvas.addEventListener('pointerdown', function (ev) { if (ctxLost) { onCtxResume(ev); } });
    if (window.Save) {
      window.Save.onPersistFail(function () { UI.show('saveWarn'); });
      window.Save.onPersistOk(function () { UI.hide('saveWarn'); });
      if (!window.Save.persistOk()) { UI.show('saveWarn'); }
    }
    if ($('btnSaveWarnExport')) {
      $('btnSaveWarnExport').addEventListener('click', function () { if ($('btnXfer')) { $('btnXfer').click(); } });
    }
    if ($('btnSaveWarnRetry')) {
      $('btnSaveWarnRetry').addEventListener('click', function () {
        if (window.Save.retryPersist()) { UI.hide('saveWarn'); }
      });
    }
    Cine.setHook(function () { fitCanvas(); });
    var fontP = document.fonts && document.fonts.load ? document.fonts.load('10px "Press Start 2P"').catch(function () {}) : Promise.resolve();
    Cine.preload(); if (CineW2 && CineW2.preload) { CineW2.preload(); } Promise.all([window.MapScreen.init(), fontP]).then(function () {
      $('loading').classList.add('hidden'); showMap(); requestAnimationFrame(frame);
      window.__ready = true;
    }).catch(function (e) { $('loading').querySelector('.sub').textContent = 'Erreur de chargement : ' + e.message; console.error(e); });
  }
  window.App = { playTrain: playTrain, playPara: playPara, vista: function () { return vistaOn; }, startLevel: startLevel, showMap: showMap, openCard: openCard, pause: pause, resume: resume, screen: function () { return screen; }, _size: function () { return [W, H, dpr, rdpr]; }, trailMode: function () { return trailMode; }, setTrailMode: setTrailMode, trailRun: function () { return runTrail; },
    _loopInfo: function () { return { firstRaw: firstRaw, lastRaw: lastRaw, acc: acc, step: STEP, ctxLost: ctxLost, cinePaused: cinePaused }; },
    _resetClock: function () { clockInited = false; last = 0; firstRaw = 0; lastRaw = 0; acc = 0; },
    _stepLoop: function (raw) {
      if (raw < 0) { raw = 0; }
      lastRaw = raw;
      if (firstRaw === 0 && raw > 0) { firstRaw = raw; }
      var dtCap = Math.min(0.05, raw);
      window.Input.update(dtCap);
      if (screen === 'level' && !window.Game.isPaused() && (!UI.openModal || UI.openModal === 'victory')) {
        acc += dtCap; if (acc > 0.25) { acc = 0.25; }
        var stepped = false;
        while (acc >= STEP) {
          window.Game.update(STEP);
          acc -= STEP;
          if (!stepped) { window.Input.state.jumpPressed = false; stepped = true; }
        }
      }
    },
    _forceCtxLost: function () { ctxLost = true; UI.show('ctxLost'); },
    _dismissCtxLost: function () { dismissCtxLost(); } };
  boot();
})();
