'use client';

import { useState } from 'react';
import { Calendar, User, MessageSquare, Edit, Clock, CheckCircle } from 'lucide-react';

interface FollowUp {
  id: string;
  studentName: string;
  lastNote: string;
  nextFollowUpDate: string;
  status: 'pending' | 'completed';
}

interface Student {
  id: string;
  name: string;
}

export default function EmployeeFollowUp() {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>('');

  const students: Student[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson' },
    { id: '5', name: 'Tom Brown' },
    { id: '6', name: 'Alice Davis' },
    { id: '7', name: 'Bob Miller' },
    { id: '8', name: 'Charlie Garcia' }
  ];

  const followUps: FollowUp[] = [
    {
      id: '1',
      studentName: 'John Doe',
      lastNote: 'Student interested in Web Development course, needs payment plan information',
      nextFollowUpDate: '2024-01-20',
      status: 'pending'
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      lastNote: 'Completed React Advanced Concepts enrollment, sent welcome email',
      nextFollowUpDate: '2024-01-18',
      status: 'completed'
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      lastNote: 'Follow up on Node.js Backend Development inquiry',
      nextFollowUpDate: '2024-01-19',
      status: 'pending'
    },
    {
      id: '4',
      studentName: 'Sarah Wilson',
      lastNote: 'Student needs clarification on course prerequisites',
      nextFollowUpDate: '2024-01-17',
      status: 'completed'
    },
    {
      id: '5',
      studentName: 'Tom Brown',
      lastNote: 'Discuss Python Programming course schedule and availability',
      nextFollowUpDate: '2024-01-21',
      status: 'pending'
    },
    {
      id: '6',
      studentName: 'Alice Davis',
      lastNote: 'Mobile App Development course demo scheduled for next week',
      nextFollowUpDate: '2024-01-22',
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completed
          </div>
        );
      default:
        return null;
    }
  };

  const handleSaveFollowUp = () => {
    console.log('Saving follow-up:', {
      studentId: selectedStudent,
      note,
      nextFollowUpDate
    });
    // TODO: Implement full CRM logic
    alert('Follow-up saved successfully!');
    
    // Reset form
    setSelectedStudent('');
    setNote('');
    setNextFollowUpDate('');
  };

  const handleEdit = (followUpId: string) => {
    console.log('Editing follow-up:', followUpId);
    // TODO: Implement edit functionality
    alert(`Editing follow-up ${followUpId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Follow-up Management</h1>
        <p className="text-gray-600 mt-1">Schedule and track student follow-ups.</p>
      </div>

      {/* Add Follow-up Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Add New Follow-up</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Next Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Follow-up Date
            </label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Note Textarea */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Enter follow-up note..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveFollowUp}
            disabled={!selectedStudent || !note || !nextFollowUpDate}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Calendar className="w-4 h-4" />
            Save Follow-up
          </button>
        </div>
      </div>

      {/* Follow-up History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Follow-up History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next follow-up date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {followUps.map((followUp) => (
                <tr key={followUp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {followUp.studentName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {followUp.lastNote}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(followUp.nextFollowUpDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(followUp.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(followUp.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {followUps.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No follow-ups scheduled</h3>
          <p className="text-gray-600">No follow-ups have been scheduled yet.</p>
        </div>
      )}
    </div>
  );
}
