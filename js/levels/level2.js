/* ============================================================
   NIVEAU 2 — SAUVE LES CHEVEUX D'ELISE
   Running gag oblige : on rattrape ce qui tombe.
   ============================================================ */

Game.register((() => {

  /* ---- Textes ---- */
  const T = {
    intro: [
      "Alerte : chute capillaire détectée.",
      "Chaque cheveu compte. Officiellement, il t'en reste encore quelques-uns.",
      "Glisse le doigt pour déplacer la brosse.",
    ],
    bienJoue: ['Sauvé !', 'Récupéré', 'Celui-là comptait', 'Beau réflexe', 'Encore un'],
    rate:     ['Perdu...', 'Adieu', 'Il est parti', 'RIP', 'On dira rien'],
    win:      "Cheveux sauvés : {X}/{N}\nTu peux te recoiffer tranquille.",
    lose:     "Seulement {X}/{N}.\nÇa fait beaucoup de cheveux sur l'oreiller.\nOn retente.",
  };

  /* ---- Réglages ---- */
  const TOTAL = 20;       // cheveux qui tombent
  const OBJECTIF = 15;    // minimum à attraper
  const INTERVALLE = 0.85; // secondes entre deux chutes
  const V_INIT = 130;     // vitesse de chute (px/s)
  const V_ACCEL = 9;      // accélération par seconde

  function start(root, api) {
    root.innerHTML = `
      <div class="statusbar">
        <span>Cheveux sauvés : <b id="l2-score">0</b>/${TOTAL}</span>
        <span>Objectif : <b>${OBJECTIF}</b></span>
      </div>
      <div class="playfield" id="l2-field"></div>
      <div class="statusbar"><span class="muted">↔ glisse le doigt (ou les flèches)</span></div>
    `;

    const field = root.querySelector('#l2-field');
    const scoreEl = root.querySelector('#l2-score');
    field.style.touchAction = 'none';

    const cv = makeCanvas(field);
    api.onCleanup(() => cv.destroy());

    const brushSize = Sprites.size('brush');
    const hairSize = Sprites.size('hair');

    let brushX = cv.w / 2;
    let attrapes = 0, tombes = 0, sortis = 0;
    let timer = 0;
    const hairs = [];
    const keys = {};

    /* --- Contrôles --- */
    function pointAt(clientX) {
      const rect = cv.canvas.getBoundingClientRect();
      brushX = clientX - rect.left;
    }
    const onPointer = e => { pointAt(e.clientX); };
    const onTouch = e => { if (e.touches[0]) pointAt(e.touches[0].clientX); };
    const onKeyDown = e => { keys[e.key] = true; };
    const onKeyUp = e => { keys[e.key] = false; };

    field.addEventListener('pointerdown', onPointer);
    field.addEventListener('pointermove', onPointer);
    field.addEventListener('touchstart', onTouch, { passive: true });
    field.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    api.onCleanup(() => {
      field.removeEventListener('pointerdown', onPointer);
      field.removeEventListener('pointermove', onPointer);
      field.removeEventListener('touchstart', onTouch);
      field.removeEventListener('touchmove', onTouch);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });

    api.loop((dt, total) => {
      const scale = Math.max(2, Math.floor(cv.w / 110));
      const bw = brushSize.w * scale;
      const bh = brushSize.h * scale;
      const by = cv.h - bh - 4;

      // Clavier
      if (keys.ArrowLeft)  brushX -= 320 * dt;
      if (keys.ArrowRight) brushX += 320 * dt;
      brushX = Math.max(bw / 2, Math.min(cv.w - bw / 2, brushX));

      // Apparition des cheveux
      timer -= dt;
      if (timer <= 0 && tombes < TOTAL) {
        timer = INTERVALLE;
        tombes++;
        const marge = hairSize.w * scale;
        hairs.push({
          x: marge + Math.random() * Math.max(1, cv.w - marge * 2),
          y: -20,
          v: V_INIT + total * V_ACCEL + Math.random() * 30,
          wob: Math.random() * 6,
        });
      }

      // Chute + collision
      for (let i = hairs.length - 1; i >= 0; i--) {
        const hr = hairs[i];
        hr.y += hr.v * dt;
        const hx = hr.x + Math.sin((total + hr.wob) * 3) * 10;

        if (hr.y + hairSize.h * scale >= by && hr.y < by + bh) {
          if (Math.abs(hx - brushX) < bw / 2 + hairSize.w * scale * 0.5) {
            hairs.splice(i, 1);
            attrapes++;
            sortis++;
            scoreEl.textContent = attrapes;
            api.sfx('catch');
            if (Math.random() < 0.35) api.floater(pick(T.bienJoue), field);
            continue;
          }
        }
        if (hr.y > cv.h) {
          hairs.splice(i, 1);
          sortis++;
          api.sfx('bad');
          if (Math.random() < 0.5) api.floater(pick(T.rate), field);
        }
      }

      draw(scale, bw, bh, by, total);

      // Fin de manche
      if (tombes >= TOTAL && hairs.length === 0) {
        const msg = (attrapes >= OBJECTIF ? T.win : T.lose)
          .replace('{X}', attrapes).replace('{N}', TOTAL);
        if (attrapes >= OBJECTIF) api.win(msg); else api.lose(msg);
      }
    });

    function draw(scale, bw, bh, by, t) {
      const { ctx, w, h } = cv;

      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      // Sol
      ctx.fillStyle = '#1b1940';
      ctx.fillRect(0, h - 6, w, 6);

      // Cheveux
      hairs.forEach(hr => {
        const hx = hr.x + Math.sin((t + hr.wob) * 3) * 10;
        Sprites.draw(ctx, 'hair', hx - (hairSize.w * scale) / 2, hr.y, scale);
      });

      // Brosse
      Sprites.draw(ctx, 'brush', brushX - bw / 2, by, scale);
    }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  }

  return { id: 2, title: "SAUVE LES CHEVEUX", intro: T.intro, start };
})());
