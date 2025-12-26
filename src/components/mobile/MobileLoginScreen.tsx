'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { BoltLogo } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';

export function MobileLoginScreen() {
  const { setLoggedIn } = useAppStore();
  const { isDarkMode } = useThemeStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'password'>('email');

  const handleSSOLogin = (provider: string) => {
    setIsLoading(true);
    setLoadingProvider(provider);
    setTimeout(() => {
      setLoggedIn(true);
      setIsLoading(false);
      setLoadingProvider(null);
    }, 1000);
  };

  const handleEmailContinue = () => {
    if (!email) return;
    setIsLoading(true);
    setLoadingProvider('email');
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProvider(null);
      setStep('password');
    }, 500);
  };

  const handlePasswordSubmit = () => {
    if (!password) return;
    setIsLoading(true);
    setLoadingProvider('password');
    setTimeout(() => {
      setLoggedIn(true);
      setIsLoading(false);
      setLoadingProvider(null);
    }, 1000);
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center">
            <BoltLogo className="h-20 w-auto" variant={isDarkMode ? 'dark' : 'light'} />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            {step === 'email' ? 'Welcome back' : 'Enter your password'}
          </h1>
          {step === 'password' && (
            <p className="mt-2 text-sm text-gray-500">{email}</p>
          )}
        </div>

        {step === 'email' ? (
          <>
            {/* SSO Buttons */}
            <div className="space-y-3">
              {/* Google SSO */}
              <button
                onClick={() => handleSSOLogin('google')}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base font-normal text-gray-700 transition-colors active:bg-gray-50 disabled:opacity-50"
              >
                {loadingProvider === 'google' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Microsoft SSO */}
              <button
                onClick={() => handleSSOLogin('microsoft')}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base font-normal text-gray-700 transition-colors active:bg-gray-50 disabled:opacity-50"
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

              {/* Okta SSO */}
              <button
                onClick={() => handleSSOLogin('okta')}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base font-normal text-gray-700 transition-colors active:bg-gray-50 disabled:opacity-50"
              >
                {loadingProvider === 'okta' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#007dc1">
                    <path d="M12 0C5.389 0 0 5.389 0 12s5.389 12 12 12 12-5.389 12-12S18.611 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>
                  </svg>
                )}
                Continue with Okta
              </button>
            </div>

            {/* OR Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-400 uppercase">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 outline-none focus:border-[#5B50BD] focus:ring-1 focus:ring-[#5B50BD]"
              />

              {/* Continue Button */}
              <button
                onClick={handleEmailContinue}
                disabled={isLoading || !email}
                className="flex w-full items-center justify-center rounded-lg bg-[#5B50BD] px-4 py-3.5 text-base font-medium text-white transition-colors active:bg-[#4A41A0] disabled:opacity-50"
              >
                {loadingProvider === 'email' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
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
              className="mb-6 flex items-center gap-2 text-sm text-gray-500 active:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Password Input */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3.5 pr-12 text-base text-gray-900 placeholder-gray-400 outline-none focus:border-[#5B50BD] focus:ring-1 focus:ring-[#5B50BD]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 active:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Continue Button */}
              <button
                onClick={handlePasswordSubmit}
                disabled={isLoading || !password}
                className="flex w-full items-center justify-center rounded-lg bg-[#5B50BD] px-4 py-3.5 text-base font-medium text-white transition-colors active:bg-[#4A41A0] disabled:opacity-50"
              >
                {loadingProvider === 'password' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Continue'
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <button className="text-sm text-[#5B50BD] active:text-[#4A41A0]">
                  Forgot password?
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            <a href="#" className="hover:underline">Terms of Use</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
