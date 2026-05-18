'use client';

import { Award, Download, Calendar, User, CheckCircle } from 'lucide-react';

interface Certificate {
  id: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  grade: string;
  duration: string;
  isDownloaded: boolean;
}

export default function StudentCertificates() {
  const certificates: Certificate[] = [
    {
      id: '1',
      courseName: 'Web Development Basics',
      completionDate: '2024-01-15',
      instructorName: 'Dr. Sarah Johnson',
      grade: 'A',
      duration: '8 weeks',
      isDownloaded: true
    },
    {
      id: '2',
      courseName: 'JavaScript Fundamentals',
      completionDate: '2023-12-20',
      instructorName: 'Prof. Mike Wilson',
      grade: 'A+',
      duration: '6 weeks',
      isDownloaded: true
    },
    {
      id: '3',
      courseName: 'React Advanced Concepts',
      completionDate: '2023-11-10',
      instructorName: 'Dr. Emily Chen',
      grade: 'B+',
      duration: '10 weeks',
      isDownloaded: false
    },
    {
      id: '4',
      courseName: 'CSS & Responsive Design',
      completionDate: '2023-10-05',
      instructorName: 'Prof. David Brown',
      grade: 'A',
      duration: '4 weeks',
      isDownloaded: false
    },
    {
      id: '5',
      courseName: 'HTML5 & Semantic Web',
      completionDate: '2023-09-15',
      instructorName: 'Dr. Lisa Anderson',
      grade: 'A-',
      duration: '3 weeks',
      isDownloaded: true
    }
  ];

  const handleDownload = (certificateId: string) => {
    console.log('Downloading certificate:', certificateId);
    // TODO: Implement actual download logic
    alert('Certificate downloaded successfully! (This is a dummy download)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-600 mt-1">View and download your course completion certificates.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{certificates.length}</p>
            </div>
            <Award className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Downloaded</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {certificates.filter(c => c.isDownloaded).length}
              </p>
            </div>
            <Download className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Download</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {certificates.filter(c => !c.isDownloaded).length}
              </p>
            </div>
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Completed Certificates</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{certificate.courseName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          certificate.isDownloaded 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {certificate.isDownloaded ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Downloaded
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3 h-3 mr-1" />
                              Available
                            </>
                          )}
                        </span>
                        <span className="text-sm text-gray-500">Grade: {certificate.grade}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Instructor: {certificate.instructorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Completed: {new Date(certificate.completionDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Duration: {certificate.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => handleDownload(certificate.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {certificate.isDownloaded ? 'Download Again' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {certificates.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-600">Complete courses to earn certificates.</p>
        </div>
      )}
    </div>
  );
}
