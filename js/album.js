/* ============================================================
   ALBUM SOUVENIRS — Galerie d'illustrations Pixel Art.
   4 souvenirs de jour : Sushi shop, Le parc, La voiture, Premier baiser.
   ============================================================ */

const Album = (() => {

  const SOUVENIRS = [
    {
      id: 'sushis',
      title: 'Sushi shop',
      draw(ctx, w, h) {
        const scale = Math.max(2, Math.floor(w / 70));

        // Intérieur resto japonais lumineux en journée
        ctx.fillStyle = '#f4ece1';
        ctx.fillRect(0, 0, w, h);

        // Fenêtre éclairée sur la gauche
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(w * 0.05, h * 0.1, w * 0.25, h * 0.35);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w * 0.05, h * 0.26, w * 0.25, 2);
        ctx.fillRect(w * 0.17, h * 0.1, 2, h * 0.35);

        // Table en bois clair
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(w * 0.15, h * 0.58, w * 0.7, h * 0.32);
        ctx.fillStyle = '#d2b48c';
        ctx.fillRect(w * 0.15, h * 0.58, w * 0.7, 4);

        // Plats sushis sur la table
        Sprites.drawCentered(ctx, 'maki', w * 0.35, h * 0.65, scale);
        Sprites.drawCentered(ctx, 'nigiri', w * 0.50, h * 0.65, scale);
        Sprites.drawCentered(ctx, 'avocado', w * 0.65, h * 0.65, scale);

        // Baguettes en bois
        ctx.fillStyle = '#4a2511';
        ctx.fillRect(w * 0.42, h * 0.72, scale * 6, 2);

        // Personnages
        Sprites.drawCentered(ctx, 'player', w * 0.28, h * 0.44, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.72, h * 0.44, scale);

        // Cœur rose au-dessus
        ctx.fillStyle = '#ff4d6d';
        ctx.font = `${Math.round(scale * 4)}px monospace`;
        ctx.fillText('♥', w * 0.48, h * 0.38);
      }
    },
    {
      id: 'parc',
      title: 'Le parc',
      draw(ctx, w, h) {
        const scale = Math.max(2, Math.floor(w / 70));

        // Ciel bleu de jour
        ctx.fillStyle = '#5bc0de';
        ctx.fillRect(0, 0, w, h);

        // Nuages blancs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w * 0.15, h * 0.12, w * 0.2, h * 0.12);
        ctx.fillRect(w * 0.6, h * 0.08, w * 0.25, h * 0.14);

        // Sol herbe verte
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, h * 0.52, w, h * 0.48);

        // Arbres en arrière-plan
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(w * 0.08, h * 0.25, w * 0.2, h * 0.3);
        ctx.fillRect(w * 0.72, h * 0.22, w * 0.22, h * 0.33);

        // Banc du parc en bois
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(w * 0.22, h * 0.62, w * 0.56, scale * 3.5);
        ctx.fillStyle = '#5c3a17';
        ctx.fillRect(w * 0.26, h * 0.68, scale * 2, scale * 4);
        ctx.fillRect(w * 0.70, h * 0.68, scale * 2, scale * 4);

        // Personnages assis
        Sprites.drawCentered(ctx, 'player', w * 0.36, h * 0.48, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.64, h * 0.48, scale);

        // Kassos au fond à gauche
        Sprites.drawCentered(ctx, 'kassos', w * 0.12, h * 0.46, scale * 0.85);
      }
    },
    {
      id: 'voiture',
      title: 'La voiture',
      draw(ctx, w, h) {
        const scale = Math.max(2, Math.floor(w / 70));

        // 1. Vue extérieure par le pare-brise (Ciel bleu & route de jour)
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h * 0.55);

        // Arbres et paysage qui défilent
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(w * 0.05, h * 0.28, w * 0.25, h * 0.27);
        ctx.fillRect(w * 0.70, h * 0.25, w * 0.25, h * 0.3);

        // Route grise sous le soleil
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(w * 0.3, h * 0.35, w * 0.4, h * 0.2);

        // 2. Intérieur de la voiture (Habitacle & Tableau de bord)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, h * 0.55, w, h * 0.45); // Tableau de bord

        // Contour du pare-brise (Piliers & toit)
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(0, 0, w * 0.1, h);         // Pilier gauche
        ctx.fillRect(w * 0.9, 0, w * 0.1, h);   // Pilier droit
        ctx.fillRect(0, 0, w, h * 0.12);        // Haut toit

        // Rétroviseur intérieur
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.46, h * 0.12, w * 0.08, h * 0.08);

        // Sièges & Personnages vus de l'intérieur
        // Conducteur (Player à gauche)
        Sprites.drawCentered(ctx, 'player', w * 0.32, h * 0.48, scale);
        // Passagère (Elise à droite)
        Sprites.drawCentered(ctx, 'elise', w * 0.68, h * 0.48, scale);

        // Volant devant le joueur
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(w * 0.32, h * 0.64, scale * 5.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    {
      id: 'bisou',
      title: 'Premier baiser',
      draw(ctx, w, h) {
        const s = Math.max(2, Math.floor(w / 65));

        // Ciel ensoleillé de jour
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h);

        // Soleil radieux
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.2, w * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Nuages doux
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(w * 0.1, h * 0.15, w * 0.22, h * 0.12);

        // Sol pavé / herbe de jour
        ctx.fillStyle = '#06d6a0';
        ctx.fillRect(0, h * 0.72, w, h * 0.28);
        ctx.fillStyle = '#118ab2';
        ctx.fillRect(0, h * 0.72, w, 3);

        // Personnages l'un contre l'autre pour le bisou
        Sprites.drawCentered(ctx, 'player', w * 0.44, h * 0.60, s);
        Sprites.drawCentered(ctx, 'elise', w * 0.54, h * 0.60, s);

        // Cœurs rouges qui montent
        ctx.fillStyle = '#ff4d6d';
        ctx.font = `${Math.round(s * 4.2)}px monospace`;
        ctx.fillText('♥', w * 0.46, h * 0.38);
        ctx.fillText('♥', w * 0.53, h * 0.28);
      }
    }
  ];

  function show() {
    if (Game.clearScene) Game.clearScene();
    const stage = document.getElementById('stage');
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');

    const s = document.createElement('div');
    s.className = 'scene center-col';
    s.style.justifyContent = 'flex-start';
    s.style.paddingTop = '10px';
    s.style.overflowY = 'auto';
    s.style.webkitOverflowScrolling = 'touch';

    s.innerHTML = `
      <h2 style="color:var(--yellow);margin-bottom:12px">GALERIE DE SOUVENIRS</h2>
      <div class="album-grid" id="album-grid"></div>
      <button type="button" class="btn ghost" id="album-back" style="margin-top:16px;margin-bottom:16px;width:100%;max-width:280px">◄ RETOUR</button>
    `;
    stage.appendChild(s);

    const grid = s.querySelector('#album-grid');
    SOUVENIRS.forEach((souvenir) => {
      const card = document.createElement('div');
      card.className = 'album-card';
      card.innerHTML = `
        <div class="album-canvas-box"></div>
        <div class="album-title">${souvenir.title}</div>
      `;
      grid.appendChild(card);

      const cvBox = card.querySelector('.album-canvas-box');
      const cvApi = makeCanvas(cvBox);
      souvenir.draw(cvApi.ctx, cvApi.w, cvApi.h);
    });

    const backBtn = s.querySelector('#album-back');
    let backFired = false;
    function goBack(e) {
      if (backFired) return;
      backFired = true;
      if (e && e.preventDefault) e.preventDefault();
      Sfx.play('click');
      Game.showTitle();
    }
    backBtn.addEventListener('pointerdown', goBack);
    backBtn.addEventListener('click', goBack);
  }

  const api = { show, SOUVENIRS };
  window.Album = api;
  return api;
})();
