/* v0.8.0 — Niveaux 7 (Ursuya), 8 (Atxuria) et 9 (Pic d'Orhy), monde 2 Pays basque.
   Tous les faits des fiches viennent de sources web consultées les 10–11/11/2026.
   Inconnu = « Non documentée ». Aucun chiffre n'est inventé. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS, MAPN = (D.WORLDS && D.WORLDS[1] && D.WORLDS[1].nodes) || [];

  function bottlesIn(lv) { return lv.play.pieces.filter(function (p) { return p.bottle != null; }).length; }

  var L7 = {
    id: 'ursuya', number: 7, playable: true, world: 2,
    name: 'Ursuya',
    massif: 'Pays basque, Labourd',
    place: 'Hasparren / Macaye (Pyrénées-Atlantiques)',
    route: 'Depuis le quartier Celhay',
    altitude: 678,            // m — IGN 678,58 m (borne 1949, site 6436401, commune de Macaye)
    altitudeStart: 292,       // m — parking avant la ferme Garatekoborda, quartier Celhay (naturelandespaysbasque.com)
    difficulty: { label: 'Facile', stars: 1, of: 5, note: 'Rien de technique : pente régulière, pas de passage de mains ni d\u2019arête (naturelandespaysbasque.com). La difficulté tient à la pente terminale herbeuse, à l\u2019exposition (plus d\u2019arbre une fois les premiers lacets passés) et à l\u2019orientation par brume.' },
    hike: { distanceKm: 6.89, ascentM: 394, duration: '≈ 3 h 05', note: 'Voie directe depuis le parking du quartier Celhay, balisage jaune (naturelandespaysbasque.com / Visorando). Autre tracé au départ du même parking : la boucle Bidegaraia, 10,8 km et +550 m, 3 h 30 (Office de tourisme du Pays Basque / tourisme64).' },
    firstAscent: {
      value: 'Non documentée',
      note: 'Aucune date de première ascension n\u2019apparaît dans les sources consultées (IGN, offices de tourisme, Visorando, topos de randonnée).'
    },
    visitors: {
      value: 'Non documentée',
      note: 'Aucun comptage annuel des passages au sommet n\u2019a été trouvé dans les sources consultées. Le chiffre n\u2019est donc pas indiqué.'
    },
    story: [
      'L\u2019Ursuya (Urtsua, Ursuia ; fiche IGN Urtsumendi) culmine à 678,58 m selon la borne en granit de l\u2019IGN, scellée en 1949 au sommet, sur la commune de Macaye (site 6436401). Le nom est rattaché à ur, l\u2019eau : le massif est un gneiss fracturé où l\u2019eau circule dans les fissures et ressort en sources de tous les côtés.',
      'L\u2019accès classique, balisé par l\u2019office de tourisme, part du parking du quartier Celhay à Hasparren, juste avant la ferme Garatekoborda, à 292 m. La voie directe fait 6,89 km pour +394 m et environ 3 h 05. Une boucle plus longue, Bidegaraia, redescend côté Macaye et emprunte un tronçon de la route Napoléon (voie stratégique tracée entre 1808 et 1814 de Bayonne à Saint-Jean-Pied-de-Port).',
      'Au départ, au bord du chemin, la stèle des Évadés a été érigée en 1998 : elle rappelle les passeurs et les fugitifs qui franchissaient ces pentes vers l\u2019Espagne pendant la Seconde Guerre mondiale. Plus bas sur les boucles de tour, l\u2019éperon de Mokorreta conserve les traces d\u2019un camp protohistorique.',
      'Le sommet est un dôme d\u2019herbe, pas une pointe : un grand cairn, la borne IGN, un second repère en tube de fer (678,37 m) et un banc de bois. Il n\u2019y a ni abri, ni croix, ni table d\u2019orientation. Le panorama, parce que la montagne est isolée, ouvre au nord vers les Landes, à l\u2019ouest vers la côte, et au sud vers La Rhune, le Mondarrain et l\u2019Artzamendi.',
      'Les pentes sont pâturées : on y croise des brebis manex (manech) et des pottoks en liberté. Mouillée, l\u2019herbe rase de la pente terminale glisse. Passé les premiers châtaigniers, le versant est entièrement ouvert : par gros temps, le dôme est exposé, et la brume peut effacer les repères. L\u2019eau de ces sources alimente une bonne partie du nord du Pays Basque : les périmètres de captage ne se franchissent pas.'
    ],
    recap: 'Dôme herbeux isolé de 678 m (IGN 678,58 m) au-dessus de Hasparren, au sommet sur Macaye : on y monte classiquement depuis le quartier Celhay (6,89 km, +394 m). Stèle des Évadés (1998), route Napoléon, pâturages de pottoks et de brebis manex, et des sources qui alimentent le Labourd.',
    mission: 'Premier sentier du Pays basque, en guise de tutoriel du monde 2. <b>Laisse passer les pottoks</b> qui traversent le chemin (ne les bouscule pas : les toucher coûte un cœur). Sur l\u2019<b>herbe mouillée</b>, ça glisse. Quand un <b>rapace</b> passe, une <b>ombre au sol</b> et un <b>cri</b> annoncent un petit caillou : écarte-toi (ce n\u2019est pas le triangle des éboulis). Vers le sommet, un <b>orage</b> peut souffler. <b>3 bouteilles</b> t\u2019attendent.',
    carnet: [
      { id: 'borne', name: 'Borne IGN de l\u2019Ursuya', text: 'Le sommet porte une borne en granit de l\u2019Institut géographique national, scellée en 1949. Le nivellement lui donne 678,58 m (site 6436401, commune de Macaye). Un second repère en tube de fer, scellé dans le rocher voisin, est donné à 678,37 m.', src: 'naturelandespaysbasque.com — Mont Ursuya', url: 'https://www.naturelandespaysbasque.com/mont-ursuya-hasparren' },
      { id: 'stele', name: 'Stèle des Évadés', text: 'Au départ du sentier, au bord du chemin, la stèle des Évadés a été érigée en 1998. Elle rappelle les passeurs et les fugitifs qui franchissaient ces pentes vers l\u2019Espagne pendant la Seconde Guerre mondiale.', src: 'naturelandespaysbasque.com — Mont Ursuya', url: 'https://www.naturelandespaysbasque.com/mont-ursuya-hasparren' },
      { id: 'source', name: 'Regard de captage', text: 'Le massif est un gneiss fracturé où l\u2019eau circule dans les fissures. Une thèse soutenue en 2012 à Bordeaux-III par Jessy Jaunat a décrit ce fonctionnement. Ces sources alimentent en eau potable une bonne partie du nord du Pays Basque, d\u2019où les périmètres de protection que l\u2019on croise en montant.', src: 'naturelandespaysbasque.com — Mont Ursuya (d\u2019après Jaunat, 2012)', url: 'https://www.naturelandespaysbasque.com/mont-ursuya-hasparren' }
    ],
    sources: [
      { label: 'naturelandespaysbasque.com — Mont Ursuya (678,58 m IGN, Celhay 292 m, 6,89 km / +394 m, Bidegaraia 10,8 km / +550 m, stèle des Évadés, route Napoléon, camp de Mokorreta, pottoks, manex, captages, écobuage)', url: 'https://www.naturelandespaysbasque.com/mont-ursuya-hasparren' },
      { label: 'Visorando — L\u2019Ursuya depuis le quartier Celhay d\u2019Hasparren (6,89 km, +394 m, 3 h 05 ; point haut 678 m)', url: 'https://www.visorando.com/randonnee-l-ursuya-depuis-le-quartier-celhay-d-has/' },
      { label: 'topopyrenees.com — panorama 360° depuis l\u2019Ursuya (La Rhune, Mondarrain, Artzamendi, Iparla, océan, Bayonne, Biarritz, Ossau au loin, vautours fauves)', url: 'https://www.topopyrenees.com/randonnee-mont-ursuia-ursuya-679m-depuis-urcuray/' },
      { label: 'Wikipedia — Mont Ursuya (43°20\u203236\u2033N 1°20\u203202\u2033O), Baïgura (897 m, émetteurs), Mondarrain, Artzamendi, La Rhune', url: 'https://fr.wikipedia.org/wiki/Mont_Ursuya' },

      { label: 'tourisme64 — Bidegaraia à Hasparren (boucle 10,8 km, +550 m, 3 h 30, pottoks)', url: 'https://www.tourisme64.com/sur-place/itineraires/hasparren/ITIAQU064V5AZOU2-bidegaraia/' },
      { label: 'tourisme64 — Urtsua-Ursuia depuis Macaye (boucle de tour, sans le sommet : 12,2 km, +480 m)', url: 'https://www.tourisme64.com/itineraire/macaye/ITIAQU064V5AZPZK-urtsua-ursuia-macaye/' }
    ],
    play: {
      theme: 'ursuya', stairsMat: 'stone', windCycle: 11.0,
      water: { max: 100, start: 100, drainPerSec: 1.45, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.2 },
      stars: { timeFast: 78, timeOk: 122, waterGood: 28, waterOk: 8 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.80,
      pieces: [
        { t: 'flat',   len: 220, hint: 'start' },
        { t: 'slope',  len: 280, rise: 26, hint: 'water' },
        { t: 'slope',  len: 260, rise: 22, zone: 'wet', hint: 'wet' },
        { t: 'flat',   len: 210, pottoks: { f: 0.55, n: 1, trig: 240, spacing: 2.6 }, hint: 'pottoks' },
        { t: 'slope',  len: 300, rise: 36, bottle: 0.5, boulders: [0.62] },
        { t: 'gap',    len: 20, hint: 'gap' },
        { t: 'slope',  len: 280, rise: 32, hint: 'tired' },
        { t: 'flat',   len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 340, rise: 40, raptors: { kind: 'buzzard', pebbles: [6.8, 9.2] }, find: [{ id: 'borne', f: 0.35 }], hint: 'pebbles' },
        { t: 'slope',  len: 260, rise: 24, zone: 'wet', boulders: [0.45] },
        { t: 'flat',   len: 220, pottoks: { f: 0.5, n: 2, trig: 230, period: 11, spacing: 2.8 }, hint: 'pottoks' },
        { t: 'slope',  len: 300, rise: 40, sheep: { f: 0.55, n: 1, trig: 220, spacing: 2.6 }, bottle: 0.45, find: [{ id: 'stele', f: 0.6 }], hint: 'sheep' },
        { t: 'gap',    len: 22 },
        { t: 'slope',  len: 280, rise: 36, raptors: { kind: 'falcon', pebbles: [7.2, 10] } },
        { t: 'flat',   len: 100, cp: true },
        { t: 'slope',  len: 340, rise: 46, zone: 'storm', hint: 'storm', bottle: 'air:0.55', find: [{ id: 'source', f: 0.4 }] },
        { t: 'slope',  len: 240, rise: 26, zone: 'storm', boulders: [0.5] },
        { t: 'flat',   len: 200, summit: true }
      ],
      finds: {
        borne:  { name: 'Borne IGN de l\u2019Ursuya', icon: 'borne' },
        stele:  { name: 'Stèle des Évadés', icon: 'stele' },
        source: { name: 'Regard de captage', icon: 'source' }
      },
      hints: {
        start:      'Avance avec ◀ ▶ et saute avec ▲ (clavier : flèches + Espace). Premier sentier du Pays basque !',
        water:      'Ta jauge d\u2019eau baisse avec le temps. Trouve des bouteilles en chemin !',
        wet:        'Herbe mouillée, rosée du matin : ça glisse ! Marche avec prudence, tu continues un peu sur ta lancée.',
        pottoks:    'Un pottok traverse le sentier : arrête-toi et laisse-le passer, ou saute par-dessus. Le bousculer coûte un cœur.',
        sheep:      'Une brebis manex traverse : laisse-la passer, ou saute par-dessus. La bousculer coûte un cœur.',
        tired:      'Chaque saut te fatigue : ta gourde se vide plus vite. Ne saute que si c\u2019est utile !',
        gap:        'Un vide ! Prends de l\u2019élan et saute par-dessus.',
        checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
        bottle:     'Une bouteille d\u2019eau ! Ramasse-la pour remplir la jauge.',
        pebbles:    'Un rapace lâche un petit caillou : l\u2019ombre au sol et le cri t\u2019avertissent (pas le triangle des éboulis). Écarte-toi !',
        storm:      'Le dôme est exposé : un orage souffle de face. Anticipe tes sauts.',
        boulder:    'Un rocher bloque le chemin : saute par-dessus !'
      },
      hintsPad: {
        start:      'Avance avec le stick gauche (ou la croix) et saute avec A. Premier sentier du Pays basque !',
        boulder:    'Un rocher bloque le chemin : saute par-dessus avec A !',
        pottoks:    'Un pottok traverse : relâche le stick et laisse-le passer, ou saute par-dessus. Le bousculer coûte un cœur.',
        sheep:      'Une brebis traverse : relâche le stick et laisse-la passer, ou saute par-dessus.',
        wet:        'Herbe mouillée : ça glisse ! Marche avec prudence.',
        pebbles:    'Ombre au sol et cri : un caillou va tomber. Écarte-toi (pas le triangle des éboulis).'
      }
    }
  };

  var L8 = {
    id: 'atxuria', number: 8, playable: true, world: 2,
    name: 'Atxuria',
    massif: 'Pays basque, Labourd',
    place: 'Sare (Pyrénées-Atlantiques)',
    route: 'Depuis les Grottes de Sare',
    altitude: 758,            // m — figure courante (Mendikat : vértice 757,590 m ; plaque « Peña Plata 756 m » ; tourisme64 : 759 m après le sommet)
    altitudeStart: 180,       // m — parking des Grottes de Sare (tourisme64 indique 180 m au départ ; Visorando point bas 178 m)
    difficulty: { label: 'Facile à moyenne', stars: 2, of: 5, note: 'L\u2019office de tourisme (tourisme64) et Visorando classent la boucle « Moyenne » ; Altituderando « Moyen » ; rando-pays-basque.info la dit « facile ». Montée parfois soutenue, puis crête et descente par les falaises.' },
    hike: { distanceKm: 7.2, ascentM: 620, duration: '≈ 3 h', note: 'Boucle officielle au départ des Grottes de Sare (tourisme64 : 7,2 km, 620 m D+, 3 h). Autres sources : Visorando 7,00 à 7,22 km et +617 à +644 m ; AllTrails 7,4 km et +591 m ; Altituderando ≈ 7 km et 595 m.' },
    firstAscent: {
      value: 'Non documentée',
      note: 'Aucune date de première ascension n\u2019apparaît dans les sources consultées (Mendikat, offices de tourisme, Visorando, topos).'
    },
    visitors: {
      value: 'Non documentée au sommet',
      note: 'Aucun comptage des passages au sommet n\u2019a été trouvé. En revanche, les Grottes de Sare, au départ de la randonnée, reçoivent près de 100 000 visiteurs par an (communauté d\u2019agglomération Pays Basque / documentation CEN) : ce chiffre concerne la visite des grottes, pas l\u2019ascension.'
    },
    story: [
      'L\u2019Atxuria (aussi Axuria, Arxuria ; en espagnol Peña Plata) culmine à 758 m environ. Le vértice géodésique de Mendikat donne 757,590 m ; une plaque au sommet porte « Peña Plata 756 m » ; l\u2019office de tourisme évoque 759 m juste après la cime. Le nom basque vient d\u2019aitz-xuria, « roche blanche » ; Peña Plata signifie « roche d\u2019argent ».',
      'On part du parking des Grottes de Sare (environ 180 m) : escaliers en rondins, sous-bois, puis une montée parfois soutenue rejoint la crête que l\u2019on longe jusqu\u2019au cairn sommittal. La boucle officielle fait 7,2 km pour 620 m de dénivelé et environ 3 h (tourisme64).',
      'Après le sommet, le sentier plonge vers le versant de Zugarramurdi, le « village des sorcières », puis longe des falaises aux vires brun-rouge : elles servent de refuge et de nichoir aux colonies de vautours fauves. Plus bas, la bergerie-bar Loretxoa et un vallon de hêtres et de ruisseaux ramènent vers les grottes.',
      'Le calcaire a sculpté un lapiaz : blocs, fissures, et des trous karstiques parfois masqués par les fougères — un risque de torsion bien réel si l\u2019on quitte le sentier. Tout près, les Grottes de Sare (Lezea) abritent treize espèces de chauves-souris, suivies par le CEN et le Groupe chiroptères d\u2019Aquitaine : une partie de la grotte est exclue des visites pour limiter le dérangement.'
    ],
    recap: 'Sommet calcaire de 758 m (757,59 à 759 m selon les sources) au-dessus des Grottes de Sare : boucle de 7,2 km et +620 m, crête « roche blanche / roche d\u2019argent », falaises aux vautours fauves, lapiaz et grottes riches en chauves-souris.',
    mission: 'Sous-bois, puis crête calcaire. Au départ, des <b>chauves-souris</b> s\u2019envolent près de la grotte (elles ne font pas mal). Des <b>trous karstiques</b> se cachent sous les fougères : à l\u2019approche, tu aperçois la fissure — saute-la. Des <b>blocs de lapiaz</b> barrent le sentier, puis un <b>court passage un peu plus raide</b>. Des <b>sangliers</b> peuvent charger : laisse-les passer. Les <b>vautours</b> lâchent de petits cailloux (ombre + cri). <b>4 bouteilles</b> t\u2019attendent.',
    carnet: [
      { id: 'calcaire', name: 'Roche d\u2019argent', text: 'Atxuria vient d\u2019aitz-xuria, « roche blanche » ; le nom espagnol Peña Plata signifie « roche d\u2019argent ». Le sentier longe une bande rocheuse claire, un lapiaz de calcaire fissuré typique de ce massif.', src: 'Visorando / Altituderando — Atxuria (étymologie) ; tourisme64 — description de la crête et des falaises', url: 'https://www.visorando.com/randonnee-axuria-depuis-les-grottes-de-sare/' },
      { id: 'plaque', name: 'Plaque Peña Plata', text: 'Au sommet, un gros cairn marque la cime. Une plaque porte le nom de Peña Plata et l\u2019altitude 756 m, un peu en dessous des 757,590 m du vértice géodésique (Mendikat) et des 758-759 m cités par d\u2019autres sources.', src: 'Mendikat — Arxuria / Peña Plata (vértice 757,590 m) ; observations de topos (plaque 756 m)', url: 'https://www.mendikat.net/' },
      { id: 'chauve', name: 'Chauve-souris de Lezea', text: 'Les Grottes de Sare (Lezea), au pied de l\u2019Atxuria, accueillent treize espèces de chauves-souris, suivies par le CEN et le Groupe chiroptères d\u2019Aquitaine. Des zones sont exclues des visites et l\u2019éclairage est ciblé pour limiter le dérangement.', src: 'Communauté d\u2019agglomération Pays Basque — observation d\u2019une colonie ; documentation CEN / Grottes de Sare', url: 'https://www.communaute-paysbasque.fr/les-projets-leader/leader/systeme-video-pour-l-observation-d-une-colonie-de-chauve-souris-dans-la-grotte-de-sare' }
    ],
    sources: [
      { label: 'tourisme64 — Axuria depuis les Grottes de Sare (7,2 km, 620 m D+, 3 h, Moyenne ; départ 180 m ; vautours fauves sur les falaises)', url: 'https://www.tourisme64.com/itineraire/sare/ITIAQU064V5B0Y2M-axuria/' },
      { label: 'Visorando — Axuria depuis les Grottes de Sare (7,00 km, +617 m, point haut 753-759 m, point bas 178 m, Moyenne ; mêmes falaises et vautours fauves)', url: 'https://www.visorando.com/randonnee-axuria-depuis-les-grottes-de-sare/' },
      { label: 'Altituderando — Atxuria 758 m (≈ 7 km, 595 m, 3 h, Moyen)', url: 'https://www.altituderando.com/' },
      { label: 'Altituderando — Atxuria 758 m depuis les Grottes de Sare (crête, cairns, borne IGN, plaque Peña Plata 756 m, vue La Rhune et l\u2019Ibanteli)', url: 'https://www.altituderando.com/Atxuria-758m-par-le-PR-au-depart-des-grottes-de-Sare' },
      { label: 'jpdugene.com — sommet Atxuria / Peña Plata (côte Bidart et Biarritz, villages de Sare et Zugarramurdi)', url: 'http://jpdugene.com/fiches_rando/atxuria.htm' },

      { label: 'rando-pays-basque.info — L\u2019Atxuria depuis les grottes de Sare (759 m, 570 m, 4 h, « facile »)', url: 'https://rando-pays-basque.info/atxuria/' },
      { label: 'Communauté Pays Basque — colonie de chauves-souris de la grotte de Sare (suivi vidéo)', url: 'https://www.communaute-paysbasque.fr/les-projets-leader/leader/systeme-video-pour-l-observation-d-une-colonie-de-chauve-souris-dans-la-grotte-de-sare' },
      { label: 'Grottes de Sare — grotte Lezea', url: 'https://www.grottesdesare.fr/lezea.html' }
    ],
    play: {
      theme: 'atxuria', stairsMat: 'stone',
      water: { max: 100, start: 100, drainPerSec: 1.55, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.4 },
      stars: { timeFast: 96, timeOk: 150, waterGood: 24, waterOk: 6 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.48, winZoomLand: 0.62, winLook: 0.80,
      pieces: [
        { t: 'flat',    len: 200, zone: 'shade', bats: { n: 5, f: 0.28, spacing: 1.2 }, hint: 'start' },
        { t: 'slope',   len: 280, rise: 28, zone: 'shade', hint: 'bats' },
        { t: 'slope',   len: 300, rise: 36, zone: 'shade', bottle: 0.5, boulders: [0.62] },
        { t: 'slope',   len: 280, rise: 26, karst: [{ f: 0.52, w: 20 }], hint: 'karst' },
        { t: 'slope',   len: 300, rise: 34, boulders: [0.3, 0.72], hint: 'lapiaz', find: [{ id: 'calcaire', f: 0.4 }] },
        { t: 'flat',    len: 110, cp: true, hint: 'checkpoint' },
        { t: 'flat',    len: 230, boars: { f: 0.5, n: 1, trig: 220, spacing: 2.8 }, hint: 'boars' },
        { t: 'slope',   len: 300, rise: 40 },
        { t: 'gap',     len: 22, hint: 'gap' },
        { t: 'stairs',  len: 200, rise: 56, hint: 'scramble' },
        { t: 'slope',   len: 300, rise: 38, raptors: { kind: 'vautour', pebbles: [5.6, 8.2] }, hint: 'pebbles', bottle: 0.42 },
        { t: 'slope',   len: 260, rise: 24, karst: [{ f: 0.38, w: 18 }, { f: 0.78, w: 16 }] },
        { t: 'flat',    len: 100, cp: true },
        { t: 'flat',    len: 220, boars: { f: 0.55, n: 2, trig: 210, period: 12, spacing: 3.0 } },
        { t: 'slope',   len: 340, rise: 46, raptors: { kind: 'vautour', pebbles: [5.2, 7.6] }, find: [{ id: 'plaque', f: 0.5 }], bottle: 'air:0.48' },
        { t: 'slope',   len: 280, rise: 30, karst: [{ f: 0.55, w: 18 }], boulders: [0.32] },
        { t: 'slope',   len: 300, rise: 36, find: [{ id: 'chauve', f: 0.35 }], bottle: 0.58 },
        { t: 'flat',    len: 200, summit: true }
      ],
      finds: {
        calcaire: { name: 'Roche d\u2019argent', icon: 'calcaire' },
        plaque:   { name: 'Plaque Peña Plata', icon: 'plaque' },
        chauve:   { name: 'Chauve-souris de Lezea', icon: 'chauve' }
      },
      hints: {
        start:      'Le sentier part des Grottes de Sare. Avance avec ◀ ▶, saute avec ▲.',
        bats:       'Une chauve-souris s\u2019envole près de la grotte, puis une autre : elles ne font pas mal, c\u2019est le réveil de la colonie.',
        karst:      'Un trou karstique se cache sous les fougères. En t\u2019approchant, tu vois la fissure : saute-la, n\u2019y mets pas le pied.',
        lapiaz:     'Des blocs de lapiaz (calcaire fissuré) barrent le sentier : saute par-dessus.',
        boars:      'Un sanglier s\u2019apprête à traverser : tu l\u2019entends, puis il charge. Arrête-toi et laisse-le passer, ou saute par-dessus.',
        scramble:   'Un court passage un peu plus raide, presque les mains sur le rocher : les marches accrochent, mais fatiguent.',
        pebbles:    'Les vautours lâchent de petits cailloux : l\u2019ombre au sol et le cri t\u2019avertissent. Écarte-toi !',
        gap:        'Un vide ! Prends de l\u2019élan et saute par-dessus.',
        checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
        bottle:     'Une bouteille d\u2019eau ! Ramasse-la pour remplir la jauge.',
        tired:      'Chaque saut te fatigue : ta gourde se vide plus vite.',
        boulder:    'Un rocher bloque le chemin : saute par-dessus !'
      },
      hintsPad: {
        start:      'Le sentier part des Grottes de Sare. Avance avec le stick (ou la croix), saute avec A.',
        boulder:    'Un bloc de lapiaz bloque le chemin : saute par-dessus avec A !',
        karst:      'Trou sous les fougères : à l\u2019approche tu vois la fissure, saute-la avec A.',
        boars:      'Un sanglier va traverser : relâche le stick et laisse-le passer, ou saute par-dessus.',
        scramble:   'Passage un peu plus raide : avance, les marches accrochent mais fatiguent.',
        pebbles:    'Ombre au sol et cri : un caillou va tomber. Écarte-toi.'
      }
    }
  };


  var L9 = {
    id: 'orhy', number: 9, playable: true, world: 2,
    name: 'Pic d\u2019Orhy',
    massif: 'Pays basque, Soule / Navarre',
    place: 'Larrau (Pyrénées-Atlantiques) / frontière France–Espagne',
    route: 'Voie normale depuis le Port de Larrau',
    altitude: 2017,           // m — figure courante (tourisme64, topos). Altituderando cite aussi un maximum à 2013 m.
    altitudeStart: 1573,      // m — parking du Port de Larrau, avant le tunnel (tourisme64 : environs 1573–1577 m)
    difficulty: { label: 'Moyenne', stars: 3, of: 5, note: 'L\u2019office de tourisme (tourisme64) classe la voie normale « Moyenne » : sentier non balisé, passages de crête exposés. À n\u2019entreprendre que par beau temps, sans vent fort, sans neige ni verglas.' },
    hike: { distanceKm: 2.6, ascentM: 433, duration: '≈ 2 h', note: 'Fiche officielle tourisme64 : 2,6 km A/R, 433 m D+, environ 2 h, IGN 1346 ET. Une autre description de la même voie (Garazi Baigorry Rando) donne 4,92 km et +425 m en 2 h 10 : les deux mesures décrivent le même itinéraire, avec des méthodes de calcul différentes. On ne retient pas un seul kilométrage comme vérité unique.' },
    firstAscent: {
      value: '1786 ou 1787, selon les sources',
      note: 'Korpa (« Ascension du pic d\u2019Orhy ») attribue la première à Reinhart Junker, capitaine géodésien, en 1787 ; la chronologie des premières du même site indique 1786. Les deux dates sont donc rapportées, sans en choisir une seule.'
    },
    visitors: {
      value: 'Non documentée',
      note: 'Aucun comptage annuel des passages au sommet n\u2019a été trouvé. Les topos notent seulement qu\u2019à force de passages le sentier est devenu un sillon : c\u2019est un signe de fréquentation, pas un chiffre.'
    },
    story: [
      'L\u2019Orhy (Orhi, Ori) est souvent présenté comme le premier sommet de plus de 2 000 m en venant de l\u2019Atlantique. L\u2019altitude 2 017 m est la figure la plus courante (tourisme64, topos) ; Altituderando mentionne aussi 2 013 m. On retient 2 017 m en citant cette réserve.',
      'La voie normale part du parking du Port de Larrau, avant le tunnel, vers 1 573–1 577 m, sur la D26 depuis Larrau. Juste au-dessus se trouve la borne frontière 237. Le sentier, non balisé mais bien tracé, s\u2019élève un peu à gauche de la crête descendante, rejoint un escarpement rocheux que l\u2019on évite à gauche (un câble équipe le court passage rocheux, d\u2019après Altituderando), puis traverse longtemps le flanc sud, côté espagnol, avant de gagner l\u2019épaule de la crête sud-ouest et la crête principale jusqu\u2019au sommet. Le retour se fait par le même chemin. Des voies plus longues existent depuis Iraty / Zazpigain : ce n\u2019est pas la voie normale.',
      'Le sommet est une crête relativement plane. On y trouve un pilier géodésique et un buzon en forme de petite maison, surmonté d\u2019un oiseau, avec l\u2019inscription « Oriko Txoria, oriko tira » (l\u2019oiseau d\u2019Orhy se plaît à Orhy). On peut poursuivre jusqu\u2019à l\u2019extrémité sud de la crête. Par temps clair, le panorama ouvre à l\u2019ouest vers l\u2019Atlantique, à l\u2019est vers le pic d\u2019Anie et les Pyrénées, au sud-ouest vers la forêt d\u2019Iraty, et sur la Soule et la Navarre.',
      'La montagne est particulièrement exposée au vent : l\u2019office de tourisme déconseille la course par vent fort, et les topos parlent d\u2019un vent d\u2019océan parfois violent, dangereux en hiver et au printemps. La longue traversée herbeuse du flanc sud, en dévers, glisse quand l\u2019herbe est mouillée. Le mot « pente fuyante » n\u2019apparaît pas dans les sources consultées sur l\u2019Orhy : on décrit donc cette traversée telle que les topos la donnent, sans lui prêter un nom qu\u2019ils n\u2019emploient pas.',
      'Zone pastorale : on y croise des brebis (manex). L\u2019office de tourisme signale des vautours fauves au-dessus du pic. Les pottoks, documentés sur l\u2019Ursuya et le Labourd, ne sont pas cités spécifiquement sur cette voie : on ne les place pas ici.'
    ],
    recap: 'Premier 2 000 m basque en venant de l\u2019océan (2 017 m, parfois 2 013 m selon les sources). Voie normale depuis le Port de Larrau (2,6 km A/R, +433 m, ≈ 2 h d\u2019après tourisme64) : borne 237, traversée du flanc sud, court passage rocheux câblé, crête exposée au vent, pilier géodésique et buzon « Oriko Txoria ».',
    mission: 'Voie normale depuis le Port de Larrau. La <b>traversée herbeuse en dévers</b> du flanc sud glisse vraiment : t\u2019arrêter ou foncer te fait reculer. Un <b>court passage rocheux câblé</b> demande prises, sauts et rythme. Sur la <b>crête aérienne</b>, le <b>vent</b> pousse (avertissement ~1 s) : attends à l\u2019abri avant un vide. Des <b>bancs de brume</b> réduisent la vue. Les <b>brebis</b> traversent (triangle ~1,8 s). Les <b>vautours fauves</b> n\u2019ont pas de triangle : ombre, cri, cailloux à l\u2019aplomb de l\u2019oiseau. <b>4 bouteilles</b>, jauge plus sévère qu\u2019à l\u2019Atxuria.',
    carnet: [
      { id: 'borne237', name: 'Borne frontière 237', text: 'Juste au-dessus du parking du Port de Larrau se dresse la borne frontière 237, point de départ habituel de la voie normale. Elle marque la ligne France–Espagne, que le sentier longe ensuite sur le flanc sud.', src: 'tourisme64 / Altituderando / Garazi Baigorry Rando — voie normale du Port de Larrau', url: 'https://www.tourisme64.com/' },
      { id: 'cable', name: 'Câble du passage rocheux', text: 'Après la première partie de la crête, le sentier rencontre un petit escarpement rocheux évité par la gauche. Altituderando mentionne un câble sur ce court passage, utile surtout si le rocher est glissant : ce n\u2019est pas une via ferrata.', src: 'Altituderando — Pic d\u2019Orhy (2017 m) par le Port de Larrau ; Garazi Baigorry Rando', url: 'https://www.altituderando.com/' },
      { id: 'buzon', name: 'Buzon Oriko Txoria', text: 'Au sommet, à côté du pilier géodésique, un buzon en forme de petite maison porte un oiseau et l\u2019inscription « Oriko Txoria, oriko tira » : l\u2019oiseau d\u2019Orhy se plaît à Orhy.', src: 'Altituderando (album de la voie normale) ; Garazi Baigorry Rando — Orhy VN Port Larrau', url: 'https://www.altituderando.com/spip.php?id_rando=15205&page=album-photo' }
    ],
    sources: [
      { label: 'tourisme64 — Pic d\u2019Orhy par le Port de Larrau (2,6 km A/R, 433 m D+, ≈ 2 h, Moyenne ; départ ~1573–1577 m ; non balisé ; crête exposée ; déconseillé par vent fort, neige ou verglas ; IGN 1346 ET ; vautours fauves, zone pastorale)', url: 'https://www.tourisme64.com/' },
      { label: 'Altituderando — Pic d\u2019Orhy (2017 m, parfois 2013 m) par le Port de Larrau (voie normale) : borne 237, escarpement et câble, traversée du flanc sud, crête, pilier et buzon', url: 'https://www.altituderando.com/spip.php?id_rando=15205&page=album-photo' },
      { label: 'Garazi Baigorry Rando — Orhy VN Port Larrau (4,92 km, +425 m, 2 h 10 ; pilier ; buzon « Oriko Txoria, oriko tira » ; câble sur le passage rocheux)', url: 'http://gb-rando.blogspot.com/search/label/Orhy%20VN%20Port%20Larrau' },
      { label: 'Korpa — Ascension du pic d\u2019Orhy (première attribuée à Reinhart Junker, 1787) et chronologie des premières (1786) : les deux dates sont conservées', url: 'https://korpa.fr/' },
      { label: 'randozone.com — photos depuis le sommet (pic d\u2019Anie, Trois Rois) et du Port de Larrau (borne 237)', url: 'https://www.randozone.com/fiche/708/pic-d-orhy/photos/' },
      { label: 'jpdugene.com — Pic d\u2019Orhy depuis Port de Larrau (départ entre le panneau Navarra et la borne 237 ; sommet parfois brumeux ; panorama : Anie, Table des Trois Rois ; vue vers Iraty)', url: 'http://www.jpdugene.com/fiches_rando/orhy_port_larrau.htm' },
      { label: 'Wikimedia Commons — File:Pic d\u2019Orhy (vue nord).jpg (Jörg Braukmann, 29 août 2022, CC BY-SA 4.0) ; série « 2016 uztaila orhi » (Joxemai, 1er août 2016, CC BY-SA 4.0), vues de crête et mer de nuages', url: 'https://commons.wikimedia.org/wiki/File:Pic_d%27Orhy_(vue_nord).jpg' }
    ],
    play: {
      theme: 'orhy', stairsMat: 'stone', windCycle: 8.0, windWarn: 1.0, windGust: 2.2,
      windPush: true, windOverGaps: true, noFogPoles: true,
      water: { max: 100, start: 100, drainPerSec: 1.68, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.6 },
      stars: { timeFast: 120, timeOk: 180, waterGood: 20, waterOk: 5 },
      lives: 3, ext: 900, crater: { kind: 'plain' },
      winZoomPort: 0.5, winZoomLand: 0.64, winLook: 0.80,
      pieces: [
        { t: 'flat',   len: 200, hint: 'start' },
        { t: 'slope',  len: 280, rise: 32, hint: 'water', find: [{ id: 'borne237', f: 0.35 }] },
        { t: 'flat',   len: 200, sheep: { f: 0.5, n: 1, trig: 230, spacing: 2.6 }, hint: 'sheep' },
        { t: 'slope',  len: 320, rise: 48, zone: 'wet slip', look: 'flank', hint: 'wet', bottle: 0.4 },
        { t: 'slope',  len: 260, rise: 40, zone: 'wet slip', look: 'flank', boulders: [0.35, 0.78] },
        { t: 'flat',   len: 180, sheep: { f: 0.48, n: 2, trig: 220, period: 11, spacing: 2.7 }, hint: 'sheep' },
        { t: 'slope',  len: 280, rise: 42, zone: 'wet slip', look: 'flank', bottle: 0.55 },
        { t: 'flat',   len: 110, cp: true, hint: 'checkpoint' },
        { t: 'stairs', len: 72, rise: 22, hint: 'scramble', cable: true },
        { t: 'gap',    len: 20, hint: 'gap' },
        { t: 'stairs', len: 92, rise: 28, cable: true, find: [{ id: 'cable', f: 0.5 }] },
        { t: 'gap',    len: 18 },
        { t: 'stairs', len: 64, rise: 18, cable: true },
        { t: 'slope',  len: 260, rise: 30, raptors: { kind: 'vautour', pebbles: [4.4, 6.4] }, hint: 'pebbles', bottle: 0.42 },
        { t: 'flat',   len: 110, cp: true },
        { t: 'slope',  len: 240, rise: 28, zone: 'wind', look: 'ridge', hint: 'storm' },
        { t: 'gap',    len: 22, look: 'ridge' },
        { t: 'slope',  len: 180, rise: 22, zone: 'wind', look: 'ridge' },
        { t: 'flat',   len: 84, look: 'ridge', boulders: [0.5] },
        { t: 'slope',  len: 240, rise: 26, zone: 'wind fog', fog: [0.32, 0.52], look: 'ridge', hint: 'fog', raptors: { kind: 'vautour', pebbles: [4.2, 6.2] }, bottle: 'air:0.5' },
        { t: 'gap',    len: 20, zone: 'fog', fog: 0.5, look: 'ridge' },
        { t: 'slope',  len: 200, rise: 22, zone: 'wind', look: 'ridge', find: [{ id: 'buzon', f: 0.45 }] },
        { t: 'flat',   len: 76, look: 'ridge' },
        { t: 'slope',  len: 220, rise: 20, zone: 'wind fog', fog: 0.45, look: 'ridge', raptors: { kind: 'vautour', pebbles: [3.8, 5.8] }, boulders: [0.4] },
        { t: 'flat',   len: 200, summit: true, look: 'ridge' }
      ],
      finds: {
        borne237: { name: 'Borne frontière 237', icon: 'borne237' },
        cable:    { name: 'Câble du passage rocheux', icon: 'cable' },
        buzon:    { name: 'Buzon Oriko Txoria', icon: 'buzon' }
      },
      hints: {
        start:      'Avance avec ◀ ▶ et saute avec ▲ (clavier : flèches + Espace). Voie normale du Pic d\u2019Orhy, depuis le Port de Larrau.',
        water:      'Ta jauge d\u2019eau baisse avec le temps. Trouve des bouteilles en chemin !',
        wet:        'Traversée herbeuse en dévers sur le flanc sud : mouillée, l\u2019herbe glisse. Si tu t\u2019arrêtes ou si tu fonces, la pente te ramène vers le bas. Avance d\u2019un pas régulier.',
        sheep:      'Une brebis traverse le sentier : arrête-toi et laisse-la passer, ou saute par-dessus. La bousculer coûte un cœur.',
        scramble:   'Court passage rocheux câblé : enchaîne les prises, saute les petits vides, rythme tes sauts. Le câble n\u2019est pas une via ferrata.',
        pebbles:    'Un vautour fauve lâche un petit caillou : l\u2019ombre au sol et le cri t\u2019avertissent (pas le triangle des éboulis). Écarte-toi !',
        storm:      'Crête aérienne, exposée au vent. « Vent… » puis « Rafale ! » s\u2019affichent (~1 s d\u2019avance). Attends à l\u2019abri (replat, rocher) avant de sauter un vide.',
        fog:        'Brume sur la crête : on voit moins loin. Le sentier n\u2019est pas balisé ; reste sur la trace.',
        checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
        gap:        'Un vide ! Prends de l\u2019élan et saute par-dessus.',
        boulder:    'Un rocher bloque le chemin : saute par-dessus !'
      },
      hintsPad: {
        start:      'Avance avec le stick gauche (ou la croix) et saute avec A. Voie normale du Pic d\u2019Orhy, depuis le Port de Larrau.',
        wet:        'Dévers glissant : si tu t\u2019arrêtes ou tu fonces, la pente te ramène. Avance régulier.',
        sheep:      'Une brebis traverse : relâche le stick et laisse-la passer, ou saute par-dessus.',
        scramble:   'Passage rocheux câblé : enchaîne les prises et saute les petits vides avec A.',
        pebbles:    'Ombre au sol et cri : un caillou va tomber à l\u2019aplomb du vautour. Écarte-toi.',
        storm:      'Rafale sur la crête (~1 s d\u2019avance) : attends à l\u2019abri avant de sauter un vide.',
        fog:        'Brume sur la crête : on voit moins loin. Reste sur la trace.',
        boulder:    'Un rocher bloque le chemin : saute par-dessus avec A !'
      }
    }
  };

  var INFO = {
    7: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L7), text: 'La jauge d\u2019eau baisse en continu et chaque saut te fatigue. Nos sources ne signalent aucun point d\u2019eau aménagé sur l\u2019Ursuya : on emporte sa propre eau. Ramasse les 3 bouteilles.' }],
      obstacles: [
        { icon: '🐴', name: 'Pottoks qui traversent', real: 'Les pottoks sont de petits chevaux basques en liberté sur les pentes pâturées de l\u2019Ursuya (naturelandespaysbasque.com, tourisme64). Dans la vraie vie, on ne les bouscule pas : on s\u2019arrête, on referme les barrières, on tient les chiens en laisse. Ici, les toucher coûte un cœur.', src: [0, 2] },
        { icon: '🌿', name: 'Herbe mouillée', real: 'Les derniers deux cents mètres de dénivelé se font sur de l\u2019herbe rase et de la fougère, entre des dalles de gneiss. Mouillée (rosée, pluie), cette herbe glisse ; la descente y demande plus d\u2019attention que la montée.', src: [0] },
        { icon: '🦅', name: 'Cailloux lâchés par un rapace', real: 'Des rapaces fréquentent le ciel du Pays basque. Dans le jeu, une buse puis un faucon passent au-dessus de l\u2019Ursuya (un vautour fauve au-dessus de l\u2019Atxuria). Nos sources sur l\u2019Ursuya citent surtout les pottoks et les brebis manex, pas des chutes de pierres provoquées par les oiseaux. C\u2019est ici un obstacle de jeu, annoncé par une ombre au sol et un cri — pas par le triangle réservé aux éboulis.', src: [] },
        { icon: '⛈️', name: 'Orage sur le dôme', real: 'Le sommet est un dôme d\u2019herbe isolé, sans abri. Passé les premiers lacets, il n\u2019y a plus un arbre : le versant est entièrement ouvert. Par gros temps ou brume, l\u2019exposition et la perte de repères sont les vrais dangers de cette montagne.', src: [0] },
        { icon: '🟫', name: 'Rochers et petites ravines', real: 'Des dalles de gneiss affleurent dans la pente terminale ; le réseau de sentes pastorales se croise. Les petits vides du jeu illustrent ces irrégularités, sans prétendre reproduire un gouffre réel.', src: [0] }
      ],
      enjeux: [
        { t: 'Eau potable : les sources de l\u2019Ursuya alimentent une bonne partie du nord du Pays Basque. Les périmètres de captage grillagés ne se franchissent pas, même si un sentier semble y mener.', s: [0] },
        { t: 'Pastoralisme : pottoks et brebis manex pâturent en liberté. Chiens en laisse, barrières refermées, on ne traverse pas un troupeau par le milieu (rappels de l\u2019office de tourisme).', s: [0, 2] },
        { t: 'Écobuage : dans les Pyrénées-Atlantiques, l\u2019incinération des landes à fougère est autorisée du 15 octobre au 31 mars (prolongation possible jusqu\u2019au 30 avril). Une pente en cours de brûlage ne se traverse pas.', s: [0] },
        { t: 'Orientation : le balisage jaune s\u2019espace sur les parties herbeuses ; par brume, la carte au 1:25 000 devient nécessaire.', s: [0] },
        { t: 'Fréquentation du sommet : aucun comptage annuel n\u2019a été trouvé dans nos sources. On reste sur le sentier par respect des pelouses et des captages.', s: [] }
      ],
      items: { water: { where: 'Sur le sentier, l\u2019une un peu en hauteur (il faut sauter).', why: 'La voie directe depuis Celhay fait 6,89 km pour +394 m (≈ 3 h 05) et nos sources ne signalent aucun point d\u2019eau aménagé : on emporte son eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [0, 1] } }
    },
    8: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L8), text: 'La jauge d\u2019eau baisse en continu et chaque saut te fatigue. Ramasse les 4 bouteilles.' }],
      obstacles: [
        { icon: '🦇', name: 'Chauves-souris près de la grotte', real: 'Les Grottes de Sare (Lezea) accueillent treize espèces de chauves-souris, suivies par le CEN. Dans le jeu, elles s\u2019envolent au départ : c\u2019est une ambiance, elles ne font pas mal.', src: [4, 5] },
        { icon: '🕳️', name: 'Trous karstiques sous les fougères', real: 'Le calcaire de l\u2019Atxuria forme un lapiaz : fissures et trous parfois masqués par la végétation, avec un vrai risque de torsion si l\u2019on quitte le sentier. Dans le jeu, la fissure se devine à l\u2019approche — un télégraphe juste, pas un piège invisible.', src: [] },
        { icon: '🪨', name: 'Blocs de lapiaz et court passage raide', real: 'Après le sous-bois, le sentier rencontre des blocs calcaires et une montée parfois soutenue jusqu\u2019à la crête (tourisme64, Visorando). Le court passage « les mains sur le rocher » du jeu exagère un peu un dénivelé réel déjà senti, sans en faire une via ferrata.', src: [0, 1] },
        { icon: '🐗', name: 'Sangliers', real: 'Le sanglier fréquente les bois du Pays basque. Nos sources sur l\u2019itinéraire de l\u2019Atxuria (tourisme64, Visorando, topos) ne décrivent pas de rencontre précise sur ce sentier. C\u2019est ici un obstacle de jeu, inspiré de la faune locale : on s\u2019arrête et on le laisse passer.', src: [] },
        { icon: '🦅', name: 'Vautours et petits cailloux', real: 'Les falaises brun-rouge du massif servent de refuge et de nichoir aux colonies de vautours fauves (tourisme64, Visorando). Qu\u2019ils lâchent des cailloux est un obstacle de jeu, annoncé par une ombre et un cri, pas par le triangle des éboulis. Dans la vraie vie, on observe les colonies à distance, sans les déranger.', src: [0, 1] }
      ],
      enjeux: [
        { t: 'Colonies de vautours fauves : les vires des falaises sont des nichoirs. On reste sur le sentier, on ne grimpe pas dans les parois, on observe de loin.', s: [0, 1] },
        { t: 'Chauves-souris des Grottes de Sare : treize espèces, suivi par le CEN ; zones exclues des visites et éclairage ciblé pour limiter le dérangement. Près de 100 000 visiteurs par an descendent dans les grottes (pas au sommet).', s: [4, 5] },
        { t: 'Karst et sentier : le lapiaz cache des trous sous les fougères. Rester sur le balisage limite le risque de torsion et protège un sol fragile.', s: [] },
        { t: 'Paysage pastoral et sous-bois de hêtres : refermer les barrières, tenir les chiens, ne pas couper à travers les pelouses ni les enclos (Loretxoa).', s: [0] },
        { t: 'Fréquentation du sommet : aucun comptage trouvé. Le chiffre de 100 000 visites concerne les grottes, pas l\u2019ascension.', s: [4] }
      ],
      items: { water: { where: 'Sur la montée, certaines en hauteur (il faut sauter).', why: 'La boucle officielle fait 7,2 km pour +620 m (≈ 3 h). On emporte son eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [0] } }
    },
    9: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(L9), text: 'La jauge d\u2019eau baisse en continu et chaque saut te fatigue. Ramasse les 4 bouteilles. La voie normale est courte (2,6 km A/R d\u2019après tourisme64) mais exposée : on emporte son eau.' }],
      obstacles: [
        { icon: '🌿', name: 'Traversée herbeuse en dévers', real: 'Après l\u2019escarpement, le sentier traverse longtemps le flanc sud, côté espagnol, sur de l\u2019herbe en pente. Mouillée, cette herbe glisse. Dans le jeu, s\u2019arrêter ou foncer te fait reculer sur la pente. Le mot « pente fuyante » n\u2019a pas été trouvé dans les sources consultées sur l\u2019Orhy : on décrit la traversée telle que les topos la donnent, sans lui prêter un nom qu\u2019ils n\u2019emploient pas.', src: [1, 2] },
        { icon: '🪨', name: 'Passage rocheux et câble', real: 'Un petit escarpement rocheux, évité par la gauche, est équipé d\u2019un câble selon Altituderando et Garazi Baigorry Rando, surtout utile si le rocher est glissant. Dans le jeu, un court passage en marches, entrecoupé de petits vides à sauter, le figure, sans en faire une via ferrata.', src: [1, 2] },
        { icon: '💨', name: 'Rafales sur la crête', real: 'L\u2019office de tourisme déconseille la course par vent fort : la crête est particulièrement exposée. Les topos parlent d\u2019un vent d\u2019océan parfois violent. Dans le jeu, des rafales poussent vraiment le randonneur (avertissement d\u2019environ 1 s). On peut attendre à l\u2019abri d\u2019un replat ou d\u2019un rocher.', src: [0] },
        { icon: '🌫️', name: 'Brume sur la crête', real: 'Le sentier n\u2019est pas balisé : les topos recommandent de rester sur la trace pour ne pas se tromper de versant par brume. Un récit de la voie normale (jpdugene.com) décrit aussi un sommet brumeux, qui limite le panorama. Dans le jeu, des bancs de brume réduisent la visibilité sur la crête, sans balises orange (le sentier réel n\u2019est pas balisé).', src: [0, 6] },
        { icon: '🐑', name: 'Brebis qui traversent', real: 'Le secteur est une zone pastorale (tourisme64). On laisse passer les brebis ; les toucher coûte un cœur. Un triangle d\u2019environ 1,8 s annonce leur arrivée au bord de l\u2019écran.', src: [0] },
        { icon: '🦅', name: 'Vautours fauves et petits cailloux', real: 'L\u2019office de tourisme signale des vautours fauves au-dessus du pic. Qu\u2019ils lâchent des cailloux est un obstacle de jeu, annoncé seulement par une ombre et un cri (pas le triangle des éboulis). Les pierres tombent à l\u2019aplomb de l\u2019oiseau. Dans la vraie vie, on observe les rapaces à distance, sans les déranger.', src: [0] }
      ],
      enjeux: [
        { t: 'Vent et météo : la course n\u2019est conseillée que par beau temps, sans vent fort, sans neige ni verglas (tourisme64). La crête est aérienne et sans abri.', s: [0] },
        { t: 'Sentier non balisé, mais bien tracé, parfois en sillon à force de passages. Rester sur la trace protège les pelouses et évite de se tromper de versant par brume.', s: [0, 1] },
        { t: 'Pastoralisme : zone de pâturage. Refermer les barrières, chiens en laisse, ne pas couper à travers un troupeau.', s: [0] },
        { t: 'Vautours fauves : les observer de loin, sans les déranger. Le jeu n\u2019invente pas de colonie sur un lieu précis de cette voie, seulement leur présence au-dessus du pic, citée par l\u2019office de tourisme.', s: [0] },
        { t: 'Fréquentation du sommet : aucun comptage annuel trouvé. Le sentier devenu sillon est un signe, pas un chiffre.', s: [1] }
      ],
      items: { water: { where: 'Sur la montée, l\u2019une un peu en hauteur (il faut sauter).', why: 'La voie officielle est courte (2,6 km A/R, +433 m) mais il n\u2019y a pas de point d\u2019eau aménagé cité sur l\u2019itinéraire : on emporte son eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [0] } }
    }

  };

  var CARNET = {
    borne:    { icon: '🪨', where: 'Ursuya — caché en hauteur.', why: 'La borne IGN de 1949, au sommet, donne 678,58 m : c\u2019est le nivellement officiel à retenir.' },
    stele:    { icon: '🪦', where: 'Ursuya — caché en hauteur.', why: 'La stèle des Évadés (1998), au départ du sentier, rappelle les passeurs de la Seconde Guerre mondiale.' },
    source:   { icon: '💧', where: 'Ursuya — caché en hauteur.', why: 'Les sources du gneiss fracturé alimentent en eau potable une bonne partie du nord du Pays Basque.' },
    calcaire: { icon: '🪨', where: 'Atxuria — caché en hauteur.', why: 'Aitz-xuria, « roche blanche », et Peña Plata, « roche d\u2019argent » : le lapiaz clair de la crête.' },
    plaque:   { icon: '🪧', where: 'Atxuria — caché en hauteur.', why: 'Une plaque au sommet porte Peña Plata 756 m, à côté du cairn et du vértice (757,59 m).' },
    chauve:   { icon: '🦇', where: 'Atxuria — caché en hauteur.', why: 'Les Grottes de Sare, au pied du sommet, abritent treize espèces de chauves-souris.' },
    borne237: { icon: '🪨', where: 'Orhy — caché en hauteur.', why: 'La borne frontière 237, juste au-dessus du parking du Port de Larrau, marque le départ de la voie normale.' },
    cable:    { icon: '⛓️', where: 'Orhy — caché en hauteur.', why: 'Un câble équipe le court passage rocheux de la voie normale, utile si le rocher est glissant.' },
    buzon:    { icon: '📬', where: 'Orhy — caché en hauteur.', why: 'Le buzon sommittal, en forme de petite maison avec un oiseau, porte « Oriko Txoria, oriko tira ».' }
  };

  /* Fins de niveau : cadrage sur la bannière monde 2 (coordonnées dans l'espace ref, ajustées avec les pastilles). */
  /* v0.7.5 : toiles peintes du sommet (pas le recadrage de la carte d'accueil,
     pas les peintres vectoriels trop plats de v0.7.4). Portrait et paysage séparés.
     Pas de texte dans l'image ; le randonneur est composite ; overlays légers. */
  var E7 = {
    hideFlag: true, noRing: true, fullBleed: true, noExt: true,
    fx: { clouds: false, vultures: 2, shimmer: true },
    port: {
      banner: 'ending-ursuya-port', ref: [720, 1280],
      flag: { x: 332, y: 842 }, focus: { x: 360, y: 820 },
      hikerFit: { y0: 759, y1: 838, ratio: 1.4 },  /* borne IGN ~1,2 m ; randonneuse = 1,4× */
      anchor: [0.50, 0.65], startShift: -55,
      sea: [{ x: 0, y: 505, w: 280, h: 24 }, { x: 555, y: 505, w: 165, h: 24 }],
      cloudY: [60, 300],
      vultureY: [340, 430]
    },
    land: {
      banner: 'ending-ursuya-land', ref: [1280, 720],
      flag: { x: 600, y: 536 }, focus: { x: 640, y: 540 },
      hikerFit: { y0: 464, y1: 532, ratio: 1.4 },
      anchor: [0.50, 0.75], startShift: -80,
      sea: [{ x: 0, y: 248, w: 480, h: 26 }, { x: 900, y: 248, w: 380, h: 26 }],
      cloudY: [20, 180],
      vultureY: [90, 170]
    }
  };
  var E8 = {
    hideFlag: true, noRing: true, fullBleed: true, noExt: true,
    fx: { clouds: false, vultures: 2, shimmer: true },
    port: {
      banner: 'ending-atxuria-port', ref: [720, 1280],
      flag: { x: 410, y: 898 }, focus: { x: 400, y: 820 },
      hikerFit: { y0: 664, y1: 804, ratio: 1.0 },  /* hauteur d'un cairn */
      anchor: [0.50, 0.64], startShift: -40,
      sea: [{ x: 0, y: 432, w: 300, h: 22 }],
      cloudY: [40, 280],
      vultureY: [300, 400]
    },
    land: {
      banner: 'ending-atxuria-land', ref: [1280, 720],
      flag: { x: 748, y: 538 }, focus: { x: 720, y: 500 },
      hikerFit: { y0: 346, y1: 458, ratio: 1.0 },
      anchor: [0.50, 0.70], startShift: -70,
      sea: [{ x: 0, y: 200, w: 520, h: 28 }],
      cloudY: [16, 160],
      vultureY: [80, 160]
    }
  };

  function plug(lv, idx, ending) {
    if (MAPN[idx - 6]) { lv.node = { x: MAPN[idx - 6][0], y: MAPN[idx - 6][1] }; }
    else if (LV[idx] && LV[idx].node) { lv.node = LV[idx].node; }
    lv.info = INFO[lv.number];
    lv.ending = ending;
    LV[idx] = lv;
  }

  var E9 = {
    hideFlag: true, noRing: true, fullBleed: true, noExt: true,
    fx: { clouds: false, vultures: 2, shimmer: false },
    port: {
      banner: 'ending-orhy-port', ref: [720, 1280],
      flag: { x: 430, y: 1024 }, focus: { x: 400, y: 880 },
      hikerFit: { y0: 900, y1: 1024, ratio: 1.08 },
      anchor: [0.58, 0.80], startShift: -24,
      cloudY: [40, 280],
      vultureY: [300, 420]
    },
    land: {
      banner: 'ending-orhy-land', ref: [1280, 720],
      flag: { x: 700, y: 555 }, focus: { x: 720, y: 500 },
      hikerFit: { y0: 430, y1: 560, ratio: 1.15 },
      anchor: [0.68, 0.78], startShift: -70,
      cloudY: [16, 160],
      vultureY: [80, 170]
    }
  };
  plug(L7, 6, E7);
  plug(L8, 7, E8);
  plug(L9, 8, E9);

  var base = D.INFO || {}; for (var n in INFO) { base[n] = INFO[n]; } D.INFO = base;
  var cb = D.CARNET_INFO || {}; for (var c in CARNET) { cb[c] = CARNET[c]; } D.CARNET_INFO = cb;
})();
