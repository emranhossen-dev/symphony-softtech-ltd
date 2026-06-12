'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, BookOpen, RefreshCw, Loader2, CalendarCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledCourses: Array<{
    id: string;
    name: string;
    category: string;
    progress: number;
    enrolledAt?: string;
  }>;
  isActive: boolean;
}

interface AttendanceStatus {
  [studentId: string]: 'present' | 'absent' | 'not-marked';
}

interface Course {
  id: string;
  name: string;
  category: string;
}

export default function MentorAttendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourseId && selectedDate && students.length > 0) {
      const loadExistingAttendance = async () => {
        try {
          const res = await fetch(`/api/mentor/attendance?courseId=${selectedCourseId}&date=${selectedDate}`, {
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              const init: AttendanceStatus = {};
              students.forEach((s) => {
                init[s.id] = 'not-marked';
              });
              data.records.forEach((record: any) => {
                init[record.studentId] = record.status.toLowerCase() as 'present' | 'absent';
              });
              setAttendance(init);
            }
          }
        } catch (err) {
          console.error('Failed to load existing attendance:', err);
        }
      };
      loadExistingAttendance();
    }
  }, [selectedCourseId, selectedDate, students]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes] = await Promise.allSettled([
        fetch('/api/mentor/courses', { credentials: 'include' }),
        fetch('/api/mentor/students', { credentials: 'include' }),
      ]);

      let fetchedCourses: Course[] = [];
      if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
        const data = await coursesRes.value.json();
        if (data.success) {
          fetchedCourses = data.courses.map((c: any) => ({
            id: c.id,
            name: c.name,
            category: c.category,
          }));
          setCourses(fetchedCourses);
          if (fetchedCourses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(fetchedCourses[0].id);
          }
        }
      }

      if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
        const data = await studentsRes.value.json();
        if (data.success) {
          setStudents(data.students);
          // Initialise attendance as not-marked for all students
          const init: AttendanceStatus = {};
          data.students.forEach((s: Student) => {
            init[s.id] = 'not-marked';
          });
          setAttendance(init);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const studentsInCourse = selectedCourseId
    ? students.filter(s => s.enrolledCourses.some(c => c.id === selectedCourseId))
    : students;

  const mark = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: 'present' | 'absent') => {
    const updated: AttendanceStatus = { ...attendance };
    studentsInCourse.forEach(s => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  const handleSave = async () => {
    const records = studentsInCourse
      .filter(s => attendance[s.id] !== 'not-marked')
      .map(s => ({
        studentId: s.id,
        courseId: selectedCourseId,
        date: selectedDate,
        status: attendance[s.id] === 'present' ? 'PRESENT' : 'ABSENT',
      }));

    if (records.length === 0) {
      toast.error('Please mark attendance for at least one student.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/mentor/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ records }),
      });

      if (res.ok) {
        toast.success('Attendance saved successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save attendance');
      }
    } catch (err) {
      console.error('Error saving attendance:', err);
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = studentsInCourse.filter(s => attendance[s.id] === 'present').length;
  const absentCount = studentsInCourse.filter(s => attendance[s.id] === 'absent').length;
  const notMarkedCount = studentsInCourse.filter(s => attendance[s.id] === 'not-marked').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-gray-400">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance Management</h1>
          <p className="text-gray-400 mt-1">Mark and track student attendance for your courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving || studentsInCourse.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Course selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <BookOpen className="w-4 h-4 inline mr-1 text-purple-400" />
              Select Course
            </label>
            {courses.length === 0 ? (
              <p className="text-gray-400 text-sm">No courses assigned to you yet.</p>
            ) : (
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: '#1a1f4c' }}>
                    {c.name} — {c.category}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1 text-purple-400" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{presentCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{absentCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{notMarkedCount}</div>
            <div className="text-xs text-gray-400 mt-0.5">Not Marked</div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => markAll('present')}
              className="px-3 py-1.5 text-xs font-medium bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll('absent')}
              className="px-3 py-1.5 text-xs font-medium bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Student list */}
      {studentsInCourse.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No students found</h3>
          <p className="text-gray-400">
            {courses.length === 0
              ? 'No courses are assigned to you yet.'
              : 'No students are enrolled in this course.'}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Student List
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({studentsInCourse.length} student{studentsInCourse.length !== 1 ? 's' : ''})
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {studentsInCourse.map(student => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {student.firstName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attendance[student.id] === 'present' ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/15 border border-green-500/30 text-green-300 text-xs rounded-full w-fit font-medium">
                          <UserCheck className="w-3 h-3" />
                          Present
                        </span>
                      ) : attendance[student.id] === 'absent' ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-full w-fit font-medium">
                          <UserX className="w-3 h-3" />
                          Absent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/15 border border-gray-500/30 text-gray-400 text-xs rounded-full w-fit font-medium">
                          Not Marked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => mark(student.id, 'present')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            attendance[student.id] === 'present'
                              ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                              : 'bg-green-500/15 text-green-300 hover:bg-green-500/25 border border-green-500/20'
                          }`}
                        >
                          <UserCheck className="w-4 h-4" />
                          Present
                        </button>
                        <button
                          onClick={() => mark(student.id, 'absent')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            attendance[student.id] === 'absent'
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                              : 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20'
                          }`}
                        >
                          <UserX className="w-4 h-4" />
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
