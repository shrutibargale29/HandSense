// controllers/examController.js
const QuestionPaper = require('../models/QuestionPaper');
const ExamSession = require('../models/ExamSession');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// Get available papers
const getAvailablePapers = async (req, res) => {
    try {
        const papers = await QuestionPaper.getAllActive();
        
        res.json({
            success: true,
            data: papers.map(paper => ({
                paperId: paper.paper_id,
                title: paper.title,
                subject: paper.subject,
                duration: paper.duration,
                totalMarks: paper.total_marks
            }))
        });
    } catch (error) {
        console.error('Get papers error:', error);
        res.status(500).json({ success: false, message: 'Error fetching papers' });
    }
};

// Start exam
const startExam = async (req, res) => {
    try {
        const { paperId } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        const userId = getUserIdFromToken(token);
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const paper = await QuestionPaper.findByPaperId(paperId);
        if (!paper) {
            return res.status(404).json({ success: false, message: 'Paper not found' });
        }

        const session = await ExamSession.create(userId, paper.id);
        const questions = await QuestionPaper.getQuestions(paper.id);
        const firstQuestion = questions[0];

        res.json({
            success: true,
            message: `Exam started. Question 1 of ${questions.length}`,
            data: {
                sessionId: session.id,
                totalQuestions: questions.length,
                currentQuestionIndex: 0,
                currentQuestion: {
                    id: firstQuestion.id,
                    questionId: firstQuestion.question_id,
                    text: firstQuestion.question_text,
                    marks: firstQuestion.marks
                }
            }
        });
    } catch (error) {
        console.error('Start exam error:', error);
        res.status(500).json({ success: false, message: 'Error starting exam' });
    }
};

// Get current question
const getCurrentQuestion = async (req, res) => {
    try {
        const { sessionId } = req.query;
        const session = await ExamSession.findById(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const paper = await QuestionPaper.findById(session.paper_id);
        const questions = await QuestionPaper.getQuestions(paper.id);
        const currentQuestion = questions[session.current_question_index];

        res.json({
            success: true,
            data: {
                questionNumber: session.current_question_index + 1,
                totalQuestions: questions.length,
                question: {
                    text: currentQuestion.question_text,
                    marks: currentQuestion.marks
                }
            }
        });
    } catch (error) {
        console.error('Get current question error:', error);
        res.status(500).json({ success: false, message: 'Error fetching question' });
    }
};

// Save answer
const saveAnswer = async (req, res) => {
    try {
        const { sessionId, answer } = req.body;
        
        if (!answer || answer.trim() === '') {
            return res.status(400).json({ success: false, message: 'Answer cannot be empty' });
        }

        const session = await ExamSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const paper = await QuestionPaper.findById(session.paper_id);
        const questions = await QuestionPaper.getQuestions(paper.id);
        const currentQuestion = questions[session.current_question_index];

        // Simple evaluation
        let isCorrect = false;
        let marksObtained = 0;
        
        if (currentQuestion.correct_answer) {
            const userAnswerNormalized = answer.trim().toLowerCase();
            const correctAnswerNormalized = currentQuestion.correct_answer.trim().toLowerCase();
            isCorrect = userAnswerNormalized === correctAnswerNormalized;
            marksObtained = isCorrect ? currentQuestion.marks : 0;
        }

        await ExamSession.saveAnswer(sessionId, currentQuestion.id, answer, isCorrect, marksObtained);

        res.json({
            success: true,
            message: 'Answer saved successfully',
            data: { isCorrect, marksObtained }
        });
    } catch (error) {
        console.error('Save answer error:', error);
        res.status(500).json({ success: false, message: 'Error saving answer' });
    }
};

// Next question
const nextQuestion = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await ExamSession.findById(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const paper = await QuestionPaper.findById(session.paper_id);
        const questions = await QuestionPaper.getQuestions(paper.id);
        const nextIndex = session.current_question_index + 1;
        
        if (nextIndex >= questions.length) {
            return res.json({
                success: true,
                isLastQuestion: true,
                message: 'Last question reached. Say SUBMIT to finish.'
            });
        }

        await ExamSession.nextQuestion(sessionId, session.current_question_index);
        const nextQuestion = questions[nextIndex];

        res.json({
            success: true,
            isLastQuestion: false,
            message: `Moving to question ${nextIndex + 1}`,
            data: {
                questionNumber: nextIndex + 1,
                totalQuestions: questions.length,
                currentQuestion: {
                    text: nextQuestion.question_text,
                    marks: nextQuestion.marks
                }
            }
        });
    } catch (error) {
        console.error('Next question error:', error);
        res.status(500).json({ success: false, message: 'Error moving to next question' });
    }
};

// Submit exam
const submitExam = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await ExamSession.findById(sessionId);
        
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        await ExamSession.submitExam(sessionId);
        const updatedSession = await ExamSession.findById(sessionId);
        const paper = await QuestionPaper.findById(session.paper_id);

        res.json({
            success: true,
            message: `Exam submitted! Score: ${updatedSession.total_score} out of ${paper.total_marks}`,
            data: {
                score: updatedSession.total_score,
                totalMarks: paper.total_marks
            }
        });
    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({ success: false, message: 'Error submitting exam' });
    }
};

// Over exam
const overExam = async (req, res) => {
    try {
        const { sessionId } = req.body;
        await ExamSession.endExam(sessionId, 'completed');
        res.json({ success: true, message: 'Exam session ended. Say EXIT to close.' });
    } catch (error) {
        console.error('Over exam error:', error);
        res.status(500).json({ success: false, message: 'Error ending session' });
    }
};

// Exit system
const exitSystem = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) console.error('Session destroy error:', err);
        });
        res.json({ success: true, message: 'Goodbye! System exiting.' });
    } catch (error) {
        console.error('Exit error:', error);
        res.status(500).json({ success: false, message: 'Error exiting' });
    }
};

module.exports = {
    getAvailablePapers,
    startExam,
    getCurrentQuestion,
    saveAnswer,
    nextQuestion,
    submitExam,
    overExam,
    exitSystem
};