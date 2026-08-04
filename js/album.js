/* ============================================================
   ALBUM SOUVENIRS — Galerie d'illustrations Pixel Art débloquables.
   4 souvenirs : Sushis, Table du parc, Voiture, Premier bisou.
   ============================================================ */

const Album = (() => {

  const SOUVENIRS = [
    {
      id: 'sushis',
      title: '1. Le resto de Sushis',
      caption: 'Les sushis volants et les fous rires à table.',
      draw(ctx, w, h) {
        ctx.fillStyle = '#2d182b';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4a253b';
        ctx.fillRect(0, h * 0.65, w, h * 0.35);

        ctx.fillStyle = '#7a4228';
        ctx.fillRect(w * 0.15, h * 0.55, w * 0.7, h * 0.3);

        const scale = Math.max(2, Math.floor(w / 70));
        Sprites.drawCentered(ctx, 'maki', w * 0.35, h * 0.62, scale);
        Sprites.drawCentered(ctx, 'nigiri', w * 0.50, h * 0.62, scale);
        Sprites.drawCentered(ctx, 'avocado', w * 0.65, h * 0.62, scale);

        Sprites.drawCentered(ctx, 'player', w * 0.30, h * 0.40, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.70, h * 0.40, scale);

        ctx.fillStyle = '#ff4d6d';
        ctx.font = `${Math.round(scale * 4)}px monospace`;
        ctx.fillText('♥', w * 0.48, h * 0.35);
      }
    },
    {
      id: 'parc',
      title: '2. La table dans le Parc',
      caption: "Le fameux rendez-vous du parc avec le voisin casquette.",
      draw(ctx, w, h) {
        ctx.fillStyle = '#100e26';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1c3a24';
        ctx.fillRect(0, h * 0.5, w, h * 0.5);

        ctx.fillStyle = '#25502f';
        ctx.fillRect(w * 0.1, h * 0.2, w * 0.25, h * 0.35);
        ctx.fillRect(w * 0.65, h * 0.15, w * 0.25, h * 0.4);

        const scale = Math.max(2, Math.floor(w / 70));
        ctx.fillStyle = '#5b4630';
        ctx.fillRect(w * 0.25, h * 0.6, w * 0.5, scale * 3);

        Sprites.drawCentered(ctx, 'player', w * 0.32, h * 0.48, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.68, h * 0.48, scale);

        Sprites.drawCentered(ctx, 'kassos', w * 0.12, h * 0.45, scale * 0.8);
      }
    },
    {
      id: 'voiture',
      title: '3. Discussion dans la Voiture',
      caption: 'Les trajets de nuit à parler pendant des heures sans voir le temps passer.',
      draw(ctx, w, h) {
        ctx.fillStyle = '#0a0918';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(w * 0.2, h * 0.15, 2, 2);
        ctx.fillRect(w * 0.5, h * 0.1, 3, 3);
        ctx.fillRect(w * 0.8, h * 0.2, 2, 2);

        ctx.fillStyle = '#1c1a36';
        ctx.fillRect(0, h * 0.55, w, h * 0.45);
        ctx.fillStyle = '#35d6ed';
        ctx.fillRect(w * 0.42, h * 0.65, w * 0.16, h * 0.1);

        const scale = Math.max(2, Math.floor(w / 70));
        Sprites.drawCentered(ctx, 'player', w * 0.30, h * 0.50, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.70, h * 0.50, scale);

        ctx.strokeStyle = '#3a3780';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(w * 0.30, h * 0.62, scale * 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
    {
      id: 'bisou',
      title: '4. Premier Bisou Dehors',
      caption: 'Un moment magique sous les lampadaires et les étoiles.',
      draw(ctx, w, h) {
        ctx.fillStyle = '#0e0b24';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#1e1a40';
        ctx.fillRect(0, h * 0.75, w, h * 0.25);

        const s = Math.max(2, Math.floor(w / 65));
        ctx.fillStyle = '#3a3780';
        ctx.fillRect(w * 0.8, h * 0.3, s * 2, h * 0.45);
        ctx.fillStyle = 'rgba(255, 210, 63, 0.25)';
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.3, w * 0.25, 0, Math.PI * 2);
        ctx.fill();

        Sprites.drawCentered(ctx, 'player', w * 0.44, h * 0.62, s);
        Sprites.drawCentered(ctx, 'elise', w * 0.54, h * 0.62, s);

        ctx.fillStyle = '#ff4d6d';
        ctx.font = `${Math.round(s * 4)}px monospace`;
        ctx.fillText('♥', w * 0.46, h * 0.42);
        ctx.fillText('♥', w * 0.52, h * 0.35);
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

    s.innerHTML = `
      <h2 style="color:var(--yellow);margin-bottom:8px">GALERIE DE SOUVENIRS</h2>
      <div class="album-grid" id="album-grid"></div>
      <button type="button" class="btn ghost" id="album-back" style="margin-top:14px;margin-bottom:14px;width:100%;max-width:280px">◄ RETOUR</button>
    `;
    stage.appendChild(s);

    const grid = s.querySelector('#album-grid');
    SOUVENIRS.forEach((souvenir) => {
      const card = document.createElement('div');
      card.className = 'album-card';
      card.innerHTML = `
        <div class="album-canvas-box"></div>
        <div class="album-title">${souvenir.title}</div>
        <div class="album-caption">${souvenir.caption}</div>
      `;
      grid.appendChild(card);

      const cvBox = card.querySelector('.album-canvas-box');
      const cvApi = makeCanvas(cvBox);
      souvenir.draw(cvApi.ctx, cvApi.w, cvApi.h);
    });

    s.querySelector('#album-back').addEventListener('click', () => {
      Sfx.play('click');
      Game.showTitle();
    });
  }

  return { show, SOUVENIRS };
})();
