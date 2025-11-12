import React, { useState } from 'react';
import { sendResetEmail, confirmResetPassword } from '../utils/passwordReset';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TFunction } from '../types';
import { track } from '../utils/analytics';

interface LoginProps {
  language: string;
  t: TFunction;
}

const Login: React.FC<LoginProps> = ({ language, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    
    try {
      if (isSignUp) {
        if (!name) {
          throw new Error(t.nameRequired);
        }
        await signUp(email, password, name);
        setMessage(t.signUpSuccess);
        track.action('signup_success', 'authentication');
        // Redirect to dashboard after successful sign up
        setTimeout(() => {
          navigate('/');
        }, 1000); // Show message for 1 second, then redirect
      } else {
        await signIn(email, password);
        setMessage(t.signInSuccess);
        track.action('login_success', 'authentication');
        // Redirect to dashboard after successful login
        navigate('/');
      }
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      // Show user-friendly error for wrong password
      if (!isSignUp && err.code === 'auth/invalid-credential') {
        setError('Incorrect password.');
      } else {
        setError(err.message);
      }
      track.error(isSignUp ? 'signup_error' : 'login_error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setMessage(null);
  };

  // Handle password reset email
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await sendResetEmail(resetEmail);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle password reset confirmation
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await confirmResetPassword(resetCode, newPassword);
      setMessage('Password has been reset! You can now sign in.');
      setShowReset(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-100 via-white to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Animated background shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
      </div>
      <div className="relative z-10 max-w-md w-full">
        <div className="space-y-8 bg-white/90 dark:bg-gray-800/90 p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-green-100 dark:border-green-900 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-green-200 dark:hover:shadow-green-900">
          <div className="flex flex-col items-center gap-2">
            <h2 className="mt-2 text-center text-3xl font-extrabold text-green-700 dark:text-green-300 drop-shadow-sm">
              {isSignUp ? t.createAccount : t.signInToAccount}
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-300 text-sm font-medium">{t.appSubtitle}</p>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-shake" role="alert" aria-live="assertive">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-fadeIn" role="alert" aria-live="polite">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
          {!showReset ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="on" aria-label={isSignUp ? t.createAccount : t.signInToAccount}>
            <div className="rounded-2xl shadow-sm space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t.name}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                    placeholder={t.name}
                    required
                    aria-required="true"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t.emailAddress}</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                  placeholder={t.emailAddress}
                  aria-required="true"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t.password}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                  placeholder={t.password}
                  aria-required="true"
                />
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowReset(true)}
                    className="absolute right-0 bottom-0 mb-2 mr-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg shadow text-xs font-semibold hover:bg-blue-200 transition-all border border-blue-200"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                aria-busy={loading}
              >
                <span className="flex items-center gap-2">
                  {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                  {loading ? t.processing : isSignUp ? t.signUp : t.signIn}
                </span>
              </button>
            </div>
            <div className="text-center mt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 underline underline-offset-2 transition-colors"
                aria-pressed={isSignUp}
              >
                {isSignUp ? t.alreadyHaveAccount : t.needAccount}
              </button>
            </div>
          </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={resetCode ? handleConfirmReset : handleSendReset} autoComplete="off" aria-label="Reset Password">
              {!resetCode ? (
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Enter your email to reset password</label>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                    placeholder="Email address"
                    required
                  />
                  <button type="submit" className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Send Reset Email</button>
                  <button type="button" className="mt-2 w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition" onClick={() => setShowReset(false)}>Back to Sign In</button>
                </div>
              ) : (
                <div>
                  <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Enter the code from your email</label>
                  <input
                    id="reset-code"
                    name="reset-code"
                    type="text"
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                    placeholder="Reset code (oobCode)"
                    required
                  />
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 mt-4">New Password</label>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                    placeholder="New password"
                    required
                  />
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 mt-4">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                  <button type="submit" className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">Reset Password</button>
                  <button type="button" className="mt-2 w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition" onClick={() => setShowReset(false)}>Back to Sign In</button>
                </div>
              )}
            </form>
          )}
        </div>
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          {t.footerText.replace('{year}', new Date().getFullYear().toString())}
        </div>
      </div>
    </div>
  );
};

export default Login;