/* ═══════════════════════════════════════════════════════
   SUMIT BANSAL PORTFOLIO — MAIN JS
   Handles: theme toggle, scroll reveal, timeline progress,
   hero counter animation, nav behavior, mobile menu
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── THEME TOGGLE ───────────────────────────────────── */
(function initTheme() {
  const html = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  let current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  html.setAttribute('data-theme', current);
  updateToggleIcon(btn, current);

  if (btn) {
    btn.addEventListener('click', () => {
      current = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', current);
      updateToggleIcon(btn, current);
    });
  }

  function updateToggleIcon(el, theme) {
    if (!el) return;
    if (theme === 'dark') {
      el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>`;
      el.setAttribute('aria-label', 'Switch to light mode');
    } else {
      el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
      el.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
})();


/* ─── CURRENT YEAR ───────────────────────────────────── */
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ─── SCROLL PROGRESS BAR ────────────────────────────── */
const progressBar = document.getElementById('scrollProgressBar');
function updateProgressBar() {
  if (!progressBar) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(pct));
}


/* ─── HEADER SCROLL BEHAVIOR ─────────────────────────── */
const header = document.getElementById('site-header');
let lastScrollY = 0;
let scrollTicking = false;

function handleHeaderScroll() {
  const scrollY = window.scrollY;
  if (!header) return;

  if (scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Hide on scroll down, show on scroll up (after 200px)
  if (scrollY > 200) {
    if (scrollY > lastScrollY + 5) {
      header.classList.add('hidden');
    } else if (scrollY < lastScrollY - 5) {
      header.classList.remove('hidden');
    }
  } else {
    header.classList.remove('hidden');
  }

  lastScrollY = scrollY;
}


/* ─── ACTIVE NAV LINK ────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  const scrollMid = window.scrollY + window.innerHeight / 3;
  let activeId = '';

  sections.forEach(sec => {
    if (sec.offsetTop <= scrollMid) activeId = sec.id;
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#' + activeId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}


/* ─── SCROLL REVEAL ──────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-project').forEach(el => {
  revealObserver.observe(el);
});

// Timeline items get staggered delay by index
document.querySelectorAll('.reveal-timeline').forEach((el, i) => {
  el.style.setProperty('--data-index', i);
  revealObserver.observe(el);
});

// Project cards get staggered reveal
document.querySelectorAll('.reveal-project').forEach((el, i) => {
  el.style.setProperty('--delay', (i * 0.08) + 's');
});


/* ─── TIMELINE PROGRESS ──────────────────────────────── */
const timelineFill = document.getElementById('timelineFill');
const timelineSection = document.getElementById('experience');

function updateTimelineProgress() {
  if (!timelineFill || !timelineSection) return;

  const rect = timelineSection.getBoundingClientRect();
  const sectionH = timelineSection.offsetHeight;
  const windowH = window.innerHeight;

  // How far we've scrolled into the section
  const entered = windowH - rect.top;
  const total = sectionH + windowH;
  const progress = Math.max(0, Math.min(1, entered / total));

  timelineFill.style.height = (progress * 100) + '%';

  // Activate timeline nodes
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < windowH * 0.7) {
      item.classList.add('active');
    }
  });
}


/* ─── HERO STAT COUNTER ──────────────────────────────── */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const startVal = 0;

  function step(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Trigger counters when hero enters view
const heroCounters = document.querySelectorAll('.hero-stat-value[data-count]');
let countersStarted = false;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      heroCounters.forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
      });
    }
  });
}, { threshold: 0.5 });

const heroSection = document.getElementById('hero');
if (heroSection) counterObserver.observe(heroSection);


/* ─── HERO FLOW LINES (Canvas Animation) ─────────────── */
(function initFlowLines() {
  const container = document.getElementById('heroFlowLines');
  if (!container) return;

  // Create SVG with animated flow particles
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0.5';
  container.appendChild(svg);

  const lines = [
    { x1: '10%', y1: '30%', x2: '45%', y2: '60%' },
    { x1: '15%', y1: '70%', x2: '50%', y2: '40%' },
    { x1: '5%',  y1: '50%', x2: '40%', y2: '20%' },
    { x1: '20%', y1: '85%', x2: '55%', y2: '55%' },
    { x1: '0%',  y1: '40%', x2: '35%', y2: '80%' },
  ];

  lines.forEach((l, i) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path.setAttribute('x1', l.x1);
    path.setAttribute('y1', l.y1);
    path.setAttribute('x2', l.x2);
    path.setAttribute('y2', l.y2);
    path.setAttribute('stroke', 'var(--color-accent)');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '0');
    path.style.strokeDasharray = '200';
    path.style.strokeDashoffset = '200';

    const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    anim.setAttribute('attributeName', 'stroke-dashoffset');
    anim.setAttribute('values', '200;0;200');
    anim.setAttribute('dur', (3 + i * 0.8) + 's');
    anim.setAttribute('begin', (i * 0.6) + 's');
    anim.setAttribute('repeatCount', 'indefinite');
    anim.setAttribute('calcMode', 'spline');
    anim.setAttribute('keySplines', '0.4 0 0.6 1; 0.4 0 0.6 1');

    const animOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animOp.setAttribute('attributeName', 'opacity');
    animOp.setAttribute('values', '0;0.4;0');
    animOp.setAttribute('dur', (3 + i * 0.8) + 's');
    animOp.setAttribute('begin', (i * 0.6) + 's');
    animOp.setAttribute('repeatCount', 'indefinite');

    path.appendChild(anim);
    path.appendChild(animOp);
    svg.appendChild(path);
  });
})();


/* ─── MOBILE MENU ────────────────────────────────────── */
(function initMobileMenu() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    overlay.classList.add('show');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('show');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });
})();


/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ─── UNIFIED SCROLL HANDLER ─────────────────────────── */
function onScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateProgressBar();
      handleHeaderScroll();
      updateActiveNav();
      updateTimelineProgress();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateActiveNav, { passive: true });

// Initialize
updateProgressBar();
handleHeaderScroll();
updateActiveNav();
updateTimelineProgress();


/* ─── ORBIT PAUSE ON REDUCED MOTION ─────────────────── */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.orbit-ring, .orbit-ring--inner').forEach(el => {
    el.style.animation = 'none';
  });
}
