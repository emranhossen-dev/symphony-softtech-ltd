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
  AlertCircle,
  ChevronDown,
  Check,
  Filter,
  ArrowUp,
  ArrowDown,
  Copy
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
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    showLocked: true,
    showUnlocked: true,
    hasVideo: false,
    hasHomework: false
  });
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'date'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
        
        // If the URL uses ID but course has a slug, redirect to the slug URL
        if (data.course.slug && courseId !== data.course.slug) {
          router.replace(`/admin/category/${slug}/courses/${data.course.slug}/modules`);
          return;
        }
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
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === dropIndex) return;

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

  const filteredModules = modules
    .filter(module => {
      const matchesSearch =
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (module.homework && module.homework.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocked = filters.showLocked ? module.isLocked : !module.isLocked;
      const matchesUnlocked = filters.showUnlocked ? !module.isLocked : module.isLocked;
      const matchesVideo = filters.hasVideo ? !!module.videoUrl : true;
      const matchesHomework = filters.hasHomework ? !!module.homework : true;

      return matchesSearch && (matchesLocked || matchesUnlocked) && matchesVideo && matchesHomework;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'order') {
        comparison = a.order - b.order;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getCategoryName = (category: string) => {
    return category.toUpperCase();
  };

  // Calculate stats
  const stats = {
    totalModules: modules.length,
    totalVideos: modules.filter(m => m.videoUrl).length,
    totalTopics: modules.reduce((acc, m) => acc + (m.topics?.length || 0), 0),
    totalHomework: modules.filter(m => m.homework).length,
    lockedModules: modules.filter(m => m.isLocked).length,
    unlockedModules: modules.filter(m => !m.isLocked).length
  };

  const completionPercentage = modules.length > 0 ? Math.round((stats.unlockedModules / stats.totalModules) * 100) : 0;

  const toggleModuleExpand = (moduleId: string) => {
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

  const toggleModuleSelect = (moduleId: string) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const selectAllModules = () => {
    if (selectedModules.size === filteredModules.length) {
      setSelectedModules(new Set());
    } else {
      setSelectedModules(new Set(filteredModules.map(m => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedModules.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedModules.size} module(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedModules).map(moduleId =>
        fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedModules.size} module(s) deleted successfully`);
      setSelectedModules(new Set());
      fetchModules();
    } catch (error) {
      console.error('Error deleting modules:', error);
      toast.error('Failed to delete modules');
    }
  };

  const handleDuplicateModule = async (module: Module) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: `${module.title} (Copy)`,
          videoUrl: module.videoUrl,
          homework: module.homework,
          topics: module.topics,
          description: module.description,
          order: modules.length + 1,
          isLocked: true
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Module duplicated successfully');
        fetchModules();
      } else {
        toast.error(data.error || 'Failed to duplicate module');
      }
    } catch (error) {
      console.error('Error duplicating module:', error);
      toast.error('Failed to duplicate module');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-500 border-t-transparent absolute top-0"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Glassmorphism Header */}
      <div className="relative bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative group z-10">
                <button
                  onClick={() => {
                    console.log('Back button clicked, navigating to:', `/admin/category/${slug}/courses/${course?.slug || courseId}`);
                    try {
                      router.push(`/admin/category/${slug}/courses/${course?.slug || courseId}`);
                    } catch (error) {
                      console.error('Navigation error:', error);
                      // Fallback to router.back()
                      router.back();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 border border-white/20 relative z-10"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
              </div>

              <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-white/30 to-transparent"></div>

              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-300">
                  {course?.title || 'Course'} — Modules
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {course && (
                    <>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 backdrop-blur-sm">
                        {course.category}
                      </span>
                      <span className="text-white/40">•</span>
                    </>
                  )}
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-bold shadow-xl shadow-emerald-500/30 backdrop-blur-sm border border-emerald-400/30">
                    <BookOpen className="w-3.5 h-3.5" />
                    {modules.length} module{modules.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={() => router.push(`/admin/category/${slug}/courses/${course?.slug || courseId}/modules/edit`)}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 font-bold shadow-2xl shadow-emerald-500/40 hover:scale-105 hover:shadow-emerald-500/60 backdrop-blur-sm border border-emerald-400/30"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Module
              </button>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {filteredModules.length > 0 && (
              <div className="relative group">
                <button
                  onClick={selectAllModules}
                  className="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 hover:scale-110 border border-white/30 hover:border-white/60"
                  style={{
                    backgroundColor: selectedModules.size === filteredModules.length && filteredModules.length > 0 ? '#10b981' : 'transparent',
                    borderColor: selectedModules.size === filteredModules.length && filteredModules.length > 0 ? '#10b981' : 'rgba(255, 255, 255, 0.3)'
                  }}
                  title={selectedModules.size === filteredModules.length ? 'Deselect all' : 'Select all'}
                >
                  {selectedModules.size === filteredModules.length && filteredModules.length > 0 && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
              </div>
            )}
            <div className="relative flex-1 max-w-lg group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search modules by title or homework..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-purple-500/30 text-white placeholder-white/50 text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none"></div>
            </div>
            <div className="relative group">
              <button
                onClick={fetchModules}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 border border-white/20 backdrop-blur-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform duration-500`} />
                Refresh
              </button>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stats Dashboard */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 mb-8 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative group/icon">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-xl group-hover/icon:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-xl"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Course Completion</h3>
                  <p className="text-sm text-white/60 mt-1">{stats.unlockedModules} of {stats.totalModules} modules unlocked</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent animate-pulse">{completionPercentage}%</span>
                <p className="text-sm text-white/60 mt-1">Complete</p>
              </div>
            </div>
            <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${completionPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative group/card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group/icon">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover/icon:scale-110 transition-transform duration-300">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-400 rounded-xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                <span className="text-xs text-white/60 font-bold uppercase tracking-wide">Modules</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalModules}</p>
            </div>
          </div>

          <div className="relative group/card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group/icon">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover/icon:scale-110 transition-transform duration-300">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-400 rounded-xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                <span className="text-xs text-white/60 font-bold uppercase tracking-wide">Videos</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
            </div>
          </div>

          <div className="relative group/card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group/icon">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover/icon:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                <span className="text-xs text-white/60 font-bold uppercase tracking-wide">Topics</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalTopics}</p>
            </div>
          </div>

          <div className="relative group/card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group/icon">
                  <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover/icon:scale-110 transition-transform duration-300">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                <span className="text-xs text-white/60 font-bold uppercase tracking-wide">Homework</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalHomework}</p>
            </div>
          </div>

          <div className="relative group/card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group/icon">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover/icon:scale-110 transition-transform duration-300">
                    <Unlock className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                <span className="text-xs text-white/60 font-bold uppercase tracking-wide">Unlocked</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{stats.unlockedModules}</p>
            </div>
          </div>

          <div className="relative group/card bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group/icon">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover/icon:scale-110 transition-transform duration-300">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                <span className="text-xs text-white/60 font-bold uppercase tracking-wide">Locked</span>
              </div>
              <p className="text-3xl font-bold text-amber-400">{stats.lockedModules}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bulk Action Bar */}
      {selectedModules.size > 0 && (
        <div className="relative max-w-7xl mx-auto px-6 pb-6">
          <div className="relative bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-2xl border border-emerald-400/30 rounded-3xl p-6 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-2 duration-500 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative group/icon">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl group-hover/icon:scale-110 transition-transform duration-300">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-xl"></div>
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  {selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} selected
                </span>
                <p className="text-sm text-emerald-300 mt-1">Ready for bulk actions</p>
              </div>
            </div>
            <div className="relative flex items-center gap-3">
              <button
                onClick={selectAllModules}
                className="relative px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-medium hover:scale-105 border border-white/20 backdrop-blur-sm overflow-hidden group"
              >
                <span className="relative z-10">{selectedModules.size === filteredModules.length ? 'Deselect All' : 'Select All'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
              </button>
              <button
                onClick={() => setSelectedModules(new Set())}
                className="relative px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-medium hover:scale-105 border border-white/20 backdrop-blur-sm overflow-hidden group"
              >
                <span className="relative z-10">Cancel</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
              </button>
              <button
                onClick={handleBulkDelete}
                className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 font-medium shadow-xl shadow-red-500/40 hover:scale-105 hover:shadow-red-500/60 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Delete Selected
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        {filteredModules.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl backdrop-blur-xl group">
                <BookOpen className="w-16 h-16 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {searchTerm ? 'No modules found' : 'No modules yet'}
              </h3>
              <p className="text-lg text-white/60 mb-12 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? 'Try adjusting your search terms to find what you are looking for.'
                  : 'Start building your course by creating your first module.'
                }
              </p>
              {!searchTerm && (
                <div className="relative group">
                  <button
                    onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/create`)}
                    className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-2xl shadow-indigo-500/40 hover:scale-105 hover:shadow-indigo-500/60 backdrop-blur-sm border border-white/20 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      Create First Module
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 hover:border-white/40 hover:shadow-3xl hover:shadow-indigo-500/20 transition-all duration-500 cursor-move overflow-hidden ${
                  draggedItem === index
                    ? 'opacity-50 scale-95 shadow-4xl rotate-1'
                    : ''
                } ${draggedItem !== null && draggedItem !== index ? 'opacity-60' : ''}`}
              >
                {/* Card Header */}
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 animate-pulse animation-delay-1000"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative group/icon">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl group-hover/icon:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-2xl">{module.order}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-white rounded-2xl opacity-0 group-hover/icon:opacity-20 transition-opacity duration-300 blur-xl"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white truncate leading-tight group-hover:text-indigo-200 transition-colors duration-300">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                            module.isLocked
                              ? 'bg-amber-400/30 text-amber-100 border border-amber-400/50'
                              : 'bg-emerald-400/30 text-emerald-100 border border-emerald-400/50'
                          }`}>
                            {module.isLocked ? (
                              <><Lock className="w-3 h-3" /> Locked</>
                            ) : (
                              <><Unlock className="w-3 h-3" /> Open</>
                            )}
                          </span>
                          {(module.title.includes('Demo') || module.title.includes('Introduction')) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-400/30 text-blue-100 border border-blue-400/50 text-xs font-bold backdrop-blur-sm">
                              Demo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModuleSelect(module.id);
                        }}
                        className="relative w-6 h-6 rounded-lg border-2 border-white/50 flex items-center justify-center transition-all duration-300 hover:border-white hover:bg-white/20 group/check"
                        style={{
                          backgroundColor: selectedModules.has(module.id) ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
                        }}
                      >
                        {selectedModules.has(module.id) && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-white rounded-lg opacity-0 group-hover/check:opacity-30 transition-opacity duration-300 blur-md"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {module.description && (
                    <p className="text-white/70 mb-4 line-clamp-2 group-hover:text-white/80 transition-colors duration-300">{module.description}</p>
                  )}

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {module.videoUrl && (
                      <div className="group/feature relative flex items-center gap-3 p-3 bg-blue-500/20 rounded-xl border border-blue-400/30 backdrop-blur-sm hover:bg-blue-500/30 transition-all duration-300">
                        <div className="relative group/icon">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover/icon:scale-110 transition-transform duration-300">
                            <Video className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-300">Video Available</p>
                          <p className="text-xs text-blue-400 truncate">{module.videoUrl}</p>
                        </div>
                        <a
                          href={module.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open →
                        </a>
                      </div>
                    )}

                    {module.topics && module.topics.length > 0 && (
                      <div className="group/feature relative flex items-center gap-3 p-3 bg-purple-500/20 rounded-xl border border-purple-400/30 backdrop-blur-sm hover:bg-purple-500/30 transition-all duration-300">
                        <div className="relative group/icon">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover/icon:scale-110 transition-transform duration-300">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-300">{module.topics.length} Topics</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {module.topics.slice(0, 3).map((topic, i) => (
                              <span key={i} className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                {topic}
                              </span>
                            ))}
                            {module.topics.length > 3 && (
                              <span className="text-xs text-purple-400">+{module.topics.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {module.homework && (
                      <div className="group/feature relative flex items-start gap-3 p-3 bg-amber-500/20 rounded-xl border border-amber-400/30 backdrop-blur-sm hover:bg-amber-500/30 transition-all duration-300">
                        <div className="relative group/icon">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/icon:scale-110 transition-transform duration-300">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg opacity-0 group-hover/icon:opacity-30 transition-opacity duration-300 blur-md"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-300">Homework Assigned</p>
                          <p className="text-xs text-amber-400 line-clamp-2 mt-1">{module.homework}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <GripVertical className="w-4 h-4 group-hover:text-white/70 transition-colors duration-300" />
                      Drag to reorder
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/category/${slug}/courses/${courseId}/modules/${module.id}/edit`)}
                        className="relative group/btn flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl transition-all duration-300 font-medium hover:scale-105 border border-indigo-400/30 backdrop-blur-sm overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Edit className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Edit
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300 blur-xl"></div>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id, module.title)}
                        className="relative group/btn flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all duration-300 font-medium hover:scale-105 border border-red-400/30 backdrop-blur-sm overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Delete
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-hover/btn:opacity-30 transition-opacity duration-300 blur-xl"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ModulesPage;
