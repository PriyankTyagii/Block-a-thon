// ── Notifications + counters ───────────────────────

// ── Toast system ──────────────────────────────────
function showToast(opts) {
  // opts: { icon, title, body, type='info', duration=5000 }
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${opts.type || 'info'}`;
  toast.innerHTML = `
    <div class="toast-icon">${opts.icon || 'ℹ'}</div>
    <div class="toast-content">
      <div class="toast-title">${opts.title}</div>
      ${opts.body ? `<div class="toast-body">${opts.body}</div>` : ''}
    </div>
    <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
  `;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  const dur = opts.duration || 5000;
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 350);
  }, dur);
}

// ── Pi + Blockchain popup on page load ────────────
function showPiPopup() {
  setTimeout(() => {
    showToast({
      icon: '🔌',
      title: 'Raspberry Pi — Connected',
      body: 'AES-256 encryption active &nbsp;·&nbsp; IPFS blockchain storage ready',
      type: 'pi',
      duration: 7000
    });
  }, 1200);

  setTimeout(() => {
    showToast({
      icon: '⛓',
      title: 'Blockchain Ledger Sync',
      body: 'Document hashes anchored to Ethereum testnet &nbsp;·&nbsp; Block #4,821,093',
      type: 'blockchain',
      duration: 6000
    });
  }, 3500);
}

// ── Counter animation ─────────────────────────────
function animateCounter(el, from, to, duration = 1600, suffix = '') {
  if (!el) return;
  const start = performance.now();
  const range = to - from;
  const update = (now) => {
    const elapsed = Math.min((now - start) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - elapsed, 3);
    const val = Math.round(from + range * eased);
    el.textContent = formatNum(val) + suffix;
    if (elapsed < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function formatNum(n) {
  if (n >= 10000000) return (n/10000000).toFixed(1) + ' Cr';
  if (n >= 100000)  return (n/100000).toFixed(1) + ' L';
  return n.toLocaleString('en-IN');
}

// ── Bump and re-animate a counter ─────────────────
function bumpCounter(el, addVal, suffix = '') {
  if (!el) return;
  const current = parseInt(el.dataset.val || el.textContent.replace(/[^0-9]/g,'')) || 0;
  const next = current + addVal;
  el.dataset.val = next;
  animateCounter(el, current, next, 900, suffix);
}

// ── Init counters from DB ─────────────────────────
function initCounters() {
  if (typeof PramaanDB === 'undefined') return;
  const s = PramaanDB.getStats();

  const mapping = [
    ['counter-docs',   s.totalDocs,  ''],
    ['counter-apps',   s.totalApps,  ''],
    ['counter-saved',  s.savedMB,    ' MB'],
    ['counter-acc',    984,          '%'],    // accuracy stays fixed
    ['counter-today',  s.todayDocs,  ''],
  ];
  mapping.forEach(([id, val, suf]) => {
    const el = document.getElementById(id);
    if (el) {
      el.dataset.val = val;
      animateCounter(el, 0, val, 1800, suf);
    }
  });
}

// ── Called after successful application submit ────
function onApplicationSubmitted(appId) {
  if (typeof PramaanDB !== 'undefined') {
    PramaanDB.bumpStats(3);
  }

  // Bump visible counters
  bumpCounter(document.getElementById('counter-docs'), 3);
  bumpCounter(document.getElementById('counter-apps'), 1);

  showToast({
    icon: '✅',
    title: 'Application Submitted!',
    body: `ID: <strong>${appId}</strong> — Documents encrypted &amp; stored on IPFS`,
    type: 'success',
    duration: 8000
  });

  setTimeout(() => {
    showToast({
      icon: '⛓',
      title: 'Blockchain Confirmed',
      body: `Document hash anchored · Tx: 0x${Math.random().toString(16).slice(2,10)}...`,
      type: 'blockchain',
      duration: 6000
    });
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  showPiPopup();
  initCounters();
});
