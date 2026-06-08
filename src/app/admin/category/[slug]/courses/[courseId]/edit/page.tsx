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
  Upload,
  Clock,
  BookOpen,
  User,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Plus,
  X,
  Check
} from 'lucide-react';

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
  mentorId?: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  bio?: string;
  expertise: string[];
  rating: number;
  totalStudents: number;
  totalRevenue: number;
  isActive: boolean;
  joinedAt: string;
  courses: Array<{
    id: string;
    title: string;
    students: number;
  }>;
}

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: string;
  thumbnail: string;
  mentorId: string;
  isActive: boolean;
  enrollmentOpen: boolean;
  showOnLanding: boolean;
}

const EditCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    duration: '',
    thumbnail: '',
    mentorId: '',
    isActive: true,
    enrollmentOpen: true,
    showOnLanding: true
  });

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
    fetchMentors();
  }, [courseId]);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        credentials: 'include'
      });

      if (!response.ok && response.status === 401) {
        console.error('Fetch course - Unauthorized');
        toast.error('Please login to access this page');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (data.success) {
        const course = data.course;
        setFormData({
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription || '',
          price: course.price,
          duration: course.duration || '',
          thumbnail: course.thumbnail || '',
          mentorId: course.mentorId || '',
          isActive: course.isActive,
          enrollmentOpen: true,
          showOnLanding: true
        });
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to fetch course');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch(`/api/admin/mentors?category=${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setMentors(data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      console.log('Edit course response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edit course error:', response.status, errorText);

        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          return;
        }

        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.error || 'Failed to update course');
        } catch {
          toast.error('Failed to update course');
        }
        return;
      }

      const data = await response.json();
      console.log('Edit course response:', data);

      if (data.success) {
        toast.success('Course updated successfully!');
        router.push(`/admin/category/${slug}/courses/${courseId}`);
      } else {
        toast.error(data.error || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (slug: string) => {
    return slug.toUpperCase();
  };

  const selectedMentor = mentors.find((m: any) => m.id === formData.mentorId);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Edit Course
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-300">
                    Category: <span className="font-medium text-green-400">{getCategoryName(slug)}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-700">
                    Editing Mode
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details Section */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-gray-400" />
              Course Details
            </h2>
            <p className="text-sm text-gray-400">Update the essential details about your course</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Course Title</label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter course title"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="course-slug"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your course"
                rows={4}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Short Description</label>
              <Textarea
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Brief description for listings"
                rows={2}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Price (BDT)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="10000"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Duration</label>
              <Input
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 3 months, 40 hours"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Mentor Selection Section */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <User className="w-6 h-6 text-gray-400" />
              Select Mentor
            </h2>
            <p className="text-sm text-gray-400">Choose a mentor for this course</p>
          </div>

          <div>
            <select
              value={formData.mentorId}
              onChange={(e) => handleInputChange('mentorId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            >
              <option value="">No mentor assigned</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id} className="bg-gray-800">
                  {mentor.name}
                </option>
              ))}
            </select>

            {selectedMentor && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedMentor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{selectedMentor.name}</p>
                  <p className="text-sm text-gray-400">{selectedMentor.email}</p>
                </div>
                <Check className="w-5 h-5 text-green-400" />
              </div>
            )}
          </div>
        </div>

        {/* Course Settings Section */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ToggleLeft className="w-6 h-6 text-gray-400" />
              Course Settings
            </h2>
            <p className="text-sm text-gray-400">Configure how your course appears and behaves</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-white">Active Course</p>
                <p className="text-sm text-gray-400">Make this course available to students</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('isActive', !formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-3 text-blue-400">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Course Information</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            This course is being updated in the <strong className="text-white">{getCategoryName(slug)}</strong> category.
            Changes will be reflected immediately after saving.
          </p>
        </div>
      </form>
    </div>

    {/* Bottom Action Bar */}
    <div className="bg-gray-800/90 backdrop-blur-lg border-t border-gray-700 p-4 mt-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 border-gray-600"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        
        <Button
          type="button"
          onClick={(e) => handleSubmit(e)}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  </div>
  );
};

export default EditCoursePage;
