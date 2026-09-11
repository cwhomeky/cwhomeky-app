// Navigation controller
function navigateTo(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update bottom nav active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(viewId)) {
      btn.classList.add('active');
    }
  });

  window.scrollTo(0, 0);
}

// Modal handling
function openAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

// VA Loan Calculator Logic
document.getElementById('calculate-btn')?.addEventListener('click', () => {
  const price = parseFloat(document.getElementById('calc-price').value) || 0;
  const annualRate = (parseFloat(document.getElementById('calc-rate').value) || 0) / 100;
  const years = parseInt(document.getElementById('calc-term').value) || 30;

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;

  // Principal & Interest
  let monthlyPI = 0;
  if (monthlyRate > 0) {
    monthlyPI = price * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Estimated Hardin Co. Property Tax (~1% annual) + Homeowners Insurance (~0.5%)
  const estimatedTax = (price * 0.01) / 12;
  const estimatedIns = (price * 0.005) / 12;

  const totalMonthly = monthlyPI + estimatedTax + estimatedIns;

  document.getElementById('res-total').textContent = `$${totalMonthly.toFixed(2)}/mo`;
});

// Auth button trigger
document.getElementById('auth-btn')?.addEventListener('click', openAuthModal);
