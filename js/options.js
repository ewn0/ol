/* ============================================================
   OPTIONS — réglages son fins + réinitialisation de la progression.
   Le bouton ♪ du HUD reste le coupe-son général : ici on affine
   musique / bruitages séparément, et on peut repartir de zéro.
   ============================================================ */

const OptionsScreen = (() => {

  function resetProgress() {
    const ok = confirm('Réinitialiser la progression (niveaux terminés + succès) ? Les mots doux ne sont pas touchés.');
    if (!ok) return;
    localStorage.removeItem('ol_completed_levels');
    localStorage.removeItem('ol_flags');
    Sfx.play('click');
    show();
  }

  function show() {
    if (Game.clearScene) Game.clearScene();
    const stage = document.getElementById('stage');
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');

    const s = document.createElement('div');
    s.className = 'scene center-col';

    const bgmOn = Sfx.isBgmOn();
    const sfxOn = Sfx.isSfxOn();

    s.innerHTML = `
      <h2 style="color:var(--yellow);margin-bottom:6px">OPTIONS ⚙️</h2>
      <div class="panel" style="width:100%;max-width:320px">
        <p class="muted" style="text-align:center;margin-bottom:10px">Le bouton ♪ en haut coupe tout le son. Ici, on peut ajuster juste la musique ou juste les bruitages.</p>
        <button type="button" class="btn ${bgmOn ? 'alt' : 'ghost'} big" id="opt-bgm" style="margin-bottom:10px">🎵 MUSIQUE : ${bgmOn ? 'ON' : 'OFF'}</button>
        <button type="button" class="btn ${sfxOn ? 'alt' : 'ghost'} big" id="opt-sfx">🔔 BRUITAGES : ${sfxOn ? 'ON' : 'OFF'}</button>
      </div>
      <button type="button" class="btn ghost big" id="opt-reset" style="color:#ff4d6d;border-color:#ff4d6d;margin-top:14px">🗑️ RÉINITIALISER LA PROGRESSION</button>
      <button type="button" class="btn ghost big" id="opt-back" style="margin-top:6px">◄ MENU</button>
    `;
    stage.appendChild(s);

    s.querySelector('#opt-bgm').addEventListener('click', () => {
      Sfx.play('click');
      Sfx.setBgmOn(!Sfx.isBgmOn());
      show();
    });

    s.querySelector('#opt-sfx').addEventListener('click', () => {
      const next = !Sfx.isSfxOn();
      Sfx.setSfxOn(next);
      if (next) Sfx.play('click');
      show();
    });

    s.querySelector('#opt-reset').addEventListener('click', resetProgress);

    const backBtn = s.querySelector('#opt-back');
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
  window.OptionsScreen = api;
  return api;
})();
