'use client';

import { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Users, BarChart3, Filter, Search, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  sessionId: string;
  sessionDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  markedBy: string;
  createdAt: string;
}

interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  isActive: boolean;
}

interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  monthlyTrend: Array<{
    month: string;
    percentage: number;
  }>;
}

export default function AttendanceSystem() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mark' | 'records' | 'sessions' | 'analytics'>('mark');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>('all');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [bulkAttendance, setBulkAttendance] = useState<{[key: string]: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'}>({});
  const [sessionNotes, setSessionNotes] = useState('');
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, statusFilter, searchTerm]);

  const fetchAttendanceData = async () => {
    try {
      const [recordsResponse, sessionsResponse, statsResponse] = await Promise.all([
        fetch(`/api/attendance/records?date=${selectedDate}&status=${statusFilter}&search=${searchTerm}`),
        fetch(`/api/attendance/sessions?date=${selectedDate}`),
        fetch(`/api/attendance/stats`)
      ]);

      const [recordsData, sessionsData, statsData] = await Promise.all([
        recordsResponse.json(),
        sessionsResponse.json(),
        statsResponse.json()
      ]);

      setAttendanceRecords(recordsData.records || []);
      setAttendanceSessions(sessionsData.sessions || []);
      setAttendanceStats(statsData.stats || null);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedSession) return;

    setIsMarking(true);
    try {
      const attendanceData = Object.entries(bulkAttendance).map(([studentId, status]) => ({
        studentId,
        sessionId: selectedSession.id,
        status,
        notes: status === 'LATE' ? 'Late arrival' : status === 'EXCUSED' ? 'Excused absence' : undefined
      }));

      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          records: attendanceData,
          notes: sessionNotes
        })
      });

      if (response.ok) {
        toast.success('Attendance marked successfully!');
        setShowMarkModal(false);
        setBulkAttendance({});
        setSessionNotes('');
        setSelectedSession(null);
        fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setIsMarking(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          courseId: 'course-id', // This would come from course selection
          startTime: new Date().toTimeString().slice(0, 5),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5)
        })
      });

      if (response.ok) {
        toast.success('Session created successfully!');
        fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/attendance/sessions/${sessionId}/end`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Session ended successfully!');
        fetchAttendanceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  const openMarkModal = (session: AttendanceSession) => {
    setSelectedSession(session);
    setShowMarkModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="w-4 h-4" />;
      case 'ABSENT': return <XCircle className="w-4 h-4" />;
      case 'LATE': return <Clock className="w-4 h-4" />;
      case 'EXCUSED': return <AlertCircle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance System</h1>
          <p className="text-gray-600 mt-1">Mark and track student attendance</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleCreateSession}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Create Session
          </button>
          <button
            onClick={fetchAttendanceData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {attendanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{attendanceStats.absentCount}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{attendanceStats.lateCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{attendanceStats.attendancePercentage}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'mark', label: 'Mark Attendance', icon: UserCheck },
              { id: 'records', label: 'Attendance Records', icon: BarChart3 },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          {/* Mark Attendance Tab */}
          {activeTab === 'mark' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Sessions</h3>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Date: {selectedDate}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{session.courseName}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Time: {session.startTime} - {session.endTime}</p>
                      <p>Students: {session.presentCount}/{session.totalStudents}</p>
                      <p>Attendance: {session.attendanceRate}%</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => openMarkModal(session)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Mark Attendance
                      </button>
                      {session.isActive && (
                        <button
                          onClick={() => handleEndSession(session.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          End Session
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students or courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="EXCUSED">Excused</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    const csv = filteredRecords.map(record => 
                      `${record.studentName},${record.courseName},${record.sessionDate},${record.status},${record.checkInTime || ''}`
                    ).join('\n');
                    const blob = new Blob([`Student Name,Course,Date,Status,Check-in Time\n${csv}`], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `attendance-${selectedDate}.csv`;
                    a.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.courseName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.sessionDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.checkInTime || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1">{record.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{record.notes || '-'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{session.courseName}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Completed'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Date: {session.date}</p>
                      <p>Time: {session.startTime} - {session.endTime}</p>
                      <p>Attendance: {session.presentCount}/{session.totalStudents} ({session.attendanceRate}%)</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => openMarkModal(session)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        View Details
                      </button>
                      {session.isActive && (
                        <button
                          onClick={() => handleEndSession(session.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          End
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && attendanceStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Sessions</span>
                      <span className="font-semibold">{attendanceStats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overall Attendance Rate</span>
                      <span className="font-semibold text-green-600">{attendanceStats.attendancePercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Present Count</span>
                      <span className="font-semibold text-green-600">{attendanceStats.presentCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Absent Count</span>
                      <span className="font-semibold text-red-600">{attendanceStats.absentCount}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
                  <div className="space-y-2">
                    {attendanceStats.monthlyTrend.map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-gray-600">{month.month}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${month.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{month.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Mark Attendance - {selectedSession.courseName}</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Date: {selectedSession.date}</p>
              <p className="text-sm text-gray-600">Time: {selectedSession.startTime} - {selectedSession.endTime}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Notes</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes for this session..."
              />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">Students</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Mock student data - in real app, fetch from API */}
                {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'Tom Brown', 'Emily Davis'].map((studentName, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{studentName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBulkAttendance({ ...bulkAttendance, [index.toString()]: 'PRESENT' })}
                        className={`px-2 py-1 text-xs rounded ${
                          bulkAttendance[index.toString()] === 'PRESENT'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setBulkAttendance({ ...bulkAttendance, [index.toString()]: 'ABSENT' })}
                        className={`px-2 py-1 text-xs rounded ${
                          bulkAttendance[index.toString()] === 'ABSENT'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => setBulkAttendance({ ...bulkAttendance, [index.toString()]: 'LATE' })}
                        className={`px-2 py-1 text-xs rounded ${
                          bulkAttendance[index.toString()] === 'LATE'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setBulkAttendance({ ...bulkAttendance, [index.toString()]: 'EXCUSED' })}
                        className={`px-2 py-1 text-xs rounded ${
                          bulkAttendance[index.toString()] === 'EXCUSED'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Excused
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMarkModal(false);
                  setSelectedSession(null);
                  setBulkAttendance({});
                  setSessionNotes('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={isMarking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isMarking ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
