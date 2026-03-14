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
  thumbnail?: string;
  mentorId?: string;
  categoryId: string;
  isActive: boolean;
  enrollmentOpen: boolean;
  showOnLanding: boolean;
}

const CreateCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    duration: '',
    thumbnail: '',
    mentorId: '',
    categoryId: slug.toUpperCase(),
    isActive: true,
    enrollmentOpen: true,
    showOnLanding: true
  });

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

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

  useEffect(() => {
    fetchMentors();
  }, [slug]);

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

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (PNG, JPG, GIF)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleSubmit = async (e: React.FormEvent, addModule?: boolean) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);

    try {
      let thumbnailUrl = '';
      
      // Upload thumbnail if selected
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          thumbnailUrl = uploadData.url;
        } else {
          toast.error('Failed to upload thumbnail');
          setSaving(false);
          return;
        }
      }

      // Create course with thumbnail
      const courseData = {
        ...formData,
        thumbnail: thumbnailUrl
      };

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Course created successfully!');
        if (addModule) {
          router.push(`/admin/category/${slug}/courses/${data.course.id}/modules/create`);
        } else {
          router.push(`/admin/category/${slug}/courses`);
        }
      } else {
        toast.error(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryName = (slug: string) => {
    return slug.toUpperCase();
  };

  const selectedMentor = mentors.find((m: any) => m.id === formData.mentorId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/category/${slug}/courses`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {getCategoryName(slug)} Courses
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-600">
                    Category: <span className="font-medium text-green-600">{getCategoryName(slug)}</span>
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Auto-assigned
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
              {saving ? 'Saving...' : 'Save Course'}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-sm text-gray-600">Provide the essential details about your course</p>
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
                
                {thumbnailPreview ? (
                  <div className="relative">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white border-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('thumbnail-input')?.click()}
                  >
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop thumbnail image'}
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
                )}
                
                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {thumbnailFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected file: <span className="font-medium">{thumbnailFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assign Mentor Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Assign Mentor</h2>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="">Select a mentor (optional)</option>
                    {mentors.map((mentor: any) => (
                      <option key={mentor.id} value={mentor.id}>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Course Settings</h2>
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

          {/* Category Info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-green-800">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Category Auto-Assigned</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              This course will be created under the <strong>{getCategoryName(slug)}</strong> category.
              No manual category selection is needed when creating from within a category context.
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
            onClick={() => router.push(`/admin/category/${slug}/courses`)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              onClick={(e) => handleSubmit(e as any)}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Course'}
            </Button>
            
            <Button
              type="submit"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save & Add Module'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;
