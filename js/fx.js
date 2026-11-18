/* fx.js — layered fantasy background, parallax, cursor light, spark trail and click bursts. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  AK.reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Deterministic random so the sky looks the same on every visit.
  var seed = 7;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function r(a, b) { return a + rnd() * (b - a); }
  function f(n) { return Math.round(n * 10) / 10; }

  function svg(inner, cls) {
    return '<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"' + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</svg>';
  }

  /* ---------- shared gradients (kept in one visible-but-empty SVG) ---------- */
  var DEFS =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="gemTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#D9CCFF"/><stop offset="1" stop-color="#9FE3F2"/></linearGradient>' +
    '<linearGradient id="gemL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E6FF"/><stop offset="1" stop-color="#7B5BC9"/></linearGradient>' +
    '<linearGradient id="gemR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC6DE"/><stop offset="1" stop-color="#2E2266"/></linearGradient>' +
    '<radialGradient id="halo"><stop offset="0" stop-color="#FFB8DA" stop-opacity=".55"/><stop offset="1" stop-color="#FFB8DA" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="moonG" cx=".4" cy=".35"><stop offset="0" stop-color="#FFFDF4"/><stop offset=".6" stop-color="#FFE7D6"/><stop offset="1" stop-color="#F6B9CF"/></radialGradient>' +
    '<linearGradient id="rayG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="pillarG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A3" stop-opacity="0"/><stop offset=".6" stop-color="#FFC6E6" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".8"/></linearGradient>' +
    '<linearGradient id="ribbonG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A3163A"/><stop offset=".5" stop-color="#FF4F6E"/><stop offset="1" stop-color="#C8283C"/></linearGradient>' +
    '<linearGradient id="swirlG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#FFB3E6"/><stop offset=".7" stop-color="#C77DFF"/><stop offset="1" stop-color="#6A5BFF"/></linearGradient>' +
    '<linearGradient id="hillG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2C88"/><stop offset="1" stop-color="#1A1450"/></linearGradient>' +
    '<filter id="blur60" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>' +
    '<filter id="blur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>' +
    '<filter id="glow3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '</defs></svg>';

  /* ---------- reusable pieces ---------- */
  function gem(x, y, s, rot, dur, delay) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ') rotate(' + f(rot) + ')">' +
      '<g class="gem" style="animation-duration:' + f(dur) + 's;animation-delay:' + f(delay) + 's">' +
      '<path d="M-30 -8 L-18 -22 L18 -22 L30 -8Z" fill="url(#gemTop)"/>' +
      '<path d="M-30 -8 L0 -8 L0 30Z" fill="url(#gemL)"/>' +
      '<path d="M0 -8 L30 -8 L0 30Z" fill="url(#gemR)"/>' +
      '<path d="M-18 -22 L-8 -8 L0 30 L8 -8 L18 -22 M-8 -8 L0 -22 L8 -8 M-30 -8 L30 -8" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/>' +
      '<path class="glint" style="animation-delay:' + f(delay / 3) + 's" d="M-20 -26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff"/>' +
      '</g></g>';
  }
  AK.gem = gem;

  function spire(x, base, w, h, color) {
    var bodyH = h * 0.72, top = base - bodyH, cx = x + w / 2, out = '';
    out += '<rect x="' + x + '" y="' + f(top) + '" width="' + w + '" height="' + f(bodyH) + '" fill="' + color + '"/>';
    out += '<path d="M' + (x - 5) + ' ' + f(top) + ' L' + (x + w + 5) + ' ' + f(top) + ' L' + cx + ' ' + (base - h) + 'Z" fill="' + color + '"/>';
    out += '<line x1="' + cx + '" y1="' + (base - h) + '" x2="' + cx + '" y2="' + (base - h - 24) + '" stroke="' + color + '" stroke-width="2"/>';
    out += '<circle cx="' + cx + '" cy="' + (base - h - 26) + '" r="4" fill="#FFD28A" filter="url(#glow3)"/>';
    var cols = w > 60 ? 2 : 1, ww = Math.max(5, w * 0.16);
    for (var c = 0; c < cols; c++) {
      var wx = cols === 1 ? cx - ww / 2 : x + w * (c ? 0.62 : 0.22);
      for (var y = top + 24; y < base - 30; y += 46) {
        if (rnd() < 0.72) out += '<rect x="' + f(wx) + '" y="' + f(y) + '" width="' + f(ww) + '" height="12" rx="' + f(ww / 2) + '" fill="#FFD28A" opacity="' + f(r(.55, 1)) + '" filter="url(#glow3)"/>';
      }
    }
    return out;
  }

  function cube(x, y, s, op) {
    var h = s * 0.58;
    return '<g opacity="' + op + '" transform="translate(' + f(x) + ' ' + f(y) + ')">' +
      '<path d="M0 ' + f(-h) + ' L' + s + ' 0 L0 ' + f(h) + ' L' + (-s) + ' 0Z" fill="#E6DAFF"/>' +
      '<path d="M' + (-s) + ' 0 L0 ' + f(h) + ' L0 ' + f(h + s * 1.1) + ' L' + (-s) + ' ' + f(s * 1.1) + 'Z" fill="#9C7FE8"/>' +
      '<path d="M' + s + ' 0 L0 ' + f(h) + ' L0 ' + f(h + s * 1.1) + ' L' + s + ' ' + f(s * 1.1) + 'Z" fill="#5E48B0"/></g>';
  }

  function sparkle(x, y, s, color) {
    return '<path transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')" d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill="' + color + '"/>';
  }

  /* ---------- FAR layer ---------- */
  function buildFar() {
    var o = '';
    // nebula
    o += '<g filter="url(#blur60)" opacity=".85">' +
      '<ellipse cx="260" cy="200" rx="320" ry="200" fill="#4C7BFF"/>' +
      '<ellipse cx="1150" cy="220" rx="300" ry="220" fill="#C04CFF"/>' +
      '<ellipse cx="760" cy="820" rx="520" ry="200" fill="#FF6FA8"/>' +
      '<ellipse cx="1300" cy="780" rx="260" ry="160" fill="#FFB36B"/>' +
      '<ellipse cx="620" cy="380" rx="260" ry="160" fill="#7A5CFF"/></g>';
    // light rays
    o += '<g class="rays">' +
      '<path d="M1180 190 L820 900 L960 900Z" fill="url(#rayG)" opacity=".35"/>' +
      '<path d="M1180 190 L1100 900 L1230 900Z" fill="url(#rayG)" opacity=".28"/>' +
      '<path d="M1180 190 L1380 900 L1470 900Z" fill="url(#rayG)" opacity=".3"/></g>';
    // stars
    var st = '';
    for (var i = 0; i < 140; i++) {
      var tw = rnd() < 0.35;
      st += '<circle cx="' + f(r(0, 1440)) + '" cy="' + f(r(0, 620)) + '" r="' + f(r(.5, 1.7)) + '" fill="#fff" opacity="' + f(r(.35, .95)) + '"' +
        (tw ? ' class="twinkle" style="animation-delay:-' + f(r(0, 3)) + 's;animation-duration:' + f(r(2.4, 4.4)) + 's"' : '') + '/>';
    }
    o += '<g>' + st + '</g>';
    o += sparkle(310, 120, 1.2, '#FFE3A3') + sparkle(980, 70, .9, '#fff') + sparkle(560, 260, .7, '#FFC6E6') + sparkle(1380, 400, 1, '#fff');
    // constellations
    o += '<g stroke="#fff" stroke-opacity=".28" stroke-width=".8" fill="none">' +
      '<polyline points="120,330 190,290 260,310 330,250 390,280"/>' +
      '<polyline points="760,110 820,150 900,130 940,190"/>' +
      '<polyline points="1300,520 1350,470 1410,500"/></g>' +
      '<g fill="#FFE3A3">' + [[120,330],[190,290],[260,310],[330,250],[390,280],[760,110],[820,150],[900,130],[940,190],[1300,520],[1350,470],[1410,500]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.2"/>'; }).join('') + '</g>';
    // moon
    o += '<circle cx="1180" cy="190" r="190" fill="url(#halo)"/>' +
      '<circle cx="1180" cy="190" r="92" fill="url(#moonG)"/>' +
      '<circle cx="1215" cy="170" r="84" fill="#3A3592" opacity=".92"/>';
    // crystal cubes
    o += cube(140, 540, 26, .22) + cube(470, 160, 18, .18) + cube(690, 600, 22, .2) + cube(960, 470, 30, .26) + cube(1380, 640, 20, .16) + cube(1010, 250, 14, .2);
    // floating diamond cards
    [[380, 470, 34, 0], [880, 330, 26, -2], [1060, 600, 40, -4], [210, 180, 22, -1]].forEach(function (c) {
      o += '<g class="cardfloat" style="animation-delay:' + c[3] + 's"><g transform="translate(' + c[0] + ' ' + c[1] + ') rotate(45)">' +
        '<rect x="' + (-c[2] / 2) + '" y="' + (-c[2] / 2) + '" width="' + c[2] + '" height="' + c[2] + '" fill="rgba(255,240,220,.08)" stroke="#FFE3A3" stroke-opacity=".7" stroke-width="1.2"/>' +
        '<rect x="' + (-c[2] / 2 + 4) + '" y="' + (-c[2] / 2 + 4) + '" width="' + (c[2] - 8) + '" height="' + (c[2] - 8) + '" fill="none" stroke="#FFE3A3" stroke-opacity=".35"/></g></g>';
    });
    // horizon hills
    o += '<path d="M0 780 C180 720 320 760 480 735 C640 710 760 770 940 745 C1100 722 1260 760 1440 728 L1440 900 L0 900Z" fill="url(#hillG)" opacity=".85"/>';
    o += '<path d="M0 830 C220 800 400 840 620 815 C860 790 1080 840 1440 800 L1440 900 L0 900Z" fill="#160F40" opacity=".9"/>';
    // castle spires
    o += spire(40, 900, 70, 330, '#2A1F66') + spire(120, 900, 50, 240, '#33267A') + spire(1240, 900, 80, 380, '#2A1F66') +
      spire(1330, 900, 56, 270, '#33267A') + spire(1110, 900, 44, 200, '#3A2C88') + spire(240, 900, 40, 170, '#3A2C88');
    return svg(o);
  }

  /* ---------- CROSS layer (Lusion-style "+") ---------- */
  function buildCross() {
    var o = '<g stroke="#fff" stroke-opacity=".45" stroke-width="1.2">';
    [[210, 420], [520, 90], [700, 520], [1010, 120], [1290, 330], [880, 760]].forEach(function (p) {
      o += '<path d="M' + (p[0] - 9) + ' ' + p[1] + ' H' + (p[0] + 9) + ' M' + p[0] + ' ' + (p[1] - 9) + ' V' + (p[1] + 9) + '"/>';
    });
    return svg(o + '</g>');
  }

  /* ---------- GEM layers ---------- */
  function buildGemsMid() {
    var o = '';
    [[160, 250], [600, 130], [820, 430], [1020, 120], [1360, 260], [450, 700], [1250, 560]].forEach(function (p, i) {
      o += gem(p[0], p[1], r(.45, .75), r(-20, 20), r(11, 22), -r(0, 15));
    });
    return svg(o);
  }
  function buildGemsNear() {
    var o = '';
    [[90, 620, 1.6], [1390, 150, 1.4], [1340, 810, 2.0], [560, 860, 1.5]].forEach(function (p) {
      o += gem(p[0], p[1], p[2], r(-15, 15), r(14, 22), -r(0, 15));
    });
    return '<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" style="opacity:.92">' + o + '</svg>';
  }

  /* ---------- NEAR layer ---------- */
  function buildNear() {
    var o = '';
    // light pillars
    [[300, 46], [760, 30], [1060, 40], [1400, 34]].forEach(function (p, i) {
      o += '<rect class="rays" style="animation-delay:-' + (i * 1.4) + 's" x="' + (p[0] - p[1] / 2) + '" y="360" width="' + p[1] + '" height="560" fill="url(#pillarG)" opacity=".3"/>';
    });
    // magic swirl
    var sw = 'M-40 690 C200 560 360 820 620 700 C860 590 900 420 1120 470 C1300 510 1360 640 1500 600';
    o += '<g fill="none" stroke-linecap="round">' +
      '<path class="swirl" d="' + sw + '" stroke="url(#swirlG)" stroke-width="40" opacity=".45" filter="url(#blur8)"/>' +
      '<path class="swirl" d="' + sw + '" stroke="url(#swirlG)" stroke-width="5" opacity=".9"/>' +
      '<path class="swirl" d="' + sw + '" stroke="#fff" stroke-width="1.5"/></g>';
    // ribbon + gold dotted line
    var rb = 'M-40 160 C180 90 320 230 560 170 C780 115 900 40 1080 90 C1240 135 1330 70 1500 100';
    o += '<g class="drift" fill="none" stroke-linecap="round">' +
      '<path d="' + rb + '" stroke="url(#ribbonG)" stroke-width="14" opacity=".75"/>' +
      '<path d="' + rb + '" stroke="#FFE3A3" stroke-width="2.4" stroke-dasharray="0.1 12" transform="translate(0 22)" opacity=".9"/></g>';
    // crescent moons
    [[90, 80, 14], [680, 60, 10], [1290, 420, 12], [470, 380, 9]].forEach(function (c) {
      o += '<path transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + (c[2] / 10) + ')" d="M4 -10 A10 10 0 1 0 4 10 A8 8 0 1 1 4 -10Z" fill="#FFE3A3" opacity=".7" filter="url(#glow3)"/>';
    });
    // fireworks
    [[230, 120, '#FFB3E6'], [930, 220, '#FFE3A3'], [1180, 520, '#9FE3F2'], [420, 560, '#C77DFF'], [1360, 70, '#FF8FC4']].forEach(function (p, i) {
      var rays = '';
      for (var k = 0; k < 12; k++) {
        var a = k / 12 * Math.PI * 2;
        rays += '<line x1="' + f(Math.cos(a) * 10) + '" y1="' + f(Math.sin(a) * 10) + '" x2="' + f(Math.cos(a) * 34) + '" y2="' + f(Math.sin(a) * 34) + '"/>';
        rays += '<circle cx="' + f(Math.cos(a) * 42) + '" cy="' + f(Math.sin(a) * 42) + '" r="1.8" stroke="none" fill="' + p[2] + '"/>';
      }
      o += '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><g class="fw" style="animation-delay:' + f(i * 0.9 + r(0, .6)) + 's" stroke="' + p[2] + '" stroke-width="1.6" stroke-linecap="round">' + rays + '</g></g>';
    });
    // rising light particles
    var colors = ['#FFE3A3', '#FFC6E6', '#fff', '#C9A8FF'];
    for (var i = 0; i < 34; i++) {
      o += '<circle class="rise" style="animation-duration:' + f(r(9, 18)) + 's;animation-delay:-' + f(r(0, 18)) + 's" cx="' + f(r(0, 1440)) + '" cy="' + f(r(780, 940)) + '" r="' + f(r(1.2, 3.4)) + '" fill="' + colors[i % 4] + '" filter="url(#glow3)"/>';
    }
    return svg(o);
  }

  /* ---------- mount ---------- */
  var bg = document.getElementById('bg');
  bg.insertAdjacentHTML('afterbegin', DEFS);
  var far = document.getElementById('layerFar'),
      cross = document.getElementById('layerCross'),
      gemsMid = document.getElementById('layerGemsMid'),
      near = document.getElementById('layerNear'),
      gemsNear = document.getElementById('layerGemsNear');
  far.innerHTML = buildFar();
  cross.innerHTML = buildCross();
  gemsMid.innerHTML = buildGemsMid();
  near.innerHTML = buildNear();
  gemsNear.innerHTML = buildGemsNear();
  var startDecor = document.getElementById('startDecor');
  if (startDecor) startDecor.innerHTML = far.innerHTML;

  /* ---------- sparks & bursts ---------- */
  var fxLayer = document.getElementById('fx');
  var SPARK_COLORS = ['#FFE3A3', '#FF8FC4', '#FFFFFF', '#B98CFF', '#FFE3A3', '#7FE3FF'];
  var sparks = [], bursts = [];
  if (!AK.reduceMotion) {
    for (var i = 0; i < 18; i++) {
      var s = document.createElement('div');
      s.className = 'spark'; s.style.color = SPARK_COLORS[i % SPARK_COLORS.length];
      s.innerHTML = '<svg viewBox="-10 -10 20 20"><path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill="currentColor"/></svg>';
      fxLayer.appendChild(s); sparks.push(s);
    }
    var rayPaths = '';
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2;
      rayPaths += '<line x1="' + f(Math.cos(a) * 16) + '" y1="' + f(Math.sin(a) * 16) + '" x2="' + f(Math.cos(a) * 42) + '" y2="' + f(Math.sin(a) * 42) + '"/>';
    }
    for (var j = 0; j < 3; j++) {
      var b = document.createElement('div');
      b.className = 'burst';
      b.innerHTML = '<svg viewBox="-45 -45 90 90"><circle r="14" fill="none" stroke="#FFE3A3" stroke-width="2"/><g stroke="#FF8FC4" stroke-width="2.4" stroke-linecap="round">' + rayPaths + '</g></svg>';
      fxLayer.appendChild(b); bursts.push(b);
    }
  }

  /* ---------- pointer: parallax, glow, trail ---------- */
  var root = document.getElementById('root');
  var glow = document.getElementById('cursorGlow'), dot = document.getElementById('cursorDot');
  var mainEl = document.getElementById('main');
  var raf, lx = 0, ly = 0, si = 0, bi = 0;

  root.addEventListener('mousemove', function (e) {
    if (AK.reduceMotion) return;
    var rc = root.getBoundingClientRect();
    var x = e.clientX - rc.left, y = e.clientY - rc.top;
    var dx = x / rc.width - .5, dy = y / rc.height - .5;

    if (Math.abs(x - lx) + Math.abs(y - ly) > 22 && sparks.length) {
      lx = x; ly = y;
      var sp = sparks[si = (si + 1) % sparks.length];
      var a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
      sp.style.setProperty('--x', x + 'px'); sp.style.setProperty('--y', y + 'px');
      sp.style.setProperty('--dx', Math.cos(a) * d + 'px'); sp.style.setProperty('--dy', Math.sin(a) * d + 30 + 'px');
      sp.style.setProperty('--s', (.6 + Math.random() * .9).toFixed(2));
      sp.classList.remove('on'); void sp.offsetWidth; sp.classList.add('on');
    }

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      function mv(el, fx, fy) { el.style.transform = 'translate(' + (-dx * fx) + 'px,' + (-dy * fy) + 'px)'; }
      mv(far, 18, 12); mv(cross, 10, 8); mv(gemsMid, 90, 60); mv(near, 46, 30); mv(gemsNear, 160, 110);
      if (!AK.isMobile) {
        mainEl.style.transform = 'perspective(1800px) rotateY(' + (dx * 3) + 'deg) rotateX(' + (-dy * 2.5) + 'deg)';
        var frame = document.getElementById('heroFrame'), hero = document.getElementById('hero');
        if (frame) frame.style.transform = 'perspective(1000px) rotateY(' + (dx * 14) + 'deg) rotateX(' + (-dy * 10) + 'deg)';
        if (hero) hero.style.transform = 'perspective(1200px) translate(' + (dx * 14) + 'px,' + (dy * 6) + 'px) rotateY(' + (dx * 8) + 'deg)';
      }
      glow.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(45deg)';
    });
  });

  root.addEventListener('mouseleave', function () {
    glow.style.transform = 'translate(-999px,-999px)';
    dot.style.transform = 'translate(-999px,-999px) rotate(45deg)';
  });

  root.addEventListener('pointerdown', function (e) {
    if (AK.reduceMotion || !bursts.length) return;
    var rc = root.getBoundingClientRect();
    var b = bursts[bi = (bi + 1) % bursts.length];
    b.style.setProperty('--x', (e.clientX - rc.left) + 'px');
    b.style.setProperty('--y', (e.clientY - rc.top) + 'px');
    b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  });
})();
