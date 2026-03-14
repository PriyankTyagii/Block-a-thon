// ── PramaanDB — localStorage wrapper ──────────────

const DB_KEY   = 'pramaanai_apps';
const STAT_KEY = 'pramaanai_stats';

const PramaanDB = {

  // ── Stats ─────────────────────────────────────
  getStats() {
    const defaults = {
      totalDocs: 231847, totalApps: 84312,
      approved: 57331,   flagged: 6745,
      savedMB: 219403,   todayDocs: 128
    };
    try {
      return Object.assign(defaults, JSON.parse(localStorage.getItem(STAT_KEY) || '{}'));
    } catch { return defaults; }
  },

  saveStats(s) {
    try { localStorage.setItem(STAT_KEY, JSON.stringify(s)); } catch {}
  },

  bumpStats(docsCount = 3) {
    const s = this.getStats();
    s.totalDocs  += docsCount;
    s.totalApps  += 1;
    s.approved   += 1;
    s.savedMB    += Math.round(docsCount * 13.2);
    s.todayDocs  += docsCount;
    this.saveStats(s);
    return s;
  },

  // ── Applications ──────────────────────────────
  getAll() {
    try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]'); } catch { return []; }
  },

  save(app) {
    const all = this.getAll();
    const idx = all.findIndex(a => a.id === app.id);
    if (idx >= 0) all[idx] = app; else all.unshift(app);
    try { localStorage.setItem(DB_KEY, JSON.stringify(all)); } catch {}
  },

  findById(id) {
    return this.getAll().find(a => a.id === id.trim().toUpperCase()) || null;
  },

  findByMobile(mobile) {
    return this.getAll().filter(a => a.mobile === mobile.trim());
  },

  updateStatus(id, status, note = '') {
    const all = this.getAll();
    const app = all.find(a => a.id === id);
    if (!app) return;
    app.status = status;
    if (note) app.note = note;
    app.timeline = app.timeline || [];
    app.timeline.push({ status, note, ts: new Date().toISOString() });
    try { localStorage.setItem(DB_KEY, JSON.stringify(all)); } catch {}
  },

  // Seed demo data if empty
  seed() {
    if (this.getAll().length > 0) return;
    const demos = [
      {
        id: 'UTK-2024-18834', name: 'Priya Sharma', mobile: '9876500001',
        service: 'Income Certificate', district: 'Dehradun',
        status: 'approved', confidence: 96,
        submittedAt: new Date(Date.now() - 2*86400000).toISOString(),
        timeline: [
          { status: 'submitted',  note: 'Application received',               ts: new Date(Date.now()-2*86400000).toISOString() },
          { status: 'processing', note: 'AI pipeline verification started',   ts: new Date(Date.now()-2*86400000+60000).toISOString() },
          { status: 'verified',   note: 'All documents verified (96% conf)',  ts: new Date(Date.now()-2*86400000+90000).toISOString() },
          { status: 'approved',   note: 'Auto-approved by PramaanAI',         ts: new Date(Date.now()-86400000).toISOString() },
        ]
      },
      {
        id: 'UTK-2024-18838', name: 'Kavita Devi', mobile: '9876500002',
        service: 'Income Certificate', district: 'Pithoragarh',
        status: 'flagged', confidence: 45,
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        timeline: [
          { status: 'submitted',  note: 'Application received',               ts: new Date(Date.now()-86400000).toISOString() },
          { status: 'processing', note: 'AI pipeline verification started',   ts: new Date(Date.now()-86400000+60000).toISOString() },
          { status: 'flagged',    note: 'Address mismatch + low OCR confidence — officer review needed', ts: new Date(Date.now()-86400000+120000).toISOString() },
        ]
      }
    ];
    demos.forEach(d => this.save(d));
  }
};

PramaanDB.seed();
