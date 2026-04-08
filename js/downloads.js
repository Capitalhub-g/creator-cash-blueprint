// ═══════════════════════════════════════════════════════
// CREATOR CASH BLUEPRINT — PAYMENT + DOWNLOAD SYSTEM
// ═══════════════════════════════════════════════════════

// ─── Package → PDF mapping ───────────────────────────
const PACKAGE_MAP = {
  'Starter Blueprint':               'basic',
  'Growth System':                   'medium',
  'Automation & Profit Blueprint':   'premium',
  'All 3 Guides Bundle':             'bundle'
};

// ─── Generate a simple download token ────────────────
function generateDownloadToken(pkgKey) {
  const payload = pkgKey + ':' + Date.now() + ':ccb2026';
  return btoa(payload).replace(/=/g, '');
}

// ─── Redirect to download page after payment ─────────
function redirectToDownload(pkgKey) {
  const token = generateDownloadToken(pkgKey);
  window.location.href = 'download.html?token=' + token + '&pkg=' + pkgKey;
}

// ─── Process payment (called from modal buttons) ──────
function processCheckout() {
  const btn = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span style="opacity:.6">Processing...</span>';
  btn.disabled = true;

  const subtitle = document.getElementById('modal-subtitle');
  const pkgName = subtitle ? subtitle.textContent.split(' \u2014 ')[0].trim() : '';
  const pkgKey = PACKAGE_MAP[pkgName] || 'basic';

  // Simulate payment — replace with real Stripe/PayPal in production
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.disabled = false;
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
    redirectToDownload(pkgKey);
  }, 2000);
}
