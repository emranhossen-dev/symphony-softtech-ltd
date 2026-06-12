'use client';

import { Award, Loader2, Send, CheckCircle, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EligibleCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
}

interface IssuedCertificate {
  id: string;
  verificationId: string;
  issuedAt: string;
  course: {
    title: string;
    slug: string;
    duration: string;
    mentor: { name: string } | null;
  };
}

export default function StudentCertificates() {
  const [loading, setLoading] = useState(true);
  const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/student/certificates');
      const data = await res.json();
      if (data.success) {
        setEligibleCourses(data.eligibleCourses || []);
        setIssuedCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Failed to load certificates data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCertificate = async (courseId: string) => {
    setRequestingId(courseId);
    try {
      const res = await fetch('/api/student/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();
      if (data.success) {
        setRequestedIds(prev => new Set([...prev, courseId]));
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error(error);
      alert('Network error while requesting certificate');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f4c] to-[#0d1b3e] border border-blue-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Certificates</h1>
        <p className="text-blue-200 text-sm sm:text-base">View and download your course completion certificates.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl border border-blue-500/20 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-blue-200">Checking your eligibility...</p>
        </div>
      )}

      {/* Issued Certificates */}
      {!loading && issuedCertificates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Issued Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {issuedCertificates.map((cert) => (
              <div key={cert.id} className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{cert.course.title}</h3>
                    {cert.course.mentor && (
                      <p className="text-xs text-gray-400 truncate">Mentor: {cert.course.mentor.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full w-fit text-xs text-green-400 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Certificate Issued
                </div>
                <p className="text-xs text-gray-500 font-mono truncate">ID: {cert.verificationId}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eligible Courses */}
      {!loading && eligibleCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Eligible for Certificate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleCourses.map((course) => {
              const alreadyRequested = requestedIds.has(course.id);
              return (
                <div key={course.id} className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20 p-6 flex flex-col h-full hover:border-blue-500/40 transition-colors">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-blue-200 text-sm mb-6">You have completed all assignments for this course!</p>
                  </div>
                  {alreadyRequested ? (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Request Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestCertificate(course.id)}
                      disabled={requestingId === course.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                      {requestingId === course.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Request Certificate
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && eligibleCourses.length === 0 && issuedCertificates.length === 0 && (
        <div className="bg-[#1a1f4c]/50 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20 p-12 sm:p-20 text-center flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-[#0a0e27] border border-blue-500/30 rounded-full flex items-center justify-center mb-8 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
            <Award className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 relative z-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Certificates Issued Yet</h3>
          <p className="text-blue-200 text-lg max-w-md mx-auto">
            Complete your courses and submit the final homework to earn your certificates. Keep up the great work!
          </p>
        </div>
      )}
    </div>
  );
}
