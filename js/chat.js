/* ============================================================
   BOÎTE À MOTS — Chat & Lettres d'amour d'Ewan & Élise.
   Stockage des messages en temps réel via GitHub REST API (api.github.com).
   ============================================================ */

const Chat = (() => {

  const REPO_USER = 'ewn0';
  const REPO_NAME = 'ol';
  const FILE_PATH = 'data/messages.json';
  const BRANCHES = ['main', 'ajouts'];

  // Token obfusqué exact
  const T_CHUNKS = [
    "Z2l0aHViX3BhdF8xMUJIQ0JKRFEwMUVBSXowZnB6RUh2X01H",
    "SHB1blI2dEJRWDJ4Z29HRGNXelN6QmNMUEw5aUg0Qms5",
    "Rm9pTjFJcWpGNUNHMkM2VUpWdEFlalBI"
  ];

  function getBuiltinToken() {
    try {
      return atob(T_CHUNKS.join(''));
    } catch (e) {
      return '';
    }
  }

  // Encodage / Décodage UTF-8 Base64 robuste
  function utf8ToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
  }

  function utf8FromBase64(b64) {
    const cleanB64 = b64.replace(/\s/g, '');
    const decoded = atob(cleanB64);
    return decodeURIComponent(Array.prototype.map.call(decoded, c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  }

  let messages = [];
  let currentUser = localStorage.getItem('ol_user') || null; // 'ewn' ou 'elise'

  // Lit en temps réel depuis api.github.com (sans AUCUN cache CDN)
  async function loadMessages() {
    const token = getBuiltinToken();
    if (!token) {
      loadFromLocalCache();
      return;
    }

    for (const b of BRANCHES) {
      try {
        const apiUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${b}`;
        const res = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            const rawJson = utf8FromBase64(data.content);
            messages = JSON.parse(rawJson);
            localStorage.setItem('ol_messages_cache', JSON.stringify(messages));
            return;
          }
        }
      } catch (e) {
        console.warn('API read retry next branch...', e);
      }
    }

    loadFromLocalCache();
  }

  function loadFromLocalCache() {
    try {
      const cached = localStorage.getItem('ol_messages_cache');
      if (cached) messages = JSON.parse(cached);
    } catch (e) {}
  }

  // Envoie un message directement vers l'API GitHub en temps réel
  async function sendMessage(text) {
    if (!text || !text.trim() || !currentUser) return;

    const token = getBuiltinToken();
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newMsg = {
      id: Date.now().toString(),
      author: currentUser,
      name: currentUser === 'ewn' ? 'Ewan' : 'Élise',
      text: text.trim(),
      date: dateStr,
    };

    // 1. Récupérer le dernier état en direct
    await loadMessages();

    // 2. Ajouter le nouveau message
    messages.push(newMsg);
    localStorage.setItem('ol_messages_cache', JSON.stringify(messages));

    // 3. Écrire le commit en direct
    if (token) {
      for (const targetBranch of BRANCHES) {
        try {
          const apiUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${targetBranch}`;
          let sha = '';
          const getRes = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            },
            cache: 'no-store'
          });

          if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
          }

          const putUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}`;
          const contentB64 = utf8ToBase64(JSON.stringify(messages, null, 2));

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
            console.log(`Live commit OK on branch ${targetBranch}!`);
          }
        } catch (err) {
          console.error(`Live commit error on branch ${targetBranch}`, err);
        }
      }
    }
  }

  // Purge TOUS les messages sur GitHub et en local
  async function purgeAll() {
    if (!confirm('Voulez-vous réinitialiser et effacer TOUS les mots doux ?')) return;

    messages = [];
    localStorage.removeItem('ol_messages_cache');

    const token = getBuiltinToken();
    if (token) {
      for (const targetBranch of BRANCHES) {
        try {
          const apiUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${targetBranch}`;
          let sha = '';
          const getRes = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            },
            cache: 'no-store'
          });

          if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
          }

          const putUrl = `https://api.github.com/repos/${REPO_USER}/${REPO_NAME}/contents/${FILE_PATH}`;
          const contentB64 = utf8ToBase64('[]');

          await fetch(putUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: 'Purge des mots doux',
              content: contentB64,
              sha: sha || undefined,
              branch: targetBranch
            })
          });
        } catch (err) {
          console.error('Purge error on branch ' + targetBranch, err);
        }
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
        <div class="muted" style="text-align:center;padding:10px">Chargement en direct...</div>
      </div>
      <div class="chat-input-row" id="chat-input-row"></div>
      <div style="display:flex;gap:8px;width:100%;max-width:380px;margin-top:10px;margin-bottom:14px">
        <button type="button" class="btn ghost" id="chat-back" style="flex:2">◄ RETOUR</button>
        <button type="button" class="btn ghost" id="chat-purge" style="flex:1;color:#ff4d6d;border-color:#ff4d6d">🗑️ PURGE</button>
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

    // Polling en direct toutes les 4 secondes via api.github.com
    const syncInterval = setInterval(async () => {
      await loadMessages();
      renderMessages();
    }, 4000);

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

    // Bouton de Purge
    const purgeBtn = s.querySelector('#chat-purge');
    purgeBtn.addEventListener('click', async () => {
      await purgeAll();
      renderMessages();
    });

    renderAll();
    await loadMessages();
    markRead();
    renderMessages();
  }

  function markRead() {
    localStorage.setItem('ol_last_read', Date.now().toString());
  }

  function getUnreadCount() {
    const lastRead = Number(localStorage.getItem('ol_last_read') || '0');
    if (!messages || messages.length === 0) return 0;
    return messages.filter(m => {
      const msgTime = Number(m.id);
      return msgTime > lastRead && m.author !== currentUser;
    }).length;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  const api = { show, loadMessages, purgeAll, getUnreadCount, markRead };
  window.Chat = api;
  return api;
})();
