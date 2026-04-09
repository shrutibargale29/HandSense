// Constants and Messages

const VOICE_COMMANDS = {
    SELECT_PAPER: ['select', 'choose', 'open paper', 'take paper'],
    START_PAPER: ['start paper', 'begin exam', 'start test', 'begin test', 'start'],
    NEXT: ['next', 'next question', 'go next', 'move next', 'next please'],
    REPEAT: ['repeat', 'repeat question', 'say again', 'read again', 'again'],
    SUBMIT: ['submit', 'submit exam', 'finish exam', 'complete exam', 'done'],
    OVER: ['over exam', 'end exam', 'stop exam', 'exam over', 'finish'],
    EXIT: ['exit', 'close', 'quit', 'exit system', 'goodbye'],
    HELP: ['help', 'what can i say', 'commands', 'options']
};

const RESPONSE_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful. Welcome to HandSense!',
    LOGIN_FAILED: 'Invalid roll number or password. Please try again.',
    PAPER_SELECTED: (title) => `${title} selected. Say "Start Paper" to begin the exam.`,
    PAPER_NOT_FOUND: (name) => `