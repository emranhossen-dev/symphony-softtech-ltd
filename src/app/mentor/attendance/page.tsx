'use client';

import { useState } from 'react';
import { Users, UserCheck, UserX, BookOpen } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'not-marked';
}

interface Course {
  id: string;
  name: string;
  students: Student[];
}

export default function MentorAttendance() {
  const [selectedCourse, setSelectedCourse] = useState<string>('1');
  
  const courses: Course[] = [
    {
      id: '1',
      name: 'Web Development Basics',
      students: [
        { id: '1', name: 'John Doe', status: 'not-marked' },
        { id: '2', name: 'Jane Smith', status: 'not-marked' },
        { id: '3', name: 'Mike Johnson', status: 'not-marked' },
        { id: '4', name: 'Sarah Wilson', status: 'not-marked' },
        { id: '5', name: 'Tom Brown', status: 'not-marked' },
        { id: '6', name: 'Alice Davis', status: 'not-marked' },
        { id: '7', name: 'Bob Miller', status: 'not-marked' },
        { id: '8', name: 'Charlie Garcia', status: 'not-marked' }
      ]
    },
    {
      id: '2',
      name: 'React Advanced Concepts',
      students: [
        { id: '9', name: 'Diana Martinez', status: 'not-marked' },
        { id: '10', name: 'Eva Rodriguez', status: 'not-marked' },
        { id: '11', name: 'Frank Lopez', status: 'not-marked' },
        { id: '12', name: 'Grace Chen', status: 'not-marked' },
        { id: '13', name: 'Henry Wilson', status: 'not-marked' }
      ]
    },
    {
      id: '3',
      name: 'Node.js Backend Development',
      students: [
        { id: '14', name: 'Iris Thompson', status: 'not-marked' },
        { id: '15', name: 'Jack Anderson', status: 'not-marked' },
        { id: '16', name: 'Kate Taylor', status: 'not-marked' },
        { id: '17', name: 'Leo Martinez', status: 'not-marked' },
        { id: '18', name: 'Maya Patel', status: 'not-marked' },
        { id: '19', name: 'Nathan Lee', status: 'not-marked' }
      ]
    },
    {
      id: '4',
      name: 'Python Programming',
      students: [
        { id: '20', name: 'Olivia Brown', status: 'not-marked' },
        { id: '21', name: 'Peter Davis', status: 'not-marked' },
        { id: '22', name: 'Quinn Garcia', status: 'not-marked' },
        { id: '23', name: 'Rachel Kim', status: 'not-marked' }
      ]
    }
  ];

  const [courseStudents, setCourseStudents] = useState<Student[]>(courses[0].students);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setCourseStudents(course.students);
    }
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent') => {
    setCourseStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status }
          : student
      )
    );
    // TODO: Implement DB save logic
    console.log(`Marked student ${studentId} as ${status}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Mark and track student attendance for your courses.</p>
      </div>

      {/* Course Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-6 pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {courseStudents.filter(s => s.status === 'present').length}
              </div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {courseStudents.filter(s => s.status === 'absent').length}
              </div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {courseStudents.filter(s => s.status === 'not-marked').length}
              </div>
              <div className="text-sm text-gray-600">Not Marked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Student List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courseStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => markAttendance(student.id, 'present')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          student.status === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, 'absent')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          student.status === 'absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
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

      {/* Empty State */}
      {courseStudents.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">This course doesn't have any enrolled students.</p>
        </div>
      )}
    </div>
  );
}
