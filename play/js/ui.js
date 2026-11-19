/* Interface DOM (fiches, HUD, victoire, pause, réglages). Tous les textes en français. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, A = window.Art;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); }
  function mmss(t) { var m = Math.floor(t / 60), s = Math.round(t % 60); if (s === 60) { m += 1; s = 0; } return m + ' min ' + (s < 10 ? '0' : '') + s + ' s'; }
  function mmss1(t) { t = Math.max(0, +t || 0); var m = Math.floor(t / 60), s = t - m * 60, r = s.toFixed(1).replace('.', ','); return m ? m + ' min ' + (s < 10 ? '0' : '') + r + ' s' : r + ' s'; }
  function clockTxt(t) { t = Math.max(0, +t || 0); var m = Math.floor(t / 60), s = t - m * 60, w = s.toFixed(1); return m + ':' + (s < 10 ? '0' : '') + w; }
  function deltaTxt(d) {
    if (d == null || !isFinite(d)) { return '—'; }
    if (Math.abs(d) < 0.05) { return '±0,0 s'; }
    var sign = d > 0 ? '+' : '−', s = Math.abs(d), m = Math.floor(s / 60), r = (s - m * 60).toFixed(1).replace('.', ',');
    return sign + (m ? m + ':' + (s - m * 60 < 10 ? '0' : '') + r : r + ' s');
  }
  var UI = { openModal: null, handlers: {} };
  UI.mmss = mmss; UI.mmss1 = mmss1; UI.deltaTxt = deltaTxt;
  var hintTimer = null, toastTimer = null;

  function starsHtml(n, big) { var h = '<span class="starrow' + (big ? ' big' : '') + '" aria-label="' + n + ' étoile' + (n > 1 ? 's' : '') + ' sur 3">'; for (var i = 0; i < 3; i++) { h += '<i class="st' + (i < n ? ' on' : '') + '" style="--d:' + (i * 0.28) + 's">★</i>'; } return h + '</span>'; }
  UI.starsHtml = starsHtml;
  UI.show = function (id) { $(id).classList.remove('hidden'); };
  UI.hide = function (id) { $(id).classList.add('hidden'); };

  /* ----- carte ----- */
  UI.refreshMap = function () {
    var s = window.Save.get();
    var w = (window.MapScreen && window.MapScreen.world != null) ? window.MapScreen.world() : Math.max(0, (s.world || 1) - 1);
    var worlds = window.AscensionData.WORLDS, ids = (worlds && worlds[w] && worlds[w].levels) || [];
    var nPlay = 0, nDone = 0;
    if (!ids.length) { LV.forEach(function (l, i) { ids.push(i); }); }
    ids.forEach(function (li) { if (LV[li] && LV[li].playable) { nPlay++; if (s.completed[li + 1]) { nDone++; } } });
    $('mapProgress').textContent = nDone + ' / ' + nPlay;
    $('btnMapTrain').classList.toggle('hidden', !(s.completed[6] || s.trainSeen));   // v0.5.1 : revoir le voyage en train une fois le niveau 6 terminé
    if ($('btnMapPara')) { $('btnMapPara').classList.toggle('hidden', !(s.completed[13] || s.paraSeen)); }
    UI.refreshTrailBtn();
  };
  UI.trailHint = function () {
    var n = window.Save.trailCount(), need = window.Save.trailNeed();
    return 'Mode Trail : ' + n + ' / ' + need + ' niveaux à 3★';
  };
  UI.refreshTrailBtn = function () {
    var b = $('btnMapTrail'); if (!b) { return; }
    var on = !!(window.App && App.trailMode && App.trailMode()), open = window.Save.trailUnlocked();
    b.classList.toggle('locked', !open);
    b.textContent = open ? '👻' : '🔒';
    b.setAttribute('aria-pressed', on && open ? 'true' : 'false');
    b.setAttribute('aria-label', open ? (on ? 'Mode Trail activé' : 'Mode Trail') : UI.trailHint());
    b.title = open ? (on ? 'Mode Trail activé — recliquer pour revenir au mode normal' : 'Activer le Mode Trail') : UI.trailHint();
    document.body.classList.toggle('trail-mode', !!(on && open));
  };
  UI.setTrailHud = function (h) {
    var row = $('trailHud'); if (!row) { return; }
    if (!h || !h.on) { row.classList.add('hidden'); return; }
    row.classList.remove('hidden');
    $('trailTime').textContent = clockTxt(h.time);
    var g = $('trailGap');
    if (!h.hasGhost || h.gap == null) { g.textContent = '1er passage'; g.className = 'flat'; }
    else { g.textContent = deltaTxt(h.gap); g.className = Math.abs(h.gap) < 0.05 ? 'flat' : (h.gap < 0 ? 'ahead' : 'behind'); }
  };

  /* ----- fiche de montagne ----- */
  UI.openCard = function (i) {
    var lv = LV[i], s = window.Save.get(), unlocked = i < s.unlocked, h = '', actions = '';
    if (lv.playable && !unlocked) {
      h = '<h1 id="cardTitle">' + lv.number + '. ' + esc(lv.name) + '</h1><div class="massif">' + esc(lv.massif) + ' · ' + esc(lv.place) + '</div><div class="lock-big" aria-hidden="true">🔒</div><div class="unlock"><b>Verrouillé</b><br>Termine d\u2019abord le niveau ' + (lv.number - 1) + ' (' + esc(LV[i - 1].name) + ') pour grimper ici.</div>';
      actions = '<button class="pix-btn alt" data-act="close">Fermer</button>';
    } else if (!lv.playable) {
      h = '<h1 id="cardTitle">' + (i + 1) + '. ' + esc(lv.name) + '</h1>' + (lv.route ? '<div class="massif">' + esc(lv.route) + '</div>' : '') + '<div class="lock-big" aria-hidden="true">🔒</div><div class="unlock"><b>Bientôt</b><br>Ce niveau sera jouable dans une prochaine version.</div>';
      actions = '<button class="pix-btn alt" data-act="close">Fermer</button>';
    } else {
      var f = lv.visitors, done = s.completed[lv.number], stars = window.Save.starsOf(lv.number);
      h += '<h1 id="cardTitle">' + lv.number + '. ' + esc(lv.name) + '</h1><div class="massif">' + esc(lv.massif) + ' · ' + esc(lv.place) + '</div>';
      h += '<div class="facts">';
      h += '<div class="fact"><b>ALTITUDE</b><span>' + fmt(lv.altitude) + ' m<span class="note">' + (lv.altitudeStart != null ? ('Départ ≈ ' + fmt(lv.altitudeStart) + ' m (' + (lv.startLabel || 'parking') + ')') : 'Départ : voir la fiche du parcours') + (lv.altitudeNote ? ' · ' + esc(lv.altitudeNote) : '') + '</span></span></div>';
      h += '<div class="fact"><b>DIFFICULTÉ</b><span><span class="stars">' + '★'.repeat(lv.difficulty.stars) + '☆'.repeat(lv.difficulty.of - lv.difficulty.stars) + '</span> ' + esc(lv.difficulty.label) + '<span class="note">' + esc(lv.difficulty.note) + '</span></span></div>';
      h += '<div class="fact"><b>PARCOURS</b><span>' + lv.hike.distanceKm + ' km · ' + lv.hike.ascentM + ' m de dénivelé · ' + esc(lv.hike.duration) + '<span class="note">' + esc(lv.number === 1 ? 'Boucle de randonnée réelle, Département du Puy-de-Dôme' : lv.hike.note) + '</span></span></div>';
      h += '<div class="fact"><b>1RE ASCENSION</b><span>' + esc(lv.firstAscent.value) + '<span class="note">' + esc(lv.firstAscent.note) + '</span></span></div>';
      h += '<div class="fact"><b>FRÉQUENTATION</b><span>' + esc(f.value) + (f.year ? ' (' + f.year + ')' : '') + (f.isEstimate ? '<span class="tag">ESTIMATION</span>' : '') + '<span class="note">' + esc(f.note) + '</span></span></div>';
      h += '</div>';
      h += '<h3>HISTOIRE DE LA MONTAGNE</h3>' + lv.story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
      h += '<h3>MISSION</h3><p>' + (lv.mission || 'Grimpe jusqu\u2019au sommet sans tomber. Saute par-dessus les <b>rochers</b> qui bloquent le chemin et les <b>pierres qui dévalent</b> la pente. Chaque saut te fatigue : garde de l\u2019eau, <b>1 ou 2 bouteilles</b> t\u2019attendent selon ta vitesse.') + '</p>';
      h += '<h3>OBJECTIF ÉTOILES</h3><p>1 à 3 ★ selon ton <b>temps</b>, l\u2019<b>eau restante</b> et les <b>coups reçus</b>.' + (stars ? ' Ton record : ' + starsHtml(stars) : '') + '</p>';
      if (lv.carnet) {
        var fd = window.Save.foundOf(lv.number), nf = lv.carnet.filter(function (c) { return fd[c.id]; }).length;
        h += '<h3>CARNET DE TERRAIN (' + nf + ' / ' + lv.carnet.length + ')</h3><p class="note">Trois objets cachés dans le niveau (en hauteur : il faut sauter). Chacun révèle une anecdote réelle.</p>';
        h += lv.carnet.map(function (c) {
          return fd[c.id] ? '<div class="carnet-item"><b>◆ ' + esc(c.name) + '</b><p>' + esc(c.text) + '</p><span class="note">Source : <a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.src) + '</a></span></div>'
                          : '<div class="carnet-item locked"><b>◇ ???</b><p>Objet encore caché dans le niveau.</p></div>';
        }).join('');
      }
      h += UI.enjeuxHtml(lv);
      h += '<h3>SOURCES</h3><ul class="sources">' + lv.sources.map(function (r) { return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.label) + '</a></li>'; }).join('') + '</ul>';
      if (done) { h += '<div class="unlock">✔ Meilleur temps : ' + mmss(done.time) + (stars ? ' · ' + starsHtml(stars) : '') + '</div>'; }
      var trOpen = window.Save.trailUnlocked(), trOn = !!(window.App && App.trailMode && App.trailMode());
      if (trOpen) {
        var gh = window.Save.ghostOf(lv.number);
        h += gh ? '<div class="unlock">👻 Fantôme : ' + mmss1(gh.t) + '</div>' : '<div class="unlock">👻 Pas encore de fantôme — ce premier passage en Mode Trail enregistrera ton temps.</div>';
      }
      var playLbl = trOn && trOpen ? 'Lancer le Trail' : (done ? 'Rejouer' : 'Grimper !');
      actions = '<button class="pix-btn" data-act="play" id="btnPlay">' + playLbl + '</button>';
      if (trOpen) { actions += '<button class="pix-btn alt" data-act="trail" id="btnCardTrail">👻 Mode Trail</button>'; }
      actions += (done && lv.number === 6 ? '<button class="pix-btn alt" data-act="train">🚂 Revoir le voyage</button>' : '') + '<button class="pix-btn alt" data-act="close">Fermer</button>';
    }
    $('cardBody').innerHTML = h; $('cardBody').scrollTop = 0; $('cardActions').innerHTML = actions;
    UI.show('card'); UI.openModal = 'card'; UI.cardIndex = i;
    var b = $('btnPlay') || $('cardActions').querySelector('button'); if (b) { b.focus({ preventScroll: true }); }
  };
  /* ----- v0.3.0 : sources par indice, enjeux, inventaire, briefing ----- */
  function srcRef(lv, k) { if (typeof k === 'string') { var p = k.split('.'); return LV[+p[0] - 1].sources[+p[1]]; } return lv.sources[k]; }
  function srcLinks(lv, arr) {
    if (!arr || !arr.length) { return '<span class="note">Pas de source chiffrée dans notre documentation.</span>'; }
    return '<span class="note">Sources : ' + arr.map(function (k) { var r = srcRef(lv, k); return r ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.label.split(' — ')[0]) + '</a>' : ''; }).filter(Boolean).join(' · ') + '</span>';
  }
  UI.enjeuxHtml = function (lv) {
    if (!lv.info || !lv.info.enjeux) { return ''; }
    return '<h3>ENJEUX ENVIRONNEMENTAUX</h3><ul class="enjeux">' + lv.info.enjeux.map(function (e) { return '<li>' + esc(e.t) + '<br>' + srcLinks(lv, e.s) + '</li>'; }).join('') + '</ul>';
  };
  function invWorldOf(lv) { return lv.world || (lv.number <= 6 ? 1 : lv.number <= 13 ? 2 : 3); }
  function invFilterVal() { return window.Save.invFilter ? window.Save.invFilter() : 'all'; }
  UI.setInvFilter = function (v) {
    if (window.Save.setInvFilter) { window.Save.setInvFilter(v); }
    UI.openInventory(UI.invFrom);
  };
  UI.invView = UI.invView || 'carnet';
  UI.openInventory = function (from) {
    if ($('inventory')) { $('inventory').classList.remove('inv-pc'); }
    var s = window.Save.get(), filt = invFilterVal();
    var left = 0, tot = 0, found = 0;
    var wTot = { all: 0, '1': 0, '2': 0, '3': 0 }, wFound = { all: 0, '1': 0, '2': 0, '3': 0 };
    var view = UI.invView === 'career' ? 'career' : 'carnet';
    function viewTabs() {
      return '<div class="inv-views" role="tablist" aria-label="Vue de l\u2019inventaire">' +
        '<button type="button" class="inv-view' + (view === 'carnet' ? ' on' : '') + '" data-inv-view="carnet" role="tab" aria-selected="' + (view === 'carnet' ? 'true' : 'false') + '">Carnet de terrain</button>' +
        '<button type="button" class="inv-view' + (view === 'career' ? ' on' : '') + '" data-inv-view="career" role="tab" aria-selected="' + (view === 'career' ? 'true' : 'false') + '">Carri\u00e8re &amp; Cartes</button>' +
        '</div>';
    }
    if (view === 'career') {
      var hC = '<h1 id="invTitle">Carri\u00e8re &amp; Cartes</h1>' + viewTabs();
      if (UI.invCareerPc) {
        var lvP = null;
        LV.forEach(function (lv) { if (lv.number === UI.invCareerPc) { lvP = lv; } });
        if (!lvP || !s.completed[lvP.number]) { UI.invCareerPc = null; }
      }
      if (UI.invCareerPc) {
        var lvP2 = null;
        LV.forEach(function (lv) { if (lv.number === UI.invCareerPc) { lvP2 = lv; } });
        var recP = s.completed[lvP2.number] || {};
        var stP = s.stars[lvP2.number] || 0;
        hC += '<div class="career-pc"><button type="button" class="pix-btn alt small" id="btnCareerBack">Retour \u00e0 la carri\u00e8re</button>';
        var pcTitle = lvP2.name;
        if (lvP2.number === 4) { pcTitle = 'Puy de Dôme · Muletiers'; }
        else if (lvP2.number === 6) { pcTitle = 'Puy de Dôme · Chèvres'; }
        hC += '<h2>' + esc(pcTitle) + ' \u00b7 ' + fmt(lvP2.altitudeEnd || lvP2.altitude) + ' m</h2>';
        if (window.Postcard) { hC += window.Postcard.html('invPcCv'); }
        hC += '</div>';
        $('invBody').innerHTML = hC; $('invBody').scrollTop = 0;
        UI.invFrom = from || UI.invFrom || null; UI.show('inventory'); UI.openModal = 'inventory';
        if ($('inventory')) { $('inventory').classList.add('inv-pc'); }
        if (window.Postcard) { window.Postcard.mount('invPcCv', lvP2, { time: recP.time || 0, water: recP.water || 0 }, stP); }
        var bb = $('btnCareerBack'); if (bb) { bb.addEventListener('click', function () { Sfx.play('ui'); UI.invCareerPc = null; UI.openInventory(UI.invFrom); }); }
        [].forEach.call($('invBody').querySelectorAll('[data-inv-view]'), function (b) {
          b.addEventListener('click', function () { Sfx.play('ui'); UI.invView = b.getAttribute('data-inv-view'); UI.invCareerPc = null; UI.openInventory(UI.invFrom); });
        });
        if (bb) { bb.focus({ preventScroll: true }); }
        return;
      }
      var doneN = 0, starN = 0, objGot = 0, objTot = 0, dplus = 0;
      var worlds = (window.AscensionData && AscensionData.WORLDS) || [];
      var groups = { 1: '', 2: '', 3: '' };
      LV.forEach(function (lv) {
        if (!lv.playable) { return; }
        var w = invWorldOf(lv);
        var hasCarnet = !!(lv.carnet && lv.carnet.length);
        var fd = window.Save.foundOf(lv.number);
        if (hasCarnet) {
          objTot += lv.carnet.length;
          lv.carnet.forEach(function (c) { if (fd[c.id]) { objGot += 1; } });
        }
        var rec = s.completed[lv.number];
        var st = s.stars[lv.number] || 0;
        starN += st;
        if (rec) {
          doneN += 1;
          if (lv.hike && lv.hike.ascentM) { dplus += lv.hike.ascentM; }
        }
        var gp = window.Save.ghostPacked ? window.Save.ghostPacked(lv.number) : (s.ghosts && s.ghosts[lv.number]);
        var trailT = gp && gp.t;
        var starsTxt = '—', si, starG = '';
        if (rec) {
          for (si = 0; si < 3; si++) { starG += si < st ? '\u2605' : '\u2606'; }
          starsTxt = '<span class="cl-stars">' + starG + '</span>';
        }
        var timeTxt = rec ? ('Normal ' + mmss(rec.time || 0)) : 'À faire';
        if (rec && trailT) { timeTxt += ' · Trail ' + mmss(trailT); }
        var row = '<div class="career-lv' + (rec ? '' : ' todo') + '">';
        var clName = lv.name;
        if (lv.number === 4) { clName = 'Puy de Dôme · Muletiers'; }
        else if (lv.number === 6) { clName = 'Puy de Dôme · Chèvres'; }
        row += '<div class="cl-name">' + lv.number + '. ' + esc(clName) + '</div>';
        row += '<div class="cl-meta">' + starsTxt + ' · ' + timeTxt + '</div>';
        if (rec) { row += '<button type="button" class="pix-btn small" data-career-pc="' + lv.number + '">Carte postale</button>'; }
        row += '</div>';
        groups[w] = (groups[w] || '') + row;
      });
      hC += '<div class="career-recap">';
      hC += '<div class="career-stat"><b>' + doneN + ' / 21</b><span>Sommets</span></div>';
      hC += '<div class="career-stat"><b>' + starN + ' / 63</b><span>Étoiles</span></div>';
      hC += '<div class="career-stat"><b>' + objGot + ' / ' + objTot + '</b><span>Objets du carnet</span></div>';
      hC += '<div class="career-stat"><b>' + (dplus ? (String(dplus).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' m') : '—') + '</b><span>D+ cumulé</span></div>';
      hC += '</div>';
      var wNames = { 1: 'Monde 1 · Puys', 2: 'Monde 2 · Pays basque', 3: 'Monde 3 · Jura' };
      if (worlds[0] && worlds[0].name) { wNames[1] = 'Monde 1 · ' + worlds[0].name; }
      if (worlds[1] && worlds[1].name) { wNames[2] = 'Monde 2 · ' + worlds[1].name; }
      if (worlds[2] && worlds[2].name) { wNames[3] = 'Monde 3 · ' + worlds[2].name; }
      [1, 2, 3].forEach(function (w) {
        hC += '<section class="career-world"><h3>' + esc(wNames[w]) + '</h3>' + (groups[w] || '<p class="note">Aucun sommet.</p>') + '</section>';
      });
      $('invBody').innerHTML = hC; $('invBody').scrollTop = 0;
      UI.invFrom = from || UI.invFrom || null; UI.show('inventory'); UI.openModal = 'inventory';
      [].forEach.call($('invBody').querySelectorAll('[data-inv-view]'), function (b) {
        b.addEventListener('click', function () { Sfx.play('ui'); UI.invView = b.getAttribute('data-inv-view'); UI.invCareerPc = null; UI.openInventory(UI.invFrom); });
      });
      [].forEach.call($('invBody').querySelectorAll('[data-career-pc]'), function (b) {
        b.addEventListener('click', function () { Sfx.play('ui'); UI.invCareerPc = +b.getAttribute('data-career-pc'); UI.openInventory(UI.invFrom); });
      });
      var focusC = $('invBody').querySelector('.inv-view.on') || $('btnInvClose');
      if (focusC) { focusC.focus({ preventScroll: true }); }
      return;
    }
    var body = '';
    LV.forEach(function (lv) {
      if (!lv.playable) { return; }
      var w = String(invWorldOf(lv));
      var hasCarnet = !!(lv.carnet && lv.carnet.length);
      var fd = window.Save.foundOf(lv.number), open = lv.number <= s.unlocked;
      var got = hasCarnet ? lv.carnet.filter(function (c) { return fd[c.id]; }).length : 0;
      var all = hasCarnet ? lv.carnet.length : 0;
      if (open && hasCarnet) {
        tot += all; found += got; left += all - got;
        wTot.all += all; wFound.all += got; wTot[w] += all; wFound[w] += got;
      }
      if (filt !== 'all' && w !== filt) { return; }
      if (!hasCarnet && filt === 'all') { return; }
      var pct = all ? Math.round(got / all * 100) : 0;
      body += '<section class="inv-level' + (open && hasCarnet && got === all ? ' done' : '') + (open ? '' : ' locked-lv') + '">';
      body += '<header class="inv-level-head"><h3>' + lv.number + '. ' + esc(lv.name) + '</h3>';
      if (hasCarnet) {
        body += '<div class="inv-mini"><span class="inv-mini-lbl">' + (open ? (got + ' / ' + all) : 'Verrouillé') + '</span>';
        body += '<div class="inv-gauge mini" role="progressbar" aria-valuemin="0" aria-valuemax="' + all + '" aria-valuenow="' + (open ? got : 0) + '"><i style="width:' + (open ? pct : 0) + '%"></i></div></div></header>';
      } else {
        body += '<div class="inv-mini"><span class="inv-mini-lbl">Bientôt</span></div></header>';
      }
      if (!open) { body += '<p class="note">Termine le niveau précédent pour débloquer ce carnet.</p></section>'; return; }
      if (!hasCarnet) { body += '<p class="note">Les objets cachés de ce sommet arriveront dans une prochaine version.</p></section>'; return; }
      lv.carnet.forEach(function (c) {
        var m = (window.AscensionData.CARNET_INFO || {})[c.id] || {};
        var icon = c.icon || m.icon || '◆';
        var where = c.where || m.where || lv.name;
        var why = c.why || m.why || c.text;
        if (fd[c.id]) {
          body += '<div class="carnet-item inv found"><span class="inv-ico" aria-hidden="true">' + icon + '</span><div><div class="inv-item-head"><b>' + esc(c.name) + '</b><em class="inv-badge got">Trouvé</em></div><p><span class="inv-k">Trouvé</span> ' + esc(where) + '</p><p><span class="inv-k">Pourquoi il est là</span> ' + esc(why) + '</p>';
          if (c.url && c.src) { body += '<span class="note">Source : <a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.src) + '</a></span>'; }
          body += '</div></div>';
        } else {
          body += '<div class="carnet-item inv locked"><span class="inv-ico" aria-hidden="true">?</span><div><div class="inv-item-head"><b>Objet caché</b><em class="inv-badge hid">À trouver</em></div><p>Il est caché en hauteur dans ce niveau : il faut sauter pour l\u2019atteindre.</p></div></div>';
        }
      });
      body += '</section>';
    });
    var shownTot = filt === 'all' ? tot : wTot[filt];
    var shownFound = filt === 'all' ? found : wFound[filt];
    var shownLeft = shownTot - shownFound;
    function tab(id, name) {
      var on = filt === id, c = wTot[id] ? (wFound[id] + ' / ' + wTot[id]) : 'Bientôt';
      return '<button type="button" class="inv-world' + (on ? ' on' : '') + '" data-inv-world="' + id + '" role="tab" aria-selected="' + (on ? 'true' : 'false') + '"><span class="iw-name">' + name + '</span><span class="iw-count">' + c + '</span></button>';
    }
    var h = '<h1 id="invTitle">Inventaire</h1>' + viewTabs();
    h += '<div class="inv-worlds" role="tablist" aria-label="Choisir le monde">';
    h += tab('all', 'Tous') + tab('1', 'Monde 1 · Puys') + tab('2', 'Monde 2 · Pays basque') + tab('3', 'Monde 3 · Jura');
    h += '</div>';
    h += '<div class="inv-summary"><div class="inv-summary-top"><b>Carnet de terrain</b><span class="inv-summary-count">' + (shownTot ? (shownFound + ' / ' + shownTot) : '—') + '</span></div>';
    h += '<div class="inv-gauge big" role="progressbar" aria-label="Objets du carnet" aria-valuemin="0" aria-valuemax="' + shownTot + '" aria-valuenow="' + shownFound + '"><i style="width:' + (shownTot ? Math.round(shownFound / shownTot * 100) : 0) + '%"></i></div>';
    var note;
    if (!shownTot) { note = 'Les objets cachés de ce monde arriveront dans une prochaine version.'; }
    else if (shownLeft === 0) { note = 'Tu as trouvé tous les objets cachés des niveaux débloqués' + (filt === 'all' ? '.' : ' de ce monde.'); }
    else { note = (shownLeft === 1 ? '1 objet encore caché sur les niveaux débloqués' : shownLeft + ' objets encore cachés sur les niveaux débloqués') + (filt === 'all' ? '.' : ' de ce monde.'); }
    h += '<p class="inv-summary-note">' + note + '</p></div>';
    h += body;
    $('invBody').innerHTML = h; $('invBody').scrollTop = 0;
    UI.invFrom = from || null; UI.show('inventory'); UI.openModal = 'inventory';
    [].forEach.call($('invBody').querySelectorAll('[data-inv-world]'), function (b) {
      b.addEventListener('click', function () { Sfx.play('ui'); UI.setInvFilter(b.getAttribute('data-inv-world')); });
    });
    [].forEach.call($('invBody').querySelectorAll('[data-inv-view]'), function (b) {
      b.addEventListener('click', function () { Sfx.play('ui'); UI.invView = b.getAttribute('data-inv-view'); UI.invCareerPc = null; UI.openInventory(UI.invFrom); });
    });
    var focusBtn = $('invBody').querySelector('.inv-world.on') || $('btnInvClose');
    if (focusBtn) { focusBtn.focus({ preventScroll: true }); }
  };
  if (!UI._invKeys) {
    UI._invKeys = true;
    document.addEventListener('keydown', function (e) {
      if (UI.openModal !== 'inventory') { return; }
      var k = e.key, dest = null;
      if (k === 'c' || k === 'C' || k === '4') {
        e.preventDefault();
        if (window.Sfx) { Sfx.play('ui'); }
        UI.invView = 'career'; UI.invCareerPc = null; UI.openInventory(UI.invFrom);
        return;
      }
      if (k === '0' || k === 't' || k === 'T') { dest = 'all'; }
      else if (k === '1' || k === '2' || k === '3') { dest = k; }
      if (!dest) { return; }
      e.preventDefault();
      if (window.Sfx) { Sfx.play('ui'); }
      UI.invView = 'carnet'; UI.invCareerPc = null;
      UI.setInvFilter(dest);
    });
  }
  UI.closeInventory = function () {
    UI.hide('inventory'); UI.openModal = UI.invFrom === 'pause' ? 'pause' : null;
    if (UI.invFrom === 'pause') { var b = $('btnResume'); if (b) { b.focus({ preventScroll: true }); } }
    UI.invFrom = null;
  };
  UI.openBriefing = function (i) {
    var lv = LV[i], inf = lv.info, h = '<h1 id="briefTitle">Briefing</h1><div class="massif">' + esc(lv.name) + ' · ' + fmt(lv.altitude) + ' m</div>';
    h += '<h3>OBJECTIFS</h3>';
    if (inf && inf.required) { h += inf.required.map(function (r) { return '<div class="carnet-item"><b>' + (r.id === 'water' ? '💧 ' : '◆ ') + esc(r.name) + (r.count ? ' × ' + r.count : '') + '</b><p>' + esc(r.text) + '</p></div>'; }).join(''); }
    h += '<p class="note">Atteins aussi le sommet. D\u2019autres objets sont cachés dans le niveau : à toi de les trouver !</p>';
    h += '<h3>OBSTACLES</h3>';
    if (inf && inf.obstacles) { h += inf.obstacles.map(function (o) { return '<div class="carnet-item"><b>' + o.icon + ' ' + esc(o.name) + '</b><p><i>En réalité :</i> ' + esc(o.real) + '</p>' + srcLinks(lv, o.src) + '</div>'; }).join(''); }
    $('briefBody').innerHTML = h; $('briefBody').scrollTop = 0;
    UI.show('briefing'); UI.openModal = 'briefing'; UI.briefIndex = i; $('btnGo').focus({ preventScroll: true });
  };
  UI.closeBriefing = function () { UI.hide('briefing'); if (UI.openModal === 'briefing') { UI.openModal = null; } };
  UI.closeCard = function () { UI.hide('card'); if (UI.openModal === 'card') { UI.openModal = null; } };

  /* ----- victoire ----- */
  UI.openVictory = function (stats, lv, firstTime, stars, parts, newBest) {
    var next = LV[lv.number], h = '';
    h += '<h1>Sommet atteint !</h1><div class="massif">' + esc(lv.name) + ' · ' + fmt(lv.altitude) + ' m</div>';
    if (stars) {
      h += '<div class="starbox">' + starsHtml(stars, true) + (newBest ? '<div class="newbest">Nouveau record !</div>' : '') + '</div>';
      if (parts) {
        var lab = ['✗', '½', '✔'];
        var lives0 = (lv.play && lv.play.lives) || 3;
        var heartsLeft = Math.max(0, lives0 - (stats.hits || 0));
        h += '<div class="crit"><span>Temps ' + lab[parts.time] + '</span><span>Eau restante ' + lab[parts.water] + ' (' + stats.waterLeft + ' %)</span><span>Cœurs restants ' + lab[parts.hits] + ' (' + heartsLeft + ' / ' + lives0 + ')</span></div>';
      }
    }
    if (stats.trail) {
      var cls = stats.trailGap == null ? 'flat' : (stats.trailGap < -0.05 ? 'ahead' : (stats.trailGap > 0.05 ? 'behind' : 'flat'));
      var line = stats.trailHadGhost ? ('Écart avec le fantôme : <span class="delta ' + cls + '">' + deltaTxt(stats.trailGap) + '</span>') : 'Premier passage en Mode Trail.';
      var recMsg = stats.trailNew ? (stats.trailHadGhost ? 'Nouveau record ! Le fantôme a été remplacé.' : 'Ce temps devient le fantôme à battre.') : (stats.trailHadGhost ? 'Le fantôme conserve son meilleur temps (' + mmss1(stats.trailGhostT) + ').' : '');
      h += '<div class="trail-result"><b>Mode Trail</b>' + line + (recMsg ? '<div class="newrec">' + recMsg + '</div>' : '') + '</div>';
    }
    if (stats.trailJustUnlocked) { h += '<div class="unlock"><b>Mode Trail débloqué !</b><br>Affronte le fantôme de ton meilleur temps sur chaque sommet.</div>'; }
    h += '<div class="stat-row"><div class="stat"><b>' + mmss(stats.time) + '</b><span>Temps</span></div><div class="stat"><b>' + stats.bottles + ' / ' + (stats.bottlesTotal || 2) + '</b><span>Bouteilles</span></div><div class="stat"><b>' + stats.falls + '</b><span>Chutes</span></div><div class="stat"><b>' + Math.max(0, ((lv.play && lv.play.lives) || 3) - (stats.hits || 0)) + ' / ' + ((lv.play && lv.play.lives) || 3) + '</b><span>Cœurs restants</span></div>' + (stats.jumps != null ? '<div class="stat"><b>' + stats.jumps + '</b><span>Sauts</span></div>' : '') + (lv.play.crumble ? '<div class="stat"><b>' + (stats.crumbled || 0) + '</b><span>Sols effondrés</span></div>' : '') + '</div>';
    h += '<div class="win-fold-pad" aria-hidden="true"></div>';
    if (window.Profile) { h += '<h3 class="prof-title">TON PROFIL</h3>' + window.Profile.html('profCv') + '<div class="win-fold-after-prof" aria-hidden="true"></div>'; }
    if (window.Postcard) { h += '<h3>CARTE POSTALE</h3>' + window.Postcard.html('pcCv'); }
    if (lv.carnet) { var fd2 = window.Save.foundOf(lv.number), n2 = lv.carnet.filter(function (c) { return fd2[c.id]; }).length; h += '<p class="note">Carnet de terrain : ' + n2 + ' / ' + lv.carnet.length + ' objets trouvés.</p>'; }
    h += '<h3>L\u2019HISTOIRE EN BREF</h3><p>' + esc(lv.recap) + '</p><p class="note">Première ascension : ' + esc(lv.firstAscent.value) + ' · Fréquentation : ' + esc(lv.visitors.value) + (lv.visitors.year ? ' (' + lv.visitors.year + (lv.visitors.isEstimate ? ', estimation' : '') + ')' : '') + '.</p>';
    if (next) { h += next.playable ? '<div class="unlock"><b>Niveau ' + next.number + ' débloqué</b><br>' + esc(next.name) + ' — <i>à grimper dès maintenant</i></div>' : '<div class="unlock"><b>Prochain niveau : ' + next.number + '</b><br>' + esc(next.name) + ' — <i>Bientôt</i></div>'; }
    $('victoryBody').innerHTML = h; $('victoryBody').scrollTop = 0; UI.show('victory'); if (window.Profile) { window.Profile.mount('profCv', lv); } if (window.Postcard) { window.Postcard.mount('pcCv', lv, stats, stars); } UI.openModal = 'victory';
    var sV = window.Save.get(), nextOk = !!(next && next.playable && next.number <= sV.unlocked);
    var bn = $('btnNextSummit'), br = $('btnReplay');
    if (bn) {
      bn.classList.toggle('hidden', !nextOk);
      bn.classList.toggle('alt', false);
      if (nextOk) { bn.textContent = 'Sommet suivant'; }
    }
    if (br) { br.classList.toggle('alt', !!nextOk); }
    var focusWin = (nextOk && bn) ? bn : (br || $('btnBackMap'));
    if (focusWin) { focusWin.focus({ preventScroll: true }); }
  };

  /* ----- HUD ----- */
  var heartCanvases = [];
  UI.initHud = function () {
    var cv = $('bottleIcon'), bi = cv.getContext('2d'); bi.clearRect(0, 0, cv.width, cv.height); A.drawBottle(bi, cv.width / 2, cv.height / 2 + 2, 30, false, 0);
  };
  UI.setHud = function (h) {
    var box = $('hearts'); if (box.children.length !== h.maxLives) {
      box.innerHTML = ''; for (var i = 0; i < h.maxLives; i++) { var c = document.createElement('canvas'); c.width = 48; c.height = 44; box.appendChild(c); }
    }
    for (var j = 0; j < h.maxLives; j++) { var cx = box.children[j].getContext('2d'); cx.clearRect(0, 0, 48, 44); A.drawHeart(cx, 24, 20, 14, j < h.lives); }
    var pct = Math.round(Math.max(0, Math.min(1, +h.water || 0)) * 100);
    $('waterFill').style.width = pct + '%';
    /* une seule valeur, courte, pour éviter le chevauchement EAU/% / 97 sur Android (pastille étroite, fonte pixel) */
    $('waterLbl').textContent = pct + '%';
    $('waterBar').classList.toggle('low', pct <= 20);
    $('waterBar').setAttribute('aria-label', 'Eau ' + pct + ' pour cent');
    var fc = $('findChip'); if (fc) { fc.classList.toggle('hidden', !h.findsTotal); var narrow = window.innerWidth < 700; fc.textContent = (narrow ? '◆ ' : 'CARNET ') + (h.finds || 0) + '/' + (h.findsTotal || 0); }
    if (h.altTop) { $('altTop').textContent = fmt(h.altTop) + ' m'; }
    $('altLbl').textContent = fmt(h.alt) + ' m'; $('progFill').style.width = Math.round(h.progress * 100) + '%';
    var rc = $('routeChip'), lv = window.Game && Game.level && Game.level(), label = '';
    if (lv) {
      if (lv.number === 4) { label = 'Puy de Dôme · Muletiers'; }
      else if (lv.number === 6) { label = 'Puy de Dôme · Chèvres'; }
    }
    if (rc) {
      if (label) { rc.textContent = label; rc.classList.remove('hidden'); }
      else { rc.textContent = ''; rc.classList.add('hidden'); }
    }
  };
  UI.hint = function (t, id) {
    var el = $('hint'); if (!t) { el.classList.add('hidden'); return; }
    var hp = (window.Game.level() || LV[0]).play.hintsPad; if (id && hp && hp[id] && window.Input && window.Input.mode() === 'pad') { t = hp[id]; }
    el.textContent = t; el.classList.remove('hidden');
  };
  UI.gtoast = function (t) {
    var el = $('gtoast'); el.textContent = t; el.classList.remove('hidden'); el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(UI._gt); UI._gt = setTimeout(function () { el.classList.add('hidden'); }, 2600);
  };
  UI.toast = function (t) {
    var el = $('toast'); el.textContent = t; el.classList.remove('hidden'); el.style.top = '';
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.add('hidden'); }, 2200);
  };

  /* ----- choix du personnage (aperçus animés) ----- */
  var CHAR_CARDS = [['cardBoy', 'boy'], ['cardGirl', 'girl'], ['cardGirl2', 'girl2'], ['cardBoy2', 'boy2'], ['cardBoy3', 'boy3'], ['cardGirl3', 'girl3']];
  var csRaf = 0, csSel = 'boy', csDone = null, csT0 = 0;
  function csDraw(ts) {
    csRaf = requestAnimationFrame(csDraw);
    var t = (ts - csT0) / 1000;
    CHAR_CARDS.forEach(function (d) {
      var cv = $(d[0]).querySelector('canvas'), c = cv.getContext('2d'), W = cv.width, H = cv.height, sel = csSel === d[1];
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
      var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fb4e6'); g.addColorStop(0.62, '#f6d2c4'); g.addColorStop(1, '#ffe2bd'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // sommets lointains + sol
      c.beginPath(); c.moveTo(0, H * 0.62); c.lineTo(W * 0.22, H * 0.44); c.lineTo(W * 0.42, H * 0.6); c.lineTo(W * 0.66, H * 0.38); c.lineTo(W * 0.9, H * 0.58); c.lineTo(W, H * 0.52); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fillStyle = '#9d96cf'; c.fill();
      var gy = H * 0.84; c.fillStyle = '#6a3a34'; c.fillRect(0, gy, W, H - gy); c.fillStyle = '#c0644a'; c.fillRect(0, gy, W, 5); c.fillStyle = 'rgba(255,220,170,.8)'; c.fillRect(0, gy, W, 1.6);
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      var moving = sel, sc = H / 34, ph = t * 6.8, k = moving ? 1 : 0;
      A.drawHiker(c, { x: W / 2, y: gy + 2, face: 1, char: d[1], t: t, phase: ph, move: k, air: false, vy: 0, sq: 0, hurt: 0, drink: 0, cele: 0, slope: 0, scale: sc / 1.2 * 1.0, stride: 5.0, shadow: true });
      c.restore();
    });
  }
  UI.openCharSelect = function (done) {
    csDone = done || null; csSel = window.Save.get().character || 'boy';
    UI.refreshCharCards(); UI.show('charSelect'); UI.openModal = 'charSelect';
    document.body.classList.add('char-open'); csT0 = performance.now();
    cancelAnimationFrame(csRaf); csRaf = requestAnimationFrame(csDraw);
    var b = $(CHAR_CARDS.filter(function (d) { return d[1] === csSel; })[0][0]); if (b) { b.focus({ preventScroll: true }); }
  };
  UI.refreshCharCards = function () {
    CHAR_CARDS.forEach(function (d) {
      var el = $(d[0]), open = !window.Save.charOpen || window.Save.charOpen(d[1]);
      el.setAttribute('aria-pressed', csSel === d[1] ? 'true' : 'false');
      el.classList.toggle('locked', !open);
      el.setAttribute('aria-disabled', open ? 'false' : 'true');
    });
  };
  UI.pickChar = function (c) {
    if (window.Save.charOpen && !window.Save.charOpen(c)) {
      if (window.Sfx) { window.Sfx.play('ui'); }
      if (UI.gtoast) { UI.gtoast((window.Save.charLockHint && window.Save.charLockHint(c)) || 'Personnage verrouillé'); }
      return;
    }
    csSel = c; UI.refreshCharCards(); if (window.Sfx) { window.Sfx.play('ui'); }
  };
  UI.closeCharSelect = function (ok) {
    cancelAnimationFrame(csRaf); csRaf = 0; UI.hide('charSelect'); UI.openModal = null;
    document.body.classList.remove('char-open');
    if (ok) { var s = window.Save.get(); if (window.Save.charOpen && !window.Save.charOpen(csSel)) { csSel = (s.character && window.Save.charOpen(s.character)) ? s.character : 'boy'; } s.character = csSel; window.Save.commit(); }
    var cb = csDone; csDone = null; if (cb) { cb(ok); }
  };
  UI.charChoice = function () { return csSel; };

  window.UI = UI;
  window.MapUI = {
    onLocked: function (w) { UI.gtoast(w === 2 ? '🔒 Termine le vol en parapente pour cap sur le Jura' : '🔒 Termine le niveau 6 pour voyager vers le Pays basque'); },
    onWorld: function (w) {
      var d = window.AscensionData.WORLDS, n = window.MapScreen ? window.MapScreen.worldCount() : d.length, un = window.MapScreen ? window.MapScreen.worldUnlocked : function () { return true; };
      $('mapSub').textContent = d[w].name; $('worldName').innerHTML = '<b>MONDE ' + (w + 1) + '</b><span>' + d[w].name + '</span>';
      $('worldPrev').disabled = w <= 0; $('worldNext').disabled = w >= n - 1;
      $('worldNext').textContent = (w < n - 1 && !un(w + 1)) ? '🔒' : '▶'; $('worldNext').classList.toggle('locked', w < n - 1 && !un(w + 1));
      UI.refreshMap();
    },
    onSelect: function (i) { var lv = LV[i], nm = lv.name + (lv.route ? ' — ' + lv.route : ''); $('mapHint').textContent = (i + 1) + '. ' + nm + (lv.playable ? (i >= window.Save.get().unlocked ? ' — verrouillé (termine le niveau ' + i + ')' : ' — ' + (window.Save.get().completed[i + 1] ? 'terminé' : 'prêt à grimper')) : ' — Bientôt'); } };
})();
