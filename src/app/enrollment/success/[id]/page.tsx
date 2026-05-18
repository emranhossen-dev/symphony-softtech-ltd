"use client";

import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Download, Calendar, BookOpen, Users, Star, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EnrollmentSuccessPage() {
  const params = useParams();
  const enrollmentId = params.id as string;
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollmentDetails();
  }, [enrollmentId]);

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Success Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Enrollment Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Congratulations! You have successfully enrolled in the course.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Enrollment Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <h2 className="text-2xl font-bold mb-2">Enrollment Confirmation</h2>
              <p className="text-blue-100">Enrollment ID: {enrollmentId}</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Course Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Course Name</p>
                        <p className="text-gray-600">{enrollmentData?.courseName || 'Loading...'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Enrollment Date</p>
                        <p className="text-gray-600">
                          {enrollmentData ? new Date(enrollmentData.createdAt).toLocaleDateString() : 'Loading...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Category</p>
                        <p className="text-gray-600">{enrollmentData?.category || 'Loading...'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs">👤</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Full Name</p>
                        <p className="text-gray-600">{enrollmentData?.fullName || 'Loading...'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Email Address</p>
                        <p className="text-gray-600">{enrollmentData?.email || 'Loading...'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Phone Number</p>
                        <p className="text-gray-600">{enrollmentData?.phoneNumber || 'Loading...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Enrollment Status</p>
                    <p className="text-gray-600">Your enrollment is being processed</p>
                  </div>
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {enrollmentData?.enrollmentStatus || 'PENDING_REVIEW'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
                <p className="text-gray-600 text-sm">You'll receive a confirmation email with detailed instructions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-gray-600 text-sm">Proceed with payment to secure your enrollment</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Learning</h3>
                <p className="text-gray-600 text-sm">Get access to course materials and begin your journey</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.href = `/course/${enrollmentData?.courseId}`}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              View Course
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.location.href = '/courses'}
              className="flex-1 bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse More Courses
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Receipt
            </button>
          </div>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@symphonyinstitute.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Visit our center</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
