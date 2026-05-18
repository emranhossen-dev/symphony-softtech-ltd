'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2, Lock } from 'lucide-react';

interface CourseAccessGuardProps {
  courseId: string;
  children: React.ReactNode;
}

export default function CourseAccessGuard({ courseId, children }: CourseAccessGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkCourseAccess();
  }, [courseId]);

  const checkCourseAccess = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/student/course/${courseId}/access`);

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401 || response.status === 403) {
          // Access denied - redirect to student dashboard
          toast.error('Access denied. You must be enrolled in this course to access it.');
          router.push('/student');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to check course access');
      }

      const data = await response.json();
      
      if (data.success) {
        setHasAccess(true);
      } else {
        throw new Error(data.error || 'Access denied');
      }

    } catch (error) {
      console.error('Course access check error:', error);
      
      // Show error toast and redirect
      toast.error('Access denied. You must be enrolled in this course to access it.');
      router.push('/student');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Course Access
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your enrollment...
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be enrolled in this course to access it. Please contact your administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.push('/student')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
