// Local State / Lead Management
let currentUser = JSON.parse(localStorage.getItem('mrp_user')) || null;
let pendingDownloadUrl = null;

// UI Elements
const authModal = document.getElementById('auth-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnLoginModal = document.getElementById('btn-login-modal');
const userProfile = document.getElementById('user-profile');
const userDisplayName = document.getElementById('user-display-name');
const btnLogout = document.getElementById('btn-logout');
const authForm = document.getElementById('auth-form');

// Update UI based on user session
function updateAuthState() {
  if (currentUser) {
    btnLoginModal.classList.add('hidden');
    userProfile.classList.remove('hidden');
    userDisplayName.textContent = currentUser.name || currentUser.email;
  } else {
    btnLoginModal.classList.remove('hidden');
    userProfile.classList.add('hidden');
  }
}

// Open / Close Modal
function openModal(fileToDownload = null) {
  pendingDownloadUrl = fileToDownload;
  authModal.classList.remove('hidden');
}

function closeModal() {
  authModal.classList.add('hidden');
  pendingDownloadUrl = null;
}

// Event Listeners
btnLoginModal.addEventListener('click', () => openModal());
btnCloseModal.addEventListener('click', closeModal);

// Handle Registration / Login Submission
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const branch = document.getElementById('auth-branch').value;

  if (!email) return;

  currentUser = { name: name || 'Valued Member', email, branch, signedUpAt: new Date().toISOString() };
  localStorage.setItem('mrp_user', JSON.stringify(currentUser));

  updateAuthState();
  closeModal();

  // If user clicked a download before signing up, trigger it now
  if (pendingDownloadUrl) {
    triggerDownload(pendingDownloadUrl);
  }
});

// Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('mrp_user');
  currentUser = null;
  updateAuthState();
});

// Gated Resource Download Handling
document.querySelectorAll('.btn-gated-download').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const fileUrl = btn.getAttribute('data-file');
    if (!currentUser) {
      openModal(fileUrl);
    } else {
      triggerDownload(fileUrl);
    }
  });
});

function triggerDownload(url) {
  // Direct download handler
  const link = document.createElement('a');
  link.href = url;
  link.download = url.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Kentucky Property Search redirect / integration
document.getElementById('btn-search-mls').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  const targetUrl = query 
    ? `https://cwhomeky.com/?s=${encodeURIComponent(query)}`
    : `https://cwhomeky.com/`;
  window.open(targetUrl, '_blank');
});

// Initialize on page load
updateAuthState();
