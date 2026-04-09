// voice/speechHandler.js
// Purpose: Handles speech recognition (listening) and speech synthesis (speaking)
// Uses Web Speech API - built into Chrome, Edge, Safari

const SpeechHandler = {
    // Speech Recognition
    recognition: null,
    isListening: false,
    onResultCallback: null,
    onEndCallback: null,
    
    // Speech Synthesis
    synthesis: window.speechSynthesis,
    currentUtterance: null,
    isSpeaking: false,
    
    // Initialize speech recognition
    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            return false;
        }
        
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = false;  // Stop after one phrase
        this.recognition.interimResults = false;  // Only final results
        this.recognition.lang = 'en-IN';  // Indian English accent
        this.recognition.maxAlternatives = 1;
        
        // Set up event handlers
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            
            console.log(`Heard: "${transcript}" (confidence: ${confidence})`);
            
            if (this.onResultCallback) {
                this.onResultCallback(transcript.toLowerCase().trim(), confidence);
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            this.isListening = false;
            
            // Handle specific errors
            if (event.error === 'not-allowed') {
                this.speak('Microphone access denied. Please enable microphone and try again.');
            }
        };
        
        return true;
    },
    
    // Start listening for voice
    startListening(onResult, onEnd) {
        if (!this.recognition) {
            const initialized = this.init();
            if (!initialized) {
                console.error('Cannot start listening - speech recognition not available');
                return false;
            }
        }
        
        this.onResultCallback = onResult;
        this.onEndCallback = onEnd;
        
        try {
            this.recognition.start();
            this.isListening = true;
            AudioFeedback.listening();
            return true;
        } catch (error) {
            console.error('Failed to start recognition:', error);
            return false;
        }
    },
    
    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            AudioFeedback.stopListening();
        }
    },
    
    // Speak text using speech synthesis
    speak(text, onEnd = null) {
        return new Promise((resolve) => {
            // Cancel any ongoing speech
            if (this.isSpeaking) {
                this.synthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            utterance.rate = 0.9;  // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Select a good voice
            const voices = this.synthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en-GB');
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            utterance.onstart = () => {
                this.isSpeaking = true;
            };
            
            utterance.onend = () => {
                this.isSpeaking = false;
                if (onEnd) onEnd();
                resolve();
            };
            
            utterance.onerror = (error) => {
                console.error('Speech error:', error);
                this.isSpeaking = false;
                resolve();
            };
            
            this.synthesis.speak(utterance);
            this.currentUtterance = utterance;
        });
    },
    
    // Stop speaking immediately
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    },
    
    // Check if currently speaking
    getIsSpeaking() {
        return this.isSpeaking;
    }
};

window.SpeechHandler = SpeechHandler;