// ── Shared utilities ───────────────────────────────

const CAPTCHAS = ['kpa4sg','Xm7wR2','Bn9qLp','dF3kZv','Rw6jYt','mT8sNx'];

function randomCaptcha() {
  return CAPTCHAS[Math.floor(Math.random() * CAPTCHAS.length)];
}

function setCaptcha(imgEl) {
  imgEl.textContent = randomCaptcha();
}

function initAccessBar() {
  const sizes = { 'A-': '14px', 'A': '16px', 'A+': '18px' };
  document.querySelectorAll('.font-btns button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.font-btns button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.body.style.fontSize = sizes[btn.textContent] || '16px';
    });
  });
}

function initLoginTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.login-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  const captchaImg = document.querySelector('.captcha-img');
  const refreshBtn = document.querySelector('.refresh-btn');
  if (captchaImg) captchaImg.textContent = randomCaptcha();
  if (refreshBtn) refreshBtn.addEventListener('click', () => setCaptcha(captchaImg));

  const pwInput = document.querySelector('input[type=password]');
  const eyeBtn  = document.querySelector('.pw-eye');
  if (pwInput && eyeBtn) {
    eyeBtn.addEventListener('click', () => {
      pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
      eyeBtn.textContent = pwInput.type === 'password' ? '👁' : '🙈';
    });
  }

  document.querySelector('.btn-signin')?.addEventListener('click', () => {
    window.location.href = 'officer.html';
  });
  document.querySelector('.btn-parichay')?.addEventListener('click', () => {
    window.location.href = 'officer.html';
  });
}

function markActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

function formatAppId() {
  const yr = new Date().getFullYear();
  return 'UTK-' + yr + '-' + Math.floor(10000 + Math.random() * 89999);
}

document.addEventListener('DOMContentLoaded', () => {
  initAccessBar();
  markActiveNav();
  if (document.querySelector('.login-tabs')) initLoginTabs();
  const badge = document.getElementById('pi-appid');
  if (badge) badge.textContent = formatAppId();
});
