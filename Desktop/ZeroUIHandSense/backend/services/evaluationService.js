// services/evaluationService.js
// Handles answer evaluation, scoring, and result calculation

class EvaluationService {
    /**
     * Evaluate a single answer
     * @param {string} userAnswer - Student's answer
     * @param {string} correctAnswer - Correct answer from database
     * @param {number} marks - Total marks for this question
     * @param {string} questionType - Type of question (descriptive, numerical, mcq)
     * @returns {object} - Evaluation result with score and feedback
     */
    static evaluateAnswer(userAnswer, correctAnswer, marks, questionType = 'descriptive') {
        let isCorrect = false;
        let obtainedMarks = 0;
        let feedback = '';

        // Normalize answers for comparison
        const normalizedUserAnswer = this.normalizeAnswer(userAnswer);
        const normalizedCorrectAnswer = this.normalizeAnswer(correctAnswer);

        switch (questionType) {
            case 'numerical':
                // For numerical answers, compare as numbers
                const userNum = parseFloat(normalizedUserAnswer);
                const correctNum = parseFloat(normalizedCorrectAnswer);
                isCorrect = !isNaN(userNum) && !isNaN(correctNum) && userNum === correctNum;
                break;

            case 'mcq':
                // For MCQ, exact match (A, B, C, D or text)
                isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
                break;

            case 'truefalse':
                // For true/false
                isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
                break;

            case 'descriptive':
            default:
                // For descriptive, check if answer contains keywords or exact match
                isCorrect = this.checkDescriptiveAnswer(normalizedUserAnswer, normalizedCorrectAnswer);
                break;
        }

        obtainedMarks = isCorrect ? marks : 0;
        feedback = isCorrect ? 'Correct!' : 'Incorrect. The correct answer is: ' + correctAnswer;

        return {
            isCorrect,
            obtainedMarks,
            feedback,
            maxMarks: marks
        };
    }

    /**
     * Normalize answer for comparison
     * Remove extra spaces, convert to lowercase, trim
     */
    static normalizeAnswer(answer) {
        if (!answer) return '';
        return answer.toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')  // Multiple spaces to single
            .replace(/[^\w\s]/g, ''); // Remove punctuation
    }

    /**
     * Check descriptive answer for keywords
     */
    static checkDescriptiveAnswer(userAnswer, correctAnswer) {
        if (userAnswer === correctAnswer) return true;
        
        // Extract keywords from correct answer (words longer than 3 characters)
        const keywords = correctAnswer.split(' ')
            .filter(word => word.length > 3)
            .map(word => word.toLowerCase());
        
        if (keywords.length === 0) return userAnswer === correctAnswer;
        
        // Count how many keywords are present in user's answer
        let matchedKeywords = 0;
        for (const keyword of keywords) {
            if (userAnswer.includes(keyword)) {
                matchedKeywords++;
            }
        }
        
        // If 70% of keywords match, consider correct
        const matchPercentage = matchedKeywords / keywords.length;
        return matchPercentage >= 0.7;
    }

    /**
     * Calculate total score for an exam session
     * @param {Array} answers - Array of answers with marks
     * @returns {object} - Total score and percentage
     */
    static calculateTotalScore(answers) {
        let totalObtained = 0;
        let totalPossible = 0;

        for (const answer of answers) {
            totalObtained += answer.marks_obtained || 0;
            totalPossible += answer.max_marks || 0;
        }

        const percentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

        return {
            obtained: totalObtained,
            possible: totalPossible,
            percentage: percentage.toFixed(2),
            grade: this.getGrade(percentage)
        };
    }

    /**
     * Get grade based on percentage
     */
    static getGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    }

    /**
     * Generate feedback for student
     */
    static generateFeedback(score, total, percentage) {
        if (percentage >= 80) {
            return 'Excellent work! You have a strong understanding of the material.';
        } else if (percentage >= 60) {
            return 'Good job! Keep practicing to improve further.';
        } else if (percentage >= 40) {
            return 'Fair attempt. Review the material and try again.';
        } else {
            return 'Need more practice. Please review the concepts and retake the exam.';
        }
    }
}

module.exports = EvaluationService;