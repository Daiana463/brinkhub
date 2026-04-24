/* ============================================================
   BrinkHub — main.js
   01. Header scroll
   02. Menú móvil
   03. Smooth scroll
   04. Animaciones de scroll
   05. Contadores de estadísticas
   06. FAQ accordion
   07. Analizador de sitio (demo)
   08. Formulario de contacto
   09. Nav link activo
   10. Sistema de cookies (RGPD + Consent Mode v2)
   11. Filtro de blog
   12. Init
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
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ─── 04. ANIMACIONES DE SCROLL ─── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  elements.forEach(el => observer.observe(el));
}


/* ─── 05. CONTADORES ─── */
function animateCounter(el, target, duration = 3200) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target;
    return;
  }
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
      if (entry.isIntersecting) {
        animateCounter(entry.target, parseInt(entry.target.dataset.target, 10));
        observer.unobserve(entry.target);
      }
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
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      body.classList.toggle('is-open', !isOpen);
    });
  });
}


/* ─── 07. ANALIZADOR (demo) ─── */
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

  const colorForScore = (s) => s >= 90 ? '#22c55e' : s >= 50 ? '#f97316' : '#ef4444';

  const animateRing = (arc, score) => {
    if (!arc) return;
    const c = 2 * Math.PI * 15.91;
    arc.style.transition = 'stroke-dasharray 1s ease-out, stroke 0.3s';
    arc.style.strokeDasharray = `${(score / 100) * c} ${c - (score / 100) * c}`;
    arc.style.stroke = colorForScore(score);
  };

  const showResults = (scores) => {
    const keys = ['perf', 'acc', 'bp', 'seo'];
    loading.hidden = true;
    results.hidden = false;
    keys.forEach((key, i) => {
      const el = scoreEls[key];
      if (!el) return;
      const score = scores[i];
      let val = 0;
      const iv = setInterval(() => {
        val = Math.min(val + Math.ceil(score / 20), score);
        el.textContent = val;
        if (val >= score) clearInterval(iv);
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


/* ─── 08. FORMULARIO DE CONTACTO ─── */
/*
   CONFIGURACIÓN FORMSPREE:
   1. Crea cuenta gratuita en https://formspree.io
   2. Crea formulario apuntando a info@brinkhub.es
   3. Reemplaza 'YOUR_FORM_ID' con el ID asignado (ej: xpzeqlrv)

   Si el ID no está configurado, el formulario usa mailto como fallback.
*/
const FORMSPREE_ID = 'YOUR_FORM_ID';

function showFormSuccess(form) {
  const success = form.querySelector('.form-success');
  const btn = form.querySelector('button[type="submit"]');
  const consent = form.querySelector('[name="consent"]');
  form.querySelectorAll('input:not([type="checkbox"]), textarea').forEach(f => { f.value = ''; });
  if (consent) consent.checked = false;
  if (btn) { btn.disabled = false; btn.textContent = 'Enviar mensaje'; }
  if (success) {
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { success.hidden = true; }, 8000);
  }
}

function initContactForm() {
  document.querySelectorAll('.js-contact-form').forEach(form => {
    const errorEl = form.querySelector('.form-error');
    let submitting = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitting) return;

      const f = {
        name:     form.querySelector('[name="nombre"]'),
        email:    form.querySelector('[name="email"]'),
        empresa:  form.querySelector('[name="empresa"]'),
        web:      form.querySelector('[name="web"]'),
        message:  form.querySelector('[name="mensaje"]'),
        consent:  form.querySelector('[name="consent"]'),
        honeypot: form.querySelector('[name="website"]'),
      };

      /* Anti-spam: bots rellenan el campo oculto */
      if (f.honeypot && f.honeypot.value.trim()) return;

      let valid = true;

      [f.name, f.email, f.message, f.empresa].forEach(field => {
        if (!field) return;
        const ok = !!field.value.trim();
        field.classList.toggle('is-error', !ok);
        field.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) valid = false;
      });

      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) {
        f.email.classList.add('is-error');
        f.email.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (f.consent && !f.consent.checked) {
        f.consent.closest('.form-group')?.classList.add('is-error');
        valid = false;
      }

      if (!valid) { form.querySelector('.is-error')?.focus(); return; }

      const btn = form.querySelector('button[type="submit"]');
      submitting = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
      if (errorEl) errorEl.hidden = true;

      const payload = {
        nombre:  f.name?.value.trim()    || '',
        email:   f.email?.value.trim()   || '',
        empresa: f.empresa?.value.trim() || '',
        web:     f.web?.value.trim()     || '',
        mensaje: f.message?.value.trim() || '',
      };

      if (FORMSPREE_ID !== 'YOUR_FORM_ID') {
        try {
          const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(res.status);
          showFormSuccess(form);
        } catch {
          if (btn) { btn.disabled = false; btn.textContent = 'Enviar mensaje'; }
          if (errorEl) errorEl.hidden = false;
        }
      } else {
        /* Fallback mailto cuando Formspree no está configurado */
        const subject = encodeURIComponent('Consulta desde brinkhub.es');
        const body = encodeURIComponent(
          `Nombre: ${payload.nombre}\nEmail: ${payload.email}\nEmpresa: ${payload.empresa}\nWeb: ${payload.web}\n\n${payload.mensaje}`
        );
        window.open(`mailto:info@brinkhub.es?subject=${subject}&body=${body}`, '_blank');
        showFormSuccess(form);
      }

      submitting = false;
    });

    /* Limpiar errores al escribir */
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('is-error');
        field.setAttribute('aria-invalid', 'false');
        field.closest('.form-group')?.classList.remove('is-error');
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


/* ─── 10. SISTEMA DE COOKIES (RGPD + LSSI + Consent Mode v2) ─── */

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║  IDS DE TRACKING — configurar cuando estén disponibles      ║
  ║  Mientras estén vacíos, ningún script de tracking se carga  ║
  ╚══════════════════════════════════════════════════════════════╝

  GA4_ID:        ID de Google Analytics 4  (ej: 'G-XXXXXXXXXX')
  GTM_ID:        ID de Google Tag Manager  (ej: 'GTM-XXXXXXX')
  META_PIXEL_ID: ID de Meta Pixel          (ej: '1234567890123')
*/
const GA4_ID        = '';   // 'G-XXXXXXXXXX'
const GTM_ID        = '';   // 'GTM-XXXXXXX'
const META_PIXEL_ID = '';   // '1234567890123'

const CONSENT_KEY     = 'bh_consent';
const CONSENT_VERSION = '2';

/*
  initConsentModeDefaults():
  Garantiza que window.gtag exista y los defaults estén aplicados
  aunque GTM/GA4 no estén cargados. El inline script en <head>
  ya habrá ejecutado esto antes, pero esta función sirve de respaldo
  y para cuando se añada GTM posteriormente.
*/
function initConsentModeDefaults() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() { window.dataLayer.push(arguments); };
  }
  window.gtag('consent', 'default', {
    ad_storage:            'denied',
    analytics_storage:     'denied',
    ad_user_data:          'denied',
    ad_personalization:    'denied',
    functionality_storage: 'granted',
    security_storage:      'granted',
    wait_for_update:       500,
  });
}

function updateConsentMode(prefs) {
  /* gtag siempre existe porque initConsentModeDefaults lo garantiza */
  window.gtag('consent', 'update', {
    ad_storage:         prefs.marketing ? 'granted' : 'denied',
    analytics_storage:  prefs.analytics ? 'granted' : 'denied',
    ad_user_data:       prefs.marketing ? 'granted' : 'denied',
    ad_personalization: prefs.marketing ? 'granted' : 'denied',
  });
}

/* loadAnalytics: carga GA4 o GTM solo tras consentimiento analítica */
function loadAnalytics() {
  if (!GA4_ID && !GTM_ID) return;
  if (document.querySelector('script[data-bh-analytics]')) return;

  if (GTM_ID) {
    const s = document.createElement('script');
    s.dataset.bhAnalytics = '1';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(s);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  } else if (GA4_ID) {
    const s = document.createElement('script');
    s.dataset.bhAnalytics = '1';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  }
}

/* loadMarketing: carga Meta Pixel solo tras consentimiento marketing */
function loadMarketing() {
  if (!META_PIXEL_ID) return;
  if (document.querySelector('script[data-bh-marketing]')) return;

  /* Meta Pixel — carga dinámica para no ejecutar antes de consentimiento */
  (function(f,b,e,v,n,t,s){
    if(f.fbq)return;
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=!0;t.dataset.bhMarketing='1';t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js'));
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function saveConsent(prefs) {
  const data = {
    v:           CONSENT_VERSION,
    ts:          Date.now(),
    necessary:   true,
    analytics:   !!prefs.analytics,
    marketing:   !!prefs.marketing,
    preferences: !!prefs.preferences,
  };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(data)); } catch (_) {}
  return data;
}

function loadConsentData() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.v === CONSENT_VERSION ? data : null;
  } catch { return null; }
}

function applyConsent(prefs) {
  updateConsentMode(prefs);
  if (prefs.analytics)  loadAnalytics();
  if (prefs.marketing)  loadMarketing();
}

/* Inyecta el modal en el DOM una sola vez (funciona en todas las páginas) */
function createCookieModal() {
  if (document.getElementById('cookieModal')) return;

  const modal = document.createElement('div');
  modal.id = 'cookieModal';
  modal.className = 'cookie-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Preferencias de privacidad');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="cookie-modal__overlay" id="cookieModalOverlay"></div>
    <div class="cookie-modal__panel">
      <div class="cookie-modal__header">
        <h2 class="cookie-modal__title">Preferencias de privacidad</h2>
        <button class="cookie-modal__close" id="cookieModalClose" aria-label="Cerrar panel de preferencias">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="cookie-modal__body">
        <p class="cookie-modal__desc">Elige qué categorías de cookies aceptas. Puedes cambiar estas preferencias en cualquier momento desde el pie de página. Las cookies necesarias no se pueden desactivar.</p>
        <div class="cookie-category">
          <div class="cookie-category__header">
            <div class="cookie-category__info">
              <strong>Necesarias</strong>
              <p>Esenciales para el funcionamiento básico del sitio: sesión, seguridad y navegación. No almacenan información personal identificable.</p>
            </div>
            <span class="cookie-toggle__always-on">Siempre activas</span>
          </div>
        </div>
        <div class="cookie-category">
          <div class="cookie-category__header">
            <div class="cookie-category__info">
              <strong>Analítica</strong>
              <p>Nos ayudan a entender cómo interactúan los visitantes con el sitio. Toda la información es anónima y agregada (p.ej. Google Analytics).</p>
            </div>
            <label class="cookie-toggle__switch" aria-label="Activar cookies de analítica">
              <input type="checkbox" id="cookie-analytics" name="analytics">
              <span class="cookie-toggle__track"></span>
            </label>
          </div>
        </div>
        <div class="cookie-category">
          <div class="cookie-category__header">
            <div class="cookie-category__info">
              <strong>Marketing</strong>
              <p>Permiten mostrar publicidad personalizada basada en tus intereses en plataformas como Google o Meta (Facebook / Instagram).</p>
            </div>
            <label class="cookie-toggle__switch" aria-label="Activar cookies de marketing">
              <input type="checkbox" id="cookie-marketing" name="marketing">
              <span class="cookie-toggle__track"></span>
            </label>
          </div>
        </div>
        <div class="cookie-category">
          <div class="cookie-category__header">
            <div class="cookie-category__info">
              <strong>Preferencias</strong>
              <p>Recuerdan configuraciones personalizadas como idioma preferido o ajustes de visualización del contenido.</p>
            </div>
            <label class="cookie-toggle__switch" aria-label="Activar cookies de preferencias">
              <input type="checkbox" id="cookie-preferences" name="preferences">
              <span class="cookie-toggle__track"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="cookie-modal__footer">
        <button id="cookieSavePrefs" class="btn btn--primary btn--full">Guardar mis preferencias</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
}

function openCookieModal() {
  createCookieModal();
  const modal = document.getElementById('cookieModal');
  if (!modal) return;

  /* Cargar preferencias actuales en los toggles */
  const stored = loadConsentData() || {};
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
  set('cookie-analytics',   stored.analytics);
  set('cookie-marketing',   stored.marketing);
  set('cookie-preferences', stored.preferences);

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('cookieModalClose')?.focus(), 50);
}

function closeCookieModal() {
  const modal = document.getElementById('cookieModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function dismissBanner(prefs) {
  const banner = document.getElementById('cookieBanner');
  const saved  = saveConsent(prefs);
  applyConsent(saved);
  if (banner) {
    banner.classList.remove('is-visible');
    setTimeout(() => { banner.style.display = 'none'; }, 420);
  }
}

function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  /* Aplicar consent mode defaults antes de todo */
  initConsentModeDefaults();

  const stored = loadConsentData();
  if (stored) {
    banner.style.display = 'none';
    applyConsent(stored);
    return;
  }

  /* Añadir botón "Gestionar" si el HTML solo tiene 2 botones */
  const actions = banner.querySelector('.cookie-banner__actions');
  if (actions && !document.getElementById('cookieManage')) {
    const btn = document.createElement('button');
    btn.id = 'cookieManage';
    btn.className = 'btn btn--ghost btn--sm';
    btn.textContent = 'Gestionar';
    actions.insertBefore(btn, actions.firstChild);
  }

  setTimeout(() => banner.classList.add('is-visible'), 700);

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    dismissBanner({ analytics: true, marketing: true, preferences: true });
  });
  document.getElementById('cookieDecline')?.addEventListener('click', () => {
    dismissBanner({ analytics: false, marketing: false, preferences: false });
  });
  document.getElementById('cookieManage')?.addEventListener('click', openCookieModal);
}

function initCookieModal() {
  /* Delegación de eventos: el modal puede crearse después */
  document.addEventListener('click', (e) => {
    if (e.target.id === 'cookieModalClose' || e.target.closest('#cookieModalClose')) {
      closeCookieModal();
    }
    if (e.target.id === 'cookieModalOverlay') {
      closeCookieModal();
    }
    if (e.target.id === 'cookieSavePrefs') {
      const prefs = {
        analytics:   document.getElementById('cookie-analytics')?.checked   || false,
        marketing:   document.getElementById('cookie-marketing')?.checked   || false,
        preferences: document.getElementById('cookie-preferences')?.checked || false,
      };
      dismissBanner(prefs);
      closeCookieModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('cookieModal');
      if (modal?.classList.contains('is-open')) closeCookieModal();
    }
  });
}

/* Enlace "Preferencias de cookies" en el footer (todas las páginas) */
function initCookieSettingsLinks() {
  document.querySelectorAll('[data-cookie-settings]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openCookieModal(); });
  });
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
  initCookieModal();
  initCookieSettingsLinks();
  initBlogFilter();
});
