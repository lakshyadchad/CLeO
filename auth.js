const AuthUtils = {
  // Generate secure password hash with salt
  hashPassword: async (password) => {
    const salt = 'cleo_2025_secure_salt';
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    
    // Multiple hash rounds for security
    let hashBuffer = await crypto.subtle.digest('SHA-256', data);
    for (let i = 0; i < 1000; i++) {
      hashBuffer = await crypto.subtle.digest('SHA-256', hashBuffer);
    }
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Generate JWT-like session token
  generateSessionToken: (userId) => {
    const tokenData = {
      userId: userId,
      timestamp: Date.now(),
      random: Math.random().toString(36)
    };
    return btoa(JSON.stringify(tokenData)).replace(/[^a-zA-Z0-9]/g, '');
  },

  // Generate unique user ID
  generateUserId: () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Sign up new user
  signUp: async (name, email, password) => {
    try {
      const existingUsers = await trickleListObjects('users', 100, false);
      const userExists = existingUsers.items.some(user => 
        user.objectData.email.toLowerCase() === email.toLowerCase()
      );

      if (userExists) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const userId = AuthUtils.generateUserId();
      const passwordHash = await AuthUtils.hashPassword(password);
      
      const userData = {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      };

      await trickleCreateObject('users', userData);
      
      // Create session token
      const sessionToken = AuthUtils.generateSessionToken(userId);
      const sessionData = {
        userId: userId,
        token: sessionToken,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await trickleCreateObject('user_sessions', sessionData);
      
      // Store only token in localStorage
      localStorage.setItem('cleo_session_token', sessionToken);
      
      return { 
        success: true, 
        user: { id: userId, name: userData.name, email: userData.email }
      };

    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    try {
      // Basic validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      // Get all users from database
      const allUsers = await trickleListObjects('users', 100, false);
      console.log('Total users found:', allUsers.items.length);
      
      // Find user by email (case insensitive)
      const user = allUsers.items.find(u => 
        u.objectData && u.objectData.email && 
        u.objectData.email.toLowerCase() === email.toLowerCase().trim()
      );

      console.log('User found:', user ? 'Yes' : 'No');

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Hash the provided password
      const passwordHash = await AuthUtils.hashPassword(password);
      console.log('Password hash generated');
      
      // Compare with stored hash
      if (passwordHash !== user.objectData.password_hash) {
        console.log('Password mismatch');
        return { success: false, error: 'Invalid email or password' };
      }

      console.log('Password validated successfully');

      // Clean up old sessions for this user
      await AuthUtils.cleanupOldSessions(user.objectData.id);
      
      // Create new session
      const sessionToken = AuthUtils.generateSessionToken(user.objectData.id);
      const sessionData = {
        userId: user.objectData.id,
        token: sessionToken,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await trickleCreateObject('user_sessions', sessionData);
      console.log('Session created successfully');
      
      // Store only token
      localStorage.setItem('cleo_session_token', sessionToken);
      
      return { 
        success: true, 
        user: { 
          id: user.objectData.id, 
          name: user.objectData.name, 
          email: user.objectData.email 
        }
      };

    } catch (error) {
      console.error('Sign in error details:', error);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  },

  // Clean up old sessions
  cleanupOldSessions: async (userId) => {
    try {
      const sessions = await trickleListObjects('user_sessions', 100, false);
      const userSessions = sessions.items.filter(s => s.objectData.userId === userId);
      
      for (const session of userSessions) {
        await trickleDeleteObject('user_sessions', session.objectId);
      }
    } catch (error) {
      console.log('Session cleanup error:', error);
    }
  },

  // Get current user from database using token
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('cleo_session_token');
      if (!token) return null;

      // Find valid session
      const sessions = await trickleListObjects('user_sessions', 100, false);
      const session = sessions.items.find(s => 
        s.objectData.token === token && 
        new Date(s.objectData.expiresAt) > new Date()
      );

      if (!session) {
        localStorage.removeItem('cleo_session_token');
        return null;
      }

      // Get fresh user data from database
      const users = await trickleListObjects('users', 100, false);
      const user = users.items.find(u => u.objectData.id === session.objectData.userId);

      if (!user) {
        localStorage.removeItem('cleo_session_token');
        return null;
      }

      return {
        id: user.objectData.id,
        name: user.objectData.name,
        email: user.objectData.email
      };

    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('cleo_session_token');
      return null;
    }
  },

  // Logout user and clear session
  logout: async () => {
    try {
      const token = localStorage.getItem('cleo_session_token');
      
      if (token) {
        // Remove session from database
        const sessions = await trickleListObjects('user_sessions', 100, false);
        const session = sessions.items.find(s => s.objectData.token === token);
        
        if (session) {
          await trickleDeleteObject('user_sessions', session.objectId);
        }
      }

      // Clear all local data
      localStorage.removeItem('cleo_session_token');
      localStorage.removeItem('cleo_chat_history');
      localStorage.removeItem('cleo_mood_entries');
      localStorage.removeItem('cleo_thought_entries');
      localStorage.removeItem('cleo_goals');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear(); // Force clear on error
      return { success: false };
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const user = await AuthUtils.getCurrentUser();
    return user !== null;
  },

  // Debug helper to check existing users (remove in production)
  debugUsers: async () => {
    try {
      const allUsers = await trickleListObjects('users', 100, false);
      console.log('=== DEBUG: All Users ===');
      allUsers.items.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          id: user.objectData.id,
          name: user.objectData.name,
          email: user.objectData.email,
          hasPassword: !!user.objectData.password_hash
        });
      });
      return allUsers.items;
    } catch (error) {
      console.error('Debug users error:', error);
      return [];
    }
  }
};
