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
  accroche:     "Objectif : te convaincre de me faire venir à Lille.\nAucune pression. Enfin si, un peu.",
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
    b.addEventListener('click', () => { Sfx.play('click'); onClick(); });
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

    const hint = document.createElement('div');
    hint.className = 'muted blink';
    hint.textContent = '▼ appuie sur START ▼';
    s.appendChild(hint);
  }

  /* ---------------- Intro d'un niveau ---------------- */

  function showIntro(index) {
    clearScene();
    hud().classList.remove('hidden');
    const lvl = levels[index];
    const s = scene('center-col');

    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = 'NIVEAU ' + lvl.id + ' / 6';
    s.appendChild(tag);

    const h = document.createElement('h2');
    h.textContent = lvl.title;
    s.appendChild(h);

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
        showResult(index, true, message);
      },

      lose(message) {
        if (done) return; done = true;
        Sfx.play('fail');
        showResult(index, false, message);
      },
    };

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

    // Confort mobile : pas de zoom au double-tap, pas de rebond
    document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', e => {
      if (e.target.closest('.final-scroll')) return;
      e.preventDefault();
    }, { passive: false });

    showTitle();
  }

  return {
    register(def) { levels.push(def); },
    boot,
    play,
    get progress() { return progress; },
    animateProgress,
    button,
    wipe,
  };
})();
