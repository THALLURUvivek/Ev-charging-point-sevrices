/* =============================================
   SPARKCHARGE - Upgrade plan page logic
   Select and switch membership plans
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const user = SparkAuth.getCurrentUser();
  const currentPlanEl = document.getElementById('currentPlan');
  if (currentPlanEl && user) currentPlanEl.textContent = user.plan;

  const currentKey = user ? user.plan : '';

  function refreshButtons() {
    document.querySelectorAll('.select-plan').forEach(btn => {
      const key = btn.dataset.planKey;
      if (key === currentKey) {
        btn.textContent = 'Current Plan';
        btn.disabled = true;
        btn.classList.add('current');
      } else {
        btn.disabled = false;
        btn.classList.remove('current');
      }
    });
  }

  function switchPlan(key) {
    const users = JSON.parse(localStorage.getItem('sparkcharge_users')) || [];

    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].plan = key;
      localStorage.setItem('sparkcharge_users', JSON.stringify(users));
    }

    let sessionObj = JSON.parse(localStorage.getItem('sparkcharge_session') || 'null');
    let store = localStorage;
    if (!sessionObj) {
      sessionObj = JSON.parse(sessionStorage.getItem('sparkcharge_session') || 'null');
      store = sessionStorage;
    }
    if (sessionObj) {
      sessionObj.plan = key;
      store.setItem('sparkcharge_session', JSON.stringify(sessionObj));
    }

    const confirm = document.getElementById('upgradeConfirm');
    const confirmName = document.getElementById('confirmPlanName');
    if (confirmName) confirmName.textContent = key;
    if (confirm) confirm.style.display = 'block';
    confirm.scrollIntoView({ behavior: 'smooth' });
  }

  document.querySelectorAll('.select-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      switchPlan(btn.dataset.planKey);
      refreshButtons();
    });
  });

  refreshButtons();
});
