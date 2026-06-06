'use client';

import { useState, useEffect } from 'react';
import { useOptimizedParallelFetch } from '@/hooks/useOptimizedFetch';
import { BookOpen, Users, FileText, Calendar, Video, VideoOff, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Award, MessageSquare, Eye, Edit, Trash2, Download, Play, Pause, BarChart3, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  price: number;
  isActive: boolean;
  enrolledStudents: number;
  averageRating: number;
  completionRate: number;
  mentorId: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  enrolledCourses: Array<{
    id: string;
    name: string;
    category: string;
    enrolledAt: string;
    progress: number;
    lastActive: string;
  }>;
  totalProgress: number;
  averageRating: number;
  isActive: boolean;
}

interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  grade?: number;
  feedback?: string;
  files: Array<{
    name: string;
    language: string;
    size: number;
  }>;
  courseName: string;
}

interface LiveClass {
  id: string;
  title: string;
  courseName: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  participants: number;
  maxParticipants: number;
  meetingLink?: string;
}

interface DashboardData {
  courses: Course[];
  students: Student[];
  submissions: HomeworkSubmission[];
  classes: LiveClass[];
  records: AttendanceRecord[];
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  checkInTime?: string;
  notes?: string;
}

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'homework' | 'attendance' | 'live-classes'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<HomeworkSubmission | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'APPROVED' as 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION',
    grade: 0,
    feedback: ''
  });
  const [attendanceData, setAttendanceData] = useState<{[key: string]: 'PRESENT' | 'ABSENT' | 'LATE'}>({});

  // Use optimized parallel fetch for dashboard data
  const { data: dashboardData, loading, error, refetch } = useOptimizedParallelFetch<DashboardData>([
    '/api/mentor/courses',
    '/api/mentor/students',
    '/api/mentor/homework',
    '/api/mentor/live-classes',
    '/api/mentor/attendance'
  ], {
    showLoading: true,
    loadingMessage: 'Loading dashboard data...',
    cacheTime: 2 * 60 * 1000, // 2 minutes cache
    retryCount: 2
  });

  // Extract data from the parallel fetch response
  const courses = dashboardData?.[0]?.courses || [];
  const students = dashboardData?.[1]?.students || [];
  const homeworkSubmissions = dashboardData?.[2]?.submissions || [];
  const liveClasses = dashboardData?.[3]?.classes || [];
  const attendanceRecords = dashboardData?.[4]?.records || [];

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error('Failed to load dashboard data');
    }
  }, [error]);

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch('/api/mentor/homework/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          ...reviewData
        })
      });

      if (response.ok) {
        toast.success('Homework reviewed successfully!');
        setShowReviewModal(false);
        setSelectedSubmission(null);
        setReviewData({ status: 'APPROVED', grade: 0, feedback: '' });
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to review homework');
      }
    } catch (error) {
      console.error('Error reviewing homework:', error);
      toast.error('Failed to review homework');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        status,
        courseId: students.find(s => s.id === studentId)?.enrolledCourses[0]?.id || '',
        date: selectedDate,
        notes: status === 'LATE' ? 'Late arrival' : undefined
      }));

      const response = await fetch('/api/mentor/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: attendanceRecords })
      });

      if (response.ok) {
        toast.success('Attendance marked successfully!');
        setShowAttendanceModal(false);
        setAttendanceData({});
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const handleStartLiveClass = async (classId: string) => {
    try {
      const response = await fetch('/api/live-classes/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      });

      if (response.ok) {
        toast.success('Live class started successfully!');
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start class');
      }
    } catch (error) {
      console.error('Error starting live class:', error);
      toast.error('Failed to start live class');
    }
  };

  const handleEndLiveClass = async (classId: string) => {
    try {
      const response = await fetch('/api/live-classes/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      });

      if (response.ok) {
        toast.success('Live class ended successfully!');
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to end class');
      }
    } catch (error) {
      console.error('Error ending live class:', error);
      toast.error('Failed to end live class');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'NEEDS_REVISION': return 'bg-orange-100 text-orange-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-purple-100 text-purple-800';
      case 'LIVE': return 'bg-red-100 text-red-800';
      case 'ENDED': return 'bg-gray-500/20 text-gray-300';
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const openReviewModal = (submission: HomeworkSubmission) => {
    setSelectedSubmission(submission);
    setReviewData({
      status: 'APPROVED',
      grade: submission.grade || 0,
      feedback: submission.feedback || ''
    });
    setShowReviewModal(true);
  };

  const openAttendanceModal = () => {
    // Initialize attendance data for all students
    const initialAttendance: {[key: string]: 'PRESENT' | 'ABSENT' | 'LATE'} = {};
    students.forEach(student => {
      initialAttendance[student.id] = 'PRESENT';
    });
    setAttendanceData(initialAttendance);
    setShowAttendanceModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f4c 25%, #0d1b3e 50%, #1a1f4c 75%, #0a0e27 100%)', color: '#f1f5f9', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Mentor Dashboard</h1>
          <p className="text-gray-300 mt-1">Manage your courses, students, and live sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={openAttendanceModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Assigned Courses</p>
              <p className="text-2xl font-bold text-white">{courses.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Students</p>
              <p className="text-2xl font-bold text-white">{students.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">
                {homeworkSubmissions.filter(h => h.status === 'SUBMITTED').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
                <div className="glass-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Avg Progress</p>
              <p className="text-2xl font-bold text-purple-600">
                {students.length > 0 
                  ? Math.round(students.reduce((sum, s) => sum + s.totalProgress, 0) / students.length)
                  : 0
                }%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card">
        <div className="border-b border-white/10">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'homework', label: 'Homework', icon: FileText },
              { id: 'attendance', label: 'Attendance', icon: UserCheck }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {homeworkSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{submission.studentName}</p>
                          <p className="text-sm text-gray-300">{submission.homeworkTitle}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Upcoming Classes</h3>
                  <div className="space-y-3">
                    {liveClasses.filter(c => c.status === 'SCHEDULED').slice(0, 5).map((liveClass) => (
                      <div key={liveClass.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{liveClass.title}</p>
                          <p className="text-sm text-gray-300">{liveClass.courseName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(liveClass.scheduledAt).toLocaleDateString()} at {new Date(liveClass.scheduledAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartLiveClass(liveClass.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                      <p className="text-gray-300">{course.category}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-400">{course.enrolledStudents} students</span>
                        <span className="text-sm text-gray-400">{course.completionRate}% completion</span>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-400">{course.averageRating.toFixed(1)} rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-gray-300">{student.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-400">{student.enrolledCourses.length} courses</span>
                        <span className="text-sm text-gray-400">{student.totalProgress}% progress</span>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-400">{student.averageRating.toFixed(1)} rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Homework Tab */}
          {activeTab === 'homework' && (
            <div className="space-y-4">
              {homeworkSubmissions.map((submission) => (
                <div key={submission.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{submission.homeworkTitle}</h3>
                      <p className="text-gray-300">{submission.studentName}</p>
                      <p className="text-sm text-gray-400">{submission.courseName}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-400">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        {submission.grade && (
                          <span className="text-sm text-gray-400">Grade: {submission.grade}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === 'SUBMITTED' && (
                        <button
                          onClick={() => openReviewModal(submission)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                      )}
                      <button className="text-green-600 hover:text-green-800">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Attendance Records</h3>
                <p className="text-sm text-gray-300">Date: {selectedDate}</p>
              </div>
              {attendanceRecords
                .filter(record => record.date === selectedDate)
                .map((record) => (
                <div key={record.id} className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{record.studentName}</h3>
                      <p className="text-gray-300">{record.courseName}</p>
                      {record.checkInTime && (
                        <p className="text-sm text-gray-400">Check-in: {record.checkInTime}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Homework Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-modal rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Review Homework</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-300">Student: {selectedSubmission.studentName}</p>
                <p className="text-sm text-gray-300">Assignment: {selectedSubmission.homeworkTitle}</p>
                <p className="text-sm text-gray-300">Course: {selectedSubmission.courseName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Review Status</label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="NEEDS_REVISION">Needs Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Grade (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewData.grade}
                  onChange={(e) => setReviewData({ ...reviewData, grade: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Feedback</label>
                <textarea
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({ ...reviewData, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide detailed feedback..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-modal rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Mark Attendance - {selectedDate}</h2>
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div>
                    <p className="font-medium text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-300">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'PRESENT' })}
                      className={`px-3 py-1 rounded text-sm ${
                        attendanceData[student.id] === 'PRESENT'
                          ? 'bg-green-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'LATE' })}
                      className={`px-3 py-1 rounded text-sm ${
                        attendanceData[student.id] === 'LATE'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      onClick={() => setAttendanceData({ ...attendanceData, [student.id]: 'ABSENT' })}
                      className={`px-3 py-1 rounded text-sm ${
                        attendanceData[student.id] === 'ABSENT'
                          ? 'bg-red-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="px-4 py-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
