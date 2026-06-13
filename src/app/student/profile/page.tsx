"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Edit,
  Save,
  X,
  Lock,
  Bell,
  Shield,
  Download,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Loader2,
  RefreshCw,
  Star,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Enrollment {
  id: string;
  courseName: string;
  courseId: string | null;
  status: string;
  joinedAt: string;
}

interface RecentCert {
  id: string;
  courseName: string;
  issuedAt: string;
  verificationId: string;
  certificateUrl: string;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  joinDate: string;
  avatar?: string;
  totalCourses: number;
  completedCourses: number;
  certificates: number;
  totalPoints: number;
  currentLevel: string;
  enrollments: Enrollment[];
  recentCertificates: RecentCert[];
}

type Tab = 'overview' | 'education' | 'achievements' | 'settings';

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function StudentProfile() {
  const { checkAuth } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  /* ---- Load profile ---- */
  const loadProfile = useCallback(async () => {
    setIsPageLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/student/profile');
      const data = await res.json();
      if (!res.ok) { setLoadError(data.error || 'Failed to load profile'); return; }
      setProfile(data.profile);
    } catch {
      setLoadError('Network error — could not load your profile.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  /* ---- Photo Upload Handlers ---- */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setSaveSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to local server uploads directory
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload image.');
      }

      const fileUrl = uploadData.url;

      // Update backend user profile
      const updateRes = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile?.name || '',
          phone: profile?.phone || '',
          avatar: fileUrl,
        }),
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.error || 'Failed to update profile photo.');
      }

      await loadProfile();
      await checkAuth();

      setSaveSuccess('Profile picture updated successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  /* ---- Edit handlers ---- */
  const handleEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setSaveError(''); setSaveSuccess('');
    setIsEditing(true);
  };

  const handleCancel = () => { setIsEditing(false); setSaveError(''); };

  const handleSave = async () => {
    if (!editName.trim()) { setSaveError('Name cannot be empty.'); return; }
    setIsSaving(true); setSaveError(''); setSaveSuccess('');
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error || 'Failed to save profile'); return; }
      await loadProfile();
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch {
      setSaveError('Network error — could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ---- Password handler ---- */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword) { setPwError('Please enter your current password.'); return; }
    if (!newPassword) { setPwError('Please enter a new password.'); return; }
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match.'); return; }
    if (newPassword === currentPassword) { setPwError('New password must differ from your current password.'); return; }
    setIsChangingPw(true);
    try {
      const res = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || 'Failed to change password.'); return; }
      setPwSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setPwSuccess(''), 5000);
    } catch {
      setPwError('Network error — could not change password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  /* ---- Helpers ---- */
  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('');

  const getPasswordStrength = (pw: string) => {
    const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
    return checks.filter(Boolean).length;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const completionRate = profile && profile.totalCourses > 0
    ? Math.round((profile.completedCourses / profile.totalCourses) * 100)
    : 0;

  /* ---- Loading state ---- */
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
          <p className="text-blue-200 text-sm font-medium">Loading your profile…</p>
        </div>
      </div>
    );
  }

  /* ---- Error state ---- */
  if (loadError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-[#1a1f4c]/60 border border-blue-500/20 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Could not load profile</h2>
          <p className="text-blue-200 text-sm mb-6">{loadError || 'Unknown error'}</p>
          <button
            onClick={loadProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                            */
  /* ================================================================ */
  return (
    <div className="space-y-6">

      {/* ── Global success toast ── */}
      {(saveSuccess || pwSuccess) && (
        <div className="p-3 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-green-300 text-sm font-medium">{saveSuccess || pwSuccess}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* HERO HEADER                                                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#1a1f4c] to-[#0d1b3e] border border-blue-500/20 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                onClick={triggerFileInput}
                className="w-20 h-20 bg-[#1e293b] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden relative cursor-pointer group border border-slate-700 hover:border-blue-500 transition-colors"
              >
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                ) : null}
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{getInitials(profile.name)}</span>
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Change</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {/* Online dot */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0d1b3e] rounded-full" />
            </div>

            {/* Name + email + badges */}
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold text-white bg-transparent border-b-2 border-blue-400 outline-none w-full mb-1"
                  placeholder="Full Name"
                  autoFocus
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              )}
              <p className="text-blue-300 text-sm mt-0.5">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Star className="w-3 h-3" /> {profile.currentLevel}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {profile.totalPoints} pts
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  profile.isActive
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {profile.isActive ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit / Save / Cancel */}
          <div className="flex gap-2 shrink-0">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a0e27]/60 hover:bg-[#0a0e27] text-blue-200 text-sm font-medium rounded-xl border border-blue-500/30 transition-all"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit save error */}
        {saveError && isEditing && (
          <div className="mt-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-red-300 text-sm">{saveError}</span>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-red-300 text-sm">{uploadError}</span>
          </div>
        )}

        {/* Quick stat pills row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Enrolled', value: profile.totalCourses, color: 'text-blue-300' },
            { label: 'Completed', value: profile.completedCourses, color: 'text-green-300' },
            { label: 'Certificates', value: profile.certificates, color: 'text-yellow-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0a0e27]/50 border border-blue-500/20 rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-blue-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* TABS                                                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl p-1.5 backdrop-blur-sm">
        <div className="flex flex-wrap gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-blue-300 hover:bg-blue-500/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* MAIN GRID                                                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left / Main column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─────────── OVERVIEW ─────────── */}
          {activeTab === 'overview' && (
            <>
              {/* Personal Info card */}
              <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" /> Personal Information
                  </h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Full name */}
                  <div>
                    <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <p className="text-white font-medium">{profile.name}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <p className="text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      {profile.email}
                      <span className="text-xs text-blue-500 ml-1">(cannot be changed)</span>
                    </p>
                  </div>

                  {/* Phone — editable */}
                  <div>
                    <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-blue-500/30 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 text-sm transition-all"
                        placeholder="+880 17xx xxx xxxx"
                      />
                    ) : (
                      <p className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-400" />
                        {profile.phone || <span className="text-blue-500 italic">Not provided</span>}
                      </p>
                    )}
                  </div>

                  {/* Member since */}
                  <div>
                    <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                      Member Since
                    </label>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      {new Date(profile.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security card */}
              <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" /> Security Settings
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white font-medium text-sm">Password</p>
                      <p className="text-blue-400 text-xs mt-0.5">Keep your account safe with a strong password.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowPasswordForm(!showPasswordForm);
                        setPwError(''); setPwSuccess('');
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0a0e27]/60 hover:bg-[#0a0e27] text-blue-300 hover:text-white text-sm font-medium rounded-xl border border-blue-500/30 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {/* pw success above form */}
                  {pwSuccess && !showPasswordForm && (
                    <div className="p-3 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center gap-2 mb-4">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-green-300 text-sm">{pwSuccess}</span>
                    </div>
                  )}

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-blue-500/20 pt-5">
                      {/* Current pw */}
                      <div>
                        <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2.5 pr-10 bg-[#0a0e27]/60 border border-blue-500/30 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 text-sm transition-all"
                            placeholder="Enter current password"
                            required
                            autoComplete="current-password"
                          />
                          <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors">
                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New pw */}
                      <div>
                        <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2.5 pr-10 bg-[#0a0e27]/60 border border-blue-500/30 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 text-sm transition-all"
                            placeholder="At least 8 characters"
                            required
                            autoComplete="new-password"
                          />
                          <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors">
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Strength bar */}
                        {passwordData.newPassword && (() => {
                          const s = getPasswordStrength(passwordData.newPassword);
                          return (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex gap-1 flex-1">
                                {[1, 2, 3, 4].map((l) => (
                                  <div key={l} className={`h-1 flex-1 rounded-full transition-colors ${l <= s ? strengthColors[s] : 'bg-blue-500/20'}`} />
                                ))}
                              </div>
                              <span className="text-xs text-blue-400">{strengthLabel[s]}</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Confirm pw */}
                      <div>
                        <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider mb-1.5">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className={`w-full px-4 py-2.5 pr-10 bg-[#0a0e27]/60 border rounded-xl text-white placeholder-blue-500 focus:outline-none focus:ring-2 focus:border-blue-500/60 text-sm transition-all ${
                              passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword
                                ? 'border-red-500/50 focus:ring-red-500/30'
                                : 'border-blue-500/30 focus:ring-blue-500/50'
                            }`}
                            placeholder="Re-enter new password"
                            required
                            autoComplete="new-password"
                          />
                          <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors">
                            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                          <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                        )}
                      </div>

                      {/* Error */}
                      {pwError && (
                        <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-red-300 text-sm">{pwError}</span>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPwError(''); }}
                          className="px-4 py-2 text-blue-300 bg-[#0a0e27]/60 hover:bg-[#0a0e27] rounded-xl border border-blue-500/30 transition-all text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isChangingPw}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
                        >
                          {isChangingPw && <Loader2 className="w-4 h-4 animate-spin" />}
                          Update Password
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─────────── EDUCATION ─────────── */}
          {activeTab === 'education' && (
            <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Education Progress
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Enrolled', value: profile.totalCourses, color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20' },
                    { label: 'Completed', value: profile.completedCourses, color: 'text-green-300', bg: 'bg-green-500/10 border-green-500/20' },
                    { label: 'Certificates', value: profile.certificates, color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`${bg} border rounded-xl p-4 text-center`}>
                      <div className={`text-3xl font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-blue-400 mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {profile.totalCourses > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-300">Overall Completion</span>
                      <span className="font-semibold text-green-300">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Enrollments list */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-200 mb-3 uppercase tracking-wider">My Enrollments</h3>
                  {profile.enrollments.length === 0 ? (
                    <div className="text-center py-10 text-blue-500">
                      <BookOpen className="w-10 h-10 mx-auto text-blue-500/30 mb-3" />
                      <p className="text-sm">You haven't enrolled in any courses yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profile.enrollments.map((enrollment) => (
                        <div key={enrollment.id}
                          className="flex items-center justify-between p-4 bg-[#0a0e27]/50 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">{enrollment.courseName}</h4>
                              <p className="text-xs text-blue-400">
                                Enrolled {new Date(enrollment.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            enrollment.status === 'ADMITTED'
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : enrollment.status === 'REJECTED'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────── ACHIEVEMENTS ─────────── */}
          {activeTab === 'achievements' && (
            <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400" /> Achievements &amp; Certificates
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Level banner */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Level: <span className="text-yellow-300">{profile.currentLevel}</span>
                      </h3>
                      <p className="text-yellow-200/70 text-sm mb-4">Keep learning to earn more points!</p>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-yellow-300/70 text-xs uppercase tracking-wider">Total Points</p>
                          <p className="text-2xl font-bold text-yellow-300">{profile.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-yellow-300/70 text-xs uppercase tracking-wider">Certificates</p>
                          <p className="text-2xl font-bold text-yellow-300">{profile.certificates}</p>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="w-16 h-16 text-yellow-400/30" />
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-200 mb-3 uppercase tracking-wider">Your Certificates</h3>
                  {profile.recentCertificates.length === 0 ? (
                    <div className="text-center py-10">
                      <Award className="w-10 h-10 mx-auto text-blue-500/30 mb-3" />
                      <p className="text-sm text-blue-400">No certificates yet. Complete a course to earn one!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.recentCertificates.map((cert) => (
                        <div key={cert.id}
                          className="bg-[#0a0e27]/50 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                                <Award className="w-6 h-6 text-blue-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-white">{cert.courseName}</h4>
                                <p className="text-xs text-blue-400 mt-0.5">
                                  Issued {new Date(cert.issuedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-blue-500/60 font-mono mt-0.5">
                                  #{cert.verificationId.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                            <a href={cert.certificateUrl} target="_blank" rel="noreferrer" className="shrink-0">
                              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white text-xs font-medium rounded-lg border border-blue-500/30 transition-all">
                                <Download className="w-3.5 h-3.5" /> Download
                              </button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────── SETTINGS ─────────── */}
          {activeTab === 'settings' && (
            <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" /> Account Settings
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Account status */}
                <div className="flex items-center justify-between p-4 bg-[#0a0e27]/50 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Account Status</p>
                      <p className="text-xs text-blue-400 mt-0.5">Your account is currently {profile.isActive ? 'active' : 'inactive'}.</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    profile.isActive
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Role */}
                <div className="flex items-center justify-between p-4 bg-[#0a0e27]/50 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Account Role</p>
                      <p className="text-xs text-blue-400 mt-0.5">Your assigned role in the platform.</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {profile.role}
                  </span>
                </div>

                {/* Notifications */}
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Notifications</p>
                    <p className="text-xs text-blue-400 mt-0.5 leading-relaxed">
                      You receive email notifications for course updates, homework feedback, and certificate issuance.
                    </p>
                  </div>
                </div>

                {/* Change password shortcut */}
                <div className="flex items-center justify-between p-4 bg-[#0a0e27]/50 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                      <Lock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Password</p>
                      <p className="text-xs text-blue-400 mt-0.5">Change your account password securely.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveTab('overview'); setTimeout(() => setShowPasswordForm(true), 100); }}
                    className="text-sm text-blue-400 hover:text-white font-medium transition-colors"
                  >
                    Change →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar column ── */}
        <div className="space-y-6">
          {/* Quick Stats card */}
          <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
              <h2 className="text-base font-semibold text-white">Quick Stats</h2>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Member Since', value: new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), color: 'text-white' },
                { label: 'Total Points', value: profile.totalPoints, color: 'text-green-300' },
                { label: 'Completion Rate', value: `${completionRate}%`, color: 'text-blue-300' },
                { label: 'Courses Enrolled', value: profile.totalCourses, color: 'text-white' },
                { label: 'Certificates', value: profile.certificates, color: 'text-yellow-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-blue-400">{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>{value}</span>
                </div>
              ))}

              {/* Mini progress bar */}
              {profile.totalCourses > 0 && (
                <div className="pt-2 border-t border-blue-500/20">
                  <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-500 mt-1 text-right">{completionRate}% complete</p>
                </div>
              )}
            </div>
          </div>

          {/* Account snapshot card */}
          <div className="bg-[#1a1f4c]/50 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-500/20 bg-[#0a0e27]/40">
              <h2 className="text-base font-semibold text-white">Account</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-blue-300">
                <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Role: {profile.role}</span>
              </div>
              <div className="pt-3 border-t border-blue-500/20">
                <button
                  onClick={handleEdit}
                  disabled={isEditing}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
