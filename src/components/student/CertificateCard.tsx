'use client';

import { useState, useEffect } from 'react';
import { Download, Award, Lock, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Certificate {
  id: string;
  certificateUrl: string;
  verificationId: string;
  issuedAt: string;
}

interface Course {
  id: string;
  title: string;
  certificateEligible: boolean;
  certificate?: Certificate | null;
  progress: number;
  attendancePercentage: number;
}

interface CertificateCardProps {
  course: Course;
}

export default function CertificateCard({ course }: CertificateCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(course.certificate || null);

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/student/certificate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCertificate(data.certificate);
      } else {
        alert(data.error || 'Failed to generate certificate');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (certificate) {
      // In a real implementation, this would download the actual PDF
      window.open(certificate.certificateUrl, '_blank');
    }
  };

  const getEligibilityStatus = () => {
    if (certificate) {
      return {
        icon: <Award className="w-5 h-5" />,
        text: 'Certificate Available',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    if (course.certificateEligible) {
      return {
        icon: <CheckCircle className="w-5 h-5" />,
        text: 'Eligible for Certificate',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    return {
      icon: <Lock className="w-5 h-5" />,
      text: 'Certificate Locked',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const status = getEligibilityStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.bgColor} ${status.borderColor} border`}>
              {status.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              <p className={`text-sm ${status.color}`}>{status.text}</p>
            </div>
          </div>
          
          {certificate && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Issued on</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(certificate.issuedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Progress Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{course.progress}%</div>
            <div className="text-sm text-gray-600">Course Progress</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{course.attendancePercentage}%</div>
            <div className="text-sm text-gray-600">Attendance</div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {course.progress === 100 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm text-gray-700">
                Complete all modules ({course.progress}% completed)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">
                Homework approved
              </span>
            </div>
            <div className="flex items-center gap-2">
              {course.attendancePercentage >= 70 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm text-gray-700">
                Minimum 70% attendance (you have {course.attendancePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {certificate ? (
            <button
              onClick={handleDownloadCertificate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </button>
          ) : course.certificateEligible ? (
            <button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Generate Certificate
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg text-center cursor-not-allowed">
              <Lock className="w-4 h-4 inline mr-2" />
              Requirements Not Met
            </div>
          )}
        </div>

        {/* Verification Info */}
        {certificate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Verification ID:</span>
              <span className="text-xs font-mono text-gray-800">{certificate.verificationId}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
