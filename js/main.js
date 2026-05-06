// ── NAVBAR ────────────────────────────────────────────────────
const navbar  = document.getElementById('navbar');
const burger  = document.querySelector('.nav-burger');
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

// ── HERO WAVEFORM (orange) ────────────────────────────────────
(function buildWave() {
  const wave = document.getElementById('heroWave');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('span');
    const min = 4  + Math.random() * 10;
    const max = 20 + Math.random() * 110;
    const dur = (0.5 + Math.random() * 1.2).toFixed(2);
    const del = (Math.random() * 1.0).toFixed(2);
    s.style.cssText = `--min:${min}px;--max:${max}px;--d:${dur}s;animation-delay:${del}s`;
    wave.appendChild(s);
  }
})();

// ── GSAP ──────────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ── CURSOR DESKTOP ────────────────────────────────────────────
const isTouch = window.matchMedia('(pointer: coarse)').matches;
if (!isTouch) {
  const cursor    = document.createElement('div');
  const cursorDot = document.createElement('div');
  cursor.style.cssText    = 'position:fixed;top:0;left:0;width:32px;height:32px;border:1.5px solid rgba(255,90,0,0.6);border-radius:50%;pointer-events:none;z-index:99999;opacity:0;transform:translate(-50%,-50%)';
  cursorDot.style.cssText = 'position:fixed;top:0;left:0;width:5px;height:5px;background:#FF5A00;border-radius:50%;pointer-events:none;z-index:99999;opacity:0;transform:translate(-50%,-50%)';
  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let cursorVisible = false;
  window.addEventListener('mousemove', e => {
    if (!cursorVisible) {
      cursorVisible = true;
      gsap.to([cursor, cursorDot], { opacity: 1, duration: 0.3 });
    }
    gsap.set(cursorDot, { x: e.clientX, y: e.clientY });
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power2.out' });
  });
  document.querySelectorAll('a, button, .release-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.6, duration: 0.2 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1,   duration: 0.2 }));
  });
}

// ── PRÉPARE LES LETTRES DU NOM ────────────────────────────────
const heroName    = document.querySelector('.hero-name');
const heroContent = document.querySelector('.hero-content');

if (heroName) {
  heroName.innerHTML =
    '<span class="g-line">' +
    heroName.innerText.replace(/(\S)/g, '<span class="g-char">$1</span>') +
    '</span>';
}
if (heroContent) heroContent.classList.add('hero-loading');

function _heroFallback() {
  if (heroContent) heroContent.classList.remove('hero-loading');
  gsap.set('.hero-tag,.hero-name,.g-line-sep,.hero-sub,.hero-cta,.hero-scroll', { visibility: 'visible', clearProps: 'all' });
}

// ── LOADER SPECTRUM (orange) ──────────────────────────────────
(function() {
  const canvas = document.getElementById('loaderCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const vw  = window.innerWidth;
  const W   = Math.min(vw * 0.88, 300);
  const H   = Math.round(W * 0.38);
  canvas.width  = W;
  canvas.height = H;

  const N   = vw < 480 ? 22 : 30;
  const GAP = 2;
  const barW = (W - GAP * (N - 1)) / N;

  const bars = Array.from({ length: N }, () => ({
    cur: 8 + Math.random() * 20,
    target: 8 + Math.random() * (H - 8),
    vel: 0,
    phase: Math.random() * Math.PI * 2,
    freq:  0.4 + Math.random() * 1.2,
  }));

  let t = 0, raf;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.018;
    bars.forEach((b, i) => {
      const wave =
        Math.sin(t * b.freq + b.phase) * 0.45 +
        Math.sin(t * b.freq * 1.7 + b.phase * 0.5) * 0.3 +
        Math.sin(t * 0.3 + i * 0.4) * 0.25;
      b.target = H * 0.1 + ((wave + 1) / 2) * H * 0.84;
      b.vel = b.vel * 0.72 + (b.target - b.cur) * 0.12;
      b.cur += b.vel;

      const bh = Math.max(3, b.cur);
      const x  = i * (barW + GAP);
      const y  = H - bh;

      const grad = ctx.createLinearGradient(0, y, 0, H);
      grad.addColorStop(0, `rgba(255,90,0,${0.4 + (bh / H) * 0.6})`);
      grad.addColorStop(1, 'rgba(255,90,0,0.06)');
      ctx.fillStyle = grad;

      const r = Math.min(barW / 2, 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, H);
      ctx.lineTo(x, H);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + barW / 2, y + 1.5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,140,66,${0.5 + (bh / H) * 0.5})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  draw();
  window._stopLoaderCanvas = () => cancelAnimationFrame(raf);
})();

// ── LOADER SÉQUENCE ───────────────────────────────────────────
const loader = document.getElementById('loader');
const fill   = document.querySelector('.loader-progress-fill');

document.body.style.overflow = 'hidden';

let pct = 0;
const iv = setInterval(() => {
  pct += Math.random() * 14 + 3;
  if (pct >= 92) { pct = 92; clearInterval(iv); }
  fill.style.width = pct + '%';
}, 100);

setTimeout(() => {
  clearInterval(iv);
  gsap.to(fill, {
    width: '100%', duration: 0.3, ease: 'power2.out',
    onComplete: () => {
      setTimeout(() => {
        gsap.to('.loader-inner', { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' });
        gsap.to(loader, {
          opacity: 0, duration: 0.5, delay: 0.2, ease: 'power2.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            document.body.style.overflow = '';
            if (window._stopLoaderCanvas) window._stopLoaderCanvas();
            try { initScrollAnimations(); } catch(e) { console.warn(e); }
            try { triggerHeroAnimations(); } catch(e) { console.warn(e); _heroFallback(); }
          }
        });
      }, 150);
    }
  });
}, 2000);

// ── HERO ANIMATIONS ───────────────────────────────────────────
function triggerHeroAnimations() {
  const mobile = window.innerWidth < 680;

  // Masque chaque élément avec sa valeur de départ — zéro flash
  gsap.set('.hero-tag',            { visibility: 'visible', opacity: 0, x: mobile ? 30 : 15, skewX: mobile ? 10 : 6 });
  gsap.set('.hero-name',           { visibility: 'visible', opacity: 0 });
  gsap.set('.hero-name .g-char',   { opacity: 0, y: mobile ? 90 : 100, rotateX: mobile ? -90 : -80, scaleY: mobile ? 0.2 : 0.4 });
  gsap.set('.g-line-sep',          { visibility: 'visible', opacity: 0, scaleX: 0, transformOrigin: 'left' });
  gsap.set('.hero-sub',            { visibility: 'visible', opacity: 0, y: 30 });
  gsap.set('.hero-cta',            { visibility: 'visible' });
  gsap.set('.hero-cta .btn-primary', { opacity: 0, y: 30 });
  gsap.set('.hero-cta .btn-ghost',   { opacity: 0, y: 30 });
  gsap.set('.hero-scroll',         { visibility: 'visible', opacity: 0, y: -16 });

  if (heroContent) heroContent.classList.remove('hero-loading');

  // Barre reveal orange
  const bar = document.createElement('div');
  bar.className = 'g-reveal-bar';
  document.body.appendChild(bar);

  const tl = gsap.timeline({ onComplete: () => bar.remove() });

  tl
    .set(bar, { scaleX: 0, opacity: 1, transformOrigin: 'left center' })
    .to(bar,  { scaleX: 1, duration: 0.45, ease: 'expo.inOut' })
    .to(bar,  { scaleX: 0, transformOrigin: 'right center', duration: 0.38, ease: 'expo.inOut' })

    .to('.hero-wave', { opacity: mobile ? 0.18 : 0.12, duration: 0.6, ease: 'power2.out' }, '-=0.3')

    .to('.hero-tag', { x: 0, skewX: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.2')

    .set('.hero-name', { opacity: 1 })
    .to('.hero-name .g-char', {
      opacity: 1, y: 0, rotateX: 0, scaleY: 1,
      duration: mobile ? 0.6 : 0.5,
      stagger:  mobile ? 0.03 : 0.025,
      ease: 'back.out(2)',
      transformOrigin: '50% 100% -20px'
    }, '-=0.1')

    .to('.g-line-sep', { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.15')

    .to('.hero-sub', { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, '-=0.15')

    .to('.hero-cta .btn-primary', { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)', clearProps: 'all' }, '-=0.1')
    .to('.hero-cta .btn-ghost',   { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)', clearProps: 'all' }, '-=0.38')

    .to('.hero-scroll', { y: 0, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }, '-=0.2');
}

// ── SCROLL ANIMATIONS ─────────────────────────────────────────
function initScrollAnimations() {
  const mob = window.innerWidth < 680;

  // Navbar scrub
  ScrollTrigger.create({
    onUpdate: self => {
      const y = window.scrollY;
      if (y < 80) gsap.to('#navbar', { y: 0, duration: 0.3, ease: 'power2.out' });
      else if (self.direction === -1) gsap.to('#navbar', { y: 0, duration: 0.4, ease: 'power2.out' });
      else if (self.direction === 1 && y > 200) gsap.to('#navbar', { y: -80, duration: 0.3, ease: 'power2.in' });
    }
  });

  // Section tags
  gsap.utils.toArray('.section-tag').forEach(tag => {
    gsap.from(tag, {
      scrollTrigger: { trigger: tag, start: 'top 95%' },
      opacity: 0, y: 16, duration: 0.6, ease: 'power3.out'
    });
  });

  // Titres
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 92%' },
      opacity: 0, y: mob ? 60 : 40, duration: 0.9, ease: 'power4.out'
    });
  });

  // About visuel
  gsap.from('.about-img-wrap', {
    scrollTrigger: { trigger: '#about', start: 'top 88%' },
    opacity: 0, scale: mob ? 0.85 : 0.9, y: mob ? 50 : 0,
    duration: 1.0, ease: 'power3.out'
  });

  // About texte
  gsap.from('.about-text > *', {
    scrollTrigger: { trigger: '.about-text', start: 'top 90%' },
    opacity: 0, x: mob ? 0 : 40, y: mob ? 30 : 0,
    duration: 0.7, stagger: 0.12, ease: 'power3.out'
  });

  // Stats compteurs
  gsap.utils.toArray('.stat-num').forEach(el => {
    const raw    = el.innerText.replace(/[^0-9]/g, '');
    const suffix = el.innerHTML.replace(/[0-9]/g, '');
    if (!raw) return;
    const target = parseInt(raw);
    const obj = { val: 0 };
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 95%' },
      scale: 1.3, opacity: 0, duration: 0.5, ease: 'back.out(2)'
    });
    gsap.to(obj, {
      scrollTrigger: { trigger: el, start: 'top 95%' },
      val: target, duration: 2.0, ease: 'power2.out',
      onUpdate: () => { el.innerHTML = Math.round(obj.val) + suffix; }
    });
  });

  // Release cards
  gsap.from('.release-card', {
    scrollTrigger: { trigger: '#releases', start: 'top 88%' },
    opacity: 0, y: mob ? 60 : 50, scale: 0.9,
    duration: mob ? 0.7 : 0.6,
    stagger: { amount: 0.4, from: 'start' },
    ease: 'back.out(1.6)'
  });

  // Shows
  gsap.utils.toArray('.show-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 95%' },
      opacity: 0, x: mob ? -50 : -40, duration: 0.6,
      delay: i * 0.08, ease: 'power3.out'
    });
  });

  // EPK
  gsap.from('.epk-text > *', {
    scrollTrigger: { trigger: '#epk', start: 'top 88%' },
    opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: 'power3.out'
  });
  gsap.from('.epk-badge', {
    scrollTrigger: { trigger: '#epk', start: 'top 88%' },
    opacity: 0, scale: 0.6, duration: 0.8, ease: 'back.out(2)'
  });

  // Contact
  gsap.from('.contact-left > *', {
    scrollTrigger: { trigger: '#contact', start: 'top 88%' },
    opacity: 0, x: mob ? 0 : -50, y: mob ? 40 : 0,
    duration: 0.7, stagger: 0.1, ease: 'power3.out'
  });
  gsap.from('.contact-form', {
    scrollTrigger: { trigger: '#contact', start: 'top 88%' },
    opacity: 0, x: mob ? 0 : 50, y: mob ? 50 : 0,
    duration: 0.8, ease: 'power3.out', delay: mob ? 0.1 : 0
  });
}

// ── MAGNETIC BUTTONS (desktop) ────────────────────────────────
if (!isTouch) {
  document.querySelectorAll('.btn-primary, .btn-ghost, .btn-nav').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
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
      if (r.ok) {
        note.textContent = 'Message envoyé ! Je reviens vers vous rapidement.';
        this.reset();
        setTimeout(() => { note.textContent = ''; }, 6000);
      } else {
        note.textContent = 'Erreur — réessayez ou contactez directement sur Instagram.';
      }
      btn.disabled = false;
      btn.textContent = 'Envoyer';
    })
    .catch(() => {
      note.textContent = 'Erreur réseau — réessayez.';
      btn.disabled = false;
      btn.textContent = 'Envoyer';
    });
  });
}
