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

function SignInPage() {
  try {
    const [formData, setFormData] = React.useState({
      email: '',
      password: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
      // Check if user is already authenticated
      const checkAuth = async () => {
        const user = await AuthUtils.getCurrentUser();
        if (user) {
          window.location.href = 'index.html';
        }
      };
      checkAuth();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        console.log('Attempting sign in with:', { email: formData.email });
        
        // Debug: Check existing users
        await AuthUtils.debugUsers();
        
        const result = await AuthUtils.signIn(formData.email, formData.password);
        console.log('Sign in result:', { success: result.success, error: result.error });
        
        if (result.success) {
          console.log('Sign in successful, redirecting...');
          window.location.href = 'index.html';
        } else {
          setError(result.error || 'Sign in failed');
        }
      } catch (err) {
        console.error('Sign in exception:', err);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="min-h-screen hero-background relative" data-name="signin-page" data-file="signin-app.js">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img 
                    src="https://app.trickle.so/storage/public/images/usr_14b22d54c0000001/50172161-97bf-450f-8874-37b4aba2940c.Untitled design" 
                    alt="CLeO Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome Back</h1>
                <p className="text-[var(--text-secondary)]">Sign in to continue your wellness journey</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="icon-alert-circle text-red-500 mr-2"></div>
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="icon-loader text-lg mr-2 animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  Don't have an account?{' '}
                  <a href="signup.html" className="text-[var(--primary-color)] hover:underline font-medium">
                    Sign Up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SignInPage component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <SignInPage />
  </ErrorBoundary>
);