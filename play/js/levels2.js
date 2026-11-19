/* v0.4.0 — Niveaux 3 à 6 : Puy Mary, puy de Dôme (sentier des Muletiers), puy de Sancy, puy de Dôme (chemin des Chèvres).
   Tous les faits viennent de sources web consultées les 28-31/10/2026 (listes `sources` de chaque niveau). Inconnu = « Non documenté ».
   Nouveautés de gameplay (voir js/game.js) : zones de soleil / d’ombre / de neige / de brouillard / de vent (`zone`), train du Panoramique (`train`),
   randonneurs qui piétinent les dalles fragiles (`crumb[].npc`), marches (grip franc, fatigue accrue), sommet sans cratère (`crater.kind:'plain'`). */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, MAPN = D.MAP.nodes;
  function bottlesIn(lv) { return lv.play.pieces.filter(function (p) { return p.bottle != null; }).length; }
  var WATER_REQ = function (lv) { return [{ id: 'water', name: 'Bouteilles d’eau', count: bottlesIn(lv), text: 'La jauge d’eau baisse en continu (plus vite au soleil et dans les marches) et chaque saut te fatigue : sans ces bouteilles, tu n’atteins pas le sommet. Ramasse-les toutes.' }]; };
  var HINTS_BASE = {
    start:      'Avance avec ◀ ▶ et saute avec ▲ (clavier : flèches + Espace).',
    water:      'Ta jauge d’eau baisse avec le temps. Trouve des bouteilles en chemin !',
    gap:        'Une ravine creusée par l’érosion ! Prends de l’élan et saute par-dessus.',
    checkpoint: 'Point de contrôle : si tu tombes, tu repars d’ici.',
    boulder:    'Un rocher bloque le chemin : saute par-dessus !',
    rocks:      'Saute par-dessus les pierres qui dévalent la pente !',
    stairs:     'Les marches accrochent bien (aucune glissade) mais fatiguent : ta jauge d’eau baisse plus vite.',
    bottle:     'Une bouteille d’eau ! Ramasse-la pour remplir la jauge.',
    crumble:    'Sol fragile ! Ce sol s’effrite : il se fissure puis s’effondre. Traverse sans t’arrêter, ou saute par-dessus.',
    hikers:     'Un autre randonneur arrive sur la dalle fragile : sous son pas elle va céder (un « ! » rouge s’affiche). Traverse avant lui, ou prépare-toi à sauter le trou !',
    train:      'Passage à niveau ! Quand tu approches, les feux clignotent, la cloche sonne et le train du Panoramique des Dômes arrive : attends qu’il soit passé avant de franchir les rails. Il est prioritaire et fait très mal.',
    sun:        'Soleil de plomb : ta jauge d’eau baisse plus vite en plein soleil, moins à l’ombre. Garde de l’eau !',
    snow:       'Neige ! Le sol glisse : anticipe, freine tôt et saute en avance. Les marches, elles, accrochent.',
    wind:       'Des rafales de vent soufflent de face (traits blancs en haut à droite) : elles te ralentissent, surtout en l’air.',
    fog:        'Brouillard près du sommet : on voit moins loin devant ! Les jalons orange et blanc balisent les dangers.'
  };
  var HINTS_PAD = {
    start:   'Avance avec le stick gauche (ou la croix) et saute avec A.',
    boulder: 'Un rocher bloque le chemin : saute par-dessus avec A !',
    crumble: 'Sol fragile ! Il s’effondre vite : traverse sans t’arrêter, ou saute avec A.'
  };
  function hints(extra) { var o = {}, k; for (k in HINTS_BASE) { o[k] = HINTS_BASE[k]; } for (k in (extra || {})) { o[k] = extra[k]; } return o; }

  /* =============================================================== NIVEAU 3 : PUY MARY */
  var L3 = {
    id: 'puy-mary', number: 3, playable: true,
    name: 'Puy Mary', route: 'Depuis le Pas de Peyrol', massif: 'Monts du Cantal, Auvergne', place: 'Le Claux, Dienne, Mandailles-Saint-Julien (Cantal)',
    altitude: 1783, altitudeStart: 1589, startLabel: 'Pas de Peyrol',
    altitudeNote: 'IGN, d’après Wikipédia ; Salers Tourisme annonce 1 787 m.',
    difficulty: { label: 'Facile à moyenne', stars: 2, of: 5, note: 'Salers Tourisme classe la montée depuis le Pas de Peyrol « facile à moyenne » : 239 marches jusqu’à la table d’orientation, sentier très fréquenté.' },
    hike: { distanceKm: 1.4, ascentM: 195, duration: '1 h 15 (aller-retour)', note: 'Depuis le Pas de Peyrol (1 589 m) : 239 marches jusqu’à la table d’orientation (Salers Tourisme). Le jeu ne représente que la montée.' },
    firstAscent: { value: 'Non documentée', note: 'Aucune date de première ascension n’apparaît dans les sources consultées (Wikipédia, Salers Tourisme, Parc des Volcans, Grand Site).' },
    visitors: { value: 'environ 500 000 visiteurs par an', year: 'chiffre indicatif du Grand Site', isEstimate: true, note: 'Ordre de grandeur donné par Wikipédia pour le Grand Site de France. Le dossier de presse du Grand Site (octobre 2023) compte plus de 91 000 passages au sommet entre le 1er janvier et le 17 octobre 2023.' },
    story: [
      'Le Puy Mary culmine à 1 783 m (valeur IGN ; Salers Tourisme donne 1 787 m). C’est le vestige du plus grand stratovolcan d’Europe : le volcan du Cantal, d’environ 70 km de diamètre pour 2 700 km², actif il y a 11 à 3 millions d’années. Le Puy Mary lui-même est un dôme de trachyte vieux d’environ 6,5 millions d’années, dont la forme de corne a été sculptée par les glaciations. Sept vallées glaciaires rayonnent autour de lui.',
      'On le gravit depuis le Pas de Peyrol, à 1 589 m : c’est le plus haut col routier du Massif central. Le sentier ne fait que 1,4 km mais 239 marches (de grandes marches bétonnées de couleur claire), pour 195 m de dénivelé. Du sommet, le panorama couvre le Plomb du Cantal (1 855 m, point culminant du massif), le Sancy au nord, la vallée de la Cère et l’Aubrac au sud.',
      'Mais ce succès a un prix. Le Puy Mary est Grand Site de France depuis le 18 décembre 2012 et attire environ 500 000 visiteurs par an : plus de 91 000 passages au sommet ont été comptés entre le 1er janvier et le 17 octobre 2023. Le piétinement use la pelouse d’altitude, creuse le sol et multiplie les « sentiers sauvages » (rapport IGEDD, 2018). Il tombe en plus environ 2,5 m de pluie par an, qui ravine les sols nus.',
      'Pour protéger le site, des navettes desservent le Pas de Peyrol depuis 2016 et le sentier du GR400 a été remis en état en 2018 : 200 m restaurés avec géotextile, rouleaux de fibres de coco, marches et main courante (environ 20 000 €), en zone Natura 2000. Dans le jeu, d’autres randonneurs te dépassent et font céder les dalles fragiles : c’est l’image du piétinement de masse.'
    ],
    recap: 'Dôme de trachyte d’environ 6,5 millions d’années, vestige du plus grand stratovolcan d’Europe : ≈ 500 000 visiteurs par an et plus de 91 000 passages au sommet en 2023 usent la pelouse d’altitude, d’où marches bétonnées, géotextile et rouleaux de coco (GR400, 2018) et navettes depuis 2016.',
    mission: 'Grimpe jusqu’au sommet sans tomber. Sur ce sentier très fréquenté, <b>d’autres randonneurs montent aussi</b> : leur passage fait <b>céder les dalles fragiles</b> (un « ! » rouge t’avertit) et laisse un trou à sauter. Les <b>marches</b> accrochent bien mais <b>te fatiguent</b>. Attention aussi aux <b>rochers</b>, aux <b>pierres qui dévalent</b>, aux <b>ravines</b> et à ta jauge d’eau : <b>3 bouteilles</b> t’attendent.',
    carnet: [
      { id: 'trachyte', name: 'Bloc de trachyte', text: 'Le Puy Mary est un dôme de trachyte vieux d’environ 6,5 millions d’années . Sa forme de corne a ensuite été sculptée par les glaciations.', src: 'Wikipédia — Puy Mary', url: 'https://fr.wikipedia.org/wiki/Puy_Mary' },
      { id: 'gentiane', name: 'Gentiane jaune', text: 'Le site compte environ 550 espèces de plantes, dont la gentiane jaune. Piétiner ces pelouses, c’est les fragiliser : d’où l’importance de rester sur le sentier.', src: 'Wikipédia — Puy Mary', url: 'https://fr.wikipedia.org/wiki/Puy_Mary' },
      { id: 'coco', name: 'Rouleau de fibres de coco', text: 'En 2018, 200 m du sentier GR400 ont été remis en état avec un géotextile, des rouleaux de fibres de coco, des marches et une main courante (environ 20 000 €), dans un site Natura 2000 .', src: 'Parc des Volcans — Le sentier GR400 du Puy Mary remis en état (24/10/2018)', url: 'https://www.parcdesvolcans.fr/actu/le-sentier-gr400-du-puy-mary-remis-en-etat' }
    ],
    sources: [
      { label: 'Wikipédia — Puy Mary (1 783 m IGN, dôme de trachyte ≈ 6,5 Ma, forme de corne glaciaire, Grand Site de France depuis 2012, ≈ 500 000 visiteurs/an, Pas de Peyrol 1 589 m, ≈ 2,5 m de pluie/an, 550 espèces de plantes, navettes depuis 2016)', url: 'https://fr.wikipedia.org/wiki/Puy_Mary' },
      { label: 'Salers Tourisme — Randonner autour du Puy Mary (1 787 m ; 239 marches, 1,4 km, +195 m, 1 h 15 aller-retour, « facile à moyenne »)', url: 'https://www.salers-tourisme.fr/randonner-autour-du-puy-mary' },
      { label: 'Babel Voyages — Randonnée au Puy Mary (grandes marches bétonnées claires, panorama à 360°, volcan du Cantal de 70 km de diamètre et 11 à 3 Ma)', url: 'https://babel-voyages.com/fr/randonnee-au-puy-mary-un-panorama-volcanique-a-360' },
      { label: 'Parc des Volcans — Le sentier GR400 du Puy Mary remis en état (200 m, géotextile, rouleaux de coco, marches, main courante, ≈ 20 000 €, Natura 2000 ; 24/10/2018)', url: 'https://www.parcdesvolcans.fr/actu/le-sentier-gr400-du-puy-mary-remis-en-etat' },
      { label: 'Grand Site du Puy Mary — dossier de presse d’octobre 2023 (plus de 91 000 passages au sommet du 1er janvier au 17 octobre 2023)', url: 'https://www.puymary.fr/wp-content/uploads/2023/11/Dossier-presse-Grand-Site-du-Puy-Mary-Octobre-2023.pdf' },
      { label: 'IGEDD (2018) — avis sur le Grand Site du Puy Mary (piétinement, érosion, « sentiers sauvages »)', url: 'https://www.igedd.developpement-durable.gouv.fr/IMG/pdf/012470-01_avis_cle558de8.pdf' }
    ],
    play: {
      theme: 'mary', stairsMat: 'concrete',
      water: { max: 100, start: 100, drainPerSec: 1.5, bottleGain: 55, thirstDamageEvery: 5, jumpCost: 3.5 },
      stars: { timeFast: 84, timeOk: 132, waterGood: 28, waterOk: 8 },
      lives: 3, crumble: { fall: 0.8 }, ext: 700, crater: { kind: 'plain' },
      pieces: [
        { t: 'flat',   len: 230, hint: 'start' },
        { t: 'slope',  len: 320, rise: 30, hint: 'water', boulders: [0.6] },
        { t: 'slope',  len: 330, rise: 36, crumb: [{ f: 0.58, w: 36, npc: true, slab: true, fall: 1.0 }], hint: 'hikers' },
        { t: 'slope',  len: 300, rise: 38, boulders: [0.3], bottle: 0.62 },
        { t: 'flat',   len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 370, rise: 44, rocks: [4.4, 6.0], find: [{ id: 'trachyte', f: 0.5 }], hint: 'rocks' },
        { t: 'gap',    len: 24, hint: 'gap' },
        { t: 'slope',  len: 320, rise: 40, crumb: [{ f: 0.3, w: 34, npc: true, slab: true, fall: 1.0 }, { f: 0.8, w: 28, slab: true, fall: 0.4 }], bottle: 0.42 },
        { t: 'flat',   len: 100, cp: true },
        { t: 'stairs', len: 430, rise: 108, rocks: [3.6, 5.0], find: [{ id: 'gentiane', f: 0.45 }], hint: 'stairs' },
        { t: 'slope',  len: 270, rise: 32, boulders: [0.55], crumb: [{ f: 0.3, w: 30, npc: true, slab: true, fall: 1.0 }] },
        { t: 'gap',    len: 26 },
        { t: 'slope',  len: 230, rise: 26, boulders: [0.5], rocks: [3.4, 4.8] },
        { t: 'stairs', len: 470, rise: 124, bottle: 'air:0.6', rocks: [3.6, 4.8], find: [{ id: 'coco', f: 0.4 }] },
        { t: 'flat',   len: 100, cp: true },
        { t: 'slope',  len: 220, rise: 24, boulders: [0.5] },
        { t: 'flat',   len: 250, summit: true }
      ],
      finds: { trachyte: { name: 'Bloc de trachyte', icon: 'trachyte' }, gentiane: { name: 'Gentiane jaune', icon: 'gentiane' }, coco: { name: 'Rouleau de coco', icon: 'coco' } },
      hints: hints({ stairs: 'Les marches de béton clair accrochent bien (aucune glissade) mais fatiguent : ta jauge d’eau baisse plus vite.' }),
      hintsPad: HINTS_PAD
    }
  };

  /* =============================================================== NIVEAU 4 : PUY DE DÔME — SENTIER DES MULETIERS */
  var SRC_DOME = [
    { label: 'Wikipédia — Puy de Dôme (1 465 m, dôme de lave trachytique ≈ 11 000 ans, 550 m de haut et 2 km de large ; sentier des Muletiers : 15 virages numérotés, ≈ 350 m de dénivelé, arrivée ≈ 1 410 m ; temple de Mercure ; expérience de Pascal 1648 ; Grand Site de France 2008 ; UNESCO 2018 ; ≈ 0,5 million de visiteurs/an ; Panoramique des Dômes inauguré le 26 mai 2012)', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' },
    { label: 'Wikipédia — Chaîne des Puys (puys voisins du Dôme : petit puy de Dôme, Côme, Pariou, Grand Sarcoui, Vache et Lassolas ; Limagne à l’est, Monts Dore et Cantal au loin)', url: 'https://fr.wikipedia.org/wiki/Cha%C3%AEne_des_Puys' },
    { label: 'Puy-de-Dôme Tourisme — Le chemin des Muletiers (1,9 km, ≈ 50 min depuis le col de Ceyssat, 365 m de montée, chemin le plus court et le plus sportif, utilisé depuis l’Antiquité)', url: 'https://www.puydedome-tourisme.com/fr/fiche/equipement/le-chemin-des-muletiers-orcines_TFO6453685/' },
    { label: 'Puy-de-Dôme Tourisme — La Boucle des Dômes (entre les virages 2 et 3, on traverse les rails du Panoramique : le train est prioritaire ; virages 3 et 13 très raides)', url: 'https://www.puydedome-tourisme.com/en/fiche/equipement/la-boucle-des-domes-parcours-trail-orcines_TFO5490016/' },
    { label: 'ViaGallica — Puy de Dôme, train panoramique (voie unique à crémaillère de 5,3 km avec une zone d’évitement au croisement du chemin des Muletiers)', url: 'https://www.viagallica.com/auvergne/puy_de_dome_-_train_panoramique.htm' },
    { label: 'Panoramique des Dômes — Les chemins autour du site (le chemin des Muletiers est l’ancien chemin de pèlerinage vers le temple de Mercure)', url: 'https://www.panoramiquedesdomes.fr/les-chemins-autour-du-site/' }
  ];
  var L4 = {
    id: 'puy-de-dome-muletiers', number: 4, playable: true,
    name: 'Puy de Dôme', route: 'Sentier des Muletiers', massif: 'Chaîne des Puys, Auvergne', place: 'Col de Ceyssat, Orcines (Puy-de-Dôme)',
    altitude: 1465, altitudeStart: 1077, startLabel: 'col de Ceyssat',
    altitudeNote: 'Sommet (antenne) à 1 465 m ; l’arrivée du sentier des Muletiers est à environ 1 410 m.',
    difficulty: { label: 'Courte mais difficile', stars: 4, of: 5, note: 'Wikipédia : « court mais difficile » (≈ 19 % de pente moyenne) ; Puy-de-Dôme Tourisme : le chemin le plus court et le plus sportif ; virages 3 et 13 très raides.' },
    hike: { distanceKm: 1.9, ascentM: 365, duration: '≈ 50 min (montée)', note: 'Depuis le col de Ceyssat (Puy-de-Dôme Tourisme). Les sources divergent un peu : ≈ 350 m de dénivelé (Wikipédia, course des Muletiers), 365 m (Tourisme), 387 m jusqu’au temple de Mercure.' },
    firstAscent: { value: 'Non documentée (à pied)', note: 'Pas de première ascension à pied documentée. Par ce chemin : première montée à vélo en 1892 (Fernand Ladoux) et première en automobile le 9 mai 1905 (Auguste Fraignac, 4 h de montée), d’après Wikipédia.' },
    visitors: { value: 'près d’un demi-million de visiteurs par an', year: 'tous accès confondus', isEstimate: false, note: 'Wikipédia : le puy de Dôme est l’un des lieux les plus visités d’Auvergne. Le chiffre ne distingue pas les randonneurs du train et de la route de secours.' },
    story: [
      'Le puy de Dôme, c’est le roi de la Chaîne des Puys : 1 465 m, un dôme de lave trachytique d’environ 11 000 ans, haut de 550 m et large de 2 km à la base, posé sur le plateau granitique des Dômes. Les puys voisins (petit puy de Dôme, puy de Côme, Pariou, Grand Sarcoui…) sont bien plus bas et se voient tout autour de lui.',
      'Le sentier des Muletiers est l’ancien chemin qui monte en 15 virages numérotés, pour environ 350 m de dénivelé. La première partie, sous les arbres, est la plus facile. Après le croisement avec la route et le passage sur la voie à crémaillère, la pente se durcit et les lacets s’enchaînent. Le final, à flanc de rochers, est exposé aux vents ; l’arrivée est à environ 1 410 m, avant un dernier sentier en escaliers jusqu’au temple de Mercure.',
      'Depuis le 26 mai 2012, le Panoramique des Dômes, un train à crémaillère, monte presque jusqu’au sommet. Ses rails croisent le sentier entre les virages 2 et 3 : à pied, c’est le train qui est prioritaire. Dans le jeu, le passage à niveau est placé à mi-parcours pour qu’on le voie bien (dans la réalité, c’est tôt dans la montée) : quand tu approches, les feux clignotent et la cloche sonne, puis le train arrive. Attends qu’il soit passé.',
      'Au-dessus de 1 300 m, la végétation devient rare, voire inexistante au-dessus de 1 400 m, sur ce seul site de la chaîne à l’étage subalpin bien marqué. Le soleil du jeu est une exagération : sur le vrai sentier, c’est surtout un sous-bois assez frais ; les températures dépassent rarement 25 °C en été. Seul le final, découvert, tape (et le vent aussi). Ce lieu est classé Grand Site de France (2008) et fait partie du patrimoine mondial de l’UNESCO (2018) ; les VTT y sont interdits.'
    ],
    recap: 'Dôme de lave trachytique d’environ 11 000 ans, sommet de la Chaîne des Puys (1 465 m) : les Muletiers, ancien chemin en 15 virages (≈ 350 à 387 m de dénivelé), croisent la voie du Panoramique des Dômes (train prioritaire, depuis 2012) ; végétation rare au-dessus de 1 300 m, site classé Grand Site de France (2008) et UNESCO (2018).',
    mission: 'Monte par le sentier des Muletiers, de l’ombre du sous-bois jusqu’au final exposé. <b>Le soleil</b> fait <b>baisser ta jauge d’eau bien plus vite</b> (l’ombre la ménage). À mi-parcours, un <b>passage à niveau</b> : quand tu approches, feux rouges et cloche annoncent <b>le train du Panoramique des Dômes</b>, <b>attends qu’il soit passé</b> (il fait très mal) ! Les <b>marches</b> finales accrochent mais fatiguent. Surveille aussi <b>rochers</b>, <b>pierres qui dévalent</b> et <b>ravines</b> : <b>4 bouteilles</b> t’attendent.',
    carnet: [
      { id: 'domite', name: 'Domite du puy de Dôme', text: 'Le puy de Dôme est constitué en majorité de domite, un trachyte sub-alcalin (nom local de la roche). Il est formé de deux blocs de trachyte emboîtés, nés de deux éruptions espacées de quelques centaines d’années.', src: 'Wikipédia — Puy de Dôme', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' },
      { id: 'pascal', name: 'Baromètre de Pascal', text: 'Le 19 septembre 1648, Blaise Pascal fit réaliser par son beau-frère Périer l’« expérience du puy de Dôme » : la baisse de pression mesurée sur un baromètre à mercure entre Clermont-Ferrand et le sommet montrait que l’air a un poids, la pression atmosphérique.', src: 'Wikipédia — Puy de Dôme', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' },
      { id: 'mercure', name: 'Fragment du temple de Mercure', text: 'Les Gallo-Romains ont bâti au sommet, au Ier ou au IIe siècle, un temple dédié à Mercure, abandonné vers le IIIe ou IVe siècle puis redécouvert en 1872 pendant la construction d’un observatoire. Les Muletiers sont l’ancien chemin de pèlerinage qui y menait.', src: 'Wikipédia — Puy de Dôme ; Panoramique des Dômes', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' }
    ],
    sources: SRC_DOME,
    play: {
      theme: 'muletiers', stairsMat: 'stone',
      water: { max: 100, start: 100, drainPerSec: 1.6, bottleGain: 55, thirstDamageEvery: 5, jumpCost: 3.5 },
      sun: { mult: 1.75 }, shade: { mult: 0.8 },
      stars: { timeFast: 88, timeOk: 138, waterGood: 24, waterOk: 6 },
      lives: 3, crumble: { fall: 0.8 }, ext: 700, crater: { kind: 'plain' },
      pieces: [
        { t: 'flat',   len: 230, zone: 'shade', hint: 'start' },
        { t: 'slope',  len: 290, rise: 34, zone: 'shade', hint: 'water', boulders: [0.55] },
        { t: 'slope',  len: 250, rise: 32, zone: 'shade', bottle: 0.5 },
        { t: 'slope',  len: 310, rise: 46, zone: 'shade', boulders: [0.45], rocks: [4.4] },
        { t: 'gap',    len: 24, zone: 'shade', hint: 'gap' },
        { t: 'slope',  len: 300, rise: 44, zone: 'shade', bottle: 0.6, find: [{ id: 'domite', f: 0.3 }] },
        { t: 'flat',   len: 100, zone: 'shade', cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 240, rise: 22, zone: 'shade' },
        { t: 'flat',   len: 380, zone: 'shade', train: { f: 0.5, w: 46, trig: 190, warn: 1.4, speed: 190 }, hint: 'train' },
        { t: 'slope',  len: 260, rise: 26, zone: 'sun' },
        { t: 'slope',  len: 270, rise: 50, zone: 'sun', hint: 'sun', rocks: [3.6, 5.0] },
        { t: 'slope',  len: 310, rise: 60, zone: 'sun', boulders: [0.35, 0.78], find: [{ id: 'pascal', f: 0.55 }] },
        { t: 'gap',    len: 26, zone: 'sun' },
        { t: 'slope',  len: 290, rise: 52, zone: 'sun', rocks: [3.4, 4.8], bottle: 0.45 },
        { t: 'flat',   len: 100, zone: 'sun', cp: true },
        { t: 'stairs', len: 360, rise: 86, zone: 'sun', rocks: [3.6], hint: 'stairs' },
        { t: 'slope',  len: 250, rise: 40, zone: 'sun', boulders: [0.5], find: [{ id: 'mercure', f: 0.6 }], bottle: 'air:0.3' },
        { t: 'stairs', len: 300, rise: 72, zone: 'sun' },
        { t: 'flat',   len: 260, summit: true }
      ],
      finds: { domite: { name: 'Domite du puy de Dôme', icon: 'domite' }, pascal: { name: 'Baromètre de Pascal', icon: 'pascal' }, mercure: { name: 'Fragment du temple de Mercure', icon: 'mercure' } },
      hints: hints({ stairs: 'Les dernières marches accrochent bien (aucune glissade) mais fatiguent : ta jauge d’eau baisse plus vite.' }),
      hintsPad: HINTS_PAD
    }
  };

  /* =============================================================== NIVEAU 5 : PUY DE SANCY */
  var L5 = {
    id: 'puy-de-sancy', number: 5, playable: true,
    name: 'Puy de Sancy', route: 'Par le Val de Courre', massif: 'Monts Dore, Auvergne', place: 'Mont-Dore (Puy-de-Dôme)',
    altitude: 1885, altitudeStart: 1325, startLabel: 'Station du Puy de Sancy',
    altitudeNote: '1 885 m (1 884,82 m mesuré en 2024), point culminant du Massif central.',
    difficulty: { label: 'Moyenne', stars: 3, of: 5, note: 'Visorando classe la boucle par le Val de Courre « moyenne » (3 h 30). Neige et gel possibles dès octobre ; vent parfois violent.' },
    hike: { distanceKm: 6.68, ascentM: 568, duration: '≈ 3 h 30', note: 'Boucle de la fiche Visorando « Puy de Sancy par le Val de Courre », départ de la station du Puy de Sancy (1 325 m), col de Courre, Pas de l’Âne (1 817 m), puis la fin en escalier de bois.' },
    firstAscent: { value: 'Non documentée', note: 'Aucune date de première ascension n’apparaît dans les sources consultées (Wikipédia, Sancy Tourisme, Parc des Volcans, Visorando).' },
    visitors: { value: 'environ 60 000 randonneurs par an sur le sentier sommital (460 m)', year: 'chiffre cité à propos des travaux de 2015', isEstimate: false, note: 'Chiffre du Parc des Volcans pour la montée finale en escalier. L’année du comptage n’est pas précisée dans la source ; le téléphérique amène en plus d’autres visiteurs, sans chiffre dans nos sources.' },
    story: [
      'Le puy de Sancy culmine à 1 885 m (1 884,82 m d’après une mesure de 2024) : c’est le point culminant du Massif central. Il est fait de trachy-andésite, dont une variété porte son nom, la sancyite. Autour de lui s’alignent les cimes des Monts Dore : puy Ferrand (1 854 m), puy de la Perdrix (1 824 m), pic Intermédiaire, Pan de la Grange, puy de Cacadogne, puy des Crebasses et roc de Cuzeau.',
      'Le jeu suit la boucle du Val de Courre (6,68 km, +568 m) : départ à la station à 1 325 m, montée vers le col de Courre sous le puy Redon, puis le Pas de l’Âne à 1 817 m, et la fin par un escalier de bois d’environ 860 marches (864 d’après Sancy Tourisme). Le téléphérique dépose, lui, les visiteurs à 1 775 m, au pied de cet escalier.',
      'La montagne est haute : la neige arrive dès octobre, des névés subsistent jusqu’à la mi-juillet et le vent peut être violent. Le sommet et l’escalier sont fermés aux piétons de décembre à avril. Dans le jeu, la neige du haut de la montée rend le sol glissant ; l’escalier, lui, accroche.',
      'Le sommet est fragile : environ 60 000 randonneurs par an empruntent les 460 m du sentier sommital. Des travaux en 2015 ont posé 42 déviations d’eau, 543 m de rouleaux de coco, 157 m de murets de pierres sèches et 18 marches de pierre, avec des matériaux héliportés, pour plus de 500 000 €. Résultat cité : l’astérocarpe nain, une plante protégée, est passée de 235 à 2 911 touffes. Les réserves naturelles de Chaudefour (1991) et de Chastreix-Sancy (2007) encadrent le site.'
    ],
    recap: 'Point culminant du Massif central (1 885 m), en trachy-andésite : environ 60 000 randonneurs par an usent les 460 m du sentier sommital, d’où 500 000 € de travaux en 2015 (rouleaux de coco, murets, marches) et un escalier de bois d’environ 860 marches ; l’astérocarpe nain protégé est passé de 235 à 2 911 touffes.',
    mission: 'Monte depuis la station, par la forêt puis la pelouse d’altitude. <b>Plus haut, la neige rend le sol glissant</b> : tu accélères et freines mollement, tu continues sur ta lancée et <b>dans les montées, tu recules</b> si tu t’arrêtes. Près du sommet, <b>le vent</b> souffle de face. Anticipe tes sauts, il y a <b>plus de ravines et de pierres</b> ! Les <b>marches de bois</b> de la fin <b>accrochent</b> (aucune glissade) mais <b>fatiguent</b>. Fais attention aux <b>rochers</b>, aux <b>pierres qui dévalent</b> et aux <b>ravines</b> : <b>7 bouteilles</b> t’attendent.',
    carnet: [
      { id: 'sancyite', name: 'Sancyite', text: 'La roche du sommet est une trachy-andésite dont une variété porte le nom du massif : la sancyite. Le Sancy est le point culminant du Massif central.', src: 'Wikipédia — Puy de Sancy', url: 'https://fr.wikipedia.org/wiki/Puy_de_Sancy' },
      { id: 'soldanelle', name: 'Soldanelle des Alpes', text: 'Cette petite fleur de montagne compte, avec la jasione naine et l’astérocarpe nain, parmi les plantes d’altitude citées pour le sommet du Sancy, où les névés restent jusqu’à la mi-juillet.', src: 'Wikipédia — Puy de Sancy', url: 'https://fr.wikipedia.org/wiki/Puy_de_Sancy' },
      { id: 'asterocarpe', name: 'Astérocarpe nain', text: 'Cette plante protégée est passée de 235 à 2 911 touffes sur le sentier du sommet après les travaux de 2015 (déviations d’eau, rouleaux de coco, murets et marches de pierre) qui ont limité le piétinement et l’érosion.', src: 'Parc des Volcans — Réserve Chastreix-Sancy, travaux et entretien', url: 'https://www.agir.parcdesvolcans.fr/reserve-chastreix-sancy/travaux-et-entretien' }
    ],
    sources: [
      { label: 'Wikipédia — Puy de Sancy (1 885 m ; 1 884,82 m mesuré en 2024 ; trachy-andésite et sancyite ; neige dès octobre, névés jusqu’à mi-juillet ; vent violent ; sommet fermé aux piétons de décembre à avril ; flore d’altitude)', url: 'https://fr.wikipedia.org/wiki/Puy_de_Sancy' },
      { label: 'Sancy Tourisme — Puy de Sancy, incontournable (téléphérique, escalier de bois de 864 marches)', url: 'https://www.sancy.com/decouvrir/incontournables/puy-de-sancy/' },
      { label: 'Sancy Tourisme — fiche patrimoine naturel « Le Puy de Sancy » (Mont-Dore)', url: 'https://www.sancy.com/fr/fiche/patrimoine-naturel/le-puy-de-sancy-mont-dore_TFO4638613/' },
      { label: 'Visorando — Le puy de Sancy par le Val de Courre (6,68 km, +568 m, 3 h 30, « moyenne » ; départ de la station du Puy de Sancy à 1 325 m ; col de Courre, Pas de l’Âne 1 817 m ; gel et neige dès la mi-octobre ; escalier de bois en fin de parcours)', url: 'https://www.visorando.com/randonnee-le-puy-de-sancy-par-le-val-de-courre/' },
      { label: 'Wikipédia — Monts Dore (altitudes des cimes voisines, cols, réserves de Chaudefour et de Chastreix-Sancy)', url: 'https://fr.wikipedia.org/wiki/Monts_Dore' },
      { label: 'Parc des Volcans — Réserve de Chastreix-Sancy : travaux et entretien (60 000 randonneurs/an sur 460 m, travaux de 2015, astérocarpe nain de 235 à 2 911 touffes)', url: 'https://www.agir.parcdesvolcans.fr/reserve-chastreix-sancy/travaux-et-entretien' },
      { label: 'France 3 Auvergne-Rhône-Alpes — De grands travaux au sommet du puy de Sancy (déviations d’eau, rouleaux de coco, murets de pierres sèches, matériaux héliportés, plus de 500 000 €)', url: 'https://france3-regions.franceinfo.fr/auvergne-rhone-alpes/puy-de-dome/de-grands-travaux-au-sommet-du-puy-de-sancy-808681.html' }
    ],
    play: {
      theme: 'sancy', stairsMat: 'wood', windCycle: 10.0,
      water: { max: 100, start: 100, drainPerSec: 1.7, bottleGain: 55, thirstDamageEvery: 5, jumpCost: 3.5 },
      stars: { timeFast: 135, timeOk: 205, waterGood: 24, waterOk: 6 },
      lives: 3, crumble: { fall: 0.8 }, ext: 700, crater: { kind: 'plain' },
      pieces: [
        { t: 'flat',   len: 230, hint: 'start' },
        { t: 'slope',  len: 320, rise: 44, hint: 'water', boulders: [0.55] },
        { t: 'slope',  len: 300, rise: 48, bottle: 0.5, rocks: [4.4] },
        { t: 'gap',    len: 24, hint: 'gap' },
        { t: 'slope',  len: 330, rise: 54, boulders: [0.3, 0.72], find: [{ id: 'sancyite', f: 0.5 }] },
        { t: 'flat',   len: 100, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 310, rise: 58, rocks: [3.6, 5.0], find: [{ id: 'asterocarpe', f: 0.45 }] },
        { t: 'slope',  len: 300, rise: 60, boulders: [0.4], bottle: 0.6 },
        { t: 'gap',    len: 26 },
        { t: 'slope',  len: 300, rise: 52, boulders: [0.5], rocks: [3.8, 5.0] },
        { t: 'gap',    len: 24 },
        { t: 'slope',  len: 300, rise: 50, rocks: [3.4, 4.8], bottle: 0.55 },
        { t: 'slope',  len: 300, rise: 52, zone: 'snow', hint: 'snow', find: [{ id: 'soldanelle', f: 0.55 }] },
        { t: 'slope',  len: 330, rise: 60, zone: 'snow', boulders: [0.55], rocks: [3.2, 4.6] },
        { t: 'gap',    len: 26, zone: 'snow' },
        { t: 'slope',  len: 300, rise: 56, zone: 'snow', rocks: [3.0, 4.4], bottle: 0.5 },
        { t: 'flat',   len: 110, zone: 'snow', cp: true },
        { t: 'slope',  len: 320, rise: 62, zone: 'snow wind', hint: 'wind', boulders: [0.3], rocks: [3.0, 4.4] },
        { t: 'gap',    len: 28, zone: 'snow wind' },
        { t: 'slope',  len: 300, rise: 60, zone: 'snow wind', rocks: [2.8, 4.2], boulders: [0.7] },
        { t: 'slope',  len: 300, rise: 58, zone: 'snow wind', boulders: [0.35, 0.7], bottle: 0.5 },
        { t: 'gap',    len: 24, zone: 'snow wind' },
        { t: 'flat',   len: 110, zone: 'snow wind', cp: true },
        { t: 'slope',  len: 300, rise: 60, zone: 'snow wind', rocks: [2.8, 4.0] },
        { t: 'gap',    len: 26, zone: 'snow wind' },
        { t: 'slope',  len: 290, rise: 56, zone: 'snow wind', boulders: [0.5], rocks: [3.0, 4.2], bottle: 0.5 },
        { t: 'flat',   len: 100, zone: 'snow wind', cp: true },
        { t: 'stairs', len: 560, rise: 154, zone: 'snow wind', rocks: [3.8, 5.2], bottle: 'air:0.55', hint: 'stairs' },
        { t: 'slope',  len: 180, rise: 18, zone: 'snow' },
        { t: 'flat',   len: 260, zone: 'snow', summit: true }
      ],
      finds: { sancyite: { name: 'Sancyite', icon: 'sancyite' }, soldanelle: { name: 'Soldanelle des Alpes', icon: 'soldanelle' }, asterocarpe: { name: 'Astérocarpe nain', icon: 'asterocarpe' } },
      hints: hints({ stairs: 'L’escalier de bois accroche bien malgré la neige (aucune glissade) mais fatigue : ta jauge d’eau baisse plus vite.' }),
      hintsPad: HINTS_PAD
    }
  };

  /* =============================================================== NIVEAU 6 : PUY DE DÔME — CHEMIN DES CHÈVRES */
  var L6 = {
    id: 'puy-de-dome-chevres', number: 6, playable: true,
    name: 'Puy de Dôme', route: 'Chemin des Chèvres', massif: 'Chaîne des Puys, Auvergne', place: 'Col de Ceyssat, Orcines (Puy-de-Dôme)',
    altitude: 1465, altitudeEnd: 1406, altitudeStart: 1075, startLabel: 'col de Ceyssat',
    altitudeNote: 'Sommet (antenne) à 1 465 m ; le chemin des Chèvres se termine à la gare du Panoramique, vers 1 406 m.',
    difficulty: { label: 'Moyenne (plus douce que les Muletiers)', stars: 3, of: 5, note: 'Clermont Auvergne Volcans décrit le chemin des Chèvres comme plus doux que celui des Muletiers : d’abord en forêt, puis des vues dégagées, un grand escalier et environ 600 m le long de la route de service.' },
    hike: { distanceKm: 7.82, ascentM: 417, duration: 'Non précisée ici', note: 'Boucle de la fiche Visorando « Le puy de Dôme par le chemin des Chèvres » (départ au col de Ceyssat, 1 075 m). Le jeu ne représente que la montée.' },
    firstAscent: { value: 'Non documentée', note: 'Pas de première ascension à pied documentée dans nos sources. Les Chèvres sont la partie montante du GR 4 (variante 441), interdite aux VTT.' },
    visitors: { value: 'près d’un demi-million de visiteurs par an', year: 'tous accès confondus', isEstimate: false, note: 'Wikipédia : l’un des lieux les plus visités d’Auvergne, tous modes d’accès confondus (sentiers, train, route de secours).' },
    story: [
      'Le chemin des Chèvres est la partie montante du GR 4 (variante 441) vers le puy de Dôme (1 465 m). Depuis le col de Ceyssat (1 075 m), la boucle de 7,82 km (+417 m) traverse d’abord des fayards (hêtres), puis une clairière, le plateau du Traversin et une fontaine de pierre, avant un grand escalier qui rejoint la route de service. Les 500 derniers mètres suivent la route, le long des rails du Panoramique des Dômes.',
      'Ce n’est pas le chemin des Muletiers, plus court et plus raide : les Chèvres sont plus douces mais plus longues, avec des marches et des pontons de bois sur plusieurs sections. Peu avant la gare, on traverse les rails de la crémaillère (une seule traversée signalée dans la fiche Visorando : « attention au train »), puis les derniers 500 m suivent la route le long des rails. Dans le jeu, il y a donc un seul passage à niveau, déclenché quand tu t’approches : feux rouges, cloche, puis le train, prioritaire. La distance exacte entre le passage et la gare n’est pas documentée : elle est ici une estimation.',
      'Le sommet est un lieu rude : vents parfois très violents, temps qui change très vite, brumes fréquentes (le nom de Mercure Dumias, divinité gauloise puis romaine, serait celui d’un dieu « des brumes »), neige dès septembre. La végétation est rare au-dessus de 1 300 m et presque absente au-dessus de 1 400 m, surtout côté vent. Dans le jeu, le brouillard près du sommet réduit la visibilité et le vent de face ralentit tes sauts.',
      'Fragile aussi : près d’un demi-million de visiteurs par an, des sols de trachyte et de scories qui s’érodent sous les pieds, ce qui explique les marches, les pontons et les balisages. Le jeu s’achève comme la randonnée : en entrant dans la gare du Panoramique des Dômes. Le train à crémaillère circule depuis le 26 mai 2012 (Stadler, 1,5 kV continu, gare en contrebas du sommet).'
    ],
    recap: 'Partie montante du GR 4 (441) vers le puy de Dôme : 7,82 km et +417 m depuis le col de Ceyssat, forêt de fayards, plateau du Traversin, grand escalier et dernier kilomètre le long des rails du Panoramique des Dômes (train à crémaillère depuis 2012) ; sommet venté et brumeux, végétation rare au-dessus de 1 300 m.',
    mission: 'Monte par le chemin des Chèvres : forêt de hêtres, clairière, plateau du Traversin, grand escalier puis la route le long des rails jusqu’à <b>la gare du sommet</b>. Tout est là : <b>soleil</b> qui vide ta gourde, <b>randonneurs</b> qui font céder les dalles, <b>pierres</b> et <b>ravines</b>, <b>rafales de vent</b> qui freinent tes sauts, <b>brouillard</b> près du sommet (suis les jalons orange et blanc) et <b>le train</b> au passage à niveau : quand tu approches, attends qu’il soit passé ! Le plus long des niveaux : <b>7 bouteilles</b> t’attendent.',
    carnet: [
      { id: 'pipit', name: 'Pipit spioncelle', text: 'Une dizaine de couples de pipits spioncelles, petits oiseaux de montagne, nichent au sommet du puy de Dôme (d’après une étude citée par Wikipédia).', src: 'Wikipédia — Puy de Dôme', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' },
      { id: 'chamois', name: 'Chamois', text: 'Depuis quelques années, on observe des chamois sur les flancs abrupts du puy de Dôme : ils sont arrivés naturellement des Monts Dore, où leur population est importante.', src: 'Wikipédia — Puy de Dôme', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' },
      { id: 'cremaillere', name: 'Crémaillère du Panoramique', text: 'Le Panoramique des Dômes est un chemin de fer à crémaillère inauguré le 26 mai 2012 : ses automotrices (Stadler) sont une extrapolation de celles de Montserrat, alimentées en 1,5 kV continu. Le jour de l’inauguration, de violents orages ont causé éboulements et coulées de boue.', src: 'Wikipédia — Puy de Dôme', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' }
    ],
    sources: [
      { label: 'Wikipédia — Puy de Dôme (1 465 m ; climat rude, vents violents, neige dès septembre ; végétation rare au-delà de 1 300 m ; Mercure Dumias, dieu « des brumes » ; chamois, pipit spioncelle ; Panoramique des Dômes inauguré le 26 mai 2012, Stadler, 1,5 kV ; marches et pontons de bois du GR 4 ; ≈ 0,5 million de visiteurs/an)', url: 'https://fr.wikipedia.org/wiki/Puy_de_D%C3%B4me' },
      { label: 'Visorando — Le puy de Dôme par le chemin des Chèvres (7,82 km, +417 m ; départ au col de Ceyssat à 1 075 m ; fayards, clairière, plateau du Traversin, fontaine de pierre, escalier jusqu’à la route et à la voie à crémaillère « attention au train », plate-forme au-dessus de la gare à 1 405 m)', url: 'https://www.visorando.com/randonnee-le-puy-de-dome-par-le-chemin-des-chevres/' },
      { label: 'Clermont Auvergne Volcans — Le puy de Dôme par le chemin des Chèvres (plus doux que les Muletiers, forêt puis vues, grand escalier jusqu’à la route de service, ≈ 600 m sur la route)', url: 'https://www.clermontauvergnevolcans.com/en/pages/the-puy-de-dome-via-the-chemin-des-chevres/' },
      { label: 'Panoramique des Dômes — Les chemins autour du site (les Chèvres : partie montante du GR 4-441, escaliers sur certaines sections, 500 derniers mètres sur la route le long des rails)', url: 'https://www.panoramiquedesdomes.fr/les-chemins-autour-du-site/' },
      { label: 'ViaGallica — Puy de Dôme, train panoramique (voie unique à crémaillère de 5,3 km, zone d’évitement)', url: 'https://www.viagallica.com/auvergne/puy_de_dome_-_train_panoramique.htm' },
      { label: 'Wikipédia — Chaîne des Puys (les puys voisins, le plateau des Dômes, les cols de Ceyssat à 1 077 m, du Traversin à 1 125 m)', url: 'https://fr.wikipedia.org/wiki/Cha%C3%AEne_des_Puys' }
    ],
    play: {
      theme: 'chevres', stairsMat: 'wood', windCycle: 9.0,
      water: { max: 100, start: 100, drainPerSec: 1.65, bottleGain: 55, thirstDamageEvery: 5, jumpCost: 3.5 },
      sun: { mult: 1.7 }, shade: { mult: 0.8 },
      stars: { timeFast: 175, timeOk: 265, waterGood: 20, waterOk: 4 },
      lives: 3, crumble: { fall: 0.8 }, ext: 700, crater: { kind: 'plain' },
      pieces: [
        { t: 'flat',   len: 240, zone: 'shade', hint: 'start' },
        { t: 'slope',  len: 320, rise: 34, zone: 'shade', hint: 'water', boulders: [0.5] },
        { t: 'slope',  len: 330, rise: 36, zone: 'shade', crumb: [{ f: 0.5, w: 34, npc: true, slab: true, fall: 0.55 }], hint: 'hikers' },
        { t: 'slope',  len: 320, rise: 40, zone: 'shade', bottle: 0.6, boulders: [0.3] },
        { t: 'gap',    len: 24, zone: 'shade', hint: 'gap' },
        { t: 'slope',  len: 300, rise: 40, zone: 'shade', rocks: [4.2, 5.6], find: [{ id: 'pipit', f: 0.5 }] },
        { t: 'flat',   len: 110, zone: 'shade', cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 330, rise: 36, zone: 'sun', crumb: [{ f: 0.35, w: 30, fall: 0.45 }, { f: 0.78, w: 28, fall: 0.34 }], hint: 'sun' },
        { t: 'slope',  len: 310, rise: 34, zone: 'sun wind', boulders: [0.4], bottle: 0.4, hint: 'wind' },
        { t: 'flat',   len: 270, zone: 'sun wind', find: [{ id: 'chamois', f: 0.55 }] },
        { t: 'gap',    len: 26, zone: 'sun wind' },
        { t: 'slope',  len: 330, rise: 44, zone: 'sun wind', rocks: [3.6, 5.0], crumb: [{ f: 0.62, w: 28, npc: true, slab: true, fall: 0.55 }] },
        { t: 'slope',  len: 300, rise: 30, zone: 'sun wind', boulders: [0.3, 0.7], bottle: 0.5 },
        { t: 'gap',    len: 24, zone: 'sun wind' },
        { t: 'slope',  len: 320, rise: 36, zone: 'sun wind', crumb: [{ f: 0.3, w: 30, npc: true, slab: true, fall: 0.5 }, { f: 0.72, w: 26, fall: 0.34 }], boulders: [0.5] },
        { t: 'flat',   len: 100, zone: 'wind', cp: true },
        { t: 'stairs', len: 470, rise: 120, zone: 'wind', rocks: [3.6, 5.0], bottle: 'air:0.5', hint: 'stairs' },
        { t: 'slope',  len: 320, rise: 34, zone: 'wind fog', fog: [0.25, 0.5], boulders: [0.5], hint: 'fog' },
        { t: 'slope',  len: 300, rise: 34, zone: 'wind fog', fog: 0.5, rocks: [3.8] },
        { t: 'flat',   len: 100, zone: 'wind fog', fog: 0.55, cp: true },
        { t: 'slope',  len: 330, rise: 36, zone: 'wind fog', fog: 0.65, boulders: [0.45], bottle: 0.7 },
        { t: 'slope',  len: 360, rise: 52, zone: 'wind fog', fog: 0.75, rail: true, rocks: [3.6, 4.8], boulders: [0.78], find: [{ id: 'cremaillere', f: 0.3 }] },
        { t: 'slope',  len: 300, rise: 40, zone: 'wind fog', fog: 0.75, rail: true, boulders: [0.4], bottle: 0.55 },
        { t: 'flat',   len: 100, zone: 'wind fog', fog: 0.7, rail: true, cp: true },
        { t: 'slope',  len: 260, rise: 24, zone: 'wind fog', fog: 0.6, rail: true, hint: 'train' },
        { t: 'flat',   len: 380, zone: 'wind fog', fog: 0.5, rail: true, train: { f: 0.5, w: 46, trig: 190, warn: 1.4, speed: 190 } },
        { t: 'slope',  len: 260, rise: 22, zone: 'wind fog', fog: 0.5, rail: true },
        { t: 'stairs', len: 310, rise: 72, zone: 'wind fog', fog: [0.7, 0.35], bottle: 0.5 },
        { t: 'flat',   len: 270, summit: true }
      ],
      endGare: true,
      finds: { pipit: { name: 'Pipit spioncelle', icon: 'pipit' }, chamois: { name: 'Chamois', icon: 'chamois' }, cremaillere: { name: 'Crémaillère du Panoramique', icon: 'cremaillere' } },
      hints: hints({ stairs: 'Les marches de bois accrochent bien (aucune glissade) mais fatiguent : ta jauge d’eau baisse plus vite.' }),
      hintsPad: HINTS_PAD
    }
  };

  /* ---------- enjeux / obstacles / objets du carnet (clé = numéro du niveau ; `src` = indices dans lv.sources) ---------- */
  var INFO = {
    3: {
      required: WATER_REQ(L3),
      obstacles: [
        { icon: '🥾', name: 'Randonneurs et dalles fragiles', real: 'Piétinement : plus de 91 000 passages au sommet du 1er janvier au 17 octobre 2023 ; le piétinement use la pelouse et multiplie les « sentiers sauvages » (rapport IGEDD, 2018). Dans le jeu, la dalle cède sous le pas de l’autre randonneur : c’est une image du phénomène, pas un fait documenté.', src: [0, 4, 5] },
        { icon: '🪜', name: 'Marches de béton clair', real: 'Le sentier du sommet est fait de grandes marches bétonnées de couleur claire : 239 marches depuis le Pas de Peyrol, qui fatiguent les jambes mais ne glissent pas.', src: [1, 2] },
        { icon: '🕳️', name: 'Ravines et sols ravinés', real: 'Il tombe environ 2,5 m de pluie par an sur le Puy Mary : l’eau ravine les sols nus de la pelouse d’altitude (d’où les rouleaux de coco et le géotextile posés en 2018).', src: [0, 3] },
        { icon: '🪨', name: 'Rochers et pierres qui dévalent', real: 'Le sommet est un dôme de trachyte glaciaire. Honnêtement, nos sources ne décrivent pas de chutes de pierres fréquentes : ces pierres sont surtout un obstacle de jeu.', src: [0] }
      ],
      enjeux: [
        { t: 'Surfréquentation : environ 500 000 visiteurs par an sur le Grand Site, plus de 91 000 passages au sommet du 1er janvier au 17 octobre 2023.', s: [0, 4] },
        { t: 'Piétinement et « sentiers sauvages » : le rapport IGEDD de 2018 pointe l’érosion due au piétinement et aux raccourcis hors sentier.', s: [5] },
        { t: 'Restauration du sentier GR400 (2018) : 200 m remis en état avec géotextile, rouleaux de coco, marches et main courante, pour environ 20 000 €, en zone Natura 2000.', s: [3] },
        { t: 'Réduire la pression automobile : des navettes desservent le Pas de Peyrol depuis 2016 ; le site est Grand Site de France depuis le 18 décembre 2012.', s: [0] },
        { t: 'Biodiversité : environ 550 espèces de plantes (dont la gentiane jaune), chamois, mouflons, marmottes (Wikipédia). Les ressources de nos sources ne chiffrent ni déchets ni pollution propres à ce site : remporte les tiens.', s: [0] }
      ],
      items: { water: { where: 'Sur le sentier, une en hauteur (il faut sauter).', why: 'La montée depuis le Pas de Peyrol fait 1,4 km pour 195 m de dénivelé (1 h 15 aller-retour) et nos sources ne signalent pas de point d’eau au sommet : on emporte sa propre eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [1] } }
    },
    4: {
      required: WATER_REQ(L4),
      obstacles: [
        { icon: '🚆', name: 'Train du Panoramique des Dômes', real: 'Les rails du Panoramique des Dômes (voie unique à crémaillère, zone d’évitement au croisement des Muletiers) coupent le sentier entre les virages 2 et 3 : à pied, le train est prioritaire. Dans le jeu, le train s’inspire des automotrices blanches à bandeau violet du Panoramique, il est dessiné de façon stylisée et le passage à niveau est placé à mi-parcours pour être bien visible.', src: [3, 4] },
        { icon: '☀️', name: 'Soleil et chaleur', real: 'Le sentier est surtout sous les arbres au début ; le final à flanc de rochers est découvert et exposé aux vents. Les températures dépassent rarement 25 °C en été au sommet. Le soleil écrasant du jeu est donc une exagération, qui illustre l’importance d’emporter de l’eau.', src: [0, 2] },
        { icon: '🪜', name: 'Marches', real: 'La fin du parcours se fait par des marches qui mènent à la plate-forme principale vers 1 410 m, puis par un sentier en escaliers jusqu’au temple de Mercure (environ 50 m de dénivelé en plus).', src: [0] },
        { icon: '🕳️', name: 'Ravines, rochers et pierres', real: 'Le haut du parcours est à flanc de rochers. Honnêtement, nos sources ne décrivent pas de ravines ni de chutes de pierres précises sur les Muletiers : ces obstacles sont surtout des éléments de jeu.', src: [0, 2] }
      ],
      enjeux: [
        { t: 'Fréquentation : près d’un demi-million de visiteurs par an sur le puy de Dôme, tous accès confondus (sentiers, train, route de secours).', s: [0] },
        { t: 'Protection : Grand Site de France depuis 2008, site naturel classé en 2000, patrimoine mondial de l’UNESCO (« haut lieu tectonique Chaîne des Puys – faille de Limagne ») depuis 2018.', s: [0] },
        { t: 'Végétation fragile : seul site de la chaîne à l’étage subalpin bien marqué ; la végétation est rare au-dessus de 1 300 m et presque absente au-dessus de 1 400 m, d’où l’importance de rester sur le sentier.', s: [0] },
        { t: 'Mobilité : la route à péage a été fermée au trafic et remplacée par le train à crémaillère (2012) ; une voie de secours subsiste. Les VTT sont interdits sur le sentier des Muletiers et sur le chemin des Chèvres.', s: [0] },
        { t: 'Risque météo : le jour de l’inauguration du train (26 mai 2012), de violents orages ont causé éboulements et coulées de boue ; le sommet est sujet aux orages et au brouillard.', s: [0] },
        { t: 'Déchets et pollution : nos sources ne donnent pas de chiffres précis pour ce sentier. Règle de randonnée : remporte tes déchets, privilégie une gourde réutilisable.', s: [] }
      ],
      items: { water: { where: 'Sur le sentier, certaines en hauteur (il faut sauter).', why: 'Le chemin fait environ 1,9 km pour 365 m de montée (≈ 50 min) et nos sources ne signalent pas de point d’eau : on emporte sa propre eau, surtout s’il fait chaud. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [2] } }
    },
    5: {
      required: WATER_REQ(L5),
      obstacles: [
        { icon: '❄️', name: 'Neige et sol glissant', real: 'La neige arrive dès octobre au Sancy et des névés restent jusqu’à la mi-juillet ; les avis de randonneurs de la fiche Visorando mentionnent gel et neige à la mi-octobre. Le sommet et l’escalier sont fermés aux piétons de décembre à avril.', src: [0, 3] },
        { icon: '🪜', name: 'Escalier de bois', real: 'La fin de la montée se fait par un escalier de bois d’environ 860 marches (864 selon Sancy Tourisme), qui limite le piétinement du sommet ; il fatigue, mais ses marches accrochent.', src: [1, 3] },
        { icon: '🕳️', name: 'Ravines', real: 'Sur la montée, l’eau ravine un sol piétiné : les travaux de 2015 ont posé 42 déviations d’eau pour la détourner du sentier.', src: [5, 6] },
        { icon: '🪨', name: 'Rochers et pierres qui dévalent', real: 'Le sommet est en trachy-andésite. Honnêtement, nos sources ne décrivent pas de chutes de pierres fréquentes : ce sont surtout des obstacles de jeu.', src: [0] }
      ],
      enjeux: [
        { t: 'Surfréquentation : environ 60 000 randonneurs par an empruntent les 460 m du sentier sommital.', s: [5] },
        { t: 'Travaux de 2015 : 42 déviations d’eau, 543 m de rouleaux de coco, 157 m de murets de pierres sèches, 18 marches de pierre, matériaux héliportés, pour plus de 500 000 €.', s: [5, 6] },
        { t: 'Effet observé : l’astérocarpe nain (plante protégée) est passé de 235 à 2 911 touffes sur le sentier ; la réserve compte 1 058 espèces de plantes dont 121 protégées.', s: [5] },
        { t: 'Protection : réserves naturelles nationales de Chaudefour (1991) et de Chastreix-Sancy (2007) ; les chiens sont interdits dans la réserve de Chastreix-Sancy.', s: [3, 4] },
        { t: 'Domaine skiable : la descente par les pistes est déconseillée à cause de la « montagne fragile » (fermetures) ; le site est aménagé pour le ski et le téléphérique.', s: [3] },
        { t: 'Déchets : nos sources ne donnent pas de chiffres précis sur ce site. Règle générale : remporte tes déchets.', s: [] }
      ],
      items: { water: { where: 'Sur la montée, certaines en hauteur (il faut sauter).', why: 'La boucle fait 6,68 km pour +568 m (≈ 3 h 30) ; nos sources ne signalent pas de point d’eau en route : on emporte sa propre eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [3] } }
    },
    6: {
      required: WATER_REQ(L6),
      obstacles: [
        { icon: '🚆', name: 'Train du Panoramique des Dômes', real: 'Peu avant la gare, le chemin traverse la voie à crémaillère (« attention au train » dans la fiche Visorando) ; les 500 derniers mètres suivent la route le long des rails. Dans le jeu : un seul passage à niveau (la distance exacte à la gare n’est pas documentée) et un train stylisé.', src: [1, 3, 4] },
        { icon: '🌫️', name: 'Brouillard', real: 'Le haut du col est couramment traversé par un halo de brumes ; Mercure Dumias serait un dieu « des brumes ». Le temps y change très vite.', src: [0] },
        { icon: '💨', name: 'Vent', real: 'Au sommet, les vents peuvent être très violents, surtout sur les versants exposés à l’ouest. Les rafales du jeu sont une illustration de cette exposition.', src: [0] },
        { icon: '☀️', name: 'Soleil et chaleur', real: 'Après la forêt, la clairière et le plateau du Traversin sont découverts. Les températures dépassent rarement 25 °C en été au sommet : le soleil écrasant du jeu est une exagération.', src: [0, 1] },
        { icon: '🥾', name: 'Dalles fragiles et érosion', real: 'Près d’un demi-million de visiteurs par an usent un sol de trachyte et de scories ; marches et pontons de bois servent à limiter l’érosion. Le piétinement par d’autres randonneurs est une illustration de jeu.', src: [0, 3] },
        { icon: '🪜', name: 'Grand escalier', real: 'Un grand escalier rejoint la route de service ; les Chèvres comportent aussi des marches et pontons de bois sur plusieurs sections.', src: [0, 2, 3] }
      ],
      enjeux: [
        { t: 'Fréquentation : près d’un demi-million de visiteurs par an sur le puy de Dôme, tous accès confondus.', s: [0] },
        { t: 'Protection : Grand Site de France (2008), site classé (2000), UNESCO (2018) ; les VTT sont interdits sur les Muletiers et sur les Chèvres.', s: [0] },
        { t: 'Végétation d’altitude rare (au-delà de 1 300 m) : l’étage subalpin du puy de Dôme est unique dans la chaîne ; rester sur le sentier aide à la préserver.', s: [0] },
        { t: 'Aménagements : marches et pontons de bois sur le GR 4 ; les 500 derniers mètres suivent la route le long de la voie du Panoramique (train à crémaillère depuis 2012).', s: [0, 3] },
        { t: 'Risques : orages (« forte densité de foudroiement »), vent et brouillard ; un orage a causé des éboulements le jour de l’inauguration du train (26 mai 2012).', s: [0] },
        { t: 'Déchets et pollution : nos sources ne donnent pas de chiffres sur ce chemin. Remporte tes déchets.', s: [] }
      ],
      items: { water: { where: 'Sur le chemin, certaines en hauteur (il faut sauter).', why: 'La boucle fait 7,82 km pour +417 m ; la fiche Visorando mentionne une fontaine de pierre sur le parcours, sans garantie de potabilité : on emporte sa propre eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [1] } }
    }
  };
  var CARNET = {
    trachyte:    { icon: '🪨', where: 'Puy Mary — caché en hauteur.', why: 'Le Puy Mary est un dôme de trachyte d’environ 6,5 millions d’années ; sa forme de corne vient des glaciations.' },
    gentiane:    { icon: '🌼', where: 'Puy Mary — caché en hauteur.', why: 'Environ 550 espèces de plantes vivent sur le site, dont la gentiane jaune ; le piétinement fragilise ces pelouses d’altitude.' },
    coco:        { icon: '🟤', where: 'Puy Mary — caché en hauteur.', why: 'En 2018, le sentier GR400 a été remis en état avec géotextile, rouleaux de coco, marches et main courante pour lutter contre l’érosion.' },
    domite:      { icon: '🪨', where: 'Puy de Dôme (Muletiers) — caché en hauteur.', why: 'Le puy de Dôme est surtout fait de domite, un trachyte sub-alcalin ; deux blocs emboîtés, nés de deux éruptions.' },
    pascal:      { icon: '🌡️', where: 'Puy de Dôme (Muletiers) — caché en hauteur.', why: 'Le 19 septembre 1648, l’expérience de Pascal et Périer au puy de Dôme a montré que la pression de l’air baisse avec l’altitude.' },
    mercure:     { icon: '🏛️', where: 'Puy de Dôme (Muletiers) — caché en hauteur.', why: 'Le temple gallo-romain de Mercure au sommet a été redécouvert en 1872 ; les Muletiers menaient jadis les pèlerins jusqu’à lui.' },
    sancyite:    { icon: '🪨', where: 'Puy de Sancy — caché en hauteur.', why: 'Le sommet est en trachy-andésite, dont une variété, la sancyite, porte le nom du massif.' },
    soldanelle:  { icon: '🌸', where: 'Puy de Sancy — caché en hauteur.', why: 'La soldanelle des Alpes compte parmi les plantes d’altitude du sommet du Sancy, avec la jasione naine et l’astérocarpe nain.' },
    asterocarpe: { icon: '🌱', where: 'Puy de Sancy — caché en hauteur.', why: 'Après les travaux de 2015, cette plante protégée est passée de 235 à 2 911 touffes sur le sentier du sommet.' },
    pipit:       { icon: '🐦', where: 'Puy de Dôme (Chèvres) — caché en hauteur.', why: 'Une dizaine de couples de pipits spioncelles nichent au sommet du puy de Dôme.' },
    chamois:     { icon: '🐐', where: 'Puy de Dôme (Chèvres) — caché en hauteur.', why: 'Des chamois venus des Monts Dore ont colonisé naturellement les flancs du puy de Dôme depuis quelques années.' },
    cremaillere: { icon: '🚆', where: 'Puy de Dôme (Chèvres) — caché en hauteur.', why: 'Le Panoramique des Dômes est un train à crémaillère inauguré le 26 mai 2012, alimenté en 1,5 kV continu.' }
  };

  /* Fins de niveau : cadrage sur la bannière de la carte (même principe que LEVELS[0].ending, coordonnées dans l’espace `ref` 1056 × 448).
     flag = pied du fanion sur le sommet peint dans la bannière ; focus = point cadré à l’écran en fin de travelling. */
  /* v0.7.7 : toiles peintes des sommets (validées par Émilien), même système que Ursuya/Atxuria. */
  var ENDINGS = [
    {
      hideFlag: true, noRing: true, fullBleed: true, noExt: true,
      fx: { clouds: false, vultures: 2, shimmer: false, raptor: 'kite' },
      port: {
        banner: 'ending-mary-port', ref: [720, 1280],
        flag: { x: 500, y: 1108 }, focus: { x: 360, y: 720 },
        hikerFit: { y0: 908, y1: 1108, ratio: 1.0 },
        anchor: [0.50, 0.55], startShift: -30,
        vultureY: [180, 320]
      },
      land: {
        banner: 'ending-mary-land', ref: [1280, 720],
        flag: { x: 580, y: 635 }, focus: { x: 640, y: 400 },
        hikerFit: { y0: 450, y1: 635, ratio: 1.0 },
        anchor: [0.50, 0.72], startShift: -50,
        vultureY: [70, 170]
      }
    },
    {
      hideFlag: true, noRing: true, fullBleed: true, noExt: true,
      subtitle: 'Sentier des Muletiers',
      fx: { clouds: false, vultures: 2, shimmer: false, raptor: 'kite' },
      port: {
        banner: 'ending-dome-muletiers-port', ref: [720, 1280],
        flag: { x: 150, y: 1140 }, focus: { x: 360, y: 720 },
        hikerFit: { y0: 1010, y1: 1140, ratio: 1.0 },
        anchor: [0.50, 0.55], startShift: -30,
        vultureY: [160, 300]
      },
      land: {
        banner: 'ending-dome-muletiers-land', ref: [1280, 720],
        flag: { x: 430, y: 650 }, focus: { x: 640, y: 400 },
        hikerFit: { y0: 550, y1: 650, ratio: 1.0 },
        anchor: [0.50, 0.72], startShift: -40,
        vultureY: [70, 170]
      }
    },
    {
      hideFlag: true, noRing: true, fullBleed: true, noExt: true,
      fx: { clouds: false, vultures: 0, shimmer: false },
      port: {
        banner: 'ending-sancy-port', ref: [720, 1280],
        flag: { x: 555, y: 1200 }, focus: { x: 360, y: 720 },
        hikerFit: { y0: 1000, y1: 1200, ratio: 1.0 },
        anchor: [0.50, 0.55], startShift: -30,
        vultureY: [180, 300]
      },
      land: {
        banner: 'ending-sancy-land', ref: [1280, 720],
        flag: { x: 700, y: 660 }, focus: { x: 640, y: 400 },
        hikerFit: { y0: 510, y1: 660, ratio: 1.0 },
        anchor: [0.50, 0.72], startShift: -50,
        vultureY: [70, 170]
      }
    },
    {
      hideFlag: true, noRing: true, fullBleed: true, noExt: true,
      subtitle: 'Chemin des Chèvres',
      fx: { clouds: false, vultures: 2, shimmer: false, raptor: 'kite' },
      port: {
        banner: 'ending-dome-chevres-port', ref: [720, 1280],
        flag: { x: 195, y: 1112 }, focus: { x: 360, y: 720 },
        hikerFit: { y0: 996, y1: 1112, ratio: 1.0 },
        anchor: [0.50, 0.55], startShift: -30,
        vultureY: [160, 300]
      },
      land: {
        banner: 'ending-dome-chevres-land', ref: [1280, 720],
        flag: { x: 430, y: 658 }, focus: { x: 640, y: 400 },
        hikerFit: { y0: 558, y1: 658, ratio: 1.0 },
        anchor: [0.50, 0.72], startShift: -40,
        vultureY: [70, 170]
      }
    }
  ];

  /* ---------- branchement dans la liste des niveaux (remplace les emplacements « Bientôt ») ---------- */
  [L3, L4, L5, L6].forEach(function (lv, k) {
    var i = k + 2;
    lv.node = { x: MAPN[i][0], y: MAPN[i][1] };
    lv.info = INFO[lv.number];
    lv.ending = ENDINGS[k];
    LV[i] = lv;
  });
  var base = D.INFO || {}; for (var n in INFO) { base[n] = INFO[n]; } D.INFO = base;
  var cb = D.CARNET_INFO || {}; for (var c in CARNET) { cb[c] = CARNET[c]; } D.CARNET_INFO = cb;
})();
