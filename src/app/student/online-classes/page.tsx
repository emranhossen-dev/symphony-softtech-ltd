'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Video, Calendar, Clock, User, AlertCircle, Loader2, ArrowLeft,
  Tv, ExternalLink, HelpCircle, CheckCircle, RefreshCw, Star
} from 'lucide-react';
import Link from 'next/link';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  courseName: string;
  mentorName: string;
  mentorAvatar: string;
  scheduledAt: string;
  endTime: string | null;
  isActive: boolean;
  meetingLink: string;
  attendanceStatus: string;
  hasJoined: boolean;
}

export default function OnlineClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCallSession, setActiveCallSession] = useState<LiveClass | null>(null);
  const [isJoiningId, setIsJoiningId] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/student/online-classes');
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      } else {
        setError(data.error || 'Failed to load live classes');
      }
    } catch {
      setError('Network error - could not load live classes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();

    // Poll live classes every 10 seconds to make it real-time
    const interval = setInterval(() => {
      fetchClasses();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchClasses]);

  const handleJoinClass = async (session: LiveClass) => {
    setIsJoiningId(session.id);
    try {
      // 1. Trigger attendance auto-marking endpoint
      await fetch('/api/student/online-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      });

      // 2. Open meeting room
      if (session.meetingLink && !session.meetingLink.includes('meet.jit.si')) {
        // Fallback: Open external Zoom/Google Meet links in a new tab
        window.open(session.meetingLink, '_blank');
        fetchClasses(); // Refresh list to update attendance state
      } else {
        // Embed inline Jitsi Meet video call room
        setActiveCallSession(session);
      }
    } catch (err) {
      console.error('Error joining live session:', err);
    } finally {
      setIsJoiningId(null);
    }
  };

  const activeClasses = classes.filter(c => c.isActive);
  const upcomingClasses = classes.filter(c => !c.isActive && new Date(c.scheduledAt) > new Date());
  const pastClasses = classes.filter(c => !c.isActive && new Date(c.scheduledAt) <= new Date());

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-purple-200 text-sm font-medium">Loading live sessions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen pb-12">
      
      {/* Interactive Live Meeting Room Container (Full-screen Overlay) */}
      {activeCallSession && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-purple-500/20 px-6 flex items-center justify-between bg-[#0a0e27]/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{activeCallSession.title}</h3>
                <p className="text-xs text-purple-300">Instructor: {activeCallSession.mentorName} • {activeCallSession.courseName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveCallSession(null);
                fetchClasses();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-red-500/20"
            >
              Leave Session
            </button>
          </div>
          {/* Embed Jitsi Meet Iframe */}
          <div className="flex-1 w-full bg-slate-900">
            <iframe
              src={`https://meet.jit.si/SymphonyTech-${activeCallSession.id}#config.startWithAudioMuted=true&config.startWithVideoMuted=true&interfaceConfig.DEFAULT_BACKGROUND='#0a0e27'`}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-gradient-to-r from-[#1a1f4c] to-[#0d1b3e] border border-purple-500/20 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
              <Video className="w-8 h-8 text-red-400" />
              Live Online Classes
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">Join video sessions, ask questions, and interact with your mentors in real-time.</p>
          </div>
          <button
            onClick={fetchClasses}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 transition-all font-semibold text-sm shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-red-300 text-sm font-medium">{error}</span>
        </div>
      )}

      {/* 1. ACTIVE LIVE CLASSES */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          Live Now
        </h2>
        {activeClasses.length === 0 ? (
          <div className="bg-[#1a1f4c]/30 border border-purple-500/10 rounded-2xl p-10 text-center text-purple-300">
            <Tv className="w-10 h-10 mx-auto text-purple-500/30 mb-3" />
            <p className="text-sm">There are no classes active at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeClasses.map(session => (
              <div 
                key={session.id} 
                className="bg-gradient-to-br from-[#1d1b4c]/80 to-[#0e173b]/80 border-2 border-red-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-red-500 transition-all"
              >
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider animate-pulse">
                  Live
                </div>
                <h3 className="text-lg font-bold text-white mb-2 max-w-[90%]">{session.title}</h3>
                <p className="text-xs text-purple-300 mb-4">{session.courseName}</p>
                <p className="text-sm text-gray-300 mb-6 leading-relaxed line-clamp-2">{session.description}</p>
                
                <div className="flex items-center justify-between border-t border-purple-500/10 pt-4 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-300 font-bold overflow-hidden">
                      {session.mentorAvatar ? (
                        <img src={session.mentorAvatar} alt={session.mentorName} className="w-full h-full object-cover" />
                      ) : (
                        session.mentorName[0]
                      )}
                    </div>
                    <span className="text-xs text-gray-300 font-medium">{session.mentorName}</span>
                  </div>

                  <button
                    onClick={() => handleJoinClass(session)}
                    disabled={isJoiningId !== null}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/30 shrink-0"
                  >
                    {isJoiningId === session.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    Join Live Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. UPCOMING LIVE CLASSES */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Upcoming Sessions
        </h2>
        {upcomingClasses.length === 0 ? (
          <div className="bg-[#1a1f4c]/30 border border-purple-500/10 rounded-2xl p-8 text-center text-purple-300">
            <p className="text-sm">No upcoming classes scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingClasses.map(session => (
              <div 
                key={session.id} 
                className="bg-[#161a3f]/60 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-3">
                    Scheduled
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 truncate">{session.title}</h3>
                  <p className="text-xs text-purple-300 mb-3 truncate">{session.courseName}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">{session.description}</p>
                </div>

                <div className="border-t border-purple-500/10 pt-3 mt-2 space-y-2">
                  <div className="flex items-center text-xs text-gray-300 gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{formatDateTime(session.scheduledAt)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-300 gap-2">
                    <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Mentor: {session.mentorName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. COMPLETED/PAST LIVE CLASSES */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          Past Sessions
        </h2>
        {pastClasses.length === 0 ? (
          <div className="bg-[#1a1f4c]/30 border border-purple-500/10 rounded-2xl p-8 text-center text-purple-300">
            <p className="text-sm">No past classes found.</p>
          </div>
        ) : (
          <div className="bg-[#1a1f4c]/20 border border-purple-500/10 rounded-2xl overflow-hidden divide-y divide-purple-500/10">
            {pastClasses.map(session => (
              <div 
                key={session.id} 
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#1a1f4c]/30 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">{session.title}</h3>
                  <p className="text-xs text-purple-300 mt-0.5">{session.courseName} • Instructor: {session.mentorName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Held on {formatDateTime(session.scheduledAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                    session.attendanceStatus === 'PRESENT'
                      ? 'bg-green-500/20 text-green-300 border-green-500/20'
                      : 'bg-red-500/20 text-red-300 border-red-500/20'
                  }`}>
                    {session.attendanceStatus === 'PRESENT' ? '● Present' : '○ Absent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
