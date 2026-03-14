// ── Analytics charts + live feed ──────────────────

const WEEKLY_DATA = [
  { day: 'Mon', val: 1240 }, { day: 'Tue', val: 1580 },
  { day: 'Wed', val: 1390 }, { day: 'Thu', val: 1720 },
  { day: 'Fri', val: 1650 }, { day: 'Sat', val: 980 }, { day: 'Sun', val: 620 }
];

const FEED_EVENTS = [
  { icon: '✓', text: 'Aadhaar verified for application <span class="app-ref">#UTK-2024-18847</span> — 96% confidence', type: 'ok' },
  { icon: '⚡', text: 'Document compressed: 5.1MB → 0.38MB <strong>(92.6% reduction)</strong>', type: 'info' },
  { icon: '✓', text: 'Domicile certificate verified for <span class="app-ref">#UTK-2024-18848</span> — 94% confidence', type: 'ok' },
  { icon: '⚠', text: 'Name mismatch flagged for application <span class="app-ref">#UTK-2024-18851</span>', type: 'warn' },
  { icon: '✓', text: 'Cross-validation passed: 3 documents, all fields consistent for <span class="app-ref">#UTK-2024-18852</span>', type: 'ok' },
  { icon: '⚡', text: 'Batch compression: 12 documents, avg 91.4% size reduction', type: 'info' },
  { icon: '✓', text: 'Income certificate OCR: 4 fields extracted at 93% avg confidence', type: 'ok' },
  { icon: '⚠', text: 'Low OCR confidence on document for <span class="app-ref">#UTK-2024-18855</span> — officer review required', type: 'warn' },
  { icon: '✓', text: 'Auto-approved: PAN + Aadhaar verified for <span class="app-ref">#UTK-2024-18856</span>', type: 'ok' },
  { icon: '⚡', text: 'Preprocessing complete: deskewed 8° rotation on scanned document', type: 'info' },
];

function buildBarChart() {
  const wrap = document.getElementById('bar-chart');
  if (!wrap) return;
  const max = Math.max(...WEEKLY_DATA.map(d => d.val));
  wrap.innerHTML = WEEKLY_DATA.map(d => {
    const pct = (d.val / max) * 100;
    const color = d.day === 'Thu' || d.day === 'Fri' ? '#1a7a6e' : '#5eb5a8';
    return `<div class="bar-col">
      <span class="bar-val">${d.val >= 1000 ? (d.val/1000).toFixed(1)+'k' : d.val}</span>
      <div class="bar-fill" style="height:0%;background:${color};transition:height 0.9s cubic-bezier(0.34,1.56,0.64,1)" data-h="${pct}"></div>
      <span class="bar-label">${d.day}</span>
    </div>`;
  }).join('');
  setTimeout(() => {
    wrap.querySelectorAll('.bar-fill').forEach(b => {
      b.style.height = b.dataset.h + '%';
    });
  }, 100);
}

function buildDonutChart() {
  const svg = document.getElementById('donut-svg');
  if (!svg) return;
  const segments = [
    { pct: 68, color: '#1a7a6e', label: 'Auto-Approved' },
    { pct: 24, color: '#f59e0b', label: 'Review Needed' },
    { pct: 8,  color: '#ef4444', label: 'Flagged' },
  ];
  const cx = 70, cy = 70, r = 52, strokeW = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const paths = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap = circ - dash;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}"
      stroke-width="${strokeW}" stroke-dasharray="0 ${circ}"
      stroke-dashoffset="${-offset}"
      data-dash="${dash}" data-gap="${gap}"
      style="transition:stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1);transform:rotate(-90deg);transform-origin:${cx}px ${cy}px"/>`;
    offset += dash;
    return el;
  }).join('');
  svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${strokeW}"/>
    ${paths}
    <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="11" font-weight="700" fill="#0d4f45">Total</text>
    <text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="20" font-weight="800" fill="#0d4f45">8.4k</text>`;

  setTimeout(() => {
    svg.querySelectorAll('[data-dash]').forEach(el => {
      el.setAttribute('stroke-dasharray', `${el.dataset.dash} ${el.dataset.gap}`);
    });
  }, 200);

  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = segments.map(s => `
      <div class="legend-row">
        <span class="legend-dot" style="background:${s.color}"></span>
        <span style="font-size:12.5px">${s.label}</span>
        <span class="legend-val" style="color:${s.color}">${s.pct}%</span>
      </div>`).join('');
  }
}

function buildLineChart() {
  const svg = document.getElementById('line-svg');
  if (!svg) return;
  const W = 340, H = 160;
  const points = [4.8,4.6,4.2,3.9,3.5,3.1,2.8,2.5,2.2,1.9,1.6,1.4];
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const maxV = 5.5, minV = 0;
  const px = (i) => 20 + (i / (points.length-1)) * (W - 40);
  const py = (v) => H - 20 - ((v - minV) / (maxV - minV)) * (H - 40);
  const pathD = points.map((v,i) => `${i===0?'M':'L'}${px(i)},${py(v)}`).join(' ');
  const areaD = pathD + ` L${px(points.length-1)},${H-20} L${px(0)},${H-20} Z`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a7a6e" stop-opacity="0.2"/><stop offset="100%" stop-color="#1a7a6e" stop-opacity="0"/></linearGradient></defs>
    <path d="${areaD}" fill="url(#lg)"/>
    <path d="${pathD}" fill="none" stroke="#1a7a6e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${points.map((v,i) => `<circle cx="${px(i)}" cy="${py(v)}" r="3.5" fill="#fff" stroke="#1a7a6e" stroke-width="2"/>`).join('')}
    ${labels.map((l,i) => `<text x="${px(i)}" y="${H-4}" font-size="9" fill="#aaa" text-anchor="middle">${l}</text>`).join('')}
    <text x="${px(0)}" y="${py(points[0])-8}" font-size="9" fill="#1a7a6e" font-weight="700">4.8MB</text>
    <text x="${px(points.length-1)+4}" y="${py(points[points.length-1])-8}" font-size="9" fill="#10b981" font-weight="700">1.4MB</text>`;
}

function buildHbarChart() {
  const wrap = document.getElementById('hbar-list');
  if (!wrap) return;
  const data = [
    { label: 'Aadhaar Card', pct: 96 },
    { label: 'PAN Card', pct: 94 },
    { label: 'Income Cert.', pct: 87 },
    { label: 'Domicile Cert.', pct: 89 },
    { label: 'Caste Cert.', pct: 82 },
  ];
  const colors = ['#1a7a6e','#1a7a6e','#5eb5a8','#5eb5a8','#8ecec8'];
  wrap.innerHTML = data.map((d,i) => `
    <div class="hbar-row">
      <span class="hbar-label">${d.label}</span>
      <div class="hbar-track"><div class="hbar-fill" style="background:${colors[i]}" data-w="${d.pct}"></div></div>
      <span class="hbar-pct">${d.pct}%</span>
    </div>`).join('');
  setTimeout(() => {
    wrap.querySelectorAll('.hbar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
  }, 300);
}

let feedIdx = 0;
function addFeedItem() {
  const list = document.getElementById('feed-list');
  if (!list) return;
  const ev = FEED_EVENTS[feedIdx % FEED_EVENTS.length];
  feedIdx++;
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');
  const item = document.createElement('div');
  item.className = 'feed-item';
  item.innerHTML = `<span class="feed-icon">${ev.icon}</span><span class="feed-text">${ev.text}</span><span class="feed-time">${timeStr}</span>`;
  list.prepend(item);
  const items = list.querySelectorAll('.feed-item');
  if (items.length > 8) items[items.length-1].remove();
}

document.addEventListener('DOMContentLoaded', () => {
  buildBarChart();
  buildDonutChart();
  buildLineChart();
  buildHbarChart();
  // Seed feed with a few items
  for (let i = 0; i < 5; i++) setTimeout(addFeedItem, i * 200);
  setInterval(addFeedItem, 2200);
});
