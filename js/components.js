/**
 * YuvaZ – Shared UI Components
 * Toast notifications, SVG charts, loading states, etc.
 */

'use strict';

const YuvaZComponents = (() => {

  // ── Toast Notifications ────────────────────────────────────
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: '💡' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span aria-hidden="true">${icons[type] || '💡'}</span><span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInToast 0.35s ease reverse forwards';
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  // ── Progress Ring SVG ──────────────────────────────────────
  function createProgressRing(value, max = 100, size = 120, color = 'var(--accent-purple)', label = '') {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / max) * circumference;
    const centerX = size / 2;
    const centerY = size / 2;

    return `
      <div class="progress-ring" style="width:${size}px;height:${size}px;" role="img" aria-label="${label || value + ' out of ' + max}">
        <svg class="pomodoro-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <defs>
            <linearGradient id="ringGrad_${value}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
              <stop offset="100%" style="stop-color:var(--accent-teal);stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle class="pomodoro-track" cx="${centerX}" cy="${centerY}" r="${radius}" />
          <circle
            class="pomodoro-progress"
            cx="${centerX}" cy="${centerY}" r="${radius}"
            style="stroke:url(#ringGrad_${value});stroke-dasharray:${circumference};stroke-dashoffset:${offset};"
          />
        </svg>
        <div class="progress-ring-value" style="inset:0;position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-family:'Outfit',sans-serif;font-size:${size > 100 ? '28px' : '18px'};font-weight:800;color:var(--text-primary);">${value}</span>
          ${label ? `<span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">${label}</span>` : ''}
        </div>
      </div>`;
  }

  // ── Burnout Gauge ──────────────────────────────────────────
  function createBurnoutGauge(riskPercent) {
    const color = riskPercent > 70 ? 'var(--accent-red)' : riskPercent > 40 ? 'var(--accent-amber)' : 'var(--accent-green)';
    const label = riskPercent > 70 ? 'High Risk' : riskPercent > 40 ? 'Moderate' : 'Low Risk';

    return `
      <div style="text-align:center;">
        ${createProgressRing(riskPercent, 100, 130, color, '')}
        <div style="margin-top:8px;">
          <span class="tag ${riskPercent > 70 ? 'tag-red' : riskPercent > 40 ? 'tag-amber' : 'tag-green'}">${label}</span>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">Burnout Risk</p>
      </div>`;
  }

  // ── Emotion Chips ──────────────────────────────────────────
  function renderEmotionChips(emotions) {
    const colorMap = {
      anxiety: 'tag-red', stress: 'tag-amber', self_doubt: 'tag-amber',
      comparison: 'tag-purple', motivation: 'tag-green', sadness: 'tag-blue',
      exhaustion: 'tag-red', anger: 'tag-red', hope: 'tag-green',
      joy: 'tag-green', reflection: 'tag-teal'
    };
    const emojiMap = {
      anxiety: '😰', stress: '😤', self_doubt: '💭', comparison: '👥',
      motivation: '💪', sadness: '😢', exhaustion: '😩', anger: '😡',
      hope: '🌟', joy: '😊', reflection: '🤔'
    };
    const labelMap = {
      anxiety: 'Anxiety', stress: 'Stress', self_doubt: 'Self-Doubt',
      comparison: 'Comparison', motivation: 'Motivated', sadness: 'Sadness',
      exhaustion: 'Exhaustion', anger: 'Anger', hope: 'Hopeful', joy: 'Joy',
      reflection: 'Reflection'
    };

    return emotions.map(e =>
      `<span class="tag ${colorMap[e] || 'tag-purple'}" role="listitem">
        ${emojiMap[e] || '🔍'} ${labelMap[e] || e}
      </span>`
    ).join('');
  }

  // ── Stat Card HTML ─────────────────────────────────────────
  function statCard({ icon, value, label, trend, trendDir, gradient }) {
    return `
      <div class="stat-card animate-fadeInUp" style="${gradient ? `--accent-gradient:${gradient}` : ''}">
        <span class="stat-icon" aria-hidden="true">${icon}</span>
        <span class="stat-value">${value}</span>
        <span class="stat-label">${label}</span>
        ${trend ? `<span class="stat-trend ${trendDir || 'up'}" aria-label="Trend: ${trend}">${trendDir === 'up' ? '↑' : '↓'} ${trend}</span>` : ''}
      </div>`;
  }

  // ── Skeleton Loader ────────────────────────────────────────
  function skeletonCard(count = 1) {
    return Array(count).fill(`
      <div class="card" style="min-height:120px;">
        <div class="shimmer" style="height:20px;border-radius:4px;margin-bottom:12px;width:60%;"></div>
        <div class="shimmer" style="height:40px;border-radius:4px;margin-bottom:8px;"></div>
        <div class="shimmer" style="height:14px;border-radius:4px;width:40%;"></div>
      </div>`
    ).join('');
  }

  // ── XP Bar ────────────────────────────────────────────────
  function renderXPBar() {
    const { user } = YuvaZData.getState();
    const xpToNextLevel = (user.level + 1) * 400;
    const xpProgress = Math.round((user.xp % 400) / 4);

    return `
      <div class="card" style="padding:16px 20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="font-size:20px;">⭐</span>
          <span style="font-weight:700;font-size:14px;">Level ${user.level} Aspirant</span>
          <span class="tag tag-purple" style="margin-left:auto;">${user.xp} XP</span>
        </div>
        <div class="xp-bar-wrap">
          <div class="xp-fill" style="--target-width:${xpProgress}%;width:${xpProgress}%;"></div>
        </div>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px;">${400 - (user.xp % 400)} XP to Level ${user.level + 1}</p>
      </div>`;
  }

  return {
    showToast,
    createProgressRing,
    createBurnoutGauge,
    renderEmotionChips,
    statCard,
    skeletonCard,
    renderXPBar
  };
})();
