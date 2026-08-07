/* ============================================================
   NOTRE JOURNAL — les moments qu'on veut garder, pas juste les
   mots du quotidien (ça, c'est la Boîte à Mots).
   Réutilise EXACTEMENT le même Worker Cloudflare déjà déployé pour
   la Boîte à Mots (même endpoint /messages, même stockage KV) —
   aucun changement côté serveur, donc aucun risque pour la Boîte
   à Mots existante. Les entrées de journal sont juste des messages
   au format spécial (préfixe §J§), filtrés hors de la Boîte à Mots
   normale (voir chat.js) et affichés ici en timeline.
   ============================================================ */

const Journal = (() => {

  // Mêmes valeurs que js/chat.js (dupliquées volontairement : ce module
  // ne doit dépendre de rien dans chat.js, pour ne jamais risquer de
  // casser la Boîte à Mots en cas de bug ici).
  const WORKER_URL = 'https://ol-chat.trxshlxrd.workers.dev';
  const APP_KEY = '65801aedb5404d1885c7c44f364b5438524900a3';

  const PREFIX = '§J§';
  const SEP = '§§';
  const MAX_TITLE = 40;
  const MAX_BODY = 220;

  let currentUser = localStorage.getItem('ol_user') || null;
  let entries = [];

  function encode(title, body) {
    return PREFIX + title.slice(0, MAX_TITLE) + SEP + body.slice(0, MAX_BODY);
  }

  function decode(msg) {
    if (!msg.text || !msg.text.startsWith(PREFIX)) return null;
    const rest = msg.text.slice(PREFIX.length);
    const idx = rest.indexOf(SEP);
    const title = idx === -1 ? '' : rest.slice(0, idx);
    const body = idx === -1 ? rest : rest.slice(idx + SEP.length);
    return { id: msg.id, author: msg.author, name: msg.name, date: msg.date, title, body };
  }

  async function loadEntries() {
    try {
      const res = await fetch(`${WORKER_URL}/messages`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          entries = data.map(decode).filter(Boolean);
          return;
        }
      }
    } catch (e) {
      console.warn('Journal: lecture impossible.', e);
    }
  }

  async function addEntry(title, body) {
    if (!currentUser) return;
    const text = encode(title.trim(), body.trim());
    try {
      await fetch(`${WORKER_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-App-Key': APP_KEY },
        body: JSON.stringify({ author: currentUser, text }),
      });
    } catch (e) {
      console.error('Journal: envoi impossible.', e);
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  async function show() {
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
      <h2 style="color:var(--yellow);margin-bottom:6px">NOTRE JOURNAL 📖</h2>
      <div id="journal-user-bar" class="chat-user-bar"></div>
      <div class="chat-box" id="journal-box">
        <div class="muted" style="text-align:center;padding:10px">Chargement...</div>
      </div>
      <div id="journal-form" class="journal-form"></div>
      <button type="button" class="btn ghost" id="journal-back" style="margin-top:10px;margin-bottom:16px;width:100%;max-width:380px">◄ RETOUR</button>
    `;
    stage.appendChild(s);

    const userBar = s.querySelector('#journal-user-bar');
    const box = s.querySelector('#journal-box');
    const form = s.querySelector('#journal-form');

    function renderUserBar() {
      if (!currentUser) {
        userBar.innerHTML = `
          <div class="muted" style="margin-bottom:6px">Qui écrit aujourd'hui ?</div>
          <div style="display:flex;gap:8px;justify-content:center">
            <button type="button" class="btn alt" id="j-pick-ewn">💙 Ewan</button>
            <button type="button" class="btn" id="j-pick-elise" style="background:var(--pink);color:#fff">🩷 Élise</button>
          </div>
        `;
        form.style.display = 'none';
        userBar.querySelector('#j-pick-ewn').addEventListener('click', () => { currentUser = 'ewn'; localStorage.setItem('ol_user', 'ewn'); renderAll(); });
        userBar.querySelector('#j-pick-elise').addEventListener('click', () => { currentUser = 'elise'; localStorage.setItem('ol_user', 'elise'); renderAll(); });
      } else {
        userBar.innerHTML = `
          <div class="chat-current-user">
            <span>Identifié en tant que : <b style="color:${currentUser === 'ewn' ? 'var(--cyan)' : 'var(--pink)'}">${currentUser === 'ewn' ? 'Ewan 💙' : 'Élise 🩷'}</b></span>
            <button type="button" class="btn ghost" id="j-change-user" style="padding:4px 8px;font-size:8px;min-height:24px">Changer</button>
          </div>
        `;
        form.style.display = 'flex';
        userBar.querySelector('#j-change-user').addEventListener('click', () => {
          currentUser = null;
          localStorage.removeItem('ol_user');
          renderAll();
        });
      }
    }

    function renderEntries() {
      box.innerHTML = '';
      if (!entries.length) {
        box.innerHTML = `<div class="muted" style="text-align:center;padding:20px">Aucun souvenir pour l'instant. Écris le premier.</div>`;
        return;
      }
      entries.forEach(entry => {
        const isEwn = entry.author === 'ewn';
        const card = document.createElement('div');
        card.className = `chat-msg-card ${isEwn ? 'ewn' : 'elise'}`;
        card.innerHTML = `
          <div class="chat-msg-header">
            <div class="chat-avatar" id="j-avatar-${entry.id}"></div>
            <div style="flex:1">
              <span class="chat-author ${isEwn ? 'ewn' : 'elise'}">${entry.name}</span>
              <span class="chat-date">${entry.date}</span>
            </div>
          </div>
          ${entry.title ? `<div class="journal-entry-title">${escapeHtml(entry.title)}</div>` : ''}
          <div class="chat-msg-body">${escapeHtml(entry.body)}</div>
        `;
        box.appendChild(card);
        const avBox = card.querySelector(`#j-avatar-${entry.id}`);
        const cvApi = makeCanvas(avBox);
        Sprites.drawCentered(cvApi.ctx, isEwn ? 'player' : 'elise', cvApi.w / 2, cvApi.h / 2, 2);
      });
      box.scrollTop = box.scrollHeight;
    }

    function renderForm() {
      if (!currentUser) return;
      form.innerHTML = `
        <input type="text" id="j-title-input" class="chat-text-input" placeholder="Titre du souvenir (ex: Notre 2e date)" maxlength="${MAX_TITLE}">
        <textarea id="j-body-input" class="chat-text-input journal-textarea" placeholder="Raconte..." maxlength="${MAX_BODY}"></textarea>
        <button type="button" class="btn alt" id="j-send-btn" style="width:100%">AJOUTER AU JOURNAL 📖</button>
      `;
      const titleInput = form.querySelector('#j-title-input');
      const bodyInput = form.querySelector('#j-body-input');
      const sendBtn = form.querySelector('#j-send-btn');

      async function doSend() {
        const title = titleInput.value;
        const body = bodyInput.value;
        if (!body.trim()) return;
        titleInput.value = '';
        bodyInput.value = '';
        Sfx.play('coin');
        await addEntry(title, body);
        await loadEntries();
        renderEntries();
      }
      sendBtn.addEventListener('click', doSend);
    }

    function renderAll() {
      renderUserBar();
      renderEntries();
      renderForm();
    }

    renderAll();
    await loadEntries();
    renderEntries();

    const backBtn = s.querySelector('#journal-back');
    let backFired = false;
    backBtn.addEventListener('click', e => {
      if (backFired) return;
      backFired = true;
      if (e.preventDefault) e.preventDefault();
      Sfx.play('click');
      Game.showTitle();
    });
  }

  const api = { show };
  window.Journal = api;
  return api;
})();
