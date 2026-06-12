'use client';

import { useState, useEffect } from 'react';
import { Award, CheckCircle, Loader2, User, BookOpen, Calendar, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingRequest {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  submittedAt: string;
}

interface IssuedCertificate {
  id: string;
  verificationId: string;
  issuedAt: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string; slug: string; duration: string };
}

export default function MentorCertificates() {
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [issuingKey, setIssuingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'issued'>('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mentor/certificates', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setPendingRequests(data.pendingRequests || []);
        setIssuedCertificates(data.issuedCertificates || []);
      } else {
        toast.error(data.error || 'Failed to load certificate requests');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error while loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (req: PendingRequest) => {
    const key = `${req.studentId}-${req.courseId}`;
    setIssuingKey(key);
    try {
      const res = await fetch('/api/mentor/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ studentId: req.studentId, courseId: req.courseId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Certificate issued to ${req.studentName}!`);
        setPendingRequests(prev => prev.filter(r => !(r.studentId === req.studentId && r.courseId === req.courseId)));
        fetchData(); // Refresh to update issued list
      } else {
        toast.error(data.error || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error while issuing certificate');
    } finally {
      setIssuingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              Certificate Management
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">
              Review and issue certificates to students who completed all assignments.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 border border-purple-500/30 text-purple-200 rounded-lg hover:bg-purple-600/50 hover:text-white transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Pending Requests</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">{pendingRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Certificates Issued</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{issuedCertificates.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'pending'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('issued')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'issued'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Issued Certificates
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Loading certificate data...</p>
        </div>
      )}

      {/* Pending Requests Tab */}
      {!loading && activeTab === 'pending' && (
        <>
          {pendingRequests.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <Award className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
              <p className="text-gray-400">No students have completed all assignments yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingRequests.map((req) => {
                const key = `${req.studentId}-${req.courseId}`;
                const isIssuing = issuingKey === key;
                return (
                  <div key={key} className="glass-card p-5 flex flex-col gap-4 hover:border-purple-500/40 transition-colors">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{req.studentName}</p>
                        <p className="text-xs text-gray-400 truncate">{req.studentEmail}</p>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <BookOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="truncate">{req.courseName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span>Completed: {new Date(req.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full w-fit text-xs text-green-400 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      All Homework Submitted
                    </div>

                    {/* Issue Button */}
                    <button
                      onClick={() => handleIssueCertificate(req)}
                      disabled={!!issuingKey}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 mt-auto"
                    >
                      {isIssuing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4" />
                          Issue Certificate
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Issued Certificates Tab */}
      {!loading && activeTab === 'issued' && (
        <>
          {issuedCertificates.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Certificates Issued Yet</h3>
              <p className="text-gray-400">Certificates you issue will appear here.</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Issued At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Verification ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {issuedCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-white">{cert.user.name}</p>
                          <p className="text-xs text-gray-400">{cert.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{cert.course.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-md font-mono">
                          {cert.verificationId}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
