/* ═══════════════════════════════════════════════════════
   SUMIT BANSAL — PORTFOLIO JS
   Effects: Canvas particles, text scramble, scroll reveals,
   timeline progress, counter animation, ticker, theme
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ─── THEME ────────────────────────────────────────── */
(function () {
  const html = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const moon = btn?.querySelector('.icon-moon');
  const sun  = btn?.querySelector('.icon-sun');
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  html.setAttribute('data-theme', theme);
  syncIcons();

  btn?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    syncIcons();
  });

  function syncIcons() {
    if (!moon || !sun) return;
    moon.style.display = theme === 'dark' ? 'block' : 'none';
    sun.style.display  = theme === 'light' ? 'block' : 'none';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
})();

/* ─── YEAR ─────────────────────────────────────────── */
const yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* ─── CANVAS PARTICLE GRID ─────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots = [], mouse = { x: -999, y: -999 };
  const SPACING = 48, RADIUS = 1.4, CONNECT_DIST = 90;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const cols = Math.ceil(W / SPACING) + 1;
    const rows = Math.ceil(H / SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * SPACING, y: r * SPACING,
          ox: c * SPACING, oy: r * SPACING,
          vx: 0, vy: 0,
          size: RADIUS * (0.5 + Math.random() * 0.8),
          alpha: 0.12 + Math.random() * 0.18
        });
      }
    }
  }

  function getAccent() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? { r: 0, g: 107, b: 82 }
      : { r: 0, g: 229, b: 184 };
  }

  let raf;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const c = getAccent();

    dots.forEach(d => {
      const dx = mouse.x - d.x, dy = mouse.y - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 80 - dist) / 80;
      d.vx += (-dx / dist || 0) * force * 0.4;
      d.vy += (-dy / dist || 0) * force * 0.4;
      d.vx += (d.ox - d.x) * 0.05;
      d.vy += (d.oy - d.y) * 0.05;
      d.vx *= 0.82; d.vy *= 0.82;
      d.x += d.vx; d.y += d.vy;

      const glow = Math.max(0, 1 - dist / 140) * 0.6;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size + glow * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${d.alpha + glow * 0.5})`;
      ctx.fill();
    });

    // Draw connections near mouse
    dots.forEach((a, i) => {
      dots.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          const mda = Math.sqrt((mouse.x-a.x)**2+(mouse.y-a.y)**2);
          const mdb = Math.sqrt((mouse.x-b.x)**2+(mouse.y-b.y)**2);
          if (mda < 160 || mdb < 160) {
            const alpha = (1 - d / CONNECT_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });
    });

    raf = requestAnimationFrame(draw);
  }

  const heroEl = document.getElementById('hero');
  heroEl?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  heroEl?.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();

/* ─── HERO NAME REVEAL ─────────────────────────────── */
(function () {
  const line = document.querySelector('.name-line');
  if (!line) return;
  setTimeout(() => line.classList.add('visible'), 120);
})();

/* ─── TEXT SCRAMBLE ON HERO TAG ────────────────────── */
(function () {
  const el = document.getElementById('tagText');
  if (!el) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const target = el.textContent;
  let frame = 0, iterations = 0;

  function scramble() {
    el.textContent = target.split('').map((ch, i) => {
      if (ch === ' ' || ch === '&' || ch === ';') return ch;
      if (i < iterations) return ch;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    iterations += 0.5;
    if (iterations < target.length) requestAnimationFrame(scramble);
    else el.textContent = target;
  }

  setTimeout(scramble, 400);
})();

/* ─── HERO COUNTERS ────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.hs-n[data-count]');
  let done = false;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      els.forEach(el => {
        const target = +el.dataset.count;
        const start = performance.now();
        const dur = 1000 + Math.random() * 400;
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
  }, { threshold: 0.5 });

  const hero = document.getElementById('hero');
  if (hero) obs.observe(hero);
})();

/* ─── SCROLL REVEALS ────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.js-reveal').forEach(el => revealObs.observe(el));

/* ─── TIMELINE ──────────────────────────────────────── */
const tlItems = document.querySelectorAll('.js-tl');
const tlFill  = document.getElementById('tlFill');
const tlSection = document.getElementById('experience');

const tlObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), +e.target.dataset.i * 120);
      tlObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
tlItems.forEach(el => tlObs.observe(el));

/* ─── PROJECT CARDS ─────────────────────────────────── */
const projObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      projObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.js-proj').forEach(el => projObs.observe(el));

/* ─── EDUCATION ROWS ────────────────────────────────── */
const eduObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      eduObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.edu-row').forEach(el => eduObs.observe(el));

/* ─── NAV + PROGRESS BAR ────────────────────────────── */
const nav = document.getElementById('nav');
const navProgress = document.getElementById('navProgress');
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nl');
let lastY = 0, ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Header scroll state
      nav?.classList.toggle('is-scrolled', y > 40);

      // Progress bar
      if (navProgress) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        navProgress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }

      // Timeline fill
      if (tlFill && tlSection) {
        const rect = tlSection.getBoundingClientRect();
        const entered = window.innerHeight - rect.top;
        const total   = tlSection.offsetHeight + window.innerHeight;
        const pct = Math.max(0, Math.min(1, entered / total));
        tlFill.style.height = (pct * 100) + '%';
      }

      // Active nav
      let active = '';
      sections.forEach(s => {
        if (s.offsetTop - 100 <= y) active = s.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + active);
      });

      lastY = y;
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── MOBILE MENU ───────────────────────────────────── */
(function () {
  const btn = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const bg = document.getElementById('drawerBg');
  const links = document.querySelectorAll('.dl');

  function open() {
    drawer?.classList.add('open');
    bg?.classList.add('show');
    btn?.classList.add('open');
    btn?.setAttribute('aria-expanded', 'true');
    drawer?.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer?.classList.remove('open');
    bg?.classList.remove('show');
    btn?.classList.remove('open');
    btn?.setAttribute('aria-expanded', 'false');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn?.addEventListener('click', () => drawer?.classList.contains('open') ? close() : open());
  bg?.addEventListener('click', close);
  links.forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
})();

/* ─── SMOOTH ANCHOR SCROLL ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ─── REDUCED MOTION GUARD ──────────────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.ticker-track').forEach(el => el.style.animation = 'none');
  document.querySelectorAll('.sh-line').forEach(el => el.style.animation = 'none');
  document.querySelectorAll('.tag-dot').forEach(el => el.style.animation = 'none');
}
