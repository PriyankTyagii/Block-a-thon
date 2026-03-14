// ── Officer dashboard ──────────────────────────────

const APPLICATIONS = [
  {
    id: 'UTK-2024-18834', name: 'Priya Sharma', district: 'Dehradun',
    service: 'Income Certificate', docs: ['Aadhaar','Income Cert'],
    confidence: 96, status: 'approved',
    fields: [
      { field: 'Full Name',   val: 'Priya Sharma',       conf: 97, status: 'pass' },
      { field: 'Date of Birth', val: '14/08/1994',        conf: 95, status: 'pass' },
      { field: 'UID Number',  val: '8675-XXXX-3421',     conf: 99, status: 'pass' },
      { field: 'Address',     val: 'Dehradun, UK',        conf: 88, status: 'pass' },
      { field: 'District match', val: 'Dehradun = Dehradun', conf: '-', status: 'pass' },
    ],
    compression: { orig: '14.2 MB', opt: '1.1 MB', saved: '92.3%' },
    docs3: ['aadhaar','income']
  },
  {
    id: 'UTK-2024-18835', name: 'Rakesh Kumar Negi', district: 'Pauri Garhwal',
    service: 'Domicile Certificate', docs: ['Aadhaar','Domicile'],
    confidence: 91, status: 'approved',
    fields: [
      { field: 'Full Name',  val: 'Rakesh Kumar Negi', conf: 94, status: 'pass' },
      { field: 'DOB',        val: '22/03/1988',         conf: 92, status: 'pass' },
      { field: 'UID',        val: '5541-XXXX-7782',     conf: 99, status: 'pass' },
      { field: 'State',      val: 'Uttarakhand',         conf: 99, status: 'pass' },
      { field: 'District',   val: 'Pauri = Pauri',       conf: '-', status: 'pass' },
    ],
    compression: { orig: '9.8 MB', opt: '0.84 MB', saved: '91.4%' },
    docs3: ['aadhaar','domicile']
  },
  {
    id: 'UTK-2024-18836', name: 'Sunita Rawat', district: 'Haridwar',
    service: 'Caste Certificate', docs: ['Aadhaar','Income Cert','Domicile'],
    confidence: 78, status: 'review',
    reason: 'Name mismatch: "Sunita" vs "S. Rawat" across documents',
    fields: [
      { field: 'Name (Aadhaar)',    val: 'Sunita Rawat',  conf: 91, status: 'pass' },
      { field: 'Name (Income)',     val: 'S. Rawat',       conf: 88, status: 'warn' },
      { field: 'DOB',               val: '07/12/1995',     conf: 90, status: 'pass' },
      { field: 'District match',    val: 'Haridwar ≠ Rishikesh', conf: '-', status: 'fail' },
    ],
    compression: { orig: '18.5 MB', opt: '1.52 MB', saved: '91.8%' },
    docs3: ['aadhaar','income','domicile']
  },
  {
    id: 'UTK-2024-18837', name: 'Mohan Singh Bisht', district: 'Almora',
    service: 'Scholarship Application', docs: ['Aadhaar','Caste Cert'],
    confidence: 99, status: 'approved',
    fields: [
      { field: 'Full Name', val: 'Mohan Singh Bisht', conf: 99, status: 'pass' },
      { field: 'DOB',       val: '14/05/2001',         conf: 98, status: 'pass' },
      { field: 'Category',  val: 'SC',                 conf: 97, status: 'pass' },
      { field: 'District',  val: 'Almora = Almora',    conf: '-', status: 'pass' },
    ],
    compression: { orig: '11.2 MB', opt: '0.92 MB', saved: '91.8%' },
    docs3: ['aadhaar','domicile']
  },
  {
    id: 'UTK-2024-18838', name: 'Kavita Devi', district: 'Pithoragarh',
    service: 'Income Certificate', docs: ['Aadhaar'],
    confidence: 45, status: 'flagged',
    reason: 'Address district mismatch + very low OCR confidence on document',
    fields: [
      { field: 'Full Name', val: 'Kavita Devi',    conf: 62, status: 'warn' },
      { field: 'DOB',       val: '?? /??/19??',     conf: 28, status: 'fail' },
      { field: 'Address',   val: 'Illegible',       conf: 15, status: 'fail' },
      { field: 'District',  val: 'Pithoragarh ≠ Almora', conf: '-', status: 'fail' },
    ],
    compression: { orig: '6.1 MB', opt: '0.49 MB', saved: '91.9%' },
    docs3: ['aadhaar']
  },
  {
    id: 'UTK-2024-18840', name: 'Deepak Joshi', district: 'Tehri Garhwal',
    service: 'Domicile Certificate', docs: ['Aadhaar','Income Cert','Domicile'],
    confidence: 88, status: 'review',
    reason: 'Income certificate date appears expired (> 6 months old)',
    fields: [
      { field: 'Full Name',    val: 'Deepak Joshi', conf: 96, status: 'pass' },
      { field: 'DOB',          val: '30/09/1990',    conf: 93, status: 'pass' },
      { field: 'Income Cert Date', val: '01/02/2023', conf: 98, status: 'warn' },
      { field: 'District',     val: 'Tehri = Tehri', conf: '-', status: 'pass' },
    ],
    compression: { orig: '16.9 MB', opt: '1.38 MB', saved: '91.8%' },
    docs3: ['aadhaar','income','domicile']
  }
];

function statusBadge(status, reason) {
  if (status === 'approved') return `<span class="tag-green">✓ Auto-Approved</span>`;
  if (status === 'flagged')  return `<span class="tag-red">⚠ Flagged</span>`;
  return `<span class="tag-amber">↻ Review Needed</span>`;
}

function confClass(c) {
  if (c >= 90) return 'high';
  if (c >= 70) return 'mid';
  return 'low';
}

function fieldStatusIcon(s) {
  if (s === 'pass') return `<span class="pass">✓ PASS</span>`;
  if (s === 'warn') return `<span class="warn">⚠ WARN</span>`;
  return `<span class="fail">✗ FAIL</span>`;
}

function buildTableRows() {
  const tbody = document.getElementById('app-tbody');
  if (!tbody) return;
  tbody.innerHTML = APPLICATIONS.map((app, i) => `
    <tr data-idx="${i}">
      <td>
        <div class="app-name">${app.name}</div>
        <div class="app-id">${app.id}</div>
      </td>
      <td>${app.district}</td>
      <td>${app.service}</td>
      <td>
        <div class="doc-pills">
          ${app.docs.map(d => `<span class="doc-pill">${d}</span>`).join('')}
        </div>
      </td>
      <td>
        <div class="confidence-bar">
          <div class="conf-track"><div class="conf-fill ${confClass(app.confidence)}" style="width:${app.confidence}%"></div></div>
          <span class="conf-pct">${app.confidence}%</span>
        </div>
      </td>
      <td>${statusBadge(app.status)}
        ${app.reason ? `<div style="font-size:10.5px;color:#888;margin-top:3px;max-width:160px;">${app.reason}</div>` : ''}
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      showDetail(APPLICATIONS[+row.dataset.idx]);
    });
  });

  // Open first row by default
  tbody.querySelector('tr')?.click();
}

function buildValidationSvg(docs3) {
  const labels = { aadhaar: 'Aadhaar', income: 'Income', domicile: 'Domicile' };
  const positions = { aadhaar: [50, 80], income: [160, 80], domicile: [110, 30] };
  const all = docs3.map(d => positions[d] || [110, 80]);
  const nodeColors = { aadhaar: '#dbeafe', income: '#dcfce7', domicile: '#fef3c7' };
  const textColors = { aadhaar: '#1e40af', income: '#166534', domicile: '#92400e' };
  let lines = '';
  for (let i = 0; i < all.length - 1; i++) {
    for (let j = i + 1; j < all.length; j++) {
      lines += `<line x1="${all[i][0]}" y1="${all[i][1]}" x2="${all[j][0]}" y2="${all[j][1]}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3 2"/>
        <text x="${(all[i][0]+all[j][0])/2}" y="${(all[i][1]+all[j][1])/2 - 4}" font-size="9" fill="#10b981" font-weight="700" text-anchor="middle">98%</text>`;
    }
  }
  const nodes = docs3.map(d => {
    const [x, y] = positions[d] || [110, 80];
    return `<circle cx="${x}" cy="${y}" r="18" fill="${nodeColors[d]||'#e5e7eb'}" stroke="#ccc" stroke-width="1"/>
      <text x="${x}" y="${y+4}" font-size="9" font-weight="700" fill="${textColors[d]||'#555'}" text-anchor="middle">${labels[d]||d}</text>`;
  }).join('');
  return `<svg width="220" height="120" viewBox="0 0 220 120">${lines}${nodes}</svg>`;
}

function showDetail(app) {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;
  panel.classList.add('visible');
  document.getElementById('d-name').textContent = app.name;
  document.getElementById('d-id').textContent = app.id;

  const thumbHtml = app.docs3.map(d =>
    `<div class="doc-thumb ${d}">${DOC_NAMES[d] || d}</div>`
  ).join('');
  document.getElementById('d-thumbs').innerHTML = thumbHtml;

  const fieldsHtml = app.fields.map(f => `
    <tr>
      <td class="field-name">${f.field}</td>
      <td class="field-val">${f.val}</td>
      <td class="field-conf ${f.status}">${f.conf}${f.conf !== '-' ? '%' : ''}</td>
      <td>${fieldStatusIcon(f.status)}</td>
    </tr>`).join('');
  document.getElementById('d-fields').innerHTML = fieldsHtml;

  document.getElementById('d-graph').innerHTML = buildValidationSvg(app.docs3);

  document.getElementById('d-orig').textContent = app.compression.orig;
  document.getElementById('d-opt').textContent = app.compression.opt;
  document.getElementById('d-saved').textContent = app.compression.saved;
}

const DOC_NAMES = { aadhaar: '🪪 Aadhaar Card', income: '📄 Income Cert.', domicile: '📋 Domicile Cert.' };

function initFilterBtns() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildTableRows();
  initFilterBtns();
  document.getElementById('close-panel')?.addEventListener('click', () => {
    document.getElementById('detail-panel')?.classList.remove('visible');
    document.querySelectorAll('#app-tbody tr').forEach(r => r.classList.remove('selected'));
  });
});
