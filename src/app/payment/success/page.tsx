"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Calendar, BookOpen, Users, Star } from 'lucide-react';

const PaymentSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);

  useEffect(() => {
    const enrollmentId = searchParams.get('enrollment');
    if (enrollmentId) {
      fetchEnrollmentDetails(enrollmentId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchEnrollmentDetails = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`);
      const data = await response.json();
      
      if (data.success) {
        setEnrollmentData(data.enrollment);
      }
    } catch (error) {
      console.error('Error fetching enrollment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your enrollment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-white/90">
                Your enrollment has been confirmed
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              {enrollmentData ? (
                <>
                  {/* Course Details */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Course Details
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course Name:</span>
                        <span className="font-semibold">{enrollmentData.courseName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-semibold">{enrollmentData.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Enrollment ID:</span>
                        <span className="font-mono text-sm">{enrollmentData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      What's Next?
                    </h2>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</div>
                        <span className="text-gray-700">Check your email for enrollment confirmation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">2</div>
                        <span className="text-gray-700">Access your dashboard to view course materials</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">3</div>
                        <span className="text-gray-700">Join the student community and start learning</span>
                      </li>
                    </ul>
                  </div>

                  {/* Student Info */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Student Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-semibold">{enrollmentData.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold">{enrollmentData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-semibold">{enrollmentData.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Enrollment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your payment has been processed and you are now enrolled in the course.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse More Courses
                </button>
              </div>

              {/* Help Section */}
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">Need Help?</h3>
                    <p className="text-yellow-700 text-sm">
                      If you have any questions about your enrollment or need assistance, 
                      please contact our support team at support@symphony-training.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
