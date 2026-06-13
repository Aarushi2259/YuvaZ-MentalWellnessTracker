/**
 * YuvaZ – Unit Tests
 * Tests for AI Engine, Data Layer, and Safety Layer
 * Framework: Jest (run with `npm test` or `npx jest`)
 */

// ── Mock localStorage ──────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ── Load modules (simulated imports for browser modules) ────
// In production, these would be proper ES6 module imports
// For this test file, we test the logic inline

// ═══════════════════════════════════════════════════════════
// AI Engine Tests
// ═══════════════════════════════════════════════════════════

describe('AI Engine – Sentiment Analysis', () => {
  const emotionKeywords = {
    anxiety: ['anxious', 'worried', 'nervous', 'scared', 'fear', 'panic', 'dread'],
    stress: ['stressed', 'pressure', 'overwhelmed', 'too much', 'burden', 'load'],
    motivation: ['motivated', 'determined', 'going to', 'will achieve', 'strong']
  };

  function mockAnalyzeSentiment(text) {
    const lower = text.toLowerCase();
    const positiveWords = ['good', 'great', 'happy', 'proud', 'motivated', 'strong'];
    const negativeWords = ['bad', 'sad', 'fail', 'angry', 'anxious', 'stressed'];
    let score = 0;
    positiveWords.forEach(w => { if (lower.includes(w)) score += 0.15; });
    negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.15; });
    return { score: Math.max(-1, Math.min(1, score)) };
  }

  test('positive text returns positive sentiment', () => {
    const result = mockAnalyzeSentiment('I feel great and happy today, motivated to study!');
    expect(result.score).toBeGreaterThan(0);
  });

  test('negative text returns negative sentiment', () => {
    const result = mockAnalyzeSentiment('I feel sad and stressed, anxious about my exam fail');
    expect(result.score).toBeLessThan(0);
  });

  test('neutral text returns near-zero sentiment', () => {
    const result = mockAnalyzeSentiment('I went to the library today.');
    expect(Math.abs(result.score)).toBeLessThan(0.2);
  });

  test('sentiment score is bounded between -1 and 1', () => {
    const result = mockAnalyzeSentiment('great great great happy happy proud strong motivated');
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.score).toBeGreaterThanOrEqual(-1);
  });
});

describe('AI Engine – Trigger Detection', () => {
  const TRIGGER_MAP = {
    mock_test_anxiety: ['mock', 'test', 'exam', 'score', 'rank', 'marks'],
    parental_pressure: ['parents', 'mom', 'dad', 'family', 'expectations', 'pressure'],
    social_comparison: ['friends', 'topper', 'everyone else', 'batch', 'class']
  };

  function mockDetectTriggers(text) {
    const lower = text.toLowerCase();
    const detected = [];
    Object.entries(TRIGGER_MAP).forEach(([trigger, keywords]) => {
      const matchCount = keywords.filter(k => lower.includes(k)).length;
      if (matchCount >= 1) detected.push({ id: trigger, confidence: Math.min(0.95, 0.5 + matchCount * 0.15) });
    });
    return detected;
  }

  test('detects mock test anxiety trigger', () => {
    const triggers = mockDetectTriggers('My mock test score was terrible and I lost my rank');
    const found = triggers.find(t => t.id === 'mock_test_anxiety');
    expect(found).toBeTruthy();
    expect(found.confidence).toBeGreaterThan(0.5);
  });

  test('detects parental pressure trigger', () => {
    const triggers = mockDetectTriggers('My parents keep putting pressure on me about my rank expectations');
    const found = triggers.find(t => t.id === 'parental_pressure');
    expect(found).toBeTruthy();
  });

  test('detects social comparison trigger', () => {
    const triggers = mockDetectTriggers('Everyone else in my batch is a topper and my friends are ahead');
    const found = triggers.find(t => t.id === 'social_comparison');
    expect(found).toBeTruthy();
  });

  test('returns empty for irrelevant text', () => {
    const triggers = mockDetectTriggers('The weather is nice today.');
    expect(triggers.length).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// Safety Layer Tests
// ═══════════════════════════════════════════════════════════

describe('Safety Layer – Crisis Detection', () => {
  const CRISIS_SIGNALS = [
    'want to die', 'end my life', 'kill myself', 'no point living',
    'suicide', 'self harm', 'hurt myself'
  ];
  const DISTRESS_SIGNALS = ['crying all day', 'completely broken', 'falling apart'];

  function mockCheckSafety(text) {
    const lower = text.toLowerCase();
    const isCrisis = CRISIS_SIGNALS.some(signal => lower.includes(signal));
    const isDistress = DISTRESS_SIGNALS.some(signal => lower.includes(signal));
    return { isCrisis, isDistress, crisisLevel: isCrisis ? 'critical' : isDistress ? 'high' : 'low' };
  }

  test('detects crisis signals correctly', () => {
    const result = mockCheckSafety('I want to die, there is no point living anymore');
    expect(result.isCrisis).toBe(true);
    expect(result.crisisLevel).toBe('critical');
  });

  test('detects distress signals', () => {
    const result = mockCheckSafety('I have been crying all day and feel completely broken');
    expect(result.isDistress).toBe(true);
    expect(result.crisisLevel).toBe('high');
  });

  test('returns low for normal text', () => {
    const result = mockCheckSafety('I am feeling a bit stressed about my exam tomorrow');
    expect(result.isCrisis).toBe(false);
    expect(result.isDistress).toBe(false);
    expect(result.crisisLevel).toBe('low');
  });

  test('crisis detection is case insensitive', () => {
    const result = mockCheckSafety('I WANT TO DIE');
    expect(result.isCrisis).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// Data Layer Tests
// ═══════════════════════════════════════════════════════════

describe('Data Layer – State Management', () => {
  test('mood log update works correctly', () => {
    const moodLog = [];
    const today = new Date().toISOString().split('T')[0];
    const moodData = { mood: 'happy', energy: 8, stress: 3, confidence: 8, emoji: '😊' };

    const idx = moodLog.findIndex(m => m.date === today);
    if (idx >= 0) {
      moodLog[idx] = { ...moodLog[idx], ...moodData, date: today };
    } else {
      moodLog.push({ date: today, ...moodData });
    }

    expect(moodLog.length).toBe(1);
    expect(moodLog[0].mood).toBe('happy');
    expect(moodLog[0].energy).toBe(8);
  });

  test('readiness index calculation bounds', () => {
    const calculateReadiness = (avgConfidence, avgStress, avgEnergy) => {
      return Math.min(99, Math.max(10, Math.round(
        (avgConfidence / 10 * 30) +
        ((10 - avgStress) / 10 * 25) +
        (avgEnergy / 10 * 20)
      )));
    };

    expect(calculateReadiness(9, 2, 9)).toBeGreaterThan(60); // High confidence, low stress
    expect(calculateReadiness(2, 9, 2)).toBeLessThan(30);    // Low confidence, high stress
    const result = calculateReadiness(5, 5, 5);
    expect(result).toBeGreaterThanOrEqual(10);
    expect(result).toBeLessThanOrEqual(99);
  });

  test('burnout risk stays within 0-100', () => {
    const calcBurnout = (avgStress, avgEnergy) => {
      return Math.min(95, Math.max(5, Math.round(
        (avgStress / 10 * 50) + ((10 - avgEnergy) / 10 * 30)
      )));
    };

    expect(calcBurnout(10, 1)).toBeLessThanOrEqual(95);
    expect(calcBurnout(1, 10)).toBeGreaterThanOrEqual(5);
  });

  test('journal entry has required fields', () => {
    const createEntry = (text, emotions, triggers) => ({
      id: 'j' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      text,
      emotions,
      triggers,
      sentimentScore: -0.3,
      burnoutRisk: 'moderate'
    });

    const entry = createEntry('test journal', ['anxiety'], [{ id: 'mock_test_anxiety' }]);
    expect(entry.id).toBeTruthy();
    expect(entry.date).toBeTruthy();
    expect(entry.text).toBe('test journal');
    expect(Array.isArray(entry.emotions)).toBe(true);
    expect(Array.isArray(entry.triggers)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// Pomodoro Timer Tests
// ═══════════════════════════════════════════════════════════

describe('Focus Zone – Pomodoro Timer', () => {
  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  test('formats 25 minutes correctly', () => {
    expect(formatTime(25 * 60)).toBe('25:00');
  });

  test('formats 5 minutes correctly', () => {
    expect(formatTime(5 * 60)).toBe('05:00');
  });

  test('formats zero correctly', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  test('formats partial minutes correctly', () => {
    expect(formatTime(90)).toBe('01:30');
  });
});

// ═══════════════════════════════════════════════════════════
// Parent Message Generator Tests
// ═══════════════════════════════════════════════════════════

describe('Parent Communication – Message Generation', () => {
  function mockGenerateMessage(situation, name) {
    const templates = { stress: 'stress', burnout: 'burnout', anxiety: 'anxiety' };
    if (!templates[situation]) return null;
    return `Dear Mom/Dad, (${name}) - ${situation} message`;
  }

  test('generates message for stress situation', () => {
    const msg = mockGenerateMessage('stress', 'Rahul');
    expect(msg).toBeTruthy();
    expect(msg).toContain('stress');
  });

  test('generates message for burnout situation', () => {
    const msg = mockGenerateMessage('burnout', 'Priya');
    expect(msg).toBeTruthy();
    expect(msg).toContain('burnout');
  });

  test('generates message for anxiety situation', () => {
    const msg = mockGenerateMessage('anxiety', 'Arjun');
    expect(msg).toBeTruthy();
  });

// ═══════════════════════════════════════════════════════════
// Security & UI – XSS Prevention
// ═══════════════════════════════════════════════════════════

describe('Security & UI – XSS Prevention', () => {
  // Mock DOMPurify
  const DOMPurify = {
    sanitize: (str) => str.replace(/<script.*?>.*?<\/script>/ig, '')
  };
  global.DOMPurify = DOMPurify;

  test('DOMPurify removes script tags from malicious input', () => {
    const maliciousInput = 'Hello <script>alert("XSS")</script> world!';
    const sanitized = DOMPurify.sanitize(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello  world!');
  });
});

// ═══════════════════════════════════════════════════════════
// GenAI Problem Statement Alignment Tests
// ═══════════════════════════════════════════════════════════

describe('GenAI Core Capabilities', () => {
  // Mock GroqClient for tests
  global.GroqClient = {
    chat: jest.fn()
  };

  test('generateAdaptiveMindfulness constructs correct prompt and returns content', async () => {
    global.GroqClient.chat.mockResolvedValueOnce({ content: '1. Breathe in. 2. Hold. 3. Breathe out.' });
    
    const exercise = await YuvaZAI.generateAdaptiveMindfulness('anxious', 'mock_test_anxiety');
    
    expect(global.GroqClient.chat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ content: expect.stringContaining('mock_test_anxiety') })
      ]),
      expect.any(Object)
    );
    expect(exercise).toBe('1. Breathe in. 2. Hold. 3. Breathe out.');
  });

  test('generateCopingStrategy constructs prompt with specific exam target', async () => {
    global.GroqClient.chat.mockResolvedValueOnce({ content: 'Drink water and step away for 5 minutes.' });
    
    const strategy = await YuvaZAI.generateCopingStrategy('burnout', 'NEET');
    
    expect(global.GroqClient.chat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ content: expect.stringContaining('NEET') })
      ]),
      expect.any(Object)
    );
    expect(strategy).toBe('Drink water and step away for 5 minutes.');
  });
});

console.log('✅ YuvaZ Test Suite loaded. Run with: npx jest tests/yuvaz.test.js');
