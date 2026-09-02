/* =============================================
   SPARKCHARGE - Authentication page logic
   Tab switching, validation, login/signup submit
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // If already logged in, send to dashboard
  if (SparkAuth.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const tabs = document.querySelectorAll('.auth-tab');
  const forms = document.querySelectorAll('.auth-form');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  function showTab(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    forms.forEach(f => f.classList.toggle('active', f.id === (name === 'login' ? 'loginForm' : 'signupForm')));
    clearAlerts();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });

  // Preselect tab from page default (body data-default-tab) and URL query params (e.g. ?tab=signup&plan=pro)
  const defaultTab = document.body.getAttribute('data-default-tab') === 'signup' ? 'signup' : 'login';
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan');
  if (planParam) {
    const planSelect = document.getElementById('signupPlan');
    const planMatch = {
      pro: 'Pro Membership',
      fleet: 'Fleet Solutions',
      payg: 'Pay As You Go'
    }[planParam];
    if (planSelect && planMatch) planSelect.value = planMatch;
  }
  showTab(params.get('tab') || defaultTab);

  // Pre-fill login email from query param (e.g. arriving after signup)
  const emailParam = params.get('email');
  const loginEmail = document.getElementById('loginEmail');
  if (emailParam && loginEmail) loginEmail.value = emailParam;

  document.querySelectorAll('[data-switch]').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.switch));
  });

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  });

  // Social login buttons - redirect to error page (no OAuth backend yet)
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'error.html';
    });
  });

  function clearAlerts() {
    ['loginAlert', 'signupAlert'].forEach(id => {
      const el = document.getElementById(id);
      el.textContent = '';
      el.classList.remove('show', 'error', 'success');
    });
  }

  function showAlert(id, message, type) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.classList.add('show', type);
  }

  function setError(id, message) {
    showAlert(id, message, 'error');
  }

  const EMAIL_RE = /^\S+@\S+\.\S+$/;

  // ---- Login submit ----
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlerts();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      setError('loginAlert', 'Please fill in both email and password.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('loginAlert', 'Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('loginAlert', 'Please enter your password.');
      return;
    }

    const remember = document.getElementById('rememberMe').checked;
    const roleEl = document.getElementById('loginPlan');
    const role = roleEl ? roleEl.value : '';
    const result = SparkAuth.login({ email, password: password.trim(), remember, role });
    if (!result.ok) {
      setError('loginAlert', result.error);
      return;
    }

    showAlert('loginAlert', 'Signing you in...', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 600);
  });

  // ---- Signup submit ----
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlerts();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const plan = document.getElementById('signupPlan').value;

    if (!name || !email || !password || !confirm) {
      setError('signupAlert', 'Please complete all required fields.');
      return;
    }
    if (name.length < 2 || !/[a-zA-Z]/.test(name)) {
      setError('signupAlert', 'Please enter your full name (min. 2 characters).');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('signupAlert', 'Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('signupAlert', 'Password cannot be only spaces.');
      return;
    }
    if (password.length < 6) {
      setError('signupAlert', 'Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('signupAlert', 'Passwords do not match. Please re-enter them.');
      return;
    }

    const result = SparkAuth.register({ name, email, password: password.trim(), plan });
    if (!result.ok) {
      setError('signupAlert', result.error);
      return;
    }

    showAlert('signupAlert', 'Account created! Redirecting to sign in...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html?email=' + encodeURIComponent(email);
    }, 600);
  });
});
