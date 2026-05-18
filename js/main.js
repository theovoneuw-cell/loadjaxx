gsap.registerPlugin(ScrollTrigger);

// ── DÉTECTION TOUCH ───────────────────────────────────────────
const isTouch = window.matchMedia('(pointer: coarse)').matches;

// ── CURSOR CUSTOM (desktop) ───────────────────────────────────
if (!isTouch) {
  const cursor     = document.createElement('div');
  const cursorRing = document.createElement('div');
  const cursorDot  = document.createElement('div');
  cursor.className     = 'g-cursor';
  cursorRing.className = 'g-cursor-ring';
  cursorDot.className  = 'g-cursor-dot';
  cursor.appendChild(cursorRing);
  cursor.style.opacity    = '0';
  cursorDot.style.opacity = '0';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let visible = false;
  window.addEventListener('mousemove', e => {
    if (!visible) {
      visible = true;
      gsap.to([cursor, cursorDot], { opacity: 1, duration: 0.4 });
    }
    gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.15, ease: 'power2.out' });
  });
  document.querySelectorAll('a, button, .release-card, .show-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// ── NAVBAR ────────────────────────────────────────────────────
const navbar   = document.getElementById('navbar');
const burger   = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');
const navClose = document.querySelector('.nav-close');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});
if (navClose) {
  navClose.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
}
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── PRÉPARE LES LETTRES DU NOM ────────────────────────────────
const heroContent = document.querySelector('.hero-content');
const line1 = document.querySelector('.g-line-1');

function wrapChars(el) {
  if (!el) return;
  el.innerHTML = el.innerText
    .split('')
    .map(c => `<span class="g-char">${c}</span>`)
    .join('');
}
wrapChars(line1);

if (heroContent) heroContent.classList.add('hero-loading');

function _heroFallback() {
  if (heroContent) heroContent.classList.remove('hero-loading');
  gsap.set('.hero-tagline,.hero-name,.hero-bottom,.hero-status,.hero-next-card',
    { visibility: 'visible', clearProps: 'all' });
}

// ── LOADER ────────────────────────────────────────────────────
(function() {
  const loader     = document.getElementById('loader');
  const fill       = document.querySelector('.loader-progress-fill');
  const pctEl      = document.querySelector('.loader-pct');
  const letters    = document.querySelectorAll('.lc');
  const loaderSub  = document.querySelector('.loader-sub');
  const loaderBot  = document.querySelector('.loader-bottom');
  const eqCanvas   = document.getElementById('loaderEq');
  const dawEl      = document.getElementById('loaderDaw');
  document.body.style.overflow = 'hidden';

  // ── Génération segments DAW
  const SEG_COUNT = 24;
  const segs = [];
  if (dawEl) {
    for (let i = 0; i < SEG_COUNT; i++) {
      const s = document.createElement('div');
      s.className = 'loader-daw-seg';
      dawEl.appendChild(s);
      segs.push(s);
    }
  }

  function updateDaw(pct) {
    const active = Math.floor(pct / 100 * SEG_COUNT);
    segs.forEach((s, i) => {
      s.classList.toggle('active', i < active);
      s.classList.toggle('peak',   i === active - 1);
    });
  }

  // ── EQ canvas animé
  let eqRaf;
  if (eqCanvas) {
    const ec  = eqCanvas.getContext('2d');
    const W   = 200, H = 48;
    const BAR = 14, GAP = 4;
    const N   = Math.floor((W + GAP) / (BAR + GAP));
    const heights = Array.from({ length: N }, () => Math.random() * 0.6 + 0.1);
    const targets = Array.from({ length: N }, () => Math.random() * 0.9 + 0.1);
    const holdFrames = Array.from({ length: N }, () => Math.floor(Math.random() * 40 + 20));

    function drawEq() {
      ec.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        // Glissement lent vers la cible
        heights[i] += (targets[i] - heights[i]) * 0.04;
        holdFrames[i]--;
        if (holdFrames[i] <= 0) {
          targets[i] = Math.random() * 0.9 + 0.08;
          holdFrames[i] = Math.floor(Math.random() * 50 + 30);
        }

        const h   = heights[i] * H;
        const x   = i * (BAR + GAP);
        const y   = H - h;

        // Barre avec gradient orange
        const grad = ec.createLinearGradient(0, H, 0, 0);
        grad.addColorStop(0,   '#FF5A00');
        grad.addColorStop(0.6, '#FF8C42');
        grad.addColorStop(1,   'rgba(255,200,100,0.4)');
        ec.fillStyle = grad;
        ec.beginPath();
        if (ec.roundRect) {
          ec.roundRect(x, y, BAR, h, 3);
        } else {
          ec.rect(x, y, BAR, h);
        }
        ec.fill();
      }
      eqRaf = requestAnimationFrame(drawEq);
    }
    drawEq();
  }

  // ── Séquence d'entrée
  const tl = gsap.timeline();

  tl
    // EQ apparaît
    .to(eqCanvas, { opacity: 1, duration: 0.4, ease: 'power2.out' })
    // Lettres montent une à une
    .to(letters, {
      y: 0, opacity: 1,
      duration: 0.55,
      stagger: 0.05,
      ease: 'power3.out'
    }, '-=0.1')
    // Sous-titre + barre + pct
    .to([loaderSub, loaderBot], {
      opacity: 1, y: 0,
      duration: 0.45, ease: 'power2.out'
    }, '-=0.15');

  // ── Compteur progression
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 9 + 3;
    if (pct >= 92) { pct = 92; clearInterval(iv); }
    if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    updateDaw(pct);
  }, 100);

  // ── Fermeture rideau
  setTimeout(() => {
    clearInterval(iv);
    pct = 100;
    if (pctEl) pctEl.textContent = '100%';
    updateDaw(100);

    setTimeout(() => {
      if (eqRaf) cancelAnimationFrame(eqRaf);
      gsap.to('.loader-inner', { opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to('.loader-panel-top',    { yPercent: -100, duration: 0.65, delay: 0.1, ease: 'power4.inOut' });
      gsap.to('.loader-panel-bottom', {
        yPercent: 100, duration: 0.65, delay: 0.1, ease: 'power4.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          document.body.style.overflow = '';
          try { initScrollAnimations(); } catch(e) { console.warn(e); }
          try { triggerHeroAnimations(); } catch(e) { console.warn(e); _heroFallback(); }
        }
      });
    }, 300);
  }, 2200);
})();

// ── HERO WAVEFORM ─────────────────────────────────────────────
(function() {
  const canvas = document.getElementById('heroWave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let t = 0;

  // 128 BPM — beat period in seconds at 60fps
  const BEAT = (60 / 128) * 60; // ~28.125 frames

  // Pre-baked noise profile — deterministic, stays fixed between resizes
  let noiseProfile = null;
  function buildNoise(n) {
    let s = 42;
    function rng() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }
    const a = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // Multiple octaves of "frozen" noise — gives the jagged but organic DAW silhouette
      a[i] =
        0.50 * rng() +
        0.25 * rng() +
        0.15 * rng() +
        0.10 * rng();
    }
    // Smooth it (box blur × 3) so neighbouring bars feel connected
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < n - 1; i++) a[i] = (a[i-1] + a[i] + a[i+1]) / 3;
    }
    // Normalise to 0→1
    let mx = 0; for (let i = 0; i < n; i++) if (a[i] > mx) mx = a[i];
    if (mx > 0) for (let i = 0; i < n; i++) a[i] /= mx;
    return a;
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = 180;
    noiseProfile = buildNoise(W);
  }
  resize();
  window.addEventListener('resize', resize);

  // Offscreen reuse
  let off, octx;
  function getOff() {
    if (!off || off.width !== W || off.height !== H) {
      off  = new OffscreenCanvas(W, H);
      octx = off.getContext('2d');
    }
    return { off, octx };
  }

  // Smooth envelope followers
  let envKick  = 0;
  let envSnare = 0;
  let envBreath = 0.8;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const { off, octx: oc } = getOff();
    oc.clearRect(0, 0, W, H);

    // ── Beat envelopes at 128 BPM
    const beatPhase  = (t / BEAT) % 1;           // 0→1 every beat (kick on every beat)
    const snarePhase = (t / BEAT * 0.5 + 0.5) % 1; // snare on 2 & 4 (offset half beat)

    const kickTarget  = Math.exp(-beatPhase  * 8) * 0.9;
    const snareTarget = Math.exp(-snarePhase * 10) * 0.45;

    // Slew limiters — kick attacks fast, releases slow
    envKick  += (kickTarget  > envKick  ? 0.55 : 0.06) * (kickTarget  - envKick);
    envSnare += (snareTarget > envSnare ? 0.40 : 0.05) * (snareTarget - envSnare);

    // Global breathing ~0.5Hz — slow undulation
    envBreath += (0.78 + 0.22 * Math.sin(t * 0.022) - envBreath) * 0.03;

    const amp = envBreath + envKick * 0.28 + envSnare * 0.10 + (window._previewBoost || 0) * 0.55;
    const cy  = H * 0.5;

    // ── Build top envelope as a filled shape (waveform silhouette)
    // Upper half
    oc.beginPath();
    oc.moveTo(0, cy);

    for (let x = 0; x < W; x++) {
      const n   = noiseProfile[x];
      // Multiple time-varying layers scrolling at different speeds → organic movement
      const slow  = Math.sin(t * 0.008 + x * 0.004)  * 0.10;
      const mid   = Math.sin(t * 0.025 + x * 0.011)  * 0.07;
      const fast  = Math.sin(t * 0.055 + x * 0.022)  * 0.04;
      const micro = Math.sin(t * 0.120 + x * 0.055)  * 0.02;

      // Frequency bands: left side reacts to kick (sub), right side floats (highs)
      const freqW  = x / W;
      const kickW  = (1 - freqW) * envKick * 0.35;   // subs pump left
      const snareW = freqW * envSnare * 0.20;          // highs lift on snare

      const h = (n + slow + mid + fast + micro + kickW + snareW) * amp * cy * 0.62;
      oc.lineTo(x, cy - Math.max(1, h));
    }
    oc.lineTo(W, cy);
    oc.closePath();

    // Fill: gradient doux — orange profond en bas, fade en peaks
    const fillGrad = oc.createLinearGradient(0, cy, 0, 0);
    fillGrad.addColorStop(0,    'rgba(255,80,10,0.55)');
    fillGrad.addColorStop(0.4,  'rgba(255,110,30,0.35)');
    fillGrad.addColorStop(0.8,  'rgba(255,150,60,0.18)');
    fillGrad.addColorStop(1,    'rgba(255,180,90,0)');
    oc.fillStyle = fillGrad;
    oc.fill();

    // ── Bright top edge line — the "outline" of the waveform
    oc.beginPath();
    for (let x = 0; x < W; x++) {
      const n     = noiseProfile[x];
      const slow  = Math.sin(t * 0.008 + x * 0.004) * 0.10;
      const mid   = Math.sin(t * 0.025 + x * 0.011) * 0.07;
      const fast  = Math.sin(t * 0.055 + x * 0.022) * 0.04;
      const micro = Math.sin(t * 0.120 + x * 0.055) * 0.02;
      const freqW = x / W;
      const kickW  = (1 - freqW) * envKick * 0.35;
      const snareW = freqW * envSnare * 0.20;
      const h = (n + slow + mid + fast + micro + kickW + snareW) * amp * cy * 0.62;
      if (x === 0) oc.moveTo(x, cy - Math.max(1, h));
      else         oc.lineTo(x, cy - Math.max(1, h));
    }
    // Top edge line — la "signature" fine et lumineuse
    oc.strokeStyle = `rgba(255,180,90,${0.75 + envKick * 0.25})`;
    oc.lineWidth   = 1;
    oc.shadowColor = 'rgba(255,140,40,0.5)';
    oc.shadowBlur  = 6;
    oc.stroke();
    oc.shadowBlur  = 0;

    // ── Mirror below: flip & shrink + fade
    oc.save();
    oc.translate(0, cy);
    oc.scale(1, -0.38);
    oc.translate(0, -cy);

    oc.beginPath();
    oc.moveTo(0, cy);
    for (let x = 0; x < W; x++) {
      const n     = noiseProfile[x];
      const slow  = Math.sin(t * 0.008 + x * 0.004) * 0.10;
      const mid   = Math.sin(t * 0.025 + x * 0.011) * 0.07;
      const fast  = Math.sin(t * 0.055 + x * 0.022) * 0.04;
      const micro = Math.sin(t * 0.120 + x * 0.055) * 0.02;
      const freqW = x / W;
      const kickW  = (1 - freqW) * envKick * 0.35;
      const snareW = freqW * envSnare * 0.20;
      const h = (n + slow + mid + fast + micro + kickW + snareW) * amp * cy * 0.62;
      oc.lineTo(x, cy - Math.max(1, h));
    }
    oc.lineTo(W, cy);
    oc.closePath();

    const refGrad = oc.createLinearGradient(0, cy, 0, 0);
    refGrad.addColorStop(0,   'rgba(255,80,10,0.18)');
    refGrad.addColorStop(0.6, 'rgba(255,100,20,0.07)');
    refGrad.addColorStop(1,   'rgba(255,80,10,0)');
    oc.fillStyle = refGrad;
    oc.fill();
    oc.restore();

    // ── Beat flash: orange glow at baseline on kick — adouci
    if (envKick > 0.05) {
      const fg = oc.createRadialGradient(W/2, cy, 0, W/2, cy, W * 0.5);
      fg.addColorStop(0,   `rgba(255,90,0,${envKick * 0.06})`);
      fg.addColorStop(1,   'rgba(255,60,0,0)');
      oc.fillStyle = fg;
      oc.fillRect(0, cy - 30, W, 60);
    }

    // ── Horizontal edge fade
    oc.globalCompositeOperation = 'destination-in';
    const fade = oc.createLinearGradient(0, 0, W, 0);
    fade.addColorStop(0,    'rgba(0,0,0,0)');
    fade.addColorStop(0.05, 'rgba(0,0,0,1)');
    fade.addColorStop(0.95, 'rgba(0,0,0,1)');
    fade.addColorStop(1,    'rgba(0,0,0,0)');
    oc.fillStyle = fade;
    oc.fillRect(0, 0, W, H);
    oc.globalCompositeOperation = 'source-over';

    // ── Vertical top fade (waveform disappears toward top of canvas)
    oc.globalCompositeOperation = 'destination-in';
    const topFade = oc.createLinearGradient(0, 0, 0, H);
    topFade.addColorStop(0,    'rgba(0,0,0,0)');
    topFade.addColorStop(0.18, 'rgba(0,0,0,1)');
    topFade.addColorStop(1,    'rgba(0,0,0,1)');
    oc.fillStyle = topFade;
    oc.fillRect(0, 0, W, H);
    oc.globalCompositeOperation = 'source-over';

    ctx.drawImage(off, 0, 0);
    t += 1;
    raf = requestAnimationFrame(draw);
  }
  draw();
  window._stopHeroWave = () => cancelAnimationFrame(raf);
})();

// ── HERO ANIMATIONS ───────────────────────────────────────────
function triggerHeroAnimations() {
  // Parallax photo + orbs au scroll
  gsap.to('.hero-photo', {
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    yPercent: 12, scale: 1.06, ease: 'none'
  });
  gsap.to('.hero-bg-orb-1', {
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    yPercent: 30, ease: 'none'
  });
  gsap.to('.hero-bg-orb-2', {
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    yPercent: -20, ease: 'none'
  });

  // Pré-état (Hero v2)
  gsap.set('.hero-tagline', { visibility: 'visible', opacity: 0, x: -20 });
  gsap.set('.hero-name',    { visibility: 'visible', opacity: 0, y: 60 });
  gsap.set('.hero-bottom',  { visibility: 'visible', opacity: 0, y: 20 });
  gsap.set('.hero-status',    { visibility: 'visible', opacity: 0, x: -20 });
  gsap.set('.hero-next-card', { visibility: 'visible', opacity: 0, y: -16 });
  if (heroContent) heroContent.classList.remove('hero-loading');

  const tl = gsap.timeline();

  tl
    .to('.hero-status',     { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
    .to('.hero-next-card',  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.35)
    .to('.hero-tagline',    { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0.45)
    .to('.hero-name',       { opacity: 1, y: 0, duration: 1.0, ease: 'power4.out' }, 0.55)
    .to('.hero-bottom',     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'opacity,y' }, 0.95);

  // Parallax souris subtil sur le nom + orbs (desktop)
  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      gsap.to('.hero-name',      { x: x * 0.4, y: y * 0.4, duration: 1.2, ease: 'power2.out' });
      gsap.to('.hero-photo',     { x: x * 0.6, y: y * 0.6, duration: 1.8, ease: 'power2.out' });
      gsap.to('.hero-bg-orb-1',  { x: x * 1.4, y: y * 1.4, duration: 2.4, ease: 'power2.out' });
      gsap.to('.hero-bg-orb-2',  { x: x * -1.0, y: y * -1.0, duration: 2.4, ease: 'power2.out' });
    });
  }

  // ─── Hero v2 : remplit la mini-card "Next show" depuis les .show-item ───
  const heroNextCard = document.getElementById('heroNextCard');
  if (heroNextCard) {
    const shows = Array.from(document.querySelectorAll('.show-item[data-date]'))
      .map(el => ({ el, t: new Date(el.dataset.date).getTime() }))
      .filter(s => s.t > Date.now())
      .sort((a, b) => a.t - b.t);
    if (shows.length === 0) {
      heroNextCard.style.display = 'none';
    } else {
      const next = shows[0];
      const d = new Date(next.el.dataset.date);
      const day = String(d.getDate()).padStart(2, '0');
      const monFR = ['Jan','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'][d.getMonth()];
      const venue = next.el.querySelector('.show-venue')?.childNodes[0]?.textContent?.trim() || '';
      const city  = (next.el.querySelector('.show-city')?.textContent || '').trim().split(',')[0];
      heroNextCard.querySelector('.hero-next-day').textContent = day;
      heroNextCard.querySelector('.hero-next-mon').textContent = `${monFR} ${d.getFullYear()}`;
      heroNextCard.querySelector('.hero-next-city').textContent = city || venue;
      // Countdown live
      const cdEl = heroNextCard.querySelector('.hero-next-countdown');
      const updateHeroNext = () => {
        const diff = next.t - Date.now();
        if (diff <= 0) { cdEl.textContent = 'Ce soir'; return; }
        const days = Math.floor(diff / 86400000);
        cdEl.textContent = days === 0 ? 'Demain' : `J − ${days}`;
      };
      updateHeroNext();
      setInterval(updateHeroNext, 60000);
    }
  }
}

// ── SCROLL ANIMATIONS ─────────────────────────────────────────
function initScrollAnimations() {
  const mob = window.innerWidth < 680;

  // Navbar
  ScrollTrigger.create({
    onUpdate: self => {
      const y = window.scrollY;
      if (y < 80) gsap.to('#navbar', { y: 0, duration: 0.3, ease: 'power2.out' });
      else if (self.direction === -1) gsap.to('#navbar', { y: 0, duration: 0.4, ease: 'power2.out' });
      else if (self.direction === 1 && y > 200) gsap.to('#navbar', { y: -80, duration: 0.3, ease: 'power2.in' });
    }
  });

  // Marquee accélère au scroll
  ScrollTrigger.create({
    trigger: '.marquee-section',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: self => {
      const speed = 18 - self.getVelocity() / 80;
      gsap.to('.marquee-track', { animationDuration: Math.max(6, Math.min(18, speed)) + 's', overwrite: true });
    }
  });

  // Section tags
  gsap.utils.toArray('.section-tag').forEach(tag => {
    gsap.from(tag, {
      scrollTrigger: { trigger: tag, start: 'top 95%' },
      opacity: 0, x: -20, duration: 0.6, ease: 'power3.out'
    });
  });

  // Titres — split en mots
  gsap.utils.toArray('.section-title, .about-text h2, .epk-title, .contact-left h2, .shows-header h2, .releases-intro h2').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 92%' },
      opacity: 0,
      y: mob ? 50 : 60,
      skewY: mob ? 0 : 2,
      duration: 0.9,
      ease: 'power4.out'
    });
  });

  // About visuel
  gsap.from('.about-img-frame', {
    scrollTrigger: { trigger: '#about', start: 'top 85%' },
    opacity: 0, scale: 0.88, y: 60,
    duration: 1.1, ease: 'power3.out'
  });
  gsap.from('.about-tag-float', {
    scrollTrigger: { trigger: '#about', start: 'top 80%' },
    opacity: 0, scale: 0.6, rotation: -10,
    duration: 0.8, delay: 0.4, ease: 'back.out(2)'
  });

  // About texte
  gsap.from('.about-text > *', {
    scrollTrigger: { trigger: '.about-text', start: 'top 90%' },
    opacity: 0, x: mob ? 0 : 50, y: mob ? 30 : 0,
    duration: 0.7, stagger: 0.14, ease: 'power3.out'
  });

  // Stats
  gsap.utils.toArray('.stat-item').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 95%' },
      opacity: 0, y: 30, scale: 0.9,
      duration: 0.6, delay: i * 0.08,
      ease: 'back.out(2)'
    });
    const numEl = el.querySelector('.stat-num');
    const raw   = numEl.innerText.replace(/[^0-9]/g, '');
    const suf   = numEl.innerHTML.replace(/[0-9]/g, '');
    if (!raw) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      scrollTrigger: { trigger: el, start: 'top 95%' },
      val: parseInt(raw), duration: 2.0, ease: 'power2.out',
      onUpdate: () => { numEl.innerHTML = Math.round(obj.val) + suf; }
    });
  });

  // Release cards — arrivent de gauche et droite vers le centre
  window._animateReleases = () => {
    const cards = gsap.utils.toArray('#releasesGrid .release-card');
    const total = cards.length;
    const mid   = (total - 1) / 2;

    // Toutes les cards invisibles au départ
    gsap.set(cards, { opacity: 0 });

    ScrollTrigger.create({
      trigger: '#releasesGrid',
      start: 'top 72%',   // se déclenche quand la grille entre bien dans le viewport
      once: true,
      onEnter: () => {
        cards.forEach((card, i) => {
          const side = i <= mid ? -1 : 1;
          const dist = Math.abs(i - mid);
          gsap.fromTo(card,
            { x: side * 220, opacity: 0, scale: 0.94 },
            {
              x: 0, opacity: 1, scale: 1,
              duration: 0.9,
              delay: dist * 0.08,
              ease: 'power4.out',
              clearProps: 'all'
            }
          );
        });
      }
    });
  };
  window._animateReleases();

  // Compteur streams releases
  const streamsEl = document.getElementById('streamsCount');
  if (streamsEl) {
    const obj = { val: 0 };
    gsap.to(obj, {
      scrollTrigger: { trigger: '#releases', start: 'top 80%', once: true },
      val: 500000,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate: () => {
        const v = Math.round(obj.val);
        streamsEl.textContent = v >= 1000 ? (v / 1000).toFixed(0) + 'K+' : v.toString();
      }
    });
  }

  // ─── Agenda v2 ──────────────────────────────────────────────
  const showsList   = document.querySelector('.shows-list');
  const featuredEl  = document.getElementById('showsFeatured');
  const countEl     = document.getElementById('showsCountNum');
  const filterBtns  = document.querySelectorAll('.shows-filter');

  // 1. Tri auto des show-items par date (ascendant), renumérotation
  const allShows = Array.from(showsList.querySelectorAll('.show-item'));
  allShows.sort((a, b) =>
    new Date(a.dataset.date).getTime() - new Date(b.dataset.date).getTime());

  const nowMs = Date.now();
  // Marque past / upcoming et renumérote dans l'ordre chronologique
  allShows.forEach((item, i) => {
    const t = new Date(item.dataset.date).getTime();
    const isPast = t < nowMs;
    item.classList.toggle('show-item--past', isPast);
    item.dataset.status = isPast ? 'past' : 'upcoming';
    const numEl = item.querySelector('.show-num');
    if (numEl) numEl.textContent = String(i + 1).padStart(2, '0');
    // Badge "Passé" pour les anciens shows
    if (isPast) {
      const venue = item.querySelector('.show-venue');
      if (venue && !venue.querySelector('.show-badge--past')) {
        const b = document.createElement('span');
        b.className = 'show-badge show-badge--past';
        b.textContent = 'Passé';
        venue.appendChild(b);
      }
    }
    showsList.appendChild(item); // ré-injecte dans l'ordre trié
  });

  // 2. Promotion du 1er upcoming en "Hero"
  const nextShow = allShows.find(s => s.dataset.status === 'upcoming');
  function renderFeatured(item) {
    if (!item) {
      featuredEl.innerHTML = `
        <div class="featured-card">
          <div class="featured-meta">
            <span class="featured-badge">Aucun show à venir</span>
          </div>
          <div class="featured-info" style="padding:8px 0 4px;">
            <div class="featured-venue">Prochaines dates bientôt annoncées.</div>
            <div class="featured-city">Reste connecté.</div>
          </div>
        </div>`;
      return;
    }
    const date    = new Date(item.dataset.date);
    const day     = String(date.getDate()).padStart(2, '0');
    const monthFR = ['Jan','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'][date.getMonth()];
    const venue   = item.querySelector('.show-venue').childNodes[0].textContent.trim();
    const city    = item.querySelector('.show-city').textContent.trim();
    const soldOut = !!item.querySelector('.show-badge--sold');
    const ticket  = item.querySelector('.show-action a');
    const num     = item.querySelector('.show-num').textContent;

    featuredEl.innerHTML = `
      <div class="featured-card" data-date="${item.dataset.date}">
        <div class="featured-meta">
          <span class="featured-badge">Next show</span>
          <span class="featured-num">${num} / ${String(allShows.length).padStart(2,'0')}</span>
        </div>
        <div class="featured-main">
          <div class="featured-date-huge">
            <span class="huge-day">${day}</span>
            <span class="huge-month">${monthFR}<br>${date.getFullYear()}</span>
          </div>
          <div class="featured-info">
            <div class="featured-venue">${venue}${soldOut ? ' <span class="show-badge">Sold Out</span>' : ''}</div>
            <div class="featured-city">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              ${city}
            </div>
            <div class="featured-actions">
              <a href="${ticket.href}" target="${ticket.target || '_self'}" class="btn-primary">${ticket.textContent}</a>
              <a href="#contact" class="btn-ghost">Plus d'infos</a>
            </div>
          </div>
        </div>
        <div class="featured-countdown">
          <div class="cd-block"><div class="cd-num" data-cd="d">000</div><div class="cd-lbl">Jours</div></div>
          <div class="cd-block"><div class="cd-num" data-cd="h">00</div><div class="cd-lbl">Heures</div></div>
          <div class="cd-block"><div class="cd-num" data-cd="m">00</div><div class="cd-lbl">Min</div></div>
          <div class="cd-block"><div class="cd-num" data-cd="s">00</div><div class="cd-lbl">Sec</div></div>
        </div>
      </div>`;
  }
  renderFeatured(nextShow);

  // 3. Compteur dynamique selon filtre actif
  function updateCount(filter) {
    const visible = allShows.filter(s =>
      filter === 'all' ? true : s.dataset.status === filter).length;
    if (countEl) countEl.textContent = String(visible);
  }
  updateCount('all');

  // 4. Filtres click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      const f = btn.dataset.filter;
      allShows.forEach(s => {
        const show = f === 'all' || s.dataset.status === f;
        s.classList.toggle('is-hidden', !show);
      });
      // Hero visible seulement si on montre les upcoming
      featuredEl.style.display = (f === 'past') ? 'none' : '';
      updateCount(f);
    });
  });

  // 5. Animations d'entrée
  gsap.utils.toArray('.show-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 95%' },
      opacity: 0, x: -50, duration: 0.7,
      delay: i * 0.08, ease: 'power3.out'
    });
  });
  if (nextShow) {
    gsap.from('.featured-card', {
      scrollTrigger: { trigger: '.featured-card', start: 'top 90%' },
      opacity: 0, y: 30, duration: 0.9, ease: 'power3.out'
    });
  }

  // 6. Tick — countdown live D:H:M:S (à la seconde) + countdown liste + barre progress
  function tick() {
    const now = Date.now();

    // Countdown hero
    const cdCard = featuredEl.querySelector('.featured-card[data-date]');
    if (cdCard) {
      const diff = new Date(cdCard.dataset.date).getTime() - now;
      const safe = Math.max(0, diff);
      const d = Math.floor(safe / 86400000);
      const h = Math.floor((safe % 86400000) / 3600000);
      const m = Math.floor((safe % 3600000) / 60000);
      const s = Math.floor((safe % 60000) / 1000);
      const set = (k, v, pad) => {
        const el = cdCard.querySelector(`[data-cd="${k}"]`);
        if (el) el.textContent = String(v).padStart(pad, '0');
      };
      set('d', d, 3); set('h', h, 2); set('m', m, 2); set('s', s, 2);
    }

    // Countdown texte sur chaque ligne
    document.querySelectorAll('.show-countdown[data-date]').forEach(el => {
      const target = new Date(el.dataset.date).getTime();
      const diff   = target - now;
      if (diff <= 0) {
        const past = Math.floor(-diff / 86400000);
        el.textContent = past === 0 ? 'Ce soir' : `Il y a ${past}j`;
        return;
      }
      const days = Math.floor(diff / 86400000);
      el.textContent = days === 0 ? 'Demain' : `J − ${days}`;
    });

    // Barre de progression (6 mois avant → jour J)
    document.querySelectorAll('.show-progress-fill[data-date]').forEach(el => {
      const showDate   = new Date(el.dataset.date).getTime();
      const startRef   = showDate - 180 * 86400000;
      const totalRange = showDate - startRef;
      const elapsed    = now - startRef;
      const pct        = Math.min(100, Math.max(0, (elapsed / totalRange) * 100));
      el.style.width   = pct + '%';
    });
  }
  tick();
  setInterval(tick, 1000);

  // EPK — pré-capture des valeurs finales
  const epkStatNums = Array.from(document.querySelectorAll('.epk-stat-num')).map(el => {
    const raw = el.textContent.trim();
    return {
      el,
      prefix: raw.startsWith('+') ? '+' : '',
      suffix: raw.includes('K') ? 'K' : '',
      plus:   raw.endsWith('+')  ? '+' : '',
      num:    parseInt(raw.replace(/[^0-9]/g, ''))
    };
  });

  // Masquer immédiatement via gsap.set
  gsap.set(['.epk-label', '.epk-title', '.epk-dl-btn'], { autoAlpha: 0, x: -30 });
  gsap.set(['.epk-stat', '.epk-stat-sep'], { opacity: 0, scale: 0.85 });

  ScrollTrigger.create({
    trigger: '.epk-banner',
    start: 'top 82%',
    once: true,
    onEnter() {
      const tl = gsap.timeline();

      // Texte gauche — chaque élément arrive séparément, bien lisible
      tl.to('.epk-label',  { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0);
      tl.to('.epk-title',  { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.18);
      tl.to('.epk-dl-btn', { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0.36);

      // Stats — pop in avec scale
      tl.to('.epk-stat, .epk-stat-sep', {
        opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.6)'
      }, 0.3);

      // Compteurs — en sync avec l'apparition des stats
      epkStatNums.forEach((d, i) => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: d.num, duration: 1.8, delay: 0.4 + i * 0.15, ease: 'power2.out',
          onUpdate() { d.el.textContent = d.prefix + Math.round(obj.val) + d.suffix + d.plus; },
          onComplete() { d.el.textContent = d.prefix + d.num + d.suffix + d.plus; }
        });
      });
    }
  });

  ScrollTrigger.create({
    trigger: '.epk-kit-row',
    start: 'top 88%',
    once: true,
    onEnter() {
      document.querySelector('.epk-kit-row').classList.add('epk-kit-in');
    }
  });

  // Parallax hero wave au scroll
  gsap.to('#heroWave', {
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    y: 80, ease: 'none'
  });

  // About visuel parallax
  gsap.to('.about-img-frame', {
    scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true },
    y: -40, ease: 'none'
  });

  // Contact
  gsap.from('.contact-left > *', {
    scrollTrigger: { trigger: '#contact', start: 'top 88%' },
    opacity: 0, x: mob ? 0 : -50, y: mob ? 30 : 0,
    duration: 0.7, stagger: 0.12, ease: 'power3.out'
  });
  gsap.from('.contact-form', {
    scrollTrigger: { trigger: '#contact', start: 'top 88%' },
    opacity: 0, x: mob ? 0 : 50, y: mob ? 40 : 0,
    duration: 0.8, delay: mob ? 0.1 : 0, ease: 'power3.out'
  });
}

// ── MAGNETIC BUTTONS (desktop) ────────────────────────────────
if (!isTouch) {
  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav, .btn-small').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

// ── CONTACT FORM ──────────────────────────────────────────────
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const note = document.getElementById('formNote');
    const btn  = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi…';
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(this)).toString()
    })
    .then(r => {
      note.textContent = r.ok
        ? 'Message envoyé ! Réponse sous 48h.'
        : 'Erreur — contactez directement sur Instagram.';
      if (r.ok) this.reset();
      setTimeout(() => { note.textContent = ''; }, 6000);
      btn.disabled = false;
      btn.textContent = 'Envoyer le message';
    })
    .catch(() => {
      note.textContent = 'Erreur réseau.';
      btn.disabled = false;
      btn.textContent = 'Envoyer le message';
    });
  });
}

// ── SPOTIFY AUTO-RELEASES (+ Deezer pour les previews) ───────
(async function loadSpotifyReleases() {
  const CLIENT_ID     = '8a237e09558d4c3387a271755ca342fe';
  const CLIENT_SECRET = '717e7084756048d2b82769c7e0b68659';
  const ARTIST_ID     = '3YE19U8tfVU4D0TI4IeilQ';
  const DEEZER_ARTIST = '12280184';
  const grid          = document.getElementById('releasesGrid');
  if (!grid) return;

  // ── Normalisation pour matcher Spotify ↔ Deezer
  function normalizeTitle(s) {
    return (s || '')
      .toLowerCase()
      .replace(/[\(\[].*?[\)\]]/g, '')                   // (…) [...]
      .replace(/\b(feat|ft|featuring|with)\.?\b.*$/g, '') // feat. X…
      .replace(/\b(remix|edit|extended|original mix|radio edit|club mix|vip)\b/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  // Match fuzzy : exact, puis substring dans les 2 sens (gère "Gold Face / Ring Mode" ↔ "goldface")
  function findInMap(name, map) {
    const key = normalizeTitle(name);
    if (!key || !map) return null;
    if (map[key]) return map[key];
    // Découpe le titre Spotify sur " / " pour gérer les double-singles
    const parts = (name || '').split(/[\/&,]| - | x /i).map(p => normalizeTitle(p)).filter(Boolean);
    for (const p of parts) {
      if (map[p]) return map[p];
    }
    // Substring match dans les 2 sens
    for (const k of Object.keys(map)) {
      if (k.length >= 4 && (key.includes(k) || k.includes(key))) return map[k];
    }
    return null;
  }

  // ── Overrides : versions Deezer épinglées par track ID (les URLs d'extrait expirent ~24h,
  //    donc on fetch l'ID à chaque chargement pour avoir une URL fraîche)
  const TRACK_OVERRIDES = {
    'goldface': '2554752092',   // Album "Gold Face / Ring Mode"
    'ringmode': '2554752102',   // Album "Gold Face / Ring Mode"
  };

  function jsonp(url) {
    return new Promise((resolve) => {
      const cb = '_dz_cb_' + Math.random().toString(36).slice(2);
      let done = false;
      const cleanup = () => { delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s); };
      const timeout = setTimeout(() => { if (!done) { done = true; cleanup(); resolve(null); } }, 6000);
      window[cb] = (data) => { done = true; clearTimeout(timeout); cleanup(); resolve(data); };
      const s = document.createElement('script');
      s.src = url + (url.includes('?') ? '&' : '?') + `output=jsonp&callback=${cb}`;
      s.onerror = () => { if (!done) { done = true; clearTimeout(timeout); cleanup(); resolve(null); } };
      document.head.appendChild(s);
    });
  }

  async function fetchOverrides() {
    const out = {};
    await Promise.all(Object.entries(TRACK_OVERRIDES).map(async ([key, id]) => {
      const t = await jsonp(`https://api.deezer.com/track/${id}`);
      if (t && t.preview) {
        out[key] = { preview: t.preview, cover: t.album?.cover_xl || t.album?.cover_big || null };
      }
    }));
    return out;
  }

  // ── Deezer JSONP (l'API ne supporte pas CORS direct, mais accepte ?output=jsonp&callback=)
  function fetchDeezerPreviews() {
    return new Promise((resolve) => {
      const cb = '_dz_cb_' + Math.random().toString(36).slice(2);
      let done = false;
      const cleanup = () => { delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s); };
      const timeout = setTimeout(() => { if (!done) { done = true; cleanup(); resolve({}); } }, 6000);
      window[cb] = (data) => {
        done = true; clearTimeout(timeout);
        const map = {};
        (data && data.data ? data.data : []).forEach(t => {
          if (t && t.preview && t.title) {
            const key = normalizeTitle(t.title);
            // Prend la première occurrence — Deezer renvoie top tracks d'abord
            if (key && !map[key]) map[key] = { preview: t.preview, cover: t.album?.cover_xl || t.album?.cover_big || null };
          }
        });
        cleanup();
        resolve(map);
      };
      const s = document.createElement('script');
      // /search ratisse plus large que /artist/{id}/top (qui plafonne à ~17 résultats)
      const q = encodeURIComponent('artist:"Loadjaxx"');
      s.src = `https://api.deezer.com/search?q=${q}&limit=200&output=jsonp&callback=${cb}`;
      s.onerror = () => { if (!done) { done = true; clearTimeout(timeout); cleanup(); resolve({}); } };
      document.head.appendChild(s);
    });
  }

  const fallbackGrads = [
    'linear-gradient(135deg,#FF5A00 0%,#1a0500 100%)',
    'linear-gradient(135deg,#FF8C42 0%,#0d0500 100%)',
    'linear-gradient(135deg,#cc3300 0%,#FF5A00 100%)',
    'linear-gradient(135deg,#111 0%,#FF5A00 100%)',
    'linear-gradient(135deg,#FF5A00 0%,#330000 100%)',
    'linear-gradient(135deg,#FF8C42 0%,#1a0800 100%)',
    'linear-gradient(135deg,#992200 0%,#FF8C42 100%)',
    'linear-gradient(135deg,#0d0d0d 0%,#FF5A00 100%)',
    'linear-gradient(135deg,#331100 0%,#FF8C42 100%)',
  ];

  // Données statiques — visibles immédiatement, remplacées par l'API si dispo
  const staticReleases = [
    { name: "Rihanna — Why",      year: '2026', type: 'remix',    url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "Friendly (Remix)",   year: '2025', type: 'remix',    url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "Friendly",           year: '2025', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "Flawless",           year: '2025', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "Free My Mind",       year: '2025', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "House + Tequila",    year: '2024', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "My Bubble",          year: '2024', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "Gold Face",          year: '2023', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
    { name: "Ring Mode",          year: '2023', type: 'original', url: 'https://linktr.ee/loadjaxx', img: null },
  ];

  function buildCard(item, i) {
    const img   = item.img;
    const grad  = fallbackGrads[i % fallbackGrads.length];
    const isFeat = i === 0;
    const num   = String(i + 1).padStart(2, '0');
    const typeMap = { remix: 'Remix', original: 'Original', feat: 'Feat', album: 'Album' };
    const typeLabel = typeMap[item.type] || 'Single';
    const badgeNew    = isFeat ? `<div class="release-badge-new">New</div>` : '';
    const featOverlay = isFeat ? `
      <div class="release-feat-info">
        <div class="release-feat-title">${item.name}</div>
        <div class="release-feat-sub">${typeLabel} · ${item.year}</div>
      </div>` : '';
    return `
      <a href="${item.url}" target="_blank" rel="noopener" class="release-card${isFeat ? ' release-card--feat' : ''}" data-preview="${item.preview || ''}" data-track="${item.name.replace(/"/g, '&quot;')}">
        ${badgeNew}
        <div class="release-num">${num}</div>
        <div class="release-cover">
          ${img ? `<img src="${img}" alt="${item.name}" class="release-img" loading="lazy" />` : `<div class="release-cover-bg" style="background:${grad}"></div>`}
          <div class="release-play"><div class="release-play-btn"><svg viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg></div></div>
          ${featOverlay}
        </div>
        ${!isFeat ? `<div class="release-info">
          <div class="release-title">${item.name}</div>
          <div class="release-sub" data-type="${item.type}">${typeLabel} · ${item.year}</div>
        </div>` : ''}
      </a>`;
  }

  function injectCards(releases) {
    grid.innerHTML = releases.map(buildCard).join('');
    ScrollTrigger.refresh();
    if (window._animateReleases) window._animateReleases();
    if (!isTouch) {
      const cur = document.querySelector('.g-cursor');
      grid.querySelectorAll('.release-card').forEach(el => {
        if (cur) {
          el.addEventListener('mouseenter', () => cur.classList.add('hover'));
          el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
        }
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x: (e.clientX-(r.left+r.width/2))*0.06, y: (e.clientY-(r.top+r.height/2))*0.06, duration: 0.3, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }));
      });
    }
  }

  // Affiche les données statiques immédiatement
  injectCards(staticReleases);

  // ── Lance Deezer (search + overrides épinglés) en parallèle dès maintenant
  const deezerPromise = Promise.all([fetchDeezerPreviews(), fetchOverrides()])
    .then(([searchMap, overrides]) => {
      // Les overrides écrasent toujours les résultats de la search
      return { ...searchMap, ...overrides };
    });

  // Quand Deezer répond, enrichit les cards déjà affichées (au cas où Spotify est lent ou en échec)
  deezerPromise.then(dz => {
    if (!dz || Object.keys(dz).length === 0) return;
    grid.querySelectorAll('.release-card').forEach(card => {
      if (card.dataset.preview) return; // déjà rempli
      const hit = findInMap(card.dataset.track || '', dz);
      if (hit) card.dataset.preview = hit.preview;
    });
  });

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET) },
      body: 'grant_type=client_credentials'
    });
    if (!tokenRes.ok) throw new Error('Token ' + tokenRes.status);
    const { access_token } = await tokenRes.json();

    const albumsRes = await fetch(
      `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&market=FR&limit=9`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    );
    if (!albumsRes.ok) throw new Error('Albums ' + albumsRes.status);
    const { items } = await albumsRes.json();
    if (!items?.length) return;

    // Attend Deezer pour merger les previews
    const dz = await deezerPromise;

    const releases = items.slice(0, 9).map(item => {
      const nameLow = item.name.toLowerCase();
      let type;
      if (nameLow.includes('remix')) type = 'remix';
      else if (item.artists?.length > 1 || nameLow.includes('feat') || nameLow.includes('ft.')) type = 'feat';
      else if (item.album_type === 'album') type = 'album';
      else type = 'original';
      const dzHit = findInMap(item.name, dz);
      return {
        name:    item.name,
        year:    item.release_date?.slice(0,4) ?? '',
        type,
        url:     item.external_urls.spotify,            // ← clic = Spotify
        img:     item.images?.[0]?.url ?? dzHit?.cover ?? null,
        preview: item.preview_url ?? dzHit?.preview ?? null  // ← preview = Spotify si dispo sinon Deezer
      };
    });

    injectCards(releases);

  } catch (err) {
    console.error('[Spotify] FAILED:', err.message);
  }
})();

// ═══════════════════════════════════════════════════════════════
// ── BPM SYNC ─ le site devient un instrument 128 BPM ──
// ═══════════════════════════════════════════════════════════════
(function bpmSync() {
  const BPM      = 128;
  const BEAT_MS  = 60000 / BPM;             // 468.75ms
  const BAR_MS   = BEAT_MS * 4;             // 1875ms par mesure
  const fab      = document.getElementById('bpmSync');
  const beatsBar = document.getElementById('bpmBeats');
  if (!fab || !beatsBar) return;

  const beats = beatsBar.querySelectorAll('span');
  document.documentElement.style.setProperty('--beat-ms', BEAT_MS + 'ms');

  let active = localStorage.getItem('loadjaxx_bpm') === '1';
  let rafId   = null;
  let startT  = 0;
  let lastBeat = -1;

  function tick(ts) {
    if (!active) return;
    if (!startT) startT = ts;
    const elapsed = ts - startT;
    const beatIdx = Math.floor(elapsed / BEAT_MS) % 4;
    if (beatIdx !== lastBeat) {
      beats.forEach((b, i) => b.classList.toggle('beat-on', i === beatIdx));
      lastBeat = beatIdx;
    }
    rafId = requestAnimationFrame(tick);
  }

  function setActive(on) {
    active = on;
    fab.classList.toggle('active', on);
    beatsBar.classList.toggle('visible', on);
    document.body.classList.toggle('bpm-sync-active', on);
    localStorage.setItem('loadjaxx_bpm', on ? '1' : '0');
    if (on) {
      startT = 0; lastBeat = -1;
      rafId = requestAnimationFrame(tick);
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      beats.forEach(b => b.classList.remove('beat-on'));
    }
  }

  fab.addEventListener('click', () => setActive(!active));
  if (active) setTimeout(() => setActive(true), 100);

  // Cursor hover hook
  if (!isTouch) {
    const cur = document.querySelector('.g-cursor');
    if (cur) {
      [fab].forEach(el => {
        el.addEventListener('mouseenter', () => cur.classList.add('hover'));
        el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
      });
    }
  }
})();

// ═══════════════════════════════════════════════════════════════
// ── TRACK PREVIEW ─ 30s Spotify preview au hover ──
// ═══════════════════════════════════════════════════════════════
(function trackPreview() {
  const grid = document.getElementById('releasesGrid');
  const toast = document.getElementById('nowPreviewing');
  if (!grid || !toast) return;

  const toastText = toast.querySelector('.now-preview-text');
  let audio = null;
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let rmsRaf = null;
  let currentCard = null;
  let hoverTimer = null;
  let ringSvg = null;
  let ringCircle = null;
  let ringRaf = null;

  function ensureAudio() {
    if (audio) return;
    audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.volume = 0.55;
    audio.preload = 'none';
  }

  // ── Unlock audio dès la première interaction utilisateur (autoplay policy navigateur)
  let audioUnlocked = false;
  const SILENT_MP3 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAAAAAOTGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAnGMHkkIAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxCADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxEADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxGADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxIADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxKADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxMADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxOADwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    ensureAudio();
    const prevSrc = audio.src;
    const prevVol = audio.volume;
    audio.volume = 0;
    audio.src = SILENT_MP3;
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        audio.pause();
        audio.src = prevSrc;
        audio.volume = prevVol;
      }).catch(() => {
        audio.volume = prevVol;
      });
    }
  }
  // Tous les events qui comptent comme "user gesture" pour Chrome/Safari
  ['pointerdown', 'click', 'touchstart', 'keydown', 'wheel'].forEach(ev => {
    document.addEventListener(ev, unlockAudio, { once: true, capture: true, passive: true });
  });

  function ensureCtx() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      // Web Audio failed (Safari quirk?) — fallback to a simulated boost
      analyser = null;
    }
  }

  function pumpRms() {
    if (!analyser) {
      // Fallback : simule un envelope follower
      window._previewBoost = 0.45 + Math.sin(performance.now() * 0.008) * 0.15;
    } else {
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      // Lissage : la valeur monte vite, descend doucement
      const target = Math.min(1, rms * 2.8);
      window._previewBoost = (window._previewBoost || 0) + (target - (window._previewBoost || 0)) * 0.3;
    }
    rmsRaf = requestAnimationFrame(pumpRms);
  }

  function buildRing(card) {
    const playBtn = card.querySelector('.release-play-btn');
    if (!playBtn) return;
    const size = 100; // viewBox unitaire — taille réelle pilotée par CSS (inset)
    const r = (size - 8) / 2;
    ringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ringSvg.setAttribute('class', 'release-preview-ring');
    ringSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    ringSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    ringCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ringCircle.setAttribute('cx', size / 2);
    ringCircle.setAttribute('cy', size / 2);
    ringCircle.setAttribute('r', r);
    const circ = 2 * Math.PI * r;
    ringCircle.style.strokeDasharray = circ;
    ringCircle.style.strokeDashoffset = circ;
    ringCircle.setAttribute('transform', `rotate(-90 ${size/2} ${size/2})`);
    ringSvg.appendChild(ringCircle);
    playBtn.appendChild(ringSvg);
  }

  function pumpRing() {
    if (!audio || !ringCircle) return;
    const dur = audio.duration || 30;
    const pct = Math.min(1, audio.currentTime / dur);
    const r = parseFloat(ringCircle.getAttribute('r'));
    const circ = 2 * Math.PI * r;
    ringCircle.style.strokeDashoffset = circ * (1 - pct);
    ringRaf = requestAnimationFrame(pumpRing);
  }

  function showToast(name) {
    toastText.textContent = `Now previewing · ${name}`;
    toast.classList.add('visible');
  }
  function hideToast() {
    toast.classList.remove('visible');
  }

  function startPreview(card) {
    const url = card.dataset.preview;
    const name = card.dataset.track || 'Track';
    if (!url) return;
    stopPreview();
    currentCard = card;
    card.classList.add('is-previewing');
    grid.classList.add('previewing');
    showToast(name);
    buildRing(card);

    ensureAudio();
    audio.src = url;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        ensureCtx();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        rmsRaf = requestAnimationFrame(pumpRms);
        ringRaf = requestAnimationFrame(pumpRing);
      }).catch(() => {
        // Autoplay block — show toast quand même mais sans audio
        rmsRaf = requestAnimationFrame(pumpRms);
        ringRaf = requestAnimationFrame(pumpRing);
      });
    }
  }

  function stopPreview() {
    if (rmsRaf) cancelAnimationFrame(rmsRaf);
    if (ringRaf) cancelAnimationFrame(ringRaf);
    rmsRaf = ringRaf = null;
    if (audio) { try { audio.pause(); } catch(e){} audio.src = ''; }
    if (currentCard) {
      currentCard.classList.remove('is-previewing');
      currentCard = null;
    }
    if (ringSvg && ringSvg.parentNode) ringSvg.parentNode.removeChild(ringSvg);
    ringSvg = ringCircle = null;
    grid.classList.remove('previewing');
    hideToast();
    // Fade-out propre du boost
    const fade = () => {
      const v = window._previewBoost || 0;
      if (v < 0.01) { window._previewBoost = 0; return; }
      window._previewBoost = v * 0.85;
      requestAnimationFrame(fade);
    };
    fade();
  }

  // Délégation via mouseover/mouseout (bubblent, contrairement à enter/leave)
  if (!isTouch) {
    grid.addEventListener('mouseover', (e) => {
      const card = e.target.closest && e.target.closest('.release-card');
      if (!card || !card.dataset.preview) return;
      if (card === currentCard) return;
      // L'event peut venir d'un enfant — on filtre l'entrée réelle dans la card
      const from = e.relatedTarget;
      if (from && card.contains(from)) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => startPreview(card), 220);
    });

    grid.addEventListener('mouseout', (e) => {
      const card = e.target.closest && e.target.closest('.release-card');
      if (!card) return;
      const to = e.relatedTarget;
      // Si on sort vers un enfant de la card → ignorer
      if (to && card.contains(to)) return;
      clearTimeout(hoverTimer);
      // Quitte la card courante → stop immédiat
      if (card === currentCard) stopPreview();
    });
  }
})();
