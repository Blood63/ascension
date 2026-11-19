/* =====================================================================
   ASCENSION — données du jeu (niveaux, fiches de montagnes, carte)
   Module de données pur : aucune logique de jeu ici.
   Chargé avant les autres scripts ; expose window.AscensionData.
   Portable : pas de dépendance réseau, chemins relatifs uniquement.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Carte du monde (v0.2.6) : UNE bannière pixel-art (assets/map/<banner>.webp) + 6 pastilles ----------
     Pour changer la bannière : remplacer le fichier (ou changer `banner`), puis ajuster ces coordonnées. Rien n'est codé en dur ailleurs.
       banner : nom du fichier dans assets/map (sans .webp). Toute résolution : l'image est ramenée à l'espace `ref`.
       ref    : [largeur, hauteur] de l'espace de coordonnées utilisé ci-dessous (ratio identique à l'image).
       nodes  : position de la pastille de chaque niveau, DANS L'ORDRE de LEVELS, en pixels de l'espace `ref` (0,0 = coin haut-gauche).
       trail  : points intermédiaires de la route du randonneur entre la pastille i et la pastille i+1 (courbe lissée passant par tous les points ; rien n'est dessiné depuis v0.2.9, le chemin visible est peint dans la bannière).
       view   : cadrage. fill = part de la hauteur d'écran occupée par l'image (portrait / paysage) ; bottom = position du bas de l'image (fraction de la hauteur d'écran).
       sky / forest : couleurs de la marge de ciel (au-dessus) et de forêt (au-dessous) quand l'image ne remplit pas l'écran. */
  var MAP = {
    banner: 'monde1',
    ref: [1056, 448],
    nodes: [[190, 280], [318, 262], [297, 150], [690, 262], [627, 134], [806, 186]],
    trail: [
      [[245, 268]],
      [[322, 205], [300, 172]],
      [[320, 205], [370, 228], [440, 243], [520, 256], [600, 262]],
      [[648, 252], [600, 228], [588, 196], [602, 160]],
      [[652, 168], [695, 192], [745, 190]]
    ],
    view: { fill: { port: 0.58, land: 0.76 }, bottom: { port: 0.80, land: 0.84 } },
    sky: '#171b48', forest: '#06180f'
  };

  /* ---------- Niveaux ----------
     Niveau 1 : fiche + paramètres de jeu complets.
     Niveau 2 : Pariou (v0.2.7). Niveaux 3-6 : emplacements réservés (nom/altitude/itinéraire repris de l'appli suivi-montagne,
     aucune autre donnée n'est affichée tant que la fiche n'a pas été recherchée et sourcée). */
  var LEVELS = [
    {
      id: 'puy-de-la-vache',
      number: 1,
      playable: true,
      name: 'Puy de la Vache',
      massif: 'Chaîne des Puys, Auvergne',
      place: 'Saint-Genès-Champanelle (Puy-de-Dôme)',
      altitude: 1167,          // m — Wikipédia / IGN (cartes.gouv.fr)
      altitudeStart: 990,      // m — parking de départ (appli suivi-montagne, relevé du parcours)
      difficulty: { label: 'Facile', stars: 1, of: 5, note: 'Court, avec escaliers et pouzzolane (scories volcaniques).' },
      hike: { distanceKm: 4, ascentM: 285, duration: '≈ 2 h', note: 'Boucle des puys de Lassolas et de la Vache (données du Département du Puy-de-Dôme).' },
      firstAscent: {
        value: 'Non documentée',
        note: 'Aucune date de première ascension n\u2019apparaît dans les sources consultées ; le volcan existe depuis ≈ 8 400 ans.'
      },
      visitors: {
        value: '≈ 100 000 passages par an',
        year: 2024,
        isEstimate: true,
        note: 'Comptage sur le sentier menant au sommet en 2024 (Parc des Volcans d\u2019Auvergne). Chiffre annuel, pas un total depuis l\u2019origine. Le Parc/Département citent « plus de 100 000 visiteurs » en 2025.'
      },
      story: [
        'Le puy de la Vache et son jumeau, le puy de Lassolas, sont les plus jeunes volcans de la Chaîne des Puys : ils sont nés d\u2019une même fissure il y a environ 8 400 ans (8 400 à 8 650 ans selon les sources).',
        'Leur éruption était de type strombolien : de la lave fluide projetée en fontaine retombe en scories rouges et noires, qui construisent un cône. Puis une grande coulée de lave a percé le flanc du cône et l\u2019a emporté « comme un tapis roulant » : le cratère est resté ouvert en fer à cheval, ici vers le sud. On dit qu\u2019il est égueulé.',
        'Au pied du volcan, une ancienne carrière de pouzzolane (scories volcaniques, plus exploitée depuis 1980 d\u2019après un site de passionné cité plus bas) laisse voir l\u2019intérieur du cône : du rouge près de l\u2019ancienne bouche, car les scories y ont été portées à plus de 600 °C et le fer s\u2019est oxydé, et du noir plus loin. De grosses bombes volcaniques ont été laissées sur place. Une aire de découverte s\u2019appelle d\u2019ailleurs « Une carrière en rouge et noir ».',
        'Cette coulée, la cheire d\u2019Aydat, s\u2019est étirée sur une quinzaine de kilomètres. Elle a barré la vallée de la Veyre et créé deux lacs de barrage : le lac d\u2019Aydat et le lac de la Cassière.',
        'La Chaîne des Puys – faille de Limagne est inscrite au patrimoine mondial de l\u2019UNESCO depuis 2018. Très fréquenté (3e site de la Chaîne après le puy de Dôme et le Pariou), le puy de la Vache est en travaux de restauration : dans la vraie vie, la montée est interdite depuis mai 2026, pour environ deux ans. Raison de plus pour le gravir ici !'
      ],
      recap: 'Volcan égueulé vieux de ≈ 8 400 ans, jumeau de Lassolas, avec sa carrière de scories rouges et noires au pied : sa coulée de lave, la cheire d\u2019Aydat (≈ 15 km), a créé les lacs d\u2019Aydat et de la Cassière.',
      carnet: [
        { id: 'bomb', name: 'Bombe volcanique', text: 'Il y a environ 8 600 ans, l\u2019éruption de la Vache et de Lassolas a été la plus récente et l\u2019une des plus violentes de la Chaîne des Puys : des téphras (cendres et scories) sont retombés sur une très large zone autour des deux cônes.', src: 'Jordan et al., 2016, Journal of Volcanology and Geothermal Research', url: 'https://doi.org/10.1016/j.jvolgeores.2015.12.006' },
        { id: 'crystal', name: 'Cristal de la Vache', text: 'Dans les scories du puy de la Vache, on peut trouver de rares phénocristaux, c\u2019est-à-dire de grands cristaux contenus dans la roche volcanique. Il est possible d\u2019en trouver sur ce site.', src: 'Wikipédia — Puy de la Vache', url: 'https://fr.wikipedia.org/wiki/Puy_de_la_Vache' },
        { id: 'raft', name: 'Radeau de scories', text: 'La coulée de lave a emporté des morceaux du cône comme des radeaux. L\u2019un d\u2019eux, resté en dehors du chenal principal, est visible à environ 2 km en aval des cônes. Cette étude estime la coulée à 22 km de long (d\u2019autres sources parlent d\u2019environ 15 km).', src: 'Jordan et al., 2016, Journal of Volcanology and Geothermal Research', url: 'https://doi.org/10.1016/j.jvolgeores.2015.12.006' }
      ],
      sources: [
        { label: 'Wikipédia — Puy de la Vache (altitude 1 167 m, âge ≈ 8 400 ans, cheire d\u2019Aydat, lacs)', url: 'https://fr.wikipedia.org/wiki/Puy_de_la_Vache' },
        { label: 'Jordan et al. 2016 — éruption de la Vache et Lassolas (cônes de 187 m et 200 m de haut, ouverts vers le sud, coulée de 22 km)', url: 'https://doi.org/10.1016/j.jvolgeores.2015.12.006' },
        { label: 'Parc des Volcans d\u2019Auvergne — infos puys et travaux (100 000 passages en 2024, 3e site, fermeture)', url: 'https://www.decouvrir.parcdesvolcans.fr/chaine-des-puys-faille-de-limagne/infos-puys-et-travaux' },
        { label: 'Département du Puy-de-Dôme — communiqué du 17/04/2026 (≈ 8 400 ans, cratère égueulé, travaux de 2 ans)', url: 'https://www.puy-de-dome.fr/fileadmin/user_upload/CP_Travaux_La_Vache_et_Lassolas_-_compresse.pdf' },
        { label: 'Académie de Limoges (SVT) — Puys de la Vache et Lassolas (formation de l\u2019égueulement, coulées, lac d\u2019Aydat)', url: 'https://pedagogie.ac-limoges.fr/svt/accueil/sortie_volcans_web/co/04_puys_de_la_vache_et_lassolas.html' },
        { label: 'ICI (France Bleu) — Les puys jumeaux de la Vache et Lassolas (éruption strombolienne, lacs d\u2019Aydat et de la Cassière)', url: 'https://www.ici.fr/emissions/les-volcans-d-auvergne/les-puys-jumeaux-de-la-vache-et-lassolas-3619223' },
        { label: 'Pleinchamp — sentiers repensés (plus de 100 000 visiteurs en 2025, chantier de 2 ans)', url: 'https://www.pleinchamp.com/actualite/le-puy-de-la-vache-et-lassolas-des-sentiers-repenses' },
        { label: 'UNESCO — Chaîne des Puys, faille de Limagne (inscription 2018)', url: 'https://whc.unesco.org/en/list/1434' },
        { label: 'Département du Puy-de-Dôme — Guide rando n°7, circuit 5 (escalier vers la carrière, « Une carrière en rouge et noir », scories rouges au sommet, vues sur le lac d\u2019Aydat et le puy de Dôme)', url: 'https://www.puy-de-dome.fr/fileadmin/user_upload/randos-volcans-guide-n-7_compressed.pdf' },
        { label: 'Parc des Volcans — Fiche n°8 Puy de la Vache (ancienne exploitation de la pouzzolane au pied du site, cratère égueulé, vues sur le Sancy, le puy de Dôme, le lac d\u2019Aydat)', url: 'https://www.parcdesvolcans.fr/_files/ugd/df776b_119767c9b0ce429890876e6759ecc133.pdf' },
        { label: 'Cécile Deneuvillers — 2 cônes jumeaux (carrière rouge et noir, coulées de basalte, bombes, cratère ouvert vers le sud ; inexploitée depuis 1980 d\u2019après ce site)', url: 'http://cecile.deneuvillers.free.fr/Lassolas/Lassolas.htm' },
        { label: 'Guide Auvergne — boucle Lassolas/Vache : 4 km, 285 m D+, 2 h (données Département)', url: 'https://guide-auvergne.fr/randonnees-auvergne/les-puys-de-lassolas-et-de-la-vache-iti0560/' }
      ],

      /* ---- paramètres de jeu du niveau 1 (unités : pixels logiques, 1 px ≈ 0,25 m d'altitude) ----
         Terrain = suite de pièces posées bout à bout (x croissant) :
           flat   : plat            len
           slope  : pente régulière len, rise (m'ontée en px)
           stairs : escalier (marches en bois) len, rise
           gap    : vide / chute    len  (≤ 30 px, saut possible)
         Options d'une pièce : cp (point de contrôle au début), bottle (fraction 0..1, 'air' = flottante),
         rocks (zone de pierres qui dévalent la pente : cadence min/max en s), boulders (fractions : rochers posés à enjamber),
         find (objets cachés du Carnet), hint (id de conseil), summit. */
      play: {
        water: { max: 100, start: 100, drainPerSec: 1.5, bottleGain: 60, thirstDamageEvery: 5, jumpCost: 3.5 },
        stars: { timeFast: 70, timeOk: 105, waterGood: 30, waterOk: 10 },
        lives: 3,
        pieces: [
          { t: 'flat',   len: 240, hint: 'start' },
          { t: 'slope',  len: 360, rise: 40, hint: 'water', boulders: [0.55] },
          { t: 'gap',    len: 20,  hint: 'gap' },
          { t: 'slope',  len: 300, rise: 50, hint: 'tired', boulders: [0.6] },
          { t: 'stairs', len: 280, rise: 64, hint: 'stairs', find: [{ id: 'bomb', f: 0.5 }] },
          { t: 'flat',   len: 120, cp: true, hint: 'checkpoint', boulders: [0.42] },
          { t: 'gap',    len: 26 },
          { t: 'slope',  len: 380, rise: 60, bottle: 0.55, hint: 'bottle', boulders: [0.4] },
          { t: 'gap',    len: 24 },
          { t: 'slope',  len: 240, rise: 30, rocks: [4.2, 5.6], hint: 'rocks', boulders: [0.65] },
          { t: 'stairs', len: 360, rise: 100, rocks: [3.8, 5.2], find: [{ id: 'crystal', f: 0.55 }] },
          { t: 'flat',   len: 110, cp: true },
          { t: 'gap',    len: 28 },
          { t: 'slope',  len: 400, rise: 70, rocks: [3.6, 5.0], boulders: [0.4] },
          { t: 'gap',    len: 26 },
          { t: 'stairs', len: 420, rise: 96, bottle: 'air:0.6', find: [{ id: 'raft', f: 0.3 }] },
          { t: 'flat',   len: 90,  cp: true },
          { t: 'slope',  len: 190, rise: 34, rocks: [3.6, 4.8], boulders: [0.5] },
          { t: 'gap',    len: 28 },
          { t: 'slope',  len: 190, rise: 34, boulders: [0.5] },
          { t: 'stairs', len: 380, rise: 90, rocks: [3.4, 4.6] },
          { t: 'flat',   len: 190, summit: true }
        ],
        finds: {
          bomb:    { name: 'Bombe volcanique', icon: 'bomb' },
          crystal: { name: 'Cristal de la Vache', icon: 'crystal' },
          raft:    { name: 'Radeau de scories', icon: 'raft' }
        },
        hints: {
          start:      'Avance avec ◀ ▶ et saute avec ▲ (clavier : flèches + Espace).',
          water:      'Ta jauge d\u2019eau baisse avec le temps. Trouve des bouteilles en chemin !',
          tired:      'Chaque saut te fatigue : ta gourde se vide plus vite. Ne saute que si c\u2019est utile !',
          boulder:    'Un rocher bloque le chemin : saute par-dessus !',
          gap:        'Un vide ! Prends de l\u2019élan et saute par-dessus.',
          stairs:     'Les marches accrochent bien (aucune glissade) mais fatiguent : ta jauge d\u2019eau baisse plus vite.',
          checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
          bottle:     'Une bouteille d\u2019eau ! Ramasse-la pour remplir la jauge.',
          rocks:      'Saute par-dessus les pierres qui dévalent la pente !'
        },
        hintsPad: {
          start:      'Avance avec le stick gauche (ou la croix) et saute avec A.',
          boulder:    'Un rocher bloque le chemin : saute par-dessus avec A !'
        }
      }
    }
  ];

  /* ---------- Niveau 2 : Puy de Pariou (v0.2.7) — nouveau danger : l'ÉROSION (sol qui s'effrite) ----------
     Tous les faits ci-dessous viennent de sources web consultées le 28/10/2026 (liste `sources`). Inconnu = « Non documentée ». */
  LEVELS.push({
    id: 'puy-de-pariou',
    number: 2,
    playable: true,
    name: 'Puy de Pariou',
    massif: 'Chaîne des Puys, Auvergne',
    place: 'Orcines (Puy-de-Dôme)',
    altitude: 1209,            // m — Wikipédia / IGN (cartes.gouv.fr)
    altitudeStart: 977,        // m — parking des Goules (fiche Visorando)
    difficulty: { label: 'Facile à moyenne', stars: 2, of: 5, note: 'Montée d\u2019≈ 45 min par un sentier boisé puis un escalier en bois ; Visorando classe la boucle « moyenne », Travel in Auvergne la dit faisable avec des enfants.' },
    hike: { distanceKm: 6.1, ascentM: 217, duration: '≈ 2 h 20', note: 'Boucle depuis le parking des Goules (fiche Visorando, mise à jour 2026).' },
    firstAscent: {
      value: 'Non documentée',
      note: 'Aucune date de première ascension n\u2019apparaît dans les sources consultées (Wikipédia, Parc des Volcans, Département, guides de randonnée).'
    },
    visitors: {
      value: 'plus de 140 000 visiteurs par an',
      year: 2023,
      isEstimate: false,
      note: 'Chiffre annuel (pas un total depuis l\u2019origine) donné par le Parc des Volcans d\u2019Auvergne en juin 2023 : 2e site de la Chaîne des Puys après le puy de Dôme. Jusqu\u2019à 3 200 visiteurs par jour en été (Tête en Ciel) ; 120 000 en 2021 (FFRandonnée) ; 80 000 en 2015 (Wikipédia, d\u2019après La Montagne).'
    },
    story: [
      'Le Pariou culmine à 1 209 m et s\u2019élève environ 250 m au-dessus du socle cristallin. Il est formé de deux cônes stromboliens superposés et d\u2019un anneau de tuf. Son cratère central, le plus récent, dessine un cercle presque parfait : ≈ 90 m de profondeur et 200 m de diamètre (95 m de profondeur selon un site touristique). On le compare souvent au Vésuve : un cône récent posé sur une somma, l\u2019ancien cratère encore visible à l\u2019ouest et au nord.',
      'Son âge : ≈ 9 500 ans d\u2019après une étude des téphras (retombées volcaniques) ; d\u2019autres sources donnent ≈ 8 000 à 8 500 ans. Une grande coulée de lave, datée au carbone 14 de 8 580 ± 350 ans, est descendue jusqu\u2019à Orcines, puis a fini par atteindre Nohanent et Chamalières, à environ 8 km.',
      'Son cône presque parfait a servi de décor aux publicités de l\u2019eau de Volvic : il en est l\u2019emblème, bien que le puy ne soit pas dans l\u2019aire de la source. Les propriétaires du site avaient même réclamé un droit sur son image : ils ont été déboutés le 23 janvier 2002.',
      'Mais ses sols volcaniques sont très fragiles. Avec plus de 140 000 visiteurs par an, l\u2019érosion a creusé le chemin jusqu\u2019à plus de 50 cm de profondeur par endroits. Depuis 2006, les aménagements se succèdent : escaliers en bois surélevés, marches en rondins (2010), fermeture d\u2019une partie du tour du cratère (2016), escaliers en caissons de bois remplis de pouzzolane (2019). Au printemps 2022, le sentier de 240 m qui descendait dans le cratère a même été effacé et regazonné.',
      'Aujourd\u2019hui on monte par un escalier en bois (555 marches en chêne sur le flanc est, d\u2019après Wikipédia) puis on suit la lèvre du cratère sur le sentier balisé : descendre au fond et faire le tour complet sont interdits pour laisser la pelouse d\u2019altitude repousser. Dans le jeu, le sol qui s\u2019effrite sous tes pas te rappelle ce combat contre l\u2019érosion.'
    ],
    recap: 'Cône strombolien d\u2019≈ 9 500 ans (8 000 à 9 500 selon les sources) au cratère presque parfaitement rond (≈ 90 m de profondeur) : plus de 140 000 visiteurs par an usent ses sols fragiles, d\u2019où escaliers en bois, jalonnement et effacement du sentier qui descendait dans le cratère (2022).',
    mission: 'Grimpe jusqu\u2019au sommet sans tomber. <b>Le sol qui s\u2019effrite</b> se fissure, tremble puis s\u2019effondre quelques instants après ton passage : <b>ne t\u2019arrête pas dessus</b> (ou saute par-dessus). Il se combine avec les <b>rochers</b>, les <b>pierres qui dévalent</b>, les <b>ravines</b> et ta jauge d\u2019eau : <b>2 ou 3 bouteilles</b> t\u2019attendent selon ta vitesse.',
    carnet: [
      { id: 'tuff', name: 'Bloc de tuf de l\u2019anneau', text: 'L\u2019ancien Pariou a été presque entièrement recouvert par un anneau de tuf trachy-andésitique, au cours d\u2019un épisode explosif que l\u2019on relie à un maar. Les cendres de cet épisode se sont étendues au moins jusqu\u2019à l\u2019actuelle Clermont-Ferrand.', src: 'Wikipédia — Puy Pariou (d\u2019après Krafft & de Larouzière, 1991)', url: 'https://fr.wikipedia.org/wiki/Puy_de_Pariou' },
      { id: 'scoria', name: 'Scorie gris-bleu à bulles', text: 'La roche du « nouveau Pariou » est une trachy-andésite de couleur gris bleuté. Elle contient de nombreuses bulles allongées dans le sens du courant : la lave était très riche en gaz.', src: 'Wikipédia — Puy Pariou (d\u2019après Krafft & de Larouzière, 1991)', url: 'https://fr.wikipedia.org/wiki/Puy_de_Pariou' },
      { id: 'apollo', name: 'Semi-Apollon', text: 'Un an après l\u2019effacement du sentier du cratère (2022), une grosse population de papillons Semi-Apollon est apparue sur le puy. C\u2019est une espèce protégée de montagne, présente dans la Chaîne des Puys, le Sancy, le Cantal, le Mézenc ou l\u2019Aubrac.', src: 'Parc des Volcans d\u2019Auvergne — le puy de Pariou, 1 an après (29/06/2023)', url: 'https://www.parcdesvolcans.fr/actu/le-puy-de-pariou-1-an-apres-travaux' }
    ],
    sources: [
      { label: 'Wikipédia — Puy Pariou (1 209 m, 2 cônes + anneau de tuf, cratère ≈ 90 m × 200 m, coulée 8 580 ± 350 ans, escalier de 555 marches, Volvic, procès 2002, 80 000 visiteurs en 2015)', url: 'https://fr.wikipedia.org/wiki/Puy_de_Pariou' },
      { label: 'Parc des Volcans d\u2019Auvergne — le puy de Pariou, 1 an après l\u2019effacement du sentier (> 140 000 visiteurs/an, sols fragiles, érosion > 50 cm, escaliers de 2019, Semi-Apollon)', url: 'https://www.parcdesvolcans.fr/actu/le-puy-de-pariou-1-an-apres-travaux' },
      { label: 'Parc des Volcans — présentation de l\u2019inauguration (chronologie des travaux 2003-2022 : escaliers en bois 2006, rondins 2010, jalonnement 2014-2016, caissons 2019, effacement 2022 ; > 130 000 visiteurs/an)', url: 'https://www.agir.parcdesvolcans.fr/_files/ugd/df776b_6cbc799c191c4f4a8347b08af8b37387.pdf' },
      { label: 'Chaîne des Puys – faille de Limagne (UNESCO) — actions en cours : effacement du sentier de 240 m dans le cratère, terminé en juin 2022', url: 'https://www.chainedespuys-failledelimagne.com/gestion-et-preservation-du-site/exemples-dactions-en-cours/' },
      { label: 'Tête en Ciel — jusqu\u2019à 3 200 visiteurs par jour en été ; effacer le sentier plutôt que le paver', url: 'https://tete-en-ciel.com/puy-pariou-3200-visiteurs-jour-sentier-cratere-efface/' },
      { label: 'FFRandonnée — le Pariou, joyau des Volcans d\u2019Auvergne (120 000 visiteurs en 2021, +10 à 13 % par an)', url: 'https://www.ffrandonnee.fr/s-informer/actualites/le-puy-pariou-le-joyau-des-volcans-d-auvergne-reportage' },
      { label: 'Quaternaire (2020) — les téphras du Pariou : volcan âgé d\u2019environ 9 500 ans, anneau de tufs puis cône strombolien', url: 'https://doi.org/10.4000/quaternaire.2172' },
      { label: 'Académie de Limoges (SVT) — Puy de Pariou (âge de 8 200 ans cité, entonnoir de 317 m de large pour ≈ 90 m de profondeur)', url: 'https://pedagogie.ac-limoges.fr/svt/accueil/sortie_volcans_web/co/03_puy_de_pariou.html' },
      { label: 'Visorando — Le Puy Pariou depuis le parking des Goules (6,09 km, +217 m, 2 h 20, difficulté « moyenne », départ à 977 m, interdiction de descendre dans le cratère et d\u2019en faire le tour)', url: 'https://www.visorando.com/randonnee-le-puy-pariou-depuis-le-parking-des-goul/' },
      { label: 'Travel in Auvergne — Puy de Pariou (45 min de montée, escalier en bois contre l\u2019érosion, 95 m de profondeur, accès au fond fermé depuis 2021)', url: 'https://www.travelinauvergne.fr/destinations/puy-de-dome/orcines/puy-de-pariou' },
      { label: 'Clermont Auvergne Volcans — fiche du puy de Pariou (cône strombolien d\u2019environ 8 000 ans, escaliers en bois, vue sur la Chaîne des Puys)', url: 'https://www.puydedome-tourisme.com/fr/fiche/patrimoine-naturel/puy-de-pariou--volcan-de-la-chaine-des-puys--faille-de-limagne-unesco-orcines_TFO4723130/' },
      { label: 'RandoBase — Puy Pariou (hêtraie-boulaie puis lande à callune près du sommet ; source secondaire, utilisée seulement pour l\u2019aspect du décor)', url: 'https://randobase.fr/massifs/puys/puy-pariou/' }
    ],

    /* ---- paramètres de jeu du niveau 2 (mêmes unités que le niveau 1) ----
       Nouveautés : `theme` (rendu propre au Pariou, js/pariou.js), `crumb` (zones de sol qui s'effrite : liste de { f : position 0..1 dans la pièce, w : largeur px }),
       `ext` (longueur de terrain après le sommet) et `crater` (cuvette ronde derrière le sommet).
       Sol qui s'effrite : dès qu'on le touche (au sol), il se fissure puis s'effondre après `crumble.fall` s ; on peut le franchir en courant ou en sautant. */
    play: {
      theme: 'pariou',
      water: { max: 100, start: 100, drainPerSec: 1.55, bottleGain: 55, thirstDamageEvery: 5, jumpCost: 3.5 },
      stars: { timeFast: 86, timeOk: 135, waterGood: 28, waterOk: 8 },
      lives: 3,
      crumble: { fall: 0.8 },
      ext: 900,
      crater: { kind: 'round', drop: 130, wall: 150, floor: 200 },
      pieces: [
        { t: 'flat',   len: 240, hint: 'start' },
        { t: 'slope',  len: 330, rise: 34, hint: 'water', boulders: [0.6] },
        { t: 'slope',  len: 300, rise: 40, crumb: [{ f: 0.58, w: 34 }], hint: 'crumble' },
        { t: 'gap',    len: 22,  hint: 'gap' },
        { t: 'slope',  len: 300, rise: 44, boulders: [0.3], bottle: 0.62 },
        { t: 'flat',   len: 110, cp: true, hint: 'checkpoint' },
        { t: 'slope',  len: 380, rise: 48, rocks: [4.6, 6.2], crumb: [{ f: 0.3, w: 34, fall: 0.7 }, { f: 0.76, w: 28, fall: 0.36 }], find: [{ id: 'tuff', f: 0.52 }], hint: 'crumble2' },
        { t: 'gap',    len: 26 },
        { t: 'stairs', len: 380, rise: 92, rocks: [3.8, 5.2], hint: 'rocks' },
        { t: 'flat',   len: 100, cp: true },
        { t: 'slope',  len: 340, rise: 50, boulders: [0.8], crumb: [{ f: 0.5, w: 26, fall: 0.34 }], find: [{ id: 'scoria', f: 0.22 }] },
        { t: 'gap',    len: 26 },
        { t: 'slope',  len: 260, rise: 36, boulders: [0.5], rocks: [3.6, 5.0] },
        { t: 'stairs', len: 480, rise: 124, bottle: 'air:0.6', rocks: [3.6, 4.8], find: [{ id: 'apollo', f: 0.4 }] },
        { t: 'flat',   len: 100, cp: true },
        { t: 'slope',  len: 400, rise: 52, rocks: [3.8, 5.2], crumb: [{ f: 0.28, w: 26, fall: 0.34 }, { f: 0.7, w: 26, fall: 0.32 }], bottle: 0.5 },
        { t: 'gap',    len: 28 },
        { t: 'slope',  len: 220, rise: 30, boulders: [0.45], rocks: [3.4, 4.6] },
        { t: 'stairs', len: 420, rise: 108, rocks: [3.4, 4.6] },
        { t: 'flat',   len: 100, cp: true },
        { t: 'flat',   len: 300, rim: true, crumb: [{ f: 0.5, w: 26, fall: 0.32 }] },
        { t: 'slope',  len: 120, rise: 14 },
        { t: 'flat',   len: 220, summit: true }
      ],
      finds: {
        tuff:   { name: 'Bloc de tuf de l\u2019anneau', icon: 'tuff' },
        scoria: { name: 'Scorie gris-bleu à bulles', icon: 'scoria' },
        apollo: { name: 'Semi-Apollon', icon: 'apollo' }
      },
      hints: {
        start:      'Avance avec ◀ ▶ et saute avec ▲ (clavier : flèches + Espace).',
        water:      'Ta jauge d\u2019eau baisse avec le temps. Trouve des bouteilles en chemin !',
        gap:        'Une ravine creusée par l\u2019érosion ! Prends de l\u2019élan et saute par-dessus.',
        checkpoint: 'Point de contrôle : si tu tombes, tu repars d\u2019ici.',
        boulder:    'Un rocher bloque le chemin : saute par-dessus !',
        crumble:    'Sol fragile ! Ce sol s\u2019effrite : il se fissure puis s\u2019effondre. Traverse sans t\u2019arrêter, ou saute par-dessus.',
        crumble2:   'L\u2019érosion ronge le sentier : plus on monte, plus le sol cède vite. Saute par-dessus ou traverse sans t\u2019arrêter !',
        rocks:      'Saute par-dessus les pierres qui dévalent la pente !',
        stairs:     'Les marches accrochent bien (aucune glissade) mais fatiguent : ta jauge d\u2019eau baisse plus vite.',
        bottle:     'Une bouteille d\u2019eau ! Ramasse-la pour remplir la jauge.'
      },
      hintsPad: {
        start:      'Avance avec le stick gauche (ou la croix) et saute avec A.',
        boulder:    'Un rocher bloque le chemin : saute par-dessus avec A !',
        crumble:    'Sol fragile ! Il s\u2019effondre vite : traverse sans t\u2019arrêter, ou saute avec A.'
      }
    }
  });

  /* Niveaux 3 à 6 : emplacements réservés, NOMS UNIQUEMENT (aucune donnée de montagne n'est affichée ni inventée tant que
     la fiche n'a pas été recherchée et sourcée). Affichés « Bientôt » sur la carte. */
  var LATER = [
    ['Puy Mary', ''],
    ['Puy de Dôme', 'Sentier des Muletiers'],
    ['Puy de Sancy', ''],
    ['Puy de Dôme', 'Chemin des Chèvres']
  ];
  LATER.forEach(function (a, i) {
    LEVELS.push({ id: 'niveau-' + (i + 3), number: i + 3, playable: false, name: a[0], route: a[1] });
  });
  LEVELS.forEach(function (lv, i) { lv.world = 1; lv.node = { x: MAP.nodes[i][0], y: MAP.nodes[i][1] }; });

  /* ---------- Mondes (v0.5.3) ----------
     Un « monde » = une image de carte + les niveaux (indices de LEVELS) qui y sont posés. Monde 1 = MAP ci-dessus (Chaîne des Puys).
     Monde 2 = Pays basque : bannière multi-sommets assets/map/monde2.webp (v0.7.1, bannière d’Émilien). Pour ajuster :
       1. remplacer assets/map/niveau7.webp (ou changer `banner` ; le fichier doit aussi être listé par build_single.py, qui prend tous les .webp du dossier) ;
       2. mettre à jour `ref` ([largeur, hauteur] de l'image, même ratio), `nodes` (une pastille par niveau de `levels`, en pixels de `ref`) et `trail` ;
       3. si le chemin de terre est déjà peint dans l'image, supprimer `path` (sinon le jeu le dessine par-dessus : voir `path`).
       levels : indices dans LEVELS des niveaux du monde, dans l'ordre du sentier.
       start / lead : point de départ du randonneur (arrivée du train) et points intermédiaires jusqu'à la 1re pastille (facultatif).
       trail  : points intermédiaires entre la pastille k et k+1 (comme MAP.trail).
       path   : { w, u, ... } dessine un chemin de terre pixel-art le long du sentier (start → pastilles) ; omettre si l'image a déjà son chemin.
       view.keep : { y, min } garde la ligne ref y (la pastille) visible à au moins min × hauteur d'écran du haut quand l'image déborde (paysage).
       label  : 'above' (défaut) | 'below' : côté où s'affiche l'étiquette de la pastille choisie. */
  /* v0.7.1 : 7 sommets du Pays basque. 7 Ursuya et 8 Atxuria sont rendus jouables par js/levels_w2.js ;
     7–13 sont jouables (Ursuya à Txindoki, js/levels_w2.js et js/levels_w3.js). Bannière : assets/map/monde2.webp, peinte par Émilien (original : assets/map/original/monde2-emilien.jpg ; le stand-in v0.7.0 reste en monde2-original.jpg / .png).
     Pastilles à côté des 7 panneaux peints, sans les recouvrir ni cacher arbres, maisons ou animaux ; chemin de terre simple (suit le sentier déjà peint sur La Rhune sans le recouvrir, ni le train, ni les randonneurs).
     view.keep.y = 50 aligne le haut du panneau du Pic d’Orhy, pour que les pastilles hautes restent visibles en paysage. */
  var W2LATER = [
    ['Ursuya', 'Depuis le quartier Celhay'],
    ['Atxuria', 'Depuis les Grottes de Sare'],
    ['Pic d\'Orhy', 'Pays basque'],
    ['La Rhune', 'Pays basque'],
    ['Artzamendi', 'Pays basque'],
    ['Aizkorri', 'Pays basque'],
    ['Txindoki', 'Pays basque']
  ];
  W2LATER.forEach(function (a, i) {
    LEVELS.push({ id: 'niveau-' + (i + 7), number: i + 7, playable: false, world: 2, name: a[0], route: a[1] });
  });

  var W3LATER = [
    ['Mont Poupet', 'Depuis Salins-les-Bains'],
    ['Mont d\'Or', 'Depuis Rochejean / Métabief'],
    ['Creux du Van', 'Depuis Noiraigue, sentier des 14 contours'],
    ['Grand Colombier', 'Depuis Culoz'],
    ['La Dôle', 'Depuis le parking des Dappes'],
    ['Colomby de Gex', 'Depuis le col de la Faucille'],
    ['Le Reculet', 'Haute Chaîne du Jura'],
    ['Crêt de la Neige', 'Toit du massif']
  ];
  W3LATER.forEach(function (a, i) {
    LEVELS.push({ id: 'niveau-' + (i + 14), number: i + 14, playable: false, world: 3, name: a[0], route: a[1] });
  });
  var WORLDS = [
    { id: 1, name: 'Chaîne des Puys', sub: 'Auvergne', banner: MAP.banner, ref: MAP.ref, levels: [0, 1, 2, 3, 4, 5], trail: MAP.trail, view: MAP.view, sky: MAP.sky, forest: MAP.forest },
    {
      id: 2, name: 'Pays basque', sub: 'De l\u2019Ursuya au Txindoki', banner: 'monde2', ref: [1056, 448],
      levels: [6, 7, 8, 9, 10, 11, 12],
      nodes: [[148, 248], [200, 248], [338, 124], [604, 232], [632, 154], [784, 256], [928, 152]],
      start: [38, 270],
      lead: [[52, 248], [80, 228], [120, 236]],
      trail: [
        [[174, 242]],
        [[230, 220], [280, 195], [310, 165], [328, 145]],
        [[385, 130], [415, 165], [445, 185], [490, 208], [540, 206], [575, 210]],
        [[615, 200], [622, 175]],
        [[640, 175], [665, 192], [720, 202], [770, 218], [790, 238]],
        [[820, 230], [880, 200], [910, 170]]
      ],
      /* v0.7.4 : plus de chemin de terre dessiné par-dessus la bannière (demande d’Émilien). Les pastilles et cadenas restent. */
      label: 'below',
      view: { fill: { port: 0.54, land: 0.76 }, bottom: { port: 0.80, land: 0.84 }, keep: { y: 50, min: 0.14 } },
      sky: '#2d6097', forest: '#093829'
    },
    {
      id: 3, name: 'Massif du Jura', sub: 'Du Poupet au Crêt de la Neige', banner: 'monde3', ref: [1056, 448],
      levels: [13, 14, 15, 16, 17, 18, 19, 20],
      /* pastilles alignées sur les 8 sommets peints (bannière v0.14.0) */
      nodes: [[100, 128], [270, 108], [443, 112], [516, 120], [590, 115], [718, 100], [837, 108], [970, 115]],
      /* enseignes JS (x, y du centre de la planche, en px de ref) : masquées si coupées */
      /* enseignes plantées au pied de chaque sommet (v0.17.7), à côté de la pastille */
      signs: [
        [216, 280, 'MONT|POUPET', '851 m'],
        [252, 228, "MONT D'OR", '1463 m'],
        [410, 236, 'CREUX|DU VAN', '1464 m'],
        [530, 240, 'GRAND|COLOMBIER', '1534 m'],
        [640, 232, 'LA DÔLE', '1677 m'],
        [728, 228, 'COLOMBY|DE GEX', '1688 m'],
        [832, 228, 'LE RECULET', '1718 m'],
        [952, 234, 'CRÊT DE|LA NEIGE', '1720 m']
      ],
      start: [36, 280],
      lead: [[50, 260], [78, 250], [100, 252]],
      /* v0.13.0 : pas de chemin tracé sur la bannière (comme le monde 2). */
      label: 'below',
      view: { fill: { port: 0.54, land: 0.76 }, bottom: { port: 0.80, land: 0.84 }, keep: { y: 50, min: 0.14 } },
      sky: '#567cb0', forest: '#0a3424'
    }
  ];
  WORLDS[1].levels.forEach(function (li, k) { LEVELS[li].node = { x: WORLDS[1].nodes[k][0], y: WORLDS[1].nodes[k][1] }; });
  WORLDS[2].levels.forEach(function (li, k) { LEVELS[li].node = { x: WORLDS[2].nodes[k][0], y: WORLDS[2].nodes[k][1] }; });

  /* ---------- Cinématique de fin (js/vista.js) : tout ce qui dépend de l'image de bannière est ICI ----------
     Pour changer la bannière : remplacer assets/map/<banner>.webp (ou changer `banner`) puis ajuster ces coordonnées.
     Toutes les coordonnées sont en pixels de l'image d'origine (0,0 = coin haut-gauche), indépendantes de la taille de l'écran.
       banner  : nom du fichier dans assets/map (sans .webp).
       ref     : [largeur, hauteur] de l'espace de coordonnées ci-dessous ; l'image est ramenée à cette taille (pixels « logiques » de la bannière).
       flag    : pied du mât du petit fanion, posé sur le sommet du volcan (x,y).
       focus   : point que la caméra cadre à la fin (centre du volcan).
       at      : où ce point finit à l'écran, en fraction de la largeur / hauteur ([0.5, 0.5] = centre) pour 'land' (paysage) et 'port' (portrait).
       startDx : au début du travelling, décalage horizontal de la vue vers la droite (px d'image) ; la caméra glisse jusqu'au focus.
       perScreenW : largeur (px d'image) visible à l'écran en portrait (règle le grossissement entier ; défaut 330).
       birds   : zone de ciel (y min, y max, px d'image) où passent quelques oiseaux. */
  /* v0.7.7 : toiles peintes des sommets (validées par Émilien), même système que Ursuya/Atxuria.
     Portrait 720×1280 et paysage 1280×720. Randonneuse composite ; pas de texte dans l'image. */
  LEVELS[0].ending = {
    hideFlag: true, noRing: true, fullBleed: true, noExt: true,
    fx: { clouds: false, vultures: 2, shimmer: false, raptor: 'kite' },
    port: {
      banner: 'ending-vache-port', ref: [720, 1280],
      flag: { x: 520, y: 1192 }, focus: { x: 360, y: 720 },
      hikerFit: { y0: 1064, y1: 1192, ratio: 1.0 },
      anchor: [0.50, 0.55], startShift: -40,
      vultureY: [200, 340]
    },
    land: {
      banner: 'ending-vache-land', ref: [1280, 720],
      flag: { x: 980, y: 670 }, focus: { x: 640, y: 400 },
      hikerFit: { y0: 574, y1: 670, ratio: 1.0 },
      anchor: [0.50, 0.72], startShift: -60,
      vultureY: [80, 180]
    }
  };

  LEVELS[1].ending = {
    hideFlag: true, noRing: true, fullBleed: true, noExt: true,
    fx: { clouds: false, vultures: 2, shimmer: false, raptor: 'kite' },
    port: {
      banner: 'ending-pariou-port', ref: [720, 1280],
      flag: { x: 348, y: 1214 }, focus: { x: 360, y: 720 },
      hikerFit: { y0: 1106, y1: 1214, ratio: 1.0 },
      anchor: [0.50, 0.55], startShift: -30,
      vultureY: [180, 320]
    },
    land: {
      banner: 'ending-pariou-land', ref: [1280, 720],
      flag: { x: 400, y: 685 }, focus: { x: 640, y: 400 },
      hikerFit: { y0: 599, y1: 685, ratio: 1.0 },
      anchor: [0.50, 0.72], startShift: -50,
      vultureY: [70, 170]
    }
  };

  var VERSION = '0.19.0';
  window.AscensionData = { MAP: MAP, LEVELS: LEVELS, WORLDS: WORLDS, VERSION: VERSION };
})();
