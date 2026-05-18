'use client';

import { BookOpen, FileText, Users, Calendar } from 'lucide-react';

export default function MentorDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your teaching activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assigned Courses Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
              <p className="text-sm text-gray-500 mt-1">2 active this semester</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Homework Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Homework</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Attendance Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Summary</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
              <p className="text-sm text-gray-500 mt-1">This week average</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Mark Attendance</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Review Homework</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">View Courses</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">New homework submission</p>
              <p className="text-sm text-gray-600">John Doe - Web Development Basics</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Attendance marked</p>
              <p className="text-sm text-gray-600">React Course - 15 students present</p>
            </div>
            <span className="text-sm text-gray-500">5 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Course assignment updated</p>
              <p className="text-sm text-gray-600">Advanced JavaScript - New module added</p>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
