/**
 * YuvaZ – Safety Layer
 * Handles crisis detection, modal display, and emergency resources.
 * NEVER provides medical diagnosis. Always defers to professionals.
 */

'use strict';

const YuvaZSafety = (() => {
  let modalVisible = false;

  function showSafetyModal() {
    const modal = document.getElementById('safety-modal');
    if (modal) {
      modal.removeAttribute('hidden');
      modal.focus();
      modalVisible = true;
      document.body.style.overflow = 'hidden';
      YuvaZData.log('warn', 'Safety modal triggered', { timestamp: new Date().toISOString() });
    }
  }

  function closeSafetyModal() {
    const modal = document.getElementById('safety-modal');
    if (modal) {
      modal.setAttribute('hidden', '');
      modalVisible = false;
      document.body.style.overflow = '';
    }
  }

  function isModalVisible() { return modalVisible; }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalVisible) {
      closeSafetyModal();
    }
  });

  // Close on overlay click
  document.getElementById('safety-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSafetyModal();
  });

  return { showSafetyModal, closeSafetyModal, isModalVisible };
})();

// Expose globally for inline onclick
function closeSafetyModal() {
  YuvaZSafety.closeSafetyModal();
}
