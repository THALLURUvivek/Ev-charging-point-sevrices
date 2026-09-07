/* =============================================
   SPARKCHARGE - Dashboard logic
   Session data, rendering, filters, charts
   ============================================= */

const SparkDashboard = (() => {

  const CHARGERS = ['Ultra Fast 350kW', 'Fast 150kW', 'Standard 50kW'];
  const STATUSES = ['complete', 'active', 'pending', 'failed'];
  const STATIONS = [
    'Downtown Hub', 'Greenfield Mall', 'Expressway North', 'Skyview Plaza',
    'Riverside Garage', 'Tech Park Station', 'Airport Charge', 'Lakeshore Stop',
    'Solar Park A', 'Metro Square', 'Canyon Ridge', 'Union Terminal',
    'Harbor Point', 'Summit Central'
  ];

  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pad = n => String(n).padStart(2, '0');

  function seedSessions() {
    if (localStorage.getItem('sparkcharge_sessions')) return;

    const sessions = [];
    const now = Date.now();
    const DAY = 86400000;

    for (let i = 0; i < 18; i++) {
      const status = STATUSES[i === 0 ? 1 : rnd(0, 3)];
      const energy = parseFloat((rnd(8, 42) + Math.random()).toFixed(1));
      const duration = rnd(25, 120);
      const cost = status === 'active'
        ? parseFloat((energy * 0.12).toFixed(0))
        : parseFloat((energy * 0.35).toFixed(2));
      const timestamp = now - rnd(0, 60) * DAY - rnd(0, 23) * 3600000 - rnd(0, 59) * 60000;
      const d = new Date(timestamp);
      const charger = CHARGERS[rnd(0, CHARGERS.length - 1)];

      sessions.push({
        id: 'SC-' + (100000 + i * rnd(7, 13)).toString(),
        station: STATIONS[rnd(0, STATIONS.length - 1)],
        date: `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
        timestamp,
        duration,
        energy,
        charger,
        status,
        cost,
        co2: parseFloat((energy * 0.72).toFixed(1))
      });
    }

    sessions.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem('sparkcharge_sessions', JSON.stringify(sessions));
  }

  function getSessions() {
    try {
      const sessions = JSON.parse(localStorage.getItem('sparkcharge_sessions')) || [];
      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      return [];
    }
  }

  const dollar = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function statusBadge(status) {
    const labels = { complete: 'Completed', active: 'In Progress', pending: 'Scheduled', failed: 'Failed' };
    return `<span class="status-badge status-${status}"><span class="dot"></span>${labels[status]}</span>`;
  }

  /* ---- Session row builder (reused by both pages) ---- */
  function rowHtml(s, showCharger) {
    const extra = showCharger ? `<td>${s.charger}</td>` : '';
    const action = s.status === 'pending' || s.status === 'active'
      ? `<button class="btn-sm-dash cancel-session" data-id="${s.id}"><i class="fas fa-xmark"></i> Cancel</button>`
      : `<a class="btn-sm-dash" href="error.html"><i class="fas fa-file-invoice"></i> Invoice</a>`;
    return `<tr data-id="${s.id}" data-status="${s.status}" data-ts="${s.timestamp}">
      <td><div class="station-cell">
        <div class="st-icon"><i class="fas fa-map-pin"></i></div>
        <div><strong>${s.station}</strong><small>${s.id}</small></div>
      </div></td>
      <td>${s.date}</td>
      <td>${s.duration} min</td>
      <td>${s.energy} kWh</td>
      ${extra}
      <td>${statusBadge(s.status)}</td>
      <td class="cost-cell">${s.status === 'active' ? 'Est. ' : ''}${dollar(s.cost)}</td>
      <td class="actions-cell">${action}</td>
    </tr>`;
  }

  /* ---- Greeting + user chips ---- */
  function renderUser() {
    const user = SparkAuth.getCurrentUser();
    if (!user) return;

    const firstName = user.name.split(' ')[0];
    const nameEl = document.getElementById('userName');
    const mailEl = document.getElementById('userMail');
    const planEl = document.getElementById('userPlan');
    const avatarEl = document.getElementById('userAvatar');
    const greetingEl = document.getElementById('firstName');
    const planNameEl = document.getElementById('planName');
    const planDescEl = document.getElementById('planDesc');

    if (nameEl) nameEl.textContent = user.name;
    if (mailEl) mailEl.textContent = user.email || '';
    if (planEl) planEl.textContent = user.plan;
    if (avatarEl) avatarEl.textContent = (user.name[0] || 'U').toUpperCase();
    if (greetingEl) greetingEl.textContent = firstName + ' 👋';

    if (planNameEl) planNameEl.textContent = user.plan;
    if (planDescEl && user.plan !== 'Pay As You Go') {
      planDescEl.textContent = user.plan === 'Pro Membership'
        ? 'Unlimited ultra-fast charging with priority access and free idle fees.'
        : 'Fleet-grade charging with bulk pricing and a dedicated manager.';
    }
  }

  /* ---- Dashboard overview page ---- */
  function renderOverview() {
    const sessions = getSessions();
    if (!sessions.length) return;

    const completed = sessions.filter(s => s.status === 'complete');
    const totalEnergy = sessions.reduce((a, s) => a + s.energy, 0);
    const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
    const totalCost = completed.reduce((a, s) => a + s.cost, 0);
    const totalCO2 = completed.reduce((a, s) => a + s.co2, 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('statEnergy', totalEnergy.toFixed(1));
    set('statTime', totalMinutes);
    set('statCost', dollar(totalCost));
    set('statCO2', totalCO2.toFixed(0));

    /* Energy chart — last 7 days */
    const chart = document.getElementById('energyChart');
    if (chart) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const daily = days.map((_, i) => {
        const dayStart = new Date(); dayStart.setHours(0,0,0,0);
        const start = dayStart.getTime() - (6 - i) * 86400000;
        const end = start + 86400000;
        return +(sessions.filter(s => s.timestamp >= start && s.timestamp < end).reduce((a, s) => a + s.energy, 0)).toFixed(1);
      });
      const max = Math.max(...daily, 1);
      chart.innerHTML = daily.map((v, i) => `
        <div class="chart-bar-col">
          <span class="chart-val">${v.toFixed(1)}</span>
          <div class="chart-bar" style="height:${(v / max) * 100}%;"></div>
          <span class="chart-day">${days[i]}</span>
        </div>`).join('');
    }

    /* Donut */
    const fast = sessions.filter(s => s.charger.includes('350')).reduce((a, s) => a + s.energy, 0);
    const std = totalEnergy - fast;
    const fastPct = totalEnergy ? Math.round((fast / totalEnergy) * 100) : 0;
    const arc = document.getElementById('donutArc');
    if (arc) arc.setAttribute('stroke-dasharray', `${(fastPct / 100) * 377} 377`);
    const dv = document.getElementById('donutVal'); if (dv) dv.textContent = fastPct + '%';
    const lf = document.getElementById('legendFast'); if (lf) lf.textContent = fastPct + '%';
    const ls = document.getElementById('legendStd'); if (ls) ls.textContent = (100 - fastPct) + '%';

    /* Recent sessions - top 5 */
    const tbody = document.getElementById('recentSessionsBody');
    if (tbody) {
      tbody.innerHTML = sessions.slice(0, 5).map(s => rowHtml(s, false)).join('');
    }
  }

  /* ---- Charging sessions page ---- */
  function renderSessions(filter) {
    let sessions = getSessions();
    const tbody = document.getElementById('sessionsBody');
    const empty = document.getElementById('emptyState');
    if (!tbody) return;

    const timeFilter = document.getElementById('timeFilter');
    let days = timeFilter ? timeFilter.value : 'all';
    if (days !== 'all') {
      const cutoff = Date.now() - parseInt(days) * 86400000;
      sessions = sessions.filter(s => s.timestamp >= cutoff);
    }

    if (filter && filter !== 'all') {
      sessions = sessions.filter(s => s.status === filter);
    }

    const search = document.getElementById('sessionSearch');
    const q = search ? search.value.trim().toLowerCase() : '';
    if (q) {
      sessions = sessions.filter(s => s.station.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    tbody.innerHTML = sessions.map(s => rowHtml(s, true)).join('');
    if (empty) empty.style.display = sessions.length ? 'none' : 'block';

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const all = getSessions();
    set('sumSessions', all.length);
    set('sumEnergy', all.reduce((a, s) => a + s.energy, 0).toFixed(1));
    set('sumCost', dollar(all.reduce((a, s) => a + s.cost, 0)));
    set('sumTime', all.reduce((a, s) => a + s.duration, 0));
  }

  /* ---- Cancel a pending/active session ---- */
  function cancelSession(id) {
    const all = getSessions();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return;
    const s = all[idx];
    if (s.status) s.status = 'failed';
    s.cost = 0;
    localStorage.setItem('sparkcharge_sessions', JSON.stringify(all));
    if (document.getElementById('sessionsBody')) renderSessions(currentFilter);
    if (document.getElementById('recentSessionsBody')) renderOverview();
  }

  let currentFilter = 'all';

  function init() {
    seedSessions();

    renderUser();
    renderOverview();
    renderSessions('all');

    /* Filter buttons */
    document.querySelectorAll('.dash-filter[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dash-filter[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderSessions(currentFilter);
      });
    });

    /* Time + search */
    const timeFilter = document.getElementById('timeFilter');
    if (timeFilter) timeFilter.addEventListener('change', () => renderSessions(currentFilter));
    const search = document.getElementById('sessionSearch');
    if (search) search.addEventListener('input', () => renderSessions(currentFilter));

    /* Delegated cancel */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.cancel-session');
      if (btn) cancelSession(btn.dataset.id);
    });

    /* Mobile sidebar toggle */
    const dashSidebar = document.getElementById('dashSidebar');
    const dashMenuBtn = document.getElementById('dashMenuBtn');
    if (dashSidebar && dashMenuBtn) {
      let overlay = document.querySelector('.dash-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'dash-overlay';
        document.body.appendChild(overlay);
      }
      const closeMenu = () => {
        dashSidebar.classList.remove('open');
        overlay.classList.remove('show');
        dashMenuBtn.setAttribute('aria-expanded', 'false');
      };
      dashMenuBtn.addEventListener('click', () => {
        if (dashSidebar.classList.contains('open')) { closeMenu(); return; }
        dashSidebar.classList.add('open');
        overlay.classList.add('show');
        dashMenuBtn.setAttribute('aria-expanded', 'true');
      });
      overlay.addEventListener('click', closeMenu);
      dashSidebar.querySelectorAll('.dash-link').forEach(link => link.addEventListener('click', closeMenu));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    }

    /* Logout */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        SparkAuth.logout();
        window.location.href = 'login.html';
      });
    }
  }

  return { init, renderUser, renderOverview, renderSessions };
})();

document.addEventListener('DOMContentLoaded', () => {
  SparkDashboard.init();
});