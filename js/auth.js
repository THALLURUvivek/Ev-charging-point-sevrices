/* =============================================
   SPARKCHARGE - Shared Authentication
   localStorage-based users + session handling
   ============================================= */

const SparkAuth = (() => {
  const USERS_KEY = 'sparkcharge_users';
  const SESSION_KEY = 'sparkcharge_session';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function isAuthenticated() {
    return !!getCurrentUser();
  }

  /* remember=true -> persists in localStorage; false -> sessionStorage (tab session) */
  function setSession(user, remember) {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function register({ name, email, password, plan }) {
    const users = getUsers();
    const user = {
      id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name,
      email,
      password,
      plan: plan || 'Pay As You Go',
      memberSince: new Date().toISOString(),
      vehicle: '',
      phone: ''
    };
    users.push(user);
    saveUsers(users);
    return { ok: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, memberSince: user.memberSince } };
  }

  function login({ email, password, remember }) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) {
      return { ok: false, error: 'No account found with this email. Please sign up.' };
    }
    if (user.password !== password) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }
    setSession({ id: user.id, name: user.name, email: user.email, plan: user.plan, memberSince: user.memberSince }, remember !== false);
    return { ok: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan, memberSince: user.memberSince } };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  return {
    register,
    login,
    logout,
    getCurrentUser,
    isAuthenticated
  };
})();

/* Authentication guard for dashboard pages (non-exported pages open only when logged in) */
(function initAuthPageHelpers() {
  const guarded = document.body.hasAttribute('data-auth-guard');
  if (!guarded) return;

  if (!SparkAuth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  if (window.SparkDashboard && SparkDashboard.renderUser) {
    SparkDashboard.renderUser();
  }
})();
