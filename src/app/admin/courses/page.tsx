"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SimpleSelect, SimpleSelectTrigger, SimpleSelectContent, SimpleSelectItem } from '@/components/ui/SimpleSelect';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Image,
  ToggleLeft,
  ToggleRight,
  Filter,
  Upload,
  X,
  Save,
  Users,
  Clock,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  price: number;
  duration: string;
  thumbnail?: string;
  isActive: boolean;
  mentorId?: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    enrollments: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    price: 0,
    duration: '',
    thumbnail: '',
    mentorId: '',
    isActive: true
  });
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    price: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchMentors();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== '') params.append('isActive', filters.isActive);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/courses?${params}`);
      const data = await response.json();
      
      console.log('Frontend received:', data);
      
      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/admin/mentors');
      const data = await response.json();
      
      if (data.success) {
        setMentors(data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.shortDescription?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }
    
    // Filter by status
    if (filters.isActive !== '') {
      filtered = filtered.filter(course => course.isActive === (filters.isActive === 'true'));
    }
    
    setFilteredCourses(filtered);
  };

  const toggleCourseStatus = async (courseId: string, isActive: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: true }));
      
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: courseId,
          isActive: !isActive
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Course ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchCourses();
      } else {
        toast.error(data.error || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error toggling course status:', error);
      toast.error('Failed to update course status');
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: true }));
      
      const response = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Check if response has content before parsing JSON
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, error: 'Empty response from server' };
      }
      
      if (data.success) {
        toast.success('Course deleted successfully');
        setShowDeleteModal(false);
        setSelectedCourse(null);
        fetchCourses();
      } else {
        toast.error(data.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.title.trim()) {
      toast.error('Course title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Course description is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.duration.trim()) {
      toast.error('Course duration is required');
      return;
    }
    
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, submit: true }));
      
      const url = showEditModal ? '/api/admin/courses' : '/api/admin/courses';
      const method = showEditModal ? 'PUT' : 'POST';
      
      const payload = showEditModal 
        ? { ...formData, id: selectedCourse?.id }
        : { ...formData, categoryId: formData.category };

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
        toast.success(`Course ${showEditModal ? 'updated' : 'created'} successfully`);
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchCourses();
        // Redirect to courses page after successful creation/update
        window.location.href = '/admin/courses';
      } else {
        toast.error(data.error || `Failed to ${showEditModal ? 'update' : 'create'} course`);
      }
    } catch (error) {
      console.error('Error submitting course:', error);
      toast.error(`Failed to ${showEditModal ? 'update' : 'create'} course`);
    } finally {
      setActionLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      category: 'ONLINE',
      price: 0,
      duration: '',
      thumbnail: '',
      mentorId: '',
      isActive: true
    });
    setFormErrors({
      title: '',
      description: '',
      category: '',
      duration: '',
      price: ''
    });
    setSelectedCourse(null);
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      shortDescription: course.shortDescription || '',
      category: course.category,
      price: course.price,
      duration: course.duration,
      thumbnail: course.thumbnail || '',
      mentorId: course.mentorId || '',
      isActive: course.isActive
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const activeCourses = courses.filter(c => c.isActive).length;
  const inactiveCourses = courses.filter(c => !c.isActive).length;
  const totalRevenue = courses.reduce((sum, course) => sum + (course.price * course._count.enrollments), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your training courses and programs</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={fetchCourses}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="icon-wrapper">
                  <BookOpen className="icon-primary" />
                </div>
                <div className="ml-4">
                  <p className="stat-label">Total Courses</p>
                  <p className="stat-number">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="icon-wrapper">
                  <Eye className="icon-primary" />
                </div>
                <div className="ml-4">
                  <p className="stat-label">Active Courses</p>
                  <p className="stat-number">{activeCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="icon-wrapper">
                  <EyeOff className="icon-secondary" />
                </div>
                <div className="ml-4">
                  <p className="stat-label">Inactive Courses</p>
                  <p className="stat-number">{inactiveCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="icon-wrapper">
                  <span className="icon-secondary text-2xl font-bold">৳</span>
                </div>
                <div className="ml-4">
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-number">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-premium mb-8" style={{ overflow: 'visible' }}>
          <CardContent className="p-6" style={{ overflow: 'visible' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <SimpleSelect value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SimpleSelectTrigger className="w-full border-gray-200 text-sm">
                    {filters.category ? categories.find(c => c.slug === filters.category)?.name : 'Category'}
                  </SimpleSelectTrigger>
                  <SimpleSelectContent>
                    <SimpleSelectItem value="">All Categories</SimpleSelectItem>
                    {categories.map(category => (
                      <SimpleSelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SimpleSelectItem>
                    ))}
                  </SimpleSelectContent>
                </SimpleSelect>
              </div>

              <div className="lg:w-48">
                <SimpleSelect value={filters.isActive} onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value }))}>
                  <SimpleSelectTrigger className="w-full border-gray-200 text-sm">
                    {filters.isActive === '' ? 'Status' : filters.isActive === 'true' ? 'Active' : 'Inactive'}
                  </SimpleSelectTrigger>
                  <SimpleSelectContent>
                    <SimpleSelectItem value="">All Status</SimpleSelectItem>
                    <SimpleSelectItem value="true">Active</SimpleSelectItem>
                    <SimpleSelectItem value="false">Inactive</SimpleSelectItem>
                  </SimpleSelectContent>
                </SimpleSelect>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="bg-white border-0 shadow-sm rounded-xl">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first course.</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="card-premium overflow-hidden">
                {/* Thumbnail */}
                <div className="h-48 bg-gray-100 relative">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={`${
                      course.isActive 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Title and Category */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {categories.find(c => c.slug === course.category.toLowerCase())?.name || course.category}
                    </Badge>
                  </div>

                  {/* Short Description */}
                  {course.shortDescription && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.shortDescription}</p>
                  )}

                  {/* Course Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold text-gray-900">
                        {course.price === 0 ? 'Free' : formatCurrency(course.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-900">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Students:</span>
                      <span className="text-gray-900">{course._count.enrollments}</span>
                    </div>
                    {course.mentor && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Mentor:</span>
                        <span className="text-gray-900">{course.mentor.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(course)}
                        className="btn-secondary-outline"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(course)}
                        className="border-red-200 text-red-700 hover:bg-red-50 badge-danger"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCourseStatus(course.id, course.isActive)}
                      disabled={actionLoading[course.id]}
                      className={`${
                        course.isActive 
                          ? 'border-gray-200 text-gray-700 hover:bg-gray-50' 
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {actionLoading[course.id] ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : course.isActive ? (
                        <ToggleLeft className="w-3 h-3" />
                      ) : (
                        <ToggleRight className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {showEditModal ? 'Edit Course' : 'Create New Course'}
                  </h2>
                  <p className="text-green-50 mt-1">
                    {showEditModal ? 'Update course information and settings' : 'Add a new course to your training catalog'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Course Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        onFocus={() => setActiveInput('title')}
                        onBlur={() => setActiveInput(null)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                          !formData.title.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        } ${activeInput === 'title' ? 'text-orange-500' : 'text-gray-900'}`}
                        placeholder="Enter course title"
                        required
                      />
                      {!formData.title.trim() && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          Course title is required
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <SimpleSelect value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} className="w-full">
                        <SimpleSelectTrigger className="border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all">
                          {formData.category ? categories.find(c => c.slug === formData.category)?.name : 'Select category'}
                        </SimpleSelectTrigger>
                        <SimpleSelectContent className="border-2 border-gray-200 shadow-xl rounded-xl">
                          {categories.map((category) => (
                            <SimpleSelectItem key={category.id} value={category.slug} className="hover:bg-green-50 focus:bg-green-50 rounded-lg mx-1">
                              {category.name}
                            </SimpleSelectItem>
                          ))}
                        </SimpleSelectContent>
                      </SimpleSelect>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          onFocus={() => setActiveInput('price')}
                          onBlur={() => setActiveInput(null)}
                          className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                            formData.price < 0 ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          } ${activeInput === 'price' ? 'text-orange-500' : 'text-gray-900'}`}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      {formData.price < 0 && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          Price cannot be negative
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        onFocus={() => setActiveInput('duration')}
                        onBlur={() => setActiveInput(null)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all placeholder-gray-600 ${
                          !formData.duration.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        } ${activeInput === 'duration' ? 'text-orange-500' : 'text-gray-900'}`}
                        placeholder="e.g., 3 months, 40 hours"
                        required
                      />
                      {!formData.duration.trim() && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                          Course duration is required
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Short Description</label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                        onFocus={() => setActiveInput('shortDescription')}
                        onBlur={() => setActiveInput(null)}
                        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-gray-300 transition-all placeholder-gray-600 ${activeInput === 'shortDescription' ? 'text-orange-500' : 'text-gray-900'}`}
                        placeholder="Brief course description (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" /> Assign Mentor
                      </label>
                      <SimpleSelect value={formData.mentorId} onValueChange={(value) => setFormData(prev => ({ ...prev, mentorId: value }))} className="w-full">
                        <SimpleSelectTrigger className="border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 focus:border-green-500 focus:ring-green-500/20 transition-all">
                          {formData.mentorId ? mentors.find(m => m.id === formData.mentorId)?.name : 'Select mentor'}
                        </SimpleSelectTrigger>
                        <SimpleSelectContent className="border-2 border-gray-200 shadow-xl rounded-xl">
                          <SimpleSelectItem value="" className="hover:bg-gray-50 focus:bg-gray-50 rounded-lg mx-1">No mentor</SimpleSelectItem>
                          {mentors.map((mentor) => (
                            <SimpleSelectItem key={mentor.id} value={mentor.id} className="hover:bg-green-50 focus:bg-green-50 rounded-lg mx-1">
                              {mentor.name}
                            </SimpleSelectItem>
                          ))}
                        </SimpleSelectContent>
                      </SimpleSelect>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Course Description</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      onFocus={() => setActiveInput('description')}
                      onBlur={() => setActiveInput(null)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none ${
                        !formData.description.trim() ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      } ${activeInput === 'description' ? 'text-orange-500' : 'text-gray-900'}`}
                      rows={5}
                      placeholder="Enter detailed course description..."
                      required
                    />
                    {!formData.description.trim() && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        Course description is required
                      </p>
                    )}
                  </div>
                </div>

                {/* Media Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Image className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Course Thumbnail</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Thumbnail URL</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                        onFocus={() => setActiveInput('thumbnail')}
                        onBlur={() => setActiveInput(null)}
                        className={`flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:border-gray-300 transition-all placeholder-gray-600 ${activeInput === 'thumbnail' ? 'text-orange-500' : 'text-gray-900'}`}
                        placeholder="https://example.com/image.jpg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-6 py-3 h-auto font-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ToggleRight className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Course Settings</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                      <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Course is active and available for enrollment
                      </label>
                    </label>
                    <p className="text-sm text-gray-500 mt-2 ml-8">
                      When enabled, students can enroll in this course. When disabled, the course remains hidden from the catalog.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-3 h-auto font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-8 py-3 h-auto font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={actionLoading.submit}
                  >
                    {actionLoading.submit ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                        {showEditModal ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-5 h-5 mr-3" />
                        {showEditModal ? 'Update Course' : 'Create Course'}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Delete Course</CardTitle>
            </CardHeader>

            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Are you sure?
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                This will permanently delete the course "{selectedCourse.title}". This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCourse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteCourse(selectedCourse.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={actionLoading[selectedCourse.id]}
                >
                  {actionLoading[selectedCourse.id] ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course
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
