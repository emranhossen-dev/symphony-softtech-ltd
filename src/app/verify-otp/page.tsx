"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/forgot-password');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      const lastIndex = Math.min(pastedData.length - 1, 5);
      const nextInput = document.getElementById(`otp-${lastIndex}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          token: otpValue 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      toast.success('Code verified successfully!', {
        duration: 2000,
        position: 'top-center',
      });

      // Redirect to reset password page with email and token
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${otpValue}`);
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      toast.success('New code sent to your email!', {
        duration: 4000,
        position: 'top-center',
      });

      // Reset timer and OTP
      setTimeLeft(900);
      setOtp(['', '', '', '', '', '']);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-30 blur-md animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Enter Verification Code</h1>
            <p className="text-sm text-gray-400">
              We've sent a 6-digit code to {email}
            </p>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400">
              Code expires in: <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-purple-400'}`}>{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-center space-x-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold border border-white/20 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all hover:border-white/30"
                    placeholder="0"
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-xl h-12 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resendLoading || timeLeft > 0}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              {resendLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : timeLeft > 0 ? (
                `Resend in ${formatTime(timeLeft)}`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
