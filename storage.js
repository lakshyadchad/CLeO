const StorageUtils = {
  // Get current user ID for database operations
  getCurrentUserId: async () => {
    const user = await AuthUtils.getCurrentUser();
    return user ? user.id : null;
  },

  // Consent management (database-backed)
  getConsent: async () => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return false;
      
      const settings = await trickleListObjects(`user_settings:${userId}`, 1, false);
      return settings.items.length > 0 ? settings.items[0].objectData.consent || false : false;
    } catch (error) {
      console.error('Error getting consent:', error);
      return false;
    }
  },

  setConsent: async (consent) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      await trickleCreateObject(`user_settings:${userId}`, {
        consent: consent,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error setting consent:', error);
    }
  },

  // Chat history management (database-backed)
  getChatHistory: async () => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return [];
      
      const chats = await trickleListObjects(`chat_messages:${userId}`, 100, false);
      return chats.items.map(item => item.objectData).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  },

  saveChatHistory: async (messages) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      // Save only new messages to avoid duplicates
      for (const message of messages) {
        if (!message.saved) {
          await trickleCreateObject(`chat_messages:${userId}`, {
            ...message,
            saved: true
          });
        }
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  },

  // Mood entries management (database-backed)
  getMoodEntries: async () => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return [];
      
      const moods = await trickleListObjects(`mood_entries:${userId}`, 100, false);
      return moods.items.map(item => item.objectData).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.error('Error getting mood entries:', error);
      return [];
    }
  },

  saveMoodEntry: async (entry) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      await trickleCreateObject(`mood_entries:${userId}`, entry);
    } catch (error) {
      console.error('Error saving mood entry:', error);
    }
  },

  getRecentMood: async () => {
    try {
      const entries = await StorageUtils.getMoodEntries();
      return entries.length > 0 ? entries[entries.length - 1] : null;
    } catch (error) {
      console.error('Error getting recent mood:', error);
      return null;
    }
  },

  // Thought journal management (database-backed)
  getThoughtEntries: async () => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return [];
      
      const thoughts = await trickleListObjects(`thought_entries:${userId}`, 100, false);
      return thoughts.items.map(item => ({
        ...item.objectData,
        dbId: item.objectId
      })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      console.error('Error getting thought entries:', error);
      return [];
    }
  },

  saveThoughtEntry: async (entry) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      await trickleCreateObject(`thought_entries:${userId}`, entry);
    } catch (error) {
      console.error('Error saving thought entry:', error);
    }
  },

  deleteThoughtEntry: async (id) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      const thoughts = await trickleListObjects(`thought_entries:${userId}`, 100, false);
      const thought = thoughts.items.find(item => item.objectData.id === id);
      
      if (thought) {
        await trickleDeleteObject(`thought_entries:${userId}`, thought.objectId);
      }
    } catch (error) {
      console.error('Error deleting thought entry:', error);
    }
  },

  // Goals management (database-backed)
  getGoals: async () => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return [];
      
      const goals = await trickleListObjects(`goals:${userId}`, 100, false);
      return goals.items.map(item => ({
        ...item.objectData,
        dbId: item.objectId
      })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  },

  saveGoal: async (goal) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      await trickleCreateObject(`goals:${userId}`, goal);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  },

  updateGoals: async (goals) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      // Clear existing and save new
      const existingGoals = await trickleListObjects(`goals:${userId}`, 100, false);
      for (const goal of existingGoals.items) {
        await trickleDeleteObject(`goals:${userId}`, goal.objectId);
      }
      
      for (const goal of goals) {
        await trickleCreateObject(`goals:${userId}`, goal);
      }
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  },

  deleteGoal: async (id) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      const goals = await trickleListObjects(`goals:${userId}`, 100, false);
      const goal = goals.items.find(item => item.objectData.id === id);
      
      if (goal) {
        await trickleDeleteObject(`goals:${userId}`, goal.objectId);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  },

  // Location consent management (database-backed)
  getLocationConsent: async () => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return false;
      
      const settings = await trickleListObjects(`user_settings:${userId}`, 1, false);
      return settings.items.length > 0 ? settings.items[0].objectData.locationConsent || false : false;
    } catch (error) {
      console.error('Error getting location consent:', error);
      return false;
    }
  },

  setLocationConsent: async (consent) => {
    try {
      const userId = await StorageUtils.getCurrentUserId();
      if (!userId) return;
      
      await trickleCreateObject(`user_settings:${userId}`, {
        locationConsent: consent,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error setting location consent:', error);
    }
  }
};
