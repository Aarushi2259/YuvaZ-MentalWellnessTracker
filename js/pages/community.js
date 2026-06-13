/**
 * YuvaZ – Community Pulse Page
 */
'use strict';

function renderCommunity() {
  const state = YuvaZData.getState();
  const { communityPulse } = state;

  return `
    <div style="display:flex;flex-direction:column;gap:24px;">

      <!-- Hero -->
      <div class="hero-banner animate-fadeInUp" style="background:linear-gradient(135deg,#1e3a5f,#3b82f6);">
        <div class="hero-content">
          <p class="hero-greeting">Anonymous & Aggregated</p>
          <h2 class="hero-title">👥 Community Pulse</h2>
          <p class="hero-subtitle">Real-time emotional trends from ${communityPulse.activeAspirantes.toLocaleString()} aspirants. Your data is anonymous.</p>
        </div>
        <div class="hero-graphic" aria-hidden="true">🌍</div>
      </div>

      <!-- Live Stats -->
      <div class="grid-4" style="gap:16px;">
        ${[
          { icon: '👥', value: communityPulse.activeAspirantes.toLocaleString(), label: 'Active Aspirants', color: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
          { icon: '😰', value: communityPulse.avgStress + '/10', label: 'Avg Stress Level', color: 'linear-gradient(135deg,#ef4444,#f97316)' },
          { icon: '😊', value: communityPulse.positiveMoods + '%', label: 'Positive Moods', color: 'linear-gradient(135deg,#10b981,#14b8a6)' },
          { icon: '🔥', value: '#1', label: 'Top Challenge', color: 'linear-gradient(135deg,#8b5cf6,#ec4899)' }
        ].map(s => YuvaZComponents.statCard({ icon: s.icon, value: s.value, label: s.label, gradient: s.color })).join('')}
      </div>

      <!-- Top Challenge Banner -->
      <div class="insight-card warning animate-fadeInUp delay-1">
        <h4>🔥 Top Challenge This Week: ${communityPulse.topChallenge}</h4>
        <p>This is the #1 emotional challenge reported by aspirants across JEE, NEET, and UPSC communities. You are not alone — thousands are navigating the same feelings.</p>
      </div>

      <!-- Exam Breakdown -->
      <div class="card animate-fadeInUp delay-2">
        <div class="card-header">
          <span class="card-title">📊 Stress by Exam Community</span>
          <span class="tag tag-blue">Live Data</span>
        </div>
        <div class="chart-wrapper">
          <canvas id="communityStressChart" aria-label="Stress levels by exam community chart"></canvas>
        </div>
      </div>

      <!-- Community Trends -->
      <div class="card animate-fadeInUp delay-3">
        <div class="card-header">
          <span class="card-title">📈 Trending Emotional Patterns</span>
          <span class="tag tag-teal">Anonymous</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            { label: 'Mock Test Anxiety', pct: 68, color: '#ef4444', icon: '📝' },
            { label: 'Parental Pressure', pct: 54, color: '#f59e0b', icon: '👨‍👩‍👦' },
            { label: 'Social Comparison (Social Media)', pct: 71, color: '#8b5cf6', icon: '📱' },
            { label: 'Fear of Failure', pct: 62, color: '#ec4899', icon: '😨' },
            { label: 'Burnout Signals', pct: 41, color: '#6366f1', icon: '🔥' }
          ].map(t => `
            <div class="community-pulse" role="article" aria-label="${t.label}: ${t.pct}%">
              <span class="community-pulse-icon" aria-hidden="true">${t.icon}</span>
              <div class="community-pulse-text">
                <h4>${t.label}</h4>
                <p>${t.pct}% of aspirants this week</p>
              </div>
              <div class="community-pulse-bar">
                <div class="progress-bar" role="progressbar" aria-valuenow="${t.pct}" aria-valuemax="100">
                  <div class="progress-fill" style="--target-width:${t.pct}%;width:${t.pct}%;background:${t.color};"></div>
                </div>
              </div>
              <span style="font-size:13px;font-weight:700;color:${t.color};min-width:36px;text-align:right;">${t.pct}%</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Motivation Stats -->
      <div class="grid-2" style="gap:20px;">
        <div class="card animate-fadeInLeft delay-4">
          <div class="card-header">
            <span class="card-title">💪 Motivation Stats</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${[
              { label: 'Used breathing exercises', pct: 34, color: 'var(--accent-teal)' },
              { label: 'Journaled this week', pct: 28, color: 'var(--accent-violet)' },
              { label: 'Completed Focus sessions', pct: 62, color: 'var(--accent-blue)' },
              { label: 'Reported burnout recovery', pct: 19, color: 'var(--accent-green)' }
            ].map(s => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
                  <span>${s.label}</span>
                  <span style="font-weight:700;color:${s.color};">${s.pct}%</span>
                </div>
                <div class="progress-bar" role="progressbar" aria-valuenow="${s.pct}" aria-valuemax="100">
                  <div class="progress-fill" style="--target-width:${s.pct}%;width:${s.pct}%;background:${s.color};"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- AI Collective Insight -->
        <div class="card animate-fadeInRight delay-5" style="background:var(--gradient-card);">
          <div class="card-header">
            <span class="card-title">🤖 Community AI Insight</span>
          </div>
          <blockquote style="font-size:15px;line-height:1.8;color:var(--text-primary);border-left:3px solid var(--accent-purple);padding-left:16px;margin:0 0 16px;">
            "${communityPulse.weeklyInsight}"
          </blockquote>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div class="insight-card success">
              <h4>✅ What's Working</h4>
              <p>Students who do Pomodoro sessions report 40% better exam confidence</p>
            </div>
            <div class="insight-card warning">
              <h4>⚠️ Watch Out For</h4>
              <p>Night-before-mock anxiety peaks between 10PM-12AM — sleep is more valuable than last-minute revision</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div style="text-align:center;padding:16px;background:var(--bg-tertiary);border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
        <p style="font-size:12px;color:var(--text-muted);">
          🔒 All community data is completely anonymized and aggregated. Your individual data is never shared.
          Community insights are generated from statistical patterns, not individual profiles.
        </p>
      </div>
    </div>`;
}

function initCommunityCharts() {
  const state = YuvaZData.getState();
  const ctx = document.getElementById('communityStressChart');
  if (!ctx) return;

  const { examBreakdown } = state.communityPulse;

  if (window._commChart) window._commChart.destroy();
  window._commChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: examBreakdown.map(e => e.exam),
      datasets: [
        {
          label: 'Avg Stress (out of 10)',
          data: examBreakdown.map(e => e.avgStress),
          backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(139,92,246,0.7)', 'rgba(59,130,246,0.7)', 'rgba(16,185,129,0.7)'],
          borderColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'],
          borderWidth: 2, borderRadius: 8, borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#16213e', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(139,92,246,0.3)', borderWidth: 1 }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }, grid: { color: 'rgba(148,163,184,0.06)' } },
        y: { min: 0, max: 10, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148,163,184,0.06)' } }
      }
    }
  });
}
