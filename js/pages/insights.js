/**
 * YuvaZ – Weekly AI Insights Dashboard
 */
'use strict';

function renderInsights() {
  const state = YuvaZData.getState();
  const weekMoods = YuvaZData.getWeekMoods();
  const weekly = YuvaZAI.generateWeeklySummary(weekMoods, state.journals);

  return `
    <div style="display:flex;flex-direction:column;gap:24px;">

      <!-- Weekly Summary Header -->
      <div class="hero-banner animate-fadeInUp" style="background:linear-gradient(135deg,#1e1b4b,#312e81);">
        <div class="hero-content">
          <p class="hero-greeting">AI-Generated Report</p>
          <h2 class="hero-title">📊 Your Weekly Insights</h2>
          <p class="hero-subtitle">${weekly?.insight || 'Journal more to unlock detailed AI insights'}</p>
          ${weekly ? `
            <div style="display:flex;gap:16px;margin-top:16px;flex-wrap:wrap;">
              <div style="background:rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:12px 20px;text-align:center;">
                <div style="font-size:24px;font-weight:800;color:#fff;">${weekly.avgStress}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.7);">Avg Stress</div>
              </div>
              <div style="background:rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:12px 20px;text-align:center;">
                <div style="font-size:24px;font-weight:800;color:#fff;">${weekly.avgEnergy}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.7);">Avg Energy</div>
              </div>
              <div style="background:rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:12px 20px;text-align:center;">
                <div style="font-size:24px;font-weight:800;color:#fff;">${weekly.journalCount}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.7);">Journal Entries</div>
              </div>
            </div>` : ''}
        </div>
        <div class="hero-graphic" aria-hidden="true">📈</div>
      </div>

      <!-- Charts Grid -->
      <div class="grid-2" style="gap:24px;">
        <!-- Mood Trend Chart -->
        <div class="card animate-fadeInLeft delay-1">
          <div class="card-header">
            <span class="card-title">😊 Mood Trend (7 Days)</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="moodTrendChart" aria-label="Mood trend chart for the past 7 days"></canvas>
          </div>
        </div>

        <!-- Trigger Pattern Chart -->
        <div class="card animate-fadeInRight delay-2">
          <div class="card-header">
            <span class="card-title">🔍 Trigger Patterns</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="triggerChart" aria-label="Stress trigger pattern chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Stress vs Confidence Chart -->
      <div class="card animate-fadeInUp delay-3">
        <div class="card-header">
          <span class="card-title">📉 Stress vs Confidence Correlation</span>
          <span class="tag tag-purple">AI Correlation Analysis</span>
        </div>
        <div class="chart-wrapper" style="height:240px;">
          <canvas id="correlationChart" aria-label="Stress vs confidence correlation chart"></canvas>
        </div>
      </div>

      <!-- Trigger Insights Grid -->
      <div class="animate-fadeInUp delay-4">
        <div class="section-header">
          <div>
            <h2 class="section-title">🎯 Trigger Deep Dive</h2>
            <p class="section-desc">AI-detected recurring emotional patterns from your journal and mood data</p>
          </div>
        </div>
        <div class="grid-2" style="gap:16px;">
          ${state.triggers.map((t, i) => `
            <div class="insight-card ${t.frequency > 65 ? 'danger' : t.frequency > 40 ? 'warning' : 'success'} animate-fadeInUp delay-${Math.min(i+1,6)}"
              role="article" aria-label="${t.label}: ${t.frequency}% frequency">
              <h4>${t.icon} ${t.label}</h4>
              <p>Detected in ${t.frequency}% of your emotional signals this week</p>
              <div class="progress-bar" style="margin-top:8px;" role="progressbar" aria-valuenow="${t.frequency}" aria-valuemax="100">
                <div class="progress-fill" style="--target-width:${t.frequency}%;width:${t.frequency}%;background:${t.color};"></div>
              </div>
              <p style="margin-top:8px;font-size:12px;color:var(--text-muted);">${getTriggerAdvice(t.id)}</p>
            </div>`).join('')}
        </div>
      </div>

      <!-- Weekly AI Recommendation -->
      ${weekly ? `
        <div class="card animate-fadeInUp delay-5" style="border:2px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.05);">
          <div class="card-header">
            <span class="card-title">🤖 AI Weekly Recommendation</span>
            <span class="tag tag-green">Personalized</span>
          </div>
          <p style="font-size:15px;line-height:1.7;color:var(--text-primary);">${weekly.suggestion}</p>
          <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;">
            <button class="btn btn-primary ripple-effect" onclick="YuvaZRouter.navigate('wellness')" aria-label="Start wellness actions">
              🌿 Start Recovery Actions
            </button>
            <button class="btn btn-secondary ripple-effect" onclick="YuvaZRouter.navigate('companion')" aria-label="Discuss with companion">
              💬 Discuss with YuvaZ
            </button>
          </div>
        </div>` : ''}
    </div>`;
}

function initInsightsCharts() {
  const weekMoods = YuvaZData.getWeekMoods();
  const state = YuvaZData.getState();

  const labels = weekMoods.map(m => {
    const d = new Date(m.date + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } },
      tooltip: { backgroundColor: '#16213e', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(139,92,246,0.3)', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: 'rgba(148,163,184,0.7)', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148,163,184,0.06)' } },
      y: { ticks: { color: 'rgba(148,163,184,0.7)', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148,163,184,0.06)' } }
    }
  };

  // Mood Trend
  const moodCtx = document.getElementById('moodTrendChart');
  if (moodCtx) {
    if (window._moodChart) window._moodChart.destroy();
    const moodNumeric = { happy:9,motivated:8,calm:7,neutral:5,anxious:4,stressed:3,overwhelmed:3,sad:2,exhausted:2,angry:2 };
    window._moodChart = new Chart(moodCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Mood Score',
          data: weekMoods.map(m => moodNumeric[m.mood] || null),
          backgroundColor: weekMoods.map(m => {
            const v = moodNumeric[m.mood] || 0;
            return v >= 7 ? 'rgba(16,185,129,0.7)' : v >= 4 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)';
          }),
          borderRadius: 6, borderSkipped: false
        }]
      },
      options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 10 } } }
    });
  }

  // Trigger Pattern (Doughnut)
  const trigCtx = document.getElementById('triggerChart');
  if (trigCtx) {
    if (window._trigChart) window._trigChart.destroy();
    const top5 = state.triggers.slice(0, 5);
    window._trigChart = new Chart(trigCtx, {
      type: 'doughnut',
      data: {
        labels: top5.map(t => t.label),
        datasets: [{
          data: top5.map(t => t.frequency),
          backgroundColor: top5.map(t => t.color + 'cc'),
          borderColor: top5.map(t => t.color),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, padding: 12 } },
          tooltip: { backgroundColor: '#16213e', titleColor: '#f1f5f9', bodyColor: '#94a3b8' }
        },
        cutout: '60%'
      }
    });
  }

  // Correlation Chart
  const corrCtx = document.getElementById('correlationChart');
  if (corrCtx) {
    if (window._corrChart) window._corrChart.destroy();
    window._corrChart = new Chart(corrCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Stress (Inverted)',
            data: weekMoods.map(m => m.stress ? 11 - m.stress : null),
            borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',
            fill: true, tension: 0.4, borderDash: [5, 5], pointRadius: 4
          },
          {
            label: 'Confidence',
            data: weekMoods.map(m => m.confidence || null),
            borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)',
            fill: true, tension: 0.4, pointRadius: 4
          }
        ]
      },
      options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 10 } } }
    });
  }
}

function getTriggerAdvice(id) {
  const advice = {
    mock_test_anxiety: 'Treat mocks as diagnostics, not judgments. Track improvement, not rank.',
    parental_pressure: 'Use Parent Connect to help your family understand your journey.',
    social_comparison: 'Unfollow stress-inducing accounts. Your timeline is unique.',
    fear_of_failure: 'Failure is feedback. Every attempt teaches you something valuable.',
    study_overload: 'Break syllabus into weekly micro-goals. Focus on progress, not perfection.',
    burnout: 'Schedule deliberate rest. Recovery is preparation.',
    procrastination: 'Use Pomodoro: 25 min focused work, 5 min break. Build momentum.',
    lack_of_confidence: 'Write 3 things you did well each day. Confidence is built, not born.'
  };
  return advice[id] || 'Keep journaling to get personalized insights.';
}
