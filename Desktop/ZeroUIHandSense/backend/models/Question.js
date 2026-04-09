// models/Question.js
// MySQL Version - Individual questions management
// Replaces the MongoDB Question model

const { query } = require('../config/mysql-db');

class Question {
    // Create a new question
    static async create(questionData) {
        const { questionId, questionText, marks, questionType, correctAnswer, subject, difficulty } = questionData;
        
        const sql = `
            INSERT INTO questions 
            (question_id, question_text, marks, question_type, correct_answer, subject, difficulty) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [questionId, questionText, marks, questionType, correctAnswer, subject, difficulty]);
        return { id: result.insertId, ...questionData };
    }

    // Get question by ID
    static async findById(id) {
        const sql = 'SELECT * FROM questions WHERE id = ?';
        const questions = await query(sql, [id]);
        return questions[0] || null;
    }

    // Get question by question_id
    static async findByQuestionId(questionId) {
        const sql = 'SELECT * FROM questions WHERE question_id = ?';
        const questions = await query(sql, [questionId]);
        return questions[0] || null;
    }

    // Get all questions
    static async getAll() {
        const sql = 'SELECT * FROM questions ORDER BY created_at DESC';
        return await query(sql);
    }

    // Get questions by subject
    static async getBySubject(subject) {
        const sql = 'SELECT * FROM questions WHERE subject = ? ORDER BY difficulty';
        return await query(sql, [subject]);
    }

    // Update a question
    static async update(id, updates) {
        const fields = [];
        const values = [];
        
        if (updates.questionText) {
            fields.push('question_text = ?');
            values.push(updates.questionText);
        }
        if (updates.marks) {
            fields.push('marks = ?');
            values.push(updates.marks);
        }
        if (updates.correctAnswer) {
            fields.push('correct_answer = ?');
            values.push(updates.correctAnswer);
        }
        
        if (fields.length === 0) return null;
        
        values.push(id);
        const sql = `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`;
        await query(sql, values);
        return await this.findById(id);
    }

    // Delete a question
    static async delete(id) {
        const sql = 'DELETE FROM questions WHERE id = ?';
        await query(sql, [id]);
        return true;
    }
}

module.exports = Question;