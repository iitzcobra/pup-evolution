'use strict';
// Sound effects and background music, all synthesised with Web Audio (no audio files, nothing licensed).
// YouTube's mute and the game's pause both go through SFX.setAllowed; the music toggle only touches the music bus.
// The songs are our own: a bouncy 8-bar loop in C (I-V-vi-IV), re-voiced for each ranch, and a hyperactive ZOOMIES track.
const SFX = (() => {
  let ac = null, master = null, sfxBus = null, musicBus = null, echo = null, noise = null;
  let allowed = true, musicOn = true, nextT = 0, step = 0, zStep = 0, zOn = false;
  const MUSIC_VOL = 0.3;
  function init() {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.connect(master);
      musicBus = ac.createGain(); musicBus.gain.value = musicOn ? MUSIC_VOL : 0; musicBus.connect(master);
      echo = ac.createDelay(1); echo.delayTime.value = 0.32;
      const fb = ac.createGain(), wet = ac.createGain(); fb.gain.value = 0.32; wet.gain.value = 0.4;
      echo.connect(fb); fb.connect(echo); echo.connect(wet); wet.connect(musicBus);
      noise = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
    apply();
  }
  function apply() { if (!ac) return; if (allowed) ac.resume().catch(() => {}); else ac.suspend().catch(() => {}); }
  function setAllowed(on) { allowed = !!on; apply(); }
  function setMusic(on) {
    musicOn = !!on;
    if (ac && musicBus) { musicBus.gain.cancelScheduledValues(ac.currentTime); musicBus.gain.setTargetAtTime(musicOn ? MUSIC_VOL : 0, ac.currentTime, 0.15); }
  }
  function nudge() { if (ac && allowed && ac.state !== 'running') ac.resume().catch(() => {}); }   // fallback on input only
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function voice(type, freq, t0, dur, vol, dest, slideTo, attack) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.03);
    return g;
  }
  function hat(t0, vol, dest, dur) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.05));
    s.connect(f); f.connect(g); g.connect(dest); s.start(t0); s.stop(t0 + (dur || 0.05) + 0.02);
  }
  function clap(t0, vol) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    s.connect(f); f.connect(g); g.connect(musicBus); s.start(t0); s.stop(t0 + 0.14);
  }
  function ready() { return ac && allowed && ac.state === 'running'; }
  function tone(freq, dur, type, vol, slideTo, delay) { if (!ready()) return; voice(type || 'sine', freq, ac.currentTime + (delay || 0), dur, vol || 0.2, sfxBus, slideTo); }

  // ---------- the song ----------
  const MEL = [
    76, 0, 79, 76, 72, 0, 74, 76,   74, 0, 71, 74, 79, 0, 77, 76,   76, 0, 81, 79, 76, 0, 72, 74,   77, 76, 74, 0, 72, 0, 0, 0,
    84, 0, 83, 81, 79, 0, 76, 79,   79, 0, 74, 79, 83, 0, 81, 79,   81, 0, 79, 76, 77, 0, 76, 74,   72, 74, 76, 79, 77, 0, 74, 0];
  const ROOT = [48, 43, 45, 41, 48, 43, 45, 41];                       // C G Am F
  const TRI = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]];
  function musicTick(world, zoomies) {
    if (!ready() || !musicOn) { nextT = 0; return; }
    if (!!zoomies !== zOn) { zOn = !!zoomies; zStep = 0; }            // ZOOMIES starts its own track from the top; the ranch
                                                                       // song picks up where it stopped
    const sd = zOn ? 60 / ZBPM / 4 : 60 / 112 / 2;                     // sixteenths in ZOOMIES, eighths on the ranch
    if (nextT < ac.currentTime - 0.1) nextT = ac.currentTime + 0.05;   // after a stall, pick up from now
    while (nextT < ac.currentTime + 0.25) {
      if (zOn) { zoomStep(zStep, nextT, sd, world); zStep = (zStep + 1) % 128; }
      else { playStep(step, nextT, sd, world); step = (step + 1) % 64; }
      nextT += sd;
    }
  }
  // ---------- the ZOOMIES track (v1.1, owner: "special more hyperactive music while zoomies is active") ----------
  // 168 BPM in D (the ranch song's I-V-vi-IV a step higher): sixteenth-note arpeggios, a bass jumping octaves, a kick on
  // every beat, claps on 2 and 4, sixteenth hats, a hook tune in bars 5-8 and a riser back into the loop.
  const ZBPM = 168;
  const ZROOT = [38, 45, 47, 43];                                        // D A Bm G
  const ZARP = [[74, 78, 81, 86], [73, 76, 81, 85], [71, 74, 78, 83], [71, 74, 79, 83]];
  const ZPAT = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 3, 2, 1, 2];
  const ZHOOK = [81, 78, 81, 86, 85, 81, 78, 81,   81, 76, 81, 85, 83, 81, 76, 73,   78, 83, 86, 83, 81, 78, 83, 86,   86, 85, 83, 81, 79, 78, 76, 0];
  const ZV = 1.45;                                   // +3 dB: dev/music-test.html measured ZOOMIES at -42 dB in every ranch, 1.03-1.8x
                                                     // the ranch song's loudness (it was 0.73-0.93x before), peak -15.6 dB
  function zoomStep(i, t, sd, w) {
    const bar = i >> 4, s = i & 15, c = bar & 3, root = ZROOT[c], hook = bar >= 4;
    if (s % 4 === 0) voice('sine', 160, t, 0.11, 0.3 * ZV, musicBus, 42);                // kick
    if (s === 4 || s === 12) clap(t, 0.13 * ZV);
    hat(t, (s % 4 === 2 ? 0.05 : s % 2 ? 0.022 : 0.03) * ZV, musicBus, s % 4 === 2 ? 0.1 : 0.03);
    if (s === 0 && (bar === 0 || bar === 4)) hat(t, 0.06 * ZV, musicBus, 0.6);            // crash at the top of each half
    if (s % 2 === 0) {                                                                    // bass
      const n = s % 4 === 0 ? root : root + 12;
      voice('triangle', hz(n), t, sd * 1.7, 0.16 * ZV, musicBus); voice('sawtooth', hz(n), t, sd * 1.2, 0.035 * ZV, musicBus);
    }
    const a = ZARP[c][ZPAT[s]];                                                           // arpeggio, each ranch its own colour
    if (w === 3) voice('sine', hz(a), t, sd * 0.9, (hook ? 0.05 : 0.07) * ZV, echo);
    else voice(w === 1 ? 'triangle' : 'square', hz(a), t, sd * 0.9, (w === 1 ? (hook ? 0.06 : 0.09) : (hook ? 0.022 : 0.032)) * ZV, musicBus);
    if (hook && s % 2 === 0) { const m = ZHOOK[(bar - 4) * 8 + (s >> 1)]; if (m) { voice('triangle', hz(m), t, sd * 1.8, 0.12 * ZV, musicBus); voice('sine', hz(m), t, sd * 1.8, 0.04 * ZV, echo); } }
    if (bar === 7 && s === 8) voice('sawtooth', 220, t, sd * 8, 0.04 * ZV, musicBus, 1760, sd * 6);   // riser into the loop
  }
  function playStep(i, t, sd, w) {
    const bar = i >> 3, s = i & 7, root = ROOT[bar], tri = TRI[bar % 4], m = MEL[i];
    // lead
    if (m) {
      if (w === 0) voice('triangle', hz(m), t, sd * 1.6, 0.2, musicBus);
      else if (w === 1) { voice('sine', hz(m), t, sd * 1.8, 0.22, musicBus); voice('sine', hz(m) * 4, t, 0.05, 0.05, musicBus); }
      else if (w === 2) { voice('square', hz(m), t, sd * 1.3, 0.06, musicBus); voice('triangle', hz(m - 12), t, sd * 1.3, 0.08, musicBus); }
      else { voice('sine', hz(m), t, sd * 2.2, 0.18, musicBus); voice('sine', hz(m), t, sd * 2.2, 0.1, echo); }
    }
    // bass
    const bn = s === 0 || s === 4 ? root : s === 3 ? root + 7 : s === 6 ? root + 12 : 0;
    if (bn) voice(w === 2 ? 'sawtooth' : 'triangle', hz(bn), t, sd * 0.9, w === 2 ? 0.07 : 0.2, musicBus);
    // chords: off-beat strum, or a soft pad in space
    if (w === 3) { if (s === 0) for (const n of tri) voice('sine', hz(n), t, sd * 7.5, 0.05, musicBus, null, 0.3); }
    else if (s === 2 || s === 6) for (let k = 0; k < 3; k++) voice('triangle', hz(tri[k]), t + k * 0.012, sd * 0.7, 0.06, musicBus);
    // drums
    if (s === 0 || s === 4) voice('sine', w === 2 ? 110 : 140, t, 0.12, w === 2 ? 0.35 : 0.22, musicBus, 45);
    if (s % 2 === 1) hat(t, w === 1 ? 0.05 : 0.035, musicBus, w === 1 ? 0.08 : 0.04);
    if (w === 3 && s % 2 === 1 && Math.random() < 0.4) voice('triangle', hz(tri[(Math.random() * 3) | 0] + 24), t, 0.15, 0.04, echo);
  }

  return {
    init, setAllowed, setMusic, nudge, musicTick,
    get state() { return ac ? ac.state : 'none'; },
    pick() { tone(520, 0.07, 'triangle', 0.12, 700); },
    drop() { tone(300, 0.08, 'triangle', 0.1, 220); },
    merge(level) {
      const f = 330 * Math.pow(1.06, level);
      tone(f, 0.12, 'triangle', 0.22, f * 1.5); tone(f * 1.5, 0.16, 'sine', 0.16, f * 2, 0.08);
      if (level >= 9) tone(f * 2, 0.3, 'sine', 0.08, f * 3, 0.16);
    },
    adopt() { tone(660, 0.06, 'square', 0.05); tone(990, 0.1, 'triangle', 0.12, 1320, 0.05); },
    crate() { tone(440, 0.1, 'triangle', 0.15, 700); tone(880, 0.12, 'sine', 0.1, 1200, 0.08); },
    nope() { tone(180, 0.12, 'sawtooth', 0.05, 140); },
    discover() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.17, null, i * 0.08)); },
    coins() { tone(1200, 0.05, 'sine', 0.07); tone(1600, 0.08, 'sine', 0.06, null, 0.04); },
    pet(paid) { tone(paid ? 880 : 700, 0.09, 'sine', 0.1, paid ? 1100 : 800); },
    upgrade() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.12, 'square', 0.05, null, i * 0.05)); },
    jackpot() { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.16, 'triangle', 0.14, null, i * 0.06)); },
    zoomies() {                                      // a rising sweep, a bass thump, a fast arpeggio and a sparkle
      tone(90, 0.35, 'sine', 0.3, 45); tone(200, 0.55, 'sawtooth', 0.07, 1400);
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.13, 'square', 0.055, null, 0.28 + i * 0.05));
      tone(2093, 0.35, 'sine', 0.06, 2637, 0.6);
    },
    zoomPop(n) {                                     // ZOOMIES merges: each one a step up a pentatonic scale (3 octaves, then round)
      const st = [0, 2, 4, 7, 9], k = Math.max(0, (n | 0) - 1), semi = st[k % 5] + 12 * (Math.floor(k / 5) % 3), f = 523 * Math.pow(2, semi / 12);
      tone(f, 0.09, 'triangle', 0.13, f * 1.26); tone(f * 2, 0.06, 'sine', 0.04, null, 0.03);
    },
    haul() { tone(1568, 0.08, 'sine', 0.1); tone(2093, 0.18, 'sine', 0.1, null, 0.07); for (let i = 0; i < 7; i++) tone(1100 + i * 140, 0.05, 'triangle', 0.06, null, 0.12 + i * 0.045); [523, 659, 784, 1047].forEach((f) => tone(f, 0.4, 'triangle', 0.06, null, 0.45)); },
    pop() { tone(700, 0.06, 'sine', 0.05, 1050); },
    lucky() { [1047, 1319, 1568].forEach((f, i) => tone(f, 0.1, 'triangle', 0.1, null, i * 0.05)); },
    bye() { [659, 523, 392].forEach((f, i) => tone(f, 0.12, 'triangle', 0.08, null, i * 0.08)); },
    click() { tone(880, 0.04, 'triangle', 0.06); },
    cheer(big) { (big ? [523, 659, 784, 1047, 1319, 1568] : [784, 988, 1319]).forEach((f, i) => tone(f, 0.12, 'triangle', 0.12, null, i * 0.07)); },
  };
})();
