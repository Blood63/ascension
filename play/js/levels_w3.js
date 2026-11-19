/* v0.10.0 — Niveaux 10 (La Rhune), 11 (Artzamendi), 12 (Aizkorri) et 13 (Txindoki), monde 2.
   Tous les faits des fiches viennent de sources web consultées le 16/11/2026.
   Inconnu = « Non documentée ». Aucun chiffre n'est inventé. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, MAPN = (D.WORLDS && D.WORLDS[1] && D.WORLDS[1].nodes) || [];

  function bottlesIn(lv) { return lv.play.pieces.filter(function (p) { return p.bottle != null; }).length; }

  var HINTS_COMMON = {
    start:      'Avance avec ◀ ▶ et saute avec ▲ (clavier : flèches + Espace).',
    water:      'Ta jauge d\u2019eau baisse avec le temps. Trouve des bouteilles en chemin !',
    checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
    gap:        'Un vide ! Prends de l\u2019élan et saute par-dessus.',
    boulder:    'Un rocher bloque le chemin : saute par-dessus !',
    pottoks:    'Un pottok traverse le sentier : arrête-toi et laisse-le passer, ou saute par-dessus. Le bousculer coûte un cœur.',
    sheep:      'Une brebis traverse le sentier : arrête-toi et laisse-la passer, ou saute par-dessus. La bousculer coûte un cœur.',
    cows:       'Une vache d\u2019estive traverse : arrête-toi et laisse-la passer, ou saute par-dessus. La bousculer coûte un cœur.',
    pebbles:    'Un vautour fauve lâche un petit caillou : l\u2019ombre au sol et le cri t\u2019avertissent (pas le triangle des éboulis). Écarte-toi !',
    fog:        'Le brouillard réduit la vue. Reste sur la trace.',
    sun:        'Pente au soleil : ta gourde se vide plus vite. Cherche les bouteilles.',
    rocks:      'Des pierres dévalent la pente : un triangle t\u2019avertit, puis saute par-dessus.',
    scramble:   'Passage rocheux : enchaîne les prises et rythme tes sauts.',
    crumble:    'Sol instable ! Il se fissure puis s\u2019effondre : traverse sans t\u2019arrêter, ou saute par-dessus.',
    storm:      'Crête exposée au vent. « Vent… » puis « Rafale ! » s\u2019affichent (~1 s d\u2019avance). Attends à l\u2019abri avant de sauter un vide.',
    wet:        'Attention, ça glisse. Avance d\u2019un pas régulier.'
  };
  var HINTS_PAD = {
    start:      'Avance avec le stick gauche (ou la croix) et saute avec A.',
    boulder:    'Un rocher bloque le chemin : saute par-dessus avec A !',
    pottoks:    'Un pottok traverse : relâche le stick et laisse-le passer, ou saute par-dessus.',
    sheep:      'Une brebis traverse : relâche le stick et laisse-la passer, ou saute par-dessus.',
    cows:       'Une vache traverse : relâche le stick et laisse-la passer, ou saute par-dessus.',
    pebbles:    'Ombre au sol et cri : un caillou va tomber à l\u2019aplomb du vautour. Écarte-toi.',
    fog:        'Brouillard : on voit moins loin. Reste sur la trace.',
    sun:        'Soleil : la gourde se vide plus vite. Cherche les bouteilles.',
    rocks:      'Pierres en descente : un triangle t\u2019avertit, puis saute avec A.',
    scramble:   'Passage rocheux : enchaîne les prises et saute avec A.',
    crumble:    'Sol instable : traverse sans t\u2019arrêter, ou saute avec A.',
    storm:      'Rafale sur la crête (~1 s d\u2019avance) : attends à l\u2019abri avant de sauter un vide.',
    wet:        'Ça glisse : avance d\u2019un pas régulier.',
    gap:        'Un vide ! Prends de l\u2019élan et saute avec A.'
  };
  function hints(extra, pad) {
    var o = {}, k;
    for (k in HINTS_COMMON) { o[k] = HINTS_COMMON[k]; }
    if (extra) { for (k in extra) { o[k] = extra[k]; } }
    return o;
  }
  function hintsPad(extra) {
    var o = {}, k;
    for (k in HINTS_PAD) { o[k] = HINTS_PAD[k]; }
    if (extra) { for (k in extra) { o[k] = extra[k]; } }
    return o;
  }

  /* ---------- 10. La Rhune / Larrun ---------- */
  var L10 = {
    id: 'rhune', number: 10, playable: true, world: 2,
    name: 'La Rhune',
    massif: 'Pays basque, Labourd / Navarre',
    place: 'Sare, Ascain, Urrugne (Pyrénées-Atlantiques) / Bera (Navarre)',
    route: 'Sentier du train depuis le col de Saint-Ignace',
    altitude: 900,            // m — 900 ou 901 selon les sources (Wikipedia).
    altitudeStart: 169,       // m — figure courante pour le col de Saint-Ignace. Le gestionnaire du train annonce 736 m de dénivelé : les deux chiffres ne tombent pas exactement d'accord.
    difficulty: { label: 'Difficile', stars: 4, of: 5, note: 'Le gestionnaire du train (rhune.com) décrit la randonnée comme difficile, avec un dénivelé important et très peu d\u2019ombre. Un topo du sentier du train la classe « niveau 4/5 ». tourisme64 classe aussi « Difficile » la montée depuis Ascain. La dernière partie est plus pierreuse.' },
    hike: { distanceKm: 12.4, ascentM: 736, duration: '≈ 2 h à 2 h 30 de montée', note: 'Sentier balisé jaune le long du train, au départ de la gare du col de Saint-Ignace (rhune.com : 736 m de dénivelé, 2 h à 2 h 30 de montée, autant à la descente). Un autre topo du même sentier donne 765 m et 12,4 km A/R. D\u2019autres voies existent : GR 10 depuis Olhette, voie d\u2019Ascain, col de Lizuniaga.' },
    firstAscent: {
      value: 'Non documentée (présence préhistorique)',
      note: 'Wikipedia indique « Préhistoire » : cromlechs, tumuli et dolmens attestent une présence humaine ancienne sur les pentes. Ce n\u2019est pas une première alpine datée. L\u2019impératrice Eugénie, en 1859 (récidive en 1862), a popularisé les excursions depuis Biarritz : ce n\u2019est pas une première ascension.'
    },
    visitors: {
      value: 'Train : environ 300 000 à 350 000 voyageurs par an ; randonnée : non documentée',
      note: 'geo.fr parle d\u2019environ 300 000 voyageurs par saison pour le petit train ; ahmontour.com et un article de 2024 citent plus de 350 000. Aucun comptage annuel des randonneurs n\u2019a été trouvé : le site est décrit comme très fréquenté en saison, sans chiffre.'
    },
    story: [
      'La Rhune, ou Larrun en basque, culmine à 900 ou 901 m selon les sources, à la frontière entre le Labourd et la Navarre, au-dessus de Sare, Ascain, Urrugne et Bera. C\u2019est l\u2019un des premiers sommets pyrénéens vus depuis l\u2019océan.',
      'Le petit train à crémaillère, inauguré en 1924, relie le col de Saint-Ignace au sommet en une trentaine à quarante minutes, sur une voie d\u2019environ 4 km. C\u2019est l\u2019une des rares crémaillères encore en service en France. Les rames d\u2019époque ont été construites à Bagnères-de-Bigorre par Soulé. Un projet de route jusqu\u2019au sommet a été rejeté par référendum en 1978.',
      'La randonnée la plus fréquente suit le sentier balisé jaune près de la voie, depuis la gare du col. Le gestionnaire décrit une montée difficile, peu ombragée, de 2 h à 2 h 30. La partie haute est plus pierreuse. D\u2019autres départs existent (Ascain, Olhette, Lizuniaga).',
      'Sur les pentes vivent en liberté des pottoks (petits chevaux basques), des brebis manex (ou manech) et, selon plusieurs topos, des betizu. Le vautour fauve fréquente le ciel du massif. On ne les dérange pas, on ne les nourrit pas, on tient les chiens en laisse. Le site est classé Natura 2000.',
      'Cromlechs, tumuli et dolmens témoignent d\u2019une fréquentation dès la préhistoire. Un obélisque de granit rappelle l\u2019excursion de l\u2019impératrice Eugénie en 1859. Au sommet et sur la frontière se trouvent des ventas, anciennes auberges de col devenues boutiques. Le panorama, par temps clair, va de la côte basque aux premiers 2 000 m pyrénéens. Le brouillard marin peut remonter vite.'
    ],
    recap: 'Sommet frontalier de 900 ou 901 m, au-dessus de l\u2019océan. Sentier du train depuis le col de Saint-Ignace (736 m de dénivelé selon rhune.com, 2 h à 2 h 30). Petit train à crémaillère de 1924 (environ 300 000 à 350 000 voyageurs par an). Pottoks, brebis manex, betizu, vautours fauves ; ventas et vestiges mégalithiques.',
    mission: 'Monte par le <b>sentier du train</b>, depuis le col de Saint-Ignace. Le <b>train à crémaillère</b> se voit sur la montagne, les rails longent une partie du chemin (sans passage à niveau : le sentier réel longe la voie, il ne la traverse pas comme au puy de Dôme). Les <b>pottoks</b> sont nombreux, avec des <b>brebis</b> et des <b>betizu</b> (triangle ~1,8 s). Les <b>vautours</b> n\u2019ont pas de triangle : ombre, cri, cailloux à l\u2019aplomb. La montée est <b>peu ombragée</b>, la fin plus <b>pierreuse</b>, et le <b>brouillard marin</b> peut réduire la vue. <b>5 bouteilles</b>.',
    carnet: [
      { id: 'cromlech', name: 'Cromlech du massif', text: 'Cromlechs, tumuli et dolmens attestent une présence humaine sur les pentes de la Rhune dès la préhistoire (Wikipedia). Ce n\u2019est pas un monument nommé de la voie du train : l\u2019objet rappelle ces cercles de pierres du massif.', src: 'Wikipedia — La Rhune', url: 'https://fr.wikipedia.org/wiki/La_Rhune' },
      { id: 'obelisque', name: 'Obélisque de 1859', text: 'Un obélisque de granit rappelle l\u2019excursion de l\u2019impératrice Eugénie sur le massif, le 30 septembre 1859 (récidive en 1862). Elle a lancé la mode des promenades vers le sommet depuis Biarritz. Ce n\u2019est pas une première ascension.', src: 'ahmontour.com ; geo.fr (récit de Guy Lalanne / Jakintza)', url: 'https://www.ahmontour.com/le-massif-de-la-rhune-petit-train/' },
      { id: 'venta', name: 'Venta du col', text: 'Sur la frontière du massif se sont implantées des ventas, auberges de col où se croisaient voyageurs et, plus tard, contrebandiers. Devenues boutiques ou relais, elles font partie du paysage sommittal de la Rhune.', src: 'Wikipedia — La Rhune ; txiki-combi.com', url: 'https://fr.wikipedia.org/wiki/La_Rhune' }
    ],
    sources: [
      { label: 'rhune.com — FAQ (randonnée difficile, 736 m de dénivelé, 2 h à 2 h 30, peu d\u2019ombre, pottoks et brebis en liberté, Natura 2000)', url: 'https://www.rhune.com/fr/faq' },
      { label: 'txiki-combi.com — Visiter la Rhune (col Saint-Ignace 162 m, sentier du train 765 m / 12,4 km, niveau 4/5 ; train 1924, ~35 min ; pottoks, betizu, manex, vautour fauve, cayolars, ventas)', url: 'https://txiki-combi.com/2024/03/21/comment-visiter-la-rhune-au-pays-basque/' },
      { label: 'Wikipedia — La Rhune (900 ou 901 m ; première : Préhistoire ; Eugénie et mode des excursions ; train 1924 ; ventas ; cromlechs)', url: 'https://fr.wikipedia.org/wiki/La_Rhune' },
      { label: 'ici.fr — Larrun, Larhun ou La Rhune ? (Eugénie, 1859 ; train 1924)', url: 'https://www.ici.fr/emissions/le-topo-de-peio/larrun-larhun-ou-la-rhune-2732220' },
      { label: 'geo.fr — Tous les chemins mènent à la Rhune (train ~300 000 voyageurs ; Eugénie, 30 septembre 1859 et 1862)', url: 'https://www.geo.fr/voyage/pays-basque-tous-les-chemins-menent-a-la-rhune-232794' },
      { label: 'ahmontour.com — Le massif de la Rhune (plus de 350 000 voyageurs ; obélisque de granit ; 4 km, ~30 min, ~750 m ; référendum de 1978)', url: 'https://www.ahmontour.com/le-massif-de-la-rhune-petit-train/' },
      { label: 'tourisme64 — La Rhune-Larrun depuis Ascain (Difficile, 13,8 km, 898 m D+, 4 h 40)', url: 'https://www.tourisme64.com/itineraire/ascain/ITIAQU064V5AZMOA-la-rhune-larrun/' },
      { label: 'france.fr — Nature holidays in Biarritz-Basque Country (pottoks, vautours, brebis manech ; train depuis le col de Saint-Ignace)', url: 'https://www.france.fr/en/article/nature-holidays-biarritz-basque-country/' }
    ],
    play: {
      theme: 'rhune', stairsMat: 'stone',
      water: { max: 100, start: 100, drainPerSec: 1.72, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.6 },
      sun: { mult: 1.7 },
      stars: { timeFast: 132, timeOk: 200, waterGood: 20, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.5, winZoomLand: 0.64, winLook: 0.80,
      pieces: [
        { t: 'flat',   len: 220, hint: 'start' },
        { t: 'slope',  len: 300, rise: 36, hint: 'water', find: [{ id: 'cromlech', f: 0.4 }] },
        { t: 'flat',   len: 180, pottoks: { f: 0.5, n: 2, trig: 230, spacing: 2.5 }, hint: 'pottoks' },
        { t: 'slope',  len: 300, rise: 42, zone: 'sun', boulders: [0.38, 0.78], bottle: 0.5 },
        { t: 'flat',   len: 160, sheep: { f: 0.48, n: 1, trig: 220 }, hint: 'sheep' },
        { t: 'slope',  len: 340, rise: 46, rail: true, pottoks: { f: 0.42, n: 1, trig: 230 }, bottle: 0.55 },
        { t: 'flat',   len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 300, rise: 42, rail: true, rocks: [3.8, 5.2], boulders: [0.55], hint: 'rocks' },
        { t: 'gap',    len: 20, hint: 'gap' },
        { t: 'slope',  len: 280, rise: 38, rail: true, raptors: { kind: 'vautour', pebbles: [4.4, 6.4] }, hint: 'pebbles', bottle: 0.45 },
        { t: 'flat',   len: 160, cows: { f: 0.5, n: 1, breed: 'betizu', trig: 230 }, hint: 'cows' },
        { t: 'slope',  len: 280, rise: 36, zone: 'sun', hint: 'sun', pottoks: { f: 0.55, n: 2, period: 12, spacing: 2.6 } },
        { t: 'slope',  len: 300, rise: 34, zone: 'sun', boulders: [0.5], bottle: 0.4 },
        { t: 'flat',   len: 140, sheep: { f: 0.5, n: 1, trig: 220, period: 12 } },
        { t: 'stairs', len: 88, rise: 26, hint: 'scramble' },
        { t: 'slope',  len: 300, rise: 32, zone: 'fog', fog: 0.4, rail: true, hint: 'fog', bottle: 0.5, find: [{ id: 'venta', f: 0.42 }] },
        { t: 'flat',   len: 90, cp: true },
        { t: 'slope',  len: 240, rise: 22, zone: 'fog', fog: 0.48, raptors: { kind: 'vautour', pebbles: [4.0, 6.0] }, boulders: [0.4], find: [{ id: 'obelisque', f: 0.5 }] },
        { t: 'flat',   len: 200, summit: true }
      ],
      finds: {
        cromlech:  { name: 'Cromlech du massif', icon: 'cromlech' },
        venta:     { name: 'Venta du col', icon: 'venta' },
        obelisque: { name: 'Obélisque de 1859', icon: 'obelisque' }
      },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Sentier du train de la Rhune, depuis le col de Saint-Ignace.',
        fog:   'Brouillard marin : on voit moins loin. Reste sur la trace.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick gauche (ou la croix) et saute avec A. Sentier du train, depuis le col de Saint-Ignace.',
        fog:   'Brouillard marin : on voit moins loin. Reste sur la trace.'
      })
    }
  };

  /* ---------- 11. Artzamendi ---------- */
  var L11 = {
    id: 'artzamendi', number: 11, playable: true, world: 2,
    name: 'Artzamendi',
    massif: 'Pays basque, Labourd',
    place: 'Itxassou / Espelette / Hasparren (Pyrénées-Atlantiques)',
    route: 'Voie longue depuis Itxassou / le Pas de Roland',
    altitude: 926,            // m — naturelandespaysbasque.com. D'autres sources donnent 924 m.
    altitudeStart: 74,        // estimation : 924–926 m moins ~850 m de D+ annoncé ; parking exact non chiffré
    altitudeNote: 'Départ estimé d\u2019après 924–926 m moins les 850 m de dénivelé annoncés depuis le Pas de Roland ; l\u2019altitude exacte du parking n\u2019a pas été trouvée.',
    difficulty: { label: 'Difficile (voie longue)', stars: 4, of: 5, note: 'Depuis Itxassou ou le Pas de Roland, l\u2019ascension est décrite comme exigeante : environ 850 m de dénivelé, pentes parfois à 18–20 %, une demi-journée. Une variante très courte et facile existe depuis le col de Méhatzé (3 km A/R, 210 m de dénivelé environ) : ce n\u2019est pas la voie jouée ici.' },
    hike: { distanceKm: 10, ascentM: 850, duration: 'une bonne demi-journée (A/R)', note: 'decouvrirlepaysbasque.fr : environ 10 km et 850 m de dénivelé depuis le Pas de Roland. Un récit d\u2019une boucle par les cols de l\u2019Ane, de Méhatzé et d\u2019Arzatey donne 11,75 km et 794 m, réalisée en 3 h 56, avec peu d\u2019ombre. L\u2019altitude exacte du parking de départ n\u2019a pas été trouvée.' },
    firstAscent: {
      value: 'Non documentée',
      note: 'Aucune date de première ascension n\u2019apparaît dans les sources consultées. Sommet pastoral et, aujourd\u2019hui, technique (antennes, radar).'
    },
    visitors: {
      value: 'Non documentée',
      note: 'Aucun comptage annuel n\u2019a été trouvé. La courte voie depuis le col de Méhatzé est décrite comme très fréquentée, surtout l\u2019été et les week-ends ; les itinéraires longs le sont nettement moins (un récit les dit peu fréquentés par rapport à la Rhune).'
    },
    story: [
      'L\u2019Artzamendi est le point culminant du Labourd. Les sources consultées donnent 924 m ou 926 m : on retient 926 m (naturelandespaysbasque.com) en citant l\u2019autre figure. On le reconnaît de loin à ses antennes et à une boule blanche de radar de l\u2019aviation civile, en service depuis 1996.',
      'Deux accès très différents existent. Le plus fréquenté part du col de Méhatzé (Mehatze, 716 m) : 3 km A/R et environ 210 m de dénivelé, une heure à peu près, parfois sur le goudron. La voie jouée ici est la montée longue depuis Itxassou et le Pas de Roland, dans la vallée de la Nive : environ 10 km et 850 m de dénivelé, des rampes soutenues, très peu d\u2019ombre.',
      'naturelandespaysbasque.com le dit clairement : aucun point d\u2019eau potable sur les parcours, quel que soit l\u2019itinéraire. Un litre et demi par personne au minimum, deux sur les boucles longues. L\u2019été, la chaleur s\u2019ajoute à l\u2019exposition. Le vent souffle presque en permanence au sommet, et le brouillard peut remonter vite et avaler la crête.',
      'Les pottoks pâturent en liberté sur toutes les pentes, ainsi que les vaches betizu. On ne les nourrit pas, on ne les approche pas, on contourne un troupeau. Au sud du col, les falaises des Peñas d\u2019Itsusi abritent l\u2019une des plus anciennes colonies de vautours fauves des Pyrénées ; le percnoptère y est observé sans y nicher.',
      'Le panorama, par temps clair, va de la côte basque à la vallée d\u2019Ossau. Le Mondarrain, voisin, se combine souvent à l\u2019Artzamendi sur les grandes boucles. Le plateau de Méhatzé porte des cromlechs. Un récit d\u2019itinéraire par les cols mentionne les bornes-frontière 82 et 83.'
    ],
    recap: 'Point culminant du Labourd (924 ou 926 m), reconnaissable à ses antennes et à sa boule de radar (1996). La voie longue depuis Itxassou / le Pas de Roland fait environ 850 m de dénivelé, peu ombragée, sans eau potable sur le parcours. Pottoks, betizu, vautours fauves aux Peñas d\u2019Itsusi. Une variante facile part du col de Méhatzé.',
    mission: 'Voie <b>longue</b> depuis le Pas de Roland : de grandes <b>rampes sans ombre</b>, où le <b>soleil</b> vide la gourde plus vite. <b>Aucun point d\u2019eau</b> n\u2019est cité sur l\u2019itinéraire réel : les <b>7 bouteilles</b> du jeu sont un ravitaillement symbolique. Tu croises des <b>pottoks</b>, des <b>betizu</b> et des <b>brebis</b> (triangle ~1,8 s), puis des <b>vautours fauves</b> (ombre et cri seulement). Le <b>brouillard</b> peut prendre la crête près du sommet.',
    carnet: [
      { id: 'roland', name: 'Pas de Roland', text: 'Le départ classique de la voie longue se fait depuis le Pas de Roland, dans la vallée de la Nive, au pied d\u2019Itxassou. C\u2019est un passage rocheux célèbre du Labourd, au début de l\u2019ascension d\u2019environ 850 m de dénivelé.', src: 'decouvrirlepaysbasque.fr — Le mont Artzamendi', url: 'https://decouvrirlepaysbasque.fr/lieu/le-mont-artzamendi' },
      { id: 'cromlech2', name: 'Cromlechs de Méhatzé', text: 'Le col de Méhatzé (716 m) est surtout le départ de la voie courte, mais plusieurs itinéraires longs y passent aussi. Le site des cromlechs de Méhatzé se trouve auprès du parking de terre, sur le plateau.', src: 'naturelandespaysbasque.com — Artzamendi (926 m) ; decathlon-outdoor.com', url: 'https://www.naturelandespaysbasque.com/artzamendi-926-metres' },
      { id: 'radar', name: 'Radar d\u2019aviation civile', text: 'Le sommet porte des antennes hertziennes et une boule blanche de radar de l\u2019aviation civile, en service depuis 1996. C\u2019est cette silhouette, plus qu\u2019une cime pointue, qui fait reconnaître l\u2019Artzamendi de loin.', src: 'Wikipedia — Artzamendi ; decouvrirlepaysbasque.fr', url: 'https://fr.wikipedia.org/wiki/Artzamendi' }
    ],
    sources: [
      { label: 'naturelandespaysbasque.com — Artzamendi (926 m) : col de Méhatzé 716 m, voie courte 3 km / 210 m ; pas d\u2019eau potable ; vent et brouillard au sommet ; pottoks, betizu ; Peñas d\u2019Itsusi, colonies de vautours fauves, percnoptère observé sans nicher', url: 'https://www.naturelandespaysbasque.com/artzamendi-926-metres' },
      { label: 'decouvrirlepaysbasque.fr — Le mont Artzamendi (924 m ; 10 km / 850 m depuis le Pas de Roland ; variante Méhatzé 3 km / 200 m ; pottoks, betizu ; panorama côte–Ossau ; antennes et boule de radar)', url: 'https://decouvrirlepaysbasque.fr/lieu/le-mont-artzamendi' },
      { label: 'olivier.hoarau.org — Randonnée de l\u2019Artzamendi (11,75 km, 794 m D+, 3 h 56 ; peu d\u2019ombre, chaleur ; pottoks, vautours ; bornes 82 et 83 ; moins fréquenté que la Rhune)', url: 'https://olivier.hoarau.org/?p=5858' },
      { label: 'en-pays-basque.fr — Mondarrain et Artzamendi (boucle 24,5 km, 8 h 30, difficile ; betizu, pottoks, manex, blondes d\u2019Aquitaine)', url: 'https://www.en-pays-basque.fr/randonnee/mondarrain-et-artzamendi/' },
      { label: 'decathlon-outdoor.com — Artzamendi, sommet du Labourd (voie courte depuis Méhatzé, cromlechs, fréquentation estivale)', url: 'https://www.decathlon-outdoor.com/fr-fr/inspire/france/randonnee-artzamendi-sur-le-sommet-du-labourd' },
      { label: 'Wikipedia — Artzamendi (altitude, installations du sommet, radar de l\u2019aviation civile depuis 1996)', url: 'https://fr.wikipedia.org/wiki/Artzamendi' }
    ],
    play: {
      theme: 'artzamendi', stairsMat: 'stone',
      water: { max: 100, start: 100, drainPerSec: 1.88, bottleGain: 55, thirstDamageEvery: 5, jumpCost: 3.8 },
      sun: { mult: 2.0 },
      stars: { timeFast: 158, timeOk: 240, waterGood: 16, waterOk: 4 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.5, winZoomLand: 0.64, winLook: 0.80,
      pieces: [
        { t: 'flat',   len: 220, hint: 'start', find: [{ id: 'roland', f: 0.82 }] },
        { t: 'slope',  len: 340, rise: 44, zone: 'shade', hint: 'water', bottle: 0.5 },
        { t: 'flat',   len: 180, pottoks: { f: 0.5, n: 2, trig: 230, spacing: 2.5 }, hint: 'pottoks' },
        { t: 'slope',  len: 360, rise: 52, zone: 'sun', hint: 'sun', boulders: [0.45] },
        { t: 'slope',  len: 320, rise: 48, zone: 'sun', bottle: 0.5, sheep: { f: 0.6, n: 1, trig: 220 } },
        { t: 'flat',   len: 120, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 380, rise: 54, zone: 'sun', pottoks: { f: 0.4, n: 1, trig: 230 }, bottle: 0.42 },
        { t: 'flat',   len: 160, cows: { f: 0.5, n: 1, breed: 'betizu', trig: 230 }, hint: 'cows' },
        { t: 'slope',  len: 360, rise: 50, zone: 'sun', rocks: [4.0, 5.6], hint: 'rocks', boulders: [0.7] },
        { t: 'gap',    len: 20, hint: 'gap' },
        { t: 'slope',  len: 340, rise: 46, zone: 'sun', bottle: 0.48, raptors: { kind: 'vautour', pebbles: [4.2, 6.2] }, hint: 'pebbles' },
        { t: 'flat',   len: 120, cp: true },
        { t: 'slope',  len: 300, rise: 40, zone: 'sun', find: [{ id: 'cromlech2', f: 0.45 }], pottoks: { f: 0.7, n: 2, period: 13, spacing: 2.6 } },
        { t: 'slope',  len: 320, rise: 38, zone: 'sun', bottle: 0.5, sheep: { f: 0.4, n: 1, trig: 220 } },
        { t: 'flat',   len: 100, cows: { f: 0.5, n: 1, breed: 'betizu', trig: 230, period: 14 } },
        { t: 'slope',  len: 280, rise: 32, zone: 'sun', bottle: 0.4 },
        { t: 'slope',  len: 360, rise: 44, zone: 'sun', boulders: [0.4, 0.75] },
        { t: 'flat',   len: 150, pottoks: { f: 0.5, n: 1, trig: 230 } },
        { t: 'slope',  len: 300, rise: 36, zone: 'sun', bottle: 0.52 },
        { t: 'slope',  len: 260, rise: 26, zone: 'fog', fog: 0.42, hint: 'fog', raptors: { kind: 'vautour', pebbles: [3.8, 5.8] }, find: [{ id: 'radar', f: 0.55 }] },
        { t: 'flat',   len: 200, summit: true }
      ],
      finds: {
        roland:    { name: 'Pas de Roland', icon: 'roland' },
        cromlech2: { name: 'Cromlechs de Méhatzé', icon: 'cromlech2' },
        radar:     { name: 'Radar d\u2019aviation civile', icon: 'radar' }
      },
      hints: hints({
        start: 'Avance avec ◀ ▶ et saute avec ▲. Voie longue de l\u2019Artzamendi, depuis le Pas de Roland. Peu d\u2019ombre : surveille ta gourde.',
        sun:   'Rampe au soleil, sans ombre : ta gourde se vide plus vite. Les 7 bouteilles sont précieuses.',
        fog:   'Le brouillard peut avaler la crête en quelques minutes. Reste sur la trace.'
      }),
      hintsPad: hintsPad({
        start: 'Avance avec le stick gauche et saute avec A. Voie longue depuis le Pas de Roland : surveille ta gourde.',
        sun:   'Rampe au soleil : la gourde se vide plus vite. Cherche les bouteilles.',
        fog:   'Brouillard sur la crête : reste sur la trace.'
      })
    }
  };

  /* ---------- 12. Aizkorri / Aitzgorri ---------- */
  var L12 = {
    id: 'aizkorri', number: 12, playable: true, world: 2,
    name: 'Aizkorri',
    massif: 'Sierra d\u2019Aizkorri, Parc naturel Aizkorri-Aratz',
    place: 'Oñati (Gipuzkoa), départ du sanctuaire d\u2019Arantzazu',
    route: 'Voie classique depuis le sanctuaire d\u2019Arantzazu, par Urbía',
    altitude: 1528,           // m — cime d'Aizkorri, la plus populaire. Le point culminant du chaînon est Aitxuri, 1551 m (Aketegi 1549 m selon les sources).
    altitudeStart: 730,       // m — Arantzazu (komandokroketa.org). D'autres topos parlent d'environ 800 m au parking du sanctuaire.
    difficulty: { label: 'Difficile', stars: 4, of: 5, note: 'Longue mais sans difficulté technique majeure. sport-trackmountain.com : « Moderada-Alta », exigeante par la distance et le dénivelé. La montée jusqu\u2019aux campas d\u2019Urbía est facile ; le dernier versant est plus raide, sur sentier de pedriza irrégulière (komandokroketa).' },
    hike: { distanceKm: 17.4, ascentM: 938, duration: '≈ 5 h 30 à 6 h 30 A/R', note: 'Ruta clásica depuis Arantzazu par Urbía, aller-retour. sport-trackmountain : 17,4 km, +938 m, 5 h 30–6 h. komandokroketa : 8 km et 950 m jusqu\u2019à la cime, environ 2 h 45 de montée, difficulté modérée. Wikiloc donne aussi ≈ 17,2 km A/R.' },
    firstAscent: {
      value: 'Non documentée',
      note: 'Aucune date de première ascension alpine n\u2019a été trouvée. Les campas d\u2019Urbía sont des estives d\u2019usage ancien, jusqu\u2019à des traces préhistoriques dans le massif : ce n\u2019est pas une « première » de type alpin.'
    },
    visitors: {
      value: 'Non documentée (sommet très fréquenté)',
      note: 'Aucun comptage annuel n\u2019a été trouvé. Les topos le disent l\u2019un des monts les plus visités du Pays basque, « indispensable » au montagnard basque, avec un sentier « très marqué par les milliers de personnes qui montent chaque année » (komandokroketa) : c\u2019est une indication, pas un chiffre officiel. Le point culminant de la communauté est le proche Aitxuri (1 551 m), moins emblématique.'
    },
    story: [
      'L\u2019Aizkorri, ou Aitzgorri, culmine à 1 528 m et donne son nom à la sierra qui sépare le Gipuzkoa de l\u2019Alava, dans le parc naturel Aizkorri-Aratz. Ce n\u2019est pas le plus haut sommet du chaînon : Aitxuri atteint 1 551 m, Aketegi 1 549 m selon les sources. C\u2019est en revanche la cime la plus populaire, notamment grâce à l\u2019ermita du Santo Cristo et au petit refuge, juste sous le sommet.',
      'La voie classique part du sanctuaire d\u2019Arantzazu (Oñati), vers 730 m. L\u2019édifice des années 1950, auquel ont participé notamment Jorge Oteiza et Eduardo Chillida, s\u2019élève au-dessus d\u2019un amphithéâtre rocheux. Un hayedo (hêtraie) large et bien marqué mène en environ 4,8 km et 450 m de dénivelé aux campas d\u2019Urbía, vaste prairie vers 1 100–1 200 m, avec une petite ermita et une taberna.',
      'Depuis Urbía, le sentier se redresse : marques jaunes, pedriza irrégulière, karst. Juste sous la cime se trouvent l\u2019ermita du Santo Cristo et un refuge de montagne. Le retour se fait généralement par le même itinéraire. D\u2019autres options existent (Aratz depuis Araia, crête Aketegi–Aitxuri, tunnel de San Adrian).',
      'Sur les campas paît le bétail d\u2019estive. Les topos et les récits citent les brebis latxa, dont le lait entre dans le fromage Idiazabal. Des vaches fréquentent aussi ces estives. Les chevaux ou pottoks n\u2019ont pas été trouvés nommément sur cette voie dans les sources consultées : on ne les place pas ici. Le parc abrite une des plus importantes colonies de vautours fauves du Gipuzkoa ; des topos mentionnent aussi faucon pèlerin et aigle botté au-dessus des crêtes.',
      'Par mauvais temps, le calcaire mouillé devient glissant, et la neige peut masquer le sentier. On reste sur la trace, on referme les barrières, on observe les rapaces à distance.'
    ],
    recap: 'Cime la plus populaire de la sierra (1 528 m), en deçà d\u2019Aitxuri (1 551 m). Voie classique depuis le sanctuaire d\u2019Arantzazu par les campas d\u2019Urbía (≈ 17,4 km A/R, +938 m). Hêtraie, estives de brebis latxa et de bétail, chaos calcaire, ermita du Santo Cristo au sommet. Vautours fauves.',
    mission: 'Depuis <b>Arantzazu</b>, tu traverses d\u2019abord la <b>hêtraie</b>, puis les <b>campas d\u2019Urbía</b> où passent <b>brebis latxa</b> et <b>vaches d\u2019estive</b> (triangle ~1,8 s). Le dernier versant est un <b>chaos calcaire</b> : <b>pierrier instable</b> (le sol peut céder), rochers, petits vides. Les <b>vautours fauves</b> n\u2019ont pas de triangle : ombre, cri, cailloux à l\u2019aplomb. <b>6 bouteilles</b>.',
    carnet: [
      { id: 'arantzazu', name: 'Sanctuaire d\u2019Arantzazu', text: 'Le départ classique se fait au sanctuaire d\u2019Arantzazu, à Oñati, vers 730 m. L\u2019édifice des années 1950, auquel ont participé notamment Jorge Oteiza et Eduardo Chillida, s\u2019élève au-dessus des rochers : c\u2019est aussi la porte du parc naturel.', src: 'sport-trackmountain.com ; komandokroketa.org ; récits de la voie classique', url: 'https://sport-trackmountain.com/aizkorri-desde-arantzazu/' },
      { id: 'urbia', name: 'Campas d\u2019Urbía', text: 'Après le hêtre, les campas d\u2019Urbía forment une large prairie vers 1 100–1 200 m, lieu d\u2019estive avec une petite ermita et une taberna. La seule montée jusqu\u2019ici est déjà une course classique, avant le versant rocheux de l\u2019Aizkorri.', src: 'komandokroketa.org ; sport-trackmountain.com', url: 'https://www.komandokroketa.org/aizkorri/aizkorri.html' },
      { id: 'ermita', name: 'Ermita del Santo Cristo', text: 'Juste sous la cime se trouvent l\u2019ermita del Santo Cristo et un petit refuge de montagne. C\u2019est l\u2019un des raisons de la popularité de cette cime, plus visitée que le proche Aitxuri, pourtant un peu plus haut (1 551 m).', src: 'sport-trackmountain.com — Aizkorri depuis Arantzazu', url: 'https://sport-trackmountain.com/aizkorri-desde-arantzazu/' }
    ],
    sources: [
      { label: 'sport-trackmountain.com — Aizkorri (1 528 m) desde Arantzazu (17,4 km A/R, +938 m, 5 h 30–6 h, Moderada-Alta ; hayedo, campas d\u2019Urbía, ermita del Santo Cristo et refuge ; Aitxuri 1 551 m, Aketegi 1 549 m)', url: 'https://sport-trackmountain.com/aizkorri-desde-arantzazu/' },
      { label: 'komandokroketa.org — Aitzgorri, Aitxuri, Aketegi (Arantzazu 730 m ; 8 km / 950 m, difficulté modérée, 2 h 45 ; pedriza ; sentier marqué par des milliers de passages annuels ; txabolas d\u2019Arbelar)', url: 'https://www.komandokroketa.org/aizkorri/aizkorri.html' },
      { label: 'Wikiloc — Aizkorri, ruta clásica desde el Santuario de Arantzazu (≈ 17,2 km A/R, campas, karst au-dessus d\u2019Elortola 1 161 m)', url: 'https://www.wikiloc.com/hiking-trails/aizkorri-ruta-clasica-desde-el-santuario-de-arantzazu-3737188' },
      { label: 'hiruma.eus — Parc naturel, l\u2019une des plus grandes colonies de vautours fauves du Gipuzkoa', url: 'https://hiruma.eus/fr/nature/' },
      { label: 'Wikipedia (es) — Aizkorri (cime, sierra, ermita)', url: 'https://es.wikipedia.org/wiki/Aizkorri' }
    ],
    play: {
      theme: 'aizkorri', stairsMat: 'stone', crumble: { fall: 0.75 },
      water: { max: 100, start: 100, drainPerSec: 1.78, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.7 },
      stars: { timeFast: 148, timeOk: 225, waterGood: 18, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.5, winZoomLand: 0.64, winLook: 0.80,
      pieces: [
        { t: 'flat',   len: 220, zone: 'shade', hint: 'start', find: [{ id: 'arantzazu', f: 0.35 }] },
        { t: 'slope',  len: 340, rise: 40, zone: 'shade', hint: 'water', bottle: 0.5 },
        { t: 'slope',  len: 300, rise: 38, zone: 'shade', boulders: [0.6] },
        { t: 'flat',   len: 140, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 280, rise: 32, look: 'flank' },
        { t: 'flat',   len: 180, sheep: { f: 0.45, n: 2, trig: 220, spacing: 2.6 }, hint: 'sheep', find: [{ id: 'urbia', f: 0.5 }] },
        { t: 'flat',   len: 160, cows: { f: 0.5, n: 1, breed: 'estive', trig: 230 }, hint: 'cows' },
        { t: 'slope',  len: 300, rise: 44, look: 'flank', bottle: 0.48, sheep: { f: 0.7, n: 1, trig: 220 } },
        { t: 'flat',   len: 110, cp: true },
        { t: 'slope',  len: 280, rise: 46, look: 'ridge', boulders: [0.35, 0.7], hint: 'scramble' },
        { t: 'slope',  len: 240, rise: 36, look: 'ridge', crumb: [{ f: 0.5, w: 52, fall: 0.7 }], hint: 'crumble', bottle: 0.55 },
        { t: 'gap',    len: 20, look: 'ridge', hint: 'gap' },
        { t: 'slope',  len: 260, rise: 34, look: 'ridge', rocks: [3.6, 5.0], hint: 'rocks', raptors: { kind: 'vautour', pebbles: [4.0, 6.0] } },
        { t: 'stairs', len: 80, rise: 24, look: 'ridge' },
        { t: 'slope',  len: 240, rise: 28, look: 'ridge', crumb: [{ f: 0.45, w: 46, fall: 0.65 }], bottle: 0.4 },
        { t: 'slope',  len: 260, rise: 26, look: 'ridge', raptors: { kind: 'vautour', pebbles: [3.8, 5.6] }, hint: 'pebbles', boulders: [0.5], find: [{ id: 'ermita', f: 0.55 }] },
        { t: 'gap',    len: 18, look: 'ridge' },
        { t: 'slope',  len: 260, rise: 24, look: 'ridge', crumb: [{ f: 0.5, w: 44, fall: 0.7 }], boulders: [0.65] },
        { t: 'slope',  len: 240, rise: 20, look: 'ridge', bottle: 0.4, rocks: [4.2, 5.8] },
        { t: 'slope',  len: 200, rise: 18, look: 'ridge', bottle: 0.5 },
        { t: 'flat',   len: 200, summit: true, look: 'ridge' }
      ],
      finds: {
        arantzazu: { name: 'Sanctuaire d\u2019Arantzazu', icon: 'arantzazu' },
        urbia:     { name: 'Campas d\u2019Urbía', icon: 'urbia' },
        ermita:    { name: 'Ermita del Santo Cristo', icon: 'ermita' }
      },
      hints: hints({
        start:    'Avance avec ◀ ▶ et saute avec ▲. Voie classique de l\u2019Aizkorri, depuis le sanctuaire d\u2019Arantzazu.',
        crumble:  'Pierrier instable : le sol se fissure puis s\u2019effondre. Traverse sans t\u2019arrêter, ou saute par-dessus.',
        scramble: 'Chaos calcaire : enchaîne les prises, attention aux blocs et aux vides.'
      }),
      hintsPad: hintsPad({
        start:    'Avance avec le stick gauche et saute avec A. Depuis Arantzazu, par Urbía.',
        crumble:  'Pierrier instable : traverse sans t\u2019arrêter, ou saute avec A.',
        scramble: 'Chaos calcaire : enchaîne les prises et saute les vides avec A.'
      })
    }
  };

  /* ---------- 13. Txindoki / Larrunarri ---------- */
  var L13 = {
    id: 'txindoki', number: 13, playable: true, world: 2,
    name: 'Txindoki',
    massif: 'Sierra d\u2019Aralar, Gipuzkoa',
    place: 'Larraitz / Abaltzisketa (Goierri)',
    route: 'Voie normale depuis Larraitz, par le col d\u2019Egurral',
    altitude: 1342,           // m — catalogue en vigueur de la Fédération basque / Mendikat. Ancien catalogue 1990–2009 : 1 346 m, encore souvent cité.
    altitudeStart: 401,       // m — campa et ermita de Larraitz (guiarutas.es, Wikipedia).
    difficulty: { label: 'Très difficile', stars: 5, of: 5, note: '940 à 1 000 m de dénivelé selon les topos, pour 10 km A/R environ. Ce n\u2019est pas une course technique de crête entière, mais le dernier versant depuis Egurral est raide, parfois glissant, sur calcaire dénudé. guiarutas.es propose un MIDE estimé 2-2-3-3 (non fédéré). Accessible à un marcheur entraîné, exigeant par le dénivelé et ce finale.' },
    hike: { distanceKm: 10.1, ascentM: 940, duration: '≈ 4 h 30 à 5 h A/R', note: 'Voie normale ouest depuis Larraitz (401 m) par la fontaine d\u2019Oria, la majada de Zirigarate et le col d\u2019Egurral (1 154 m), puis ~200 m de dénivelé en un demi-kilomètre jusqu\u2019à l\u2019épaule et la crête sommitale (guiarutas.es : 10,1 km, 940 m). randozone : 4 h 30, 1 000 m, gros succès l\u2019été.' },
    firstAscent: {
      value: 'Voie normale : non documentée ; arête ouest : 21 octobre 1951',
      note: 'Aucune date de première de la voie normale (pentes pastorales sous le sommet) n\u2019a été trouvée. L\u2019arête ouest, voie d\u2019escalade distincte, a été ouverte le 21 octobre 1951 par José M. Peciña, J. Arrate et A. Saenz de Basagoiti. Ce n\u2019est pas la première de la cime elle-même, ni le tracé joué ici.'
    },
    visitors: {
      value: 'Non documentée (très fréquenté l\u2019été et les dimanches)',
      note: 'Aucun comptage annuel n\u2019a été trouvé. randozone note une « grosse fréquentation en été ». Wikipedia décrit une cime prise d\u2019assaut les dimanches ensoleillés, d\u2019une popularité comparable à Aiako Harria, Aizkorri, Ernio ou Adarra. Edurne Pasaban y a fait, enfant, sa première montagne.'
    },
    story: [
      'Le Txindoki, ou Larrunarri, est la pyramide calcaire qui ferme la sierra d\u2019Aralar à l\u2019ouest. Le catalogue en vigueur de la Fédération basque et Mendikat donnent 1 342 m ; un catalogue plus ancien (1990–2009) indiquait 1 346 m, chiffre encore répandu. On retient 1 342 m en citant l\u2019autre. Vu de certaines vallées, on lui a prêté, avec un excès que Mendikat reconnaît, le surnom de « Cervin basque » ou « Cervin d\u2019Aralar ».',
      'La voie normale part de la campa de l\u2019ermita de Larraitz, à 401 m. Jusqu\u2019à la majada de Zirigarate (vers 925 m), c\u2019est une montée de pâturages et de bordas, avec les troupeaux de brebis latxa (environ de mai à janvier), dont le lait sert au fromage Idiazabal. On y voit aussi des vaches et, selon Wikipedia, des pottoks. Sangliers et chevreuils sont présents mais discrets. Les chèvres n\u2019ont pas été trouvées comme animal caractéristique de cette voie dans les sources consultées : on ne les place pas ici.',
      'Du col d\u2019Egurral (1 154 m) à la cime, le décor change : environ 200 m de dénivelé en un demi-kilomètre, sentier raide et décharné sur calcaire, puis une crête courte jusqu\u2019au sommet. Mouillé, le rocher glisse, surtout à la descente. Les grandes escalades (arête ouest, face sud) sortent de la voie normale : on reste sur le sentier, loin des à-pics.',
      'Au sommet se trouvent un buzon et une petite croix de fer (déjà décrits dans le récit de l\u2019arête de 1951). Le panorama ouvre sur le Goierri, le cordal d\u2019Aralar et, par temps clair, la côte guipuscoane. Les oiseaux les plus cités sont les vautours et les corbeaux, avec d\u2019autres rapaces.',
      'C\u2019est une montagne très aimée des montagnards du Gipuzkoa, gravie toute l\u2019année, à pied, en course, parfois à skis. La première montagne d\u2019Edurne Pasaban, enfant, avec ses parents.'
    ],
    recap: 'Pyramide calcaire d\u2019Aralar, 1 342 m (parfois 1 346 m dans les textes plus anciens). Voie normale depuis Larraitz (401 m) par Egurral : 10,1 km A/R, 940 m D+. Estives de brebis latxa, puis versant rocheux aérien. Croix de fer et buzon au sommet. Vautours. L\u2019arête ouest (1951) est une voie d\u2019escalade à part.',
    mission: 'Depuis <b>Larraitz</b>, d\u2019abord les <b>pâturages</b> : <b>brebis latxa</b>, parfois une <b>vache</b> ou un <b>pottok</b> (triangle ~1,8 s). Après le col d\u2019<b>Egurral</b>, le sentier se redresse : <b>passages rocheux</b>, <b>crête aérienne</b>, <b>rafales</b> (avertissement ~1 s) et petits vides. Les <b>vautours</b> n\u2019ont pas de triangle : ombre, cri, cailloux à l\u2019aplomb. <b>6 bouteilles</b>, jauge serrée. C\u2019est le plus exigeant du monde 2.',
    carnet: [
      { id: 'larraitz', name: 'Ermita de Larraitz', text: 'La voie normale part de la campa de l\u2019ermita de Larraitz, à 401 m, au pied de la pyramide. C\u2019est le grand parking et le point de ralliement des montagnards du Goierri, toute l\u2019année.', src: 'guiarutas.es ; Wikipedia — Txindoki ; randozone.com', url: 'https://guiarutas.es/rutas/pais-vasco/txindoki/' },
      { id: 'fuente', name: 'Fontaine d\u2019Oria', text: 'Entre Larraitz et la majada de Zirigarate, la voie normale passe par la fontaine d\u2019Oria. C\u2019est l\u2019un des points d\u2019eau cités sur l\u2019itinéraire, avant le versant rocheux qui mène au col d\u2019Egurral.', src: 'guiarutas.es — Subir al Txindoki desde Larraitz', url: 'https://guiarutas.es/rutas/pais-vasco/txindoki/' },
      { id: 'croix', name: 'Croix de fer et buzon', text: 'Au sommet se trouvent un buzon et une petite croix de fer. Le récit de la première de l\u2019arête ouest, le 21 octobre 1951, les mentionne déjà sur la cime, à côté de l\u2019altitude alors donnée.', src: 'donosticity.org — Txindoki. 70 años de su arista (d\u2019après le récit de 1951)', url: 'https://donosticity.org/txindoki-70-anos-de-su-arista/' }
    ],
    sources: [
      { label: 'guiarutas.es — Subir al Txindoki desde Larraitz (1 342 m Fédération / Mendikat, 1 346 m dans l\u2019ancien catalogue ; 10,1 km A/R, 940 m ; Larraitz 401 m, Egurral 1 154 m ; latxa, Idiazabal ; MIDE estimé 2-2-3-3)', url: 'https://guiarutas.es/rutas/pais-vasco/txindoki/' },
      { label: 'randozone.com — Topo Txindoki (1 346 m, 4 h 30, 1 000 m D+, parking de l\u2019ermita de Larraitz, grosse fréquentation en été)', url: 'https://www.randozone.com/topos/randonnee/10040/txindoki' },
      { label: 'Wikipedia (fr) — Txindoki (pyramide, Larraitz 401 m, estives, vaches et pottoks, sangliers, chevreuils, vautours et corbeaux ; popularité ; Edurne Pasaban ; voie normale par Egurra)', url: 'https://fr.wikipedia.org/wiki/Txindoki' },
      { label: 'donosticity.org — Txindoki. 70 años de su arista (première de l\u2019arête ouest, 21 octobre 1951, Peciña, Arrate, Saenz de Basagoiti ; buzon et petite croix de fer au sommet)', url: 'https://donosticity.org/txindoki-70-anos-de-su-arista/' }
    ],
    play: {
      theme: 'txindoki', stairsMat: 'stone',
      windCycle: 7.5, windWarn: 1.0, windGust: 2.4,
      windPush: true, windOverGaps: true, noFogPoles: true,
      water: { max: 100, start: 100, drainPerSec: 1.9, bottleGain: 58, thirstDamageEvery: 5, jumpCost: 3.5 },
      stars: { timeFast: 170, timeOk: 255, waterGood: 14, waterOk: 4 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.5, winZoomLand: 0.64, winLook: 0.80,
      pieces: [
        { t: 'flat',   len: 220, hint: 'start', find: [{ id: 'larraitz', f: 0.4 }] },
        { t: 'slope',  len: 320, rise: 40, hint: 'water', bottle: 0.5 },
        { t: 'slope',  len: 280, rise: 36 },
        { t: 'flat',   len: 180, sheep: { f: 0.5, n: 2, trig: 220, spacing: 2.6 }, hint: 'sheep' },
        { t: 'slope',  len: 340, rise: 50, pottoks: { f: 0.45, n: 1, trig: 230 }, boulders: [0.65] },
        { t: 'flat',   len: 150, cows: { f: 0.5, n: 1, breed: 'estive', trig: 230 }, hint: 'cows', find: [{ id: 'fuente', f: 0.4 }] },
        { t: 'slope',  len: 360, rise: 54, bottle: 0.48, sheep: { f: 0.6, n: 1, trig: 220 } },
        { t: 'flat',   len: 120, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 340, rise: 52, rocks: [4.0, 5.6], hint: 'rocks', boulders: [0.4] },
        { t: 'gap',    len: 20, hint: 'gap' },
        { t: 'slope',  len: 300, rise: 46, bottle: 0.45, raptors: { kind: 'vautour', pebbles: [4.2, 6.2] }, hint: 'pebbles' },
        { t: 'stairs', len: 90, rise: 28, hint: 'scramble' },
        { t: 'flat',   len: 110, cp: true },
        { t: 'slope',  len: 240, rise: 30, zone: 'wind', look: 'ridge', hint: 'storm' },
        { t: 'gap',    len: 22, look: 'ridge', zone: 'wind' },
        { t: 'slope',  len: 200, rise: 26, zone: 'wind', look: 'ridge', bottle: 0.5 },
        { t: 'stairs', len: 84, rise: 24, look: 'ridge', zone: 'wind' },
        { t: 'slope',  len: 220, rise: 24, zone: 'wind', look: 'ridge', boulders: [0.5] },
        { t: 'gap',    len: 20, look: 'ridge', zone: 'wind' },
        { t: 'slope',  len: 240, rise: 22, zone: 'wind fog', fog: 0.4, look: 'ridge', raptors: { kind: 'vautour', pebbles: [3.6, 5.6] }, bottle: 'air:0.45' },
        { t: 'flat',   len: 80, look: 'ridge', zone: 'wind' },
        { t: 'gap',    len: 20, look: 'ridge', zone: 'wind' },
        { t: 'slope',  len: 260, rise: 20, zone: 'wind', look: 'ridge', bottle: 0.45, boulders: [0.4] },
        { t: 'slope',  len: 200, rise: 18, zone: 'wind', look: 'ridge', find: [{ id: 'croix', f: 0.5 }] },
        { t: 'flat',   len: 200, summit: true, look: 'ridge' }
      ],
      finds: {
        larraitz: { name: 'Ermita de Larraitz', icon: 'larraitz' },
        fuente:   { name: 'Fontaine d\u2019Oria', icon: 'fuente' },
        croix:    { name: 'Croix de fer et buzon', icon: 'croix' }
      },
      hints: hints({
        start:    'Avance avec ◀ ▶ et saute avec ▲. Voie normale du Txindoki, depuis Larraitz. Fort dénivelé : gère l\u2019eau et le rythme.',
        scramble: 'Versant calcaire après Egurral : raide, parfois glissant. Enchaîne les prises, rythme tes sauts.',
        storm:    'Crête aérienne. « Vent… » puis « Rafale ! » (~1 s). Attends à l\u2019abri avant un vide.',
        fog:      'Brume sur la pyramide : on voit moins loin. Reste sur la trace.'
      }),
      hintsPad: hintsPad({
        start:    'Avance avec le stick gauche et saute avec A. Depuis Larraitz : fort dénivelé, surveille ta gourde.',
        scramble: 'Versant calcaire raide : enchaîne les prises et saute avec A.',
        storm:    'Rafale sur la crête (~1 s) : attends à l\u2019abri avant un vide.',
        fog:      'Brume : reste sur la trace.'
      })
    }
  };

  /* check lengths at load for designers (silent) */
  function lenOf(lv) { return lv.play.pieces.reduce(function (s, p) { return s + (p.len || 0); }, 0); }

  var INFO = {
    10: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L10), text: 'La jauge baisse en continu et chaque saut te fatigue. Le sentier du train est décrit comme peu ombragé (rhune.com). On emporte son eau. Ramasse les ' + bottlesIn(L10) + ' bouteilles : c\u2019est un ravitaillement symbolique.' }],
      obstacles: [
        { icon: '🐴', name: 'Pottoks très présents', real: 'Les pottoks vivent en liberté sur les flancs de la Rhune (rhune.com, topos). On ne les dérange pas, on ne les nourrit pas, on tient les chiens en laisse. Dans le jeu, les toucher coûte un cœur. Un triangle d\u2019environ 1,8 s annonce leur arrivée.', src: [0, 1, 7] },
        { icon: '🐑', name: 'Brebis manex et betizu', real: 'Le site, classé Natura 2000, accueille aussi des brebis (manex / manech) et, selon plusieurs topos, des betizu. Même consigne : on s\u2019arrête, on contourne, on ne les nourrit pas.', src: [0, 1] },
        { icon: '🦅', name: 'Vautours fauves et petits cailloux', real: 'Le vautour fauve fréquente le ciel du massif (txiki-combi, france.fr). Qu\u2019il lâche des cailloux est un obstacle de jeu, annoncé seulement par une ombre et un cri. Les pierres tombent à l\u2019aplomb de l\u2019oiseau. Dans la vraie vie, on observe les rapaces à distance.', src: [1, 7] },
        { icon: '🪨', name: 'Sentier caillouteux, roches patinées', real: 'La dernière partie de la montée est plus pierreuse et un peu plus technique, sans être une escalade (plusieurs topos). Dans le jeu : rochers à sauter, quelques pierres qui dévalent, un court passage en marches.', src: [1, 6] },
        { icon: '🌫️', name: 'Brouillard marin', real: 'Depuis l\u2019océan tout proche, la brume peut remonter sur le massif et réduire la vue. Dans le jeu, des bancs de brouillard apparaissent dans la partie haute.', src: [] },
        { icon: '🚆', name: 'Train à crémaillère (décor)', real: 'Le petit train de 1924 est visible sur la montagne, et le sentier du col longe la voie. Dans le jeu, les rails et une rame typifiée sont un décor : on n\u2019invente pas de passage à niveau. Le sentier réel ne traverse pas la voie comme le chemin des Chèvres au puy de Dôme.', src: [0, 1, 5] }
      ],
      enjeux: [
        { t: 'Natura 2000 : pottoks et brebis sont chez eux. Ne pas les nourrir ni les déranger, chiens en laisse, rester sur les sentiers balisés, ramasser ses déchets (rhune.com).', s: [0] },
        { t: 'Peu d\u2019ombre et dénivelé important : emporter de l\u2019eau, de bonnes chaussures, éviter l\u2019heure la plus chaude en été.', s: [0, 1] },
        { t: 'Fréquentation : le train draine 300 000 à 350 000 voyageurs par an selon les sources ; le sentier du col est saturé en haute saison. Aucun chiffre de randonneurs n\u2019a été trouvé.', s: [4, 5] }
      ],
      items: { water: { where: 'Sur la montée, l\u2019une un peu en hauteur (il faut sauter).', why: 'Le sentier du train n\u2019a pas de point d\u2019eau aménagé cité dans nos sources : on emporte son eau. Les bouteilles du jeu sont un ravitaillement symbolique.', src: [0] } }
    },
    11: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L11), text: 'Aucun point d\u2019eau potable n\u2019est signalé sur les parcours de l\u2019Artzamendi (naturelandespaysbasque.com). La voie longue est peu ombragée : en été, la chaleur s\u2019ajoute à l\u2019exposition. Ramasse les ' + bottlesIn(L11) + ' bouteilles.' }],
      obstacles: [
        { icon: '☀️', name: 'Rampes sans ombre, soif', real: 'Les récits de la voie longue insistent sur le manque d\u2019ombre et, l\u2019été, sur la chaleur. Aucune eau potable sur l\u2019itinéraire. Dans le jeu, les zones au soleil vident la gourde plus vite.', src: [0, 2] },
        { icon: '🐴', name: 'Pottoks et betizu', real: 'Pottoks et vaches betizu pâturent en liberté sur toutes les pentes (naturelandespaysbasque.com). On ne les nourrit pas, on ne les approche pas, on contourne un troupeau. Triangle d\u2019environ 1,8 s dans le jeu.', src: [0, 1] },
        { icon: '🐑', name: 'Brebis', real: 'Les grandes boucles citent aussi les brebis manex, à côté des pottoks et des betizu.', src: [3] },
        { icon: '🦅', name: 'Vautours fauves et petits cailloux', real: 'Les Peñas d\u2019Itsusi, au sud du col de Méhatzé, abritent l\u2019une des plus anciennes colonies de vautours fauves des Pyrénées. Le lâcher de cailloux est un obstacle de jeu (ombre et cri seulement).', src: [0, 2] },
        { icon: '🌫️', name: 'Brouillard au sommet', real: 'Le brouillard remonte vite et peut avaler la crête en quelques minutes (naturelandespaysbasque.com). Sur les portions peu balisées, c\u2019est un vrai problème d\u2019orientation.', src: [0] }
      ],
      enjeux: [
        { t: 'Aucun point d\u2019eau potable : partir avec 1,5 L au minimum, 2 L sur les boucles longues (naturelandespaysbasque.com).', s: [0] },
        { t: 'Pottoks et betizu : ne pas nourrir, ne pas approcher, contourner un troupeau qui barre le sentier.', s: [0] },
        { t: 'Falaises des Peñas d\u2019Itsusi : colonies de vautours, à-pics sans garde-corps sur le circuit depuis Méhatzé. Observer de loin.', s: [0] },
        { t: 'Deux voies très différentes : la courte (Méhatzé) est facile et très fréquentée ; la longue (Itxassou) est exigeante et moins courue. Le jeu joue la seconde, en signalant la première.', s: [0, 1] }
      ],
      items: { water: { where: 'Sur la longue montée, certaines en hauteur (il faut sauter).', why: 'Aucun point d\u2019eau potable n\u2019est cité, quel que soit l\u2019itinéraire. Les bouteilles du jeu sont un ravitaillement symbolique.', src: [0] } }
    },
    12: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L12), text: 'Course longue (plus de 17 km A/R, près de 950 m de dénivelé). Une taberna avec fontaine est citée aux campas d\u2019Urbía, mais on part avec son eau. Ramasse les ' + bottlesIn(L12) + ' bouteilles.' }],
      obstacles: [
        { icon: '🐑', name: 'Brebis latxa', real: 'Les campas d\u2019Urbía sont des estives où paissent notamment les brebis latxa, dont le lait entre dans le fromage Idiazabal. On laisse passer le troupeau (triangle ~1,8 s).', src: [1] },
        { icon: '🐄', name: 'Vaches d\u2019estive', real: 'Le bétail (ganado) fréquente les campas. Les vaches d\u2019estive du jeu s\u2019appuient sur cette présence documentée. Les chevaux ou pottoks n\u2019ont pas été trouvés nommément sur cette voie : ils ne sont pas placés ici.', src: [1] },
        { icon: '🪨', name: 'Chaos calcaire et pierrier instable', real: 'Au-dessus d\u2019Urbía, le sentier entre dans le karst et une pedriza irrégulière, plus raide, sans difficulté technique majeure par beau temps (komandokroketa, sport-trackmountain). Dans le jeu, des bandes de sol s\u2019effritent, comme un pierrier instable : on traverse sans s\u2019arrêter, ou on saute.', src: [0, 1] },
        { icon: '🦅', name: 'Vautours fauves et petits cailloux', real: 'Le parc abrite l\u2019une des plus grandes colonies de vautours fauves du Gipuzkoa. Le lâcher de cailloux est un obstacle de jeu (ombre et cri, à l\u2019aplomb de l\u2019oiseau).', src: [3] }
      ],
      enjeux: [
        { t: 'Estives d\u2019Urbía : refermer les barrières, ne pas couper à travers un troupeau, chiens tenus.', s: [1] },
        { t: 'Karst : le lapiaz cache des trous. Rester sur le sentier balisé (marques jaunes, cairns) protège le sol et évite une chute.', s: [0, 1] },
        { t: 'Vautours : l\u2019une des grandes colonies du Gipuzkoa. Observer de loin, ne pas approcher les vires.', s: [3] },
        { t: 'Fréquentation : sommet très populaire, sans comptage annuel trouvé. Aitxuri (1 551 m) est plus haut, moins visité.', s: [0, 1] }
      ],
      items: { water: { where: 'Sur la montée, l\u2019une un peu en hauteur (il faut sauter).', why: 'Une fontaine est citée à la taberna d\u2019Urbía, à mi-course. On part néanmoins avec son eau. Les bouteilles du jeu restent un ravitaillement symbolique.', src: [0] } }
    },
    13: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L13), text: 'Fort dénivelé (940 à 1 000 m). Une fontaine (Oria) est citée sur la voie normale, dans les pâturages, pas sur le versant rocheux final. Ramasse les ' + bottlesIn(L13) + ' bouteilles.' }],
      obstacles: [
        { icon: '🐑', name: 'Brebis latxa et bétail d\u2019estive', real: 'Jusqu\u2019à Zirigarate, la montée traverse des pâturages où les latxas montent de mai à janvier (guiarutas.es). Wikipedia cite aussi vaches et pottoks. Triangle d\u2019environ 1,8 s. Les chèvres n\u2019ont pas été trouvées comme animal typique de cette voie : elles ne sont pas placées ici.', src: [0, 2] },
        { icon: '🪨', name: 'Versant rocheux après Egurral', real: 'Du col d\u2019Egurral à la cime : environ 200 m de dénivelé en un demi-kilomètre, sentier raide et décharné sur calcaire, puis une crête courte (Mendikat, Senditur, guiarutas.es). Mouillé, ça glisse, surtout à la descente. Dans le jeu : marches, vides, rochers.', src: [0] },
        { icon: '💨', name: 'Crête aérienne et rafales', real: 'La cime est une arête calcaire exposée. Les topos insistent sur la prudence près des à-pics, qui n\u2019appartiennent pas à la voie normale. Dans le jeu, des rafales poussent vraiment le randonneur, avec un avertissement d\u2019environ 1 s, comme sur l\u2019Orhy.', src: [0, 2] },
        { icon: '🦅', name: 'Vautours et petits cailloux', real: 'Vautours et corbeaux sont les oiseaux les plus cités (Wikipedia). Le lâcher de cailloux est un obstacle de jeu (ombre et cri, à l\u2019aplomb).', src: [2] }
      ],
      enjeux: [
        { t: 'Rester sur la voie normale : l\u2019arête ouest et la face sud sont des voies d\u2019escalade, pas le sentier de randonnée. Ne pas s\u2019approcher des cortados.', s: [0] },
        { t: 'Estives et fromage Idiazabal : laisser passer les troupeaux, refermer, chiens tenus.', s: [0] },
        { t: 'Calcaire mouillé ou verglacé : le finale devient délicat, surtout à la descente.', s: [0] },
        { t: 'Très fréquenté l\u2019été et les dimanches, sans comptage annuel trouvé.', s: [1, 2] }
      ],
      items: { water: { where: 'Sur la montée, l\u2019une un peu en hauteur (il faut sauter).', why: 'La fontaine d\u2019Oria est citée sur la voie normale, dans les pâturages. Le versant final n\u2019en a pas. Les bouteilles du jeu restent un ravitaillement symbolique.', src: [0] } }
    }
  };

  var CARNET = {
    cromlech:  { icon: '🪨', where: 'La Rhune — caché en hauteur.', why: 'Cromlechs, tumuli et dolmens du massif témoignent d\u2019une présence humaine dès la préhistoire.' },
    obelisque: { icon: '🏛️', where: 'La Rhune — caché en hauteur.', why: 'Un obélisque de granit rappelle l\u2019excursion de l\u2019impératrice Eugénie, le 30 septembre 1859.' },
    venta:     { icon: '🏠', where: 'La Rhune — caché en hauteur.', why: 'Les ventas de la frontière, anciennes auberges de col, font partie du paysage sommittal.' },
    roland:    { icon: '🪨', where: 'Artzamendi — caché en hauteur.', why: 'Le Pas de Roland, dans la vallée de la Nive, est le départ classique de la voie longue.' },
    cromlech2: { icon: '🪨', where: 'Artzamendi — caché en hauteur.', why: 'Les cromlechs de Méhatzé se trouvent sur le plateau du col, à 716 m, sur plusieurs itinéraires.' },
    radar:     { icon: '📡', where: 'Artzamendi — caché en hauteur.', why: 'La boule blanche du radar d\u2019aviation civile, en service depuis 1996, rend le sommet reconnaissable.' },
    arantzazu: { icon: '⛪', where: 'Aizkorri — caché en hauteur.', why: 'Le sanctuaire d\u2019Arantzazu (années 1950, Oteiza, Chillida) est le départ de la voie classique.' },
    urbia:     { icon: '🌿', where: 'Aizkorri — caché en hauteur.', why: 'Les campas d\u2019Urbía, vastes estives vers 1 100–1 200 m, précèdent le versant calcaire.' },
    ermita:    { icon: '⛪', where: 'Aizkorri — caché en hauteur.', why: 'L\u2019ermita del Santo Cristo et un petit refuge se tiennent juste sous la cime.' },
    larraitz:  { icon: '⛪', where: 'Txindoki — caché en hauteur.', why: 'L\u2019ermita de Larraitz, à 401 m, est le départ de la voie normale.' },
    fuente:    { icon: '💧', where: 'Txindoki — caché en hauteur.', why: 'La fontaine d\u2019Oria se trouve sur la voie normale, dans les pâturages, avant Egurral.' },
    croix:     { icon: '✝️', where: 'Txindoki — caché en hauteur.', why: 'Une petite croix de fer et un buzon marquent la cime, déjà cités en 1951.' }
  };

  function plug(lv, idx, ending) {
    if (MAPN[idx - 6]) { lv.node = { x: MAPN[idx - 6][0], y: MAPN[idx - 6][1] }; }
    else if (LV[idx] && LV[idx].node) { lv.node = LV[idx].node; }
    lv.info = INFO[lv.number];
    lv.ending = ending;
    LV[idx] = lv;
  }

  function endingOf(banner) {
    return {
      hideFlag: true, noRing: true, fullBleed: true, noExt: true,
      fx: { clouds: false, vultures: 2, shimmer: true },
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

  plug(L10, 9, endingOf('ending-rhune'));
  plug(L11, 10, endingOf('ending-artzamendi'));
  plug(L12, 11, endingOf('ending-aizkorri'));
  plug(L13, 12, endingOf('ending-txindoki'));

  var base = D.INFO || {}; for (var n in INFO) { base[n] = INFO[n]; } D.INFO = base;
  var cb = D.CARNET_INFO || {}; for (var c in CARNET) { cb[c] = CARNET[c]; } D.CARNET_INFO = cb;

  /* longueurs, pour contrôle interne */
  L10._len = lenOf(L10); L11._len = lenOf(L11); L12._len = lenOf(L12); L13._len = lenOf(L13);
})();
