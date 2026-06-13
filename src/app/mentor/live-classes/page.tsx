'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Video, Calendar, Clock, BookOpen, AlertCircle, Loader2, 
  Tv, Plus, Trash2, StopCircle, Play, RefreshCw, X, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  scheduledAt: string;
  endTime: string | null;
  isActive: boolean;
  meetingLink: string;
}

interface Course {
  id: string;
  name: string;
  category: string;
}

export default function MentorLiveClasses() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Form state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    sessionDate: '',
    duration: '60',
    meetingLink: ''
  });

  // Active call session
  const [activeCallSession, setActiveCallSession] = useState<LiveClass | null>(null);
  const [isUpdatingSessionId, setIsUpdatingSessionId] = useState<string | null>(null);

  const fetchClassesAndCourses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [classesRes, coursesRes] = await Promise.all([
        fetch('/api/mentor/live-classes', { credentials: 'include' }),
        fetch('/api/mentor/courses', { credentials: 'include' })
      ]);

      const classesData = await classesRes.json();
      const coursesData = await coursesRes.json();

      if (classesData.success) {
        setClasses(classesData.classes);
      } else {
        setError(classesData.error || 'Failed to load live sessions');
      }

      if (coursesData.success) {
        setCourses(coursesData.courses.map((c: any) => ({
          id: c.id,
          name: c.name,
          category: c.category
        })));
        if (coursesData.courses.length > 0) {
          setFormData(prev => ({ ...prev, courseId: coursesData.courses[0].id }));
        }
      }
    } catch {
      setError('Network error - could not fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassesAndCourses();
  }, [fetchClassesAndCourses]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.sessionDate) {
      toast.error('Title and Session Date are required');
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch('/api/mentor/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Live class scheduled successfully!');
        setShowScheduleModal(false);
        setFormData({
          courseId: courses[0]?.id || '',
          title: '',
          description: '',
          sessionDate: '',
          duration: '60',
          meetingLink: ''
        });
        fetchClassesAndCourses();
      } else {
        toast.error(data.error || 'Failed to schedule class');
      }
    } catch {
      toast.error('Network error - failed to schedule class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStartClass = async (session: LiveClass) => {
    setIsUpdatingSessionId(session.id);
    try {
      const res = await fetch('/api/mentor/live-classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          isActive: true
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Live class started! Students have been notified.');
        // Set the active meeting session
        setActiveCallSession({ ...session, isActive: true });
        fetchClassesAndCourses();
      } else {
        toast.error(data.error || 'Failed to start class');
      }
    } catch {
      toast.error('Network error - failed to start class');
    } finally {
      setIsUpdatingSessionId(null);
    }
  };

  const handleStopClass = async (sessionId: string) => {
    setIsUpdatingSessionId(sessionId);
    try {
      const res = await fetch('/api/mentor/live-classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          isActive: false
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Live class closed successfully.');
        if (activeCallSession?.id === sessionId) {
          setActiveCallSession(null);
        }
        fetchClassesAndCourses();
      } else {
        toast.error(data.error || 'Failed to close class');
      }
    } catch {
      toast.error('Network error - failed to close class');
    } finally {
      setIsUpdatingSessionId(null);
    }
  };

  const handleDeleteClass = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel and delete this scheduled class?')) return;
    
    try {
      const res = await fetch(`/api/mentor/live-classes?id=${sessionId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Live class session deleted.');
        fetchClassesAndCourses();
      } else {
        toast.error(data.error || 'Failed to delete class');
      }
    } catch {
      toast.error('Network error - failed to delete class');
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
          <p className="text-purple-200 text-sm font-medium">Loading live classes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen pb-12">

      {/* Embedded Live Video Conference room (Full-screen Overlay) */}
      {activeCallSession && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-purple-500/20 px-6 flex items-center justify-between bg-[#0a0e27]/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">{activeCallSession.title} (Instructor Panel)</h3>
                <p className="text-xs text-purple-300">{activeCallSession.courseName} • Students are joining...</p>
              </div>
            </div>
            <button
              onClick={() => handleStopClass(activeCallSession.id)}
              disabled={isUpdatingSessionId === activeCallSession.id}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-red-500/20 flex items-center gap-1.5"
            >
              {isUpdatingSessionId === activeCallSession.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <StopCircle className="w-4 h-4" />
              )}
              End Meeting for All
            </button>
          </div>
          {/* Jitsi Meet embedded screen */}
          <div className="flex-1 w-full bg-slate-900">
            <iframe
              src={`https://meet.jit.si/SymphonyTech-${activeCallSession.id}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.DEFAULT_BACKGROUND='#0a0e27'`}
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
              <Video className="w-8 h-8 text-purple-400" />
              Live Classes Management
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">Schedule upcoming classes, start video sessions, and alert students to join.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={fetchClassesAndCourses}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Schedule Live Class
            </button>
          </div>
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
          Ongoing Class
        </h2>
        {activeClasses.length === 0 ? (
          <div className="bg-[#1a1f4c]/30 border border-purple-500/10 rounded-2xl p-8 text-center text-purple-300">
            <Tv className="w-10 h-10 mx-auto text-purple-500/30 mb-3" />
            <p className="text-sm">No live classes are currently active. Click "Start Session" below to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeClasses.map(session => (
              <div 
                key={session.id} 
                className="bg-gradient-to-br from-[#1d1b4c]/80 to-[#0e173b]/80 border-2 border-red-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all"
              >
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider animate-pulse">
                  Active
                </div>
                <h3 className="text-lg font-bold text-white mb-2 max-w-[95%]">{session.title}</h3>
                <p className="text-xs text-purple-300 mb-3">{session.courseName}</p>
                <p className="text-sm text-gray-300 mb-6 leading-relaxed line-clamp-2">{session.description}</p>
                
                <div className="flex gap-3 justify-end border-t border-purple-500/10 pt-4">
                  <button
                    onClick={() => setActiveCallSession(session)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Open Teaching Screen
                  </button>
                  <button
                    onClick={() => handleStopClass(session.id)}
                    disabled={isUpdatingSessionId === session.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isUpdatingSessionId === session.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <StopCircle className="w-4 h-4" />
                    )}
                    End Session
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
          Scheduled Live Sessions
        </h2>
        {upcomingClasses.length === 0 ? (
          <div className="bg-[#1a1f4c]/30 border border-purple-500/10 rounded-2xl p-6 text-center text-purple-300">
            <p className="text-sm">No live sessions scheduled. Click "Schedule Live Class" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingClasses.map(session => (
              <div 
                key={session.id} 
                className="bg-[#161a3f]/60 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-white text-base mb-1 truncate">{session.title}</h3>
                  <p className="text-xs text-purple-300 mb-3 truncate">{session.courseName}</p>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{session.description}</p>
                </div>

                <div className="border-t border-purple-500/10 pt-4 mt-2 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-gray-300 gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{formatDateTime(session.scheduledAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleStartClass(session)}
                      disabled={isUpdatingSessionId !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-green-600/10"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Live
                    </button>
                    <button
                      onClick={() => handleDeleteClass(session.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-300 hover:text-white rounded-lg transition-all"
                      title="Cancel class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PAST LIVE CLASSES */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <StopCircle className="w-5 h-5 text-gray-400" />
          Completed Classes
        </h2>
        {pastClasses.length === 0 ? (
          <div className="bg-[#1a1f4c]/30 border border-purple-500/10 rounded-2xl p-6 text-center text-purple-300">
            <p className="text-sm">No completed sessions found.</p>
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
                  <p className="text-xs text-purple-300 mt-0.5">{session.courseName}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Held on {formatDateTime(session.scheduledAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-lg font-medium">
                    Session Closed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowScheduleModal(false)}></div>
          
          <div className="relative bg-[#0d1b3e] border border-purple-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl z-10 text-white animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-purple-500/20 bg-[#0a0e27]/40 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" /> Schedule Live Class
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              {/* Select Course */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Select Course</label>
                {courses.length === 0 ? (
                  <p className="text-red-400 text-xs font-medium">Please assign courses in your profile first.</p>
                ) : (
                  <select
                    value={formData.courseId}
                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/20 rounded-xl text-white outline-none focus:border-purple-500 text-sm transition-all"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: '#0d1b3e' }}>
                        {c.name} — {c.category}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Class Title */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intro to React Context API"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/20 rounded-xl text-white outline-none focus:border-purple-500 text-sm transition-all"
                />
              </div>

              {/* Class Description */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Class Description</label>
                <textarea
                  placeholder="Topic outline and materials students need to bring..."
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/20 rounded-xl text-white outline-none focus:border-purple-500 text-sm transition-all resize-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.sessionDate}
                    onChange={e => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/20 rounded-xl text-white outline-none focus:border-purple-500 text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/20 rounded-xl text-white outline-none focus:border-purple-500 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                  Meeting Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="e.g. Zoom or Google Meet Link (Leave empty to use Jitsi iframe)"
                  value={formData.meetingLink}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/20 rounded-xl text-white outline-none focus:border-purple-500 text-sm transition-all"
                />
                <p className="text-[10px] text-purple-400 mt-1">If left blank, Jitsi Meet iframe is automatically embedded inside the student panel.</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-3 border-t border-purple-500/10">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
