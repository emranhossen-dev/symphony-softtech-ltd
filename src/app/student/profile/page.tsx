"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Award, 
  TrendingUp,
  Camera,
  Edit,
  Save,
  X,
  Lock,
  Bell,
  Globe,
  Shield,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  totalCourses: number;
  completedCourses: number;
  certificates: number;
  totalPoints: number;
  currentLevel: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    timezone: string;
  };
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>({
    id: '1',
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex.thompson@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1995-06-15',
    address: '123 Main Street',
    city: 'San Francisco',
    country: 'United States',
    bio: 'Passionate learner focused on web development and data science. Always eager to expand my knowledge and skills.',
    joinDate: '2023-01-15',
    lastLogin: new Date().toISOString(),
    totalCourses: 12,
    completedCourses: 3,
    certificates: 2,
    totalPoints: 1250,
    currentLevel: 'Intermediate',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      language: 'English',
      timezone: 'PST'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Password form states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
    setSaveMessage('');
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setProfile(editedProfile);
      setIsEditing(false);
      setIsLoading(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof StudentProfile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    
    console.log('Password change requested:', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    // TODO: Implement actual password change logic
    alert('Password changed successfully!');
    
    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-500">{profile.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {profile.currentLevel}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    {profile.totalPoints} Points
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {saveMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700">{saveMessage}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Personal Information */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.lastName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {profile.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedProfile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {profile.phone}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      {isEditing ? (
                        <textarea
                          value={editedProfile.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.bio}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Location Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile.address}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{profile.country}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Change Password Section */}
                <Card className="bg-white border-0 shadow-lg rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-green-600" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Lock className="w-4 h-4" />
                        Change Password
                      </button>
                    </div>

                    {showPasswordForm && (
                      <form onSubmit={handlePasswordChange} className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter new password"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Confirm new password"
                              required
                              minLength={6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'education' && (
              <Card className="bg-white border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                    Education Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600">{profile.totalCourses}</div>
                        <div className="text-sm text-gray-600">Total Courses</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-3xl font-bold text-green-600">{profile.completedCourses}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600">{profile.certificates}</div>
                        <div className="text-sm text-gray-600">Certificates</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
                      <div className="space-y-3">
                        {['Web Development Basics', 'Advanced React Development', 'Data Science Fundamentals'].map((course, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{course}</h4>
                                <p className="text-sm text-gray-500">Progress: {index === 0 ? 75 : index === 1 ? 45 : 20}%</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Continue
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'achievements' && (
              <Card className="bg-white border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-green-600" />
                    Achievements & Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2">Current Level: {profile.currentLevel}</h3>
                          <p className="text-yellow-100 mb-4">You're doing great! Keep learning to reach the next level.</p>
                          <div className="flex items-center space-x-6">
                            <div>
                              <p className="text-yellow-100 text-sm">Total Points</p>
                              <p className="text-2xl font-bold">{profile.totalPoints}</p>
                            </div>
                            <div>
                              <p className="text-yellow-100 text-sm">Next Level</p>
                              <p className="text-2xl font-bold">Advanced</p>
                            </div>
                          </div>
                        </div>
                        <TrendingUp className="w-16 h-16 text-white opacity-50" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Certificates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Web Development Basics', 'JavaScript Fundamentals'].map((cert, index) => (
                          <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                  <Award className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{cert}</h4>
                                  <p className="text-sm text-gray-500">Completed on {new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card className="bg-white border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                    Settings & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-gray-600" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-3 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive updates about your courses</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editedProfile.preferences.emailNotifications}
                          onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center">
                          <Bell className="w-4 h-4 mr-3 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Push Notifications</p>
                            <p className="text-sm text-gray-500">Get instant updates on your device</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editedProfile.preferences.pushNotifications}
                          onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-gray-600" />
                      Regional Settings
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <select
                          value={editedProfile.preferences.language}
                          onChange={(e) => handlePreferenceChange('language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select
                          value={editedProfile.preferences.timezone}
                          onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option>PST</option>
                          <option>EST</option>
                          <option>CST</option>
                          <option>MST</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profile.lastLogin).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round((profile.completedCourses / profile.totalCourses) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download All Certificates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Export Profile Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
