/* ============================================================
   NIVEAU 4 — SUSHI RUSH
   Les sushis volent. Tape dessus. Évite le wasabi. Et évite l'autre.
   ============================================================ */

Game.register((() => {

  /* ---- Textes ---- */
  const T = {
    intro: [
      "Retour au resto : les sushis arrivent, mais ils volent.",
      "Tape sur les sushis. Pas sur le wasabi.",
      "Et si tu vois une casquette passer : ne touche pas.",
    ],
    combo:  ['Miam', 'Encore', 'Bien vu', 'Ça glisse', 'Chef !'],
    wasabi: ['WASABI !', 'Les yeux !', 'Ça pique', 'Mauvaise pioche'],
    kassos: ['Pas lui !', 'Il est revenu', 'Wesh', 'Il squatte encore'],
    win:  "{X} sushis avalés.\nAddition réglée.\nOn remet ça, mais à Lille.",
    lose: "{X} sushis seulement.\nLe wasabi a gagné cette manche.\nOn y retourne.",
  };

  /* ---- Réglages ---- */
  const DUREE = 26;
  const OBJECTIF = 15;
  const G = 950;              // gravité
  const SPAWN_INIT = 0.75;    // secondes entre deux lancers
  const SPAWN_MIN = 0.32;
  const PENALITE_WASABI = 2;
  const PENALITE_KASSOS = 1;

  const SUSHIS = ['maki', 'nigiri', 'avocado'];

  function start(root, api) {
    root.innerHTML = `
      <div class="statusbar">
        <span>Sushis : <b id="l4-score">0</b>/${OBJECTIF}</span>
        <span>Temps : <b id="l4-time">${DUREE}</b>s</span>
      </div>
      <div class="playfield" id="l4-field"></div>
      <div class="statusbar"><span class="muted">tape sur les sushis — pas sur le reste</span></div>
    `;

    const field = root.querySelector('#l4-field');
    const scoreEl = root.querySelector('#l4-score');
    const timeEl = root.querySelector('#l4-time');
    field.style.touchAction = 'none';

    const cv = makeCanvas(field);
    api.onCleanup(() => cv.destroy());

    const objets = [];
    let score = 0;
    let spawn = 0.4;

    /* --- Découpe : simple tap OU glissé du doigt façon fruit ninja --- */
    const trace = [];            // points récents, pour la traînée à l'écran
    let coupe = false;
    let dernier = null;

    function pos(e) {
      const r = cv.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    // Tranche ce qui se trouve au point donné
    function touche(x, y) {
      for (let i = objets.length - 1; i >= 0; i--) {
        const o = objets[i];
        if (o.mort) continue;
        const dx = x - o.x, dy = y - o.y;
        if (dx * dx + dy * dy > o.r * o.r) continue;

        if (o.type === 'wasabi') {
          score = Math.max(0, score - PENALITE_WASABI);
          api.sfx('bad');
          api.shake(field);
          api.floater(pick(T.wasabi), field);
        } else if (o.type === 'kassos') {
          score = Math.max(0, score - PENALITE_KASSOS);
          api.sfx('bad');
          api.floater(pick(T.kassos), field);
        } else {
          score++;
          api.sfx('coin');
          if (Math.random() < 0.4) api.floater(pick(T.combo), field);
        }
        o.mort = true;
        o.vy = -80;
        scoreEl.textContent = score;
        return;
      }
    }

    // Le doigt va vite : on teste tout le segment, pas juste le point d'arrivée
    function trancheSegment(a, b) {
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const pas = Math.min(40, Math.max(1, Math.ceil(d / 9)));
      for (let k = 0; k <= pas; k++) {
        touche(a.x + (b.x - a.x) * k / pas, a.y + (b.y - a.y) * k / pas);
      }
    }

    function debut(p, e) {
      coupe = true;
      dernier = p;
      trace.length = 0;
      trace.push({ x: p.x, y: p.y, t: performance.now() });
      touche(p.x, p.y);
      if (e && e.pointerId !== undefined && field.setPointerCapture) {
        try { field.setPointerCapture(e.pointerId); } catch (err) {}
      }
    }

    function glisse(p) {
      if (!coupe || !dernier) return;
      trancheSegment(dernier, p);
      dernier = p;
      trace.push({ x: p.x, y: p.y, t: performance.now() });
    }

    const onDown  = e => { e.preventDefault(); debut(pos(e), e); };
    const onMove  = e => { if (coupe) glisse(pos(e)); };
    const onUp    = () => { coupe = false; dernier = null; };
    const onTDown = e => { if (e.touches[0]) debut(pos(e.touches[0])); };
    const onTMove = e => { if (e.touches[0]) glisse(pos(e.touches[0])); };

    field.addEventListener('pointerdown', onDown);
    field.addEventListener('pointermove', onMove);
    field.addEventListener('touchstart', onTDown, { passive: true });
    field.addEventListener('touchmove', onTMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('touchend', onUp);
    api.onCleanup(() => {
      field.removeEventListener('pointerdown', onDown);
      field.removeEventListener('pointermove', onMove);
      field.removeEventListener('touchstart', onTDown);
      field.removeEventListener('touchmove', onTMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('touchend', onUp);
    });

    /* --- Lancer un objet --- */
    function lance(total) {
      const r = Math.random();
      let type;
      if (r < 0.14) type = 'wasabi';
      else if (r < 0.22) type = 'kassos';
      else type = SUSHIS[Math.floor(Math.random() * SUSHIS.length)];

      const scale = echelle();
      const sp = Sprites.size(type);
      const depuisGauche = Math.random() < 0.5;
      const hauteur = cv.h * (0.5 + Math.random() * 0.35);

      objets.push({
        type,
        x: depuisGauche ? cv.w * (0.1 + Math.random() * 0.3) : cv.w * (0.6 + Math.random() * 0.3),
        y: cv.h + 30,
        vx: (depuisGauche ? 1 : -1) * (30 + Math.random() * 90),
        vy: -Math.sqrt(2 * G * hauteur),
        rot: 0,
        vrot: (Math.random() - 0.5) * 4,
        r: Math.max(sp.w, sp.h) * scale * 0.62,
        sp, scale,
        mort: false,
      });
    }

    function echelle() { return Math.max(2, Math.floor(cv.w / 80)); }

    api.loop((dt, total) => {
      const restant = Math.max(0, DUREE - total);
      timeEl.textContent = Math.ceil(restant);

      spawn -= dt;
      if (spawn <= 0) {
        const cadence = Math.max(SPAWN_MIN, SPAWN_INIT - total * 0.016);
        spawn = cadence * (0.75 + Math.random() * 0.5);
        lance(total);
        if (total > 8 && Math.random() < 0.3) lance(total); // petites rafales
      }

      for (let i = objets.length - 1; i >= 0; i--) {
        const o = objets[i];
        o.vy += G * dt;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.rot += o.vrot * dt;
        if (o.y > cv.h + 80) objets.splice(i, 1);
      }

      draw();

      if (restant <= 0) {
        const msg = (score >= OBJECTIF ? T.win : T.lose).replace('{X}', score);
        if (score >= OBJECTIF) api.win(msg); else api.lose(msg);
      }
    });

    function draw() {
      const { ctx, w, h } = cv;
      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      // Tapis roulant décoratif en bas
      ctx.fillStyle = '#1b1940';
      ctx.fillRect(0, h - 10, w, 10);
      ctx.fillStyle = '#2b2a63';
      for (let x = (performance.now() / 22) % 24 - 24; x < w; x += 24) {
        ctx.fillRect(x, h - 10, 12, 10);
      }

      objets.forEach(o => {
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(o.rot);
        if (o.mort) ctx.globalAlpha = 0.4;
        Sprites.draw(ctx, o.type, -(o.sp.w * o.scale) / 2, -(o.sp.h * o.scale) / 2, o.scale);
        ctx.restore();
      });

      // Traînée du doigt
      const now = performance.now();
      while (trace.length && now - trace[0].t > 200) trace.shift();
      if (trace.length > 1) {
        ctx.strokeStyle = '#35d6ed';
        ctx.lineWidth = 4;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(trace[0].x, trace[0].y);
        for (let i = 1; i < trace.length; i++) ctx.lineTo(trace[i].x, trace[i].y);
        ctx.stroke();
      }
    }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  }

  return { id: 4, title: 'SUSHI RUSH', intro: T.intro, start };
})());
