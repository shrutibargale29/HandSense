// voice/audioFeedback.js
// Purpose: Provides audio feedback sounds for better UX
// Creates simple beep sounds using Web Audio API

const AudioFeedback = {
    audioContext: null,
    
    // Initialize audio context (on user interaction)
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    // Play a beep sound
    playBeep(frequency = 800, duration = 0.1, volume = 0.3) {
        try {
            this.init();
            
            // Resume context if suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + duration);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log('Audio feedback not available:', error);
        }
    },
    
    // Success sound (answer saved, login success)
    success() {
        this.playBeep(880, 0.15, 0.3);
        setTimeout(() => this.playBeep(1100, 0.15, 0.3), 100);
    },
    
    // Error sound (command not recognized, login failed)
    error() {
        this.playBeep(440, 0.3, 0.4);
        setTimeout(() => this.playBeep(330, 0.3, 0.4), 200);
    },
    
    // Start listening sound
    listening() {
        this.playBeep(660, 0.1, 0.2);
    },
    
    // Stop listening sound
    stopListening() {
        this.playBeep(880, 0.1, 0.2);
    },
    
    // Exam submitted sound
    examComplete() {
        this.playBeep(523, 0.2, 0.3);
        setTimeout(() => this.playBeep(659, 0.2, 0.3), 150);
        setTimeout(() => this.playBeep(784, 0.3, 0.3), 300);
    }
};

window.AudioFeedback = AudioFeedback;