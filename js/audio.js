/* ============================================================
   SFX & BGM — petit moteur audio 8-bit en WebAudio synthétique.
   Aucun fichier externe. Musique chiptune & bruitages rétro.
   ============================================================ */

const Sfx = (() => {
  let ctx = null;
  let enabled = true;

  // Réglages fins (écran Options) : indépendants du bouton mute global du HUD,
  // qui reste le coupe-son général (enabled). Persistés en localStorage.
  let sfxOn = localStorage.getItem('ol_sfx_on') !== '0';
  let bgmOn = localStorage.getItem('ol_bgm_on') !== '0';

  // BGM Sequencer state
  let bgmTimer = null;
  let bgmNoteIndex = 0;
  let currentTrack = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* --- Note frequencies --- */
  const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    0: 0, // Rest
  };

  /* --- 8-bit Chiptune Music Tracks --- */
  const TRACKS = {
    main: {
      tempo: 130,
      melody: [
        ['E5', 0.25], ['G5', 0.25], ['A5', 0.5], ['G5', 0.25], ['E5', 0.25], ['C5', 0.5],
        ['D5', 0.25], ['E5', 0.25], ['G5', 0.5], ['E5', 0.25], ['D5', 0.25], ['C5', 0.5],
        ['A4', 0.25], ['C5', 0.25], ['E5', 0.5], ['D5', 0.25], ['C5', 0.25], ['D5', 0.5],
        ['E5', 0.25], ['G5', 0.25], ['A5', 0.5], ['B5', 0.25], ['A5', 0.25], ['G5', 0.5],
      ],
      bass: [
        ['C3', 0.5], ['G3', 0.5], ['A3', 0.5], ['E3', 0.5],
        ['F3', 0.5], ['C3', 0.5], ['G3', 0.5], ['G3', 0.5],
      ]
    },
    action: {
      tempo: 155,
      melody: [
        ['A5', 0.2], ['A5', 0.2], ['C6', 0.2], ['A5', 0.2], ['E5', 0.2], ['G5', 0.4],
        ['F5', 0.2], ['F5', 0.2], ['A5', 0.2], ['F5', 0.2], ['D5', 0.2], ['E5', 0.4],
        ['G5', 0.2], ['G5', 0.2], ['B5', 0.2], ['G5', 0.2], ['E5', 0.2], ['C5', 0.4],
        ['D5', 0.2], ['E5', 0.2], ['F5', 0.2], ['G5', 0.2], ['A5', 0.4], ['0',  0.2],
      ],
      bass: [
        ['A3', 0.4], ['E3', 0.4], ['F3', 0.4], ['C3', 0.4],
        ['G3', 0.4], ['D3', 0.4], ['E3', 0.4], ['E3', 0.4],
      ]
    }
  };

  // Une note carrée simple : le son "console portable"
  function beep(freq, dur, type = 'square', vol = 0.05, slideTo = null) {
    if (!enabled || !freq) return;
    const ac = ensure();
    if (!ac) return;
    try {
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
    } catch (e) {}
  }

  function melody(notes) {
    if (!enabled) return;
    let delay = 0;
    notes.forEach(([f, d]) => {
      setTimeout(() => beep(f, d), delay * 1000);
      delay += d * 0.85;
    });
  }

  /* --- Sequencer BGM --- */
  function startBgm(name = 'main') {
    stopBgm();
    currentTrack = TRACKS[name] || TRACKS.main;
    bgmNoteIndex = 0;

    let melIdx = 0;
    let bassIdx = 0;

    function step() {
      if (!enabled || !bgmOn) return;
      const melNote = currentTrack.melody[melIdx % currentTrack.melody.length];
      const bassNote = currentTrack.bass[bassIdx % currentTrack.bass.length];

      if (melNote && melNote[0]) {
        const freq = NOTES[melNote[0]] || 0;
        if (freq) beep(freq, melNote[1] * 0.8, 'square', 0.035);
      }

      if (bassNote && bassNote[0]) {
        const freqBass = NOTES[bassNote[0]] || 0;
        if (freqBass) beep(freqBass, bassNote[1] * 0.9, 'triangle', 0.045);
      }

      melIdx++;
      if (melIdx % 2 === 0) bassIdx++;

      const stepDuration = (melNote ? melNote[1] : 0.3) * (60 / currentTrack.tempo) * 1000;
      bgmTimer = setTimeout(step, stepDuration);
    }

    step();
  }

  function stopBgm() {
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
  }

  const LIB = {
    click:    () => beep(520, 0.06),
    shh:      () => beep(900, 0.05, 'square', 0.05, 400),
    coin:     () => melody([[988, 0.06], [1319, 0.16]]),
    catch:    () => beep(740, 0.07, 'square', 0.06, 980),
    bad:      () => beep(180, 0.22, 'sawtooth', 0.08, 70),
    jump:     () => beep(440, 0.10, 'square', 0.06, 760),
    water:    () => beep(300, 0.05, 'triangle', 0.04, 360),
    fail:     () => melody([[330, 0.12], [262, 0.12], [196, 0.28]]),
    win:      () => melody([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.24]]),
    final:    () => melody([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.12], [880, 0.12], [1047, 0.42]]),
    critical: () => melody([[1047, 0.08], [1319, 0.08], [1567, 0.18]]),
    combo:    () => melody([[784, 0.06], [988, 0.06], [1174, 0.12]]),
  };

  return {
    play(name) { if (!enabled || !sfxOn) return; const f = LIB[name]; if (f) f(); },
    unlock() { ensure(); },
    toggle() {
      enabled = !enabled;
      if (enabled) {
        LIB.click();
        if (currentTrack) startBgm(currentTrack === TRACKS.action ? 'action' : 'main');
      } else {
        stopBgm();
      }
      return enabled;
    },
    startBgm,
    stopBgm,
    get enabled() { return enabled; },

    /* --- Réglages fins (écran Options) --- */
    isSfxOn() { return sfxOn; },
    isBgmOn() { return bgmOn; },
    setSfxOn(v) {
      sfxOn = v;
      localStorage.setItem('ol_sfx_on', v ? '1' : '0');
    },
    setBgmOn(v) {
      bgmOn = v;
      localStorage.setItem('ol_bgm_on', v ? '1' : '0');
      if (!v) stopBgm();
      else if (currentTrack) startBgm(currentTrack === TRACKS.action ? 'action' : 'main');
    },
  };
})();
