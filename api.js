const ApiClient = {
  // Base URL for API calls - can be configured for different environments
  baseUrl: window.location.origin.includes('localhost') 
    ? 'http://localhost:5000' 
    : window.location.origin,

  // Send chat message to backend for CBT-informed response
  sendChatMessage: async (message, moodScore = null) => {
    try {
      // For now, using the invokeAIAgent function for CBT responses
      const systemPrompt = `You are CLeO, a compassionate, safety-first mental health support assistant. 
      
Your role:
- Provide empathetic support using cognitive behavioral therapy (CBT) techniques
- Use single-sentence empathy, then suggest a CBT technique (cognitive reframing, behavioral activation, or grounding)
- Ask one reflective question or suggest a short exercise (2 steps maximum)
- If user indicates immediate danger, provide emergency resources and encourage contacting professionals
- Do NOT provide medical diagnoses or treatment advice
- Keep responses concise but warm and supportive

${moodScore ? `Context: User's recent mood score is ${moodScore}/5.` : ''}

Remember to focus on:
- Cognitive reframing for negative thought patterns
- Behavioral activation for low mood
- Grounding techniques for anxiety
- Mindfulness and self-compassion`;

      const userPrompt = message;
      
      // Use the built-in AI agent function
      const response = await invokeAIAgent(systemPrompt, userPrompt);
      
      return { message: response };
      
    } catch (error) {
      console.error('Error in chat API:', error);
      
      // Fallback CBT-style responses for common scenarios
      const fallbackResponses = [
        "I hear that you're going through something difficult right now. Sometimes when we're struggling, it can help to take a step back and notice our thoughts. What's one thought that's been on repeat in your mind today?",
        "It sounds like you're dealing with a lot. One thing that might help is grounding yourself in the present moment. Can you name 5 things you can see around you right now?",
        "I can sense you're having a tough time. When we're feeling overwhelmed, small actions can make a difference. What's one tiny thing you could do today to take care of yourself?",
        "Thank you for sharing that with me. Sometimes our thoughts can feel very real and urgent, but they're not always facts. What evidence do you have for and against this thought?"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return { message: randomResponse };
    }
  },

  // Save mood entry to backend (with local fallback)
  saveMoodEntry: async (entry) => {
    try {
      // For production, this would make an actual API call
      // For now, we'll simulate backend saving
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real backend, this would save to database
      console.log('Mood entry saved to backend:', entry);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error saving mood entry to backend:', error);
      // Local storage will handle the fallback
      throw error;
    }
  },

  // Get mood history from backend
  getMoodHistory: async () => {
    try {
      // For production, this would fetch from backend
      // For now, return local storage data
      return StorageUtils.getMoodEntries();
      
    } catch (error) {
      console.error('Error fetching mood history:', error);
      return StorageUtils.getMoodEntries();
    }
  }
};