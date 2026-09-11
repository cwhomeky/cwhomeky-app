import { handleEmailAuth, handleGoogleAuth, isUserAuthenticated, logDocDownload } from './auth.js';

// Global navigation helper
window.navigateTo = function(viewId) {
  // Gate the MRP Vault
  if (viewId === 'view-vault' && !isUserAuthenticated()) {
    window.openAuthModal();
    return;
  }

  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(viewId)) {
      btn.classList.add('active');
    }
  });
  window.scrollTo(0, 0);
};

window.openAuthModal = function() {
  document.getElementById('auth-modal').classList.remove('hidden');
};

window.closeAuthModal = function() {
  document.getElementById('auth-modal').classList.add('hidden');
};

// Form submission (Email Sign Up / Login)
document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('auth-name').value;
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const timeline = document.getElementById('auth-timeline').value;
  const errorEl = document.getElementById('auth-error');

  errorEl.style.display = 'none';
  const result = await handleEmailAuth(email, password, name, timeline, true);
  
  if (result.success) {
    window.closeAuthModal();
    window.navigateTo('view-vault');
  } else {
    errorEl.textContent = result.message;
    errorEl.style.display = 'block';
  }
});

// Google Sign In trigger
document.getElementById('google-auth-btn')?.addEventListener('click', async () => {
  const result = await handleGoogleAuth();
  if (result.success) {
    window.closeAuthModal();
    window.navigateTo('view-vault');
  }
});

// Download button triggers (Gated)
document.querySelectorAll('.download-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const docKey = e.currentTarget.getAttribute('data-doc');
    if (!isUserAuthenticated()) {
      window.openAuthModal();
      return;
    }
    await logDocDownload(docKey);
    alert(`Downloading ${docKey.toUpperCase()} Guide. (PDF will open from /docs folder)`);
  });
});

// VA Loan Calculator Logic
document.getElementById('calculate-btn')?.addEventListener('click', () => {
  const price = parseFloat(document.getElementById('calc-price').value) || 0;
  const annualRate = (parseFloat(document.getElementById('calc-rate').value) || 0) / 100;
  const years = parseInt(document.getElementById('calc-term').value) || 30;

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  let monthlyPI = 0;
  if (monthlyRate > 0) {
    monthlyPI = price * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const estimatedTax = (price * 0.01) / 12;
  const estimatedIns = (price * 0.005) / 12;
  const totalMonthly = monthlyPI + estimatedTax + estimatedIns;

  document.getElementById('res-total').textContent = `$${totalMonthly.toFixed(2)}/mo`;
});
