'use client';

import { useParams } from 'next/navigation';
import { Award, Download, Calendar, User, CheckCircle, ExternalLink } from 'lucide-react';

interface CertificateData {
  id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  grade: string;
  duration: string;
  verificationId: string;
}

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.id as string;

  // Mock certificate data - in real app, this would be fetched based on the ID
  const certificate: CertificateData = {
    id: certificateId,
    studentName: 'Alex Thompson',
    courseName: 'Web Development Basics',
    completionDate: '2024-01-15',
    instructorName: 'Dr. Sarah Johnson',
    grade: 'A',
    duration: '8 weeks',
    verificationId: 'CERT-2024-001'
  };

  const handleDownload = () => {
    console.log('Downloading certificate:', certificateId);
    // TODO: Implement actual PDF download logic
    alert('Certificate download started! (PDF generation will be implemented later)');
  };

  const handleVerify = () => {
    // TODO: Implement verification logic
    alert('Certificate verified successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
          <p className="text-gray-600">Verify and download course completion certificate</p>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-lg shadow-lg border-4 border-green-500 overflow-hidden">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b-2 border-green-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
              <p className="text-gray-600">This is to certify that</p>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="px-8 py-12 text-center">
            {/* Student Name */}
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{certificate.studentName}</h3>
              <div className="w-32 h-1 bg-green-500 mx-auto"></div>
            </div>

            {/* Course Name */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-2">has successfully completed the course</p>
              <h4 className="text-2xl font-bold text-green-600">{certificate.courseName}</h4>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Completion Date</span>
                </div>
                <p className="text-gray-900 font-semibold">{new Date(certificate.completionDate).toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Instructor</span>
                </div>
                <p className="text-gray-900 font-semibold">{certificate.instructorName}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Grade</span>
                </div>
                <p className="text-gray-900 font-semibold">{certificate.grade}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <p className="text-gray-600">Course Duration: <span className="font-semibold text-gray-900">{certificate.duration}</span></p>
            </div>

            {/* Verification Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-8">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Verified Certificate</span>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t-2 border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600 mb-1">Verification ID</p>
                <p className="font-mono text-sm font-semibold text-gray-900">{certificate.verificationId}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVerify}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify Certificate
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">About This Certificate</h4>
              <p className="text-sm text-gray-600 mb-3">
                This certificate confirms that {certificate.studentName} has successfully completed 
                the {certificate.courseName} course and demonstrated proficiency in the subject matter.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Course completed on {new Date(certificate.completionDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Grade achieved: {certificate.grade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Duration: {certificate.duration}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Verification</h4>
              <p className="text-sm text-gray-600 mb-3">
                This certificate can be verified using the verification ID above. 
                Employers and institutions can verify the authenticity of this certificate.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/certificate/${certificateId}`)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
                Copy Certificate Link
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Symphony Institute of Technology. All rights reserved.</p>
          <p className="mt-1">This certificate was issued by Symphony Institute of Technology and is valid for verification purposes.</p>
        </div>
      </div>
    </div>
  );
}
