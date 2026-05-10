/* ============================================================
   main.js — Asymmetric AI
   Mobile nav · Nav scroll · Hero parallax · Scroll reveal
   ============================================================ */

'use strict';

/* ── Mobile nav ─────────────────────────────────────────────── */
const burger  = document.querySelector('.nav-burger');
const overlay = document.querySelector('.mobile-overlay');
const closeBtn= document.querySelector('.mobile-overlay-close');

function openNav() {
  overlay.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible', 'open')));
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
  setTimeout(() => { overlay.classList.remove('open'); overlay.style.display = ''; }, 300);
}

if (burger && overlay && closeBtn) {
  burger.addEventListener('click', openNav);
  closeBtn.addEventListener('click', closeNav);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeNav(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
}

/* ── Nav scroll shadow ──────────────────────────────────────── */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── Hero parallax ──────────────────────────────────────────── */
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight) {
      heroImg.style.transform = `translateY(${window.scrollY * 0.22}px)`;
    }
  }, { passive: true });
}

/* ── Scroll reveal ──────────────────────────────────────────── */
(function setupReveal() {
  const targets = [
    '.eyebrow-block', '.product-card', '.bundle-card',
    '.prompt-cell',   '.audience-card', '.three-col > div',
    '.inclusion-row', '.anim-caption', '.pricing > *',
  ].join(',');

  const els = document.querySelectorAll(targets);
  els.forEach(el => {
    el.classList.add('reveal');
    // Stagger siblings in same parent
    const siblings = Array.from(el.parentElement.children).filter(c => c.matches(targets));
    const idx = siblings.indexOf(el);
    if (idx > 0 && idx <= 4) el.classList.add(`reveal-d${idx}`);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();
