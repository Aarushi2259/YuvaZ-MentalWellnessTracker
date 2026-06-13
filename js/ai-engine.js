/**
 * YuvaZ – AI Engine
 * Simulated Generative AI layer with:
 * - Sentiment Analysis
 * - Emotion Extraction
 * - Trigger Detection
 * - Burnout Signal Detection
 * - Readiness Index Generation
 * - Personalized Companion Responses
 * - Safety Layer (distress detection)
 *
 * In production: connects to Google Gemini API / OpenAI
 * with prompt chaining, context memory, and RAG.
 */

'use strict';

const YuvaZAI = (() => {

  // ── Safety Keywords (Priority Layer) ──────────────────────
  const CRISIS_SIGNALS = [
    'want to die', 'end my life', 'kill myself', 'no point living',
    'suicide', 'self harm', 'hurt myself', 'give up on life',
    'can\'t take it anymore', 'hopeless', 'useless', 'worthless',
    'nobody cares', 'better off dead', 'don\'t want to exist'
  ];

  const DISTRESS_SIGNALS = [
    'crying all day', 'can\'t stop crying', 'completely broken',
    'falling apart', 'breaking down', 'exhausted beyond', 'can\'t function'
  ];

  // ── Emotion Keywords Map ───────────────────────────────────
  const EMOTION_MAP = {
    anxiety: ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'dread'],
    stress: ['stressed', 'pressure', 'overwhelmed', 'too much', 'burden', 'load'],
    self_doubt: ['not good enough', 'can\'t do it', 'failing', 'stupid', 'dumb', 'incapable'],
    comparison: ['everyone else', 'topper', 'rank', 'better than me', 'friends are'],
    motivation: ['motivated', 'determined', 'going to', 'will achieve', 'strong'],
    sadness: ['sad', 'depressed', 'unhappy', 'miserable', 'low', 'down'],
    exhaustion: ['tired', 'exhausted', 'drained', 'no energy', 'fatigue', 'sleep'],
    anger: ['angry', 'frustrated', 'irritated', 'annoyed', 'mad', 'furious'],
    hope: ['hope', 'better tomorrow', 'improve', 'progress', 'will be okay'],
    joy: ['happy', 'great', 'excited', 'good day', 'proud', 'achieved']
  };

  // ── Trigger Keywords ───────────────────────────────────────
  const TRIGGER_MAP = {
    mock_test_anxiety: ['mock', 'test', 'exam', 'score', 'rank', 'marks', 'paper', 'result'],
    parental_pressure: ['parents', 'mom', 'dad', 'family', 'expectations', 'pressure from', 'scolded'],
    social_comparison: ['friends', 'topper', 'everyone else', 'batch', 'class', 'coaching'],
    fear_of_failure: ['fail', 'failure', 'not selected', 'what if', 'worst case'],
    study_overload: ['chapters left', 'syllabus', 'too much to study', 'backlog', 'revision'],
    burnout: ['can\'t study', 'no motivation', 'giving up', 'done with', 'exhausted from studying'],
    procrastination: ['wasting time', 'distracted', 'phone', 'youtube', 'social media', 'couldn\'t study'],
    lack_of_confidence: ['not confident', 'doubt myself', 'not sure', 'maybe i can\'t']
  };

  // ── AI Companion Prompts ───────────────────────────────────
  const COMPANION_RESPONSES = {
    anxiety: [
      "I can hear that you're feeling anxious. That's completely understandable — the pressure of exam prep is real. Let's take one breath together. 🌬️ Can you tell me what's worrying you the most right now?",
      "Anxiety before exams is your brain's way of saying 'this matters to you.' That's actually a sign of dedication. What specifically is making you anxious today?",
      "You've been handling so much pressure. Your feelings are valid. Would you like to try a quick 4-7-8 breathing exercise to settle your mind?"
    ],
    parental_pressure: [
      "Parental expectations can feel like a heavy weight sometimes. They care, but their way of showing it isn't always what you need. What did they say that's bothering you?",
      "I hear you. It's hard when the people you love become a source of stress. Would it help if we drafted a message together that you could share with them about how you're feeling?",
      "You are more than your exam score. Your worth isn't defined by rank. 💙 Have you been able to talk to your parents about how you're feeling inside?"
    ],
    comparison: [
      "Social comparison is one of the biggest confidence killers for aspirants. But remember — you're seeing their highlights, not their struggles. 📱",
      "Every topper you see also has days of doubt and failure. What matters is your journey, your pace. What's one thing YOU improved at this week?",
      "Comparison is the thief of joy. Your only competitor is yesterday's version of yourself. What progress have you made that you haven't given yourself credit for?"
    ],
    stress: [
      "Your stress levels seem elevated. That's your body's signal to pause and reset. 🛑 Let's not push through blindly — let's address what's causing it.",
      "High stress over time leads to burnout, which actually reduces performance. Rest is part of preparation. Have you taken a proper break today?",
      "I notice you've been under significant stress. Small actions help: drink water, step outside for 5 minutes, or try progressive muscle relaxation. Which feels doable right now?"
    ],
    motivation: [
      "That's the energy I love to see! 🔥 Channel this into focused study blocks. What topic or chapter are you going to conquer today?",
      "Motivation is the fuel, discipline is the engine. Since you're feeling motivated, let's set a specific 2-hour deep work goal right now.",
      "Amazing! Motivation peaks are precious — use them wisely. Set a Pomodoro session in the Focus Zone and make today count! 🎯"
    ],
    default: [
      "I'm here with you. Tell me more about what's on your mind — I'm listening without judgment. 💙",
      "Thank you for sharing that with me. Your feelings matter and so does your wellbeing. What would feel most helpful right now — talking through it, a coping exercise, or just some encouragement?",
      "You're dealing with a lot, and the fact that you're here and reflecting on your feelings shows real courage. 🌟 How long have you been feeling this way?",
      "Every aspirant goes through these moments. You're not alone — thousands of students feel exactly like this. But your story isn't over. What's one small thing that could make tomorrow slightly better?",
      "I appreciate you trusting me with this. Let's work through it together. Sometimes just naming the emotion helps. What would you say you're feeling the most right now?"
    ]
  };

  const REFLECTION_PROMPTS = [
    "What made you feel capable today, even in a small way?",
    "If you could give advice to a friend feeling what you're feeling, what would you say?",
    "What's one thing you've learned this week that you're proud of?",
    "What does your ideal study day look like? What's one step toward that?",
    "Who in your life makes you feel supported? Have you talked to them recently?",
    "What are three things about yourself as a student that you genuinely value?",
    "When was the last time you felt genuinely confident? What was different then?"
  ];

  // ── Sentiment Analysis ─────────────────────────────────────
  function analyzeSentiment(text) {
    const lower = text.toLowerCase();
    const positiveWords = ['good', 'great', 'happy', 'proud', 'motivated', 'strong', 'achieved', 'better', 'progress', 'confident', 'excellent', 'amazing', 'love', 'wonderful', 'hope'];
    const negativeWords = ['bad', 'sad', 'fail', 'angry', 'anxious', 'stressed', 'overwhelmed', 'tired', 'exhausted', 'scared', 'worried', 'hopeless', 'worthless', 'panic', 'depressed', 'pressure', 'burden'];

    let score = 0;
    let posCount = 0;
    let negCount = 0;

    positiveWords.forEach(w => { if (lower.includes(w)) { score += 0.15; posCount++; } });
    negativeWords.forEach(w => { if (lower.includes(w)) { score -= 0.15; negCount++; } });

    score = Math.max(-1, Math.min(1, score));

    let label, color;
    if (score > 0.15) { label = 'Positive'; color = 'var(--accent-green)'; }
    else if (score < -0.15) { label = 'Challenging'; color = 'var(--accent-red)'; }
    else { label = 'Neutral'; color = 'var(--text-muted)'; }

    return { score, label, color, positiveCount: posCount, negativeCount: negCount };
  }

  // ── Emotion Extraction ─────────────────────────────────────
  function extractEmotions(text) {
    const lower = text.toLowerCase();
    const detected = [];

    Object.entries(EMOTION_MAP).forEach(([emotion, keywords]) => {
      if (keywords.some(k => lower.includes(k))) {
        detected.push(emotion);
      }
    });

    return detected.length > 0 ? detected : ['reflection'];
  }

  // ── Trigger Detection ──────────────────────────────────────
  function detectTriggers(text) {
    const lower = text.toLowerCase();
    const detected = [];

    Object.entries(TRIGGER_MAP).forEach(([trigger, keywords]) => {
      const matchCount = keywords.filter(k => lower.includes(k)).length;
      if (matchCount >= 1) {
        detected.push({ id: trigger, confidence: Math.min(0.95, 0.5 + matchCount * 0.15) });
      }
    });

    return detected.sort((a, b) => b.confidence - a.confidence);
  }

  // ── Burnout Detection ──────────────────────────────────────
  function detectBurnout(text, moodHistory) {
    const lower = text.toLowerCase();
    let burnoutScore = 0;

    // Text signals
    const burnoutSignals = ['can\'t study', 'no motivation', 'giving up', 'done with everything', 'exhausted', 'can\'t continue', 'drained'];
    burnoutSignals.forEach(s => { if (lower.includes(s)) burnoutScore += 0.2; });

    // Mood history signals
    if (moodHistory && moodHistory.length > 0) {
      const recentMoods = moodHistory.slice(-5);
      const avgStress = recentMoods.reduce((a, m) => a + (m.stress || 0), 0) / recentMoods.length;
      const avgEnergy = recentMoods.reduce((a, m) => a + (m.energy || 5), 0) / recentMoods.length;

      if (avgStress > 7) burnoutScore += 0.3;
      if (avgEnergy < 4) burnoutScore += 0.25;
    }

    burnoutScore = Math.min(1, burnoutScore);

    if (burnoutScore > 0.6) return 'high';
    if (burnoutScore > 0.3) return 'moderate';
    return 'low';
  }

  // ── Safety Check ───────────────────────────────────────────
  function checkSafety(text) {
    const lower = text.toLowerCase();

    const crisisDetected = CRISIS_SIGNALS.some(signal => lower.includes(signal));
    const distressDetected = DISTRESS_SIGNALS.some(signal => lower.includes(signal));

    return {
      crisisLevel: crisisDetected ? 'critical' : distressDetected ? 'high' : 'low',
      isCrisis: crisisDetected,
      isDistress: distressDetected
    };
  }

  // ── Generate Journal Analysis ──────────────────────────────
  function analyzeJournal(text, moodHistory) {
    const sentiment = analyzeSentiment(text);
    const emotions = extractEmotions(text);
    const triggers = detectTriggers(text);
    const burnoutRisk = detectBurnout(text, moodHistory);
    const safety = checkSafety(text);

    // Generate explainable insight
    let insight = '';
    if (triggers.length > 0) {
      const topTrigger = triggers[0];
      const triggerLabels = {
        mock_test_anxiety: 'Mock test discussions',
        parental_pressure: 'Parental pressure themes',
        social_comparison: 'Social comparison patterns',
        fear_of_failure: 'Fear of failure signals',
        study_overload: 'Study overload patterns',
        burnout: 'Burnout indicators',
        procrastination: 'Procrastination themes',
        lack_of_confidence: 'Confidence challenges'
      };
      const label = triggerLabels[topTrigger.id] || 'Stress triggers';
      const pct = Math.round(topTrigger.confidence * 100);
      insight = `${label} are associated with a ${pct}% increase in emotional difficulty in your recent entries.`;
    }

    const weeklyPattern = emotions.includes('anxiety') && emotions.includes('self_doubt')
      ? 'Anxiety + self-doubt combination detected. This is common before major mock tests and resolves with structured preparation reassurance.'
      : 'Your emotional patterns show a mix of challenge and resilience. Keep journaling to track your growth.';

    return {
      sentiment,
      emotions,
      triggers,
      burnoutRisk,
      safety,
      insight,
      weeklyPattern,
      recommendations: generateRecommendations(emotions, triggers, burnoutRisk)
    };
  }

  // ── Generate Personalized Recommendations ─────────────────
  function generateRecommendations(emotions, triggers, burnoutRisk) {
    const recs = [];

    if (emotions.includes('anxiety') || emotions.includes('stress')) {
      recs.push({ type: 'breathwork', action: 'Try 4-7-8 breathing right now', icon: '🌬️', priority: 1 });
    }
    if (triggers.some(t => t.id === 'mock_test_anxiety')) {
      recs.push({ type: 'reframe', action: 'Reframe mock tests as feedback, not judgment', icon: '🧠', priority: 2 });
    }
    if (triggers.some(t => t.id === 'parental_pressure')) {
      recs.push({ type: 'communication', action: 'Use Parent Connect to draft a message', icon: '💌', priority: 2 });
    }
    if (burnoutRisk === 'high' || burnoutRisk === 'moderate') {
      recs.push({ type: 'recovery', action: 'Schedule a recovery session in Wellness Actions', icon: '🌙', priority: 1 });
    }
    if (emotions.includes('comparison')) {
      recs.push({ type: 'mindfulness', action: 'Practice a 5-minute self-compassion meditation', icon: '🧘', priority: 2 });
    }

    if (recs.length === 0) {
      recs.push({ type: 'gratitude', action: 'Write 3 things you\'re grateful for today', icon: '🙏', priority: 3 });
    }

    return recs.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }

  // ── Generate Companion Response ────────────────────────────
  async function getCompanionResponse(userMessage, conversationHistory = []) {
    // Simulate AI processing delay
    await delay(1200 + Math.random() * 800);

    const lower = userMessage.toLowerCase();
    const safety = checkSafety(userMessage);

    // Safety layer: always check first
    if (safety.isCrisis) {
      return {
        text: "I can hear that you're in a really dark place right now, and I'm so glad you told me. Please know you are not alone. 💙\n\nWhat you're feeling is real, but it doesn't mean things can't get better. Right now, I need you to reach out to someone who can truly help:\n\n📞 **iCall: 9152987821** (Mon-Sat, 8am-10pm)\n📞 **Vandrevala Foundation: 1860-2662-345** (24/7)\n\nYou matter. Please make that call. I'll be right here with you.",
        isCrisis: true,
        showSafetyModal: true
      };
    }

    if (safety.isDistress) {
      return {
        text: "It sounds like you're going through something really painful right now. Thank you for trusting me. 💙\n\nYour feelings are completely valid. Are you in a safe place right now? If things feel overwhelming, please consider calling iCall at **9152987821** — they understand what students go through.\n\nI'm here. Tell me more about what's happening.",
        isCrisis: false,
        showSafetyModal: false
      };
    }

    // Context-aware response selection
    let responsePool = COMPANION_RESPONSES.default;

    if (lower.includes('anxious') || lower.includes('nervous') || lower.includes('panic')) {
      responsePool = COMPANION_RESPONSES.anxiety;
    } else if (lower.includes('parents') || lower.includes('mom') || lower.includes('dad') || lower.includes('pressure')) {
      responsePool = COMPANION_RESPONSES.parental_pressure;
    } else if (lower.includes('compare') || lower.includes('topper') || lower.includes('everyone else') || lower.includes('friends')) {
      responsePool = COMPANION_RESPONSES.comparison;
    } else if (lower.includes('stress') || lower.includes('overwhelmed') || lower.includes('too much')) {
      responsePool = COMPANION_RESPONSES.stress;
    } else if (lower.includes('motivated') || lower.includes('ready') || lower.includes('excited')) {
      responsePool = COMPANION_RESPONSES.motivation;
    }

    // Occasionally add reflection prompt
    let response = responsePool[Math.floor(Math.random() * responsePool.length)];
    if (Math.random() > 0.6) {
      const prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
      response += `\n\n💭 *Reflection: ${prompt}*`;
    }

    return { text: response, isCrisis: false, showSafetyModal: false };
  }

  // ── Generate Readiness Index ───────────────────────────────
  function generateReadinessIndex(moodHistory, journalHistory) {
    const state = YuvaZData.getState();
    const recent = moodHistory.slice(-7).filter(m => m.mood !== null);

    if (recent.length === 0) return state.readinessIndex;

    const avgStress = recent.reduce((a, m) => a + (m.stress || 5), 0) / recent.length;
    const avgEnergy = recent.reduce((a, m) => a + (m.energy || 5), 0) / recent.length;
    const avgConfidence = recent.reduce((a, m) => a + (m.confidence || 5), 0) / recent.length;
    const journalConsistency = Math.min(100, journalHistory.length * 14);
    const streakBonus = Math.min(20, state.user.streak * 2);

    const readiness = Math.round(
      (avgConfidence / 10 * 30) +
      ((10 - avgStress) / 10 * 25) +
      (avgEnergy / 10 * 20) +
      (journalConsistency / 100 * 15) +
      streakBonus * 0.5
    );

    const burnoutRisk = Math.round(
      (avgStress / 10 * 50) +
      ((10 - avgEnergy) / 10 * 30) +
      (journalHistory.filter(j => j.burnoutRisk !== 'low').length * 4)
    );

    return {
      overall: Math.min(99, Math.max(10, readiness)),
      burnoutRisk: Math.min(95, Math.max(5, burnoutRisk)),
      confidenceTrend: avgConfidence > 6 ? '+' + Math.round(avgConfidence * 2) + '%' : '-' + Math.round((7 - avgConfidence) * 3) + '%',
      moodTrend: avgEnergy > 5 ? 'improving' : 'needs attention',
      studyConsistency: Math.round(journalConsistency * 0.7 + streakBonus),
      sleepQuality: Math.round(avgEnergy * 8), // proxy
      stressTrend: avgStress > 6 ? 'elevated' : 'stable'
    };
  }

  // ── Generate Weekly Summary ────────────────────────────────
  function generateWeeklySummary(moodHistory, journalHistory) {
    const recent = moodHistory.slice(-7).filter(m => m.mood !== null);
    if (recent.length === 0) return null;

    const avgStress = (recent.reduce((a, m) => a + (m.stress || 5), 0) / recent.length).toFixed(1);
    const avgEnergy = (recent.reduce((a, m) => a + (m.energy || 5), 0) / recent.length).toFixed(1);
    const allEmotions = journalHistory.flatMap(j => j.emotions || []);
    const topEmotion = getMostFrequent(allEmotions) || 'reflection';
    const allTriggers = journalHistory.flatMap(j => (j.triggers || []).map(t => t.id || t));
    const topTrigger = getMostFrequent(allTriggers);

    return {
      avgStress,
      avgEnergy,
      topEmotion,
      topTrigger,
      journalCount: journalHistory.length,
      insight: topTrigger
        ? `"${formatTrigger(topTrigger)}" appeared in ${Math.round((allTriggers.filter(t => t === topTrigger).length / allTriggers.length) * 100)}% of your journal entries this week.`
        : 'Keep journaling to unlock your weekly AI insights.',
      suggestion: generateWeeklySuggestion(topTrigger, parseFloat(avgStress))
    };
  }

  function generateWeeklySuggestion(trigger, avgStress) {
    if (avgStress > 7) return 'Your stress is elevated. Prioritize 7+ hours of sleep and schedule daily 5-min breathing sessions.';
    if (trigger === 'mock_test_anxiety') return 'Try treating each mock as a diagnostic tool, not a performance test. Track improvement, not rank.';
    if (trigger === 'parental_pressure') return 'Have an open conversation with your parents about your preparation strategy. Involve them as allies, not evaluators.';
    if (trigger === 'social_comparison') return 'Unfollow accounts that make you feel inadequate. Focus on your own previous-week improvements.';
    return 'You\'re making great progress. Maintain your journaling habit to keep building self-awareness.';
  }

  // ── Parent Message Generator ───────────────────────────────
  function generateParentMessage(situation, studentName = 'Your child') {
    const messages = {
      stress: `Dear Mom/Dad,

I wanted to share something with you because I trust you and I know you want the best for me.

These past few weeks of exam preparation have been really challenging. I'm trying my absolute best, but the pressure I feel is sometimes making it hard to concentrate and sleep well.

I'm not saying this to make excuses. I'm sharing because I need your support in a specific way — not more pressure, but reassurance that you love me regardless of my result.

Your belief in me means everything. When I hear "I know you'll do your best and we're proud of you," it genuinely helps me study better.

Can we talk about this together? I love you and I'm working hard every day.

With love,
${studentName}`,

      burnout: `Dear Mom/Dad,

I need to be honest with you — I'm feeling burnt out from studying.

I've been putting in long hours, but lately I feel exhausted even before I open my books. This is called "burnout" and it's very common among students preparing for competitive exams.

I'm not giving up. I just need a short recovery period to come back stronger. A day or two of rest, some lighter study, and your understanding would help me recover and perform better.

I've spoken to an AI wellness tool called YuvaZ and it has given me a recovery plan. I'll follow it and keep you updated.

Thank you for always being there for me.

Love,
${studentName}`,

      anxiety: `Dear Mom/Dad,

I've been experiencing exam anxiety and I wanted you to know.

It's not that I'm unprepared — anxiety is something that happens to many students and it affects performance even when you've studied well. The fear of disappointing you makes it harder.

I would really appreciate if we could avoid discussing rank comparisons or "what if you don't make it" scenarios for now. Instead, can you simply tell me you're proud of the effort I'm putting in?

Small changes in how we talk about exams at home will make a huge difference to my mental state.

I love you and I'm doing my best.

Always,
${studentName}`
    };

    return messages[situation] || messages.stress;
  }

  // ── Utility ────────────────────────────────────────────────
  function getMostFrequent(arr) {
    if (!arr || arr.length === 0) return null;
    const freq = {};
    arr.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  function formatTrigger(id) {
    const labels = {
      mock_test_anxiety: 'Mock Test Anxiety',
      parental_pressure: 'Parental Pressure',
      social_comparison: 'Social Comparison',
      fear_of_failure: 'Fear of Failure',
      study_overload: 'Study Overload',
      burnout: 'Burnout',
      procrastination: 'Procrastination',
      lack_of_confidence: 'Lack of Confidence'
    };
    return labels[id] || id;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Adaptive Mindfulness Generator (GenAI) ────────────────
  async function generateAdaptiveMindfulness(mood, trigger) {
    if (typeof GroqClient === 'undefined') return null;
    const prompt = `You are an expert mindfulness coach for students preparing for competitive exams like JEE/NEET/UPSC.
The student is currently feeling '${mood}' and their main stress trigger is '${trigger}'.
Generate a hyper-personalized, 2-minute adaptive mindfulness exercise tailored specifically to this emotional state.
Respond in plain text (no markdown formatting other than bolding) with exactly 3 short steps. Keep it grounding and practical.`;

    try {
      const response = await GroqClient.chat([{ role: 'user', content: prompt }], { temperature: 0.6, maxTokens: 150 });
      return response.content;
    } catch (e) {
      console.warn("Failed to generate adaptive mindfulness", e);
      return null;
    }
  }

  // ── Real-time Coping Strategy Generator (GenAI) ───────────
  async function generateCopingStrategy(trigger, exam) {
    if (typeof GroqClient === 'undefined') return null;
    const prompt = `You are a cognitive behavioral coach for Indian students.
The student is preparing for ${exam} and is struggling with '${trigger}'.
Provide one highly specific, real-time coping strategy they can use RIGHT NOW to regulate their nervous system and regain focus.
Keep it under 3 sentences. Be empathetic and highly actionable.`;

    try {
      const response = await GroqClient.chat([{ role: 'user', content: prompt }], { temperature: 0.5, maxTokens: 100 });
      return response.content;
    } catch (e) {
      console.warn("Failed to generate coping strategy", e);
      return null;
    }
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    analyzeJournal,
    getCompanionResponse,
    generateReadinessIndex,
    generateWeeklySummary,
    generateParentMessage,
    generateAdaptiveMindfulness,
    generateCopingStrategy,
    checkSafety,
    analyzeSentiment,
    extractEmotions,
    detectTriggers,
    detectBurnout
  };
})();
