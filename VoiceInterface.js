function VoiceInterface({ onVoiceInput, onSpeakText, isListening, isSpeaking }) {
  try {
    const [isSupported, setIsSupported] = React.useState(false);
    const [internalListening, setInternalListening] = React.useState(false);
    const [internalSpeaking, setInternalSpeaking] = React.useState(false);
    const [hasPermission, setHasPermission] = React.useState(false);
    const recognitionRef = React.useRef(null);
    const timeoutRef = React.useRef(null);
    const [showFallback, setShowFallback] = React.useState(false);

    React.useEffect(() => {
      const speechSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      const ttsSupport = 'speechSynthesis' in window;
      setIsSupported(speechSupport && ttsSupport);

      if (speechSupport) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Voice recognition started');
          setInternalListening(true);
          setShowFallback(false);
          // Auto-stop after 5 seconds to prevent hanging
          timeoutRef.current = setTimeout(() => {
            console.log('Voice timeout reached, stopping...');
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (e) {
                console.log('Stop error (expected):', e);
              }
            }
          }, 5000);
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript.trim()) {
            console.log('Voice input received:', finalTranscript);
            clearTimeout(timeoutRef.current);
            setInternalListening(false);
            if (onVoiceInput) onVoiceInput(finalTranscript.trim());
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.log('Voice recognition event:', event.error);
          clearTimeout(timeoutRef.current);
          setInternalListening(false);
          
          // Only show user-friendly messages for critical errors
          if (event.error === 'not-allowed') {
            setHasPermission(false);
            setShowFallback(true);
          }
          // All other errors (including no-speech) are handled silently
        };

        recognitionRef.current.onend = () => {
          console.log('Voice recognition ended');
          clearTimeout(timeoutRef.current);
          setInternalListening(false);
        };
      }
    }, [onVoiceInput]);

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const requestMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        setHasPermission(true);
        setShowFallback(false);
        return true;
      } catch (error) {
        console.log('Microphone permission denied');
        setHasPermission(false);
        setShowFallback(true);
        return false;
      }
    };

    const startListening = async () => {
      if (!recognitionRef.current || internalListening) return;
      
      if (!hasPermission) {
        const permitted = await requestMicrophonePermission();
        if (!permitted) return;
      }
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log('Recognition start error:', error.name);
        if (error.name === 'InvalidStateError') {
          // Already running, stop first then restart
          try {
            recognitionRef.current.stop();
            setTimeout(() => recognitionRef.current.start(), 100);
          } catch (retryError) {
            console.log('Retry failed, showing fallback');
            setShowFallback(true);
          }
        } else {
          setShowFallback(true);
        }
      }
    };

    const stopListening = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current && internalListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Stop error (expected):', e);
        }
      }
      setInternalListening(false);
    };

    const speakText = (text) => {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      setInternalSpeaking(true);
      if (onSpeakText) onSpeakText(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setInternalSpeaking(false);
        if (onSpeakText) onSpeakText(false);
      };
      
      utterance.onerror = () => {
        setInternalSpeaking(false);
        if (onSpeakText) onSpeakText(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    if (!isSupported) {
      return (
        <div className="text-sm text-gray-500 p-2">
          Voice not available
        </div>
      );
    }

    const currentListening = isListening || internalListening;
    const currentSpeaking = isSpeaking || internalSpeaking;

    return (
      <div className="flex items-center space-x-2 relative" data-name="voice-interface" data-file="components/VoiceInterface.js">
        <button
          onClick={currentListening ? stopListening : startListening}
          className={`p-2 rounded-full transition-all ${
            currentListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : showFallback
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title={
            showFallback 
              ? 'Voice unavailable - use text input' 
              : currentListening 
              ? 'Recording... Click to stop' 
              : 'Click to speak'
          }
        >
          <div className={`text-lg ${
            showFallback 
              ? 'icon-type' 
              : currentListening 
              ? 'icon-mic-off' 
              : 'icon-mic'
          }`}></div>
        </button>
        
        {currentListening && (
          <div className="text-xs text-green-600 absolute -bottom-6 left-0 animate-pulse">
            🎤 Speak now...
          </div>
        )}
        
        {showFallback && (
          <div className="text-xs text-yellow-600 absolute -bottom-6 left-0">
            Use keyboard instead
          </div>
        )}
        
        <button
          onClick={() => speakText('Voice ready')}
          disabled={currentSpeaking}
          className={`p-2 rounded-full transition-all ${
            currentSpeaking 
              ? 'bg-blue-500 text-white animate-pulse' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title="Test speech output"
        >
          <div className="icon-volume-2 text-lg"></div>
        </button>
      </div>
    );
  } catch (error) {
    console.error('VoiceInterface component error:', error);
    return null;
  }
}
