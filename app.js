// Utility: clamp progress bar width on scroll
const progressEl = document.querySelector('.page-progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop || document.body.scrollTop);
  const height = h.scrollHeight - h.clientHeight;
  const progress = Math.min(100, Math.max(0, (scrolled / height) * 100));
  if (progressEl) progressEl.style.width = `${progress}%`;
});

// Mobile nav toggle
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
  });
}

// Scrollspy: highlight nav item for active section
const sectionIds = ['home', 'intro', 'about', 'experience', 'projects', 'skills', 'education', 'contact'];
const linkMap = new Map();
document.querySelectorAll('.nav-links a').forEach(a => {
  const hash = a.getAttribute('href');
  if (hash && hash.startsWith('#')) linkMap.set(hash.slice(1), a);
});

// Ensure Home is highlighted on initial load/top of page
function setActive(id) {
  linkMap.forEach(a => a.classList.remove('active'));
  const el = linkMap.get(id);
  if (el) el.classList.add('active');
}
setActive('home');

const spyObserver = new IntersectionObserver((entries) => {
  // pick the entry nearest to the top that is intersecting
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
  if (visible.length === 0) return;
  const id = visible[0].target.id;
  if (!id) return;
  setActive(id);
}, { rootMargin: '-30% 0px -65% 0px', threshold: [0, 0.25, 0.5, 1] });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) spyObserver.observe(el);
});

// If user is at the absolute top, keep Home highlighted
window.addEventListener('scroll', () => {
  if ((window.scrollY || document.documentElement.scrollTop) <= 8) {
    setActive('home');
  }
});

// Projects data from resume image
const projects = [
  {
    title: 'HVAC Warehouse',
    year: 'Feb 2025 – Present',
    summary: 'E‑commerce platform for purchasing HVAC products with admin for listings, inventory, orders, and ops oversight.',
    link: 'https://dev.hvacwarehouse.com.au/',
    image: 'hvac.webp'
  },
  {
    title: 'Airvent',
    year: 'Jan 2025 – Jun 2025',
    summary: 'Advanced search and filtering for efficient product discovery, intuitive browsing, and precise admin oversight.',
    link: 'https://dev.airvent.com.au/',
    image: 'airvent.webp'
  },
  {
    title: 'UPC',
    year: 'Sep 2024 – Mar 2025',
    summary: 'Dynamic search/filtering for product discovery and streamlined browsing with accurate information control.',
    link: 'http://dev.unitechmeter.com/',
    image: 'upc.webp'
  },
  {
    title: 'TutelageX',
    year: 'Jan 2025 – Feb 2025',
    summary: 'Mentorship‑driven platform helping MBA aspirants craft unique applications and tailored guidance.',
    link: 'https://tutelagex.com/',
    image: 'tutelagex.webp'
  },
  {
    title: 'Immigration Pointer — Australia',
    year: 'Jul 2024 – Sep 2024',
    summary: 'Cross‑functional collaboration to enhance project quality, ensuring seamless functionality and UX.',
    link: 'https://immigrationpointer.com.au/',
    image: 'immigration-pointer-au.webp'
  },
  {
    title: 'Immigration Pointer',
    year: 'Jul 2024 – Sep 2024',
    summary: 'Partnered to deliver and refine the platform with a focus on usability and performance.',
    link: 'https://immigrationpointer.in/',
    image: 'immigration-pointer-in.webp'
  },
];

const grid = document.getElementById('projectsGrid');
if (grid) {
  const fragment = document.createDocumentFragment();
  projects.forEach(p => {
    const a = document.createElement('a');
    a.href = p.link;
    a.className = 'project reveal';
    a.target = p.link.startsWith('#') ? '' : '_blank';
    a.rel = 'noreferrer noopener';
    a.innerHTML = `
      <div class="thumb">
        <img src="img/${p.image}" alt="${p.title} thumbnail" loading="lazy" decoding="async" />
      </div>
      <div class="content">
        <h3>${p.title}</h3>
        <div class="meta">${p.summary} • ${p.year}</div>
      </div>
    `;
    fragment.appendChild(a);
  });
  grid.appendChild(fragment);
}

// Reveal on scroll
const io = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Contact form: AJAX with FormSubmit (no redirect) or fallback demo
const form = document.getElementById('contact-form');
if (form) {
  const usesFormSubmit = /formsubmit\.co/.test(form.getAttribute('action') || '');
  const ensureStatusEl = () => {
    let el = form.querySelector('.form-status');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-status';
      form.appendChild(el);
    }
    return el;
  };

  const setButtonLoading = (btn, loading) => {
    if (!btn) return;
    if (loading) {
      btn.dataset.original = btn.innerHTML;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Sending…';
      btn.classList.add('is-loading');
      btn.disabled = true;
    } else {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      btn.innerHTML = btn.dataset.original || 'Send Message';
    }
  };

  if (usesFormSubmit) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = ensureStatusEl();
      statusEl.textContent = '';
      const btn = form.querySelector('button[type="submit"]');
      setButtonLoading(btn, true);

      // Build AJAX endpoint for FormSubmit
      const action = form.getAttribute('action') || '';
      let ajaxUrl = '';
      try {
        const u = new URL(action);
        ajaxUrl = `${u.origin}/ajax${u.pathname}`;
      } catch (_) {
        ajaxUrl = action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
      }

      try {
        const fd = new FormData(form);
        const res = await fetch(ajaxUrl, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.success || data.message || data.result !== 'error')) {
          statusEl.textContent = 'Thanks! Your message has been sent.';
          form.reset();
        } else {
          statusEl.textContent = (data.message || 'Unable to send right now. Please try again later.');
        }
      } catch (err) {
        statusEl.textContent = 'Network error. Please check your connection and try again.';
      } finally {
        setButtonLoading(btn, false);
      }
    });
  } else {
    // Demo fallback (no external service)
    const statusEl = ensureStatusEl();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.email || !data.message || !data.subject) {
        statusEl.textContent = 'Please fill in all fields.';
        return;
      }
      setButtonLoading(btn, true);
      await new Promise(r => setTimeout(r, 900));
      statusEl.textContent = 'Thanks! Your message has been queued. I will get back to you shortly.';
      form.reset();
      setButtonLoading(btn, false);
    });
  }

  // If coming from previous behavior (?sent), still show a banner
  const url = new URL(window.location.href);
  if (url.searchParams.get('sent') === '1') {
    const note = document.createElement('div');
    note.className = 'banner success';
    note.textContent = 'Thanks! Your message has been sent.';
    form.parentElement?.insertBefore(note, form);
  }
}

// Floating WhatsApp button
(() => {
  const phone = '+919057623407';
  const prefilled = encodeURIComponent('Hi Raman! I just visited your portfolio and would like to discuss a project.');
  const waUrl = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${prefilled}`;
  const btn = document.createElement('a');
  btn.href = waUrl;
  btn.className = 'whatsapp-fab';
  btn.target = '_blank';
  btn.rel = 'noreferrer noopener';
  btn.setAttribute('aria-label', 'Chat on WhatsApp');
  btn.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i>';
  document.body.appendChild(btn);
})();


