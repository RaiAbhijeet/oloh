/* ==========================================================================
   ONE LOVE ONE HEART e.V. — Main JavaScript
   ==========================================================================
   Contents:
   1. Hamburger / Mobile Nav
   2. Scroll Reveal
   3. Active Nav Link
   4. Language Switcher (DE/EN)
   5. Lightbox (gallery)
   ========================================================================== */


/* ─────────────────────────────────────────────
   1. HAMBURGER / MOBILE NAV
   ───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}


/* ─────────────────────────────────────────────
   2. SCROLL REVEAL
   Add class "reveal" to any element to animate it
   in when it scrolls into view.
   ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────────
   3. ACTIVE NAV LINK ON SCROLL
   Highlights the nav item matching current section.
   ───────────────────────────────────────────── */
const sections    = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}` ||
        a.getAttribute('href').endsWith(`/${current}`)) {
      a.classList.add('active');
    }
  });
});


/* ─────────────────────────────────────────────
   4. LANGUAGE SWITCHER (DE / EN)
   Elements with data-de and data-en attributes
   will switch text content on toggle.
   Usage: <span data-de="Hallo" data-en="Hello">Hallo</span>
   ───────────────────────────────────────────── */
let currentLang = localStorage.getItem('oloh-lang') || 'de';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('oloh-lang', lang);

  document.querySelectorAll('[data-de][data-en]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  // Update button states
  document.querySelectorAll('.lang-switcher button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Init language on load
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);
});

// Expose globally so buttons can call it
window.switchLang = function(lang) {
  applyLanguage(lang);
};


/* ─────────────────────────────────────────────
   5. SIMPLE LIGHTBOX FOR GALLERY
   Click a gallery item (.gallery-strip__item or .gc-item) to enlarge the image.
   ───────────────────────────────────────────── */
function initLightbox() {
  const items = document.querySelectorAll('.gallery-strip__item, .gc-item');
  if (!items.length) return;

  // Create lightbox overlay
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.style.cssText = `
    display:none; position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,0.92); align-items:center; justify-content:center;
    cursor:zoom-out;
  `;

  const img = document.createElement('img');
  img.style.cssText = `
    max-width:90vw; max-height:90vh; border-radius:4px;
    box-shadow:0 8px 40px rgba(0,0,0,0.5);
    object-fit:contain;
  `;

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  // One handler for all gallery items, so items added later (carousel copies) work too
  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery-strip__item, .gc-item');
    if (!item) return;
    img.src = item.querySelector('img').src;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

document.addEventListener('DOMContentLoaded', initLightbox);


/* ─────────────────────────────────────────────
   6. HOME PAGE PHOTO CAROUSEL (endless loop)
   One row of photos (newest first, starting at the left). The photo in
   the middle of the visible row is shown bigger (.is-active). Nothing
   moves by itself: the arrows, swiping or scrolling move it. Clicking
   a photo enlarges it (lightbox above).

   Endless loop: copies of the last photos are placed in front of the
   first one and copies of the first photos after the last one. When the
   movement comes to rest, the row silently jumps by exactly one full set
   of photos - that looks identical, so it never ends in either direction
   and every photo (also the last one) can reach the middle.
   ───────────────────────────────────────────── */
function initGalleryCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const view = root.querySelector('.gc-viewport');
  const track = root.querySelector('.gc-track');
  const real = Array.from(root.querySelectorAll('.gc-item'));
  if (!view || !track || real.length < 2) return;
  const N = real.length;

  // Layout distance from one photo to the next (not affected by the enlarged tile)
  const pitch = real[1].offsetLeft - real[0].offsetLeft;

  // Copies in front of / behind the real photos; enough to fill the widest screen
  const K = Math.min(N, Math.ceil(Math.max(window.screen.width || 0, window.innerWidth) / pitch) + 2);
  const copy = el => {
    const c = el.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.tabIndex = -1;
    return c;
  };
  real.slice(-K).forEach(el => track.insertBefore(copy(el), real[0]));
  real.slice(0, K).forEach(el => track.appendChild(copy(el)));
  const all = Array.from(track.querySelectorAll('.gc-item'));

  const margin = parseFloat(getComputedStyle(real[0]).scrollMarginLeft) || 0;
  const home = () => real[0].offsetLeft - margin;          // scroll position with the first photo at the left
  const period = () => N * pitch;                          // width of one full set of photos
  const jump = x => view.scrollTo({ left: x, behavior: 'instant' });

  jump(home());                                            // start: first photo at the left, row filled

  // Index (in `all`) of the tile whose centre is closest to the middle of the viewport
  function nearest() {
    const vr = view.getBoundingClientRect(), mid = vr.left + vr.width / 2;
    let best = 0, dist = Infinity;
    all.forEach((el, i) => {
      const r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  }
  let active = -1;
  function mark() {
    const n = nearest();
    if (n === active) return;
    if (active >= 0) all[active].classList.remove('is-active');
    all[n].classList.add('is-active');
    active = n;
  }

  // Keep the scroll position inside one set of photos by jumping a full set (invisible)
  function normalize(force) {
    const x = view.scrollLeft, lo = home(), P = period();
    const nearLeftEnd = x < pitch, nearRightEnd = x > view.scrollWidth - view.clientWidth - pitch;
    if (x < lo && (force || nearLeftEnd || settled)) jump(x + P);
    else if (x >= lo + P && (force || nearRightEnd || settled)) jump(x - P);
    mark();
  }

  // "settled" = movement has stopped (no scroll event for a moment)
  let settled = false, timer = null;
  view.addEventListener('scroll', () => {
    settled = false;
    mark();
    clearTimeout(timer);
    timer = setTimeout(() => { settled = true; normalize(); settled = false; }, 120);
  }, { passive: true });
  window.addEventListener('resize', mark);

  // Arrows move the row by one photo, in both directions without end
  root.querySelector('.gc-next').addEventListener('click', () => view.scrollBy({ left: pitch }));
  root.querySelector('.gc-prev').addEventListener('click', () => view.scrollBy({ left: -pitch }));

  mark();
}

document.addEventListener('DOMContentLoaded', initGalleryCarousel);
