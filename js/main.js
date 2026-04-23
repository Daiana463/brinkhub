/* ============================================================
   BrinkHub — main.js
   01. Header scroll
   02. Menú móvil
   03. Smooth scroll
   04. Animaciones de scroll (Intersection Observer)
   05. Contador de estadísticas
   06. FAQ accordion
   07. Analizador de sitio (demo)
   08. Formulario de contacto (Formspree)
   09. Nav link activo
   10. Banner de cookies
   11. Init
   ============================================================ */

'use strict';

/* ─── 01. HEADER SCROLL ─── */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => { header.classList.toggle('scrolled', window.scrollY > 80); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ─── 02. MENÚ MÓVIL ─── */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const open = () => {
    toggle.classList.add('is-open');
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    toggle.classList.remove('is-open');
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => { menu.classList.contains('is-open') ? close() : open(); });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) close(); });
}


/* ─── 03. SMOOTH SCROLL ─── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72');
      const top    = target.getBoundingClientRect().top + window.scrollY - offset - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ─── 04. ANIMACIONES DE SCROLL ─── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  elements.forEach(el => observer.observe(el));
}


/* ─── 05. CONTADOR DE ESTADÍSTICAS ─── */
function animateCounter(el, target, duration = 3200) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(target * ease);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target, parseInt(entry.target.dataset.target, 10)); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}


/* ─── 06. FAQ ACCORDION ─── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn  = item.querySelector('.faq-btn');
    const body = item.querySelector('.faq-body');
    if (!btn || !body) return;

    body.removeAttribute('hidden');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      items.forEach(other => {
        const ob = other.querySelector('.faq-btn');
        const od = other.querySelector('.faq-body');
        if (ob && od && other !== item) {
          ob.setAttribute('aria-expanded', 'false');
          od.classList.remove('is-open');
          other.classList.remove('is-open');
        }
      });

      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        body.classList.remove('is-open');
        item.classList.remove('is-open');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        body.classList.add('is-open');
        item.classList.add('is-open');
      }
    });
  });
}


/* ─── 07. ANALIZADOR DE SITIO (demo) ─── */
function initAnalyzer() {
  const form    = document.getElementById('analyzerForm');
  const input   = document.getElementById('analyzerUrl');
  const loading = document.getElementById('analyzerLoading');
  const results = document.getElementById('analyzerResults');
  const errMsg  = document.getElementById('analyzerError');
  if (!form) return;

  const scoreEls = {
    perf: document.getElementById('scorePerf'),
    acc:  document.getElementById('scoreAcc'),
    bp:   document.getElementById('scoreBp'),
    seo:  document.getElementById('scoreSeo'),
  };
  const arcs = results ? results.querySelectorAll('.metric-ring__arc') : [];

  const isValidUrl = (str) => {
    try { return ['http:', 'https:'].includes(new URL(str).protocol); }
    catch { return false; }
  };

  const colorForScore = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  const animateRing = (arc, score) => {
    if (!arc) return;
    const circumference = 2 * Math.PI * 15.91;
    const dash = (score / 100) * circumference;
    arc.style.transition = 'stroke-dasharray 1s ease-out, stroke 0.3s';
    arc.style.strokeDasharray = `${dash} ${circumference - dash}`;
    arc.style.stroke = colorForScore(score);
  };

  const showResults = (scores) => {
    const keys = ['perf', 'acc', 'bp', 'seo'];
    loading.hidden = true;
    results.hidden = false;
    keys.forEach((key, i) => {
      const el = scoreEls[key];
      const score = scores[i];
      if (!el) return;
      let val = 0;
      const interval = setInterval(() => {
        val = Math.min(val + Math.ceil(score / 20), score);
        el.textContent = val;
        if (val >= score) clearInterval(interval);
      }, 50);
      setTimeout(() => animateRing(arcs[i], score), 150 + i * 100);
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value.trim();
    if (!isValidUrl(url)) { errMsg.hidden = false; input.focus(); return; }
    errMsg.hidden = true;
    results.hidden = true;
    loading.hidden = false;
    setTimeout(() => {
      const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      showResults([rng(42, 78), rng(65, 95), rng(75, 100), rng(70, 99)]);
    }, 2200);
  });

  if (input) input.addEventListener('input', () => { errMsg.hidden = true; });
}


/* ─── 08. FORMULARIO DE CONTACTO (Formspree) ─── */
/*
   CONFIGURACIÓN: Crea una cuenta en https://formspree.io, crea un nuevo
   formulario con el email info@brinkhub.es y reemplaza YOUR_FORM_ID
   por el identificador que te asignen (ej: xpzeqlrv).
*/
const FORMSPREE_ID = 'YOUR_FORM_ID';

function initContactForm() {
  const forms = document.querySelectorAll('.js-contact-form');
  forms.forEach(form => {
    const success = form.querySelector('.form-success');
    const errorEl = form.querySelector('.form-error');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = form.querySelector('[name="nombre"]');
      const email   = form.querySelector('[name="email"]');
      const web     = form.querySelector('[name="web"]');
      const message = form.querySelector('[name="mensaje"]');
      const consent = form.querySelector('[name="consent"]');
      let valid = true;

      [name, email, message].forEach(field => {
        if (!field) return;
        if (!field.value.trim()) { field.classList.add('is-error'); valid = false; }
        else field.classList.remove('is-error');
      });

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add('is-error'); valid = false;
      }

      if (consent && !consent.checked) {
        const consentGroup = consent.closest('.form-group');
        if (consentGroup) consentGroup.classList.add('is-error');
        valid = false;
      }

      if (!valid) { form.querySelector('.is-error')?.focus(); return; }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
      if (errorEl) errorEl.hidden = true;

      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            nombre:  name?.value.trim()    || '',
            email:   email?.value.trim()   || '',
            web:     web?.value.trim()     || '',
            mensaje: message?.value.trim() || ''
          })
        });

        if (res.ok) {
          form.querySelectorAll('input:not([type="checkbox"]), textarea').forEach(f => f.value = '');
          if (consent) consent.checked = false;
          if (btn) { btn.disabled = false; btn.textContent = 'Enviar mensaje'; }
          if (success) {
            success.hidden = false;
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setTimeout(() => { success.hidden = true; }, 7000);
          }
        } else {
          throw new Error('Error ' + res.status);
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = 'Enviar mensaje'; }
        if (errorEl) {
          errorEl.hidden = false;
        } else {
          window.location.href = `mailto:info@brinkhub.es?subject=${encodeURIComponent('Consulta desde brinkhub.es')}&body=${encodeURIComponent(`Nombre: ${name?.value}\nEmail: ${email?.value}\nWeb: ${web?.value}\n\n${message?.value}`)}`;
        }
      }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('is-error');
        const grp = field.closest('.form-group');
        if (grp) grp.classList.remove('is-error');
      });
    });
  });
}


/* ─── 09. NAV LINK ACTIVO ─── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link:not(.btn)');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}


/* ─── 10. BANNER DE COOKIES ─── */
function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const stored = localStorage.getItem('bh_cookies');
  if (stored) { banner.style.display = 'none'; return; }

  setTimeout(() => { banner.classList.add('is-visible'); }, 700);

  const accept  = document.getElementById('cookieAccept');
  const decline = document.getElementById('cookieDecline');

  const dismiss = (value) => {
    localStorage.setItem('bh_cookies', value);
    banner.classList.remove('is-visible');
    setTimeout(() => { banner.style.display = 'none'; }, 420);
  };

  if (accept)  accept.addEventListener('click',  () => dismiss('accepted'));
  if (decline) decline.addEventListener('click', () => dismiss('declined'));
}


/* ─── 11. FILTRO DE BLOG ─── */
function initBlogFilter() {
  const filters = document.querySelectorAll('.blog-filter[data-filter]');
  const cards   = document.querySelectorAll('.blog-card[data-category]');
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('is-active'));
      btn.classList.add('is-active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
      });
    });
  });
}


/* ─── 12. INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initCounters();
  initFAQ();
  initAnalyzer();
  initContactForm();
  initActiveNav();
  initCookieBanner();
  initBlogFilter();
});
