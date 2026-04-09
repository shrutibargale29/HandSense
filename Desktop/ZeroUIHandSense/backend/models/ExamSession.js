// models/ExamSession.js
// MySQL Version - Tracks active exam sessions
// Replaces the MongoDB ExamSession model

const { query, getConnection } = require('../config/mysql-db');

class ExamSession {
    // Create a new exam session
    static async create(userId, paperId) {
        const sql = `
            INSERT INTO exam_sessions (user_id, paper_id, status, current_question_index) 
            VALUES (?, ?, 'active', 0)
        `;
        const result = await query(sql, [userId, paperId]);
        return await this.findById(result.insertId);
    }

    // Find session by ID
    static async findById(id) {
        const sql = 'SELECT * FROM exam_sessions WHERE id = ?';
        const sessions = await query(sql, [id]);
        return sessions[0] || null;
    }

    // Find active session for user and paper
    static async findActiveSession(userId, paperId) {
        const sql = `
            SELECT * FROM exam_sessions 
            WHERE user_id = ? AND paper_id = ? AND status = 'active'
            ORDER BY start_time DESC LIMIT 1
        `;
        const sessions = await query(sql, [userId, paperId]);
        return sessions[0] || null;
    }

    // Save an answer
    static async saveAnswer(sessionId, questionId, userAnswer, isCorrect = false, marksObtained = 0) {
        const sql = `
            INSERT INTO answers (session_id, question_id, user_answer, is_correct, marks_obtained) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await query(sql, [sessionId, questionId, userAnswer, isCorrect, marksObtained]);
        
        // Update total score
        await this.updateTotalScore(sessionId);
        return true;
    }

    // Update total score for session
    static async updateTotalScore(sessionId) {
        const sql = `
            UPDATE exam_sessions es
            SET total_score = (
                SELECT COALESCE(SUM(marks_obtained), 0)
                FROM answers
                WHERE session_id = es.id
            )
            WHERE es.id = ?
        `;
        await query(sql, [sessionId]);
    }

    // Move to next question
    static async nextQuestion(sessionId, currentIndex) {
        const sql = 'UPDATE exam_sessions SET current_question_index = ? WHERE id = ?';
        await query(sql, [currentIndex + 1, sessionId]);
        return currentIndex + 1;
    }

    // Submit exam
    static async submitExam(sessionId) {
        const sql = `
            UPDATE exam_sessions 
            SET status = 'submitted', end_time = NOW() 
            WHERE id = ?
        `;
        await query(sql, [sessionId]);
        return await this.findById(sessionId);
    }

    // End exam session
    static async endExam(sessionId, status = 'completed') {
        const sql = `
            UPDATE exam_sessions 
            SET status = ?, end_time = NOW() 
            WHERE id = ?
        `;
        await query(sql, [status, sessionId]);
        return true;
    }

    // Get all answers for a session
    static async getAnswers(sessionId) {
        const sql = `
            SELECT a.*, q.question_text, q.marks as max_marks
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.session_id = ?
            ORDER BY a.answered_at
        `;
        return await query(sql, [sessionId]);
    }

    // Get session with full details (including user, paper, answers)
    static async getSessionDetails(sessionId) {
        const session = await this.findById(sessionId);
        if (!session) return null;
        
        const answers = await this.getAnswers(sessionId);
        return { ...session, answers };
    }

    // Update last activity timestamp
    static async updateActivity(sessionId) {
        const sql = 'UPDATE exam_sessions SET last_activity = NOW() WHERE id = ?';
        await query(sql, [sessionId]);
    }
}

module.exports = ExamSession;