// services/voiceService.js
// Handles voice command processing and speech synthesis

class VoiceService {
    constructor() {
        // Define all valid voice commands
        this.commands = {
            // Navigation commands
            NEXT: ['next', 'next question', 'go next', 'continue'],
            REPEAT: ['repeat', 'say again', 'read again', 'repeat question'],
            PREVIOUS: ['previous', 'back', 'go back', 'previous question'],
            
            // Exam control commands
            START: ['start', 'start paper', 'begin exam', 'start exam'],
            SUBMIT: ['submit', 'submit exam', 'finish exam', 'end exam'],
            OVER: ['over', 'over exam', 'stop exam', 'end session'],
            EXIT: ['exit', 'exit system', 'quit', 'close'],
            
            // Answer commands
            SUBMIT_ANSWER: ['submit answer', 'save answer', 'answer saved'],
            
            // Paper selection
            SELECT_PAPER: ['select', 'choose', 'open', 'take']
        };

        // Paper name mappings
        this.paperMappings = {
            'mathematics': 'MATH101',
            'math': 'MATH101',
            'maths': 'MATH101',
            'science': 'SCI101',
            'physics': 'PHY101',
            'chemistry': 'CHEM101'
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
        
        // Check for paper selection
        const paperId = this.extractPaperId(text);
        if (paperId) {
            return { action: 'SELECT_PAPER', paperId, message: `Selected paper ${paperId}` };
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
     * Extract paper ID from command
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
     * Get help message based on current context
     */
    getHelpMessage(context) {
        const messages = {
            login: 'To login, say: Login roll number [your roll number] password [your password]',
            dashboard: 'To select a paper, say: Select Mathematics paper. Then say: Start paper to begin.',
            exam: 'During exam, you can say: Next, Repeat, Submit Answer, Submit Exam, or Over Exam',
            general: 'Available commands: Next, Repeat, Submit Answer, Submit Exam, Over Exam, Exit'
        };
        
        return messages[context] || messages.general;
    }

    /**
     * Format question for text-to-speech
     */
    formatQuestionForTTS(question, questionNumber, totalQuestions) {
        return `Question ${questionNumber} of ${totalQuestions}. ${question}`;
    }

    /**
     * Format result for text-to-speech
     */
    formatResultForTTS(score, total, percentage) {
        return `Exam completed. You scored ${score} out of ${total}, which is ${percentage} percent.`;
    }
}

module.exports = new VoiceService();