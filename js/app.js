/**
 * YuvaZ – Main Application Orchestrator
 * Initializes app, theme, sidebar, keyboard nav, and accessibility features.
 */
'use strict';

const YuvaZApp = (() => {
  let sidebarCollapsed = false;
  let currentTheme = 'dark';

  function init() {
    YuvaZData.log('info', 'YuvaZ app starting', { version: '1.0.0', env: 'production' });

    // ── Theme ──────────────────────────────────────────────
    const savedTheme = localStorage.getItem('yuvaz_theme') || 'dark';
    applyTheme(savedTheme);

    // ── Sidebar Persistence ────────────────────────────────
    const savedCollapsed = localStorage.getItem('yuvaz_sidebar_collapsed') === 'true';
    if (savedCollapsed) toggleSidebar(true);

    // ── Event Listeners ────────────────────────────────────
    setupNavLinks();
    setupSidebarToggle();
    setupThemeToggle();
    setupMobileMenu();
    setupKeyboardNav();

    // ── Initial Page Render ────────────────────────────────
    YuvaZRouter.navigate('dashboard');

    // ── Daily Reminder ─────────────────────────────────────
    const todayMood = YuvaZData.getTodayMood();
    if (!todayMood?.mood) {
      setTimeout(() => {
        YuvaZComponents.showToast('👋 Don\'t forget your daily mood check-in!', 'info', 5000);
      }, 2000);
    }

    // ── Service Worker (prod) ──────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // Graceful degradation
      });
    }

    YuvaZData.log('info', 'YuvaZ app ready');
  }

  function setupNavLinks() {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) YuvaZRouter.navigate(page);
      });
    });
  }

  function setupSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => toggleSidebar());
    }
  }

  function toggleSidebar(force = null) {
    const sidebar = document.getElementById('sidebar');
    const shell = document.getElementById('app');
    if (!sidebar || !shell) return;

    sidebarCollapsed = force !== null ? force : !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    shell.classList.toggle('sidebar-collapsed', sidebarCollapsed);

    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', (!sidebarCollapsed).toString());
    }

    localStorage.setItem('yuvaz_sidebar_collapsed', sidebarCollapsed);
  }

  function setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
      });
    }
  }

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yuvaz_theme', theme);

    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';

    // Update Chart.js defaults if charts are on screen
    if (window.Chart) {
      Chart.defaults.color = theme === 'dark' ? '#94a3b8' : '#4b5563';
    }
  }

  function setupMobileMenu() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        const isOpen = sidebar.classList.contains('mobile-open');
        mobileBtn.setAttribute('aria-expanded', isOpen.toString());
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') &&
            !sidebar.contains(e.target) &&
            e.target !== mobileBtn) {
          sidebar.classList.remove('mobile-open');
          mobileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function setupKeyboardNav() {
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && YuvaZSafety.isModalVisible()) {
        const modal = document.getElementById('safety-modal');
        const focusable = modal?.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const shortcuts = {
          '1': 'dashboard', '2': 'mood', '3': 'journal',
          '4': 'companion', '5': 'insights', '6': 'readiness',
          '7': 'focus', '8': 'wellness'
        };
        if (shortcuts[e.key]) {
          e.preventDefault();
          YuvaZRouter.navigate(shortcuts[e.key]);
        }
      }
    });
  }

  return { init, toggleSidebar, applyTheme };
})();

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  YuvaZApp.init();
});
