"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Link,
  Plus,
  Eye,
  Edit,
  Trash2,
  Share,
  Copy,
  ExternalLink,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Sparkles,
  Award,
  Star,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface Seminar {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentRegistrations: number;
  registrationUrl: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: string;
  imageUrl?: string;
}

export default function SeminarsPage() {
  const router = useRouter();
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [filteredSeminars, setFilteredSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    try {
      const response = await fetch('/api/admin/seminars');
      const data = await response.json();
      if (data.success) {
        setSeminars(data.data);
        setFilteredSeminars(data.data);
      }
    } catch (error) {
      console.error('Error fetching seminars:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = seminars;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(seminar =>
        seminar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seminar.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(seminar => seminar.status === statusFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'registrations':
          return b.currentRegistrations - a.currentRegistrations;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredSeminars(filtered);
  }, [seminars, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyRegistrationUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setToastMessage('Registration URL copied to clipboard! 🎉');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const setEditingSeminar = (seminar: Seminar) => {
    // Navigate to edit page with seminar ID
    router.push(`/admin/seminars/${seminar.id}/edit`);
  };

  const handleDeleteSeminar = async (seminarId: string) => {
    if (confirm('Are you sure you want to delete this seminar? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/seminars/${seminarId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setToastMessage('Seminar deleted successfully! 🗑️');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          // Refresh seminars list
          fetchSeminars();
        } else {
          setToastMessage('Failed to delete seminar! ❌');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      } catch (error) {
        setToastMessage('Error deleting seminar! ⚠️');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const getRegistrationStats = (seminar: Seminar) => {
    const percentage = (seminar.currentRegistrations / seminar.maxParticipants) * 100;
    return {
      percentage: percentage.toFixed(1),
      isFull: seminar.currentRegistrations >= seminar.maxParticipants,
      available: seminar.maxParticipants - seminar.currentRegistrations
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header with glassmorphism */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent leading-tight">
                  Seminar Management
                </h1>
                <p className="text-purple-200 text-sm sm:text-base lg:text-lg">Manage seminars and track registrations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={() => router.push('/admin/seminars/create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 lg:gap-3 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="hidden sm:inline">Create Seminar</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Professional Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 lg:mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300" />
              <Input
                type="text"
                placeholder="Search seminars by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-purple-300 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12 px-4 min-w-[120px]"
              >
                <option value="all" className="bg-purple-900">All Status</option>
                <option value="upcoming" className="bg-purple-900">Upcoming</option>
                <option value="ongoing" className="bg-purple-900">Ongoing</option>
                <option value="completed" className="bg-purple-900">Completed</option>
                <option value="cancelled" className="bg-purple-900">Cancelled</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white focus:border-purple-400 focus:ring-purple-400/50 rounded-xl shadow-lg transition-all duration-300 h-12 px-4 min-w-[120px]"
              >
                <option value="date" className="bg-purple-900">Sort by Date</option>
                <option value="title" className="bg-purple-900">Sort by Title</option>
                <option value="registrations" className="bg-purple-900">Sort by Registrations</option>
                <option value="status" className="bg-purple-900">Sort by Status</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== 'all') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20"
            >
              {searchTerm && (
                <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:text-purple-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
              {statusFilter !== 'all' && (
                <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="hover:text-purple-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-200 text-xs sm:text-sm font-medium">Total Seminars</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{seminars.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-200 text-xs sm:text-sm font-medium">Upcoming</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {seminars.filter(s => s.status === 'upcoming').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-200 text-xs sm:text-sm font-medium">Total Registrations</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {seminars.reduce((sum, seminar) => sum + seminar.currentRegistrations, 0)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-200 text-xs sm:text-sm font-medium">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {seminars.filter(s => s.status === 'completed').length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Results Count */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Seminars
          </h2>
          <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-sm">
            {filteredSeminars.length} {filteredSeminars.length === 1 ? 'seminar' : 'seminars'}
            {filteredSeminars.length !== seminars.length && ` of ${seminars.length}`}
          </div>
        </div>
        {(searchTerm || statusFilter !== 'all') && (
          <Button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 text-sm"
          >
            Clear Filters
          </Button>
        )}
      </motion.div>

      {/* Seminars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {filteredSeminars.map((seminar, index) => {
            const stats = getRegistrationStats(seminar);

            return (
              <motion.div
                key={seminar.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-3 sm:pb-4 border-b border-white/20">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-white line-clamp-2 mb-2 sm:mb-3">{seminar.title}</h3>
                    <Badge className={`bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${getStatusColor(seminar.status)}`}>
                      {seminar.status}
                    </Badge>
                  </div>
                  {seminar.imageUrl && (
                    <img 
                      src={seminar.imageUrl} 
                      alt={seminar.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover ml-2 sm:ml-4 border-2 border-white/20 shadow-xl flex-shrink-0"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <p className="text-purple-200 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">{seminar.description}</p>
                
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 sm:gap-3 text-purple-300">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{new Date(seminar.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-purple-300">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{seminar.time}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-purple-300">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                    </div>
                    <span className="font-medium text-xs sm:text-sm truncate">{seminar.location}</span>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-purple-300 font-medium">Registrations</span>
                    <span className="text-white font-bold">
                      {seminar.currentRegistrations}/{seminar.maxParticipants}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 sm:h-3 backdrop-blur-sm">
                    <div 
                      className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                        stats.isFull ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        parseFloat(stats.percentage) > 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-600'
                      }`}
                      style={{ width: `${Math.min(parseFloat(stats.percentage), 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-purple-300 font-medium">
                    {stats.available} spots available
                  </p>
                </div>

                {/* Registration URL */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-purple-300">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Link className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <span className="truncate flex-1 font-mono text-xs">{seminar.registrationUrl}</span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => copyRegistrationUrl(seminar.registrationUrl)}
                      className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Copy URL</span>
                      <span className="sm:hidden">Copy</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(seminar.registrationUrl, '_blank')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Open</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/20 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setEditingSeminar(seminar)}
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(`/admin/seminars/${seminar.id}/registrations`, '_blank')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Registrations</span>
                    <span className="sm:hidden">Users</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(seminar.registrationUrl, '_blank')}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteSeminar(seminar.id)}
                    className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 hover:bg-red-500/30 font-medium px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty States */}
      <AnimatePresence>
        {seminars.length === 0 ? (
          // No seminars at all
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center border border-white/20"
          >
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-400" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">No seminars yet</h3>
            <p className="text-purple-300 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">Create your first seminar to get started</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => router.push('/admin/seminars/create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 sm:px-8 py-2 sm:py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="hidden sm:inline">Create Seminar</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </motion.div>
          </motion.div>
        ) : filteredSeminars.length === 0 ? (
          // No results for search/filter
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center border border-white/20"
          >
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-400" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">No seminars found</h3>
            <p className="text-purple-300 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
              {searchTerm ? `No seminars match "${searchTerm}"` : 'No seminars match the selected filters'}
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold px-6 sm:px-8 py-2 sm:py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                Clear Filters
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>

      {/* Beautiful Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 backdrop-blur-xl border border-white/20 max-w-sm sm:max-w-md"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 1,
                  repeatType: "reverse"
                }}
                className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm sm:text-lg">Success!</p>
                <p className="text-green-100 text-xs sm:text-sm line-clamp-2">{toastMessage}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
