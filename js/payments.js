/* =============================================
   SPARKCHARGE - Payments page logic
   Billing history, filters, payment methods
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const dollar = v => '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pad = n => String(n).padStart(2, '0');

  function getSessions() {
    try {
      return JSON.parse(localStorage.getItem('sparkcharge_sessions')) || [];
    } catch (e) {
      return [];
    }
  }

  function buildInvoices() {
    const sessions = getSessions().filter(s => s.status !== 'active');
    return sessions.map((s, i) => ({
      id: 'INV-' + (1000 + i).toString(),
      date: s.date,
      desc: s.station + ' · ' + s.charger,
      amount: s.cost,
      status: i % 5 === 0 ? 'pending' : 'paid'
    }));
  }

  const invoices = buildInvoices();
  let currentStatus = 'all';

  const tbody = document.getElementById('paymentsBody');
  const empty = document.getElementById('paymentsEmpty');
  const search = document.getElementById('paySearch');

  const statusBadge = (st) => {
    const cls = st === 'paid' ? 'status-complete' : 'status-pending';
    const label = st === 'paid' ? 'Paid' : 'Pending';
    return `<span class="status-badge ${cls}"><span class="dot"></span>${label}</span>`;
  };

  function render() {
    let list = invoices.slice();
    if (currentStatus !== 'all') list = list.filter(v => v.status === currentStatus);
    const q = search ? search.value.trim().toLowerCase() : '';
    if (q) list = list.filter(v => (v.desc + v.id).toLowerCase().includes(q));

    tbody.innerHTML = list.map(v => `
      <tr>
        <td><strong>${v.id}</strong></td>
        <td>${v.date}</td>
        <td>${v.desc}</td>
        <td class="cost-cell">${dollar(v.amount)}</td>
        <td>${statusBadge(v.status)}</td>
        <td class="actions-cell"><a class="btn-sm-dash" href="error.html"><i class="fas fa-download"></i> Invoice</a></td>
      </tr>`).join('');
    if (empty) empty.style.display = list.length ? 'none' : 'block';
  }

  function renderSummary() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('payTotal', dollar(invoices.reduce((a, v) => a + v.amount, 0)));
    set('payInvoices', invoices.length);
    set('payPending', invoices.filter(v => v.status === 'pending').length);
  }

  const DEFAULT_METHODS = [
    { brand: 'Visa', last4: '4242', exp: '09/27' },
    { brand: 'Mastercard', last4: '8125', exp: '01/28' }
  ];

  function getMethods() {
    try {
      return JSON.parse(localStorage.getItem('sparkcharge_payment_methods')) || DEFAULT_METHODS;
    } catch (e) {
      return DEFAULT_METHODS;
    }
  }

  function saveMethods(methods) {
    localStorage.setItem('sparkcharge_payment_methods', JSON.stringify(methods));
  }

  function renderMethods() {
    const container = document.getElementById('payMethodsList');
    if (!container) return;
    const methods = getMethods();
    container.innerHTML = methods.map((m, i) => `
      <div class="pay-method">
        <div class="pay-method-icon"><i class="fas fa-credit-card"></i></div>
        <div class="pay-method-info">
          <strong>${m.brand} •••• ${m.last4}</strong>
          <span>Expires ${m.exp}</span>
        </div>
        <button class="btn-sm-dash remove-method" data-idx="${i}" type="button"><i class="fas fa-trash"></i> Remove</button>
      </div>`).join('');
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('payMethods', methods.length);
  }

  function addMethod() {
    const brand = prompt('Card type (e.g. Visa, Mastercard, Amex):', 'Visa') || 'Visa';
    const last4 = prompt('Last 4 digits:', '1234') || '1234';
    const exp = prompt('Expiry (MM/YY):', '12/26') || '12/26';
    if (!last4) return;
    const methods = getMethods();
    methods.push({ brand, last4: last4.slice(-4), exp });
    saveMethods(methods);
    renderMethods();
  }

  function removeMethod(idx) {
    const methods = getMethods();
    if (methods.length <= 1) {
      alert('You must keep at least one payment method.');
      return;
    }
    methods.splice(idx, 1);
    saveMethods(methods);
    renderMethods();
  }

  document.querySelectorAll('.dash-filter[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-filter[data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
      render();
    });
  });

  if (search) search.addEventListener('input', render);

  const addBtn = document.getElementById('addMethodBtn');
  if (addBtn) addBtn.addEventListener('click', addMethod);

  document.getElementById('payMethodsList').addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-method');
    if (btn) removeMethod(parseInt(btn.dataset.idx, 10));
  });

  renderSummary();
  render();
  renderMethods();
});
