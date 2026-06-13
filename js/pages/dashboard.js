/**
 * YuvaZ – Dashboard Page
 */
'use strict';

function renderDashboard() {
  const state = YuvaZData.getState();
  const { user, moodLog, readinessIndex, pomodoroStats } = state;
  const todayMood = YuvaZData.getTodayMood();
  const weekMoods = YuvaZData.getWeekMoods();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dayOfWeek = now.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const moodColors = {
    happy: '#10b981', motivated: '#f59e0b', calm: '#14b8a6',
    anxious: '#f97316', stressed: '#ef4444', overwhelmed: '#8b5cf6',
    exhausted: '#6366f1', sad: '#64748b', default: '#94a3b8'
  };

  const moodBarHTML = weekMoods.map((m, i) => {
    const h = m.energy ? Math.round(m.energy * 5) : 10;
    const color = moodColors[m.mood] || moodColors.default;
    const dayLabel = ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(m.date + 'T12:00:00').getDay()];
    const tooltip = m.mood ? `${dayLabel}: ${m.mood} (Energy ${m.energy}/10)` : `${dayLabel}: No check-in`;
    return `<div class="mood-bar-day" style="height:${h}px;background:${color};opacity:${m.mood ? 1 : 0.2};" title="${tooltip}" aria-label="${tooltip}"></div>`;
  }).join('');

  const readiness = YuvaZAI.generateReadinessIndex(weekMoods, state.journals);

  return `
    <!-- Hero Banner -->
    <div class="hero-banner animate-fadeInUp">
      <div class="hero-content">
        <p class="hero-greeting">${dayOfWeek}, ${dateStr}</p>
        <h2 class="hero-title">${greeting}, ${user.name}! 👋</h2>
        <p class="hero-subtitle">
          ${todayMood?.mood
            ? `Today you're feeling <strong>${todayMood.emoji} ${todayMood.mood}</strong>. Keep going — every small step counts.`
            : 'How are you feeling today? Your daily check-in helps me understand you better.'}
        </p>
        <div class="hero-actions">
          ${!todayMood?.mood
            ? `<button class="btn btn-primary-white ripple-effect" onclick="YuvaZRouter.navigate('mood')" aria-label="Do today's mood check-in">😊 Check In Now</button>`
            : `<button class="btn ripple-effect" onclick="YuvaZRouter.navigate('journal')" aria-label="Open journal">📓 Write Journal</button>`}
          <button class="btn ripple-effect" onclick="YuvaZRouter.navigate('companion')" aria-label="Chat with companion">🤖 Talk to YuvaZ</button>
        </div>
      </div>
      <div class="hero-graphic" aria-hidden="true">🧠</div>
    </div>

    <!-- Stats Row -->
    <div class="grid-4" style="margin-bottom:28px;">
      ${YuvaZComponents.statCard({ icon: '🔥', value: user.streak, label: 'Day Streak', trend: '+2 days', trendDir: 'up', gradient: 'linear-gradient(135deg,#ff6b35,#f59e0b)' })}
      ${YuvaZComponents.statCard({ icon: '⭐', value: user.xp, label: 'XP Earned', trend: '+120 today', trendDir: 'up', gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)' })}
      ${YuvaZComponents.statCard({ icon: '⏱️', value: pomodoroStats.todaySessions, label: 'Focus Sessions', trend: 'today', trendDir: 'up', gradient: 'linear-gradient(135deg,#14b8a6,#3b82f6)' })}
      ${YuvaZComponents.statCard({ icon: '📓', value: state.journals.length, label: 'Journal Entries', trend: 'total', trendDir: 'up', gradient: 'linear-gradient(135deg,#ec4899,#f97316)' })}
    </div>

    <!-- Main Grid -->
    <div class="grid-2" style="margin-bottom:28px;gap:24px;">
      <!-- Readiness Index -->
      <div class="card animate-fadeInLeft delay-1">
        <div class="card-header">
          <span class="card-title">🎯 Readiness Index</span>
          <a href="#" class="card-action" onclick="YuvaZRouter.navigate('readiness');return false;">Details →</a>
        </div>
        <div class="readiness-ring-wrap">
          ${YuvaZComponents.createProgressRing(readiness.overall, 100, 140, 'var(--accent-purple)', 'Score')}
          <div class="readiness-stats">
            <div class="readiness-stat">
              <div class="readiness-stat-dot" style="background:var(--accent-green)"></div>
              <span class="readiness-stat-label">Confidence Trend</span>
              <span class="readiness-stat-value" style="color:var(--accent-green)">${readiness.confidenceTrend}</span>
            </div>
            <div class="readiness-stat">
              <div class="readiness-stat-dot" style="background:${readiness.burnoutRisk > 60 ? 'var(--accent-red)' : readiness.burnoutRisk > 35 ? 'var(--accent-amber)' : 'var(--accent-green)'}"></div>
              <span class="readiness-stat-label">Burnout Risk</span>
              <span class="readiness-stat-value" style="color:${readiness.burnoutRisk > 60 ? 'var(--accent-red)' : readiness.burnoutRisk > 35 ? 'var(--accent-amber)' : 'var(--accent-green)'}">${readiness.burnoutRisk}%</span>
            </div>
            <div class="readiness-stat">
              <div class="readiness-stat-dot" style="background:var(--accent-teal)"></div>
              <span class="readiness-stat-label">Mood Trend</span>
              <span class="readiness-stat-value" style="color:var(--accent-teal)">${readiness.moodTrend}</span>
            </div>
            <div class="readiness-stat">
              <div class="readiness-stat-dot" style="background:var(--accent-blue)"></div>
              <span class="readiness-stat-label">Study Consistency</span>
              <span class="readiness-stat-value" style="color:var(--accent-blue)">${readiness.studyConsistency}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Mood Chart -->
      <div class="card animate-fadeInRight delay-2">
        <div class="card-header">
          <span class="card-title">📈 7-Day Mood Trend</span>
          <a href="#" class="card-action" onclick="YuvaZRouter.navigate('insights');return false;">Full report →</a>
        </div>
        <div class="chart-wrapper">
          <canvas id="weeklyMoodChart" aria-label="7-day mood trend chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Trigger Heatmap -->
    <div class="card animate-fadeInUp delay-3" style="margin-bottom:28px;">
      <div class="card-header">
        <span class="card-title">🔍 Hidden Trigger Discovery</span>
        <a href="#" class="card-action" onclick="YuvaZRouter.navigate('insights');return false;">Analyze →</a>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">AI-detected stress patterns from your journal and mood data</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${state.triggers.slice(0, 4).map(t => `
          <div class="trigger-item">
            <span class="trigger-icon" aria-hidden="true">${t.icon}</span>
            <span class="trigger-label">${t.label}</span>
            <div class="trigger-bar-wrap" role="progressbar" aria-valuenow="${t.frequency}" aria-valuemax="100" aria-label="${t.label}: ${t.frequency}%">
              <div class="trigger-bar" style="--target-width:${t.frequency}%;width:${t.frequency}%;background:${t.color};"></div>
            </div>
            <span class="trigger-pct">${t.frequency}%</span>
          </div>`).join('')}
      </div>
      ${state.journals.length > 0 ? `
        <div class="insight-card warning" style="margin-top:16px;">
          <h4>🔑 AI Insight</h4>
          <p>${YuvaZAI.generateWeeklySummary(weekMoods, state.journals)?.insight || 'Keep journaling to unlock personalized insights.'}</p>
        </div>` : ''}
    </div>

    <!-- Bottom Row -->
    <div class="grid-3" style="margin-bottom:28px;gap:24px;">
      <!-- Quick Wellness -->
      <div class="card animate-fadeInUp delay-4">
        <div class="card-header">
          <span class="card-title">🌿 Quick Actions</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${state.wellnessActions.slice(0, 3).map(w => `
            <button class="btn btn-secondary" style="justify-content:flex-start;gap:10px;"
              onclick="YuvaZRouter.navigate('wellness')" aria-label="Start ${w.title}">
              ${w.icon} ${w.title}
              <span class="tag tag-purple" style="margin-left:auto;">+${w.xp} XP</span>
            </button>`).join('')}
        </div>
      </div>

      <!-- Achievements -->
      <div class="card animate-fadeInUp delay-5">
        <div class="card-header">
          <span class="card-title">🏆 Achievements</span>
        </div>
        ${YuvaZComponents.renderXPBar()}
        <div class="badge-grid" style="margin-top:12px;">
          ${state.badges.slice(0, 6).map(b => `
            <div class="achievement-badge ${b.earned ? 'earned' : 'locked'}"
              title="${b.name}${b.earned ? '' : ' (Locked)'}"
              aria-label="${b.name}${b.earned ? ' earned' : ' locked'}">
              <span class="badge-icon" aria-hidden="true">${b.icon}</span>
              <span class="badge-name">${b.name}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Daily Quote -->
      <div class="card animate-fadeInUp delay-6" style="background:var(--gradient-hero);border:none;">
        <div class="card-header">
          <span class="card-title" style="color:rgba(255,255,255,0.85);">💬 Today's Wisdom</span>
        </div>
        <blockquote style="font-size:15px;line-height:1.7;color:#fff;font-style:italic;margin:0 0 12px;">
          "${getDailyQuote()}"
        </blockquote>
        <p style="font-size:12px;color:rgba(255,255,255,0.7);">— Shared by YuvaZ AI</p>
        <button class="btn" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);margin-top:16px;width:100%;"
          onclick="YuvaZRouter.navigate('companion')" aria-label="Get personalized advice">
          Get Personalized Advice 🤖
        </button>
      </div>
    </div>`;
}

function getDailyQuote() {
  const quotes = [
    'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    'Your preparation today is your performance tomorrow. Trust the process.',
    'The expert in anything was once a beginner. Keep going.',
    'Pressure makes diamonds. You are becoming one.',
    'One chapter at a time. One day at a time. That\'s how legends are made.',
    'Rest if you must, but don\'t quit. Your dream is worth every sacrifice.',
    'Hard days are the ones that make you stronger. Hold on.'
  ];
  const day = new Date().getDate();
  return quotes[day % quotes.length];
}

function initDashboardCharts() {
  const weekMoods = YuvaZData.getWeekMoods();
  const ctx = document.getElementById('weeklyMoodChart');
  if (!ctx) return;

  const labels = weekMoods.map(m => {
    const d = new Date(m.date + 'T12:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  const stressData = weekMoods.map(m => m.stress || null);
  const energyData = weekMoods.map(m => m.energy || null);
  const confidenceData = weekMoods.map(m => m.confidence || null);

  if (window._dashChart) window._dashChart.destroy();

  window._dashChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Stress', data: stressData, borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.1)', fill: true,
          tension: 0.4, pointRadius: 5, pointHoverRadius: 8
        },
        {
          label: 'Energy', data: energyData, borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)', fill: true,
          tension: 0.4, pointRadius: 5, pointHoverRadius: 8
        },
        {
          label: 'Confidence', data: confidenceData, borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.1)', fill: true,
          tension: 0.4, pointRadius: 5, pointHoverRadius: 8
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(), font: { family: 'Inter', size: 12 } } },
        tooltip: { backgroundColor: '#16213e', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(139,92,246,0.3)', borderWidth: 1 }
      },
      scales: {
        x: { ticks: { color: 'rgba(148,163,184,0.7)', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148,163,184,0.08)' } },
        y: { min: 0, max: 10, ticks: { color: 'rgba(148,163,184,0.7)', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(148,163,184,0.08)' } }
      }
    }
  });
}
