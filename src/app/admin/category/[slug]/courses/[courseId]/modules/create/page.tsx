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
  Plus,
  X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface ModuleFormData {
  title: string;
  videoUrl: string;
  homework: string;
  isLocked: boolean;
}

const CreateModulePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    videoUrl: '',
    homework: '',
    isLocked: true
  });

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const fetchCourseInfo = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
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
    }
  };

  const handleInputChange = (field: keyof ModuleFormData, value: string | boolean) => {
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Module created successfully!');
        router.push(`/admin/category/${slug}/courses/${courseId}`);
      } else {
        toast.error(data.error || 'Failed to create module');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (slug: string) => {
    return slug.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Module</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-600">
                    Course: <span className="font-medium text-green-600">{course?.title || 'Loading...'}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    Category: <span className="font-medium text-blue-600">{getCategoryName(slug)}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={(e) => handleSubmit(e as any)}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Module Information</h2>
              <p className="text-sm text-gray-600">Provide the essential details about your module</p>
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
                  className="text-green-600 font-medium"
                />
              </div>

              {/* Video URL */}
              <div>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  label="Video URL"
                  icon={<Video className="w-4 h-4 text-gray-400" />}
                  helperText="Link to the video content for this module"
                />
              </div>

              {/* Homework */}
              <div>
                <Textarea
                  value={formData.homework}
                  onChange={(e) => handleInputChange('homework', e.target.value)}
                  placeholder="Enter homework instructions or assignments"
                  rows={6}
                  label="Homework Instructions"
                  helperText="Detailed instructions for homework or assignments related to this module"
                />
              </div>
            </div>
          </div>

          {/* Module Settings Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Module Settings</h2>
              <p className="text-sm text-gray-600">Configure how this module behaves</p>
            </div>

            <div className="space-y-4">
              {/* Locked Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Module Locked</p>
                  <p className="text-sm text-gray-600">Students cannot access this module when locked</p>
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
              <FileText className="w-5 h-5" />
              <span className="font-medium">Module Details</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              This module will be added to <strong>{course?.title || 'the course'}</strong> in the <strong>{getCategoryName(slug)}</strong> category.
              Modules will be automatically ordered based on their creation sequence.
            </p>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          
          <Button
            type="submit"
            onClick={(e) => handleSubmit(e as any)}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            {saving ? 'Creating...' : 'Create Module'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateModulePage;
