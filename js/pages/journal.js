/**
 * YuvaZ – AI Journal Page
 */
'use strict';

let journalText = '';
let isRecording = false;
let recognition = null;
let analysisResult = null;

function renderJournal() {
  const state = YuvaZData.getState();
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return `
    <div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;">

      <!-- Journal Editor -->
      <div class="card animate-fadeInLeft">
        <div class="journal-header" style="flex-wrap:wrap;gap:8px;">
          <span style="font-size:24px;" aria-hidden="true">📓</span>
          <h2 style="font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;">AI Journal</h2>
          <span class="journal-date">${date}</span>
        </div>

        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
          Write freely — your thoughts, feelings about preparation, fears, or anything on your mind.
          YuvaZ AI will analyze patterns and extract insights. 🔒 Completely private.
        </p>

        <!-- Voice Input -->
        <div class="voice-btn-wrap" style="margin-bottom:12px;">
          <button id="voice-btn" class="voice-btn ripple-effect" onclick="toggleVoiceRecording()"
            aria-label="Start voice recording" aria-pressed="false">
            🎙️ <span id="voice-btn-label">Voice Input</span>
          </button>
          <div id="waveform-container" style="display:none;" aria-hidden="true">
            <div class="waveform">
              <div class="wave-bar"></div><div class="wave-bar"></div>
              <div class="wave-bar"></div><div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
          </div>
          <span id="voice-status" style="font-size:12px;color:var(--text-muted);" aria-live="polite"></span>
        </div>

        <!-- Text Area -->
        <div class="input-wrap" style="margin-bottom:16px;">
          <textarea id="journal-input" class="input-field" style="min-height:220px;"
            placeholder="Today I'm feeling... The pressure from my mock test results... My parents keep asking..."
            oninput="journalText=this.value"
            aria-label="Journal entry text" aria-required="true">${journalText}</textarea>
        </div>

        <!-- Word Count -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <span id="word-count" style="font-size:12px;color:var(--text-muted);">0 words</span>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="clearJournal()" aria-label="Clear journal entry">🗑️ Clear</button>
            <button class="btn btn-primary btn-sm ripple-effect" onclick="analyzeJournalEntry()" aria-label="Analyze with AI">
              🤖 Analyze with AI (+60 XP)
            </button>
          </div>
        </div>

        <!-- Analysis Result -->
        <div id="analysis-container" style="display:none;" aria-live="polite">
          <div class="divider"></div>
          <h3 style="font-size:15px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            🔬 AI Analysis Results
          </h3>
          <div id="analysis-content"></div>
        </div>
      </div>

      <!-- Sidebar: Past Entries -->
      <div class="animate-fadeInRight" style="display:flex;flex-direction:column;gap:16px;">

        <div class="card">
          <div class="card-header">
            <span class="card-title">📜 Past Entries</span>
            <span class="tag tag-purple" aria-label="${YuvaZData.getState().journals.length} entries">${YuvaZData.getState().journals.length}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto;">
            ${state.journals.map(j => `
              <div class="insight-card ${j.burnoutRisk === 'high' ? 'danger' : j.sentimentScore < -0.3 ? 'warning' : 'success'}"
                role="article" aria-label="Journal entry from ${j.date}">
                <h4 style="display:flex;align-items:center;justify-content:space-between;">
                  ${j.date}
                  <span class="tag ${j.burnoutRisk === 'high' ? 'tag-red' : j.burnoutRisk === 'moderate' ? 'tag-amber' : 'tag-green'}" style="font-size:9px;">
                    ${j.burnoutRisk} burnout
                  </span>
                </h4>
                <p style="font-size:12px;margin-top:4px;">${j.text.substring(0, 90)}...</p>
                <div class="emotion-chips" style="margin-top:8px;">
                  ${j.emotions.slice(0, 3).map(e => `<span class="tag tag-purple" style="font-size:9px;">${e}</span>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Writing Prompts -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">💡 Prompts</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;" role="list">
            ${[
              'What made today challenging?',
              'When did I feel most capable?',
              'What\'s one fear about my exam?',
              'What am I grateful for today?',
              'How is pressure affecting my sleep?'
            ].map(p => `
              <button class="btn btn-ghost btn-sm" style="text-align:left;justify-content:flex-start;"
                onclick="usePrompt('${p}')" aria-label="Use prompt: ${p}" role="listitem">
                📝 ${p}
              </button>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function initJournalPage() {
  const input = document.getElementById('journal-input');
  if (input) {
    input.addEventListener('input', () => {
      const words = input.value.trim().split(/\s+/).filter(Boolean).length;
      const wc = document.getElementById('word-count');
      if (wc) wc.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });
  }
}

function toggleVoiceRecording() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    YuvaZComponents.showToast('Voice input not supported in your browser. Try Chrome!', 'warning');
    return;
  }

  const btn = document.getElementById('voice-btn');
  const label = document.getElementById('voice-btn-label');
  const wave = document.getElementById('waveform-container');
  const status = document.getElementById('voice-status');

  if (isRecording) {
    recognition?.stop();
    isRecording = false;
    btn.classList.remove('recording');
    btn.setAttribute('aria-pressed', 'false');
    label.textContent = 'Voice Input';
    if (wave) wave.style.display = 'none';
    if (status) status.textContent = '';
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-IN';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording = true;
    btn.classList.add('recording');
    btn.setAttribute('aria-pressed', 'true');
    label.textContent = 'Stop Recording';
    if (wave) wave.style.display = 'flex';
    if (status) status.textContent = 'Listening...';
    YuvaZComponents.showToast('🎙️ Recording started. Speak clearly.', 'info');
  };

  recognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    const input = document.getElementById('journal-input');
    if (input) {
      input.value = journalText + ' ' + transcript;
      const words = input.value.trim().split(/\s+/).filter(Boolean).length;
      const wc = document.getElementById('word-count');
      if (wc) wc.textContent = `${words} words`;
    }
  };

  recognition.onend = () => {
    journalText = document.getElementById('journal-input')?.value || journalText;
    isRecording = false;
    btn.classList.remove('recording');
    label.textContent = 'Voice Input';
    if (wave) wave.style.display = 'none';
    if (status) status.textContent = '';
  };

  recognition.onerror = (e) => {
    YuvaZComponents.showToast('Voice error: ' + e.error + '. Try again.', 'error');
    isRecording = false;
  };

  recognition.start();
}

function usePrompt(prompt) {
  const input = document.getElementById('journal-input');
  if (input) {
    input.value = (input.value + '\n\n' + prompt + ' ').trim() + ' ';
    journalText = input.value;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function clearJournal() {
  journalText = '';
  const input = document.getElementById('journal-input');
  if (input) input.value = '';
  const wc = document.getElementById('word-count');
  if (wc) wc.textContent = '0 words';
  document.getElementById('analysis-container').style.display = 'none';
}

async function analyzeJournalEntry() {
  const text = document.getElementById('journal-input')?.value?.trim();
  if (!text || text.length < 20) {
    YuvaZComponents.showToast('Please write at least a few sentences before analyzing.', 'warning');
    return;
  }

  const container = document.getElementById('analysis-container');
  const content = document.getElementById('analysis-content');
  if (!container || !content) return;

  container.style.display = 'block';
  content.innerHTML = '<div style="display:flex;align-items:center;gap:12px;padding:16px;"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><span style="color:var(--text-muted);font-size:13px;">YuvaZ AI is analyzing your journal...</span></div>';

  // Simulate AI delay
  await new Promise(r => setTimeout(r, 1800));

  const weekMoods = YuvaZData.getWeekMoods();
  const analysis = YuvaZAI.analyzeJournal(text, weekMoods);

  // Safety check
  if (analysis.safety.isCrisis) {
    YuvaZSafety.showSafetyModal();
  }

  // Save journal entry
  YuvaZData.addJournalEntry({
    text,
    sentimentScore: analysis.sentiment.score,
    emotions: analysis.emotions,
    triggers: analysis.triggers,
    burnoutRisk: analysis.burnoutRisk
  });

  const sentimentBarWidth = Math.round(Math.abs(analysis.sentiment.score) * 100);
  const sentimentClass = analysis.sentiment.score > 0 ? 'sentiment-positive' : analysis.sentiment.score < 0 ? 'sentiment-negative' : 'sentiment-neutral';

  content.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">

      <!-- Sentiment -->
      <div class="card" style="padding:16px;">
        <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;">📊 Sentiment Score</h4>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:24px;font-weight:800;color:${analysis.sentiment.color};">${analysis.sentiment.label}</span>
          <div style="flex:1;">
            <div class="progress-bar">
              <div class="progress-fill ${sentimentClass}" style="--target-width:${sentimentBarWidth}%;width:${sentimentBarWidth}%;background:${analysis.sentiment.color};"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emotions -->
      <div>
        <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">💭 Detected Emotions</h4>
        <div class="emotion-chips" role="list" aria-label="Detected emotions">
          ${YuvaZComponents.renderEmotionChips(analysis.emotions)}
        </div>
      </div>

      <!-- Triggers -->
      ${analysis.triggers.length > 0 ? `
        <div>
          <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">🎯 Stress Triggers</h4>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${analysis.triggers.slice(0, 3).map(t => {
              const labels = {
                mock_test_anxiety: '📝 Mock Test Anxiety', parental_pressure: '👨‍👩‍👦 Parental Pressure',
                social_comparison: '👥 Social Comparison', fear_of_failure: '😨 Fear of Failure',
                study_overload: '📚 Study Overload', burnout: '🔥 Burnout', procrastination: '⏳ Procrastination',
                lack_of_confidence: '💭 Low Confidence'
              };
              return `
                <div class="trigger-item">
                  <span class="trigger-label" style="font-size:13px;">${labels[t.id] || t.id}</span>
                  <div class="trigger-bar-wrap" style="flex:2;" role="progressbar" aria-valuenow="${Math.round(t.confidence*100)}" aria-valuemax="100">
                    <div class="trigger-bar" style="--target-width:${Math.round(t.confidence*100)}%;width:${Math.round(t.confidence*100)}%;background:var(--accent-purple);"></div>
                  </div>
                  <span class="trigger-pct">${Math.round(t.confidence*100)}%</span>
                </div>`;
            }).join('')}
          </div>
        </div>` : ''}

      <!-- Burnout -->
      <div class="insight-card ${analysis.burnoutRisk === 'high' ? 'danger' : analysis.burnoutRisk === 'moderate' ? 'warning' : 'success'}">
        <h4>🔥 Burnout Signal: ${analysis.burnoutRisk.charAt(0).toUpperCase() + analysis.burnoutRisk.slice(1)}</h4>
        <p>${analysis.burnoutRisk === 'high' ? 'Signs of significant burnout detected. Please prioritize rest and recovery.' :
              analysis.burnoutRisk === 'moderate' ? 'Moderate burnout risk. Schedule recovery activities and reduce study hours temporarily.' :
              'Low burnout risk. You\'re maintaining a healthy balance.'}</p>
      </div>

      <!-- AI Insight -->
      ${analysis.insight ? `
        <div class="insight-card">
          <h4>🔑 AI Pattern Insight</h4>
          <p>${analysis.insight}</p>
        </div>` : ''}

      <!-- Recommendations -->
      <div>
        <h4 style="font-size:13px;font-weight:700;margin-bottom:8px;">💊 Personalized Actions</h4>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${analysis.recommendations.map(r => `
            <div class="insight-card success" style="border-left-color:var(--accent-teal);">
              <h4>${r.icon} ${r.action}</h4>
            </div>`).join('')}
        </div>
      </div>

      <button class="btn btn-primary btn-block ripple-effect" onclick="YuvaZRouter.navigate('companion')" aria-label="Discuss with companion">
        💬 Discuss with YuvaZ Companion
      </button>
    </div>`;

  YuvaZComponents.showToast('Journal analyzed! +60 XP earned 🎉', 'success');
}
