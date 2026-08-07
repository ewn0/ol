/* ============================================================
   VERROUILLAGE PAR MOT DE PASSE — écran d'accès avant le jeu.
   ⚠️ Ceci n'est PAS une sécurité réelle : le code est visible par
   quiconque ouvre les outils de développement du navigateur. C'est
   juste un petit filtre pour décourager les visiteurs de passage.

   ▼▼▼ CHANGE LE MOT DE PASSE ICI ▼▼▼
------------------------------------------------------------------ */
const LOCK_PASSWORD = '0108';
/* ------------------------------------------------------------------ */

const Lock = (() => {
  const STORAGE_KEY = 'ol_unlocked';

  function isUnlocked() {
    return localStorage.getItem(STORAGE_KEY) === '1';
  }

  function show(onUnlock) {
    const stage = document.getElementById('stage');
    stage.innerHTML = '';

    const s = document.createElement('div');
    s.className = 'scene center-col';
    s.innerHTML = `
      <div class="lock-canvas-box" id="lock-canvas-box"></div>
      <h2 style="color:var(--yellow)">ACCÈS PROTÉGÉ</h2>
      <div class="panel" style="width:100%;max-width:300px">
        <input type="password" id="lock-input" class="chat-text-input" placeholder="Mot de passe" style="width:100%;text-align:center;box-sizing:border-box" autocomplete="off" inputmode="numeric" pattern="[0-9]*" maxlength="4">
        <div class="muted" id="lock-error" style="margin-top:8px;min-height:12px;color:var(--pink)"></div>
      </div>
      <button type="button" class="btn big alt" id="lock-btn">DÉVERROUILLER</button>
    `;
    stage.appendChild(s);

    const cvBox = s.querySelector('#lock-canvas-box');
    const cvApi = makeCanvas(cvBox);
    let unlockProgress = 0;   // 0 = fermé, 1 = grand ouvert
    let shakeT = 0;
    let raf = 0;

    function drawLock() {
      const { ctx, w, h } = cvApi;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + (shakeT > 0 ? Math.sin(performance.now() / 25) * 4 : 0);
      const cy = h / 2 + 8;
      const scale = Math.max(3, Math.floor(Math.min(w, h) / 32));

      ctx.save();
      ctx.translate(cx, cy);

      // Anse du cadenas : se soulève et pivote quand ça se déverrouille
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = scale * 1.1;
      ctx.lineCap = 'round';
      ctx.save();
      ctx.translate(-scale * 0.6, -scale * 5 - unlockProgress * scale * 5);
      ctx.rotate(unlockProgress * -1.1);
      ctx.beginPath();
      ctx.arc(scale * 0.6, 0, scale * 3, Math.PI, 0, false);
      ctx.stroke();
      ctx.restore();

      // Corps du cadenas
      ctx.fillStyle = '#8f5cff';
      ctx.fillRect(-scale * 4, -scale * 2, scale * 8, scale * 6);
      ctx.strokeStyle = '#14122b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-scale * 4, -scale * 2, scale * 8, scale * 6);

      // Trou de serrure (vert une fois ouvert)
      ctx.fillStyle = unlockProgress > 0.4 ? '#3ddc84' : '#14122b';
      ctx.beginPath();
      ctx.arc(0, scale * 0.4, scale * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-scale * 0.22, scale * 0.4, scale * 0.44, scale * 1.1);

      ctx.restore();
    }

    (function loop() {
      drawLock();
      if (shakeT > 0) shakeT -= 0.06;
      raf = requestAnimationFrame(loop);
    })();

    const input = s.querySelector('#lock-input');
    const errEl = s.querySelector('#lock-error');
    const btn = s.querySelector('#lock-btn');

    function fail() {
      if (window.Sfx) Sfx.play('bad');
      errEl.textContent = 'Mot de passe incorrect.';
      shakeT = 1;
      input.value = '';
      input.focus();
    }

    function succeed() {
      if (window.Sfx) Sfx.play('win');
      errEl.textContent = '';
      btn.disabled = true;
      input.disabled = true;

      const start = performance.now();
      const dur = 650;
      (function anim(t) {
        const k = Math.min(1, (t - start) / dur);
        unlockProgress = k;
        if (k < 1) requestAnimationFrame(anim);
        else {
          setTimeout(() => {
            cancelAnimationFrame(raf);
            localStorage.setItem(STORAGE_KEY, '1');
            onUnlock();
          }, 350);
        }
      })(start);
    }

    function tryUnlock() {
      if (input.value === LOCK_PASSWORD) succeed();
      else fail();
    }

    btn.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
    setTimeout(() => input.focus(), 50);
  }

  const api = { isUnlocked, show };
  window.Lock = api;
  return api;
})();
