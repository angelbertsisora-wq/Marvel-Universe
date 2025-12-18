import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm, router } from '@inertiajs/react';
import { IoClose } from 'react-icons/io5';

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [resetForm, setResetForm] = useState({ email: '', newPassword: '', confirmPassword: '' });

  const { isAuthenticated } = useAuth();

  // Reset forms when modal opens/closes or tab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setShowReset(false);
      setError('');
      setSuccess('');
      setLoginForm({ email: '', password: '' });
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
      setResetForm({ email: '', newPassword: '', confirmPassword: '' });
    }
  }, [isOpen, initialTab]);

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Inertia form for login
  const loginFormInertia = useForm({
    email: '',
    password: '',
  });

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    loginFormInertia.setData({
      email: loginForm.email,
      password: loginForm.password,
    });

    loginFormInertia.post(route('login'), {
      onSuccess: () => {
        setSuccess('Login successful!');
        setTimeout(() => {
          onClose();
          router.reload({ only: ['auth'] });
        }, 1000);
      },
      onError: (errors) => {
        if (errors.email) {
          setError(errors.email);
        } else if (errors.password) {
          setError(errors.password);
        } else {
          setError('Invalid email or password. Please try again.');
        }
      },
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  // Inertia form for registration
  const registerFormInertia = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    registerFormInertia.setData({
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password,
      password_confirmation: signupForm.confirmPassword,
    });

    registerFormInertia.post(route('register'), {
      onSuccess: () => {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          onClose();
          router.reload({ only: ['auth'] });
        }, 1000);
      },
      onError: (errors) => {
        if (errors.name) {
          setError(errors.name);
        } else if (errors.email) {
          setError(errors.email);
        } else if (errors.password) {
          setError(errors.password);
        } else {
          setError('Registration failed. Please try again.');
        }
      },
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  // Handle password reset (disabled - use Laravel password reset flow)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('Password reset is not available in this modal. Please use the "Forgot Password" link on the login page.');
    setShowReset(false);
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden animate-popUp"
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          animation: 'popUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-200 hover:bg-white/10 rounded-full transition-all duration-200"
          aria-label="Close modal"
        >
          <IoClose size={24} />
        </button>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/20 bg-white/5">
          <button
            onClick={() => { setActiveTab('login'); setShowReset(false); setError(''); setSuccess(''); }}
            className={`flex-1 px-6 py-4 text-sm font-semibold uppercase transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-white/20 text-white border-b-3 border-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setShowReset(false); setError(''); setSuccess(''); }}
            className={`flex-1 px-6 py-4 text-sm font-semibold uppercase transition-all duration-200 ${
              activeTab === 'signup'
                ? 'bg-white/20 text-white border-b-3 border-white shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-8 animate-fadeInContent" style={{ animation: 'fadeInContent 0.5s ease-out 0.2s both' }}>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/30 backdrop-blur-sm border border-red-400/60 rounded-lg text-white text-sm font-medium shadow-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/30 backdrop-blur-sm border border-green-400/60 rounded-lg text-white text-sm font-medium shadow-lg">
              {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && !showReset && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-white mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/40 text-white font-semibold uppercase rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setError(''); setSuccess(''); }}
                  className="text-sm text-white/90 hover:text-white underline transition-colors duration-200 font-medium"
                >
                  Forgot Password? Reset here
                </button>
              </div>
            </form>
          )}

          {/* Password Reset Form (shown from login) */}
          {activeTab === 'login' && showReset && (
            <div className="space-y-5">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setError(''); setSuccess(''); setResetForm({ email: '', newPassword: '', confirmPassword: '' }); }}
                  className="text-sm text-white/90 hover:text-white underline transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  ← Back to Login
                </button>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-white mb-2">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetForm.email}
                    onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reset-new-password" className="block text-sm font-semibold text-white mb-2">
                    New Password
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                    placeholder="Enter new password (min. 6 characters)"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reset-confirm" className="block text-sm font-semibold text-white mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="reset-confirm"
                    type="password"
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/40 text-white font-semibold uppercase rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-semibold text-white mb-2">
                  Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-semibold text-white mb-2">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                  placeholder="Enter your password (min. 6 characters)"
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-semibold text-white mb-2">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/25 transition-all duration-200 shadow-lg"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-white/30 hover:bg-white/40 backdrop-blur-sm border border-white/40 text-white font-semibold uppercase rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
