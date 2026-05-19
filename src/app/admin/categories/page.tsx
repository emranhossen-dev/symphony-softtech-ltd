"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw,
  Eye,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  AlertTriangle,
  X
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  courseCount: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalCourses: number;
  totalEnrollments: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    activeCategories: 0,
    totalCourses: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#10b981',
    icon: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data || []);
        // Stats not provided by API, set defaults
        setStats({
          totalCategories: data.data?.length || 0,
          activeCategories: data.data?.filter((c: any) => c.isActive).length || 0,
          totalCourses: 0,
          totalEnrollments: 0
        });
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#10b981',
      icon: '',
      isActive: true
    });
    setShowCreateModal(true);
    setShowEditModal(false);
    setShowDeleteModal(false);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      color: category.color || '#10b981',
      icon: category.icon || '',
      isActive: category.isActive
    });
    setShowEditModal(true);
    setShowCreateModal(false);
    setShowDeleteModal(false);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleCreateSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Category created successfully');
        closeAllModals();
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedCategory) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedCategory.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Category updated successfully');
        closeAllModals();
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories?id=${categoryToDelete.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Category deleted successfully');
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        setDeleteConfirmation('');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const closeAllModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCategory(null);
    setCategoryToDelete(null);
    setDeleteConfirmation('');
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#10b981',
      icon: '',
      isActive: true
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Category Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage course categories and track performance</p>
            </div>
            <Button 
              onClick={handleCreateCategory}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalCategories || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.activeCategories || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalCourses || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalEnrollments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                />
              </div>
              <Button 
                onClick={fetchCategories}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900">Category</TableHead>
                  <TableHead className="text-gray-900">Description</TableHead>
                  <TableHead className="text-gray-900">Courses</TableHead>
                  <TableHead className="text-gray-900">Enrollments</TableHead>
                  <TableHead className="text-gray-900">Status</TableHead>
                  <TableHead className="text-gray-900">Created</TableHead>
                  <TableHead className="text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-black hover:text-white transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <span className="text-white font-semibold">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.icon}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs">
                          {category.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {category.courseCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {category.enrollmentCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={category.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category)}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
          onClick={closeAllModals}
        >
          <div 
            className="bg-black rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-2 border-green-600 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAllModals}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 pr-8">
              Create Category
            </h2>
            <p className="text-sm text-gray-400 mb-6">Create a new category for organizing courses</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubmit();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  placeholder="e.g., Government Batch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  placeholder="e.g., government-batch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                    placeholder="#10b981"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Icon (emoji or text)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  placeholder="e.g., 📚 or Book"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active</label>
              </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={closeAllModals}
                className="px-6 py-2 border-2 border-gray-600 hover:bg-gray-800 text-white font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold shadow-lg"
              >
                {submitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedCategory && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
          onClick={closeAllModals}
        >
          <div 
            className="bg-black rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-2 border-green-600 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAllModals}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 pr-8">
              Edit Category
            </h2>
            <p className="text-sm text-gray-400 mb-6">Edit category details</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  placeholder="e.g., Government Batch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  placeholder="e.g., government-batch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                    placeholder="#10b981"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Icon (emoji or text)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-900 text-white"
                  placeholder="e.g., 📚 or Book"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active</label>
              </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={closeAllModals}
                className="px-6 py-2 border-2 border-gray-600 hover:bg-gray-800 text-white font-semibold"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold shadow-lg"
              >
                {submitting ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
          onClick={closeAllModals}
        >
          <div 
            className="bg-black rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200 border-2 border-red-600 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeAllModals}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-900 transition-colors"
            >
              <X className="w-5 h-5 text-white hover:text-red-400" />
            </button>
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-14 h-14 bg-red-900 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Delete Category</h2>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 mb-4 border border-red-700">
              <p className="text-sm text-white">
                Are you sure you want to delete <strong className="text-red-400">{categoryToDelete.name}</strong>?
              </p>
              {categoryToDelete.courseCount > 0 && (
                <p className="text-sm text-red-400 mt-2 font-semibold">
                  ⚠️ This category has {categoryToDelete.courseCount} course(s). Deleting it may affect related data.
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type <code className="bg-red-900 px-2 py-1 rounded text-red-400">DELETE</code> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type 'DELETE' to confirm"
                className="w-full px-4 py-3 border-2 border-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-900 text-white"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={closeAllModals}
                disabled={deleting}
                className="px-6 py-2 border-2 border-gray-600 hover:bg-gray-800 text-white font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting || deleteConfirmation !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
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
          </div>
        </div>
      )}
    </div>
  );
}
