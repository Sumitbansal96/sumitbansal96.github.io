/* =======================================================
   SUMIT BANSAL — PORTFOLIO JS
   Effects: Canvas particles, text scramble, scroll reveals,
   timeline progress, counter animation, ticker, theme,
   logic gates + molecular chain SVG deco
   ======================================================= */
'use strict';

/* --- THEME -------------------------------------------- */
(function () {
  const html = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const moon = btn?.querySelector('.icon-moon');
  const sun  = btn?.querySelector('.icon-sun');
  // Always default to dark — only switch if user explicitly chose light
  // Persist theme preference across visits
  const stored = (function(){ try { return window.localStorage.getItem('sb-theme'); } catch(e) { return null; } })();
  let theme = stored || 'dark';

  html.setAttribute('data-theme', theme);
  syncIcons();

  btn?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    try { window.localStorage.setItem('sb-theme', theme); } catch(e) {}
    syncIcons();
  });

  function syncIcons() {
    if (!moon || !sun) return;
    moon.style.display = theme === 'dark' ? 'block' : 'none';
    sun.style.display  = theme === 'light' ? 'block' : 'none';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
})();

/* --- YEAR --------------------------------------------- */
const yrEl = document.getElementById('yr');
if (yrEl) yrEl.textContent = new Date().getFullYear();

/* --- CANVAS PARTICLE GRID ----------------------------- */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, dots = [], mouse = { x: -999, y: -999 };
  const SPACING = 44, RADIUS = 1.7, CONNECT_DIST = 100;

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
          size: RADIUS * (0.6 + Math.random() * 0.9),
          alpha: 0.22 + Math.random() * 0.28
        });
      }
    }
  }

  function getAccent() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? { r: 0, g: 168, b: 130 }
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

      const glow = Math.max(0, 1 - dist / 140) * 0.8;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size + glow * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${d.alpha + glow * 0.65})`;
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
          if (mda < 180 || mdb < 180) {
            const alpha = (1 - d / CONNECT_DIST) * 0.4;
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

/* --- HERO SVG DECO: Logic Gates + Molecular Chain ----- */
(function buildDeco() {
  const svg = document.getElementById('heroDeco');
  if (!svg) return;

  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  const ac = 'var(--accent)';
  const NONE = 'none';

  /* -- AND Gate -- */
  function andGate(x, y, s) {
    const g = el('g', { transform: `translate(${x},${y}) scale(${s})` });
    g.appendChild(el('path', {
      d: 'M0,0 L30,0 Q52,0 52,22 Q52,44 30,44 L0,44 Z',
      fill: NONE, stroke: ac, 'stroke-width': '1.5', 'stroke-linejoin': 'round'
    }));
    g.appendChild(el('line', { x1: '-16', y1: '12', x2: '0', y2: '12', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('line', { x1: '-16', y1: '32', x2: '0', y2: '32', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('line', { x1: '52', y1: '22', x2: '68', y2: '22', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('circle', { cx: '-16', cy: '12', r: '3', fill: ac }));
    g.appendChild(el('circle', { cx: '-16', cy: '32', r: '3', fill: ac }));
    g.appendChild(el('circle', { cx: '68', cy: '22', r: '3', fill: ac }));
    return g;
  }

  /* -- OR Gate -- */
  function orGate(x, y, s) {
    const g = el('g', { transform: `translate(${x},${y}) scale(${s})` });
    g.appendChild(el('path', {
      d: 'M0,0 Q16,0 36,22 Q16,44 0,44 Q12,22 0,0 Z',
      fill: NONE, stroke: ac, 'stroke-width': '1.5', 'stroke-linejoin': 'round'
    }));
    g.appendChild(el('line', { x1: '-14', y1: '12', x2: '8', y2: '12', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('line', { x1: '-14', y1: '32', x2: '8', y2: '32', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('line', { x1: '36', y1: '22', x2: '52', y2: '22', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('circle', { cx: '-14', cy: '12', r: '3', fill: ac }));
    g.appendChild(el('circle', { cx: '-14', cy: '32', r: '3', fill: ac }));
    g.appendChild(el('circle', { cx: '52', cy: '22', r: '3', fill: ac }));
    return g;
  }

  /* -- NOT Gate -- */
  function notGate(x, y, s) {
    const g = el('g', { transform: `translate(${x},${y}) scale(${s})` });
    g.appendChild(el('path', {
      d: 'M0,0 L36,20 L0,40 Z',
      fill: NONE, stroke: ac, 'stroke-width': '1.5', 'stroke-linejoin': 'round'
    }));
    g.appendChild(el('circle', { cx: '40', cy: '20', r: '4', fill: NONE, stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('line', { x1: '-14', y1: '20', x2: '0', y2: '20', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('line', { x1: '44', y1: '20', x2: '58', y2: '20', stroke: ac, 'stroke-width': '1.5' }));
    g.appendChild(el('circle', { cx: '-14', cy: '20', r: '3', fill: ac }));
    g.appendChild(el('circle', { cx: '58', cy: '20', r: '3', fill: ac }));
    return g;
  }

  /* -- Molecular Chain -- */
  function molChain(x, y, s, nodeCount, angle) {
    const g = el('g', { transform: `translate(${x},${y}) scale(${s}) rotate(${angle})` });
    const spacing = 48, r = 8;
    for (let i = 0; i < nodeCount; i++) {
      const cx = i * spacing;
      if (i < nodeCount - 1) {
        g.appendChild(el('line', {
          x1: cx + r, y1: '0', x2: cx + spacing - r, y2: '0',
          stroke: ac, 'stroke-width': '1.5'
        }));
      }
      if (i % 2 === 0 && i < nodeCount - 1) {
        g.appendChild(el('line', {
          x1: cx, y1: '-8', x2: cx, y2: '-26',
          stroke: ac, 'stroke-width': '1', 'stroke-dasharray': '3 3'
        }));
        g.appendChild(el('circle', { cx, cy: '-26', r: '4', fill: NONE, stroke: ac, 'stroke-width': '1' }));
      }
      g.appendChild(el('circle', { cx, cy: '0', r, fill: NONE, stroke: ac, 'stroke-width': '1.5' }));
    }
    return g;
  }

  /* -- Hex Ring (benzene-style) -- */
  function hexRing(x, y, s) {
    const g = el('g', { transform: `translate(${x},${y}) scale(${s})` });
    const r = 26;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ') + ' Z';
    g.appendChild(el('path', { d, fill: NONE, stroke: ac, 'stroke-width': '1.5', 'stroke-linejoin': 'round' }));
    g.appendChild(el('circle', { cx: '0', cy: '0', r: '14', fill: NONE, stroke: ac, 'stroke-width': '0.8', 'stroke-dasharray': '4 4' }));
    pts.forEach(([cx, cy]) => {
      g.appendChild(el('circle', { cx: cx.toFixed(2), cy: cy.toFixed(2), r: '3', fill: ac }));
    });
    return g;
  }

  /* Place elements using % for responsive positioning */
  // We use foreignObject trick: SVG % coords relative to viewport
  // Use a viewBox approach by setting the SVG to be 100vw x 100vh via JS
  function pct(p, total) { return (p / 100) * total; }

  // Wait until hero size is known
  const hero = document.getElementById('hero');
  function placeDeco() {
    const W = hero.offsetWidth;
    const H = hero.offsetHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    svg.innerHTML = ''; // clear on resize

    // AND gate — top right
    svg.appendChild(andGate(pct(74, W), pct(8, H), 0.9));
    // OR gate — bottom left
    svg.appendChild(orGate(pct(4, W), pct(72, H), 0.78));
    // NOT gate — mid right
    svg.appendChild(notGate(pct(80, W), pct(50, H), 0.72));
    // AND gate small — mid left
    svg.appendChild(andGate(pct(2, W), pct(36, H), 0.58));

    // Molecular chain — top-left diagonal area
    svg.appendChild(molChain(pct(6, W), pct(18, H), 0.82, 5, -12));
    // Molecular chain — bottom right
    svg.appendChild(molChain(pct(52, W), pct(86, H), 0.78, 4, 0));
    // Molecular chain — right side, vertical
    svg.appendChild(molChain(pct(88, W), pct(28, H), 0.68, 4, 78));

    // Hex rings
    svg.appendChild(hexRing(pct(16, W), pct(80, H), 0.9));
    svg.appendChild(hexRing(pct(68, W), pct(12, H), 0.72));
    svg.appendChild(hexRing(pct(90, W), pct(75, H), 0.65));
  }

  // Initial render + resize
  placeDeco();
  let decoTimer;
  window.addEventListener('resize', () => {
    clearTimeout(decoTimer);
    decoTimer = setTimeout(placeDeco, 200);
  }, { passive: true });
})();

/* --- HERO NAME REVEAL --------------------------------- */
(function () {
  const line = document.querySelector('.name-line');
  if (!line) return;
  setTimeout(() => line.classList.add('visible'), 120);
})();

/* --- TEXT SCRAMBLE ON HERO TAG ------------------------ */
(function () {
  const el = document.getElementById('tagText');
  if (!el) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const target = el.textContent;
  let iterations = 0;

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

/* --- HERO COUNTERS ------------------------------------- */
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

/* --- SCROLL REVEALS ------------------------------------ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.js-reveal').forEach(el => revealObs.observe(el));

/* --- TIMELINE ------------------------------------------ */
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

/* --- PROJECT CARDS ------------------------------------- */
const projObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      projObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.js-proj').forEach(el => projObs.observe(el));

/* --- EDUCATION ROWS ------------------------------------ */
const eduObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      eduObs.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('.edu-row').forEach(el => eduObs.observe(el));

/* --- NAV + PROGRESS BAR -------------------------------- */
const nav = document.getElementById('nav');
const navProgress = document.getElementById('navProgress');
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nl');
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;

      nav?.classList.toggle('is-scrolled', y > 40);

      if (navProgress) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        navProgress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }

      if (tlFill && tlSection) {
        const rect = tlSection.getBoundingClientRect();
        const entered = window.innerHeight - rect.top;
        const total   = tlSection.offsetHeight + window.innerHeight;
        const pct = Math.max(0, Math.min(1, entered / total));
        tlFill.style.height = (pct * 100) + '%';
      }

      let active = '';
      sections.forEach(s => {
        if (s.offsetTop - 100 <= y) active = s.id;
      });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + active);
      });

      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* --- MOBILE MENU --------------------------------------- */
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

/* --- SMOOTH ANCHOR SCROLL ------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* --- REDUCED MOTION GUARD ------------------------------ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.ticker-track').forEach(el => el.style.animation = 'none');
  document.querySelectorAll('.sh-line').forEach(el => el.style.animation = 'none');
  document.querySelectorAll('.tag-dot').forEach(el => el.style.animation = 'none');
}
