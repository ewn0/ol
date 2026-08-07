/* ============================================================
   SUCCÈS — petits trophées qui donnent une raison de tout explorer.
   Rien d'obligatoire pour finir le jeu : juste du bonus pour les
   curieux. Débloqués via des flags posés par les autres écrans.
   ============================================================ */

const Achievements = (() => {

  const FLAGS_KEY = 'ol_flags';

  function getFlags() {
    try { return JSON.parse(localStorage.getItem(FLAGS_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function setFlag(name) {
    const flags = getFlags();
    if (!flags[name]) {
      flags[name] = true;
      localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
    }
    checkNewUnlocks();
  }

  function hasFlag(name) {
    return !!getFlags()[name];
  }

  /* Chaque succès = une petite condition vérifiée à l'affichage,
     jamais stockée elle-même (sauf via les flags posés ailleurs). */
  const LIST = [
    {
      id: 'map', icon: '🗺️', title: 'Touriste',
      desc: 'Consulter la carte de Lille.',
      check: () => hasFlag('map_seen'),
    },
    {
      id: 'album', icon: '🖼️', title: 'Nostalgique',
      desc: 'Ouvrir la galerie de souvenirs.',
      check: () => hasFlag('album_seen'),
    },
    {
      id: 'chat', icon: '💌', title: 'Premier mot doux',
      desc: 'Envoyer un mot dans la Boîte à Mots.',
      check: () => hasFlag('chat_sent'),
    },
    {
      id: 'retry', icon: '🔁', title: 'Increvable',
      desc: "Rater un niveau... et y retourner quand même.",
      check: () => hasFlag('retried_and_won'),
    },
    {
      id: 'allLevels', icon: '🏆', title: 'Mission Lille',
      desc: 'Terminer les 7 niveaux.',
      check: () => !!(window.Game && Game.getCompletedLevels && Game.getCompletedLevels().size >= 7),
    },
  ];

  // Succès "platine" : débloqué quand tous les autres le sont.
  LIST.push({
    id: 'all', icon: '💯', title: 'Perfectionniste',
    desc: 'Débloquer tous les autres succès.',
    check: () => LIST.slice(0, -1).every(a => a.check()),
  });

  function unlockedCount() { return LIST.filter(a => a.check()).length; }
  function totalCount() { return LIST.length; }

  /* ---------------- Popup façon Steam au moment du déblocage ---------------- */

  const SEEN_KEY = 'ol_ach_seen';

  function getSeen() {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveSeen(set) { localStorage.setItem(SEEN_KEY, JSON.stringify([...set])); }

  // Au tout premier appel (après le chargement complet du jeu), on marque comme
  // "déjà vus" les succès déjà acquis avant l'arrivée de cette fonctionnalité —
  // sinon le premier clic après la mise à jour déclenche une pluie de popups
  // pour des succès obtenus depuis longtemps.
  let seeded = false;
  function ensureSeeded() {
    if (seeded || localStorage.getItem(SEEN_KEY) !== null) { seeded = true; return; }
    const seen = new Set();
    LIST.forEach(a => { if (a.check()) seen.add(a.id); });
    saveSeen(seen);
    seeded = true;
  }

  let toastHost = null, toastBoxEl = null, toastIconEl = null, toastNameEl = null;
  let toastQueue = [];
  let toastBusy = false;

  function ensureToast() {
    if (toastHost) return;
    toastHost = document.createElement('div');
    toastHost.id = 'ach-toast-host';
    toastHost.innerHTML = `
      <div class="ach-toast">
        <div class="ach-toast-icon"></div>
        <div>
          <div class="ach-toast-label">SUCCÈS DÉBLOQUÉ</div>
          <div class="ach-toast-name"></div>
        </div>
      </div>
    `;
    document.body.appendChild(toastHost);
    toastBoxEl = toastHost.querySelector('.ach-toast');
    toastIconEl = toastHost.querySelector('.ach-toast-icon');
    toastNameEl = toastHost.querySelector('.ach-toast-name');
  }

  function playNextToast() {
    if (toastBusy || !toastQueue.length) return;
    toastBusy = true;
    const a = toastQueue.shift();
    ensureToast();
    toastIconEl.textContent = a.icon;
    toastNameEl.textContent = a.title;
    if (window.Sfx) Sfx.play('win');
    requestAnimationFrame(() => toastBoxEl.classList.add('on'));
    setTimeout(() => {
      toastBoxEl.classList.remove('on');
      setTimeout(() => { toastBusy = false; playNextToast(); }, 400);
    }, 2800);
  }

  function checkNewUnlocks() {
    ensureSeeded();
    const seen = getSeen();
    let changed = false;
    LIST.forEach(a => {
      if (seen.has(a.id)) return;
      if (a.check()) {
        seen.add(a.id);
        changed = true;
        toastQueue.push(a);
      }
    });
    if (changed) saveSeen(seen);
    playNextToast();
  }

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
      <h2 style="color:var(--yellow);margin-bottom:4px">SUCCÈS 🏆</h2>
      <div class="tag" style="margin-bottom:10px">${unlockedCount()} / ${totalCount()} débloqués</div>
      <div class="ach-grid" id="ach-grid"></div>
      <button type="button" class="btn ghost" id="ach-back" style="margin-top:16px;margin-bottom:16px;width:100%;max-width:280px">◄ RETOUR</button>
    `;
    stage.appendChild(s);

    const grid = s.querySelector('#ach-grid');
    LIST.forEach(a => {
      const unlocked = a.check();
      const card = document.createElement('div');
      card.className = 'ach-card' + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.desc}</div>
      `;
      grid.appendChild(card);
    });

    const backBtn = s.querySelector('#ach-back');
    let backFired = false;
    function goBack(e) {
      if (backFired) return;
      backFired = true;
      if (e && e.preventDefault) e.preventDefault();
      Sfx.play('click');
      Game.showTitle();
    }
    backBtn.addEventListener('click', goBack);
  }

  const api = { show, setFlag, hasFlag, unlockedCount, totalCount, checkNewUnlocks, ensureSeeded, LIST };
  window.Achievements = api;
  return api;
})();
