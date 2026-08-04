/* ============================================================
   OPÉRATION LILLE — moteur de jeu
   Gère : scènes, jauge globale, transitions, cycle intro/jeu/résultat.
   Les niveaux s'enregistrent via Game.register({...}).
   ============================================================ */

/* --- Textes génériques, faciles à retoucher --- */

const TEXTES = {
  titre:        'OPÉRATION\nLILLE',
  sousTitre:    'Un jeu en 6 niveaux',
  jauge:        'Chargement du déménagement',   // libellé de la jauge globale
  accroche:     "Objectif : me faire venir à Lille.\nAucune pression. Enfin si, un peu.",
  start:        'START',
  commencer:    'COMMENCER',
  continuer:    'CONTINUER',
  reessayer:    'RÉESSAYER',

  // Petits mots affichés au-dessus du bouton RÉESSAYER (tournent à chaque échec)
  encouragements: [
    "C'est pas grave, on s'en fout, on recommence.",
    "Tu y étais presque. Enfin, presque presque.",
    "Le jeu est mal équilibré, c'est pas toi.",
    "Deuxième chance. Et troisième. Et quatrième.",
    "Personne n'a vu. Recommence.",
    "Techniquement, c'est un bug. Officiellement.",
  ],

  transition: [
    'NIVEAU 1 TERMINÉ !',
    'NIVEAU 2 TERMINÉ !',
    'NIVEAU 3 TERMINÉ !',
    'NIVEAU 4 TERMINÉ !',
    'NIVEAU 5 TERMINÉ !',
  ],
};

const Game = (() => {

  const SEGMENTS = 12;          // segments de la barre de vie rétro
  const STEP = 100 / 6;         // gain de motivation par niveau

  const levels = [];
  let current = 0;              // index du niveau courant
  let progress = 0;             // 0 → 100
  let cleanup = null;           // nettoyage de la scène en cours
  let retryCount = 0;

  const stage   = () => document.getElementById('stage');
  const hud     = () => document.getElementById('hud');
  const segbar  = () => document.getElementById('segbar');
  const pctEl   = () => document.getElementById('hud-pct');
  const wipeEl  = () => document.getElementById('wipe');

  /* ---------------- Jauge globale ---------------- */

  function buildSegbar() {
    const bar = segbar();
    bar.innerHTML = '';
    for (let i = 0; i < SEGMENTS; i++) bar.appendChild(document.createElement('i'));
  }

  function paintProgress(value) {
    const filled = (value / 100) * SEGMENTS;
    [...segbar().children].forEach((seg, i) => {
      seg.classList.toggle('on', i < Math.round(filled));
      seg.classList.toggle('full', value >= 99.5);
    });
    pctEl().textContent = Math.round(value) + '%';
  }

  // Animation de remplissage (utilisée après chaque victoire et au niveau 6)
  function animateProgress(to, duration = 900) {
    return new Promise(resolve => {
      const from = progress;
      const t0 = performance.now();
      let lastTick = -1;
      (function step(now) {
        const k = Math.min(1, (now - t0) / duration);
        progress = from + (to - from) * k;
        paintProgress(progress);
        const tick = Math.floor(k * 8);
        if (tick !== lastTick) { lastTick = tick; Sfx.play('click'); }
        if (k < 1) requestAnimationFrame(step);
        else { progress = to; paintProgress(progress); resolve(); }
      })(t0);
    });
  }

  /* ---------------- Scènes ---------------- */

  function clearScene() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    stage().innerHTML = '';
  }

  function scene(className = '') {
    const el = document.createElement('div');
    el.className = 'scene ' + className;
    stage().appendChild(el);
    return el;
  }

  function button(label, cls, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + cls;
    b.textContent = label;
    let fired = false;
    function trigger(e) {
      if (fired) return;
      fired = true;
      Sfx.play('click');
      onClick();
      setTimeout(() => { fired = false; }, 300);
    }
    b.addEventListener('pointerdown', trigger);
    b.addEventListener('click', trigger);
    return b;
  }

  function multiline(text) {
    return text.split('\n').map(l => {
      const p = document.createElement('p');
      p.textContent = l;
      return p;
    });
  }

  /* Transition plein écran entre deux scènes */
  function wipe(text) {
    return new Promise(resolve => {
      const w = wipeEl();
      w.innerHTML = '<div class="wipe-text"></div>';
      w.firstChild.textContent = text;
      w.classList.add('on');
      setTimeout(() => { w.classList.remove('on'); resolve(); }, 1100);
    });
  }

  /* ---------------- Écran titre ---------------- */

  function showTitle() {
    clearScene();
    hud().classList.add('hidden');
    Sfx.startBgm('main');
    const s = scene('center-col');

    const logo = document.createElement('h1');
    logo.className = 'title-logo';
    logo.textContent = TEXTES.titre;   // le saut de ligne est conservé (white-space: pre-line)
    s.appendChild(logo);

    const sub = document.createElement('div');
    sub.className = 'tag';
    sub.textContent = TEXTES.sousTitre;
    s.appendChild(sub);

    const box = document.createElement('div');
    box.className = 'panel';
    multiline(TEXTES.accroche).forEach(p => box.appendChild(p));
    s.appendChild(box);

    s.appendChild(button(TEXTES.start, 'big', () => { Sfx.unlock(); startLevel(0); }));

    s.appendChild(button('🖼️ ALBUM SOUVENIRS', 'big ghost', () => {
      Sfx.unlock();
      if (typeof Album !== 'undefined') Album.show();
      else if (window.Album) window.Album.show();
    }));

    s.appendChild(button('💌 LA BOÎTE À MOTS', 'big ghost', () => {
      Sfx.unlock();
      if (typeof Chat !== 'undefined') Chat.show();
      else if (window.Chat) window.Chat.show();
    }));

    const hint = document.createElement('div');
    hint.className = 'muted blink';
    hint.textContent = '▼ appuie sur START ▼';
    s.appendChild(hint);
  }

  /* --- Générateur d'illustrations BD inter-niveaux --- */
  const BdDraw = {
    draw(ctx, id, w, h) {
      const scale = Math.max(2, Math.floor(Math.min(w / 70, h / 40)));
      ctx.fillStyle = '#100e26';
      ctx.fillRect(0, 0, w, h);

      if (id === 1) {
        ctx.fillStyle = '#1c3a24'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
        Sprites.drawCentered(ctx, 'kassos', w * 0.3, h * 0.5, scale);
        Sprites.drawCentered(ctx, 'player', w * 0.75, h * 0.5, scale);
        ctx.fillStyle = '#ffd23f'; ctx.font = `${Math.round(scale * 2.8)}px monospace`;
        ctx.fillText('♪ JUL ♪', w * 0.15, h * 0.25);
      } else if (id === 2) {
        ctx.fillStyle = '#232150'; ctx.fillRect(0, 0, w, h);
        Sprites.drawCentered(ctx, 'elise', w * 0.35, h * 0.5, scale);
        Sprites.drawCentered(ctx, 'brush', w * 0.65, h * 0.5, scale);
        Sprites.drawCentered(ctx, 'hair', w * 0.65, h * 0.25, scale);
      } else if (id === 3) {
        ctx.fillStyle = '#122618'; ctx.fillRect(0, 0, w, h);
        Sprites.drawCentered(ctx, 'lys2', w * 0.3, h * 0.55, scale);
        Sprites.drawCentered(ctx, 'lys3', w * 0.5, h * 0.55, scale);
        Sprites.drawCentered(ctx, 'lys2', w * 0.7, h * 0.55, scale);
      } else if (id === 4) {
        ctx.fillStyle = '#1b1940'; ctx.fillRect(0, 0, w, h);
        Sprites.drawCentered(ctx, 'maki', w * 0.3, h * 0.4, scale);
        Sprites.drawCentered(ctx, 'nigiri', w * 0.6, h * 0.5, scale);
        ctx.strokeStyle = '#35d6ed'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.7); ctx.lineTo(w * 0.75, h * 0.2); ctx.stroke();
      } else if (id === 5) {
        ctx.fillStyle = '#1d1b46'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#232150'; ctx.fillRect(0, h * 0.7, w, h * 0.3);
        Sprites.drawCentered(ctx, 'player', w * 0.3, h * 0.6, scale);
        Sprites.drawCentered(ctx, 'beffroi', w * 0.8, h * 0.5, scale * 0.8);
      } else if (id === 6) {
        ctx.fillStyle = '#1a183d'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8b5a2b'; ctx.fillRect(w * 0.25, h * 0.4, w * 0.2, h * 0.35);
        ctx.fillStyle = '#a05a2c'; ctx.fillRect(w * 0.5, h * 0.45, w * 0.25, h * 0.3);
        Sprites.drawCentered(ctx, 'valise', w * 0.35, h * 0.3, scale);
      } else {
        ctx.fillStyle = '#100e26'; ctx.fillRect(0, 0, w, h);
        Sprites.drawCentered(ctx, 'player', w * 0.4, h * 0.5, scale);
        Sprites.drawCentered(ctx, 'elise', w * 0.6, h * 0.5, scale);
        Sprites.drawCentered(ctx, 'valise', w * 0.25, h * 0.6, scale);
      }
    }
  };

  /* ---------------- Intro d'un niveau ---------------- */

  function showIntro(index) {
    clearScene();
    hud().classList.remove('hidden');
    const lvl = levels[index];
    const s = scene('center-col');

    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = 'NIVEAU ' + lvl.id + ' / ' + levels.length;
    s.appendChild(tag);

    const h = document.createElement('h2');
    h.textContent = lvl.title;
    s.appendChild(h);

    /* Vignette de BD inter-niveau avec Canvas Pixel Art */
    const bdBox = document.createElement('div');
    bdBox.className = 'bd-box';
    bdBox.innerHTML = `
      <div class="bd-badge">ÉPISODE ${lvl.id}</div>
      <div class="bd-canvas-box"></div>
      <div class="bd-caption">« ${lvl.bdCaption || lvl.title} »</div>
    `;
    s.appendChild(bdBox);

    const cvBox = bdBox.querySelector('.bd-canvas-box');
    const cvApi = makeCanvas(cvBox);
    BdDraw.draw(cvApi.ctx, lvl.id, cvApi.w, cvApi.h);

    const box = document.createElement('div');
    box.className = 'panel';
    lvl.intro.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line;
      box.appendChild(p);
    });
    s.appendChild(box);

    s.appendChild(button(lvl.startLabel || TEXTES.commencer, 'big alt', () => play(index)));
  }

  /* ---------------- Lancement du mini-jeu ---------------- */

  function play(index) {
    clearScene();
    hud().classList.remove('hidden');
    current = index;
    const lvl = levels[index];
    const root = scene('play');

    let done = false;
    const disposers = [];

    const api = {
      root,

      onCleanup(fn) { disposers.push(fn); },

      sfx(name) { Sfx.play(name); },

      /* Popup Arcade dynamique */
      arcadePopup(text, type = 'normal') {
        const parent = root;
        const el = document.createElement('div');
        el.className = 'arcade-popup ' + type;
        el.textContent = text;
        parent.appendChild(el);
        if (type === 'critical') Sfx.play('critical');
        else if (type === 'combo') Sfx.play('combo');
        else Sfx.play('coin');
        setTimeout(() => el.remove(), 900);
      },

      /* Boucle de jeu : fn(dt en secondes, temps total) — stoppée automatiquement */
      loop(fn) {
        let raf = 0, last = performance.now(), total = 0, stopped = false;
        (function frame(now) {
          if (stopped) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          total += dt;
          fn(dt, total);
          raf = requestAnimationFrame(frame);
        })(last);
        disposers.push(() => { stopped = true; cancelAnimationFrame(raf); });
      },

      /* Petit texte qui monte et disparaît */
      floater(text, host) {
        const parent = host || root;
        const el = document.createElement('div');
        el.className = 'floater';
        el.textContent = text;
        el.style.top = (25 + Math.random() * 45) + '%';
        el.style.left = (30 + Math.random() * 40) + '%';
        parent.appendChild(el);
        setTimeout(() => el.remove(), 2000);
      },

      shake(el) {
        const target = el || document.getElementById('app');
        target.classList.remove('shake');
        void target.offsetWidth;
        target.classList.add('shake');
        setTimeout(() => target.classList.remove('shake'), 900);
      },

      setProgress(value) { return animateProgress(value); },

      win(message) {
        if (done) return; done = true;
        Sfx.play('win');
        Sfx.startBgm('main');
        showResult(index, true, message);
      },

      lose(message) {
        if (done) return; done = true;
        Sfx.play('fail');
        Sfx.startBgm('main');
        showResult(index, false, message);
      },
    };

    Sfx.startBgm('action');
    cleanup = () => disposers.forEach(fn => { try { fn(); } catch (e) {} });
    lvl.start(root, api);
  }

  /* ---------------- Écran de résultat ---------------- */

  async function showResult(index, won, message) {
    const lvl = levels[index];
    clearScene();
    const s = scene('center-col');

    const h = document.createElement('h2');
    h.textContent = won ? 'NIVEAU RÉUSSI' : 'RATÉ (un peu)';
    h.style.color = won ? 'var(--green)' : 'var(--pink)';
    s.appendChild(h);

    const box = document.createElement('div');
    box.className = 'panel';
    multiline(message).forEach(p => box.appendChild(p));
    s.appendChild(box);

    if (won) {
      retryCount = 0;
      const target = Math.min(100, STEP * (index + 1));
      await animateProgress(target);

      const next = index + 1;
      s.appendChild(button(TEXTES.continuer, 'big', async () => {
        if (next < levels.length) {
          await wipe(TEXTES.transition[index] || 'BIEN JOUÉ !');
          showIntro(next);
        }
      }));
    } else {
      const enc = document.createElement('div');
      enc.className = 'muted';
      enc.textContent = TEXTES.encouragements[retryCount % TEXTES.encouragements.length];
      retryCount++;
      s.appendChild(enc);
      s.appendChild(button(TEXTES.reessayer, 'big ghost', () => play(index)));
    }
  }

  /* ---------------- Enchaînement ---------------- */

  function startLevel(index) {
    showIntro(index);
  }

  /* ---------------- Démarrage ---------------- */

  function boot() {
    levels.sort((a, b) => a.id - b.id);
    document.querySelector('.hud-label').textContent = TEXTES.jauge;
    buildSegbar();
    paintProgress(0);

    // Bouton son
    const sb = document.getElementById('sound-toggle');
    sb.addEventListener('click', () => {
      const on = Sfx.toggle();
      sb.classList.toggle('off', !on);
    });

    // Bouton retour au menu principal dans le HUD
    const hb = document.getElementById('hud-home');
    if (hb) {
      let homeFired = false;
      function goHome(e) {
        if (homeFired) return;
        homeFired = true;
        if (e && e.preventDefault) e.preventDefault();
        Sfx.play('click');
        showTitle();
        setTimeout(() => { homeFired = false; }, 300);
      }
      hb.addEventListener('pointerdown', goHome);
      hb.addEventListener('click', goHome);
    }

    // Confort mobile : pas de zoom au double-tap, pas de rebond
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', e => {
      if (e.target.closest('.final-scroll') || e.target.closest('.scene') || e.target.closest('button')) return;
      e.preventDefault();
    }, { passive: false });

    showTitle();
  }

  return {
    register(def) { levels.push(def); },
    boot,
    play,
    showTitle,
    clearScene,
    get progress() { return progress; },
    animateProgress,
    button,
    wipe,
  };
})();
