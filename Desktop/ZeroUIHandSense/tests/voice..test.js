// tests/voice.test.js
// Unit tests for voice command processing

describe('Voice Command Processor', () => {
    // Mock command processor
    const processCommand = (command) => {
        const cmd = command.toLowerCase();
        
        if (cmd.includes('next')) return { action: 'next' };
        if (cmd.includes('repeat')) return { action: 'repeat' };
        if (cmd.includes('submit')) {
            if (cmd.includes('answer')) return { action: 'submitAnswer' };
            if (cmd.includes('exam')) return { action: 'submitExam' };
        }
        if (cmd.includes('over')) return { action: 'over' };
        if (cmd.includes('exit')) return { action: 'exit' };
        if (cmd.includes('select')) return { action: 'select', paper: extractPaper(cmd) };
        
        return { action: 'answer', text: command };
    };
    
    const extractPaper = (cmd) => {
        if (cmd.includes('math')) return 'MATH101';
        if (cmd.includes('science')) return 'SCI101';
        return null;
    };
    
    test('should detect next command', () => {
        expect(processCommand('next').action).toBe('next');
        expect(processCommand('next question').action).toBe('next');
    });
    
    test('should detect repeat command', () => {
        expect(processCommand('repeat').action).toBe('repeat');
        expect(processCommand('say again').action).toBe('repeat');
    });
    
    test('should detect submit answer command', () => {
        expect(processCommand('submit answer').action).toBe('submitAnswer');
    });
    
    test('should detect submit exam command', () => {
        expect(processCommand('submit exam').action).toBe('submitExam');
    });
    
    test('should detect over command', () => {
        expect(processCommand('over exam').action).toBe('over');
    });
    
    test('should detect exit command', () => {
        expect(processCommand('exit').action).toBe('exit');
    });
    
    test('should detect paper selection', () => {
        const result = processCommand('select mathematics paper');
        expect(result.action).toBe('select');
        expect(result.paper).toBe('MATH101');
    });
    
    test('should treat non-command as answer', () => {
        const result = processCommand('four');
        expect(result.action).toBe('answer');
        expect(result.text).toBe('four');
    });
});

describe('Answer Validation', () => {
    const validateAnswer = (answer, type) => {
        if (!answer || answer.trim() === '') {
            return { valid: false, message: 'Answer cannot be empty' };
        }
        
        if (type === 'numerical') {
            const num = parseFloat(answer);
            if (isNaN(num)) {
                return { valid: false, message: 'Please provide a number' };
            }
            return { valid: true, value: num };
        }
        
        return { valid: true, value: answer };
    };
    
    test('should reject empty answer', () => {
        expect(validateAnswer('', 'text').valid).toBe(false);
        expect(validateAnswer('   ', 'text').valid).toBe(false);
    });
    
    test('should accept valid text answer', () => {
        expect(validateAnswer('Paris', 'text').valid).toBe(true);
    });
    
    test('should validate numerical answers', () => {
        expect(validateAnswer('42', 'numerical').valid).toBe(true);
        expect(validateAnswer('abc', 'numerical').valid).toBe(false);
    });
});