/* Sons générés (WebAudio, aucun fichier audio — fonctionne hors ligne).
   v0.17.6 — Jura plus présent, identité par niveau, stingers, ducking, cap mémoire.
   Tous les sons et musiques sont synthétisés dans le moteur : aucune sample tierce, pas de licence externe.
   Voir /workspace/jeu-ascension/SOUND-LICENSES.txt. Le mode muet (Save.sound = false) coupe tout.
   API publique window.Sfx inchangée. */
(function () {
  'use strict';
  var ac = null, on = true, musicOn = true, musicVol = 0.6, sfxVol = 1;
  var sfxBus = null, musBus = null, musFilter = null, musDry = null, master = null, comp = null, verb = null, verbSend = null, verbFilter = null;
  var musDelayL = null, musDelayR = null, musDelayWet = null, hiShelf = null, musHpf = null, musMud = null, leadBus = null, leadPres = null, ambBus = null, padBus = null, padMud = null, musDuck = null, ambDuck = null;
  var VOICE_CAP = 80, LIST_CAP = 128, liveList = [];
  var noiseBuf = null, pinkBuf = null, impulseBuf = null, shakerBuf = null;
  var mode = 'map', world = 1, started = false, timer = 0, nextT = 0, step = 0, lastStepAt = 0;
  var fadeUntil = 0, isOffline = false, qaOff = 0;
  function clk() { return (ac ? ac.currentTime : 0) + (qaOff || 0); }
  var layers = { pad: 1, bass: 1, arp: 1, lead: 1, ctr: 0, shaker: 0, hiPad: 0, filt: 4200, xpose: 0, bright: 1 };
  var layerT = { pad: 1, bass: 1, arp: 1, lead: 1, ctr: 0, shaker: 0, hiPad: 0, filt: 4200 };

  function ctx() {
    if (!ac) {
      try {
        if (window.__ASC_TEST_AC) { ac = window.__ASC_TEST_AC; }
        else { ac = new (window.AudioContext || window.webkitAudioContext)(); }
      } catch (e) { ac = false; }
      if (ac) {
        isOffline = (typeof OfflineAudioContext !== 'undefined' && ac instanceof OfflineAudioContext) || !!(ac && ac.length && ac.startRendering);
        buildGraph();
      }
    }
    if (ac && !isOffline && ac.state === 'suspended') { ac.resume(); }
    return ac;
  }
  function buildGraph() {
    var a = ac, dl, dr, fbL, fbR, lpL, lpR, wetL, wetR, panL, panR, split, mer;
    master = a.createGain(); master.gain.value = 0.92;
    comp = a.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 14;
    comp.ratio.value = 2.2;
    comp.attack.value = 0.008;
    comp.release.value = 0.22;
    hiShelf = a.createBiquadFilter(); hiShelf.type = 'highshelf'; hiShelf.frequency.value = 9000; hiShelf.gain.value = -1.0;
    master.connect(hiShelf); hiShelf.connect(comp); comp.connect(a.destination);

    sfxBus = a.createGain(); sfxBus.gain.value = 0; sfxBus.connect(master);
    ambBus = a.createGain(); ambBus.gain.value = 0;
    ambDuck = a.createGain(); ambDuck.gain.value = 1;
    ambBus.connect(ambDuck); ambDuck.connect(master);

    musBus = a.createGain(); musBus.gain.value = 0;
    musHpf = a.createBiquadFilter(); musHpf.type = 'highpass'; musHpf.frequency.value = 110; musHpf.Q.value = 0.7;
    musMud = a.createBiquadFilter(); musMud.type = 'peaking'; musMud.frequency.value = 280; musMud.Q.value = 0.75; musMud.gain.value = -4;
    musFilter = a.createBiquadFilter(); musFilter.type = 'lowpass'; musFilter.frequency.value = 5200; musFilter.Q.value = 0.7;
    musDry = a.createGain(); musDry.gain.value = 0.9;
    musDuck = a.createGain(); musDuck.gain.value = 1;
    musBus.connect(musHpf); musHpf.connect(musMud); musMud.connect(musFilter); musFilter.connect(musDuck); musDuck.connect(musDry); musDry.connect(master);
    leadBus = a.createGain(); leadBus.gain.value = 1;
    leadPres = a.createBiquadFilter(); leadPres.type = 'peaking'; leadPres.frequency.value = 2450; leadPres.Q.value = 0.95; leadPres.gain.value = 5;
    leadBus.connect(leadPres); leadPres.connect(musBus);
    padBus = a.createGain(); padBus.gain.value = 1;
    padMud = a.createBiquadFilter(); padMud.type = 'peaking'; padMud.frequency.value = 280; padMud.Q.value = 0.8; padMud.gain.value = -3;
    padBus.connect(padMud); padMud.connect(musBus);

    /* écho stéréo « des sommets » : deux délais légèrement désaccordés, feedback doux, sombre */
    musDelayL = a.createDelay(1.4); musDelayL.delayTime.value = 0.36;
    musDelayR = a.createDelay(1.4); musDelayR.delayTime.value = 0.51;
    lpL = a.createBiquadFilter(); lpL.type = 'lowpass'; lpL.frequency.value = 1650; lpL.Q.value = 0.5;
    lpR = a.createBiquadFilter(); lpR.type = 'lowpass'; lpR.frequency.value = 1480; lpR.Q.value = 0.5;
    fbL = a.createGain(); fbL.gain.value = 0.26;
    fbR = a.createGain(); fbR.gain.value = 0.22;
    wetL = a.createGain(); wetL.gain.value = 0.22;
    wetR = a.createGain(); wetR.gain.value = 0.22;
    panL = makePan(a, -0.55); panR = makePan(a, 0.55);
    musDuck.connect(musDelayL); musDelayL.connect(lpL); lpL.connect(fbL); fbL.connect(musDelayR);
    musDuck.connect(musDelayR); musDelayR.connect(lpR); lpR.connect(fbR); fbR.connect(musDelayL);
    lpL.connect(wetL); wetL.connect(panL); panL.connect(master);
    lpR.connect(wetR); wetR.connect(panR); panR.connect(master);
    musDelayWet = wetL;

    /* réverbération partagée : impulsion de bruit filtré */
    verbSend = a.createGain(); verbSend.gain.value = 0.32;
    verbFilter = a.createBiquadFilter(); verbFilter.type = 'lowpass'; verbFilter.frequency.value = 5200;
    verb = a.createConvolver();
    verb.buffer = getImpulse();
    verbSend.connect(verbFilter); verbFilter.connect(verb); verb.connect(master);

    applySfxGain();
    applyMusicGain();
  }
  function makePan(a, v) {
    var p;
    if (a.createStereoPanner) { p = a.createStereoPanner(); p.pan.value = v; return p; }
    p = a.createGain(); p.gain.value = 1; return p;
  }
  function setPan(node, v) {
    if (node && node.pan && typeof node.pan.setValueAtTime === 'function') { node.pan.value = v; }
  }
  function randPan() { return (Math.random() * 2 - 1) * 0.65; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function mf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function humP() { return 1 + (Math.random() * 0.08 - 0.04); }
  function humF() { return 1 + (Math.random() * 0.16 - 0.08); }
  function rz() { return 0.0001; }
  function watchNode(node, pri, t0, t1) {
    var rec;
    if (!node) { return; }
    rec = { n: node, pri: pri == null ? 2 : pri, t: t0 == null ? clk() : t0, t1: t1 };
    function ended() {
      var i;
      for (i = 0; i < liveList.length; i++) { if (liveList[i] === rec) { liveList.splice(i, 1); return; } }
    }
    try { node.addEventListener('ended', ended); } catch (e) { try { node.onended = ended; } catch (e2) {} }
    liveList.push(rec);
    stealVoices();
  }
  function listNow() {
    if (isOffline) { return nextT || clk() || 0; }
    return ac ? ac.currentTime : clk();
  }
  function pruneLiveList() {
    /* Retire seulement le suivi des voix déjà terminées (ne les stoppe pas). */
    var i, rec, now = listNow();
    for (i = liveList.length - 1; i >= 0; i--) {
      rec = liveList[i];
      if (rec.t1 != null && rec.t1 < now - 0.12) { liveList.splice(i, 1); }
    }
  }
  function stealVoices() {
    var i, best, rec, nLive, now, nList;
    if (!ac) { return; }
    pruneLiveList();
    now = isOffline ? listNow() : ac.currentTime;
    /* cap des voix actuellement entendues (temps réel uniquement) */
    if (!isOffline) {
      while (1) {
        nLive = 0; best = -1;
        for (i = 0; i < liveList.length; i++) {
          rec = liveList[i];
          if (rec.pri <= 0) { continue; }
          if (rec.t > now + 0.02) { continue; }
          if (rec.t1 != null && rec.t1 <= now) { continue; }
          nLive++;
          if (best < 0 || rec.pri > liveList[best].pri || (rec.pri === liveList[best].pri && rec.t < liveList[best].t)) { best = i; }
        }
        if (nLive <= VOICE_CAP || best < 0) { break; }
        rec = liveList.splice(best, 1)[0];
        try { rec.n.stop(); } catch (e) {}
      }
    }
    /* cap de la liste entière, y compris les notes déjà planifiées, pour borner la mémoire */
    while (liveList.length > LIST_CAP) {
      best = -1;
      for (i = 0; i < liveList.length; i++) {
        rec = liveList[i];
        if (rec.pri <= 0) { continue; }
        if (best < 0 || rec.t > liveList[best].t || (rec.t === liveList[best].t && rec.pri > liveList[best].pri)) { best = i; }
      }
      if (best < 0) { break; }
      rec = liveList.splice(best, 1)[0];
      /* en offline pendant _fill, on ne stoppe pas : la note est déjà dans le graphe, on lâche seulement la référence si on dépasse ; on stoppe en temps réel */
      if (!isOffline) { try { rec.n.stop(); } catch (e) {} }
    }
  }
  function startOsc(o, t, stopAt, pri) {
    if (t < 0) { t = 0; }
    if (stopAt != null && stopAt < t) { stopAt = t + 0.02; }
    o.start(t); o.stop(stopAt); watchNode(o, pri, t, stopAt);
  }
  function startSrc(s, t, off, stopAt, pri) {
    if (t == null) { t = ac ? ac.currentTime : 0; }
    if (off != null) { s.start(t, off); } else { s.start(t); }
    if (stopAt != null) { s.stop(stopAt); }
    watchNode(s, pri == null ? 2 : pri, t, stopAt);
  }

  function musGainValue() {
    var kind = (MUS[world] || MUS[1]).kind, g = 1.28;
    if (kind === 'basque') { g = 1.46; }
    if (kind === 'jura') { g = 1.38; }
    return (musicOn && on) ? g * musicVol : 0;
  }
  function applyMusicGain() {
    if (!ac || !musBus) { return; }
    if (clk() < fadeUntil) { return; }
    var v = musGainValue();
    musBus.gain.cancelScheduledValues(clk());
    musBus.gain.setTargetAtTime(v, clk(), 0.25);
  }
  function applySfxGain() {
    if (!ac || !sfxBus) { return; }
    var v = on ? sfxVol : 0;
    sfxBus.gain.cancelScheduledValues(clk());
    sfxBus.gain.setTargetAtTime(v, clk(), 0.05);
    if (ambBus) {
      ambBus.gain.cancelScheduledValues(clk());
      ambBus.gain.setTargetAtTime(v * 0.95, clk(), 0.08);
    }
  }
  function duckUnder(db, att, hold, rel) {
    /* sidechain par automatisation de gain : baisse courte de la musique et de l'ambiance */
    var t = clk(), g, nodes, i, n;
    if (!musDuck && !ambDuck) { return; }
    g = Math.pow(10, (db || -7) / 20);
    att = att == null ? 0.03 : att;
    hold = hold == null ? 0.18 : hold;
    rel = rel == null ? 0.45 : rel;
    nodes = [musDuck, ambDuck];
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i]; if (!n) { continue; }
      try { n.gain.cancelScheduledValues(t); } catch (e) {}
      n.gain.setValueAtTime(n.gain.value, t);
      n.gain.linearRampToValueAtTime(g, t + Math.max(0.008, att));
      n.gain.setValueAtTime(g, t + att + hold);
      n.gain.linearRampToValueAtTime(1, t + att + hold + rel);
    }
  }

  function getNoise() {
    var d, i, a = ac;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate * 0.6, a.sampleRate);
      d = noiseBuf.getChannelData(0);
      for (i = 0; i < d.length; i++) { d[i] = Math.random() * 2 - 1; }
    }
    return noiseBuf;
  }
  function getPink() {
    var a = ac, L, F, raw, b0 = 0, b1 = 0, b2 = 0, i, w, buf, d;
    if (pinkBuf) { return pinkBuf; }
    L = Math.floor(a.sampleRate * 3); F = Math.floor(a.sampleRate * 0.4);
    raw = new Float32Array(L + F);
    for (i = 0; i < raw.length; i++) {
      w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      raw[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
    }
    buf = a.createBuffer(1, L, a.sampleRate); d = buf.getChannelData(0);
    for (i = 0; i < L; i++) { d[i] = i < F ? raw[i] * (i / F) + raw[L + i] * (1 - i / F) : raw[i]; }
    pinkBuf = buf;
    return pinkBuf;
  }
  function getImpulse() {
    var a = ac, n, b, ch, d, i, e, w, lp, sr;
    if (impulseBuf) { return impulseBuf; }
    sr = a.sampleRate; n = Math.floor(sr * 1.55);
    b = a.createBuffer(2, n, sr);
    for (ch = 0; ch < 2; ch++) {
      d = b.getChannelData(ch); lp = 0;
      for (i = 0; i < n; i++) {
        e = Math.pow(1 - i / n, 2.1);
        w = Math.random() * 2 - 1;
        lp += (w - lp) * (0.08 + 0.04 * ch);
        /* early reflections clairsemées */
        if (i === Math.floor(sr * (0.018 + ch * 0.007)) || i === Math.floor(sr * (0.037 + ch * 0.01))) { lp += (Math.random() * 2 - 1) * 0.7; }
        d[i] = lp * e * 0.85;
      }
    }
    impulseBuf = b;
    return impulseBuf;
  }
  function sendVerb(node, amt) {
    var g;
    if (!verbSend || !node) { return; }
    g = ac.createGain(); g.gain.value = amt == null ? 0.35 : amt;
    node.connect(g); g.connect(verbSend);
  }
  function outTo(bus, pan, verbAmt) {
    var a = ac, p = makePan(a, pan || 0), g = a.createGain();
    g.gain.value = 1; g.connect(p); p.connect(bus || sfxBus);
    if (verbAmt) { sendVerb(g, verbAmt); }
    return { g: g, p: p };
  }

  /* ---------- voix musicales (multi-osc, detune, filtre ADSR, vibrato) ---------- */
  function voice(opt) {
    var a = ac, t = opt.t, d = opt.d, f = opt.f, v = opt.v, bus = opt.bus || musBus;
    var types = opt.types || ['triangle', 'sine'], det = opt.det || [0, 6], i, o, g, fl, hp, lfo, lg, panN, pri;
    var att = opt.att != null ? opt.att : 0.02, dec = opt.dec != null ? opt.dec : 0.12, sus = opt.sus != null ? opt.sus : 0.7, rel = opt.rel != null ? opt.rel : 0.18;
    var cut0 = (opt.cut || 2400) * (opt.humF || 1), cut1 = (opt.cut1 || cut0 * 0.55);
    var stopAt, peak = Math.max(rz(), v), fade = Math.max(0.004, att);
    pri = opt.pri == null ? (bus === sfxBus ? 2 : 1) : opt.pri;
    if (!a || !f || f < 15 || d < 0.02) { return; }
    if (t < 0) { t = 0; }
    stopAt = t + d + rel + 0.06;
    fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = opt.q || 0.8;
    fl.frequency.setValueAtTime(Math.max(120, cut0 * 0.35), t);
    fl.frequency.linearRampToValueAtTime(Math.max(180, cut0), t + fade * 0.85);
    fl.frequency.exponentialRampToValueAtTime(Math.max(120, cut1), t + Math.max(d * 0.55, fade + 0.05));
    g = a.createGain();
    g.gain.setValueAtTime(rz(), t);
    g.gain.linearRampToValueAtTime(peak, t + fade);
    if (fade + dec < d) { g.gain.exponentialRampToValueAtTime(Math.max(rz(), peak * sus), t + fade + dec); }
    g.gain.setTargetAtTime(rz(), t + d, Math.max(0.03, rel * 0.4));
    if (opt.hpf) {
      hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = opt.hpf; hp.Q.value = 0.7;
      fl.connect(hp); hp.connect(g);
    } else { fl.connect(g); }
    if (opt.pan != null) { panN = makePan(a, opt.pan); g.connect(panN); panN.connect(bus); } else { g.connect(bus); }
    if (opt.verb) { sendVerb(g, opt.verb); }
    for (i = 0; i < types.length; i++) {
      o = a.createOscillator();
      o.type = types[i];
      o.frequency.setValueAtTime(f, t);
      if (opt.f1) { o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.f1), t + d); }
      if (o.detune) { o.detune.value = (det[i] || 0) + (opt.detOff || 0); }
      if (opt.vib && d > 0.38) {
        lfo = a.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = opt.vibRate || 4.6;
        lg = a.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(opt.vib, t + 0.18);
        lfo.connect(lg); lg.connect(o.frequency);
        startOsc(lfo, t + 0.04, stopAt, pri);
      }
      o.connect(fl); startOsc(o, t, stopAt, pri);
    }
  }
  function noiseAt(opt) {
    var a = ac, t = opt.t, d = opt.d, s, fl, g, panN, buf;
    if (!a) { return; }
    if (t < 0) { t = 0; }
    buf = opt.pink ? getPink() : getNoise();
    s = a.createBufferSource(); s.buffer = buf;
    fl = a.createBiquadFilter(); fl.type = opt.type || 'bandpass';
    fl.frequency.setValueAtTime(Math.max(40, opt.f * (opt.humF || 1)), t);
    if (opt.f1) { fl.frequency.exponentialRampToValueAtTime(Math.max(40, opt.f1), t + d); }
    fl.Q.value = opt.q || 1;
    g = a.createGain();
    g.gain.setValueAtTime(rz(), t);
    g.gain.linearRampToValueAtTime(Math.max(rz(), opt.v), t + 0.004);
    g.gain.exponentialRampToValueAtTime(rz(), t + d);
    s.connect(fl); fl.connect(g);
    if (opt.pan != null) { panN = makePan(a, opt.pan); g.connect(panN); panN.connect(opt.bus || sfxBus); } else { g.connect(opt.bus || sfxBus); }
    if (opt.verb) { sendVerb(g, opt.verb); }
    startSrc(s, t, Math.random() * 0.25, t + d + 0.03, opt.pri == null ? ((opt.bus && opt.bus !== sfxBus) ? 1 : 2) : opt.pri);
  }

  /* SFX de base, compatibles avec l'ancienne API tone/noise (humanisés) */
  function tone(f0, f1, dur, type, vol, delay, bus, pan) {
    var a = ctx(); if (!a || !on) { return; }
    var t = clk() + (delay || 0);
    voice({ t: t, d: dur, f: f0 * humP(), f1: f1 ? f1 * humP() : 0, v: vol || 0.06, types: [type || 'triangle', 'sine'], det: [0, 5], cut: 3200 * humF(), cut1: 1400, att: 0.01, dec: dur * 0.3, sus: 0.5, rel: 0.08, bus: bus || sfxBus, pan: pan });
  }

  function swellNote(f, delay, att, dur, vol, type) {
    var a = ctx(); if (!a || !on) { return; }
    var t = clk() + delay;
    voice({ t: t, d: dur, f: f, v: vol, types: [type || 'triangle', 'sine'], det: [-4, 7], cut: 900, cut1: 2800, att: att, dec: 0.4, sus: 0.75, rel: 0.6, bus: sfxBus, verb: 0.4, vib: 3.2, vibRate: 4.2 });
  }

  function noise(dur, vol, f, q, type, delay, f1, pan, verbAmt) {
    var a = ctx(); if (!a || !on) { return; }
    noiseAt({ t: clk() + (delay || 0), d: dur, v: vol, f: f * humF(), f1: f1, q: q, type: type, pan: pan, verb: verbAmt, humF: 1 });
  }

  /* ---------- SFX haute définition (transitoire + corps + queue, humanisation) ---------- */
  function formantVoice(opt) {
    var a = ctx(); if (!a || !on) { return; }
    var t = clk() + (opt.delay || 0), d = opt.d, f0 = opt.f * humP(), i;
    var src = a.createOscillator(), g = a.createGain(), lpF, bp, bg, pans, stopAt = t + d + 0.08;
    src.type = opt.wave || 'sawtooth';
    src.frequency.setValueAtTime(f0, t);
    if (opt.f1) { src.frequency.exponentialRampToValueAtTime(Math.max(30, opt.f1 * humP()), t + d); }
    g.gain.setValueAtTime(rz(), t);
    g.gain.linearRampToValueAtTime(opt.v, t + (opt.att || 0.04));
    g.gain.setTargetAtTime(rz(), t + d * 0.72, 0.08);
    pans = makePan(a, opt.pan != null ? opt.pan : randPan());
    for (i = 0; i < opt.formants.length; i++) {
      bp = a.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = opt.formants[i][0] * humF();
      bp.Q.value = opt.formants[i][1] || 6;
      bg = a.createGain(); bg.gain.value = opt.formants[i][2] == null ? 1 : opt.formants[i][2];
      src.connect(bp); bp.connect(bg); bg.connect(g);
    }
    var lpF = a.createBiquadFilter(); lpF.type = 'lowpass'; lpF.frequency.value = opt.lp || 4200; lpF.Q.value = 0.7;
    g.connect(lpF); lpF.connect(pans); pans.connect(sfxBus);
    if (opt.verb) { sendVerb(g, opt.verb); }
    if (opt.noise) { noiseAt({ t: t, d: Math.min(d, opt.noise.d || d), v: opt.noise.v, f: opt.noise.f, q: opt.noise.q || 1, type: opt.noise.type || 'lowpass', pan: opt.pan, bus: sfxBus }); }
    startOsc(src, t, stopAt, 2);
  }
  function celesta(freqs, gap, vol) {
    var a = ctx(); if (!a || !on) { return; }
    freqs.forEach(function (f, i) {
      var t = clk() + i * (gap || 0.09);
      voice({ t: t, d: 0.55, f: f * humP(), v: (vol || 0.06), types: ['sine', 'triangle', 'sine'], det: [0, 3, 1200], cut: 4200 * humF(), cut1: 1800, att: 0.004, dec: 0.18, sus: 0.35, rel: 0.4, bus: sfxBus, verb: 0.45, pan: (i % 2 ? 0.22 : -0.18) });
      voice({ t: t, d: 0.28, f: f * 2.003 * humP(), v: (vol || 0.06) * 0.22, types: ['sine'], cut: 6000, cut1: 2500, att: 0.003, dec: 0.1, sus: 0.2, rel: 0.2, bus: sfxBus, verb: 0.3 });
    });
  }
  function cowbellAt(f, v, delay, pan) {
    var a = ctx(); if (!a || !on) { return; }
    var t = clk() + (delay || 0), parts = [1, 1.41, 2.12], i, o, g, fl, p, attN;
    /* battant feutré */
    noiseAt({ t: t, d: 0.025, v: v * 0.35, f: 1800 * humF(), q: 1.2, type: 'bandpass', pan: pan, bus: sfxBus });
    g = a.createGain();
    g.gain.setValueAtTime(rz(), t);
    g.gain.linearRampToValueAtTime(v, t + 0.006);
    g.gain.exponentialRampToValueAtTime(rz(), t + 0.55);
    p = makePan(a, pan == null ? randPan() : pan);
    fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 4200 * humF();
    g.connect(fl); fl.connect(p); p.connect(sfxBus); sendVerb(g, 0.4);
    for (i = 0; i < parts.length; i++) {
      o = a.createOscillator(); o.type = 'sine';
      o.frequency.value = f * parts[i] * humP();
      attN = a.createGain(); attN.gain.value = i === 0 ? 1 : (i === 1 ? 0.55 : 0.32);
      o.connect(attN); attN.connect(g); startOsc(o, t, t + 0.6, 2);
    }
  }


  function phrase(notes, gap, vol, kind) {
    var i, t0 = clk(), ev, f, d;
    kind = kind || (CUR && CUR.kind) || 'puys';
    for (i = 0; i < notes.length; i++) {
      ev = notes[i];
      f = mf(xp(ev[0]));
      d = ev[1] || 0.35;
      leadVoice(f, t0 + i * (gap || 0.12), d, (vol || 0.08), kind, (i % 2 ? 0.18 : -0.16), sfxBus);
      voice({ t: t0 + i * (gap || 0.12), d: d * 0.7, f: f * 2.003, v: (vol || 0.08) * 0.22, types: ['sine'], cut: 6000, att: 0.004, rel: 0.2, bus: sfxBus, verb: 0.35, pan: (i % 2 ? -0.2 : 0.2), pri: 2 });
    }
  }
  function playSummit() {
    /* stinger de sommet : monte et résout sur la tonique du monde */
    var k = (CUR && CUR.kind) || 'puys';
    if (k === 'basque') {
      celesta([392, 494, 587, 784], 0.1, 0.05);
      phrase([[71, 0.28], [74, 0.28], [79, 0.55], [67, 0.7]], 0.16, 0.085, k);
    } else if (k === 'jura') {
      celesta([349, 440, 523, 698], 0.1, 0.05);
      phrase([[69, 0.28], [72, 0.28], [76, 0.4], [77, 0.75]], 0.15, 0.085, k);
    } else {
      celesta([370, 494, 587, 740], 0.1, 0.05);
      phrase([[74, 0.28], [77, 0.28], [81, 0.4], [74, 0.75]], 0.15, 0.085, k);
    }
  }
  function playVictory() {
    /* petite cadence de victoire, plus longue, dans la tonalité du monde */
    var k = (CUR && CUR.kind) || 'puys';
    if (k === 'basque') {
      /* crochet B–A–G–D–G, résout en sol */
      phrase([[83, 0.28], [81, 0.22], [79, 0.32], [74, 0.32], [79, 0.85]], 0.2, 0.09, k);
      celesta([392, 494, 587, 784], 0.14, 0.045);
    } else if (k === 'jura') {
      /* A–C–E–D puis C–A–F */
      phrase([[69, 0.3], [72, 0.28], [76, 0.32], [74, 0.28], [72, 0.28], [69, 0.32], [65, 0.9]], 0.18, 0.088, k);
      celesta([349, 440, 523, 698], 0.13, 0.045);
    } else {
      /* D–E–F–E–D, résout en ré dorien */
      phrase([[74, 0.3], [76, 0.26], [77, 0.32], [76, 0.26], [74, 0.9]], 0.18, 0.09, k);
      celesta([370, 440, 587, 740], 0.13, 0.045);
    }
  }
  function playWorldJingle() {
    /* jingle de changement de monde, court, sur le bus SFX pendant le fondu musical */
    var k = (CUR && CUR.kind) || 'puys', t = clk();
    if (k === 'basque') {
      phrase([[79, 0.2], [83, 0.2], [86, 0.45]], 0.11, 0.07, k);
    } else if (k === 'jura') {
      phrase([[65, 0.2], [69, 0.2], [72, 0.2], [76, 0.45]], 0.1, 0.068, k);
    } else {
      phrase([[74, 0.22], [81, 0.22], [86, 0.5]], 0.12, 0.07, k);
    }
  }

  var S = {
    jump: function () {
      var a = ctx(); if (!a || !on) { return; }
      var t = clk(), p = humP();
      /* souffle d'impulsion */
      noiseAt({ t: t, d: 0.08, v: 0.06, f: 520 * humF(), f1: 1100, q: 0.9, type: 'bandpass', bus: sfxBus });
      voice({ t: t, d: 0.08, f: 90 * p, f1: 70, v: 0.04, types: ['sine'], cut: 280, att: 0.003, rel: 0.05, bus: sfxBus });
      /* montée tonale boisée, pas un carré 8-bit */
      voice({ t: t, d: 0.18, f: 250 * p, f1: 560 * p, v: 0.07, types: ['triangle', 'sine'], det: [0, 7], cut: 2400 * humF(), cut1: 2000, att: 0.006, dec: 0.05, sus: 0.4, rel: 0.08, bus: sfxBus, hpf: 120 });
    },
    pick: function () {
      var a = ctx(); if (!a || !on) { return; }
      voice({ t: clk(), d: 0.09, f: 760 * humP(), v: 0.055, types: ['sine', 'triangle'], cut: 4600, att: 0.003, rel: 0.07, bus: sfxBus, hpf: 300 });
      voice({ t: clk() + 0.055, d: 0.16, f: 1140 * humP(), v: 0.05, types: ['sine'], cut: 5200, att: 0.003, rel: 0.12, bus: sfxBus, verb: 0.25 });
      voice({ t: clk() + 0.11, d: 0.22, f: 1520 * humP(), v: 0.028, types: ['sine'], cut: 6500, att: 0.002, rel: 0.16, bus: sfxBus, verb: 0.3 });
    },
    hit: function () {
      duckUnder(-7, 0.02, 0.16, 0.4);
      noiseAt({ t: clk(), d: 0.1, v: 0.09, f: 320 * humF(), q: 0.8, type: 'lowpass', bus: sfxBus });
      noiseAt({ t: clk(), d: 0.04, v: 0.05, f: 1800 * humF(), q: 1.6, type: 'bandpass', bus: sfxBus });
      voice({ t: clk(), d: 0.2, f: 160 * humP(), f1: 55, v: 0.085, types: ['triangle', 'sine'], cut: 800, att: 0.003, rel: 0.1, bus: sfxBus });
    },
    fall: function () {
      duckUnder(-8, 0.03, 0.28, 0.55);
      voice({ t: clk(), d: 0.58, f: 520 * humP(), f1: 70, v: 0.08, types: ['triangle', 'sine'], cut: 1800, cut1: 360, att: 0.015, rel: 0.16, bus: sfxBus });
      noiseAt({ t: clk(), d: 0.5, v: 0.05, f: 1400, f1: 280, type: 'bandpass', q: 0.7, bus: sfxBus });
      noiseAt({ t: clk() + 0.12, d: 0.32, v: 0.04, f: 400, f1: 140, type: 'lowpass', bus: sfxBus });
    },
    rumble: function () {
      duckUnder(-9, 0.06, 0.45, 0.85);
      var t = clk(), pan = randPan() * 0.4;
      voice({ t: t, d: 0.7, f: 58 * humP(), f1: 36, v: 0.11, types: ['sine', 'triangle'], det: [0, 10], cut: 140, cut1: 80, att: 0.04, rel: 0.25, bus: sfxBus, pan: pan });
      voice({ t: t, d: 0.55, f: 74 * humP(), f1: 42, v: 0.05, types: ['sine'], cut: 160, att: 0.05, rel: 0.2, bus: sfxBus, pan: pan });
      noiseAt({ t: t, d: 0.6, v: 0.06, f: 90, f1: 50, type: 'lowpass', q: 0.6, bus: sfxBus, pan: pan });
    },
    rock: function () {
      var t = clk(), pan = randPan();
      noiseAt({ t: t, d: 0.07, v: 0.07, f: 900 * humF(), q: 1.1, type: 'bandpass', pan: pan, bus: sfxBus });
      voice({ t: t, d: 0.16, f: 95 * humP(), f1: 42, v: 0.055, types: ['triangle'], cut: 500, att: 0.003, rel: 0.08, bus: sfxBus, pan: pan });
      noiseAt({ t: t + 0.04, d: 0.1, v: 0.04, f: 2400 * humF(), q: 1.8, type: 'bandpass', pan: pan * 0.7, bus: sfxBus });
    },
    crack: function () {
      var t = clk();
      noiseAt({ t: t, d: 0.05, v: 0.08, f: 2500 * humF(), q: 3, type: 'bandpass', bus: sfxBus });
      noiseAt({ t: t + 0.08, d: 0.05, v: 0.07, f: 1700 * humF(), q: 3, type: 'bandpass', bus: sfxBus });
      voice({ t: t + 0.16, d: 0.07, f: 150 * humP(), f1: 95, v: 0.03, types: ['triangle'], cut: 800, att: 0.002, bus: sfxBus });
      noiseAt({ t: t + 0.24, d: 0.06, v: 0.08, f: 3000 * humF(), q: 3, type: 'bandpass', bus: sfxBus, pan: 0.3 });
      noiseAt({ t: t + 0.35, d: 0.045, v: 0.06, f: 2000 * humF(), q: 3, type: 'bandpass', bus: sfxBus, pan: -0.25 });
    },
    crumble: function () {
      var t = clk(), pan = randPan() * 0.5;
      noiseAt({ t: t, d: 0.6, v: 0.12, f: 680, f1: 140, type: 'lowpass', q: 0.7, bus: sfxBus, pan: pan });
      voice({ t: t, d: 0.55, f: 70 * humP(), f1: 38, v: 0.09, types: ['sine', 'triangle'], cut: 120, att: 0.03, rel: 0.2, bus: sfxBus, pan: pan });
      noiseAt({ t: t + 0.12, d: 0.22, v: 0.06, f: 3000, f1: 900, type: 'bandpass', q: 0.9, bus: sfxBus, pan: randPan() });
      noiseAt({ t: t + 0.3, d: 0.12, v: 0.05, f: 2200 * humF(), q: 2, type: 'bandpass', bus: sfxBus, pan: randPan() });
      noiseAt({ t: t + 0.44, d: 0.1, v: 0.04, f: 2600 * humF(), q: 2, type: 'bandpass', bus: sfxBus, pan: randPan() });
    },
    bump: function () {
      var t = clk();
      voice({ t: t, d: 0.1, f: 125 * humP(), f1: 70, v: 0.065, types: ['triangle', 'sine'], cut: 700, att: 0.003, bus: sfxBus });
      noiseAt({ t: t, d: 0.07, v: 0.05, f: 480 * humF(), q: 1, type: 'lowpass', bus: sfxBus });
    },
    check: function () {
      voice({ t: clk(), d: 0.14, f: 530 * humP(), f1: 790, v: 0.06, types: ['sine', 'triangle'], cut: 3600, att: 0.006, bus: sfxBus, verb: 0.2 });
    },
    win: function () { playVictory(); },
    ui: function () {
      voice({ t: clk(), d: 0.07, f: 460 * humP(), f1: 620, v: 0.035, types: ['sine', 'triangle'], cut: 3200, att: 0.004, bus: sfxBus });
    },
    find: function () { celesta([784, 988, 1175, 1568], 0.08, 0.065); },
    swell: function () {
      [50, 57, 62, 66, 69].forEach(function (m, i) {
        swellNote(mf(m), i * 0.12, 2.6, 4.6, 0.032, i < 2 ? 'triangle' : 'sine');
      });
      noise(2.4, 0.025, 500, 0.7, 'bandpass', 0.1, 3200, 0, 0.35);
    },
    ping: function () {
      [74, 78, 81, 86].forEach(function (m, i) {
        var f = mf(m);
        voice({ t: clk() + i * 0.09, d: 0.6, f: f * humP(), v: 0.06, types: ['sine', 'triangle'], det: [0, 4], cut: 4800, att: 0.005, rel: 0.35, bus: sfxBus, verb: 0.5, pan: i % 2 ? 0.28 : -0.24 });
        voice({ t: clk() + i * 0.09, d: 0.3, f: f * 2.003, v: 0.018, types: ['sine'], cut: 6000, att: 0.004, bus: sfxBus, verb: 0.3 });
      });
    },
    chord: function () {
      [62, 66, 69, 74, 78].forEach(function (m, i) { swellNote(mf(m), i * 0.06, 0.55, 2.8, 0.034, 'triangle'); });
    },
    star: function () { celesta([880, 1320, 1760, 2200], 0.065, 0.07); },
    fw_launch: function () {
      var t = clk();
      voice({ t: t, d: 0.52, f: 400 * humP(), f1: 1480, v: 0.028, types: ['triangle', 'sine'], cut: 2600, cut1: 4000, att: 0.04, rel: 0.1, bus: sfxBus, pan: 0 });
      noiseAt({ t: t, d: 0.5, v: 0.025, f: 2400, f1: 5000, type: 'bandpass', q: 1.2, bus: sfxBus });
    },
    fw_burst: function () {
      var t = clk();
      noiseAt({ t: t, d: 0.24, v: 0.11, f: 900, f1: 220, type: 'lowpass', q: 0.7, bus: sfxBus });
      voice({ t: t, d: 0.22, f: 140 * humP(), f1: 48, v: 0.075, types: ['sine', 'triangle'], cut: 300, att: 0.004, bus: sfxBus });
      noiseAt({ t: t + 0.04, d: 0.35, v: 0.045, f: 4000, f1: 2400, type: 'highpass', q: 0.8, bus: sfxBus });
    },
    fw_crackle: function () {
      var k, t = clk();
      for (k = 0; k < 6; k++) {
        noiseAt({ t: t + 0.04 + k * 0.05 + Math.random() * 0.03, d: 0.045, v: 0.13, f: (2600 + Math.random() * 2000) * humF(), q: 2.4, type: 'bandpass', pan: randPan(), bus: sfxBus });
      }
    },
    land: function () {
      var t = clk();
      noiseAt({ t: t, d: 0.11, v: 0.085, f: 280 * humF(), q: 0.7, type: 'lowpass', bus: sfxBus });
      noiseAt({ t: t, d: 0.05, v: 0.04, f: 1600 * humF(), q: 1.4, type: 'bandpass', bus: sfxBus });
      voice({ t: t, d: 0.12, f: 92 * humP(), f1: 48, v: 0.065, types: ['sine', 'triangle'], cut: 380, att: 0.002, rel: 0.07, bus: sfxBus });
    },
    step_scoria: function () {
      var t = clk(), k, n = 3 + (Math.random() * 3 | 0), pan = randPan() * 0.35;
      noiseAt({ t: t, d: 0.075, v: 0.16, f: 500 + Math.random() * 160, q: 1, type: 'lowpass', pan: pan, bus: sfxBus });
      for (k = 0; k < n; k++) {
        noiseAt({ t: t + k * 0.016 + Math.random() * 0.01, d: 0.024 + Math.random() * 0.02, v: 0.13 + Math.random() * 0.04, f: 1800 + Math.random() * 2200, q: 2.2, type: 'bandpass', pan: pan + (Math.random() - 0.5) * 0.2, bus: sfxBus });
      }
    },
    step_gravel: function () {
      var t = clk(), k, n = 4 + (Math.random() * 3 | 0), pan = randPan() * 0.4;
      noiseAt({ t: t, d: 0.07, v: 0.13, f: 680, q: 1.1, type: 'lowpass', pan: pan, bus: sfxBus });
      for (k = 0; k < n; k++) {
        noiseAt({ t: t + k * 0.015 + Math.random() * 0.01, d: 0.022 + Math.random() * 0.02, v: 0.11 + Math.random() * 0.04, f: 2100 + Math.random() * 2200, q: 2.3, type: 'bandpass', pan: pan, bus: sfxBus });
      }
    },
    step_snow: function () {
      var t = clk(), pan = randPan() * 0.3;
      /* crissement typique : deux bandes étroites 1.8 kHz et 3.5 kHz */
      noiseAt({ t: t, d: 0.13, v: 0.2, f: 1800 * humF(), q: 6.2, type: 'bandpass', pan: pan, bus: sfxBus });
      noiseAt({ t: t, d: 0.11, v: 0.16, f: 3500 * humF(), q: 5.8, type: 'bandpass', pan: pan, bus: sfxBus });
      noiseAt({ t: t, d: 0.09, v: 0.13, f: 260 * humF(), q: 1, type: 'lowpass', pan: pan, bus: sfxBus });
    },
    step_stone: function () {
      var t = clk(), pan = randPan() * 0.25;
      voice({ t: t, d: 0.075, f: (190 + Math.random() * 30) * humP(), f1: 105, v: 0.05, types: ['triangle', 'sine'], cut: 1600 * humF(), att: 0.002, bus: sfxBus, pan: pan });
      noiseAt({ t: t, d: 0.035, v: 0.04, f: 3200 * humF(), q: 2, type: 'bandpass', pan: pan, bus: sfxBus });
    },
    step_concrete: function () {
      var t = clk();
      voice({ t: t, d: 0.075, f: (170 + Math.random() * 25) * humP(), f1: 95, v: 0.045, types: ['triangle'], cut: 1400 * humF(), att: 0.002, bus: sfxBus });
      noiseAt({ t: t, d: 0.038, v: 0.032, f: 2400 * humF(), q: 2.2, type: 'bandpass', bus: sfxBus });
    },
    step_grass: function () {
      var t = clk(), pan = randPan() * 0.35;
      noiseAt({ t: t, d: 0.13, v: 0.07, f: 3200 + Math.random() * 500, f1: 2000, type: 'bandpass', q: 0.85, pan: pan, bus: sfxBus });
      noiseAt({ t: t, d: 0.1, v: 0.06, f: 1000 * humF(), q: 0.7, type: 'lowpass', pan: pan, bus: sfxBus });
    },
    step_rock: function () {
      var t = clk(), pan = randPan() * 0.3;
      voice({ t: t, d: 0.07, f: (210 + Math.random() * 30) * humP(), f1: 120, v: 0.055, types: ['triangle', 'sine'], cut: 1500 * humF(), att: 0.002, bus: sfxBus, pan: pan });
      noiseAt({ t: t, d: 0.035, v: 0.05, f: 2800 * humF(), q: 2, type: 'bandpass', pan: pan, bus: sfxBus });
    },
    step_wood: function () {
      var t = clk(), pan = randPan() * 0.2, f = (155 + Math.random() * 18) * humP();
      /* résonance creuse de planche + impact mat */
      voice({ t: t, d: 0.16, f: f, v: 0.05, types: ['triangle', 'sine'], det: [0, 8], cut: 1200 * humF(), cut1: 600, att: 0.002, dec: 0.05, sus: 0.3, rel: 0.1, bus: sfxBus, pan: pan });
      voice({ t: t, d: 0.08, f: f * 2.01, v: 0.018, types: ['sine'], cut: 1800, att: 0.002, bus: sfxBus, pan: pan });
      noiseAt({ t: t, d: 0.03, v: 0.04, f: 1400 * humF(), q: 1.8, type: 'bandpass', pan: pan, bus: sfxBus });
    },
    windwarn: function () {
      var t = clk(), pan = randPan() * 0.4;
      noiseAt({ t: t, d: 1.1, v: 0.16, f: 380, f1: 900, q: 1.0, type: 'bandpass', pan: pan, bus: sfxBus, verb: 0.15, pink: true });
    },
    gust: function () {
      var t = clk(), pan = randPan() * 0.5;
      noiseAt({ t: t, d: 1.45, v: 0.22, f: 360, f1: 950, q: 0.75, type: 'bandpass', pan: pan, bus: sfxBus, verb: 0.1, pink: true });
      noiseAt({ t: t + 0.08, d: 1.15, v: 0.08, f: 1400, f1: 700, q: 0.8, type: 'bandpass', pan: -pan * 0.7, bus: sfxBus, verb: 0.08, pink: true });
    },
    slide: function () {
      var t = clk(), pan = randPan() * 0.3;
      noiseAt({ t: t, d: 0.34, v: 0.15, f: 1900, f1: 1200, type: 'bandpass', q: 0.85, pan: pan, bus: sfxBus, pink: true });
      noiseAt({ t: t, d: 0.24, v: 0.075, f: 650, type: 'lowpass', q: 0.7, pan: pan, bus: sfxBus, pink: true });
    },
    bell: function () {
      cowbellAt(980 + Math.random() * 80, 0.045, 0, randPan());
      cowbellAt(1175 + Math.random() * 40, 0.03, 0.18, randPan());
    },
    train: function () {
      var t = clk();
      voice({ t: t, d: 0.6, f: 311, v: 0.03, types: ['triangle', 'sine'], cut: 900, att: 0.04, rel: 0.2, bus: sfxBus });
      voice({ t: t, d: 0.6, f: 392, v: 0.022, types: ['triangle'], cut: 1100, att: 0.05, bus: sfxBus });
      noiseAt({ t: t, d: 1.9, v: 0.055, f: 160, f1: 90, type: 'lowpass', q: 0.7, bus: sfxBus });
      noiseAt({ t: t + 0.2, d: 1.4, v: 0.028, f: 900, f1: 300, type: 'bandpass', q: 1.2, bus: sfxBus });
    },
    pottok: function () {
      /* hennissement : montée puis descente, formants de cheval */
      formantVoice({ f: 420, f1: 720, d: 0.24, att: 0.03, v: 0.11, lp: 3800, formants: [[800, 5, 1], [1400, 6, 0.7], [2400, 5, 0.35]], wave: 'sawtooth', verb: 0.15, pan: randPan(), delay: 0 });
      formantVoice({ f: 700, f1: 280, d: 0.4, att: 0.04, v: 0.1, lp: 3800, formants: [[750, 5, 1], [1350, 6, 0.65], [2300, 5, 0.3]], wave: 'sawtooth', verb: 0.15, pan: randPan(), delay: 0.16, noise: { v: 0.03, f: 200, q: 0.8, type: 'lowpass', d: 0.2 } });
    },
    boar: function () {
      formantVoice({ f: 140, f1: 90, d: 0.24, att: 0.025, v: 0.13, lp: 2800, formants: [[250, 4, 1], [520, 5, 0.6], [900, 4, 0.3]], wave: 'sawtooth', pan: randPan(), noise: { v: 0.08, f: 220, q: 0.7, type: 'lowpass', d: 0.22 } });
      formantVoice({ f: 180, f1: 110, d: 0.14, att: 0.02, v: 0.045, formants: [[300, 4, 1], [700, 4, 0.4]], wave: 'sawtooth', pan: randPan(), delay: 0.1 });
    },
    sheep: function () {
      formantVoice({ f: 280, f1: 340, d: 0.13, att: 0.03, v: 0.14, lp: 4000, formants: [[780, 6, 1], [1550, 7, 0.8], [2400, 5, 0.25]], wave: 'sawtooth', pan: randPan(), verb: 0.12 });
      formantVoice({ f: 360, f1: 220, d: 0.3, att: 0.05, v: 0.13, lp: 4000, formants: [[720, 6, 1], [1480, 7, 0.7], [2300, 5, 0.2]], wave: 'sawtooth', pan: randPan(), delay: 0.1, verb: 0.12 });
    },
    cow: function () {
      formantVoice({ f: 130, f1: 165, d: 0.2, att: 0.06, v: 0.15, lp: 3200, formants: [[280, 5, 1], [750, 6, 0.7], [1200, 4, 0.25]], wave: 'sawtooth', pan: randPan(), verb: 0.1, noise: { v: 0.03, f: 180, type: 'lowpass', d: 0.16 } });
      formantVoice({ f: 160, f1: 100, d: 0.46, att: 0.08, v: 0.14, lp: 3200, formants: [[260, 5, 1], [700, 6, 0.65], [1100, 4, 0.2]], wave: 'sawtooth', pan: randPan(), delay: 0.14, verb: 0.1 });
    },
    cry: function () {
      /* cri de vautour : descendant, un peu râpeux, spatialisé */
      formantVoice({ f: 980, f1: 520, d: 0.5, att: 0.04, v: 0.09, lp: 4500, formants: [[900, 5, 1], [1600, 6, 0.5], [2800, 4, 0.2]], wave: 'sawtooth', pan: randPan(), verb: 0.45, noise: { v: 0.025, f: 1800, q: 1.2, type: 'bandpass', d: 0.3 } });
      formantVoice({ f: 1100, f1: 480, d: 0.42, att: 0.05, v: 0.03, formants: [[1000, 5, 0.8], [1700, 5, 0.35]], wave: 'triangle', pan: randPan(), delay: 0.05, verb: 0.4 });
    },
    pebble: function () {
      var t = clk(), pan = randPan();
      voice({ t: t, d: 0.1, f: 165 * humP(), f1: 80, v: 0.04, types: ['triangle'], cut: 700, att: 0.002, bus: sfxBus, pan: pan });
      noiseAt({ t: t, d: 0.07, v: 0.05, f: 2000 * humF(), q: 2, type: 'bandpass', pan: pan, bus: sfxBus });
    },
    bats: function () {
      var t = clk(), i, pan;
      for (i = 0; i < 3; i++) {
        pan = randPan();
        voice({ t: t + i * 0.05, d: 0.09, f: (1400 + i * 120) * humP(), f1: 1200 + (i % 2 ? 500 : -200), v: 0.025, types: ['sine'], cut: 5000, att: 0.004, bus: sfxBus, pan: pan, verb: 0.2 });
      }
    },
    drink: function () {
      var t = clk(), k;
      /* glouglou d'eau : courtes bulles passe-bande */
      for (k = 0; k < 5; k++) {
        noiseAt({ t: t + k * 0.045, d: 0.055, v: 0.05, f: (700 + Math.random() * 500) * humF(), q: 2.2, type: 'bandpass', bus: sfxBus });
      }
      /* résonance de gourde */
      voice({ t: t, d: 0.24, f: 230 * humP(), f1: 155, v: 0.048, types: ['sine', 'triangle'], cut: 1000, att: 0.01, rel: 0.12, bus: sfxBus, verb: 0.18 });
      voice({ t: t + 0.07, d: 0.18, f: 320 * humP(), f1: 200, v: 0.032, types: ['sine'], cut: 1300, att: 0.01, bus: sfxBus });
      noiseAt({ t: t + 0.22, d: 0.08, v: 0.03, f: 900 * humF(), q: 1.6, type: 'bandpass', bus: sfxBus });
    },
    heart: function () {
      voice({ t: clk() + 0.04, d: 0.18, f: 392 * humP(), f1: 294, v: 0.055, types: ['sine', 'triangle'], cut: 1600, att: 0.01, bus: sfxBus });
      voice({ t: clk() + 0.14, d: 0.22, f: 294 * humP(), f1: 220, v: 0.045, types: ['sine'], cut: 1200, att: 0.02, bus: sfxBus });
    },
    summit: function () {
      duckUnder(-10, 0.04, 1.1, 0.9);
      playSummit();
    }
  };

  /* ---------- musiques : 32 mesures A A' B A | C C' lift A, motifs mémorables, calées par monde ---------- */
  /* Événements mélodiques : [midi, départ en noires dans la mesure 0-4, durée en noires]. 0 midi = silence (ignoré). */
  var MUS = {
    1: {
      BPM: 76,
      kind: 'puys',
      ARP: [0, 2, 1, 3, 2, 1, 3, 2],
      CH: [
        [50, 57, 60, 62, 65],
        [48, 52, 55, 57, 62],
        [43, 50, 53, 55, 59],
        [50, 57, 60, 62, 65],
        [50, 57, 60, 62, 65],
        [48, 52, 55, 60, 67],
        [53, 57, 60, 64],
        [45, 52, 55, 57, 60],
        [53, 57, 60, 64],
        [48, 52, 55, 59],
        [46, 50, 53, 57],
        [48, 52, 55, 60, 67],
        [50, 57, 60, 62, 65],
        [48, 52, 55, 57, 62],
        [43, 50, 53, 55, 59],
        [50, 57, 60, 62, 65],
        [53, 57, 60, 64],
        [48, 52, 55, 59],
        [50, 57, 60, 62, 65],
        [43, 50, 53, 55, 59],
        [53, 57, 60, 64],
        [48, 52, 55, 59],
        [46, 50, 53, 57],
        [48, 52, 55, 60, 67],
        [53, 57, 60, 64],
        [48, 52, 55, 59],
        [46, 50, 53, 57],
        [45, 52, 55, 57, 60],
        [50, 57, 60, 62, 65],
        [48, 52, 55, 57, 62],
        [43, 50, 53, 55, 59],
        [50, 57, 60, 62, 65, 69]
      ],
      MEL: [
        [[74, 0, 1], [76, 1, 0.5], [77, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
        [[69, 0, 1], [72, 1, 0.5], [74, 1.5, 0.5], [76, 2, 1.5]],
        [[77, 0, 1], [76, 1, 0.5], [74, 1.5, 0.5], [74, 2, 1], [71, 3, 1]],
        [[74, 0, 2]],
        [[74, 0, 0.5], [77, 0.5, 0.5], [81, 1, 1], [79, 2, 1], [77, 3, 0.5], [76, 3.5, 0.5]],
        [[72, 0, 1], [76, 1, 0.5], [77, 1.5, 0.5], [79, 2, 1.5]],
        [[81, 0, 1], [79, 1, 0.5], [77, 1.5, 0.5], [76, 2, 1], [72, 3, 1]],
        [[76, 0, 2]],
        [[81, 0, 1.5], [79, 1.5, 0.5], [77, 2, 1], [76, 3, 1]],
        [[76, 0, 1], [74, 1, 0.5], [72, 1.5, 0.5], [71, 2, 1], [69, 3, 1]],
        [[70, 0, 1], [72, 1, 1], [74, 2, 1.5]],
        [[72, 0, 1], [76, 1, 1], [79, 2, 1], [76, 3, 1]],
        [[74, 0, 1], [76, 1, 0.5], [77, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
        [[69, 0, 1], [72, 1, 0.5], [74, 1.5, 0.5], [76, 2, 1.5]],
        [[77, 0, 1], [76, 1, 0.5], [74, 1.5, 0.5], [74, 2, 1], [71, 3, 1]],
        [[74, 0, 3]],
        [[81, 0, 1], [79, 1, 1], [77, 2, 1], [76, 3, 1]],
        [[76, 0, 1], [74, 1, 0.5], [72, 1.5, 0.5], [71, 2, 1], [69, 3, 1]],
        [[74, 0, 2], [72, 2, 1], [69, 3, 1]],
        [[71, 0, 1], [74, 1, 1], [79, 2, 2]],
        [[81, 0, 0.5], [84, 0.5, 0.5], [81, 1, 1], [79, 2, 1], [77, 3, 1]],
        [[76, 0, 1], [79, 1, 1], [76, 2, 1], [72, 3, 1]],
        [[77, 0, 1], [74, 1, 1], [70, 2, 1], [74, 3, 1]],
        [[72, 0, 1], [76, 1, 1], [79, 2, 1], [76, 3, 1]],
        [[84, 0, 1], [81, 1, 1], [79, 2, 1], [77, 3, 1]],
        [[76, 0, 1.5], [74, 1.5, 0.5], [72, 2, 1], [71, 3, 1]],
        [[74, 0, 1], [70, 1, 1], [74, 2, 1.5]],
        [[76, 0, 2], [72, 2, 1], [69, 3, 1]],
        [[74, 0, 1], [76, 1, 0.5], [77, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
        [[69, 0, 1], [72, 1, 0.5], [74, 1.5, 0.5], [76, 2, 1.5]],
        [[77, 0, 1], [76, 1, 0.5], [74, 1.5, 0.5], [74, 2, 1], [71, 3, 1]],
        [[74, 0, 3]]
      ],
      CTR: [
        [[77, 0, 2], [77, 2, 2]],
        [[72, 0, 2], [74, 2, 1.5]],
        [[71, 0, 2], [74, 2, 2]],
        [[69, 0, 2]],
        [[77, 1, 2], [76, 3, 1]],
        [[72, 0, 2], [72, 2, 1.5]],
        [[77, 0, 2], [76, 2, 2]],
        [[72, 0, 2]],
        [[77, 0, 2], [76, 2, 2]],
        [[71, 0, 2], [71, 2, 2]],
        [[65, 0, 2], [69, 2, 1.5]],
        [[67, 0, 2], [72, 2, 2]],
        [[77, 0, 2], [77, 2, 2]],
        [[72, 0, 2], [74, 2, 1.5]],
        [[71, 0, 2], [74, 2, 2]],
        [[69, 0, 3]],
        [[77, 0, 2], [76, 2, 2]],
        [[72, 0, 2], [71, 2, 2]],
        [[69, 0, 2], [65, 2, 2]],
        [[67, 0, 2], [71, 2, 2]],
        [[77, 0, 2], [76, 2, 2]],
        [[71, 0, 2], [72, 2, 2]],
        [[70, 0, 2], [74, 2, 2]],
        [[72, 0, 2], [72, 2, 2]],
        [[77, 0, 2], [76, 2, 2]],
        [[72, 0, 2], [71, 2, 2]],
        [[70, 0, 2], [74, 2, 1.5]],
        [[72, 0, 2], [69, 2, 2]],
        [[77, 0, 2], [77, 2, 2]],
        [[72, 0, 2], [74, 2, 1.5]],
        [[71, 0, 2], [74, 2, 2]],
        [[69, 0, 3]]
      ]
    },
    2: {
      BPM: 86,
      kind: 'basque',
      ARP: [0, 2, 1, 2, 3, 1, 2, 0],
      CH: [
        [43, 47, 50, 55, 59],
        [40, 43, 47, 50, 54],
        [36, 40, 43, 47, 52],
        [38, 42, 45, 50],
        [43, 47, 50, 55, 59],
        [42, 45, 47, 50, 54],
        [36, 40, 43, 47, 52],
        [38, 42, 45, 50],
        [45, 48, 52, 55, 57],
        [38, 42, 45, 50],
        [40, 43, 47, 50, 52],
        [38, 42, 45, 50],
        [43, 47, 50, 55, 59],
        [40, 43, 47, 50, 54],
        [36, 40, 43, 47, 52],
        [38, 42, 45, 50],
        [40, 43, 47, 50, 52],
        [42, 45, 47, 50, 54],
        [36, 40, 43, 47, 52],
        [38, 42, 45, 50],
        [43, 47, 50, 55, 59],
        [40, 43, 47, 50, 52],
        [45, 48, 52, 55, 57],
        [38, 42, 45, 50],
        [45, 48, 52, 55, 57],
        [38, 42, 45, 50],
        [43, 47, 50, 55, 59],
        [38, 42, 45, 50],
        [43, 47, 50, 55, 59],
        [40, 43, 47, 50, 54],
        [36, 40, 43, 47, 52],
        [38, 42, 45, 50]
      ],
      MEL: [
        [[83, 0, 0.5], [81, 0.5, 0.5], [79, 1, 1], [74, 2, 1], [79, 3, 1]],
        [[81, 0, 0.5], [83, 0.5, 0.5], [81, 1, 1], [78, 2, 1], [74, 3, 1]],
        [[76, 0, 1], [79, 1, 0.5], [81, 1.5, 0.5], [83, 2, 1], [81, 3, 1]],
        [[79, 0, 0.5], [78, 0.5, 1.5], [74, 2, 2]],
        [[86, 0, 0.5], [83, 0.5, 0.5], [81, 1, 1], [79, 2, 1], [78, 3, 1]],
        [[78, 0, 1], [81, 1, 0.5], [83, 1.5, 0.5], [81, 2, 1], [78, 3, 1]],
        [[76, 0, 1], [74, 1, 0.5], [76, 1.5, 0.5], [79, 2, 1], [81, 3, 1]],
        [[79, 0, 0.5], [78, 0.5, 1.5], [74, 2, 1.5]],
        [[81, 0, 1], [83, 1, 1], [84, 2, 1], [83, 3, 1]],
        [[81, 0, 1], [78, 1, 1], [76, 2, 1], [74, 3, 1]],
        [[76, 0, 1.5], [79, 1.5, 0.5], [81, 2, 1], [79, 3, 1]],
        [[78, 0, 2], [74, 2, 1], [76, 3, 1]],
        [[83, 0, 0.5], [81, 0.5, 0.5], [79, 1, 1], [74, 2, 1], [79, 3, 1]],
        [[81, 0, 0.5], [83, 0.5, 0.5], [81, 1, 1], [78, 2, 1], [74, 3, 1]],
        [[76, 0, 1], [79, 1, 0.5], [81, 1.5, 0.5], [83, 2, 1], [81, 3, 1]],
        [[79, 0, 0.5], [78, 0.5, 1.5], [74, 2, 2]],
        [[79, 0, 1], [83, 1, 1], [86, 2, 1], [83, 3, 1]],
        [[81, 0, 1], [78, 1, 1], [74, 2, 1], [78, 3, 1]],
        [[76, 0, 1], [79, 1, 1], [84, 2, 1], [83, 3, 1]],
        [[81, 0, 1], [78, 1, 1], [74, 2, 2]],
        [[83, 0, 0.5], [86, 0.5, 0.5], [83, 1, 1], [79, 2, 1], [74, 3, 1]],
        [[79, 0, 1], [76, 1, 1], [74, 2, 1], [71, 3, 1]],
        [[72, 0, 1], [76, 1, 1], [81, 2, 1], [79, 3, 1]],
        [[78, 0, 2], [74, 2, 2]],
        [[84, 0, 1], [81, 1, 1], [79, 2, 1], [76, 3, 1]],
        [[78, 0, 1], [81, 1, 1], [78, 2, 1], [74, 3, 1]],
        [[79, 0, 1], [83, 1, 1], [86, 2, 1], [83, 3, 1]],
        [[78, 0, 2], [74, 2, 1], [76, 3, 1]],
        [[83, 0, 0.5], [81, 0.5, 0.5], [79, 1, 1], [74, 2, 1], [79, 3, 1]],
        [[81, 0, 0.5], [83, 0.5, 0.5], [81, 1, 1], [78, 2, 1], [74, 3, 1]],
        [[76, 0, 1], [79, 1, 0.5], [81, 1.5, 0.5], [83, 2, 1], [81, 3, 1]],
        [[79, 0, 0.5], [78, 0.5, 1.5], [74, 2, 2]]
      ],
      CTR: [
        [[79, 0, 2], [74, 2, 2]],
        [[76, 0, 2], [71, 2, 2]],
        [[72, 0, 2], [76, 2, 2]],
        [[74, 0, 2]],
        [[83, 0, 2], [79, 2, 2]],
        [[74, 0, 2], [78, 2, 2]],
        [[72, 0, 2], [76, 2, 2]],
        [[74, 0, 2]],
        [[76, 0, 2], [76, 2, 2]],
        [[74, 0, 2], [69, 2, 2]],
        [[71, 0, 2], [71, 2, 2]],
        [[74, 0, 2]],
        [[79, 0, 2], [74, 2, 2]],
        [[76, 0, 2], [71, 2, 2]],
        [[72, 0, 2], [76, 2, 2]],
        [[74, 0, 3]],
        [[76, 0, 2], [79, 2, 2]],
        [[74, 0, 2], [78, 2, 2]],
        [[72, 0, 2], [76, 2, 2]],
        [[74, 0, 2]],
        [[79, 0, 2], [74, 2, 2]],
        [[71, 0, 2], [67, 2, 2]],
        [[69, 0, 2], [72, 2, 2]],
        [[74, 0, 2]],
        [[76, 0, 2], [72, 2, 2]],
        [[74, 0, 2], [69, 2, 2]],
        [[71, 0, 2], [74, 2, 2]],
        [[74, 0, 2]],
        [[79, 0, 2], [74, 2, 2]],
        [[76, 0, 2], [74, 2, 2]],
        [[72, 0, 2], [76, 2, 2]],
        [[74, 0, 3]]
      ]
    },
    3: {
      BPM: 78,
      kind: 'jura',
      ARP: [0, 2, 1, 3, 2, 0, 3, 1],
      CH: [
        [41, 45, 48, 52, 57],
        [36, 40, 43, 47, 52],
        [38, 41, 45, 48],
        [43, 47, 50, 52],
        [41, 45, 48, 52, 57],
        [36, 40, 43, 47, 52],
        [38, 41, 45, 48],
        [43, 47, 50, 52],
        [38, 41, 45, 48, 53],
        [43, 47, 50, 52],
        [46, 50, 53, 57],
        [36, 40, 43, 47, 52],
        [41, 45, 48, 52, 57],
        [36, 40, 43, 47, 52],
        [38, 41, 45, 48],
        [41, 45, 48, 52],
        [46, 50, 53, 57],
        [41, 45, 48, 52, 57],
        [43, 46, 50, 53],
        [36, 40, 43, 47, 52],
        [38, 41, 45, 48],
        [43, 47, 50, 52],
        [46, 50, 53, 57],
        [36, 40, 43, 47, 52],
        [41, 45, 48, 52, 57],
        [36, 40, 43, 47, 52],
        [38, 41, 45, 48],
        [43, 47, 50, 52],
        [41, 45, 48, 52, 57],
        [36, 40, 43, 47, 52],
        [38, 41, 45, 48],
        [41, 45, 48, 52, 57]
      ],
      MEL: [
        [[69, 0, 1.5], [72, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
        [[72, 0, 1], [71, 1, 0.5], [69, 1.5, 0.5], [67, 2, 2]],
        [[65, 0, 1], [69, 1, 1], [72, 2, 1], [74, 3, 1]],
        [[76, 0, 2.5]],
        [[77, 0, 1], [76, 1, 1], [74, 2, 1], [72, 3, 1]],
        [[71, 0, 1.5], [69, 1.5, 0.5], [67, 2, 2]],
        [[69, 0, 1], [72, 1, 1], [74, 2, 1], [76, 3, 1]],
        [[74, 0, 2], [71, 2, 1.5]],
        [[72, 0, 1.5], [74, 1.5, 0.5], [77, 2, 1], [76, 3, 1]],
        [[74, 0, 2], [71, 2, 2]],
        [[70, 0, 1], [72, 1, 1], [74, 2, 1.5]],
        [[72, 0, 1], [76, 1, 1], [74, 2, 1], [72, 3, 1]],
        [[69, 0, 1.5], [72, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
        [[72, 0, 1], [71, 1, 0.5], [69, 1.5, 0.5], [67, 2, 2]],
        [[65, 0, 1], [69, 1, 1], [72, 2, 1], [74, 3, 1]],
        [[76, 0, 2], [72, 2, 2]],
        [[70, 0, 1], [74, 1, 1], [77, 2, 1], [74, 3, 1]],
        [[72, 0, 1], [76, 1, 1], [81, 2, 1], [76, 3, 1]],
        [[70, 0, 1], [74, 1, 1], [77, 2, 1], [79, 3, 1]],
        [[76, 0, 2], [72, 2, 2]],
        [[69, 0, 1], [72, 1, 1], [74, 2, 1], [72, 3, 1]],
        [[71, 0, 1], [74, 1, 1], [71, 2, 1], [67, 3, 1]],
        [[70, 0, 1], [74, 1, 1], [77, 2, 1.5]],
        [[72, 0, 1], [76, 1, 1], [79, 2, 1], [76, 3, 1]],
        [[77, 0, 1], [81, 1, 1], [84, 2, 1], [81, 3, 1]],
        [[79, 0, 1], [76, 1, 1], [72, 2, 1], [71, 3, 1]],
        [[72, 0, 1], [69, 1, 1], [65, 2, 1], [69, 3, 1]],
        [[71, 0, 2], [74, 2, 1.5]],
        [[69, 0, 1.5], [72, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
        [[72, 0, 1], [71, 1, 0.5], [69, 1.5, 0.5], [67, 2, 2]],
        [[65, 0, 1], [69, 1, 1], [72, 2, 1], [74, 3, 1]],
        [[76, 0, 2], [72, 2, 2]]
      ],
      CTR: [
        [[72, 0, 2], [69, 2, 2]],
        [[67, 0, 2], [64, 2, 2]],
        [[69, 0, 2], [65, 2, 2]],
        [[71, 0, 2.5]],
        [[72, 0, 2], [69, 2, 2]],
        [[67, 0, 2], [64, 2, 2]],
        [[69, 0, 2], [72, 2, 2]],
        [[71, 0, 2]],
        [[69, 0, 2], [72, 2, 2]],
        [[71, 0, 2], [67, 2, 2]],
        [[65, 0, 2], [69, 2, 1.5]],
        [[67, 0, 2], [67, 2, 2]],
        [[72, 0, 2], [69, 2, 2]],
        [[67, 0, 2], [64, 2, 2]],
        [[69, 0, 2], [65, 2, 2]],
        [[69, 0, 3]],
        [[65, 0, 2], [70, 2, 2]],
        [[69, 0, 2], [72, 2, 2]],
        [[65, 0, 2], [70, 2, 2]],
        [[67, 0, 2], [64, 2, 2]],
        [[69, 0, 2], [65, 2, 2]],
        [[67, 0, 2], [62, 2, 2]],
        [[65, 0, 2], [70, 2, 1.5]],
        [[67, 0, 2], [72, 2, 2]],
        [[72, 0, 2], [69, 2, 2]],
        [[67, 0, 2], [64, 2, 2]],
        [[65, 0, 2], [69, 2, 2]],
        [[67, 0, 2], [71, 2, 2]],
        [[72, 0, 2], [69, 2, 2]],
        [[67, 0, 2], [64, 2, 2]],
        [[69, 0, 2], [65, 2, 2]],
        [[69, 0, 3]]
      ]
    }
  };

  /* Identité des 21 niveaux : transpose, tempo ±3, caractère (snow/wind/forest/volcanic/ridge/pastoral), motif. */
  var THEME_STYLE = {
    vache:     { x: -3, br: 0.94, bpm: -2, char: 'volcanic', motif: 0 },
    pariou:    { x:  0, br: 1.00, bpm:  0, char: 'volcanic', motif: 1 },
    mary:      { x:  2, br: 1.05, bpm:  2, char: 'ridge',    motif: 2 },
    muletiers: { x:  1, br: 0.95, bpm:  1, char: 'forest',   motif: 1 },
    sancy:     { x: -2, br: 1.14, bpm: -1, char: 'snow',     motif: 2 },
    chevres:   { x: -2, br: 0.92, bpm:  3, char: 'forest',   motif: 0 },
    ursuya:    { x: -1, br: 0.98, bpm: -2, char: 'pastoral', motif: 0 },
    atxuria:   { x:  1, br: 1.02, bpm:  1, char: 'ridge',    motif: 1 },
    orhy:      { x: -2, br: 1.15, bpm:  3, char: 'wind',     motif: 2 },
    rhune:     { x:  0, br: 1.00, bpm:  0, char: 'pastoral', motif: 1 },
    artzamendi:{ x:  1, br: 0.96, bpm: -3, char: 'forest',   motif: 2 },
    aizkorri:  { x: -1, br: 1.04, bpm:  2, char: 'ridge',    motif: 0 },
    txindoki:  { x:  2, br: 1.06, bpm: -1, char: 'pastoral', motif: 2 },
    poupet:    { x:  0, br: 0.96, bpm: -2, char: 'forest',   motif: 0 },
    dor:       { x:  1, br: 1.06, bpm:  1, char: 'ridge',    motif: 1 },
    van:       { x: -1, br: 1.08, bpm:  2, char: 'wind',     motif: 2 },
    colombier: { x:  2, br: 1.00, bpm:  0, char: 'pastoral', motif: 1 },
    dole:      { x:  0, br: 1.08, bpm: -1, char: 'wind',     motif: 0 },
    colomby:   { x: -2, br: 1.04, bpm:  3, char: 'ridge',    motif: 2 },
    reculet:   { x:  1, br: 1.10, bpm: -3, char: 'forest',   motif: 1 },
    neige:     { x: -1, br: 1.20, bpm:  1, char: 'snow',     motif: 2 }
  };

  function musNow() { return MUS[world] || MUS[1]; }
  var BPM = 76, BEAT = 60 / 76, CUR = MUS[1];
  function themeKey() {
    var th = (amb && amb.p && amb.p.theme) || '', k = String(th).toLowerCase();
    if (!k) { k = world === 2 ? 'rhune' : (world === 3 ? 'poupet' : 'vache'); }
    return k;
  }
  function levelStyle() {
    var k = themeKey(), st = THEME_STYLE[k], p, br;
    if (!st) { st = { x: 0, br: 1, bpm: 0, char: 'pastoral', motif: 0 }; }
    br = st.br;
    if (amb && amb.p) {
      if (amb.p.snow) { br *= 1.12; }
      if (amb.p.fog) { br *= 0.88; }
      if (amb.p.wind > 0.6) { br *= 1.08; }
    }
    p = { x: st.x, br: br, bpm: st.bpm, char: st.char, motif: st.motif, key: k };
    if (amb && amb.p && amb.p.snow && p.char === 'pastoral') { p.char = 'snow'; }
    if (amb && amb.p && amb.p.wind > 0.7 && (p.char === 'pastoral' || p.char === 'ridge')) { p.char = 'wind'; }
    return p;
  }
  function themeInfo() {
    var st = levelStyle();
    return { x: st.x, br: st.br, theme: st.key, char: st.char, bpm: st.bpm, motif: st.motif };
  }
  function refreshTempo() {
    var add = (levelStyle().bpm || 0);
    BPM = (CUR && CUR.BPM ? CUR.BPM : 76) + add;
    BEAT = 60 / BPM;
  }
  function applyWorldTheme() {
    CUR = musNow(); refreshTempo();
  }

  function progressOf() {
    var p = amb.p || {}, span, frac;
    if (p.frac != null && isFinite(p.frac)) { frac = p.frac; }
    else {
      span = Math.max(80, (p.top || 1500) - (p.low || 1000));
      frac = ((p.alt || p.low || 0) - (p.low || 0)) / span;
    }
    return clamp(frac, 0, 1);
  }

  function updateLayers(force) {
    var prog = progressOf(), m = mode, th = themeInfo(), t, wind, tgt, k;
    wind = (amb.p && amb.p.wind) || 0;
    tgt = { pad: 1, bass: 1, arp: 1, lead: 1, ctr: 0, shaker: 0, hiPad: 0, filt: 4200, xpose: th.x, bright: th.br };
    if (m === 'map') {
      tgt.pad = 1; tgt.bass = 0.75; tgt.arp = 0.9; tgt.lead = 0.55; tgt.ctr = 0; tgt.shaker = 0; tgt.hiPad = 0; tgt.filt = 3800 * th.br;
    } else if (m === 'pause') {
      tgt.pad = 0.8; tgt.bass = 0.4; tgt.arp = 0.25; tgt.lead = 0.1; tgt.ctr = 0; tgt.shaker = 0; tgt.hiPad = 0; tgt.filt = 700;
    } else if (m === 'vista') {
      tgt.pad = 1.05; tgt.bass = 0.85; tgt.arp = 0.8; tgt.lead = 1; tgt.ctr = 0.55; tgt.shaker = 0.2; tgt.hiPad = 0.7; tgt.filt = 6200 * th.br;
    } else {
      /* level */
      tgt.lead = 0.85; tgt.bass = 1; tgt.arp = 0.9; tgt.pad = 1;
      if (prog > 0.4) { tgt.ctr = 0.7; tgt.shaker = 0.55; tgt.filt = 4800 * th.br; }
      else { tgt.filt = 3400 * th.br; }
      if (prog > 0.75 || wind > 0.7) { tgt.hiPad = 0.85; tgt.filt = 6800 * th.br; tgt.pad = 1.1; tgt.lead = 1; }
      /* caractère du sommet (neige, crête venteuse, forêt, volcan) */
      if (th.char === 'snow') { tgt.bass *= 0.72; tgt.hiPad = Math.max(tgt.hiPad, 0.45); tgt.filt += 900; tgt.arp = Math.min(1.15, tgt.arp * 1.08); }
      else if (th.char === 'wind') { tgt.shaker = Math.max(tgt.shaker, 0.4); tgt.filt += 700; tgt.pad *= 0.9; }
      else if (th.char === 'forest') { tgt.filt *= 0.88; tgt.pad *= 1.1; tgt.lead *= 0.95; tgt.arp *= 0.85; tgt.bass *= 0.92; }
      else if (th.char === 'volcanic') { tgt.bass *= 1.08; tgt.filt *= 0.96; tgt.pad *= 1.04; }
      else if (th.char === 'ridge') { tgt.lead = Math.max(tgt.lead, 0.95); tgt.filt += 450; tgt.shaker = Math.max(tgt.shaker, 0.22); }
    }
    refreshTempo();
    /* lissage : jamais de coupure sèche */
    t = force ? 1 : 0.12;
    for (k in tgt) {
      if (!Object.prototype.hasOwnProperty.call(tgt, k)) { continue; }
      if (k === 'xpose') { layers.xpose = tgt.xpose; continue; }
      layers[k] += (tgt[k] - layers[k]) * (force ? 1 : t);
    }
    layerT = tgt;
    if (ac && musFilter && !isOffline) {
      musFilter.frequency.setTargetAtTime(Math.max(400, layers.filt), clk(), 0.4);
    } else if (ac && musFilter) {
      musFilter.frequency.value = Math.max(400, layers.filt);
    }
    applyWorldTone();
  }
  function applyWorldTone() {
    var kind = (MUS[world] || MUS[1]).kind;
    if (musMud) {
      musMud.frequency.value = 280; musMud.Q.value = 0.75; musMud.gain.value = -3.5;
    }
    if (padMud) {
      if (kind === 'jura') { padMud.frequency.value = 580; padMud.Q.value = 0.8; padMud.gain.value = -8.5; }
      else if (kind === 'basque') { padMud.frequency.value = 260; padMud.Q.value = 0.7; padMud.gain.value = -2.5; }
      else { padMud.frequency.value = 300; padMud.Q.value = 0.75; padMud.gain.value = -4; }
    }
    if (leadPres) {
      if (kind === 'jura') { leadPres.frequency.value = 2700; leadPres.Q.value = 0.8; leadPres.gain.value = 6.5; }
      else if (kind === 'basque') { leadPres.frequency.value = 2850; leadPres.Q.value = 0.9; leadPres.gain.value = 5; }
      else { leadPres.frequency.value = 2550; leadPres.Q.value = 0.95; leadPres.gain.value = 6.5; }
    }
    if (musHpf) {
      musHpf.frequency.value = 110;
    }
  }

  function xp(m) { return m + (layers.xpose || 0); }

  function leadVoice(f, t, d, v, kind, pan, busOpt) {
    var bus = busOpt || leadBus || musBus, lf;
    if (kind === 'puys') {
      /* ocarina : souffle d'attaque serré, corps sine+triangle, vibrato, présence via leadBus */
      noiseAt({ t: t, d: Math.min(0.06, d * 0.2), v: v * 0.2, f: 2700, q: 1.15, type: 'bandpass', bus: bus, pan: pan, pri: 1 });
      voice({ t: t, d: d, f: f, v: v, types: ['sine', 'triangle', 'sine'], det: [0, 6, 10], cut: 3800 * layers.bright, cut1: 2100, att: 0.011, dec: 0.09, sus: 0.72, rel: 0.14, bus: bus, pan: pan, vib: d > 0.35 ? 5.2 : 0, vibRate: 5.2, verb: 0.14, hpf: 240, pri: 1 });
    } else if (kind === 'basque') {
      /* txistu : attaque franche, un peu de brillance (harmonique 3), filtre plus ouvert */
      voice({ t: t, d: d, f: f, v: v, types: ['triangle', 'sine'], det: [0, 3], cut: 4800 * layers.bright, cut1: 2600, att: 0.006, dec: 0.07, sus: 0.74, rel: 0.09, bus: bus, pan: pan, vib: d > 0.4 ? 3.8 : 0, vibRate: 5.8, verb: 0.1, hpf: 280, pri: 1 });
      voice({ t: t, d: Math.min(d, 0.18), f: f * 3, v: v * 0.07, types: ['sine'], cut: 7000, cut1: 3000, att: 0.004, dec: 0.05, sus: 0.15, rel: 0.08, bus: bus, pan: pan, pri: 1 });
    } else {
      /* Rhodes plus clair : le corps sonne à l'octave si la fondamentale tomberait dans 400–800 Hz */
      lf = (f < 800) ? f * 2 : f;
      voice({ t: t, d: d, f: lf, v: v * (f < 800 ? 0.82 : 0.92), types: ['sine', 'sine'], det: [0, 8], cut: 5200 * layers.bright, cut1: 2400, att: 0.004, dec: 0.14, sus: 0.5, rel: 0.22, bus: bus, pan: pan, vib: d > 0.55 ? 2.4 : 0, vibRate: 4.6, verb: 0.14, hpf: 520, pri: 1 });
      /* partielle 2 tenue (présence 1.6–3 kHz) + tine d'attaque */
      voice({ t: t, d: d * 0.85, f: lf * 2.003, v: v * 0.16, types: ['sine'], cut: 7000 * layers.bright, cut1: 3000, att: 0.006, dec: 0.12, sus: 0.35, rel: 0.14, bus: bus, pan: pan, verb: 0.12, hpf: 900, pri: 1 });
      voice({ t: t, d: Math.min(0.2, d * 0.4), f: lf * 2.01, v: v * 0.22, types: ['sine'], cut: 7500 * layers.bright, cut1: 2800, att: 0.002, dec: 0.06, sus: 0.12, rel: 0.08, bus: bus, pan: pan, verb: 0.16, pri: 1 });
      voice({ t: t, d: d * 0.55, f: lf * 3.01, v: v * 0.055, types: ['sine'], cut: 8200, cut1: 3600, att: 0.003, dec: 0.08, sus: 0.2, rel: 0.1, bus: bus, pan: pan, pri: 1 });
      fmPadPartial(lf, t, d, v * 0.06, bus);
    }
  }

  function playGrace(midi, t, kind) {
    /* petite appoggiature (txistu) : un demi-ton ou un ton en dessous, 40 ms */
    if (kind !== 'basque') { return; }
    if (t < 0.04) { return; }
    leadVoice(mf(xp(midi - (Math.random() < 0.5 ? 1 : 2))), t - 0.038, 0.04, 0.028 * layers.lead, kind, -0.12);
  }

  function fmPadPartial(f, t, d, v, bus) {
    /* 2 opérateurs : cloche d'index haut à l'attaque, puis douce */
    var a = ac, car, mod, mg, g, fl, stopAt = t + d + 0.2, dest = bus || musBus;
    if (!a) { return; }
    car = a.createOscillator(); car.type = 'sine'; car.frequency.setValueAtTime(f, t);
    mod = a.createOscillator(); mod.type = 'sine'; mod.frequency.setValueAtTime(f * 2, t);
    mg = a.createGain(); mg.gain.setValueAtTime(f * 1.1, t); mg.gain.exponentialRampToValueAtTime(Math.max(20, f * 0.18), t + Math.min(0.28, d * 0.4));
    mod.connect(mg); mg.connect(car.frequency);
    fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2800 * layers.bright; fl.Q.value = 0.7;
    g = a.createGain();
    g.gain.setValueAtTime(rz(), t);
    g.gain.linearRampToValueAtTime(v, t + 0.006);
    g.gain.setTargetAtTime(rz(), t + d, 0.12);
    car.connect(fl); fl.connect(g); g.connect(dest);
    startOsc(car, t, stopAt, 1); startOsc(mod, t, stopAt, 1);
  }

  function schedBar(bar, t0) {
    var ch, act, i, kind, ev, evs, f, d, t, pan, root, gAmp, mid, progBusy, st, arpPat, arpSrc;
    if (!ac || !musBus) { return; }
    updateLayers();
    st = levelStyle();
    ch = CUR.CH[bar % CUR.CH.length];
    kind = CUR.kind;
    arpSrc = CUR.ARP;
    if (st.motif === 1) {
      arpPat = []; for (i = 0; i < arpSrc.length; i++) { arpPat.push((3 - (arpSrc[i] % 4) + 4) % 4); }
    } else if (st.motif === 2) {
      arpPat = [0, 3, 1, 2, 3, 1, 0, 2];
    } else { arpPat = arpSrc; }
    act = (mode === 'level' || mode === 'vista') ? 1 : (mode === 'pause' ? 0.55 : 0.7);
    mid = ch[Math.min(2, ch.length - 1)];
    root = ch[0];

    /* nappes (triangle + sine, attaque lente) */
    for (i = 1; i < Math.min(ch.length, 4); i++) {
      f = mf(xp(ch[i]));
      voice({
        t: t0, d: BEAT * 3.85, f: f, v: (kind === 'jura' ? 0.013 : 0.012) * act * layers.pad,
        types: (i <= 2 ? ['triangle', 'sine'] : ['sine']), det: [-6 + i, 7 - i],
        cut: (kind === 'jura' ? 1600 + i * 200 : 1100 + i * 220) * layers.bright, cut1: kind === 'jura' ? 1000 : 800,
        att: 0.45, dec: 0.4, sus: 0.8, rel: 0.5, bus: padBus || musBus,
        pan: (i % 2 ? 0.18 : -0.18), verb: 0.08, hpf: kind === 'jura' ? 420 : 220
      });
      if (layers.hiPad > 0.05 && i <= 3) {
        voice({
          t: t0, d: BEAT * 3.85, f: f * 2, v: 0.009 * act * layers.hiPad,
          types: ['sine'], det: [4],
          cut: 3800 * layers.bright, cut1: 2100,
          att: 0.5, dec: 0.3, sus: 0.75, rel: 0.55, bus: padBus || musBus,
          pan: (i % 2 ? -0.28 : 0.28), verb: 0.14, vib: 2.0, vibRate: 0.18, hpf: 380
        });
        if (i <= 2) {
          voice({
            t: t0, d: BEAT * 3.6, f: f * 4, v: 0.0045 * act * layers.hiPad,
            types: ['sine'], cut: 6500 * layers.bright, cut1: 2800,
            att: 0.6, rel: 0.5, bus: leadBus || musBus, pan: (i % 2 ? 0.2 : -0.2), verb: 0.12, hpf: 1200, pri: 1
          });
        }
      }
    }
    /* Jura : légère teinte Rhodes sur deux têtes d'accord (pas toutes, pour le CPU) */
    if (kind === 'jura') {
      for (i = 1; i < Math.min(3, ch.length); i++) {
        fmPadPartial(mf(xp(ch[i])), t0 + 0.01 * i, BEAT * 3.4, 0.01 * act * layers.pad, padBus || musBus);
      }
    }

    /* basse ronde */
    gAmp = 0.10 * layers.bass;
    voice({ t: t0, d: BEAT * 1.85, f: mf(xp(root - 12)), v: gAmp, types: ['sine', 'triangle'], det: [0, 5], cut: 380, cut1: 240, att: 0.014, dec: 0.2, sus: 0.65, rel: 0.2, bus: musBus, pan: 0, hpf: 40 });
    voice({ t: t0 + BEAT * 2, d: BEAT * 1.65, f: mf(xp(root - 12 + (bar % 2 ? 7 : 0))), v: gAmp * 0.82, types: ['sine', 'triangle'], det: [0, 6], cut: 400, cut1: 260, att: 0.02, dec: 0.18, sus: 0.6, rel: 0.18, bus: musBus });

    /* ttun-ttun : cordes frappées graves sur les temps forts (monde 2) */
    if (kind === 'basque' && layers.bass > 0.3) {
      for (i = 0; i < 2; i++) {
        t = t0 + i * BEAT * 2;
        voice({ t: t, d: 0.22, f: mf(xp(root - 24 + (i ? 7 : 0))), v: 0.07 * layers.bass, types: ['triangle', 'sine'], det: [0, 12], cut: 320, cut1: 140, att: 0.003, dec: 0.08, sus: 0.2, rel: 0.12, bus: musBus });
        noiseAt({ t: t, d: 0.03, v: 0.02 * layers.bass, f: 180, q: 1, type: 'lowpass', bus: musBus });
      }
    }

    /* arpège harpe / kalimba (croches), décalé stéréo */
    for (i = 0; i < 8; i++) {
      f = mf(xp(ch[1 + (arpPat[i] % Math.max(1, ch.length - 1))] + 12));
      pan = (i % 2 ? 0.25 : -0.25);
      voice({
        t: t0 + i * BEAT * 0.5, d: BEAT * 0.55, f: f, v: 0.024 * act * layers.arp,
        types: ['sine', 'triangle'], det: [0, 4],
        cut: 3200 * layers.bright, cut1: 1400,
        att: 0.003, dec: 0.1, sus: 0.18, rel: 0.1, bus: musBus, pan: pan, verb: 0.07, hpf: 250
      });
    }

    /* mélodie principale, doublée légèrement à +0.25 */
    evs = CUR.MEL[bar % CUR.MEL.length] || [];
    for (i = 0; i < evs.length; i++) {
      ev = evs[i]; if (!ev || !ev[0]) { continue; }
      t = t0 + ev[1] * BEAT; d = ev[2] * BEAT;
      f = mf(xp(ev[0]));
      if (kind === 'basque' && d >= 0.7 * BEAT) { playGrace(ev[0], t, kind); }
      leadVoice(f, t, d, (kind === 'jura' ? 0.105 : 0.11) * layers.lead, kind, -0.08);
      /* doublure à l'octave ( discrète ) + pan opposé */
      if (layers.lead > 0.3 && d > 0.2) {
        voice({ t: t, d: d * 0.9, f: f * 2.003, v: (st.char === 'snow' ? 0.03 : 0.022) * layers.lead, types: ['sine'], cut: (st.char === 'snow' ? 5200 : 4200), cut1: 2000, att: 0.012, rel: 0.12, bus: leadBus || musBus, pan: 0.25, verb: 0.1, hpf: 400, pri: 1 });
      }
      if (st.motif === 2 && d >= 0.85 * BEAT) {
        voice({ t: t + BEAT * 0.15, d: Math.min(d, BEAT * 0.7), f: f * (st.char === 'snow' ? 2.997 : 1.498), v: 0.018 * layers.lead, types: ['sine'], cut: 5400, att: 0.01, rel: 0.1, bus: leadBus || musBus, pan: -0.2, verb: 0.12, hpf: 500, pri: 1 });
      }
    }

    /* contre-mélodie tierce/sixte, fondu par layers.ctr */
    if (layers.ctr > 0.06) {
      evs = CUR.CTR[bar % CUR.CTR.length] || [];
      for (i = 0; i < evs.length; i++) {
        ev = evs[i]; if (!ev || !ev[0]) { continue; }
        t = t0 + ev[1] * BEAT; d = ev[2] * BEAT;
        leadVoice(mf(xp(ev[0])), t, d, 0.042 * layers.ctr, kind, -0.25);
      }
    }

    /* shaker / pulsation feutrée (croches) */
    if (layers.shaker > 0.05) {
      for (i = 0; i < 8; i++) {
        if (i % 2 === 0) { continue; }
        noiseAt({ t: t0 + i * BEAT * 0.5, d: 0.045, v: 0.012 * layers.shaker * act, f: 6200, q: 1.1, type: 'bandpass', pan: (i % 4 ? 0.2 : -0.2), bus: musBus });
      }
    }
  }

  function tick() {
    if (!ac || !started || isOffline) { return; }
    pruneLiveList();
    var lookahead = 1.25;
    while (nextT < ac.currentTime + lookahead) {
      if (musicOn && on && !(typeof document !== 'undefined' && document.hidden)) { schedBar(step, nextT); }
      step++; nextT += BEAT * 4;
    }
  }
  function fillUntil(tEnd) {
    if (!ac) { return; }
    if (!started) { started = true; nextT = (isOffline ? 0.05 : clk() + 0.05); step = 0; }
    while (nextT < tEnd) { schedBar(step, nextT); step++; nextT += BEAT * 4; }
  }
  function startMusic() {
    var a = ctx(); if (!a || started) { return; }
    applyWorldTheme(); updateLayers(true);
    started = true; nextT = (isOffline ? 0.08 : clk() + 0.15); step = 0;
    if (!isOffline) { timer = setInterval(tick, 250); tick(); }
  }
  function setMode(m) {
    mode = m; ambMode(m); updateLayers(false);
  }
  function setWorld(w) {
    var n = Math.max(1, Math.round(+w || 1)), t, v;
    if (n === world) { return; }
    ctx();
    world = n; applyWorldTheme();
    step = 0;
    if (ac && musBus) {
      t = clk();
      fadeUntil = t + 0.4;
      v = musGainValue();
      musBus.gain.cancelScheduledValues(t);
      musBus.gain.setTargetAtTime(rz(), t, 0.07);
      musBus.gain.setTargetAtTime(v, t + 0.28, 0.12);
      nextT = t + 0.35;
    }
    updateLayers(true);
    if (on && ac && sfxBus) { playWorldJingle(); }
  }

  /* ---------- ambiance d'altitude : lit rose bouclé, oiseaux FM, sonnailles, faune ---------- */
  var amb = { st: null, p: { on: false, alt: 1100, frac: 0, wind: 0, snow: 0, fog: 0, sun: 0, low: 1000, top: 1500, world: 1, theme: '' }, modeOn: false, modeGain: 1, nextBird: 0, nextCricket: 0, nextBell: 0, nextCry: 0, nextPottok: 0, lastTouch: 0 };
  function ambInit() {
    var a = ctx(); if (!a || amb.st) { return; }
    var buf = getPink(), bus = a.createGain(), low, hi, lfo, lg, lfo2, l2g;
    bus.gain.value = 0; bus.connect(ambBus || sfxBus || master || a.destination);
    function layer(type, f, q) {
      var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), p = makePan(a, 0);
      s.buffer = buf; s.loop = true;
      fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(p); p.connect(bus);
      startSrc(s, 0, Math.random() * 2, null, 0);
      return { s: s, f: fl, g: g, p: p };
    }
    low = layer('lowpass', 420, 0.6); hi = layer('bandpass', 1500, 0.9);
    setPan(low.p, -0.18); setPan(hi.p, 0.22);
    lfo = a.createOscillator(); lg = a.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 0; lfo.connect(lg); lg.connect(low.g.gain); lg.connect(hi.g.gain); lfo.start(); watchNode(lfo, 0);
    lfo2 = a.createOscillator(); l2g = a.createGain(); lfo2.frequency.value = 0.31; l2g.gain.value = 0; lfo2.connect(l2g); l2g.connect(hi.f.frequency); lfo2.start(); watchNode(lfo2, 0);
    amb.st = { bus: bus, low: low, hi: hi, lg: lg, l2g: l2g };
  }
  function on_() { return on; }
  function ambUpdate() {
    var a = ac; if (!a || !amb.st) { return; }
    var p = amb.p, st = amb.st, t = clk(), onv = (amb.modeOn && p.on && on_() ? 1 : 0) * amb.modeGain;
    var span = Math.max(200, p.top - p.low), hf = Math.max(0, Math.min(1, (p.alt - p.low) / span)), ab = Math.max(0, Math.min(1, (p.alt - 1000) / 900));
    var base = 0.014 + 0.055 * Math.pow(ab, 1.4) + 0.02 * hf * hf, gust = Math.min(1, p.wind) * 0.12, lvl = (base + gust) * 0.85;
    var fogM = 1 - 0.35 * p.fog;
    st.bus.gain.setTargetAtTime(onv * 1, t, 0.4);
    st.low.g.gain.setTargetAtTime(lvl * 0.85, t, 0.35);
    st.hi.g.gain.setTargetAtTime(lvl * (0.25 + 0.75 * Math.min(1, p.wind + ab * 0.5)) * 0.6, t, 0.35);
    st.low.f.frequency.setTargetAtTime(260 + 520 * Math.min(1, ab * 0.6 + p.wind * 0.8) * fogM, t, 0.4);
    st.hi.f.frequency.setTargetAtTime(900 + 1400 * Math.min(1, ab + p.wind), t, 0.4);
    st.lg.gain.setTargetAtTime(lvl * 0.28, t, 0.5);
    st.l2g.gain.setTargetAtTime(250 + 500 * Math.min(1, p.wind + ab * 0.4), t, 0.5);
    updateLayers(false);
  }
  function bird(kind) {
    var a = ac; if (!a || !on) { return; }
    var v = 0.012 + Math.random() * 0.006, f = 2300 + Math.random() * 1700, d = 0, pan = randPan(), n, i, ff, j;
    function chirp(f0, f1, dur, vol, delay) {
      var t = clk() + delay, car, mod, mg, g, p, fl, stopAt;
      car = a.createOscillator(); car.type = 'sine';
      car.frequency.setValueAtTime(f0, t);
      car.frequency.exponentialRampToValueAtTime(Math.max(200, f1), t + dur);
      /* trille FM rapide */
      mod = a.createOscillator(); mod.type = 'sine';
      mod.frequency.value = 14 + Math.random() * 16;
      mg = a.createGain(); mg.gain.value = 18 + Math.random() * 40;
      mod.connect(mg); mg.connect(car.frequency);
      fl = a.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = (f0 + f1) * 0.5; fl.Q.value = 2.2;
      g = a.createGain();
      g.gain.setValueAtTime(rz(), t);
      g.gain.linearRampToValueAtTime(vol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(rz(), t + dur);
      p = makePan(a, pan);
      car.connect(fl); fl.connect(g); g.connect(p); p.connect(ambBus || sfxBus);
      stopAt = t + dur + 0.04;
      startOsc(car, t, stopAt, 2); startOsc(mod, t, stopAt, 2);
      /* partiel très discret */
      voice({ t: t, d: dur * 0.8, f: f0 * 2.01, f1: f1 * 2.01, v: vol * 0.1, types: ['sine'], cut: 6000, att: 0.005, bus: ambBus || sfxBus, pan: pan, pri: 2 });
    }
    if (kind === 'warbler') {
      n = 3 + (Math.random() * 4 | 0);
      for (i = 0; i < n; i++) { ff = f * (1 + (Math.random() - 0.4) * 0.35); chirp(ff, ff * (1.1 + Math.random() * 0.25), 0.06 + Math.random() * 0.04, v, d); d += 0.075 + Math.random() * 0.04; }
    } else if (kind === 'tweet') {
      chirp(f * 0.8, f * 1.25, 0.1, v, 0); chirp(f * 1.3, f * 0.95, 0.13, v * 0.9, 0.16);
    } else if (kind === 'cuckoo') {
      chirp(760, 700, 0.17, v * 1.5, 0); chirp(600, 560, 0.24, v * 1.4, 0.24);
    } else if (kind === 'pipit') {
      for (j = 0; j < 3; j++) { chirp(4300 + j * 150, 3800, 0.07, v * 0.8, j * 0.11); }
    }
  }
  function ambBirds() {
    var p = amb.p, now = performance.now() / 1000, dens, gap, r, n, i;
    if (!(amb.modeOn && p.on && on) || amb.modeGain < 0.5) { return; }
    dens = Math.max(0, Math.min(1, (1750 - p.alt) / 700)) * (1 - 0.7 * p.fog) * (1 - Math.min(1, p.wind * 1.6)) * (p.snow ? 0.1 : 1);
    if (now >= amb.nextBird) {
      gap = dens > 0.05 ? 1.6 + (1 - dens) * 9 + Math.random() * 4 : 9 + Math.random() * 10;
      amb.nextBird = now + gap;
      if (dens > 0.08) { r = Math.random(); bird(r < 0.45 ? 'warbler' : r < 0.85 ? 'tweet' : (p.alt < 1350 ? 'cuckoo' : 'tweet')); }
      else if (p.alt > 1450 && p.wind < 0.4 && !p.snow && Math.random() < 0.5) { bird('pipit'); }
    }
    if (p.sun && p.alt < 1400 && p.wind < 0.5 && now >= amb.nextCricket) {
      amb.nextCricket = now + 2.5 + Math.random() * 4;
      n = 6 + (Math.random() * 6 | 0);
      for (i = 0; i < n; i++) {
        voice({ t: clk() + i * 0.035, d: 0.014, f: 5600 + Math.random() * 400, f1: 5200, v: 0.0035, types: ['sine'], cut: 7000, att: 0.002, bus: ambBus || sfxBus, pan: randPan(), pri: 2 });
      }
    }
    ambFauna(now, p, dens);
  }
  function ambFauna(now, p, dens) {
    var basque = (p.world === 2) || (p.theme && /rhune|artza|aizkorri|txindoki|orhy|atxuria|lazkua|pottok|ursuya/i.test(p.theme));
    var jura = (p.world === 3) || (p.theme && /poupet|dor|van|colombier|dole|colomby|reculet|neige|jura/i.test(p.theme));
    var quiet = p.wind > 0.65 || p.fog > 0.7, f;
    if (!quiet && now >= amb.nextBell) {
      amb.nextBell = now + ((basque || jura) ? 2.8 : 5.5) + Math.random() * ((basque || jura) ? 4.5 : 8);
      if (basque || jura || (p.alt > 900 && p.alt < 1600 && dens > 0.15)) {
        f = (jura ? 880 : (basque ? 980 : 620)) + Math.random() * (jura ? 240 : (basque ? 280 : 160));
        cowbellAt(f, (basque || jura) ? 0.032 : 0.022, 0, randPan());
        if ((basque || jura) && Math.random() < 0.6) { cowbellAt(f * 0.92, 0.018, 0.45, randPan()); }
        if (jura && Math.random() < 0.45) { cowbellAt(f * 1.18, 0.014, 0.7, randPan()); }
      }
    }
    if (basque && p.alt > 700 && !quiet && now >= amb.nextCry) {
      amb.nextCry = now + 7 + Math.random() * 10;
      if (Math.random() < 0.7) { S.cry(); }
    }
    if (basque && p.alt > 350 && p.alt < 1200 && p.wind < 0.5 && now >= amb.nextPottok) {
      amb.nextPottok = now + 12 + Math.random() * 16;
      if (Math.random() < 0.45) { S.pottok(); }
    }
  }
  var ambLast = 0;
  function ambience(p) {
    if (!ctx()) { return; } ambInit();
    for (var k in p) { if (Object.prototype.hasOwnProperty.call(p, k)) { amb.p[k] = p[k]; } }
    var now = performance.now(); if (now - ambLast < 60) { return; } ambLast = now; ambUpdate(); ambBirds();
  }
  function ambMode(m) { amb.modeOn = (m === 'level' || m === 'vista'); amb.modeGain = m === 'pause' ? 0.25 : 1; if (m === 'pause') { amb.modeOn = true; } ambUpdate(); }

  /* ---------- cinématiques : train à crémaillère + parapente ---------- */
  var cin = null, cinLast = 0, varioNext = 0;
  function cineBuf(a, len, fn) { var b = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate); fn(b.getChannelData(0), a.sampleRate); return b; }
  function cineStartTrain() {
    var a = ctx(); if (!a || cin) { return; }
    var sr = a.sampleRate, i, rail, rack, nz, masterG, chain;
    rail = cineBuf(a, 1.0, function (d) {
      var ev = [[0, 1], [0.082, 0.72], [0.5, 0.9], [0.585, 0.66]];
      ev.forEach(function (e) {
        var n0 = Math.floor(e[0] * sr), n = Math.floor(sr * 0.06), lp = 0, i2, env, w;
        for (i2 = 0; i2 < n && n0 + i2 < d.length; i2++) {
          env = Math.exp(-i2 / (sr * 0.0085)); w = Math.random() * 2 - 1; lp += (w - lp) * 0.55;
          d[n0 + i2] += (lp * 0.9 + Math.sin(i2 / sr * 2 * Math.PI * 130) * 0.7 * Math.exp(-i2 / (sr * 0.02))) * env * e[1];
        }
      });
    });
    rack = cineBuf(a, 0.5, function (d) {
      var k, n0, n, i2, env, w, lp;
      for (k = 0; k < 8; k++) {
        n0 = Math.floor((k / 8) * sr * 0.5); n = Math.floor(sr * 0.018); lp = 0;
        for (i2 = 0; i2 < n && n0 + i2 < d.length; i2++) {
          env = Math.exp(-i2 / (sr * 0.004)); w = Math.random() * 2 - 1; lp += (w - lp) * 0.7;
          d[n0 + i2] += lp * env * 0.9;
        }
      }
    });
    nz = getPink();
    masterG = a.createGain(); masterG.gain.value = 0; masterG.connect(sfxBus || master);
    function chain(buf, type, f, q, rate) {
      var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
      s.buffer = buf; s.loop = true; if (rate) { s.playbackRate.value = rate; }
      fl.type = type; fl.frequency.value = f; fl.Q.value = q || 1;
      g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(masterG); s.start(); watchNode(s, 0);
      return { s: s, f: fl, g: g };
    }
    cin = { mode: 'train', master: masterG, clack: chain(rail, 'bandpass', 1700, 0.8), thump: chain(rail, 'lowpass', 170, 0.7), rack: chain(rack, 'bandpass', 2300, 1.4), rum: chain(nz, 'lowpass', 120, 0.6), wind: chain(nz, 'bandpass', 900, 0.7, 1.4) };
  }
  function cineStartPara() {
    var a = ctx(); if (!a || cin) { return; }
    var nz = getPink(), masterG, airL, airR, flut, lfo, lg, lfo2, l2g, pL, pR;
    masterG = a.createGain(); masterG.gain.value = 0; masterG.connect(sfxBus || master);
    function air(pan, f, q) {
      var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(), p = makePan(a, pan);
      s.buffer = nz; s.loop = true;
      fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
      g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(p); p.connect(masterG); s.start(0, Math.random()); watchNode(s, 0);
      return { s: s, f: fl, g: g };
    }
    airL = air(-0.55, 380, 0.7); airR = air(0.55, 520, 0.7);
    flut = air(0, 280, 1.8);
    lfo = a.createOscillator(); lfo.frequency.value = 4.2; lg = a.createGain(); lg.gain.value = 0;
    lfo.connect(lg); lg.connect(flut.g.gain); lfo.start(); watchNode(lfo, 0);
    lfo2 = a.createOscillator(); lfo2.frequency.value = 0.7; l2g = a.createGain(); l2g.gain.value = 0;
    lfo2.connect(l2g); l2g.connect(flut.f.frequency); lfo2.start(); watchNode(lfo2, 0);
    cin = { mode: 'para', master: masterG, airL: airL, airR: airR, flut: flut, lg: lg, l2g: l2g, lfo: lfo, lfo2: lfo2 };
    varioNext = 0;
  }
  function cineEnsure(want) {
    if (cin && cin.mode !== want) { cineStopImmediate(); }
    if (!cin) { if (want === 'para') { cineStartPara(); } else { cineStartTrain(); } }
  }
  function cineStopImmediate() {
    var c = cin, keys, i;
    cin = null; if (!c) { return; }
    try { c.master.gain.setTargetAtTime(0, clk(), 0.08); } catch (e) {}
    keys = ['clack', 'thump', 'rack', 'rum', 'wind', 'airL', 'airR', 'flut', 'lfo', 'lfo2'];
    for (i = 0; i < keys.length; i++) {
      try { if (c[keys[i]] && c[keys[i]].s) { c[keys[i]].s.stop(); } } catch (e1) {}
      try { if (c[keys[i]] && c[keys[i]].stop) { c[keys[i]].stop(); } } catch (e2) {}
    }
    try { c.master.disconnect(); } catch (e3) {}
  }
  function varioBeep(lift) {
    var a = ac, now, gap, f, t;
    if (!a || lift < 0.28) { return; }
    now = (isOffline ? clk() : performance.now() / 1000);
    gap = 0.55 - 0.32 * clamp(lift, 0, 1);
    if (now < varioNext) { return; }
    varioNext = now + gap;
    t = clk();
    f = 420 + 220 * clamp(lift, 0, 1);
    voice({ t: t, d: 0.055, f: f, v: 0.025, types: ['sine'], cut: 1800, att: 0.004, rel: 0.04, bus: sfxBus, pan: 0.12, verb: 0.08 });
  }
  function cineSet(p) {
    if (!on) { if (cin) { cineStop(); } return; }
    var a = ctx(); if (!a) { return; }
    if (!isOffline) { var now = performance.now(); if (now - cinLast < 40) { return; } cinLast = now; }
    var want = (p && (p.para || p.glide)) ? 'para' : (cin && cin.mode === 'para' && !(p && p.para === 0 && p.glide === 0) ? 'para' : 'train');
    /* le train ne bascule pas en parapente simplement parce que rack === 0 : il faut p.para / p.glide */
    cineEnsure(want);
    if (!cin) { return; }
    var t = clk(), sp = Math.max(0, Math.min(1, p.speed || 0)), rk = Math.max(0, Math.min(1, p.rack || 0)), tau = 0.12, lift, air;
    cin.master.gain.setTargetAtTime(p.on === false ? 0 : 1, t, 0.25);
    if (cin.mode === 'para') {
      lift = Math.max(0, Math.min(1, p.lift != null ? p.lift : (sp * 0.4)));
      air = 0.04 + 0.09 * sp;
      cin.airL.g.gain.setTargetAtTime(air, t, 0.3);
      cin.airR.g.gain.setTargetAtTime(air * 0.92, t, 0.3);
      cin.airL.f.frequency.setTargetAtTime(300 + 200 * sp, t, 0.4);
      cin.airR.f.frequency.setTargetAtTime(420 + 260 * sp, t, 0.4);
      cin.flut.g.gain.setTargetAtTime(0.025 + 0.05 * sp, t, 0.2);
      cin.lg.gain.setTargetAtTime(0.012 + 0.03 * sp, t, 0.25);
      cin.l2g.gain.setTargetAtTime(40 + 80 * sp, t, 0.3);
      varioBeep(lift);
      return;
    }
    var rate = 0.35 + 1.05 * sp;
    cin.clack.s.playbackRate.setTargetAtTime(rate, t, tau);
    cin.thump.s.playbackRate.setTargetAtTime(rate, t, tau);
    cin.rack.s.playbackRate.setTargetAtTime(0.4 + 1.1 * sp, t, tau);
    cin.clack.g.gain.setTargetAtTime(0.085 * sp * (1 - 0.8 * rk), t, tau);
    cin.thump.g.gain.setTargetAtTime(0.2 * sp * (1 - 0.6 * rk), t, tau);
    cin.rack.g.gain.setTargetAtTime(0.09 * sp * rk, t, tau);
    cin.rum.g.gain.setTargetAtTime(0.16 * sp, t, 0.3);
    cin.wind.g.gain.setTargetAtTime(0.045 * sp * sp, t, 0.3);
  }
  function cineStop() {
    if (!cin) { return; }
    var c = cin; cin = null;
    try { c.master.gain.setTargetAtTime(0, clk(), 0.18); } catch (e) { /* contexte fermé */ }
    setTimeout(function () {
      var keys = ['clack', 'thump', 'rack', 'rum', 'wind', 'airL', 'airR', 'flut'];
      keys.forEach(function (k) { try { if (c[k] && c[k].s) { c[k].s.stop(); } } catch (e2) {} });
      try { if (c.lfo) { c.lfo.stop(); } } catch (e3) {}
      try { if (c.lfo2) { c.lfo2.stop(); } } catch (e4) {}
      try { c.master.disconnect(); } catch (e5) {}
    }, 900);
  }

  window.Sfx = {
    play: function (n) { if (S[n]) { S[n](); } },
    /* pas : kind = 'scoria' | 'grass' | 'rock' | 'wood' | 'gravel' | 'snow' | 'stone' | 'concrete' ; limité en cadence */
    step: function (kind) { var now = performance.now(); if (now - lastStepAt < 90) { return; } lastStepAt = now; var f = S['step_' + kind] || S.step_scoria; f(); },
    setOn: function (v) { on = !!v; applyMusicGain(); applySfxGain(); },
    isOn: function () { return on; },
    setMusic: function (v) { musicOn = !!v; applyMusicGain(); },
    setMusicVol: function (v) { musicVol = Math.max(0, Math.min(1, v)); applyMusicGain(); },
    setSfxVol: function (v) { sfxVol = Math.max(0, Math.min(1, v)); applySfxGain(); },
    setWorld: setWorld,
    startMusic: startMusic, mode: setMode, ambience: ambience, cine: cineSet, cineStop: cineStop,
    unlock: function () { var a = ctx(); if (a && !started) { startMusic(); } return a; },
    suspend: function () { if (ac && !isOffline && ac.state === 'running') { ac.suspend(); } },
    resume: function () { if (ac && !isOffline && ac.state === 'suspended') { ac.resume(); } },
    _state: function () { return { ac: !!ac, started: started, state: ac ? ac.state : null, mode: mode, world: world, musicOn: musicOn, vol: musicVol, sfxVol: sfxVol, bus: musBus ? musBus.gain.value : null, voices: liveList.length, voiceCap: VOICE_CAP, listCap: LIST_CAP, layers: { pad: layers.pad, lead: layers.lead, ctr: layers.ctr, shaker: layers.shaker, hiPad: layers.hiPad, filt: layers.filt, xpose: layers.xpose }, bpm: BPM, theme: themeKey(), char: (levelStyle() || {}).char, motif: (levelStyle() || {}).motif }; },
    /* hooks de QA (ne font pas partie de l'API de jeu) */
    _fill: function (tEnd) { var a = ctx(); if (!a) { return; } if (!started) { startMusic(); } fillUntil(tEnd); },
    _qaTime: function (t) { qaOff = t || 0; },
    _names: function () { var k, out = []; for (k in S) { if (Object.prototype.hasOwnProperty.call(S, k) && typeof S[k] === 'function') { out.push(k); } } return out; },
    _seekBar: function (bar, t0) { step = Math.max(0, bar | 0); nextT = (t0 != null) ? t0 : (isOffline ? 0.003 : clk() + 0.05); }
  };
  function firstGesture() { window.Sfx.unlock(); }
  ['pointerdown', 'keydown', 'touchend', 'click'].forEach(function (e) { window.addEventListener(e, firstGesture, { once: false, passive: true, capture: true }); });
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () { if (document.hidden) { window.Sfx.suspend(); } else { window.Sfx.resume(); } });
  }
})();
