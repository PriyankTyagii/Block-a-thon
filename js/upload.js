// ── Upload pipeline simulation ─────────────────────

const DOC_CONFIGS = {
  aadhaar: {
    label: 'Aadhaar Card',
    fields: [
      { name: 'Full Name', val: 'Priya Sharma', conf: 97 },
      { name: 'Date of Birth', val: '14/08/1994', conf: 95 },
      { name: 'UID Number', val: '8675-XXXX-3421', conf: 99 },
      { name: 'Address', val: 'Dehradun, Uttarakhand', conf: 88 }
    ],
    origSize: 4.8, finalSize: 0.38, confScore: 96
  },
  income: {
    label: 'Income Certificate',
    fields: [
      { name: 'Applicant Name', val: 'Priya Sharma', conf: 94 },
      { name: 'Annual Income', val: '₹1,85,000', conf: 91 },
      { name: 'Issuing Authority', val: 'SDM Dehradun', conf: 96 },
      { name: 'Issue Date', val: '03/11/2023', conf: 98 }
    ],
    origSize: 3.2, finalSize: 0.27, confScore: 89
  },
  domicile: {
    label: 'Domicile Certificate',
    fields: [
      { name: 'Applicant Name', val: 'Priya Sharma', conf: 93 },
      { name: 'State', val: 'Uttarakhand', conf: 99 },
      { name: 'District', val: 'Dehradun', conf: 97 },
      { name: 'Certificate No.', val: 'UK-DDN-2022-8841', conf: 99 }
    ],
    origSize: 2.9, finalSize: 0.22, confScore: 94
  }
};

const uploadState = { aadhaar: false, income: false, domicile: false };

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function animateSize(el, from, to, duration) {
  const steps = 30;
  const stepTime = duration / steps;
  let cur = from;
  const delta = (from - to) / steps;
  return new Promise(resolve => {
    const iv = setInterval(() => {
      cur -= delta;
      if (cur <= to) { cur = to; clearInterval(iv); resolve(); }
      el.textContent = cur.toFixed(2) + ' MB';
    }, stepTime);
  });
}

function buildFieldHtml(fields) {
  return fields.map((f, i) =>
    `<div class="field-pop" style="animation-delay:${i*0.12}s">
      <span style="color:#555;font-size:11px;">${f.name}</span>
      <span style="color:#10b981;font-weight:700;margin-left:4px;">✓</span>
      <span style="font-size:11px;font-weight:600;margin-left:4px;">${f.val}</span>
      <span style="font-size:10px;color:#888;margin-left:4px;">(${f.conf}%)</span>
    </div>`
  ).join('');
}

async function runUploadPipeline(docKey, card) {
  const cfg = DOC_CONFIGS[docKey];
  const statusEl = card.querySelector('.upload-status');
  const progressBar = card.querySelector('.progress-bar');
  const progressWrap = card.querySelector('.progress-bar-wrap');

  card.classList.add('uploading');
  statusEl.innerHTML = `<div class="upload-step active">⬆ Uploading document...</div>
    <div class="progress-bar-wrap"><div class="progress-bar" style="width:0%"></div></div>`;

  // Step 1: Upload progress
  const bar = statusEl.querySelector('.progress-bar');
  for (let p = 0; p <= 100; p += 4) {
    bar.style.width = p + '%';
    await delay(30);
  }
  bar.style.background = '#f59e0b';
  await delay(200);

  // Step 2: Compression
  statusEl.innerHTML = `<div class="upload-step active">⚡ Compressing document...</div>
    <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:#f59e0b;"></div></div>
    <div style="margin-top:6px;">
      <span style="font-size:11px;color:#555;">File size: </span>
      <span class="size-counter">${cfg.origSize.toFixed(2)} MB</span>
    </div>`;
  const sizeEl = statusEl.querySelector('.size-counter');
  await animateSize(sizeEl, cfg.origSize, cfg.finalSize, 900);
  await delay(200);

  // Step 3: Preprocessing
  statusEl.innerHTML = `<div class="upload-step active">🔧 Preprocessing: deskewing + denoising...</div>
    <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--teal);"></div></div>
    <div style="margin-top:6px;font-size:11px;color:#888;">
      <span>Normalizing resolution</span>
      <span style="margin-left:8px;">Binarizing image</span>
    </div>`;
  await delay(700);

  // Step 4: OCR
  statusEl.innerHTML = `<div class="upload-step active">🔍 Extracting fields via OCR...</div>
    <div class="progress-bar-wrap"><div class="progress-bar" style="width:100%;background:var(--teal);"></div></div>
    <div style="margin-top:8px;">${buildFieldHtml(cfg.fields)}</div>`;
  await delay(cfg.fields.length * 130 + 400);

  // Step 5: Cross-validation
  statusEl.innerHTML = `<div class="upload-step active">🔗 Running cross-validation...</div>
    <div style="margin-top:6px;font-size:11px;color:#555;">Checking field consistency across documents...</div>`;
  await delay(700);

  // Final state
  card.classList.remove('uploading');
  card.classList.add('done');
  statusEl.innerHTML = `
    <div class="verified-badge">✓ Verified</div>
    <div class="conf-row">Confidence: <strong>${cfg.confScore}%</strong></div>
    <div class="conf-row" style="color:#10b981;">Saved ${((cfg.origSize - cfg.finalSize)/cfg.origSize*100).toFixed(0)}% bandwidth</div>
    <div class="conf-row" style="font-size:10px;color:#aaa;">${cfg.origSize}MB → ${cfg.finalSize}MB</div>`;
  uploadState[docKey] = true;
  checkAllDone();
}

function checkAllDone() {
  const allDone = Object.values(uploadState).every(Boolean);
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn && allDone) submitBtn.classList.add('ready');
  const note = document.getElementById('submit-note');
  if (note) {
    const done = Object.values(uploadState).filter(Boolean).length;
    note.textContent = `${done}/3 documents verified`;
  }
}

function initUpload() {
  document.querySelectorAll('.upload-card').forEach(card => {
    const docKey = card.dataset.doc;
    const fileInput = card.querySelector('input[type=file]');

    card.addEventListener('click', (e) => {
      if (uploadState[docKey] || card.classList.contains('uploading')) return;
      fileInput?.click();
    });

    fileInput?.addEventListener('change', () => {
      runUploadPipeline(docKey, card);
    });

    // Also allow click without file selection (demo mode)
    card.addEventListener('dblclick', () => {
      if (uploadState[docKey] || card.classList.contains('uploading')) return;
      runUploadPipeline(docKey, card);
    });
  });

  const submitBtn = document.getElementById('btn-submit');
  submitBtn?.addEventListener('click', () => {
    if (!submitBtn.classList.contains('ready')) return;
    submitBtn.textContent = '⏳ Submitting...';
    submitBtn.disabled = true;

    const appId = document.getElementById('app-id-val')?.textContent || ('UTK-2024-' + Math.floor(10000+Math.random()*89999));
    const name  = document.querySelector('input[placeholder*="Priya"]')?.value || 'Applicant';
    const mobile= document.querySelector('input[type=tel]')?.value || '9876500000';
    const svc   = document.querySelector('select')?.value || 'Income Certificate';
    const dist  = document.querySelectorAll('select')[1]?.value || 'Dehradun';

    if (typeof PramaanDB !== 'undefined') {
      PramaanDB.save({
        id: appId, name, mobile, service: svc, district: dist,
        status: 'approved', confidence: 94,
        submittedAt: new Date().toISOString(),
        timeline: [
          { status: 'submitted',  note: 'Application received via Apuni Sarkar portal', ts: new Date().toISOString() },
          { status: 'processing', note: 'PramaanAI pipeline started — compressing & extracting', ts: new Date(Date.now()+5000).toISOString() },
          { status: 'verified',   note: 'All 3 documents verified at 94% avg confidence', ts: new Date(Date.now()+28000).toISOString() },
          { status: 'approved',   note: 'Auto-approved by PramaanAI — officer notified', ts: new Date(Date.now()+35000).toISOString() },
        ]
      });
    }

    if (typeof onApplicationSubmitted !== 'undefined') {
      onApplicationSubmitted(appId);
    }

    setTimeout(() => {
      const modal = document.getElementById('success-modal');
      const idEl  = document.getElementById('success-app-id');
      if (idEl) idEl.textContent = appId;
      if (modal) modal.classList.remove('hidden');
    }, 1200);
  });

  document.getElementById('modal-close')?.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Generate app ID
  const appIdEl = document.getElementById('app-id-val');
  if (appIdEl) {
    const yr = new Date().getFullYear();
    appIdEl.textContent = 'UTK-' + yr + '-' + Math.floor(10000 + Math.random() * 89999);
  }
}

document.addEventListener('DOMContentLoaded', initUpload);
