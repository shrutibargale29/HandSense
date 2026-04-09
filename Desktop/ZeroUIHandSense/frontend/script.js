// script.js - Main orchestrator for HandSense frontend
// Manages the complete voice exam flow

// Exam state
let examState = {
    isLoggedIn: false,
    currentPaper: null,
    examActive: false,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    waitingForAnswer: false
};

// DOM Elements
const enableMicBtn = document.getElementById('enableMicBtn');
const statusText = document.getElementById('statusText');
const micIndicator = document.getElementById('micIndicator');
const voiceFeedbackDiv = document.getElementById('voiceFeedback');
const heardTextSpan = document.getElementById('heardText');
const currentQuestionDiv = document.getElementById('currentQuestion');
const paperInfoDiv = document.getElementById('paperInfo');

// Initialize the application
async function init() {
    updateStatus('Ready. Enable microphone to start.');
    
    // Check if user was previously logged in
    if (SessionManager.isLoggedIn()) {
        const user = SessionManager.getUser();
        if (user) {
            examState.isLoggedIn = true;
            updateStatus(`Welcome back, ${user.name}`);
            await speakWelcome();
        }
    }
}

// Enable microphone and start voice session
async function enableMicrophone() {
    try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just need permission
        
        updateStatus('Microphone enabled. Listening for commands.');
        micIndicator.classList.remove('mic-off');
        micIndicator.classList.add('mic-on');
        
        // Initialize speech handler
        SpeechHandler.init();
        
        // Start continuous listening mode
        startListeningLoop();
        
        // Welcome message
        await speakWelcome();
        
    } catch (error) {
        console.error('Microphone error:', error);
        updateStatus('Microphone access denied. Please enable and refresh.');
        AudioFeedback.error();
    }
}

// Continuous listening loop
function startListeningLoop() {
    if (!examState.waitingForAnswer) {
        listenForCommand();
    }
}

// Listen for a single command
function listenForCommand() {
    updateStatus('Listening for command...');
    voiceFeedbackDiv.classList.add('listening');
    
    SpeechHandler.startListening(
        (transcript, confidence) => {
            // Show what was heard
            heardTextSpan.textContent = `"${transcript}"`;
            voiceFeedbackDiv.classList.remove('listening');
            
            // Process the command
            processUserInput(transcript);
        },
        () => {
            // Listening ended - restart if not waiting for answer
            voiceFeedbackDiv.classList.remove('listening');
            if (!examState.waitingForAnswer && examState.isLoggedIn) {
                setTimeout(() => listenForCommand(), 500);
            }
        }
    );
}

// Process user input (command or answer)
async function processUserInput(input) {
    const result = CommandProcessor.process(input);
    
    if (result.type === 'command') {
        // Execute the command
        await executeCommand(result.action, result);
    } else if (result.type === 'answer') {
        // Save the answer
        await saveAnswer(result.text);
    } else {
        // Unknown - ask to repeat
        updateStatus('Command not recognized.');
        await SpeechHandler.speak("I didn't understand that. Please say a command or give your answer.");
        AudioFeedback.error();
    }
    
    // Continue listening
    if (!examState.waitingForAnswer && examState.isLoggedIn) {
        setTimeout(() => listenForCommand(), 500);
    }
}

// Execute voice commands
async function executeCommand(action, commandResult) {
    switch(action) {
        case 'selectPaper':
            await selectPaper(commandResult.originalText);
            break;
        case 'startExam':
            await startExam();
            break;
        case 'nextQuestion':
            await nextQuestion();
            break;
        case 'repeatQuestion':
            await repeatQuestion();
            break;
        case 'submitExam':
            await submitExam();
            break;
        case 'overExam':
            await overExam();
            break;
        case 'exitSystem':
            await exitSystem();
            break;
        case 'help':
            await showHelp();
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// Select a question paper
async function selectPaper(spokenText) {
    updateStatus('Selecting paper...');
    
    const paperName = CommandProcessor.extractPaperName(spokenText);
    
    // First, get available papers
    const papersResult = await APIClient.getAvailablePapers();
    
    if (!papersResult.success) {
        await SpeechHandler.speak("Sorry, I couldn't fetch available papers. Please try again.");
        return;
    }
    
    const papers = papersResult.data.papers;
    
    // Find matching paper
    const matchedPaper = papers.find(p => 
        p.title.toLowerCase().includes(paperName.toLowerCase()) ||
        p.paperId.toLowerCase().includes(paperName.toLowerCase())
    );
    
    if (!matchedPaper) {
        await SpeechHandler.speak(`I couldn't find a paper matching "${paperName}". Available papers are: ${papers.map(p => p.title).join(', ')}`);
        return;
    }
    
    // Select the paper
    const selectResult = await APIClient.selectPaper(matchedPaper.paperId);
    
    if (!selectResult.success) {
        await SpeechHandler.speak(`Failed to select ${matchedPaper.title}. Please try again.`);
        return;
    }
    
    examState.currentPaper = matchedPaper;
    examState.totalQuestions = matchedPaper.questionCount || 0;
    
    paperInfoDiv.textContent = `Selected: ${matchedPaper.title} (${examState.totalQuestions} questions)`;
    
    await SpeechHandler.speak(`${matchedPaper.title} selected. This paper has ${examState.totalQuestions} questions. Say "Start Paper" to begin the exam.`);
    AudioFeedback.success();
}

// Start the exam
async function startExam() {
    if (!examState.currentPaper) {
        await SpeechHandler.speak("Please select a paper first. Say 'Select' followed by the paper name.");
        return;
    }
    
    updateStatus('Starting exam...');
    
    const result = await APIClient.startExam();
    
    if (!result.success) {
        await SpeechHandler.speak(`Failed to start exam: ${result.error || 'Unknown error'}`);
        AudioFeedback.error();
        return;
    }
    
    examState.examActive = true;
    examState.currentQuestion = result.data.question;
    examState.questionNumber = result.data.questionNumber;
    examState.waitingForAnswer = true;
    
    currentQuestionDiv.textContent = `Question ${examState.questionNumber}: ${examState.currentQuestion.questionText}`;
    
    // Speak the question
    await SpeechHandler.speak(
        `Question ${examState.questionNumber}. ${examState.currentQuestion.questionText}. Please give your answer now.`
    );
    
    // Listen for answer
    listenForAnswer();
}

// Listen specifically for an answer
function listenForAnswer() {
    updateStatus('Listening for your answer...');
    voiceFeedbackDiv.classList.add('listening');
    
    SpeechHandler.startListening(
        async (transcript, confidence) => {
            heardTextSpan.textContent = `Answer: "${transcript}"`;
            voiceFeedbackDiv.classList.remove('listening');
            await saveAnswer(transcript);
        },
        () => {
            voiceFeedbackDiv.classList.remove('listening');
            // If still waiting for answer, restart listening
            if (examState.waitingForAnswer) {
                setTimeout(() => listenForAnswer(), 500);
            }
        }
    );
}

// Save the answer for current question
async function saveAnswer(answerText) {
    if (!examState.waitingForAnswer) {
        return;
    }
    
    updateStatus('Saving answer...');
    
    const result = await APIClient.saveAnswer(answerText);
    
    if (!result.success) {
        await SpeechHandler.speak("Sorry, I couldn't save your answer. Please try again.");
        AudioFeedback.error();
        listenForAnswer(); // Try again
        return;
    }
    
    AudioFeedback.success();
    
    if (result.data.isLastQuestion) {
        await SpeechHandler.speak("Answer saved. This was the last question. Say 'Submit' to finish your exam.");
        examState.waitingForAnswer = false;
        listenForCommand(); // Switch back to command mode
    } else {
        await SpeechHandler.speak("Answer saved. Say 'Next Question' to continue.");
        examState.waitingForAnswer = false;
        listenForCommand(); // Switch back to command mode
    }
}

// Move to next question
async function nextQuestion() {
    if (!examState.examActive) {
        await SpeechHandler.speak("No exam is active. Please start an exam first.");
        return;
    }
    
    updateStatus('Loading next question...');
    
    const result = await APIClient.nextQuestion();
    
    if (!result.success) {
        await SpeechHandler.speak(`Error: ${result.error || 'Failed to load next question'}`);
        AudioFeedback.error();
        return;
    }
    
    if (result.data.examCompleted) {
        // Exam is complete
        await SpeechHandler.speak("You have completed all questions. Say 'Submit' to finish your exam.");
        return;
    }
    
    examState.currentQuestion = result.data.question;
    examState.questionNumber = result.data.questionNumber;
    examState.waitingForAnswer = true;
    
    currentQuestionDiv.textContent = `Question ${examState.questionNumber}: ${examState.currentQuestion.questionText}`;
    
    await SpeechHandler.speak(
        `Question ${examState.questionNumber}. ${examState.currentQuestion.questionText}. Please give your