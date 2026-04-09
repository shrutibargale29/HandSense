// voice/commandProcessor.js
// Purpose: Interprets voice commands and maps them to actions
// Matches your exact exam flow

const CommandProcessor = {
    // Voice command mappings
    commands: {
        // Paper selection
        SELECT_PAPER: {
            patterns: ['select', 'choose', 'open paper', 'take paper', 'i want to take'],
            action: 'selectPaper'
        },
        
        // Start exam
        START_PAPER: {
            patterns: ['start paper', 'begin exam', 'start test', 'begin test', 'start'],
            action: 'startExam'
        },
        
        // Navigation
        NEXT: {
            patterns: ['next', 'next question', 'go next', 'move next', 'next please'],
            action: 'nextQuestion'
        },
        
        REPEAT: {
            patterns: ['repeat', 'repeat question', 'say again', 'read again', 'again'],
            action: 'repeatQuestion'
        },
        
        // Answer submission (auto-detected - not a command)
        // Any text that's not a command is treated as an answer
        
        // Exam completion
        SUBMIT: {
            patterns: ['submit', 'submit exam', 'finish exam', 'complete exam', 'done'],
            action: 'submitExam'
        },
        
        OVER: {
            patterns: ['over exam', 'end exam', 'stop exam', 'exam over', 'finish'],
            action: 'overExam'
        },
        
        EXIT: {
            patterns: ['exit', 'close', 'quit', 'exit system', 'goodbye'],
            action: 'exitSystem'
        },
        
        // Help
        HELP: {
            patterns: ['help', 'what can i say', 'commands', 'options'],
            action: 'help'
        }
    },
    
    // Process spoken text and determine intent
    process(spokenText) {
        const lowerText = spokenText.toLowerCase().trim();
        
        // Remove common filler words
        const cleanText = this.cleanText(lowerText);
        
        // Check each command type
        for (const [commandType, commandInfo] of Object.entries(this.commands)) {
            for (const pattern of commandInfo.patterns) {
                if (cleanText.includes(pattern) || cleanText === pattern) {
                    console.log(`Command detected: ${commandType} (matched: "${pattern}")`);
                    return {
                        type: 'command',
                        command: commandType,
                        action: commandInfo.action,
                        originalText: spokenText
                    };
                }
            }
        }
        
        // If no command matched, treat as an answer
        if (cleanText.length > 0) {
            console.log(`No command detected. Treating as answer: "${spokenText}"`);
            return {
                type: 'answer',
                text: spokenText,
                originalText: spokenText
            };
        }
        
        return {
            type: 'unknown',
            text: spokenText
        };
    },
    
    // Clean text for better command matching
    cleanText(text) {
        // Remove punctuation
        let cleaned = text.replace(/[^\w\s]/g, '');
        // Remove extra spaces
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        return cleaned;
    },
    
    // Extract paper name from "select X paper" command
    extractPaperName(text) {
        const patterns = [
            /select\s+(.+?)\s+paper/i,
            /choose\s+(.+?)\s+paper/i,
            /open\s+(.+?)\s+paper/i,
            /take\s+(.+?)\s+paper/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        
        // If no pattern matches, return the whole text (minus command words)
        let paperName = text.toLowerCase();
        const removeWords = ['select', 'choose', 'open', 'take', 'paper'];
        for (const word of removeWords) {
            paperName = paperName.replace(word, '');
        }
        return paperName.trim();
    }
};

window.CommandProcessor = CommandProcessor;