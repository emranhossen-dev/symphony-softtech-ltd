'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Calendar, Users, UserCheck, UserX } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceSession {
  id: string;
  sessionDate: string;
  title?: string | null;
  description?: string | null;
}

interface Course {
  id: string;
  title: string;
  enrollments: {
    user: Student;
  }[];
  attendanceSessions: AttendanceSession[];
}

interface AttendancePanelProps {
  courses: Course[];
}

export default function AttendancePanel({ courses }: AttendancePanelProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkAttendance = async (studentId: string, status: 'PRESENT' | 'ABSENT') => {
    if (!selectedSession) return;

    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));

    try {
      const response = await fetch('/api/mentor/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          studentId: studentId,
          status: status
        }),
      });

      if (!response.ok) {
        // Revert on error
        setAttendance(prev => {
          const newAttendance = { ...prev };
          delete newAttendance[studentId];
          return newAttendance;
        });
        throw new Error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    // Check if we have a pending status
    if (attendance[studentId]) {
      return attendance[studentId];
    }

    // Check existing attendance for this session
    if (selectedSession) {
      // This would be fetched from the session data
      // For now, we'll return null to show unmarked status
      return null;
    }

    return null;
  };

  const getAttendanceCount = () => {
    if (!selectedCourse || !selectedSession) return { present: 0, absent: 0, total: 0 };

    const students = selectedCourse.enrollments;
    const present = Object.values(attendance).filter(status => status === 'PRESENT').length;
    const absent = Object.values(attendance).filter(status => status === 'ABSENT').length;
    
    return { present, absent, total: students.length };
  };

  const counts = getAttendanceCount();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Mark and manage student attendance for your courses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Course</h2>
              <div className="space-y-2">
                {courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedSession(null);
                      setAttendance({});
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCourse?.id === course.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-500">
                      {course.enrollments.length} students • {course.attendanceSessions.length} sessions
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Management */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <>
                {/* Session Selection */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Session</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCourse.attendanceSessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setSelectedSession(session);
                          setAttendance({});
                        }}
                        className={`p-4 rounded-lg border transition-colors ${
                          selectedSession?.id === session.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {new Date(session.sessionDate).toLocaleDateString()}
                          </span>
                        </div>
                        {session.title && (
                          <div className="text-sm text-gray-600">{session.title}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attendance Table */}
                {selectedSession && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mark Attendance
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">{counts.present}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserX className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-medium">{counts.absent}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600 font-medium">{counts.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedCourse.enrollments.map(enrollment => {
                            const status = getAttendanceStatus(enrollment.user.id);
                            return (
                              <tr key={enrollment.user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {enrollment.user.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {enrollment.user.email}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  {status === 'PRESENT' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Present
                                    </span>
                                  )}
                                  {status === 'ABSENT' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Absent
                                    </span>
                                  )}
                                  {!status && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Not Marked
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleMarkAttendance(enrollment.user.id, 'PRESENT')}
                                      disabled={status === 'PRESENT'}
                                      className={`p-2 rounded-lg transition-colors ${
                                        status === 'PRESENT'
                                          ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-600'
                                      }`}
                                      title="Mark as Present"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleMarkAttendance(enrollment.user.id, 'ABSENT')}
                                      disabled={status === 'ABSENT'}
                                      className={`p-2 rounded-lg transition-colors ${
                                        status === 'ABSENT'
                                          ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                                      }`}
                                      title="Mark as Absent"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Selected</h3>
                <p className="text-gray-500">Select a course to start managing attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
