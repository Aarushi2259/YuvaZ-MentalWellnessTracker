/**
 * YuvaZ – Mood Check-In Page
 */
'use strict';

let moodState = { mood: null, energy: 5, stress: 5, confidence: 5, note: '' };

function renderMood() {
  const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy' },
    { id: 'motivated', emoji: '💪', label: 'Motivated' },
    { id: 'calm', emoji: '😌', label: 'Calm' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'anxious', emoji: '😰', label: 'Anxious' },
    { id: 'stressed', emoji: '😤', label: 'Stressed' },
    { id: 'overwhelmed', emoji: '🥺', label: 'Overwhelmed' },
    { id: 'sad', emoji: '😢', label: 'Sad' },
    { id: 'exhausted', emoji: '😩', label: 'Exhausted' },
    { id: 'angry', emoji: '😡', label: 'Angry' }
  ];

  const todayMood = YuvaZData.getTodayMood();
  if (todayMood?.mood) {
    moodState = { mood: todayMood.mood, energy: todayMood.energy, stress: todayMood.stress, confidence: todayMood.confidence, note: todayMood.note };
  }

  return `
    <div class="card animate-fadeInUp" style="max-width:680px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="font-size:48px;display:block;margin-bottom:12px;animation:floatUp 3s ease-in-out infinite;">🌈</span>
        <h2 style="font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;margin-bottom:6px;">How are you feeling today?</h2>
        <p style="color:var(--text-muted);font-size:14px;">Your feelings matter. No judgement here — just honest self-reflection.</p>
        ${todayMood?.mood ? `<span class="tag tag-green" style="margin-top:8px;">✅ Already checked in today — you can update</span>` : ''}
      </div>

      <!-- Mood Grid -->
      <div class="mood-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:28px;" role="group" aria-label="Select your mood">
        ${moods.map(m => `
          <button class="mood-btn ${moodState.mood === m.id ? 'selected' : ''}"
            data-mood="${m.id}"
            onclick="selectMood('${m.id}')"
            aria-pressed="${moodState.mood === m.id}"
            aria-label="${m.label} mood">
            <span class="mood-emoji" aria-hidden="true">${m.emoji}</span>
            <span class="mood-label">${m.label}</span>
          </button>`).join('')}
      </div>

      <!-- Sliders -->
      <div style="display:flex;flex-direction:column;gap:24px;margin-bottom:28px;">
        <div class="slider-container">
          <div class="slider-label">
            <span>⚡ Energy Level</span>
            <span class="slider-value" id="energy-val">${moodState.energy}</span>
          </div>
          <input type="range" id="energy-slider" min="1" max="10" value="${moodState.energy}"
            oninput="updateSlider('energy', this.value)"
            aria-label="Energy level from 1 to 10" aria-valuenow="${moodState.energy}" />
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
            <span>Drained</span><span>Energized</span>
          </div>
        </div>

        <div class="slider-container">
          <div class="slider-label">
            <span>🔥 Stress Level</span>
            <span class="slider-value" id="stress-val" style="color:${moodState.stress > 7 ? 'var(--accent-red)' : moodState.stress > 4 ? 'var(--accent-amber)' : 'var(--accent-green)'}">${moodState.stress}</span>
          </div>
          <input type="range" id="stress-slider" min="1" max="10" value="${moodState.stress}"
            oninput="updateSlider('stress', this.value)"
            aria-label="Stress level from 1 to 10" aria-valuenow="${moodState.stress}" />
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
            <span>Relaxed</span><span>Very Stressed</span>
          </div>
        </div>

        <div class="slider-container">
          <div class="slider-label">
            <span>💪 Confidence Level</span>
            <span class="slider-value" id="confidence-val" style="color:var(--accent-violet)">${moodState.confidence}</span>
          </div>
          <input type="range" id="confidence-slider" min="1" max="10" value="${moodState.confidence}"
            oninput="updateSlider('confidence', this.value)"
            aria-label="Confidence level from 1 to 10" aria-valuenow="${moodState.confidence}" />
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
            <span>Very Low</span><span>Very High</span>
          </div>
        </div>
      </div>

      <!-- Optional Note -->
      <div style="margin-bottom:24px;">
        <label for="mood-note" style="display:block;font-size:14px;font-weight:600;margin-bottom:8px;">
          💭 Any thoughts? <span style="color:var(--text-muted);font-weight:400;">(optional)</span>
        </label>
        <textarea id="mood-note" class="input-field" placeholder="What's on your mind today? Anything that affected your mood..."
          aria-label="Optional note about your mood"
          oninput="moodState.note=this.value">${moodState.note}</textarea>
      </div>

      <!-- AI Tip Preview -->
      <div id="mood-ai-tip" class="insight-card" style="display:${moodState.mood ? 'block' : 'none'};margin-bottom:20px;">
        <h4>🤖 AI Observation</h4>
        <p id="mood-tip-text">${getMoodTip(moodState.mood)}</p>
      </div>

      <!-- Submit -->
      <button class="btn btn-primary btn-block btn-lg ripple-effect"
        onclick="submitMoodCheckin()"
        id="mood-submit-btn"
        aria-label="Save your mood check-in"
        ${!moodState.mood ? 'disabled' : ''}>
        ${moodState.mood ? '✅ Save Check-In (+30 XP)' : 'Select a mood to continue'}
      </button>
    </div>`;
}

function selectMood(moodId) {
  moodState.mood = moodId;
  document.querySelectorAll('.mood-btn').forEach(btn => {
    const isSelected = btn.dataset.mood === moodId;
    btn.classList.toggle('selected', isSelected);
    btn.setAttribute('aria-pressed', isSelected.toString());
  });
  document.getElementById('mood-submit-btn').disabled = false;
  document.getElementById('mood-submit-btn').textContent = '✅ Save Check-In (+30 XP)';

  // Show AI tip
  const tip = document.getElementById('mood-ai-tip');
  const tipText = document.getElementById('mood-tip-text');
  if (tip && tipText) {
    tip.style.display = 'block';
    tipText.textContent = getMoodTip(moodId);
    if (['stressed', 'anxious', 'overwhelmed', 'sad', 'exhausted'].includes(moodId)) {
      tip.className = 'insight-card warning';
    } else {
      tip.className = 'insight-card success';
    }
  }

  YuvaZData.log('info', 'Mood selected', { mood: moodId });
}

function updateSlider(type, value) {
  moodState[type] = parseInt(value);
  const val = document.getElementById(`${type}-val`);
  if (val) {
    val.textContent = value;
    if (type === 'stress') {
      val.style.color = value > 7 ? 'var(--accent-red)' : value > 4 ? 'var(--accent-amber)' : 'var(--accent-green)';
    }
  }
}

function submitMoodCheckin() {
  if (!moodState.mood) return;

  const moods = [
    { id: 'happy', emoji: '😊' }, { id: 'motivated', emoji: '💪' }, { id: 'calm', emoji: '😌' },
    { id: 'neutral', emoji: '😐' }, { id: 'anxious', emoji: '😰' }, { id: 'stressed', emoji: '😤' },
    { id: 'overwhelmed', emoji: '🥺' }, { id: 'sad', emoji: '😢' }, { id: 'exhausted', emoji: '😩' }, { id: 'angry', emoji: '😡' }
  ];
  const selectedMood = moods.find(m => m.id === moodState.mood);

  YuvaZData.updateMoodToday({
    mood: moodState.mood,
    emoji: selectedMood?.emoji || '😐',
    energy: moodState.energy,
    stress: moodState.stress,
    confidence: moodState.confidence,
    note: moodState.note
  });

  // Update readiness pill in topbar
  const readiness = YuvaZAI.generateReadinessIndex(YuvaZData.getWeekMoods(), YuvaZData.getState().journals);
  const pill = document.querySelector('.readiness-pill strong');
  if (pill) pill.textContent = readiness.overall;

  YuvaZComponents.showToast('Mood check-in saved! +30 XP earned 🎉', 'success');

  // Check for high stress → suggest safety
  if (moodState.stress >= 9) {
    setTimeout(() => {
      YuvaZComponents.showToast('⚠️ Your stress is very high. Please talk to someone you trust.', 'warning', 6000);
    }, 2000);
  }

  setTimeout(() => YuvaZRouter.navigate('dashboard'), 1500);
}

function getMoodTip(mood) {
  const tips = {
    happy: 'Amazing! Use this positive energy for focused study. A happy brain learns 20% faster.',
    motivated: 'Channel this motivation into a deep Pomodoro session. Strike while the iron is hot! 🔥',
    calm: 'Calm is the ideal state for learning. Perfect time for complex topics or revision.',
    neutral: 'Neutral days are great for routine tasks — flashcards, formula revision, note-making.',
    anxious: 'Anxiety is your brain trying to protect you. Try 4-7-8 breathing before studying.',
    stressed: 'High stress impairs memory. A 10-minute break now will help you study better later.',
    overwhelmed: 'Break your to-do list into 3 micro-tasks. Start with just one. You can do this.',
    sad: 'It\'s okay to not be okay. Rest today, and consider journaling what you feel.',
    exhausted: 'Your brain needs fuel. Rest is productive. Take a proper break before your next session.',
    angry: 'Write down what\'s making you angry. Physical activity for 10 minutes helps release this energy.'
  };
  return tips[mood] || 'Every feeling is valid. Take a moment to breathe and reflect.';
}
