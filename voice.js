const VoiceUtils = {
  // Initialize speech recognition
  initializeSpeechRecognition: () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    return recognition;
  },

  // Check if speech synthesis is supported
  isSpeechSynthesisSupported: () => {
    return 'speechSynthesis' in window;
  },

  // Speak text with safety checks
  speakText: (text, options = {}) => {
    if (!VoiceUtils.isSpeechSynthesisSupported()) {
      console.warn('Speech synthesis not supported');
      return false;
    }

    // Safety: Don't speak sensitive crisis-related content
    const sensitiveWords = ['suicide', 'kill', 'harm', 'die', 'crisis'];
    const lowerText = text.toLowerCase();
    
    if (sensitiveWords.some(word => lowerText.includes(word))) {
      console.log('Voice output disabled for sensitive content');
      return false;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.7;
    utterance.lang = options.lang || 'en-US';

    window.speechSynthesis.speak(utterance);
    return true;
  },

  // Process voice input for safety
  processSpeechInput: (transcript) => {
    // Basic safety filtering
    const crisisKeywords = [
      'suicide', 'suicidal', 'kill myself', 'end my life', 'harm myself',
      'want to die', 'better off dead', 'can\'t go on'
    ];

    const lowerTranscript = transcript.toLowerCase();
    const isCrisisContent = crisisKeywords.some(keyword => lowerTranscript.includes(keyword));

    return {
      transcript: transcript.trim(),
      isCrisisContent,
      shouldTriggerEmergency: isCrisisContent
    };
  },

  // Get available voices for TTS
  getAvailableVoices: () => {
    if (!VoiceUtils.isSpeechSynthesisSupported()) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  },

  // Stop all speech synthesis
  stopSpeaking: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
};
