// services/voiceService.js
// Handles voice command processing and speech synthesis - GK PAPER VERSION

class VoiceService {
    constructor() {
        // Define all valid voice commands
        this.commands = {
            // Navigation commands
            NEXT: ['next', 'next question', 'go next', 'continue'],
            REPEAT: ['repeat', 'say again', 'read again', 'repeat question'],
            PREVIOUS: ['previous', 'back', 'go back', 'previous question'],
            
            // Exam control commands
            START: ['begin', 'begin paper', 'start paper', 'start exam', 'begin exam', 'start', 'begin'],
            SUBMIT: ['submit', 'submit exam', 'finish exam', 'end exam'],
            OVER: ['over', 'over exam', 'stop exam', 'end session'],
            EXIT: ['exit', 'exit system', 'quit', 'close'],
            
            // Answer commands
            SUBMIT_ANSWER: ['submit answer', 'save answer', 'answer saved'],
            
            // Paper selection
            SELECT_PAPER: ['select', 'choose', 'open', 'take']
        };

        // Paper name mappings - UPDATED to GK PAPER
        this.paperMappings = {
            'gk': 'GK101',
            'general knowledge': 'GK101',
            'general knowledge paper': 'GK101',
            'gk paper': 'GK101',
            'knowledge': 'GK101'
        };
    }

    /**
     * Process voice command and determine action
     * @param {string} transcript - The transcribed voice command
     * @returns {object} - Action object with type and parameters
     */
    processCommand(transcript) {
        const text = transcript.toLowerCase().trim();
        
        // Check for exam control commands
        if (this.matchesCommand(text, this.commands.NEXT)) {
            return { action: 'NEXT_QUESTION', message: 'Moving to next question' };
        }
        
        if (this.matchesCommand(text, this.commands.REPEAT)) {
            return { action: 'REPEAT_QUESTION', message: 'Repeating question' };
        }
        
        if (this.matchesCommand(text, this.commands.PREVIOUS)) {
            return { action: 'PREVIOUS_QUESTION', message: 'Going back to previous question' };
        }
        
        if (this.matchesCommand(text, this.commands.START)) {
            return { action: 'START_EXAM', message: 'Starting exam' };
        }
        
        if (this.matchesCommand(text, this.commands.SUBMIT)) {
            return { action: 'SUBMIT_EXAM', message: 'Submitting exam' };
        }
        
        if (this.matchesCommand(text, this.commands.OVER)) {
            return { action: 'OVER_EXAM', message: 'Ending exam session' };
        }
        
        if (this.matchesCommand(text, this.commands.EXIT)) {
            return { action: 'EXIT_SYSTEM', message: 'Exiting system' };
        }
        
        if (this.matchesCommand(text, this.commands.SUBMIT_ANSWER)) {
            return { action: 'SUBMIT_ANSWER', message: 'Submitting answer' };
        }
        
        // Check for paper selection - UPDATED for GK PAPER
        const paperId = this.extractPaperId(text);
        if (paperId) {
            return { action: 'SELECT_PAPER', paperId, message: `Selected GK paper` };
        }
        
        // Check if it's an answer (not a command)
        if (!this.isCommand(text)) {
            return { action: 'ANSWER', answer: text, message: 'Answer captured' };
        }
        
        return { action: 'UNKNOWN', message: 'Command not recognized' };
    }

    /**
     * Check if text matches any command patterns
     */
    matchesCommand(text, commandPatterns) {
        for (const pattern of commandPatterns) {
            if (text.includes(pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if text is a command (vs answer)
     */
    isCommand(text) {
        const allCommands = [
            ...this.commands.NEXT,
            ...this.commands.REPEAT,
            ...this.commands.PREVIOUS,
            ...this.commands.START,
            ...this.commands.SUBMIT,
            ...this.commands.OVER,
            ...this.commands.EXIT,
            ...this.commands.SUBMIT_ANSWER
        ];
        
        for (const cmd of allCommands) {
            if (text.includes(cmd)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract paper ID from command - UPDATED for GK PAPER
     */
    extractPaperId(text) {
        for (const [paperName, paperId] of Object.entries(this.paperMappings)) {
            if (text.includes(paperName)) {
                return paperId;
            }
        }
        return null;
    }

    /**
     * Validate answer format
     * @param {string} answer - Student's answer
     * @param {string} questionType - Type of question
     * @returns {object} - Validation result
     */
    validateAnswer(answer, questionType) {
        if (!answer || answer.trim() === '') {
            return { valid: false, message: 'Answer cannot be empty' };
        }

        switch (questionType) {
            case 'numerical':
                const num = parseFloat(answer);
                if (isNaN(num)) {
                    return { valid: false, message: 'Please provide a numerical answer' };
                }
                return { valid: true, value: num };
            
            case 'mcq':
                const validOptions = ['a', 'b', 'c', 'd', '1', '2', '3', '4'];
                if (!validOptions.includes(answer.toLowerCase())) {
                    return { valid: false, message: 'Please select A, B, C, or D' };
                }
                return { valid: true, value: answer.toUpperCase() };
            
            default:
                if (answer.length < 1) {
                    return { valid: false, message: 'Answer is too short' };
                }
                if (answer.length > 1000) {
                    return { valid: false, message: 'Answer is too long (max 1000 characters)' };
                }
                return { valid: true, value: answer };
        }
    }

    /**
     * Get help message based on current context - UPDATED for GK PAPER
     * @param {string} context - Current screen/context
     * @returns {string} - Help message
     */
    getHelpMessage(context) {
        const messages = {
            login: 'To login, say: Login roll number [your roll number] password [your password]',
            dashboard: 'To select a paper, say: Select GK paper or Select General Knowledge paper. Then say: Begin paper to start.',
            exam: 'During exam, you can say: Next, Repeat, Submit Answer, Submit Exam, or Over Exam',
            general: 'Available commands: Next, Repeat, Submit Answer, Submit Exam, Over Exam, Exit'
        };
        
        return messages[context] || messages.general;
    }

    /**
     * Format question for text-to-speech
     * @param {string} question - Question text
     * @param {number} questionNumber - Current question number
     * @param {number} totalQuestions - Total number of questions
     * @returns {string} - Formatted question for TTS
     */
    formatQuestionForTTS(question, questionNumber, totalQuestions) {
        return `Question ${questionNumber} of ${totalQuestions}. ${question}`;
    }

    /**
     * Format result for text-to-speech
     * @param {number} score - Student's score
     * @param {number} total - Total possible marks
     * @param {number} percentage - Percentage score
     * @returns {string} - Formatted result for TTS
     */
    formatResultForTTS(score, total, percentage) {
        return `Exam completed. You scored ${score} out of ${total}, which is ${percentage} percent.`;
    }

    /**
     * Format confirmation message for answer submission
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {number} marksObtained - Marks obtained for this question
     * @returns {string} - Confirmation message
     */
    formatAnswerConfirmation(isCorrect, marksObtained) {
        if (isCorrect) {
            return `Correct! You earned ${marksObtained} marks. Say next to continue.`;
        } else {
            return 'Answer saved. Say next to continue.';
        }
    }

    /**
     * Get welcome message for student
     * @param {string} studentName - Student's name
     * @returns {string} - Welcome message
     */
    getWelcomeMessage(studentName) {
        return `Welcome ${studentName}! You can select a paper by saying: Select GK paper. Then say: Begin paper to start your exam.`;
    }

    /**
     * Get paper selection confirmation - UPDATED for GK PAPER
     * @param {string} paperTitle - Title of selected paper
     * @returns {string} - Confirmation message
     */
    getPaperSelectionMessage(paperTitle) {
        return `Selected GK paper. Say begin paper to start your exam.`;
    }

    /**
     * Get exam start message
     * @param {number} totalQuestions - Total number of questions
     * @returns {string} - Exam start message
     */
    getExamStartMessage(totalQuestions) {
        return `GK exam started. You have ${totalQuestions} questions. Listen carefully to each question and speak your answer.`;
    }

    /**
     * Get question prompt
     * @param {number} marks - Marks for this question
     * @returns {string} - Question prompt
     */
    getQuestionPrompt(marks) {
        return `This question is for ${marks} marks. Please speak your answer.`;
    }

    /**
     * Get next question message
     * @param {number} questionNumber - Next question number
     * @param {number} totalQuestions - Total questions
     * @returns {string} - Next question message
     */
    getNextQuestionMessage(questionNumber, totalQuestions) {
        if (questionNumber === totalQuestions) {
            return 'This is the last question. Say Submit Exam to finish.';
        }
        return `Moving to question ${questionNumber} of ${totalQuestions}.`;
    }

    /**
     * Get submission confirmation
     * @param {number} score - Final score
     * @param {number} total - Total marks
     * @param {number} percentage - Percentage score
     * @returns {string} - Submission confirmation
     */
    getSubmissionMessage(score, total, percentage) {
        return `GK exam submitted! You scored ${score} out of ${total}, which is ${percentage} percent.`;
    }

    /**
     * Get exit message
     * @returns {string} - Exit message
     */
    getExitMessage() {
        return 'Goodbye! Thank you for using HandSense.';
    }

    /**
     * Get error message for command not recognized
     * @returns {string} - Error message
     */
    getUnknownCommandMessage() {
        return 'Command not recognized. Say Help for available commands.';
    }

    /**
     * Get logout confirmation
     * @returns {string} - Logout message
     */
    getLogoutMessage() {
        return 'You have been logged out successfully.';
    }

    /**
     * Get registration success message
     * @returns {string} - Registration success message
     */
    getRegistrationSuccessMessage() {
        return 'Registration successful! Please login with your roll number and password.';
    }
}

module.exports = new VoiceService();