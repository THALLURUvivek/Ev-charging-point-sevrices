/* =============================================
   SPARKCHARGE - Profile page logic
   Load/save account details and password
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const user = SparkAuth.getCurrentUser();

  function getSessionStore() {
    if (localStorage.getItem('sparkcharge_session')) return 'localStorage';
    if (sessionStorage.getItem('sparkcharge_session')) return 'sessionStorage';
    return null;
  }

  function getFullUsers() {
    try {
      return JSON.parse(localStorage.getItem('sparkcharge_users')) || [];
    } catch (e) {
      return [];
    }
  }

  function loadProfile() {
    if (!user) return;
    const users = getFullUsers();
    const full = users.find(u => u.id === user.id) || {};

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('profileName', full.name || user.name);
    setVal('profileEmail', full.email || user.email);
    setVal('profilePhone', full.phone);
    setVal('profileVehicle', full.vehicle);
    setVal('profilePlan', user.plan);
    if (full.memberSince || user.memberSince) {
      setVal('profileSince', new Date(full.memberSince || user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }

  function showAlert(id, message, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.classList.remove('error', 'success');
    el.classList.add('show', type);
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('profileName').value.trim();
      const email = document.getElementById('profileEmail').value.trim();
      const phone = document.getElementById('profilePhone').value.trim();
      const vehicle = document.getElementById('profileVehicle').value.trim();

      if (name.length < 2) {
        showAlert('profileAlert', 'Name must be at least 2 characters.', 'error');
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        showAlert('profileAlert', 'Please enter a valid email address.', 'error');
        return;
      }

      const users = getFullUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx].name = name;
        users[idx].email = email;
        users[idx].phone = phone;
        users[idx].vehicle = vehicle;
        localStorage.setItem('sparkcharge_users', JSON.stringify(users));
      }

      const store = getSessionStore();
      if (store) {
        const session = JSON.parse((store === 'localStorage' ? localStorage : sessionStorage).getItem('sparkcharge_session'));
        if (session) {
          session.name = name;
          session.email = email;
          (store === 'localStorage' ? localStorage : sessionStorage).setItem('sparkcharge_session', JSON.stringify(session));
        }
      }

      showAlert('profileAlert', 'Profile updated successfully.', 'success');
      loadProfile();
    });
  }

  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const current = document.getElementById('currentPassword').value;
      const next = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmPassword').value;

      if (!current || !next || !confirm) {
        showAlert('passwordAlert', 'Please fill in all password fields.', 'error');
        return;
      }
      if (next.length < 6) {
        showAlert('passwordAlert', 'New password must be at least 6 characters.', 'error');
        return;
      }
      if (next !== confirm) {
        showAlert('passwordAlert', 'New passwords do not match.', 'error');
        return;
      }

      const users = getFullUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) {
        showAlert('passwordAlert', 'Account not found.', 'error');
        return;
      }
      if (users[idx].password !== current) {
        showAlert('passwordAlert', 'Current password is incorrect.', 'error');
        return;
      }

      users[idx].password = next;
      localStorage.setItem('sparkcharge_users', JSON.stringify(users));

      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      showAlert('passwordAlert', 'Password updated successfully.', 'success');
    });
  }

  loadProfile();
});
