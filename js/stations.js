/* =============================================
   SPARKCHARGE - Stations page logic
   Station cards, filters, search, sort
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const DISTANCES = ['0.4 mi', '0.9 mi', '1.2 mi', '1.8 mi', '2.5 mi', '3.1 mi', '4.2 mi'];
  const STATUSES = ['available', 'available', 'available', 'busy', 'busy', 'maintenance'];

  const STATIONS = [
    { name: 'Downtown Hub', charger: 'Ultra Fast 350kW', chargers: 8 },
    { name: 'Greenfield Mall', charger: 'Fast 150kW', chargers: 6 },
    { name: 'Expressway North', charger: 'Fast 150kW', chargers: 4 },
    { name: 'Skyview Plaza', charger: 'Standard 50kW', chargers: 5 },
    { name: 'Riverside Garage', charger: 'Standard 50kW', chargers: 3 },
    { name: 'Tech Park Station', charger: 'Ultra Fast 350kW', chargers: 6 },
    { name: 'Airport Charge', charger: 'Ultra Fast 350kW', chargers: 12 },
    { name: 'Lakeshore Stop', charger: 'Fast 150kW', chargers: 4 },
    { name: 'Solar Park A', charger: 'Standard 50kW', chargers: 5 },
    { name: 'Metro Square', charger: 'Fast 150kW', chargers: 6 },
    { name: 'Union Terminal', charger: 'Ultra Fast 350kW', chargers: 8 },
    { name: 'Harbor Point', charger: 'Standard 50kW', chargers: 3 }
  ].map((s, i) => ({
    ...s,
    kw: s.charger.match(/(\d+)/)[0],
    distance: DISTANCES[i % DISTANCES.length],
    status: STATUSES[i % STATUSES.length],
    pluggedIn: Math.min(s.chargers, Math.floor(s.chargers * 0.7)),
    available: Math.max(1, s.chargers - Math.floor(s.chargers * 0.7))
  }));

  let currentType = 'all';
  let currentSort = 'default';

  const grid = document.getElementById('stationGrid');
  const empty = document.getElementById('stationsEmpty');
  const search = document.getElementById('stationSearch');

  const statusMeta = {
    available: { label: 'Available', cls: 'st-available', icon: 'fa-bolt' },
    busy: { label: 'Busy', cls: 'st-busy', icon: 'fa-clock' },
    maintenance: { label: 'Maintenance', cls: 'st-maint', icon: 'fa-wrench' }
  };

  function cardHtml(s) {
    const meta = statusMeta[s.status];
    return `
      <div class="station-card" data-type="all" data-avail="${s.status}" data-name="${s.name}" data-dist="${s.distance}">
        <div class="station-card-top">
          <div class="station-icon"><i class="fas fa-map-pin"></i></div>
          <span class="station-avail ${meta.cls}"><span class="dot"></span>${meta.label}</span>
        </div>
        <h4>${s.name}</h4>
        <div class="station-meta">
          <span><i class="fas fa-bolt"></i> ${s.charger}</span>
          <span><i class="fas fa-car"></i> ${s.available}/${s.chargers} open</span>
          <span><i class="fas fa-location-arrow"></i> ${s.distance} away</span>
        </div>
        <a class="btn-sm-dash" href="error.html"><i class="fas fa-route"></i> Navigate</a>
      </div>`;
  }

  function render() {
    let list = STATIONS.slice();

    if (currentType !== 'all') {
      if (currentType === 'available') {
        list = list.filter(s => s.status === 'available');
      } else {
        list = list.filter(s => s.kw === currentType);
      }
    }

    const q = search ? search.value.trim().toLowerCase() : '';
    if (q) list = list.filter(s => s.name.toLowerCase().includes(q));

    if (currentSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (currentSort === 'distance') list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

    grid.innerHTML = list.map(cardHtml).join('');
    if (empty) empty.style.display = list.length ? 'none' : 'block';
  }

  document.querySelectorAll('.dash-filter[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-filter[data-type]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      render();
    });
  });

  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) sortFilter.addEventListener('change', () => {
    currentSort = sortFilter.value;
    render();
  });

  if (search) search.addEventListener('input', render);

  render();
});
