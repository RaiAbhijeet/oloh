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
   Click a gallery item to enlarge the image.
   ───────────────────────────────────────────── */
function initLightbox() {
  const items = document.querySelectorAll('.gallery-strip__item');
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

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img').src;
      img.src = src;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
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
