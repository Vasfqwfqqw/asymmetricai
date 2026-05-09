/* ============================================================
   main.js — Asymmetric AI
   Mobile nav · Nav scroll · Hero parallax · Scroll reveal · 3D Cube
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

/* ── 3D Cube assembly animation ─────────────────────────────── */
(function setupCube() {
  const canvas = document.getElementById('puzzle-canvas');
  if (!canvas) return;

  // Lazy-load Three.js only when canvas is near viewport
  const loader = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    loader.disconnect();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = initCube;
    document.head.appendChild(s);
  }, { rootMargin: '200px' });

  loader.observe(canvas);
})();

function initCube() {
  const canvas = document.getElementById('puzzle-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Sizing helpers ── */
  const getW = () => canvas.parentElement.offsetWidth;
  const getH = () => Math.min(Math.round(getW() * 0.5), 480);

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(getW(), getH(), false);
  renderer.setClearColor(0x000000, 0);

  /* ── Scene ── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, getW() / getH(), 0.1, 100);
  camera.position.set(0, 0.6, 7.2);
  camera.lookAt(0, 0, 0);

  /* ── Lights ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.32));

  const key = new THREE.DirectionalLight(0xffffff, 0.72);
  key.position.set(5, 7, 4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8899cc, 0.28);
  fill.position.set(-5, 1, -3);
  scene.add(fill);

  const amberLight = new THREE.PointLight(0xD4943A, 1.1, 18);
  amberLight.position.set(0, 0.5, 4);
  scene.add(amberLight);

  /* ── Materials ── */
  const mkMat = (col, shine = 28) =>
    new THREE.MeshPhongMaterial({ color: col, shininess: shine, specular: 0x224466 });

  const mats = [
    mkMat(0x0A1628, 24),  // deep navy
    mkMat(0x111E33, 24),  // card navy
    mkMat(0x1A2A40, 28),  // mid navy
    mkMat(0x0D1B2C, 20),  // darkest
    mkMat(0x162236, 30),  // navy-blue
    mkMat(0x0F1E32, 22),  // near-black navy
    mkMat(0x1E2D45, 28),  // slate
    mkMat(0x162033, 24),  // blue-slate
  ];

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xD4943A, opacity: 0.65, transparent: true,
  });

  /* ── Geometry ── */
  const SIZE = 0.86;
  const GAP  = 0.07;
  const STEP = SIZE + GAP;

  const geo     = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const edgeGeo = new THREE.EdgesGeometry(geo);

  /* 8 corner positions for scatter/target */
  const corners = [
    [-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],
    [-1,-1, 1],[1,-1, 1],[-1,1, 1],[1,1, 1],
  ];

  const SCATTER = 4.8; // how far pieces fly to

  const pieces = corners.map(([cx,cy,cz], i) => {
    const mesh  = new THREE.Mesh(geo, mats[i]);
    const edges = new THREE.LineSegments(edgeGeo, edgeMat.clone());
    mesh.add(edges);

    mesh.userData.target  = new THREE.Vector3(cx*STEP*0.5, cy*STEP*0.5, cz*STEP*0.5);
    mesh.userData.scatter = new THREE.Vector3(cx*SCATTER,  cy*SCATTER,  cz*SCATTER);

    mesh.position.copy(mesh.userData.scatter);
    scene.add(mesh);
    return mesh;
  });

  /* ── Easing functions ── */
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2);
  }
  function easeInCubic(t) { return t*t*t; }
  function easeInOutSine(t) { return -(Math.cos(Math.PI*t) - 1) / 2; }

  /* ── State machine ── */
  const PHASE = { ASSEMBLE:0, HOLD:1, EXPLODE:2, PAUSE:3 };
  const DUR   = { ASSEMBLE:2.4, HOLD:3.8, EXPLODE:1.6, PAUSE:0.7 };

  let phase    = PHASE.ASSEMBLE;
  let progress = 0;
  let camAngle = 0;
  let lastT    = -1;

  /* Target camera for orbit */
  const CAM_ORBIT_R = 7;

  function tick(now) {
    requestAnimationFrame(tick);
    if (lastT < 0) { lastT = now; return; }
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    /* ASSEMBLE: pieces fly from corners to grid */
    if (phase === PHASE.ASSEMBLE) {
      progress = Math.min(progress + dt / DUR.ASSEMBLE, 1);
      const e = easeOutBack(progress);
      const spin = (1 - progress) * 0.09;
      pieces.forEach(p => {
        p.position.lerpVectors(p.userData.scatter, p.userData.target, Math.min(e, 1));
        p.rotation.x += spin;
        p.rotation.y += spin * 0.65;
      });
      if (progress >= 1) {
        pieces.forEach(p => { p.position.copy(p.userData.target); p.rotation.set(0,0,0); });
        phase = PHASE.HOLD; progress = 0;
      }
    }

    /* HOLD: orbit camera around the assembled cube */
    else if (phase === PHASE.HOLD) {
      progress = Math.min(progress + dt / DUR.HOLD, 1);
      camAngle += dt * 0.38;
      const elevation = 0.6 + Math.sin(progress * Math.PI) * 0.9;
      camera.position.set(
        Math.cos(camAngle) * CAM_ORBIT_R,
        elevation,
        Math.sin(camAngle) * CAM_ORBIT_R
      );
      camera.lookAt(0, 0, 0);
      /* Pulse amber glow */
      amberLight.intensity = 0.9 + Math.sin(progress * Math.PI * 6) * 0.25;
      if (progress >= 1) { phase = PHASE.EXPLODE; progress = 0; }
    }

    /* EXPLODE: pieces fly back to scatter positions */
    else if (phase === PHASE.EXPLODE) {
      progress = Math.min(progress + dt / DUR.EXPLODE, 1);
      const e = easeInCubic(progress);
      pieces.forEach(p => {
        p.position.lerpVectors(p.userData.target, p.userData.scatter, e);
        p.rotation.x += e * 0.09;
        p.rotation.y += e * 0.06;
      });
      if (progress >= 1) { phase = PHASE.PAUSE; progress = 0; }
    }

    /* PAUSE: smooth camera return to home, then restart */
    else if (phase === PHASE.PAUSE) {
      progress = Math.min(progress + dt / DUR.PAUSE, 1);
      const home = new THREE.Vector3(0, 0.6, 7.2);
      camera.position.lerp(home, 0.1);
      camera.lookAt(0, 0, 0);
      amberLight.intensity = 1.1;
      if (progress >= 1) {
        pieces.forEach(p => { p.position.copy(p.userData.scatter); p.rotation.set(0,0,0); });
        camera.position.set(0, 0.6, 7.2);
        camera.lookAt(0, 0, 0);
        camAngle = 0;
        phase = PHASE.ASSEMBLE; progress = 0;
      }
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(tick);

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    const w = getW(), h = getH();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
}
