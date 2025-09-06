function ChatInterface() {
  try {
  const [messages, setMessages] = React.useState([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
      const loadMessages = async () => {
        const savedMessages = await StorageUtils.getChatHistory();
        setMessages(savedMessages);
      };
      loadMessages();
    }, []);

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const checkForEmergency = (message) => {
      const emergencyKeywords = [
        'suicide', 'suicidal', 'kill myself', 'end my life', 'harm myself', 
        'want to die', 'better off dead', 'can\'t go on', 'no point living',
        'self harm', 'cut myself', 'hurt myself', 'overdose', 'end it all'
      ];
      const lowercaseMessage = message.toLowerCase();
      return emergencyKeywords.some(keyword => lowercaseMessage.includes(keyword));
    };

    const handleSendMessage = async () => {
      if (!inputMessage.trim()) return;

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        // Check for emergency content
        if (checkForEmergency(inputMessage)) {
          const emergencyResponse = {
            id: Date.now() + 1,
            type: 'assistant',
            content: "I'm concerned about what you've shared. Please reach out for immediate help:\n\n🚨 **Emergency Resources:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• Emergency Services: 112\n\nYou don't have to go through this alone. Professional counselors are available 24/7 to help.",
            timestamp: new Date().toISOString(),
            isEmergency: true
          };

          const updatedMessages = [...messages, userMessage, emergencyResponse];
          setMessages(updatedMessages);
          StorageUtils.saveChatHistory(updatedMessages);
          setIsLoading(false);
          return;
        }

        // Get current mood for context
        const recentMood = await StorageUtils.getRecentMood();
        
        // Call chat API
        const response = await ApiClient.sendChatMessage(inputMessage, recentMood?.score);
        
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...messages, userMessage, assistantMessage];
        setMessages(updatedMessages);
        await StorageUtils.saveChatHistory(updatedMessages);

      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment. Remember, if you need immediate help, please contact emergency services or a crisis hotline.",
          timestamp: new Date().toISOString(),
          isError: true
        };

        const updatedMessages = [...messages, userMessage, errorMessage];
        setMessages(updatedMessages);
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const handleVoiceInput = (transcript) => {
      const processed = VoiceUtils.processSpeechInput(transcript);
      setInputMessage(processed.transcript);
      setIsListening(false);
      
      if (processed.shouldTriggerEmergency) {
        setTimeout(() => handleSendMessage(), 500);
      }
    };

    const handleSpeakResponse = (shouldSpeak) => {
      setIsSpeaking(shouldSpeak);
    };

    // Speak the last assistant message when it's received
    React.useEffect(() => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.type === 'assistant' && !lastMessage.isEmergency) {
        // Auto-speak assistant responses (optional)
        // You can enable this by uncommenting the line below
        // VoiceUtils.speakText(lastMessage.content);
      }
    }, [messages]);

    return (
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg h-[calc(100vh-200px)] flex flex-col relative overflow-hidden" data-name="chat-interface" data-file="components/ChatInterface.js">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--primary-color)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="icon-message-circle text-2xl text-[var(--primary-color)]"></div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Start a conversation</h3>
              <p className="text-[var(--text-secondary)] mb-4">How are you feeling today? I'm here to listen and support you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`message-bubble ${
                      message.type === 'user'
                        ? 'bg-[var(--primary-color)] text-white'
                        : message.isEmergency
                        ? 'bg-red-50 border-2 border-red-200 text-red-800'
                        : 'bg-gray-100 text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-2 opacity-70`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="message-bubble bg-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-500">CLeO is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
            <div className="flex flex-col space-y-2">
              <VoiceInterface 
                onVoiceInput={handleVoiceInput}
                onSpeakText={handleSpeakResponse}
                isListening={isListening}
                isSpeaking={isSpeaking}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="icon-send text-lg"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ChatInterface component error:', error);
    return null;
  }
}