"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Users,
  Calendar,
  Phone,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  UserCheck,
  UserX,
  Timer,
  Trophy,
  Target,
  Filter,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  LayoutGrid,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  Mail,
  GraduationCap,
  Briefcase,
  Edit,
  Trash2,
  RefreshCw,
  Bell,
  FileText,
  UserPlus,
  CalendarDays,
  PhoneOff,
  Video,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  Archive,
  Send,
  MoreHorizontal,
  Filter as FilterIcon
} from "lucide-react";

// WhatsApp icon component since it's not available in lucide-react
const WhatsApp = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Types
interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  education: string;
  whyJoin: string;
  experience?: string;
  status: string;
  callStatus?: string;
  notes?: string;
  hasWhatsApp?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CallHistory {
  id: string;
  callType: string;
  callStatus: string;
  notes?: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
}

export default function SeminarRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const seminarId = params.id as string;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [seminar, setSeminar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [callStatusFilter, setCallStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);
  const [selectedRegistrations, setSelectedRegistrations] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(null);
        setActionDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [semRes, regRes] = await Promise.all([
          fetch(`/api/admin/seminars/${seminarId}`),
          fetch(`/api/admin/seminars/${seminarId}/registrations`)
        ]);
        const semData = await semRes.json();
        const regData = await regRes.json();
        if (semData.success) setSeminar(semData.data);
        if (regData.success) setRegistrations(regData.data);
      } catch (error) {
        console.error("Fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [seminarId]);

  const updateStatus = async (id: string, newStatus: string, additionalData?: any) => {
    try {
      const res = await fetch(`/api/admin/seminars/${seminarId}/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...additionalData }),
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, ...additionalData } : r));
        setStatusDropdownOpen(null);
      }
    } catch (e) { console.error("Error updating status"); }
  };

  const updateCallStatus = async (id: string, callStatus: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/seminars/${seminarId}/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callStatus, notes }),
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === id ? { ...r, callStatus, notes } : r));
      }
    } catch (e) { console.error("Error updating call status"); }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      NEW_APPLICANT: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 ring-blue-500/20 shadow-lg shadow-blue-100/50",
      FIRST_TIME_APPLIED: "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200 ring-violet-500/20 shadow-lg shadow-violet-100/50",
      CALLED: "bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 border-cyan-200 ring-cyan-500/20 shadow-lg shadow-cyan-100/50",
      CONFIRMED: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 ring-emerald-500/20 shadow-lg shadow-emerald-100/50",
      WAITING_NEXT_SEMINAR: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 ring-amber-500/20 shadow-lg shadow-amber-100/50",
      REJECTED: "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200 ring-rose-500/20 shadow-lg shadow-rose-100/50",
      CANCELLED: "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 ring-slate-500/20 shadow-lg shadow-slate-100/50",
      NEXT_SEMINAR_CONFIRMED: "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 ring-purple-500/20 shadow-lg shadow-purple-100/50",
    };
    return styles[status] || "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 shadow-lg shadow-slate-100/50";
  };

  const getCallStatusStyle = (callStatus?: string) => {
    const styles: Record<string, string> = {
      NOT_CALLED: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200",
      SCHEDULED: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-200",
      COMPLETED: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border-green-200",
      NO_ANSWER: "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600 border-orange-200",
      CALLBACK_REQUESTED: "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-purple-200",
      NOT_INTERESTED: "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border-red-200",
    };
    return styles[callStatus || "NOT_CALLED"] || styles["NOT_CALLED"];
  };

  const getCallStatusIcon = (callStatus?: string) => {
    const icons: Record<string, JSX.Element> = {
      NOT_CALLED: <PhoneOff className="w-3 h-3" />,
      SCHEDULED: <Calendar className="w-3 h-3" />,
      COMPLETED: <CheckSquare className="w-3 h-3" />,
      NO_ANSWER: <Phone className="w-3 h-3" />,
      CALLBACK_REQUESTED: <RefreshCw className="w-3 h-3" />,
      NOT_INTERESTED: <XCircle className="w-3 h-3" />,
    };
    return icons[callStatus || "NOT_CALLED"] || icons["NOT_CALLED"];
  };

  const getCallStatusLabel = (callStatus?: string) => {
    const labels: Record<string, string> = {
      NOT_CALLED: "📵 Not Called",
      SCHEDULED: "📅 Scheduled",
      COMPLETED: "✅ Completed",
      NO_ANSWER: "🔕 No Answer",
      CALLBACK_REQUESTED: "🔄 Callback",
      NOT_INTERESTED: "❌ Not Interested",
    };
    return labels[callStatus || "NOT_CALLED"] || callStatus || "Not Called";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      NEW_APPLICANT: <Sparkles className="w-3 h-3" />,
      FIRST_TIME_APPLIED: <Star className="w-3 h-3" />,
      CALLED: <PhoneCall className="w-3 h-3" />,
      CONFIRMED: <CheckCircle className="w-3 h-3" />,
      WAITING_NEXT_SEMINAR: <Clock className="w-3 h-3" />,
      REJECTED: <XCircle className="w-3 h-3" />,
      CANCELLED: <Timer className="w-3 h-3" />,
      NEXT_SEMINAR_CONFIRMED: <Trophy className="w-3 h-3" />,
    };
    return icons[status] || <Clock className="w-3 h-3" />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW_APPLICANT: "🌟 New Applicant",
      FIRST_TIME_APPLIED: "⭐ First Time",
      CALLED: "📞 Called",
      CONFIRMED: "✓ Confirmed",
      WAITING_NEXT_SEMINAR: "⏰ Waiting Next",
      REJECTED: "✗ Rejected",
      CANCELLED: "⏸️ Cancelled",
      NEXT_SEMINAR_CONFIRMED: "🏆 Next Confirmed",
    };
    return labels[status] || status;
  };

  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           reg.phone.includes(searchTerm) || 
                           reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter.includes(',') ? statusFilter.split(',').includes(reg.status) : reg.status === statusFilter);
      
      const matchesCallStatus = callStatusFilter === 'all' || reg.callStatus === callStatusFilter;
      
      return matchesSearch && matchesStatus && matchesCallStatus;
    });
  }, [registrations, searchTerm, statusFilter, callStatusFilter]);

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedRegistrations);
    if (ids.length === 0) return;

    try {
      const res = await fetch(`/api/admin/seminars/${seminarId}/registrations/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      if (res.ok) {
        // Update local state
        setRegistrations(prev => prev.map(r => 
          ids.includes(r.id) ? { ...r, status: action } : r
        ));
        setSelectedRegistrations(new Set());
        setBulkActionOpen(false);
      }
    } catch (e) { console.error("Error performing bulk action"); }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Education', 'Status', 'Call Status', 'Applied Date'];
    const csvData = filteredData.map(reg => [
      reg.fullName,
      reg.email,
      reg.phone,
      reg.education,
      reg.status,
      reg.callStatus || 'Not Called',
      new Date(reg.createdAt).toLocaleDateString()
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seminar-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-12 font-sans no-underline selection:bg-violet-100">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-white via-violet-50/30 to-white border-b border-slate-100/80 sticky top-0 z-[40] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-3 hover:bg-violet-100 rounded-2xl transition-all duration-300 group">
                <ArrowLeft className="w-5 h-5 text-violet-600 group-hover:text-violet-700 transition-colors" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg shadow-violet-200">
                    <LayoutGrid className="w-5 h-5 text-white" />
                  </div>
                  {seminar?.title || "Seminar Applications"}
                </h1>
                <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {filteredData.length} Applications Received
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-violet-200 shadow-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'table' ? 'bg-violet-600 text-white' : 'text-violet-600 hover:bg-violet-50'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'cards' ? 'bg-violet-600 text-white' : 'text-violet-600 hover:bg-violet-50'}`}
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
              <Button 
                onClick={exportToCSV}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl px-6 font-bold shadow-xl shadow-emerald-200/50 gap-2 h-11 transition-all duration-300 hover:scale-105 active:scale-95 border-none outline-none"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>
          
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "New Applicants", count: registrations.filter(r => r.status === 'NEW_APPLICANT').length, color: "blue", icon: Sparkles },
              { label: "First Time", count: registrations.filter(r => r.status === 'FIRST_TIME_APPLIED').length, color: "violet", icon: Star },
              { label: "Called", count: registrations.filter(r => r.status === 'CALLED').length, color: "cyan", icon: PhoneCall },
              { label: "Confirmed", count: registrations.filter(r => r.status === 'CONFIRMED').length, color: "emerald", icon: CheckCircle },
              { label: "Waiting Next", count: registrations.filter(r => r.status === 'WAITING_NEXT_SEMINAR').length, color: "amber", icon: Clock },
              { label: "Rejected", count: registrations.filter(r => r.status === 'REJECTED').length, color: "rose", icon: XCircle },
              { label: "Cancelled", count: registrations.filter(r => r.status === 'CANCELLED').length, color: "slate", icon: Timer },
              { label: "Next Confirmed", count: registrations.filter(r => r.status === 'NEXT_SEMINAR_CONFIRMED').length, color: "purple", icon: Trophy },
            ].slice(0, 4).map((stat, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-800 mt-1 group-hover:scale-110 transition-transform">{stat.count}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { status: 'all', label: 'All Applications', color: 'slate' },
              { status: 'NEW_APPLICANT,FIRST_TIME_APPLIED', label: '🌟 New Applicants', color: 'blue' },
              { status: 'CALLED', label: '📞 Called', color: 'cyan' },
              { status: 'CONFIRMED,NEXT_SEMINAR_CONFIRMED', label: '✓ Confirmed', color: 'emerald' },
              { status: 'WAITING_NEXT_SEMINAR', label: '⏰ Waiting Next', color: 'amber' },
              { status: 'REJECTED,CANCELLED', label: '✗ Rejected/Cancelled', color: 'rose' },
            ].map((filter, index) => (
              <button
                key={index}
                onClick={() => {
                  if (filter.status === 'all') {
                    setStatusFilter('all');
                  } else {
                    setStatusFilter(filter.status);
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-black border-2 transition-all duration-300 hover:scale-105 ${
                  (filter.status === 'all' && statusFilter === 'all') || 
                  (filter.status !== 'all' && statusFilter === filter.status)
                    ? `bg-${filter.color}-600 text-white border-${filter.color}-600 shadow-lg`
                    : `bg-white text-${filter.color}-600 border-${filter.color}-300 hover:bg-${filter.color}-50`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {/* Enhanced Table Card */}
        <div className="bg-gradient-to-br from-white via-violet-50/20 to-white rounded-[40px] border border-slate-100/80 shadow-2xl shadow-slate-200/60 overflow-hidden backdrop-blur-xl">
          {/* Enhanced Filter Section */}
          <div className="p-8 border-b border-slate-100/60 bg-gradient-to-r from-violet-50/30 to-transparent">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                <Input 
                  placeholder="Search by name, phone, or email..." 
                  className="pl-12 h-14 bg-white/80 backdrop-blur-sm border-violet-200 rounded-2xl focus:ring-2 focus:ring-violet-500/30 font-medium text-slate-700 placeholder-violet-400 shadow-lg shadow-violet-100/50 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-violet-200 shadow-lg">
                  <FilterIcon className="w-4 h-4 text-violet-500" />
                  <select 
                    className="bg-transparent border-none outline-none text-sm font-bold text-violet-700 cursor-pointer pr-4 py-1"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">🔍 All Status</option>
                    <option value="NEW_APPLICANT,FIRST_TIME_APPLIED">🌟 New Applicants</option>
                    <option value="CALLED">📞 Called</option>
                    <option value="CONFIRMED,NEXT_SEMINAR_CONFIRMED">✓ Confirmed</option>
                    <option value="WAITING_NEXT_SEMINAR">⏰ Waiting Next</option>
                    <option value="REJECTED,CANCELLED">✗ Rejected/Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-violet-200 shadow-lg">
                  <PhoneCall className="w-4 h-4 text-violet-500" />
                  <select 
                    className="bg-transparent border-none outline-none text-sm font-bold text-violet-700 cursor-pointer pr-4 py-1"
                    value={callStatusFilter}
                    onChange={(e) => setCallStatusFilter(e.target.value)}
                  >
                    <option value="all">📞 All Call Status</option>
                    <option value="NOT_CALLED">📵 Not Called</option>
                    <option value="SCHEDULED">📅 Scheduled</option>
                    <option value="COMPLETED">✅ Completed</option>
                    <option value="NO_ANSWER">🔕 No Answer</option>
                    <option value="CALLBACK_REQUESTED">🔄 Callback</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedRegistrations.size > 0 && (
              <div className="mt-4 flex items-center justify-between p-4 bg-violet-50 rounded-2xl border border-violet-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-violet-700">
                    {selectedRegistrations.size} {selectedRegistrations.size === 1 ? 'applicant' : 'applicants'} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleBulkAction('CONFIRMED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold h-8"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" /> Confirm Selected
                  </Button>
                  <Button
                    onClick={() => handleBulkAction('REJECTED')}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold h-8"
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Reject Selected
                  </Button>
                  <Button
                    onClick={() => setSelectedRegistrations(new Set())}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold h-8"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Table */}
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 uppercase tracking-widest border-b border-violet-100">
                  <th className="px-6 py-4 font-black">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRegistrations(new Set(filteredData.map(r => r.id)));
                        } else {
                          setSelectedRegistrations(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 font-black">Applicant Details</th>
                  <th className="px-6 py-4 font-black">Education</th>
                  <th className="px-6 py-4 font-black">Applied Date</th>
                  <th className="px-6 py-4 font-black">Status</th>
                  <th className="px-6 py-4 font-black">Call Status</th>
                  <th className="px-6 py-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50/80">
                {filteredData.map((reg, index) => (
                  <tr key={reg.id} className="group hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-indigo-50/30 transition-all duration-300 hover:scale-[1.01]">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedRegistrations.has(reg.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRegistrations);
                          if (e.target.checked) {
                            newSelected.add(reg.id);
                          } else {
                            newSelected.delete(reg.id);
                          }
                          setSelectedRegistrations(newSelected);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-violet-200/60 group-hover:scale-110 transition-transform duration-300">
                          {reg.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm group-hover:text-violet-600 transition-colors duration-300">{reg.fullName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {reg.phone}
                            </p>
                            {reg.hasWhatsApp && (
                              <WhatsApp className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {reg.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-violet-500" />
                        <p className="text-sm font-bold text-slate-600">{reg.education}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <p className="text-sm font-black text-slate-500">
                          {new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative" ref={statusDropdownOpen === reg.id ? dropdownRef : null}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusDropdownOpen(statusDropdownOpen === reg.id ? null : reg.id);
                          }}
                          className={`h-10 px-4 rounded-xl text-[10px] font-black border transition-all duration-300 flex items-center gap-2 outline-none no-underline hover:scale-105 active:scale-95 shadow-lg ${getStatusStyle(reg.status)}`}
                        >
                          {getStatusIcon(reg.status)}
                          <span className="truncate max-w-[100px]">{getStatusLabel(reg.status)}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 flex-shrink-0 ${statusDropdownOpen === reg.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {statusDropdownOpen === reg.id && (
                          <div className="absolute top-full left-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-violet-100 rounded-2xl shadow-2xl z-[100] py-3 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="px-3 py-2 border-b border-violet-100">
                              <p className="text-[10px] font-black text-violet-600 uppercase tracking-wider">Update Status</p>
                            </div>
                            {[
                              { status: 'NEW_APPLICANT', label: '🌟 New Applicant', desc: 'Just applied' },
                              { status: 'FIRST_TIME_APPLIED', label: '⭐ First Time', desc: 'First seminar application' },
                              { status: 'CALLED', label: '📞 Called', desc: 'Phone contact made' },
                              { status: 'CONFIRMED', label: '✓ Confirmed', desc: 'Confirmed for current seminar' },
                              { status: 'WAITING_NEXT_SEMINAR', label: '⏰ Waiting Next', desc: 'Waiting for next seminar' },
                              { status: 'REJECTED', label: '✗ Rejected', desc: 'Application rejected' },
                              { status: 'CANCELLED', label: '⏸️ Cancelled', desc: 'Cancelled by applicant' },
                              { status: 'NEXT_SEMINAR_CONFIRMED', label: '🏆 Next Confirmed', desc: 'Confirmed for next seminar' },
                            ].map((option) => (
                              <button
                                key={option.status}
                                onClick={() => updateStatus(reg.id, option.status)}
                                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 transition-all duration-200 border-none outline-none no-underline group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${getStatusStyle(option.status).split(' ')[0]}`}></div>
                                  <div className="flex-1">
                                    <p className="text-[11px] font-bold text-slate-700">{option.label}</p>
                                    <p className="text-[9px] text-slate-400">{option.desc}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative" ref={actionDropdownOpen === reg.id ? dropdownRef : null}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionDropdownOpen(actionDropdownOpen === reg.id ? null : reg.id);
                          }}
                          className={`h-10 px-4 rounded-xl text-[10px] font-black border transition-all duration-300 flex items-center gap-2 outline-none no-underline hover:scale-105 active:scale-95 shadow-lg ${getCallStatusStyle(reg.callStatus)}`}
                        >
                          {getCallStatusIcon(reg.callStatus)}
                          <span className="truncate max-w-[100px]">{getCallStatusLabel(reg.callStatus)}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 flex-shrink-0 ${actionDropdownOpen === reg.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {actionDropdownOpen === reg.id && (
                          <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 backdrop-blur-xl border border-violet-100 rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="px-3 py-2 border-b border-violet-100">
                              <p className="text-[9px] font-black text-violet-600 uppercase tracking-wider">Call Status</p>
                            </div>
                            {[
                              { status: 'NOT_CALLED', label: '📵 Not Called', desc: 'No call made yet' },
                              { status: 'SCHEDULED', label: '📅 Scheduled', desc: 'Call scheduled' },
                              { status: 'COMPLETED', label: '✅ Completed', desc: 'Call completed successfully' },
                              { status: 'NO_ANSWER', label: '🔕 No Answer', desc: 'No answer received' },
                              { status: 'CALLBACK_REQUESTED', label: '🔄 Callback', desc: 'Callback requested' },
                              { status: 'NOT_INTERESTED', label: '❌ Not Interested', desc: 'Not interested anymore' },
                            ].map((option) => (
                              <button
                                key={option.status}
                                onClick={() => updateCallStatus(reg.id, option.status)}
                                className="w-full px-3 py-2 text-left hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 transition-all duration-200 border-none outline-none no-underline group"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getCallStatusStyle(option.status).split(' ')[0]}`}></div>
                                  <div className="flex-1">
                                    <p className="text-[10px] font-bold text-slate-700">{option.label}</p>
                                    <p className="text-[8px] text-slate-400">{option.desc}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => setSelectedRegistration(reg)} 
                          className="group relative p-2.5 bg-gradient-to-br from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 text-violet-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-violet-300/40 border border-violet-200/50 hover:border-violet-300/70 lg:p-2 md:p-1.5 sm:p-1"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400/0 to-indigo-400/0 group-hover:from-violet-400/10 group-hover:to-indigo-400/10 transition-all duration-300"></div>
                          <Eye className="w-4 h-4 lg:w-4 lg:h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3 relative z-10" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        </button>
                        <button className="group relative p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-300/40 border border-emerald-200/50 hover:border-emerald-300/70 lg:p-2 md:p-1.5 sm:p-1">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/10 group-hover:to-teal-400/10 transition-all duration-300"></div>
                          <MessageCircle className="w-4 h-4 lg:w-4 lg:h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3 relative z-10" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        </button>
                        <button className="group relative p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-300/40 border border-blue-200/50 hover:border-blue-300/70 lg:p-2 md:p-1.5 sm:p-1">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 transition-all duration-300"></div>
                          <PhoneCall className="w-4 h-4 lg:w-4 lg:h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3 relative z-10" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        </button>
                        <button 
                          onClick={() => {
                            setNotesModalOpen(true);
                            setSelectedRegistration(reg);
                          }}
                          className="group relative p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-600 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-amber-300/40 border border-amber-200/50 hover:border-amber-300/70 lg:p-2 md:p-1.5 sm:p-1"
                        >
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 transition-all duration-300"></div>
                          <Edit className="w-4 h-4 lg:w-4 lg:h-4 md:w-3.5 md:h-3.5 sm:w-3 sm:h-3 relative z-10" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Detail View Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-violet-900/80 to-indigo-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-violet-100/50">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-white/30">
                    {selectedRegistration.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{selectedRegistration.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border-2 border-white/30 ${getStatusStyle(selectedRegistration.status)}`}>
                        {getStatusLabel(selectedRegistration.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border-2 border-white/30 ${getCallStatusStyle(selectedRegistration.callStatus)}`}>
                        {getCallStatusLabel(selectedRegistration.callStatus)}
                      </span>
                      {selectedRegistration.hasWhatsApp && (
                        <div className="p-1 bg-green-500/20 rounded-full border border-green-400/30">
                          <WhatsApp className="w-3 h-3 text-green-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white/80 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        {new Date(selectedRegistration.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedRegistration(null)} className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-5 rounded-2xl border border-violet-100">
                  <h3 className="text-lg font-black text-violet-800 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-violet-600" />
                      <div>
                        <p className="text-xs font-black text-violet-500 uppercase tracking-wider">Phone</p>
                        <p className="text-sm font-black text-slate-800">{selectedRegistration.phone}</p>
                        {selectedRegistration.hasWhatsApp && (
                          <div className="flex items-center gap-1 mt-1">
                            <WhatsApp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 font-bold">WhatsApp Available</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-violet-600" />
                      <div>
                        <p className="text-xs font-black text-violet-500 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-black text-slate-800">{selectedRegistration.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reason for Joining */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                  <h3 className="text-base font-black text-emerald-800 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Motivation for Joining
                  </h3>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic bg-white/60 p-3 rounded-xl border border-emerald-200">
                    "{selectedRegistration.whyJoin}"
                  </p>
                </div>
                
                {/* Education & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">Education</h4>
                      </div>
                      <p className="text-sm font-black text-slate-800">{selectedRegistration.education}</p>
                   </div>
                   <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Experience</h4>
                      </div>
                      <p className="text-sm font-black text-slate-800">{selectedRegistration.experience || "Fresh Candidate"}</p>
                   </div>
                </div>
                
                {/* Notes Section */}
                {selectedRegistration.notes && (
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-2xl border border-slate-100">
                    <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h3>
                    <p className="text-sm font-bold text-slate-700 bg-white/60 p-3 rounded-xl border border-slate-200">
                      {selectedRegistration.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => setSelectedRegistration(null)} 
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-black hover:to-slate-800 transition-all duration-300 font-black text-xs tracking-widest uppercase shadow-lg border-none outline-none"
                >
                  Close
                </Button>
                <Button className="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 font-black text-xs tracking-widest uppercase shadow-lg border-none outline-none">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contact
                </Button>
                <Button className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-black text-xs tracking-widest uppercase shadow-lg border-none outline-none">
                  <PhoneCall className="w-4 h-4 mr-1" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {notesModalOpen && selectedRegistration && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-violet-900/80 to-indigo-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-violet-100/50">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Notes
                </h2>
                <button onClick={() => setNotesModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <p className="text-xs font-black text-slate-700 mb-2">Applicant: {selectedRegistration.fullName}</p>
                <textarea
                  className="w-full h-24 p-3 border-2 border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 font-medium text-slate-700 placeholder-violet-400 bg-white/80 backdrop-blur-sm resize-none text-sm"
                  placeholder="Add notes about this applicant..."
                  defaultValue={selectedRegistration.notes || ''}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setNotesModalOpen(false)} 
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-black hover:to-slate-800 transition-all duration-300 font-black text-xs tracking-widest uppercase shadow-lg border-none outline-none"
                >
                  Cancel
                </Button>
                <Button className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-black text-xs tracking-widest uppercase shadow-lg border-none outline-none">
                  <Save className="w-3 h-3 mr-1" />
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}

// Add Save icon component
const Save = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
  </svg>
);