"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdvancedModuleCreator from '@/components/admin/AdvancedModuleCreator';

interface Course {
  id: string;
  title: string;
}

interface ModuleData {
  id: string;
  title: string;
  videoUrl: string;
  homework: string;
  isLocked: boolean;
  order: number;
  duration?: string;
  description?: string;
  resources?: string[];
}

const CreateModulePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModules = async (modules: ModuleData[]) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          action: 'create',
          modules: modules.map(m => ({
            title: m.title,
            videoUrl: m.videoUrl,
            homework: m.homework,
            isLocked: m.isLocked,
            order: m.order
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/admin/category/${slug}/courses/${courseId}`);
      } else {
        throw new Error(data.error || 'Failed to create modules');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/admin/category/${slug}/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-4">Unable to load course information.</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdvancedModuleCreator
      courseId={courseId}
      courseTitle={course.title}
      categorySlug={slug}
      onSave={handleSaveModules}
      onCancel={handleCancel}
    />
  );
};

export default CreateModulePage;
