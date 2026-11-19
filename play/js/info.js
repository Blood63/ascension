/* v0.3.0 — Données pédagogiques : inventaire, enjeux environnementaux, briefing de niveau.
   Les sources sont désignées par leur indice dans lv.sources (aucun lien recopié : une seule vérité).
   Pour une future montagne : ajouter une entrée dans INFO (clé = lv.number) avec required / obstacles / enjeux / items. */
(function () {
  'use strict';
  var D = window.AscensionData, LV = D.LEVELS;
  function bottlesIn(lv) { return lv.play.pieces.filter(function (p) { return p.bottle != null; }).length; }

  var INFO = {
    1: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(LV[0]), text: 'La jauge d\u2019eau baisse en continu et chaque saut te fatigue : sans ces bouteilles, tu n\u2019atteins pas le sommet. Ramasse-les toutes.' }],
      obstacles: [
        { icon: '🪨', name: 'Pierres qui dévalent la pente', real: 'Éboulis : des blocs qui se détachent et dévalent un versant. Soyons honnêtes : sur les volcans d\u2019Auvergne, c\u2019est rare ; nos sources ne décrivent pas de chutes de pierres fréquentes sur ce puy. C\u2019est ici un obstacle de jeu, inspiré des scories meubles du cône.', src: [0] },
        { icon: '🕳️', name: 'Trous et vides', real: 'Ravines d\u2019érosion : des sillons creusés par l\u2019eau de pluie dans un sol de scories nu. Le Parc des Volcans documente l\u2019érosion des sentiers de la Chaîne des Puys (cf. Pariou) ; ici, l\u2019image est une illustration du phénomène.', src: ['2.1', '2.2'] },
        { icon: '🟫', name: 'Rochers posés sur le chemin', real: 'Blocs de scories et de lave : le puy de la Vache est un cône de scories (la fameuse « carrière en rouge et noir » est visible depuis le sentier). Ces blocs font partie du décor naturel.', src: [8, 9] }
      ],
      enjeux: [
        { t: 'Surfréquentation : le puy de la Vache a compté environ 100 000 passages en 2024 (3e site de la Chaîne des Puys) et plus de 100 000 visiteurs en 2025.', s: [2, 6] },
        { t: 'Travaux de protection : les sentiers sont repensés dans un chantier d\u2019environ deux ans (communiqué du Département du 17/04/2026) ; le site peut être fermé pendant les travaux (se renseigner avant de partir).', s: [2, 3, 6] },
        { t: 'Exploitation de la pouzzolane : les scories du puy ont été extraites dans une carrière au pied du site (ancienne exploitation, « carrière en rouge et noir »). Une source indique qu\u2019elle n\u2019est plus exploitée depuis 1980.', s: [8, 9, 10] },
        { t: 'Piétinement et érosion : sur les puys de scories, un sol piétiné perd sa végétation puis se creuse (voir le cas documenté du Pariou, érosion de plus de 50 cm). Reste sur le sentier balisé.', s: ['2.1'] },
        { t: 'Protection : la Chaîne des Puys – faille de Limagne est inscrite au patrimoine mondial de l\u2019UNESCO depuis 2018, ce qui impose une gestion et une préservation du site.', s: [7] },
        { t: 'Déchets et pollution : nos sources ne détaillent pas de chiffres propres à la Vache. Règle générale de randonnée : remporter ses déchets et privilégier une gourde réutilisable.', s: [] }
      ],
      items: { water: { where: 'Sur le sentier, certaines en hauteur (il faut sauter).', why: 'La boucle fait environ 4 km pour 285 m de dénivelé (≈ 2 h) et nos sources ne signalent pas de point d\u2019eau : on emporte sa propre eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [11] } }
    },
    2: {
      required: [{ id: 'water', name: 'Bouteilles d\u2019eau', count: bottlesIn(LV[1]), text: 'La jauge d\u2019eau baisse en continu et chaque saut te fatigue : sans ces bouteilles, tu n\u2019atteins pas le sommet. Ramasse-les toutes.' }],
      obstacles: [
        { icon: '🟤', name: 'Sol qui s\u2019effrite', real: 'Érosion des sols : sur le Pariou, un sol fragile est piétiné par plus de 140 000 visiteurs par an et peut perdre plus de 50 cm. La pouzzolane (scories) piétinée se désagrège et se creuse.', src: [1] },
        { icon: '🪨', name: 'Pierres qui dévalent la pente', real: 'Éboulis : des blocs qui dévalent un versant. Honnêtement, c\u2019est rare sur les volcans d\u2019Auvergne ; nos sources ne décrivent pas de chutes de pierres fréquentes au Pariou. C\u2019est surtout un obstacle de jeu.', src: [] },
        { icon: '🟫', name: 'Rochers posés sur le chemin', real: 'Blocs de scories et de tuf : le Pariou est formé d\u2019un anneau de tuf et de cônes de scories de trachy-andésite.', src: [0, 6] },
        { icon: '🕳️', name: 'Trous et vides', real: 'Ravines d\u2019érosion : l\u2019eau creuse les pentes de scories mises à nu par le piétinement (voir les escaliers et caissons installés par le Parc pour contenir l\u2019érosion).', src: [1, 2] }
      ],
      enjeux: [
        { t: 'Surfréquentation : plus de 140 000 visiteurs par an selon le Parc (jusqu\u2019à 3 200 par jour en été d\u2019après une autre source).', s: [1, 4] },
        { t: 'Piétinement et érosion : sols fragiles, érosion de plus de 50 cm constatée sur le sentier du cratère.', s: [1] },
        { t: 'Mesures successives : escaliers en bois (2006), rondins (2010), jalonnement (2014-2016), caissons (2019), puis effacement du sentier de 240 m dans le cratère, terminé en juin 2022, plutôt que de le paver.', s: [2, 3, 4] },
        { t: 'Hors-sentier : il est interdit de descendre dans le cratère et d\u2019en faire le tour ; l\u2019accès au fond est fermé depuis 2021.', s: [8, 9] },
        { t: 'Effet observé : un an après l\u2019effacement du sentier, une importante population de papillons Semi-Apollon (espèce protégée) est apparue sur le puy.', s: [1] },
        { t: 'Protection : la Chaîne des Puys – faille de Limagne est inscrite au patrimoine mondial de l\u2019UNESCO depuis 2018.', s: ['1.7'] },
        { t: 'Exploitation : nos sources ne documentent pas de carrière de pouzzolane sur le Pariou (cela concerne la Vache). Déchets : pas de chiffres dans nos sources ; remporte les tiens.', s: [] }
      ],
      items: { water: { where: 'Sur la montée, certaines en hauteur (il faut sauter).', why: 'Le parcours depuis le parking des Goules fait environ 6 km pour +217 m (≈ 2 h 20) et nos sources ne signalent pas de point d\u2019eau : on emporte son eau. Dans le jeu, ces bouteilles sont un ravitaillement symbolique.', src: [8] } }
    }
  };
  // où trouver / pourquoi (objets du carnet). Les faits viennent des textes sourcés du carnet de chaque niveau.
  var CARNET = {
    bomb:    { icon: '🌋', where: 'Puy de la Vache — caché en hauteur.', why: 'Des bombes et des scories sont retombées autour des cônes de la Vache et de Lassolas lors de l\u2019éruption d\u2019il y a environ 8 600 ans : on en trouve donc encore sur place.' },
    crystal: { icon: '💎', where: 'Puy de la Vache — caché en hauteur.', why: 'Les scories de la Vache contiennent de rares phénocristaux (grands cristaux formés dans le magma avant l\u2019éruption).' },
    raft:    { icon: '🟫', where: 'Puy de la Vache — caché en hauteur.', why: 'La coulée a arraché des morceaux du cône et les a emportés comme des radeaux ; l\u2019un d\u2019eux est visible à environ 2 km en aval.' },
    tuff:    { icon: '🪨', where: 'Puy de Pariou — caché en hauteur.', why: 'L\u2019ancien Pariou a été recouvert par un anneau de tuf après un épisode explosif ; on trouve ce tuf autour du cratère.' },
    scoria:  { icon: '⚫', where: 'Puy de Pariou — caché en hauteur.', why: 'La lave du « nouveau Pariou » (trachy-andésite gris bleuté) était très riche en gaz : d\u2019où les bulles allongées dans la roche.' },
    apollo:  { icon: '🦋', where: 'Puy de Pariou — caché en hauteur.', why: 'Après l\u2019effacement du sentier du cratère en 2022, une grosse population de Semi-Apollon, papillon protégé de montagne, est apparue sur le puy.' }
  };

  LV.forEach(function (lv) { if (INFO[lv.number]) { lv.info = INFO[lv.number]; } });
  D.INFO = INFO; D.CARNET_INFO = CARNET;
})();
