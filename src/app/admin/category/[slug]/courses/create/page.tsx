"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Upload,
  Clock,
  Save,
  X
} from 'lucide-react';

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  regularPrice: number;
  offerPrice: number;
  duration: string;
  thumbnail?: string;
  categoryId: string;
}

const CreateCoursePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    regularPrice: 0,
    offerPrice: 0,
    duration: '',
    thumbnail: '',
    categoryId: slug.toUpperCase()
  });

  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (PNG, JPG, GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setThumbnailFile(file);
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);

    try {
      let thumbnailUrl = '';
      
      if (thumbnailFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', thumbnailFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
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

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : { success: false, error: 'Empty server response' };

      if (data.success) {
        toast.success('Course created successfully!');
        router.push(`/admin/category/${slug}/courses/${data.course.slug || data.course.id}`);
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

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push(`/admin/category/${slug}/courses`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
          
          <h1 className="text-3xl font-bold text-white">Create New Course</h1>
          <p className="text-gray-400 mt-1">
            Category: <span className="font-semibold text-blue-400">{slug.toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 space-y-6">
          
          {/* Course Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title"
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all"
              required
            />
            {formData.title && (
              <div className="mt-2 text-sm text-gray-400">
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">{formData.slug}</span>
              </div>
            )}
          </div>

          {/* Price Section */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Pricing
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Regular Price */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Regular Price (BDT)
                </label>
                <input
                  type="number"
                  value={formData.regularPrice}
                  onChange={(e) => handleInputChange('regularPrice', parseFloat(e.target.value) || 0)}
                  placeholder="13000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all"
                />
              </div>

              {/* Offer Price */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Offer Price (BDT)
                </label>
                <input
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => handleInputChange('offerPrice', parseFloat(e.target.value) || 0)}
                  placeholder="10000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white transition-all"
                />
              </div>
            </div>

            {/* Price Preview */}
            {(formData.regularPrice > 0 || formData.offerPrice > 0) && (
              <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 rounded-xl p-4 border border-blue-800">
                <p className="text-xs font-medium text-gray-400 mb-2">Price Preview:</p>
                <div className="flex items-center gap-3">
                  {formData.regularPrice > 0 && formData.offerPrice > 0 && formData.regularPrice > formData.offerPrice ? (
                    <>
                      <span className="text-xl font-bold text-gray-400 line-through">
                        ৳{formData.regularPrice.toLocaleString()}
                      </span>
                      <span className="text-2xl font-bold text-green-400">
                        ৳{formData.offerPrice.toLocaleString()}
                      </span>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round(((formData.regularPrice - formData.offerPrice) / formData.regularPrice) * 100)}% OFF
                      </span>
                    </>
                  ) : formData.offerPrice > 0 ? (
                    <span className="text-2xl font-bold text-green-400">
                      ৳{formData.offerPrice.toLocaleString()}
                    </span>
                  ) : formData.regularPrice > 0 ? (
                    <span className="text-2xl font-bold text-white">
                      ৳{formData.regularPrice.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">Enter price to see preview</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Duration
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 3 months, 40 hours"
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what students will learn in this course"
              rows={6}
              className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all resize-none"
              required
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Course Thumbnail
            </label>
            
            {thumbnailPreview ? (
              <div className="relative">
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail preview" 
                  className="w-full h-64 object-cover rounded-xl border border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('thumbnail-input')?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">
                  {isDragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
            
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.push(`/admin/category/${slug}/courses`)}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
