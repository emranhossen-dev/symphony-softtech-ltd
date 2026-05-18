import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CourseAccessData {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    modules: Array<{
      id: string;
      title: string;
      order: number;
      isLocked: boolean;
      isCompleted: boolean;
    }>;
  };
  enrollment: {
    id: string;
    enrollmentStatus: string;
    enrolledAt: string;
  };
  progress: {
    totalModules: number;
    completedModules: number;
    progressPercentage: number;
  };
}

export function useCourseAccess(courseId: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [courseData, setCourseData] = useState<CourseAccessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCourseAccess();
  }, [courseId]);

  const checkCourseAccess = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        setCourseData(data.data);
      } else {
        throw new Error(data.error || 'Access denied');
      }

    } catch (error) {
      console.error('Course access check error:', error);
      
      if (error instanceof Error) {
        setError(error.message);
        
        // If it's an access error, show toast and redirect
        if (error.message.includes('Access denied') || error.message.includes('Authentication required')) {
          toast.error('Access denied. You must be enrolled in this course to access it.');
          router.push('/student');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    hasAccess,
    courseData,
    error,
    refetch: checkCourseAccess
  };
}
