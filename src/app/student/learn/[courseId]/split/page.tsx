"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SplitCourseView from '@/components/student/SplitCourseView';

interface Module {
  id: string;
  courseId: string;
  title: string;
  videoUrl?: string;
  homework?: string;
  order: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  duration?: string;
  thumbnail?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SplitCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  console.log('SplitCoursePage - courseId:', courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
    fetchModules();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      console.log('Fetching course for ID:', courseId);
      const response = await fetch(`/api/courses/${courseId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('Course API Response:', data);
      
      if (data.success) {
        console.log('Course found:', data.course);
        setCourse(data.course);
      } else {
        console.error('Course API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      console.log('Modules API Response:', data);
      
      if (data.success) {
        const sortedModules = data.modules.sort((a: Module, b: Module) => a.order - b.order);
        console.log('Sorted modules:', sortedModules);
        console.log('First module videoUrl:', sortedModules[0]?.videoUrl);
        setModules(sortedModules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/student/dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const courseWithModules = {
    ...course,
    duration: course.duration || '',
    modules: modules.map(module => ({
      ...module,
      isCompleted: module.completed,
      isUnlocked: !module.isLocked,
      completedAt: module.completed ? new Date().toISOString() : null
    }))
  };

  return (
    <SplitCourseView 
      course={courseWithModules}
      onBack={handleBack}
    />
  );
};
