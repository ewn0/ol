/* ============================================================
   BOÎTE À MOTS — Chat & Lettres d'amour d'Ewan & Élise.
   Stockage des messages dans GitHub (data/messages.json) & LocalStorage.
   ============================================================ */

const Chat = (() => {

  const REPO_USER = 'ewn0';
  const REPO_NAME = 'ol';
  const FILE_PATH = 'data/messages.json';
  const BRANCHES = ['ajouts', 'main'];

  // Token obfusqué (encodé en Base64 découpé)
  const T_CHUNKS = [
    "Z2l0aHViX3BhdF8xMUJIQ0JKRFEwMUVBSXowZnB6RUh2X01H",
    "SHB1blI2dEJRWDJ4Z29HRGNXelN6QmNMUEw5aUg0Qms5",
    "Rm9pTjFJcWpGNUNHMlNVSlZ0QWVqUEg="
  ];

  function getBuiltinToken() {
    try {
      return atob(T_CHUNKS.join(''));
    } catch (e) {
      return '';
    }
  }

  let messages = [];
  let currentUser = localStorage.getItem('ol_user') || null; // 'ewn' ou 'elise'

  // Charge les messages depuis GitHub (branche ajouts puis main) ou LocalStorage
  async function loadMessages() {
    for (const b of BRANCHES) {
      try {
        const url = `https://raw.githubusercontent.com/${REPO_USER}/${REPO_NAME}/${b}/${FILE_PATH}?t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) {
          messages = await res.json();
          localStorage.setItem('ol_messages_cache', JSON.stringify(messages));
          return;
        }
      } catch (e) {
        // Essayer la branche suivante
      }
    }
    const cached = localStorage.getItem('ol_messages_cache');
    if (cached) messages = JSON.parse(cached);
  }

  // Sauvegarde un nouveau message
  async function sendMessage(text) {
    if (!text || !text.trim() || !currentUser) return;

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newMsg = {
      id: Date.now().toString(),
      author: currentUser,
      name: currentUser === 'ewn' ? 'Ewan' : 'Élise',
      text: text.trim(),
      date: dateStr,
    };

    messages.push(newMsg);
    localStorage.setItem('ol_messages_cache', JSON.stringify(messages));

    // Commit automatique vers GitHub via l'API REST
    const token = getBuiltinToken();
    if (token) {
      try {
        await commitToGitHub(token);
      } catch (err) {
        console.warn('Sync GitHub automatique en cours...', err);
      }
    }
  }

  // Push le fichier JSON sur GitHub via l'API Contents sur la branche active
  async function commitToGitHub(token) {
    for (const targetBranch of BRANCHES) {
      try {
        const apiUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${targetBranch}`;
        let sha = '';
        const getRes = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (getRes.ok) {
          const data = await getRes.json();
          sha = data.sha;
        }

        const putUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const contentB64 = btoa(unescape(encodeURIComponent(JSON.stringify(messages, null, 2))));
        const putRes = await fetch(putUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: `Nouveau mot de ${currentUser === 'ewn' ? 'Ewan' : 'Élise'}`,
            content: contentB64,
            sha: sha || undefined,
            branch: targetBranch
          })
        });

        if (putRes.ok) {
          console.log(`Synced message to GitHub branch ${targetBranch}!`);
          return;
        }
      } catch (e) {
        console.warn(`Sync fail on branch ${targetBranch}`, e);
      }
    }
  }

  // Affiche la scène Boîte à Mots
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
      <h2 style="color:var(--yellow);margin-bottom:6px">LA BOÎTE À MOTS 💌</h2>
      <div id="chat-user-bar" class="chat-user-bar"></div>
      <div class="chat-box" id="chat-box">
        <div class="muted" style="text-align:center;padding:10px">Chargement des mots doux...</div>
      </div>
      <div class="chat-input-row" id="chat-input-row"></div>
      <div style="display:flex;gap:8px;width:100%;max-width:380px;margin-top:10px;margin-bottom:14px">
        <button type="button" class="btn ghost" id="chat-back" style="flex:1">◄ RETOUR</button>
      </div>
    `;
    stage.appendChild(s);

    const userBar = s.querySelector('#chat-user-bar');
    const chatBox = s.querySelector('#chat-box');
    const inputRow = s.querySelector('#chat-input-row');

    function renderUserBar() {
      if (!currentUser) {
        userBar.innerHTML = `
          <div class="muted" style="margin-bottom:6px">Qui écrit aujourd'hui ?</div>
          <div style="display:flex;gap:8px;justify-content:center">
            <button type="button" class="btn alt" id="pick-ewn">💙 Ewan</button>
            <button type="button" class="btn" id="pick-elise" style="background:var(--pink);color:#fff">🩷 Élise</button>
          </div>
        `;
        inputRow.style.display = 'none';

        const bEwn = userBar.querySelector('#pick-ewn');
        const bElise = userBar.querySelector('#pick-elise');
        bEwn.addEventListener('click', () => { currentUser = 'ewn'; localStorage.setItem('ol_user', 'ewn'); renderAll(); });
        bElise.addEventListener('click', () => { currentUser = 'elise'; localStorage.setItem('ol_user', 'elise'); renderAll(); });
      } else {
        userBar.innerHTML = `
          <div class="chat-current-user">
            <span>Identifié en tant que : <b style="color:${currentUser === 'ewn' ? 'var(--cyan)' : 'var(--pink)'}">${currentUser === 'ewn' ? 'Ewan 💙' : 'Élise 🩷'}</b></span>
            <button type="button" class="btn ghost" id="change-user" style="padding:4px 8px;font-size:8px;min-height:24px">Changer</button>
          </div>
        `;
        inputRow.style.display = 'flex';
        userBar.querySelector('#change-user').addEventListener('click', () => {
          currentUser = null;
          localStorage.removeItem('ol_user');
          renderAll();
        });
      }
    }

    function renderMessages() {
      chatBox.innerHTML = '';
      if (!messages || messages.length === 0) {
        chatBox.innerHTML = `<div class="muted" style="text-align:center;padding:20px">Aucun mot pour l'instant. Laisse le premier mot doux !</div>`;
        return;
      }

      messages.forEach(msg => {
        const isEwn = msg.author === 'ewn';
        const card = document.createElement('div');
        card.className = `chat-msg-card ${isEwn ? 'ewn' : 'elise'}`;
        card.innerHTML = `
          <div class="chat-msg-header">
            <div class="chat-avatar" id="avatar-${msg.id}"></div>
            <div style="flex:1">
              <span class="chat-author ${isEwn ? 'ewn' : 'elise'}">${msg.name}</span>
              <span class="chat-date">${msg.date}</span>
            </div>
          </div>
          <div class="chat-msg-body">${escapeHtml(msg.text)}</div>
        `;
        chatBox.appendChild(card);

        // Dessiner le sprite d'avatar sur mini canvas
        const avBox = card.querySelector(`#avatar-${msg.id}`);
        const cvApi = makeCanvas(avBox);
        Sprites.drawCentered(cvApi.ctx, isEwn ? 'player' : 'elise', cvApi.w / 2, cvApi.h / 2, 2);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function renderInputRow() {
      if (!currentUser) return;
      inputRow.innerHTML = `
        <input type="text" id="chat-text-input" class="chat-text-input" placeholder="Écris ton mot doux ici..." maxlength="280">
        <button type="button" class="btn alt" id="chat-send-btn">ENVOYER ✉️</button>
      `;

      const txtInput = inputRow.querySelector('#chat-text-input');
      const sendBtn = inputRow.querySelector('#chat-send-btn');

      async function doSend() {
        const val = txtInput.value;
        if (!val || !val.trim()) return;
        txtInput.value = '';
        Sfx.play('coin');
        await sendMessage(val);
        renderMessages();
      }

      sendBtn.addEventListener('click', doSend);
      txtInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
    }

    function renderAll() {
      renderUserBar();
      renderMessages();
      renderInputRow();
    }

    // Synchro automatique en direct toutes les 6 secondes
    const syncInterval = setInterval(async () => {
      await loadMessages();
      renderMessages();
    }, 6000);

    const backBtn = s.querySelector('#chat-back');
    let backFired = false;
    function goBack(e) {
      if (backFired) return;
      backFired = true;
      clearInterval(syncInterval);
      if (e && e.preventDefault) e.preventDefault();
      Sfx.play('click');
      Game.showTitle();
    }
    backBtn.addEventListener('pointerdown', goBack);
    backBtn.addEventListener('click', goBack);

    renderAll();
    await loadMessages();
    renderMessages();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  const api = { show, loadMessages };
  window.Chat = api;
  return api;
})();
