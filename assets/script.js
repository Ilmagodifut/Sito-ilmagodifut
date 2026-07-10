// Menu mobile
const mobileBtn = document.querySelector('.nav-mobile-btn');
const mobileMenu = document.getElementById('mobileMenu');
mobileBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  mobileBtn.setAttribute('aria-expanded', isOpen);
  mobileBtn.textContent = isOpen ? '✕' : '☰';
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  mobileBtn.setAttribute('aria-expanded', 'false');
  mobileBtn.textContent = '☰';
}));

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('section .container > *');
revealEls.forEach(el => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Animazione demo Telegram (solo pagina Servizi)
const tgScrollEl = document.getElementById('tgScroll');
if (tgScrollEl) {
  const tgMessages = [
    {type:'buy', text:'🟢 <b>Compra</b> Virgil 90 &lt; 30K'},
    {type:'buy', text:'🟢 <b>Compra</b> Donnarumma 89 &lt; 20K'},
    {type:'sell', text:'🔴 <b>Vendi</b> Virgil 90 &gt; 45K 💰'},
    {type:'buy', text:'🟢 <b>Compra</b> qualsiasi TOTW &lt; 12K'},
    {type:'sell', text:'🔴 <b>Vendi</b> Donnarumma 89 &gt; 30K 💰'},
    {type:'sell', text:'🔴 <b>Vendi</b> TOTW &gt; 20K 💰'},
    {type:'buy', text:'🟢 <b>Compra</b> Rashford 80 &lt; 5K'},
    {type:'sell', text:'🔴 <b>Vendi</b> Rashford 80 &gt; 9K 💰'},
    {type:'final', text:'💰 Fare profitto non è mai stato così semplice, ti basterà seguire le istruzioni.'},
  ];
  const tgBodyHeight = 480 - 68;
  let tgI = 0;

  function tgAddMessage() {
    const msg = tgMessages[tgI % tgMessages.length];
    const div = document.createElement('div');
    div.className = 'bubble ' + msg.type;
    div.innerHTML = msg.text;
    tgScrollEl.appendChild(div);

    requestAnimationFrame(() => {
      const contentHeight = tgScrollEl.scrollHeight;
      const offset = Math.max(0, contentHeight - tgBodyHeight);
      tgScrollEl.style.transform = `translateY(-${offset}px)`;
    });

    tgI++;
    if (tgI % tgMessages.length === 0) {
      setTimeout(() => {
        tgScrollEl.innerHTML = '';
        tgScrollEl.style.transform = 'translateY(0)';
        setTimeout(tgLoop, 600);
      }, 2800);
    } else {
      setTimeout(tgLoop, msg.type === 'final' ? 0 : 1300);
    }
  }
  function tgLoop() { tgAddMessage(); }
  tgLoop();
}

// ── GESTIONE CONSENSO COOKIE ──
(function () {
  const CONSENT_KEY = 'mago_fut_cookie_consent';

  function loadAnalytics() {
    if (!window.GA_MEASUREMENT_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + window.GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', window.GA_MEASUREMENT_ID);
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function showBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.style.display = 'flex';
  }
  function hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.style.display = 'none';
  }

  // Espone una funzione globale per riaprire il banner (usata dalla pagina Cookie Policy)
  window.reopenCookieBanner = function () {
    showBanner();
  };

  document.addEventListener('DOMContentLoaded', function () {
    const consent = getConsent();
    if (consent === 'accepted') {
      loadAnalytics();
    } else if (consent !== 'rejected') {
      showBanner();
    }

    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');
    if (acceptBtn) acceptBtn.addEventListener('click', function () {
      setConsent('accepted');
      loadAnalytics();
      hideBanner();
    });
    if (rejectBtn) rejectBtn.addEventListener('click', function () {
      setConsent('rejected');
      hideBanner();
    });
  });
})();
