/* ============================================================
   BOÎTE À MOTS — Chat & Lettres d'amour d'Ewan & Élise.
   Stockage des messages via un Worker Cloudflare (proxy).
   Aucun secret n'est présent dans ce fichier : le Worker détient
   la clé d'accès à l'espace de stockage, jamais le navigateur.
   Voir cloudflare-worker/worker.js pour le code du Worker et son
   déploiement.
   ============================================================ */

const Chat = (() => {

  // À remplacer par l'URL de ton Worker une fois déployé,
  // ex: 'https://ol-chat.TON-SOUS-DOMAINE.workers.dev'
  const WORKER_URL = 'https://ol-chat.trxshlxrd.workers.dev';
  // Doit correspondre à la variable APP_KEY définie dans le Worker.
  const APP_KEY = '65801aedb5404d1885c7c44f364b5438524900a3';

  let messages = [];
  let currentUser = localStorage.getItem('ol_user') || null; // 'ewn' ou 'elise'
  let syncStarted = false;
  let notifiedIds = new Set();
  try { notifiedIds = new Set(JSON.parse(localStorage.getItem('ol_notified_ids') || '[]')); } catch (e) {}

  function isConfigured() {
    return !WORKER_URL.includes('WORKER_SUBDOMAIN');
  }

  function saveNotifiedIds() {
    localStorage.setItem('ol_notified_ids', JSON.stringify([...notifiedIds].slice(-200)));
  }

  // Notification locale (uniquement pendant que l'app est ouverte, pas de push serveur)
  function notifyNewMessages(list) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!currentUser || !list) return;
    const fresh = list.filter(m => m.author !== currentUser && !notifiedIds.has(m.id));
    if (!fresh.length) return;
    fresh.forEach(m => notifiedIds.add(m.id));
    saveNotifiedIds();
    const last = fresh[fresh.length - 1];
    try {
      new Notification(`💌 ${last.name} t'a écrit un mot`, {
        body: last.text,
        icon: 'assets/icon-192.svg',
        tag: 'ol-chat',
      });
    } catch (e) {}
  }

  function requestNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Poll en arrière-plan (indépendant de l'écran affiché) pour le badge
  // "NEW!" du menu et les notifications — à appeler une fois au démarrage.
  async function startBackgroundSync() {
    if (syncStarted) return;
    syncStarted = true;
    await loadMessages();
    // Les messages déjà présents au démarrage ne déclenchent pas de notif.
    messages.forEach(m => notifiedIds.add(m.id));
    saveNotifiedIds();
    setInterval(async () => {
      await loadMessages();
      notifyNewMessages(messages);
    }, 45000);
  }

  // Lit en temps réel depuis le Worker
  async function loadMessages() {
    if (!isConfigured()) {
      loadFromLocalCache();
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/messages`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          messages = data;
          localStorage.setItem('ol_messages_cache', JSON.stringify(messages));
          return;
        }
      }
    } catch (e) {
      console.warn('Chat: lecture Worker impossible, repli sur le cache local.', e);
    }

    loadFromLocalCache();
  }

  function loadFromLocalCache() {
    try {
      const cached = localStorage.getItem('ol_messages_cache');
      if (cached) messages = JSON.parse(cached);
    } catch (e) {}
  }

  // Envoie un message via le Worker
  async function sendMessage(text) {
    if (!text || !text.trim() || !currentUser) return;

    if (!isConfigured()) {
      // Mode dégradé hors-ligne : conservé uniquement en local.
      messages.push({
        id: Date.now().toString(),
        author: currentUser,
        name: currentUser === 'ewn' ? 'Ewan' : 'Élise',
        text: text.trim(),
        date: new Date().toLocaleString('fr-FR'),
      });
      localStorage.setItem('ol_messages_cache', JSON.stringify(messages));
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY,
        },
        body: JSON.stringify({ author: currentUser, text: text.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          messages = data;
          localStorage.setItem('ol_messages_cache', JSON.stringify(messages));
        }
      }
    } catch (e) {
      console.error('Chat: envoi impossible.', e);
    }
  }

  // Purge TOUS les messages
  async function purgeAll() {
    if (!confirm('Voulez-vous réinitialiser et effacer TOUS les mots doux ?')) return;

    messages = [];
    localStorage.removeItem('ol_messages_cache');

    if (!isConfigured()) return;

    try {
      await fetch(`${WORKER_URL}/purge`, {
        method: 'POST',
        headers: { 'X-App-Key': APP_KEY },
      });
    } catch (e) {
      console.error('Chat: purge impossible.', e);
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
        bEwn.addEventListener('click', () => { currentUser = 'ewn'; localStorage.setItem('ol_user', 'ewn'); requestNotifPermission(); renderAll(); });
        bElise.addEventListener('click', () => { currentUser = 'elise'; localStorage.setItem('ol_user', 'elise'); requestNotifPermission(); renderAll(); });
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

    // Polling en direct toutes les 4 secondes via le Worker
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

  const api = { show, loadMessages, purgeAll, getUnreadCount, markRead, startBackgroundSync };
  window.Chat = api;
  return api;
})();
