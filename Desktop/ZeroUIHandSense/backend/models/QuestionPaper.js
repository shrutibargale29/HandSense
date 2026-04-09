// models/QuestionPaper.js
// MySQL Version - Exam paper management
// Replaces the MongoDB QuestionPaper model

const { query } = require('../config/mysql-db');
const Question = require('./Question');

class QuestionPaper {
    // Create a new question paper
    static async create(paperData) {
        const { paperId, title, subject, description, duration, totalMarks } = paperData;
        
        const sql = `
            INSERT INTO question_papers 
            (paper_id, title, subject, description, duration, total_marks) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [paperId, title, subject, description, duration, totalMarks || 0]);
        return { id: result.insertId, ...paperData };
    }

    // Get paper by ID
    static async findById(id) {
        const sql = 'SELECT * FROM question_papers WHERE id = ?';
        const papers = await query(sql, [id]);
        return papers[0] || null;
    }

    // Get paper by paper_id
    static async findByPaperId(paperId) {
        const sql = 'SELECT * FROM question_papers WHERE paper_id = ? AND is_active = TRUE';
        const papers = await query(sql, [paperId]);
        return papers[0] || null;
    }

    // Get all active papers
    static async getAllActive() {
        const sql = 'SELECT * FROM question_papers WHERE is_active = TRUE ORDER BY created_at DESC';
        return await query(sql);
    }

    // Get all questions for a paper (with order)
    static async getQuestions(paperId) {
        const sql = `
            SELECT q.*, pq.question_order 
            FROM questions q
            JOIN paper_questions pq ON q.id = pq.question_id
            WHERE pq.paper_id = ?
            ORDER BY pq.question_order
        `;
        return await query(sql, [paperId]);
    }

    // Add question to paper
    static async addQuestion(paperId, questionId, order = null) {
        // Get next order if not specified
        if (order === null) {
            const maxOrderSql = 'SELECT MAX(question_order) as max_order FROM paper_questions WHERE paper_id = ?';
            const result = await query(maxOrderSql, [paperId]);
            order = (result[0]?.max_order || 0) + 1;
        }
        
        const sql = 'INSERT INTO paper_questions (paper_id, question_id, question_order) VALUES (?, ?, ?)';
        await query(sql, [paperId, questionId, order]);
        
        // Update total marks
        await this.updateTotalMarks(paperId);
        
        return true;
    }

    // Update total marks for paper
    static async updateTotalMarks(paperId) {
        const sql = `
            UPDATE question_papers qp
            SET total_marks = (
                SELECT COALESCE(SUM(q.marks), 0)
                FROM paper_questions pq
                JOIN questions q ON pq.question_id = q.id
                WHERE pq.paper_id = qp.id
            )
            WHERE qp.id = ?
        `;
        await query(sql, [paperId]);
    }

    // Get paper with full details (including questions)
    static async getPaperWithQuestions(paperId) {
        const paper = await this.findByPaperId(paperId);
        if (!paper) return null;
        
        const questions = await this.getQuestions(paper.id);
        return { ...paper, questions };
    }
}

module.exports = QuestionPaper;