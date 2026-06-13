/**
 * YuvaZ – Readiness Index Page
 */
'use strict';

function renderReadiness() {
  const state = YuvaZData.getState();
  const weekMoods = YuvaZData.getWeekMoods();
  const readiness = YuvaZAI.generateReadinessIndex(weekMoods, state.journals);
  const { overall, burnoutRisk, confidenceTrend, moodTrend, studyConsistency, sleepQuality, stressTrend } = readiness;

  const readinessColor = overall >= 70 ? 'var(--accent-green)' : overall >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)';
  const readinessLabel = overall >= 70 ? 'Exam Ready 🟢' : overall >= 40 ? 'Building Up 🟡' : 'Needs Support 🔴';

  return `
    <div style="max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:24px;">

      <!-- Main Readiness Card -->
      <div class="card animate-scaleIn" style="text-align:center;padding:40px;">
        <h2 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;margin-bottom:6px;">🎯 YuvaZ Readiness Index</h2>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:32px;">AI-generated based on your mood, journal, and consistency data</p>

        <div style="display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap;">
          <!-- Main Score Ring -->
          <div>
            ${YuvaZComponents.createProgressRing(overall, 100, 180, readinessColor, 'Index')}
            <p style="margin-top:12px;font-size:15px;font-weight:700;color:${readinessColor};">${readinessLabel}</p>
          </div>

          <!-- Burnout Ring -->
          <div>
            ${YuvaZComponents.createBurnoutGauge(burnoutRisk)}
          </div>

          <!-- Confidence -->
          <div style="text-align:center;">
            <div style="font-family:'Outfit',sans-serif;font-size:48px;font-weight:900;color:${confidenceTrend.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)'};">
              ${confidenceTrend}
            </div>
            <p style="font-size:12px;color:var(--text-muted);">Confidence Trend</p>
            <span class="tag ${confidenceTrend.startsWith('+') ? 'tag-green' : 'tag-red'}" style="margin-top:8px;">${confidenceTrend.startsWith('+') ? '↑ Improving' : '↓ Declining'}</span>
          </div>
        </div>
      </div>

      <!-- Component Scores -->
      <div class="grid-3" style="gap:16px;">
        ${[
          { label: 'Study Consistency', value: studyConsistency, color: 'var(--accent-blue)', icon: '📚', desc: 'Based on journaling and mood check-in frequency' },
          { label: 'Sleep Quality', value: sleepQuality, color: 'var(--accent-indigo)', icon: '😴', desc: 'Estimated from energy level patterns' },
          { label: 'Stress Management', value: Math.round(100 - (weekMoods.reduce((a,m)=>a+(m.stress||5),0)/weekMoods.length)*10), color: 'var(--accent-teal)', icon: '🧘', desc: 'Inverse of average stress level' }
        ].map(item => `
          <div class="card animate-fadeInUp">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <span style="font-size:24px;" aria-hidden="true">${item.icon}</span>
              <h3 style="font-size:14px;font-weight:700;">${item.label}</h3>
            </div>
            <div style="font-family:'Outfit',sans-serif;font-size:36px;font-weight:900;color:${item.color};margin-bottom:8px;">${item.value}%</div>
            <div class="progress-bar" style="margin-bottom:8px;" role="progressbar" aria-valuenow="${item.value}" aria-valuemax="100" aria-label="${item.label}: ${item.value}%">
              <div class="progress-fill" style="--target-width:${item.value}%;width:${item.value}%;background:${item.color};"></div>
            </div>
            <p style="font-size:12px;color:var(--text-muted);">${item.desc}</p>
          </div>`).join('')}
      </div>

      <!-- Trend Analysis -->
      <div class="card animate-fadeInUp delay-3">
        <div class="card-header">
          <span class="card-title">📊 Trend Analysis</span>
          <span class="tag tag-purple">AI Analysis</span>
        </div>
        <div class="grid-2" style="gap:20px;">
          <div>
            <h4 style="font-size:13px;font-weight:700;margin-bottom:12px;">Mood Trend</h4>
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg-tertiary);border-radius:var(--radius-md);">
              <span style="font-size:28px;" aria-hidden="true">${moodTrend === 'improving' ? '📈' : '📉'}</span>
              <div>
                <p style="font-weight:700;color:${moodTrend === 'improving' ? 'var(--accent-green)' : 'var(--accent-amber)'};">${moodTrend === 'improving' ? 'Improving' : 'Needs Attention'}</p>
                <p style="font-size:12px;color:var(--text-muted);">Based on 7-day energy pattern</p>
              </div>
            </div>
          </div>
          <div>
            <h4 style="font-size:13px;font-weight:700;margin-bottom:12px;">Stress Trend</h4>
            <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--bg-tertiary);border-radius:var(--radius-md);">
              <span style="font-size:28px;" aria-hidden="true">${stressTrend === 'stable' ? '🟢' : '🔴'}</span>
              <div>
                <p style="font-weight:700;color:${stressTrend === 'stable' ? 'var(--accent-green)' : 'var(--accent-red)'};">${stressTrend === 'stable' ? 'Stable' : 'Elevated'}</p>
                <p style="font-size:12px;color:var(--text-muted);">Based on stress level history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Recommendation -->
      <div class="card animate-fadeInUp delay-4" style="background:var(--gradient-hero);border:none;">
        <h3 style="color:#fff;font-family:'Outfit',sans-serif;font-size:18px;font-weight:700;margin-bottom:12px;">
          🤖 AI Recommendation for You
        </h3>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;line-height:1.7;margin-bottom:20px;">
          ${getReadinessRecommendation(overall, burnoutRisk)}
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button class="btn" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);"
            onclick="YuvaZRouter.navigate('wellness')" aria-label="Start wellness recovery">
            🌿 Recovery Actions
          </button>
          <button class="btn" style="background:#fff;color:var(--accent-purple);"
            onclick="YuvaZRouter.navigate('journal')" aria-label="Write in journal">
            📓 Journal Now
          </button>
        </div>
      </div>
    </div>`;
}

function getReadinessRecommendation(score, burnout) {
  if (score >= 80 && burnout < 30) {
    return 'Excellent readiness! You\'re in great shape mentally and emotionally. Keep maintaining your routine — sleep 7–8 hours, continue journaling, and trust your preparation. Don\'t let last-minute panic derail your progress.';
  } else if (score >= 60) {
    return 'Good momentum! A few targeted interventions can boost your readiness further. Focus on improving sleep quality and reducing comparison triggers. Try 10 minutes of mindfulness before study sessions to improve focus and retention.';
  } else if (burnout > 60) {
    return 'Burnout risk is high. This is your body and mind signaling that you need recovery before you can perform optimally. Take 1–2 days of lighter study, prioritize sleep, and use the Recovery Plan in Wellness Actions. Remember — rest is preparation.';
  } else {
    return 'Your readiness needs attention. The good news: this is completely fixable. Start with consistent daily check-ins, journal your emotions, and use the Companion to process stress. Small daily actions compound into massive improvement over weeks.';
  }
}
