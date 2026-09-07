/* =============================================
   SPARKCHARGE - Contact page logic
   Form validation and submission feedback
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const alertEl = document.getElementById('contactAlert');
  const nameEl = document.getElementById('contactName');
  const emailEl = document.getElementById('contactEmail');
  const subjectEl = document.getElementById('contactSubject');
  const messageEl = document.getElementById('contactMessage');

  const EMAIL_RE = /^\S+@\S+\.\S+$/;

  function clearAlert() {
    if (!alertEl) return;
    alertEl.textContent = '';
    alertEl.classList.remove('show', 'error', 'success');
  }

  function showAlert(message, type) {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.classList.add('show', type);
  }

  function setInputError(el) {
    if (!el) return;
    el.style.borderColor = 'rgba(255,59,48,0.6)';
    el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert();

    const name = nameEl && nameEl.value.trim();
    const email = emailEl && emailEl.value.trim();
    const subject = subjectEl && subjectEl.value.trim();
    const message = messageEl && messageEl.value.trim();

    if (!name) { showAlert('Please enter your name.', 'error'); setInputError(nameEl); return; }
    if (!email) { showAlert('Please enter your email address.', 'error'); setInputError(emailEl); return; }
    if (!EMAIL_RE.test(email)) { showAlert('Please enter a valid email address.', 'error'); setInputError(emailEl); return; }
    if (!subject) { showAlert('Please enter a subject.', 'error'); setInputError(subjectEl); return; }
    if (!message || message.length < 10) { showAlert('Please enter a message (at least 10 characters).', 'error'); setInputError(messageEl); return; }

    showAlert('Your message has been sent! Our team will get back to you within 24 hours.', 'success');
    form.reset();
  });
});