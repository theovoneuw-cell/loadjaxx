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

  // ─── Cursor trail : points orange qui suivent et fade-out ───
  const trailLayer = document.createElement('div');
  trailLayer.className = 'g-cursor-trail';
  document.body.appendChild(trailLayer);
  const TRAIL_MAX = 14;
  const trail = [];
  let trailTick = 0;
  let lastMouseX = 0, lastMouseY = 0, lastTrailTs = 0;
  window.addEventListener('mousemove', e => {
    lastMouseX = e.clientX; lastMouseY = e.clientY;
    const now = performance.now();
    // throttle : 1 point toutes les 30ms
    if (now - lastTrailTs < 30) return;
    lastTrailTs = now;
    const dot = document.createElement('span');
    dot.className = 'g-cursor-trail-dot';
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    trailLayer.appendChild(dot);
    trail.push(dot);
    // fade-out + remove via timeout (synchro avec CSS animation)
    setTimeout(() => { dot.remove(); }, 700);
    if (trail.length > TRAIL_MAX) {
      const old = trail.shift();
      old.remove();
    }
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
  gsap.set('.hero-tagline,.hero-name,.hero-bottom,.hero-status,.hero-next-card,.hero-social-card',
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

  // ── Waveform élégante : ligne oscilloscope + glow + particules ──
  // Liste de particules orange qui s'élèvent depuis la ligne (spawn sur kicks)
  const particles = [];
  const MAX_PARTICLES = 60;

  function spawnParticle(x, y) {
    if (particles.length >= MAX_PARTICLES) return;
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.4 - Math.random() * 0.9,
      r: 1.2 + Math.random() * 1.6,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
    });
  }

  // Calcul de la hauteur du wave à un x donné (utilisé pour tracer ET spawn)
  function waveH(x, cy, amp) {
    const n   = noiseProfile[Math.min(noiseProfile.length - 1, x)];
    const slow  = Math.sin(t * 0.011 + x * 0.0042) * 0.10;
    const mid   = Math.sin(t * 0.028 + x * 0.0098) * 0.06;
    const fast  = Math.sin(t * 0.062 + x * 0.0220) * 0.03;
    const freqW = x / W;
    const kickW  = (1 - freqW) * envKick * 0.32;
    const snareW = freqW * envSnare * 0.18;
    return (n + slow + mid + fast + kickW + snareW) * amp * cy * 0.55;
  }

  let lastBeatT = -10;

  function draw() {
    const { off, octx: oc } = getOff();
    oc.clearRect(0, 0, W, H);

    // ── Beat envelopes 128 BPM
    const beatPhase  = (t / BEAT) % 1;
    const snarePhase = (t / BEAT * 0.5 + 0.5) % 1;
    const kickTarget  = Math.exp(-beatPhase  * 8) * 0.9;
    const snareTarget = Math.exp(-snarePhase * 10) * 0.45;
    envKick  += (kickTarget  > envKick  ? 0.55 : 0.06) * (kickTarget  - envKick);
    envSnare += (snareTarget > envSnare ? 0.40 : 0.05) * (snareTarget - envSnare);
    envBreath += (0.78 + 0.22 * Math.sin(t * 0.022) - envBreath) * 0.03;
    const amp = envBreath + envKick * 0.28 + envSnare * 0.10 + (window._previewBoost || 0) * 0.55;
    const cy = H * 0.65;

    // ── Glow doux en dessous (back layer)
    const glowGrad = oc.createLinearGradient(0, cy - 30, 0, H);
    glowGrad.addColorStop(0,   'rgba(255, 90, 0, 0)');
    glowGrad.addColorStop(0.4, `rgba(255, 110, 30, ${0.06 + envKick * 0.04})`);
    glowGrad.addColorStop(1,   'rgba(255, 90, 0, 0)');
    oc.fillStyle = glowGrad;
    oc.fillRect(0, cy - 60, W, 120);

    // ── Trace la ligne d'oscilloscope principale
    oc.beginPath();
    const step = 2; // skip-pixel pour performance, ligne lisse
    let firstY = 0;
    for (let x = 0; x <= W; x += step) {
      const h = waveH(x, cy, amp);
      const y = cy - h;
      if (x === 0) { oc.moveTo(x, y); firstY = y; }
      else oc.lineTo(x, y);
    }
    // Stroke avec gradient horizontal (fade aux bords)
    const lineGrad = oc.createLinearGradient(0, 0, W, 0);
    lineGrad.addColorStop(0,    'rgba(255, 90, 0, 0)');
    lineGrad.addColorStop(0.12, 'rgba(255, 130, 40, 0.85)');
    lineGrad.addColorStop(0.5,  'rgba(255, 180, 80, 1)');
    lineGrad.addColorStop(0.88, 'rgba(255, 130, 40, 0.85)');
    lineGrad.addColorStop(1,    'rgba(255, 90, 0, 0)');
    oc.strokeStyle = lineGrad;
    oc.lineWidth = 1.8 + envKick * 0.8;
    oc.lineCap = 'round';
    oc.lineJoin = 'round';
    oc.shadowColor = 'rgba(255, 120, 30, 0.55)';
    oc.shadowBlur = 12;
    oc.stroke();
    oc.shadowBlur = 0;

    // ── Seconde ligne miroir doux (back)
    oc.beginPath();
    for (let x = 0; x <= W; x += step) {
      const h = waveH(x, cy, amp) * 0.55;
      const y = cy + h * 0.3 + 4; // léger offset sous la ligne principale
      if (x === 0) oc.moveTo(x, y);
      else oc.lineTo(x, y);
    }
    oc.strokeStyle = 'rgba(255, 100, 30, 0.18)';
    oc.lineWidth = 1;
    oc.stroke();

    // ── Spawn particules sur kicks (peaks)
    if (envKick > 0.5 && t - lastBeatT > BEAT * 0.6) {
      lastBeatT = t;
      // Spawn 3-5 particules réparties sur les peaks visibles
      const spawns = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < spawns; i++) {
        const x = Math.random() * W;
        const h = waveH(Math.floor(x), cy, amp);
        spawnParticle(x, cy - h - 2);
      }
    }

    // ── Update + draw particules
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      oc.fillStyle = `rgba(255, 170, 80, ${p.life * 0.85})`;
      oc.shadowColor = 'rgba(255, 120, 40, 0.6)';
      oc.shadowBlur = 6;
      oc.beginPath();
      oc.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      oc.fill();
    }
    oc.shadowBlur = 0;

    // ── Fade horizontal aux bords (au cas où ligne déborde)
    oc.globalCompositeOperation = 'destination-in';
    const fade = oc.createLinearGradient(0, 0, W, 0);
    fade.addColorStop(0,    'rgba(0,0,0,0)');
    fade.addColorStop(0.06, 'rgba(0,0,0,1)');
    fade.addColorStop(0.94, 'rgba(0,0,0,1)');
    fade.addColorStop(1,    'rgba(0,0,0,0)');
    oc.fillStyle = fade;
    oc.fillRect(0, 0, W, H);
    oc.globalCompositeOperation = 'source-over';

    ctx.clearRect(0, 0, W, H);
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
  gsap.set('.hero-status',      { visibility: 'visible', opacity: 0, x: -20 });
  gsap.set('.hero-next-card',   { visibility: 'visible', opacity: 0, y: -16 });
  gsap.set('.hero-social-card', { visibility: 'visible', opacity: 0, y: -12 });
  if (heroContent) heroContent.classList.remove('hero-loading');

  const tl = gsap.timeline();

  // Séquence chorégraphiée : le NAME explose d'abord (héro), puis les cards
  // arrivent une par une pour laisser le foyer principal au nom géant.
  tl
    .to('.hero-status',     { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }, 0.2)
    .to('.hero-tagline',    { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, 0.45)
    .to('.hero-name',       { opacity: 1, y: 0, duration: 1.0, ease: 'power4.out' }, 0.55)
    .to('.hero-bottom',     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'opacity,y' }, 0.95)
    // Cards latérales : arrivent APRÈS le nom, en cascade
    .to('.hero-next-card',  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 1.4)
    .to('.hero-social-card',{ opacity: 1, y: 0, duration: 0.6, stagger: 0.14, ease: 'power3.out',
        onStart: () => document.querySelectorAll('.hero-social-card').forEach(c => c.classList.add('is-in'))
      }, 1.75);

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

// ── Spawn vinyl confetti (utilisé par le mixer form au succès) ──
function spawnVinylConfetti(originEl) {
  const rect = originEl ? originEl.getBoundingClientRect() : null;
  const x0 = rect ? rect.left + rect.width / 2  : window.innerWidth / 2;
  const y0 = rect ? rect.top  + rect.height / 2 : window.innerHeight / 2;
  let layer = document.querySelector('.vinyl-confetti-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'vinyl-confetti-layer';
    document.body.appendChild(layer);
  }
  const N = 22;
  for (let i = 0; i < N; i++) {
    const v = document.createElement('div');
    v.className = 'vinyl-confetti';
    v.style.left = x0 + 'px';
    v.style.top  = y0 + 'px';
    const angle = (i / N) * Math.PI * 2;
    const force = 120 + Math.random() * 220;
    const vx = Math.cos(angle) * force + (Math.random() - 0.5) * 80;
    const vr = (Math.random() > 0.5 ? 1 : -1) * (540 + Math.random() * 720);
    v.style.setProperty('--vx', vx + 'px');
    v.style.setProperty('--vr', vr + 'deg');
    v.style.animationDelay = (Math.random() * 0.1) + 's';
    v.style.animationDuration = (1.4 + Math.random() * 0.6) + 's';
    layer.appendChild(v);
    setTimeout(() => v.remove(), 2200);
  }
}

// ── MIXER FORM — Booking console ──────────────────────────────
(function mixerForm() {
  const form = document.querySelector('.mixer-form');
  if (!form) return;

  // ── LEDs : s'allument quand le champ est rempli + validation inline email
  form.querySelectorAll('.mixer-channel').forEach(ch => {
    const field = ch.querySelector('input, textarea');
    if (!field) return;
    const isEmail = field.type === 'email';
    const refresh = () => {
      const v = field.value.trim();
      ch.classList.toggle('is-filled', !!v);
      if (isEmail) {
        // Validation simple, only when blurred or has @ to avoid premature red
        const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        const showError = v.length > 0 && !looksLikeEmail && field.dataset.blurred === '1';
        ch.classList.toggle('is-error', showError);
      }
    };
    field.addEventListener('input', refresh);
    field.addEventListener('change', refresh);
    if (isEmail) {
      field.addEventListener('blur', () => { field.dataset.blurred = '1'; refresh(); });
    }
    refresh();
  });

  // ── Rotary knob
  const knob       = document.getElementById('mixerKnob');
  const indicator  = knob?.querySelector('.knob-indicator');
  const positions  = document.getElementById('mixerKnobPositions');
  const hiddenSubj = document.getElementById('mixerKnobInput');
  if (knob && positions && hiddenSubj && indicator) {
    const items     = Array.from(positions.querySelectorAll('li'));
    const N         = items.length;
    const ANGLE_MIN = -135;
    const ANGLE_MAX =  135;
    const STEP      = (ANGLE_MAX - ANGLE_MIN) / (N - 1);
    let current = 0;

    function setIndex(i, fromUser) {
      current = Math.max(0, Math.min(N - 1, i));
      const angle = ANGLE_MIN + current * STEP;
      indicator.style.transform = `rotate(${angle}deg)`;
      items.forEach((li, idx) => li.classList.toggle('active', idx === current));
      hiddenSubj.value = items[current].dataset.value;
      knob.setAttribute('aria-valuenow', current);
      knob.setAttribute('aria-valuetext', items[current].textContent);
      // LED ON (le knob a toujours une valeur valide)
      knob.closest('.mixer-channel')?.classList.add('is-filled');
    }
    setIndex(0);

    // Click sur les positions textuelles
    items.forEach((li, idx) => {
      li.addEventListener('click', () => setIndex(idx, true));
    });

    // Drag sur le knob (souris)
    let dragging = false;
    let startAngle = 0;
    let startIndex = 0;
    function angleFromEvent(e) {
      const r = knob.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX || e.touches?.[0]?.clientX) - cx;
      const dy = (e.clientY || e.touches?.[0]?.clientY) - cy;
      return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    knob.addEventListener('pointerdown', (e) => {
      dragging = true;
      startAngle = angleFromEvent(e);
      startIndex = current;
      knob.setPointerCapture?.(e.pointerId);
    });
    knob.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const a = angleFromEvent(e);
      let delta = a - startAngle;
      // Wrap
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      const steps = Math.round(delta / STEP);
      setIndex(startIndex + steps, true);
    });
    const stop = () => { dragging = false; };
    knob.addEventListener('pointerup', stop);
    knob.addEventListener('pointercancel', stop);

    // Wheel sur le knob
    knob.addEventListener('wheel', (e) => {
      e.preventDefault();
      setIndex(current + (e.deltaY > 0 ? 1 : -1), true);
    }, { passive: false });

    // Clavier
    knob.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { e.preventDefault(); setIndex(current + 1, true); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { e.preventDefault(); setIndex(current - 1, true); }
    });
  }

  // ── VU meter sur le textarea
  const msg = form.querySelector('textarea[name="message"]');
  const vu  = form.querySelector('.mixer-vu');
  const charCount = document.getElementById('msgCharCount');
  if (msg && vu && charCount) {
    const bars = vu.querySelectorAll('i');
    const MAX = 600;
    msg.addEventListener('input', () => {
      const len = msg.value.length;
      charCount.textContent = len;
      const parent = charCount.parentNode;
      parent.classList.toggle('warn', len > MAX * 0.8 && len <= MAX);
      parent.classList.toggle('over', len > MAX);
      // VU bars : remplit proportionnellement au remplissage
      const ratio = Math.min(1, len / MAX);
      const active = Math.floor(ratio * bars.length);
      bars.forEach((b, i) => {
        b.classList.toggle('on', i < active);
        b.classList.toggle('peak', i === active - 1 && active >= bars.length - 2);
      });
    });
  }

  // ── Submit
  const pad = form.querySelector('.mixer-pad');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const note = document.getElementById('formNote');
    pad.classList.add('is-pressed');
    setTimeout(() => pad.classList.remove('is-pressed'), 250);
    pad.disabled = true;
    form.classList.add('is-sending');
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(this)).toString()
    })
    .then(r => {
      note.textContent = r.ok
        ? '◉ MESSAGE ENVOYÉ — Réponse sous 48h.'
        : '⚠ ERREUR — Contacte sur Instagram.';
      if (r.ok) {
        this.reset();
        // Reset des LEDs
        form.querySelectorAll('.mixer-channel').forEach(ch => {
          if (!ch.classList.contains('mixer-channel--knob')) ch.classList.remove('is-filled');
        });
        // 🎉 Confetti vinyles depuis le pad
        spawnVinylConfetti(pad);
      }
      setTimeout(() => { note.textContent = ''; }, 6000);
    })
    .catch(() => { note.textContent = '⚠ ERREUR RÉSEAU.'; })
    .finally(() => {
      pad.disabled = false;
      form.classList.remove('is-sending');
    });
  });
})();

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

  // Données statiques — visibles immédiatement, remplacées par l'API si dispo.
  // Reflètent les releases réelles de Loadjaxx (alignées sur Spotify/Deezer)
  const SPOTIFY_LINK = 'https://open.spotify.com/intl-fr/artist/3YE19U8tfVU4D0TI4IeilQ';
  const staticReleases = [
    { name: "Right there, I'm going (Loadjaxx Remix)", year: '2025', type: 'remix',    url: SPOTIFY_LINK, img: null },
    { name: "House + Tequila",  year: '2024', type: 'original', url: SPOTIFY_LINK, img: null },
    { name: "Flawless",         year: '2025', type: 'original', url: SPOTIFY_LINK, img: null },
    { name: "Free My Mind",     year: '2025', type: 'original', url: SPOTIFY_LINK, img: null },
    { name: "Friendly",         year: '2025', type: 'original', url: SPOTIFY_LINK, img: null },
    { name: "Gold Face",        year: '2023', type: 'original', url: SPOTIFY_LINK, img: null },
    { name: "Big Daddy",        year: '2024', type: 'original', url: 'https://open.spotify.com/intl-fr/album/2hmJUUxgmqyy83YmWruZic', img: null },
    { name: "SHAKE YOUR PHONE", year: '2025', type: 'original', url: 'https://open.spotify.com/intl-fr/album/53iZifipoKv1DJjTqCEe6H', img: null },
    { name: "My Bubble",        year: '2024', type: 'original', url: SPOTIFY_LINK, img: null },
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
      const hit = findInMap(card.dataset.track || '', dz);
      if (!hit) return;
      // Préview audio
      if (!card.dataset.preview && hit.preview) card.dataset.preview = hit.preview;
      // Cover image : remplace le gradient bg par une vraie image Deezer
      if (hit.cover && !card.querySelector('.release-img')) {
        const cover = card.querySelector('.release-cover');
        const bg = cover?.querySelector('.release-cover-bg');
        if (cover && bg) {
          const img = document.createElement('img');
          img.src = hit.cover;
          img.alt = card.dataset.track || '';
          img.loading = 'lazy';
          img.className = 'release-img';
          // Insère l'img à la place du gradient (qui reste comme fallback derrière)
          bg.replaceWith(img);
        }
      }
    });
  });

  // ── Cache localStorage : évite de hammer l'API Spotify à chaque reload
  //    et préserve les miniatures même quand on hit le rate-limit
  const CACHE_KEY = 'loadjaxx_spotify_v3';
  const CACHE_TTL = 60 * 60 * 1000; // 60 minutes

  function readCache(allowExpired) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data?.items?.length) return null;
      const fresh = Date.now() - data.ts < CACHE_TTL;
      return (fresh || allowExpired) ? data : null;
    } catch (e) { return null; }
  }
  function writeCache(items) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items })); } catch (e) {}
  }

  let items;
  // 1. Cache frais → on l'utilise direct, pas d'appel API
  const cached = readCache(false);
  if (cached) {
    items = cached.items;
  }

  try {
    if (!items) {
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
      const data = await albumsRes.json();
      items = data?.items;
      if (items?.length) writeCache(items);
    }
    if (!items?.length) {
      // Fallback ultime : cache expiré si dispo, sinon laisse les static
      const stale = readCache(true);
      if (stale?.items?.length) items = stale.items;
      else return;
    }

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
    console.warn('[Spotify] API failed (rate-limit ?), using cache fallback :', err.message);
    // Fallback ultime : tente le cache expiré
    const stale = readCache(true);
    if (stale?.items?.length) {
      try {
        const dz = await deezerPromise;
        const releases = stale.items.slice(0, 9).map(item => {
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
            url:     item.external_urls.spotify,
            img:     item.images?.[0]?.url ?? dzHit?.cover ?? null,
            preview: item.preview_url ?? dzHit?.preview ?? null
          };
        });
        injectCards(releases);
      } catch (e2) {}
    }
  }
})();

// ── Sticky Booking CTA ──────────────────────────────────────
(function stickyBooking() {
  const cta = document.getElementById('stickyBooking');
  if (!cta) return;
  const contactSec = document.getElementById('contact');
  let visible = false;
  function update() {
    const y = window.scrollY;
    const triggerY = window.innerHeight * 1.8; // après ~1.8 viewport scroll
    let inContact = false;
    if (contactSec) {
      const r = contactSec.getBoundingClientRect();
      inContact = r.top < window.innerHeight * 0.6;
    }
    const shouldShow = y > triggerY && !inContact;
    if (shouldShow !== visible) {
      cta.classList.toggle('visible', shouldShow);
      visible = shouldShow;
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  if (!isTouch) {
    const cur = document.querySelector('.g-cursor');
    if (cur) {
      cta.addEventListener('mouseenter', () => cur.classList.add('hover'));
      cta.addEventListener('mouseleave', () => cur.classList.remove('hover'));
    }
  }
})();

// ── Tour map Leaflet (vraie carte) ────────────────────────────
(function tourMapLeaflet() {
  const mapEl   = document.getElementById('leafletMap');
  const countEl = document.getElementById('mapCount');
  const popup   = document.getElementById('mapPopup');
  if (!mapEl || typeof L === 'undefined') return;

  // Coordonnées GPS réelles
  const CITY_COORDS = {
    'paris':       { lat: 48.8566, lng: 2.3522,  label: 'Paris'      },
    'lyon':        { lat: 45.7640, lng: 4.8357,  label: 'Lyon'       },
    'bordeaux':    { lat: 44.8378, lng: -0.5792, label: 'Bordeaux'   },
    'montpellier': { lat: 43.6108, lng: 3.8767,  label: 'Montpellier'},
    'marseille':   { lat: 43.2965, lng: 5.3698,  label: 'Marseille'  },
    'lille':       { lat: 50.6292, lng: 3.0573,  label: 'Lille'      },
    'strasbourg':  { lat: 48.5734, lng: 7.7521,  label: 'Strasbourg' },
    'toulouse':    { lat: 43.6047, lng: 1.4442,  label: 'Toulouse'   },
    'nantes':      { lat: 47.2184, lng: -1.5536, label: 'Nantes'     },
    'rennes':      { lat: 48.1173, lng: -1.6778, label: 'Rennes'     },
    'nice':        { lat: 43.7102, lng: 7.2620,  label: 'Nice'       },
  };

  function normalize(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '');
  }

  // Init Leaflet centré sur la France
  const map = L.map(mapEl, {
    zoomControl: false,        // ajouté manuellement pour le placer bottom-right
    attributionControl: false,
    scrollWheelZoom: false,    // off : pas de dézoom au scroll page
    dragging: true,
    doubleClickZoom: false,    // off pour rester cohérent (zoom uniquement +/-)
    boxZoom: false,
    keyboard: false,
    tap: true,
    touchZoom: true,           // garde le pinch-zoom mobile
  }).setView([46.6, 2.8], 5.5);

  // Boutons de zoom positionnés en bas à droite
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Tuiles CartoDB Dark Matter (fond sombre, CSS filter va ajouter le orange)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 12,
    minZoom: 4,
  }).addTo(map);

  function buildMarkers() {
    const showItems = Array.from(document.querySelectorAll('.show-item[data-date]'));
    if (!showItems.length) return;

    const shows = showItems.map(el => {
      const cityText = (el.querySelector('.show-city')?.textContent || '').trim();
      const cityKey  = normalize(cityText.split(',')[0]);
      const venue    = (el.querySelector('.show-venue')?.childNodes[0]?.textContent || '').trim();
      const date     = el.dataset.date;
      const isPast   = el.classList.contains('show-item--past') || new Date(date).getTime() < Date.now();
      return { cityKey, cityText: cityText.split(',')[0].trim(), venue, date, isPast, el };
    });

    // Dédoublonne, préfère upcoming
    const uniqueByCity = new Map();
    shows.forEach(s => {
      const existing = uniqueByCity.get(s.cityKey);
      if (!existing) { uniqueByCity.set(s.cityKey, s); return; }
      if (existing.isPast && !s.isPast) uniqueByCity.set(s.cityKey, s);
    });
    const unique = Array.from(uniqueByCity.values())
      .filter(s => CITY_COORDS[s.cityKey])
      .map(s => ({ ...s, ...CITY_COORDS[s.cityKey] }));

    const upcoming = unique
      .filter(s => !s.isPast)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Markers customs avec divIcon
    unique.forEach(s => {
      const showLabel = s.label;
      const html = `
        <div class="tour-marker ${s.isPast ? 'past' : 'upcoming'}">
          <div class="tour-marker-dot"></div>
          <div class="tour-marker-label">${showLabel}</div>
        </div>`;
      const icon = L.divIcon({
        className: 'tour-marker-icon',
        html,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const marker = L.marker([s.lat, s.lng], { icon, riseOnHover: true }).addTo(map);
      marker.on('mouseover', () => showPopup(s));
      marker.on('mouseout',  hidePopup);
      marker.on('click', () => {
        if (s.el) s.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    // Route polyline entre upcoming dans l'ordre chrono
    if (upcoming.length >= 2) {
      const latLngs = upcoming.map(s => [s.lat, s.lng]);
      const route = L.polyline(latLngs, {
        color: '#FF5A00',
        weight: 2,
        opacity: 0.85,
        dashArray: '6 8',
        className: 'tour-route-path',
        smoothFactor: 1.5,
      }).addTo(map);
    }

    if (countEl) countEl.textContent = upcoming.length || unique.length;

    // Auto-fit aux markers avec un peu de padding
    if (unique.length > 0) {
      const group = L.featureGroup(unique.map(s => L.marker([s.lat, s.lng])));
      map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 6.5 });
    }
  }

  function showPopup(s) {
    if (!popup) return;
    popup.querySelector('.shows-map-popup-city').textContent = s.label;
    const d = new Date(s.date);
    const monFR = ['Jan','Fév','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'][d.getMonth()];
    popup.querySelector('.shows-map-popup-date').textContent =
      `${String(d.getDate()).padStart(2,'0')} ${monFR} ${d.getFullYear()}`;
    popup.querySelector('.shows-map-popup-venue').textContent = s.venue || '—';
    popup.classList.add('visible');
  }
  function hidePopup() {
    popup?.classList.remove('visible');
  }

  // Délai pour laisser les show-items se réorganiser par date au load
  setTimeout(buildMarkers, 300);
  // Force resize au cas où la map est dans un container hidden au load
  setTimeout(() => map.invalidateSize(), 500);
})();

// ── Quote typewriter au scroll (About) ────────────────────────
(function quoteTypewriter() {
  const quote = document.querySelector('.about-quote');
  if (!quote) return;
  const fullText = quote.textContent.trim();
  quote.textContent = '';
  let done = false;
  function run() {
    if (done) return;
    done = true;
    quote.classList.add('typewriting');
    let i = 0;
    const interval = setInterval(() => {
      quote.textContent = fullText.slice(0, ++i);
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => quote.classList.remove('typewriting'), 1500);
      }
    }, 55);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.5 });
    io.observe(quote);
  } else {
    setTimeout(run, 1500);
  }
})();

// ── Filtres releases (Original / Remix / Feat) ────────────────
(function releaseFilters() {
  const btns = document.querySelectorAll('.releases-filter');
  const grid = document.getElementById('releasesGrid');
  if (!btns.length || !grid) return;

  function getType(card) {
    // Le type est dans .release-sub[data-type] OU dérivé du texte de la sub
    const subWithType = card.querySelector('[data-type]');
    if (subWithType) return subWithType.dataset.type;
    const subText = (card.querySelector('.release-sub')?.textContent
                  || card.querySelector('.release-feat-sub')?.textContent
                  || '').toLowerCase();
    if (subText.includes('remix')) return 'remix';
    if (subText.includes('feat') || subText.includes('ft.')) return 'feat';
    return 'original';
  }

  function recountAll() {
    const cards = Array.from(grid.querySelectorAll('.release-card'));
    const counts = { all: cards.length, original: 0, remix: 0, feat: 0 };
    cards.forEach(c => {
      const t = getType(c);
      if (counts[t] !== undefined) counts[t]++;
    });
    document.querySelectorAll('.releases-filter-count').forEach(el => {
      el.textContent = counts[el.dataset.count] ?? 0;
    });
  }

  function applyFilter(filter) {
    const cards = Array.from(grid.querySelectorAll('.release-card'));
    cards.forEach(c => {
      const t = getType(c);
      c.classList.toggle('is-filtered-out', filter !== 'all' && t !== filter);
    });
  }

  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.toggle('active', x === b));
    applyFilter(b.dataset.filter);
  }));

  recountAll();
  // Recompte après que Spotify ait injecté ses cards (1-3s plus tard)
  setTimeout(recountAll, 1500);
  setTimeout(recountAll, 3500);

  if (!isTouch) {
    const cur = document.querySelector('.g-cursor');
    if (cur) {
      btns.forEach(b => {
        b.addEventListener('mouseenter', () => cur.classList.add('hover'));
        b.addEventListener('mouseleave', () => cur.classList.remove('hover'));
      });
    }
  }
})();

// ── Alignement câbles ↔ jacks de la console ───────────────────
(function cablesAlignment() {
  const contactSvg = document.querySelector('.contact-cables');
  const jacks      = document.querySelectorAll('.mixer-jack');
  if (!contactSvg || !jacks.length) return;

  const VB_W = 1200, VB_H = 600;

  // Paths source : chaque cable a 2 path enfants (sheath + signal)
  // dont on extrait le point de départ et la courbe, et on met à jour le point d'arrivée
  const cables = Array.from(contactSvg.querySelectorAll('g.contact-cable'));
  const plugs  = contactSvg.querySelector('.contact-cable-plugs');

  // Points de départ fixes en haut du SVG (les câbles arrivent depuis ces points)
  const START_POINTS = [
    { x: 80,   y: -20, ctrl: { x1: 80,   y1: 180 } },
    { x: 400,  y: -20, ctrl: { x1: 400,  y1: 80  } },
    { x: 1100, y: -20, ctrl: { x1: 1100, y1: 150 } },
    { x: 1220, y: 60,  ctrl: { x1: 1100, y1: 280 } },
  ];

  function align() {
    // Rectangle du SVG en coords écran
    const svgRect = contactSvg.getBoundingClientRect();
    if (svgRect.width === 0) return;

    // Position de chaque jack en coords viewBox
    const targets = Array.from(jacks).map(j => {
      const r = j.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      return {
        x: (cx - svgRect.left) / svgRect.width  * VB_W,
        y: (cy - svgRect.top)  / svgRect.height * VB_H,
      };
    });

    // Update path de chaque cable + plug correspondant
    cables.forEach((g, i) => {
      const start = START_POINTS[i];
      const end   = targets[i];
      if (!start || !end) return;

      // Point de contrôle 2 : juste au-dessus de la cible pour une approche verticale propre
      const ctrl2x = end.x;
      const ctrl2y = end.y - 220;
      const d = `M ${start.x} ${start.y} C ${start.ctrl.x1} ${start.ctrl.y1}, ${ctrl2x.toFixed(1)} ${ctrl2y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

      const paths = g.querySelectorAll('path');
      paths.forEach(p => p.setAttribute('d', d));
    });

    // Update positions des plugs (4 jacks 3.5mm en bas des cables)
    if (plugs) {
      const allSleeves = plugs.querySelectorAll('.plug-sleeve');
      const allBases   = plugs.querySelectorAll('.plug-base');
      const allTips    = plugs.querySelectorAll('.plug-tip');
      targets.forEach((t, i) => {
        if (allSleeves[i]) {
          allSleeves[i].setAttribute('x', (t.x - 10).toFixed(1));
          allSleeves[i].setAttribute('y', (t.y - 15).toFixed(1));
        }
        if (allBases[i]) {
          allBases[i].setAttribute('cx', t.x.toFixed(1));
          allBases[i].setAttribute('cy', t.y.toFixed(1));
        }
        if (allTips[i]) {
          allTips[i].setAttribute('cx', t.x.toFixed(1));
          allTips[i].setAttribute('cy', t.y.toFixed(1));
        }
      });
    }
  }

  // Mise à jour BG cables : hauteur SVG = hauteur document
  const bgSvg = document.getElementById('bgCablesSvg');
  function updateBgHeight() {
    if (!bgSvg) return;
    const h = document.documentElement.scrollHeight;
    bgSvg.style.height = h + 'px';
  }

  // Init + résize + après que les sections aient leur hauteur définitive
  align();
  updateBgHeight();
  window.addEventListener('resize', () => { align(); updateBgHeight(); });
  window.addEventListener('load',   () => { align(); updateBgHeight(); });
  // Re-align après le loader + animation d'entrée + dynamic content (Spotify)
  setTimeout(() => { align(); updateBgHeight(); }, 1500);
  setTimeout(() => { align(); updateBgHeight(); }, 3500);
  setTimeout(() => { align(); updateBgHeight(); }, 6000);
})();

// ── Ripple au click sur les social links ──────────────────────
document.querySelectorAll('.hero-social-link').forEach(link => {
  link.addEventListener('click', () => {
    link.classList.remove('is-clicked');
    // Force reflow pour réarmer l'animation
    void link.offsetWidth;
    link.classList.add('is-clicked');
    setTimeout(() => link.classList.remove('is-clicked'), 700);
  });
});

// ═══════════════════════════════════════════════════════════════
// ── CUEPOINTS SCROLL ─ Navigation typographique éditoriale ────
// ═══════════════════════════════════════════════════════════════
(function cuepointsScroll() {
  const cue = document.getElementById('cuepoints');
  if (!cue) return;
  const railFill   = document.getElementById('cueRailFill');
  const numsEl     = document.getElementById('cueMarkers');
  const curNameEl  = cue.querySelector('.cue-current-name');

  const SECTIONS = [
    { id: 'hero',     label: 'Accueil'  },
    { id: 'about',    label: 'À propos' },
    { id: 'releases', label: 'Releases' },
    { id: 'shows',    label: 'Shows'    },
    { id: 'epk',      label: 'EPK'      },
    { id: 'contact',  label: 'Contact'  },
  ];

  // Sélecteurs des zones à fond sombre — le cuepoints passe en blanc dessus
  const DARK_SELECTORS = ['#hero', '.epk-banner', 'footer'];

  let items = [];
  let darkZones = [];
  let lastActive = -1;
  let lastDark   = null;

  function build() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    numsEl.innerHTML = '';
    items = [];
    SECTIONS.forEach((sec, i) => {
      const el = document.getElementById(sec.id);
      if (!el) return;
      const top = el.offsetTop;
      const pct = Math.max(0, Math.min(100, (top / docH) * 100));
      const li = document.createElement('li');
      li.className = 'cue-num';
      li.dataset.target = sec.id;
      li.innerHTML = `<span class="cue-num-name">${sec.label}</span><span class="cue-num-digit">${String(i + 1).padStart(2, '0')}</span>`;
      li.addEventListener('click', () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      numsEl.appendChild(li);
      items.push({ el: li, sec, pct });
    });
    // Mesure les zones sombres (top + bottom en coords document)
    darkZones = DARK_SELECTORS
      .map(sel => document.querySelector(sel))
      .filter(Boolean)
      .map(el => {
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        return { top, bottom: top + el.offsetHeight };
      });
  }
  build();
  window.addEventListener('resize', build);
  window.addEventListener('load', build);

  let raf = null;
  function update() {
    raf = null;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    const pct = docH > 0 ? Math.max(0, Math.min(1, y / docH)) : 0;
    railFill.style.height = (pct * 100) + '%';

    // Section active = celle dont le top a déjà été dépassé (avec marge)
    let bestIdx = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].pct / 100 <= pct + 0.05) bestIdx = i;
    }
    if (bestIdx !== lastActive) {
      items.forEach((it, i) => it.el.classList.toggle('active', i === bestIdx));
      const sec = items[bestIdx]?.sec;
      if (sec && curNameEl) curNameEl.textContent = sec.label;
      lastActive = bestIdx;
    }

    // Détection fond sombre : le centre vertical du cuepoints (≈ milieu viewport)
    // est-il dans une zone sombre ?
    const centerY = y + window.innerHeight / 2;
    const isDark = darkZones.some(z => centerY >= z.top && centerY <= z.bottom);
    if (isDark !== lastDark) {
      cue.classList.toggle('on-dark', isDark);
      lastDark = isDark;
    }
  }
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  setTimeout(() => cue.classList.add('visible'), 2400);

  // ── Toggle replié / déployé (persiste en localStorage)
  const toggle = document.getElementById('cueToggle');
  if (toggle) {
    const KEY = 'loadjaxx_cue_collapsed';
    const setCollapsed = (on) => {
      cue.classList.toggle('collapsed', on);
      toggle.setAttribute('aria-expanded', on ? 'false' : 'true');
      toggle.setAttribute('aria-label', on ? 'Déployer la navigation' : 'Replier la navigation');
      try { localStorage.setItem(KEY, on ? '1' : '0'); } catch(e) {}
    };
    // Restaure état précédent
    if (localStorage.getItem(KEY) === '1') setCollapsed(true);
    toggle.addEventListener('click', () => setCollapsed(!cue.classList.contains('collapsed')));
  }

  if (!isTouch) {
    const cur = document.querySelector('.g-cursor');
    if (cur) {
      cue.addEventListener('mouseover', (e) => {
        if (e.target.closest('.cue-num, .cue-toggle')) cur.classList.add('hover');
      });
      cue.addEventListener('mouseout', (e) => {
        if (e.target.closest('.cue-num, .cue-toggle')) cur.classList.remove('hover');
      });
    }
  }
})();

// ═══════════════════════════════════════════════════════════════
// ── TRACK PREVIEW ─ 30s Spotify preview au hover ──
// ═══════════════════════════════════════════════════════════════
(function trackPreview() {
  const grid = document.getElementById('releasesGrid');
  const toast = document.getElementById('miniPlayer');
  if (!grid || !toast) return;

  const toastText = document.getElementById('miniPlayerTrack');
  const miniPlayerLink = document.getElementById('miniPlayerLink');
  const miniPlayerProgress = document.getElementById('miniPlayerProgress');
  const miniPlayerCanvas = document.getElementById('miniPlayerCanvas');
  const miniCtx = miniPlayerCanvas?.getContext('2d');
  let miniWaveRaf = null;
  let miniWaveData = null;
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
    if (!audio) return;
    const dur = audio.duration || 30;
    const pct = Math.min(1, audio.currentTime / dur);
    if (ringCircle) {
      const r = parseFloat(ringCircle.getAttribute('r'));
      const circ = 2 * Math.PI * r;
      ringCircle.style.strokeDashoffset = circ * (1 - pct);
    }
    if (miniPlayerProgress) miniPlayerProgress.style.width = (pct * 100) + '%';
    ringRaf = requestAnimationFrame(pumpRing);
  }

  function drawMiniWave() {
    if (!miniCtx || !analyser) { miniWaveRaf = requestAnimationFrame(drawMiniWave); return; }
    const W = miniPlayerCanvas.width;
    const H = miniPlayerCanvas.height;
    if (!miniWaveData || miniWaveData.length !== analyser.frequencyBinCount) {
      miniWaveData = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(miniWaveData);
    miniCtx.clearRect(0, 0, W, H);
    const bars = 48;
    const step = Math.floor(miniWaveData.length / bars);
    const barW = (W / bars) - 1;
    for (let i = 0; i < bars; i++) {
      const v = miniWaveData[i * step] / 255;
      const h = Math.max(2, v * H * 0.95);
      const x = i * (W / bars);
      const y = (H - h) / 2;
      const grad = miniCtx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0,   'rgba(255, 200, 100, 0.95)');
      grad.addColorStop(0.5, 'rgba(255, 140, 60, 0.95)');
      grad.addColorStop(1,   'rgba(255, 90, 0, 0.6)');
      miniCtx.fillStyle = grad;
      miniCtx.fillRect(x, y, barW, h);
    }
    miniWaveRaf = requestAnimationFrame(drawMiniWave);
  }

  function showToast(name, card) {
    toastText.textContent = name;
    if (miniPlayerLink && card?.href) miniPlayerLink.href = card.href;
    toast.classList.add('visible');
    toast.setAttribute('aria-hidden', 'false');
    if (miniWaveRaf) cancelAnimationFrame(miniWaveRaf);
    drawMiniWave();
  }
  function hideToast() {
    toast.classList.remove('visible');
    toast.setAttribute('aria-hidden', 'true');
    if (miniWaveRaf) cancelAnimationFrame(miniWaveRaf);
    miniWaveRaf = null;
    if (miniCtx) miniCtx.clearRect(0, 0, miniPlayerCanvas.width, miniPlayerCanvas.height);
    if (miniPlayerProgress) miniPlayerProgress.style.width = '0%';
  }

  const TARGET_VOL = 0.55;
  function fadeAudio(toVol, ms) {
    return new Promise(resolve => {
      if (!audio) return resolve();
      const startVol = audio.volume;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / ms);
        audio.volume = startVol + (toVol - startVol) * t;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  async function startPreview(card) {
    const url = card.dataset.preview;
    const name = card.dataset.track || 'Track';
    if (!url) return;

    // Si on est déjà en train de jouer une autre piste → crossfade smooth
    const isCrossfade = audio && !audio.paused && currentCard && currentCard !== card;
    if (isCrossfade) {
      // Fade out l'actuel sans tout couper proprement
      const oldCard = currentCard;
      const oldRingSvg = ringSvg;
      fadeAudio(0, 180).then(() => {
        try { audio.pause(); } catch(e){}
        // Nettoie l'ancienne card visuel
        if (oldCard) oldCard.classList.remove('is-previewing');
        if (oldRingSvg && oldRingSvg.parentNode) oldRingSvg.parentNode.removeChild(oldRingSvg);
      });
      // On poursuit immédiatement avec la nouvelle piste sans attendre le fade-out
    } else {
      stopPreview();
    }

    currentCard = card;
    card.classList.add('is-previewing');
    grid.classList.add('previewing');
    showToast(name, card);
    buildRing(card);

    ensureAudio();
    audio.volume = isCrossfade ? 0 : TARGET_VOL;
    audio.src = url;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        ensureCtx();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
        if (isCrossfade) fadeAudio(TARGET_VOL, 280);
        rmsRaf = requestAnimationFrame(pumpRms);
        ringRaf = requestAnimationFrame(pumpRing);
      }).catch(() => {
        rmsRaf = requestAnimationFrame(pumpRms);
        ringRaf = requestAnimationFrame(pumpRing);
      });
    }
  }

  window._stopTrackPreview = () => stopPreview();
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

// ═══════════════════════════════════════════════════════════════
// ── CRATE MODE ─ Easter egg : K → pile de vinyles 3D ──
// ═══════════════════════════════════════════════════════════════
(function crateMode() {
  const overlay     = document.getElementById('crateOverlay');
  const counterEl   = document.getElementById('crateCounter');
  const trackNameEl = document.getElementById('crateCurrentTrack');
  const inviteEl    = document.getElementById('crateInvite');
  const inviteClose = inviteEl?.querySelector('.crate-invite-close');
  if (!overlay) return;

  let active = false;
  let cards  = [];
  let idx    = 0;
  let savedScroll = 0;
  let usedOnce = localStorage.getItem('loadjaxx_crate_seen') === '1';

  function getCards() {
    return Array.from(document.querySelectorAll('#releasesGrid .release-card'));
  }

  function layout() {
    cards.forEach((c, i) => {
      const offset = i - idx;
      const abs = Math.abs(offset);
      const x  = offset * 80;
      const z  = -abs * 140;
      const ry = offset * -18;
      const op = abs > 4 ? 0 : Math.max(0.1, 1 - abs * 0.18);
      c.style.setProperty('--crate-x',  x + 'px');
      c.style.setProperty('--crate-z',  z + 'px');
      c.style.setProperty('--crate-ry', ry + 'deg');
      c.style.setProperty('--crate-op', op);
      c.style.zIndex = String(100 - abs);
      c.classList.toggle('crate-current', i === idx);
    });
    if (counterEl) counterEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    const current = cards[idx];
    if (current && trackNameEl) {
      const name = current.dataset.track
        || current.querySelector('.release-title, .release-feat-title')?.textContent
        || '—';
      trackNameEl.textContent = name;
    }
  }

  function hideInvite() {
    if (!inviteEl) return;
    inviteEl.classList.remove('visible');
    usedOnce = true;
    try { localStorage.setItem('loadjaxx_crate_seen', '1'); } catch(e) {}
  }

  function enter() {
    if (active) return;
    cards = getCards();
    if (!cards.length) return;
    // Stop toute preview audio en cours (crate mode prend la main)
    if (typeof window._stopTrackPreview === 'function') window._stopTrackPreview();
    active = true;
    savedScroll = window.scrollY;
    document.body.classList.add('crate-mode');
    overlay.setAttribute('aria-hidden', 'false');
    idx = 0;
    layout();
    hideInvite();
  }

  function exit() {
    if (!active) return;
    active = false;
    document.body.classList.remove('crate-mode');
    overlay.setAttribute('aria-hidden', 'true');
    cards.forEach(c => {
      c.style.removeProperty('--crate-x');
      c.style.removeProperty('--crate-z');
      c.style.removeProperty('--crate-ry');
      c.style.removeProperty('--crate-op');
      c.style.zIndex = '';
      c.classList.remove('crate-current');
    });
    // Restore scroll position — pas de 'instant' (non-standard sur Firefox/Safari)
    window.scrollTo(0, savedScroll);
  }

  function flip(dir) {
    if (!active) return;
    idx = (idx + dir + cards.length) % cards.length;
    layout();
  }

  // ── Keybinds globaux
  window.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if ((e.key === 'k' || e.key === 'K') && !active) { e.preventDefault(); enter(); return; }
    if (!active) return;
    if (e.key === 'Escape')                          { e.preventDefault(); exit(); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); flip(1); }
    else if (e.key === 'ArrowLeft'  || e.key === 'q' || e.key === 'Q') { e.preventDefault(); flip(-1); }
  });

  // ── Clic sur le fond overlay (uniquement) → sortir
  // NE PAS sortir si on clique sur les instructions ou le titre du morceau
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) exit();
  });

  // ── Clic sur une card : si pas la courante, flip vers elle au lieu d'ouvrir le lien
  document.addEventListener('click', (e) => {
    if (!active) return;
    const card = e.target.closest && e.target.closest('.release-card');
    if (!card || !cards.includes(card)) return;
    const cardIdx = cards.indexOf(card);
    if (cardIdx !== idx) {
      e.preventDefault();
      e.stopPropagation();
      idx = cardIdx;
      layout();
    }
  }, true);

  // ── Swipe mobile bonus
  let touchStartX = 0;
  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    if (!active) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) flip(dx < 0 ? 1 : -1);
  });

  // ── CTA INVITE — apparition après que le user a scrollé jusqu'aux releases
  if (inviteEl) {
    // Click direct sur le bouton → lance le crate mode
    inviteEl.addEventListener('click', (e) => {
      if (e.target === inviteClose) return;
      enter();
    });
    if (inviteClose) {
      inviteClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideInvite();
      });
    }

    // Cursor hover hook
    if (!isTouch) {
      const cur = document.querySelector('.g-cursor');
      if (cur) {
        inviteEl.addEventListener('mouseenter', () => cur.classList.add('hover'));
        inviteEl.addEventListener('mouseleave', () => cur.classList.remove('hover'));
      }
    }

    // Apparition : déclenche quand la section releases entre dans le viewport
    // — sauf si déjà utilisé / fermé dans une session précédente
    if (!usedOnce) {
      const releases = document.getElementById('releases');
      if (releases && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(en => {
            if (en.isIntersecting) {
              setTimeout(() => {
                if (!active && !usedOnce) inviteEl.classList.add('visible');
              }, 600);
              io.disconnect();
            }
          });
        }, { threshold: 0.25 });
        io.observe(releases);
      }
    }
  }
})();
