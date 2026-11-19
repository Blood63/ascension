/* v0.7.4 — Panoramas d'arrivée d'Ursuya et d'Atxuria.
   Peints en direct, plein cadre (pas un recadrage de la carte d'accueil).
   Style vectoriel lisse, comme les décors de jeu. Données vérifiées, rien n'est inventé.

   Ursuya (678,58 m IGN, borne 1949 site 6436401, commune de Macaye) :
     Dôme d'herbe, grand cairn, borne IGN en granit, tube de fer 678,37 m, banc de bois.
     Pas de croix, pas d'abri, pas de table d'orientation.
     Vue cadrée vers l'WSW (portrait ~250°, paysage un peu plus large ~230°) :
       Baigura 6,7 km / 150° SSE (897 m, émetteurs) — surtout en paysage, bord gauche ;
       Iparla 13 km / 186° S (1044 m) ; Artzamendi 9,0 km / 222° SW (924 m) ;
       Mondarrain 9,2 km / 240° WSW (749 m, silhouette pyramidale rocheuse) ;
       La Rhune 24,7 km / 261° W (905 m, massif trapu + antenne, plus modeste car lointaine) ;
       océan et côte Hendaye→Capbreton, Bayonne et Biarritz sur le rivage (ouest / NW).
     Sources : naturelandespaysbasque.com/mont-ursuya-hasparren ; Wikipedia Mont Ursuya,
     Baïgura, Mondarrain, Artzamendi, La Rhune ; topopyrenees.com (panorama 360°,
     vautours fauves) ; jpdugene.com/fiches_rando/ursuya.htm ; quefaire-pays-basque.fr
     (azimuts) ; Visorando boucle Xixtaberri ; altituderando album Zelhaia (cairn).

   Atxuria / Peña Plata (758 m courante ; vértice 757,590 m ; plaque 756 m) depuis
   les Grottes de Sare :
     Crête de dalles (aitz-xuria, « roche blanche »), grands cairns, plaque Peña Plata,
     borne IGN un peu à l'ouest du sommet sur la crête + plot métallique. Frontière
     France/Espagne. Falaises au sud, colonies de vautours fauves.
     Vue cadrée vers le WNW (portrait ~305°, paysage ~310°) — la vue classique
     « La Rhune et l'Ibanteli en face » :
       Ibanteli 4,5 km / 293° WNW (698 m, tout proche) ;
       Hendaye / l'océan 20 km / 304° NW ;
       La Rhune 8,0 km / 318° NW (905 m, nettement plus proche que depuis l'Ursuya) ;
       Sare 6,4 km / 352° N ; Biarritz 25 km / 2° N, Bayonne 27 km / 16° NNE.
     (Zugarramurdi 2,8 km / 57° ENE, Artzamendi 13 km / 77° ENE, Mendaur 16,5 km /
     227° SW et Saioa 23 km / 178° S sont hors cadre : directions opposées ou
     trop au sud quand on regarde vers La Rhune.)
     Sources : altituderando.com/Atxuria-758m-par-le-PR-au-depart-des-grottes-de-Sare
     (cairns, borne IGN, plaque, vue Rhune/Ibanteli) ; quefairepaysbasque.com
     (sommet frontalier, vue océan, Artzamendi à l'est) ; jpdugene.com/fiches_rando/
     atxuria.htm (côte Bidart/Biarritz, Sare et Zugarramurdi) ; tourisme64 Axuria
     (vautours, Zugarramurdi) ; Wikipedia Ibanteli, La Rhune.
*/
(function () {
  'use strict';
  var A = window.Art, S = window.Scenery;

  function clamp(a, b, x) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hash(i, s) { var n = Math.sin(i * 127.1 + (s || 0) * 311.7) * 43758.5453; return n - Math.floor(n); }
  function angDiff(b, f) { var a = b - f; while (a > 180) { a -= 360; } while (a < -180) { a += 360; } return a; }
  function azX(bearing, facing, fov, W) { return W / 2 + (angDiff(bearing, facing) / (fov * 0.5)) * (W * 0.5); }
  function peakPx(alt, distKm, K) { return K * alt / Math.max(1.2, distKm); }

  function label(c, x, y, txt, fs) {
    if (x < 8 || x > c.canvas.width + 200) { /* caller uses logical W; skip later */ }
    fs = fs || 9;
    c.save();
    c.font = '600 ' + fs + 'px "Trebuchet MS", "Segoe UI", sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.lineWidth = Math.max(2.4, fs * 0.28); c.strokeStyle = 'rgba(20,12,8,.72)'; c.strokeText(txt, x, y);
    c.fillStyle = 'rgba(255,236,210,.92)'; c.fillText(txt, x, y);
    c.restore();
  }

  function sunsetSky(c, w, h, sunX, sunY) {
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a1540');
    g.addColorStop(0.18, '#3a2468');
    g.addColorStop(0.38, '#a43a5a');
    g.addColorStop(0.55, '#e07038');
    g.addColorStop(0.72, '#f0b060');
    g.addColorStop(1, '#f8d898');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    var sg = c.createRadialGradient(sunX, sunY, 4, sunX, sunY, Math.max(w, h) * 0.42);
    sg.addColorStop(0, 'rgba(255,248,210,.95)');
    sg.addColorStop(0.12, 'rgba(255,200,110,.55)');
    sg.addColorStop(0.4, 'rgba(255,140,70,.16)');
    sg.addColorStop(1, 'rgba(255,120,60,0)');
    c.fillStyle = sg; c.beginPath(); c.arc(sunX, sunY, Math.max(w, h) * 0.42, 0, 7); c.fill();
    c.fillStyle = '#fff4c8'; c.beginPath(); c.arc(sunX, sunY, Math.max(7, h * 0.012), 0, 7); c.fill();
  }

  function clouds(c, w, h, hor, t, seed) {
    var i, j;
    for (i = 0; i < 7; i++) {
      var cx = ((hash(i, seed) * w * 1.3 + (t || 0) * (4 + i * 1.4) * 6) % (w + 180)) - 90;
      var cy = hor * (0.18 + hash(i, seed + 2) * 0.45);
      var rw = w * (0.10 + hash(i, seed + 3) * 0.14);
      var rh = h * (0.012 + hash(i, seed + 4) * 0.016);
      c.fillStyle = 'rgba(255,210,190,' + (0.22 + hash(i, seed + 5) * 0.22).toFixed(2) + ')';
      c.beginPath(); c.ellipse(cx, cy, rw, rh, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,236,220,' + (0.18 + hash(i, seed + 6) * 0.2).toFixed(2) + ')';
      c.beginPath(); c.ellipse(cx + rw * 0.25, cy - rh * 0.5, rw * 0.62, rh * 0.85, 0, 0, 7); c.fill();
      for (j = 0; j < 3; j++) {
        c.beginPath();
        c.ellipse(cx - rw * 0.4 + j * rw * 0.4, cy + rh * 0.15, rw * 0.35, rh * 0.7, 0, 0, 7);
        c.fill();
      }
    }
  }

  function oceanBand(c, x0, x1, hor, h, w) {
    if (x1 < 0 || x0 > w) { return; }
    x0 = Math.max(-40, x0); x1 = Math.min(w + 40, x1);
    var mid = (x0 + x1) / 2, hw = Math.max(20, (x1 - x0) / 2), hh = Math.min(h * 0.028, 16);
    var g = c.createLinearGradient(0, hor - hh, 0, hor + hh);
    g.addColorStop(0, 'rgba(200,224,232,0)');
    g.addColorStop(0.35, '#c8e4ec');
    g.addColorStop(0.7, '#6aa0b4');
    g.addColorStop(1, 'rgba(70,120,140,0)');
    c.fillStyle = g;
    c.beginPath(); c.ellipse(mid, hor + hh * 0.3, hw, hh, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,236,200,.35)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(mid - hw * 0.7, hor + 1); c.lineTo(mid + hw * 0.7, hor + 1); c.stroke();
  }

  function glitter(c, x0, x1, hor, t) {
    var i;
    c.strokeStyle = 'rgba(255,255,240,' + (0.18 + 0.14 * Math.sin((t || 0) * 2.0)).toFixed(3) + ')';
    c.lineWidth = 1;
    for (i = 0; i < 3; i++) {
      var yy = hor + 6 + i * 7 + Math.sin((t || 0) * 1.5 + i) * 1.2;
      c.beginPath(); c.moveTo(x0, yy); c.quadraticCurveTo((x0 + x1) * 0.5, yy + 3, x1, yy + 2); c.stroke();
    }
  }

  function farSilhouette(c, pts, col, yBot) {
    if (pts.length < 2) { return; }
    var i, minY = pts[0][1];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) { c.lineTo(pts[i][0], pts[i][1]); if (pts[i][1] < minY) { minY = pts[i][1]; } }
    c.lineTo(pts[pts.length - 1][0], yBot); c.lineTo(pts[0][0], yBot); c.closePath();
    c.fillStyle = col; c.fill();
  }

  function hillLayer(c, pts, c0, c1, yBot) {
    var i, minY = pts[0][1];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) {
      var mx = (pts[i - 1][0] + pts[i][0]) / 2, my = (pts[i - 1][1] + pts[i][1]) / 2;
      c.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
      if (pts[i][1] < minY) { minY = pts[i][1]; }
    }
    c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    c.lineTo(pts[pts.length - 1][0], yBot); c.lineTo(pts[0][0], yBot); c.closePath();
    var g = c.createLinearGradient(0, minY, 0, yBot);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    c.fillStyle = g; c.fill();
  }

  function hedges(c, pts, col) {
    var i;
    c.strokeStyle = col; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath();
    for (i = 0; i < pts.length; i++) {
      if (i === 0) { c.moveTo(pts[i][0], pts[i][1] + 8); }
      else { c.lineTo(pts[i][0], pts[i][1] + 6 + (i % 3)); }
    }
    c.stroke();
  }

  function drawMondarrain(c, x, base, sc) {
    /* Pic pyramidal rocheux, couronne de blocs — reconnaissable de loin. */
    sc = sc || 1;
    c.save(); c.translate(x, base); c.scale(sc, sc);
    c.beginPath();
    c.moveTo(-46, 18);
    c.quadraticCurveTo(-28, 4, -18, -10);
    c.lineTo(-8, -28);
    c.lineTo(-3, -38);
    c.lineTo(0, -42);          /* pointe */
    c.lineTo(4, -36);
    c.lineTo(10, -24);
    c.quadraticCurveTo(22, -8, 40, 18);
    c.closePath();
    var g = c.createLinearGradient(0, -42, 0, 18);
    g.addColorStop(0, '#c8c0b0'); g.addColorStop(0.35, '#8a8a78'); g.addColorStop(1, '#4a5a40');
    c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(50,48,40,.28)';
    c.beginPath(); c.moveTo(-4, -36); c.lineTo(0, -42); c.lineTo(2, -20); c.lineTo(-10, 6); c.closePath(); c.fill();
    /* couronne rocheuse, pas un donjon */
    c.fillStyle = '#c8c4b4';
    c.beginPath(); c.moveTo(-5, -36); c.lineTo(-3, -41); c.lineTo(0, -43); c.lineTo(2.5, -40); c.lineTo(4, -36); c.lineTo(1, -35); c.closePath(); c.fill();
    c.fillStyle = 'rgba(60,56,48,.3)';
    c.beginPath(); c.moveTo(-2, -38); c.lineTo(0, -43); c.lineTo(1, -36); c.closePath(); c.fill();
    c.restore();
  }

  function drawBaigura(c, x, base, sc) {
    /* Massif isolé arrondi, émetteurs hertziens au sommet (Wikipedia). */
    sc = sc || 1;
    c.save(); c.translate(x, base); c.scale(sc, sc);
    c.beginPath();
    c.moveTo(-70, 20);
    c.quadraticCurveTo(-50, 0, -28, -10);
    c.quadraticCurveTo(-8, -22, 6, -24);
    c.quadraticCurveTo(22, -20, 40, -6);
    c.quadraticCurveTo(58, 6, 72, 20);
    c.closePath();
    var g = c.createLinearGradient(0, -24, 0, 20);
    g.addColorStop(0, '#8aa070'); g.addColorStop(1, '#4a6248');
    c.fillStyle = g; c.fill();
    var k;
    for (k = 0; k < 3; k++) {
      var mx = -4 + k * 6, my = -24;
      c.fillStyle = '#c8ccd0'; c.fillRect(mx, my - 16, 1.3, 16);
      c.fillStyle = (k === 1) ? '#b42822' : '#d8dce0';
      c.fillRect(mx - 0.6, my - 17.2, 2.4, 1.4);
    }
    c.restore();
  }

  function drawArtzamendi(c, x, base, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, base); c.scale(sc, sc);
    c.beginPath();
    c.moveTo(-80, 22);
    c.quadraticCurveTo(-60, 2, -36, -12);
    c.quadraticCurveTo(-18, -24, 0, -26);
    c.quadraticCurveTo(20, -22, 38, -10);
    c.quadraticCurveTo(62, 4, 84, 22);
    c.closePath();
    var g = c.createLinearGradient(0, -26, 0, 22);
    g.addColorStop(0, '#96b078'); g.addColorStop(1, '#4e6a44');
    c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(40,50,30,.22)';
    c.beginPath(); c.moveTo(-20, -16); c.quadraticCurveTo(0, -24, 10, -8); c.lineTo(-30, 8); c.closePath(); c.fill();
    c.restore();
  }

  function drawIparla(c, x, base, sc) {
    sc = sc || 1;
    c.save(); c.translate(x, base); c.scale(sc, sc);
    c.beginPath();
    c.moveTo(-90, 18);
    c.quadraticCurveTo(-60, 4, -40, -8);
    c.quadraticCurveTo(-20, -16, -4, -14);
    c.quadraticCurveTo(16, -20, 34, -12);
    c.quadraticCurveTo(60, 0, 90, 18);
    c.closePath();
    c.fillStyle = '#6a7a6a'; c.fill();
    c.restore();
  }

  function drawIbanteli(c, x, base, sc) {
    /* Colline proche, un peu plus basse que l'Atxuria, verte et douce. */
    sc = sc || 1;
    c.save(); c.translate(x, base); c.scale(sc, sc);
    c.beginPath();
    c.moveTo(-90, 28);
    c.quadraticCurveTo(-70, 8, -48, -4);
    c.quadraticCurveTo(-24, -18, 0, -22);
    c.quadraticCurveTo(26, -16, 50, 0);
    c.quadraticCurveTo(74, 12, 96, 28);
    c.closePath();
    var g = c.createLinearGradient(0, -22, 0, 28);
    g.addColorStop(0, '#8eaa68'); g.addColorStop(0.55, '#5a7a44'); g.addColorStop(1, '#3a542e');
    c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(40,50,28,.25)';
    c.beginPath(); c.moveTo(-30, -8); c.quadraticCurveTo(0, -18, 16, -2); c.lineTo(-40, 12); c.closePath(); c.fill();
    c.restore();
  }

  function grassFill(c, path, yTop, yBot, w, seed, pal) {
    path();
    var g = c.createLinearGradient(0, yTop, 0, yBot);
    g.addColorStop(0, pal[0]); g.addColorStop(0.45, pal[1]); g.addColorStop(1, pal[2]);
    c.fillStyle = g; c.fill();
    /* variation de teinte : plus de touffes, pas une plaque unie */
    var i, n = Math.max(40, Math.round(w * (yBot - yTop) / 9000));
    for (i = 0; i < n; i++) {
      var gx = hash(i, seed) * w;
      var gy = yTop + hash(i, seed + 3) * (yBot - yTop);
      var rw = 8 + hash(i, seed + 5) * 22;
      var rh = 3 + hash(i, seed + 7) * 7;
      c.fillStyle = hash(i, seed + 9) > 0.5 ? pal[3] : pal[4];
      c.globalAlpha = 0.22 + hash(i, seed + 11) * 0.25;
      c.beginPath(); c.ellipse(gx, gy, rw, rh, (hash(i, seed + 13) - 0.5) * 0.6, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
    /* brins */
    c.strokeStyle = pal[5]; c.lineWidth = 0.7; c.lineCap = 'round';
    c.globalAlpha = 0.45;
    c.beginPath();
    var b, bn = Math.max(80, Math.round(w / 4));
    for (b = 0; b < bn; b++) {
      var bx = hash(b, seed + 21) * w, by = yTop + 8 + hash(b, seed + 23) * (yBot - yTop - 10);
      var bh = 3 + hash(b, seed + 25) * 6;
      c.moveTo(bx, by); c.lineTo(bx + (hash(b, seed + 27) - 0.5) * 3, by - bh);
    }
    c.stroke(); c.globalAlpha = 1;
  }

  function cairn(c, x, y, s) {
    /* tas de pierres empilées, ancré au sol */
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,22,10,.28)'; c.beginPath(); c.ellipse(0, 2.2, 16, 3.2, 0, 0, 7); c.fill();
    var stones = [
      [-10, 0, 7, 4.2, '#b0aa94'], [0, 0.4, 8, 4.4, '#c4c0ac'], [9, 0.6, 6.5, 3.8, '#a8a28c'],
      [-6, -4.2, 6.2, 3.6, '#ccc8b8'], [3, -4.4, 6.6, 3.8, '#b8b49e'],
      [-2, -8.2, 5.4, 3.5, '#d4d0c4'], [4, -8, 5, 3.2, '#c0bcb0'],
      [0.5, -11.6, 4.4, 3.4, '#d8d4c8']
    ], i;
    for (i = 0; i < stones.length; i++) {
      var st = stones[i];
      c.fillStyle = st[4];
      c.beginPath(); c.ellipse(st[0], st[1], st[2] * 0.7, st[3] * 0.7, 0.1 * (i % 3 - 1), 0, 7); c.fill();
      c.strokeStyle = 'rgba(40,36,28,.4)'; c.lineWidth = 0.55; c.stroke();
    }
    c.restore();
  }

  function ignPillar(c, x, y, s, txt) {
    /* borne en granit, forme tronconique typique, gravure IGN */
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,22,10,.25)'; c.beginPath(); c.ellipse(0, 1.4, 6, 2, 0, 0, 7); c.fill();
    c.beginPath();
    c.moveTo(-4.2, 1.2); c.lineTo(-3.2, -14); c.lineTo(0, -15.6); c.lineTo(3.2, -14); c.lineTo(4.2, 1.2);
    c.closePath();
    var g = c.createLinearGradient(-4, 0, 4, 0);
    g.addColorStop(0, '#9a9488'); g.addColorStop(0.45, '#d0c8b8'); g.addColorStop(1, '#6a6458');
    c.fillStyle = g; c.fill();
    c.strokeStyle = '#2c2820'; c.lineWidth = 0.7; c.stroke();
    c.fillStyle = '#3a342c';
    c.font = 'bold 3.1px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('IGN', 0, txt ? -9.2 : -6.2);
    if (txt) { c.font = 'bold 3px sans-serif'; c.fillText(txt, 0, -4.4); }
    c.restore();
  }

  function bench(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,22,10,.2)'; c.beginPath(); c.ellipse(0, 1, 12, 2, 0, 0, 7); c.fill();
    c.fillStyle = '#6a4a28';
    c.fillRect(-9, -1.2, 18, 1.8);
    c.fillRect(-8.4, -6.2, 16.8, 1.5);
    c.fillRect(-8.2, -6.2, 1.5, 7.6);
    c.fillRect(6.6, -6.2, 1.5, 7.6);
    c.fillStyle = '#8a6238'; c.fillRect(-8.6, -1.0, 17.2, 0.7);
    c.restore();
  }

  function plaque(c, x, y, s) {
    /* plaque Peña Plata 756 m, posée près du cairn (Altituderando). */
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,22,10,.22)'; c.beginPath(); c.ellipse(0, 1.4, 9, 2, 0, 0, 7); c.fill();
    c.fillStyle = '#7a7468'; c.fillRect(-1.1, -13, 2.2, 14.5);
    c.fillStyle = '#e8e4d4';
    c.beginPath(); c.moveTo(-11, -13); c.lineTo(11, -13); c.lineTo(11.6, -2); c.lineTo(-11.6, -2); c.closePath(); c.fill();
    c.strokeStyle = '#3a3830'; c.lineWidth = 0.7; c.stroke();
    c.fillStyle = '#3a342c';
    c.font = 'bold 3.2px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('PEÑA PLATA', 0, -9.4);
    c.font = 'bold 3px sans-serif';
    c.fillText('756 m', 0, -5.2);
    c.restore();
  }

  function rockSlab(c, x, y, s, seed) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(30,22,10,.18)'; c.beginPath(); c.ellipse(2, 3, 16, 3, -0.1, 0, 7); c.fill();
    c.beginPath();
    c.moveTo(-14, 3);
    c.lineTo(-10, -4 - hash(seed, 1) * 3);
    c.lineTo(-2, -8 - hash(seed, 2) * 2);
    c.lineTo(8, -5);
    c.lineTo(16, 1);
    c.lineTo(10, 5);
    c.lineTo(-8, 5);
    c.closePath();
    var g = c.createLinearGradient(0, -8, 0, 5);
    g.addColorStop(0, '#f0ece0'); g.addColorStop(0.5, '#d0ccbc'); g.addColorStop(1, '#8a8678');
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(70,66,58,.4)'; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(-6, -2); c.lineTo(4, 2); c.moveTo(-1, -6); c.lineTo(8, -1); c.stroke();
    c.restore();
  }

  function etxeAt(c, x, y, s) {
    var B = window.BasqueArt;
    if (B && B.etxe) { B.etxe(c, x, y, s); }
  }
  function fernAt(c, x, y, s, t, seed) {
    var B = window.BasqueArt;
    if (B && B.fern) { B.fern(c, x, y, s, t, seed); }
  }
  function rhuneAt(c, x, y, s, opt) {
    var B = window.BasqueArt;
    if (B && B.laRhune) { B.laRhune(c, x, y, s, opt || { c0: '#5a6a58', c1: '#8fa07c', edge: 'rgba(40,48,36,.3)' }); }
  }

  function midFarms(c, w, y, t, seed) {
    var i, n = 5;
    for (i = 0; i < n; i++) {
      var x = w * (0.08 + hash(i, seed) * 0.84);
      etxeAt(c, x, y + hash(i, seed + 2) * 10, 0.42 + hash(i, seed + 3) * 0.22);
    }
  }

  function oaks(c, list, t) {
    var i;
    for (i = 0; i < list.length; i++) {
      var o = list[i];
      if (S && S.oak) { S.oak(c, o.x, o.y, o.s, { t: t || 0, seed: i + 11, sway: false }); }
      else if (S && S.beech) { S.beech(c, o.x, o.y, o.s, { t: t || 0, seed: i }); }
    }
  }


  function nearFoliage(c, w, h, t, seed) {
    /* fougères et herbes du tout premier plan, proches de la « caméra » */
    var i;
    for (i = 0; i < 10; i++) {
      var x = (i < 5) ? w * (0.02 + i * 0.07 + hash(i, seed) * 0.03) : w * (0.68 + (i - 5) * 0.07 + hash(i, seed) * 0.03);
      var y = h * (0.90 + hash(i, seed + 2) * 0.09);
      fernAt(c, x, y, 22 + hash(i, seed + 3) * 14, t, i + seed);
    }
    c.strokeStyle = '#2a4a1c'; c.lineWidth = 1.1; c.lineCap = 'round'; c.globalAlpha = 0.55;
    c.beginPath();
    for (i = 0; i < 40; i++) {
      var bx = hash(i, seed + 9) * w, by = h * (0.88 + hash(i, seed + 11) * 0.12);
      c.moveTo(bx, by); c.lineTo(bx + (hash(i, seed + 13) - 0.5) * 6, by - 8 - hash(i, seed + 15) * 10);
    }
    c.stroke(); c.globalAlpha = 1;
  }

  function litHill(c, pts, c0, c1, shade, yBot) {
    var i, minY = pts[0][1];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i++) {
      var mx = (pts[i - 1][0] + pts[i][0]) / 2, my = (pts[i - 1][1] + pts[i][1]) / 2;
      c.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], mx, my);
      if (pts[i][1] < minY) { minY = pts[i][1]; }
    }
    c.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
    c.lineTo(pts[pts.length - 1][0], yBot); c.lineTo(pts[0][0], yBot); c.closePath();
    var g = c.createLinearGradient(0, minY, 0, yBot);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    c.fillStyle = g; c.fill();
    /* ombre de versant + liseré au soleil couchant */
    c.save(); c.clip();
    var sg = c.createLinearGradient(pts[0][0], 0, pts[pts.length - 1][0], 0);
    sg.addColorStop(0, 'rgba(40,30,20,.22)'); sg.addColorStop(0.55, 'rgba(40,30,20,0)'); sg.addColorStop(1, 'rgba(255,190,80,.16)');
    c.fillStyle = sg; c.fillRect(pts[0][0], minY - 4, pts[pts.length - 1][0] - pts[0][0], yBot - minY + 8);
    c.restore();
    if (shade) {
      c.strokeStyle = shade; c.lineWidth = 1.4; c.lineCap = 'round';
      c.beginPath();
      for (i = 0; i < pts.length; i++) {
        if (i === 0) { c.moveTo(pts[i][0], pts[i][1] + 7); }
        else { c.lineTo(pts[i][0], pts[i][1] + 5 + (i % 3)); }
      }
      c.stroke();
    }
  }

  function drawGlidingGriffon(c, t, i) {
    /* Vautour fauve : ailes larges à rémiges écartées, tête claire, collerette, queue courte. */
    var flap = Math.sin((t || 0) * 1.4 + (i || 0)) * 0.12;
    c.save();
    c.rotate(-0.08 + Math.sin((t || 0) * 0.5 + i) * 0.04);
    function wing(side) {
      c.save(); c.scale(side, 1); c.rotate(0.16 + flap * side * 0.15);
      c.beginPath();
      c.moveTo(2, -3.2);
      c.quadraticCurveTo(14, -6.5, 26, -2.2);
      c.lineTo(28, 0.6);
      c.quadraticCurveTo(16, 4.2, 2, 2.4);
      c.closePath();
      c.fillStyle = '#5a3a22'; c.fill();
      c.fillStyle = '#d2b07a';
      c.beginPath(); c.moveTo(2, -2.4); c.quadraticCurveTo(12, -3.2, 18, -0.6); c.lineTo(16, 2.0); c.quadraticCurveTo(8, 2.2, 2, 1.4); c.closePath(); c.fill();
      var k;
      for (k = 0; k < 7; k++) {
        var ang = -0.55 + k * 0.18;
        c.save(); c.translate(26, -1.6 + k * 0.55); c.rotate(ang);
        c.fillStyle = '#2a1810';
        c.beginPath(); c.moveTo(0, -0.55); c.quadraticCurveTo(5.4, -0.1, 6.2, 0); c.quadraticCurveTo(5.4, 0.15, 0, 0.55); c.closePath(); c.fill();
        c.restore();
      }
      c.restore();
    }
    wing(-1); wing(1);
    c.beginPath(); c.ellipse(0.6, 0.2, 5.2, 3.2, 0.08, 0, 7);
    c.fillStyle = '#d8b878'; c.fill();
    c.fillStyle = '#3a2414';
    c.beginPath(); c.moveTo(-4.2, 0.2); c.lineTo(-9.2, 0.8); c.lineTo(-9.4, 3.6); c.lineTo(-3.4, 2.8); c.closePath(); c.fill();
    c.fillStyle = '#f4efe6'; c.beginPath(); c.ellipse(5.4, -0.2, 2.4, 2.2, 0, 0, 7); c.fill();
    c.fillStyle = '#efe6d0'; c.beginPath(); c.ellipse(7.4, -0.5, 1.7, 1.3, 0.2, 0, 7); c.fill();
    c.fillStyle = '#e0a838';
    c.beginPath(); c.moveTo(8.8, -0.6); c.lineTo(11.0, -0.15); c.lineTo(8.8, 0.35); c.closePath(); c.fill();
    c.fillStyle = '#1a1008'; c.beginPath(); c.arc(7.6, -0.7, 0.32, 0, 7); c.fill();
    c.restore();
  }

  function vultures(c, w, hor, t, n) {
    var i;
    for (i = 0; i < n; i++) {
      var bx = ((w * (0.18 + i * 0.28) + (t || 0) * (10 + i * 5)) % (w + 140)) - 70;
      var by = hor * (0.28 + i * 0.16 + hash(i, 9) * 0.08) + Math.sin((t || 0) * 0.7 + i * 1.4) * 8;
      var sc = (i === 1 ? 2.1 : 1.65) * (w > hor * 2 ? 1.15 : 1.0);
      c.save(); c.translate(bx, by); c.scale(sc, sc);
      drawGlidingGriffon(c, t, i);
      c.restore();
    }
  }

  function livestock(c, spots, t) {
    if (!window.Fauna) { return; }
    var i;
    for (i = 0; i < spots.length; i++) {
      var s = spots[i];
      c.save(); c.translate(s.x, s.y); c.scale(s.s, s.s);
      if (s.k === 'sheep' && Fauna.drawSheep) { Fauna.drawSheep(c, { x: 0, y: 0, face: s.face, coat: s.coat || 0, ph: (t || 0) * 0.8 + i }, t); }
      else if (Fauna.drawPottok) { Fauna.drawPottok(c, { x: 0, y: 0, face: s.face, coat: s.coat || 0, ph: (t || 0) * 0.8 + i }, t); }
      c.restore();
    }
  }

  function maybeLabel(c, x, y, txt, fs, w) {
    if (x < 36 || x > w - 36) { return; }
    label(c, x, y, txt, fs);
  }

  /* ---------- Ursuya : regard WSW, océan à droite, sommets basques à gauche ---------- */
  function paintUrsuyaVista(c, w, h, opt) {
    opt = opt || {};
    var t = opt.t || 0, port = h > w;
    var facing = port ? 248 : 248;
    var fov = port ? 66 : 126;
    var K = port ? h * 0.0017 : h * 0.00185;
    var hor = h * (port ? 0.32 : 0.36) + (opt.settle || 0) * h * 0.015;
    var sunX = azX(272, facing, fov, w);
    var sunY = hor - h * 0.01;

    sunsetSky(c, w, h, sunX, sunY);
    clouds(c, w, h, hor, t, 3);

    var ox0 = azX(266, facing, fov, w), ox1 = w + 40, oY = hor + h * 0.042;
    oceanBand(c, ox0, ox1, oY, h, w);
    glitter(c, Math.max(0, ox0), w, oY, t);

    /* avant-pays, bas, pour laisser voir l'océan et les bases des sommets */
    litHill(c, [
      [-10, hor + h * 0.055], [w * 0.22, hor + h * 0.035], [Math.max(0, ox0 - 8), hor + h * 0.05],
      [w * 0.72, hor + h * 0.048], [w + 10, hor + h * 0.052]
    ], '#8a9a78', '#5a6a58', null, hor + h * 0.16);

    function place(bearing, draw, alt, dist, labelTxt, scMul, maxFrac) {
      var x = azX(bearing, facing, fov, w);
      if (x < -w * 0.2 || x > w * 1.2) { return; }
      var ph = peakPx(alt, dist, K);
      var sc = (ph / 38) * (scMul || 1);
      var maxW = w * (maxFrac || 0.42);
      if (sc * 90 > maxW) { sc = maxW / 90; }
      draw(c, x, midFoot, sc);
      if (labelTxt) { maybeLabel(c, x, midFoot - Math.min(ph, sc * 42) - 8, labelTxt, port ? 10 : 11, w); }
    }
    var midFoot = hor + h * 0.05;
    place(186.5, drawIparla, 1044, 13.0, 'Iparla', 0.95);
    place(150.3, drawBaigura, 897, 6.7, 'Baigura', 1.05);
    place(222.0, drawArtzamendi, 924, 9.0, 'Artzamendi', 1.0);
    place(240.0, drawMondarrain, 749, 9.2, 'Mondarrain', 1.15, 0.36);
    place(261.3, function (cc, x, y, sc) { rhuneAt(cc, x, y, sc); }, 905, 24.7, 'La Rhune', 1.0, 0.28);

    /* vallons pastoraux sous les sommets, plus bas que le dôme */
    var midY = hor + h * 0.055;
    var midPts = [
      [-20, midY + h * 0.05], [w * 0.16, midY + h * 0.018], [w * 0.34, midY + h * 0.048],
      [w * 0.55, midY + h * 0.012], [w * 0.78, midY + h * 0.04], [w + 20, midY + h * 0.035]
    ];
    litHill(c, midPts, '#6ea050', '#3e6a34', 'rgba(36,64,28,.5)', h);
    midFarms: {
      etxeAt(c, w * 0.14, midY + h * 0.07, port ? 0.72 : 0.6);
      etxeAt(c, w * 0.40, midY + h * 0.09, port ? 0.62 : 0.52);
      etxeAt(c, w * 0.84, midY + h * 0.065, port ? 0.7 : 0.58);
    }
    oaks(c, [
      { x: w * 0.08, y: midY + h * 0.075, s: h * 0.032 },
      { x: w * 0.22, y: midY + h * 0.06, s: h * 0.026 },
      { x: w * 0.62, y: midY + h * 0.07, s: h * 0.024 },
      { x: w * 0.90, y: midY + h * 0.08, s: h * 0.030 }
    ], t);
    livestock(c, [
      { k: 'pottok', x: w * 0.28, y: midY + h * 0.085, s: 1.55, face: 1, coat: 0 },
      { k: 'pottok', x: w * 0.34, y: midY + h * 0.09, s: 1.35, face: -1, coat: 2 },
      { k: 'sheep', x: w * 0.70, y: midY + h * 0.08, s: 1.3, face: 1, coat: 0 },
      { k: 'sheep', x: w * 0.75, y: midY + h * 0.084, s: 1.15, face: -1, coat: 1 }
    ], t);

    maybeLabel(c, Math.min(w - 40, Math.max(ox0 + 40, w * 0.82)), oY + 8, port ? 'océan' : 'océan · Biarritz', port ? 9 : 10, w);

    vultures(c, w, hor, t, 3);

    /* dôme : lèvre haute, on est au sommet, le sol descend vite */
    var crest = h * (port ? 0.63 : 0.62);
    function dome() {
      c.beginPath();
      c.moveTo(-40, h + 10);
      c.quadraticCurveTo(w * 0.12, h * 0.86, w * 0.32, crest + h * 0.02);
      c.quadraticCurveTo(w * 0.50, crest - h * 0.012, w * 0.68, crest + h * 0.015);
      c.quadraticCurveTo(w * 0.88, h * 0.82, w + 40, h * 0.92);
      c.lineTo(w + 40, h + 10);
      c.closePath();
    }
    grassFill(c, dome, crest - h * 0.02, h, w, 17, ['#d0d868', '#7eae4c', '#355828', '#96c058', '#4a6e30', '#243c18']);
    /* liseré ensoleillé de la lèvre du dôme */
    c.strokeStyle = 'rgba(255,210,110,.35)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(w * 0.2, crest + h * 0.025); c.quadraticCurveTo(w * 0.5, crest - h * 0.01, w * 0.78, crest + h * 0.02); c.stroke();
    /* petite trace de sentier, courte, pas une piste au milieu */
    c.strokeStyle = 'rgba(176,148,100,.55)'; c.lineWidth = Math.max(2, w * 0.007); c.lineCap = 'round';
    c.beginPath(); c.moveTo(w * 0.36, crest + h * 0.06); c.quadraticCurveTo(w * 0.44, crest + h * 0.03, w * 0.50, crest + 6); c.stroke();

    var hx = w * (port ? 0.56 : 0.40), hy = crest + h * 0.01;
    bench(c, hx - (port ? 48 : 58), hy + 6, port ? 1.4 : 1.2);
    cairn(c, hx - (port ? 26 : 32), hy + 3, port ? 1.5 : 1.28);
    ignPillar(c, hx + (port ? 24 : 30), hy + 3, port ? 1.6 : 1.38, '678');

    nearFoliage(c, w, h, t, 17);
    return { hx: hx, hy: hy, facing: facing, fov: fov };
  }

  /* ---------- Atxuria : regard WNW, Ibanteli puis La Rhune, océan dans l'intervalle ---------- */
  function paintAtxuriaVista(c, w, h, opt) {
    opt = opt || {};
    var t = opt.t || 0, port = h > w;
    var facing = port ? 312 : 310;
    var fov = port ? 64 : 112;
    var K = port ? h * 0.00185 : h * 0.0020;
    var hor = h * (port ? 0.30 : 0.34) + (opt.settle || 0) * h * 0.015;
    var sunX = azX(285, facing, fov, w);
    var sunY = hor - h * 0.01;

    sunsetSky(c, w, h, sunX, sunY);
    clouds(c, w, h, hor, t, 8);

    var ox0 = azX(296, facing, fov, w), ox1 = azX(340, facing, fov, w), oY = hor + h * 0.04;
    oceanBand(c, ox0, Math.max(ox1, w * 0.72), oY, h, w);
    glitter(c, Math.max(0, ox0), Math.min(w, Math.max(ox1, w * 0.75)), oY, t);

    (function () {
      var foot = hor + h * 0.05;
      var xI = azX(292.9, facing, fov, w);
      var scI = Math.min(peakPx(698, 4.5, K) / 42, (w * 0.52) / 186);
      if (xI > -w * 0.2 && xI < w * 1.2) {
        drawIbanteli(c, xI, foot, scI);
        maybeLabel(c, xI, foot - scI * 24 - 8, 'Ibanteli', port ? 10 : 11, w);
      }
      var xR = azX(318.1, facing, fov, w);
      var scR = Math.min(peakPx(905, 8.0, K) / 46, (w * 0.48) / 216);
      if (xR > -w * 0.2 && xR < w * 1.2) {
        rhuneAt(c, xR, foot, scR, { c0: '#4a5a48', c1: '#849474', edge: 'rgba(40,48,36,.3)' });
        maybeLabel(c, xR, foot - scR * 36 - 10, 'La Rhune', port ? 10 : 12, w);
      }
    }());

    
    if (!port) { maybeLabel(c, azX(352, facing, fov, w), hor + h * 0.06, 'Sare', 9, w); }

    var midY = hor + h * 0.07;
    /* une seule ligne de collines, légèrement en selle au centre — pas un ravin orange */
    litHill(c, [
      [-20, midY + h * 0.05], [w * 0.16, midY + h * 0.02], [w * 0.34, midY + h * 0.045],
      [w * 0.50, midY + h * 0.06], [w * 0.68, midY + h * 0.03], [w * 0.86, midY + h * 0.045], [w + 20, midY + h * 0.04]
    ], '#62964a', '#3a6230', 'rgba(30,56,24,.45)', h);
    etxeAt(c, w * 0.16, midY + h * 0.08, port ? 0.7 : 0.58);
    etxeAt(c, w * 0.86, midY + h * 0.07, port ? 0.64 : 0.52);
    oaks(c, [
      { x: w * 0.08, y: midY + h * 0.09, s: h * 0.03 },
      { x: w * 0.92, y: midY + h * 0.08, s: h * 0.028 }
    ], t);
    livestock(c, [
      { k: 'pottok', x: w * 0.22, y: midY + h * 0.09, s: 1.45, face: 1, coat: 1 },
      { k: 'sheep', x: w * 0.78, y: midY + h * 0.08, s: 1.25, face: -1, coat: 0 },
      { k: 'sheep', x: w * 0.83, y: midY + h * 0.085, s: 1.15, face: 1, coat: 1 }
    ], t);

    vultures(c, w, hor, t, 3);

    var crest = h * (port ? 0.62 : 0.60);
    /* plateforme sommitale : dalles autour du cairn, herbe qui redescend sur les bords — pas une route */
    function ridge() {
      c.beginPath();
      c.moveTo(-30, h + 10);
      c.quadraticCurveTo(w * 0.12, h * 0.86, w * 0.30, crest + h * 0.03);
      c.quadraticCurveTo(w * 0.50, crest - h * 0.008, w * 0.70, crest + h * 0.025);
      c.quadraticCurveTo(w * 0.88, h * 0.84, w + 30, h * 0.92);
      c.lineTo(w + 30, h + 10);
      c.closePath();
    }
    grassFill(c, ridge, crest, h, w, 29, ['#c8d068', '#6e9e48', '#355628', '#8ab050', '#48682e', '#243c18']);
    /* dalle calcaire locale, autour des cairns seulement */
    var hx = w * (port ? 0.54 : 0.42), hy = crest + h * 0.015;
    c.fillStyle = 'rgba(30,22,10,.16)';
    c.beginPath(); c.ellipse(hx, hy + 8, w * 0.12, h * 0.02, -0.08, 0, 7); c.fill();
    c.beginPath();
    c.moveTo(hx - w * 0.16, hy + h * 0.04);
    c.lineTo(hx - w * 0.12, hy - h * 0.01);
    c.quadraticCurveTo(hx, hy - h * 0.018, hx + w * 0.13, hy - h * 0.004);
    c.lineTo(hx + w * 0.18, hy + h * 0.045);
    c.quadraticCurveTo(hx, hy + h * 0.055, hx - w * 0.16, hy + h * 0.04);
    c.closePath();
    var lg = c.createLinearGradient(hx, hy - 12, hx, hy + h * 0.06);
    lg.addColorStop(0, '#f2eee2'); lg.addColorStop(0.55, '#d0ccbc'); lg.addColorStop(1, '#9a967e');
    c.fillStyle = lg; c.fill();
    c.strokeStyle = 'rgba(80,76,66,.4)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(hx - w * 0.08, hy + 4); c.lineTo(hx + w * 0.06, hy + 12); c.moveTo(hx - w * 0.02, hy - 4); c.lineTo(hx + w * 0.1, hy + 8); c.stroke();

    var sl, slabs = [[0.16, 0.06, 1.15, 1], [0.24, 0.09, 0.9, 2], [0.78, 0.07, 1.2, 3], [0.88, 0.10, 1.0, 4]];
    for (sl = 0; sl < slabs.length; sl++) {
      rockSlab(c, w * slabs[sl][0], crest + h * slabs[sl][1], (port ? 1.7 : 1.4) * slabs[sl][2], slabs[sl][3]);
    }

    ignPillar(c, hx - (port ? 62 : 78), hy + h * 0.012, port ? 1.2 : 1.08, '');
    cairn(c, hx - (port ? 28 : 34), hy + 3, port ? 1.75 : 1.45);
    cairn(c, hx - (port ? 12 : 16), hy + 5, port ? 1.35 : 1.15);
    plaque(c, hx + (port ? 30 : 36), hy + 3, port ? 1.6 : 1.38);

    nearFoliage(c, w, h, t, 31);
    return { hx: hx, hy: hy, facing: facing, fov: fov };
  }

  window.BasqueVista = {
    ursuyaVista: paintUrsuyaVista,
    atxuriaVista: paintAtxuriaVista
  };
}());
