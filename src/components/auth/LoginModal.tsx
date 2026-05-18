"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      toast.success('Login successful! Redirecting...', {
        duration: 2000,
        position: 'top-center',
        style: {
          zIndex: 10000,
        },
      });

      // Alert fallback
      alert('Login successful! Redirecting...');

      setTimeout(() => {
        window.location.href = data.redirect || '/admin/dashboard';
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          zIndex: 10000,
        },
      });
      // Alert fallback
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card - centered */}
      <div className="relative z-10 bg-gradient-to-br from-slate-900 via-purple-900/95 to-slate-900 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-[90vw] sm:max-w-md shadow-2xl border-2 border-white/10 overflow-hidden mx-auto">
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse"></div>
        
        {/* Inner card */}
        <div className="relative z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-white/10 transition-colors group border border-white/20"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>

        {/* Logo and Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-20 h-20 relative mx-auto bg-white rounded-lg p-2 shadow-lg">
                <Image
                  src="/Logo.jpeg"
                  alt="Symphony Institute of Technology"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-xs sm:text-sm text-gray-400">Sign in to access your dashboard</p>
          </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-white/20 rounded-xl text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 bg-white/10 text-white transition-all hover:border-white/30"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-white/20 rounded-xl text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 bg-white/10 text-white transition-all hover:border-white/30"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-white/10"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-xs sm:text-sm text-gray-300">
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl h-10 sm:h-12 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs sm:text-sm">Signing in...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center text-xs sm:text-sm">
                Sign In
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            Contact administrator for account access
          </p>
        </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
