// frontend/src/services/jarvisService.js
class JarvisService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.wakeWordDetected = false;
    this.wakeWords = ['wise', 'hey wise', 'ok wise', 'hello wise', 'wake up wise'];
    this.commandCallbacks = [];
    this.wakeWordCallbacks = [];
    this.isActive = false;
    this.continuousListening = false;
  }

  init() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript.toLowerCase())
        .join(' ');
      
      this.processTranscript(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Jarvis recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.stop();
      }
    };

    this.recognition.onend = () => {
      if (this.isActive && this.continuousListening) {
        // Restart if still active
        setTimeout(() => this.start(), 100);
      } else {
        this.isListening = false;
      }
    };

    return true;
  }

  processTranscript(transcript) {
    // Check for wake word
    const lowerTranscript = transcript.toLowerCase();
    const hasWakeWord = this.wakeWords.some(word => lowerTranscript.includes(word));
    
    if (hasWakeWord && !this.wakeWordDetected) {
      this.wakeWordDetected = true;
      this.triggerWakeWordCallbacks();
      
      // Visual feedback - will be handled by React component
      setTimeout(() => {
        this.wakeWordDetected = false;
      }, 3000);
    }
    
    // If wake word detected or already active, process command
    if (this.wakeWordDetected || this.isListening) {
      // Extract command after wake word
      let command = lowerTranscript;
      for (const wakeWord of this.wakeWords) {
        if (command.includes(wakeWord)) {
          command = command.replace(wakeWord, '').trim();
          break;
        }
      }
      
      if (command && command.length > 0) {
        this.triggerCommandCallbacks(command);
      }
    }
  }

  start() {
    if (!this.recognition) {
      if (!this.init()) return false;
    }
    
    try {
      this.recognition.start();
      this.isActive = true;
      this.continuousListening = true;
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start Jarvis:', error);
      return false;
    }
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isActive = false;
    this.continuousListening = false;
    this.isListening = false;
    this.wakeWordDetected = false;
  }

  onCommand(callback) {
    this.commandCallbacks.push(callback);
  }

  onWakeWord(callback) {
    this.wakeWordCallbacks.push(callback);
  }

  triggerCommandCallbacks(command) {
    this.commandCallbacks.forEach(cb => cb(command));
  }

  triggerWakeWordCallbacks() {
    this.wakeWordCallbacks.forEach(cb => cb());
  }

  getStatus() {
    return {
      isActive: this.isActive,
      isListening: this.isListening,
      wakeWordDetected: this.wakeWordDetected
    };
  }
}

export default new JarvisService();