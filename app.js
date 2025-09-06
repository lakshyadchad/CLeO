class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [hasConsented, setHasConsented] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('chat');
    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      const checkAuth = async () => {
        const authUser = await AuthUtils.getCurrentUser();
        if (authUser) {
          setIsAuthenticated(true);
          setUser(authUser);
          const consent = StorageUtils.getConsent();
          setHasConsented(consent);
        } else {
          window.location.href = 'signin.html';
        }
        setIsLoading(false);
      };
      
      checkAuth();
    }, []);

    const handleConsent = () => {
      StorageUtils.setConsent(true);
      setHasConsented(true);
    };

    const handleLogout = async () => {
      await AuthUtils.logout();
      window.location.href = 'signin.html';
    };

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="icon-loader text-4xl animate-spin mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect to signin
    }

    if (!hasConsented) {
      return <ConsentModal onConsent={handleConsent} />;
    }

    return (
      <div className="min-h-screen hero-background relative" data-name="app" data-file="app.js">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10">
        {/* Emergency Button - Always Visible */}
        <EmergencyButton />
        
        {/* Header */}
        <header className="bg-black bg-opacity-80 backdrop-blur-sm shadow-lg border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">CLeO</h1>
                <div className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                  Welcome, {user?.name}
                </div>
              </div>
              <div className="flex items-center space-x-2 pr-14 sm:pr-4">
                <div className="text-xs text-gray-300 sm:hidden">
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-2 sm:px-3 py-1 rounded transition-colors text-sm"
                >
                  <div className="icon-log-out text-lg sm:mr-1 inline-block"></div>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
            <div className="mt-4">
              <nav className="flex flex-wrap justify-center gap-2 px-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'chat' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-message-circle text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab('mood')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'mood' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-heart text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Mood</span>
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'progress' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-trending-up text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Progress</span>
                </button>
                <button
                  onClick={() => setActiveTab('breathe')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'breathe' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-wind text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Breathe</span>
                </button>
                <button
                  onClick={() => setActiveTab('journal')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'journal' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-book text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Journal</span>
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'goals' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-target text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Goals</span>
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeTab === 'weather' 
                      ? 'bg-[var(--primary-color)] text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <div className="icon-cloud text-lg sm:mr-2 inline-block"></div>
                  <span className="hidden sm:inline">Weather</span>
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-4">
          {activeTab === 'chat' ? <ChatInterface /> : 
           activeTab === 'mood' ? <MoodTracker /> : 
           activeTab === 'progress' ? <ProgressDashboard /> :
           activeTab === 'breathe' ? <BreathingExercise /> :
           activeTab === 'journal' ? <ThoughtJournal /> :
           activeTab === 'goals' ? <GoalTracker /> :
           activeTab === 'weather' ? <WeatherAdvisor /> :
           <ChatInterface />}
        </main>

        {/* Emergency Footer */}
        <EmergencyFooter />
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);