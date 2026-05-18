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
  ArrowRight,
  Upload,
  Download
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
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadCourseId, setBulkUploadCourseId] = useState('');
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);

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

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkUploadCourseId) {
      toast.error('Please select a course');
      return;
    }
    
    if (!bulkUploadFile) {
      toast.error('Please select a JSON file');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, bulkUpload: true }));
      
      // Read file content
      const fileContent = await bulkUploadFile.text();
      const data = JSON.parse(fileContent);
      
      if (!data.modules || !Array.isArray(data.modules)) {
        toast.error('Invalid file format. Expected modules array.');
        return;
      }

      const response = await fetch('/api/admin/modules/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: bulkUploadCourseId,
          modules: data.modules
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully uploaded ${result.modules.length} modules`);
        setShowBulkUploadModal(false);
        setBulkUploadCourseId('');
        setBulkUploadFile(null);
        fetchModules();
      } else {
        toast.error(result.error || 'Failed to upload modules');
      }
    } catch (error) {
      console.error('Error uploading modules:', error);
      toast.error('Failed to upload modules');
    } finally {
      setActionLoading(prev => ({ ...prev, bulkUpload: false }));
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = {
      courseTitle: "Sample Course",
      modules: [
        {
          title: "Module 1: Introduction",
          videoUrl: "https://example.com/video1.mp4",
          homework: "Complete the introduction assignment",
          description: "Learn the basics",
          topics: ["Topic 1", "Topic 2"],
          isLocked: false,
          order: 1
        },
        {
          title: "Module 2: Advanced Concepts",
          videoUrl: "https://example.com/video2.mp4",
          homework: "Complete the advanced assignment",
          description: "Deep dive into concepts",
          topics: ["Topic 3", "Topic 4"],
          isLocked: true,
          order: 2
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'module_template.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Sample template downloaded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Modules Management</h1>
          <p className="text-gray-400 mt-1">Manage all course modules and content</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={downloadSampleTemplate}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowBulkUploadModal(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Modules</p>
                <p className="text-2xl font-bold text-white">{stats.totalModules}</p>
              </div>
              <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Locked</p>
                <p className="text-2xl font-bold text-white">{stats.lockedModules}</p>
              </div>
              <div className="w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Unlocked</p>
                <p className="text-2xl font-bold text-white">{stats.unlockedModules}</p>
              </div>
              <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center">
                <Unlock className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue>
                    Select Course
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-white">
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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              All Modules ({filteredModules.length})
            </div>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Course</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Order</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => (
                <TableRow key={module.id} className="border-gray-700">
                  <TableCell>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium text-white">{module.title}</p>
                        {module.videoUrl && (
                          <p className="text-sm text-gray-400 flex items-center">
                            <Video className="w-3 h-3 mr-1" />
                            Has video
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                      {module.course?.title || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={module.isLocked ? "destructive" : "default"}
                      className={module.isLocked ? "bg-red-900/50 text-red-400 border-red-700" : "bg-green-900/50 text-green-400 border-green-700"}
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
                    <span className="font-medium text-white">#{module.order}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleModuleLock(module.id, !module.isLocked)}
                        disabled={actionLoading[module.id]}
                        className={module.isLocked ? "border-green-700 text-green-400 hover:bg-green-900/30" : "border-red-700 text-red-400 hover:bg-red-900/30"}
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
                        className="border-blue-700 text-blue-400 hover:bg-blue-900/30"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(module)}
                        className="border-red-700 text-red-400 hover:bg-red-900/30"
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
          <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                {showEditModal ? 'Edit Module' : 'Add New Module'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Course *
                  </label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue>
                        Select Course
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-white">
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter module title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter video URL (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Homework
                  </label>
                  <textarea
                    value={formData.homework}
                    onChange={(e) => setFormData(prev => ({ ...prev, homework: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
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
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isLocked" className="text-sm font-medium text-gray-300">
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
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
          <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Delete Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete the module "<strong className="text-white">{selectedModule.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedModule(null);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteModule(selectedModule.id)}
                  disabled={actionLoading[selectedModule.id]}
                  className="bg-red-600 hover:bg-red-700"
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

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Bulk Upload Modules
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setBulkUploadCourseId('');
                    setBulkUploadFile(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Course *
                  </label>
                  <Select value={bulkUploadCourseId} onValueChange={setBulkUploadCourseId}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue>
                        Select Course
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-white">
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    JSON File *
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Upload a JSON file with modules array. Download the template for reference.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBulkUploadModal(false);
                      setBulkUploadCourseId('');
                      setBulkUploadFile(null);
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading.bulkUpload}
                    className="btn-primary"
                  >
                    {actionLoading.bulkUpload ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Modules
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
