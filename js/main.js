/* main.js — state, navigation and rendering of every screen. */
(function () {
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var sfx = function (n) { AK.sfx && AK.sfx(n); };
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  var ETSY = AK.contact.etsy;

  var SCREENS = ['home', 'gallery', 'services', 'atelier', 'commission'];
  var NAMES = { home: 'Home', gallery: 'Gallery', services: 'Services', atelier: 'Atelier', commission: 'Commission' };
  var state = { screen: null, filter: 'All', work: 0, service: 0, quests: loadQuests() };

  /* ---------- small builders ---------- */
  function fxTitle(text, variant, size, tag, extra) {
    tag = tag || 'h2';
    var t = esc(text);
    return '<' + tag + ' class="fx fx--' + variant + (extra ? ' ' + extra : '') + '" style="--size:' + size + '">' +
      '<span class="fx__back" aria-hidden="true">' + t + '</span>' +
      '<span class="fx__front">' + t + '</span>' +
      '<span class="fx__shine" aria-hidden="true">' + t + '</span></' + tag + '>';
  }
  AK.fxTitle = fxTitle;

  var CORNER = '<svg class="lore__corner" viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M100 0 L36 0 C52 14 70 22 100 70Z" fill="#9E1B32"/>' +
    '<path d="M100 0 L58 0 C66 10 80 18 100 40Z" fill="#C8283C"/>' +
    '<path d="M78 10 l6 9 -6 9 -6 -9z" fill="#D9B46A"/></svg>';

  function lore(script, inner, cls, attrs) {
    return '<article class="lore' + (cls ? ' ' + cls : '') + '"' + (attrs || '') + '><div class="lore__paper">' + CORNER +
      '<span class="lore__script" aria-hidden="true">' + esc(script) + '</span>' + inner + '</div></article>';
  }
  function stars(path, count) {
    return '<div class="stars"><span class="stars__pill" aria-label="' + (count || 5) + ' stars">' + '★★★★★'.slice(0, count || 5) + '</span><span class="stars__path">' + esc(path) + '</span></div>';
  }
  function sectionHead(num, title, variant) {
    return '<div class="section-head"><span class="section-head__num" aria-hidden="true"><span>' + num + '</span></span>' +
      fxTitle(title, variant, 'min(48px, 8vw)') + '</div>';
  }
  function btn(label, opts) {
    opts = opts || {};
    var cls = 'btn-orn' + (opts.ruby ? ' btn-orn--ruby' : '') + (opts.size ? ' btn-orn--' + opts.size : '') + (opts.cls ? ' ' + opts.cls : '');
    var inner = '<span class="btn-orn__shine" aria-hidden="true"></span>' + esc(label);
    if (opts.href) return '<a class="' + cls + '" href="' + esc(opts.href) + '" target="_blank" rel="noopener">' + inner + '<span class="sr-only"> (opens Etsy in a new tab)</span></a>';
    return '<button type="button" class="' + cls + '"' + (opts.go ? ' data-go="' + opts.go + '"' : '') + (opts.id ? ' id="' + opts.id + '"' : '') + '>' + inner + '</button>';
  }
  // Rig skeleton drawn in the Garda image's own proportions (883×1500 → 100×170),
  // so with "meet" it lines up with an <img> using object-fit: contain in the same box.
  function rigOverlay() {
    var J = [[45,12],[45,21],[30,25],[62,25],[22,36],[70,36],[14,46],[78,46],[45,44],[36,64],[56,64],[36,86],[56,86],[74,60],[86,80]];
    var L = [[0,1],[1,2],[1,3],[2,4],[3,5],[4,6],[5,7],[1,8],[8,9],[8,10],[9,11],[10,12],[8,13],[13,14]];
    var y = function (v) { return (v * 1.7).toFixed(1); };
    return '<svg class="rig" viewBox="0 0 100 170" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<g stroke="#fff" stroke-opacity=".85" stroke-width="1.2" stroke-dasharray="3 3" fill="none">' +
      L.map(function (l) { return '<line vector-effect="non-scaling-stroke" x1="' + J[l[0]][0] + '" y1="' + y(J[l[0]][1]) + '" x2="' + J[l[1]][0] + '" y2="' + y(J[l[1]][1]) + '"/>'; }).join('') +
      '<ellipse vector-effect="non-scaling-stroke" cx="45" cy="' + y(10) + '" rx="13" ry="14"/></g>' +
      '<g fill="#FFD28A" stroke="#7A1426" stroke-width=".6">' +
      J.map(function (j) { return '<path d="M' + j[0] + ' ' + (j[1] * 1.7 - 2.6).toFixed(1) + ' l2.6 2.6 -2.6 2.6 -2.6 -2.6z"/>'; }).join('') + '</g></svg>';
  }
  function img(name, alt) {
    return '<img src="assets/' + name + '.webp" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">';
  }
  function gemArt(bg) {
    return '<svg viewBox="-100 -70 200 140" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%">' +
      AK.gem(-48, 8, 1.1, -12, 14, -3) + AK.gem(46, -6, 1.5, 10, 18, -7) + AK.gem(0, 34, .7, 0, 12, -1) + '</svg>';
  }

  /* ---------- clock ---------- */
  function clockSVG() {
    var o = '<svg viewBox="-100 -100 200 200" aria-hidden="true"><g fill="none" stroke="#E8C47C">' +
      '<circle r="96" stroke-width="1.2"/><circle r="91" stroke-width=".5"/><circle r="64" stroke-width=".5" stroke-opacity=".7"/></g><g stroke="#E8C47C">';
    for (var i = 0; i < 60; i++) {
      var a = i / 60 * Math.PI * 2, big = i % 5 === 0, r1 = big ? 80 : 84, r2 = 89;
      o += '<line x1="' + (Math.sin(a) * r1).toFixed(2) + '" y1="' + (-Math.cos(a) * r1).toFixed(2) + '" x2="' + (Math.sin(a) * r2).toFixed(2) + '" y2="' + (-Math.cos(a) * r2).toFixed(2) + '" stroke-width="' + (big ? 1.2 : .5) + '"/>';
    }
    o += '</g><g fill="#F3D99A" font-family="Cinzel Decorative, serif" font-size="8" font-weight="700" text-anchor="middle" dominant-baseline="central">';
    for (var h = 0; h < 12; h++) {
      var b = h / 12 * Math.PI * 2;
      o += '<text x="' + (Math.sin(b) * 72).toFixed(2) + '" y="' + (-Math.cos(b) * 72).toFixed(2) + '">' + ROMAN[(h + 11) % 12] + '</text>';
    }
    o += '</g><g stroke="#F3D99A" stroke-linecap="round"><line x1="0" y1="8" x2="0" y2="-56" stroke-width="2"/><line x1="-6" y1="0" x2="40" y2="0" stroke-width="3"/></g>' +
      '<circle r="4" fill="#9E1B32" stroke="#F3D99A"/>';
    [[0, -96], [96, 0], [0, 96], [-96, 0]].forEach(function (p) {
      o += '<path transform="translate(' + p[0] + ' ' + p[1] + ')" d="M0 -6 L5 0 0 6 -5 0Z" fill="#C8283C" stroke="#F3D99A" stroke-width=".8"/>';
    });
    return o + '</svg>';
  }

  /* ==========================================================================
     Screens
     ========================================================================== */
  function renderHome() {
    var left = AK.slots.left, total = AK.slots.total, dots = '';
    for (var i = 0; i < total; i++) dots += '<i class="' + (i < left ? 'on' : '') + '"></i>';
    $('#screen-home').innerHTML =
      '<div class="home">' +
        '<div class="home__left">' +
          '<span class="pill stagger">◆ Commissions Now Open · <b>' + left + ' slots left</b> ◆</span>' +
          '<h1 class="home__title stagger">' +
            fxTitle('Draw the Dream,', 'amethyst', 'min(68px, 9.5vw)', 'span') +
            fxTitle('Make It Move!', 'ruby', 'min(78px, 11vw)', 'span') +
          '</h1>' +
          '<div class="stagger">' + lore('Lumière',
            stars('Path: Creation') +
            '<p>Every character begins as a whisper. We give it a face, a form, and a heartbeat — drawn in 2D, sculpted in 3D, rigged to move as if it had always lived.</p>',
            'home__lore') + '</div>' +
          '<div class="btns stagger">' + btn('Commission Now', { go: 'commission' }) + btn('View Gallery', { go: 'gallery', ruby: true }) + '</div>' +
        '</div>' +
        '<div class="home__center">' +
          '<div class="hero-frame" id="heroFrame"><div class="glass tilt"></div><div class="clock">' + clockSVG() + '</div></div>' +
          '<div class="hero" id="hero"><div class="hero__shadow"></div>' +
            '<img class="hero__img" src="assets/garda.webp" alt="Garda, a cyber-feline character in neon-lined armour — Live2D model art by Akarinaru Studio" decoding="async">' +
            '<span class="hero__cap">Garda · Live2D Model Art &amp; Rig</span></div>' +
        '</div>' +
        '<div class="home__right">' +
          '<div class="event"><div class="event__inner">' +
            '<div class="event__tag">NOW OPEN</div>' +
            '<div class="event__big">' + left + ' of ' + total + ' slots</div>' +
            '<p class="event__txt">' + left + ' of ' + total + ' commission slots remain this month.</p>' +
            '<div class="event__dots" aria-hidden="true">' + dots + '</div>' +
            '<a class="btn-cream" href="' + ETSY + '" target="_blank" rel="noopener">Reserve on Etsy</a>' +
          '</div></div>' +
        '</div>' +
      '</div>';
  }

  function renderGallery() {
    var tabs = AK.categories.map(function (c) {
      return '<button type="button" class="tab" data-filter="' + esc(c) + '" aria-pressed="' + (c === state.filter) + '">' + esc(c) + '</button>';
    }).join('');
    $('#screen-gallery').innerHTML =
      '<div class="gallery">' +
        '<div class="gallery__main">' +
          '<div class="gallery__bar stagger">' + sectionHead('I', 'Gallery', 'amethyst') +
            '<div class="tabs" role="group" aria-label="Filter works">' + tabs + '</div></div>' +
          '<div class="grid stagger" id="grid"></div>' +
        '</div>' +
        '<aside class="gallery__side stagger" id="detail" aria-live="polite"></aside>' +
      '</div>';
    renderGrid();
  }
  function filteredWorks() {
    return AK.works.map(function (w, i) { w.idx = i; return w; })
      .filter(function (w) { return state.filter === 'All' || w.cat === state.filter; });
  }
  function renderGrid() {
    var list = filteredWorks();
    if (!list.some(function (w) { return w.idx === state.work; })) state.work = list[0].idx;
    $('#grid').innerHTML = list.map(function (w) {
      return '<button type="button" class="card" data-work="' + w.idx + '" aria-pressed="' + (w.idx === state.work) + '" aria-label="' + esc(w.title + ', ' + w.cat) + '">' +
        '<span class="card__frame"><span class="card__inner" style="display:block;--card-bg:' + AK.BG[w.bg] + '">' +
          '<span class="card__num">' + ROMAN[w.idx] + '</span>' + img(w.img, '') + (w.rig ? rigOverlay() : '') +
        '</span></span>' +
        '<span class="card__cat">' + esc(w.cat) + '</span><span class="card__title">' + esc(w.title) + '</span></button>';
    }).join('');
    renderDetail();
  }
  function renderDetail() {
    var w = AK.works[state.work];
    $('#detail').innerHTML = lore(w.cat === 'Emotes' ? 'Émotion' : 'Lumière',
      '<span class="lore__eyebrow">No. ' + ROMAN[w.idx] + ' · ' + esc(w.cat) + '</span>' +
      '<h3>' + esc(w.title) + '</h3>' + stars(w.path) +
      '<div class="detail__img" style="background:' + AK.BG[w.bg] + '">' + img(w.img, w.alt) + (w.rig ? rigOverlay() : '') + '</div>' +
      '<p>' + esc(w.desc) + '</p>' +
      '<div class="detail__btn btns">' + btn('Commission this style', { go: 'atelier', size: 'sm' }) + '</div>');
  }

  function renderServices() {
    var list = AK.services.map(function (s, i) {
      return '<li><button type="button" data-service="' + i + '" aria-pressed="' + (i === state.service) + '">' +
        '<span class="idx__num">' + s.num + '</span><span class="idx__name">' + esc(s.name) + '</span><span class="idx__price">from ' + s.price + '</span></button></li>';
    }).join('');
    $('#screen-services').innerHTML =
      '<div class="services">' +
        '<div class="services__left stagger">' + sectionHead('II', 'Services', 'sapphire') + '<ul class="idx">' + list + '</ul></div>' +
        '<div class="services__center stagger"><div class="svc-glass"><div class="glass tilt" id="svcGlass"></div></div></div>' +
        '<div class="services__right stagger" id="svcCard" aria-live="polite"></div>' +
      '</div>';
    renderService();
  }
  function renderService() {
    var s = AK.services[state.service];
    $$('[data-service]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.service === state.service)); });
    $('#svcGlass').innerHTML = s.img
      ? img(s.img, s.name + ' example — ' + (s.img === 'garda' ? 'Garda character art' : 'animated emote')) + (s.rig ? rigOverlay() : '')
      : '<div class="svc-gem">' + gemArt() + '</div>';
    $('#svcCard').innerHTML = lore(s.script,
      '<span class="lore__eyebrow">Service ' + s.num + '</span>' +
      '<h2>' + esc(s.name) + '</h2>' + stars(s.path) +
      '<p>' + esc(s.desc) + '</p>' +
      '<ul class="bullets">' + s.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<div class="price"><small>from</small><b>' + s.price + '</b></div>' +
      '<div class="btns" style="margin-top:18px">' + btn('Commission', { go: 'atelier', ruby: true, size: 'sm' }) + '</div>');
    var g = $('#svcGlass'); g.classList.remove('enter'); void g.offsetWidth; g.classList.add('enter');
  }

  function renderAtelier() {
    var packs = AK.shop.map(function (p, i) {
      return '<article class="pack stagger"><div class="pack__inner">' +
        '<div class="pack__img" style="--card-bg:' + AK.BG[p.bg] + '">' + img(p.img, p.name + ' package example') + (p.rig ? rigOverlay() : '') + '</div>' +
        '<h3 class="pack__name">' + esc(p.name) + '</h3>' +
        '<div class="pack__stars" aria-label="' + p.stars.length + ' stars">' + p.stars + '</div>' +
        '<ul class="pack__lines">' + p.lines.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><b>' + esc(l[1]) + '</b></li>'; }).join('') + '</ul>' +
        btn('From ' + p.price, { href: ETSY, ruby: i === 1, size: 'sm' }) +
        '</div></article>';
    }).join('');
    $('#screen-atelier').innerHTML =
      '<div class="atelier">' +
        '<div class="atelier__bar stagger">' + sectionHead('III', 'Commission Atelier', 'ruby') +
          '<div class="atelier__tools"><span class="atelier__note">Prices in USD · checkout on Etsy</span>' +
          btn('Draw a fate card', { id: 'drawFate', size: 'sm' }) + '</div></div>' +
        '<div class="packs">' + packs + '</div>' +
      '</div>';
  }

  function renderCommission() {
    var quests = AK.quests.map(function (q, i) {
      return '<li><button type="button" class="quest" data-quest="' + i + '" aria-pressed="' + !!state.quests[i] + '">' +
        '<span class="quest__box" aria-hidden="true"></span><span class="quest__num" aria-hidden="true">' + ROMAN[i] + '</span>' +
        '<span><span class="quest__t">' + esc(q[0]) + '</span><span class="quest__d">' + esc(q[1]) + '</span></span></button></li>';
    }).join('');
    var c = AK.contact;
    var ig = c.instagram.replace(/^@/, '');
    $('#screen-commission').innerHTML =
      '<div class="commission">' +
        '<div class="stagger" style="flex:0 1 760px">' + lore('Voyage',
          '<span class="lore__eyebrow">IV · The Commission Journey</span>' +
          '<h2 class="journey__head">Four steps to a living character</h2>' +
          '<ul class="quests">' + quests + '</ul>' +
          '<div class="progress"><span id="progTxt"></span><span class="progress__bar"><i id="progBar"></i></span></div>') + '</div>' +
        '<div class="commission__side stagger">' +
          fxTitle('Commission', 'rose', 'min(56px, 10vw)') +
          btn('Visit the Etsy atelier', { href: c.etsy, size: 'lg' }) +
          '<ul class="contact">' +
            '<li><a href="' + c.etsy + '" target="_blank" rel="noopener"><small>Etsy</small><span>akamerenata</span></a></li>' +
            '<li><a href="mailto:' + esc(c.email) + '"><small>Email</small><span>' + esc(c.email) + '</span></a></li>' +
            '<li><a href="https://www.instagram.com/' + esc(ig) + '/" target="_blank" rel="noopener"><small>Instagram</small><span>' + esc(c.instagram) + '</span></a></li>' +
          '</ul>' +
        '</div>' +
      '</div>';
    updateProgress();
  }
  function updateProgress() {
    var n = state.quests.filter(Boolean).length;
    $('#progTxt').textContent = 'Progress · ' + n + ' / ' + AK.quests.length;
    $('#progBar').style.width = (n / AK.quests.length * 100) + '%';
  }
  function loadQuests() {
    try { var v = JSON.parse(localStorage.getItem('ak-quests')); if (Array.isArray(v)) return v; } catch (e) {}
    return [false, false, false, false];
  }
  function saveQuests() { try { localStorage.setItem('ak-quests', JSON.stringify(state.quests)); } catch (e) {} }

  /* ==========================================================================
     Fate card (gacha)
     ========================================================================== */
  var fate = $('#fate'), fateReturn = null;
  function openFate() {
    var c = AK.fateCards[Math.floor(Math.random() * AK.fateCards.length)];
    var rays = '';
    for (var i = 0; i < 24; i++) rays += '<path transform="rotate(' + (i * 15) + ')" d="M0 0 L-12 -540 L12 -540Z" fill="' + (i % 2 ? '#FFE3A3' : '#FF8FC4') + '" opacity="' + (i % 2 ? .22 : .14) + '"/>';
    fate.innerHTML =
      '<svg class="fate__rays" viewBox="-550 -550 1100 1100" aria-hidden="true">' + rays + '<circle r="120" fill="#FFE3A3" opacity=".18"/></svg>' +
      '<div class="fate__card">' + lore('Destin',
        '<span class="lore__eyebrow">Your fate card</span>' +
        '<h2 id="fateName">' + esc(c.name) + '</h2>' + stars('Path: Fate') +
        '<div class="fate__art">' + gemArt() + '</div>' +
        '<p>' + esc(c.desc) + '</p>' +
        '<div class="price"><small>Fate price</small><b>' + c.price + '</b></div>' +
        '<div class="fate__btns">' + btn('Close', { id: 'fateClose', size: 'sm' }) + btn('Claim', { href: ETSY, ruby: true, size: 'sm' }) + '</div>') +
      '</div>';
    fateReturn = document.activeElement;
    fate.hidden = false;
    sfx('wish');
    $('#fateClose').focus();
  }
  function closeFate() {
    fate.hidden = true; fate.innerHTML = '';
    if (fateReturn && fateReturn.focus) fateReturn.focus();
  }
  fate.addEventListener('click', function (e) {
    if (e.target === fate || e.target.closest('#fateClose')) { sfx('tap'); closeFate(); }
  });
  document.addEventListener('keydown', function (e) {
    if (fate.hidden) return;
    if (e.key === 'Escape') { closeFate(); return; }
    if (e.key === 'Tab') {
      var f = $$('button, a[href]', fate); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ==========================================================================
     Navigation
     ========================================================================== */
  var veil = $('#veil'), veilLabel = $('#veilLabel'), stage = $('#stage');
  var busy = false;

  $('#menuList').innerHTML = SCREENS.map(function (s) {
    return '<li><button type="button" class="menu__item" data-go="' + s + '"><span class="menu__dia" aria-hidden="true"></span>' + NAMES[s] + '</button></li>';
  }).join('');
  $('#pager').innerHTML = SCREENS.map(function (s) {
    return '<button type="button" data-go="' + s + '" aria-label="' + NAMES[s] + '"><span></span></button>';
  }).join('');

  function show(screen) {
    state.screen = screen;
    SCREENS.forEach(function (s) {
      var el = $('#screen-' + s);
      el.hidden = s !== screen;
      el.classList.remove('enter');
    });
    var cur = $('#screen-' + screen);
    void cur.offsetWidth; cur.classList.add('enter');
    $$('[data-go]').forEach(function (b) {
      if (b.closest('.menu') || b.closest('.pager')) {
        if (b.dataset.go === screen) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      }
    });
    document.title = (screen === 'home' ? '' : NAMES[screen] + ' · ') + 'Akarinaru Studio — Illustration, Animation & Rigging';
    try { history.replaceState(null, '', '#' + screen); } catch (e) {}
    if (AK.isMobile) stage.scrollTop = 0;
  }

  function go(screen) {
    if (busy || screen === state.screen || SCREENS.indexOf(screen) < 0) return;
    if (AK.reduceMotion) { show(screen); return; }
    busy = true; sfx('swoosh');
    veilLabel.innerHTML = fxTitle(NAMES[screen], 'ruby', 'clamp(64px,10vw,150px)', 'span');
    veil.hidden = true; void veil.offsetWidth; veil.hidden = false;
    setTimeout(function () { sfx('hit'); show(screen); }, 540);
    setTimeout(function () { veil.hidden = true; busy = false; }, 1200);
  }
  AK.go = go;

  /* ---------- global click delegation ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-filter],[data-work],[data-service],[data-quest],#drawFate');
    if (!t) return;
    if (t.dataset.go) { e.preventDefault(); go(t.dataset.go); return; }
    sfx('tap');
    if (t.dataset.filter) {
      state.filter = t.dataset.filter;
      $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)); });
      renderGrid();
    } else if (t.dataset.work) {
      state.work = +t.dataset.work;
      $$('[data-work]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.work === state.work)); });
      renderDetail();
      if (AK.isMobile) $('#detail').scrollIntoView({ behavior: AK.reduceMotion ? 'auto' : 'smooth', block: 'start' });
    } else if (t.dataset.service) {
      state.service = +t.dataset.service; renderService();
    } else if (t.dataset.quest) {
      var i = +t.dataset.quest;
      state.quests[i] = !state.quests[i];
      t.setAttribute('aria-pressed', String(state.quests[i]));
      saveQuests(); updateProgress();
    } else if (t.id === 'drawFate') {
      openFate();
    }
  });

  // Keyboard: ← / → switch pages (when not typing / no dialog)
  document.addEventListener('keydown', function (e) {
    if (!fate.hidden || !state.screen || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (e.target.closest('.tabs, .idx, .quests')) return;
    var i = SCREENS.indexOf(state.screen) + (e.key === 'ArrowRight' ? 1 : -1);
    go(SCREENS[(i + SCREENS.length) % SCREENS.length]);
  });

  /* ---------- sound button ---------- */
  var soundBtn = $('#soundBtn');
  function syncSound() {
    var on = AK.music.isOn();
    soundBtn.setAttribute('aria-pressed', String(on));
    $('.sound__txt', soundBtn).textContent = on ? 'Sound on' : 'Sound off';
  }
  soundBtn.addEventListener('click', function () { AK.music.toggle(); syncSound(); });

  /* ---------- start screen ---------- */
  $('#startTitle').innerHTML = fxTitle('AKARINARU', 'ruby', 'clamp(48px,8vw,120px)', 'span', 'fx--cinzel');
  $('#startSub').innerHTML = fxTitle('Studio of Living Characters', 'amethyst', 'clamp(24px,3.6vw,48px)', 'span');
  var start = $('#start');
  $('#enterBtn').addEventListener('click', function () {
    AK.music.start(); syncSound();
    start.classList.add('out');
    setTimeout(function () { start.hidden = true; }, 900);
    var h = location.hash.slice(1);
    go(SCREENS.indexOf(h) >= 0 ? h : 'home');
  });

  /* ---------- initial render ---------- */
  renderHome(); renderGallery(); renderServices(); renderAtelier(); renderCommission();
  $$('.screen').forEach(function (s) { s.hidden = true; });
  $('.slots b').textContent = AK.slots.left;
  $('.slots').lastChild.textContent = ' / ' + AK.slots.total;
})();
