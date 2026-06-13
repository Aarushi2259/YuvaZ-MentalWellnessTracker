/**
 * YuvaZ – Client-Side Router
 * Handles page navigation, state persistence, and analytics.
 */
'use strict';

const YuvaZRouter = (() => {
  const PAGES = {
    dashboard: {
      title: 'Dashboard', subtitle: 'Your wellness overview',
      render: () => renderDashboard(),
      init: () => setTimeout(initDashboardCharts, 100)
    },
    mood: {
      title: 'Mood Check-In', subtitle: 'How are you feeling today?',
      render: () => renderMood(),
      init: null
    },
    journal: {
      title: 'AI Journal', subtitle: 'Your private emotional space',
      render: () => renderJournal(),
      init: () => setTimeout(initJournalPage, 100)
    },
    companion: {
      title: 'YuvaZ Companion', subtitle: 'AI-powered emotional support',
      render: () => renderCompanion(),
      init: null
    },
    insights: {
      title: 'AI Insights', subtitle: 'Weekly emotional analysis',
      render: () => renderInsights(),
      init: () => setTimeout(initInsightsCharts, 150)
    },
    readiness: {
      title: 'Readiness Index', subtitle: 'Your exam preparedness score',
      render: () => renderReadiness(),
      init: null
    },
    focus: {
      title: 'Focus Zone', subtitle: 'Pomodoro & deep work sessions',
      render: () => renderFocus(),
      init: null
    },
    wellness: {
      title: 'Wellness Actions', subtitle: 'Personalized recovery exercises',
      render: () => renderWellness(),
      init: null
    },
    community: {
      title: 'Community Pulse', subtitle: 'Anonymous aspirant trends',
      render: () => renderCommunity(),
      init: () => setTimeout(initCommunityCharts, 150)
    },
    parent: {
      title: 'Parent Connect', subtitle: 'AI-assisted family communication',
      render: () => renderParent(),
      init: null
    }
  };

  let currentPage = 'dashboard';

  function navigate(pageId) {
    if (!PAGES[pageId]) {
      YuvaZData.log('warn', 'Navigation to unknown page', { pageId });
      pageId = 'dashboard';
    }

    // Stop focus timer if navigating away
    if (currentPage === 'focus' && timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
    }

    currentPage = pageId;
    const page = PAGES[pageId];

    // Update title & subtitle
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (titleEl) titleEl.textContent = page.title;
    if (subtitleEl) subtitleEl.textContent = page.subtitle;

    // Render content with loading animation
    const content = document.getElementById('page-content');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(10px)';

      setTimeout(() => {
        content.innerHTML = page.render();
        content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 80);
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const isActive = link.dataset.page === pageId;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    // Close mobile menu
    const sidebar = document.getElementById('sidebar');
    if (sidebar?.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }

    // Initialize page-specific functionality
    if (page.init) page.init();

    // Update document title for SEO
    document.title = `${page.title} – YuvaZ Mental Wellness`;

    YuvaZData.log('info', 'Navigation', { page: pageId });
  }

  function getCurrentPage() { return currentPage; }

  return { navigate, getCurrentPage, PAGES };
})();
