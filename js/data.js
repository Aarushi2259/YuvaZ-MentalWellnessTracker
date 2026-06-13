/**
 * YuvaZ – Application Data Store
 * Manages local data, mock datasets, and state persistence.
 */

const YuvaZData = (() => {
  // ── Constants ──────────────────────────────────────────────
  const STORAGE_KEY = 'yuvaz_v1';
  const ENCRYPTION_NOTE = 'DATA_ENCRYPTED_IN_PROD'; // Placeholder for AES-GCM in production

  // ── Default State ──────────────────────────────────────────
  const DEFAULT_STATE = {
    user: {
      name: 'Aspirant',
      targetExam: 'JEE', // Exams: NEET, JEE, CUET, CAT, GATE, UPSC
      examDate: '2026-05-01',
      streak: 7,
      xp: 1240,
      level: 4,
      badges: ['first_checkin', 'week_streak', 'journal_hero'],
      joinDate: '2025-01-01'
    },
    moodLog: [
      { date: '2026-06-07', mood: 'calm', energy: 6, stress: 5, confidence: 7, emoji: '😌', note: 'Study session went well today' },
      { date: '2026-06-08', mood: 'anxious', energy: 4, stress: 7, confidence: 5, emoji: '😰', note: 'Mock test tomorrow' },
      { date: '2026-06-09', mood: 'exhausted', energy: 3, stress: 8, confidence: 4, emoji: '😩', note: 'Slept only 4 hours' },
      { date: '2026-06-10', mood: 'motivated', energy: 7, stress: 4, confidence: 7, emoji: '💪', note: 'Finished revision' },
      { date: '2026-06-11', mood: 'happy', energy: 8, stress: 3, confidence: 8, emoji: '😊', note: 'Good mock result' },
      { date: '2026-06-12', mood: 'overwhelmed', energy: 4, stress: 8, confidence: 5, emoji: '🥺', note: 'Too much syllabus left' },
      { date: '2026-06-13', mood: null, energy: null, stress: null, confidence: null, emoji: null, note: '' }
    ],
    journals: [
      {
        id: 'j001',
        date: '2026-06-12',
        text: 'I feel like I\'m not good enough for JEE. Everyone around me seems to be doing better. My parents keep asking about my ranks and it\'s just making things worse. Mock tests give me panic attacks. I can\'t sleep properly.',
        sentimentScore: -0.65,
        emotions: ['anxiety', 'self-doubt', 'stress', 'comparison'],
        triggers: ['parental_pressure', 'social_comparison', 'mock_test_anxiety'],
        burnoutRisk: 'moderate'
      },
      {
        id: 'j002',
        date: '2026-06-11',
        text: 'Today was actually okay. I managed to finish the electrostatics chapter. Small wins matter, I guess. Still worried about the number of chapters left but trying to stay positive.',
        sentimentScore: 0.35,
        emotions: ['hope', 'slight_worry', 'determination'],
        triggers: ['study_overload'],
        burnoutRisk: 'low'
      }
    ],
    readinessIndex: {
      overall: 78,
      burnoutRisk: 32,
      confidenceTrend: '+5%',
      moodTrend: 'stable',
      studyConsistency: 72,
      sleepQuality: 55,
      stressTrend: 'declining'
    },
    pomodoroStats: {
      todaySessions: 4,
      weekSessions: 22,
      totalFocusMinutes: 580,
      currentStreak: 7
    },
    triggers: [
      { id: 'mock_test_anxiety', label: 'Mock Test Anxiety', icon: '📝', frequency: 72, color: '#ef4444' },
      { id: 'parental_pressure', label: 'Parental Pressure', icon: '👨‍👩‍👦', frequency: 58, color: '#f59e0b' },
      { id: 'social_comparison', label: 'Social Comparison', icon: '👥', frequency: 51, color: '#8b5cf6' },
      { id: 'fear_of_failure', label: 'Fear of Failure', icon: '😨', frequency: 65, color: '#ec4899' },
      { id: 'study_overload', label: 'Study Overload', icon: '📚', frequency: 44, color: '#3b82f6' },
      { id: 'lack_of_confidence', label: 'Lack of Confidence', icon: '💭', frequency: 40, color: '#14b8a6' },
      { id: 'procrastination', label: 'Procrastination', icon: '⏳', frequency: 35, color: '#f97316' },
      { id: 'burnout', label: 'Burnout Signals', icon: '🔥', frequency: 28, color: '#6366f1' }
    ],
    communityPulse: {
      activeAspirantes: 48320,
      avgStress: 6.2,
      topChallenge: 'Mock Test Anxiety',
      positiveMoods: 43,
      commonTrigger: 'Parental Pressure',
      weeklyInsight: 'Students who journal daily report 34% lower burnout risk.',
      examBreakdown: [
        { exam: 'JEE', count: 18420, avgStress: 7.1 },
        { exam: 'NEET', count: 14380, avgStress: 6.8 },
        { exam: 'UPSC', count: 8210, avgStress: 6.5 },
        { exam: 'CAT', count: 4100, avgStress: 5.9 },
        { exam: 'Others', count: 3210, avgStress: 5.5 }
      ]
    },
    wellnessActions: [
      { id: 'breathing', icon: '🌬️', title: '4-7-8 Breathing', desc: 'Calm your nervous system instantly', duration: '5 min', category: 'breathwork', xp: 50 },
      { id: 'mindfulness', icon: '🧘', title: 'Mindful Scan', desc: 'Full-body awareness meditation', duration: '10 min', category: 'mindfulness', xp: 80 },
      { id: 'gratitude', icon: '🙏', title: 'Gratitude Flow', desc: 'Write 3 things you\'re grateful for', duration: '3 min', category: 'gratitude', xp: 40 },
      { id: 'confidence', icon: '💪', title: 'Confidence Builder', desc: 'Power pose + affirmations', duration: '7 min', category: 'confidence', xp: 60 },
      { id: 'focus', icon: '🎯', title: 'Focus Challenge', desc: 'Single-task deep work exercise', duration: '25 min', category: 'focus', xp: 120 },
      { id: 'recovery', icon: '🌙', title: 'Recovery Plan', desc: 'Personalized rest & reset routine', duration: '15 min', category: 'recovery', xp: 100 }
    ],
    badges: [
      { id: 'first_checkin', icon: '✅', name: 'First Step', earned: true },
      { id: 'week_streak', icon: '🔥', name: '7-Day Streak', earned: true },
      { id: 'journal_hero', icon: '📓', name: 'Journal Hero', earned: true },
      { id: 'focus_master', icon: '🎯', name: 'Focus Master', earned: false },
      { id: 'resilient', icon: '💎', name: 'Resilient', earned: false },
      { id: 'mindful_master', icon: '🧘', name: 'Mindful', earned: false },
      { id: 'exam_warrior', icon: '⚔️', name: 'Exam Warrior', earned: false },
      { id: 'burnout_buster', icon: '🛡️', name: 'Burnout Buster', earned: false }
    ]
  };

  // ── State Management ───────────────────────────────────────
  let state = null;

  /**
   * Loads the application state from local storage.
   * @returns {Object} The current application state.
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
        state = deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), state);
      } else {
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        save();
      }
    } catch (e) {
      console.warn('[YuvaZ] Storage read failed, using defaults.', e);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[YuvaZ] Storage write failed.', e);
    }
  }

  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  /**
   * Retrieves the current state, loading it if necessary.
   * @returns {Object} The application state.
   */
  function getState() { return state || load(); }

  /**
   * Updates the mood log for today.
   * @param {Object} moodData - The mood data to save.
   * @returns {Object} The updated mood log entry.
   */
  function updateMoodToday(moodData) {
    const s = getState();
    const today = new Date().toISOString().split('T')[0];
    const idx = s.moodLog.findIndex(m => m.date === today);
    if (idx >= 0) {
      s.moodLog[idx] = { ...s.moodLog[idx], ...moodData, date: today };
    } else {
      s.moodLog.push({ date: today, ...moodData });
    }
    s.user.xp += 30;
    s.user.streak = Math.min(s.user.streak + 1, 365);
    save();
    return s.moodLog.find(m => m.date === today);
  }

  /**
   * Adds a new journal entry.
   * @param {Object} entry - The journal entry data.
   * @returns {Object} The newly created journal entry.
   */
  function addJournalEntry(entry) {
    const s = getState();
    const newEntry = {
      id: 'j' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...entry
    };
    s.journals.unshift(newEntry);
    s.user.xp += 60;
    save();
    return newEntry;
  }

  /**
   * Gets today's mood entry.
   * @returns {Object|null} Today's mood entry or null.
   */
  function getTodayMood() {
    const s = getState();
    const today = new Date().toISOString().split('T')[0];
    return s.moodLog.find(m => m.date === today) || null;
  }

  /**
   * Gets the last 7 days of mood entries.
   * @returns {Array} Array of mood entries.
   */
  function getWeekMoods() {
    const s = getState();
    return s.moodLog.slice(-7);
  }

  /**
   * Logs application events.
   * @param {string} level - Log level (info, warn, error).
   * @param {string} message - Log message.
   * @param {Object} [meta] - Additional metadata.
   */
  function log(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };
    if (level === 'error') console.error('[YuvaZ]', entry);
    else if (level === 'warn') console.warn('[YuvaZ]', entry);
    else console.log('[YuvaZ]', entry);
  }

  return {
    load,
    save,
    getState,
    updateMoodToday,
    addJournalEntry,
    getTodayMood,
    getWeekMoods,
    log
  };
})();
