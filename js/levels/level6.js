/* ============================================================
   NIVEAU 6 — LE VERDICT
   Écran final avec animation d'arrivée à Lille & message.
   ============================================================ */

/* ------------------------------------------------------------------
   ▼▼▼  MESSAGE PERSONNEL À REMPLIR ICI  ▼▼▼
   Une ligne du tableau = un paragraphe affiché l'un après l'autre.
   Ajoute, enlève ou coupe les lignes comme tu veux.
------------------------------------------------------------------ */
const finalMessage = [
  "Mission Lille : 100% accomplie !",
  "Maintenant il va falloir me supporter.",
  "Merci d'avoir joué.",
];

/* ------------------------------------------------------------------
   IMAGE OPTIONNELLE ICI
   Mets le nom du fichier image (déposé dans le dossier du site),
   par exemple : 'photo.jpg'. Laisse '' pour ne pas afficher d'image.
------------------------------------------------------------------ */
const finalPhoto = '';

/* Titre et signature de l'écran final */
const finalTitre = 'MOTIVATION : 100%';
const finalSignature = '— FIN —';


Game.register((() => {

  const T = {
    intro: [
      "Dernier niveau. Pas de mini-jeu, pas de piège.",
      "La jauge est presque pleine, il manque juste la fin.",
    ],
    startLabel: 'VOIR LE VERDICT',
  };

  function start(root, api) {
    root.innerHTML = `
      <div class="final-wrap">
        <canvas id="confetti"></canvas>
        <div class="final-scroll">
          <div class="center-col" style="gap:12px">
            <h2 id="l6-title">${finalTitre}</h2>
          </div>

          <!-- ANIMATION DE FIN : Retrouvailles à Lille -->
          <div class="final-anim-box" id="l6-anim-box"></div>

          <div class="panel" style="margin-top:14px">
            <div class="final-msg" id="l6-msg"></div>
            <!-- IMAGE OPTIONNELLE ICI -->
            <img class="final-photo hidden" id="l6-photo" alt="">
          </div>
          <p class="muted" id="l6-sign" style="text-align:center;margin-top:16px;opacity:0"></p>
        </div>
      </div>
    `;

    const animBox = root.querySelector('#l6-anim-box');
    const msgEl = root.querySelector('#l6-msg');
    const photoEl = root.querySelector('#l6-photo');
    const signEl = root.querySelector('#l6-sign');
    const wrap = root.querySelector('.final-wrap');

    /* --- Canvas Animation Retrouvailles --- */
    const cvAnim = makeCanvas(animBox);
    api.onCleanup(() => cvAnim.destroy());

    let phase = 'WALK';   // WALK -> STOP -> BUBBLE1 -> BUBBLE2 -> END
    let playerX = -50;
    let stepTimer = 0;
    let phaseTimer = 0;

    const stars = Array.from({ length: 22 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.6,
      s: Math.random() < 0.3 ? 2 : 1,
      speed: 1 + Math.random() * 3,
    }));

    const hearts = [];

    /* --- Confettis pixel --- */
    const canvas = root.querySelector('#confetti');
    const ctxConfetti = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = 0, ch = 0;
    function sizeCanvas() {
      const r = wrap.getBoundingClientRect();
      cw = Math.max(1, r.width); ch = Math.max(1, r.height);
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctxConfetti.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxConfetti.imageSmoothingEnabled = false;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    api.onCleanup(() => window.removeEventListener('resize', sizeCanvas));

    const COULEURS = ['#ff4d6d', '#ffd23f', '#3ddc84', '#35d6ed', '#8f5cff', '#f4f4f8'];
    const confettis = [];
    let pluie = 3.2;

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

    /* --- Boucle principale de l'animation --- */
    api.loop((dt, total) => {
      // Confettis
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

      // Mise à jour de l'animation retrouvailles
      const { w, h } = cvAnim;
      const targetPlayerX = w * 0.36;

      if (phase === 'WALK') {
        playerX += 70 * dt;
        stepTimer += dt;
        if (stepTimer >= 0.28) {
          stepTimer = 0;
          api.sfx('click');
        }
        if (playerX >= targetPlayerX) {
          playerX = targetPlayerX;
          phase = 'STOP';
          phaseTimer = 0.5;
          api.sfx('catch');
        }
      } else if (phase === 'STOP') {
        phaseTimer -= dt;
        if (phaseTimer <= 0) {
          phase = 'BUBBLE1';
          phaseTimer = 2.4;
          api.sfx('coin');
        }
      } else if (phase === 'BUBBLE1') {
        phaseTimer -= dt;
        if (phaseTimer <= 0) {
          phase = 'BUBBLE2';
          phaseTimer = 3.6;
          api.sfx('final');
        }
      } else if (phase === 'BUBBLE2') {
        phaseTimer -= dt;
        if (Math.random() < 0.25) {
          const eliseX = w * 0.68;
          hearts.push({
            x: (playerX + eliseX) / 2 + (Math.random() * 30 - 15),
            y: h * 0.72 - 35,
            vy: -25 - Math.random() * 25,
            alpha: 1,
            c: COULEURS[Math.floor(Math.random() * COULEURS.length)],
          });
        }
        if (phaseTimer <= 0) {
          phase = 'END';
        }
      }

      // Mise à jour des cœurs
      for (let i = hearts.length - 1; i >= 0; i--) {
        const ht = hearts[i];
        ht.y += ht.vy * dt;
        ht.alpha -= 0.6 * dt;
        if (ht.alpha <= 0) hearts.splice(i, 1);
      }

      drawScene(total);
    });

    /* --- Dessin de la scène retrouvailles --- */
    function drawScene(t) {
      const { ctx, w, h } = cvAnim;

      // Ciel nocturne
      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      // Étoiles scintillantes
      ctx.fillStyle = '#f4f4f8';
      stars.forEach(st => {
        const alpha = 0.4 + Math.sin(t * st.speed) * 0.4;
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillRect(Math.round(st.x * w), Math.round(st.y * h), st.s, st.s);
      });
      ctx.globalAlpha = 1;

      const scale = Math.max(2, Math.floor(Math.min(w / 75, h / 45)));
      const solY = h * 0.78;

      // Beffroi en arrière-plan
      const spB = Sprites.size('beffroi');
      const bScale = scale * 0.95;
      Sprites.draw(ctx, 'beffroi', w * 0.82 - (spB.w * bScale) / 2, solY - spB.h * bScale, bScale);

      // Sol & herbe
      ctx.fillStyle = '#232150';
      ctx.fillRect(0, solY, w, h - solY);
      ctx.fillStyle = '#35d6ed';
      ctx.fillRect(0, solY, w, 2);
      ctx.fillStyle = '#25502f';
      for (let x = 0; x < w; x += 14) ctx.fillRect(x, solY + 2, 7, 3);

      // Sprites
      const spP = Sprites.size('player');
      const spE = Sprites.size('elise');
      const spV = Sprites.size('valise');

      const eliseX = w * 0.68;
      const eliseBob = Math.sin(t * 3) * scale * 0.3;
      const eliseY = solY - spE.h * scale + eliseBob;

      // Valises de l'autre perso
      const valise1X = playerX - (spV.w * scale * 0.85);
      const valise2X = playerX - (spV.w * scale * 1.7);
      Sprites.draw(ctx, 'valise', valise1X, solY - spV.h * scale, scale);
      Sprites.draw(ctx, 'valise', valise2X, solY - spV.h * scale, scale);

      // Perso principal
      const playerWalkBounce = (phase === 'WALK') ? Math.abs(Math.sin(t * 12)) * scale * 0.6 : 0;
      const playerY = solY - spP.h * scale - playerWalkBounce;
      Sprites.draw(ctx, 'player', playerX - (spP.w * scale) / 2, playerY, scale);

      // Elise
      Sprites.draw(ctx, 'elise', eliseX - (spE.w * scale) / 2, eliseY, scale);

      // Dessin des petits cœurs
      hearts.forEach(ht => {
        ctx.globalAlpha = Math.max(0, ht.alpha);
        ctx.fillStyle = ht.c;
        ctx.fillRect(Math.round(ht.x), Math.round(ht.y), scale * 1.5, scale * 1.5);
      });
      ctx.globalAlpha = 1;

      // Bulles de dialogue
      if (phase === 'BUBBLE1' || phase === 'BUBBLE2' || phase === 'END') {
        drawBubble(ctx, "Enfin te voilà !", eliseX, eliseY - 4, scale, true);
      }

      if (phase === 'BUBBLE2' || phase === 'END') {
        drawBubble(ctx, "Le plus dur maintenant,\nça va être de me faire partir...", playerX, playerY - 4, scale, false);
      }
    }

    /* --- Bulle de dialogue Pixel Art --- */
    function drawBubble(ctx, text, cx, topY, scale, isElise) {
      const lines = text.split('\n');
      const fontSize = Math.max(8, Math.round(scale * 2.2));
      ctx.font = `${fontSize}px PixelFont, monospace`;

      let maxW = 0;
      lines.forEach(l => {
        const m = ctx.measureText(l).width;
        if (m > maxW) maxW = m;
      });

      const padX = 7, padY = 5;
      const bw = maxW + padX * 2;
      const bh = lines.length * (fontSize + 3) + padY * 2;

      let bx = isElise ? cx - bw * 0.6 : cx - bw * 0.4;
      bx = Math.max(4, Math.min(cvAnim.w - bw - 4, bx));
      const by = Math.max(4, topY - bh - 8);

      // Ombre
      ctx.fillStyle = '#07061a';
      ctx.fillRect(bx + 2, by + 2, bw, bh);

      // Fond bulle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#14122b';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Fleche pointing down
      const tailX = Math.max(bx + 6, Math.min(bx + bw - 6, cx));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(tailX - 4, by + bh);
      ctx.lineTo(tailX, by + bh + 5);
      ctx.lineTo(tailX + 4, by + bh);
      ctx.fill();

      // Texte
      ctx.fillStyle = '#14122b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      lines.forEach((l, idx) => {
        ctx.fillText(l, bx + padX, by + padY + idx * (fontSize + 3));
      });
    }

    /* --- Séquence : jauge à 100%, puis affichage du message --- */
    (async () => {
      api.sfx('final');
      if (window.Game && Game.markLevelCompleted) Game.markLevelCompleted(7);
      await api.setProgress(100);

      // Attendre un peu que l'animation principale se déroule
      await attendre(1800);

      for (const paragraphe of finalMessage) {
        const p = document.createElement('p');
        p.textContent = paragraphe;
        p.style.opacity = '0';
        msgEl.appendChild(p);
        await attendre(120);
        p.style.transition = 'opacity .5s';
        p.style.opacity = '1';
        api.sfx('click');
        await attendre(900);
      }

      if (finalPhoto) {
        photoEl.src = finalPhoto;
        photoEl.classList.remove('hidden');
      }

      await attendre(600);
      signEl.textContent = finalSignature;
      signEl.style.transition = 'opacity .8s';
      signEl.style.opacity = '1';
    })();

    function attendre(ms) { return new Promise(r => setTimeout(r, ms)); }
  }

  return { id: 7, title: 'LE VERDICT', intro: T.intro, startLabel: T.startLabel, start };
})());
