/* ============================================================
   NIVEAU 3 — FAIS POUSSER LE BOUQUET DE LYS
   Appuie sur une fleur pour l'arroser. Mais pas trop. Alterne.
   ============================================================ */

Game.register((() => {

  /* ---- Textes ---- */
  const T = {
    intro: [
      "Cette fois ci, quatre lys.",
      "Appuie sur une fleur pour l'arroser, lâche avant de la noyer.",
      "Oui, il faut s'occuper des quatre. C'est le principe.",
    ],
    noyade: ['Trop d\'eau !', 'Elle nage', 'Doucement', 'Piscine', 'Elle boit trop'],
    pousse: ['Ça pousse', 'Joli', 'Elle sort', 'Presque'],
    win: "{X} lys épanouis sur {N}.\nBouquet livré.\nFleuriste : moi.",
    lose: "{X} lys sur {N}.\nC'est plus un bouquet, c'est une salade.\nOn recommence.",
  };

  /* ---- Réglages ---- */
  const NB_LYS = 4;
  const OBJECTIF = 3;      // lys épanouis nécessaires
  const DUREE = 24;        // secondes
  const POUSSE = 25;       // % de croissance par seconde d'arrosage
  const EAU_MONTE = 52;    // % d'eau par seconde d'arrosage
  const EAU_DESCEND = 34;  // % d'eau évacuée par seconde au repos
  const NOYADE = 30;       // % de croissance perdue par seconde quand c'est noyé
  const EPANOUI = 92;      // seuil "fleur épanouie"

  function start(root, api) {
    root.innerHTML = `
      <div class="statusbar">
        <span>Lys épanouis : <b id="l3-count">0</b>/${NB_LYS}</span>
        <span>Temps : <b id="l3-time">${DUREE}</b>s</span>
      </div>
      <div class="lys-grid" id="l3-grid"></div>
      <div class="statusbar"><span class="muted">maintiens l'appui pour arroser</span></div>
    `;

    const grid = root.querySelector('#l3-grid');
    const countEl = root.querySelector('#l3-count');
    const timeEl = root.querySelector('#l3-time');

    const fleurs = [];
    let active = -1;

    for (let i = 0; i < NB_LYS; i++) {
      const el = document.createElement('div');
      el.className = 'lys';
      el.innerHTML = `
        <div class="lys-art"></div>
        <div class="bars">
          <div class="thinbar"><span></span></div>
          <div class="thinbar water"><span></span></div>
        </div>
      `;
      grid.appendChild(el);

      const cv = makeCanvas(el.querySelector('.lys-art'));
      api.onCleanup(() => cv.destroy());

      const f = {
        el, cv,
        croissance: 0,
        eau: 0,
        noyee: false,
        barGrow: el.querySelectorAll('.thinbar > span')[0],
        barWater: el.querySelectorAll('.thinbar > span')[1],
        barWaterBox: el.querySelectorAll('.thinbar')[1],
        dernierEtat: null,
      };
      fleurs.push(f);

      const down = e => { e.preventDefault(); active = i; el.classList.add('active'); };
      el.addEventListener('pointerdown', down);
      api.onCleanup(() => el.removeEventListener('pointerdown', down));
    }

    function relache() {
      if (active >= 0) fleurs[active].el.classList.remove('active');
      active = -1;
    }
    window.addEventListener('pointerup', relache);
    window.addEventListener('pointercancel', relache);
    api.onCleanup(() => {
      window.removeEventListener('pointerup', relache);
      window.removeEventListener('pointercancel', relache);
    });

    let blabla = 0;
    let sonEau = 0;

    api.loop((dt, total) => {
      const restant = Math.max(0, DUREE - total);
      timeEl.textContent = Math.ceil(restant);

      fleurs.forEach((f, i) => {
        const arrose = (i === active);

        if (arrose) {
          f.eau = Math.min(120, f.eau + EAU_MONTE * dt);
          if (f.eau >= 100) {
            f.noyee = true;
            f.croissance = Math.max(0, f.croissance - NOYADE * dt);
          } else {
            f.croissance = Math.min(100, f.croissance + POUSSE * dt);
          }
        } else {
          f.eau = Math.max(0, f.eau - EAU_DESCEND * dt);
          if (f.eau < 60) f.noyee = false;
        }

        f.barGrow.style.width = f.croissance + '%';
        f.barWater.style.width = Math.min(100, f.eau) + '%';
        f.barWaterBox.classList.toggle('flood', f.eau >= 85);
        f.el.classList.toggle('done', f.croissance >= EPANOUI && !f.noyee);

        dessine(f, total);
      });

      // Sons et petits mots
      if (active >= 0) {
        sonEau -= dt;
        if (sonEau <= 0) { sonEau = 0.18; api.sfx('water'); }
      }
      blabla -= dt;
      if (blabla <= 0) {
        blabla = 2.5 + Math.random() * 2;
        const noyees = fleurs.filter(f => f.noyee);
        if (noyees.length) api.floater(pick(T.noyade), root);
        else if (Math.random() < 0.5) api.floater(pick(T.pousse), root);
      }

      const ok = fleurs.filter(f => f.croissance >= EPANOUI && !f.noyee).length;
      countEl.textContent = ok;

      // Tous les lys épanouis : on s'arrête là, pas besoin d'attendre le chrono
      if (ok >= NB_LYS) {
        api.win(T.win.replace('{X}', ok).replace('{N}', NB_LYS));
        return;
      }

      if (restant <= 0) {
        const msg = (ok >= OBJECTIF ? T.win : T.lose)
          .replace('{X}', ok).replace('{N}', NB_LYS);
        if (ok >= OBJECTIF) api.win(msg); else api.lose(msg);
      }
    });

    function etatDe(f) {
      if (f.noyee) return 'lysDead';
      if (f.croissance >= EPANOUI) return 'lys3';
      if (f.croissance >= 50) return 'lys2';
      if (f.croissance >= 15) return 'lys1';
      return 'lys0';
    }

    function dessine(f, t) {
      const { ctx, w, h } = f.cv;
      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      const nom = etatDe(f);
      const sp = Sprites.size(nom);
      const scale = Math.max(2, Math.floor(Math.min(w / (sp.w + 2), h / (sp.h + 1))));
      const balance = f.croissance >= EPANOUI ? Math.sin(t * 3) * scale * 0.4 : 0;

      Sprites.draw(ctx, nom, (w - sp.w * scale) / 2 + balance, h - sp.h * scale, scale);

      // Gouttes pendant l'arrosage
      if (f.el.classList.contains('active')) {
        ctx.fillStyle = '#35d6ed';
        for (let k = 0; k < 4; k++) {
          const y = ((t * 220 + k * 40) % h);
          ctx.fillRect(w / 2 - scale * 3 + k * scale * 2, y, scale, scale * 2);
        }
      }
    }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  }

  return { id: 3, title: 'LE BOUQUET DE LYS', intro: T.intro, start };
})());
