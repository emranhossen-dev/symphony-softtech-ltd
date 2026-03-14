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
  Calendar, 
  Clock,
  RefreshCw,
  Users,
  UserPlus,
  BookOpen,
  User,
  Filter,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  MapPin,
  Video,
  Monitor
} from 'lucide-react';

interface Batch {
  id: string;
  name: string;
  courseId: string;
  course?: {
    id: string;
    title: string;
    category: string;
  };
  mentorId: string;
  mentor?: {
    id: string;
    name: string;
    email: string;
  };
  schedule: string;
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  location: string;
  deliveryMode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  duration?: string;
  level?: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

const deliveryModes = [
  { value: 'ONLINE', label: 'Online', icon: <Video className="w-4 h-4" /> },
  { value: 'OFFLINE', label: 'Offline', icon: <MapPin className="w-4 h-4" /> },
  { value: 'HYBRID', label: 'Hybrid', icon: <Monitor className="w-4 h-4" /> }
];

const scheduleOptions = [
  { value: 'WEEKDAYS_MORNING', label: 'Weekdays (9 AM - 12 PM)' },
  { value: 'WEEKDAYS_AFTERNOON', label: 'Weekdays (2 PM - 5 PM)' },
  { value: 'WEEKDAYS_EVENING', label: 'Weekdays (6 PM - 9 PM)' },
  { value: 'WEEKEND_MORNING', label: 'Weekend (9 AM - 1 PM)' },
  { value: 'WEEKEND_AFTERNOON', label: 'Weekend (2 PM - 6 PM)' },
  { value: 'CUSTOM', label: 'Custom Schedule' }
];

export default function BatchManagement() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    course: 'all',
    mentor: 'all',
    status: 'all',
    deliveryMode: 'all'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    mentorId: '',
    schedule: 'WEEKDAYS_EVENING',
    maxStudents: 30,
    startDate: '',
    endDate: '',
    location: '',
    deliveryMode: 'ONLINE' as 'ONLINE' | 'OFFLINE' | 'HYBRID',
    isActive: true
  });

  useEffect(() => {
    fetchBatches();
    fetchCourses();
    fetchMentors();
  }, []);

  useEffect(() => {
    filterBatches();
  }, [batches, filters]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/batch', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBatches(data.batches);
      } else {
        toast.error('Failed to fetch batches');
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
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

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/admin/mentors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMentors(data.mentors);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const filterBatches = () => {
    let filtered = [...batches];
    
    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(batch => 
        batch.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        batch.course?.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        batch.mentor?.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Filter by course
    if (filters.course !== 'all') {
      filtered = filtered.filter(batch => batch.courseId === filters.course);
    }
    
    // Filter by mentor
    if (filters.mentor !== 'all') {
      filtered = filtered.filter(batch => batch.mentorId === filters.mentor);
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(batch => batch.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(batch => !batch.isActive);
      }
    }
    
    // Filter by delivery mode
    if (filters.deliveryMode !== 'all') {
      filtered = filtered.filter(batch => batch.deliveryMode === filters.deliveryMode);
    }
    
    setFilteredBatches(filtered);
  };

  const toggleBatchStatus = async (batchId: string, isActive: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [batchId]: true }));
      
      const response = await fetch('/api/admin/batch/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          batchId,
          isActive
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBatches(prev => 
          prev.map(batch => 
            batch.id === batchId 
              ? { ...batch, isActive }
              : batch
          )
        );
        
        toast.success(`Batch ${isActive ? 'activated' : 'deactivated'} successfully!`);
      } else {
        toast.error(data.error || 'Failed to update batch status');
      }
    } catch (error) {
      console.error('Error updating batch status:', error);
      toast.error('Failed to update batch status');
    } finally {
      setActionLoading(prev => ({ ...prev, [batchId]: false }));
    }
  };

  const deleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [batchId]: true }));
      
      const response = await fetch('/api/admin/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          batchId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBatches(prev => prev.filter(batch => batch.id !== batchId));
        toast.success('Batch deleted successfully!');
      } else {
        toast.error(data.error || 'Failed to delete batch');
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    } finally {
      setActionLoading(prev => ({ ...prev, [batchId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.courseId || !formData.mentorId || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate dates
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    // Validate max students
    if (formData.maxStudents < 1 || formData.maxStudents > 100) {
      toast.error('Max students must be between 1 and 100');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, submit: true }));
      
      const url = showEditModal ? '/api/admin/batch' : '/api/admin/batch';
      const method = showEditModal ? 'PUT' : 'POST';
      const payload = showEditModal 
        ? { ...formData, id: selectedBatch?.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (data.success) {
        if (showEditModal) {
          setBatches(prev => 
            prev.map(batch => 
              batch.id === selectedBatch?.id 
                ? { ...batch, ...formData }
                : batch
            )
          );
          toast.success('Batch updated successfully!');
        } else {
          setBatches(prev => [...prev, data.batch]);
          toast.success('Batch created successfully!');
        }
        
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
      } else {
        toast.error(data.error || 'Failed to save batch');
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('Failed to save batch');
    } finally {
      setActionLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const openEditModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      courseId: batch.courseId,
      mentorId: batch.mentorId,
      schedule: batch.schedule,
      maxStudents: batch.maxStudents,
      startDate: batch.startDate,
      endDate: batch.endDate,
      location: batch.location,
      deliveryMode: batch.deliveryMode,
      isActive: batch.isActive
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      courseId: '',
      mentorId: '',
      schedule: 'WEEKDAYS_EVENING',
      maxStudents: 30,
      startDate: '',
      endDate: '',
      location: '',
      deliveryMode: 'ONLINE',
      isActive: true
    });
    setSelectedBatch(null);
  };

  const getCapacityStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    
    if (percentage >= 90) {
      return { color: 'text-red-600', bg: 'bg-red-50', label: 'Almost Full' };
    } else if (percentage >= 70) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Filling Fast' };
    } else if (percentage >= 40) {
      return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Available' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-50', label: 'Plenty Space' };
    }
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE': return <Video className="w-4 h-4" />;
      case 'OFFLINE': return <MapPin className="w-4 h-4" />;
      case 'HYBRID': return <Monitor className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const activeBatches = batches.filter(b => b.isActive).length;
  const inactiveBatches = batches.filter(b => !b.isActive).length;
  const totalStudents = batches.reduce((sum, batch) => sum + batch.currentStudents, 0);
  const totalCapacity = batches.reduce((sum, batch) => sum + batch.maxStudents, 0);

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Batch Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage course batches and schedules</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={fetchBatches}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Batches</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{batches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Batches</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{activeBatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{totalCapacity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by batch name, course, or mentor..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <Select value={filters.course} onValueChange={(value) => setFilters(prev => ({ ...prev, course: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Courses</SelectValue>
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

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mentor</label>
                <Select value={filters.mentor} onValueChange={(value) => setFilters(prev => ({ ...prev, mentor: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Mentors</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Mode</label>
                <Select value={filters.deliveryMode} onValueChange={(value) => setFilters(prev => ({ ...prev, deliveryMode: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>All Modes</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {deliveryModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batches Table */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900">All Batches</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                  {filteredBatches.length} Total
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {filteredBatches.map((batch) => {
                    const capacityStatus = getCapacityStatus(batch.currentStudents, batch.maxStudents);
                    const deliveryMode = deliveryModes.find(m => m.value === batch.deliveryMode);
                    
                    return (
                      <TableRow key={batch.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              {getDeliveryModeIcon(batch.deliveryMode)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{batch.name}</div>
                              <div className="text-xs text-gray-500 flex items-center">
                                {deliveryMode?.icon}
                                <span className="ml-1">{deliveryMode?.label}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{batch.course?.title}</div>
                            <div className="text-xs text-gray-500">{batch.course?.category}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {batch.mentor?.name || 'Not assigned'}
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {batch.schedule}
                          </div>
                          {batch.location && (
                            <div className="text-xs text-gray-500">{batch.location}</div>
                          )}
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {batch.currentStudents}/{batch.maxStudents}
                              </span>
                              <Badge className={`${capacityStatus.bg} ${capacityStatus.color} border-0 text-xs`}>
                                {capacityStatus.label}
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  batch.currentStudents / batch.maxStudents >= 0.9 ? 'bg-red-500' :
                                  batch.currentStudents / batch.maxStudents >= 0.7 ? 'bg-yellow-500' :
                                  batch.currentStudents / batch.maxStudents >= 0.4 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(batch.currentStudents / batch.maxStudents) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div>{new Date(batch.startDate).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">to {new Date(batch.endDate).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(batch)}
                              className="border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleBatchStatus(batch.id, !batch.isActive)}
                              className={batch.isActive 
                                ? "border-orange-200 text-orange-700 hover:bg-orange-50"
                                : "border-green-200 text-green-700 hover:bg-green-50"
                              }
                              disabled={actionLoading[batch.id]}
                            >
                              {actionLoading[batch.id] ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : batch.isActive ? (
                                <AlertTriangle className="w-4 h-4 mr-1" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              {batch.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteBatch(batch.id)}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              disabled={actionLoading[batch.id]}
                            >
                              {actionLoading[batch.id] ? (
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-1" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredBatches.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or create a new batch.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading batches...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Batch Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {showEditModal ? 'Edit Batch' : 'Create New Batch'}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Web Development Batch A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                      <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue>Select course</SelectValue>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mentor *</label>
                      <Select value={formData.mentorId} onValueChange={(value) => setFormData(prev => ({ ...prev, mentorId: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue>Select mentor</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {mentors.map((mentor) => (
                            <SelectItem key={mentor.id} value={mentor.id}>
                              {mentor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
                      <Select value={formData.schedule} onValueChange={(value) => setFormData(prev => ({ ...prev, schedule: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue>Select schedule</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {scheduleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Students *</label>
                      <input
                        type="number"
                        value={formData.maxStudents}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 30 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Mode *</label>
                      <Select value={formData.deliveryMode} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryMode: value as any }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue>Select delivery mode</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryModes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              <div className="flex items-center">
                                {mode.icon}
                                <span className="ml-2">{mode.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Room 101, Building A"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        Batch is active
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
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
                      className="bg-blue-600 hover:bg-blue-700 text-white"
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
                          {showEditModal ? 'Update Batch' : 'Create Batch'}
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
