/* music.js — "epic fantasy adventure" loop + SFX, generated live with the Web Audio API (no audio files).
   140 BPM, 1/16 steps, 4-bar loop in D minor: Dm – Bb – F – C. */
(function () {
  var ac = null, master, comp, sfxBus, fOst, fPad, fBass, fLead, noiseBuf;
  var timer = null, nextT = 0, step = 0;
  var spb = 60 / 140 / 4;
  var on = false;

  var CHORDS = [[62,65,69],[62,65,70],[60,65,69],[60,64,67]];
  var OST    = [[62,69,74,69],[58,65,70,65],[65,72,77,72],[60,67,72,67]];
  var ROOTS  = [38,34,41,36];
  var MELODY = [
    [69,null,74,null,76,77,null,76, 74,null,null,null,72,null,74,null],  // Dm
    [77,null,74,null,77,79,null,81, 79,null,77,null,74,null,null,null],  // Bb
    [84,null,81,null,79,77,null,79, 81,null,null,null,77,null,79,null],  // F
    [76,null,79,null,77,76,null,74, 72,null,76,null,79,null,81,null]     // C
  ];

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function lp(freq, q, dest) {
    var f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; f.Q.value = q || 0.7; f.connect(dest); return f;
  }

  function init() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    ac = new Ctx();
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5;
    comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = 0; master.connect(comp);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(comp);
    fOst = lp(2400, 1, master); fPad = lp(1600, 0.7, master); fBass = lp(500, 0.7, master); fLead = lp(2800, 2, master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  /* ---------- voices ---------- */
  function env(g, t, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function osc(type, freq, t, dur, dest, detune) {
    var o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (detune) o.detune.value = detune;
    o.connect(dest); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function noise(t, dur, dest) {
    var s = ac.createBufferSource(); s.buffer = noiseBuf; s.connect(dest); s.start(t); s.stop(t + dur + 0.05); return s;
  }
  function drum(t, f0, f1, dur, vol, dest) {
    var g = ac.createGain(); g.connect(dest || master);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var o = osc('sine', f0, t, dur, g); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
  }
  function filteredNoise(t, type, freq, q, vol, attack, dur, dest) {
    var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = ac.createGain(); f.connect(g); g.connect(dest || master);
    env(g, t, attack, vol, dur);
    noise(t, dur, f);
    return f;
  }
  function pad(t, chord, dur) {
    var g = ac.createGain(); g.connect(fPad);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.25);
    g.gain.setValueAtTime(0.05, t + dur - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    chord.forEach(function (m) {
      var f = mtof(m);
      osc('sawtooth', f, t, dur + 0.1, g, -7);
      osc('sawtooth', f, t, dur + 0.1, g, 7);
      osc('triangle', f / 2, t, dur + 0.1, g);
    });
  }
  function ostinato(t, m) {
    var g = ac.createGain(); g.connect(fOst); env(g, t, 0.005, 0.07, spb * 0.95);
    osc('sawtooth', mtof(m), t, spb, g);
  }
  function bass(t, m) {
    var g = ac.createGain(); g.connect(fBass); env(g, t, 0.01, 0.22, spb * 1.8);
    osc('sawtooth', mtof(m), t, spb * 1.8, g);
    osc('sine', mtof(m - 12), t, spb * 1.8, g);
  }
  function lead(t, m) {
    var g = ac.createGain(); g.connect(fLead); env(g, t, 0.02, 0.06, 0.42);
    osc('sawtooth', mtof(m), t, 0.42, g);
    osc('square', mtof(m - 12), t, 0.42, g);
    osc('sine', mtof(m + 12), t, 0.42, g);
  }

  function playStep(s, t) {
    var bar = Math.floor(s / 16), k = s % 16;
    if (k === 0 || k === 6 || k === 8 || k === 11) drum(t, 120, 42, 0.45, 0.95);
    if (k === 12 || k === 14) drum(t, 180, 90, 0.3, 0.55);
    if (k === 4 || k === 12) filteredNoise(t, 'bandpass', 1500, 0.8, 0.45, 0.002, 0.22);
    if (k % 2 === 1) filteredNoise(t, 'highpass', 7000, 0, 0.1, 0.001, 0.05);
    if (bar === 3 && k === 8) filteredNoise(t, 'highpass', 5000, 0, 0.22, 0.8, 1.6);
    if (k === 0) pad(t, CHORDS[bar], spb * 16);
    ostinato(t, OST[bar][k % 4]);
    if (k % 2 === 0 || k % 4 === 3) bass(t, ROOTS[bar]);
    var m = MELODY[bar][k];
    if (m != null) lead(t, m);
  }

  function schedule() {
    while (nextT < ac.currentTime + 0.2) {
      playStep(step, nextT);
      nextT += spb;
      step = (step + 1) % 64;
    }
  }

  /* ---------- public ---------- */
  function start() {
    if (!ac && !init()) return false;
    if (ac.state === 'suspended') ac.resume();
    if (on) return true;
    on = true;
    var t = ac.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.5, t + 1.2);
    step = 0; nextT = t + 0.08;
    clearInterval(timer);
    timer = setInterval(schedule, 50);
    schedule();
    return true;
  }
  function stop() {
    if (!ac || !on) return;
    on = false;
    var t = ac.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.5);
    setTimeout(function () { if (!on) clearInterval(timer); }, 600);
  }

  function sfx(name) {
    if (!on || !ac) return;
    var t = ac.currentTime + 0.01, g;
    if (name === 'tap') {
      g = ac.createGain(); g.connect(sfxBus); env(g, t, 0.005, 0.25, 0.18);
      osc('triangle', mtof(86), t, 0.18, g);
      var g2 = ac.createGain(); g2.connect(sfxBus); env(g2, t + 0.05, 0.005, 0.18, 0.22);
      osc('sine', mtof(93), t + 0.05, 0.22, g2);
    } else if (name === 'swoosh') {
      var f = filteredNoise(t, 'bandpass', 250, 2, 0.6, 0.2, 0.55, sfxBus);
      f.frequency.setValueAtTime(250, t);
      f.frequency.exponentialRampToValueAtTime(5000, t + 0.45);
    } else if (name === 'hit') {
      drum(t, 130, 40, 0.6, 1, sfxBus);
      g = ac.createGain(); var lf = lp(2200, 1, sfxBus); g.connect(lf); env(g, t, 0.01, 0.12, 0.9);
      [62, 69, 74, 81].forEach(function (m) { osc('sawtooth', mtof(m), t, 0.9, g); });
    } else if (name === 'wish') {
      [62, 69, 74, 77, 81, 86, 89].forEach(function (m, i) {
        var gg = ac.createGain(); gg.connect(sfxBus); env(gg, t + i * 0.06, 0.005, 0.2, 0.5);
        osc('triangle', mtof(m), t + i * 0.06, 0.5, gg);
      });
      drum(t + 0.42, 130, 40, 0.6, 1, sfxBus);
    }
  }

  AK.music = {
    start: start, stop: stop, sfx: sfx,
    isOn: function () { return on; },
    toggle: function () { if (on) stop(); else start(); return on; }
  };
  AK.sfx = sfx;
})();
