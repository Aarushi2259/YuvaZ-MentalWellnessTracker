/**
 * YuvaZ – Parent Communication Assistant
 */
'use strict';

function renderParent() {
  return `
    <div style="max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:24px;">

      <!-- Header -->
      <div class="hero-banner animate-fadeInUp" style="background:linear-gradient(135deg,#7c2d12,#ea580c);">
        <div class="hero-content">
          <p class="hero-greeting">AI-Generated · Personalized</p>
          <h2 class="hero-title">💌 Parent Communication Assistant</h2>
          <p class="hero-subtitle">
            Sometimes it's hard to put feelings into words for the people we love.
            Let YuvaZ help you express what's in your heart.
          </p>
        </div>
        <div class="hero-graphic" aria-hidden="true">👨‍👩‍👦</div>
      </div>

      <!-- Why This Matters -->
      <div class="insight-card animate-fadeInUp delay-1">
        <h4>💡 Why This Matters</h4>
        <p>Research shows that when students feel emotionally supported at home, their exam performance improves by up to 25%. These messages are crafted to help parents understand — not to blame them.</p>
      </div>

      <!-- Situation Selector -->
      <div class="card animate-fadeInUp delay-2">
        <div class="card-header">
          <span class="card-title">📝 Select Your Situation</span>
        </div>
        <div class="grid-3" style="gap:12px;margin-bottom:20px;">
          ${[
            { id: 'stress', icon: '😤', label: 'I\'m Under Stress', desc: 'Feeling exam pressure & need support' },
            { id: 'burnout', icon: '🔥', label: 'I\'m Burnt Out', desc: 'Exhausted and need rest time' },
            { id: 'anxiety', icon: '😰', label: 'I\'m Anxious', desc: 'Exam anxiety affecting performance' }
          ].map(s => `
            <button class="wellness-card" onclick="generateParentMsg('${s.id}')"
              aria-label="Generate message for: ${s.label}"
              style="padding:20px;">
              <span class="wellness-icon" aria-hidden="true">${s.icon}</span>
              <h3 class="wellness-title">${s.label}</h3>
              <p class="wellness-desc">${s.desc}</p>
            </button>`).join('')}
        </div>

        <!-- Custom Name -->
        <div style="margin-bottom:16px;">
          <label for="student-name" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">
            Your Name (for the message)
          </label>
          <input type="text" id="student-name" class="input-field" style="min-height:auto;padding:10px 16px;"
            placeholder="Enter your name" value="Your child" aria-label="Your name for the message" />
        </div>
      </div>

      <!-- Generated Message -->
      <div id="parent-message-container" style="display:none;" aria-live="polite">
        <div class="card animate-fadeInUp" style="border:2px solid rgba(234,88,12,0.3);">
          <div class="card-header">
            <span class="card-title">✉️ Generated Message</span>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-ghost btn-sm" onclick="copyMessage()" aria-label="Copy message">📋 Copy</button>
              <button class="btn btn-ghost btn-sm" onclick="shareMessage()" aria-label="Share message">📤 Share</button>
            </div>
          </div>
          <div class="message-template" id="generated-message" aria-label="Generated parent message">
            <!-- Message goes here -->
          </div>
          <div style="margin-top:16px;padding:14px;background:rgba(245,158,11,0.08);border-radius:var(--radius-md);border:1px solid rgba(245,158,11,0.2);">
            <p style="font-size:12px;color:var(--text-secondary);">
              💛 This message is a starting point. Feel free to personalize it in your own voice. The goal is to open a conversation, not to be perfect.
            </p>
          </div>
        </div>
      </div>

      <!-- Tips for Parents Card -->
      <div class="card animate-fadeInUp delay-3">
        <div class="card-header">
          <span class="card-title">🤝 Tips for Healthy Family Support</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${[
            { icon: '✅', text: 'Ask "How are you feeling?" more than "How much did you study?"' },
            { icon: '✅', text: 'Celebrate small wins — finishing a chapter, understanding a concept' },
            { icon: '✅', text: 'Avoid comparing with siblings, cousins, or neighbors' },
            { icon: '✅', text: 'Create a study-friendly environment — minimize noise and interruptions' },
            { icon: '✅', text: 'Express unconditional love regardless of exam outcomes' },
            { icon: '❌', text: '"Sochte kya ho — padho!" (Stop thinking, just study!) — dismisses feelings' },
            { icon: '❌', text: 'Sharing neighbor\'s child\'s rank as motivation — creates comparison anxiety' }
          ].map(t => `
            <div style="display:flex;gap:10px;align-items:flex-start;">
              <span style="font-size:16px;flex-shrink:0;" aria-hidden="true">${t.icon}</span>
              <span style="font-size:13px;color:var(--text-secondary);">${t.text}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

async function generateParentMsg(situation) {
  const nameInput = document.getElementById('student-name');
  const name = nameInput?.value?.trim() || 'Your child';

  const container = document.getElementById('parent-message-container');
  const msgEl = document.getElementById('generated-message');
  if (!container || !msgEl) return;

  container.style.display = 'block';
  msgEl.textContent = 'Generating your personalized message...';

  await new Promise(r => setTimeout(r, 1000));

  const message = YuvaZAI.generateParentMessage(situation, name);
  msgEl.textContent = message;

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  YuvaZComponents.showToast('Message generated! Review and personalize before sharing.', 'success');
}

function copyMessage() {
  const msgEl = document.getElementById('generated-message');
  if (!msgEl?.textContent) return;

  navigator.clipboard.writeText(msgEl.textContent).then(() => {
    YuvaZComponents.showToast('Message copied to clipboard!', 'success');
  }).catch(() => {
    // Fallback
    const el = document.createElement('textarea');
    el.value = msgEl.textContent;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
    YuvaZComponents.showToast('Message copied!', 'success');
  });
}

function shareMessage() {
  const msgEl = document.getElementById('generated-message');
  if (!msgEl?.textContent) return;

  if (navigator.share) {
    navigator.share({
      title: 'A message from your child',
      text: msgEl.textContent
    }).catch(() => copyMessage());
  } else {
    copyMessage();
  }
}
