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

        // 1. Ciel bleu de jour
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h * 0.45);

        // 2. Façade de ville / Restaurant en arrière-plan
        ctx.fillStyle = '#e2d5c3';
        ctx.fillRect(0, h * 0.1, w * 0.85, h * 0.45);
        ctx.fillStyle = '#ff4d6d'; // Store/Banne de terrasse
        ctx.fillRect(0, h * 0.28, w * 0.9, h * 0.08);

        // Fenêtres du restaurant
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.1, h * 0.14, w * 0.2, h * 0.12);
        ctx.fillRect(w * 0.4, h * 0.14, w * 0.2, h * 0.12);

        // 3. Trottoir de terrasse en ville (Pavés gris)
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, h * 0.52, w, h * 0.48);
        ctx.fillStyle = '#95a5a6';
        for (let x = 0; x < w; x += 16) ctx.fillRect(x, h * 0.52 + 2, 8, h * 0.48);

        // 4. Table de terrasse en bois
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(w * 0.18, h * 0.60, w * 0.64, h * 0.28);
        ctx.fillStyle = '#a05a2c';
        ctx.fillRect(w * 0.18, h * 0.60, w * 0.64, 4);

        // Plats de sushis sur la table
        Sprites.drawCentered(ctx, 'maki', w * 0.36, h * 0.66, scale);
        Sprites.drawCentered(ctx, 'nigiri', w * 0.50, h * 0.66, scale);
        Sprites.drawCentered(ctx, 'avocado', w * 0.64, h * 0.66, scale);

        // Personnages assis à la terrasse
        Sprites.drawCentered(ctx, 'player', w * 0.26, h * 0.46, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.74, h * 0.46, scale);

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

        // 1. Paysage de jour vu par le pare-brise
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h * 0.55);

        // Soleil et arbres défilant
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.2, w * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(w * 0.05, h * 0.25, w * 0.25, h * 0.3);
        ctx.fillRect(w * 0.70, h * 0.22, w * 0.25, h * 0.33);

        // Route grise
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(w * 0.3, h * 0.35, w * 0.4, h * 0.2);

        // 2. Habitacle de la voiture (Piliers & pare-brise)
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(0, 0, w * 0.12, h);        // Pilier gauche
        ctx.fillRect(w * 0.88, 0, w * 0.12, h);  // Pilier droit
        ctx.fillRect(0, 0, w, h * 0.12);       // Toit

        // Rétroviseur
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.46, h * 0.12, w * 0.08, h * 0.08);

        // 3. Sièges de voiture (dossiers vus de derrière)
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(w * 0.18, h * 0.45, w * 0.28, h * 0.55); // Siège conducteur
        ctx.fillRect(w * 0.54, h * 0.45, w * 0.28, h * 0.55); // Siège passager

        // Appuis-tête
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(w * 0.24, h * 0.38, w * 0.16, h * 0.08);
        ctx.fillRect(w * 0.60, h * 0.38, w * 0.16, h * 0.08);

        // Tableau de bord (couvre le bas du corps, AUCUNE jambe visible !)
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, h * 0.58, w, h * 0.42);

        // Têtes / Bustes des personnages assis dans les sièges
        // Seul le haut du torse et la tête émergent au-dessus du tableau de bord !
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h * 0.60); // Masque pour couper au tableau de bord
        ctx.clip();
        Sprites.drawCentered(ctx, 'player', w * 0.32, h * 0.54, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.68, h * 0.54, scale);
        ctx.restore();

        // Volant devant le conducteur
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w * 0.32, h * 0.62, scale * 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    {
      id: 'bisou',
      title: 'Premier baiser',
      draw(ctx, w, h) {
        const s = Math.max(2, Math.floor(w / 65));

        // Ciel bleu de jour
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h);

        // Soleil radieux
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(w * 0.82, h * 0.18, w * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Immeuble / Bâtiment de ville en arrière-plan
        ctx.fillStyle = '#d5dbdb';
        ctx.fillRect(w * 0.1, h * 0.15, w * 0.8, h * 0.55);
        ctx.fillStyle = '#aed6f1'; // Vitrine de boutique
        ctx.fillRect(w * 0.18, h * 0.28, w * 0.3, h * 0.3);
        ctx.fillRect(w * 0.54, h * 0.28, w * 0.3, h * 0.3);

        // Trottoir de ville en béton (Pas d'herbe !)
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, h * 0.70, w, h * 0.30);
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(0, h * 0.70, w, 4); // Bordure de trottoir
        ctx.fillStyle = '#34495e';       // Chaussée/Asphalte au premier plan
        ctx.fillRect(0, h * 0.88, w, h * 0.12);

        // Lampadaire de ville
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.85, h * 0.25, scale(w) * 1.5, h * 0.45);

        // Personnages qui s'embrassent sur le trottoir
        Sprites.drawCentered(ctx, 'player', w * 0.44, h * 0.58, s);
        Sprites.drawCentered(ctx, 'elise', w * 0.54, h * 0.60, s);

        // Cœurs rouges de jour
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
