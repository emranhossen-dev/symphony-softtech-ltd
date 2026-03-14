"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  FileText,
  Lock,
  Unlock,
  RefreshCw,
  BookOpen,
  Users,
  Filter,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  ArrowRight
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
  course?: {
    id: string;
    title: string;
    category: string;
  };
}

interface Course {
  id: string;
  title: string;
  category: string;
}

export default function ModulesManagement() {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    homework: '',
    courseId: '',
    isLocked: true
  });

  const stats = {
    totalModules: modules.length,
    totalCourses: courses.length,
    lockedModules: modules.filter(m => m.isLocked).length,
    unlockedModules: modules.filter(m => !m.isLocked).length
  };

  useEffect(() => {
    fetchModules();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterModules();
  }, [modules, searchTerm, selectedCourse]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/modules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setModules(data.modules);
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

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filterModules = () => {
    let filtered = modules;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(module => module.courseId === selectedCourse);
    }

    setFilteredModules(filtered);
  };

  const toggleModuleLock = async (moduleId: string, isLocked: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [moduleId]: true }));
      
      const response = await fetch('/api/admin/modules/lock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          moduleId,
          isLocked
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Module ${!isLocked ? 'locked' : 'unlocked'} successfully`);
        fetchModules();
      } else {
        toast.error(data.error || 'Failed to update module status');
      }
    } catch (error) {
      console.error('Error updating module status:', error);
      toast.error('Failed to update module status');
    } finally {
      setActionLoading(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [moduleId]: true }));
      
      const response = await fetch('/api/admin/modules', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          moduleId
        }),
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
    
    if (!formData.title || !formData.courseId) {
      toast.error('Title and Course are required');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, submit: true }));
      
      const url = showEditModal ? '/api/admin/modules' : '/api/admin/modules';
      const method = showEditModal ? 'PUT' : 'POST';
      const payload = showEditModal 
        ? { ...formData, id: selectedModule?.id }
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
      console.error(`Error ${showEditModal ? 'updating' : 'creating'} module:`, error);
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
      courseId: '',
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
      courseId: module.courseId,
      isLocked: module.isLocked
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (module: Module) => {
    setSelectedModule(module);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modules Management</h1>
          <p className="text-gray-600 mt-1">Manage all course modules and content</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900 stat-number">{stats.totalModules}</p>
              </div>
              <div className="icon-wrapper bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 stat-number">{stats.totalCourses}</p>
              </div>
              <div className="icon-wrapper bg-green-100">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locked</p>
                <p className="text-2xl font-bold text-gray-900 stat-number">{stats.lockedModules}</p>
              </div>
              <div className="icon-wrapper bg-red-100">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unlocked</p>
                <p className="text-2xl font-bold text-gray-900 stat-number">{stats.unlockedModules}</p>
              </div>
              <div className="icon-wrapper bg-green-100">
                <Unlock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue>
                    Select Course
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              All Modules ({filteredModules.length})
            </div>
            <Button 
              variant="outline" 
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={fetchModules}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium">{module.title}</p>
                        {module.videoUrl && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Video className="w-3 h-3 mr-1" />
                            Has video
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      {module.course?.title || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={module.isLocked ? "destructive" : "default"}
                      className={module.isLocked ? "badge-danger" : "badge-success"}
                    >
                      {module.isLocked ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 mr-1" />
                          Unlocked
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">#{module.order}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleModuleLock(module.id, !module.isLocked)}
                        disabled={actionLoading[module.id]}
                        className={module.isLocked ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"}
                      >
                        {module.isLocked ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(module)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(module)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {showEditModal ? 'Edit Module' : 'Add New Module'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger>
                      <SelectValue>
                        Select Course
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter module title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video URL (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homework
                  </label>
                  <textarea
                    value={formData.homework}
                    onChange={(e) => setFormData(prev => ({ ...prev, homework: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter homework details (optional)"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isLocked"
                    checked={formData.isLocked}
                    onChange={(e) => setFormData(prev => ({ ...prev, isLocked: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isLocked" className="text-sm font-medium text-gray-700">
                    Lock module by default
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
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
                    disabled={actionLoading.submit}
                    className="btn-primary"
                  >
                    {actionLoading.submit ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {showEditModal ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {showEditModal ? 'Update' : 'Create'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Delete Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the module "<strong>{selectedModule.title}</strong>"? This action cannot be undone.
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
                  variant="destructive"
                  onClick={() => deleteModule(selectedModule.id)}
                  disabled={actionLoading[selectedModule.id]}
                  className="btn-danger"
                >
                  {actionLoading[selectedModule.id] ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
