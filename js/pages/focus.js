/**
 * YuvaZ – Focus Zone (Pomodoro Timer)
 */
'use strict';

let timerInterval = null;
let timerSeconds = 25 * 60;
let timerTotal = 25 * 60;
let timerRunning = false;
let timerSession = 'focus';
let sessionsCompleted = 0;

const SESSION_TYPES = {
  focus: { label: 'Deep Focus', minutes: 25, color: '#7c3aed' },
  short: { label: 'Short Break', minutes: 5, color: '#10b981' },
  long: { label: 'Long Break', minutes: 15, color: '#14b8a6' }
};

function renderFocus() {
  const state = YuvaZData.getState();
  const { pomodoroStats } = state;

  return `
    <div style="max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:24px;">

      <!-- Timer Card -->
      <div class="card animate-scaleIn" style="text-align:center;padding:40px 28px;">
        <h2 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;margin-bottom:4px;">⏱️ Focus Zone</h2>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:28px;">AI-powered Pomodoro technique for exam preparation</p>

        <!-- Session Type Selector -->
        <div class="session-types" role="group" aria-label="Session type">
          ${Object.entries(SESSION_TYPES).map(([key, s]) => `
            <button class="session-type-btn ${timerSession === key ? 'active' : ''}"
              onclick="setSessionType('${key}')"
              aria-pressed="${timerSession === key}"
              aria-label="${s.label} - ${s.minutes} minutes">
              ${s.label} (${s.minutes}m)
            </button>`).join('')}
        </div>

        <!-- SVG Ring Timer -->
        <div class="pomodoro-ring" style="margin:32px auto;" role="timer" aria-live="off" aria-label="Timer">
          <svg class="pomodoro-svg" viewBox="0 0 220 220" aria-hidden="true">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#14b8a6;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle class="pomodoro-track" cx="110" cy="110" r="96" />
            <circle class="pomodoro-progress" id="timer-ring" cx="110" cy="110" r="96"
              stroke-dasharray="${2 * Math.PI * 96}"
              stroke-dashoffset="${getTimerOffset()}" />
          </svg>
          <div class="pomodoro-center">
            <div class="pomodoro-time" id="timer-display" aria-live="polite">${formatTime(timerSeconds)}</div>
            <div class="pomodoro-label" id="timer-label">${SESSION_TYPES[timerSession].label}</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="pomodoro-controls">
          <button class="btn btn-secondary btn-icon ripple-effect" onclick="resetTimer()" aria-label="Reset timer">⏮</button>
          <button class="btn btn-primary" style="min-width:120px;font-size:16px;" onclick="toggleTimer()" id="timer-btn" aria-label="${timerRunning ? 'Pause' : 'Start'} timer">
            ${timerRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button class="btn btn-secondary btn-icon ripple-effect" onclick="skipTimer()" aria-label="Skip to next session">⏭</button>
        </div>

        <!-- Sessions Progress -->
        <div style="margin-top:24px;">
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Today's Focus Sessions</p>
          <div style="display:flex;gap:6px;justify-content:center;" role="list" aria-label="Completed sessions">
            ${Array(8).fill(0).map((_, i) => `
              <div style="width:14px;height:14px;border-radius:50%;background:${i < (pomodoroStats.todaySessions + sessionsCompleted) ? 'var(--accent-purple)' : 'var(--bg-tertiary)'};"
                role="listitem" aria-label="Session ${i+1} ${i < pomodoroStats.todaySessions + sessionsCompleted ? 'completed' : 'pending'}">
              </div>`).join('')}
          </div>
          <p style="font-size:12px;color:var(--accent-violet);margin-top:8px;font-weight:600;">
            ${pomodoroStats.todaySessions + sessionsCompleted} sessions completed today
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="productivity-stats">
        <div class="prod-stat animate-fadeInUp delay-1">
          <div class="prod-stat-value">${pomodoroStats.totalFocusMinutes + (sessionsCompleted * 25)}</div>
          <div class="prod-stat-label">Total Focus Min</div>
        </div>
        <div class="prod-stat animate-fadeInUp delay-2">
          <div class="prod-stat-value">${pomodoroStats.weekSessions + sessionsCompleted}</div>
          <div class="prod-stat-label">Week Sessions</div>
        </div>
        <div class="prod-stat animate-fadeInUp delay-3">
          <div class="prod-stat-value">${pomodoroStats.currentStreak}</div>
          <div class="prod-stat-label">Day Streak</div>
        </div>
      </div>

      <!-- AI Break Recommendations -->
      <div class="card animate-fadeInUp delay-4">
        <div class="card-header">
          <span class="card-title">🤖 AI Break Recommendations</span>
          <span class="tag tag-teal">Personalized</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
            { icon: '🚶', title: 'Micro Walk', desc: 'Walk around for 5 minutes — boosts hippocampus and memory retention by 20%' },
            { icon: '💧', title: 'Hydration', desc: 'Drink a full glass of water — dehydration reduces cognitive performance by 10%' },
            { icon: '🌬️', title: 'Box Breathing', desc: '4 seconds in, 4 hold, 4 out, 4 hold — activates parasympathetic nervous system' },
            { icon: '👁️', title: '20-20-20 Rule', desc: 'Look at something 20 feet away for 20 seconds — prevents digital eye strain' }
          ].map(r => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-tertiary);border-radius:var(--radius-md);">
              <span style="font-size:24px;" aria-hidden="true">${r.icon}</span>
              <div>
                <h4 style="font-size:13px;font-weight:700;">${r.title}</h4>
                <p style="font-size:12px;color:var(--text-muted);">${r.desc}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function getTimerOffset() {
  const circumference = 2 * Math.PI * 96;
  const progress = timerSeconds / timerTotal;
  return circumference * (1 - progress);
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
  } else {
    timerRunning = true;
    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        onTimerComplete();
      }
    }, 1000);
  }

  const btn = document.getElementById('timer-btn');
  if (btn) btn.textContent = timerRunning ? '⏸ Pause' : '▶ Start';
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (display) display.textContent = formatTime(timerSeconds);

  const ring = document.getElementById('timer-ring');
  if (ring) {
    const circumference = 2 * Math.PI * 96;
    ring.style.strokeDashoffset = circumference * (1 - timerSeconds / timerTotal);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = SESSION_TYPES[timerSession].minutes * 60;
  timerTotal = timerSeconds;
  updateTimerDisplay();
  const btn = document.getElementById('timer-btn');
  if (btn) btn.textContent = '▶ Start';
}

function skipTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  onTimerComplete();
}

function setSessionType(type) {
  timerSession = type;
  resetTimer();
  document.querySelectorAll('.session-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(SESSION_TYPES[type].label));
    btn.setAttribute('aria-pressed', btn.textContent.includes(SESSION_TYPES[type].label).toString());
  });
  const label = document.getElementById('timer-label');
  if (label) label.textContent = SESSION_TYPES[type].label;
}

function onTimerComplete() {
  timerSeconds = 0;
  updateTimerDisplay();

  if (timerSession === 'focus') {
    sessionsCompleted++;
    YuvaZComponents.showToast('🎉 Focus session complete! +120 XP earned!', 'success', 5000);

    const state = YuvaZData.getState();
    state.pomodoroStats.todaySessions++;
    state.pomodoroStats.totalFocusMinutes += 25;
    state.user.xp += 120;
    YuvaZData.save();

    // Auto-suggest break
    setTimeout(() => {
      YuvaZComponents.showToast('🌬️ AI recommends a short break now. Your brain needs recovery time!', 'info', 5000);
    }, 1000);

    // Suggest long break after 4 sessions
    const newType = sessionsCompleted % 4 === 0 ? 'long' : 'short';
    setTimeout(() => setSessionType(newType), 2000);
  } else {
    YuvaZComponents.showToast('Break complete! Ready for another focus session? 💪', 'info', 4000);
    setTimeout(() => setSessionType('focus'), 1500);
  }
}
