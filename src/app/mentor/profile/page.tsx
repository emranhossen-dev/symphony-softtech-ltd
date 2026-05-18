'use client';

import { User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Edit } from 'lucide-react';

export default function MentorProfile() {
  const mentorInfo = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@trainingcentre.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2022',
    specialization: 'Web Development & React',
    bio: 'Experienced full-stack developer with over 10 years of industry experience. Passionate about teaching modern web technologies and helping students build real-world applications.',
    expertise: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Database Design'],
    education: [
      'Ph.D. in Computer Science - Stanford University',
      'M.S. in Software Engineering - MIT',
      'B.S. in Computer Science - UC Berkeley'
    ],
    stats: {
      coursesTaught: 12,
      studentsMentored: 245,
      averageRating: 4.8,
      totalHours: 1200
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and view your teaching statistics.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div className="ml-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{mentorInfo.name}</h2>
              <p className="text-gray-600">{mentorInfo.specialization}</p>
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
                  <span className="text-gray-700">{mentorInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{mentorInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{mentorInfo.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Joined {mentorInfo.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">
                {mentorInfo.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{mentorInfo.stats.coursesTaught}</div>
          <div className="text-sm text-gray-600">Courses Taught</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <User className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{mentorInfo.stats.studentsMentored}</div>
          <div className="text-sm text-gray-600">Students Mentored</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Award className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{mentorInfo.stats.averageRating}</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{mentorInfo.stats.totalHours}</div>
          <div className="text-sm text-gray-600">Teaching Hours</div>
        </div>
      </div>

      {/* Expertise & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expertise */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {mentorInfo.expertise.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
          <div className="space-y-3">
            {mentorInfo.education.map((degree, index) => (
              <div key={index} className="flex items-start gap-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-700">{degree}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
