/* ============================================================
   PETIT RAPPEL DOUX — installer le jeu sur l'écran d'accueil
   (iOS/Safari n'a pas de prompt natif, il faut expliquer les
   étapes), puis activer les notifs une fois installé. Jamais
   imposé : un bandeau discret qui ne revient plus une fois fermé.
   ============================================================ */

const PwaHint = (() => {

  const DISMISS_INSTALL = 'ol_hint_install_dismissed';
  const DISMISS_NOTIF = 'ol_hint_notif_dismissed';

  // Android/Chrome propose un vrai prompt natif d'installation. On l'intercepte
  // tout de suite (l'évènement peut arriver bien avant qu'on l'utilise) pour
  // le déclencher plus tard depuis notre propre bandeau, plutôt que la mini-
  // barre générique du navigateur.
  let deferredInstallEvent = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallEvent = e;
  });
  window.addEventListener('appinstalled', () => {
    localStorage.setItem(DISMISS_INSTALL, '1');
  });

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  // iOS Safari précisément (pas Chrome/Firefox sur iOS, qui n'ont pas le
  // même chemin « Partager → Sur l'écran d'accueil »). Le second test
  // rattrape le mode « Afficher le site web pour ordinateur », qui fait
  // disparaître "iPhone"/"iPad" du user-agent sur certains iOS/iPadOS.
  function isIosSafari() {
    const ua = navigator.userAgent;
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Android/.test(ua);
    const ios = /iP(hone|od|ad)/.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return ios && safari;
  }

  function banner(html) {
    const host = document.createElement('div');
    host.className = 'hint-banner';
    host.innerHTML = html;
    document.body.appendChild(host);
    requestAnimationFrame(() => host.classList.add('on'));

    function close() {
      host.classList.remove('on');
      setTimeout(() => host.remove(), 350);
    }
    host.querySelector('.hint-close').addEventListener('click', close);
    return { host, close };
  }

  function showInstallHintIos() {
    const { host } = banner(`
      <button type="button" class="hint-close" aria-label="Fermer">×</button>
      <div class="hint-icon">📲</div>
      <div class="hint-text">
        Tu peux installer ce jeu sur ton écran d'accueil si tu veux.
        Aucune pression. Enfin si, un peu.
        <span class="hint-steps">Appuie sur « Partager » (⬆️ en bas de Safari), puis « Sur l'écran d'accueil ».</span>
      </div>
    `);
    host.querySelector('.hint-close').addEventListener('click', () => {
      localStorage.setItem(DISMISS_INSTALL, '1');
    });
  }

  function showInstallHintAndroid() {
    const { host, close } = banner(`
      <button type="button" class="hint-close" aria-label="Fermer">×</button>
      <div class="hint-icon">📲</div>
      <div class="hint-text">
        Tu peux installer ce jeu sur ton téléphone si tu veux.
        Aucune pression. Enfin si, un peu.
      </div>
      <button type="button" class="btn ghost hint-cta">INSTALLER</button>
    `);
    host.querySelector('.hint-close').addEventListener('click', () => {
      localStorage.setItem(DISMISS_INSTALL, '1');
    });
    host.querySelector('.hint-cta').addEventListener('click', async () => {
      if (window.Sfx) Sfx.play('click');
      // Le bandeau doit se fermer et ne plus revenir quoi qu'il arrive côté
      // navigateur (prompt() qui échoue, événement déjà expiré, ou userChoice
      // qui ne se résout jamais — d'où le timeout de secours ci-dessous).
      try {
        if (deferredInstallEvent) {
          deferredInstallEvent.prompt().catch(() => {});
          await Promise.race([
            deferredInstallEvent.userChoice,
            new Promise(resolve => setTimeout(resolve, 3000)),
          ]);
        }
      } catch (e) {}
      deferredInstallEvent = null;
      localStorage.setItem(DISMISS_INSTALL, '1');
      close();
    });
  }

  function showNotifHint() {
    const { host, close } = banner(`
      <button type="button" class="hint-close" aria-label="Fermer">×</button>
      <div class="hint-icon">🔔</div>
      <div class="hint-text">
        Tu peux activer les notifs pour savoir direct quand j'écris un mot doux.
        Toujours pas obligé.
      </div>
      <button type="button" class="btn ghost hint-cta">ACTIVER</button>
    `);
    host.querySelector('.hint-close').addEventListener('click', () => {
      localStorage.setItem(DISMISS_NOTIF, '1');
    });
    host.querySelector('.hint-cta').addEventListener('click', () => {
      if (window.Sfx) Sfx.play('click');
      Notification.requestPermission().then(() => {
        localStorage.setItem(DISMISS_NOTIF, '1');
        close();
      });
    });
  }

  // Un seul bandeau à la fois : d'abord l'installation (préalable
  // obligatoire sur iOS pour avoir droit aux notifs), puis les notifs
  // une fois que c'est fait.
  function check() {
    const installSeen = localStorage.getItem(DISMISS_INSTALL) === '1';
    if (!isStandalone() && !installSeen) {
      if (isIosSafari()) { showInstallHintIos(); return; }
      if (deferredInstallEvent) { showInstallHintAndroid(); return; }
    }
    if (isStandalone() && 'Notification' in window
        && Notification.permission === 'default'
        && localStorage.getItem(DISMISS_NOTIF) !== '1') {
      showNotifHint();
    }
  }

  const api = { check };
  window.PwaHint = api;
  return api;
})();
