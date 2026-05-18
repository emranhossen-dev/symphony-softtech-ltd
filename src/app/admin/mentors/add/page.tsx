"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Save,
  Users,
  Mail,
  Phone,
  Lock,
  Award,
  Plus,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface MentorFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  category?: string;
  image?: string;
}

const AddMentorPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MentorFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    category: 'government', // Default category
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newExpertise, setNewExpertise] = useState('');

  const handleInputChange = (field: keyof MentorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        handleInputChange('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    handleInputChange('image', '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('First name, last name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mentor created successfully!');
        router.push('/admin/mentors');
      } else {
        toast.error(data.error || 'Failed to create mentor');
      }
    } catch (error) {
      console.error('Error creating mentor:', error);
      toast.error('Failed to create mentor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/mentors')}
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Mentors
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-white">Add New Mentor</h1>
              <p className="text-gray-300">Create a new mentor account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Mentor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    label="First Name *"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    label="Last Name *"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    label="Email Address *"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    label="Password *"
                    required
                    helperText="Minimum 6 characters"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    label="Phone Number"
                  />
                </div>

                {/* Profile Image */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image (Optional)
                  </label>
                  <div className="flex items-center gap-6">
                    {/* Image Preview */}
                    <div className="relative">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="mentor-image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="mentor-image"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Choose Image</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  >
                    <option value="government">Government</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="recorded">Recorded</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/mentors')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Creating...' : 'Create Mentor'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddMentorPage;
