/**
 * YuvaZ – Wellness Actions Page
 */
'use strict';

let activeWellness = null;

function renderWellness() {
  const state = YuvaZData.getState();
  const categories = ['All', 'breathwork', 'mindfulness', 'gratitude', 'confidence', 'focus', 'recovery'];
  const selectedCat = window._wellnessCat || 'All';

  const filtered = selectedCat === 'All' ? state.wellnessActions : state.wellnessActions.filter(w => w.category === selectedCat);

  return `
    <div style="display:flex;flex-direction:column;gap:24px;">

      <!-- Header -->
      <div class="hero-banner animate-fadeInUp" style="background:linear-gradient(135deg,#065f46,#14b8a6);">
        <div class="hero-content">
          <p class="hero-greeting">Personalized for you</p>
          <h2 class="hero-title">🌿 Wellness Actions</h2>
          <p class="hero-subtitle">AI-curated exercises to reduce burnout, boost confidence, and restore focus</p>
        </div>
        <div class="hero-graphic" aria-hidden="true">🧘</div>
      </div>

      <!-- Category Filter -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;" role="group" aria-label="Filter by category">
        ${categories.map(cat => `
          <button class="session-type-btn ${selectedCat === cat ? 'active' : ''}"
            onclick="filterWellness('${cat}')"
            aria-pressed="${selectedCat === cat}"
            aria-label="Filter by ${cat}">
            ${getCatIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>`).join('')}
      </div>

      <!-- Wellness Cards Grid -->
      <div class="grid-3" style="gap:20px;">
        ${filtered.map((w, i) => `
          <div class="wellness-card animate-fadeInUp delay-${Math.min(i+1,6)}"
            onclick="startWellnessActivity('${w.id}')"
            tabindex="0"
            role="button"
            aria-label="Start ${w.title} - ${w.duration}"
            onkeydown="if(event.key==='Enter'||event.key===' '){startWellnessActivity('${w.id}');}">
            <span class="wellness-icon" aria-hidden="true">${w.icon}</span>
            <h3 class="wellness-title">${w.title}</h3>
            <p class="wellness-desc">${w.desc}</p>
            <div class="wellness-duration">
              <span class="tag tag-teal">⏱ ${w.duration}</span>
              <span class="tag tag-purple" style="margin-left:6px;">+${w.xp} XP</span>
            </div>
          </div>`).join('')}
      </div>

      <!-- Active Session Modal -->
      <div id="wellness-session" style="display:none;" aria-live="polite"></div>

      <!-- Weekly Progress -->
      <div class="card animate-fadeInUp delay-4">
        <div class="card-header">
          <span class="card-title">📅 This Week's Wellness</span>
          <span class="tag tag-green">3 of 7 done</span>
        </div>
        <div class="grid-4" style="gap:12px;">
          ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => `
            <div style="text-align:center;padding:12px;background:${i < 3 ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)'};border-radius:var(--radius-md);border:1px solid ${i < 3 ? 'rgba(16,185,129,0.2)' : 'var(--border-subtle)'};"
              aria-label="${day}: ${i < 3 ? 'completed' : 'pending'}">
              <div style="font-size:18px;" aria-hidden="true">${i < 3 ? '✅' : '⭕'}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${day}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function getCatIcon(cat) {
  const icons = { All:'🌟', breathwork:'🌬️', mindfulness:'🧘', gratitude:'🙏', confidence:'💪', focus:'🎯', recovery:'🌙' };
  return icons[cat] || '✨';
}

function filterWellness(cat) {
  window._wellnessCat = cat;
  const content = document.getElementById('page-content');
  if (content) {
    content.innerHTML = renderWellness();
  }
}

function startWellnessActivity(id) {
  const state = YuvaZData.getState();
  const activity = state.wellnessActions.find(w => w.id === id);
  if (!activity) return;
  activeWellness = activity;

  const sessionEl = document.getElementById('wellness-session');
  if (!sessionEl) return;

  const guide = getWellnessGuide(id);
  sessionEl.style.display = 'block';
  sessionEl.innerHTML = `
    <div class="card" style="border:2px solid rgba(20,184,166,0.3);background:rgba(20,184,166,0.05);">
      <div class="card-header">
        <span class="card-title">${DOMPurify.sanitize(activity.icon)} ${DOMPurify.sanitize(activity.title)}</span>
        <button class="btn btn-ghost btn-sm" onclick="closeWellnessSession()" aria-label="Close session">✕ Close</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">
        <div>
          <h4 style="font-size:14px;font-weight:700;margin-bottom:12px;">How to do it:</h4>
          <ol style="padding-left:20px;display:flex;flex-direction:column;gap:10px;">
            ${guide.steps.map(s => `<li style="font-size:14px;line-height:1.6;color:var(--text-secondary);">${DOMPurify.sanitize(s)}</li>`).join('')}
          </ol>
        </div>
        <div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:var(--radius-lg);">
          <div style="font-size:64px;margin-bottom:16px;animation:floatUp 3s ease-in-out infinite;" aria-hidden="true">${DOMPurify.sanitize(activity.icon)}</div>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">${DOMPurify.sanitize(guide.benefit)}</p>
          <button class="btn btn-primary btn-block ripple-effect" onclick="completeWellness('${DOMPurify.sanitize(id)}')" aria-label="Mark as complete and earn XP">
            ✅ Complete (+${DOMPurify.sanitize(activity.xp)} XP)
          </button>
        </div>
      </div>
    </div>`;

  sessionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  YuvaZComponents.showToast(`Starting ${activity.title}... Follow the guide 🌿`, 'info');
}

function closeWellnessSession() {
  const sessionEl = document.getElementById('wellness-session');
  if (sessionEl) sessionEl.style.display = 'none';
}

function completeWellness(id) {
  const state = YuvaZData.getState();
  const activity = state.wellnessActions.find(w => w.id === id);
  if (!activity) return;

  state.user.xp += activity.xp;
  YuvaZData.save();

  closeWellnessSession();
  YuvaZComponents.showToast(`${activity.icon} ${activity.title} complete! +${activity.xp} XP 🎉`, 'success');
}

function getWellnessGuide(id) {
  const guides = {
    breathing: {
      steps: [
        'Sit comfortably with your back straight',
        'Inhale slowly through your nose for <strong>4 seconds</strong>',
        'Hold your breath for <strong>7 seconds</strong>',
        'Exhale completely through your mouth for <strong>8 seconds</strong>',
        'Repeat 4 times. Focus only on counting.'
      ],
      benefit: 'Activates parasympathetic nervous system. Reduces cortisol by up to 30% in 5 minutes.'
    },
    mindfulness: {
      steps: [
        'Close your eyes and take 3 deep breaths',
        'Scan from the top of your head slowly downward',
        'Notice any tension without judging it',
        'Breathe into each area of tension',
        'Open your eyes slowly. Notice how you feel.'
      ],
      benefit: 'Full-body awareness reduces physical stress symptoms and improves focus.'
    },
    gratitude: {
      steps: [
        'Open your journal or a fresh page',
        'Write <strong>"Today I am grateful for..."</strong>',
        'Write 3 specific things — no matter how small',
        'For each one, write why it matters to you',
        'Read them aloud once.'
      ],
      benefit: 'Gratitude practice shifts brain focus from threat to reward, reducing anxiety by 23%.'
    },
    confidence: {
      steps: [
        'Stand tall — feet shoulder-width apart, hands on hips',
        'Hold this "power pose" for <strong>2 minutes</strong>',
        'Say aloud: <em>"I am prepared. I am capable. I am improving every day."</em>',
        'Write 3 things you did well this week',
        'Repeat affirmations one more time.'
      ],
      benefit: 'Power posing increases testosterone and decreases cortisol, building confidence neurochemically.'
    },
    focus: {
      steps: [
        'Choose ONE specific task or topic',
        'Set a 25-minute timer in Focus Zone',
        'Close all apps except your study material',
        'Work with full attention — no switching',
        'Take a 5-minute break when timer ends.'
      ],
      benefit: 'Deep work builds myelin sheaths around neural pathways — literally making you better at the topic.'
    },
    recovery: {
      steps: [
        'Put all study materials away for now',
        'Drink a full glass of water',
        'Do 10 minutes of gentle stretching or walking',
        'Write in your journal about how you\'re feeling',
        'Set a specific start time for when you\'ll return to studying.'
      ],
      benefit: 'Planned recovery prevents burnout and improves long-term performance vs. pushing through.'
    }
  };
  return guides[id] || { steps: ['Follow the guided practice'], benefit: 'Improves mental wellbeing' };
}
