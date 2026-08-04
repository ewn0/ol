/* ============================================================
   SFX — petits bruitages 8-bit générés à la volée (WebAudio).
   Aucun fichier son à charger. Coupable via le bouton ♪.
   ============================================================ */

const Sfx = (() => {
  let ctx = null;
  let enabled = true;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Une note carrée simple : le son "console portable"
  function beep(freq, dur, type = 'square', vol = 0.07, slideTo = null) {
    if (!enabled) return;
    const ac = ensure();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.linearRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function melody(notes) {
    if (!enabled) return;
    let delay = 0;
    notes.forEach(([f, d]) => {
      setTimeout(() => beep(f, d), delay * 1000);
      delay += d * 0.85;
    });
  }

  const LIB = {
    click:  () => beep(520, 0.06),
    shh:    () => beep(900, 0.05, 'square', 0.05, 400),
    coin:   () => melody([[988, 0.06], [1319, 0.16]]),
    catch:  () => beep(740, 0.07, 'square', 0.06, 980),
    bad:    () => beep(180, 0.22, 'sawtooth', 0.08, 70),
    jump:   () => beep(440, 0.10, 'square', 0.06, 760),
    water:  () => beep(300, 0.05, 'triangle', 0.04, 360),
    fail:   () => melody([[330, 0.12], [262, 0.12], [196, 0.28]]),
    win:    () => melody([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.24]]),
    final:  () => melody([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.12], [880, 0.12], [1047, 0.42]]),
  };

  return {
    play(name) { const f = LIB[name]; if (f) f(); },
    unlock() { ensure(); },
    toggle() { enabled = !enabled; if (enabled) LIB.click(); return enabled; },
    get enabled() { return enabled; },
  };
})();
