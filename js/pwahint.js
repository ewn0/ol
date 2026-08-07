/* ============================================================
   PETIT RAPPEL DOUX — installer le jeu sur l'écran d'accueil
   (iOS/Safari n'a pas de prompt natif, il faut expliquer les
   étapes), puis activer les notifs une fois installé. Jamais
   imposé : un bandeau discret qui ne revient plus une fois fermé.
   ============================================================ */

const PwaHint = (() => {

  const DISMISS_INSTALL = 'ol_hint_install_dismissed';
  const DISMISS_NOTIF = 'ol_hint_notif_dismissed';

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  // iOS Safari précisément (pas Chrome/Firefox sur iOS, qui n'ont pas le
  // même chemin « Partager → Sur l'écran d'accueil »).
  function isIosSafari() {
    const ua = navigator.userAgent;
    const ios = /iP(hone|od|ad)/.test(ua);
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
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

  function showInstallHint() {
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
    if (!isStandalone() && isIosSafari() && localStorage.getItem(DISMISS_INSTALL) !== '1') {
      showInstallHint();
      return;
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
