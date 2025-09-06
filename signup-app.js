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

function SignUpPage() {
  try {
    const [formData, setFormData] = React.useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({});

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

    const validateForm = () => {
      const newErrors = {};

      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      try {
        console.log('Attempting sign up with:', { 
          name: formData.name, 
          email: formData.email 
        });
        
        const result = await AuthUtils.signUp(formData.name, formData.email, formData.password);
        console.log('Sign up result:', { success: result.success, error: result.error });
        
        if (result.success) {
          console.log('Sign up successful, redirecting...');
          window.location.href = 'index.html';
        } else {
          setErrors({ general: result.error || 'Sign up failed' });
        }
      } catch (err) {
        console.error('Sign up exception:', err);
        setErrors({ general: 'Network error. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
      
      // Clear specific field error when user starts typing
      if (errors[e.target.name]) {
        setErrors({
          ...errors,
          [e.target.name]: ''
        });
      }
    };

    return (
      <div className="min-h-screen hero-background relative" data-name="signup-page" data-file="signup-app.js">
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
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Join CLeO</h1>
                <p className="text-[var(--text-secondary)]">Start your mental wellness journey today</p>
              </div>

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="icon-alert-circle text-red-500 mr-2"></div>
                    <span className="text-red-700 text-sm">{errors.general}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                    className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="At least 8 characters"
                    required
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                    required
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="icon-loader text-lg mr-2 animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  Already have an account?{' '}
                  <a href="signin.html" className="text-[var(--primary-color)] hover:underline font-medium">
                    Sign In
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('SignUpPage component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <SignUpPage />
  </ErrorBoundary>
);
