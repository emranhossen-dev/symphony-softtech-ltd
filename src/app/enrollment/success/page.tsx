"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Mail, Clock, ArrowRight, Sparkles } from 'lucide-react';

function EnrollmentSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const tran_id = searchParams.get('tran_id');
        const bank_tran_id = searchParams.get('bank_tran_id');
        const card_type = searchParams.get('card_type');
        const amount = searchParams.get('amount');
        const store_amount = searchParams.get('store_amount');
        const currency = searchParams.get('currency');
        const status = searchParams.get('status');
        const error_message = searchParams.get('error_message');

        if (status === 'FAILED' || error_message) {
          setError(error_message || 'Payment failed');
          setLoading(false);
          return;
        }

        if (!tran_id || status !== 'SUCCESS') {
          setError('Invalid payment response');
          setLoading(false);
          return;
        }

        // Verify payment with SSL Commerce IPN
        const response = await fetch('/api/payment/ssl-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tran_id,
            bank_tran_id,
            card_type,
            amount,
            store_amount,
            currency,
            status,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setEnrollmentData(data.enrollment);
          
          // Send confirmation email
          await fetch('/api/email/send-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.enrollment.email,
              fullName: data.enrollment.fullName,
              courseName: data.enrollment.courseName,
              paymentMethod: data.enrollment.paymentMethod,
              amount: data.enrollment.amount,
            }),
          });
        } else {
          setError(data.error || 'Payment verification failed');
        }
      } catch (err) {
        setError('Payment verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Verifying Payment...</h2>
          <p className="text-white/70">Please wait while we confirm your enrollment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Payment Failed</h2>
          <p className="text-white/70 mb-8">{error}</p>
          <button
            onClick={() => router.push('/enrollment')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 enhanced-icon-glow">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Enrollment
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            Successful!
          </span>
        </h1>
        
        <p className="text-xl text-white/70 mb-8 leading-relaxed">
          Congratulations! Your enrollment has been confirmed. Check your email for next steps.
        </p>

        {/* Enrollment Details */}
        {enrollmentData && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Enrollment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Course:</span>
                    <span className="text-white font-medium">{enrollmentData.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Payment Method:</span>
                    <span className="text-white font-medium">
                      {enrollmentData.paymentMethod === 'ONLINE_BATCH' ? 'Online Live Batch' : 'Recorded Course'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Amount Paid:</span>
                    <span className="text-green-400 font-bold">৳{enrollmentData.amount}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Student Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Name:</span>
                    <span className="text-white font-medium">{enrollmentData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Email:</span>
                    <span className="text-white font-medium">{enrollmentData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Phone:</span>
                    <span className="text-white font-medium">{enrollmentData.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            What's Next?
          </h3>
          <div className="space-y-3 text-white/70">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <span>Check your email for confirmation and course access details</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Course access will be activated within 24 hours</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/courses')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Browse More Courses
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 text-white flex items-center justify-center">Loading...</div>}>
      <EnrollmentSuccessContent />
    </Suspense>
  );
}
