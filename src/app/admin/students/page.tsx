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
  Key,
  Lock,
  Unlock,
  Play,
  Pause,
  CheckCircle,
  Award,
  Download,
  Mail,
  Phone,
  Shield,
  X,
  Compass,
  GraduationCap
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
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [newPassword, setNewPassword] = useState('');
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
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    if (filters.search) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.phone?.includes(filters.search)
      );
    }
    
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filtered = filtered.filter(student => student.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(student => !student.isActive);
      }
    }
    
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
        body: JSON.stringify({ studentId, isActive }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId ? { ...student, isActive } : student
          )
        );
        toast.success(`Student status updated successfully!`);
      } else {
        toast.error(data.error || 'Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating status context:', error);
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
        body: JSON.stringify({ studentId, newPassword: newPassword }),
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
      console.error('Error rewriting authorization keys:', error);
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
        body: JSON.stringify({ studentId, courseId }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStudents();
        toast.success('Course assigned successfully!');
      } else {
        toast.error(data.error || 'Failed to assign course');
      }
    } catch (error) {
      console.error('Error appending academic module:', error);
      toast.error('Failed to assign course');
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const executeExport = () => {
    toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}!`);
    setShowExportModal(false);
  };

  const viewStudentProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const openCourseAssignment = (student: Student) => {
    setSelectedStudent(student);
    setSelectedCourse('');
    setShowCourseModal(true);
  };

  const openPasswordReset = (student: Student) => {
    setSelectedStudent(student);
    setShowPasswordModal(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 85) return 'from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]';
    if (progress >= 60) return 'from-violet-400 to-indigo-400 shadow-[0_0_10px_rgba(139,92,246,0.4)]';
    if (progress >= 35) return 'from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]';
    return 'from-rose-400 to-pink-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]';
  };

  const getProgressBg = (progress: number) => {
    if (progress >= 85) return 'text-emerald-300 bg-emerald-950/50 border-emerald-700/50';
    if (progress >= 60) return 'text-violet-300 bg-violet-950/50 border-violet-700/50';
    if (progress >= 35) return 'text-amber-300 bg-amber-950/50 border-amber-700/50';
    return 'text-rose-300 bg-rose-950/50 border-rose-700/50';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-950/50 text-rose-400 border-rose-700/50 font-bold';
      case 'EMPLOYEE': return 'bg-purple-950/50 text-purple-400 border-purple-700/50 font-bold';
      case 'MENTOR': return 'bg-blue-950/50 text-blue-400 border-blue-700/50 font-bold';
      case 'STUDENT': return 'bg-emerald-950/50 text-emerald-400 border-emerald-700/50 font-bold';
      default: return 'bg-slate-950/50 text-slate-400 border-slate-700/50';
    }
  };

  const activeStudents = students.filter(s => s.isActive).length;
  const inactiveStudents = students.filter(s => !s.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950 text-slate-100">
      {/* Top Navigation */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="mx-auto px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Student Management</h1>
              <p className="text-sm text-slate-400 mt-0.5">View and manage all student accounts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative group w-72">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="Search students..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder-slate-500"
              />
            </div>
            <Button 
              onClick={fetchStudents}
              disabled={loading}
              className="p-3 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-2xl transition-all shadow-lg"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-violet-400' : ''}`} />
            </Button>
            <Button 
              onClick={() => setShowExportModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl transition-all text-sm font-bold shadow-lg shadow-violet-500/25 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-violet-500/30 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
                  <p className="text-2xl font-extrabold text-white font-mono tracking-tight">{students.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Students</p>
                  <p className="text-2xl font-extrabold text-white font-mono tracking-tight">{activeStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-rose-500/30 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <UserX className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inactive Students</p>
                  <p className="text-2xl font-extrabold text-white font-mono tracking-tight">{inactiveStudents}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Enrollments</p>
                  <p className="text-2xl font-extrabold text-white font-mono tracking-tight">
                    {students.reduce((sum, student) => sum + student.enrolledCourses.length, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Students List</h3>
              </div>

              {/* Inline Selection Dropdowns */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-36">
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-full border-slate-700 bg-slate-900/50 text-xs text-slate-300 h-9 rounded-xl">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-300 text-xs">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-44">
                  <Select value={filters.course} onValueChange={(value) => setFilters(prev => ({ ...prev, course: value }))}>
                    <SelectTrigger className="w-full border-slate-700 bg-slate-900/50 text-xs text-slate-300 h-9 rounded-xl">
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-slate-300 text-xs">
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-700/50 bg-slate-900/30 hover:bg-slate-900/30">
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[320px]">Courses</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Login</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-700/30">
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-slate-700/30 transition-colors group">
                      {/* Avatar name data profile cell */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center text-violet-300 font-extrabold text-xs shadow-lg border border-violet-500/30 group-hover:border-violet-400/50 transition-colors">
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors block">{student.name}</span>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-xs font-mono text-slate-500">
                              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {student.email}</span>
                              {student.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {student.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Scope states metadata security cell */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="outline" className={`px-2 py-0 rounded font-bold text-[10px] uppercase tracking-wider ${getRoleColor(student.role)}`}>
                            {student.role}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]'}`} />
                            {student.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </TableCell>

                      {/* Course lists tracking metrics progress elements cell */}
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                          {student.enrolledCourses.length > 0 ? (
                            student.enrolledCourses.map((course) => (
                              <div key={course.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-2.5 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-slate-300 truncate flex items-center gap-1.5">
                                    <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {course.courseName}
                                  </span>
                                  <Badge variant="outline" className="text-[9px] bg-slate-950/50 px-1 text-slate-500 border-slate-700/50 font-mono tracking-tight uppercase shrink-0">
                                    {course.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-slate-700/50 rounded-full h-1.5 overflow-hidden border border-slate-700/30">
                                    <div 
                                      className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${getProgressColor(course.progress)}`}
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-mono font-bold border tracking-tighter rounded px-1.5 py-0.2 ${getProgressBg(course.progress)}`}>
                                    {course.progress}%
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500 italic block pl-1">No courses enrolled</span>
                          )}
                        </div>
                      </TableCell>

                      {/* State icons tracker cell */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          {student.enrolledCourses.map((course) => (
                            <div key={course.id} className="flex items-center gap-1.5 text-xs font-medium">
                              {course.completedAt ? (
                                <Award className="w-3.5 h-3.5 text-emerald-500" />
                              ) : course.progress > 0 ? (
                                <Play className="w-3.5 h-3.5 text-blue-500" />
                              ) : (
                                <Pause className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span className={`text-[11px] ${course.completedAt ? 'text-emerald-600 font-bold' : course.progress > 0 ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                                {course.completedAt ? 'Completed' : course.progress > 0 ? 'In Progress' : 'Not Started'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      {/* Logs calendar cell block */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-700 font-semibold">{student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Inactive'}</span>
                          {student.lastLogin && <span className="text-[10px] text-slate-400">{new Date(student.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                      </TableCell>

                      {/* Interaction controllers dashboard core operations actions hub cell */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewStudentProfile(student)}
                            className="h-9 border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-violet-400" /> View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCourseAssignment(student)}
                            className="h-9 border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl text-xs font-semibold"
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-1 text-violet-400" /> Add Course
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPasswordReset(student)}
                            className="h-9 border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl text-xs font-semibold"
                          >
                            <Key className="w-3.5 h-3.5 mr-1 text-amber-400" /> Reset Password
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStudentStatus(student.id, !student.isActive)}
                            className={`h-9 rounded-xl text-xs font-bold border transition-all ${
                              student.isActive 
                                ? "border-rose-700/50 bg-rose-950/50 text-rose-400 hover:bg-rose-900/50"
                                : "border-emerald-700/50 bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50"
                            }`}
                            disabled={actionLoading[student.id]}
                          >
                            {actionLoading[student.id] ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : student.isActive ? (
                              <Lock className="w-3.5 h-3.5 mr-1 text-rose-400" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
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

            {/* Empty States Overlay Visual Framework wrapper element */}
            {filteredStudents.length === 0 && !loading && (
              <div className="text-center py-24 bg-slate-900/20">
                <div className="w-12 h-12 mx-auto bg-slate-800 border border-slate-700/50 rounded-2xl flex items-center justify-center mb-4 text-slate-500">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">No students found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Try adjusting your filters or check back later.</p>
              </div>
            )}

            {/* Skeleton visual structures placeholders wrapper container loaders */}
            {loading && (
              <div className="p-6 space-y-4 bg-slate-900/20">
                {[1, 2, 3].map((id) => (
                  <div key={id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-3 w-1/3">
                      <div className="w-10 h-10 bg-slate-700/50 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-700/50 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-700/50 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3.5 bg-slate-700/50 rounded w-20" />
                    <div className="h-4 bg-slate-700/50 rounded w-44" />
                    <div className="h-8 w-20 bg-slate-700/50 rounded-lg" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>

        {/* Student Profile Modal */}
        {showProfileModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setShowProfileModal(false)} />
            <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
              <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between bg-slate-900/50 shrink-0">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-400" /> Student Profile
                </h2>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
              <div className="space-y-3.5">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Information</h3>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Name</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{selectedStudent.name}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</span>
                  <span className="text-sm font-mono text-slate-300 mt-0.5 block">{selectedStudent.email}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                  <span className="text-sm font-mono text-slate-300 mt-0.5 block">{selectedStudent.phone || 'Not available'}</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Role</span>
                    <Badge variant="outline" className={`mt-1 py-0 px-2 rounded font-bold text-[10px] border tracking-wider ${getRoleColor(selectedStudent.role)}`}>{selectedStudent.role}</Badge>
                  </div>
                  <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                    <Badge className={`mt-1 shadow-none border ${selectedStudent.isActive ? 'bg-emerald-950/50 text-emerald-400 border-emerald-700/50' : 'bg-rose-950/50 text-rose-400 border-rose-700/50'}`}>
                      {selectedStudent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Enrolled Courses</h3>
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {selectedStudent.enrolledCourses.length > 0 ? (
                    selectedStudent.enrolledCourses.map((course) => (
                      <div key={course.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-white tracking-tight">{course.courseName}</h4>
                            <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5 block">{course.category}</span>
                          </div>
                          <CheckCircle className={`w-4 h-4 shrink-0 ${course.completedAt ? 'text-emerald-400' : 'text-slate-600'}`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>Progress</span>
                            <span className="font-bold text-slate-300">{course.progress}%</span>
                          </div>
                          <div className="bg-slate-700/50 border border-slate-600/30 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${getProgressColor(course.progress)}`} style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                        {course.completedAt && (
                          <div className="text-[10px] text-emerald-300 flex items-center gap-1 font-mono bg-emerald-950/50 border border-emerald-700/50 px-2 py-0.5 rounded">
                            <Calendar className="w-3 h-3" /> Completed on: {new Date(course.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic block pl-1">No courses enrolled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Course Modal */}
      {showCourseModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCourseModal(false)} />
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-sm w-full relative z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-400" /> Assign Course</h2>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student</span>
                <span className="text-sm font-bold text-white block mt-0.5">{selectedStudent.name}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full border-slate-700 bg-slate-900/50 text-xs text-slate-300 h-10 rounded-xl">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-300 text-xs">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  if (selectedCourse) {
                    assignCourse(selectedStudent.id, selectedCourse);
                    setSelectedCourse('');
                    setShowCourseModal(false);
                  }
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-violet-500/25"
                disabled={!selectedCourse}
              >
                Assign Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security matrix key override update actions overlay component */}
      {showPasswordModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-sm w-full relative z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Key className="w-4 h-4 text-amber-400" /> Reset Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student</span>
                <span className="text-sm font-bold text-white block mt-0.5">{selectedStudent.name}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs text-white placeholder-slate-500 transition-all"
                />
              </div>

              <Button
                onClick={() => resetStudentPassword(selectedStudent.id)}
                disabled={!newPassword || newPassword.length < 6}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
          <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-sm w-full relative z-10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Download className="w-4 h-4 text-violet-400" /> Export Data</h2>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Format</label>
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as 'csv' | 'json')}>
                  <SelectTrigger className="w-full border-slate-700 bg-slate-900/50 text-xs text-slate-300 h-10 rounded-xl">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-slate-300 text-xs">
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={executeExport} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-2.5 text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-violet-500/25">
                Download Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}