"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  FileText,
  Lock,
  Unlock,
  ArrowLeft,
  BookOpen,
  Search,
  RefreshCw,
  Eye,
  Settings,
  GripVertical,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Module {
  id: string;
  courseId: string;
  title: string;
  videoUrl?: string;
  homework?: string;
  topics?: string[];
  description?: string;
  order: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  duration?: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
}

const ModulesPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const courseId = params.courseId as string;

  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchModules();
    fetchCourse();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules.sort((a: Module, b: Module) => a.order - b.order));
      } else {
        toast.error('Failed to fetch modules');
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to fetch modules');
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

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${moduleTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Module deleted successfully');
        fetchModules();
      } else {
        toast.error(data.error || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;
    
    const draggedModule = modules[draggedItem];
    const newModules = [...modules];
    
    // Remove from old position
    newModules.splice(draggedItem, 1);
    
    // Insert at new position
    newModules.splice(dropIndex, 0, draggedModule);
    
    // Update order
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index + 1
    }));
    
    setModules(updatedModules);
    setDraggedItem(null);
    
    // Update in backend
    updateModuleOrder(updatedModules);
  };

  const updateModuleOrder = async (updatedModules: Module[]) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          modules: updatedModules.map(module => ({
            id: module.id,
            order: module.order
          }))
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        toast.error('Failed to update module order');
        fetchModules(); // Revert to original order
      }
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Failed to update module order');
      fetchModules(); // Revert to original order
    }
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.homework && module.homework.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryName = (category: string) => {
    return category.toUpperCase();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
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
                  Manage Modules
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {course && (
                    <>
                      <span className="text-gray-600">
                        Course: <span className="font-medium text-green-600">{course.title}</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        Category: <span className="font-medium text-green-600">{getCategoryName(course.category)}</span>
                      </span>
                    </>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {modules.length} module{modules.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search modules by title or homework..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white/70 backdrop-blur-sm border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchModules}
              disabled={loading}
              className="bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredModules.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? 'No Modules Found' : 'No Modules Yet'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search to find what you\'re looking for.'
                    : 'Start by creating your first module to build your course content.'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
                    className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Module
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-move"
              >
                {/* Drag Handle */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="p-6 pl-8">
                  <div className="flex items-start gap-6">
                    {/* Module Number */}
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xl">
                      {module.order}
                    </div>
                    
                    {/* Module Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-900 truncate">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge className={module.isLocked ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}>
                            <div className="flex items-center gap-2">
                              {module.isLocked ? (
                                <>
                                  <Lock className="w-4 h-4" />
                                  Locked
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-4 h-4" />
                                  Unlocked
                                </>
                              )}
                            </div>
                          </Badge>
                          {module.title.includes('Demo') || module.title.includes('Introduction') ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Demo
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      
                      {/* Video URL */}
                      {module.videoUrl && (
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <Video className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <a 
                            href={module.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate flex-1 font-medium"
                          >
                            {module.videoUrl}
                          </a>
                        </div>
                      )}
                      
                      {/* Topics */}
                      {module.topics && module.topics.length > 0 && (
                        <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                          <div className="flex items-start gap-3">
                            <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-blue-900 mb-2">Topics ({module.topics.length})</p>
                              <div className="space-y-1">
                                {module.topics.map((topic, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                      {index + 1}
                                    </span>
                                    <span className="text-gray-700">{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Homework */}
                      {module.homework && (
                        <div className="text-sm text-gray-600 p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <p className="line-clamp-3 flex-1 whitespace-pre-wrap font-medium">{module.homework}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/${module.id}/edit`)}
                        className="bg-white/70 backdrop-blur-sm hover:bg-white border-gray-200/60 h-10 px-4"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteModule(module.id, module.title)}
                        className="bg-white/70 backdrop-blur-sm hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 border-gray-200/60 h-10 px-4"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesPage;
