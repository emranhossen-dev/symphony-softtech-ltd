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
  Users, 
  UserCheck, 
  UserX, 
  BookOpen, 
  Calendar,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Key,
  Lock,
  Unlock,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Award,
  Target,
  BarChart3
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: 'STUDENT' | 'MENTOR' | 'EMPLOYEE' | 'ADMIN';
  enrolledCourses: Array<{
    id: string;
    courseName: string;
    category: string;
    enrollmentStatus: string;
    progress: number;
    completedAt?: string;
  }>;
  createdAt: string;
  lastLogin?: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  description?: string;
  duration?: string;
  level?: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    course: 'all'
  });

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Starting to fetch courses...');
      
      // Try admin endpoint first
      let response = await fetch('/api/admin/courses?limit=100');
      let data = await response.json();

      console.log('Admin courses API response status:', response.status);
      console.log('Admin courses API response data:', data);

      // If admin endpoint fails, try public endpoint
      if (response.status === 401 || response.status === 403) {
        console.log('Admin endpoint failed, trying public endpoint...');
        response = await fetch('/api/courses?limit=100');
        data = await response.json();
        console.log('Public courses API response status:', response.status);
        console.log('Public courses API response data:', data);
      }

      console.log('Courses array from response:', data.courses);
      console.log('Courses count:', data.courses?.length || 0);

      if (data.courses && data.courses.length > 0) {
        setCourses(data.courses);
        console.log('✅ Courses set successfully:', data.courses.length);
      } else {
        console.warn('⚠️ No courses found in API response');
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.phone?.includes(filters.search)
      );
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(student => student.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(student => !student.isActive);
      }
    }
    
    // Filter by course
    if (filters.course !== 'all') {
      filtered = filtered.filter(student => 
        student.enrolledCourses.some(course => course.id === filters.course)
      );
    }
    
    setFilteredStudents(filtered);
  };

  const toggleStudentStatus = async (studentId: string, isActive: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [studentId]: true }));
      
      const response = await fetch('/api/admin/student/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          isActive
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId 
              ? { ...student, isActive }
              : student
          )
        );
        
        toast.success(`Student ${isActive ? 'enabled' : 'disabled'} successfully!`);
      } else {
        toast.error(data.error || 'Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Failed to update student status');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const resetStudentPassword = async (studentId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [studentId]: true }));
      
      const response = await fetch('/api/admin/student/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          newPassword: newPassword
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Password reset successfully!');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const assignCourse = async (studentId: string, courseId: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [studentId]: true }));
      
      const response = await fetch('/api/admin/student/assign-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          courseId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh students to get updated data
        fetchStudents();
        toast.success('Course assigned successfully!');
      } else {
        toast.error(data.error || 'Failed to assign course');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const viewStudentProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const openCourseAssignment = (student: Student) => {
    setSelectedStudent(student);
    setSelectedCourseId('');
    setShowCourseModal(true);
  };

  const openPasswordReset = (student: Student) => {
    setSelectedStudent(student);
    setShowPasswordModal(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-50 text-red-700 border-red-200';
      case 'EMPLOYEE': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MENTOR': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'STUDENT': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const activeStudents = students.filter(s => s.isActive).length;
  const inactiveStudents = students.filter(s => !s.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage students and track their progress</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  console.log('Add Student button clicked');
                  // Add student modal logic here
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center cursor-pointer"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Student
              </button>
              <Button 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={fetchStudents}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{activeStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  <UserX className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactive Students</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{inactiveStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {students.reduce((sum, student) => sum + student.enrolledCourses.length, 0)}
                  </p>
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
                    placeholder="Search by name, email, phone..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>Select status</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <Select value={filters.course} onValueChange={(value) => setFilters(prev => ({ ...prev, course: value }))}>
                  <SelectTrigger className="w-full border-gray-200 text-sm">
                    <SelectValue>Select course</SelectValue>
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

        {/* Students Table */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-gray-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900">All Students</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                  {filteredStudents.length} Total
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</TableHead>
                    <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-xs text-gray-500">{student.email}</div>
                            {student.phone && (
                              <div className="text-xs text-gray-500">{student.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(student.role)}>
                            {student.role}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${
                            student.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          {student.enrolledCourses.map((course, index) => (
                            <div key={course.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{course.courseName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {course.category}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-gray-600">{course.progress}%</span>
                              </div>
                              {course.completedAt && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          {student.enrolledCourses.map((course, index) => (
                            <div key={course.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                {course.completedAt ? (
                                  <Award className="w-4 h-4 text-green-600" />
                                ) : course.progress > 0 ? (
                                  <Play className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Pause className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-700">
                                  {course.completedAt ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewStudentProfile(student)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Profile
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCourseAssignment(student)}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <BookOpen className="w-4 h-4 mr-1" />
                            Assign Course
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPasswordReset(student)}
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Reset Password
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStudentStatus(student.id, !student.isActive)}
                            className={student.isActive 
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                            }
                            disabled={actionLoading[student.id]}
                          >
                            {actionLoading[student.id] ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : student.isActive ? (
                              <Lock className="w-4 h-4 mr-1" />
                            ) : (
                              <Unlock className="w-4 h-4 mr-1" />
                            )}
                            {student.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or check back later for new students.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Loading students...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowProfileModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Student Profile</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProfileModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{selectedStudent.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <Badge className={getRoleColor(selectedStudent.role)}>
                          {selectedStudent.role}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <Badge className={selectedStudent.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                          {selectedStudent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                      </div>
                      {selectedStudent.lastLogin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Last Login</label>
                          <p className="text-gray-900">{new Date(selectedStudent.lastLogin).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h3>
                    <div className="space-y-3">
                      {selectedStudent.enrolledCourses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{course.courseName}</span>
                              <Badge variant="outline" className="text-xs">
                                {course.category}
                              </Badge>
                            </div>
                            <Badge className={
                              course.completedAt 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : course.progress > 0 
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                            }>
                              {course.completedAt ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm text-gray-600">
                              Progress: {course.progress}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            {course.completedAt && (
                              <div className="text-sm text-green-600 mt-2">
                                Completed on {new Date(course.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                      </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Assignment Modal */}
      {showCourseModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCourseModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Assign Course</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCourseModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <p className="text-gray-900 font-medium">{selectedStudent.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Course</label>
                    <div className="text-xs text-gray-400 mb-2">
                      Loaded courses: {courses.length}
                    </div>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
                    >
                      <option value="">Choose a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id} className="text-white">
                          {course.title} ({course.category})
                        </option>
                      ))}
                    </select>
                    {courses.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">No courses available to assign</p>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      if (selectedCourseId && selectedStudent) {
                        assignCourse(selectedStudent.id, selectedCourseId);
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!selectedCourseId}
                  >
                    Assign Course
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPasswordModal(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                    <p className="text-gray-900 font-medium">{selectedStudent.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <Button
                    onClick={() => resetStudentPassword(selectedStudent.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!newPassword || newPassword.length < 6}
                  >
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
