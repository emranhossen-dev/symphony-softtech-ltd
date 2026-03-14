"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Home, ShieldX, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Show red error toast immediately
    toast.error('Access Denied: You are not authorized to view this page.', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: '#ffffff',
        fontWeight: 'bold',
        borderRadius: '12px',
        padding: '16px 24px',
        fontSize: '14px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      },
    });

    // Auto-redirect to login after 3 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page. This area is restricted to authorized personnel only.
        </p>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 text-red-500">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">Restricted Access</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <Link href="/login">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Go to Login
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-all duration-200">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Auto-redirect Message */}
        <div className="text-sm text-gray-500">
          <p>Redirecting to login page in <span className="font-medium text-red-600">3 seconds</span>...</p>
        </div>
      </div>
    </div>
  );
}
