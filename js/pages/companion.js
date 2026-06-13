/**
 * YuvaZ – AI Companion Chat Page
 */
'use strict';

let conversationHistory = [];
let isAiTyping = false;

const INITIAL_MESSAGE = {
  role: 'ai',
  text: `Namaste! 🙏 I'm **YuvaZ**, your personal mental wellness companion for exam preparation.

I'm here to listen, support, and guide you through the emotional challenges of JEE, NEET, UPSC, CAT, and other competitive exams.

**I can help you with:**
- 💭 Processing exam anxiety and stress
- 🧠 Building study confidence
- 💪 Overcoming parental pressure
- 🌙 Managing burnout
- 🎯 Staying motivated and focused

*Remember: I'm an AI companion for emotional support. For medical concerns, please consult a professional.*

How are you feeling today? What's on your mind?`,
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
};

function renderCompanion() {
  if (conversationHistory.length === 0) {
    conversationHistory.push(INITIAL_MESSAGE);
  }

  return `
    <div class="card animate-scaleIn" style="padding:0;overflow:hidden;max-width:800px;margin:0 auto;">

      <!-- Companion Header -->
      <div class="companion-header">
        <div class="avatar avatar-md avatar-ai animate-glow" aria-label="YuvaZ AI avatar">🤖</div>
        <div style="flex:1;">
          <h2 style="font-size:16px;font-weight:700;">YuvaZ Companion</h2>
          <div class="companion-status">
            <div class="companion-status-dot" aria-hidden="true"></div>
            <span>Active · Exam-Aware AI</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" onclick="clearConversation()" aria-label="Clear conversation">🗑️ Clear</button>
          <button class="btn btn-secondary btn-sm" onclick="exportConversation()" aria-label="Export conversation">📥 Export</button>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="chat-container">
        <div class="chat-messages" id="chat-messages" role="log" aria-label="Conversation messages" aria-live="polite">
          ${renderAllMessages()}
        </div>

        <!-- Quick Replies -->
        <div style="padding:0 20px 8px;display:flex;gap:8px;flex-wrap:wrap;" role="group" aria-label="Quick reply options">
          ${[
            "I'm feeling anxious 😰",
            "Parents are pressuring me",
            "I keep comparing myself",
            "I feel like giving up",
            "Motivate me! 💪"
          ].map(q => `<button class="btn btn-ghost btn-sm" onclick="sendQuickReply('${q}')" aria-label="Quick reply: ${q}">${q}</button>`).join('')}
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <textarea class="chat-input" id="chat-input" placeholder="Share what's on your mind..."
            aria-label="Message input" rows="1"
            onkeydown="handleChatKeydown(event)"
            oninput="autoResizeChatInput(this)"></textarea>
          <button class="btn btn-primary btn-icon ripple-effect" onclick="sendMessage()" id="send-btn" aria-label="Send message" style="flex-shrink:0;width:44px;height:44px;">
            ➤
          </button>
        </div>

        <!-- Disclaimer -->
        <p style="text-align:center;font-size:11px;color:var(--text-muted);padding:8px 20px 16px;">
          🔒 Private & confidential · Not a substitute for professional help
        </p>
      </div>
    </div>

    <!-- Crisis Resources Bar -->
    <div class="safety-banner animate-fadeInUp delay-2" style="max-width:800px;margin:16px auto 0;">
      <span class="safety-banner-icon">🆘</span>
      <div class="safety-banner-text">
        <h4>Need Immediate Help?</h4>
        <p>If you're in crisis, please reach out to iCall (9152987821) or Vandrevala Foundation (1860-2662-345)</p>
      </div>
      <button class="btn btn-danger btn-sm" onclick="YuvaZSafety.showSafetyModal()" aria-label="View emergency resources">Resources</button>
    </div>`;
}

function renderAllMessages() {
  return conversationHistory.map(msg => renderMessage(msg)).join('');
}

function renderMessage(msg) {
  const isUser = msg.role === 'user';
  const formattedText = formatMessageText(msg.text);

  return `
    <div class="chat-row ${isUser ? 'user-row' : ''}" role="article" aria-label="${isUser ? 'Your message' : 'YuvaZ response'}">
      ${!isUser ? `<div class="avatar avatar-sm avatar-ai" aria-hidden="true">🤖</div>` : ''}
      <div>
        <div class="chat-bubble ${isUser ? 'user' : 'ai'}">${formattedText}</div>
        <div class="chat-time" style="text-align:${isUser ? 'right' : 'left'};">${msg.time}</div>
      </div>
      ${isUser ? `<div class="avatar avatar-sm avatar-user" aria-hidden="true">A</div>` : ''}
    </div>`;
}

function formatMessageText(text) {
  // Bold, line breaks, links formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResizeChatInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function sendQuickReply(text) {
  const input = document.getElementById('chat-input');
  if (input) input.value = text;
  sendMessage();
}

async function sendMessage() {
  if (isAiTyping) return;

  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';

  const userMsg = {
    role: 'user',
    text,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  };

  conversationHistory.push(userMsg);
  appendMessageToDOM(userMsg);
  scrollToBottom();

  // Show typing indicator
  isAiTyping = true;
  showTypingIndicator();

  try {
    const response = await YuvaZAI.getCompanionResponse(text, conversationHistory);

    removeTypingIndicator();

    const aiMsg = {
      role: 'ai',
      text: response.text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    conversationHistory.push(aiMsg);
    appendMessageToDOM(aiMsg);
    scrollToBottom();

    if (response.showSafetyModal) {
      setTimeout(() => YuvaZSafety.showSafetyModal(), 500);
    }

    YuvaZData.log('info', 'Companion message sent', { messageLength: text.length, isCrisis: response.isCrisis });

  } catch (err) {
    removeTypingIndicator();
    YuvaZComponents.showToast('Something went wrong. Please try again.', 'error');
    YuvaZData.log('error', 'Companion response failed', { error: err.message });
  } finally {
    isAiTyping = false;
  }
}

function appendMessageToDOM(msg) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.innerHTML = renderMessage(msg);
  container.appendChild(div.firstElementChild);
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'chat-row';
  div.setAttribute('aria-label', 'YuvaZ is typing');
  div.innerHTML = `
    <div class="avatar avatar-sm avatar-ai" aria-hidden="true">🤖</div>
    <div class="chat-bubble ai" style="padding:8px 14px;">
      <div class="typing-indicator">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>`;
  container.appendChild(div);
  scrollToBottom();
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function scrollToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

function clearConversation() {
  conversationHistory = [INITIAL_MESSAGE];
  const container = document.getElementById('chat-messages');
  if (container) container.innerHTML = renderAllMessages();
  YuvaZComponents.showToast('Conversation cleared.', 'info');
}

function exportConversation() {
  const text = conversationHistory.map(m =>
    `[${m.time}] ${m.role === 'user' ? 'You' : 'YuvaZ'}: ${m.text.replace(/<[^>]*>/g, '')}`
  ).join('\n\n');

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yuvaz-conversation-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  YuvaZComponents.showToast('Conversation exported!', 'success');
}
