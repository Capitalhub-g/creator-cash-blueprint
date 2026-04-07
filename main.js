/* ══════════════════════════════════════════
   CREATOR CASH BLUEPRINT — JAVASCRIPT
══════════════════════════════════════════ */

// ── Navbar scroll ────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ── Hamburger ────────────────────────────
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');

burger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) {
    mobileNav.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => s.style.transform = '');
  }
});

// Close on link tap
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => s.style.transform = '');
  });
});

// ── Intersection Observer Animations ─────
const animItems = document.querySelectorAll('[data-aos]');

const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('[data-aos]')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('in');
      }, idx * 100);
      aosObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animItems.forEach(el => aosObserver.observe(el));

// ── FAQ Accordion ─────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');

  q.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = '0';
    });

    if (!wasOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ── Smooth anchor scroll ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: 'smooth'
      });
    }
  });
});

// ── Checkout Modal ───────────────────────
const modal = document.getElementById('modal');

function openCheckout(name, price, method = 'card') {
  document.getElementById('modal-title').textContent = name;
  document.getElementById('modal-subtitle').textContent = `${name} — $${price}`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Set active tab
  const tabs = document.querySelectorAll('.pay-tab');
  tabs.forEach(t => t.classList.remove('on'));
  if (method === 'paypal') {
    tabs[1].classList.add('on');
    document.getElementById('cardPane').style.display = 'none';
    document.getElementById('paypalPane').style.display = 'block';
  } else {
    tabs[0].classList.add('on');
    document.getElementById('cardPane').style.display = 'block';
    document.getElementById('paypalPane').style.display = 'none';
  }
}

function closeCheckout() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeCheckout();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCheckout();
});

function switchTab(type, btn) {
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('cardPane').style.display = type === 'card' ? 'block' : 'none';
  document.getElementById('paypalPane').style.display = type === 'paypal' ? 'block' : 'none';
}

function processCheckout() {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span style="opacity:.6">Processing...</span>';
  btn.disabled = true;

  setTimeout(() => {
    closeCheckout();
    btn.innerHTML = orig;
    btn.disabled = false;

    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);

    // Production: redirect to download page
    // window.location.href = 'download.html';
  }, 1800);
}

// ── Input formatting ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const cardNum = document.getElementById('cardNum');
  if (cardNum) {
    cardNum.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const expiry = document.getElementById('expiry');
  if (expiry) {
    expiry.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
      e.target.value = v;
    });
  }
});

// ── Marquee pause on hover ───────────────
const trustInner = document.querySelector('.trust-inner');
if (trustInner) {
  trustInner.addEventListener('mouseenter', () => {
    trustInner.style.animationPlayState = 'paused';
  });
  trustInner.addEventListener('mouseleave', () => {
    trustInner.style.animationPlayState = 'running';
  });
}

// ── Active nav highlight ─────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const secObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id
          ? 'rgba(255,255,255,0.9)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => secObserver.observe(s));