"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { 
  Save,
  ArrowLeft,
  Video,
  FileText,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

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
}

interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
}

const EditModulePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    homework: '',
    isLocked: true
  });

  useEffect(() => {
    fetchModule();
    fetchCourse();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules?id=${moduleId}`);
      const data = await response.json();
      
      if (data.success && data.modules) {
        const moduleData = data.modules.find((m: Module) => m.id === moduleId);
        if (moduleData) {
          setModule(moduleData);
          setFormData({
            title: moduleData.title,
            videoUrl: moduleData.videoUrl || '',
            homework: moduleData.homework || '',
            isLocked: moduleData.isLocked
          });
        }
      }
    } catch (error) {
      console.error('Error fetching module:', error);
      toast.error('Failed to fetch module');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`);
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Module title is required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: moduleId,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Module updated successfully!');
        router.push(`/admin/category/${slug}/courses/${course?.slug || courseId}/modules`);
      } else {
        toast.error(data.error || 'Failed to update module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (slug: string) => {
    return slug.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!module || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Module Not Found</h2>
          <p className="text-gray-400">The module you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800/95 backdrop-blur-lg border-b border-gray-700/60 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules`)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Modules
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Edit Module
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-400">
                    Course: <span className="font-medium text-green-400">{course.title}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                    Category: <span className="font-medium text-green-400">{getCategoryName(slug)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Video className="w-6 h-6 text-gray-600" />
                Module Information
              </h2>
              <p className="text-sm text-gray-400">Update the details of your module</p>
            </div>

            <div className="space-y-6">
              {/* Module Title */}
              <div>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter module title"
                  label="Module Title *"
                  required
                  className="text-white placeholder-gray-400"
                />
              </div>

              {/* Video URL */}
              <div>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  label="Video URL"
                  icon={<Video className="w-4 h-4 text-gray-400" />}
                  className="text-white placeholder-gray-400"
                />
              </div>

              {/* Homework */}
              <div>
                <Textarea
                  value={formData.homework}
                  onChange={(e) => handleInputChange('homework', e.target.value)}
                  placeholder="Enter homework instructions or assignments..."
                  rows={6}
                  label="Homework Instructions"
                  helperText="Detailed instructions for students to complete"
                  className="text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Module Settings */}
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-6 h-6 text-gray-600" />
                Module Settings
              </h2>
              <p className="text-sm text-gray-400">Configure how this module behaves for students</p>
            </div>

            <div className="space-y-4">
              {/* Lock Status */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">Module Locked</p>
                  <p className="text-sm text-gray-400">Students must complete previous modules to access this</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('isLocked', !formData.isLocked)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isLocked ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isLocked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Module Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-blue-800">
              <Video className="w-5 h-5" />
              <span className="font-medium">Module Information</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              This module is part of <strong>{course.title}</strong> in the <strong>{getCategoryName(slug)}</strong> category.
              Changes will be reflected immediately after saving.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules`)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModulePage;
