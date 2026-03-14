'use client';

import { User, Mail, Phone, MapPin, Calendar, Briefcase, Award, Edit } from 'lucide-react';

export default function EmployeeProfile() {
  const employeeInfo = {
    name: 'Michael Davis',
    email: 'michael.davis@trainingcentre.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    joinDate: 'March 2021',
    position: 'Enrollment Specialist',
    department: 'Student Services',
    bio: 'Dedicated enrollment specialist with 3+ years of experience in student counseling and course guidance. Passionate about helping students find the right educational path.',
    skills: ['Student Counseling', 'Communication', 'Course Guidance', 'CRM Management', 'Sales'],
    achievements: [
      'Top Performer - Q4 2023',
      '100+ Enrollments in 2023',
      'Best Customer Service Award 2022',
      'Employee of the Month - June 2023'
    ],
    stats: {
      totalEnrollments: 156,
      followUpsCompleted: 89,
      satisfactionRate: 4.7,
      yearsOfService: 3
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">View your personal information and work achievements.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-teal-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div className="ml-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{employeeInfo.name}</h2>
              <p className="text-gray-600">{employeeInfo.position}</p>
            </div>
            <button className="ml-auto mb-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{employeeInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{employeeInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{employeeInfo.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Joined {employeeInfo.joinDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{employeeInfo.department}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">
                {employeeInfo.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{employeeInfo.stats.totalEnrollments}</div>
          <div className="text-sm text-gray-600">Total Enrollments</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{employeeInfo.stats.followUpsCompleted}</div>
          <div className="text-sm text-gray-600">Follow-ups Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Award className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{employeeInfo.stats.satisfactionRate}</div>
          <div className="text-sm text-gray-600">Satisfaction Rate</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <User className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{employeeInfo.stats.yearsOfService}</div>
          <div className="text-sm text-gray-600">Years of Service</div>
        </div>
      </div>

      {/* Skills & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {employeeInfo.skills.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
          <div className="space-y-3">
            {employeeInfo.achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <Award className="w-5 h-5 text-yellow-500 mt-0.5" />
                <span className="text-gray-700">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Monthly Target</span>
              <span className="text-sm font-medium text-gray-900">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Follow-up Rate</span>
              <span className="text-sm font-medium text-gray-900">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-medium text-gray-900">94%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
