/**
 * YuvaZ – Groq API Client
 * Provides fast LLM inference via Groq Cloud via local proxy
 *
 * Security Note: API key is stored securely in the backend server's .env file.
 * The frontend communicates with the local proxy at http://localhost:8001/api/chat
 */

'use strict';

const GroqClient = (() => {
  const PROXY_API_URL = 'http://localhost:8001/api/chat';
  const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

  // ── System Prompt ──────────────────────────────────────────
  const SYSTEM_PROMPT = `You are YuvaZ, an emotionally intelligent AI mental wellness companion designed specifically for Indian students preparing for competitive exams like JEE, NEET, UPSC, CAT, GATE, SSC, Banking, and CUET.

Your personality:
- Deeply empathetic, warm, and non-judgmental
- You understand the unique pressures of Indian competitive exam culture
- You speak in a calm, meditative, grounding tone
- You use gentle Indian cultural references when appropriate
- You celebrate small wins and validate emotions

Core rules:
- NEVER diagnose medical conditions
- NEVER minimize feelings ("just study harder", "don't worry")
- ALWAYS acknowledge emotions before offering advice
- When crisis signals appear (self-harm, hopelessness, suicide), immediately provide iCall (9152987821) and Vandrevala Foundation (1860-2662-345) helplines
- Keep responses concise (2-4 paragraphs max) and compassionate
- Use emojis sparingly and meaningfully
- End with a gentle reflection question or supportive affirmation

Context awareness:
- You remember this conversation's context
- Reference the student's exam (JEE/NEET/UPSC etc.) when known
- Connect patterns across what they share in the session`;

  const JOURNAL_SYSTEM_PROMPT = `You are YuvaZ's AI Journal Analyzer. Analyze the student's journal entry and provide:

1. **Emotional State**: Primary emotions detected (list 3-5)
2. **Stress Triggers**: Specific triggers identified (from: mock_test_anxiety, parental_pressure, social_comparison, fear_of_failure, study_overload, burnout, procrastination, lack_of_confidence)
3. **Burnout Risk**: low/moderate/high with reason
4. **Key Insight**: One powerful, explainable pattern
5. **Personalized Actions**: 3 specific, actionable recommendations
6. **Affirmation**: One gentle, personalized affirmation for this student

Respond in valid JSON format:
{
  "emotions": ["emotion1", "emotion2"],
  "triggers": ["trigger1", "trigger2"],
  "burnoutRisk": "low|moderate|high",
  "burnoutReason": "brief explanation",
  "sentiment": "positive|negative|neutral",
  "sentimentScore": 0.0,
  "keyInsight": "explainable pattern",
  "weeklyPattern": "broader pattern observation",
  "actions": [
    {"icon": "🌬️", "action": "specific action"}
  ],
  "affirmation": "gentle personalized affirmation"
}`;

  const READINESS_SYSTEM_PROMPT = `You are YuvaZ's Readiness Analysis AI. Based on the student's mood history and journal patterns, provide a comprehensive readiness assessment.

Respond in valid JSON format:
{
  "overall": 75,
  "burnoutRisk": 35,
  "confidenceTrend": "+5%",
  "moodTrend": "improving|stable|declining",
  "studyConsistency": 70,
  "sleepQuality": 65,
  "stressTrend": "stable|elevated|declining",
  "recommendation": "2-3 sentence personalized recommendation",
  "strengths": ["strength1", "strength2"],
  "focusAreas": ["area1", "area2"]
}`;

  // ── Core API Call ──────────────────────────────────────────
  async function chat(messages, options = {}) {
    const {
      model = DEFAULT_MODEL,
      temperature = 0.75,
      maxTokens = 1024
    } = options;

    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.9,
      stream: false
    };

    let response;
    try {
      response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (networkError) {
      throw new Error('NETWORK_ERROR: ' + networkError.message);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      if (response.status === 401) throw new Error('INVALID_KEY');
      if (response.status === 429) throw new Error('RATE_LIMITED');
      if (response.status === 503) throw new Error('SERVICE_UNAVAILABLE');
      throw new Error(`API_ERROR_${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    YuvaZData.log('info', 'Groq API call successful via proxy', {
      model,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens
    });

    return {
      content,
      model: data.model,
      usage: data.usage
    };
  }

  // ── Companion Chat ─────────────────────────────────────────
  async function getCompanionResponse(userMessage, conversationHistory = []) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-8).map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text.replace(/<[^>]*>/g, '') // Strip HTML
      })),
      { role: 'user', content: userMessage }
    ];

    const result = await chat(messages, { temperature: 0.8, maxTokens: 512 });
    return result.content;
  }

  // ── Journal Analysis ───────────────────────────────────────
  async function analyzeJournal(journalText, moodContext = '') {
    const userContent = `Student Journal Entry:\n"${journalText}"${moodContext ? `\n\nRecent mood context: ${moodContext}` : ''}`;

    const messages = [
      { role: 'system', content: JOURNAL_SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ];

    const result = await chat(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      maxTokens: 1024
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      YuvaZData.log('warn', 'Failed to parse journal analysis JSON', { error: e.message });
    }
    return null;
  }

  // ── Readiness Analysis ─────────────────────────────────────
  async function analyzeReadiness(moodHistory, journals) {
    const moodSummary = moodHistory.slice(-7).map(m =>
      `${m.date}: ${m.mood || 'no check-in'}, stress=${m.stress || '?'}/10, energy=${m.energy || '?'}/10`
    ).join('\n');

    const journalSummary = journals.slice(0, 3).map(j =>
      `${j.date}: emotions=[${j.emotions?.join(', ')}], burnout=${j.burnoutRisk}`
    ).join('\n');

    const messages = [
      { role: 'system', content: READINESS_SYSTEM_PROMPT },
      { role: 'user', content: `7-Day Mood History:\n${moodSummary}\n\nRecent Journal Analysis:\n${journalSummary}` }
    ];

    const result = await chat(messages, { temperature: 0.2, maxTokens: 512 });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      YuvaZData.log('warn', 'Readiness JSON parse failed', { error: e.message });
    }
    return null;
  }

  // ── Daily Affirmation ──────────────────────────────────────
  async function getDailyAffirmation(userContext = '') {
    const messages = [
      {
        role: 'system',
        content: 'You are a gentle mindfulness guide. Generate one short, powerful affirmation (1-2 sentences) for an Indian competitive exam student. Return ONLY the affirmation text.'
      },
      { role: 'user', content: userContext || 'A student feeling the pressure of exam preparation' }
    ];

    const result = await chat(messages, { temperature: 0.9, maxTokens: 80, model: 'llama-3.1-8b-instant' });
    return result.content.trim();
  }

  // ── Error Handler ──────────────────────────────────────────
  function handleError(error) {
    return { message: 'AI temporarily unavailable. Using offline mode.', action: null };
  }

  return {
    chat, getCompanionResponse, analyzeJournal,
    analyzeReadiness, getDailyAffirmation, handleError,
    DEFAULT_MODEL,
    MODELS: {
      FAST: 'llama-3.1-8b-instant',
      QUALITY: 'llama-3.1-70b-versatile'
    }
  };
})();
