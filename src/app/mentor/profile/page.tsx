'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Edit,
  Save,
  X,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  FileText,
  Plus,
  Trash,
} from 'lucide-react';

interface MentorProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  isActive: boolean;
}

interface MentorStats {
  coursesTaught: number;
  studentsMentored: number;
  certificatesIssued: number;
  homeworkReviewed: number;
}

interface ProfessionalInfo {
  bio: string;
  specialization: string;
  expertise: string[];
  education: string[];
}

const DEFAULT_PROF_INFO: ProfessionalInfo = {
  bio: 'Experienced full-stack developer with over 10 years of industry experience. Passionate about teaching modern web technologies and helping students build real-world applications.',
  specialization: 'Web Development & React',
  expertise: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Database Design'],
  education: [
    'Ph.D. in Computer Science - Stanford University',
    'M.S. in Software Engineering - MIT',
    'B.S. in Computer Science - UC Berkeley'
  ]
};

type Tab = 'overview' | 'professional' | 'security';

export default function MentorProfile() {
  // States for dynamic API data
  const [profile, setProfile] = useState<MentorProfileData | null>(null);
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Edit states for Basic Profile (Name & Phone)
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingBasic, setIsSavingBasic] = useState(false);
  const [basicSaveError, setBasicSaveError] = useState('');
  const [basicSaveSuccess, setBasicSaveSuccess] = useState('');

  // LocalStorage-persisted Professional Info States
  const [profInfo, setProfInfo] = useState<ProfessionalInfo>(DEFAULT_PROF_INFO);
  const [isEditingProf, setIsEditingProf] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editExpertise, setEditExpertise] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [editEducation, setEditEducation] = useState<string[]>([]);
  const [newEduItem, setNewEduItem] = useState('');
  const [profSaveSuccess, setProfSaveSuccess] = useState('');

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // Fetch mentor profile and stats from API
  const fetchProfile = useCallback(async () => {
    setIsPageLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/mentor/profile');
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || 'Failed to fetch mentor profile data.');
        return;
      }
      setProfile(data.profile);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
      setLoadError('Network error — could not load your profile.');
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    // Load professional info from localStorage
    const saved = localStorage.getItem('mentor_prof_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfInfo({
          bio: parsed.bio ?? DEFAULT_PROF_INFO.bio,
          specialization: parsed.specialization ?? DEFAULT_PROF_INFO.specialization,
          expertise: parsed.expertise ?? DEFAULT_PROF_INFO.expertise,
          education: parsed.education ?? DEFAULT_PROF_INFO.education,
        });
      } catch (e) {
        console.error('Failed to parse saved professional info:', e);
      }
    }
  }, [fetchProfile]);

  // Handle Edit Basic profile trigger
  const handleEditBasic = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setBasicSaveError('');
    setBasicSaveSuccess('');
    setIsEditingBasic(true);
  };

  const handleCancelBasic = () => {
    setIsEditingBasic(false);
    setBasicSaveError('');
  };

  const handleSaveBasic = async () => {
    if (!editName.trim()) {
      setBasicSaveError('Name cannot be empty.');
      return;
    }
    setIsSavingBasic(true);
    setBasicSaveError('');
    setBasicSaveSuccess('');
    try {
      const res = await fetch('/api/mentor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBasicSaveError(data.error || 'Failed to save basic profile.');
        return;
      }
      setProfile(data.profile);
      setIsEditingBasic(false);
      setBasicSaveSuccess('Profile updated successfully!');
      setTimeout(() => setBasicSaveSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setBasicSaveError('Network error — could not save profile.');
    } finally {
      setIsSavingBasic(false);
    }
  };

  // Professional Info edits
  const handleEditProf = () => {
    setEditBio(profInfo.bio);
    setEditSpecialization(profInfo.specialization);
    setEditExpertise([...profInfo.expertise]);
    setEditEducation([...profInfo.education]);
    setProfSaveSuccess('');
    setIsEditingProf(true);
  };

  const handleCancelProf = () => {
    setIsEditingProf(false);
  };

  const handleSaveProf = () => {
    const updated: ProfessionalInfo = {
      bio: editBio.trim(),
      specialization: editSpecialization.trim() || DEFAULT_PROF_INFO.specialization,
      expertise: editExpertise.length > 0 ? editExpertise : DEFAULT_PROF_INFO.expertise,
      education: editEducation.length > 0 ? editEducation : DEFAULT_PROF_INFO.education,
    };
    setProfInfo(updated);
    localStorage.setItem('mentor_prof_info', JSON.stringify(updated));
    setIsEditingProf(false);
    setProfSaveSuccess('Professional details saved locally!');
    setTimeout(() => setProfSaveSuccess(''), 4000);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editExpertise.includes(newSkill.trim())) {
      setEditExpertise([...editExpertise, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditExpertise(editExpertise.filter((skill) => skill !== skillToRemove));
  };

  const handleAddEdu = () => {
    if (newEduItem.trim() && !editEducation.includes(newEduItem.trim())) {
      setEditEducation([...editEducation, newEduItem.trim()]);
      setNewEduItem('');
    }
  };

  const handleRemoveEdu = (eduToRemove: string) => {
    setEditEducation(editEducation.filter((edu) => edu !== eduToRemove));
  };

  // Change Password Handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill out all fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPwError('New password must be different from current password.');
      return;
    }

    setIsChangingPw(true);
    try {
      const res = await fetch('/api/mentor/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || 'Failed to change password.');
        return;
      }
      setPwSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setPwError('Network error — could not change password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  };

  const getPasswordStrength = (pw: string) => {
    const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
    return checks.filter(Boolean).length;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  if (isPageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-purple-200 text-sm font-medium">Loading mentor profile…</p>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-[#1a1f4c]/60 border border-purple-500/20 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Could not load profile</h2>
          <p className="text-purple-200 text-sm mb-6">{loadError || 'Unknown error'}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast notifications */}
      {(basicSaveSuccess || profSaveSuccess || pwSuccess) && (
        <div className="p-3 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-green-300 text-sm font-medium">
            {basicSaveSuccess || profSaveSuccess || pwSuccess}
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1b153e] to-[#0a0720] border border-purple-500/20 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white text-2xl font-bold">{getInitials(profile.name)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0a0720] rounded-full" />
            </div>

            {/* Name & Title */}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {profile.name}
              </h1>
              <p className="text-purple-300 text-sm mt-0.5">{profInfo.specialization}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {profile.role}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    profile.isActive
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {profile.isActive ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick switch tabs action or global state */}
          <div className="text-right shrink-0">
            <span className="text-xs text-purple-400 block uppercase tracking-wider">Joined System</span>
            <span className="text-sm font-semibold text-white flex items-center justify-end gap-1 mt-1">
              <Calendar className="w-4 h-4 text-purple-400" />
              {profile.joinDate}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 sm:p-6 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.coursesTaught}</div>
            <div className="text-xs sm:text-sm text-purple-300 mt-1">Courses Taught</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <User className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.studentsMentored}</div>
            <div className="text-xs sm:text-sm text-purple-300 mt-1">Students Mentored</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.certificatesIssued}</div>
            <div className="text-xs sm:text-sm text-purple-300 mt-1">Certificates Issued</div>
          </div>
          <div className="glass-card p-4 sm:p-6 text-center border border-purple-500/10 hover:border-purple-500/30 transition-all rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <FileText className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.homeworkReviewed}</div>
            <div className="text-xs sm:text-sm text-purple-300 mt-1">Homework Reviewed</div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="bg-[#1a1f4c]/50 border border-purple-500/20 rounded-2xl p-1.5 backdrop-blur-sm flex gap-2">
        {(
          [
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'professional', label: 'Professional Details', icon: Award },
            { id: 'security', label: 'Security & Password', icon: Lock },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-purple-300 hover:bg-purple-500/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-[#1a1f4c]/50 border border-purple-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20 bg-[#0a0e27]/40 flex justify-between items-center">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" /> Account &amp; Contact Details
                </h2>
                {!isEditingBasic ? (
                  <button
                    onClick={handleEditBasic}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Basic Info
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBasic}
                      disabled={isSavingBasic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                      {isSavingBasic ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={handleCancelBasic}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0e27]/60 hover:bg-[#0a0e27] text-purple-200 text-xs font-medium rounded-lg border border-purple-500/30 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5">
                {basicSaveError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-red-300 text-sm">{basicSaveError}</span>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  {isEditingBasic ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                      placeholder="Full Name"
                    />
                  ) : (
                    <p className="text-white font-semibold text-lg">{profile.name}</p>
                  )}
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <p className="text-purple-200 flex items-center gap-2 text-sm bg-purple-950/20 border border-purple-500/10 px-4 py-2.5 rounded-xl">
                    <Mail className="w-4 h-4 text-purple-400" />
                    {profile.email}
                    <span className="text-xs text-purple-500 italic ml-auto">(Locked attribute)</span>
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  {isEditingBasic ? (
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                      placeholder="+880 17XX XXXXXX"
                    />
                  ) : (
                    <p className="text-white flex items-center gap-2 font-medium">
                      <Phone className="w-4 h-4 text-purple-400" />
                      {profile.phone || <span className="text-purple-400/50 italic">Not specified</span>}
                    </p>
                  )}
                </div>

                {/* Info Fields */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-500/10">
                  <div>
                    <span className="block text-xs text-purple-400 uppercase tracking-wider mb-1">
                      Account Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-300 border border-green-500/20 mt-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Normal / Active
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-purple-400 uppercase tracking-wider mb-1">
                      Role Privilege
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20 mt-1">
                      <User className="w-3.5 h-3.5" /> {profile.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL INFO */}
          {activeTab === 'professional' && (
            <div className="bg-[#1a1f4c]/50 border border-purple-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20 bg-[#0a0e27]/40 flex justify-between items-center">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> Professional &amp; Teaching Bio
                </h2>
                {!isEditingProf ? (
                  <button
                    onClick={handleEditProf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Bio &amp; Expertise
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                    <button
                      onClick={handleCancelProf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a0e27]/60 hover:bg-[#0a0e27] text-purple-200 text-xs font-medium rounded-lg border border-purple-500/30 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Specialization */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                    Professional Specialization
                  </label>
                  {isEditingProf ? (
                    <input
                      type="text"
                      value={editSpecialization}
                      onChange={(e) => setEditSpecialization(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                      placeholder="e.g. Web Development &amp; React"
                    />
                  ) : (
                    <p className="text-white font-medium text-lg">{profInfo.specialization}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                    Teaching Bio
                  </label>
                  {isEditingProf ? (
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all resize-none"
                      placeholder="Describe your credentials, industry experiences, and what you love to teach."
                    />
                  ) : (
                    <p className="text-purple-200 leading-relaxed text-sm bg-purple-950/10 border border-purple-500/10 p-4 rounded-xl">
                      {profInfo.bio}
                    </p>
                  )}
                </div>

                {/* Areas of Expertise */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">
                    Key Technical Competency &amp; Skills
                  </label>
                  {isEditingProf ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          className="flex-1 px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                          placeholder="e.g. Next.js"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {editExpertise.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-purple-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profInfo.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                <div>
                  <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">
                    Academic Background &amp; History
                  </label>
                  {isEditingProf ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newEduItem}
                          onChange={(e) => setNewEduItem(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEdu())}
                          className="flex-1 px-4 py-2.5 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                          placeholder="e.g. Master of Software Engineering - MIT"
                        />
                        <button
                          type="button"
                          onClick={handleAddEdu}
                          className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editEducation.map((edu, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2.5 bg-[#0a0e27]/40 border border-purple-500/20 rounded-xl"
                          >
                            <span className="text-purple-200 text-sm flex items-center gap-2">
                              <Award className="w-4 h-4 text-purple-400 shrink-0" />
                              {edu}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEdu(edu)}
                              className="text-purple-400 hover:text-red-400 p-1 transition-colors"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profInfo.education.map((degree, index) => (
                        <div key={index} className="flex items-start gap-3 bg-[#0a0e27]/20 border border-purple-500/10 p-3 rounded-xl">
                          <Award className="w-5 h-5 text-purple-400 mt-0.5" />
                          <span className="text-purple-200 text-sm">{degree}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="bg-[#1a1f4c]/50 border border-purple-500/20 rounded-2xl backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-500/20 bg-[#0a0e27]/40">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" /> Security &amp; Password Settings
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {pwError && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-red-300 text-sm">{pwError}</span>
                    </div>
                  )}

                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                        placeholder="Enter current account password"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 bg-[#0a0e27]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 text-sm transition-all"
                        placeholder="Must be at least 8 characters"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (() => {
                      const strength = getPasswordStrength(passwordData.newPassword);
                      return (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-colors ${
                                  level <= strength ? strengthColors[strength] : 'bg-purple-500/20'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-purple-400">{strengthLabel[strength]}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-medium text-purple-400 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className={`w-full px-4 py-2.5 pr-10 bg-[#0a0e27]/60 border rounded-xl text-white placeholder-purple-500 focus:outline-none focus:ring-2 text-sm transition-all ${
                          passwordData.confirmPassword &&
                          passwordData.confirmPassword !== passwordData.newPassword
                            ? 'border-red-500/50 focus:ring-red-500/30'
                            : 'border-purple-500/30 focus:ring-purple-500/50'
                        }`}
                        placeholder="Re-type new password"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword &&
                      passwordData.confirmPassword !== passwordData.newPassword && (
                        <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                      )}
                  </div>

                  {/* Form Submission */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPw}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                    >
                      {isChangingPw && <Loader2 className="w-4 h-4 animate-spin" />}
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Sidebar / Quick Details */}
        <div className="space-y-6">
          <div className="bg-[#1a1f4c]/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Institution Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">Headquarters</p>
                  <p className="text-purple-300 text-xs mt-0.5">Dhaka, Bangladesh</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">Support Email</p>
                  <p className="text-purple-300 text-xs mt-0.5">academic@symphony.edu</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-white font-medium">Current Semester</p>
                  <p className="text-purple-300 text-xs mt-0.5">Summer Batch 2026</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f4c]/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Security Compliance
            </h3>
            <p className="text-xs text-purple-300 leading-relaxed">
              Your connection to the Symphony Institute Portal is encrypted with industry standard TLS protocol. Your passwords are one-way hashed and protected against modern database compromise attacks. For critical account modifications, contact the administration desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
