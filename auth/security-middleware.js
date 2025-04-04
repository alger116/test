// Rate limiting implementation
const rateLimit = {
  attempts: new Map(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,

  checkLimit(ip) {
    const now = Date.now();
    const userAttempts = this.attempts.get(ip) || [];

    // Clean up old attempts
    const recentAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(ip, recentAttempts);
    return true;
  },
};

// CSRF Protection
const csrfProtection = {
  tokens: new Map(),

  generateToken() {
    return crypto.randomUUID();
  },

  setToken(sessionId) {
    const token = this.generateToken();
    this.tokens.set(sessionId, token);
    return token;
  },

  validateToken(sessionId, token) {
    const storedToken = this.tokens.get(sessionId);
    return storedToken === token;
  },
};

// Session management
const sessionManager = {
  sessions: new Map(),
  sessionDuration: 30 * 60 * 1000, // 30 minutes

  createSession(userId) {
    const sessionId = crypto.randomUUID();
    const session = {
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  },

  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = Date.now();
    if (now - session.lastActivity > this.sessionDuration) {
      this.sessions.delete(sessionId);
      return false;
    }

    session.lastActivity = now;
    return true;
  },

  refreshSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  },

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  },
};

export { rateLimit, csrfProtection, sessionManager };
