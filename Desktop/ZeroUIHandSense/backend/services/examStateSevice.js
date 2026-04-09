// services/examStateService.js
// Manages exam session state, timeouts, and progress tracking

const ExamSession = require('../models/ExamSession');

class ExamStateService {
    constructor() {
        // Store active sessions in memory for quick access
        this.activeSessions = new Map();
        this.sessionTimeouts = new Map();
    }

    /**
     * Start tracking a new exam session
     * @param {number} sessionId - Exam session ID
     * @param {number} duration - Exam duration in minutes
     */
    async startSession(sessionId, duration) {
        const session = await ExamSession.findById(sessionId);
        if (!session) return null;

        // Store in active sessions
        this.activeSessions.set(sessionId, {
            sessionId,
            startTime: Date.now(),
            duration: duration * 60 * 1000, // Convert to milliseconds
            lastActivity: Date.now(),
            currentQuestionIndex: session.current_question_index || 0
        });

        // Set timeout for exam expiration
        this.setSessionTimeout(sessionId, duration);

        return this.activeSessions.get(sessionId);
    }

    /**
     * Set timeout to auto-submit exam when time expires
     */
    setSessionTimeout(sessionId, durationMinutes) {
        if (this.sessionTimeouts.has(sessionId)) {
            clearTimeout(this.sessionTimeouts.get(sessionId));
        }

        const timeout = setTimeout(async () => {
            console.log(`⏰ Exam session ${sessionId} timed out`);
            await this.expireSession(sessionId);
        }, durationMinutes * 60 * 1000);

        this.sessionTimeouts.set(sessionId, timeout);
    }

    /**
     * Handle expired session
     */
    async expireSession(sessionId) {
        const session = await ExamSession.findById(sessionId);
        if (session && session.status === 'active') {
            await ExamSession.endExam(sessionId, 'timeout');
            this.activeSessions.delete(sessionId);
            this.sessionTimeouts.delete(sessionId);
            console.log(`✅ Session ${sessionId} expired and closed`);
        }
    }

    /**
     * Update last activity time for a session
     */
    async updateActivity(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now();
            await ExamSession.updateActivity(sessionId);
        }
    }

    /**
     * Check if session is still active
     */
    isSessionActive(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return false;

        // Check if session has expired
        const elapsed = Date.now() - session.startTime;
        if (elapsed > session.duration) {
            this.expireSession(sessionId);
            return false;
        }

        return true;
    }

    /**
     * Get remaining time for session
     */
    getRemainingTime(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return 0;

        const elapsed = Date.now() - session.startTime;
        const remaining = Math.max(0, session.duration - elapsed);
        
        return {
            milliseconds: remaining,
            seconds: Math.floor(remaining / 1000),
            minutes: Math.floor(remaining / (1000 * 60)),
            formatted: this.formatTime(remaining)
        };
    }

    /**
     * Format time as MM:SS
     */
    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Move to next question
     */
    async nextQuestion(sessionId, currentIndex) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.currentQuestionIndex = currentIndex + 1;
        }
        await ExamSession.nextQuestion(sessionId, currentIndex);
        await this.updateActivity(sessionId);
        return currentIndex + 1;
    }

    /**
     * End session and cleanup
     */
    async endSession(sessionId, status = 'completed') {
        await ExamSession.endExam(sessionId, status);
        
        this.activeSessions.delete(sessionId);
        
        if (this.sessionTimeouts.has(sessionId)) {
            clearTimeout(this.sessionTimeouts.get(sessionId));
            this.sessionTimeouts.delete(sessionId);
        }
    }

    /**
     * Get all active sessions (for monitoring)
     */
    getAllActiveSessions() {
        const sessions = [];
        for (const [id, data] of this.activeSessions) {
            sessions.push({
                sessionId: id,
                ...data,
                remainingTime: this.getRemainingTime(id)
            });
        }
        return sessions;
    }
}

module.exports = new ExamStateService();