"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  FileText,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowLeft,
  GripVertical,
  Save,
  X
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
}

export default function ModuleManagement() {
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    homework: '',
    isLocked: true
  });

  useEffect(() => {
    if (courseId) {
      fetchModules();
    }
  }, [courseId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules);
        setCourse(data.course);
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

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const toggleModuleLock = async (moduleId: string, isLocked: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [moduleId]: true }));
      
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: moduleId,
          isLocked: !isLocked
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Module ${!isLocked ? 'locked' : 'unlocked'} successfully`);
        fetchModules();
      } else {
        toast.error(data.error || 'Failed to update module status');
      }
    } catch (error) {
      console.error('Error toggling module lock:', error);
      toast.error('Failed to update module status');
    } finally {
      setActionLoading(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [moduleId]: true }));
      
      const response = await fetch(`/api/admin/courses/${courseId}/modules?id=${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Module deleted successfully');
        setShowDeleteModal(false);
        setSelectedModule(null);
        fetchModules();
      } else {
        toast.error(data.error || 'Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    } finally {
      setActionLoading(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setActionLoading(prev => ({ ...prev, submit: true }));
      
      const url = showEditModal ? '/api/admin/courses/${courseId}/modules' : '/api/admin/courses/${courseId}/modules';
      const method = showEditModal ? 'PUT' : 'POST';
      
      const payload = showEditModal 
        ? { ...formData, id: selectedModule?.id, order: selectedModule?.order }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Module ${showEditModal ? 'updated' : 'created'} successfully`);
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchModules();
      } else {
        toast.error(data.error || `Failed to ${showEditModal ? 'update' : 'create'} module`);
      }
    } catch (error) {
      console.error('Error submitting module:', error);
      toast.error(`Failed to ${showEditModal ? 'update' : 'create'} module`);
    } finally {
      setActionLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      videoUrl: '',
      homework: '',
      isLocked: true
    });
    setSelectedModule(null);
  };

  const openEditModal = (module: Module) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      videoUrl: module.videoUrl || '',
      homework: module.homework || '',
      isLocked: module.isLocked
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (module: Module) => {
    setSelectedModule(module);
    setShowDeleteModal(true);
  };

  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === modules.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const moduleToMove = modules[currentIndex];
    const targetModule = modules[newIndex];

    try {
      setActionLoading(prev => ({ ...prev, [moduleId]: true }));
      
      // Update both modules with swapped orders
      await Promise.all([
        fetch(`/api/admin/courses/${courseId}/modules`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            id: moduleToMove.id,
            order: targetModule.order
          })
        }),
        fetch(`/api/admin/courses/${courseId}/modules`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            id: targetModule.id,
            order: moduleToMove.order
          })
        })
      ]);

      toast.success('Module order updated successfully');
      fetchModules();
    } catch (error) {
      console.error('Error moving module:', error);
      toast.error('Failed to update module order');
    } finally {
      setActionLoading(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="mr-4 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Module Management</h1>
                {course && (
                  <p className="text-sm text-gray-300 mt-1">Course: {course.title}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={fetchModules}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : modules.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="p-12 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first module.</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <Card key={module.id} className="card-premium overflow-hidden">
                <CardContent className="p-0">
                  {/* Module Header */}
                  <div 
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleModuleExpanded(module.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Drag Handle */}
                      <div className="flex flex-col space-y-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                      
                      {/* Order Number */}
                      <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-semibold text-sm">
                        {module.order}
                      </div>
                      
                      {/* Title and Status */}
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <Badge className={module.isLocked ? 'badge-danger' : 'badge-primary'}>
                          {module.isLocked ? (
                            <div className="flex items-center">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Unlock className="w-3 h-3 mr-1" />
                              Unlocked
                            </div>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Order Controls */}
                      <div className="flex flex-col">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveModule(module.id, 'up');
                          }}
                          disabled={index === 0 || actionLoading[module.id]}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveModule(module.id, 'down');
                          }}
                          disabled={index === modules.length - 1 || actionLoading[module.id]}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Expand/Collapse */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedModules.has(module.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Module Details (Expandable) */}
                  {expandedModules.has(module.id) && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video URL */}
                        {module.videoUrl && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                            <div className="flex items-center space-x-2">
                              <Video className="w-4 h-4 text-gray-400" />
                              <a 
                                href={module.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm truncate"
                              >
                                {module.videoUrl}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* Homework */}
                        {module.homework && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Homework</label>
                            <div className="flex items-start space-x-2">
                              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                              <p className="text-sm text-gray-600 line-clamp-3">{module.homework}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(module)}
                          className="btn-secondary-outline"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleModuleLock(module.id, module.isLocked)}
                          disabled={actionLoading[module.id]}
                          className={module.isLocked 
                            ? 'border-green-200 text-green-700 hover:bg-green-50' 
                            : 'border-red-200 text-red-700 hover:bg-red-50'
                          }
                        >
                          {actionLoading[module.id] ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : module.isLocked ? (
                            <Unlock className="w-3 h-3 mr-1" />
                          ) : (
                            <Lock className="w-3 h-3 mr-1" />
                          )}
                          {module.isLocked ? 'Unlock' : 'Lock'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteModal(module)}
                          className="badge-danger"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {showEditModal ? 'Edit Module' : 'Add New Module'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Module Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Homework</label>
                <textarea
                  value={formData.homework}
                  onChange={(e) => setFormData(prev => ({ ...prev, homework: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="Enter homework instructions"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isLocked"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData(prev => ({ ...prev, isLocked: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isLocked" className="ml-2 text-sm text-gray-700">
                  Module is locked (students cannot access)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading.submit}
                >
                  {actionLoading.submit ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {showEditModal ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {showEditModal ? 'Update Module' : 'Create Module'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="card-premium max-w-md w-full">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Delete Module</CardTitle>
            </CardHeader>

            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Are you sure?
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                This will permanently delete module "{selectedModule.title}". This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedModule(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteModule(selectedModule.id)}
                  className="badge-danger"
                  disabled={actionLoading[selectedModule.id]}
                >
                  {actionLoading[selectedModule.id] ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Module
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
