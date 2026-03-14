"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { 
  Video, 
  Upload, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  FileText,
  Settings,
  Download,
  Share2,
  BarChart3,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

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

interface VideoStats {
  totalViews: number;
  averageWatchTime: number;
  completionRate: number;
  engagement: number;
}

export default function VideoManagementPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, isAuthenticated } = useAuth();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModule, setNewModule] = useState({
    title: '',
    videoUrl: '',
    homework: '',
    order: 1,
    isLocked: true
  });
  const [videoStats, setVideoStats] = useState<Record<string, VideoStats>>({});
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'lock' | 'unlock' | 'delete' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Check if user has admin/employee role
  const hasAdminAccess = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'EMPLOYEE');

  const getToken = () => {
    const cookieToken = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];
    
    const localStorageToken = localStorage.getItem('auth-token');
    
    const token = cookieToken || localStorageToken;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Token sources:');
      console.log('- Cookie (auth-token):', !!cookieToken);
      console.log('- LocalStorage:', !!localStorageToken);
      console.log('- Selected token:', !!token);
      console.log('- Token length:', token?.length || 0);
    }
    
    return token;
  };

  const getAuthHeaders = () => {
    const token = getToken();
    console.log('🔍 getAuthHeaders - Token sources:');
    console.log('  - Cookie (auth-token):', !!document.cookie.split(';').find(c => c.trim().startsWith('auth-token=')));
    console.log('  - LocalStorage:', !!localStorage.getItem('auth-token'));
    console.log('  - Selected token length:', token?.length || 0);
    console.log('  - Token preview:', token?.substring(0, 20) + '...');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.error('❌ No token found for auth headers');
    }
    
    return headers;
  };

  // Validate token format
  const validateTokenFormat = (token: string): boolean => {
    if (!token || typeof token !== 'string') return false;
    if (token.length < 20) return false; // JWT tokens are typically longer
    const parts = token.split('.');
    return parts.length === 3; // JWT has 3 parts: header.payload.signature
  };

  // Helper function to convert YouTube URL to embed format
  const convertToYouTubeEmbed = (url: string): string => {
    if (!url) return '';
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    
    return url; // Return original URL if not YouTube
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access this page');
      // Optional: redirect to login
      return;
    }

    if (!hasAdminAccess) {
      toast.error('You do not have permission to access this page');
      // Optional: redirect to dashboard
      return;
    }

    // Validate token when component mounts
    const token = getToken();
    if (!token || token.length < 10) {
      console.warn('No valid token found');
      toast.error('Please login to continue');
      // Clear any invalid tokens
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      return;
    }

    console.log('Token validated successfully');
  }, [isAuthenticated, hasAdminAccess]);

  useEffect(() => {
    fetchModules();
    fetchVideoStats();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        // Process modules with video URLs
        const modulesWithDemo = data.modules.map((module: Module) => {
          let videoUrl = module.videoUrl;
          
          // If it's a YouTube URL, convert to embed format
          if (videoUrl && videoUrl.includes('youtube.com')) {
            videoUrl = convertToYouTubeEmbed(videoUrl);
          }
          
          // If no video URL, use a working demo video
          if (!videoUrl) {
            videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          }
          
          return {
            ...module,
            videoUrl
          };
        });
        setModules(modulesWithDemo.sort((a: Module, b: Module) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoStats = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/video-stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setVideoStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching video stats:', error);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.title) {
      toast.error('Please enter a module title');
      return;
    }

    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      toast.error('Please login to add modules');
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newModule),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Please login as admin to add modules');
        } else if (response.status === 403) {
          toast.error('You do not have permission to add modules');
        } else {
          toast.error(errorData.error || 'Failed to add module');
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Module added successfully');
        setNewModule({ title: '', videoUrl: '', homework: '', order: 1, isLocked: true });
        setShowAddModule(false);
        fetchModules();
      } else {
        toast.error(data.message || 'Failed to add module');
      }
    } catch (error) {
      console.error('Error adding module:', error);
      toast.error('Failed to add module');
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;

    console.log('Starting module update...');
    
    // Get token from multiple sources
    const cookieToken = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];
    
    const localStorageToken = localStorage.getItem('auth-token');
    const token = cookieToken || localStorageToken;
    
    console.log('Token being sent:', !!token, token?.substring(0, 20) + '...');
    console.log('Token sources - Cookie:', !!cookieToken, 'LocalStorage:', !!localStorageToken);
    
    if (!token) {
      console.error('No token found in cookie or localStorage');
      toast.error('Please login to update modules');
      return;
    }

    // Validate token format
    if (!validateTokenFormat(token)) {
      console.error('Invalid token format:', token.substring(0, 20) + '...');
      toast.error('Invalid session. Please login again.');
      // Clear invalid token
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('Making request with headers:', headers);
      
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(editingModule),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update module error:', response.status, errorText);
        
        // Handle specific auth errors
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('auth-token');
          document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          toast.error('Session expired. Please login again.');
          return;
        } else if (response.status === 403) {
          toast.error('You do not have permission to update modules');
          return;
        }
        
        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.error || 'Failed to update module');
        } catch {
          toast.error('Failed to update module');
        }
        return;
      }

      const data = await response.json();
      console.log('Update response:', data);
      
      if (data.success) {
        toast.success('Module updated successfully');
        setEditingModule(null);
        fetchModules();
      } else {
        toast.error(data.message || 'Failed to update module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      toast.error('Please login to delete modules');
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules?id=${moduleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Please login as admin to delete modules');
        } else if (response.status === 403) {
          toast.error('You do not have permission to delete modules');
        } else {
          toast.error(errorData.error || 'Failed to delete module');
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Module deleted successfully');
        fetchModules();
      } else {
        toast.error(data.message || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleBulkAction = async () => {
    if (selectedModules.size === 0) {
      toast.error('Please select modules first');
      return;
    }

    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      toast.error('Please login to perform bulk actions');
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: bulkAction,
          moduleIds: Array.from(selectedModules)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Please login as admin to perform bulk actions');
        } else if (response.status === 403) {
          toast.error('You do not have permission to perform bulk actions');
        } else {
          toast.error(errorData.error || `Failed to ${bulkAction} modules`);
        }
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Modules ${bulkAction}ed successfully`);
        setSelectedModules(new Set());
        setBulkAction(null);
        fetchModules();
      } else {
        toast.error(data.message || `Failed to ${bulkAction} modules`);
      }
    } catch (error) {
      console.error(`Error ${bulkAction}ing modules:`, error);
      toast.error(`Failed to ${bulkAction} modules`);
    }
  };

  const handleVideoUpload = async (file: File, moduleId: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('video', file);
    formData.append('moduleId', moduleId);

    try {
      const xhr = new XMLHttpRequest();
      
      // Add authorization header
      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            toast.success('Video uploaded successfully');
            fetchModules();
          } else {
            toast.error(data.message || 'Failed to upload video');
          }
        } else {
          toast.error('Failed to upload video');
        }
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        toast.error('Failed to upload video');
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', `/api/admin/courses/${courseId}/modules/${moduleId}/upload-video`);
      xhr.send(formData);

    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleModuleSelection = (moduleId: string) => {
    const newSelection = new Set(selectedModules);
    if (newSelection.has(moduleId)) {
      newSelection.delete(moduleId);
    } else {
      newSelection.add(moduleId);
    }
    setSelectedModules(newSelection);
  };

  const selectAllModules = () => {
    if (selectedModules.size === modules.length) {
      setSelectedModules(new Set());
    } else {
      setSelectedModules(new Set(modules.map(m => m.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            {!isAuthenticated 
              ? 'Please login to access this page' 
              : 'You do not have permission to access this page. Admin access required.'
            }
          </p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl"
          >
            {!isAuthenticated ? 'Login' : 'Go to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }


return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Beautiful background pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-100 via-transparent to-green-100"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>
      
      {/* Enhanced Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Video Management
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Manage course videos and modules efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchVideoStats}
                className="flex items-center gap-2 bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Stats
              </Button>
              <Button
                onClick={() => setShowAddModule(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Module
              </Button>
            </div>
          </div>
        </div>
      </div>

    <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Floating decoration elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-300 to-green-300 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-20 blur-2xl"></div>
        
        {/* Enhanced Bulk Actions */}
        {selectedModules.size > 0 && (
          <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-blue-900">
                    {selectedModules.size} module{selectedModules.size > 1 ? 's' : ''} selected
                  </span>
                  <p className="text-sm text-blue-700">Choose an action to perform</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setBulkAction('lock')}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Lock className="w-4 h-4" />
                  Lock
                </Button>
                <Button
                  onClick={() => setBulkAction('unlock')}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock
                </Button>
                <Button
                  onClick={() => setBulkAction('delete')}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

      {/* Enhanced Modules List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedModules.size === modules.length}
              onChange={selectAllModules}
              className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="font-medium text-gray-700">Select All ({modules.length} modules)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        </div>

        {modules.map((module) => (
          <Card key={module.id} className="shadow-lg border-gray-100 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedModules.has(module.id)}
                  onChange={() => toggleModuleSelection(module.id)}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                        {module.order}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {editingModule?.id === module.id ? (
                            <input
                              type="text"
                              value={editingModule.title}
                              onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                              className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          ) : (
                            module.title
                          )}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={module.isLocked ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>
                            {module.isLocked ? (
                              <><Lock className="w-3 h-3 mr-1" />Locked</>
                            ) : (
                              <><Unlock className="w-3 h-3 mr-1" />Unlocked</>
                            )}
                          </Badge>
                          {module.videoUrl && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              <Video className="w-3 h-3 mr-1" />
                              Video Added
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingModule?.id === module.id ? (
                        <>
                          <Button
                            onClick={handleUpdateModule}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => setEditingModule(null)}
                            size="sm"
                            className="bg-gray-500 hover:bg-gray-600 text-white shadow-sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => setEditingModule(module)}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {/* Handle delete */}}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Video</span>
                        </div>
                        {module.videoUrl && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Uploaded
                          </Badge>
                        )}
                      </div>
                      
                      {module.videoUrl ? (
                        <div className="space-y-3">
                          {/* Debug info - remove in production */}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
                              <p><strong>Debug:</strong> Video URL: {module.videoUrl}</p>
                              <p><strong>Type:</strong> {module.videoUrl.includes('youtube.com/embed') ? 'YouTube Embed' : 'Direct Video'}</p>
                            </div>
                          )}
                          
                          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                            {module.videoUrl.includes('youtube.com/embed') ? (
                              // YouTube Embed
                              <iframe
                                key={module.videoUrl}
                                src={module.videoUrl}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onError={(e) => {
                                  console.error('YouTube embed error:', e);
                                  console.error('YouTube URL:', module.videoUrl);
                                }}
                                onLoad={() => {
                                  console.log('YouTube embed loaded successfully:', module.videoUrl);
                                }}
                              />
                            ) : (
                              // Regular Video
                              <video
                                key={module.videoUrl} // Force re-render when URL changes
                                src={module.videoUrl}
                                className="w-full h-full"
                                controls
                                preload="metadata"
                                onError={(e) => {
                                  console.error('Video error:', e);
                                  console.error('Video URL:', module.videoUrl);
                                  const videoElement = e.target as HTMLVideoElement;
                                  videoElement.style.display = 'none';
                                  const errorDiv = videoElement.parentElement?.querySelector('.video-error') as HTMLElement;
                                  if (errorDiv) {
                                    errorDiv.style.display = 'flex';
                                  }
                                }}
                                onLoadStart={() => {
                                  console.log('Video load started:', module.videoUrl);
                                  const videoElement = document.querySelector(`video[src="${module.videoUrl}"]`) as HTMLVideoElement;
                                  if (videoElement) {
                                    const errorDiv = videoElement.parentElement?.querySelector('.video-error') as HTMLElement;
                                    if (errorDiv) {
                                      errorDiv.style.display = 'none';
                                    }
                                  }
                                }}
                                onLoadedData={() => {
                                  console.log('Video loaded successfully:', module.videoUrl);
                                }}
                              />
                            )}
                            
                            <div className="video-error hidden absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                              <div className="text-center">
                                <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm">Video failed to load</p>
                                <p className="text-xs text-gray-400 mt-2">{module.videoUrl}</p>
                                <div className="flex gap-2 mt-4 justify-center">
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => {
                                      window.open(module.videoUrl, '_blank');
                                    }}
                                  >
                                    Open in New Tab
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => {
                                      // Try to load a working demo video
                                      const demoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                                      window.open(demoUrl, '_blank');
                                    }}
                                  >
                                    Try Demo Video
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {videoStats[module.id]?.totalViews || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {videoStats[module.id]?.averageWatchTime || 0}m avg
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                                onClick={() => {
                                  // Test video in new tab
                                  window.open(module.videoUrl, '_blank');
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No video uploaded</p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(file, module.id);
                            }}
                            className="hidden"
                            id={`video-upload-${module.id}`}
                          />
                          <Button
                            onClick={() => document.getElementById(`video-upload-${module.id}`)?.click()}
                            disabled={isUploading}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {isUploading ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Uploading... {Math.round(uploadProgress)}%
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Video
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Homework Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Homework</span>
                        </div>
                        {module.homework && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            Assigned
                          </Badge>
                        )}
                      </div>
                      
                      {module.homework ? (
                        <div className="space-y-3">
                          <p className="text-gray-700 text-sm">{module.homework}</p>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>📝 12 submissions</span>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No homework assigned</p>
                          <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Homework
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  {videoStats[module.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{videoStats[module.id].totalViews}</div>
                          <div className="text-gray-600">Total Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{videoStats[module.id].averageWatchTime}m</div>
                          <div className="text-gray-600">Avg Watch Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{videoStats[module.id].completionRate}%</div>
                          <div className="text-gray-600">Completion Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{videoStats[module.id].engagement}%</div>
                          <div className="text-gray-600">Engagement</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add New Module</h3>
                <Button
                  onClick={() => setShowAddModule(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter module title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={newModule.videoUrl}
                    onChange={(e) => setNewModule({...newModule, videoUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter video URL (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Homework</label>
                  <textarea
                    value={newModule.homework}
                    onChange={(e) => setNewModule({...newModule, homework: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter homework instructions (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <input
                      type="number"
                      value={newModule.order}
                      onChange={(e) => setNewModule({...newModule, order: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={newModule.isLocked ? 'locked' : 'unlocked'}
                      onChange={(e) => setNewModule({...newModule, isLocked: e.target.value === 'locked'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="locked">Locked</option>
                      <option value="unlocked">Unlocked</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  onClick={() => setShowAddModule(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddModule}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white rounded-xl"
                >
                  Add Module
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
