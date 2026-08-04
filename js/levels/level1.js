/* ============================================================
   NIVEAU 1 — FAIS-LE TAIRE
   Le type à la casquette écoute du Jul. Fais baisser le volume.
   ============================================================ */

Game.register((() => {

  /* ---- Textes (à retoucher librement) ---- */
  const T = {
    intro: [
      "Souviens-toi : le parc, la table d'à côté, notre super voisin de table.",
      "Et surtout la musique.",
      "Cette fois, on a une solution : appuie sur SHHH.",
    ],
    taunts: [
      'JUUUUL',
      'Wesh',
      '« ok ok ok »',
      'Le son monte',
      'Il connaît les paroles',
      'Il refait le refrain',
      'TN qui tapent le rythme',
      'Il augmente exprès',
      'Casquette en mode DJ',
      'Il regarde par ici',
    ],
    win: "Silence.\nLe parc est à nous.\nIl est parti écouter ça ailleurs.",
    lose: "Il a mis le refrain.\nTout le parc a entendu.\nOn recommence.",
  };

  /* ---- Réglages ---- */
  const DUREE = 13;          // secondes à tenir
  const MONTEE_INITIALE = 13; // % par seconde
  const PALIER = 5;          // toutes les X secondes, ça accélère
  const ACCEL = 3.5;         // % par seconde ajoutés à chaque palier
  const BAISSE_PAR_CLIC = 11;

  function start(root, api) {
    root.innerHTML = `
      <div class="statusbar">
        <span>VOLUME DE JUL</span>
        <span>TENIR : <b id="l1-time">${DUREE}</b>s</span>
      </div>
      <div class="meter" id="l1-meter"><span id="l1-fill"></span></div>
      <div class="playfield" id="l1-field"></div>
      <button type="button" class="btn big" id="l1-btn">SHHH !</button>
    `;

    const field  = root.querySelector('#l1-field');
    const fill   = root.querySelector('#l1-fill');
    const meter  = root.querySelector('#l1-meter');
    const timeEl = root.querySelector('#l1-time');
    const btn    = root.querySelector('#l1-btn');

    const cv = makeCanvas(field);
    api.onCleanup(() => cv.destroy());

    let volume = 28;
    let restant = DUREE;
    let taunt = 0;
    const notes = [];

    /* --- Appui : on fait taire --- */
    function shush(e) {
      e.preventDefault();
      volume = Math.max(0, volume - BAISSE_PAR_CLIC);
      api.sfx('shh');
    }
    btn.addEventListener('pointerdown', shush);
    api.onCleanup(() => btn.removeEventListener('pointerdown', shush));

    api.loop((dt, total) => {
      // Le volume grimpe, de plus en plus vite
      const vitesse = MONTEE_INITIALE + Math.floor(total / PALIER) * ACCEL;
      volume += vitesse * dt;

      restant = Math.max(0, DUREE - total);
      timeEl.textContent = Math.ceil(restant);

      fill.style.width = Math.min(100, volume) + '%';
      meter.classList.toggle('warn', volume > 45 && volume <= 75);
      meter.classList.toggle('hot', volume > 75);

      // Petites piques aléatoires
      taunt -= dt;
      if (taunt <= 0) {
        taunt = 2 + Math.random() * 2.5;
        api.floater(T.taunts[Math.floor(Math.random() * T.taunts.length)], field);
      }

      // Notes de musique qui s'échappent, d'autant plus qu'il est fort
      if (Math.random() < volume / 900) {
        notes.push({ x: cv.w * 0.5 + (Math.random() * 60 - 30), y: cv.h * 0.45, v: 20 + Math.random() * 30, a: 1 });
      }

      drawScene(total, volume);

      if (volume >= 100) api.lose(T.lose);
      else if (restant <= 0) api.win(T.win);
    });

    function drawScene(t, vol) {
      const { ctx, w, h } = cv;

      // Fond : herbe du parc
      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1c3a24';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      ctx.fillStyle = '#25502f';
      for (let x = 0; x < w; x += 12) {
        ctx.fillRect(x, h * 0.72 - 3, 6, 3);
      }

      // La fameuse table du parc
      const scale = Math.max(3, Math.floor(Math.min(w / 26, h / 30)));
      const sp = Sprites.size('kassos');
      const cx = w / 2;
      const bob = Math.sin(t * 6) * scale * 0.5;   // il hoche la tête en rythme
      const top = h * 0.70 - sp.h * scale + bob;

      ctx.fillStyle = '#5b4630';
      ctx.fillRect(cx - sp.w * scale * 0.9, h * 0.70, sp.w * scale * 1.8, scale * 2);
      ctx.fillStyle = '#3d2f20';
      ctx.fillRect(cx - sp.w * scale * 0.7, h * 0.70 + scale * 2, scale * 2, scale * 4);
      ctx.fillRect(cx + sp.w * scale * 0.7 - scale * 2, h * 0.70 + scale * 2, scale * 2, scale * 4);

      Sprites.draw(ctx, 'kassos', cx - (sp.w * scale) / 2, top, scale);

      // Enceinte bluetooth posée à côté
      const bx = cx + sp.w * scale * 0.75;
      const by = h * 0.70 - scale * 5;
      ctx.fillStyle = '#23213f';
      ctx.fillRect(bx, by, scale * 5, scale * 5);
      ctx.fillStyle = vol > 70 ? '#ff4d6d' : '#8f5cff';
      ctx.fillRect(bx + scale, by + scale, scale * 3, scale * 3);

      // Notes qui montent
      ctx.font = `${Math.round(scale * 3)}px monospace`;
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.y -= n.v * 0.016;
        n.a -= 0.012;
        if (n.a <= 0) { notes.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, n.a);
        ctx.fillStyle = '#ffd23f';
        ctx.fillText('♪', n.x, n.y);
        ctx.globalAlpha = 1;
      }
    }
  }

  return { id: 1, title: 'FAIS-LE TAIRE', intro: T.intro, start };
})());
