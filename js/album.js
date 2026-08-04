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

        // 2. Façade de restaurant en terrasse
        ctx.fillStyle = '#e2d5c3';
        ctx.fillRect(0, h * 0.1, w * 0.85, h * 0.35);
        ctx.fillStyle = '#ff4d6d'; // Store/Banne de terrasse
        ctx.fillRect(0, h * 0.28, w * 0.9, h * 0.08);

        // Fenêtres du restaurant
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.1, h * 0.14, w * 0.2, h * 0.12);
        ctx.fillRect(w * 0.4, h * 0.14, w * 0.2, h * 0.12);

        // 3. Trottoir de terrasse en ville (Pavés gris)
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, h * 0.45, w, h * 0.55);
        ctx.fillStyle = '#95a5a6';
        for (let x = 0; x < w; x += 16) ctx.fillRect(x, h * 0.45 + 2, 8, h * 0.55);

        // 4. Personnages assis à la terrasse (dessinés sous la table)
        Sprites.drawCentered(ctx, 'player', w * 0.28, h * 0.46, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.74, h * 0.46, scale);

        // 5. Table de terrasse en bois devant les personnages
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(w * 0.18, h * 0.56, w * 0.64, h * 0.28);
        ctx.fillStyle = '#a05a2c';
        ctx.fillRect(w * 0.18, h * 0.56, w * 0.64, 4);

        // Plats de sushis sur la table
        Sprites.drawCentered(ctx, 'maki', w * 0.36, h * 0.62, scale);
        Sprites.drawCentered(ctx, 'nigiri', w * 0.50, h * 0.62, scale);
        Sprites.drawCentered(ctx, 'avocado', w * 0.64, h * 0.62, scale);

        // Cœur rose au-dessus
        ctx.fillStyle = '#ff4d6d';
        ctx.font = `${Math.round(scale * 4)}px monospace`;
        ctx.fillText('♥', w * 0.48, h * 0.32);
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

        // 1. Vue extérieure de jour par le pare-brise
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h * 0.52);

        // Soleil radieux
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.18, w * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Arbres et paysage
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(w * 0.05, h * 0.25, w * 0.22, h * 0.27);
        ctx.fillRect(w * 0.73, h * 0.22, w * 0.22, h * 0.30);

        // Route grise au milieu
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(w * 0.27, h * 0.35, w * 0.46, h * 0.17);

        // 2. Dossiers des sièges de voiture
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(w * 0.18, h * 0.38, w * 0.28, h * 0.24); // Siège conducteur
        ctx.fillRect(w * 0.54, h * 0.38, w * 0.28, h * 0.24); // Siège passager

        // Appuis-tête
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(w * 0.24, h * 0.32, w * 0.16, h * 0.07);
        ctx.fillRect(w * 0.60, h * 0.32, w * 0.16, h * 0.07);

        // 3. Bustes des personnages assis dans les sièges (Masquage rigide pour couper TOUTES les jambes !)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w, h * 0.50); // Couper strictement à y = h * 0.50
        ctx.clip();
        Sprites.drawCentered(ctx, 'player', w * 0.32, h * 0.42, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.68, h * 0.42, scale);
        ctx.restore();

        // 4. Tableau de bord (recouvre la moitié inférieure)
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, h * 0.50, w, h * 0.50);

        // Volant devant le conducteur
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w * 0.32, h * 0.56, scale * 4.8, 0, Math.PI * 2);
        ctx.stroke();

        // Écran autoradio
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(w * 0.45, h * 0.56, w * 0.10, h * 0.18);
        ctx.fillStyle = '#35d6ed';
        ctx.fillRect(w * 0.46, h * 0.58, w * 0.08, h * 0.06);

        // Piliers et toit du pare-brise
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(0, 0, w * 0.10, h);
        ctx.fillRect(w * 0.90, 0, w * 0.10, h);
        ctx.fillRect(0, 0, w, h * 0.10);

        // Rétroviseur intérieur
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.46, h * 0.10, w * 0.08, h * 0.07);
      }
    },
    {
      id: 'bisou',
      title: 'Premier baiser',
      draw(ctx, w, h) {
        const s = Math.max(2, Math.floor(w / 65));

        // 1. Ciel bleu de jour
        ctx.fillStyle = '#70d6ff';
        ctx.fillRect(0, 0, w, h);

        // 2. Soleil radieux
        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(w * 0.82, h * 0.18, w * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 3. Immeuble de ville
        ctx.fillStyle = '#d5dbdb';
        ctx.fillRect(w * 0.1, h * 0.12, w * 0.8, h * 0.36);
        ctx.fillStyle = '#aed6f1'; // Vitrines
        ctx.fillRect(w * 0.18, h * 0.20, w * 0.28, h * 0.20);
        ctx.fillRect(w * 0.54, h * 0.20, w * 0.28, h * 0.20);

        // 4. Trottoir de ville en béton
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(0, h * 0.48, w, h * 0.35);
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(0, h * 0.48, w, 4); // Bordure
        ctx.fillStyle = '#34495e';       // Chaussée
        ctx.fillRect(0, h * 0.83, w, h * 0.17);

        // 5. Lampadaire de ville sur le trottoir
        ctx.fillStyle = '#34495e';
        ctx.fillRect(w * 0.84, h * 0.18, scale(w) * 1.5, h * 0.30);

        // 6. PERSONNAGES SUR LE TROTTOIR
        Sprites.drawCentered(ctx, 'player', w * 0.44, h * 0.46, s);
        Sprites.drawCentered(ctx, 'elise', w * 0.54, h * 0.46, s);

        // 7. Cœurs rouges de jour
        ctx.fillStyle = '#ff4d6d';
        ctx.font = `${Math.round(s * 4.2)}px monospace`;
        ctx.fillText('♥', w * 0.46, h * 0.30);
        ctx.fillText('♥', w * 0.53, h * 0.22);
      }
    }
  ];

  function scale(w) { return Math.max(2, Math.floor(w / 70)); }

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
