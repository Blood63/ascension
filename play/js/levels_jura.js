/* v0.14.0 — Niveaux 14 à 21, monde 3 (Massif du Jura).
   Faits des fiches : sources web consultées le 16/11/2026 et le 17/11/2026.
   Inconnu = « Non documentée ». Aucun chiffre n'est inventé. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, MAPN = (D.WORLDS && D.WORLDS[2] && D.WORLDS[2].nodes) || [];

  function bottlesIn(lv) { return lv.play.pieces.filter(function (p) { return p.bottle != null; }).length; }

  var HINTS_COMMON = {
    start:      'Avance avec ◀ ▶ et saute avec ▲.',
    water:      'Ta jauge d\u2019eau baisse avec le temps. Trouve des bouteilles en chemin !',
    checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
    gap:        'Un vide ! Prends de l\u2019élan et saute par-dessus.',
    boulder:    'Un rocher bloque le chemin : saute par-dessus !',
    cows:       'Une vache montbéliarde traverse : arrête-toi et laisse-la passer, ou saute par-dessus. La bousculer coûte un cœur.',
    sheep:      'Une brebis traverse : arrête-toi et laisse-la passer, ou saute par-dessus. La bousculer coûte un cœur.',
    chamois:    'Un chamois traverse le sentier : arrête-toi et laisse-le passer, ou saute par-dessus. Le bousculer coûte un cœur.',
    tetra:      'Un grand tétras est sur le sentier. Reste en retrait, laisse-le s\u2019éloigner. Le bousculer coûte un cœur — et, dans la vraie vie, le déranger est interdit.',
    lynx:       'Un lynx se tient à l\u2019écart, dans la lisière. Il ne s\u2019approche pas : reste discret, ne le poursuis pas.',
    pebbles:    'Un rapace lâche un petit caillou : l\u2019ombre au sol et le cri t\u2019avertissent (pas le triangle des éboulis). Écarte-toi !',
    fog:        'Le brouillard des crêts réduit la vue. Reste sur la trace.',
    sun:        'Pente au soleil : ta gourde se vide plus vite. Cherche les bouteilles.',
    rocks:      'Des pierres dévalent la pente : un triangle t\u2019avertit, puis saute par-dessus.',
    scramble:   'Passage rocheux : enchaîne les prises et rythme tes sauts.',
    wet:        'Attention, ça glisse. Avance d\u2019un pas régulier.',
    storm:      'Crête exposée au vent. « Vent… » puis « Rafale ! » s\u2019affichent (~1 s d\u2019avance). Attends à l\u2019abri avant de sauter un vide.',
    karst:      'Une doline / un trou karstique s\u2019ouvre. Tu aperçois la fissure : saute-la, ne quitte pas le sentier.',
    lapiaz:     'Des blocs de lapiaz (calcaire fissuré) barrent le sentier : saute par-dessus.',
    doline:     'Une doline s\u2019ouvre dans le calcaire. La fissure se devine à l\u2019approche : saute-la.',
    snow:       'Névé ou plaque de neige : ça glisse. Avance d\u2019un pas régulier.',
    bouquetin:  'Un bouquetin se tient sur les rochers. Reste en retrait, laisse-le s\u2019éloigner. Le bousculer coûte un cœur — et, dans la vraie vie, le déranger est interdit (réserve).',
    cliff:      'Falaise : reste sur le sentier de crête, ne descends pas dans l\u2019à-pic.',
    cirque:     'Le rebord du cirque : tu vois le vide. Reste sur le sentier, ne t\u2019approche pas de l\u2019à-pic.',
    lacets:     'Les lacets se resserrent. Enchaîne les virages et rythme tes sauts.'
  };
  var HINTS_PAD = {
    start:      'Avance avec le stick gauche (ou la croix) et saute avec A.',
    boulder:    'Un rocher bloque le chemin : saute par-dessus avec A !',
    cows:       'Une montbéliarde traverse : relâche le stick et laisse-la passer, ou saute par-dessus.',
    sheep:      'Une brebis traverse : relâche le stick et laisse-la passer, ou saute par-dessus.',
    chamois:    'Un chamois traverse : relâche le stick et laisse-le passer, ou saute par-dessus.',
    tetra:      'Un grand tétras est sur le sentier : relâche le stick, laisse-le s\u2019éloigner.',
    lynx:       'Un lynx se tient à l\u2019écart. Il ne s\u2019approche pas : reste discret.',
    pebbles:    'Ombre au sol et cri : un caillou va tomber. Écarte-toi.',
    fog:        'Brouillard des crêts : on voit moins loin. Reste sur la trace.',
    sun:        'Soleil : la gourde se vide plus vite. Cherche les bouteilles.',
    rocks:      'Pierres en descente : un triangle t\u2019avertit, puis saute avec A.',
    scramble:   'Passage rocheux : enchaîne les prises et saute avec A.',
    wet:        'Ça glisse : avance d\u2019un pas régulier.',
    storm:      'Rafale sur la crête (~1 s d\u2019avance) : attends à l\u2019abri avant de sauter un vide.',
    gap:        'Un vide ! Prends de l\u2019élan et saute avec A.',
    karst:      'Trou karstique : tu vois la fissure, saute avec A.',
    lapiaz:     'Bloc de lapiaz : saute par-dessus avec A.',
    doline:     'Doline : saute la fissure avec A.',
    snow:       'Névé : ça glisse. Avance d\u2019un pas régulier.',
    bouquetin:  'Un bouquetin sur les rochers : relâche le stick, reste en retrait.',
    cliff:      'Falaise : reste sur le sentier, ne descends pas dans l\u2019à-pic.',
    cirque:     'Rebord du cirque : reste sur le sentier, ne t\u2019approche pas de l\u2019à-pic.',
    lacets:     'Les lacets se resserrent. Enchaîne les virages et saute avec A.'
  };
  function hints(extra) {
    var o = {}, k; for (k in HINTS_COMMON) { o[k] = HINTS_COMMON[k]; }
    if (extra) { for (k in extra) { o[k] = extra[k]; } }
    return o;
  }
  function hintsPad(extra) {
    var o = {}, k; for (k in HINTS_PAD) { o[k] = HINTS_PAD[k]; }
    if (extra) { for (k in extra) { o[k] = extra[k]; } }
    return o;
  }

  var L14 = {
    id: 'poupet', number: 14, playable: true, world: 3,
    name: 'Mont Poupet',
    massif: 'Jura bordier, département du Jura',
    place: 'Salins-les-Bains / Saint-Thiébaud (39110)',
    route: 'Boucle depuis la Place des Vieilles-Salines, Salins-les-Bains',
    mapRoute: 'Boucle depuis Salins-les-Bains',
    altitude: 851,
    altitudeStart: 330,
    difficulty: { label: 'Difficile à très difficile', stars: 3, of: 5, note: 'Le site de Salins-les-Bains classe la boucle « Difficile » (15,4 km, 5,5 h, 676 m D+). Jura Tourisme la classe « Très difficile » (mêmes 15,4 km / 5,5 h, +693 / −695 m). Visorando, sur un tracé proche (14,73 km, +607 m), la dit « Moyenne ». La difficulté tient à la longueur et au dénivelé, pas à un passage technique d\u2019escalade.' },
    hike: { distanceKm: 15.4, ascentM: 676, duration: '≈ 5 h 30', note: 'Boucle officielle depuis la Place des Vieilles-Salines (salins-les-bains.com) : 15,4 km, 5,5 h, 676 m D+. Jura Tourisme donne +693 / −695 m sur le même kilométrage. Visorando : 14,73 km, +607 m, point bas 319 m, point haut 846 m. Une variante plus courte (~500 m de dénivelé, 3–4 h A/R) est aussi indiquée par le site de Salins, toujours depuis la place. Départ typifié à ≈ 330 m (Visorando, parking près du camping / rives de la Furieuse).' },
    firstAscent: { value: 'Non documentée', note: 'Aucune date de première ascension alpine n\u2019a été trouvée. Le mont est un belvédère et un lieu d\u2019usage ancien au-dessus de la cité thermale : ce n\u2019est pas une « première » de type alpin. L\u2019histoire documentée concerne notamment Louis Pasteur, qui y réalisa des expériences sur la « génération spontanée » (Jura Tourisme).' },
    visitors: { value: 'Non documentée (site très fréquenté)', note: 'Aucun comptage annuel n\u2019a été trouvé. Le site de Salins et la presse locale (actu.fr) parlent d\u2019une fréquentation accrue (randonnée, VTT, parapente), avec des effets déjà signalés (surpiétinement, déchets, dérangement de la faune). On reste sur le sentier.' },
    story: [
      'Le Mont Poupet culmine à 851 m selon le site de Salins-les-Bains et le magazine des belvédères de Jura Tourisme (850 m, ou altitude maximale 848 m, sur la fiche d\u2019itinéraire de Jura Tourisme). Il domine Salins-les-Bains et la Grande Saline, inscrite au patrimoine mondial de l\u2019UNESCO.',
      'La boucle officielle part de la Place des Vieilles-Salines : 15,4 km, environ 5 h 30, 676 m de dénivelé positif selon Salins-les-Bains (Jura Tourisme donne +693 / −695 m sur le même kilométrage). Par temps clair, la vue porte sur la plaine Doloise, le massif jurassien, et jusqu\u2019aux Alpes et au Mont-Blanc. Une table d\u2019orientation équipe le sommet.',
      'C\u2019est aussi un site de parapente réputé. L\u2019atterrissage officiel FFVL de la Croix Mérin (terrain n° 783, 513 m, Saint-Thiébaud) est associé au décollage du Poupet (terrain n° 781, Poupet Vol Libre) : c\u2019est là que se pose, dans le jeu, le vol venu du Txindoki.',
      'Louis Pasteur y réalisa des expériences sur la « génération spontanée » (Jura Tourisme). Les pentes mêlent forêts, prairies et crête. La presse locale signale une fréquentation accrue (randonnée, VTT, parapente), sans comptage annuel publié.'
    ],
    history: 'Le Mont Poupet (851 m selon salins-les-bains.com et le magazine des belvédères de Jura Tourisme ; 850 m / altitude max. 848 m sur la fiche d\u2019itinéraire de Jura Tourisme) domine Salins-les-Bains et la Grande Saline, inscrite au patrimoine mondial de l\u2019UNESCO. La vue porte, par temps clair, sur la plaine Doloise, le massif jurassien et jusqu\u2019aux Alpes et au Mont-Blanc. C\u2019est aussi un site de parapente réputé : l\u2019atterrissage officiel FFVL de la Croix Mérin (terrain n° 783, 513 m, Saint-Thiébaud) est associé au décollage du Poupet (terrain n° 781, Poupet Vol Libre). Louis Pasteur y mena des expériences sur la génération spontanée (Jura Tourisme).',
    recap: 'Sommet emblématique de 851 m au-dessus de Salins-les-Bains : boucle officielle de 15,4 km et +676 à +693 m depuis la cité thermale. Table d\u2019orientation, vue sur la plaine Doloise et, par temps clair, les Alpes ; site de parapente ; Pasteur y fit des expériences sur la génération spontanée.',
    mission: 'Tu atterris près du Poupet, à la Croix Mérin. Forêt, puis pâturages : laisse passer les <b>vaches montbéliardes</b> (triangle au bord de l\u2019écran). L\u2019herbe mouillée glisse. Vers le sommet, un peu de vent. <b>4 bouteilles</b> t\u2019attendent. La table d\u2019orientation marque l\u2019arrivée.',
    sources: [
      { label: 'Salins-les-Bains — Mont Poupet depuis Salins-les-Bains (15,4 km, 5,5 h, 676 m D+, difficile, 851 m, Place des Vieilles-Salines)', url: 'https://www.salins-les-bains.com/randonnees/mont-poupet-salins-les-bains/' },
      { label: 'Jura Tourisme — Salins les Bains et le Mont Poupet (15,4 km, 5,5 h, +693 / −695 m, très difficile, alt. max. 848 m, Pasteur, UNESCO)', url: 'https://www.jura-tourism.com/itineraire/salins-les-bains-et-le-mont-poupet/' },
      { label: 'Jura Tourisme — D\u2019un belvédère à l\u2019autre (Mont Poupet 851 m, plaine Doloise)', url: 'https://www.jura-tourism.com/magazine-jura/dun-belvedere-a-lautre-les-plus-beaux-panoramas-du-jura/' },
      { label: 'Salins-les-Bains — Belvédère du Mont Poupet (851 m, accès pied ou voiture, parapente)', url: 'https://www.salins-les-bains.com/belvederes/mont-poupet/' },
      { label: 'Visorando — Mont Poupet depuis Salins-les-Bains (14,73 km, +607 m, moyenne, point haut 846 m)', url: 'https://www.visorando.com/randonnee-mont-poupet-depuis-salins/' },
      { label: 'actu.fr — fréquentation accrue du Mont Poupet (sans comptage annuel)', url: 'https://actu.fr/bourgogne-franche-comte/salins-les-bains_39500/salins-les-bains-accueil-sport-tourisme-quel-avenir-pour-le-mont-poupet_60222611.html' }
    ],
    play: {
      theme: 'poupet', stairsMat: 'stone',
      water: { max: 100, start: 100, drainPerSec: 1.4, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.2 },
      stars: { timeFast: 90, timeOk: 140, waterGood: 24, waterOk: 6 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.50, winZoomLand: 0.64, winLook: 0.76,
      pieces: [
        { t: 'flat',  len: 220, hint: 'start' },
        { t: 'slope', len: 280, rise: 26, hint: 'water' },
        { t: 'slope', len: 260, rise: 22, zone: 'wet', hint: 'wet' },
        { t: 'flat',  len: 210, cows: { f: 0.55, n: 1, breed: 'montbeliarde', trig: 240, spacing: 2.8 }, hint: 'cows' },
        { t: 'slope', len: 300, rise: 36, bottle: 0.5, boulders: [0.62] },
        { t: 'gap',   len: 18, hint: 'gap' },
        { t: 'slope', len: 260, rise: 28, hint: 'water' },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 320, rise: 38, raptors: { kind: 'buzzard', pebbles: [6.8, 9.2] }, find: [{ id: 'pasteur', f: 0.4 }], hint: 'pebbles' },
        { t: 'slope', len: 260, rise: 24, zone: 'wet', boulders: [0.45] },
        { t: 'flat',  len: 220, cows: { f: 0.5, n: 2, breed: 'montbeliarde', trig: 230, period: 12, spacing: 2.8 }, hint: 'cows' },
        { t: 'slope', len: 300, rise: 40, bottle: 0.45, find: [{ id: 'table', f: 0.55 }] },
        { t: 'gap',   len: 20 },
        { t: 'slope', len: 280, rise: 32, zone: 'storm', hint: 'storm', bottle: 0.5 },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 260, rise: 28, bottle: 0.4, find: [{ id: 'para', f: 0.62 }] },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { pasteur: { name: 'Stèle Pasteur', icon: 'pasteur' }, table: { name: 'Table d\u2019orientation', icon: 'table' }, para: { name: 'Aire de parapente', icon: 'para' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Boucle depuis Salins-les-Bains : montbéliardes sur le sentier.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis Salins-les-Bains : montbéliardes sur le sentier.'
      })
    }
  };
  L14.play.finds.pasteur.name = 'Rappel de Pasteur';

  var L15 = {
    id: 'dor', number: 15, playable: true, world: 3,
    name: 'Mont d\u2019Or',
    massif: 'Massif du Jura, Haut-Doubs',
    place: 'Métabief / Rochejean / Longevilles-Mont-d\u2019Or (25370 / 25370 / 25370)',
    route: 'Boucle officielle du PNR du Haut-Jura, depuis Les Granges Raguin (Rochejean)',
    mapRoute: 'Depuis Rochejean, par les crêtes',
    altitude: 1463,
    altitudeStart: null,
    difficulty: { label: 'Moyenne (boucle officielle 3 h 45)', stars: 3, of: 5, note: 'Le Parc naturel régional du Haut-Jura publie une boucle « Le Mont d\u2019Or et ses chalets » : 13,4 km, +478 / −477 m, 3 h 45, depuis Les Granges Raguin près de Rochejean. Ce n\u2019est pas une cotation d\u2019escalade : la vigilance porte sur le rebord des falaises (Arrêté de protection de biotope) et sur le pastoralisme. Un accès plus court existe depuis le parking du Mont d\u2019Or ou, en saison, par le télésiège du Morond puis le sentier des crêtes (Doubs Tourisme : 6 km A/R).' },
    hike: { distanceKm: 13.4, ascentM: 478, duration: '≈ 3 h 45', note: 'Itinéraire officiel Geotrek du PNR du Haut-Jura : 13,4 km, +478 m, 3 h 45, boucle depuis Les Granges Raguin (Rochejean), par les pâturages, le parking, les falaises, le sommet à 1 463 m, puis la crête et la borne 72 près de la frontière. L\u2019altitude de départ n\u2019est pas figée ici (non indiquée sur la fiche). Doubs Tourisme mentionne aussi un accès au parking par Rochejean ou Longevilles-Mont-d\u2019Or, et un accès par le télésiège 6 places du Morond (Métabief) puis 6 km A/R de crête.' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. Montagne façonnée par l\u2019homme depuis plus de 2 000 ans selon le Département du Doubs ; le nom viendrait du celte « dor », la montagne.' },
    visitors: { value: 'Non documentée (site très fréquenté)', note: 'Aucun comptage annuel trouvé. Station de Métabief à son pied, GTJ, ski, VTT : fréquentation importante, surtout en saison.' },
    story: [
      'Le Mont d\u2019Or culmine à 1 463 m : c\u2019est le point culminant du département du Doubs (Montagnes du Jura, Département du Doubs, Doubs Tourisme). Côté français, des pentes douces d\u2019alpages ; côté suisse, de hautes falaises (environ 150 m selon ViaCluny) qui regardent la Vallée de Joux et le lac de Joux. Le Département du Doubs le situe en contrebas de voisins suisses plus élevés (Chasseron, Suchet, vers 1 600 m).',
      'La boucle officielle du PNR du Haut-Jura part des Granges Raguin, près de Rochejean : 13,4 km, +478 m, environ 3 h 45, parmi les chalets d\u2019estive, jusqu\u2019aux falaises puis au sommet. La crête est un belvédère : par temps clair, plus de 300 sommets des Alpes, dont le Mont-Blanc (Montagnes du Jura, ViaCluny). On y voit aussi le lac de Joux, Jougne et la vallée de la Jougnena.',
      'La falaise est un anticlinal calcaire, protégée par un arrêté préfectoral de protection du biotope : les activités y sont très réglementées (Département du Doubs). Chamois, chevreuils, lynx, faucon pèlerin et grand corbeau y trouvent refuge. Les montbéliardes pâturent les alpages. On reste sur le sentier, on referme les barrières, on ne cueille pas les fleurs (gentianes notamment).'
    ],
    history: 'Toit du Doubs à 1 463 m, le Mont d\u2019Or oppose ses alpages français à une falaise côté suisse, au-dessus de la Vallée de Joux. Le site est reconnu à plusieurs titres (Natura 2000, Espace naturel sensible, APPB de la corniche). Aucune première alpine n\u2019a été trouvée ; le Département du Doubs rappelle un usage très ancien et une étymologie celtique possible (« dor », la montagne).',
    recap: 'Toit du Doubs, 1 463 m : boucle officielle de 13,4 km et +478 m depuis Rochejean, falaises protégées côté suisse, vue sur les Alpes, le Mont-Blanc et la Vallée de Joux, chalets d\u2019estive et montbéliardes.',
    mission: 'Pâturages et <b>montbéliardes</b>, puis crête au-dessus de la <b>falaise</b> (reste sur le sentier). Un <b>chamois</b> peut traverser. La <b>borne</b> de crête marque l\u2019approche du sommet. <b>4 bouteilles</b>.',
    sources: [
      { label: 'PNR du Haut-Jura / Geotrek — Le Mont d\u2019Or et ses chalets (13,4 km, +478 m, 3 h 45, 1 463 m, Granges Raguin, borne 72)', url: 'https://randonature.parc-haut-jura.fr/fr/trek/180411-Le-Mont-d-Or-et-ses-chalets' },
      { label: 'Montagnes du Jura — Le sommet du Mont d\u2019Or (1 463 m, toit du Doubs, falaises côté suisse, vue sur les Alpes et le Mont-Blanc)', url: 'https://www.montagnes-du-jura.fr/montagnes-du-jura-une-destination-nature/pratiquer-la-randonnee/randonnez-entre-cols-et-sommets/le-sommet-du-mont-dor/' },
      { label: 'Département du Doubs — Mont d\u2019Or (1 463 m, APPB de la falaise, chamois, lynx)', url: 'https://www.doubs.fr/equipement/mont-dor/' },
      { label: 'Doubs Tourisme — Le Mont d\u2019Or (1 463 m, parking, télésiège du Morond, 6 km A/R de crête)', url: 'https://www.doubs.travel/monts-et-sommets/le-mont-dor' },
      { label: 'ViaCluny — Vue du Mont d\u2019Or (falaises d\u2019environ 150 m, lac de Joux, Jougne, plus de 300 sommets alpins)', url: 'https://www.viacluny.fr/patrimoine/vue-du-mont-dor/' }
    ],
    play: {
      theme: 'dor', stairsMat: 'stone', windCycle: 8.2, windWarn: 1.0, windGust: 2.0,
      water: { max: 100, start: 100, drainPerSec: 1.38, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.1 },
      stars: { timeFast: 92, timeOk: 145, waterGood: 22, waterOk: 6 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.50, winZoomLand: 0.64, winLook: 0.72,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 260, rise: 24, hint: 'water', bottle: 0.48 },
        { t: 'flat',  len: 200, cows: { f: 0.5, n: 1, breed: 'montbeliarde', trig: 230, spacing: 2.8 }, hint: 'cows' },
        { t: 'slope', len: 280, rise: 30, zone: 'sun', hint: 'sun', find: [{ id: 'chalet', f: 0.42 }] },
        { t: 'flat',  len: 180, cows: { f: 0.48, n: 1, breed: 'montbeliarde', trig: 230, period: 12 }, hint: 'cows' },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 300, rise: 36, look: 'ridge', hint: 'cliff', bottle: 0.42 },
        { t: 'gap',   len: 16, look: 'ridge', hint: 'cliff' },
        { t: 'slope', len: 260, rise: 28, look: 'ridge', chamois: { f: 0.5, n: 1, trig: 240, spacing: 2.8 }, hint: 'chamois' },
        { t: 'slope', len: 280, rise: 26, zone: 'storm', hint: 'storm', find: [{ id: 'borne', f: 0.5 }] },
        { t: 'slope', len: 240, rise: 22, look: 'ridge', bottle: 0.5 },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 220, rise: 18, look: 'ridge', bottle: 0.4, find: [{ id: 'epicea', f: 0.62 }] },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { borne: { name: 'Borne de crête (frontière)', icon: 'borne' }, chalet: { name: 'Chalet d\u2019alpage', icon: 'chalet' }, epicea: { name: 'Épicéa « toupie »', icon: 'epicea' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Boucle depuis Rochejean, par les alpages du Mont d\u2019Or.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis Rochejean, par les alpages du Mont d\u2019Or.'
      })
    }
  };

  var L16 = {
    id: 'van', number: 16, playable: true, world: 3,
    name: 'Creux du Van',
    massif: 'Massif du Jura, canton de Neuchâtel',
    place: 'Noiraigue (Val-de-Travers, Suisse)',
    route: 'Sentier des 14 contours, de Noiraigue au Soliat',
    mapRoute: 'Depuis Noiraigue, 14 contours',
    altitude: 1464,
    altitudeStart: null,
    difficulty: { label: 'Sportive / assez exigeant (J3L)', stars: 4, of: 5, note: 'Neuchâtel Tourisme (J3L) classe le Sentier des 14 contours, de Noiraigue au Soliat, « sportive » (technique) et « assez exigeant » (condition), avec 745 m de montée. Ce n\u2019est pas une cotation d\u2019escalade : la difficulté vient de la longueur de la montée en épingles et de l\u2019exposition au rebord du cirque. On reste sur le sentier, dans la réserve.' },
    hike: { distanceKm: 12, ascentM: 745, duration: 'Non documentée (fiche J3L)', note: 'Fiche officielle J3L / Neuchâtel Tourisme : Noiraigue \u2013 Le Soliat, +745 m / −9 m, sportive, assez exigeant. creuxduvan.com donne, pour le même sentier mythique, 12 km et 730 m de dénivelé. Suisse Tourisme évoque une boucle d\u2019environ 14 km et 4 à 5 h. On retient le dénivelé officiel J3L (+745 m) et, à titre indicatif, 12 km (creuxduvan.com). L\u2019altitude de départ à Noiraigue n\u2019est pas figée sur la fiche J3L. Les topos citent 1 464 m au Soliat (parfois 1 463 m au panneau) ; on retient 1 464 m, valeur courante, avec cette réserve. Une variante plus courte passe par la Ferme Robert ; un accès routier existe jusqu\u2019au restaurant du Soliat (ce n\u2019est pas la voie jouée).' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. Cirque d\u2019érosion, site naturel d\u2019usage ancien, aujourd\u2019hui réserve naturelle.' },
    visitors: { value: 'Non documentée (site très fréquenté)', note: 'Aucun comptage annuel trouvé. Site majeur du Jura suisse, aussi accessible en voiture jusqu\u2019au restaurant du Soliat : forte fréquentation.' },
    story: [
      'Le Creux du Van est un cirque rocheux naturel du Jura neuchâtelois. Suisse Tourisme le décrit comme une arène de 1,4 km de large et d\u2019environ 200 m de profondeur, formée par les glaciers et l\u2019érosion. On l\u2019atteint classiquement par le Sentier des 14 contours, depuis Noiraigue : une succession de virages en épingle qui se raccourcissent à mesure de l\u2019ascension (J3L : +745 m, sportive, assez exigeant).',
      'L\u2019arrivée se fait au Soliat, sur le rebord du cirque. Les topos citent 1 464 m (parfois 1 463 m au panneau) ; une croix de bois et, selon les topos, une table d\u2019orientation marquent le point haut. La vue porte sur le cirque, l\u2019arc du Jura, le plateau suisse et, par temps clair, les Alpes jusqu\u2019au Mont-Blanc et à l\u2019Eiger (Suisse Tourisme).',
      'La réserve abrite bouquetins (une espèce alpine), chamois, lynx et grand tétras (creuxduvan.com, Suisse Tourisme). Tôt le matin ou en fin d\u2019après-midi, on peut les apercevoir au bord du rocher. Les activités sont réglementées (pas de drone, pas de parapente, chiens tenus, sentiers balisés). Des vaches allaitantes pâturent les abords : J3L déconseille fortement de venir avec un chien.'
    ],
    history: 'Cirque d\u2019érosion de 1,4 km de large et d\u2019environ 200 m de profondeur, le Creux du Van est l\u2019une des formations naturelles les plus célèbres du Jura suisse. Le Soliat (1 464 m, valeur courante des topos) porte une croix de bois. La réserve protège une faune remarquable, notamment des bouquetins, peu typiques du Jura.',
    recap: 'Cirque neuchâtelois de 1,4 km sur 200 m : sentier des 14 contours depuis Noiraigue, +745 m (J3L), arrivée au Soliat (1 464 m), croix de bois, bouquetins et chamois, vue sur le cirque et les Alpes.',
    mission: 'Les <b>14 contours</b> se resserrent. Au rebord, tu vois le <b>cirque</b> : reste sur le sentier. <b>Bouquetin</b> et <b>chamois</b> possibles (avertissement au bord de l\u2019écran). La <b>croix de bois</b> du Soliat marque l\u2019arrivée. <b>4 bouteilles</b>.',
    sources: [
      { label: 'Neuchâtel Tourisme / J3L — Sentier des 14 contours, Noiraigue \u2013 Le Soliat (+745 m, sportive, assez exigeant)', url: 'https://www.j3l.ch/fr/V2229/a-faire/sport-loisirs/randonnee/sentier-des-14-contours' },
      { label: 'creuxduvan.com — Accès, sentier des Quatorze contours (12 km, 730 m), réserve, bouquetins et chamois', url: 'https://www.creuxduvan.com/creux-du-van.html' },
      { label: 'Suisse Tourisme — Creux du Van (cirque de 1,4 km sur 200 m, bouquetins, chamois, vue jusqu\u2019au Mont-Blanc)', url: 'https://www.myswitzerland.com/fr-ch/decouvrir/creux-du-van-spectacle-naturel/' },
      { label: 'Altituderando — Le Soliat (1 464 m) : croix de bois, panneau à 1 463 m', url: 'https://www.altituderando.com/Le-Soliat-1464m-et-Signal-du-Lessy-1388m-en-boucle-par-Bevaix-et-le-sentier-des' }
    ],
    play: {
      theme: 'van', stairsMat: 'stone', windCycle: 8.0, windWarn: 1.0, windGust: 2.0,
      water: { max: 100, start: 100, drainPerSec: 1.45, bottleGain: 58, thirstDamageEvery: 5, jumpCost: 3.3 },
      stars: { timeFast: 100, timeOk: 155, waterGood: 22, waterOk: 6 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.68,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 260, rise: 26, zone: 'shade', hint: 'water', bottle: 0.5 },
        { t: 'flat',  len: 180, cows: { f: 0.5, n: 1, breed: 'estive', trig: 230, spacing: 2.8 }, hint: 'cows' },
        { t: 'stairs', len: 200, rise: 52, hint: 'lacets', find: [{ id: 'mur', f: 0.48 }] },
        { t: 'slope', len: 220, rise: 24, hint: 'lacets' },
        { t: 'stairs', len: 160, rise: 44, hint: 'lacets', bottle: 0.45 },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'stairs', len: 140, rise: 40, hint: 'lacets' },
        { t: 'slope', len: 240, rise: 22, chamois: { f: 0.48, n: 1, trig: 240, spacing: 2.8 }, hint: 'chamois' },
        { t: 'slope', len: 260, rise: 28, look: 'ridge', hint: 'cirque', bottle: 0.5 },
        { t: 'gap',   len: 16, look: 'ridge', hint: 'cirque' },
        { t: 'slope', len: 240, rise: 20, look: 'ridge', ibex: { f: 0.5, n: 1, trig: 250, spacing: 3.0 }, hint: 'bouquetin', find: [{ id: 'soliat', f: 0.55 }] },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 200, rise: 16, look: 'ridge', bottle: 0.4, find: [{ id: 'ibex', f: 0.58 }] },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { soliat: { name: 'Croix de bois du Soliat', icon: 'soliat' }, mur: { name: 'Mur de pierres sèches', icon: 'mur' }, ibex: { name: 'Bouquetin du Soliat', icon: 'ibex' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Sentier des 14 contours, depuis Noiraigue. Réserve : reste sur le sentier.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis Noiraigue, 14 contours. Réserve : reste sur le sentier.'
      })
    }
  };

  var L17 = {
    id: 'colombier', number: 17, playable: true, world: 3,
    name: 'Grand Colombier',
    massif: 'Massif du Jura, Bugey (Ain)',
    place: 'Culoz (01350)',
    route: 'Aller-retour officiel depuis Culoz, par le GR9 et le belvédère du Fenestrez',
    mapRoute: 'Depuis Culoz, par le Fenestrez',
    altitude: 1534,
    altitudeStart: 296,
    difficulty: { label: 'Très exigeante (fiche officielle, 8 h)', stars: 5, of: 5, note: 'La fiche « Le Grand Colombier depuis Culoz » (Office de tourisme Bugey Sud / Ain Outdoor, reprise par Haut-Rhône Tourisme) décrit un aller-retour « très exigeant » le long du GR9 et de la GTJ : 26 km, +1 300 m, 8 h. Ce n\u2019est pas une cotation d\u2019escalade : la difficulté tient à la longueur et au dénivelé, depuis la ville jusqu\u2019aux crêtes. Des accès plus courts existent depuis le col (route fermée en hiver) : ce n\u2019est pas la voie jouée ici.' },
    hike: { distanceKm: 26, ascentM: 1300, duration: '≈ 8 h', note: 'Fiche officielle Ain Outdoor / OT Bugey Sud Grand Colombier (APIDAE) : 26 km (25,9 km sur la fiche Outdooractive), +1 300 m, 8 h, aller-retour depuis Culoz, balisage blanc-rouge (GR9). Passage au belvédère du Fenestrez (1 077 m sur cette fiche ; une page ENS du col indique 1 150 m pour une table « Le Fenestrez » : on retient 1 077 m, chiffre de la fiche de randonnée) puis à la Croix (1 525 m). Le sommet du Grand Colombier est à 1 534 m (Ain Tourisme). Le point le plus bas indiqué pour cet itinéraire est 296 m (Outdooractive / APIDAE).' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. « Géant du Bugey », estives et belvédère d\u2019usage ancien. Le col, fermé en hiver, est un col cycliste du Tour de France (première en 2012, Ain Tourisme).' },
    visitors: { value: 'Non documentée (site très fréquenté)', note: 'Aucun comptage annuel trouvé. Col routier, randonnées et cyclisme : fréquentation importante hors saison hivernale.' },
    story: [
      'Le Grand Colombier, 1 534 m, est l\u2019un des bastions les plus méridionaux du massif du Jura, dans l\u2019Ain, souvent surnommé le « géant du Bugey » (Ain Tourisme). Il domine la vallée du Rhône. Par temps clair, depuis la table d\u2019orientation près de la Croix, on voit le Mont-Blanc, les Alpes, et trois lacs : le Bourget, Annecy et le Léman (OT Bugey Sud).',
      'La voie officielle depuis Culoz, accessible à la gare (ligne Lyon\u2013Genève), est un aller-retour très exigeant de 26 km et +1 300 m, environ 8 h, par le GR9 (Ain Outdoor / OT Bugey Sud). Elle passe au belvédère du Fenestrez (1 077 m selon la fiche), vue plongeante sur le lac du Bourget, le Rhône et Culoz, puis suit la crête jusqu\u2019à la Croix (1 525 m), proche du sommet.',
      'Au printemps, les alpages se couvrent de crocus, puis de jonquilles et de narcisses (OT Bugey Sud). On ne cueille pas les fleurs. Des troupeaux pâturent : on les contourne, on referme les clôtures, on tient les chiens (consignes de la fiche officielle). La route des lacets, depuis Culoz ou Anglefort, est célèbre chez les cyclistes ; dans le jeu, la montée typifie ces virages sur le sentier.'
    ],
    history: 'Pointe méridionale du Jura face aux Alpes, le Grand Colombier (1 534 m) est le géant du Bugey. Sa croix (1 525 m) et sa table d\u2019orientation offrent l\u2019un des grands panoramas de la région : Mont-Blanc, Rhône, lacs du Bourget, d\u2019Annecy et Léman. Le col, gravé au Tour de France depuis 2012, a quatre faces d\u2019ascension. Aucune première alpine n\u2019a été trouvée.',
    recap: 'Géant du Bugey, 1 534 m : aller-retour officiel de 26 km et +1 300 m depuis Culoz (8 h), belvédère du Fenestrez sur le Bourget et le Rhône, croix et table d\u2019orientation, crocus au printemps, vue sur le Mont-Blanc.',
    mission: 'Longue montée, <b>lacets</b>, puis crête. Des <b>vaches</b> dans les alpages. Le <b>vent</b> souffle près de la croix. La <b>table d\u2019orientation</b> marque l\u2019arrivée. <b>5 bouteilles</b>.',
    sources: [
      { label: 'Haut-Rhône Tourisme / Ain Outdoor — Le Grand Colombier depuis Culoz (26 km, +1 300 m, 8 h, Fenestrez 1 077 m, Croix 1 525 m)', url: 'https://www.hautrhone-tourisme.fr/equipement/randonnee-pedestre-le-grand-colombier-depuis-culoz-culoz/' },
      { label: 'Outdooractive — même fiche APIDAE OT Bugey Sud (25,9 km, +1 300 m, 8 h, point bas 296 m, point haut 1 530 m)', url: 'https://www.outdooractive.com/fr/route/randonnee/massif-du-jura/randonnee-pedestre-le-grand-colombier-depuis-culoz/67101924/' },
      { label: 'Ain Tourisme — Massif du Grand Colombier (1 534 m, géant du Bugey, vue Mont-Blanc et trois lacs, lacets, Tour de France)', url: 'https://www.ain-tourisme.com/decouvrir-richesses-naturelles/au-coeur-de-la-nature/massif-du-grand-colombier/' },
      { label: 'OT Bugey Sud — Panoramas (table d\u2019orientation à la Croix, Fenestrez, crocus / jonquilles / narcisses, GR9 depuis Culoz 8 km +945 m jusqu\u2019au Fenestrez)', url: 'https://www.bugeysud-tourisme.fr/decouvrir/le-grand-colombier/panorama-sur-les-alpes/' }
    ],
    play: {
      theme: 'colombier', stairsMat: 'stone', windCycle: 8.4, windWarn: 1.0, windGust: 2.2,
      water: { max: 100, start: 100, drainPerSec: 1.55, bottleGain: 58, thirstDamageEvery: 5, jumpCost: 3.4 },
      stars: { timeFast: 118, timeOk: 180, waterGood: 20, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.70,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 300, rise: 32, hint: 'water', bottle: 0.5 },
        { t: 'slope', len: 280, rise: 30, zone: 'shade', find: [{ id: 'crocus', f: 0.5 }] },
        { t: 'flat',  len: 180, cows: { f: 0.5, n: 1, breed: 'estive', trig: 230, spacing: 2.8 }, hint: 'cows' },
        { t: 'stairs', len: 180, rise: 48, hint: 'lacets' },
        { t: 'slope', len: 240, rise: 28, hint: 'lacets', bottle: 0.42 },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 260, rise: 26, look: 'flank', hint: 'sun', zone: 'sun', find: [{ id: 'croixcol', f: 0.45 }] },
        { t: 'stairs', len: 140, rise: 36, hint: 'lacets' },
        { t: 'flat',  len: 200, cows: { f: 0.48, n: 1, breed: 'estive', trig: 230, period: 13 }, hint: 'cows', bottle: 0.5 },
        { t: 'slope', len: 300, rise: 34, zone: 'storm', look: 'ridge', hint: 'storm', find: [{ id: 'tablecol', f: 0.5 }] },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 240, rise: 22, look: 'ridge', bottle: 0.4 },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { tablecol: { name: 'Table d\u2019orientation de la Croix', icon: 'tablecol' }, crocus: { name: 'Crocus et jonquilles', icon: 'crocus' }, croixcol: { name: 'Croix du Grand Colombier', icon: 'croixcol' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Depuis Culoz, par le GR9 et le Fenestrez. Longue montée : surveille ta gourde.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis Culoz, par le Fenestrez. Longue montée : surveille ta gourde.'
      })
    }
  };

  var L18 = {
    id: 'dole', number: 18, playable: true, world: 3,
    name: 'La Dôle',
    massif: 'Montagnes du Jura suisse, frontière franco-suisse',
    place: 'Départ : parking des Dappes, Prémanon (France) ; sommet en Suisse',
    route: 'Boucle depuis le parking des Dappes (balisage suisse, losanges jaunes)',
    mapRoute: 'Boucle depuis le parking des Dappes',
    altitude: 1677,
    altitudeStart: 1242,
    difficulty: { label: 'Difficile / moyen selon les topos', stars: 3, of: 5, note: 'Jura Tourisme classe la boucle « Difficile » (8,7 km, +589 m, 3,5 h). Jura Outdoor : 8,6 km, +614 m, 4 h, « Difficile ». Altituderando : « Moyen », ≈ 10 km, +600 m, 4 h. Pente soutenue dans les pâturages, crête ventée ; pas de passage d\u2019escalade sur la voie décrite. Papiers d\u2019identité : le sentier passe la frontière (Jura Tourisme).' },
    hike: { distanceKm: 8.7, ascentM: 589, duration: '≈ 3 h 30 à 4 h', note: 'Boucle officielle Jura Tourisme / fiche 15 de la Station des Rousses : 8,7 km, +589 m, 3,5 h, départ Parking des Dappes-Nord à Prémanon. Altituderando donne un départ à 1242 m et un sommet à 1677 m. Jura Outdoor : 8,6 km, +614 m, 4 h. La fiche Jura Tourisme indique aussi une altitude max. de 1666 m et, au sommet du télésiège, « LA DÔLE, 1667 m » : on retient 1677 m comme altitude du sommet, largement reprise (Jura Tourisme, Jura Outdoor, Altituderando).' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. Estives et frontière d\u2019usage ancien ; le sommet porte aujourd\u2019hui une station de MétéoSuisse et un radar d\u2019aviation pour l\u2019aéroport de Genève (Jura Outdoor).' },
    visitors: { value: 'Non documentée', note: 'Aucun comptage annuel trouvé. Site très identifiable, aussi domaine skiable côté Les Rousses.' },
    story: [
      'La Dôle, 1 677 m, est le deuxième sommet du Jura suisse, après le Mont Tendre (1 679 m, Confédération suisse / Canton de Vaud). Jura Tourisme la présente ainsi comme « le plus haut sommet des Montagnes du Jura Suisse après le Mont Tendre ». On l\u2019atteint classiquement depuis le parking français des Dappes, à Prémanon : boucle officielle de 8,7 km et +589 m, environ 3 h 30 (Jura Tourisme). Il faut ses papiers : le sentier passe la frontière, balisé en losanges jaunes côté suisse.',
      'Le sommet se reconnaît à son radôme blanc (souvent appelé « boule blanche ») : un radar Skyguide de contrôle aérien pour l\u2019aéroport de Genève, posé sur un bâtiment pierre et métal, et, à proximité, une station de MétéoSuisse (Jura Outdoor, photos du sommet). L\u2019entrée des installations est interdite. Le panorama porte sur le Léman, Genève et la chaîne des Alpes, jusqu\u2019au Mont-Blanc.',
      'Jura Outdoor et Jura Tourisme mentionnent la possibilité d\u2019observer des chamois dans le cirque, avec prudence. Aucune première alpine ni aucun comptage annuel n\u2019ont été trouvés.'
    ],
    history: 'La Dôle, 1 677 m, est le deuxième sommet du Jura suisse, après le Mont Tendre (1 679 m). Jura Tourisme la présente comme « le plus haut sommet des Montagnes du Jura Suisse après le Mont Tendre ». Son radôme blanc (radar Skyguide pour Genève, station MétéoSuisse à proximité) la rend reconnaissable. Le panorama porte sur le Léman, Genève et la chaîne des Alpes (Mont-Blanc). Jura Outdoor signale aussi la possibilité d\u2019observer des chamois dans le cirque, avec prudence. L\u2019entrée des installations techniques est interdite.',
    recap: 'Deuxième sommet du Jura suisse (1 677 m), après le Mont Tendre (1 679 m), atteint depuis le parking français des Dappes : boucle de 8,7 km et +589 m, radôme Skyguide et station MétéoSuisse, vue sur le Léman et les Alpes, chamois possibles.',
    mission: 'Pâturages d\u2019altitude, puis crête : le <b>vent des crêts</b> souffle. Un <b>chamois</b> peut traverser (avertissement au bord de l\u2019écran). Le <b>radôme blanc</b> du sommet marque l\u2019arrivée. <b>4 bouteilles</b>.',
    sources: [
      { label: 'Jura Tourisme — La Dôle à Prémanon (8,7 km, +589 m, 3,5 h, difficile, 1677 m, parking des Dappes, frontière, chamois)', url: 'https://www.jura-tourism.com/itineraire/la-dole/' },
      { label: 'Jura Outdoor — La Dôle (8,6 km, +614 m, 4 h, radar et MétéoSuisse, chamois, 1677 m)', url: 'https://www.jura-outdoor.com/trek/1185-La-Dole' },
      { label: 'Altituderando — La Dôle (1677 m) par les Dappes (départ 1242 m, +600 m, ≈ 10 km, 4 h)', url: 'https://www.altituderando.com/La-Dole-1677m-par-les-Dappes' },
      { label: 'Jura Tourisme — D\u2019un belvédère à l\u2019autre (massif de la Dôle, 1677 m, « champignon blanc », parking des Dappes)', url: 'https://www.jura-tourism.com/magazine-jura/dun-belvedere-a-lautre-les-plus-beaux-panoramas-du-jura/' },
      { label: 'Jura Tourisme — La Dôle (1 677 m), patrimoine : « le plus haut sommet des Montagnes du Jura Suisse après le Mont Tendre »', url: 'https://www.jura-tourism.com/patrimoine-naturel/la-dole-1677-m/' },
      { label: 'Confédération suisse / aboutswitzerland.eda.admin.ch — Le Jura : Mont-Tendre 1 679 m, sommet le plus haut du Jura suisse ; Dôle 1 677 m', url: 'https://www.aboutswitzerland.eda.admin.ch/fr/le-jura' },
      { label: 'Canton de Vaud — Le Mont Tendre', url: 'https://www.vaud.ch/tourisme/activites/le-mont-tendre/' }
    ],
    play: {
      theme: 'dole', stairsMat: 'stone', windCycle: 8.0, windWarn: 1.0, windGust: 2.2,
      water: { max: 100, start: 100, drainPerSec: 1.48, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.3 },
      stars: { timeFast: 95, timeOk: 148, waterGood: 22, waterOk: 6 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.70,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 280, rise: 28, hint: 'water', bottle: 0.48 },
        { t: 'slope', len: 300, rise: 36, boulders: [0.5] },
        { t: 'flat',  len: 200, chamois: { f: 0.5, n: 1, trig: 240, spacing: 2.8 }, hint: 'chamois' },
        { t: 'slope', len: 280, rise: 32, zone: 'sun', hint: 'sun', find: [{ id: 'bornesuisse', f: 0.48 }] },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 300, rise: 40, zone: 'storm', hint: 'storm', bottle: 0.45 },
        { t: 'gap',   len: 18, hint: 'gap' },
        { t: 'slope', len: 260, rise: 28, chamois: { f: 0.45, n: 1, trig: 240, period: 14 }, hint: 'chamois' },
        { t: 'slope', len: 280, rise: 30, bottle: 0.5, find: [{ id: 'dome', f: 0.55 }] },
        { t: 'slope', len: 240, rise: 24, zone: 'storm', hint: 'storm' },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 240, rise: 22, bottle: 0.4, find: [{ id: 'meteo', f: 0.62 }] },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { dome: { name: 'Boule blanche (radôme Skyguide, 19 m)', icon: 'dome' }, bornesuisse: { name: 'Borne frontière', icon: 'bornesuisse' }, meteo: { name: 'Radôme MétéoSuisse', icon: 'meteo' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Boucle depuis le parking des Dappes (balisage suisse).'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis le parking des Dappes (balisage suisse).'
      })
    }
  };

  var L19 = {
    id: 'colomby', number: 19, playable: true, world: 3,
    name: 'Colomby de Gex',
    massif: 'Haute Chaîne du Jura (Ain)',
    place: 'Pays de Gex, départ au col de la Faucille',
    route: 'Depuis le col de la Faucille, par les crêtes',
    altitude: 1688,
    altitudeStart: null,
    difficulty: { label: 'Moyenne à difficile (longueur de crête)', stars: 4, of: 5, note: 'Visorando / RandoBase : boucle d\u2019environ 13,8 km et +687 à +690 m depuis le col de la Faucille, 5 à 6 h. Longue marche de crête, exposée au vent, sans passage d\u2019escalade majeur sur cette voie. L\u2019altitude de départ (col de la Faucille) n\u2019est pas reprise ici faute de chiffre unique figé dans les fiches consultées.' },
    hike: { distanceKm: 13.8, ascentM: 690, duration: '≈ 5 h à 6 h', note: 'Randonnée depuis le parking du col de la Faucille, boucle d\u2019environ 13,8 km et +687–690 m (Visorando, RandoBase). Le sommet, 1688 m, est marqué par un pylône métallique d\u2019environ 10 m, visible de loin (Office de tourisme Pays de Gex / Monts Jura, Ain Tourisme).' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. Crêt de la Haute Chaîne, estives et balcon du Léman d\u2019usage ancien.' },
    visitors: { value: 'Non documentée', note: 'Aucun comptage annuel trouvé.' },
    story: [
      'Le Colomby de Gex culmine à 1 688 m sur la Haute Chaîne du Jura, dans l\u2019Ain (certaines fiches donnent 1 689 m). Un pylône métallique d\u2019environ 10 m, visible de loin, le rend reconnaissable (Office de tourisme du Pays de Gex).',
      'La voie depuis le col de la Faucille est une longue boucle de crête d\u2019environ 13,8 km et +687 à +690 m, pour 5 à 6 h (Visorando, RandoBase). On y gagne le « balcon du Léman » : le lac, le bassin de Genève, les Alpes et le Mont-Blanc, et la suite de la crête vers le Reculet et le Crêt de la Neige.',
      'Le sommet est dans la réserve naturelle nationale de la Haute Chaîne du Jura. Aucune première alpine ni aucun comptage annuel n\u2019ont été trouvés. L\u2019altitude de départ au col n\u2019est pas figée ici, faute de chiffre unique dans les fiches retenues.'
    ],
    history: 'Le Colomby de Gex, 1688 m (parfois 1689 m selon certaines fiches), est l\u2019un des sommets de la Haute Chaîne, dans la réserve naturelle nationale. Le pylône d\u2019environ 10 m le rend reconnaissable. La vue est celle du « balcon du Léman » : Genève, le lac, les Alpes et le Mont-Blanc, ainsi que la crête vers le Reculet et le Crêt de la Neige.',
    recap: 'Crêt de 1688 m sur la Haute Chaîne, depuis le col de la Faucille : boucle d\u2019environ 13,8 km et +690 m, pylône d\u2019environ 10 m, panorama sur le Léman et le Mont-Blanc.',
    mission: 'Longue <b>crête ventée</b>, quelques blocs, le <b>brouillard</b> possible. Le <b>pylône</b> d\u2019une dizaine de mètres marque l\u2019arrivée. <b>5 bouteilles</b>.',
    sources: [
      { label: 'Visorando — Le Colomby de Gex depuis le Col de la Faucille', url: 'https://www.visorando.com/randonnee-le-colomby-de-gex-depuis-le-col-de-la-fa/' },
      { label: 'RandoBase — Le Colomby de Gex depuis le Col de la Faucille (13,8 km, +690 m)', url: 'https://randobase.fr/massifs/jura/colomby-gex-faucille/' },
      { label: 'OT Pays de Gex — Monts Jura, Le Colomby de Gex, toute une histoire (pylône ≈ 10 m)', url: 'https://www.paysdegex-montsjura.com/colomby-de-gex-toute-une-histoire/' }
    ],
    play: {
      theme: 'colomby', stairsMat: 'stone', windCycle: 7.5, windWarn: 1.0, windGust: 2.3,
      water: { max: 100, start: 100, drainPerSec: 1.5, bottleGain: 58, thirstDamageEvery: 5, jumpCost: 3.3 },
      stars: { timeFast: 110, timeOk: 170, waterGood: 20, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.72,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 300, rise: 30, hint: 'water', bottle: 0.48 },
        { t: 'slope', len: 280, rise: 34, boulders: [0.5], bottle: 0.4, find: [{ id: 'stele', f: 0.72 }] },
        { t: 'gap',   len: 18, hint: 'gap' },
        { t: 'slope', len: 300, rise: 36, zone: 'sun', hint: 'sun' },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 320, rise: 40, zone: 'wind', hint: 'wind', bottle: 0.5 },
        { t: 'slope', len: 240, rise: 22, zone: 'fog', fog: 0.4, hint: 'fog', find: [{ id: 'chamogex', f: 0.5 }] },
        { t: 'flat',  len: 180, chamois: { f: 0.5, n: 1, trig: 240 }, hint: 'chamois' },
        { t: 'slope', len: 300, rise: 34, boulders: [0.45, 0.75], bottle: 0.45, find: [{ id: 'pylon', f: 0.5 }] },
        { t: 'gap',   len: 20 },
        { t: 'slope', len: 260, rise: 28, zone: 'wind', hint: 'wind' },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 240, rise: 24, bottle: 0.4 },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { pylon: { name: 'Pylône du Colomby (≈ 10 m)', icon: 'pylon' }, stele: { name: 'Stèle Fluckiger', icon: 'stele' }, chamogex: { name: 'Chamois de la Haute Chaîne', icon: 'chamogex' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Depuis le col de la Faucille, par les crêtes.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis le col de la Faucille, par les crêtes.'
      })
    }
  };

  var L20 = {
    id: 'reculet', number: 20, playable: true, world: 3,
    name: 'Le Reculet',
    massif: 'Haute Chaîne du Jura (Ain), RNN',
    place: 'Thoiry / Lélex (Ain)',
    route: 'Crête de la Haute Chaîne (hauts sommets), souvent enchaîné depuis Lélex',
    mapRoute: 'Crête de la Haute Chaîne, souvent depuis Lélex',
    altitude: 1718,
    altitudeStart: null,
    difficulty: { label: 'Très difficile (crête des hauts sommets)', stars: 4, of: 5, note: 'L\u2019Office de tourisme du Pays de Gex décrit une randonnée des « hauts sommets » depuis Lélex : 15,6 km, +1 095 m, ≈ 7 h 30, « très difficile ». Elle enchaîne notamment le Reculet et le Crêt de la Neige. Ce n\u2019est pas une cotation d\u2019escalade : la difficulté vient de la longueur, du dénivelé et de l\u2019engagement en réserve naturelle.' },
    hike: { distanceKm: 15.6, ascentM: 1095, duration: '≈ 7 h 30 (hauts sommets depuis Lélex)', note: 'Fiche OT Pays de Gex / Monts Jura : 15,6 km, +1 095 m, ≈ 7 h 30, très difficile, depuis Lélex — itinéraire de crête qui inclut le Reculet (et le toit du massif). L\u2019altitude de départ de Lélex n\u2019est pas figée ici. Une montée plus directe depuis Thoiry existe aussi, sans fiche kilométrique unique retenue parmi les sources ouvertes consultées.' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. En 1892, quatre habitants de Thoiry ont hissé au sommet une croix de 1 600 kg (Office de tourisme du Pays de Gex). C\u2019est un fait d\u2019histoire locale, pas une date de première ascension.' },
    visitors: { value: 'Non documentée', note: 'Aucun comptage annuel trouvé. Le sommet est dans la réserve naturelle nationale de la Haute Chaîne du Jura (chiens interdits, même tenus en laisse).' },
    story: [
      'Le Reculet est l\u2019un des plus hauts sommets du massif, dans la réserve naturelle nationale de la Haute Chaîne du Jura. Les guides citent souvent 1 718 m ou 1 719 m ; une campagne de géodésie (repère IGN69) lui donne 1 717,14 m. On retient ici 1 718 m, valeur courante des topos, avec cette réserve.',
      'En 1892, quatre habitants de Thoiry ont hissé au sommet une croix de 1 600 kg (Office de tourisme du Pays de Gex). C\u2019est un fait d\u2019histoire locale, pas une date de première ascension — aucune première alpine n\u2019a été trouvée.',
      'L\u2019itinéraire de référence des « hauts sommets » depuis Lélex fait 15,6 km, +1 095 m, environ 7 h 30, et est classé très difficile (OT Pays de Gex). Il enchaîne notamment le Reculet et le toit du massif. Dans la réserve, les chiens sont interdits même en laisse ; on reste sur les sentiers balisés.'
    ],
    history: 'Le Reculet est l\u2019un des plus hauts sommets du massif. Les guides et offices citent souvent 1 718 m ou 1 719 m ; une campagne de géodésie (repère IGN69, résultats publiés notamment via l\u2019UNIL) lui donne 1 717,14 m, derrière le point culminant « J1 » (1 720,83 m, emplacement non publié) et à peu près au niveau du Crêt de la Neige « de sentier ». On retient ici 1 718 m, valeur courante des topos, avec cette réserve. La grande croix de fer, 1 600 kg, a été élevée en 1892 par quatre habitants de Thoiry.',
    recap: 'Haut sommet de la RNN Haute Chaîne, souvent coté 1 718 m, couronné par la croix de 1 600 kg élevée en 1892 : randonnée de crête des hauts sommets depuis Lélex (15,6 km, +1 095 m, ≈ 7 h 30).',
    mission: 'Réserve naturelle : reste sur le sentier. <b>Chamois</b> possibles, <b>lapiaz</b> et un peu de <b>brouillard</b>. Un <b>lynx</b> peut apparaître au loin, dans la lisière : il ne s\u2019approche pas. La <b>grande croix</b> marque l\u2019arrivée. <b>5 bouteilles</b>.',
    sources: [
      { label: 'OT Pays de Gex — Monts Jura, hauts sommets depuis Lélex (15,6 km, +1 095 m, 7 h 30, très difficile) ; croix du Reculet (1 600 kg, 1892, quatre habitants de Thoiry)', url: 'https://www.paysdegex-montsjura.com/' },
      { label: 'UNIL / IRIS — Détermination du point culminant du massif du Jura (Reculet 1 717,14 m, J1 1 720,83 m non publié, RNN)', url: 'https://iris.unil.ch/handle/iris/143917' },
      { label: 'Ain Tourisme — hauts sommets de la Haute Chaîne (Reculet, Crêt de la Neige, Colomby)', url: 'https://www.ain-tourisme.com/' }
    ],
    play: {
      theme: 'reculet', stairsMat: 'stone', windCycle: 8.0, windWarn: 1.0, windGust: 2.2,
      water: { max: 100, start: 100, drainPerSec: 1.52, bottleGain: 58, thirstDamageEvery: 5, jumpCost: 3.4 },
      stars: { timeFast: 120, timeOk: 185, waterGood: 20, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.47, winZoomLand: 0.62, winLook: 0.70,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 300, rise: 32, hint: 'water', bottle: 0.48 },
        { t: 'slope', len: 280, rise: 34, boulders: [0.5], hint: 'lapiaz', find: [{ id: 'lapiaz', f: 0.32 }] },
        { t: 'flat',  len: 200, chamois: { f: 0.5, n: 1, trig: 240 }, hint: 'chamois' },
        { t: 'slope', len: 260, rise: 28, karst: [0.55], hint: 'doline' },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 320, rise: 42, zone: 'storm', hint: 'storm', bottle: 0.45 },
        { t: 'slope', len: 240, rise: 22, zone: 'fog', fog: 0.48, hint: 'fog' },
        { t: 'flat',  len: 160, hint: 'lynx', find: [{ id: 'tetra', f: 0.45 }] },
        { t: 'slope', len: 300, rise: 36, boulders: [0.4, 0.7], bottle: 0.5, find: [{ id: 'croix', f: 0.5 }], hint: 'lapiaz' },
        { t: 'gap',   len: 18, hint: 'gap' },
        { t: 'slope', len: 260, rise: 28, chamois: { f: 0.55, n: 1, trig: 240, period: 15 }, bottle: 0.4 },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 240, rise: 24, bottle: 0.42 },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { croix: { name: 'Croix du Reculet (1892)', icon: 'croix' }, tetra: { name: 'Grand tétras', icon: 'tetra' }, lapiaz: { name: 'Lapiaz', icon: 'lapiaz' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Crête de la Haute Chaîne, souvent depuis Lélex. Zone de réserve : reste discret.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Haute Chaîne depuis Lélex. Réserve : reste discret.'
      })
    }
  };

  var L21 = {
    id: 'neige', number: 21, playable: true, world: 3,
    name: 'Crêt de la Neige',
    massif: 'Haute Chaîne du Jura (Ain), RNN',
    place: 'Entre Lélex et Thoiry (Ain)',
    route: 'Depuis Lélex, ou crête des hauts sommets (même famille que le Reculet)',
    mapRoute: 'Depuis Lélex, ou crête des hauts sommets',
    altitude: 1720,
    altitudeStart: null,
    difficulty: { label: 'Très difficile (toit du massif / crête)', stars: 5, of: 5, note: 'Depuis Lélex, l\u2019office indique 6,5 km et 850 m de dénivelé jusqu\u2019au Crêt de la Neige (option télécabine de la Catheline pour réduire d\u2019environ 500 m). L\u2019enchaînement des hauts sommets (15,6 km, +1 095 m, 7 h 30, très difficile) est la course de crête de référence. Dans la RNN : chiens interdits même en laisse ; zones de quiétude du 15 décembre au 30 juin, hors sentiers balisés expressément ouverts. Rester sur le sentier.' },
    hike: { distanceKm: 6.5, ascentM: 850, duration: 'montée depuis Lélex (plus longue en crête : ≈ 7 h 30 / 15,6 km)', note: 'OT Pays de Gex : depuis le village de Lélex, 850 m de dénivelé positif et 6,5 km. L\u2019enchaînement officiel des hauts sommets depuis Lélex fait 15,6 km et +1 095 m, ≈ 7 h 30, très difficile. Le jeu typifie l\u2019arrivée au toit du massif, pas un unique tracé au mètre.' },
    firstAscent: { value: 'Non documentée', note: 'Aucune première alpine trouvée. Sommet de crête pastorale et de réserve naturelle, pas une « première » de type alpin.' },
    visitors: { value: 'Non documentée', note: 'Aucun comptage annuel trouvé. L\u2019emplacement exact du point culminant « J1 » (1 720,83 m) n\u2019est pas publié, pour protéger le site (campagne de géodésie, RNN). Le jeu typifie le point de vue accessible depuis le sentier, sans prétendre poser le randonneur sur J1.' },
    story: [
      'Le Crêt de la Neige est le nom traditionnel du toit du massif du Jura, longtemps coté 1 720 m par les offices et les cartes courantes. Une campagne de GPS différentiel a identifié le point le plus haut, « J1 », à 1 720,83 ± 0,05 m (repère IGN69) ; ses coordonnées ne sont pas publiées, pour protéger le site. Le toponyme porté par le sentier se situe un peu plus bas (environ 1 718 m selon cette étude). On retient 1 720 m comme altitude usuelle, avec cette précision.',
      'Depuis Lélex, l\u2019office indique 6,5 km et 850 m de dénivelé (une télécabine peut réduire l\u2019approche d\u2019environ 500 m). L\u2019enchaînement des hauts sommets fait 15,6 km et +1 095 m, environ 7 h 30, très difficile. La crête offre un lapiaz, des pins à crochets, et une vue sur le Léman et le Mont-Blanc.',
      'La réserve naturelle impose de rester sur le sentier balisé : chiens interdits même en laisse, zones de quiétude du 15 décembre au 30 juin hors sentiers expressément ouverts. Le grand tétras et le lynx font partie de la faune protégée — on ne les cherche pas. Le jeu typifie le point de vue accessible depuis le sentier, sans prétendre poser le randonneur sur J1.'
    ],
    history: 'Le Crêt de la Neige est le nom traditionnel du toit du massif, longtemps coté 1 720 m (offices, cartes courantes). Une campagne de GPS différentiel a identifié le point le plus haut, « J1 », à 1 720,83 ± 0,05 m (repère IGN69) ; ses coordonnées ne sont pas communiquées au public. Le toponyme porté par le sentier et les cartes se situe un peu plus bas (environ 1 718 m selon cette étude, au niveau du point dit CDLN). On retient 1 720 m comme altitude usuelle du toit, avec cette précision. Lapiaz, pins à crochets, vue sur le Léman et le Mont-Blanc, faune discrète (grand tétras, lynx).',
    recap: 'Toit usuel du massif du Jura, 1 720 m (point géodésique J1 à 1 720,83 m, emplacement non publié) : montée depuis Lélex (6,5 km, +850 m) ou crête des hauts sommets, lapiaz et pins à crochets, réserve naturelle.',
    mission: 'Dernier crêt. <b>Lapiaz</b> et <b>dolines</b>, <b>brouillard</b> ou <b>névé</b> selon le versant, <b>grand tétras</b> à laisser passer. Un <b>lynx</b> peut se montrer au loin. Tu arrives sur le sentier du toit — pas sur le point J1, volontairement non indiqué. <b>5 bouteilles</b>.',
    sources: [
      { label: 'OT Pays de Gex — À la découverte du Crêt de la Neige (1 720 m, 6,5 km / +850 m depuis Lélex, RNN, Léman et Mont-Blanc)', url: 'https://www.paysdegex-montsjura.com/decouverte-du-cret-de-la-neige/' },
      { label: 'UNIL / IRIS — Détermination du point culminant du massif du Jura (J1 = 1 720,83 m, non publié ; CDLN et J2 ≈ 1 718 m ; Reculet 1 717,14 m)', url: 'https://iris.unil.ch/handle/iris/143917' },
      { label: 'OT Pays de Gex — hauts sommets depuis Lélex (15,6 km, +1 095 m, 7 h 30, très difficile)', url: 'https://www.paysdegex-montsjura.com/' }
    ],
    play: {
      theme: 'neige', stairsMat: 'stone', windCycle: 7.2, windWarn: 1.0, windGust: 2.4,
      water: { max: 100, start: 100, drainPerSec: 1.55, bottleGain: 58, thirstDamageEvery: 5, jumpCost: 3.4 },
      stars: { timeFast: 125, timeOk: 190, waterGood: 18, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.72,
      pieces: [
        { t: 'flat',  len: 200, hint: 'start' },
        { t: 'slope', len: 300, rise: 32, hint: 'water', bottle: 0.5 },
        { t: 'slope', len: 280, rise: 34, boulders: [0.48], hint: 'lapiaz', find: [{ id: 'neve', f: 0.62 }] },
        { t: 'flat',  len: 200, tetra: { f: 0.5, n: 1, trig: 250 }, hint: 'tetra' },
        { t: 'slope', len: 260, rise: 28, karst: [0.5], hint: 'doline' },
        { t: 'flat',  len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope', len: 300, rise: 38, zone: 'wind', hint: 'wind', bottle: 0.45 },
        { t: 'slope', len: 240, rise: 22, zone: 'fog', fog: 0.5, hint: 'fog' },
        { t: 'slope', len: 220, rise: 18, zone: 'snow', hint: 'snow', find: [{ id: 'geodes', f: 0.5 }] },
        { t: 'flat',  len: 160, hint: 'lynx' },
        { t: 'slope', len: 300, rise: 36, boulders: [0.35, 0.7], bottle: 0.5, find: [{ id: 'pin', f: 0.5 }], hint: 'lapiaz' },
        { t: 'gap',   len: 18, hint: 'gap' },
        { t: 'slope', len: 260, rise: 28, karst: [0.4], hint: 'karst', bottle: 0.4 },
        { t: 'flat',  len: 100, cp: true },
        { t: 'slope', len: 240, rise: 24, bottle: 0.42, tetra: { f: 0.6, n: 1, trig: 240 } },
        { t: 'flat',  len: 200, summit: true }
      ],
      finds: { pin: { name: 'Pin à crochets', icon: 'pin' }, neve: { name: 'Névé tardif', icon: 'neve' }, geodes: { name: 'Borne géodésique', icon: 'geodes' } },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Depuis Lélex, ou par la crête des hauts sommets.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick et saute avec A. Depuis Lélex, ou par la crête des hauts sommets.'
      })
    }
  };

  var INFO = {
    14: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L14), text: 'La boucle réelle est longue (15,4 km) et le site de Salins précise qu\u2019il n\u2019y a ni point d\u2019eau ni refuge au sommet. Ramasse les ' + bottlesIn(L14) + ' bouteilles (ravitaillement symbolique).' }],
      obstacles: [
        { icon: '🐄', name: 'Vaches montbéliardes', real: 'Les pentes du Poupet sont des pâturages et des prairies. La montbéliarde, race emblématique de Franche-Comté, n\u2019est pas nommée sur la fiche de la boucle, mais elle est l\u2019animal typique de ces estives jurassiennes : on la place ici comme troupeau de pâturage, avec un avertissement au bord de l\u2019écran. Dans la vraie vie, on ne traverse pas un troupeau, on referme les barrières, on tient les chiens (le site de Salins indique d\u2019ailleurs « Chiens : Non » sur cette boucle).', src: [0] },
        { icon: '🌿', name: 'Herbe mouillée', real: 'La montée traverse forêts et prairies ; les topos recommandent de bonnes chaussures et déconseillent le givre. Mouillée, l\u2019herbe des pâturages glisse. Dans le jeu, on avance d\u2019un pas régulier.', src: [0] },
        { icon: '💨', name: 'Vent du belvédère', real: 'Le sommet est un belvédère ouvert, aussi site de décollage de parapente. Le jeu place un peu de vent en fin de course, avec le même avertissement que sur les autres crêtes.', src: [3] },
        { icon: '🦅', name: 'Rapace et petit caillou', real: 'Obstacle de jeu (ombre et cri), pas un fait documenté sur cette voie. Le triangle des éboulis n\u2019est pas utilisé ici.', src: [] }
      ],
      enjeux: [
        { t: 'Fréquentation et pelouses : le site est très fréquenté (randonnée, VTT, parapente). La presse locale signale un surpiétinement déjà observé. Rester sur le sentier.', s: [5] },
        { t: 'Chiis tenus / boucle « chiens : non » selon la fiche officielle de Salins. On respecte le pastoralisme et la faune.', s: [0] },
        { t: 'Pas d\u2019eau au sommet : emporter son ravitaillement (salins-les-bains.com).', s: [0] },
        { t: 'Parapente : le décollage du Poupet et l\u2019atterrissage de la Croix Mérin sont des terrains FFVL. On ne s\u2019engage pas sur l\u2019aire de décollage.', s: [3] }
      ],
      items: { water: { where: 'Sur la montée, l\u2019une un peu en hauteur.', why: 'Aucun point d\u2019eau ni refuge au sommet (fiche de Salins). Les bouteilles du jeu sont un ravitaillement symbolique.', src: [0] } }
    },
    15: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L15), text: 'Boucle de 13,4 km, pas de point d\u2019eau de sommet cité sur la fiche du PNR. Ramasse les ' + bottlesIn(L15) + ' bouteilles (ravitaillement symbolique).' }],
      obstacles: [
        { icon: '🐄', name: 'Montbéliardes', real: 'Les alpages français du Mont d\u2019Or sont pâturés ; la montbéliarde est la race typique de ces estives du Doubs. Dans le jeu, un troupeau peut occuper le sentier (avertissement au bord de l\u2019écran). Dans la vraie vie, on ne traverse pas un troupeau, on referme les barrières, on tient les chiens.', src: [0, 2] },
        { icon: '🦌', name: 'Chamois', real: 'Le Département du Doubs cite chamois, chevreuils, lynx, faucon pèlerin et grand corbeau parmi la faune de la corniche. Dans le jeu, un chamois peut traverser le sentier (avertissement). On le laisse passer ; le bousculer coûte un cœur.', src: [2] },
        { icon: '🪨', name: 'Falaise côté suisse', real: 'Côté suisse, la montagne tombe en falaises (environ 150 m selon ViaCluny), protégées par un arrêté de protection du biotope. Le jeu typifie cette exposition par un regard de crête et un petit vide : on reste sur le sentier, on ne descend pas dans l\u2019à-pic.', src: [1, 2, 4] },
        { icon: '💨', name: 'Vent de crête', real: 'Crête ouverte, belvédère sur les Alpes et la Vallée de Joux. Les rafales du jeu sont celles déjà utilisées sur les autres crêtes, avec ~1 s d\u2019avance.', src: [1] }
      ],
      enjeux: [
        { t: 'Arrêté de protection de biotope de la corniche : activités très réglementées. Rester sur le sentier, ne pas s\u2019approcher du bord de la falaise.', s: [2] },
        { t: 'Pastoralisme : refermer les barrières, ne pas traverser les troupeaux, chiens tenus.', s: [0] },
        { t: 'Flore : gentianes notamment ; on ne cueille pas les fleurs (consignes des sites officiels).', s: [1, 2] }
      ],
      items: { water: { where: 'Sur la montée.', why: 'Pas de point d\u2019eau de sommet cité sur la boucle officielle du PNR.', src: [0] } }
    },
    16: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L16), text: 'Montée soutenue (+745 m, J3L). Ramasse les ' + bottlesIn(L16) + ' bouteilles.' }],
      obstacles: [
        { icon: '🐐', name: 'Bouquetin', real: 'La réserve du Creux du Van accueille des bouquetins des Alpes, peu typiques du Jura, ainsi que des chamois (creuxduvan.com, Suisse Tourisme). Dans le jeu, un bouquetin peut se tenir sur les rochers ou traverser (avertissement au bord de l\u2019écran). On le laisse s\u2019éloigner ; le bousculer coûte un cœur. Dans la vraie vie, le déranger est interdit.', src: [1, 2] },
        { icon: '🦌', name: 'Chamois', real: 'Fréquents au rebord du cirque, surtout tôt le matin ou en fin d\u2019après-midi. Même traitement que le bouquetin : avertissement, on s\u2019efface.', src: [1, 2] },
        { icon: '🪨', name: 'Rebord du cirque', real: 'Le cirque mesure 1,4 km de large et environ 200 m de profondeur (Suisse Tourisme). Le jeu typifie le vide par un regard d\u2019amphithéâtre et un petit écart : on reste sur le sentier, on ne s\u2019approche pas de l\u2019à-pic.', src: [2] },
        { icon: '🔁', name: 'Sentier des 14 contours', real: 'Depuis Noiraigue, une succession de virages en épingle qui se raccourcissent (J3L : +745 m, sportive, assez exigeant). Le jeu typifie ces lacets par des marches et des pentes successives, sans reproduire chacun des quatorze virages à l\u2019échelle.', src: [0, 1] },
        { icon: '🐄', name: 'Vaches allaitantes', real: 'Des vaches pâturent les abords. J3L déconseille fortement de venir avec un chien. Dans le jeu, un troupeau peut occuper le sentier (avertissement).', src: [0] }
      ],
      enjeux: [
        { t: 'Réserve naturelle : rester sur les sentiers balisés, pas de drone ni de parapente, chiens tenus — J3L déconseille fortement d\u2019en amener un (vaches allaitantes).', s: [0, 1, 2] },
        { t: 'Faune (bouquetins, chamois, lynx, tétras) : observation à distance, pas de dérangement, surtout au rebord du rocher.', s: [1, 2] },
        { t: 'Le cirque (1,4 km × 200 m) ne peut pas tenir à l\u2019échelle 1 dans le couloir de jeu : l\u2019amphithéâtre est reculé, typifié, ancré au sol.', s: [2] }
      ],
      items: { water: { where: 'Sur la montée.', why: 'Montée longue depuis Noiraigue ; pas de point d\u2019eau de sommet cité sur la fiche J3L.', src: [0] } }
    },
    17: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L17), text: 'Aller-retour officiel de 26 km et +1 300 m. Ramasse les ' + bottlesIn(L17) + ' bouteilles.' }],
      obstacles: [
        { icon: '🔁', name: 'Lacets de la montée', real: 'La voie depuis Culoz est longue (26 km, +1 300 m, 8 h). La route du col, fameuse chez les cyclistes, enchaîne les lacets ; le sentier GR9 grimpe aussi en virages. Le jeu typifie ces lacets par des marches et des pentes, sans calquer le tracé routier.', src: [0, 2] },
        { icon: '🐄', name: 'Troupeaux d\u2019alpage', real: 'Des vaches pâturent les estives. La fiche officielle demande de les contourner, de refermer les clôtures et de tenir les chiens. Dans le jeu, un troupeau peut occuper le sentier (avertissement).', src: [0, 3] },
        { icon: '💨', name: 'Vent de crête', real: 'Crête ouverte face aux Alpes et au Rhône. Rafales de jeu avec avertissement, comme ailleurs.', src: [2] },
        { icon: '🌸', name: 'Crocus (décor)', real: 'Au printemps, les alpages se couvrent de crocus, puis de jonquilles et de narcisses (OT Bugey Sud). Dans le jeu, ce sont des fleurs de décor, on ne les ramasse pas. Dans la vraie vie non plus.', src: [3] }
      ],
      enjeux: [
        { t: 'Itinéraire très exigeant (26 km, +1 300 m, 8 h) : emporter eau et ravitaillement, partir tôt, surveiller la météo.', s: [0] },
        { t: 'Pastoralisme : contourner les troupeaux, refermer les clôtures, chiens tenus (consignes de la fiche officielle).', s: [0, 3] },
        { t: 'Flore de printemps (crocus, jonquilles, narcisses) : on ne cueille pas les fleurs.', s: [3] },
        { t: 'Belvédère du Fenestrez : 1 077 m sur la fiche de randonnée officielle ; une page ENS du col indique 1 150 m pour une table « Le Fenestrez ». On retient 1 077 m, chiffre de la fiche de randonnée.', s: [0] }
      ],
      items: { water: { where: 'Sur la longue montée.', why: '8 h de marche, +1 300 m ; pas de point d\u2019eau de sommet cité sur la fiche officielle.', src: [0] } }
    },
    18: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L18), text: 'Pâturages d\u2019altitude, peu d\u2019ombre. Ramasse les ' + bottlesIn(L18) + ' bouteilles.' }],
      obstacles: [
        { icon: '🦌', name: 'Chamois', real: 'Jura Tourisme et Jura Outdoor mentionnent la possibilité d\u2019observer des chamois dans le cirque, avec prudence. Dans le jeu, un chamois peut traverser le sentier (avertissement au bord de l\u2019écran). On le laisse passer ; le bousculer coûte un cœur.', src: [0, 1] },
        { icon: '💨', name: 'Vent des crêts', real: 'Sommet frontalier exposé, 1677 m. Les rafales du jeu sont celles déjà utilisées sur les autres crêtes, avec ~1 s d\u2019avance.', src: [0] }
      ],
      enjeux: [
        { t: 'Frontière : se munir de ses papiers d\u2019identité (Jura Tourisme). Balisage suisse, losanges jaunes.', s: [0] },
        { t: 'Installations du sommet (radar, MétéoSuisse) : entrée interdite, site surveillé (Jura Outdoor / topos). On les regarde de l\u2019extérieur.', s: [1] },
        { t: 'Pastoralisme et faune : laisser la distance aux chamois et aux troupeaux, refermer, chiens tenus.', s: [0, 1] }
      ],
      items: { water: { where: 'Sur la montée.', why: 'Pas de point d\u2019eau de sommet cité sur la boucle officielle.', src: [0] } }
    },
    19: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L19), text: 'Longue crête. Ramasse les ' + bottlesIn(L19) + ' bouteilles.' }],
      obstacles: [
        { icon: '💨', name: 'Vent de la Haute Chaîne', real: 'Crête ouverte, balcon du Léman. Rafales de jeu avec avertissement, comme ailleurs.', src: [0] },
        { icon: '🌫️', name: 'Brouillard', real: 'La Haute Chaîne se ferme vite. On reste sur le sentier balisé, surtout en réserve naturelle.', src: [] },
        { icon: '🦌', name: 'Chamois', real: 'La Haute Chaîne accueille des chamois. Observation à distance ; dans le jeu, traversée annoncée au bord de l\u2019écran.', src: [] }
      ],
      enjeux: [
        { t: 'Réserve naturelle nationale de la Haute Chaîne du Jura : rester sur les sentiers balisés, chiens interdits même en laisse dans la RNN.', s: [] },
        { t: 'Le pylône (≈ 10 m) est un amer, pas un objet à escalader.', s: [2] }
      ],
      items: { water: { where: 'Sur la crête.', why: 'Ravitaillement symbolique ; emporter son eau sur une longue crête.', src: [0] } }
    },
    20: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L20), text: 'Longue crête d\u2019engagement. Ramasse les ' + bottlesIn(L20) + ' bouteilles.' }],
      obstacles: [
        { icon: '🪨', name: 'Lapiaz et dolines', real: 'Le calcaire de la Haute Chaîne forme un lapiaz, avec dolines et fissures. Dans le jeu, les trous se devinent à l\u2019approche (pas un piège invisible). On ne quitte pas le sentier.', src: [] },
        { icon: '🦌', name: 'Chamois', real: 'Clarines et chamois sont cités sur ces crêtes. Traversée de jeu avec avertissement au bord de l\u2019écran.', src: [] },
        { icon: '🐆', name: 'Lynx (aperçu)', real: 'Le lynx fréquente la RNN ; il est très discret. Dans le jeu, une silhouette peut apparaître en lisière, loin du sentier, sans collision ni poursuite. On ne le cherche pas, on ne le dérange pas.', src: [1] },
        { icon: '🌫️', name: 'Brouillard et vent', real: 'Crête d\u2019altitude, engagement météo réel.', src: [0] }
      ],
      enjeux: [
        { t: 'RNN Haute Chaîne du Jura : chiens interdits même en laisse ; zones de quiétude saisonnières, hors sentiers autorisés. Rester sur le balisage.', s: [1] },
        { t: 'La croix de 1892 (1 600 kg, quatre habitants de Thoiry) est un monument : on ne grimpe pas dessus.', s: [0] },
        { t: 'Altitude : on indique 1 718 m (valeur courante) tout en signalant la mesure 1 717,14 m de la campagne géodésique.', s: [1] }
      ],
      items: { water: { where: 'Sur la crête.', why: 'Pas de fontaine de sommet citée sur la fiche des hauts sommets.', src: [0] } }
    },
    21: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L21), text: 'Toit du massif, course d\u2019engagement. Ramasse les ' + bottlesIn(L21) + ' bouteilles.' }],
      obstacles: [
        { icon: '🪨', name: 'Lapiaz et dolines', real: 'Pavement calcaire typique, fissures et dolines. Dans le jeu, on les voit venir. Dans la vraie vie, un pas à côté du sentier peut blesser une cheville et abîmer un sol précieux.', src: [0] },
        { icon: '❄️', name: 'Névé / brouillard', real: 'Même en saison, des plaques de neige peuvent subsister dans les creux, et la crête se ferme vite. Le jeu typifie l\u2019un et l\u2019autre, sans inventer un calendrier.', src: [0] },
        { icon: '🪶', name: 'Grand tétras', real: 'Espèce de la réserve. Avertissement au bord de l\u2019écran, on s\u2019efface, on ne le cherche pas.', src: [1] },
        { icon: '🐆', name: 'Lynx (aperçu)', real: 'Cité parmi la faune de la RNN. Aperçu discret en lisière, sans collision.', src: [1] }
      ],
      enjeux: [
        { t: 'Le point culminant précis (« J1 », 1 720,83 m) n\u2019est pas publié, pour protéger le site. On jouit de la vue depuis le sentier balisé, sans chercher un cairn secret.', s: [1] },
        { t: 'RNN : chiens interdits même en laisse ; zones de quiétude du 15 décembre au 30 juin hors sentiers expressément ouverts. Rester sur le chemin.', s: [0, 1] },
        { t: 'Pins à crochets et pelouses d\u2019altitude : sol et flore fragiles, on ne coupe pas à travers le lapiaz.', s: [0] }
      ],
      items: { water: { where: 'Sur la montée.', why: 'Pas de point d\u2019eau de sommet cité sur les fiches retenues ; emporter son eau.', src: [0] } }
    }
  };

  /* typo fix in enjeux 14 */
  INFO[14].enjeux[1].t = 'Chiens : la fiche officielle de Salins indique « Chiens : Non » sur cette boucle. On respecte le pastoralisme et la faune.';

  var CARNET = {
    pasteur: { icon: '🔬', where: 'Mont Poupet — caché en hauteur.', why: 'Louis Pasteur y réalisa des expériences sur la « génération spontanée » (Jura Tourisme).' },
    table:   { icon: '🧭', where: 'Mont Poupet — table d\u2019orientation.', why: 'La table d\u2019orientation du belvédère permet de lire le panorama (plaine Doloise, massif jurassien, Alpes par temps clair).' },
    para:    { icon: '🪂', where: 'Mont Poupet — cachée en hauteur, sur le versant.', why: 'Le Mont Poupet est un site de parapente réputé : l\u2019école Poupet Vol Libre est installée à Saint-Thiébaud, au pied du sommet, et plusieurs aires de décollage sont fréquentées toute la saison.', src: 'Salins-les-Bains — Belvédère du Mont Poupet', url: 'https://www.salins-les-bains.com/belvederes/mont-poupet/' },
    borne:   { icon: '🪨', where: 'Mont d\u2019Or — cachée en hauteur, sur la crête.', why: 'La boucle officielle du PNR passe par une borne frontière (borne 72). L\u2019objet du jeu typifie cette borne de crête, sans en copier l\u2019inscription.' },
    chalet:  { icon: '🏠', where: 'Mont d\u2019Or — caché en hauteur, dans les alpages.', why: 'La boucle officielle du PNR du Haut-Jura, « Le Mont d\u2019Or et ses chalets », traverse les alpages où l\u2019estive se tient de fin mai à fin septembre, principalement pour des génisses.', src: 'PNR du Haut-Jura / Geotrek — Le Mont d\u2019Or et ses chalets', url: 'https://randonature.parc-haut-jura.fr/fr/trek/180411-Le-Mont-d-Or-et-ses-chalets' },
    epicea:  { icon: '🌲', where: 'Mont d\u2019Or — caché en hauteur, en lisière de pré-bois.', why: 'Dans les prés-bois typiques de l\u2019arc jurassien, les épicéas broutés par le bétail prennent une forme dense, taillée en toupie : un paysage d\u2019élevage et de forêt indissociable du Haut-Doubs.', src: 'PNR du Haut-Jura / Geotrek — Le Mont d\u2019Or et ses chalets', url: 'https://randonature.parc-haut-jura.fr/fr/trek/180411-Le-Mont-d-Or-et-ses-chalets' },
    soliat:  { icon: '✝️', where: 'Creux du Van (Soliat) — cachée en hauteur.', why: 'Une croix de bois marque le Soliat, sur le rebord du cirque (topos). Hauteur non documentée : croix typifiée.' },
    mur:     { icon: '🧱', where: 'Creux du Van — caché en hauteur, le long du rebord.', why: 'Un mur de pierres sèches borde le cirque du Creux du Van, près du Soliat. Sa réhabilitation, engagée depuis 2009, vise à conserver sa valeur paysagère et à protéger la flore du rebord, fragile face au piétinement.', src: 'État de Neuchâtel — protection du haut plateau du Creux du Van', url: 'https://www.ne.ch/communiques-de-presse/protection-du-haut-plateau-du-creux-du-van-mise-en-oeuvre-des-mesures-urgentes' },
    ibex:    { icon: '🐐', where: 'Creux du Van — caché en hauteur, sur le rebord.', why: 'Des bouquetins ont été introduits au Creux du Van en 1965. L\u2019espèce, devenue emblématique du site, fréquente les vires rocheuses du cirque.', src: 'Suisse Tourisme — Creux du Van', url: 'https://www.myswitzerland.com/fr-ch/decouvrir/creux-du-van-spectacle-naturel/' },
    tablecol:{ icon: '🧭', where: 'Grand Colombier — cachée en hauteur, près de la Croix.', why: 'Une table d\u2019orientation, près de la Croix (1 525 m), permet de lire le panorama : Mont-Blanc, Alpes, lacs du Bourget, d\u2019Annecy et Léman (OT Bugey Sud).' },
    crocus:  { icon: '🌸', where: 'Grand Colombier — caché en hauteur, dans les pelouses.', why: 'Au printemps, les pelouses du Grand Colombier se couvrent de crocus, de jonquilles et de narcisses, avant les grandes floraisons d\u2019été (OT Bugey Sud).', src: 'OT Bugey Sud — Panoramas sur les Alpes', url: 'https://www.bugeysud-tourisme.fr/decouvrir/le-grand-colombier/panorama-sur-les-alpes/' },
    croixcol:{ icon: '✝️', where: 'Grand Colombier — cachée en hauteur, près de la table.', why: 'Une croix métallique, haute d\u2019environ 16 m, marque le sommet dit « la Croix » du Grand Colombier, à 1 525 m, un peu à l\u2019écart de la table d\u2019orientation (OT Bugey Sud).', src: 'OT Bugey Sud — Panoramas sur les Alpes', url: 'https://www.bugeysud-tourisme.fr/decouvrir/le-grand-colombier/panorama-sur-les-alpes/' },
    dome:    { icon: '⚪', where: 'La Dôle — caché en hauteur.', why: 'Le radôme blanc abrite un radar Skyguide (aéroport de Genève) ; une station de MétéoSuisse se trouve à proximité. Entrée interdite.' },
    bornesuisse: { icon: '🪨', where: 'La Dôle — cachée en hauteur, vers la crête.', why: 'La frontière franco-suisse longe le massif de la Dôle au sud et à l\u2019ouest du sommet (1 677 m, canton de Vaud). Les bornes jalonnent cette ligne, un peu à l\u2019écart des radômes.', src: 'Jura Tourisme — La Dôle à Prémanon', url: 'https://www.jura-tourism.com/itineraire/la-dole/' },
    meteo:   { icon: '📡', where: 'La Dôle — caché en hauteur, près du grand radôme.', why: 'Outre le grand radôme Skyguide (19 m) du contrôle aérien de Genève, un plus petit radôme abrite l\u2019un des radars du réseau de MétéoSuisse, sur le même sommet.', src: 'MétéoSuisse — réseau suisse de radars météorologiques', url: 'https://www.meteosuisse.admin.ch/meteo/systemes-de-mesure/atmosphere/le-reseau-suisse-de-radars-meteorologiques.html' },
    pylon:   { icon: '📡', where: 'Colomby de Gex — caché en hauteur.', why: 'Pylône métallique d\u2019environ 10 m, amer du sommet à 1688 m.' },
    stele:   { icon: '🪨', where: 'Colomby de Gex — cachée en hauteur, versant est.', why: 'À quelques mètres du pylône, sur le versant est, une stèle rappelle Fernand Fluckiger, aviateur suisse tombé sur zone le 2 juin 1932.', src: 'OT Pays de Gex — Le Colomby de Gex, toute une histoire', url: 'https://www.paysdegex-montsjura.com/colomby-de-gex-toute-une-histoire/' },
    chamogex:{ icon: '🦌', where: 'Colomby de Gex — caché en hauteur, sur la crête.', why: 'La RNN de la Haute Chaîne du Jura abrite la plus importante population de chamois du massif (environ 600 individus) : éboulis, replats herbeux et sous-bois, d\u2019un versant à l\u2019autre selon l\u2019heure et la saison.', src: 'RNN Haute Chaîne du Jura — Faune', url: 'https://www.rnn-hautechainedujura.fr/patrimoine-naturel/faune/' },
    croix:   { icon: '✝️', where: 'Le Reculet — caché en hauteur.', why: 'Croix de 1 600 kg élevée en 1892 par quatre habitants de Thoiry.' },
    tetra:   { icon: '🪶', where: 'Le Reculet — caché en hauteur, en lisière.', why: 'Animal emblématique de la Haute Chaîne, le Grand tétras fréquente les forêts d\u2019altitude et les pré-bois montagnards de la réserve. Il n\u2019est plus chassé sur le massif du Jura depuis 1974.', src: 'RNN Haute Chaîne du Jura — Faune', url: 'https://www.rnn-hautechainedujura.fr/patrimoine-naturel/faune/' },
    lapiaz:  { icon: '🪨', where: 'Le Reculet — caché en hauteur, sur le calcaire.', why: 'Lapiaz, dolines, creux et gouffres témoignent de l\u2019intense activité du karst sur la Haute Chaîne : des formes de dissolution typiques du calcaire jurassien, à parcourir en restant sur le sentier.', src: 'RNN Haute Chaîne du Jura — Patrimoine naturel', url: 'https://www.rnn-hautechainedujura.fr/patrimoine-naturel/' },
    pin:     { icon: '🌲', where: 'Crêt de la Neige — caché en hauteur.', why: 'Pins à crochets typiques de la crête, sur un lapiaz d\u2019altitude en réserve naturelle.' },
    neve:    { icon: '❄️', where: 'Crêt de la Neige — caché en hauteur, dans une combe.', why: 'Le nom du Crêt de la Neige rappelle les plaques de neige qui s\u2019attardent dans les combes et sur les ubacs. En hiver, l\u2019OT Pays de Gex décrit l\u2019accès en raquettes depuis Lélex, sous réserve des conditions.', src: 'OT Pays de Gex — Sentier raquettes de Lélex au Crêt de la Neige', url: 'https://www.paysdegex-montsjura.com/itineraires/sentier-raquettes-de-lelex-au-cret-de-la-neige/' },
    geodes:  { icon: '📍', where: 'Crêt de la Neige — cachée en hauteur, sur une bosse de crête.', why: 'En 1907, le géodésien André-Louis Cholesky posa une borne sur une bosse secondaire du crêt, jugée plus favorable à la triangulation que le point le plus haut. L\u2019IGN a depuis confirmé l\u2019altitude du sommet vers 1 720 m.', src: 'Wikipédia — Crêt de la Neige', url: 'https://fr.wikipedia.org/wiki/Cr%C3%AAt_de_la_Neige' }
  };

  function attachCarnet(lv) {
    var finds = lv.play && lv.play.finds, id, def, info, src0, list;
    if (!finds) { return; }
    if (lv.carnet && lv.carnet.length) { return; }
    src0 = (lv.sources && lv.sources[0]) || {};
    list = [];
    for (id in finds) {
      if (!Object.prototype.hasOwnProperty.call(finds, id)) { continue; }
      def = finds[id] || {};
      info = CARNET[id] || {};
      list.push({
        id: id,
        name: def.name || id,
        text: info.why || '',
        src: info.src || src0.label || '',
        url: info.url || src0.url || '',
        icon: info.icon || '',
        where: info.where || (lv.name ? (lv.name + ' — caché en hauteur.') : ''),
        why: info.why || ''
      });
    }
    if (list.length) { lv.carnet = list; }
  }
  function plug(lv, idx, ending) {
    if (MAPN[idx - 13]) { lv.node = { x: MAPN[idx - 13][0], y: MAPN[idx - 13][1] }; }
    else if (LV[idx] && LV[idx].node) { lv.node = LV[idx].node; }
    lv.info = INFO[lv.number];
    lv.ending = ending;
    attachCarnet(lv);
    LV[idx] = lv;
  }
  function endingOf(banner) {
    return {
      hideFlag: true, noRing: true, fullBleed: true, noExt: true,
      fx: { clouds: false, vultures: 1, shimmer: true },
      port: {
        banner: banner + '-port', ref: [720, 1280],
        flag: { x: 360, y: 980 }, focus: { x: 360, y: 860 },
        hikerFit: { y0: 880, y1: 1008, ratio: 1.1 },
        anchor: [0.50, 0.78], startShift: -30,
        cloudY: [40, 280], vultureY: [300, 420]
      },
      land: {
        banner: banner + '-land', ref: [1280, 720],
        flag: { x: 640, y: 540 }, focus: { x: 640, y: 500 },
        hikerFit: { y0: 430, y1: 555, ratio: 1.12 },
        anchor: [0.50, 0.76], startShift: -70,
        cloudY: [16, 160], vultureY: [80, 170]
      }
    };
  }

  plug(L14, 13, endingOf('ending-poupet'));
  plug(L15, 14, endingOf('ending-dor'));
  plug(L16, 15, endingOf('ending-van'));
  plug(L17, 16, endingOf('ending-colombier'));
  plug(L18, 17, endingOf('ending-dole'));
  plug(L19, 18, endingOf('ending-colomby'));
  plug(L20, 19, endingOf('ending-reculet'));
  plug(L21, 20, endingOf('ending-neige'));

  var base = D.INFO || {};
  var n;
  for (n in INFO) { base[n] = INFO[n]; }
  D.INFO = base;
  if (D.CARNET) { for (n in CARNET) { D.CARNET[n] = CARNET[n]; } }
  else { D.CARNET = CARNET; }
  /* CARNET_INFO alimente l'inventaire (icône / où / pourquoi).
     Ne pas écraser un id déjà pris par un autre monde (ex. croix / Txindoki). */
  var cb = D.CARNET_INFO || {};
  for (n in CARNET) { if (!cb[n]) { cb[n] = CARNET[n]; } }
  D.CARNET_INFO = cb;
})();
