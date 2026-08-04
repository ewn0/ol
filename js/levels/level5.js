/* ============================================================
   NIVEAU 5 — LE VOYAGE JUSQU'À LILLE
   Course type "dino" : tape pour sauter, avance jusqu'au beffroi.
   ============================================================ */

Game.register((() => {

  /* ---- Textes ---- */
  const T = {
    intro: [
      "Petit problème logistique : je ne suis pas encore à Lille.",
      "Il faut y aller à pied.",
      "Tape pour sauter les obstacles.",
    ],
    boum:    ['Aïe', 'Travaux', 'Déviation', 'Bouchon', 'Encore un plot'],
    route:   ['Ça avance', 'Panneau : Lille', 'Plus que quelques km', 'On sent le Nord'],
    arrivee: 'LILLE !',
    win:  "Arrivé à Lille.\nÀ pied, mais arrivé.\nIl reste un dernier niveau.",
    lose: "Perdu quelque part sur la route.\nLe GPS a dit \"recalcul\".\nOn repart.",
  };

  /* ---- Réglages ---- */
  const DUREE = 22;          // secondes pour arriver
  const VITESSE = 6.8;       // % de trajet par seconde (accéléré pour que ce soit moins long)
  const STUMBLE = 0.8;       // secondes bloquées après une collision
  const G = 1500;            // gravité du saut (plus bas = saut plus flottant)
  const IMPULSION = 760;     // hauteur du saut
  const VITESSE_ROUTE = 230; // défilement du décor en px/s
  const ECART = 1.3;         // secondes minimum entre deux plots
  const BUFFER = 0.20;       // tolérance si on tape juste avant d'atterrir

  function start(root, api) {
    root.innerHTML = `
      <div class="statusbar">
        <span>Route vers Lille : <b id="l5-dist">0</b>%</span>
        <span>Temps : <b id="l5-time">${DUREE}</b>s</span>
      </div>
      <div class="meter"><span id="l5-fill"></span></div>
      <div class="playfield" id="l5-field"></div>
      <div class="statusbar"><span class="muted">tape n'importe où pour sauter</span></div>
    `;

    const field = root.querySelector('#l5-field');
    const distEl = root.querySelector('#l5-dist');
    const timeEl = root.querySelector('#l5-time');
    const fill = root.querySelector('#l5-fill');
    field.style.touchAction = 'none';

    const cv = makeCanvas(field);
    api.onCleanup(() => cv.destroy());

    let distance = 0;
    let y = 0, vy = 0;        // hauteur du saut (0 = au sol)
    let stumble = 0;
    let arrive = false, finTimer = 0;
    let spawn = 1.6;
    let scroll = 0;
    let blabla = 3;
    let buffer = 0;
    const plots = [];

    function saute() {
      if (arrive) return;
      if (y === 0) { vy = -IMPULSION; api.sfx('jump'); buffer = 0; }
      else buffer = BUFFER;   // appui anticipé : le saut part dès l'atterrissage
    }
    const onDown = e => { e.preventDefault(); saute(); };
    const onKey = e => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); saute(); } };
    field.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    api.onCleanup(() => {
      field.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    });

    api.loop((dt, total) => {
      const scale = Math.max(2, Math.floor(cv.w / 72));
      const solY = cv.h * 0.80;
      const spP = Sprites.size('player');
      const spC = Sprites.size('cone');
      const playerX = cv.w * 0.22;
      const pw = spP.w * scale;
      const cScale = Math.max(2, scale - 1);          // plots un peu plus petits que le joueur
      const cw = spC.w * cScale, ch = spC.h * cScale;

      const restant = Math.max(0, DUREE - total);
      timeEl.textContent = Math.ceil(restant);

      // Saut
      if (buffer > 0) buffer -= dt;
      if (y < 0 || vy !== 0) {
        vy += G * dt;
        y += vy * dt;
        if (y >= 0) {
          y = 0; vy = 0;
          if (buffer > 0) { vy = -IMPULSION; buffer = 0; api.sfx('jump'); }
        }
      }

      if (!arrive) {
        // Avancée
        if (stumble > 0) stumble -= dt;
        else distance = Math.min(100, distance + VITESSE * dt);

        const vitessePx = stumble > 0 ? 40 : VITESSE_ROUTE;
        scroll += vitessePx * dt;

        // Obstacles
        spawn -= dt;
        if (spawn <= 0 && distance < 96) {
          spawn = ECART + Math.random() * 1.2;
          plots.push({ x: cv.w + 20 });
        }
        for (let i = plots.length - 1; i >= 0; i--) {
          const p = plots[i];
          p.x -= vitessePx * dt;
          if (p.x < -60) { plots.splice(i, 1); continue; }

          // Collision (boîtes volontairement plus petites que les sprites)
          const px1 = playerX - pw * 0.28, px2 = playerX + pw * 0.28;
          const py2 = solY + y;                 // pieds du joueur
          if (p.x + cw * 0.8 > px1 && p.x + cw * 0.2 < px2 && py2 > solY - ch + 6 && stumble <= 0) {
            stumble = STUMBLE;
            api.sfx('bad');
            api.shake(field);
            api.floater(pick(T.boum), field);
          }
        }

        blabla -= dt;
        if (blabla <= 0) { blabla = 4 + Math.random() * 3; api.floater(pick(T.route), field); }

        if (distance >= 100) { arrive = true; finTimer = 2; api.sfx('win'); api.floater(T.arrivee, field); }
        else if (restant <= 0) { api.lose(T.lose); return; }
      } else {
        finTimer -= dt;
        scroll += 60 * dt;
        if (finTimer <= 0) { api.win(T.win); return; }
      }

      distEl.textContent = Math.floor(distance);
      fill.style.width = distance + '%';

      draw(scale, cScale, solY, playerX, spP, spC, total);
    });

    function draw(scale, cScale, solY, playerX, spP, spC, t) {
      const { ctx, w, h } = cv;

      // Ciel
      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      // Collines lointaines (parallaxe)
      ctx.fillStyle = '#1d1b46';
      const offset = (scroll * 0.25) % 120;
      for (let x = -offset; x < w + 120; x += 120) {
        ctx.fillRect(x, solY - 46, 60, 46);
        ctx.fillRect(x + 20, solY - 62, 24, 62);
      }

      // Le beffroi qui approche sur la fin
      if (distance > 55) {
        const spB = Sprites.size('beffroi');
        const k = (distance - 55) / 45;                 // 0 → 1
        const bScale = Math.max(2, scale * (0.6 + k * 1.1));
        const bx = w * (1.05 - k * 0.55);
        Sprites.draw(ctx, 'beffroi', bx, solY - spB.h * bScale, bScale);
      }

      // Route
      ctx.fillStyle = '#232150';
      ctx.fillRect(0, solY, w, h - solY);
      ctx.fillStyle = '#3a3780';
      ctx.fillRect(0, solY, w, 3);
      ctx.fillStyle = '#ffd23f';
      const dash = (scroll % 60);
      for (let x = -dash; x < w; x += 60) ctx.fillRect(x, solY + (h - solY) * 0.45, 26, 3);

      // Plots
      plots.forEach(p => Sprites.draw(ctx, 'cone', p.x, solY - spC.h * cScale, cScale));

      // Joueur (petit rebond de course quand il est au sol)
      const course = (y === 0 && !arrive) ? Math.abs(Math.sin(t * 12)) * scale : 0;
      Sprites.draw(ctx, 'player', playerX - (spP.w * scale) / 2, solY - spP.h * scale + y - course, scale);
    }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  }

  return { id: 5, title: 'LE VOYAGE JUSQU\'À LILLE', intro: T.intro, start };
})());
