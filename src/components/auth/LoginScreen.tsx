'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { BoltLogo } from '@/components/ui';
import { useThemeStore } from '@/lib/theme';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { isDarkMode } = useThemeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSSOLogin = async (providerId: string) => {
    setIsLoading(true);
    setLoadingProvider(providerId);

    // Simulate SSO redirect
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setLoadingProvider(null);
    onLogin();
  };

  const handleEmailContinue = async () => {
    setEmailError('');

    if (!email) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');

    // Simulate email validation
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);
    setLoadingProvider(null);
    setStep('password');
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('password');

    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    setLoadingProvider(null);
    onLogin();
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
    setPasswordError('');
  };

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center px-4 transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center">
            <BoltLogo className="h-20 w-auto" variant={isDarkMode ? 'dark' : 'light'} />
          </div>
          <h1 className={`mt-6 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {step === 'email' ? 'Welcome back' : 'Enter your password'}
          </h1>
          {step === 'password' && (
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{email}</p>
          )}
        </div>

        {step === 'email' ? (
          <>
            {/* SSO Buttons */}
            <div className="space-y-3">
              {/* Microsoft SSO */}
              <button
                onClick={() => handleSSOLogin('microsoft')}
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3.5 text-base font-normal transition-colors disabled:opacity-50 ${
                  isDarkMode
                    ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {loadingProvider === 'microsoft' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                  </svg>
                )}
                Continue with Microsoft
              </button>
            </div>

            {/* OR Divider */}
            <div className="my-6 flex items-center">
              <div className={`flex-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              <span className={`px-4 text-sm uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>or</span>
              <div className={`flex-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailContinue()}
                  placeholder="Email address"
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`w-full rounded-lg border px-4 py-3.5 text-base outline-none transition-colors focus:ring-1 ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : isDarkMode
                        ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-[#918AD3] focus:ring-[#918AD3]'
                        : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#5B50BD] focus:ring-[#5B50BD]'
                  }`}
                />
                {emailError && (
                  <div id="email-error" className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {emailError}
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <label className={`flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#5B50BD] focus:ring-[#5B50BD]"
                />
                <span className="text-sm">Remember me</span>
              </label>

              {/* Continue Button */}
              <button
                onClick={handleEmailContinue}
                disabled={isLoading || !email}
                className="flex w-full items-center justify-center rounded-lg bg-[#5B50BD] px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#4A41A0] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] focus:ring-offset-2"
              >
                {loadingProvider === 'email' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Back Button */}
            <button
              onClick={handleBack}
              className={`mb-6 flex items-center gap-2 text-sm transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Password Input */}
            <div className="space-y-3">
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    placeholder="Password"
                    autoFocus
                    aria-describedby={passwordError ? 'password-error' : undefined}
                    className={`w-full rounded-lg border px-4 py-3.5 pr-12 text-base outline-none transition-colors focus:ring-1 ${
                      passwordError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-[#918AD3] focus:ring-[#918AD3]'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#5B50BD] focus:ring-[#5B50BD]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                      isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && (
                  <div id="password-error" className="mt-2 flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handlePasswordSubmit}
                disabled={isLoading || !password}
                className="flex w-full items-center justify-center rounded-lg bg-[#5B50BD] px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#4A41A0] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] focus:ring-offset-2"
              >
                {loadingProvider === 'password' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <button className={`text-sm transition-colors ${
                  isDarkMode ? 'text-[#918AD3] hover:text-[#a89de0]' : 'text-[#5B50BD] hover:text-[#4A41A0]'
                }`}>
                  Forgot password?
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'} hover:underline`}>
              Terms of Use
            </a>
            <span className="mx-2">|</span>
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-600'} hover:underline`}>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
