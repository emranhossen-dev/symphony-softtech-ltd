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
      // Get token from cookie first, then localStorage
      const cookieToken = document.cookie
        .split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];
      
      const localStorageToken = localStorage.getItem('auth-token');
      const token = cookieToken || localStorageToken;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: headers
      });
      
      if (!response.ok && response.status === 401) {
        console.error('Fetch course - Unauthorized');
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

    // Get token from cookie first, then localStorage
    const cookieToken = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];
    
    const localStorageToken = localStorage.getItem('auth-token');
    const token = cookieToken || localStorageToken;
    
    console.log('Edit course - Token being sent:', !!token, token?.substring(0, 20) + '...');
    
    if (!token) {
      toast.error('Please login to update course');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      console.log('Edit course response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edit course error:', response.status, errorText);
        
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          // Clear invalid token
          localStorage.removeItem('auth-token');
          document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
                className="flex items-center gap-2 bg-white/50 hover:bg-white border-gray-200/60"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Edit Course
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-600">
                    Category: <span className="font-medium text-green-600">{getCategoryName(slug)}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Editing Mode
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={(e) => handleSubmit(e as any)}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-gray-600" />
                Basic Information
              </h2>
              <p className="text-sm text-gray-600">Update the essential details about your course</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Title */}
              <div className="lg:col-span-2">
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter course title"
                  label="Course Title *"
                  required
                />
                {formData.title && (
                  <div className="mt-2 text-xs text-gray-500">
                    Auto-generated slug: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{formData.slug}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  label="Price (BDT)"
                  min="0"
                  step="0.01"
                  showBDTIcon={true}
                />
              </div>

              {/* Duration */}
              <div>
                <Input
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 3 months, 40 hours"
                  label="Duration"
                  icon={<Clock className="w-4 h-4 text-gray-400" />}
                />
              </div>

              {/* Short Description */}
              <div className="lg:col-span-2">
                <Textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief course description (optional)"
                  rows={3}
                  label="Short Description"
                  helperText="A brief summary that will appear in course listings"
                />
              </div>

              {/* Full Description */}
              <div className="lg:col-span-2">
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed course description"
                  rows={6}
                  label="Full Description *"
                  required
                  helperText="Comprehensive description of what students will learn"
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload thumbnail image
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Assign Mentor Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-6 h-6 text-gray-600" />
                Assign Mentor
              </h2>
              <p className="text-sm text-gray-600">Select a mentor to guide this course</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Mentor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.mentorId}
                    onChange={(e) => handleInputChange('mentorId', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white placeholder-gray-400 text-gray-900"
                  >
                    <option value="" className="text-gray-500">Select a mentor (optional)</option>
                    {mentors.map((mentor: any) => (
                      <option key={mentor.id} value={mentor.id} className="text-gray-900">
                        {mentor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can assign a mentor later if needed
                </p>
              </div>

              {selectedMentor && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMentor.name}</p>
                      <p className="text-sm text-gray-600">{selectedMentor.email}</p>
                    </div>
                    <Check className="w-5 h-5 text-green-600 ml-auto" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Settings Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ToggleLeft className="w-6 h-6 text-gray-600" />
                Course Settings
              </h2>
              <p className="text-sm text-gray-600">Configure how your course appears and behaves</p>
            </div>

            <div className="space-y-4">
              {/* Active Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Active Course</p>
                  <p className="text-sm text-gray-600">Make this course available to students</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('isActive', !formData.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Enrollment Open Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Enrollment Open</p>
                  <p className="text-sm text-gray-600">Allow students to enroll in this course</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('enrollmentOpen', !formData.enrollmentOpen)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enrollmentOpen ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enrollmentOpen ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show on Landing Toggle */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Show on Landing Page</p>
                  <p className="text-sm text-gray-600">Display this course on the public landing page</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('showOnLanding', !formData.showOnLanding)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.showOnLanding ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.showOnLanding ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-blue-800">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Course Information</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              This course is being updated in the <strong>{getCategoryName(slug)}</strong> category.
              Changes will be reflected immediately after saving.
            </p>
          </div>
        </form>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}`)}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          
          <Button
            type="submit"
            onClick={(e) => handleSubmit(e as any)}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      <div className="h-6"></div> {/* Bottom spacing */}
    </div>
  );
};

export default EditCoursePage;
