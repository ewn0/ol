/* ============================================================
   SPRITES — pixel art défini en texte.
   Chaque sprite = { map: [lignes], pal: { caractere: couleur } }
   '.' = transparent.
   ============================================================ */

const Sprites = (() => {

  // Normalise la largeur des lignes (évite tout décalage si une ligne est mal comptée)
  function def(pal, map) {
    const w = Math.max(...map.map(r => r.length));
    return { pal, map: map.map(r => r.padEnd(w, '.')), w, h: map.length };
  }

  const S = {

    /* --- Le kassos du parc : casquette, jogging, TN --- */
    kassos: def(
      { G: '#2fbf5f', g: '#1e8b45', S: '#e8b98a', K: '#2a1a12', M: '#b5765a',
        W: '#f4f4f8', B: '#23213f', N: '#e9e9f2' },
      [
        '..............',
        '...GGGGGGGG...',
        '..GGGGGGGGGG..',
        '..GGGGGGGGGGgg',
        '...SSSSSSSS...',
        '...SKSSSSKS...',
        '...SSSSSSSS...',
        '....SSSSSS....',
        '.....MMMM.....',
        '..WWWWWWWWWW..',
        '.WWWWWWWWWWWW.',
        '.WWWWWWWWWWWW.',
        '..WWWWWWWWWW..',
        '..BBBB..BBBB..',
        '..BBBB..BBBB..',
        '.NNNNN..NNNNN.',
      ]
    ),

    /* --- Un cheveu d'Elise (châtain) --- */
    hair: def(
      { H: '#7a4a24' },
      [
        '..HH..',
        '.HH...',
        'HH....',
        '.HH...',
        '..HH..',
        '...HH.',
        '....HH',
        '...HH.',
        '..HH..',
        '.HH...',
      ]
    ),

    /* --- La brosse de sauvetage --- */
    brush: def(
      { b: '#ffd23f', P: '#ff4d6d' },
      [
        'b.b.b.b.b.b.b.b.',
        'b.b.b.b.b.b.b.b.',
        'PPPPPPPPPPPPPPPP',
        'PPPPPPPPPPPPPPPP',
        '.PPPPPPPPPPPPPP.',
        '......PPPP......',
        '......PPPP......',
      ]
    ),

    /* --- Sushis --- */
    maki: def(
      { K: '#1b3d2a', W: '#f4f4f8', O: '#ff8a3d' },
      [
        '..KKKKKK..',
        '.KWWWWWWK.',
        'KWWWWWWWWK',
        'KWWOOOOWWK',
        'KWWOOOOWWK',
        'KWWWWWWWWK',
        '.KWWWWWWK.',
        '..KKKKKK..',
      ]
    ),

    nigiri: def(
      { O: '#ff8a3d', W: '#f4f4f8' },
      [
        '..OOOOOO..',
        '.OOOOOOOO.',
        'OOOOOOOOOO',
        '.WWWWWWWW.',
        'WWWWWWWWWW',
        'WWWWWWWWWW',
        '.WWWWWWWW.',
        '..WWWWWW..',
      ]
    ),

    avocado: def(
      { K: '#1b3d2a', G: '#7fd463', W: '#f4f4f8' },
      [
        '..KKKKKK..',
        '.KWWWWWWK.',
        'KWWGGGGWWK',
        'KWGGGGGGWK',
        'KWGGGGGGWK',
        'KWWGGGGWWK',
        '.KWWWWWWK.',
        '..KKKKKK..',
      ]
    ),

    /* --- Le piège : wasabi --- */
    wasabi: def(
      { G: '#5fd12a', g: '#3f9c17' },
      [
        '...GGG....',
        '..GGGGG...',
        '.GGGGGGG..',
        '.GGgGGGG..',
        '..GGGGG...',
        '...GGG....',
      ]
    ),

    /* --- Les lys : 4 états de croissance + 1 état noyé --- */
    lys0: def(
      { G: '#3ddc84', E: '#7a4a24' },
      [
        '............', '............', '............', '............',
        '............', '............', '............', '............',
        '.....GG.....',
        '.....GG.....',
        '..GGGGG.....',
        '.....GGGG...',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '...EEEEEE...',
      ]
    ),

    lys1: def(
      { P: '#cfe9d8', G: '#3ddc84', E: '#7a4a24' },
      [
        '............',
        '............',
        '.....PP.....',
        '....PPPP....',
        '....PPPP....',
        '....PPPP....',
        '.....PP.....',
        '.....GG.....',
        '.....GG.....',
        '..GGGGG.....',
        '.....GGGG...',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '...EEEEEE...',
      ]
    ),

    lys2: def(
      { P: '#f4f4f8', Y: '#ffd23f', G: '#3ddc84', E: '#7a4a24' },
      [
        '............',
        '...P.PP.P...',
        '...PPPPPP...',
        '..PPPYYPPP..',
        '..PPPYYPPP..',
        '...PPPPPP...',
        '....PPPP....',
        '.....GG.....',
        '.....GG.....',
        '..GGGGG.....',
        '.....GGGG...',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '...EEEEEE...',
      ]
    ),

    lys3: def(
      { P: '#f4f4f8', Y: '#ffd23f', G: '#3ddc84', E: '#7a4a24' },
      [
        '.P...PP...P.',
        '.PP.PPPP.PP.',
        '..PPPPPPPP..',
        '..PPPYYPPP..',
        '.PPPYYYYPPP.',
        '..PPPYYPPP..',
        '..PPPPPPPP..',
        '...PPPPPP...',
        '....PPPP....',
        '.....GG.....',
        '..GGGGG.....',
        '.....GGGG...',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '...EEEEEE...',
      ]
    ),

    lysDead: def(
      { D: '#8a7a5a', G: '#6f8a5e', E: '#7a4a24' },
      [
        '............', '............', '............', '............',
        '............',
        '...D.DD.D...',
        '....DDDD....',
        '.....DD.....',
        '.....GG.....',
        '....GGG.....',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '.....GG.....',
        '...EEEEEE...',
      ]
    ),

    /* --- Le joueur : cheveux noirs, yeux bleus --- */
    player: def(
      { B: '#141225', S: '#e8b98a', I: '#3aa0ff', T: '#35d6ed', J: '#3a4a8a', H: '#f4f4f8' },
      [
        '...BBBBBB...',
        '..BBBBBBBB..',
        '..BSSSSSSB..',
        '..SSIISIIS..',
        '..SSSSSSSS..',
        '...SSSSSS...',
        '....SSSS....',
        '..TTTTTTTT..',
        '.TTTTTTTTTT.',
        '.TTTTTTTTTT.',
        '..JJJJJJJJ..',
        '..JJJ..JJJ..',
        '..JJJ..JJJ..',
        '..SH....SH..',
      ]
    ),

    /* --- Elise : cheveux châtains, yeux bleu très clair --- */
    elise: def(
      { H: '#7a4a24', S: '#f0c6a0', I: '#a8dcf0', P: '#ff4d6d', L: '#f0c6a0' },
      [
        '...HHHHHH...',
        '..HHHHHHHH..',
        '..HSSSSSSH..',
        '.HSIISIISH..',
        '.HSSSSSSSH..',
        '..HSSSSSH...',
        '...HSSSH....',
        '..PPPPPPPP..',
        '.PPPPPPPPPP.',
        '.PPPPPPPPPP.',
        '..PPPPPPPP..',
        '...LL..LL...',
        '...LL..LL...',
        '..SS....SS..',
      ]
    ),

    /* --- Le beffroi de Lille (arrivée) --- */
    beffroi: def(
      { B: '#b9b5e0', W: '#ffd23f', Y: '#ff4d6d' },
      [
        '......YY......',
        '.....YYYY.....',
        '.....BBBB.....',
        '....BBBBBB....',
        '....BWWWWB....',
        '....BBBBBB....',
        '....BBBBBB....',
        '...BBBBBBBB...',
        '...BWWBBWWB...',
        '...BBBBBBBB...',
        '..BBBBBBBBBB..',
        '..BWWBBBBWWB..',
        '..BBBBBBBBBB..',
        '.BBBBBBBBBBBB.',
        '.BWWBBBBBBWWB.',
        '.BBBBBBBBBBBB.',
        'BBBBBBBBBBBBBB',
        'BBBWWBBBBWWBBB',
        'BBBBBBBBBBBBBB',
        'BBBBBBBBBBBBBB',
      ]
    ),

    /* --- Valise (arrivée à Lille) --- */
    valise: def(
      { H: '#3a2a1a', B: '#a05a2c', W: '#ffd23f', b: '#7a4020' },
      [
        '...HHHH...',
        '..H....H..',
        'BBBBBBBBBB',
        'BBBWWWWBBB',
        'BBBBBBBBBB',
        'BBBWWWWBBB',
        'BBBBBBBBBB',
        '.b......b.',
      ]
    ),

    /* --- Obstacle de route --- */
    cone: def(
      { O: '#ff8a3d', W: '#f4f4f8', K: '#2a2850' },
      [
        '....OO....',
        '....OO....',
        '...OOOO...',
        '...OWWO...',
        '..OOOOOO..',
        '..OOOOOO..',
        '.OOOOOOOO.',
        'KKKKKKKKKK',
      ]
    ),
  };

  /* Dessine un sprite : (x, y) = coin haut-gauche, scale = taille d'un pixel */
  function draw(ctx, name, x, y, scale) {
    const s = S[name];
    if (!s) return;
    const px = Math.round(x), py = Math.round(y);
    for (let r = 0; r < s.map.length; r++) {
      const row = s.map[r];
      for (let c = 0; c < row.length; c++) {
        const col = s.pal[row[c]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(px + c * scale, py + r * scale, scale, scale);
      }
    }
  }

  /* Dessine centré sur (cx, cy) */
  function drawCentered(ctx, name, cx, cy, scale) {
    const s = S[name];
    if (!s) return;
    draw(ctx, name, cx - (s.w * scale) / 2, cy - (s.h * scale) / 2, scale);
  }

  function size(name) {
    const s = S[name];
    return s ? { w: s.w, h: s.h } : { w: 0, h: 0 };
  }

  return { draw, drawCentered, size, defs: S };
})();


/* ============================================================
   Petit utilitaire canvas : gère le devicePixelRatio et le resize
   ============================================================ */

function makeCanvas(parent) {
  const canvas = document.createElement('canvas');
  parent.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const api = { canvas, ctx, w: 0, h: 0 };

  function resize() {
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    api.w = Math.max(1, Math.round(rect.width));
    api.h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(api.w * dpr);
    canvas.height = Math.round(api.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  resize();
  window.addEventListener('resize', resize);
  api.resize = resize;
  api.destroy = () => window.removeEventListener('resize', resize);
  return api;
}
