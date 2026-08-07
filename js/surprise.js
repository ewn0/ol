/* ============================================================
   SURPRISE — petit ciné pour la 2e date (Sacré-Cœur, Paris).
   Se joue automatiquement, une seule fois, à la toute prochaine
   ouverture de l'app — puis plus jamais. Réutilise les mêmes
   briques que la cinématique finale d'Aventure Lille (étoiles,
   confettis, cœurs, fanfare) : voir js/levels/level6.js.
   ============================================================ */

const Surprise = (() => {

  const SEEN_KEY = 'ol_surprise_paris_seen';

  /* ------------------------------------------------------------------
     ▼▼▼ TEXTE À PERSONNALISER ICI (relis-le, change ce que tu veux) ▼▼▼
     Une ligne du tableau = un paragraphe affiché l'un après l'autre.
  ------------------------------------------------------------------ */
  const TITRE = 'EN ROUTE POUR PARIS';
  const MESSAGE = [
    "Aujourd'hui, direction le Sacré-Cœur, avec toi.",
    "J'ai beau avoir écrit ça à l'avance, je sais que je te trouve magnifique — puisque je te trouve tout le temps magnifique.",
    "Ça me rend véritablement heureux d'avoir l'occasion de passer ces moments-là avec toi.",
    "J'espère que cette journée à mes côtés te plaira.",
  ];
  const BOUTON = 'ON Y VA ➔';
  /* ------------------------------------------------------------------ */

  function shouldShow() {
    return localStorage.getItem(SEEN_KEY) !== '1';
  }

  function markShown() {
    localStorage.setItem(SEEN_KEY, '1');
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  function show(onDone) {
    if (!shouldShow()) { onDone(); return; }
    markShown();

    const stage = document.getElementById('stage');
    stage.innerHTML = '';
    const scene = document.createElement('div');
    scene.className = 'scene play';
    scene.innerHTML = `
      <div class="final-wrap">
        <canvas id="confetti"></canvas>
        <div class="final-scroll">
          <div class="center-col" style="gap:12px">
            <h2>${TITRE}</h2>
          </div>
          <div class="final-anim-box" id="surprise-anim-box"></div>
          <div class="panel" style="margin-top:14px">
            <div class="final-msg" id="surprise-msg"></div>
          </div>
          <div style="margin-top:16px" id="surprise-btn-box"></div>
        </div>
      </div>
    `;
    stage.appendChild(scene);
    const root = scene.querySelector('.final-wrap');

    const animBox = root.querySelector('#surprise-anim-box');
    const msgEl = root.querySelector('#surprise-msg');
    const btnBox = root.querySelector('#surprise-btn-box');

    const cvAnim = makeCanvas(animBox);

    const stars = Array.from({ length: 24 }, () => ({
      x: Math.random(), y: Math.random() * 0.6,
      s: Math.random() < 0.3 ? 2 : 1,
      speed: 1 + Math.random() * 3,
    }));
    const hearts = [];

    /* --- Confettis pixel (même technique que level6.js) --- */
    const canvas = root.querySelector('#confetti');
    const ctxConfetti = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 0, ch = 0;
    function sizeCanvas() {
      const r = root.getBoundingClientRect();
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctxConfetti.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxConfetti.imageSmoothingEnabled = false;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    const COULEURS = ['#ff4d6d', '#ffd23f', '#3ddc84', '#35d6ed', '#8f5cff', '#f4f4f8'];
    const confettis = [];
    let pluie = 2.6;
    function lache(n) {
      for (let i = 0; i < n; i++) {
        confettis.push({
          x: Math.random() * cw,
          y: -10 - Math.random() * 60,
          vx: (Math.random() - 0.5) * 60,
          vy: 60 + Math.random() * 120,
          s: 3 + Math.floor(Math.random() * 3),
          c: COULEURS[Math.floor(Math.random() * COULEURS.length)],
        });
      }
    }

    let raf = 0, running = true;
    (function frame(now) {
      if (!running) return;
      const dt = 0.016;

      if (pluie > 0) { pluie -= dt; lache(3); }
      ctxConfetti.clearRect(0, 0, cw, ch);
      for (let i = confettis.length - 1; i >= 0; i--) {
        const c = confettis[i];
        c.vy += 120 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.y > ch + 20) { confettis.splice(i, 1); continue; }
        ctxConfetti.fillStyle = c.c;
        ctxConfetti.fillRect(Math.round(c.x), Math.round(c.y), c.s, c.s);
      }

      if (Math.random() < 0.05) {
        hearts.push({
          x: cvAnim.w * (0.3 + Math.random() * 0.4),
          y: cvAnim.h * 0.78,
          vy: -20 - Math.random() * 20,
          alpha: 1,
          c: COULEURS[Math.floor(Math.random() * COULEURS.length)],
        });
      }
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.y += h.vy * dt;
        h.alpha -= 0.4 * dt;
        if (h.alpha <= 0) hearts.splice(i, 1);
      }

      drawScene(now / 1000);
      raf = requestAnimationFrame(frame);
    })(0);

    function drawScene(t) {
      const { ctx, w, h } = cvAnim;

      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#f4f4f8';
      stars.forEach(st => {
        ctx.globalAlpha = 0.3 + Math.abs(Math.sin(t * st.speed)) * 0.5;
        ctx.fillRect(Math.round(st.x * w), Math.round(st.y * h), st.s, st.s);
      });
      ctx.globalAlpha = 1;

      const solY = h * 0.82;
      ctx.fillStyle = '#232150';
      ctx.fillRect(0, solY, w, h - solY);
      ctx.fillStyle = '#35d6ed';
      ctx.fillRect(0, solY, w, 2);

      const scale = Math.max(3, Math.floor(Math.min(w / 60, h / 45)));
      const sp = Sprites.size('sacrecoeur');
      Sprites.draw(ctx, 'sacrecoeur', w / 2 - (sp.w * scale) / 2, solY - sp.h * scale, scale);

      hearts.forEach(ht => {
        ctx.globalAlpha = Math.max(0, ht.alpha);
        ctx.fillStyle = ht.c;
        ctx.fillRect(Math.round(ht.x), Math.round(ht.y), scale, scale);
      });
      ctx.globalAlpha = 1;
    }

    /* --- Séquence texte + bouton de sortie --- */
    (async () => {
      if (window.Sfx) { Sfx.unlock(); Sfx.play('final'); }
      await wait(600);

      for (const ligne of MESSAGE) {
        const p = document.createElement('p');
        p.textContent = ligne;
        p.style.opacity = '0';
        msgEl.appendChild(p);
        await wait(100);
        p.style.transition = 'opacity .5s';
        p.style.opacity = '1';
        if (window.Sfx) Sfx.play('click');
        await wait(1000);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn big alt';
      btn.style.width = '100%';
      btn.textContent = BOUTON;
      btn.addEventListener('click', () => {
        if (window.Sfx) Sfx.play('click');
        window.removeEventListener('resize', sizeCanvas);
        running = false;
        cancelAnimationFrame(raf);
        cvAnim.destroy();
        onDone();
      }, { once: true });
      btnBox.appendChild(btn);
    })();
  }

  const api = { show, shouldShow };
  window.Surprise = api;
  return api;
})();
